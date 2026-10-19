import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, Eye, Send, Tag, ArrowRight, 
  Cpu, Briefcase, GraduationCap, Heart, Plane, 
  Gamepad2, Atom, Layers, CheckCircle2, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Bookmark
} from 'lucide-react';
import { ALL_STORIES } from '../data/storiesData';
import { NewsletterService } from '../services/newsletterService';
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

const getStoryDate = (s) => s?.publishedAt || s?.date || s?.formattedDate || 'Apr 25, 2026';
const getStoryReadTime = (s) => s?.readTime || (s?.readingTime ? `${s.readingTime} min read` : '5 min read');

export default function TrendingPage({
  stories = [],
  onSelectStory,
  onBackToHome,
  onCategoryClick,
  onShowToast,
  isSaved,
  onToggleSave
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sidebarTab, setSidebarTab] = useState('trending'); // 'trending' | 'most-read'
  const [activeTag, setActiveTag] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Master real stories pool
  const pool = useMemo(() => {
    if (stories && Array.isArray(stories) && stories.length > 0) {
      return stories;
    }
    return ALL_STORIES;
  }, [stories]);

  // Top trending slides for hero slider
  const trendingHeroSlides = useMemo(() => {
    const list = pool.filter(s => s && s.title && (s.isTrending || s.trending || (s.views && s.views > 50) || s.tag === 'TRENDING'));
    if (list.length >= 3) return list.slice(0, 5);
    return pool.slice(0, 5);
  }, [pool]);

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

  // Popular tags
  const POPULAR_TAGS = [
    'AI', 'Web Development', 'React', 'Next.js', 'Python', 
    'JavaScript', 'DSA', 'Career', 'Productivity', 'Investing',
    'Startups', 'Technology'
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

  // Pagination state: 4 cards per page
  const [currentArticlePage, setCurrentArticlePage] = useState(0);
  const CARDS_PER_PAGE = 4;

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

  // Sidebar ranked stories (Top 5)
  const sidebarStories = useMemo(() => {
    const list = [...pool].sort((a, b) => (b.views || 0) - (a.views || 0));
    return list.slice(0, 5).map((s, idx) => ({
      ...s,
      viewsCount: s.views ? `${(s.views / 1000).toFixed(1)}K reads` : `${(12.4 - idx * 1.3).toFixed(1)}K reads`
    }));
  }, [pool]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterLoading(true);
    try {
      await NewsletterService.subscribe({
        email: newsletterEmail.trim(),
        publications: ['The Morning Dispatch'],
        source: 'trending_page'
      });
      setNewsletterSubscribed(true);
      if (onShowToast) {
        onShowToast('✓ Subscribed! You will receive daily trending briefs.');
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Subscription failed');
    } finally {
      setNewsletterLoading(false);
    }
  };

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

                        {/* Left Thumbnail Image */}
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
                              <span className="tp-author-name">{storyAuthor}</span>
                              <span className="tp-sep">•</span>
                              <span>{storyDate}</span>
                              <span className="tp-sep">•</span>
                              <span>{storyReadTime}</span>
                            </div>

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

          {/* ════ RIGHT COLUMN: Sidebar Widgets ════ */}
          <aside className="tp-sidebar">
            
            {/* Widget 1: Trending Now / Most Read Tabs */}
            <div className="tp-widget-card tp-tabs-widget">
              <div className="tp-widget-segmented">
                <button
                  type="button"
                  className={`tp-segment-btn ${sidebarTab === 'trending' ? 'active' : ''}`}
                  onClick={() => setSidebarTab('trending')}
                >
                  <Flame size={14} />
                  <span>Trending Now</span>
                </button>
                <button
                  type="button"
                  className={`tp-segment-btn ${sidebarTab === 'most-read' ? 'active' : ''}`}
                  onClick={() => setSidebarTab('most-read')}
                >
                  <Eye size={14} />
                  <span>Most Read</span>
                </button>
              </div>

              <div className="tp-mini-list">
                {sidebarStories.map((item, idx) => {
                  const itemId = item.id || item._id || item.slug;
                  const itemImg = item.featuredImage?.url || 
                                 (typeof item.featuredImage === 'string' ? item.featuredImage : null) || 
                                 item.heroImage || 
                                 item.image || 
                                 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80';
                  const rankColor = RANK_COLORS[idx % RANK_COLORS.length];

                  return (
                    <div 
                      key={itemId || idx}
                      className="tp-mini-item"
                      onClick={() => onSelectStory && onSelectStory(item)}
                    >
                      <div 
                        className="tp-mini-rank"
                        style={{ color: rankColor.text, background: rankColor.bg }}
                      >
                        {idx + 1}
                      </div>
                      <img 
                        src={itemImg} 
                        alt={item.title} 
                        className="tp-mini-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="tp-mini-body">
                        <h4 className="tp-mini-title">
                          {item.title}
                        </h4>
                        <div className="tp-mini-meta">
                          <Eye size={12} className="tp-eye-icon" />
                          <span>{item.viewsCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Widget 2: Stay Updated Newsletter */}
            <div className="tp-widget-card tp-newsletter-widget">
              <div className="tp-nl-header">
                <div className="tp-nl-icon-wrap">
                  <Send size={18} />
                </div>
                <h3 className="tp-nl-title">Stay Updated</h3>
              </div>
              <p className="tp-nl-desc">
                Get the latest trending articles, insights and updates delivered to your inbox.
              </p>

              {newsletterSubscribed ? (
                <div className="tp-nl-success">
                  <CheckCircle2 size={16} />
                  <span>You are subscribed!</span>
                </div>
              ) : (
                <form className="tp-nl-form" onSubmit={handleNewsletterSubmit}>
                  <input 
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    className="tp-nl-input"
                  />
                  <button 
                    type="submit" 
                    disabled={newsletterLoading}
                    className="tp-nl-btn"
                  >
                    {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>

            {/* Widget 3: Popular Tags */}
            <div className="tp-widget-card tp-tags-widget">
              <div className="tp-tags-header">
                <Tag size={16} className="tp-tag-icon" />
                <h3 className="tp-tags-title">Popular Tags</h3>
              </div>

              <div className="tp-tags-cluster">
                {POPULAR_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`tp-tag-pill ${activeTag === tag ? 'active' : ''}`}
                    onClick={() => {
                      if (activeTag === tag) {
                        setActiveTag(null);
                      } else {
                        setActiveTag(tag);
                      }
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
