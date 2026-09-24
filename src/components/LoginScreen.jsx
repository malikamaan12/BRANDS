import React, { useState } from 'react';
import { 
  Lock, Mail, ShieldCheck, Eye, EyeOff, 
  LogIn, AlertCircle, KeyRound, ChevronDown, User 
} from 'lucide-react';
import IpHubLogo from './IpHubLogo';
import { authService, DEFAULT_USERS } from '../services/authService';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    // Sync latest users in case created remotely
    try {
      await authService.syncUsersFromRemote();
    } catch {}

    const res = authService.login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickFill = (userObj) => {
    setErrorMsg('');
    setEmail(userObj.email);
    setPassword(userObj.password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '1.5rem',
      boxSizing: 'border-box',
      background: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0a0c1a 60%, #030408 100%)',
      overflow: 'hidden'
    }}>
      {/* Ambient Visual Atmosphere Background */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '20%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(138, 21, 56, 0.28) 0%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '15%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }}></div>

      {/* Grid Floor Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 20%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 20%, transparent 75%)',
        pointerEvents: 'none'
      }}></div>

      {/* Main Glassmorphic Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '470px',
        position: 'relative',
        zIndex: 10,
        background: 'rgba(13, 17, 33, 0.84)',
        backdropFilter: 'blur(35px) saturate(200%)',
        WebkitBackdropFilter: 'blur(35px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.95), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        borderRadius: '28px',
        padding: '2.2rem 2.1rem',
        animation: 'modalSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* Brand Header: E3 IP HUB */}
        <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <IpHubLogo size={52} />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 850,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(110deg, #ffffff 40%, #fde047 80%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 0.3rem 0',
            lineHeight: 1.15
          }}>
            E3 IP HUB
          </h1>

          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-tertiary)',
            margin: '0 auto',
            lineHeight: 1.45,
            fontWeight: 500
          }}>
            Corporate Licensing Portal • Events & Entertainment Enterprises (E3)
          </p>
        </div>

        {/* Security Policy Notice */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.22)',
          borderRadius: '14px',
          padding: '0.7rem 0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <ShieldCheck size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
          <div style={{ fontSize: '0.73rem', color: '#cbd5e1', lineHeight: 1.4 }}>
            <strong style={{ color: '#ffffff' }}>Enterprise Role-Based Access:</strong> Authorized team members only.
          </div>
        </div>

        {/* Quick-Fill Credentials Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: 'var(--text-tertiary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.04em',
            marginBottom: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <KeyRound size={12} style={{ color: 'var(--accent-gold)' }} />
            <span>Select Account to Sign In:</span>
          </div>

          {/* Quick-Select Team Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '0.55rem' }}>
            {/* Master Admin Button */}
            <button
              type="button"
              onClick={() => handleQuickFill(DEFAULT_USERS[0])}
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(138, 21, 56, 0.18) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '0.55rem 0.7rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease'
              }}
              className="quick-role-chip"
              title="Admin@eeeqa.com (Master Admin)"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24' }}>👑 Admin</span>
                <span style={{ fontSize: '0.58rem', color: '#fef3c7', background: 'rgba(245, 158, 11, 0.25)', padding: '1px 5px', borderRadius: '4px' }}>Full</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Admin@eeeqa.com
              </div>
            </button>

            {/* Amaan (Admin) Button */}
            <button
              type="button"
              onClick={() => handleQuickFill(DEFAULT_USERS[1])}
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(138, 21, 56, 0.18) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '0.55rem 0.7rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease'
              }}
              className="quick-role-chip"
              title="amaan@eeeqa.com (Amaan Malik - Admin)"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24' }}>👑 Amaan</span>
                <span style={{ fontSize: '0.58rem', color: '#fef3c7', background: 'rgba(245, 158, 11, 0.25)', padding: '1px 5px', borderRadius: '4px' }}>Admin</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                amaan@eeeqa.com
              </div>
            </button>
          </div>

          {/* Quick Dropdown for All 7 Team Members */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedUserIndex}
              onChange={(e) => {
                const idx = e.target.value;
                setSelectedUserIndex(idx);
                if (idx !== '') {
                  handleQuickFill(DEFAULT_USERS[Number(idx)]);
                }
              }}
              style={{
                width: '100%',
                background: 'rgba(12, 17, 34, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '10px',
                padding: '0.45rem 2rem 0.45rem 0.75rem',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
              aria-label="Select Team Member Credential"
            >
              <option value="">⚡ Or select team member credential...</option>
              {DEFAULT_USERS.map((u, i) => (
                <option key={u.id} value={i}>
                  {u.role === 'admin' ? '👑' : '👤'} {u.name} ({u.email}) — {u.role === 'admin' ? 'Admin' : 'User'}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            color: '#fca5a5',
            fontSize: '0.78rem'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, color: '#f87171' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          
          {/* Corporate Email */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: 'var(--text-secondary)', 
              marginBottom: '0.35rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Corporate Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-tertiary)',
                pointerEvents: 'none'
              }} />
              <input
                type="email"
                required
                placeholder="Admin@eeeqa.com or user@eeeqa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.72rem 0.85rem 0.72rem 2.4rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                className="apple-input-focus"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Security Password
              </label>
              <span style={{ fontSize: '0.68rem', color: '#fbbf24', fontFamily: 'monospace' }}>
                Default: E3qatech@123!
              </span>
            </div>
            
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-tertiary)',
                pointerEvents: 'none'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.72rem 2.5rem 0.72rem 2.4rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                className="apple-input-focus"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="apple-btn apple-btn-primary"
            style={{
              marginTop: '0.4rem',
              padding: '0.8rem',
              fontSize: '0.9rem',
              fontWeight: 750,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            <LogIn size={17} />
            <span>{isSubmitting ? 'Authenticating Credentials...' : 'Sign In to E3 IP HUB'}</span>
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '1.3rem',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          paddingTop: '0.9rem'
        }}>
          Events & Entertainment Enterprises (E3) • Confidential Licensing Infrastructure
        </div>

      </div>
    </div>
  );
}
