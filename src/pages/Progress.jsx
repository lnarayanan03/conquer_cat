import { useMemo } from 'react'
import { loadData, getTotals, getDaysLeft, TARGETS } from '../utils/storage'
import './Progress.css'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function metTargets(entry) {
  return !!entry && entry.quantDone >= 10 && entry.varcDone >= 5 && entry.lrdiDone >= 5
}

function calcStreak(data) {
  const d = new Date()
  // If today's entry hasn't met targets (or doesn't exist), start from yesterday
  if (!metTargets(data[dateKey(d)])) {
    d.setDate(d.getDate() - 1)
  }
  let streak = 0
  while (metTargets(data[dateKey(d)])) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function getLastNDates(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return dateKey(d)
  })
}

function parseDateStr(ds) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function Progress() {
  const data = useMemo(() => loadData(), [])
  const totals = getTotals(data)
  const daysLeft = getDaysLeft()
  const streak = useMemo(() => calcStreak(data), [data])
  const last7 = useMemo(() => getLastNDates(7), [])

  const totalDays = Object.keys(data).length
  const totalHours = Object.values(data).reduce(
    (sum, d) => sum + (d.afternoonHrs ?? 0) + (d.eveningHrs ?? 0),
    0
  )

  const subjects = [
    { key: 'quant', label: 'Quant',     done: totals.quantDone, target: TARGETS.quant },
    { key: 'varc',  label: 'VARC',      done: totals.varcDone,  target: TARGETS.varc  },
    { key: 'lrdi',  label: 'LRDI',      done: totals.lrdiDone,  target: TARGETS.lrdi  },
  ]

  return (
    <div className="progress-page">
      <h1 className="scoreboard-title">SCOREBOARD</h1>

      {/* Progress bars */}
      <section className="pg-card">
        {subjects.map(({ key, label, done, target }) => {
          const pct = Math.min(100, Math.round((done / target) * 100))
          const remaining = Math.max(0, target - done)
          const perDay = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : null
          return (
            <div key={key} className="progress-block">
              <div className="progress-header">
                <span className="progress-label">{label}</span>
                <span className="progress-fraction">
                  {done.toLocaleString()} / {target.toLocaleString()}
                </span>
                <span className="progress-pct">{pct}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <p className="progress-note">
                {remaining === 0
                  ? 'Target reached!'
                  : perDay !== null
                  ? `${remaining.toLocaleString()} remaining — need ${perDay}/day to finish on time`
                  : `${remaining.toLocaleString()} remaining`}
              </p>
            </div>
          )
        })}
      </section>

      {/* Streak */}
      <section className="pg-card streak-card">
        <h2 className="pg-section-title">STREAK</h2>
        <div className="streak-block">
          <span className="streak-number">{streak}</span>
          <span className="streak-unit">day{streak !== 1 ? 's' : ''}</span>
        </div>
        <p className="streak-sub">consecutive days hitting all daily targets</p>
      </section>

      {/* This week */}
      <section className="pg-card">
        <h2 className="pg-section-title">THIS WEEK</h2>
        <div className="week-row">
          {last7.map(ds => {
            const entry = data[ds]
            const status = entry === undefined ? 'none' : metTargets(entry) ? 'met' : 'missed'
            const d = parseDateStr(ds)
            return (
              <div key={ds} className="week-day">
                <div className={`week-circle week-circle--${status}`} />
                <span className="week-label">{DAY_LABELS[d.getDay()]}</span>
                <span className="week-date">{d.getDate()}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="pg-card stats-card">
        <div className="stat-item">
          <span className="stat-value">{totalDays}</span>
          <span className="stat-label">Days Tracked</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}</span>
          <span className="stat-label">Study Hours</span>
        </div>
      </section>
    </div>
  )
}
