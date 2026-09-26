import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, FileSpreadsheet, Code2, Zap, Sparkles,
  ShieldCheck, Shield, User, LogIn, LogOut, Settings, 
  ChevronDown, KeyRound, UserCheck, Cloud, RefreshCw,
  FolderDown, SlidersHorizontal, Database
} from 'lucide-react';
import IpHubLogo from './IpHubLogo';

export default function NavigationBar({ 
  onOpenAddModal, 
  onOpenExtractionModal,
  onExportCSV, 
  onExportJSON, 
  onExtractDailyIPs,
  isExtracting = false,
  currentUser,
  onOpenLoginModal,
  onOpenAdminModal,
  onLogout,
  onQuickSwitchRole,
  onSyncNeon,
  isSyncing = false
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toolsMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="nav-header">
      <div className="nav-container">
        
        {/* Brand Group: E3 IP HUB */}
        <div className="nav-brand">
          <div className="nav-logo-badge" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <IpHubLogo size={36} />
          </div>
          <div className="nav-title-group">
            <h1 className="nav-title">
              E3 IP HUB
            </h1>
            <span className="nav-subtitle">
              Live Entertainment & Brand Directory
            </span>
          </div>
        </div>

        {/* Global Action Tools - Clean, Uncluttered, Purpose-Driven */}
        <div className="nav-actions-group">
          
          {/* 1. PRIMARY CTA: Fetch 10 Leads (Automated Gemini AI & Verified Pool) */}
          <button 
            className={`nav-fetch-btn ${isExtracting ? 'extracting-active' : ''}`}
            onClick={() => onExtractDailyIPs && onExtractDailyIPs(10)}
            disabled={isExtracting}
            title={isExtracting ? "Extracting & Verifying 10 Global Leads..." : "Fetch 10 Verified Leads via Live AI & Global Registry"}
            aria-label="Fetch 10 Leads"
          >
            {isExtracting ? (
              <RefreshCw size={14} className="spin-animation" style={{ color: '#fbbf24' }} />
            ) : (
              <Zap size={14} fill="#fbbf24" color="#fbbf24" />
            )}
            <span>{isExtracting ? 'Fetching...' : 'Fetch 10 Leads'}</span>
            <span className="nav-fetch-badge">+10</span>
          </button>

          {/* 2. Add New IP Button */}
          <button 
            className="nav-add-btn" 
            onClick={onOpenAddModal}
            title="Register New Entertainment IP Lead"
            aria-label="Add IP Lead"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add IP</span>
          </button>

          {/* 3. Live AI & Sheets Pipeline Hub */}
          <button 
            className="nav-icon-btn highlight" 
            onClick={onOpenExtractionModal}
            title="Pipeline Hub: Google Sheets Sync & Live Gemini AI Web Scraper"
            aria-label="Extraction Pipeline"
            style={{ 
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)',
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: '#38bdf8'
            }}
          >
            <Sparkles size={16} />
          </button>

          {/* 4. CONSOLIDATED TOOLS & EXPORT DROPDOWN (Replaces loose CSV, JSON, and Neon buttons) */}
          <div style={{ position: 'relative' }} ref={toolsMenuRef}>
            <button
              className={`nav-icon-btn ${isToolsMenuOpen ? 'active' : ''}`}
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              title="Export portfolio and cloud database tools"
              aria-label="Tools and Export Menu"
            >
              <FolderDown size={16} />
            </button>

            {isToolsMenuOpen && (
              <div className="nav-tools-dropdown">
                <div className="nav-tools-header">
                  <span>Export & Cloud Tools</span>
                </div>

                {/* Export CSV */}
                <button
                  className="nav-tools-item"
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onExportCSV();
                  }}
                >
                  <FileSpreadsheet size={15} style={{ color: 'var(--accent-emerald)' }} />
                  <div>
                    <div style={{ fontWeight: 650, color: '#ffffff' }}>Export to CSV</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Download full portfolio spreadsheet</div>
                  </div>
                </button>

                {/* Export JSON */}
                <button
                  className="nav-tools-item"
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onExportJSON();
                  }}
                >
                  <Code2 size={15} style={{ color: 'var(--accent-cyan)' }} />
                  <div>
                    <div style={{ fontWeight: 650, color: '#ffffff' }}>Export to JSON</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Raw developer dataset format</div>
                  </div>
                </button>

                {/* Neon Serverless Cloud Sync */}
                {onSyncNeon && (
                  <button
                    className="nav-tools-item"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onSyncNeon();
                    }}
                    disabled={isSyncing}
                  >
                    <Database size={15} style={{ color: isSyncing ? '#fbbf24' : '#38bdf8' }} />
                    <div>
                      <div style={{ fontWeight: 650, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Sync Neon Cloud</span>
                        {isSyncing && <span style={{ fontSize: '0.62rem', color: '#fbbf24' }}>(Syncing...)</span>}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Cloud PostgreSQL database sync</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 5. ADMIN CONTROL PANEL BUTTON (Static, clean icon, does NOT rotate) */}
          {isAdmin && (
            <button
              className="nav-icon-btn gold"
              onClick={onOpenAdminModal}
              title="Admin Control Panel: Accounts, Permissions & Factory Reset"
              aria-label="Admin Control Panel"
            >
              <Settings size={16} />
            </button>
          )}

          {/* RBAC USER PROFILE GROUP & PROMINENT SIGN OUT BUTTON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            
            {/* Explicit Sign Out Button (Takes user directly back to Login Page) */}
            {currentUser && (
              <button
                onClick={onLogout}
                className="nav-signout-btn"
                title="Sign out of active account and return to the Login Page"
                aria-label="Sign Out"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  padding: '0.38rem 0.75rem',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={13} style={{ color: '#f87171' }} />
                <span>Sign Out</span>
              </button>
            )}

            <div style={{ position: 'relative' }} ref={menuRef}>
              {currentUser ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`nav-avatar-btn ${isAdmin ? 'admin' : ''}`}
                  title={`${currentUser.name} (${isAdmin ? 'Admin' : 'Normal User'}) — Click to switch accounts or view permissions`}
                  aria-label="User Account Menu"
                >
                  <div className="nav-avatar-inner">
                    {isAdmin ? '👑' : currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`nav-avatar-status ${isAdmin ? 'gold' : 'cyan'}`}></span>
                </button>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  className="nav-icon-btn primary"
                  title="Sign In to E3 IP HUB"
                  aria-label="Sign In"
                >
                  <LogIn size={16} />
                </button>
              )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && currentUser && (
              <div className="nav-user-dropdown">
                {/* User Info Header */}
                <div className="nav-user-dropdown-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div className={`nav-dropdown-avatar ${isAdmin ? 'admin' : ''}`}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="nav-dropdown-username">
                        {currentUser.name}
                      </div>
                      <div className="nav-dropdown-email">
                        {currentUser.email}
                      </div>
                      {currentUser.title && (
                        <div style={{ fontSize: '0.69rem', color: '#fbbf24', marginTop: '2px', fontWeight: 600 }}>
                          {currentUser.title}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role Permissions Summary */}
                  <div className={`nav-dropdown-badge ${isAdmin ? 'admin' : ''}`}>
                    {isAdmin ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={13} style={{ flexShrink: 0 }} />
                        <span><strong>Admin Access</strong>: Full Control</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Shield size={13} style={{ flexShrink: 0 }} />
                        <span><strong>Normal User</strong>: Card editing enabled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropdown Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  
                  {/* Admin Panel Link (if Admin) */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAdminModal();
                      }}
                      className="nav-dropdown-action admin"
                    >
                      <Settings size={14} />
                      <span>Open Admin Control Panel</span>
                    </button>
                  )}

                  {/* Switch Account (requires authentication) */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="nav-dropdown-action"
                  >
                    <UserCheck size={14} />
                    <span>Sign In as Another User</span>
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="nav-dropdown-action danger"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  </header>
  );
}
