import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, Sparkles, Plus, Trash2, ArrowLeft, ArrowRight, 
  ChevronLeft, ChevronRight, Search, RefreshCw, Layers, 
  Eye, Check, Edit2, Edit3, Image as ImageIcon, ExternalLink,
  Cpu, Briefcase, GraduationCap, Heart, Plane, Gamepad2, Atom,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Bookmark, Clock,
  Filter, X
} from 'lucide-react';
import { PageService } from '../../services/pageService';
import { ArticleService } from '../../services/articleService';
import { StoryService, getDefaultSeedStories } from '../../services/storyService';
import { ALL_STORIES } from '../../data/storiesData';
import './AdminTrendingView.css';

// Rank color helpers matching TrendingPage
const RANK_COLORS = [
  { text: '#e11d48', bg: '#ffe4e6' }, // 1 - Rose
  { text: '#2563eb', bg: '#dbeafe' }, // 2 - Blue
  { text: '#7c3aed', bg: '#ede9fe' }, // 3 - Purple
  { text: '#059669', bg: '#d1fae5' }, // 4 - Emerald
  { text: '#0284c7', bg: '#e0f2fe' }, // 5 - Sky
  { text: '#ea580c', bg: '#ffedd5' }, // 6 - Orange
  { text: '#db2777', bg: '#fce7f3' }, // 7 - Pink
  { text: '#4f46e5', bg: '#e0e7ff' }, // 8 - Indigo
];

const CATEGORY_STYLES = {
  technology: { bg: '#4f46e5' },
  business: { bg: '#059669' },
  education: { bg: '#7c3aed' },
  health: { bg: '#e11d48' },
  travel: { bg: '#ea580c' },
  science: { bg: '#2563eb' },
  lifestyle: { bg: '#0891b2' },
  startups: { bg: '#059669' },
  enterprise: { bg: '#0284c7' },
  fintech: { bg: '#7c3aed' },
  ai: { bg: '#6366f1' },
  deeptech: { bg: '#4338ca' },
  socialstory: { bg: '#0d9488' },
  herstory: { bg: '#db2777' },
  smbstory: { bg: '#d97706' },
  hindi: { bg: '#ea580c' },
  sustainability: { bg: '#16a34a' }
};

const getCategoryColor = (catName) => {
  const clean = (catName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [k, v] of Object.entries(CATEGORY_STYLES)) {
    if (clean.includes(k.replace(/[^a-z0-9]/g, ''))) return v.bg;
  }
  return '#ea580c';
};

// Clean date formatter that converts raw ISO strings to friendly readable dates
const formatStoryDate = (dateStr) => {
  if (!dateStr || dateStr === 'Today') return 'Today';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

// Clean normalizer ensuring all articles have consistent, uniform properties
const normalizeArticle = (a, index = 0) => {
  if (!a) return null;
  const id = String(a.id || a._id || a.slug || `story-${index}`);
  const title = a.title || 'Untitled Article';
  const cat = a.categoryName || a.categoryLabel || a.category || 'Technology';
  const excerpt = a.excerpt || a.subtitle || a.summary || a.description || '';
  const image = a.image || a.featuredImage?.url || (typeof a.featuredImage === 'string' ? a.featuredImage : null) || a.heroImage || a.coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';
  const author = a.authorName || (typeof a.author === 'object' && a.author ? a.author.name : (a.author || 'Editorial Bureau'));
  const authorAvatar = a.authorAvatar || (typeof a.author === 'object' ? a.author?.avatar : null) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const rawDate = a.publishedAt || a.date || a.createdAt || 'Today';
  const date = formatStoryDate(rawDate);
  const readTime = a.readTime || (a.readingTime ? `${a.readingTime} min read` : '5 min read');
  const slug = a.slug || id;
  const views = typeof a.views === 'number' ? a.views : (typeof a.claps === 'number' ? a.claps * 4 : 450);

  return {
    ...a,
    id,
    _id: a._id || id,
    title,
    excerpt,
    category: cat,
    categoryName: cat,
    categoryLabel: cat,
    image,
    coverImage: image,
    heroImage: image,
    author,
    authorName: author,
    authorAvatar,
    date,
    readTime,
    readingTime: a.readingTime || 5,
    slug,
    views
  };
};

export default function AdminTrendingView({ onShowToast, onNavigate }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [allArticles, setAllArticles] = useState([]);

  // Active Category filter for the ranked cards grid preview
  const [activeCategory, setActiveCategory] = useState('All');

  // Hero Slider State & Collapse Toggle
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [heroHeading, setHeroHeading] = useState('Trending in Technology & Business');
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);

  // Ranked Cards Grid State
  const [feedHeading, setFeedHeading] = useState('Ranked Stories');
  const [rankedArticles, setRankedArticles] = useState([]);

  // Hero section strictly showcases ONLY the Top 5 Ranked Articles (#1 to #5)
  const heroSlides = useMemo(() => {
    return rankedArticles.slice(0, 5);
  }, [rankedArticles]);

  // Modals State
  const [pickerModal, setPickerModal] = useState({ isOpen: false, target: null });
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  const [editModal, setEditModal] = useState({ isOpen: false, target: null, data: null });

  // Category Filter Popover Dropdown State
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load trending page configuration & articles
  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    setLoading(true);
    try {
      const [pageData, articlesRes, storiesRes] = await Promise.all([
        PageService.getPageById('trending').catch(() => null),
        ArticleService.getArticles({ limit: 500 }).catch(() => null),
        StoryService.getStories({ limit: 500 }).catch(() => null)
      ]);

      const articlesList = (articlesRes?.data && Array.isArray(articlesRes.data)) ? articlesRes.data : [];
      const storiesList = (storiesRes?.data && Array.isArray(storiesRes.data)) ? storiesRes.data : [];
      const seedList = getDefaultSeedStories();

      // Combined deduplicated pool across all sources to guarantee every single published article is available
      const combined = [];
      const seen = new Set();
      for (const item of [...articlesList, ...storiesList, ...seedList, ...ALL_STORIES]) {
        if (!item || typeof item !== 'object') continue;
        const norm = normalizeArticle(item);
        if (!norm) continue;
        const key = String(norm.slug || norm.id || norm._id || norm.title).toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          combined.push(norm);
        }
      }

      setAllArticles(combined);

      if (pageData) {
        setPage(pageData);
        const heroSec = (pageData.sections || []).find(s => s.type === 'hero' || s.id === 'trending_hero');
        const feedSec = (pageData.sections || []).find(s => s.type === 'stories_feed' || s.id === 'trending_feed');

        if (heroSec?.data) {
          setHeroHeading(heroSec.data.heading || heroSec.data.title || 'Trending in Technology & Business');
        }

        if (feedSec?.data) {
          setFeedHeading(feedSec.data.heading || feedSec.data.title || 'Ranked Stories');
          if (Array.isArray(feedSec.data.articles) && feedSec.data.articles.length > 0) {
            const customNorm = feedSec.data.articles.map((a, idx) => normalizeArticle(a, idx));
            const customIds = new Set(customNorm.map(a => String(a.id || a._id || a.slug)));
            const remaining = combined.filter(a => !customIds.has(String(a.id || a._id || a.slug)));
            setRankedArticles([...customNorm, ...remaining]);
          } else {
            const sorted = [...combined].sort((a, b) => (b.views || 0) - (a.views || 0));
            setRankedArticles(sorted);
          }
        } else {
          const sorted = [...combined].sort((a, b) => (b.views || 0) - (a.views || 0));
          setRankedArticles(sorted);
        }
      } else {
        const sorted = [...combined].sort((a, b) => (b.views || 0) - (a.views || 0));
        setRankedArticles(sorted);
      }
    } catch (err) {
      console.error('Failed to load trending data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCards, setShowAllCards] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const CARDS_PER_PAGE = 8;

  // Category counts dynamically derived from allArticles
  const categoryStats = useMemo(() => {
    const counts = {};
    allArticles.forEach(a => {
      const c = a.categoryName || a.categoryLabel || a.category;
      if (c && typeof c === 'string') {
        const key = c.trim();
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [allArticles]);

  // Categories list with All first, then sorted by popularity count
  const categoriesList = useMemo(() => {
    const list = Object.keys(categoryStats).sort((a, b) => (categoryStats[b] || 0) - (categoryStats[a] || 0));
    return ['All', ...list];
  }, [categoryStats]);

  // Filtered stories in Ranked Cards Grid across ALL articles
  const displayRankedArticles = useMemo(() => {
    let list = rankedArticles;
    if (activeCategory !== 'All') {
      const target = activeCategory.toLowerCase().trim();
      list = list.filter(a => {
        const cat = (a.categoryName || a.categoryLabel || a.category || '').toLowerCase().trim();
        return cat === target || cat.includes(target) || (target === 'business' && cat.includes('startup'));
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a => {
        const title = (a.title || '').toLowerCase();
        const author = (a.authorName || a.author || '').toLowerCase();
        const cat = (a.categoryName || a.categoryLabel || a.category || '').toLowerCase();
        const excerpt = (a.excerpt || '').toLowerCase();
        return title.includes(q) || author.includes(q) || cat.includes(q) || excerpt.includes(q);
      });
    }
    return list;
  }, [rankedArticles, activeCategory, searchQuery]);

  const visibleArticles = useMemo(() => {
    if (showAllCards) return displayRankedArticles;
    const start = currentPage * CARDS_PER_PAGE;
    return displayRankedArticles.slice(start, start + CARDS_PER_PAGE);
  }, [displayRankedArticles, showAllCards, currentPage]);

  const totalPages = Math.max(1, Math.ceil(displayRankedArticles.length / CARDS_PER_PAGE));

  // Picker modal filtered pool
  const filteredPickerPool = useMemo(() => {
    return allArticles.filter(a => {
      const title = (a.title || '').toLowerCase();
      const cat = (a.categoryName || a.categoryLabel || a.category || '').toLowerCase();
      const author = (a.authorName || a.author || '').toLowerCase();
      const q = pickerSearch.trim().toLowerCase();
      const matchesSearch = !q || title.includes(q) || cat.includes(q) || author.includes(q);
      const matchesCat = pickerCategory === 'All' || cat.includes(pickerCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [allArticles, pickerSearch, pickerCategory]);

  // ─────────────────────────────────────────────────────────
  // HERO SLIDES ACTIONS
  // ─────────────────────────────────────────────────────────
  const activeSlide = heroSlides[activeSlideIdx] || heroSlides[0] || {};

  const handleNextSlide = () => {
    setActiveSlideIdx(prev => (prev + 1) % Math.max(1, heroSlides.length));
  };

  const handlePrevSlide = () => {
    setActiveSlideIdx(prev => (prev - 1 + heroSlides.length) % Math.max(1, heroSlides.length));
  };

  const handleDeleteSlide = (idx) => {
    if (heroSlides.length <= 1) {
      if (onShowToast) onShowToast('You must keep at least 1 hero slide.');
      return;
    }
    const next = heroSlides.filter((_, i) => i !== idx);
    setHeroSlides(next);
    setActiveSlideIdx(prev => Math.min(prev, next.length - 1));
  };

  // ─────────────────────────────────────────────────────────
  // RANKED STORIES ACTIONS
  // ─────────────────────────────────────────────────────────
  const handleMoveArticle = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= rankedArticles.length) return;
    const next = [...rankedArticles];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setRankedArticles(next);
  };

  const handleRemoveRankedArticle = (idx) => {
    setRankedArticles(prev => prev.filter((_, i) => i !== idx));
  };

  // ─────────────────────────────────────────────────────────
  // PICKER MODAL CONFIRMATION
  // ─────────────────────────────────────────────────────────
  const handleSelectArticleFromPicker = (article) => {
    const formatted = normalizeArticle(article);
    const { type, index } = pickerModal.target || {};

    if ((type === 'hero-replace' || type === 'card-replace') && typeof index === 'number') {
      setRankedArticles(prev => {
        const next = [...prev];
        next[index] = formatted;
        return next;
      });
    } else if (type === 'card-add') {
      setRankedArticles(prev => [formatted, ...prev]);
    }

    setPickerModal({ isOpen: false, target: null });
    if (onShowToast) onShowToast(`Selected "${article.title.slice(0, 35)}..."`);
  };

  // ─────────────────────────────────────────────────────────
  // DIRECT ARTICLE EDIT MODAL SAVE
  // ─────────────────────────────────────────────────────────
  const handleSaveEditModal = () => {
    const { target, index, data } = editModal;
    if ((target === 'hero-slide' || target === 'ranked-card') && typeof index === 'number') {
      setRankedArticles(prev => {
        const next = [...prev];
        next[index] = { ...next[index], ...data };
        return next;
      });
    }
    setEditModal({ isOpen: false, target: null, data: null });
    if (onShowToast) onShowToast('Article updated.');
  };

  // ─────────────────────────────────────────────────────────
  // SAVE & PUBLISH LIVE TO DATABASE
  // ─────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updatedSections = [
        {
          id: 'trending_hero',
          type: 'hero',
          order: 1,
          enabled: true,
          data: {
            title: heroHeading,
            heading: heroHeading,
            slides: heroSlides,
            heroSource: 'custom'
          }
        },
        {
          id: 'trending_feed',
          type: 'stories_feed',
          order: 2,
          enabled: true,
          data: {
            title: feedHeading,
            heading: feedHeading,
            limit: rankedArticles.length,
            articles: rankedArticles,
            hasCustomArticles: true
          }
        }
      ];

      const payload = {
        id: 'trending',
        title: page?.title || 'Trending Stories',
        slug: 'trending',
        description: page?.description || 'Most read, viral, and trending startup stories.',
        status: 'published',
        sections: updatedSections
      };

      await PageService.updatePage('trending', payload);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onShowToast) onShowToast('Trending Page layout permanently saved and published live!');
    } catch (err) {
      console.error('Failed to save trending page:', err);
      if (onShowToast) onShowToast(err.message || 'Failed to save trending page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="atv-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw size={32} className="lbe-spin" color="#ea580c" />
        <p style={{ color: '#64748b', fontWeight: 650, marginTop: '12px' }}>Loading Trending Page Studio...</p>
      </div>
    );
  }

  const slideTitle = activeSlide.title || 'Discover the Top Trending Insights';
  const slideExcerpt = activeSlide.excerpt || activeSlide.subtitle || activeSlide.description || '';
  const slideCat = activeSlide.categoryLabel || activeSlide.category || 'Trending';
  const slideImg = activeSlide.image || activeSlide.featuredImage?.url || activeSlide.heroImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=80';
  const slideAuthor = typeof activeSlide.author === 'object' ? activeSlide.author?.name : (activeSlide.author || 'Editorial Bureau');
  const slideAvatar = activeSlide.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const slideDate = activeSlide.date || activeSlide.publishedAt || 'Today';

  return (
    <div className="atv-fullpage-root">
      {/* ── Full-Page Studio Top Bar ── */}
      <header className="atv-studio-topbar">
        <div className="atv-topbar-left">
          <button
            type="button"
            className="atv-back-nav-btn"
            onClick={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
            title="Return to Pages Management"
          >
            <ArrowLeft size={16} />
            <span>Back to Pages</span>
          </button>
        </div>

        <div className="atv-topbar-right">
          <button
            type="button"
            className={`atv-btn-primary ${saveSuccess ? 'saved' : ''}`}
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="lbe-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check size={15} />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="atv-container">
        {/* ── 1. SECTION A: Top Interactive Hero Slider ── */}
      {heroSlides.length > 0 && activeSlide && (
        <div 
          className="atv-hero-preview-box"
          style={{ backgroundImage: `url(${slideImg})`, position: 'relative' }}
        >
          <div className="atv-hero-overlay" />
            
            <div className="atv-hero-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="atv-hero-badge" style={{ background: getCategoryColor(slideCat) }}>
                  {slideCat}
                </span>
                <span style={{ 
                  background: 'rgba(234, 88, 12, 0.9)', 
                  color: '#ffffff', 
                  fontSize: '0.74rem', 
                  fontWeight: 800, 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  letterSpacing: '0.04em' 
                }}>
                  TOP RANK #{activeSlideIdx + 1}
                </span>
              </div>

              <h3 className="atv-hero-title">{slideTitle}</h3>

              {slideExcerpt && (
                <p className="atv-hero-desc">{slideExcerpt}</p>
              )}

              <div className="atv-hero-meta">
                <img src={slideAvatar} alt={slideAuthor} className="atv-hero-avatar" />
                <span style={{ fontWeight: 700, color: '#ffffff' }}>{slideAuthor}</span>
                <span>•</span>
                <span>{slideDate}</span>
                <span>•</span>
                <span style={{ color: '#ea580c', fontWeight: 800 }}>Slide {activeSlideIdx + 1} of {heroSlides.length} (Rank #{activeSlideIdx + 1})</span>
              </div>
            </div>

            {/* Embedded Slider Navigation matching TrendingPage */}
            <div style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)'
                  }}
                  title="Previous slide"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)'
                  }}
                  title="Next slide"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {heroSlides.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveSlideIdx(idx)}
                    title={`Slide ${idx + 1} (Rank #${idx + 1})`}
                    style={{
                      width: idx === activeSlideIdx ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: idx === activeSlideIdx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      {/* ── 2. SECTION B: Full-Screen Ranked Stories Grid (All Published Articles) ── */}
      <div className="atv-section-card" id="atv-articles-section">
        {/* Unified Search & Category Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          {/* Left: Prominent Search Input */}
          <div className="atv-search-bar" style={{ flex: '1', minWidth: '300px', maxWidth: '520px' }}>
            <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search articles by title, author, keyword..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="atv-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')} 
                className="atv-search-clear-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Filter Button with Popover Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }} ref={filterRef}>
            <button
              type="button"
              className={`atv-filter-dropdown-btn ${activeCategory !== 'All' ? 'active' : ''}`}
              onClick={() => setFilterDropdownOpen(prev => !prev)}
              aria-expanded={filterDropdownOpen}
              title="Filter articles by category"
            >
              <Filter size={15} />
              <span>
                {activeCategory === 'All' ? 'Filter by Category' : `Category: ${activeCategory}`}
              </span>
              <span className="atv-filter-count-badge">
                {activeCategory === 'All' ? allArticles.length : (categoryStats[activeCategory] || 0)}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transform: filterDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {filterDropdownOpen && (
              <div className="atv-filter-popover-menu">
                <div className="atv-filter-popover-title">Filter by Category</div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {categoriesList.map(cat => {
                    const isSelected = activeCategory === cat;
                    const count = cat === 'All' ? allArticles.length : (categoryStats[cat] || 0);
                    const dotColor = cat === 'All' ? '#ea580c' : getCategoryColor(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`atv-filter-popover-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setActiveCategory(cat);
                          setCurrentPage(0);
                          setFilterDropdownOpen(false);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span 
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: dotColor,
                              flexShrink: 0
                            }}
                          />
                          <span style={{ fontWeight: isSelected ? 750 : 500 }}>{cat}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="atv-filter-popover-count">{count}</span>
                          {isSelected && <Check size={14} color="#ea580c" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeCategory !== 'All' && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="atv-filter-reset-btn"
                      onClick={() => {
                        setActiveCategory('All');
                        setCurrentPage(0);
                        setFilterDropdownOpen(false);
                      }}
                    >
                      Reset to All Categories ({allArticles.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Count & View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
          <div>
            Showing <strong style={{ color: '#0f172a' }}>{visibleArticles.length}</strong> of <strong style={{ color: '#0f172a' }}>{displayRankedArticles.length}</strong> {activeCategory !== 'All' ? `${activeCategory} ` : ''}Articles
            {searchQuery && ` (filtered by "${searchQuery}")`}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 650 }}>View Mode:</span>
            <button
              type="button"
              onClick={() => setShowAllCards(true)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: showAllCards ? '#ea580c' : '#cbd5e1',
                background: showAllCards ? 'rgba(234, 88, 12, 0.1)' : '#ffffff',
                color: showAllCards ? '#ea580c' : '#475569',
                fontSize: '0.76rem',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              Show All ({displayRankedArticles.length})
            </button>
            <button
              type="button"
              onClick={() => setShowAllCards(false)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: !showAllCards ? '#ea580c' : '#cbd5e1',
                background: !showAllCards ? 'rgba(234, 88, 12, 0.1)' : '#ffffff',
                color: !showAllCards ? '#ea580c' : '#475569',
                fontSize: '0.76rem',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              Paginated (8/page)
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Card Grid (arranged over the screen!) */}
        <div className="atv-cards-grid">
          {visibleArticles.map((article, inPageIdx) => {
            const artId = article.id || article._id || `art-${inPageIdx}`;
            const artTitle = article.title || 'Untitled Article';
            const artCat = article.categoryName || article.categoryLabel || article.category || 'Technology';
            const artExcerpt = article.excerpt || article.subtitle || article.summary || article.description || '';
            const artImg = article.image || article.featuredImage?.url || (typeof article.featuredImage === 'string' ? article.featuredImage : null) || article.heroImage || article.coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';
            const artAuthor = article.authorName || (typeof article.author === 'object' && article.author ? article.author.name : (article.author || 'Editorial Bureau'));
            const artAvatar = article.authorAvatar || (typeof article.author === 'object' ? article.author?.avatar : null) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
            const artDate = article.date || article.publishedAt || 'Today';
            const artReadTime = article.readTime || (article.readingTime ? `${article.readingTime} min read` : '5 min read');
            const artViews = typeof article.views === 'number' ? article.views : (typeof article.claps === 'number' ? article.claps * 4 : 450);
            
            const displayRank = showAllCards ? inPageIdx : currentPage * CARDS_PER_PAGE + inPageIdx;
            const rankColor = RANK_COLORS[displayRank % RANK_COLORS.length];
            const masterRankIdx = rankedArticles.findIndex(a => (a.id || a._id || a.slug) === (article.id || article._id || article.slug));
            const targetIdx = masterRankIdx >= 0 ? masterRankIdx : displayRank;

            return (
              <div key={artId || inPageIdx} className="atv-card-item">
                {/* Top Control Bar: Position + Action Buttons */}
                <div className="atv-card-admin-bar">
                  <div className="atv-rank-label">
                    <span style={{ color: '#ea580c', fontWeight: 850 }}>#{displayRank + 1}</span>
                    <span style={{ marginLeft: '6px', opacity: 0.65 }}>in Ranked Grid</span>
                  </div>

                  <div className="atv-card-btn-group">
                    <button
                      type="button"
                      className="atv-icon-btn"
                      disabled={targetIdx <= 0}
                      onClick={() => handleMoveArticle(targetIdx, 'up')}
                      title="Move earlier (# position)"
                    >
                      <ArrowLeft size={13} />
                    </button>

                    <button
                      type="button"
                      className="atv-icon-btn"
                      disabled={targetIdx >= rankedArticles.length - 1}
                      onClick={() => handleMoveArticle(targetIdx, 'down')}
                      title="Move later (# position)"
                    >
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      className="atv-icon-btn"
                      onClick={() => setPickerModal({ isOpen: true, target: { type: 'card-replace', index: targetIdx } })}
                      title="Replace this article"
                    >
                      <RefreshCw size={13} />
                    </button>

                    <button
                      type="button"
                      className="atv-icon-btn"
                      onClick={() => setEditModal({
                        isOpen: true,
                        target: 'ranked-card',
                        index: targetIdx,
                        data: { ...article }
                      })}
                      title="Edit article details"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      className="atv-icon-btn danger"
                      onClick={() => handleRemoveRankedArticle(targetIdx)}
                      title="Remove from ranked grid"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Body - Horizontal Layout (Left: Thumbnail + Meta below image, Right: Content) */}
                <div className="atv-card-interior">
                  {/* Left Column: Thumbnail with Rank Badge + Author Meta below it */}
                  <div className="atv-card-thumb-column">
                    <div className="atv-card-thumb-wrap">
                      <div 
                        className="atv-card-badge"
                        style={{ color: rankColor.text, background: rankColor.bg }}
                      >
                        {displayRank + 1}
                      </div>
                      <img 
                        src={artImg} 
                        alt={artTitle} 
                        className="atv-card-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                        }}
                        loading="lazy"
                      />
                    </div>

                    {/* Author & Date Meta Placed Directly BELOW the Image */}
                    <div className="atv-card-meta-below-img">
                      <img src={artAvatar} alt={artAuthor} className="atv-card-meta-avatar" />
                      <div className="atv-card-meta-info">
                        <span className="atv-card-meta-author" title={artAuthor}>{artAuthor}</span>
                        <div className="atv-card-meta-sub">
                          <span>{artDate}</span>
                          <span>•</span>
                          <span>{artReadTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="atv-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '0.4rem' }}>
                      <span 
                        className="atv-card-cat"
                        style={{ background: getCategoryColor(artCat), margin: 0 }}
                      >
                        {artCat}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 750 }}>
                        🔥 {artViews.toLocaleString()} views
                      </span>
                    </div>

                    <h3 className="atv-card-title">{artTitle}</h3>

                    {artExcerpt && (
                      <p className="atv-card-desc">{artExcerpt}</p>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                      <a 
                        href={`/articles/${article.slug || article._id || article.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View published article"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', textDecoration: 'none', fontSize: '0.76rem', fontWeight: 650 }}
                      >
                        <ExternalLink size={12} />
                        <span>Live</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Bar when not showing all */}
        {!showAllCards && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              className="atv-btn-secondary"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: currentPage === 0 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', margin: '0 8px' }}>
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              type="button"
              className="atv-btn-secondary"
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: currentPage === totalPages - 1 ? 0.5 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      </div>

      {/* ── MODAL 1: ARTICLE PICKER MODAL ── */}
      {pickerModal.isOpen && (
        <div className="atv-modal-overlay" onClick={() => setPickerModal({ isOpen: false, target: null })}>
          <div className="atv-modal-card" onClick={e => e.stopPropagation()}>
            <div className="atv-modal-header">
              <h3>Select Article from Library</h3>
              <button 
                type="button" 
                className="atv-icon-btn" 
                onClick={() => setPickerModal({ isOpen: false, target: null })}
              >
                ✕
              </button>
            </div>

            <div className="atv-modal-body">
              <div className="atv-picker-search">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search articles by title or topic..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="atv-input"
                  style={{ width: '100%' }}
                  autoFocus
                />
              </div>

              <div className="atv-picker-list">
                {filteredPickerPool.map((item, idx) => {
                  const img = item.featuredImage?.url || (typeof item.featuredImage === 'string' ? item.featuredImage : null) || item.image || item.coverImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80';
                  return (
                    <div
                      key={item.id || item._id || idx}
                      className="atv-picker-item"
                      onClick={() => handleSelectArticleFromPicker(item)}
                    >
                      <img src={img} alt={item.title} className="atv-picker-thumb" />
                      <div className="atv-picker-info">
                        <h4 className="atv-picker-title">{item.title}</h4>
                        <span className="atv-picker-meta">
                          {item.categoryLabel || item.category || 'Article'} • {item.author?.name || item.author || 'Desk'}
                        </span>
                      </div>
                      <button type="button" className="atv-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                        Select
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="atv-modal-footer">
              <button
                type="button"
                className="atv-btn-secondary"
                onClick={() => setPickerModal({ isOpen: false, target: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: QUICK EDIT MODAL (Slide or Card) ── */}
      {editModal.isOpen && editModal.data && (
        <div className="atv-modal-overlay" onClick={() => setEditModal({ isOpen: false, target: null, data: null })}>
          <div className="atv-modal-card" onClick={e => e.stopPropagation()}>
            <div className="atv-modal-header">
              <h3>{editModal.target === 'hero-slide' ? 'Edit Hero Slide Details' : 'Edit Ranked Card Details'}</h3>
              <button 
                type="button" 
                className="atv-icon-btn" 
                onClick={() => setEditModal({ isOpen: false, target: null, data: null })}
              >
                ✕
              </button>
            </div>

            <div className="atv-modal-body">
              <div className="atv-field-group">
                <label>Article Title / Headline</label>
                <input
                  type="text"
                  value={editModal.data.title || ''}
                  onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                  className="atv-input"
                />
              </div>

              <div className="atv-field-group">
                <label>Summary / Excerpt</label>
                <textarea
                  rows={3}
                  value={editModal.data.excerpt || editModal.data.summary || ''}
                  onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, excerpt: e.target.value, summary: e.target.value } }))}
                  className="atv-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="atv-field-group">
                  <label>Category Label</label>
                  <input
                    type="text"
                    value={editModal.data.categoryLabel || editModal.data.category || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, category: e.target.value, categoryLabel: e.target.value } }))}
                    className="atv-input"
                  />
                </div>

                <div className="atv-field-group">
                  <label>Author Name</label>
                  <input
                    type="text"
                    value={typeof editModal.data.author === 'object' ? editModal.data.author?.name || '' : (editModal.data.author || '')}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, author: e.target.value } }))}
                    className="atv-input"
                  />
                </div>
              </div>

              <div className="atv-field-group">
                <label>Cover Image URL</label>
                <input
                  type="text"
                  value={editModal.data.image || editModal.data.featuredImage?.url || ''}
                  onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, image: e.target.value } }))}
                  className="atv-input"
                />
              </div>
            </div>

            <div className="atv-modal-footer">
              <button
                type="button"
                className="atv-btn-secondary"
                onClick={() => setEditModal({ isOpen: false, target: null, data: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="atv-btn-primary"
                onClick={handleSaveEditModal}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
