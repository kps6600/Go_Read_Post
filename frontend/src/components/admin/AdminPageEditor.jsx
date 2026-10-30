import React, { useState, useEffect } from 'react';
import { 
  Globe, Eye, Plus, Trash2, ArrowLeft, Check,
  ArrowUp, ArrowDown, EyeOff, CheckCircle2, AlertCircle, 
  Layers, Settings as SettingsIcon, RefreshCw, X, Sparkles
} from 'lucide-react';
import { PageService } from '../../services/pageService';
import { HomepageService } from '../../services/homepageService';
import SectionEditorModal, { SECTION_DEFINITIONS } from './SectionEditorModal';
import LiveBannerEditor from './LiveBannerEditor';
import LiveSectionEditor from './LiveSectionEditor';
import LiveHomepageStudio from './LiveHomepageStudio';
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
  const title = (sec.data?.heading || sec.data?.title || sec.data?.headline || sec.title || '').toLowerCase();
  return (
    type === 'hero' ||
    type === 'banner' ||
    type === 'hero_popular' ||
    id === 'hero_popular' ||
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

export default function AdminPageEditor({ pageId, onNavigate, onShowToast }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [allStories, setAllStories] = useState(() => getDefaultSeedStories());

  useEffect(() => {
    StoryService.getStories({ limit: 500 }).then(res => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setAllStories(res.data);
      }
    }).catch(() => {});
  }, []);

  const fetchPage = async () => {
    setLoading(true);
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
        sections: updatedSections.map((s, idx) => ({ ...s, order: idx + 1 }))
      };

      const updated = await PageService.updatePage(pageId, payload);
      if (updated) {
        setPage(updated);
        setSections(updated.sections || updatedSections);
        setStatus(targetStatus);
      } else {
        setSections(updatedSections);
      }

      // If editing homepage, also sync to HomepageService so both endpoints stay 100% aligned
      if (pageId === 'home' || page?.id === 'home' || isHome) {
        try {
          await HomepageService.updateSections(payload.sections);
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('homepage:change', { detail: payload.sections }));
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

  // Section Reordering with immediate database persistence
  const handleMoveSection = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    // Update orders
    const updated = reordered.map((sec, i) => ({ ...sec, order: i + 1 }));
    setSections(updated);

    try {
      await persistSections(updated, 'Section order updated and saved live.');
    } catch (err) {
      setSections(sections);
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

    if (sectionType === 'hero') {
      setLiveBannerEditingSection(newSec);
    } else {
      setEditingSection(newSec);
    }
  };

  // Save changes to backend
  const handleSavePage = async (publishOverride = null) => {
    try {
      const isHome = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
      const targetStatus = publishOverride || status;
      const targetSlug = isHome ? '' : slug.trim();
      await persistSections(sections, null, targetStatus);
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
    if (!isBannerSection(sec)) return;
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
    const targetId = liveEditingSection.id || liveEditingSection._id;
    const updatedSections = sections.map(s => (s.id || s._id) === targetId ? { ...s, data: updatedData } : s);
    setSections(updatedSections);

    try {
      const isHome = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
      const targetSlug = isHome ? '' : (slug || page?.slug || '').trim();
      const rawTitle = title || page?.title || (isHome ? 'Homepage' : 'Custom Page');
      const cleanTitle = isHome ? rawTitle.replace(/\s*-\s*Live Portal/i, '').trim() || 'Homepage' : rawTitle.replace(/\s*-\s*Live Portal/i, '').trim();
      const payload = {
        title: cleanTitle,
        slug: targetSlug,
        description: (description || page?.description || '').trim(),
        status: status || page?.status || 'published',
        seo: {
          title: (seo?.title || page?.seo?.title || '').trim() || `${cleanTitle} | GoReadPost`,
          description: (seo?.description || page?.seo?.description || '').trim() || (description || page?.description || '').trim(),
          keywords: Array.isArray(seo?.keywords) ? seo.keywords : typeof seo?.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : (page?.seo?.keywords || []),
          ogImage: (seo?.ogImage || page?.seo?.ogImage || '').trim()
        },
        sections: updatedSections
      };
      const updatedPage = await PageService.updatePage(pageId, payload);
      if (updatedPage) setPage(updatedPage);
      return updatedPage;
    } catch (err) {
      console.error('Failed to auto-save section:', err);
      throw err;
    }
  };

  const handleSaveLiveSection = async (updatedData) => {
    if (!liveEditingSection) return;
    const targetId = liveEditingSection.id || liveEditingSection._id;
    const updatedSections = sections.map(s => (s.id || s._id) === targetId ? { ...s, data: updatedData } : s);
    setSections(updatedSections);
    handleCloseLiveEditor();

    try {
      const isHome = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
      const targetSlug = isHome ? '' : (slug || page?.slug || '').trim();
      const rawTitle = title || page?.title || (isHome ? 'Homepage' : 'Custom Page');
      const cleanTitle = isHome ? rawTitle.replace(/\s*-\s*Live Portal/i, '').trim() || 'Homepage' : rawTitle.replace(/\s*-\s*Live Portal/i, '').trim();
      const payload = {
        title: cleanTitle,
        slug: targetSlug,
        description: (description || page?.description || '').trim(),
        status: status || page?.status || 'published',
        seo: {
          title: (seo?.title || page?.seo?.title || '').trim() || `${cleanTitle} | GoReadPost`,
          description: (seo?.description || page?.seo?.description || '').trim() || (description || page?.description || '').trim(),
          keywords: Array.isArray(seo?.keywords) ? seo.keywords : typeof seo?.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : (page?.seo?.keywords || []),
          ogImage: (seo?.ogImage || page?.seo?.ogImage || '').trim()
        },
        sections: updatedSections
      };
      const updatedPage = await PageService.updatePage(pageId, payload);
      if (updatedPage) setPage(updatedPage);
      onShowToast?.(`Section "${updatedData.title || updatedData.heading || liveEditingSection.type}" saved and published live!`);
    } catch (err) {
      console.error('Failed to save section:', err);
      onShowToast?.('Section updated in editor. Click "Publish Live" to save.');
    }
  };

  // ── 1. DEDICATED FULL-SCREEN LIVE SECTION STUDIO PAGE VIEW ──
  // Replaces the sections table completely with the full-screen visual live editor!
  if (liveEditingSection) {
    return (
      <div className="admin-live-studio-dedicated-page">
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
    );
  }

  // ── 2. DEDICATED FULL-SCREEN WHOLE HOMEPAGE STUDIO PAGE VIEW ──
  if (isWholeHomeStudioOpen) {
    return (
      <div className="admin-live-studio-dedicated-page">
        <LiveHomepageStudio
          isOpen={true}
          initialSections={sections}
          stories={allStories.length ? allStories : ALL_STORIES}
          onClose={handleCloseWholeHomeStudio}
          onSaveSuccess={(updatedSections) => {
            if (updatedSections) setSections(updatedSections);
            fetchPage();
            onShowToast?.('Whole homepage layout and articles permanently saved live!');
          }}
        />
      </div>
    );
  }

  const isHomepage = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
  const isLive = status === 'published' || status === 'active';
  const rawTopTitle = title || page?.title || (isHomepage ? 'Homepage' : 'Edit Page');
  const displayTitle = isHomepage ? rawTopTitle.replace(/\s*-\s*Live Portal/i, '').trim() || 'Homepage' : rawTopTitle.replace(/\s*-\s*Live Portal/i, '').trim();
  const displaySlug = isHomepage ? '/' : (slug ? `/${slug.replace(/^\/+/, '')}` : (pageId && !pageId.match(/^[0-9a-fA-F]{24}$/) ? `/${pageId}` : '/'));

  return (
    <div className="admin-fullpage-root" style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-primary, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Fullpage Studio Top Header Bar ── */}
      <header className="atv-studio-topbar">
        <div className="atv-topbar-left">
          <button
            type="button"
            className="atv-back-nav-btn"
            onClick={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
            title="Return to Pages Management"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="atv-topbar-divider" />

          <div className="atv-topbar-title-wrap">
            <span className="atv-topbar-title">{displayTitle}</span>
          </div>
        </div>

        <div className="atv-topbar-right">
          <button
            type="button"
            className="atv-btn-primary"
            onClick={() => handleSavePage('published')}
            disabled={saving}
            style={{ borderRadius: '8px', padding: '7px 18px', fontSize: '0.82rem' }}
          >
            <Check size={15} />
            <span>{saving ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '1.75rem 2.5rem 4rem', boxSizing: 'border-box' }}>
        {/* Segmented Editor Tabs */}
        <div className="admin-segmented-tabs-bar">
        <button
          type="button"
          className={`admin-nav-tab-item ${activeTab === 'sections' ? 'active' : ''}`}
          onClick={() => setActiveTab('sections')}
        >
          <span>Page Sections Builder</span>
          <span className="tab-counter-badge">{sections.length}</span>
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
          TAB 1: SECTION-BASED PAGE BUILDER
         ======================================================== */}
      {activeTab === 'sections' && (
        <div className="section-builder-wrapper">
          {/* Section Stack */}
          {sections.length === 0 ? (
            <div className="admin-empty-indicator">
              <Layers size={36} color="var(--brand-primary)" />
              <h4>No sections configured yet</h4>
              <p>Add your first section to construct this page layout.</p>
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => setIsAddSectionOpen(true)}
              >
                <Plus size={16} />
                <span>+ Add First Section</span>
              </button>
            </div>
          ) : (
            <div className="section-builder-stack">
              {sections.map((sec, idx) => {
                const def = SECTION_DEFINITIONS.find(d => d.type === sec.type) || {
                  label: (sec.type || sec.id || 'SECTION').toUpperCase()
                };
                const isEnabled = sec.enabled !== false;
                const secKey = sec.id ? sec.id.replace(/^sec_/, '') : '';
                const canon = CANONICAL_SECTION_META[sec.id] || CANONICAL_SECTION_META[secKey] || CANONICAL_SECTION_META[sec.type];

                const badgeText = canon?.badge || def.label?.toUpperCase() || (sec.type || sec.id || 'SECTION').toUpperCase();
                const badgeColor = canon?.color || 'var(--brand-primary)';
                const badgeBg = canon?.bg || 'rgba(234, 88, 12, 0.08)';

                const titleText = 
                  sec.data?.heading || 
                  sec.data?.title || 
                  sec.data?.headline || 
                  sec.title || 
                  canon?.title || 
                  def.label || 
                  `Section ${idx + 1}`;

                const subText = 
                  sec.data?.subheadline || 
                  sec.data?.subtitle || 
                  sec.data?.description || 
                  sec.description || 
                  canon?.desc || 
                  def.desc || 
                  '';

                // Content summary pills
                const categoryPill = sec.data?.category ? `📂 ${sec.data.category}` : null;
                const limitPill = sec.data?.limit ? `📰 ${sec.data.limit} Stories Limit` : (sec.type === 'hero' || sec.id === 'hero_popular' ? `🔥 ${sec.data?.popularArticles?.length || 5} Ranked Popular Posts` : null);
                const viewAllPill = sec.data?.viewAllUrl ? `🔗 ${sec.data.viewAllUrl}` : null;
                const highlightBadge = sec.data?.badgeText || sec.data?.badge ? `✨ ${sec.data.badgeText || sec.data.badge}` : null;
                const isHeroCustom = (sec.type === 'hero' || sec.id === 'hero_popular') && sec.data?.headline && sec.data.headline !== titleText;

                return (
                  <div
                    key={sec.id || idx}
                    className={`section-stack-card ${!isEnabled ? 'disabled' : ''}`}
                  >
                    {/* Drag / Reorder Buttons */}
                    <div className="section-reorder-controls">
                      <span className="section-order-num">{idx + 1}</span>
                      <button
                        type="button"
                        className="reorder-btn"
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, 'up')}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="reorder-btn"
                        disabled={idx === sections.length - 1}
                        onClick={() => handleMoveSection(idx, 'down')}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Section Information Preview */}
                    <div className="section-info-meta">
                      <div className="section-type-badge">
                        <span>{def.label}</span>
                        {!isEnabled && <span className="disabled-pill">Disabled</span>}
                      </div>
                      <div className="section-headline-preview">
                        {titleText}
                      </div>
                    </div>

                    {/* Section Actions: only admin can hide or show, except banner section which has Live Edit */}
                    <div className="section-card-actions">
                      <button
                        type="button"
                        className="btn-section-action"
                        onClick={() => handleToggleSectionEnabled(sec.id)}
                        title={isEnabled ? 'Hide section from live page' : 'Show section on live page'}
                      >
                        {isEnabled ? <Eye size={15} /> : <EyeOff size={15} color="var(--text-muted)" />}
                        <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      {/* Live Visual WYSIWYG Editor Button (ONLY for Hero / Banner section) */}
                      {isBannerSection(sec) && (
                        <button
                          type="button"
                          className="btn-section-action live-edit"
                          onClick={() => handleOpenLiveEditor(sec)}
                          style={{
                            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 750,
                            padding: '6px 14px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                          title={`Open Live Visual Editor for "${def.label || sec.type}"`}
                        >
                          <Sparkles size={15} />
                          <span>Live Edit</span>
                        </button>
                      )}

                      {/* Custom Added Section: Edit and Delete buttons */}
                      {!isCoreFeedSection(sec) && !isBannerSection(sec) && (
                        <>
                          <button
                            type="button"
                            className="btn-section-action live-edit"
                            onClick={() => setEditingSection(sec)}
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              fontWeight: 750,
                              padding: '6px 14px',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer'
                            }}
                            title={`Edit content for "${def.label || sec.type}"`}
                          >
                            <Sparkles size={14} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="btn-section-action delete"
                            onClick={() => handleDeleteSection(sec.id)}
                            disabled={saving}
                            title="Delete this section"
                            style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#dc2626',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Another Section Button */}
          <div className="add-section-footer-bar" style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={() => setIsAddSectionOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 750,
                background: '#ffffff',
                border: '2px dashed #cbd5e1',
                color: '#0f172a',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
              title="Add another section to the home page"
            >
              <Plus size={18} color="var(--brand-primary)" />
              <span>+ Add Another Section</span>
            </button>
          </div>
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
                <p>Select a section component to insert into this dynamic page.</p>
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
              {SECTION_DEFINITIONS.map((item) => (
                <div
                  key={item.type}
                  className="section-type-card"
                  onClick={() => handleCreateSection(item.type)}
                >
                  <div className="type-badge-icon">
                    <Plus size={16} />
                  </div>
                  <h4>{item.label}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
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
