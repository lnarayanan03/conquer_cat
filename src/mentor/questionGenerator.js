import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";
import { ASSESSMENT_TOPICS, getAssessmentTopicCounts } from "./assessmentCounts.js";

dotenv.config();

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { transport: ws },
    })
  : null;

const TAVILY_TIMEOUT_MS = 8000;
const ANTHROPIC_TIMEOUT_MS = 90000;
const GROQ_SMALL_TIMEOUT_MS = 10000;
const PRELOAD_TOPIC_TIMEOUT_MS = 90000;
const VALID_DIFFICULTIES = ["medium", "cat_level", "hard"];
const GENERIC_CONTEXT = {
  quant: "CAT Quant often tests arithmetic, algebra, geometry, number systems, time-work, percentages, ratios, averages, mixtures, and clean multi-step reasoning.",
  varc: "CAT VARC often tests reading comprehension, para summaries, odd sentence, para completion, critical reasoning, and precise elimination between close options.",
  lrdi: "CAT LRDI often tests arrangements, tables, tournaments, routes, games, grouping, sequencing, constraints, and data interpretation sets with a single defensible answer.",
};
const TAVILY_QUERIES = {
  quant: "CAT quantitative aptitude commonly tested arithmetic algebra geometry question patterns",
  varc: "CAT VARC reading comprehension para summary para jumble critical reasoning question patterns",
  lrdi: "CAT LRDI sets arrangements tables games tournaments routes puzzles question patterns",
};
const refillLocks = new Map();
let lastPreloadDateKey = null;

const STABLE_QUESTION_GENERATION_INSTRUCTIONS = `You generate ORIGINAL CAT-style assessment questions only.

Return ONLY a strict JSON array. No markdown. No commentary.

JSON schema for every object:
{
  "topic": "quant" | "varc" | "lrdi",
  "subtopic": "...",
  "difficulty": "medium" | "cat_level" | "hard",
  "question_text": "...",
  "options": ["...", "...", "...", "..."],
  "correct_answer": "...",
  "explanation": "...",
  "wrong_explanations": { "option text": "why this option is wrong" },
  "quality_score": 1-10,
  "importance_score": 1-10,
  "cat_likelihood_score": 1-10,
  "keep_for_revision": true,
  "mock_ready": false,
  "source_context_summary": "...",
  "generated_by": "anthropic"
}

Validation rules:
- Original questions only. Do not copy website questions directly.
- Use context only for topic-pattern inspiration.
- Exactly 4 unique non-empty options.
- correct_answer must exactly equal one option.
- One clear correct answer only.
- No ambiguous questions, broken math, missing passages, unsupported answers, or source-like wording.
- Explanations must be clear and concise.
- Wrong-option explanations should identify why each wrong option fails when possible.

Scoring rubric:
- quality_score measures correctness, clarity, and single-answer validity.
- importance_score measures revision value for CAT preparation.
- cat_likelihood_score measures how likely this pattern is to appear in CAT-style practice.
- Reject internally before output if quality_score < 7, importance_score < 6, or cat_likelihood_score < 6.
- Set keep_for_revision true when importance_score >= 8 or cat_likelihood_score >= 8.
- Set mock_ready true when quality_score >= 8 and cat_likelihood_score >= 8.

Output compact JSON only. Do not include long prose.`;

function shortError(err) {
  return (err?.message || String(err) || "Unknown error").slice(0, 180);
}

async function fetchJsonWithTimeout(url, options, timeoutMs, label = "request") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(`${label} timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function extractReply(data) {
  if (typeof data?.content === "string") return data.content;
  if (Array.isArray(data?.content)) {
    return data.content
      .map(block => typeof block === "string" ? block : block?.text || "")
      .filter(Boolean)
      .join("\n");
  }
  return data?.choices?.[0]?.message?.content || "";
}

function parseJsonArray(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || text;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON array found");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function compactText(value, maxLength = 380) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function buildIndexedContext(results = [], topic) {
  const items = (results || [])
    .slice(0, 3)
    .map((result, index) => {
      const title = compactText(result.title, 90);
      const body = compactText(result.content || result.snippet, 360);
      const text = compactText([title, body].filter(Boolean).join(": "), 420);
      return text ? `[CTX-${index + 1}] ${text}` : "";
    })
    .filter(Boolean);

  const context = items.join("\n").slice(0, 1200).trim();
  return context || GENERIC_CONTEXT[topic];
}

async function getTavilyContext(topic) {
  const tavilyKey = process.env.TAVILY_API_KEY?.trim();
  if (!tavilyKey) return GENERIC_CONTEXT[topic];

  try {
    console.log(`[question-generator] fetching context for ${topic}`);
    const { response, data } = await fetchJsonWithTimeout("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tavilyKey}`,
      },
      body: JSON.stringify({
        query: TAVILY_QUERIES[topic],
        max_results: 3,
        search_depth: "basic",
        include_raw_content: false,
      }),
    }, TAVILY_TIMEOUT_MS, "Tavily context search");

    if (!response.ok) throw new Error(`Tavily ${response.status}`);
    return buildIndexedContext(data.results || [], topic);
  } catch (err) {
    console.warn(`[question-generator] Tavily context fallback for ${topic}: ${shortError(err)}`);
    return GENERIC_CONTEXT[topic];
  }
}

async function callAnthropicForQuestions(topic, count, sourceContextSummary) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const maxTokens = count <= 3 ? 3000 : count <= 5 ? 4500 : 6000;
  const dynamicPrompt = `Generate exactly ${count} ORIGINAL CAT-style ${topic.toUpperCase()} questions.

Topic: ${topic}
Count: ${count}

Compact context for topic patterns only. Do not copy source wording or source questions:
${sourceContextSummary}

Request-specific instructions:
- Keep source_context_summary under 300 characters.
- Keep wrong_explanations concise.
- Return one JSON array only.`;

  console.log(`[question-generator] generating ${count} ${topic} questions with Anthropic`);
  const { response, data } = await fetchJsonWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_QUESTION_MODEL || "claude-sonnet-4-6",
      max_tokens: maxTokens,
      temperature: 0.35,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: STABLE_QUESTION_GENERATION_INSTRUCTIONS,
              // Only stable rules are cached. Dynamic topic/context stays uncached.
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: dynamicPrompt,
            },
          ],
        },
      ],
    }),
  }, ANTHROPIC_TIMEOUT_MS, "Anthropic question generation");

  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic ${response.status}`);
  }

  const reply = extractReply(data).trim();
  if (!reply) throw new Error("Anthropic returned empty output");
  if (data?.usage) {
    const usage = data.usage;
    console.log("[question-generator] Anthropic usage", {
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens,
      cache_read_input_tokens: usage.cache_read_input_tokens,
    });
  }
  console.log(`[question-generator] Anthropic returned output for ${topic}`);
  return reply;
}

async function cleanupJsonWithGroq(rawText) {
  const groqKey = process.env.GROQ_SMALL_TASK_KEY?.trim();
  if (!groqKey) return rawText;

  try {
    const { response, data } = await fetchJsonWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4000,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: "Clean malformed JSON arrays for CAT question objects. Return only the JSON array. Do not add text.",
          },
          { role: "user", content: rawText.slice(0, 12000) },
        ],
      }),
    }, GROQ_SMALL_TIMEOUT_MS, "Groq JSON cleanup");
    if (!response.ok) throw new Error(`Groq small ${response.status}`);
    return extractReply(data).trim() || rawText;
  } catch (err) {
    console.warn(`[question-generator] Groq small cleanup skipped: ${shortError(err)}`);
    return rawText;
  }
}

function normalizeQuestion(question) {
  const options = (question.options || []).map(option => String(option).trim());
  const qualityScore = Number(question.quality_score || 0);
  const importanceScore = Number(question.importance_score || 0);
  const catLikelihoodScore = Number(question.cat_likelihood_score || 0);
  const wrongExplanations = question.wrong_explanations && typeof question.wrong_explanations === "object"
    ? Object.fromEntries(Object.entries(question.wrong_explanations).map(([option, explanation]) => [
        String(option).trim(),
        compactText(explanation, 220),
      ]))
    : {};
  return {
    topic: String(question.topic || "").toLowerCase().trim(),
    subtopic: String(question.subtopic || "").trim(),
    difficulty: String(question.difficulty || "").toLowerCase().trim(),
    question_text: String(question.question_text || "").trim(),
    options,
    correct_answer: String(question.correct_answer || "").trim(),
    explanation: String(question.explanation || "").trim(),
    wrong_explanations: wrongExplanations,
    quality_score: qualityScore,
    importance_score: importanceScore,
    cat_likelihood_score: catLikelihoodScore,
    keep_for_revision: importanceScore >= 8 || catLikelihoodScore >= 8 || question.keep_for_revision === true,
    mock_ready: (qualityScore >= 8 && catLikelihoodScore >= 8) || question.mock_ready === true,
    source_context_summary: compactText(question.source_context_summary, 300),
    generated_by: "anthropic",
  };
}

export function validateGeneratedQuestion(question) {
  const q = normalizeQuestion(question || {});
  const reasons = [];
  const uniqueOptions = new Set(q.options);

  if (!ASSESSMENT_TOPICS.includes(q.topic)) reasons.push("invalid topic");
  if (!VALID_DIFFICULTIES.includes(q.difficulty)) reasons.push("invalid difficulty");
  if (!q.question_text) reasons.push("missing question text");
  if (!Array.isArray(q.options) || q.options.length !== 4) reasons.push("must have exactly four options");
  if (q.options.some(option => !option)) reasons.push("empty option");
  if (uniqueOptions.size !== q.options.length) reasons.push("duplicate options");
  if (!q.correct_answer || !q.options.includes(q.correct_answer)) reasons.push("correct answer must match an option");
  if (!q.explanation || q.explanation.length < 20) reasons.push("weak explanation");
  if (q.quality_score < 7) reasons.push("quality score below 7");
  if (q.importance_score < 6) reasons.push("importance score below 6");
  if (q.cat_likelihood_score < 6) reasons.push("CAT likelihood below 6");
  if (/copied from|source:|cat \d{4}|previous year/i.test(q.question_text)) reasons.push("source-like wording");
  if (/all of the above|none of the above/i.test(q.correct_answer)) reasons.push("ambiguous option style");

  return {
    ok: reasons.length === 0,
    question: q,
    reasons,
  };
}

export async function generateQuestionsForTopic({ topic, count = 5 } = {}) {
  const normalizedTopic = String(topic || "").toLowerCase().trim();
  const requested = Math.max(1, Math.min(Number(count) || 5, 10));
  const errors = [];

  if (!ASSESSMENT_TOPICS.includes(normalizedTopic)) {
    return { topic: normalizedTopic, requested, generated: 0, accepted: 0, rejected: 0, questions: [], errors: ["Invalid topic"] };
  }

  try {
    const sourceContextSummary = await getTavilyContext(normalizedTopic);
    const raw = await callAnthropicForQuestions(normalizedTopic, requested, sourceContextSummary);
    let parsed;
    try {
      parsed = parseJsonArray(raw);
    } catch {
      parsed = parseJsonArray(await cleanupJsonWithGroq(raw));
    }

    const generated = Array.isArray(parsed) ? parsed : [];
    const acceptedQuestions = [];
    for (const item of generated) {
      const result = validateGeneratedQuestion({
        ...item,
        topic: normalizedTopic,
        source_context_summary: item.source_context_summary || sourceContextSummary,
      });
      if (result.ok) {
        acceptedQuestions.push(result.question);
      } else {
        errors.push(`Rejected question: ${result.reasons.join(", ")}`);
      }
    }
    console.log(`[question-generator] ${normalizedTopic} accepted ${acceptedQuestions.length}/${generated.length} questions`);

    return {
      topic: normalizedTopic,
      requested,
      generated: generated.length,
      accepted: acceptedQuestions.length,
      rejected: Math.max(generated.length - acceptedQuestions.length, 0),
      questions: acceptedQuestions,
      errors,
    };
  } catch (err) {
    return {
      topic: normalizedTopic,
      requested,
      generated: 0,
      accepted: 0,
      rejected: 0,
      questions: [],
      errors: [shortError(err)],
    };
  }
}

function toInsertRow(question, includeMetadata = true) {
  const base = {
    topic: question.topic,
    difficulty: question.difficulty,
    question_text: question.question_text,
    options: question.options,
    correct_answer: question.correct_answer,
    explanation: question.explanation,
    source: "anthropic_generated",
    cat_year: null,
    times_seen: 0,
    times_correct: 0,
    is_archived: false,
  };

  if (!includeMetadata) return base;
  return {
    ...base,
    subtopic: question.subtopic || null,
    quality_score: question.quality_score,
    importance_score: question.importance_score,
    cat_likelihood_score: question.cat_likelihood_score,
    keep_for_revision: question.keep_for_revision,
    mock_ready: question.mock_ready,
    source_context_summary: question.source_context_summary,
    wrong_explanations: question.wrong_explanations,
    generated_by: "anthropic",
  };
}

export async function insertGeneratedQuestions(questions = []) {
  if (!supabase) {
    return { inserted: 0, errors: ["Supabase service client not configured"] };
  }

  const valid = questions
    .map(question => validateGeneratedQuestion(question))
    .filter(result => result.ok)
    .map(result => result.question);

  if (valid.length === 0) return { inserted: 0, errors: [] };

  console.log(`[question-generator] inserting ${valid.length} ${valid[0].topic} questions`);
  const fullRows = valid.map(question => toInsertRow(question, true));
  const { data, error } = await supabase
    .from("questions")
    .insert(fullRows)
    .select("id");

  if (!error) return { inserted: data?.length || fullRows.length, errors: [] };

  console.warn(`[question-generator] metadata insert retrying with base columns: ${shortError(error)}`);
  const baseRows = valid.map(question => toInsertRow(question, false));
  const retry = await supabase
    .from("questions")
    .insert(baseRows)
    .select("id");

  if (retry.error) {
    return { inserted: 0, errors: [shortError(retry.error)] };
  }
  return { inserted: retry.data?.length || baseRows.length, errors: [shortError(error)] };
}

async function runRefillQuestionBank({ topic, count = 5 } = {}) {
  const generated = await generateQuestionsForTopic({ topic, count });
  const insertResult = await insertGeneratedQuestions(generated.questions);
  return {
    topic: generated.topic,
    requested: generated.requested,
    generated: generated.generated,
    accepted: generated.accepted,
    rejected: generated.rejected,
    inserted: insertResult.inserted,
    errors: [...generated.errors, ...insertResult.errors],
  };
}

export async function refillQuestionBank({ topic, count = 5 } = {}) {
  const normalizedTopic = String(topic || "").toLowerCase().trim();
  if (refillLocks.has(normalizedTopic)) {
    console.log(`[question-generator] refill lock hit for ${normalizedTopic}`);
    return refillLocks.get(normalizedTopic);
  }

  console.log(`[question-generator] refill started for ${normalizedTopic}`);
  const refillPromise = runRefillQuestionBank({ topic: normalizedTopic, count })
    .finally(() => {
      refillLocks.delete(normalizedTopic);
      console.log(`[question-generator] refill finished for ${normalizedTopic}`);
    });

  refillLocks.set(normalizedTopic, refillPromise);
  return refillPromise;
}

export function isRefillRunning(topic) {
  return refillLocks.has(String(topic || "").toLowerCase().trim());
}

export async function refillAllTopics({ countPerTopic = 5 } = {}) {
  const results = [];
  for (const topic of ASSESSMENT_TOPICS) {
    results.push(await refillQuestionBank({ topic, count: countPerTopic }));
  }
  return results;
}

function withTimeout(promise, label, timeoutMs) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

export function getIstDateKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

async function getActiveQuestionCount(topic) {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("topic", topic)
    .eq("is_archived", false);
  if (error) {
    console.warn(`[question-generator] capacity check failed for ${topic}: ${shortError(error)}`);
    return 0;
  }
  return count || 0;
}

export async function preloadDailyQuestionBank({ force = false, bypassCapacity = false } = {}) {
  const dateKey = getIstDateKey();
  if (!force && lastPreloadDateKey === dateKey) {
    return { dateKey, skipped: true, results: [] };
  }

  lastPreloadDateKey = dateKey;
  const dailyCounts = getAssessmentTopicCounts("daily");
  const results = [];

  for (const topic of ASSESSMENT_TOPICS) {
    let activeCount = null;
    try {
      activeCount = await getActiveQuestionCount(topic);
      const required = dailyCounts[topic] || 0;
      if (activeCount >= required + 5 && !bypassCapacity) {
        console.log(`[assessment/preload] ${topic} capacity sufficient, skipped`);
        results.push({
          topic,
          skipped: true,
          reason: "capacity sufficient",
          activeCount,
          requested: 0,
          generated: 0,
          accepted: 0,
          inserted: 0,
          errors: [],
        });
        continue;
      }

      if (isRefillRunning(topic)) {
        console.log(`[assessment/preload] ${topic} refill already running`);
      }

      console.log(`[assessment/preload] ${topic} generating 3`);
      const result = await withTimeout(
        refillQuestionBank({ topic, count: 3 }),
        `preload ${topic}`,
        PRELOAD_TOPIC_TIMEOUT_MS
      );
      results.push({
        ...result,
        skipped: false,
        reason: "generated",
        activeCount,
      });
    } catch (err) {
      const message = shortError(err);
      if (message.includes("timed out")) {
        console.warn(`[assessment/preload] ${topic} timed out after ${PRELOAD_TOPIC_TIMEOUT_MS}ms`);
      } else {
        console.warn(`[assessment/preload] ${topic} failed: ${message}`);
      }
      results.push({
        topic,
        skipped: false,
        reason: "generation failed",
        activeCount,
        requested: 3,
        generated: 0,
        accepted: 0,
        rejected: 0,
        inserted: 0,
        errors: [message],
      });
    }
  }

  return { dateKey, skipped: false, results };
}

// Future cleanup: audit old unused assessment/tool code after generation flow is stable.
// Cleanup note: old malformed generated rows can be archived with SQL after reviewing production data.
