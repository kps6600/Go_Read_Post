import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { SettingService } from '../../services/settingService';

export default function AdminLogin({ onLoginSuccess, onNavigateToSite, onBackToSite, unauthorizedUser, siteSettings: propSettings }) {
  const [siteSettings, setSiteSettings] = useState(() => propSettings || SettingService.getLocalSettings());
  const [imgFailed, setImgFailed] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (propSettings) setSiteSettings(propSettings);
  }, [propSettings]);

  useEffect(() => {
    setImgFailed(false);
  }, [siteSettings?.logo, siteSettings?.logoUrl]);

  useEffect(() => {
    if (!siteSettings) {
      SettingService.getSettings().then(st => st && setSiteSettings(st)).catch(() => {});
    }
    const handleSettingsChange = (e) => {
      if (e.detail) {
        setSiteSettings(e.detail);
      } else {
        SettingService.getSettings().then(st => st && setSiteSettings(st)).catch(() => {});
      }
    };
    window.addEventListener('settings:change', handleSettingsChange);
    return () => window.removeEventListener('settings:change', handleSettingsChange);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginInput.trim() || !password) {
      setErrorMessage('Please enter both email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.login(loginInput, password, { portal: 'admin' });
      const user = res.admin || res.user;
      if (!AuthService.isAdmin(user)) {
        AuthService.logoutAdmin();
        setErrorMessage(`Access Denied: Only assigned administrators can access the Admin Panel. Account "${user?.name || user?.username}" (Role: ${user?.role || 'READER'}) lacks administrative privileges.`);
        return;
      }
      if (res && res.token) {
        onLoginSuccess?.(user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-screen">
      <div className="admin-login-card">
        {/* Header / Brand */}
        <div className="login-header">
          <div className="login-brand-badge">
            {(siteSettings?.logo || siteSettings?.logoUrl) && !imgFailed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
                <img 
                  src={siteSettings.logo || siteSettings.logoUrl} 
                  alt={siteSettings?.siteTitle || siteSettings?.siteName || 'Logo'} 
                  style={{ maxHeight: '42px', maxWidth: '44px', objectFit: 'contain' }}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                />
                <div className="login-brand-meta">
                  <h2>
                    {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                    {siteSettings?.brandSuffix ? (
                      <span style={{ color: 'var(--brand-primary)' }}>
                        {siteSettings.brandSuffix}
                      </span>
                    ) : null}
                  </h2>
                  <span className="login-cms-tag">EDITORIAL CMS</span>
                </div>
              </div>
            ) : (
              <>
                <div className="login-logo-box">
                  {siteSettings?.brandEmblem || (siteSettings?.siteName ? siteSettings.siteName.trim().charAt(0).toUpperCase() : 'G')}
                </div>
                <div className="login-brand-meta">
                  <h2>
                    {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                    {siteSettings?.brandSuffix ? (
                      <span style={{ color: 'var(--brand-primary)' }}>
                        {siteSettings.brandSuffix}
                      </span>
                    ) : null}
                  </h2>
                  <span className="login-cms-tag">EDITORIAL CMS</span>
                </div>
              </>
            )}
          </div>
          <h3>Admin Authentication</h3>
          <p>Sign in to manage pages, sections, navigation, media, and portal stories.</p>
        </div>

        {/* Unauthorized Current User Alert */}
        {unauthorizedUser && !errorMessage && (
          <div className="login-error-alert" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <div style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
              Currently signed in as <strong>{unauthorizedUser.name || unauthorizedUser.username}</strong> ({unauthorizedUser.role || 'User'}).
              <br />
              <strong>Access Denied:</strong> Only assigned administrators can access the Admin Panel. Please sign in below with an administrator account.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="login-username">Email or Username</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="login-username"
                type="text"
                placeholder="admin@goreadpost.com"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Default Credentials Notice */}
        <div className="login-credentials-hint">
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          <div>
            <strong>Default Super Admin Credentials:</strong>
            <code>admin@goreadpost.com</code> / <code>Admin@12345</code>
          </div>
        </div>

        {/* Back to Public Website */}
        <div className="login-footer-row">
          <button
            type="button"
            className="back-to-site-link"
            onClick={() => {
              if (onNavigateToSite) onNavigateToSite();
              else if (onBackToSite) onBackToSite();
              else window.location.href = '/';
            }}
          >
            <ArrowLeft size={15} />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
}
