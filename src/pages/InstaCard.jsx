import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import {
  loadData, getTotals, getDaysLeft, formatDate, todayKey,
  TARGETS, getDefaultDay,
} from '../utils/storage'
import './InstaCard.css'

export default function InstaCard() {
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const key = todayKey()
  const data = loadData()
  const today = data[key] ?? getDefaultDay()
  const totals = getTotals(data)
  const daysLeft = getDaysLeft()
  // Day number = total days logged; if today not yet saved, count it as next
  const hasToday = !!data[key]
  const dayNumber = Object.keys(data).length + (hasToday ? 0 : 1)

  async function handleDownload() {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#000000',
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `day-${dayNumber}-cat-prep.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const progressRows = [
    { label: 'Quant', done: totals.quantDone, target: TARGETS.quant },
    { label: 'VARC',  done: totals.varcDone,  target: TARGETS.varc  },
    { label: 'LRDI',  done: totals.lrdiDone,  target: TARGETS.lrdi  },
  ]

  // Big numbers show today's session counts; bars show cumulative progress
  const dailyCounts = [
    { val: today.quantDone, label: 'QUANT' },
    { val: today.varcDone,  label: 'VARC'  },
    { val: today.lrdiDone,  label: 'LRDI'  },
  ]

  const indicators = [
    { label: 'Live Class',    on: today.liveClass    },
    { label: 'VARC Passage',  on: today.varcPassage  },
  ]

  return (
    <div className="ic-page">

      {/* ── Card (captured by html2canvas) ── */}
      <div className="ic-card" ref={cardRef}>

        {/* TOP */}
        <div className="ic-top">
          <p className="ic-day-badge">DAY {dayNumber} OF 200</p>
          <p className="ic-date">{formatDate(key)}</p>
        </div>

        {/* BIG STATS — today's question counts */}
        <div className="ic-big-stats">
          {dailyCounts.map(({ val, label }) => (
            <div key={label} className="ic-big-stat">
              <span className="ic-big-num">{val}</span>
              <span className="ic-big-label">{label}</span>
            </div>
          ))}
        </div>

        {/* PROGRESS BARS — cumulative */}
        <div className="ic-bars">
          {progressRows.map(({ label, done, target }) => (
            <div key={label} className="ic-bar-row">
              <div className="ic-bar-meta">
                <span className="ic-bar-label">{label}</span>
                <span className="ic-bar-frac">{done.toLocaleString()}/{target.toLocaleString()}</span>
              </div>
              <div className="ic-track">
                <div
                  className="ic-fill"
                  style={{ width: `${Math.min(100, (done / target) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* TOGGLE INDICATORS */}
        <div className="ic-indicators">
          {indicators.map(({ label, on }) => (
            <div key={label} className="ic-indicator">
              <span className={`ic-dot${on ? ' ic-dot--on' : ''}`} />
              <span className="ic-indicator-label">{label}</span>
            </div>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="ic-bottom">
          <span className="ic-days-num">{daysLeft}</span>
          <span className="ic-cat-tag">CAT 2026</span>
        </div>

      </div>

      {/* ── Download button (outside card) ── */}
      <button
        className="ic-download-btn"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? 'Generating…' : 'Download Card'}
      </button>

    </div>
  )
}
