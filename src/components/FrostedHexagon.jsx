import React from 'react';

/**
 * FrostedHexagon
 * 
 * Recreates the 3D frosted glass hexagon emblem from the reference design.
 * Features:
 * - True regular hexagon with subtle rounded corners
 * - Dual-layer specular bevel rim (bright light highlight top-left to subtle rim bottom-right)
 * - Translucent frosted glass fill with backdrop blur
 * - Centered glowing icon with custom jewel-tone drop shadow
 */
export default function FrostedHexagon({ 
  icon: IconComponent, 
  glowColor = '#8b5cf6', 
  iconColor = '#c084fc', 
  size = 72 
}) {
  const iconSize = Math.round(size * 0.44);
  const rawId = React.useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const strokeId = `hexStroke-${uid}`;
  const fillId = `hexFill-${uid}`;
  const innerBevelId = `innerBevel-${uid}`;
  const glowFilterId = `hexGlow-${uid}`;

  return (
    <div 
      className="frosted-hex-wrapper"
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        filter: `drop-shadow(0 12px 24px rgba(0, 0, 0, 0.65))`
      }}
    >
      {/* SVG Frosted Hexagon with Specular Bevel */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 76 76" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <defs>
          {/* Specular Rim Gradient (Top-Left Light Source) */}
          <linearGradient id={strokeId} x1="12" y1="8" x2="64" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.5" />
          </linearGradient>

          {/* Frosted Glass Body Gradient */}
          <linearGradient id={fillId} x1="18" y1="10" x2="58" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.07)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.45)" />
          </linearGradient>

          {/* Inner Bevel Specular Arc */}
          <linearGradient id={innerBevelId} x1="20" y1="12" x2="56" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Soft Glow Filter */}
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Halo Behind Hexagon */}
        <circle 
          cx="38" 
          cy="38" 
          r="26" 
          fill={glowColor} 
          opacity="0.22" 
          style={{ filter: 'blur(10px)' }}
        />

        {/* Base Hexagon Shape with Rounded Corners */}
        {/* Path: Pointy top (38, 7), sides (66, 26)-(66, 50), pointy bottom (38, 69), sides (10, 50)-(10, 26) */}
        <path
          d="M 38 7 
             Q 41 8, 63 20.5 
             Q 66 22, 66 26 
             L 66 50 
             Q 66 54, 63 55.5 
             L 41 68 
             Q 38 69.5, 35 68 
             L 13 55.5 
             Q 10 54, 10 50 
             L 10 26 
             Q 10 22, 13 20.5 
             L 35 8 
             Q 38 7, 38 7 Z"
          fill={`url(#${fillId})`}
          stroke={`url(#${strokeId})`}
          strokeWidth="1.5"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        />

        {/* Inner Glass Bevel Highlight Line */}
        <path
          d="M 38 12 
             Q 40 13, 59 23.5 
             Q 61 25, 61 28 
             L 61 48"
          stroke={`url(#${innerBevelId})`}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>

      {/* Floating Center Icon */}
      <div 
        className="frosted-hex-icon"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          placeItems: 'center',
          color: iconColor,
          filter: `drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 2px 4px rgba(0,0,0,0.8))`
        }}
      >
        {IconComponent && <IconComponent size={iconSize} strokeWidth={2.1} />}
      </div>
    </div>
  );
}
