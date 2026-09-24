import React from 'react';

export default function IpHubLogo({ 
  size = 40, 
  variant = 'icon', // 'icon' | 'full'
  className = '',
  style = {}
}) {
  if (variant === 'full') {
    return (
      <div 
        className={`e3-brand-logo-full ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: size,
          ...style
        }}
        aria-label="E3 Events & Entertainment Enterprises"
      >
        <img 
          src="/e3-logo-full-white.png" 
          alt="E3 Events & Entertainment Enterprises" 
          style={{
            height: '100%',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 2px 10px rgba(139, 92, 246, 0.3))'
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`e3-brand-logo-icon ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'inline-grid',
        placeItems: 'center',
        position: 'relative',
        ...style
      }}
      aria-label="E3 Logo"
    >
      <img 
        src="/e3-logo-icon.png" 
        alt="E3 Logo" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 2px 8px rgba(6, 182, 212, 0.35))'
        }}
      />
    </div>
  );
}
