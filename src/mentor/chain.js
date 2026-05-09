import { ChatGroq } from "@langchain/groq";
import { ChatAnthropic } from "@langchain/anthropic";
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

function createGroqModel() {
  return new ChatGroq({
    apiKey: requireEnv("GROQ_API_KEY"),
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    maxTokens: 400,
  }).bindTools(ALL_TOOLS);
}

function createAnthropicModel() {
  return new ChatAnthropic({
    apiKey: requireEnv("ANTHROPIC_API_KEY"),
    model: "claude-sonnet-4-20250514",
    temperature: 0.85,
    maxTokens: 400,
  }).bindTools(ALL_TOOLS);
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

async function runProvider(provider, messages) {
  const model = provider === "groq" ? createGroqModel() : createAnthropicModel();
  const result = await runWithTools(model, messages);
  if (!result.reply) {
    const err = new Error(`${provider} returned an empty reply`);
    err.usedSearch = result.usedSearch;
    throw err;
  }
  return {
    ...result,
    provider,
  };
}

export async function mentorChat({ userId, userMessage, trackerData = {}, daysLeft }) {
  if (!userId) throw new Error("userId is required");
  if (!userMessage?.trim()) throw new Error("userMessage is required");

  const longTermMemories = await retrieveMemories(userId, userMessage, 4);
  const recentChat = await getRecentChat(userId, 20);
  const systemPrompt = buildSystemPrompt({
    trackerData,
    longTermMemories,
    daysLeft,
  });
  const messages = [
    new SystemMessage(systemPrompt),
    ...toLangChainHistory(recentChat),
    new HumanMessage(userMessage),
  ];

  let result;
  let groqUsedSearch = false;
  try {
    result = await runProvider("groq", messages);
  } catch (err) {
    groqUsedSearch = Boolean(err?.usedSearch);
    result = await runProvider("anthropic", messages);
    result.usedSearch = result.usedSearch || groqUsedSearch;
  }

  await appendChat(userId, "user", userMessage);
  await appendChat(userId, "assistant", result.reply);

  return {
    reply: result.reply,
    provider: result.provider,
    used_search: result.usedSearch,
  };
}
