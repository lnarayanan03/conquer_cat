export const EXAM_DATE = new Date("2026-11-29T00:00:00");
export const AC = "#f97316";
export const EXAM_DATE_KEY = "2026-11-29";
export const APPLICATION_START_KEY = "2026-08-01";
export const APPLICATION_END_KEY = "2026-09-20";

export const toLocalDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};
export const todayKey = () => toLocalDateKey(new Date());
export const isDateKeyBetween = (key, startKey, endKey) => key >= startKey && key <= endKey;
export const isApplicationWindow = (key) => isDateKeyBetween(key, APPLICATION_START_KEY, APPLICATION_END_KEY);
export const isFinalPushDate = (key) => isDateKeyBetween(key, "2026-11-23", EXAM_DATE_KEY);
export const isDdayRevealDay = () => todayKey() >= EXAM_DATE_KEY;
export const getDaysLeft = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exam = new Date("2026-11-29T00:00:00")
  exam.setHours(0, 0, 0, 0)
  const diff = Math.floor((exam - now) / 86400000)
  return Math.max(0, diff - 1)
}
export const getDaysToInterview = (dateStr) => {
  if (!dateStr) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const interview = new Date(dateStr + "T00:00:00")
  interview.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((interview - now) / 86400000))
}
export const defaultDay = () => ({
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

export const getSleepDuration = (sleepTime, wakeTime) => {
  if (!sleepTime || !wakeTime) return null;
  const [sh, sm] = sleepTime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let sleepMins = sh * 60 + sm;
  let wakeMins = wh * 60 + wm;
  if (wakeMins <= sleepMins) wakeMins += 24 * 60;
  return (wakeMins - sleepMins) / 60;
};

export function to12HourParts(value) {
  if (!value || !value.includes(":")) return { hour12: null, minute: null, meridiem: null };
  const [h, m] = value.split(":").map(Number);
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour12, minute: m, meridiem };
}

export function to24HourValue(hour12, minute, meridiem) {
  if (hour12 === null || minute === null || !meridiem) return "";
  let h = Number(hour12);
  if (meridiem === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${String(Number(minute)).padStart(2, "0")}`;
}
