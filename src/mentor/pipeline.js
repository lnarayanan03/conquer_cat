import cron from "node-cron";
import Redis from "ioredis";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { clearChat, getAllChatToday, storeDailyMemory } from "./memory.js";
import { getDepletedTopics } from "./questionBank.js";
import { ingestFromTavily } from "./ingest.js";

const CRON_SCHEDULE = "0 0 * * *";
const TIMEZONE = "Asia/Kolkata";
let scheduledTask;

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function createRedis() {
  return new Redis(requireEnv("REDIS_URL"), {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });
}

function createDistiller() {
  return new ChatGroq({
    apiKey: requireEnv("GROQ_API_KEY"),
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    maxTokens: 400,
  });
}

function todayIst() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function extractUserIdFromChatKey(key) {
  const parts = key.split(":");
  if (parts.length < 4 || parts[0] !== "mentor" || parts[1] !== "chat") return null;
  return parts.slice(2, -1).join(":");
}

async function getActiveUserIds() {
  const redis = createRedis();
  const userIds = new Set();

  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "mentor:chat:*", "COUNT", 100);
      cursor = nextCursor;
      for (const key of keys) {
        const userId = extractUserIdFromChatKey(key);
        if (userId) userIds.add(userId);
      }
    } while (cursor !== "0");
  } finally {
    redis.disconnect();
  }

  return [...userIds];
}

async function getTrackerData(supabase, userId, date) {
  if (!supabase) return {};

  const query = supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", date);

  const { data, error } = typeof query.maybeSingle === "function"
    ? await query.maybeSingle()
    : await query.single();

  if (error) {
    console.warn("Mentor distillation tracker lookup failed:", error.message || error);
    return {};
  }

  return data || {};
}

function normalizeContent(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map(block => {
        if (typeof block === "string") return block;
        if (typeof block?.text === "string") return block.text;
        return "";
      })
      .join("\n")
      .trim();
  }
  return "";
}

function parseJsonObject(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Distillation response did not contain JSON");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function ensureDistillationShape(payload, fallbackSummary) {
  const shaped = {
    effort_score: payload.effort_score ?? null,
    trajectory: payload.trajectory ?? "",
    quant_consistency: payload.quant_consistency ?? "",
    varc_problem: payload.varc_problem ?? "",
    lrdi_problem: payload.lrdi_problem ?? "",
    emotional_state: payload.emotional_state ?? "",
    mentor_assessment: payload.mentor_assessment ?? "",
    critical_event: payload.critical_event ?? "",
    student_pattern: payload.student_pattern ?? "",
    mentor_warning: payload.mentor_warning ?? "",
    raw_summary: payload.raw_summary || fallbackSummary,
  };

  if (!shaped.raw_summary) {
    shaped.raw_summary = JSON.stringify(shaped);
  }

  return shaped;
}

async function distillDailyMemory({ userId, date, chatMessages, trackerData }) {
  const model = createDistiller();
  const response = await model.invoke([
    new SystemMessage(`You distill one day of CONQUER mentor chat into long-term memory.
Return only valid JSON. Do not wrap it in markdown.
Do not store raw chat messages. Extract patterns and assessment only.
Required keys: effort_score, trajectory, quant_consistency, varc_problem, lrdi_problem, emotional_state, mentor_assessment, critical_event, student_pattern, mentor_warning, raw_summary.
raw_summary must be a concise string suitable for vector embedding.`),
    new HumanMessage(JSON.stringify({
      userId,
      date,
      trackerData,
      chatMessages,
    }, null, 2)),
  ]);

  const text = normalizeContent(response.content);
  const parsed = parseJsonObject(text);
  return ensureDistillationShape(
    parsed,
    `Daily mentor memory for ${userId} on ${date}: ${text}`.slice(0, 1200)
  );
}

export async function runNightlyDistillation(supabase) {
  const date = todayIst();
  const userIds = await getActiveUserIds();

  // ── Bank health check + auto-replenish ──────────────────────────────────
  try {
    const depleted = await getDepletedTopics();
    for (const topic of depleted) {
      console.log(`[pipeline] Bank depleted for ${topic}, replenishing...`);
      await ingestFromTavily(topic, 20).catch(err =>
        console.warn(`[pipeline] Replenish failed for ${topic}:`, err?.message)
      );
    }
  } catch (err) {
    console.warn("[pipeline] Bank health check failed:", err?.message);
  }

  // ── Mark skipped assessments for users who didn't take it ───────────────
  try {
    if (supabase) {
      const today = todayIst();
      await supabase
        .from("daily_question_log")
        .update({ skipped: true })
        .eq("log_date", today)
        .eq("topic", "all")
        .eq("assessment_taken", false);
    }
  } catch (err) {
    console.warn("[pipeline] Skip marking failed:", err?.message);
  }

  for (const userId of userIds) {
    try {
      const chatMessages = await getAllChatToday(userId);
      if (!chatMessages.length) continue;

      const trackerData = await getTrackerData(supabase, userId, date);
      const distillation = await distillDailyMemory({
        userId,
        date,
        chatMessages,
        trackerData,
      });

      await storeDailyMemory(userId, date, distillation);
      await clearChat(userId);
    } catch (err) {
      console.error(`Mentor distillation failed for ${userId}:`, err?.message || err);
    }
  }
}

export function startPipeline(supabase) {
  if (scheduledTask) return scheduledTask;

  scheduledTask = cron.schedule(
    CRON_SCHEDULE,
    () => {
      runNightlyDistillation(supabase).catch(err => {
        console.error("Mentor nightly distillation failed:", err?.message || err);
      });
    },
    {
      timezone: TIMEZONE,
    }
  );

  return scheduledTask;
}
