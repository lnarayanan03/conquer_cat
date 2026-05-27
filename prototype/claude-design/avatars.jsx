// avatars.jsx — simplified Vikram + customizable user avatar (matches the real components)

const SKIN = { light: '#f1c27d', medium: '#c68642', dark: '#8d5524' };
const HAIR = { black: '#1a0a00', brown: '#6b3a2a', blonde: '#c8a850', grey: '#888888' };
const SHIRT = { orange: '#f97316', blue: '#3b82f6', green: '#22c55e', purple: '#a855f7', red: '#ef4444', white: '#e5e5e5' };

function MentorAvatar({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: '2px solid #f97316', background: '#000',
      boxShadow: '0 0 0 2px rgba(249,115,22,0.18), 0 4px 20px rgba(249,115,22,0.35)',
      overflow: 'hidden', display: 'flex',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <circle cx="50" cy="50" r="50" fill="#000"/>
        {/* Shirt */}
        <path d="M20 100 Q20 80 50 78 Q80 80 80 100Z" fill="#f97316" opacity="0.8"/>
        <path d="M25 100 Q25 82 50 80 Q75 82 75 100Z" fill="#f97316" opacity="0.5"/>
        {/* Face + neck */}
        <rect x="43" y="70" width="14" height="12" rx="4" fill="#c68642"/>
        <ellipse cx="50" cy="57" rx="20" ry="23" fill="#c68642"/>
        {/* Grey hair */}
        <ellipse cx="50" cy="37" rx="21" ry="15" fill="#9a9a9a"/>
        <path d="M30 43 Q29 53 31 57Z" fill="#9a9a9a"/>
        <path d="M70 43 Q71 53 69 57Z" fill="#9a9a9a"/>
        {/* Cheeks */}
        <ellipse cx="30" cy="57" rx="4" ry="5" fill="#b87333"/>
        <ellipse cx="70" cy="57" rx="4" ry="5" fill="#b87333"/>
        {/* Eyes */}
        <ellipse cx="41" cy="55" rx="5" ry="4" fill="white"/>
        <ellipse cx="59" cy="55" rx="5" ry="4" fill="white"/>
        <circle cx="42" cy="55" r="3" fill="#1a1a1a"/>
        <circle cx="60" cy="55" r="3" fill="#1a1a1a"/>
        {/* Eyebrows grey */}
        <path d="M35 49 Q41 46 47 48" stroke="#888" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M53 48 Q59 46 65 49" stroke="#888" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* Forehead wrinkles */}
        <path d="M36 41 Q50 39 64 41" stroke="rgba(0,0,0,0.13)" strokeWidth="0.8" fill="none"/>
        {/* Glasses */}
        <rect x="32" y="51" width="17" height="8" rx="1.5" fill="rgba(200,230,255,0.08)" stroke="#1a1a1a" strokeWidth="1.2"/>
        <rect x="51" y="51" width="17" height="8" rx="1.5" fill="rgba(200,230,255,0.08)" stroke="#1a1a1a" strokeWidth="1.2"/>
        <line x1="49" y1="55" x2="51" y2="55" stroke="#1a1a1a" strokeWidth="1"/>
        {/* Mouth */}
        <path d="M43 72 Q50 73 57 72" stroke="#8b5e3c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Nose */}
        <path d="M50 59 Q47 65 44 66 Q50 68 56 66 Q53 65 50 59Z" fill="#b07030" opacity="0.6"/>
      </svg>
    </div>
  );
}

function UserAvatar({
  size = 80,
  gender = 'male',
  skinTone = 'medium',
  hairColor = 'black',
  hairStyle = 'wavy',
  shirtColor = 'blue',
  hasGlasses = false,
  hasBeard = false,
  hasMustache = false,
}) {
  const skin = SKIN[skinTone] || SKIN.medium;
  const hair = HAIR[hairColor] || HAIR.black;
  const shirt = SHIRT[shirtColor] || SHIRT.blue;
  const shadow = skinTone === 'light' ? '#d4956a' : skinTone === 'dark' ? '#6b3d1e' : '#b07030';

  const renderHair = () => {
    if (gender === 'female') {
      if (hairStyle === 'bun') return (
        <React.Fragment>
          <ellipse cx="50" cy="36" rx="20" ry="14" fill={hair}/>
          <circle cx="50" cy="22" r="10" fill={hair}/>
        </React.Fragment>
      );
      if (hairStyle === 'long') return (
        <React.Fragment>
          <ellipse cx="50" cy="35" rx="22" ry="18" fill={hair}/>
          <path d="M28 42 Q22 60 24 85 Q26 70 30 58 Q27 50 28 42Z" fill={hair}/>
          <path d="M72 42 Q78 60 76 85 Q74 70 70 58 Q73 50 72 42Z" fill={hair}/>
        </React.Fragment>
      );
      if (hairStyle === 'curly') return (
        <React.Fragment>
          <ellipse cx="50" cy="33" rx="23" ry="19" fill={hair}/>
          <circle cx="27" cy="40" r="7" fill={hair}/>
          <circle cx="73" cy="40" r="7" fill={hair}/>
          <circle cx="24" cy="54" r="6" fill={hair}/>
          <circle cx="76" cy="54" r="6" fill={hair}/>
        </React.Fragment>
      );
      if (hairStyle === 'short') return (
        <React.Fragment>
          <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
        </React.Fragment>
      );
      return (
        <React.Fragment>
          <ellipse cx="50" cy="34" rx="22" ry="17" fill={hair}/>
          <path d="M28 40 Q24 54 26 68Z" fill={hair}/>
          <path d="M72 40 Q76 54 74 68Z" fill={hair}/>
        </React.Fragment>
      );
    }
    // male
    if (hairStyle === 'curly') return (
      <React.Fragment>
        <ellipse cx="50" cy="33" rx="22" ry="18" fill={hair}/>
        <circle cx="29" cy="38" r="6" fill={hair}/>
        <circle cx="71" cy="38" r="6" fill={hair}/>
      </React.Fragment>
    );
    if (hairStyle === 'short') return (
      <React.Fragment>
        <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
      </React.Fragment>
    );
    if (hairStyle === 'bun') return (
      <React.Fragment>
        <ellipse cx="50" cy="36" rx="20" ry="14" fill={hair}/>
        <circle cx="50" cy="22" r="8" fill={hair}/>
      </React.Fragment>
    );
    if (hairStyle === 'long') return (
      <React.Fragment>
        <ellipse cx="50" cy="35" rx="22" ry="18" fill={hair}/>
        <path d="M28 42 Q22 58 24 78Z" fill={hair}/>
        <path d="M72 42 Q78 58 76 78Z" fill={hair}/>
      </React.Fragment>
    );
    return (
      <React.Fragment>
        <ellipse cx="50" cy="35" rx="22" ry="17" fill={hair}/>
        <path d="M28 42 Q24 53 26 64Z" fill={hair}/>
        <path d="M72 42 Q76 53 74 64Z" fill={hair}/>
      </React.Fragment>
    );
  };

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: `3px solid ${shirt}`, background: '#0a0a14',
      boxShadow: `0 0 0 2px rgba(0,0,0,0.5), 0 4px 24px ${shirt}66`,
      overflow: 'hidden', display: 'flex',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`bgGrad-${size}-${skinTone}-${shirtColor}-${hairStyle}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1a1a2e"/>
            <stop offset="100%" stopColor="#0a0a14"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill={`url(#bgGrad-${size}-${skinTone}-${shirtColor}-${hairStyle})`}/>
        {/* Shirt */}
        <path d="M15 100 Q18 78 50 75 Q82 78 85 100Z" fill={shirt} opacity="0.9"/>
        <path d="M22 100 Q25 82 50 79 Q75 82 78 100Z" fill={shirt} opacity="0.6"/>
        {/* Neck */}
        <rect x="43" y="68" width="14" height="11" rx="4" fill={skin}/>
        {/* Face */}
        <ellipse cx="50" cy="54" rx="20" ry="22" fill={skin}/>
        {renderHair()}
        {/* Cheeks */}
        <ellipse cx="30" cy="54" rx="4" ry="5" fill={shadow}/>
        <ellipse cx="70" cy="54" rx="4" ry="5" fill={shadow}/>
        {/* Eyes */}
        <ellipse cx="41" cy="52" rx="5" ry="4" fill="white"/>
        <ellipse cx="59" cy="52" rx="5" ry="4" fill="white"/>
        <circle cx="42" cy="52" r="3" fill="#1a1a2e"/>
        <circle cx="60" cy="52" r="3" fill="#1a1a2e"/>
        {/* Eyebrows */}
        <path d="M35 47 Q41 44 47 46" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M53 46 Q59 44 65 47" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Nose */}
        <path d="M50 56 Q47 62 44 63 Q50 65 56 63 Q53 62 50 56Z" fill={shadow} opacity="0.55"/>
        {/* Mustache (male) */}
        {hasMustache && gender === 'male' && (
          <path d="M38 64 Q44 61 50 63 Q56 61 62 64 Q57 67 50 65 Q43 67 38 64Z" fill={hair}/>
        )}
        {/* Mouth */}
        <path d="M43 70 Q50 71 57 70" stroke="#8b5e3c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Beard */}
        {hasBeard && (
          <path d="M32 64 Q40 80 50 82 Q60 80 68 64 Q60 72 50 73 Q40 72 32 64Z" fill={hair} opacity="0.85"/>
        )}
        {/* Glasses */}
        {hasGlasses && (
          <React.Fragment>
            <rect x="32" y="48" width="17" height="8" rx="2" fill="rgba(200,230,255,0.06)" stroke="#1a1a1a" strokeWidth="1.2"/>
            <rect x="51" y="48" width="17" height="8" rx="2" fill="rgba(200,230,255,0.06)" stroke="#1a1a1a" strokeWidth="1.2"/>
            <line x1="49" y1="52" x2="51" y2="52" stroke="#1a1a1a" strokeWidth="1"/>
          </React.Fragment>
        )}
      </svg>
    </div>
  );
}

window.MentorAvatar = MentorAvatar;
window.UserAvatar = UserAvatar;
