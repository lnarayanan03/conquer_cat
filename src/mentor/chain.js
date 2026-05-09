import { ChatGroq } from "@langchain/groq";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { buildSystemPrompt } from "./prompt.js";
import { appendChat, getRecentChat, retrieveMemories } from "./memory.js";
import { ALL_TOOLS, searchTool } from "./tools.js";

const MAX_TOOL_HOPS = 3;

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

const groqKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(key => key?.trim());

let groqKeyIndex = 0;
const KEY_COOLDOWN_MS = 60000;
const keyCooldowns = new Map();

function getAvailableGroqKey() {
  const now = Date.now();
  for (let i = 0; i < groqKeys.length; i++) {
    const idx = (groqKeyIndex + i) % groqKeys.length;
    const key = groqKeys[idx];
    const cooldownUntil = keyCooldowns.get(key) || 0;
    if (now > cooldownUntil) {
      groqKeyIndex = (idx + 1) % groqKeys.length;
      return key;
    }
  }
  return null;
}

function markKeyCooldown(apiKey) {
  keyCooldowns.set(apiKey, Date.now() + KEY_COOLDOWN_MS);
  console.warn(`Groq key marked in cooldown for 60s`);
}

function createGroqModelWithKey(apiKey, withTools = true) {
  const model = new ChatGroq({
    apiKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    maxTokens: 400,
  });
  return withTools ? model.bindTools(ALL_TOOLS) : model;
}

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

let geminiKeyIndex = 0;

function getAvailableGeminiKey() {
  const now = Date.now();
  for (let i = 0; i < geminiKeys.length; i++) {
    const idx = (geminiKeyIndex + i) % geminiKeys.length;
    const key = geminiKeys[idx];
    if (now > (keyCooldowns.get(key) || 0)) {
      geminiKeyIndex = (idx + 1) % geminiKeys.length;
      return key;
    }
  }
  return null;
}

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-8b",
  "gemini-2.0-flash",
];

function createGeminiModel(modelName, withTools = true) {
  const apiKey = getAvailableGeminiKey();
  if (!apiKey) throw new Error("ALL_GEMINI_KEYS_COOLDOWN");
  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: modelName,
    temperature: 0.85,
    maxOutputTokens: 400,
  });
  return withTools ? model.bindTools(ALL_TOOLS) : model;
}

function createAnthropicModel(withTools = true) {
  const model = new ChatAnthropic({
    apiKey: requireEnv("ANTHROPIC_API_KEY"),
    model: "claude-sonnet-4-5",
    temperature: 0.85,
    maxTokens: 400,
  });
  return withTools ? model.bindTools(ALL_TOOLS) : model;
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

async function runProvider(provider, messages, withTools = true) {
  if (provider === "groq") {
    if (groqKeys.length === 0) throw new Error("No Groq API keys configured");

    const currentKey = getAvailableGroqKey();
    if (!currentKey) throw new Error("ALL_GROQ_KEYS_COOLDOWN");

    try {
      const result = await runWithTools(createGroqModelWithKey(currentKey, withTools), messages);
      if (!result.reply) throw new Error("groq returned empty reply");
      return { ...result, provider: "groq" };
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
        markKeyCooldown(currentKey);
        const nextKey = getAvailableGroqKey();
        if (nextKey) {
          const result = await runWithTools(createGroqModelWithKey(nextKey, withTools), messages);
          if (!result.reply) throw new Error("groq returned empty reply on retry");
          return { ...result, provider: "groq" };
        }
        throw new Error("ALL_GROQ_KEYS_COOLDOWN");
      }
      throw err;
    }
  }

  if (provider === "gemini") {
    if (geminiKeys.length === 0) throw new Error("No Gemini API keys configured");
    let lastErr;
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = createGeminiModel(modelName, withTools);
        const result = await runWithTools(model, messages);
        if (!result.reply) throw new Error(`${modelName} returned empty`);
        console.log(`Gemini responded via ${modelName}`);
        return { ...result, provider: "gemini" };
      } catch (err) {
        console.warn(`Gemini ${modelName} failed:`, err.message);
        lastErr = err;
      }
    }
    throw lastErr;
  }

  const model = createAnthropicModel(withTools);
  const result = await runWithTools(model, messages);
  if (!result.reply) throw new Error("anthropic returned empty reply");
  return { ...result, provider: "anthropic" };
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

    let result;
    let failedSearch = false;
    try {
      result = await runProvider("groq", messages, !disableTools);
    } catch (groqErr) {
      failedSearch = failedSearch || Boolean(groqErr?.usedSearch);
      console.warn("Groq failed, trying Gemini:", groqErr.message);
      try {
        result = await runProvider("gemini", messages, !disableTools);
      } catch (geminiErr) {
        failedSearch = failedSearch || Boolean(geminiErr?.usedSearch);
        console.warn("Gemini failed, trying Anthropic:", geminiErr.message);
        result = await runProvider("anthropic", messages, !disableTools);
      }
    }
    if (failedSearch) result.usedSearch = result.usedSearch || failedSearch;

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
