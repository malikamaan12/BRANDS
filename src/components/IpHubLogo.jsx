import React from 'react';

export default function IpHubLogo({ size = 38, className = '' }) {
  return (
    <div 
      className={`ip-hub-logo-mark ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'grid',
        placeItems: 'center',
        position: 'relative'
      }}
      aria-label="IP HUB Logo"
    >
      <svg 
        viewBox="0 0 100 100" 
        width={size} 
        height={size}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(30, 41, 59, 0.85)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.95)" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield with Specular Border */}
        <polygon 
          points="50,6 88,28 88,72 50,94 12,72 12,28" 
          fill="url(#shieldBg)" 
          stroke="url(#logoGold)" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />
        
        {/* Subtle Inner Ring */}
        <polygon 
          points="50,14 82,32 82,68 50,86 18,68 18,32" 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.12)" 
          strokeWidth="1" 
          strokeLinejoin="round" 
        />

        {/* Monogram "I" */}
        <rect x="30" y="32" width="7" height="36" rx="3.5" fill="url(#logoGold)" filter="url(#logoGlow)" />
        <circle cx="33.5" cy="25" r="3.5" fill="url(#logoGold)" filter="url(#logoGlow)" />

        {/* Monogram "P" */}
        <path 
          d="M 45 32 L 58 32 C 67 32 72 37 72 44 C 72 51 67 56 58 56 L 52 56 L 52 68 C 52 70 50.5 71.5 48.5 71.5 C 46.5 71.5 45 70 45 68 Z" 
          fill="url(#logoGold)" 
          filter="url(#logoGlow)" 
        />
        {/* Inner Counter of P */}
        <path d="M 52 38 L 57 38 C 62 38 65 40 65 44 C 65 48 62 50 57 50 L 52 50 Z" fill="#090d1c" />

        {/* Qatar Crimson Accent Gem */}
        <circle cx="50" cy="86" r="2.5" fill="#e11d48" filter="url(#logoGlow)" />
      </svg>
    </div>
  );
}
