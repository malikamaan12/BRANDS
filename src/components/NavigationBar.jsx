import React from 'react';
import { Plus, FileSpreadsheet, Code2, RotateCcw, Zap, Cloud } from 'lucide-react';
import IpHubLogo from './IpHubLogo';

export default function NavigationBar({ onOpenAddModal, onExportCSV, onExportJSON, onResetData, onExtractDailyIPs, onSyncNeon, isSyncing }) {
  return (
    <header className="nav-header">
      <div className="nav-container">
        
        {/* Brand Group: IP HUB */}
        <div className="nav-brand">
          <div className="nav-logo-badge" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <IpHubLogo size={38} />
          </div>
          <div className="nav-title-group">
            <h1 className="nav-title">
              IP HUB
              <span className="qatar-location-pill">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b91c49', display: 'inline-block' }}></span>
                Qatar 2026/2027
              </span>
            </h1>
            <span className="nav-subtitle">
              Global Entertainment & Live Brand Licensing Directory
            </span>
          </div>
        </div>

        {/* Global Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          
          {/* Neon Serverless Cloud Sync (Scale-to-Zero Architecture) */}
          <button 
            className="apple-btn apple-btn-glass"
            onClick={onSyncNeon}
            disabled={isSyncing}
            style={{ borderColor: 'rgba(56, 189, 248, 0.35)', background: 'rgba(56, 189, 248, 0.08)' }}
            title="Cloudflare & Neon Serverless: One-shot sync (Stateless HTTP - scales to 0 when idle)"
          >
            <Cloud size={15} style={{ color: '#38bdf8' }} className={isSyncing ? 'animate-spin' : ''} />
            <span style={{ color: '#e0f2fe' }}>{isSyncing ? 'Syncing...' : 'Neon Sync'}</span>
          </button>

          {/* Automated Daily Extraction Engine Button */}
          <button 
            className="apple-btn apple-btn-amber"
            onClick={onExtractDailyIPs}
            title="Automated Daily Discovery: Ingest at least 10 brand-new unique entertainment IPs & branded events with zero duplicates"
          >
            <Zap size={15} style={{ color: '#fbbf24' }} fill="#fbbf24" />
            <span>Extract Daily (+10)</span>
            <span className="daily-sync-badge">Daily</span>
          </button>

          <button 
            className="apple-btn apple-btn-primary" 
            onClick={onOpenAddModal}
            title="Register a new entertainment IP lead"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add IP Lead</span>
          </button>

          <button 
            className="apple-btn apple-btn-glass" 
            onClick={onExportCSV}
            title="Export full portfolio to CSV"
          >
            <FileSpreadsheet size={15} />
            <span>CSV</span>
          </button>

          <button 
            className="apple-btn apple-btn-glass" 
            onClick={onExportJSON}
            title="Export full portfolio to JSON"
          >
            <Code2 size={15} />
            <span>JSON</span>
          </button>

          <button 
            className="apple-btn apple-btn-glass" 
            onClick={onResetData}
            style={{ padding: '0.55rem' }}
            title="Reset dataset back to original 44 properties"
          >
            <RotateCcw size={15} />
          </button>

        </div>

      </div>
    </header>
  );
}
