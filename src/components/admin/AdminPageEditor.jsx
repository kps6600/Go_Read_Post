import React, { useState, useEffect } from 'react';
import { 
  Globe, Eye, Plus, Trash2, 
  ArrowUp, ArrowDown, EyeOff, CheckCircle2, AlertCircle, 
  Layers, Settings as SettingsIcon, RefreshCw, X, Sparkles, ExternalLink
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
  newsletter: {
    badge: 'NEWSLETTER BANNER',
    color: '#db2777',
    bg: '#fdf2f8',
    title: 'Newsletter Subscription Banner',
    desc: 'Join 100,000+ founders and engineers receiving our daily intelligence briefs'
  }
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
        setTitle(data.title || '');
        setSlug(data.slug || '');
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
      const targetStatus = publishStatus || status || page?.status || 'published';
      const targetSlug = pageId === 'home' || page?.id === 'home' ? '' : (slug || page?.slug || '').trim();
      const payload = {
        title: (title || page?.title || (pageId === 'home' ? 'Homepage - Live Portal' : 'Custom Page')).trim(),
        slug: targetSlug,
        description: (description || page?.description || '').trim(),
        status: targetStatus,
        seo: {
          title: (seo?.title || page?.seo?.title || '').trim() || `${title || page?.title || 'Page'} | GoReadPost`,
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
      if (pageId === 'home' || page?.id === 'home') {
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

    if (sectionType === 'stories_feed') {
      initialData = {
        title: 'Article & Story Feed',
        heading: 'Article & Story Feed',
        subtitle: 'Latest updates and editorial dispatches across the ecosystem',
        category: '',
        limit: 4,
        viewAllText: 'View All',
        viewAllUrl: '/latest'
      };
    } else if (sectionType === 'trending') {
      initialData = {
        title: 'Trending Now',
        heading: 'Trending Now',
        subtitle: 'High-velocity stories capturing builder attention',
        limit: 8,
        viewAllUrl: '/trending'
      };
    } else if (sectionType === 'spotlight') {
      initialData = {
        title: 'Tech & Startup Spotlight',
        heading: 'Tech & Startup Spotlight',
        subtitle: 'Deep tech, generative AI, and emerging ventures',
        category: 'Technology',
        badgeText: 'DEEPTECH FOCUS',
        limit: 8,
        viewAllUrl: '/category/technology'
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
    } else if (sectionType === 'features') {
      initialData = {
        title: 'Key Platform Features',
        heading: 'Key Platform Features',
        subtitle: 'Discover what makes our journalism and reporting unique',
        badge: 'KEY CAPABILITIES',
        items: [
          { title: 'Unfiltered Access', description: 'Direct conversations with founders and operators.', icon: 'Zap' },
          { title: 'Capital Intelligence', description: 'Term sheets, valuations, and market movements.', icon: 'Award' },
          { title: 'Deep Tech Teardowns', description: 'Technical analysis on AI, chips, and cloud infrastructure.', icon: 'Layers' }
        ]
      };
    } else if (sectionType === 'stats') {
      initialData = {
        title: 'Our Impact in Numbers',
        heading: 'Our Impact in Numbers',
        subtitle: 'Trusted by founders, angel networks, and venture funds globally',
        items: [
          { number: '500K+', label: 'Monthly Readers', meta: 'Founders & Engineers' },
          { number: '1,200+', label: 'Stories Published', meta: 'In-depth coverage' },
          { number: '85+', label: 'Unicorns Covered', meta: 'Across Bharat & Global' },
          { number: '$2.5B+', label: 'Funding Tracked', meta: 'Venture Capital deals' }
        ]
      };
    } else if (sectionType === 'brands') {
      initialData = {
        title: 'Featured Across Leading Portals & Partners',
        heading: 'Featured Across Leading Portals & Partners',
        items: [
          { name: 'TechSparks', label: 'TechSparks' },
          { name: 'Startup Bharat', label: 'Startup Bharat' },
          { name: 'FoundersHub', label: 'FoundersHub' },
          { name: 'CapTable Daily', label: 'CapTable Daily' }
        ]
      };
    } else if (sectionType === 'image_text') {
      initialData = {
        heading: 'Built for the Next Generation of Builders',
        description: 'Comprehensive reporting that cuts through the noise. Get actionable frameworks and genuine stories.',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80',
        imagePosition: 'left',
        buttonText: 'Read More',
        buttonUrl: '/about',
        badge: 'MISSION & VALUES'
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
    } else if (sectionType === 'services') {
      initialData = {
        title: 'Specialized Capabilities & Newsroom Desks',
        heading: 'Specialized Capabilities & Newsroom Desks',
        subtitle: 'In-depth coverage spanning seed stage to public listing',
        badge: 'OUR BEATS',
        items: [
          { title: 'Venture Capital & Deals', description: 'Real-time intelligence on fundings, valuations, and term sheets.', icon: 'Zap' },
          { title: 'DeepTech & Generative AI', description: 'Technical tear-downs and market analysis on frontier innovation.', icon: 'Award' },
          { title: 'Global Enterprise & SaaS', description: 'Cross-border SaaS scaling playbooks and market penetration.', icon: 'Globe' }
        ]
      };
    } else if (sectionType === 'portfolio') {
      initialData = {
        title: 'Featured Case Studies & High-Impact Stories',
        heading: 'Featured Case Studies & High-Impact Stories',
        subtitle: 'Explore our deepest investigative journalism and brand spotlights',
        items: [
          {
            title: 'From Seed to Decacorn: The Playbook',
            category: 'Deep Dive',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
            description: 'How three Bangalore founders built a $10B enterprise engine.',
            link: '/stories'
          },
          {
            title: 'The AI Silicon Revolution',
            category: 'Hardware & AI',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
            description: 'Why fabless chip startups are raising record seed rounds in India.',
            link: '/stories'
          }
        ]
      };
    } else if (sectionType === 'testimonials') {
      initialData = {
        title: 'Trusted by Visionary Founders & Operators',
        heading: 'Trusted by Visionary Founders & Operators',
        subtitle: 'What ecosystem leaders say about our coverage and reporting',
        items: [
          {
            name: 'Pooja Sharma',
            role: 'Founder & CEO, ScaleStack',
            quote: 'GoReadPost has become the definitive morning read for our entire engineering and leadership team.',
            rating: 5,
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80'
          },
          {
            name: 'Rohan Mehta',
            role: 'General Partner, Alpha Capital',
            quote: 'Uncompromising editorial rigor, speed, and genuine market insight.',
            rating: 5,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
          }
        ]
      };
    } else if (sectionType === 'faq') {
      initialData = {
        title: 'Frequently Asked Questions',
        heading: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about our platform, syndicate access, and editorial guidelines',
        items: [
          {
            question: 'How often are stories and breaking news published?',
            answer: 'Our editorial desk updates continuously throughout the day with breaking news dispatches, deep investigative features, and market analysis.'
          },
          {
            question: 'Can founders submit stories or press releases?',
            answer: 'Yes! Founders and PR representatives can submit announcements directly through our Submit Story portal for editorial review.'
          },
          {
            question: 'How do I subscribe to the GoReadPost daily digest?',
            answer: 'Use the newsletter subscription box above or in our footer to receive our curated morning briefs straight to your inbox.'
          }
        ]
      };
    } else if (sectionType === 'cta') {
      initialData = {
        title: 'Amplify Your Story With GoReadPost',
        heading: 'Amplify Your Story With GoReadPost',
        description: 'Join over 500,000 monthly readers discovering the builders shaping the next economic era.',
        primaryBtnText: 'Explore Membership',
        primaryBtnUrl: '/contact',
        secondaryBtnText: 'Submit Press Release',
        secondaryBtnUrl: '/submit'
      };
    } else if (sectionType === 'contact') {
      initialData = {
        title: 'Get in Touch with our Editorial Bureau',
        heading: 'Get in Touch with our Editorial Bureau',
        subtitle: 'Have a breaking tip, partnership proposal, or feedback? We want to hear from you.',
        email: 'newsroom@goreadpost.com',
        phone: '+91 (080) 4123-5678',
        address: '100ft Road, Indiranagar, Bengaluru, Karnataka 560038'
      };
    } else if (sectionType === 'text') {
      initialData = {
        title: 'About GoReadPost Media',
        heading: 'About GoReadPost Media',
        badge: 'OUR MISSION',
        content: '<p>GoReadPost is India’s premier digital news and storytelling platform dedicated to championing entrepreneurs, innovators, and changemakers. From ground-up grassroots movements to multi-billion dollar tech unicorns, we chronicle the journey of building the future.</p>'
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
      const targetStatus = publishOverride || status;
      const targetSlug = pageId === 'home' || page?.id === 'home' ? '' : slug.trim();
      await persistSections(sections, null, targetStatus);
      onShowToast?.(
        publishOverride === 'published'
          ? (pageId === 'home' || !targetSlug ? 'Homepage is now published live!' : `Page "/${targetSlug}" is now published live!`)
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

  // Handlers for Dedicated Full-Page Live Studio
  const handleOpenLiveEditor = (sec) => {
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
      const targetSlug = pageId === 'home' || page?.id === 'home' ? '' : (slug || page?.slug || '').trim();
      const payload = {
        title: (title || page?.title || (pageId === 'home' ? 'Homepage - Live Portal' : 'Custom Page')).trim(),
        slug: targetSlug,
        description: (description || page?.description || '').trim(),
        status: status || page?.status || 'published',
        seo: {
          title: (seo?.title || page?.seo?.title || '').trim() || `${title || page?.title || 'Page'} | GoReadPost`,
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
      const targetSlug = pageId === 'home' || page?.id === 'home' ? '' : (slug || page?.slug || '').trim();
      const payload = {
        title: (title || page?.title || (pageId === 'home' ? 'Homepage - Live Portal' : 'Custom Page')).trim(),
        slug: targetSlug,
        description: (description || page?.description || '').trim(),
        status: status || page?.status || 'published',
        seo: {
          title: (seo?.title || page?.seo?.title || '').trim() || `${title || page?.title || 'Page'} | GoReadPost`,
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

  const isLive = status === 'published' || status === 'active';

  return (
    <div className="admin-view-container">
      {/* Segmented Editor Tabs */}
      <div className="admin-segmented-tabs-bar">
        <button
          type="button"
          className={`admin-nav-tab-item ${activeTab === 'sections' ? 'active' : ''}`}
          onClick={() => setActiveTab('sections')}
        >
          <Layers size={16} />
          <span>Page Sections Builder</span>
          <span className="tab-counter-badge">{sections.length}</span>
        </button>

        <button
          type="button"
          className={`admin-nav-tab-item ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          <Globe size={16} />
          <span>Page Info & SEO Settings</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: SECTION-BASED PAGE BUILDER
         ======================================================== */}
      {activeTab === 'sections' && (
        <div className="section-builder-wrapper">
          <div className="section-builder-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>Page Sections Layout</h3>
              {saving ? (
                <span style={{ fontSize: '0.8rem', color: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 650, background: 'rgba(234, 88, 12, 0.1)', padding: '3px 9px', borderRadius: '6px' }}>
                  <RefreshCw size={12} className="spin-animate" /> Saving to database...
                </span>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 650, background: 'rgba(22, 163, 74, 0.1)', padding: '3px 9px', borderRadius: '6px' }}>
                  <CheckCircle2 size={13} /> Live Synced
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => {
                  if (pageId === 'home') {
                    handleOpenWholeHomeStudio();
                  } else if (sections.length > 0) {
                    handleOpenLiveEditor(sections[0]);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700
                }}
                title="Launch visual live studio for this page"
              >
                <Sparkles size={15} />
                <span>⚡ Live Studio</span>
              </button>

              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => handleSavePage('draft')}
                disabled={saving}
              >
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => handleSavePage('published')}
                disabled={saving}
              >
                <CheckCircle2 size={16} />
                <span>{isLive ? 'Update Published' : 'Publish Live'}</span>
              </button>
            </div>
          </div>

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
                  label: sec.type.toUpperCase()
                };
                const isEnabled = sec.enabled !== false;
                const secKey = sec.id ? sec.id.replace(/^sec_/, '') : '';
                const canon = CANONICAL_SECTION_META[sec.id] || CANONICAL_SECTION_META[secKey] || CANONICAL_SECTION_META[sec.type];

                const badgeText = canon?.badge || def.label?.toUpperCase() || sec.type.toUpperCase();
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
                      <button
                        type="button"
                        className="reorder-btn"
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, 'up')}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <span className="section-order-num">{idx + 1}</span>
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

                    {/* Section Actions */}
                    <div className="section-card-actions">
                      <button
                        type="button"
                        className="btn-section-action"
                        onClick={() => handleToggleSectionEnabled(sec.id)}
                        title={isEnabled ? 'Disable Section' : 'Enable Section'}
                      >
                        {isEnabled ? <Eye size={15} /> : <EyeOff size={15} color="var(--text-muted)" />}
                        <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      {/* Live Visual WYSIWYG Editor Button (Opens in dedicated page view) */}
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

                      {/* Quick Open in New Tab Button */}
                      <a
                        href={`/admin/pages/${pageId}/edit?liveSection=${encodeURIComponent(sec.id || sec._id || sec.type)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-section-action new-tab"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#cbd5e1',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          padding: '6px 9px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                        title="Open Live Editor in New Browser Tab"
                      >
                        <ExternalLink size={14} />
                      </a>

                      <button
                        type="button"
                        className="btn-section-action delete"
                        onClick={() => handleDeleteSection(sec.id)}
                        disabled={saving}
                        title="Permanently delete section"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Add Section Button */}
          {sections.length > 0 && (
            <div className="add-section-footer-bar">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setIsAddSectionOpen(true)}
              >
                <Plus size={16} />
                <span>+ Add Another Section</span>
              </button>
            </div>
          )}
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
