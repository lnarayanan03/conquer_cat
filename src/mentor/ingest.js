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
const SEED_COUNT = 10;

function getGroq() {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 2000,
  });
}

function getTopicPrompt(topic) {
  const specs = {
    quant: "arithmetic, algebra, number theory, geometry, percentages, profit/loss, time-speed-distance, work, mixtures — CAT exam style",
    varc: "reading comprehension inference, vocabulary in context, para-jumbles, para-summary, critical reasoning, sentence correction — CAT exam style",
    lrdi: "arrangements (linear/circular), blood relations, directions, set theory, games/tournaments, logical sequences — CAT exam style",
  };
  return specs[topic];
}

function buildSeedPrompt(topic, count) {
  return `Generate exactly ${count} unique CAT-level multiple choice questions for the topic: ${topic} (${getTopicPrompt(topic)}).

STRICT RULES:
- Each question must be a different sub-type — do NOT repeat the same concept
- All questions must be CAT 2020-2024 difficulty level
- Each question must have exactly 4 options
- correctAnswer must be the EXACT TEXT of one of the 4 options — not A/B/C/D
- Explanation must show full working/reasoning
- Mix of medium (20%), cat_level (60%), and hard (20%) difficulty

Return ONLY a valid JSON array. No markdown. No preamble. No explanation outside JSON.
Format:
[
  {
    "topic": "${topic}",
    "difficulty": "cat_level",
    "question_text": "...",
    "options": ["option1", "option2", "option3", "option4"],
    "correct_answer": "option1",
    "explanation": "...",
    "source": "generated"
  }
]`;
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

function parseJsonArray(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || text;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found");
  return JSON.parse(raw.slice(start, end + 1));
}

async function deduplicateQuestions(questions) {
  if (!supabase || questions.length === 0) return questions;
  const { data: existing } = await supabase
    .from("questions")
    .select("question_text");
  const existingTexts = new Set((existing || []).map(r => r.question_text.toLowerCase().slice(0, 80)));
  return questions.filter(q => !existingTexts.has(q.question_text.toLowerCase().slice(0, 80)));
}

async function insertQuestions(questions) {
  if (!supabase || questions.length === 0) return 0;
  const valid = questions.filter(validateQuestion);
  const deduped = await deduplicateQuestions(valid);
  if (deduped.length === 0) return 0;

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
  return rows.length;
}

export async function seedInitialBank() {
  const results = {};
  const model = getGroq();

  for (const topic of TOPICS) {
    try {
      console.log(`[ingest] Seeding ${topic}...`);
      let totalInserted = 0;
      const BATCHES = 5;
      for (let batch = 0; batch < BATCHES; batch++) {
        try {
          const response = await model.invoke([
            new SystemMessage("You are a CAT exam question generator. Return only valid JSON arrays. Never truncate. Always close the JSON array with ] at the end."),
            new HumanMessage(buildSeedPrompt(topic, SEED_COUNT)),
          ]);
          const text = typeof response.content === "string"
            ? response.content
            : response.content.map(b => b.text || "").join("");
          const parsed = parseJsonArray(text);
          const inserted = await insertQuestions(parsed);
          totalInserted += inserted;
          console.log(`[ingest] ${topic} batch ${batch + 1}/${BATCHES}: ${inserted} inserted`);
        } catch (batchErr) {
          console.warn(`[ingest] ${topic} batch ${batch + 1} failed:`, batchErr?.message?.slice(0, 120));
        }
        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      results[topic] = totalInserted;
      console.log(`[ingest] ${topic} total: ${totalInserted} questions inserted`);
    } catch (err) {
      console.error(`[ingest] Seed failed for ${topic}:`, err?.message);
      results[topic] = 0;
    }
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

  const model = getGroq();
  const llmResponse = await model.invoke([
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
