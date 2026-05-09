import Redis from "ioredis";
import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION = "conquer_mentor_memory";
const VECTOR_SIZE = 384;
const CHAT_TTL_SECONDS = 60 * 60 * 24;
const HF_EMBED_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

let redisClient;
let qdrantClient;

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(requireEnv("REDIS_URL"), {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    });
  }
  return redisClient;
}

function getQdrant() {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: requireEnv("QDRANT_URL"),
      apiKey: process.env.QDRANT_API_KEY?.trim() || undefined,
    });
  }
  return qdrantClient;
}

function istDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function chatKey(userId, date = istDateKey()) {
  return `mentor:chat:${userId}:${date}`;
}

function fnv1a32(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) || 1;
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function initQdrant() {
  const client = getQdrant();
  const existing = await client.collectionExists(COLLECTION);

  if (!existing?.exists) {
    await client.createCollection(COLLECTION, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });
  }

  return client;
}

export async function appendChat(userId, role, content) {
  const redis = getRedis();
  const key = chatKey(userId);
  const message = JSON.stringify({
    role,
    content,
    ts: new Date().toISOString(),
  });

  await redis.rpush(key, message);
  await redis.expire(key, CHAT_TTL_SECONDS);
}

export async function getRecentChat(userId, n = 20) {
  const redis = getRedis();
  const count = Math.max(1, Number(n) || 20);
  const rows = await redis.lrange(chatKey(userId), -count, -1);
  return rows.map(parseMessage).filter(Boolean);
}

export async function getAllChatToday(userId) {
  const redis = getRedis();
  const rows = await redis.lrange(chatKey(userId), 0, -1);
  return rows.map(parseMessage).filter(Boolean);
}

export async function clearChat(userId) {
  const redis = getRedis();
  await redis.del(chatKey(userId));
}

export async function embed(text) {
  const response = await fetch(HF_EMBED_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${requireEnv("HF_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = data?.error || `HuggingFace embedding failed with ${response.status}`;
    throw new Error(reason);
  }

  const vector = Array.isArray(data?.[0]) ? data[0] : data;
  if (!Array.isArray(vector) || vector.length !== VECTOR_SIZE) {
    throw new Error("HuggingFace embedding response was not a 384-dimension vector");
  }

  return vector.map(Number);
}

export async function storeDailyMemory(userId, date, payload) {
  await initQdrant();

  const rawSummary = payload?.raw_summary;
  if (!rawSummary) throw new Error("payload.raw_summary is required");

  const vector = await embed(rawSummary);
  const id = fnv1a32(`${userId}::${date}`);

  await getQdrant().upsert(COLLECTION, {
    wait: true,
    points: [
      {
        id,
        vector,
        payload: {
          ...payload,
          user_id: userId,
          date,
          raw_summary: rawSummary,
        },
      },
    ],
  });

  return id;
}

export async function retrieveMemories(userId, query, limit = 5) {
  await initQdrant();

  const vector = await embed(query);
  const results = await getQdrant().search(COLLECTION, {
    vector,
    limit,
    with_payload: true,
    filter: {
      must: [
        {
          key: "user_id",
          match: { value: userId },
        },
      ],
    },
  });

  return results
    .map(result => result.payload?.raw_summary)
    .filter(value => typeof value === "string" && value.trim());
}
