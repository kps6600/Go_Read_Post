import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Sparkles, Plus, Trash2, 
  ArrowRight, ArrowLeft, ChevronLeft, ChevronRight,
  Monitor, Smartphone, ArrowUp, ArrowDown,
  Search, RefreshCw, Layers, Eye, EyeOff,
  Edit2, Edit3, Image as ImageIcon, Type,
  Mail, Bookmark, Zap, CheckCircle, LayoutGrid
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { ALL_STORIES, TOP_PICKS, SPOTLIGHT_STORIES } from '../../data/storiesData';
import LiveBannerEditor from './LiveBannerEditor';
import './LiveSectionEditor.css';
import '../ModernHomepage.css';
import '../LatestArticlesPage.css';

const CATEGORY_CHOICES = [
  { value: '', label: 'All Categories (Dynamic Feed)' },
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

export default function LiveSectionEditor({
  section,
  isOpen,
  onClose,
  onSave,
  onAutoSave = null,
  stories = [],
  pageId = null
}) {
  if (!isOpen || !section) return null;

  // Delegate Hero sections directly to specialized LiveBannerEditor
  const isHero = section.type === 'hero' || section.type === 'hero_popular' || section.id === 'hero_popular' || (section.type || '').toLowerCase().includes('hero');
  if (isHero) {
    return (
      <LiveBannerEditor
        section={section}
        isOpen={isOpen}
        onClose={onClose}
        onSave={onSave}
        onAutoSave={onAutoSave}
        stories={stories}
        pageId={pageId}
      />
    );
  }

  return (
    <LiveGenericSectionStudio
      section={section}
      onClose={onClose}
      onSave={onSave}
      onAutoSave={onAutoSave}
      stories={stories}
      pageId={pageId}
    />
  );
}

function LiveGenericSectionStudio({
  section,
  onClose,
  onSave,
  onAutoSave,
  stories = [],
  pageId = null
}) {
  const [data, setData] = useState(() => section?.data || {});
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'mobile'
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [availableArticles, setAvailableArticles] = useState(() => {
    if (stories && stories.length > 0) return stories;
    return ALL_STORIES;
  });

  // Modal Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // { type: 'add' | 'replace', index?: number }
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  // Quick Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Sync data on section change
  useEffect(() => {
    if (section?.data) {
      setData({ ...section.data });
    }
  }, [section]);

  // Load published articles from database on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLiveArticles = async () => {
      try {
        const res = await ArticleService.getArticles({ limit: 150 });
        const list = Array.isArray(res?.data) ? res.data : [];
        if (isMounted) {
          if (list.length > 0) setAvailableArticles(list);
          else setAvailableArticles(stories.length ? stories : ALL_STORIES);
        }
      } catch (e) {
        if (isMounted && (!availableArticles || availableArticles.length === 0)) {
          setAvailableArticles(ALL_STORIES);
        }
      }
    };
    fetchLiveArticles();
    return () => { isMounted = false; };
  }, []);

  const pool = useMemo(() => {
    return availableArticles.length > 0 ? availableArticles : ALL_STORIES;
  }, [availableArticles]);

  // Filtered articles in Picker
  const filteredPickerArticles = useMemo(() => {
    return pool.filter(a => {
      const title = (a.title || '').toLowerCase();
      const cat = (a.categoryLabel || a.category || '').toLowerCase();
      const author = (typeof a.author === 'object' && a.author ? a.author.name || '' : (a.author || '')).toLowerCase();
      const q = pickerSearch.trim().toLowerCase();

      const matchesSearch = !q || title.includes(q) || cat.includes(q) || author.includes(q);
      const matchesCat = pickerCategory === 'All' || cat.includes(pickerCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [pool, pickerSearch, pickerCategory]);

  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    pool.forEach(a => {
      const c = a.categoryLabel || a.category;
      if (c && typeof c === 'string') cats.add(c.trim());
    });
    return Array.from(cats).slice(0, 10);
  }, [pool]);

  // ─────────────────────────────────────────────────────────
  // INSTANT AUTO-SAVE PERSISTENCE TO DATABASE
  // ─────────────────────────────────────────────────────────
  const persistToDatabase = async (nextData) => {
    const finalData = nextData || data;
    setData(finalData);
    setSaveStatus('saving');
    try {
      if (onAutoSave) {
        await onAutoSave(finalData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (err) {
      console.error('Failed to auto-save section:', err);
      setSaveStatus('error');
    }
  };

  const handleSaveAndApply = async () => {
    if (onSave) {
      await onSave(data);
    }
    onClose();
  };

  // Section Type Identification
  const secType = (section.type || section.sectionKey || '').toLowerCase();
  const isArticleFeed = ['stories_feed', 'latest_blogs', 'latest', 'trending', 'popular_editors', 'business', 'spotlight', 'technology', 'ai'].includes(secType);
  const isNewsletter = secType === 'newsletter';
  const isImageText = secType === 'image_text';
  const isText = secType === 'text';
  const isCTA = secType === 'cta';
  const isGridList = ['services', 'portfolio', 'testimonials', 'features', 'stats', 'brands', 'faq', 'contact'].includes(secType);

  // Active Articles Calculation
  const activeArticles = useMemo(() => {
    if (data.hasCustomArticles && Array.isArray(data.articles)) {
      return data.articles;
    }
    if (Array.isArray(data.articles) && data.articles.length > 0) {
      return data.articles;
    }
    const cat = (data.category || '').toLowerCase().trim();
    let filtered = pool;
    if (cat) {
      const matching = pool.filter(s => (s.category || s.categoryLabel || '').toLowerCase().includes(cat));
      if (matching.length > 0) filtered = matching;
    }
    const limit = Number(data.limit) || 6;
    return filtered.slice(0, limit);
  }, [data.articles, data.hasCustomArticles, data.category, data.limit, pool]);

  // ─────────────────────────────────────────────────────────
  // ARTICLE CURATION & REORDERING HANDLERS
  // ─────────────────────────────────────────────────────────
  const handleOpenPicker = (target) => {
    setPickerTarget(target);
    setPickerSearch('');
    setPickerCategory('All');
    setIsPickerOpen(true);
  };

  const handleSelectArticle = (article) => {
    const formatted = {
      id: article._id || article.id || `art-${Date.now()}`,
      articleId: article._id || article.id,
      title: article.title || 'Untitled Article',
      excerpt: article.excerpt || article.summary || article.description || '',
      category: article.categoryLabel || article.category || 'News',
      categoryLabel: article.categoryLabel || article.category || 'News',
      image: article.image || article.coverImage || article.fallbackImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
      author: typeof article.author === 'object' ? article.author?.name : (article.author || 'Editorial Bureau'),
      authorAvatar: article.authorAvatar || article.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      date: article.publishedAt || article.date || 'Today',
      readTime: article.readTime || '4 min read',
      slug: article.slug || article._id || article.id,
      link: article.slug ? `/stories/${article.slug}` : `/stories/${article._id || article.id}`,
      isCustom: true
    };

    let nextArticles = [...activeArticles];
    if (pickerTarget?.type === 'replace' && typeof pickerTarget.index === 'number') {
      nextArticles[pickerTarget.index] = formatted;
    } else {
      nextArticles.push(formatted);
    }

    const nextData = { ...data, articles: nextArticles, limit: nextArticles.length, hasCustomArticles: true };
    persistToDatabase(nextData);
    setIsPickerOpen(false);
  };

  const handleMoveArticle = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activeArticles.length) return;
    const nextArticles = [...activeArticles];
    const temp = nextArticles[idx];
    nextArticles[idx] = nextArticles[targetIdx];
    nextArticles[targetIdx] = temp;

    const nextData = { ...data, articles: nextArticles, hasCustomArticles: true };
    persistToDatabase(nextData);
  };

  const handleRemoveArticle = (idx, e) => {
    e?.stopPropagation();
    const nextArticles = activeArticles.filter((_, i) => i !== idx);
    const nextData = { ...data, articles: nextArticles, limit: nextArticles.length, hasCustomArticles: true };
    persistToDatabase(nextData);
  };

  // ─────────────────────────────────────────────────────────
  // QUICK EDIT MODAL HANDLERS
  // ─────────────────────────────────────────────────────────
  const handleOpenEditModal = () => {
    setEditFormData({
      title: data.title || data.heading || '',
      subtitle: data.subtitle || data.subheading || data.description || '',
      badge: data.badge || data.badgeText || '',
      viewAllText: data.viewAllText || 'View All',
      viewAllUrl: data.viewAllUrl || '/latest',
      category: data.category || '',
      limit: data.limit || activeArticles.length || 6,
      // Newsletter
      headline: data.headline || data.title || '',
      buttonText: data.buttonText || 'Subscribe',
      placeholder: data.placeholder || 'Enter your email address',
      // Image Text
      image: data.image || data.bgImage || '',
      imagePosition: data.imagePosition || 'left',
      buttonUrl: data.buttonUrl || data.primaryBtnUrl || '',
      // CTA
      primaryBtnText: data.primaryBtnText || data.buttonText || '',
      primaryBtnUrl: data.primaryBtnUrl || data.buttonUrl || '',
      secondaryBtnText: data.secondaryBtnText || '',
      secondaryBtnUrl: data.secondaryBtnUrl || '',
      bgImage: data.bgImage || data.image || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditModal = () => {
    const nextData = {
      ...data,
      ...editFormData,
      heading: editFormData.title || editFormData.heading || data.heading,
      description: editFormData.subtitle || editFormData.description || data.description,
      badgeText: editFormData.badge || data.badgeText
    };
    persistToDatabase(nextData);
    setIsEditModalOpen(false);
  };

  const getSectionTitle = () => {
    return data.title || data.heading || data.headline || section.title || `${section.type?.toUpperCase()} Section`;
  };

  const getSectionSubtitle = () => {
    return data.subtitle || data.subheading || data.description || '';
  };

  return (
    <div className="lse-overlay">
      {/* ── Studio Top Header Bar ── */}
      <header className="lse-header">
        <div className="lse-header-left">
          <div className="lse-title-wrap">
            <span className="lse-live-pill">
              <span className="lse-live-dot" />
              LIVE SECTION STUDIO
            </span>
            <h3 className="lse-title">
              <Sparkles size={17} color="#fb923c" />
              <span>{getSectionTitle()}</span>
            </h3>
          </div>
        </div>

        {/* Viewport Device Toggle */}
        <div className="lse-header-center">
          <div className="lse-device-toggle">
            <button
              type="button"
              className={`lse-device-btn ${deviceView === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceView('desktop')}
              title="Desktop Preview"
            >
              <Monitor size={15} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={`lse-device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceView('mobile')}
              title="Mobile Responsive Preview"
            >
              <Smartphone size={15} />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Header Actions */}
        <div className="lse-header-actions">
          {saveStatus === 'saving' && (
            <span className="lse-save-indicator saving">
              <RefreshCw size={13} className="lse-spin" />
              <span>Saving to database...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="lse-save-indicator saved">
              <Check size={13} />
              <span>Saved permanently</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="lse-save-indicator error">
              <X size={13} />
              <span>Save error</span>
            </span>
          )}

          <button
            type="button"
            className="lse-btn-cancel"
            onClick={onClose}
          >
            <X size={15} />
            <span>Discard</span>
          </button>
          <button
            type="button"
            className="lse-btn-save"
            onClick={handleSaveAndApply}
          >
            <Check size={16} />
            <span>Apply to Live Site</span>
          </button>
        </div>
      </header>

      {/* ── Main Studio Canvas ── */}
      <main className="lse-workspace">
        <div className={`lse-canvas-wrapper ${deviceView === 'mobile' ? 'mobile-view' : ''}`}>
          
          {/* Quick Guidance & Actions Bar */}
          <div className="lse-tip-bar">
            <div className="lse-tip-text">
              <Sparkles size={16} color="#fbbf24" />
              <span>
                <strong>WYSIWYG Live Canvas:</strong> Click any text, button, or badge to edit directly. Hover over articles to reorder or replace them.
              </span>
            </div>

            <div className="lse-toolbar-actions">
              <button
                type="button"
                className="lse-toolbar-btn primary"
                onClick={handleOpenEditModal}
              >
                <Edit3 size={14} />
                <span>Edit Texts & Settings</span>
              </button>

              {isArticleFeed && (
                <>
                  <button
                    type="button"
                    className="lse-toolbar-btn green"
                    onClick={() => handleOpenPicker({ type: 'add' })}
                  >
                    <Plus size={14} />
                    <span>+ Add Article</span>
                  </button>

                  <select
                    className="lse-select"
                    value={data.category || ''}
                    onChange={(e) => {
                      const next = { ...data, category: e.target.value };
                      persistToDatabase(next);
                    }}
                  >
                    {CATEGORY_CHOICES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* ── Real Frontend Page Browser Window ── */}
          <div className="lse-browser-frame">
            {/* Browser Window Top Address Bar */}
            <div className="lse-browser-topbar">
              <div className="lse-browser-dots">
                <span className="lse-browser-dot red" />
                <span className="lse-browser-dot yellow" />
                <span className="lse-browser-dot green" />
              </div>
              <div className="lse-browser-url-pill">
                <span style={{ color: '#10b981', fontSize: '0.85rem' }}>🔒</span>
                <span>https://goreadpost.com{pageId === 'latest' ? '/latest' : ''}</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                {deviceView === 'mobile' ? 'Mobile View' : 'Desktop View'}
              </div>
            </div>

            {/* Real Frontend Website Body */}
            <div className="lse-real-frontend-sheet">
              {/* Simulated Real Header */}
              <div className="lse-simulated-site-header">
                <div className="lse-simulated-brand-logo">
                  <span style={{ color: '#e11d48' }}>Go</span>Read<span style={{ color: '#e11d48' }}>Post</span>
                </div>
                <nav className="lse-simulated-nav-links">
                  <span className={`lse-simulated-nav-link ${pageId !== 'latest' ? 'active' : ''}`}>Home</span>
                  <span className={`lse-simulated-nav-link ${pageId === 'latest' ? 'active' : ''}`}>Latest</span>
                  <span className="lse-simulated-nav-link">Trending</span>
                  <span className="lse-simulated-nav-link">AI Story</span>
                  <span className="lse-simulated-nav-link">Enterprise</span>
                  <span className="lse-simulated-nav-link">Videos</span>
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={14} />
                    <span>Search stories…</span>
                  </div>
                </div>
              </div>

              {/* Breadcrumbs for Latest Page */}
              {pageId === 'latest' && (
                <div style={{ maxWidth: '1420px', margin: '0 auto', padding: '1rem 1.5rem 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                  <span style={{ cursor: 'pointer', color: '#0f172a', fontWeight: 600 }}>Home</span>
                  <span>&gt;</span>
                  <span style={{ color: '#ea580c', fontWeight: 700 }}>Latest Articles</span>
                </div>
              )}

              {/* Real Frontend Content Container */}
              <div className={pageId === 'latest' ? "lap-page-wrapper" : "mhp-container"} style={{ padding: '1.5rem clamp(1rem, 2.5vw, 2.5rem) 3rem' }}>
                
                {/* Active Section with Halo Indicator */}
                <div className="lse-active-section-wrapper">
                  <div className="lse-active-section-tag">
                    <Sparkles size={12} fill="#ffffff" />
                    <span>Editing Live Section: {getSectionTitle()}</span>
                  </div>

            {/* 1. ARTICLE FEED RENDERER (Latest Blogs, Trending, Popular, Spotlight) */}
            {isArticleFeed && (pageId === 'latest' || section?.id === 'latest_feed' ? (
              /* REAL FRONTEND LATEST ARTICLES PAGE VIEW */
              <div className="lap-page-wrapper" style={{ padding: '0 0 2rem' }}>
                {/* Real Frontend Header (Title + Subtitle) */}
                <div className="lap-header" style={{ marginBottom: '1.75rem' }}>
                  <h1 
                    className="lap-title lse-inline-edit-hint"
                    onClick={handleOpenEditModal}
                    title="Click to edit section title"
                    style={{ cursor: 'pointer' }}
                  >
                    {getSectionTitle()}
                  </h1>
                  <p 
                    className="lap-subtitle lse-inline-edit-hint"
                    onClick={handleOpenEditModal}
                    title="Click to edit section subtitle"
                    style={{ cursor: 'pointer' }}
                  >
                    {getSectionSubtitle() || 'Discover the most recent stories, investigative reporting, and updates across technology, business, and innovation.'}
                  </p>
                </div>

                {/* Real Frontend Category Filter Pills Bar */}
                <div className="lap-category-pills-bar">
                  {['All', 'Startups', 'Technology', 'AI', 'Enterprise', 'FinTech', 'HerStory', 'SMBStory', 'SocialStory', 'Hindi'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`lap-pill-btn ${(data.category || 'All').toLowerCase() === cat.toLowerCase() || (cat === 'All' && !data.category) ? 'active' : ''}`}
                      onClick={() => {
                        const nextCat = cat === 'All' ? '' : cat;
                        const next = { ...data, category: nextCat };
                        persistToDatabase(next);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Real Frontend Responsive Card Grid (4 columns) */}
                <div className="lap-main-layout">
                  <div className="lap-left-col">
                    <div className="lap-articles-grid">
                      {activeArticles.map((story, idx) => {
                        const artId = story.id || story._id || `lap-card-${idx}`;
                        const artTitle = story.title || 'Featured Story';
                        const artImg = story.image || story.coverImage || (typeof story.featuredImage === 'string' ? story.featuredImage : story.featuredImage?.url) || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                        const artCat = story.categoryLabel || story.category || 'Startups';
                        const artExcerpt = story.summary || story.subtitle || story.excerpt || (typeof story.content === 'string' ? story.content.slice(0, 130) + '...' : '');
                        const artAuthor = typeof story.author === 'object' ? story.author?.name : (story.author || 'Editorial Bureau');
                        const artAvatar = story.authorAvatar || (typeof story.author === 'object' && story.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                        const artDate = story.publishedAt || story.date || 'Today';
                        const artReadTime = story.readTime || (story.readingTime ? `${story.readingTime} min read` : '5 min read');

                        return (
                          <article 
                            key={artId} 
                            className="lap-card lse-hover-item"
                            style={{ position: 'relative' }}
                          >
                            {/* Position Indicator Badge */}
                            <div className="lse-card-rank-badge" title={`Position #${idx + 1} in grid`}>
                              <span>#{idx + 1}</span>
                            </div>

                            {/* Floating Reorder & Replace Dock */}
                            <div className="lse-card-dock">
                              <button
                                type="button"
                                className="lse-dock-btn"
                                disabled={idx === 0}
                                onClick={() => handleMoveArticle(idx, 'up')}
                                title="Move earlier (to left)"
                              >
                                <ArrowLeft size={13} />
                              </button>
                              <button
                                type="button"
                                className="lse-dock-btn"
                                disabled={idx === activeArticles.length - 1}
                                onClick={() => handleMoveArticle(idx, 'down')}
                                title="Move later (to right)"
                              >
                                <ArrowRight size={13} />
                              </button>
                              <button
                                type="button"
                                className="lse-dock-btn"
                                onClick={() => handleOpenPicker({ type: 'replace', index: idx })}
                                title="Replace this article"
                              >
                                <RefreshCw size={13} />
                              </button>
                              <button
                                type="button"
                                className="lse-dock-btn danger"
                                onClick={(e) => handleRemoveArticle(idx, e)}
                                title="Delete this article permanently"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <div className="lap-thumb-wrap">
                              <img 
                                src={artImg} 
                                alt={artTitle} 
                                className="lap-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                                }}
                              />
                              <span className="lap-category-on-image">
                                {artCat}
                              </span>
                            </div>

                            <div className="lap-card-body">
                              <h3 className="lap-card-title">
                                {artTitle}
                              </h3>
                              {artExcerpt && (
                                <p className="lap-card-excerpt">
                                  {artExcerpt}
                                </p>
                              )}
                              <div className="lap-card-meta">
                                <img 
                                  src={artAvatar} 
                                  alt={artAuthor} 
                                  className="lap-author-avatar"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <span className="lap-author-name">{artAuthor}</span>
                                <span className="lap-meta-sep">•</span>
                                <span>{artDate}</span>
                                <span className="lap-meta-sep">•</span>
                                <span>{artReadTime}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}

                      {/* Add Article to Latest Grid Card */}
                      <div 
                        className="lap-card lse-add-article-card"
                        onClick={() => handleOpenPicker({ type: 'add' })}
                        style={{ minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Click to add another article to Latest Articles"
                      >
                        <div className="lse-add-card-inner">
                          <div className="lse-add-icon-circle">
                            <Plus size={26} />
                          </div>
                          <span className="lse-add-title">+ Add Article</span>
                          <span className="lse-add-subtitle">Pick from database articles</span>
                        </div>
                      </div>
                    </div>

                    {/* Real Frontend Pagination Controls */}
                    <div className="lap-pagination" style={{ marginTop: '2.5rem' }}>
                      <button type="button" className="lap-page-btn" disabled><ChevronLeft size={16} /></button>
                      <button type="button" className="lap-page-btn active">1</button>
                      <button type="button" className="lap-page-btn">2</button>
                      <button type="button" className="lap-page-btn">3</button>
                      <button type="button" className="lap-page-btn"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* HOMEPAGE SECTION VIEW */
              <section className="mhp-content-section" style={{ margin: 0, padding: 0 }}>
                <div className="mhp-section-header" style={{ marginBottom: '1.5rem' }}>
                  <div className="mhp-section-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      className="mhp-section-title-wrap lse-inline-edit-hint"
                      onClick={handleOpenEditModal}
                      title="Click to edit section title"
                    >
                      <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{getSectionTitle()}</span>
                    </div>
                    {getSectionSubtitle() && (
                      <span 
                        className="lse-inline-edit-hint"
                        onClick={handleOpenEditModal}
                        title="Click to edit subtitle"
                        style={{ fontSize: '0.9rem', color: '#94a3b8' }}
                      >
                        {getSectionSubtitle()}
                      </span>
                    )}
                    {data.badgeText && (
                      <span className="mhp-editor-pick-pill" style={{ marginLeft: '8px' }}>
                        <Sparkles size={12} fill="#ffffff" color="#ffffff" />
                        {data.badgeText}
                      </span>
                    )}
                  </div>

                  <span 
                    className="mhp-view-all-link lse-inline-edit-hint"
                    onClick={handleOpenEditModal}
                    title="Click to edit view-all text and link"
                    style={{ color: '#ea580c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {data.viewAllText || 'View All'} <ArrowRight size={14} />
                  </span>
                </div>

                {/* Articles Grid */}
                <div className="mhp-blog-cards-grid">
                  {activeArticles.map((blog, idx) => {
                    const artId = blog.id || blog._id || `card-${idx}`;
                    const artTitle = blog.title || 'Featured Story';
                    const artImg = blog.image || blog.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
                    const artCat = blog.categoryLabel || blog.category || 'News';
                    const artAuthor = typeof blog.author === 'object' ? blog.author?.name : (blog.author || 'Editorial Bureau');
                    const artDate = blog.publishedAt || blog.date || 'Today';

                    return (
                      <article 
                        key={artId} 
                        className="mhp-blog-card lse-hover-item"
                        style={{ position: 'relative' }}
                      >
                        {/* Position Indicator Badge */}
                        <div className="lse-card-rank-badge" title={`Position #${idx + 1} in grid`}>
                          <span>#{idx + 1}</span>
                        </div>

                        {/* Floating Reorder & Replace Dock */}
                        <div className="lse-card-dock">
                          <button
                            type="button"
                            className="lse-dock-btn"
                            disabled={idx === 0}
                            onClick={() => handleMoveArticle(idx, 'up')}
                            title="Move earlier (to left)"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            className="lse-dock-btn"
                            disabled={idx === activeArticles.length - 1}
                            onClick={() => handleMoveArticle(idx, 'down')}
                            title="Move later (to right)"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            className="lse-dock-btn"
                            onClick={() => handleOpenPicker({ type: 'replace', index: idx })}
                            title="Replace this article"
                          >
                            <RefreshCw size={13} />
                          </button>
                          <button
                            type="button"
                            className="lse-dock-btn danger"
                            onClick={(e) => handleRemoveArticle(idx, e)}
                            title="Delete this article permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="mhp-blog-thumb-wrap">
                          <img 
                            src={artImg} 
                            alt={artTitle} 
                            className="mhp-blog-thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span className="mhp-blog-category-on-image">
                            {artCat}
                          </span>
                        </div>
                        <div className="mhp-blog-body">
                          <h3 className="mhp-blog-card-title">
                            {artTitle}
                          </h3>
                          {blog.excerpt && (
                            <p className="mhp-blog-excerpt">
                              {blog.excerpt}
                            </p>
                          )}
                          <div className="mhp-blog-footer-row">
                            <span className="mhp-blog-readmore-btn" style={{ cursor: 'pointer' }}>
                              <span>READ MORE</span>
                              <ArrowRight size={13} />
                            </span>
                            <div className="mhp-blog-author-row">
                              <span className="mhp-blog-author-name">{artAuthor}</span>
                              <span className="mhp-meta-sep">•</span>
                              <span>{artDate}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {/* Add Article to Grid Card */}
                  <div 
                    className="mhp-blog-card lse-add-article-card"
                    onClick={() => handleOpenPicker({ type: 'add' })}
                    title="Click to add another article to this feed"
                  >
                    <div className="lse-add-card-inner">
                      <div className="lse-add-icon-circle">
                        <Plus size={26} />
                      </div>
                      <span className="lse-add-title">+ Add Article to Feed</span>
                      <span className="lse-add-subtitle">Pick from database articles</span>
                    </div>
                  </div>
                </div>
              </section>
            ))}

            {/* 2. NEWSLETTER BANNER RENDERER */}
            {isNewsletter && (
              <section className="mhp-newsletter-section" style={{ margin: 0 }}>
                <div className="mhp-newsletter-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', border: '1.5px solid rgba(234, 88, 12, 0.35)', borderRadius: '16px', padding: '2.5rem' }}>
                  <div className="mhp-newsletter-left">
                    <div className="mhp-newsletter-icon-wrap" style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c' }}>
                      <Mail size={32} />
                    </div>
                    <div>
                      <h2 
                        className="mhp-newsletter-title lse-inline-edit-hint" 
                        onClick={handleOpenEditModal}
                        title="Click to edit headline"
                        style={{ color: '#ffffff', margin: '0 0 6px' }}
                      >
                        {data.headline || data.title || "Get the Latest Blogs Delivered to Your Inbox"}
                      </h2>
                      <p 
                        className="lse-inline-edit-hint" 
                        onClick={handleOpenEditModal}
                        title="Click to edit subtitle"
                        style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8' }}
                      >
                        {data.subtitle || "Unfiltered insights on venture capital, frontier tech, and high-growth leadership directly in your inbox."}
                      </p>
                    </div>
                  </div>

                  <form className="mhp-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                    <input 
                      type="email" 
                      placeholder={data.placeholder || "Enter your email address"}
                      className="mhp-newsletter-input lse-inline-edit-hint"
                      onClick={handleOpenEditModal}
                      title="Click to edit placeholder"
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                    <button 
                      type="button" 
                      className="mhp-newsletter-btn lse-inline-edit-hint"
                      onClick={handleOpenEditModal}
                      title="Click to edit button text"
                      style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#ffffff', fontWeight: 800 }}
                    >
                      {data.buttonText || "Subscribe"}
                    </button>
                  </form>
                </div>
              </section>
            )}

            {/* 3. IMAGE + TEXT SPLIT RENDERER */}
            {isImageText && (
              <div style={{ display: 'grid', gridTemplateColumns: deviceView === 'mobile' ? '1fr' : '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
                {data.imagePosition === 'left' && (
                  <div className="lse-inline-edit-hint" onClick={handleOpenEditModal} title="Click to edit image URL">
                    <img 
                      src={data.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80'} 
                      alt="Banner" 
                      style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} 
                    />
                  </div>
                )}
                <div>
                  {data.badge && (
                    <span 
                      className="lse-inline-edit-hint" 
                      onClick={handleOpenEditModal}
                      style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', fontWeight: 800, fontSize: '0.78rem', marginBottom: '1rem' }}
                    >
                      {data.badge}
                    </span>
                  )}
                  <h2 
                    className="lse-inline-edit-hint" 
                    onClick={handleOpenEditModal}
                    style={{ fontSize: '2rem', fontWeight: 850, color: '#ffffff', margin: '0 0 1rem', lineHeight: 1.25 }}
                  >
                    {data.heading || data.title || "Built for the Next Generation of Builders"}
                  </h2>
                  <p 
                    className="lse-inline-edit-hint" 
                    onClick={handleOpenEditModal}
                    style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.5rem' }}
                  >
                    {data.description || data.subtitle || "Comprehensive reporting that cuts through the noise. Get actionable frameworks and genuine founder journeys."}
                  </p>
                  {(data.buttonText || 'Read More') && (
                    <button 
                      type="button" 
                      className="lse-inline-edit-hint" 
                      onClick={handleOpenEditModal}
                      style={{ padding: '10px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>{data.buttonText || 'Read More'}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
                {data.imagePosition !== 'left' && (
                  <div className="lse-inline-edit-hint" onClick={handleOpenEditModal} title="Click to edit image URL">
                    <img 
                      src={data.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80'} 
                      alt="Banner" 
                      style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4. CALL TO ACTION (CTA) RENDERER */}
            {isCTA && (
              <div 
                style={{
                  padding: '3.5rem 2rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  background: data.bgImage ? `linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.94)), url(${data.bgImage})` : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  backgroundSize: 'cover',
                  border: '1.5px solid rgba(234, 88, 12, 0.35)'
                }}
              >
                {data.badge && (
                  <span className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', fontWeight: 800, fontSize: '0.78rem', marginBottom: '1rem' }}>
                    {data.badge}
                  </span>
                )}
                <h2 className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem' }}>
                  {data.heading || data.title || "Ready to Amplify Your Ecosystem Voice?"}
                </h2>
                <p className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                  {data.description || data.subtitle || "Partner with GoReadPost to reach thousands of high-conviction founders, engineers, and venture capital investors."}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ padding: '12px 26px', borderRadius: '8px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>{data.primaryBtnText || data.buttonText || 'Get In Touch'}</span>
                    <ArrowRight size={16} />
                  </button>
                  {data.secondaryBtnText && (
                    <button type="button" className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ padding: '12px 26px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontWeight: 750, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                      <span>{data.secondaryBtnText}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 5. TEXT / ABOUT BLOCK */}
            {isText && (
              <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                {data.badge && (
                  <span className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', fontWeight: 800, fontSize: '0.78rem', marginBottom: '1rem' }}>
                    {data.badge}
                  </span>
                )}
                <h2 className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '2.2rem', fontWeight: 850, color: '#ffffff', margin: '0 0 1.25rem' }}>
                  {data.heading || data.title || "About Our Journalism"}
                </h2>
                <div className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.8, textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {data.content || data.body || data.description || "We report with absolute independence on high-impact technology, venture capital trends, and emerging founder stories across Bharat and global hubs."}
                </div>
              </div>
            )}

            {/* 6. GRID / LIST SECTIONS (Services, Features, Stats, Testimonials, Portfolio, Brands, FAQ, Contact) */}
            {isGridList && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  {data.badge && (
                    <span className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', fontWeight: 800, fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                      {data.badge}
                    </span>
                  )}
                  <h2 className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '2rem', fontWeight: 850, color: '#ffffff', margin: '0 0 0.5rem' }}>
                    {getSectionTitle()}
                  </h2>
                  {getSectionSubtitle() && (
                    <p className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
                      {getSectionSubtitle()}
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: deviceView === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {(data.items || []).map((item, idx) => (
                    <div 
                      key={idx}
                      className="lse-hover-item"
                      style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1.5rem', position: 'relative' }}
                    >
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#ffffff', fontWeight: 750 }}>
                        {item.title || item.name || item.number || `Item #${idx + 1}`}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        {item.description || item.quote || item.label || item.meta || ''}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="lse-toolbar-btn primary"
                    onClick={handleOpenEditModal}
                  >
                    <Edit3 size={14} />
                    <span>Manage Section Items & Texts</span>
                  </button>
                </div>
              </div>
            )}

                </div>
              </div>

              {/* Simulated Real Frontend Footer */}
              <footer className="lse-simulated-site-footer">
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    © 2026 GoReadPost Media. Real-time startup dispatches, deep-tech intelligence, and ecosystem signals.
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Contact Desk</span>
                    <span>Advertise</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>

        </div>
      </main>

      {/* ── Quick Edit Modal ── */}
      {isEditModalOpen && (
        <div className="lse-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="lse-modal" onClick={e => e.stopPropagation()}>
            <div className="lse-modal-header">
              <h4>
                <Edit3 size={17} color="#fb923c" />
                <span>Live Edit Section: {getSectionTitle()}</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lse-modal-body">
              <div className="lse-input-group">
                <label>Section Title / Heading</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={e => setEditFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Latest from the Blog"
                />
              </div>

              <div className="lse-input-group">
                <label>Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={editFormData.subtitle || ''}
                  onChange={e => setEditFormData(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Supporting narrative or section description..."
                />
              </div>

              {isArticleFeed && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="lse-input-group">
                      <label>View All Button Text</label>
                      <input
                        type="text"
                        value={editFormData.viewAllText || ''}
                        onChange={e => setEditFormData(p => ({ ...p, viewAllText: e.target.value }))}
                        placeholder="View All Articles"
                      />
                    </div>
                    <div className="lse-input-group">
                      <label>View All Destination URL</label>
                      <input
                        type="text"
                        value={editFormData.viewAllUrl || ''}
                        onChange={e => setEditFormData(p => ({ ...p, viewAllUrl: e.target.value }))}
                        placeholder="/latest or /trending"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="lse-input-group">
                      <label>Default Category Filter</label>
                      <select
                        value={editFormData.category || ''}
                        onChange={e => setEditFormData(p => ({ ...p, category: e.target.value }))}
                      >
                        {CATEGORY_CHOICES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="lse-input-group">
                      <label>Max Articles in Grid</label>
                      <input
                        type="number"
                        min="2"
                        max="24"
                        value={editFormData.limit || 6}
                        onChange={e => setEditFormData(p => ({ ...p, limit: parseInt(e.target.value, 10) || 6 }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {isNewsletter && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="lse-input-group">
                    <label>Button Text</label>
                    <input
                      type="text"
                      value={editFormData.buttonText || ''}
                      onChange={e => setEditFormData(p => ({ ...p, buttonText: e.target.value }))}
                      placeholder="Subscribe"
                    />
                  </div>
                  <div className="lse-input-group">
                    <label>Input Placeholder</label>
                    <input
                      type="text"
                      value={editFormData.placeholder || ''}
                      onChange={e => setEditFormData(p => ({ ...p, placeholder: e.target.value }))}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              )}

              {(isImageText || isCTA) && (
                <div className="lse-input-group">
                  <label>Background / Cover Image URL</label>
                  <input
                    type="text"
                    value={editFormData.image || editFormData.bgImage || ''}
                    onChange={e => setEditFormData(p => ({ ...p, image: e.target.value, bgImage: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {(editFormData.image || editFormData.bgImage) && (
                    <div style={{ marginTop: '8px', maxHeight: '140px', overflow: 'hidden', borderRadius: '8px' }}>
                      <img src={editFormData.image || editFormData.bgImage} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              )}

              {(isImageText || isCTA) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="lse-input-group">
                    <label>Primary Button Text</label>
                    <input
                      type="text"
                      value={editFormData.primaryBtnText || editFormData.buttonText || ''}
                      onChange={e => setEditFormData(p => ({ ...p, primaryBtnText: e.target.value, buttonText: e.target.value }))}
                      placeholder="Read More"
                    />
                  </div>
                  <div className="lse-input-group">
                    <label>Primary Button Link</label>
                    <input
                      type="text"
                      value={editFormData.primaryBtnUrl || editFormData.buttonUrl || ''}
                      onChange={e => setEditFormData(p => ({ ...p, primaryBtnUrl: e.target.value, buttonUrl: e.target.value }))}
                      placeholder="/about or #contact"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="lse-modal-footer">
              <button
                type="button"
                className="lse-btn-cancel"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lse-btn-save"
                onClick={handleSaveEditModal}
              >
                <Check size={15} />
                <span>Update Section & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Article Picker Modal ── */}
      {isPickerOpen && (
        <div className="lbe-picker-overlay" onClick={() => setIsPickerOpen(false)}>
          <div className="lbe-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="lbe-picker-header">
              <div>
                <h4 className="lbe-picker-title">
                  <Layers size={18} color="#38bdf8" />
                  <span>
                    {pickerTarget?.type === 'replace' ? `Replace Article #${(pickerTarget?.index ?? 0) + 1}` : 'Select Article to Add to Section'}
                  </span>
                </h4>
                <p className="lbe-picker-subtitle">
                  Pick any published article from your database to pin or display in this section.
                </p>
              </div>
              <button 
                type="button" 
                className="lbe-picker-close-btn"
                onClick={() => setIsPickerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lbe-picker-toolbar">
              <div className="lbe-picker-search-wrap">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search articles by title, author, desk..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="lbe-picker-search-input"
                  autoFocus
                />
                {pickerSearch && (
                  <button 
                    type="button" 
                    onClick={() => setPickerSearch('')}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="lbe-picker-categories">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`lbe-picker-cat-pill ${pickerCategory === cat ? 'active' : ''}`}
                    onClick={() => setPickerCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="lbe-picker-body">
              {filteredPickerArticles.length === 0 ? (
                <div className="lbe-picker-empty">
                  <p>No articles found matching "{pickerSearch}".</p>
                </div>
              ) : (
                <div className="lbe-picker-grid">
                  {filteredPickerArticles.map(article => {
                    const artId = article._id || article.id;
                    const artTitle = article.title || 'Untitled Article';
                    const artImg = article.image || article.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
                    const artCat = article.categoryLabel || article.category || 'Article';
                    const artAuthor = typeof article.author === 'object' ? article.author?.name : (article.author || 'Author');

                    return (
                      <div 
                        key={artId} 
                        className="lbe-picker-card"
                        onClick={() => handleSelectArticle(article)}
                      >
                        <div className="lbe-picker-card-thumb-wrap">
                          <img src={artImg} alt={artTitle} className="lbe-picker-card-thumb" />
                          <span className="lbe-picker-card-category">{artCat}</span>
                        </div>
                        <div className="lbe-picker-card-content">
                          <h5 className="lbe-picker-card-title">{artTitle}</h5>
                          <div className="lbe-picker-card-meta">
                            <span>{artAuthor}</span>
                          </div>
                          <button 
                            type="button" 
                            className="lbe-picker-select-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectArticle(article);
                            }}
                          >
                            <Check size={13} />
                            <span>Select This Article</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
