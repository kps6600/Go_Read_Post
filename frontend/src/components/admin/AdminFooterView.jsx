import React, { useState, useEffect } from 'react';
import { 
  Layers, Save, RefreshCw, AlertCircle, Plus, Trash2, Globe, Shield, 
  Share2, MessageSquare, Send, CheckCircle, ArrowUpRight,
  ExternalLink, Sparkles, MoveUp, MoveDown, Compass, HeartHandshake, MapPin,
  ArrowLeft, ArrowRight, Tag, Rss
} from 'lucide-react';
import { FooterService } from '../../services/footerService';

const PRESET_BADGE_COLORS = [
  { label: 'Red / Hot', color: '#dc2626' },
  { label: 'Amber / Hindi', color: '#f59e0b' },
  { label: 'Orange / Summit', color: '#f97316' },
  { label: 'Green / Hiring', color: '#10b981' },
  { label: 'Blue / New', color: '#2563eb' },
  { label: 'Purple / AI', color: '#8b5cf6' }
];

export const SOCIAL_PLATFORM_PRESETS = [
  { id: 'twitter', label: 'Twitter / X', defaultUrl: 'https://twitter.com/', domain: 'twitter.com' },
  { id: 'telegram', label: 'Telegram', defaultUrl: 'https://t.me/', domain: 't.me' },
  { id: 'whatsapp', label: 'WhatsApp', defaultUrl: 'https://whatsapp.com/channel/', domain: 'whatsapp.com' },
  { id: 'linkedin', label: 'LinkedIn', defaultUrl: 'https://linkedin.com/company/', domain: 'linkedin.com' },
  { id: 'youtube', label: 'YouTube', defaultUrl: 'https://youtube.com/@', domain: 'youtube.com' },
  { id: 'instagram', label: 'Instagram', defaultUrl: 'https://instagram.com/', domain: 'instagram.com' },
  { id: 'facebook', label: 'Facebook', defaultUrl: 'https://facebook.com/', domain: 'facebook.com' },
  { id: 'rss', label: 'RSS Feed', defaultUrl: '/#feed', domain: 'rss' },
  { id: 'discord', label: 'Discord', defaultUrl: 'https://discord.gg/', domain: 'discord.gg' },
  { id: 'threads', label: 'Threads', defaultUrl: 'https://threads.net/@', domain: 'threads.net' },
  { id: 'github', label: 'GitHub', defaultUrl: 'https://github.com/', domain: 'github.com' },
  { id: 'reddit', label: 'Reddit', defaultUrl: 'https://reddit.com/r/', domain: 'reddit.com' },
  { id: 'custom', label: 'Custom / Other', defaultUrl: 'https://', domain: '' }
];

export const normalizeSocialArray = (social) => {
  if (Array.isArray(social)) return social;
  if (social && typeof social === 'object') {
    const PRESET_LABELS = {
      twitter: 'Twitter / X',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      facebook: 'Facebook',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      rss: 'RSS Feed'
    };
    return Object.entries(social)
      .filter(([_, url]) => Boolean(url))
      .map(([platform, url]) => ({
        platform,
        label: PRESET_LABELS[platform] || (platform.charAt(0).toUpperCase() + platform.slice(1)),
        url
      }));
  }
  return [];
};

const DEFAULT_CMS_FOOTER = {
  aboutText: 'GoReadPost is the leading digital publishing network chronicling the growth of startups, tech innovation, venture capital, and visionary entrepreneurs across India and global ecosystems.',
  copyrightText: '© 2026 GoReadPost Media Technologies Pvt. Ltd. All rights reserved.',
  brandCtaText: '',
  brandCtaLink: '/pitch',
  trustBadgeText: '100% Independent Editorial Integrity',
  liveDeskText: 'LIVE DESK',
  liveDeskLocations: 'Bengaluru • New Delhi • San Francisco • Singapore',
  bottomCommunityTag: 'Built with precision for the global builder community',
  bottomEditionText: 'Global Edition (English)',
  socialLinks: [
    { platform: 'twitter', label: 'Twitter / X', url: 'https://twitter.com/goreadpost' },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/goreadpost' },
    { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com/@goreadpost' },
    { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/goreadpost' },
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/goreadpost' },
    { platform: 'whatsapp', label: 'WhatsApp', url: 'https://whatsapp.com/channel/goreadpost' },
    { platform: 'telegram', label: 'Telegram', url: 'https://t.me/goreadpost' },
    { platform: 'rss', label: 'RSS Feed', url: '/#feed' }
  ],
  directChannels: {
    enabled: false,
    title: '',
    description: '',
    items: []
  },
  columns: [
    {
      title: 'PUBLICATIONS',
      links: [
        { label: 'Startups & Funding', url: '/category/startups', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'DeepTech & AI', url: '/category/technology', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Founder Stories', url: '/category/startups', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Video Shows (YSTV)', url: '/videos', badge: '', badgeColor: '', openInNewTab: false }
      ]
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', url: '/about', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Editorial Team', url: '/editorial-team', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Careers', url: '/careers', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Pitch Story', url: '/pitch', badge: '', badgeColor: '', openInNewTab: false }
      ]
    },
    {
      title: 'LEGAL & COMPLIANCE',
      links: [
        { label: 'Privacy Policy', url: '/privacy', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Terms of Service', url: '/terms', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Disclaimer', url: '/disclaimer', badge: '', badgeColor: '', openInNewTab: false }
      ]
    }
  ]
};

export default function AdminFooterView({ onShowToast }) {
  const [footer, setFooter] = useState(DEFAULT_CMS_FOOTER);

  const [activeTab, setActiveTab] = useState('columns');
  const [columnFilter, setColumnFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteColumnModal, setDeleteColumnModal] = useState(null);

  useEffect(() => {
    loadFooter();
  }, []);

  const loadFooter = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FooterService.getAdminFooter();
      if (data) {
        setFooter({
          ...DEFAULT_CMS_FOOTER,
          ...data,
          columns: Array.isArray(data.columns)
            ? data.columns.filter(c => !c.title || !c.title.toUpperCase().includes('CHANNEL'))
            : DEFAULT_CMS_FOOTER.columns,
          socialLinks: normalizeSocialArray(data.socialLinks)
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      await FooterService.updateFooter(footer);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      if (onShowToast) onShowToast('Footer CMS updated successfully and live!');
    } catch (err) {
      setError(err.message || 'Failed to save footer settings');
    } finally {
      setSaving(false);
    }
  };

  // Column operations
  const addColumn = () => {
    setFooter(prev => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          title: 'New Column',
          links: [{ label: 'New Link', url: '/', badge: '', badgeColor: '', openInNewTab: false }]
        }
      ]
    }));
  };

  const requestDeleteColumn = (index) => {
    const col = footer.columns[index];
    if (!col) return;
    setDeleteColumnModal({
      index,
      title: col.title || `Column ${index + 1}`,
      linkCount: col.links?.length || 0
    });
  };

  const confirmDeleteColumn = async () => {
    if (!deleteColumnModal) return;
    const { index, title } = deleteColumnModal;
    const updatedCols = footer.columns.filter((_, i) => i !== index);
    const updatedFooter = {
      ...footer,
      columns: updatedCols
    };
    setFooter(updatedFooter);
    setColumnFilter('all');
    setDeleteColumnModal(null);

    try {
      await FooterService.updateFooter(updatedFooter);
      if (onShowToast) onShowToast(`Deleted column "${title}" and saved!`);
    } catch (err) {
      console.warn('Auto-save column delete error:', err);
    }
  };

  const moveColumn = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= footer.columns.length) return;
    setFooter(prev => {
      const cols = [...prev.columns];
      const temp = cols[index];
      cols[index] = cols[targetIdx];
      cols[targetIdx] = temp;
      return { ...prev, columns: cols };
    });
  };

  const updateColumnTitle = (index, title) => {
    setFooter(prev => {
      const updated = [...prev.columns];
      updated[index] = { ...updated[index], title };
      return { ...prev, columns: updated };
    });
  };

  const addLinkToColumn = (colIdx) => {
    setFooter(prev => {
      const updated = [...prev.columns];
      const links = [
        ...(updated[colIdx].links || []),
        { label: 'New Link', url: '/', badge: '', badgeColor: '', openInNewTab: false }
      ];
      updated[colIdx] = { ...updated[colIdx], links };
      return { ...prev, columns: updated };
    });
  };

  const updateColumnLink = (colIdx, linkIdx, field, value) => {
    setFooter(prev => {
      const updated = [...prev.columns];
      const links = [...updated[colIdx].links];
      links[linkIdx] = { ...links[linkIdx], [field]: value };
      updated[colIdx] = { ...updated[colIdx], links };
      return { ...prev, columns: updated };
    });
  };

  const removeColumnLink = async (colIdx, linkIdx) => {
    const col = footer.columns[colIdx];
    const targetLink = col?.links?.[linkIdx];
    const linkName = targetLink?.label || `Link ${linkIdx + 1}`;

    const updated = [...footer.columns];
    const links = (updated[colIdx].links || []).filter((_, i) => i !== linkIdx);
    updated[colIdx] = { ...updated[colIdx], links };
    const updatedFooter = { ...footer, columns: updated };
    setFooter(updatedFooter);

    try {
      await FooterService.updateFooter(updatedFooter);
      if (onShowToast) onShowToast(`Removed link "${linkName}" and saved!`);
    } catch (err) {
      console.warn('Auto-save link delete error:', err);
    }
  };

  // Dynamic Social Links operations
  const addSocialLink = (presetId = 'telegram') => {
    const found = SOCIAL_PLATFORM_PRESETS.find(p => p.id === presetId) || SOCIAL_PLATFORM_PRESETS[0];
    setFooter(prev => {
      const currentList = Array.isArray(prev.socialLinks)
        ? [...prev.socialLinks]
        : [...normalizeSocialArray(prev.socialLinks)];
      return {
        ...prev,
        socialLinks: [
          ...currentList,
          {
            platform: found.id,
            label: found.label,
            url: found.defaultUrl
          }
        ]
      };
    });
  };

  const updateSocialLink = (index, field, value) => {
    setFooter(prev => {
      const currentList = Array.isArray(prev.socialLinks)
        ? [...prev.socialLinks]
        : [...normalizeSocialArray(prev.socialLinks)];
      const item = { ...currentList[index] };
      if (field === 'platform') {
        const found = SOCIAL_PLATFORM_PRESETS.find(p => p.id === value);
        item.platform = value;
        const isPresetLabel = SOCIAL_PLATFORM_PRESETS.some(p => p.label === item.label);
        if (!item.label || isPresetLabel) {
          item.label = found ? found.label : (value.charAt(0).toUpperCase() + value.slice(1));
        }
        if (!item.url || item.url === 'https://' || SOCIAL_PLATFORM_PRESETS.some(p => p.defaultUrl === item.url)) {
          item.url = found ? found.defaultUrl : 'https://';
        }
      } else {
        item[field] = value;
      }
      currentList[index] = item;
      return { ...prev, socialLinks: currentList };
    });
  };

  const removeSocialLink = async (index) => {
    const currentList = Array.isArray(footer.socialLinks)
      ? [...footer.socialLinks]
      : [...normalizeSocialArray(footer.socialLinks)];
    const targetLabel = currentList[index]?.label || 'Social Link';
    const updatedSocial = currentList.filter((_, i) => i !== index);
    const updatedFooter = {
      ...footer,
      socialLinks: updatedSocial
    };
    setFooter(updatedFooter);

    try {
      await FooterService.updateFooter(updatedFooter);
      if (onShowToast) onShowToast(`Removed "${targetLabel}" and saved!`);
    } catch (err) {
      console.warn('Auto-save social delete error:', err);
    }
  };

  const moveSocialLink = (index, direction) => {
    const targetIdx = index + direction;
    setFooter(prev => {
      const list = Array.isArray(prev.socialLinks)
        ? [...prev.socialLinks]
        : [...normalizeSocialArray(prev.socialLinks)];
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, socialLinks: list };
    });
  };



  if (loading) {
    return (
      <div className="afv-loading-box" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={26} style={{ margin: '0 auto 12px' }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading footer CMS data...</span>
      </div>
    );
  }

  return (
    <div className="afv-container" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
      

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          fontSize: '0.9rem',
          border: '1px solid #fecaca'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color, #e2e8f0)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'columns', label: 'Navigation Columns', icon: Globe },
          { id: 'brand', label: 'Brand & Mission Manifesto', icon: Layers },
          { id: 'livedesk', label: 'Live Desk & Bureaus', icon: MapPin },
          { id: 'social', label: 'Social Networks', icon: Share2 },
          { id: 'bottom', label: 'Bottom Bar & Meta', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: isActive ? '750' : '600',
                color: isActive ? 'var(--brand-primary, #ea580c)' : 'var(--text-secondary, #64748b)',
                borderBottom: isActive ? '2px solid var(--brand-primary, #ea580c)' : '2px solid transparent',
                fontSize: '0.9rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: NAVIGATION COLUMNS */}
      {activeTab === 'columns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Column Filter Bar & Add Column */}
          {footer.columns.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', background: 'var(--card-bg, #ffffff)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Quick Filter:</span>
              <button
                type="button"
                onClick={() => setColumnFilter('all')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: columnFilter === 'all' ? 700 : 500,
                  background: columnFilter === 'all' ? 'var(--brand-primary, #ea580c)' : '#f1f5f9',
                  color: columnFilter === 'all' ? '#ffffff' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All Columns ({footer.columns.length})
              </button>
              {footer.columns.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setColumnFilter(idx)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: columnFilter === idx ? 700 : 500,
                    background: columnFilter === idx ? 'var(--brand-primary, #ea580c)' : '#f1f5f9',
                    color: columnFilter === idx ? '#ffffff' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.title || `Column ${idx + 1}`} ({c.links?.length || 0})
                </button>
              ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={addColumn}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    background: '#0f172a',
                    color: '#fff',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.15)'
                  }}
                >
                  <Plus size={14} />
                  <span>Add Column</span>
                </button>

                <button 
                  type="button" 
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    background: savedSuccess ? '#10b981' : 'var(--brand-primary, #ea580c)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 4px rgba(234, 88, 12, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      <span>Saving...</span>
                    </>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Footer Configuration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Columns Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: columnFilter !== 'all' 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(360px, 1fr))', 
            gap: '1.25rem',
            alignItems: 'start'
          }}>
            {(columnFilter === 'all' || !footer.columns[columnFilter]
              ? footer.columns.map((col, idx) => ({ col, cIdx: idx }))
              : [{ col: footer.columns[columnFilter], cIdx: columnFilter }]
            ).map(({ col, cIdx }) => (
              <div 
                key={cIdx} 
                style={{
                  background: 'var(--card-bg, #ffffff)',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Column Header & Reorder Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid var(--border-color, #f1f5f9)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <input
                      type="text"
                      value={col.title}
                      onChange={e => updateColumnTitle(cIdx, e.target.value)}
                      placeholder="Column Title"
                      style={{
                        flex: 1,
                        fontWeight: 750,
                        fontSize: '0.98rem',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: 'var(--text-primary)',
                        background: '#ffffff'
                      }}
                    />
                    <span style={{ 
                      fontSize: '0.72rem', 
                      background: '#f1f5f9', 
                      color: '#475569', 
                      padding: '3px 8px', 
                      borderRadius: '12px', 
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}>
                      {col.links?.length || 0} links
                    </span>
                  </div>

                  {/* Reorder & Delete Column Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => moveColumn(cIdx, -1)}
                      disabled={cIdx === 0}
                      style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '6px', 
                        padding: '5px 7px', 
                        cursor: cIdx === 0 ? 'not-allowed' : 'pointer', 
                        color: cIdx === 0 ? '#cbd5e1' : '#475569' 
                      }}
                      title="Move Column Left"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveColumn(cIdx, 1)}
                      disabled={cIdx === footer.columns.length - 1}
                      style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '6px', 
                        padding: '5px 7px', 
                        cursor: cIdx === footer.columns.length - 1 ? 'not-allowed' : 'pointer', 
                        color: cIdx === footer.columns.length - 1 ? '#cbd5e1' : '#475569' 
                      }}
                      title="Move Column Right"
                    >
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteColumn(cIdx)}
                      style={{ 
                        background: '#fef2f2', 
                        color: '#dc2626', 
                        border: '1px solid #fecaca', 
                        borderRadius: '6px', 
                        padding: '5px 7px', 
                        cursor: 'pointer' 
                      }}
                      title="Delete Column"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Column Links List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(col.links || []).length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                      No links in this column. Click "+ Add Link" below.
                    </div>
                  ) : (
                    (col.links || []).map((lnk, lIdx) => (
                      <div 
                        key={lIdx} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Index Number */}
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          color: '#64748b', 
                          background: '#f1f5f9', 
                          borderRadius: '4px', 
                          padding: '3px 6px',
                          minWidth: '20px',
                          textAlign: 'center',
                          userSelect: 'none',
                          flexShrink: 0
                        }}>
                          {lIdx + 1}
                        </span>

                        {/* Name (Link Label) */}
                        <input
                          type="text"
                          placeholder="Name"
                          value={lnk.label}
                          onChange={e => updateColumnLink(cIdx, lIdx, 'label', e.target.value)}
                          style={{
                            flex: 1.2,
                            minWidth: 0,
                            padding: '6px 8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '5px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            background: '#ffffff',
                            color: 'var(--text-primary)'
                          }}
                          title="Link Name"
                        />

                        {/* Slug (URL) */}
                        <input
                          type="text"
                          placeholder="Slug / URL"
                          value={lnk.url}
                          onChange={e => updateColumnLink(cIdx, lIdx, 'url', e.target.value)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '6px 8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '5px',
                            fontSize: '0.8rem',
                            background: '#ffffff',
                            color: '#2563eb',
                            fontFamily: 'monospace'
                          }}
                          title="Slug / URL"
                        />

                        {/* Badge text & Color */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                          <input
                            type="text"
                            placeholder="Badge"
                            value={lnk.badge || ''}
                            onChange={e => updateColumnLink(cIdx, lIdx, 'badge', e.target.value)}
                            style={{
                              width: '56px',
                              padding: '5px 4px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#ffffff',
                              color: '#334155',
                              textAlign: 'center'
                            }}
                            title="Badge text (optional, e.g. HOT)"
                          />

                          <input
                            type="color"
                            value={lnk.badgeColor || '#dc2626'}
                            onChange={e => updateColumnLink(cIdx, lIdx, 'badgeColor', e.target.value)}
                            style={{
                              width: '22px',
                              height: '24px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              padding: 0,
                              background: 'none',
                              flexShrink: 0
                            }}
                            title="Badge Color"
                          />

                          {Boolean(lnk.badge) && (
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 5px',
                              borderRadius: '3px',
                              background: lnk.badgeColor || '#dc2626',
                              color: '#ffffff',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              flexShrink: 0
                            }}>
                              {lnk.badge}
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeColumnLink(cIdx, lIdx)}
                          style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                          title="Remove Link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Link Button */}
                <button
                  type="button"
                  onClick={() => addLinkToColumn(cIdx)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    color: 'var(--brand-primary, #ea580c)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#fff7ed';
                    e.currentTarget.style.borderColor = 'var(--brand-primary, #ea580c)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  <Plus size={14} />
                  <span>Add Link to this Column</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BRAND, MISSION & CTA */}
      {activeTab === 'brand' && (
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Brand &amp; Mission Manifesto</h3>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                background: savedSuccess ? '#10b981' : 'var(--brand-primary, #ea580c)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px rgba(234, 88, 12, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {saving ? <RefreshCw className="animate-spin" size={13} /> : savedSuccess ? <CheckCircle size={13} /> : <Save size={13} />}
              <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Footer Configuration'}</span>
            </button>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Footer Mission Manifesto / About Statement *
            </label>
            <textarea
              rows={4}
              value={footer.aboutText}
              onChange={e => setFooter({ ...footer, aboutText: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}
              placeholder="The premier digital journalism network chronicling breakthrough founders..."
            />
          </div>



          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Editorial Integrity Trust Badge Text
            </label>
            <input
              type="text"
              value={footer.trustBadgeText || ''}
              onChange={e => setFooter({ ...footer, trustBadgeText: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              placeholder="100% Independent Editorial Integrity"
            />
          </div>
        </div>
      )}

      {/* TAB 3: LIVE DESK & BUREAUS */}
      {activeTab === 'livedesk' && (
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Live Desk &amp; Bureaus</h3>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                background: savedSuccess ? '#10b981' : 'var(--brand-primary, #ea580c)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px rgba(234, 88, 12, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {saving ? <RefreshCw className="animate-spin" size={13} /> : savedSuccess ? <CheckCircle size={13} /> : <Save size={13} />}
              <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Footer Configuration'}</span>
            </button>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Live Desk Status Label *
            </label>
            <input
              type="text"
              value={footer.liveDeskText || ''}
              onChange={e => setFooter({ ...footer, liveDeskText: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 750 }}
              placeholder="LIVE DESK"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Bureau Locations String (Separated by • bullet) *
            </label>
            <input
              type="text"
              value={footer.liveDeskLocations || ''}
              onChange={e => setFooter({ ...footer, liveDeskLocations: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}
              placeholder="Bengaluru • New Delhi • San Francisco • Singapore"
            />
          </div>
        </div>
      )}



      {/* TAB 5: SOCIAL NETWORKS */}
      {activeTab === 'social' && (
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Official Social Networks &amp; Feeds
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                Add, customize, reorder, or delete social channel buttons displayed in the footer utility bar.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => addSocialLink('telegram')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                <span>+ Telegram</span>
              </button>
              <button
                type="button"
                onClick={() => addSocialLink('whatsapp')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                <span>+ WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => addSocialLink('custom')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                <span>Add Social Link</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  background: savedSuccess ? '#10b981' : 'var(--brand-primary, #ea580c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 4px rgba(234, 88, 12, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {saving ? <RefreshCw className="animate-spin" size={13} /> : savedSuccess ? <CheckCircle size={13} /> : <Save size={13} />}
                <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Footer Configuration'}</span>
              </button>
            </div>
          </div>

          {/* Social Links List */}
          {(!Array.isArray(footer.socialLinks) || footer.socialLinks.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
              <Share2 size={32} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#334155', marginBottom: '4px' }}>No Social Links Configured</div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px' }}>Click the buttons above to add Telegram, WhatsApp, Twitter, or any other social channel.</p>
              <button
                type="button"
                onClick={() => addSocialLink('twitter')}
                style={{ padding: '7px 16px', background: 'var(--brand-primary, #ea580c)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Twitter / X
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {footer.socialLinks.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 200px 1fr auto auto',
                    gap: '12px',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {/* Reorder handles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSocialLink(idx, -1)}
                      title="Move up"
                      style={{ background: 'transparent', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 0.7, padding: 0 }}
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === footer.socialLinks.length - 1}
                      onClick={() => moveSocialLink(idx, 1)}
                      title="Move down"
                      style={{ background: 'transparent', border: 'none', cursor: idx === footer.socialLinks.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === footer.socialLinks.length - 1 ? 0.3 : 0.7, padding: 0 }}
                    >
                      <MoveDown size={13} />
                    </button>
                  </div>

                  {/* Platform dropdown */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>Platform</label>
                    <select
                      value={item.platform || 'custom'}
                      onChange={e => updateSocialLink(idx, 'platform', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, background: '#fff' }}
                    >
                      {SOCIAL_PLATFORM_PRESETS.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Target URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>Destination URL / Link</label>
                    <input
                      type="text"
                      value={item.url || ''}
                      onChange={e => updateSocialLink(idx, 'url', e.target.value)}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                    />
                  </div>

                  {/* Test link */}
                  {item.url && item.url.startsWith('http') ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open link in new tab"
                      style={{ color: '#64748b', padding: '6px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  ) : <div style={{ width: '28px' }} />}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => removeSocialLink(idx)}
                    title="Delete this social link"
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 6: BOTTOM BAR & META */}
      {activeTab === 'bottom' && (
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Bottom Bar &amp; Meta Notice</h3>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                background: savedSuccess ? '#10b981' : 'var(--brand-primary, #ea580c)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px rgba(234, 88, 12, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {saving ? <RefreshCw className="animate-spin" size={13} /> : savedSuccess ? <CheckCircle size={13} /> : <Save size={13} />}
              <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Footer Configuration'}</span>
            </button>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Legal Copyright Notice Line *
            </label>
            <input
              type="text"
              value={footer.copyrightText || ''}
              onChange={e => setFooter({ ...footer, copyrightText: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              placeholder="© 2026 GoReadPost Media Technologies Pvt. Ltd. All rights reserved."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Community Footer Tagline
              </label>
              <input
                type="text"
                value={footer.bottomCommunityTag || ''}
                onChange={e => setFooter({ ...footer, bottomCommunityTag: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                placeholder="Built with precision for the global builder community"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Edition &amp; Language Selector Text
              </label>
              <input
                type="text"
                value={footer.bottomEditionText || ''}
                onChange={e => setFooter({ ...footer, bottomEditionText: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                placeholder="Global Edition (English)"
              />
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRM DELETE COLUMN MODAL */}
      {deleteColumnModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '450px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Delete Footer Column?
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Permanent removal from Footer CMS
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to delete column <strong>"{deleteColumnModal.title}"</strong> ({deleteColumnModal.linkCount} links)?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteColumnModal(null)}
                style={{
                  padding: '9px 16px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteColumn}
                style={{
                  padding: '9px 20px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                }}
              >
                Yes, Delete Column
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
