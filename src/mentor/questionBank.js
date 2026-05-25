import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { transport: ws },
    })
  : null;

const TOPICS = ["quant", "varc", "lrdi"];
const WRONG_RETRY_DAYS = 3;
const MIN_BANK_SIZE = 50;

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

async function fetchQuestions(topic, difficulty, excludeIds, limit) {
  if (!supabase) return [];
  let query = supabase
    .from("questions")
    .select("id, topic, difficulty, question_text, options, explanation")
    .eq("topic", topic)
    .eq("is_archived", false)
    .limit(limit + 10);

  if (difficulty) query = query.eq("difficulty", difficulty);
  if (excludeIds.length > 0) query = query.not("id", "in", `(${excludeIds.join(",")})`);

  const { data } = await query;
  return (data || []).slice(0, limit);
}

async function pickQuestionsForTopic(userId, topic, count, preferHard = false) {
  const wrongIds = await getWrongQuestionIds(userId, topic, count);
  const seenIds = await getSeenQuestionIds(userId);

  const questions = [];

  // Step 1: wrong questions first (up to 1 for daily, up to 5 for weekly)
  if (wrongIds.length > 0) {
    const wrongQ = await fetchQuestions(
      topic,
      null,
      [],
      Math.ceil(count / 2)
    );
    const filtered = wrongQ.filter(q => wrongIds.includes(q.id));
    questions.push(...filtered.slice(0, Math.ceil(count / 2)));
  }

  // Step 2: unseen questions fill remaining slots
  const remaining = count - questions.length;
  if (remaining > 0) {
    const diff = preferHard ? "hard" : "cat_level";
    const excludeNow = [...seenIds, ...questions.map(q => q.id)];
    const unseen = await fetchQuestions(topic, diff, excludeNow, remaining);
    questions.push(...unseen);
  }

  // Step 3: fallback — any unseen regardless of difficulty
  if (questions.length < count) {
    const still = count - questions.length;
    const excludeNow = [...seenIds, ...questions.map(q => q.id)];
    const fallback = await fetchQuestions(topic, null, excludeNow, still);
    questions.push(...fallback);
  }

  return questions.slice(0, count);
}

export async function getQuestionsForSession(userId, type) {
  const countPerTopic = type === "weekly" ? 10 : 2;
  const allQuestions = [];

  for (const topic of TOPICS) {
    const qs = await pickQuestionsForTopic(userId, topic, countPerTopic, type === "weekly");
    allQuestions.push(...qs);
  }

  return allQuestions;
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

// ── Bank health check ────────────────────────────────────────────────────────

export async function getBankHealth() {
  if (!supabase) return {};
  const result = {};
  for (const topic of TOPICS) {
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("topic", topic)
      .eq("is_archived", false);
    result[topic] = count || 0;
  }
  return result;
}

export async function getDepletedTopics() {
  const health = await getBankHealth();
  return TOPICS.filter(t => health[t] < MIN_BANK_SIZE);
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
