import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./App.css";
import InstaCard from "./pages/InstaCard.jsx";
import AvatarPreview from "./AvatarPreview.jsx";
import { ASSESSMENT_TOPICS, getAssessmentQuestionCount } from "./mentor/assessmentCounts.js";

function MentorAvatar({ size = 40 }) {
  // Vikram Anand — middle-aged, distinguished: grey hair, wrinkles, slick glasses
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
      border: "2px solid #f97316",
      background: "#000000",
      boxShadow: "0 0 0 2px rgba(249,115,22,0.18), 0 4px 20px rgba(249,115,22,0.35)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{display: "block"}}
      >
        <circle cx="50" cy="50" r="50" fill="#000000"/>

        {/* Shirt */}
        <path d="M20 100 Q20 80 50 78 Q80 80 80 100Z" fill="#f97316" opacity="0.8"/>
        <path d="M25 100 Q25 82 50 80 Q75 82 75 100Z" fill="#f97316" opacity="0.5"/>

        {/* Neck + Face — warm medium skin */}
        <rect x="43" y="70" width="14" height="12" rx="4" fill="#c68642"/>
        <ellipse cx="50" cy="57" rx="20" ry="23" fill="#c68642"/>

        {/* Grey-white hair — short, professional, slightly receded at temples */}
        <ellipse cx="50" cy="37" rx="21" ry="15" fill="#9a9a9a"/>
        <path d="M30 43 Q29 53 31 57 Q30 50 32 46Z" fill="#9a9a9a"/>
        <path d="M70 43 Q71 53 69 57 Q70 50 68 46Z" fill="#9a9a9a"/>

        {/* Ear cheeks */}
        <ellipse cx="30" cy="57" rx="4" ry="5" fill="#b87333"/>
        <ellipse cx="70" cy="57" rx="4" ry="5" fill="#b87333"/>

        {/* Eye whites */}
        <ellipse cx="41" cy="55" rx="5" ry="4" fill="white"/>
        <ellipse cx="59" cy="55" rx="5" ry="4" fill="white"/>
        {/* Pupils */}
        <circle cx="42" cy="55" r="3" fill="#1a1a1a"/>
        <circle cx="60" cy="55" r="3" fill="#1a1a1a"/>
        {/* Eye highlights */}
        <circle cx="43" cy="54" r="1" fill="white" opacity="0.6"/>
        <circle cx="61" cy="54" r="1" fill="white" opacity="0.6"/>

        {/* Eyebrows — grey, slightly arched, distinguished */}
        <path d="M35 49 Q41 46 47 48" stroke="#888888" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M53 48 Q59 46 65 49" stroke="#888888" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

        {/* Wrinkles — subtle, distinguished */}
        {/* Forehead lines */}
        <path d="M36 41 Q50 39 64 41" stroke="rgba(0,0,0,0.13)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        <path d="M37 44 Q50 42 63 44" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
        {/* Nasolabial folds */}
        <path d="M36 58 Q33 64 38 68" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
        <path d="M64 58 Q67 64 62 68" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
        {/* Crow's feet */}
        <path d="M29 53 Q26 51 27 54" stroke="rgba(0,0,0,0.09)" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
        <path d="M71 53 Q74 51 73 54" stroke="rgba(0,0,0,0.09)" strokeWidth="0.6" fill="none" strokeLinecap="round"/>

        {/* Nose shadow */}
        <path d="M50 59 Q47 65 44 66 Q50 68 56 66 Q53 65 50 59Z" fill="#b07030" opacity="0.6"/>

        {/* Slick rectangular glasses — thin dark frames over eyes */}
        <rect x="32" y="51" width="17" height="8" rx="1.5" ry="1.5"
          fill="rgba(200,230,255,0.08)" stroke="#1a1a1a" strokeWidth="1.2"/>
        <rect x="51" y="51" width="17" height="8" rx="1.5" ry="1.5"
          fill="rgba(200,230,255,0.08)" stroke="#1a1a1a" strokeWidth="1.2"/>
        {/* Bridge */}
        <line x1="49" y1="55" x2="51" y2="55" stroke="#1a1a1a" strokeWidth="1.0"/>
        {/* Temple arms */}
        <line x1="32" y1="55" x2="27" y2="54" stroke="#1a1a1a" strokeWidth="1.0" strokeLinecap="round"/>
        <line x1="68" y1="55" x2="73" y2="54" stroke="#1a1a1a" strokeWidth="1.0" strokeLinecap="round"/>

        {/* Mouth */}
        <path d="M43 72 Q50 73 57 72" stroke="#8b5e3c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

        {/* Orange ring hint */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3"/>
      </svg>
    </div>
  )
}

function UserAvatar({ size=40, gender="male", skinTone="medium", hairStyle="wavy",
  hairColor="black", shirtColor="blue", hasGlasses=false, hasBeard=false, hasMustache=false }) {
  return (
    <AvatarPreview gender={gender} skinTone={skinTone} hairStyle={hairStyle}
      hairColor={hairColor} shirtColor={shirtColor}
      hasGlasses={hasGlasses} hasBeard={hasBeard} hasMustache={hasMustache} size={size}/>
  )
}

function renderMessage(text) {
  if (!text) return null
  return text.split("\n").map((line, li) => (
    <div key={li} style={{minHeight: line ? "auto" : "8px"}}>
      {line.split(/\*\*(.*?)\*\*/g).map((part, i) => {
        if (i % 2 === 1) {
          return (
            <strong key={i} style={{fontWeight: 700, color: "inherit"}}>{part}</strong>
          )
        }
        return part.split(/\*(.*?)\*/g).map((p, j) =>
          j % 2 === 1
            ? <em key={j} style={{fontStyle: "italic"}}>{p}</em>
            : p
        )
      })}
    </div>
  ))
}

function getApiErrorMessage(data, fallback = "Server error") {
  if (!data) return fallback
  if (typeof data.error === "string") return data.error
  if (typeof data.reply === "string") return data.reply
  if (typeof data.message === "string") return data.message
  if (typeof data.details?.error?.message === "string") return data.details.error.message
  if (typeof data.details?.message === "string") return data.details.message
  if (typeof data.details === "string") return data.details
  return fallback
}

function getMentorReply(data) {
  const asString = value => typeof value === "string" ? value : ""
  const reply =
    asString(data?.reply) ||
    asString(data?.message) ||
    asString(data?.text) ||
    (typeof data?.content === "string" ? data.content : "") ||
    asString(data?.content?.[0]?.text) ||
    data?.content?.find?.(block => typeof block?.text === "string")?.text ||
    asString(data?.choices?.[0]?.message?.content) ||
    asString(data?.error) ||
    "I got a response, but could not parse it."

  if (reply === "I got a response, but could not parse it.") {
    console.warn("Unexpected /api/chat response shape", data)
  }

  if (reply === "Load failed" || reply.includes("Load failed")) {
    return "Connection issue. Send your message again."
  }

  return reply
}

async function readChatResponse(res) {
  try {
    const data = await res.clone().json()
    return data
  } catch {
    const text = await res.text()
    return { error: text || `Server error: ${res.status}` }
  }
}

function isMobileKeyboardViewport() {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(max-width: 768px), (pointer: coarse)")?.matches ?? window.innerWidth < 768
}

const EXAM_DATE = new Date("2026-11-29T00:00:00");
const AC = "#f97316";
const EXAM_DATE_KEY = "2026-11-29";
const APPLICATION_START_KEY = "2026-08-01";
const APPLICATION_END_KEY = "2026-09-20";

const toLocalDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};
const todayKey = () => toLocalDateKey(new Date());
const todayKeyIST = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const isDateKeyBetween = (key, startKey, endKey) => key >= startKey && key <= endKey;
const isApplicationWindow = (key) => isDateKeyBetween(key, APPLICATION_START_KEY, APPLICATION_END_KEY);
const isFinalPushDate = (key) => isDateKeyBetween(key, "2026-11-23", EXAM_DATE_KEY);
const isDdayRevealDay = () => todayKey() >= EXAM_DATE_KEY;
const getDaysLeft = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exam = new Date("2026-11-29T00:00:00")
  exam.setHours(0, 0, 0, 0)
  const diff = Math.floor((exam - now) / 86400000)
  return Math.max(0, diff - 1)
}
const defaultDay = () => ({
  wt:"", st:"",
  lc:false, lc_na:false,
  as:false, as_na:false,
  ap:false, ap_na:false,
  vp:false, vp_na:false, vp_count:0,
  ph:0, pm:0,
  ah:0, eh:0,
  q:0, v:0, l:0,
  sk:false, skm:0, sks:0, skd:"medium",
  vm:false, vmt:"",
  ca:false,
  iq:"", n:"", backlog:[],
  officeBefore10:false,
  gymDone:false, gymMinutes:0,
  waterLiters:0,
  contentPosted:false, editingUnder1Hr:false,
  calories:0, protein:0, carbs:0, fat:0,
  foodEntries:[],
  missionSectionId:"", missionUnitId:"", missionChapterId:"",
  currentMode:"",
  effortScore:0, effortBreakdownV2:null,
});

const MASTERY_PROGRESS_STORAGE_KEY = "conquer_mastery_progress_v1";
const MASTERY_PILLARS = [
  { id: "learn", label: "Learn" },
  { id: "practice", label: "Practice" },
  { id: "errorLog", label: "Error Log" },
];
const MASTERY_PILLAR_DEFAULTS = {
  learn: false,
  practice: false,
  errorLog: false,
};
const MASTERY_CONFIG_DEFAULTS = {
  learnLiveConceptTotal: 0,
  learnLiveConceptDone: 0,
  applicationClassesTotal: 0,
  applicationClassesDone: 0,
  assignmentsTotal: 0,
  assignmentsDone: 0,
  totalPracticeQuestions: 0,
  questionsCompleted: 0,
  errorLogCount: 0,
};

const makeMasteryId = (...parts) => parts
  .join(" ")
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const makeMasteryUnit = (sectionId, unitLabel, chapters) => ({
  id: makeMasteryId(sectionId, unitLabel),
  label: unitLabel,
  chapters: chapters.map(chapterLabel => ({
    id: makeMasteryId(sectionId, unitLabel, chapterLabel),
    label: chapterLabel,
  })),
});

const CAT_MASTERY_SYLLABUS = [
  {
    id: "quant",
    label: "Quant",
    units: [
      makeMasteryUnit("quant", "Number System", [
        "Classification of Numbers",
        "Factors and its Properties",
        "Divisibility",
        "Remainder",
        "Last Digit and Misc Concepts",
        "HCF and LCM",
      ]),
      makeMasteryUnit("quant", "Arithmetic", [
        "Percentage",
        "Profit and Loss",
        "Simple and Compound Interest",
        "Ratio and Proportion",
        "Averages, Mixtures and Alligation",
        "Time and Work",
        "TSD",
      ]),
      makeMasteryUnit("quant", "Algebra", [
        "Linear Equations",
        "Quadratic Equations",
        "Algebraic Identities and Polynomials",
        "Surds and Indices",
        "Progression and Series",
        "Logarithms",
        "Inequalities",
        "Modulus",
        "Maxima and Minima",
        "Functions and Graphs",
      ]),
      makeMasteryUnit("quant", "Geometry", [
        "Lines and Angles",
        "Triangles",
        "Quadrilaterals",
        "Circle",
        "Polygon",
        "3D Mensuration",
        "Coordinate Geometry",
      ]),
      makeMasteryUnit("quant", "Modern Maths", [
        "Permutation and Combination",
        "Probability",
      ]),
    ],
  },
  {
    id: "lrdi",
    label: "LRDI",
    units: [
      makeMasteryUnit("lrdi", "Logical Reasoning", [
        "Linear Arrangement",
        "Circular Arrangement",
        "Binary Logic",
        "Selection",
        "Distribution",
        "Ranking and Ordering",
        "Games and Tournament",
        "Cubes",
        "Routes and Network",
        "Scheduling",
        "Quant-Based Reasoning",
        "Venn Diagram",
      ]),
      makeMasteryUnit("lrdi", "Data Interpretation", [
        "Tables",
        "Bar Chart",
        "Line Chart",
        "Pie Chart",
        "Special Chart",
        "Reasoning-Based DI",
        "Caselets",
      ]),
    ],
  },
  {
    id: "varc",
    label: "VARC",
    units: [
      makeMasteryUnit("varc", "Reading Comprehension", [
        "Intro to RC and Types of Questions",
        "Process of Elimination",
        "Critical Reasoning",
        "Philosophy, Sociology and Psychology",
        "Society, Culture and Politics",
        "Science and Environment",
        "Business and Economics",
        "Technology and AI",
        "History",
        "Arts and Literature",
      ]),
      makeMasteryUnit("varc", "Verbal Ability", [
        "Para Summary",
        "Para Jumbles",
        "Para Completion / Fill in the Blanks",
        "Odd One Out",
      ]),
    ],
  },
];

const EL_SOURCES = ["Practice", "Assignment", "Mock", "Class", "VARC RC", "LRDI Set", "Other"];
const EL_RETRY_STATUSES = ["Not retried", "Retry needed", "Retried wrong", "Retried correct"];
const EL_MISTAKE_TYPES = {
  quant: ["Concept gap", "Formula gap", "Setup error", "Calculation error", "Time pressure", "Silly mistake"],
  lrdi:  ["Set selection", "Case setup", "Condition missed", "Arrangement error", "Calculation error", "Time pressure"],
  varc:  ["Option trap", "Main idea miss", "Tone miss", "Inference miss", "Para-jumble logic", "Vocabulary/context"],
  general: ["Silly mistake", "Time pressure", "Did not review", "Other"],
};

function getElMistakeTypes(sectionId) {
  const sec = EL_MISTAKE_TYPES[sectionId] || [];
  const gen = EL_MISTAKE_TYPES.general;
  const seen = new Set();
  return [...sec, ...gen].filter(t => seen.has(t) ? false : seen.add(t));
}

function defaultChapterMastery() {
  return {
    pillars: { ...MASTERY_PILLAR_DEFAULTS },
    config: { ...MASTERY_CONFIG_DEFAULTS },
  };
}

const toNonNegativeInt = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const readConfigNumber = (config, ...keys) => {
  for (const key of keys) {
    const value = config?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return toNonNegativeInt(value);
    }
  }
  return 0;
};

function normalizeMasteryConfig(value) {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const next = {
    learnLiveConceptTotal: readConfigNumber(raw, "learnLiveConceptTotal", "learnLiveConceptClasses"),
    learnLiveConceptDone: readConfigNumber(raw, "learnLiveConceptDone"),
    applicationClassesTotal: readConfigNumber(raw, "applicationClassesTotal", "applicationClasses"),
    applicationClassesDone: readConfigNumber(raw, "applicationClassesDone"),
    assignmentsTotal: readConfigNumber(raw, "assignmentsTotal", "assignments"),
    assignmentsDone: readConfigNumber(raw, "assignmentsDone"),
    totalPracticeQuestions: readConfigNumber(raw, "totalPracticeQuestions"),
    questionsCompleted: readConfigNumber(raw, "questionsCompleted"),
    errorLogCount: readConfigNumber(raw, "errorLogCount"),
  };

  next.learnLiveConceptDone = Math.min(next.learnLiveConceptDone, next.learnLiveConceptTotal);
  next.applicationClassesDone = Math.min(next.applicationClassesDone, next.applicationClassesTotal);
  next.assignmentsDone = Math.min(next.assignmentsDone, next.assignmentsTotal);
  next.questionsCompleted = Math.min(next.questionsCompleted, next.totalPracticeQuestions);

  return next;
}

function normalizeChapterMastery(value) {
  const base = defaultChapterMastery();
  return {
    pillars: { ...base.pillars, ...(value?.pillars || {}) },
    config: normalizeMasteryConfig(value?.config),
  };
}

function readMasteryProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(MASTERY_PROGRESS_STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function getChapterMastery(progress, chapterId) {
  return normalizeChapterMastery(progress?.[chapterId]);
}

function getChapterMasteryStats(progress, chapterId) {
  const chapterProgress = getChapterMastery(progress, chapterId);
  const completed = MASTERY_PILLARS.reduce(
    (sum, pillar) => sum + (chapterProgress.pillars[pillar.id] ? 1 : 0),
    0
  );
  const total = MASTERY_PILLARS.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const status = completed === 0
    ? "Not started"
    : completed === total
      ? "Mastered"
      : `${completed}/${total} pillars`;

  return { completed, total, pct, status };
}

function getMasteryAggregate(chapters, progress) {
  const total = chapters.length * MASTERY_PILLARS.length;
  const completed = chapters.reduce(
    (sum, chapter) => sum + getChapterMasteryStats(progress, chapter.id).completed,
    0
  );
  const completedChapters = chapters.reduce(
    (sum, chapter) => sum + (getChapterMasteryStats(progress, chapter.id).pct === 100 ? 1 : 0),
    0
  );

  return {
    completed,
    total,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    completedChapters,
    totalChapters: chapters.length,
  };
}

function formatMasteryPair(done, total) {
  return total > 0 ? `${done}/${total}` : "-";
}

function getChapterConfigSummary(config) {
  const normalized = normalizeMasteryConfig(config);
  return [
    `Learn ${formatMasteryPair(normalized.learnLiveConceptDone, normalized.learnLiveConceptTotal)}`,
    `Q ${formatMasteryPair(normalized.questionsCompleted, normalized.totalPracticeQuestions)}`,
    `Err ${normalized.errorLogCount > 0 ? normalized.errorLogCount : "-"}`,
  ].join(" · ");
}

function getCurrentWatchingBacklog(videos = [], concepts = []) {
  const video = videos.find(item => item?.watching);
  if (video) return { type: "Video", item: video };
  const concept = concepts.find(item => item?.watching);
  if (concept) return { type: "Concept", item: concept };
  return null;
}

const getSleepDuration = (sleepTime, wakeTime) => {
  if (!sleepTime || !wakeTime) return null;
  const [sh, sm] = sleepTime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let sleepMins = sh * 60 + sm;
  let wakeMins = wh * 60 + wm;
  if (wakeMins <= sleepMins) wakeMins += 24 * 60;
  return (wakeMins - sleepMins) / 60;
};

function to12HourParts(value) {
  if (!value || !value.includes(":")) return { hour12: null, minute: null, meridiem: null };
  const [h, m] = value.split(":").map(Number);
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour12, minute: m, meridiem };
}

function to24HourValue(hour12, minute, meridiem) {
  if (hour12 === null || minute === null || !meridiem) return "";
  let h = Number(hour12);
  if (meridiem === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${String(Number(minute)).padStart(2, "0")}`;
}

function TimePickerWidget({ value, onChange, label, sub, dotColor }) {
  const { hour12: selHour, minute: selMin, meridiem: selMeridiem } = to12HourParts(value);

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 10, 20, 30, 40, 50];
  const defaultMeridiem = label === "Wake time" ? "AM" : "PM";

  const handleChange = (h, m, mer) => {
    if (h === null || m === null || !mer) return;
    onChange(to24HourValue(h, m, mer));
  };

  return (
    <div className="card-row">
      <div>
        <div className="row-label">{label}</div>
        <div className="row-sub">{sub}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <select
          className="time-select"
          value={selHour ?? ""}
          onChange={e => handleChange(Number(e.target.value), selMin ?? 0, selMeridiem ?? defaultMeridiem)}
          style={{minWidth:56}}
        >
          <option value="">Hr</option>
          {hours.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <select
          className="time-select"
          value={selMin ?? ""}
          onChange={e => handleChange(selHour ?? 12, Number(e.target.value), selMeridiem ?? defaultMeridiem)}
          style={{minWidth:58}}
        >
          <option value="">Min</option>
          {minutes.map(m => (
            <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
          ))}
        </select>
        <select
          className="time-select"
          value={selMeridiem ?? defaultMeridiem}
          onChange={e => handleChange(selHour ?? 12, selMin ?? 0, e.target.value)}
          style={{minWidth:60}}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
        <div style={{width:8,height:8,borderRadius:"50%",background:dotColor,flexShrink:0}}/>
      </div>
    </div>
  );
}

const effortScore = (day, backlogVideos = day?.backlog || [], backlogConcepts = []) => {
  const q = Math.min((+day.q||0)/10, 1) * 18;
  const v = Math.min((+day.v||0)/5, 1) * 12;
  const l = Math.min((+day.l||0)/5, 1) * 12;
  const vp = Math.min((+day.vp_count||0)/1, 1) * 8;
  // N/A sessions count as done for score (not penalised, not rewarded)
  const sessionMins =
    ((day.lc || day.lc_na) ? 120 : 0) +
    ((day.as || day.as_na) ? 40 : 0) +
    ((day.ap || day.ap_na) ? 120 : 0) +
    ((day.vp || day.vp_na) ? 20 : 0) +
    ((+day.ph||0)*60) + (+day.pm||0);
  const hrs = Math.min(sessionMins / 300, 1) * 16;
  const lc = ((day.lc || day.lc_na) ? 1 : 0) * 8;
  const passage = ((day.vp || day.vp_na) ? 1 : 0) * 4;
  const sleepScore = (() => {
    if (!day.wt || !day.st) return 0;
    const [wh, wm] = day.wt.split(":").map(Number);
    const [sh, sm] = day.st.split(":").map(Number);
    let wakeMins = wh * 60 + wm;
    let sleepMins = sh * 60 + sm;
    if (wakeMins <= sleepMins) wakeMins += 24 * 60;
    const duration = (wakeMins - sleepMins) / 60;
    if (duration >= 4 && duration <= 6) return 8;
    if (duration >= 3.5 && duration < 4) return 5;
    if (duration > 6 && duration <= 7) return 5;
    if (duration >= 3 && duration < 3.5) return 2;
    return 0;
  })();
  const backlogScore = (() => {
    const allItems = [...(backlogVideos || []), ...(backlogConcepts || [])];
    if (allItems.length === 0) return 0;
    const checked = allItems.filter(item => item.checked).length;
    return Math.round((checked / allItems.length) * 10);
  })();
  const sudokuScore = day.sk ? 2 : 0;
  const vedicScore = day.vm ? 2 : 0;
  const catApplicationScore = day.ca ? 1 : 0;
  return Math.min(100, Math.round(q + v + l + vp + hrs + lc + passage + sleepScore + backlogScore + sudokuScore + vedicScore + catApplicationScore));
};

const EV2_PRACTICE_MAIN_TARGET = 10;
const EV2_PRACTICE_OTHER_TARGET = 5;

function calculateEffortScoreV2({ dayData, masteryProgress = {}, date }) {
  const day = dayData || defaultDay();

  /* ── LEARN  (30 pts) ── */
  const missionChapterId = day.missionChapterId || "";
  let learnScore = 0;
  if (missionChapterId) {
    learnScore += 5; // mission selected
    const chP = getChapterMastery(masteryProgress, missionChapterId);
    if (chP.pillars.learn) learnScore += 15;
    const cfg = chP.config;
    if (cfg.learnLiveConceptTotal > 0) {
      learnScore += Math.round((Math.min(cfg.learnLiveConceptDone, cfg.learnLiveConceptTotal) / cfg.learnLiveConceptTotal) * 10);
    } else {
      learnScore += chP.pillars.learn ? 5 : 0;
    }
  }
  learnScore = Math.min(learnScore, 30);

  /* ── PRACTICE  (25 pts) ── */
  const mainSec = day.missionSectionId || "";
  const quant = +day.q || 0;
  const varc = +day.v || 0;
  const lrdi = +day.l || 0;
  const MT = EV2_PRACTICE_MAIN_TARGET;
  const OT = EV2_PRACTICE_OTHER_TARGET;
  let mainP = 0, oth1P = 0, oth2P = 0;
  if (mainSec === "quant") {
    mainP = Math.min(quant / MT, 1) * 10;
    oth1P = Math.min(varc / OT, 1) * 7.5;
    oth2P = Math.min(lrdi / OT, 1) * 7.5;
  } else if (mainSec === "varc") {
    mainP = Math.min(varc / MT, 1) * 10;
    oth1P = Math.min(quant / OT, 1) * 7.5;
    oth2P = Math.min(lrdi / OT, 1) * 7.5;
  } else if (mainSec === "lrdi") {
    mainP = Math.min(lrdi / MT, 1) * 10;
    oth1P = Math.min(quant / OT, 1) * 7.5;
    oth2P = Math.min(varc / OT, 1) * 7.5;
  } else {
    mainP = Math.min(Math.max(quant, varc, lrdi) / MT, 1) * 10;
    oth1P = Math.min((quant + varc) / (OT * 2), 1) * 7.5;
    oth2P = Math.min(lrdi / OT, 1) * 7.5;
  }
  const practiceScore = Math.min(Math.round(mainP + oth1P + oth2P), 25);

  /* ── ERROR LOG  (15 pts) ── */
  let errorLogScore = 0;
  if (missionChapterId) {
    const chP = getChapterMastery(masteryProgress, missionChapterId);
    const errCount = chP.config.errorLogCount;
    if (errCount > 0) errorLogScore += Math.min(errCount * 2, 10);
    if (chP.pillars.errorLog) errorLogScore += 5;
  }
  errorLogScore = Math.min(errorLogScore, 15);

  /* ── DISCIPLINE  (30 pts) ── */
  const sleepDay = date ? new Date(date + "T00:00:00").getDay() : new Date().getDay();
  const isWeekend = sleepDay === 0 || sleepDay === 6;
  const sleepTarget = isWeekend ? 8 : 5;
  const sleepDur = getSleepDuration(day.st, day.wt);
  const sleepScore = (sleepDur !== null && isFinite(sleepDur) && sleepDur >= sleepTarget) ? 6 : 0;
  // Office irrelevant on weekends; those 5pts roll to gym so discipline max stays 30
  const officeScore = (!isWeekend && day.officeBefore10) ? 5 : 0;
  const gymScore = day.gymDone ? (isWeekend ? 10 : 5) : 0;
  const waterScore = Math.min(Math.round(((+day.waterLiters || 0) / 4) * 4), 4);
  const entries = Array.isArray(day.foodEntries) ? day.foodEntries : [];
  const foodScore = (entries.length > 0 || (+day.calories || 0) > 0) ? 4 : 0;
  const contentScore = day.contentPosted ? 3 : 0;
  const editingScore = day.editingUnder1Hr ? 3 : 0;
  const disciplineScore = Math.min(sleepScore + officeScore + gymScore + waterScore + foodScore + contentScore + editingScore, 30);

  const total = Math.min(learnScore + practiceScore + errorLogScore + disciplineScore, 100);
  return {
    total,
    breakdown: { learn: learnScore, practice: practiceScore, errorLog: errorLogScore, discipline: disciplineScore },
  };
}

function calcMinPercentile(category) {
  const cutoffs = {
    "General": { oldIIM: 99.5, babyIIM: 97.0, newIIM: 95.0 },
    "OBC-NCL": { oldIIM: 97.0, babyIIM: 92.0, newIIM: 88.0 },
    "SC": { oldIIM: 90.0, babyIIM: 85.0, newIIM: 80.0 },
    "ST": { oldIIM: 85.0, babyIIM: 75.0, newIIM: 70.0 },
    "EWS": { oldIIM: 98.0, babyIIM: 95.0, newIIM: 92.0 },
    "PWD": { oldIIM: 80.0, babyIIM: 72.0, newIIM: 65.0 },
  };
  return cutoffs[category] || cutoffs["General"];
}

function calcIIMProfile({
  category,
  gender,
  primaryDegree,
  secondaryDegrees,
  workExpYears,
  workExpMonths,
}) {
  const engDegrees = ["B.Tech", "B.E.", "B.Sc (Engg)", "B.Sc Engineering"];
  const isEngineer = engDegrees.some(d => primaryDegree?.type?.includes(d));
  const isFemale = gender === "female";
  const totalWorkMonths = ((+workExpYears || 0) * 12) + (+workExpMonths || 0);

  const pgTypes = ["MBA", "M.Tech", "MS", "M.Sc", "MA", "M.Com", "M.Phil", "LLM", "MCA"];
  const hasMasters = secondaryDegrees?.some(d =>
    typeof d === "string"
      ? pgTypes.some(pg => d.includes(pg))
      : pgTypes.some(pg => d?.degree?.includes(pg) || d?.text?.includes(pg))
  );

  const rawGPA = parseFloat(primaryDegree?.gpa);
  const gpaScale = primaryDegree?.gpaScale || "percentage";
  let gradPct = NaN;
  if (!isNaN(rawGPA)) {
    if (gpaScale === "10") gradPct = rawGPA * 10;
    else if (gpaScale === "4") gradPct = (rawGPA / 4) * 100;
    else gradPct = rawGPA;
  }

  const categoryBase = {
    "General": { ABC: 99.0, KLIS: 97.5, newIIM: 94.0 },
    "OBC-NCL": { ABC: 96.5, KLIS: 93.0, newIIM: 88.5 },
    "EWS": { ABC: 97.5, KLIS: 95.0, newIIM: 91.0 },
    "SC": { ABC: 90.0, KLIS: 85.0, newIIM: 78.0 },
    "ST": { ABC: 83.0, KLIS: 77.0, newIIM: 66.0 },
    "PWD": { ABC: 76.0, KLIS: 68.0, newIIM: 58.0 },
  };
  const base = categoryBase[category] || categoryBase["General"];
  let adjustment = 0;

  if (category === "General") {
    if (isEngineer && !isFemale) adjustment += 0.65;
    else if (isEngineer && isFemale) adjustment -= 0.8;
    else if (!isEngineer && !isFemale) adjustment -= 0.5;
    else adjustment -= 2.0;
  } else if (category === "OBC-NCL") {
    if (!isEngineer) adjustment -= 3.0;
    if (isFemale) adjustment -= 0.5;
  }

  if (totalWorkMonths >= 36) adjustment -= 1.2;
  else if (totalWorkMonths >= 24) adjustment -= 1.0;
  else if (totalWorkMonths >= 12) adjustment -= 0.6;
  else if (totalWorkMonths >= 6) adjustment -= 0.3;

  if (hasMasters) adjustment -= 0.4;

  if (!isNaN(gradPct)) {
    if (gradPct >= 85) adjustment -= 0.5;
    else if (gradPct >= 75) adjustment -= 0.2;
    else if (gradPct < 55) adjustment += 0.8;
    else if (gradPct < 60) adjustment += 0.5;
  }

  const adjustedCutoffs = {
    ABC: Math.min(99.9, Math.max(75, base.ABC + adjustment)),
    KLIS: Math.min(99.5, Math.max(70, base.KLIS + adjustment)),
    newIIM: Math.min(98, Math.max(60, base.newIIM + adjustment)),
  };

  let profileScore = 50;

  if (totalWorkMonths >= 36) profileScore += 18;
  else if (totalWorkMonths >= 24) profileScore += 14;
  else if (totalWorkMonths >= 12) profileScore += 9;
  else if (totalWorkMonths >= 6) profileScore += 5;
  else profileScore -= 5;

  if (!isNaN(gradPct)) {
    if (gradPct >= 85) profileScore += 12;
    else if (gradPct >= 75) profileScore += 6;
    else if (gradPct >= 65) profileScore += 2;
    else profileScore -= 4;
  }

  if (hasMasters) profileScore += 8;
  if (isFemale) profileScore += 6;
  if (!isEngineer) profileScore += 4;

  const college = (primaryDegree?.college || "").toLowerCase();
  const tier1 = ["iit", "bits pilani", "nit", "srcc", "st. xavier", "lady shri ram", "miranda", "hindu college", "presidency", "christ university", "loyola"];
  if (tier1.some(k => college.includes(k))) profileScore += 8;

  profileScore = Math.min(100, Math.max(5, profileScore));

  const baseConversion = { ABC: 0.36, KLIS: 0.45, newIIM: 0.56 };
  const profileBonus = (profileScore - 50) / 150;
  const interviewProb = {
    ABC: Math.min(0.82, Math.max(0.12, baseConversion.ABC + profileBonus)),
    KLIS: Math.min(0.88, Math.max(0.18, baseConversion.KLIS + profileBonus)),
    newIIM: Math.min(0.92, Math.max(0.25, baseConversion.newIIM + profileBonus)),
  };

  return {
    adjustedCutoffs,
    profileScore,
    interviewProb,
    isGEM: isEngineer && !isFemale && category === "General",
    hasMasters,
    totalWorkMonths,
    gradPct: isNaN(gradPct) ? null : gradPct,
    adjustmentSummary: {
      gemPenalty: isEngineer && !isFemale && category === "General" ? +0.65 : 0,
      femaleDiversity: isFemale ? (category === "OBC-NCL" ? -0.5 : -0.8) : 0,
      nonEngineerDiversity: !isEngineer ? (category === "OBC-NCL" ? -3.0 : -0.5) : 0,
      workEx: totalWorkMonths >= 24 ? -1.0
        : totalWorkMonths >= 12 ? -0.6
          : totalWorkMonths >= 6 ? -0.3 : 0,
      mastersDegree: hasMasters ? -0.4 : 0,
      academics: !isNaN(gradPct) && gradPct >= 85 ? -0.5
        : !isNaN(gradPct) && gradPct < 60 ? +0.5 : 0,
    },
  };
}

function Tog({ v, onChange }) {
  return (
    <label className="tog" style={{ display:"inline-block" }}>
      <input type="checkbox" checked={!!v} onChange={e => onChange(e.target.checked)} />
      <span className="tog-track" />
      <span className="tog-thumb" />
    </label>
  );
}

function NavIcon({ id }) {
  const icons = {
    today: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    progress: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
    mastery: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
    calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    chat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    profile: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    insta: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="1"/></svg>,
  };
  return icons[id] || null;
}

// Clean inline SVG icons for D-Day anime cards — replaces emoji symbols
function DdaySymbolIcon({ type, size = 22 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  const shapes = {
    lightning: <path d="M13 2L4.5 13.5h5.5L8 22l11.5-13h-5.5L13 2z" fill="currentColor" stroke="none"/>,
    sword:     <><line x1="6" y1="18" x2="18" y2="6"/><polyline points="8,6 18,6 18,16"/></>,
    star4:     <polygon points="12,2 14.9,9.1 22,9.1 16.5,13.9 18.5,21 12,17 5.5,21 7.5,13.9 2,9.1 9.1,9.1" fill="currentColor" stroke="none"/>,
    fist:      <><rect x="6" y="9" width="12" height="8" rx="3"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/></>,
    flame:     <path d="M12 22c4 0 7-3 7-7 0-2-1-3.5-2.5-4.5.5 1.2 0 2.8-1.5 3.5 0-1.5-1-4.5-4-6 .5 2 0 4.5-2.5 6.5C7.5 15.5 7 17 7 18c0 2.5 2.5 4 5 4z" fill="currentColor" stroke="none"/>,
    spiral:    <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    burst:     <><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="5.6" y1="5.6" x2="7.8" y2="7.8"/><line x1="16.2" y1="16.2" x2="18.4" y2="18.4"/><line x1="5.6" y1="18.4" x2="7.8" y2="16.2"/><line x1="16.2" y1="7.8" x2="18.4" y2="5.6"/></>,
    target:    <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    compass:   <><circle cx="12" cy="12" r="9"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none"/></>,
    shield:    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" stroke="none"/>,
    wave:      <><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></>,
    arrow:     <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></>,
  };
  return <svg {...p}>{shapes[type] || shapes.star4}</svg>;
}

const IQUANTA_SESSION_DEFS = [
  { field: "lc", naField: "lc_na", label: "Live Class", fallbackSub: "2 hrs - iQuanta live", minutes: 120 },
  { field: "as", naField: "as_na", label: "Afternoon Session", fallbackSub: "40 min session", minutes: 40 },
  { field: "ap", naField: "ap_na", label: "Application Class", fallbackSub: "10PM - 12AM - Application class", minutes: 120 },
  { field: "vp", naField: "vp_na", label: "VARC Passage", fallbackSub: "20 min passage", minutes: 20 },
];

function formatStudyDuration(totalMins) {
  const mins = Math.max(0, Number(totalMins) || 0);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs > 0 && rem > 0) return `${hrs}h ${rem}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${rem}m`;
}

function getIQuantaSessionStats(day = {}) {
  const available = IQUANTA_SESSION_DEFS.filter(s => !day[s.naField]);
  const done = IQUANTA_SESSION_DEFS.filter(s => day[s.field] && !day[s.naField]);
  const totalMins = done.reduce((sum, s) => sum + s.minutes, 0);
  return {
    available: available.length,
    done: done.length,
    total: IQUANTA_SESSION_DEFS.length,
    totalMins,
    timeLabel: formatStudyDuration(totalMins),
  };
}

function TodayPage({
  date, d, upd, dl, start, totalDays, mode, setTab,
  backlogVideos, backlogConcepts, notes = [], onSave, data, totals, userName, userInitials,
  avatarGender, avatarSkin, avatarHair, avatarHairColor,
  avatarShirt, avatarGlasses, avatarBeard, avatarMustache,
  todayLiveLabel, todayAppLabel, isSundayIST, theme, onOpenWatchingBacklog,
  masteryProgress = {}, onOpenErrorLog, errorLog = [], onShowFocusInMap,
}) {
  const [saved, setSaved] = useState(false);
  const [showInstaCard, setShowInstaCard] = useState(false);
  const [showFocusSelectors, setShowFocusSelectors] = useState(false);
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning." : h < 17 ? "Good afternoon." : "Good evening.";
  const fmt = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" });
  const dn = Math.max(1, Math.floor((new Date(date + "T00:00:00") - start) / 86400000) + 1);
  const prepQuotes = [
    "99.9 percentile is not a dream. It is a decision.",
    "Every set you skip today is a percentile you lose in November.",
    "The IIM interview room doesn't care about your excuses.",
    "Vikram cracked CAT at 3am with no internet. What's your excuse?",
    "Your future batchmates at IIM-A are studying right now.",
    "Consistency beats intelligence. Every single time.",
    "The CAT is not testing your knowledge. It is testing your discipline.",
    "One more set. Always one more set.",
  ];
  const interviewQuotes = [
    "The PI is not a test of knowledge. It is a test of who you are.",
    "They have your scores. Now they want your story.",
    "One mock interview a day keeps the rejection away.",
    "Know your SOP better than you know yourself.",
    "The panel can smell nervousness. Practice until it leaves.",
    "Every IIM topper stumbled in a mock before they walked into the real room.",
    "Speak with conviction, not just correctness.",
    "They are not looking for the smartest person. They want the clearest thinker.",
  ];
  const quotes = mode === "interview" ? interviewQuotes : prepQuotes;
  const todayQuote = quotes[new Date().getDate() % quotes.length];
  const prevDateKey = (() => {
    const prev = new Date(date + "T00:00:00");
    prev.setDate(prev.getDate() - 1);
    const y = prev.getFullYear();
    const m = String(prev.getMonth()+1).padStart(2,"0");
    const dd = String(prev.getDate()).padStart(2,"0");
    return `${y}-${m}-${dd}`;
  })();
  const prevDayData = data?.[prevDateKey];
  const sleepTimeForCalc = prevDayData?.st || d.st;
  const sleepDuration = getSleepDuration(sleepTimeForCalc, d.wt);
  const hasSleepDuration = sleepDuration !== null;
  const sleepTargetHours = (() => {
    const day = new Date(date + "T00:00:00").getDay();
    return day === 0 || day === 6 ? 8 : 5;
  })();
  const isWeekend = sleepTargetHours === 8;
  const sleepDurationValid = hasSleepDuration && sleepDuration >= sleepTargetHours;
  const selfStudyMins = ((+d.ph||0) * 60) + (+d.pm||0);
  const selfStudyDisplay = formatStudyDuration(selfStudyMins);
  const iqSessionStats = getIQuantaSessionStats(d);
  const totalBacklog = backlogVideos.length + backlogConcepts.length;
  const totalDone = backlogVideos.filter(i=>i.checked).length +
                    backlogConcepts.filter(i=>i.checked).length;
  const backlogPending = totalBacklog - totalDone;
  const backlogCoverage = totalBacklog > 0
    ? Math.round((totalDone / totalBacklog) * 100)
    : 0;
  const currentWatchingBacklog = getCurrentWatchingBacklog(backlogVideos, backlogConcepts);
  const sudokuMins = Number(d.skm || 0);
  const sudokuSecs = Number(d.sks || 0);
  const sudokuTimeValid =
    Number.isInteger(sudokuMins) && sudokuMins >= 0 &&
    Number.isInteger(sudokuSecs) && sudokuSecs >= 0 && sudokuSecs < 60 &&
    (!d.sk || sudokuMins + sudokuSecs > 0);
  const isExamDay = date === EXAM_DATE_KEY;
  const showApplicationToggle = isApplicationWindow(date);
  const showFinalPush = isFinalPushDate(date);
  const v2Score = useMemo(
    () => calculateEffortScoreV2({ dayData: d, masteryProgress, date }),
    [d, masteryProgress, date]
  );
  const missionSection = CAT_MASTERY_SYLLABUS.find(s => s.id === (d.missionSectionId || ""));
  const missionUnit = missionSection?.units.find(u => u.id === (d.missionUnitId || ""));
  const missionChapterObj = missionUnit?.chapters.find(c => c.id === (d.missionChapterId || ""));
  const latestNote = useMemo(() => {
    return [...notes].sort((a, b) => new Date(getNoteUpdatedAt(b)) - new Date(getNoteUpdatedAt(a)))[0] || null;
  }, [notes]);

  if (isExamDay) {
    const reveal = isDdayRevealDay();
    const ddayMotifs = [
      { symbol: "star4",    title: "Straw Hat Resolve",  copy: "Put the dream on your head. Walk in like the sea already made space for you.",                  source: "One Piece spirit" },
      { symbol: "lightning",title: "Saiyan Calm",        copy: "Power is not noise today. It is quiet pressure, clean breathing, and one more sharp decision.",  source: "Dragon Ball spirit" },
      { symbol: "sword",    title: "Soul Blade",         copy: "Cut only what matters. Skip the traps. Slice through the paper with discipline.",                source: "Bleach spirit" },
      { symbol: "burst",    title: "Five-Leaf Will",     copy: "When the section gets loud, your months of practice get louder. You earned that voice.",          source: "Black Clover spirit" },
      { symbol: "fist",     title: "Final Round",        copy: "Guard up. Feet steady. Question by question. No panic gets to sit in your corner.",               source: "Boxing anime spirit" },
      { symbol: "flame",    title: "Break Point",        copy: "The exam is not bigger than your preparation. Let it meet the version of you that stayed.",       source: "Shonen fire spirit" },
      { symbol: "spiral",   title: "Hidden Leaf Grit",   copy: "No shortcut built you. Repetition did. Walk in with the stubborn courage that kept returning.",   source: "Naruto spirit" },
      { symbol: "burst",    title: "Hero Academia",      copy: "A real hero moves while afraid. Today your quirk is preparation, patience, and clean execution.", source: "My Hero Academia spirit" },
      { symbol: "fist",     title: "Ippo Steps",         copy: "Small steps made the fighter. Small choices will make the score. Keep your rhythm.",              source: "Hajime no Ippo spirit" },
      { symbol: "target",   title: "Court Momentum",     copy: "Jump for the next point only. The last miss cannot touch the next serve.",                        source: "Haikyuu spirit" },
      { symbol: "target",   title: "Zone Focus",         copy: "The crowd disappears. The clock disappears. Only the next question and your hand remain.",        source: "Kuroko's Basketball spirit" },
      { symbol: "compass",  title: "Scout Discipline",   copy: "Look straight at the giant. Break it into parts. Attack the weak point without drama.",           source: "Attack on Titan spirit" },
      { symbol: "shield",   title: "Shield Rise",        copy: "Every hard day became armor. Today, pressure hits you and turns into structure.",                 source: "Shield Hero spirit" },
      { symbol: "wave",     title: "Water Breathing",    copy: "Inhale, read, eliminate, choose. Let calm become your technique.",                                source: "Demon Slayer spirit" },
      { symbol: "arrow",    title: "Long Run",           copy: "This was never one sprint. It was the road you kept taking when nobody clapped.",                 source: "Run with the Wind spirit" },
    ];
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">{reveal ? "D-Day." : "Almost there."}</div>
          <div className="page-sub">29 November 2026 · CAT exam day</div>
        </div>
        <div className="sections">
          {!reveal ? (
            <div className="card dday-today-card locked">
              <div style={{fontSize:11,color:"#f97316",fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>
                Surprise under construction
              </div>
              <div style={{fontSize:26,fontWeight:900,color:"var(--tp)",lineHeight:1.15,marginBottom:10}}>
                This opens when it matters.
              </div>
              <div style={{fontSize:13,color:"var(--tt)",lineHeight:1.7}}>
                This opens strictly on Nov 29. The final room is being kept quiet for you.
              </div>
            </div>
          ) : (
            <div className="card dday-today-card reveal">
              <div className="dday-confetti" aria-hidden="true" />
              <div style={{fontSize:11,color:"#f97316",fontWeight:900,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>
                Today is not for logging
              </div>
              <div style={{fontSize:32,fontWeight:900,color:"var(--tp)",lineHeight:1.05,marginBottom:12}}>
                Go break the exam.
              </div>
              <div style={{fontSize:13,color:"var(--tt)",lineHeight:1.75,marginBottom:18,position:"relative"}}>
                No checklist today. No score pressure. Walk in calm, read cleanly, choose sharply, and trust the work you stacked for months.
              </div>
              <div className="dday-scroll-stage">
                {ddayMotifs.map((item, idx) => (
                  <div
                    key={item.title}
                    className="dday-anime-card"
                    style={{animationDelay:`${idx * 120}ms`}}
                  >
                    <div className="dday-card-mark" aria-hidden="true"><DdaySymbolIcon type={item.symbol} size={64}/></div>
                    <div className="dday-symbol" aria-hidden="true"><DdaySymbolIcon type={item.symbol} size={20}/></div>
                    <div className="dday-card-body">
                      <div className="dday-card-title">{item.title}</div>
                      <div className="dday-card-copy">{item.copy}</div>
                      <div className="dday-card-source">- {item.source}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dday-mentor-message">
                <div className="mentor-avatar">
                  <MentorAvatar size={52}/>
                </div>
                <div className="mentor-bubble ai dday-mentor-bubble" style={{flex:1}}>
                  <div className="dday-mentor-title">Vikram's final note</div>
                  Vikram here. You do not need a new strategy today. You need the courage to execute the one you earned. Breathe before every section. Fight every question on merit. Leave nothing emotional inside the hall. You are ready, and the paper is walking into your arena now.
                </div>
              </div>
              <div className="dday-gita-card">
                <div className="dday-gita-watermark" aria-hidden="true">
                  {/* feather */}
                  <span className="dday-peacock" aria-hidden="true"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M12 8C12 8 6 11 6 15a6 6 0 0 0 12 0c0-4-6-7-6-7z"/><path d="M12 8c0 0-3 2-4 5"/><path d="M12 8c0 0 3 2 4 5"/></svg></span>
                  {/* music note */}
                  <span className="dday-flute" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span>
                  {/* dharma wheel */}
                  <span className="dday-chariot" aria-hidden="true"><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="3" x2="12" y2="9.5"/><line x1="12" y1="14.5" x2="12" y2="21"/><line x1="3" y1="12" x2="9.5" y2="12"/><line x1="14.5" y1="12" x2="21" y2="12"/><line x1="5.6" y1="5.6" x2="9.9" y2="9.9"/><line x1="14.1" y1="14.1" x2="18.4" y2="18.4"/><line x1="5.6" y1="18.4" x2="9.9" y2="14.1"/><line x1="14.1" y1="9.9" x2="18.4" y2="5.6"/></svg></span>
                </div>
                <div className="dday-gita-content">
                  <div className="dday-gita-label">Gita Upadesam</div>
                  <div className="dday-gita-line">Yada yada hi dharmasya glanir bhavati Bharata...</div>
                  <div className="dday-card-copy">
                    When duty shakes, guidance appears. Krishna did not fight in Arjuna's place; he steadied Arjuna until Arjuna could stand, aim, and act.
                  </div>
                  <div className="dday-final-line">
                    Do your karma. Release the result. Step into the hall like you are guided, protected, and fully awake.
                  </div>
                </div>
              </div>
            </div>
          )}
          <button className="save-btn" onClick={() => setTab("calendar")}>
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page today-pg">
      <div className="page-header">
        <div className="page-title">{greet}</div>
        <div className="page-sub">{fmt} · Day {dn} of {totalDays}</div>
        <div style={{fontSize:12,color:"#f97316",opacity:0.8,fontStyle:"italic",marginTop:6}}>{todayQuote}</div>
        {showFinalPush && (
          <div className="final-push-note">
            You are close now. Stay boring, stay calm, and let the paper meet the version of you that refused to quit.
          </div>
        )}
      </div>
      <div className="sections">
        <div>
          <div className="sec-label">Discipline{isWeekend ? " · Weekend" : ""}</div>
          <div className="card">
            <div className="vitals-snap">
              <div className="vs-chip">
                <span className={`vs-val${sleepDurationValid ? " vs-ok" : ""}`}>
                  {hasSleepDuration ? sleepDuration.toFixed(1)+"h" : "—"}
                </span>
                <span className="vs-key">sleep</span>
              </div>
              <div className="vs-chip">
                <span className={`vs-val${d.gymDone ? " vs-ok" : ""}`}>
                  {d.gymDone ? (d.gymMinutes ? d.gymMinutes+"m" : "✓") : "—"}
                </span>
                <span className="vs-key">gym</span>
              </div>
              <div className="vs-chip">
                <span className="vs-val">{(d.waterLiters||0) > 0 ? (d.waterLiters||0)+"L" : "—"}</span>
                <span className="vs-key">water</span>
              </div>
              <div className="vs-chip">
                <span className="vs-val">{(() => {
                  const entries = d.foodEntries || [];
                  const c = entries.length > 0
                    ? entries.reduce((s,e) => s + (Number(e.calories)||0), 0)
                    : (d.calories||0);
                  return c > 0 ? c : "—";
                })()}</span>
                <span className="vs-key">kcal</span>
              </div>
            </div>
            <button type="button" className="vs-open-btn" onClick={() => setTab("vitals")}>
              Open Vitals
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Effort Score v2 */}
        <div>
          <div className="sec-label">Today's Effort</div>
          <div className="card effort-score-card">
            <div className="es2-header">
              <div>
                <div className="es2-label">Effort Score</div>
                <div className="es2-score-row">
                  <span className="es2-total">{v2Score.total}</span>
                  <span className="es2-denom">/100</span>
                </div>
              </div>
              <div className={`es2-status${v2Score.total>=80?" great":v2Score.total>=50?" good":v2Score.total>=25?" ok":""}`}>
                {v2Score.total>=80?"Excellent day!":v2Score.total>=50?"Good progress":v2Score.total>=25?"Keep going":"Let's start"}
              </div>
            </div>
            <div className="bar-track es2-bar">
              <div className="bar-fill" style={{width:`${v2Score.total}%`,background:v2Score.total>=80?"#30d158":v2Score.total>=50?"var(--ac)":v2Score.total>=25?"#f59e0b":"var(--ts)"}}/>
            </div>
            <div className="es2-chips">
              {[
                {key:"Learn",     val:v2Score.breakdown.learn,     max:30},
                {key:"Practice",  val:v2Score.breakdown.practice,  max:25},
                {key:"Errors",    val:v2Score.breakdown.errorLog,  max:15},
                {key:"Discipline",val:v2Score.breakdown.discipline,max:30},
              ].map(c=>(
                <div key={c.key} className="es2-chip">
                  <span className="es2-chip-val">{c.val}</span>
                  <span className="es2-chip-max">/{c.max}</span>
                  <span className="es2-chip-key">{c.key}</span>
                </div>
              ))}
            </div>
            <div style={{borderTop:"1px solid var(--b1)",padding:"9px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {(() => {
                const open = errorLog.filter(e => !e.fixed).length;
                return open > 0
                  ? <span style={{fontSize:10,color:"#ff453a",fontWeight:600}}>{open} open error{open===1?"":"s"}</span>
                  : <span/>;
              })()}
              <button type="button"
                onClick={() => onOpenErrorLog?.({sectionId:"", unitId:"", chapterId:""})}
                style={{background:"transparent",border:"none",color:"var(--ts)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",padding:0,letterSpacing:"0.02em"}}>
                Review Error Log →
              </button>
            </div>
          </div>
        </div>

        {/* Current Learning */}
        <div>
          <div className="sec-label">Current Learning</div>
          <div className="card">
            {missionChapterObj ? (
              <div className="cl-selected">
                <button type="button" className="cl-focus-nav-row" onClick={onShowFocusInMap || (()=>setTab("mastery"))} aria-label="Open Mastery Map">
                  <span className="cl-focus-breadcrumb">
                    {missionSection?.label} → {missionUnit?.label} → {missionChapterObj.label}
                  </span>
                  <svg className="cl-nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                {showFocusSelectors ? (
                  <>
                    <div className="mission-selectors">
                      <select className="mission-select" value={d.missionSectionId||""} onChange={e=>{upd("missionSectionId",e.target.value);upd("missionUnitId","");upd("missionChapterId","");}}>
                        <option value="">Section...</option>
                        {CAT_MASTERY_SYLLABUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <select className="mission-select" value={d.missionUnitId||""} onChange={e=>{upd("missionUnitId",e.target.value);upd("missionChapterId","");}} disabled={!missionSection}>
                        <option value="">Unit...</option>
                        {(missionSection?.units||[]).map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
                      </select>
                      <select className="mission-select" value={d.missionChapterId||""} onChange={e=>{upd("missionChapterId",e.target.value);if(e.target.value)setShowFocusSelectors(false);}} disabled={!missionUnit}>
                        <option value="">Chapter...</option>
                        {(missionUnit?.chapters||[]).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <button type="button" className="cl-change-focus-link" onClick={()=>setShowFocusSelectors(false)}>Cancel</button>
                  </>
                ) : (
                  <button type="button" className="cl-change-focus-link" onClick={()=>setShowFocusSelectors(true)}>Change Focus</button>
                )}
                <div className="cl-mode-section">
                  <div className="cl-mode-label">Doing now</div>
                  <div className="cl-mode-chips">
                    {[
                      {id:"learning",     lbl:"Learning"},
                      {id:"practice",     lbl:"Practicing"},
                      {id:"error-review", lbl:"Reviewing Errors"},
                    ].map(m=>(
                      <button key={m.id} type="button" className={`cl-mode-chip${(d.currentMode||"")===m.id?" active":""}`} onClick={()=>upd("currentMode",(d.currentMode||"")===m.id?"":m.id)}>
                        {m.lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cl-actions">
                  <button type="button" className="mission-errlog-btn" onClick={()=>onOpenErrorLog?.({sectionId:d.missionSectionId||"",unitId:d.missionUnitId||"",chapterId:d.missionChapterId||""})}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Error
                  </button>
                  <button type="button" className="cl-map-link" onClick={()=>setTab("mastery")}>
                    Mark completion in Map →
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mission-selectors">
                  <select className="mission-select" value={d.missionSectionId||""} onChange={e=>{upd("missionSectionId",e.target.value);upd("missionUnitId","");upd("missionChapterId","");}}>
                    <option value="">Section...</option>
                    {CAT_MASTERY_SYLLABUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select className="mission-select" value={d.missionUnitId||""} onChange={e=>{upd("missionUnitId",e.target.value);upd("missionChapterId","");}} disabled={!missionSection}>
                    <option value="">Unit...</option>
                    {(missionSection?.units||[]).map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                  <select className="mission-select" value={d.missionChapterId||""} onChange={e=>upd("missionChapterId",e.target.value)} disabled={!missionUnit}>
                    <option value="">Chapter...</option>
                    {(missionUnit?.chapters||[]).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="mission-empty">No focus selected</div>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="sec-label">Daily Work</div>
          <div className="card hub-snap-card">
            <div className="hub-snap-body">
              {(() => {
                const hasWork = mode !== "interview" && ((+d.q||0)+(+d.v||0)+(+d.l||0) > 0 || (+d.vp_count||0) > 0 || selfStudyMins > 0);
                if (!hasWork && mode !== "interview") {
                  return <div className="dw-snap-empty">No work logged yet.</div>;
                }
                return (
                  <div className="dw-snap-row">
                    {mode !== "interview" && (+d.q||0) > 0 && <div className="dw-snap-stat"><span className="dw-snap-val">{+d.q}</span><span className="dw-snap-key">Quant</span></div>}
                    {mode !== "interview" && (+d.v||0) > 0 && <div className="dw-snap-stat"><span className="dw-snap-val">{+d.v}</span><span className="dw-snap-key">VARC</span></div>}
                    {mode !== "interview" && (+d.l||0) > 0 && <div className="dw-snap-stat"><span className="dw-snap-val">{+d.l}</span><span className="dw-snap-key">LRDI</span></div>}
                    {mode !== "interview" && (+d.vp_count||0) > 0 && <div className="dw-snap-stat"><span className="dw-snap-val">{+d.vp_count}</span><span className="dw-snap-key">Passages</span></div>}
                    {selfStudyMins > 0 && <div className="dw-snap-stat"><span className="dw-snap-val">{selfStudyDisplay}</span><span className="dw-snap-key">Self-study</span></div>}
                  </div>
                );
              })()}
            </div>
            <button type="button" className="vs-open-btn" onClick={() => setTab("daily-work")}>
              Open Work Log
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Sudoku</div>
          <div className="card">
            <div className="card-row">
              <div>
                <div className="row-label">Sudoku solved</div>
                <div className="row-sub">Small reasoning signal</div>
              </div>
              <Tog v={d.sk} onChange={v=>upd("sk",v)} />
            </div>
            <div className="card-row">
              <div>
                <div className="row-label">Time taken</div>
                <div className="row-sub">Minutes and seconds to solve</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input
                  type="number"
                  className="time-select"
                  min="0"
                  step="1"
                  value={d.skm ?? 0}
                  onChange={e => upd("skm", e.target.value === "" ? "" : Number(e.target.value))}
                  style={{width:64,minWidth:64,padding:"8px 6px",borderColor:sudokuTimeValid ? "var(--b2)" : "#ff453a"}}
                />
                <span style={{fontSize:11,color:"var(--tt)"}}>m</span>
                <input
                  type="number"
                  className="time-select"
                  min="0"
                  max="59"
                  step="1"
                  value={d.sks ?? 0}
                  onChange={e => upd("sks", e.target.value === "" ? "" : Number(e.target.value))}
                  style={{width:64,minWidth:64,padding:"8px 6px",borderColor:sudokuTimeValid ? "var(--b2)" : "#ff453a"}}
                />
                <span style={{fontSize:11,color:"var(--tt)"}}>s</span>
                <span style={{
                  width:8,height:8,borderRadius:"50%",
                  background:sudokuTimeValid ? "#30d158" : "#ff453a",
                  flexShrink:0
                }} />
              </div>
            </div>
            <div className="card-row">
              <div>
                <div className="row-label">Difficulty</div>
                <div className="row-sub">Puzzle level</div>
              </div>
              <select
                className="time-select"
                value={d.skd || "medium"}
                onChange={e => upd("skd", e.target.value)}
                style={{minWidth:96}}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="sec-label">Vedic Math</div>
          <div className="card">
            <div className="card-row">
              <div>
                <div className="row-label">Vedic Math</div>
                <div className="row-sub">Speed maths practice</div>
              </div>
              <Tog v={d.vm} onChange={v=>upd("vm",v)} />
            </div>
            <div className="card-row">
              <div style={{flex:1,minWidth:0}}>
                <div className="row-label">Topic learnt</div>
                <div className="row-sub">Vedic Math concept</div>
              </div>
              <input
                type="text"
                className="time-select"
                placeholder="e.g. Nikhilam"
                value={d.vmt || ""}
                onChange={e => upd("vmt", e.target.value)}
                style={{width:150,minWidth:0}}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="sec-label">iQuanta Hub</div>
          <div className="card hub-snap-card">
            <div className="hub-snap-body">
              {currentWatchingBacklog ? (
                <div className="hub-snap-watch">
                  <span className="hub-snap-watch-label">Watching</span>
                  <span className="hub-snap-watch-text">{currentWatchingBacklog.item.text}</span>
                </div>
              ) : (
                <div className="hub-snap-watch hub-snap-watch--empty">No item watching</div>
              )}
              <div className="hub-snap-stats" style={{marginTop:3}}>
                {iqSessionStats.available > 0
                  ? `${iqSessionStats.done}/${iqSessionStats.available} classes`
                  : "No sessions due"}
                {totalBacklog > 0 ? ` · ${backlogPending} backlog pending` : ""}
              </div>
            </div>
            <button type="button" className="vs-open-btn" onClick={() => setTab("iquanta")}>
              Open iQuanta Hub
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Journal</div>
          <div className="card">
            <textarea
              className="textarea"
              placeholder="Journal — what did you study, what slipped, what to fix tomorrow?"
              value={d.n||""}
              onChange={e=>upd("n",e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {showApplicationToggle && (
          <div>
            <div className="sec-label">CAT Exam Application</div>
            <div className={`card application-card${d.ca ? " done" : ""}`}>
              <div className="card-row">
                <div>
                  <div className="row-label">CAT application submitted</div>
                  <div className="row-sub">Key task · +1 effort point · Aug 1 - Sept 20</div>
                </div>
                <Tog v={d.ca} onChange={v=>upd("ca",v)} />
              </div>
            </div>
          </div>
        )}

        {showInstaCard && (
          <InstaCard
            dayNumber={dn}
            totalDays={totalDays}
            daysLeft={dl}
            totals={totals}
            todayData={d}
            data={data}
            userName={userName}
            userInitials={userInitials}
            theme={theme}
            effortScore={v2Score.total}
            avatarGender={avatarGender}
            avatarSkin={avatarSkin}
            avatarHair={avatarHair}
            avatarHairColor={avatarHairColor}
            avatarShirt={avatarShirt}
            avatarGlasses={avatarGlasses}
            avatarBeard={avatarBeard}
            avatarMustache={avatarMustache}
            onClose={() => setShowInstaCard(false)}
          />
        )}

        <div style={{
          display:"flex", gap:10,
          justifyContent:"center",
          marginTop:8
        }}>
          <button
            className={`save-btn${saved?" saved":""}`}
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
              onSave && onSave();
            }}
            style={{flex:2, maxWidth:200}}
          >
            {saved ? "Saved" : "Save Day"}
          </button>

          <button
            onClick={() => setShowInstaCard(true)}
            title="Share today's card"
            aria-label="Share today's card"
            style={{
              width:52, height:52, flex:"0 0 52px",
              background:"rgba(249,115,22,0.08)",
              border:"1px solid rgba(249,115,22,0.35)",
              borderRadius:16, color:"#f97316",
              cursor:"pointer", display:"flex",
              alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 18px rgba(249,115,22,0.12)"
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12"/>
              <path d="M7 8l5-5 5 5"/>
              <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatNoteDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getNoteText(note) {
  return note?.note_text ?? note?.text ?? "";
}

function getNoteCreatedAt(note) {
  return note?.created_at ?? note?.createdAt ?? "";
}

function getNoteUpdatedAt(note) {
  return note?.updated_at ?? note?.updatedAt ?? getNoteCreatedAt(note);
}

function getNoteTitle(note) {
  const text = getNoteText(note).trim();
  if (!text) return "Untitled Note";
  const firstLine = text.split("\n").map(line => line.trim()).find(Boolean);
  const source = firstLine || text;
  return source.length > 60 ? `${source.slice(0, 57).trim()}...` : source;
}

function getNotePreview(note) {
  const text = getNoteText(note).replace(/\s+/g, " ").trim();
  if (!text) return "No note text yet.";
  return text.length > 96 ? `${text.slice(0, 93).trim()}...` : text;
}

function normalizeAcademicNote(note) {
  const now = new Date().toISOString();
  return {
    id: note?.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    user_id: note?.user_id,
    note_text: getNoteText(note),
    created_at: getNoteCreatedAt(note) || now,
    updated_at: getNoteUpdatedAt(note) || getNoteCreatedAt(note) || now,
  };
}

function readLocalAcademicNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem("conquer_academic_notes") || "[]");
    return Array.isArray(saved) ? saved.map(normalizeAcademicNote) : [];
  } catch {
    return [];
  }
}

function NotesPage({ notes, onBack, userId, syncMessage, onSaveNote, onDeleteNote }) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [noteError, setNoteError] = useState("");

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => new Date(getNoteUpdatedAt(b)) - new Date(getNoteUpdatedAt(a)));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedNotes;
    return sortedNotes.filter(note => {
      const createdAt = getNoteCreatedAt(note);
      const updatedAt = getNoteUpdatedAt(note);
      const created = formatNoteDate(createdAt).toLowerCase();
      const updated = formatNoteDate(updatedAt).toLowerCase();
      return getNoteText(note).toLowerCase().includes(q) ||
        createdAt?.slice(0, 10).includes(q) ||
        updatedAt?.slice(0, 10).includes(q) ||
        created.includes(q) ||
        updated.includes(q);
    });
  }, [search, sortedNotes]);

  const openNewNote = () => {
    setActiveNote(null);
    setEditingId(null);
    setDraft("");
    setEditorOpen(true);
    setNoteError("");
  };

  const openNote = (note) => {
    setActiveNote(note);
    setEditingId(note.id);
    setDraft(getNoteText(note));
    setEditorOpen(true);
    setNoteError("");
  };

  const saveNote = async () => {
    const text = draft.trim();
    if (!text) return;
    if (!userId) {
      setNoteError("Notes sync needs your user ID. Reopen the app after profile sync.");
      return;
    }
    setSaving(true);
    setNoteError("");
    try {
      await onSaveNote({ id: editingId, noteText: text });
      setDraft("");
      setEditingId(null);
      setActiveNote(null);
      setEditorOpen(false);
    } catch (err) {
      setNoteError(err?.message || "Could not save note.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id) => {
    setSaving(true);
    setNoteError("");
    try {
      await onDeleteNote(id);
      if (editingId === id) {
        setDraft("");
        setEditingId(null);
        setActiveNote(null);
        setEditorOpen(false);
      }
    } catch (err) {
      setNoteError(err?.message || "Could not delete note.");
    } finally {
      setSaving(false);
    }
  };

  const inEditor = editorOpen;

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={inEditor ? () => {
          setDraft("");
          setEditingId(null);
          setActiveNote(null);
          setEditorOpen(false);
          setNoteError("");
        } : onBack} style={{
          background:"transparent", border:"none",
          color:"#f97316", fontSize:15, cursor:"pointer",
          fontFamily:"inherit", display:"flex",
          alignItems:"center", gap:4, padding:0, marginBottom:8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#f97316" strokeWidth="2"
            strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          {inEditor ? "Notes" : "Today"}
        </button>
        <div className="page-title">Academic Notes</div>
        <div className="page-sub">Notes sync when you save them.</div>
      </div>

      <div className="sections">
        {syncMessage && (
          <div className="card" style={{padding:"11px 14px", color:"var(--tt)", fontSize:12, lineHeight:1.5}}>
            {syncMessage}
          </div>
        )}
        {noteError && (
          <div className="card" style={{padding:"11px 14px", color:"#ff453a", fontSize:12, lineHeight:1.5}}>
            {noteError}
          </div>
        )}
        {inEditor ? (
          <div className="card" style={{padding:"16px"}}>
            <textarea
              className="textarea"
              placeholder="Write notes, formulas, mistakes, class points, strategy observations..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={10}
            />
            <div style={{display:"flex", gap:10, marginTop:12, flexWrap:"wrap"}}>
              <button
                onClick={saveNote}
                disabled={!draft.trim() || saving}
                style={{
                  padding:"11px 18px", border:"none", borderRadius:10,
                  background:draft.trim() && !saving ? "#f97316" : "var(--b2)",
                  color:"white", fontSize:14, fontWeight:800,
                  fontFamily:"inherit", cursor:draft.trim() && !saving ? "pointer" : "not-allowed"
                }}
              >
                {saving ? "Saving..." : editingId ? "Update Note" : "Save Note"}
              </button>
              {editingId && (
                <button
                  onClick={() => deleteNote(editingId)}
                  disabled={saving}
                  style={{
                    padding:"11px 18px", border:"1px solid var(--b2)",
                    borderRadius:10, background:"transparent", color:"#ff453a",
                    fontSize:14, fontWeight:700, fontFamily:"inherit",
                    cursor:saving ? "not-allowed" : "pointer"
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:10}}>
              <div className="sec-label" style={{marginBottom:0}}>Saved Notes ({notes.length})</div>
              <button
                onClick={openNewNote}
                style={{
                  padding:"8px 12px", border:"1px solid rgba(249,115,22,0.35)",
                  borderRadius:8, background:"rgba(249,115,22,0.10)",
                  color:"#f97316", fontSize:12, fontWeight:800,
                  fontFamily:"inherit", cursor:"pointer"
                }}
              >
                New Note
              </button>
            </div>
            <input
              type="search"
              placeholder="Search notes or date, e.g. 2026-06-05"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:"100%", background:"var(--s2)", border:"1px solid var(--b2)",
                borderRadius:10, padding:"12px 14px", color:"var(--tp)",
                fontSize:14, fontFamily:"inherit", outline:"none", marginBottom:12
              }}
            />
            <div style={{display:"flex", flexDirection:"column", gap:12}}>
              {filteredNotes.map(note => (
                <div key={note.id} className="card" style={{padding:0}}>
                  <button
                    onClick={() => openNote(note)}
                    style={{
                      width:"100%", padding:"14px 16px", background:"transparent",
                      border:"none", textAlign:"left", fontFamily:"inherit",
                      cursor:"pointer"
                    }}
                  >
                    <div style={{fontSize:15, fontWeight:800, color:"var(--tp)", lineHeight:1.25}}>
                      {getNoteTitle(note)}
                    </div>
                    <div style={{
                      fontSize:12, color:"var(--tt)", lineHeight:1.45,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                      marginTop:5
                    }}>
                      {getNotePreview(note)}
                    </div>
                    <div style={{fontSize:11, color:"var(--tt)", lineHeight:1.5, marginTop:8}}>
                      {getNoteUpdatedAt(note) && getNoteUpdatedAt(note) !== getNoteCreatedAt(note)
                        ? `Updated ${formatNoteDate(getNoteUpdatedAt(note))}`
                        : `Created ${formatNoteDate(getNoteCreatedAt(note))}`}
                    </div>
                  </button>
                  <div style={{
                    display:"flex", gap:8, justifyContent:"flex-end",
                    padding:"0 16px 14px"
                  }}>
                    <button onClick={() => openNote(note)} style={{
                      background:"var(--s2)", border:"1px solid var(--b2)",
                      color:"var(--tp)", borderRadius:8, padding:"7px 10px",
                      fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer"
                    }}>Edit</button>
                    <button onClick={() => deleteNote(note.id)} style={{
                      background:"transparent", border:"1px solid var(--b2)",
                      color:"#ff453a", borderRadius:8, padding:"7px 10px",
                      fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer"
                    }}>Delete</button>
                  </div>
                </div>
              ))}
              {filteredNotes.length === 0 && (
                <div className="card" style={{padding:"28px 16px", textAlign:"center", color:"var(--tt)", fontSize:13}}>
                  {notes.length ? "No notes match your search." : "No saved notes yet."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BacklogPage({ videos, setVideos, concepts, setConcepts, onBack, focusTarget, onFocusConsumed }) {
  const [videoInput, setVideoInput] = useState("");
  const [conceptInput, setConceptInput] = useState("");
  const itemRefs = useRef({});
  const [jumpHighlightKey, setJumpHighlightKey] = useState(null);

  const createItem = (text) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: text.trim(),
    checked: false,
    addedDate: new Date().toISOString().split("T")[0],
    checkedDate: null,
    watching: false,
    watchingStartedAt: null
  });

  const addVideo = (text) => {
    if (!text.trim()) return;
    setVideos(prev => [...prev, createItem(text)]);
    setVideoInput("");
  };

  const addConcept = (text) => {
    if (!text.trim()) return;
    setConcepts(prev => [...prev, createItem(text)]);
    setConceptInput("");
  };

  const toggleVideo = (id) => {
    setVideos(prev => prev.map(item =>
      item.id === id
        ? (() => {
          const nextChecked = !item.checked;
          return {
            ...item,
            checked: nextChecked,
            checkedDate: nextChecked
              ? new Date().toISOString().split("T")[0]
              : null,
            watching: nextChecked ? false : item.watching,
            watchingStartedAt: nextChecked ? null : item.watchingStartedAt
          };
        })()
        : item
    ));
  };

  const toggleConcept = (id) => {
    setConcepts(prev => prev.map(item =>
      item.id === id
        ? (() => {
          const nextChecked = !item.checked;
          return {
            ...item,
            checked: nextChecked,
            checkedDate: nextChecked
              ? new Date().toISOString().split("T")[0]
              : null,
            watching: nextChecked ? false : item.watching,
            watchingStartedAt: nextChecked ? null : item.watchingStartedAt
          };
        })()
        : item
    ));
  };

  const setWatchingItem = (kind, id) => {
    const now = new Date().toISOString();
    const isAlreadyWatching = kind === "video"
      ? videos.some(item => item.id === id && item.watching)
      : concepts.some(item => item.id === id && item.watching);
    setVideos(prev => prev.map(item => {
      const active = !isAlreadyWatching && kind === "video" && item.id === id;
      return {
        ...item,
        watching: active,
        watchingStartedAt: active ? now : null
      };
    }));
    setConcepts(prev => prev.map(item => {
      const active = !isAlreadyWatching && kind === "concept" && item.id === id;
      return {
        ...item,
        watching: active,
        watchingStartedAt: active ? now : null
      };
    }));
  };

  const clearWatching = () => {
    setVideos(prev => prev.map(item => ({
      ...item,
      watching: false,
      watchingStartedAt: null
    })));
    setConcepts(prev => prev.map(item => ({
      ...item,
      watching: false,
      watchingStartedAt: null
    })));
  };

  const deleteVideo = (id) => {
    setVideos(prev => prev.filter(item => item.id !== id));
  };

  const deleteConcept = (id) => {
    setConcepts(prev => prev.filter(item => item.id !== id));
  };

  const totalDone = videos.filter(i=>i.checked).length +
                    concepts.filter(i=>i.checked).length;
  const total = videos.length + concepts.length;
  const coverage = total > 0 ? Math.round((totalDone/total)*100) : 0;
  const currentWatching = getCurrentWatchingBacklog(videos, concepts);

  useEffect(() => {
    if (!focusTarget?.kind || !focusTarget?.id) return;
    const key = `${focusTarget.kind}:${focusTarget.id}`;
    const row = itemRefs.current[key];
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      setJumpHighlightKey(key);
      setTimeout(() => setJumpHighlightKey(prev => prev === key ? null : prev), 1800);
    }
    onFocusConsumed?.();
  }, [focusTarget, onFocusConsumed]);

  const renderSection = ({
    kind,
    title,
    subtitle,
    icon,
    accent,
    items,
    input,
    setInput,
    addItem,
    toggleItem,
    deleteItem,
    placeholder
  }) => {
    const pending = items.filter(i => !i.checked);
    const done = items.filter(i => i.checked);

    return (
      <div className="card" style={{padding:"16px", borderTop:`2px solid ${accent}`}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
          <div style={{
            width:34, height:34, borderRadius:8,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:`${accent}18`, color:accent, flexShrink:0
          }}>
            {icon}
          </div>
          <div>
            <div style={{fontSize:15, fontWeight:800, color:"var(--tp)"}}>{title}</div>
            <div style={{fontSize:11, color:"var(--tt)", marginTop:2}}>{subtitle}</div>
          </div>
        </div>

        <div className="sec-label">{title.toUpperCase()} ({items.length})</div>
        <div style={{display:"flex", gap:8, marginBottom:14}}>
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem(input);
              }
            }}
            style={{
              flex:1, background:"var(--s2)",
              border:"1px solid var(--b2)", borderRadius:8,
              padding:"10px 12px", color:"var(--tp)",
              fontSize:14, fontFamily:"inherit",
              outline:"none", minWidth:0
            }}
          />
          <button
            onClick={() => addItem(input)}
            style={{
              background:accent, border:"none",
              borderRadius:8, color:"white",
              fontSize:18, fontWeight:700,
              width:44, cursor:"pointer", flexShrink:0
            }}
          >+</button>
        </div>

        {pending.length > 0 && (
          <div style={{marginBottom:14}}>
            <div className="sec-label">Pending ({pending.length})</div>
            <div style={{borderTop:"1px solid var(--b1)"}}>
              {pending.map(item => {
                const isWatching = !!item.watching;
                const itemKey = `${kind}:${item.id}`;
                const isJumpHighlighted = jumpHighlightKey === itemKey;
                return (
                <div
                  key={item.id}
                  ref={node => {
                    if (node) itemRefs.current[itemKey] = node;
                    else delete itemRefs.current[itemKey];
                  }}
                  className={isJumpHighlighted ? "backlog-jump-highlight" : ""}
                  style={{
                  display:"flex", alignItems:"center",
                  gap:12, padding:"12px 8px",
                  borderBottom:"1px solid var(--b1)",
                  borderRadius:isWatching ? 10 : 0,
                  outline:isWatching ? "1px solid rgba(48,209,88,0.45)" : "none",
                  outlineOffset:-1,
                  background:isWatching ? "rgba(48,209,88,0.07)" : "transparent",
                  boxShadow:isWatching ? "0 0 18px rgba(48,209,88,0.16)" : "none"
                }}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    style={{
                      width:22, height:22,
                      borderRadius:6,
                      border:"2px solid var(--b2)",
                      background:"transparent",
                      cursor:"pointer", flexShrink:0,
                      display:"flex", alignItems:"center",
                      justifyContent:"center"
                    }}
                  />
                  <div style={{
                    flex:1, fontSize:14,
                    color:"var(--tp)", lineHeight:1.4,
                    minWidth:0
                  }}>
                    <div style={{
                      overflow:"hidden",
                      textOverflow:"ellipsis"
                    }}>{item.text}</div>
                    {isWatching && (
                      <div style={{
                        marginTop:4,
                        color:"#30d158",
                        fontSize:11,
                        fontWeight:800,
                        letterSpacing:"0.04em",
                        textTransform:"uppercase"
                      }}>
                        Watching now
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setWatchingItem(kind, item.id)}
                    aria-pressed={isWatching}
                    title={isWatching ? "Watching now" : "Mark as watching"}
                    style={{
                      border:isWatching ? "1px solid rgba(48,209,88,0.55)" : "1px solid var(--b2)",
                      background:isWatching ? "rgba(48,209,88,0.14)" : "transparent",
                      color:isWatching ? "#30d158" : "var(--tt)",
                      borderRadius:8,
                      padding:"6px 8px",
                      fontSize:12,
                      fontWeight:800,
                      cursor:"pointer",
                      lineHeight:1,
                      flexShrink:0
                    }}
                  >
                    {isWatching ? "Watching" : "▶"}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      background:"transparent", border:"none",
                      color:"var(--tt)", fontSize:18,
                      cursor:"pointer", padding:"0 4px",
                      lineHeight:1
                    }}
                  ><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
              );
              })}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <div className="sec-label">Completed ({done.length})</div>
            <div style={{borderTop:"1px solid var(--b1)"}}>
              {done.map(item => (
                <div key={item.id} style={{
                  display:"flex", alignItems:"center",
                  gap:12, padding:"12px 0",
                  borderBottom:"1px solid var(--b1)",
                  opacity:0.5
                }}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    style={{
                      width:22, height:22,
                      borderRadius:6,
                      border:`2px solid ${accent}`,
                      background:`${accent}26`,
                      cursor:"pointer", flexShrink:0,
                      display:"flex", alignItems:"center",
                      justifyContent:"center"
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke={accent} strokeWidth="3"
                      strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>
                  <span style={{
                    flex:1, fontSize:14,
                    color:"var(--tt)", lineHeight:1.4,
                    textDecoration:"line-through"
                  }}>{item.text}</span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      background:"transparent", border:"none",
                      color:"var(--tt)", fontSize:18,
                      cursor:"pointer", padding:"0 4px"
                    }}
                  ><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div style={{
            textAlign:"center", color:"var(--tt)",
            fontSize:13, padding:"34px 0", lineHeight:2
          }}>
            Nothing here yet.<br/>
            <span style={{color:"var(--tt)"}}>Add the first item above.</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{
          background:"transparent", border:"none",
          color:"#f97316", fontSize:15, cursor:"pointer",
          fontFamily:"inherit", display:"flex",
          alignItems:"center", gap:4, padding:0, marginBottom:8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#f97316" strokeWidth="2"
            strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">iQuanta Backlog</div>
        <div className="page-sub">Videos to watch. Concepts to fix.</div>

        {total > 0 && (
          <div style={{
            marginTop:12, padding:"10px 14px",
            background:"rgba(249,115,22,0.08)",
            border:"1px solid rgba(249,115,22,0.2)",
            borderRadius:10, display:"flex",
            justifyContent:"space-between", alignItems:"center"
          }}>
            <span style={{fontSize:12,color:"var(--tt)"}}>
              Coverage: {totalDone}/{total} completed
            </span>
            <span style={{
              fontSize:14, fontWeight:700,
              color: coverage >= 70 ? "#30d158" : coverage >= 40 ? "#f97316" : "#ff453a"
            }}>{coverage}%</span>
          </div>
        )}

        <div style={{
          marginTop:12,
          padding:"10px 14px",
          background:"rgba(48,209,88,0.07)",
          border:"1px solid rgba(48,209,88,0.22)",
          borderRadius:10,
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          gap:12
        }}>
          <div style={{minWidth:0}}>
            <div style={{
              fontSize:11,
              color:"var(--tt)",
              letterSpacing:"0.08em",
              textTransform:"uppercase",
              marginBottom:4
            }}>
              Currently watching:
            </div>
            <div style={{
              fontSize:14,
              fontWeight:800,
              color:"var(--tp)",
              overflow:"hidden",
              textOverflow:"ellipsis",
              whiteSpace:"nowrap"
            }}>
              {currentWatching
                ? `${currentWatching.type} · ${currentWatching.item.text}`
                : "Nothing selected"}
            </div>
          </div>
          {currentWatching && (
            <button
              onClick={clearWatching}
              style={{
                border:"1px solid rgba(48,209,88,0.35)",
                background:"transparent",
                color:"#30d158",
                borderRadius:8,
                padding:"6px 10px",
                fontSize:12,
                fontWeight:800,
                cursor:"pointer",
                flexShrink:0
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",
        gap:16
      }}>
        {renderSection({
          kind: "video",
          title: "Videos",
          subtitle: "iQuanta backlog videos",
          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
          accent: "#f97316",
          items: videos,
          input: videoInput,
          setInput: setVideoInput,
          addItem: addVideo,
          toggleItem: toggleVideo,
          deleteItem: deleteVideo,
          placeholder: "Video name or topic..."
        })}
        {renderSection({
          kind: "concept",
          title: "Concepts",
          subtitle: "Missing concepts to revise",
          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>,
          accent: "#3b82f6",
          items: concepts,
          input: conceptInput,
          setInput: setConceptInput,
          addItem: addConcept,
          toggleItem: toggleConcept,
          deleteItem: deleteConcept,
          placeholder: "Concept or topic name..."
        })}
      </div>

    </div>
  );
}

function normalizeAssessmentQuestion(q) {
  return {
    ...q,
    question_text: q?.question_text || q?.questionText || "",
    correct_answer: q?.correct_answer || q?.correctAnswer || "",
    wrong_explanations: q?.wrong_explanations || q?.wrongOptionExplanations || {},
    topic: String(q?.topic || q?.section || "").toLowerCase(),
  };
}

function TimetablePage({ timetable, setTimetable, onBack, userId, DAYS_OF_WEEK, TOPICS, onSaveToChat }) {
  const [saved, setSaved] = useState(false);
  const [localTT, setLocalTT] = useState(() => JSON.parse(JSON.stringify(timetable)));

  const updateDay = (day, field, value) => {
    setLocalTT(prev => {
      const next = { ...prev, [day]: { ...prev[day], [field]: value } };
      if (field === "topic" && next[day].appSameAsLive) {
        next[day].appTopic = value;
      }
      if (field === "subtopic" && next[day].appSameAsLive) {
        next[day].appSubtopic = value;
      }
      if (field === "appSameAsLive" && value) {
        next[day].appTopic = next[day].topic;
        next[day].appSubtopic = next[day].subtopic;
      }
      return next;
    });
  };

  const handleSave = () => {
    setTimetable(localTT);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (userId) {
      fetch("/api/user/update", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ userId, weekly_timetable: localTT })
      }).catch(console.error);
    }
    if (onSaveToChat) onSaveToChat(localTT);
  };

  const dropStyle = {
    background:"var(--s2)", border:"1px solid var(--b2)",
    borderRadius:8, padding:"8px 10px",
    color:"var(--tp)", fontSize:13, fontFamily:"inherit",
    outline:"none", cursor:"pointer",
    appearance:"none", WebkitAppearance:"none",
    minWidth:90
  };
  const inputStyle = {
    flex:1, background:"var(--s2)", border:"1px solid var(--b2)",
    borderRadius:8, padding:"8px 10px",
    color:"var(--tp)", fontSize:13, fontFamily:"inherit",
    outline:"none", minWidth:0
  };

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{
          background:"transparent", border:"none",
          color:"#f97316", fontSize:15, cursor:"pointer",
          fontFamily:"inherit", display:"flex",
          alignItems:"center", gap:4, padding:0, marginBottom:8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#f97316" strokeWidth="2"
            strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">Weekly Timetable</div>
        <div className="page-sub">Set your iQuanta schedule for the week</div>
      </div>

      <div className="sections">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {DAYS_OF_WEEK.map(day => {
            const entry = localTT[day] || { topic:"None", subtopic:"", appSameAsLive:true, appTopic:"None", appSubtopic:"" };
            return (
              <div key={day} className="card" style={{padding:"14px 16px"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f97316",marginBottom:12}}>
                  {day}{day === "Sunday" ? " · No live class (usually)" : ""}
                </div>

                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11,color:"var(--tt)",marginBottom:6,
                    letterSpacing:"0.06em",textTransform:"uppercase"}}>
                    Live Class · 7PM - 9PM
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <select
                      style={dropStyle}
                      value={entry.topic}
                      onChange={e => updateDay(day, "topic", e.target.value)}
                    >
                      {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Sub-topic e.g. Percentages"
                      value={entry.subtopic}
                      onChange={e => updateDay(day, "subtopic", e.target.value)}
                      style={inputStyle}
                      disabled={entry.topic === "None"}
                    />
                  </div>
                </div>

                <div>
                  <div style={{display:"flex",alignItems:"center",
                    justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:11,color:"var(--tt)",
                      letterSpacing:"0.06em",textTransform:"uppercase"}}>
                      Application Class · 10PM - 12AM
                    </div>
                    <label style={{display:"flex",alignItems:"center",
                      gap:6,cursor:"pointer",fontSize:11,color:"var(--tt)"}}>
                      <input type="checkbox"
                        checked={entry.appSameAsLive}
                        onChange={e => updateDay(day, "appSameAsLive", e.target.checked)}
                        style={{accentColor:"#f97316"}}
                      />
                      Same as live
                    </label>
                  </div>
                  {!entry.appSameAsLive && (
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <select
                        style={dropStyle}
                        value={entry.appTopic}
                        onChange={e => updateDay(day, "appTopic", e.target.value)}
                      >
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Sub-topic"
                        value={entry.appSubtopic}
                        onChange={e => updateDay(day, "appSubtopic", e.target.value)}
                        style={inputStyle}
                        disabled={entry.appTopic === "None"}
                      />
                    </div>
                  )}
                  {entry.appSameAsLive && entry.topic !== "None" && (
                    <div style={{fontSize:12,color:"var(--tt)",fontStyle:"italic"}}>
                      {entry.topic}{entry.subtopic ? ` — ${entry.subtopic}` : ""}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className={`save-btn${saved ? " saved" : ""}`}
          onClick={handleSave}
        >
          {saved ? "Saved" : "Save Timetable"}
        </button>
      </div>
    </div>
  );
}

function AssessmentPage({ userId, onBack, setMentorMessages, isSunday, onAutoSend }) {
  const sessionType = isSunday ? "weekly" : "daily";
  const assessmentDate = todayKeyIST();
  const storageKey = `conquer_assessment_${userId || "local"}_${assessmentDate}_${sessionType}`;
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [assessmentError, setAssessmentError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const expectedCount = getAssessmentQuestionCount(sessionType);

    const loadAssessment = async () => {
      setLoading(true);
      setAssessmentError("");

      try {
        if (!userId) throw new Error("Missing user ID");
        const res = await fetch(`/api/assessment/session/${encodeURIComponent(userId)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.error) throw new Error(data.error || "Assessment session failed");
        if (data.completed) {
          if (!cancelled) {
            setCompleted(true);
            setLoading(false);
          }
          return;
        }

        const backendQuestions = (data.session?.questionObjects || []).map(normalizeAssessmentQuestion);
        if (backendQuestions.length !== expectedCount) {
          throw new Error(`Backend returned ${backendQuestions.length}/${expectedCount} questions`);
        }

        if (!cancelled) {
          setSession(data.session);
          setQuestions(backendQuestions);
          setAnswers(data.session?.answers || []);
          setCompleted(false);
          setScore((data.session?.answers || []).filter(a => a.isCorrect).length);
          setCurrentIdx(Math.min(data.session?.current_index || 0, backendQuestions.length - 1));
          setLoading(false);
        }
      } catch (err) {
        console.warn("Assessment service unavailable:", err?.message || err);
        if (!cancelled) {
          setSession(null);
          setQuestions([]);
          setAnswers([]);
          setCompleted(false);
          setScore(0);
          setCurrentIdx(0);
          setAssessmentError("Assessment service unavailable. Try again.");
          setLoading(false);
        }
      }
    };

    loadAssessment();
    return () => { cancelled = true; };
  }, [sessionType, storageKey, userId]);

  const persistProgress = useCallback((next) => {
    localStorage.setItem(storageKey, JSON.stringify({
      date: assessmentDate,
      type: sessionType,
      currentIdx,
      answers,
      completed,
      ...next
    }));
  }, [answers, assessmentDate, completed, currentIdx, sessionType, storageKey]);

  const handleSelect = (option) => {
    if (result) return;
    setSelected(option);
  };

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    const q = questions[currentIdx];
    setSubmitting(true);
    const isCorrect = selected === q.correct_answer;
    const localResult = {
      isCorrect,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      wrongExplanation: isCorrect ? "" : q.wrong_explanations?.[selected]
    };
    setResult(localResult);

    const newAnswer = {
      questionId: q.id,
      topic: q.topic,
      userAnswer: selected,
      correctAnswer: q.correct_answer,
      isCorrect,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    persistProgress({ answers: updatedAnswers, currentIdx: currentIdx + 1 });
    if (isCorrect) setScore(s => s + 1);

    try {
      if (userId) {
        const answerRes = await fetch("/api/assessment/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            sessionId: session?.id || null,
            questionId: q.id,
            userAnswer: selected,
            correctAnswer: q.correct_answer,
            topic: q.topic,
          })
        });
        const answerData = await answerRes.json().catch(() => ({}));
        if (!answerRes.ok) throw new Error(answerData.error || "Answer save failed");
        setResult(prev => ({
          ...prev,
          isCorrect: answerData.isCorrect ?? prev.isCorrect,
          correctAnswer: answerData.correctAnswer || prev.correctAnswer,
          explanation: answerData.explanation || prev.explanation,
        }));
      }
    } catch (err) {
      console.warn("Assessment answer save failed:", err?.message || err);
    }

    try {
      if (session?.id) {
        await fetch("/api/assessment/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            currentIndex: currentIdx + 1,
            answers: updatedAnswers,
          })
        });
      }
    } catch (err) {
      console.warn("Assessment progress save failed:", err?.message || err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    const completedAnswers = result
      ? [...answers]
      : answers;
    if (currentIdx + 1 >= questions.length) {
      const finalScore = completedAnswers.filter(a => a.isCorrect).length;
      persistProgress({ answers: completedAnswers, currentIdx: questions.length, completed: true });

      if (session?.id && userId) {
        fetch("/api/assessment/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            sessionId: session.id,
            type: sessionType,
            score: finalScore,
            total: questions.length,
            answers: completedAnswers,
          })
        }).catch(err => console.warn("Assessment completion save failed:", err?.message || err));
      }

      const topicScores = ASSESSMENT_TOPICS.map(t => {
        const tAnswers = completedAnswers.filter(a => a.topic === t);
        const correct = tAnswers.filter(a => a.isCorrect).length;
        return `${t.toUpperCase()}: ${correct}/${tAnswers.length}`;
      }).join(", ");

      const autoMsg = `${sessionType === "weekly" ? "Weekly" : "Daily"} assessment complete. Score: ${finalScore}/${questions.length}. ${topicScores}.`;
      if (onAutoSend) {
        onAutoSend(autoMsg);
      } else {
        setMentorMessages(p => [...p, { r:"user", t: autoMsg }]);
      }

      setCompleted(true);
      return;
    }
    const nextIdx = currentIdx + 1;
    setCurrentIdx(nextIdx);
    persistProgress({ answers: completedAnswers, currentIdx: nextIdx });
    setSelected(null);
    setResult(null);
  };

  const topicColors = { quant:"#f97316", varc:"#3b82f6", lrdi:"#22c55e" };

  if (loading) return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{background:"transparent",border:"none",
          color:"#f97316",fontSize:15,cursor:"pointer",fontFamily:"inherit",
          display:"flex",alignItems:"center",gap:4,padding:0,marginBottom:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#f97316" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">Preparing assessment...</div>
      </div>
    </div>
  );

  if (assessmentError) return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{background:"transparent",border:"none",
          color:"#f97316",fontSize:15,cursor:"pointer",fontFamily:"inherit",
          display:"flex",alignItems:"center",gap:4,padding:0,marginBottom:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#f97316" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">Assessment Unavailable</div>
      </div>
      <div className="card" style={{padding:"22px 18px",textAlign:"center"}}>
        <div style={{fontSize:15,fontWeight:700,color:"var(--tp)",marginBottom:8}}>
          {assessmentError}
        </div>
        <div style={{fontSize:13,color:"var(--tt)",lineHeight:1.6}}>
          Vikram will use the server question bank once it is reachable.
        </div>
        <button
          onClick={onBack}
          style={{marginTop:18,padding:"11px 24px",
            background:"#f97316",border:"none",borderRadius:10,
            color:"white",fontSize:14,fontWeight:700,
            cursor:"pointer",fontFamily:"inherit"}}>
          Back to Today
        </button>
      </div>
    </div>
  );

  if (completed) return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{background:"transparent",border:"none",
          color:"#f97316",fontSize:15,cursor:"pointer",fontFamily:"inherit",
          display:"flex",alignItems:"center",gap:4,padding:0,marginBottom:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#f97316" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">Assessment Done</div>
      </div>
      <div className="card" style={{padding:"24px 20px",textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="9,12 11,14 15,10"/></svg>
        </div>
        <div style={{fontSize:18,fontWeight:700,color:"#30d158",marginBottom:8}}>
          {sessionType === "weekly" ? "Weekly" : "Daily"} assessment complete
        </div>
        <div style={{fontSize:14,color:"var(--tt)"}}>
          Score: {score}/{questions.length}. Vikram has your results in chat.
        </div>
        <button
          onClick={onBack}
          style={{marginTop:20,padding:"12px 32px",
            background:"#f97316",border:"none",borderRadius:10,
            color:"white",fontSize:14,fontWeight:700,
            cursor:"pointer",fontFamily:"inherit"}}>
          Back to Today
        </button>
      </div>
    </div>
  );

  const q = questions[currentIdx];
  if (!q) return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{background:"transparent",border:"none",
          color:"#f97316",fontSize:15,cursor:"pointer",fontFamily:"inherit",
          display:"flex",alignItems:"center",gap:4,padding:0,marginBottom:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#f97316" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">Assessment Unavailable</div>
      </div>
      <div className="card" style={{padding:"22px 18px",textAlign:"center"}}>
        <div style={{fontSize:15,fontWeight:700,color:"var(--tp)"}}>
          Assessment service unavailable. Try again.
        </div>
      </div>
    </div>
  );
  const topicColor = topicColors[q.topic] || "#f97316";

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{background:"transparent",border:"none",
          color:"#f97316",fontSize:15,cursor:"pointer",fontFamily:"inherit",
          display:"flex",alignItems:"center",gap:4,padding:0,marginBottom:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#f97316" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div className="page-title">
            {sessionType === "weekly" ? "Weekly" : "Daily"} Assessment
          </div>
          <div style={{fontSize:12,color:"var(--tt)"}}>
            {currentIdx + 1}/{questions.length}
          </div>
        </div>
        <div style={{marginTop:8,height:4,background:"var(--b1)",borderRadius:2}}>
          <div style={{
            height:"100%",borderRadius:2,
            background:topicColor,
            width:`${((currentIdx+1)/questions.length)*100}%`,
            transition:"width 0.3s"
          }}/>
        </div>
      </div>

      <div className="sections">
        <div className="card" style={{padding:"20px 16px"}}>
          <div style={{
            display:"inline-block",padding:"3px 10px",
            borderRadius:20,background:`${topicColor}22`,
            border:`1px solid ${topicColor}44`,
            fontSize:11,fontWeight:700,color:topicColor,
            letterSpacing:"0.06em",textTransform:"uppercase",
            marginBottom:14
          }}>
            {q.topic} · {q.difficulty?.replace("_"," ")}
          </div>
          <div style={{fontSize:15,color:"var(--tp)",
            lineHeight:1.7,whiteSpace:"pre-wrap"}}>
            {q.question_text}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {(q.options || []).map((option, i) => {
            const isSelected = selected === option;
            const isCorrect = result && option === result.correctAnswer;
            const isWrong = result && isSelected && !result.isCorrect;
            let bg = "var(--s2)";
            let border = "1px solid var(--b2)";
            let color = "var(--tp)";
            if (isCorrect) { bg = "rgba(48,209,88,0.15)"; border = "1px solid #30d158"; color = "#30d158"; }
            else if (isWrong) { bg = "rgba(255,69,58,0.15)"; border = "1px solid #ff453a"; color = "#ff453a"; }
            else if (isSelected && !result) { bg = `${topicColor}22`; border = `1px solid ${topicColor}`; color = topicColor; }
            return (
              <button key={i} onClick={() => handleSelect(option)} style={{
                width:"100%",padding:"14px 16px",
                background:bg, border, borderRadius:10,
                color, fontSize:14, fontFamily:"inherit",
                cursor: result ? "default" : "pointer",
                textAlign:"left", lineHeight:1.5,
                transition:"all 0.15s"
              }}>
                <span style={{fontWeight:700,marginRight:10,opacity:0.6}}>
                  {String.fromCharCode(65+i)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {result && (
          <div className="card" style={{
            padding:"16px",
            borderLeft:`3px solid ${result.isCorrect ? "#30d158" : "#ff453a"}`
          }}>
            <div style={{
              fontSize:14,fontWeight:700,marginBottom:8,
              color: result.isCorrect ? "#30d158" : "#ff453a"
            }}>
              {result.isCorrect ? "Correct" : "Wrong"}
            </div>
          <div style={{fontSize:13,color:"var(--ts)",lineHeight:1.6}}>
              {!result.isCorrect && (
                <div style={{marginBottom:8}}>
                  <strong style={{color:"var(--tp)"}}>Correct answer: </strong>
                  {result.correctAnswer}
                </div>
              )}
              {!result.isCorrect && result.wrongExplanation && (
                <div style={{marginBottom:8}}>
                  <strong style={{color:"var(--tp)"}}>Why your answer is wrong: </strong>
                  {result.wrongExplanation}
                </div>
              )}
              {result.explanation}
            </div>
          </div>
        )}

        {!result ? (
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            style={{
              width:"100%",padding:"14px",
              background: selected ? topicColor : "var(--b2)",
              border:"none",borderRadius:10,
              color:"white",fontSize:15,fontWeight:700,
              cursor: selected ? "pointer" : "not-allowed",
              fontFamily:"inherit"
            }}>
            {submitting ? "Checking..." : "Submit Answer"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              width:"100%",padding:"14px",
              background:topicColor,
              border:"none",borderRadius:10,
              color:"white",fontSize:15,fontWeight:700,
              cursor:"pointer",fontFamily:"inherit"
            }}>
            {currentIdx + 1 >= questions.length ? "Finish Assessment" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

function ProgressPage({ data, totals, dl, dn, start, totalDays, backlogVideos, backlogConcepts, setTab }) {
  const isPhone = useMediaQuery("(max-width: 767px)");
  const subj = [
    {id:"quant",lbl:"Quant",tar:2000,act:totals.quant,dailyTarget:10},
    {id:"varc",lbl:"VARC",tar:1000,act:totals.varc,dailyTarget:5},
    {id:"lrdi",lbl:"LRDI",tar:1000,act:totals.lrdi,dailyTarget:5},
  ];

  const chartData = useMemo(() => {
    let totalEffort = 0;
    const points = [{ day: 0, targetLine: 0, actualLine: 0 }];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const k = toLocalDateKey(d);
      const e = data[k];
      if (i + 1 <= dn) {
        totalEffort += effortScore(e || defaultDay(), backlogVideos, backlogConcepts);
      }
      points.push({
        day: i + 1,
        targetLine: totalDays > 0 ? Math.round(((i + 1) / totalDays) * 100) : 0,
        actualLine: i + 1 <= dn ? Math.round(totalEffort / (i + 1)) : null,
      });
    }
    const pastPoints = points.filter(p => p.day > 0 && p.actualLine !== null);
    if (pastPoints.length > 0 && pastPoints.every(p => p.actualLine === 0)) {
      console.warn("[Progress] All effort scores are 0 — check session field mapping");
    }
    return points;
  }, [data, dn, start, totalDays, backlogVideos, backlogConcepts]);

  const progressInsights = useMemo(() => {
    const metTargets = day =>
      (+day?.q || 0) >= 10 &&
      (+day?.v || 0) >= 5 &&
      (+day?.l || 0) >= 5 &&
      (+day?.vp_count || 0) >= 1;
    const scoreForDay = day => effortScore(day || defaultDay(), backlogVideos, backlogConcepts);
    const todayDate = new Date(todayKey() + "T00:00:00");
    let streak = 0;
    for (let d = new Date(todayDate); ; d.setDate(d.getDate() - 1)) {
      const key = toLocalDateKey(d);
      if (!metTargets(data[key])) break;
      streak += 1;
    }
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - (6 - i));
      const key = toLocalDateKey(d);
      const day = data[key];
      const label = d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 1);
      return { key, label, date: d.getDate(), score: scoreForDay(day), met: metTargets(day), hasEntry: !!day };
    });
    const trend = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - (13 - i));
      const key = toLocalDateKey(d);
      return { key, score: scoreForDay(data[key]) };
    });
    const last7 = trend.slice(7).reduce((sum, p) => sum + p.score, 0) / 7;
    const prev7 = trend.slice(0, 7).reduce((sum, p) => sum + p.score, 0) / 7;
    const maxScore = Math.max(100, ...trend.map(p => p.score));
    const points = trend.map((p, i) => {
      const x = trend.length <= 1 ? 0 : (i / (trend.length - 1)) * 100;
      const y = 44 - (Math.min(p.score, maxScore) / maxScore) * 38;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return {
      streak,
      week,
      trendLabel: last7 > prev7 ? "Trending up" : "Steady",
      trendPoints: points,
      last7Avg: Math.round(last7),
    };
  }, [data, backlogVideos, backlogConcepts]);

  const totalH = Object.values(data).reduce((a, d) => {
    const mins =
      (d.lc && !d.lc_na ? 120 : 0) +
      (d.as && !d.as_na ? 40 : 0) +
      (d.ap && !d.ap_na ? 120 : 0) +
      (d.vp && !d.vp_na ? 20 : 0) +
      ((+d.ph || 0) * 60) +
      (+d.pm || 0);
    return a + mins / 60;
  }, 0);

  return (
    <div className="page progress-page">
      <div className="page-header">
        <div className="page-title">Progress</div>
        <div className="page-sub">CAT 2026 · 99.9%ile target</div>
      </div>
      <div className="sections progress-sections">
        <div className="card progress-days-card">
          <div>
            <div className="big-num">{dl}</div>
            <div className="progress-days-lbl">Days remaining</div>
          </div>
          <div className="progress-days-right">
            <div className="progress-day-num">Day {dn}</div>
            <div className="progress-day-of">of {totalDays}</div>
          </div>
        </div>

        <div>
          <div className="sec-label">Scoreboard</div>
          <div className="progress-subj-col">
            {subj.map(s => {
              const pct = Math.min((s.act / s.tar) * 100, 100);
              const nd = Math.ceil((s.tar - s.act) / Math.max(dl, 1));
              return (
                <div key={s.id} className="card progress-subj-card">
                  <div className="progress-subj-head">
                    <span className="progress-subj-name">{s.lbl}</span>
                    <span className="progress-subj-val">
                      {s.act.toLocaleString()} <span className="progress-subj-tar">/ {s.tar.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{width:`${pct}%`}} /></div>
                  <div className="progress-subj-foot">
                    <span>{pct.toFixed(1)}% complete</span>
                    <span style={{color: nd <= s.dailyTarget ? "var(--green)" : AC}}>{nd}/day to stay on track</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="sec-label">Journey Score</div>
          <div className="card progress-chart-card">
            {isPhone && (
              <div className="progress-insights">
                <div className="progress-streak-mini">
                  <span>{progressInsights.streak}</span>
                  <div>
                    <strong>day streak</strong>
                    <small>daily targets met</small>
                  </div>
                </div>
                <div className="progress-week-mini">
                  {progressInsights.week.map(day => (
                    <div key={day.key} className="progress-week-day">
                      <span className={`progress-week-dot ${day.met ? "met" : day.hasEntry ? "missed" : "empty"}`} />
                      <small>{day.label}</small>
                    </div>
                  ))}
                </div>
                <div className="progress-trend-mini">
                  <div>
                    <strong>Effort trend</strong>
                    <span>{progressInsights.trendLabel} · {progressInsights.last7Avg}% avg</span>
                  </div>
                  <svg viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points={progressInsights.trendPoints} />
                  </svg>
                </div>
              </div>
            )}
            <div className="progress-chart-legend">
              <div className="progress-chart-legend-item"><div className="progress-legend-swatch" style={{background:"#f5c518"}}/><span>Target</span></div>
              <div className="progress-chart-legend-item"><div className="progress-legend-swatch" style={{background:"#3b82f6"}}/><span>Actual</span></div>
              <span className="progress-legend-note">Above yellow = ahead of schedule</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{top:0,right:12,bottom:0,left:-24}}>
                <CartesianGrid stroke="var(--b1)" vertical={false} />
                <XAxis dataKey="day" domain={[0, totalDays]} tick={{fontSize:9,fill:"var(--tt)"}} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize:9,fill:"var(--tt)"}} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{background:"var(--s2)",border:"1px solid var(--b2)",borderRadius:8,fontSize:11}}
                  labelStyle={{color:"var(--ts)"}} itemStyle={{color:"var(--tp)"}}
                  labelFormatter={v => `Day ${v}`}
                  formatter={(v, n) => [`${Math.round(v)}%`, n === "targetLine" ? "Target" : "Actual"]}
                />
                <Line type="monotone" dataKey="targetLine" stroke="#f5c518" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                <Line type="monotone" dataKey="actualLine" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-grid">
          {[
            {n: Object.keys(data).length, l:"Days logged"},
            {n: `${totalH.toFixed(0)}h`, l:"Study hours"},
            {n: (totals.quant+totals.varc+totals.lrdi).toLocaleString(), l:"Total problems", c: AC},
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-num" style={s.c ? {color:s.c} : {}}>{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        {setTab && (
          <button type="button" className="progress-insta-btn" onClick={() => setTab("insta")}>
            <div className="progress-insta-btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="1"/>
              </svg>
            </div>
            <div className="progress-insta-btn-text">
              <div className="progress-insta-btn-label">Share Progress Card</div>
              <div className="progress-insta-btn-sub">Generate your Insta-ready CAT card</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function MasteryNumberInput({ label, value, onChange, max }) {
  const displayValue = value > 0 ? value : "";
  return (
    <label className="mastery-num-field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        max={max ?? undefined}
        inputMode="numeric"
        value={displayValue}
        placeholder="0"
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}

function MasteryWorkspaceBlock({ title, status, pillarActive, onTogglePillar, children }) {
  return (
    <section className="mastery-workspace-block">
      <div className="mastery-workspace-block-head">
        <div>
          <h3>{title}</h3>
          <span>{status}</span>
        </div>
        <button
          type="button"
          className={`mastery-workspace-pillar${pillarActive ? " active" : ""}`}
          aria-pressed={pillarActive}
          onClick={onTogglePillar}
        >
          {pillarActive ? "✓ Completed" : "Mark complete"}
        </button>
      </div>
      {children}
    </section>
  );
}

function ChapterWorkspace({ target, progress, onClose, onUpdatePillar, onUpdateConfig, onOpenErrorLog, errorLog }) {
  useEffect(() => {
    if (!target) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const chapterProgress = getChapterMastery(progress, target.chapter.id);
  const { pillars, config } = chapterProgress;
  const updateConfig = (field, value) => onUpdateConfig(target.chapter.id, field, value);
  const togglePillar = (pillarId) => onUpdatePillar(target.chapter.id, pillarId, !pillars[pillarId]);

  return (
    <div className="mastery-workspace-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="mastery-workspace"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mastery-workspace-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="mastery-workspace-head">
          <div className="mastery-workspace-kicker">
            <span>{target.section.label}</span>
            <span>{target.unit.label}</span>
          </div>
          <button type="button" className="mastery-workspace-close" onClick={onClose} aria-label="Close chapter workspace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h2 id="mastery-workspace-title">{target.chapter.label}</h2>
        <div className="mastery-workspace-sub">
          Use after finishing chapter work.
        </div>

        <div className="mastery-workspace-content">
          <MasteryWorkspaceBlock
            title="Learn"
            status={`${formatMasteryPair(config.learnLiveConceptDone, config.learnLiveConceptTotal)} classes`}
            pillarActive={!!pillars.learn}
            onTogglePillar={() => togglePillar("learn")}
          >
            <div className="mastery-input-grid">
              <MasteryNumberInput
                label="Classes total"
                value={config.learnLiveConceptTotal}
                onChange={value => updateConfig("learnLiveConceptTotal", value)}
              />
              <MasteryNumberInput
                label="Completed"
                value={config.learnLiveConceptDone}
                max={config.learnLiveConceptTotal}
                onChange={value => updateConfig("learnLiveConceptDone", value)}
              />
            </div>
          </MasteryWorkspaceBlock>

          <MasteryWorkspaceBlock
            title="Practice"
            status={`${formatMasteryPair(config.questionsCompleted, config.totalPracticeQuestions)} questions`}
            pillarActive={!!pillars.practice}
            onTogglePillar={() => togglePillar("practice")}
          >
            <div className="mastery-input-grid">
              <MasteryNumberInput
                label="App total"
                value={config.applicationClassesTotal}
                onChange={value => updateConfig("applicationClassesTotal", value)}
              />
              <MasteryNumberInput
                label="App done"
                value={config.applicationClassesDone}
                max={config.applicationClassesTotal}
                onChange={value => updateConfig("applicationClassesDone", value)}
              />
              <MasteryNumberInput
                label="Assignments total"
                value={config.assignmentsTotal}
                onChange={value => updateConfig("assignmentsTotal", value)}
              />
              <MasteryNumberInput
                label="Assignments done"
                value={config.assignmentsDone}
                max={config.assignmentsTotal}
                onChange={value => updateConfig("assignmentsDone", value)}
              />
              <MasteryNumberInput
                label="Questions total"
                value={config.totalPracticeQuestions}
                onChange={value => updateConfig("totalPracticeQuestions", value)}
              />
              <MasteryNumberInput
                label="Questions done"
                value={config.questionsCompleted}
                max={config.totalPracticeQuestions}
                onChange={value => updateConfig("questionsCompleted", value)}
              />
            </div>
          </MasteryWorkspaceBlock>

          <MasteryWorkspaceBlock
            title="Error Log"
            status={config.errorLogCount > 0 ? `${config.errorLogCount} errors logged` : "No errors logged"}
            pillarActive={!!pillars.errorLog}
            onTogglePillar={() => togglePillar("errorLog")}
          >
            <div className="mastery-input-grid one">
              <MasteryNumberInput
                label="Error count"
                value={config.errorLogCount}
                onChange={value => updateConfig("errorLogCount", value)}
              />
            </div>
            {(() => {
              const trackerCount = (errorLog||[]).filter(e => e.chapterId === target.chapter.id).length;
              return (
                <button
                  type="button"
                  className="mastery-errlog-link"
                  onClick={() => onOpenErrorLog?.({
                    sectionId: target.section.id,
                    unitId: target.unit.id,
                    chapterId: target.chapter.id,
                  })}
                >
                  {trackerCount > 0 ? `${trackerCount} tracker entr${trackerCount===1?"y":"ies"} · ` : ""}Open Error Log
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              );
            })()}
          </MasteryWorkspaceBlock>
        </div>
      </aside>
    </div>
  );
}

function MasteryMapPage({ progress, setProgress, onOpenErrorLog, errorLog, todayFocus = {}, onSetTodayFocus, pendingMapFocusJump = false, onMapFocusJumpConsumed }) {
  const allChapters = useMemo(
    () => CAT_MASTERY_SYLLABUS.flatMap(section => section.units.flatMap(unit => unit.chapters)),
    []
  );
  const overall = useMemo(() => getMasteryAggregate(allChapters, progress), [allChapters, progress]);
  const sections = useMemo(
    () => CAT_MASTERY_SYLLABUS.map(section => {
      const chapters = section.units.flatMap(unit => unit.chapters);
      return { ...section, stats: getMasteryAggregate(chapters, progress) };
    }),
    [progress]
  );

  // Initialise to focused section/unit so there's no flash of "All" on mount
  const [selectedSection, setSelectedSection] = useState(() => {
    const fSec = todayFocus?.missionSectionId || "";
    return ["quant","lrdi","varc"].includes(fSec) ? fSec : "all";
  });
  const [expandedUnits, setExpandedUnits] = useState(() => {
    const uid = todayFocus?.missionUnitId;
    return uid ? new Set([uid]) : new Set();
  });
  const [workspaceTarget, setWorkspaceTarget] = useState(null);
  const [showFocusSelector, setShowFocusSelector] = useState(false);
  const [focusDraft, setFocusDraft] = useState({ sectionId:"", unitId:"", chapterId:"" });
  const [highlightedChapterId, setHighlightedChapterId] = useState(null);

  const focusSectionId = todayFocus?.missionSectionId || "";
  const focusUnitId    = todayFocus?.missionUnitId    || "";
  const focusChapterId = todayFocus?.missionChapterId || "";
  const focusCurrentMode = todayFocus?.currentMode    || "";
  const focusSectionObj  = focusSectionId ? CAT_MASTERY_SYLLABUS.find(s => s.id === focusSectionId) : null;
  const focusUnitObj     = focusSectionObj?.units.find(u => u.id === focusUnitId) || null;
  const focusChapterObj  = focusUnitObj?.chapters.find(c => c.id === focusChapterId) || null;
  const hasFocus         = !!(focusChapterObj);
  const draftSectionObj  = CAT_MASTERY_SYLLABUS.find(s => s.id === focusDraft.sectionId) || null;
  const draftUnitObj     = draftSectionObj?.units.find(u => u.id === focusDraft.unitId) || null;

  // When user clicks "Current Learning" on Today, jump & highlight in catalogue
  useEffect(() => {
    if (!pendingMapFocusJump) return;
    onMapFocusJumpConsumed?.();
    if (!focusSectionId || !focusUnitId || !focusChapterId) return;
    setSelectedSection(focusSectionId);
    setExpandedUnits(prev => new Set([...prev, focusUnitId]));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(`chapter-card-${focusChapterId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedChapterId(focusChapterId);
      setTimeout(() => setHighlightedChapterId(null), 1800);
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMapFocusJump]);

  const getInitialExpanded = useCallback((sectionId) => {
    if (sectionId === "all") return new Set();
    const section = CAT_MASTERY_SYLLABUS.find(s => s.id === sectionId);
    if (!section) return new Set();
    const firstIncomplete = section.units.find(
      unit => getMasteryAggregate(unit.chapters, progress).pct < 100
    );
    const target = firstIncomplete || section.units[0];
    return target ? new Set([target.id]) : new Set();
  }, [progress]);

  const handleSelectSection = (sectionId) => {
    setSelectedSection(sectionId);
    setExpandedUnits(getInitialExpanded(sectionId));
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  const handleFindInMap = () => {
    if (!focusSectionId || !focusUnitId || !focusChapterId) return;
    setSelectedSection(focusSectionId);
    setExpandedUnits(prev => new Set([...prev, focusUnitId]));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`chapter-card-${focusChapterId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedChapterId(focusChapterId);
        setTimeout(() => setHighlightedChapterId(null), 1800);
      });
    });
  };

  const updatePillar = (chapterId, pillarId, checked) => {
    setProgress(prev => {
      const current = normalizeChapterMastery(prev?.[chapterId]);
      return {
        ...prev,
        [chapterId]: {
          ...current,
          pillars: { ...current.pillars, [pillarId]: checked },
        },
      };
    });
  };

  const updateChapterConfig = (chapterId, field, value) => {
    setProgress(prev => {
      const current = normalizeChapterMastery(prev?.[chapterId]);
      return {
        ...prev,
        [chapterId]: {
          ...current,
          config: normalizeMasteryConfig({ ...current.config, [field]: value }),
        },
      };
    });
  };

  const SECTION_TABS = [
    { id: "all", label: "All" },
    { id: "quant", label: "Quant" },
    { id: "lrdi", label: "LRDI" },
    { id: "varc", label: "VARC" },
  ];

  const visibleSections = selectedSection === "all"
    ? sections
    : sections.filter(s => s.id === selectedSection);

  return (
    <div className="page mastery-page">
      <div className="page-header">
        <div className="page-title">Mastery Map</div>
        <div className="page-sub">CAT 2026 / Learn · Practice · Error Log</div>
      </div>

      {/* ── Current Focus card ── */}
      <div className="card map-focus-card">
        <div className="map-focus-label">Current Focus</div>
        {hasFocus ? (
          showFocusSelector ? (
            <>
              <div className="mission-selectors" style={{marginTop:8}}>
                <select className="mission-select" value={focusDraft.sectionId} onChange={e=>setFocusDraft({sectionId:e.target.value,unitId:"",chapterId:""})}>
                  <option value="">Section...</option>
                  {CAT_MASTERY_SYLLABUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select className="mission-select" value={focusDraft.unitId} onChange={e=>setFocusDraft(p=>({...p,unitId:e.target.value,chapterId:""}))} disabled={!draftSectionObj}>
                  <option value="">Unit...</option>
                  {(draftSectionObj?.units||[]).map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
                <select className="mission-select" value={focusDraft.chapterId} onChange={e=>{
                  const cid=e.target.value, sid=focusDraft.sectionId, uid=focusDraft.unitId;
                  setFocusDraft(p=>({...p,chapterId:cid}));
                  if(cid&&sid&&uid){onSetTodayFocus?.(sid,uid,cid,"");setShowFocusSelector(false);}
                }} disabled={!draftUnitObj}>
                  <option value="">Chapter...</option>
                  {(draftUnitObj?.chapters||[]).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <button type="button" className="cl-change-focus-link" style={{marginTop:6}} onClick={()=>setShowFocusSelector(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button type="button" className="map-focus-show-row" onClick={handleFindInMap} aria-label="Show chapter in catalogue">
                <span className="map-focus-chapter">
                  {focusSectionObj.label} → {focusUnitObj.label} → {focusChapterObj.label}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <div className="cl-mode-section">
                <div className="cl-mode-label">Doing now</div>
                <div className="cl-mode-chips">
                  {[
                    {id:"learning",     lbl:"Learning"},
                    {id:"practice",     lbl:"Practicing"},
                    {id:"error-review", lbl:"Reviewing Errors"},
                  ].map(m=>(
                    <button key={m.id} type="button"
                      className={`cl-mode-chip${focusCurrentMode===m.id?" active":""}`}
                      onClick={()=>onSetTodayFocus?.(focusSectionId,focusUnitId,focusChapterId,focusCurrentMode===m.id?"":m.id)}>
                      {m.lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="map-focus-actions">
                <button type="button" className="map-focus-resume-btn"
                  onClick={()=>setWorkspaceTarget({section:focusSectionObj,unit:focusUnitObj,chapter:focusChapterObj})}>
                  Resume Focus
                </button>
                <button type="button" className="map-focus-change-btn"
                  onClick={()=>{setFocusDraft({sectionId:focusSectionId,unitId:focusUnitId,chapterId:focusChapterId});setShowFocusSelector(true);}}>
                  Change Focus
                </button>
                <button type="button" className="map-focus-errors-btn"
                  onClick={()=>onOpenErrorLog?.({sectionId:focusSectionId,unitId:focusUnitId,chapterId:focusChapterId})}>
                  Review Errors
                </button>
              </div>
            </>
          )
        ) : (
          <>
            <div className="map-focus-empty">No current focus set</div>
            {showFocusSelector ? (
              <>
                <div className="mission-selectors" style={{marginTop:8}}>
                  <select className="mission-select" value={focusDraft.sectionId} onChange={e=>setFocusDraft({sectionId:e.target.value,unitId:"",chapterId:""})}>
                    <option value="">Section...</option>
                    {CAT_MASTERY_SYLLABUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select className="mission-select" value={focusDraft.unitId} onChange={e=>setFocusDraft(p=>({...p,unitId:e.target.value,chapterId:""}))} disabled={!draftSectionObj}>
                    <option value="">Unit...</option>
                    {(draftSectionObj?.units||[]).map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                  <select className="mission-select" value={focusDraft.chapterId} onChange={e=>{
                    const cid=e.target.value, sid=focusDraft.sectionId, uid=focusDraft.unitId;
                    setFocusDraft(p=>({...p,chapterId:cid}));
                    if(cid&&sid&&uid){onSetTodayFocus?.(sid,uid,cid,"");setShowFocusSelector(false);}
                  }} disabled={!draftUnitObj}>
                    <option value="">Chapter...</option>
                    {(draftUnitObj?.chapters||[]).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <button type="button" className="cl-change-focus-link" style={{marginTop:6}} onClick={()=>setShowFocusSelector(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" className="map-focus-choose-btn"
                onClick={()=>{setFocusDraft({sectionId:"",unitId:"",chapterId:""});setShowFocusSelector(true);}}>
                Choose Focus
              </button>
            )}
          </>
        )}
      </div>

      <div className="mastery-overall">
        <div className="mastery-overall-left">
          <span className="mastery-overall-pct">{overall.pct}%</span>
          <span className="mastery-overall-label">overall mastery</span>
        </div>
        <span className="mastery-overall-stats">
          {overall.completedChapters}/{overall.totalChapters} ch · {overall.completed}/{overall.total} pillars
        </span>
      </div>
      <div
        className="bar-track mastery-overall-bar"
        role="progressbar"
        aria-label="Overall mastery"
        aria-valuenow={overall.pct}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div className="bar-fill" style={{ width: `${overall.pct}%` }} />
      </div>

      <div className="mastery-tabs" role="tablist" aria-label="Section filter">
        {SECTION_TABS.map(tab => {
          const sStats = tab.id !== "all" ? sections.find(s => s.id === tab.id)?.stats : null;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedSection === tab.id}
              className={`mastery-tab${selectedSection === tab.id ? " active" : ""}${tab.id === focusSectionId && tab.id !== "all" ? " current-focus-section" : ""}${tab.id !== "all" ? ` mastery-tab-${tab.id}` : ""}`}
              onClick={() => handleSelectSection(tab.id)}
            >
              {tab.label}
              {sStats && <span className="mastery-tab-badge">{sStats.pct}%</span>}
            </button>
          );
        })}
      </div>

      {selectedSection === "all" && (
        <div className="mastery-sec-cards">
          {sections.map(section => (
            <button
              key={section.id}
              type="button"
              className={`mastery-sec-card mastery-sec-card-${section.id}`}
              onClick={() => handleSelectSection(section.id)}
            >
              <div className="mastery-sec-card-row">
                <span className="mastery-sec-card-name">{section.label}</span>
                <span className="mastery-sec-card-pct">{section.stats.pct}%</span>
              </div>
              <div className="bar-track mastery-sec-bar">
                <div className="bar-fill" style={{ width: `${section.stats.pct}%` }} />
              </div>
              <div className="mastery-sec-card-sub">
                {section.stats.completedChapters}/{section.stats.totalChapters} chapters · {section.units.length} units →
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedSection !== "all" && visibleSections.map(section => (
        <div key={section.id} className={`mastery-acc mastery-acc-${section.id}`}>
          {section.units.map(unit => {
            const unitStats = getMasteryAggregate(unit.chapters, progress);
            const isExpanded = expandedUnits.has(unit.id);
            return (
              <div key={unit.id} className={`mastery-acc-unit${unitStats.pct === 100 ? " complete" : ""}${unit.id === focusUnitId ? " current-focus-unit" : ""}`}>
                <button
                  type="button"
                  className="mastery-acc-hdr"
                  aria-expanded={isExpanded}
                  aria-controls={`uc-${unit.id}`}
                  onClick={() => toggleUnit(unit.id)}
                >
                  <div className="mastery-acc-hdr-top">
                    <div className="mastery-acc-hdr-left">
                      <span className="mastery-acc-unit-name">{unit.label}</span>
                      <span className="mastery-acc-unit-sub">
                        {unitStats.completedChapters}/{unitStats.totalChapters} ch
                      </span>
                    </div>
                    <div className="mastery-acc-hdr-right">
                      <span className="mastery-acc-unit-pct">{unitStats.pct}%</span>
                      <svg
                        className={`mastery-chevron${isExpanded ? " open" : ""}`}
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                  <div className="bar-track mastery-acc-unit-bar-full">
                    <div className="bar-fill" style={{ width: `${unitStats.pct}%` }} />
                  </div>
                </button>

                {isExpanded && (
                  <div id={`uc-${unit.id}`} className="mastery-acc-body">
                    {unit.chapters.map(chapter => {
                      const chP = getChapterMastery(progress, chapter.id);
                      const chS = getChapterMasteryStats(progress, chapter.id);
                      return (
                        <div key={chapter.id} id={`chapter-card-${chapter.id}`} className={`mastery-ch-row${chS.pct === 100 ? " done" : ""}${chapter.id === focusChapterId ? " current-focus-chapter" : ""}${highlightedChapterId === chapter.id ? " chapter-card-focus-pulse" : ""}`}>
                          <div className="mastery-ch-top">
                            <span className="mastery-ch-name">{chapter.label}</span>
                            {chapter.id === focusChapterId && <span className="ch-now-badge" aria-label="Current focus">Now</span>}
                            <div className="mastery-ch-actions">
                              <span className={`mastery-ch-count${chS.pct === 100 ? " done" : chS.completed > 0 ? " partial" : ""}`}>
                                {chS.completed}/{chS.total}
                              </span>
                              <button
                                type="button"
                                className="mastery-config-btn"
                                onClick={() => setWorkspaceTarget({ section, unit, chapter })}
                              >
                                Configure
                              </button>
                            </div>
                          </div>
                          <div className="mastery-ch-config-summary">
                            {getChapterConfigSummary(chP.config)}
                          </div>
                          <div className="mastery-ch-bar-wrap">
                            <div
                              className="bar-track mastery-ch-bar"
                              role="progressbar"
                              aria-label={chapter.label}
                              aria-valuenow={chS.pct}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              <div className="bar-fill" style={{ width: `${chS.pct}%` }} />
                            </div>
                          </div>
                          <div className="mastery-ch-pillars">
                            {MASTERY_PILLARS.map(pillar => {
                              const active = !!chP.pillars[pillar.id];
                              return (
                                <button
                                  key={pillar.id}
                                  type="button"
                                  className={`mastery-pill${active ? " active" : ""}`}
                                  aria-pressed={active}
                                  onClick={() => updatePillar(chapter.id, pillar.id, !active)}
                                >
                                  {active && (
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                  {pillar.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <ChapterWorkspace
        target={workspaceTarget}
        progress={progress}
        onClose={() => setWorkspaceTarget(null)}
        onUpdatePillar={updatePillar}
        onUpdateConfig={updateChapterConfig}
        onOpenErrorLog={onOpenErrorLog}
        errorLog={errorLog}
      />
    </div>
  );
}

function CalendarPage({ data, sel, onSel, start, totalDays }) {
  const today = todayKey();
  const monthRefs = useRef({});
  const calendarData = useMemo(() => {
    const dayMeta = new Map();
    Array.from({length: totalDays}, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const k = toLocalDateKey(d);
      const e = data[k];
      let status = "";
      if (e) {
        const mq=(+e.q||0)>=10, mv=(+e.v||0)>=5, ml=(+e.l||0)>=5, mvp=(+e.vp_count||0)>=1;
        status = mq && mv && ml && mvp ? "done" : "partial";
      }
      if (isApplicationWindow(k) && !e?.ca) status = `${status} app-due`.trim();
      if (isFinalPushDate(k)) status = `${status} final-push`.trim();
      dayMeta.set(k, { k, day:i+1, isToday: k===today, status });
    });

    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastPrepDay = new Date(EXAM_DATE);
    lastPrepDay.setDate(lastPrepDay.getDate() - 1);
    const months = [];
    for (
      let cursor = new Date(startMonth);
      cursor <= lastPrepDay;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    ) {
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const visibleStart = monthStart < start ? new Date(start) : monthStart;
      const visibleEnd = monthEnd > lastPrepDay ? lastPrepDay : monthEnd;
      const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}`;
      const monthLabel = cursor.toLocaleDateString("en-IN", { month:"short", year:"numeric" });
      const state = monthKey < today.slice(0, 7)
        ? "past"
        : monthKey === today.slice(0, 7)
          ? "current"
          : "future";
      const cells = [];
      for (let i = 0; i < visibleStart.getDay(); i++) cells.push(null);
      for (let d = new Date(visibleStart); d <= visibleEnd; d.setDate(d.getDate() + 1)) {
        const meta = dayMeta.get(toLocalDateKey(d));
        cells.push(meta ? {...meta, dateNum: d.getDate()} : null);
      }
      months.push({ key: monthKey, label: monthLabel, state, cells });
    }
    return months;
  }, [data, start, totalDays, today]);

  const scrollToMonth = useCallback((monthKey) => {
    const el = monthRefs.current[monthKey];
    if (!el) return;
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">{totalDays} Days</div>
        <div className="page-sub">Every cell is a choice. Nov 29 is the day.</div>
      </div>
      <div className="sections">
        <div className="month-strip">
          {calendarData.map(m => (
            <button
              key={m.key}
              type="button"
              className={`month-chip ${m.state}`}
              onClick={() => scrollToMonth(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          {[{bg:"rgba(249,115,22,.14)",bd:"rgba(249,115,22,.3)",lbl:"All targets met"},
            {bg:"rgba(249,115,22,.05)",bd:"rgba(249,115,22,.15)",lbl:"Partial"},
            {bg:"rgba(59,130,246,.12)",bd:"rgba(59,130,246,.35)",lbl:"CAT application pending"},
            {bg:"rgba(48,209,88,.12)",bd:"rgba(48,209,88,.4)",lbl:"Final push"},
            {bg:"var(--s2)",bd:"var(--b1)",lbl:"No entry"}].map(l => (
            <div key={l.lbl} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:11,height:11,borderRadius:3,background:l.bg,border:`1px solid ${l.bd}`}} />
              <span style={{fontSize:11,color:"var(--tt)"}}>{l.lbl}</span>
            </div>
          ))}
        </div>
        <div className="calendar-months">
          {calendarData.map(month => (
            <div key={month.key} className="calendar-month" ref={el => { monthRefs.current[month.key] = el }}>
              <div className="calendar-month-title">{month.label}</div>
              <div className="calendar-week-head">
                {["S","M","T","W","T","F","S"].map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
              </div>
              <div className="calendar-month-grid">
                {month.cells.map((d, i) => d ? (
                  <button key={d.k}
                    type="button"
                    className={`cal-cell ${d.status} ${d.isToday?"today":""} ${d.k===sel?"selected":""}`}
                    onClick={() => onSel(d.k)}
                    title={`Day ${d.day}`}
                  >
                    <span className="cal-day-num">{d.day}</span>
                    <span className="cal-date-num">{d.dateNum}</span>
                  </button>
                ) : <span key={`blank-${i}`} className="cal-cell blank" />)}
              </div>
            </div>
          ))}
        </div>
        <div className={`dday-island${sel===EXAM_DATE_KEY ? " selected" : ""}`} onClick={() => onSel(EXAM_DATE_KEY)} role="button" tabIndex={0}>
          <div className="dday-label">D-Day</div>
          <div className="dday-date">Nov 29</div>
          <div className="dday-copy">CAT 2026. Go break the exam.</div>
        </div>
      </div>
    </div>
  );
}


// ── MENTOR CONTEXT BUILDER ──────────────────────────────────────────────────
function buildMentorContext({ date, dayData, masteryProgress = {}, errorLog = [], backlogVideos = [], backlogConcepts = [], academicNotes = [] }) {
  const d = dayData || defaultDay();

  const ev2 = calculateEffortScoreV2({ dayData: d, masteryProgress, date });
  const effortTotal = ev2.total;
  const effortBreakdown = ev2.breakdown;

  const missionChapterId = d.missionChapterId || "";
  const missionSectionId = d.missionSectionId || "";
  const missionUnitId = d.missionUnitId || "";
  let missionSectionName = "", missionUnitName = "", missionChapterName = "";
  if (missionChapterId) {
    outer: for (const sec of CAT_MASTERY_SYLLABUS) {
      for (const unit of sec.units) {
        const ch = unit.chapters.find(c => c.id === missionChapterId);
        if (ch) {
          missionSectionName = sec.label || sec.name || sec.id;
          missionUnitName = unit.label || unit.name || unit.id;
          missionChapterName = ch.label || ch.name || ch.id;
          break outer;
        }
      }
    }
  }
  const chMastery = missionChapterId ? getChapterMastery(masteryProgress, missionChapterId) : null;
  const missionPillars = chMastery ? chMastery.pillars : { learn: false, practice: false, errorLog: false };

  const sleepDay = date ? new Date(date + "T00:00:00").getDay() : new Date().getDay();
  const sleepTarget = (sleepDay === 0 || sleepDay === 6) ? 8 : 5;
  const sleepDur = getSleepDuration(d.st, d.wt);
  const hasSleep = sleepDur !== null && isFinite(sleepDur);
  const foodEntries = Array.isArray(d.foodEntries) ? d.foodEntries : [];
  const kcal = foodEntries.length > 0 ? foodEntries.reduce((s, e) => s + (Number(e.calories) || 0), 0) : (+d.calories || 0);

  const sessions = [
    { done: !!(d.lc && !d.lc_na), na: !!d.lc_na },
    { done: !!(d.as && !d.as_na), na: !!d.as_na },
    { done: !!(d.ap && !d.ap_na), na: !!d.ap_na },
    { done: !!(d.vp && !d.vp_na), na: !!d.vp_na },
  ];
  const sessionsDone = sessions.filter(s => s.done).length;
  const sessionsAvail = sessions.filter(s => !s.na).length;
  const totalMins = (d.lc && !d.lc_na ? 120 : 0) + (d.as && !d.as_na ? 40 : 0) + (d.ap && !d.ap_na ? 120 : 0) + (d.vp && !d.vp_na ? 20 : 0) + ((+d.ph || 0) * 60) + (+d.pm || 0);

  const openErrors = errorLog.filter(e => !e.fixed).length;
  const retryNeeded = errorLog.filter(e => e.retryStatus === "Retry needed" || e.retryStatus === "Retried wrong").length;
  const fixedErrors = errorLog.filter(e => e.fixed).length;
  const missionErrors = missionChapterId ? errorLog.filter(e => e.chapterId === missionChapterId && !e.fixed).length : 0;

  let totalChapters = 0, completedChapters = 0;
  const incompleteChapters = [];
  for (const sec of CAT_MASTERY_SYLLABUS) {
    for (const unit of sec.units) {
      for (const ch of unit.chapters) {
        totalChapters++;
        const chP = getChapterMastery(masteryProgress, ch.id);
        if (chP.pillars.learn && chP.pillars.practice && chP.pillars.errorLog) completedChapters++;
        else if (incompleteChapters.length < 5) incompleteChapters.push({
          id: ch.id,
          name: ch.label || ch.name || ch.id,
          section: sec.label || sec.name || sec.id,
          pillars: chP.pillars
        });
      }
    }
  }
  const masteryPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const pendingVideos = backlogVideos.filter(v => !v.checked).length;
  const pendingConcepts = backlogConcepts.filter(c => !c.checked).length;
  const watchingEntry = getCurrentWatchingBacklog(backlogVideos, backlogConcepts);

  const latestNote = [...academicNotes].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))[0];
  const notePreview = latestNote ? (latestNote.note_text || "").slice(0, 80) : "";

  return {
    date,
    effortTotal,
    effortBreakdown,
    mission: { chapterId: missionChapterId, sectionId: missionSectionId, unitId: missionUnitId, sectionName: missionSectionName, unitName: missionUnitName, chapterName: missionChapterName, pillars: missionPillars },
    vitals: { sleepDur: hasSleep ? sleepDur : null, sleepTarget, gymDone: !!d.gymDone, waterLiters: +d.waterLiters || 0, kcal },
    work: { sessionsDone, sessionsAvail, qCount: +d.q || 0, vCount: +d.v || 0, lCount: +d.l || 0, vpCount: +d.vp_count || 0, totalMins },
    errors: { total: errorLog.length, openErrors, retryNeeded, fixedErrors, missionErrors },
    mastery: { masteryPct, completedChapters, totalChapters, incompleteChapters },
    backlog: { pendingVideos, pendingConcepts, watchingEntry },
    notePreview,
    journal: (d.n || "").trim(),
  };
}

function getCATMentorReply(message, ctx) {
  const msg = message.toLowerCase();
  const { effortTotal, effortBreakdown, mission, vitals, work, errors, mastery, backlog } = ctx;
  const { learn, practice: practiceScore, errorLog: elScore, discipline: discScore } = effortBreakdown;
  const missionLine = mission.chapterName ? `${mission.chapterName} (${mission.sectionName})` : null;
  const secLabel = mission.sectionId === "quant" ? "10 Quant" : mission.sectionId === "varc" ? "5 VARC sets" : mission.sectionId === "lrdi" ? "5 LRDI sets" : "practice questions";

  const isWhatNow  = /what.*do now|do now|what next|next step|where.*start|get started|right now/.test(msg);
  const isScoreLow = /score.*low|why.*score|score.*why|effort.*low|low.*score|improve.*score|bad score/.test(msg);
  const isPlanDay  = /plan.*day|day.*plan|plan.*hour|next.*hour|2 hour|two hour|schedule|what.*plan/.test(msg);
  const isStudy    = /what.*study|study.*what|which.*chapter|which topic|study plan/.test(msg);
  const isWeak     = /weak|weakness|struggle|bad at|worst|not good/.test(msg);
  const isBacklog  = /backlog|pending video|pending concept|catch up|clearing backlog/.test(msg);
  const isErrors   = /error|mistake|review.*error|retry|wrong question|error log/.test(msg);
  const isDisc     = /discipline|sleep|gym|water|vitals|health|lifestyle|rest|habits/.test(msg);
  const isMock     = /mock|full test|cat mock|full length|practice advice/.test(msg);
  const anyIntent  = isWhatNow || isScoreLow || isPlanDay || isStudy || isWeak || isBacklog || isErrors || isDisc || isMock;

  if (isWhatNow || (!anyIntent && msg.length < 30)) {
    if (!mission.chapterId) return "No mission set for today. Open Today and set a mission chapter — that's step zero before anything else.";
    if (discScore < 12) return `Discipline score is ${discScore}/30. Log sleep, water, gym in Vitals first — discipline is 30 points of your score and it compounds.`;
    if (practiceScore < 10) return `Practice is low (${practiceScore}/25). Open Work Log and do ${secLabel} from ${missionLine}. Log every wrong attempt in Error Log.`;
    if (errors.retryNeeded > 0) return `${errors.retryNeeded} error${errors.retryNeeded > 1 ? "s" : ""} flagged for retry. Fix those before doing new questions.`;
    if (work.sessionsDone < work.sessionsAvail) return `${work.sessionsDone}/${work.sessionsAvail} sessions done. Open Work Log, complete remaining sessions.`;
    return `Score: ${effortTotal}/100. Mission: ${missionLine}. You're on track — keep pushing practice and complete mission pillars in the Map.`;
  }

  if (isScoreLow) {
    const parts = [];
    if (learn < 20)        parts.push(`• Learn: ${learn}/30 — mission pillar not marked done yet`);
    if (practiceScore < 15) parts.push(`• Practice: ${practiceScore}/25 — Q${work.qCount} V${work.vCount} L${work.lCount} today`);
    if (elScore < 8)        parts.push(`• Error Log: ${elScore}/15 — log more errors for mission chapter`);
    if (discScore < 20)     parts.push(`• Discipline: ${discScore}/30 — sleep/gym/water incomplete`);
    if (parts.length === 0) return `Score is ${effortTotal}/100. Breakdown — Learn: ${learn}/30, Practice: ${practiceScore}/25, Errors: ${elScore}/15, Discipline: ${discScore}/30. Push Error Log and Discipline for the last points.`;
    return `Score: ${effortTotal}/100. Weak areas:\n${parts.join("\n")}\n\nFix the top one first.`;
  }

  if (isPlanDay) {
    if (!mission.chapterId) return "Set a mission chapter first. Without that there is nothing to plan around.";
    const steps = [];
    if (!mission.pillars.learn)    steps.push(`→ Complete chapter content for ${missionLine}, then mark Learn done in Map`);
    if (work.sessionsDone < work.sessionsAvail) steps.push(`→ Finish ${work.sessionsAvail - work.sessionsDone} session${work.sessionsAvail - work.sessionsDone > 1 ? "s" : ""} in Work Log`);
    steps.push(`→ Do ${secLabel} — log every wrong one in Error Log`);
    if (errors.retryNeeded > 0) steps.push(`→ Retry ${errors.retryNeeded} flagged error${errors.retryNeeded > 1 ? "s" : ""}`);
    if (vitals.sleepDur === null) steps.push(`→ Log sleep in Vitals`);
    return `Next 2 hours — ${missionLine}:\n${steps.join("\n")}`;
  }

  if (isStudy) {
    if (!mission.chapterId) return "No mission set. Go to Today → Set Mission and pick a chapter. Study that.";
    const next = mastery.incompleteChapters.filter(c => c.id !== mission.chapterId)[0];
    const lines = [`Today: ${missionLine}.`];
    if (!mission.pillars.learn)    lines.push("Learn pillar not done — finish chapter content first.");
    if (!mission.pillars.practice) lines.push(`Practice pillar not done — need Q${work.qCount}/V${work.vCount}/L${work.lCount} higher.`);
    if (next) lines.push(`After today: ${next.name} (${next.section}).`);
    return lines.join("\n");
  }

  if (isWeak) {
    if (mastery.incompleteChapters.length === 0) return "No mastery data tracked yet. Open Map and start logging chapter pillars.";
    const list = mastery.incompleteChapters.slice(0, 3).map(c =>
      `• ${c.name} (${c.section}) — ${[!c.pillars.learn && "Learn", !c.pillars.practice && "Practice", !c.pillars.errorLog && "Error Log"].filter(Boolean).join(", ")} missing`
    ).join("\n");
    return `Chapters with incomplete pillars:\n${list}\n\nPick one and set it as tomorrow's mission.`;
  }

  if (isBacklog) {
    const total = backlog.pendingVideos + backlog.pendingConcepts;
    if (total === 0) return "No backlog pending. Clean slate — keep it that way.";
    if (backlog.watchingEntry) return `Currently watching: ${backlog.watchingEntry.item.text || "item"}.\n${backlog.pendingVideos} videos + ${backlog.pendingConcepts} concepts pending.\nFinish what's in progress, then pick the next oldest item.`;
    return `${backlog.pendingVideos} video${backlog.pendingVideos !== 1 ? "s" : ""} + ${backlog.pendingConcepts} concept${backlog.pendingConcepts !== 1 ? "s" : ""} pending. Open iQuanta Hub, mark one as watching, and clear it in a session gap today.`;
  }

  if (isErrors) {
    if (errors.total === 0) return "No errors logged yet. Do 10 questions right now and log every wrong attempt in Error Log. That data is how you stop repeating mistakes.";
    if (errors.retryNeeded > 0) return `${errors.retryNeeded} error${errors.retryNeeded > 1 ? "s" : ""} need retry. Open Error Log, filter 'Retry needed', and work through them before adding new errors.`;
    if (errors.missionErrors > 0) return `${errors.missionErrors} open error${errors.missionErrors > 1 ? "s" : ""} for ${missionLine}. Retry those now.`;
    return `${errors.openErrors} open errors, ${errors.fixedErrors} fixed. Do a sweep in Error Log — mark anything you've genuinely understood as fixed.`;
  }

  if (isDisc) {
    const lines = [];
    if (vitals.sleepDur === null) lines.push("Sleep not logged.");
    else lines.push(vitals.sleepDur >= vitals.sleepTarget ? `Sleep: ${vitals.sleepDur.toFixed(1)}h ✓` : `Sleep: ${vitals.sleepDur.toFixed(1)}h — below ${vitals.sleepTarget}h target.`);
    lines.push(vitals.gymDone ? "Gym: done ✓" : "Gym: not logged.");
    lines.push(vitals.waterLiters >= 3 ? `Water: ${vitals.waterLiters}L ✓` : `Water: ${vitals.waterLiters}L — drink more.`);
    lines.push(vitals.kcal > 0 ? `Food: ${vitals.kcal} kcal logged.` : "Food: not logged.");
    lines.push(`Discipline score: ${discScore}/30. ${discScore >= 24 ? "Solid." : "Fix sleep and water — they're worth 10 points alone."}`);
    return lines.join("\n");
  }

  if (isMock) {
    const practiceTotal = work.qCount + work.vCount + work.lCount;
    if (practiceTotal < 20) return `Daily practice is only ${practiceTotal} total. Build consistent daily practice first. Hit ${secLabel} every day for a week, then take a mock.`;
    return `Practice looks decent (Q${work.qCount} V${work.vCount} L${work.lCount}). For mocks: strict timing, no peeking mid-set. Log every wrong answer in Error Log immediately after. Use Mastery Map to spot sectional gaps after the mock.`;
  }

  // Generic fallback
  if (!mission.chapterId) return "Set a mission chapter first in Today. That is the foundation of everything else.";
  return `Score: ${effortTotal}/100. Mission: ${missionLine}. Practice: Q${work.qCount} V${work.vCount} L${work.lCount}. Open errors: ${errors.openErrors}.\nNext: ${errors.retryNeeded > 0 ? `retry ${errors.retryNeeded} flagged error${errors.retryNeeded > 1 ? "s" : ""}` : practiceScore < 15 ? "more practice" : "complete mission pillars in Map"}.`;
}

function ChatPage({ mentorMessages, setMentorMessages, d, totals, dl, dayNum, mode, userInitials, userName, masteryProgress, errorLog, backlogVideos, backlogConcepts, academicNotes, setTab, sel, data, avatarGender, avatarSkin, avatarHair, avatarHairColor, avatarShirt, avatarGlasses, avatarBeard, avatarMustache }) {
  const [inp, setInp] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const ctx = useMemo(() => buildMentorContext({
    date: sel,
    dayData: d,
    masteryProgress,
    errorLog,
    backlogVideos,
    backlogConcepts,
    academicNotes,
  }), [sel, d, masteryProgress, errorLog, backlogVideos, backlogConcepts, academicNotes])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mentorMessages])

  const send = (text) => {
    const q = (text || inp).trim()
    if (!q || loading) return
    setInp("")
    setLoading(true)
    setMentorMessages(p => [...p, { r: "user", t: q }])
    setTimeout(() => {
      const reply = getCATMentorReply(q, ctx)
      setMentorMessages(p => [...p, { r: "ai", t: reply }])
      setLoading(false)
    }, 320)
  }

  // Suggested action priority
  const suggestedAction = useMemo(() => {
    const { mission, vitals, work, errors, backlog, effortBreakdown } = ctx
    if (!mission.chapterId) return { label: "Set today's mission", hint: "Open Today and pick a chapter to focus on.", tab: "today" }
    if (effortBreakdown.discipline < 12) return { label: "Fix discipline baseline", hint: `Discipline is ${effortBreakdown.discipline}/30. Log sleep, water, gym in Vitals.`, tab: "vitals" }
    if (effortBreakdown.practice < 10) return { label: "Do practice for mission section", hint: `Practice is ${effortBreakdown.practice}/25. Open Work Log and hit practice targets.`, tab: "daily-work" }
    if (errors.retryNeeded > 0) return { label: `Retry ${errors.retryNeeded} flagged error${errors.retryNeeded > 1 ? "s" : ""}`, hint: "Fix old mistakes before adding new ones.", tab: "error-log" }
    if (backlog.pendingVideos + backlog.pendingConcepts > 0 && !backlog.watchingEntry) return { label: "Pick a backlog item", hint: `${backlog.pendingVideos + backlog.pendingConcepts} pending. Open iQuanta Hub and mark one watching.`, tab: "iquanta" }
    return { label: `Continue mission: ${mission.chapterName}`, hint: `Score: ${ctx.effortTotal}/100. Complete chapter pillars in Map.`, tab: "mastery" }
  }, [ctx])

  const QUICK_PROMPTS = [
    "What should I do now?",
    "Why is my score low?",
    "Plan next 2 hours",
    "Review my weak points",
    "Backlog plan",
    "Discipline check",
  ]

  const { mission, work, errors, backlog } = ctx

  return (
    <div className="mentor-page-shell" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "20px 16px 12px", flexShrink: 0, borderBottom: "1px solid var(--b1)" }}>
        <div className="page-title" style={{ fontSize: 20 }}>Mentor</div>
        <div style={{ fontSize: 11, color: AC, letterSpacing: "0.06em", marginTop: 2 }}>CONTEXT-AWARE CAT COACH</div>
      </div>

      {/* Scrollable area: snapshot + suggested action + messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Coach Snapshot */}
        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <div className="sec-label" style={{ marginBottom: 6 }}>Today Snapshot</div>
          <div className="card" style={{ padding: "12px 14px" }}>
            <div className="dw-snap-row" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="dw-snap-stat">
                <span className="dw-snap-val" style={{ color: ctx.effortTotal >= 70 ? "#30d158" : ctx.effortTotal >= 40 ? AC : "var(--tp)" }}>{ctx.effortTotal}/100</span>
                <span className="dw-snap-key">effort</span>
              </div>
              <div className="dw-snap-stat">
                <span className="dw-snap-val" style={{ fontSize: 12, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mission.chapterName || "—"}</span>
                <span className="dw-snap-key">mission</span>
              </div>
              <div className="dw-snap-stat">
                <span className="dw-snap-val" style={{fontSize:11}}>{work.qCount > 0 || work.vCount > 0 || work.lCount > 0 ? [work.qCount>0?`Quant ${work.qCount}`:null,work.vCount>0?`VARC ${work.vCount}`:null,work.lCount>0?`LRDI ${work.lCount}`:null].filter(Boolean).join(' · ') : "—"}</span>
                <span className="dw-snap-key">practice</span>
              </div>
              <div className="dw-snap-stat">
                <span className="dw-snap-val" style={{ color: errors.openErrors > 0 ? AC : "var(--tp)" }}>{errors.openErrors > 0 ? errors.openErrors : "—"}</span>
                <span className="dw-snap-key">open errors</span>
              </div>
              <div className="dw-snap-stat">
                <span className="dw-snap-val">{backlog.pendingVideos + backlog.pendingConcepts > 0 ? backlog.pendingVideos + backlog.pendingConcepts : "—"}</span>
                <span className="dw-snap-key">backlog</span>
              </div>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { lbl: `L:${ctx.effortBreakdown.learn}`, max: 30, v: ctx.effortBreakdown.learn },
                { lbl: `P:${ctx.effortBreakdown.practice}`, max: 25, v: ctx.effortBreakdown.practice },
                { lbl: `E:${ctx.effortBreakdown.errorLog}`, max: 15, v: ctx.effortBreakdown.errorLog },
                { lbl: `D:${ctx.effortBreakdown.discipline}`, max: 30, v: ctx.effortBreakdown.discipline },
              ].map(({ lbl, max, v }) => (
                <div key={lbl} style={{ fontSize: 10, fontWeight: 700, color: v >= max * 0.7 ? "#30d158" : v >= max * 0.4 ? AC : "var(--ts)", letterSpacing: "0.04em" }}>{lbl}/{max}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Action */}
        <div style={{ padding: "10px 16px 0", flexShrink: 0 }}>
          <div className="sec-label" style={{ marginBottom: 6 }}>Suggested Action</div>
          <div className="card" style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tp)", marginBottom: 4 }}>{suggestedAction.label}</div>
            <div style={{ fontSize: 12, color: "var(--ts)", lineHeight: 1.5, marginBottom: 10 }}>{suggestedAction.hint}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {suggestedAction.tab && (
                <button type="button" className="vs-open-btn" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => setTab(suggestedAction.tab)}>
                  {suggestedAction.tab === "today" ? "Go to Today" : suggestedAction.tab === "vitals" ? "Open Vitals" : suggestedAction.tab === "daily-work" ? "Open Work Log" : suggestedAction.tab === "error-log" ? "Review Error Log" : suggestedAction.tab === "iquanta" ? "Open iQuanta Hub" : "Open Map"}
                </button>
              )}
              {suggestedAction.tab !== "today" && (
                <button type="button" onClick={() => setTab("today")} style={{ background: "transparent", border: "none", color: "var(--tt)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", padding: "6px 0" }}>
                  Back to Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="mentor-page-messages" style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {mentorMessages.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--tt)", fontSize: 13, marginTop: 24, lineHeight: 1.8 }}>
              Ask me anything about your CAT prep.<br/>
              <span style={{ color: "var(--tt)", fontSize: 12 }}>I only use your actual dashboard data.</span>
            </div>
          )}
          {mentorMessages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: m.r === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, width: "100%", boxSizing: "border-box" }}>
              {m.r === "user" && <div style={{ flexShrink: 0 }}><UserAvatar size={36} gender={avatarGender} skinTone={avatarSkin} hairStyle={avatarHair} hairColor={avatarHairColor} shirtColor={avatarShirt} hasGlasses={avatarGlasses} hasBeard={avatarBeard} hasMustache={avatarMustache}/></div>}
              {m.r !== "user" && <div style={{ flexShrink: 0 }}><MentorAvatar size={36}/></div>}
              <div className={`mentor-bubble ${m.r === "user" ? "user" : "ai"}`} style={{
                maxWidth: "78%", padding: "9px 13px",
                borderRadius: m.r === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                fontSize: 13, lineHeight: 1.6,
                backgroundColor: m.r === "user" ? AC : "var(--s2)",
                color: m.r === "user" ? "white" : "var(--tp)",
                border: m.r === "user" ? "none" : "1px solid var(--b1)",
                wordBreak: "break-word", boxSizing: "border-box",
                whiteSpace: "pre-wrap",
              }}>
                {m.t}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <MentorAvatar size={36}/>
              <div className="typing"><span/><span/><span/></div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>
      </div>

      {/* Composer */}
      <div className="mentor-page-composer" style={{ padding: "10px 16px 16px", borderTop: "1px solid var(--b1)", background: "var(--s1)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map(label => (
            <button key={label} type="button"
              className="quick-action-btn"
              onClick={() => send(label)}
              style={{ padding: "6px 11px", borderRadius: 20, border: "1px solid var(--b2)", background: "var(--s2)", color: "var(--ts)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.03em", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about your score, mission, errors, backlog..."
            enterKeyHint="send"
            inputMode="text"
            value={inp}
            onChange={e => setInp(e.target.value)}
            onFocus={() => { setTimeout(() => { inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, 100) }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
            rows={1}
            style={{ flex: 1 }}
          />
          <button className="send-btn" onClick={() => send()} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>↑</button>
        </div>
      </div>
    </div>
  )
}

function FloatingMentor({ daysLeft, totals, dayNum, todayData, mentorMessages, setMentorMessages, mode, userInitials, userName, userId, startDate, interviewDate, catResult, catPercentile, avatarGender, avatarSkin, avatarHair, avatarHairColor, avatarShirt, avatarGlasses, avatarBeard, avatarMustache, category, primaryDegree, secondaryDegrees, workExpYears, workExpMonths, workCompany, workRole, activeTab, calcResult, targetPercentile }) {
  const [open, setOpen] = useState(false);
  const [inp, setInp] = useState("");
  const [placeholder, setPlaceholder] = useState("Ask your mentor...");
  const [loading, setLoading] = useState(false);
  const [seenCount, setSeenCount] = useState(mentorMessages.length);
  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem("mentor_btn_pos")
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 72, y: window.innerHeight - 180 }
  })
  const [dragging, setDragging] = useState(false)
  const btnSize = 56
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const posRef = useRef(pos)
  const ref = useRef(null);
  const inputRef = useRef(null);
  const hasUnread = !open && mentorMessages.length > seenCount;

  useEffect(() => { posRef.current = pos }, [pos])
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [mentorMessages, loading]);
  useEffect(() => { if (open) setSeenCount(mentorMessages.length); }, [open, mentorMessages.length]);

  const blurInput = (mobileOnly = false) => {
    if (mobileOnly && !isMobileKeyboardViewport()) return
    setTimeout(() => inputRef.current?.blur(), 50)
  }

  const snapToEdge = (x, y) => {
    const margin = 12
    const W = window.innerWidth
    const H = window.innerHeight
    const dL = x, dR = W - x - btnSize, dT = y, dB = H - y - btnSize
    const minDist = Math.min(dL, dR, dT, dB)
    if (minDist === dL) return { x: margin, y: Math.min(Math.max(y, margin), H - btnSize - margin) }
    if (minDist === dR) return { x: W - btnSize - margin, y: Math.min(Math.max(y, margin), H - btnSize - margin) }
    if (minDist === dT) return { x: Math.min(Math.max(x, margin), W - btnSize - margin), y: margin }
    return { x: Math.min(Math.max(x, margin), W - btnSize - margin), y: H - btnSize - margin }
  }

  const startDrag = (clientX, clientY) => {
    movedRef.current = false
    dragOffsetRef.current = { x: clientX - posRef.current.x, y: clientY - posRef.current.y }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const { clientX, clientY } = e.touches ? e.touches[0] : e
      movedRef.current = true
      const newX = Math.min(Math.max(clientX - dragOffsetRef.current.x, 0), window.innerWidth - btnSize)
      const newY = Math.min(Math.max(clientY - dragOffsetRef.current.y, 0), window.innerHeight - btnSize)
      setPos({ x: newX, y: newY })
    }
    const onEnd = () => {
      setDragging(false)
      if (movedRef.current) {
        setPos(prev => {
          const snapped = snapToEdge(prev.x, prev.y)
          localStorage.setItem("mentor_btn_pos", JSON.stringify(snapped))
          return snapped
        })
      } else {
        setOpen(p => !p)
      }
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onEnd)
    window.addEventListener("touchmove", onMove, { passive: false })
    window.addEventListener("touchend", onEnd)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onEnd)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onEnd)
    }
  }, [dragging])

  const send = async (text, { blur = false, mobileBlurOnly = false } = {}) => {
    const q = (text ?? inp).trim();
    if (!q || loading) return;
    setInp("");
    if (blur) blurInput(mobileBlurOnly)
    setMentorMessages(p => [...p, {r:"user", t:q}]);
    setLoading(true);
    const doFetch = async () => {
      const messages = [{ role: "user", content: q }];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            message: q,
            messages,
            daysLeft,
            totals,
            dayNum,
            todayData,
            mode,
            userName: userName || "",
            startDate: startDate || "",
            interviewDate: interviewDate || "",
            catResult: catResult || "",
            catPercentile: catPercentile || "",
            targetPercentile: targetPercentile || 0,
            profile: {
              category,
              gender: avatarGender,
              primaryDegree,
              secondaryDegrees,
              workExpYears,
              workExpMonths,
              workCompany,
              workRole,
              profileScore: calcResult?.profileScore,
              hasMasters: calcResult?.hasMasters,
              adjustedCutoffs: calcResult?.adjustedCutoffs,
              targetPercentile: targetPercentile || 0,
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        const data = await readChatResponse(res);
        if (!res.ok) return { error: getApiErrorMessage(data, `Server error: ${res.status}`) };
        return { reply: getMentorReply(data) };
      } catch (err) {
        clearTimeout(timeout);
        if (err.name === "AbortError") {
          setMentorMessages(p => [...p.filter(m => !m.loading), {r:"ai", t:"Render is waking up. Send your message again in 10 seconds."}]);
          return null;
        }
        throw err;
      }
    };
    setMentorMessages(p => [...p, { r: 'ai', t: '...', loading: true }]);
    const slowTimer = setTimeout(() => {
      setMentorMessages(p => {
        const last = p[p.length - 1];
        if (last?.r === 'ai' && last?.loading) {
          return [...p.slice(0, -1), { r: 'ai', t: 'Still thinking... Vikram does not rush.', loading: true }];
        }
        return p;
      });
    }, 15000);
    try {
      let result = await doFetch();
      if (result === null) return;
      if (!result.error && (result.reply.includes("system stumbled") || result.reply.includes("Load failed"))) {
        await new Promise(r => setTimeout(r, 2000));
        result = await doFetch();
        if (result === null) return;
      }
      if (result.error) {
        setMentorMessages(p => [...p.filter(m => !m.loading), {r:"ai", t:result.error}]);
      } else {
        setMentorMessages(p => [...p.filter(m => !m.loading), {r:"ai", t:result.reply}]);
      }
    } catch (err) {
      setMentorMessages(p => [...p.filter(m => !m.loading), {r:"ai", t:err.message || "Connection error. Check the server."}]);
    } finally {
      clearTimeout(slowTimer);
      setMentorMessages(p => p.filter(m => !m.loading));
      setLoading(false);
    }
  };

  const focusDoubt = () => {
    setPlaceholder("Ask your CAT doubt...");
    inputRef.current?.focus();
  };

  const PANEL_W = 360
  const PANEL_H = 500
  const margin = 12
  const isMobile = window.innerWidth < 768

  const panelLeft = (() => {
    const btnRight = pos.x + btnSize
    const spaceRight = window.innerWidth - btnRight - margin
    const spaceLeft = pos.x - margin
    if (spaceRight >= PANEL_W) return btnRight + 8
    if (spaceLeft >= PANEL_W) return pos.x - PANEL_W - 8
    return margin
  })()

  const panelTop = (() => {
    const ideal = pos.y + btnSize / 2 - PANEL_H / 2
    const max = window.innerHeight - PANEL_H - margin
    return Math.min(Math.max(ideal, margin), max)
  })()

  return (
    <>
      {open && (
        <div className="mentor-panel" style={{
          position: "fixed",
          left: isMobile ? 0 : panelLeft,
          top: isMobile ? 0 : panelTop,
          right: isMobile ? 0 : "auto",
          bottom: isMobile ? 0 : "auto",
          width: isMobile ? "100vw" : PANEL_W,
          height: isMobile ? "100dvh" : PANEL_H,
          maxHeight: isMobile ? "100svh" : PANEL_H,
          borderRadius: isMobile ? 0 : 16,
        }}>
          <div className="mentor-header">
            <div className="mentor-identity">
              <div className="mentor-avatar">
                <MentorAvatar size={56} />
              </div>
              <div>
                <div className="mentor-title">Vikram Anand</div>
                <div className="mentor-sub">99.99%ile · IIM-A · 4× CAT</div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setOpen(false)} aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div className="messages mentor-messages" ref={ref} style={{padding:"14px",minHeight:0}}>
            {mentorMessages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: m.r === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: "8px",
                marginBottom: "12px",
                width: "100%",
                boxSizing: "border-box"
              }}>
                {m.r === "user" && (
                  <div style={{flexShrink: 0}}><UserAvatar size={44} gender={avatarGender} skinTone={avatarSkin} hairStyle={avatarHair} hairColor={avatarHairColor} shirtColor={avatarShirt} hasGlasses={avatarGlasses} hasBeard={avatarBeard} hasMustache={avatarMustache}/></div>
                )}
                {m.r !== "user" && (
                  <div style={{flexShrink: 0}}><MentorAvatar size={44}/></div>
                )}
                <div className={`mentor-bubble ${m.r === "user" ? "user" : "ai"}`} style={{
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius: m.r === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  fontSize: "13px",
                  lineHeight: "1.65",
                  backgroundColor: m.r === "user" ? "#f97316" : "var(--s2)",
                  color: m.r === "user" ? "white" : "var(--tp)",
                  border: m.r === "user" ? "none" : "1px solid var(--b1)",
                  wordBreak: "break-word",
                  boxSizing: "border-box"
                }}>
                  {renderMessage(m.t)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"4px 0"}}>
                <div style={{flexShrink:0}}><MentorAvatar size={44}/></div>
                <div className="typing"><span /><span /><span /></div>
              </div>
            )}
          </div>
          <div className="chat-input-row mentor-composer" style={{padding:"12px",marginTop:0}}>
            <textarea ref={inputRef} className="chat-input" placeholder={placeholder} enterKeyHint="send" inputMode="text" value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(undefined, { blur: true, mobileBlurOnly: true });}}} rows={1} />
            <button className="send-btn" onClick={() => send(undefined, { blur: true })} disabled={loading} style={{opacity: loading ? 0.5 : 1}}>↑</button>
          </div>
          <div className="mentor-actions">
            <button onClick={() => send("Start a mock PI interview with me right now", { blur: true })}>Mock Interview</button>
            <button onClick={() => send("Give me a WAT topic and evaluate my response", { blur: true })}>WAT Topic</button>
            <button onClick={focusDoubt}>Doubt</button>
          </div>
        </div>
      )}
      {activeTab !== "mentor" && (
        <button
          className="floating-btn"
          aria-label="Open Mentor chat"
          onClick={() => setOpen(true)}
        >
          <MentorAvatar size={58}/>
          {hasUnread && <span className="mentor-unread-dot" />}
        </button>
      )}
    </>
  );
}

function DailyWorkPage({ d, upd, mode, onBack }) {
  const selfStudyMins = ((+d.ph||0) * 60) + (+d.pm||0);
  const selfStudyDisplay = formatStudyDuration(selfStudyMins);
  const practiceRows = [
    {lbl:"Quant",sub:"Target: 10",f:"q",t:10},
    {lbl:"VARC sets",sub:"Target: 5",f:"v",t:5},
    {lbl:"LRDI sets",sub:"Target: 5",f:"l",t:5},
    {lbl:"VARC Para Reading",sub:"Target: 1 passage",f:"vp_count",t:1},
  ];

  return (
    <div className="page">
      <div className="page-header">
        <button
          onClick={onBack}
          style={{ background:"transparent", border:"none", color:"var(--ac)", fontSize:15, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4, padding:0, marginBottom:8 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">Daily Work Log</div>
        <div className="page-sub">Practice · Study Time</div>
      </div>

      <div className="sections">
        {mode !== "interview" && (
          <div>
            <div className="sec-label">Practice</div>
            <div className="card">
              {practiceRows.map(r => {
                const val = +d[r.f] || 0;
                const met = val >= r.t;
                return (
                  <div className="card-row" key={r.f}>
                    <div><div className="row-label">{r.lbl}</div><div className="row-sub">{r.sub}</div></div>
                    <div className="counter">
                      <button className="ctr-btn" onClick={() => upd(r.f, Math.max(0, val-1))}>−</button>
                      <span className="ctr-num" style={{color: met ? "var(--green)" : val > 0 ? AC : "var(--ts)"}}>{val}</span>
                      <button className="ctr-btn" onClick={() => upd(r.f, val+1)}>+</button>
                      <span className="ctr-target">/{r.t}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="sec-label">Self Study</div>
          <div className="card">
            <div className="card-row" style={{borderTop:"1px solid var(--b1)"}}>
              <div>
                <div className="row-label">Personal practice</div>
                <div className="row-sub">Additional self-study</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <select className="time-select" value={d.ph||0} onChange={e=>upd("ph",Number(e.target.value))} style={{minWidth:52}}>
                  {[0,1,2,3,4,5,6,7,8,9,10].map(h=><option key={h} value={h}>{h}h</option>)}
                </select>
                <select className="time-select" value={d.pm||0} onChange={e=>upd("pm",Number(e.target.value))} style={{minWidth:58}}>
                  {[0,10,20,30,40,50].map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}m</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderTop:"1px solid var(--b1)"}}>
              <span style={{fontSize:11,color:"var(--tt)",letterSpacing:"0.06em",textTransform:"uppercase"}}>Self Study</span>
              <span style={{fontSize:16,fontWeight:700,color:selfStudyMins>=240?"#30d158":selfStudyMins>=120?"#f97316":"var(--tp)"}}>{selfStudyDisplay}</span>
            </div>
          </div>
        </div>

        {mode === "interview" && (
          <div>
            <div className="sec-label">Interview Prep</div>
            <div className="card">
              <div className="card-row">
                <div><div className="row-label">Mock PI done today</div><div className="row-sub">Simulate the real thing</div></div>
                <Tog v={d.mockPI} onChange={v=>upd("mockPI",v)} />
              </div>
              <div className="card-row">
                <div><div className="row-label">WAT practice done</div><div className="row-sub">Written Ability Test</div></div>
                <Tog v={d.watDone} onChange={v=>upd("watDone",v)} />
              </div>
            </div>
            <div style={{marginTop:10}} className="card">
              <textarea className="textarea" placeholder="Topics revised today — acads, current affairs, SOP, hobbies..." value={d.topicsRevised||""} onChange={e=>upd("topicsRevised",e.target.value)} rows={3} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function IQuantaLogPage({ d, upd, todayLiveLabel, todayAppLabel, onBack }) {
  const stats = getIQuantaSessionStats(d);
  const sessionSub = (session) => {
    if (session.field === "lc") return todayLiveLabel || session.fallbackSub;
    if (session.field === "ap") return todayAppLabel || session.fallbackSub;
    return session.fallbackSub;
  };
  const naBtn = (field, dependentField) => (
    <button
      onClick={() => { const n = !d[field]; upd(field, n); if (n) upd(dependentField, false); }}
      className="dw-na-btn"
      style={{ border: d[field] ? "1px solid var(--tt)" : "1px solid var(--b2)", background: d[field] ? "rgba(110,110,115,0.15)" : "transparent" }}
    >N/A</button>
  );

  return (
    <div className="page">
      <div className="page-header">
        <button
          onClick={onBack}
          style={{ background:"transparent", border:"none", color:"var(--ac)", fontSize:15, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4, padding:0, marginBottom:8 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          iQuanta Hub
        </button>
        <div className="page-title">iQuanta Log</div>
        <div className="page-sub">Classes · Sessions</div>
      </div>

      <div className="sections">
        <div>
          <div className="sec-label">Today&apos;s iQuanta Work</div>
          <div className="card">
            {IQUANTA_SESSION_DEFS.map((session, idx) => (
              <div key={session.field} className="dw-session-row" style={{borderTop: idx ? "1px solid var(--b1)" : "none"}}>
                {naBtn(session.naField, session.field)}
                <div className="dw-session-info">
                  <div className="row-label">{session.label}</div>
                  <div className="row-sub">{sessionSub(session)}</div>
                </div>
                <div style={{ marginLeft:"auto", opacity: d[session.naField] ? 0.35 : 1, pointerEvents: d[session.naField] ? "none" : "auto" }}>
                  <Tog v={!!d[session.field]} onChange={v=>{upd(session.field,v);if(v)upd(session.naField,false);}} />
                </div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"12px 16px",borderTop:"1px solid var(--b1)",flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"var(--tt)",letterSpacing:"0.06em",textTransform:"uppercase"}}>Session Summary</span>
              <span style={{fontSize:16,fontWeight:700,color:stats.done>=stats.available&&stats.available>0?"#30d158":stats.done>0?"#f97316":"var(--tp)"}}>
                {stats.available > 0 ? `${stats.done}/${stats.available} done` : "No sessions due"}
                {stats.totalMins > 0 ? ` · ${stats.timeLabel}` : ""}
              </span>
            </div>
          </div>
        </div>

        <button type="button" className="save-btn" onClick={onBack}>Back to iQuanta Hub</button>
      </div>
    </div>
  );
}

function ErrorLogPage({ entries, onAdd, onUpdate, onDelete, prefill, onBack }) {
  const makeBlankForm = useCallback(() => ({
    sectionId: prefill?.sectionId || "",
    unitId: prefill?.unitId || "",
    chapterId: prefill?.chapterId || "",
    source: "",
    mistakeType: "",
    questionRef: "",
    myMistake: "",
    correctApproach: "",
    takeaway: "",
    retryStatus: "Not retried",
    fixed: false,
  }), [prefill]);

  const [showForm, setShowForm] = useState(!!(prefill?.chapterId));
  const [form, setForm] = useState(makeBlankForm);
  const [editId, setEditId] = useState(null);
  const [sectionFilter, setSectionFilter] = useState(prefill?.sectionId || "");
  const [fixedFilter, setFixedFilter] = useState("all");
  const [retryFilter, setRetryFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (prefill?.chapterId) {
      setForm(f => ({ ...f, sectionId: prefill.sectionId || f.sectionId, unitId: prefill.unitId || f.unitId, chapterId: prefill.chapterId || f.chapterId }));
      setShowForm(true);
    }
  }, [prefill]);

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const formSection = CAT_MASTERY_SYLLABUS.find(s => s.id === form.sectionId);
  const formUnit = formSection?.units.find(u => u.id === form.unitId);
  const mistakeTypes = getElMistakeTypes(form.sectionId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.myMistake.trim()) return;
    const now = new Date().toISOString();
    if (editId) {
      onUpdate({ ...form, id: editId, updatedAt: now });
      setEditId(null);
    } else {
      onAdd({ ...form, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, date: new Date().toISOString().split("T")[0], createdAt: now, updatedAt: now });
    }
    setForm(makeBlankForm());
    setShowForm(false);
  };

  const handleEdit = (entry) => {
    setForm({ sectionId: entry.sectionId || "", unitId: entry.unitId || "", chapterId: entry.chapterId || "", source: entry.source || "", mistakeType: entry.mistakeType || "", questionRef: entry.questionRef || "", myMistake: entry.myMistake || "", correctApproach: entry.correctApproach || "", takeaway: entry.takeaway || "", retryStatus: entry.retryStatus || "Not retried", fixed: !!entry.fixed });
    setEditId(entry.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(makeBlankForm());
    setEditId(null);
    setShowForm(false);
  };

  const getChapterLabel = (chapterId) => {
    for (const sec of CAT_MASTERY_SYLLABUS) for (const u of sec.units) { const ch = u.chapters.find(c => c.id === chapterId); if (ch) return ch.label; }
    return chapterId || "—";
  };

  const filtered = entries.filter(e => {
    if (sectionFilter && e.sectionId !== sectionFilter) return false;
    if (fixedFilter === "fixed" && !e.fixed) return false;
    if (fixedFilter === "open" && e.fixed) return false;
    if (retryFilter !== "all" && e.retryStatus !== retryFilter) return false;
    if (search) { const q = search.toLowerCase(); return (e.myMistake||"").toLowerCase().includes(q) || (e.takeaway||"").toLowerCase().includes(q) || (e.correctApproach||"").toLowerCase().includes(q) || (e.chapterId||"").toLowerCase().includes(q); }
    return true;
  });

  const retryColor = { "Not retried": "", "Retry needed": "el-retry-needed", "Retried wrong": "el-retry-wrong", "Retried correct": "el-retry-ok" };

  return (
    <div className="page el-page">
      <div className="page-header">
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:"var(--ac)", fontSize:15, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4, padding:0, marginBottom:8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">Error Log</div>
        <div className="page-sub">Track errors, fixes, and reviews.</div>
      </div>

      <div className="sections">
        <div className="el-top-row">
          <span className="el-count-lbl">{entries.length} total · {entries.filter(e=>!e.fixed).length} open · {entries.filter(e=>e.fixed).length} fixed</span>
          <button type="button" className="el-add-toggle" onClick={() => showForm ? handleCancel() : setShowForm(true)}>
            {showForm ? "Cancel" : "+ Add Error"}
          </button>
        </div>

        {showForm && (
          <div>
            <div className="sec-label">{editId ? "Edit Error" : "Log Error"}</div>
            <div className="card el-form-card">
              <form onSubmit={handleSubmit}>
                <div className="mission-selectors el-selectors">
                  <select className="mission-select" value={form.sectionId} onChange={e => { const v=e.target.value; setForm(f=>({...f, sectionId:v, unitId:"", chapterId:"", mistakeType:""})); }}>
                    <option value="">Section...</option>
                    {CAT_MASTERY_SYLLABUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select className="mission-select" value={form.unitId} disabled={!formSection} onChange={e => { const v=e.target.value; setForm(f=>({...f, unitId:v, chapterId:""})); }}>
                    <option value="">Unit...</option>
                    {(formSection?.units||[]).map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                  <select className="mission-select" value={form.chapterId} disabled={!formUnit} onChange={e => sf("chapterId", e.target.value)}>
                    <option value="">Chapter...</option>
                    {(formUnit?.chapters||[]).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div className="el-two-col">
                  <select className="mission-select" value={form.source} onChange={e => sf("source", e.target.value)}>
                    <option value="">Source...</option>
                    {EL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="mission-select" value={form.mistakeType} onChange={e => sf("mistakeType", e.target.value)}>
                    <option value="">Type...</option>
                    {mistakeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="el-two-col">
                  <select className="mission-select" value={form.retryStatus} onChange={e => sf("retryStatus", e.target.value)}>
                    {EL_RETRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <label className="el-fixed-row">
                    <Tog v={form.fixed} onChange={v => sf("fixed", v)} />
                    <span className="el-fixed-lbl">Fixed / Reviewed</span>
                  </label>
                </div>

                <div className="el-field">
                  <div className="el-field-lbl">What went wrong *</div>
                  <textarea className="textarea" required value={form.myMistake} onChange={e => sf("myMistake", e.target.value)} rows={2} placeholder="What went wrong..." />
                </div>
                <div className="el-field">
                  <div className="el-field-lbl">Correct method</div>
                  <textarea className="textarea" value={form.correctApproach} onChange={e => sf("correctApproach", e.target.value)} rows={2} placeholder="The right approach..." />
                </div>
                <div className="el-field">
                  <div className="el-field-lbl">Takeaway</div>
                  <textarea className="textarea" value={form.takeaway} onChange={e => sf("takeaway", e.target.value)} rows={2} placeholder="Key lesson..." />
                </div>
                <div className="el-field">
                  <div className="el-field-lbl">Question ref</div>
                  <input className="el-input" type="text" value={form.questionRef} onChange={e => sf("questionRef", e.target.value)} placeholder="e.g. Mock 3 Q14 (optional)" />
                </div>

                <button type="submit" className="el-submit-btn">{editId ? "Update" : "Save Error"}</button>
              </form>
            </div>
          </div>
        )}

        {entries.length === 0 && !showForm && (
          <div className="card el-empty">No errors logged yet.</div>
        )}

        {entries.length > 0 && (
          <div>
            <div className="sec-label">Filter</div>
            <div className="card el-filters-card">
              <input className="el-search" type="text" placeholder="Search errors, takeaways..." value={search} onChange={e => setSearch(e.target.value)} />
              <div className="el-filter-row">
                <select className="mission-select" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                  <option value="">All sections</option>
                  {CAT_MASTERY_SYLLABUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select className="mission-select" value={fixedFilter} onChange={e => setFixedFilter(e.target.value)}>
                  <option value="all">Fixed: All</option>
                  <option value="open">Open</option>
                  <option value="fixed">Fixed ✓</option>
                </select>
                <select className="mission-select" value={retryFilter} onChange={e => setRetryFilter(e.target.value)}>
                  <option value="all">Retry: All</option>
                  {EL_RETRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {entries.length > 0 && (
          <div>
            <div className="sec-label">Entries ({filtered.length})</div>
            {filtered.length === 0 ? (
              <div className="card el-empty">No entries match the current filters.</div>
            ) : (
            <div className="el-list">
              {[...filtered].reverse().map(entry => (
                <div key={entry.id} className={`card el-card${entry.fixed ? " el-card-fixed" : ""}`}>
                  <div className="el-card-head">
                    <div className="el-card-meta">
                      <span className="el-card-chapter">{getChapterLabel(entry.chapterId)}</span>
                      {entry.mistakeType && <span className="el-badge el-badge-type">{entry.mistakeType}</span>}
                    </div>
                    <div className="el-card-actions">
                      <button type="button" className="el-action-btn" onClick={() => handleEdit(entry)} aria-label="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button type="button" className="el-action-btn el-action-del" onClick={() => { if (window.confirm("Delete this error entry?")) onDelete(entry.id); }} aria-label="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                  <div className="el-card-row2">
                    {entry.source && <span className="el-card-source">{entry.source}</span>}
                    <span className="el-card-date">{entry.date}</span>
                  </div>
                  {entry.myMistake && <div className="el-card-mistake">{entry.myMistake}</div>}
                  {entry.takeaway && <div className="el-card-takeaway">↳ {entry.takeaway}</div>}
                  <div className="el-card-footer">
                    <span className={`el-badge el-badge-retry${retryColor[entry.retryStatus] ? " "+retryColor[entry.retryStatus] : ""}`}>{entry.retryStatus}</span>
                    {entry.fixed && <span className="el-badge el-badge-fixed">Fixed ✓</span>}
                    {entry.questionRef && <span className="el-card-qref">{entry.questionRef}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}

function IQuantaHubPage({
  backlogVideos, backlogConcepts, onOpenWatchingBacklog,
  notes, d = {}, todayLiveLabel, todayAppLabel, isSundayIST, setTab, onBack,
}) {
  const totalBacklog = backlogVideos.length + backlogConcepts.length;
  const totalDone = backlogVideos.filter(i => i.checked).length + backlogConcepts.filter(i => i.checked).length;
  const backlogPending = totalBacklog - totalDone;
  const backlogCoverage = totalBacklog > 0 ? Math.round((totalDone / totalBacklog) * 100) : 0;
  const currentWatchingBacklog = getCurrentWatchingBacklog(backlogVideos, backlogConcepts);
  const stats = getIQuantaSessionStats(d);
  const liveDone = d.lc_na ? "N/A" : d.lc ? "Done" : "Pending";
  const appDone = d.ap_na ? "N/A" : d.ap ? "Done" : "Pending";
  const latestNote = useMemo(() => {
    return [...notes].sort((a, b) => new Date(getNoteUpdatedAt(b)) - new Date(getNoteUpdatedAt(a)))[0] || null;
  }, [notes]);

  return (
    <div className="page">
      <div className="page-header">
        <button
          onClick={onBack}
          style={{
            background: "transparent", border: "none",
            color: "var(--ac)", fontSize: 15, cursor: "pointer",
            fontFamily: "inherit", display: "flex",
            alignItems: "center", gap: 4, padding: 0, marginBottom: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          Today
        </button>
        <div className="page-title">iQuanta Hub</div>
        <div className="page-sub">Classes · Backlogs · Notes · Timetable</div>
      </div>

      <div className="sections">
        <div>
          <div className="sec-label">Currently Watching</div>
          <div className="card">
            {currentWatchingBacklog ? (
              <button
                type="button"
                className="iquanta-watch-row"
                style={{width:"100%",borderRadius:8}}
                aria-label="Jump to currently watching backlog item"
                onClick={() => onOpenWatchingBacklog?.({
                  kind: currentWatchingBacklog.type.toLowerCase(),
                  id: currentWatchingBacklog.item.id,
                })}
              >
                <span className="iquanta-watch-main">{currentWatchingBacklog.item.text}</span>
                <span className="iquanta-watch-meta">
                  {currentWatchingBacklog.type} · {totalBacklog > 0 ? `${backlogPending} pending · ${backlogCoverage}% covered` : "No other items"}
                </span>
              </button>
            ) : (
              <div className="card-row">
                <div>
                  <div className="row-label">Nothing active</div>
                  <div className="row-sub">Mark a backlog item as watching to track it here</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="sec-label">iQuanta Log</div>
          <div className="card">
            <button
              className="card-row"
              onClick={() => setTab("iquanta-log")}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit"}}
            >
              <div style={{flex:1,minWidth:0}}>
                <div className="row-label">Today's Classes</div>
                <div className="row-sub">
                  {stats.available > 0
                    ? `${stats.done}/${stats.available} done${stats.totalMins > 0 ? ` · ${stats.timeLabel}` : ""}`
                    : "No iQuanta sessions due"}
                </div>
                <div className="row-sub" style={{marginTop:4}}>
                  Live: {liveDone} · App: {appDone}
                </div>
                {(todayLiveLabel || todayAppLabel) && (
                  <div className="row-sub" style={{marginTop:4}}>
                    {[todayLiveLabel, todayAppLabel].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tt)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Backlogs</div>
          <div className="card">
            <button
              className="card-row"
              onClick={() => setTab("backlog")}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit"}}
            >
              <div>
                <div className="row-label">iQuanta Backlogs</div>
                <div className="row-sub">
                  {totalBacklog > 0
                    ? `${backlogPending} pending · ${backlogCoverage}% covered · ${totalBacklog} total`
                    : "Log videos and concepts to track"}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tt)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Schedule</div>
          <div className="card">
            <button
              className="card-row"
              onClick={() => setTab("timetable")}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit"}}
            >
              <div>
                <div className="row-label">Weekly Timetable</div>
                <div className="row-sub">iQuanta live + application class schedule</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tt)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button
              className="card-row"
              onClick={() => setTab("assessment")}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",borderTop:"1px solid var(--b1)"}}
            >
              <div>
                <div className="row-label">{isSundayIST ? "Weekly Assessment" : "Daily Assessment"}</div>
                <div className="row-sub">
                  {isSundayIST ? "10 questions total · Sunday calibre check" : "3 questions total · Daily calibre check"}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tt)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Academic Notes</div>
          <div className="card">
            <button
              className="card-row"
              onClick={() => setTab("notes")}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit"}}
            >
              <div>
                <div className="row-label">Notes</div>
                <div className="row-sub">
                  {notes?.length
                    ? `${notes.length} note${notes.length === 1 ? "" : "s"} · ${getNotePreview(latestNote)}`
                    : "Save formulas, mistakes, and class points"}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tt)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function VitalsPage({ d, upd, date, onBack, onSave }) {
  const [saved, setSaved] = useState(false);
  const water = Number(d.waterLiters) || 0;
  const foodEntries = Array.isArray(d.foodEntries) ? d.foodEntries : [];
  const sleepDuration = getSleepDuration(d.st, d.wt);
  const sleepTargetHours = (() => {
    const day = new Date(date + "T00:00:00").getDay();
    return day === 0 || day === 6 ? 8 : 5;
  })();
  const isWeekend = sleepTargetHours === 8;
  const sleepValid = sleepDuration !== null && sleepDuration >= sleepTargetHours;
  const sleepTargetLabel = isWeekend ? "Target: 8h (weekend)" : "Target: 5h (weekday)";

  const totalMacros = useMemo(() => {
    if (foodEntries.length > 0) {
      return {
        calories: foodEntries.reduce((s,e) => s + (Number(e.calories)||0), 0),
        protein:  foodEntries.reduce((s,e) => s + (Number(e.protein)||0), 0),
        carbs:    foodEntries.reduce((s,e) => s + (Number(e.carbs)||0), 0),
        fat:      foodEntries.reduce((s,e) => s + (Number(e.fat)||0), 0),
      };
    }
    return { calories: d.calories||0, protein: d.protein||0, carbs: d.carbs||0, fat: d.fat||0 };
  }, [foodEntries, d.calories, d.protein, d.carbs, d.fat]);

  const addFood = () => upd("foodEntries", [...foodEntries, {
    id: String(Date.now()), name: "", qty: "", calories: 0, protein: 0, carbs: 0, fat: 0,
  }]);
  const removeFood = (id) => upd("foodEntries", foodEntries.filter(e => e.id !== id));
  const updateFood = (id, field, val) =>
    upd("foodEntries", foodEntries.map(e => e.id === id ? {...e, [field]: val} : e));

  const fmt = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })
    : "";
  const handleSaveVitals = async () => {
    await onSave?.();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page vitals-page">
      <div className="page-header">
        <button onClick={onBack} style={{
          background:"transparent", border:"none", color:"#f97316", fontSize:15,
          cursor:"pointer", fontFamily:"inherit", display:"flex",
          alignItems:"center", gap:4, padding:0, marginBottom:8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Today
        </button>
        <div className="page-title">Vitals</div>
        <div className="page-sub">{fmt}</div>
      </div>

      <div className="sec-label">Sleep</div>
      <div className="card">
        <TimePickerWidget
          label="Wake time"
          sub="Recommended: 6–8 AM"
          value={d.wt}
          onChange={v => upd("wt", v)}
          dotColor={sleepValid ? "#30d158" : "#ff453a"}
        />
        <TimePickerWidget
          label="Sleep time"
          sub="Recommended: 10 PM–2 AM"
          value={d.st}
          onChange={v => upd("st", v)}
          dotColor={sleepValid ? "#30d158" : "#ff453a"}
        />
        <div style={{padding:"8px 16px 12px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:"var(--tt)"}}>{sleepTargetLabel}</span>
          {sleepDuration !== null && (
            <>
              <span style={{
                fontSize:13, fontWeight:800,
                color: sleepValid ? "#30d158" : "#ff453a",
                fontVariantNumeric:"tabular-nums",
              }}>{sleepDuration.toFixed(1)} hrs</span>
              {!sleepValid && sleepDuration < sleepTargetHours && (
                <span style={{fontSize:11,color:"#ff453a"}}>
                  {`Too little sleep. Target ${sleepTargetHours}h.`}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="sec-label">Habits</div>
      <div className="card">
        {!isWeekend && (
          <div className="card-row">
            <div>
              <div className="row-label">Office before 10 AM</div>
              <div className="row-sub">Punctuality streak</div>
            </div>
            <Tog v={!!d.officeBefore10} onChange={v=>upd("officeBefore10",v)} />
          </div>
        )}
        <div className="card-row">
          <div>
            <div className="row-label">Gym</div>
            <div className="row-sub">{isWeekend ? "Physical training · Weekend (+10pts)" : "Physical training"}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {!!d.gymDone && (
              <>
                <input
                  type="number"
                  className="time-select"
                  min="0"
                  step="5"
                  inputMode="numeric"
                  value={d.gymMinutes||0}
                  onChange={e=>upd("gymMinutes",e.target.value===""?0:Number(e.target.value))}
                  style={{width:58,textAlign:"center"}}
                />
                <span style={{fontSize:11,color:"var(--tt)",flexShrink:0}}>min</span>
              </>
            )}
            <Tog v={!!d.gymDone} onChange={v=>{upd("gymDone",v);if(!v)upd("gymMinutes",0);}} />
          </div>
        </div>
        <div className="card-row">
          <div>
            <div className="row-label">Content posted</div>
            <div className="row-sub">Study / social content</div>
          </div>
          <Tog v={!!d.contentPosted} onChange={v=>upd("contentPosted",v)} />
        </div>
        <div className="card-row">
          <div>
            <div className="row-label">Editing under 1 hour</div>
            <div className="row-sub">Content editing discipline</div>
          </div>
          <Tog v={!!d.editingUnder1Hr} onChange={v=>upd("editingUnder1Hr",v)} />
        </div>
      </div>

      <div className="sec-label">Water</div>
      <div className="card">
        <div className="vtube-row">
          <div>
            <div className="row-label">Water intake</div>
            <div className="row-sub">+0.5L per tap · 4L daily target</div>
          </div>
          <span className="vtube-val">{Number.isInteger(water) ? water : water.toFixed(1)} / 4L</span>
        </div>
        <div className="vtube-controls">
          <div className="vtube" role="progressbar" aria-valuenow={water} aria-valuemin={0} aria-valuemax={4} aria-label="Water intake">
            <div className="vtube-fill" style={{width:`${(water/4)*100}%`}} />
          </div>
          <button type="button" className="vtube-btn" aria-label="Decrease water"
            onClick={()=>upd("waterLiters",+(Math.max(0,water-0.5)).toFixed(1))}
            disabled={water<=0}>−</button>
          <button type="button" className="vtube-btn" aria-label="Increase water"
            onClick={()=>upd("waterLiters",+(Math.min(4,water+0.5)).toFixed(1))}
            disabled={water>=4}>+</button>
        </div>
      </div>

      <div className="sec-label">Food</div>
      <div className="card">
        {foodEntries.length === 0 && (
          <div className="food-empty-msg">No food logged yet. Tap Add Food below.</div>
        )}
        {foodEntries.map((entry, idx) => (
          <div key={entry.id} className={`food-entry${idx > 0 ? " food-entry-sep" : ""}`}>
            <div className="food-entry-head">
              <input
                type="text"
                className="food-name-input"
                placeholder="Food name"
                value={entry.name}
                onChange={e=>updateFood(entry.id,"name",e.target.value)}
              />
              <input
                type="text"
                className="food-qty-input"
                placeholder="qty"
                value={entry.qty}
                onChange={e=>updateFood(entry.id,"qty",e.target.value)}
              />
              <button type="button" className="food-remove-btn" aria-label="Remove food" onClick={()=>removeFood(entry.id)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="food-macros-row">
              {[
                {f:"calories",lbl:"kcal"},
                {f:"protein",lbl:"pro"},
                {f:"carbs",lbl:"carbs"},
                {f:"fat",lbl:"fat"},
              ].map(m => (
                <div key={m.f} className="food-macro-cell">
                  <input
                    type="number"
                    className="food-macro-input"
                    min="0"
                    inputMode="numeric"
                    value={entry[m.f]||0}
                    onChange={e=>updateFood(entry.id,m.f,e.target.value===""?0:Number(e.target.value))}
                  />
                  <span className="food-macro-lbl">{m.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="add-food-btn" onClick={addFood}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Food
      </button>

      {(foodEntries.length > 0 || totalMacros.calories > 0 || totalMacros.protein > 0) && (
        <div className="card macro-total-card">
          <div className="macro-total-head">Daily Totals</div>
          <div style={{fontSize:10,color:"var(--ts)",marginBottom:8,letterSpacing:"0.03em",textTransform:"uppercase"}}>Body recomposition targets (vegetarian)</div>
          <div className="macro-grid">
            {[
              {lbl:"Calories",unit:"kcal",val:totalMacros.calories, tgt:"2700 kcal"},
              {lbl:"Protein", unit:"g",  val:totalMacros.protein,  tgt:"220g"},
              {lbl:"Carbs",   unit:"g",  val:totalMacros.carbs,    tgt:"270–300g"},
              {lbl:"Fat",     unit:"g",  val:totalMacros.fat,      tgt:"70–75g"},
            ].map(m => (
              <div key={m.lbl} className="macro-cell">
                <div style={{fontSize:16,fontWeight:900,color:"var(--tp)",fontVariantNumeric:"tabular-nums",lineHeight:1}}>{m.val}</div>
                <div className="macro-name">{m.lbl}</div>
                <div className="macro-unit">{m.unit}</div>
                <div style={{fontSize:9,color:"var(--ts)",marginTop:3,lineHeight:1.2}}>tgt {m.tgt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button type="button" className={`save-btn${saved?" saved":""}`} onClick={handleSaveVitals}>
        {saved ? "Vitals saved" : "Save Vitals"}
      </button>
    </div>
  );
}

function ProfilePage({
  userName, userId,
  startDate, dayNumber, totalDays, setTab,
  appTheme, setAppTheme,
  targetPercentile, setTargetPercentile,
  setSharedCalcResult,
  selectedDate,
  selectedDayData,
  masteryProgress = {},
  avatarGender, avatarSkin, avatarHair, avatarHairColor,
  avatarShirt, avatarGlasses, avatarBeard, avatarMustache,
  category, setCategory,
  primaryDegree, setPrimaryDegree,
  secondaryDegrees, setSecondaryDegrees,
  workExpYears, setWorkExpYears,
  workExpMonths, setWorkExpMonths,
  workCompany, setWorkCompany,
  workRole, setWorkRole,
}) {
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showEffortSplit, setShowEffortSplit] = useState(false);
  const profileEffort = useMemo(
    () => calculateEffortScoreV2({
      dayData: selectedDayData || defaultDay(),
      masteryProgress,
      date: selectedDate,
    }),
    [selectedDayData, masteryProgress, selectedDate]
  );
  const effortRows = [
    { label:"Learn", val:profileEffort.breakdown.learn, max:30, copy:"Mission selected, chapter Learn pillar, and configured class completion." },
    { label:"Practice", val:profileEffort.breakdown.practice, max:25, copy:"Quant, VARC, and LRDI practice counts weighted by today's mission section." },
    { label:"Error Log", val:profileEffort.breakdown.errorLog, max:15, copy:"Mission chapter error count and Error Log pillar completion." },
    { label:"Discipline", val:profileEffort.breakdown.discipline, max:30, copy:"Sleep, routine, water, food, gym, and creator discipline." },
  ];
  const effortStatus = profileEffort.total >= 80
    ? "Excellent"
    : profileEffort.total >= 50
      ? "Solid"
      : profileEffort.total >= 25
        ? "Building"
        : "Needs action";
  const effortColor = profileEffort.total >= 80
    ? "#30d158"
    : profileEffort.total >= 50
      ? "var(--ac)"
      : profileEffort.total >= 25
        ? "#f59e0b"
        : "var(--tt)";
  const categories = ["General", "OBC-NCL", "SC", "ST", "EWS", "PWD"];
  const chipStyle = (active) => ({
    padding:"6px 14px", borderRadius:20,
    border: active ? "1px solid #f97316" : "1px solid var(--b2)",
    background: active ? "rgba(249,115,22,0.15)" : "var(--s2)",
    color: active ? "#f97316" : "var(--tt)",
    fontSize:12, cursor:"pointer", fontFamily:"inherit"
  });
  useEffect(() => {
    setCalcLoading(true);
    const timer = setTimeout(() => {
      const result = calcIIMProfile({
        category,
        gender: avatarGender,
        primaryDegree,
        secondaryDegrees,
        workExpYears,
        workExpMonths,
        workCompany,
        workRole,
      });
      setCalcResult(result);
      setSharedCalcResult?.(result);
      setCalcLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [
    category,
    avatarGender,
    primaryDegree,
    secondaryDegrees,
    workExpYears,
    workExpMonths,
    workCompany,
    workRole,
    setSharedCalcResult,
  ]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Profile</div>
        <div className="page-sub">Your identity and IIM target</div>
      </div>

      <div className="sections">
        <div>
          <div className="sec-label">Your Profile</div>
          <div
            className="profile-summary-card"
            role="button"
            tabIndex={0}
            onClick={() => setTab("profile-edit")}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTab("profile-edit");
              }
            }}
            aria-label="Edit profile"
          >
            <AvatarPreview
              gender={avatarGender}
              skinTone={avatarSkin}
              hairStyle={avatarHair}
              hairColor={avatarHairColor}
              shirtColor={avatarShirt}
              hasGlasses={avatarGlasses}
              hasBeard={avatarBeard}
              hasMustache={avatarMustache}
              size={58}
            />
            <div className="profile-summary-main">
              <div className="profile-summary-name">{userName}</div>
              <div className="profile-summary-sub">
                {startDate
                  ? new Date(startDate+"T00:00:00").toLocaleDateString("en-IN", {
                      day:"numeric", month:"long", year:"numeric"
                    })
                  : "Start date not set"}
              </div>
            </div>
            <div className="profile-summary-meta">
              <div className="profile-summary-day">
                Day {dayNumber}<br/>
                <span>of {totalDays}</span>
              </div>
              <svg className="profile-summary-chevron" width="16" height="16"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <div className="sec-label">Appearance</div>
          <div className="card theme-card">
            <div>
              <div className="row-label">Theme</div>
              <div className="row-sub">Choose how Conquer CAT looks</div>
            </div>
            <button
              type="button"
              className={`theme-switch ${appTheme === "light" ? "light" : "dark"}`}
              onClick={() => setAppTheme(appTheme === "light" ? "dark" : "light")}
              aria-label={`Switch to ${appTheme === "light" ? "dark" : "light"} mode`}
            >
              <span className="theme-switch-icon" aria-hidden="true">
                {appTheme === "light"
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                }
              </span>
              <span>{appTheme === "light" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Effort</div>
          <div
            className="card"
            role="button"
            tabIndex={0}
            onClick={() => setShowEffortSplit(v => !v)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowEffortSplit(v => !v);
              }
            }}
            style={{
              padding:"16px",
              cursor:"pointer",
              overflow:"hidden",
              background:"linear-gradient(135deg, rgba(249,115,22,0.18), var(--s1) 48%, rgba(48,209,88,0.08))",
              border:"1px solid rgba(249,115,22,0.24)",
              boxShadow:"0 16px 34px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:18,fontWeight:900,color:"var(--tp)",lineHeight:1.1}}>Effort Score</div>
                <div className="row-sub">
                  Today's CAT execution score
                </div>
              </div>
              <div style={{fontSize:11,color:effortColor,fontWeight:900,letterSpacing:"0.08em",textTransform:"uppercase",padding:"5px 9px",border:"1px solid rgba(249,115,22,0.22)",borderRadius:999,background:"rgba(0,0,0,0.08)"}}>
                {effortStatus}
              </div>
            </div>

            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:14,marginTop:18}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:46,fontWeight:950,color:"var(--tp)",lineHeight:0.95,letterSpacing:0}}>
                  {profileEffort.total}<span style={{fontSize:17,color:"var(--tt)",fontWeight:800}}>/100</span>
                </div>
                <div style={{fontSize:11,color:"var(--tt)",marginTop:6}}>
                  {selectedDate
                    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })
                    : "Selected day"}
                </div>
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setShowEffortSplit(v => !v);
                }}
                style={{
                  border:"1px solid rgba(249,115,22,0.35)",
                  background:"rgba(249,115,22,0.1)",
                  color:"#f97316",
                  borderRadius:999,
                  padding:"8px 12px",
                  fontSize:12,
                  fontWeight:800,
                  fontFamily:"inherit",
                  cursor:"pointer",
                  whiteSpace:"nowrap",
                }}
              >
                {showEffortSplit ? "Hide Split-up" : "View Split-up"}
              </button>
            </div>

            <div className="bar-track es2-bar" style={{marginTop:14}}>
              <div className="bar-fill" style={{width:`${profileEffort.total}%`,background:effortColor}}/>
            </div>

            {showEffortSplit && (
              <div style={{marginTop:14,borderTop:"1px solid var(--b1)",paddingTop:14}}>
                <div style={{display:"grid",gap:10,marginTop:12}}>
                  {effortRows.map(row => (
                    <div key={row.label} style={{display:"grid",gap:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
                        <div style={{fontSize:13,fontWeight:800,color:"var(--tp)"}}>{row.label}</div>
                        <div style={{fontSize:13,fontWeight:900,color:"var(--tp)",fontVariantNumeric:"tabular-nums"}}>{row.val}/{row.max}</div>
                      </div>
                      <div className="bar-track" style={{height:6}}>
                        <div className="bar-fill" style={{width:`${Math.min(100, Math.round((row.val / row.max) * 100))}%`,background:"var(--ac)"}}/>
                      </div>
                      <div style={{fontSize:11,color:"var(--tt)",lineHeight:1.45}}>{row.copy}</div>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,paddingTop:6,borderTop:"1px solid var(--b1)"}}>
                    <span style={{fontSize:13,fontWeight:900,color:"var(--tp)"}}>Total</span>
                    <span style={{fontSize:14,fontWeight:950,color:"var(--tp)",fontVariantNumeric:"tabular-nums"}}>{profileEffort.total}/100</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="sec-label">Category</div>
          <div className="card" style={{padding:"14px 16px"}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={chipStyle(category === c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="sec-label">Your Target Percentile</div>
          <div className="card" style={{padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 99.5"
                value={targetPercentile || ""}
                onChange={e => setTargetPercentile(parseFloat(e.target.value) || 0)}
                style={{
                  flex:1,
                  background:"var(--s2)",
                  border:"1px solid var(--b2)",
                  borderRadius:8,
                  padding:"10px 14px",
                  color:"var(--tp)",
                  fontSize:20,
                  fontWeight:700,
                  outline:"none",
                  fontFamily:"inherit",
                  colorScheme: appTheme === "light" ? "light" : "dark",
                  minWidth:0
                }}
              />
              <span style={{fontSize:12,color:"var(--tt)"}}>percentile</span>
            </div>
            {targetPercentile > 0 && (
              <div style={{
                fontSize:12,
                color: targetPercentile >= 99.5 ? "#30d158"
                  : targetPercentile >= 97 ? "#f97316"
                    : "#ff453a",
                marginTop:8,
                fontWeight:600
              }}>
                {targetPercentile >= 99.5
                  ? "Competitive for all IIMs including IIM-A"
                  : targetPercentile >= 97
                    ? "Competitive for IIM KLIS and New IIMs"
                    : targetPercentile >= 93
                      ? "Competitive for New IIMs and Baby IIMs"
                      : "Below competitive range for IIMs"}
              </div>
            )}
          </div>
        </div>

        {calcResult && (
          <div>
            <div className="sec-label">Your IIM Cutoffs</div>
            <div style={{fontSize:11,color:"var(--tt)",marginBottom:8,fontStyle:"italic"}}>
              Secure ABC target → eligible for all 21 IIMs
            </div>
            {calcResult.isGEM && (
              <div style={{
                padding:"10px 14px",
                background:"rgba(255,69,58,0.08)",
                border:"1px solid rgba(255,69,58,0.2)",
                borderRadius:10,
                marginBottom:8
              }}>
                <div style={{fontSize:12,color:"#ff453a",fontWeight:600,marginBottom:2}}>
                  GEM Profile (General Engineer Male)
                </div>
                <div style={{fontSize:11,color:"var(--tt)",lineHeight:1.5}}>
                  Toughest competition pool. IIM-A realistically needs 99.7+. Work experience and strong academics are your best levers.
                </div>
              </div>
            )}
            <div className="card" style={{padding:0}}>
              {[
                { label:"IIM A / B / C", sub:"Ahmedabad · Bangalore · Calcutta", key:"ABC", color:"#30d158" },
                { label:"IIM K / L / I / S", sub:"Kozhikode · Lucknow · Indore · Shillong", key:"KLIS", color:"#f97316" },
                { label:"New IIMs", sub:"Ranchi · Raipur · Trichy · Nagpur & others", key:"newIIM", color:"#3b82f6" },
              ].map((g, idx, arr) => {
                const needed = calcResult.adjustedCutoffs[g.key];
                const meets = targetPercentile > 0 && targetPercentile >= needed;
                const close = targetPercentile > 0 && !meets && targetPercentile >= needed - 1;
                return (
                  <div key={g.key} style={{
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center",
                    padding:"14px 16px",
                    borderBottom: idx === arr.length - 1 ? "none" : "1px solid var(--b1)",
                    gap:12
                  }}>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="row-label">{g.label}</div>
                      <div className="row-sub">{g.sub}</div>
                      {targetPercentile > 0 && (
                        <div style={{
                          fontSize:11,
                          fontWeight:600,
                          marginTop:4,
                          color: meets ? "#30d158" : close ? "#f97316" : "#ff453a"
                        }}>
                          {meets
                            ? `Your ${targetPercentile}% meets this`
                            : close
                              ? `${(needed-targetPercentile).toFixed(2)}% short`
                              : `Need ${(needed-targetPercentile).toFixed(1)}% more`}
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{
                        fontSize:20,
                        fontWeight:800,
                        color: meets ? "#30d158" : g.color
                      }}>
                        {needed.toFixed(1)}%
                      </div>
                      <div style={{fontSize:9,color:"var(--tt)"}}>needed</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          className="card"
          onClick={() => setTab("academic-profile")}
          style={{cursor:"pointer"}}
        >
          <button
            type="button"
            onClick={() => setTab("academic-profile")}
            style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
              width:"100%",
              padding:"14px 16px",
              background:"transparent",
              border:"none",
              cursor:"pointer",
              fontFamily:"inherit",
              textAlign:"left",
              boxSizing:"border-box",
              position:"relative",
              zIndex:1,
            }}
          >
            <div style={{flex:1,minWidth:0}}>
              <div className="row-label">Academic & Work Profile</div>
              <div className="row-sub">
                {primaryDegree?.type
                  ? `${primaryDegree.type}${primaryDegree.college ? ` · ${primaryDegree.college}` : ""}`
                  : "Add degree, work experience, college"}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="var(--tt)" strokeWidth="2"
              strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <button
          className={`save-btn${saved?" saved":""}`}
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            if (!userId) return;
            fetch("/api/user/update", {
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body: JSON.stringify({
                userId,
                category,
                min_percentile: calcResult ? calcResult.adjustedCutoffs : null,
              })
            }).catch(console.error);
          }}
        >
          {saved ? "Saved" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function ProfileEditPage({
  userName,
  userId,
  onUserIdChange,
  setTab,
  startDate,
  avatarGender,
  avatarSkin,
  avatarHair,
  avatarHairColor,
  avatarShirt,
  avatarGlasses,
  avatarBeard,
  avatarMustache,
  onAvatarChange,
}) {
  const [showPinForm, setShowPinForm] = useState(false);
  const [pinForm, setPinForm] = useState({
    oldPin:"", newPin:"", confirmPin:"", error:"", success:false
  });
  const [changingPin, setChangingPin] = useState(false);
  const chipStyle = (active) => ({
    padding:"6px 12px",
    borderRadius:999,
    border: active ? "1px solid #f97316" : "1px solid var(--b2)",
    background: active ? "rgba(249,115,22,0.15)" : "var(--s2)",
    color: active ? "#f97316" : "var(--tt)",
    fontSize:12,
    cursor:"pointer",
    fontFamily:"inherit"
  });
  const swatchStyle = (active, color) => ({
    width:26,
    height:26,
    borderRadius:"50%",
    background:color,
    border:"none",
    cursor:"pointer",
    outline: active ? "2px solid #f97316" : "2px solid transparent",
    outlineOffset:2
  });
  const pinInputStyle = {
    width:"100%",
    background:"var(--s2)",
    border:"1px solid var(--b2)",
    borderRadius:8,
    padding:"10px 12px",
    color:"var(--tp)",
    fontSize:14,
    letterSpacing:"0.08em",
    textAlign:"center",
    fontFamily:"inherit",
    outline:"none",
    colorScheme:"dark",
    boxSizing:"border-box"
  };
  const updateAvatar = (key, value) => onAvatarChange(key, value);
  const generateUserId = (name, pin) => {
    const str = name.trim().toLowerCase() + pin;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8,"0");
    return `${hex.slice(0,8)}-${hex.slice(0,4)}-4${hex.slice(1,4)}-a${hex.slice(2,5)}-${hex.slice(0,12).padEnd(12,"0")}`;
  };
  const handlePinChange = async () => {
    if (pinForm.oldPin.length !== 4) {
      return setPinForm(p => ({...p, error:"Enter your current 4-digit PIN"}));
    }
    if (pinForm.newPin.length !== 4) {
      return setPinForm(p => ({...p, error:"New PIN must be 4 digits"}));
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      return setPinForm(p => ({...p, error:"New PINs do not match"}));
    }
    if (pinForm.oldPin === pinForm.newPin) {
      return setPinForm(p => ({...p, error:"New PIN must be different"}));
    }

    const expectedUserId = generateUserId(userName || "", pinForm.oldPin);
    if (expectedUserId !== userId) {
      return setPinForm(p => ({...p, error:"Current PIN is incorrect"}));
    }

    setChangingPin(true);
    const newUserId = generateUserId(userName || "", pinForm.newPin);

    try {
      const checkRes = await fetch("/api/user/check", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ userId: newUserId })
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setPinForm(p => ({...p, error:"This PIN is already in use"}));
        setChangingPin(false);
        return;
      }

      await fetch("/api/user/init", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          userId: newUserId,
          name: userName,
          startDate,
          avatarGender,
          avatarSkin,
          avatarHair,
          avatarHairColor,
          avatarShirt,
          avatarGlasses,
          avatarBeard,
          avatarMustache
        })
      });

      localStorage.setItem("conquer_user_id", newUserId);
      onUserIdChange(newUserId);
      setPinForm({ oldPin:"", newPin:"", confirmPin:"", error:"", success:true });
      setTimeout(() => {
        setPinForm(p => ({...p, success:false}));
        setShowPinForm(false);
      }, 3000);
    } catch {
      setPinForm(p => ({...p, error:"Something went wrong. Try again."}));
    } finally {
      setChangingPin(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => setTab("profile")} style={{
          background:"transparent",
          border:"none",
          color:"#f97316",
          fontSize:15,
          cursor:"pointer",
          fontFamily:"inherit",
          display:"flex",
          alignItems:"center",
          gap:4,
          padding:0,
          marginBottom:8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#f97316" strokeWidth="2"
            strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Profile
        </button>
        <div className="page-title">Edit Profile</div>
        <div className="page-sub">Avatar and account security</div>
      </div>

      <div className="sections">
        <div>
          <div className="sec-label">Avatar</div>
          <div className="card" style={{
            padding:"16px",
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            gap:14
          }}>
            <AvatarPreview
              gender={avatarGender}
              skinTone={avatarSkin}
              hairStyle={avatarHair}
              hairColor={avatarHairColor}
              shirtColor={avatarShirt}
              hasGlasses={avatarGlasses}
              hasBeard={avatarBeard}
              hasMustache={avatarMustache}
              size={86}
            />
            <div style={{fontSize:18,fontWeight:800,color:"var(--tp)"}}>
              {userName}
            </div>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"var(--tt)",width:76}}>Gender</span>
                <div style={{display:"flex",gap:6}}>
                  {["male","female"].map(g => (
                    <button key={g} type="button" onClick={() => {
                      updateAvatar("gender", g);
                      if (g === "female") {
                        updateAvatar("beard", false);
                        updateAvatar("mustache", false);
                      }
                    }} style={chipStyle(avatarGender === g)}>{g}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"var(--tt)",width:76}}>Skin</span>
                <div style={{display:"flex",gap:8}}>
                  {[{id:"light",color:"#f1c27d"},{id:"medium",color:"#c68642"},{id:"dark",color:"#8d5524"}].map(s => (
                    <button key={s.id} type="button" onClick={() => updateAvatar("skin", s.id)}
                      style={swatchStyle(avatarSkin === s.id, s.color)} aria-label={s.id} />
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"var(--tt)",width:76}}>Hair</span>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {(avatarGender === "female" ? ["short","wavy","long","curly","bun"] : ["short","wavy","curly"]).map(h => (
                    <button key={h} type="button" onClick={() => updateAvatar("hair", h)}
                      style={chipStyle(avatarHair === h)}>{h}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"var(--tt)",width:76}}>Hair color</span>
                <div style={{display:"flex",gap:8}}>
                  {[{id:"black",color:"#0a0a0a"},{id:"brown",color:"#6b3a2a"},{id:"blonde",color:"#c8a850"},{id:"grey",color:"#888888"}].map(h => (
                    <button key={h.id} type="button" onClick={() => updateAvatar("hairColor", h.id)}
                      style={swatchStyle(avatarHairColor === h.id, h.color)} aria-label={h.id} />
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"var(--tt)",width:76}}>Outfit</span>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[{id:"orange",color:"#f97316"},{id:"blue",color:"#3b82f6"},{id:"green",color:"#22c55e"},{id:"purple",color:"#a855f7"},{id:"red",color:"#ef4444"},{id:"white",color:"#e5e5e5"}].map(s => (
                    <button key={s.id} type="button" onClick={() => updateAvatar("shirt", s.id)}
                      style={swatchStyle(avatarShirt === s.id, s.color)} aria-label={s.id} />
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                  <input type="checkbox" checked={avatarGlasses}
                    onChange={e => updateAvatar("glasses", e.target.checked)}
                    style={{accentColor:"#f97316"}} />
                  <span style={{fontSize:12,color:"var(--tt)"}}>Glasses</span>
                </label>
                {avatarGender === "male" && <>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={avatarBeard}
                      onChange={e => updateAvatar("beard", e.target.checked)}
                      style={{accentColor:"#f97316"}} />
                    <span style={{fontSize:12,color:"var(--tt)"}}>Beard</span>
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={avatarMustache}
                      onChange={e => updateAvatar("mustache", e.target.checked)}
                      style={{accentColor:"#f97316"}} />
                    <span style={{fontSize:12,color:"var(--tt)"}}>Mustache</span>
                  </label>
                </>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="sec-label">Security</div>
          <div className="card" style={{padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
              <div>
                <div className="row-label">PIN</div>
                <div className="row-sub">Used to open this profile on other devices</div>
              </div>
              <button type="button" onClick={() => setShowPinForm(p => !p)}
                className="profile-pin-pill">
                {showPinForm ? "Hide" : "Change PIN"}
              </button>
            </div>
            {showPinForm && (
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
                <div className="pin-grid">
                  <input type="password" inputMode="numeric" maxLength={4}
                    placeholder="Current"
                    value={pinForm.oldPin}
                    onChange={e => setPinForm(p => ({
                      ...p,
                      oldPin: e.target.value.replace(/\D/g,""),
                      error:""
                    }))}
                    style={pinInputStyle}
                  />
                  <input type="password" inputMode="numeric" maxLength={4}
                    placeholder="New"
                    value={pinForm.newPin}
                    onChange={e => setPinForm(p => ({
                      ...p,
                      newPin: e.target.value.replace(/\D/g,""),
                      error:""
                    }))}
                    style={pinInputStyle}
                  />
                  <input type="password" inputMode="numeric" maxLength={4}
                    placeholder="Confirm"
                    value={pinForm.confirmPin}
                    onChange={e => setPinForm(p => ({
                      ...p,
                      confirmPin: e.target.value.replace(/\D/g,""),
                      error:""
                    }))}
                    style={pinInputStyle}
                  />
                </div>
                {pinForm.error && (
                  <div style={{fontSize:12,color:"#ff453a",textAlign:"center"}}>
                    {pinForm.error}
                  </div>
                )}
                {pinForm.success && (
                  <div style={{fontSize:12,color:"#30d158",textAlign:"center",fontWeight:600}}>
                    PIN changed successfully
                  </div>
                )}
                <button
                  type="button"
                  onClick={handlePinChange}
                  disabled={changingPin ||
                    pinForm.oldPin.length < 4 ||
                    pinForm.newPin.length < 4 ||
                    pinForm.confirmPin.length < 4}
                  style={{
                    width:"100%",
                    padding:"10px 12px",
                    background: pinForm.oldPin.length === 4 &&
                      pinForm.newPin.length === 4 &&
                      pinForm.confirmPin.length === 4
                      ? "#f97316" : "var(--b2)",
                    border:"none",
                    borderRadius:9,
                    color:"white",
                    fontSize:13,
                    fontWeight:700,
                    cursor: changingPin ||
                      pinForm.oldPin.length < 4 ||
                      pinForm.newPin.length < 4 ||
                      pinForm.confirmPin.length < 4
                      ? "not-allowed" : "pointer",
                    fontFamily:"inherit"
                  }}
                >
                  {changingPin ? "Updating..." : "Save PIN"}
                </button>
                <div style={{fontSize:10,color:"var(--tt)",textAlign:"center"}}>
                  You will need this new PIN on other devices.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AcademicProfilePage({
  primaryDegree, setPrimaryDegree,
  secondaryDegrees, setSecondaryDegrees,
  workExpYears, setWorkExpYears,
  workExpMonths, setWorkExpMonths,
  workCompany, setWorkCompany,
  workRole, setWorkRole,
  calcResult,
  onBack, setTab, userId
}) {
  const [saved, setSaved] = useState(false);
  const inputStyle = {
    width:"100%", background:"var(--s2)",
    border:"1px solid var(--b2)", borderRadius:8,
    padding:"10px 12px", color:"var(--tp)",
    fontSize:14, fontFamily:"inherit",
    outline:"none", boxSizing:"border-box"
  };

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{
          background:"transparent",border:"none",
          color:"#f97316",fontSize:15,cursor:"pointer",
          fontFamily:"inherit",display:"flex",
          alignItems:"center",gap:4,padding:0,marginBottom:8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#f97316" strokeWidth="2"
            strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Profile
        </button>
        <div className="page-title">Academic & Work Profile</div>
        <div className="page-sub">Degree, college, GPA and work experience</div>
      </div>

      <div className="sections">
        <div>
          <div className="sec-label">Primary Degree *</div>
          <div className="card" style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
            <select style={{...inputStyle,appearance:"none",WebkitAppearance:"none"}}
              value={primaryDegree?.type || ""}
              onChange={e => setPrimaryDegree(p => ({...p,type:e.target.value}))}>
              <option value="">Degree type</option>
              {["B.Tech","B.E.","B.Sc","B.Com","BBA","BA","B.Arch","BCA","B.Pharm","MBBS","LLB","B.Sc (Engg)","Other"].map(d =>
                <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="text"
              placeholder="Field / Specialization e.g. Computer Science"
              value={primaryDegree?.field || ""}
              onChange={e => setPrimaryDegree(p => ({...p,field:e.target.value}))}
              style={inputStyle}/>
            <input type="text"
              placeholder="College / University name"
              value={primaryDegree?.college || ""}
              onChange={e => setPrimaryDegree(p => ({...p,college:e.target.value}))}
              style={inputStyle}/>
            <div style={{display:"flex",gap:8}}>
              <input type="text"
                placeholder="GPA or %"
                value={primaryDegree?.gpa || ""}
                onChange={e => setPrimaryDegree(p => ({...p,gpa:e.target.value}))}
                style={{...inputStyle,flex:1}}/>
              <input type="number"
                placeholder="Year"
                value={primaryDegree?.year || ""}
                onChange={e => setPrimaryDegree(p => ({...p,year:e.target.value}))}
                style={{...inputStyle,flex:1}}/>
            </div>
            <div style={{display:"flex",gap:6}}>
              {["percentage","10","4"].map(scale => (
                <button key={scale}
                  onClick={() => setPrimaryDegree(p => ({...p,gpaScale:scale}))}
                  style={{
                    padding:"3px 10px",borderRadius:20,
                    border:(primaryDegree?.gpaScale||"percentage")===scale
                      ?"1px solid #f97316":"1px solid var(--b2)",
                    background:(primaryDegree?.gpaScale||"percentage")===scale
                      ?"rgba(249,115,22,0.15)":"var(--s2)",
                    color:(primaryDegree?.gpaScale||"percentage")===scale
                      ?"#f97316":"var(--tt)",
                    fontSize:11,cursor:"pointer",
                    fontFamily:"inherit"
                  }}>
                  {scale==="percentage" ? "%" : `/${scale} CGPA`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="sec-label">Secondary Degrees</div>
          <div className="card">
            <button
              onClick={() => setTab("secondary-degrees")}
              style={{
                display:"flex",alignItems:"center",
                justifyContent:"space-between",
                width:"100%",padding:"14px 16px",
                background:"transparent",border:"none",
                cursor:"pointer",fontFamily:"inherit",
                textAlign:"left",boxSizing:"border-box",
              }}>
              <div style={{flex:1,minWidth:0}}>
                <div className="row-label">PG / Masters / Additional</div>
                <div className="row-sub">
                  {secondaryDegrees.length > 0
                    ? `${secondaryDegrees.length} degree${secondaryDegrees.length>1?"s":""} added`
                    : "MBA, MS, M.Tech, CA etc"}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="var(--tt)" strokeWidth="2"
                strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Work Experience</div>
          <div className="card" style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",gap:8}}>
              <select style={{...inputStyle,flex:1,appearance:"none",WebkitAppearance:"none"}}
                value={workExpYears}
                onChange={e => setWorkExpYears(Number(e.target.value))}>
                {Array.from({length:16},(_,i)=>i).map(y =>
                  <option key={y} value={y}>{y} yr{y!==1?"s":""}</option>)}
              </select>
              <select style={{...inputStyle,flex:1,appearance:"none",WebkitAppearance:"none"}}
                value={workExpMonths}
                onChange={e => setWorkExpMonths(Number(e.target.value))}>
                {Array.from({length:12},(_,i)=>i).map(m =>
                  <option key={m} value={m}>{m} mo{m!==1?"s":""}</option>)}
              </select>
            </div>
            <input type="text" placeholder="Company name"
              value={workCompany}
              onChange={e => setWorkCompany(e.target.value)}
              style={inputStyle}/>
            <input type="text" placeholder="Role / Designation"
              value={workRole}
              onChange={e => setWorkRole(e.target.value)}
              style={inputStyle}/>
          </div>
        </div>

        {calcResult && (
          <div>
            <div className="sec-label">Profile Breakdown</div>
            <div className="card" style={{padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div className="row-label">Profile Score</div>
                <div style={{
                  fontSize:22,fontWeight:800,
                  color: calcResult.profileScore >= 70
                    ? "#30d158"
                    : calcResult.profileScore >= 50
                      ? "#f97316" : "#ff453a"
                }}>
                  {calcResult.profileScore}/100
                </div>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{
                  width:`${calcResult.profileScore}%`,
                  background: calcResult.profileScore >= 70
                    ? "#30d158"
                    : calcResult.profileScore >= 50
                      ? "#f97316" : "#ff453a"
                }}/>
              </div>
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:4}}>
                {Object.entries(calcResult.adjustmentSummary)
                  .filter(([,v]) => v !== 0)
                  .map(([k,v]) => (
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,gap:10}}>
                      <span style={{color:"var(--tt)"}}>
                        {k === "gemPenalty" ? "GEM profile penalty"
                          : k === "femaleDiversity" ? "Female diversity bonus"
                            : k === "nonEngineerDiversity" ? "Non-engineer diversity"
                              : k === "workEx" ? "Work experience"
                                : k === "mastersDegree" ? "Masters degree"
                                  : "Academic record"}
                      </span>
                      <span style={{color:v < 0 ? "#30d158" : "#ff453a",fontWeight:600}}>
                        {v > 0 ? "+" : ""}{v.toFixed(2)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        <button
          className={`save-btn${saved?" saved":""}`}
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            if (!userId) return;
            fetch("/api/user/update", {
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body: JSON.stringify({
                userId,
                primary_degree: primaryDegree,
                secondary_degrees: secondaryDegrees,
                work_experience_years: workExpYears,
                work_experience_months: workExpMonths,
                work_company: workCompany,
                work_role: workRole,
              })
            }).catch(console.error);
          }}
        >
          {saved ? "Saved" : "Save Academic Profile"}
        </button>
      </div>
    </div>
  );
}

function SecondaryDegreesPage({
  secondaryDegrees, setSecondaryDegrees, onBack
}) {
  const emptyForm = {
    degree:"", field:"", college:"",
    gpa:"", gpaScale:"percentage", year:""
  };
  const [form, setForm] = useState(emptyForm);
  const degreeTypes = [
    "M.Tech","M.E.","M.Sc","MBA","MCA","MA","M.Com",
    "MS","M.Phil","LLM","PGDM","CA","CS","CFA","Other"
  ];
  const inputStyle = {
    width:"100%", background:"var(--s2)",
    border:"1px solid var(--b2)", borderRadius:8,
    padding:"10px 12px", color:"var(--tp)",
    fontSize:14, fontFamily:"inherit",
    outline:"none", boxSizing:"border-box"
  };
  const normalizeDegree = (deg) => typeof deg === "string"
    ? { id: deg, text: deg }
    : deg;
  const addDegree = () => {
    if (!form.degree) return;
    setSecondaryDegrees(prev => [...prev, {
      id: Date.now().toString(),
      ...form
    }]);
    setForm(emptyForm);
  };
  const removeDegree = (id) => {
    setSecondaryDegrees(prev => prev.filter(d => normalizeDegree(d).id !== id));
  };

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} style={{
          background:"transparent", border:"none",
          color:"#f97316", fontSize:15, cursor:"pointer",
          fontFamily:"inherit", display:"flex",
          alignItems:"center", gap:4, padding:0, marginBottom:8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#f97316" strokeWidth="2"
            strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Profile
        </button>
        <div className="page-title">Secondary Degrees</div>
        <div className="page-sub">PG, Masters, professional qualifications</div>
      </div>

      <div className="sections">
        {secondaryDegrees.length > 0 && (
          <div>
            <div className="sec-label">Added ({secondaryDegrees.length})</div>
            {secondaryDegrees.map(raw => {
              const deg = normalizeDegree(raw);
              const displayText = deg.text || [
                deg.degree,
                deg.field ? `- ${deg.field}` : "",
              ].filter(Boolean).join(" ");
              return (
                <div key={deg.id || displayText} className="card"
                  style={{padding:"14px 16px",display:"flex",
                    justifyContent:"space-between",alignItems:"flex-start",
                    marginBottom:8,gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,
                      color:"var(--tp)",marginBottom:2}}>
                      {displayText || "Additional degree"}
                    </div>
                    {deg.college && (
                      <div style={{fontSize:12,color:"var(--tt)"}}>
                        {deg.college}
                      </div>
                    )}
                    <div style={{fontSize:11,color:"var(--tt)",marginTop:2}}>
                      {deg.gpa ? `${deg.gpa} ${
                        deg.gpaScale==="10" ? "/ 10 CGPA"
                        : deg.gpaScale==="4" ? "/ 4.0 CGPA"
                        : "%"
                      }` : ""}
                      {deg.year ? `  ·  ${deg.year}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => removeDegree(deg.id)}
                    aria-label="Remove degree"
                    style={{background:"transparent",border:"none",
                      color:"#ff453a",fontSize:20,cursor:"pointer",
                      padding:"0 0 0 12px",lineHeight:1}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div>
          <div className="sec-label">Add Degree</div>
          <div className="card" style={{padding:"14px 16px",
            display:"flex",flexDirection:"column",gap:10}}>
            <select style={{...inputStyle,appearance:"none",WebkitAppearance:"none"}}
              value={form.degree}
              onChange={e => setForm(p => ({...p, degree:e.target.value}))}>
              <option value="">Degree type *</option>
              {degreeTypes.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="text" placeholder="Field / Specialization"
              value={form.field}
              onChange={e => setForm(p => ({...p, field:e.target.value}))}
              style={inputStyle}
            />
            <input type="text" placeholder="College / University"
              value={form.college}
              onChange={e => setForm(p => ({...p, college:e.target.value}))}
              style={inputStyle}
            />
            <div style={{display:"flex",gap:8}}>
              <input type="text" placeholder="GPA or %"
                value={form.gpa}
                onChange={e => setForm(p => ({...p, gpa:e.target.value}))}
                style={{...inputStyle,flex:1}}
              />
              <input type="number" placeholder="Year"
                value={form.year}
                onChange={e => setForm(p => ({...p, year:e.target.value}))}
                style={{...inputStyle,flex:1}}
              />
            </div>
            <div style={{display:"flex",gap:6}}>
              {["percentage","10","4"].map(scale => (
                <button key={scale}
                  onClick={() => setForm(p => ({...p, gpaScale:scale}))}
                  style={{
                    padding:"3px 10px", borderRadius:20,
                    border: form.gpaScale===scale
                      ? "1px solid #f97316"
                      : "1px solid var(--b2)",
                    background: form.gpaScale===scale
                      ? "rgba(249,115,22,0.15)" : "var(--s2)",
                    color: form.gpaScale===scale ? "#f97316" : "var(--tt)",
                    fontSize:11, cursor:"pointer",
                    fontFamily:"inherit"
                  }}>
                  {scale==="percentage" ? "%" : `/${scale} CGPA`}
                </button>
              ))}
            </div>
            <button
              onClick={addDegree}
              disabled={!form.degree}
              style={{
                width:"100%", padding:"12px",
                background: form.degree ? "#f97316" : "var(--b2)",
                border:"none", borderRadius:10,
                color:"white", fontSize:14,
                fontWeight:700, cursor: form.degree ? "pointer" : "not-allowed",
                fontFamily:"inherit"
              }}>
              + Add Degree
            </button>
          </div>
        </div>

        <div style={{
          padding:"12px 14px",
          background:"rgba(249,115,22,0.05)",
          border:"1px solid rgba(249,115,22,0.15)",
          borderRadius:10
        }}>
          <div style={{fontSize:12,color:"var(--tt)",lineHeight:1.6}}>
            IIM-B and IIM-K give extra weightage to candidates with Masters degrees during PI shortlisting. It strengthens your profile score and reduces effective cutoff by about 0.4 percentile.
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({ onStart }) {
  const [screen, setScreen] = useState("choice")
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("2026")
  const [gender, setGender] = useState("male")
  const [skinTone, setSkinTone] = useState("medium")
  const [hairStyle, setHairStyle] = useState("wavy")
  const [hairColor, setHairColor] = useState("black")
  const [shirtColor, setShirtColor] = useState("blue")
  const [hasGlasses, setHasGlasses] = useState(false)
  const [hasBeard, setHasBeard] = useState(false)
  const [hasMustache, setHasMustache] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [pendingStart, setPendingStart] = useState(null)
  const [onboardCategory, setOnboardCategory] = useState("General")
  const [onboardPrimaryDegree, setOnboardPrimaryDegree] = useState({})

  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"]
  const days = Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0"))
  const categories = ["General", "OBC-NCL", "SC", "ST", "EWS", "PWD"]
  const degreeTypes = [
    "B.Tech", "B.E.", "B.Sc", "B.Com", "BBA", "BA",
    "B.Arch", "BCA", "B.Pharm", "MBBS", "LLB", "Other"
  ]

  const getDateString = () => {
    if (!day || !month) return ""
    const m = String(months.indexOf(month)+1).padStart(2,"0")
    return `${year}-${m}-${day}`
  }

  const generateUserId = (name, pin) => {
    const str = name.trim().toLowerCase() + pin
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    const hex = Math.abs(hash).toString(16).padStart(8,"0")
    return `${hex.slice(0,8)}-${hex.slice(0,4)}-4${hex.slice(1,4)}-a${hex.slice(2,5)}-${hex.slice(0,12).padEnd(12,"0")}`
  }

  const handleNewUser = async () => {
    if (!name.trim()) return setError("Enter your name")
    if (pin.length !== 4) return setError("PIN must be 4 digits")
    if (pin !== confirmPin) return setError("PINs do not match")
    const d = getDateString()
    if (!d) return setError("Select your start date")
    setLoading(true)
    setError("")
    const userId = generateUserId(name, pin)
    try {
      const res = await fetch("/api/user/check", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (data.exists) {
        setError("This name + PIN combination already exists. Use 'Return to Journey' instead.")
        setLoading(false)
        return
      }
    } catch {}
    localStorage.setItem("conquer_user_id", userId)
    localStorage.setItem("cat_avatar_gender", gender)
    localStorage.setItem("cat_avatar_skin", skinTone)
    localStorage.setItem("cat_avatar_hair", hairStyle)
    localStorage.setItem("cat_avatar_hair_color", hairColor)
    localStorage.setItem("cat_avatar_shirt", shirtColor)
    localStorage.setItem("cat_avatar_glasses", String(hasGlasses))
    localStorage.setItem("cat_avatar_beard", String(hasBeard))
    localStorage.setItem("cat_avatar_mustache", String(hasMustache))
    setLoading(false)
    setPendingStart({ date: d, name: name.trim(), userId })
    setScreen("profile_optional")
  }

  const completeOnboarding = (profile = {}) => {
    if (!pendingStart) return
    onStart(pendingStart.date, pendingStart.name, pendingStart.userId, profile)
  }

  const handleCompleteWithProfile = () => {
    const primaryDegree = onboardPrimaryDegree || {}
    localStorage.setItem("cat_category", onboardCategory)
    localStorage.setItem("cat_primary_degree", JSON.stringify(primaryDegree))
    completeOnboarding({
      category: onboardCategory,
      primaryDegree
    })
  }

  const handleSkipProfile = () => {
    completeOnboarding({})
  }

  const handleReturn = async () => {
    if (!name.trim()) return setError("Enter your name")
    if (pin.length !== 4) return setError("Enter your 4-digit PIN")
    setLoading(true)
    setError("")
    const userId = generateUserId(name, pin)
    try {
      const res = await fetch("/api/user/check", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (!data.exists) {
        setError("No account found. Check your name and PIN.")
        setLoading(false)
        return
      }
      localStorage.setItem("conquer_user_id", userId)
      if (data.user.avatar_gender) localStorage.setItem("cat_avatar_gender", data.user.avatar_gender)
      if (data.user.avatar_skin) localStorage.setItem("cat_avatar_skin", data.user.avatar_skin)
      if (data.user.avatar_hair) localStorage.setItem("cat_avatar_hair", data.user.avatar_hair)
      if (data.user.avatar_hair_color) localStorage.setItem("cat_avatar_hair_color", data.user.avatar_hair_color)
      if (data.user.avatar_shirt) localStorage.setItem("cat_avatar_shirt", data.user.avatar_shirt)
      if (data.user.avatar_glasses != null) localStorage.setItem("cat_avatar_glasses", String(data.user.avatar_glasses))
      if (data.user.avatar_beard != null) localStorage.setItem("cat_avatar_beard", String(data.user.avatar_beard))
      if (data.user.avatar_mustache != null) localStorage.setItem("cat_avatar_mustache", String(data.user.avatar_mustache))
      setLoading(false)
      onStart(data.user.start_date, data.user.name, userId)
    } catch {
      setError("Connection error. Try again.")
      setLoading(false)
    }
  }

  const inputStyle = {
    width:"100%", background:"#111", border:"1px solid #2a2a2a",
    borderRadius:10, padding:"12px 16px", color:"#f5f5f7",
    fontSize:15, outline:"none", fontFamily:"inherit",
    boxSizing:"border-box", colorScheme:"dark"
  }
  const selectStyle = {
    ...inputStyle, cursor:"pointer",
    appearance:"none", WebkitAppearance:"none"
  }
  const btnStyle = (active) => ({
    width:"100%", height:52,
    background: active ? "#f97316" : "#2a2a2a",
    border:"none", borderRadius:11, color:"white",
    fontSize:15, fontWeight:800,
    cursor: active ? "pointer" : "not-allowed",
    fontFamily:"inherit", letterSpacing:"0.05em",
    textTransform:"uppercase", transition:"all 0.2s"
  })

  if (screen === "choice") return (
    <div style={{position:"fixed",inset:0,background:"#000",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"40px 24px",fontFamily:"inherit"}}>
      <div style={{fontSize:13,fontWeight:700,letterSpacing:"0.15em",
        color:"#f97316",marginBottom:12}}>CONQUER</div>
      <div style={{fontSize:32,fontWeight:800,color:"#f5f5f7",
        letterSpacing:"-0.03em",marginBottom:8,textAlign:"center",
        lineHeight:1.2}}>Time to<br/>Conquer CAT.</div>
      <div style={{fontSize:14,color:"#6e6e73",marginBottom:48,
        textAlign:"center",lineHeight:1.6}}>
        CAT 2026 · 99.9%ile
      </div>
      <div style={{width:"100%",maxWidth:320,
        display:"flex",flexDirection:"column",gap:12}}>
        <button
          onClick={() => setScreen("new")}
          style={{...btnStyle(true), background:"#f97316"}}>
          Begin the Journey →
        </button>
        <button
          onClick={() => setScreen("return")}
          style={{...btnStyle(true), background:"transparent",
            border:"1px solid #2a2a2a", color:"#a1a1a6",
            fontSize:14, fontWeight:600}}>
          Return to Journey
        </button>
      </div>
      <div style={{marginTop:48,fontSize:12,color:"#444",
        textAlign:"center",lineHeight:1.8}}>
        "The secret of getting ahead is getting started."<br/>
        <span style={{color:"#6e6e73"}}>— Every IIM topper, ever.</span>
      </div>
    </div>
  )

  if (screen === "return") return (
    <div style={{position:"fixed",inset:0,background:"#000",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"40px 24px",fontFamily:"inherit"}}>
      <MentorAvatar size={64}/>
      <div style={{marginTop:16,fontSize:13,fontWeight:700,
        color:"#f97316",letterSpacing:"0.1em"}}>VIKRAM ANAND</div>
      <div style={{marginTop:16,fontSize:26,fontWeight:800,
        color:"#f5f5f7",textAlign:"center",lineHeight:1.2,
        letterSpacing:"-0.03em",marginBottom:32}}>
        Welcome back.<br/>Let's continue.
      </div>
      <div style={{width:"100%",maxWidth:320,
        display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <div style={{fontSize:11,color:"#6e6e73",
            letterSpacing:"0.08em",textTransform:"uppercase",
            marginBottom:8}}>Your Name</div>
          <input type="text" placeholder="Same name you used before"
            value={name} onChange={e=>setName(e.target.value)}
            style={inputStyle}/>
        </div>
        <div>
          <div style={{fontSize:11,color:"#6e6e73",
            letterSpacing:"0.08em",textTransform:"uppercase",
            marginBottom:8}}>Your PIN</div>
          <input type="password" inputMode="numeric"
            maxLength={4} placeholder="4-digit PIN"
            value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))}
            style={{...inputStyle,fontSize:24,letterSpacing:"0.3em",
              textAlign:"center"}}/>
        </div>
        {error && <div style={{fontSize:13,color:"#ff453a",
          textAlign:"center"}}>{error}</div>}
        <button
          onClick={handleReturn}
          disabled={loading}
          style={btnStyle(name.trim() && pin.length===4 && !loading)}>
          {loading ? "Loading..." : "Continue →"}
        </button>
        <button onClick={() => { setScreen("choice"); setError("") }}
          style={{background:"transparent",border:"none",
            color:"#6e6e73",fontSize:13,cursor:"pointer",
            fontFamily:"inherit",padding:"8px"}}>
          ← Back
        </button>
      </div>
    </div>
  )

  if (screen === "profile_optional") return (
    <div style={{position:"fixed",inset:0,background:"#000",
      overflowY:"auto",fontFamily:"inherit"}}>
      <div style={{display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        minHeight:"100dvh",padding:"40px 24px 60px"}}>
        <div style={{fontSize:13,color:"#f97316",fontWeight:700,
          letterSpacing:"0.1em"}}>ONE MORE THING</div>
        <div style={{fontSize:22,fontWeight:800,color:"#f5f5f7",
          textAlign:"center",marginTop:16,marginBottom:8}}>
          Tell Vikram about yourself
        </div>
        <div style={{fontSize:13,color:"#6e6e73",textAlign:"center",
          marginBottom:32,lineHeight:1.6,maxWidth:340}}>
          Your degree and background help Vikram personalise
          your IIM targets. You can skip this and add it later
          in your Profile.
        </div>

        <div style={{width:"100%",maxWidth:360,
          display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
              textTransform:"uppercase",marginBottom:8}}>Category</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {categories.map(c => (
                <button key={c}
                  onClick={() => setOnboardCategory(c)}
                  style={{
                    padding:"7px 13px", borderRadius:20,
                    border: onboardCategory===c
                      ? "1px solid #f97316"
                      : "1px solid #2a2a2a",
                    background: onboardCategory===c
                      ? "rgba(249,115,22,0.15)"
                      : "#111",
                    color: onboardCategory===c ? "#f97316" : "#6e6e73",
                    fontSize:12, cursor:"pointer",
                    fontFamily:"inherit"
                  }}>{c}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
              textTransform:"uppercase",marginBottom:8}}>Primary Degree</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <select
                value={onboardPrimaryDegree.type || ""}
                onChange={e => setOnboardPrimaryDegree(p => ({...p, type:e.target.value}))}
                style={selectStyle}
              >
                <option value="">Degree type</option>
                {degreeTypes.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Field / specialization"
                value={onboardPrimaryDegree.field || ""}
                onChange={e => setOnboardPrimaryDegree(p => ({...p, field:e.target.value}))}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="College name"
                value={onboardPrimaryDegree.college || ""}
                onChange={e => setOnboardPrimaryDegree(p => ({...p, college:e.target.value}))}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            onClick={handleCompleteWithProfile}
            style={{...btnStyle(true), background:"#f97316"}}>
            Save & Begin →
          </button>
          <button
            onClick={handleSkipProfile}
            style={{background:"transparent",border:"none",
              color:"#6e6e73",fontSize:13,cursor:"pointer",
              fontFamily:"inherit",padding:"8px"}}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{position:"fixed",inset:0,background:"#000",
      overflowY:"auto",fontFamily:"inherit"}}>
      <div style={{display:"flex",flexDirection:"column",
        alignItems:"center",padding:"40px 24px 60px"}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:"0.15em",
          color:"#f97316",marginBottom:12}}>CONQUER</div>
        <div style={{fontSize:28,fontWeight:800,color:"#f5f5f7",
          letterSpacing:"-0.03em",marginBottom:32,textAlign:"center",
          lineHeight:1.2}}>Create your profile</div>

        <div style={{width:"100%",maxWidth:360,
          display:"flex",flexDirection:"column",gap:20}}>

          <div>
            <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
              textTransform:"uppercase",marginBottom:8}}>Your Name</div>
            <input type="text" placeholder="Full name"
              value={name} onChange={e=>setName(e.target.value)}
              style={inputStyle}/>
          </div>

          <div>
            <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
              textTransform:"uppercase",marginBottom:8}}>Create PIN</div>
            <input type="password" inputMode="numeric"
              maxLength={4} placeholder="4 digits"
              value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))}
              style={{...inputStyle,fontSize:24,letterSpacing:"0.3em",
                textAlign:"center"}}/>
            <div style={{fontSize:11,color:"#6e6e73",marginTop:6}}>
              Remember this PIN — you'll need it on other devices
            </div>
          </div>

          <div>
            <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
              textTransform:"uppercase",marginBottom:8}}>Confirm PIN</div>
            <input type="password" inputMode="numeric"
              maxLength={4} placeholder="Repeat PIN"
              value={confirmPin}
              onChange={e=>setConfirmPin(e.target.value.replace(/\D/g,""))}
              style={{...inputStyle,fontSize:24,letterSpacing:"0.3em",
                textAlign:"center"}}/>
          </div>

          <div>
            <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
              textTransform:"uppercase",marginBottom:8}}>Your Look</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:80}}>Gender</span>
                <div style={{display:"flex",gap:6}}>
                  {["male","female"].map(g => (
                    <button key={g} onClick={() => {
                      setGender(g)
                      if (g==="female") { setHasBeard(false); setHasMustache(false) }
                    }} style={{
                      padding:"5px 14px",borderRadius:20,
                      background:gender===g?"rgba(249,115,22,0.15)":"#1a1a1a",
                      border:gender===g?"1px solid #f97316":"1px solid #2a2a2a",
                      color:gender===g?"#f97316":"#6e6e73",
                      fontSize:12,cursor:"pointer",fontFamily:"inherit",
                      textTransform:"capitalize"
                    }}>{g}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:80}}>Skin</span>
                <div style={{display:"flex",gap:6}}>
                  {[{id:"light",color:"#f1c27d"},{id:"medium",color:"#c68642"},{id:"dark",color:"#8d5524"}].map(s=>(
                    <button key={s.id} onClick={()=>setSkinTone(s.id)} style={{
                      width:28,height:28,borderRadius:"50%",
                      background:s.color,border:"none",cursor:"pointer",
                      outline:skinTone===s.id?"2px solid #f97316":"2px solid transparent",
                      outlineOffset:2
                    }}/>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:80}}>Hair</span>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {(gender==="female"
                    ?["short","wavy","long","curly","bun"]
                    :["short","wavy","curly"]
                  ).map(h=>(
                    <button key={h} onClick={()=>setHairStyle(h)} style={{
                      padding:"4px 10px",borderRadius:20,
                      background:hairStyle===h?"rgba(249,115,22,0.15)":"#1a1a1a",
                      border:hairStyle===h?"1px solid #f97316":"1px solid #2a2a2a",
                      color:hairStyle===h?"#f97316":"#6e6e73",
                      fontSize:11,cursor:"pointer",fontFamily:"inherit",
                      textTransform:"capitalize"
                    }}>{h}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:80}}>Hair color</span>
                <div style={{display:"flex",gap:6}}>
                  {[
                    {id:"black",color:"#0a0a0a"},
                    {id:"brown",color:"#6b3a2a"},
                    {id:"blonde",color:"#c8a850"},
                    {id:"grey",color:"#888888"}
                  ].map(h=>(
                    <button key={h.id} onClick={()=>setHairColor(h.id)} style={{
                      width:24,height:24,borderRadius:"50%",
                      background:h.color,border:"none",cursor:"pointer",
                      outline:hairColor===h.id?"2px solid #f97316":"2px solid transparent",
                      outlineOffset:2
                    }}/>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:80}}>Outfit</span>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[
                    {id:"orange",color:"#f97316"},
                    {id:"blue",color:"#3b82f6"},
                    {id:"green",color:"#22c55e"},
                    {id:"purple",color:"#a855f7"},
                    {id:"red",color:"#ef4444"},
                    {id:"white",color:"#e5e5e5"}
                  ].map(s=>(
                    <button key={s.id} onClick={()=>setShirtColor(s.id)} style={{
                      width:24,height:24,borderRadius:"50%",
                      background:s.color,border:"none",cursor:"pointer",
                      outline:shirtColor===s.id?"2px solid #f97316":"2px solid transparent",
                      outlineOffset:2
                    }}/>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                  <input type="checkbox" checked={hasGlasses}
                    onChange={e=>setHasGlasses(e.target.checked)}
                    style={{accentColor:"#f97316"}}/>
                  <span style={{fontSize:12,color:"#6e6e73"}}>Glasses</span>
                </label>
                {gender==="male" && <>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={hasBeard}
                      onChange={e=>setHasBeard(e.target.checked)}
                      style={{accentColor:"#f97316"}}/>
                    <span style={{fontSize:12,color:"#6e6e73"}}>Beard</span>
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={hasMustache}
                      onChange={e=>setHasMustache(e.target.checked)}
                      style={{accentColor:"#f97316"}}/>
                    <span style={{fontSize:12,color:"#6e6e73"}}>Mustache</span>
                  </label>
                </>}
              </div>
              <div style={{display:"flex",justifyContent:"center",marginTop:4}}>
                <AvatarPreview
                  gender={gender} skinTone={skinTone}
                  hairStyle={hairStyle} hairColor={hairColor}
                  shirtColor={shirtColor} hasGlasses={hasGlasses}
                  hasBeard={hasBeard} hasMustache={hasMustache}
                  size={90}
                />
              </div>
            </div>
          </div>

          <div>
            <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
              textTransform:"uppercase",marginBottom:8}}>Start Date</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:8}}>
              <select value={day} onChange={e=>setDay(e.target.value)} style={selectStyle}>
                <option value="">DD</option>
                {days.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              <select value={month} onChange={e=>setMonth(e.target.value)} style={selectStyle}>
                <option value="">Month</option>
                {months.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
              <select value={year} onChange={e=>setYear(e.target.value)} style={selectStyle}>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {error && <div style={{fontSize:13,color:"#ff453a",
            textAlign:"center"}}>{error}</div>}

          <button
            onClick={handleNewUser}
            disabled={loading}
            style={btnStyle(!loading && name.trim() && pin.length===4
              && confirmPin.length===4 && day && month)}>
            {loading ? "Creating..." : "Begin the Journey →"}
          </button>

          <button onClick={() => { setScreen("choice"); setError("") }}
            style={{background:"transparent",border:"none",
              color:"#6e6e73",fontSize:13,cursor:"pointer",
              fontFamily:"inherit",padding:"8px"}}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultsScreen({ onConfirm }) {
  const [percentile, setPercentile] = useState("")

  const handleConfirm = () => {
    const p = parseFloat(percentile)
    if (!percentile || isNaN(p)) return
    const success = p >= 99
    localStorage.setItem("cat_result", success ? "cracked" : "missed")
    localStorage.setItem("cat_percentile", percentile)
    onConfirm(success, percentile)
  }

  return (
    <div style={{
      position:"fixed", inset:0, background:"#000",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"40px 24px", fontFamily:"inherit"
    }}>
      <MentorAvatar size={96}/>
      <div style={{
        marginTop:24, fontSize:13, fontWeight:700,
        color:"#f97316", letterSpacing:"0.1em"
      }}>VIKRAM ANAND</div>
      <div style={{
        marginTop:20, fontSize:32, fontWeight:800,
        color:"#f5f5f7", textAlign:"center",
        lineHeight:1.2, letterSpacing:"-0.03em"
      }}>
        CAT results are out.<br/>
        What did you score?
      </div>
      <div style={{
        marginTop:12, fontSize:14, color:"#6e6e73",
        textAlign:"center", lineHeight:1.6, maxWidth:320
      }}>
        Enter your percentile honestly.<br/>
        Vikram already knows.
      </div>

      <div style={{
        marginTop:40, width:"100%", maxWidth:320,
        display:"flex", flexDirection:"column", gap:16
      }}>
        <div>
          <div style={{
            fontSize:11, color:"#6e6e73",
            letterSpacing:"0.08em", textTransform:"uppercase",
            marginBottom:8
          }}>Your Percentile</div>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g. 99.94"
            value={percentile}
            onChange={e => setPercentile(e.target.value)}
            style={{
              width:"100%", background:"#111",
              border:"1px solid #2a2a2a", borderRadius:10,
              padding:"14px 16px", color:"#f5f5f7",
              fontSize:24, fontWeight:700, outline:"none",
              fontFamily:"inherit", textAlign:"center",
              colorScheme:"dark", boxSizing:"border-box"
            }}
          />
        </div>

        {percentile && !isNaN(parseFloat(percentile)) && (
          <div style={{
            padding:"14px 16px",
            background: parseFloat(percentile) >= 99
              ? "rgba(48,209,88,0.1)"
              : "rgba(255,69,58,0.1)",
            border: `1px solid ${parseFloat(percentile) >= 99
              ? "rgba(48,209,88,0.3)"
              : "rgba(255,69,58,0.3)"}`,
            borderRadius:10,
            textAlign:"center"
          }}>
            {parseFloat(percentile) >= 99.5 ? (
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#30d158"}}>IIM-A range.</div>
                <div style={{fontSize:12,color:"#6e6e73",marginTop:4}}>Interview phase begins. Vikram is ready.</div>
              </div>
            ) : parseFloat(percentile) >= 99 ? (
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#30d158"}}>IIM calls likely.</div>
                <div style={{fontSize:12,color:"#6e6e73",marginTop:4}}>Prepare for interviews. Every call counts.</div>
              </div>
            ) : parseFloat(percentile) >= 95 ? (
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#f97316"}}>Good score. Not done yet.</div>
                <div style={{fontSize:12,color:"#6e6e73",marginTop:4}}>New IIMs and top colleges are calling.</div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#ff453a"}}>Not what we planned.</div>
                <div style={{fontSize:12,color:"#6e6e73",marginTop:4}}>CAT 2027. We go again. Harder.</div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!percentile || isNaN(parseFloat(percentile))}
          style={{
            width:"100%", height:52,
            background: percentile && !isNaN(parseFloat(percentile))
              ? "#f97316" : "#2a2a2a",
            border:"none", borderRadius:11,
            color:"white", fontSize:15, fontWeight:800,
            cursor: percentile ? "pointer" : "not-allowed",
            fontFamily:"inherit", letterSpacing:"0.05em",
            textTransform:"uppercase"
          }}>
          {parseFloat(percentile) >= 99 ? "Enter Interview Phase →" : "Continue →"}
        </button>
      </div>
    </div>
  )
}

function InterviewOnboarding({ onConfirm }) {
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("2027")

  const months = ["January","February","March","April","May",
    "June","July","August","September","October","November","December"]

  const getDateString = () => {
    if (!day || !month) return ""
    const m = String(months.indexOf(month)+1).padStart(2,"0")
    const d = String(day).padStart(2,"0")
    return `${year}-${m}-${d}`
  }

  const sel = {background:"#111",border:"1px solid #2a2a2a",borderRadius:10,
    padding:"12px 8px",color:"#f5f5f7",fontSize:14,outline:"none",
    fontFamily:"inherit",appearance:"none",WebkitAppearance:"none"}

  return (
    <div style={{position:"fixed",inset:0,background:"#000",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"40px 24px",fontFamily:"inherit"}}>
      <MentorAvatar size={96}/>
      <div style={{marginTop:20,fontSize:13,color:"#f97316",
        fontWeight:700,letterSpacing:"0.1em"}}>VIKRAM ANAND</div>
      <div style={{marginTop:24,fontSize:28,fontWeight:800,
        color:"#f5f5f7",textAlign:"center",lineHeight:1.3,
        letterSpacing:"-0.03em"}}>
        CAT is done.<br/>Now we go for IIM.
      </div>
      <div style={{marginTop:12,fontSize:14,color:"#6e6e73",
        textAlign:"center",lineHeight:1.6,maxWidth:320}}>
        The interview is the final door.<br/>
        When is your IIM interview?
      </div>
      <div style={{marginTop:40,width:"100%",maxWidth:320,
        display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
            textTransform:"uppercase",marginBottom:8}}>Interview Date</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:8}}>
            <select value={day} onChange={e=>setDay(e.target.value)} style={sel}>
              <option value="">DD</option>
              {Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0"))
                .map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select value={month} onChange={e=>setMonth(e.target.value)} style={sel}>
              <option value="">Month</option>
              {months.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <select value={year} onChange={e=>setYear(e.target.value)} style={sel}>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            const d = getDateString()
            if (d) {
              localStorage.setItem("interview_date", d)
              localStorage.setItem("app_mode", "interview")
              onConfirm(d)
            }
          }}
          style={{width:"100%",height:52,
            background:day&&month?"#f97316":"#2a2a2a",
            border:"none",borderRadius:11,color:"white",
            fontSize:15,fontWeight:800,
            cursor:day&&month?"pointer":"not-allowed",
            fontFamily:"inherit",letterSpacing:"0.05em",
            textTransform:"uppercase"}}>
          Lock Interview Date →
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const fromLocalStorageRef = useRef(!!localStorage.getItem("cat_start_date"))
  const greetingFiredRef = useRef(false)
  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem("cat_start_date")
    if (!saved || saved.trim() === "" || saved === "null") {
      localStorage.removeItem("cat_start_date")
      return null
    }
    return saved
  });
  const [userName, setUserName] = useState(
    () => localStorage.getItem("cat_user_name") || null
  )
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("app_mode") || "prep"
  })
  const [interviewDate, setInterviewDate] = useState(() => {
    return localStorage.getItem("interview_date") || null
  })
  const [tab, setTab] = useState("today");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem("conquer_theme") || "dark");
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem("cat_prep_data") || "{}") } catch { return {} } });
  const [masteryProgress, setMasteryProgress] = useState(readMasteryProgress);
  const [backlogVideos, setBacklogVideos] = useState(() => {
    try {
      const old = JSON.parse(localStorage.getItem("conquer_backlog") || "[]");
      const newVideos = JSON.parse(localStorage.getItem("conquer_backlog_videos") || "null");
      return newVideos !== null ? newVideos : old;
    } catch {
      return [];
    }
  });
  const [backlogConcepts, setBacklogConcepts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("conquer_backlog_concepts") || "[]");
    } catch {
      return [];
    }
  });
  const [backlogFocusTarget, setBacklogFocusTarget] = useState(null);
  const [errorLog, setErrorLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem("conquer_error_log_v1") || "[]"); }
    catch { return []; }
  });
  const [errorLogPrefill, setErrorLogPrefill] = useState(null);
  const [pendingMapFocusJump, setPendingMapFocusJump] = useState(false);
  const [academicNotes, setAcademicNotes] = useState(() => {
    return readLocalAcademicNotes();
  });
  const [notesSyncMessage, setNotesSyncMessage] = useState("");
  const [sel, setSel] = useState(() => {
    const saved = localStorage.getItem("cat_sel_date");
    const today = todayKey();
    // Don't carry a past date into a new session; always open on today if stored date is past
    return saved && saved >= today ? saved : today;
  });
  const [mentorMessages, setMentorMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("conquer_mentor_chat_v1") || "[]"); }
    catch { return []; }
  });
  const [mentorGreeted, setMentorGreeted] = useState(
    () => localStorage.getItem("mentor_greeted_today") ===
      new Date().toISOString().split("T")[0]
  );
  const [mentorHistoryChecked, setMentorHistoryChecked] = useState(false);
  const [userInitialized, setUserInitialized] = useState(false);
  const [catResult, setCatResult] = useState(() => localStorage.getItem("cat_result") || null)
  const [catPercentile, setCatPercentile] = useState(() => localStorage.getItem("cat_percentile") || null)
  const [userId, setUserId] = useState(() => localStorage.getItem("conquer_user_id") || null)
  const userChecked = useRef(false)
  const backlogLoadedRef = useRef(false)
  const profileLoadedRef = useRef(false)
  const [synced, setSynced] = useState(false)
  const [avatarGender, setAvatarGender] = useState(() => localStorage.getItem("cat_avatar_gender") || "male")
  const [avatarSkin, setAvatarSkin] = useState(() => localStorage.getItem("cat_avatar_skin") || "medium")
  const [avatarHair, setAvatarHair] = useState(() => localStorage.getItem("cat_avatar_hair") || "wavy")
  const [avatarHairColor, setAvatarHairColor] = useState(() => localStorage.getItem("cat_avatar_hair_color") || "black")
  const [avatarShirt, setAvatarShirt] = useState(() => localStorage.getItem("cat_avatar_shirt") || "blue")
  const [avatarGlasses, setAvatarGlasses] = useState(() => localStorage.getItem("cat_avatar_glasses") === "true")
  const [avatarBeard, setAvatarBeard] = useState(() => localStorage.getItem("cat_avatar_beard") === "true")
  const [avatarMustache, setAvatarMustache] = useState(() => localStorage.getItem("cat_avatar_mustache") === "true")
  const [category, setCategory] = useState(() => localStorage.getItem("cat_category") || "General")
  const [primaryDegree, setPrimaryDegree] = useState(() => {
    try {
      return {
        type:"", field:"", college:"", gpa:"", year:"", gpaScale:"percentage",
        ...JSON.parse(localStorage.getItem("cat_primary_degree") || "{}")
      }
    }
    catch {
      return { type:"", field:"", college:"", gpa:"", year:"", gpaScale:"percentage" }
    }
  })
  const [secondaryDegrees, setSecondaryDegrees] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cat_secondary_degrees") || "[]") }
    catch { return [] }
  })
  const [workExpYears, setWorkExpYears] = useState(() => parseInt(localStorage.getItem("cat_work_years") || "0"))
  const [workExpMonths, setWorkExpMonths] = useState(() => parseInt(localStorage.getItem("cat_work_months") || "0"))
  const [workCompany, setWorkCompany] = useState(() => localStorage.getItem("cat_work_company") || "")
  const [workRole, setWorkRole] = useState(() => localStorage.getItem("cat_work_role") || "")
  const [targetPercentile, setTargetPercentile] = useState(
    () => parseFloat(localStorage.getItem("cat_target_pct") || "0") || 0
  )
  const [calcResult, setCalcResult] = useState(null)
  const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const TOPICS = ["None","Quant","VARC","LRDI"];

  const defaultTimetable = () => Object.fromEntries(
    DAYS_OF_WEEK.map(d => [d, {
      topic: "None", subtopic: "",
      appSameAsLive: true, appTopic: "None", appSubtopic: ""
    }])
  );

  const [weeklyTimetable, setWeeklyTimetable] = useState(() => {
    try {
      const saved = localStorage.getItem("conquer_timetable");
      return saved ? { ...defaultTimetable(), ...JSON.parse(saved) } : defaultTimetable();
    } catch { return defaultTimetable(); }
  });
  const userInitials = userName
    ? userName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "ME"
  const _today = new Date()
  _today.setHours(0, 0, 0, 0)
  const dl = getDaysLeft()
  const totalDays = useMemo(() => {
    if (!startDate) return 200;
    const start = new Date(startDate + "T00:00:00");
    start.setHours(0, 0, 0, 0);
    const exam = new Date(EXAM_DATE);
    exam.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exam - start) / 86400000);
    return Math.max(1, diff);
  }, [startDate]);
  const _start = startDate ? new Date(startDate + "T00:00:00") : _today
  _start.setHours(0, 0, 0, 0)
  const dn = Math.max(1, Math.floor((_today - _start) / 86400000) + 1)
  const START = _start
  const totals = useMemo(() => Object.values(data).reduce(
    (a, d) => ({quant:a.quant+(+d.q||0), varc:a.varc+(+d.v||0), lrdi:a.lrdi+(+d.l||0)}),
    {quant:0, varc:0, lrdi:0}
  ), [data]);
  const todayData = data[todayKey()] || defaultDay();
  const handleAvatarChange = (key, value) => {
    const setters = {
      gender: setAvatarGender,
      skin: setAvatarSkin,
      hair: setAvatarHair,
      hairColor: setAvatarHairColor,
      shirt: setAvatarShirt,
      glasses: setAvatarGlasses,
      beard: setAvatarBeard,
      mustache: setAvatarMustache,
    };
    setters[key]?.(value);
    if (!userId || !profileLoadedRef.current) return;
    const nextAvatar = {
      avatar_gender: key === "gender" ? value : avatarGender,
      avatar_skin: key === "skin" ? value : avatarSkin,
      avatar_hair: key === "hair" ? value : avatarHair,
      avatar_hair_color: key === "hairColor" ? value : avatarHairColor,
      avatar_shirt: key === "shirt" ? value : avatarShirt,
      avatar_glasses: key === "glasses" ? value : avatarGlasses,
      avatar_beard: key === "beard" ? value : avatarBeard,
      avatar_mustache: key === "mustache" ? value : avatarMustache,
    };
    fetch("/api/user/update", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ userId, ...nextAvatar })
    }).catch(err => console.error("Avatar sync failed:", err.message));
  };

  useEffect(() => { localStorage.setItem("cat_prep_data", JSON.stringify(data)) }, [data]);
  useEffect(() => {
    localStorage.setItem(MASTERY_PROGRESS_STORAGE_KEY, JSON.stringify(masteryProgress));
  }, [masteryProgress]);
  useEffect(() => {
    const theme = appTheme === "light" ? "light" : "dark";
    localStorage.setItem("conquer_theme", theme);
    document.documentElement.style.colorScheme = theme;
    // Fix light mode: ensure body/html background matches theme (removes black strip on mobile)
    const bg = theme === "light" ? "#f7f4ee" : "#000";
    document.body.style.background = bg;
    document.documentElement.style.background = bg;
    // Update browser/PWA chrome color (status bar on mobile)
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", bg);
  }, [appTheme]);
  useEffect(() => { localStorage.setItem("cat_avatar_gender", avatarGender) }, [avatarGender]);
  useEffect(() => { localStorage.setItem("cat_avatar_skin", avatarSkin) }, [avatarSkin]);
  useEffect(() => { localStorage.setItem("cat_avatar_hair", avatarHair) }, [avatarHair]);
  useEffect(() => { localStorage.setItem("cat_avatar_hair_color", avatarHairColor) }, [avatarHairColor]);
  useEffect(() => { localStorage.setItem("cat_avatar_shirt", avatarShirt) }, [avatarShirt]);
  useEffect(() => { localStorage.setItem("cat_avatar_glasses", String(avatarGlasses)) }, [avatarGlasses]);
  useEffect(() => { localStorage.setItem("cat_avatar_beard", String(avatarBeard)) }, [avatarBeard]);
  useEffect(() => { localStorage.setItem("cat_avatar_mustache", String(avatarMustache)) }, [avatarMustache]);
  useEffect(() => { localStorage.setItem("cat_category", category) }, [category]);
  useEffect(() => { localStorage.setItem("cat_primary_degree", JSON.stringify(primaryDegree)) }, [primaryDegree]);
  useEffect(() => { localStorage.setItem("cat_secondary_degrees", JSON.stringify(secondaryDegrees)) }, [secondaryDegrees]);
  useEffect(() => { localStorage.setItem("cat_work_years", String(workExpYears)) }, [workExpYears]);
  useEffect(() => { localStorage.setItem("cat_work_months", String(workExpMonths)) }, [workExpMonths]);
  useEffect(() => { localStorage.setItem("cat_work_company", workCompany) }, [workCompany]);
  useEffect(() => { localStorage.setItem("cat_work_role", workRole) }, [workRole]);
  useEffect(() => {
    localStorage.setItem("cat_target_pct", String(targetPercentile));
  }, [targetPercentile]);
  useEffect(() => {
    setCalcResult(calcIIMProfile({
      category,
      gender: avatarGender,
      primaryDegree,
      secondaryDegrees,
      workExpYears,
      workExpMonths,
    }));
  }, [
    category,
    avatarGender,
    primaryDegree,
    secondaryDegrees,
    workExpYears,
    workExpMonths,
  ]);
  useEffect(() => {
    if (!userId) return;
    if (!profileLoadedRef.current) return;
    const timer = setTimeout(() => {
      const minPercentile = calcMinPercentile(category);
      fetch("/api/user/update", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          userId,
          avatar_gender: avatarGender,
          avatar_skin: avatarSkin,
          avatar_hair: avatarHair,
          avatar_hair_color: avatarHairColor,
          avatar_shirt: avatarShirt,
          avatar_glasses: avatarGlasses,
          avatar_beard: avatarBeard,
          avatar_mustache: avatarMustache,
          category,
          primary_degree: primaryDegree,
          secondary_degrees: secondaryDegrees,
          work_experience_years: workExpYears,
          work_experience_months: workExpMonths,
          work_company: workCompany,
          work_role: workRole,
          min_percentile: minPercentile,
          target_percentile: targetPercentile || 0,
        })
      }).catch(console.error);
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    avatarGender, avatarSkin, avatarHair, avatarHairColor,
    avatarShirt, avatarGlasses, avatarBeard, avatarMustache,
    category, primaryDegree, secondaryDegrees,
    workExpYears, workExpMonths, workCompany, workRole, userId,
    targetPercentile,
  ]);
  useEffect(() => {
    localStorage.setItem("conquer_error_log_v1", JSON.stringify(errorLog));
  }, [errorLog]);
  useEffect(() => {
    localStorage.setItem("conquer_mentor_chat_v1", JSON.stringify(mentorMessages));
  }, [mentorMessages]);
  useEffect(() => {
    localStorage.setItem("conquer_backlog_videos", JSON.stringify(backlogVideos));
    localStorage.setItem("conquer_backlog_concepts", JSON.stringify(backlogConcepts));
    if (!backlogLoadedRef.current) return;
    if (!userId) return;
    fetch("/api/user/update", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        userId,
        backlog_videos: backlogVideos,
        backlog_concepts: backlogConcepts
      })
    }).catch(err => console.error("Backlog sync failed:", err.message));
  }, [backlogVideos, backlogConcepts, userId]);
  useEffect(() => {
    localStorage.setItem("conquer_academic_notes", JSON.stringify(academicNotes));
  }, [academicNotes]);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const loadAcademicNotes = async () => {
      try {
        const res = await fetch(`/api/academic-notes/${encodeURIComponent(userId)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Notes sync failed");
        if (data.syncAvailable === false) throw new Error("Notes sync unavailable");

        let backendNotes = Array.isArray(data.notes)
          ? data.notes.map(normalizeAcademicNote)
          : [];
        const migrationKey = `conquer_academic_notes_migrated_${userId}`;
        const oldLocalNotes = readLocalAcademicNotes();

        if (
          backendNotes.length === 0 &&
          oldLocalNotes.length > 0 &&
          !localStorage.getItem(migrationKey) &&
          data.syncAvailable !== false
        ) {
          for (const note of oldLocalNotes) {
            const noteText = getNoteText(note).trim();
            if (!noteText) continue;
            const migrateRes = await fetch("/api/academic-notes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, noteText })
            });
            if (!migrateRes.ok) {
              const migrateData = await migrateRes.json().catch(() => ({}));
              throw new Error(migrateData.error || "Notes migration failed");
            }
          }
          localStorage.setItem(migrationKey, "1");

          const refreshed = await fetch(`/api/academic-notes/${encodeURIComponent(userId)}`);
          const refreshedData = await refreshed.json().catch(() => ({}));
          if (!refreshed.ok) throw new Error(refreshedData.error || "Notes reload failed");
          backendNotes = Array.isArray(refreshedData.notes)
            ? refreshedData.notes.map(normalizeAcademicNote)
            : [];
        }

        if (!cancelled) {
          setAcademicNotes(backendNotes);
          setNotesSyncMessage(data.syncAvailable === false
            ? "Notes are shown from local storage because sync failed."
            : ""
          );
        }
      } catch (err) {
        console.error("Academic notes sync failed:", err?.message || err);
        if (!cancelled) {
          setAcademicNotes(readLocalAcademicNotes());
          setNotesSyncMessage("Notes are shown from local storage because sync failed.");
        }
      }
    };

    loadAcademicNotes();
    return () => { cancelled = true; };
  }, [userId]);
  useEffect(() => {
    localStorage.setItem("conquer_timetable", JSON.stringify(weeklyTimetable));
  }, [weeklyTimetable]);
  useEffect(() => { localStorage.setItem("cat_sel_date", sel) }, [sel]);
  useEffect(() => {
    if (!userId && startDate) {
      localStorage.removeItem("conquer_user_id");
      localStorage.removeItem("cat_start_date");
      localStorage.removeItem("cat_user_name");
      localStorage.removeItem("mentor_greeted_today");
      localStorage.removeItem("cat_result");
      localStorage.removeItem("cat_percentile");
      localStorage.removeItem("app_mode");
      localStorage.removeItem("interview_date");
      setStartDate(null);
      setUserName(null);
    }
  }, []);
  useEffect(() => {
    if (!userId || !startDate || userChecked.current) return;
    if (!fromLocalStorageRef.current && !userInitialized) return;
    userChecked.current = true;
    const verifyAndLoad = async () => {
      try {
        const checkRes = await fetch("/api/user/check", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ userId })
        });
        const checkData = checkRes.ok ? await checkRes.json() : null;
        if (checkData?.exists === false) {
          localStorage.removeItem("conquer_user_id");
          localStorage.removeItem("cat_start_date");
          localStorage.removeItem("cat_user_name");
          localStorage.removeItem("mentor_greeted_today");
          localStorage.removeItem("cat_result");
          localStorage.removeItem("cat_percentile");
          localStorage.removeItem("app_mode");
          localStorage.removeItem("interview_date");
          setStartDate(null);
          setUserName(null);
          return;
        }
        if (checkData?.exists && checkData.user) {
          if (Array.isArray(checkData.user.backlog_videos)) {
            setBacklogVideos(checkData.user.backlog_videos);
            localStorage.setItem("conquer_backlog_videos", JSON.stringify(checkData.user.backlog_videos));
          }
          if (Array.isArray(checkData.user.backlog_concepts)) {
            setBacklogConcepts(checkData.user.backlog_concepts);
            localStorage.setItem("conquer_backlog_concepts", JSON.stringify(checkData.user.backlog_concepts));
          }
          backlogLoadedRef.current = true;
          if (checkData.user.avatar_gender) localStorage.setItem("cat_avatar_gender", checkData.user.avatar_gender);
          if (checkData.user.avatar_skin) localStorage.setItem("cat_avatar_skin", checkData.user.avatar_skin);
          if (checkData.user.avatar_hair) localStorage.setItem("cat_avatar_hair", checkData.user.avatar_hair);
          if (checkData.user.avatar_hair_color) localStorage.setItem("cat_avatar_hair_color", checkData.user.avatar_hair_color);
          if (checkData.user.avatar_shirt) localStorage.setItem("cat_avatar_shirt", checkData.user.avatar_shirt);
          if (checkData.user.avatar_glasses != null) localStorage.setItem("cat_avatar_glasses", String(checkData.user.avatar_glasses));
          if (checkData.user.avatar_beard != null) localStorage.setItem("cat_avatar_beard", String(checkData.user.avatar_beard));
          if (checkData.user.avatar_mustache != null) localStorage.setItem("cat_avatar_mustache", String(checkData.user.avatar_mustache));
          setAvatarGender(localStorage.getItem("cat_avatar_gender") || "male");
          setAvatarSkin(localStorage.getItem("cat_avatar_skin") || "medium");
          setAvatarHair(localStorage.getItem("cat_avatar_hair") || "wavy");
          setAvatarHairColor(localStorage.getItem("cat_avatar_hair_color") || "black");
          setAvatarShirt(localStorage.getItem("cat_avatar_shirt") || "blue");
          setAvatarGlasses(localStorage.getItem("cat_avatar_glasses") === "true");
          setAvatarBeard(localStorage.getItem("cat_avatar_beard") === "true");
          setAvatarMustache(localStorage.getItem("cat_avatar_mustache") === "true");
          if (checkData.user.category) setCategory(checkData.user.category);
          if (checkData.user.primary_degree) setPrimaryDegree(checkData.user.primary_degree);
          if (checkData.user.secondary_degrees) setSecondaryDegrees(checkData.user.secondary_degrees);
          if (checkData.user.work_experience_years != null) setWorkExpYears(checkData.user.work_experience_years);
          if (checkData.user.work_experience_months != null) setWorkExpMonths(checkData.user.work_experience_months);
          if (checkData.user.work_company) setWorkCompany(checkData.user.work_company);
          if (checkData.user.work_role) setWorkRole(checkData.user.work_role);
          if (checkData.user.target_percentile != null && checkData.user.target_percentile > 0) {
            setTargetPercentile(checkData.user.target_percentile);
            localStorage.setItem("cat_target_pct", String(checkData.user.target_percentile));
          }
          if (checkData.user.weekly_timetable) {
            setWeeklyTimetable({ ...defaultTimetable(), ...checkData.user.weekly_timetable });
            localStorage.setItem("conquer_timetable", JSON.stringify(checkData.user.weekly_timetable));
          }
          profileLoadedRef.current = true;
        }
      } catch {}

      fetch(`/api/log/all/${userId}`)
        .then(r => r.ok ? r.json() : null)
        .then(logs => { if (logs) setData(prev => ({ ...prev, ...logs })); setSynced(true); })
        .catch(() => setSynced(true));
    };
    verifyAndLoad();
  }, [userId, startDate, userInitialized]);
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState === 'visible' && userId) {
        fetch(`/api/log/all/${userId}`)
          .then(r => r.ok ? r.json() : null)
          .then(logs => {
            if (logs) setData(prev => ({ ...prev, ...logs }));
          })
          .catch(() => {});
        try {
          const res = await fetch("/api/user/check", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ userId })
          });
          const data = res.ok ? await res.json() : null;
          if (Array.isArray(data?.user?.backlog_videos)) {
            setBacklogVideos(data.user.backlog_videos);
            localStorage.setItem("conquer_backlog_videos", JSON.stringify(data.user.backlog_videos));
          }
          if (Array.isArray(data?.user?.backlog_concepts)) {
            setBacklogConcepts(data.user.backlog_concepts);
            localStorage.setItem("conquer_backlog_concepts", JSON.stringify(data.user.backlog_concepts));
          }
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [userId]);
  useEffect(() => {
    if (!userId || !startDate) return;
    setMentorHistoryChecked(false);
    fetch(`/api/chat/history/${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const messages = Array.isArray(data?.messages) ? data.messages : [];
        if (messages.length === 0) {
          localStorage.removeItem("mentor_greeted_today");
          setMentorGreeted(false);
          return;
        }
        setMentorMessages(messages);
        const today = new Date().toISOString().split("T")[0];
        localStorage.setItem("mentor_greeted_today", today);
        setMentorGreeted(true);
      })
      .catch(err => console.warn("Mentor history load failed:", err))
      .finally(() => setMentorHistoryChecked(true));
  }, [userId, startDate]);
  const getClassForDate = (dateKey) => {
    const dayName = new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long"
    });
    return weeklyTimetable[dayName] || { topic: "None", subtopic: "", appSameAsLive: true, appTopic: "None", appSubtopic: "" };
  };

  const todayClass = getClassForDate(sel);
  const todayLiveLabel = todayClass.topic !== "None"
    ? `${todayClass.topic}${todayClass.subtopic ? ` — ${todayClass.subtopic}` : ""} · 7PM - 9PM`
    : "No live class scheduled";
  const todayAppTopic = todayClass.appSameAsLive ? todayClass.topic : todayClass.appTopic;
  const todayAppSubtopic = todayClass.appSameAsLive ? todayClass.subtopic : todayClass.appSubtopic;
  const todayAppLabel = todayAppTopic !== "None"
    ? `${todayAppTopic}${todayAppSubtopic ? ` — ${todayAppSubtopic}` : ""} · 10PM - 12AM`
    : "No application class scheduled";

  const isSundayIST = new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata", weekday: "short"
  }) === "Sun";
  const isMondayIST = new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata", weekday: "short"
  }) === "Mon";
  const currentHourIST = parseInt(new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata", hour: "numeric", hour12: false
  }));
  const isAssessmentWindow = currentHourIST >= 20 && currentHourIST < 24;
  useEffect(() => {
    if (!startDate || !userId) return;
    const reminderKey = `conquer_reminder_${new Date().toISOString().split("T")[0]}`;
    if (localStorage.getItem(reminderKey)) return;
    let reminder = null;
    if (isMondayIST) {
      reminder = "[REMINDER] It is Monday. Please update your weekly timetable for this week — go to Timetable in the Today page.";
    } else if (isAssessmentWindow && !isSundayIST) {
      reminder = "[REMINDER] It is assessment window (8PM-12AM). Have you done your daily assessment today?";
    } else if (isAssessmentWindow && isSundayIST) {
      reminder = "[REMINDER] Sunday assessment window. Have you completed your weekly assessment?";
    }
    if (reminder) {
      localStorage.setItem(reminderKey, "1");
      setMentorMessages(p => [...p, { r:"user", t: reminder }]);
    }
  }, [startDate, userId, isMondayIST, isAssessmentWindow, isSundayIST]);
  useEffect(() => {
    if (!startDate || !mentorHistoryChecked || mentorGreeted) return;
    if (greetingFiredRef.current) return;
    greetingFiredRef.current = true;
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("mentor_greeted_today", today);
    setMentorGreeted(true);
    const greet = async () => {
      try {
        const res = await fetch("/api/mentor/greet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daysLeft: dl, totals, dayNum: dn, todayData, mode, userName: userName || "", startDate: startDate || "", interviewDate: interviewDate || "", catResult: catResult || "", catPercentile: catPercentile || "" })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(getApiErrorMessage(data, `Server error: ${res.status}`));
        setMentorMessages(p => [...p, {r:"ai", t:getMentorReply(data)}]);
      } catch (err) {
        setMentorMessages(p => [...p, {r:"ai", t:err.message || "Ready when you are. Show up today."}]);
      }
    };
    greet();
  }, [startDate, mentorHistoryChecked, mentorGreeted, dl, totals, dn, todayData]);

  if (!startDate) return <OnboardingScreen onStart={async (date, name, userId, onboardingProfile = {}) => {
    localStorage.setItem("cat_start_date", date)
    localStorage.setItem("cat_user_name", name)
    localStorage.setItem("conquer_user_id", userId)
    if (onboardingProfile.category) {
      localStorage.setItem("cat_category", onboardingProfile.category)
      setCategory(onboardingProfile.category)
    }
    if (onboardingProfile.primaryDegree) {
      localStorage.setItem("cat_primary_degree", JSON.stringify(onboardingProfile.primaryDegree))
      setPrimaryDegree(onboardingProfile.primaryDegree)
    }
    fromLocalStorageRef.current = false
    setUserInitialized(false)
    setUserId(userId)
    setStartDate(date)
    setUserName(name)
    setAvatarGender(localStorage.getItem("cat_avatar_gender") || "male")
    setAvatarSkin(localStorage.getItem("cat_avatar_skin") || "medium")
    setAvatarHair(localStorage.getItem("cat_avatar_hair") || "wavy")
    setAvatarHairColor(localStorage.getItem("cat_avatar_hair_color") || "black")
    setAvatarShirt(localStorage.getItem("cat_avatar_shirt") || "blue")
    setAvatarGlasses(localStorage.getItem("cat_avatar_glasses") === "true")
    setAvatarBeard(localStorage.getItem("cat_avatar_beard") === "true")
    setAvatarMustache(localStorage.getItem("cat_avatar_mustache") === "true")
    try {
      const res = await fetch("/api/user/init", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          userId,
          name,
          startDate: date,
          avatarGender: localStorage.getItem("cat_avatar_gender") || "male",
          avatarSkin: localStorage.getItem("cat_avatar_skin") || "medium",
          avatarHair: localStorage.getItem("cat_avatar_hair") || "wavy",
          avatarHairColor: localStorage.getItem("cat_avatar_hair_color") || "black",
          avatarShirt: localStorage.getItem("cat_avatar_shirt") || "blue",
          avatarGlasses: localStorage.getItem("cat_avatar_glasses") === "true",
          avatarBeard: localStorage.getItem("cat_avatar_beard") === "true",
          avatarMustache: localStorage.getItem("cat_avatar_mustache") === "true"
        })
      })
      if (res.ok) {
        if (onboardingProfile.category || onboardingProfile.primaryDegree) {
          fetch("/api/user/update", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              userId,
              category: onboardingProfile.category || "General",
              primary_degree: onboardingProfile.primaryDegree || {}
            })
          }).catch(err => console.error("Onboarding profile sync failed:", err))
        }
        profileLoadedRef.current = true
        setUserInitialized(true)
      }
    } catch (err) {
      console.error("User init failed:", err)
    }
  }} />

  const examPassed = new Date() > new Date("2026-11-29T00:00:00")
  const resultsPending = examPassed && !catResult

  if (resultsPending) return (
    <ResultsScreen onConfirm={(success, percentile) => {
      setCatResult(success ? "cracked" : "missed")
      setCatPercentile(percentile)
      if (success) setMode("interview")
    }}/>
  )

  if (examPassed && catResult === "cracked" && mode === "prep") return (
    <InterviewOnboarding onConfirm={(d) => {
      setInterviewDate(d)
      setMode("interview")
      localStorage.setItem("interview_date", d)
      localStorage.setItem("app_mode", "interview")
    }}/>
  )

  const upd = (date, f, v) => setData(p => ({...p, [date]: {...(p[date]||defaultDay()), [f]:v}}));

  const addMissedLiveClassToBacklog = (classEntry, dateKey = todayKey()) => {
    if (!classEntry || classEntry.topic === "None") return "";
    const subtopic = classEntry.subtopic?.trim();
    const text = subtopic ? `${classEntry.topic}: ${subtopic}` : classEntry.topic;
    const exists = backlogVideos.some(item =>
      String(item.text || item).trim().toLowerCase() === text.toLowerCase()
    );
    if (exists) return "";
    setBacklogVideos(prev => {
      const alreadyAdded = prev.some(item =>
        String(item.text || item).trim().toLowerCase() === text.toLowerCase()
      );
      if (alreadyAdded) return prev;
      return [...prev, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text,
        checked: false,
        addedDate: dateKey,
        checkedDate: null
      }];
    });
    return text;
  };

  const sendToVikram = async (autoMessage) => {
    if (!userId || !autoMessage?.trim()) return;
    setMentorMessages(p => [...p, { r: "user", t: autoMessage, auto: true }]);
    setMentorMessages(p => [...p, { r: "ai", t: "...", loading: true }]);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: autoMessage,
          daysLeft: dl,
          totals,
          dayNum: dn,
          todayData: data[todayKey()] || defaultDay(),
          mode,
          userName: userName || "",
          startDate: startDate || "",
          interviewDate: interviewDate || "",
          catResult: catResult || "",
          catPercentile: catPercentile || "",
          targetPercentile: targetPercentile || 0,
          profile: {
            category,
            gender: avatarGender,
            primaryDegree,
            secondaryDegrees,
            workExpYears,
            workExpMonths,
            workCompany,
            workRole,
            profileScore: calcResult?.profileScore,
            hasMasters: calcResult?.hasMasters,
            adjustedCutoffs: calcResult?.adjustedCutoffs,
            targetPercentile: targetPercentile || 0,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const json = await res.json().catch(() => ({}));
      const reply = json?.reply || json?.message || "I see it. Keep going.";
      setMentorMessages(p => [...p.filter(m => !m.loading), { r: "ai", t: reply }]);
    } catch (err) {
      setMentorMessages(p => [...p.filter(m => !m.loading), {
        r: "ai",
        t: err?.name === "AbortError"
          ? "Render is waking up. Check back in a moment."
          : "I see it. Keep going."
      }]);
    }
  };

  const saveSelectedDay = async () => {
    const dayData = data[sel] || defaultDay();
    try {
      await fetch("/api/log/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date: sel, dayData })
      });
    } catch (err) {
      console.error("Log save failed:", err.message);
    }

    const v2 = calculateEffortScoreV2({ dayData, masteryProgress, date: sel });
    const score = v2.total;
    upd(sel, "effortScore", v2.total);
    upd(sel, "effortBreakdownV2", v2.breakdown);
    const totalMins =
      ((dayData.lc || dayData.lc_na) ? 120 : 0) +
      ((dayData.as || dayData.as_na) ? 40 : 0) +
      ((dayData.ap || dayData.ap_na) ? 120 : 0) +
      ((dayData.vp || dayData.vp_na) ? 20 : 0) +
      ((+dayData.ph || 0) * 60) + (+dayData.pm || 0);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    const scheduledLiveClass = todayClass.topic !== "None";
    const missedLiveClass = scheduledLiveClass && !dayData.lc && !dayData.lc_na;
    const backlogAdded = missedLiveClass ? addMissedLiveClassToBacklog(todayClass, sel) : "";
    const selDayNum = Math.max(1, Math.floor((new Date(sel + "T00:00:00") - START) / 86400000) + 1);

    const autoMsg = [
      `Day ${selDayNum} saved. Effort score: ${score}/100.`,
      `Quant: ${dayData.q || 0}/10 | VARC: ${dayData.v || 0}/5 | LRDI: ${dayData.l || 0}/5 | Para: ${dayData.vp_count || 0}/1.`,
      `Total study time: ${timeStr}.`,
      isApplicationWindow(sel) ? `CAT application: ${dayData.ca ? "submitted" : "pending"}.` : "",
      dayData.sk ? `Sudoku: solved ${dayData.skd || "medium"} in ${dayData.skm || 0}m ${dayData.sks || 0}s.` : "",
      dayData.vm ? `Vedic Math: ${dayData.vmt?.trim() || "topic not specified"}.` : "",
      missedLiveClass ? `Missed scheduled live class: ${todayLiveLabel}.` : "",
      backlogAdded ? `Moved to video backlog: ${backlogAdded}.` : "",
      dayData.iq?.trim() ? `iQuanta notes: ${dayData.iq.trim()}` : "",
      dayData.n?.trim() ? `Journal: ${dayData.n.trim()}` : "",
    ].filter(Boolean).join(" ");

    await sendToVikram(autoMsg);
  };

  const saveAcademicNote = async ({ id, noteText }) => {
    if (!userId) throw new Error("Missing user ID");
    const text = noteText?.trim();
    if (!text) throw new Error("Note text is required");

    const res = await fetch(id ? `/api/academic-notes/${encodeURIComponent(id)}` : "/api/academic-notes", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, noteText: text })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.note) throw new Error(data.error || "Could not sync note");

    const savedNote = normalizeAcademicNote(data.note);
    setAcademicNotes(prev => {
      const exists = prev.some(note => note.id === savedNote.id);
      const next = exists
        ? prev.map(note => note.id === savedNote.id ? savedNote : note)
        : [savedNote, ...prev];
      return next.sort((a, b) => new Date(getNoteUpdatedAt(b)) - new Date(getNoteUpdatedAt(a)));
    });
    setNotesSyncMessage("");
  };

  const deleteAcademicNote = async (noteId) => {
    if (!userId) throw new Error("Missing user ID");
    if (!noteId) throw new Error("Missing note ID");

    const res = await fetch(`/api/academic-notes/${encodeURIComponent(noteId)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not delete note");

    setAcademicNotes(prev => prev.filter(note => note.id !== noteId));
    setNotesSyncMessage("");
  };

  const nav = [
    {id:"today",lbl:"Today"},
    {id:"mastery",lbl:"Mastery Map"},
    {id:"progress",lbl:"Progress"},
    {id:"calendar",lbl:"Calendar"},
    {id:"chat",lbl:"Mentor"}
  ];
  const mobileTabs = [
    {id:"today",    lbl:"Today"},
    {id:"mastery",  lbl:"Map"},
    {id:"progress", lbl:"Progress"},
    {id:"calendar", lbl:"Calendar"},
    {id:"chat",     lbl:"Mentor"},
    {id:"profile",  lbl:"Profile"},
  ];
  const mobileActiveIdx = mobileTabs.findIndex(t => t.id === tab);

  return (
    <div className={`app theme-${appTheme === "light" ? "light" : "dark"}`}>
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div className="mobile-brand">
          <div className="mobile-title">CONQUER CAT</div>
          <div className="mobile-sub">{mode === "interview" ? "IIM INTERVIEW" : "CAT 2026 · 99.9%ile"}</div>
        </div>
        <button
          type="button"
          className={`mobile-theme-btn${appTheme === "light" ? " light" : ""}`}
          onClick={() => setAppTheme(appTheme === "light" ? "dark" : "light")}
          aria-label={`Switch to ${appTheme === "light" ? "dark" : "light"} mode`}
        >
          {appTheme === "light"
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </header>

      <button
        className={`mobile-drawer-backdrop${mobileMenuOpen ? " open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-label="Close navigation menu"
      />

      <aside className={`mobile-drawer${mobileMenuOpen ? " open" : ""}`}>
        <div className="mobile-drawer-head">
          <div>
            <div className="s-title">CONQUER CAT</div>
            <div className="s-sub">{mode === "interview" ? "IIM INTERVIEW" : "CAT 2026 · 99.9%ile"}</div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav className="s-nav mobile-drawer-nav" style={{flex:1}}>
          {nav.map(n => (
            <button
              key={n.id}
              className={`nav-item${tab===n.id?" active":""}`}
              onClick={() => {
                setTab(n.id)
                setMobileMenuOpen(false)
              }}
            >
              <NavIcon id={n.id} />
              <span>{n.lbl}</span>
            </button>
          ))}
        </nav>
        <button
          onClick={() => { setTab("profile"); setMobileMenuOpen(false); }}
          style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"12px 16px", background:"transparent",
            border:"none", borderTop:"1px solid var(--b1)",
            cursor:"pointer", width:"100%", fontFamily:"inherit"
          }}
        >
          <AvatarPreview size={32} gender={avatarGender}
            skinTone={avatarSkin} hairStyle={avatarHair}
            hairColor={avatarHairColor} shirtColor={avatarShirt}
            hasGlasses={avatarGlasses} hasBeard={avatarBeard}
            hasMustache={avatarMustache}
          />
          <div style={{flex:1,textAlign:"left"}}>
            <div style={{fontSize:14,fontWeight:600,
              color:"var(--tp)"}}>{userName}</div>
            <div style={{fontSize:11,color:"var(--tt)"}}>
              Profile & IIM Calculator
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="var(--tt)" strokeWidth="2"
            strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div className="mobile-started">
          <button
            onClick={() => {
              localStorage.removeItem("cat_start_date")
              window.location.reload()
            }}
            className="mobile-reset-btn"
          >
            reset start date
          </button>
        </div>
      </aside>

      <aside className="sidebar">
        <div className="s-logo">
          <div className="s-title">CONQUER CAT</div>
          <div className="s-sub">{mode === "interview" ? "IIM INTERVIEW" : "CAT 2026 · 99.9%ile"}</div>
        </div>
        <button
          onClick={() => setTab("profile")}
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 14px", background:"transparent",
            border:"none", cursor:"pointer", width:"100%",
            fontFamily:"inherit",
            borderBottom:"1px solid var(--b1)",
            marginBottom:8
          }}
        >
          <AvatarPreview size={28}
            gender={avatarGender} skinTone={avatarSkin}
            hairStyle={avatarHair} hairColor={avatarHairColor}
            shirtColor={avatarShirt} hasGlasses={avatarGlasses}
            hasBeard={avatarBeard} hasMustache={avatarMustache}
          />
          <div style={{flex:1,textAlign:"left"}}>
            <div style={{fontSize:12,fontWeight:600,
              color:"var(--tp)"}}>{userName}</div>
            <div style={{fontSize:10,color:"var(--tt)"}}>
              View profile →
            </div>
          </div>
        </button>
        <nav className="s-nav">
          {nav.map(n => (
            <button key={n.id} className={`nav-item${tab===n.id?" active":""}`} onClick={() => setTab(n.id)}>
              <NavIcon id={n.id} />
              <span>{n.lbl}</span>
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("cat_start_date")
            window.location.reload()
          }}
          style={{
            background:"transparent", border:"none",
            color:"var(--tt)", fontSize:10, cursor:"pointer",
            padding:"8px 14px", fontFamily:"inherit",
            textAlign:"left", width:"100%",
            marginTop:"auto"
          }}
        >
          reset start date
        </button>
      </aside>

      <main className={`main${tab==="chat" ? " mentor-main" : ""}`}>
        {tab==="today" && <TodayPage date={sel} d={data[sel]||defaultDay()} upd={(f,v)=>upd(sel,f,v)} dl={dl} start={START} totalDays={totalDays} mode={mode} setTab={setTab} backlogVideos={backlogVideos} backlogConcepts={backlogConcepts} notes={academicNotes} data={data} totals={totals} userName={userName} userInitials={userInitials} theme={appTheme} avatarGender={avatarGender} avatarSkin={avatarSkin} avatarHair={avatarHair} avatarHairColor={avatarHairColor} avatarShirt={avatarShirt} avatarGlasses={avatarGlasses} avatarBeard={avatarBeard} avatarMustache={avatarMustache} todayLiveLabel={todayLiveLabel} todayAppLabel={todayAppLabel} isSundayIST={isSundayIST} masteryProgress={masteryProgress} errorLog={errorLog} onOpenErrorLog={(prefill) => { setErrorLogPrefill(prefill); setTab("error-log"); }} onOpenWatchingBacklog={(target) => {
          setBacklogFocusTarget(target);
          setTab("backlog");
        }} onShowFocusInMap={() => { setTab("mastery"); setPendingMapFocusJump(true); }} onSave={saveSelectedDay} />}
        {tab === "backlog" && (
          <BacklogPage
            videos={backlogVideos}
            setVideos={setBacklogVideos}
            concepts={backlogConcepts}
            setConcepts={setBacklogConcepts}
            onBack={() => setTab("today")}
            focusTarget={backlogFocusTarget}
            onFocusConsumed={() => setBacklogFocusTarget(null)}
          />
        )}
        {tab === "notes" && (
          <NotesPage
            notes={academicNotes}
            userId={userId}
            syncMessage={notesSyncMessage}
            onSaveNote={saveAcademicNote}
            onDeleteNote={deleteAcademicNote}
            onBack={() => setTab("today")}
          />
        )}
        {tab === "timetable" && (
          <TimetablePage
            timetable={weeklyTimetable}
            setTimetable={setWeeklyTimetable}
            onBack={() => setTab("today")}
            userId={userId}
            DAYS_OF_WEEK={DAYS_OF_WEEK}
            TOPICS={TOPICS}
            onSaveToChat={(tt) => {
              const lines = DAYS_OF_WEEK.map(day => {
                const e = tt[day];
                const live = e.topic !== "None"
                  ? `${e.topic}${e.subtopic ? ` (${e.subtopic})` : ""} · 7PM - 9PM`
                  : "No class";
                const appTop = e.appSameAsLive ? e.topic : e.appTopic;
                const appSub = e.appSameAsLive ? e.subtopic : e.appSubtopic;
                const app = appTop !== "None"
                  ? `${appTop}${appSub ? ` (${appSub})` : ""} · 10PM - 12AM`
                  : "No class";
                return `${day}: Live — ${live} | App — ${app}`;
              }).join("\n");
              const autoMsg = `Timetable updated for this week:\n${lines}`;
              sendToVikram(autoMsg);
            }}
          />
        )}

        {tab === "assessment" && (
          <AssessmentPage
            userId={userId}
            onBack={() => setTab("today")}
            setMentorMessages={setMentorMessages}
            isSunday={isSundayIST}
            onAutoSend={sendToVikram}
          />
        )}
        {tab==="vitals" && (
          <VitalsPage
            d={data[sel] || defaultDay()}
            upd={(f,v)=>upd(sel,f,v)}
            date={sel}
            onBack={() => setTab("today")}
            onSave={saveSelectedDay}
          />
        )}
        {tab==="daily-work" && (
          <DailyWorkPage
            d={data[sel] || defaultDay()}
            upd={(f,v) => upd(sel,f,v)}
            mode={mode}
            onBack={() => setTab("today")}
          />
        )}
        {tab==="iquanta" && (
          <IQuantaHubPage
            backlogVideos={backlogVideos}
            backlogConcepts={backlogConcepts}
            onOpenWatchingBacklog={(target) => {
              setBacklogFocusTarget(target);
              setTab("backlog");
            }}
            notes={academicNotes}
            d={data[sel] || defaultDay()}
            todayLiveLabel={todayLiveLabel}
            todayAppLabel={todayAppLabel}
            isSundayIST={isSundayIST}
            setTab={setTab}
            onBack={() => setTab("today")}
          />
        )}
        {tab==="iquanta-log" && (
          <IQuantaLogPage
            d={data[sel] || defaultDay()}
            upd={(f,v) => upd(sel,f,v)}
            todayLiveLabel={todayLiveLabel}
            todayAppLabel={todayAppLabel}
            onBack={() => setTab("iquanta")}
          />
        )}
        {tab==="error-log" && (
          <ErrorLogPage
            entries={errorLog}
            prefill={errorLogPrefill}
            onBack={() => { setErrorLogPrefill(null); setTab("today"); }}
            onAdd={entry => setErrorLog(prev => [...prev, entry])}
            onUpdate={entry => setErrorLog(prev => prev.map(e => e.id === entry.id ? entry : e))}
            onDelete={id => setErrorLog(prev => prev.filter(e => e.id !== id))}
          />
        )}
        {tab==="mastery" && <MasteryMapPage progress={masteryProgress} setProgress={setMasteryProgress} errorLog={errorLog} onOpenErrorLog={(prefill) => { setErrorLogPrefill(prefill); setTab("error-log"); }} todayFocus={data[todayKey()] || defaultDay()} onSetTodayFocus={(sectionId, unitId, chapterId, mode) => { const tk = todayKey(); upd(tk,"missionSectionId",sectionId); upd(tk,"missionUnitId",unitId); upd(tk,"missionChapterId",chapterId); if (mode !== undefined) upd(tk,"currentMode",mode||""); }} pendingMapFocusJump={pendingMapFocusJump} onMapFocusJumpConsumed={() => setPendingMapFocusJump(false)} />}
        {tab==="progress" && <ProgressPage data={data} totals={totals} dl={dl} dn={dn} start={START} totalDays={totalDays} backlogVideos={backlogVideos} backlogConcepts={backlogConcepts} setTab={setTab} />}
        {tab==="calendar" && <CalendarPage data={data} sel={sel} onSel={d=>{setSel(d);setTab("today");}} start={START} totalDays={totalDays} />}
        {tab==="profile" && (
          <ProfilePage
            userName={userName}
            userId={userId}
            onUserIdChange={setUserId}
            startDate={startDate}
            dayNumber={dn}
            totalDays={totalDays}
            setTab={setTab}
            appTheme={appTheme}
            setAppTheme={setAppTheme}
            targetPercentile={targetPercentile}
            setTargetPercentile={setTargetPercentile}
            setSharedCalcResult={setCalcResult}
            selectedDate={sel}
            selectedDayData={data[sel] || defaultDay()}
            masteryProgress={masteryProgress}
            avatarGender={avatarGender}
            avatarSkin={avatarSkin}
            avatarHair={avatarHair}
            avatarHairColor={avatarHairColor}
            avatarShirt={avatarShirt}
            avatarGlasses={avatarGlasses}
            avatarBeard={avatarBeard}
            avatarMustache={avatarMustache}
            onAvatarChange={handleAvatarChange}
            category={category}
            setCategory={setCategory}
            primaryDegree={primaryDegree}
            setPrimaryDegree={setPrimaryDegree}
            secondaryDegrees={secondaryDegrees}
            setSecondaryDegrees={setSecondaryDegrees}
            workExpYears={workExpYears}
            setWorkExpYears={setWorkExpYears}
            workExpMonths={workExpMonths}
            setWorkExpMonths={setWorkExpMonths}
            workCompany={workCompany}
            setWorkCompany={setWorkCompany}
            workRole={workRole}
            setWorkRole={setWorkRole}
          />
        )}
        {tab==="profile-edit" && (
          <ProfileEditPage
            userName={userName}
            userId={userId}
            onUserIdChange={setUserId}
            setTab={setTab}
            startDate={startDate}
            avatarGender={avatarGender}
            avatarSkin={avatarSkin}
            avatarHair={avatarHair}
            avatarHairColor={avatarHairColor}
            avatarShirt={avatarShirt}
            avatarGlasses={avatarGlasses}
            avatarBeard={avatarBeard}
            avatarMustache={avatarMustache}
            onAvatarChange={handleAvatarChange}
          />
        )}
        {tab==="academic-profile" && (
          <AcademicProfilePage
            primaryDegree={primaryDegree}
            setPrimaryDegree={setPrimaryDegree}
            secondaryDegrees={secondaryDegrees}
            setSecondaryDegrees={setSecondaryDegrees}
            workExpYears={workExpYears}
            setWorkExpYears={setWorkExpYears}
            workExpMonths={workExpMonths}
            setWorkExpMonths={setWorkExpMonths}
            workCompany={workCompany}
            setWorkCompany={setWorkCompany}
            workRole={workRole}
            setWorkRole={setWorkRole}
            calcResult={calcResult}
            onBack={() => setTab("profile")}
            setTab={setTab}
            userId={userId}
          />
        )}
        {tab==="secondary-degrees" && (
          <SecondaryDegreesPage
            secondaryDegrees={secondaryDegrees}
            setSecondaryDegrees={setSecondaryDegrees}
            onBack={() => setTab("academic-profile")}
          />
        )}
        {tab==="chat" && <ChatPage mentorMessages={mentorMessages} setMentorMessages={setMentorMessages} d={data[sel]||defaultDay()} totals={totals} dl={dl} dayNum={dn} mode={mode} userInitials={userInitials} userName={userName} masteryProgress={masteryProgress} errorLog={errorLog} backlogVideos={backlogVideos} backlogConcepts={backlogConcepts} academicNotes={academicNotes} setTab={setTab} sel={sel} data={data} avatarGender={avatarGender} avatarSkin={avatarSkin} avatarHair={avatarHair} avatarHairColor={avatarHairColor} avatarShirt={avatarShirt} avatarGlasses={avatarGlasses} avatarBeard={avatarBeard} avatarMustache={avatarMustache} />}
        {tab==="insta" && (
          <InstaCard
            dayNumber={dn}
            totalDays={totalDays}
            daysLeft={dl}
            totals={totals}
            todayData={data[sel] || defaultDay()}
            data={data}
            userName={userName}
            userInitials={userInitials}
            theme={appTheme}
            effortScore={effortScore(data[sel] || defaultDay(), backlogVideos, backlogConcepts)}
            avatarGender={avatarGender}
            avatarSkin={avatarSkin}
            avatarHair={avatarHair}
            avatarHairColor={avatarHairColor}
            avatarShirt={avatarShirt}
            avatarGlasses={avatarGlasses}
            avatarBeard={avatarBeard}
            avatarMustache={avatarMustache}
            onClose={() => setTab("today")}
          />
        )}
      </main>

      <nav
        className={`ios-bottom-nav${mobileActiveIdx < 0 ? " inactive" : ""}`}
        style={{
          "--active-idx": mobileActiveIdx,
          "--tab-count": mobileTabs.length,
          "--tab-gap-total": `${(mobileTabs.length - 1) * 4}px`
        }}
        aria-label="Mobile primary navigation"
      >
        {mobileTabs.map(item => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
          >
            <NavIcon id={item.id} />
            <span>{item.lbl}</span>
          </button>
        ))}
      </nav>

      <FloatingMentor daysLeft={dl} totals={totals} dayNum={dn} todayData={todayData} mentorMessages={mentorMessages} setMentorMessages={setMentorMessages} mode={mode} userInitials={userInitials} userName={userName} userId={userId} startDate={startDate} interviewDate={interviewDate} catResult={catResult} catPercentile={catPercentile} avatarGender={avatarGender} avatarSkin={avatarSkin} avatarHair={avatarHair} avatarHairColor={avatarHairColor} avatarShirt={avatarShirt} avatarGlasses={avatarGlasses} avatarBeard={avatarBeard} avatarMustache={avatarMustache} category={category} primaryDegree={primaryDegree} secondaryDegrees={secondaryDegrees} workExpYears={workExpYears} workExpMonths={workExpMonths} workCompany={workCompany} workRole={workRole} activeTab={tab === "chat" ? "mentor" : tab} calcResult={calcResult} targetPercentile={targetPercentile} />

    </div>
  );
}
