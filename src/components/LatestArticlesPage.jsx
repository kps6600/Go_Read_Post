import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, ChevronLeft, Search, Mail, CheckCircle2, 
  ArrowRight, LayoutGrid, Tag, Layers, Cpu, Briefcase, 
  GraduationCap, Heart, Plane, Utensils, Atom, Sparkles, TrendingUp,
  Edit3
} from 'lucide-react';
import './LatestArticlesPage.css';
import { NewsletterService } from '../services/newsletterService';
import { PageService } from '../services/pageService';
import { ALL_STORIES } from '../data/storiesData';

// Helper functions for safe extraction from dynamic story objects
const getStoryId = (s, fallbackIdx = 0) => s?.id || s?._id || s?.slug || `story-${fallbackIdx}`;

const getStoryImage = (s) => {
  if (!s) return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
  const img = s.image || 
    (typeof s.featuredImage === 'string' ? s.featuredImage : s.featuredImage?.url) || 
    s.fallbackImage;
  return img || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
};

const getStoryTitle = (s) => s?.title || 'Untitled Article';

const getStoryExcerpt = (s) => {
  if (!s) return '';
  if (s.summary && typeof s.summary === 'string') return s.summary;
  if (s.subtitle && typeof s.subtitle === 'string') return s.subtitle;
  if (s.excerpt && typeof s.excerpt === 'string') return s.excerpt;
  if (typeof s.content === 'string') {
    return s.content.replace(/<[^>]+>/g, '').trim().slice(0, 130) + '...';
  }
  if (Array.isArray(s.content) && s.content.length > 0 && typeof s.content[0] === 'string') {
    return s.content[0].replace(/<[^>]+>/g, '').trim().slice(0, 130) + '...';
  }
  return '';
};

const getStoryCategory = (s) => s?.categoryLabel || s?.categoryTag || s?.category || 'General';

const getStoryCategorySlug = (s) => {
  const cat = s?.category || s?.categoryLabel || 'general';
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';
};

const getCategoryBadgeColor = (slug) => {
  const clean = (slug || '').toLowerCase();
  if (clean.includes('tech')) return '#2563eb';      // Blue
  if (clean.includes('business') || clean.includes('startup')) return '#059669'; // Green
  if (clean.includes('edu') || clean.includes('study')) return '#7c3aed';       // Purple
  if (clean.includes('health')) return '#e11d48';     // Rose
  if (clean.includes('life')) return '#0891b2';       // Cyan
  if (clean.includes('travel')) return '#ea580c';     // Orange
  if (clean.includes('food')) return '#d97706';       // Amber
  if (clean.includes('science') || clean.includes('ai')) return '#4f46e5';     // Indigo
  return '#2563eb';
};

const getCategoryIcon = (slug) => {
  const clean = (slug || '').toLowerCase();
  if (clean.includes('tech')) return { icon: Cpu, bg: '#eff6ff', color: '#2563eb' };
  if (clean.includes('business') || clean.includes('startup')) return { icon: Briefcase, bg: '#ecfdf5', color: '#059669' };
  if (clean.includes('edu') || clean.includes('study')) return { icon: GraduationCap, bg: '#f5f3ff', color: '#7c3aed' };
  if (clean.includes('health')) return { icon: Heart, bg: '#fff1f2', color: '#e11d48' };
  if (clean.includes('travel')) return { icon: Plane, bg: '#fff7ed', color: '#ea580c' };
  if (clean.includes('food')) return { icon: Utensils, bg: '#fffbeb', color: '#d97706' };
  if (clean.includes('science') || clean.includes('ai')) return { icon: Atom, bg: '#eef2ff', color: '#4f46e5' };
  return { icon: Layers, bg: '#f1f5f9', color: '#475569' };
};

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

const getStoryDate = (s) => s?.publishedAt || s?.date || s?.formattedDate || 'Today';
const getStoryReadTime = (s) => s?.readTime || (s?.readingTime ? `${s.readingTime} min read` : '5 min read');

export default function LatestArticlesPage({
  stories = [],
  onSelectStory,
  onBackToHome,
  onCategoryClick,
  onShowToast
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [pageConfig, setPageConfig] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const CARDS_PER_PAGE = 16;

  // Check admin session and fetch latest page model from MongoDB
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (token && (u.role === 'admin' || u.role === 'superadmin' || u.role === 'SUPER_ADMIN' || localStorage.getItem('adminToken'))) {
        setIsAdminUser(true);
      }
    } catch (e) {}

    const loadLatestConfig = async () => {
      try {
        const p = await PageService.getPageBySlug('latest');
        if (p && Array.isArray(p.sections)) {
          setPageConfig(p);
        }
      } catch (err) {
        console.warn('Could not load dynamic latest page config:', err);
      }
    };
    loadLatestConfig();
  }, []);

  // Section reference for custom title, subtitle, and curated articles
  const feedSec = useMemo(() => {
    if (!pageConfig?.sections) return null;
    return pageConfig.sections.find(s => s.type === 'stories_feed' || s.id === 'latest_feed' || (s.type || '').includes('feed'));
  }, [pageConfig]);

  // Real content master pool (prioritizes admin curated articles if configured)
  const pool = useMemo(() => {
    if (feedSec?.data) {
      if (Array.isArray(feedSec.data.articles) && feedSec.data.articles.length > 0) {
        return feedSec.data.articles;
      }
      if (Array.isArray(feedSec.data.articleIds) && feedSec.data.articleIds.length > 0) {
        const sourceStories = (stories && stories.length > 0) ? stories : ALL_STORIES;
        const mapped = feedSec.data.articleIds
          .map(id => sourceStories.find(a => (a.id === id || a._id === id || a.slug === id)))
          .filter(Boolean);
        if (mapped.length > 0) return mapped;
      }
    }

    if (stories && Array.isArray(stories) && stories.length > 0) {
      return stories;
    }
    return ALL_STORIES;
  }, [stories, feedSec]);

  // Dynamically extract categories with real story counts
  const categoryStats = useMemo(() => {
    const counts = {};
    pool.forEach(s => {
      const cat = getStoryCategory(s);
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list = Object.keys(counts).map(cat => ({
      name: cat,
      slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      count: counts[cat]
    }));

    // Sort by count descending
    return list.sort((a, b) => b.count - a.count);
  }, [pool]);

  // Unique categories for horizontal pill bar
  const categoryPills = useMemo(() => {
    return ['All', ...categoryStats.map(c => c.name)];
  }, [categoryStats]);

  // Real popular posts (top 5 trending)
  const popularPosts = useMemo(() => {
    const trending = pool.filter(s => s.isTrending || s.trending || s.tag === 'POPULAR' || s.tag === 'TRENDING');
    if (trending.length >= 5) return trending.slice(0, 5);
    const others = pool.filter(s => !trending.some(t => getStoryId(t) === getStoryId(s)));
    return [...trending, ...others].slice(0, 5);
  }, [pool]);

  // Dynamically extract unique tags from real stories
  const popularTags = useMemo(() => {
    const tagSet = new Set();
    pool.forEach(s => {
      if (Array.isArray(s.tags)) {
        s.tags.forEach(t => t && tagSet.add(t));
      } else if (s.tag && typeof s.tag === 'string') {
        tagSet.add(s.tag);
      }
    });

    if (tagSet.size === 0) {
      return ['Technology', 'Startups', 'Business', 'AI', 'Education', 'Funding', 'Leadership', 'Lifestyle'];
    }
    return Array.from(tagSet).slice(0, 10);
  }, [pool]);

  // Filtered stories according to category pill, active tag, and search query
  const filteredStories = useMemo(() => {
    return pool.filter(story => {
      // Category filter
      if (activeCategory !== 'All') {
        const cat = getStoryCategory(story);
        if (cat.toLowerCase() !== activeCategory.toLowerCase()) {
          return false;
        }
      }

      // Tag filter
      if (activeTag) {
        const tags = Array.isArray(story.tags) ? story.tags : (story.tag ? [story.tag] : []);
        const matchesTag = tags.some(t => t && t.toLowerCase() === activeTag.toLowerCase());
        if (!matchesTag) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (story.title || '').toLowerCase();
        const summary = (getStoryExcerpt(story) || '').toLowerCase();
        const cat = (getStoryCategory(story) || '').toLowerCase();
        const author = (getStoryAuthor(story) || '').toLowerCase();
        if (!title.includes(q) && !summary.includes(q) && !cat.includes(q) && !author.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [pool, activeCategory, activeTag, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / CARDS_PER_PAGE));
  const currentStories = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredStories.slice(start, start + CARDS_PER_PAGE);
  }, [filteredStories, currentPage]);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setActiveTag(null);
    setCurrentPage(1);
  };

  const handleTagSelect = (tag) => {
    if (activeTag === tag) {
      setActiveTag(null);
    } else {
      setActiveTag(tag);
      setActiveCategory('All');
    }
    setCurrentPage(1);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterLoading(true);
    try {
      await NewsletterService.subscribe(newsletterEmail, { source: 'latest_articles_page' });
      setNewsletterSubscribed(true);
      if (onShowToast) onShowToast('Subscribed successfully! Welcome to GoReadPost.');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Subscription failed. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleBreadcrumbHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="lap-page-wrapper">
      {/* ── Breadcrumbs ── */}
      <nav className="lap-breadcrumbs" aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="lap-breadcrumb-link" onClick={handleBreadcrumbHome}>
            Home
          </span>
          <span className="lap-breadcrumb-sep">&gt;</span>
          <span className="lap-breadcrumb-current">Latest Articles</span>
        </div>

        {isAdminUser && (
          <a
            href="/admin/pages/latest/edit?liveStudio=true"
            className="lap-admin-live-edit-pill"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/admin/pages/latest/edit?liveStudio=true';
            }}
            title="Open Live Visual Studio for Latest Page"
          >
            <Sparkles size={13} fill="#ffffff" color="#ffffff" />
            <span>⚡ Live Edit This Page</span>
          </a>
        )}
      </nav>

      {/* ── Page Header ── */}
      <div className="lap-header">
        <h1 className="lap-title">
          {feedSec?.data?.title || 'Latest Articles'}
        </h1>
        <p className="lap-subtitle">
          {feedSec?.data?.subtitle || 'Discover the most recent stories, investigative reporting, and updates across technology, business, and innovation.'}
        </p>
      </div>

      {/* ── Category Filter Pills Bar ── */}
      <div className="lap-category-pills-bar">
        {categoryPills.map(cat => (
          <button
            key={cat}
            type="button"
            className={`lap-pill-btn ${activeCategory === cat && !activeTag ? 'active' : ''}`}
            onClick={() => handleCategorySelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Main Two-Column Layout (Cards on Left, Sidebar on Right) ── */}
      <div className="lap-main-layout">
        {/* Left Column: 3-Column Articles Grid */}
        <div className="lap-left-col">
          {currentStories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>No articles found</h3>
              <p style={{ color: '#64748b' }}>Try adjusting your search query or selected category.</p>
              <button 
                type="button" 
                className="lap-pill-btn active"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setActiveCategory('All');
                  setActiveTag(null);
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="lap-articles-grid">
              {currentStories.map((story, idx) => {
                const storyId = getStoryId(story, idx);
                const storyImg = getStoryImage(story);
                const storyTitle = getStoryTitle(story);
                const storyExcerpt = getStoryExcerpt(story);
                const storyCat = getStoryCategory(story);
                const storyCatSlug = getStoryCategorySlug(story);
                const badgeColor = getCategoryBadgeColor(storyCatSlug);
                const storyAuthor = getStoryAuthor(story);
                const storyAvatar = getStoryAvatar(story);
                const storyDate = getStoryDate(story);
                const storyReadTime = getStoryReadTime(story);

                return (
                  <article 
                    key={storyId} 
                    className="lap-card"
                    onClick={() => onSelectStory && onSelectStory(story)}
                  >
                    <div className="lap-thumb-wrap">
                      <img 
                        src={storyImg} 
                        alt={storyTitle} 
                        className="lap-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                        }}
                        loading="lazy"
                      />
                      <span className="lap-category-on-image">
                        {storyCat}
                      </span>
                    </div>

                    <div className="lap-card-body">
                      <h3 className="lap-card-title">
                        {storyTitle}
                      </h3>
                      {storyExcerpt && (
                        <p className="lap-card-excerpt">
                          {storyExcerpt}
                        </p>
                      )}

                      <div className="lap-card-meta">
                        <img 
                          src={storyAvatar} 
                          alt={storyAuthor} 
                          className="lap-author-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="lap-author-name">{storyAuthor}</span>
                        <span className="lap-meta-sep">•</span>
                        <span>{storyDate}</span>
                        <span className="lap-meta-sep">•</span>
                        <span>{storyReadTime}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="lap-pagination">
              <button 
                type="button" 
                className="lap-page-btn" 
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  className={`lap-page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                >
                  {page}
                </button>
              ))}

              <button 
                type="button" 
                className="lap-page-btn" 
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
