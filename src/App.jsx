import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SideDrawer from './components/SideDrawer';
import ModernHomepageView from './components/ModernHomepageView';
import TopPicksSection from './components/TopPicksSection';
import HeroLeadSection from './components/HeroLeadSection';
import StoriesGrid from './components/StoriesGrid';
import ConversationsSection from './components/ConversationsSection';
import NewsletterBanner from './components/NewsletterBanner';
import FullStoryPage from './components/FullStoryPage';
import PitchModal from './components/PitchModal';
import BookmarksDrawer from './components/BookmarksDrawer';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProModal from './components/ProModal';
import JustInTagPage from './components/JustInTagPage';
import LatestArticlesPage from './components/LatestArticlesPage';
import TrendingPage from './components/TrendingPage';
import AIStoryPage from './components/AIStoryPage';
import HerStoryPage from './components/HerStoryPage';
import SocialStoryPage from './components/SocialStoryPage';
import SMBStoryPage from './components/SMBStoryPage';
import EnterpriseStoryPage from './components/EnterpriseStoryPage';
import HindiStoryPage from './components/HindiStoryPage';
import AdminLayout from './components/admin/AdminLayout';
import ArticlePage from './components/ArticlePage';
import CategoryContentPage from './components/CategoryContentPage';
import DynamicEntityPage from './components/DynamicEntityPage';
import SearchPage from './components/SearchPage';
import TechSparksPage from './components/TechSparksPage';
import FounderFirstPage from './components/FounderFirstPage';
import BrandsHubPage from './components/BrandsHubPage';
import YSTVPage from './components/YSTVPage';
import VideoSection from './components/VideoSection';
import VideosPage from './components/VideosPage';
import VideoPlayerModal from './components/VideoPlayerModal';
import ResourcesPage from './components/ResourcesPage';
import NewsletterPage from './components/NewsletterPage';
import AboutSection from './components/AboutSection';
import TopicsPage from './components/TopicsPage';
import DynamicPageRenderer from './components/DynamicPageRenderer';
import NotFoundPage from './components/NotFoundPage';
import ErrorBoundary from './components/ErrorBoundary';
import { StoryService } from './services/storyService';
import { MenuService } from './services/menuService';
import { PageService } from './services/pageService';
import { NavigationService } from './services/navigationService';
import { ArticleService } from './services/articleService';
import { HomepageService } from './services/homepageService';
import { BookmarkService } from './services/bookmarkService';
import { AuthService } from './services/authService';
import { SettingService } from './services/settingService';

import { 
  ALL_STORIES, 
  SPOTLIGHT_STORIES, 
  FOUNDER_FIRST_STORIES, 
  JUST_IN_STORIES, 
  LEADERSHIP_LENS_STORIES,
  AI_STORIES
} from './data/storiesData';
import { ALL_ENTERPRISE_STORIES } from './data/enterpriseStoryData';
import { ALL_HINDI_STORIES } from './data/hindiStoryData';
import { ALL_SMB_STORIES, SMB_STORY_PROFILES } from './data/smbStoryData';
import { ALL_HER_STORIES, HER_STORY_PROFILES } from './data/herStoryData';

import { Home, Compass, TrendingUp, Tv, Bookmark, CheckCircle, Flame, Target, Cpu, Clock, Send, X, LayoutDashboard } from 'lucide-react';

const findStoryById = (id, dynamicStories = []) => {
  if (!id) return null;
  return (
    dynamicStories.find(s => s.id === id || s._id === id || s.slug === id) ||
    (SMB_STORY_PROFILES && SMB_STORY_PROFILES[id]) ||
    (HER_STORY_PROFILES && HER_STORY_PROFILES[id]) ||
    ALL_HER_STORIES.find(s => s.id === id || s._id === id || s.slug === id) ||
    ALL_ENTERPRISE_STORIES.find(s => s.id === id || s._id === id || s.slug === id) ||
    ALL_HINDI_STORIES.find(s => s.id === id || s._id === id || s.slug === id) ||
    ALL_SMB_STORIES.find(s => s.id === id || s._id === id || s.slug === id) ||
    ALL_STORIES.find(s => s.id === id || s._id === id || s.slug === id) ||
    null
  );
};

export const parseCurrentRoute = () => {
  try {
    const pathname = window.location.pathname;
    if (pathname === '/404' || pathname === '/not-found' || pathname === '/notfound') {
      return { route: 'not-found' };
    }
    if (pathname.startsWith('/admin')) {
      return { route: 'admin' };
    }
    if (pathname === '/latest' || pathname.startsWith('/latest') || pathname === '/articles' || pathname === '/articles/' || pathname === '/latest-articles') {
      return { route: 'latest' };
    }
    if (pathname === '/just-in' || pathname.startsWith('/just-in')) {
      return { route: 'latest' };
    }
    if (pathname === '/trending' || pathname.startsWith('/trending')) {
      return { route: 'trending' };
    }
    if (pathname === '/ai-story' || pathname.startsWith('/ai-story') || pathname === '/aistory') {
      return { route: 'brand', slug: 'ai-story' };
    }
    if (pathname === '/her-story' || pathname.startsWith('/her-story') || pathname === '/herstory') {
      return { route: 'brand', slug: 'her-story' };
    }
    if (pathname === '/social-story' || pathname.startsWith('/social-story') || pathname === '/socialstory') {
      return { route: 'brand', slug: 'social-story' };
    }
    if (pathname === '/smbstory' || pathname.startsWith('/smbstory') || pathname === '/smb-story') {
      return { route: 'brand', slug: 'smbstory' };
    }
    if (pathname === '/enterprise' || pathname.startsWith('/enterprise') || pathname === '/enterprise-story' || pathname === '/enterprisestory') {
      return { route: 'brand', slug: 'enterprise' };
    }
    if (pathname === '/hindi' || pathname.startsWith('/hindi') || pathname === '/ys-hindi' || pathname === '/yshindi') {
      return { route: 'brand', slug: 'hindi' };
    }
    if (pathname === '/techsparks' || pathname.startsWith('/techsparks')) {
      return { route: 'techsparks' };
    }
    if (pathname === '/founder-first' || pathname.startsWith('/founder-first')) {
      return { route: 'founder-first' };
    }
    if (pathname === '/about' || pathname === '/about-us' || pathname.startsWith('/about')) {
      return { route: 'about' };
    }
    if (pathname === '/brands' || pathname.startsWith('/brands')) {
      return { route: 'brands' };
    }
    if (pathname === '/videos' || pathname.startsWith('/videos') || pathname === '/video' || pathname.startsWith('/video') || pathname === '/ystv' || pathname.startsWith('/ystv')) {
      return { route: 'videos' };
    }
    if (pathname === '/resources' || pathname.startsWith('/resources')) {
      return { route: 'resources' };
    }
    if (pathname === '/newsletter' || pathname.startsWith('/newsletter')) {
      return { route: 'newsletter' };
    }
    if (pathname.startsWith('/article/')) {
      const slug = pathname.replace('/article/', '').split('/')[0].split('?')[0];
      if (slug) return { route: 'article', slug };
    }
    if (pathname.startsWith('/articles/')) {
      const slug = pathname.replace('/articles/', '').split('/')[0].split('?')[0];
      if (slug) return { route: 'article', slug };
    }
    if (pathname.startsWith('/post/')) {
      const slug = pathname.replace('/post/', '').split('/')[0].split('?')[0];
      if (slug) return { route: 'article', slug };
    }
    if (pathname.startsWith('/story/')) {
      const slug = pathname.replace('/story/', '').split('/')[0].split('?')[0];
      if (slug) return { route: 'article', slug };
    }
    if (pathname === '/categories' || pathname === '/categories/' || pathname === '/category' || pathname === '/category/' || pathname === '/cotegory' || pathname === '/cotegory/') {
      return { route: 'category', slug: 'content' };
    }
    if (pathname === '/topics' || pathname === '/topics/' || pathname === '/tags' || pathname === '/tags/') {
      return { route: 'topics' };
    }
    if (pathname.startsWith('/category/') || pathname.startsWith('/cotegory/')) {
      const slug = pathname.replace(/^\/(category|cotegory)\//, '').split('/')[0].split('?')[0];
      if (slug) return { route: 'category', slug };
    }
    if (pathname.startsWith('/categories/')) {
      const slug = pathname.replace('/categories/', '').split('/')[0].split('?')[0];
      if (slug) return { route: 'category', slug };
    }
    if (pathname.startsWith('/topic/')) {
      const slug = pathname.replace('/topic/', '').split('/')[0].split('?')[0];
      if (slug) return { route: 'topic', slug };
    }
    if (pathname.startsWith('/tag/')) {
      const slug = pathname.replace('/tag/', '').split('/')[0].split('?')[0];
      if (slug === 'just in' || slug === 'just-in' || slug === 'latest') {
        return { route: 'category', slug: 'latest' };
      }
      if (slug) return { route: 'tag', slug };
    }
    if (pathname.startsWith('/author/')) {
      const slug = pathname.replace('/author/', '').split('/')[0].split('?')[0];
      if (slug) return { route: 'author', slug };
    }
    if (pathname === '/search' || pathname.startsWith('/search')) {
      const params = new URLSearchParams(window.location.search);
      return { route: 'search', q: params.get('q') || '' };
    }
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && cat !== 'all') {
      return { route: 'category', slug: cat };
    }
    const tag = params.get('tag');
    if (tag && (tag.toLowerCase() === 'just in' || tag.toLowerCase() === 'just-in' || tag.toLowerCase() === 'latest')) {
      return { route: 'category', slug: 'latest' };
    }
    const brand = params.get('brand');
    if (brand === 'techsparks') return { route: 'techsparks' };
    if (brand === 'brands') return { route: 'brands' };
    if (brand === 'ystv' || brand === 'videos' || brand === 'video') return { route: 'videos' };
    if (brand === 'resources') return { route: 'resources' };
    if (brand === 'newsletter') return { route: 'newsletter' };
    if (brand === 'ai-story' || brand === 'aistory' || brand === 'ai') return { route: 'category', slug: 'ai' };
    if (brand === 'her-story' || brand === 'herstory') return { route: 'category', slug: 'herstory' };
    if (brand === 'social-story' || brand === 'socialstory') return { route: 'category', slug: 'social-story' };
    if (brand === 'smbstory' || brand === 'smb-story' || brand === 'smb') return { route: 'category', slug: 'smbstory' };
    if (brand === 'enterprise' || brand === 'enterprisestory' || brand === 'enterprise-story') return { route: 'category', slug: 'enterprise' };
    if (brand === 'hindi' || brand === 'ys-hindi' || brand === 'yshindi') return { route: 'category', slug: 'hindi' };

    const art = params.get('article');
    if (art) return { route: 'article', slug: art };

    const cleanPath = pathname.replace(/^\//, '').split('/')[0].split('?')[0];
    if (cleanPath && !['admin', 'api', 'assets', 'favicon.ico'].includes(cleanPath)) {
      if (findStoryById(cleanPath)) {
        return { route: 'article', slug: cleanPath };
      }
      const standardCats = [
        'startups', 'startup', 'technology', 'tech', 'funding', 'fintech', 
        'deep-tech', 'deeptech', 'ai-deeptech', 'ai', 'ai-story', 
        'leadership', 'captable', 'enterprise', 'enterprisestory', 
        'herstory', 'her-story', 'smbstory', 'smb-story', 'smb', 
        'hindi', 'social-story', 'socialstory'
      ];
      if (standardCats.includes(cleanPath.toLowerCase())) {
        return { route: 'category', slug: cleanPath.toLowerCase() };
      }
      return { route: 'dynamic-page', slug: cleanPath };
    }
  } catch (e) {}
  return { route: 'home' };
};

const getArticleSlugFromUrl = () => {
  const r = parseCurrentRoute();
  return r.route === 'article' ? r.slug : null;
};

export default function App() {
  // Theme state (persisted)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('goreadpost_theme') || 'light';
  });

  // Master stories state (dynamically populated from MongoDB)
  const [stories, setStories] = useState(() => {
    try {
      localStorage.removeItem('goreadpost_stories_v2');
      localStorage.removeItem('goreadpost_stories_v3');
      localStorage.removeItem('goreadpost_dynamic_stories');
    } catch (e) {}
    return ALL_STORIES;
  });

  // Active logged-in user state
  const [currentUser, setCurrentUser] = useState(() => AuthService.getUser());

  // Bookmarked stories state (strictly scoped to logged-in users)
  const [savedStories, setSavedStories] = useState(() => {
    if (!AuthService.isAuthenticated()) return [];
    return BookmarkService.getLocalBookmarks();
  });

  // Navigation & Drawer states
  const [activeCategory, setActiveCategory] = useState(() => {
    try {
      const pathname = window.location.pathname;
      if (pathname === '/latest' || pathname.startsWith('/latest') || pathname === '/just-in' || pathname.startsWith('/just-in') || pathname === '/category/latest') {
        return 'latest';
      }
      if (pathname === '/trending' || pathname.startsWith('/trending') || pathname === '/category/trending') {
        return 'trending';
      }
      if (pathname === '/ai-story' || pathname.startsWith('/ai-story') || pathname === '/aistory') {
        return 'ai-story';
      }
      if (pathname === '/her-story' || pathname.startsWith('/her-story') || pathname === '/herstory') {
        return 'her-story';
      }
      if (pathname === '/social-story' || pathname.startsWith('/social-story') || pathname === '/socialstory') {
        return 'social-story';
      }
      if (pathname === '/smbstory' || pathname.startsWith('/smbstory') || pathname === '/smb-story') {
        return 'smbstory';
      }
      if (pathname === '/enterprise' || pathname.startsWith('/enterprise') || pathname === '/enterprise-story' || pathname === '/enterprisestory') {
        return 'enterprise';
      }
      if (pathname === '/hindi' || pathname.startsWith('/hindi') || pathname === '/ys-hindi' || pathname === '/yshindi') {
        return 'hindi';
      }
      if (pathname === '/videos' || pathname.startsWith('/videos') || pathname === '/video' || pathname.startsWith('/video') || pathname === '/ystv' || pathname.startsWith('/ystv')) {
        return 'videos';
      }
      if (pathname.startsWith('/category/') || pathname.startsWith('/cotegory/')) {
        const catSlug = pathname.replace(/^\/(category|cotegory)\//, '').split('/')[0].split('?')[0];
        if (catSlug) return catSlug.toLowerCase();
      }
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get('category');
      if (categoryParam) {
        return categoryParam.toLowerCase();
      }
      const tag = params.get('tag');
      const brand = params.get('brand');
      if (tag && (tag.toLowerCase() === 'just in' || tag.toLowerCase() === 'just-in' || tag.toLowerCase() === 'latest')) {
        return 'latest';
      }
      if (brand && (brand.toLowerCase() === 'ai-story' || brand.toLowerCase() === 'aistory')) {
        return 'ai-story';
      }
      if (brand && (brand.toLowerCase() === 'her-story' || brand.toLowerCase() === 'herstory')) {
        return 'her-story';
      }
      if (brand && (brand.toLowerCase() === 'social-story' || brand.toLowerCase() === 'socialstory')) {
        return 'social-story';
      }
      if (brand && (brand.toLowerCase() === 'smbstory' || brand.toLowerCase() === 'smb-story')) {
        return 'smbstory';
      }
      if (brand && (brand.toLowerCase() === 'enterprise' || brand.toLowerCase() === 'enterprisestory' || brand.toLowerCase() === 'enterprise-story')) {
        return 'enterprise';
      }
      if (brand && (brand.toLowerCase() === 'hindi' || brand.toLowerCase() === 'ys-hindi' || brand.toLowerCase() === 'yshindi')) {
        return 'hindi';
      }
      if (brand && (brand.toLowerCase() === 'techsparks' || brand.toLowerCase() === 'techsparks-2026')) {
        return 'techsparks';
      }
      if (brand && brand.toLowerCase() === 'founder-first') {
        return 'founder-first';
      }
      if (brand && brand.toLowerCase() === 'brands') {
        return 'brands';
      }
      if (brand && (brand.toLowerCase() === 'ystv' || brand.toLowerCase() === 'videos' || brand.toLowerCase() === 'video')) {
        return 'videos';
      }
      if (brand && brand.toLowerCase() === 'resources') {
        return 'resources';
      }
      if (brand && brand.toLowerCase() === 'newsletter') {
        return 'newsletter';
      }
    } catch (e) {}
    return 'all';
  });

  const [justInPage, setJustInPage] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page'), 10);
      if (page > 0) return page;
    } catch (e) {}
    return 1;
  });

  const [isAdminView, setIsAdminView] = useState(() => {
    try {
      if (window.location.pathname.startsWith('/admin')) return true;
      const params = new URLSearchParams(window.location.search);
      return params.get('admin') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticleSlug, setActiveArticleSlug] = useState(() => getArticleSlugFromUrl());
  const [selectedStory, setSelectedStory] = useState(() => {
    try {
      const slug = getArticleSlugFromUrl();
      if (slug) {
        return findStoryById(slug);
      }
    } catch (e) {}
    return null;
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeHerStoryId, setActiveHerStoryId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const storyId = params.get('story');
      if (storyId) return storyId;
    } catch (e) {}
    return 'prableen-pullup';
  });
  const [activeSmbStoryId, setActiveSmbStoryId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const storyId = params.get('story');
      if (storyId) return storyId;
    } catch (e) {}
    return 'pac-cosmetics';
  });
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [proModalOpen, setProModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Dynamic Navigation & Pages & Homepage state from MongoDB
  const [navLinks, setNavLinks] = useState([]);
  const [sitePages, setSitePages] = useState([]);
  const [homepageSections, setHomepageSections] = useState([]);
  const [siteSettings, setSiteSettings] = useState(() => SettingService.getLocalSettings());
  const [currentRoute, setCurrentRoute] = useState(() => parseCurrentRoute());

  // Dynamic real data feeds from MongoDB
  const dynamicJustInStories = useMemo(() => {
    if (!stories || stories.length === 0) return JUST_IN_STORIES;
    const dbJustIn = stories.filter(s => {
      const cat = (s.category || '').toLowerCase();
      const tag = (s.tag || '').toLowerCase();
      const lbl = (s.categoryLabel || '').toLowerCase();
      return cat === 'just-in' || cat === 'latest' || tag.includes('just in') || tag.includes('breaking') || lbl.includes('just in');
    });
    const existingIds = new Set(dbJustIn.map(s => s.id || s._id));
    const otherDbStories = stories.filter(s => !existingIds.has(s.id || s._id));
    const allDb = [...dbJustIn, ...otherDbStories];
    return allDb.length > 0 ? allDb : JUST_IN_STORIES;
  }, [stories]);

  const dynamicAIStories = useMemo(() => {
    if (!stories || stories.length === 0) return AI_STORIES;
    const dbAi = stories.filter(s => {
      const cat = (s.category || '').toLowerCase();
      const tag = (s.tag || '').toLowerCase();
      const lbl = (s.categoryLabel || '').toLowerCase();
      const title = (s.title || '').toLowerCase();
      return cat === 'ai-story' || cat === 'ai' || cat === 'deep-tech' || cat === 'technology' ||
             tag.includes('ai') || tag.includes('deeptech') || tag.includes('model') ||
             lbl.includes('ai') || title.includes('ai') || title.includes('robot');
    });
    if (dbAi.length > 0) {
      const existingIds = new Set(dbAi.map(s => s.id || s._id));
      const fallback = AI_STORIES.filter(s => !existingIds.has(s.id));
      return [...dbAi, ...fallback];
    }
    return AI_STORIES;
  }, [stories]);

  const dynamicSocialStories = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    return stories.filter(s => {
      const cat = (s.category || '').toLowerCase();
      const tag = (s.tag || '').toLowerCase();
      const lbl = (s.categoryLabel || '').toLowerCase();
      return cat.includes('social') || cat.includes('impact') || cat.includes('climate') ||
             tag.includes('social') || tag.includes('impact') || tag.includes('climate') ||
             lbl.includes('social');
    });
  }, [stories]);

  const dynamicEnterpriseStories = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    return stories.filter(s => {
      const cat = (s.category || '').toLowerCase();
      const tag = (s.tag || '').toLowerCase();
      const lbl = (s.categoryLabel || '').toLowerCase();
      return cat.includes('enterprise') || cat.includes('saas') || cat.includes('b2b') ||
             tag.includes('enterprise') || tag.includes('saas') || tag.includes('b2b') ||
             lbl.includes('enterprise');
    });
  }, [stories]);

  const dynamicSmbStories = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    return stories.filter(s => {
      const cat = (s.category || '').toLowerCase();
      const tag = (s.tag || '').toLowerCase();
      const lbl = (s.categoryLabel || '').toLowerCase();
      return cat.includes('smb') || cat.includes('msme') || cat.includes('manufacturing') || cat.includes('d2c') ||
             tag.includes('smb') || tag.includes('msme') || tag.includes('manufacturing') || tag.includes('d2c') ||
             lbl.includes('smb');
    });
  }, [stories]);

  const dynamicHerStories = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    return stories.filter(s => {
      const cat = (s.category || '').toLowerCase();
      const tag = (s.tag || '').toLowerCase();
      const lbl = (s.categoryLabel || '').toLowerCase();
      return cat.includes('herstory') || cat.includes('her-story') || cat.includes('women') ||
             tag.includes('women') || tag.includes('female') || lbl.includes('herstory');
    });
  }, [stories]);

  const dynamicHindiStories = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    return stories.filter(s => {
      const cat = (s.category || '').toLowerCase();
      const tag = (s.tag || '').toLowerCase();
      const lbl = (s.categoryLabel || '').toLowerCase();
      return cat.includes('hindi') || tag.includes('hindi') || lbl.includes('hindi');
    });
  }, [stories]);

  const activeHomeSections = useMemo(() => {
    const homePage = sitePages.find(p => p.id === 'home' || p.slug === '' || p.slug === 'home');
    if (homePage && Array.isArray(homePage.sections) && homePage.sections.length > 0) {
      return homePage.sections;
    }
    if (Array.isArray(homepageSections) && homepageSections.length > 0) {
      return homepageSections;
    }
    return [];
  }, [sitePages, homepageSections]);

  // Load live stories, navigation tree, pages, and homepage layout from Express / MongoDB API on mount
  useEffect(() => {
    const fetchAllData = () => {
      StoryService.getStories().then((res) => {
        if (res && res.data && res.data.length > 0) {
          setStories(res.data);
        }
      }).catch(() => {});

      NavigationService.getNavigation().then((items) => {
        if (Array.isArray(items)) {
          setNavLinks(items);
        }
      }).catch(() => {});

      PageService.getPages().then((pgs) => {
        if (Array.isArray(pgs)) {
          setSitePages(pgs);
        }
      }).catch(() => {});

      HomepageService.getPublicHomepage().then((sections) => {
        if (Array.isArray(sections)) {
          setHomepageSections(sections);
        }
      }).catch(() => {});

      SettingService.getSettings().then((st) => {
        if (st) setSiteSettings(st);
      }).catch(() => {});
    };

    fetchAllData();

    const handleSettingsChange = (e) => {
      if (e.detail) {
        setSiteSettings(e.detail);
      } else {
        SettingService.getSettings().then(st => st && setSiteSettings(st)).catch(() => {});
      }
    };

    const handleArticleChange = () => {
      StoryService.getStories().then((res) => {
        if (res && res.data && res.data.length > 0) {
          setStories(res.data);
        }
      }).catch(() => {});
      HomepageService.getPublicHomepage().then((sections) => {
        if (Array.isArray(sections)) {
          setHomepageSections(sections);
        }
      }).catch(() => {});
    };

    const handleNavChange = () => {
      NavigationService.getNavigation().then((items) => {
        if (Array.isArray(items)) {
          setNavLinks(items);
        }
      }).catch(() => {});
    };

    const handlePageChange = () => {
      PageService.getPages().then((pgs) => {
        if (Array.isArray(pgs)) {
          setSitePages(pgs);
        }
      }).catch(() => {});
    };

    const handleHomepageChange = () => {
      HomepageService.getPublicHomepage().then((sections) => {
        if (Array.isArray(sections)) {
          setHomepageSections(sections);
        }
      }).catch(() => {});
    };

    const handleTaxonomyChange = () => {
      handleNavChange();
      handleArticleChange();
    };

    window.addEventListener('settings:change', handleSettingsChange);
    window.addEventListener('article:change', handleArticleChange);
    window.addEventListener('story:change', handleArticleChange);
    window.addEventListener('navigation:change', handleNavChange);
    window.addEventListener('page:change', handlePageChange);
    window.addEventListener('homepage:change', handleHomepageChange);
    window.addEventListener('category:change', handleTaxonomyChange);
    window.addEventListener('topic:change', handleTaxonomyChange);
    window.addEventListener('tag:change', handleTaxonomyChange);
    window.addEventListener('author:change', handleTaxonomyChange);

    return () => {
      window.removeEventListener('settings:change', handleSettingsChange);
      window.removeEventListener('article:change', handleArticleChange);
      window.removeEventListener('story:change', handleArticleChange);
      window.removeEventListener('navigation:change', handleNavChange);
      window.removeEventListener('page:change', handlePageChange);
      window.removeEventListener('homepage:change', handleHomepageChange);
      window.removeEventListener('category:change', handleTaxonomyChange);
      window.removeEventListener('topic:change', handleTaxonomyChange);
      window.removeEventListener('tag:change', handleTaxonomyChange);
      window.removeEventListener('author:change', handleTaxonomyChange);
    };
  }, []);

  // Dynamically update page title & favicon when siteSettings change
  useEffect(() => {
    if (siteSettings?.siteTitle) {
      document.title = siteSettings.siteTagline
        ? `${siteSettings.siteTitle} | ${siteSettings.siteTagline}`
        : siteSettings.siteTitle;
    }
    const activeFavicon = siteSettings?.favicon || siteSettings?.faviconUrl || (siteSettings?.logo && !siteSettings.logo.startsWith('data:') ? siteSettings.logo : null);
    if (activeFavicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = activeFavicon;
    }
  }, [siteSettings]);

  const handleOpenAdmin = () => {
    setIsAdminView(true);
    setCurrentRoute({ route: 'admin' });
    setActiveArticleSlug(null);
    setSelectedStory(null);
    setIsSideDrawerOpen(false);
    try {
      window.history.pushState(null, '', '/admin/dashboard');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromAdmin = () => {
    setIsAdminView(false);
    setCurrentRoute({ route: 'home' });
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refetch all live database content from MongoDB API
    Promise.all([
      StoryService.getStories(),
      NavigationService.getNavigation(),
      PageService.getPages(),
      HomepageService.getPublicHomepage()
    ]).then(([storyRes, navItems, pagesRes, hpSections]) => {
      if (storyRes?.data && Array.isArray(storyRes.data)) setStories(storyRes.data);
      if (Array.isArray(navItems)) setNavLinks(navItems);
      if (Array.isArray(pagesRes)) setSitePages(pagesRes);
      if (Array.isArray(hpSections)) setHomepageSections(hpSections);
    }).catch(() => {});
  };

  const handleSelectStory = (story) => {
    if (!story) return;
    setIsAdminView(false);
    const slug = story.slug || story.id || story._id;
    setActiveArticleSlug(slug);
    setSelectedStory(story);
    setCurrentRoute({ route: 'article', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', `/article/${slug}`);
    } catch (e) {}
  };

  const handleBackFromStory = () => {
    setActiveArticleSlug(null);
    setSelectedStory(null);
    if (activeCategory === 'trending') {
      setCurrentRoute({ route: 'trending' });
      try {
        window.history.pushState(null, '', '/trending');
      } catch (e) {}
    } else if (activeCategory === 'latest' || activeCategory === 'just-in') {
      setCurrentRoute({ route: 'latest' });
      try {
        window.history.pushState(null, '', '/latest');
      } catch (e) {}
    } else {
      setCurrentRoute({ route: 'home' });
      try {
        window.history.pushState(null, '', '/');
      } catch (e) {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateEntity = (type, slug) => {
    try {
      window.history.pushState(null, '', `/${type}/${slug}`);
    } catch (e) {}
    setCurrentRoute({ route: type, slug });
    setSelectedStory(null);
    setActiveArticleSlug(null);
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSearch = (q) => {
    try {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(q)}`);
    } catch (e) {}
    setCurrentRoute({ route: 'search', q });
    setSelectedStory(null);
    setActiveArticleSlug(null);
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {}
    setCurrentRoute({ route: 'home' });
    setSelectedStory(null);
    setActiveArticleSlug(null);
    setActiveCategory('all');
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync browser URL with back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const route = parseCurrentRoute();
        setCurrentRoute(route);

        if (route.route === 'admin') {
          setIsAdminView(true);
          setActiveArticleSlug(null);
          setSelectedStory(null);
          return;
        } else {
          setIsAdminView(false);
        }

        if (route.route === 'article') {
          setActiveArticleSlug(route.slug);
          const found = findStoryById(route.slug, stories);
          if (found) setSelectedStory(found);
          return;
        } else {
          setActiveArticleSlug(null);
          setSelectedStory(null);
        }

        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get('category');
        const tag = params.get('tag');
        const brand = params.get('brand');
        const storyId = params.get('story');
        const page = parseInt(params.get('page'), 10);
        if (route.route === 'not-found') {
          setActiveCategory('404');
        } else if (route.route === 'category') {
          setActiveCategory(route.slug || 'all');
        } else if (route.route === 'topic') {
          setActiveCategory('topic:' + (route.slug || ''));
        } else if (route.route === 'tag') {
          setActiveCategory('tag:' + (route.slug || ''));
        } else if (route.route === 'author') {
          setActiveCategory('author:' + (route.slug || ''));
        } else if (route.route === 'brand') {
          setActiveCategory(route.slug);
        } else if (route.route === 'dynamic-page') {
          setActiveCategory(route.slug);
        } else if (route.route === 'videos') {
          setActiveCategory('videos');
        } else if (route.route === 'techsparks') {
          setActiveCategory('techsparks');
        } else if (route.route === 'brands') {
          setActiveCategory('brands');
        } else if (route.route === 'resources') {
          setActiveCategory('resources');
        } else if (route.route === 'newsletter') {
          setActiveCategory('newsletter');
        } else if (categoryParam) {
          setActiveCategory(categoryParam.toLowerCase());
        } else if (tag && (tag.toLowerCase() === 'just in' || tag.toLowerCase() === 'just-in' || tag.toLowerCase() === 'latest')) {
          setActiveCategory('latest');
          setJustInPage(page > 0 ? page : 1);
        } else if (brand && (brand.toLowerCase() === 'ai-story' || brand.toLowerCase() === 'aistory')) {
          setActiveCategory('ai-story');
        } else if (brand && (brand.toLowerCase() === 'her-story' || brand.toLowerCase() === 'herstory')) {
          setActiveCategory('her-story');
          if (storyId) setActiveHerStoryId(storyId);
        } else if (brand && (brand.toLowerCase() === 'social-story' || brand.toLowerCase() === 'socialstory')) {
          setActiveCategory('social-story');
        } else if (brand && (brand.toLowerCase() === 'smbstory' || brand.toLowerCase() === 'smb-story')) {
          setActiveCategory('smbstory');
          if (storyId) setActiveSmbStoryId(storyId);
        } else if (brand && (brand.toLowerCase() === 'enterprise' || brand.toLowerCase() === 'enterprisestory' || brand.toLowerCase() === 'enterprise-story')) {
          setActiveCategory('enterprise');
        } else if (brand && (brand.toLowerCase() === 'hindi' || brand.toLowerCase() === 'ys-hindi' || brand.toLowerCase() === 'yshindi')) {
          setActiveCategory('hindi');
        } else if (brand && (brand.toLowerCase() === 'techsparks' || brand.toLowerCase() === 'techsparks-2026')) {
          setActiveCategory('techsparks');
        } else if (brand && brand.toLowerCase() === 'brands') {
          setActiveCategory('brands');
        } else if (brand && (brand.toLowerCase() === 'ystv' || brand.toLowerCase() === 'videos' || brand.toLowerCase() === 'video')) {
          setActiveCategory('videos');
        } else if (brand && brand.toLowerCase() === 'resources') {
          setActiveCategory('resources');
        } else if (brand && brand.toLowerCase() === 'newsletter') {
          setActiveCategory('newsletter');
        } else {
          setActiveCategory('all');
        }
      } catch (e) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [stories]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('goreadpost_theme', theme);
  }, [theme]);


  // Sync bookmarks per active user & listen for cross-tab or auth updates
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      BookmarkService.getBookmarks().then((items) => {
        if (Array.isArray(items)) {
          setSavedStories(items);
        }
      }).catch(() => {});
    } else {
      setSavedStories([]);
    }

    const onBookmarksChange = (e) => {
      if (!AuthService.isAuthenticated()) {
        setSavedStories([]);
        return;
      }
      if (e.detail && Array.isArray(e.detail)) {
        setSavedStories(e.detail);
      } else {
        setSavedStories(BookmarkService.getLocalBookmarks());
      }
    };

    const onAuthChange = () => {
      const u = AuthService.getUser();
      setCurrentUser(u);
      if (u) {
        BookmarkService.getBookmarks().then((items) => {
          if (Array.isArray(items)) {
            setSavedStories(items);
          }
        }).catch(() => {});
      } else {
        setSavedStories([]);
      }
    };

    window.addEventListener('bookmarks:change', onBookmarksChange);
    window.addEventListener('auth:change', onAuthChange);

    return () => {
      window.removeEventListener('bookmarks:change', onBookmarksChange);
      window.removeEventListener('auth:change', onAuthChange);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleSave = async (story) => {
    if (!story) return;
    if (!currentUser) {
      showToast('Please log in to save stories.');
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }
    const isNowSaved = await BookmarkService.toggleBookmark(story);
    const updated = BookmarkService.getLocalBookmarks();
    setSavedStories(updated);
    if (isNowSaved) {
      showToast('Saved to reading list.');
    } else {
      showToast('Removed from saved bookmarks.');
    }
  };

  const isSaved = (storyId) => {
    return BookmarkService.isStorySaved(storyId, savedStories);
  };

  const handleAddStory = async (newStory) => {
    try {
      const saved = await StoryService.createStory(newStory);
      setStories(prev => [saved || newStory, ...prev]);
      setSelectedStory(saved || newStory);
    } catch (e) {
      setStories(prev => [newStory, ...prev]);
      setSelectedStory(newStory);
    }
  };

  const handleShareStory = (story) => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.subtitle || story.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Article link copied to clipboard!");
    }
  };

  const handleClapStory = (storyId) => {
    StoryService.clapStory(storyId);
    setStories(stories.map(s => (s.id === storyId || s._id === storyId) ? { ...s, claps: (s.claps || 0) + 1 } : s));
  };

  // Filtered stories when searching or filtering by category
  const filteredStories = stories.filter((story) => {
    if (!story) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (story.title || '').toLowerCase().includes(q);
      const matchSummary = (story.summary || story.excerpt || '').toLowerCase().includes(q);
      const matchCategory = (story.categoryLabel || story.category || '').toLowerCase().includes(q);
      const authorStr = typeof story.author === 'string' ? story.author : (story.author?.name || '');
      const matchAuthor = authorStr.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchCategory && !matchAuthor) return false;
    }

    if (activeCategory !== 'all') {
      const target = activeCategory.toLowerCase();
      const sCat = (story.category || '').toLowerCase();
      const sCatName = (story.categoryName || '').toLowerCase();
      const sCatLabel = (story.categoryLabel || '').toLowerCase();
      const sTag = (story.tag || '').toLowerCase();

      if (target === 'startups') {
        return sCat.includes('startup') || sCatName.includes('startup') || sCatLabel.includes('startup') || sCat.includes('founder') || sCat === 'funding';
      }
      if (target === 'technology') {
        return sCat.includes('tech') || sCatName.includes('tech') || sCatLabel.includes('tech');
      }
      if (target === 'ai-deeptech' || target === 'ai' || target === 'deep-tech') {
        return sCat.includes('ai') || sCat.includes('deep') || sCatName.includes('ai') || sCatName.includes('deep') || sTag.includes('ai') || sCat === 'deep-tech';
      }
      if (target === 'enterprise') {
        return sCat.includes('enterprise') || sCatName.includes('enterprise') || sCatLabel.includes('enterprise');
      }
      if (target === 'fintech') {
        return sCat.includes('fintech') || sCatName.includes('fintech') || sCatLabel.includes('fintech');
      }
      if (target === 'just-in' || target === 'latest') {
        return sCat === 'just-in' || sTag.includes('just in') || sTag.includes('breaking') || sCatLabel.includes('just in');
      }

      if (activeCategory === 'founder-first') return sCat === 'founder-first';
      if (activeCategory === 'leadership') return sCat === 'leadership';
      if (activeCategory === 'captable') return sCat === 'captable';
      if (activeCategory === 'her-story') return sCat === 'her-story';
      if (activeCategory === 'smbstory') return sCat === 'smbstory';
      if (activeCategory.startsWith('topic:')) {
        const topicRaw = activeCategory.replace('topic:', '').toLowerCase();
        const words = topicRaw.split(/[-_ ]+/).filter(Boolean);
        return words.some(w => 
          sCat.includes(w) || 
          sCatName.includes(w) || 
          sCatLabel.includes(w) || 
          sTag.includes(w) || 
          (story.title && story.title.toLowerCase().includes(w)) || 
          (story.summary && story.summary.toLowerCase().includes(w))
        );
      }

      return sCat === target || sCatName === target || sCatLabel === target;
    }

    return true;
  });

  const isBrowsingCategory = activeCategory !== 'all' || searchQuery.trim().length > 0;

  // Standalone dedicated Admin CMS Workspace
  if (isAdminView) {
    return (
      <div className="admin-app-root">
        <AdminLayout 
          onBackToSite={handleBackFromAdmin}
          onShowToast={showToast}
          siteSettings={siteSettings}
        />
        {toastMessage && (
          <div className="toast-notice">
            <CheckCircle size={18} color="var(--accent-emerald)" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Mega Menu Side Drawer */}
      <SideDrawer 
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        onSelectCategory={(catId) => {
          setSelectedStory(null);
          setActiveCategory(catId);
          setSearchQuery('');
          if (catId === 'all') {
            window.history.pushState(null, '', '/');
            setCurrentRoute({ route: 'home' });
          } else if (catId === 'just-in' || catId === 'latest') {
            window.history.pushState(null, '', '/latest');
            setCurrentRoute({ route: 'latest' });
          } else if (catId === 'trending') {
            window.history.pushState(null, '', '/trending');
            setCurrentRoute({ route: 'trending' });
          } else if (['videos', 'ystv', 'video'].includes(catId)) {
            window.history.pushState(null, '', '/videos');
            setCurrentRoute({ route: 'videos' });
          } else {
            window.history.pushState(null, '', `/category/${catId}`);
            setCurrentRoute({ route: 'category', slug: catId });
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        savedCount={currentUser ? savedStories.length : 0}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        theme={theme}
        setTheme={setTheme}
        onOpenAuthModal={(mode = 'login') => setAuthModal({ isOpen: true, mode })}
        onOpenProModal={() => setProModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        currentUser={currentUser}
        siteSettings={siteSettings}
      />

      {/* Main Header & Sub-Nav */}
      <Header 
        theme={theme}
        setTheme={setTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setSelectedStory(null);
          setActiveCategory(cat);
        }}
        savedCount={currentUser ? savedStories.length : 0}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
        onOpenSideDrawer={() => setIsSideDrawerOpen(true)}
        onShowToast={showToast}
        onOpenAuthModal={(mode = 'login') => setAuthModal({ isOpen: true, mode })}
        onOpenProModal={() => setProModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        navLinks={navLinks}
        onSearchSubmit={handleNavigateSearch}
        onGoHome={handleBackToHome}
        currentUser={currentUser}
        siteSettings={siteSettings}
      />

      <ErrorBoundary onReset={handleBackToHome}>
        <main id="top">
        {(currentRoute.route === 'article' || activeArticleSlug || selectedStory) ? (
          <ArticlePage 
            story={selectedStory}
            slug={currentRoute.slug || activeArticleSlug || selectedStory?.slug || selectedStory?.id || selectedStory?._id}
            onBack={handleBackFromStory}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onShowToast={showToast}
            onClapStory={handleClapStory}
            onSelectStory={handleSelectStory}
            stories={stories}
            currentUser={currentUser}
            onOpenAuthModal={(mode = 'login') => setAuthModal({ isOpen: true, mode })}
          />
        ) : (currentRoute.route === 'videos' || currentRoute.route === 'video' || currentRoute.route === 'ystv' || activeCategory === 'videos' || activeCategory === 'ystv') && !searchQuery.trim() ? (
          <VideosPage 
            onBackToHome={handleBackToHome}
            onSelectVideo={(video) => setSelectedVideo(video)}
          />
        ) : currentRoute.route === 'not-found' ? (
          <NotFoundPage 
            onBackToHome={handleBackToHome}
            onSearch={handleNavigateSearch}
            onOpenAdmin={handleOpenAdmin}
          />
        ) : (currentRoute.route === 'trending' || (currentRoute.route === 'category' && currentRoute.slug === 'trending') || activeCategory === 'trending') && !searchQuery.trim() ? (
          <TrendingPage 
            stories={stories}
            pageConfig={sitePages.find(p => p.id === 'trending' || p.slug === 'trending')}
            onSelectStory={handleSelectStory}
            onBackToHome={handleBackToHome}
            onCategoryClick={(cat) => {
              setSelectedStory(null);
              setActiveCategory(cat);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
          />
        ) : (currentRoute.route === 'latest' || (currentRoute.route === 'category' && (currentRoute.slug === 'latest' || currentRoute.slug === 'just-in')) || activeCategory === 'latest' || activeCategory === 'just-in') && !searchQuery.trim() ? (
          <LatestArticlesPage 
            stories={stories}
            onSelectStory={handleSelectStory}
            onBackToHome={handleBackToHome}
            onCategoryClick={(cat) => {
              setSelectedStory(null);
              setActiveCategory(cat);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
          />
        ) : (currentRoute.route === 'category' || (
          activeCategory && 
          activeCategory !== 'all' && 
          !searchQuery.trim() && 
          !['trending', 'latest', 'just-in', 'videos', 'ystv', 'techsparks', 'brands', 'resources', 'newsletter'].includes(activeCategory)
        )) ? (
          <CategoryContentPage 
            slug={currentRoute.route === 'category' ? (currentRoute.slug || 'content') : activeCategory}
            stories={stories}
            onSelectStory={handleSelectStory}
            onBackToHome={handleBackToHome}
            onCategoryClick={(cat) => {
              setSelectedStory(null);
              setActiveCategory(cat);
              setCurrentRoute({ route: 'category', slug: cat });
              try {
                window.history.pushState(null, '', `/category/${cat}`);
              } catch (e) {}
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
          />
        ) : (currentRoute.route === 'topic' || currentRoute.route === 'tag' || currentRoute.route === 'author') ? (
          <DynamicEntityPage
            type={currentRoute.route}
            slug={currentRoute.slug}
            onBack={handleBackToHome}
            onSelectStory={handleSelectStory}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onClapStory={handleClapStory}
          />
        ) : currentRoute.route === 'search' ? (
          <SearchPage
            initialQuery={currentRoute.q}
            onBack={handleBackToHome}
            onSelectStory={handleSelectStory}
            onNavigateEntity={handleNavigateEntity}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onClapStory={handleClapStory}
          />
        ) : (activeCategory === 'just-in' || activeCategory === 'latest') && !searchQuery.trim() ? (
          <JustInTagPage 
            allJustInStories={dynamicJustInStories}
            onSelectStory={handleSelectStory}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onBackToHome={() => {
              setActiveCategory('all');
              setSearchQuery('');
              window.history.pushState(null, '', window.location.pathname);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentPage={justInPage}
            onPageChange={(newPage) => {
              setJustInPage(newPage);
              const url = newPage === 1 ? '?tag=Just%20In' : `?page=${newPage}&tag=Just%20In`;
              window.history.pushState(null, '', url);
            }}
          />
        ) : activeCategory === 'ai-story' && !searchQuery.trim() ? (
          <AIStoryPage 
            aiStories={dynamicAIStories}
            onSelectStory={handleSelectStory}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onBackToHome={() => {
              setActiveCategory('all');
              setSearchQuery('');
              window.history.pushState(null, '', window.location.pathname);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeCategory === 'her-story' && !searchQuery.trim() ? (
          <HerStoryPage
            initialStoryId={activeHerStoryId}
            onBackToHome={() => {
              setActiveCategory('all');
              setSearchQuery('');
              window.history.pushState(null, '', window.location.pathname);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSideDrawer={() => setIsSideDrawerOpen(true)}
            onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode: mode || 'login' })}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onShowToast={showToast}
          />
        ) : activeCategory === 'social-story' && !searchQuery.trim() ? (
          <SocialStoryPage 
            customStories={dynamicSocialStories}
            onSelectStory={handleSelectStory}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onBackToHome={() => {
              setActiveCategory('all');
              setSearchQuery('');
              window.history.pushState(null, '', window.location.pathname);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
            onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode: mode || 'login' })}
          />
        ) : activeCategory === 'smbstory' && !searchQuery.trim() ? (
          <SMBStoryPage 
            initialStoryId={activeSmbStoryId}
            onBackToHome={() => {
              setActiveCategory('all');
              setSearchQuery('');
              window.history.pushState(null, '', window.location.pathname);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectStory={handleSelectStory}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onShowToast={showToast}
          />
        ) : (activeCategory === 'enterprise' || activeCategory === 'enterprisestory' || activeCategory === 'enterprise-story') && !searchQuery.trim() ? (
          <EnterpriseStoryPage 
            onSelectStory={handleSelectStory}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onBackToHome={() => {
              setActiveCategory('all');
              setSearchQuery('');
              window.history.pushState(null, '', window.location.pathname);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
            onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode: mode || 'login' })}
          />
        ) : (activeCategory === 'hindi' || activeCategory === 'ys-hindi' || activeCategory === 'yshindi') && !searchQuery.trim() ? (
          <HindiStoryPage 
            onSelectStory={handleSelectStory}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onBackToHome={() => {
              setActiveCategory('all');
              setSearchQuery('');
              window.history.pushState(null, '', window.location.pathname);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
            onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode: mode || 'login' })}
          />
        ) : (currentRoute.route === 'techsparks' || activeCategory === 'techsparks') && !searchQuery.trim() ? (
          <TechSparksPage 
            onBackToHome={handleBackToHome}
            onSelectStory={handleSelectStory}
          />
        ) : (currentRoute.route === 'founder-first' || activeCategory === 'founder-first') && !searchQuery.trim() ? (
          <FounderFirstPage 
            onBackToHome={handleBackToHome}
            onSelectStory={handleSelectStory}
            onOpenPitchModal={() => setIsPitchModalOpen(true)}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
          />
        ) : (currentRoute.route === 'about' || activeCategory === 'about') && !searchQuery.trim() ? (
          <AboutSection />
        ) : (currentRoute.route === 'brands' || activeCategory === 'brands') && !searchQuery.trim() ? (
          <BrandsHubPage 
            onBackToHome={handleBackToHome}
            onNavigateBrand={(brandId) => {
              setActiveCategory(brandId);
              setSearchQuery('');
              window.history.pushState(null, '', `?brand=${brandId}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (currentRoute.route === 'resources' || activeCategory === 'resources') && !searchQuery.trim() ? (
          <ResourcesPage 
            onBackToHome={handleBackToHome}
          />
        ) : (currentRoute.route === 'newsletter' || activeCategory === 'newsletter') && !searchQuery.trim() ? (
          <NewsletterPage 
            onBackToHome={handleBackToHome}
          />
        ) : (currentRoute.route === 'videos' || activeCategory === 'videos' || currentRoute.route === 'ystv' || activeCategory === 'ystv' || activeCategory === 'video') && !searchQuery.trim() ? (
          <VideosPage 
            onBackToHome={handleBackToHome}
            onSelectVideo={(video) => setSelectedVideo(video)}
          />
        ) : (currentRoute.route === 'topics' || currentRoute.route === 'topic' || activeCategory === 'topics') && !searchQuery.trim() ? (
          <TopicsPage 
            topicSlug={currentRoute.route === 'topic' ? currentRoute.slug : null}
            onSelectStory={handleSelectStory}
            onBackToHome={handleBackToHome}
            onNavigateTopic={(slug) => {
              window.history.pushState(null, '', slug ? `/topic/${slug}` : '/topics');
              window.dispatchEvent(new Event('popstate'));
            }}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShareStory={handleShareStory}
            onShowToast={showToast}
          />
        ) : (currentRoute.route === 'dynamic-page' || sitePages.some(p => {
          const cleanP = (p.slug || '').replace(/^\/+/, '');
          return cleanP === activeCategory || p.id === activeCategory;
        })) && !searchQuery.trim() ? (
          <DynamicPageRenderer 
            slug={currentRoute.slug || activeCategory}
            onBackToHome={handleBackToHome}
            theme={theme}
            setTheme={setTheme}
            navLinks={navLinks}
            onOpenAdmin={handleOpenAdmin}
            onShowToast={showToast}
          />
        ) : isBrowsingCategory ? (
          <div style={{ marginTop: '2rem' }}>
            <StoriesGrid 
              stories={(activeCategory.startsWith('topic:') && filteredStories.length === 0) ? stories.slice(0, 12) : filteredStories}
              title={searchQuery.trim() ? `Search: "${searchQuery}"` : activeCategory.startsWith('topic:') ? `Topic: ${activeCategory.replace('topic:', '').replace(/-/g, ' ').toUpperCase()}` : `Desk: ${activeCategory.toUpperCase()}`}
              subtitle={`${(activeCategory.startsWith('topic:') && filteredStories.length === 0) ? stories.slice(0, 12).length : filteredStories.length} stories found`}
              onSelectStory={handleSelectStory}
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              onShareStory={handleShareStory}
              onClapStory={handleClapStory}
            />
          </div>
        ) : activeCategory === 'all' && !searchQuery.trim() ? (
          /* Exact Reference Modern Blog Homepage View */
          <ModernHomepageView 
            stories={stories}
            homepageSections={activeHomeSections}
            onSelectStory={handleSelectStory}
            onCategoryClick={(cat) => {
              setSelectedStory(null);
              setActiveCategory(cat);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onClapStory={handleClapStory}
          />
        ) : (
          <div className="container" style={{ padding: '2rem 1rem' }}>
            <StoriesGrid 
              id="category-view"
              stories={stories}
              title={`Articles in ${activeCategory}`}
              onSelectStory={handleSelectStory}
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              onShareStory={handleShareStory}
              onClapStory={handleClapStory}
            />
          </div>
        )}
      </main>
    </ErrorBoundary>


      {/* Footer */}
      <Footer 
        onCategoryClick={(cat) => {
          setSelectedStory(null);
          setActiveCategory(cat);
          if (cat === 'just-in') {
            window.history.pushState(null, '', justInPage === 1 ? '?tag=Just%20In' : `?page=${justInPage}&tag=Just%20In`);
          } else if (cat === 'ai-story') {
            window.history.pushState(null, '', '?brand=ai-story');
          } else if (cat === 'her-story') {
            window.history.pushState(null, '', '?brand=her-story');
          } else if (cat === 'social-story') {
            window.history.pushState(null, '', '?brand=social-story');
          } else if (cat === 'smbstory' || cat === 'smb-story') {
            window.history.pushState(null, '', '?brand=smbstory');
          } else if (cat === 'enterprise' || cat === 'enterprisestory' || cat === 'enterprise-story') {
            window.history.pushState(null, '', '?brand=enterprise');
          } else if (cat === 'hindi') {
            window.history.pushState(null, '', '?brand=hindi');
          } else {
            window.history.pushState(null, '', window.location.pathname);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
        siteSettings={siteSettings}
      />

      {/* Ultra-Premium Cinema Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          onSelectVideo={(v) => setSelectedVideo(v)}
        />
      )}

      {/* Pitch Modal */}
      <PitchModal 
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        onAddStory={handleAddStory}
        onShowToast={showToast}
      />

      {/* Auth Modal (Log in / Sign Up) */}
      <AuthModal 
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onShowToast={showToast}
      />

      {/* Pro Membership Modal (Be Pro / The Creative Pass) */}
      <ProModal 
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer 
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedStories={savedStories}
        onSelectStory={(story) => {
          handleSelectStory(story);
          setIsBookmarksOpen(false);
        }}
        onRemoveBookmark={async (id) => {
          const updated = await BookmarkService.removeBookmark(id);
          setSavedStories(updated);
          showToast("Story removed from saved bookmarks.");
        }}
        onClearAll={async () => {
          await BookmarkService.clearAll();
          setSavedStories([]);
          showToast("Reading list cleared.");
        }}
        onOpenAuthModal={(mode) => {
          setAuthModal({ isOpen: true, mode: mode || 'login' });
        }}
        currentUser={currentUser}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`mobile-nav-item ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveCategory('all'); setSearchQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <Home size={19} />
          <span>Home</span>
        </button>

        <button 
          className="mobile-nav-item"
          onClick={() => setIsSideDrawerOpen(true)}
        >
          <Compass size={19} />
          <span>Explore</span>
        </button>

        <button 
          className="mobile-nav-item"
          onClick={() => {
            const el = document.getElementById('ystv');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Tv size={19} />
          <span>YSTV</span>
        </button>

        <button 
          className="mobile-nav-item"
          onClick={() => {
            if (!currentUser) {
              showToast('Please log in to view your saved stories.');
              setAuthModal({ isOpen: true, mode: 'login' });
              return;
            }
            setIsBookmarksOpen(true);
          }}
        >
          <Bookmark size={19} />
          <span>Saved ({currentUser ? savedStories.length : 0})</span>
        </button>

        <button 
          className="mobile-nav-item"
          onClick={() => setIsPitchModalOpen(true)}
        >
          <Send size={19} />
          <span>Pitch</span>
        </button>
      </nav>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="toast-notice">
          <CheckCircle size={18} color="var(--accent-emerald)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
