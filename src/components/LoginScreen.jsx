import React, { useState } from 'react';
import { 
  Lock, Mail, Shield, ShieldCheck, Eye, EyeOff, 
  LogIn, AlertCircle, KeyRound, CheckCircle2, Sparkles, Building2 
} from 'lucide-react';
import IpHubLogo from './IpHubLogo';
import { authService, DEFAULT_USERS } from '../services/authService';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

  const handleQuickFill = (userType) => {
    setErrorMsg('');
    if (userType === 'admin') {
      setEmail(DEFAULT_USERS[0].email);
      setPassword(DEFAULT_USERS[0].password);
    } else {
      setEmail(DEFAULT_USERS[1].email);
      setPassword(DEFAULT_USERS[1].password);
    }
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
        maxWidth: '460px',
        position: 'relative',
        zIndex: 10,
        background: 'rgba(13, 17, 33, 0.82)',
        backdropFilter: 'blur(35px) saturate(200%)',
        WebkitBackdropFilter: 'blur(35px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.95), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        borderRadius: '28px',
        padding: '2.4rem 2.2rem',
        animation: 'modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <IpHubLogo size={52} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <h1 style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              margin: 0
            }}>
              IP HUB
            </h1>
            <span className="qatar-location-pill" style={{ padding: '0.2rem 0.6rem', fontSize: '0.68rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b91c49', display: 'inline-block', marginRight: '4px' }}></span>
              Qatar 2026/2027
            </span>
          </div>

          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            margin: '0 auto',
            lineHeight: 1.45,
            maxWidth: '340px'
          }}>
            Events & Entertainment Enterprises (E3) • Global Live Brand Licensing Directory
          </p>
        </div>

        {/* Security Policy Notice */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.22)',
          borderRadius: '14px',
          padding: '0.75rem 0.9rem',
          marginBottom: '1.35rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem'
        }}>
          <ShieldCheck size={16} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.73rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>
              Enterprise Role-Based Access
            </strong>
            Public signup is disabled. Access is provisioned exclusively by organization administrators.
          </div>
        </div>

        {/* Quick-Fill Test Credentials */}
        <div style={{ marginBottom: '1.35rem' }}>
          <div style={{ 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: 'var(--text-tertiary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <KeyRound size={12} style={{ color: 'var(--accent-gold)' }} />
            <span>Select Test Role:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(138, 21, 56, 0.18) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '0.6rem 0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              className="quick-role-chip"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24' }}>👑 Admin</span>
                <span style={{ fontSize: '0.6rem', color: '#fef3c7', background: 'rgba(245, 158, 11, 0.25)', padding: '1px 5px', borderRadius: '4px' }}>Full Control</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                Manage Users & Deletions
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('user')}
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.15) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                padding: '0.6rem 0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              className="quick-role-chip"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8' }}>👤 Normal User</span>
                <span style={{ fontSize: '0.6rem', color: '#e0f2fe', background: 'rgba(6, 182, 212, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>Operational</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                All Tasks, No Deletion
              </div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '0.7rem 0.9rem',
            marginBottom: '1.1rem',
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Corporate Email */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: 'var(--text-secondary)', 
              marginBottom: '0.4rem',
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
                placeholder="admin@iphub.com or user@iphub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                className="apple-input-focus"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Security Password
              </label>
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
                  padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
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
              marginTop: '0.6rem',
              padding: '0.85rem',
              fontSize: '0.92rem',
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
            <span>{isSubmitting ? 'Authenticating Credentials...' : 'Sign In to IP HUB'}</span>
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '1.4rem',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          paddingTop: '1rem'
        }}>
          Events & Entertainment Enterprises (E3) • Confidential Licensing Infrastructure
        </div>

      </div>
    </div>
  );
}
