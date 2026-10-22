import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Hash, Search, ArrowRight, ArrowLeft, Layers, Bookmark, 
  Share2, RefreshCw, X, Sparkles, Filter, BookOpen, Clock, Calendar,
  ExternalLink, ChevronLeft, ChevronRight, TrendingUp, CheckCircle
} from 'lucide-react';
import { TaxonomyService } from '../services/taxonomyService';
import { ArticleService } from '../services/articleService';
import { ALL_STORIES } from '../data/storiesData';
import { FAKE_TOPICS_LIST, FAKE_TOPIC_ARTICLES } from '../data/topicsMockData';
import './TopicsPage.css';

// Safe article extraction helpers
const getStoryId = (s, idx = 0) => s?.id || s?._id || s?.slug || `topic-story-${idx}`;

const getStoryImage = (s) => {
  if (!s) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
  const img = s.featuredImage?.url || (typeof s.featuredImage === 'string' ? s.featuredImage : null) || s.image || s.heroImage;
  return img || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
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
  return 'Explore deep insights, operational lessons, and strategic perspectives on this topic.';
};

const getStoryCategory = (s) => {
  if (typeof s?.category === 'object' && s?.category?.name) return s.category.name;
  if (typeof s?.category === 'string' && s.category.trim()) return s.category;
  return s?.categoryName || s?.categoryLabel || 'General';
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

const getStoryDate = (s) => {
  const d = s?.publishedAt || s?.date || s?.createdAt;
  if (!d) return 'Recently';
  const parsed = new Date(d);
  return !isNaN(parsed.getTime()) ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
};

const getStoryReadTime = (s) => s?.readTime || (s?.readingTime ? `${s.readingTime} min read` : '5 min read');

// Helper to check if an article matches a given topic
const articleMatchesTopic = (article, topic) => {
  if (!topic) return true;
  const tName = (topic.name || '').toLowerCase().trim();
  const tSlug = (topic.slug || '').toLowerCase().trim();
  const tId = String(topic._id || topic.id || '').toLowerCase().trim();

  // Check article.topics array
  if (Array.isArray(article.topics)) {
    const hasMatch = article.topics.some(t => {
      if (!t) return false;
      if (typeof t === 'string') {
        const val = t.toLowerCase().trim();
        return val === tName || val === tSlug || val === tId || (tName && val.includes(tName));
      }
      if (typeof t === 'object') {
        const n = (t.name || '').toLowerCase().trim();
        const s = (t.slug || '').toLowerCase().trim();
        const id = String(t._id || t.id || '').toLowerCase().trim();
        return n === tName || s === tSlug || id === tId;
      }
      return false;
    });
    if (hasMatch) return true;
  }

  // Check article.tags
  if (Array.isArray(article.tags)) {
    const tagMatch = article.tags.some(tg => {
      if (!tg) return false;
      const tagStr = String(tg).toLowerCase().trim();
      return tagStr === tName || tagStr === tSlug || tagStr.includes(tSlug);
    });
    if (tagMatch) return true;
  }

  // Check category match
  const cat = getStoryCategory(article).toLowerCase().trim();
  if (cat && (cat === tName || cat === tSlug || (topic.category && cat === topic.category.toLowerCase().trim()))) {
    return true;
  }

  // Title / summary match as a soft fallback
  const title = (article.title || '').toLowerCase();
  const summary = (article.summary || article.subtitle || article.excerpt || '').toLowerCase();
  if (tName && tName.length > 2 && (title.includes(tName) || summary.includes(tName))) return true;

  return false;
};

export default function TopicsPage({
  topicSlug,
  onSelectStory,
  onBackToHome,
  onNavigateTopic,
  isSaved,
  onToggleSave,
  onShareStory,
  onShowToast
}) {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter state for the articles feed section on /topics
  const [activeFilterTopic, setActiveFilterTopic] = useState(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleSort, setArticleSort] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 12;

  // Single Topic View State (/topic/:slug)
  const [activeTopic, setActiveTopic] = useState(null);
  const [topicArticles, setTopicArticles] = useState([]);
  const [singleLoading, setSingleLoading] = useState(false);

  const articlesSectionRef = useRef(null);

  // Load all topics, categories, and published articles
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setArticlesLoading(true);
    try {
      const [topData, catData, artRes] = await Promise.all([
        TaxonomyService.getTopics().catch(() => []),
        TaxonomyService.getCategories().catch(() => []),
        ArticleService.getArticles({ limit: 150 }).catch(() => null)
      ]);

      const loadedTopics = Array.isArray(topData) ? topData : [];
      const loadedCats = Array.isArray(catData) ? catData : [];
      
      let loadedArticles = [];
      if (artRes && artRes.data && Array.isArray(artRes.data)) {
        loadedArticles = artRes.data;
      } else if (Array.isArray(artRes)) {
        loadedArticles = artRes;
      }

      // Combine articles: Fake topics articles + DB articles + ALL_STORIES
      const combinedArticles = [];
      const seenIds = new Set();
      [...FAKE_TOPIC_ARTICLES, ...loadedArticles, ...ALL_STORIES].forEach(art => {
        const uid = art.slug || art._id || art.id;
        if (uid && !seenIds.has(uid)) {
          seenIds.add(uid);
          combinedArticles.push(art);
        }
      });

      // Combine topics: start with FAKE_TOPICS_LIST to guarantee rich descriptions and counts
      const topicMap = new Map();
      FAKE_TOPICS_LIST.forEach(ft => topicMap.set(ft.slug, { ...ft }));

      // Merge loaded DB topics
      loadedTopics.forEach(dt => {
        const slug = dt.slug || String(dt.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (topicMap.has(slug)) {
          const base = topicMap.get(slug);
          topicMap.set(slug, {
            ...base,
            ...dt,
            name: dt.name || base.name,
            description: dt.description?.trim() ? dt.description : base.description,
            category: dt.category || base.category,
            badge: base.badge || null,
            color: base.color || '#e11d48'
          });
        } else {
          topicMap.set(slug, {
            ...dt,
            slug,
            description: dt.description?.trim() ? dt.description : `Deep reporting, startup investigations, and executive dispatches tagged with #${dt.name}.`,
            category: dt.category || 'General',
            categoryIds: (Array.isArray(dt.categoryIds) && dt.categoryIds.length > 0) ? dt.categoryIds : ['General'],
            color: '#e11d48',
            articleCount: 4
          });
        }
      });

      const finalTopics = Array.from(topicMap.values()).map(top => {
        const matchCount = combinedArticles.filter(art => articleMatchesTopic(art, top)).length;
        return {
          ...top,
          articleCount: Math.max(matchCount, top.articleCount || 4)
        };
      });

      // Extract unique categories for filter pills
      const catSet = new Set(['All']);
      loadedCats.forEach(c => { if (c.name) catSet.add(c.name); });
      finalTopics.forEach(t => {
        if (t.category) catSet.add(t.category);
        if (Array.isArray(t.categoryIds)) {
          t.categoryIds.forEach(cid => {
            const cName = typeof cid === 'object' ? cid.name : cid;
            if (cName) catSet.add(cName);
          });
        }
      });

      setTopics(finalTopics);
      setCategories(Array.from(catSet));
      setAllArticles(combinedArticles);
    } catch (e) {
      console.warn('Error fetching topics data:', e);
      setTopics(FAKE_TOPICS_LIST);
      setAllArticles(FAKE_TOPIC_ARTICLES);
    } finally {
      setLoading(false);
      setArticlesLoading(false);
    }
  };

  // If a topicSlug prop is provided or changed, load single topic view
  useEffect(() => {
    if (topicSlug) {
      loadSingleTopic(topicSlug);
    } else {
      setActiveTopic(null);
      setTopicArticles([]);
    }
  }, [topicSlug]);

  const loadSingleTopic = async (slug) => {
    setSingleLoading(true);
    try {
      // Find matching topic in local rich list first
      const localTopic = FAKE_TOPICS_LIST.find(t => t.slug === slug || t.id === slug) || 
                         topics.find(t => t.slug === slug || t._id === slug);

      const res = await TaxonomyService.getTopicBySlug(slug).catch(() => null);
      let foundTopic = res?.topic || localTopic;

      if (!foundTopic) {
        const formattedName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        foundTopic = {
          name: formattedName,
          slug: slug,
          description: `Comprehensive reporting, founder journeys, and articles tagged with #${slug}.`
        };
      }

      setActiveTopic(foundTopic);

      // Match articles from combined pool
      let matched = matchFallbackStories(slug, foundTopic.name);
      if (Array.isArray(res?.articles) && res.articles.length > 0) {
        const seen = new Set(matched.map(m => m.slug || m.id));
        res.articles.forEach(ra => {
          if (!seen.has(ra.slug || ra.id)) {
            matched.unshift(ra);
          }
        });
      }

      // If fewer than 3, backfill with curated fake articles so user never sees an empty screen
      if (matched.length < 3) {
        const filler = FAKE_TOPIC_ARTICLES.filter(fa => !matched.some(m => (m.slug || m.id) === (fa.slug || fa.id)));
        matched = [...matched, ...filler.slice(0, 4 - matched.length)];
      }

      setTopicArticles(matched);
      document.title = `${foundTopic.name} Topics & Articles | GoReadPost`;
    } catch (err) {
      console.warn('Failed to load topic:', err);
      const matched = matchFallbackStories(slug);
      setTopicArticles(matched.length > 0 ? matched : FAKE_TOPIC_ARTICLES.slice(0, 4));
    } finally {
      setSingleLoading(false);
    }
  };

  const matchFallbackStories = (slug, topicName = '') => {
    const sTerm = (slug || '').toLowerCase();
    const nTerm = (topicName || '').toLowerCase();
    const source = allArticles.length > 0 ? allArticles : FAKE_TOPIC_ARTICLES;
    return source.filter(s => {
      const tList = Array.isArray(s.topics) ? s.topics.map(t => String(t).toLowerCase()) : [];
      const tags = Array.isArray(s.tags) ? s.tags.map(t => String(t).toLowerCase()) : [];
      const cat = (s.category || '').toLowerCase();
      const title = (s.title || '').toLowerCase();
      return (
        tList.includes(sTerm) || 
        (nTerm && tList.includes(nTerm)) ||
        tags.includes(sTerm) ||
        title.includes(sTerm) ||
        cat.includes(sTerm)
      );
    });
  };

  // When clicking a topic card in the directory
  const handleSelectTopicFilter = (topic) => {
    if (activeFilterTopic && (activeFilterTopic.slug === topic.slug || activeFilterTopic._id === topic._id)) {
      // Toggle off
      setActiveFilterTopic(null);
    } else {
      setActiveFilterTopic(topic);
    }
    setCurrentPage(1);

    // Smooth scroll down to the articles feed section
    if (articlesSectionRef.current) {
      const topOffset = articlesSectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // When clicking "Dedicated Topic Page"
  const handleOpenDedicatedTopic = (topic, e) => {
    if (e) e.stopPropagation();
    const slug = topic.slug || topic._id;
    if (onNavigateTopic) {
      onNavigateTopic(slug);
    } else {
      window.history.pushState(null, '', `/topic/${slug}`);
      loadSingleTopic(slug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAllTopics = () => {
    if (onNavigateTopic) {
      onNavigateTopic(null);
    } else {
      window.history.pushState(null, '', '/topics');
      setActiveTopic(null);
      setTopicArticles([]);
    }
    document.title = 'Topics Directory | GoReadPost Media';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareTopic = (topic) => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      if (onShowToast) onShowToast(`Topic link copied to clipboard!`);
    } else if (onShareStory) {
      onShareStory({ title: topic.name, slug: topic.slug });
    }
  };

  // Filter topics in directory mode
  const filteredTopics = useMemo(() => {
    let result = topics;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(t => {
        const cat = (t.category || '').toLowerCase();
        const catIds = Array.isArray(t.categoryIds) ? t.categoryIds : [];
        return cat === selectedCategory.toLowerCase() || catIds.some(c => {
          const catName = typeof c === 'object' ? c.name : c;
          return catName?.toLowerCase() === selectedCategory.toLowerCase();
        });
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => 
        t.name?.toLowerCase().includes(q) ||
        t.slug?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [topics, selectedCategory, searchQuery]);

  // Filter articles in the main articles feed
  const filteredFeedArticles = useMemo(() => {
    let list = allArticles;

    // Filter by active topic if selected
    if (activeFilterTopic) {
      let matched = list.filter(art => articleMatchesTopic(art, activeFilterTopic));
      // Guarantee at least 3 articles with relevant filler so user never gets an empty screen
      if (matched.length < 3) {
        const filler = FAKE_TOPIC_ARTICLES.filter(fa => !matched.some(m => (m.slug || m.id) === (fa.slug || fa.id)));
        matched = [...matched, ...filler.slice(0, 4 - matched.length)];
      }
      list = matched;
    }

    // Filter by article search term
    if (articleSearch.trim()) {
      const q = articleSearch.toLowerCase().trim();
      list = list.filter(art => {
        const title = (art.title || '').toLowerCase();
        const excerpt = (art.summary || art.subtitle || art.excerpt || '').toLowerCase();
        const author = getStoryAuthor(art).toLowerCase();
        const cat = getStoryCategory(art).toLowerCase();
        return title.includes(q) || excerpt.includes(q) || author.includes(q) || cat.includes(q);
      });
    }

    // Sort articles
    if (articleSort === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.publishedAt || a.createdAt || 0) - new Date(b.publishedAt || b.createdAt || 0));
    } else if (articleSort === 'popular') {
      list = [...list].sort((a, b) => (b.views || b.readsCount || 0) - (a.views || a.readsCount || 0));
    } else {
      // latest
      list = [...list].sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
    }

    return list;
  }, [allArticles, activeFilterTopic, articleSearch, articleSort]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredFeedArticles.length / articlesPerPage) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * articlesPerPage;
    return filteredFeedArticles.slice(start, start + articlesPerPage);
  }, [filteredFeedArticles, currentPage, articlesPerPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (articlesSectionRef.current) {
      const topOffset = articlesSectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // RENDER 1: SINGLE TOPIC VIEW (/topic/:slug)
  // ══════════════════════════════════════════════════════════════════
  if (topicSlug || activeTopic) {
    return (
      <div className="top-page-wrapper">
        {/* Breadcrumb Navigation Bar */}
        <div className="top-breadcrumb-bar">
          <button 
            type="button" 
            className="top-back-btn" 
            onClick={handleBackToAllTopics}
            title="Return to all topics directory"
          >
            <ArrowLeft size={16} />
            <span>All Topics</span>
          </button>

          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 650 }}>
            {topicArticles.length} {topicArticles.length === 1 ? 'Article' : 'Articles'} in Topic
          </span>
        </div>

        {/* Topic Header Card */}
        {activeTopic && (
          <div className="top-single-header">
            <div className="top-single-tag-pill">
              <Hash size={13} />
              <span>THEMATIC TOPIC</span>
            </div>

            <h1 className="top-single-title">
              #{activeTopic.name}
            </h1>

            {activeTopic.description && (
              <p className="top-single-desc">
                {activeTopic.description}
              </p>
            )}

            <div className="top-single-meta-strip">
              <span>{topicArticles.length} Published Dispatches</span>
              <span>•</span>
              <button
                type="button"
                className="top-icon-btn"
                onClick={() => handleShareTopic(activeTopic)}
                title="Share Topic"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#e11d48', fontWeight: 750, fontSize: '0.82rem' }}
              >
                <Share2 size={14} />
                <span>Share Topic</span>
              </button>
            </div>
          </div>
        )}

        {/* Single Topic Articles Grid */}
        {singleLoading ? (
          <div style={{ padding: '5rem 1rem', textAlign: 'center' }}>
            <RefreshCw size={32} className="animate-spin" color="#e11d48" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontWeight: 650 }}>Loading stories tagged with this topic...</p>
          </div>
        ) : (
          <div className="top-articles-grid">
            {topicArticles.map((article, idx) => {
              const artId = getStoryId(article, idx);
              const artImg = getStoryImage(article);
              const artTitle = getStoryTitle(article);
              const artExcerpt = getStoryExcerpt(article);
              const artCat = getStoryCategory(article);
              const artAuthor = getStoryAuthor(article);
              const artAvatar = getStoryAvatar(article);
              const artDate = getStoryDate(article);
              const artRead = getStoryReadTime(article);
              const articleSaved = isSaved ? Boolean(isSaved(article.id || article._id || article.slug)) : false;

              return (
                <article 
                  key={artId} 
                  className="top-art-card"
                  onClick={() => onSelectStory && onSelectStory(article)}
                >
                  <div className="top-art-media">
                    <img 
                      src={artImg} 
                      alt={artTitle} 
                      className="top-art-img" 
                      loading="lazy"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className="top-art-cat-pill">{artCat}</span>
                  </div>

                  <div className="top-art-body">
                    <div className="top-art-meta">
                      <img src={artAvatar} alt={artAuthor} className="top-art-author-avatar" />
                      <span>{artAuthor}</span>
                      <span>•</span>
                      <span>{artRead}</span>
                    </div>

                    <h3 className="top-art-title">
                      {artTitle}
                    </h3>

                    <p className="top-art-excerpt">
                      {artExcerpt}
                    </p>

                    <div className="top-art-footer">
                      <span className="top-art-date">{artDate}</span>
                      <div className="top-art-actions" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`top-icon-btn ${articleSaved ? 'active' : ''}`}
                          onClick={() => onToggleSave && onToggleSave(article)}
                          title={articleSaved ? "Remove from bookmarks" : "Save for later"}
                        >
                          <Bookmark size={15} fill={articleSaved ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          className="top-icon-btn"
                          onClick={() => onShareStory && onShareStory(article)}
                          title="Share Article"
                        >
                          <Share2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // RENDER 2: TOPICS DIRECTORY HUB (/topics)
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="top-page-wrapper">
      {/* ── Hero Banner ── */}
      <section className="top-hero-banner">
        <div className="top-hero-badge">
          <Hash size={13} />
          <span>TAXONOMY DIRECTORY</span>
        </div>

        <h1 className="top-hero-title">
          Browse by Topics & Domains
        </h1>

        <p className="top-hero-subtitle">
          Discover curated startup intelligence, technical audits, founder playbooks, and market analyses grouped by domain themes.
        </p>

        {/* Search & Filter Toolbar */}
        <div className="top-hero-controls">
          <div className="top-search-wrap">
            <Search size={18} color="#64748b" />
            <input
              type="text"
              className="top-search-input"
              placeholder="Search topics by name, domain, or technology (e.g. Artificial Intelligence, Venture Capital, SaaS)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="top-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear Search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="top-category-pills">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`top-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="top-stats-row">
          <div className="top-stat-item">
            <span className="top-stat-val">{topics.length}</span>
            <span className="top-stat-lbl">Active Topics</span>
          </div>
          <div className="top-stat-item">
            <span className="top-stat-val">{categories.length}</span>
            <span className="top-stat-lbl">Vertical Desks</span>
          </div>
          <div className="top-stat-item">
            <span className="top-stat-val">{allArticles.length}+</span>
            <span className="top-stat-lbl">Published Articles</span>
          </div>
        </div>
      </section>

      {/* ── Topics Cards Grid ── */}
      <div className="top-grid-header">
        <h2 className="top-grid-title">
          {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory !== 'All' ? `${selectedCategory} Topics` : 'All Topics & Themes'}
        </h2>
        <span className="top-count-badge">
          Showing {filteredTopics.length} of {topics.length} Topics
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '5rem 1rem', textAlign: 'center' }}>
          <RefreshCw size={32} className="animate-spin" color="#e11d48" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontWeight: 650 }}>Loading taxonomy topics directory...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="top-empty-state">
          <Hash size={44} color="#94a3b8" style={{ margin: '0 auto' }} />
          <h3>No topics matching "{searchQuery}"</h3>
          <p>Try searching for a different keyword or reset filters to see all active topics.</p>
          <button
            type="button"
            className="top-pill-btn active"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="top-cards-grid">
          {filteredTopics.map((topic, idx) => {
            const topicName = topic.name || 'Topic';
            const topicSlugVal = topic.slug || topic._id;
            const topicDesc = topic.description || `Read breaking news, insights, and founder stories on #${topicName}.`;
            const primaryCat = topic.category || (Array.isArray(topic.categoryIds) && topic.categoryIds.length > 0 ? (typeof topic.categoryIds[0] === 'object' ? topic.categoryIds[0].name : topic.categoryIds[0]) : 'Domain');
            const count = topic.articleCount !== undefined ? topic.articleCount : 5;
            const isSelected = activeFilterTopic && (activeFilterTopic.slug === topic.slug || activeFilterTopic._id === topic._id);
            const cardColor = topic.color || '#e11d48';

            return (
              <div
                key={topic._id || topic.id || idx}
                className={`top-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectTopicFilter(topic)}
              >
                <div className="top-card-header">
                  <div 
                    className="top-card-icon"
                    style={{ color: cardColor, background: `${cardColor}15` }}
                  >
                    <Hash size={18} />
                  </div>
                  
                  <div className="top-card-header-tags">
                    {topic.badge && (
                      <span 
                        className="top-card-badge"
                        style={{ color: cardColor, background: `${cardColor}18` }}
                      >
                        {topic.badge}
                      </span>
                    )}
                    {count !== null && (
                      <span className="top-card-count">
                        {count} {count === 1 ? 'story' : 'stories'}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="top-card-name">
                  #{topicName}
                </h3>

                <p className="top-card-desc">
                  {topicDesc}
                </p>

                <div className="top-card-footer">
                  <span className="top-card-cat-badge">{primaryCat}</span>
                  <span 
                    className="top-card-link-arrow" 
                    title={`View dedicated page for #${topicName}`}
                    onClick={(e) => handleOpenDedicatedTopic(topic, e)}
                  >
                    <span>Page</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Articles & Stories Feed Section ── */}
      <section className="top-articles-section" ref={articlesSectionRef} id="articles-feed">
        <div className="top-articles-header">
          <div className="top-articles-title-group">
            <h2 className="top-articles-title">
              {activeFilterTopic ? `Articles in #${activeFilterTopic.name}` : 'Published Articles & Stories'}
            </h2>

            {activeFilterTopic && (
              <div className="top-active-filter-pill">
                <span>Filter: #{activeFilterTopic.name}</span>
                <button
                  type="button"
                  className="top-active-filter-clear"
                  onClick={() => {
                    setActiveFilterTopic(null);
                    setCurrentPage(1);
                  }}
                  title="Clear Topic Filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="top-articles-toolbar">
            <input
              type="text"
              className="top-art-search-input"
              placeholder="Search articles by title..."
              value={articleSearch}
              onChange={e => {
                setArticleSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            <select
              className="top-art-sort-select"
              value={articleSort}
              onChange={e => {
                setArticleSort(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="latest">Latest Stories</option>
              <option value="popular">Most Read</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <p className="top-articles-subtext">
          Showing {filteredFeedArticles.length} {filteredFeedArticles.length === 1 ? 'article' : 'articles'} 
          {activeFilterTopic ? ` tagged with #${activeFilterTopic.name}` : ' across all taxonomy topics'}.
          {activeFilterTopic && (
            <button
              type="button"
              onClick={() => handleOpenDedicatedTopic(activeFilterTopic)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e11d48',
                fontWeight: 750,
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginLeft: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Open Dedicated Topic Hub</span>
              <ExternalLink size={13} />
            </button>
          )}
        </p>

        {articlesLoading ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <RefreshCw size={28} className="animate-spin" color="#e11d48" style={{ margin: '0 auto 10px' }} />
            <p style={{ color: '#64748b', fontWeight: 650 }}>Loading published articles...</p>
          </div>
        ) : filteredFeedArticles.length === 0 ? (
          <div className="top-empty-state">
            <BookOpen size={40} color="#94a3b8" style={{ margin: '0 auto' }} />
            <h3>No articles found</h3>
            <p>
              {activeFilterTopic 
                ? `No published articles are currently linked to #${activeFilterTopic.name}.` 
                : 'No articles match your search filter.'}
            </p>
            {activeFilterTopic && (
              <button
                type="button"
                className="top-pill-btn active"
                onClick={() => {
                  setActiveFilterTopic(null);
                  setArticleSearch('');
                  setCurrentPage(1);
                }}
              >
                View All Articles
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="top-articles-grid">
              {paginatedArticles.map((article, idx) => {
                const artId = getStoryId(article, idx);
                const artImg = getStoryImage(article);
                const artTitle = getStoryTitle(article);
                const artExcerpt = getStoryExcerpt(article);
                const artCat = getStoryCategory(article);
                const artAuthor = getStoryAuthor(article);
                const artAvatar = getStoryAvatar(article);
                const artDate = getStoryDate(article);
                const artRead = getStoryReadTime(article);
                const articleSaved = isSaved ? Boolean(isSaved(article.id || article._id || article.slug)) : false;

                // Grab a topic tag if available
                const primaryTopic = Array.isArray(article.topics) && article.topics.length > 0
                  ? (typeof article.topics[0] === 'object' ? article.topics[0].name : article.topics[0])
                  : null;

                return (
                  <article 
                    key={artId} 
                    className="top-art-card"
                    onClick={() => onSelectStory && onSelectStory(article)}
                  >
                    <div className="top-art-media">
                      <img 
                        src={artImg} 
                        alt={artTitle} 
                        className="top-art-img" 
                        loading="lazy"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="top-art-cat-pill">{artCat}</span>
                      {primaryTopic && (
                        <span className="top-art-topic-tag">#{primaryTopic}</span>
                      )}
                    </div>

                    <div className="top-art-body">
                      <div className="top-art-meta">
                        <img src={artAvatar} alt={artAuthor} className="top-art-author-avatar" />
                        <span>{artAuthor}</span>
                        <span>•</span>
                        <span>{artRead}</span>
                      </div>

                      <h3 className="top-art-title">
                        {artTitle}
                      </h3>

                      <p className="top-art-excerpt">
                        {artExcerpt}
                      </p>

                      <div className="top-art-footer">
                        <span className="top-art-date">{artDate}</span>
                        <div className="top-art-actions" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`top-icon-btn ${articleSaved ? 'active' : ''}`}
                            onClick={() => onToggleSave && onToggleSave(article)}
                            title={articleSaved ? "Remove from bookmarks" : "Save for later"}
                          >
                            <Bookmark size={15} fill={articleSaved ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            type="button"
                            className="top-icon-btn"
                            onClick={() => onShareStory && onShareStory(article)}
                            title="Share Article"
                          >
                            <Share2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="top-pagination">
                <button
                  type="button"
                  className="top-page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                  if (
                    totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - currentPage) > 2
                  ) {
                    if (Math.abs(pageNum - currentPage) === 3) {
                      return <span key={pageNum} style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`top-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="top-page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
