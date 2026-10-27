import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowRight, 
  Cpu, Briefcase, GraduationCap, Heart, Plane, 
  Gamepad2, Atom, Layers, ChevronRight, ChevronLeft, Bookmark,
  Eye, Flame, TrendingUp, Sparkles
} from 'lucide-react';
import { ArticleService } from '../services/articleService';
import { StoryService } from '../services/storyService';
import { ALL_STORIES } from '../data/storiesData';
import './TrendingPage.css';

// Safely parse view and like counts (handles "290K", "1.5M", strings with commas, numbers, etc.)
const parseNumericValue = (val, fallback = 0) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return fallback;
    const clean = trimmed.toLowerCase();
    if (clean.endsWith('m')) {
      const num = parseFloat(clean.replace('m', ''));
      return isNaN(num) ? fallback : Math.round(num * 1000000);
    }
    if (clean.endsWith('k')) {
      const num = parseFloat(clean.replace('k', ''));
      return isNaN(num) ? fallback : Math.round(num * 1000);
    }
    const parsed = parseFloat(clean.replace(/,/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

// Retrieve numeric views with deterministic baseline if 0
const getStoryViews = (s) => {
  if (!s) return 0;
  if (s.views !== undefined && s.views !== null && s.views !== '') {
    const parsed = parseNumericValue(s.views);
    if (parsed > 0) return parsed;
  }
  const str = String(s.id || s._id || s.slug || 'story');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 9200) + 1200;
};

// Retrieve numeric likes / claps
const getStoryLikes = (s) => {
  if (!s) return 0;
  if (s.claps !== undefined && s.claps !== null && s.claps !== '') {
    const parsed = parseNumericValue(s.claps);
    if (parsed > 0) return parsed;
  }
  if (s.likes !== undefined && s.likes !== null && s.likes !== '') {
    const parsed = parseNumericValue(s.likes);
    if (parsed > 0) return parsed;
  }
  const str = String(s.id || s._id || s.slug || 'story');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 980) + 110;
};

// Combined trending engagement score (weighted views + likes)
const getTrendingScore = (s) => {
  const views = getStoryViews(s);
  const likes = getStoryLikes(s);
  return views + likes * 8;
};

// Clean formatted count representation: 290k, 1.4M, 450
const formatCount = (num) => {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toLocaleString();
};

// Safe normalizer for raw MongoDB Article records into uniform story shapes
const normalizeMongoArticle = (art) => {
  if (!art) return null;
  let img = '';
  if (typeof art.featuredImage === 'string') {
    img = art.featuredImage;
  } else if (art.featuredImage?.url) {
    img = art.featuredImage.url;
  } else if (art.image) {
    img = art.image;
  }

  return {
    _id: art._id,
    id: art._id || art.slug,
    title: art.title,
    subtitle: art.subtitle || '',
    summary: art.excerpt || art.subtitle || (typeof art.content === 'string' ? art.content.replace(/<[^>]+>/g, '').trim().slice(0, 160) : ''),
    brand: art.brand || 'GoReadPost',
    category: (art.categoryName || 'technology').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    categoryTag: art.categoryName || 'Technology',
    categoryName: art.categoryName || 'Technology',
    categoryLabel: art.categoryName || 'Technology',
    tag: art.isTrending ? 'TRENDING' : art.isFeatured ? 'FEATURED' : 'POPULAR',
    image: img || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    author: {
      name: art.authorName || 'Editorial Desk',
      title: art.authorTitle || 'Staff Reporter',
      avatar: art.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    authorName: art.authorName || 'Editorial Desk',
    authorAvatar: art.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    readTime: art.readingTime || '4 min read',
    readingTime: art.readingTime || '4 min read',
    publishedAt: art.publishedAt || art.createdAt || new Date().toISOString(),
    createdAt: art.createdAt || art.publishedAt || new Date().toISOString(),
    content: art.content || '',
    contentBlocks: Array.isArray(art.contentBlocks) ? art.contentBlocks : [],
    tags: Array.isArray(art.tags) ? art.tags : (art.tags ? [art.tags] : []),
    topics: Array.isArray(art.topics) ? art.topics : [],
    slug: art.slug,
    views: art.views || 0,
    claps: art.claps || 0,
    likes: art.claps || 0,
    status: art.status || 'published'
  };
};

// Category color and icon helpers
const getCategoryStyle = (catName) => {
  return { color: '#dc2626', bg: '#fee2e2', badgeBg: 'var(--brand-primary, #dc2626)' };
};

// Rank badge tint colors - all use pure red highlights
const RANK_COLORS = [
  { text: '#dc2626', bg: '#fee2e2' }, // 1 - Red
  { text: '#dc2626', bg: '#fee2e2' }, // 2 - Red
  { text: '#dc2626', bg: '#fee2e2' }, // 3 - Red
  { text: '#dc2626', bg: '#fee2e2' }, // 4 - Red
  { text: '#dc2626', bg: '#fee2e2' }, // 5 - Red
  { text: '#dc2626', bg: '#fee2e2' }, // 6 - Red
  { text: '#dc2626', bg: '#fee2e2' }, // 7 - Red
  { text: '#dc2626', bg: '#fee2e2' }, // 8 - Red
];

const getStoryAuthor = (s) => {
  if (typeof s?.author === 'object' && s?.author?.name) return s.author.name;
  if (typeof s?.author === 'string' && s.author.trim()) return s.author;
  return s?.authorName || 'Editorial Desk';
};

const getStoryAvatar = (s) => {
  if (typeof s?.author === 'object' && s?.author?.avatar) return s.author.avatar;
  if (s?.authorAvatar) return s.authorAvatar;
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
};

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
const getStoryDate = (s) => formatStoryDate(s?.publishedAt || s?.date || s?.formattedDate || 'Apr 25, 2026');
const getStoryReadTime = (s) => s?.readTime || (s?.readingTime ? `${s.readingTime} min read` : '5 min read');

const getStoryExcerpt = (s) => {
  if (!s) return '';
  if (typeof s.summary === 'string' && s.summary.trim()) return s.summary.trim();
  if (typeof s.excerpt === 'string' && s.excerpt.trim()) return s.excerpt.trim();
  if (typeof s.subtitle === 'string' && s.subtitle.trim()) return s.subtitle.trim();
  if (typeof s.metaDescription === 'string' && s.metaDescription.trim()) return s.metaDescription.trim();
  if (typeof s.description === 'string' && s.description.trim()) return s.description.trim();
  if (typeof s.content === 'string' && s.content.trim()) {
    const clean = s.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean) return clean.slice(0, 150) + '...';
  }
  if (Array.isArray(s.content) && s.content.length > 0 && typeof s.content[0] === 'string') {
    const clean = s.content[0].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean) return clean.slice(0, 150) + '...';
  }
  const cat = s.categoryName || s.categoryLabel || s.category || 'technology';
  return `An in-depth editorial analysis exploring strategic growth, key market shifts, and emerging breakthroughs across ${cat}.`;
};

export default function TrendingPage({
  stories = [],
  pageConfig = null,
  onSelectStory,
  onBackToHome,
  onCategoryClick,
  onShowToast,
  isSaved,
  onToggleSave
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTag, setActiveTag] = useState(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [sortMode, setSortMode] = useState('views'); // 'views' | 'likes' | 'trending'
  const [liveArticles, setLiveArticles] = useState([]);

  // Fetch live articles from MongoDB backend (both Article API and Story API)
  const fetchLiveArticles = async () => {
    try {
      const map = new Map();
      try {
        const artRes = await ArticleService.getArticles({ limit: 100 });
        if (artRes && artRes.success && Array.isArray(artRes.data)) {
          artRes.data.forEach(item => {
            const norm = normalizeMongoArticle(item);
            if (norm) map.set(String(norm._id || norm.id || norm.slug), norm);
          });
        }
      } catch (e) {}

      try {
        const storyRes = await StoryService.getStories({ limit: 100 });
        if (storyRes && Array.isArray(storyRes.data)) {
          storyRes.data.forEach(s => {
            const key = String(s._id || s.id || s.slug);
            if (!map.has(key)) map.set(key, s);
            else map.set(key, { ...s, ...map.get(key) });
          });
        }
      } catch (e) {}

      const list = Array.from(map.values());
      if (list.length > 0) setLiveArticles(list);
    } catch (err) {
      console.warn('Could not load live trending articles:', err);
    }
  };

  useEffect(() => {
    fetchLiveArticles();

    const handleRefresh = () => fetchLiveArticles();
    window.addEventListener('article:change', handleRefresh);
    window.addEventListener('story:change', handleRefresh);
    window.addEventListener('homepage:change', handleRefresh);

    return () => {
      window.removeEventListener('article:change', handleRefresh);
      window.removeEventListener('story:change', handleRefresh);
      window.removeEventListener('homepage:change', handleRefresh);
    };
  }, []);

  // Master real stories pool ranked strictly by views or likes
  const pool = useMemo(() => {
    const map = new Map();
    const addStory = (s) => {
      if (!s) return;
      const key = String(s._id || s.id || s.slug || '');
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, s);
      } else {
        map.set(key, { ...map.get(key), ...s });
      }
    };

    (liveArticles || []).forEach(addStory);
    (stories || []).forEach(addStory);

    const feedSec = pageConfig?.sections?.find(s => s.type === 'stories_feed' || s.id === 'trending_feed');
    if (feedSec?.data?.articles && Array.isArray(feedSec.data.articles)) {
      feedSec.data.articles.forEach(addStory);
    }

    (ALL_STORIES || []).forEach(addStory);

    const allList = Array.from(map.values());

    // Sort strictly according to active sortMode (views | likes | trending)
    return allList.sort((a, b) => {
      if (sortMode === 'views') {
        const diff = getStoryViews(b) - getStoryViews(a);
        if (diff !== 0) return diff;
        return getStoryLikes(b) - getStoryLikes(a);
      }
      if (sortMode === 'likes') {
        const diff = getStoryLikes(b) - getStoryLikes(a);
        if (diff !== 0) return diff;
        return getStoryViews(b) - getStoryViews(a);
      }
      // 'trending' (combined engagement)
      const scoreDiff = getTrendingScore(b) - getTrendingScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return getStoryViews(b) - getStoryViews(a);
    });
  }, [liveArticles, stories, pageConfig, sortMode]);

  // Top trending slides for hero slider: strictly top 5 ranked articles
  const trendingHeroSlides = useMemo(() => {
    const heroSec = pageConfig?.sections?.find(s => s.type === 'hero' || s.id === 'trending_hero');
    if (heroSec?.data?.slides && Array.isArray(heroSec.data.slides) && heroSec.data.slides.length > 0) {
      return heroSec.data.slides.slice(0, 5);
    }
    return pool.slice(0, 5);
  }, [pageConfig, pool]);

  // Auto rotate hero slide every 6.5 seconds
  useEffect(() => {
    if (trendingHeroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % trendingHeroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [trendingHeroSlides.length]);

  const handlePrevHeroSlide = () => {
    setCurrentHeroSlide(prev => (prev - 1 + trendingHeroSlides.length) % trendingHeroSlides.length);
  };

  const handleNextHeroSlide = () => {
    setCurrentHeroSlide(prev => (prev + 1) % trendingHeroSlides.length);
  };

  const activeHero = trendingHeroSlides[currentHeroSlide] || trendingHeroSlides[0];
  const heroTitle = activeHero?.title || 'Discover the Top Trending Insights';
  const heroExcerpt = activeHero?.excerpt || activeHero?.subtitle || activeHero?.metaDescription || 'Explore trending stories and verified updates across the business and startup ecosystem.';
  const heroImage = activeHero?.featuredImage?.url || 
                    (typeof activeHero?.featuredImage === 'string' ? activeHero?.featuredImage : null) || 
                    activeHero?.heroImage || 
                    activeHero?.image || 
                    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=80';
  const heroCategory = (activeHero?.categoryName || activeHero?.categoryLabel || activeHero?.category || 'Trending');
  const heroAuthor = getStoryAuthor(activeHero);
  const heroAvatar = getStoryAvatar(activeHero);
  const heroDate = getStoryDate(activeHero);
  const heroReadTime = getStoryReadTime(activeHero);

  // Defined filter categories with icons matching design
  const CATEGORIES = [
    { label: 'All', icon: Layers, slug: 'all' },
    { label: 'Technology', icon: Cpu, slug: 'technology' },
    { label: 'Business', icon: Briefcase, slug: 'business' },
    { label: 'Education', icon: GraduationCap, slug: 'education' },
    { label: 'Health', icon: Heart, slug: 'health' },
    { label: 'Travel', icon: Plane, slug: 'travel' },
    { label: 'Lifestyle', icon: Gamepad2, slug: 'lifestyle' },
    { label: 'Science', icon: Atom, slug: 'science' },
  ];

  // Filtered stories for main list
  const filteredStories = useMemo(() => {
    let result = pool.filter(s => s && s.title);

    if (activeCategory !== 'All') {
      const matchSlug = activeCategory.toLowerCase();
      result = result.filter(s => {
        const cat = (s.categoryName || s.categoryLabel || s.category || '').toLowerCase();
        return cat.includes(matchSlug) || (matchSlug === 'business' && cat.includes('startup'));
      });
    }

    if (activeTag) {
      const matchTag = activeTag.toLowerCase();
      result = result.filter(s => {
        const tags = Array.isArray(s.tags) ? s.tags.join(' ').toLowerCase() : '';
        const title = (s.title || '').toLowerCase();
        return tags.includes(matchTag) || title.includes(matchTag);
      });
    }

    // Sort strictly according to active sortMode (most viewed or most liked)
    return result.sort((a, b) => {
      if (sortMode === 'views') {
        const diff = getStoryViews(b) - getStoryViews(a);
        if (diff !== 0) return diff;
        return getStoryLikes(b) - getStoryLikes(a);
      }
      if (sortMode === 'likes') {
        const diff = getStoryLikes(b) - getStoryLikes(a);
        if (diff !== 0) return diff;
        return getStoryViews(b) - getStoryViews(a);
      }
      // 'trending'
      const scoreDiff = getTrendingScore(b) - getTrendingScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return getStoryViews(b) - getStoryViews(a);
    });
  }, [pool, activeCategory, activeTag, sortMode]);

  // Pagination state: 8 cards per page across the screen
  const [currentArticlePage, setCurrentArticlePage] = useState(0);
  const CARDS_PER_PAGE = 8;

  useEffect(() => {
    setCurrentArticlePage(0);
  }, [activeCategory, activeTag, sortMode]);

  const totalArticlePages = Math.max(1, Math.ceil(filteredStories.length / CARDS_PER_PAGE));
  const currentStoriesPage = useMemo(() => {
    const start = currentArticlePage * CARDS_PER_PAGE;
    return filteredStories.slice(start, start + CARDS_PER_PAGE);
  }, [filteredStories, currentArticlePage]);

  // Generate pagination numbers with ellipsis (e.g. 1 2 3 4 5 ... 31)
  const paginationItems = useMemo(() => {
    const current = currentArticlePage + 1;
    if (totalArticlePages <= 7) {
      return Array.from({ length: totalArticlePages }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', totalArticlePages];
    }
    if (current >= totalArticlePages - 3) {
      return [1, '...', totalArticlePages - 4, totalArticlePages - 3, totalArticlePages - 2, totalArticlePages - 1, totalArticlePages];
    }
    return [1, '...', current - 1, current, current + 1, '...', totalArticlePages];
  }, [currentArticlePage, totalArticlePages]);

  return (
    <div className="tp-page-wrapper">
      
      {/* ── 1. Interactive Top Trending Hero Slider with Story Images ── */}
      <section 
        className="tp-hero-header"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          position: 'relative',
          minHeight: 'clamp(500px, 62vh, 660px)',
          display: 'flex',
          alignItems: 'flex-end',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden'
        }}
      >
        <div 
          className="tp-hero-overlay" 
          style={{ position: 'absolute', inset: 0, zIndex: 1 }} 
        />
        <div 
          className="tp-hero-inner" 
          style={{ position: 'relative', zIndex: 2, width: '100%' }}
        >
          <div className="tp-hero-left">
            {/* Headline */}
            <h1 
              className="tp-hero-title"
              style={{ color: '#ffffff', textShadow: '0 2px 14px rgba(0,0,0,0.8)' }}
              onClick={() => onSelectStory && onSelectStory(activeHero)}
            >
              {heroTitle}
            </h1>

            {/* Bottom Left Row: Action Buttons & Author Meta */}
            <div className="tp-hero-actions-cluster">
              <button 
                type="button"
                className="tp-hero-read-btn"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectStory && onSelectStory(activeHero)}
              >
                <span>Read Story</span>
                <ArrowRight size={15} />
              </button>

              <button 
                type="button"
                className={`tp-hero-save-btn ${isSaved && isSaved(activeHero?.id || activeHero?._id || activeHero?.slug) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleSave) onToggleSave(activeHero);
                }}
                title={isSaved && isSaved(activeHero?.id || activeHero?._id || activeHero?.slug) ? "Remove from reading list" : "Save to read later"}
                aria-label="Save story"
              >
                <Bookmark size={15} fill={isSaved && isSaved(activeHero?.id || activeHero?._id || activeHero?.slug) ? "currentColor" : "none"} />
                <span>{isSaved && isSaved(activeHero?.id || activeHero?._id || activeHero?.slug) ? "Saved" : "Save"}</span>
              </button>

              <div className="tp-hero-author-meta">
                <img 
                  src={heroAvatar} 
                  alt={heroAuthor} 
                  className="tp-hero-avatar"
                  style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="tp-hero-author-name">{heroAuthor}</span>
                <span className="tp-hero-sep">•</span>
                <span>{heroDate}</span>
                <span className="tp-hero-sep">•</span>
                <span>{heroReadTime}</span>
                <span className="tp-hero-sep">•</span>
                <span className="tp-hero-stat-badge" title="Total Views">
                  <Eye size={13} />
                  <span>{formatCount(getStoryViews(activeHero))}</span>
                </span>
                <span className="tp-hero-sep">•</span>
                <span className="tp-hero-stat-badge" title="Total Likes">
                  <Heart size={13} fill="currentColor" />
                  <span>{formatCount(getStoryLikes(activeHero))}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Slider Navigation Controls */}
          <div className="tp-slider-controls">
            <div className="tp-slider-arrows">
              <button 
                type="button" 
                className="tp-slider-arrow-btn"
                onClick={handlePrevHeroSlide}
                aria-label="Previous Trending Story"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                type="button" 
                className="tp-slider-arrow-btn"
                onClick={handleNextHeroSlide}
                aria-label="Next Trending Story"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="tp-slider-dots">
              {trendingHeroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`tp-slider-dot ${idx === currentHeroSlide ? 'active' : ''}`}
                  onClick={() => setCurrentHeroSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <span className="tp-slider-counter">
              0{currentHeroSlide + 1} / 0{trendingHeroSlides.length}
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. Category Filter Bar ── */}
      <div className="tp-container">
        <div className="tp-filter-bar">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                className={`tp-filter-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.label);
                  setActiveTag(null);
                }}
              >
                <Icon size={16} className="tp-cat-icon" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── 3. Main Two-Column Layout ── */}
        <div className="tp-main-grid">
          
          {/* ════ LEFT COLUMN: Ranked Articles (Sliding Carousel Page) ════ */}
          <div className="tp-articles-col">
            {filteredStories.length === 0 ? (
              <div className="tp-empty-state">
                <p>No articles found for this topic. Try another category.</p>
                <button 
                  type="button" 
                  className="tp-reset-btn"
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveTag(null);
                  }}
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="tp-paginated-container">

                {/* Cards for the Current Page */}
                <div className="tp-paginated-cards-list">
                  {currentStoriesPage.map((story, inPageIdx) => {
                    const globalIdx = currentArticlePage * CARDS_PER_PAGE + inPageIdx;
                    const storyId = story.id || story._id || story.slug;
                    const storyTitle = story.title;
                    const storyExcerpt = getStoryExcerpt(story);
                    const storyCat = (story.categoryName || story.categoryLabel || story.category || 'Technology');
                    const catStyle = getCategoryStyle(storyCat);
                    const rankColor = RANK_COLORS[globalIdx % RANK_COLORS.length];
                    const storyAuthor = getStoryAuthor(story);
                    const storyAvatar = getStoryAvatar(story);
                    const storyDate = getStoryDate(story);
                    const storyReadTime = getStoryReadTime(story);
                    const storyViews = getStoryViews(story);
                    const storyLikes = getStoryLikes(story);
                    const storyImg = story.featuredImage?.url || 
                                    (typeof story.featuredImage === 'string' ? story.featuredImage : null) || 
                                    story.heroImage || 
                                    story.image || 
                                    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';

                    return (
                      <article 
                        key={storyId || globalIdx} 
                        className="tp-article-card"
                        onClick={() => onSelectStory && onSelectStory(story)}
                      >
                        {/* Rank Number Badge */}
                        <div 
                          className="tp-rank-badge"
                          style={{ color: rankColor.text, background: rankColor.bg }}
                        >
                          {globalIdx + 1}
                        </div>

                        {/* Left Column: Clean Proportional Thumbnail Image */}
                        <div className="tp-card-thumb-column">
                          <div className="tp-card-thumb-wrap">
                            <img 
                              src={storyImg} 
                              alt={storyTitle} 
                              className="tp-card-thumb"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                              }}
                              loading="lazy"
                            />
                            <button 
                              type="button" 
                              className={`tp-card-save-btn ${isSaved && isSaved(story.id || story._id || story.slug) ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleSave) onToggleSave(story);
                              }}
                              title={isSaved && isSaved(story.id || story._id || story.slug) ? 'Remove from saved bookmarks' : 'Save story'}
                              aria-label="Save story"
                            >
                              <Bookmark size={15} fill={isSaved && isSaved(story.id || story._id || story.slug) ? '#ffffff' : 'none'} color="#ffffff" />
                            </button>
                          </div>
                        </div>

                        {/* Right Content */}
                        <div className="tp-card-body">
                          {/* Top: Category Pill Badge + Engagement Metrics Badges */}
                          <div className="tp-card-meta-top">
                            <span 
                              className="tp-cat-badge"
                              style={{ background: catStyle.badgeBg }}
                            >
                              {storyCat}
                            </span>

                            <div className="tp-card-metrics-row">
                              <span className="tp-metric-pill tp-metric-views" title={`${formatCount(storyViews)} views`}>
                                <Eye size={10} />
                                <span>{formatCount(storyViews)}</span>
                              </span>
                              <span className="tp-metric-pill tp-metric-likes" title={`${formatCount(storyLikes)} likes`}>
                                <Heart size={10} fill="currentColor" />
                                <span>{formatCount(storyLikes)}</span>
                              </span>
                            </div>
                          </div>

                          <h2 className="tp-card-title">
                            {storyTitle}
                          </h2>

                          {storyExcerpt && (
                            <p className="tp-card-excerpt">
                              {storyExcerpt}
                            </p>
                          )}

                          {/* Bottom Footer: Author Info on Left + Actions on Right */}
                          <div className="tp-card-footer">
                            <div className="tp-author-cluster">
                              <img 
                                src={storyAvatar} 
                                alt={storyAuthor} 
                                className="tp-author-avatar"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                                }}
                              />
                              <span className="tp-author-name" title={storyAuthor}>{storyAuthor}</span>
                              <span className="tp-sep">•</span>
                              <span className="tp-date-text">{storyDate}</span>
                              <span className="tp-sep">•</span>
                              <span className="tp-read-text">{storyReadTime}</span>
                            </div>

                            <div className="tp-card-actions-row">
                              <div className="tp-arrow-circle" aria-label="Read Article">
                                <ArrowRight size={15} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Bottom Pagination Controls */}
                {totalArticlePages > 1 && (
                  <div className="tp-pagination-bar">
                    <button
                      type="button"
                      className="tp-pagination-nav-btn tp-pagination-prev"
                      onClick={() => {
                        setCurrentArticlePage(prev => Math.max(0, prev - 1));
                        const el = document.querySelector('.tp-paginated-header');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      disabled={currentArticlePage === 0}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    <div className="tp-pagination-numbers">
                      {paginationItems.map((item, pIdx) => {
                        if (item === '...') {
                          return (
                            <span key={`ellipsis-${pIdx}`} className="tp-pagination-ellipsis">
                              ...
                            </span>
                          );
                        }
                        const pageIdx = item - 1;
                        return (
                          <button
                            key={item}
                            type="button"
                            className={`tp-pagination-num-btn ${pageIdx === currentArticlePage ? 'active' : ''}`}
                            onClick={() => {
                              setCurrentArticlePage(pageIdx);
                              const el = document.querySelector('.tp-paginated-header');
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
                      className="tp-pagination-nav-btn tp-pagination-next"
                      onClick={() => {
                        setCurrentArticlePage(prev => Math.min(totalArticlePages - 1, prev + 1));
                        const el = document.querySelector('.tp-paginated-header');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      disabled={currentArticlePage >= totalArticlePages - 1}
                      aria-label="Next Page"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
