import { ChatGroq } from "@langchain/groq";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { buildSystemPrompt, buildSystemPromptForIntent } from "./prompt.js";
import { appendChat, getRecentChat, retrieveMemories } from "./memory.js";
import { ALL_TOOLS, searchTool } from "./tools.js";

const MAX_TOOL_HOPS = 3;
const PROVIDER_TIMEOUT_MS = 35000;

const groqKeys = [
  { label: "groq-main-1", apiKey: process.env.GROQ_API_KEY },
  { label: "groq-main-2", apiKey: process.env.GROQ_API_KEY_2 },
  { label: "groq-main-3", apiKey: process.env.GROQ_API_KEY_3 },
  { label: "groq-main-4", apiKey: process.env.GROQ_API_KEY_4 },
].filter(slot => slot.apiKey?.trim());
// GROQ_SMALL_TASK_KEY is intentionally excluded from mentor/chat rotation.

const geminiKeys = [
  { label: "gemini-main-1", apiKey: process.env.GEMINI_API_KEY_1 },
  { label: "gemini-main-2", apiKey: process.env.GEMINI_API_KEY_2 },
  { label: "gemini-main-3", apiKey: process.env.GEMINI_API_KEY_3 },
  { label: "gemini-main-4", apiKey: process.env.GEMINI_API_KEY_4 },
  { label: "gemini-main-5", apiKey: process.env.GEMINI_API_KEY_5 },
  { label: "gemini-main-6", apiKey: process.env.GEMINI_API_KEY_6 },
  { label: "gemini-main-7", apiKey: process.env.GEMINI_API_KEY_7 },
  { label: "gemini-main-8", apiKey: process.env.GEMINI_API_KEY_8 },
].filter(slot => slot.apiKey?.trim());

const KEY_COOLDOWN_MS = 60000;
const keyCooldowns = new Map();

const providerPool = [
  ...groqKeys.map(slot => ({ provider: "groq", label: slot.label, apiKey: slot.apiKey, model: "llama-3.3-70b-versatile" })),
  ...geminiKeys.map(slot => ({ provider: "gemini", label: slot.label, apiKey: slot.apiKey, model: "gemini-2.5-flash-lite" })),
  ...geminiKeys.map(slot => ({ provider: "gemini", label: slot.label, apiKey: slot.apiKey, model: "gemini-2.5-flash" })),
  ...geminiKeys.map(slot => ({ provider: "gemini", label: slot.label, apiKey: slot.apiKey, model: "gemini-2.0-flash" })),
  { provider: "anthropic", label: "anthropic-main-1", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-sonnet-4-6" },
].filter(slot => slot.apiKey?.trim());

let poolIndex = 0;

function getNextAvailableSlot() {
  const now = Date.now();
  const total = providerPool.length;
  for (let i = 0; i < total; i++) {
    const idx = (poolIndex + i) % total;
    const slot = providerPool[idx];
    if (now > (keyCooldowns.get(`${slot.label}:${slot.model}`) || 0)) {
      poolIndex = (idx + 1) % total;
      return { slot, idx };
    }
  }
  return null;
}

function markSlotCooldown(slot) {
  keyCooldowns.set(`${slot.label}:${slot.model}`, Date.now() + KEY_COOLDOWN_MS);
  console.warn(`Cooldown: ${slot.label} ${slot.model}`);
}

async function withTimeout(promise, label, timeoutMs = PROVIDER_TIMEOUT_MS) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timeout`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout);
  }
}

function toLangChainHistory(messages = []) {
  return messages
    .map(message => {
      if (message.role === "user" || message.role === "human") {
        return new HumanMessage(message.content || "");
      }
      if (message.role === "assistant" || message.role === "ai") {
        return new AIMessage(message.content || "");
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeContent(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .filter(block => {
        if (typeof block === "string") return true;
        const type = block?.type;
        // Discard tool_use, tool_result, and any non-text block types
        return type === "text" || type === undefined;
      })
      .map(block => {
        if (typeof block === "string") return block;
        if (typeof block?.text === "string") return block.text;
        return "";
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  return "";
}

function cleanReply(text) {
  if (!text) return text;
  const leakPatterns = [
    /I('ll| will| need to| am going to| don't need to).{0,80}search[^.]*\.\s*/gi,
    /I('m going to| will) (find|get|pull|look up|search for)[^.]*\.\s*/gi,
    /Let me (search|find|look|get|pull)[^.]*\.\s*/gi,
    /I need (a|to find|to search|to get)[^.]{0,120}(story|insight|example|real|search)[^.]*\.\s*/gi,
    /(Searching|Looking up|Finding|Pulling) for[^.]*\.\s*/gi,
  ];
  let cleaned = text;
  for (const pattern of leakPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.trim();
}

function toolOutputToString(output) {
  if (typeof output === "string") return output;
  try {
    return JSON.stringify(output);
  } catch {
    return String(output);
  }
}

async function runWithTools(model, baseMessages) {
  const messages = [...baseMessages];
  let usedSearch = false;
  let assessmentEvents = [];
  let response;

  for (let hop = 0; hop <= MAX_TOOL_HOPS; hop += 1) {
    response = await model.invoke(messages);
    const toolCalls = response.tool_calls || [];

    if (!toolCalls.length) {
      return {
        reply: normalizeContent(response.content),
        usedSearch,
        assessmentEvents,
        usage: response.usage_metadata || null,
      };
    }

    if (hop === MAX_TOOL_HOPS) {
      return {
        reply: normalizeContent(response.content),
        usedSearch,
        assessmentEvents,
        usage: response.usage_metadata || null,
      };
    }

    messages.push(response);

    for (const call of toolCalls) {
      const selectedTool = ALL_TOOLS.find(tool => tool.name === call.name);
      if (selectedTool === searchTool || call.name === searchTool.name) {
        usedSearch = true;
      }

      let content;
      let status = "success";
      try {
        if (!selectedTool) throw new Error(`Unknown tool: ${call.name}`);
        content = toolOutputToString(await selectedTool.invoke(call.args || {}));
      } catch (err) {
        status = "error";
        console.error(`Tool ${call.name} failed:`, err?.message || err);
        content = err?.message || `Tool failed: ${call.name}`;
      }

      if (call.name === "catAssessmentTool" && call.args?.action === "check_answer") {
        try {
          const parsed = JSON.parse(content);
          assessmentEvents.push({
            section: call.args.section || "",
            question: call.args.question || "",
            options: call.args.options || [],
            correctAnswer: call.args.correctAnswer || "",
            userAnswer: call.args.userAnswer || "",
            explanation: call.args.explanation || "",
            isCorrect: parsed.isCorrect === true,
          });
        } catch { /* ignore parse errors */ }
      }

      messages.push(new ToolMessage({
        content,
        name: call.name,
        tool_call_id: call.id || `${call.name}-${hop}`,
        status,
      }));
    }
  }

  return {
    reply: normalizeContent(response?.content),
    usedSearch,
    assessmentEvents,
    usage: response?.usage_metadata || null,
  };
}

async function runWithPool(messages, withTools = true) {
  const total = providerPool.length;
  let attempts = 0;

  while (attempts < total) {
    const next = getNextAvailableSlot();
    if (!next) throw new Error("All provider slots exhausted");

    const { slot } = next;
    attempts++;

    try {
      let model;
      if (slot.provider === "groq") {
        model = new ChatGroq({
          apiKey: slot.apiKey,
          model: slot.model,
          temperature: 0.85,
          maxTokens: 400,
        });
      } else if (slot.provider === "gemini") {
        model = new ChatGoogleGenerativeAI({
          apiKey: slot.apiKey,
          model: slot.model,
          temperature: 0.85,
          maxOutputTokens: 400,
        });
      } else {
        model = new ChatAnthropic({
          apiKey: slot.apiKey,
          model: slot.model,
          temperature: 0.85,
          maxTokens: 400,
        });
      }

      const bound = withTools ? model.bindTools(ALL_TOOLS) : model;
      const result = await withTimeout(runWithTools(bound, messages), slot.label);

      if (!result.reply) throw new Error("Empty reply");

      const u = result.usage;
      console.log(`Response from ${slot.label} ${slot.model}${u ? ` | in=${u.input_tokens} out=${u.output_tokens} total=${u.total_tokens}` : ""}`);
      return { ...result, provider: slot.provider };

    } catch (err) {
      const msg = err?.message || "";
      if (
        msg.includes("429") ||
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("quota")
      ) {
        markSlotCooldown(slot);
        console.warn(`Slot ${slot.label}/${slot.model} rate limited, trying next`);
        continue;
      }
      if (msg.toLowerCase().includes("timeout")) markSlotCooldown(slot);
      console.warn(`Slot ${slot.label}/${slot.model} error:`, msg.slice(0, 100));
      continue;
    }
  }

  throw new Error(`All ${total} provider slots failed`);
}

function isSundayEveningIST() {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const weekday = parts.find(p => p.type === "weekday")?.value;
  const hour = Number(parts.find(p => p.type === "hour")?.value);
  return weekday === "Sun" && hour >= 18 && hour < 22;
}

async function classifyIntent(message) {
  const lower = message.toLowerCase().trim();

  // Fast keyword pre-check — avoids LLM call for obvious cases
  if (/^(hi|hello|hey|good morning|good evening|good afternoon|what.s up|sup|hii+|hlo)[\s!?.]*$/i.test(lower))
    return "general";
  if (/\b(assess|test me|quiz|weekly test|check my level|evaluate me|where do i stand|how am i doing on concepts)\b/.test(lower))
    return "assessment";
  if (/\b(interview|mock pi|mock interview|wat topic|personal interview|pi prep|iim interview)\b/.test(lower))
    return "interview";

  // LLM classifier for everything else
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!groqKey) return "general";

  let timeout;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 10,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `Classify the student message into exactly one word:
motivation — asking why CAT, IIM worth it, inspire me, doubt about CAT being worth it
emotional — depressed, tired, low, giving up, feel like quitting, can't do this
assessment — assess me, test me, quiz, check my level, where do I stand
interview — PI, WAT, mock interview, personal interview, IIM interview prep
profile — my calibre, my chances, IIM call, cutoff, profile strength, am I good enough
tracker — how am I doing, my progress, effort score, consistency, on track
general — everything else including greetings, concept doubts, study questions

Return ONLY the one word. No explanation.`
          },
          { role: "user", content: message.slice(0, 300) }
        ],
      }),
    });
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim().toLowerCase() || "general";
    const valid = ["motivation","emotional","assessment","interview","profile","tracker","general"];
    return valid.includes(raw) ? raw : "general";
  } catch {
    return "general";
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function mentorChat({ userId, userMessage, trackerData = {}, daysLeft, disableTools = false, assessmentAttendance = null }) {
  try {
    if (!userId) throw new Error("userId is required");
    if (!userMessage?.trim()) throw new Error("userMessage is required");

    let longTermMemories = [];
    try {
      longTermMemories = await retrieveMemories(userId, userMessage, 4);
    } catch (err) {
      console.warn("Memory retrieval skipped:", err?.message || err);
      longTermMemories = [];
    }

    let recentChat = [];
    try {
      recentChat = await getRecentChat(userId, 20);
    } catch (err) {
      console.warn("Recent chat load skipped:", err?.message || err);
      recentChat = [];
    }

    const sundayNote = isSundayEveningIST()
      ? "\n\nTODAY IS SUNDAY EVENING IST. You MUST initiate the weekly calibre assessment right now — do not wait for the student to ask. Open with exactly: \"Sunday. Weekly calibre check.\" Then immediately use catAssessmentTool to generate and ask the quant question first."
      : "";
    const intent = await classifyIntent(userMessage);
    const systemPrompt = buildSystemPromptForIntent({
      intent,
      trackerData: { ...trackerData, assessmentAttendance },
      longTermMemories,
      daysLeft,
    }) + sundayNote;
    console.log(`[chain] intent=${intent} sections assembled`);

    const MAX_RECENT = 6;
    const SUMMARIZE_THRESHOLD = 10;

    let messages;
    if (recentChat.length > SUMMARIZE_THRESHOLD) {
      const older = recentChat.slice(0, recentChat.length - MAX_RECENT);
      const recent = recentChat.slice(-MAX_RECENT);

      const summaryText = older.map(m =>
        `${m.role === 'user' ? 'Student' : 'Vikram'}: ${m.content}`
      ).join('\n');

      const summaryMessage = new HumanMessage(
        `[Context from earlier in our conversation today]\n${summaryText}`
      );

      messages = [
        new SystemMessage(systemPrompt),
        summaryMessage,
        ...toLangChainHistory(recent),
        new HumanMessage(userMessage),
      ];
    } else {
      messages = [
        new SystemMessage(systemPrompt),
        ...toLangChainHistory(recentChat),
        new HumanMessage(userMessage),
      ];
    }

    const result = await runWithPool(messages, !disableTools);

    const reply = cleanReply(result.reply);

    try {
      await appendChat(userId, 'user', userMessage);
      await appendChat(userId, 'assistant', reply);
    } catch (err) {
      console.warn('appendChat failed:', err?.message || err);
    }

    const dayNum = daysLeft ? Math.max(1, 200 - daysLeft) : 1;
    const completedAssessment = (result.assessmentEvents?.length >= 3)
      ? {
          week_number: Math.ceil(dayNum / 7),
          questions: result.assessmentEvents.map(e => ({
            section: e.section,
            question: e.question,
            options: e.options,
            correctAnswer: e.correctAnswer,
          })),
          answers: result.assessmentEvents.map(e => ({
            section: e.section,
            userAnswer: e.userAnswer,
            isCorrect: e.isCorrect,
          })),
          score: result.assessmentEvents.filter(e => e.isCorrect).length,
        }
      : null;

    return {
      reply,
      provider: result.provider,
      used_search: result.usedSearch,
      assessment_data: completedAssessment,
    };
  } catch (err) {
    console.error("mentorChat fallback response:", err?.message || err);
    return {
      reply: "I am here. The system stumbled, but the work does not stop. Send your question again, clean and specific.",
      provider: "none",
      used_search: false,
    };
  }
}
