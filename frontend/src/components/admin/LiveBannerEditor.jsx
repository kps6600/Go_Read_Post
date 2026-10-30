import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Sparkles, Plus, Trash2, 
  ArrowRight, ChevronLeft, ChevronRight,
  Monitor, Smartphone, ArrowUp, ArrowDown,
  Search, RefreshCw, Layers, Eye, EyeOff,
  Edit2, Edit3, Image as ImageIcon, Type, Play
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { VideoService } from '../../services/videoService';
import { ALL_STORIES } from '../../data/storiesData';
import { VIDEO_EPISODES } from '../../data/videoData';
import './LiveBannerEditor.css';
import './LiveSectionEditor.css';
import '../ModernHomepage.css';

// Formatter to standardize an article or video object for Hero Slider
const formatForHeroSlide = (item) => {
  const id = item._id || item.id || `slide-${Date.now()}`;
  const title = item.title || 'Featured Story';
  const isVideo = item.itemType === 'video' || item.type === 'video' || !!item.duration || !!item.youtubeEmbedUrl;
  const excerpt = item.summary || item.excerpt || item.description || 
    (typeof item.content === 'string' ? item.content.slice(0, 160) : '') || 
    'Comprehensive reporting on innovation and founder journeys.';
  const category = item.categoryLabel || item.category || (isVideo ? 'Video' : 'Startups');
  const image = item.image || item.coverImage || item.bannerImage || item.fallbackImage || item.thumbnail ||
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80';
  const authorName = typeof item.author === 'object' 
    ? (item.author?.name || 'Editorial Bureau') 
    : (item.author || item.host || item.guest || 'Editorial Bureau');
  const authorAvatar = item.author?.avatar || item.authorAvatar || item.guestAvatar || 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const date = item.publishedAt || item.date || item.formattedDate || 'Today';
  const readTime = isVideo 
    ? (item.duration ? `🎬 ${item.duration}` : '🎬 Video') 
    : (item.readTime || (item.readingTime ? `${item.readingTime} min read` : '4 min read'));
  const slug = item.slug || id;
  const link = isVideo ? `/videos/${slug}` : `/stories/${slug}`;

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
    primaryBtnText: isVideo ? 'Watch Video' : 'Read More',
    link,
    slug,
    itemType: isVideo ? 'video' : 'article'
  };
};

// Formatter to standardize an article or video object for Popular Posts Sidebar
const formatForPopularPost = (item) => {
  const id = item._id || item.id || `popular-${Date.now()}`;
  const title = item.title || 'Popular Story';
  const isVideo = item.itemType === 'video' || item.type === 'video' || !!item.duration || !!item.youtubeEmbedUrl;
  const image = item.image || item.coverImage || item.fallbackImage || item.thumbnail || 
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80';
  const readTime = isVideo
    ? (item.duration ? `🎬 ${item.duration}` : '🎬 Video')
    : (item.readTime || (item.readingTime ? `${item.readingTime} min read` : '3 min read'));
  const category = item.categoryLabel || item.category || (isVideo ? 'Video' : 'Trending');
  const slug = item.slug || id;
  const link = isVideo ? `/videos/${slug}` : `/stories/${slug}`;
  const author = typeof item.author === 'object' ? (item.author?.name || 'Author') : (item.author || item.host || item.guest || 'Editorial');
  const date = item.publishedAt || item.date || 'Today';

  return {
    id,
    _id: item._id || id,
    title,
    image,
    coverImage: image,
    readTime,
    category,
    slug,
    link,
    author,
    date,
    itemType: isVideo ? 'video' : 'article'
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
  const [availableVideos, setAvailableVideos] = useState(VIDEO_EPISODES);
  const [pickerContentType, setPickerContentType] = useState('all'); // 'all' | 'articles' | 'videos'

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

  // Pool of available stories & videos
  const pool = useMemo(() => {
    return availableArticles.length > 0 ? availableArticles : (stories.length ? stories : ALL_STORIES);
  }, [availableArticles, stories]);

  const videoPool = useMemo(() => {
    return availableVideos.length > 0 ? availableVideos : VIDEO_EPISODES;
  }, [availableVideos]);

  const combinedPool = useMemo(() => {
    const arts = pool.map(a => ({ ...a, itemType: 'article' }));
    const vids = videoPool.map(v => ({ 
      ...v, 
      itemType: 'video', 
      categoryLabel: v.categoryLabel || v.series || 'Video',
      category: v.categoryLabel || v.series || 'Video'
    }));
    if (pickerContentType === 'articles') return arts;
    if (pickerContentType === 'videos') return vids;
    return [...arts, ...vids];
  }, [pool, videoPool, pickerContentType]);

  // Filtered articles & videos inside the Picker Modal
  const filteredPickerArticles = useMemo(() => {
    return combinedPool.filter(a => {
      const title = (a.title || '').toLowerCase();
      const cat = (a.categoryLabel || a.category || '').toLowerCase();
      const author = (typeof a.author === 'object' && a.author ? a.author.name || '' : (a.author || a.host || a.guest || '')).toLowerCase();
      const q = pickerSearch.trim().toLowerCase();

      const matchesSearch = !q || title.includes(q) || cat.includes(q) || author.includes(q);
      const matchesCat = pickerCategory === 'All' || cat.includes(pickerCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [combinedPool, pickerSearch, pickerCategory]);

  // Unique categories for picker filtering, strictly matched to active content type
  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    if (pickerContentType === 'articles') {
      pool.forEach(a => {
        const c = a.categoryLabel || a.category;
        if (c && typeof c === 'string') cats.add(c.trim());
      });
    } else if (pickerContentType === 'videos') {
      videoPool.forEach(v => {
        const c = v.categoryLabel || v.category || v.series;
        if (c && typeof c === 'string') cats.add(c.trim());
      });
    } else {
      combinedPool.forEach(a => {
        const c = a.categoryLabel || a.category;
        if (c && typeof c === 'string') cats.add(c.trim());
      });
    }
    return Array.from(cats).slice(0, 12);
  }, [pool, videoPool, combinedPool, pickerContentType]);

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
  const handleSwitchPickerContentType = (type) => {
    setPickerContentType(type);
    setPickerCategory('All');
  };

  const handleOpenPicker = (target) => {
    if (target?.type === 'popular-add' && popularArticles.length >= 5) {
      alert('You have reached the maximum limit of 5 cards. Please remove an existing card before adding a new article or video.');
      return;
    }
    setPickerTarget(target);
    setPickerSearch('');
    setPickerCategory('All');
    setPickerContentType(target?.defaultTab || 'articles');
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
        alert('Maximum of 5 cards allowed. Please remove a card before adding another.');
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
                <div className="mhp-section-header" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div className="mhp-section-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{data.popularTitle || 'Popular Posts'}</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: popularArticles.length >= 5 ? '#fef2f2' : '#f0fdf4',
                      color: popularArticles.length >= 5 ? '#dc2626' : '#16a34a',
                      border: popularArticles.length >= 5 ? '1px solid #fecaca' : '1px solid #bbf7d0',
                      marginLeft: '4px'
                    }}>
                      {popularArticles.length}/5 Slots
                    </span>
                  </div>

                  {/* Header Add Buttons: Split for Article vs Video */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className={`lbe-btn-add-mini article ${popularArticles.length >= 5 ? 'disabled' : ''}`}
                      disabled={popularArticles.length >= 5}
                      onClick={() => handleOpenPicker({ type: 'popular-add', defaultTab: 'articles' })}
                      title={popularArticles.length >= 5 ? 'Maximum 5 cards reached. Remove a card below to add another.' : 'Open Articles section to add article (Max 5)'}
                    >
                      <Plus size={13} />
                      <span>{popularArticles.length >= 5 ? 'Max 5' : '+ Article'}</span>
                    </button>
                    <button
                      type="button"
                      className={`lbe-btn-add-mini video ${popularArticles.length >= 5 ? 'disabled' : ''}`}
                      disabled={popularArticles.length >= 5}
                      onClick={() => handleOpenPicker({ type: 'popular-add', defaultTab: 'videos' })}
                      title={popularArticles.length >= 5 ? 'Maximum 5 cards reached. Remove a card below to add another.' : 'Open Videos section to add video (Max 5)'}
                    >
                      <Play size={10} fill="currentColor" />
                      <span>{popularArticles.length >= 5 ? 'Reached' : '+ Video'}</span>
                    </button>
                  </div>
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

                {/* Bottom Add Buttons Group (Split for Article vs Video) */}
                {popularArticles.length < 5 ? (
                  <div className="lbe-popular-bottom-add-group">
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textAlign: 'center', margin: '4px 0 2px' }}>
                      Add to Popular Posts ({5 - popularArticles.length} slot{5 - popularArticles.length > 1 ? 's' : ''} left):
                    </div>
                    <div className="lbe-popular-bottom-add-group-btns">
                      <button
                        type="button"
                        className="lbe-btn-add-popular-split article"
                        onClick={() => handleOpenPicker({ type: 'popular-add', defaultTab: 'articles' })}
                        title="Open Articles Section to Add Article"
                      >
                        <Plus size={15} />
                        <span>+ Add Article</span>
                      </button>
                      <button
                        type="button"
                        className="lbe-btn-add-popular-split video"
                        onClick={() => handleOpenPicker({ type: 'popular-add', defaultTab: 'videos' })}
                        title="Open Videos Section to Add Video"
                      >
                        <Play size={12} fill="currentColor" />
                        <span>+ Add Video</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="lbe-popular-max-banner">
                    <span className="lbe-popular-max-pill">5 / 5 Maximum Cards Reached</span>
                    <span>Maximum 5 cards limit reached. Remove any card using the red trash icon to add another article or video.</span>
                  </div>
                )}
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
                      ? 'Select Slide for Hero Slider'
                      : pickerContentType === 'videos'
                        ? `Select Video for Popular Slot #${popularArticles.length + 1}`
                        : `Select Article for Popular Slot #${popularArticles.length + 1}`}
                  </span>
                </h4>
                <p className="lbe-picker-subtitle">
                  {pickerContentType === 'videos'
                    ? 'Choose any studio interview, keynote, or video episode to add to popular posts.'
                    : 'Choose any published editorial article to add to popular posts.'}
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

            {/* Search, Tabs, and Category Filters */}
            <div className="lbe-picker-toolbar">
              {/* Type Switcher Tabs: Articles Section vs Videos Section */}
              <div className="lbe-picker-type-tabs">
                <button
                  type="button"
                  className={`lbe-picker-type-tab ${pickerContentType === 'articles' ? 'active' : ''}`}
                  onClick={() => handleSwitchPickerContentType('articles')}
                >
                  📄 Articles Section ({pool.length})
                </button>
                <button
                  type="button"
                  className={`lbe-picker-type-tab ${pickerContentType === 'videos' ? 'active' : ''}`}
                  onClick={() => handleSwitchPickerContentType('videos')}
                >
                  🎬 Videos Section ({videoPool.length})
                </button>
                <button
                  type="button"
                  className={`lbe-picker-type-tab ${pickerContentType === 'all' ? 'active' : ''}`}
                  onClick={() => handleSwitchPickerContentType('all')}
                >
                  🌐 All Content ({pool.length + videoPool.length})
                </button>
              </div>

              <div className="lbe-picker-search-wrap">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search articles & videos by title, author, desk..."
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

            {/* Articles & Videos List / Grid */}
            <div className="lbe-picker-body">
              {filteredPickerArticles.length === 0 ? (
                <div className="lbe-picker-empty">
                  <p>No content found matching "{pickerSearch}".</p>
                </div>
              ) : (
                <div className="lbe-picker-grid">
                  {filteredPickerArticles.map(article => {
                    const artId = article._id || article.id;
                    const artTitle = article.title || 'Untitled';
                    const artImg = article.image || article.coverImage || article.fallbackImage || article.thumbnail || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
                    const isVid = article.itemType === 'video' || !!article.duration || !!article.youtubeEmbedUrl;
                    const artCat = article.categoryLabel || article.category || (isVid ? 'Video' : 'Article');
                    const artAuthor = typeof article.author === 'object' ? (article.author?.name || 'Author') : (article.author || article.host || article.guest || 'Author');
                    const artDate = isVid ? (article.duration ? `🎬 ${article.duration}` : '🎬 Video') : (article.publishedAt || article.date || 'Recent');

                    return (
                      <div 
                        key={artId} 
                        className="lbe-picker-card"
                        onClick={() => handleSelectArticleFromPicker(article)}
                      >
                        <div className="lbe-picker-card-thumb-wrap">
                          <img src={artImg} alt={artTitle} className="lbe-picker-card-thumb" />
                          <span className={`lbe-picker-card-category ${isVid ? 'video' : ''}`}>
                            {isVid ? `🎬 ${artCat}` : artCat}
                          </span>
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
                            className={`lbe-picker-select-btn ${isVid ? 'video' : 'article'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectArticleFromPicker(article);
                            }}
                          >
                            {isVid ? <Play size={11} fill="currentColor" /> : <Check size={13} />}
                            <span>{isVid ? 'Select This Video' : 'Select This Article'}</span>
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

