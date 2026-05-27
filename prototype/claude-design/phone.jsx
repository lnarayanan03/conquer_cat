// phone.jsx — iPhone 15 Pro Max bezel + status bar + home indicator
const { useState: _useState } = React;

function StatusBar({ light = false }) {
  return (
    <div className="status-bar" style={{ color: light ? '#000' : '#fff' }}>
      <span className="clock">9:41</span>
      <span className="right">
        {/* Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" />
          <rect x="10" y="2" width="3" height="10" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 11.5l1.5-1.5a2.1 2.1 0 00-3 0L8 11.5z" />
          <path d="M3.5 7l1.4 1.4a4.4 4.4 0 016.2 0L12.5 7a6.4 6.4 0 00-9 0z" />
          <path d="M0 3.5l1.4 1.4a9 9 0 0113.2 0L16 3.5A11 11 0 000 3.5z" />
        </svg>
        {/* Battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
          <rect x="23" y="3.5" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

function Phone({ scale = 0.9, landscape = false, isBroken = false, isFixed = false, showSafeZone = false, theme = 'dark', page = 'today', children }) {
  return (
    <div
      className={`phone ${landscape ? 'is-landscape' : ''}`}
      style={{ '--phone-scale': scale }}
    >
      <div className="phone-inner">
        <div className="phone-screen">
          <div className={`app theme-${theme} on-${page} ${isBroken ? 'is-broken' : ''} ${isFixed ? 'is-fixed' : ''} ${showSafeZone ? 'show-safe-zone' : ''}`}>
            <div className="app-bg-paint" />
            {!landscape && <StatusBar light={theme === 'light'} />}
            <div className="island" />
            {children}
            {/* Visual highlight for safe area (educational) */}
            <div className="home-zone" />
            {/* Bug annotation ribbon (only on broken) */}
            {isBroken && (
              <div className="bug-annotation is-bottom">
                ↓ {page === 'calendar' ? 'flat fill ≠ gradient · seam visible' : 'safe-area strip exposed'}
              </div>
            )}
            <div className="home-indicator" />
          </div>
        </div>
      </div>
    </div>
  );
}

window.Phone = Phone;
