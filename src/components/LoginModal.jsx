import React, { useState } from 'react';
import { 
  X, Lock, Mail, ShieldCheck, Eye, EyeOff, 
  LogIn, AlertCircle 
} from 'lucide-react';
import IpHubLogo from './IpHubLogo';
import { authService } from '../services/authService';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await authService.loginAsync(email, password);
    setIsSubmitting(false);

    if (res.success) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="glass-modal rbac-login-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '470px',
          width: '92%',
          background: 'rgba(12, 16, 32, 0.92)',
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
            <IpHubLogo size={36} />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>E3 IP HUB Credentials</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Events & Entertainment Enterprises (E3)
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
        <div style={{ padding: '1.4rem' }}>
          


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
                  autoComplete="username"
                  placeholder="name@eeeqa.com"
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
              <div style={{ marginBottom: '0.35rem' }}>
                <label style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  color: 'var(--text-secondary)', 
                  textTransform: 'uppercase'
                }}>
                  Password
                </label>
              </div>
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
                  autoComplete="current-password"
                  placeholder="••••••••••••"
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
                marginTop: '0.4rem',
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
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to E3 IP HUB'}</span>
            </button>
          </form>

          {/* Security policy footnote */}
          <div style={{ 
            marginTop: '1.15rem', 
            textAlign: 'center', 
            fontSize: '0.7rem', 
            color: 'var(--text-tertiary)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '0.85rem'
          }}>
            <span>Strict Role-Based Security: </span>
            <strong style={{ color: 'var(--text-secondary)' }}>Normal User cannot delete cards. </strong>
          </div>

        </div>
      </div>
    </div>
  );
}
