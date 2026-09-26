import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Minimize2,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  RotateCw,
  RotateCcw,
  Clock,
  Compass,
  FileText,
  Mail,
  Send,
  Eye,
  Sliders,
  Tv
} from 'lucide-react';
import FrostedHexagon from './FrostedHexagon';
import { getIPTheme, getCategoryFallbackImage } from './CardsView';

/**
 * DeckView3D
 * 
 * High-performance 3D Spatial Deck & Presentation Showcase.
 * Features:
 * - Spatial 3D Coverflow Stage (Center spotlight with left/right receding wings)
 * - Isometric Fan Deck mode with live angle tilt control
 * - Full Screen Presentation Mode (Cinematic full-viewport immersive experience)
 * - Auto Play with Live Progress Countdown & Hover-to-Pause
 * - Quick Pitch Copy & Direct Dossier Modal Triggers
 * - Touch / Swipe Gesture support for tablet and mobile
 * - Responsive 3D geometry preventing off-screen clipping
 */
export default function DeckView3D({ 
  ips = [], 
  onOpenDossier, 
  onOpenPitch, 
  onUpdateStatus, 
  onShowToast,
  onResetFilters
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [deckMode, setDeckMode] = useState('spatial'); // 'spatial' | 'isometric'
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(4000); // 2500, 4000, 6000
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(-18); // Base rotateY angle for isometric mode
  
  const timerRef = useRef(null);
  const filmstripRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartXRef = useRef(null);

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

  // Autoplay progression with live countdown progress
  useEffect(() => {
    if (!isAutoplay || ips.length <= 1) {
      setAutoplayProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (isHovered) {
      // Pause countdown while user inspects or interacts with the card
      return;
    }

    const stepMs = 50;
    const progressPerStep = (stepMs / autoplaySpeed) * 100;

    timerRef.current = setInterval(() => {
      setAutoplayProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((current) => (current + 1) % ips.length);
          return 0;
        }
        return prev + progressPerStep;
      });
    }, stepMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoplay, autoplaySpeed, isHovered, ips.length]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setAutoplayProgress(0);
    setActiveIndex((prev) => (prev + 1) % ips.length);
  }, [ips.length]);

  const handlePrev = useCallback(() => {
    setAutoplayProgress(0);
    setActiveIndex((prev) => (prev - 1 + ips.length) % ips.length);
  }, [ips.length]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Sync fullscreen change from browser (e.g. user pressed Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsAutoplay((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'Enter') {
        if (ips[activeIndex]) onOpenDossier(ips[activeIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ips, activeIndex, isFullscreen, handleNext, handlePrev, onOpenDossier]);

  // Touch Swipe handlers for mobile / tablet
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handlePrev();
      else handleNext();
    }
    touchStartXRef.current = null;
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
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 700 }}>No entertainment properties found</p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.84rem', marginTop: '0.4rem', maxWidth: 460 }}>
          No properties matched your current search and filters. Try adjusting your query or resetting all filters.
        </p>
        {onResetFilters && (
          <button 
            className="apple-btn apple-btn-primary" 
            style={{ marginTop: '1.25rem', padding: '0.55rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            onClick={onResetFilters}
            type="button"
          >
            <RotateCcw size={13} />
            <span>Reset All Filters & Search</span>
          </button>
        )}
      </div>
    );
  }

  // Active IP object
  const activeIP = ips[activeIndex] || ips[0];
  const activeTheme = getIPTheme(activeIP);

  // Compute 3D Card Items depending on Mode
  let cardIndices = [];
  if (deckMode === 'spatial') {
    // Spatial 3D Coverflow Stage: Centered with left and right wings
    const visibleRange = Math.min(ips.length, 5); // 5 visible cards: -2, -1, 0, 1, 2
    const halfRange = Math.floor(visibleRange / 2);
    for (let offset = -halfRange; offset <= halfRange; offset++) {
      const rawIdx = (activeIndex + offset) % ips.length;
      const idx = rawIdx < 0 ? rawIdx + ips.length : rawIdx;
      cardIndices.push({
        index: idx,
        offset: offset,
        ip: ips[idx]
      });
    }
  } else {
    // Isometric Fan Deck Mode: Layered depth stack
    const visibleCardsCount = Math.min(ips.length, 6);
    for (let i = 0; i < visibleCardsCount; i++) {
      const idx = (activeIndex + i) % ips.length;
      cardIndices.push({
        index: idx,
        depthOffset: i,
        ip: ips[idx]
      });
    }
    cardIndices.reverse(); // Front card renders on top
  }

  return (
    <div 
      ref={containerRef}
      className={`deck-3d-container ${isFullscreen ? 'deck-fullscreen-mode' : ''}`}
    >
      
      {/* =========================================================
          3D CONTROLS HEADER BAR
         ========================================================= */}
      <div className="deck-3d-header">
        
        {/* Left: Property Info & Counter Badge */}
        <div className="deck-info-badge">
          <Layers size={15} style={{ color: activeTheme.glowColor }} />
          <span className="deck-brand-label">3D Spatial Deck</span>
          <span className="deck-counter-pill">{activeIndex + 1} of {ips.length}</span>
          
          {/* Active IP Quick Chip */}
          <span className="deck-active-ip-chip" style={{ borderColor: activeTheme.glowColor }}>
            {activeIP.title}
          </span>
        </div>

        {/* Center: Presentation Mode Selector */}
        <div className="deck-mode-segmented-ctrl">
          <button 
            type="button"
            className={`deck-mode-pill ${deckMode === 'spatial' ? 'active' : ''}`}
            onClick={() => setDeckMode('spatial')}
            title="Symmetrical 3D Coverflow Stage"
          >
            <span>Spatial Stage</span>
          </button>
          <button 
            type="button"
            className={`deck-mode-pill ${deckMode === 'isometric' ? 'active' : ''}`}
            onClick={() => setDeckMode('isometric')}
            title="Isometric Layered Fan Deck"
          >
            <span>Isometric Fan</span>
          </button>
        </div>

        {/* Right: Autoplay, Tilt, Fullscreen & Arrows */}
        <div className="deck-action-controls">
          
          {/* Autoplay Toggle Button with Live Progress Fill */}
          <div className="deck-autoplay-widget">
            <button 
              type="button"
              className={`deck-ctrl-btn deck-autoplay-btn ${isAutoplay ? 'active' : ''}`}
              onClick={() => setIsAutoplay(!isAutoplay)}
              title={isAutoplay ? "Pause auto-presentation (Space)" : "Start auto-presentation (Space)"}
            >
              {isAutoplay ? (
                <Pause size={13} style={{ color: '#fbbf24' }} />
              ) : (
                <Play size={13} />
              )}
              <span>{isAutoplay ? (isHovered ? 'Paused (Hover)' : 'Autoplay') : 'Autoplay'}</span>
              
              {/* Live Progress Countdown Fill */}
              {isAutoplay && !isHovered && (
                <span 
                  className="deck-autoplay-progress-bar"
                  style={{ width: `${autoplayProgress}%` }}
                />
              )}
            </button>

            {/* Speed Selector */}
            {isAutoplay && (
              <select
                className="deck-speed-dropdown"
                value={autoplaySpeed}
                onChange={(e) => setAutoplaySpeed(Number(e.target.value))}
                title="Autoplay transition speed"
              >
                <option value={2500}>2.5s</option>
                <option value={4000}>4.0s</option>
                <option value={6000}>6.0s</option>
              </select>
            )}
          </div>

          {/* Perspective Tilt Slider (Available in Isometric Mode) */}
          {deckMode === 'isometric' && (
            <div className="deck-tilt-slider" title="Adjust 3D perspective angle">
              <RotateCw size={12} style={{ color: 'var(--text-tertiary)' }} />
              <input 
                type="range" 
                min="-35" 
                max="25" 
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                aria-label="3D Rotate Angle"
              />
              <span className="deck-tilt-deg">{rotationAngle}°</span>
            </div>
          )}

          {/* Full Screen Mode Toggle */}
          <button 
            type="button"
            className={`deck-ctrl-btn deck-fullscreen-btn ${isFullscreen ? 'active' : ''}`}
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Launch Full Screen Presentation (F)"}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isFullscreen ? 'Exit Full' : 'Full Screen'}</span>
          </button>

          {/* Navigation Arrows */}
          <div className="deck-nav-arrows">
            <button 
              type="button"
              className="deck-ctrl-btn arrow-btn"
              onClick={handlePrev}
              title="Previous card (Left Arrow)"
              aria-label="Previous card"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              type="button"
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

      {/* =========================================================
          3D STAGE VIEWPORT
         ========================================================= */}
      <div 
        className={`deck-3d-stage ${deckMode}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Atmospheric 3D Floor Grid Glow */}
        <div 
          className="deck-stage-ambient-glow" 
          style={{ '--active-glow': activeTheme.glowColor }}
        />

        {/* 3D Perspective Stage Wrapper */}
        <div 
          className={`deck-3d-perspective-wrapper ${deckMode}`}
          style={{
            transform: deckMode === 'isometric'
              ? `perspective(1400px) rotateY(${rotationAngle}deg) rotateX(10deg)`
              : `perspective(1200px) rotateY(0deg)`
          }}
        >
          {cardIndices.map((item) => {
            const isFront = deckMode === 'spatial' ? item.offset === 0 : item.depthOffset === 0;
            const theme = getIPTheme(item.ip);
            const Icon = theme.icon;
            const isCopied = copiedId === item.ip.id;

            // Geometry calculations based on Deck Mode
            let cardTransform = '';
            let opacity = 1;
            let zIndex = 1;
            let filter = 'none';

            if (deckMode === 'spatial') {
              const offset = item.offset;
              const absOffset = Math.abs(offset);
              
              if (offset === 0) {
                // Active Card: Center & Forward
                cardTransform = `translate3d(0px, 0px, 80px) rotateY(0deg) scale(1)`;
                zIndex = 20;
                opacity = 1;
                filter = 'brightness(1)';
              } else if (offset < 0) {
                // Left Wing Cards
                const tx = offset * 210 - 45;
                const tz = absOffset * -110;
                cardTransform = `translate3d(${tx}px, 0px, ${tz}px) rotateY(32deg) scale(${1 - absOffset * 0.08})`;
                zIndex = 20 - absOffset;
                opacity = Math.max(0.35, 1 - absOffset * 0.22);
                filter = `brightness(${Math.max(0.5, 1 - absOffset * 0.18)})`;
              } else {
                // Right Wing Cards
                const tx = offset * 210 + 45;
                const tz = absOffset * -110;
                cardTransform = `translate3d(${tx}px, 0px, ${tz}px) rotateY(-32deg) scale(${1 - absOffset * 0.08})`;
                zIndex = 20 - absOffset;
                opacity = Math.max(0.35, 1 - absOffset * 0.22);
                filter = `brightness(${Math.max(0.5, 1 - absOffset * 0.18)})`;
              }
            } else {
              // Isometric Mode: Layered depth fan
              const depth = item.depthOffset;
              const translateX = (depth - 2) * -75;
              const translateZ = depth * -125;
              const translateY = depth * 6;
              cardTransform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px)`;
              zIndex = 10 - depth;
              opacity = Math.max(0.28, 1 - depth * 0.14);
              filter = `brightness(${Math.max(0.45, 1 - depth * 0.12)})`;
            }

            return (
              <div
                key={`${item.ip.id || item.index}-${deckMode}`}
                className={`deck-fanned-card ${isFront ? 'is-front' : 'is-stacked'}`}
                style={{
                  transform: cardTransform,
                  opacity: opacity,
                  filter: filter,
                  zIndex: zIndex,
                  '--card-glow-color': theme.glowColor
                }}
                onMouseEnter={() => {
                  if (isFront) setIsHovered(true);
                }}
                onMouseLeave={() => {
                  if (isFront) setIsHovered(false);
                }}
                onClick={() => {
                  if (!isFront) {
                    setActiveIndex(item.index);
                    setAutoplayProgress(0);
                  } else {
                    onOpenDossier(item.ip);
                  }
                }}
              >
                {/* Ambient Under-Card Bloom */}
                {isFront && <div className="inspiration-card-bottom-bloom" />}

                {/* 1. UPPER HERO VIEWPORT */}
                <div className="deck-card-hero">
                  
                  {/* Event / Brand Photography Backdrop */}
                  <div className="inspiration-hero-img-wrap">
                    <img 
                      src={item.ip.image || getCategoryFallbackImage(item.ip.category)} 
                      alt={item.ip.title} 
                      className="inspiration-hero-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getCategoryFallbackImage(item.ip.category);
                      }}
                    />
                    <div className="inspiration-hero-overlay" />
                  </div>

                  {/* Top Badges */}
                  <div className="deck-card-top-bar">
                    <span className="deck-id-tag">{item.ip.id}</span>
                    <span className="deck-scale-tag">{(item.ip.category || 'Entertainment').split('/')[0].trim()}</span>
                  </div>

                  {/* 3D Frosted Hexagon Emblem */}
                  <div className="deck-hex-container">
                    <FrostedHexagon 
                      icon={Icon} 
                      glowColor={theme.glowColor} 
                      iconColor={theme.iconColor} 
                      size={isFront ? 74 : 58} 
                    />
                  </div>

                  {/* 3D Illuminated Platform & Floor Grid */}
                  <div className="deck-neon-platform">
                    <div className="deck-platform-grid" />
                    <div className="deck-platform-core" style={{ background: theme.glowColor }} />
                  </div>

                  {/* Diagonal Light Streak across Hero */}
                  <div className="deck-specular-beam" />
                </div>

                {/* 2. LOWER CONTENT ZONE */}
                <div className="deck-card-body">
                  
                  <div className="deck-meta-headline">
                    <span className="deck-category-dot" style={{ background: theme.glowColor }} />
                    <span className="deck-category-text">{item.ip.category}</span>
                    {isFront && (
                      <button 
                        type="button"
                        className="deck-corner-arrow" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDossier(item.ip);
                        }}
                        title="Open full dossier specs"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    )}
                  </div>

                  <h3 className="deck-card-title">{item.ip.title}</h3>

                  {isFront ? (
                    <>
                      {/* Doha Target Fit */}
                      <div className="deck-venue-badge">
                        <MapPin size={12} style={{ color: '#fca5a5' }} />
                        <span>{typeof item.ip.venue_fit === 'string' ? item.ip.venue_fit : (Array.isArray(item.ip.venue_fit) ? item.ip.venue_fit.join(', ') : (item.ip.venue_fit || 'DECC / QNCC'))}</span>
                      </div>

                      {/* Tour Benchmark */}
                      <p className="deck-benchmark-snippet">
                        <strong>Benchmark:</strong> {item.ip.past_shows || 'Global touring production across North America, Europe and Middle East.'}
                      </p>

                      {/* Action Bar */}
                      <div className="deck-card-actions" onClick={(e) => e.stopPropagation()}>
                        
                        <button 
                          type="button"
                          className="apple-pill-btn-white"
                          onClick={() => onOpenPitch(item.ip)}
                          title="Generate & preview pitch email"
                        >
                          <Mail size={13} />
                          <span>Pitch Email</span>
                          <ArrowUpRight size={13} />
                        </button>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            type="button"
                            className="apple-arrow-btn"
                            onClick={(e) => handleQuickCopy(e, item.ip)}
                            title="Copy pitch email"
                          >
                            {isCopied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                          </button>

                          <button 
                            type="button"
                            className="apple-arrow-btn"
                            onClick={() => onOpenDossier(item.ip)}
                            title="Open dossier modal"
                          >
                            <ExternalLink size={13} />
                          </button>
                        </div>

                      </div>
                    </>
                  ) : (
                    <div className="deck-mini-venue">
                      <span>{typeof item.ip.venue_fit === 'string' ? item.ip.venue_fit.split(';')[0] : 'Qatar Ready'}</span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* =========================================================
          FULLSCREEN FLOATING ACTION CONSOLE (WHEN IN FULLSCREEN)
         ========================================================= */}
      {isFullscreen && (
        <div className="deck-fullscreen-hud-bottom">
          <button 
            type="button"
            className="deck-hud-btn"
            onClick={handlePrev}
            title="Previous (Left Arrow)"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <button 
            type="button"
            className={`deck-hud-btn play-btn ${isAutoplay ? 'active' : ''}`}
            onClick={() => setIsAutoplay(!isAutoplay)}
            title="Toggle Autoplay (Space)"
          >
            {isAutoplay ? <Pause size={15} /> : <Play size={15} />}
            <span>{isAutoplay ? 'Pause' : 'Play'}</span>
          </button>

          <button 
            type="button"
            className="deck-hud-btn"
            onClick={handleNext}
            title="Next (Right Arrow)"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>

          <div className="deck-hud-divider" />

          <button 
            type="button"
            className="deck-hud-btn action"
            onClick={() => onOpenDossier(activeIP)}
            title="Open Complete Dossier Specs"
          >
            <FileText size={14} />
            <span>Full Dossier</span>
          </button>

          <button 
            type="button"
            className="deck-hud-btn action"
            onClick={() => onOpenPitch(activeIP)}
            title="Launch Pitch Studio"
          >
            <Send size={14} />
            <span>Pitch Email</span>
          </button>

          <button 
            type="button"
            className="deck-hud-btn exit"
            onClick={toggleFullscreen}
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 size={14} />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* =========================================================
          QUICK FILMSTRIP THUMBNAILS CAROUSEL (3D DOCK)
         ========================================================= */}
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
              type="button"
              key={ip.id}
              className={`deck-thumb-capsule ${isCurrent ? 'active' : ''}`}
              style={{ '--thumb-glow': theme.glowColor }}
              onClick={() => {
                setActiveIndex(i);
                setAutoplayProgress(0);
              }}
              title={`${ip.title} (${typeof ip.venue_fit === 'string' ? ip.venue_fit : 'Qatar'})`}
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
