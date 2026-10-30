import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Check, Sparkles, Plus, Trash2, 
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Monitor, Smartphone, Search, RefreshCw, Layers, Eye, EyeOff,
  Edit2, Edit3, Image as ImageIcon, Type, Play, Mail, Zap, Flame, LayoutGrid,
  ExternalLink, CheckCircle2, ChevronDown, Heart, Bookmark
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { PageService } from '../../services/pageService';
import { HomepageService } from '../../services/homepageService';
import { ALL_STORIES, TOP_PICKS, SPOTLIGHT_STORIES, LEAD_STORY } from '../../data/storiesData';
import { SECTION_DEFINITIONS } from './SectionEditorModal';
import './LiveHomepageStudio.css';
import './LiveSectionEditor.css';
import '../ModernHomepage.css';

// Helper to format an article as a Hero Carousel slide
const formatForHeroSlide = (article) => {
  const id = article._id || article.id || `slide-${Date.now()}`;
  const title = article.title || 'Featured Story';
  const excerpt = article.summary || article.excerpt || article.description || 
    (typeof article.content === 'string' ? article.content.slice(0, 160) : '') || 
    'Comprehensive reporting on innovation and founder journeys.';
  const category = article.categoryLabel || article.category || 'Startups';
  const image = article.image || article.coverImage || article.bannerImage || article.fallbackImage || 
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80';
  const authorName = typeof article.author === 'object' ? (article.author?.name || 'Editorial Bureau') : (article.author || 'Editorial Bureau');
  const authorAvatar = article.author?.avatar || article.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const date = article.publishedAt || article.date || article.formattedDate || 'Today';
  const readTime = article.readTime || (article.readingTime ? `${article.readingTime} min read` : '4 min read');
  const slug = article.slug || id;
  const link = `/stories/${slug}`;

  return {
    id,
    articleId: id,
    title,
    excerpt,
    category,
    image,
    author: authorName,
    authorAvatar,
    date,
    readTime,
    primaryBtnText: 'Read More',
    link,
    slug,
    isCustom: true
  };
};

// Helper to format an article for Popular Posts sidebar
const formatForPopularPost = (article) => {
  const id = article._id || article.id || `popular-${Date.now()}`;
  const title = article.title || 'Popular Story';
  const image = article.image || article.coverImage || article.fallbackImage || 
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80';
  const readTime = article.readTime || (article.readingTime ? `${article.readingTime} min read` : '3 min read');
  const category = article.categoryLabel || article.category || 'Trending';
  const slug = article.slug || id;
  const link = `/stories/${slug}`;
  const author = article.author;
  const date = article.publishedAt || article.date || 'Today';

  return {
    id,
    _id: article._id || id,
    title,
    image,
    coverImage: image,
    readTime,
    category,
    slug,
    link,
    author,
    date
  };
};

export default function LiveHomepageStudio({
  isOpen,
  onClose,
  initialSections = null,
  onSaveSuccess = null,
  stories = []
}) {
  if (!isOpen) return null;

  const [sections, setSections] = useState([]);
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'mobile'
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [availableArticles, setAvailableArticles] = useState(() => (stories.length > 0 ? stories : ALL_STORIES));
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);

  // Article Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // { sectionId, type: 'feed-add'|'feed-replace'|'hero-add'|'hero-replace'|'popular-add'|'popular-replace', index?: number }
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  // Section Quick Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Slide Edit Modal State
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [slideFormData, setSlideFormData] = useState({});

  // Add Section Modal State
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState(null);

  const sectionRefs = useRef({});

  // Load sections from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        if (initialSections && Array.isArray(initialSections) && initialSections.length > 0) {
          if (isMounted) setSections(initialSections);
          return;
        }

        const page = await PageService.getPageById('home');
        if (page && Array.isArray(page.sections) && page.sections.length > 0) {
          if (isMounted) setSections(page.sections);
        } else {
          // Fallback to default 6 homepage sections
          if (isMounted) {
            setSections([
              { id: 'hero_popular', type: 'hero', title: 'Lead Stories & Popular Posts', enabled: true, order: 1, data: {} },
              { id: 'latest_blogs', type: 'stories_feed', title: 'Latest from the Blog', enabled: true, order: 2, data: {} },
              { id: 'trending', type: 'trending', title: 'Trending Now', enabled: true, order: 3, data: {} },
              { id: 'popular_editors', type: 'stories_feed', title: "Most Popular & Editor's Picks", enabled: true, order: 4, data: {} },
              { id: 'spotlight', type: 'spotlight', title: 'Tech & Startup Spotlight', enabled: true, order: 5, data: {} }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load homepage data for Live Studio:', err);
      }
    };

    loadHomeData();

    // Also fetch live articles from backend
    ArticleService.getArticles({ limit: 150 }).then(res => {
      if (isMounted && res?.data && res.data.length > 0) {
        setAvailableArticles(res.data);
      }
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [initialSections]);

  const pool = useMemo(() => {
    const combined = [...availableArticles];
    const seen = new Set(
      combined.map(a => String(a.slug || a.id || a._id || a.title || '').trim().toLowerCase())
    );

    const fallbackList = [...(stories || []), ...ALL_STORIES];
    for (const item of fallbackList) {
      const key = String(item.slug || item.id || item._id || item.title || '').trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }
    return combined;
  }, [availableArticles, stories]);

  // Filtered articles in Picker
  const filteredPickerArticles = useMemo(() => {
    return pool.filter(a => {
      const title = (a.title || '').toLowerCase();
      const cat = (a.categoryLabel || a.category || '').toLowerCase();
      const author = (typeof a.author === 'object' && a.author ? a.author.name || '' : (a.author || '')).toLowerCase();
      const q = pickerSearch.trim().toLowerCase();

      const matchesSearch = !q || title.includes(q) || cat.includes(q) || author.includes(q);
      const matchesCat = pickerCategory === 'All' || cat.includes(pickerCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [pool, pickerSearch, pickerCategory]);

  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    pool.forEach(a => {
      const c = a.categoryLabel || a.category;
      if (c && typeof c === 'string') cats.add(c.trim());
    });
    return Array.from(cats).slice(0, 10);
  }, [pool]);

  // ─────────────────────────────────────────────────────────
  // INSTANT AUTO-SAVE PERSISTENCE TO DATABASE
  // ─────────────────────────────────────────────────────────
  const persistHomepageToDatabase = async (nextSections) => {
    const sectionsToSave = nextSections || sections;
    setSections(sectionsToSave);
    setSaveStatus('saving');

    try {
      const payload = {
        title: 'Homepage',
        slug: '',
        description: 'Comprehensive reporting on technology, startups, AI, and business.',
        status: 'published',
        sections: sectionsToSave
      };

      await PageService.updatePage('home', payload);
      try {
        await HomepageService.updateSections(sectionsToSave);
      } catch (e) {}

      // Notify any active views on the page
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('homepage:change', { detail: sectionsToSave }));
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
      onSaveSuccess?.(sectionsToSave);
    } catch (err) {
      console.error('Failed to auto-save homepage:', err);
      setSaveStatus('error');
    }
  };

  // ─────────────────────────────────────────────────────────
  // SECTION REORDERING, VISIBILITY & DELETION
  // ─────────────────────────────────────────────────────────
  const handleMoveSection = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const next = [...sections];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);

    const updated = next.map((s, i) => ({ ...s, order: i + 1 }));
    persistHomepageToDatabase(updated);
  };

  const handleToggleSectionEnabled = (secId) => {
    const next = sections.map(s => {
      if (s.id === secId) {
        return { ...s, enabled: s.enabled === false ? true : false };
      }
      return s;
    });
    persistHomepageToDatabase(next);
  };

  const handleDeleteSection = (secId) => {
    if (!window.confirm('Are you sure you want to remove this section from the homepage?')) return;
    const next = sections.filter(s => s.id !== secId).map((s, i) => ({ ...s, order: i + 1 }));
    persistHomepageToDatabase(next);
  };

  // ─────────────────────────────────────────────────────────
  // HERO SLIDER CURATION & CONTROLS
  // ─────────────────────────────────────────────────────────
  const heroSection = useMemo(() => {
    return sections.find(s => s.type === 'hero' || s.type === 'hero_popular' || s.id === 'hero_popular' || (s.type || '').toLowerCase().includes('hero')) || sections[0];
  }, [sections]);

  const heroSlides = useMemo(() => {
    const data = heroSection?.data || {};
    if (Array.isArray(data.slides) && data.slides.length > 0) {
      return data.slides;
    }
    return pool.slice(0, 5).map(formatForHeroSlide);
  }, [heroSection, pool]);

  const activeSlide = heroSlides[heroSlideIdx] || heroSlides[0] || LEAD_STORY;

  const handleUpdateHeroData = (patch) => {
    const next = sections.map(s => {
      if (s.id === heroSection?.id) {
        return { ...s, data: { ...s.data, ...patch } };
      }
      return s;
    });
    persistHomepageToDatabase(next);
  };

  const handleMoveHeroSlide = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return;

    const nextSlides = [...heroSlides];
    const [moved] = nextSlides.splice(idx, 1);
    nextSlides.splice(targetIdx, 0, moved);

    setHeroSlideIdx(targetIdx);
    handleUpdateHeroData({ slides: nextSlides });
  };

  const handleDeleteHeroSlide = (idx, e) => {
    e?.stopPropagation();
    if (heroSlides.length <= 1) return;
    const nextSlides = heroSlides.filter((_, i) => i !== idx);
    const newIdx = Math.max(0, Math.min(heroSlideIdx, nextSlides.length - 1));
    setHeroSlideIdx(newIdx);
    handleUpdateHeroData({ slides: nextSlides });
  };

  // Popular posts curation
  const popularArticles = useMemo(() => {
    const data = heroSection?.data || {};
    if (Array.isArray(data.popularArticles) && data.popularArticles.length > 0) {
      return data.popularArticles.slice(0, 5);
    }
    const trending = pool.filter(s => s.isTrending || s.trending || s.tag === 'POPULAR' || s.tag === 'TRENDING');
    if (trending.length >= 5) return trending.slice(0, 5).map(formatForPopularPost);
    return pool.slice(0, 5).map(formatForPopularPost);
  }, [heroSection, pool]);

  const handleMovePopular = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= popularArticles.length) return;

    const nextPop = [...popularArticles];
    const [moved] = nextPop.splice(idx, 1);
    nextPop.splice(targetIdx, 0, moved);

    handleUpdateHeroData({ popularArticles: nextPop });
  };

  const handleDeletePopular = (idx) => {
    const nextPop = popularArticles.filter((_, i) => i !== idx);
    handleUpdateHeroData({ popularArticles: nextPop });
  };

  // ─────────────────────────────────────────────────────────
  // FEED SECTIONS ARTICLE REORDERING & CURATION
  // ─────────────────────────────────────────────────────────
  const getSectionMaxFit = (sec) => {
    const isSpot = sec?.id === 'spotlight' || sec?.type === 'spotlight';
    const isTrend = sec?.id === 'trending' || sec?.type === 'trending';
    const rawLimit = Number(sec?.data?.limit || sec?.limit);
    if (isSpot) return (rawLimit > 0 && rawLimit !== 5) ? rawLimit : 8;
    if (isTrend) return rawLimit > 0 ? rawLimit : 8;
    return rawLimit > 0 ? rawLimit : 4;
  };

  const resolveSectionArticles = (sec) => {
    const data = sec?.data || {};
    const maxFit = getSectionMaxFit(sec);
    const cat = data.category || data.filterCategory;
    let source = pool;
    if (cat && cat.trim()) {
      const filtered = pool.filter(s => (s.category || s.categoryLabel || s.categoryName || '').toLowerCase().includes(cat.toLowerCase().trim()));
      if (filtered.length > 0) source = filtered;
    }
    const sorted = [...source].sort((a, b) => new Date(b.publishedAt || b.date || b.createdAt || 0) - new Date(a.publishedAt || a.date || a.createdAt || 0));

    if (Array.isArray(data.articles) && data.articles.length > 0) {
      return data.articles.filter(Boolean).slice(0, maxFit);
    }
    return sorted.slice(0, maxFit);
  };

  const handleAutoFillFeedSection = (secId) => {
    const sec = sections.find(s => s.id === secId);
    if (!sec) return;
    const maxFit = getSectionMaxFit(sec);
    const currentArticles = resolveSectionArticles(sec);
    if (currentArticles.length >= maxFit) return;

    const existingIds = new Set(currentArticles.map(a => String(a._id || a.id || a.slug)));
    const needed = maxFit - currentArticles.length;
    const additions = pool.filter(a => a && !existingIds.has(String(a._id || a.id || a.slug))).slice(0, needed);
    const nextArticles = [...currentArticles, ...additions];

    const nextSections = sections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          data: {
            ...s.data,
            articles: nextArticles,
            articleIds: nextArticles.map(a => a._id || a.id),
            hasCustomArticles: true
          }
        };
      }
      return s;
    });

    persistHomepageToDatabase(nextSections);
  };

  const handleMoveFeedArticle = (secId, idx, direction) => {
    const sec = sections.find(s => s.id === secId);
    if (!sec) return;
    const currentArticles = resolveSectionArticles(sec);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentArticles.length) return;

    const nextArticles = [...currentArticles];
    const [moved] = nextArticles.splice(idx, 1);
    nextArticles.splice(targetIdx, 0, moved);

    const nextSections = sections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          data: {
            ...s.data,
            articles: nextArticles,
            articleIds: nextArticles.map(a => a._id || a.id),
            hasCustomArticles: true
          }
        };
      }
      return s;
    });

    persistHomepageToDatabase(nextSections);
  };

  const handleRemoveFeedArticle = (secId, idx) => {
    const sec = sections.find(s => s.id === secId);
    if (!sec) return;
    const currentArticles = resolveSectionArticles(sec);
    const nextArticles = currentArticles.filter((_, i) => i !== idx);

    const nextSections = sections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          data: {
            ...s.data,
            articles: nextArticles,
            articleIds: nextArticles.map(a => a._id || a.id),
            hasCustomArticles: true
          }
        };
      }
      return s;
    });

    persistHomepageToDatabase(nextSections);
  };

  // ─────────────────────────────────────────────────────────
  // ARTICLE PICKER HANDLER
  // ─────────────────────────────────────────────────────────
  const handleOpenPicker = (target) => {
    setPickerTarget(target);
    setPickerSearch('');
    setPickerCategory('All');
    setIsPickerOpen(true);
  };

  const handleSelectPickerArticle = (article) => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'hero-add') {
      const newSlide = formatForHeroSlide(article);
      const nextSlides = [...heroSlides, newSlide];
      setHeroSlideIdx(nextSlides.length - 1);
      handleUpdateHeroData({ slides: nextSlides });
    } else if (pickerTarget.type === 'hero-replace') {
      const targetIdx = pickerTarget.index ?? heroSlideIdx;
      const nextSlides = [...heroSlides];
      nextSlides[targetIdx] = formatForHeroSlide(article);
      handleUpdateHeroData({ slides: nextSlides });
    } else if (pickerTarget.type === 'popular-add') {
      if (popularArticles.length >= 5) {
        setIsPickerOpen(false);
        return;
      }
      const newPop = formatForPopularPost(article);
      const nextPop = [...popularArticles, newPop].slice(0, 5);
      handleUpdateHeroData({ popularArticles: nextPop });
    } else if (pickerTarget.type === 'popular-replace') {
      const targetIdx = pickerTarget.index;
      const nextPop = [...popularArticles];
      nextPop[targetIdx] = formatForPopularPost(article);
      handleUpdateHeroData({ popularArticles: nextPop });
    } else if (pickerTarget.type === 'feed-add') {
      const sec = sections.find(s => s.id === pickerTarget.sectionId);
      if (sec) {
        const maxFit = getSectionMaxFit(sec);
        const currentArticles = resolveSectionArticles(sec);
        if (currentArticles.length >= maxFit) {
          setIsPickerOpen(false);
          return;
        }
        const nextArticles = [...currentArticles, article].slice(0, maxFit);
        const nextSections = sections.map(s => {
          if (s.id === pickerTarget.sectionId) {
            return {
              ...s,
              data: {
                ...s.data,
                articles: nextArticles,
                articleIds: nextArticles.map(a => a._id || a.id),
                hasCustomArticles: true
              }
            };
          }
          return s;
        });
        persistHomepageToDatabase(nextSections);
      }
    } else if (pickerTarget.type === 'feed-replace') {
      const sec = sections.find(s => s.id === pickerTarget.sectionId);
      if (sec) {
        const currentArticles = resolveSectionArticles(sec);
        const nextArticles = [...currentArticles];
        nextArticles[pickerTarget.index] = article;
        const nextSections = sections.map(s => {
          if (s.id === pickerTarget.sectionId) {
            return {
              ...s,
              data: {
                ...s.data,
                articles: nextArticles,
                articleIds: nextArticles.map(a => a._id || a.id),
                hasCustomArticles: true
              }
            };
          }
          return s;
        });
        persistHomepageToDatabase(nextSections);
      }
    }

    setIsPickerOpen(false);
  };

  // ─────────────────────────────────────────────────────────
  // QUICK EDIT SECTION MODAL
  // ─────────────────────────────────────────────────────────
  const handleOpenEditSectionModal = (sec) => {
    setEditingSection(sec);
    setEditFormData({
      title: sec.data?.title || sec.title || '',
      subtitle: sec.data?.subtitle || sec.subtitle || '',
      badgeText: sec.data?.badgeText || '',
      category: sec.data?.category || '',
      limit: sec.data?.limit || 8,
      viewAllText: sec.data?.viewAllText || 'View All',
      viewAllUrl: sec.data?.viewAllUrl || '/latest',
      headline: sec.data?.headline || '',
      buttonText: sec.data?.buttonText || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditSectionModal = () => {
    if (!editingSection) return;
    const nextSections = sections.map(s => {
      if (s.id === editingSection.id) {
        return {
          ...s,
          title: editFormData.title || s.title,
          subtitle: editFormData.subtitle || s.subtitle,
          data: {
            ...s.data,
            ...editFormData
          }
        };
      }
      return s;
    });

    persistHomepageToDatabase(nextSections);
    setIsEditModalOpen(false);
  };

  // ─────────────────────────────────────────────────────────
  // QUICK EDIT SLIDE MODAL
  // ─────────────────────────────────────────────────────────
  const handleOpenSlideModal = (slide, idx) => {
    setSlideFormData({
      index: idx,
      title: slide.title || '',
      excerpt: slide.excerpt || slide.summary || '',
      category: slide.category || 'FEATURED',
      image: slide.image || '',
      primaryBtnText: slide.primaryBtnText || 'Read More',
      link: slide.link || '/latest'
    });
    setIsSlideModalOpen(true);
  };

  const handleSaveSlideModal = () => {
    const idx = slideFormData.index ?? heroSlideIdx;
    const nextSlides = [...heroSlides];
    nextSlides[idx] = {
      ...nextSlides[idx],
      ...slideFormData,
      isCustom: true
    };
    handleUpdateHeroData({ slides: nextSlides });
    setIsSlideModalOpen(false);
  };

  // ─────────────────────────────────────────────────────────
  // INSERT NEW SECTION
  // ─────────────────────────────────────────────────────────
  const handleInsertSection = (typeDef) => {
    const newId = `${typeDef.type}_${Date.now()}`;
    const newSection = {
      id: newId,
      type: typeDef.type,
      title: typeDef.label,
      enabled: true,
      order: (insertAtIndex !== null ? insertAtIndex + 1 : sections.length + 1),
      data: {
        title: typeDef.label,
        subtitle: `Curated ${typeDef.label} on GoReadPost`,
        category: '',
        limit: 8
      }
    };

    const next = [...sections];
    if (insertAtIndex !== null && insertAtIndex >= 0) {
      next.splice(insertAtIndex + 1, 0, newSection);
    } else {
      next.push(newSection);
    }

    const updated = next.map((s, i) => ({ ...s, order: i + 1 }));
    persistHomepageToDatabase(updated);
    setIsAddSectionModalOpen(false);
    setInsertAtIndex(null);
  };

  const scrollToSection = (secId) => {
    const el = sectionRefs.current[secId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="lhs-overlay">
      {/* ── Studio Top Header Bar ── */}
      <header className="lhs-header">
        <div className="lhs-header-left">
          <div className="lhs-brand-title">
            <h2>
              <Sparkles size={18} color="#ea580c" />
              <span>GoReadPost Whole Homepage Live Studio</span>
            </h2>
            <span className="lhs-live-tag">
              <span className="lhs-live-dot" />
              LIVE CANVAS
            </span>
          </div>

          {/* Quick Jump Navigation */}
          <div className="lhs-section-nav" title="Quick Jump to Homepage Section">
            {sections.map(s => (
              <button
                key={s.id}
                type="button"
                className="lhs-nav-pill"
                onClick={() => scrollToSection(s.id)}
              >
                {s.title || s.type}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Center: Viewport Toggle */}
        <div className="lhs-device-toggle">
          <button
            type="button"
            className={`lhs-device-btn ${deviceView === 'desktop' ? 'active' : ''}`}
            onClick={() => setDeviceView('desktop')}
          >
            <Monitor size={14} />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            className={`lhs-device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
            onClick={() => setDeviceView('mobile')}
          >
            <Smartphone size={14} />
            <span>Mobile</span>
          </button>
        </div>

        {/* Studio Right: Save Status & Actions */}
        <div className="lhs-header-actions">
          {saveStatus === 'saving' && (
            <span className="lhs-save-indicator saving">
              <RefreshCw size={13} className="lhs-spin" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="lhs-save-indicator saved">
              <Check size={13} />
              <span>Saved permanently</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="lhs-save-indicator error">
              <X size={13} />
              <span>Save error</span>
            </span>
          )}

          <button
            type="button"
            className="lhs-btn-preview"
            onClick={() => window.open('/', '_blank')}
            title="Open live public homepage in new tab"
          >
            <ExternalLink size={14} />
            <span>View Public Site</span>
          </button>

          <button
            type="button"
            className="lhs-btn-cancel"
            onClick={onClose}
          >
            <X size={15} />
            <span>Exit Studio</span>
          </button>

          <button
            type="button"
            className="lhs-btn-save"
            onClick={() => {
              persistHomepageToDatabase();
              onClose();
            }}
          >
            <Check size={16} />
            <span>Apply &amp; Finish</span>
          </button>
        </div>
      </header>

      {/* ── Main Scrollable Canvas ── */}
      <main className="lhs-workspace">
        <div className={`lhs-canvas-wrapper ${deviceView === 'mobile' ? 'mobile-view' : ''}`}>
          
          {/* Tip Bar */}
          <div className="lhs-tip-bar">
            <div className="lhs-tip-text">
              <Sparkles size={16} color="#fbbf24" />
              <span>
                <strong>Whole Homepage Live Studio:</strong> Scroll down to edit every section in-place. Use <strong>↑ Move Section</strong> to reorder sections, and hover cards to reorder or replace stories!
              </span>
            </div>

            <button
              type="button"
              className="lse-toolbar-btn primary"
              onClick={() => {
                setInsertAtIndex(null);
                setIsAddSectionModalOpen(true);
              }}
            >
              <Plus size={14} />
              <span>+ Add Section to Homepage</span>
            </button>
          </div>

          {/* ── Real Homepage Content Canvas ── */}
          <div className="lhs-browser-frame">
            {/* Real Frontend Website Body */}
            <div className="lhs-real-frontend-sheet">
              {/* ── All Homepage Sections In Natural Flow ── */}
              <div className="mhp-container" style={{ padding: '1.5rem clamp(1rem, 2.5vw, 2.5rem) 3rem' }}>
                {sections.map((sec, idx) => {
                  const type = (sec.type || sec.id || '').toLowerCase();
                  const isHero = type.includes('hero');
                  const isNewsletter = type.includes('newsletter');
                  const isGridFeed = !isHero && !isNewsletter;
                  const maxFit = getSectionMaxFit(sec);
                  const secArticles = isGridFeed ? resolveSectionArticles(sec).slice(0, maxFit) : [];

                  return (
                    <div 
                      key={sec.id || idx} 
                      ref={el => sectionRefs.current[sec.id] = el}
                      className={`lhs-section-block ${sec.enabled === false ? 'disabled' : ''}`}
                    >
                      {/* Floating Section Control Bar */}
                      <div className="lhs-section-control-bar">
                        <div className="lhs-section-badge">
                          <span>#{idx + 1}</span>
                          <span>{sec.title || sec.type}</span>
                        </div>

                        <div className="lhs-section-tools">
                          <button
                            type="button"
                            className="lhs-sec-tool-btn"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, 'up')}
                            title="Move section higher on homepage"
                          >
                            <ArrowUp size={12} />
                            <span>Up</span>
                          </button>
                          <button
                            type="button"
                            className="lhs-sec-tool-btn"
                            disabled={idx === sections.length - 1}
                            onClick={() => handleMoveSection(idx, 'down')}
                            title="Move section lower on homepage"
                          >
                            <ArrowDown size={12} />
                            <span>Down</span>
                          </button>
                          <button
                            type="button"
                            className="lhs-sec-tool-btn"
                            onClick={() => handleToggleSectionEnabled(sec.id)}
                            title={sec.enabled === false ? 'Show Section' : 'Hide Section'}
                          >
                            {sec.enabled === false ? <EyeOff size={12} /> : <Eye size={12} />}
                            <span>{sec.enabled === false ? 'Hidden' : 'Visible'}</span>
                          </button>
                          <button
                            type="button"
                            className="lhs-sec-tool-btn primary"
                            onClick={() => handleOpenEditSectionModal(sec)}
                            title="Edit section headlines, category, and limit"
                          >
                            <Edit3 size={12} />
                            <span>Edit Settings</span>
                          </button>
                          {isGridFeed && (
                            <button
                              type="button"
                              className="lhs-sec-tool-btn"
                              style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}
                              onClick={() => handleOpenPicker({ sectionId: sec.id, type: 'feed-add' })}
                              title="Add article to this section"
                            >
                              <Plus size={12} />
                              <span>Add Story</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="lhs-sec-tool-btn danger"
                            onClick={() => handleDeleteSection(sec.id)}
                            title="Delete section from homepage"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* 1. HERO BANNER SECTION */}
                      {isHero && (
                        <section className="mhp-hero-popular-grid" style={{ marginTop: '0.75rem' }}>
                          {/* Left Hero Card */}
                          <div 
                            className="mhp-hero-card"
                            style={{ 
                              backgroundImage: `url(${activeSlide.image})`,
                              position: 'relative'
                            }}
                          >
                            <div className="mhp-hero-overlay" />

                            {/* Floating Hero Position Dock */}
                            <div className="lbe-hero-control-dock">
                              <span className="lbe-position-badge">
                                ★ HERO SLIDE #{heroSlideIdx + 1} OF {heroSlides.length}
                              </span>

                              <div className="lbe-dock-actions">
                                <button
                                  type="button"
                                  className="lbe-dock-btn"
                                  disabled={heroSlideIdx === 0}
                                  onClick={() => handleMoveHeroSlide(heroSlideIdx, 'up')}
                                  title="Move earlier"
                                >
                                  <ArrowLeft size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="lbe-dock-btn"
                                  disabled={heroSlideIdx === heroSlides.length - 1}
                                  onClick={() => handleMoveHeroSlide(heroSlideIdx, 'down')}
                                  title="Move later"
                                >
                                  <ArrowRight size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="lbe-dock-btn"
                                  style={{ background: 'rgba(234, 88, 12, 0.25)', color: '#fb923c' }}
                                  onClick={() => handleOpenSlideModal(activeSlide, heroSlideIdx)}
                                  title="Edit slide text and photo"
                                >
                                  <Edit3 size={13} />
                                  <span>Edit Slide</span>
                                </button>
                                <button
                                  type="button"
                                  className="lbe-dock-btn"
                                  onClick={() => handleOpenPicker({ type: 'hero-replace', index: heroSlideIdx })}
                                  title="Replace with existing article"
                                >
                                  <RefreshCw size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="lbe-dock-btn"
                                  style={{ background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80' }}
                                  onClick={() => handleOpenPicker({ type: 'hero-add' })}
                                  title="Add new slide from articles"
                                >
                                  <Plus size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="lbe-dock-btn danger"
                                  disabled={heroSlides.length <= 1}
                                  onClick={(e) => handleDeleteHeroSlide(heroSlideIdx, e)}
                                  title="Delete slide"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="mhp-hero-content">
                              <span className="mhp-badge">
                                {activeSlide.category || 'FEATURED'}
                              </span>
                              <h1 className="mhp-hero-title">
                                {activeSlide.title}
                              </h1>
                              <p className="mhp-hero-subtitle">
                                {activeSlide.excerpt}
                              </p>
                              <div className="mhp-hero-meta">
                                <img src={activeSlide.authorAvatar} alt="author" className="mhp-author-avatar" />
                                <span>{activeSlide.author}</span>
                                <span>•</span>
                                <span>{activeSlide.date}</span>
                                <span>•</span>
                                <span>{activeSlide.readTime}</span>
                              </div>
                            </div>

                            {/* Carousel Arrows */}
                            {heroSlides.length > 1 && (
                              <div className="mhp-hero-slider-nav">
                                <button
                                  type="button"
                                  className="mhp-slider-btn"
                                  onClick={() => setHeroSlideIdx(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="mhp-slider-btn"
                                  onClick={() => setHeroSlideIdx(prev => (prev + 1) % heroSlides.length)}
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Right Popular Sidebar */}
                          <div className="mhp-popular-card">
                            <div className="mhp-section-header" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Popular Posts</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  className="lbe-btn-add-mini article"
                                  onClick={() => handleOpenPicker({ type: 'popular-add', defaultTab: 'articles' })}
                                  title="Open All Articles popup to add an article to Popular Posts (Max 5)"
                                >
                                  <Plus size={12} strokeWidth={2.5} />
                                  <span>Article</span>
                                </button>
                                <button
                                  type="button"
                                  className="lbe-btn-add-mini video"
                                  onClick={() => handleOpenPicker({ type: 'popular-add', defaultTab: 'videos' })}
                                  title="Open All Videos popup to add a video to Popular Posts (Max 5)"
                                >
                                  <Play size={9} fill="currentColor" />
                                  <span>Video</span>
                                </button>
                              </div>
                            </div>

                            <div className="mhp-popular-list">
                              {popularArticles.map((pop, pIdx) => (
                                <div key={pop.id || pIdx} className="mhp-popular-item lbe-item-row" style={{ position: 'relative' }}>
                                  <span className="mhp-popular-rank" style={{ color: pIdx === 0 ? '#ef4444' : '#64748b' }}>
                                    #{pIdx + 1}
                                  </span>
                                  <img src={pop.image} alt={pop.title} className="mhp-popular-thumb" />
                                  <div className="mhp-popular-info">
                                    <h4 className="mhp-popular-title">{pop.title}</h4>
                                    <span className="mhp-popular-meta">{pop.category} • {pop.readTime}</span>
                                  </div>

                                  <div className="lbe-item-reorder-group">
                                    <button
                                      type="button"
                                      className="lbe-reorder-btn"
                                      disabled={pIdx === 0}
                                      onClick={() => handleMovePopular(pIdx, 'up')}
                                      title="Move Up"
                                    >
                                      <ArrowUp size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      className="lbe-reorder-btn"
                                      disabled={pIdx === popularArticles.length - 1}
                                      onClick={() => handleMovePopular(pIdx, 'down')}
                                      title="Move Down"
                                    >
                                      <ArrowDown size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      className="lbe-reorder-btn danger"
                                      onClick={() => handleDeletePopular(pIdx)}
                                      title="Remove from Popular"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
                      )}

                      {/* 2. ARTICLE FEED SECTIONS (Latest Blogs, Spotlight, Trending, Popular Editors) */}
                      {isGridFeed && (
                        <section className="mhp-content-section" style={{ margin: 0, padding: 0 }}>
                          <div className="mhp-section-header" style={{ marginBottom: '1.25rem' }}>
                            <div className="mhp-section-header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div 
                                className="mhp-section-title-wrap lse-inline-edit-hint"
                                onClick={() => handleOpenEditSectionModal(sec)}
                                title="Click to edit section title"
                              >
                                <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                                  {sec.data?.title || sec.title}
                                </span>
                              </div>
                              {sec.data?.badgeText && (
                                <span className="mhp-editor-pick-pill">
                                  <Sparkles size={12} fill="#ffffff" color="#ffffff" />
                                  {sec.data.badgeText}
                                </span>
                              )}
                            </div>

                            <span 
                              className="mhp-view-all-link lse-inline-edit-hint"
                              onClick={() => handleOpenEditSectionModal(sec)}
                              title="Click to edit View All link"
                              style={{ color: '#ea580c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              {sec.data?.viewAllText || 'View All'} <ArrowRight size={14} />
                            </span>
                          </div>

                          {/* 4-Column Card Grid */}
                          <div className="mhp-blog-cards-grid">
                            {secArticles.map((art, aIdx) => {
                              const artId = art.id || art._id || `card-${aIdx}`;
                              const artTitle = art.title || 'Featured Story';
                              const artImg = art.image || art.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
                              const artCat = art.categoryLabel || art.category || 'News';
                              const artAuthor = typeof art.author === 'object' ? art.author?.name : (art.author || 'Editorial Bureau');
                              const artDate = art.publishedAt || art.date || 'Today';

                              return (
                                <article 
                                  key={artId} 
                                  className="mhp-blog-card lse-hover-item"
                                  style={{ 
                                    position: 'relative',
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: aIdx < (sec.limit || 8) ? '2px solid #ea580c' : '1px solid #e2e8f0',
                                    boxShadow: aIdx < (sec.limit || 8) ? '0 6px 20px rgba(234, 88, 12, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.25s ease'
                                  }}
                                >
                                  <div 
                                    className="mhp-blog-thumb-wrap"
                                    style={{ 
                                      position: 'relative', 
                                      width: '100%', 
                                      height: '210px', 
                                      overflow: 'hidden', 
                                      background: '#0f172a'
                                    }}
                                  >
                                    <img 
                                      src={artImg} 
                                      alt={artTitle} 
                                      className="mhp-blog-thumb"
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80';
                                      }}
                                    />

                                    {/* Top & Bottom Legibility Gradient Overlay */}
                                    <div 
                                      style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0) 38%, rgba(15, 23, 42, 0.82) 100%)',
                                        pointerEvents: 'none'
                                      }}
                                    />

                                    {/* Position Indicator Badge */}
                                    <div 
                                      style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        zIndex: 10,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: aIdx < (sec.limit || 8) ? 'rgba(15, 23, 42, 0.94)' : 'rgba(15, 23, 42, 0.82)',
                                        backdropFilter: 'blur(8px)',
                                        border: aIdx < (sec.limit || 8) ? '1.5px solid #ea580c' : '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '7px',
                                        padding: '4px 8px',
                                        color: '#ffffff',
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.45)'
                                      }}
                                      title={`Position #${aIdx + 1} in grid`}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <span style={{ color: aIdx < (sec.limit || 8) ? '#fb923c' : '#cbd5e1' }}>#{aIdx + 1}</span>
                                      {aIdx < (sec.limit || 8) && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '0.64rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                                          LIVE
                                        </span>
                                      )}
                                    </div>

                                    {/* Floating Reorder & Replace Dock */}
                                    <div 
                                      style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        zIndex: 10,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        background: 'rgba(15, 23, 42, 0.94)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        padding: '3px 4px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)'
                                      }}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        disabled={aIdx === 0}
                                        onClick={() => handleMoveFeedArticle(sec.id, aIdx, 'up')}
                                        title="Move earlier (to left)"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '5px',
                                          border: '1px solid rgba(255, 255, 255, 0.12)',
                                          background: 'rgba(255, 255, 255, 0.08)',
                                          color: '#ffffff',
                                          cursor: aIdx === 0 ? 'not-allowed' : 'pointer',
                                          opacity: aIdx === 0 ? 0.35 : 1,
                                          padding: 0
                                        }}
                                      >
                                        <ArrowLeft size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={aIdx === secArticles.length - 1}
                                        onClick={() => handleMoveFeedArticle(sec.id, aIdx, 'down')}
                                        title="Move later (to right)"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '5px',
                                          border: '1px solid rgba(255, 255, 255, 0.12)',
                                          background: 'rgba(255, 255, 255, 0.08)',
                                          color: '#ffffff',
                                          cursor: aIdx === secArticles.length - 1 ? 'not-allowed' : 'pointer',
                                          opacity: aIdx === secArticles.length - 1 ? 0.35 : 1,
                                          padding: 0
                                        }}
                                      >
                                        <ArrowRight size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenPicker({ sectionId: sec.id, type: 'feed-replace', index: aIdx })}
                                        title="Replace this article"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '5px',
                                          border: '1px solid rgba(255, 255, 255, 0.12)',
                                          background: 'rgba(255, 255, 255, 0.08)',
                                          color: '#ffffff',
                                          cursor: 'pointer',
                                          padding: 0
                                        }}
                                      >
                                        <RefreshCw size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFeedArticle(sec.id, aIdx)}
                                        title="Delete article permanently"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '5px',
                                          border: '1px solid rgba(239, 68, 68, 0.4)',
                                          background: 'rgba(239, 68, 68, 0.25)',
                                          color: '#fca5a5',
                                          cursor: 'pointer',
                                          padding: 0
                                        }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>

                                    <span 
                                      style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        left: '10px',
                                        zIndex: 10,
                                        background: '#0f172a',
                                        color: '#ffffff',
                                        fontSize: '0.68rem',
                                        fontWeight: 850,
                                        letterSpacing: '0.06em',
                                        padding: '4px 9px',
                                        borderRadius: '5px',
                                        textTransform: 'uppercase',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                                      }}
                                    >
                                      {artCat}
                                    </span>
                                  </div>

                                  <div className="mhp-blog-body">
                                    <div className="mhp-blog-author-row">
                                      <span className="mhp-blog-author-name">{artAuthor}</span>
                                      <span className="mhp-meta-sep">•</span>
                                      <span>{artDate}</span>
                                    </div>
                                    <h3 className="mhp-blog-card-title">{artTitle}</h3>
                                    <div className="mhp-blog-footer-row">
                                      <span className="mhp-blog-readmore-btn">
                                        <span>READ MORE</span>
                                        <ArrowRight size={13} className="readmore-arrow" />
                                      </span>
                                      <div className="mhp-blog-footer-actions">
                                        <span className="mhp-blog-footer-like-btn">
                                          <Heart size={14} className="mhp-like-icon" />
                                          <span className="mhp-like-count">{art.claps || art.likes || 14}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              );
                            })}

                            {/* + Plus Add Article Card (Only shown if below max fit capacity) */}
                            {secArticles.length < maxFit ? (
                              <div 
                                className="mhp-blog-card lse-add-article-card"
                                onClick={() => handleOpenPicker({ sectionId: sec.id, type: 'feed-add' })}
                                role="button"
                                tabIndex={0}
                                title={`Add an article to slot #${secArticles.length + 1} of ${maxFit}`}
                                style={{
                                  position: 'relative',
                                  minHeight: '380px',
                                  background: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)',
                                  border: '2px dashed #ea580c',
                                  borderRadius: '16px',
                                  boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '2rem 1.5rem',
                                  textAlign: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: '#ffedd5',
                                    color: '#c2410c',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    marginBottom: '1rem'
                                  }}
                                >
                                  <span>Slot #{secArticles.length + 1} of {maxFit} Max</span>
                                </div>

                                <div
                                  className="lse-add-plus-badge"
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 22px rgba(234, 88, 12, 0.35)',
                                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    marginBottom: '1rem'
                                  }}
                                >
                                  <Plus size={30} strokeWidth={2.6} />
                                </div>

                                <h4
                                  style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    color: '#0f172a',
                                    margin: '0 0 0.4rem',
                                    letterSpacing: '-0.01em'
                                  }}
                                >
                                  + Add Article Card
                                </h4>

                                <p
                                  style={{
                                    fontSize: '0.82rem',
                                    color: '#64748b',
                                    margin: '0 0 1rem',
                                    lineHeight: 1.45,
                                    maxWidth: '220px'
                                  }}
                                >
                                  {maxFit - secArticles.length} more card{maxFit - secArticles.length === 1 ? '' : 's'} fit in this homepage section
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '210px' }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      padding: '8px 16px',
                                      borderRadius: '9999px',
                                      background: '#ea580c',
                                      color: '#ffffff',
                                      fontWeight: 750,
                                      fontSize: '0.82rem',
                                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                                    }}
                                  >
                                    <Plus size={15} /> Select Article
                                  </span>

                                  {pool.length > secArticles.length && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAutoFillFeedSection(sec.id);
                                      }}
                                      title="Auto-fill the remaining slots to complete the frontend grid"
                                      style={{
                                        background: 'transparent',
                                        border: '1.5px solid #fdba74',
                                        borderRadius: '9999px',
                                        padding: '6px 12px',
                                        color: '#ea580c',
                                        fontSize: '0.74rem',
                                        fontWeight: 750,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '5px',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      <Sparkles size={12} />
                                      <span>Auto-fill to Max ({maxFit})</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : null}

                            {/* Full Capacity Indicator for Homepage Section */}
                            {secArticles.length >= maxFit && (
                              <div
                                style={{
                                  gridColumn: '1 / -1',
                                  marginTop: '0.5rem',
                                  padding: '12px 18px',
                                  borderRadius: '12px',
                                  background: 'rgba(34, 197, 94, 0.08)',
                                  border: '1.5px solid rgba(34, 197, 94, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  flexWrap: 'wrap'
                                }}
                              >
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  <CheckCircle2 size={17} color="#16a34a" />
                                  <span style={{ fontSize: '0.86rem', fontWeight: 750, color: '#15803d' }}>
                                    Section Full ({secArticles.length}/{maxFit} Articles) • Perfectly fills the row on the frontend homepage.
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  To replace or delete cards, use the action buttons on any card above.
                                </span>
                              </div>
                            )}
                          </div>
                        </section>
                      )}

                      {/* 3. NEWSLETTER BANNER SECTION */}
                      {isNewsletter && (
                        <section className="mhp-newsletter-section" style={{ margin: 0 }}>
                          <div className="mhp-newsletter-card">
                            <div className="mhp-newsletter-left">
                              <div className="mhp-newsletter-icon-wrap">
                                <Mail size={32} />
                              </div>
                              <div>
                                <h2 
                                  className="mhp-newsletter-title lse-inline-edit-hint"
                                  onClick={() => handleOpenEditSectionModal(sec)}
                                  title="Click to edit headline"
                                >
                                  {sec.data?.headline || sec.data?.title || 'Get the Latest Blogs Delivered to Your Inbox'}
                                </h2>
                                <p 
                                  className="lse-inline-edit-hint"
                                  onClick={() => handleOpenEditSectionModal(sec)}
                                  title="Click to edit subtitle"
                                  style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}
                                >
                                  {sec.data?.subtitle || 'Join 50,000+ founders and operators getting daily dispatches.'}
                                </p>
                              </div>
                            </div>

                            <div className="mhp-newsletter-form">
                              <input 
                                type="text"
                                disabled
                                placeholder={sec.data?.placeholder || 'Enter your email address'}
                                className="mhp-newsletter-input"
                                style={{ opacity: 0.9 }}
                              />
                              <button 
                                type="button" 
                                className="mhp-newsletter-btn"
                                onClick={() => handleOpenEditSectionModal(sec)}
                                title="Click to edit button text"
                              >
                                {sec.data?.buttonText || 'Subscribe'}
                              </button>
                            </div>
                          </div>
                        </section>
                      )}

                      {/* Section Insert Divider */}
                      <div className="lhs-insert-bar">
                        <button
                          type="button"
                          className="lhs-insert-btn"
                          onClick={() => {
                            setInsertAtIndex(idx);
                            setIsAddSectionModalOpen(true);
                          }}
                          title="Insert a brand new section below this one"
                        >
                          <Plus size={14} />
                          <span>Insert Section Below</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Bottom Add Section Card */}
                <div 
                  style={{
                    border: '2px dashed rgba(234, 88, 12, 0.45)',
                    borderRadius: '16px',
                    padding: '2.5rem',
                    textAlign: 'center',
                    background: 'rgba(234, 88, 12, 0.03)',
                    cursor: 'pointer',
                    marginTop: '2rem'
                  }}
                  onClick={() => {
                    setInsertAtIndex(sections.length - 1);
                    setIsAddSectionModalOpen(true);
                  }}
                >
                  <Plus size={32} color="#ea580c" style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800 }}>+ Add Another Section to Homepage</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Choose from Stories Feed, Trending, Spotlight, Newsletter, Brands, Features, and more</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL 1: ARTICLE PICKER ── */}
      {isPickerOpen && (
        <div className="lse-modal-backdrop">
          <div className="lse-modal-card">
            <div className="lse-modal-header">
              <div className="lse-modal-title-group">
                <Layers size={18} color="#ea580c" />
                <h3 className="lse-modal-title">
                  {pickerTarget?.type?.includes('replace') ? 'Replace Article' : 'Pick Article for Homepage'}
                </h3>
              </div>
              <button 
                type="button" 
                className="lse-modal-close-btn"
                onClick={() => setIsPickerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="lse-modal-search-row">
              <div className="lse-modal-search-box">
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search stories by title, category, or author…"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <select
                className="lse-modal-cat-select"
                value={pickerCategory}
                onChange={(e) => setPickerCategory(e.target.value)}
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="lse-modal-list">
              {filteredPickerArticles.length === 0 ? (
                <div className="lse-modal-empty">No stories match your search query.</div>
              ) : (
                filteredPickerArticles.map((article, idx) => {
                  const artId = article._id || article.id || `pick-${idx}`;
                  const artTitle = article.title || 'Untitled';
                  const artCat = article.categoryLabel || article.category || 'Startups';
                  const artAuthor = typeof article.author === 'object' ? article.author?.name : (article.author || 'Editorial');
                  const artImg = article.image || article.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80';

                  return (
                    <div 
                      key={artId} 
                      className="lse-modal-item"
                      onClick={() => handleSelectPickerArticle(article)}
                    >
                      <img src={artImg} alt={artTitle} className="lse-modal-item-thumb" />
                      <div className="lse-modal-item-info">
                        <span className="lse-modal-item-cat">{artCat}</span>
                        <h4 className="lse-modal-item-title">{artTitle}</h4>
                        <span className="lse-modal-item-meta">By {artAuthor}</span>
                      </div>
                      <button type="button" className="lse-modal-select-btn">
                        Select
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SECTION SETTINGS EDIT ── */}
      {isEditModalOpen && editingSection && (
        <div className="lse-modal-backdrop">
          <div className="lse-modal-card" style={{ maxWidth: '580px' }}>
            <div className="lse-modal-header">
              <div className="lse-modal-title-group">
                <Edit3 size={18} color="#ea580c" />
                <h3 className="lse-modal-title">Edit {editingSection.title || editingSection.type}</h3>
              </div>
              <button 
                type="button" 
                className="lse-modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="lse-edit-form">
              <div className="lse-form-group">
                <label className="lse-label">Section Title / Headline</label>
                <input
                  type="text"
                  className="lse-input"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>

              <div className="lse-form-group">
                <label className="lse-label">Subtitle / Description</label>
                <textarea
                  className="lse-textarea"
                  rows={2}
                  value={editFormData.subtitle || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                />
              </div>

              <div className="lse-form-row">
                <div className="lse-form-group" style={{ flex: 1 }}>
                  <label className="lse-label">Badge Pill Text (optional)</label>
                  <input
                    type="text"
                    className="lse-input"
                    placeholder="e.g. EDITOR'S PICK"
                    value={editFormData.badgeText || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, badgeText: e.target.value })}
                  />
                </div>
                <div className="lse-form-group" style={{ flex: 1 }}>
                  <label className="lse-label">Articles Limit</label>
                  <input
                    type="number"
                    className="lse-input"
                    min={2}
                    max={24}
                    value={editFormData.limit || 8}
                    onChange={(e) => setEditFormData({ ...editFormData, limit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="lse-form-row">
                <div className="lse-form-group" style={{ flex: 1 }}>
                  <label className="lse-label">View All Link Text</label>
                  <input
                    type="text"
                    className="lse-input"
                    value={editFormData.viewAllText || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, viewAllText: e.target.value })}
                  />
                </div>
                <div className="lse-form-group" style={{ flex: 1 }}>
                  <label className="lse-label">View All Destination URL</label>
                  <input
                    type="text"
                    className="lse-input"
                    value={editFormData.viewAllUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, viewAllUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="lse-modal-footer">
              <button 
                type="button" 
                className="lse-btn-cancel" 
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="lse-btn-save"
                onClick={handleSaveEditSectionModal}
              >
                Save &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: HERO SLIDE EDIT ── */}
      {isSlideModalOpen && (
        <div className="lse-modal-backdrop">
          <div className="lse-modal-card" style={{ maxWidth: '600px' }}>
            <div className="lse-modal-header">
              <div className="lse-modal-title-group">
                <Sparkles size={18} color="#ea580c" />
                <h3 className="lse-modal-title">Edit Hero Slide #{((slideFormData.index ?? heroSlideIdx) + 1)}</h3>
              </div>
              <button 
                type="button" 
                className="lse-modal-close-btn"
                onClick={() => setIsSlideModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="lse-edit-form">
              <div className="lse-form-group">
                <label className="lse-label">Headline</label>
                <input
                  type="text"
                  className="lse-input"
                  value={slideFormData.title || ''}
                  onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                />
              </div>

              <div className="lse-form-group">
                <label className="lse-label">Subtitle / Excerpt</label>
                <textarea
                  className="lse-textarea"
                  rows={2}
                  value={slideFormData.excerpt || ''}
                  onChange={(e) => setSlideFormData({ ...slideFormData, excerpt: e.target.value })}
                />
              </div>

              <div className="lse-form-group">
                <label className="lse-label">Background Photo URL</label>
                <input
                  type="text"
                  className="lse-input"
                  value={slideFormData.image || ''}
                  onChange={(e) => setSlideFormData({ ...slideFormData, image: e.target.value })}
                />
              </div>

              <div className="lse-form-row">
                <div className="lse-form-group" style={{ flex: 1 }}>
                  <label className="lse-label">Category Badge</label>
                  <input
                    type="text"
                    className="lse-input"
                    value={slideFormData.category || ''}
                    onChange={(e) => setSlideFormData({ ...slideFormData, category: e.target.value })}
                  />
                </div>
                <div className="lse-form-group" style={{ flex: 1 }}>
                  <label className="lse-label">Button Text</label>
                  <input
                    type="text"
                    className="lse-input"
                    value={slideFormData.primaryBtnText || 'Read More'}
                    onChange={(e) => setSlideFormData({ ...slideFormData, primaryBtnText: e.target.value })}
                  />
                </div>
              </div>

              <div className="lse-form-group">
                <label className="lse-label">Button Link URL</label>
                <input
                  type="text"
                  className="lse-input"
                  value={slideFormData.link || ''}
                  onChange={(e) => setSlideFormData({ ...slideFormData, link: e.target.value })}
                />
              </div>
            </div>

            <div className="lse-modal-footer">
              <button 
                type="button" 
                className="lse-btn-cancel" 
                onClick={() => setIsSlideModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="lse-btn-save"
                onClick={handleSaveSlideModal}
              >
                Save Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: INSERT SECTION MODAL ── */}
      {isAddSectionModalOpen && (
        <div className="lse-modal-backdrop">
          <div className="lse-modal-card" style={{ maxWidth: '640px' }}>
            <div className="lse-modal-header">
              <div className="lse-modal-title-group">
                <Plus size={18} color="#ea580c" />
                <h3 className="lse-modal-title">
                  {insertAtIndex !== null ? `Insert Section at Position #${insertAtIndex + 2}` : 'Add New Section to Homepage'}
                </h3>
              </div>
              <button 
                type="button" 
                className="lse-modal-close-btn"
                onClick={() => setIsAddSectionModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
              {SECTION_DEFINITIONS.map(def => {
                const IconComponent = def.icon || LayoutGrid;
                return (
                  <div
                    key={def.type}
                    onClick={() => handleInsertSection(def)}
                    style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ea580c';
                      e.currentTarget.style.background = '#fff7ed';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                  >
                    <div style={{ padding: '8px', background: '#ffffff', borderRadius: '8px', color: '#ea580c', border: '1px solid #fed7aa' }}>
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{def.label}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>{def.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lse-modal-footer">
              <button 
                type="button" 
                className="lse-btn-cancel" 
                onClick={() => setIsAddSectionModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
