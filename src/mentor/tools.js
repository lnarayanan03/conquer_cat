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

export const ALL_TOOLS = [searchTool, timeTool, iimPercentileTool, mathCalculatorTool];
