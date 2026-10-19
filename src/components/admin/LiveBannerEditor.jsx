import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Sparkles, Plus, Trash2, 
  ArrowRight, ChevronLeft, ChevronRight,
  Monitor, Smartphone, ArrowUp, ArrowDown,
  Search, RefreshCw, Layers, Eye, EyeOff,
  Edit2, Edit3, Image as ImageIcon, Type
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { ALL_STORIES } from '../../data/storiesData';
import './LiveBannerEditor.css';
import './LiveSectionEditor.css';
import '../ModernHomepage.css';

// Formatter to standardize an article object for Hero Slider
const formatForHeroSlide = (article) => {
  const id = article._id || article.id || `slide-${Date.now()}`;
  const title = article.title || 'Featured Story';
  const excerpt = article.summary || article.excerpt || article.description || 
    (typeof article.content === 'string' ? article.content.slice(0, 160) : '') || 
    'Comprehensive reporting on innovation and founder journeys.';
  const category = article.categoryLabel || article.category || 'Startups';
  const image = article.image || article.coverImage || article.bannerImage || article.fallbackImage || 
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80';
  const authorName = typeof article.author === 'object' ? (article.author?.name || 'Editorial Bureau') : (article.author || 'Editorial Bureau');
  const authorAvatar = article.author?.avatar || article.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const date = article.publishedAt || article.date || article.formattedDate || 'Today';
  const readTime = article.readTime || (article.readingTime ? `${article.readingTime} min read` : '4 min read');
  const slug = article.slug || id;
  const link = `/stories/${slug}`;

  return {
    id,
    articleId: id,
    title,
    excerpt,
    category,
    image,
    author: authorName,
    authorAvatar,
    date,
    readTime,
    primaryBtnText: 'Read More',
    link,
    slug
  };
};

// Formatter to standardize an article object for Popular Posts Sidebar
const formatForPopularPost = (article) => {
  const id = article._id || article.id || `popular-${Date.now()}`;
  const title = article.title || 'Popular Story';
  const image = article.image || article.coverImage || article.fallbackImage || 
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80';
  const readTime = article.readTime || (article.readingTime ? `${article.readingTime} min read` : '3 min read');
  const category = article.categoryLabel || article.category || 'Trending';
  const slug = article.slug || id;
  const link = `/stories/${slug}`;
  const author = article.author;
  const date = article.publishedAt || article.date || 'Today';

  return {
    id,
    _id: article._id || id,
    title,
    image,
    coverImage: image,
    readTime,
    category,
    slug,
    link,
    author,
    date
  };
};

export default function LiveBannerEditor({ 
  section, 
  isOpen, 
  onClose, 
  onSave,
  stories = [],
  pageId = null,
  onAutoSave = null
}) {
  const [data, setData] = useState(() => section?.data || {});
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'mobile'
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [availableArticles, setAvailableArticles] = useState(() => {
    if (stories && stories.length > 0) return stories;
    return ALL_STORIES;
  });

  // Modal Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // { type: 'hero-add' | 'hero-replace' | 'popular-add' | 'popular-replace', index?: number }
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  // Slide Content Edit Modal State
  const [isSlideEditOpen, setIsSlideEditOpen] = useState(false);
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    image: '',
    primaryBtnText: 'Read More',
    link: '',
    author: ''
  });

  // Popular Title Inline Edit State
  const [isEditingPopularTitle, setIsEditingPopularTitle] = useState(false);
  const [popularTitleValue, setPopularTitleValue] = useState(() => data.popularTitle || 'Popular Posts');

  // Load published articles from database on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLiveArticles = async () => {
      try {
        const res = await ArticleService.getArticles({ limit: 150 });
        const list = Array.isArray(res?.data) ? res.data : [];
        if (isMounted) {
          if (list.length > 0) {
            setAvailableArticles(list);
          } else {
            setAvailableArticles(stories.length ? stories : ALL_STORIES);
          }
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

  // Sync section data on open
  useEffect(() => {
    if (section?.data) {
      setData({ ...section.data });
    }
  }, [section]);

  // Pool of available stories
  const pool = useMemo(() => {
    return availableArticles.length > 0 ? availableArticles : ALL_STORIES;
  }, [availableArticles]);

  // Filtered articles inside the Picker Modal
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

  // Unique categories for picker filtering
  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    pool.forEach(a => {
      const c = a.categoryLabel || a.category;
      if (c && typeof c === 'string') cats.add(c.trim());
    });
    return Array.from(cats).slice(0, 10);
  }, [pool]);

  if (!isOpen || !section) return null;

  // Initialize or retrieve slides (Hero Carousel)
  const rawSlides = Array.isArray(data.slides) && data.slides.length > 0 
    ? data.slides.filter(s => {
        if (!s) return false;
        // If slide is custom, created by admin, or has custom content, ALWAYS preserve it!
        if (s.isCustom || !s.articleId) return true;
        // Only if it's purely a DB article reference, check if the article still exists
        const id = String(s.articleId || s.id || s._id || s.slug);
        return pool.some(p => String(p._id || p.id || p.slug) === id || p.title === s.title);
      })
    : [];

  // If rawSlides is still empty, initialize from section's own data (headline, badge, bgImage) if present!
  if (rawSlides.length === 0 && (data.headline || data.title || data.heading || data.bgImage || data.image)) {
    rawSlides.push({
      id: `hero-slide-${Date.now()}`,
      title: data.headline || data.title || data.heading || 'Featured Story',
      excerpt: data.subheadline || data.subtitle || data.description || 'Comprehensive reporting on innovation and founder journeys.',
      category: data.badge || data.category || 'HEADLINE',
      image: data.bgImage || data.image || (pool[0]?.image) || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
      author: 'Editorial Bureau',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      date: 'Today',
      readTime: '4 min read',
      primaryBtnText: data.primaryBtnText || data.buttonText || 'Read More',
      link: data.primaryBtnUrl || data.buttonUrl || '/latest',
      isCustom: true
    });
  }

  const slides = rawSlides.length > 0 
    ? rawSlides 
    : [
        formatForHeroSlide(pool[0] || {}),
        formatForHeroSlide(pool[1] || {}),
        formatForHeroSlide(pool[2] || {})
      ];

  // Initialize or retrieve popular articles (Sidebar 1-5)
  const rawPopular = Array.isArray(data.popularArticles) && data.popularArticles.length > 0
    ? data.popularArticles.filter(item => {
        if (!item) return false;
        if (item.isCustom || !item.articleId) return true;
        const id = String(item.articleId || item._id || item.id || item.slug);
        return pool.some(p => String(p._id || p.id || p.slug) === id || p.title === item.title);
      })
    : [];

  const popularArticles = rawPopular.length > 0
    ? rawPopular
    : pool.slice(0, Number(data.popularLimit) || 5).map(formatForPopularPost);

  const currentSlide = slides[activeSlideIdx] || slides[0] || {};
  const showPopular = data.showPopular !== false;

  // ─────────────────────────────────────────────────────────
  // INSTANT AUTO-SAVE PERSISTENCE TO DATABASE
  // ─────────────────────────────────────────────────────────
  const persistToDatabase = async (nextSlides, nextPopular) => {
    const sl = nextSlides !== undefined ? nextSlides : slides;
    const pop = nextPopular !== undefined ? nextPopular : popularArticles;

    const finalData = {
      ...data,
      slides: sl,
      popularArticles: pop,
      heroSource: 'custom',
      showPopular: showPopular,
      headline: sl[0]?.title || data.headline,
      subheadline: sl[0]?.excerpt || data.subheadline,
      badge: sl[0]?.category || data.badge,
      bgImage: sl[0]?.image || data.bgImage
    };

    setSaveStatus('saving');
    try {
      if (onAutoSave) {
        await onAutoSave(finalData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (err) {
      console.error('Failed to auto-save banner change:', err);
      setSaveStatus('error');
    }
  };

  // ─────────────────────────────────────────────────────────
  // HERO SLIDE ACTIONS & REORDERING
  // ─────────────────────────────────────────────────────────
  const handleOpenSlideEditor = () => {
    const s = slides[activeSlideIdx] || {};
    setSlideFormData({
      title: s.title || '',
      excerpt: s.excerpt || '',
      category: s.category || '',
      image: s.image || '',
      primaryBtnText: s.primaryBtnText || 'Read More',
      link: s.link || '',
      author: s.author || 'Editorial Bureau'
    });
    setIsSlideEditOpen(true);
  };

  const handleCreateCustomSlide = () => {
    const newCustomSlide = {
      id: `custom-slide-${Date.now()}`,
      title: 'New Custom Headline',
      excerpt: 'Add your summary or excerpt here...',
      category: 'FEATURED',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
      author: 'Editorial Bureau',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      date: 'Today',
      readTime: '3 min read',
      primaryBtnText: 'Read More',
      link: '/latest',
      isCustom: true
    };
    const nextSlides = [...slides, newCustomSlide];
    const newIdx = nextSlides.length - 1;
    updateSlidesState(nextSlides, newIdx);
    persistToDatabase(nextSlides, popularArticles);
    setSlideFormData({
      title: newCustomSlide.title,
      excerpt: newCustomSlide.excerpt,
      category: newCustomSlide.category,
      image: newCustomSlide.image,
      primaryBtnText: newCustomSlide.primaryBtnText,
      link: newCustomSlide.link,
      author: newCustomSlide.author
    });
    setIsSlideEditOpen(true);
  };

  const handleSaveSlideEditor = () => {
    const nextSlides = [...slides];
    nextSlides[activeSlideIdx] = {
      ...nextSlides[activeSlideIdx],
      ...slideFormData,
      title: slideFormData.title.trim() || 'Headline Story',
      headline: slideFormData.title.trim() || 'Headline Story',
      excerpt: slideFormData.excerpt,
      subheadline: slideFormData.excerpt,
      category: slideFormData.category,
      badge: slideFormData.category,
      image: slideFormData.image,
      bgImage: slideFormData.image,
      isCustom: true
    };
    updateSlidesState(nextSlides, activeSlideIdx);
    persistToDatabase(nextSlides, popularArticles);
    setIsSlideEditOpen(false);
  };

  const handleSavePopularTitle = () => {
    const trimmed = (popularTitleValue || '').trim() || 'Popular Posts';
    setData(prev => ({ ...prev, popularTitle: trimmed }));
    setIsEditingPopularTitle(false);
    const finalData = { ...data, popularTitle: trimmed, slides, popularArticles };
    if (onAutoSave) onAutoSave(finalData);
  };

  const updateSlidesState = (newSlides, newActiveIdx = null) => {
    setData(prev => ({
      ...prev,
      slides: newSlides,
      heroSource: 'custom',
      headline: newSlides[0]?.title || prev.headline,
      subheadline: newSlides[0]?.excerpt || prev.subheadline,
      badge: newSlides[0]?.category || prev.badge,
      bgImage: newSlides[0]?.image || prev.bgImage
    }));
    if (newActiveIdx !== null && newActiveIdx >= 0) {
      setActiveSlideIdx(newActiveIdx);
    }
  };

  // Move slide position earlier (Up/Left)
  const handleMoveSlideEarlier = (idx) => {
    if (idx <= 0) return;
    const next = [...slides];
    const temp = next[idx];
    next[idx] = next[idx - 1];
    next[idx - 1] = temp;
    updateSlidesState(next, idx - 1);
    persistToDatabase(next, popularArticles);
  };

  // Move slide position later (Down/Right)
  const handleMoveSlideLater = (idx) => {
    if (idx >= slides.length - 1) return;
    const next = [...slides];
    const temp = next[idx];
    next[idx] = next[idx + 1];
    next[idx + 1] = temp;
    updateSlidesState(next, idx + 1);
    persistToDatabase(next, popularArticles);
  };

  // Delete slide from carousel
  const handleDeleteSlide = (idx, e) => {
    e?.stopPropagation();
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== idx);
    const newIdx = Math.max(0, Math.min(activeSlideIdx, next.length - 1));
    updateSlidesState(next, newIdx);
    persistToDatabase(next, popularArticles);
  };

  // ─────────────────────────────────────────────────────────
  // POPULAR POSTS ACTIONS & REORDERING
  // ─────────────────────────────────────────────────────────
  const updatePopularState = (newPopular) => {
    setData(prev => ({
      ...prev,
      popularArticles: newPopular
    }));
  };

  // Move popular post position up (e.g. #2 to #1)
  const handleMovePopularUp = (idx) => {
    if (idx <= 0) return;
    const next = [...popularArticles];
    const temp = next[idx];
    next[idx] = next[idx - 1];
    next[idx - 1] = temp;
    updatePopularState(next);
    persistToDatabase(slides, next);
  };

  // Move popular post position down (e.g. #1 to #2)
  const handleMovePopularDown = (idx) => {
    if (idx >= popularArticles.length - 1) return;
    const next = [...popularArticles];
    const temp = next[idx];
    next[idx] = next[idx + 1];
    next[idx + 1] = temp;
    updatePopularState(next);
    persistToDatabase(slides, next);
  };

  // Remove article from popular posts
  const handleDeletePopular = (idx) => {
    const next = popularArticles.filter((_, i) => i !== idx);
    updatePopularState(next);
    persistToDatabase(slides, next);
  };

  // ─────────────────────────────────────────────────────────
  // ARTICLE PICKER HANDLER
  // ─────────────────────────────────────────────────────────
  const handleOpenPicker = (target) => {
    setPickerTarget(target);
    setPickerSearch('');
    setPickerCategory('All');
    setIsPickerOpen(true);
  };

  const handleSelectArticleFromPicker = (article) => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'hero-add') {
      const newSlide = formatForHeroSlide(article);
      const nextSlides = [...slides, newSlide];
      updateSlidesState(nextSlides, nextSlides.length - 1);
      persistToDatabase(nextSlides, popularArticles);
    } else if (pickerTarget.type === 'hero-replace') {
      const targetIdx = pickerTarget.index ?? activeSlideIdx;
      const nextSlides = [...slides];
      nextSlides[targetIdx] = formatForHeroSlide(article);
      updateSlidesState(nextSlides, targetIdx);
      persistToDatabase(nextSlides, popularArticles);
    } else if (pickerTarget.type === 'popular-add') {
      const newPop = formatForPopularPost(article);
      const nextPop = [...popularArticles, newPop];
      updatePopularState(nextPop);
      persistToDatabase(slides, nextPop);
    } else if (pickerTarget.type === 'popular-replace') {
      const targetIdx = pickerTarget.index;
      const nextPop = [...popularArticles];
      nextPop[targetIdx] = formatForPopularPost(article);
      updatePopularState(nextPop);
      persistToDatabase(slides, nextPop);
    }

    setIsPickerOpen(false);
  };

  // ─────────────────────────────────────────────────────────
  // APPLY / SAVE TO PAGE
  // ─────────────────────────────────────────────────────────
  const handleSaveAndApply = async () => {
    const finalData = {
      ...data,
      slides: slides,
      popularArticles: popularArticles,
      heroSource: 'custom',
      showPopular: showPopular,
      headline: slides[0]?.title || data.headline,
      subheadline: slides[0]?.excerpt || data.subheadline,
      badge: slides[0]?.category || data.badge,
      bgImage: slides[0]?.image || data.bgImage
    };
    await onSave(finalData);
  };

  return (
    <div className="lbe-overlay">
      {/* ── Top Studio Header Bar ── */}
      <header className="lbe-header">
        <div className="lbe-header-left">
          <div className="lbe-title-wrap">
            <h3 className="lbe-title">
              <Sparkles size={18} color="#f59e0b" />
              <span>Banner Articles & Positions Manager</span>
            </h3>
            <span className="lbe-live-pill">
              <span className="lbe-live-dot" />
              <span>Live Article Curate</span>
            </span>
          </div>
        </div>

        {/* Viewport and Sidebar Controls */}
        <div className="lbe-header-center">
          <div className="lbe-device-toggle">
            <button
              type="button"
              className={`lbe-device-btn ${deviceView === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceView('desktop')}
              title="Desktop viewport preview"
            >
              <Monitor size={14} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={`lbe-device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceView('mobile')}
              title="Mobile viewport preview"
            >
              <Smartphone size={14} />
              <span>Mobile</span>
            </button>
          </div>

          <button
            type="button"
            className={`lbe-toolbar-btn ${showPopular ? 'active' : ''}`}
            onClick={() => {
              const nextShow = !showPopular;
              setData(prev => ({ ...prev, showPopular: nextShow }));
              persistToDatabase(slides, popularArticles);
            }}
            title="Toggle Popular Posts sidebar on homepage"
          >
            {showPopular ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{showPopular ? 'Popular Sidebar: Visible' : 'Sidebar: Full-Width Hero'}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="lbe-header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Real-time Persistence Indicator */}
          {saveStatus === 'saving' && (
            <span className="lbe-save-indicator saving">
              <RefreshCw size={13} className="lbe-spin" />
              <span>Saving to database...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="lbe-save-indicator saved">
              <Check size={13} />
              <span>Saved permanently</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="lbe-save-indicator error">
              <X size={13} />
              <span>Save error</span>
            </span>
          )}

          <button
            type="button"
            className="lbe-btn-cancel"
            onClick={onClose}
          >
            <X size={15} />
            <span>Discard</span>
          </button>
          <button
            type="button"
            className="lbe-btn-save"
            onClick={handleSaveAndApply}
          >
            <Check size={16} />
            <span>Apply to Live Site</span>
          </button>
        </div>
      </header>

      {/* ── Main Studio Canvas ── */}
      <main className="lbe-workspace">
        <div className={`lbe-canvas-wrapper ${deviceView === 'mobile' ? 'mobile-view' : ''}`}>
          
          {/* Quick Guidance Bar */}
          <div className="lbe-tip-bar" style={{ justifyContent: 'space-between' }}>
            <div className="lbe-tip-text">
              <Sparkles size={16} color="#fbbf24" />
              <span>
                <strong>Article Curation Mode:</strong> Easily add published articles and use the <strong>↑ Move Position</strong> buttons to change their order on the banner.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="lbe-toolbar-btn"
                style={{ background: 'rgba(234, 88, 12, 0.2)', borderColor: 'rgba(234, 88, 12, 0.45)', color: '#fb923c' }}
                onClick={handleCreateCustomSlide}
                title="Create a brand new hero slide with custom headline, photo, and buttons"
              >
                <Sparkles size={14} />
                <span>+ Custom Slide</span>
              </button>
              <button
                type="button"
                className="lbe-toolbar-btn"
                style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.4)', color: '#4ade80' }}
                onClick={() => handleOpenPicker({ type: 'hero-add' })}
              >
                <Plus size={14} />
                <span>+ Pick From Articles</span>
              </button>
              {showPopular && (
                <button
                  type="button"
                  className="lbe-toolbar-btn"
                  style={{ background: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}
                  onClick={() => handleOpenPicker({ type: 'popular-add' })}
                >
                  <Plus size={14} />
                  <span>+ Add to Popular</span>
                </button>
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

              {/* Real Frontend Content Container */}
              <div className="mhp-container" style={{ padding: '1.5rem clamp(1rem, 2.5vw, 2.5rem) 2.5rem' }}>
                {/* Active Section Halo on the Real Frontend */}
                <div className="lse-active-section-wrapper" style={{ padding: '0.75rem', margin: 0 }}>
                  <div className="lse-active-section-tag">
                    <Sparkles size={12} fill="#ffffff" />
                    <span>Editing Live Hero: {pageId === 'latest' ? 'Latest Page Hero' : 'Homepage Hero Banner'}</span>
                  </div>

                  {/* ── Live Banner Section ── */}
                  <section className={`mhp-hero-popular-grid ${!showPopular ? 'full-width' : ''}`}>
            
            {/* ── Left Hero Slide Card ── */}
            <div 
              className="mhp-hero-card"
              style={{ 
                backgroundImage: `url(${currentSlide.image})`,
                position: 'relative'
              }}
            >
              <div className="mhp-hero-overlay" />

              {/* Floating Hero Position & Action Bar */}
              <div className="lbe-hero-control-dock">
                <span className="lbe-position-badge">
                  ★ HERO POSITION #{activeSlideIdx + 1} OF {slides.length}
                </span>

                <div className="lbe-dock-actions">
                  <button
                    type="button"
                    className="lbe-dock-btn"
                    disabled={activeSlideIdx === 0}
                    onClick={() => handleMoveSlideEarlier(activeSlideIdx)}
                    title="Move this article earlier in the carousel (Left/Up)"
                  >
                    <ArrowUp size={13} />
                    <span>Move Up (#{(activeSlideIdx + 1) - 1})</span>
                  </button>

                  <button
                    type="button"
                    className="lbe-dock-btn"
                    disabled={activeSlideIdx === slides.length - 1}
                    onClick={() => handleMoveSlideLater(activeSlideIdx)}
                    title="Move this article later in the carousel (Right/Down)"
                  >
                    <ArrowDown size={13} />
                    <span>Move Down (#{(activeSlideIdx + 1) + 1})</span>
                  </button>

                  <button
                    type="button"
                    className="lbe-dock-btn"
                    style={{ background: 'rgba(234, 88, 12, 0.25)', borderColor: 'rgba(234, 88, 12, 0.55)', color: '#fb923c' }}
                    onClick={handleOpenSlideEditor}
                    title="Live edit headline, excerpt, badge, background photo, and buttons"
                  >
                    <Edit3 size={13} />
                    <span>Edit Text & Photo</span>
                  </button>

                  <button
                    type="button"
                    className="lbe-dock-btn highlight"
                    onClick={() => handleOpenPicker({ type: 'hero-replace', index: activeSlideIdx })}
                    title="Replace this hero slide with another published article"
                  >
                    <RefreshCw size={13} />
                    <span>Change Article</span>
                  </button>

                  {slides.length > 1 && (
                    <button
                      type="button"
                      className="lbe-dock-btn danger"
                      onClick={(e) => handleDeleteSlide(activeSlideIdx, e)}
                      title="Remove this article from hero banner"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Real Article Content on Hero Slide */}
              <div className="mhp-hero-content">
                <div style={{ marginBottom: '0.65rem' }}>
                  <span 
                    className="lbe-inline-edit-hint"
                    onClick={handleOpenSlideEditor}
                    title="Click to live edit category / badge"
                    style={{
                      background: 'rgba(234, 88, 12, 0.3)',
                      border: '1px solid rgba(234, 88, 12, 0.6)',
                      color: '#fb923c',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>{currentSlide.category}</span>
                    <Edit2 size={11} />
                  </span>
                </div>

                <h1 
                  className="mhp-hero-title lbe-inline-edit-hint" 
                  onClick={handleOpenSlideEditor}
                  title="Click to live edit headline"
                  style={{ margin: '0 0 1rem', lineHeight: 1.2 }}
                >
                  {currentSlide.title}
                </h1>

                {currentSlide.excerpt && (
                  <p 
                    className="mhp-hero-desc lbe-inline-edit-hint" 
                    onClick={handleOpenSlideEditor}
                    title="Click to live edit subheadline / excerpt"
                    style={{ margin: '0 0 1.25rem' }}
                  >
                    {currentSlide.excerpt}
                  </p>
                )}

                <div className="mhp-author-meta" style={{ flexWrap: 'wrap', gap: '8px' }}>
                  <img 
                    src={currentSlide.authorAvatar} 
                    alt={currentSlide.author} 
                    className="mhp-author-avatar"
                  />
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{currentSlide.author}</span>
                  <span className="mhp-meta-sep">•</span>
                  <span style={{ color: '#cbd5e1' }}>{currentSlide.date}</span>
                  <span className="mhp-meta-sep">•</span>
                  <span style={{ color: '#cbd5e1' }}>{currentSlide.readTime}</span>
                </div>

                <div className="mhp-hero-bottom-actions">
                  <div 
                    className="mhp-hero-read-btn lbe-inline-edit-hint"
                    onClick={handleOpenSlideEditor}
                    title="Click to live edit button text and destination link"
                  >
                    <span>{currentSlide.primaryBtnText || 'Read More'}</span>
                    <ArrowRight size={15} color="#0f172a" />
                  </div>
                  <span className="mhp-category-tag">
                    {currentSlide.category}
                  </span>
                </div>
              </div>

              {/* Slider Dots Navigation */}
              {slides.length > 1 && (
                <div className="mhp-slider-nav">
                  <div className="mhp-slider-dots">
                    {slides.map((_, idx) => (
                      <span 
                        key={idx}
                        className={`mhp-slider-dot ${idx === activeSlideIdx ? 'active' : ''}`}
                        onClick={() => setActiveSlideIdx(idx)}
                      />
                    ))}
                  </div>
                  <button 
                    type="button"
                    className="mhp-slider-btn" 
                    onClick={() => setActiveSlideIdx((activeSlideIdx - 1 + slides.length) % slides.length)}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    type="button"
                    className="mhp-slider-btn" 
                    onClick={() => setActiveSlideIdx((activeSlideIdx + 1) % slides.length)}
                    aria-label="Next slide"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* ── Right Popular Posts Sidebar (With Position Up/Down Reorder) ── */}
            {showPopular && (
              <div className="mhp-popular-card">
                <div className="mhp-section-header" style={{ marginBottom: '1rem' }}>
                  <div className="mhp-section-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isEditingPopularTitle ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          value={popularTitleValue}
                          onChange={(e) => setPopularTitleValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSavePopularTitle(); }}
                          style={{
                            background: '#0f172a',
                            color: '#ffffff',
                            border: '1px solid #38bdf8',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.95rem',
                            fontWeight: 750,
                            outline: 'none'
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSavePopularTitle}
                          style={{ background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer', fontWeight: 750 }}
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsEditingPopularTitle(true)}
                        className="lbe-inline-edit-hint"
                        title="Click to edit Popular Posts title"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{data.popularTitle || 'Popular Posts'}</span>
                        <Edit2 size={12} color="#94a3b8" />
                      </div>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>
                      ({popularArticles.length} Slots)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="lbe-btn-add-mini"
                    onClick={() => handleOpenPicker({ type: 'popular-add' })}
                    title="Add an article to popular posts"
                  >
                    <Plus size={13} />
                    <span>Add Article</span>
                  </button>
                </div>

                <div className="mhp-popular-list">
                  {popularArticles.map((item, idx) => (
                    <div key={item.id || idx} className="lbe-popular-manage-item">
                      {/* Rank Number */}
                      <div className="mhp-popular-rank" title={`Position #${idx + 1}`}>
                        {idx + 1}
                      </div>

                      {/* Thumbnail */}
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="mhp-popular-thumb"
                        loading="lazy"
                      />

                      {/* Info */}
                      <div className="mhp-popular-info">
                        <h4 className="mhp-popular-title">{item.title}</h4>
                        <span className="mhp-popular-meta">
                          {item.category && <span style={{ color: '#fb923c', marginRight: '4px' }}>{item.category} •</span>}
                          {item.readTime || '3 min read'}
                        </span>
                      </div>

                      {/* Direct Position Reorder & Change Controls */}
                      <div className="lbe-item-reorder-group">
                        <button
                          type="button"
                          className="lbe-reorder-btn"
                          disabled={idx === 0}
                          onClick={() => handleMovePopularUp(idx)}
                          title={`Move Up to Position #${idx}`}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="lbe-reorder-btn"
                          disabled={idx === popularArticles.length - 1}
                          onClick={() => handleMovePopularDown(idx)}
                          title={`Move Down to Position #${idx + 2}`}
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          className="lbe-reorder-btn"
                          onClick={() => handleOpenPicker({ type: 'popular-replace', index: idx })}
                          title="Change / Replace this article"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          type="button"
                          className="lbe-reorder-btn danger"
                          onClick={() => handleDeletePopular(idx)}
                          title="Remove from popular posts"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Add to Popular Button */}
                <button
                  type="button"
                  className="lbe-btn-add-popular-full"
                  onClick={() => handleOpenPicker({ type: 'popular-add' })}
                >
                  <Plus size={15} />
                  <span>+ Add Article to Position #{popularArticles.length + 1}</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

              {/* Simulated Real Frontend Footer */}
              <div className="lse-simulated-site-footer">
                <div style={{ maxWidth: '1420px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>© {new Date().getFullYear()} GoReadPost Media Inc. All rights reserved.</span>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Editorial Guidelines</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Hero Slides Position Strip Under Canvas ── */}
          <div className="lbe-slides-strip">
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hero Slides ({slides.length}):
            </span>

            {slides.map((s, idx) => (
              <div
                key={s.id || idx}
                className={`lbe-slide-chip ${idx === activeSlideIdx ? 'active' : ''}`}
                onClick={() => setActiveSlideIdx(idx)}
              >
                <span className="lbe-chip-rank">#{idx + 1}</span>
                <span className="lbe-chip-title">{s.title?.slice(0, 22) || 'Untitled'}...</span>
                
                {/* Micro Position Arrows */}
                <div className="lbe-chip-arrows" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSlideEarlier(idx)}
                    title="Move position earlier (Up/Left)"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === slides.length - 1}
                    onClick={() => handleMoveSlideLater(idx)}
                    title="Move position later (Down/Right)"
                  >
                    <ArrowDown size={11} />
                  </button>
                </div>

                {slides.length > 1 && (
                  <button
                    type="button"
                    className="lbe-btn-delete-slide"
                    onClick={(e) => handleDeleteSlide(idx, e)}
                    title="Delete this slide"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="lbe-btn-add-slide"
              onClick={() => handleOpenPicker({ type: 'hero-add' })}
            >
              <Plus size={14} />
              <span>+ Add Article as Slide #{slides.length + 1}</span>
            </button>
          </div>

        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────
          ARTICLE PICKER MODAL
         ───────────────────────────────────────────────────────── */}
      {isPickerOpen && (
        <div className="lbe-picker-overlay" onClick={() => setIsPickerOpen(false)}>
          <div className="lbe-picker-modal" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="lbe-picker-header">
              <div>
                <h4 className="lbe-picker-title">
                  <Layers size={18} color="#38bdf8" />
                  <span>
                    {pickerTarget?.type?.startsWith('hero') 
                      ? 'Select Article for Hero Slider' 
                      : `Select Article for Popular Position #${(pickerTarget?.index ?? popularArticles.length) + 1}`}
                  </span>
                </h4>
                <p className="lbe-picker-subtitle">
                  Choose any published article from your library. It will automatically load its title, cover image, category, and author.
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

            {/* Search and Category Filters */}
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

              {/* Category Pills */}
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

            {/* Articles List / Grid */}
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
                    const artImg = article.image || article.coverImage || article.fallbackImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
                    const artCat = article.categoryLabel || article.category || 'Article';
                    const artAuthor = typeof article.author === 'object' ? (article.author?.name || 'Author') : (article.author || 'Author');
                    const artDate = article.publishedAt || article.date || 'Recent';

                    return (
                      <div 
                        key={artId} 
                        className="lbe-picker-card"
                        onClick={() => handleSelectArticleFromPicker(article)}
                      >
                        <div className="lbe-picker-card-thumb-wrap">
                          <img src={artImg} alt={artTitle} className="lbe-picker-card-thumb" />
                          <span className="lbe-picker-card-category">{artCat}</span>
                        </div>
                        <div className="lbe-picker-card-content">
                          <h5 className="lbe-picker-card-title">{artTitle}</h5>
                          <div className="lbe-picker-card-meta">
                            <span>{artAuthor}</span>
                            <span>•</span>
                            <span>{artDate}</span>
                          </div>
                          <button 
                            type="button" 
                            className="lbe-picker-select-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectArticleFromPicker(article);
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

      {/* ── Slide Content & Photo Editor Modal ── */}
      {isSlideEditOpen && (
        <div className="lbe-slide-edit-overlay" onClick={() => setIsSlideEditOpen(false)}>
          <div className="lbe-slide-edit-modal" onClick={e => e.stopPropagation()}>
            <div className="lbe-slide-edit-header">
              <h4>
                <Edit3 size={17} color="#fb923c" />
                <span>Edit Hero Slide #{activeSlideIdx + 1} Content</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsSlideEditOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lbe-slide-edit-body">
              <div className="lbe-input-group">
                <label>Badge / Category Tag</label>
                <input
                  type="text"
                  value={slideFormData.category}
                  onChange={e => setSlideFormData(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. STARTUPS, DEEPTECH FOCUS, BREAKING"
                />
              </div>

              <div className="lbe-input-group">
                <label>Main Headline *</label>
                <input
                  type="text"
                  value={slideFormData.title}
                  onChange={e => setSlideFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Compelling story headline"
                />
              </div>

              <div className="lbe-input-group">
                <label>Subheadline / Lead Excerpt</label>
                <textarea
                  rows={3}
                  value={slideFormData.excerpt}
                  onChange={e => setSlideFormData(p => ({ ...p, excerpt: e.target.value }))}
                  placeholder="Lead paragraph or executive summary"
                />
              </div>

              <div className="lbe-input-group">
                <label>Hero Background Image URL</label>
                <input
                  type="text"
                  value={slideFormData.image}
                  onChange={e => setSlideFormData(p => ({ ...p, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                />
                {slideFormData.image && (
                  <div style={{ marginTop: '8px', maxHeight: '140px', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={slideFormData.image} alt="Slide Preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="lbe-input-group">
                  <label>Primary Button Text</label>
                  <input
                    type="text"
                    value={slideFormData.primaryBtnText}
                    onChange={e => setSlideFormData(p => ({ ...p, primaryBtnText: e.target.value }))}
                    placeholder="e.g. Read More"
                  />
                </div>
                <div className="lbe-input-group">
                  <label>Story Link / Destination URL</label>
                  <input
                    type="text"
                    value={slideFormData.link}
                    onChange={e => setSlideFormData(p => ({ ...p, link: e.target.value }))}
                    placeholder="e.g. /stories/slug or /latest"
                  />
                </div>
              </div>

              <div className="lbe-input-group">
                <label>Author Byline</label>
                <input
                  type="text"
                  value={slideFormData.author}
                  onChange={e => setSlideFormData(p => ({ ...p, author: e.target.value }))}
                  placeholder="e.g. Editorial Bureau"
                />
              </div>
            </div>

            <div className="lbe-slide-edit-footer">
              <button
                type="button"
                className="lbe-btn-cancel"
                onClick={() => setIsSlideEditOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lbe-btn-save"
                onClick={handleSaveSlideEditor}
              >
                <Check size={15} />
                <span>Update Slide & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

