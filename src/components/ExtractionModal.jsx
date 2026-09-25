import React, { useState, useEffect } from 'react';
import { 
  X, FileSpreadsheet, Sparkles, RefreshCw, CheckCircle2, 
  AlertCircle, Globe, Link2, ExternalLink, ShieldCheck, 
  Eye, EyeOff, Search, Layers, MapPin, ArrowRight
} from 'lucide-react';
import { 
  getExtractionSettings, 
  saveExtractionSettings, 
  syncFromGoogleSheet, 
  runGeminiWebExtraction 
} from '../services/extractionService';
import { NeonDbService } from '../services/neonDbService';

export default function ExtractionModal({ 
  isOpen, 
  onClose, 
  existingIPs, 
  onAddExtractedIPs, 
  onShowToast 
}) {
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet' | 'gemini'
  
  // Settings & Form State
  const [sheetUrl, setSheetUrl] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [queryFocus, setQueryFocus] = useState('Family entertainment, arena spectacles, and immersive exhibitions');
  const [autoSync, setAutoSync] = useState(false);

  // Status & Progress State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const settings = getExtractionSettings();
      setSheetUrl(settings.googleSheetUrl || '');
      setGeminiKey(settings.geminiApiKey || '');
      setAutoSync(Boolean(settings.autoSyncEnabled));
      setErrorMsg('');
      setSuccessResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Option 1: Google Sheet Sync
  const handleSheetSync = async (e) => {
    e?.preventDefault();
    if (!sheetUrl.trim()) {
      setErrorMsg('Please enter your Google Sheet URL or published link.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessResult(null);

    try {
      const result = await syncFromGoogleSheet(sheetUrl.trim(), existingIPs);
      
      saveExtractionSettings({
        googleSheetUrl: sheetUrl.trim(),
        autoSyncEnabled: autoSync
      });

      if (result.newIPs && result.newIPs.length > 0) {
        // Save to Neon PostgreSQL
        await NeonDbService.pushIps(result.newIPs);
        onAddExtractedIPs(result.newIPs);
        onShowToast(`🎉 Ingested ${result.newIPs.length} new IPs from Google Sheet!`);
      }

      setSuccessResult({
        source: 'Google Sheet',
        count: result.importedCount,
        total: result.totalProcessed,
        message: result.message,
        items: result.newIPs
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync from Google Sheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Option 2: Live Gemini Web Extraction
  const handleGeminiExtraction = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessResult(null);

    try {
      const result = await runGeminiWebExtraction(geminiKey.trim(), queryFocus.trim(), existingIPs);

      if (geminiKey.trim()) {
        saveExtractionSettings({ geminiApiKey: geminiKey.trim() });
      }

      if (result.newIPs && result.newIPs.length > 0) {
        // Save to Neon PostgreSQL
        await NeonDbService.pushIps(result.newIPs);
        onAddExtractedIPs(result.newIPs);
        onShowToast(`⚡ Discovered ${result.newIPs.length} live touring IPs via Gemini!`);
      }

      setSuccessResult({
        source: 'Gemini AI Live Search',
        count: result.count,
        message: result.message,
        items: result.newIPs
      });
    } catch (err) {
      setErrorMsg(err.message || 'Live web search extraction failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-elevated modal-window"
        style={{ maxWidth: 840, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Title Bar */}
        <div className="modal-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="traffic-lights">
              <div className="traffic-light traffic-close" onClick={onClose} style={{ cursor: 'pointer' }}></div>
              <div className="traffic-light traffic-min"></div>
              <div className="traffic-light traffic-max"></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <Sparkles size={17} style={{ color: 'var(--accent-gold)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Automated Lead Extraction & Pipeline Hub
              </h2>
            </div>
          </div>
          <button className="apple-btn apple-btn-glass" style={{ padding: '0.35rem 0.55rem' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--glass-border-subtle)',
          padding: '0 1.5rem',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button
            onClick={() => { setActiveTab('sheet'); setErrorMsg(''); setSuccessResult(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'sheet' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
              color: activeTab === 'sheet' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'sheet' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileSpreadsheet size={16} style={{ color: activeTab === 'sheet' ? 'var(--accent-emerald)' : 'inherit' }} />
            <span>Option 1: Google Sheets (Gemini Spark)</span>
          </button>

          <button
            onClick={() => { setActiveTab('gemini'); setErrorMsg(''); setSuccessResult(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'gemini' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'gemini' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'gemini' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Globe size={16} style={{ color: activeTab === 'gemini' ? 'var(--accent-cyan)' : 'inherit' }} />
            <span>Option 2: Live Gemini AI Web Scraper</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="modal-content-scroll" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          
          {/* TAB 1: GOOGLE SHEETS */}
          {activeTab === 'sheet' && (
            <div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.2rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Connect Gemini Spark Scheduled Sheet</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.35rem' }}>
                  Paste the URL of your Google Sheet where Gemini Spark dumps schedule extractions.
                  The pipeline automatically reads the columns (Title, Licensor, Producer, Category, Contact Email, Venue Fit), runs fingerprint deduplication, and syncs newly discovered properties directly into your Neon PostgreSQL cloud database.
                </p>
              </div>

              <form onSubmit={handleSheetSync}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                    Google Sheet URL or Published Web Link *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="url"
                      required
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      className="apple-search-input"
                      style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                    />
                    <Link2 size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                    Tip: In Google Sheets, click <strong>Share</strong> &gt; set to <em>"Anyone with the link can view"</em>.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      style={{ accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
                    />
                    <span>Remember this sheet for automated startup checks</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="apple-btn"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      padding: '0.6rem 1.4rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <RefreshCw size={15} className={isLoading ? 'spin-anim' : ''} />
                    <span>{isLoading ? 'Fetching & Parsing...' : 'Sync from Google Sheet Now'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: GEMINI AI LIVE WEB SCRAPER */}
          {activeTab === 'gemini' && (
            <div>
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.2rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Sparkles size={16} />
                  <span>Real-Time Google Search Grounding with Gemini AI</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.35rem' }}>
                  Runs real-time web intelligence queries via Gemini API with active Google Search Grounding. It searches the live internet for newly announced 2025-2026 global touring productions, arena stunt shows, and immersive exhibitions, automatically pairs them with Doha venues, and generates turnkey promoter pitch templates.
                </p>
              </div>

              <form onSubmit={handleGeminiExtraction}>
                {/* API Key */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Google Gemini API Key
                    </label>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <span>Get Free API Key</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="apple-search-input"
                      style={{ paddingRight: '2.5rem', fontSize: '0.85rem', fontFamily: showKey ? 'inherit' : 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                    Stored securely in your private browser settings. You can also configure <code>GEMINI_API_KEY</code> on Cloudflare.
                  </div>
                </div>

                {/* Touring Focus Query */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                    Touring Category / Search Focus
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder="e.g. Preschool live shows, Arena motorsport stunts, Immersive museum exhibitions"
                      value={queryFocus}
                      onChange={(e) => setQueryFocus(e.target.value)}
                      className="apple-search-input"
                      style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  </div>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border-subtle)' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="apple-btn"
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      padding: '0.6rem 1.4rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
                    }}
                  >
                    <Sparkles size={15} className={isLoading ? 'spin-anim' : ''} />
                    <span>{isLoading ? 'Crawling Live Web with Gemini...' : 'Run Live Web Search & Extract'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Feedback & Results Zone */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.84rem',
              marginTop: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successResult && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                fontSize: '0.84rem'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successResult.message}</span>
              </div>

              {/* Preview newly added items */}
              {successResult.items && successResult.items.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Newly Ingested Properties ({successResult.items.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
                    {successResult.items.map((ip) => (
                      <div 
                        key={ip.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.85rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--glass-border-subtle)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span className="ip-id-chip" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>{ip.id}</span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{ip.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>{ip.licensor} · {ip.category}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={12} style={{ color: 'var(--accent-cyan)' }} />
                          <span style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ip.venue_fit}
                          </span>
                        </div>
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
  );
}
