import { Fragment, useState, useMemo, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./App.css";
import InstaCard from "./pages/InstaCard.jsx";
import { useMediaQuery } from "./hooks/useMediaQuery.js";
import { useTodayRolloverKey } from "./hooks/useTodayRolloverKey.js";

function MentorAvatar({ size = 40 }) {
  // Vikram Anand — middle-aged, distinguished: grey hair, wrinkles, slick glasses
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
      border: "2px solid #f97316",
      background: "var(--avatar-bg, #000000)",
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
        <circle cx="50" cy="50" r="50" fill="var(--avatar-bg, #000000)"/>

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
    console.log("CHAT_RESPONSE", data)
    return data
  } catch {
    const text = await res.text()
    const data = { error: text || `Server error: ${res.status}` }
    console.log("CHAT_RESPONSE", data)
    return data
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
const getDaysToInterview = (dateStr) => {
  if (!dateStr) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const interview = new Date(dateStr + "T00:00:00")
  interview.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((interview - now) / 86400000))
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
  iq:"", n:"", backlog:[]
});

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
    calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    chat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    profile: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return icons[id] || null;
}


function TodayPage({
  date, d, upd, dl, start, totalDays, mode, setTab,
  backlogVideos, backlogConcepts, onSave, data, totals, userName,
  avatarGender, avatarSkin, avatarHair, avatarHairColor,
  avatarShirt, avatarGlasses, avatarBeard, avatarMustache,
  todayLiveLabel, todayAppLabel, isSundayIST
}) {
  const [saved, setSaved] = useState(false);
  const [showInstaCard, setShowInstaCard] = useState(false);
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
  const sleepDurationValid = hasSleepDuration && sleepDuration >= 4 && sleepDuration <= 6;
  const wakeBeforeTen = !!d.wt && d.wt < "10:00";
  const sleepWarning = hasSleepDuration && sleepDuration < 4
    ? "Too little sleep. Minimum 4 hours."
    : hasSleepDuration && sleepDuration > 6
      ? "Too much sleep. Maximum 6 hours for CAT prep."
      : "";
  const totalMins =
    (d.lc && !d.lc_na ? 120 : 0) +
    (d.as && !d.as_na ? 40 : 0) +
    (d.ap && !d.ap_na ? 120 : 0) +
    (d.vp && !d.vp_na ? 20 : 0) +
    ((+d.ph||0) * 60) +
    (+d.pm||0);
  const totalHrs = Math.floor(totalMins / 60);
  const totalMinRem = totalMins % 60;
  const totalDisplay = totalHrs > 0 && totalMinRem > 0
    ? `${totalHrs}h ${totalMinRem}m`
    : totalHrs > 0 ? `${totalHrs}h` : `${totalMinRem}m`;
  const totalBacklog = backlogVideos.length + backlogConcepts.length;
  const totalDone = backlogVideos.filter(i=>i.checked).length +
                    backlogConcepts.filter(i=>i.checked).length;
  const backlogPending = totalBacklog - totalDone;
  const backlogCoverage = totalBacklog > 0
    ? Math.round((totalDone / totalBacklog) * 100)
    : 0;
  const sudokuMins = Number(d.skm || 0);
  const sudokuSecs = Number(d.sks || 0);
  const sudokuTimeValid =
    Number.isInteger(sudokuMins) && sudokuMins >= 0 &&
    Number.isInteger(sudokuSecs) && sudokuSecs >= 0 && sudokuSecs < 60 &&
    (!d.sk || sudokuMins + sudokuSecs > 0);
  const isExamDay = date === EXAM_DATE_KEY;
  const showApplicationToggle = isApplicationWindow(date);
  const showFinalPush = isFinalPushDate(date);
  const finalPushMessages = {
    "2026-11-23": "Final week begins. Keep the work simple, steady, and clean.",
    "2026-11-24": "Protect your rhythm today. Accuracy matters more than noise.",
    "2026-11-25": "Revise calmly. The paper rewards the mind that does not rush.",
    "2026-11-26": "Trust your process. One good decision at a time is enough.",
    "2026-11-27": "Stay light. Eat well, sleep well, and let confidence settle.",
    "2026-11-28": "No panic work today. Sharpen gently and save your fire.",
  };

  if (isExamDay) {
    const reveal = isDdayRevealDay();
    const ddayMotifs = [
      {
        symbol: "👒",
        title: "Straw Hat Resolve",
        copy: "Put the dream on your head. Walk in like the sea already made space for you.",
        source: "One Piece spirit",
      },
      {
        symbol: "⚡",
        title: "Saiyan Calm",
        copy: "Power is not noise today. It is quiet pressure, clean breathing, and one more sharp decision.",
        source: "Dragon Ball spirit",
      },
      {
        symbol: "⚔",
        title: "Soul Blade",
        copy: "Cut only what matters. Skip the traps. Slice through the paper with discipline.",
        source: "Bleach spirit",
      },
      {
        symbol: "✦",
        title: "Five-Leaf Will",
        copy: "When the section gets loud, your months of practice get louder. You earned that voice.",
        source: "Black Clover spirit",
      },
      {
        symbol: "🥊",
        title: "Final Round",
        copy: "Guard up. Feet steady. Question by question. No panic gets to sit in your corner.",
        source: "Boxing anime spirit",
      },
      {
        symbol: "🔥",
        title: "Break Point",
        copy: "The exam is not bigger than your preparation. Let it meet the version of you that stayed.",
        source: "Shonen fire spirit",
      },
      {
        symbol: "🍥",
        title: "Hidden Leaf Grit",
        copy: "No shortcut built you. Repetition did. Walk in with the stubborn courage that kept returning.",
        source: "Naruto spirit",
      },
      {
        symbol: "💥",
        title: "Hero Academia",
        copy: "A real hero moves while afraid. Today your quirk is preparation, patience, and clean execution.",
        source: "My Hero Academia spirit",
      },
      {
        symbol: "🥊",
        title: "Ippo Steps",
        copy: "Small steps made the fighter. Small choices will make the score. Keep your rhythm.",
        source: "Hajime no Ippo spirit",
      },
      {
        symbol: "🏐",
        title: "Court Momentum",
        copy: "Jump for the next point only. The last miss cannot touch the next serve.",
        source: "Haikyuu spirit",
      },
      {
        symbol: "🏀",
        title: "Zone Focus",
        copy: "The crowd disappears. The clock disappears. Only the next question and your hand remain.",
        source: "Kuroko's Basketball spirit",
      },
      {
        symbol: "🧭",
        title: "Scout Discipline",
        copy: "Look straight at the giant. Break it into parts. Attack the weak point without drama.",
        source: "Attack on Titan spirit",
      },
      {
        symbol: "🛡",
        title: "Shield Rise",
        copy: "Every hard day became armor. Today, pressure hits you and turns into structure.",
        source: "Shield Hero spirit",
      },
      {
        symbol: "🌊",
        title: "Water Breathing",
        copy: "Inhale, read, eliminate, choose. Let calm become your technique.",
        source: "Demon Slayer spirit",
      },
      {
        symbol: "🏃",
        title: "Long Run",
        copy: "This was never one sprint. It was the road you kept taking when nobody clapped.",
        source: "Run with the Wind spirit",
      },
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
                    <div className="dday-card-mark" aria-hidden="true">{item.symbol}</div>
                    <div className="dday-symbol" aria-hidden="true">{item.symbol}</div>
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
                  <span className="dday-peacock">🪶</span>
                  <span className="dday-flute">♫</span>
                  <span className="dday-chariot">☸</span>
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
    <div className="page">
      <div className="page-header">
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div>
            <div className="page-title">{greet}</div>
            <div className="page-sub">{fmt} · Day {dn} of {totalDays}</div>
            <div style={{fontSize:12,color:"#f97316",opacity:0.8,fontStyle:"italic",marginTop:8}}>{todayQuote}</div>
            {showFinalPush && (
              <div className="final-push-note">
                {finalPushMessages[date] || "You are close now. Stay calm, stay sharp, and let the paper meet the version of you that refused to quit."}
              </div>
            )}
          </div>
          <div className="badge"><span>{dl}d left</span></div>
        </div>
      </div>
      <div className="sections">
        <div>
          <div className="sec-label">Vitals</div>
          <div className="card">
            <TimePickerWidget
              label="Wake time"
              sub="Recommended: 6:00 AM – 8:00 AM"
              value={d.wt}
              onChange={v => upd("wt", v)}
              dotColor={wakeBeforeTen && sleepDurationValid ? "#30d158" : "#ff453a"}
            />
            <TimePickerWidget
              label="Sleep time"
              sub="Recommended: 10:00 PM – 2:00 AM"
              value={d.st}
              onChange={v => upd("st", v)}
              dotColor={sleepDurationValid ? "#30d158" : "#ff453a"}
            />
            {hasSleepDuration && (
              <div className="sleep-summary">
                <div className={`sleep-duration-badge${sleepDurationValid ? " valid" : " invalid"}`}>
                  Sleep: {sleepDuration.toFixed(1)} hrs
                </div>
                {sleepWarning && <div className="sleep-warning">{sleepWarning}</div>}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="sec-label">Sessions</div>
          <div className="card">
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              gap: 10,
              width: "100%",
              boxSizing: "border-box",
            }}>
              <button
                onClick={() => { const n=!d.lc_na; upd("lc_na",n); if(n) upd("lc",false); }}
                style={{
                  flexShrink: 0,
                  flexGrow: 0,
                  width: 36,
                  boxSizing: "border-box",
                  padding: "4px 8px",
                  borderRadius: 20,
                  border: d.lc_na ? "1px solid var(--tt)" : "1px solid var(--b2)",
                  background: d.lc_na ? "rgba(110,110,115,0.15)" : "transparent",
                  color: d.lc_na ? "var(--tt)" : "var(--tt)",
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >N/A</button>
              <div style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
              }}>
                <div className="row-label" style={{
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
                }}>Live Class</div>
                <div className="row-sub" style={{
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
                }}>{todayLiveLabel || "2 hrs · iQuanta live"}</div>
              </div>
              <div style={{
                flexShrink: 0,
                flexGrow: 0,
                marginLeft: "auto",
                opacity: d.lc_na ? 0.35 : 1,
                pointerEvents: d.lc_na ? "none" : "auto",
              }}>
                <Tog v={d.lc} onChange={v=>{upd("lc",v);if(v)upd("lc_na",false);}} />
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              gap: 10,
              width: "100%",
              boxSizing: "border-box",
              borderTop: "1px solid var(--b1)",
            }}>
              <button
                onClick={() => { const n=!d.as_na; upd("as_na",n); if(n) upd("as",false); }}
                style={{
                  flexShrink: 0,
                  flexGrow: 0,
                  width: 36,
                  boxSizing: "border-box",
                  padding: "4px 8px",
                  borderRadius: 20,
                  border: d.as_na ? "1px solid var(--tt)" : "1px solid var(--b2)",
                  background: d.as_na ? "rgba(110,110,115,0.15)" : "transparent",
                  color: d.as_na ? "var(--tt)" : "var(--tt)",
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >N/A</button>
              <div style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
              }}>
                <div className="row-label" style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>Afternoon session</div>
                <div className="row-sub" style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>40 min session</div>
              </div>
              <div style={{
                flexShrink: 0,
                flexGrow: 0,
                marginLeft: "auto",
                opacity: d.as_na ? 0.35 : 1,
                pointerEvents: d.as_na ? "none" : "auto",
              }}>
                <Tog v={d.as} onChange={v=>{upd("as",v);if(v)upd("as_na",false);}} />
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              gap: 10,
              width: "100%",
              boxSizing: "border-box",
              borderTop: "1px solid var(--b1)",
            }}>
              <button
                onClick={() => { const n=!d.ap_na; upd("ap_na",n); if(n) upd("ap",false); }}
                style={{
                  flexShrink: 0,
                  flexGrow: 0,
                  width: 36,
                  boxSizing: "border-box",
                  padding: "4px 8px",
                  borderRadius: 20,
                  border: d.ap_na ? "1px solid var(--tt)" : "1px solid var(--b2)",
                  background: d.ap_na ? "rgba(110,110,115,0.15)" : "transparent",
                  color: d.ap_na ? "var(--tt)" : "var(--tt)",
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >N/A</button>
              <div style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
              }}>
                <div className="row-label" style={{
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
                }}>Application Class</div>
                <div className="row-sub" style={{
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
                }}>{todayAppLabel || "10PM - 12AM · Application class"}</div>
              </div>
              <div style={{
                flexShrink: 0,
                flexGrow: 0,
                marginLeft: "auto",
                opacity: d.ap_na ? 0.35 : 1,
                pointerEvents: d.ap_na ? "none" : "auto",
              }}>
                <Tog v={d.ap} onChange={v=>{upd("ap",v);if(v)upd("ap_na",false);}} />
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              gap: 10,
              width: "100%",
              boxSizing: "border-box",
              borderTop: "1px solid var(--b1)",
            }}>
              <button
                onClick={() => { const n=!d.vp_na; upd("vp_na",n); if(n) upd("vp",false); }}
                style={{
                  flexShrink: 0,
                  flexGrow: 0,
                  width: 36,
                  boxSizing: "border-box",
                  padding: "4px 8px",
                  borderRadius: 20,
                  border: d.vp_na ? "1px solid var(--tt)" : "1px solid var(--b2)",
                  background: d.vp_na ? "rgba(110,110,115,0.15)" : "transparent",
                  color: d.vp_na ? "var(--tt)" : "var(--tt)",
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >N/A</button>
              <div style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
              }}>
                <div className="row-label" style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>VARC passage</div>
                <div className="row-sub" style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>20 min passage</div>
              </div>
              <div style={{
                flexShrink: 0,
                flexGrow: 0,
                marginLeft: "auto",
                opacity: d.vp_na ? 0.35 : 1,
                pointerEvents: d.vp_na ? "none" : "auto",
              }}>
                <Tog v={d.vp} onChange={v=>{upd("vp",v);if(v)upd("vp_na",false);}} />
              </div>
            </div>
            <div className="card-row" style={{borderTop:"1px solid var(--b1)"}}>
              <div>
                <div className="row-label">Personal practice</div>
                <div className="row-sub">Additional self-study</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <select
                  className="time-select"
                  value={d.ph || 0}
                  onChange={e => upd("ph", Number(e.target.value))}
                  style={{minWidth:52}}
                >
                  {[0,1,2,3,4,5,6,7,8,9,10].map(h => (
                    <option key={h} value={h}>{h}h</option>
                  ))}
                </select>
                <select
                  className="time-select"
                  value={d.pm || 0}
                  onChange={e => upd("pm", Number(e.target.value))}
                  style={{minWidth:58}}
                >
                  {[0,10,20,30,40,50].map(m => (
                    <option key={m} value={m}>{String(m).padStart(2,"0")}m</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{
              display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"12px 16px",
              borderTop:"1px solid var(--b1)", marginTop:4
            }}>
              <span style={{fontSize:11,color:"var(--tt)",
                letterSpacing:"0.06em",textTransform:"uppercase"}}>
                Total Studied
              </span>
              <span style={{fontSize:16,fontWeight:700,
                color: totalMins >= 240 ? "#30d158"
                  : totalMins >= 120 ? "#f97316"
                    : "var(--tp)"
              }}>{totalDisplay}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="sec-label">iQuanta Backlog</div>
          <div className="card">
            <button
              className="card-row"
              onClick={() => setTab("backlog")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <div>
                <div className="row-label">iQuanta Backlog ({totalBacklog})</div>
                <div className="row-sub">
                  {totalBacklog > 0
                    ? `${backlogPending} pending · ${backlogCoverage}% covered`
                    : "Log videos and concepts"}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="var(--tt)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Timetable & Assessment</div>
          <div className="card">
            <button
              className="card-row"
              onClick={() => setTab("timetable")}
              style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",width:"100%",
                background:"transparent",border:"none",
                cursor:"pointer",fontFamily:"inherit"}}
            >
              <div>
                <div className="row-label">Weekly Timetable</div>
                <div className="row-sub">iQuanta live + application class schedule</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="var(--tt)" strokeWidth="2"
                strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button
              className="card-row"
              onClick={() => setTab("assessment")}
              style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",width:"100%",
                background:"transparent",border:"none",
                cursor:"pointer",fontFamily:"inherit",
                borderTop:"1px solid var(--b1)"}}
            >
              <div>
                <div className="row-label">
                  {isSundayIST ? "Weekly Assessment" : "Daily Assessment"}
                </div>
                <div className="row-sub">
                  {isSundayIST
                    ? "10 questions per topic · Sunday calibre check"
                    : "2 questions per topic · Daily calibre check"}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="var(--tt)" strokeWidth="2"
                strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {mode === "interview" ? (
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
        ) : (
          <div>
            <div className="sec-label">Today's work</div>
            <div className="card">
              {[{lbl:"Quant",sub:"Target: 10",f:"q",t:10},{lbl:"VARC sets",sub:"Target: 5",f:"v",t:5},{lbl:"LRDI sets",sub:"Target: 5",f:"l",t:5},{lbl:"VARC Para Reading",sub:"Target: 1 passage",f:"vp_count",t:1}].map(r => {
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
          <div className="sec-label">Notes</div>
          <div className="card"><textarea className="textarea" placeholder="iQuanta — topics covered, videos watched..." value={d.iq||""} onChange={e=>upd("iq",e.target.value)} rows={2} /></div>
        </div>

        <div>
          <div className="sec-label">Journal</div>
          <div className="card"><textarea className="textarea" placeholder="Journal — what did you study? focus level? what needs work tomorrow?" value={d.n||""} onChange={e=>upd("n",e.target.value)} rows={3} /></div>
        </div>

        {showApplicationToggle && (
          <div>
            <div className="sec-label">CAT Exam Application</div>
            <div className={`card application-card${d.ca ? " done" : ""}`}>
              <div className="card-row">
                <div>
                  <div className="row-label">CAT application submitted</div>
                  <div className="row-sub">Key task · Aug 1 - Sept 20</div>
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
            userName={userName}
            effortScore={effortScore(d)}
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
            {saved ? "Saved ✓" : "Save Day"}
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

function BacklogPage({ videos, setVideos, concepts, setConcepts, onBack }) {
  const [videoInput, setVideoInput] = useState("");
  const [conceptInput, setConceptInput] = useState("");

  const createItem = (text) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: text.trim(),
    checked: false,
    addedDate: new Date().toISOString().split("T")[0],
    checkedDate: null
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
        ? {
            ...item,
            checked: !item.checked,
            checkedDate: !item.checked
              ? new Date().toISOString().split("T")[0]
              : null
          }
        : item
    ));
  };

  const toggleConcept = (id) => {
    setConcepts(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            checked: !item.checked,
            checkedDate: !item.checked
              ? new Date().toISOString().split("T")[0]
              : null
          }
        : item
    ));
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

  const renderSection = ({
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
              {pending.map(item => (
                <div key={item.id} style={{
                  display:"flex", alignItems:"center",
                  gap:12, padding:"12px 0",
                  borderBottom:"1px solid var(--b1)"
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
                  <span style={{
                    flex:1, fontSize:14,
                    color:"var(--tp)", lineHeight:1.4
                  }}>{item.text}</span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      background:"transparent", border:"none",
                      color:"var(--tt)", fontSize:18,
                      cursor:"pointer", padding:"0 4px",
                      lineHeight:1
                    }}
                  >×</button>
                </div>
              ))}
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
                  >×</button>
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
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",
        gap:16
      }}>
        {renderSection({
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
          {saved ? "Saved ✓" : "Save Timetable"}
        </button>
      </div>
    </div>
  );
}

function AssessmentPage({ userId, onBack, setMentorMessages, isSunday, onAutoSend }) {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const sessionType = isSunday ? "weekly" : "daily";
  const totalQ = isSunday ? 30 : 6;

  useEffect(() => {
    if (!userId) { setError("No user ID"); setLoading(false); return; }
    fetch(`/api/assessment/session/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.completed) {
          setCompleted(true);
          setLoading(false);
          return;
        }
        if (!data.session || !data.session.questionObjects?.length) {
          setError(data.error || "No questions available. Bank may still be seeding.");
          setLoading(false);
          return;
        }
        setSession(data.session);
        setQuestions(data.session.questionObjects);
        setCurrentIdx(data.session.current_index || 0);
        setAnswers(data.session.answers || []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [userId]);

  const handleSelect = (option) => {
    if (result) return;
    setSelected(option);
  };

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    const q = questions[currentIdx];
    setSubmitting(true);
    try {
      const res = await fetch("/api/assessment/answer", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          userId,
          sessionId: session.id,
          questionId: q.id,
          userAnswer: selected,
          correctAnswer: q.correct_answer || selected,
          topic: q.topic,
        })
      });
      const data = await res.json();
      setResult(data);

      const newAnswer = {
        questionId: q.id,
        topic: q.topic,
        userAnswer: selected,
        isCorrect: data.isCorrect,
      };
      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      await fetch("/api/assessment/progress", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          sessionId: session.id,
          currentIndex: currentIdx + 1,
          answers: updatedAnswers,
        })
      });

      if (data.isCorrect) setScore(s => s + 1);
    } catch (err) {
      setResult({ isCorrect: false, explanation: "Could not check answer." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentIdx + 1 >= questions.length) {
      const finalScore = answers.filter(a => a.isCorrect).length + (result?.isCorrect ? 1 : 0);
      await fetch("/api/assessment/complete", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          userId,
          sessionId: session.id,
          type: sessionType,
          score: finalScore,
          total: questions.length,
          answers,
        })
      }).catch(console.error);

      const topicScores = ["quant","varc","lrdi"].map(t => {
        const tAnswers = answers.filter(a => a.topic === t);
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
    setCurrentIdx(i => i + 1);
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
        <div className="page-title">Loading assessment...</div>
      </div>
    </div>
  );

  if (error) return (
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
        <div className="page-title">Assessment</div>
      </div>
      <div className="card" style={{padding:"20px 16px",textAlign:"center"}}>
        <div style={{color:"#ff453a",marginBottom:8}}>{error}</div>
        <div style={{fontSize:12,color:"var(--tt)"}}>
          The question bank may still be seeding. Try again in a few minutes.
        </div>
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
        <div style={{fontSize:48,marginBottom:12}}>✓</div>
        <div style={{fontSize:18,fontWeight:700,color:"#30d158",marginBottom:8}}>
          {sessionType === "weekly" ? "Weekly" : "Daily"} assessment complete
        </div>
        <div style={{fontSize:14,color:"var(--tt)"}}>
          Vikram has your results. Check the chat.
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
  if (!q) return null;
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
              {result.isCorrect ? "✓ Correct" : "✗ Wrong"}
            </div>
            <div style={{fontSize:13,color:"var(--ts)",lineHeight:1.6}}>
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

function ProgressPage({ data, totals, dl, dn, start, totalDays, backlogVideos, backlogConcepts }) {
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
    <div className="page">
      <div className="page-header">
        <div className="page-title">Progress</div>
        <div className="page-sub">CAT 2026 · 99.9%ile target</div>
      </div>
      <div className="sections">
        <div className="card" style={{padding:"24px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div className="big-num">{dl}</div>
            <div style={{fontSize:11,color:"var(--tt)",marginTop:6,letterSpacing:"0.06em"}}>DAYS REMAINING</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:700,color:"var(--tp)"}}>Day {dn}</div>
            <div style={{fontSize:12,color:"var(--tt)",marginTop:2}}>of {totalDays}</div>
          </div>
        </div>

        <div>
          <div className="sec-label">Scoreboard</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {subj.map(s => {
              const pct = Math.min((s.act / s.tar) * 100, 100);
              const nd = Math.ceil((s.tar - s.act) / Math.max(dl, 1));
              return (
                <div key={s.id} className="card" style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:"var(--tp)"}}>{s.lbl}</span>
                    <span style={{fontSize:13,fontWeight:600,fontVariantNumeric:"tabular-nums",color:"var(--tp)"}}>
                      {s.act.toLocaleString()} <span style={{color:"var(--tt)",fontWeight:400}}>/ {s.tar.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{width:`${pct}%`}} /></div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                    <span style={{fontSize:11,color:"var(--tt)"}}>{pct.toFixed(1)}% complete</span>
                    <span style={{fontSize:11,color: nd <= s.dailyTarget ? "var(--green)" : AC}}>{nd}/day to stay on track</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="sec-label">Journey Score</div>
          <div className="card" style={{padding:"16px 10px 10px"}}>
            <div style={{display:"flex",gap:16,marginBottom:12,paddingLeft:8,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:20,height:2,background:"#f5c518",borderRadius:1}}/><span style={{fontSize:10,color:"var(--tt)"}}>Target</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:20,height:2,background:"#3b82f6",borderRadius:1}}/><span style={{fontSize:10,color:"var(--tt)"}}>Actual</span></div>
              <span style={{fontSize:10,color:"var(--tt)"}}>Above yellow = ahead of schedule</span>
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
      </div>
    </div>
  );
}

/* ── Reverse Mountain entrance divider ── */
function GrandLineDivider() {
  return (
    <div className="grand-line-wall" aria-label="Reverse Mountain">
      <svg className="gl-mountain-svg" viewBox="0 0 1000 200"
        preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="glRock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e5f91"/>
            <stop offset="45%" stopColor="#174976"/>
            <stop offset="100%" stopColor="#082844"/>
          </linearGradient>
          <linearGradient id="glDeep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#08213f"/>
            <stop offset="100%" stopColor="#020f22"/>
          </linearGradient>
          <linearGradient id="glWater" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(14,165,233,0.35)"/>
            <stop offset="50%" stopColor="rgba(125,211,252,0.74)"/>
            <stop offset="100%" stopColor="rgba(224,242,254,0.92)"/>
          </linearGradient>
          <linearGradient id="glSpray" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(56,189,248,0.12)"/>
            <stop offset="100%" stopColor="rgba(224,242,254,0.76)"/>
          </linearGradient>
        </defs>

        <rect x="0" y="166" width="1000" height="34" fill="rgba(14,116,144,0.5)"/>
        <path d="M0,200 L0,152 C70,126 112,150 168,118 C220,88 270,122 325,88
          C380,54 430,72 500,20 C570,72 620,54 675,88 C730,122 780,88 832,118
          C888,150 930,126 1000,152 L1000,200Z"
          fill="url(#glDeep)"/>
        <path d="M0,200 L0,170 C52,146 92,166 145,138 C190,116 230,145 280,120
          C322,99 360,126 410,102 C445,86 472,68 500,34 C528,68 555,86 590,102
          C640,126 678,99 720,120 C770,145 810,116 855,138 C908,166 948,146 1000,170
          L1000,200Z"
          fill="url(#glRock)"/>
        <path d="M0,200 L0,187 C46,177 82,188 122,180 C164,172 198,185 238,176
          C280,168 315,181 355,172 C396,163 436,176 476,164 C486,160 494,155 500,148
          C506,155 514,160 524,164 C564,176 604,163 645,172 C685,181 720,168 762,176
          C802,185 836,172 878,180 C918,188 954,177 1000,187 L1000,200Z"
          fill="rgba(5,24,50,0.88)"/>

        {/* Four blue sea currents climbing to the summit */}
        <path className="gl-current-l" d="M130,200 C142,176 146,151 153,126 C164,89 197,66 236,48
          C208,78 192,108 188,141 C185,164 178,184 168,200Z" fill="url(#glWater)"/>
        <path className="gl-current-r" d="M870,200 C858,176 854,151 847,126 C836,89 803,66 764,48
          C792,78 808,108 812,141 C815,164 822,184 832,200Z" fill="url(#glWater)"/>
        <path className="gl-current-l" d="M380,200 C392,166 402,136 424,105 C444,76 470,56 500,34
          C484,75 474,112 470,146 C467,170 460,188 450,200Z" fill="url(#glWater)" opacity="0.92"/>
        <path className="gl-current-r" d="M620,200 C608,166 598,136 576,105 C556,76 530,56 500,34
          C516,75 526,112 530,146 C533,170 540,188 550,200Z" fill="url(#glWater)" opacity="0.92"/>
        <ellipse className="gl-current-c" cx="500" cy="42" rx="86" ry="42" fill="url(#glSpray)" opacity="0.72"/>

        {/* Snow/foam on highest ridges */}
        <path d="M456,66 L500,26 L544,66 Q522,56 500,58 Q478,56 456,66Z" fill="rgba(235,248,255,0.58)"/>
        <ellipse cx="325" cy="88" rx="34" ry="10" fill="rgba(220,240,255,0.34)"/>
        <ellipse cx="675" cy="88" rx="34" ry="10" fill="rgba(220,240,255,0.34)"/>
        <ellipse cx="168" cy="118" rx="30" ry="10" fill="rgba(220,240,255,0.25)"/>
        <ellipse cx="832" cy="118" rx="30" ry="10" fill="rgba(220,240,255,0.25)"/>

        {/* Mist and rock texture */}
        <ellipse cx="500" cy="64" rx="150" ry="28" fill="rgba(255,255,255,0.06)"/>
        {[95,185,275,365,455,545,635,725,815,905].map(x=>(
          <line key={x} x1={x} y1="122" x2={x+10} y2="200"
            stroke="rgba(0,0,0,0.16)" strokeWidth="1.5"/>
        ))}
        <rect x="0" y="196" width="1000" height="4" fill="rgba(125,211,252,0.78)"/>
        <line x1="0" y1="194" x2="1000" y2="194" stroke="rgba(224,242,254,0.54)" strokeWidth="2"/>
      </svg>

      <div className="gl-text-layer">
        <div className="gl-badge">
          <span className="gl-badge-title">REVERSE MOUNTAIN</span>
          <span className="gl-badge-sub">Four seas climb upward · Grand Line begins</span>
        </div>
      </div>
    </div>
  );
}

/* ── Red Line — dramatic full-width continental wall ── */
function RedLineDivider() {
  return (
    <div className="red-line-wall" aria-label="Red Line — New World begins">
      <svg className="rl-mountain-svg" viewBox="0 0 1000 200"
        preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="rlRock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B0808"/>
            <stop offset="45%" stopColor="#8B1010"/>
            <stop offset="100%" stopColor="#3a0202"/>
          </linearGradient>
          <linearGradient id="rlFire" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(255,80,0,0.65)"/>
            <stop offset="50%" stopColor="rgba(200,30,0,0.25)"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
          <linearGradient id="rlDeep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a0000"/>
            <stop offset="100%" stopColor="#200000"/>
          </linearGradient>
        </defs>
        {/* Fire glow base */}
        <rect x="0" y="165" width="1000" height="35" fill="url(#rlFire)"/>
        {/* Deep shadow mountain (back layer) */}
        <path d="M0,200 L0,155 C70,125 110,152 170,118 C220,92 265,130 315,104
          C365,78 410,112 460,88 C510,64 555,98 605,76 C655,54 700,88 750,68
          C800,48 845,80 895,58 C940,40 970,72 1000,52 L1000,200Z"
          fill="url(#rlDeep)"/>
        {/* Main rocky mountain */}
        <path d="M0,200 L0,168 C55,142 90,162 145,135 C188,114 228,148 275,126
          C315,108 352,138 398,118 C438,102 472,130 518,112 C558,96 592,122 638,106
          C678,92 712,116 758,100 C798,86 832,110 878,94 C914,82 950,104 1000,88
          L1000,200Z"
          fill="url(#rlRock)"/>
        {/* Front rocky base */}
        <path d="M0,200 L0,186 C42,178 78,188 118,181 C158,174 192,185 230,177
          C268,170 302,182 340,174 C378,166 412,179 450,172 C488,165 522,178 560,170
          C598,162 632,176 670,168 C708,160 742,174 780,167 C818,159 852,173 890,165
          C928,158 962,171 1000,163 L1000,200Z"
          fill="rgba(85,8,8,0.9)"/>
        {/* Snow/ice on tallest peaks */}
        <ellipse cx="460" cy="82" rx="42" ry="14" fill="rgba(240,240,255,0.38)"/>
        <ellipse cx="170" cy="112" rx="30" ry="10" fill="rgba(240,240,255,0.30)"/>
        <ellipse cx="748" cy="92" rx="34" ry="11" fill="rgba(240,240,255,0.32)"/>
        <ellipse cx="315" cy="98" rx="24" ry="8" fill="rgba(240,240,255,0.24)"/>
        <ellipse cx="893" cy="88" rx="26" ry="9" fill="rgba(240,240,255,0.26)"/>
        {/* Cloud mist near peaks */}
        <ellipse cx="200" cy="118" rx="88" ry="24" fill="rgba(255,255,255,0.05)"/>
        <ellipse cx="460" cy="88" rx="110" ry="26" fill="rgba(255,255,255,0.06)"/>
        <ellipse cx="760" cy="98" rx="92" ry="22" fill="rgba(255,255,255,0.05)"/>
        {/* Vertical rock texture lines */}
        {[80,170,260,350,440,530,620,710,800,900].map(x=>(
          <line key={x} x1={x} y1="120" x2={x+8} y2="200"
            stroke="rgba(0,0,0,0.14)" strokeWidth="1.5"/>
        ))}
        {/* Glowing bottom lava edge */}
        <rect x="0" y="196" width="1000" height="4" fill="rgba(255,70,20,0.9)"/>
        <line x1="0" y1="194" x2="1000" y2="194" stroke="rgba(255,110,50,0.5)" strokeWidth="2"/>
      </svg>
      {/* Text overlay */}
      <div className="rl-text-layer">
        <div className="rl-badge">
          <span className="rl-name">RED LINE</span>
          <span className="rl-sub-text">New World begins — Final Phase</span>
        </div>
      </div>
    </div>
  );
}

/* ── Per-island SVG watermark ── */
function IslandDecor({ name }) {
  let content = null;
  switch (name) {
    case "Windmill Village": content = <>
      <rect x="36" y="46" width="8" height="28" rx="2" fill="rgba(200,158,88,0.52)"/>
      {[0,90,180,270].map(a=>(
        <rect key={a} x="38.5" y="22" width="3" height="25" rx="1.5"
          fill="rgba(230,198,128,0.56)" transform={`rotate(${a} 40 48)`}/>
      ))}
      <circle cx="40" cy="48" r="5.5" fill="rgba(215,175,102,0.62)"/>
      <polygon points="8,78 22,62 36,78" fill="rgba(175,98,58,0.46)"/>
      <polygon points="48,78 62,64 76,78" fill="rgba(175,98,58,0.42)"/>
    </>; break;

    case "Shells Town": content = <>
      <path d="M40,68 Q18,57 16,38 Q16,18 40,13 Q64,18 64,38 Q62,57 40,68Z"
        fill="rgba(220,182,142,0.3)" stroke="rgba(240,202,162,0.46)" strokeWidth="1.5"/>
      <path d="M40,68 Q34,55 32,42 Q32,30 40,26 Q48,30 48,42 Q46,55 40,68Z" fill="rgba(202,162,122,0.2)"/>
      <circle cx="18" cy="18" r="6.5" fill="none" stroke="rgba(98,138,202,0.62)" strokeWidth="2.2"/>
      <line x1="18" y1="11" x2="18" y2="32" stroke="rgba(98,138,202,0.65)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="16" x2="25" y2="16" stroke="rgba(98,138,202,0.52)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M11,32 Q18,36 25,32" fill="none" stroke="rgba(98,138,202,0.62)" strokeWidth="2" strokeLinecap="round"/>
    </>; break;

    case "Orange Town": content = <>
      <rect x="36" y="44" width="8" height="28" fill="rgba(98,62,28,0.52)"/>
      <circle cx="40" cy="36" r="19" fill="rgba(38,118,38,0.42)"/>
      <circle cx="23" cy="42" r="10" fill="rgba(38,118,38,0.35)"/>
      <circle cx="57" cy="42" r="10" fill="rgba(38,118,38,0.35)"/>
      {[{x:33,y:28},{x:46,y:24},{x:41,y:44},{x:24,y:37},{x:54,y:37}].map((o,i)=>(
        <g key={i}>
          <circle cx={o.x} cy={o.y} r="5.2" fill="rgba(255,155,28,0.68)"/>
          <line x1={o.x} y1={o.y-5} x2={o.x} y2={o.y-8} stroke="rgba(48,98,28,0.58)" strokeWidth="1.2"/>
        </g>
      ))}
    </>; break;

    case "Gecko Islands":
    case "Syrup Village": content = <>
      <polygon points="13,36 40,14 67,36" fill="rgba(178,98,58,0.46)"/>
      <rect x="19" y="36" width="42" height="34" rx="1" fill="rgba(228,208,168,0.38)"/>
      <rect x="26" y="42" width="10" height="10" rx="1" fill="rgba(198,235,255,0.42)"/>
      <rect x="44" y="42" width="10" height="10" rx="1" fill="rgba(198,235,255,0.42)"/>
      <rect x="35" y="58" width="10" height="12" rx="4 4 0 0" fill="rgba(138,95,54,0.52)"/>
      <circle cx="11" cy="40" r="10" fill="rgba(38,118,38,0.42)"/>
      <rect x="9" y="40" width="4" height="24" fill="rgba(78,46,16,0.52)"/>
    </>; break;

    case "Baratie": content = <>
      <path d="M7,59 Q40,50 73,59 L69,71 Q40,76 11,71Z" fill="rgba(182,132,82,0.46)" stroke="rgba(202,154,102,0.52)" strokeWidth="1.5"/>
      <rect x="22" y="32" width="36" height="28" rx="2" fill="rgba(228,198,148,0.4)"/>
      <rect x="22" y="29" width="36" height="6" rx="1" fill="rgba(200,58,38,0.46)"/>
      <rect x="32" y="13" width="16" height="14" rx="1" fill="rgba(255,255,255,0.58)"/>
      <ellipse cx="40" cy="12" rx="13" ry="8" fill="rgba(255,255,255,0.6)"/>
      <rect x="27" y="38" width="9" height="8" rx="1" fill="rgba(198,235,255,0.44)"/>
      <rect x="44" y="38" width="9" height="8" rx="1" fill="rgba(198,235,255,0.44)"/>
    </>; break;

    case "Arlong Park": content = <>
      <path d="M6,40 L63,33 L66,40 L63,47 L6,40Z" fill="rgba(98,142,192,0.46)"/>
      {[12,20,28,36,44,52].map(x=>(
        <polygon key={x} points={`${x},34 ${x+4},26 ${x+8},34`} fill="rgba(202,218,232,0.58)"/>
      ))}
      <rect x="36" y="50" width="36" height="22" rx="2" fill="rgba(58,98,142,0.38)"/>
      <path d="M36,50 Q54,38 72,50" fill="rgba(58,98,142,0.3)" stroke="rgba(78,132,182,0.46)" strokeWidth="1.5"/>
      <path d="M4,66 Q18,60 32,66 Q46,60 60,66 Q72,60 78,64" fill="none" stroke="rgba(98,178,255,0.4)" strokeWidth="2"/>
    </>; break;

    case "Loguetown": content = <>
      <rect x="28" y="16" width="4.5" height="42" fill="rgba(140,108,68,0.58)"/>
      <rect x="28" y="16" width="24" height="4.5" rx="1" fill="rgba(140,108,68,0.58)"/>
      <line x1="42" y1="20" x2="42" y2="36" stroke="rgba(98,74,44,0.62)" strokeWidth="1.8"/>
      <rect x="13" y="60" width="54" height="4" rx="1" fill="rgba(140,108,68,0.52)"/>
      <rect x="5" y="37" width="14" height="23" rx="1" fill="rgba(142,122,92,0.32)"/>
      <polygon points="5,37 12,24 19,37" fill="rgba(162,102,62,0.42)"/>
      <rect x="61" y="33" width="14" height="27" rx="1" fill="rgba(142,122,92,0.28)"/>
      <polygon points="61,33 68,21 75,33" fill="rgba(162,102,62,0.38)"/>
    </>; break;

    case "Sandy Island":
    case "Alabasta": content = <>
      <polygon points="40,8 10,68 70,68" fill="rgba(212,172,65,0.44)" stroke="rgba(232,192,85,0.58)" strokeWidth="1.5"/>
      <polygon points="40,8 23,42 57,42" fill="rgba(245,205,102,0.26)"/>
      <path d="M34,68 Q40,60 46,68Z" fill="rgba(148,98,38,0.58)"/>
      {[0,45,90,135,180,225,270,315].map(a=>(
        <line key={a}
          x1={66+Math.cos(a*Math.PI/180)*9} y1={13+Math.sin(a*Math.PI/180)*9}
          x2={66+Math.cos(a*Math.PI/180)*15} y2={13+Math.sin(a*Math.PI/180)*15}
          stroke="rgba(255,212,52,0.62)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      <circle cx="66" cy="13" r="9" fill="rgba(255,202,42,0.42)"/>
    </>; break;

    case "Skypiea": content = <>
      <ellipse cx="33" cy="26" rx="19" ry="11" fill="rgba(255,255,255,0.4)"/>
      <ellipse cx="18" cy="29" rx="13" ry="9" fill="rgba(255,255,255,0.34)"/>
      <ellipse cx="49" cy="29" rx="15" ry="9" fill="rgba(255,255,255,0.34)"/>
      <ellipse cx="63" cy="22" rx="13" ry="9" fill="rgba(255,255,222,0.32)"/>
      <polygon points="56,25 49,47 54,47 47,68 66,40 60,40 67,25"
        fill="rgba(255,222,52,0.68)" stroke="rgba(255,242,102,0.42)" strokeWidth="0.5"/>
      <circle cx="33" cy="60" r="14" fill="rgba(255,202,52,0.16)" stroke="rgba(255,218,82,0.32)" strokeWidth="1"/>
    </>; break;

    case "Water 7": content = <>
      <polygon points="19,22 40,7 61,22" fill="rgba(138,78,48,0.46)"/>
      <rect x="23" y="22" width="34" height="40" rx="2" fill="rgba(182,162,122,0.38)"/>
      <rect x="28" y="28" width="10" height="9" rx="1" fill="rgba(198,235,255,0.44)"/>
      <rect x="42" y="28" width="10" height="9" rx="1" fill="rgba(198,235,255,0.44)"/>
      <ellipse cx="40" cy="70" rx="36" ry="7" fill="rgba(98,162,255,0.22)"/>
      <path d="M4,70 Q19,63 40,67 Q61,63 76,70" fill="none" stroke="rgba(98,182,255,0.44)" strokeWidth="2.2"/>
      <path d="M18,65 Q38,59 58,65 Q54,71 40,74 Q26,71 18,65Z" fill="rgba(58,36,16,0.54)"/>
    </>; break;

    case "Enies Lobby": content = <>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
        <line key={a}
          x1={40+Math.cos(a*Math.PI/180)*10} y1={14+Math.sin(a*Math.PI/180)*10}
          x2={40+Math.cos(a*Math.PI/180)*19} y2={14+Math.sin(a*Math.PI/180)*19}
          stroke="rgba(255,232,82,0.52)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      <circle cx="40" cy="14" r="10" fill="rgba(255,222,72,0.44)"/>
      <rect x="17" y="30" width="11" height="44" rx="1" fill="rgba(182,162,122,0.5)" stroke="rgba(202,182,142,0.52)" strokeWidth="1"/>
      <rect x="52" y="30" width="11" height="44" rx="1" fill="rgba(182,162,122,0.5)" stroke="rgba(202,182,142,0.52)" strokeWidth="1"/>
      <path d="M17,30 Q40,17 63,30" fill="rgba(178,158,118,0.38)" stroke="rgba(202,182,142,0.52)" strokeWidth="1.5"/>
    </>; break;

    case "Thriller Bark": content = <>
      <path d="M63,11 A17,17 0 1 0 63,45 A11,11 0 1 1 63,11Z" fill="rgba(202,212,178,0.38)"/>
      <rect x="17" y="54" width="46" height="20" fill="rgba(52,42,74,0.5)"/>
      <rect x="15" y="45" width="11" height="18" fill="rgba(52,42,74,0.5)"/>
      <rect x="54" y="45" width="11" height="18" fill="rgba(52,42,74,0.5)"/>
      <rect x="34" y="50" width="12" height="14" fill="rgba(52,42,74,0.5)"/>
      <path d="M40,36 Q28,24 16,30 Q22,34 29,31 Q35,38 40,36 Q45,38 51,31 Q58,34 64,30 Q52,24 40,36Z"
        fill="rgba(72,52,104,0.6)"/>
    </>; break;

    case "Sabaody Archipelago": content = <>
      <path d="M37,74 Q35,55 31,43 Q26,32 23,17" stroke="rgba(68,138,54,0.6)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M31,55 Q20,62 15,67" stroke="rgba(68,138,54,0.5)" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="23" cy="15" rx="16" ry="11" fill="rgba(54,158,54,0.44)"/>
      {[{x:55,y:23,r:14},{x:64,y:46,r:9},{x:49,y:53,r:6.5},{x:67,y:17,r:5.5}].map((b,i)=>(
        <circle key={i} cx={b.x} cy={b.y} r={b.r}
          fill="rgba(178,245,255,0.13)" stroke="rgba(178,245,255,0.52)" strokeWidth="1.5"/>
      ))}
    </>; break;

    case "Marineford": content = <>
      <line x1="31" y1="9" x2="31" y2="57" stroke="rgba(202,222,255,0.57)" strokeWidth="2.2"/>
      <rect x="31" y="9" width="30" height="20" rx="1" fill="rgba(202,222,255,0.36)" stroke="rgba(202,222,255,0.54)" strokeWidth="1"/>
      <rect x="34" y="15" width="24" height="2.5" rx="1" fill="rgba(98,138,232,0.58)"/>
      <rect x="34" y="21" width="18" height="2" rx="1" fill="rgba(98,138,232,0.46)"/>
      <path d="M7,58 L73,58 L68,70 Q40,75 12,70Z" fill="rgba(98,118,182,0.44)" stroke="rgba(118,142,202,0.5)" strokeWidth="1.5"/>
      <rect x="15" y="51" width="11" height="5.5" rx="2.7" fill="rgba(72,76,108,0.57)"/>
      <rect x="54" y="51" width="11" height="5.5" rx="2.7" fill="rgba(72,76,108,0.57)"/>
      <path d="M3,64 Q16,57 29,64 Q42,71 55,64 Q68,57 77,64" fill="none" stroke="rgba(98,162,255,0.38)" strokeWidth="2"/>
    </>; break;

    case "Fishman Island": content = <>
      <path d="M17,74 Q17,52 23,45 Q19,39 26,33 Q22,26 28,23" stroke="rgba(255,122,102,0.6)" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
      <path d="M21,61 Q29,50 34,48" stroke="rgba(255,122,102,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="56" cy="48" rx="14" ry="7.5" fill="rgba(98,212,232,0.44)" transform="rotate(-18,56,48)"/>
      <polygon points="70,48 80,41 80,55" fill="rgba(98,212,232,0.44)" transform="rotate(-18,56,48)"/>
      <circle cx="51" cy="46" r="2.5" fill="rgba(14,52,78,0.57)" transform="rotate(-18,56,48)"/>
      {[{x:27,y:27,r:4.5},{x:64,y:23,r:3.5},{x:44,y:17,r:5.5}].map((b,i)=>(
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="none" stroke="rgba(154,228,255,0.5)" strokeWidth="1.4"/>
      ))}
    </>; break;

    case "Dressrosa": content = <>
      <path d="M9,73 L9,43 Q9,27 24,27" stroke="rgba(228,188,128,0.54)" strokeWidth="2.5" fill="none"/>
      <path d="M24,27 Q40,19 56,27" stroke="rgba(228,188,128,0.54)" strokeWidth="2.5" fill="none"/>
      <path d="M56,27 Q71,27 71,43 L71,73" stroke="rgba(228,188,128,0.54)" strokeWidth="2.5" fill="none"/>
      <path d="M19,73 L19,51 Q19,42 27,42 Q35,42 35,51 L35,73" fill="rgba(228,188,128,0.1)" stroke="rgba(228,188,128,0.3)" strokeWidth="1.5"/>
      <path d="M45,73 L45,51 Q45,42 53,42 Q61,42 61,51 L61,73" fill="rgba(228,188,128,0.1)" stroke="rgba(228,188,128,0.3)" strokeWidth="1.5"/>
      {[{x:19,y:19,c:"rgba(255,98,154,0.6)"},{x:56,y:13,c:"rgba(255,78,124,0.55)"},{x:38,y:9,c:"rgba(255,154,184,0.6)"}].map((f,i)=>(
        <g key={i}>
          {[0,72,144,216,288].map(a=>(
            <circle key={a} cx={f.x+Math.cos(a*Math.PI/180)*7} cy={f.y+Math.sin(a*Math.PI/180)*7} r="3.8" fill={f.c}/>
          ))}
          <circle cx={f.x} cy={f.y} r="5" fill="rgba(255,242,102,0.72)"/>
        </g>
      ))}
    </>; break;

    case "Whole Cake Island": content = <>
      <ellipse cx="40" cy="63" rx="28" ry="8" fill="rgba(242,182,122,0.5)"/>
      <rect x="13" y="48" width="54" height="18" rx="2" fill="rgba(242,177,117,0.44)"/>
      <ellipse cx="40" cy="48" rx="27" ry="7.5" fill="rgba(255,202,152,0.54)"/>
      <rect x="15" y="33" width="50" height="18" rx="2" fill="rgba(255,162,188,0.44)"/>
      <ellipse cx="40" cy="33" rx="25" ry="7" fill="rgba(255,182,208,0.54)"/>
      <rect x="17" y="19" width="46" height="16" rx="2" fill="rgba(255,202,228,0.44)"/>
      <ellipse cx="40" cy="19" rx="23" ry="6.5" fill="rgba(255,222,242,0.6)"/>
      <rect x="37" y="9" width="6" height="12" rx="2" fill="rgba(255,245,212,0.68)"/>
      <ellipse cx="40" cy="8" rx="4" ry="5" fill="rgba(255,168,32,0.78)"/>
    </>; break;

    case "Wano": content = <>
      {/* Torii gate — Wano's most iconic symbol */}
      <rect x="13" y="30" width="5" height="46" rx="1.5" fill="rgba(202,52,28,0.72)"/>
      <rect x="62" y="30" width="5" height="46" rx="1.5" fill="rgba(202,52,28,0.72)"/>
      <rect x="9" y="26" width="62" height="6.5" rx="2" fill="rgba(202,52,28,0.78)"/>
      <rect x="11" y="36" width="58" height="4" rx="1.5" fill="rgba(202,52,28,0.58)"/>
      {/* Katana */}
      <line x1="54" y1="10" x2="74" y2="74" stroke="rgba(215,228,242,0.57)" strokeWidth="2.2" strokeLinecap="round"/>
      <rect x="51" y="7" width="7" height="10" rx="1.2" fill="rgba(188,148,57,0.6)"/>
      {/* Sakura petals */}
      {[{x:26,y:13},{x:40,y:16},{x:62,y:8},{x:14,y:18}].map((p,i)=>(
        <g key={i}>
          <circle cx={p.x}   cy={p.y}   r="5"   fill="rgba(255,182,208,0.6)"/>
          <circle cx={p.x+5} cy={p.y+3} r="3.5" fill="rgba(255,162,190,0.5)"/>
          <circle cx={p.x-4} cy={p.y+2} r="3.5" fill="rgba(255,182,208,0.54)"/>
        </g>
      ))}
      {/* Mount Fuji */}
      <polygon points="40,52 21,74 59,74" fill="rgba(232,238,248,0.42)" stroke="rgba(212,220,232,0.52)" strokeWidth="1"/>
      <polygon points="40,52 32,63 48,63" fill="rgba(255,255,255,0.48)"/>
    </>; break;

    case "Egghead": content = <>
      <path d="M11,67 Q11,18 40,12 Q69,18 69,67Z" fill="rgba(98,208,255,0.2)" stroke="rgba(98,208,255,0.44)" strokeWidth="1.5"/>
      <ellipse cx="40" cy="67" rx="29" ry="6" fill="rgba(98,208,255,0.28)"/>
      <rect x="25" y="29" width="30" height="26" rx="4" fill="rgba(78,168,228,0.44)" stroke="rgba(98,208,255,0.5)" strokeWidth="1.2"/>
      <rect x="28" y="33" width="9" height="8" rx="2" fill="rgba(208,248,255,0.7)"/>
      <rect x="43" y="33" width="9" height="8" rx="2" fill="rgba(208,248,255,0.7)"/>
      <rect x="29" y="45" width="22" height="4" rx="2" fill="rgba(158,228,255,0.54)"/>
      <line x1="40" y1="29" x2="40" y2="17" stroke="rgba(98,208,255,0.57)" strokeWidth="1.8"/>
      <circle cx="40" cy="15" r="4" fill="rgba(98,228,255,0.72)"/>
      <circle cx="15" cy="19" r="8" fill="none" stroke="rgba(158,208,255,0.44)" strokeWidth="2.2"/>
      <circle cx="65" cy="21" r="7" fill="none" stroke="rgba(158,208,255,0.44)" strokeWidth="2.2"/>
    </>; break;

    case "Elbaf": content = <>
      <path d="M7,58 Q40,48 73,58 L69,70 Q40,75 11,70Z" fill="rgba(138,86,36,0.5)" stroke="rgba(182,120,60,0.54)" strokeWidth="1.5"/>
      <path d="M71,58 Q84,46 86,37 Q75,41 71,51Z" fill="rgba(138,86,36,0.54)"/>
      <line x1="40" y1="58" x2="40" y2="16" stroke="rgba(138,86,36,0.57)" strokeWidth="2.2"/>
      <path d="M40,16 L17,29 L17,55 L40,58 L63,55 L63,29Z" fill="rgba(202,57,38,0.4)" stroke="rgba(222,80,57,0.44)" strokeWidth="0.8"/>
      <line x1="27" y1="34" x2="53" y2="34" stroke="rgba(255,228,102,0.54)" strokeWidth="1.8"/>
      <line x1="40" y1="23" x2="40" y2="48" stroke="rgba(255,228,102,0.54)" strokeWidth="1.8"/>
      <line x1="65" y1="17" x2="65" y2="51" stroke="rgba(153,123,70,0.57)" strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M56,17 Q51,26 57,34 Q65,26 60,17Z" fill="rgba(188,188,202,0.54)"/>
    </>; break;

    case "Hachinosu": content = <>
      {/* Blackbeard's base — skull + crossbones + dark fortress */}
      <circle cx="40" cy="38" r="20" fill="rgba(18,14,30,0.5)" stroke="rgba(80,60,100,0.46)" strokeWidth="1.5"/>
      <circle cx="40" cy="34" r="10" fill="rgba(215,208,192,0.44)"/>
      <circle cx="35.5" cy="37" r="3" fill="rgba(10,8,18,0.7)"/>
      <circle cx="44.5" cy="37" r="3" fill="rgba(10,8,18,0.7)"/>
      <path d="M35 42 L40 46 L45 42" fill="rgba(10,8,18,0.55)"/>
      <line x1="29" y1="50" x2="51" y2="60" stroke="rgba(215,208,192,0.44)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="51" y1="50" x2="29" y2="60" stroke="rgba(215,208,192,0.44)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Pirate flag on mast */}
      <line x1="62" y1="14" x2="62" y2="52" stroke="rgba(120,100,60,0.52)" strokeWidth="1.8"/>
      <rect x="62" y="14" width="14" height="10" rx="1" fill="rgba(18,14,30,0.7)"/>
      {/* Dark fortress silhouette */}
      <rect x="8" y="56" width="32" height="20" rx="1" fill="rgba(28,22,42,0.48)"/>
      <rect x="5" y="48" width="8" height="14" rx="1" fill="rgba(28,22,42,0.52)"/>
      <rect x="32" y="48" width="8" height="14" rx="1" fill="rgba(28,22,42,0.52)"/>
    </>; break;

    default: content = null;
  }
  if (!content) return null;
  return (
    <div className="island-decor" aria-hidden="true">
      <svg viewBox="0 0 80 80" width="88" height="88" style={{overflow:'visible'}}>
        {content}
      </svg>
    </div>
  );
}

function MonthLoreScene({ name }) {
  let content = null;
  switch (name) {
    case "Arlong Park": content = <>
      <path d="M0 76 Q80 54 160 76 T320 76 V120 H0Z" fill="rgba(36,130,170,0.28)"/>
      <g transform="translate(220 16)">
        {[0,1,2,3,4,5].map(i => <polygon key={i} points={`${i*14},34 ${i*14+6},8 ${i*14+12},34`} fill="rgba(210,232,245,0.26)"/>)}
        <path d="M0 40 L96 28 L108 42 L96 56 L0 40Z" fill="rgba(70,130,170,0.22)"/>
      </g>
      <path d="M20 84 Q54 66 88 84 Q122 102 156 84" fill="none" stroke="rgba(125,211,252,0.35)" strokeWidth="3"/>
    </>; break;
    case "Skypiea": content = <>
      <ellipse cx="74" cy="42" rx="58" ry="26" fill="rgba(255,255,255,0.24)"/>
      <ellipse cx="190" cy="66" rx="74" ry="30" fill="rgba(255,255,255,0.18)"/>
      <ellipse cx="275" cy="34" rx="44" ry="20" fill="rgba(255,255,255,0.22)"/>
      <polygon points="244,8 220,58 238,54 218,108 274,44 252,48 278,8" fill="rgba(255,230,75,0.62)"/>
      <circle cx="86" cy="88" r="22" fill="none" stroke="rgba(255,215,0,0.22)" strokeWidth="3"/>
    </>; break;
    case "Enies Lobby": content = <>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
        <line key={a}
          x1={160+Math.cos(a*Math.PI/180)*34} y1={28+Math.sin(a*Math.PI/180)*34}
          x2={160+Math.cos(a*Math.PI/180)*72} y2={28+Math.sin(a*Math.PI/180)*72}
          stroke="rgba(255,230,80,0.22)" strokeWidth="4" strokeLinecap="round"/>
      ))}
      <circle cx="160" cy="28" r="34" fill="rgba(255,220,70,0.18)"/>
      <rect x="36" y="46" width="44" height="74" rx="3" fill="rgba(210,190,150,0.18)"/>
      <rect x="240" y="46" width="44" height="74" rx="3" fill="rgba(210,190,150,0.18)"/>
      <path d="M36 46 Q160 12 284 46" fill="none" stroke="rgba(230,210,170,0.28)" strokeWidth="5"/>
    </>; break;
    case "Marineford": content = <>
      <path d="M0 92 Q80 72 160 92 T320 92 V120 H0Z" fill="rgba(96,165,250,0.18)"/>
      <rect x="70" y="46" width="180" height="54" rx="4" fill="rgba(190,210,240,0.16)" stroke="rgba(190,210,240,0.22)" strokeWidth="2"/>
      <rect x="100" y="26" width="120" height="24" rx="4" fill="rgba(220,235,255,0.14)"/>
      <line x1="160" y1="24" x2="160" y2="0" stroke="rgba(220,235,255,0.34)" strokeWidth="3"/>
      <rect x="160" y="0" width="54" height="18" rx="2" fill="rgba(220,235,255,0.22)"/>
      {[52,268].map(x => <rect key={x} x={x} y="70" width="34" height="12" rx="6" fill="rgba(55,65,100,0.32)"/>)}
    </>; break;
    case "Wano": content = <>
      <rect x="40" y="42" width="18" height="78" rx="4" fill="rgba(220,38,38,0.24)"/>
      <rect x="262" y="42" width="18" height="78" rx="4" fill="rgba(220,38,38,0.24)"/>
      <rect x="28" y="32" width="264" height="16" rx="5" fill="rgba(220,38,38,0.28)"/>
      <rect x="48" y="60" width="224" height="8" rx="3" fill="rgba(220,38,38,0.2)"/>
      <line x1="246" y1="8" x2="306" y2="114" stroke="rgba(230,240,255,0.28)" strokeWidth="5" strokeLinecap="round"/>
      {[42,80,118,214].map((x,i) => <g key={i}>
        <circle cx={x} cy={20+i*8} r="10" fill="rgba(255,180,210,0.22)"/>
        <circle cx={x+10} cy={24+i*8} r="7" fill="rgba(255,150,190,0.18)"/>
      </g>)}
      <polygon points="160,62 104,120 216,120" fill="rgba(240,248,255,0.2)"/>
    </>; break;
    case "Egghead": content = <>
      <path d="M54 112 Q54 22 160 14 Q266 22 266 112Z" fill="rgba(125,211,252,0.12)" stroke="rgba(125,211,252,0.28)" strokeWidth="3"/>
      <ellipse cx="160" cy="112" rx="106" ry="16" fill="rgba(125,211,252,0.14)"/>
      {[40,80,120,160,200,240,280].map(x => <line key={x} x1={x} y1="0" x2={x} y2="120" stroke="rgba(125,211,252,0.08)" strokeWidth="1"/>)}
      {[30,60,90].map(y => <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(125,211,252,0.08)" strokeWidth="1"/>)}
      <rect x="126" y="42" width="68" height="52" rx="10" fill="rgba(96,165,250,0.18)" stroke="rgba(125,211,252,0.34)" strokeWidth="2"/>
      <circle cx="82" cy="34" r="22" fill="none" stroke="rgba(125,211,252,0.24)" strokeWidth="4"/>
      <circle cx="250" cy="40" r="18" fill="none" stroke="rgba(125,211,252,0.22)" strokeWidth="4"/>
    </>; break;
    case "Elbaf": content = <>
      <path d="M12 92 Q160 50 308 92 L288 120 H32Z" fill="rgba(140,84,40,0.24)"/>
      <line x1="160" y1="94" x2="160" y2="18" stroke="rgba(170,105,55,0.32)" strokeWidth="6"/>
      <path d="M160 18 L84 48 L84 88 L160 98 L236 88 L236 48Z" fill="rgba(190,55,42,0.18)" stroke="rgba(255,220,110,0.2)" strokeWidth="3"/>
      <line x1="112" y1="60" x2="208" y2="60" stroke="rgba(255,220,110,0.28)" strokeWidth="4"/>
      <line x1="252" y1="16" x2="252" y2="88" stroke="rgba(180,180,190,0.34)" strokeWidth="7" strokeLinecap="round"/>
      <path d="M232 18 Q218 42 232 62 Q256 42 244 18Z" fill="rgba(210,210,225,0.24)"/>
    </>; break;
    case "Baratie": content = <>
      <path d="M38 92 Q160 54 282 92 L260 120 H60Z" fill="rgba(170,100,45,0.26)"/>
      <rect x="110" y="38" width="100" height="48" rx="6" fill="rgba(245,220,160,0.18)"/>
      <rect x="110" y="30" width="100" height="12" rx="3" fill="rgba(220,60,40,0.2)"/>
      <ellipse cx="160" cy="24" rx="42" ry="18" fill="rgba(255,255,255,0.22)"/>
      <rect x="138" y="8" width="44" height="22" rx="4" fill="rgba(255,255,255,0.2)"/>
    </>; break;
    default: content = null;
  }
  if (!content) return null;
  return (
    <div className="month-lore-scene" aria-hidden="true">
      <svg viewBox="0 0 320 120" preserveAspectRatio="none">
        {content}
      </svg>
    </div>
  );
}

function ThousandSunny({ size = 72, flipX = false }) {
  const rays = [0,45,90,135,180,225,270,315];
  const maneAngles = [-45,-15,15,45,75,105,135,165,-75,-105,-135,-165];
  return (
    <svg width={size} height={Math.round(size*1.35)} viewBox="-35 -52 70 70"
      style={{ transform: flipX ? 'scaleX(-1)' : 'none',
        filter:'drop-shadow(0 4px 14px rgba(0,0,0,0.7)) drop-shadow(0 0 8px rgba(249,115,22,0.35))',
        overflow:'visible' }} aria-hidden="true">
      <defs>
        <radialGradient id="hullG" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#8B5e3c"/>
          <stop offset="100%" stopColor="#4a1e08"/>
        </radialGradient>
      </defs>
      {/* Wake */}
      <ellipse cx="-26" cy="15" rx="9" ry="3.5" fill="rgba(100,180,255,0.18)"/>
      <path d="M-32 10 Q-23 7 -32 4" stroke="rgba(140,210,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M-30 17 Q-19 12 -30 7" stroke="rgba(140,210,255,0.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Hull shadow */}
      <ellipse cx="0" cy="22" rx="28" ry="4" fill="rgba(0,0,0,0.35)"/>
      {/* Hull body */}
      <path d="M-28 6 L28 6 L24 18 Q0 23 -24 18 Z" fill="url(#hullG)"/>
      <path d="M-27 6 L27 6 L24 13 Q0 16 -24 13 Z" fill="#7a3f12"/>
      {/* Green stripe */}
      <path d="M-26 7 L26 7 L23 11 Q0 14 -23 11 Z" fill="#1e7a34"/>
      {/* Deck */}
      <rect x="-22" y="-3" width="44" height="9" rx="2" fill="#8B4520"/>
      <line x1="-22" y1="1.5" x2="22" y2="1.5" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6"/>
      <line x1="-12" y1="-3" x2="-12" y2="6" stroke="rgba(0,0,0,0.1)" strokeWidth="0.4"/>
      <line x1="12" y1="-3" x2="12" y2="6" stroke="rgba(0,0,0,0.1)" strokeWidth="0.4"/>
      {/* Porthole windows */}
      <circle cx="-10" cy="9.5" r="2.3" fill="rgba(80,160,220,0.25)" stroke="rgba(180,120,40,0.8)" strokeWidth="0.8"/>
      <circle cx="10" cy="9.5" r="2.3" fill="rgba(80,160,220,0.25)" stroke="rgba(180,120,40,0.8)" strokeWidth="0.8"/>
      {/* Sun Face figurehead (bow = right) — was lion, now the iconic sun */}
      <g transform="translate(33,6)">
        {/* Outer glow ring */}
        <circle cx="0" cy="0" r="13" fill="#f97316" opacity="0.15"/>
        {/* Rays */}
        {rays.map((a,i) => (
          <line key={i}
            x1={Math.cos(a*Math.PI/180)*7.5} y1={Math.sin(a*Math.PI/180)*7.5}
            x2={Math.cos(a*Math.PI/180)*12}  y2={Math.sin(a*Math.PI/180)*12}
            stroke="#f97316" strokeWidth="2.6" strokeLinecap="round"/>
        ))}
        {/* Sun body */}
        <circle cx="0" cy="0" r="7.8" fill="#f97316"/>
        <circle cx="0" cy="0" r="6.2" fill="#FFD700"/>
        {/* Eyes */}
        <circle cx="-2.1" cy="-1.5" r="1.4" fill="#2a1400"/>
        <circle cx="2.1"  cy="-1.5" r="1.4" fill="#2a1400"/>
        <circle cx="-1.7" cy="-1.9" r="0.5" fill="white" opacity="0.75"/>
        <circle cx="2.5"  cy="-1.9" r="0.5" fill="white" opacity="0.75"/>
        {/* Smile */}
        <path d="M-2.6 1.6 Q0 4.2 2.6 1.6" stroke="#2a1400" strokeWidth="1.2" fill="none"/>
        {/* Blush cheeks */}
        <circle cx="-3.8" cy="0.6" r="2.2" fill="#ff8c42" opacity="0.55"/>
        <circle cx="3.8"  cy="0.6" r="2.2" fill="#ff8c42" opacity="0.55"/>
      </g>
      {/* Stern */}
      <path d="M-28 6 Q-34 10 -28 17" fill="#3a1408" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5"/>
      <rect x="-31" y="2" width="5" height="9" rx="2.5" fill="#5a2d0c"/>
      {/* === MASTS === */}
      {/* Mizzenmast (rear) */}
      <line x1="-14" y1="-3" x2="-14" y2="-24" stroke="#6b3a12" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="-24" y1="-16" x2="-4" y2="-16" stroke="#6b3a12" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M-14 -22 L-4 -16 L-5 -3 L-14 -3Z" fill="rgba(245,235,200,0.82)" stroke="rgba(160,130,60,0.3)" strokeWidth="0.5"/>
      <path d="M-14 -22 L-24 -16 L-22 -3 L-14 -3Z" fill="rgba(238,228,192,0.75)" stroke="rgba(160,130,60,0.25)" strokeWidth="0.5"/>
      {/* Main mast */}
      <line x1="2" y1="-3" x2="2" y2="-48" stroke="#6b3a12" strokeWidth="3.2" strokeLinecap="round"/>
      <line x1="-19" y1="-36" x2="21" y2="-36" stroke="#6b3a12" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="-17" y1="-22" x2="19" y2="-22" stroke="#6b3a12" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Main sails */}
      <path d="M2 -46 L21 -36 L19 -22 L2 -18Z" fill="rgba(255,252,228,0.94)" stroke="rgba(160,130,60,0.3)" strokeWidth="0.5"/>
      <path d="M2 -46 L-17 -36 L-15 -22 L2 -18Z" fill="rgba(248,244,218,0.9)" stroke="rgba(160,130,60,0.25)" strokeWidth="0.5"/>
      <path d="M2 -18 L19 -22 L16 -3 L2 -3Z" fill="rgba(252,248,224,0.88)" stroke="rgba(160,130,60,0.2)" strokeWidth="0.5"/>
      <path d="M2 -18 L-15 -22 L-12 -3 L2 -3Z" fill="rgba(245,240,212,0.84)" stroke="rgba(160,130,60,0.2)" strokeWidth="0.5"/>
      {/* Straw Hat emblem on main sail — Luffy's iconic hat */}
      {/* Brim — wide, flat */}
      <ellipse cx="12" cy="-25.5" rx="13.5" ry="3.8" fill="#d4a843" stroke="#9a7520" strokeWidth="0.6"/>
      <ellipse cx="12" cy="-25.8" rx="11"   ry="2.4" fill="#e8bc50" opacity="0.6"/>
      {/* Crown */}
      <path d="M2.8 -25.8 Q1.5 -38.5 12 -39.5 Q22.5 -38.5 21.2 -25.8Z"
        fill="#e8bc50" stroke="#9a7520" strokeWidth="0.6"/>
      {/* Crown highlight */}
      <path d="M5.5 -26.5 Q4.5 -37 12 -38 Q19.5 -37 18.5 -26.5Z"
        fill="rgba(255,235,140,0.32)"/>
      {/* Red band */}
      <path d="M3.5 -30 Q12 -32.5 20.5 -30"
        stroke="#cc2200" strokeWidth="3.8" fill="none" strokeLinecap="butt"/>
      {/* Straw texture */}
      <line x1="5.5"  y1="-26" x2="7"    y2="-38" stroke="rgba(100,60,0,0.15)" strokeWidth="0.5"/>
      <line x1="9"    y1="-25.5" x2="9.5"  y2="-39" stroke="rgba(100,60,0,0.12)" strokeWidth="0.5"/>
      <line x1="12"   y1="-25.5" x2="12"   y2="-39.5" stroke="rgba(100,60,0,0.10)" strokeWidth="0.5"/>
      <line x1="15"   y1="-25.5" x2="14.5" y2="-39" stroke="rgba(100,60,0,0.12)" strokeWidth="0.5"/>
      <line x1="18.5" y1="-26" x2="17"   y2="-38" stroke="rgba(100,60,0,0.15)" strokeWidth="0.5"/>
      {/* Foremast */}
      <line x1="18" y1="-3" x2="18" y2="-22" stroke="#6b3a12" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="10" y1="-14" x2="28" y2="-14" stroke="#6b3a12" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M18 -20 L28 -14 L26 -3 L18 -3Z" fill="rgba(252,246,218,0.85)" stroke="rgba(160,130,60,0.25)" strokeWidth="0.5"/>
      <path d="M18 -20 L10 -14 L12 -3 L18 -3Z" fill="rgba(245,238,208,0.8)" stroke="rgba(160,130,60,0.2)" strokeWidth="0.5"/>
      {/* Crow's nest */}
      <path d="M-4 -48 L8 -48 L9 -45 L-5 -45Z" fill="#7a4520"/>
      <rect x="-4" y="-48" width="12" height="3" rx="1" fill="#8B5030"/>
      {/* Jolly Roger flag */}
      <line x1="2" y1="-48" x2="-3" y2="-52" stroke="#5a3010" strokeWidth="1.6"/>
      <path d="M-3 -52 L-15 -49 L-3 -46Z" fill="#0d0d0d"/>
      <circle cx="-9" cy="-49" r="2" fill="white" opacity="0.65"/>
      <path d="M-12.5 -47 L-5.5 -47" stroke="white" strokeWidth="0.8" opacity="0.55"/>
      {/* Anchor on stern — SVG anchor shape */}
      <g transform="translate(-19,12)" opacity="0.5">
        <circle cx="0" cy="-3" r="2" fill="none" stroke="rgba(200,160,0,0.8)" strokeWidth="0.8"/>
        <line x1="0" y1="-1" x2="0" y2="4" stroke="rgba(200,160,0,0.8)" strokeWidth="0.8"/>
        <path d="M-3 -3 L3 -3" stroke="rgba(200,160,0,0.8)" strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M-3 4 Q0 6 3 4" stroke="rgba(200,160,0,0.8)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function SeaIsleSvg({ name = "", variant = 0 }) {
  const cloudsRight = variant % 2 === 0;
  const lore = (() => {
    switch (name) {
      case "Shells Town": return <>
        <rect x="26" y="17" width="14" height="20" rx="1.5" fill="#d8e7f8" stroke="#5b89b8" strokeWidth="1"/>
        <rect x="24" y="14" width="18" height="5" rx="1" fill="#5b89b8"/>
        <line x1="33" y1="18" x2="33" y2="34" stroke="#3f6f9e" strokeWidth="1.4"/>
        <path d="M27,27 Q33,32 39,27" fill="none" stroke="#3f6f9e" strokeWidth="1.4"/>
      </>;
      case "Gecko Islands": return <>
        <polygon points="19,27 31,16 43,27" fill="#b95f2f"/>
        <rect x="22" y="27" width="18" height="12" rx="1" fill="#ead39a"/>
        <circle cx="48" cy="26" r="9" fill="#1f8f2b"/>
        <rect x="47" y="28" width="3" height="12" fill="#7a4520"/>
      </>;
      case "Loguetown": return <>
        <rect x="28" y="11" width="4" height="27" fill="#8a6032"/>
        <rect x="28" y="11" width="18" height="4" fill="#8a6032"/>
        <line x1="40" y1="15" x2="40" y2="27" stroke="#5f3a1d" strokeWidth="1.3"/>
        <rect x="15" y="33" width="34" height="4" rx="1" fill="#8a6032"/>
      </>;
      case "Cactus Island": return <>
        <rect x="17" y="21" width="7" height="18" rx="3.5" fill="#157a32"/>
        <rect x="38" y="17" width="7" height="22" rx="3.5" fill="#157a32"/>
        <circle cx="22" cy="18" r="4" fill="#f59e0b"/>
        <circle cx="42" cy="14" r="4" fill="#f59e0b"/>
        <rect x="28" y="29" width="10" height="9" rx="2" fill="#8b5a2b"/>
      </>;
      case "Drum Island": return <>
        <polygon points="31,5 12,38 50,38" fill="#7b8da0"/>
        <polygon points="31,5 22,20 40,20" fill="#f5fbff"/>
        <circle cx="48" cy="16" r="4" fill="#f8fafc"/>
        <circle cx="14" cy="28" r="3" fill="#f8fafc"/>
      </>;
      case "Sandy Island": return <>
        <polygon points="31,9 12,39 50,39" fill="#d6a040"/>
        <polygon points="31,9 24,22 38,22" fill="#f6d37a"/>
        <circle cx="49" cy="14" r="5" fill="#ffd166"/>
        <path d="M12,38 Q25,32 50,38" fill="none" stroke="#b98028" strokeWidth="1.6"/>
      </>;
      case "Jaya": return <>
        <circle cx="30" cy="24" r="12" fill="#243b24"/>
        <circle cx="26" cy="23" r="2" fill="#e8e2c7"/>
        <circle cx="34" cy="23" r="2" fill="#e8e2c7"/>
        <path d="M25,30 Q30,34 35,30" stroke="#e8e2c7" strokeWidth="1.2" fill="none"/>
        <rect x="45" y="16" width="3" height="22" fill="#7a4520"/>
      </>;
      case "Water 7": return <>
        <rect x="18" y="17" width="26" height="21" rx="2" fill="#b9d6e8"/>
        <polygon points="18,17 31,9 44,17" fill="#8b5a2b"/>
        <path d="M12,38 Q23,31 31,36 Q40,31 50,38" fill="none" stroke="#4fc3f7" strokeWidth="2"/>
        <rect x="25" y="23" width="5" height="5" fill="#e0f7ff"/>
        <rect x="34" y="23" width="5" height="5" fill="#e0f7ff"/>
      </>;
      case "Thriller Bark": return <>
        <path d="M45,7 A10,10 0 1 0 45,27 A7,7 0 1 1 45,7Z" fill="#e8ecc8"/>
        <rect x="17" y="28" width="28" height="12" fill="#36214f"/>
        <rect x="22" y="20" width="6" height="11" fill="#36214f"/>
        <rect x="36" y="20" width="6" height="11" fill="#36214f"/>
        <path d="M17,28 Q31,17 45,28" fill="#4c2a70"/>
      </>;
      case "Sabaody Archipelago": return <>
        <path d="M22,39 Q22,28 27,17" stroke="#2f8f3d" strokeWidth="3" fill="none"/>
        <ellipse cx="28" cy="15" rx="12" ry="8" fill="#30a246"/>
        <circle cx="46" cy="18" r="7" fill="none" stroke="#b9f6ff" strokeWidth="1.7"/>
        <circle cx="42" cy="31" r="5" fill="none" stroke="#b9f6ff" strokeWidth="1.4"/>
        <circle cx="51" cy="30" r="4" fill="none" stroke="#b9f6ff" strokeWidth="1.2"/>
      </>;
      case "Fish-Man Island": return <>
        <path d="M17,39 Q17,25 23,19 Q20,13 26,10" stroke="#ff7a66" strokeWidth="3" fill="none"/>
        <ellipse cx="42" cy="27" rx="10" ry="6" fill="#5eead4"/>
        <polygon points="51,27 58,22 58,32" fill="#5eead4"/>
        <circle cx="39" cy="25" r="1.7" fill="#073b4c"/>
        <circle cx="30" cy="13" r="4" fill="none" stroke="#bae6fd" strokeWidth="1.3"/>
      </>;
      case "Punk Hazard": return <>
        <path d="M11,38 L31,9 L31,40Z" fill="#93c5fd"/>
        <path d="M51,38 L31,9 L31,40Z" fill="#ef4444"/>
        <path d="M18,18 L23,13 L21,24 L27,22" stroke="#e0f2fe" strokeWidth="1.5" fill="none"/>
        <path d="M43,15 Q50,23 41,31 Q45,23 37,18" fill="#fb923c"/>
      </>;
      case "Dressrosa": return <>
        <path d="M15,39 L15,25 Q15,16 31,16 Q47,16 47,25 L47,39" fill="none" stroke="#e5b96f" strokeWidth="2.3"/>
        {[20,31,42].map((x,i)=><path key={i} d={`M${x},39 L${x},27`} stroke="#e5b96f" strokeWidth="1.7"/>)}
        <circle cx="49" cy="13" r="4" fill="#fb7185"/>
        <circle cx="44" cy="17" r="4" fill="#f9a8d4"/>
        <circle cx="50" cy="19" r="4" fill="#fb7185"/>
      </>;
      case "Zou": return <>
        <rect x="20" y="20" width="7" height="19" rx="3" fill="#8c7a68"/>
        <rect x="37" y="20" width="7" height="19" rx="3" fill="#8c7a68"/>
        <ellipse cx="32" cy="20" rx="20" ry="9" fill="#6b8f4e"/>
        <path d="M43,19 Q55,17 51,28" stroke="#8c7a68" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </>;
      case "Whole Cake Island": return <>
        <rect x="16" y="29" width="30" height="10" rx="2" fill="#f9a8d4"/>
        <ellipse cx="31" cy="29" rx="15" ry="4" fill="#fecdd3"/>
        <rect x="18" y="20" width="26" height="10" rx="2" fill="#fed7aa"/>
        <ellipse cx="31" cy="20" rx="13" ry="4" fill="#ffedd5"/>
        <rect x="29" y="11" width="4" height="9" rx="1" fill="#fef3c7"/>
        <ellipse cx="31" cy="10" rx="3" ry="4" fill="#fb923c"/>
      </>;
      default: return null;
    }
  })();
  return (
    <svg width="62" height="50" viewBox="0 0 62 50" className="sea-isle-svg" aria-hidden="true">
      <ellipse cx="31" cy="42" rx="26" ry="7.5" fill="#c8a850" opacity="0.52"/>
      <ellipse cx="31" cy="40" rx="23" ry="6.5" fill="#267018"/>
      <ellipse cx="31" cy="38" rx="20" ry="5.2" fill="#339922"/>
      {!lore && variant % 4 === 0 && <>
        <rect x="29.5" y="15" width="3" height="23" rx="1.5" fill="#7a4520"/>
        <ellipse cx="30" cy="15" rx="10" ry="6" fill="#1d7a11" transform="rotate(-14 30 15)"/>
        <ellipse cx="31" cy="13" rx="9" ry="5" fill="#28a018" transform="rotate(9 31 13)"/>
      </>}
      {!lore && variant % 4 === 1 && <>
        <polygon points="20,36 25,14 30,36" fill="#124e0a"/>
        <polygon points="20,28 25,12 30,28" fill="#1a7a12"/>
        <rect x="24" y="36" width="2" height="4" fill="#7a4520"/>
        <polygon points="30,36 35,13 40,36" fill="#124e0a"/>
        <polygon points="30,28 35,10 40,28" fill="#1a7a12"/>
        <rect x="34" y="36" width="2" height="4" fill="#7a4520"/>
      </>}
      {!lore && variant % 4 === 2 && <>
        <polygon points="31,6 17,36 45,36" fill="#6b5e50"/>
        <polygon points="31,6 24,22 38,22" fill="#8a7a68"/>
        <polygon points="31,6 27,15 35,15" fill="rgba(255,255,255,0.88)"/>
        <polygon points="14,36 17,26 20,36" fill="#124e0a"/>
      </>}
      {!lore && variant % 4 === 3 && <>
        <circle cx="19" cy="26" r="9" fill="#124e0a"/>
        <circle cx="31" cy="20" r="11" fill="#1a7a12"/>
        <circle cx="43" cy="26" r="9" fill="#124e0a"/>
        <circle cx="29" cy="19" r="4" fill="rgba(80,220,60,0.28)"/>
      </>}
      {lore}
      <ellipse cx={cloudsRight ? 47 : 15} cy="8" rx="9" ry="5" fill="white" opacity="0.82"/>
      <ellipse cx={cloudsRight ? 42 : 10} cy="9" rx="7" ry="4.5" fill="white" opacity="0.82"/>
      <ellipse cx={cloudsRight ? 52 : 20} cy="9" rx="5.5" ry="4" fill="white" opacity="0.76"/>
    </svg>
  );
}

function CalendarPage({ data, sel, onSel, start, totalDays }) {
  const isCompactPhone = useMediaQuery("(max-width: 560px)");
  const today = useTodayRolloverKey();
  const monthRefs = useRef({});
  const startRef = useRef(null);
  const startXRef = useRef(null);
  const mapContainerRef = useRef(null);
  const svgPathElemRef = useRef(null);
  const ddayRef = useRef(null);

  // ── One Piece toggle ──────────────────────────────────────────
  const [voyageMode, setVoyageMode] = useState(
    () => localStorage.getItem('op_voyage_mode') !== 'off'
  );
  useEffect(() => {
    document.body.classList.toggle('voyage-plain', !voyageMode);
    return () => document.body.classList.remove('voyage-plain');
  }, [voyageMode]);
  const toggleVoyageMode = useCallback(() => {
    setVoyageMode(prev => {
      const next = !prev;
      localStorage.setItem('op_voyage_mode', next ? 'on' : 'off');
      return next;
    });
  }, []);
  const scrollToMonth = useCallback((monthKey) => {
    const el = monthRefs.current[monthKey];
    if (!el) return;
    const scroller = el.closest(".main") || document.scrollingElement || document.documentElement;
    const scrollerRect = scroller.getBoundingClientRect?.() || { top: 0 };
    const elRect = el.getBoundingClientRect();
    const currentTop = "scrollTop" in scroller ? scroller.scrollTop : window.scrollY;
    const headerH = document.querySelector(".mobile-header")?.offsetHeight || 64;
    const targetTop = currentTop + elRect.top - scrollerRect.top - Math.max(headerH + 16, window.innerHeight * 0.12);
    scroller.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }, []);
  // Month islands are fixed by calendar month, not by array index.
  const MONTH_ISLANDS = {
    5: "Arlong Park",
    6: "Skypiea",
    7: "Enies Lobby",
    8: "Marineford",
    9: "Wano",
    10: "Egghead",
    11: "Elbaf",
  };
  const PRE_MAY_ISLANDS = {
    1: "Shells Town",
    2: "Gecko Islands",
    3: "Loguetown",
    4: "Baratie",
  };

  const PRE_GRAND_LINE_ISLES = [
    { name:"Shells Town", incident:"Luffy defied Captain Morgan and Zoro joined the crew.", advice:"CAT move: pick your first strong ally today. Do one timed set and review every mistake instead of just counting attempts." },
    { name:"Gecko Islands", incident:"Usopp protected Syrup Village and the crew earned the Going Merry.", advice:"CAT move: protect the basics. Revise one weak concept until it feels boringly clear, then solve five clean questions from it." },
    { name:"Loguetown", incident:"At Roger's execution town, Luffy survived Buggy and Smoker and still chose the Grand Line.", advice:"CAT move: before a new phase, clean your error log. Carry only lessons forward, not panic." },
  ];
  const PARADISE_ISLES = [
    { name:"Cactus Island", incident:"Whiskey Peak welcomed the crew as guests, then revealed the Baroque Works trap.", advice:"CAT move: traps look familiar. In QA/LRDI, pause before the obvious route and check hidden constraints." },
    { name:"Drum Island", incident:"Luffy climbed a winter mountain to save Nami and Chopper joined the crew.", advice:"CAT move: when energy is low, reduce the climb. Do one focused 45-minute block with full review." },
    { name:"Sandy Island", incident:"In Alabasta, Luffy beat Crocodile after repeated failure and stopped a civil war.", advice:"CAT move: if a section keeps beating you, change the method. Redo old wrong questions by topic, not by mock." },
    { name:"Jaya", incident:"Mock Town laughed at dreams, but the path to Skypiea was real.", advice:"CAT move: ignore noise after a bad mock. Extract three fixes, schedule them, and move." },
    { name:"Water 7", incident:"The crew fractured over the Going Merry, then rebuilt around hard truth and Franky.", advice:"CAT move: audit honestly. If your strategy is broken, rebuild it now instead of emotionally defending it." },
    { name:"Thriller Bark", incident:"Nightmare Luffy borrowed strength, beat Moria, and Brook joined.", advice:"CAT move: borrow structure. Use templates for RC summaries, LRDI tables, and QA formula recall until speed returns." },
    { name:"Sabaody Archipelago", incident:"Luffy punched a Celestial Dragon and the crew was scattered by Kuma.", advice:"CAT move: pressure can scatter your mind. Practice one sectional under strict time and train recovery after setbacks." },
  ];
  const NEW_WORLD_ISLES = [
    { name:"Fish-Man Island", incident:"Ten thousand meters under the sea, Luffy defeated Hody and claimed the island.", advice:"CAT move: deep work wins. Take one ugly topic underwater today and stay with it until the fear drops." },
    { name:"Punk Hazard", incident:"Fire and ice split the island while Caesar's experiments poisoned children.", advice:"CAT move: split extremes. For strong topics, chase speed; for weak topics, chase accuracy first." },
    { name:"Dressrosa", incident:"Gear 4 broke Doflamingo's rule and the Straw Hat Grand Fleet formed.", advice:"CAT move: unlock your Gear 4 by combining revision plus mocks. One without the other is incomplete." },
    { name:"Zou", incident:"On a walking elephant, the crew learned about Road Poneglyphs.", advice:"CAT move: find your Road Poneglyphs. Identify the 4-5 score levers that actually move your percentile." },
    { name:"Whole Cake Island", incident:"Luffy crashed Big Mom's wedding, saved Sanji, and beat Katakuri with Snakeman.", advice:"CAT move: adapt mid-fight. If a mock pattern changes, do not freeze. Switch routes and protect accuracy." },
  ];

  const seaPassageFor = (monthNum) => {
    if (monthNum === 5) return PARADISE_ISLES.slice(0, 2);
    if (monthNum === 6) return PARADISE_ISLES.slice(2, 5);
    if (monthNum === 7) return PARADISE_ISLES.slice(5, 7);
    if (monthNum === 8) return NEW_WORLD_ISLES.slice(0, 2);
    if (monthNum === 9) return NEW_WORLD_ISLES.slice(2, 3);
    if (monthNum === 10) return NEW_WORLD_ISLES.slice(3, 4);
    return [];
  };

  const seaIsleScatter = (phase, idx) => {
    const lanes = {
      east: ["7%", "41%", "18%"],
      paradise: ["6%", "56%", "17%", "66%", "31%", "50%", "12%"],
      newWorld: ["9%", "61%", "23%", "52%", "35%"],
    };
    return lanes[phase][idx % lanes[phase].length];
  };

  const seaRocks = useMemo(() => ([
    { x: "5%", y: "10%", s: 0.46, r: -8 },
    { x: "87%", y: "12%", s: 0.42, r: 12 },
    { x: "3%", y: "26%", s: 0.52, r: -18 },
    { x: "91%", y: "30%", s: 0.58, r: 7 },
    { x: "7%", y: "43%", s: 0.44, r: 15 },
    { x: "88%", y: "48%", s: 0.5, r: -6 },
    { x: "4%", y: "64%", s: 0.62, r: -12 },
    { x: "92%", y: "68%", s: 0.52, r: 18 },
    { x: "10%", y: "82%", s: 0.42, r: 9 },
    { x: "84%", y: "86%", s: 0.62, r: -10 },
    { x: "42%", y: "11%", s: 0.34, r: 14 },
    { x: "55%", y: "91%", s: 0.38, r: -16 },
    { x: "23%", y: "38%", s: 0.32, r: 10 },
    { x: "70%", y: "56%", s: 0.36, r: -14 },
  ]), []);

  const seaCyclones = useMemo(() => ([
    { x: "2%", y: "57%", s: 0.22 },
    { x: "88%", y: "67%", s: 0.2 },
    { x: "82%", y: "91%", s: 0.18 },
  ]), []);
  const seaMountains = useMemo(() => ([
    { x: "4%", y: "72%", s: 0.16 },
    { x: "90%", y: "42%", s: 0.12 },
  ]), []);
  const seaReefs = useMemo(() => ([
    { x: "52%", y: "9%", s: 0.6 },
    { x: "34%", y: "28%", s: 0.48 },
    { x: "8%", y: "82%", s: 0.56 },
    { x: "60%", y: "62%", s: 0.52 },
  ]), []);


  const [mapNote, setMapNote] = useState("");
  const [mapNotePos, setMapNotePos] = useState({ left: "50%", top: 120 });
  const [pathState, setPathState] = useState({ w: 600, h: 1200, d: '' });
  const lastPathRef = useRef('');
  const [shipPos, setShipPos] = useState({ x: 50, y: 50, flip: false });

  const lastPrepDay = useMemo(() => {
    const d = new Date(EXAM_DATE);
    d.setDate(d.getDate() - 1);
    return d;
  }, []);

  const openIslandNote = useCallback((isle, event) => {
    const container = mapContainerRef.current;
    const target = event.currentTarget;
    if (container && target) {
      const c = container.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      const left = Math.max(18, Math.min(c.width - 378, r.left - c.left + r.width / 2 - 180));
      const top = Math.max(18, r.top - c.top - 18);
      setMapNotePos({ left, top });
    }
    setMapNote(isle);
  }, []);

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
    const rawMonths = [];
    for (
      let cursor = new Date(startMonth);
      cursor <= lastPrepDay;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    ) {
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const monthNum = cursor.getMonth() + 1;
      const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}`;
      const monthLabel = cursor.toLocaleDateString("en-IN", { month:"short", year:"numeric" });
      const state = monthKey < today.slice(0,7) ? "past" : monthKey === today.slice(0,7) ? "current" : "future";
      // Show only prep-range days: first month starts from prep start, last month ends at lastPrepDay
      const isFirstMonth = monthStart.getFullYear() === start.getFullYear() && monthStart.getMonth() === start.getMonth();
      const displayStart = isFirstMonth ? new Date(start) : new Date(monthStart);
      const displayEnd   = monthEnd > lastPrepDay ? new Date(lastPrepDay) : new Date(monthEnd);
      const cells = [];
      // Leading blanks based on displayStart's day-of-week for proper grid alignment
      for (let i = 0; i < displayStart.getDay(); i++) cells.push(null);
      for (let d = new Date(displayStart); d <= displayEnd; d.setDate(d.getDate() + 1)) {
        const dk = toLocalDateKey(d);
        const meta = dayMeta.get(dk);
        cells.push(meta ? {...meta, dateNum: d.getDate()} : { k: dk, day: null, isToday: dk===today, status:'', dateNum: d.getDate() });
      }
      rawMonths.push({ key: monthKey, monthNum, label: monthLabel, state, cells });
    }
    // Assign fixed month islands; dividers sit after May and after August.
    return rawMonths.map((m, i) => ({
      ...m,
      island: MONTH_ISLANDS[m.monthNum] || PRE_MAY_ISLANDS[m.monthNum] || `Island ${i + 1}`,
      islandSlug: (MONTH_ISLANDS[m.monthNum] || PRE_MAY_ISLANDS[m.monthNum] || `Island ${i + 1}`)
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      showGrandLine: m.monthNum === 5,
      showRedLine:   m.monthNum === 8,
    }));
  }, [data, start, totalDays, today, lastPrepDay]);

  const voyagePct = useMemo(() => {
    if (!calendarData.length) return 0;
    const now = new Date(today + "T00:00:00");
    if (today >= EXAM_DATE_KEY) return 99.5;
    const currentMonthIdx = calendarData.findIndex(m => m.monthNum === now.getMonth() + 1);
    if (currentMonthIdx < 0) return now < start ? 2 : 92;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthSpan = Math.max(1, monthEnd - monthStart);
    const monthFrac = Math.max(0, Math.min(1, (now - monthStart) / monthSpan));
    const totalSegments = calendarData.length + 1; // start island -> month islands -> Laughtale
    const segmentProgress = currentMonthIdx + 1 + Math.min(0.72, monthFrac * 0.72);
    return Math.max(3, Math.min(96, (segmentProgress / totalSegments) * 100));
  }, [calendarData, start, today]);

  // Build SVG path from island DOM positions
  const buildPath = useCallback(() => {
    const container = mapContainerRef.current;
    if (!container || calendarData.length === 0) return;
    const cRect = container.getBoundingClientRect();
    const W = container.offsetWidth;
    const H = container.scrollHeight || container.clientHeight;
    // Path goes through the gold checkpoint dot at top-center of each island card
    // The dot is at top: -10px on the card, height 14px, so its center = card.top - 3px
    const DOT_OFFSET = 3; // px below card.top = center of the 14px dot (top:-10 + 7 = -3)
    const pts = [];
    if (startXRef.current || startRef.current) {
      const r = (startXRef.current || startRef.current).getBoundingClientRect();
      pts.push({ x: r.left - cRect.left + r.width / 2, y: r.top - cRect.top + r.height / 2 });
    }
    calendarData.forEach(m => {
      const el = monthRefs.current[m.key];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = r.left - cRect.left + r.width / 2;
      const y = r.top  - cRect.top  - DOT_OFFSET;
      pts.push({ x, y });
    });
    if (ddayRef.current) {
      const r = ddayRef.current.getBoundingClientRect();
      pts.push({ x: r.left - cRect.left + r.width/2, y: r.top - cRect.top - DOT_OFFSET });
    }
    if (pts.length < 2) return;
    const tension = 0.42;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[Math.max(0, i-2)], p1 = pts[i-1], p2 = pts[i], p3 = pts[Math.min(pts.length-1, i+1)];
      const cp1x = p1.x + (p2.x - p0.x)*tension/2, cp1y = p1.y + (p2.y - p0.y)*tension/2;
      const cp2x = p2.x - (p3.x - p1.x)*tension/2, cp2y = p2.y - (p3.y - p1.y)*tension/2;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    if (lastPathRef.current === d) return;
    lastPathRef.current = d;
    const nextW = W;
    const nextH = Math.max(H + 100, 400);
    setPathState(prev =>
      prev.w === nextW && prev.h === nextH && prev.d === d
        ? prev
        : { w: nextW, h: nextH, d }
    );
  }, [calendarData]);

  useEffect(() => {
    const h = () => setTimeout(buildPath, 180);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [buildPath]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || !voyageMode) return undefined;
    let raf = 0;
    const rebuild = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(buildPath);
    };
    rebuild();
    const observer = new ResizeObserver(rebuild);
    observer.observe(container);
    Object.values(monthRefs.current).forEach(el => el && observer.observe(el));
    if (startRef.current) observer.observe(startRef.current);
    if (startXRef.current) observer.observe(startXRef.current);
    if (ddayRef.current) observer.observe(ddayRef.current);
    const settledTimer = setTimeout(rebuild, 350);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settledTimer);
      observer.disconnect();
    };
  }, [buildPath, voyageMode, calendarData.length]);

  // Position ship along path
  useEffect(() => {
    if (!svgPathElemRef.current || !pathState.d) return;
    try {
      const totalLen = svgPathElemRef.current.getTotalLength();
      if (totalLen < 1) return;
      const pct = Math.max(0.005, Math.min(0.995, voyagePct/100));
      const pt = svgPathElemRef.current.getPointAtLength(totalLen * pct);
      const delta = 5;
      const ptB = svgPathElemRef.current.getPointAtLength(Math.max(0, totalLen*pct - delta));
      const ptF = svgPathElemRef.current.getPointAtLength(Math.min(totalLen, totalLen*pct + delta));
      setShipPos({ x: pt.x, y: pt.y, flip: ptF.x - ptB.x < 0 });
    } catch(e) {}
  }, [pathState.d, voyagePct]);

  return (
    <div className={`page calendar-page${voyageMode ? "" : " cal-plain-mode"}`}>
      <div className="page-header cal-pg-header">
        <div>
          <div className="page-title">{totalDays} Days</div>
          <div className="page-sub">Every cell is a choice. Nov 29 is the day.</div>
        </div>
        {/* ── One Piece / Grid toggle ── */}
        <button type="button" className={`op-mode-toggle ${voyageMode ? "opm-on" : "opm-off"}`}
          onClick={toggleVoyageMode} title="Switch calendar theme">
          <span className="opm-icon">{voyageMode ? "⚓" : "📅"}</span>
          <span className="opm-track">
            <span className="opm-knob"/>
          </span>
          <span className="opm-label">{voyageMode ? "One Piece" : "Grid"}</span>
        </button>
      </div>
      <div className="sections">
        <div className="month-strip">
          {calendarData.map(m => (
            <button key={m.key} type="button" className={`month-chip ${m.state}`}
              onClick={() => scrollToMonth(m.key)}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="calendar-legend">
          {[
            {cls:"done",lbl:"All targets met"},
            {cls:"partial",lbl:"Partial"},
            {cls:"cat-app",lbl:"CAT application pending"},
            {cls:"push",lbl:"Final push"},
            {cls:"empty",lbl:"No entry"},
          ].map(l => (
            <div key={l.lbl} className="calendar-legend-item">
              <div className={`calendar-legend-swatch ${l.cls}`} />
              <span>{l.lbl}</span>
            </div>
          ))}
        </div>

        {/* ===== VOYAGE SEA MAP (One Piece mode only) ===== */}
        {voyageMode && <div className="calendar-months" ref={mapContainerRef}>
          <div className="sea-celestial" aria-hidden="true">
            {/* ---- SUN (light mode) ---- */}
            <svg className="sea-sun" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="sgA" cx="38%" cy="33%" r="65%">
                  <stop offset="0%" stopColor="#fef3c7"/>
                  <stop offset="35%" stopColor="#fbbf24"/>
                  <stop offset="72%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#b45309"/>
                </radialGradient>
              </defs>
              {/* Soft outer glow halo */}
              <circle cx="50" cy="50" r="46" fill="rgba(251,191,36,0.07)"/>
              {/* 8 main tapered rays */}
              {[0,45,90,135,180,225,270,315].map((deg, i) => {
                const r = deg * Math.PI / 180;
                const tipX = 50 + 46*Math.sin(r), tipY = 50 - 46*Math.cos(r);
                const lA = r - 0.22, rA = r + 0.22;
                const lX = 50 + 26*Math.sin(lA), lY = 50 - 26*Math.cos(lA);
                const rX = 50 + 26*Math.sin(rA), rY = 50 - 26*Math.cos(rA);
                return <polygon key={i} points={`${tipX},${tipY} ${lX},${lY} ${rX},${rY}`}
                  fill="#fbbf24" opacity="0.88"/>;
              })}
              {/* 8 shorter secondary rays */}
              {[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map((deg, i) => {
                const r = deg * Math.PI / 180;
                const tipX = 50 + 37*Math.sin(r), tipY = 50 - 37*Math.cos(r);
                const lA = r - 0.14, rA = r + 0.14;
                const lX = 50 + 26*Math.sin(lA), lY = 50 - 26*Math.cos(lA);
                const rX = 50 + 26*Math.sin(rA), rY = 50 - 26*Math.cos(rA);
                return <polygon key={i} points={`${tipX},${tipY} ${lX},${lY} ${rX},${rY}`}
                  fill="#fcd34d" opacity="0.65"/>;
              })}
              {/* Sun body */}
              <circle cx="50" cy="50" r="24" fill="url(#sgA)"/>
              {/* Aged parchment ring */}
              <circle cx="50" cy="50" r="24" fill="none" stroke="rgba(180,83,9,0.35)" strokeWidth="1.2"/>
              {/* Highlight shimmer */}
              <ellipse cx="42" cy="41" rx="7" ry="5" fill="rgba(255,255,255,0.38)" style={{filter:"blur(2px)"}}/>
              <circle cx="42" cy="41" r="2.5" fill="rgba(255,255,255,0.6)"/>
            </svg>

            {/* ---- MOON (dark mode) ---- */}
            <svg className="sea-moon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="mgA" cx="36%" cy="30%" r="68%">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="42%" stopColor="#e2e8f0"/>
                  <stop offset="100%" stopColor="#94a3b8"/>
                </radialGradient>
                <mask id="cmA">
                  <rect width="100" height="100" fill="black"/>
                  <circle cx="50" cy="50" r="36" fill="white"/>
                  <circle cx="66" cy="42" r="27" fill="black"/>
                </mask>
              </defs>
              {/* Soft glow aura */}
              <circle cx="50" cy="50" r="44" fill="rgba(186,230,253,0.08)"/>
              {/* Moon crescent via mask */}
              <circle cx="50" cy="50" r="36" fill="url(#mgA)" mask="url(#cmA)"/>
              {/* Subtle crater textures */}
              <circle cx="35" cy="38" r="4" fill="rgba(148,163,184,0.28)" mask="url(#cmA)"/>
              <circle cx="44" cy="58" r="2.5" fill="rgba(148,163,184,0.22)" mask="url(#cmA)"/>
              <circle cx="28" cy="55" r="2" fill="rgba(148,163,184,0.18)" mask="url(#cmA)"/>
              {/* Stars nearby */}
              <circle cx="15" cy="20" r="1.6" fill="rgba(255,255,255,0.62)"/>
              <circle cx="82" cy="76" r="1.1" fill="rgba(255,255,255,0.48)"/>
              <circle cx="78" cy="16" r="1.3" fill="rgba(255,255,255,0.55)"/>
              <circle cx="10" cy="70" r="0.9" fill="rgba(255,255,255,0.38)"/>
              <circle cx="88" cy="35" r="0.8" fill="rgba(255,255,255,0.4)"/>
            </svg>
          </div>

          {/* ---- COMPASS ROSE (SVG) ---- */}
          <svg className="sea-compass" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Background — class allows light/dark override via CSS */}
            <circle cx="65" cy="65" r="62" className="compass-bg-fill"/>
            {/* Outer gold ring */}
            <circle cx="65" cy="65" r="61" fill="none" stroke="rgba(255,215,0,0.88)" strokeWidth="2.5"/>
            {/* Middle ring */}
            <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,215,0,0.18)" strokeWidth="0.8"/>
            {/* Inner decorative ring */}
            <circle cx="65" cy="65" r="44" fill="none" stroke="rgba(255,215,0,0.1)" strokeWidth="0.6"/>
            {/* 32 tick marks */}
            {Array.from({length:32},(_,i)=>{
              const angle=(i*360/32)*Math.PI/180;
              const isCard=i%8===0, isMid=i%4===0;
              const r1=isCard?46:isMid?48:50, r2=isCard?54:isMid?52:51;
              return <line key={i}
                x1={65+r1*Math.sin(angle)} y1={65-r1*Math.cos(angle)}
                x2={65+r2*Math.sin(angle)} y2={65-r2*Math.cos(angle)}
                stroke={isCard?"rgba(255,215,0,0.72)":"rgba(255,215,0,0.28)"} strokeWidth={isCard?1.8:0.7}/>;
            })}
            {/* Cardinal cross lines */}
            <line x1="65" y1="11" x2="65" y2="119" stroke="rgba(255,215,0,0.2)" strokeWidth="0.7"/>
            <line x1="11" y1="65" x2="119" y2="65" stroke="rgba(255,215,0,0.2)" strokeWidth="0.7"/>
            {/* N arrow — red tip (pirate tradition) */}
            <polygon points="65,13 60.5,54 65,47 69.5,54" fill="#ef4444"/>
            <polygon points="65,63 60.5,54 65,47 69.5,54" fill="rgba(255,255,255,0.88)"/>
            {/* S arrow */}
            <polygon points="65,117 60.5,76 65,83 69.5,76" fill="rgba(230,230,235,0.82)"/>
            <polygon points="65,67 60.5,76 65,83 69.5,76" fill="rgba(180,190,200,0.6)"/>
            {/* E arrow */}
            <polygon points="117,65 76,60.5 83,65 76,69.5" fill="rgba(230,230,235,0.82)"/>
            <polygon points="67,65 76,60.5 83,65 76,69.5" fill="rgba(180,190,200,0.6)"/>
            {/* W arrow */}
            <polygon points="13,65 54,60.5 47,65 54,69.5" fill="rgba(230,230,235,0.82)"/>
            <polygon points="63,65 54,60.5 47,65 54,69.5" fill="rgba(180,190,200,0.6)"/>
            {/* Center jewel */}
            <circle cx="65" cy="65" r="5.5" fill="rgba(255,215,0,0.95)" stroke="rgba(120,85,10,0.5)" strokeWidth="0.8"/>
            <circle cx="65" cy="65" r="2.5" fill="#7c5c0a"/>
            {/* Cardinal labels */}
            <text x="65" y="8" textAnchor="middle" dominantBaseline="middle" fill="#ef4444" fontSize="13" fontWeight="900" fontFamily="'Trebuchet MS',Georgia,serif" letterSpacing="0">N</text>
            <text x="65" y="126" textAnchor="middle" dominantBaseline="middle" fill="#ffe66d" fontSize="11" fontWeight="900" fontFamily="'Trebuchet MS',Georgia,serif">S</text>
            <text x="125" y="65" textAnchor="middle" dominantBaseline="middle" fill="#ffe66d" fontSize="11" fontWeight="900" fontFamily="'Trebuchet MS',Georgia,serif">E</text>
            <text x="5" y="65" textAnchor="middle" dominantBaseline="middle" fill="#ffe66d" fontSize="11" fontWeight="900" fontFamily="'Trebuchet MS',Georgia,serif">W</text>
          </svg>

          {/* SVG Route Path Overlay */}
          {pathState.d && (
            <svg className="voyage-path-svg" width={pathState.w} height={pathState.h} aria-hidden="true">
              <defs>
                <filter id="pathGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="dotGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              {/* Wide glow halo */}
              <path d={pathState.d} fill="none" stroke={isCompactPhone ? "rgba(249,115,22,0.2)" : "rgba(249,115,22,0.1)"} strokeWidth={isCompactPhone ? "24" : "20"} filter="url(#pathGlow)"/>
              {/* Thick soft outer dots */}
              <path d={pathState.d} fill="none" stroke={isCompactPhone ? "rgba(255,193,7,0.42)" : "rgba(249,115,22,0.2)"} strokeWidth={isCompactPhone ? "8" : "6"} strokeDasharray="14 10" strokeLinecap="round"/>
              {/* Main bright dotted line */}
              <path ref={svgPathElemRef} d={pathState.d} fill="none"
                stroke={isCompactPhone ? "rgba(255,154,31,1)" : "rgba(249,115,22,0.9)"} strokeWidth={isCompactPhone ? "4" : "2.8"}
                strokeDasharray="10 7" strokeLinecap="round" filter="url(#dotGlow)"/>
            </svg>
          )}
          {/* Invisible measurement path before SVG is built */}
          {!pathState.d && (
            <svg width="0" height="0" style={{position:'absolute',opacity:0}} aria-hidden="true">
              <path ref={svgPathElemRef} d="M0 0" fill="none"/>
            </svg>
          )}

          {/* Thousand Sunny ship marker */}
          {pathState.d && (
            <div className="voyage-ship-marker" style={{
              position:"absolute", left:shipPos.x, top:shipPos.y,
              transform:"translate(-50%,-50%)", zIndex:10, pointerEvents:"none"
            }} aria-label="Thousand Sunny">
              <div className="voyage-ship-inner">
                {!isCompactPhone && (
                  <div className={`wind-wrap ${shipPos.flip ? 'wind-right' : 'wind-left'}`} aria-hidden="true">
                    <span className="wind-streak ws-1"/>
                    <span className="wind-streak ws-2"/>
                    <span className="wind-streak ws-3"/>
                    <span className="wind-streak ws-4"/>
                    <span className="wind-streak ws-5"/>
                    <span className="wind-streak ws-6"/>
                  </div>
                )}
                <ThousandSunny size={72} flipX={shipPos.flip}/>
                {!isCompactPhone && <div className="ship-label">Thousand Sunny</div>}
              </div>
            </div>
          )}

          {/* Start island */}
          <div className="map-start-island" ref={startRef} aria-label="Windmill Island start">
            <IslandDecor name="Windmill Village"/>
            <div className="map-start-x" ref={startXRef}>X</div>
            <div className="map-start-name">Windmill Island</div>
          </div>

          {/* Map motivation popup */}
          {mapNote && (
            <div className="map-note map-note-chat" style={{left: mapNotePos.left, top: mapNotePos.top}}>
              {typeof mapNote === "string" ? (
                <span>{mapNote}</span>
              ) : (
                <span>
                  <strong>{mapNote.name}</strong>
                  <em>{mapNote.incident}</em>
                  <b>{mapNote.advice}</b>
                </span>
              )}
              <button type="button" onClick={() => setMapNote("")} aria-label="Close">x</button>
            </div>
          )}

          {!isCompactPhone && <div className="sea-rock-layer" aria-hidden="true">
            {seaRocks.map((rock, idx) => (
              <span key={idx} className={`sea-rock sea-rock-${idx % 3}`}
                style={{left: rock.x, top: rock.y, transform: `scale(${rock.s}) rotate(${rock.r}deg)`}} />
            ))}
          </div>}
          {!isCompactPhone && <div className="sea-cyclone-layer" aria-hidden="true">
            {seaCyclones.map((cyclone, idx) => (
              <span key={idx} className={`sea-cyclone sea-cyclone-${idx % 2}`}
                style={{left: cyclone.x, top: cyclone.y, transform: `scale(${cyclone.s})`}} />
            ))}
          </div>}
          {!isCompactPhone && <div className="sea-mountain-layer" aria-hidden="true">
            {seaMountains.map((mountain, idx) => (
              <span key={idx} className={`sea-mountain sea-mountain-${idx % 2}`}
                style={{left: mountain.x, top: mountain.y, transform: `scale(${mountain.s})`}} />
            ))}
          </div>}
          {!isCompactPhone && <div className="sea-reef-layer" aria-hidden="true">
            {seaReefs.map((reef, idx) => (
              <span key={idx} className={`sea-reef sea-reef-${idx % 2}`}
                style={{left: reef.x, top: reef.y, transform: `scale(${reef.s})`}} />
            ))}
          </div>}
          {calendarData[0]?.monthNum >= 5 && (
            <div className="map-route-hint bend-0 pre-grand-passage" aria-label="East Blue islands before Reverse Mountain">
              {PRE_GRAND_LINE_ISLES.map((isle, isleIdx) => (
                <button type="button"
                  key={isle.name}
                  className={`sea-isle story-isle story-isle-${isleIdx % 4} sea-east`}
                  style={{marginLeft: seaIsleScatter("east", isleIdx)}}
                  onClick={(event) => openIslandNote(isle, event)}
                  aria-label={isle.name}>
                  <SeaIsleSvg name={isle.name} variant={isleIdx} />
                  <span className="sea-isle-name">{isle.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Month islands + sea passages */}
          {calendarData.map((month, monthIdx) => (
            <Fragment key={month.key}>
              {/* Island card */}
              <div className={`calendar-month route-${monthIdx % 3} island-theme-${month.islandSlug}`}
                ref={el => { monthRefs.current[month.key] = el }}>
                <IslandDecor name={month.island}/>
                <MonthLoreScene name={month.island}/>
                <div className="calendar-month-title">
                  <span className="island-name">{month.island}</span>
                  <small className="island-month">{month.label}</small>
                </div>
                <div className="calendar-week-head">
                  {["S","M","T","W","T","F","S"].map((d,i) => <span key={`${d}-${i}`}>{d}</span>)}
                </div>
                <div className="calendar-month-grid">
                  {month.cells.map((d,i) => d ? (
                    d.status === 'locked'
                      ? <span key={d.k} className="cal-cell locked">
                          <span className="cal-date-num">{d.dateNum}</span>
                        </span>
                      : <button key={d.k} type="button"
                          className={`cal-cell ${d.status} ${d.isToday?"today":""} ${d.k===sel?"selected":""}`}
                          onClick={() => onSel(d.k)} title={d.day ? `Day ${d.day}` : undefined}>
                          {d.day && <span className="cal-day-num">{d.day}</span>}
                          <span className="cal-date-num">{d.dateNum}</span>
                        </button>
                  ) : <span key={`blank-${i}`} className="cal-cell blank"/>)}
                </div>
              </div>

              {/* Grand Line entrance — after Arlong Park / May */}
              {month.showGrandLine && <GrandLineDivider/>}

              {/* Red Line — massive continental wall, New World begins */}
              {month.showRedLine && <RedLineDivider/>}

              {/* Sea passage — story-ordered small islands between main month islands */}
              {monthIdx < calendarData.length - 1 && (
                <div className={`map-route-hint bend-${monthIdx % 3}`}>
                  {seaPassageFor(month.monthNum).map((isle, isleIdx) => (
                    <button type="button"
                      key={isle.name}
                      className={`sea-isle story-isle ${isle.name === "Zou" ? "story-isle-right story-isle-zou" : ""} story-isle-${isleIdx % 4} ${month.monthNum >= 8 ? "sea-new-world" : "sea-paradise"}`}
                      style={{marginLeft: isle.name === "Zou" ? "68%" : seaIsleScatter(month.monthNum >= 8 ? "newWorld" : "paradise", isleIdx)}}
                      onClick={(event) => openIslandNote(isle, event)}
                      aria-label={isle.name}>
                      <SeaIsleSvg name={isle.name} variant={isleIdx + month.monthNum} />
                      <span className="sea-isle-name">{isle.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </Fragment>
          ))}

          {/* Approach to Laughtale */}
          <div className="map-route-hint bend-1 dday-approach" aria-label="Final islands before Laughtale">
            {[
              { name:"Whole Cake Island", incident:"Luffy crashed Big Mom's wedding, saved Sanji, and beat Katakuri with Snakeman.", advice:"CAT move: adapt mid-fight. If a mock pattern changes, do not freeze. Switch routes and protect accuracy." },
            ].map((isle, isleIdx) => (
                <button type="button"
                  key={isle.name}
                className={`sea-isle story-isle story-isle-right story-isle-${(isleIdx + 1) % 4} sea-new-world`}
                style={{marginLeft: "64%"}}
                onClick={(event) => openIslandNote(isle, event)}
                aria-label={isle.name}>
                <SeaIsleSvg name={isle.name} variant={isleIdx + 12} />
                <span className="sea-isle-name">{isle.name}</span>
              </button>
            ))}
          </div>

          {/* Laughtale — D-Day island */}
          <div ref={ddayRef}
            className={`dday-island${sel===EXAM_DATE_KEY ? " selected" : ""}`}
            onClick={() => onSel(EXAM_DATE_KEY)} role="button" tabIndex={0}>
            <div className="dday-checkpoint" aria-hidden="true" />
            <div className="dday-compass" aria-hidden="true">
              <span>N</span>
            </div>
            <div className="one-piece-watermark" aria-hidden="true">ONE PIECE</div>
            <div className="dday-treasure-pile" aria-hidden="true">
              <svg viewBox="0 0 230 150" width="250" height="164" aria-hidden="true">
                <ellipse cx="122" cy="116" rx="90" ry="24" fill="rgba(255,215,0,0.16)"/>
                <g opacity="0.98">
                  {[36,52,68,84,100,116,132,148,164,180].map((x, i) => (
                    <g key={x} transform={`translate(${x} ${100 - (i % 3) * 8})`}>
                      <ellipse cx="0" cy="0" rx="12" ry="4" fill="#b8860b"/>
                      <ellipse cx="0" cy="-4" rx="12" ry="4" fill="#ffd84a"/>
                      <ellipse cx="0" cy="-8" rx="11" ry="3.6" fill="#d9a318"/>
                    </g>
                  ))}
                </g>
                <g transform="translate(70 46)">
                  <path d="M6 42 Q8 18 45 12 Q82 18 84 42 Z" fill="#8b4513" stroke="#4a250b" strokeWidth="3"/>
                  <rect x="6" y="38" width="78" height="54" rx="7" fill="#8b4513" stroke="#4a250b" strokeWidth="3"/>
                  <path d="M6 42 Q45 58 84 42 L84 54 Q45 70 6 54Z" fill="#a85517" opacity="0.94"/>
                  <rect x="39" y="42" width="14" height="20" rx="3" fill="#ffd84a" stroke="#9a6a08" strokeWidth="2"/>
                  <path d="M14 33 Q45 17 76 33" fill="none" stroke="#ffd84a" strokeWidth="5" opacity="0.84"/>
                  <path d="M18 50 Q45 64 72 50" fill="none" stroke="#ffd84a" strokeWidth="4" opacity="0.72"/>
                </g>
                <g>
                  <polygon points="84,37 93,52 75,52" fill="#38bdf8" stroke="#cffafe" strokeWidth="1.5"/>
                  <polygon points="136,30 146,47 126,47" fill="#ef4444" stroke="#fecaca" strokeWidth="1.5"/>
                  <polygon points="166,58 177,74 155,74" fill="#22c55e" stroke="#bbf7d0" strokeWidth="1.5"/>
                </g>
                <g opacity="0.9">
                  {[20,32,44,190,204,216,58,176].map((x, i) => (
                    <ellipse key={x} cx={x} cy={122 - (i % 2) * 10} rx="13" ry="4" fill={i % 2 ? "#ffd84a" : "#d9a318"}/>
                  ))}
                </g>
                <path d="M22 124 Q84 94 120 110 Q156 91 212 120" fill="none" stroke="rgba(255,230,109,0.62)" strokeWidth="4"/>
              </svg>
            </div>
            <div className="dday-label">Laughtale</div>
            <div className="dday-date">Nov 29</div>
            <div className="dday-copy">The final island. CAT 2026. Claim the treasure.</div>
          </div>

        </div>}{/* end .calendar-months (voyage mode) */}

        {/* ===== PLAIN GRID MODE ===== */}
        {!voyageMode && (
          <div className="plain-cal-wrap">
            {calendarData.map(month => (
              <div key={month.key} className="plain-month-card"
                ref={el => { monthRefs.current[month.key] = el }}>
                <div className="plain-month-hdr">{month.label}</div>
                <div className="calendar-week-head">
                  {["S","M","T","W","T","F","S"].map((d,i) => <span key={`${d}-${i}`}>{d}</span>)}
                </div>
                <div className="calendar-month-grid">
                  {month.cells.map((d,i) => d ? (
                    d.status === 'locked'
                      ? <span key={d.k} className="cal-cell locked">
                          <span className="cal-date-num">{d.dateNum}</span>
                        </span>
                      : <button key={d.k} type="button"
                          className={`cal-cell ${d.status} ${d.isToday?"today":""} ${d.k===sel?"selected":""}`}
                          onClick={() => onSel(d.k)} title={d.day ? `Day ${d.day}` : undefined}>
                          {d.day && <span className="cal-day-num">{d.day}</span>}
                          <span className="cal-date-num">{d.dateNum}</span>
                        </button>
                  ) : <span key={`blank-${i}`} className="cal-cell blank"/>)}
                </div>
              </div>
            ))}
            {/* D-Day in plain mode */}
            <div ref={ddayRef}
              className={`plain-dday${sel===EXAM_DATE_KEY?" selected":""}`}
              onClick={() => onSel(EXAM_DATE_KEY)} role="button" tabIndex={0}>
              <div className="plain-dday-tag">D-DAY</div>
              <div className="plain-dday-date">Nov 29</div>
              <div className="plain-dday-copy">CAT 2026. Go break the exam.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


function ChatPage({ mentorMessages, setMentorMessages, d, totals, dl, dayNum, mode, userInitials, userName, userId, startDate, interviewDate, catResult, catPercentile, avatarGender, avatarSkin, avatarHair, avatarHairColor, avatarShirt, avatarGlasses, avatarBeard, avatarMustache, category, primaryDegree, secondaryDegrees, workExpYears, workExpMonths, workCompany, workRole, calcResult, targetPercentile }) {
  const [inp, setInp] = useState("")
  const [placeholder, setPlaceholder] = useState("Ask Vikram anything...")
  const [selectedQuickAction, setSelectedQuickAction] = useState("")
  const [hoverQuickAction, setHoverQuickAction] = useState("")
  const [pressedQuickAction, setPressedQuickAction] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mentorMessages])

  const blurInput = (mobileOnly = false) => {
    if (mobileOnly && !isMobileKeyboardViewport()) return
    setTimeout(() => inputRef.current?.blur(), 50)
  }

  const focusDoubt = () => {
    setPlaceholder("Ask your CAT doubt...")
    setSelectedQuickAction("Doubt")
    setInp(prev => prev || "I have a doubt: ")
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 0)
  }

  const send = async ({ blur = false, mobileBlurOnly = false } = {}) => {
    if (!inp.trim() || loading) return
    const q = inp.trim()
    setInp("")
    setSelectedQuickAction("")
    if (blur) blurInput(mobileBlurOnly)
    setMentorMessages(p => [...p, { r:"user", t:q }])
    setLoading(true)
    const doFetch = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 55000)
      try {
        const res = await fetch("/api/chat", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            userId,
            message: q,
            daysLeft: dl, totals, dayNum, todayData: d, mode,
            userName: userName || "", startDate: startDate || "", interviewDate: interviewDate || "",
            catResult: catResult || "", catPercentile: catPercentile || "",
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
            messages: [...mentorMessages, {r:"user",t:q}]
              .map(m => ({role: m.r==="user"?"user":"assistant", content: m.t}))
          }),
          signal: controller.signal
        })
        clearTimeout(timeout)
        const data = await readChatResponse(res)
        if (!res.ok) return { error: getApiErrorMessage(data, `Server error: ${res.status}`) }
        return { reply: getMentorReply(data) }
      } catch (err) {
        clearTimeout(timeout)
        if (err.name === "AbortError") {
          setMentorMessages(p => [...p.filter(m => !m.loading), { r:"ai", t:"Render is waking up. Send your message again in 10 seconds." }])
          return null
        }
        throw err
      }
    }
    setMentorMessages(p => [...p, { r: 'ai', t: '...', loading: true }])
    const slowTimer = setTimeout(() => {
      setMentorMessages(p => {
        const last = p[p.length - 1]
        if (last?.r === 'ai' && last?.loading) {
          return [...p.slice(0, -1), { r: 'ai', t: 'Still thinking... Vikram does not rush.', loading: true }]
        }
        return p
      })
    }, 15000)
    try {
      let result = await doFetch()
      if (result === null) return
      if (!result.error && (result.reply.includes("system stumbled") || result.reply.includes("Load failed"))) {
        await new Promise(r => setTimeout(r, 2000))
        result = await doFetch()
        if (result === null) return
      }
      if (result.error) {
        setMentorMessages(p => [...p.filter(m => !m.loading), { r:"ai", t:result.error }])
      } else {
        setMentorMessages(p => [...p.filter(m => !m.loading), { r:"ai", t:result.reply }])
      }
    } catch (err) {
      setMentorMessages(p => [...p.filter(m => !m.loading), { r:"ai", t:err.message || "Connection error. Is the server running?" }])
    } finally {
      clearTimeout(slowTimer)
      setMentorMessages(p => p.filter(m => !m.loading))
      setLoading(false)
    }
  }

  return (
    <div className="mentor-page-shell" style={{
      display:"flex", flexDirection:"column", overflow:"hidden"
    }}>
      <div style={{padding:"32px 40px 16px", flexShrink:0,
        borderBottom:"1px solid var(--b1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div className="mentor-avatar">
            <MentorAvatar size={56}/>
          </div>
          <div style={{flex:1}}>
            <div className="page-title" style={{fontSize:24}}>Vikram Anand</div>
            <div style={{fontSize:11,color:"#f97316",marginTop:2,
              letterSpacing:"0.06em"}}>99.99%ILE · IIM-A · YOUR MENTOR</div>
          </div>
          <UserAvatar size={56} gender={avatarGender} skinTone={avatarSkin} hairStyle={avatarHair} hairColor={avatarHairColor} shirtColor={avatarShirt} hasGlasses={avatarGlasses} hasBeard={avatarBeard} hasMustache={avatarMustache}/>
        </div>
      </div>

      <div className="mentor-page-messages" style={{flex:1, overflowY:"auto", padding:"20px 40px",
        display:"flex", flexDirection:"column", gap:12}}>
        {mentorMessages.length === 0 && (
          <div style={{textAlign:"center",color:"var(--tt)",fontSize:13,
            marginTop:40,lineHeight:1.8}}>
            Vikram is watching.<br/>
            <span style={{color:"var(--tt)"}}>Say something.</span>
          </div>
        )}
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
            <div className="typing"><span/><span/><span/></div>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      <div className="mentor-page-composer" style={{
        padding:"16px 40px 24px",
        borderTop:"1px solid var(--b1)",
        background:"var(--s1)",
        flexShrink:0
      }}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {["Mock Interview","WAT Topic","Doubt"].map(label => {
            const selected = selectedQuickAction === label;
            const hovered = hoverQuickAction === label;
            const pressed = pressedQuickAction === label;
            const active = selected || hovered || pressed;
            return (
            <button key={label} type="button"
              className={`quick-action-btn${active ? " active" : ""}`}
              onPointerEnter={() => setHoverQuickAction(label)}
              onPointerDown={() => {
                setPressedQuickAction(label)
              }}
              onPointerUp={() => setPressedQuickAction("")}
              onPointerLeave={() => {
                setHoverQuickAction("")
                setPressedQuickAction("")
              }}
              onClick={() => {
                const quickText = label==="Mock Interview"
                  ? "Start a mock PI interview with me right now"
                  : label==="WAT Topic"
                    ? "Give me a WAT topic and evaluate my response"
                    : "I have a doubt: ";
                if (selectedQuickAction === label) {
                  setSelectedQuickAction("")
                  setInp(prev => prev === quickText ? "" : prev)
                  return
                }
                if(label==="Doubt") {
                  focusDoubt()
                  return
                }
                setSelectedQuickAction(label)
                setInp(quickText)
              }}
              style={{padding:"7px 13px",borderRadius:20,
                border:`1px solid ${active ? "#f97316" : "var(--b2)"}`,
                background:active ? "rgba(249,115,22,0.12)" : "var(--s2)",
                color:active ? "var(--tp)" : "var(--ts)",
                boxShadow:active ? "0 0 14px rgba(249,115,22,0.22)" : "none",
                transform:pressed ? "translateY(1px) scale(0.98)" : active ? "translateY(-1px) scale(1.04)" : "none",
                fontSize:11,cursor:"pointer",
                fontFamily:"inherit",fontWeight:700,
                transition:"transform 120ms ease, border-color 120ms ease, background 120ms ease, box-shadow 120ms ease",
                touchAction:"manipulation",WebkitTapHighlightColor:"transparent",
                userSelect:"none"}}>
              {label}
            </button>
          )})}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={placeholder}
            enterKeyHint="send"
            inputMode="text"
            value={inp}
            onChange={e => setInp(e.target.value)}
            onFocus={() => {
              setTimeout(() => {
                inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
              }, 100)
            }}
            onKeyDown={e => {
              if(e.key==="Enter" && !e.shiftKey){
                e.preventDefault(); send({ blur: true, mobileBlurOnly: true })
              }
            }}
            rows={1}
            style={{flex:1}}
          />
          <button className="send-btn" onClick={() => send({ blur: true })} disabled={loading} style={{opacity: loading ? 0.5 : 1}}>↑</button>
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
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
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

function AvatarPreview({ gender="male", skinTone="medium", hairStyle="wavy",
  hairColor="black", shirtColor="orange", hasGlasses=false, glassesStyle="rounded",
  hasBeard=false, hasMustache=false, hasWrinkles=false, size=80 }) {

  const skinColors = {light:"#f1c27d", medium:"#c68642", dark:"#8d5524"}
  const hairColors = {black:"#1a0a00", brown:"#6b3a2a", blonde:"#c8a850", grey:"#888888"}
  const shirtColors = {orange:"#f97316",blue:"#3b82f6",green:"#22c55e",purple:"#a855f7",red:"#ef4444",white:"#e5e5e5"}
  const borderColors = {orange:"#f97316",blue:"#3b82f6",green:"#22c55e",purple:"#a855f7",red:"#ef4444",white:"#aaaaaa"}

  const skin = skinColors[skinTone] || "#c68642"
  const hair = hairColors[hairColor] || "#1a0a00"
  const shirt = shirtColors[shirtColor] || "#f97316"
  const border = borderColors[shirtColor] || "#3b82f6"
  const shadow = skinTone==="light" ? "#d4956a" : skinTone==="dark" ? "#6b3d1e" : "#b07030"
  const s = size + "px"

  const renderHair = () => {
    if (gender === "female") {
      if (hairStyle === "bun") return <>
        <ellipse cx="50" cy="36" rx="20" ry="14" fill={hair}/>
        <circle cx="50" cy="22" r="10" fill={hair}/>
        <circle cx="50" cy="22" r="6" fill={hair} opacity="0.7"/>
      </>
      if (hairStyle === "long") return <>
        <ellipse cx="50" cy="35" rx="22" ry="18" fill={hair}/>
        <path d="M28 42 Q22 60 24 85 Q26 70 30 58 Q27 50 28 42Z" fill={hair}/>
        <path d="M72 42 Q78 60 76 85 Q74 70 70 58 Q73 50 72 42Z" fill={hair}/>
        <path d="M24 70 Q22 80 25 88Z" fill={hair}/>
        <path d="M76 70 Q78 80 75 88Z" fill={hair}/>
      </>
      if (hairStyle === "curly") return <>
        <ellipse cx="50" cy="33" rx="23" ry="19" fill={hair}/>
        <circle cx="27" cy="40" r="7" fill={hair}/>
        <circle cx="73" cy="40" r="7" fill={hair}/>
        <circle cx="24" cy="54" r="6" fill={hair}/>
        <circle cx="76" cy="54" r="6" fill={hair}/>
        <circle cx="26" cy="67" r="5" fill={hair}/>
        <circle cx="74" cy="67" r="5" fill={hair}/>
      </>
      if (hairStyle === "short") return <>
        <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
        <path d="M30 40 Q28 50 30 54Z" fill={hair}/>
        <path d="M70 40 Q72 50 70 54Z" fill={hair}/>
      </>
      return <>
        <ellipse cx="50" cy="34" rx="22" ry="17" fill={hair}/>
        <path d="M28 40 Q24 54 26 68 Q23 58 27 50 Q24 45 28 40Z" fill={hair}/>
        <path d="M72 40 Q76 54 74 68 Q77 58 73 50 Q76 45 72 40Z" fill={hair}/>
        <path d="M26 58 Q22 66 25 74Z" fill={hair}/>
        <path d="M74 58 Q78 66 75 74Z" fill={hair}/>
      </>
    }
    if (hairStyle === "curly") return <>
      <ellipse cx="50" cy="33" rx="22" ry="18" fill={hair}/>
      <circle cx="29" cy="38" r="6" fill={hair}/>
      <circle cx="71" cy="38" r="6" fill={hair}/>
      <circle cx="26" cy="50" r="5" fill={hair}/>
      <circle cx="74" cy="50" r="5" fill={hair}/>
    </>
    if (hairStyle === "wavy") return <>
      <ellipse cx="50" cy="35" rx="22" ry="17" fill={hair}/>
      <path d="M28 42 Q24 53 26 64 Q23 56 27 50 Q24 46 28 42Z" fill={hair}/>
      <path d="M72 42 Q76 53 74 64 Q77 56 73 50 Q76 46 72 42Z" fill={hair}/>
    </>
    return <>
      <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
      <path d="M30 40 Q29 50 31 54Z" fill={hair}/>
      <path d="M70 40 Q71 50 69 54Z" fill={hair}/>
    </>
  }

  return (
    <div style={{
      width:s, height:s, minWidth:s, minHeight:s,
      borderRadius:"50%", flexShrink:0,
      border:`3px solid ${border}`,
      background:"var(--avatar-bg, #0a0a14)",
      boxShadow:`0 0 0 2px rgba(0,0,0,0.5), 0 4px 24px ${border}66`,
      overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="var(--avatar-bg-highlight, #1a1a2e)"/>
            <stop offset="100%" stopColor="var(--avatar-bg, #0a0a14)"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bgGrad)"/>
        <path d="M15 100 Q18 78 50 75 Q82 78 85 100Z" fill={shirt} opacity="0.9"/>
        <path d="M22 100 Q25 82 50 79 Q75 82 78 100Z" fill={shirt} opacity="0.6"/>
        <rect x="43" y="68" width="14" height="11" rx="4" fill={skin}/>
        <ellipse cx="50" cy="54" rx="20" ry="22" fill={skin}/>
        {renderHair()}
        <ellipse cx="30" cy="54" rx="4" ry="5" fill={shadow}/>
        <ellipse cx="70" cy="54" rx="4" ry="5" fill={shadow}/>
        <ellipse cx="41" cy="52" rx="5" ry="4" fill="white"/>
        <ellipse cx="59" cy="52" rx="5" ry="4" fill="white"/>
        <circle cx="42" cy="52" r="3" fill="#1a1a2e"/>
        <circle cx="60" cy="52" r="3" fill="#1a1a2e"/>
        <circle cx="43" cy="51" r="1" fill="white" opacity="0.8"/>
        <circle cx="61" cy="51" r="1" fill="white" opacity="0.8"/>
        <path d="M35 46 Q41 43 47 45" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M53 45 Q59 43 65 46" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {hasGlasses && (glassesStyle === "slick" ? <>
          {/* Slick thin rectangular frames */}
          <rect x="33" y="49" width="16" height="7" rx="1.5" ry="1.5"
            fill="rgba(200,230,255,0.10)" stroke="#1a1a1a" strokeWidth="1.2"/>
          <rect x="51" y="49" width="16" height="7" rx="1.5" ry="1.5"
            fill="rgba(200,230,255,0.10)" stroke="#1a1a1a" strokeWidth="1.2"/>
          <line x1="49" y1="52" x2="51" y2="52" stroke="#1a1a1a" strokeWidth="1.0"/>
          <line x1="33" y1="52" x2="27" y2="50" stroke="#1a1a1a" strokeWidth="1.0" strokeLinecap="round"/>
          <line x1="67" y1="52" x2="73" y2="50" stroke="#1a1a1a" strokeWidth="1.0" strokeLinecap="round"/>
        </> : <>
          {/* Default rounded glasses */}
          <path d="M33 48 L33 55 Q33 58 36 58 L46 58 Q49 58 49 55 L49 48 Q49 45 46 45 L36 45 Q33 45 33 48Z"
            fill="rgba(100,150,255,0.12)" stroke="#222" strokeWidth="1.8"/>
          <path d="M51 48 L51 55 Q51 58 54 58 L64 58 Q67 58 67 55 L67 48 Q67 45 64 45 L54 45 Q51 45 51 48Z"
            fill="rgba(100,150,255,0.12)" stroke="#222" strokeWidth="1.8"/>
          <path d="M49 51 L51 51" stroke="#222" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M33 50 L27 48" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M67 50 L73 48" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
        </>)}
        <path d="M50 56 Q47 62 44 63 Q50 65 56 63 Q53 62 50 56Z" fill={shadow} opacity="0.5"/>
        {hasWrinkles && <>
          {/* Forehead lines — subtle horizontal */}
          <path d="M36 39 Q50 37 64 39" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <path d="M37 42 Q50 40 63 42" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
          {/* Nasolabial folds — cheek-to-mouth */}
          <path d="M36 56 Q33 62 38 66" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
          <path d="M64 56 Q67 62 62 66" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
          {/* Crow's feet — outer eyes */}
          <path d="M29 50 Q26 48 27 51" stroke="rgba(0,0,0,0.09)" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
          <path d="M71 50 Q74 48 73 51" stroke="rgba(0,0,0,0.09)" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
        </>}
        {hasMustache && gender==="male" && (
          <path d="M38 64 Q44 61 50 63 Q56 61 62 64 Q57 67 50 65 Q43 67 38 64Z" fill={hair}/>
        )}
        {hasBeard && gender==="male" && <>
          <path d="M32 64 Q34 74 40 79 Q50 84 60 79 Q66 74 68 64 Q58 70 50 71 Q42 70 32 64Z" fill={hair}/>
          <path d="M39 62 Q44 65 50 64 Q56 65 61 62 Q56 67 50 66 Q44 67 39 62Z" fill={hair}/>
        </>}
        {gender==="female"
          ? <path d="M44 68 Q50 71 56 68 Q50 73 44 68Z" fill={shadow} opacity="0.8"/>
          : <path d="M43 69 Q50 71 57 69" stroke={shadow} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        }
        <circle cx="50" cy="50" r="48" fill="none" stroke={border} strokeWidth="0.8" opacity="0.4"/>
      </svg>
    </div>
  )
}

function ProfilePage({
  userName, userId,
  startDate, dayNumber, totalDays, setTab,
  appTheme, setAppTheme,
  targetPercentile, setTargetPercentile,
  setSharedCalcResult,
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
                {appTheme === "light" ? "☀" : "☾"}
              </span>
              <span>{appTheme === "light" ? "Light" : "Dark"}</span>
            </button>
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
                  ? "✓ Competitive for all IIMs including IIM-A"
                  : targetPercentile >= 97
                    ? "✓ Competitive for IIM KLIS and New IIMs"
                    : targetPercentile >= 93
                      ? "✓ Competitive for New IIMs and Baby IIMs"
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
                            ? `✓ Your ${targetPercentile}% meets this`
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
          {saved ? "Saved ✓" : "Save Profile"}
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
                    ✓ PIN changed successfully
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
          {saved ? "Saved ✓" : "Save Academic Profile"}
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
                    style={{background:"transparent",border:"none",
                      color:"#ff453a",fontSize:20,cursor:"pointer",
                      padding:"0 0 0 12px",lineHeight:1}}>
                    ×
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

function MobileNav({ tab, setTab, dl, userName, startDate, mode }) {
  const [open, setOpen] = useState(false)
  const [btnPos, setBtnPos] = useState(() => {
    const saved = localStorage.getItem("nav_btn_pos")
    return saved ? JSON.parse(saved) : { x: 16, y: window.innerHeight / 2 }
  })
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const moved = useRef(false)
  const btnSize = 48

  const snapToEdge = (x, y) => {
    const W = window.innerWidth
    const H = window.innerHeight
    const margin = 12
    const distLeft = x
    const distRight = W - x - btnSize
    if (distLeft < distRight) {
      return { x: margin, y: Math.min(Math.max(y, margin), H - btnSize - margin) }
    }
    return { x: W - btnSize - margin, y: Math.min(Math.max(y, margin), H - btnSize - margin) }
  }

  const startDrag = (clientX, clientY) => {
    moved.current = false
    dragOffset.current = { x: clientX - btnPos.x, y: clientY - btnPos.y }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const { clientX, clientY } = e.touches ? e.touches[0] : e
      moved.current = true
      setBtnPos({
        x: Math.min(Math.max(clientX - dragOffset.current.x, 0), window.innerWidth - btnSize),
        y: Math.min(Math.max(clientY - dragOffset.current.y, 0), window.innerHeight - btnSize)
      })
    }
    const onEnd = () => {
      setDragging(false)
      if (moved.current) {
        setBtnPos(prev => {
          const snapped = snapToEdge(prev.x, prev.y)
          localStorage.setItem("nav_btn_pos", JSON.stringify(snapped))
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

  const nav = [
    { id:"today", label:"Today", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> },
    { id:"progress", label:"Progress", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg> },
    { id:"calendar", label:"Calendar", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id:"chat", label:"Mentor", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  ]

  const onLeft = btnPos.x < window.innerWidth / 2

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,0.5)",
            backdropFilter:"blur(4px)",
            zIndex:300
          }}
        />
      )}

      {open && (
        <div style={{
          position:"fixed",
          left: onLeft ? 0 : "auto",
          right: onLeft ? "auto" : 0,
          top: 0, bottom: 0,
          width: 240,
          background:"#0a0a0a",
          borderRight: onLeft ? "1px solid #1f1f1f" : "none",
          borderLeft: onLeft ? "none" : "1px solid #1f1f1f",
          zIndex:301,
          display:"flex",
          flexDirection:"column",
          animation: `slideIn${onLeft?"Left":"Right"} 0.25s cubic-bezier(0.4,0,0.2,1)`
        }}>
          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>

          <div style={{
            padding:"32px 24px 20px",
            borderBottom:"1px solid #1f1f1f"
          }}>
            <div style={{fontSize:16,fontWeight:900,
              letterSpacing:"0.12em",color:"#f5f5f7"}}>CONQUER</div>
            <div style={{fontSize:10,color:"#f97316",
              marginTop:2,letterSpacing:"0.08em"}}>
              {mode==="interview" ? "IIM INTERVIEW" : "CAT 2026 · 99.9%ILE"}
            </div>
          </div>

          <nav style={{flex:1,padding:"16px 12px",
            display:"flex",flexDirection:"column",gap:2}}>
            {nav.map(n => (
              <button key={n.id}
                onClick={() => { setTab(n.id); setOpen(false) }}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 14px", borderRadius:10,
                  border:"none",
                  color: tab===n.id ? "#f5f5f7" : "#6e6e73",
                  fontSize:15, fontWeight:500,
                  cursor:"pointer", fontFamily:"inherit",
                  textAlign:"left", width:"100%",
                  background: tab===n.id ? "#1a1a1a" : "transparent",
                  borderLeft: tab===n.id ? "2px solid #f97316" : "2px solid transparent"
                }}>
                <span style={{color: tab===n.id ? "#f97316" : "#6e6e73"}}>
                  {n.icon}
                </span>
                {n.label}
              </button>
            ))}
          </nav>

          <div style={{
            margin:"12px",
            background:"rgba(249,115,22,0.08)",
            border:"1px solid rgba(249,115,22,0.2)",
            borderRadius:12, padding:"14px 16px"
          }}>
            <div style={{fontSize:32,fontWeight:900,
              color:"#f97316",lineHeight:1,
              fontVariantNumeric:"tabular-nums"}}>{dl}</div>
            <div style={{fontSize:10,color:"#6e6e73",
              marginTop:4,letterSpacing:"0.06em",
              textTransform:"uppercase"}}>
              {mode==="interview" ? "days to interview" : "days to CAT"}
            </div>
          </div>

          <div style={{padding:"0 16px 24px"}}>
            <div style={{fontSize:11,color:"#555"}}>{userName}</div>
            <div style={{fontSize:10,color:"#444",marginTop:2}}>
              Started: {startDate ? new Date(startDate+"T00:00:00")
                .toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : ""}
            </div>
          </div>
        </div>
      )}

      <button
        onMouseDown={e => { startDrag(e.clientX, e.clientY); e.preventDefault() }}
        onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        style={{
          position:"fixed",
          left: btnPos.x,
          top: btnPos.y,
          width: btnSize,
          height: btnSize,
          borderRadius: "50%",
          background: open ? "#1a1a1a" : "#0a0a0a",
          border: "1px solid #2a2a2a",
          cursor: dragging ? "grabbing" : "grab",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          zIndex: 400,
          touchAction:"none",
          userSelect:"none",
          transition: dragging ? "none" : "left 0.3s cubic-bezier(0.4,0,0.2,1), top 0.3s cubic-bezier(0.4,0,0.2,1), background 0.15s",
          boxShadow: "0 2px 12px rgba(0,0,0,0.6)"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke={open ? "#f97316" : "#6e6e73"}
          strokeWidth="2" strokeLinecap="round">
          {open
            ? <path d="M18 6L6 18M6 6l12 12"/>
            : <><line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </button>
    </>
  )
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
  const [sel, setSel] = useState(() => localStorage.getItem("cat_sel_date") || todayKey());
  const [mentorMessages, setMentorMessages] = useState([]);
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
  const currentDayKey = useTodayRolloverKey();

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
  const _today = new Date(currentDayKey + "T00:00:00")
  _today.setHours(0, 0, 0, 0)
  const dl = getDaysLeft()
  const totalDays = useMemo(() => {
    if (!startDate) return 200;
    const start = new Date(startDate + "T00:00:00");
    start.setHours(0, 0, 0, 0);
    const exam = new Date(EXAM_DATE);
    exam.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exam - start) / 86400000);
    return Math.max(1, Math.min(diff, 300));
  }, [startDate]);
  const _start = startDate ? new Date(startDate + "T00:00:00") : _today
  _start.setHours(0, 0, 0, 0)
  const dn = Math.max(1, Math.floor((_today - _start) / 86400000) + 1)
  const START = _start
  const totals = useMemo(() => Object.values(data).reduce(
    (a, d) => ({quant:a.quant+(+d.q||0), varc:a.varc+(+d.v||0), lrdi:a.lrdi+(+d.l||0)}),
    {quant:0, varc:0, lrdi:0}
  ), [data]);
  const todayData = data[currentDayKey] || defaultDay();
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
    const theme = appTheme === "light" ? "light" : "dark";
    const isCalendar = tab === "calendar";
    const isPlainCalendar = isCalendar && localStorage.getItem('op_voyage_mode') === 'off';
    const bgColor = isPlainCalendar
      ? (theme === "light" ? "#f7f4ee" : "#000000")
      : isCalendar
      ? (theme === "light" ? "#67d7ff" : "#010c16")
      : (theme === "light" ? "#f7f4ee" : "#000000");
    const safeFill = isPlainCalendar
      ? bgColor
      : isCalendar
      ? (theme === "light" ? "#38c9f7" : "#010c16")
      : bgColor;
    localStorage.setItem("conquer_theme", theme);
    document.documentElement.style.colorScheme = theme;
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    document.documentElement.style.setProperty("--app-bg", bgColor);
    document.documentElement.style.setProperty("--app-safe-fill", safeFill);
    // Dynamic Island / status bar color on iPhone (theme-color meta tag)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", bgColor);
    }
    // Also update apple-mobile-web-app-status-bar-style
    const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaStatusBar) {
      metaStatusBar.setAttribute("content", appTheme === "light" ? "default" : "black-translucent");
    }
  }, [appTheme, tab]);
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

  const addMissedLiveClassToBacklog = (classEntry, dateKey = currentDayKey) => {
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
          todayData: data[currentDayKey] || defaultDay(),
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

  const nav = [{id:"today",lbl:"Today"},{id:"progress",lbl:"Progress"},{id:"calendar",lbl:"Calendar"},{id:"chat",lbl:"Mentor"}];

  return (
    <div className={`app theme-${appTheme === "light" ? "light" : "dark"}${tab === "calendar" ? " on-calendar" : ""}`}>
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          ☰
        </button>
        <div className="mobile-brand">
          <div className="mobile-title">CONQUER CAT</div>
          <div className="mobile-sub">{mode === "interview" ? "IIM INTERVIEW" : "CAT 2026 · 99.9%ile"}</div>
        </div>
        <div className="mobile-days-pill" aria-label={`${dl} days to CAT`}>
          <span>{dl}</span>
          <small>DAYS</small>
        </div>
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
            ×
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
        <div className="days-pill">
          <div className="dp-num">{dl}</div>
          <div className="dp-lab">days to CAT</div>
        </div>
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
        <div className="days-pill">
          <div className="dp-num">{dl}</div>
          <div className="dp-lab">days to CAT</div>
        </div>
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

      <main className={`main${tab==="chat" ? " mentor-main" : ""}${tab==="calendar" ? " calendar-main" : ""}`}>
        {tab==="today" && <TodayPage date={sel} d={data[sel]||defaultDay()} upd={(f,v)=>upd(sel,f,v)} dl={dl} start={START} totalDays={totalDays} mode={mode} setTab={setTab} backlogVideos={backlogVideos} backlogConcepts={backlogConcepts} data={data} totals={totals} userName={userName} avatarGender={avatarGender} avatarSkin={avatarSkin} avatarHair={avatarHair} avatarHairColor={avatarHairColor} avatarShirt={avatarShirt} avatarGlasses={avatarGlasses} avatarBeard={avatarBeard} avatarMustache={avatarMustache} todayLiveLabel={todayLiveLabel} todayAppLabel={todayAppLabel} isSundayIST={isSundayIST} onSave={async () => {
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

          const score = effortScore(dayData, backlogVideos, backlogConcepts);
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
        }} />}
        {tab === "backlog" && (
          <BacklogPage
            videos={backlogVideos}
            setVideos={setBacklogVideos}
            concepts={backlogConcepts}
            setConcepts={setBacklogConcepts}
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
        {tab==="progress" && <ProgressPage data={data} totals={totals} dl={dl} dn={dn} start={START} totalDays={totalDays} backlogVideos={backlogVideos} backlogConcepts={backlogConcepts} />}
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
        {tab==="chat" && <ChatPage mentorMessages={mentorMessages} setMentorMessages={setMentorMessages} d={data[sel]||defaultDay()} totals={totals} dl={dl} dayNum={dn} mode={mode} userInitials={userInitials} userName={userName} userId={userId} startDate={startDate} interviewDate={interviewDate} catResult={catResult} catPercentile={catPercentile} avatarGender={avatarGender} avatarSkin={avatarSkin} avatarHair={avatarHair} avatarHairColor={avatarHairColor} avatarShirt={avatarShirt} avatarGlasses={avatarGlasses} avatarBeard={avatarBeard} avatarMustache={avatarMustache} category={category} primaryDegree={primaryDegree} secondaryDegrees={secondaryDegrees} workExpYears={workExpYears} workExpMonths={workExpMonths} workCompany={workCompany} workRole={workRole} calcResult={calcResult} targetPercentile={targetPercentile} />}
      </main>

      <FloatingMentor daysLeft={dl} totals={totals} dayNum={dn} todayData={todayData} mentorMessages={mentorMessages} setMentorMessages={setMentorMessages} mode={mode} userInitials={userInitials} userName={userName} userId={userId} startDate={startDate} interviewDate={interviewDate} catResult={catResult} catPercentile={catPercentile} avatarGender={avatarGender} avatarSkin={avatarSkin} avatarHair={avatarHair} avatarHairColor={avatarHairColor} avatarShirt={avatarShirt} avatarGlasses={avatarGlasses} avatarBeard={avatarBeard} avatarMustache={avatarMustache} category={category} primaryDegree={primaryDegree} secondaryDegrees={secondaryDegrees} workExpYears={workExpYears} workExpMonths={workExpMonths} workCompany={workCompany} workRole={workRole} activeTab={tab === "chat" ? "mentor" : tab} calcResult={calcResult} targetPercentile={targetPercentile} />

    </div>
  );
}
