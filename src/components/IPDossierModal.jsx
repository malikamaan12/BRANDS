import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Send, ExternalLink, Mail, Building, User, 
  MapPin, Sparkles, FileText, NotebookText, ArrowUpRight, 
  Globe, Award, Calendar, CheckCircle2, ChevronRight, Share2, Layers, Play,
  Trash2, Lock
} from 'lucide-react';
import FrostedHexagon from './FrostedHexagon';
import { getIPTheme, getCategoryFallbackImage } from './CardsView';

export default function IPDossierModal({ ip, onClose, onUpdateIP, onShowToast, currentUser, onDeleteIP }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pitch' | 'notes'
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [notes, setNotes] = useState(ip?.notes || '');
  const [status, setStatus] = useState(ip?.status || 'Not Contacted');

  const isAdmin = currentUser?.role === 'admin';

  const handleDeleteProperty = () => {
    if (isAdmin) {
      if (confirm(`Are you sure you want to permanently delete "${ip.title}" (${ip.id}) from the IP HUB portfolio?`)) {
        onDeleteIP(ip.id);
        onClose();
      }
    } else {
      onShowToast('🔒 Action Restricted: Normal users cannot delete cards. Administrator access required.');
    }
  };

  useEffect(() => {
    if (ip) {
      setNotes(ip.notes || '');
      setStatus(ip.status || 'Not Contacted');
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'pitch', 'notes'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('overview');
      }
    }
  }, [ip]);

  if (!ip) return null;

  const theme = getIPTheme(ip);
  const IconComponent = theme.icon;

  // Extract clean subject line from email template
  const matchSubject = ip.email_template?.match(/Subject:\s*(.*)/i);
  const subjectLine = matchSubject ? matchSubject[1] : `Host Partnership Inquiry: ${ip.title} in Doha, Qatar`;

  // Copy Pitch
  const handleCopyPitch = () => {
    navigator.clipboard.writeText(ip.email_template);
    setCopiedPitch(true);
    onShowToast('Pitch email copied to clipboard');
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  // Copy Subject
  const handleCopySubject = () => {
    navigator.clipboard.writeText(subjectLine);
    setCopiedSubject(true);
    onShowToast('Subject line copied');
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  // Copy Verified Email
  const handleCopyEmail = (emailStr) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedEmail(true);
    onShowToast('Verified email copied');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Launch Mail Client
  const handleLaunchMail = () => {
    const match = ip.email_template.match(/Subject:\s*(.*)\n\n([\s\S]*)/i);
    let subject = subjectLine;
    let body = ip.email_template;

    if (match) {
      subject = match[1];
      body = match[2];
    }

    const emails = ip.email.split(/[\/,|]/).map(s => s.trim()).filter(s => s.includes('@'));
    const recipient = emails[0] || '';

    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Handle Status change
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    const updated = { ...ip, status: newStatus, notes };
    onUpdateIP(updated);
    onShowToast(`Status updated to "${newStatus}"`);
  };

  // Handle Notes change
  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    const updated = { ...ip, notes: newNotes, status };
    onUpdateIP(updated);
  };

  // Add quick tag to notes
  const handleAddTagToNotes = (tag) => {
    const newNotes = notes ? `${notes}\n• ${tag}` : `• ${tag}`;
    setNotes(newNotes);
    onUpdateIP({ ...ip, notes: newNotes, status });
    onShowToast(`Added note: "${tag}"`);
  };

  const dealStages = [
    'Not Contacted',
    'Outreach Sent',
    'In Discussion',
    'Terms Received',
    'Confirmed'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-elevated modal-window" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossierModalTitle"
      >
        {/* iOS Drag Handle */}
        <div className="sheet-drag-handle"></div>

        {/* macOS Window Titlebar */}
        <div className="modal-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="traffic-lights" style={{ display: window.innerWidth > 768 ? 'flex' : 'none' }}>
              <div className="traffic-light traffic-close" onClick={onClose} style={{ cursor: 'pointer' }} title="Close"></div>
              <div className="traffic-light traffic-min"></div>
              <div className="traffic-light traffic-max"></div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="ip-id-chip">{ip.id}</span>
              <span style={{ fontSize: '0.78rem', color: theme.iconColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {ip.category}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>•</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {ip.licensor}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* RBAC Delete Property Button */}
            <button 
              className="apple-btn"
              onClick={handleDeleteProperty}
              title={isAdmin ? `Delete "${ip.title}" (Admin Exclusive)` : `Deletion restricted: Normal users cannot delete cards (Admin only)`}
              style={{
                background: isAdmin ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                border: isAdmin ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isAdmin ? '#f87171' : 'var(--text-tertiary)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.74rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              {isAdmin ? <Trash2 size={13} /> : <Lock size={12} />}
              <span>{isAdmin ? 'Delete IP' : 'Delete (Admin Only)'}</span>
            </button>

            <span className="qatar-location-pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem' }}>
              Doha Host CRM
            </span>
            <button 
              className="apple-btn apple-btn-glass"
              style={{ padding: '0.35rem 0.55rem', minHeight: 30 }}
              onClick={onClose}
              aria-label="Close modal"
              title="Close modal"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* 1-SCREEN SPATIAL COCKPIT LAYOUT */}
        <div className="modal-cockpit-layout">
          
          {/* =================================================================
              LEFT PANEL: Hero Visual, Core Identity & Fast Actions (380px)
             ================================================================= */}
          <div className="modal-cockpit-left">
            
            {/* Visual Stage Hero Viewport with Real Photo & 3D Hexagon */}
            <div 
              className="cockpit-hero-viewport"
              style={{ 
                '--card-glow-color': theme.glowColor,
                '--card-border-highlight': theme.borderHighlight 
              }}
            >
              {ip.image && (
                <div className="inspiration-hero-img-wrap">
                  <img 
                    src={ip.image} 
                    alt={ip.title} 
                    className="inspiration-hero-img"
                    onError={(e) => { 
                      const fallback = getCategoryFallbackImage(ip.category);
                      if (e.target.src !== fallback) {
                        e.target.src = fallback;
                      }
                    }}
                  />
                  <div className="cockpit-hero-overlay"></div>
                </div>
              )}

              {/* Viewport Top Header Badges */}
              <div className="inspiration-viewport-badges">
                <span className="viewport-id-badge">{ip.id}</span>
                
                {/* Interactive Status Selector inside hero */}
                <select
                  className="card-status-dropdown"
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Not Contacted">1. Not Contacted</option>
                  <option value="Outreach Sent">2. Outreach Sent</option>
                  <option value="In Discussion">3. In Discussion</option>
                  <option value="Terms Received">4. Terms Received</option>
                  <option value="Confirmed">5. Host Confirmed</option>
                </select>
              </div>

              {/* Centered Floating 3D Frosted Hexagon */}
              <div className="inspiration-emblem-anchor">
                <FrostedHexagon 
                  icon={IconComponent} 
                  glowColor={theme.glowColor} 
                  iconColor={theme.iconColor} 
                  size={58} 
                />
              </div>

              {/* Neon Floor Grid */}
              <div className="inspiration-platform-glow">
                <div className="inspiration-platform-grid"></div>
              </div>

              {/* Specular Ray */}
              <div className="inspiration-specular-ray"></div>
            </div>

            {/* Left Content Body */}
            <div className="cockpit-left-body">
              
              {/* Category pill */}
              <div className="inspiration-category-tag" style={{ color: theme.glowColor, fontSize: '0.68rem' }}>
                <span className="inspiration-glow-dot" style={{ background: theme.glowColor }}></span>
                <span>{ip.category}</span>
              </div>

              {/* High-Impact Title */}
              <h2 id="dossierModalTitle" className="cockpit-title">
                {ip.title}
              </h2>

              {/* Qatar Target Venue Fit Pill */}
              <div className="inspiration-venue-pill" style={{ width: '100%', boxSizing: 'border-box' }} title={ip.venue_fit}>
                <MapPin size={13} style={{ color: '#fca5a5', flexShrink: 0 }} />
                <span>{ip.venue_fit}</span>
              </div>

              {/* Benchmark Callout Strip */}
              <div className="cockpit-benchmark-strip" title={ip.past_shows}>
                <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Tour Track Record
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.35, marginTop: '0.15rem' }}>
                  {ip.past_shows}
                </div>
              </div>
            </div>

            {/* Direct Left Action Buttons */}
            <div className="cockpit-left-actions">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`apple-btn ${activeTab === 'pitch' ? 'apple-btn-primary' : 'apple-pill-btn-white'}`}
                  style={{ flex: 1, padding: '0.48rem 0.85rem', fontSize: '0.78rem', justifyContent: 'center' }}
                  onClick={() => setActiveTab('pitch')}
                >
                  <Mail size={13} />
                  <span>Pitch Letter</span>
                </button>

                <button 
                  className="apple-btn apple-btn-qatar"
                  style={{ flex: 1, padding: '0.48rem 0.85rem', fontSize: '0.78rem', justifyContent: 'center' }}
                  onClick={handleLaunchMail}
                  title="Launch Mail client"
                >
                  <Send size={13} />
                  <span>Launch Mail</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                <button 
                  className="apple-btn apple-btn-glass"
                  style={{ flex: 1, padding: '0.36rem 0.65rem', fontSize: '0.74rem', justifyContent: 'center', minWidth: '90px' }}
                  onClick={handleCopyPitch}
                  title="1-Click copy pitch letter"
                >
                  {copiedPitch ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                  <span>{copiedPitch ? 'Copied' : 'Copy Pitch'}</span>
                </button>

                {ip.website && (
                  <a 
                    href={ip.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="apple-btn apple-btn-glass"
                    style={{ padding: '0.36rem 0.65rem', fontSize: '0.74rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Open official tour website"
                  >
                    <Globe size={13} />
                    <span>Website</span>
                    <ArrowUpRight size={11} />
                  </a>
                )}

                {ip.past_show_url && (
                  <a 
                    href={ip.past_show_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="apple-btn apple-btn-glass"
                    style={{ padding: '0.36rem 0.65rem', fontSize: '0.74rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                    title="Watch live tour footage / past show trailer"
                  >
                    <Play size={11} fill="#fbbf24" />
                    <span>Past Show</span>
                    <ArrowUpRight size={11} />
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* =================================================================
              RIGHT PANEL: Spatial High-Density Intelligence Cockpit
             ================================================================= */}
          <div className="modal-cockpit-right">
            
            {/* Top VisionOS Glass Tab Navigation */}
            <div className="cockpit-tab-bar">
              <button 
                className={`cockpit-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FileText size={14} />
                <span>1. Dossier Intelligence & Staging</span>
              </button>

              <button 
                className={`cockpit-tab-btn ${activeTab === 'pitch' ? 'active' : ''}`}
                onClick={() => setActiveTab('pitch')}
              >
                <Mail size={14} />
                <span>2. Promoter Pitch Studio</span>
              </button>

              <button 
                className={`cockpit-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <NotebookText size={14} />
                <span>3. Strategy & Deal Stage</span>
              </button>
            </div>

            {/* TAB CONTENT (FITS IN 1 SCREEN ON DESKTOP!) */}
            <div className="cockpit-tab-content">
              
              {/* TAB 1: DOSSIER INTELLIGENCE & STAGING */}
              {activeTab === 'overview' && (
                <div className="cockpit-intelligence-flow">
                  
                  {/* 1. High-Density Stakeholders 2x2 Grid */}
                  <div className="cockpit-specs-grid">
                    
                    {/* Licensor & Rights Owner */}
                    <div className="cockpit-spec-cell">
                      <div className="cockpit-spec-label">
                        <span>Licensor & Rights Owner</span>
                        <Building size={12} style={{ color: 'var(--accent-cyan)' }} />
                      </div>
                      <div className="cockpit-spec-val" title={ip.licensor}>{ip.licensor}</div>
                      <div style={{ marginTop: '0.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {ip.website && (
                          <a 
                            href={ip.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-cyan)', fontSize: '0.72rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <span>Official Portal</span>
                            <ArrowUpRight size={10} />
                          </a>
                        )}
                        {ip.linkedin_url && (
                          <a 
                            href={ip.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#38bdf8', fontSize: '0.72rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <span>LinkedIn</span>
                            <ArrowUpRight size={10} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Tour Producer / Agency */}
                    <div className="cockpit-spec-cell">
                      <div className="cockpit-spec-label">
                        <span>Tour Producer / Agency</span>
                        <Layers size={12} style={{ color: 'var(--accent-gold)' }} />
                      </div>
                      <div className="cockpit-spec-val" title={ip.producer}>{ip.producer}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Lead: {ip.person}
                      </div>
                    </div>

                    {/* Verified Contact Email */}
                    <div className="cockpit-spec-cell">
                      <div className="cockpit-spec-label">
                        <span>Verified Outreach Email(s)</span>
                        <button 
                          className="subtle-copy-btn"
                          onClick={() => handleCopyEmail(ip.email)}
                          title="Copy email to clipboard"
                        >
                          {copiedEmail ? <Check size={11} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={11} />}
                          <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div 
                        className="cockpit-spec-val" 
                        style={{ color: '#fef08a', fontFamily: 'monospace', fontSize: '0.76rem' }} 
                        title={ip.email}
                      >
                        {ip.email}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                        Executive booking & co-production desk
                      </div>
                    </div>

                    {/* Social & Global Footprint */}
                    <div className="cockpit-spec-cell">
                      <div className="cockpit-spec-label">
                        <span>Social & Digital Presence</span>
                        <Globe size={12} style={{ color: 'var(--accent-purple)' }} />
                      </div>
                      <div className="cockpit-spec-val" style={{ fontSize: '0.75rem' }} title={ip.social}>
                        {ip.social}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                        Verified global tour channels
                      </div>
                    </div>

                  </div>

                  {/* 2. Venue Feasibility & Global History Dual-Card Split */}
                  <div className="cockpit-intel-split">
                    
                    {/* Doha Venue Feasibility */}
                    <div className="cockpit-intel-card venue">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fecdd3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Target Doha Venue & Staging Feasibility
                        </span>
                        <MapPin size={13} style={{ color: '#f43f5e' }} />
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.35 }}>
                        {ip.venue_fit}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#fca5a5', lineHeight: 1.35, marginTop: '0.1rem' }}>
                        Fully compatible with Qatar staging infrastructure and ticketing setups.
                      </div>
                    </div>

                    {/* Global Benchmarks & Past Show Link */}
                    <div className="cockpit-intel-card benchmark">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          International Benchmarks & History
                        </span>
                        <Award size={13} style={{ color: 'var(--accent-gold)' }} />
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.35 }}>
                        {ip.past_shows}
                      </div>
                      {ip.past_show_url && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <a 
                            href={ip.past_show_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-past-show-btn"
                            style={{ padding: '0.24rem 0.55rem', fontSize: '0.7rem' }}
                          >
                            <Play size={10} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                            <span>Watch Live Past Show Clip</span>
                            <ArrowUpRight size={10} />
                          </a>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* 3. Strategic Host Pitch Rationale & Brand Details */}
                  <div className="cockpit-summary-card">
                    <Sparkles size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Doha Host Partnership Positioning & IP Details
                      </div>
                      {ip.brand_details && (
                        <div style={{ fontSize: '0.78rem', color: '#fbbf24', lineHeight: 1.4 }}>
                          <strong>Brand / Franchise Reach: </strong>
                          <span style={{ color: '#e2e8f0' }}>{ip.brand_details}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                        {ip.notes 
                          ? `${ip.notes} Turnkey promoter deal structure with local venue integration and Qatar family audience appeal.`
                          : `Turnkey co-production opportunity with full local technical staging in Qatar, ideal for school holidays, Eid family activations, or Qatar Tourism calendar.`
                        }
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PROMOTER PITCH STUDIO */}
              {activeTab === 'pitch' && (
                <div className="cockpit-pitch-studio">
                  
                  {/* Subject Line Pill Bar */}
                  <div className="cockpit-subject-bar">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Pre-Engineered Subject Line
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {subjectLine}
                      </span>
                    </div>

                    <button 
                      className="apple-btn apple-btn-glass"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.74rem', flexShrink: 0 }}
                      onClick={handleCopySubject}
                    >
                      {copiedSubject ? <Check size={12} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={12} />}
                      <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                    </button>
                  </div>

                  {/* Email Body Preview Container */}
                  <div className="cockpit-email-body-box">
                    <pre className="cockpit-email-pre">{ip.email_template}</pre>
                  </div>

                  {/* Pitch Studio Bottom Actions */}
                  <div className="cockpit-pitch-bottom-bar">
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Ready to send to: <strong style={{ color: '#ffffff' }}>{ip.email.split(/[\/,|]/)[0]?.trim()}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button 
                        className="apple-btn apple-btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
                        onClick={handleCopyPitch}
                      >
                        {copiedPitch ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedPitch ? 'Copied Pitch' : 'Copy Entire Email'}</span>
                      </button>

                      <button 
                        className="apple-btn apple-btn-qatar"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
                        onClick={handleLaunchMail}
                      >
                        <Send size={13} />
                        <span>Launch Mail Client</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: STRATEGY & DEAL STAGE */}
              {activeTab === 'notes' && (
                <div className="cockpit-strategy-studio">
                  
                  {/* Interactive Pipeline Stepper */}
                  <div className="cockpit-stage-stepper">
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                      Host Partnership Deal Pipeline Stage
                    </div>
                    <div className="stage-pills-row">
                      {dealStages.map((stg, idx) => {
                        const isActive = status === stg;
                        return (
                          <button
                            key={stg}
                            className={`stage-step-pill ${isActive ? 'active' : ''}`}
                            onClick={() => handleStatusChange(stg)}
                          >
                            <span className="step-idx">{idx + 1}</span>
                            <span>{stg}</span>
                            {isActive && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fast Tag Suggestions */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Quick Strategy Tags (Click to append to notes):
                    </div>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      {[
                        'Target Q1/Q2 School Holidays',
                        'Qatar Tourism Co-Funding Eligible',
                        'Lusail Arena Technical Fit',
                        'Middle East Routing from UAE/KSA',
                        'VIP / Family Package Potential'
                      ].map((tag) => (
                        <button
                          key={tag}
                          className="strategy-tag-btn"
                          onClick={() => handleAddTagToNotes(tag)}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-Saving Custom Notes Textarea */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, marginTop: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Custom Strategic Promoter Notes (Auto-Saved)
                      </label>
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={11} /> Saved
                      </span>
                    </div>
                    <textarea 
                      className="apple-textarea"
                      style={{ flex: 1, minHeight: 120, resize: 'none' }}
                      placeholder="Add strategic notes regarding promoter splits, Qatar ticketing partner allocation, QNCC hold dates, venue technical load-in..."
                      value={notes}
                      onChange={handleNotesChange}
                    />
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
