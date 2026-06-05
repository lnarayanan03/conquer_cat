import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";
import { ASSESSMENT_TOPICS, getAssessmentQuestionCount, getAssessmentTopicCounts } from "./assessmentCounts.js";
import { refillQuestionBank } from "./questionGenerator.js";

dotenv.config();

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { transport: ws },
    })
  : null;

const WRONG_RETRY_DAYS = 3;
const REFILL_BATCH_SIZE = 5;
const REFILL_TIMEOUT_MS = 22000;
const CATEGORY_PLAN = {
  daily: {
    quant: ["fresh", "weak"],
    varc: ["weak", "fresh"],
    lrdi: ["high_value", "fresh"],
  },
  weekly: {
    quant: ["fresh", "weak", "high_value", "fallback", "fresh"],
    varc: ["fresh", "weak", "high_value", "fallback", "fresh"],
    lrdi: ["fresh", "fresh", "weak", "high_value", "fallback"],
  },
};

// ── Select questions for a session ──────────────────────────────────────────

async function getWrongQuestionIds(userId, topic, limit) {
  if (!supabase) return [];
  const cutoff = new Date(Date.now() - WRONG_RETRY_DAYS * 86400000).toISOString();
  const { data } = await supabase
    .from("user_question_attempts")
    .select("question_id")
    .eq("user_id", userId)
    .eq("is_correct", false)
    .gte("attempted_at", cutoff)
    .order("attempted_at", { ascending: false })
    .limit(limit * 3);
  return (data || []).map(r => r.question_id);
}

async function getSeenQuestionIds(userId) {
  if (!supabase) return [];
  const { data } = await supabase
    .from("user_question_attempts")
    .select("question_id")
    .eq("user_id", userId);
  return (data || []).map(r => r.question_id);
}

function isOverusedLowValue(q) {
  const seen = Number(q?.times_seen || 0);
  const correct = Number(q?.times_correct || 0);
  if (seen < 5) return false;
  const correctness = correct / Math.max(seen, 1);
  return correctness >= 0.8 && q?.keep_for_revision !== true && q?.mock_ready !== true;
}

function isPrimaryHighValue(q) {
  return q?.keep_for_revision === true ||
    q?.mock_ready === true ||
    Number(q?.cat_likelihood_score || 0) >= 8 ||
    Number(q?.importance_score || 0) >= 8;
}

function hasLowCorrectnessRatio(q) {
  const seen = Number(q?.times_seen || 0);
  if (seen === 0) return false;
  return Number(q?.times_correct || 0) / seen <= 0.45;
}

function highValueScore(q) {
  const seen = Number(q?.times_seen || 0);
  const correct = Number(q?.times_correct || 0);
  const correctness = seen > 0 ? correct / seen : 0;
  const difficulty = q?.difficulty === "hard" ? 3 : q?.difficulty === "cat_level" ? 2 : 0;
  const primary = isPrimaryHighValue(q) ? 8 : 0;
  const revision = q?.keep_for_revision ? 2 : 0;
  const mock = q?.mock_ready ? 2 : 0;
  const importance = Number(q?.importance_score || 0) / 2;
  const likelihood = Number(q?.cat_likelihood_score || 0) / 2;
  return primary + revision + mock + importance + likelihood + difficulty + (1 - correctness);
}

async function fetchQuestionCandidates(topic, { excludeIds = [], includeIds = [], freshOnly = false, highValueOnly = false, limit = 10 } = {}) {
  if (!supabase) return [];
  let query = supabase
    .from("questions")
    .select("*")
    .eq("topic", topic)
    .eq("is_archived", false)
    .limit(Math.max(limit * 6, 24));

  if (includeIds.length > 0) query = query.in("id", includeIds);
  if (excludeIds.length > 0) query = query.not("id", "in", `(${excludeIds.join(",")})`);
  if (freshOnly) {
    // Freshness is primarily enforced by excluding user-attempted question ids.
    query = query.order("times_seen", { ascending: true });
  } else if (highValueOnly) {
    query = query.order("times_seen", { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    console.warn(`[questionBank] candidate fetch failed for ${topic}: ${error.message?.slice(0, 140)}`);
    return [];
  }
  let rows = (data || []).filter(q => !isOverusedLowValue(q));
  if (highValueOnly) {
    rows = rows.filter(q =>
      isPrimaryHighValue(q) ||
      ["cat_level", "hard"].includes(q?.difficulty) ||
      hasLowCorrectnessRatio(q)
    );
    rows = rows.sort((a, b) => highValueScore(b) - highValueScore(a));
  }
  return rows.slice(0, limit);
}

async function pickOneByCategory(userId, topic, category, selectedIds) {
  const seenIds = await getSeenQuestionIds(userId);
  const excludeIds = [...new Set([...seenIds, ...selectedIds])];

  if (category === "weak") {
    const wrongIds = await getWrongQuestionIds(userId, topic, 8);
    if (wrongIds.length > 0) {
      const weak = await fetchQuestionCandidates(topic, {
        includeIds: wrongIds,
        excludeIds: selectedIds,
        limit: 1,
      });
      if (weak[0]) return weak[0];
    }
  }

  if (category === "fresh") {
    const fresh = await fetchQuestionCandidates(topic, {
      excludeIds,
      freshOnly: true,
      limit: 1,
    });
    if (fresh[0]) return fresh[0];
  }

  if (category === "high_value") {
    const wrongIds = await getWrongQuestionIds(userId, topic, 8);
    if (wrongIds.length > 0) {
      const wrongHighValue = await fetchQuestionCandidates(topic, {
        includeIds: wrongIds,
        excludeIds: selectedIds,
        highValueOnly: true,
        limit: 1,
      });
      if (wrongHighValue[0]) return wrongHighValue[0];
    }

    const highValue = await fetchQuestionCandidates(topic, {
      excludeIds: selectedIds,
      highValueOnly: true,
      limit: 1,
    });
    if (highValue[0]) return highValue[0];
  }

  const fallback = await fetchQuestionCandidates(topic, {
    excludeIds: selectedIds,
    limit: 1,
  });
  return fallback[0] || null;
}

export async function getQuestionsForSession(userId, type) {
  const topicCounts = getAssessmentTopicCounts(type);
  const categoryPlan = CATEGORY_PLAN[type] || CATEGORY_PLAN.daily;
  const allQuestions = [];
  const selectedIds = [];

  for (const topic of ASSESSMENT_TOPICS) {
    const count = topicCounts[topic] || 0;
    const categories = categoryPlan[topic] || [];
    for (let i = 0; i < count; i += 1) {
      const category = categories[i] || "fallback";
      const question = await pickOneByCategory(userId, topic, category, selectedIds);
      if (question) {
        allQuestions.push(question);
        selectedIds.push(question.id);
      }
    }
  }

  return allQuestions.slice(0, getAssessmentQuestionCount(type));
}

async function withTimeout(promise, label, timeoutMs = REFILL_TIMEOUT_MS) {
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

async function getActiveQuestions(topic) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("questions")
    .select("id")
    .eq("topic", topic)
    .eq("is_archived", false);
  if (error) {
    console.warn(`[questionBank] active count failed for ${topic}: ${error.message?.slice(0, 140)}`);
    return [];
  }
  return data || [];
}

export async function ensureQuestionBankCapacity(userId, type) {
  if (!supabase) return [];
  const topicCounts = getAssessmentTopicCounts(type);
  const seenIds = new Set(await getSeenQuestionIds(userId));
  const lowTopics = [];

  for (const topic of ASSESSMENT_TOPICS) {
    const required = topicCounts[topic] || 0;
    const active = await getActiveQuestions(topic);
    const unseen = active.filter(question => !seenIds.has(question.id));
    if (active.length < required + 5 || unseen.length < required) {
      lowTopics.push(topic);
    }
  }

  if (lowTopics.length === 0) return [];

  const results = [];
  for (const topic of lowTopics) {
    try {
      const result = await withTimeout(
        refillQuestionBank({ topic, count: REFILL_BATCH_SIZE }),
        `assessment ${topic} refill`
      );
      console.log(`[assessment/refill-auto] ${topic}: inserted ${result.inserted}/${result.requested}`);
      results.push(result);
    } catch (err) {
      console.warn(`[assessment/refill-auto] ${topic} skipped: ${err?.message?.slice(0, 160)}`);
      results.push({
        topic,
        requested: REFILL_BATCH_SIZE,
        generated: 0,
        accepted: 0,
        rejected: 0,
        inserted: 0,
        errors: [err?.message || "refill failed"],
      });
    }
  }

  return results;
}

// Future August Mock Test:
// Pull from mock_ready questions, mixing high-value revision, fresh unseen, and previous wrong questions.

// ── Save answer ──────────────────────────────────────────────────────────────

export async function saveAttempt(userId, questionId, userAnswer, correctAnswer) {
  if (!supabase) return;

  const isCorrect = String(userAnswer).trim() === String(correctAnswer).trim();

  // Check if already attempted before
  const { data: existing } = await supabase
    .from("user_question_attempts")
    .select("id, attempt_count")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .order("attempted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("user_question_attempts").insert({
    user_id: userId,
    question_id: questionId,
    user_answer: userAnswer,
    is_correct: isCorrect,
    attempt_count: existing ? existing.attempt_count + 1 : 1,
  });

  // Increment times_seen and times_correct on question
  await supabase.rpc("increment_question_stats", {
    q_id: questionId,
    correct: isCorrect,
  }).catch(() => {
    // RPC may not exist yet — silent fail, non-critical
  });

  return isCorrect;
}

// ── Daily question log upsert ────────────────────────────────────────────────

export async function updateDailyLog(userId, date, topic, isCorrect) {
  if (!supabase) return;

  const { data: existing } = await supabase
    .from("daily_question_log")
    .select("id, attempted, correct, wrong")
    .eq("user_id", userId)
    .eq("log_date", date)
    .eq("topic", topic)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("daily_question_log")
      .update({
        attempted: existing.attempted + 1,
        correct: isCorrect ? existing.correct + 1 : existing.correct,
        wrong: isCorrect ? existing.wrong : existing.wrong + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("daily_question_log").insert({
      user_id: userId,
      log_date: date,
      topic,
      attempted: 1,
      correct: isCorrect ? 1 : 0,
      wrong: isCorrect ? 0 : 1,
    });
  }
}

// ── Mark assessment complete ─────────────────────────────────────────────────

export async function markAssessmentComplete(userId, date, type, score, total) {
  if (!supabase) return;
  await supabase
    .from("daily_question_log")
    .upsert({
      user_id: userId,
      log_date: date,
      topic: "all",
      assessment_taken: true,
      assessment_type: type,
      assessment_score: score,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,log_date,topic" });
}

// ── Assessment attendance for Vikram injection ───────────────────────────────

export async function getAssessmentAttendance(userId, days = 14) {
  if (!supabase) return null;
  const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];

  const { data } = await supabase
    .from("daily_question_log")
    .select("log_date, assessment_taken, assessment_type, assessment_score, skipped")
    .eq("user_id", userId)
    .eq("topic", "all")
    .gte("log_date", since)
    .order("log_date", { ascending: false });

  if (!data || data.length === 0) return null;

  const taken = data.filter(r => r.assessment_taken).length;
  const skipped = data.filter(r => r.skipped).length;
  const lastTaken = data.find(r => r.assessment_taken);
  const daysSinceLast = lastTaken
    ? Math.floor((Date.now() - new Date(lastTaken.log_date).getTime()) / 86400000)
    : null;

  // Streak
  let streak = 0;
  for (const row of data) {
    if (row.assessment_taken) streak++;
    else break;
  }

  return { taken, skipped, total: data.length, daysSinceLast, streak };
}

// ── Session management (resume support) ─────────────────────────────────────

export async function getOrCreateSession(userId, date, type, questions) {
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("session_date", date)
    .eq("session_type", type)
    .maybeSingle();

  if (existing && !existing.completed) return existing;
  if (existing && existing.completed) return null;

  const { data: created } = await supabase
    .from("assessment_sessions")
    .insert({
      user_id: userId,
      session_date: date,
      session_type: type,
      questions: questions.map(q => q.id),
      answers: [],
    })
    .select()
    .single();

  return created;
}

export async function saveSessionProgress(sessionId, currentIndex, answers) {
  if (!supabase) return;
  await supabase
    .from("assessment_sessions")
    .update({ current_index: currentIndex, answers })
    .eq("id", sessionId);
}

export async function completeSession(sessionId) {
  if (!supabase) return;
  await supabase
    .from("assessment_sessions")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", sessionId);
}
