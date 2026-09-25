import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, FileSpreadsheet, Code2, RotateCcw, Zap, Sparkles,
  ShieldCheck, Shield, User, LogIn, LogOut, Settings, 
  ChevronDown, KeyRound, UserCheck, Cloud, RefreshCw 
} from 'lucide-react';
import IpHubLogo from './IpHubLogo';

export default function NavigationBar({ 
  onOpenAddModal, 
  onOpenExtractionModal,
  onExportCSV, 
  onExportJSON, 
  onResetData, 
  onExtractDailyIPs,
  currentUser,
  onOpenLoginModal,
  onOpenAdminModal,
  onLogout,
  onQuickSwitchRole,
  onSyncNeon,
  isSyncing = false
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
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

        {/* Global Action Tools - Pure Minimal Icon Buttons */}
        <div className="nav-actions-group">
          
          {/* Automated Daily Discovery Icon Button */}
          <button 
            className="nav-icon-btn amber"
            onClick={onExtractDailyIPs}
            title="Extract Daily Leads (+10 New Properties)"
            aria-label="Extract Daily Leads"
          >
            <Zap size={16} fill="#fbbf24" />
          </button>

          {/* Neon Cloud Sync Button */}
          {onSyncNeon && (
            <button 
              className={`nav-icon-btn ${isSyncing ? 'gold' : 'cyan'}`}
              onClick={onSyncNeon}
              disabled={isSyncing}
              title={isSyncing ? "Synchronizing with Neon Serverless..." : "Sync with Neon Cloud Database"}
              aria-label="Sync with Neon Cloud Database"
              style={{ color: isSyncing ? '#fbbf24' : '#38bdf8' }}
            >
              <Cloud size={16} className={isSyncing ? 'spin-hover' : ''} />
            </button>
          )}

          {/* Live Extraction & AI Scraper Pipeline Button */}
          <button 
            className="nav-icon-btn highlight" 
            onClick={onOpenExtractionModal}
            title="Lead Extraction Pipeline: Google Sheets (Gemini Spark) & Live Gemini Web Scraper"
            aria-label="Extraction Pipeline"
            style={{ 
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)',
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: '#38bdf8'
            }}
          >
            <Sparkles size={16} />
          </button>

          {/* Add IP Lead Icon Button */}
          <button 
            className="nav-icon-btn primary" 
            onClick={onOpenAddModal}
            title="Add New IP Lead"
            aria-label="Add IP Lead"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>

          {/* Export CSV Icon Button */}
          <button 
            className="nav-icon-btn" 
            onClick={onExportCSV}
            title="Export full portfolio to CSV"
            aria-label="Export CSV"
          >
            <FileSpreadsheet size={16} />
          </button>

          {/* Export JSON Icon Button */}
          <button 
            className="nav-icon-btn" 
            onClick={onExportJSON}
            title="Export full portfolio to JSON"
            aria-label="Export JSON"
          >
            <Code2 size={16} />
          </button>

          {/* Reset Data Icon Button */}
          <button 
            className="nav-icon-btn" 
            onClick={onResetData}
            title="Reset dataset back to original 44 properties"
            aria-label="Reset Data"
          >
            <RotateCcw size={15} />
          </button>

          {/* ADMIN EXCLUSIVE: Admin Panel Icon Button */}
          {isAdmin && (
            <button
              className="nav-icon-btn gold"
              onClick={onOpenAdminModal}
              title="Admin Control Panel: Manage user accounts & permissions"
              aria-label="Admin Control Panel"
            >
              <Settings size={16} className="spin-hover" />
            </button>
          )}

          {/* RBAC USER PROFILE ICON & DROPDOWN */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            {currentUser ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`nav-avatar-btn ${isAdmin ? 'admin' : ''}`}
                title={`${currentUser.name} (${isAdmin ? 'Admin' : 'Normal User'})`}
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
                title="Sign In"
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
    </header>
  );
}
