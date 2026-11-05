import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ChevronRight, ChevronLeft, Search, Mail, CheckCircle2, 
  ArrowRight, ArrowLeft, ArrowLeftRight, Trash2, Plus, LayoutGrid, Tag, Layers, Cpu, Briefcase, 
  GraduationCap, Heart, Eye, Plane, Utensils, Atom, Sparkles, TrendingUp,
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
  onToggleSave, isStudioView = false }) {
  const [activeCategory, setActiveCategory] = useState(() => {
    try {
      const path = window.location.pathname;
      if (path.startsWith('/category/')) {
        const catSlug = path.replace(/^\/category\//, '').split('/')[0].split('?')[0];
        if (catSlug && catSlug !== 'latest' && catSlug !== 'all') {
          return catSlug;
        }
      }
    } catch (e) {}
    return 'All';
  });
  const [likedStories, setLikedStories] = useState(() => {
    try {
      const saved = localStorage.getItem('grp_liked_stories');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleToggleLike = (story, e) => {
    if (e) e.stopPropagation();
    const sId = getStoryId(story);
    const wasLiked = Boolean(likedStories[sId]);
    const newLiked = !wasLiked;
    const updated = { ...likedStories, [sId]: newLiked };
    setLikedStories(updated);
    try {
      localStorage.setItem('grp_liked_stories', JSON.stringify(updated));
    } catch (err) {}
    if (newLiked && onShowToast) {
      onShowToast(`Liked "${getStoryTitle(story)}"`);
    }
  };

  const getStoryViewsCount = (story) => {
    if (typeof story?.views === 'number' && story.views > 0) return story.views;
    if (typeof story?.viewsCount === 'number' && story.viewsCount > 0) return story.viewsCount;
    if (typeof story?.claps === 'number' && story.claps > 0) return story.claps * 4;
    return 520;
  };

  const getStoryLikesCount = (story, storyId) => {
    const sId = storyId || getStoryId(story);
    const baseLikes = typeof story?.claps === 'number' && story.claps > 0
      ? story.claps 
      : (typeof story?.likes === 'number' && story.likes > 0 
          ? story.likes 
          : (typeof story?.likes === 'string' ? parseInt(story.likes) || 0 : Math.max(12, Math.round(getStoryViewsCount(story) * 0.12))));
    const isLiked = Boolean(likedStories[sId]);
    return baseLikes + (isLiked ? 1 : 0);
  };
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [pageConfig, setPageConfig] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(() => isStudioView ? true : false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [liveArticles, setLiveArticles] = useState([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  useEffect(() => {
    const handleOpenAddCard = () => {
      setPickerSearch('');
      setIsAddCardModalOpen(true);
    };
    window.addEventListener('open:add-latest-card', handleOpenAddCard);
    return () => window.removeEventListener('open:add-latest-card', handleOpenAddCard);
  }, []);

  const handleAddExistingStoryToFeed = (story) => {
    const newArt = {
      ...story,
      id: 'art_' + Date.now(),
      isNewlyAdded: true,
      publishedAt: new Date().toISOString()
    };
    setLiveArticles(prev => [newArt, ...prev]);
    ArticleService.createArticle(newArt).catch(() => {});
    setIsAddCardModalOpen(false);
    if (onShowToast) onShowToast(`Card "${story.title}" added to Latest Articles feed!`);
  };

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

  // Fetch live articles from MongoDB backend (both Article API and Story API)
  const fetchLiveArticles = async () => {
    try {
      let combinedLive = [];
      const map = new Map();

      // 1. Fetch from /api/articles (MongoDB Article collection)
      try {
        const artRes = await ArticleService.getArticles({ limit: 300 });
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
        const storyRes = await StoryService.getStories({ limit: 300 });
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
        setLiveArticles(prev => {
          const newlyAdded = prev.filter(p => p.isNewlyAdded);
          const combinedKeys = new Set(combinedLive.map(c => String(c._id || c.id || c.slug)));
          const uniqueNew = newlyAdded.filter(n => !combinedKeys.has(String(n._id || n.id || n.slug)));
          return [...uniqueNew, ...combinedLive];
        });
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
      if (isStudioView || (token && (u.role === 'admin' || u.role === 'superadmin' || u.role === 'SUPER_ADMIN' || localStorage.getItem('adminToken')))) {
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

    let changeTimer = null;
    const handleArticleOrStoryChange = () => {
      if (isStudioView) return;
      if (changeTimer) clearTimeout(changeTimer);
      changeTimer = setTimeout(() => {
        fetchLiveArticles();
      }, 300);
    };

    window.addEventListener('article:change', handleArticleOrStoryChange);
    window.addEventListener('story:change', handleArticleOrStoryChange);
    window.addEventListener('homepage:change', handleArticleOrStoryChange);
    window.addEventListener('page:change', loadLatestConfig);

    return () => {
      if (changeTimer) clearTimeout(changeTimer);
      window.removeEventListener('article:change', handleArticleOrStoryChange);
      window.removeEventListener('story:change', handleArticleOrStoryChange);
      window.removeEventListener('homepage:change', handleArticleOrStoryChange);
      window.removeEventListener('page:change', loadLatestConfig);
    };
  }, [isStudioView]);

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

  // Default to 20 cards per page (common multiple of 5 cols, 4 cols, 2 cols, and 1 col)
  const CARDS_PER_PAGE = useMemo(() => {
    if (feedSec?.data?.cardsPerPage && Number(feedSec.data.cardsPerPage) % 5 === 0) {
      return Number(feedSec.data.cardsPerPage);
    }
    if (feedSec?.data?.limit && Number(feedSec.data.limit) % 5 === 0) {
      return Number(feedSec.data.limit);
    }
    return 20;
  }, [feedSec]);

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

  const availableExistingArticles = useMemo(() => {
    const list = Array.isArray(pool) ? pool : [];
    if (!pickerSearch.trim()) return list.slice(0, 35);
    const q = pickerSearch.toLowerCase();
    return list.filter(a => {
      const title = (a.title || '').toLowerCase();
      const cat = (a.categoryLabel || a.categoryName || a.category || '').toLowerCase();
      return title.includes(q) || cat.includes(q);
    }).slice(0, 35);
  }, [pool, pickerSearch]);

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
    if (!filteredStories || filteredStories.length === 0) return [];
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    let slice = filteredStories.slice(start, start + CARDS_PER_PAGE);

    if (slice.length > 0 && slice.length < CARDS_PER_PAGE && filteredStories.length >= CARDS_PER_PAGE) {
      slice = filteredStories.slice(-CARDS_PER_PAGE);
    }

    // Fill remaining space so that every row in the 4-column grid is 100% full
    if (slice.length > 0 && (slice.length % 4 !== 0 || slice.length < CARDS_PER_PAGE)) {
      const res = [...slice];
      const seen = new Set(res.map(s => String(s._id || s.id || s.slug || s.title || "").trim().toLowerCase()));

      for (const s of filteredStories) {
        if (res.length >= CARDS_PER_PAGE && res.length % 4 === 0) break;
        if (!s) continue;
        const key = String(s._id || s.id || s.slug || s.title || "").trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          res.push(s);
        }
      }

      for (const s of pool) {
        if (res.length >= CARDS_PER_PAGE && res.length % 4 === 0) break;
        if (!s) continue;
        const key = String(s._id || s.id || s.slug || s.title || "").trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          res.push(s);
        }
      }

      while (res.length % 4 !== 0 && pool.length > 0) {
        let added = false;
        for (const s of pool) {
          if (!s) continue;
          const key = String(s._id || s.id || s.slug || s.title || "").trim().toLowerCase();
          if (key && !seen.has(key)) {
            seen.add(key);
            res.push(s);
            added = true;
            if (res.length % 4 === 0) break;
          }
        }
        if (!added) break;
      }

      return res;
    }

    return slice;
  }, [filteredStories, currentPage, CARDS_PER_PAGE, pool]);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setActiveTag(null);
    setCurrentPage(1);
    try {
      if (cat.toLowerCase() === 'all') {
        window.history.pushState(null, '', '/latest');
      } else {
        const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        window.history.pushState(null, '', `/category/${slug}`);
      }
    } catch (e) {}
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
                const storyViews = getStoryViewsCount(story);
                const isCardLiked = Boolean(likedStories[storyId]);
                const storyLikes = getStoryLikesCount(story, storyId);

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
                      <span className="lap-category-on-image">{storyCat}</span>
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
                      <h3 className="lap-card-title">{storyTitle}</h3>

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
                          <span className="lap-author-name">{storyAuthor}</span>
                          <span className="lap-meta-sep">•</span>
                          <span>{storyDate}</span>
                          <span className="lap-meta-sep">•</span>
                          <span>{storyReadTime}</span>
                        </div>

                        <div className="lap-card-meta-right">
                          <span className="lap-views-badge" title={`${storyViews} views`}>
                            <Eye size={12} className="lap-views-icon" />
                            <span>{storyViews}</span>
                          </span>
                          <button 
                            type="button" 
                            className={`lap-like-btn ${isCardLiked ? 'active' : ''}`}
                            onClick={(e) => handleToggleLike(story, e)}
                            title={isCardLiked ? 'Unlike story' : 'Like story'}
                            aria-label="Like story"
                          >
                            <Heart 
                              size={12} 
                              className="lap-like-icon"
                              fill={isCardLiked ? "#dc2626" : "none"} 
                              color={isCardLiked ? "#dc2626" : "#64748b"} 
                            />
                            <span className="lap-like-count">{storyLikes}</span>
                          </button>
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

      {/* ── Add Card Modal ── */}
      {isAddCardModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="admin-modal-overlay" 
          onClick={() => setIsAddCardModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '92vw',
              maxWidth: '680px',
              maxHeight: '88vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid #e2e8f0',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Select Article Card</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddCardModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Existing Articles Picker */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search articles by title or category..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>

              <div 
                className="lap-no-scrollbar"
                style={{ 
                  maxHeight: '58vh', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {availableExistingArticles.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No articles match your search.</p>
                ) : (
                  availableExistingArticles.map(art => {
                    const id = art._id || art.id || art.slug;
                    const title = art.title || 'Untitled';
                    const cat = art.categoryLabel || art.categoryName || art.category || 'Article';
                    const img = art.image || art.coverImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80';
                    return (
                      <div 
                        key={id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          gap: '12px'
                        }}
                      >
                        <img src={img} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 750, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {title}
                          </h4>
                          <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700 }}>{cat}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddExistingStoryToFeed(art)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#ea580c',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 750,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Select
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
