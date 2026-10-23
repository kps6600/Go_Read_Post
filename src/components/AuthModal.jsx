import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthService } from '../services/authService';

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onShowToast, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup' && !formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!formData.password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (mode === 'signup' && formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await AuthService.register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          username: formData.username.trim() || undefined,
          password: formData.password
        });

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (err) {}

        if (onShowToast) {
          onShowToast(`Welcome aboard, ${res.user?.name || 'Reader'}! Account created successfully.`);
        }
        if (onAuthSuccess) {
          onAuthSuccess(res.user);
        }
        onClose();
      } else {
        const res = await AuthService.login(formData.email.trim(), formData.password, { portal: 'public' });

        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.6 }
          });
        } catch (err) {}

        if (onShowToast) {
          onShowToast(`Welcome back, ${res.user?.name || 'Reader'}! Logged in successfully.`);
        }
        if (onAuthSuccess) {
          onAuthSuccess(res.user);
        }
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdminAttempt = errorMessage.toLowerCase().includes('admin');

  return (
    <div className="modal-backdrop-portal" onClick={onClose}>
      <div 
        className="auth-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: '440px' }}
      >
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="auth-header">
          <div className="auth-logo-badge">G.</div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Access saved stories, personal reading list, and community features.'
              : 'Join GoReadPost to discover deeptech, startups, and exclusive founder stories.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-switch">
          <button 
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setErrorMessage(''); }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setErrorMessage(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.84rem',
            marginBottom: '1rem',
            lineHeight: 1.45
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
            {isSuperAdminAttempt && (
              <div style={{ marginLeft: '24px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.history.pushState(null, '', '/admin/login');
                    window.location.reload();
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--brand-primary, #dc2626)',
                    background: '#fee2e2',
                    color: 'var(--brand-primary, #dc2626)',
                    fontWeight: 750,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={13} />
                  <span>Go to Admin Panel Login →</span>
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="auth-input-group">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <User size={16} className="auth-input-icon" />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Alex Morgan"
                    className="auth-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Username (optional)</label>
                <div className="auth-input-wrap">
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', paddingLeft: '4px' }}>@</span>
                  <input 
                    type="text" 
                    placeholder="alexmorgan"
                    className="auth-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input 
                type="email" 
                required
                placeholder="name@example.com"
                className="auth-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                placeholder="••••••••••••"
                className="auth-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-tertiary)' }}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            <span>
              {loading 
                ? 'Processing...' 
                : (mode === 'login' ? 'Sign In to GoReadPost' : 'Create Free Account')}
            </span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick Admin Access Hint */}
        <div style={{
          marginTop: '1.25rem',
          padding: '10px 12px',
          background: 'var(--bg-card-hover, rgba(0,0,0,0.03))',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldCheck size={16} color="#ea580c" style={{ flexShrink: 0 }} />
          <span>
            Editorial Staff &amp; Admins: Log in with your admin credentials to unlock console access.
          </span>
        </div>

        <div className="auth-footer-terms">
          By continuing, you agree to GoReadPost Terms of Service &amp; Privacy Policy.
        </div>
      </div>
    </div>
  );
}
