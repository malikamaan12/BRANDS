import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, FileSpreadsheet, Code2, RotateCcw, Zap, 
  ShieldCheck, Shield, User, LogIn, LogOut, Settings, 
  ChevronDown, KeyRound, UserCheck 
} from 'lucide-react';
import IpHubLogo from './IpHubLogo';

export default function NavigationBar({ 
  onOpenAddModal, 
  onExportCSV, 
  onExportJSON, 
  onResetData, 
  onExtractDailyIPs,
  currentUser,
  onOpenLoginModal,
  onOpenAdminModal,
  onLogout,
  onQuickSwitchRole
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
        
        {/* Brand Group: IP HUB & E3 Events & Entertainment Enterprises */}
        <div className="nav-brand">
          <div className="nav-logo-badge" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <IpHubLogo size={42} />
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
              Events & Entertainment Enterprises (E3) • Global Live Brand Licensing Directory
            </span>
          </div>
        </div>

        {/* Global Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          
          {/* Automated Daily Discovery Button */}
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

          {/* ADMIN EXCLUSIVE: Admin Panel Button */}
          {isAdmin && (
            <button
              className="apple-btn"
              onClick={onOpenAdminModal}
              title="Admin Panel: Manage user accounts & RBAC permissions"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(138, 21, 56, 0.28) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                color: '#fbbf24',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Settings size={14} className="spin-hover" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* RBAC USER PROFILE PILL & MENU */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            {currentUser ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="apple-btn apple-btn-glass"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem 0.35rem 0.45rem',
                  borderColor: isAdmin ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.35)',
                  background: isAdmin 
                    ? 'rgba(245, 158, 11, 0.08)' 
                    : 'rgba(6, 182, 212, 0.08)'
                }}
                title={`Logged in as ${currentUser.name} (${isAdmin ? 'Admin: Full Control' : 'Normal User: Cannot Delete Cards'})`}
              >
                {/* Avatar Icon */}
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: isAdmin
                    ? 'linear-gradient(135deg, #f59e0b 0%, #8a1538 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {isAdmin ? '👑' : '👤'}
                </div>

                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 750, color: '#ffffff' }}>
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div style={{ 
                    fontSize: '0.62rem', 
                    color: isAdmin ? '#fbbf24' : '#38bdf8', 
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {isAdmin ? 'Admin' : 'Normal User'}
                  </div>
                </div>

                <ChevronDown size={13} style={{ color: 'var(--text-tertiary)', marginLeft: '2px' }} />
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="apple-btn apple-btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.95rem'
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && currentUser && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '270px',
                  background: 'rgba(12, 16, 32, 0.96)',
                  backdropFilter: 'blur(30px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                  padding: '0.85rem',
                  zIndex: 9999,
                  animation: 'modalSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* User Info Header */}
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: isAdmin
                        ? 'linear-gradient(135deg, #f59e0b 0%, #8a1538 100%)'
                        : 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentUser.email}
                      </div>
                    </div>
                  </div>

                  {/* Role Permissions Summary */}
                  <div style={{
                    marginTop: '0.65rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '8px',
                    background: isAdmin ? 'rgba(245, 158, 11, 0.12)' : 'rgba(6, 182, 212, 0.1)',
                    border: isAdmin ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(6, 182, 212, 0.2)',
                    fontSize: '0.68rem',
                    color: isAdmin ? '#fbbf24' : '#38bdf8'
                  }}>
                    {isAdmin ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={13} style={{ flexShrink: 0 }} />
                        <span><strong>Admin Access</strong>: Complete control & card deletions enabled.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Shield size={13} style={{ flexShrink: 0 }} />
                        <span><strong>Normal User</strong>: All tasks enabled. <em>Cannot delete cards.</em></span>
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
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '10px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        color: '#fbbf24',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textAlign: 'left'
                      }}
                    >
                      <Settings size={14} />
                      <span>Open Admin Control Panel</span>
                    </button>
                  )}

                  {/* 1-Click Role Switcher (For Instant RBAC Testing) */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onQuickSwitchRole(isAdmin ? 'user' : 'admin');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    className="menu-item-hover"
                  >
                    <KeyRound size={14} style={{ color: 'var(--accent-gold)' }} />
                    <span>Switch to {isAdmin ? '👤 Normal User' : '👑 Master Admin'}</span>
                  </button>

                  {/* Switch Account / Login as another */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      textAlign: 'left'
                    }}
                    className="menu-item-hover"
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
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      marginTop: '0.25rem'
                    }}
                    className="menu-item-hover"
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
