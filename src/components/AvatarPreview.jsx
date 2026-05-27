function AvatarPreview({ gender="male", skinTone="medium", hairStyle="wavy",
  hairColor="black", shirtColor="orange", hasGlasses=false, glassesStyle="rounded",
  hasBeard=false, hasMustache=false, hasWrinkles=false, size=80 }) {

  const skinColors = {light:"#f1c27d", medium:"#c68642", dark:"#8d5524"}
  const hairColors = {black:"#1a0a00", brown:"#6b3a2a", blonde:"#c8a850", grey:"#888888"}
  const shirtColors = {orange:"#f97316",blue:"#3b82f6",green:"#22c55e",purple:"#a855f7",red:"#ef4444",white:"#e5e5e5"}
  const borderColors = {orange:"#f97316",blue:"#3b82f6",green:"#22c55e",purple:"#a855f7",red:"#ef4444",white:"#aaaaaa"}

  const skin = skinColors[skinTone] || "#c68642"
  const hair = hairColors[hairColor] || "#1a0a00"
  const shirt = shirtColors[shirtColor] || "#f97316"
  const border = borderColors[shirtColor] || "#3b82f6"
  const shadow = skinTone==="light" ? "#d4956a" : skinTone==="dark" ? "#6b3d1e" : "#b07030"
  const s = size + "px"

  const renderHair = () => {
    if (gender === "female") {
      if (hairStyle === "bun") return <>
        <ellipse cx="50" cy="36" rx="20" ry="14" fill={hair}/>
        <circle cx="50" cy="22" r="10" fill={hair}/>
        <circle cx="50" cy="22" r="6" fill={hair} opacity="0.7"/>
      </>
      if (hairStyle === "long") return <>
        <ellipse cx="50" cy="35" rx="22" ry="18" fill={hair}/>
        <path d="M28 42 Q22 60 24 85 Q26 70 30 58 Q27 50 28 42Z" fill={hair}/>
        <path d="M72 42 Q78 60 76 85 Q74 70 70 58 Q73 50 72 42Z" fill={hair}/>
        <path d="M24 70 Q22 80 25 88Z" fill={hair}/>
        <path d="M76 70 Q78 80 75 88Z" fill={hair}/>
      </>
      if (hairStyle === "curly") return <>
        <ellipse cx="50" cy="33" rx="23" ry="19" fill={hair}/>
        <circle cx="27" cy="40" r="7" fill={hair}/>
        <circle cx="73" cy="40" r="7" fill={hair}/>
        <circle cx="24" cy="54" r="6" fill={hair}/>
        <circle cx="76" cy="54" r="6" fill={hair}/>
        <circle cx="26" cy="67" r="5" fill={hair}/>
        <circle cx="74" cy="67" r="5" fill={hair}/>
      </>
      if (hairStyle === "short") return <>
        <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
        <path d="M30 40 Q28 50 30 54Z" fill={hair}/>
        <path d="M70 40 Q72 50 70 54Z" fill={hair}/>
      </>
      return <>
        <ellipse cx="50" cy="34" rx="22" ry="17" fill={hair}/>
        <path d="M28 40 Q24 54 26 68 Q23 58 27 50 Q24 45 28 40Z" fill={hair}/>
        <path d="M72 40 Q76 54 74 68 Q77 58 73 50 Q76 45 72 40Z" fill={hair}/>
        <path d="M26 58 Q22 66 25 74Z" fill={hair}/>
        <path d="M74 58 Q78 66 75 74Z" fill={hair}/>
      </>
    }
    if (hairStyle === "curly") return <>
      <ellipse cx="50" cy="33" rx="22" ry="18" fill={hair}/>
      <circle cx="29" cy="38" r="6" fill={hair}/>
      <circle cx="71" cy="38" r="6" fill={hair}/>
      <circle cx="26" cy="50" r="5" fill={hair}/>
      <circle cx="74" cy="50" r="5" fill={hair}/>
    </>
    if (hairStyle === "wavy") return <>
      <ellipse cx="50" cy="35" rx="22" ry="17" fill={hair}/>
      <path d="M28 42 Q24 53 26 64 Q23 56 27 50 Q24 46 28 42Z" fill={hair}/>
      <path d="M72 42 Q76 53 74 64 Q77 56 73 50 Q76 46 72 42Z" fill={hair}/>
    </>
    return <>
      <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
      <path d="M30 40 Q29 50 31 54Z" fill={hair}/>
      <path d="M70 40 Q71 50 69 54Z" fill={hair}/>
    </>
  }

  return (
    <div style={{
      width:s, height:s, minWidth:s, minHeight:s,
      borderRadius:"50%", flexShrink:0,
      border:`3px solid ${border}`,
      background:"var(--avatar-bg, #0a0a14)",
      boxShadow:`0 0 0 2px rgba(0,0,0,0.5), 0 4px 24px ${border}66`,
      overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="var(--avatar-bg-highlight, #1a1a2e)"/>
            <stop offset="100%" stopColor="var(--avatar-bg, #0a0a14)"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bgGrad)"/>
        <path d="M15 100 Q18 78 50 75 Q82 78 85 100Z" fill={shirt} opacity="0.9"/>
        <path d="M22 100 Q25 82 50 79 Q75 82 78 100Z" fill={shirt} opacity="0.6"/>
        <rect x="43" y="68" width="14" height="11" rx="4" fill={skin}/>
        <ellipse cx="50" cy="54" rx="20" ry="22" fill={skin}/>
        {renderHair()}
        <ellipse cx="30" cy="54" rx="4" ry="5" fill={shadow}/>
        <ellipse cx="70" cy="54" rx="4" ry="5" fill={shadow}/>
        <ellipse cx="41" cy="52" rx="5" ry="4" fill="white"/>
        <ellipse cx="59" cy="52" rx="5" ry="4" fill="white"/>
        <circle cx="42" cy="52" r="3" fill="#1a1a2e"/>
        <circle cx="60" cy="52" r="3" fill="#1a1a2e"/>
        <circle cx="43" cy="51" r="1" fill="white" opacity="0.8"/>
        <circle cx="61" cy="51" r="1" fill="white" opacity="0.8"/>
        <path d="M35 46 Q41 43 47 45" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M53 45 Q59 43 65 46" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {hasGlasses && (glassesStyle === "slick" ? <>
          {/* Slick thin rectangular frames */}
          <rect x="33" y="49" width="16" height="7" rx="1.5" ry="1.5"
            fill="rgba(200,230,255,0.10)" stroke="#1a1a1a" strokeWidth="1.2"/>
          <rect x="51" y="49" width="16" height="7" rx="1.5" ry="1.5"
            fill="rgba(200,230,255,0.10)" stroke="#1a1a1a" strokeWidth="1.2"/>
          <line x1="49" y1="52" x2="51" y2="52" stroke="#1a1a1a" strokeWidth="1.0"/>
          <line x1="33" y1="52" x2="27" y2="50" stroke="#1a1a1a" strokeWidth="1.0" strokeLinecap="round"/>
          <line x1="67" y1="52" x2="73" y2="50" stroke="#1a1a1a" strokeWidth="1.0" strokeLinecap="round"/>
        </> : <>
          {/* Default rounded glasses */}
          <path d="M33 48 L33 55 Q33 58 36 58 L46 58 Q49 58 49 55 L49 48 Q49 45 46 45 L36 45 Q33 45 33 48Z"
            fill="rgba(100,150,255,0.12)" stroke="#222" strokeWidth="1.8"/>
          <path d="M51 48 L51 55 Q51 58 54 58 L64 58 Q67 58 67 55 L67 48 Q67 45 64 45 L54 45 Q51 45 51 48Z"
            fill="rgba(100,150,255,0.12)" stroke="#222" strokeWidth="1.8"/>
          <path d="M49 51 L51 51" stroke="#222" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M33 50 L27 48" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M67 50 L73 48" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
        </>)}
        <path d="M50 56 Q47 62 44 63 Q50 65 56 63 Q53 62 50 56Z" fill={shadow} opacity="0.5"/>
        {hasWrinkles && <>
          {/* Forehead lines — subtle horizontal */}
          <path d="M36 39 Q50 37 64 39" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <path d="M37 42 Q50 40 63 42" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
          {/* Nasolabial folds — cheek-to-mouth */}
          <path d="M36 56 Q33 62 38 66" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
          <path d="M64 56 Q67 62 62 66" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
          {/* Crow's feet — outer eyes */}
          <path d="M29 50 Q26 48 27 51" stroke="rgba(0,0,0,0.09)" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
          <path d="M71 50 Q74 48 73 51" stroke="rgba(0,0,0,0.09)" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
        </>}
        {hasMustache && gender==="male" && (
          <path d="M38 64 Q44 61 50 63 Q56 61 62 64 Q57 67 50 65 Q43 67 38 64Z" fill={hair}/>
        )}
        {hasBeard && gender==="male" && <>
          <path d="M32 64 Q34 74 40 79 Q50 84 60 79 Q66 74 68 64 Q58 70 50 71 Q42 70 32 64Z" fill={hair}/>
          <path d="M39 62 Q44 65 50 64 Q56 65 61 62 Q56 67 50 66 Q44 67 39 62Z" fill={hair}/>
        </>}
        {gender==="female"
          ? <path d="M44 68 Q50 71 56 68 Q50 73 44 68Z" fill={shadow} opacity="0.8"/>
          : <path d="M43 69 Q50 71 57 69" stroke={shadow} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        }
        <circle cx="50" cy="50" r="48" fill="none" stroke={border} strokeWidth="0.8" opacity="0.4"/>
      </svg>
    </div>
  )
}

export default AvatarPreview;
