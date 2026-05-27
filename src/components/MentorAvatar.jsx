import AvatarPreview from "./AvatarPreview.jsx";

export function MentorAvatar({ size = 40 }) {
  // Vikram Anand — middle-aged, distinguished: grey hair, wrinkles, slick glasses
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
      border: "2px solid #f97316",
      background: "var(--avatar-bg, #000000)",
      boxShadow: "0 0 0 2px rgba(249,115,22,0.18), 0 4px 20px rgba(249,115,22,0.35)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{display: "block"}}
      >
        <circle cx="50" cy="50" r="50" fill="var(--avatar-bg, #000000)"/>

        {/* Shirt */}
        <path d="M20 100 Q20 80 50 78 Q80 80 80 100Z" fill="#f97316" opacity="0.8"/>
        <path d="M25 100 Q25 82 50 80 Q75 82 75 100Z" fill="#f97316" opacity="0.5"/>

        {/* Neck + Face — warm medium skin */}
        <rect x="43" y="70" width="14" height="12" rx="4" fill="#c68642"/>
        <ellipse cx="50" cy="57" rx="20" ry="23" fill="#c68642"/>

        {/* Grey-white hair — short, professional, slightly receded at temples */}
        <ellipse cx="50" cy="37" rx="21" ry="15" fill="#9a9a9a"/>
        <path d="M30 43 Q29 53 31 57 Q30 50 32 46Z" fill="#9a9a9a"/>
        <path d="M70 43 Q71 53 69 57 Q70 50 68 46Z" fill="#9a9a9a"/>

        {/* Ear cheeks */}
        <ellipse cx="30" cy="57" rx="4" ry="5" fill="#b87333"/>
        <ellipse cx="70" cy="57" rx="4" ry="5" fill="#b87333"/>

        {/* Eye whites */}
        <ellipse cx="41" cy="55" rx="5" ry="4" fill="white"/>
        <ellipse cx="59" cy="55" rx="5" ry="4" fill="white"/>
        {/* Pupils */}
        <circle cx="42" cy="55" r="3" fill="#1a1a1a"/>
        <circle cx="60" cy="55" r="3" fill="#1a1a1a"/>
        {/* Eye highlights */}
        <circle cx="43" cy="54" r="1" fill="white" opacity="0.6"/>
        <circle cx="61" cy="54" r="1" fill="white" opacity="0.6"/>

        {/* Eyebrows — grey, slightly arched, distinguished */}
        <path d="M35 49 Q41 46 47 48" stroke="#888888" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M53 48 Q59 46 65 49" stroke="#888888" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

        {/* Wrinkles — subtle, distinguished */}
        {/* Forehead lines */}
        <path d="M36 41 Q50 39 64 41" stroke="rgba(0,0,0,0.13)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        <path d="M37 44 Q50 42 63 44" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
        {/* Nasolabial folds */}
        <path d="M36 58 Q33 64 38 68" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
        <path d="M64 58 Q67 64 62 68" stroke="rgba(0,0,0,0.10)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
        {/* Crow's feet */}
        <path d="M29 53 Q26 51 27 54" stroke="rgba(0,0,0,0.09)" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
        <path d="M71 53 Q74 51 73 54" stroke="rgba(0,0,0,0.09)" strokeWidth="0.6" fill="none" strokeLinecap="round"/>

        {/* Nose shadow */}
        <path d="M50 59 Q47 65 44 66 Q50 68 56 66 Q53 65 50 59Z" fill="#b07030" opacity="0.6"/>

        {/* Slick rectangular glasses — thin dark frames over eyes */}
        <rect x="32" y="51" width="17" height="8" rx="1.5" ry="1.5"
          fill="rgba(200,230,255,0.08)" stroke="#1a1a1a" strokeWidth="1.2"/>
        <rect x="51" y="51" width="17" height="8" rx="1.5" ry="1.5"
          fill="rgba(200,230,255,0.08)" stroke="#1a1a1a" strokeWidth="1.2"/>
        {/* Bridge */}
        <line x1="49" y1="55" x2="51" y2="55" stroke="#1a1a1a" strokeWidth="1.0"/>
        {/* Temple arms */}
        <line x1="32" y1="55" x2="27" y2="54" stroke="#1a1a1a" strokeWidth="1.0" strokeLinecap="round"/>
        <line x1="68" y1="55" x2="73" y2="54" stroke="#1a1a1a" strokeWidth="1.0" strokeLinecap="round"/>

        {/* Mouth */}
        <path d="M43 72 Q50 73 57 72" stroke="#8b5e3c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

        {/* Orange ring hint */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3"/>
      </svg>
    </div>
  )
}

export function UserAvatar({ size=40, gender="male", skinTone="medium", hairStyle="wavy",
  hairColor="black", shirtColor="blue", hasGlasses=false, hasBeard=false, hasMustache=false }) {
  return (
    <AvatarPreview gender={gender} skinTone={skinTone} hairStyle={hairStyle}
      hairColor={hairColor} shirtColor={shirtColor}
      hasGlasses={hasGlasses} hasBeard={hasBeard} hasMustache={hasMustache} size={size}/>
  )
}

export default MentorAvatar;
