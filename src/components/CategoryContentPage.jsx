import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Search, Mail, 
  Sparkles, Flame, Clock, Calendar, Bookmark, TrendingUp, BookOpen, 
  Send, CheckCircle2, X, LayoutGrid, Columns, Layers
} from 'lucide-react';
import './CategoryContentPage.css';
import { ALL_STORIES } from '../data/storiesData';
import { PageService } from '../services/pageService';

// Safe extraction helpers
const getStoryId = (s, idx = 0) => s?.id || s?._id || s?.slug || `cat-story-${idx}`;

const getStoryImage = (s) => {
  if (!s) return 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80';
  const img = s.featuredImage?.url || (typeof s.featuredImage === 'string' ? s.featuredImage : null) || s.heroImage || s.image;
  return img || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80';
};

const getStoryTitle = (s) => s?.title || 'Untitled Article';

const getStoryExcerpt = (s) => {
  if (!s) return '';
  if (s.summary && typeof s.summary === 'string') return s.summary;
  if (s.subtitle && typeof s.subtitle === 'string') return s.subtitle;
  if (s.excerpt && typeof s.excerpt === 'string') return s.excerpt;
  if (typeof s.content === 'string') {
    return s.content.replace(/<[^>]+>/g, '').trim().slice(0, 140) + '...';
  }
  if (Array.isArray(s.content) && s.content.length > 0 && typeof s.content[0] === 'string') {
    return s.content[0].replace(/<[^>]+>/g, '').trim().slice(0, 140) + '...';
  }
  return 'Explore deep insights, operational lessons, and strategic perspectives from Indian founders and industry pioneers.';
};

const getStoryCategory = (s) => {
  if (typeof s?.category === 'object' && s?.category?.name) return s.category.name;
  if (typeof s?.category === 'string' && s.category.trim()) return s.category;
  return s?.categoryName || s?.categoryLabel || 'General';
};

const getStoryCategorySlug = (s) => {
  if (typeof s?.category === 'object' && s?.category?.slug) return s.category.slug;
  if (s?.categorySlug) return s.categorySlug;
  const cat = getStoryCategory(s);
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';
};

const getStoryAuthor = (s) => {
  if (typeof s?.author === 'object' && s?.author?.name) return s.author.name;
  if (typeof s?.author === 'string' && s.author.trim()) return s.author;
  return s?.authorName || 'Editorial Staff';
};

const getStoryAvatar = (s) => {
  if (typeof s?.author === 'object' && s?.author?.avatar) return s.author.avatar;
  if (s?.authorAvatar) return s.authorAvatar;
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
};

const getStoryDate = (s) => s?.publishedAt ? new Date(s.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (s?.date || 'Today');

const getStoryReadTime = (s) => s?.readTime || s?.readingTime || '5 min read';

// Canonical category normalization
const normalizeCategory = (cat) => {
  if (!cat) return '';
  if (typeof cat === 'object') {
    cat = cat.name || cat.slug || cat.title || '';
  }
  const s = String(cat).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (s === 'ai' || s === 'ai-deeptech' || s === 'artificial-intelligence' || s === 'deep-tech' || s === 'deeptech' || s === 'ai-story') {
    return 'ai';
  }
  if (s === 'startup' || s === 'startups' || s === 'founder-first' || s === 'funding' || s === 'venture-capital') {
    return 'startups';
  }
  if (s === 'tech' || s === 'technology' || s === 'big-tech' || s === 'cloud' || s === 'software') {
    return 'technology';
  }
  if (s === 'enterprise' || s === 'saas' || s === 'b2b') {
    return 'enterprise';
  }
  if (s === 'fintech' || s === 'bfsi' || s === 'banking' || s === 'web3' || s === 'crypto') {
    return 'fintech';
  }
  if (s === 'her-story' || s === 'herstory' || s === 'women') {
    return 'herstory';
  }
  if (s === 'smb' || s === 'smbstory' || s === 'smb-story' || s === 'msme' || s === 'd2c' || s === 'retail') {
    return 'smbstory';
  }
  if (s === 'hindi' || s === 'ys-hindi' || s === 'yshindi') {
    return 'hindi';
  }
  if (s === 'social' || s === 'social-story' || s === 'socialstory' || s === 'impact' || s === 'climate') {
    return 'social-story';
  }
  if (s === 'leadership' || s === 'workplace') {
    return 'leadership';
  }
  return s;
};

const getStoryCanonicalCategory = (story) => {
  if (!story) return '';
  if (story.category) {
    const n = normalizeCategory(story.category);
    if (n) return n;
  }
  if (story.categoryName) {
    const n = normalizeCategory(story.categoryName);
    if (n) return n;
  }
  if (story.categoryLabel) {
    const n = normalizeCategory(story.categoryLabel);
    if (n) return n;
  }
  if (story.categorySlug) {
    const n = normalizeCategory(story.categorySlug);
    if (n) return n;
  }
  return '';
};

// Strict category matching (shows ONLY articles strictly belonging to that category)
const matchesCategory = (story, target) => {
  if (!story) return false;
  if (!target || target === 'All' || target === 'content' || target === 'all' || target === 'categories') return true;

  const targetNorm = normalizeCategory(target);
  const storyNorm = getStoryCanonicalCategory(story);

  return storyNorm === targetNorm;
};

// Available Core Category Desks
export const CORE_CATEGORIES = [
  { name: 'All', key: 'All' },
  { name: 'Startups', key: 'startups' },
  { name: 'Technology', key: 'technology' },
  { name: 'AI & DeepTech', key: 'ai' },
  { name: 'Enterprise', key: 'enterprise' },
  { name: 'FinTech', key: 'fintech' },
  { name: 'SMB & D2C', key: 'smbstory' },
  { name: 'HerStory', key: 'herstory' },
  { name: 'Leadership', key: 'leadership' }
];

export default function CategoryContentPage({
  slug = 'content',
  stories = [],
  customConfig = null,
  onSelectStory,
  onBackToHome,
  onCategoryClick,
  onShowToast,
  isSaved,
  onToggleSave
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSubCategory, setActiveSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Dynamic Page Configuration (CMS Live Studio Integration) ──
  const [liveConfig, setLiveConfig] = useState(() => {
    if (customConfig) return customConfig;
    try {
      const stored = localStorage.getItem('goreadpost_category_page_config');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    if (customConfig) {
      setLiveConfig(customConfig);
      return;
    }

    const loadConfig = async () => {
      try {
        const page = await PageService.getPageById('category').catch(() => null);
        if (page) {
          const heroSec = (page.sections || []).find(s => s.type === 'hero' || s.id === 'category_hero');
          const feedSec = (page.sections || []).find(s => s.type === 'stories_feed' || s.id === 'category_feed');
          setLiveConfig({
            layoutMode: feedSec?.data?.layoutMode === '2col' ? 'grid' : (feedSec?.data?.layoutMode || 'grid'),
            cardsPerPage: feedSec?.data?.cardsPerPage || 12,
            defaultSort: feedSec?.data?.defaultSort || 'latest',
            showPills: feedSec?.data?.showPills !== false,
            showHero: heroSec?.enabled !== false,
            heroHeading: heroSec?.data?.heading || heroSec?.data?.title,
            heroSubhead: heroSec?.data?.subheadline || heroSec?.data?.subtitle,
            heroBadge: heroSec?.data?.badge,
            heroImage: heroSec?.data?.image,
            heroBtnText: heroSec?.data?.buttonText,
            curation: feedSec?.data?.curation || {}
          });
        }
      } catch (err) {}
    };

    loadConfig();

    const handleCategoryConfigChange = (e) => {
      if (e.detail) {
        const heroSec = (e.detail.sections || []).find(s => s.type === 'hero' || s.id === 'category_hero');
        const feedSec = (e.detail.sections || []).find(s => s.type === 'stories_feed' || s.id === 'category_feed');
        setLiveConfig({
          layoutMode: feedSec?.data?.layoutMode === '2col' ? 'grid' : (feedSec?.data?.layoutMode || 'grid'),
          cardsPerPage: feedSec?.data?.cardsPerPage || 12,
          defaultSort: feedSec?.data?.defaultSort || 'latest',
          showPills: feedSec?.data?.showPills !== false,
          showHero: heroSec?.enabled !== false,
          heroHeading: heroSec?.data?.heading || heroSec?.data?.title,
          heroSubhead: heroSec?.data?.subheadline || heroSec?.data?.subtitle,
          heroBadge: heroSec?.data?.badge,
          heroImage: heroSec?.data?.image,
          heroBtnText: heroSec?.data?.buttonText,
          curation: feedSec?.data?.curation || {}
        });
      } else {
        loadConfig();
      }
    };

    window.addEventListener('page:category:change', handleCategoryConfigChange);
    return () => window.removeEventListener('page:category:change', handleCategoryConfigChange);
  }, [customConfig]);

  // Primary Layout: defaults to 'grid' (4 cards in one row)
  const [activeLayout, setActiveLayout] = useState('grid');
  useEffect(() => {
    if (liveConfig?.layoutMode) {
      setActiveLayout(liveConfig.layoutMode === '2col' ? 'grid' : liveConfig.layoutMode);
    } else {
      setActiveLayout('grid');
    }
  }, [liveConfig?.layoutMode]);

  // Cards per page from CMS config (default 12 for 3 full rows of 4 cards)
  const CARDS_PER_PAGE = liveConfig?.cardsPerPage ? Number(liveConfig.cardsPerPage) : 12;

  // Master stories pool
  const masterPool = useMemo(() => {
    if (stories && Array.isArray(stories) && stories.length > 0) {
      return stories;
    }
    return ALL_STORIES;
  }, [stories]);

  // Clean slug
  const normalizedSlug = useMemo(() => {
    return (slug || 'content').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }, [slug]);

  const isContentHub = normalizedSlug === 'content' || normalizedSlug === 'all' || normalizedSlug === 'categories';

  // Extract available subcategories with counts
  const subCategoryList = useMemo(() => {
    const counts = {};
    masterPool.forEach(s => {
      const c = getStoryCategory(s);
      if (c && c !== 'General') counts[c] = (counts[c] || 0) + 1;
    });

    const entries = Object.keys(counts).map(name => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: counts[name]
    })).sort((a, b) => b.count - a.count);

    return ['All', ...entries.map(e => e.name)];
  }, [masterPool]);

  // Sync active category when `slug` prop changes from URL
  useEffect(() => {
    if (isContentHub) {
      setActiveSubCategory('All');
    } else {
      const matched = subCategoryList.find(c => {
        const cSlug = c.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return cSlug === normalizedSlug || cSlug.includes(normalizedSlug) || normalizedSlug.includes(cSlug);
      });
      setActiveSubCategory(matched || normalizedSlug.replace(/-/g, ' '));
    }
    setCurrentSlide(0);
    setCurrentPage(1);
  }, [slug, isContentHub, normalizedSlug, subCategoryList]);

  // Determine current active category filter
  const currentTargetCategory = useMemo(() => {
    if (activeSubCategory !== 'All') return activeSubCategory;
    if (!isContentHub) return normalizedSlug;
    return 'All';
  }, [activeSubCategory, isContentHub, normalizedSlug]);

  // Base Category Name & Info
  const categoryInfo = useMemo(() => {
    if (currentTargetCategory === 'All') {
      return {
        name: 'All Categories',
        badge: 'All Categories',
        desc: 'Comprehensive reporting, strategic perspectives, and startup breakdowns across all editorial categories and desks.'
      };
    }
    const norm = normalizeCategory(currentTargetCategory);
    let displayName = currentTargetCategory
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    if (norm === 'ai') displayName = 'AI & DeepTech';
    else if (norm === 'fintech') displayName = 'FinTech';
    else if (norm === 'smbstory') displayName = 'SMB & D2C';
    else if (norm === 'herstory') displayName = 'HerStory';
    else if (norm === 'startups') displayName = 'Startups';
    else if (norm === 'technology') displayName = 'Technology';
    else if (norm === 'enterprise') displayName = 'Enterprise';
    else if (norm === 'leadership') displayName = 'Leadership';
    else if (norm === 'hindi') displayName = 'Hindi';

    return {
      name: displayName,
      badge: `${displayName} Desk`,
      desc: `Curated reporting, deep analysis, and breaking investigative coverage from ${displayName} at GoReadPost.`
    };
  }, [currentTargetCategory]);

  // Set document title
  useEffect(() => {
    document.title = `${categoryInfo.name} | GoReadPost Intelligence`;
    return () => {
      document.title = 'GoReadPost - Business, Tech & Startup Intelligence';
    };
  }, [categoryInfo]);

  // 1. STORIES MATCHING ACTIVE CATEGORY (Respecting CMS Curation if defined)
  const categoryStories = useMemo(() => {
    const curKey = normalizeCategory(currentTargetCategory) || 'all';
    const customList = liveConfig?.curation?.[curKey];
    if (customList && Array.isArray(customList) && customList.length > 0) {
      return customList;
    }
    if (currentTargetCategory === 'All') return masterPool;
    return masterPool.filter(story => matchesCategory(story, currentTargetCategory));
  }, [masterPool, currentTargetCategory, liveConfig?.curation]);

  // 2. HERO SLIDES (STRICTLY FROM THIS CATEGORY ONLY)
  const heroSlides = useMemo(() => {
    return categoryStories.slice(0, 5);
  }, [categoryStories]);

  // Auto cycle hero slider every 6 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];
  const heroTitle = liveConfig?.heroHeading || (activeSlide ? getStoryTitle(activeSlide) : (categoryStories.length > 0 ? getStoryTitle(categoryStories[0]) : 'Featured Perspective'));
  const heroAuthor = activeSlide ? getStoryAuthor(activeSlide) : 'Editorial Desk';
  const heroAvatar = activeSlide ? getStoryAvatar(activeSlide) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const heroDate = activeSlide ? getStoryDate(activeSlide) : 'Today';
  const heroReadTime = activeSlide ? getStoryReadTime(activeSlide) : '5 min read';
  const heroCategory = liveConfig?.heroBadge || (activeSlide ? getStoryCategory(activeSlide) : categoryInfo.name);
  const heroImage = liveConfig?.heroImage || (activeSlide ? getStoryImage(activeSlide) : 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80');

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  // 3. POPULAR POSTS
  const popularPosts = useMemo(() => {
    const sorted = [...categoryStories].sort((a, b) => (b.views || 0) - (a.views || 0));
    return sorted.slice(0, 5);
  }, [categoryStories]);

  // 4. FILTERED STORIES FOR BOTTOM GRID
  const filteredGridStories = useMemo(() => {
    let list = categoryStories;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(story => {
        const title = (story.title || '').toLowerCase();
        const excerpt = getStoryExcerpt(story).toLowerCase();
        const author = getStoryAuthor(story).toLowerCase();
        return title.includes(q) || excerpt.includes(q) || author.includes(q);
      });
    }

    return list.sort((a, b) => {
      // Pinned stories always stay on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'popular') {
        return (b.views || b.reads || 0) - (a.views || a.reads || 0);
      }
      if (sortBy === 'trending') {
        const aScore = (a.isTrending ? 100 : 0) + (a.claps || 0) + (a.views || 0);
        const bScore = (b.isTrending ? 100 : 0) + (b.claps || 0) + (b.views || 0);
        return bScore - aScore;
      }
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [categoryStories, searchQuery, sortBy]);

  // Reset pagination when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, currentTargetCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredGridStories.length / CARDS_PER_PAGE));
  const currentGridPage = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredGridStories.slice(start, start + CARDS_PER_PAGE);
  }, [filteredGridStories, currentPage]);

  // Smart Ellipsis Pagination Items
  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  // Handle clicking a category filter pill
  const handlePillClick = (catName) => {
    setActiveSubCategory(catName);
    setCurrentSlide(0);
    setCurrentPage(1);
    setSearchQuery('');
    
    if (catName === 'All') {
      if (onCategoryClick) onCategoryClick('content');
    } else {
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (onCategoryClick) onCategoryClick(catSlug);
    }
  };

  const handleCardClick = (story) => {
    if (onSelectStory) {
      onSelectStory(story);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cat-page-wrapper">
      <div className="cat-page-container">

        {/* ── 1. Top Breadcrumbs Navigation ── */}
        <nav className="cat-breadcrumb-nav" aria-label="Breadcrumb">
          <button type="button" className="cat-breadcrumb-btn" onClick={onBackToHome}>
            <ArrowLeft size={15} />
            <span>Home</span>
          </button>
          <span className="cat-breadcrumb-sep">/</span>
          {currentTargetCategory === 'All' ? (
            <span className="cat-breadcrumb-current">
              Categories Content
            </span>
          ) : (
            <>
              <span 
                className="cat-breadcrumb-link" 
                onClick={() => handlePillClick('All')}
              >
                Categories
              </span>
              <span className="cat-breadcrumb-sep">/</span>
              <span className="cat-breadcrumb-current">
                {categoryInfo.name}
              </span>
            </>
          )}
        </nav>

        {/* ── 2. Full-Width Category Featured Banner ── */}
        {liveConfig?.showHero !== false && (categoryStories.length > 0 ? (
          <section className="cat-hero-banner-section">
            <div 
              className="cat-hero-card"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="cat-hero-overlay" />
              <div className="cat-hero-content">
                <div style={{ marginBottom: '0.85rem' }}>
                  <span 
                    className="cat-category-tag"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePillClick(heroCategory);
                    }}
                  >
                    {heroCategory}
                  </span>
                </div>

                <h1 
                  className="cat-hero-title"
                  onClick={() => handleCardClick(activeSlide)}
                >
                  {heroTitle}
                </h1>

                <div className="cat-author-meta">
                  <img 
                    src={heroAvatar} 
                    alt={heroAuthor} 
                    className="cat-author-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>{heroAuthor}</span>
                  <span className="cat-meta-sep">•</span>
                  <span>{heroDate}</span>
                  <span className="cat-meta-sep">•</span>
                  <span>{heroReadTime}</span>
                </div>

                <div className="cat-hero-bottom-actions">
                  <button 
                    className="cat-hero-read-btn"
                    onClick={() => handleCardClick(activeSlide)}
                  >
                    <span>{liveConfig?.heroBtnText || 'Read More'}</span>
                    <ArrowRight size={15} />
                  </button>

                  <button 
                    type="button" 
                    className={`cat-hero-save-btn ${isSaved && isSaved(activeSlide?.id || activeSlide?._id || activeSlide?.slug) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleSave) onToggleSave(activeSlide);
                    }}
                    title={isSaved && isSaved(activeSlide?.id || activeSlide?._id || activeSlide?.slug) ? "Remove from reading list" : "Save to read later"}
                    aria-label="Save story"
                  >
                    <Bookmark size={15} fill={isSaved && isSaved(activeSlide?.id || activeSlide?._id || activeSlide?.slug) ? "currentColor" : "none"} />
                    <span>{isSaved && isSaved(activeSlide?.id || activeSlide?._id || activeSlide?.slug) ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>

              {/* Slider Pagination Controls */}
              {heroSlides.length > 1 && (
                <div className="cat-slider-nav">
                  <div className="cat-slider-dots">
                    {heroSlides.map((_, idx) => (
                      <span 
                        key={idx}
                        className={`cat-slider-dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button 
                    className="cat-slider-btn" 
                    onClick={handlePrevSlide}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    className="cat-slider-btn" 
                    onClick={handleNextSlide}
                    aria-label="Next slide"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="cat-hero-banner-section">
            <div className="cat-simple-banner">
              <h1 className="cat-simple-title">{categoryInfo.name}</h1>
              <p className="cat-simple-desc">{categoryInfo.desc}</p>
            </div>
          </section>
        ))}



        {/* ── 4. Main Articles Grid ── */}
        <section className="cat-grid-section">
          <div className="cat-grid-section-header">
            <h2 className="cat-grid-heading">
              {categoryInfo.name}
            </h2>
            <span className="cat-grid-counter">
              Showing <strong>{filteredGridStories.length > 0 ? (currentPage - 1) * CARDS_PER_PAGE + 1 : 0}–{Math.min(filteredGridStories.length, currentPage * CARDS_PER_PAGE)}</strong> of <strong>{filteredGridStories.length}</strong>
            </span>
          </div>

          {filteredGridStories.length === 0 ? (
            <div className="cat-empty-box">
              <BookOpen size={40} color="#ea580c" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h3 className="cat-empty-title">No Articles in {categoryInfo.name}</h3>
              <p className="cat-empty-desc">
                No articles were found matching your current selection. Try selecting another category desk or resetting filters.
              </p>
              <button
                type="button"
                onClick={() => handlePillClick('All')}
                className="cat-empty-reset-btn"
              >
                Show All Categories
              </button>
            </div>
          ) : (
            <>
            /* 4 Cards in One Row Card Grid */
            <div className="cat-cards-grid-4col">
              {currentGridPage.map((story, idx) => {
                const storyId = getStoryId(story, idx);
                const storyTitle = getStoryTitle(story);
                const storyExcerpt = getStoryExcerpt(story);
                const storyCat = getStoryCategory(story);
                const storyAuthor = getStoryAuthor(story);
                const storyAvatar = getStoryAvatar(story);
                const storyDate = getStoryDate(story);
                const storyReadTime = getStoryReadTime(story);
                const storyImg = getStoryImage(story);
                const isStorySaved = isSaved && isSaved(storyId);

                return (
                  <article 
                    key={storyId}
                    className="cat-grid-card"
                    onClick={() => handleCardClick(story)}
                  >
                    <div className="cat-card-thumb-wrap">
                      <img 
                        src={storyImg} 
                        alt={storyTitle} 
                        className="cat-card-thumb"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span 
                        className="cat-card-cat-badge"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePillClick(storyCat);
                        }}
                      >
                        {storyCat}
                      </span>
                    </div>

                    <div className="cat-card-body">
                      <div className="cat-card-meta">
                        <span className="cat-card-cat-meta-label">{storyCat}</span>
                        <span>•</span>
                        <span>{storyDate}</span>
                        <span>•</span>
                        <span>{storyReadTime}</span>
                      </div>

                      <h3 className="cat-card-title">
                        {storyTitle}
                      </h3>

                      <p className="cat-card-excerpt">
                        {storyExcerpt}
                      </p>

                      <div className="cat-card-footer">
                        <div className="cat-card-author-cluster">
                          <img 
                            src={storyAvatar} 
                            alt={storyAuthor} 
                            className="cat-card-author-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span className="cat-card-author-name">{storyAuthor}</span>
                        </div>

                        <div className="cat-card-actions">
                          <button 
                            type="button" 
                            className={`cat-card-save-btn ${isStorySaved ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleSave) onToggleSave(story);
                            }}
                            title={isStorySaved ? "Remove from bookmarks" : "Save story"}
                            aria-label="Save story"
                          >
                            <Bookmark size={15} fill={isStorySaved ? "currentColor" : "none"} />
                          </button>
                          <div className="cat-card-arrow" aria-label="Read story">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

          {/* Bottom Pagination Controls */}
              {totalPages > 1 && (
                <div className="cat-pagination-bar">
                  <button
                    type="button"
                    className="cat-page-nav-btn cat-page-prev"
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      const el = document.querySelector('.cat-grid-section-header');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <div className="cat-pagination-numbers">
                    {paginationItems.map((item, pIdx) => {
                      if (item === '...') {
                        return (
                          <span key={`ellipsis-${pIdx}`} className="cat-pagination-ellipsis">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={item}
                          type="button"
                          className={`cat-page-num-btn ${item === currentPage ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentPage(item);
                            const el = document.querySelector('.cat-grid-section-header');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          aria-label={`Go to Page ${item}`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="cat-page-nav-btn cat-page-next"
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      const el = document.querySelector('.cat-grid-section-header');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    disabled={currentPage >= totalPages}
                    aria-label="Next Page"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </div>
    </div>
  );
}
