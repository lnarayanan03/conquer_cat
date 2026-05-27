import { useState, useEffect, useRef, useCallback } from 'react'
import {
  loadData, saveData, getDefaultDay, todayKey,
  getDaysLeft, formatDate, DAILY_TARGETS,
} from '../utils/storage'
import './Today.css'

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning.'
  if (h >= 12 && h < 17) return 'Good afternoon.'
  return 'Good evening.'
}

// Works correctly for morning wake times (04:xx–09:xx are lex-sortable vs "06:00")
function wakeStatus(t) {
  if (!t) return null
  return t <= '06:00' ? 'green' : 'orange'
}

// 23:xx is before midnight but lex > "00:00", so we use hour logic
function sleepStatus(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return h >= 20 || (h === 0 && m === 0) ? 'green' : 'orange'
}

export default function Today() {
  const key = todayKey()

  const [day, setDay] = useState(() => {
    const data = loadData()
    return data[key] ?? getDefaultDay()
  })
  const [saved, setSaved] = useState(false)
  const mountedRef = useRef(false)

  const persist = useCallback(
    (d) => {
      const data = loadData()
      data[key] = d
      saveData(data)
    },
    [key]
  )

  // Debounced auto-save — skips the initial mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    const id = setTimeout(() => persist(day), 500)
    return () => clearTimeout(id)
  }, [day, persist])

  function update(field, value) {
    setDay(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    persist(day)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="today-page">

      {/* ── Sticky Header ── */}
      <header className="today-header">
        <div className="header-inner">
          <div className="header-top">
            <h1 className="greeting">{getGreeting()}</h1>
            <span className="days-badge">{getDaysLeft()} days</span>
          </div>
          <p className="today-date-label">{formatDate(key)}</p>
        </div>
      </header>

      <div className="page-content">

        {/* ── Section 1: Vitals ── */}
        <section>
          <p className="section-label">Vitals</p>
          <div className="card">
            <div className="row">
              <span className="row-label">Wake Time</span>
              <div className="row-right">
                {wakeStatus(day.wakeTime) && (
                  <span className={`dot dot--${wakeStatus(day.wakeTime)}`} />
                )}
                <input
                  className="time-input"
                  type="time"
                  value={day.wakeTime}
                  onChange={e => update('wakeTime', e.target.value)}
                />
              </div>
            </div>
            <div className="divider" />
            <div className="row">
              <span className="row-label">Sleep Time</span>
              <div className="row-right">
                {sleepStatus(day.sleepTime) && (
                  <span className={`dot dot--${sleepStatus(day.sleepTime)}`} />
                )}
                <input
                  className="time-input"
                  type="time"
                  value={day.sleepTime}
                  onChange={e => update('sleepTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Sessions ── */}
        <section>
          <p className="section-label">Sessions</p>
          <div className="card">
            <div className="row">
              <span className="row-label">Live Class</span>
              <Toggle checked={day.liveClass} onChange={v => update('liveClass', v)} />
            </div>
            <div className="divider" />
            <div className="row">
              <span className="row-label">Afternoon Practice</span>
              <div className="row-right">
                <input
                  className="num-input"
                  type="number"
                  min="0"
                  max="12"
                  step="0.5"
                  value={day.afternoonHrs}
                  placeholder="0"
                  onChange={e => update('afternoonHrs', e.target.value)}
                />
                <span className="unit">hrs</span>
              </div>
            </div>
            <div className="divider" />
            <div className="row">
              <span className="row-label">Evening Session (10–12pm)</span>
              <div className="row-right">
                <input
                  className="num-input"
                  type="number"
                  min="0"
                  max="4"
                  step="0.5"
                  value={day.eveningHrs}
                  placeholder="0"
                  onChange={e => update('eveningHrs', e.target.value)}
                />
                <span className="unit">hrs</span>
              </div>
            </div>
            <div className="divider" />
            <div className="row">
              <span className="row-label">VARC Passage</span>
              <Toggle checked={day.varcPassage} onChange={v => update('varcPassage', v)} />
            </div>
          </div>
        </section>

        {/* ── Section 3: Today's Work ── */}
        <section>
          <p className="section-label">Today's Work</p>
          <div className="card">
            <CounterRow
              label="Quant"
              value={day.quantDone}
              target={DAILY_TARGETS.quant}
              onChange={v => update('quantDone', v)}
            />
            <div className="divider" />
            <CounterRow
              label="VARC Sets"
              value={day.varcDone}
              target={DAILY_TARGETS.varc}
              onChange={v => update('varcDone', v)}
            />
            <div className="divider" />
            <CounterRow
              label="LRDI Sets"
              value={day.lrdiDone}
              target={DAILY_TARGETS.lrdi}
              onChange={v => update('lrdiDone', v)}
            />
          </div>
        </section>

        {/* ── Section 4: Notes ── */}
        <section>
          <p className="section-label">Notes</p>
          <div className="notes-stack">
            <div className="card notes-card">
              <p className="notes-sub-label">iQuanta Work</p>
              <textarea
                className="notes-area"
                placeholder="What did you cover in iQuanta today?"
                value={day.iqQuantaNotes}
                onChange={e => update('iqQuantaNotes', e.target.value)}
              />
            </div>
            <div className="card notes-card">
              <p className="notes-sub-label">Journal</p>
              <textarea
                className="notes-area"
                placeholder="What did you study? How was the focus?"
                value={day.notes}
                onChange={e => update('notes', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Save ── */}
        <button
          className={`save-btn${saved ? ' save-btn--saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? 'Saved' : 'Save Day'}
        </button>

      </div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`toggle${checked ? ' toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="toggle-thumb" />
    </button>
  )
}

function CounterRow({ label, value, target, onChange }) {
  const met = value >= target
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      <div className="counter">
        <button
          type="button"
          className="counter-btn"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className={`counter-val${met ? ' counter-val--met' : ' counter-val--unmet'}`}>
          {value}
        </span>
        <span className="counter-target">/{target}</span>
        <button
          type="button"
          className="counter-btn"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
