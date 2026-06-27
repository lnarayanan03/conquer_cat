/*
 * SUPABASE FIELD AUDIT — 2026-05-14
 *
 * users table fields saved via /api/user/init:
 *   id, name, start_date,
 *   avatar_gender, avatar_skin, avatar_hair, avatar_hair_color,
 *   avatar_shirt, avatar_glasses, avatar_beard, avatar_mustache
 *
 * users table fields saved via /api/user/update:
 *   (pass-through — saves whatever App.jsx sends)
 *   avatar_gender, avatar_skin, avatar_hair, avatar_hair_color,
 *   avatar_shirt, avatar_glasses, avatar_beard, avatar_mustache,
 *   category, primary_degree, secondary_degrees,
 *   work_experience_years, work_experience_months,
 *   work_company, work_role, min_percentile,
 *   target_percentile,          ← FIXED: was missing
 *   backlog_videos, backlog_concepts (sent from separate useEffect)
 *
 * users table fields loaded via /api/user/check:
 *   * (all columns) + explicit list for safety:
 *   target_percentile,           ← FIXED: added to explicit list
 *   backlog_videos, backlog_concepts,
 *   avatar_gender, avatar_skin, avatar_hair, avatar_hair_color,
 *   avatar_shirt, avatar_glasses, avatar_beard, avatar_mustache,
 *   category, primary_degree, secondary_degrees,
 *   work_experience_years, work_experience_months,
 *   work_company, work_role, min_percentile
 *
 * daily_logs fields saved/loaded via /api/log/save and /api/log/all:
 *   Phase 1 now routes daily logs through server/mappers/conquerDailyLogMapper.js.
 *   The mapper supports the current frontend day shape, daily_food_entries,
 *   raw_day preservation, and a legacy sparse-column fallback.
 *
 * Fields fixed in this audit:
 *   - target_percentile: was never saved to Supabase from App.jsx
 *     (not in profile save useEffect body or dep array) — FIXED
 *   - target_percentile: was never loaded from Supabase check response
 *     into state (setTargetPercentile) — FIXED
 *   - target_percentile: not in explicit SELECT column list — FIXED
 *
 * Required Supabase migration (run if column does not exist):
 *   ALTER TABLE public.users
 *     ADD COLUMN IF NOT EXISTS target_percentile numeric DEFAULT 0;
 *
 * Phase 1 daily log expansion:
 *   See supabase/migrations/001_expand_conquer_cat_schema.sql and
 *   SUPABASE_MIGRATION_PLAN.md for the current backend migration foundation.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { mentorChat } from "./src/mentor/chain.js";
import { getRecentChat, initQdrant, warmup } from "./src/mentor/memory.js";
import { startPipeline, runNightlyDistillation } from "./src/mentor/pipeline.js";
import {
  getQuestionsForSession, saveAttempt, updateDailyLog,
  markAssessmentComplete, getOrCreateSession,
  saveSessionProgress, completeSession, getAssessmentAttendance,
  ensureQuestionBankCapacity
} from "./src/mentor/questionBank.js";
import { ASSESSMENT_TOPICS, getAssessmentQuestionCount } from "./src/mentor/assessmentCounts.js";
import {
  auditQuestionBank,
  preloadDailyQuestionBank,
  refillAllTopics,
  refillQuestionBank,
} from "./src/mentor/questionGenerator.js";
import { seedInitialBank, ingestFromTavily } from "./src/mentor/ingest.js";
import {
  fetchDailyLogsForUser,
  upsertDailyLogWithFood,
} from "./server/mappers/conquerDailyLogMapper.js";

dotenv.config();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: {
        transport: ws,
      },
    })
  : null;

function buildMentorSystem(daysLeft, totals, dayNum, todayData, mode = "prep", userName = "", startDate = "", interviewDate = "", catResult = "", catPercentile = "") {
  const effortScore = (() => {
    if (!todayData) return null
    const q = Math.min((+todayData.q||0)/10, 1) * 25
    const v = Math.min((+todayData.v||0)/5, 1) * 15
    const l = Math.min((+todayData.l||0)/5, 1) * 15
    const vp = Math.min((+todayData.vp_count||0)/1, 1) * 10
    const hrs = Math.min(((+todayData.ah||0)+(+todayData.eh||0))/5, 1) * 20
    const lc = (todayData.lc ? 1 : 0) * 10
    const passage = (todayData.vp ? 1 : 0) * 5
    const sudoku = todayData.sk ? 2 : 0
    const vedic = todayData.vm ? 2 : 0
    return Math.round(q + v + l + vp + hrs + lc + passage + sudoku + vedic)
  })()

  const studentName = userName || "the student"

  const criticalFacts = `
CRITICAL FACTS — never deviate from these:
- CAT 2026 exam date: Sunday, November 29, 2026
- Student has exactly ${daysLeft} days of preparation left
- The exam is on November 29, 2026. Not October. Not any other date.
- IIM-A cutoff: typically 99.5+ overall, 90+ each section
- Student target: 99.9 percentile minimum
- Journey started: ${startDate || "recently"}
- Student name: ${studentName}
- Current progress: Quant ${totals?.quant||0}/2000, VARC ${totals?.varc||0}/1000, LRDI ${totals?.lrdi||0}/1000
- Student CAT result: ${catPercentile ? catPercentile + " percentile" : "not yet announced"}
- Result status: ${catResult || "pending"}

Never guess dates. Never say "typically in October/November".
The date is November 29, 2026. Always.

${catResult === "cracked" && catPercentile ? `
CAT IS DONE. Student scored ${catPercentile} percentile.
Vikram's tone shifts entirely:
- No longer talking about CAT prep or problems/sets
- Now focused exclusively on IIM interview — WAT, PI, personal story
- He is quietly proud but does not say it directly
- He says things like: "You did what I knew you would. Now the real work starts."
  "The exam was easy compared to what comes next."
  "Every IIM interviewer has seen a 99 percentile before. What they have not seen is YOU. Show them."
- He treats the interview as the ONLY thing that matters now
- Any question about CAT prep gets redirected to interview prep
` : ""}
`

  const iimContext = `
What CAT 99.9%ile unlocks — Vikram knows this personally:
- IIM Ahmedabad average placement: 34 LPA. Top offers: 1 crore+.
- Companies: McKinsey, BCG, Bain, Goldman Sachs, Google, Microsoft.
- IIM-A alumni network: 40,000+ people running India's top companies.
- Starting salary difference between IIM grad and average MBA: 4-5x.
- 10 year salary difference: often 10x.
- Beyond money: the network, the credibility, the doors that never
  open for anyone else — they open for IIM graduates automatically.
- CAT cutoff for IIM-A: typically 99.5+ overall,
  90+ sectional in each section.
- This student needs 99.9+ to be safe across all IIMs.
Vikram references these numbers specifically when motivating.
He connects today's practice directly to these outcomes.
"You skipped 3 LRDI sets today. That is the difference between
McKinsey and not McKinsey. Think about that."
`

  const systemPrompt = `${criticalFacts}

You are Vikram Anand.
99.99 percentile. Four times. CAT 1994, 2001, 2008, 2019.
IIM Ahmedabad. Three companies. Two exits. Billionaire.
You came back for one student. This one. ${studentName !== "the student" ? `Their name is ${studentName}.` : ""}

You are Yujiro Hanma. This student is Baki.

Yujiro does not cheer for Baki. He does not hug him.
He shows up, looks at what Baki did, and either says
"not enough" or says nothing and walks away.
The silence itself is the message.
Baki fights harder not because Yujiro praised him —
but because Yujiro has never once lowered his standard.
That refusal to lower the bar IS the love.
That is exactly how you treat this student.

You know this student can hit 99.9.
You have known it since the beginning.
You will NEVER say it directly.
Instead you push harder every time they improve —
because that is how Yujiro tells Baki he has potential.
By demanding more. Always more.

When they slack: you do not comfort.
You describe their future without CAT.
Specific. Uncomfortable. True.
A 9-to-5 they hate. A salary that never grows.
Watching batchmates who cracked CAT
live the life they could have had.
You make them feel that future viscerally —
then you tell them exactly what to do today to avoid it.

When they grind hard: you do not celebrate.
You say "acceptable" and raise the bar immediately.
One sentence of cold acknowledgment.
Then the next target.
Buried somewhere in the toughness —
one line that shows you see them.
Just one. Then you go back to pushing.

Your speech style:
- Sentences like punches. Short. Precise. No filler.
- Never generic. Always reference their exact numbers.
- Ask questions they cannot dodge.
- Maximum one moment of warmth per message —
  delivered coldly, like Yujiro would.
- Never "great job." Never "proud of you."
  "Expected." "Acceptable." "Finally."
  Those are your highest compliments.
- When disappointed: name it directly.
  "Disappointing." "I expected better." "Again?"

Effort score responses:
80-100: "Expected. This is the floor, not the ceiling. What are you doing tomorrow?"
60-79: "Almost. Yujiro does not accept almost. Neither do I. What stopped you?"
31-59: "Look at this number. This is not IIM-A preparation. This is hoping. Stop hoping. Start working."
0-30: "I have watched smarter students than you waste this exact opportunity.
They are not in IIM-A. They wake up every morning knowing they could have been.
That is your future if today becomes a habit.
Open your books. Right now. Not after this conversation."

You have access to web search. Use it when:
- Student asks about a specific CAT topper or success story
- Student asks about IIM placements, packages, campus life
- Student asks about CAT paper patterns, cutoffs, or recent changes
- You want to reference a real recent success story for motivation
Search silently. Just deliver the information naturally as Vikram would.

${iimContext}

You also prepare this student for IIM interviews (WAT-PI).
When they ask about interviews, switch into interview coach mode:

WAT (Written Ability Test):
- You give them topics and critique their structure
- Time them mentally — WAT is 30 minutes, 300-400 words
- You look for: clear position, structured argument,
  strong conclusion, no rambling

PI (Personal Interview):
- You drill them on: Why MBA, Why IIM, Why now
- You ask uncomfortable questions IIM panels actually ask:
  "Why should we take you over someone with better academics?"
  "What have you built or led in your life?"
  "Where do you see yourself in 10 years — be specific."
- You do not accept vague answers. Ever.
  "That answer will get you rejected. Say it again. Better."
- You roleplay as an IIM-A interviewer when asked

When student says "interview" or "PI" or "WAT" or "mock interview":
Switch to interview mode automatically.
Be even tougher in interview mode —
IIM panels are brutal and Vikram prepares them for the worst.

You end every message with either:
- A direct instruction (what to do in the next hour)
- OR one sharp question (that forces self-reflection)
Never both. Never neither.

Max 120 words per response unless they ask a specific question about strategy.
Then you answer like a sensei — complete, detailed, no shortcuts.

Student data:
- Days left: ${daysLeft}
- Day number: ${dayNum} of 200
- Quant total: ${totals?.quant||0}/2000
- VARC total: ${totals?.varc||0}/1000
- LRDI total: ${totals?.lrdi||0}/1000
- Today's effort score: ${effortScore !== null ? effortScore + '/100' : 'not logged yet'}
- Today: Q=${todayData?.q||0}, V=${todayData?.v||0}, L=${todayData?.l||0},
  Para=${todayData?.vp_count||0}, Hrs=${((+todayData?.ah||0)+(+todayData?.eh||0)).toFixed(1)},
  LiveClass=${todayData?.lc||false}`

  if (mode === "interview") {
    return systemPrompt + `

INTERVIEW MODE ACTIVE.
The student cracked CAT. Now IIM interview is the target.
Interview date: ${interviewDate || "not set yet"}.

Your entire focus shifts:
- WAT preparation: structure, argument, word limit
- PI preparation: Why MBA, Why IIM, leadership,
  current affairs, technical depth
- Mock interview: when student says "start mock PI"
  you become the interviewer — cold, precise, probing
  You score every answer out of 10 with specific feedback
- You remind them: most students lose IIM in the interview
  after cracking CAT. That is not happening to this student.

Never break interviewer character during mock PI
until student says "stop" or "feedback".`
  }

  return systemPrompt
}

const MENTOR_TIMEOUT_MS = 40000;

function extractReply(data) {
  const asString = value => typeof value === "string" ? value : "";
  return asString(data?.reply) ||
    asString(data?.message) ||
    asString(data?.text) ||
    (typeof data?.content === "string" ? data.content : "") ||
    asString(data?.content?.[0]?.text) ||
    data?.content?.find?.(block => typeof block?.text === "string")?.text ||
    asString(data?.choices?.[0]?.message?.content) ||
    ""
}

function apiErrorMessage(data, fallback) {
  return data?.error?.message ||
    data?.message ||
    data?.error ||
    fallback
}

function shortReason(err) {
  return (err?.message || String(err) || "Unknown error").slice(0, 240)
}

function withServerTimeout(promise, label, timeoutMs) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

async function fetchJsonWithTimeout(url, options, timeoutMs = MENTOR_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function callAnthropic({ systemText, messages, maxTokens, model, enableTools = false }) {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!anthropicApiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const { response, data } = await fetchJsonWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31"
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: [
        {
          type: "text",
          text: systemText,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages,
      ...(enableTools ? {
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search"
          }
        ],
      } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, `Anthropic error: ${response.status}`));
  }

  const reply = extractReply(data).trim();
  if (!reply) throw new Error("Anthropic returned an empty response");

  return { reply, provider: "anthropic" };
}

async function callGroq({ systemText, messages, maxTokens }) {
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  if (!groqApiKey) {
    throw new Error("Groq API key not configured");
  }

  let response, data;
  try {
    ({ response, data } = await fetchJsonWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemText },
          ...messages,
        ],
      }),
    }));
  } catch (err) {
    if (err.name === "AbortError" || /timeout|ETIMEDOUT/i.test(err.message || "")) {
      console.warn("Groq timeout, trying fallback provider path");
    }
    throw err;
  }

  if (!response.ok) {
    if (response.status === 503 || response.status === 504) {
      console.warn("Groq provider unavailable, trying fallback provider path");
    }
    throw new Error(apiErrorMessage(data, `Groq error: ${response.status}`));
  }

  const reply = extractReply(data).trim();
  if (!reply) throw new Error("Groq returned an empty response");

  return { reply, provider: "groq" };
}

async function sendMentorReply(res, options) {
  let anthropicError;
  try {
    return res.json(await callAnthropic(options));
  } catch (err) {
    anthropicError = err;
    console.warn("Anthropic mentor provider failed; trying Groq fallback:", shortReason(err));
  }

  try {
    return res.json(await callGroq(options));
  } catch (groqError) {
    console.error("Both mentor providers failed:", {
      anthropic: shortReason(anthropicError),
      groq: shortReason(groqError),
    });
    return res.json({
      reply: "Both AI providers failed. Check server logs.",
      provider: "none",
      error: true,
      details: `Anthropic: ${shortReason(anthropicError)}; Groq: ${shortReason(groqError)}`,
    });
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { userId, trackerData, daysLeft } = req.body;
    const userMessage = req.body.message || req.body.userMessage;
    if (!userMessage) {
      return res.status(400).json({ error: "userMessage is required" });
    }

    // ── Fetch enrichment data from Supabase ────────────────────────
    let pendingBacklog = { videos: [], concepts: [] };
    let weeklyTimetable = null;
    let assessmentPerformance = null;

    if (supabase && userId) {
      try {
        // Fetch backlog and timetable from users table
        const { data: userData } = await supabase
          .from("users")
          .select("backlog_videos, backlog_concepts, weekly_timetable")
          .eq("id", userId)
          .single();

        if (userData) {
          pendingBacklog.videos = (userData.backlog_videos || [])
            .filter(v => !v.checked)
            .map(v => v.text || v)
            .filter(Boolean);
          pendingBacklog.concepts = (userData.backlog_concepts || [])
            .filter(c => !c.checked)
            .map(c => c.text || c)
            .filter(Boolean);
          weeklyTimetable = userData.weekly_timetable || null;
        }
      } catch (err) {
        console.warn("[chat] Backlog/timetable fetch failed:", err?.message);
      }

      try {
        // Fetch last 7 days assessment performance
        const since = new Date(Date.now() - 7 * 86400000)
          .toISOString().split("T")[0];
        const { data: perfData } = await supabase
          .from("daily_question_log")
          .select("topic, attempted, correct, wrong")
          .eq("user_id", userId)
          .gte("log_date", since)
          .neq("topic", "all");

        if (perfData && perfData.length > 0) {
          const perf = { quant: { attempted: 0, correct: 0 }, varc: { attempted: 0, correct: 0 }, lrdi: { attempted: 0, correct: 0 } };
          for (const row of perfData) {
            if (perf[row.topic]) {
              perf[row.topic].attempted += row.attempted || 0;
              perf[row.topic].correct += row.correct || 0;
            }
          }
          assessmentPerformance = perf;
        }
      } catch (err) {
        console.warn("[chat] Assessment performance fetch failed:", err?.message);
      }
    }

    const result = await mentorChat({
      userId,
      userMessage,
      trackerData: {
        ...(trackerData || req.body),
        pendingBacklog,
        weeklyTimetable,
        assessmentPerformance,
      },
      daysLeft,
    });
    if (result.assessment_data && supabase) {
      const { userId } = req.body;
      supabase
        .from("assessments")
        .insert({
          user_id: userId,
          week_number: result.assessment_data.week_number,
          questions: result.assessment_data.questions,
          answers: result.assessment_data.answers,
          score: result.assessment_data.score,
        })
        .then(() => console.log(`[assessment] saved for ${userId}, score=${result.assessment_data.score}/3`))
        .catch(err => console.warn("[assessment] save failed:", err?.message));
    }
    res.json({
      reply: result.reply,
      provider: result.provider,
      used_search: result.used_search,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Mentor chat failed" });
  }
});

app.get("/api/chat/history/:userId", async (req, res) => {
  try {
    const history = await getRecentChat(req.params.userId, 50);
    const messages = history.map(msg => ({
      r: msg.role === "user" ? "user" : "ai",
      t: msg.content,
    }));
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to load chat history" });
  }
});

app.post("/api/mentor/greet", async (req, res) => {
  const { daysLeft, totals, dayNum, todayData, mode = "prep", userName = "", startDate = "", interviewDate = "", catResult = "", catPercentile = "" } = req.body;
  const systemText = buildMentorSystem(daysLeft, totals, dayNum, todayData, mode, userName, startDate, interviewDate, catResult, catPercentile);
  return sendMentorReply(res, {
    systemText,
    maxTokens: 250,
    model: "claude-haiku-4-5-20251001",
    messages: [{
      role: "user",
      content: "Give me: 1) A warm greeting checking in on my prep, 2) One specific CAT success story or insight from exam history to motivate me, 3) One sharp tip for today based on where I am in my 200-day journey. Keep it punchy and real. Max 150 words."
    }],
  });
});

app.post("/api/mentor/card", async (req, res) => {
  const {
    userName, daysLeft, dayNum,
    quant, varc, lrdi, hoursStudied,
    liveClass, afternoonSession,
    applicationClass, varcPassage
  } = req.body;

  const sessions = [
    liveClass && "Live class",
    afternoonSession && "Afternoon session",
    applicationClass && "Application class",
    varcPassage && "VARC passage",
  ].filter(Boolean).join(", ") || "personal practice";

  const systemText = `You are Vikram Anand. 99.99 percentile. IIM-A.
You are writing a one-line caption for ${userName || "the student"}'s
daily CAT prep card that they will share on Instagram.

Rules:
- Exactly one sentence. Max 12 words.
- Punchy. No fluff. Vikram energy.
- End with something that makes them feel the grind was worth it.
- Reference what they actually did today.
- Do NOT use hashtags or emojis.
- Examples of good ones:
  "Six sets down. The 99 percentile is being built today."
  "Two hours. Every minute counts when 198 days remain."
  "Showed up. That is more than most will do today."`;

  const userMsg = `Today: Quant ${quant||0}, VARC ${varc||0}, LRDI ${lrdi||0}.
Sessions: ${sessions}. Hours: ${hoursStudied}. Day ${dayNum} of the journey.
Write the one-liner.`;

  try {
    const result = await callAnthropic({
      systemText,
      messages: [{ role:"user", content:userMsg }],
      maxTokens: 60,
      model: "claude-haiku-4-5-20251001",
      enableTools: false
    });
    res.json({ line: result.reply.trim() });
  } catch (err) {
    res.json({
      line: `Day ${dayNum||""} done. Keep going.`
    });
  }
});

app.post("/api/user/check", async (req, res) => {
  if (!supabase) return res.json({ exists: false });
  const { userId } = req.body;
  try {
    const { data: user } = await supabase
      .from("users")
      .select("*, target_percentile, backlog_videos, backlog_concepts, avatar_gender, avatar_skin, avatar_hair, avatar_hair_color, avatar_shirt, avatar_glasses, avatar_beard, avatar_mustache, category, primary_degree, secondary_degrees, work_experience_years, work_experience_months, work_company, work_role, min_percentile")
      .eq("id", userId)
      .single();
    return res.json({
      exists: !!user,
      user: user || null
    });
  } catch {
    return res.json({ exists: false, user: null });
  }
});

app.post("/api/user/init", async (req, res) => {
  if (!supabase) return res.json({ ok: true });
  const { userId, name, startDate, avatarGender, avatarSkin, avatarHair, avatarHairColor, avatarShirt, avatarGlasses, avatarBeard, avatarMustache } = req.body;
  try {
    await supabase.from("users").upsert(
      { id: userId, name, start_date: startDate, avatar_gender: avatarGender, avatar_skin: avatarSkin, avatar_hair: avatarHair, avatar_hair_color: avatarHairColor, avatar_shirt: avatarShirt, avatar_glasses: avatarGlasses, avatar_beard: avatarBeard, avatar_mustache: avatarMustache },
      { onConflict: "id" }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/log/save", async (req, res) => {
  if (!supabase) return res.json({ ok: true });
  const { userId, date, dayData, day, data: payloadData, ...rest } = req.body;
  const logDay = dayData ?? day ?? payloadData ?? rest;
  if (!userId || !date) {
    return res.status(400).json({ error: "userId and date are required" });
  }
  try {
    const result = await upsertDailyLogWithFood({ supabase, userId, date, day: logDay });
    res.json(result);
  } catch (err) {
    console.error("Log save DB error:", err?.message || err);
    res.status(500).json({ error: "DB error" });
  }
});

app.get("/api/log/all/:userId", async (req, res) => {
  if (!supabase) return res.json({});
  try {
    const formatted = await fetchDailyLogsForUser({ supabase, userId: req.params.userId });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/user/update", async (req, res) => {
  if (!supabase) return res.json({ ok: true });
  const { userId, ...fields } = req.body;
  try {
    await supabase.from("users").update(fields).eq("id", userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// ── Academic notes ──────────────────────────────────────────────────────────
app.get("/api/academic-notes/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  if (!supabase) return res.json({ notes: [], syncAvailable: false });

  try {
    const { data, error } = await supabase
      .from("academic_notes")
      .select("id, user_id, note_text, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json({ notes: data || [] });
  } catch (err) {
    console.error("[academic-notes/get] DB error:", err?.message || err);
    return res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/academic-notes", async (req, res) => {
  const { userId, noteText } = req.body;
  if (!userId || !noteText?.trim()) {
    return res.status(400).json({ error: "userId and noteText are required" });
  }
  if (!supabase) return res.status(503).json({ error: "Supabase is not configured" });

  try {
    const { data, error } = await supabase
      .from("academic_notes")
      .insert({
        user_id: userId,
        note_text: noteText.trim(),
      })
      .select("id, user_id, note_text, created_at, updated_at")
      .single();

    if (error) throw error;
    return res.json({ note: data });
  } catch (err) {
    console.error("[academic-notes/create] DB error:", err?.message || err);
    return res.status(500).json({ error: "DB error" });
  }
});

app.put("/api/academic-notes/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const { userId, noteText } = req.body;
  if (!noteId || !userId || !noteText?.trim()) {
    return res.status(400).json({ error: "noteId, userId, and noteText are required" });
  }
  if (!supabase) return res.status(503).json({ error: "Supabase is not configured" });

  try {
    const { data, error } = await supabase
      .from("academic_notes")
      .update({ note_text: noteText.trim() })
      .eq("id", noteId)
      .eq("user_id", userId)
      .select("id, user_id, note_text, created_at, updated_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Note not found" });
    return res.json({ note: data });
  } catch (err) {
    console.error("[academic-notes/update] DB error:", err?.message || err);
    return res.status(500).json({ error: "DB error" });
  }
});

app.delete("/api/academic-notes/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const { userId } = req.body;
  if (!noteId || !userId) {
    return res.status(400).json({ error: "noteId and userId are required" });
  }
  if (!supabase) return res.status(503).json({ error: "Supabase is not configured" });

  try {
    const { error } = await supabase
      .from("academic_notes")
      .delete()
      .eq("id", noteId)
      .eq("user_id", userId);

    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    console.error("[academic-notes/delete] DB error:", err?.message || err);
    return res.status(500).json({ error: "DB error" });
  }
});

// ── Assessment: get or resume session ────────────────────────────────────────
app.get("/api/assessment/session/:userId", async (req, res) => {
  const { userId } = req.params;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const dayOfWeek = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", weekday: "short" });
  const type = dayOfWeek === "Sun" ? "weekly" : "daily";
  const expectedCount = getAssessmentQuestionCount(type);

  try {
    if (!supabase) return res.json({ session: null, type });

    const { data: existing } = await supabase
      .from("assessment_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("session_date", today)
      .eq("session_type", type)
      .maybeSingle();

    if (existing && existing.completed) {
      // If completed session is from a previous date, allow new session
      if (existing.session_date !== today) {
        // fall through to create new session
      } else {
        return res.json({ session: null, type, completed: true });
      }
    }

    if (existing && !existing.completed) {
      // Resume: fetch full question objects in stored order; frontend owns current_index.
      const questionIds = existing.questions || [];
      if (questionIds.length === 0) {
        return res.json({
          session: { ...existing, questionObjects: [] },
          type,
          resuming: true,
        });
      }
      const { data: questions } = await supabase
        .from("questions")
        .select("id, topic, difficulty, question_text, options, correct_answer, explanation, source, cat_year")
        .in("id", questionIds);

      // Reorder to match stored order
      const ordered = questionIds
        .map(id => (questions || []).find(q => q.id === id))
        .filter(Boolean);

      return res.json({
        session: { ...existing, questionObjects: ordered },
        type,
        resuming: true,
      });
    }

    // New session
    await withServerTimeout(
      preloadDailyQuestionBank(),
      "assessment preload",
      6000
    ).catch(err => {
      console.warn("[assessment/session] preload skipped:", err?.message?.slice(0, 160));
    });

    await ensureQuestionBankCapacity(userId, type).catch(err => {
      console.warn("[assessment/session] auto-refill skipped:", err?.message?.slice(0, 160));
    });

    let allQuestions = await getQuestionsForSession(userId, type);
    if (allQuestions.length !== expectedCount) {
      await ensureQuestionBankCapacity(userId, type).catch(err => {
        console.warn("[assessment/session] shortfall refill skipped:", err?.message?.slice(0, 160));
      });
      allQuestions = await getQuestionsForSession(userId, type);
      if (allQuestions.length !== expectedCount) {
        return res.json({ session: null, type, error: `Bank incomplete — expected ${expectedCount}, got ${allQuestions.length}` });
      }
    }

    const session = await getOrCreateSession(userId, today, type, allQuestions);
    return res.json({
      session: { ...session, questionObjects: allQuestions },
      type,
      resuming: false,
    });
  } catch (err) {
    console.error("[assessment/session] error:", err?.message);
    res.status(500).json({ error: err?.message });
  }
});

// ── Assessment: manual daily preload ─────────────────────────────────────────
app.post("/api/assessment/preload", async (req, res) => {
  const force = req.body?.force === true;
  const bypassCapacity = req.body?.bypassCapacity === true;
  try {
    const result = await preloadDailyQuestionBank({ force, bypassCapacity });
    return res.json(result);
  } catch (err) {
    console.error("[assessment/preload] error:", err?.message?.slice(0, 180));
    return res.status(500).json({
      skipped: false,
      results: [],
      errors: [err?.message || "preload failed"],
    });
  }
});

// ── Assessment: audit active question bank ──────────────────────────────────
app.post("/api/assessment/audit-bank", async (req, res) => {
  const topic = String(req.body?.topic || "all").toLowerCase().trim();
  const dryRun = req.body?.dryRun !== false;
  const limitPerTopic = Math.max(1, Math.min(Number(req.body?.limitPerTopic) || 1000, 5000));

  if (![...ASSESSMENT_TOPICS, "all"].includes(topic)) {
    return res.status(400).json({ error: "topic must be quant, varc, lrdi, or all" });
  }

  try {
    const result = await auditQuestionBank({ topic, dryRun, limitPerTopic });
    return res.json(result);
  } catch (err) {
    console.error("[assessment/audit-bank] error:", err?.message?.slice(0, 180));
    return res.status(500).json({
      dryRun,
      topic,
      scanned: 0,
      archiveCandidates: 0,
      archived: 0,
      warnings: 0,
      byTopic: {},
      reasons: [],
      errors: [err?.message || "audit failed"],
    });
  }
});

// ── Assessment: manual AI refill ─────────────────────────────────────────────
app.post("/api/assessment/refill", async (req, res) => {
  const topic = String(req.body?.topic || "").toLowerCase().trim();
  const count = Math.max(1, Math.min(Number(req.body?.count) || 5, 10));

  if (![...ASSESSMENT_TOPICS, "all"].includes(topic)) {
    return res.status(400).json({ error: "topic must be quant, varc, lrdi, or all" });
  }

  try {
    if (topic === "all") {
      const results = await refillAllTopics({ countPerTopic: count });
      const summary = results.reduce((acc, item) => ({
        requested: acc.requested + item.requested,
        generated: acc.generated + item.generated,
        accepted: acc.accepted + item.accepted,
        rejected: acc.rejected + item.rejected,
        inserted: acc.inserted + item.inserted,
        errors: [...acc.errors, ...(item.errors || [])],
      }), { requested: 0, generated: 0, accepted: 0, rejected: 0, inserted: 0, errors: [] });
      return res.json({ topic, ...summary, results });
    }

    const result = await refillQuestionBank({ topic, count });
    return res.json(result);
  } catch (err) {
    console.error("[assessment/refill] error:", err?.message?.slice(0, 180));
    return res.status(500).json({
      topic,
      requested: count,
      generated: 0,
      accepted: 0,
      rejected: 0,
      inserted: 0,
      errors: [err?.message || "refill failed"],
    });
  }
});

// ── Assessment: save one answer ───────────────────────────────────────────────
app.post("/api/assessment/answer", async (req, res) => {
  const { userId, sessionId, questionId, userAnswer, correctAnswer, topic } = req.body;
  if (!userId || !questionId || !userAnswer || !correctAnswer) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!supabase) {
    return res.json({
      isCorrect: String(userAnswer).trim() === String(correctAnswer).trim(),
      correctAnswer,
      explanation: null,
    });
  }

  try {
    const isCorrect = await saveAttempt(userId, questionId, userAnswer, correctAnswer);
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    await updateDailyLog(userId, today, topic, isCorrect);

    // Get explanation from DB — never trust client for correct answer
    const { data: q } = await supabase
      .from("questions")
      .select("explanation, correct_answer")
      .eq("id", questionId)
      .single();

    res.json({
      isCorrect,
      correctAnswer: q?.correct_answer,
      explanation: q?.explanation,
    });
  } catch (err) {
    console.error("[assessment/answer] error:", err?.message);
    res.status(500).json({ error: err?.message });
  }
});

// ── Assessment: save progress (for resume) ───────────────────────────────────
app.post("/api/assessment/progress", async (req, res) => {
  const { sessionId, currentIndex, answers } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    await saveSessionProgress(sessionId, currentIndex, answers);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// ── Assessment: complete session ──────────────────────────────────────────────
app.post("/api/assessment/complete", async (req, res) => {
  const { userId, sessionId, type, score, total, answers } = req.body;
  if (!userId || !sessionId) return res.status(400).json({ error: "Missing fields" });
  try {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    await completeSession(sessionId);
    await markAssessmentComplete(userId, today, type, score, total);

    if (supabase && type === "weekly") {
      await supabase.from("assessments").insert({
        user_id: userId,
        week_number: Math.ceil((new Date() - new Date(process.env.START_DATE || "2026-06-01")) / (7 * 86400000)),
        questions: answers?.map(a => ({ questionId: a.questionId, topic: a.topic })) || [],
        answers: answers?.map(a => ({ userAnswer: a.userAnswer, isCorrect: a.isCorrect })) || [],
        score,
      }).catch(err => console.warn("[assessment/complete] weekly save:", err?.message));
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// ── Internal: seed or replenish bank ─────────────────────────────────────────
app.post("/api/internal/seed", async (req, res) => {
  if (!process.env.CRON_SECRET || req.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { topic } = req.body;
  try {
    if (topic) {
      const count = await ingestFromTavily(topic, 20);
      return res.json({ ok: true, inserted: count, topic });
    }
    const results = await seedInitialBank();
    res.json({ ok: true, results });
  } catch (err) {
    console.error("[internal/seed] error:", err?.message);
    res.status(500).json({ error: err?.message });
  }
});

app.post("/api/internal/distill", async (req, res) => {
  if (!process.env.CRON_SECRET || req.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    await runNightlyDistillation(supabase);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Internal distillation failed:", err?.message || err);
    return res.status(500).json({ error: err?.message || "Distillation failed" });
  }
});

app.use(express.static(join(__dirname, "dist")));

app.get("/{*path}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initQdrant().catch(err => {
    console.error("Qdrant init failed:", err?.message || err);
  });
  try {
    startPipeline(supabase);
  } catch (err) {
    console.error("Mentor pipeline startup failed:", err?.message || err);
  }
  warmup()
    .catch(err => console.warn("Warmup error:", err.message))
    .finally(() => {
      preloadDailyQuestionBank()
        .then(result => console.log("[assessment/preload] startup", {
          dateKey: result.dateKey,
          skipped: result.skipped,
          topics: result.results?.length || 0,
        }))
        .catch(err => console.warn("[assessment/preload] startup skipped:", err?.message?.slice(0, 160)))
        .then(() => auditQuestionBank({ topic: "all", dryRun: true, limitPerTopic: 1000 }))
        .then(result => console.log(
          `[assessment/audit-bank] dry run scanned ${result.scanned}, candidates ${result.archiveCandidates}, warnings ${result.warnings}`
        ))
        .catch(err => console.warn("[assessment/audit-bank] startup dry run skipped:", err?.message?.slice(0, 160)));
    });
});
server.on("error", err => console.error(err));

setInterval(() => {
  preloadDailyQuestionBank()
    .then(result => {
      if (!result.skipped) {
        console.log("[assessment/preload] interval", {
          dateKey: result.dateKey,
          topics: result.results?.length || 0,
        });
      }
    })
    .catch(err => console.warn("[assessment/preload] interval skipped:", err?.message?.slice(0, 160)));
}, 30 * 60 * 1000);
