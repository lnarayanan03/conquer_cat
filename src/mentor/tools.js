import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CAT_EXAM_DATE = new Date("2026-11-29T00:00:00+05:30");
const IST_TIME_ZONE = "Asia/Kolkata";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function getIstParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function getTimeOfDay(hour) {
  if (hour < 5) return "late-night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function buildScopedQuery(query) {
  const normalized = query.toLowerCase();

  if (normalized.includes("why cat") || normalized.includes("what will cat do") || normalized.includes("cat help")) {
    return "CAT aspirant success story IIM changed my life";
  }

  if (normalized.includes("motivation") || normalized.includes("inspiration") || normalized.includes("inspire")) {
    return "CAT topper journey struggle success 2024 2025";
  }

  if (normalized.includes("worth it") || normalized.includes("iim worth") || normalized.includes("cat worth")) {
    return "IIM alumni life career impact real story";
  }

  if (normalized.includes("raghuram rajan")) {
    return "Raghuram Rajan IIM Ahmedabad CAT journey";
  }

  return `${query} IIM CAT percentile success story alumni example`;
}

export const searchTool = tool(
  async ({ query }) => {
    const scopedQuery = buildScopedQuery(query);
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${requireEnv("TAVILY_API_KEY")}`,
      },
      body: JSON.stringify({
        query: scopedQuery,
        max_results: 3,
        search_depth: "basic",
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || `Tavily search failed with ${response.status}`);
    }

    return JSON.stringify(
      (data.results || []).slice(0, 3).map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
      }))
    );
  },
  {
    name: "tavily_search_results",
    description: "Search for real CAT aspirant success stories, IIM alumni journeys, CAT topper struggles and breakthroughs, IIM placement data, campus life, and why CAT changed real people's lives. MUST be called when the student asks why CAT matters, needs motivation, mentions specific toppers or alumni, expresses doubt about CAT being worth it, or asks about real people who cracked CAT. Search silently — deliver findings as Vikram's own knowledge.",
    schema: z.object({
      query: z.string().describe("A search query about CAT motivation, IIM/CAT alumni examples, CAT success stories, IIM life, placements, or CAT/IIM career impact."),
    }),
  }
);

searchTool.maxResults = 3;

export const timeTool = tool(
  async () => {
    const now = new Date();
    const parts = getIstParts(now);
    const hour = Number(parts.hour);
    const daysLeft = Math.max(0, Math.ceil((CAT_EXAM_DATE.getTime() - now.getTime()) / 86400000));

    return JSON.stringify({
      date: `${parts.year}-${parts.month}-${parts.day}`,
      time: `${parts.hour}:${parts.minute}:${parts.second}`,
      timeZone: IST_TIME_ZONE,
      timeOfDay: getTimeOfDay(hour),
      daysLeft,
      weeksLeft: Number((daysLeft / 7).toFixed(1)),
    });
  },
  {
    name: "current_ist_time",
    description: "Get the current IST date/time, time of day, days remaining to CAT 2026, and weeks remaining.",
    schema: z.object({}),
  }
);

export const iimPercentileTool = tool(
  async ({ category, tier }) => {
    const cutoffs = {
      "General": { oldIIM: 99.5, babyIIM: 97.0, newIIM: 95.0 },
      "OBC-NCL": { oldIIM: 97.0, babyIIM: 92.0, newIIM: 88.0 },
      "SC": { oldIIM: 90.0, babyIIM: 85.0, newIIM: 80.0 },
      "ST": { oldIIM: 85.0, babyIIM: 75.0, newIIM: 70.0 },
      "EWS": { oldIIM: 98.0, babyIIM: 95.0, newIIM: 92.0 },
      "PWD": { oldIIM: 80.0, babyIIM: 72.0, newIIM: 65.0 },
    };
    const data = cutoffs[category] || cutoffs["General"];
    if (tier) {
      const val = data[tier];
      return `Minimum percentile for ${category} in ${tier}: ${val}%`;
    }
    return `Minimum percentiles for ${category}:
IIM A/B/C: ${data.oldIIM}%
IIM K/L/I/S/T: ${data.babyIIM}%
New IIMs: ${data.newIIM}%
Note: Sectional cutoffs also apply (typically 80-85%ile per section).`;
  },
  {
    name: "iimPercentileCalculator",
    description: "Calculate minimum CAT percentile needed for IIM admission based on student category and IIM tier. Use when student asks about their chances, cutoffs, or what percentile they need.",
    schema: z.object({
      category: z.enum(["General", "OBC-NCL", "SC", "ST", "EWS", "PWD"])
        .describe("Student reservation category"),
      tier: z.enum(["oldIIM", "babyIIM", "newIIM"])
        .optional()
        .describe("IIM tier: oldIIM=ABC, babyIIM=KLIST, newIIM=others"),
    }),
  }
);

function evaluateMathFallback(expression) {
  const allowedFunctions = {
    sqrt: Math.sqrt,
    abs: Math.abs,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    min: Math.min,
    max: Math.max,
    pow: Math.pow,
  };
  const fnNames = Object.keys(allowedFunctions);
  if (!/^[0-9+\-*/%().,\sA-Za-z^]+$/.test(expression)) {
    throw new Error("Expression contains unsupported characters");
  }
  const names = expression.match(/[A-Za-z]+/g) || [];
  const unknown = names.find(name => !fnNames.includes(name));
  if (unknown) throw new Error(`Unsupported function: ${unknown}`);
  const normalized = expression.replace(/\^/g, "**");
  return Function(...fnNames, `"use strict"; return (${normalized});`)(...fnNames.map(name => allowedFunctions[name]));
}

export const mathCalculatorTool = tool(
  async ({ expression }) => {
    try {
      let result;
      try {
        const math = await import("mathjs");
        result = math.evaluate(expression);
      } catch (err) {
        if (err?.code !== "ERR_MODULE_NOT_FOUND" && !/Cannot find package 'mathjs'/.test(err?.message || "")) {
          throw err;
        }
        result = evaluateMathFallback(expression);
      }
      return `${expression} = ${result}`;
    } catch (err) {
      return `Could not evaluate: ${err.message}`;
    }
  },
  {
    name: "mathCalculator",
    description: "Evaluate mathematical expressions. Use for percentages, averages, score calculations, time calculations, or any math the student needs.",
    schema: z.object({
      expression: z.string()
        .describe("Math expression to evaluate e.g. '(45/60)*100' or 'sqrt(144)'"),
    }),
  }
);

// ── CAT Assessment Tool ───────────────────────────────────────────────────────

const CAT_QUESTION_BANK = {
  quant: [
    {
      difficulty: "medium",
      question: "A shopkeeper marks his goods 60% above cost price and allows a 25% discount on the marked price. What is his profit percentage?",
      options: ["15%", "20%", "25%", "35%"],
      correctAnswer: "20%",
      explanation: "Let CP = 100. MP = 160. SP = 160 × 0.75 = 120. Profit = 20. Profit% = 20%.",
    },
    {
      difficulty: "medium",
      question: "The average of 5 consecutive odd numbers is 35. What is the largest of these numbers?",
      options: ["37", "39", "41", "43"],
      correctAnswer: "39",
      explanation: "The middle (3rd) number equals the average = 35. The 5 numbers are 31, 33, 35, 37, 39. Largest = 39.",
    },
    {
      difficulty: "cat_level",
      question: "A boat travels 24 km upstream in 6 hours. The speed of the stream is one-third the speed of the boat in still water. How long does the boat take to travel 32 km downstream?",
      options: ["2 hours", "3 hours", "4 hours", "5 hours"],
      correctAnswer: "4 hours",
      explanation: "Upstream speed = 24/6 = 4 km/h. Let boat speed = b, stream = b/3. Then b − b/3 = 2b/3 = 4, so b = 6 km/h and stream = 2 km/h. Downstream speed = 8 km/h. Time = 32/8 = 4 hours.",
    },
    {
      difficulty: "cat_level",
      question: "A alone can complete a work in 12 days and B alone in 18 days. They work together for 4 days, then A leaves. How many more days will B take to finish the remaining work?",
      options: ["8 days", "9 days", "10 days", "12 days"],
      correctAnswer: "8 days",
      explanation: "Combined rate = 1/12 + 1/18 = 5/36 per day. Work in 4 days = 20/36 = 5/9. Remaining = 4/9. B completes it in (4/9) ÷ (1/18) = 8 days.",
    },
    {
      difficulty: "hard",
      question: "If 2^x = 3^y = 6^(−z), what is the value of 1/x + 1/y?",
      options: ["−1/z", "1/z", "−z", "z"],
      correctAnswer: "−1/z",
      explanation: "Let k = 2^x = 3^y = 6^(−z). Then 2 = k^(1/x), 3 = k^(1/y), 6 = k^(−1/z). Since 6 = 2 × 3: k^(−1/z) = k^(1/x + 1/y). Therefore 1/x + 1/y = −1/z.",
    },
  ],
  varc: [
    {
      difficulty: "medium",
      question: "Choose the word that best fills the blank:\n\n\"The scientist's __________ approach to the experiment — meticulously documenting every variable and repeatedly testing each hypothesis — yielded results that were widely accepted by the research community.\"",
      options: ["haphazard", "rigorous", "impulsive", "perfunctory"],
      correctAnswer: "rigorous",
      explanation: "The description 'meticulously documenting every variable and repeatedly testing' signals a careful, thorough approach. 'Rigorous' means extremely thorough and careful — the only option consistent with wide acceptance of results.",
    },
    {
      difficulty: "cat_level",
      question: "Read the argument and identify the logical flaw:\n\n\"A recent study found that people who drink coffee regularly live longer than non-coffee drinkers. Therefore, drinking coffee causes people to live longer.\"\n\nWhich of the following best describes the flaw?",
      options: [
        "It overgeneralises from a small sample to the entire population.",
        "It confuses correlation with causation.",
        "It ignores the role of genetics in determining lifespan.",
        "It relies on anecdotal evidence rather than statistical data.",
      ],
      correctAnswer: "It confuses correlation with causation.",
      explanation: "The argument jumps from a correlation (coffee drinkers live longer) to a causal claim (coffee causes longer life). Correlation does not imply causation — this is the classic logical fallacy the argument commits.",
    },
    {
      difficulty: "cat_level",
      question: "Read the following sentence and identify the grammatically correct version:\n\n\"Neither the manager nor the employees was present during the audit, which caused a significant delay.\"",
      options: [
        "Neither the manager nor the employees were present during the audit, which caused a significant delay.",
        "Neither the manager nor the employees was present during the audit, which caused a significant delay.",
        "Neither the manager nor the employees are present during the audit, which caused a significant delay.",
        "Neither the manager nor the employees had been present during the audit, which caused a significant delay.",
      ],
      correctAnswer: "Neither the manager nor the employees were present during the audit, which caused a significant delay.",
      explanation: "With 'neither...nor', the verb agrees with the subject closest to it. 'Employees' is plural, so the correct verb is 'were', not 'was'.",
    },
  ],
  lrdi: [
    {
      difficulty: "medium",
      question: "In a company, 60% of employees own a car, 50% own a bike, and 20% own both. What percentage of employees own neither a car nor a bike?",
      options: ["5%", "10%", "15%", "20%"],
      correctAnswer: "10%",
      explanation: "Car only = 40%, bike only = 30%, both = 20%. Total with at least one = 90%. Neither = 100 − 90 = 10%.",
    },
    {
      difficulty: "cat_level",
      question: "Five boxes — P, Q, R, S, T — are arranged in a row. Q is immediately to the right of P. S is immediately to the left of T. R is at the left end and T is at the right end. Which box is in the middle (3rd position from the left)?",
      options: ["P", "Q", "S", "Cannot be determined"],
      correctAnswer: "Q",
      explanation: "R=1, T=5. S is immediately left of T so S=4. Remaining positions 2 and 3 for P and Q. Q is immediately right of P, so P=2 and Q=3. Row: R, P, Q, S, T. Middle = Q.",
    },
    {
      difficulty: "hard",
      question: "Four friends A, B, C, D take a test. A scores more than B. C scores more than A. D scores less than B. Who scored the second highest?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      explanation: "Ranking from highest to lowest: C > A > B > D. Second highest is A.",
    },
  ],
};

function pickQuestion(section, difficulty) {
  const bank = CAT_QUESTION_BANK[section] || [];
  const filtered = difficulty ? bank.filter(q => q.difficulty === difficulty) : bank;
  const pool = filtered.length > 0 ? filtered : bank;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function validateQuestion(q) {
  const issues = [];
  if (!q || typeof q !== "object") return { valid: false, issues: ["No question object provided"], qualityScore: 0 };

  if (!q.question || !q.question.trim()) issues.push("Question text is empty");
  if (!["quant", "varc", "lrdi"].includes(q.section)) issues.push(`Invalid section: ${q.section}`);
  if (!["easy", "medium", "cat_level", "hard"].includes(q.difficulty)) issues.push(`Invalid difficulty: ${q.difficulty}`);

  if (q.options) {
    if (!Array.isArray(q.options) || q.options.length !== 4) issues.push("Must have exactly 4 options");
    else {
      if (q.options.some(o => !o || !String(o).trim())) issues.push("All options must be non-empty");
      const unique = new Set(q.options.map(o => String(o).trim().toLowerCase()));
      if (unique.size !== q.options.length) issues.push("Options must be unique");
      if (q.correctAnswer && !q.options.includes(q.correctAnswer)) issues.push("correctAnswer must match one of the options exactly");
    }
  }

  if (!q.explanation || !q.explanation.trim()) issues.push("Explanation is missing");
  if (!q.correctAnswer || !String(q.correctAnswer).trim()) issues.push("correctAnswer is missing");

  const broken = ["undefined", "null", "lorem", "n/a", "test question"];
  const qLower = (q.question || "").toLowerCase();
  if (broken.some(b => qLower.includes(b))) issues.push("Question contains placeholder text");

  if (q.section === "quant" && !/\d/.test(q.question)) issues.push("Quant question must contain numeric information");
  if (q.section === "lrdi" && !/\d|table|set|if |when |who |how many|rank/i.test(q.question)) issues.push("LRDI question must contain a clear condition or data set");

  const qualityScore = Math.max(0, 100 - issues.length * 20);
  return { valid: issues.length === 0, issues, qualityScore };
}

export const catAssessmentTool = tool(
  async ({ action, section, difficulty, question, options, correctAnswer, userAnswer, explanation }) => {
    if (action === "generate_question") {
      const sec = section || ["quant", "varc", "lrdi"][Math.floor(Math.random() * 3)];
      const diff = difficulty || "cat_level";
      const q = pickQuestion(sec, diff);
      if (!q) return JSON.stringify({ error: `No question available for section=${sec} difficulty=${diff}` });
      const withMeta = { section: sec, difficulty: diff, ...q };
      const validation = validateQuestion(withMeta);
      return JSON.stringify({ ...withMeta, validation });
    }

    if (action === "validate_question") {
      const q = { section, difficulty, question, options, correctAnswer, explanation };
      return JSON.stringify(validateQuestion(q));
    }

    if (action === "check_answer") {
      const q = { section, difficulty, question, options, correctAnswer, explanation };
      const validation = validateQuestion(q);
      if (!validation.valid) {
        return JSON.stringify({ validQuestion: false, issues: validation.issues, qualityScore: validation.qualityScore });
      }
      const isCorrect = String(userAnswer || "").trim() === String(correctAnswer || "").trim();
      const feedback = isCorrect
        ? "Correct. Understood the concept. Move to the next question."
        : `Wrong. The correct answer is: ${correctAnswer}. ${explanation}`;
      return JSON.stringify({ validQuestion: true, isCorrect, correctAnswer, explanation, feedback });
    }

    return JSON.stringify({ error: `Unknown action: ${action}` });
  },
  {
    name: "catAssessmentTool",
    description: "CAT-level assessment tool for weekly calibre checks. Use to generate CAT-style questions (quant/varc/lrdi), validate question quality, and check student answers. Generate exactly 3 questions per assessment session (1 per section). Use silently — do not mention the tool to the student.",
    schema: z.object({
      action: z.enum(["generate_question", "validate_question", "check_answer"]),
      section: z.enum(["quant", "varc", "lrdi"]).optional().describe("CAT section for the question"),
      difficulty: z.enum(["easy", "medium", "cat_level", "hard"]).optional().describe("Question difficulty"),
      question: z.string().optional().describe("Question text (for validate/check)"),
      options: z.array(z.string()).optional().describe("4 answer options (for validate/check)"),
      correctAnswer: z.string().optional().describe("The correct answer string"),
      userAnswer: z.string().optional().describe("Student's answer to check"),
      explanation: z.string().optional().describe("Explanation of the correct answer"),
    }),
  }
);

export const ALL_TOOLS = [searchTool, timeTool, iimPercentileTool, mathCalculatorTool, catAssessmentTool];
