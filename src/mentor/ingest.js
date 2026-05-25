import { createClient } from "@supabase/supabase-js";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import ws from "ws";

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { transport: ws },
    })
  : null;

const TOPICS = ["quant", "varc", "lrdi"];
const BANK_TARGET_PER_TOPIC = 50;

let groqIngestIndex = 0;

function getGroq() {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter(k => k?.trim());

  if (keys.length === 0) throw new Error("No Groq API keys configured");

  const key = keys[groqIngestIndex % keys.length];
  groqIngestIndex++;
  console.log(`[ingest] Using Groq key ${(groqIngestIndex % keys.length) + 1}/${keys.length}`);
  return new ChatGroq({
    apiKey: key,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 4000,
  });
}

function buildTavilyIngestPrompt(topic, rawText, count) {
  return `Below is raw text scraped from a CAT preparation source. 
Extract and format exactly ${count} valid CAT-style questions for topic: ${topic}.

SOURCE TEXT:
${rawText.slice(0, 3000)}

STRICT RULES:
- Extract real questions from the text — do NOT hallucinate new ones
- Skip any question that is incomplete or missing an answer
- correctAnswer must be EXACT TEXT of one of the 4 options
- Return ONLY valid JSON array, no markdown, no explanation

Format:
[
  {
    "topic": "${topic}",
    "difficulty": "cat_level",
    "question_text": "...",
    "options": ["option1", "option2", "option3", "option4"],
    "correct_answer": "option1",
    "explanation": "...",
    "source": "scraped",
    "cat_year": null
  }
]`;
}

function validateQuestion(q) {
  if (!q || typeof q !== "object") return false;
  if (!q.question_text?.trim()) return false;
  if (!["quant","varc","lrdi"].includes(q.topic)) return false;
  if (!["easy","medium","cat_level","hard"].includes(q.difficulty)) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  if (q.options.some(o => !String(o).trim())) return false;
  if (!q.correct_answer?.trim()) return false;
  if (!q.options.includes(q.correct_answer)) return false;
  if (!q.explanation?.trim()) return false;
  return true;
}

function sanitizeJsonString(raw) {
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
    .replace(/([^\\])'/g, "$1\\'");
}

function parseJsonArray(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || text;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found");
  const slice = raw.slice(start, end + 1);

  // Attempt 1: direct parse
  try { return JSON.parse(slice); } catch {}

  // Attempt 2: sanitize control characters and retry
  try { return JSON.parse(sanitizeJsonString(slice)); } catch {}

  // Attempt 3: extract individual valid objects manually
  const objects = [];
  const objRegex = /\{[\s\S]*?\}(?=\s*[,\]])/g;
  let match;
  while ((match = objRegex.exec(slice)) !== null) {
    try {
      const obj = JSON.parse(match[0]);
      if (obj.question_text && obj.correct_answer) objects.push(obj);
    } catch {}
  }
  if (objects.length > 0) return objects;

  throw new Error("Could not parse JSON even after sanitization");
}

async function deduplicateQuestions(questions) {
  if (!supabase || questions.length === 0) return questions;
  const { data: existing } = await supabase
    .from("questions")
    .select("question_text");
  const existingTexts = new Set((existing || []).map(r => r.question_text.toLowerCase().slice(0, 80)));
  return questions.filter(q => !existingTexts.has(q.question_text.toLowerCase().slice(0, 80)));
}

async function countQuestions(topic) {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("topic", topic)
    .eq("is_archived", false);
  if (error) throw new Error(`Count failed: ${error.message}`);
  return count || 0;
}

async function insertQuestions(questions) {
  const parsed = questions.length;
  const valid = questions.filter(validateQuestion);
  if (!supabase || questions.length === 0) {
    console.log(`[ingest] Insert funnel: parsed=${parsed}, valid=${valid.length}, deduped=0, inserted=0`);
    return 0;
  }
  const deduped = await deduplicateQuestions(valid);
  if (deduped.length === 0) {
    console.log(`[ingest] Insert funnel: parsed=${parsed}, valid=${valid.length}, deduped=0, inserted=0`);
    return 0;
  }

  const rows = deduped.map(q => ({
    topic: q.topic,
    difficulty: q.difficulty,
    question_text: q.question_text.trim(),
    options: q.options.map(o => String(o).trim()),
    correct_answer: q.correct_answer.trim(),
    explanation: q.explanation.trim(),
    source: q.source || "generated",
    cat_year: q.cat_year || null,
  }));

  const { error } = await supabase.from("questions").insert(rows);
  if (error) throw new Error(`Insert failed: ${error.message}`);
  console.log(`[ingest] Insert funnel: parsed=${parsed}, valid=${valid.length}, deduped=${deduped.length}, inserted=${rows.length}`);
  return rows.length;
}

export async function seedInitialBank() {
  const results = {};

  for (const topic of TOPICS) {
    try {
      const existing = await countQuestions(topic);
      if (existing >= BANK_TARGET_PER_TOPIC) {
        console.log(`[ingest] ${topic} already has ${existing}/${BANK_TARGET_PER_TOPIC}; skipping`);
        results[topic] = 0;
        continue;
      }

      const needed = BANK_TARGET_PER_TOPIC - existing;
      console.log(`[ingest] Seeding ${topic} via Tavily... existing=${existing}, needed=${needed}`);
      const count = await ingestFromTavily(topic, needed);
      results[topic] = count;
      console.log(`[ingest] ${topic} total: ${count} questions inserted`);
    } catch (err) {
      console.error(`[ingest] Seed failed for ${topic}:`, err?.message?.slice(0, 120));
      results[topic] = 0;
    }
    // Delay between topics to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return results;
}

export async function ingestFromTavily(topic, count = 20) {
  const tavilyKey = process.env.TAVILY_API_KEY?.trim();
  if (!tavilyKey) throw new Error("TAVILY_API_KEY not configured");

  const queries = {
    quant: "CAT 2024 quantitative aptitude questions with solutions PDF",
    varc: "CAT 2024 verbal ability reading comprehension questions answers",
    lrdi: "CAT 2024 logical reasoning data interpretation questions solutions",
  };

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tavilyKey}`,
    },
    body: JSON.stringify({
      query: queries[topic],
      max_results: 3,
      search_depth: "basic",
      include_raw_content: true,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Tavily failed: ${response.status}`);

  const rawText = (data.results || [])
    .map(r => r.raw_content || r.content || "")
    .join("\n\n")
    .slice(0, 6000);

  if (!rawText.trim()) throw new Error("Tavily returned no content");

  const llmResponse = await getGroq().invoke([
    new SystemMessage("You extract and format CAT questions from raw text into JSON. Return only valid JSON arrays."),
    new HumanMessage(buildTavilyIngestPrompt(topic, rawText, count)),
  ]);

  const text = typeof llmResponse.content === "string"
    ? llmResponse.content
    : llmResponse.content.map(b => b.text || "").join("");

  const parsed = parseJsonArray(text);
  const inserted = await insertQuestions(parsed);
  console.log(`[ingest] Tavily ${topic}: ${inserted} questions inserted`);
  return inserted;
}
