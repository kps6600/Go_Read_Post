import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, ArrowRight,
  Mail, CheckCircle2, Sparkles, Zap, Bookmark, Heart
} from 'lucide-react';
import './ModernHomepage.css';
import LiveHomepageStudio from './admin/LiveHomepageStudio';
import './admin/LiveHomepageStudio.css';
import { NewsletterService } from '../services/newsletterService';
import { 
  ALL_STORIES, LEAD_STORY, TOP_PICKS, CAPTABLE_STORIES,
  SPOTLIGHT_STORIES, FOUNDER_FIRST_STORIES 
} from '../data/storiesData';
import DynamicText from './dynamic/DynamicText';
import DynamicServices from './dynamic/DynamicServices';
import DynamicPortfolio from './dynamic/DynamicPortfolio';
import DynamicTestimonials from './dynamic/DynamicTestimonials';
import DynamicCTA from './dynamic/DynamicCTA';
import DynamicFAQ from './dynamic/DynamicFAQ';
import DynamicContact from './dynamic/DynamicContact';
import DynamicImageText from './dynamic/DynamicImageText';
import DynamicFeatures from './dynamic/DynamicFeatures';
import DynamicStats from './dynamic/DynamicStats';
import DynamicBrands from './dynamic/DynamicBrands';
import VideoSection from './VideoSection';
import ConversationsSection from './ConversationsSection';
import AboutSection from './AboutSection';

// Safe extraction helper functions for dynamic story objects
const getStoryId = (s, fallbackIdx = 0) => s?.id || s?._id || s?.slug || `story-${fallbackIdx}`;

const getStoryImage = (s) => {
  if (!s) return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80';
  const img = s.image || 
    (typeof s.featuredImage === 'string' ? s.featuredImage : s.featuredImage?.url) || 
    s.fallbackImage;
  return img || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80';
};

const getStoryTitle = (s) => (typeof s?.title === 'string' ? s.title : 'Featured Story');

const getStoryExcerpt = (s) => {
  if (!s) return '';
  if (typeof s.summary === 'string') return s.summary;
  if (typeof s.subtitle === 'string') return s.subtitle;
  if (typeof s.excerpt === 'string') return s.excerpt;
  if (typeof s.description === 'string') return s.description;
  if (typeof s.content === 'string') {
    return s.content.replace(/<[^>]+>/g, '').trim().slice(0, 140) + '...';
  }
  if (Array.isArray(s.content) && s.content.length > 0 && typeof s.content[0] === 'string') {
    return s.content[0].replace(/<[^>]+>/g, '').trim().slice(0, 140) + '...';
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
  const cat = (typeof s?.category === 'string' && !/^[0-9a-fA-F]{24}$/.test(s.category) ? s.category : '') || 
              (typeof s?.categoryLabel === 'string' && !/^[0-9a-fA-F]{24}$/.test(s.categoryLabel) ? s.categoryLabel : '') || 'startups';
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'startups';
};

const getStoryAuthor = (s) => {
  if (typeof s?.author === 'object' && s?.author && typeof s.author.name === 'string') return s.author.name;
  if (typeof s?.author === 'string' && s.author.trim()) return s.author;
  if (typeof s?.authorName === 'string' && s.authorName.trim()) return s.authorName;
  return 'Editorial Desk';
};

const getStoryAvatar = (s) => {
  if (typeof s?.author === 'object' && s?.author?.avatar) return s.author.avatar;
  if (typeof s?.authorAvatar === 'string') return s.authorAvatar;
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
};

const getStoryDate = (s) => {
  const d = s?.publishedAt || s?.date || s?.formattedDate || s?.createdAt;
  if (!d) return 'Today';
  if (typeof d === 'string') {
    if (d.includes('T') || (d.includes('-') && d.length > 10)) {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return d;
  }
  if (typeof d === 'number') {
    const parsed = new Date(d);
    return !isNaN(parsed.getTime()) ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today';
  }
  if (d instanceof Date) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return 'Today';
};

const getStoryReadTime = (s) => {
  let val = s?.readTime || s?.readingTime || '4 min read';
  if (typeof val === 'number') return `${val} min read`;
  if (typeof val === 'string') {
    const clean = val.replace(/\s*min\s*read\s*/gi, '').trim();
    return `${clean || '4'} min read`;
  }
  return '4 min read';
};

const getCategoryBadgeColor = (slug) => {
  const clean = (slug || '').toLowerCase();
  if (clean.includes('startup')) return '#059669';
  if (clean.includes('tech') || clean.includes('ai')) return '#dc2626';
  if (clean.includes('enterprise')) return '#7c3aed';
  if (clean.includes('her') || clean.includes('women')) return '#db2777';
  if (clean.includes('smb') || clean.includes('msme')) return '#ea580c';
  if (clean.includes('leader')) return '#0891b2';
  if (clean.includes('social') || clean.includes('impact')) return '#10b981';
  if (clean.includes('sport')) return '#dc2626';
  return '#dc2626';
};

export default function ModernHomepageView({ 
  stories = [], 
  homepageSections = [],
  onSelectStory, 
  onCategoryClick, 
  onShowToast,
  isSaved,
  onToggleSave,
  onClapStory
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likedStories, setLikedStories] = useState(() => {
    try {
      const saved = localStorage.getItem('grp_liked_stories');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isLiveStudioOpen, setIsLiveStudioOpen] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (token && (u.role === 'admin' || u.role === 'superadmin' || u.role === 'SUPER_ADMIN' || localStorage.getItem('adminToken'))) {
        setIsAdminUser(true);
      }
    } catch (e) {}
  }, []);

  // Pool of stories: Live database stories merged with ALL_STORIES
  const pool = useMemo(() => {
    const combined = Array.isArray(stories) ? [...stories] : [];
    const seen = new Set(
      combined.map(a => String(a.slug || a.id || a._id || a.title || '').trim().toLowerCase())
    );
    for (const item of ALL_STORIES) {
      const key = String(item.slug || item.id || item._id || item.title || '').trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }
    return combined;
  }, [stories]);

  // Active homepage sections from database or sensible defaults
  const activeSections = useMemo(() => {
    if (Array.isArray(homepageSections) && homepageSections.length > 0) {
      return [...homepageSections]
        .filter(s => s.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [
      { sectionKey: 'hero_popular', title: 'Lead Stories & Popular Posts', enabled: true, order: 1 },
      { sectionKey: 'latest_blogs', title: 'Latest from the Blog', enabled: true, order: 2 },
      { sectionKey: 'trending', title: 'Trending Now', enabled: true, order: 3 },
      { sectionKey: 'popular_editors', title: "Most Popular & Editor's Picks", enabled: true, order: 4 },
      { sectionKey: 'spotlight', title: 'Tech & Startup Spotlight', enabled: true, order: 5 }
    ];
  }, [homepageSections]);

  // Active hero section configuration
  const heroConfig = useMemo(() => {
    return activeSections.find(s => (s.type || s.sectionKey || '').toLowerCase().includes('hero')) || null;
  }, [activeSections]);

  // 1. Dynamic Hero Slides
  const heroSlides = useMemo(() => {
    const data = heroConfig?.data || {};

    // Mode A: Custom Admin Curated Slides
    if (Array.isArray(data.slides) && data.slides.length > 0) {
      const liveSlides = data.slides.filter(s => {
        if (!s) return false;
        if (s.isCustom || !s.articleId) return true;
        const id = String(s.id || s._id || s.articleId || s.slug);
        return pool.some(p => String(p._id || p.id || p.slug) === id || p.title === s.title);
      });
      const slidesToUse = liveSlides.length > 0 ? liveSlides : data.slides;
      return slidesToUse.map((s, idx) => ({
        id: s.id || s._id || `custom-slide-${idx}`,
        title: s.title || data.headline || 'Featured Story',
        excerpt: s.excerpt || s.description || s.summary || data.subheadline || '',
        category: s.category || s.categoryLabel || data.badge || 'FEATURED',
        image: s.image || s.coverImage || data.bgImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
        author: typeof s.author === 'object' ? s.author?.name : (s.author || 'Editorial Bureau'),
        authorAvatar: s.authorAvatar || s.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        date: s.date || s.publishedAt || 'Today',
        readTime: s.readTime || '4 min read',
        primaryBtnText: s.primaryBtnText || data.primaryBtnText || 'Read More',
        link: s.link || s.primaryBtnUrl || data.primaryBtnUrl || (s.slug ? `/stories/${s.slug}` : `/stories/${s.id || s._id}`) || '/latest',
        isCustom: true
      }));
    }

    // Mode B: Static Headline Banner
    if (data.heroSource === 'static') {
      return [{
        id: 'static-hero-slide',
        title: data.headline || data.title || data.heading || 'Stories That Matter in Startups, Technology & Capital',
        excerpt: data.subheadline || data.subtitle || data.description || 'Unfiltered founder playbooks, deep tech breakthroughs, and market movements.',
        category: data.badge || data.category || 'HEADLINE STORIES',
        image: data.bgImage || data.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
        author: 'Editorial Bureau',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        date: 'Today',
        readTime: '3 min read',
        primaryBtnText: data.primaryBtnText || data.buttonText || 'Read More',
        link: data.primaryBtnUrl || data.buttonUrl || '/latest',
        isCustom: true
      }];
    }

    // Mode C: Dynamic Editorial Feed
    let sourcePool = pool;
    if (data.category && data.category.trim()) {
      const cat = data.category.toLowerCase().trim();
      const filtered = pool.filter(s => (s.category || s.categoryLabel || '').toLowerCase().includes(cat));
      if (filtered.length > 0) sourcePool = filtered;
    }

    const maxSlides = data.slideLimit || 5;
    const featured = sourcePool.filter(s => 
      s.isFeatured || s.tag === 'FEATURED' || s.tag === 'BREAKING' || s.isLead || s.tag === 'TOP PICK'
    );
    if (featured.length >= 3) return featured.slice(0, maxSlides);
    const combined = [...featured, ...sourcePool.filter(s => !featured.some(f => getStoryId(f) === getStoryId(s)))];
    return combined.slice(0, maxSlides);
  }, [pool, heroConfig]);

  // 2. Curated & Dynamic Popular Posts (Top 5 stories)
  const popularPosts = useMemo(() => {
    const data = heroConfig?.data || {};

    // Mode A: Curated Popular Articles selected by Admin
    if (Array.isArray(data.popularArticles) && data.popularArticles.length > 0) {
      const livePopular = data.popularArticles.filter(item => {
        if (!item) return false;
        if (item.isCustom || !item.articleId) return true;
        const id = String(item._id || item.id || item.articleId || item.slug);
        return pool.some(p => String(p._id || p.id || p.slug) === id || p.title === item.title);
      });
      if (livePopular.length > 0) return livePopular.slice(0, 5);
    }

    // Mode B: Dynamic Trending fallback
    const currentHero = heroSlides[currentSlide] || heroSlides[0];
    const heroId = getStoryId(currentHero);

    const trending = pool.filter(s => 
      (s.isTrending || s.trending || s.tag === 'POPULAR' || s.tag === 'TRENDING') &&
      getStoryId(s) !== heroId
    );
    if (trending.length >= 5) return trending.slice(0, 5);
    const remaining = pool.filter(s => 
      getStoryId(s) !== heroId && !trending.some(t => getStoryId(t) === getStoryId(s))
    );
    return [...trending, ...remaining].slice(0, 5);
  }, [pool, heroSlides, currentSlide, heroConfig]);

  // 3. Dynamic Latest from the Blog
  const latestBlogs = useMemo(() => {
    const heroIds = new Set(heroSlides.map(s => getStoryId(s)));
    const nonHero = pool.filter(s => !heroIds.has(getStoryId(s)));
    const sorted = [...nonHero].sort((a, b) => new Date(b.publishedAt || b.date || b.createdAt || 0) - new Date(a.publishedAt || a.date || a.createdAt || 0));
    return sorted;
  }, [pool, heroSlides]);

  // 4. Dynamic Trending Now Stories
  const trendingStories = useMemo(() => {
    const heroIds = new Set(heroSlides.map(s => getStoryId(s)));
    const trending = pool.filter(s => 
      !heroIds.has(getStoryId(s)) && 
      (s.isTrending || s.trending || s.tag === 'TRENDING' || s.tag === 'POPULAR' || s.tag === 'VIRAL')
    );
    const backup = [...SPOTLIGHT_STORIES, ...TOP_PICKS, ...pool];
    const combined = [...trending];
    for (const b of backup) {
      if (combined.length >= 10) break;
      if (!combined.some(c => getStoryId(c) === getStoryId(b)) && !heroIds.has(getStoryId(b))) {
        combined.push(b);
      }
    }
    return combined.slice(0, 10);
  }, [pool, heroSlides]);

  // 5. Dynamic Most Popular & Editor's Choice Stories
  const popularStories = useMemo(() => {
    const heroIds = new Set(heroSlides.map(s => getStoryId(s)));
    const picks = pool.filter(s => 
      !heroIds.has(getStoryId(s)) && 
      (s.isFeatured || s.tag === 'TOP PICK' || s.tag === 'FEATURED' || s.tag === 'EDITOR' || s.isLead)
    );
    const backup = [...TOP_PICKS, ...CAPTABLE_STORIES, ...pool];
    const combined = [...picks];
    for (const b of backup) {
      if (combined.length >= 10) break;
      if (!combined.some(c => getStoryId(c) === getStoryId(b)) && !heroIds.has(getStoryId(b))) {
        combined.push(b);
      }
    }
    return combined.slice(0, 10);
  }, [pool, heroSlides]);

  // 6. Dynamic Tech & Startup Spotlight Stories
  const spotlightStories = useMemo(() => {
    const heroIds = new Set(heroSlides.map(s => getStoryId(s)));
    const tech = pool.filter(s => {
      const cat = (s.category || s.categoryLabel || '').toLowerCase();
      return !heroIds.has(getStoryId(s)) && (cat.includes('tech') || cat.includes('ai') || cat.includes('startup') || cat.includes('enterprise'));
    });
    const backup = [...FOUNDER_FIRST_STORIES, ...CAPTABLE_STORIES, ...pool];
    const combined = [...tech];
    for (const b of backup) {
      if (combined.length >= 10) break;
      if (!combined.some(c => getStoryId(c) === getStoryId(b)) && !heroIds.has(getStoryId(b))) {
        combined.push(b);
      }
    }
    return combined.slice(0, 10);
  }, [pool, heroSlides]);

  // Helper to filter articles by category or pinned list
  const getSectionArticles = (sec, defaultArticles) => {
    const isSpotlight = sec?.id === 'spotlight' || sec?.type === 'spotlight';
    const isTrending = sec?.id === 'trending' || sec?.type === 'trending';
    const defaultLimit = (isSpotlight || isTrending) ? 8 : 4;
    const rawLimit = Number(sec?.data?.limit || sec?.limit);
    const limit = (isSpotlight || isTrending) ? 8 : (rawLimit > 0 ? rawLimit : defaultLimit);
    if (sec?.data?.articles && Array.isArray(sec.data.articles) && sec.data.articles.length > 0) {
      return sec.data.articles.slice(0, limit);
    }
    if (sec?.articles && Array.isArray(sec.articles) && sec.articles.length > 0) {
      return sec.articles.slice(0, limit);
    }
    if (sec?.data?.articleIds && Array.isArray(sec.data.articleIds) && sec.data.articleIds.length > 0) {
      const ids = new Set(sec.data.articleIds.map(a => String(typeof a === 'object' ? a._id || a.id : a)));
      const matched = pool.filter(s => ids.has(String(s._id || s.id || s.slug)));
      if (matched.length > 0) return matched.slice(0, limit);
    }
    const filterCat = sec?.data?.category || sec?.data?.filterCategory || sec?.filterCategory;
    if (filterCat && filterCat.trim()) {
      const cat = filterCat.toLowerCase().trim();
      const filtered = pool.filter(s => {
        const c = (s.category || s.categoryLabel || '').toLowerCase();
        return c.includes(cat);
      });
      if (filtered.length > 0) return filtered.slice(0, limit);
    }
    return defaultArticles.slice(0, limit);
  };

  // Auto rotate hero slide based on heroConfig
  useEffect(() => {
    const data = heroConfig?.data || {};
    if (heroSlides.length <= 1) return;
    const intervalSec = data.autoPlayInterval !== undefined ? Number(data.autoPlayInterval) : 7;
    if (intervalSec <= 0) return; // 0 disables autoplay
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [heroSlides.length, heroConfig]);

  const activeSlide = heroSlides[currentSlide] || heroSlides[0] || LEAD_STORY;

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      if (onShowToast) onShowToast('Please enter a valid email address.');
      return;
    }
    setNewsletterLoading(true);
    try {
      await NewsletterService.subscribe({
        email: newsletterEmail.trim(),
        frequency: 'daily',
        source: 'homepage_banner'
      });
      setNewsletterSubscribed(true);
      if (onShowToast) onShowToast('Subscribed successfully! Welcome to GoReadPost.');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Subscription failed. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleToggleLike = (blog, e) => {
    if (e) e.stopPropagation();
    const blogId = getStoryId(blog);
    const wasLiked = Boolean(likedStories[blogId]);
    const newLiked = !wasLiked;

    const updated = { ...likedStories, [blogId]: newLiked };
    setLikedStories(updated);
    try {
      localStorage.setItem('grp_liked_stories', JSON.stringify(updated));
    } catch (err) {}

    if (onClapStory) {
      onClapStory(blog.id || blog._id || blogId);
    }
    if (onShowToast) {
      onShowToast(newLiked ? 'Liked story!' : 'Removed like');
    }
  };

  const getStoryLikesCount = (blog) => {
    const blogId = getStoryId(blog);
    const baseLikes = typeof blog?.claps === 'number' ? blog.claps : 
                      (typeof blog?.likes === 'number' ? blog.likes : 
                      (typeof blog?.likes === 'string' ? parseInt(blog.likes) || 0 : 0));
    const isLiked = Boolean(likedStories[blogId]);
    return baseLikes + (isLiked ? 1 : 0);
  };

  const renderStoryCard = (blog, idx, badgeNode = null) => {
    const blogId = getStoryId(blog, idx);
    const blogImg = getStoryImage(blog);
    const blogTitle = getStoryTitle(blog);
    const blogExcerpt = getStoryExcerpt(blog);
    const blogCat = getStoryCategory(blog);
    const blogAuthor = getStoryAuthor(blog);
    const blogAvatar = getStoryAvatar(blog);
    const blogDate = getStoryDate(blog);
    const blogReadTime = getStoryReadTime(blog);
    const isCardSaved = isSaved ? Boolean(isSaved(blog.id || blog._id || blog.slug)) : false;
    const isCardLiked = Boolean(likedStories[blogId]);
    const likesCount = getStoryLikesCount(blog);

    return (
      <article key={blogId} className="mhp-blog-card">
        <div 
          className="mhp-blog-thumb-wrap"
          onClick={() => onSelectStory && onSelectStory(blog)}
        >
          <img 
            src={blogImg} 
            alt={blogTitle} 
            className="mhp-blog-thumb"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80';
            }}
            loading="lazy"
          />
          <span className="mhp-blog-category-on-image">
            {blogCat}
          </span>
          <button 
            type="button" 
            className={`mhp-card-save-btn ${isCardSaved ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSave) onToggleSave(blog);
            }}
            title={isCardSaved ? 'Remove from saved bookmarks' : 'Save story'}
            aria-label="Save story"
          >
            <Bookmark size={15} fill={isCardSaved ? '#ffffff' : 'none'} color="#ffffff" />
          </button>
          {badgeNode}
        </div>
        <div className="mhp-blog-body">
          <div className="mhp-blog-author-row">
            <img 
              src={blogAvatar} 
              alt={blogAuthor} 
              className="mhp-blog-author-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
              }}
            />
            <span className="mhp-blog-author-name">{blogAuthor}</span>
            <span className="mhp-meta-sep">•</span>
            <span className="mhp-blog-date">{blogDate}</span>
          </div>

          <h3 
            className="mhp-blog-card-title"
            onClick={() => onSelectStory && onSelectStory(blog)}
          >
            {blogTitle}
          </h3>

          <div className="mhp-blog-footer-row">
            <button 
              type="button" 
              className="mhp-blog-readmore-btn"
              onClick={() => onSelectStory && onSelectStory(blog)}
              aria-label={`Read more about ${blogTitle}`}
            >
              <span>READ MORE</span>
              <ArrowRight size={13} className="readmore-arrow" />
            </button>
            <div className="mhp-blog-footer-actions">
              <button 
                type="button" 
                className={`mhp-blog-footer-like-btn ${isCardLiked ? 'active' : ''}`}
                onClick={(e) => handleToggleLike(blog, e)}
                title={isCardLiked ? 'Unlike story' : 'Like story'}
                aria-label="Like story"
              >
                <Heart 
                  size={14} 
                  className="mhp-like-icon"
                  fill={isCardLiked ? '#ef4444' : 'none'} 
                  color={isCardLiked ? '#ef4444' : 'currentColor'} 
                />
                {likesCount > 0 && <span className="mhp-like-count">{likesCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };  // Section 1: Hero & Popular Posts (Self-contained for independent multi-hero editing & rotation)
  const HeroPopularSectionItem = ({ sec }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const data = sec?.data || {};
    const showPopular = data.showPopular !== false;
    const popularTitle = data.popularTitle || sec?.subtitle || sec?.customConfig?.popularTitle || "Popular Posts";
    const viewAllText = data.viewAllText || sec?.customConfig?.viewAllText || "View All";
    const viewAllUrl = data.viewAllUrl || sec?.customConfig?.viewAllUrl || "/trending";
    const popularLimit = Number(data.popularLimit) || 5;

    // Resolve slides specifically for THIS section
    const slides = useMemo(() => {
      // Mode A: Custom Admin Curated Slides
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        const liveSlides = data.slides.filter(s => {
          if (!s) return false;
          if (s.isCustom || !s.articleId) return true;
          const id = String(s.articleId || s.id || s._id || s.slug);
          return pool.some(p => String(p._id || p.id || p.slug) === id || p.title === s.title);
        });
        const slidesToUse = liveSlides.length > 0 ? liveSlides : data.slides;
        return slidesToUse.map((s, idx) => ({
          id: s.id || s._id || `custom-slide-${idx}`,
          title: s.title || data.headline || 'Featured Story',
          excerpt: s.excerpt || s.description || s.summary || data.subheadline || '',
          category: s.category || s.categoryLabel || data.badge || 'FEATURED',
          image: s.image || s.coverImage || data.bgImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
          author: typeof s.author === 'object' ? s.author?.name : (s.author || 'Editorial Bureau'),
          authorAvatar: s.authorAvatar || s.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          date: s.date || s.publishedAt || 'Today',
          readTime: s.readTime || '4 min read',
          primaryBtnText: s.primaryBtnText || data.primaryBtnText || 'Read More',
          link: s.link || s.primaryBtnUrl || data.primaryBtnUrl || (s.slug ? `/stories/${s.slug}` : `/stories/${s.id || s._id}`) || '/latest',
          isCustom: true
        }));
      }

      // Mode B: Static Headline Banner or explicit headline / image
      if (data.heroSource === 'static' || data.headline || data.bgImage) {
        return [{
          id: `static-hero-slide-${sec.id || 'main'}`,
          title: data.headline || data.title || data.heading || 'Stories That Matter in Startups, Technology & Capital',
          excerpt: data.subheadline || data.subtitle || data.description || 'Unfiltered founder playbooks, deep tech breakthroughs, and market movements.',
          category: data.badge || data.category || 'HEADLINE STORIES',
          image: data.bgImage || data.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
          author: 'Editorial Bureau',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          date: 'Today',
          readTime: '3 min read',
          primaryBtnText: data.primaryBtnText || data.buttonText || 'Read More',
          link: data.primaryBtnUrl || data.buttonUrl || '/latest',
          isCustom: true
        }];
      }

      // Mode C: Dynamic Editorial Feed
      let sourcePool = pool;
      if (data.category && data.category.trim()) {
        const cat = data.category.toLowerCase().trim();
        const filtered = pool.filter(s => (s.category || s.categoryLabel || '').toLowerCase().includes(cat));
        if (filtered.length > 0) sourcePool = filtered;
      }

      const maxSlides = data.slideLimit || 5;
      const featured = sourcePool.filter(s => 
        s.isFeatured || s.tag === 'FEATURED' || s.tag === 'BREAKING' || s.isLead || s.tag === 'TOP PICK'
      );
      if (featured.length >= 3) return featured.slice(0, maxSlides);
      const combined = [...featured, ...sourcePool.filter(s => !featured.some(f => getStoryId(f) === getStoryId(s)))];
      return combined.slice(0, maxSlides);
    }, [data, sec.id]);

    // Autoplay rotation for this specific hero section
    useEffect(() => {
      if (slides.length <= 1) return;
      const intervalSec = data.autoPlayInterval !== undefined ? Number(data.autoPlayInterval) : 7;
      if (intervalSec <= 0) return;
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, intervalSec * 1000);
      return () => clearInterval(timer);
    }, [slides.length, data.autoPlayInterval]);

    const activeSlide = slides[currentSlide] || slides[0] || LEAD_STORY;

    const handlePrevSlide = () => {
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    };

    const handleNextSlide = () => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    };

    // Popular posts resolved for THIS specific hero section
    const displayedPopular = useMemo(() => {
      if (!showPopular) return [];
      if (Array.isArray(data.popularArticles) && data.popularArticles.length > 0) {
        const livePopular = data.popularArticles.filter(item => {
          if (!item) return false;
          if (item.isCustom || !item.articleId) return true;
          const id = String(item.articleId || item._id || item.id || item.slug);
          return pool.some(p => String(p._id || p.id || p.slug) === id || p.title === item.title);
        });
        if (livePopular.length > 0) return livePopular.slice(0, popularLimit);
      }

      const heroId = getStoryId(activeSlide);
      const trending = pool.filter(s => 
        (s.isTrending || s.trending || s.tag === 'POPULAR' || s.tag === 'TRENDING') &&
        getStoryId(s) !== heroId
      );
      if (trending.length >= popularLimit) return trending.slice(0, popularLimit);
      const remaining = pool.filter(s => 
        getStoryId(s) !== heroId && !trending.some(t => getStoryId(t) === getStoryId(s))
      );
      return [...trending, ...remaining].slice(0, popularLimit);
    }, [data.popularArticles, showPopular, popularLimit, activeSlide]);

    const currentHeroImage = activeSlide.image || activeSlide.bgImage || getStoryImage(activeSlide) || data.bgImage || data.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80';
    const currentHeroTitle = (typeof activeSlide.title === 'string' ? activeSlide.title : '') || (typeof activeSlide.headline === 'string' ? activeSlide.headline : '') || getStoryTitle(activeSlide) || data.headline || data.title || data.heading || 'Featured Story';
    const currentHeroExcerpt = (typeof activeSlide.excerpt === 'string' ? activeSlide.excerpt : '') || (typeof activeSlide.description === 'string' ? activeSlide.description : '') || (typeof activeSlide.subheadline === 'string' ? activeSlide.subheadline : '') || getStoryExcerpt(activeSlide) || data.subheadline || '';
    const currentHeroCategory = (typeof activeSlide.category === 'string' ? activeSlide.category : '') || (typeof activeSlide.badge === 'string' ? activeSlide.badge : '') || getStoryCategory(activeSlide) || data.badge || 'HEADLINE';
    const currentHeroAuthor = getStoryAuthor(activeSlide);
    const currentHeroAvatar = activeSlide.authorAvatar || activeSlide.avatar || getStoryAvatar(activeSlide) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
    const currentHeroDate = getStoryDate(activeSlide);
    const currentHeroReadTime = getStoryReadTime(activeSlide);
    const currentHeroBtnText = activeSlide.primaryBtnText || data.primaryBtnText || data.buttonText || 'Read More';
    const currentHeroBtnUrl = activeSlide.link || activeSlide.primaryBtnUrl || data.primaryBtnUrl || data.buttonUrl;

    const handleHeroAction = (e) => {
      e?.stopPropagation();
      if (currentHeroBtnUrl) {
        if (currentHeroBtnUrl.startsWith('http')) {
          window.open(currentHeroBtnUrl, '_blank');
          return;
        }
        window.history.pushState(null, '', currentHeroBtnUrl);
        window.dispatchEvent(new Event('popstate'));
        if (onCategoryClick && currentHeroBtnUrl.startsWith('/category/')) {
          onCategoryClick(currentHeroBtnUrl.replace('/category/', ''));
        }
        return;
      }
      if (onSelectStory) onSelectStory(activeSlide);
    };

    return (
      <section key={sec.id || "sec-hero-popular"} className={`mhp-hero-popular-grid ${!showPopular ? 'full-width' : ''}`}>
        <div 
          className="mhp-hero-card"
          style={{ backgroundImage: `url(${currentHeroImage})` }}
        >
          <div className="mhp-hero-overlay" />
          <div className="mhp-hero-content">
            {data.badge && data.badge !== currentHeroCategory && (
              <span 
                style={{ 
                  display: 'inline-block', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase', 
                  color: '#fbbf24', 
                  marginBottom: '0.5rem' 
                }}
              >
                {data.badge}
              </span>
            )}
            <h1 
              className="mhp-hero-title"
              onClick={handleHeroAction}
              title={currentHeroTitle}
            >
              {currentHeroTitle}
            </h1>
            <div className="mhp-author-meta">
              <img 
                src={currentHeroAvatar} 
                alt={currentHeroAuthor} 
                className="mhp-author-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                }}
              />
              <span style={{ fontWeight: 700 }}>{currentHeroAuthor}</span>
              <span className="mhp-meta-sep">•</span>
              <span>{currentHeroDate}</span>
              <span className="mhp-meta-sep">•</span>
              <span>{currentHeroReadTime}</span>
            </div>
            <div className="mhp-hero-bottom-actions">
              <button 
                type="button"
                className="mhp-hero-read-btn"
                onClick={handleHeroAction}
              >
                <span>{currentHeroBtnText}</span>
                <ArrowRight size={15} />
              </button>
              {data.secondaryBtnText && (
                <button 
                  type="button"
                  className="mhp-hero-read-btn"
                  style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', backdropFilter: 'blur(8px)' }}
                  onClick={() => {
                    const url = data.secondaryBtnUrl || '/about';
                    if (url.startsWith('http')) window.open(url, '_blank');
                    else {
                      window.history.pushState(null, '', url);
                      window.dispatchEvent(new Event('popstate'));
                    }
                  }}
                >
                  <span>{data.secondaryBtnText}</span>
                </button>
              )}
              {activeSlide && !activeSlide.isCustom && (
                <button 
                  type="button"
                  className={`mhp-hero-save-btn ${isSaved && isSaved(activeSlide?.id || activeSlide?._id || activeSlide?.slug) ? 'active' : ''}`}
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
              )}
              <span 
                className="mhp-category-tag"
                onClick={(e) => {
                  e.stopPropagation();
                  const catSlug = (currentHeroCategory || 'technology').toLowerCase().replace(/\s+/g, '-');
                  window.history.pushState(null, '', `/category/${catSlug}`);
                  window.dispatchEvent(new Event('popstate'));
                  if (onCategoryClick) onCategoryClick(catSlug);
                }}
                style={{ cursor: 'pointer' }}
              >
                {currentHeroCategory}
              </span>
            </div>
          </div>

          {slides.length > 1 && (
            <div className="mhp-slider-nav">
              <div className="mhp-slider-dots">
                {slides.map((_, idx) => (
                  <span 
                    key={idx}
                    className={`mhp-slider-dot ${idx === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
              <button 
                className="mhp-slider-btn" 
                onClick={handlePrevSlide}
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="mhp-slider-btn" 
                onClick={handleNextSlide}
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {showPopular && (
          <div className="mhp-popular-card">
            <div className="mhp-section-header">
              <div className="mhp-section-title-wrap">
                <span>{popularTitle}</span>
              </div>
              <span 
                className="mhp-view-all-link"
                onClick={() => {
                  window.history.pushState(null, '', viewAllUrl);
                  window.dispatchEvent(new Event('popstate'));
                  if (onCategoryClick) onCategoryClick(viewAllUrl.replace(/^\//, ''));
                }}
              >
                {viewAllText} <ArrowRight size={16} />
              </span>
            </div>

            <div className="mhp-popular-list">
              {displayedPopular.map((item, idx) => {
                const itemImg = getStoryImage(item);
                const itemTitle = getStoryTitle(item);
                const itemReadTime = getStoryReadTime(item);
                const itemId = getStoryId(item, idx);
                const isPopularSaved = isSaved ? Boolean(isSaved(item.id || item._id || item.slug)) : false;

                return (
                  <div 
                    key={itemId} 
                    className="mhp-popular-item"
                    onClick={() => onSelectStory && onSelectStory(item)}
                  >
                    <div className="mhp-popular-rank">
                      {idx + 1}
                    </div>
                    <img 
                      src={itemImg} 
                      alt={itemTitle} 
                      className="mhp-popular-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80';
                      }}
                      loading="lazy"
                    />
                    <div className="mhp-popular-info">
                      <h4 className="mhp-popular-title">
                        {itemTitle}
                      </h4>
                      <span className="mhp-popular-meta">
                        {itemReadTime}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className={`mhp-popular-save-btn ${isPopularSaved ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSave) onToggleSave(item);
                      }}
                      title={isPopularSaved ? "Remove from reading list" : "Save to read later"}
                      aria-label="Save story"
                    >
                      <Bookmark size={15} fill={isPopularSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderHeroPopularSection = (sec) => {
    return <HeroPopularSectionItem key={sec.id || 'hero'} sec={sec} />;
  };

  // Section 2: Latest from the Blog
  const renderLatestBlogsSection = (sec) => {
    const title = sec?.data?.title || sec?.data?.heading || sec?.title || "Latest from the Blog";
    const subtitle = sec?.data?.subtitle || sec?.data?.subheading || sec?.subtitle;
    const viewAllText = sec?.data?.viewAllText || sec?.customConfig?.viewAllText || "View All Articles";
    const viewAllUrl = sec?.data?.viewAllUrl || sec?.customConfig?.viewAllUrl || "/latest";
    const articles = getSectionArticles(sec, latestBlogs);

    return (
      <section key={sec.id || "sec-latest-blogs"} className="mhp-latest-section">
        <div className="mhp-section-header">
          <div className="mhp-section-header-left">
            <div className="mhp-section-title-wrap">
              <span>{title}</span>
            </div>
          </div>
          <span 
            className="mhp-view-all-link"
            onClick={() => {
              window.history.pushState(null, '', viewAllUrl);
              window.dispatchEvent(new Event('popstate'));
              if (onCategoryClick) onCategoryClick(viewAllUrl.replace(/^\//, ''));
            }}
          >
            {viewAllText} <ArrowRight size={14} />
          </span>
        </div>

        <div className="mhp-blog-cards-grid">
          {articles.map((blog, idx) => renderStoryCard(blog, idx))}
        </div>
      </section>
    );
  };

  // Section 3: Trending Now
  const renderTrendingSection = (sec) => {
    const title = sec?.data?.title || sec?.data?.heading || sec?.title || "Trending Now";
    const viewAllText = sec?.data?.viewAllText || sec?.customConfig?.viewAllText || "View All Trending";
    const viewAllUrl = sec?.data?.viewAllUrl || sec?.customConfig?.viewAllUrl || "/trending";
    const articles = getSectionArticles(sec, trendingStories);

    return (
      <section key={sec.id || "sec-trending"} className="mhp-content-section">
        <div className="mhp-section-header">
          <div className="mhp-section-header-left">
            <div className="mhp-section-title-wrap">
              <span>{title}</span>
            </div>
          </div>
          <span 
            className="mhp-view-all-link"
            onClick={() => {
              window.history.pushState(null, '', viewAllUrl);
              window.dispatchEvent(new Event('popstate'));
              if (onCategoryClick) onCategoryClick(viewAllUrl.replace(/^\//, ''));
            }}
          >
            {viewAllText} <ArrowRight size={14} />
          </span>
        </div>

        <div className="mhp-blog-cards-grid">
          {articles.map((blog, idx) => renderStoryCard(blog, idx))}
        </div>
      </section>
    );
  };

  // Section 4: Most Popular & Editor's Picks
  const renderPopularEditorsSection = (sec) => {
    const title = sec?.data?.title || sec?.data?.heading || sec?.title || "Most Popular & Editor's Picks";
    const viewAllText = sec?.data?.viewAllText || sec?.customConfig?.viewAllText || "Explore Popular";
    const viewAllUrl = sec?.data?.viewAllUrl || sec?.customConfig?.viewAllUrl || "/category/startups";
    const badgeText = sec?.data?.badgeText || sec?.customConfig?.badgeText || "Editor's Choice";
    const articles = getSectionArticles(sec, popularStories);

    return (
      <section key={sec.id || "sec-popular-editors"} className="mhp-content-section">
        <div className="mhp-section-header">
          <div className="mhp-section-header-left">
            <div className="mhp-section-title-wrap">
              <span>{title}</span>
            </div>
          </div>
          <span 
            className="mhp-view-all-link"
            onClick={() => {
              window.history.pushState(null, '', viewAllUrl);
              window.dispatchEvent(new Event('popstate'));
              if (onCategoryClick) onCategoryClick(viewAllUrl.replace(/^\//, ''));
            }}
          >
            {viewAllText} <ArrowRight size={14} />
          </span>
        </div>

        <div className="mhp-blog-cards-grid">
          {articles.map((blog, idx) => 
            renderStoryCard(
              blog, 
              idx, 
              <span className="mhp-editor-pick-pill">
                <Sparkles size={12} fill="#ffffff" color="#ffffff" />
                {badgeText}
              </span>
            )
          )}
        </div>
      </section>
    );
  };

  // Section 5: Tech & Startup Spotlight
  const renderSpotlightSection = (sec) => {
    const title = sec?.data?.title || sec?.data?.heading || sec?.title || "Tech & Startup Spotlight";
    const viewAllText = sec?.data?.viewAllText || sec?.customConfig?.viewAllText || "Explore Startups";
    const viewAllUrl = sec?.data?.viewAllUrl || sec?.customConfig?.viewAllUrl || "/category/technology";
    const badgeText = sec?.data?.badgeText || sec?.customConfig?.badgeText || "Spotlight";
    const articles = getSectionArticles(sec, spotlightStories);

    return (
      <section key={sec.id || "sec-spotlight"} className="mhp-content-section">
        <div className="mhp-section-header">
          <div className="mhp-section-header-left">
            <div className="mhp-section-title-wrap">
              <span>{title}</span>
            </div>
          </div>
          <span 
            className="mhp-view-all-link"
            onClick={() => {
              window.history.pushState(null, '', viewAllUrl);
              window.dispatchEvent(new Event('popstate'));
              if (onCategoryClick) onCategoryClick(viewAllUrl.replace(/^\//, ''));
            }}
          >
            {viewAllText} <ArrowRight size={14} />
          </span>
        </div>

        <div className="mhp-blog-cards-grid">
          {articles.map((blog, idx) => 
            renderStoryCard(blog, idx)
          )}
        </div>
      </section>
    );
  };

  // Section 6: Newsletter Banner
  const renderNewsletterSection = (sec) => {
    const headline = sec?.data?.headline || sec?.data?.title || sec?.customConfig?.headline || sec?.title || "Get the Latest Blogs Delivered to Your Inbox";
    const buttonText = sec?.data?.buttonText || sec?.customConfig?.buttonText || "Subscribe";
    const placeholder = sec?.data?.placeholder || "Enter your email address";

    return (
      <section key={sec.id || "sec-newsletter"} className="mhp-newsletter-section">
        <div className="mhp-newsletter-card">
          <div className="mhp-newsletter-left">
            <div className="mhp-newsletter-icon-wrap">
              <Mail size={30} />
            </div>
            <div>
              <h2 className="mhp-newsletter-title">
                {headline}
              </h2>
            </div>
          </div>

          {newsletterSubscribed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700 }}>
              <CheckCircle2 size={20} />
              <span>You're subscribed! Welcome to GoReadPost.</span>
            </div>
          ) : (
            <form className="mhp-newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                required
                placeholder={placeholder}
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="mhp-newsletter-input"
              />
              <button 
                type="submit" 
                disabled={newsletterLoading}
                className="mhp-newsletter-btn"
              >
                {newsletterLoading ? 'Subscribing...' : buttonText}
              </button>
            </form>
          )}
        </div>
      </section>
    );
  };

  // Section: Category Specific Desk
  const renderCategorySection = (sec) => {
    const typeStr = (sec?.type || sec?.sectionKey || sec?.id || '').toLowerCase();
    let rawCat = sec?.data?.category || '';
    if (!rawCat) {
      if (typeStr.includes('startup')) rawCat = 'Startups';
      else if (typeStr.includes('tech')) rawCat = 'Technology';
      else if (typeStr.includes('ai')) rawCat = 'AI';
      else if (typeStr.includes('fintech')) rawCat = 'FinTech';
      else if (typeStr.includes('enterprise')) rawCat = 'Enterprise';
      else if (typeStr.includes('herstory')) rawCat = 'HerStory';
      else if (typeStr.includes('smbstory')) rawCat = 'SMBStory';
      else if (typeStr.includes('socialstory')) rawCat = 'SocialStory';
      else if (typeStr.includes('hindi')) rawCat = 'Hindi';
      else rawCat = typeStr.replace(/^category_/, '');
    }

    const title = sec?.data?.title || sec?.data?.heading || `${rawCat} Newsroom Desk`;
    const subtitle = sec?.data?.subtitle || `Latest stories and reporting from the ${rawCat} desk`;
    const viewAllUrl = sec?.data?.viewAllUrl || `/category/${rawCat.toLowerCase().replace(/\s+/g, '-')}`;
    const viewAllText = sec?.data?.viewAllText || `Explore ${rawCat}`;
    const categoryArticles = pool.filter(s => {
      const c = (s.category || s.categoryLabel || s.categoryName || '').toLowerCase();
      return c.includes(rawCat.toLowerCase());
    });
    const articles = getSectionArticles(sec, categoryArticles.length > 0 ? categoryArticles : pool);

    return (
      <section key={sec.id || `sec-cat-${rawCat}`} className="mhp-content-section">
        <div className="mhp-section-header">
          <div className="mhp-section-header-left">
            <div className="mhp-section-title-wrap">
              <span>{title}</span>
            </div>
            {subtitle && <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>{subtitle}</p>}
          </div>
          <span 
            className="mhp-view-all-link"
            onClick={() => {
              window.history.pushState(null, '', viewAllUrl);
              window.dispatchEvent(new Event('popstate'));
              if (onCategoryClick) onCategoryClick(viewAllUrl.replace(/^\//, ''));
            }}
          >
            {viewAllText} <ArrowRight size={14} />
          </span>
        </div>

        <div className="mhp-blog-cards-grid">
          {articles.map((blog, idx) => renderStoryCard(blog, idx))}
        </div>
      </section>
    );
  };

  return (
    <div className="mhp-container">
      {activeSections.map((sec, idx) => {
        const type = (sec.type || sec.sectionKey || sec.id || 'stories_feed').toLowerCase();
        const key = sec.id || `sec-${idx}`;

        switch (type) {
          case 'hero_popular':
          case 'hero':
            return <React.Fragment key={key}>{renderHeroPopularSection(sec)}</React.Fragment>;
          case 'stories_feed':
          case 'latest_blogs':
          case 'latest':
            return <React.Fragment key={key}>{renderLatestBlogsSection(sec)}</React.Fragment>;
          case 'trending':
            return <React.Fragment key={key}>{renderTrendingSection(sec)}</React.Fragment>;
          case 'popular_editors':
          case 'business':
            return <React.Fragment key={key}>{renderPopularEditorsSection(sec)}</React.Fragment>;
          case 'spotlight':
          case 'technology':
          case 'ai':
          case 'reports':
            return <React.Fragment key={key}>{renderSpotlightSection(sec)}</React.Fragment>;
          case 'newsletter':
            return <React.Fragment key={key}>{renderNewsletterSection(sec)}</React.Fragment>;
          case 'video_section':
          case 'video':
          case 'videos':
            return <VideoSection key={key} onSelectVideo={onSelectStory} isSaved={isSaved} onToggleSave={onToggleSave} />;
          case 'video_shows':
          case 'conversations':
            return <ConversationsSection key={key} />;
          case 'about':
            return <AboutSection key={key} />;
          case 'contact':
            return <DynamicContact key={key} data={sec.data || {}} />;
          case 'advertise':
            return (
              <DynamicCTA 
                key={key} 
                data={{
                  title: sec.data?.title || 'Advertise & Partner with GoReadPost',
                  description: sec.data?.subtitle || 'Reach over 500,000 monthly founders, enterprise leaders, and investors.',
                  primaryBtnText: sec.data?.primaryBtnText || 'Download Media Kit',
                  primaryBtnUrl: sec.data?.primaryBtnUrl || '/advertise',
                  secondaryBtnText: sec.data?.secondaryBtnText || 'Contact Partnerships',
                  secondaryBtnUrl: sec.data?.secondaryBtnUrl || '/contact'
                }} 
              />
            );
          case 'category_startups':
          case 'category_technology':
          case 'category_ai':
          case 'category_fintech':
          case 'category_enterprise':
          case 'category_herstory':
          case 'category_smbstory':
          case 'category_socialstory':
          case 'category_hindi':
            return <React.Fragment key={key}>{renderCategorySection(sec)}</React.Fragment>;
          case 'text':
            return <DynamicText key={key} data={sec.data || {}} />;
          case 'image_text':
            return <DynamicImageText key={key} data={sec.data || {}} />;
          case 'features':
            return <DynamicFeatures key={key} data={sec.data || {}} />;
          case 'stats':
            return <DynamicStats key={key} data={sec.data || {}} />;
          case 'brands':
            return <DynamicBrands key={key} data={sec.data || {}} />;
          case 'cta':
            return <DynamicCTA key={key} data={sec.data || {}} />;
          case 'services':
            return <DynamicServices key={key} data={sec.data || {}} />;
          case 'portfolio':
            return <DynamicPortfolio key={key} data={sec.data || {}} />;
          case 'testimonials':
            return <DynamicTestimonials key={key} data={sec.data || {}} />;
          case 'faq':
            return <DynamicFAQ key={key} data={sec.data || {}} />;
          default:
            if (type.startsWith('category_')) {
              return <React.Fragment key={key}>{renderCategorySection(sec)}</React.Fragment>;
            }
            return <React.Fragment key={key}>{renderLatestBlogsSection(sec)}</React.Fragment>;
        }
      })}

      {/* ── Floating Admin Whole Homepage Studio Trigger ── */}
      {isAdminUser && (
        <button
          type="button"
          className="lhs-floating-frontend-trigger"
          onClick={() => setIsLiveStudioOpen(true)}
          title="Open Whole Homepage Visual Live Studio"
        >
          <Sparkles size={16} fill="#ffffff" color="#ffffff" />
          <span>⚡ Live Edit Whole Homepage</span>
        </button>
      )}

      {/* ── WHOLE HOMEPAGE VISUAL LIVE STUDIO ── */}
      {isLiveStudioOpen && (
        <LiveHomepageStudio
          isOpen={isLiveStudioOpen}
          initialSections={homepageSections.length > 0 ? homepageSections : activeSections}
          stories={pool}
          onClose={() => setIsLiveStudioOpen(false)}
          onSaveSuccess={() => {
            if (onShowToast) onShowToast('Whole homepage layout and articles permanently saved live!');
          }}
        />
      )}
    </div>
  );
}
