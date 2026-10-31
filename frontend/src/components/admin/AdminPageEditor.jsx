import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ExternalLink, Settings, Globe, Eye, Plus, Trash2, ArrowLeft, Check,
  ArrowUp, ArrowDown, EyeOff, CheckCircle2, AlertCircle, 
  Layers, Settings as SettingsIcon, RefreshCw, X, Sparkles, Edit2
} from 'lucide-react';
import { PageService } from '../../services/pageService';
import { HomepageService } from '../../services/homepageService';
import SectionEditorModal, { SECTION_DEFINITIONS } from './SectionEditorModal';
import LiveBannerEditor from './LiveBannerEditor';
import LiveSectionEditor from './LiveSectionEditor';
import LiveHomepageStudio from './LiveHomepageStudio';
import LiveWholePageStudio from './LiveWholePageStudio';
import LatestArticlesPage from '../LatestArticlesPage';
import AdminTrendingView from './AdminTrendingView';
import AdminCategoryStudioView from './AdminCategoryStudioView';
import AdminAboutView from './AdminAboutView';
import ContactPage from '../ContactPage';
import AdvertisePage from '../AdvertisePage';
import AIStoryPage from '../AIStoryPage';
import HerStoryPage from '../HerStoryPage';
import SocialStoryPage from '../SocialStoryPage';
import SMBStoryPage from '../SMBStoryPage';
import EnterpriseStoryPage from '../EnterpriseStoryPage';
import TopicsPage from '../TopicsPage';
import VideosPage from '../VideosPage';
import NewsletterPage from '../NewsletterPage';
import { ALL_STORIES } from '../../data/storiesData';
import { StoryService, getDefaultSeedStories } from '../../services/storyService';

const CANONICAL_SECTION_META = {
  hero_popular: {
    badge: 'HERO BANNER & POPULAR POSTS',
    color: '#ea580c',
    bg: '#fff7ed',
    title: 'Lead Stories & Editorial Hero Slider',
    desc: 'Primary lead dispatch slider + 5 ranked articles sidebar'
  },
  latest_blogs: {
    badge: 'LATEST STORIES FEED',
    color: '#2563eb',
    bg: '#eff6ff',
    title: 'Latest from the Blog',
    desc: 'Real-time reporting and latest editorial dispatches across the ecosystem'
  },
  trending: {
    badge: 'TRENDING VIRAL FEED',
    color: '#d97706',
    bg: '#fffbeb',
    title: 'Trending Now',
    desc: 'High-velocity stories capturing builder attention and social virality'
  },
  popular_editors: {
    badge: "EDITOR'S PICKS FEED",
    color: '#059669',
    bg: '#ecfdf5',
    title: "Most Popular & Editor's Picks",
    desc: 'Essential reads handpicked by newsroom editors with Editor Choice badges'
  },
  spotlight: {
    badge: 'TECH & STARTUP SPOTLIGHT',
    color: '#7c3aed',
    bg: '#f5f3ff',
    title: 'Tech & Startup Spotlight',
    desc: 'Deep tech breakthroughs, generative AI, and emerging ventures'
  },
  trending_hero: {
    badge: 'TRENDING HERO SLIDER',
    color: '#ea580c',
    bg: '#fff7ed',
    title: 'Top Trending Hero Slider',
    desc: 'Interactive full-width hero slider showcasing viral and top trending dispatches'
  },
  trending_feed: {
    badge: 'RANKED STORIES FEED',
    color: '#059669',
    bg: '#ecfdf5',
    title: 'Ranked Trending Stories Feed',
    desc: 'Paginated ranked cards with live velocity badges, categories, and author metadata'
  },
  trending_sidebar: {
    badge: 'TRENDING SIDEBAR & NEWSLETTER',
    color: '#db2777',
    bg: '#fdf2f8',
    title: 'Trending Sidebar & Newsletter Banner',
    desc: 'Most-read top 5 leaderboard, newsletter subscription card, and popular tag cloud'
  },
  newsletter: {
    badge: 'NEWSLETTER BANNER',
    color: '#db2777',
    bg: '#fdf2f8',
    title: 'Newsletter Subscription Banner',
    desc: 'Join 100,000+ founders and engineers receiving our daily intelligence briefs'
  }
};

export const isBannerSection = (sec) => {
  if (!sec) return false;
  const type = (sec.type || '').toLowerCase();
  const id = (sec.id || '').toLowerCase();
  const sectionKey = (sec.sectionKey || '').toLowerCase();
  const title = (sec.data?.heading || sec.data?.title || sec.data?.headline || sec.title || '').toLowerCase();
  return (
    type === 'hero' ||
    type === 'banner' ||
    type === 'hero_popular' ||
    id === 'hero_popular' ||
    sectionKey === 'hero_popular' ||
    sectionKey.includes('hero') ||
    id.includes('hero') ||
    id.includes('banner') ||
    title.includes('hero') ||
    title.includes('banner')
  );
};

export const isCoreFeedSection = (sec) => {
  const id = (sec?.id || '').toLowerCase();
  const type = (sec?.type || '').toLowerCase();
  return (
    id === 'trending' ||
    id === 'latest_blogs' ||
    id === 'spotlight' ||
    id === 'newsletter' ||
    id === 'popular_editors' ||
    (type === 'trending' && !id.startsWith('sec_')) ||
    (type === 'spotlight' && !id.startsWith('sec_')) ||
    (type === 'newsletter' && !id.startsWith('sec_')) ||
    (type === 'stories_feed' && !id.startsWith('sec_'))
  );
};

export const isSectionAlreadyOnPage = (itemType, existingSections) => {
  if (!Array.isArray(existingSections) || existingSections.length === 0) return false;
  return existingSections.some(s => {
    if (!s) return false;
    const sType = (s.type || '').toLowerCase().trim();
    const sId = (s.id || '').toLowerCase().trim();
    const sKey = (s.sectionKey || '').toLowerCase().trim();
    const sTitle = (s.data?.heading || s.data?.title || s.title || '').toLowerCase().trim();
    const targetType = (itemType || '').toLowerCase().trim();

    // Direct type, ID, or sectionKey match
    if (sType === targetType || sId === targetType || sKey === targetType) return true;

    // Canonical equivalencies
    if (targetType === 'hero' && (sType === 'hero_popular' || sId === 'hero_popular' || sKey === 'hero_popular' || sType === 'banner' || isBannerSection(s))) return true;
    if (targetType === 'stories_feed' && (sType === 'latest_blogs' || sId === 'latest_blogs' || sKey === 'latest_blogs' || sType === 'stories_feed' || sTitle.includes('latest from the blog'))) return true;
    if (targetType === 'trending' && (sType === 'trending' || sId === 'trending' || sKey === 'trending' || sTitle.includes('trending'))) return true;
    if (targetType === 'popular_editors' && (sType === 'popular_editors' || sId === 'popular_editors' || sKey === 'popular_editors' || sType === 'editors_picks' || sTitle.includes("editor's pick") || sTitle.includes('most popular'))) return true;
    if (targetType === 'spotlight' && (sType === 'spotlight' || sId === 'spotlight' || sKey === 'spotlight' || sTitle.includes('spotlight'))) return true;
    if (targetType === 'newsletter' && (sType === 'newsletter' || sId === 'newsletter' || sKey === 'newsletter' || sTitle.includes('newsletter'))) return true;
    if (targetType === 'video_section' && (sType === 'video_section' || sId === 'video_section' || sKey === 'video_section' || sTitle.includes('video stories'))) return true;
    if (targetType === 'video_shows' && (sType === 'video_shows' || sId === 'video_shows' || sKey === 'video_shows' || sTitle.includes('originals & shows'))) return true;
    if (targetType === 'about' && (sType === 'about' || sId === 'about' || sKey === 'about' || sTitle.includes('about us'))) return true;
    if (targetType === 'contact' && (sType === 'contact' || sId === 'contact' || sKey === 'contact' || sTitle.includes('contact'))) return true;
    if (targetType === 'advertise' && (sType === 'advertise' || sId === 'advertise' || sKey === 'advertise' || sTitle.includes('advertise'))) return true;

    // Category desk matches
    if (targetType.startsWith('category_')) {
      const catSlug = targetType.replace('category_', '').toLowerCase();
      if (sType === targetType || sId === targetType || sKey === targetType) return true;
      const sCategory = (s.data?.category || '').toLowerCase();
      if (sCategory && (sCategory === catSlug || sCategory.includes(catSlug) || catSlug.includes(sCategory))) return true;
      if (sType.includes('category') && sTitle.includes(catSlug)) return true;
    }

    return false;
  });
};

export default function AdminPageEditor({ pageId, onNavigate, onShowToast }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const cardRefs = useRef({});
  const latestStudioSectionsRef = useRef([]);
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'seo'
  const [editingSection, setEditingSection] = useState(null);
  const [liveBannerEditingSection, setLiveBannerEditingSection] = useState(null);
  const [liveEditingSection, setLiveEditingSection] = useState(null);
  const [isWholeHomeStudioOpen, setIsWholeHomeStudioOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [seo, setSeo] = useState({
    title: '',
    description: '',
    keywords: [],
    ogImage: ''
  });
  const [sections, setSections] = useState([]);

  // Filter out sections that are already added to this page so they are not shown in the Add Page Section modal
  const availableSectionDefinitions = useMemo(() => {
    return SECTION_DEFINITIONS.filter(item => !isSectionAlreadyOnPage(item.type, sections));
  }, [sections]);
  const [allStories, setAllStories] = useState(() => getDefaultSeedStories());

  useEffect(() => {
    StoryService.getStories({ limit: 500 }).then(res => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setAllStories(res.data);
      }
    }).catch(() => {});
  }, []);

  const fetchPage = async (showSpinner = false) => {
    if (showSpinner || !page) {
      setLoading(true);
    }
    try {
      const data = await PageService.getPageById(pageId);
      if (data) {
        setPage(data);
        const isHome = pageId === 'home' || data.id === 'home' || data.slug === '' || data.slug === '/';
        const rawTitle = data.title || '';
        const cleanTitle = isHome ? rawTitle.replace(/\s*-\s*Live Portal/i, '').trim() || 'Homepage' : rawTitle.replace(/\s*-\s*Live Portal/i, '').trim();
        setTitle(cleanTitle);
        setSlug(isHome ? '' : (data.slug || ''));
        setDescription(data.description || '');
        setStatus(data.status || 'draft');
        setSeo({
          title: data.seo?.title || '',
          description: data.seo?.description || '',
          keywords: Array.isArray(data.seo?.keywords) ? data.seo.keywords : [],
          ogImage: data.seo?.ogImage || ''
        });
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error('Failed to load page:', err);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    if (pageId) fetchPage();
  }, [pageId]);

  // Synchronize browser URL to /admin/pages/:pageId/edit if accessed via /admin/pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isHome = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
      const targetSlug = isHome ? 'home' : (slug ? slug.replace(/^\/+/, '') : (page?.slug ? page.slug.replace(/^\/+/, '') : (pageId || 'home')));
      const expectedPath = `/admin/pages/${targetSlug}/edit`;

      if (window.location.pathname === '/admin/pages' || window.location.pathname === '/admin/pages/') {
        const search = window.location.search || '';
        window.history.replaceState(null, '', expectedPath + search);
        onNavigate?.(expectedPath + search);
      }
    }
  }, [pageId, slug, page?.slug]);

  useEffect(() => {
    if (sections.length > 0 && !liveEditingSection && !liveBannerEditingSection && !isWholeHomeStudioOpen) {
      if (window.location.search.includes('liveHero=true')) {
        const heroSec = sections.find(s => s.type === 'hero' || s.type === 'hero_popular' || s.id === 'hero_popular' || (s.type || '').toLowerCase().includes('hero'));
        if (heroSec) {
          setLiveEditingSection(heroSec);
        }
      } else if (window.location.search.includes('liveStudio=true')) {
        if (pageId === 'home') {
          setIsWholeHomeStudioOpen(true);
        }
      } else if (window.location.search.includes('liveSection=')) {
        const match = window.location.search.match(/liveSection=([^&]+)/);
        if (match && match[1]) {
          const sec = sections.find(s => s.id === match[1] || s.type === match[1]);
          if (sec) setLiveEditingSection(sec);
        }
      }
    }
  }, [sections, pageId]);

  // Synchronize browser history / Back button with live editor views
  useEffect(() => {
    const handlePopState = () => {
      const search = window.location.search;
      if (!search.includes('liveSection=') && !search.includes('liveHero=true')) {
        setLiveEditingSection(null);
      }
      if (!search.includes('liveStudio=true')) {
        setIsWholeHomeStudioOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Centralized section persistence to database (guarantees DB sync and zero rollback on refresh)
  const persistSections = async (updatedSections, successToast = null, publishStatus = null) => {
    setSaving(true);
    try {
      const isHome = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
      const targetStatus = publishStatus || status || page?.status || 'published';
      const targetSlug = isHome ? '' : (slug || page?.slug || '').trim();
      const rawTitle = title || page?.title || (isHome ? 'Homepage' : 'Custom Page');
      const cleanTitle = isHome ? rawTitle.replace(/\s*-\s*Live Portal/i, '').trim() || 'Homepage' : rawTitle.replace(/\s*-\s*Live Portal/i, '').trim();
      const payload = {
        title: cleanTitle,
        slug: targetSlug,
        description: (description || page?.description || '').trim(),
        status: targetStatus,
        seo: {
          title: (seo?.title || page?.seo?.title || '').trim() || `${cleanTitle} | GoReadPost`,
          description: (seo?.description || page?.seo?.description || '').trim() || (description || page?.description || '').trim(),
          keywords: Array.isArray(seo?.keywords) ? seo.keywords : typeof seo?.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : (page?.seo?.keywords || []),
          ogImage: (seo?.ogImage || page?.seo?.ogImage || '').trim()
        },
        sections: updatedSections.map((s, idx) => ({
          ...s,
          order: idx + 1,
          sectionKey: s.sectionKey || s.id || s.type,
          data: s.data || s.customConfig || {},
          customConfig: s.customConfig || s.data || {}
        }))
      };

      const updated = await PageService.updatePage(pageId, payload);
      if (updated) {
        setPage(updated);
        setSections(updated.sections || updatedSections);
        setStatus(targetStatus);
      } else {
        setSections(updatedSections);
      }

      // Always broadcast page change and storage timestamp for instant multi-tab sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('page:change', { detail: updated }));
        try {
          localStorage.setItem('pages_last_updated', Date.now().toString());
        } catch (e) {}
      }

      // If editing homepage, also sync to HomepageService so both endpoints stay 100% aligned
      if (pageId === 'home' || page?.id === 'home' || isHome) {
        try {
          await HomepageService.updateSections(payload.sections);
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('homepage:change', { detail: payload.sections }));
          try {
            localStorage.setItem('homepage_last_updated', Date.now().toString());
          } catch (e) {}
        }
      }

      if (successToast) {
        onShowToast?.(successToast);
      }
      return updated;
    } catch (err) {
      console.error('Failed to persist page sections:', err);
      onShowToast?.(err.message || 'Failed to save section changes to server.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Section Reordering with animated sliding and immediate database persistence
  const handleMoveSection = async (index, direction) => {
    if (isReordering) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const currentSec = sections[index];
    const targetSec = sections[targetIdx];
    const currentId = currentSec?.id || index;
    const targetId = targetSec?.id || targetIdx;

    const currentEl = cardRefs.current[currentId];
    const targetEl = cardRefs.current[targetId];

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    const updated = reordered.map((sec, i) => ({ ...sec, order: i + 1 }));

    if (currentEl && targetEl) {
      setIsReordering(true);
      const currentRect = currentEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const deltaY = targetRect.top - currentRect.top;

      // Animate current and target cards sliding past each other
      currentEl.style.transition = 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 300ms ease';
      currentEl.style.transform = `translateY(${deltaY}px)`;
      currentEl.style.zIndex = '10';
      currentEl.style.boxShadow = '0 12px 28px -4px rgba(0, 0, 0, 0.14), 0 8px 12px -6px rgba(0, 0, 0, 0.08)';

      targetEl.style.transition = 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)';
      targetEl.style.transform = `translateY(${-deltaY}px)`;
      targetEl.style.zIndex = '5';

      setTimeout(async () => {
        // Freeze transition to prevent back-transition jump
        currentEl.style.transition = 'none';
        targetEl.style.transition = 'none';
        currentEl.style.transform = '';
        targetEl.style.transform = '';
        currentEl.style.zIndex = '';
        currentEl.style.boxShadow = '';
        targetEl.style.zIndex = '';

        setSections(updated);
        setIsReordering(false);

        requestAnimationFrame(() => {
          if (currentEl) currentEl.style.transition = '';
          if (targetEl) targetEl.style.transition = '';
        });

        try {
          await persistSections(updated, 'Section order updated and saved live.');
        } catch (err) {
          setSections(sections);
        }
      }, 300);
    } else {
      setSections(updated);
      try {
        await persistSections(updated, 'Section order updated and saved live.');
      } catch (err) {
        setSections(sections);
      }
    }
  };

  // Section Toggle Enabled/Disabled with immediate database persistence
  const handleToggleSectionEnabled = async (sectionId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    const nextEnabled = targetSec?.enabled === false ? true : false;
    const updated = sections.map(sec =>
      sec.id === sectionId ? { ...sec, enabled: nextEnabled } : sec
    );
    setSections(updated);

    try {
      await persistSections(updated, `Section ${nextEnabled ? 'enabled' : 'disabled'} and saved live.`);
    } catch (err) {
      setSections(sections);
    }
  };

  // Delete Section with immediate database persistence
  const handleDeleteSection = async (sectionId) => {
    const secToDelete = sections.find(s => s.id === sectionId);
    const secName = secToDelete?.data?.heading || secToDelete?.data?.title || secToDelete?.data?.headline || secToDelete?.type || 'Section';

    if (!window.confirm(`Are you sure you want to delete "${secName}"? This change will be saved immediately.`)) return;

    const remaining = sections
      .filter(sec => sec.id !== sectionId)
      .map((sec, idx) => ({ ...sec, order: idx + 1 }));

    // Optimistically update UI
    setSections(remaining);

    try {
      await persistSections(remaining, `Section "${secName}" deleted and permanently saved.`);
    } catch (err) {
      // Revert if saving fails
      setSections(sections);
      alert(`Could not delete section: ${err.message || 'Please check your connection and try again.'}`);
    }
  };

  // Add New Section
  const handleCreateSection = (sectionType) => {
    const def = SECTION_DEFINITIONS.find(d => d.type === sectionType);
    let initialData = {
      title: def?.label || `${sectionType.toUpperCase()} Section`,
      heading: def?.label || `${sectionType.toUpperCase()} Section`
    };

    if (sectionType === 'video_section') {
      initialData = {
        title: 'Video Stories & Masterclasses',
        heading: 'Video Stories & Masterclasses',
        subtitle: 'Watch exclusive boardroom dialogues, deep tech demonstrations, and founder masterclasses.',
        viewAllText: 'Explore All Videos',
        viewAllUrl: '/videos'
      };
    } else if (sectionType === 'video_shows') {
      initialData = {
        title: 'GoReadPost Originals & Shows',
        heading: 'GoReadPost Originals & Shows',
        subtitle: 'Founder interviews, video shows, and executive masterclass episodes.',
        viewAllText: 'View All Shows',
        viewAllUrl: '/videos'
      };
    } else if (sectionType === 'hero') {
      initialData = {
        title: 'Lead Stories & Editorial Hero Banner',
        heading: 'Lead Stories & Editorial Hero Banner',
        headline: 'Stories That Matter in Startups, Technology & Capital',
        subheadline: 'Unfiltered founder playbooks, deep tech breakthroughs, and market movements.',
        badge: 'HEADLINE DISPATCHES',
        primaryBtnText: 'Read Latest',
        primaryBtnUrl: '/latest',
        popularTitle: 'Popular Posts'
      };
    } else if (sectionType === 'stories_feed') {
      initialData = {
        title: 'Latest from the Blog',
        heading: 'Latest from the Blog',
        subtitle: 'Real-time reporting and latest editorial dispatches across the ecosystem.',
        category: '',
        limit: 8,
        viewAllText: 'View All Articles',
        viewAllUrl: '/latest'
      };
    } else if (sectionType === 'trending') {
      initialData = {
        title: 'Trending Now',
        heading: 'Trending Now',
        subtitle: 'High-velocity stories capturing builder attention and social virality.',
        limit: 8,
        viewAllText: 'View All Trending',
        viewAllUrl: '/trending'
      };
    } else if (sectionType === 'popular_editors') {
      initialData = {
        title: "Most Popular & Editor's Picks",
        heading: "Most Popular & Editor's Picks",
        subtitle: 'Essential reads handpicked by newsroom editors with Editor Choice badges.',
        badgeText: "Editor's Choice",
        limit: 8,
        viewAllText: 'Explore Popular',
        viewAllUrl: '/category/startups'
      };
    } else if (sectionType === 'spotlight') {
      initialData = {
        title: 'Tech & Startup Spotlight',
        heading: 'Tech & Startup Spotlight',
        subtitle: 'Deep tech breakthroughs, generative AI, and emerging ventures.',
        category: 'Technology',
        badgeText: 'DEEPTECH FOCUS',
        limit: 8,
        viewAllText: 'Explore Spotlight',
        viewAllUrl: '/category/technology'
      };
    } else if (sectionType === 'category_startups') {
      initialData = {
        title: 'Startups & Capital Desk',
        heading: 'Startups & Capital Desk',
        subtitle: 'Early-stage fundraising, venture deals, term sheets, and founder dispatches.',
        category: 'Startups',
        limit: 8,
        viewAllText: 'Explore Startups',
        viewAllUrl: '/category/startups'
      };
    } else if (sectionType === 'category_technology') {
      initialData = {
        title: 'Technology & Cloud Desk',
        heading: 'Technology & Cloud Desk',
        subtitle: 'Frontier tech, software architectures, enterprise IT, and compute.',
        category: 'Technology',
        limit: 8,
        viewAllText: 'Explore Technology',
        viewAllUrl: '/category/technology'
      };
    } else if (sectionType === 'category_ai') {
      initialData = {
        title: 'AI & DeepTech Desk',
        heading: 'AI & DeepTech Desk',
        subtitle: 'Foundation models, autonomous agents, robotics, and generative AI revolutions.',
        category: 'AI',
        limit: 8,
        viewAllText: 'Explore AI & DeepTech',
        viewAllUrl: '/category/ai'
      };
    } else if (sectionType === 'category_fintech') {
      initialData = {
        title: 'FinTech & Web3 Desk',
        heading: 'FinTech & Web3 Desk',
        subtitle: 'Digital payments, UPI infra, digital banking, credit, and Web3.',
        category: 'FinTech',
        limit: 8,
        viewAllText: 'Explore FinTech',
        viewAllUrl: '/category/fintech'
      };
    } else if (sectionType === 'category_enterprise') {
      initialData = {
        title: 'Enterprise & SaaS Desk',
        heading: 'Enterprise & SaaS Desk',
        subtitle: 'B2B SaaS growth, annual recurring revenue (ARR), and enterprise scaling.',
        category: 'Enterprise',
        limit: 8,
        viewAllText: 'Explore Enterprise',
        viewAllUrl: '/category/enterprise'
      };
    } else if (sectionType === 'category_herstory') {
      initialData = {
        title: 'HerStory: Women Leaders',
        heading: 'HerStory: Women Leaders',
        subtitle: 'Celebrating women entrepreneurs, corporate executives, and changemakers.',
        category: 'HerStory',
        limit: 8,
        viewAllText: 'Explore HerStory',
        viewAllUrl: '/category/herstory'
      };
    } else if (sectionType === 'category_smbstory') {
      initialData = {
        title: 'SMBStory: MSME, Retail & D2C',
        heading: 'SMBStory: MSME, Retail & D2C',
        subtitle: 'Traditional business icons, retail brands, manufacturing, and D2C heroes.',
        category: 'SMBStory',
        limit: 8,
        viewAllText: 'Explore SMBStory',
        viewAllUrl: '/category/smbstory'
      };
    } else if (sectionType === 'category_socialstory') {
      initialData = {
        title: 'SocialStory: Impact & Climate',
        heading: 'SocialStory: Impact & Climate',
        subtitle: 'Grassroots movements, sustainability, climate tech, and social enterprises.',
        category: 'SocialStory',
        limit: 8,
        viewAllText: 'Explore SocialStory',
        viewAllUrl: '/category/socialstory'
      };
    } else if (sectionType === 'newsletter') {
      initialData = {
        title: 'Newsletter Subscription Banner',
        heading: 'Newsletter Subscription Banner',
        headline: 'Get the Latest Blogs Delivered to Your Inbox',
        subtitle: 'Join 100,000+ founders and engineers receiving our daily intelligence briefs.',
        buttonText: 'Subscribe',
        placeholder: 'Enter your email address'
      };
    } else if (sectionType === 'about') {
      initialData = {
        title: 'About Us & Mission Manifesto',
        heading: 'About Us & Mission Manifesto',
        subtitle: 'The Definitive Journal of Innovation, Capital & Builders',
        content: '<p>GoReadPost chronicles breakthrough founders, deep technology, AI revolutions, venture capital, and economic innovation across India.</p>'
      };
    } else if (sectionType === 'contact') {
      initialData = {
        title: 'Newsroom Bureaus & Contact Details',
        heading: 'Newsroom Bureaus & Contact Details',
        subtitle: 'Have a breaking tip, partnership proposal, or feedback? Get in touch with our editors.',
        email: 'newsroom@goreadpost.com',
        phone: '+91 (080) 4123-5678',
        address: '100ft Road, Indiranagar, Bengaluru, Karnataka 560038'
      };
    } else if (sectionType === 'advertise') {
      initialData = {
        title: 'Advertise With Us & Media Kit',
        heading: 'Advertise With Us & Media Kit',
        subtitle: 'Reach over 500,000 monthly readers discovering the builders shaping the next economic era.',
        primaryBtnText: 'Download Media Kit',
        primaryBtnUrl: '/advertise',
        secondaryBtnText: 'Contact Partnerships',
        secondaryBtnUrl: '/contact'
      };
    }

    const newSec = {
      id: 'sec_' + Date.now(),
      type: sectionType,
      order: sections.length + 1,
      enabled: true,
      data: initialData
    };
    const nextSections = [...sections, newSec];
    setSections(nextSections);
    setIsAddSectionOpen(false);

    persistSections(nextSections, `Section "${def?.label || sectionType}" added.`).catch(() => {});
  };

  // Save changes to backend
  const handleSavePage = async (publishOverride = null) => {
    try {
      const isHome = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
      const targetStatus = publishOverride || status;
      const targetSlug = isHome ? '' : slug.trim();

      const sectionsToPersist = (latestStudioSectionsRef.current && latestStudioSectionsRef.current.length > 0)
        ? latestStudioSectionsRef.current
        : sections;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin:publish-live-studio', { detail: { targetStatus } }));
      }

      await persistSections(sectionsToPersist, null, targetStatus);
      onShowToast?.(
        publishOverride === 'published'
          ? (isHome || !targetSlug ? 'Homepage is now published live!' : `Page "/${targetSlug}" is now published live!`)
          : 'Page draft saved successfully.'
      );
    } catch (err) {
      alert(err.message || 'Failed to save page');
    }
  };

  if (loading) {
    return (
      <div className="admin-view-container">
        <div className="admin-loading-indicator">
          <RefreshCw size={26} className="spin-animate" />
          <p>Loading page editor...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="admin-view-container">
        <div className="admin-empty-indicator">
          <AlertCircle size={36} color="var(--brand-primary)" />
          <h4>Page Not Found</h4>
          <p>The requested page ID could not be loaded.</p>
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => onNavigate('/admin/pages')}
          >
            Return to Pages
          </button>
        </div>
      </div>
    );
  }

  // Handlers for Dedicated Full-Page Live Studio (Allowed only for Banner section)
  const handleOpenLiveEditor = (sec) => {
    if (!sec) return;
    setLiveEditingSection(sec);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('liveSection', sec.id || sec._id || sec.type);
      url.searchParams.delete('liveHero');
      url.searchParams.delete('liveStudio');
      window.history.pushState(null, '', url.pathname + url.search);
    } catch (e) {}
  };

  const handleCloseLiveEditor = () => {
    setLiveEditingSection(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('liveSection');
      url.searchParams.delete('liveHero');
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    } catch (e) {}
  };

  const handleOpenWholeHomeStudio = () => {
    setIsWholeHomeStudioOpen(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('liveStudio', 'true');
      url.searchParams.delete('liveSection');
      url.searchParams.delete('liveHero');
      window.history.pushState(null, '', url.pathname + url.search);
    } catch (e) {}
  };

  const handleCloseWholeHomeStudio = () => {
    setIsWholeHomeStudioOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('liveStudio');
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    } catch (e) {}
  };

  const handleAutoSaveLiveSection = async (updatedData) => {
    if (!liveEditingSection) return;
    const targetId = liveEditingSection.id || liveEditingSection._id || liveEditingSection.sectionKey;
    setLiveEditingSection(prev => prev ? {
      ...prev,
      data: updatedData,
      customConfig: updatedData,
      title: updatedData.heading || updatedData.title || prev.title
    } : null);
    const updatedSections = sections.map(s => {
      const sId = s.id || s._id || s.sectionKey;
      if (sId === targetId) {
        return {
          ...s,
          data: updatedData,
          customConfig: updatedData,
          title: updatedData.heading || updatedData.title || s.title
        };
      }
      return s;
    });
    setSections(updatedSections);

    try {
      return await persistSections(updatedSections);
    } catch (err) {
      console.error('Failed to auto-save section:', err);
    }
  };

  const handleSaveLiveSection = async (updatedData) => {
    if (!liveEditingSection) return;
    const targetId = liveEditingSection.id || liveEditingSection._id || liveEditingSection.sectionKey;
    const updatedSections = sections.map(s => {
      const sId = s.id || s._id || s.sectionKey;
      if (sId === targetId) {
        return {
          ...s,
          data: updatedData,
          customConfig: updatedData,
          title: updatedData.heading || updatedData.title || s.title
        };
      }
      return s;
    });
    setSections(updatedSections);
    handleCloseLiveEditor();

    try {
      await persistSections(updatedSections, `Section "${updatedData?.title || updatedData?.heading || liveEditingSection.type || 'content'}" saved and published live!`);
    } catch (err) {
      console.error('Failed to save section:', err);
      onShowToast?.('Section updated in editor. Click "Publish Live" to save.');
    }
  };

  // ── 1. IN-PAGE LIVE SECTION STUDIO VIEW (OPENS IN THE SAME WINDOW) ──
  if (liveEditingSection) {
    const secTitle = liveEditingSection.data?.heading || 
                     liveEditingSection.data?.title || 
                     liveEditingSection.title || 
                     (CANONICAL_SECTION_META[liveEditingSection.type]?.title) ||
                     liveEditingSection.type || 
                     'Section';
    const secType = liveEditingSection.type || liveEditingSection.sectionKey || 'Section';

    return (
      <div className="admin-page-container admin-section-edit-container">
        {/* Top Header in same window */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleCloseLiveEditor}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.05rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sections</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Editing: {secTitle}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: '#eff6ff',
                color: '#2563eb',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {secType}
              </span>
            </div>
          </div>
        </div>

        {/* Live Section Studio rendered right in the same space */}
        <div className="admin-live-studio-inpage-wrapper">
          <LiveSectionEditor
            section={liveEditingSection}
            isOpen={true}
            pageId={pageId}
            onClose={handleCloseLiveEditor}
            onAutoSave={handleAutoSaveLiveSection}
            onSave={handleSaveLiveSection}
            stories={allStories.length ? allStories : ALL_STORIES}
          />
        </div>
      </div>
    );
  }

  const isHomepage = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
  const isLive = status === 'published' || status === 'active';
  const rawTopTitle = title || page?.title || (isHomepage ? 'Homepage' : 'Edit Page');
  const displayTitle = isHomepage ? rawTopTitle.replace(/\s*-\s*Live Portal/i, '').trim() || 'Homepage' : rawTopTitle.replace(/\s*-\s*Live Portal/i, '').trim();
  const displaySlug = isHomepage ? '/' : (slug ? `/${slug.replace(/^\/+/, '')}` : (pageId && !pageId.match(/^[0-9a-fA-F]{24}$/) ? `/${pageId}` : '/'));

  // Multi-Page Visual Studio Switcher: routes every page to its dedicated live visual in-page studio
  const renderVisualStudioForPage = () => {
    const normId = (pageId || '').toLowerCase().trim();
    const normSlug = (slug || page?.slug || '').toLowerCase().replace(/^\/+/, '').trim();

    // 1. Latest Articles Page
    if (normId === 'latest' || normSlug === 'latest') {
      return (
        <LatestArticlesPage
          isStudioView={true}
          onShowToast={onShowToast}
        />
      );
    }

    // 2. Trending Stories Page
    if (normId === 'trending' || normSlug === 'trending') {
      return (
        <AdminTrendingView
          isStudioView={true}
          onShowToast={onShowToast}
          onNavigate={onNavigate}
        />
      );
    }

    // 3. Category Desks & Beats Page
    if (normId === 'category' || normId === 'categories' || normSlug === 'category' || normSlug === 'categories') {
      return (
        <AdminCategoryStudioView
          isStudioView={true}
          onShowToast={onShowToast}
          onNavigate={onNavigate}
        />
      );
    }

    // 4. About Us Page
    if (normId === 'about' || normSlug === 'about' || normSlug === 'about-us') {
      return (
        <AdminAboutView
          isStudioView={true}
          onShowToast={onShowToast}
          onNavigate={onNavigate}
        />
      );
    }

    // 5. Contact Us Page
    if (normId === 'contact' || normSlug === 'contact' || normSlug === 'contact-us') {
      return (
        <ContactPage
          isStudioView={true}
          onShowToast={onShowToast}
          onBackToHome={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
        />
      );
    }

    // 6. Advertise With Us Page
    if (normId === 'page_advertise' || normId === 'advertise' || normSlug === 'advertise' || normSlug === 'advertise-with-us') {
      return (
        <AdvertisePage
          isStudioView={true}
          page={page}
          onShowToast={onShowToast}
          onBackToHome={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
        />
      );
    }

    // 7. Specialty Hubs
    if (normId === 'ai-story' || normSlug === 'ai-story') {
      return <AIStoryPage isStudioView={true} onShowToast={onShowToast} />;
    }
    if (normId === 'her-story' || normSlug === 'her-story') {
      return <HerStoryPage isStudioView={true} onShowToast={onShowToast} />;
    }
    if (normId === 'social-story' || normSlug === 'social-story') {
      return <SocialStoryPage isStudioView={true} onShowToast={onShowToast} />;
    }
    if (normId === 'smbstory' || normSlug === 'smbstory') {
      return <SMBStoryPage isStudioView={true} onShowToast={onShowToast} />;
    }
    if (normId === 'enterprise' || normSlug === 'enterprise') {
      return <EnterpriseStoryPage isStudioView={true} onShowToast={onShowToast} />;
    }
    if (normId === 'topics' || normSlug === 'topics') {
      return <TopicsPage isStudioView={true} onShowToast={onShowToast} />;
    }
    if (normId === 'videos' || normSlug === 'videos') {
      return <VideosPage isStudioView={true} onShowToast={onShowToast} />;
    }
    if (normId === 'newsletter' || normSlug === 'newsletter') {
      return <NewsletterPage isStudioView={true} onShowToast={onShowToast} />;
    }

    // 8. Homepage or any other Dynamic / Custom Landing Page (WYSIWYG sections studio)
    return (
      <LiveWholePageStudio
        isOpen={true}
        inPageMode={true}
        pageId={pageId}
        pageTitle={displayTitle}
        pageSlug={displaySlug}
        initialSections={sections}
        stories={allStories.length ? allStories : ALL_STORIES}
        onClose={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
        onSectionsChange={(updated) => {
          if (Array.isArray(updated)) {
            latestStudioSectionsRef.current = updated;
            setSections(updated);
          }
        }}
        onSaveSuccess={(updated) => {
          if (updated) {
            latestStudioSectionsRef.current = updated;
            setSections(updated);
          }
          onShowToast?.(`"${displayTitle}" layout and articles permanently saved live!`);
        }}
        onOpenSettings={() => setActiveTab('seo')}
      />
    );
  };

  


  return (
    <div className="admin-inpage-editor-root" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* In-place Header Toolbar Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
            title="Return to Pages Management"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.05rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div style={{ width: '1px', height: '22px', background: '#e2e8f0' }} />

          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            {displayTitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'seo' ? 'sections' : 'seo')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.05rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: activeTab === 'seo' ? '#eff6ff' : '#ffffff',
              color: activeTab === 'seo' ? '#2563eb' : '#334155',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {activeTab === 'seo' ? <Eye size={15} /> : <Settings size={15} />}
            <span>{activeTab === 'seo' ? 'Live UI Studio' : 'Page Info & SEO'}</span>
          </button>

          {(pageId === 'home' || !pageId) && (
            <button
              type="button"
              onClick={() => setIsAddSectionOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.05rem',
                borderRadius: '8px',
                border: '1px solid #ea580c',
                background: '#fff7ed',
                color: '#ea580c',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span>Add Section</span>
            </button>
          )}

          {(pageId === 'latest' || slug === 'latest') && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open:add-latest-card'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.05rem',
                borderRadius: '8px',
                border: '1px solid #ea580c',
                background: '#fff7ed',
                color: '#ea580c',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span>Add Card</span>
            </button>
          )}


          <button
            type="button"
            onClick={() => handleSavePage('published')}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--brand-primary, #dc2626)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            <Check size={15} />
            <span>{saving ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      <div style={{ width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Segmented Editor Tabs */}
        <div className="admin-segmented-tabs-bar" style={{ display: 'none' }}>
          <button
            type="button"
            className={`admin-nav-tab-item ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            <span>Live UI Studio</span>
          </button>
          <button
            type="button"
            className={`admin-nav-tab-item ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            <span>Page Info & SEO Settings</span>
          </button>
        </div>

      {/* ========================================================
          TAB 1: LIVE UI VISUAL STUDIO (RENDERED IN THE SAME PAGE)
         ======================================================== */}
      {activeTab === 'sections' && (
        <div 
          className="admin-same-page-visual-editor"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            overflow: 'visible',
            padding: '1.25rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            marginBottom: '2rem'
          }}
        >
          {renderVisualStudioForPage()}
        </div>
      )}

      {/* ========================================================
          TAB 2: PAGE INFORMATION & SEO
         ======================================================== */}
      {activeTab === 'seo' && (
        <div className="admin-editor-card">
          <div className="editor-form-grid">
            <div className="editor-card-section">
              <h3 className="section-title">
                <SettingsIcon size={18} color="var(--brand-primary)" />
                <span>Page Attributes</span>
              </h3>

              <div className="form-group">
                <label>Page Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>URL Slug {pageId === 'home' ? '(Root /)' : '*'}</label>
                <input
                  type="text"
                  value={pageId === 'home' ? '/' : slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={pageId === 'home'}
                  required={pageId !== 'home'}
                />
                <span className="field-hint">Public URL path: https://goreadpost.com{(!slug || slug === 'home' || slug === '/') ? '' : `/${slug}`}</span>
              </div>

              <div className="form-group">
                <label>Page Summary Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="editor-card-section">
              <h3 className="section-title">
                <Globe size={18} color="var(--brand-primary)" />
                <span>SEO & Meta Tags</span>
              </h3>

              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  placeholder="e.g. SEO Services | GoReadPost"
                  value={seo.title}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Snippet displayed on search engine result cards..."
                  value={seo.description}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Keywords (Comma separated)</label>
                <input
                  type="text"
                  placeholder="seo, services, digital growth"
                  value={Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords}
                  onChange={(e) => setSeo({ ...seo, keywords: e.target.value.split(',').map(s => s.trim()) })}
                />
              </div>

              <div className="form-group">
                <label>Open Graph Share Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={seo.ogImage || ''}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-light, #e2e8f0)' }}>
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => handleSavePage()}
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                <span>{saving ? 'Saving...' : 'Save Page & SEO Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ========================================================
          MODAL 1: ADD SECTION PICKER
         ======================================================== */}
      {isAddSectionOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddSectionOpen(false)}>
          <div className="section-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Add Page Section</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddSectionOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="section-types-grid">
              {availableSectionDefinitions.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                  <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                    All Available Section Types Are Already Added
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    Every supported section component is currently active on this page.
                  </p>
                </div>
              ) : (
                availableSectionDefinitions.map((item) => (
                  <div
                    key={item.type}
                    className="section-type-card"
                    onClick={() => handleCreateSection(item.type)}
                  >
                    <div className="type-badge-icon">
                      <Plus size={20} />
                    </div>
                    <h4>{item.label}</h4>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: SECTION CONTENT EDITOR
         ======================================================== */}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          isOpen={!!editingSection}
          onClose={() => setEditingSection(null)}
          onSave={async (updatedSection) => {
            const updated = sections.map(s => s.id === updatedSection.id ? updatedSection : s);
            setSections(updated);
            setEditingSection(null);
            try {
              await persistSections(updated, `Section "${updatedSection.type}" updated and saved live.`);
            } catch (e) {}
          }}
          onOpenLiveStudio={() => {
            const sec = editingSection;
            setEditingSection(null);
            handleOpenLiveEditor(sec);
          }}
        />
      )}

    </div>
  );
}
