import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowRight, 
  Cpu, Briefcase, GraduationCap, Heart, Plane, 
  Gamepad2, Atom, Layers, ChevronRight, ChevronLeft, Bookmark
} from 'lucide-react';
import { ALL_STORIES } from '../data/storiesData';
import './TrendingPage.css';

// Category color and icon helpers
const getCategoryStyle = (catName) => {
  const clean = (catName || '').toLowerCase();
  if (clean.includes('tech') || clean.includes('ai')) {
    return { color: '#6366f1', bg: '#e0e7ff', badgeBg: '#4f46e5' };
  }
  if (clean.includes('business') || clean.includes('startup')) {
    return { color: '#059669', bg: '#d1fae5', badgeBg: '#059669' };
  }
  if (clean.includes('edu') || clean.includes('study')) {
    return { color: '#8b5cf6', bg: '#ede9fe', badgeBg: '#7c3aed' };
  }
  if (clean.includes('health') || clean.includes('food')) {
    return { color: '#e11d48', bg: '#ffe4e6', badgeBg: '#e11d48' };
  }
  if (clean.includes('travel')) {
    return { color: '#ea580c', bg: '#ffedd5', badgeBg: '#ea580c' };
  }
  if (clean.includes('science')) {
    return { color: '#2563eb', bg: '#dbeafe', badgeBg: '#2563eb' };
  }
  if (clean.includes('life') || clean.includes('social')) {
    return { color: '#0891b2', bg: '#cffafe', badgeBg: '#0891b2' };
  }
  return { color: '#4f46e5', bg: '#e0e7ff', badgeBg: '#4f46e5' };
};

// Rank badge tint colors
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

  // Master real stories pool (respects custom ranked priority from admin studio if available)
  const pool = useMemo(() => {
    const baseStories = (stories && Array.isArray(stories) && stories.length > 0) ? stories : ALL_STORIES;
    const feedSec = pageConfig?.sections?.find(s => s.type === 'stories_feed' || s.id === 'trending_feed');
    if (feedSec?.data?.articles && Array.isArray(feedSec.data.articles) && feedSec.data.articles.length > 0) {
      const customNorm = feedSec.data.articles;
      const customIds = new Set(customNorm.map(a => String(a.id || a._id || a.slug)));
      const remaining = baseStories.filter(a => !customIds.has(String(a.id || a._id || a.slug)));
      return [...customNorm, ...remaining];
    }
    return baseStories;
  }, [stories, pageConfig]);

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

    // Sort by views or trending priority
    return result.sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [pool, activeCategory, activeTag]);

  // Pagination state: 8 cards per page across the screen
  const [currentArticlePage, setCurrentArticlePage] = useState(0);
  const CARDS_PER_PAGE = 8;

  useEffect(() => {
    setCurrentArticlePage(0);
  }, [activeCategory, activeTag]);

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
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="tp-hero-overlay" />
        <div className="tp-hero-inner">
          <div className="tp-hero-left">
            {/* Headline */}
            <h1 
              className="tp-hero-title"
              onClick={() => onSelectStory && onSelectStory(activeHero)}
            >
              {heroTitle}
            </h1>

            {/* Bottom Left Row: Action Buttons & Author Meta */}
            <div className="tp-hero-actions-cluster">
              <button 
                type="button"
                className="tp-hero-read-btn"
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
                {/* Header with Title and Result Counter */}
                <div className="tp-paginated-header">
                  <h2 className="tp-paginated-heading">Ranked Stories</h2>
                  <span className="tp-paginated-counter">
                    Showing <strong>{currentArticlePage * CARDS_PER_PAGE + 1}–{Math.min(filteredStories.length, (currentArticlePage + 1) * CARDS_PER_PAGE)}</strong> of <strong>{filteredStories.length}</strong>
                  </span>
                </div>

                {/* 4 Cards for the Current Page */}
                <div className="tp-paginated-cards-list">
                  {currentStoriesPage.map((story, inPageIdx) => {
                    const globalIdx = currentArticlePage * CARDS_PER_PAGE + inPageIdx;
                    const storyId = story.id || story._id || story.slug;
                    const storyTitle = story.title;
                    const storyExcerpt = story.excerpt || story.metaDescription || story.subtitle || (typeof story.content === 'string' ? story.content.slice(0, 140) + '...' : '');
                    const storyCat = (story.categoryName || story.categoryLabel || story.category || 'Technology');
                    const catStyle = getCategoryStyle(storyCat);
                    const rankColor = RANK_COLORS[globalIdx % RANK_COLORS.length];
                    const storyAuthor = getStoryAuthor(story);
                    const storyAvatar = getStoryAvatar(story);
                    const storyDate = getStoryDate(story);
                    const storyReadTime = getStoryReadTime(story);
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

                        {/* Left Column: Thumbnail Image + Author Meta Below Image */}
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
                          </div>

                          {/* Author & Date Meta Placed Below the Image */}
                          <div className="tp-author-cluster-below-img">
                            <img 
                              src={storyAvatar} 
                              alt={storyAuthor} 
                              className="tp-author-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="tp-author-info-box">
                              <span className="tp-author-name" title={storyAuthor}>{storyAuthor}</span>
                              <div className="tp-author-sub">
                                <span>{storyDate}</span>
                                <span className="tp-sep">•</span>
                                <span>{storyReadTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Content */}
                        <div className="tp-card-body">
                          <span 
                            className="tp-cat-badge"
                            style={{ background: catStyle.badgeBg }}
                          >
                            {storyCat}
                          </span>

                          <h2 className="tp-card-title">
                            {storyTitle}
                          </h2>

                          {storyExcerpt && (
                            <p className="tp-card-excerpt">
                              {storyExcerpt}
                            </p>
                          )}

                          <div className="tp-card-footer" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
                            <div className="tp-card-actions-row">
                              <button 
                                type="button" 
                                className={`tp-card-save-btn ${isSaved && isSaved(story.id || story._id || story.slug) ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onToggleSave) onToggleSave(story);
                                }}
                                title={isSaved && isSaved(story.id || story._id || story.slug) ? 'Remove from reading list' : 'Save to read later'}
                                aria-label="Save story"
                              >
                                <Bookmark size={15} fill={isSaved && isSaved(story.id || story._id || story.slug) ? 'currentColor' : 'none'} />
                              </button>
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
