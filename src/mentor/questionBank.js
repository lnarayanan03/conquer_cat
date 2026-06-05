import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { ASSESSMENT_TOPICS, getAssessmentQuestionCount, getAssessmentTopicCounts } from "./assessmentCounts.js";

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { transport: ws },
    })
  : null;

const WRONG_RETRY_DAYS = 3;
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
  if (seen < 8) return false;
  return correct / Math.max(seen, 1) >= 0.8;
}

function highValueScore(q) {
  const seen = Number(q?.times_seen || 0);
  const correct = Number(q?.times_correct || 0);
  const correctness = seen > 0 ? correct / seen : 0;
  const difficulty = q?.difficulty === "hard" ? 3 : q?.difficulty === "cat_level" ? 2 : 0;
  return difficulty + (1 - correctness);
}

async function fetchQuestionCandidates(topic, { excludeIds = [], includeIds = [], freshOnly = false, highValueOnly = false, limit = 10 } = {}) {
  if (!supabase) return [];
  let query = supabase
    .from("questions")
    .select("id, topic, difficulty, question_text, options, correct_answer, explanation, source, cat_year, times_seen, times_correct")
    .eq("topic", topic)
    .eq("is_archived", false)
    .limit(Math.max(limit * 6, 24));

  if (includeIds.length > 0) query = query.in("id", includeIds);
  if (excludeIds.length > 0) query = query.not("id", "in", `(${excludeIds.join(",")})`);
  if (freshOnly) {
    // Freshness is primarily enforced by excluding user-attempted question ids.
    query = query.order("times_seen", { ascending: true });
  } else if (highValueOnly) {
    query = query.in("difficulty", ["cat_level", "hard"]);
  }

  const { data } = await query;
  let rows = (data || []).filter(q => !isOverusedLowValue(q));
  if (highValueOnly) {
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
