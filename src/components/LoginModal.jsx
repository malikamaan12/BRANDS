import React, { useState } from 'react';
import { 
  X, Lock, Mail, Shield, ShieldCheck, Eye, EyeOff, 
  LogIn, AlertCircle, Sparkles, KeyRound, UserCheck 
} from 'lucide-react';
import IpHubLogo from './IpHubLogo';
import { authService, DEFAULT_USERS } from '../services/authService';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = authService.login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify your credentials.');
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
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="glass-modal rbac-login-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          width: '92%',
          background: 'rgba(12, 16, 32, 0.88)',
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
          borderRadius: '24px',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <IpHubLogo size={32} />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>IP HUB Credentials</span>
                <span className="qatar-location-pill" style={{ padding: '0.15rem 0.5rem', fontSize: '0.62rem' }}>
                  RBAC
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Role-Based Access Control
              </div>
            </div>
          </div>

          <button 
            className="apple-icon-btn" 
            onClick={onClose}
            aria-label="Close login dialog"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          
          {/* Strict Enterprise Access Banner (No Public Signup) */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.22)',
            borderRadius: '14px',
            padding: '0.75rem 0.9rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}>
            <ShieldCheck size={16} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.73rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>
                Private Enterprise System
              </strong>
              Public registration is disabled. All user accounts must be provisioned internally by an administrator via the Admin Panel.
            </div>
          </div>

          {/* Quick-Fill Demo Credentials Bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ 
              fontSize: '0.68rem', 
              fontWeight: 700, 
              color: 'var(--text-tertiary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <KeyRound size={12} style={{ color: 'var(--accent-gold)' }} />
              <span>1-Click Test Roles:</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
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
                  <span style={{ fontSize: '0.62rem', color: '#fef3c7', background: 'rgba(245, 158, 11, 0.25)', padding: '1px 5px', borderRadius: '4px' }}>Full Control</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                  Deletions & Admin Panel
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
                  <span style={{ fontSize: '0.62rem', color: '#e0f2fe', background: 'rgba(6, 182, 212, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>Operational</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                  All Tasks, No Deletion
                </div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#fca5a5',
              fontSize: '0.75rem'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, color: '#f87171' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            
            {/* Email Field */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: 'var(--text-secondary)', 
                marginBottom: '0.35rem',
                textTransform: 'uppercase'
              }}>
                Corporate Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ 
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
                    padding: '0.65rem 0.85rem 0.65rem 2.3rem',
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

            {/* Password Field */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: 'var(--text-secondary)', 
                marginBottom: '0.35rem',
                textTransform: 'uppercase'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ 
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
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.4rem 0.65rem 2.3rem',
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
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="apple-btn apple-btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              <LogIn size={16} />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to IP HUB'}</span>
            </button>
          </form>

          {/* Security policy footnote (Zero Signup Guarantee) */}
          <div style={{ 
            marginTop: '1.25rem', 
            textAlign: 'center', 
            fontSize: '0.7rem', 
            color: 'var(--text-tertiary)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '0.9rem'
          }}>
            <span>Strict Role-Based Security: </span>
            <strong style={{ color: 'var(--text-secondary)' }}>Normal User cannot delete cards. </strong>
            <span style={{ display: 'block', marginTop: '3px' }}>
              Account provisioning exclusively authorized via Admin Panel.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
