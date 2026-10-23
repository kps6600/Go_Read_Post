import React, { useState, useEffect } from 'react';
import { 
  Search, Globe, Share2, Code, Save, CheckCircle, 
  AlertCircle, RefreshCw, Eye, Sparkles, Check, ExternalLink
} from 'lucide-react';
import { SettingService } from '../../services/settingService';

export default function AdminSEOView({ onShowToast }) {
  const [seo, setSeo] = useState({
    metaTitle: 'GoReadPost - Indian Startup Stories, Venture Capital & Tech News',
    metaDescription: 'Discover groundbreaking stories of Indian entrepreneurs, disruptive startups, venture capital funding, AI innovation, and emerging technology across Bharat.',
    keywords: 'startups, funding, venture capital, Indian entrepreneurs, tech news, artificial intelligence, deeptech, MSME, SMBStory',
    ogImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
    robotsIndex: true,
    canonicalBase: 'https://goreadpost.com',
    googleAnalyticsId: 'G-GOREADPOST26',
    customHeadCode: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SettingService.getSettings();
      if (data && data.seoDefaults) {
        setSeo(prev => ({
          ...prev,
          ...data.seoDefaults
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await SettingService.updateSettings({
        seoDefaults: seo
      });
      if (onShowToast) onShowToast('Global SEO & Metadata saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="aseo-loading-box">
        <RefreshCw className="animate-spin" size={24} />
        <span>Loading SEO configuration...</span>
      </div>
    );
  }

  return (
    <div className="aseo-container">
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '0.25rem' }}>
        <button 
          type="button" 
          className="aseo-btn-primary" 
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 20px',
            background: 'var(--brand-primary, #dc2626)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.88rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
          }}
        >
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save SEO Settings'}</span>
        </button>
      </div>

      {error && (
        <div className="aseo-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Google Search Live SERP Preview */}
      <div className="aseo-card preview-card">
        <div className="aseo-card-header">
          <Globe size={18} />
          <h3>Google Search SERP Preview</h3>
          <span className="aseo-badge-pill">Live Simulation</span>
        </div>
        <div className="aseo-serp-box">
          <div className="aseo-serp-url">
            <span className="aseo-serp-fav">G</span>
            <span>{seo.canonicalBase || 'https://goreadpost.com'}</span>
          </div>
          <div className="aseo-serp-title">
            {seo.metaTitle || 'GoReadPost - Startup Stories & Tech News'}
          </div>
          <div className="aseo-serp-desc">
            {seo.metaDescription || 'Discover stories of entrepreneurs, startups, and tech innovation.'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="aseo-form">
        {/* Basic Meta Card */}
        <div className="aseo-card">
          <div className="aseo-card-header">
            <Search size={18} />
            <h3>Default Metadata</h3>
          </div>
          <div className="aseo-card-body">
            <div className="aseo-field">
              <label>Default Page Title (Title Tag) *</label>
              <input 
                type="text" 
                value={seo.metaTitle} 
                onChange={e => setSeo({ ...seo, metaTitle: e.target.value })}
                required
              />
              <span className="aseo-char-counter">
                {(seo.metaTitle || '').length} / 60 characters recommended
              </span>
            </div>

            <div className="aseo-field">
              <label>Default Meta Description *</label>
              <textarea 
                rows={3} 
                value={seo.metaDescription} 
                onChange={e => setSeo({ ...seo, metaDescription: e.target.value })}
                required
              />
              <span className="aseo-char-counter">
                {(seo.metaDescription || '').length} / 160 characters recommended
              </span>
            </div>

            <div className="aseo-field">
              <label>Keywords (Comma-Separated)</label>
              <input 
                type="text" 
                value={seo.keywords} 
                onChange={e => setSeo({ ...seo, keywords: e.target.value })}
              />
              <span className="aseo-help-text">Target topics indexed across search engines.</span>
            </div>

            <div className="aseo-field">
              <label>Canonical Base URL</label>
              <input 
                type="url" 
                value={seo.canonicalBase} 
                onChange={e => setSeo({ ...seo, canonicalBase: e.target.value })}
                placeholder="https://goreadpost.com"
              />
            </div>
          </div>
        </div>

        {/* Social Graph Card */}
        <div className="aseo-card">
          <div className="aseo-card-header">
            <Share2 size={18} />
            <h3>Social Sharing & Open Graph (Twitter / LinkedIn)</h3>
          </div>
          <div className="aseo-card-body">
            <div className="aseo-field">
              <label>Open Graph Default Image URL</label>
              <input 
                type="url" 
                value={seo.ogImage} 
                onChange={e => setSeo({ ...seo, ogImage: e.target.value })}
                placeholder="https://..."
              />
              <span className="aseo-help-text">1200x630px high-resolution banner displayed when links are shared on Twitter, WhatsApp, and LinkedIn.</span>
            </div>

            {seo.ogImage && (
              <div className="aseo-og-preview">
                <img 
                  src={seo.ogImage} 
                  alt="OG Preview" 
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="aseo-og-meta">
                  <strong>{seo.metaTitle}</strong>
                  <p>{seo.metaDescription}</p>
                  <span>goreadpost.com</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Scripts */}
        <div className="aseo-card">
          <div className="aseo-card-header">
            <Code size={18} />
            <h3>Analytics & Custom Head Scripts</h3>
          </div>
          <div className="aseo-card-body">
            <div className="aseo-field">
              <label>Google Analytics Tag ID (GA4)</label>
              <input 
                type="text" 
                value={seo.googleAnalyticsId} 
                onChange={e => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div className="aseo-field">
              <label>Custom &lt;head&gt; Scripts (Meta tags, Search Console verification, pixel tags)</label>
              <textarea 
                rows={3} 
                value={seo.customHeadCode} 
                onChange={e => setSeo({ ...seo, customHeadCode: e.target.value })}
                placeholder="<!-- Paste Google Site Verification or custom script tags here -->"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
