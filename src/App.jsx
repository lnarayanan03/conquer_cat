import { useState, useMemo, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./App.css";
import InstaCard from "./pages/InstaCard.jsx";

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

const toLocalDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};
const todayKey = () => toLocalDateKey(new Date());
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
  const q = Math.min((+day.q||0)/10, 1) * 20;
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
    if (duration >= 4 && duration <= 6) return 10;
    if (duration >= 3.5 && duration < 4) return 6;
    if (duration > 6 && duration <= 7) return 6;
    if (duration >= 3 && duration < 3.5) return 3;
    return 0;
  })();
  const backlogScore = (() => {
    const allItems = [...(backlogVideos || []), ...(backlogConcepts || [])];
    if (allItems.length === 0) return 0;
    const checked = allItems.filter(item => item.checked).length;
    return Math.round((checked / allItems.length) * 10);
  })();
  return Math.min(100, Math.round(q + v + l + vp + hrs + lc + passage + sleepScore + backlogScore));
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

  return (
    <div className="page">
      <div className="page-header">
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div>
            <div className="page-title">{greet}</div>
            <div className="page-sub">{fmt} · Day {dn} of {totalDays}</div>
            <div style={{fontSize:12,color:"#f97316",opacity:0.8,fontStyle:"italic",marginTop:8}}>{todayQuote}</div>
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
                  border: d.lc_na ? "1px solid #6e6e73" : "1px solid #2a2a2a",
                  background: d.lc_na ? "rgba(110,110,115,0.15)" : "transparent",
                  color: d.lc_na ? "#6e6e73" : "#3a3a3a",
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
                  border: d.as_na ? "1px solid #6e6e73" : "1px solid #2a2a2a",
                  background: d.as_na ? "rgba(110,110,115,0.15)" : "transparent",
                  color: d.as_na ? "#6e6e73" : "#3a3a3a",
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
                  border: d.ap_na ? "1px solid #6e6e73" : "1px solid #2a2a2a",
                  background: d.ap_na ? "rgba(110,110,115,0.15)" : "transparent",
                  color: d.ap_na ? "#6e6e73" : "#3a3a3a",
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
                  border: d.vp_na ? "1px solid #6e6e73" : "1px solid #2a2a2a",
                  background: d.vp_na ? "rgba(110,110,115,0.15)" : "transparent",
                  color: d.vp_na ? "#6e6e73" : "#3a3a3a",
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
            <div className="card-row">
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
              borderTop:"1px solid #1f1f1f", marginTop:4
            }}>
              <span style={{fontSize:11,color:"#6e6e73",
                letterSpacing:"0.06em",textTransform:"uppercase"}}>
                Total Studied
              </span>
              <span style={{fontSize:16,fontWeight:700,
                color: totalMins >= 240 ? "#30d158"
                  : totalMins >= 120 ? "#f97316"
                    : "#f5f5f7"
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
                fill="none" stroke="#6e6e73" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <div>
          <div className="sec-label">Timetable & Assessment</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
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
                  fill="none" stroke="#6e6e73" strokeWidth="2"
                  strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div className="card">
              <button
                className="card-row"
                onClick={() => setTab("assessment")}
                style={{display:"flex",alignItems:"center",
                  justifyContent:"space-between",width:"100%",
                  background:"transparent",border:"none",
                  cursor:"pointer",fontFamily:"inherit"}}
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
                  fill="none" stroke="#6e6e73" strokeWidth="2"
                  strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
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
          <div className="sec-label">Notes</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div className="card"><textarea className="textarea" placeholder="iQuanta — topics covered, videos watched..." value={d.iq||""} onChange={e=>upd("iq",e.target.value)} rows={2} /></div>
            <div className="card"><textarea className="textarea" placeholder="Journal — what did you study? focus level? what needs work tomorrow?" value={d.n||""} onChange={e=>upd("n",e.target.value)} rows={3} /></div>
          </div>
        </div>

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
            <div style={{fontSize:15, fontWeight:800, color:"#f5f5f7"}}>{title}</div>
            <div style={{fontSize:11, color:"#6e6e73", marginTop:2}}>{subtitle}</div>
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
              flex:1, background:"#111",
              border:"1px solid #2a2a2a", borderRadius:8,
              padding:"10px 12px", color:"#f5f5f7",
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
            <div style={{borderTop:"1px solid #1a1a1a"}}>
              {pending.map(item => (
                <div key={item.id} style={{
                  display:"flex", alignItems:"center",
                  gap:12, padding:"12px 0",
                  borderBottom:"1px solid #1a1a1a"
                }}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    style={{
                      width:22, height:22,
                      borderRadius:6,
                      border:"2px solid #3a3a3a",
                      background:"transparent",
                      cursor:"pointer", flexShrink:0,
                      display:"flex", alignItems:"center",
                      justifyContent:"center"
                    }}
                  />
                  <span style={{
                    flex:1, fontSize:14,
                    color:"#f5f5f7", lineHeight:1.4
                  }}>{item.text}</span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      background:"transparent", border:"none",
                      color:"#3a3a3a", fontSize:18,
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
            <div style={{borderTop:"1px solid #1a1a1a"}}>
              {done.map(item => (
                <div key={item.id} style={{
                  display:"flex", alignItems:"center",
                  gap:12, padding:"12px 0",
                  borderBottom:"1px solid #1a1a1a",
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
                    color:"#6e6e73", lineHeight:1.4,
                    textDecoration:"line-through"
                  }}>{item.text}</span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      background:"transparent", border:"none",
                      color:"#3a3a3a", fontSize:18,
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
            textAlign:"center", color:"#444",
            fontSize:13, padding:"34px 0", lineHeight:2
          }}>
            Nothing here yet.<br/>
            <span style={{color:"#6e6e73"}}>Add the first item above.</span>
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
            <span style={{fontSize:12,color:"#6e6e73"}}>
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
    background:"#111", border:"1px solid #2a2a2a",
    borderRadius:8, padding:"8px 10px",
    color:"#f5f5f7", fontSize:13, fontFamily:"inherit",
    outline:"none", cursor:"pointer",
    appearance:"none", WebkitAppearance:"none",
    minWidth:90
  };
  const inputStyle = {
    flex:1, background:"#111", border:"1px solid #2a2a2a",
    borderRadius:8, padding:"8px 10px",
    color:"#f5f5f7", fontSize:13, fontFamily:"inherit",
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
                  <div style={{fontSize:11,color:"#6e6e73",marginBottom:6,
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
                    <div style={{fontSize:11,color:"#6e6e73",
                      letterSpacing:"0.06em",textTransform:"uppercase"}}>
                      Application Class · 10PM - 12AM
                    </div>
                    <label style={{display:"flex",alignItems:"center",
                      gap:6,cursor:"pointer",fontSize:11,color:"#6e6e73"}}>
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
                    <div style={{fontSize:12,color:"#6e6e73",fontStyle:"italic"}}>
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
        <div style={{fontSize:12,color:"#6e6e73"}}>
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
        <div style={{fontSize:14,color:"#6e6e73"}}>
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
          <div style={{fontSize:12,color:"#6e6e73"}}>
            {currentIdx + 1}/{questions.length}
          </div>
        </div>
        <div style={{marginTop:8,height:4,background:"#1f1f1f",borderRadius:2}}>
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
          <div style={{fontSize:15,color:"#f5f5f7",
            lineHeight:1.7,whiteSpace:"pre-wrap"}}>
            {q.question_text}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {(q.options || []).map((option, i) => {
            const isSelected = selected === option;
            const isCorrect = result && option === result.correctAnswer;
            const isWrong = result && isSelected && !result.isCorrect;
            let bg = "#111";
            let border = "1px solid #2a2a2a";
            let color = "#f5f5f7";
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
            <div style={{fontSize:13,color:"#a1a1a6",lineHeight:1.6}}>
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
              background: selected ? topicColor : "#2a2a2a",
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
                <CartesianGrid stroke="#1f1f1f" vertical={false} />
                <XAxis dataKey="day" domain={[0, totalDays]} tick={{fontSize:9,fill:"#6e6e73"}} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize:9,fill:"#6e6e73"}} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{background:"#111",border:"1px solid #2a2a2a",borderRadius:8,fontSize:11}}
                  labelStyle={{color:"#a1a1a6"}} itemStyle={{color:"#f5f5f7"}}
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

function CalendarPage({ data, sel, onSel, start, totalDays }) {
  const days = useMemo(() => Array.from({length: totalDays}, (_, i) => {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const k = toLocalDateKey(d); const e = data[k];
    let status = "";
    if (e) {
      const mq=(+e.q||0)>=10, mv=(+e.v||0)>=5, ml=(+e.l||0)>=5, mvp=(+e.vp_count||0)>=1;
      status = mq && mv && ml && mvp ? "done" : "partial";
    }
    return { k, day:i+1, isToday: k===todayKey(), status };
  }), [data, start, totalDays]);

  const months = useMemo(() => {
    const labels = [];
    for (let i = 0; i < totalDays; i += 30) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString("en-IN", { month:"short", year:"numeric" });
      if (!labels.includes(label)) labels.push(label);
    }
    return labels;
  }, [start, totalDays]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">{totalDays} Days</div>
        <div className="page-sub">Every cell is a choice. Leave none empty.</div>
      </div>
      <div className="sections">
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          {[{bg:"rgba(249,115,22,.14)",bd:"rgba(249,115,22,.3)",lbl:"All targets met"},
            {bg:"rgba(249,115,22,.05)",bd:"rgba(249,115,22,.15)",lbl:"Partial"},
            {bg:"#111",bd:"#1f1f1f",lbl:"No entry"}].map(l => (
            <div key={l.lbl} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:11,height:11,borderRadius:3,background:l.bg,border:`1px solid ${l.bd}`}} />
              <span style={{fontSize:11,color:"var(--tt)"}}>{l.lbl}</span>
            </div>
          ))}
        </div>
        <div className="cal-grid">
          {days.map(d => (
            <div key={d.k}
              className={`cal-cell ${d.status} ${d.isToday?"today":""} ${d.k===sel?"selected":""}`}
              onClick={() => onSel(d.k)}
              title={`Day ${d.day}`}
            >{d.day}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {months.map(m => (
            <span key={m} style={{fontSize:11,color:"var(--tt)",background:"#111",border:"1px solid #1f1f1f",borderRadius:6,padding:"3px 10px"}}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}


function ChatPage({ mentorMessages, setMentorMessages, d, totals, dl, dayNum, mode, userInitials, userName, userId, startDate, interviewDate, catResult, catPercentile, avatarGender, avatarSkin, avatarHair, avatarHairColor, avatarShirt, avatarGlasses, avatarBeard, avatarMustache, category, primaryDegree, secondaryDegrees, workExpYears, workExpMonths, workCompany, workRole, calcResult, targetPercentile }) {
  const [inp, setInp] = useState("")
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

  const send = async ({ blur = false, mobileBlurOnly = false } = {}) => {
    if (!inp.trim() || loading) return
    const q = inp.trim()
    setInp("")
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
        borderBottom:"1px solid #1f1f1f"}}>
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
          <div style={{textAlign:"center",color:"#444",fontSize:13,
            marginTop:40,lineHeight:1.8}}>
            Vikram is watching.<br/>
            <span style={{color:"#6e6e73"}}>Say something.</span>
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
            <div style={{
              maxWidth: "70%",
              padding: "10px 14px",
              borderRadius: m.r === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              fontSize: "13px",
              lineHeight: "1.65",
              backgroundColor: m.r === "user" ? "#f97316" : "#1c1c1e",
              color: "white",
              border: m.r === "user" ? "none" : "1px solid #2a2a2a",
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
        borderTop:"1px solid #1f1f1f",
        background:"#000",
        flexShrink:0
      }}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {["Mock Interview","WAT Topic","Doubt"].map(label => (
            <button key={label}
              onClick={() => {
                if(label==="Doubt") {
                  inputRef.current?.focus()
                  return
                }
                setInp(
                  label==="Mock Interview"
                    ? "Start a mock PI interview with me right now"
                    : "Give me a WAT topic and evaluate my response"
                )
              }}
              style={{padding:"5px 12px",borderRadius:20,
                border:"1px solid #2a2a2a",background:"#111",
                color:"#6e6e73",fontSize:11,cursor:"pointer",
                fontFamily:"inherit"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask Vikram anything..."
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
                <div style={{
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius: m.r === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  fontSize: "13px",
                  lineHeight: "1.65",
                  backgroundColor: m.r === "user" ? "#f97316" : "#1c1c1e",
                  color: "white",
                  border: m.r === "user" ? "none" : "1px solid #2a2a2a",
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
      background:"#0a0a14",
      boxShadow:`0 0 0 2px rgba(0,0,0,0.5), 0 4px 24px ${border}66`,
      overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1a1a2e"/>
            <stop offset="100%" stopColor="#0a0a14"/>
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
    border: active ? "1px solid #f97316" : "1px solid #2a2a2a",
    background: active ? "rgba(249,115,22,0.15)" : "#111",
    color: active ? "#f97316" : "#6e6e73",
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
                  background:"#111",
                  border:"1px solid #2a2a2a",
                  borderRadius:8,
                  padding:"10px 14px",
                  color:"#f5f5f7",
                  fontSize:20,
                  fontWeight:700,
                  outline:"none",
                  fontFamily:"inherit",
                  colorScheme:"dark",
                  minWidth:0
                }}
              />
              <span style={{fontSize:12,color:"#6e6e73"}}>percentile</span>
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
            <div style={{fontSize:11,color:"#444",marginBottom:8,fontStyle:"italic"}}>
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
                <div style={{fontSize:11,color:"#6e6e73",lineHeight:1.5}}>
                  Toughest competition pool. IIM-A realistically needs 99.7+. Work experience and strong academics are your best levers.
                </div>
              </div>
            )}
            <div className="card" style={{padding:"4px 0"}}>
              {[
                { label:"IIM A / B / C", sub:"Ahmedabad · Bangalore · Calcutta", key:"ABC", color:"#30d158" },
                { label:"IIM K / L / I / S", sub:"Kozhikode · Lucknow · Indore · Shillong", key:"KLIS", color:"#f97316" },
                { label:"New IIMs", sub:"Ranchi · Raipur · Trichy · Nagpur & others", key:"newIIM", color:"#3b82f6" },
              ].map(g => {
                const needed = calcResult.adjustedCutoffs[g.key];
                const meets = targetPercentile > 0 && targetPercentile >= needed;
                const close = targetPercentile > 0 && !meets && targetPercentile >= needed - 1;
                return (
                  <div key={g.key} style={{
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center",
                    padding:"14px 16px",
                    borderBottom:"1px solid #1a1a1a",
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
                      <div style={{fontSize:9,color:"#6e6e73"}}>needed</div>
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
              fill="none" stroke="#6e6e73" strokeWidth="2"
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
    border: active ? "1px solid #f97316" : "1px solid #2a2a2a",
    background: active ? "rgba(249,115,22,0.15)" : "#111",
    color: active ? "#f97316" : "#6e6e73",
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
    background:"#111",
    border:"1px solid #2a2a2a",
    borderRadius:8,
    padding:"10px 12px",
    color:"#f5f5f7",
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
            <div style={{fontSize:18,fontWeight:800,color:"#f5f5f7"}}>
              {userName}
            </div>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:76}}>Gender</span>
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
                <span style={{fontSize:12,color:"#6e6e73",width:76}}>Skin</span>
                <div style={{display:"flex",gap:8}}>
                  {[{id:"light",color:"#f1c27d"},{id:"medium",color:"#c68642"},{id:"dark",color:"#8d5524"}].map(s => (
                    <button key={s.id} type="button" onClick={() => updateAvatar("skin", s.id)}
                      style={swatchStyle(avatarSkin === s.id, s.color)} aria-label={s.id} />
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:76}}>Hair</span>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {(avatarGender === "female" ? ["short","wavy","long","curly","bun"] : ["short","wavy","curly"]).map(h => (
                    <button key={h} type="button" onClick={() => updateAvatar("hair", h)}
                      style={chipStyle(avatarHair === h)}>{h}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:76}}>Hair color</span>
                <div style={{display:"flex",gap:8}}>
                  {[{id:"black",color:"#0a0a0a"},{id:"brown",color:"#6b3a2a"},{id:"blonde",color:"#c8a850"},{id:"grey",color:"#888888"}].map(h => (
                    <button key={h.id} type="button" onClick={() => updateAvatar("hairColor", h.id)}
                      style={swatchStyle(avatarHairColor === h.id, h.color)} aria-label={h.id} />
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6e6e73",width:76}}>Outfit</span>
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
                  <span style={{fontSize:12,color:"#6e6e73"}}>Glasses</span>
                </label>
                {avatarGender === "male" && <>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={avatarBeard}
                      onChange={e => updateAvatar("beard", e.target.checked)}
                      style={{accentColor:"#f97316"}} />
                    <span style={{fontSize:12,color:"#6e6e73"}}>Beard</span>
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={avatarMustache}
                      onChange={e => updateAvatar("mustache", e.target.checked)}
                      style={{accentColor:"#f97316"}} />
                    <span style={{fontSize:12,color:"#6e6e73"}}>Mustache</span>
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
                      ? "#f97316" : "#2a2a2a",
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
                <div style={{fontSize:10,color:"#444",textAlign:"center"}}>
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
    width:"100%", background:"#111",
    border:"1px solid #2a2a2a", borderRadius:8,
    padding:"10px 12px", color:"#f5f5f7",
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
                      ?"1px solid #f97316":"1px solid #2a2a2a",
                    background:(primaryDegree?.gpaScale||"percentage")===scale
                      ?"rgba(249,115,22,0.15)":"#111",
                    color:(primaryDegree?.gpaScale||"percentage")===scale
                      ?"#f97316":"#6e6e73",
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
                fill="none" stroke="#6e6e73" strokeWidth="2"
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
                      <span style={{color:"#6e6e73"}}>
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
    width:"100%", background:"#111",
    border:"1px solid #2a2a2a", borderRadius:8,
    padding:"10px 12px", color:"#f5f5f7",
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
                      color:"#f5f5f7",marginBottom:2}}>
                      {displayText || "Additional degree"}
                    </div>
                    {deg.college && (
                      <div style={{fontSize:12,color:"#6e6e73"}}>
                        {deg.college}
                      </div>
                    )}
                    <div style={{fontSize:11,color:"#444",marginTop:2}}>
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
                      : "1px solid #2a2a2a",
                    background: form.gpaScale===scale
                      ? "rgba(249,115,22,0.15)" : "#111",
                    color: form.gpaScale===scale ? "#f97316" : "#6e6e73",
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
                background: form.degree ? "#f97316" : "#2a2a2a",
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
          <div style={{fontSize:12,color:"#6e6e73",lineHeight:1.6}}>
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

  const nav = [{id:"today",lbl:"Today"},{id:"progress",lbl:"Progress"},{id:"calendar",lbl:"Calendar"},{id:"chat",lbl:"Mentor"}];

  return (
    <div className="app">
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
            border:"none", borderTop:"1px solid #1a1a1a",
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
              color:"#f5f5f7"}}>{userName}</div>
            <div style={{fontSize:11,color:"#6e6e73"}}>
              Profile & IIM Calculator
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="#6e6e73" strokeWidth="2"
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
            borderBottom:"1px solid #1a1a1a",
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
              color:"#f5f5f7"}}>{userName}</div>
            <div style={{fontSize:10,color:"#6e6e73"}}>
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
            color:"#333", fontSize:10, cursor:"pointer",
            padding:"8px 14px", fontFamily:"inherit",
            textAlign:"left", width:"100%",
            marginTop:"auto"
          }}
        >
          reset start date
        </button>
      </aside>

      <main className={`main${tab==="chat" ? " mentor-main" : ""}`}>
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
