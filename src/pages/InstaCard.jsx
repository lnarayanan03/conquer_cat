import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./InstaCard.css";

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
      <div className="ic-card" ref={cardRef} onDoubleClick={handleDownload}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"flex-start",marginBottom:24}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,
              color:"#f97316",letterSpacing:"0.12em",
              textTransform:"uppercase",marginBottom:6}}>
              CONQUER CAT
            </div>
            <div style={{fontSize:22,fontWeight:700,
              color:"#f5f5f7",lineHeight:1.1}}>
              {new Date().toLocaleDateString("en-IN", {weekday:"long"})}
            </div>
            <div style={{fontSize:14,color:"#6e6e73",marginTop:2}}>
              {new Date().toLocaleDateString("en-IN", {
                day:"numeric",month:"long",year:"numeric"
              })}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:"#6e6e73",
              letterSpacing:"0.06em",marginBottom:2}}>DAY</div>
            <div style={{fontSize:22,fontWeight:800,
              color:"#f5f5f7",lineHeight:1}}>{dayNumber}</div>
            <div style={{fontSize:10,color:"#3a3a3c"}}>
              of {totalDays}
            </div>
          </div>
        </div>

        <div style={{height:1,background:"#1c1c1e",marginBottom:24}}/>

        <div style={{display:"flex",
          justifyContent:"space-around",
          marginBottom:24}}>
          {[
            {label:"QUANT", val: todayData?.q || 0},
            {label:"VARC", val: todayData?.v || 0},
            {label:"LRDI", val: todayData?.l || 0},
          ].map(s => (
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:"#6e6e73",
                letterSpacing:"0.1em",marginBottom:8}}>
                {s.label}
              </div>
              <div style={{fontSize:52,fontWeight:700,
                color:"#f97316",lineHeight:1,
                letterSpacing:"-0.02em"}}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexWrap:"wrap",
          gap:8,marginBottom:16}}>
          {[
            {label:"Live class", on: todayData?.lc},
            {label:"Afternoon", on: todayData?.as},
            {label:"Application", on: todayData?.ap},
            {label:"VARC passage", on: todayData?.vp},
          ].map(s => (
            <div key={s.label} style={{
              display:"flex",alignItems:"center",gap:5,
              opacity: s.on ? 1 : 0.3
            }}>
              <div style={{
                width:7,height:7,borderRadius:"50%",
                background: s.on ? "#f97316" : "#3a3a3c",
                flexShrink:0
              }}/>
              <span style={{fontSize:11,color:"#a1a1a6"}}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {totalStudiedMins > 0 && (
          <div style={{fontSize:13,color:"#6e6e73",
            marginBottom:24,letterSpacing:"0.02em"}}>
            {studiedDisplay} grinded today
          </div>
        )}

        <div style={{height:1,background:"#1c1c1e",marginBottom:24}}/>

        <div style={{flex:1,display:"flex",
          alignItems:"center",marginBottom:24}}>
          {lineLoading ? (
            <div style={{display:"flex",gap:4}}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:5,height:5,borderRadius:"50%",
                  background:"#3a3a3c",
                  animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`
                }}/>
              ))}
            </div>
          ) : (
            <div style={{
              fontSize:15,fontStyle:"italic",
              color:"#f5f5f7",lineHeight:1.6,
              letterSpacing:"0.01em",
              borderLeft:"2px solid #f97316",
              paddingLeft:14
            }}>
              "{mentorLine}"
            </div>
          )}
        </div>

        <div style={{height:1,background:"#1c1c1e",marginBottom:20}}/>

        <div style={{display:"flex",
          justifyContent:"space-between",
          alignItems:"flex-end"}}>
          <div style={{fontSize:26,fontWeight:900,
            color:"#f97316",letterSpacing:"-0.02em",
            lineHeight:1}}>
            iQuanta
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{
              fontSize:28,fontWeight:800,
              color:"#f97316",lineHeight:1,
              letterSpacing:"-0.02em"
            }}>{daysLeft}</div>
            <div style={{fontSize:9,color:"#6e6e73",
              letterSpacing:"0.08em",
              textTransform:"uppercase",marginTop:3}}>
              DAYS TO CAT 2026
            </div>
            <div style={{fontSize:11,color:"#3a3a3c",
              marginTop:4}}>— {userName || "Me"}</div>
          </div>
        </div>
      </div>

      <div style={{fontSize:11,color:"#3a3a3c",letterSpacing:"0.04em"}}>
        double tap card or press download
      </div>

      <div style={{display:"flex",gap:10,width:"100%",maxWidth:340,
        justifyContent:"center"}}>
        <button
          onClick={onClose}
          style={{
            height:40,
            flex:1,
            background:"transparent",
            border:"1px solid #1c1c1e",
            borderRadius:12,
            color:"#6e6e73",
            fontSize:13,
            cursor:"pointer",
            fontFamily:"inherit",
          }}
        >
          × Close
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width:52,
            height:40,
            background:"rgba(249,115,22,0.12)",
            border:"1px solid rgba(249,115,22,0.4)",
            borderRadius:12,
            color:"#f97316",
            fontSize:18,
            cursor:downloading ? "default" : "pointer",
            fontFamily:"inherit",
            opacity:downloading ? 0.6 : 1,
          }}
          aria-label="Download card"
        >
          {downloading ? "…" : "⬇"}
        </button>
      </div>
    </div>
  );
}
