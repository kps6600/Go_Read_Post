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

  const popularArticles = (rawPopular.length > 0
    ? rawPopular
    : pool.slice(0, Number(data.popularLimit) || 5).map(formatForPopularPost)).slice(0, 5);

  const currentSlide = slides[activeSlideIdx] || slides[0] || {};
  const showPopular = data.showPopular !== false && pageId !== 'trending' && section?.id !== 'trending_hero';

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
      if (popularArticles.length >= 5) {
        setIsPickerOpen(false);
        return;
      }
      const newPop = formatForPopularPost(article);
      const nextPop = [...popularArticles, newPop].slice(0, 5);
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
    setSaveStatus('saving');
    try {
      if (onAutoSave) {
        await onAutoSave(finalData);
      } else if (onSave) {
        await onSave(finalData);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save banner:', err);
      setSaveStatus('error');
    }
  };

  return (
    <div className="lbe-overlay">
      {/* Sleek Floating Save Button */}
      <button
        type="button"
        className="lbe-floating-save-btn"
        onClick={handleSaveAndApply}
        disabled={saveStatus === 'saving'}
        title="Save changes live to homepage"
        style={{
          position: 'fixed',
          top: '16px',
          right: '60px',
          zIndex: 99999,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '8px 20px',
          background: saveStatus === 'saved' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : saveStatus === 'error'
            ? '#ef4444'
            : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          fontSize: '0.84rem',
          fontWeight: 750,
          cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow: saveStatus === 'saved'
            ? '0 4px 14px rgba(16, 185, 129, 0.45)'
            : '0 4px 14px rgba(234, 88, 12, 0.45)',
          transition: 'all 0.2s ease'
        }}
      >
        {saveStatus === 'saving' ? (
          <>
            <RefreshCw size={14} className="lbe-spin" />
            <span>Saving...</span>
          </>
        ) : saveStatus === 'saved' ? (
          <>
            <Check size={16} />
            <span>Saved Live!</span>
          </>
        ) : saveStatus === 'error' ? (
          <>
            <span>Failed (Retry)</span>
          </>
        ) : (
          <>
            <Check size={16} />
            <span>Save</span>
          </>
        )}
      </button>

      <button
        type="button"
        className="lse-floating-close-btn"
        onClick={onClose}
        title="Close"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        }}
      >
        <X size={17} />
      </button>

      {/* ── Main Studio Canvas ── */}
      <main className="lbe-workspace">
        <div className={`lbe-canvas-wrapper ${deviceView === 'mobile' ? 'mobile-view' : ''}`}>

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



              {/* Real Article Content on Hero Slide */}
              <div className="mhp-hero-content">
                <div style={{ marginBottom: '0.65rem' }}>
                  <span 
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
                      alignItems: 'center'
                    }}
                  >
                    <span>{currentSlide.category}</span>
                  </span>
                </div>

                <h1 
                  className="mhp-hero-title" 
                  style={{ margin: '0 0 1rem', lineHeight: 1.2 }}
                >
                  {currentSlide.title}
                </h1>

                {currentSlide.excerpt && (
                  <p 
                    className="mhp-hero-desc" 
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
                  <div className="mhp-hero-read-btn">
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
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{data.popularTitle || 'Popular Posts'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>
                      ({popularArticles.length}/5 Slots)
                    </span>
                  </div>
                  {popularArticles.length < 5 && (
                    <button
                      type="button"
                      className="lbe-btn-add-mini"
                      onClick={() => handleOpenPicker({ type: 'popular-add' })}
                      title="Add an article to popular posts (Max 5)"
                    >
                      <Plus size={13} />
                      <span>Add Article</span>
                    </button>
                  )}
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
                          className="lbe-reorder-btn arrow-btn"
                          disabled={idx === 0}
                          onClick={() => handleMovePopularUp(idx)}
                          title={`Move Up to Position #${idx}`}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="lbe-reorder-btn arrow-btn"
                          disabled={idx === popularArticles.length - 1}
                          onClick={() => handleMovePopularDown(idx)}
                          title={`Move Down to Position #${idx + 2}`}
                        >
                          <ArrowDown size={13} />
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


              </div>
            )}
          </section>
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

