import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";
import { ASSESSMENT_TOPICS } from "./assessmentCounts.js";

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
const BANK_MIN_ACTIVE_PER_TOPIC = 20;
const PRELOAD_MAX_REFILL_PER_TOPIC = 10;
const PRELOAD_ACCEPTANCE_BUFFER = 2;
const QUESTION_JACCARD_DUP_THRESHOLD = 0.82;
const QUESTION_BIGRAM_DUP_THRESHOLD = 0.86;
const QUESTION_CONTAINMENT_LENGTH_RATIO = 0.72;
const MAX_INSERTS_PER_SUBTOPIC_BATCH = 2;
const VALID_DIFFICULTIES = ["medium", "cat_level", "hard"];
const AUDIT_PLACEHOLDER_RE = /lorem ipsum|placeholder|sample question|\binsert\b|\btodo\b|\bn\/a\b/i;
const AUDIT_SOURCE_COPY_RE = /copied from|source:|previous year question/i;
const AUDIT_JSON_REMNANT_RE = /```|"\s*:\s*"|^\s*[\]}]|[\[{]\s*$/;
const AUDIT_ALLOWED_SOURCE_COPY_SOURCES = new Set([
  "official_previous_year",
  "cat_previous_year",
  "validated_previous_year",
]);
const COMMON_QUESTION_TOKENS = new Set([
  "the", "and", "for", "are", "was", "were", "with", "from", "that", "this",
  "then", "than", "into", "find", "what", "which", "when", "where", "given",
  "each", "total", "value", "values", "number", "numbers", "option", "answer",
  "following", "statement", "statements", "quantity", "quantities", "passage",
]);
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

export function normalizeQuestionTextForSimilarity(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeQuestionText(text) {
  return normalizeQuestionTextForSimilarity(text)
    .split(" ")
    .filter(token => {
      if (!token) return false;
      if (/^\d+$/.test(token)) return true;
      if (token.length <= 2) return false;
      return !COMMON_QUESTION_TOKENS.has(token);
    });
}

export function jaccardSimilarity(aTokens, bTokens) {
  const a = new Set(aTokens || []);
  const b = new Set(bTokens || []);
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union ? intersection / union : 0;
}

function wordBigrams(text) {
  const words = normalizeQuestionTextForSimilarity(text).split(" ").filter(Boolean);
  if (words.length < 2) return words;
  const bigrams = [];
  for (let index = 0; index < words.length - 1; index += 1) {
    bigrams.push(`${words[index]} ${words[index + 1]}`);
  }
  return bigrams;
}

export function bigramDiceSimilarity(aText, bText) {
  const a = wordBigrams(aText);
  const b = wordBigrams(bText);
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) || 0) + 1);

  let overlap = 0;
  for (const item of b) {
    const count = counts.get(item) || 0;
    if (count > 0) {
      overlap += 1;
      counts.set(item, count - 1);
    }
  }
  return (2 * overlap) / (a.length + b.length);
}

function normalizeSubtopicForBatch(subtopic) {
  return normalizeQuestionTextForSimilarity(subtopic || "") || "__blank__";
}

export function isNearDuplicateQuestion(candidate, existingQuestions = []) {
  const candidateText = candidate?.question_text || candidate;
  const candidateNormalized = normalizeQuestionTextForSimilarity(candidateText);
  if (!candidateNormalized) return { duplicate: false, reason: "" };

  const candidateTokens = tokenizeQuestionText(candidateNormalized);
  for (const existing of existingQuestions || []) {
    const existingText = existing?.question_text || existing;
    const existingNormalized = normalizeQuestionTextForSimilarity(existingText);
    if (!existingNormalized) continue;

    if (candidateNormalized === existingNormalized) {
      return { duplicate: true, reason: "exact normalized match" };
    }

    const shorterLength = Math.min(candidateNormalized.length, existingNormalized.length);
    const longerLength = Math.max(candidateNormalized.length, existingNormalized.length);
    const lengthRatio = longerLength ? shorterLength / longerLength : 0;
    if (
      lengthRatio >= QUESTION_CONTAINMENT_LENGTH_RATIO &&
      (candidateNormalized.includes(existingNormalized) || existingNormalized.includes(candidateNormalized))
    ) {
      return { duplicate: true, reason: "strong containment overlap" };
    }

    const jaccard = jaccardSimilarity(candidateTokens, tokenizeQuestionText(existingNormalized));
    if (jaccard >= QUESTION_JACCARD_DUP_THRESHOLD) {
      return { duplicate: true, reason: `token similarity ${jaccard.toFixed(2)}` };
    }

    const dice = bigramDiceSimilarity(candidateNormalized, existingNormalized);
    if (dice >= QUESTION_BIGRAM_DUP_THRESHOLD) {
      return { duplicate: true, reason: `phrase similarity ${dice.toFixed(2)}` };
    }
  }

  return { duplicate: false, reason: "" };
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

export async function fetchExistingQuestionsForSimilarity(topic) {
  if (!supabase) {
    return { ok: false, questions: [], error: "Supabase service client not configured" };
  }

  const { data, error } = await supabase
    .from("questions")
    .select("id, question_text, subtopic")
    .eq("topic", topic)
    .eq("is_archived", false)
    .limit(600);

  if (error) {
    return { ok: false, questions: [], error: shortError(error) };
  }

  return { ok: true, questions: data || [], error: "" };
}

async function insertQuestionRowsWithRetry(questions) {
  if (questions.length === 0) return { inserted: 0, errors: [] };

  const fullRows = questions.map(question => toInsertRow(question, true));
  const { data, error } = await supabase
    .from("questions")
    .insert(fullRows)
    .select("id");

  if (!error) return { inserted: data?.length || fullRows.length, errors: [] };

  console.warn(`[question-generator] metadata insert retrying with base columns: ${shortError(error)}`);
  const baseRows = questions.map(question => toInsertRow(question, false));
  const retry = await supabase
    .from("questions")
    .insert(baseRows)
    .select("id");

  if (retry.error) {
    return { inserted: 0, errors: [shortError(retry.error)] };
  }
  return { inserted: retry.data?.length || baseRows.length, errors: [shortError(error)] };
}

export async function insertGeneratedQuestions(questions = []) {
  if (!supabase) {
    return {
      inserted: 0,
      rejected: 0,
      duplicateRejected: 0,
      subtopicRejected: 0,
      errors: ["Supabase service client not configured"],
    };
  }

  const validationResults = questions.map(question => validateGeneratedQuestion(question));
  const valid = validationResults
    .filter(result => result.ok)
    .map(result => result.question);
  const validationRejected = validationResults.length - valid.length;

  if (valid.length === 0) {
    return {
      inserted: 0,
      rejected: Math.max(validationRejected, 0),
      duplicateRejected: 0,
      subtopicRejected: 0,
      errors: [],
    };
  }

  const byTopic = new Map();
  for (const question of valid) {
    if (!byTopic.has(question.topic)) byTopic.set(question.topic, []);
    byTopic.get(question.topic).push(question);
  }

  let inserted = 0;
  let duplicateRejected = 0;
  let subtopicRejected = 0;
  let safetyRejected = 0;
  const errors = [];

  for (const [topic, topicQuestions] of byTopic.entries()) {
    const existingResult = await fetchExistingQuestionsForSimilarity(topic);
    if (!existingResult.ok) {
      safetyRejected += topicQuestions.length;
      errors.push(`similarity check failed for ${topic}: ${existingResult.error}`);
      continue;
    }

    const acceptedForInsert = [];
    const subtopicCounts = new Map();
    for (const question of topicQuestions) {
      const existingDuplicate = isNearDuplicateQuestion(question, existingResult.questions);
      if (existingDuplicate.duplicate) {
        duplicateRejected += 1;
        console.log(`[question-generator] duplicate rejected for ${topic}: ${existingDuplicate.reason}`);
        continue;
      }

      const batchDuplicate = isNearDuplicateQuestion(question, acceptedForInsert);
      if (batchDuplicate.duplicate) {
        duplicateRejected += 1;
        console.log(`[question-generator] duplicate rejected for ${topic}: generated batch ${batchDuplicate.reason}`);
        continue;
      }

      const subtopicKey = normalizeSubtopicForBatch(question.subtopic);
      const subtopicCount = subtopicCounts.get(subtopicKey) || 0;
      if (subtopicCount >= MAX_INSERTS_PER_SUBTOPIC_BATCH) {
        subtopicRejected += 1;
        console.log(`[question-generator] subtopic cap rejected for ${topic}: ${compactText(question.subtopic || "blank", 60)}`);
        continue;
      }

      subtopicCounts.set(subtopicKey, subtopicCount + 1);
      acceptedForInsert.push(question);
    }

    console.log(`[question-generator] inserting ${acceptedForInsert.length} ${topic} questions after duplicate filter`);
    const result = await insertQuestionRowsWithRetry(acceptedForInsert);
    inserted += result.inserted;
    errors.push(...result.errors);
  }

  return {
    inserted,
    rejected: Math.max(validationRejected, 0) + duplicateRejected + subtopicRejected + safetyRejected,
    duplicateRejected,
    subtopicRejected,
    errors,
  };
}

async function runRefillQuestionBank({ topic, count = 5 } = {}) {
  const generated = await generateQuestionsForTopic({ topic, count });
  const insertResult = await insertGeneratedQuestions(generated.questions);
  return {
    topic: generated.topic,
    requested: generated.requested,
    generated: generated.generated,
    accepted: generated.accepted,
    rejected: generated.rejected + (insertResult.rejected || 0),
    inserted: insertResult.inserted,
    duplicateRejected: insertResult.duplicateRejected || 0,
    subtopicRejected: insertResult.subtopicRejected || 0,
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

function hasAuditScore(value) {
  return value !== null && value !== undefined && value !== "";
}

function toAuditNumber(value) {
  return hasAuditScore(value) ? Number(value) : null;
}

function getAuditOptions(question) {
  return Array.isArray(question?.options) ? question.options : question?.options;
}

function isSourceCopyAllowed(question) {
  return AUDIT_ALLOWED_SOURCE_COPY_SOURCES.has(String(question?.source || "").toLowerCase().trim());
}

export function auditQuestionQuality(question = {}) {
  const archiveReasons = [];
  const warnReasons = [];
  const questionText = String(question.question_text || "").trim();
  const explanation = String(question.explanation || "").trim();
  const options = getAuditOptions(question);
  const correctAnswer = String(question.correct_answer || "").trim();
  const qualityScore = toAuditNumber(question.quality_score);
  const importanceScore = toAuditNumber(question.importance_score);
  const catLikelihoodScore = toAuditNumber(question.cat_likelihood_score);
  const wrongExplanations = question.wrong_explanations;

  if (!questionText) archiveReasons.push("missing question_text");
  if (questionText && questionText.length < 20) archiveReasons.push("question_text length below 20");
  if (!Array.isArray(options)) {
    archiveReasons.push("options is not an array");
  } else {
    if (options.length !== 4) archiveReasons.push("options length is not 4");
    if (options.some(option => !String(option || "").trim())) archiveReasons.push("empty option");
    const normalizedOptions = options.map(option => String(option || "").trim().toLowerCase());
    if (new Set(normalizedOptions).size !== normalizedOptions.length) archiveReasons.push("duplicate options");
    if (correctAnswer && !options.map(option => String(option).trim()).includes(correctAnswer)) {
      archiveReasons.push("correct_answer does not exactly match an option");
    }
  }

  if (!correctAnswer) archiveReasons.push("missing correct_answer");
  if (!explanation) archiveReasons.push("missing explanation");
  if (explanation && explanation.length < 30) archiveReasons.push("explanation length below 30");
  if (qualityScore !== null && qualityScore < 5) archiveReasons.push("quality_score below 5");
  if (catLikelihoodScore !== null && catLikelihoodScore < 5) archiveReasons.push("cat_likelihood_score below 5");
  if (AUDIT_PLACEHOLDER_RE.test(questionText)) archiveReasons.push("placeholder question text");
  if (AUDIT_SOURCE_COPY_RE.test(questionText) && !isSourceCopyAllowed(question)) archiveReasons.push("source-copy wording");
  if (AUDIT_JSON_REMNANT_RE.test(questionText) || AUDIT_JSON_REMNANT_RE.test(explanation)) {
    archiveReasons.push("malformed JSON remnants");
  }

  if (!wrongExplanations || typeof wrongExplanations !== "object" || Object.keys(wrongExplanations).length === 0) {
    warnReasons.push("wrong_explanations missing or empty");
  } else if (Array.isArray(options)) {
    const wrongOptions = options
      .map(option => String(option).trim())
      .filter(option => option && option !== correctAnswer);
    const explainedOptions = new Set(Object.keys(wrongExplanations).map(option => String(option).trim()));
    if (wrongOptions.some(option => !explainedOptions.has(option))) {
      warnReasons.push("wrong_explanations does not cover all wrong options");
    }
  }
  if (!String(question.subtopic || "").trim()) warnReasons.push("subtopic missing");
  if (qualityScore === null) warnReasons.push("quality_score missing");
  if (importanceScore === null) warnReasons.push("importance_score missing");
  if (catLikelihoodScore === null) warnReasons.push("cat_likelihood_score missing");
  if (explanation.length >= 30 && explanation.length < 60) warnReasons.push("explanation length between 30 and 60");

  const severity = archiveReasons.length ? "archive" : warnReasons.length ? "warn" : "keep";
  return {
    ok: severity !== "archive",
    reasons: severity === "archive" ? archiveReasons : warnReasons,
    severity,
  };
}

function compareQuestionQuality(left, right) {
  const leftQuality = Number(left?.quality_score || 0);
  const rightQuality = Number(right?.quality_score || 0);
  if (leftQuality !== rightQuality) return leftQuality - rightQuality;

  const leftLikelihood = Number(left?.cat_likelihood_score || 0);
  const rightLikelihood = Number(right?.cat_likelihood_score || 0);
  if (leftLikelihood !== rightLikelihood) return leftLikelihood - rightLikelihood;

  const leftImportance = Number(left?.importance_score || 0);
  const rightImportance = Number(right?.importance_score || 0);
  if (leftImportance !== rightImportance) return leftImportance - rightImportance;

  const leftAnthropic = String(left?.generated_by || "").toLowerCase() === "anthropic" ? 1 : 0;
  const rightAnthropic = String(right?.generated_by || "").toLowerCase() === "anthropic" ? 1 : 0;
  if (leftAnthropic !== rightAnthropic) return leftAnthropic - rightAnthropic;

  const leftCreated = new Date(left?.created_at || 0).getTime() || 0;
  const rightCreated = new Date(right?.created_at || 0).getTime() || 0;
  return leftCreated - rightCreated;
}

function pickBetterQuestion(left, right) {
  return compareQuestionQuality(left, right) >= 0 ? left : right;
}

export async function auditDuplicateQuestionsByTopic(topic, { limitPerTopic = 1000 } = {}) {
  if (!supabase) {
    return { topic, scanned: 0, archiveCandidates: [], errors: ["Supabase service client not configured"] };
  }

  const { data, error } = await supabase
    .from("questions")
    .select("id, topic, subtopic, question_text, quality_score, importance_score, cat_likelihood_score, source, generated_by, created_at")
    .eq("topic", topic)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(Number(limitPerTopic) || 1000, 5000)));

  if (error) {
    return { topic, scanned: 0, archiveCandidates: [], errors: [shortError(error)] };
  }

  const questions = data || [];
  const keepByDuplicate = new Map();
  for (let outer = 0; outer < questions.length; outer += 1) {
    const left = keepByDuplicate.get(questions[outer].id) || questions[outer];
    if (keepByDuplicate.has(questions[outer].id) && keepByDuplicate.get(questions[outer].id).id !== questions[outer].id) {
      continue;
    }

    for (let inner = outer + 1; inner < questions.length; inner += 1) {
      const right = keepByDuplicate.get(questions[inner].id) || questions[inner];
      if (keepByDuplicate.has(questions[inner].id) && keepByDuplicate.get(questions[inner].id).id !== questions[inner].id) {
        continue;
      }

      const duplicate = isNearDuplicateQuestion(left, [right]);
      if (!duplicate.duplicate) continue;

      const keeper = pickBetterQuestion(left, right);
      const weaker = keeper.id === left.id ? right : left;
      keepByDuplicate.set(weaker.id, keeper);
      keepByDuplicate.set(keeper.id, keeper);
    }
  }

  const archiveCandidates = [];
  for (const question of questions) {
    const keeper = keepByDuplicate.get(question.id);
    if (keeper && keeper.id !== question.id) {
      archiveCandidates.push({
        id: question.id,
        topic: question.topic,
        reason: `Archived by audit: near-duplicate of question ${keeper.id}`,
      });
    }
  }

  return { topic, scanned: questions.length, archiveCandidates, errors: [] };
}

function createAuditTopicSummary() {
  return { scanned: 0, archiveCandidates: 0, archived: 0, warnings: 0 };
}

async function fetchQuestionsForAudit(topic, limitPerTopic) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, topic, subtopic, difficulty, question_text, options, correct_answer, explanation, wrong_explanations, quality_score, importance_score, cat_likelihood_score, source, generated_by")
    .eq("topic", topic)
    .eq("is_archived", false)
    .limit(Math.max(1, Math.min(Number(limitPerTopic) || 1000, 5000)));

  if (error) throw new Error(shortError(error));
  return data || [];
}

async function archiveAuditCandidate(candidate) {
  const { error } = await supabase
    .from("questions")
    .update({
      is_archived: true,
      archived_reason: candidate.reason,
    })
    .eq("id", candidate.id);

  if (error) throw new Error(shortError(error));
}

export async function auditQuestionBank({ topic = "all", dryRun = true, limitPerTopic = 1000 } = {}) {
  if (!supabase) {
    return {
      dryRun,
      topic,
      scanned: 0,
      archiveCandidates: 0,
      archived: 0,
      warnings: 0,
      byTopic: Object.fromEntries(ASSESSMENT_TOPICS.map(item => [item, createAuditTopicSummary()])),
      reasons: [],
      errors: ["Supabase service client not configured"],
    };
  }

  const normalizedTopic = String(topic || "all").toLowerCase().trim();
  const topics = normalizedTopic === "all" ? ASSESSMENT_TOPICS : [normalizedTopic];
  if (normalizedTopic !== "all" && !ASSESSMENT_TOPICS.includes(normalizedTopic)) {
    return {
      dryRun,
      topic: normalizedTopic,
      scanned: 0,
      archiveCandidates: 0,
      archived: 0,
      warnings: 0,
      byTopic: Object.fromEntries(ASSESSMENT_TOPICS.map(item => [item, createAuditTopicSummary()])),
      reasons: [],
      errors: ["topic must be quant, varc, lrdi, or all"],
    };
  }

  const byTopic = Object.fromEntries(ASSESSMENT_TOPICS.map(item => [item, createAuditTopicSummary()]));
  const archiveMap = new Map();
  const reasons = [];
  const errors = [];

  for (const auditTopic of topics) {
    let rows = [];
    try {
      rows = await fetchQuestionsForAudit(auditTopic, limitPerTopic);
    } catch (err) {
      errors.push(`quality audit failed for ${auditTopic}: ${shortError(err)}`);
      continue;
    }

    byTopic[auditTopic].scanned += rows.length;
    for (const row of rows) {
      const result = auditQuestionQuality(row);
      if (result.severity === "archive") {
        const reason = `Archived by audit: ${result.reasons.join("; ")}`;
        archiveMap.set(row.id, { id: row.id, topic: row.topic, reason });
        reasons.push({ id: row.id, topic: row.topic, action: "archive", reason });
      } else if (result.severity === "warn") {
        byTopic[auditTopic].warnings += 1;
        reasons.push({
          id: row.id,
          topic: row.topic,
          action: "warn",
          reason: result.reasons.join("; "),
        });
      }
    }

    const duplicateResult = await auditDuplicateQuestionsByTopic(auditTopic, { limitPerTopic });
    if (duplicateResult.errors?.length) {
      errors.push(...duplicateResult.errors.map(error => `duplicate audit failed for ${auditTopic}: ${error}`));
    }
    for (const candidate of duplicateResult.archiveCandidates || []) {
      if (!archiveMap.has(candidate.id)) {
        reasons.push({ id: candidate.id, topic: candidate.topic, action: "archive", reason: candidate.reason });
      }
      archiveMap.set(candidate.id, candidate);
    }
  }

  for (const candidate of archiveMap.values()) {
    byTopic[candidate.topic].archiveCandidates += 1;
  }

  let archived = 0;
  if (!dryRun) {
    for (const candidate of archiveMap.values()) {
      try {
        await archiveAuditCandidate(candidate);
        archived += 1;
        byTopic[candidate.topic].archived += 1;
      } catch (err) {
        errors.push(`archive failed for ${candidate.id}: ${shortError(err)}`);
      }
    }
  }

  const scanned = Object.values(byTopic).reduce((sum, item) => sum + item.scanned, 0);
  const archiveCandidates = archiveMap.size;
  const warnings = Object.values(byTopic).reduce((sum, item) => sum + item.warnings, 0);

  return {
    dryRun,
    topic: normalizedTopic,
    scanned,
    archiveCandidates,
    archived,
    warnings,
    byTopic,
    reasons,
    errors,
  };
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
  const results = [];

  for (const topic of ASSESSMENT_TOPICS) {
    let activeCount = null;
    let requestCount = 3;
    try {
      activeCount = await getActiveQuestionCount(topic);
      if (activeCount >= BANK_MIN_ACTIVE_PER_TOPIC && !bypassCapacity) {
        console.log(`[assessment/preload] ${topic} capacity sufficient: ${activeCount}/${BANK_MIN_ACTIVE_PER_TOPIC}, skipped`);
        results.push({
          topic,
          skipped: true,
          reason: "capacity sufficient",
          activeCount,
          minRequired: BANK_MIN_ACTIVE_PER_TOPIC,
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

      const capacityLog = activeCount >= BANK_MIN_ACTIVE_PER_TOPIC
        ? `bypassing capacity: ${activeCount}/${BANK_MIN_ACTIVE_PER_TOPIC}`
        : `below capacity: ${activeCount}/${BANK_MIN_ACTIVE_PER_TOPIC}`;
      if (activeCount < BANK_MIN_ACTIVE_PER_TOPIC) {
        const needed = BANK_MIN_ACTIVE_PER_TOPIC - activeCount;
        requestCount = Math.min(PRELOAD_MAX_REFILL_PER_TOPIC, needed + PRELOAD_ACCEPTANCE_BUFFER);
      }
      console.log(`[assessment/preload] ${topic} ${capacityLog}, generating ${requestCount}`);
      const result = await withTimeout(
        refillQuestionBank({ topic, count: requestCount }),
        `preload ${topic}`,
        PRELOAD_TOPIC_TIMEOUT_MS
      );
      results.push({
        ...result,
        skipped: false,
        reason: "generated",
        activeCount,
        minRequired: BANK_MIN_ACTIVE_PER_TOPIC,
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
        minRequired: BANK_MIN_ACTIVE_PER_TOPIC,
        requested: requestCount,
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
