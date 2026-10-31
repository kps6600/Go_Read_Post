import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, ChevronLeft, Search, Mail, CheckCircle2, 
  ArrowRight, ArrowLeft, ArrowLeftRight, Trash2, Plus, LayoutGrid, Tag, Layers, Cpu, Briefcase, 
  GraduationCap, Heart, Plane, Utensils, Atom, Sparkles, TrendingUp,
  Edit3, Bookmark, Image as ImageIcon, Settings
} from 'lucide-react';
import './LatestArticlesPage.css';
import { NewsletterService } from '../services/newsletterService';
import { PageService } from '../services/pageService';
import { ArticleService } from '../services/articleService';
import { StoryService } from '../services/storyService';
import { ALL_STORIES } from '../data/storiesData';
import NewsletterBanner from './NewsletterBanner';

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
const getStoryTag = (s) => {
  const tagList = [];
  if (Array.isArray(s?.tags)) {
    s.tags.forEach(t => {
      if (t && typeof t === 'string' && t.trim() && t.toLowerCase() !== 'news') {
        tagList.push(t.trim());
      }
    });
  } else if (typeof s?.tags === 'string' && s.tags.trim()) {
    s.tags.split(',').forEach(t => {
      const clean = t.trim();
      if (clean && clean.toLowerCase() !== 'news') tagList.push(clean);
    });
  }
  if (typeof s?.tag === 'string' && s.tag.trim() && s.tag.toLowerCase() !== 'news') {
    tagList.push(s.tag.trim());
  }
  if (Array.isArray(s?.topics)) {
    s.topics.forEach(t => {
      if (t && typeof t === 'string' && t.trim() && t.toLowerCase() !== 'news') {
        tagList.push(t.trim());
      }
    });
  }
  if (typeof s?.topic === 'string' && s.topic.trim() && s.topic.toLowerCase() !== 'news') {
    tagList.push(s.topic.trim());
  }
  if (typeof s?.categoryName === 'string' && s.categoryName.trim() && s.categoryName.toLowerCase() !== 'news') {
    tagList.push(s.categoryName.trim());
  }
  if (typeof s?.categoryLabel === 'string' && s.categoryLabel.trim() && s.categoryLabel.toLowerCase() !== 'news') {
    tagList.push(s.categoryLabel.trim());
  }
  if (typeof s?.categoryTag === 'string' && s.categoryTag.trim() && s.categoryTag.toLowerCase() !== 'news') {
    tagList.push(s.categoryTag.trim());
  }
  if (typeof s?.category === 'object' && s.category?.name && s.category.name.toLowerCase() !== 'news') {
    tagList.push(s.category.name.trim());
  }
  if (typeof s?.category === 'string' && s.category.trim() && s.category.toLowerCase() !== 'news' && !/^[0-9a-fA-F]{24}$/.test(s.category)) {
    tagList.push(s.category.trim());
  }

  const unique = [];
  const seen = new Set();
  tagList.forEach(item => {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  });

  if (unique.length > 0) {
    if (unique.length > 1 && (unique[0].length + unique[1].length <= 16)) {
      return `${unique[0]} · ${unique[1]}`;
    }
    return unique[0];
  }

  const title = (s?.title || '').toLowerCase();
  if (title.includes('ai') || title.includes('tech') || title.includes('robot') || title.includes('compute') || title.includes('silicon')) return 'AI & Tech';
  if (title.includes('startup') || title.includes('founder') || title.includes('bootstrap') || title.includes('pitch')) return 'Startups';
  if (title.includes('fund') || title.includes('invest') || title.includes('ipo') || title.includes('vc') || title.includes('crore')) return 'Funding';
  if (title.includes('farmer') || title.includes('rural') || title.includes('grassroot') || title.includes('women')) return 'HerStory';
  if (title.includes('school') || title.includes('child') || title.includes('library') || title.includes('social')) return 'Social Impact';

  return 'Spotlight';
};

const getStoryCategory = (s) => getStoryTag(s);

const getStoryCategorySlug = (s) => {
  const cat = s?.category || s?.categoryLabel || 'general';
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';
};

const getCategoryBadgeColor = (slug) => {
  const clean = (slug || '').toLowerCase();
  if (clean.includes('tech') || clean.includes('science') || clean.includes('ai')) return '#dc2626';
  if (clean.includes('business') || clean.includes('startup')) return '#059669';
  if (clean.includes('edu') || clean.includes('study')) return '#7c3aed';
  if (clean.includes('health')) return '#dc2626';
  if (clean.includes('life')) return '#0891b2';
  if (clean.includes('travel')) return '#ea580c';
  if (clean.includes('food')) return '#d97706';
  return '#dc2626';
};

const getCategoryIcon = (slug) => {
  const clean = (slug || '').toLowerCase();
  if (clean.includes('tech') || clean.includes('science') || clean.includes('ai')) return { icon: Cpu, bg: '#fee2e2', color: '#dc2626' };
  if (clean.includes('business') || clean.includes('startup')) return { icon: Briefcase, bg: '#ecfdf5', color: '#059669' };
  if (clean.includes('edu') || clean.includes('study')) return { icon: GraduationCap, bg: '#f5f3ff', color: '#7c3aed' };
  if (clean.includes('health')) return { icon: Heart, bg: '#fff1f2', color: '#dc2626' };
  if (clean.includes('travel')) return { icon: Plane, bg: '#fff7ed', color: '#ea580c' };
  if (clean.includes('food')) return { icon: Utensils, bg: '#fffbeb', color: '#d97706' };
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

// Extract timestamp in ms from any story/article format for chronological sorting
const getStoryTime = (s) => {
  if (!s) return 0;
  // 1. Direct parseable dates
  const candidates = [s.createdAt, s.publishedAt, s.date, s.updatedAt];
  for (const c of candidates) {
    if (c) {
      const t = new Date(c).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
  }

  // 2. MongoDB ObjectId (24 hex characters, first 8 chars = hex unix epoch in seconds)
  if (s._id && typeof s._id === 'string' && /^[0-9a-fA-F]{24}$/.test(s._id)) {
    try {
      const t = parseInt(s._id.substring(0, 8), 16) * 1000;
      if (!isNaN(t) && t > 0) return t;
    } catch (e) {}
  }

  // 3. ID containing unix timestamp (e.g., art_178... or 178...)
  if (s.id && typeof s.id === 'string') {
    const match = s.id.match(/(\d{10,13})/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 1000000000) {
        return num < 10000000000 ? num * 1000 : num;
      }
    }
  }

  // 4. Relative time strings fallback
  if (typeof s.publishedAt === 'string') {
    const lower = s.publishedAt.toLowerCase().trim();
    if (lower === 'just now' || lower === 'now') return Date.now();
    if (lower === 'today') return Date.now() - 3600000 * 2;
    if (lower === 'yesterday') return Date.now() - 86400000;
    const hoursMatch = lower.match(/(\d+)\s*h(?:our)?s?\s*ago/);
    if (hoursMatch) return Date.now() - parseInt(hoursMatch[1], 10) * 3600000;
    const daysMatch = lower.match(/(\d+)\s*d(?:ay)?s?\s*ago/);
    if (daysMatch) return Date.now() - parseInt(daysMatch[1], 10) * 86400000;
  }

  return 0;
};

// Check if story was added recently (within the last 72 hours)
const isNewlyAdded = (s) => {
  if (s?.isNewlyAdded) return true;
  const t = getStoryTime(s);
  if (!t) return false;
  const diffHours = (Date.now() - t) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 72;
};

// Human-friendly date representation with relative freshness
const getStoryDate = (s) => {
  const raw = s?.publishedAt || s?.date || s?.formattedDate || s?.createdAt;
  if (!raw) return 'Today';
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffMinutes >= 0 && diffMinutes < 60) {
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`;
    }
    if (diffHours >= 1 && diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffHours >= 24 && diffHours < 48) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return typeof raw === 'string' ? raw : 'Today';
};

const getStoryReadTime = (s) => s?.readTime || (s?.readingTime ? `${s.readingTime} min read` : '5 min read');

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
    category: (art.categoryName || 'startups').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    categoryTag: art.categoryName || 'Startups',
    categoryName: art.categoryName || 'Startups',
    categoryLabel: art.categoryName || 'Startups',
    tag: art.isHero ? 'HERO' : art.isEditorsPick ? 'EDITOR' : art.isFeatured ? 'FEATURED' : art.isBreaking ? 'BREAKING' : art.isTrending ? 'TRENDING' : 'LATEST',
    isHero: Boolean(art.isHero || art.placements?.includes('homepage_hero')),
    isFeatured: Boolean(art.isFeatured || art.isHero),
    isTrending: Boolean(art.isTrending || art.placements?.includes('trending')),
    isLatest: art.isLatest !== undefined ? Boolean(art.isLatest) : true,
    isEditorsPick: Boolean(art.isEditorsPick || art.placements?.includes('editors_pick')),
    isBreaking: Boolean(art.isBreaking || art.placements?.includes('breaking')),
    isCategoryFeatured: Boolean(art.isCategoryFeatured || art.placements?.includes('category_top')),
    placements: Array.isArray(art.placements) ? art.placements : [],
    image: img || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    author: {
      name: art.authorName || 'Editorial Desk',
      title: art.authorTitle || 'Staff Reporter',
      avatar: art.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    authorName: art.authorName || 'Editorial Desk',
    authorAvatar: art.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
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
    status: art.status || 'published',
    isNewlyAdded: true
  };
};

export default function LatestArticlesPage({
  stories = [],
  onSelectStory,
  onBackToHome,
  onCategoryClick,
  onShowToast,
  isSaved,
  onToggleSave
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
  const [isEditMode, setIsEditMode] = useState(true);
  const [liveArticles, setLiveArticles] = useState([]);

  // Live direct UI edit handlers
  const handleUpdatePageSettings = async (updates) => {
    try {
      await PageService.updatePage('latest', {
        title: updates.title !== undefined ? updates.title : (pageConfig?.title || 'Latest Articles & Dispatches'),
        description: updates.description !== undefined ? updates.description : (pageConfig?.description || ''),
        heroSubhead: updates.description !== undefined ? updates.description : (pageConfig?.description || ''),
        status: 'published'
      });
      setPageConfig(prev => ({ ...prev, ...updates }));
      if (onShowToast) onShowToast('Page title and description updated live!');
    } catch (e) {
      console.warn('Could not update page settings:', e);
    }
  };

  const handleUpdateNewsletterBanner = async (bannerData) => {
    try {
      const currentSections = pageConfig?.sections || [];
      const updatedSections = currentSections.map(s => {
        if (s.type === 'newsletter' || s.id === 'newsletter' || s.id === 'latest_newsletter') {
          return { ...s, data: bannerData, customConfig: bannerData };
        }
        return s;
      });
      await PageService.updatePage('latest', {
        sections: updatedSections
      });
      if (onShowToast) onShowToast('Newsletter banner updated live!');
    } catch (e) {
      console.warn('Could not update newsletter banner:', e);
    }
  };

  const handleInlineStoryUpdate = async (story, updates) => {
    if (!story) return;
    const artId = story._id || story.id || story.slug;

    // Optimistically update liveArticles in state
    setLiveArticles(prev => prev.map(a => {
      const aId = a._id || a.id || a.slug;
      if (String(aId) === String(artId)) {
        return { ...a, ...updates };
      }
      return a;
    }));

    // Update MongoDB Article / Story collection
    try {
      const payload = { ...updates };
      if (updates.authorName) {
        payload.authorName = updates.authorName;
        payload.author = { name: updates.authorName };
      }
      if (updates.category) {
        payload.categoryName = updates.category;
        payload.categoryLabel = updates.category;
      }
      try {
        await ArticleService.updateArticle(artId, payload);
      } catch (e1) {
        try {
          await StoryService.updateStory(artId, payload);
        } catch (e2) {}
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('article:change'));
        window.dispatchEvent(new CustomEvent('story:change'));
      }
    } catch (e) {
      console.warn('Could not update article:', e);
    }
  };

  const handleMoveStoryInFeed = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentStories.length) return;
    const reordered = [...liveArticles];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setLiveArticles(reordered);
    if (onShowToast) onShowToast('Story order updated live!');
  };

  const handleDeleteStoryFromFeed = async (story) => {
    const title = getStoryTitle(story);
    if (!window.confirm(`Remove "${title}" from the Latest Articles feed?`)) return;
    const artId = story._id || story.id || story.slug;
    setLiveArticles(prev => prev.filter(a => String(a._id || a.id || a.slug) !== String(artId)));
    if (onShowToast) onShowToast(`"${title}" removed from feed.`);
  };

  const CARDS_PER_PAGE = 16;

  // Fetch live articles from MongoDB backend (both Article API and Story API)
  const fetchLiveArticles = async () => {
    try {
      let combinedLive = [];
      const map = new Map();

      // 1. Fetch from /api/articles (MongoDB Article collection)
      try {
        const artRes = await ArticleService.getArticles({ limit: 100 });
        if (artRes && artRes.success && Array.isArray(artRes.data)) {
          artRes.data.forEach(item => {
            const normalized = normalizeMongoArticle(item);
            if (normalized) {
              const key = String(normalized._id || normalized.id || normalized.slug);
              map.set(key, normalized);
            }
          });
        }
      } catch (e) {
        console.warn('Could not fetch articles from /api/articles:', e);
      }

      // 2. Fetch from /api/stories (MongoDB Story collection / synced cache)
      try {
        const storyRes = await StoryService.getStories({ limit: 100 });
        if (storyRes && Array.isArray(storyRes.data)) {
          storyRes.data.forEach(s => {
            const key = String(s._id || s.id || s.slug);
            if (!map.has(key)) {
              map.set(key, s);
            } else {
              // Merge rich properties if present
              map.set(key, { ...s, ...map.get(key) });
            }
          });
        }
      } catch (e) {
        console.warn('Could not fetch stories from /api/stories:', e);
      }

      combinedLive = Array.from(map.values());
      if (combinedLive.length > 0) {
        setLiveArticles(combinedLive);
      }
    } catch (err) {
      console.warn('Could not load live latest articles:', err);
    }
  };

  // Check admin session, fetch latest page config, and fetch live articles on mount
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
    fetchLiveArticles();

    const handleArticleOrStoryChange = () => {
      fetchLiveArticles();
    };

    window.addEventListener('article:change', handleArticleOrStoryChange);
    window.addEventListener('story:change', handleArticleOrStoryChange);
    window.addEventListener('homepage:change', handleArticleOrStoryChange);
    window.addEventListener('page:change', loadLatestConfig);

    return () => {
      window.removeEventListener('article:change', handleArticleOrStoryChange);
      window.removeEventListener('story:change', handleArticleOrStoryChange);
      window.removeEventListener('homepage:change', handleArticleOrStoryChange);
      window.removeEventListener('page:change', loadLatestConfig);
    };
  }, []);

  // Section reference for custom title, subtitle, and curated articles
  const feedSec = useMemo(() => {
    if (!pageConfig?.sections) return null;
    return pageConfig.sections.find(s => s.type === 'stories_feed' || s.id === 'latest_feed' || (s.type || '').includes('feed'));
  }, [pageConfig]);

  // Section reference for newsletter subscription banner
  const newsletterSec = useMemo(() => {
    if (!pageConfig?.sections) return null;
    return pageConfig.sections.find(s => s.type === 'newsletter' || s.id === 'latest_newsletter');
  }, [pageConfig]);

  // Real content master pool (chronologically sorted so newly added articles are placed at the front)
  const pool = useMemo(() => {
    const map = new Map();

    const addStory = (s) => {
      if (!s) return;
      const key = String(s._id || s.id || s.slug || '');
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, s);
      } else {
        const existing = map.get(key);
        map.set(key, { ...existing, ...s });
      }
    };

    // 1. Live fetched articles from MongoDB (newest live articles)
    (liveArticles || []).forEach(addStory);

    // 2. Stories passed via props from App
    (stories || []).forEach(addStory);

    // 3. Articles from dynamic page config if configured
    if (feedSec?.data) {
      if (Array.isArray(feedSec.data.articles) && feedSec.data.articles.length > 0) {
        feedSec.data.articles.forEach(addStory);
      }
      if (Array.isArray(feedSec.data.articleIds) && feedSec.data.articleIds.length > 0) {
        const sourceList = (stories && stories.length > 0) ? stories : ALL_STORIES;
        feedSec.data.articleIds.forEach(id => {
          const match = sourceList.find(a => (a.id === id || a._id === id || a.slug === id));
          if (match) addStory(match);
        });
      }
    }

    // 4. Default seed stories only if database is completely empty
    if (map.size === 0) {
      (ALL_STORIES || []).forEach(addStory);
    }

    const allList = Array.from(map.values());

    // Sort strictly newest first (highest timestamp to lowest)
    return allList.sort((a, b) => getStoryTime(b) - getStoryTime(a));
  }, [liveArticles, stories, feedSec]);

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
      // Placements filter (if explicitly excluded from latest)
      if (story.isLatest === false) return false;
      if (Array.isArray(story.placements) && story.placements.length > 0 && !story.placements.includes('latest')) {
        return false;
      }

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



  return (
    <div className="lap-page-wrapper">


      {/* ── Admin Visual Editor Toolbar ── */}
      {isAdminUser && (
        <div className="lap-admin-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#ea580c', 
              color: '#ffffff', 
              padding: '4px 10px', 
              borderRadius: '6px', 
              fontSize: '0.78rem', 
              fontWeight: 850 
            }}>
              ✏️ LIVE UI STUDIO
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
              Direct In-Place Editing Active
            </span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Auto-saves directly to server
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsEditMode(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: isEditMode ? '#fff7ed' : '#f1f5f9',
                border: isEditMode ? '1.5px solid #fdba74' : '1px solid #cbd5e1',
                color: isEditMode ? '#ea580c' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              {isEditMode ? '✏️ Edit Mode: ON' : '👁️ Reader Preview'}
            </button>

            <button
              type="button"
              onClick={() => {
                const titlePrompt = window.prompt("Add article title to latest feed:");
                if (titlePrompt && titlePrompt.trim()) {
                  const newArt = {
                    id: 'art_' + Date.now(),
                    title: titlePrompt.trim(),
                    subtitle: 'Exclusive reporting from GoReadPost newsroom.',
                    summary: 'Exclusive reporting from GoReadPost newsroom.',
                    category: 'Startups',
                    categoryName: 'Startups',
                    categoryLabel: 'Startups',
                    authorName: 'Editorial Desk',
                    author: { name: 'Editorial Desk' },
                    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
                    publishedAt: new Date().toISOString(),
                    readTime: '4 min read',
                    isNewlyAdded: true
                  };
                  setLiveArticles(prev => [newArt, ...prev]);
                  ArticleService.createArticle(newArt).catch(() => {});
                  if (onShowToast) onShowToast('New article card added to Latest feed!');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#ea580c',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 750,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
              }}
            >
              <Plus size={14} />
              <span>Add Article</span>
            </button>

            <a
              href="/admin/pages/latest/edit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Settings size={14} />
              <span>Pages Manager</span>
            </a>
          </div>
        </div>
      )}

      {/* ── Page Header (Direct In-Place Editable) ── */}
      <div className="lap-header" style={{ marginBottom: '1.75rem' }}>
        <h1
          contentEditable={isAdminUser && isEditMode}
          suppressContentEditableWarning={true}
          className={isAdminUser && isEditMode ? "lap-title lse-direct-editable" : "lap-title"}
          onBlur={(e) => {
            const val = e.currentTarget.textContent.trim();
            if (val) handleUpdatePageSettings({ title: val });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          title={isAdminUser && isEditMode ? "Click directly to edit page headline" : undefined}
          style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
        >
          {pageConfig?.title || "Latest Articles & Dispatches"}
        </h1>
        <p
          contentEditable={isAdminUser && isEditMode}
          suppressContentEditableWarning={true}
          className={isAdminUser && isEditMode ? "lap-subtitle lse-direct-editable" : "lap-subtitle"}
          onBlur={(e) => {
            const val = e.currentTarget.textContent.trim();
            handleUpdatePageSettings({ description: val });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          title={isAdminUser && isEditMode ? "Click directly to edit page subtitle" : undefined}
          style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
        >
          {pageConfig?.description || "Real-time dispatches, founder stories, deeptech, venture capital reporting, and latest scoops."}
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
                const isCardSaved = isSaved ? Boolean(isSaved(story.id || story._id || story.slug)) : false;

                return (
                  <article 
                    key={storyId} 
                    className="lap-card"
                    onClick={() => {
                      if (!isAdminUser || !isEditMode) {
                        onSelectStory && onSelectStory(story);
                      }
                    }}
                    style={{ position: 'relative' }}
                  >
                    {/* Admin Floating Card Action Bar */}
                    {isAdminUser && isEditMode && (
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          gap: '6px'
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ea580c' }}>
                          #{idx + 1}
                        </span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveStoryInFeed(idx, 'up')}
                            title="Move earlier (left)"
                            style={{
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: idx === 0 ? 'not-allowed' : 'pointer',
                              opacity: idx === 0 ? 0.35 : 1
                            }}
                          >
                            <ArrowLeft size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === currentStories.length - 1}
                            onClick={() => handleMoveStoryInFeed(idx, 'down')}
                            title="Move later (right)"
                            style={{
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: idx === currentStories.length - 1 ? 'not-allowed' : 'pointer',
                              opacity: idx === currentStories.length - 1 ? 0.35 : 1
                            }}
                          >
                            <ArrowRight size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStoryFromFeed(story)}
                            title="Delete article from feed"
                            style={{
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#ef4444',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="lap-thumb-wrap" style={{ position: 'relative' }}>
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

                      {/* Photo Change Overlay on Hover */}
                      {isAdminUser && isEditMode && (
                        <div className="lse-card-img-overlay">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newImg = window.prompt("Enter new photo URL for this article:", storyImg);
                              if (newImg && newImg.trim() && newImg !== storyImg) {
                                handleInlineStoryUpdate(story, { image: newImg.trim(), featuredImage: newImg.trim() });
                              }
                            }}
                            style={{
                              background: 'rgba(15, 23, 42, 0.88)',
                              color: '#ffffff',
                              border: '1px solid rgba(255,255,255,0.25)',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 750,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              backdropFilter: 'blur(4px)'
                            }}
                            title="Change photo URL"
                          >
                            <ImageIcon size={12} />
                            <span>Photo</span>
                          </button>
                        </div>
                      )}

                      {isNewlyAdded(story) && (
                        <span className="lap-badge-new">
                          <span className="lap-badge-new-dot" /> NEW
                        </span>
                      )}
                      <span 
                        contentEditable={isAdminUser && isEditMode}
                        suppressContentEditableWarning={true}
                        className={isAdminUser && isEditMode ? "lap-category-on-image lse-direct-editable" : "lap-category-on-image"}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== storyCat) {
                            handleInlineStoryUpdate(story, { category: val, categoryName: val, categoryLabel: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title={isAdminUser && isEditMode ? "Click directly to edit category badge" : undefined}
                        style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
                      >
                        {storyCat}
                      </span>
                      <button 
                        type="button" 
                        className={`lap-card-save-btn ${isCardSaved ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(story);
                        }}
                        title={isCardSaved ? 'Remove from saved bookmarks' : 'Save story'}
                        aria-label="Save story"
                      >
                        <Bookmark size={15} fill={isCardSaved ? '#ffffff' : 'none'} color="#ffffff" />
                      </button>
                    </div>

                    <div className="lap-card-body">
                      <h3 
                        contentEditable={isAdminUser && isEditMode}
                        suppressContentEditableWarning={true}
                        className={isAdminUser && isEditMode ? "lap-card-title lse-direct-editable" : "lap-card-title"}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== storyTitle) {
                            handleInlineStoryUpdate(story, { title: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title={isAdminUser && isEditMode ? "Click directly on text to edit article title" : undefined}
                        style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
                      >
                        {storyTitle}
                      </h3>

                      {storyExcerpt && (
                        <p
                          contentEditable={isAdminUser && isEditMode}
                          suppressContentEditableWarning={true}
                          className={isAdminUser && isEditMode ? "lse-direct-editable" : ""}
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent.trim();
                            if (val !== storyExcerpt) {
                              handleInlineStoryUpdate(story, { summary: val, excerpt: val, subtitle: val });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          style={{
                            fontSize: '0.82rem',
                            color: '#64748b',
                            lineHeight: 1.45,
                            margin: '0 0 10px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            cursor: isAdminUser && isEditMode ? 'text' : 'default'
                          }}
                          title={isAdminUser && isEditMode ? "Click directly to edit summary teaser" : undefined}
                        >
                          {storyExcerpt}
                        </p>
                      )}

                      <div className="lap-card-meta">
                        <div className="lap-card-meta-left">
                          <img 
                            src={storyAvatar} 
                            alt={storyAuthor} 
                            className="lap-author-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span 
                            contentEditable={isAdminUser && isEditMode}
                            suppressContentEditableWarning={true}
                            className={isAdminUser && isEditMode ? "lap-author-name lse-direct-editable" : "lap-author-name"}
                            onBlur={(e) => {
                              const val = e.currentTarget.textContent.trim();
                              if (val && val !== storyAuthor) {
                                handleInlineStoryUpdate(story, { authorName: val, author: val });
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.currentTarget.blur();
                              }
                            }}
                            title={isAdminUser && isEditMode ? "Click directly to edit author" : undefined}
                            style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
                          >
                            {storyAuthor}
                          </span>
                          <span className="lap-meta-sep">•</span>
                          <span>{storyDate}</span>
                          <span className="lap-meta-sep">•</span>
                          <span>{storyReadTime}</span>
                        </div>
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

      {/* ── Newsletter Subscription Banner (Direct In-Place Editable) ── */}
      <NewsletterBanner
        data={newsletterSec?.data || {}}
        isAdmin={isAdminUser && isEditMode}
        onUpdate={handleUpdateNewsletterBanner}
        onShowToast={onShowToast}
      />
    </div>
  );
}
