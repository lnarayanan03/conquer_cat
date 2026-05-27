// modules.jsx — Backlog, Timetable, Assessment, Onboarding, FloatingMentor, FloatingDDay
const { useState: _useS, useRef: _useR, useEffect: _useE, Fragment: _F } = React;

/* ──────────────────────────────────────────────────────────────
   BACKLOG — videos + concepts CRUD with check-off
   Mirrors src/components/TodayPage.jsx BacklogPage
─────────────────────────────────────────────────────────────── */
function BacklogScreen({ onBack }) {
  const [videos, setVideos] = _useS([
    { id: '1', text: 'TSD — boats & streams (iQuanta L14)', checked: true },
    { id: '2', text: 'Geometry — circles & tangents recap', checked: true },
    { id: '3', text: 'Permutations basics — Module 7', checked: false },
    { id: '4', text: 'RC strategy — long science passages', checked: false },
    { id: '5', text: 'LRDI Bar-Pie hybrid sets', checked: false },
    { id: '6', text: 'Number system — last 3 digits patterns', checked: false },
    { id: '7', text: 'VARC para jumbles workshop', checked: false },
  ]);
  const [concepts, setConcepts] = _useS([
    { id: 'c1', text: 'Allegation method on weighted avgs', checked: true },
    { id: 'c2', text: 'Logarithm change of base', checked: false },
    { id: 'c3', text: 'Critical reasoning weakener vs strengthener', checked: false },
    { id: 'c4', text: 'Coordinate geometry distance formula nuances', checked: false },
    { id: 'c5', text: 'Modulus inequalities sign analysis', checked: false },
  ]);
  const [vInput, setVInput] = _useS('');
  const [cInput, setCInput] = _useS('');

  function addItem(setter, text) {
    if (!text.trim()) return;
    setter((p) => [...p, { id: Math.random().toString(36).slice(2), text: text.trim(), checked: false }]);
  }
  function toggleItem(setter, id) {
    setter((p) => p.map((it) => it.id === id ? { ...it, checked: !it.checked } : it));
  }
  function deleteItem(setter, id) {
    setter((p) => p.filter((it) => it.id !== id));
  }

  function renderSection(label, items, setter, input, setInput, accent, placeholder) {
    const pending = items.filter((i) => !i.checked);
    const done = items.filter((i) => i.checked);
    const total = items.length;
    return (
      <section className="bl-section">
        <p className="section-label">
          <span style={{ color: accent }}>●</span> {label.toUpperCase()} ({total})
        </p>
        <div className="bl-input-row">
          <input
            className="bl-input"
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { addItem(setter, input); setInput(''); }}}
          />
          <button className="bl-add" style={{ background: accent }} onClick={() => { addItem(setter, input); setInput(''); }}>＋</button>
        </div>
        {pending.length > 0 && (
          <div className="bl-group">
            <p className="bl-group-label">Pending ({pending.length})</p>
            <div className="card bl-list">
              {pending.map((it) => (
                <div key={it.id} className="bl-row">
                  <button className="bl-check" onClick={() => toggleItem(setter, it.id)} aria-label="Mark done">
                    <span className="bl-check-box" />
                  </button>
                  <span className="bl-text">{it.text}</span>
                  <button className="bl-del" onClick={() => deleteItem(setter, it.id)} aria-label="Delete">×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {done.length > 0 && (
          <div className="bl-group">
            <p className="bl-group-label">Completed ({done.length})</p>
            <div className="card bl-list bl-list--done">
              {done.map((it) => (
                <div key={it.id} className="bl-row is-done">
                  <button className="bl-check is-on" onClick={() => toggleItem(setter, it.id)}>
                    <span className="bl-check-box">
                      <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 8 6.5 11.5 13 4.5"/></svg>
                    </span>
                  </button>
                  <span className="bl-text bl-text--done">{it.text}</span>
                  <button className="bl-del" onClick={() => deleteItem(setter, it.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <_F>
      <header className="top-header">
        <div className="page-back-row">
          <button className="back-btn" onClick={onBack}>‹ Today</button>
        </div>
        <h1 className="greeting" style={{ fontSize: 26 }}>iQuanta Backlog</h1>
        <p className="greeting-sub">Videos to watch · Concepts to fix</p>
      </header>
      <main className="main">
        <div className="page-content">
          {renderSection('Videos', videos, setVideos, vInput, setVInput, '#f97316', 'Add a video to watch later')}
          {renderSection('Concepts', concepts, setConcepts, cInput, setCInput, '#3b82f6', 'Add a concept to revise')}
        </div>
      </main>
    </_F>
  );
}

/* ──────────────────────────────────────────────────────────────
   TIMETABLE — weekly grid (live + application class topics)
─────────────────────────────────────────────────────────────── */
const TT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TT_TOPICS = ['Quant', 'VARC', 'LRDI', 'GK', 'Mock'];

function TimetableScreen({ onBack }) {
  const [tt, setTT] = _useS(() => ({
    Mon: { live: 'Quant', liveSub: 'TSD',         app: 'Quant', appSub: 'Practice set', appSame: true },
    Tue: { live: 'VARC',  liveSub: 'RC theory',   app: 'VARC',  appSub: 'Para jumbles', appSame: false },
    Wed: { live: 'LRDI',  liveSub: 'Pie + bar',   app: 'LRDI',  appSub: 'Same as live', appSame: true },
    Thu: { live: 'Quant', liveSub: 'Geometry',    app: 'Quant', appSub: 'Same as live', appSame: true },
    Fri: { live: 'VARC',  liveSub: 'CR & RC',     app: 'VARC',  appSub: 'Same as live', appSame: true },
    Sat: { live: 'Mock',  liveSub: 'CAT-level set',app: 'Mock', appSub: 'Discussion',   appSame: false },
    Sun: { live: '',      liveSub: '(rest)',      app: '',      appSub: '(rest)',       appSame: false },
  }));
  const [saved, setSaved] = _useS(false);

  function update(day, field, value) {
    setTT((p) => ({ ...p, [day]: { ...p[day], [field]: value } }));
  }

  return (
    <_F>
      <header className="top-header">
        <div className="page-back-row">
          <button className="back-btn" onClick={onBack}>‹ Today</button>
        </div>
        <h1 className="greeting" style={{ fontSize: 26 }}>Weekly Timetable</h1>
        <p className="greeting-sub">iQuanta live (7 PM) + application class (10 PM – 12 AM)</p>
      </header>
      <main className="main">
        <div className="page-content">
          {TT_DAYS.map((day) => (
            <section key={day} className="tt-day">
              <p className="section-label">{day.toUpperCase()}</p>
              <div className="card tt-card">
                {/* Live class row */}
                <div className="row">
                  <span className="row-label">Live Class</span>
                  <div className="row-right">
                    <select className="tt-select" value={tt[day].live} onChange={(e) => update(day, 'live', e.target.value)}>
                      <option value="">— off —</option>
                      {TT_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                {tt[day].live && (
                  <React.Fragment>
                    <div className="divider" />
                    <div className="row inline-input-row">
                      <span className="row-sub">subtopic</span>
                      <input className="inline-input" type="text" value={tt[day].liveSub} onChange={(e) => update(day, 'liveSub', e.target.value)} placeholder="e.g. TSD basics" />
                    </div>
                  </React.Fragment>
                )}
                <div className="divider" />
                {/* Application class */}
                <div className="row">
                  <span className="row-label">Application Class</span>
                  <div className="row-right">
                    <button className={`na-pill ${tt[day].appSame ? 'is-on' : ''}`}
                            onClick={() => update(day, 'appSame', !tt[day].appSame)}>
                      Same as live
                    </button>
                    {!tt[day].appSame && (
                      <select className="tt-select" value={tt[day].app} onChange={(e) => update(day, 'app', e.target.value)}>
                        <option value="">— off —</option>
                        {TT_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                {!tt[day].appSame && tt[day].app && (
                  <React.Fragment>
                    <div className="divider" />
                    <div className="row inline-input-row">
                      <span className="row-sub">subtopic</span>
                      <input className="inline-input" type="text" value={tt[day].appSub} onChange={(e) => update(day, 'appSub', e.target.value)} placeholder="e.g. Same as live" />
                    </div>
                  </React.Fragment>
                )}
              </div>
            </section>
          ))}
          <div className="save-btn-wrap">
            <button className={`save-btn ${saved ? 'save-btn--saved' : ''}`} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}>
              {saved ? 'Saved ✓' : 'Save Timetable'}
            </button>
          </div>
        </div>
      </main>
    </_F>
  );
}

/* ──────────────────────────────────────────────────────────────
   ASSESSMENT — daily 6q (Mon–Sat) / Sunday 30q
─────────────────────────────────────────────────────────────── */
const ASSMT_QUESTIONS = [
  { topic: 'Quant', text: 'If 2x² − 5x + 3 = 0, the sum of the roots is:', options: ['3/2', '5/2', '−5/2', '2'], correct: '5/2', explanation: 'For ax² + bx + c, sum of roots = −b/a = 5/2.' },
  { topic: 'Quant', text: 'A train 120m long crosses a pole in 8 sec. Its speed is:', options: ['45 km/h', '54 km/h', '60 km/h', '72 km/h'], correct: '54 km/h', explanation: '120m / 8s = 15 m/s × 18/5 = 54 km/h.' },
  { topic: 'VARC', text: 'Choose the best paraphrase:\n"His reluctance was palpable."', options: ['He was clearly hesitant.', 'He was thrilled.', 'He explained it.', 'He was tired.'], correct: 'He was clearly hesitant.', explanation: 'Palpable = obvious/perceptible; reluctance = unwillingness.' },
  { topic: 'VARC', text: 'Which word is closest in meaning to UBIQUITOUS?', options: ['Rare', 'Pervasive', 'Wealthy', 'Stubborn'], correct: 'Pervasive', explanation: 'Ubiquitous = present everywhere = pervasive.' },
  { topic: 'LRDI', text: 'Five friends sit in a row. A is to the left of B. C is between A and B. Who sits at the right of B?', options: ['A', 'C', 'D or E', 'Cannot be determined'], correct: 'Cannot be determined', explanation: 'No info given about D and E positions.' },
  { topic: 'LRDI', text: 'In a class of 50, 30 like tea, 25 like coffee, 10 like both. How many like neither?', options: ['5', '10', '15', '20'], correct: '5', explanation: 'Union = 30 + 25 − 10 = 45 → 50 − 45 = 5.' },
];

function AssessmentScreen({ onBack }) {
  const [idx, setIdx] = _useS(0);
  const [answers, setAnswers] = _useS({});
  const [showResult, setShowResult] = _useS(false);

  const q = ASSMT_QUESTIONS[idx];
  const total = ASSMT_QUESTIONS.length;
  const myAns = answers[idx];

  function pick(opt) { setAnswers((p) => ({ ...p, [idx]: opt })); }
  function next() {
    if (idx < total - 1) setIdx(idx + 1);
    else setShowResult(true);
  }

  if (showResult) {
    const correct = ASSMT_QUESTIONS.filter((qq, i) => answers[i] === qq.correct).length;
    return (
      <_F>
        <header className="top-header">
          <div className="page-back-row"><button className="back-btn" onClick={onBack}>‹ Today</button></div>
          <h1 className="greeting" style={{ fontSize: 26 }}>Daily Assessment</h1>
          <p className="greeting-sub">Result · 6 questions · 12 min target</p>
        </header>
        <main className="main">
          <div className="page-content">
            <div className="card assmt-result">
              <p className="dday-eyebrow">YOUR SCORE</p>
              <div className="assmt-score">{correct}<span style={{ fontSize: 24, opacity: 0.5 }}> / {total}</span></div>
              <p className="assmt-verdict">
                {correct >= 5 ? '🔥 Sharp form. Vikram will be pleased.'
                : correct >= 3 ? '⚓ Solid. Identify the slip and fix tomorrow.'
                : '⚠ Focus session needed. Open backlog and revise.'}
              </p>
            </div>
            <section>
              <p className="section-label">Review · {total} questions</p>
              <div className="card">
                {ASSMT_QUESTIONS.map((qq, i) => {
                  const ok = answers[i] === qq.correct;
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="divider" />}
                      <div className="assmt-review">
                        <div className="assmt-review-head">
                          <span className={`assmt-pill assmt-pill--${qq.topic.toLowerCase()}`}>{qq.topic}</span>
                          <span className={`assmt-ok ${ok ? 'ok' : 'wrong'}`}>{ok ? '✓' : '✕'}</span>
                        </div>
                        <p className="assmt-q-text">{qq.text}</p>
                        <p className="assmt-q-ans"><strong>Correct:</strong> {qq.correct}</p>
                        <p className="assmt-q-exp">{qq.explanation}</p>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
            <div className="save-btn-wrap">
              <button className="save-btn" onClick={onBack}>Back to Today</button>
            </div>
          </div>
        </main>
      </_F>
    );
  }

  return (
    <_F>
      <header className="top-header">
        <div className="page-back-row"><button className="back-btn" onClick={onBack}>‹ Today</button></div>
        <h1 className="greeting" style={{ fontSize: 24 }}>Daily Assessment</h1>
        <p className="greeting-sub">Question {idx + 1} of {total} · 12 min total</p>
        <div className="assmt-progress">
          {ASSMT_QUESTIONS.map((_, i) => (
            <span key={i} className={`assmt-progress-dot ${i < idx ? 'is-past' : i === idx ? 'is-now' : ''}`} />
          ))}
        </div>
      </header>
      <main className="main">
        <div className="page-content">
          <section>
            <span className={`assmt-pill assmt-pill--${q.topic.toLowerCase()}`}>{q.topic}</span>
            <p className="assmt-q">{q.text}</p>
            <div className="assmt-opts">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  className={`assmt-opt ${myAns === opt ? 'is-on' : ''}`}
                  onClick={() => pick(opt)}
                >
                  <span className="assmt-opt-bullet">{myAns === opt ? '●' : '○'}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </section>
          <div className="save-btn-wrap">
            <button className="save-btn" disabled={!myAns} style={{ opacity: myAns ? 1 : 0.5 }} onClick={next}>
              {idx === total - 1 ? 'Finish & Show Score' : 'Next question'}
            </button>
          </div>
        </div>
      </main>
    </_F>
  );
}

/* ──────────────────────────────────────────────────────────────
   ONBOARDING — multi-step (mode → name → start date → results)
─────────────────────────────────────────────────────────────── */
function OnboardingScreen({ onDone }) {
  const [step, setStep] = _useS('mode');
  const [name, setName] = _useS('');
  const [mode, setMode] = _useS('prep');
  const [startDate, setStartDate] = _useS('2026-04-10');

  if (step === 'mode') {
    return (
      <div className="onboarding-wrap">
        <div className="onb-card">
          <p className="onb-eyebrow">WELCOME</p>
          <h1 className="onb-title">Which version of you are we building?</h1>
          <p className="onb-sub">Pick the journey — we'll tailor the tracker.</p>
          <div className="onb-options">
            <button className={`onb-option ${mode === 'prep' ? 'is-on' : ''}`} onClick={() => setMode('prep')}>
              <div className="onb-option-icon">⚓</div>
              <div>
                <div className="onb-option-title">CAT 2026 Prep</div>
                <div className="onb-option-sub">Daily discipline · 233 days · 99th percentile target</div>
              </div>
            </button>
            <button className={`onb-option ${mode === 'interview' ? 'is-on' : ''}`} onClick={() => setMode('interview')}>
              <div className="onb-option-icon">🎯</div>
              <div>
                <div className="onb-option-title">IIM Interview Prep</div>
                <div className="onb-option-sub">PI · WAT · GD · profile polish for the panel</div>
              </div>
            </button>
          </div>
          <button className="save-btn" onClick={() => setStep('name')}>Continue</button>
        </div>
      </div>
    );
  }
  if (step === 'name') {
    return (
      <div className="onboarding-wrap">
        <div className="onb-card">
          <p className="onb-eyebrow">YOUR NAME</p>
          <h1 className="onb-title">What should Vikram call you?</h1>
          <input className="onb-input" placeholder="e.g. Lakshman" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="onb-nav-row">
            <button className="onb-back" onClick={() => setStep('mode')}>‹ Back</button>
            <button className="save-btn" disabled={!name.trim()} style={{ opacity: name.trim() ? 1 : 0.5 }} onClick={() => setStep('start')}>Continue</button>
          </div>
        </div>
      </div>
    );
  }
  if (step === 'start') {
    return (
      <div className="onboarding-wrap">
        <div className="onb-card">
          <p className="onb-eyebrow">START DATE</p>
          <h1 className="onb-title">When did your CAT prep begin?</h1>
          <p className="onb-sub">Used to compute your voyage day. You can change this later.</p>
          <input className="onb-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <div className="onb-nav-row">
            <button className="onb-back" onClick={() => setStep('name')}>‹ Back</button>
            <button className="save-btn" onClick={() => setStep('summary')}>Continue</button>
          </div>
        </div>
      </div>
    );
  }
  // summary
  return (
    <div className="onboarding-wrap">
      <div className="onb-card">
        <p className="onb-eyebrow">READY TO SAIL</p>
        <h1 className="onb-title">Welcome, {name}.</h1>
        <p className="onb-sub">
          {mode === 'prep'
            ? "You're on the Voyage to CAT 2026. 233 days. One question at a time."
            : "We'll prep you for the panel. Mock PI, WAT, and profile polish."}
        </p>
        <div className="onb-summary">
          <div className="onb-summary-row"><span>Mode</span><strong>{mode === 'prep' ? 'CAT Prep' : 'Interview Prep'}</strong></div>
          <div className="onb-summary-row"><span>Name</span><strong>{name}</strong></div>
          <div className="onb-summary-row"><span>Start</span><strong>{startDate}</strong></div>
          <div className="onb-summary-row"><span>D-Day</span><strong>29 Nov 2026</strong></div>
        </div>
        <button className="save-btn" onClick={onDone}>Set sail ⚓</button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   FLOATING WIDGETS — Mentor + D-Day badge
─────────────────────────────────────────────────────────────── */
function FloatingMentor({ onTap }) {
  return (
    <button className="float-mentor" onClick={onTap} aria-label="Talk to Vikram">
      <window.MentorAvatar size={52} />
      <span className="float-mentor-dot" />
    </button>
  );
}

function FloatingDDay({ daysLeft, onTap }) {
  return (
    <button className="float-dday" onClick={onTap} aria-label="D-Day countdown">
      <span className="float-dday-num">{daysLeft}</span>
      <span className="float-dday-label">days · CAT 2026</span>
      <span className="float-dday-lock">🔒</span>
    </button>
  );
}

window.Modules = {
  BacklogScreen, TimetableScreen, AssessmentScreen, OnboardingScreen,
  FloatingMentor, FloatingDDay,
};
