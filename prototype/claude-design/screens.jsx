// screens.jsx — All app screens for the CONQUER CAT mobile prototype
const { useState, useRef, useEffect } = React;

/* ── Icons (inline SVG, 24px viewBox) ─────────────────────────── */
const Icon = {
  today: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  progress: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 17l5-5 4 4 8-8" />
      <path d="M14 8h6v6" />
    </svg>
  ),
  calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  ),
  mentor: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 12a8 8 0 11-3.05-6.28L21 3v6h-6" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  ),
  card: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <circle cx="9" cy="11" r="2" />
      <path d="M21 16l-5-4-9 8" />
    </svg>
  ),
  profile: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </svg>
  ),
  send: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
};

/* ── Toggle ─── */
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button type="button" className={`toggle${checked ? ' toggle--on' : ''} ${disabled ? 'is-disabled' : ''}`}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}>
      <span className="toggle-thumb" />
    </button>
  );
}

/* ── Counter row (real app uses + / − around value) ─── */
function CounterRow({ label, sub, value, target, onChange }) {
  const met = value >= target;
  return (
    <div className="row">
      <div className="row-label-block">
        <span className="row-label">{label}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </div>
      <div className="counter">
        <button className="counter-btn" onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <span className={`counter-val ${met ? 'counter-val--met' : 'counter-val--unmet'}`}>{value}</span>
        <span className="counter-target">/{target}</span>
        <button className="counter-btn" onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

/* ── Session row with N/A toggle ─── */
function SessionRow({ label, sub, value, na, onValue, onNa }) {
  return (
    <div className="row session-row">
      <div className="row-label-block">
        <span className="row-label">{label}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </div>
      <div className="row-right">
        <button
          className={`na-pill ${na ? 'is-on' : ''}`}
          onClick={() => { onNa(!na); if (!na) onValue(false); }}
        >N/A</button>
        <Toggle checked={value} onChange={(v) => { onValue(v); if (v) onNa(false); }} disabled={na} />
      </div>
    </div>
  );
}

/* ── Effort score (computed like the real app) ─── */
function computeEffort(d) {
  const q  = Math.min((+d.q || 0) / 10, 1) * 18;
  const v  = Math.min((+d.v || 0) / 5, 1) * 12;
  const l  = Math.min((+d.l || 0) / 5, 1) * 12;
  const vpScore = ((d.vp || d.vp_na) ? 1 : 0) * 4;
  const sessionMins =
    ((d.lc || d.lc_na) ? 120 : 0) +
    ((d.as || d.as_na) ? 40 : 0) +
    ((d.ap || d.ap_na) ? 120 : 0) +
    ((+d.ph || 0) * 60) + (+d.pm || 0);
  const hrs = Math.min(sessionMins / 300, 1) * 16;
  const lc  = ((d.lc || d.lc_na) ? 1 : 0) * 8;
  const sudokuScore = d.sk ? 4 : 0;
  const vedicScore = d.vm ? 2 : 0;
  const catAppScore = d.ca ? 1 : 0;
  // simplified — real app has sleep & backlog factors too
  return Math.min(100, Math.round(q + v + l + vpScore + hrs + lc + sudokuScore + vedicScore + catAppScore));
}

/* ─────────────────────────── TODAY ─────────────────────────── */
function TodayScreen({ day, setDay, saved, onSave, simDate = 'today', mode = 'prep', setPage, userProfile = {} }) {
  const update = (k, v) => setDay((p) => ({ ...p, [k]: v }));

  // Simulated date drives conditional UI
  const inAppWindow = simDate === 'app';
  const inFinalPush = simDate === 'push';
  const isExamDay = simDate === 'exam';
  const dateLabel = simDate === 'app'  ? 'Sat, 15 Aug · Day 127'
                  : simDate === 'push' ? 'Wed, 25 Nov · Day 229'
                  : simDate === 'exam' ? 'Sun, 29 Nov · Day 233'
                  :                      'Tue, 27 May · Day 47';
  const daysLeftLabel = simDate === 'app'  ? '106 days left'
                      : simDate === 'push' ? '4 days left'
                      : simDate === 'exam' ? 'Today is the day.'
                      :                      '186 days left';

  const finalPushMessage = inFinalPush
    ? 'Revise calmly. The paper rewards the mind that does not rush.'
    : null;

  const prepQuotes = [
    'Consistency beats intelligence. Every single time.',
    'One more set. Always one more set.',
    '99.9 percentile is not a dream. It is a decision.',
    'The CAT is not testing your knowledge. It is testing your discipline.',
    'Every set you skip today is a percentile you lose in November.',
    'Your future batchmates at IIM-A are studying right now.',
    'Vikram cracked CAT at 3am with no internet. What\u2019s your excuse?',
    'The IIM interview room doesn\u2019t care about your excuses.',
  ];
  const interviewQuotes = [
    'They have your scores. Now they want your story.',
    'Speak with conviction, not just correctness.',
    'One mock interview a day keeps the rejection away.',
    'Know your SOP better than you know yourself.',
    'The panel can smell nervousness. Practice until it leaves.',
    'They\u2019re not looking for the smartest person. They want the clearest thinker.',
    'The PI is not a test of knowledge. It is a test of who you are.',
    'Every IIM topper stumbled in a mock before they walked into the real room.',
  ];
  const quoteList = mode === 'interview' ? interviewQuotes : prepQuotes;
  const dailyQuote = simDate === 'exam'
    ? 'You earned today. Go break the exam.'
    : simDate === 'app'
    ? 'The application is the first promise you make to your future self.'
    : simDate === 'push'
    ? 'No new tricks this week. Sharpen what already cuts.'
    : quoteList[new Date().getDate() % quoteList.length];

  // Live calculations
  const effort = computeEffort(day);
  const sessionMins =
    ((day.lc || day.lc_na) ? 120 : 0) +
    ((day.as || day.as_na) ? 40 : 0) +
    ((day.ap || day.ap_na) ? 120 : 0) +
    ((day.vp || day.vp_na) ? 20 : 0) +
    ((+day.ph || 0) * 60) + (+day.pm || 0);
  const totalH = Math.floor(sessionMins / 60);
  const totalM = sessionMins % 60;
  const totalDisplay = totalH > 0 && totalM > 0 ? `${totalH}h ${totalM}m` : totalH > 0 ? `${totalH}h` : `${totalM}m`;

  // Sleep validation (4–6h optimal in the real app)
  const sleepDur = (() => {
    if (!day.st || !day.wt) return null;
    const [sh, sm] = day.st.split(':').map(Number);
    const [wh, wm] = day.wt.split(':').map(Number);
    let mins = (wh * 60 + wm) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    return mins / 60;
  })();
  const sleepWarn = sleepDur !== null && (sleepDur < 4 ? 'Too little sleep — minimum 4 hours' : sleepDur > 6 ? 'Too much sleep — max 6 hours for CAT prep' : '');

  return (
    <React.Fragment>
      <header className="top-header">
        <div className="top-header-row">
          <div>
            <h1 className="greeting">Good morning, {userProfile.name?.split(' ')[0] || 'there'}.</h1>
            <p className="greeting-sub">{dateLabel}</p>
            <p className="daily-quote">"{dailyQuote}"</p>
          </div>
          <span className="days-badge">{daysLeftLabel}</span>
        </div>
        <div className="effort-bar">
          <div className="effort-label">
            <span>Today's effort</span>
            <strong>{effort}<span className="effort-unit">/100</span></strong>
          </div>
          <div className="effort-track">
            <div className="effort-fill" style={{ width: `${effort}%` }} />
          </div>
        </div>
        {finalPushMessage && (
          <div className="final-push-note">⚓ Final push · {finalPushMessage}</div>
        )}
      </header>

      <main className="main">
        <div className="page-content">

          {/* Vitals */}
          <section>
            <p className="section-label">Vitals · sleep window 4–6h</p>
            <div className="card">
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Wake Time</span>
                  <span className="row-sub">Target: before 06:00</span>
                </div>
                <div className="row-right">
                  <span className={`dot dot--${day.wt && day.wt <= '06:00' ? 'green' : 'orange'}`} />
                  <input className="time-input" type="time" value={day.wt}
                         onChange={(e) => update('wt', e.target.value)} />
                </div>
              </div>
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Sleep Time</span>
                  <span className="row-sub">Last night · target 23:30 or earlier</span>
                </div>
                <div className="row-right">
                  <span className={`dot dot--${day.st && day.st <= '23:30' ? 'green' : 'orange'}`} />
                  <input className="time-input" type="time" value={day.st}
                         onChange={(e) => update('st', e.target.value)} />
                </div>
              </div>
              {sleepWarn && (
                <div className="warn-strip">⚠ {sleepWarn}</div>
              )}
              {sleepDur !== null && !sleepWarn && (
                <div className="info-strip">✓ Slept {sleepDur.toFixed(1)}h · in the optimal window</div>
              )}
            </div>
          </section>

          {/* Sessions */}
          <section>
            <p className="section-label">Sessions · {totalDisplay} total</p>
            <div className="card">
              <SessionRow
                label="Live Class" sub="7–9 PM · 120 min"
                value={day.lc} na={day.lc_na}
                onValue={(v) => update('lc', v)} onNa={(v) => update('lc_na', v)}
              />
              <div className="divider" />
              <SessionRow
                label="Afternoon Session" sub="40 min"
                value={day.as} na={day.as_na}
                onValue={(v) => update('as', v)} onNa={(v) => update('as_na', v)}
              />
              <div className="divider" />
              <SessionRow
                label="Application Class" sub="10 PM – 12 AM · 120 min"
                value={day.ap} na={day.ap_na}
                onValue={(v) => update('ap', v)} onNa={(v) => update('ap_na', v)}
              />
              <div className="divider" />
              <SessionRow
                label="VARC Passage" sub="20 min · 1 passage"
                value={day.vp} na={day.vp_na}
                onValue={(v) => update('vp', v)} onNa={(v) => update('vp_na', v)}
              />
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Personal Practice</span>
                  <span className="row-sub">Beyond classes</span>
                </div>
                <div className="row-right hours-mins">
                  <input className="num-input" type="number" min="0" max="12" value={day.ph}
                         onChange={(e) => update('ph', e.target.value)} />
                  <span className="unit">h</span>
                  <input className="num-input" type="number" min="0" max="59" value={day.pm}
                         onChange={(e) => update('pm', e.target.value)} />
                  <span className="unit">m</span>
                </div>
              </div>
            </div>
          </section>

          {/* Today's Work */}
          <section>
            <p className="section-label">Today's Work · CAT 2026 targets</p>
            <div className="card">
              <CounterRow label="Quant" sub="Target: 10" value={day.q} target={10} onChange={(v) => update('q', v)} />
              <div className="divider" />
              <CounterRow label="VARC sets" sub="Target: 5" value={day.v} target={5} onChange={(v) => update('v', v)} />
              <div className="divider" />
              <CounterRow label="LRDI sets" sub="Target: 5" value={day.l} target={5} onChange={(v) => update('l', v)} />
              <div className="divider" />
              <CounterRow label="VARC Para" sub="Target: 1 passage" value={day.vp_count} target={1} onChange={(v) => update('vp_count', v)} />
            </div>
          </section>

          {/* Mind Sharpeners */}
          <section>
            <p className="section-label">Mind Sharpeners</p>
            <div className="card">
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Sudoku</span>
                  <span className="row-sub">Daily speed warmup</span>
                </div>
                <Toggle checked={day.sk} onChange={(v) => update('sk', v)} />
              </div>
              {day.sk && (
                <React.Fragment>
                  <div className="divider" />
                  <div className="row">
                    <div className="row-label-block">
                      <span className="row-label">Time taken</span>
                      <span className="row-sub">min · sec</span>
                    </div>
                    <div className="row-right hours-mins">
                      <input className="num-input" type="number" min="0" max="59" value={day.skm}
                             onChange={(e) => update('skm', e.target.value)} />
                      <span className="unit">m</span>
                      <input className="num-input" type="number" min="0" max="59" value={day.sks}
                             onChange={(e) => update('sks', e.target.value)} />
                      <span className="unit">s</span>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="row">
                    <div className="row-label-block">
                      <span className="row-label">Difficulty</span>
                      <span className="row-sub">Puzzle level</span>
                    </div>
                    <div className="seg">
                      {['easy', 'medium', 'hard'].map((lvl) => (
                        <button key={lvl}
                          className={`seg-pill ${day.skd === lvl ? 'is-on' : ''}`}
                          onClick={() => update('skd', lvl)}>{lvl}</button>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              )}
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Vedic Math</span>
                  <span className="row-sub">Speed-trick practice</span>
                </div>
                <Toggle checked={day.vm} onChange={(v) => update('vm', v)} />
              </div>
              {day.vm && (
                <React.Fragment>
                  <div className="divider" />
                  <div className="row inline-input-row">
                    <span className="row-label">Topic</span>
                    <input className="inline-input" type="text"
                           value={day.vmt}
                           placeholder="e.g. Vinculum subtraction"
                           onChange={(e) => update('vmt', e.target.value)} />
                  </div>
                </React.Fragment>
              )}
            </div>
          </section>

          {/* iQuanta Backlog summary */}
          <section>
            <p className="section-label">iQuanta Backlog</p>
            <button className="card backlog-card" onClick={() => setPage && setPage('backlog')}>
              <div className="row-label-block">
                <span className="row-label">12 items pending</span>
                <span className="row-sub">7 videos · 5 concepts · 42% covered</span>
              </div>
              <span className="card-chevron">›</span>
            </button>
          </section>

          {/* Timetable + Assessment nav cards */}
          <section>
            <p className="section-label">Timetable &amp; Assessment</p>
            <div className="card">
              <button className="card-row-btn" onClick={() => setPage && setPage('timetable')}>
                <div className="row-label-block">
                  <span className="row-label">Weekly Timetable</span>
                  <span className="row-sub">iQuanta live + application class schedule</span>
                </div>
                <span className="card-chevron">›</span>
              </button>
              <div className="divider" />
              <button className="card-row-btn" onClick={() => setPage && setPage('assessment')}>
                <div className="row-label-block">
                  <span className="row-label">
                    {simDate === 'today' ? 'Daily Assessment' : (new Date().getDay() === 0 ? 'Weekly Assessment' : 'Daily Assessment')}
                  </span>
                  <span className="row-sub">
                    {simDate === 'today' ? 'Daily · 6 questions · 12 min' : 'Daily Mon–Sat (6q) · Sunday weekly (30q)'}
                  </span>
                </div>
                <span className="card-chevron">›</span>
              </button>
            </div>
          </section>

          {/* CAT Application — only visible Aug 1 – Sep 20 in production */}
          {inAppWindow && (
            <section>
              <p className="section-label">
                <span style={{ color: '#38c9f7' }}>●</span> CAT Exam Application
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 6 }}>
                  · Aug 1 – Sep 20 window
                </span>
              </p>
              <div className={`card cat-app-card ${day.ca ? 'is-done' : ''}`}>
                <div className="row">
                  <div className="row-label-block">
                    <span className="row-label">
                      CAT application submitted
                      {day.ca && <span className="cat-app-tick">  ✓</span>}
                    </span>
                    <span className="row-sub">Key task · once per CAT cycle · +1 effort point</span>
                  </div>
                  <Toggle checked={day.ca} onChange={(v) => update('ca', v)} />
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          <section>
            <p className="section-label">Notes</p>
            <div className="notes-stack">
              <div className="card notes-card">
                <p className="notes-sub-label">iQuanta Notes</p>
                <textarea className="notes-area"
                  placeholder="What did you cover in iQuanta today? Topics, videos watched, key takeaways…"
                  value={day.iq}
                  onChange={(e) => update('iq', e.target.value)}
                />
              </div>
              <div className="card notes-card">
                <p className="notes-sub-label">Journal</p>
                <textarea className="notes-area"
                  placeholder="What did you study? How was the focus level? What needs work tomorrow?"
                  value={day.n}
                  onChange={(e) => update('n', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="save-btn-wrap">
            <button className={`save-btn ${saved ? 'save-btn--saved' : ''}`} onClick={onSave}>
              {saved ? 'Saved ✓' : 'Save Day'}
            </button>
          </div>
        </div>
      </main>
    </React.Fragment>
  );
}

/* ─────────────────────────── PROGRESS ─────────────────────────── */
function ProgressScreen({ day }) {
  const subjects = [
    { label: 'Quant', done: 327 + (+day.q||0), target: 2000 },
    { label: 'VARC', done: 148 + (+day.v||0), target: 1000 },
    { label: 'LRDI', done: 142 + (+day.l||0), target: 1000 },
  ];
  const week = ['M','T','W','T','F','S','S'];
  const weekState = ['met','met','met','missed','met','met','none'];
  const dates = [21,22,23,24,25,26,27];

  return (
    <React.Fragment>
      <header className="top-header">
        <div className="top-header-row">
          <div>
            <h1 className="greeting">Scoreboard</h1>
            <p className="greeting-sub">186 days to CAT 2026</p>
          </div>
          <span className="days-badge">{(+day.q||0) + (+day.v||0) + (+day.l||0)} today</span>
        </div>
      </header>

      <main className="main">
        <div className="page-content">
          {/* Effort score chart — last 30 days */}
          <section>
            <p className="section-label">Effort score · last 30 days</p>
            <div className="card chart-card">
              <div className="chart-head">
                <div>
                  <div className="chart-num">73<span style={{ fontSize: 14, opacity: 0.5 }}> /100 avg</span></div>
                  <div className="chart-sub">↑ 64 pts since voyage start</div>
                </div>
                <span className="chart-trend">📈 trending up</span>
              </div>
              {(() => {
                const data = [24,38,45,52,48,60,64,58,62,71,68,75,70,67,78,82,79,73,81,85,72,78,84,88,76,82,89,91,85,88,78];
                const W = 360, H = 110;
                const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - (v / 100) * H]);
                const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
                const area = `${line} L ${W} ${H} L 0 ${H} Z`;
                const last = pts[pts.length - 1];
                return (
                  <React.Fragment>
                    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H, display: 'block', marginTop: 10 }}>
                      <defs>
                        <linearGradient id="effortFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {[25, 50, 75].map((v) => {
                        const y = H - (v / 100) * H;
                        return <line key={v} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>;
                      })}
                      <path d={area} fill="url(#effortFill)"/>
                      <path d={line} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                      <circle cx={last[0]} cy={last[1]} r="6" fill="#f97316"/>
                      <circle cx={last[0]} cy={last[1]} r="3" fill="#fff"/>
                    </svg>
                    <div className="chart-axis">
                      <span>Day 17</span>
                      <span>Day 32</span>
                      <span>Today · Day 47</span>
                    </div>
                  </React.Fragment>
                );
              })()}
            </div>
          </section>

          <section>
            <div className="card">
              {subjects.map(({ label, done, target }, i) => {
                const pct = Math.min(100, Math.round((done / target) * 100));
                const remaining = Math.max(0, target - done);
                return (
                  <div key={label} className="progress-block">
                    <div className="progress-header">
                      <span className="progress-label">{label}</span>
                      <span className="progress-fraction">{done.toLocaleString()} / {target.toLocaleString()}</span>
                      <span className="progress-pct">{pct}%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                    <p className="progress-note">{remaining.toLocaleString()} remaining — need {Math.ceil(remaining/186)}/day to finish on time</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="card">
              <h2 className="pg-section-title">Streak</h2>
              <div className="streak-block">
                <span className="streak-number">12</span>
                <span className="streak-unit">days</span>
              </div>
              <p className="streak-sub">consecutive days hitting all daily targets</p>
            </div>
          </section>

          <section>
            <div className="card">
              <h2 className="pg-section-title">This Week</h2>
              <div className="week-row">
                {week.map((label, i) => (
                  <div key={i} className="week-day">
                    <div className={`week-circle week-circle--${weekState[i]}`} />
                    <span className="week-label">{label}</span>
                    <span className="week-date">{dates[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="card stats-card">
              <div className="stat-item">
                <span className="stat-value">47</span>
                <span className="stat-label">Days Tracked</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">186.5</span>
                <span className="stat-label">Study Hours</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </React.Fragment>
  );
}

/* ─────────────────────────── CALENDAR (One Piece sea) ─────────────────────────── */
function CalendarScreen({ setPage }) {
  const [selectedDay, setSelectedDay] = useState(27);
  // Voyage starts on the prep start date — Apr 10, 2026 (Day 1)
  const START_MONTH_IDX = 0;       // April is index 0 in MONTHS
  const START_DAY = 10;            // start date day-of-month
  const TODAY_MONTH_IDX = 1;       // May (current)
  const TODAY_DAY = 27;

  const [monthIdx, setMonthIdx] = useState(TODAY_MONTH_IDX);
  const [voyageMode, setVoyageMode] = useState(() => {
    try { return localStorage.getItem('op_voyage_mode') !== 'off'; }
    catch { return true; }
  });

  function toggleVoyage() {
    setVoyageMode((prev) => {
      const next = !prev;
      try { localStorage.setItem('op_voyage_mode', next ? 'on' : 'off'); } catch {}
      return next;
    });
  }

  // Voyage spans Apr 10 → Nov 29. Months before April are excluded.
  const MONTHS = [
    { label: 'April 2026',    island: 'Baratie',        days: 30, firstDay: 3 },
    { label: 'May 2026',      island: 'Arlong Park',    days: 31, firstDay: 5 },
    { label: 'June 2026',     island: 'Skypiea',        days: 30, firstDay: 1 },
    { label: 'July 2026',     island: 'Enies Lobby',    days: 31, firstDay: 3 },
    { label: 'August 2026',   island: 'Marineford',     days: 31, firstDay: 6 },
    { label: 'September 2026',island: 'Wano',           days: 30, firstDay: 2 },
    { label: 'October 2026',  island: 'Egghead',        days: 31, firstDay: 4 },
    // November ends the voyage: Elbaf 1–28, Laugh Tale on the 29th (CAT day)
    { label: 'November 2026', island: 'Elbaf → Laugh Tale', days: 29, firstDay: 0 },
  ];
  const month = MONTHS[monthIdx];

  // April started on the 10th — days 1-9 are pre-voyage (greyed out)
  // May is the current month with mostly met days, today = May 27.
  const dayStates = monthIdx === 0
    ? Object.fromEntries(Array.from({length: 30}, (_, i) => {
        const d = i + 1;
        if (d < START_DAY) return [d, 'pre'];
        // Apr 10–30: 21 days of mostly met with a couple missed
        return [d, (d % 7 === 4 ? 'missed' : 'met')];
      }))
    : monthIdx === TODAY_MONTH_IDX
      ? {
          1:'met',2:'met',3:'missed',4:'met',5:'met',6:'met',7:'met',
          8:'met',9:'missed',10:'met',11:'met',12:'met',13:'met',14:'met',
          15:'met',16:'missed',17:'met',18:'met',19:'met',20:'met',21:'met',
          22:'met',23:'met',24:'missed',25:'met',26:'met',27:'today',
        }
      : {};

  const isAugSep = monthIdx === 4 || monthIdx === 5;  // Aug=4, Sep=5 in the new array
  const isPushMonth = monthIdx === 7;                  // Nov=7
  const isCATMonth = monthIdx === 7;

  const cells = [];
  for (let i = 0; i < month.firstDay; i++) cells.push({ blank: true });
  for (let d = 1; d <= month.days; d++) {
    let state = dayStates[d] || 'future';
    if (state === 'future') {
      if (isAugSep && (monthIdx === 4 ? d >= 1 : d <= 20)) state = 'cat-app';
      if (isPushMonth && d >= 23 && d <= 29) state = 'push';
      if (isCATMonth && d === 29) state = 'exam';
    }
    cells.push({ day: d, state });
  }

  const metCount = Object.values(dayStates).filter((s) => s === 'met').length;
  const missedCount = Object.values(dayStates).filter((s) => s === 'missed').length;

  const MAX_IDX = MONTHS.length - 1;

  return (
    <div className={`cal-page ${voyageMode ? 'cal-voyage' : 'cal-plain'}`}>
      <div className="app-bg-paint" />

      {/* Rope strip removed — felt absurd on top */}

      <header className="cal-hero">
        <div className="cal-hero-toolbar">
          <button
            className={`op-mode-toggle ${voyageMode ? 'opm-on' : ''}`}
            onClick={toggleVoyage}
            aria-pressed={voyageMode}
          >
            <span className="opm-icon">⚓</span>
            <span className="opm-label">{voyageMode ? 'Voyage' : 'Plain'}</span>
            <span className="opm-track">
              <span className="opm-knob" />
            </span>
          </button>
        </div>

        <div className="cal-hero-top">
          {voyageMode ? (
            <React.Fragment>
              <p className="cal-eyebrow">⚓ THE GRAND LINE · {month.island.toUpperCase()}</p>
              <h1 className="cal-title-new">Voyage to CAT 2026</h1>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <p className="cal-eyebrow cal-eyebrow--plain">CALENDAR</p>
              <h1 className="cal-title-new cal-title-new--plain">CAT 2026 Progress</h1>
            </React.Fragment>
          )}
        </div>

        <div className="dday-poster">
          {voyageMode && (
            <React.Fragment>
              <div className="dday-poster-corner dday-corner-tl" />
              <div className="dday-poster-corner dday-corner-tr" />
              <div className="dday-poster-corner dday-corner-bl" />
              <div className="dday-poster-corner dday-corner-br" />
            </React.Fragment>
          )}
          <div className="dday-label">D-DAY COUNTDOWN</div>
          <div className="dday-number">186</div>
          <div className="dday-unit">DAYS LEFT</div>
          <div className="dday-divider" />
          <div className="dday-meta">
            <div className="dday-meta-block">
              <span className="dday-meta-label">CAT 2026</span>
              <span className="dday-meta-val">29 Nov</span>
            </div>
            <div className="dday-meta-block">
              <span className="dday-meta-label">{voyageMode ? 'Voyage Day' : 'Day'}</span>
              <span className="dday-meta-val">47 / 233</span>
            </div>
          </div>

        </div>
      </header>

      <main className="main">
        <div className="cal-monthnav">
          <button className="cal-monthbtn" onClick={() => setMonthIdx((m) => Math.max(0, m - 1))} aria-label="Previous month" disabled={monthIdx === 0}>‹</button>
          <span className="cal-monthlabel">{month.label}</span>
          <button className="cal-monthbtn" onClick={() => setMonthIdx((m) => Math.min(10, m + 1))} aria-label="Next month" disabled={monthIdx === 10}>›</button>
        </div>

        <div className={voyageMode ? 'sea-v2' : 'plain-grid-wrap'}>
          <div className={voyageMode ? 'sea-weekdays-v2' : 'plain-weekdays'}>
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className={voyageMode ? 'sea-grid-v2' : 'plain-grid'}>
            {cells.filter((it) => it.state !== 'exam').map((it, i) =>
              it.blank
                ? <div key={i} className={voyageMode ? 'sea-cell sea-cell--blank' : 'plain-cell plain-cell--blank'} />
                : (
                    <button
                      key={i}
                      className={voyageMode
                        ? `sea-cell sea-cell--${it.state} ${selectedDay === it.day && monthIdx === 1 ? 'is-selected' : ''}`
                        : `plain-cell plain-cell--${it.state} ${selectedDay === it.day && monthIdx === 1 ? 'is-selected' : ''}`}
                      onClick={() => setSelectedDay(it.day)}
                      title={
                        it.state === 'cat-app' ? 'CAT application window'
                        : it.state === 'push' ? 'Final push' : ''
                      }
                    >
                      <span className={voyageMode ? 'sea-cell-num' : 'plain-cell-num'}>{it.day}</span>
                      {it.state === 'today' && (
                        <span className="cell-glyph cell-glyph--ship" aria-hidden="true">⛵</span>
                      )}
                    </button>
                  )
            )}
          </div>

          {/* Giant Nov 29 treasure button — the climax of the voyage */}
          {isCATMonth && (
            <button
              className="dday-treasure-btn"
              onClick={() => setPage && setPage('dday')}
            >
              <div className="dday-treasure-pulse" aria-hidden="true" />
              <div className="dday-treasure-content">
                <span className="dday-treasure-icon" aria-hidden="true">👑</span>
                <div className="dday-treasure-text">
                  <div className="dday-treasure-meta">SUN · NOV 29 · 2026</div>
                  <div className="dday-treasure-title">LAUGH TALE</div>
                  <div className="dday-treasure-sub">CAT 2026 · the destination · tap to reveal</div>
                </div>
              </div>
            </button>
          )}

          {voyageMode && (
            <div className="sea-waves" aria-hidden="true">
              <svg viewBox="0 0 400 30" preserveAspectRatio="none">
                <path d="M0 14 Q 25 4, 50 14 T 100 14 T 150 14 T 200 14 T 250 14 T 300 14 T 350 14 T 400 14 V 30 H 0 Z" fill="currentColor" opacity="0.45"/>
                <path d="M0 20 Q 25 12, 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 V 30 H 0 Z" fill="currentColor" opacity="0.75"/>
              </svg>
            </div>
          )}
        </div>

        <div className="cal-legend">
          <span className="legend-item"><span className="legend-dot legend-dot--met" />Met ({metCount})</span>
          <span className="legend-item"><span className="legend-dot legend-dot--missed" />Missed ({missedCount})</span>
          <span className="legend-item"><span className="legend-dot legend-dot--today" />Today</span>
          <span className="legend-item"><span className="legend-dot legend-dot--cat-app" />CAT app</span>
          <span className="legend-item"><span className="legend-dot legend-dot--push" />Final push</span>
          <span className="legend-item"><span className="legend-dot legend-dot--exam" />Exam day</span>
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────── MENTOR ─────────────────────────── */
function MentorScreen() {
  const [msgs, setMsgs] = useState([
    { who: 'them', text: "Day 47. Two backlog videos still pending from last week. What's the plan?" },
    { who: 'me', text: "Finishing both today after the live class. Quant TSD set + the VARC reasoning RC." },
    { who: 'them', text: "Good. But your sleep is drifting — 12:40, 11:55, 1:10. You can't run a CAT marathon on 5 hours. Fix it." },
    { who: 'them', text: "Test me on TSD tomorrow morning. 6 questions, 12 minutes." },
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  function send() {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { who: 'me', text: input.trim() }]);
    setInput('');
    setTimeout(() => {
      setMsgs((m) => [...m, { who: 'them', text: "Logged. Show me the result by 7 AM. No excuses." }]);
    }, 700);
  }

  return (
    <div className="mentor-page">
      <header className="mentor-head">
        <window.MentorAvatar size={42} />
        <div className="mentor-info">
          <div className="mentor-name">Vikram Anand</div>
          <div className="mentor-status">Mentor · online</div>
        </div>
        <button className="mentor-action-btn" aria-label="Quick actions">⋯</button>
      </header>

      <div className="mentor-quick">
        <button className="quick-chip">📊 Am I on track?</button>
        <button className="quick-chip">🧪 Test me this week</button>
        <button className="quick-chip">🎯 Start mock PI</button>
        <button className="quick-chip">✍️ WAT topic</button>
      </div>

      <div className="mentor-chat" ref={chatRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`msg-wrap ${m.who === 'me' ? 'msg-wrap--me' : 'msg-wrap--them'}`}>
            {m.who === 'them' && <window.MentorAvatar size={28} />}
            <div className={`msg ${m.who === 'me' ? 'msg-me' : 'msg-them'}`}>{m.text}</div>
          </div>
        ))}
      </div>

      <div className="mentor-composer">
        <input
          className="composer-input"
          placeholder="Ask Vikram…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="composer-send" onClick={send} disabled={!input.trim()}>
          <Icon.send />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── D-DAY REVEAL (Nov 29, 2026) ─────────────────────────── */
const DDAY_MOTIFS = [
  { symbol: '🏴\u200d☠️', title: 'Straw Hat Resolve',  copy: 'Put the dream on your head. Walk in like the sea already made space for you.',     source: 'One Piece spirit',          color: 'op' },
  { symbol: '⚡', title: 'Saiyan Calm',         copy: 'Power is not noise today. It is quiet pressure, clean breathing, and one more sharp decision.', source: 'Dragon Ball spirit', color: 'db' },
  { symbol: '⚔',  title: 'Soul Blade',          copy: 'Cut only what matters. Skip the traps. Slice through the paper with discipline.', source: 'Bleach spirit',              color: 'bl' },
  { symbol: '✦', title: 'Five-Leaf Will',      copy: 'When the section gets loud, your months of practice get louder. You earned that voice.', source: 'Black Clover spirit',   color: 'bc' },
  { symbol: '🥊', title: 'Final Round',         copy: 'Guard up. Feet steady. Question by question. No panic gets to sit in your corner.', source: 'Boxing anime spirit',    color: 'fr' },
  { symbol: '🔥', title: 'Break Point',         copy: 'The exam is not bigger than your preparation. Let it meet the version of you that stayed.', source: 'Shonen fire spirit',  color: 'bp' },
  { symbol: '🍥', title: 'Hidden Leaf Grit',    copy: 'No shortcut built you. Repetition did. Walk in with the stubborn courage that kept returning.', source: 'Naruto spirit',     color: 'nr' },
  { symbol: '💥', title: 'Hero Academia',       copy: 'A real hero moves while afraid. Today your quirk is preparation, patience, and clean execution.', source: 'My Hero Academia spirit', color: 'mha' },
  { symbol: '🥊', title: 'Ippo Steps',          copy: 'Small steps made the fighter. Small choices will make the score. Keep your rhythm.', source: 'Hajime no Ippo spirit', color: 'ip' },
  { symbol: '🏐', title: 'Court Momentum',      copy: 'Jump for the next point only. The last miss cannot touch the next serve.', source: 'Haikyuu spirit',                color: 'hk' },
  { symbol: '🏀', title: 'Zone Focus',          copy: 'The crowd disappears. The clock disappears. Only the next question and your hand remain.', source: 'Kuroko\u2019s Basketball spirit', color: 'kk' },
  { symbol: '🧭', title: 'Scout Discipline',    copy: 'Look straight at the giant. Break it into parts. Attack the weak point without drama.', source: 'Attack on Titan spirit', color: 'aot' },
  { symbol: '🛡', title: 'Shield Rise',         copy: 'Every hard day became armor. Today, pressure hits you and turns into structure.', source: 'Shield Hero spirit',        color: 'sh' },
  { symbol: '🌊', title: 'Water Breathing',     copy: 'Inhale, read, eliminate, choose. Let calm become your technique.', source: 'Demon Slayer spirit',                color: 'ds' },
  { symbol: '🏃', title: 'Long Run',            copy: 'This was never one sprint. It was the road you kept taking when nobody clapped.', source: 'Run with the Wind spirit',  color: 'rw' },
];

const DDAY_GITA = [
  {
    sanskrit: 'Karmaṇy-evādhikāras te mā phaleṣu kadācana.',
    teaching: 'Your right is to the action, never to its fruit. Walk into the hall focused on the next question — not on the result that lives beyond it.',
  },
  {
    sanskrit: 'Klaibyaṃ mā sma gamaḥ Pārtha — naitat tvayy upapadyate.',
    teaching: 'Do not yield to weakness, Arjuna. Cowardice does not belong to one who has trained. Stand up, breathe, and aim.',
  },
  {
    sanskrit: 'Yogaḥ karmasu kauśalam.',
    teaching: 'Yoga is skill in action. Calm focus, not noise, is the technique. Steady mind. Sharp hand. Clean choice.',
  },
];

function DDayRevealScreen({ simDate = 'today' }) {
  // Reveal is purely date-driven in production: today >= 2026-11-29.
  // In this prototype, the "Simulate date" tweak drives it. No in-page toggle.
  const revealed = simDate === 'exam';

  return (
    <div className="dday-page">
      <header className="top-header dday-page-header">
        <p className="section-label" style={{ color: 'var(--ac)', letterSpacing: '0.14em' }}>
          ★ D-DAY · 29 NOVEMBER 2026
        </p>
        <h1 className="greeting" style={{ fontSize: 30, lineHeight: 1.05 }}>
          {revealed ? 'Today is not for logging.' : 'Almost there.'}
        </h1>
        <p className="greeting-sub" style={{ marginTop: 4 }}>
          CAT 2026 · exam day
        </p>
        <p className="dday-preview-hint">
          Auto-unlocks on Nov 29 · use Tweaks → Simulate date → exam to preview
        </p>
      </header>

      <main className="main">
        <div className="page-content">
          {!revealed ? (
            <div className="card dday-locked-card">
              <p className="dday-eyebrow">Surprise under construction</p>
              <h2 className="dday-locked-title">This opens when it matters.</h2>
              <p className="dday-locked-body">
                This opens strictly on Nov 29. The final room is being kept quiet for you.
              </p>
            </div>
          ) : (
            <React.Fragment>
              <div className="card dday-hero-card">
                <p className="dday-eyebrow">Today is not for logging</p>
                <h2 className="dday-hero-title">Go break the exam.</h2>
                <p className="dday-hero-body">
                  No checklist today. No score pressure. Walk in calm, read cleanly, choose
                  sharply, and trust the work you stacked for months.
                </p>
                <div className="dday-confetti" aria-hidden="true" />
              </div>

              <section>
                <p className="section-label">15 spirits · channel one before each section</p>
                <div className="dday-motifs">
                  {DDAY_MOTIFS.map((it, i) => (
                    <div key={it.title} className={`dday-motif dday-motif--${it.color}`} style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="dday-motif-mark-wrap">
                        <span className="dday-motif-halo" aria-hidden="true" />
                        <span className="dday-motif-mark" aria-hidden="true">{it.symbol}</span>
                      </div>
                      <div className="dday-motif-body">
                        <div className="dday-motif-title">{it.title}</div>
                        <div className="dday-motif-copy">{it.copy}</div>
                        <div className="dday-motif-source">— {it.source}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="section-label">Vikram&rsquo;s final note</p>
                <div className="card dday-mentor-card">
                  <window.MentorAvatar size={52} />
                  <div className="dday-mentor-bubble">
                    <p className="dday-mentor-title">Vikram, your mentor</p>
                    <p className="dday-mentor-text">
                      Vikram here. You do not need a new strategy today. You need the courage
                      to execute the one you earned. Breathe before every section. Fight every
                      question on merit. Leave nothing emotional inside the hall. You are ready,
                      and the paper is walking into your arena now.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p className="section-label">Gita Upadesam · 3 teachings</p>
                <div className="dday-gita-stack">
                  {DDAY_GITA.map((g, i) => (
                    <div key={i} className="card dday-gita-card">
                      <div className="dday-gita-watermarks" aria-hidden="true">
                        <span>🪶</span><span>♫</span><span>☸</span>
                      </div>
                      <p className="dday-gita-label">Teaching {i + 1}</p>
                      <p className="dday-gita-sanskrit">{g.sanskrit}</p>
                      <p className="dday-gita-teaching">{g.teaching}</p>
                    </div>
                  ))}
                  <div className="card dday-gita-final">
                    <p className="dday-gita-label" style={{ color: '#f5c518' }}>Final Word</p>
                    <p className="dday-gita-final-line">
                      Do your karma. Release the result. Step into the hall like you are guided,
                      protected, and fully awake.
                    </p>
                  </div>
                </div>
              </section>

              <div className="save-btn-wrap">
                <button className="save-btn">Back to Calendar</button>
              </div>
            </React.Fragment>
          )}
        </div>
      </main>
    </div>
  );
}
function InstaCardScreen({ day, avatar, userProfile = {} }) {
  const totalStudiedMins =
    ((day.lc || day.lc_na) ? 120 : 0) +
    ((day.as || day.as_na) ? 40 : 0) +
    ((day.ap || day.ap_na) ? 120 : 0) +
    ((day.vp || day.vp_na) ? 20 : 0) +
    ((+day.ph || 0) * 60) + (+day.pm || 0);
  const studiedH = Math.floor(totalStudiedMins / 60);
  const studiedM = totalStudiedMins % 60;
  const studiedDisplay = studiedH > 0 && studiedM > 0 ? `${studiedH}h ${studiedM}m` : studiedH > 0 ? `${studiedH}h` : `${studiedM}m`;

  return (
    <React.Fragment>
      <main className="main">
        <div className="insta-page">
          <p className="section-label" style={{ marginTop: 8, textAlign: 'center' }}>Today's Share Card</p>
          <div className="ic-card">
            {/* Avatar top-right */}
            <div className="ic-avatar-slot">
              <window.UserAvatar
                size={64}
                gender={avatar.gender}
                skinTone={avatar.skin}
                hairColor={avatar.hair}
                hairStyle={avatar.hairStyle}
                shirtColor={avatar.shirt}
                hasGlasses={avatar.glasses}
                hasBeard={avatar.beard}
                hasMustache={avatar.mustache}
              />
            </div>

            <div>
              <div className="ic-brand-line">CONQUER CAT</div>
              <div className="ic-weekday">Tuesday</div>
              <div className="ic-date-line">27 May 2026</div>
              <div className="ic-day-pill">DAY 47 · 233</div>
            </div>

            <div className="ic-divider" />

            <div className="ic-stats-row">
              <div className="ic-stat-block">
                <div className="ic-stat-label">QUANT</div>
                <div className="ic-stat-num">{day.q}</div>
              </div>
              <div className="ic-stat-block">
                <div className="ic-stat-label">VARC</div>
                <div className="ic-stat-num">{day.v}</div>
              </div>
              <div className="ic-stat-block">
                <div className="ic-stat-label">LRDI</div>
                <div className="ic-stat-num">{day.l}</div>
              </div>
            </div>

            <div className="ic-sessions-row">
              {[
                { label: 'Live class', on: day.lc },
                { label: 'Afternoon', on: day.as },
                { label: 'Application', on: day.ap },
                { label: 'VARC passage', on: day.vp },
              ].map((s) => (
                <span key={s.label} className={`ic-session ${s.on ? 'is-on' : ''}`}>
                  <span className="ic-session-dot" />
                  {s.label}
                </span>
              ))}
            </div>

            {totalStudiedMins > 0 && (
              <div className="ic-grinded">grinded {studiedDisplay} today</div>
            )}

            <div className="ic-bars-row">
              <div className="ic-bar-block">
                <div className="ic-bar-label">QUANT</div>
                <div className="ic-bar-tk"><div className="ic-bar-fl" style={{ width: '14%' }} /></div>
              </div>
              <div className="ic-bar-block">
                <div className="ic-bar-label">VARC</div>
                <div className="ic-bar-tk"><div className="ic-bar-fl" style={{ width: '15%' }} /></div>
              </div>
              <div className="ic-bar-block">
                <div className="ic-bar-label">LRDI</div>
                <div className="ic-bar-tk"><div className="ic-bar-fl" style={{ width: '14%' }} /></div>
              </div>
            </div>

            <div className="ic-vikram-block">
              <div className="ic-vikram-label">VIKRAM SAYS</div>
              <div className="ic-vikram-quote">"You don't drift to discipline. You walk to it, every day, on purpose."</div>
            </div>

            <div className="ic-divider" />

            <div className="ic-bottom-row">
              <div className="ic-iquanta">iQuanta</div>
              <div className="ic-days-block">
                <div className="ic-days-num">186</div>
                <div className="ic-days-cap">DAYS TO CAT 2026</div>
                <div className="ic-signature">— {userProfile?.name?.split(' ')[0] || 'Me'}</div>
              </div>
            </div>
          </div>

          <div className="ic-action-row">
            <button className="ic-action ic-action--ghost">× Close</button>
            <button className="ic-action ic-action--primary">↓ Download</button>
          </div>
          <p className="ic-hint">double-tap the card or press download</p>
        </div>
      </main>
    </React.Fragment>
  );
}

/* ─────────────────────────── PROFILE ─────────────────────────── */
function ProfileScreen({ theme, setTheme, avatar, setAvatar, mode, setMode, setPage, userProfile = {}, setUserProfile = () => {} }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const upd = (k, v) => setUserProfile((p) => ({ ...p, [k]: v }));

  return (
    <React.Fragment>
      <main className="main">
        <div className="profile-page">

          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              <window.UserAvatar size={96}
                gender={avatar.gender}
                skinTone={avatar.skin}
                hairColor={avatar.hair}
                hairStyle={avatar.hairStyle}
                shirtColor={avatar.shirt}
                hasGlasses={avatar.glasses}
                hasBeard={avatar.beard}
                hasMustache={avatar.mustache}
              />
              <button className="edit-dp-btn" onClick={() => setEditorOpen((o) => !o)} aria-label="Edit avatar">
                ✎
              </button>
            </div>
            <h2 className="profile-name">{userProfile.name}</h2>
            <p className="profile-meta">{userProfile.category} · {mode === 'prep' ? 'CAT 2026 · Day 47 of 233' : 'Interview prep'}</p>
            <div className="profile-hero-row">
              <div className="hero-stat">
                <span className="hero-stat-val">186</span>
                <span className="hero-stat-label">Days left</span>
              </div>
              <div className="hero-stat hero-stat--accent">
                <span className="hero-stat-val">92<span style={{fontSize:13,opacity:0.7}}>th</span></span>
                <span className="hero-stat-label">Target %ile</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-val">12</span>
                <span className="hero-stat-label">Streak</span>
              </div>
            </div>
          </div>

          {editorOpen && (
            <div className="profile-section">
              <p className="profile-section-label">Customize Avatar</p>
              <div className="card avatar-editor">
                <div className="avatar-row">
                  <span className="avatar-row-label">Gender</span>
                  <div className="seg">
                    {['male','female'].map((g) =>
                      <button key={g} className={`seg-pill ${avatar.gender===g?'is-on':''}`}
                              onClick={()=>setAvatar({...avatar,gender:g})}>{g}</button>)}
                  </div>
                </div>
                <div className="divider" />
                <div className="avatar-row">
                  <span className="avatar-row-label">Skin</span>
                  <div className="swatch-row">
                    {[['light','#f1c27d'],['medium','#c68642'],['dark','#8d5524']].map(([k,c]) =>
                      <button key={k}
                        className={`swatch ${avatar.skin===k?'is-on':''}`}
                        style={{background:c}}
                        onClick={()=>setAvatar({...avatar,skin:k})}
                        aria-label={k} />)}
                  </div>
                </div>
                <div className="divider" />
                <div className="avatar-row">
                  <span className="avatar-row-label">Hair</span>
                  <div className="swatch-row">
                    {[['black','#1a0a00'],['brown','#6b3a2a'],['blonde','#c8a850'],['grey','#888']].map(([k,c]) =>
                      <button key={k}
                        className={`swatch ${avatar.hair===k?'is-on':''}`}
                        style={{background:c}}
                        onClick={()=>setAvatar({...avatar,hair:k})} />)}
                  </div>
                </div>
                <div className="divider" />
                <div className="avatar-row">
                  <span className="avatar-row-label">Hair style</span>
                  <div className="seg">
                    {['wavy','curly','short','long','bun'].map((s) =>
                      <button key={s} className={`seg-pill ${avatar.hairStyle===s?'is-on':''}`}
                              onClick={()=>setAvatar({...avatar,hairStyle:s})}>{s}</button>)}
                  </div>
                </div>
                <div className="divider" />
                <div className="avatar-row">
                  <span className="avatar-row-label">Shirt</span>
                  <div className="swatch-row">
                    {[['orange','#f97316'],['blue','#3b82f6'],['green','#22c55e'],['purple','#a855f7'],['red','#ef4444']].map(([k,c]) =>
                      <button key={k}
                        className={`swatch ${avatar.shirt===k?'is-on':''}`}
                        style={{background:c}}
                        onClick={()=>setAvatar({...avatar,shirt:k})} />)}
                  </div>
                </div>
                <div className="divider" />
                <div className="row">
                  <span className="row-label">Glasses</span>
                  <Toggle checked={avatar.glasses} onChange={(v)=>setAvatar({...avatar,glasses:v})} />
                </div>
                <div className="divider" />
                <div className="row">
                  <span className="row-label">Beard</span>
                  <Toggle checked={avatar.beard} onChange={(v)=>setAvatar({...avatar,beard:v})} />
                </div>
                <div className="divider" />
                <div className="row">
                  <span className="row-label">Mustache</span>
                  <Toggle checked={avatar.mustache} onChange={(v)=>setAvatar({...avatar,mustache:v})} />
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          <div className="profile-section">
            <p className="profile-section-label">Appearance &amp; Mode</p>
            <div className="card">
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Theme</span>
                  <span className="row-sub">{theme === 'dark' ? 'Dark · easier on the eyes at night' : 'Light · matches paper-feel'}</span>
                </div>
                <div className="seg seg--theme">
                  <button className={`seg-pill ${theme==='dark'?'is-on':''}`} onClick={()=>setTheme('dark')}>🌙 Dark</button>
                  <button className={`seg-pill ${theme==='light'?'is-on':''}`} onClick={()=>setTheme('light')}>☀ Light</button>
                </div>
              </div>
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Prep Mode</span>
                  <span className="row-sub">
                    {mode === 'prep' ? 'CAT preparation tracker · 233-day voyage' : 'Post-CAT interview prep · PI, WAT, GD'}
                  </span>
                </div>
                <div className="seg">
                  <button className={`seg-pill ${mode==='prep'?'is-on':''}`} onClick={()=>setMode('prep')}>⚓ Prep</button>
                  <button className={`seg-pill ${mode==='interview'?'is-on':''}`} onClick={()=>setMode('interview')}>🎯 Interview</button>
                </div>
              </div>
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Calendar Voyage Mode</span>
                  <span className="row-sub">One Piece sea theme on Calendar page</span>
                </div>
                <Toggle checked={true} onChange={()=>{}} />
              </div>
            </div>
          </div>

          {/* Academic Profile — now editable */}
          <div className="profile-section">
            <p className="profile-section-label">Education &amp; Work</p>
            <div className="card">
              <div className="row inline-input-row">
                <div className="row-label-block">
                  <span className="row-label">Degree</span>
                  <span className="row-sub">Primary qualification</span>
                </div>
                <input className="inline-input" type="text"
                       value={userProfile.degree}
                       placeholder="e.g. B.Tech CSE"
                       onChange={(e) => upd('degree', e.target.value)} />
              </div>
              <div className="divider" />
              <div className="row inline-input-row">
                <div className="row-label-block">
                  <span className="row-label">College</span>
                  <span className="row-sub">Tier-1 colleges boost calibre</span>
                </div>
                <input className="inline-input" type="text"
                       value={userProfile.college}
                       placeholder="e.g. Anna University"
                       onChange={(e) => upd('college', e.target.value)} />
              </div>
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">GPA / Score</span>
                  <span className="row-sub">{userProfile.gpaScale === '10' ? 'on 10-point scale' : 'percentage'}</span>
                </div>
                <div className="row-right hours-mins">
                  <input className="num-input" type="number" min="0" max="100" step="0.1"
                         value={userProfile.gpa}
                         onChange={(e) => upd('gpa', e.target.value)} style={{ width: 50 }} />
                  <select className="tt-select" value={userProfile.gpaScale}
                          onChange={(e) => upd('gpaScale', e.target.value)} style={{ minWidth: 70 }}>
                    <option value="10">/10</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Work Experience</span>
                  <span className="row-sub">Years &amp; months</span>
                </div>
                <div className="row-right hours-mins">
                  <input className="num-input" type="number" min="0" max="50"
                         value={userProfile.workExpYears}
                         onChange={(e) => upd('workExpYears', +e.target.value || 0)} />
                  <span className="unit">y</span>
                  <input className="num-input" type="number" min="0" max="11"
                         value={userProfile.workExpMonths}
                         onChange={(e) => upd('workExpMonths', +e.target.value || 0)} />
                  <span className="unit">m</span>
                </div>
              </div>
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Masters / PG</span>
                  <span className="row-sub">Have a Masters? Adds +8 to profile score</span>
                </div>
                <Toggle checked={userProfile.hasMasters} onChange={(v) => upd('hasMasters', v)} />
              </div>
            </div>
          </div>

          {/* IIM Targets — now editable */}
          <div className="profile-section">
            <p className="profile-section-label">CAT &amp; IIM Targets</p>
            <div className="card">
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Category</span>
                  <span className="row-sub">Affects IIM cutoffs in the calibre calc</span>
                </div>
                <select className="tt-select" value={userProfile.category}
                        onChange={(e) => upd('category', e.target.value)}>
                  {['General','OBC-NCL','EWS','SC','ST','PWD'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Target Percentile</span>
                  <span className="row-sub">{userProfile.targetPercentile >= 99 ? 'ABC IIM target' : userProfile.targetPercentile >= 96 ? 'Baby + new IIM target' : 'New IIM target'}</span>
                </div>
                <input
                  className="num-input"
                  type="number"
                  min="80" max="100" step="0.1"
                  value={userProfile.targetPercentile}
                  style={{ width: 56, color: 'var(--ac)', fontWeight: 700 }}
                  onChange={(e) => upd('targetPercentile', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="divider" />
              <div className="row">
                <div className="row-label-block">
                  <span className="row-label">Top Choice</span>
                  <span className="row-sub">Your dream IIM</span>
                </div>
                <select className="tt-select" value={userProfile.topChoice}
                        onChange={(e) => upd('topChoice', e.target.value)}>
                  {['IIM Ahmedabad','IIM Bangalore','IIM Calcutta','IIM Lucknow','IIM Indore','IIM Kozhikode',
                    'IIM Shillong','IIM Rohtak','IIM Raipur','IIM Trichy','IIM Udaipur','IIM Kashipur'].map((c) =>
                      <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="divider" />
              <div className="row">
                <span className="row-label">CAT Date</span>
                <span className="unit">29 Nov 2026</span>
              </div>
            </div>
          </div>

          {/* IIM Calibre Assessment — live computation */}
          <div className="profile-section">
            <p className="profile-section-label">IIM Calibre Assessment</p>
            <div className="card iim-calibre-card">
              {(() => {
                // Mirrors src/lib/scoreUtils.js calcIIMProfile (simplified)
                const isEng = (userProfile.degree || '').includes('Tech') || (userProfile.degree || '').includes('B.E');
                const isFemale = avatar.gender === 'female';
                const isGEM = isEng && !isFemale && userProfile.category === 'General';
                const workMonths = (+userProfile.workExpYears || 0) * 12 + (+userProfile.workExpMonths || 0);

                let profileScore = 50;
                if (workMonths >= 36) profileScore += 18;
                else if (workMonths >= 24) profileScore += 14;
                else if (workMonths >= 12) profileScore += 9;
                else if (workMonths >= 6) profileScore += 5;
                else profileScore -= 5;
                const gpa = parseFloat(userProfile.gpa) || 0;
                const gradPct = userProfile.gpaScale === '10' ? gpa * 10 : gpa;
                if (gradPct >= 85) profileScore += 12;
                else if (gradPct >= 75) profileScore += 6;
                else if (gradPct >= 65) profileScore += 2;
                else profileScore -= 4;
                if (userProfile.hasMasters) profileScore += 8;
                if (isFemale) profileScore += 6;
                if (!isEng) profileScore += 4;
                profileScore = Math.min(100, Math.max(5, profileScore));

                const baseConv = { ABC: 0.36, KLIS: 0.45, newIIM: 0.56 };
                const bonus = (profileScore - 50) / 150;
                const conv = {
                  ABC: Math.round(Math.min(0.82, Math.max(0.12, baseConv.ABC + bonus)) * 100),
                  KLIS: Math.round(Math.min(0.88, Math.max(0.18, baseConv.KLIS + bonus)) * 100),
                  newIIM: Math.round(Math.min(0.92, Math.max(0.25, baseConv.newIIM + bonus)) * 100),
                };

                return (
                  <React.Fragment>
                    <div className="calibre-head">
                      <div>
                        <div className="calibre-score">{profileScore}<span style={{ fontSize: 14, opacity: 0.55 }}>/100</span></div>
                        <div className="calibre-tag">Profile score · {isGEM ? 'GEM' : (isFemale ? 'Female diversity' : 'Diversity')}</div>
                      </div>
                      <div className="calibre-badge">
                        {profileScore >= 75 ? '🔥 STRONG' : profileScore >= 55 ? '⚓ STEADY' : '⚠ NEEDS LIFT'}
                      </div>
                    </div>
                    <div className="calibre-divider" />
                    <p className="row-sub" style={{ marginBottom: 10 }}>Interview conversion probability (after CAT clearance)</p>
                    <div className="calibre-rows">
                      <div className="calibre-row">
                        <span className="calibre-row-label">ABC IIMs</span>
                        <div className="calibre-row-bar"><div className="calibre-row-fill" style={{ width: `${conv.ABC}%` }} /></div>
                        <span className="calibre-row-val">{conv.ABC}%</span>
                      </div>
                      <div className="calibre-row">
                        <span className="calibre-row-label">KLIS · Baby</span>
                        <div className="calibre-row-bar"><div className="calibre-row-fill" style={{ width: `${conv.KLIS}%` }} /></div>
                        <span className="calibre-row-val">{conv.KLIS}%</span>
                      </div>
                      <div className="calibre-row">
                        <span className="calibre-row-label">New IIMs</span>
                        <div className="calibre-row-bar"><div className="calibre-row-fill" style={{ width: `${conv.newIIM}%` }} /></div>
                        <span className="calibre-row-val">{conv.newIIM}%</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })()}
            </div>
          </div>

          {/* Tools */}
          <div className="profile-section">
            <p className="profile-section-label">Tools &amp; Modules</p>
            <div className="card">
              <button className="card-row-btn" onClick={() => setPage && setPage('backlog')}>
                <div className="row-label-block">
                  <span className="row-label">iQuanta Backlog</span>
                  <span className="row-sub">12 pending · 42% covered</span>
                </div>
                <span className="card-chevron">›</span>
              </button>
              <div className="divider" />
              <button className="card-row-btn" onClick={() => setPage && setPage('timetable')}>
                <div className="row-label-block">
                  <span className="row-label">Weekly Timetable</span>
                  <span className="row-sub">Live + application class schedule</span>
                </div>
                <span className="card-chevron">›</span>
              </button>
              <div className="divider" />
              <button className="card-row-btn" onClick={() => setPage && setPage('assessment')}>
                <div className="row-label-block">
                  <span className="row-label">Assessment</span>
                  <span className="row-sub">Daily · 6 questions · 12 min</span>
                </div>
                <span className="card-chevron">›</span>
              </button>
              <div className="divider" />
              <button className="card-row-btn" onClick={() => setPage && setPage('onboarding')}>
                <div className="row-label-block">
                  <span className="row-label">Re-run Onboarding</span>
                  <span className="row-sub">Change mode, name or start date</span>
                </div>
                <span className="card-chevron">›</span>
              </button>
            </div>
          </div>

          {/* Account */}
          <div className="profile-section profile-section--last">
            <p className="profile-section-label">Account</p>
            <div className="card">
              <button className="card-row-btn" onClick={() => setEditingIdentity((o) => !o)}>
                <div className="row-label-block">
                  <span className="row-label">{editingIdentity ? 'Done editing' : 'Edit Name & Bio'}</span>
                  <span className="row-sub">{userProfile.name}</span>
                </div>
                <span className="card-chevron">{editingIdentity ? '✓' : '›'}</span>
              </button>
              {editingIdentity && (
                <React.Fragment>
                  <div className="divider" />
                  <div className="row inline-input-row">
                    <span className="row-sub">Display name</span>
                    <input className="inline-input" type="text" value={userProfile.name}
                           onChange={(e) => upd('name', e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="divider" />
                  <div className="row inline-input-row" style={{ alignItems: 'flex-start' }}>
                    <span className="row-sub" style={{ paddingTop: 6 }}>Short bio</span>
                    <textarea className="notes-area" style={{ minHeight: 64, textAlign: 'right', fontSize: 14 }}
                           value={userProfile.bio}
                           onChange={(e) => upd('bio', e.target.value)}
                           placeholder="One-line tagline" />
                  </div>
                </React.Fragment>
              )}
              <div className="divider" />
              <button className="card-row-btn"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify({ userProfile, avatar, mode }, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'conquer-cat-profile.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}>
                <div className="row-label-block">
                  <span className="row-label">Export My Data</span>
                  <span className="row-sub">Download profile + tracker data as JSON</span>
                </div>
                <span className="card-chevron">↓</span>
              </button>
              <div className="divider" />
              <button className="card-row-btn"
                      onClick={() => alert('In production, this signs you out and returns to onboarding.')}>
                <span className="row-label" style={{ color: 'var(--red)' }}>Sign Out</span>
                <span className="card-chevron" style={{ color: 'var(--red)' }}>›</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </React.Fragment>
  );
}

window.Screens = {
  TodayScreen, ProgressScreen, CalendarScreen, MentorScreen, InstaCardScreen, ProfileScreen, DDayRevealScreen, Icon,
};
