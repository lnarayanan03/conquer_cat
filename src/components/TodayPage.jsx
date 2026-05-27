import { useState, useEffect } from "react";
import { MentorAvatar } from "./MentorAvatar.jsx";
import InstaCard from "../pages/InstaCard.jsx";
import {
  EXAM_DATE_KEY, AC,
  isApplicationWindow, isFinalPushDate, isDdayRevealDay,
  getSleepDuration, to12HourParts, to24HourValue,
} from "../lib/dateUtils.js";
import { effortScore } from "../lib/scoreUtils.js";

export function Tog({ v, onChange }) {
  return (
    <label className="tog" style={{ display:"inline-block" }}>
      <input type="checkbox" checked={!!v} onChange={e => onChange(e.target.checked)} />
      <span className="tog-track" />
      <span className="tog-thumb" />
    </label>
  );
}

export function TimePickerWidget({ value, onChange, label, sub, dotColor }) {
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

export function TodayPage({
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

export function BacklogPage({ videos, setVideos, concepts, setConcepts, onBack }) {
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

export function TimetablePage({ timetable, setTimetable, onBack, userId, DAYS_OF_WEEK, TOPICS, onSaveToChat }) {
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

export function AssessmentPage({ userId, onBack, setMentorMessages, isSunday, onAutoSend }) {
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

export default TodayPage;
