import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./InstaCard.css";

// Local avatar — no import from App.jsx (avoids circular import).
// Solid fills throughout so html2canvas renders reliably.
function ShareAvatar({
  gender = "male",
  skinTone = "medium",
  hairStyle = "wavy",
  hairColor = "black",
  shirtColor = "blue",
  hasGlasses = false,
  hasBeard = false,
  hasMustache = false,
  size = 64,
}) {
  const skinColors = { light: "#f1c27d", medium: "#c68642", dark: "#8d5524" };
  const hairColors = { black: "#1a0a00", brown: "#6b3a2a", blonde: "#c8a850", grey: "#888888" };
  const shirtColors = { orange: "#f97316", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", red: "#ef4444", white: "#e5e5e5" };

  const skin = skinColors[skinTone] || "#c68642";
  const hair = hairColors[hairColor] || "#1a0a00";
  const shirt = shirtColors[shirtColor] || "#3b82f6";
  const shadow = skinTone === "light" ? "#d4956a" : skinTone === "dark" ? "#6b3d1e" : "#b07030";

  const renderHair = () => {
    if (gender === "female") {
      if (hairStyle === "bun") return <>
        <ellipse cx="50" cy="36" rx="20" ry="14" fill={hair}/>
        <circle cx="50" cy="22" r="10" fill={hair}/>
        <circle cx="50" cy="22" r="6" fill={hair} opacity="0.7"/>
      </>;
      if (hairStyle === "long") return <>
        <ellipse cx="50" cy="35" rx="22" ry="18" fill={hair}/>
        <path d="M28 42 Q22 60 24 85 Q26 70 30 58 Q27 50 28 42Z" fill={hair}/>
        <path d="M72 42 Q78 60 76 85 Q74 70 70 58 Q73 50 72 42Z" fill={hair}/>
      </>;
      if (hairStyle === "curly") return <>
        <ellipse cx="50" cy="33" rx="23" ry="19" fill={hair}/>
        <circle cx="27" cy="40" r="7" fill={hair}/>
        <circle cx="73" cy="40" r="7" fill={hair}/>
        <circle cx="24" cy="54" r="6" fill={hair}/>
        <circle cx="76" cy="54" r="6" fill={hair}/>
      </>;
      if (hairStyle === "short") return <>
        <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
        <path d="M30 40 Q28 50 30 54Z" fill={hair}/>
        <path d="M70 40 Q72 50 70 54Z" fill={hair}/>
      </>;
      return <>
        <ellipse cx="50" cy="34" rx="22" ry="17" fill={hair}/>
        <path d="M28 40 Q24 54 26 68 Q23 58 27 50 Q24 45 28 40Z" fill={hair}/>
        <path d="M72 40 Q76 54 74 68 Q77 58 73 50 Q76 45 72 40Z" fill={hair}/>
      </>;
    }
    if (hairStyle === "curly") return <>
      <ellipse cx="50" cy="33" rx="22" ry="18" fill={hair}/>
      <circle cx="29" cy="38" r="6" fill={hair}/>
      <circle cx="71" cy="38" r="6" fill={hair}/>
      <circle cx="26" cy="50" r="5" fill={hair}/>
      <circle cx="74" cy="50" r="5" fill={hair}/>
    </>;
    if (hairStyle === "wavy") return <>
      <ellipse cx="50" cy="35" rx="22" ry="17" fill={hair}/>
      <path d="M28 42 Q24 53 26 64 Q23 56 27 50 Q24 46 28 42Z" fill={hair}/>
      <path d="M72 42 Q76 53 74 64 Q77 56 73 50 Q76 46 72 42Z" fill={hair}/>
    </>;
    return <>
      <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
      <path d="M30 40 Q29 50 31 54Z" fill={hair}/>
      <path d="M70 40 Q71 50 69 54Z" fill={hair}/>
    </>;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* solid fill — no url() reference so html2canvas renders correctly */}
      <circle cx="50" cy="50" r="50" fill="#0f0f1a"/>
      <path d="M15 100 Q18 78 50 75 Q82 78 85 100Z" fill={shirt} opacity="0.9"/>
      <path d="M22 100 Q25 82 50 79 Q75 82 78 100Z" fill={shirt} opacity="0.55"/>
      <rect x="43" y="68" width="14" height="11" rx="4" fill={skin}/>
      <ellipse cx="50" cy="54" rx="20" ry="22" fill={skin}/>
      {renderHair()}
      <ellipse cx="30" cy="54" rx="4" ry="5" fill={shadow}/>
      <ellipse cx="70" cy="54" rx="4" ry="5" fill={shadow}/>
      <ellipse cx="41" cy="52" rx="5" ry="4" fill="white"/>
      <ellipse cx="59" cy="52" rx="5" ry="4" fill="white"/>
      <circle cx="42" cy="52" r="3" fill="#0f0f1a"/>
      <circle cx="60" cy="52" r="3" fill="#0f0f1a"/>
      <circle cx="43" cy="51" r="1" fill="white" opacity="0.8"/>
      <circle cx="61" cy="51" r="1" fill="white" opacity="0.8"/>
      <path d="M35 46 Q41 43 47 45" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M53 45 Q59 43 65 46" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {hasGlasses && <>
        <path d="M33 48 L33 55 Q33 58 36 58 L46 58 Q49 58 49 55 L49 48 Q49 45 46 45 L36 45 Q33 45 33 48Z"
          fill="#6496ff26" stroke="#444" strokeWidth="1.8"/>
        <path d="M51 48 L51 55 Q51 58 54 58 L64 58 Q67 58 67 55 L67 48 Q67 45 64 45 L54 45 Q51 45 51 48Z"
          fill="#6496ff26" stroke="#444" strokeWidth="1.8"/>
        <path d="M49 51 L51 51" stroke="#444" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M33 50 L27 48" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M67 50 L73 48" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
      </>}
      <path d="M50 56 Q47 62 44 63 Q50 65 56 63 Q53 62 50 56Z" fill={shadow} opacity="0.5"/>
      {hasMustache && gender === "male" && (
        <path d="M38 64 Q44 61 50 63 Q56 61 62 64 Q57 67 50 65 Q43 67 38 64Z" fill={hair}/>
      )}
      {hasBeard && gender === "male" && <>
        <path d="M32 64 Q34 74 40 79 Q50 84 60 79 Q66 74 68 64 Q58 70 50 71 Q42 70 32 64Z" fill={hair}/>
        <path d="M39 62 Q44 65 50 64 Q56 65 61 62 Q56 67 50 66 Q44 67 39 62Z" fill={hair}/>
      </>}
      {gender === "female"
        ? <path d="M44 68 Q50 71 56 68 Q50 73 44 68Z" fill={shadow} opacity="0.8"/>
        : <path d="M43 69 Q50 71 57 69" stroke={shadow} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      }
    </svg>
  );
}

export default function InstaCard({
  dayNumber,
  totalDays,
  daysLeft,
  totals,
  todayData,
  userName,
  avatarGender,
  avatarSkin,
  avatarHair,
  avatarHairColor,
  avatarShirt,
  avatarGlasses,
  avatarBeard,
  avatarMustache,
  onClose,
}) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [mentorLine, setMentorLine] = useState(null);
  const [lineLoading, setLineLoading] = useState(true);

  const totalStudiedMins =
    (todayData?.lc ? 120 : 0) +
    (todayData?.as ? 40 : 0) +
    (todayData?.ap ? 120 : 0) +
    (todayData?.vp ? 20 : 0) +
    ((+todayData?.ph || 0) * 60) +
    (+todayData?.pm || 0);
  const studiedHrs = Math.floor(totalStudiedMins / 60);
  const studiedMins = totalStudiedMins % 60;
  const studiedDisplay = studiedHrs > 0 && studiedMins > 0
    ? `${studiedHrs}h ${studiedMins}m`
    : studiedHrs > 0 ? `${studiedHrs}h` : `${studiedMins}m`;

  useEffect(() => {
    setLineLoading(true);
    fetch("/api/mentor/card", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        userName,
        daysLeft,
        dayNum: dayNumber,
        quant: todayData?.q || 0,
        varc: todayData?.v || 0,
        lrdi: todayData?.l || 0,
        hoursStudied: studiedDisplay,
        liveClass: todayData?.lc || false,
        afternoonSession: todayData?.as || false,
        applicationClass: todayData?.ap || false,
        varcPassage: todayData?.vp || false,
      })
    })
      .then(r => r.json())
      .then(d => {
        setMentorLine(d.line || "The grind continues.");
        setLineLoading(false);
      })
      .catch(() => {
        setMentorLine("The grind continues.");
        setLineLoading(false);
      });
  }, []);

  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: "#000000",
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `conquer-day-${dayNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  const quantTarget = totalDays * 10;
  const varcTarget  = totalDays * 5;
  const lrdiTarget  = totalDays * 5;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      zIndex: 500,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 14,
    }}>
      {/*
        ic-card is captured by html2canvas.
        position: relative required for absolute children.
        All critical styles inline — html2canvas reads computed styles,
        inline beats CSS class for capture reliability.
      */}
      <div
        className="ic-card"
        ref={cardRef}
        onDoubleClick={handleDownload}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Avatar — absolute, top-right, z-index 10 */}
        <div style={{
          position: "absolute",
          top: 44,
          right: 44,
          width: 68,
          height: 68,
          borderRadius: "50%",
          border: "2.5px solid #f97316",
          background: "#050505",
          boxShadow: "0 0 0 4px rgba(249,115,22,0.12), 0 0 28px rgba(249,115,22,0.35)",
          overflow: "hidden",
          zIndex: 10,
        }}>
          <ShareAvatar
            gender={avatarGender}
            skinTone={avatarSkin}
            hairStyle={avatarHair}
            hairColor={avatarHairColor}
            shirtColor={avatarShirt}
            hasGlasses={!!avatarGlasses}
            hasBeard={!!avatarBeard}
            hasMustache={!!avatarMustache}
            size={68}
          />
        </div>

        {/* Brand + date + DAY pill */}
        <div style={{marginBottom:20}}>
          <div style={{
            fontSize:11,fontWeight:700,color:"#f97316",
            letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6,
          }}>
            CONQUER CAT
          </div>
          <div style={{fontSize:22,fontWeight:700,color:"#f5f5f7",lineHeight:1.1}}>
            {new Date().toLocaleDateString("en-IN", {weekday:"long"})}
          </div>
          <div style={{fontSize:14,color:"#6e6e73",marginTop:2}}>
            {new Date().toLocaleDateString("en-IN", {
              day:"numeric",month:"long",year:"numeric"
            })}
          </div>
          <div style={{
            display:"inline-flex",alignItems:"center",
            padding:"4px 12px",borderRadius:999,
            border:"1px solid rgba(249,115,22,0.4)",
            background:"rgba(249,115,22,0.08)",
            color:"#f97316",fontSize:12,fontWeight:700,
            letterSpacing:"0.08em",marginTop:6,
          }}>
            DAY {dayNumber} · {totalDays}
          </div>
        </div>

        <div style={{height:1,background:"#1c1c1e",marginBottom:20}}/>

        {/* Stats row — QUANT | VARC | LRDI only */}
        <div style={{display:"flex",justifyContent:"space-around",marginBottom:20}}>
          {[
            {label:"QUANT", val: todayData?.q || 0},
            {label:"VARC",  val: todayData?.v || 0},
            {label:"LRDI",  val: todayData?.l || 0},
          ].map(s => (
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.1em",marginBottom:8}}>
                {s.label}
              </div>
              <div style={{fontSize:52,fontWeight:700,color:"#f97316",lineHeight:1,letterSpacing:"-0.02em"}}>
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* Session toggles */}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
          {[
            {label:"Live class",   on: todayData?.lc},
            {label:"Afternoon",    on: todayData?.as},
            {label:"Application",  on: todayData?.ap},
            {label:"VARC passage", on: todayData?.vp},
          ].map(s => (
            <div key={s.label} style={{
              display:"flex",alignItems:"center",gap:5,
              opacity: s.on ? 1 : 0.3,
            }}>
              <div style={{
                width:7,height:7,borderRadius:"50%",
                background: s.on ? "#f97316" : "#3a3a3c",
                flexShrink:0,
              }}/>
              <span style={{fontSize:11,color:"#a1a1a6"}}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Hours grinded */}
        {totalStudiedMins > 0 && (
          <div style={{fontSize:13,color:"#6e6e73",marginBottom:14,letterSpacing:"0.04em"}}>
            grinded {studiedDisplay} today
          </div>
        )}

        {/* Section progress bars */}
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          {[
            {label:"QUANT", done: totals?.quant||0, target: quantTarget},
            {label:"VARC",  done: totals?.varc||0,  target: varcTarget},
            {label:"LRDI",  done: totals?.lrdi||0,  target: lrdiTarget},
          ].map(b => (
            <div key={b.label} style={{flex:1}}>
              <div style={{fontSize:9,color:"#6e6e73",letterSpacing:"0.08em",marginBottom:4}}>
                {b.label}
              </div>
              <div style={{height:3,background:"#1c1c1e",borderRadius:999,overflow:"hidden"}}>
                <div style={{
                  height:"100%",
                  background:"#f97316",
                  borderRadius:999,
                  width:`${b.target > 0 ? Math.min(100,(b.done/b.target)*100) : 0}%`,
                }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Vikram quote */}
        <div style={{flex:1,display:"flex",alignItems:"center"}}>
          {lineLoading ? (
            <div style={{display:"flex",gap:4}}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:5,height:5,borderRadius:"50%",
                  background:"#3a3a3c",
                  animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,
                }}/>
              ))}
            </div>
          ) : (
            <div style={{width:"100%"}}>
              <div style={{
                fontSize:9,color:"#3a3a3c",
                letterSpacing:"0.1em",textTransform:"uppercase",
                marginBottom:8,
              }}>
                VIKRAM SAYS
              </div>
              <div style={{
                fontSize:15,fontStyle:"italic",
                color:"#f5f5f7",lineHeight:1.6,
                letterSpacing:"0.01em",
                borderLeft:"2px solid #f97316",
                paddingLeft:14,
              }}>
                "{mentorLine}"
              </div>
            </div>
          )}
        </div>

        <div style={{height:1,background:"#1c1c1e",marginBottom:20}}/>

        {/* Bottom — iQuanta brand + days left */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{fontSize:26,fontWeight:900,color:"#f97316",letterSpacing:"-0.02em",lineHeight:1}}>
            iQuanta
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{
              fontSize:28,fontWeight:800,
              color:"#f97316",lineHeight:1,
              letterSpacing:"-0.02em",
            }}>
              {daysLeft}
            </div>
            <div style={{
              fontSize:9,color:"#6e6e73",
              letterSpacing:"0.08em",
              textTransform:"uppercase",marginTop:3,
            }}>
              DAYS TO CAT 2026
            </div>
            <div style={{fontSize:11,color:"#3a3a3c",marginTop:4}}>— {userName || "Me"}</div>
          </div>
        </div>
      </div>

      <div style={{fontSize:11,color:"#3a3a3c",letterSpacing:"0.04em"}}>
        double tap card or press download
      </div>

      <div style={{display:"flex",gap:10,width:"100%",maxWidth:340,justifyContent:"center"}}>
        <button
          onClick={onClose}
          style={{
            height:40,flex:1,
            background:"transparent",
            border:"1px solid #1c1c1e",
            borderRadius:12,
            color:"#6e6e73",fontSize:13,
            cursor:"pointer",fontFamily:"inherit",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{marginRight:5,verticalAlign:"middle"}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Close
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width:52,height:40,
            background:"rgba(249,115,22,0.12)",
            border:"1px solid rgba(249,115,22,0.4)",
            borderRadius:12,color:"#f97316",fontSize:18,
            cursor:downloading ? "default" : "pointer",
            fontFamily:"inherit",
            opacity:downloading ? 0.6 : 1,
          }}
          aria-label="Download card"
        >
          {downloading ? "…" : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v13"/>
              <path d="M7 11l5 5 5-5"/>
              <path d="M5 20h14"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
