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

export const searchTool = tool(
  async ({ query }) => {
    const scopedQuery = `${query} IIM CAT percentile success story alumni example`;
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: requireEnv("TAVILY_API_KEY"),
        query: scopedQuery,
        max_results: 3,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
        include_images: false,
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
    description: "TavilySearchResults. Use only for real-world IIM alumni examples, CAT toppers, and verified CAT success stories. Do not use for generic advice.",
    schema: z.object({
      query: z.string().describe("A search query about a real IIM/CAT alumni example or CAT success story."),
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

export const ALL_TOOLS = [searchTool, timeTool];
