import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
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
    return Math.round(q + v + l + vp + hrs + lc + passage)
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

app.post("/api/chat", async (req, res) => {
  const { messages, daysLeft, totals, dayNum, todayData, mode = "prep", userName = "", startDate = "", interviewDate = "", catResult = "", catPercentile = "" } = req.body;
  const systemText = buildMentorSystem(daysLeft, totals, dayNum, todayData, mode, userName, startDate, interviewDate, catResult, catPercentile);
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 400,
        system: [
          {
            type: "text",
            text: systemText,
            cache_control: { type: "ephemeral" }
          }
        ],
        messages,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search"
          }
        ],
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to reach Anthropic" });
  }
});

app.post("/api/mentor/greet", async (req, res) => {
  const { daysLeft, totals, dayNum, todayData, mode = "prep", userName = "", startDate = "", interviewDate = "", catResult = "", catPercentile = "" } = req.body;
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }
  const systemText = buildMentorSystem(daysLeft, totals, dayNum, todayData, mode, userName, startDate, interviewDate, catResult, catPercentile);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 250,
        system: [
          {
            type: "text",
            text: systemText,
            cache_control: { type: "ephemeral" }
          }
        ],
        messages: [{
          role: "user",
          content: "Give me: 1) A warm greeting checking in on my prep, 2) One specific CAT success story or insight from exam history to motivate me, 3) One sharp tip for today based on where I am in my 200-day journey. Keep it punchy and real. Max 150 words."
        }],
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search"
          }
        ],
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to reach Anthropic" });
  }
});

app.post("/api/user/check", async (req, res) => {
  if (!supabase) return res.json({ exists: false });
  const { userId } = req.body;
  try {
    const { data } = await supabase
      .from("users").select("*").eq("id", userId).single();
    if (data) return res.json({ exists: true, user: data });
    return res.json({ exists: false });
  } catch {
    return res.json({ exists: false });
  }
});

app.post("/api/user/init", async (req, res) => {
  if (!supabase) return res.json({ ok: true });
  const { userId, name, startDate, gender, skinTone, hairStyle, hairColor, shirtColor, hasGlasses, hasBeard } = req.body;
  try {
    await supabase.from("users").upsert(
      { id: userId, name, start_date: startDate, gender, skin_tone: skinTone, hair_style: hairStyle, hair_color: hairColor, shirt_color: shirtColor, has_glasses: hasGlasses, has_beard: hasBeard },
      { onConflict: "id" }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/log/save", async (req, res) => {
  if (!supabase) return res.json({ ok: true });
  const { userId, date, dayData } = req.body;
  try {
    await supabase.from("daily_logs").upsert(
      { user_id: userId, log_date: date, ...dayData },
      { onConflict: "user_id,log_date" }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

app.get("/api/log/all/:userId", async (req, res) => {
  if (!supabase) return res.json({});
  try {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", req.params.userId);
    if (error) throw error;
    const formatted = {};
    (data || []).forEach(row => {
      const { user_id, log_date, ...rest } = row;
      formatted[log_date] = rest;
    });
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

app.use(express.static(join(__dirname, "dist")));

app.get("/{*path}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.on("error", err => console.error(err));
