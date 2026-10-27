import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, ArrowDown, Eye, EyeOff, Save, RefreshCw, 
  AlertCircle, CheckCircle, X, Search, FileText, ArrowLeft,
  ExternalLink, Sparkles, Zap, Flame, Mail, LayoutGrid, Check
} from 'lucide-react';
import { HomepageService } from '../../services/homepageService';
import { ArticleService } from '../../services/articleService';
import { PageService } from '../../services/pageService';
import LiveSectionEditor from './LiveSectionEditor';
import LiveHomepageStudio from './LiveHomepageStudio';
import { ALL_STORIES } from '../../data/storiesData';

const SECTION_META = {
  hero_popular: {
    label: 'Hero Slider & Popular Posts',
    icon: Flame,
    color: '#dc2626',
    bg: '#ffe4e6',
    defaultDesc: 'Primary hero editorial slider (left) and top 5 ranked articles sidebar (right).'
  },
  latest_blogs: {
    label: 'Latest from the Blog',
    icon: LayoutGrid,
    color: '#2563eb',
    bg: '#dbeafe',
    defaultDesc: 'Full-width grid showing newest articles and breaking ecosystem stories.'
  },
  trending: {
    label: 'Trending Now',
    icon: Sparkles,
    color: '#d97706',
    bg: '#fef3c7',
    defaultDesc: 'High-velocity stories capturing builder attention and social virality.'
  },
  popular_editors: {
    label: "Most Popular & Editor's Picks",
    icon: CheckCircle,
    color: '#059669',
    bg: '#d1fae5',
    defaultDesc: 'Curated editorial picks with an "Editor\'s Choice" highlight badge.'
  },
  spotlight: {
    label: 'Tech & Startup Spotlight',
    icon: Zap,
    color: '#7c3aed',
    bg: '#ede9fe',
    defaultDesc: 'Focus on deep tech breakthroughs, artificial intelligence, and new ventures.'
  },
  newsletter: {
    label: 'Newsletter Subscription Banner',
    icon: Mail,
    color: '#db2777',
    bg: '#fce7f3',
    defaultDesc: 'Full-width newsletter opt-in banner driving reader subscriptions.'
  }
};

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories (Dynamic)' },
  { value: 'Startups', label: 'Startups & Ecosystem' },
  { value: 'Technology', label: 'Technology & Cloud' },
  { value: 'AI', label: 'AI & DeepTech' },
  { value: 'Enterprise', label: 'Enterprise & SaaS' },
  { value: 'FinTech', label: 'FinTech & Web3' },
  { value: 'HerStory', label: 'HerStory (Women Leaders)' },
  { value: 'SMBStory', label: 'SMBStory (MSME & D2C)' },
  { value: 'SocialStory', label: 'SocialStory (Impact)' },
  { value: 'Hindi', label: 'YS Hindi Edition' }
];

export default function AdminHomepageView({ onShowToast, onNavigate }) {
  const [sections, setSections] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Modal to select articles for a section
  const [selectedSectionForArticles, setSelectedSectionForArticles] = useState(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [liveEditingHomepageSec, setLiveEditingHomepageSec] = useState(null);
  const [isWholeHomeStudioOpen, setIsWholeHomeStudioOpen] = useState(() => {
    return typeof window !== 'undefined' && (
      window.location.search.includes('studio=true') || 
      window.location.search.includes('liveStudio=true') ||
      window.location.pathname.includes('/studio')
    );
  });

  useEffect(() => {
    if (
      window.location.search.includes('studio=true') || 
      window.location.search.includes('liveStudio=true') ||
      window.location.pathname.includes('/studio')
    ) {
      setIsWholeHomeStudioOpen(true);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [secData, artRes] = await Promise.all([
        HomepageService.getAdminSections(),
        ArticleService.getArticles({ limit: 150 })
      ]);
      setSections(Array.isArray(secData) ? secData : []);
      setAllArticles(artRes?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (index) => {
    setSections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], enabled: !updated[index].enabled };
      return updated;
    });
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    setSections(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated.map((sec, i) => ({ ...sec, order: i + 1 }));
    });
  };

  const handleChange = (index, field, value) => {
    setSections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCustomConfigChange = (index, field, value) => {
    setSections(prev => {
      const updated = [...prev];
      const cfg = { ...(updated[index].customConfig || {}), [field]: value };
      updated[index] = { ...updated[index], customConfig: cfg };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await HomepageService.updateSections(sections);

      // Keep Page 'home' synchronized so section counts match in Pages list
      try {
        const pageSections = sections.map((s, idx) => ({
          id: s.sectionKey || `sec_${idx}`,
          type: s.sectionKey === 'hero_popular' ? 'hero' : s.sectionKey === 'newsletter' ? 'cta' : 'stories_feed',
          order: s.order || idx + 1,
          enabled: s.enabled !== false,
          data: {
            title: s.title,
            subtitle: s.subtitle,
            limit: s.limit
          }
        }));
        await PageService.updatePage('home', {
          title: 'Homepage',
          sections: pageSections
        });
      } catch (e) {
        // Page model sync fallback
      }

      if (onShowToast) onShowToast('Homepage configuration saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save homepage layout');
      if (onShowToast) onShowToast(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Article selection modal logic
  const openArticleSelector = (sec) => {
    setSelectedSectionForArticles(sec);
    setArticleSearch('');
  };

  const toggleArticleSelection = (articleId) => {
    if (!selectedSectionForArticles) return;

    setSections(prev => {
      return prev.map(sec => {
        if (sec.sectionKey === selectedSectionForArticles.sectionKey) {
          const currentIds = (sec.articleIds || []).map(a => (typeof a === 'object' ? a._id : a));
          const exists = currentIds.includes(articleId);
          const newIds = exists ? currentIds.filter(id => id !== articleId) : [...currentIds, articleId];
          return { ...sec, articleIds: newIds };
        }
        return sec;
      });
    });

    setSelectedSectionForArticles(prev => {
      if (!prev) return null;
      const currentIds = (prev.articleIds || []).map(a => (typeof a === 'object' ? a._id : a));
      const exists = currentIds.includes(articleId);
      const newIds = exists ? currentIds.filter(id => id !== articleId) : [...currentIds, articleId];
      return { ...prev, articleIds: newIds };
    });
  };

  const filteredArticles = allArticles.filter(a =>
    a.title?.toLowerCase().includes(articleSearch.toLowerCase()) ||
    a.categoryName?.toLowerCase().includes(articleSearch.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* ── Top Header Navigation ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-color, #e2e8f0)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/admin/pages')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Pages</span>
            </button>
          )}

          <div>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              Homepage Layout &amp; Content Studio
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
              Reorder feed sections, toggle visibility, customize headlines, and curate featured stories on your live homepage.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsWholeHomeStudioOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 800,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(234, 88, 12, 0.4)'
            }}
            title="Launch Visual WYSIWYG Whole Homepage Live Studio"
          >
            <Sparkles size={15} fill="#ffffff" color="#ffffff" />
            <span>⚡ Whole Homepage Live Studio</span>
          </button>

          <button
            onClick={() => window.open('/', '_blank')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 650,
              color: '#334155',
              cursor: 'pointer'
            }}
            title="View public homepage in new tab"
          >
            <ExternalLink size={14} />
            <span>Preview Live Site</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('/admin/pages/home/edit')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 650,
                color: '#475569',
                cursor: 'pointer'
              }}
              title="Edit homepage SEO and metadata in Page Editor"
            >
              <FileText size={14} />
              <span>SEO &amp; Meta</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
          <div>Loading homepage configuration...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sections.map((sec, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === sections.length - 1;
            const currentIds = (sec.articleIds || []).map(a => (typeof a === 'object' ? a._id : a));
            const meta = SECTION_META[sec.sectionKey] || {
              label: sec.title || 'Section',
              icon: LayoutGrid,
              color: '#475569',
              bg: '#f1f5f9',
              defaultDesc: 'Homepage feed section'
            };
            const IconComponent = meta.icon;

            return (
              <div
                key={sec.sectionKey || idx}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: sec.enabled ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                  opacity: sec.enabled ? 1 : 0.65,
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* ── Top Bar of Section Card ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  
                  {/* Left Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={isFirst}
                        style={{ padding: '3px 5px', border: '1px solid #e2e8f0', background: isFirst ? '#f8fafc' : '#fff', borderRadius: '4px', cursor: isFirst ? 'not-allowed' : 'pointer' }}
                        title="Move Section Up"
                      >
                        <ArrowUp size={13} color={isFirst ? '#cbd5e1' : '#334155'} />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={isLast}
                        style={{ padding: '3px 5px', border: '1px solid #e2e8f0', background: isLast ? '#f8fafc' : '#fff', borderRadius: '4px', cursor: isLast ? 'not-allowed' : 'pointer' }}
                        title="Move Section Down"
                      >
                        <ArrowDown size={13} color={isLast ? '#cbd5e1' : '#334155'} />
                      </button>
                    </div>

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: meta.bg,
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      <IconComponent size={18} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>
                          ORDER #{idx + 1}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        {meta.defaultDesc}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Only admin can hide or show, except banner section which has Live Edit */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {sec.sectionKey === 'hero_popular' && (
                      <button
                        type="button"
                        onClick={() => setLiveEditingHomepageSec({
                          id: sec.sectionKey,
                          type: 'hero',
                          enabled: sec.enabled !== false,
                          data: {
                            title: sec.title,
                            heading: sec.title,
                            subtitle: sec.subtitle,
                            category: sec.category,
                            limit: sec.limit,
                            articleIds: (sec.articleIds || []).map(a => typeof a === 'object' ? a._id : a),
                            ...(sec.customConfig || {})
                          }
                        })}
                        style={{
                          padding: '7px 12px',
                          background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 750,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)'
                        }}
                        title={`Open Live Visual Editor for "${meta.label}"`}
                      >
                        <Sparkles size={14} />
                        <span>Live Edit</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggle(idx)}
                      style={{
                        padding: '7px 14px',
                        background: sec.enabled ? '#ecfdf5' : '#f1f5f9',
                        color: sec.enabled ? '#059669' : '#64748b',
                        border: sec.enabled ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title={sec.enabled ? 'Click to hide this section' : 'Click to show this section'}
                    >
                      {sec.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
                      <span>{sec.enabled ? 'Live on Site' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>

                {/* ── Form Inputs for Section: Only for Hero Banner Section ── */}
                {sec.sectionKey === 'hero_popular' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                        Section Display Title
                      </label>
                      <input
                        type="text"
                        value={sec.title || ''}
                        onChange={e => handleChange(idx, 'title', e.target.value)}
                        placeholder="e.g. Lead Stories & Editorial Hero Slider"
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                        Subtitle / Brief Note
                      </label>
                      <input
                        type="text"
                        value={sec.subtitle || ''}
                        onChange={e => handleChange(idx, 'subtitle', e.target.value)}
                        placeholder="Optional subtitle or tagline"
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Article Selector Modal */}
      {selectedSectionForArticles && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Select Stories for "{selectedSectionForArticles.title}"</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Check the stories you want to pin into this section. Uncheck all to auto-query dynamically.</p>
              </div>
              <button onClick={() => setSelectedSectionForArticles(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search articles by title, author, or category..."
                  value={articleSearch}
                  onChange={e => setArticleSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredArticles.map(art => {
                const currentIds = (selectedSectionForArticles.articleIds || []).map(a => (typeof a === 'object' ? a._id : a));
                const isSelected = currentIds.includes(art._id);

                return (
                  <div
                    key={art._id}
                    onClick={() => toggleArticleSelection(art._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px',
                      border: isSelected ? '1px solid #dc2626' : '1px solid #e2e8f0',
                      background: isSelected ? '#fff1f2' : '#fff', cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', accentColor: '#dc2626' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{art.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{art.categoryName || 'General'} • {art.authorName || 'Desk'}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {(selectedSectionForArticles.articleIds || []).length} stories selected
              </span>
              <button
                onClick={() => setSelectedSectionForArticles(null)}
                style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Visual WYSIWYG Editor Modal */}
      {liveEditingHomepageSec && (
        <LiveSectionEditor
          section={liveEditingHomepageSec}
          isOpen={Boolean(liveEditingHomepageSec)}
          pageId="home"
          onClose={() => setLiveEditingHomepageSec(null)}
          onAutoSave={async (updatedData) => {
            const updatedSections = sections.map(s => {
              if (s.sectionKey === liveEditingHomepageSec.id) {
                return {
                  ...s,
                  title: updatedData.title || updatedData.heading || s.title,
                  subtitle: updatedData.subtitle || s.subtitle,
                  category: updatedData.category !== undefined ? updatedData.category : s.category,
                  limit: updatedData.limit || s.limit,
                  articleIds: Array.isArray(updatedData.articleIds) ? updatedData.articleIds : s.articleIds,
                  customConfig: {
                    ...(s.customConfig || {}),
                    ...(updatedData || {})
                  }
                };
              }
              return s;
            });
            setSections(updatedSections);
            try {
              await HomepageService.updateSections(updatedSections);
            } catch (err) {
              console.error('Failed to auto-save homepage section:', err);
            }
          }}
          onSave={async (updatedData) => {
            const updatedSections = sections.map(s => {
              if (s.sectionKey === liveEditingHomepageSec.id) {
                return {
                  ...s,
                  title: updatedData.title || updatedData.heading || s.title,
                  subtitle: updatedData.subtitle || s.subtitle,
                  category: updatedData.category !== undefined ? updatedData.category : s.category,
                  limit: updatedData.limit || s.limit,
                  articleIds: Array.isArray(updatedData.articleIds) ? updatedData.articleIds : s.articleIds,
                  customConfig: {
                    ...(s.customConfig || {}),
                    ...(updatedData || {})
                  }
                };
              }
              return s;
            });
            setSections(updatedSections);
            setLiveEditingHomepageSec(null);
            try {
              await HomepageService.updateSections(updatedSections);
              onShowToast?.(`Section "${updatedData.title || updatedData.heading || liveEditingHomepageSec.id}" saved and published live!`);
            } catch (err) {
              console.error('Failed to save homepage section:', err);
              onShowToast?.('Failed to save section changes.');
            }
          }}
          stories={allArticles.length > 0 ? allArticles : ALL_STORIES}
        />
      )}

      {/* ── WHOLE HOMEPAGE VISUAL LIVE STUDIO ── */}
      {isWholeHomeStudioOpen && (
        <LiveHomepageStudio
          isOpen={isWholeHomeStudioOpen}
          initialSections={sections}
          stories={allArticles.length > 0 ? allArticles : ALL_STORIES}
          onClose={() => {
            setIsWholeHomeStudioOpen(false);
            if (typeof window !== 'undefined' && (window.location.search.includes('studio=true') || window.location.search.includes('liveStudio=true'))) {
              window.history.replaceState(null, '', '/admin/homepage');
            }
          }}
          onSaveSuccess={(updated) => {
            if (updated) setSections(updated);
            loadData();
            onShowToast?.('Whole homepage layout and articles permanently saved live!');
          }}
        />
      )}
    </div>
  );
}
