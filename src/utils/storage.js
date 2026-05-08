export const EXAM_DATE = '2026-11-29'

export const TARGETS = { quant: 2000, varc: 1000, lrdi: 1000 }

export const DAILY_TARGETS = { quant: 10, varc: 5, lrdi: 5 }

const STORAGE_KEY = 'cat_prep_2026'

export function todayKey() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getDefaultDay() {
  return {
    wakeTime: '',
    sleepTime: '',
    liveClass: false,
    afternoonHrs: '',
    eveningHrs: '',
    varcPassage: false,
    quantDone: 0,
    varcDone: 0,
    lrdiDone: 0,
    iqQuantaNotes: '',
    notes: '',
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getTotals(data) {
  let quantDone = 0
  let varcDone = 0
  let lrdiDone = 0
  for (const day of Object.values(data)) {
    quantDone += day.quantDone ?? 0
    varcDone += day.varcDone ?? 0
    lrdiDone += day.lrdiDone ?? 0
  }
  return { quantDone, varcDone, lrdiDone }
}

export function getDaysLeft() {
  const now = new Date()
  const exam = new Date(EXAM_DATE)
  return Math.ceil((exam - now) / (1000 * 60 * 60 * 24))
}

export function getStreak(data) {
  function keyForDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function metTargets(entry) {
    return !!entry && entry.quantDone >= 10 && entry.varcDone >= 5 && entry.lrdiDone >= 5
  }

  const d = new Date()
  // If today isn't logged yet or targets not met, start check from yesterday
  if (!metTargets(data[keyForDate(d)])) {
    d.setDate(d.getDate() - 1)
  }

  let streak = 0
  while (metTargets(data[keyForDate(d)])) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function getTotalHours(data) {
  return Object.values(data).reduce((sum, day) => {
    return sum + (parseFloat(day.afternoonHrs) || 0) + (parseFloat(day.eveningHrs) || 0)
  }, 0)
}

export function formatDate(dateStr) {
  const [yyyy, mm, dd] = dateStr.split('-').map(Number)
  const d = new Date(yyyy, mm - 1, dd)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
