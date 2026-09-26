import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Send, ExternalLink, Mail, Building, User, 
  MapPin, Sparkles, FileText, NotebookText, ArrowUpRight, 
  Globe, Award, Calendar, CheckCircle2, ChevronRight, Layers, Play,
  Trash2, Lock, Shield, History, Share2
} from 'lucide-react';
import { getCategoryFallbackImage } from './CardsView';

export default function IPDossierModal({ 
  ip, 
  initialTab = 'overview', 
  onClose, 
  onUpdateIP, 
  onShowToast, 
  currentUser, 
  onDeleteIP 
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'pitch' | 'notes'
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWebsite, setCopiedWebsite] = useState(false);
  const [copiedSocial, setCopiedSocial] = useState(false);
  const [notes, setNotes] = useState(ip?.notes || '');
  const [status, setStatus] = useState(ip?.status || 'Not Contacted');

  const isAdmin = currentUser?.role === 'admin';

  const handleDeleteProperty = () => {
    if (isAdmin) {
      if (confirm(`Are you sure you want to permanently delete "${ip.title}" (${ip.id}) from the portfolio?`)) {
        onDeleteIP(ip.id);
        onClose();
      }
    } else {
      onShowToast?.('🔒 Action Restricted: Administrator access required.');
    }
  };

  // Sync state when selected IP or initialTab changes
  useEffect(() => {
    if (ip) {
      setNotes(ip.notes || '');
      setStatus(ip.status || 'Not Contacted');
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'pitch', 'notes'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else if (initialTab) {
        setActiveTab(initialTab);
      } else {
        setActiveTab('overview');
      }
    }
  }, [ip?.id, initialTab]);

  // Debounced notes update
  useEffect(() => {
    if (!ip) return;
    const timer = setTimeout(() => {
      if (notes !== (ip.notes || '')) {
        onUpdateIP?.({ ...ip, notes, status });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [notes]);

  if (!ip) return null;

  // Safe fallback template
  const template = ip.email_template || `Subject: Host Partnership Inquiry: Bringing ${ip.title} to Doha, Qatar\n\nDear ${ip.producer || ip.licensor} Touring Team,\n\nWe are writing to explore hosting ${ip.title} in Doha, Qatar. Our event production operations group specializes in world-class entertainment properties. We provide turnkey local staging, marketing, venue liaison, and promoter coordination.\n\nCould we schedule a preliminary call to discuss touring availability and Middle East routing windows?\n\nBest regards,\nHost Partnership Directorate — E3 IP HUB`;

  const matchSubject = template.match(/Subject:\s*(.*)/i);
  const subjectLine = matchSubject ? matchSubject[1] : `Host Partnership Inquiry: ${ip.title} in Doha, Qatar`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(template);
    setCopiedPitch(true);
    onShowToast?.('Pitch letter copied to clipboard');
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subjectLine);
    setCopiedSubject(true);
    onShowToast?.('Subject line copied');
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyEmail = (emailStr) => {
    navigator.clipboard.writeText(emailStr || 'licensing@eeeqa.com');
    setCopiedEmail(true);
    onShowToast?.('Outreach email copied to clipboard');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyWebsite = () => {
    if (!ip.website) return;
    navigator.clipboard.writeText(ip.website);
    setCopiedWebsite(true);
    onShowToast?.('Website link copied to clipboard');
    setTimeout(() => setCopiedWebsite(false), 2000);
  };

  const handleCopySocial = () => {
    const socialUrl = ip.linkedin_url || (ip.social?.includes('http') ? ip.social : `https://${ip.social?.split('|')[0]?.trim()}`);
    if (!socialUrl) return;
    navigator.clipboard.writeText(socialUrl);
    setCopiedSocial(true);
    onShowToast?.('Social link copied to clipboard');
    setTimeout(() => setCopiedSocial(false), 2000);
  };

  const handleLaunchMail = () => {
    const match = template.match(/Subject:\s*(.*)\n\n([\s\S]*)/i);
    let subject = subjectLine;
    let body = template;

    if (match) {
      subject = match[1];
      body = match[2];
    }

    const emails = (ip.email || '').split(/[\/,|]/).map(s => s.trim()).filter(s => s.includes('@'));
    const recipient = emails[0] || '';

    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Launched official promoter outreach email to ${recipient || ip.producer}`,
      user: currentUser?.name || 'Licensing Manager'
    };
    const updatedHistory = [newLog, ...(Array.isArray(ip.connection_history) ? ip.connection_history : [])];
    onUpdateIP?.({ ...ip, connection_history: updatedHistory, notes, status });
    onShowToast?.(`Logged outreach dispatch to ${recipient || ip.producer}`);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Pipeline advanced to "${newStatus}"`,
      user: currentUser?.name || 'Licensing Manager'
    };
    const updatedHistory = [newLog, ...(Array.isArray(ip.connection_history) ? ip.connection_history : [])];
    const updated = { ...ip, status: newStatus, notes, connection_history: updatedHistory };
    onUpdateIP?.(updated);
    onShowToast?.(`Status updated to "${newStatus}"`);
  };

  const handleAddTagToNotes = (tag) => {
    const newNotes = notes ? `${notes}\n• ${tag}` : `• ${tag}`;
    setNotes(newNotes);
    onUpdateIP?.({ ...ip, notes: newNotes, status });
    onShowToast?.(`Added note: "${tag}"`);
  };

  const dealStages = [
    'Not Contacted',
    'Outreach Sent',
    'In Discussion',
    'Terms Received',
    'Confirmed'
  ];

  const getStatusColor = (stg) => {
    switch (stg) {
      case 'Confirmed': return '#10b981';
      case 'Terms Received': return '#8b5cf6';
      case 'In Discussion': return '#38bdf8';
      case 'Outreach Sent': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="dossier-modal-window" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossierModalTitle"
      >
        {/* Clean Header Bar */}
        <div className="dossier-header-bar">
          <div className="dossier-header-left">
            <span className="dossier-id-badge">{ip.id}</span>
            <div className="dossier-header-title-wrap">
              <h1 id="dossierModalTitle" className="dossier-header-title">
                {ip.title}
              </h1>
              <span className="dossier-header-category">
                {ip.category} {ip.licensor ? `· ${ip.licensor}` : ''}
              </span>
            </div>
          </div>

          <div className="dossier-header-actions">
            {/* Stage Selector */}
            <div className="dossier-status-pill-wrap">
              <span 
                className="dossier-status-dot" 
                style={{ background: getStatusColor(status) }}
              />
              <select
                className="dossier-status-dropdown"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {dealStages.map((stg, i) => (
                  <option key={stg} value={stg}>
                    {i + 1}. {stg}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Delete Action */}
            {isAdmin && (
              <button 
                className="dossier-delete-btn"
                onClick={handleDeleteProperty}
                title="Delete Property (Admin)"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}

            {/* Close Button */}
            <button 
              className="dossier-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Cockpit Layout Body */}
        <div className="dossier-body-layout">
          
          {/* =========================================================
              LEFT COLUMN: Clean Visual Identity & Direct Outreach Actions
             ========================================================= */}
          <div className="dossier-left-panel">
            
            {/* Show Photo Viewport (Clear & Unobstructed) */}
            <div className="dossier-photo-viewport">
              <img 
                src={ip.image || getCategoryFallbackImage(ip.category)} 
                alt={ip.title} 
                className="dossier-photo-img"
                onError={(e) => { 
                  const fallback = getCategoryFallbackImage(ip.category);
                  if (e.target.src !== fallback) {
                    e.target.src = fallback;
                  }
                }}
              />
              <div className="dossier-photo-overlay" />
              <div className="dossier-photo-meta">
                <span className="dossier-photo-tag">{ip.category}</span>
              </div>
            </div>

            {/* Property Quick Summary */}
            <div className="dossier-left-summary">
              <h2 className="dossier-left-title">{ip.title}</h2>
              <p className="dossier-left-licensor">Rights: {ip.licensor || 'Independent'}</p>

              {ip.venue_fit && (
                <div className="dossier-venue-badge" title={ip.venue_fit}>
                  <MapPin size={13} style={{ color: '#f43f5e', flexShrink: 0 }} />
                  <span className="dossier-venue-text">{ip.venue_fit.split(';')[0]}</span>
                </div>
              )}
            </div>

            {/* Quick Outreach & Channels Card (Email, Website, Social with 1-Click Copy) */}
            <div className="dossier-quick-channels">
              {/* Email Row */}
              <div className="dossier-channel-item">
                <div className="dossier-channel-icon-wrap" style={{ color: '#fde047' }}>
                  <Mail size={13} />
                </div>
                <div className="dossier-channel-info">
                  <span className="dossier-channel-label">Outreach Email</span>
                  <a 
                    href={`mailto:${(ip.email || '').split(/[\/,|]/)[0]?.trim() || ''}`}
                    className="dossier-channel-link mono"
                    title={ip.email}
                  >
                    {(ip.email || '').split(/[\/,|]/)[0]?.trim() || 'licensing@eeeqa.com'}
                  </a>
                </div>
                <button 
                  type="button"
                  className="dossier-channel-copy-btn"
                  onClick={() => handleCopyEmail((ip.email || '').split(/[\/,|]/)[0]?.trim())}
                  title="Copy email address"
                >
                  {copiedEmail ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                </button>
              </div>

              {/* Website Row */}
              {ip.website && (
                <div className="dossier-channel-item">
                  <div className="dossier-channel-icon-wrap" style={{ color: '#38bdf8' }}>
                    <Globe size={13} />
                  </div>
                  <div className="dossier-channel-info">
                    <span className="dossier-channel-label">Official Website</span>
                    <a 
                      href={ip.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="dossier-channel-link"
                      title={ip.website}
                    >
                      {ip.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      <ArrowUpRight size={10} style={{ marginLeft: 3, opacity: 0.7 }} />
                    </a>
                  </div>
                  <button 
                    type="button"
                    className="dossier-channel-copy-btn"
                    onClick={handleCopyWebsite}
                    title="Copy website link"
                  >
                    {copiedWebsite ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                  </button>
                </div>
              )}

              {/* Social / Digital Presence Row */}
              {(ip.linkedin_url || ip.social) && (
                <div className="dossier-channel-item">
                  <div className="dossier-channel-icon-wrap" style={{ color: '#c084fc' }}>
                    <Share2 size={13} />
                  </div>
                  <div className="dossier-channel-info">
                    <span className="dossier-channel-label">Social & Digital</span>
                    <a 
                      href={ip.linkedin_url || (ip.social?.includes('http') ? ip.social : `https://${ip.social?.split('|')[0]?.trim()}`)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="dossier-channel-link"
                      title={ip.social || ip.linkedin_url}
                    >
                      {ip.social?.split('|')[0]?.trim() || 'LinkedIn Company'}
                      <ArrowUpRight size={10} style={{ marginLeft: 3, opacity: 0.7 }} />
                    </a>
                  </div>
                  <button 
                    type="button"
                    className="dossier-channel-copy-btn"
                    onClick={handleCopySocial}
                    title="Copy social link"
                  >
                    {copiedSocial ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="dossier-left-actions">
              <button 
                className="dossier-btn-primary"
                onClick={handleLaunchMail}
              >
                <Send size={14} />
                <span>Launch Outreach Email</span>
              </button>

              <button 
                className="dossier-btn-secondary"
                onClick={handleCopyPitch}
              >
                {copiedPitch ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                <span>{copiedPitch ? 'Copied to Clipboard' : 'Copy Pitch Letter'}</span>
              </button>

              {ip.past_show_url && (
                <a 
                  href={ip.past_show_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="dossier-link-chip"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <Play size={11} />
                  <span>Watch Live Performance Clip</span>
                  <ArrowUpRight size={11} />
                </a>
              )}
            </div>


          </div>

          {/* =========================================================
              RIGHT COLUMN: Structured Executive Intelligence
             ========================================================= */}
          <div className="dossier-right-panel">
            
            {/* Minimal Segmented Tab Bar */}
            <div className="dossier-tab-bar">
              <button 
                className={`dossier-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FileText size={14} />
                <span>Overview</span>
              </button>

              <button 
                className={`dossier-tab-btn ${activeTab === 'pitch' ? 'active' : ''}`}
                onClick={() => setActiveTab('pitch')}
              >
                <Mail size={14} />
                <span>Pitch Studio</span>
              </button>

              <button 
                className={`dossier-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <NotebookText size={14} />
                <span>Deal & Notes</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="dossier-tab-body">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="dossier-overview-flow">
                  
                  {/* Section 1: Production & Rights Stakeholders */}
                  <div className="dossier-card">
                    <div className="dossier-card-header">
                      <span className="dossier-card-title">Key Stakeholders & Contact Channels</span>
                    </div>

                    <div className="dossier-grid-2">
                      {/* Licensor */}
                      <div className="dossier-field">
                        <span className="dossier-field-label">Licensor & Rights Owner</span>
                        <div className="dossier-field-val">{ip.licensor || 'Direct Rights Holder'}</div>
                        <div className="dossier-field-links">
                          {ip.website && (
                            <a href={ip.website} target="_blank" rel="noopener noreferrer">
                              Official Portal <ArrowUpRight size={10} />
                            </a>
                          )}
                          {ip.linkedin_url && (
                            <a href={ip.linkedin_url} target="_blank" rel="noopener noreferrer">
                              LinkedIn <ArrowUpRight size={10} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Producer / Agency */}
                      <div className="dossier-field">
                        <span className="dossier-field-label">Tour Producer & Booking Agency</span>
                        <div className="dossier-field-val">{ip.producer || 'Direct Production'}</div>
                        {ip.person && (
                          <div className="dossier-field-sub">Contact: {ip.person}</div>
                        )}
                      </div>

                      {/* Outreach Email */}
                      <div className="dossier-field">
                        <div className="dossier-field-label-row">
                          <span className="dossier-field-label">Verified Outreach Email</span>
                          <button 
                            className="dossier-inline-copy"
                            onClick={() => handleCopyEmail(ip.email)}
                            title="Copy email"
                          >
                            {copiedEmail ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                            <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="dossier-field-val email">{ip.email || 'licensing@eeeqa.com'}</div>
                      </div>

                      {/* Social & Digital Presence */}
                      <div className="dossier-field">
                        <span className="dossier-field-label">Digital Presence</span>
                        <div className="dossier-field-val subtle">{ip.social || 'Official Tour Distribution'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Staging & Tour Benchmarks (Balanced 2-Col Split) */}
                  <div className="dossier-split-row">
                    
                    {/* Target Qatar Venue */}
                    <div className="dossier-card half">
                      <div className="dossier-card-header">
                        <span className="dossier-card-title">Target Qatar Venue & Staging</span>
                        <MapPin size={13} style={{ color: '#f43f5e' }} />
                      </div>
                      <div className="dossier-staging-venue">
                        {ip.venue_fit || 'DECC / QNCC / Lusail Multipurpose Arena'}
                      </div>
                      <p className="dossier-staging-note">
                        Evaluated for load-in logistics, seating scale, and Qatar family market compatibility.
                      </p>
                    </div>

                    {/* Global Benchmarks */}
                    <div className="dossier-card half">
                      <div className="dossier-card-header">
                        <span className="dossier-card-title">Proven International Track Record</span>
                        <Award size={13} style={{ color: '#fbbf24' }} />
                      </div>
                      <div className="dossier-benchmark-text">
                        {ip.past_shows || 'Global touring across North America, Europe, and Asia-Pacific.'}
                      </div>
                      {ip.past_show_url && (
                        <a 
                          href={ip.past_show_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dossier-trailer-btn"
                        >
                          <Play size={11} />
                          <span>Watch Live Performance Clip</span>
                          <ArrowUpRight size={11} />
                        </a>
                      )}
                    </div>

                  </div>

                  {/* Section 3: Commercial Rationale & Franchise Strategy */}
                  <div className="dossier-card">
                    <div className="dossier-card-header">
                      <span className="dossier-card-title">Commercial Positioning & Doha Audience Fit</span>
                      <Sparkles size={13} style={{ color: '#38bdf8' }} />
                    </div>
                    {ip.brand_details && (
                      <p className="dossier-strategy-text">
                        <strong style={{ color: '#ffffff' }}>Franchise Reach: </strong>
                        {ip.brand_details}
                      </p>
                    )}
                    <p className="dossier-strategy-text sub">
                      {ip.notes || 'Turnkey co-production opportunity with full local technical staging in Qatar, ideal for school holidays, Eid family activations, or Qatar Tourism calendar.'}
                    </p>
                  </div>

                </div>
              )}

              {/* TAB 2: PITCH STUDIO */}
              {activeTab === 'pitch' && (
                <div className="dossier-pitch-flow">
                  
                  {/* Subject Line Bar */}
                  <div className="dossier-card">
                    <div className="dossier-field-label-row">
                      <span className="dossier-field-label">Pre-Engineered Subject Line</span>
                      <button 
                        className="dossier-inline-copy"
                        onClick={handleCopySubject}
                      >
                        {copiedSubject ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                        <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                      </button>
                    </div>
                    <div className="dossier-subject-text">{subjectLine}</div>
                  </div>

                  {/* Clean Email Preview */}
                  <div className="dossier-email-preview-box">
                    <pre className="dossier-email-content">{template}</pre>
                  </div>

                  {/* Pitch Bottom Actions */}
                  <div className="dossier-pitch-actions">
                    <span className="dossier-recipient-hint">
                      Primary Contact: <strong>{(ip.email || '').split(/[\/,|]/)[0]?.trim() || 'Executive Booking Desk'}</strong>
                    </span>

                    <div className="dossier-pitch-btn-group">
                      <button 
                        className="dossier-btn-secondary"
                        onClick={handleCopyPitch}
                      >
                        {copiedPitch ? <Check size={13} /> : <Copy size={13} />}
                        <span>Copy Email</span>
                      </button>

                      <button 
                        className="dossier-btn-primary"
                        onClick={handleLaunchMail}
                      >
                        <Send size={13} />
                        <span>Launch in Mail Client</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: DEAL & NOTES */}
              {activeTab === 'notes' && (
                <div className="dossier-deal-flow">
                  
                  {/* Pipeline Stepper */}
                  <div className="dossier-card">
                    <span className="dossier-field-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                      Host Partnership Deal Pipeline Stage
                    </span>
                    <div className="dossier-stepper">
                      {dealStages.map((stg, idx) => {
                        const isActive = status === stg;
                        const isPassed = dealStages.indexOf(status) >= idx;
                        return (
                          <button
                            key={stg}
                            className={`dossier-step-pill ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                            onClick={() => handleStatusChange(stg)}
                          >
                            <span className="dossier-step-num">{idx + 1}</span>
                            <span>{stg}</span>
                            {isActive && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Strategy Tags */}
                  <div className="dossier-card">
                    <span className="dossier-field-label" style={{ marginBottom: '0.45rem', display: 'block' }}>
                      Quick Strategy Tags (Click to append):
                    </span>
                    <div className="dossier-tags-row">
                      {[
                        'Target Q1/Q2 School Holidays',
                        'Qatar Tourism Co-Funding Eligible',
                        'Lusail Arena Technical Fit',
                        'Middle East Routing from UAE/KSA',
                        'VIP / Family Package Potential'
                      ].map((tag) => (
                        <button
                          key={tag}
                          className="dossier-quick-tag"
                          onClick={() => handleAddTagToNotes(tag)}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strategic Notes */}
                  <div className="dossier-card flex-1">
                    <div className="dossier-field-label-row" style={{ marginBottom: '0.35rem' }}>
                      <span className="dossier-field-label">Custom Strategic Promoter Notes</span>
                      <span className="dossier-autosave-tag">
                        <CheckCircle2 size={11} /> Auto-Saved
                      </span>
                    </div>
                    <textarea 
                      className="dossier-notes-textarea"
                      placeholder="Add strategic notes regarding promoter splits, Qatar ticketing partner allocation, QNCC hold dates, venue technical load-in..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Audit Trail */}
                  {Array.isArray(ip.connection_history) && ip.connection_history.length > 0 && (
                    <div className="dossier-card">
                      <div className="dossier-field-label-row" style={{ marginBottom: '0.4rem' }}>
                        <span className="dossier-field-label">Connection Audit Trail</span>
                        <span className="dossier-encrypted-tag"><Lock size={10} /> Verified Record</span>
                      </div>
                      <div className="dossier-audit-list">
                        {ip.connection_history.slice(0, 4).map((log, idx) => (
                          <div key={log.id || idx} className="dossier-audit-item">
                            <span className="dossier-audit-dot" />
                            <span className="dossier-audit-action">{log.action}</span>
                            <span className="dossier-audit-time">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.user || 'Team'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
