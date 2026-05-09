import { ChatGroq } from "@langchain/groq";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { buildSystemPrompt } from "./prompt.js";
import { appendChat, getRecentChat, retrieveMemories } from "./memory.js";
import { ALL_TOOLS, searchTool } from "./tools.js";

const MAX_TOOL_HOPS = 3;

const groqKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(key => key?.trim());

const geminiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
  process.env.GEMINI_API_KEY_8,
].filter(k => k?.trim());

const KEY_COOLDOWN_MS = 60000;
const keyCooldowns = new Map();

const providerPool = [
  ...groqKeys.map(apiKey => ({ provider: "groq", apiKey, model: "llama-3.3-70b-versatile" })),
  ...geminiKeys.map(apiKey => ({ provider: "gemini", apiKey, model: "gemini-2.5-flash" })),
  ...geminiKeys.map(apiKey => ({ provider: "gemini", apiKey, model: "gemini-2.5-flash-8b" })),
  ...geminiKeys.map(apiKey => ({ provider: "gemini", apiKey, model: "gemini-2.0-flash" })),
  { provider: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-sonnet-4-5" },
].filter(slot => slot.apiKey?.trim());

let poolIndex = 0;

function getNextAvailableSlot() {
  const now = Date.now();
  const total = providerPool.length;
  for (let i = 0; i < total; i++) {
    const idx = (poolIndex + i) % total;
    const slot = providerPool[idx];
    if (now > (keyCooldowns.get(slot.apiKey + slot.model) || 0)) {
      poolIndex = (idx + 1) % total;
      return { slot, idx };
    }
  }
  return null;
}

function markSlotCooldown(slot) {
  keyCooldowns.set(slot.apiKey + slot.model, Date.now() + KEY_COOLDOWN_MS);
  console.warn(`Cooldown: ${slot.provider} ${slot.model}`);
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
      .map(block => {
        if (typeof block === "string") return block;
        if (typeof block?.text === "string") return block.text;
        if (typeof block?.content === "string") return block.content;
        return "";
      })
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
  let response;

  for (let hop = 0; hop <= MAX_TOOL_HOPS; hop += 1) {
    response = await model.invoke(messages);
    const toolCalls = response.tool_calls || [];

    if (!toolCalls.length) {
      return {
        reply: normalizeContent(response.content),
        usedSearch,
      };
    }

    if (hop === MAX_TOOL_HOPS) {
      return {
        reply: normalizeContent(response.content),
        usedSearch,
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
      const result = await runWithTools(bound, messages);

      if (!result.reply) throw new Error("Empty reply");

      console.log(`Response from ${slot.provider} ${slot.model}`);
      return { ...result, provider: slot.provider };

    } catch (err) {
      const msg = err?.message || "";
      if (
        msg.includes("429") ||
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("quota")
      ) {
        markSlotCooldown(slot);
        console.warn(`Slot ${slot.provider}/${slot.model} rate limited, trying next`);
        continue;
      }
      console.warn(`Slot ${slot.provider}/${slot.model} error:`, msg.slice(0, 100));
      continue;
    }
  }

  throw new Error("All 28 provider slots failed");
}

export async function mentorChat({ userId, userMessage, trackerData = {}, daysLeft, disableTools = false }) {
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

    const systemPrompt = buildSystemPrompt({
      trackerData,
      longTermMemories,
      daysLeft,
    });

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

    return {
      reply,
      provider: result.provider,
      used_search: result.usedSearch,
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
