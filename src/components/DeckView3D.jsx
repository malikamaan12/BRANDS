import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpRight, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  RotateCw
} from 'lucide-react';
import FrostedHexagon from './FrostedHexagon';
import { getIPTheme } from './CardsView';

/**
 * DeckView3D
 * 
 * Recreates the exact 3D isometric fanned card deck from Image 1.
 * Features:
 * - Real 3D isometric perspective fan receding into deep space
 * - Spotlighted front card with illuminated floor platform & glowing emblem
 * - Interactive fan navigation (click any card to bring to front, arrows, autoplay)
 * - Live pitch email copy & dossier modal trigger
 * - Mobile responsive adaptive tilt
 */
export default function DeckView3D({ 
  ips, 
  onOpenDossier, 
  onOpenPitch, 
  onUpdateStatus, 
  onShowToast 
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(-20); // Base rotateY angle
  const timerRef = useRef(null);
  const filmstripRef = useRef(null);

  // Auto-scroll active capsule into view in the 3D dock
  useEffect(() => {
    if (filmstripRef.current && filmstripRef.current.children[activeIndex]) {
      filmstripRef.current.children[activeIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeIndex]);

  const handleTrayWheel = (e) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  // Keep active index in bounds if ips array filters change
  useEffect(() => {
    if (activeIndex >= ips.length) {
      setActiveIndex(0);
    }
  }, [ips.length]);

  // Autoplay loop
  useEffect(() => {
    if (isAutoplay && ips.length > 1) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % ips.length);
      }, 3200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoplay, ips.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveIndex((prev) => (prev + 1) % ips.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveIndex((prev) => (prev - 1 + ips.length) % ips.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ips.length]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % ips.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + ips.length) % ips.length);
  };

  const handleQuickCopy = (e, ip) => {
    e.stopPropagation();
    const pitchText = ip.email_template || `Subject: Host Partnership Inquiry: ${ip.title} in Doha, Qatar\n\nDear ${ip.producer || ip.licensor} Team,\n\nWe are exploring bringing ${ip.title} to Doha, Qatar.\n\nBest regards,`;
    navigator.clipboard.writeText(pitchText);
    setCopiedId(ip.id);
    onShowToast(`Pitch email copied for ${ip.title}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (ips.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 700 }}>No entertainment properties found</p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.84rem', marginTop: '0.4rem' }}>Try resetting your category chips, venue filters, or search terms.</p>
      </div>
    );
  }

  // Active IP object
  const activeIP = ips[activeIndex] || ips[0];
  const activeTheme = getIPTheme(activeIP);

  // We display up to 7 cards in the visible 3D fan stack
  const visibleCardsCount = Math.min(ips.length, 7);
  const cardIndices = [];
  for (let i = 0; i < visibleCardsCount; i++) {
    const idx = (activeIndex + i) % ips.length;
    cardIndices.push({ index: idx, depthOffset: i, ip: ips[idx] });
  }
  // Reverse so the front card (depthOffset 0) renders on top in DOM order
  cardIndices.reverse();

  return (
    <div className="deck-3d-container">
      
      {/* 3D Deck Controls & Status Header */}
      <div className="deck-3d-header">
        <div className="deck-info-badge">
          <Layers size={15} style={{ color: activeTheme.glowColor }} />
          <span>3D Spatial Deck Showcase</span>
          <span className="deck-counter-pill">{activeIndex + 1} of {ips.length}</span>
        </div>

        <div className="deck-action-controls">
          {/* Autoplay Toggle */}
          <button 
            className={`deck-ctrl-btn ${isAutoplay ? 'active' : ''}`}
            onClick={() => setIsAutoplay(!isAutoplay)}
            title={isAutoplay ? "Pause 3D carousel autoplay" : "Start 3D carousel autoplay"}
          >
            {isAutoplay ? <Pause size={14} /> : <Play size={14} />}
            <span>{isAutoplay ? "Playing" : "Autoplay"}</span>
          </button>

          {/* Perspective angle adjustment */}
          <div className="deck-tilt-slider" title="Adjust 3D perspective angle">
            <RotateCw size={13} style={{ color: 'var(--text-tertiary)' }} />
            <input 
              type="range" 
              min="-35" 
              max="-5" 
              value={rotationAngle}
              onChange={(e) => setRotationAngle(Number(e.target.value))}
              aria-label="3D Rotate Angle"
            />
          </div>

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              className="deck-ctrl-btn arrow-btn"
              onClick={handlePrev}
              title="Previous card (Left Arrow)"
              aria-label="Previous card"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="deck-ctrl-btn arrow-btn"
              onClick={handleNext}
              title="Next card (Right Arrow)"
              aria-label="Next card"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3D STAGE VIEWPORT (Image 1 Isometric Perspective Stage) */}
      <div className="deck-3d-stage">
        
        {/* Atmospheric 3D Cosmic Violet Floor Grid Glow */}
        <div 
          className="deck-stage-ambient-glow" 
          style={{ '--active-glow': activeTheme.glowColor }}
        ></div>

        <div 
          className="deck-3d-perspective-wrapper"
          style={{
            transform: `perspective(1400px) rotateY(${rotationAngle}deg) rotateX(10deg)`
          }}
        >
          {cardIndices.map(({ index, depthOffset, ip }) => {
            const isFront = depthOffset === 0;
            const theme = getIPTheme(ip);
            const Icon = theme.icon;
            const isCopied = copiedId === ip.id;

            // Compute 3D translation & stagger
            // As depth increases, cards step left (-X), back (-Z), and slightly up (+Y or -Y)
            const translateX = -depthOffset * 105; // Step to the left
            const translateZ = -depthOffset * 135; // Step into the screen
            const translateY = depthOffset * 6;   // Subtle stagger
            const opacity = Math.max(0.25, 1 - depthOffset * 0.13);
            const brightness = Math.max(0.4, 1 - depthOffset * 0.12);

            return (
              <div
                key={`${ip.id || index}-${depthOffset}`}
                className={`deck-fanned-card ${isFront ? 'is-front' : 'is-stacked'}`}
                style={{
                  transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px)`,
                  opacity: opacity,
                  filter: `brightness(${brightness})`,
                  zIndex: visibleCardsCount - depthOffset,
                  '--card-glow-color': theme.glowColor
                }}
                onClick={() => {
                  if (!isFront) {
                    setActiveIndex(index);
                  } else {
                    onOpenDossier(ip);
                  }
                }}
              >
                {/* Ambient Under-Card Bloom (Image 2) */}
                {isFront && <div className="inspiration-card-bottom-bloom"></div>}

                {/* 1. UPPER HERO VIEWPORT */}
                <div className="deck-card-hero">
                  
                  {/* Actual Event / Activity Photography Backdrop */}
                  {ip.image && (
                    <div className="inspiration-hero-img-wrap">
                      <img 
                        src={ip.image} 
                        alt={ip.title} 
                        className="inspiration-hero-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="inspiration-hero-overlay"></div>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="deck-card-top-bar">
                    <span className="deck-id-tag">{ip.id}</span>
                    <span className="deck-scale-tag">{(ip.category || 'Entertainment').split('/')[0].trim()}</span>
                  </div>

                  {/* 3D Frosted Hexagon Emblem (Image 2) */}
                  <div className="deck-hex-container">
                    <FrostedHexagon 
                      icon={Icon} 
                      glowColor={theme.glowColor} 
                      iconColor={theme.iconColor} 
                      size={isFront ? 76 : 60} 
                    />
                  </div>

                  {/* 3D Illuminated Platform & Floor Grid (Image 1) */}
                  <div className="deck-neon-platform">
                    <div className="deck-platform-grid"></div>
                    <div className="deck-platform-core" style={{ background: theme.glowColor }}></div>
                  </div>

                  {/* Diagonal Light Streak across Hero (Image 2) */}
                  <div className="deck-specular-beam"></div>
                </div>

                {/* 2. LOWER CONTENT ZONE */}
                <div className="deck-card-body">
                  
                  <div className="deck-meta-headline">
                    <span className="deck-category-dot" style={{ background: theme.glowColor }}></span>
                    <span className="deck-category-text">{ip.category}</span>
                    {isFront && (
                      <button 
                        className="deck-corner-arrow" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDossier(ip);
                        }}
                        title="Open full dossier specs"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    )}
                  </div>

                  <h3 className="deck-card-title">{ip.title}</h3>

                  {isFront && (
                    <>
                      {/* Doha Target Fit */}
                      <div className="deck-venue-badge">
                        <MapPin size={13} style={{ color: '#fca5a5' }} />
                        <span>{typeof ip.venue_fit === 'string' ? ip.venue_fit : (Array.isArray(ip.venue_fit) ? ip.venue_fit.join(', ') : (ip.venue_fit || ''))}</span>
                      </div>

                      {/* Tour Benchmark */}
                      <p className="deck-benchmark-snippet">
                        <strong>Benchmark:</strong> {ip.past_shows}
                      </p>

                      {/* Action Bar with White Pill Button (Image 2) */}
                      <div className="deck-card-actions" onClick={(e) => e.stopPropagation()}>
                        
                        <button 
                          className="apple-pill-btn-white"
                          onClick={() => onOpenPitch(ip)}
                          title="Generate & preview pitch email"
                        >
                          <span>Pitch Email</span>
                          <ArrowUpRight size={14} />
                        </button>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            className="apple-arrow-btn"
                            onClick={(e) => handleQuickCopy(e, ip)}
                            title="Copy pitch email"
                          >
                            {isCopied ? <Check size={15} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                          </button>

                          <button 
                            className="apple-arrow-btn"
                            onClick={() => onOpenDossier(ip)}
                            title="Open dossier modal"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>

                      </div>
                    </>
                  )}

                  {!isFront && (
                    <div className="deck-mini-venue">
                      <span>{typeof ip.venue_fit === 'string' ? ip.venue_fit.split(';')[0] : (Array.isArray(ip.venue_fit) ? ip.venue_fit[0] : (ip.venue_fit || ''))}</span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Quick Filmstrip Thumbnails Carousel at the bottom (3D Dock) */}
      <div 
        ref={filmstripRef}
        onWheel={handleTrayWheel}
        className="deck-filmstrip-tray"
        role="region"
        aria-label="3D Card Dock"
      >
        {ips.map((ip, i) => {
          const isCurrent = i === activeIndex;
          const theme = getIPTheme(ip);
          return (
            <button
              key={ip.id}
              className={`deck-thumb-capsule ${isCurrent ? 'active' : ''}`}
              style={{ '--thumb-glow': theme.glowColor }}
              onClick={() => setActiveIndex(i)}
              title={`${ip.title} (${ip.venue_fit})`}
            >
              <span className="thumb-id">{ip.id}</span>
              <span className="thumb-title">{ip.title}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
