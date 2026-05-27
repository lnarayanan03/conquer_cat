import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./InstaCard.css";

// ── Local helpers (pure, no imports from App to avoid circular deps) ──────
function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
const TODAY_KEY = toKey(new Date());

/** Simplified per-day effort score (sessions + QVL only, no backlog) */
function scoreDay(day) {
  if (!day) return 0;
  const q   = Math.min((+day.q||0)/10, 1) * 18;
  const v   = Math.min((+day.v||0)/5,  1) * 12;
  const l   = Math.min((+day.l||0)/5,  1) * 12;
  const mins = ((day.lc||day.lc_na)?120:0) + ((day.as||day.as_na)?40:0) +
               ((day.ap||day.ap_na)?120:0) + ((+day.ph||0)*60) + (+day.pm||0);
  const hrs = Math.min(mins/300, 1) * 16;
  return Math.min(100, Math.round(q + v + l + hrs));
}

function calcStreak(data) {
  if (!data) return 0;
  const met = d => !!d && (+d.q||0)>=10 && (+d.v||0)>=5 && (+d.l||0)>=5;
  let streak = 0;
  const base = new Date();
  for (let i = 0; i < 400; i++) {
    const d = new Date(base); d.setDate(d.getDate() - i);
    if (!met(data[toKey(d)])) break;
    streak++;
  }
  return streak;
}

function getLast7Scores(data) {
  const base = new Date();
  return Array.from({length:7}, (_,i) => {
    const d = new Date(base); d.setDate(d.getDate() - (6-i));
    return scoreDay(data?.[toKey(d)]);
  });
}

function formatHours(todayData) {
  const mins =
    ((todayData?.lc||todayData?.lc_na) ? 120 : 0) +
    ((todayData?.as||todayData?.as_na) ? 40  : 0) +
    ((todayData?.ap||todayData?.ap_na) ? 120 : 0) +
    ((+todayData?.ph||0)*60) + (+todayData?.pm||0);
  if (mins === 0) return "—";
  const h = Math.floor(mins/60), m = mins%60;
  return h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : `${m}m`;
}

// ── Local avatar (no import from App to avoid circular) ──────────────────
function ShareAvatar({
  gender = "male", skinTone = "medium", hairStyle = "wavy",
  hairColor = "black", shirtColor = "blue",
  hasGlasses = false, hasBeard = false, hasMustache = false, size = 64,
}) {
  const skinColors  = { light:"#f1c27d", medium:"#c68642", dark:"#8d5524" };
  const hairColors  = { black:"#1a0a00", brown:"#6b3a2a", blonde:"#c8a850", grey:"#888888" };
  const shirtColors = { orange:"#f97316", blue:"#3b82f6", green:"#22c55e", purple:"#a855f7", red:"#ef4444", white:"#e5e5e5" };
  const skin   = skinColors[skinTone]  || "#c68642";
  const hair   = hairColors[hairColor] || "#1a0a00";
  const shirt  = shirtColors[shirtColor] || "#3b82f6";
  const shadow = skinTone==="light"?"#d4956a":skinTone==="dark"?"#6b3d1e":"#b07030";

  const renderHair = () => {
    if (gender === "female") {
      if (hairStyle==="bun")   return <><ellipse cx="50" cy="36" rx="20" ry="14" fill={hair}/><circle cx="50" cy="22" r="10" fill={hair}/><circle cx="50" cy="22" r="6" fill={hair} opacity="0.7"/></>;
      if (hairStyle==="long")  return <><ellipse cx="50" cy="35" rx="22" ry="18" fill={hair}/><path d="M28 42 Q22 60 24 85 Q26 70 30 58 Q27 50 28 42Z" fill={hair}/><path d="M72 42 Q78 60 76 85 Q74 70 70 58 Q73 50 72 42Z" fill={hair}/></>;
      if (hairStyle==="curly") return <><ellipse cx="50" cy="33" rx="23" ry="19" fill={hair}/><circle cx="27" cy="40" r="7" fill={hair}/><circle cx="73" cy="40" r="7" fill={hair}/><circle cx="24" cy="54" r="6" fill={hair}/><circle cx="76" cy="54" r="6" fill={hair}/></>;
      if (hairStyle==="short") return <><ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/><path d="M30 40 Q28 50 30 54Z" fill={hair}/><path d="M70 40 Q72 50 70 54Z" fill={hair}/></>;
      return <><ellipse cx="50" cy="34" rx="22" ry="17" fill={hair}/><path d="M28 40 Q24 54 26 68 Q23 58 27 50 Q24 45 28 40Z" fill={hair}/><path d="M72 40 Q76 54 74 68 Q77 58 73 50 Q76 45 72 40Z" fill={hair}/></>;
    }
    if (hairStyle==="curly") return <><ellipse cx="50" cy="33" rx="22" ry="18" fill={hair}/><circle cx="29" cy="38" r="6" fill={hair}/><circle cx="71" cy="38" r="6" fill={hair}/></>;
    if (hairStyle==="bald")  return null;
    if (hairStyle==="long")  return <><ellipse cx="50" cy="32" rx="21" ry="16" fill={hair}/><path d="M29 42 Q25 56 27 70 Q24 62 28 54Z" fill={hair}/><path d="M71 42 Q75 56 73 70 Q76 62 72 54Z" fill={hair}/></>;
    return <ellipse cx="50" cy="32" rx="21" ry="14" fill={hair}/>;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="75" rx="26" ry="12" fill={shadow} opacity="0.4"/>
      <rect x="24" y="54" width="52" height="46" rx="8" fill={shirt}/>
      <circle cx="50" cy="42" r="18" fill={skin}/>
      {renderHair()}
      {gender==="female" && <><path d="M38 46 Q50 54 62 46" stroke={shadow} strokeWidth="1.5" fill="none" opacity="0.4"/></>}
      <ellipse cx="43" cy="42" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="57" cy="42" rx="3.5" ry="4" fill="white"/>
      <circle cx="43" cy="43" r="2" fill="#1a1a1a"/>
      <circle cx="57" cy="43" r="2" fill="#1a1a1a"/>
      <circle cx="44" cy="42" r="0.7" fill="white"/>
      <circle cx="58" cy="42" r="0.7" fill="white"/>
      <path d="M45 50 Q50 54 55 50" stroke={shadow} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {hasMustache && <path d="M43 49 Q50 53 57 49" stroke={shadow} strokeWidth="2" fill="none"/>}
      {hasBeard && <ellipse cx="50" cy="55" rx="10" ry="6" fill={hair} opacity="0.6"/>}
      {hasGlasses && <><rect x="37" y="38" width="10" height="8" rx="2.5" stroke="#888" strokeWidth="1.5" fill="none"/><rect x="53" y="38" width="10" height="8" rx="2.5" stroke="#888" strokeWidth="1.5" fill="none"/><line x1="47" y1="42" x2="53" y2="42" stroke="#888" strokeWidth="1.5"/></>}
    </svg>
  );
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────
function Sparkline({ scores }) {
  const hasData = scores.some(s => s > 0);
  if (!hasData) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:36}}>
        <span style={{fontSize:10,color:"#3a3a3c",letterSpacing:"0.06em"}}>NO DATA YET</span>
      </div>
    );
  }
  const W=110, H=36;
  const max = Math.max(30, ...scores); // floor at 30 so a 20-score shows visibly
  const pts = scores.map((s,i) => {
    const x = ((i/(scores.length-1))*W).toFixed(1);
    const y = (H - (s/max)*(H-6) - 3).toFixed(1);
    return `${x},${y}`;
  }).join(" ");
  // fill area under the line
  const fill = `0,${H} ${pts} ${W},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:36,display:"block",overflow:"visible"}} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#sg)"/>
      <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {scores.map((s,i) => {
        if (i!==scores.length-1) return null;
        const x = parseFloat(((i/(scores.length-1))*W).toFixed(1));
        const y = parseFloat((H-(s/max)*(H-6)-3).toFixed(1));
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#f97316"/>;
      })}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function InstaCard({
  dayNumber,
  totalDays,
  daysLeft,
  totals,
  todayData,
  data,
  effortScore: todayEffort = 0,
  userName,
  avatarGender, avatarSkin, avatarHair, avatarHairColor,
  avatarShirt, avatarGlasses, avatarBeard, avatarMustache,
  onClose,
}) {
  const cardRef   = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [mentorLine, setMentorLine]   = useState(null);
  const [lineLoading, setLineLoading] = useState(true);

  // ── Derived metrics ────
  const streak        = calcStreak(data);
  const studyDisplay  = formatHours(todayData);
  const last7         = getLast7Scores(data);
  const quantToday    = +todayData?.q || 0;
  const varcToday     = +todayData?.v || 0;
  const lrdiToday     = +todayData?.l || 0;
  const score         = Math.round(todayEffort);

  // progress bar colour
  const barColor = score >= 80 ? "#30d158" : score >= 50 ? "#f97316" : score >= 25 ? "#f59e0b" : "#6e6e73";
  const scoreLabel = score >= 80 ? "Excellent" : score >= 50 ? "Good progress" : score >= 25 ? "Keep going" : "Just start";

  // Date strings
  const now      = new Date();
  const dayName  = now.toLocaleDateString("en-IN", { weekday:"long" });
  const fullDate = now.toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });

  // Vikram feedback
  useEffect(() => {
    setLineLoading(true);
    const studyHrsForAPI = studyDisplay === "—" ? "0" : studyDisplay;
    fetch("/api/mentor/card", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        userName,
        daysLeft,
        dayNum: dayNumber,
        quant: quantToday,
        varc:  varcToday,
        lrdi:  lrdiToday,
        hoursStudied: studyHrsForAPI,
        effortScore: score,
        streak,
      }),
    })
      .then(r => r.json())
      .then(d => { setMentorLine(d.line || null); setLineLoading(false); })
      .catch(() => { setMentorLine(null); setLineLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local fallback (deterministic, score-based, no faking)
  const fallbackLine = (() => {
    if (score >= 80) return "Excellent day. This is what consistent looks like.";
    if (score >= 60) return "Solid work today. Keep this pace and CAT 2026 is yours.";
    if (score >= 40) return "Progress made. Tomorrow, take it one notch higher.";
    if (score >= 20) return "Every day you show up is a day your competition doesn't.";
    if (streak >= 3) return `${streak}-day streak. Protect it tomorrow.`;
    return "The only way out is through. Log one more rep today.";
  })();

  const displayLine = mentorLine || (lineLoading ? null : fallbackLine);

  // ── Download ────
  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, backgroundColor: "#000000", useCORS: true, logging: false,
      });
      const link = document.createElement("a");
      link.download = `conquer-day-${dayNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  // ── Styles (all inline for html2canvas reliability) ──
  const S = {
    page: {
      position:"fixed", inset:0,
      background:"rgba(0,0,0,0.90)",
      backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
      zIndex:500,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"flex-start",
      overflowY:"auto",
      padding:"calc(64px + 12px) 12px calc(80px + env(safe-area-inset-bottom) + 12px)",
      gap:12,
    },
    card: {
      position:"relative", overflow:"hidden",
      width:"min(92vw, 420px)",
      aspectRatio:"9 / 16",
      background:"#050505",
      border:"1px solid #1e1e1e",
      borderRadius:24,
      padding:"26px 22px 22px",
      fontFamily:"-apple-system,'SF Pro Display','Inter',sans-serif",
      boxSizing:"border-box",
      boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
      flexShrink:0,
      display:"flex", flexDirection:"column",
    },
    // accent glow blobs
    blob1: {
      position:"absolute", top:-40, right:-40,
      width:160, height:160, borderRadius:"50%",
      background:"radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
      pointerEvents:"none",
    },
    blob2: {
      position:"absolute", bottom:-30, left:-30,
      width:120, height:120, borderRadius:"50%",
      background:"radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)",
      pointerEvents:"none",
    },
    divider: { height:1, background:"#1a1a1a", margin:"16px 0" },
  };

  return (
    <div style={S.page}>
      {/* ── CARD (captured) ─────────────────────────────── */}
      <div ref={cardRef} style={S.card} onDoubleClick={handleDownload}>
        {/* Accent blobs */}
        <div style={S.blob1}/>
        <div style={S.blob2}/>

        {/* ── Header: brand + avatar ── */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:800,color:"#f97316",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>
              CONQUER CAT
            </div>
            <div style={{fontSize:20,fontWeight:700,color:"#f5f5f7",lineHeight:1.1,marginBottom:2}}>
              {dayName}
            </div>
            <div style={{fontSize:12,color:"#6e6e73",marginBottom:8}}>
              {fullDate}
            </div>
            <div style={{
              display:"inline-flex",alignItems:"center",
              padding:"3px 10px",borderRadius:999,
              border:"1px solid rgba(249,115,22,0.35)",
              background:"rgba(249,115,22,0.07)",
              color:"#f97316",fontSize:11,fontWeight:700,letterSpacing:"0.08em",
            }}>
              DAY {dayNumber} · {totalDays}
            </div>
          </div>
          <div style={{
            width:60,height:60,borderRadius:"50%",
            border:"2px solid #f97316",
            background:"#0a0a0a",
            boxShadow:"0 0 0 3px rgba(249,115,22,0.10),0 0 22px rgba(249,115,22,0.28)",
            overflow:"hidden",flexShrink:0,
          }}>
            <ShareAvatar
              gender={avatarGender} skinTone={avatarSkin}
              hairStyle={avatarHair} hairColor={avatarHairColor}
              shirtColor={avatarShirt} hasGlasses={!!avatarGlasses}
              hasBeard={!!avatarBeard} hasMustache={!!avatarMustache}
              size={60}
            />
          </div>
        </div>

        <div style={S.divider}/>

        {/* ── Metrics row: Streak · Hours · Effort ── */}
        <div style={{display:"flex",justifyContent:"space-between",textAlign:"center",marginBottom:14}}>
          {[
            { top: streak > 0 ? streak : "—", mid: streak === 1 ? "day" : "days", lbl: "STREAK" },
            { top: studyDisplay,                mid: "today",                        lbl: "STUDY"  },
            { top: score,                       mid: "/100",                         lbl: "EFFORT" },
          ].map(m => (
            <div key={m.lbl} style={{flex:1}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:2}}>
                <span style={{
                  fontSize: m.lbl==="STUDY" ? 18 : 28,
                  fontWeight:800, color:"#f97316", lineHeight:1,
                  letterSpacing:"-0.02em", fontVariantNumeric:"tabular-nums",
                }}>
                  {m.top}
                </span>
                <span style={{fontSize:12, color:"#8e8e93", fontWeight:600, marginBottom:2}}>{m.mid}</span>
              </div>
              <div style={{fontSize:9, color:"#6e6e73", letterSpacing:"0.10em", fontWeight:700, marginTop:4}}>
                {m.lbl}
              </div>
            </div>
          ))}
        </div>

        {/* ── Today's problems row ── */}
        <div style={{
          display:"flex", justifyContent:"center", gap:0, marginBottom:14,
          background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:12,
          overflow:"hidden",
        }}>
          {[
            { lbl:"QUANT", val: quantToday },
            { lbl:"VARC",  val: varcToday  },
            { lbl:"LRDI",  val: lrdiToday  },
          ].map((s, i) => (
            <div key={s.lbl} style={{
              flex:1, padding:"12px 4px", textAlign:"center",
              borderRight: i < 2 ? "1px solid #1e1e1e" : "none",
            }}>
              <div style={{fontSize:26, fontWeight:800, color:s.val>0 ? "#f5f5f7" : "#333338", lineHeight:1, letterSpacing:"-0.02em"}}>
                {s.val}
              </div>
              <div style={{fontSize:9, color:"#6e6e73", letterSpacing:"0.10em", fontWeight:700, marginTop:5}}>
                {s.lbl}
              </div>
            </div>
          ))}
        </div>

        {/* ── Effort bar ── */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
            <span style={{fontSize:10, color:"#8e8e93", letterSpacing:"0.08em", fontWeight:700}}>EFFORT SCORE</span>
            <span style={{fontSize:12, color:barColor, fontWeight:800, letterSpacing:"0.02em"}}>
              {score}/100 · {scoreLabel}
            </span>
          </div>
          <div style={{height:5, background:"#1e1e1e", borderRadius:999, overflow:"hidden"}}>
            <div style={{height:"100%", background:barColor, borderRadius:999, width:`${score}%`, minWidth:score>0 ? 5 : 0}}/>
          </div>
        </div>

        {/* ── 7-day sparkline ── */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9, color:"#6e6e73", letterSpacing:"0.10em", fontWeight:700, marginBottom:7}}>
            7 DAY TREND
          </div>
          <Sparkline scores={last7}/>
        </div>

        {/* ── Vikram feedback — flex:1 fills remaining 9:16 space ── */}
        <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", marginBottom:14}}>
          {lineLoading ? (
            <div style={{display:"flex", gap:5, alignItems:"center", padding:"12px 14px", borderLeft:"2px solid #242424"}}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:5, height:5, borderRadius:"50%", background:"#2a2a2e",
                  animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,
                }}/>
              ))}
            </div>
          ) : displayLine ? (
            <div style={{padding:"12px 14px", borderLeft:"2px solid #f97316"}}>
              <div style={{fontSize:9, color:"#6e6e73", letterSpacing:"0.10em", fontWeight:700, marginBottom:7, textTransform:"uppercase"}}>
                Vikram says
              </div>
              <div style={{fontSize:14, fontStyle:"italic", color:"#d1d1d6", lineHeight:1.6, letterSpacing:"0.01em"}}>
                "{displayLine}"
              </div>
            </div>
          ) : null}
        </div>

        <div style={S.divider}/>

        {/* ── Footer ── */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{fontSize:22,fontWeight:900,color:"#f97316",letterSpacing:"-0.02em",lineHeight:1}}>
            iQuanta
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:24,fontWeight:800,color:"#f97316",lineHeight:1,letterSpacing:"-0.02em"}}>
              {daysLeft}
            </div>
            <div style={{fontSize:9,color:"#6e6e73",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:2}}>
              DAYS TO CAT
            </div>
            {userName && (
              <div style={{fontSize:11,color:"#6e6e73",marginTop:4}}>— {userName}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hint ── */}
      <div style={{fontSize:11,color:"#3a3a3c",letterSpacing:"0.04em"}}>
        double tap card or press download
      </div>

      {/* ── Action buttons ── */}
      <div style={{display:"flex",gap:10,width:"min(92vw, 420px)",justifyContent:"center"}}>
        <button
          onClick={onClose}
          style={{
            height:40, flex:1,
            background:"transparent",
            border:"1px solid #1c1c1e",
            borderRadius:12,
            color:"#6e6e73", fontSize:13,
            cursor:"pointer", fontFamily:"inherit",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{marginRight:5,verticalAlign:"middle"}}>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Close
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width:52, height:40,
            background:"rgba(249,115,22,0.12)",
            border:"1px solid rgba(249,115,22,0.4)",
            borderRadius:12, color:"#f97316", fontSize:18,
            cursor: downloading ? "default" : "pointer",
            fontFamily:"inherit",
            opacity: downloading ? 0.6 : 1,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
          aria-label="Download card"
        >
          {downloading ? "…" : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v13"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
