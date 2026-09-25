import React, { useState } from 'react';
import { 
  Copy, Check, ArrowUpRight, ExternalLink, MapPin, 
  Sparkles, Compass, Gamepad2, Flame, Trophy, Palette, 
  Music, Theater, Globe, Play, Share2, Layers, Trash2, Lock
} from 'lucide-react';
import FrostedHexagon from './FrostedHexagon';

export default function CardsView({ 
  ips, 
  onOpenDossier, 
  onOpenPitch, 
  onUpdateStatus, 
  onShowToast,
  currentUser,
  onDeleteIP
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [activeVenueIP, setActiveVenueIP] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  const handleQuickCopy = (e, ip) => {
    e.stopPropagation();
    const pitchText = ip.email_template || `Subject: Host Partnership Inquiry: ${ip.title} in Doha, Qatar\n\nDear ${ip.producer || ip.licensor} Team,\n\nWe are exploring bringing ${ip.title} to Doha, Qatar.\n\nBest regards,`;
    navigator.clipboard.writeText(pitchText);
    setCopiedId(ip.id);
    onShowToast(`Pitch email copied for ${ip.title}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteClick = (e, ip) => {
    e.stopPropagation();
    if (isAdmin) {
      if (confirm(`Are you sure you want to permanently delete "${ip.title}" (${ip.id}) from the IP HUB portfolio?`)) {
        onDeleteIP(ip.id);
      }
    } else {
      onShowToast('🔒 Action Restricted: Normal users cannot delete cards. Administrator access required.');
    }
  };

  if (ips.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 700 }}>No entertainment properties found</p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.84rem', marginTop: '0.4rem' }}>Try resetting your category chips, venue filters, or search terms.</p>
      </div>
    );
  }

  return (
    <div className="cards-grid">
      {ips.map((ip) => {
        const theme = getIPTheme(ip);
        const isCopied = copiedId === ip.id;
        const IconComponent = theme.icon;
        const isVenueOpen = activeVenueIP === ip.id;

        return (
          <div 
            key={ip.id} 
            className="inspiration-card"
            style={{ 
              '--card-glow-color': theme.glowColor,
              '--card-border-highlight': theme.borderHighlight
            }}
            onClick={() => onOpenDossier(ip)}
          >
            {/* Ambient Bottom Bloom (Directly from Image 2) */}
            <div className="inspiration-card-bottom-bloom"></div>

            {/* 1. UPPER HERO VIEWPORT (Actual Event Imagery + 3D Frosted Hexagon + Specular Light Streak + Neon Floor Grid) */}
            <div className="inspiration-viewport">
              
              {/* Actual Event / Activity Photography Backdrop with verified fallback */}
              <div className="inspiration-hero-img-wrap">
                <img 
                  src={ip.image || getCategoryFallbackImage(ip.category)} 
                  alt={ip.title} 
                  className="inspiration-hero-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getCategoryFallbackImage(ip.category);
                  }}
                />
                <div className="inspiration-hero-overlay"></div>
              </div>

              {/* Viewport Top Header Badges */}
              <div className="inspiration-viewport-badges">
                <span className="viewport-id-badge">{ip.id}</span>
                
                {/* Interactive Status Selector */}
                <select
                  className="card-status-dropdown"
                  value={ip.status || 'Not Contacted'}
                  onChange={(e) => onUpdateStatus(ip, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Not Contacted">1. Not Contacted</option>
                  <option value="Outreach Sent">2. Outreach Sent</option>
                  <option value="In Discussion">3. In Discussion</option>
                  <option value="Terms Received">4. Terms Received</option>
                  <option value="Confirmed">5. Host Confirmed</option>
                </select>
              </div>

              {/* Floating 3D Frosted Hexagon Emblem (Image 2) */}
              <div className="inspiration-emblem-anchor">
                <FrostedHexagon 
                  icon={IconComponent} 
                  glowColor={theme.glowColor} 
                  iconColor={theme.iconColor} 
                  size={50} 
                />
              </div>

              {/* Neon Floor Grid / Platform Light (Image 1) */}
              <div className="inspiration-platform-glow">
                <div className="inspiration-platform-grid"></div>
              </div>

              {/* Diagonal Light Streak across Hero (Image 2) */}
              <div className="inspiration-specular-ray"></div>
            </div>

            {/* 2. LOWER CONTENT ZONE */}
            <div className="inspiration-content-body">
              
              {/* Category & Status Indicator */}
              <div className="inspiration-category-tag">
                <span className="inspiration-glow-dot" style={{ background: theme.glowColor }}></span>
                <span>{ip.category}</span>
              </div>

              {/* Bold High-Impact Card Title */}
              <h2 className="inspiration-card-title">{ip.title}</h2>

              {/* Rich Brand Details & Scale */}
              <p className="inspiration-card-description" title={ip.brand_details || ip.notes}>
                {ip.brand_details || ip.notes || 'Global family entertainment touring IP with proven international appeal.'}
              </p>

              {/* 1-CLICK DIRECT LINK + SUGGESTED VENUE TOGGLE ROW */}
              <div className="card-access-venue-row" onClick={(e) => e.stopPropagation()}>
                
                {/* 1-Click Access to Official Website or LinkedIn URL */}
                <a 
                  href={ip.website || ip.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-quick-link-btn"
                  title={`1-Click access: ${ip.website || ip.linkedin_url}`}
                >
                  <Globe size={11} style={{ color: 'var(--accent-cyan)' }} />
                  <span>{formatDomain(ip.website || ip.linkedin_url)}</span>
                  <ArrowUpRight size={10} />
                </a>

                {/* Location / Venue Icon Button to see Suggested Doha Venue */}
                <button 
                  className={`card-venue-toggle-btn ${isVenueOpen ? 'active' : ''}`}
                  onClick={() => setActiveVenueIP(isVenueOpen ? null : ip.id)}
                  title={`Click to view suggested Doha venue: ${ip.venue_fit}`}
                  aria-label="View suggested venue"
                >
                  <MapPin size={11} style={{ color: '#fca5a5' }} />
                  <span>Venue</span>
                </button>
              </div>

              {/* Interactive Venue Reveal Box when Venue Pin is clicked */}
              {isVenueOpen && (
                <div className="card-venue-reveal-box" onClick={(e) => e.stopPropagation()}>
                  <div className="card-venue-reveal-header">
                    <MapPin size={11} style={{ color: '#f43f5e' }} />
                    <span>Suggested Doha Staging Venue</span>
                  </div>
                  <div className="card-venue-reveal-text">
                    {ip.venue_fit}
                  </div>
                </div>
              )}

              {/* Direct Past Show / Tour Footage Link */}
              {ip.past_show_url && (
                <div className="card-past-show-row" onClick={(e) => e.stopPropagation()}>
                  <a 
                    href={ip.past_show_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-past-show-btn"
                    title={`Watch past tour footage / live production clips for ${ip.title}`}
                  >
                    <Play size={10} style={{ color: 'var(--accent-gold)' }} fill="var(--accent-gold)" />
                    <span>Live Past Show Footage</span>
                    <ArrowUpRight size={10} />
                  </a>
                </div>
              )}

              {/* Meta details: Licensor & Tour Producer */}
              <div className="inspiration-meta-group">
                <div className="inspiration-meta-row">
                  <span>Licensor</span>
                  <strong title={ip.licensor}>{ip.licensor}</strong>
                </div>
                <div className="inspiration-meta-row">
                  <span>Tour Producer</span>
                  <strong title={ip.producer}>{ip.producer.split('/')[0]}</strong>
                </div>
              </div>

              {/* Action Bar (White Pill Button from Image 2 + Arrow + Copy) */}
              <div className="inspiration-card-actions" onClick={(e) => e.stopPropagation()}>
                
                {/* Image 2 Apple-style Solid White Pill Button */}
                <button 
                  className="apple-pill-btn-white"
                  onClick={() => onOpenPitch(ip)}
                  title="Generate & preview host partnership pitch email"
                >
                  <span>Pitch Email</span>
                  <ArrowUpRight size={14} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {/* Quick Copy Button */}
                  <button 
                    className="apple-arrow-btn"
                    onClick={(e) => handleQuickCopy(e, ip)}
                    title="1-Click copy pitch email to clipboard"
                    aria-label="Copy pitch email"
                  >
                    {isCopied ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={15} />}
                  </button>

                  {/* Dossier Button */}
                  <button 
                    className="apple-arrow-btn"
                    onClick={() => onOpenDossier(ip)}
                    title="View full IP dossier specs & strategy notes"
                    aria-label="View dossier"
                  >
                    <ExternalLink size={15} />
                  </button>

                  {/* RBAC Delete Property Button (Admin can delete; Normal User is restricted) */}
                  <button 
                    className="apple-arrow-btn"
                    onClick={(e) => handleDeleteClick(e, ip)}
                    title={isAdmin ? `Delete "${ip.title}" (Admin Exclusive)` : `Deletion Restricted: Normal users cannot delete properties (Admin only)`}
                    aria-label={isAdmin ? 'Delete property' : 'Delete property (Restricted)'}
                    style={{
                      borderColor: isAdmin ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.1)',
                      background: isAdmin ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                      color: isAdmin ? '#f87171' : 'var(--text-tertiary)'
                    }}
                  >
                    {isAdmin ? <Trash2 size={14} /> : <Lock size={13} />}
                  </button>
                </div>

              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}

// Clean Domain Formatter
export function formatDomain(url = '') {
  if (!url) return 'Visit Portal';
  try {
    const clean = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');
    return clean.length > 20 ? clean.slice(0, 18) + '...' : clean;
  } catch (e) {
    return 'Official Link';
  }
}

// Category-based rock-solid image fallbacks
export function getCategoryFallbackImage(category = '') {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ice')) {
    return 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('stunt') || cat.includes('motorsport') || cat.includes('arena')) {
    return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('exhibition') || cat.includes('museum') || cat.includes('jurassic')) {
    return 'https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('symphony') || cat.includes('concert') || cat.includes('music')) {
    return 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('theat') || cat.includes('puppet') || cat.includes('stage') || cat.includes('musical')) {
    return 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
}

// Helper to assign a jewel tone & theme icon inspired by the IP's character
export function getIPTheme(ip) {
  const t = (((ip?.title || '') + ' ' + (ip?.category || ''))).toLowerCase();

  // Dinosaur / Paleontology
  if (t.includes('jurassic') || t.includes('dino') || t.includes('gigantosaurus')) {
    return {
      glowColor: '#10b981',
      borderHighlight: 'rgba(16, 185, 129, 0.55)',
      iconColor: '#34d399',
      icon: Compass
    };
  }

  // Magic & Fantasy
  if (t.includes('harry potter') || t.includes('geronimo') || t.includes('wonderland') || t.includes('magic')) {
    return {
      glowColor: '#a855f7',
      borderHighlight: 'rgba(168, 85, 247, 0.55)',
      iconColor: '#c084fc',
      icon: Sparkles
    };
  }

  // Gaming / Animatronics / Tech
  if (t.includes('minecraft') || t.includes('sonic') || t.includes('pokemon') || t.includes('transformers') || t.includes('angry birds')) {
    return {
      glowColor: '#06b6d4',
      borderHighlight: 'rgba(6, 182, 212, 0.55)',
      iconColor: '#38bdf8',
      icon: Gamepad2
    };
  }

  // Motorsport / Stunts
  if (t.includes('monster truck') || t.includes('monster jam') || t.includes('hot wheels') || t.includes('motorsport') || t.includes('formula 1') || t.includes('f1')) {
    return {
      glowColor: '#f97316',
      borderHighlight: 'rgba(249, 115, 22, 0.55)',
      iconColor: '#fb923c',
      icon: Flame
    };
  }

  // Ice / Cirque / High-Flying
  if (t.includes('ice') || t.includes('cirque') || t.includes('acrobatic') || t.includes('ladybug')) {
    return {
      glowColor: '#38bdf8',
      borderHighlight: 'rgba(56, 189, 248, 0.55)',
      iconColor: '#7dd3fc',
      icon: Trophy
    };
  }

  // Art, LEGO & Creative Build
  if (t.includes('brick') || t.includes('lego') || t.includes('crayola') || t.includes('play-doh') || t.includes('barbie') || t.includes('gogh')) {
    return {
      glowColor: '#ec4899',
      borderHighlight: 'rgba(236, 72, 153, 0.55)',
      iconColor: '#f472b6',
      icon: Palette
    };
  }

  // Symphony & Orchestra
  if (t.includes('symphony') || t.includes('concert') || t.includes('paddington') || t.includes('hans zimmer') || t.includes('candlelight')) {
    return {
      glowColor: '#6366f1',
      borderHighlight: 'rgba(99, 102, 241, 0.55)',
      iconColor: '#818cf8',
      icon: Music
    };
  }

  // Stage Musical & Preschool Favorites
  return {
    glowColor: '#f59e0b',
    borderHighlight: 'rgba(245, 158, 11, 0.55)',
    iconColor: '#fbbf24',
    icon: Theater
  };
}
