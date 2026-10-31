import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Check, Sparkles, Plus, Trash2, 
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Monitor, Smartphone, Search, RefreshCw, Layers, Eye, EyeOff,
  Edit2, Edit3, Image as ImageIcon, Type, Play, Mail, Zap, Flame, LayoutGrid,
  ExternalLink, CheckCircle2, ChevronDown, Heart, Bookmark, ArrowLeftRight, Settings
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { PageService } from '../../services/pageService';
import { HomepageService } from '../../services/homepageService';
import { ALL_STORIES, TOP_PICKS, SPOTLIGHT_STORIES, LEAD_STORY } from '../../data/storiesData';
import { SECTION_DEFINITIONS } from './SectionEditorModal';
import './LiveHomepageStudio.css';
import './LiveSectionEditor.css';
import '../ModernHomepage.css';
import '../LatestArticlesPage.css';
import LatestArticlesPage from '../LatestArticlesPage';

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
  const author = typeof article.author === 'object' ? (article.author?.name || 'Author') : (article.author || 'Editorial');
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

export default function LiveWholePageStudio({
  isOpen = true,
  onClose,
  initialSections = null,
  onSaveSuccess = null,
  stories = [],
  pageId = 'latest',
  pageTitle = 'Latest Articles',
  pageSlug = 'latest',
  onOpenSettings = null,
  inPageMode = false
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

  // Add Section Modal State
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState(null);

  const sectionRefs = useRef({});
  const isLatestPage = pageId === 'latest' || pageSlug === 'latest';

  // Load sections from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const loadPageData = async () => {
      try {
        if (initialSections && Array.isArray(initialSections) && initialSections.length > 0) {
          if (isMounted) setSections(initialSections);
          return;
        }

        const page = await PageService.getPageById(pageId);
        if (page && Array.isArray(page.sections) && page.sections.length > 0) {
          if (isMounted) setSections(page.sections);
        } else {
          // Canonical seed sections for Latest Articles page
          if (isMounted) {
            if (pageId === 'latest') {
              setSections([
                { id: 'latest_hero', type: 'latest_hero', title: 'Hero Section - Latest Articles & Dispatches', enabled: true, order: 1, data: {} },
                { id: 'latest_feed', type: 'latest_feed', title: 'Latest from the Newsroom', enabled: true, order: 2, data: {} },
                { id: 'category_startups', type: 'category_startups', title: 'Category Desk: Startups & Capital', enabled: true, order: 3, data: {} },
                { id: 'newsletter', type: 'newsletter', title: 'Newsletter Subscription Banner', enabled: true, order: 4, data: {} }
              ]);
            } else {
              setSections([
                { id: 'hero_popular', type: 'hero', title: 'Lead Stories & Popular Posts', enabled: true, order: 1, data: {} },
                { id: 'latest_blogs', type: 'stories_feed', title: 'Latest from the Blog', enabled: true, order: 2, data: {} },
                { id: 'trending', type: 'trending', title: 'Trending Now', enabled: true, order: 3, data: {} },
                { id: 'newsletter', type: 'newsletter', title: 'Newsletter Subscription Banner', enabled: true, order: 4, data: {} }
              ]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load page data for Live Studio:', err);
      }
    };

    loadPageData();

    // Fetch live articles from backend
    ArticleService.getArticles({ limit: 150 }).then(res => {
      if (isMounted && res?.data && res.data.length > 0) {
        setAvailableArticles(res.data);
      }
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [pageId, initialSections]);

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

  // Target section-related pool in Studio (strictly scoped to the section being edited)
  const targetSectionRelatedPool = useMemo(() => {
    if (!pickerTarget?.sectionId) return pool;
    const sec = sections.find(s => s.id === pickerTarget.sectionId || s.sectionKey === pickerTarget.sectionId);
    if (!sec) return pool;

    const secType = (sec.type || sec.sectionKey || sec.id || '').toLowerCase();
    const titleLower = (sec.title || sec.data?.title || '').toLowerCase();
    const isSpot = secType === 'spotlight' || secType === 'technology' || secType === 'ai' || titleLower.includes('spotlight') || titleLower.includes('tech');
    const isTrend = secType === 'trending' || titleLower.includes('trending');
    const isPop = secType === 'popular_editors' || secType === 'business' || sec.id === 'popular_editors' || titleLower.includes('popular') || titleLower.includes('editor');
    const explicitCat = (sec.data?.category || sec.category || '').toLowerCase().trim();

    if (explicitCat) {
      const matched = pool.filter(s => {
        const c = (s.categoryName || s.categoryLabel || s.categoryTag || s.category || '').toLowerCase();
        return c.includes(explicitCat);
      });
      if (matched.length > 0) return matched;
    }

    if (secType.startsWith('category_')) {
      const rawCat = secType.replace(/^category_/, '').replace(/[-_]/g, ' ').toLowerCase();
      const matched = pool.filter(s => {
        const c = (s.categoryName || s.categoryLabel || s.categoryTag || s.category || '').toLowerCase();
        return c.includes(rawCat);
      });
      if (matched.length > 0) return matched;
    }

    if (isSpot) {
      const techList = pool.filter(s => {
        const c = (s.categoryName || s.categoryLabel || s.categoryTag || s.category || '').toLowerCase();
        const tag = (s.tag || '').toUpperCase();
        return (
          c.includes('tech') || c.includes('ai') || c.includes('startup') || c.includes('enterprise') ||
          c.includes('fintech') || c.includes('deeptech') || c.includes('deep-tech') ||
          tag === 'TECHNOLOGY' || tag === 'STARTUP' || tag === 'AI' || tag === 'DEEPTECH' || tag === 'FINTECH' || tag === 'ENTERPRISE' || tag === 'TECHSPARKS 2024'
        );
      });
      if (techList.length > 0) return techList;
    }

    if (isTrend) {
      const trendList = pool.filter(s => {
        const tag = (s.tag || '').toUpperCase();
        const placements = Array.isArray(s.placements) ? s.placements : [];
        return s.isTrending || s.trending || placements.includes('trending') || tag === 'TRENDING' || tag === 'POPULAR' || tag === 'VIRAL' || tag === 'TOP PICK';
      });
      if (trendList.length > 0) return trendList;
    }

    if (isPop) {
      const popList = pool.filter(s => {
        const tag = (s.tag || '').toUpperCase();
        const placements = Array.isArray(s.placements) ? s.placements : [];
        return s.isEditorsPick || s.isFeatured || placements.includes('editors_pick') || tag === 'TOP PICK' || tag === 'FEATURED' || tag === 'EDITOR' || s.isLead;
      });
      if (popList.length > 0) return popList;
    }

    return [...pool].sort((a, b) => new Date(b.publishedAt || b.date || b.createdAt || 0) - new Date(a.publishedAt || a.date || a.createdAt || 0));
  }, [pool, pickerTarget, sections]);

  // Filtered articles in Picker
  const filteredPickerArticles = useMemo(() => {
    const existingKeys = new Set();
    if (pickerTarget?.sectionId) {
      const sec = sections.find(s => s.id === pickerTarget.sectionId || s.sectionKey === pickerTarget.sectionId);
      if (sec) {
        const currentArticles = resolveSectionArticles(sec);
        currentArticles.forEach((art, idx) => {
          if (!art) return;
          if (pickerTarget.type === 'feed-replace' && pickerTarget.index === idx) return;
          const idKey = String(art._id || art.id || art.articleId || '').trim();
          const slugKey = String(art.slug || '').trim().toLowerCase();
          const titleKey = String(art.title || '').trim().toLowerCase();
          if (idKey) existingKeys.add(idKey);
          if (slugKey) existingKeys.add(slugKey);
          if (titleKey) existingKeys.add(titleKey);
        });
      }
    } else if (pickerTarget?.type?.startsWith('hero')) {
      heroSlides.forEach((slide, idx) => {
        if (pickerTarget.type === 'hero-replace' && (pickerTarget.index ?? heroSlideIdx) === idx) return;
        if (slide.slug) existingKeys.add(String(slide.slug).trim().toLowerCase());
        if (slide.title) existingKeys.add(String(slide.title).trim().toLowerCase());
      });
    } else if (pickerTarget?.type?.startsWith('popular')) {
      popularArticles.forEach((pop, idx) => {
        if (pickerTarget.type === 'popular-replace' && pickerTarget.index === idx) return;
        if (pop.slug) existingKeys.add(String(pop.slug).trim().toLowerCase());
        if (pop.title) existingKeys.add(String(pop.title).trim().toLowerCase());
      });
    }

    const seenInPicker = new Set();

    return targetSectionRelatedPool.filter(a => {
      if (!a) return false;
      const artId = String(a._id || a.id || a.articleId || '').trim();
      const artSlug = String(a.slug || '').trim().toLowerCase();
      const title = (a.title || '').trim().toLowerCase();

      // DO NOT SHOW REPEATED CONTENT: Exclude articles already added in this section
      if (existingKeys.has(artId) || (artSlug && existingKeys.has(artSlug)) || (title && existingKeys.has(title))) {
        return false;
      }

      // Deduplicate inside picker pool itself
      const pickerUniqueKey = artSlug || artId || title;
      if (seenInPicker.has(pickerUniqueKey)) return false;
      seenInPicker.add(pickerUniqueKey);

      // Search filter
      const q = pickerSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        title.includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.author && typeof a.author === 'string' && a.author.toLowerCase().includes(q)) ||
        (a.author?.name && a.author.name.toLowerCase().includes(q));

      // Category filter
      const cat = a.categoryLabel || a.category || a.categoryName || '';
      const matchesCat = pickerCategory === 'All' || cat.toLowerCase().includes(pickerCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [targetSectionRelatedPool, pickerSearch, pickerCategory, pickerTarget, sections]);

  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    targetSectionRelatedPool.forEach(a => {
      const c = a.categoryName || a.categoryLabel || a.category;
      if (c && typeof c === 'string') cats.add(c.trim());
    });
    return Array.from(cats).slice(0, 10);
  }, [targetSectionRelatedPool]);

  // ─────────────────────────────────────────────────────────
  // INSTANT AUTO-SAVE PERSISTENCE TO DATABASE
  // ─────────────────────────────────────────────────────────
  const persistPageToDatabase = async (nextSections) => {
    const sectionsToSave = nextSections || sections;
    setSections(sectionsToSave);
    setSaveStatus('saving');

    try {
      const isHome = pageId === 'home';
      const cleanSlug = isHome ? '' : (pageSlug || pageId);
      const payload = {
        title: pageTitle || (isHome ? 'Homepage' : 'Latest Articles & Dispatches'),
        slug: cleanSlug,
        description: isHome ? 'Comprehensive reporting on technology, startups, AI, and business.' : 'Chronological reporting, breaking investigations, venture intelligence, and newsroom dispatches.',
        status: 'published',
        sections: sectionsToSave
      };

      await PageService.updatePage(pageId, payload);
      if (isHome) {
        try {
          await HomepageService.updateSections(sectionsToSave);
        } catch (e) {}
      }

      // Notify any active views across open windows
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('page:change', { detail: { pageId, sections: sectionsToSave } }));
        if (isHome) window.dispatchEvent(new CustomEvent('homepage:change', { detail: sectionsToSave }));
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
      onSaveSuccess?.(sectionsToSave);
    } catch (err) {
      console.error('Failed to auto-save page:', err);
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
    persistPageToDatabase(updated);
  };

  const handleToggleSectionEnabled = (secId) => {
    const next = sections.map(s => {
      if (s.id === secId) {
        return { ...s, enabled: s.enabled === false ? true : false };
      }
      return s;
    });
    persistPageToDatabase(next);
  };

  const handleDeleteSection = (secId) => {
    const sec = sections.find(s => s.id === secId);
    const secName = sec?.title || sec?.type || 'section';
    if (!window.confirm(`Are you sure you want to remove "${secName}" from this page?`)) return;
    const next = sections.filter(s => s.id !== secId).map((s, i) => ({ ...s, order: i + 1 }));
    persistPageToDatabase(next);
  };

  // Update Section inline data directly
  const handleUpdateSectionData = (secId, patch) => {
    const next = sections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          title: patch.title !== undefined ? patch.title : s.title,
          subtitle: patch.subtitle !== undefined ? patch.subtitle : s.subtitle,
          data: {
            ...s.data,
            ...patch
          }
        };
      }
      return s;
    });
    persistPageToDatabase(next);
  };

  // ─────────────────────────────────────────────────────────
  // HERO SLIDER CURATION & CONTROLS
  // ─────────────────────────────────────────────────────────
  const heroSection = useMemo(() => {
    return sections.find(s => s.type === 'hero' || s.type === 'hero_popular' || s.type === 'latest_hero' || s.id === 'latest_hero' || (s.type || '').toLowerCase().includes('hero')) || sections[0];
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
    if (!heroSection) return;
    const next = sections.map(s => {
      if (s.id === heroSection.id) {
        return { ...s, data: { ...s.data, ...patch } };
      }
      return s;
    });
    persistPageToDatabase(next);
  };

  const handleInlineSlideUpdate = (updates) => {
    if (heroSlides.length === 0) return;
    const nextSlides = [...heroSlides];
    nextSlides[heroSlideIdx] = {
      ...nextSlides[heroSlideIdx],
      ...updates
    };
    handleUpdateHeroData({ slides: nextSlides });
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
    if (data.hasCustomPopular || Array.isArray(data.popularArticles)) {
      return (data.popularArticles || []).slice(0, 5);
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
    handleUpdateHeroData({ popularArticles: nextPop, hasCustomPopular: true });
  };

  const handleInlinePopularUpdate = (idx, updates) => {
    if (!popularArticles[idx]) return;
    const nextPop = [...popularArticles];
    nextPop[idx] = {
      ...nextPop[idx],
      ...updates
    };
    handleUpdateHeroData({ popularArticles: nextPop });
  };

  // ─────────────────────────────────────────────────────────
  // FEED SECTIONS ARTICLE REORDERING & CURATION
  // ─────────────────────────────────────────────────────────
  const getSectionMaxFit = (sec) => {
    const isLatestFeed = pageId === 'latest' && (sec.id === 'latest_feed' || sec.type === 'latest_feed' || sec.type === 'latest_blogs');
    if (isLatestFeed) return sec.data?.limit || 16;
    return sec.data?.limit || 4;
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

    if (Array.isArray(data.articles)) {
      return data.articles.filter(Boolean).slice(0, maxFit);
    }
    return sorted.slice(0, maxFit);
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

    persistPageToDatabase(nextSections);
  };

  const handleRemoveFeedArticle = (secId, idx) => {
    const sec = sections.find(s => s.id === secId);
    if (!sec) return;
    const currentArticles = resolveSectionArticles(sec);
    const targetTitle = currentArticles[idx]?.title || 'article';
    if (!window.confirm(`Remove "${targetTitle}" from this section?`)) return;

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

    persistPageToDatabase(nextSections);
  };

  // Direct Inline Article Update (synchronizes React section state, Page in MongoDB, and Article/Story collections)
  const handleInlineArticleUpdate = async (secId, article, updates) => {
    if (!article) return;
    const artId = article._id || article.id || article.articleId || article.slug;

    // 1. Update article inside section articles array
    const sec = sections.find(s => s.id === secId);
    if (sec) {
      const currentArticles = resolveSectionArticles(sec);
      const nextArticles = currentArticles.map(a => {
        const aId = a._id || a.id || a.articleId || a.slug;
        if (String(aId) === String(artId)) {
          return { ...a, ...updates };
        }
        return a;
      });

      const nextSections = sections.map(s => {
        if (s.id === secId) {
          return {
            ...s,
            data: {
              ...s.data,
              articles: nextArticles,
              hasCustomArticles: true
            }
          };
        }
        return s;
      });
      persistPageToDatabase(nextSections);
    }

    // 2. Persist to MongoDB Article/Story collections
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
      console.warn('Could not update individual article record:', e);
    }
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
        persistPageToDatabase(nextSections);
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
        persistPageToDatabase(nextSections);
      }
    }

    setIsPickerOpen(false);
  };

  // ─────────────────────────────────────────────────────────
  // ADD NEW SECTION DIRECTLY
  // ─────────────────────────────────────────────────────────
  const availableSectionDefinitions = useMemo(() => {
    const existingTypes = new Set(sections.map(s => (s.type || s.id || '').toLowerCase()));
    return SECTION_DEFINITIONS.filter(def => {
      const t = def.type.toLowerCase();
      return !existingTypes.has(t);
    });
  }, [sections]);

  const handleAddSectionDirectly = (sectionType) => {
    const def = SECTION_DEFINITIONS.find(d => d.type === sectionType) || { label: sectionType };
    let initialData = {
      title: def.label,
      heading: def.label,
      subtitle: def.description || 'Editorial reporting and dispatches.',
      category: '',
      limit: 4
    };

    if (sectionType === 'newsletter') {
      initialData = {
        title: 'Newsletter Subscription Banner',
        headline: 'Get the Latest Blogs Delivered to Your Inbox',
        subtitle: 'Unfiltered insights on venture capital, frontier tech, and high-growth leadership directly in your inbox.',
        buttonText: 'Subscribe',
        placeholder: 'Enter your email address'
      };
    }

    const newSec = {
      id: 'sec_' + Date.now(),
      type: sectionType,
      order: sections.length + 1,
      enabled: true,
      data: initialData
    };

    let next;
    if (insertAtIndex !== null && insertAtIndex >= 0) {
      next = [...sections];
      next.splice(insertAtIndex, 0, newSec);
    } else {
      next = [...sections, newSec];
    }

    const updated = next.map((s, i) => ({ ...s, order: i + 1 }));
    persistPageToDatabase(updated);
    setIsAddSectionModalOpen(false);
    setInsertAtIndex(null);
  };

  return (
    <div className={`lhs-overlay ${inPageMode ? 'in-page-mode' : ''}`}>
      {/* ── Studio Top Header Bar (Hidden in same-page mode because AdminPageEditor already renders the top header toolbar) ── */}
      {!inPageMode && (
        <header className="lhs-header">
          <div className="lhs-header-left">
            <button
              type="button"
              className="lhs-btn-cancel"
              onClick={onClose}
              title="Return to Pages Manager"
              style={{ marginRight: '8px' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Pages</span>
            </button>

            <div className="lhs-brand-title">
              <h2>
                <Sparkles size={18} color="#ea580c" />
                <span>GoReadPost Live Studio: {pageTitle || 'Latest Articles'}</span>
              </h2>
              <span className="lhs-live-tag">
                <span className="lhs-live-dot" />
                WHOLE PAGE STUDIO
              </span>
            </div>
          </div>

          {/* Studio Center: Viewport Switcher */}
          <div className="lhs-viewport-switcher">
            <button
              type="button"
              className={`lhs-viewport-btn ${deviceView === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceView('desktop')}
            >
              <Monitor size={14} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={`lhs-viewport-btn ${deviceView === 'mobile' ? 'active' : ''}`}
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

            {(pageId === 'latest' || pageSlug === 'latest') && (
              <button
                type="button"
                className="lhs-btn-preview"
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
                    ArticleService.createArticle(newArt).then(() => {
                      window.dispatchEvent(new CustomEvent('article:change'));
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus('idle'), 2500);
                    }).catch(() => {});
                  }
                }}
                title="Add a new article card directly to Latest feed"
                style={{ background: '#ea580c', color: '#ffffff', border: 'none' }}
              >
                <Plus size={14} />
                <span>+ Add Article</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                className="lhs-btn-preview"
                onClick={onOpenSettings}
                title="Open Page Info & SEO Settings"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
              >
                <Settings size={14} />
                <span>Page Settings</span>
              </button>
            )}

            <button
              type="button"
              className="lhs-btn-preview"
              onClick={() => window.open(pageSlug ? `/${pageSlug.replace(/^\/+/, '')}` : (pageId === 'home' ? '/' : `/${pageId}`), '_blank')}
              title="Open live public page in new tab"
            >
              <ExternalLink size={14} />
              <span>View Live Page</span>
            </button>

            <button
              type="button"
              className="lhs-btn-save"
              onClick={() => {
                persistPageToDatabase();
                onClose?.();
              }}
            >
              <Check size={16} />
              <span>Publish Live</span>
            </button>
          </div>
        </header>
      )}

      {/* ── Main Scrollable Canvas ── */}
      <main className="lhs-workspace">
        <div className={`lhs-canvas-wrapper ${deviceView === 'mobile' ? 'mobile-view' : ''}`}>
          
          {/* Tip Bar (Hidden in in-page mode per user request) */}
          {!inPageMode && (
            <div className="lhs-tip-bar">
              <div className="lhs-tip-text">
                <Sparkles size={16} color="#fbbf24" />
                <span>
                  <strong>{isLatestPage ? 'Latest Articles Live UI Studio:' : 'Whole Page Live Studio:'}</strong> Click any headline, category tag, excerpt, or author to edit in-place. Hover article thumbnails to change photos. Reorder cards with <strong>← Left / Right →</strong>.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isLatestPage && (
                  <button
                    type="button"
                    className="lse-toolbar-btn primary"
                    onClick={() => {
                      setInsertAtIndex(null);
                      setIsAddSectionModalOpen(true);
                    }}
                  >
                    <Plus size={14} />
                    <span>+ Add Section to Page</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Real Page Content Canvas ── */}
          <div className="lhs-browser-frame">
            {/* Real Frontend Website Body */}
            <div className="lhs-real-frontend-sheet">
              {/* ── All Sections In Natural Stacked Flow ── */}
              <div className="mhp-container" style={{ padding: '1.5rem clamp(1rem, 2.5vw, 2.5rem) 3rem' }}>
                {(pageId === 'latest' || pageSlug === 'latest') ? (
                  /* ── REAL FRONTEND LATEST ARTICLES PAGE IN LIVE STUDIO ── */
                  <LatestArticlesPage
                    isStudioView={true}
                    onShowToast={(msg) => {
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus('idle'), 2500);
                    }}
                  />
                ) : (
                  /* ── HOMEPAGE & DYNAMIC SECTIONS CANVAS ── */
                  sections.map((sec, idx) => {
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
                          <span style={{ color: '#fb923c', fontWeight: 900 }}>#{idx + 1}</span>
                          <span>{sec.title || sec.type}</span>
                        </div>

                        <div className="lhs-section-tools">
                          <button
                            type="button"
                            className="lhs-sec-tool-btn"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, 'up')}
                            title="Move section higher on page"
                          >
                            <ArrowUp size={12} />
                            <span>Up</span>
                          </button>
                          <button
                            type="button"
                            className="lhs-sec-tool-btn"
                            disabled={idx === sections.length - 1}
                            onClick={() => handleMoveSection(idx, 'down')}
                            title="Move section lower on page"
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
                            title="Delete section from page"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* 1. HERO BANNER SECTION (DIRECT IN-PLACE EDITABLE) */}
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

                            {/* Direct Change Photo Overlay Button */}
                            <div className="lse-card-img-overlay" style={{ top: '16px', right: '16px', zIndex: 30 }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentImg = activeSlide.image || '';
                                  const newImg = window.prompt("Enter new background photo URL for this hero slide:", currentImg);
                                  if (newImg && newImg.trim() && newImg !== currentImg) {
                                    handleInlineSlideUpdate({ image: newImg.trim(), bannerImage: newImg.trim() });
                                  }
                                }}
                                style={{
                                  background: 'rgba(15, 23, 42, 0.92)',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '0.78rem',
                                  fontWeight: 750,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  cursor: 'pointer',
                                  backdropFilter: 'blur(8px)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                                }}
                                title="Change Hero Background Photo URL"
                              >
                                <ImageIcon size={14} />
                                <span>Change Photo</span>
                              </button>
                            </div>

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
                              <span 
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                className="mhp-badge lse-direct-editable"
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent.trim();
                                  if (val && val !== activeSlide.category) {
                                    handleInlineSlideUpdate({ category: val, categoryLabel: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                }}
                                title="Click directly to edit category badge"
                                style={{ cursor: 'text' }}
                              >
                                {activeSlide.category || 'FEATURED'}
                              </span>

                              <h1 
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                className="mhp-hero-title lse-direct-editable"
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent.trim();
                                  if (val && val !== activeSlide.title) {
                                    handleInlineSlideUpdate({ title: val, headline: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                }}
                                title="Click directly to edit headline"
                                style={{ cursor: 'text', margin: '0 0 1rem' }}
                              >
                                {activeSlide.title}
                              </h1>

                              <p 
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                className="mhp-hero-subtitle lse-direct-editable"
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent.trim();
                                  if (val !== activeSlide.excerpt) {
                                    handleInlineSlideUpdate({ excerpt: val, summary: val, description: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                }}
                                title="Click directly to edit excerpt"
                                style={{ cursor: 'text', margin: '0 0 1.25rem' }}
                              >
                                {activeSlide.excerpt || 'Click directly to add lead excerpt summary'}
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
                                <span 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val && val !== (heroSection?.data?.popularTitle || 'Popular Posts')) {
                                      handleUpdateHeroData({ popularTitle: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit title"
                                  style={{ fontWeight: 800, fontSize: '1.1rem', cursor: 'text' }}
                                >
                                  {heroSection?.data?.popularTitle || 'Popular Posts'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  className="lbe-btn-add-mini article"
                                  disabled={popularArticles.length >= 5}
                                  style={{
                                    opacity: popularArticles.length >= 5 ? 0.45 : 1,
                                    cursor: popularArticles.length >= 5 ? 'not-allowed' : 'pointer'
                                  }}
                                  onClick={() => {
                                    if (popularArticles.length >= 5) {
                                      alert("Popular Posts is full (5/5 cards). Delete a card first to select new ones.");
                                      return;
                                    }
                                    handleOpenPicker({ type: 'popular-add', mode: 'articles' });
                                  }}
                                  title="Add an article to Popular Posts (Max 5)"
                                >
                                  <Plus size={12} strokeWidth={2.5} />
                                  <span>Article</span>
                                </button>
                              </div>
                            </div>

                            <div className="mhp-popular-list">
                              {popularArticles.length === 0 ? (
                                <div className="lbe-popular-empty-state">
                                  <h3 className="lbe-popular-empty-title">Popular Posts</h3>
                                </div>
                              ) : (
                                popularArticles.map((item, idx) => (
                                  <div key={item.id || idx} className="lbe-popular-manage-item">
                                    <div className="mhp-popular-rank" title={`Position #${idx + 1}`}>
                                      {idx + 1}
                                    </div>

                                    {/* Thumbnail with Photo Change Overlay */}
                                    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }} className="lbe-popular-thumb-wrap">
                                      <div className="lse-card-img-overlay" style={{ top: '2px', right: '2px' }}>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newImg = window.prompt("Enter new photo URL for this story:", item.image);
                                            if (newImg && newImg.trim() && newImg !== item.image) {
                                              handleInlinePopularUpdate(idx, { image: newImg.trim(), coverImage: newImg.trim() });
                                            }
                                          }}
                                          style={{
                                            background: 'rgba(15, 23, 42, 0.92)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: '4px',
                                            padding: '2px 4px',
                                            fontSize: '0.62rem',
                                            cursor: 'pointer'
                                          }}
                                          title="Change photo URL"
                                        >
                                          <ImageIcon size={10} />
                                        </button>
                                      </div>
                                      <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="mhp-popular-thumb"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                      />
                                    </div>

                                    <div className="mhp-popular-info">
                                      <h4 
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        className="mhp-popular-title lse-direct-editable"
                                        onBlur={(e) => {
                                          const val = e.currentTarget.textContent.trim();
                                          if (val && val !== item.title) {
                                            handleInlinePopularUpdate(idx, { title: val });
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.currentTarget.blur();
                                          }
                                        }}
                                        title="Click directly to edit title"
                                        style={{ cursor: 'text' }}
                                      >
                                        {item.title}
                                      </h4>
                                      <span className="mhp-popular-meta">
                                        <span 
                                          contentEditable={true}
                                          suppressContentEditableWarning={true}
                                          className="lse-direct-editable"
                                          onBlur={(e) => {
                                            const val = e.currentTarget.textContent.trim();
                                            if (val && val !== item.category) {
                                              handleInlinePopularUpdate(idx, { category: val });
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              e.currentTarget.blur();
                                            }
                                          }}
                                          title="Click directly to edit category"
                                          style={{ color: '#fb923c', marginRight: '4px', cursor: 'text' }}
                                        >
                                          {item.category || 'Startups'} •
                                        </span>
                                        {item.readTime || '3 min read'}
                                      </span>
                                    </div>

                                    <div className="lbe-item-reorder-group">
                                      <button
                                        type="button"
                                        className="lbe-reorder-btn arrow-btn"
                                        disabled={idx === 0}
                                        onClick={() => handleMovePopular(idx, 'up')}
                                        title="Move up"
                                      >
                                        <ArrowUp size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        className="lbe-reorder-btn arrow-btn"
                                        disabled={idx === popularArticles.length - 1}
                                        onClick={() => handleMovePopular(idx, 'down')}
                                        title="Move down"
                                      >
                                        <ArrowDown size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        className="lbe-reorder-btn danger"
                                        onClick={() => handleDeletePopular(idx)}
                                        title="Remove"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </section>
                      )}

                      {/* 2. GRID FEED & CATEGORY DESK SECTIONS (DIRECT IN-PLACE EDITABLE) */}
                      {isGridFeed && (
                        <section className="mhp-content-section" style={{ margin: 0, padding: 0 }}>
                          <div className="mhp-section-header" style={{ marginBottom: '1.25rem' }}>
                            <div className="mhp-section-header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="mhp-section-title-wrap">
                                <h2 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="mhp-section-title lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val && val !== (sec.data?.title || sec.title)) {
                                      handleUpdateSectionData(sec.id, { title: val, heading: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit section title"
                                  style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, cursor: 'text' }}
                                >
                                  {sec.data?.title || sec.title}
                                </h2>
                              </div>

                              {sec.data?.subtitle && (
                                <p
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val !== sec.data.subtitle) {
                                      handleUpdateSectionData(sec.id, { subtitle: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit subtitle"
                                  style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', cursor: 'text' }}
                                >
                                  {sec.data.subtitle}
                                </p>
                              )}
                            </div>

                            <span 
                              className="mhp-view-all-link"
                              style={{ color: '#ea580c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'default' }}
                            >
                              {sec.data?.viewAllText || 'View All'} <ArrowRight size={14} />
                            </span>
                          </div>

                          {/* 4-Column Card Grid */}
                          <div className="mhp-blog-cards-grid">
                            {secArticles.map((art, aIdx) => {
                              const artId = art.id || art._id || `card-${aIdx}`;
                              const artTitle = art.title || 'Featured Story';
                              const artImg = (typeof art.featuredImage === 'string' ? art.featuredImage : art.featuredImage?.url) || art.image || art.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
                              const artCat = art.categoryName || art.categoryLabel || art.category || 'News';
                              const artAuthor = typeof art.author === 'object' && art.author ? art.author.name : (art.authorName || art.author || 'Editorial Bureau');
                              const artDate = art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (art.date || 'Today');

                              return (
                                <article 
                                  key={artId} 
                                  className="mhp-blog-card lse-hover-item"
                                  style={{ 
                                    position: 'relative',
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '2px solid #ea580c',
                                    boxShadow: '0 6px 20px rgba(234, 88, 12, 0.12)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.25s ease'
                                  }}
                                >
                                  {/* Top Control Bar: Rank Badge + Horizontal Action Buttons directly ABOVE the card image */}
                                  <div 
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '7px 10px',
                                      background: '#0f172a',
                                      borderBottom: '1px solid rgba(234, 88, 12, 0.35)',
                                      gap: '8px'
                                    }}
                                  >
                                    <div 
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 800 }}
                                      title={`Position #${aIdx + 1} • Live on Frontend Grid`}
                                    >
                                      <span style={{ color: '#fb923c' }}>#{aIdx + 1}</span>
                                      <span 
                                        style={{ 
                                          display: 'inline-flex', 
                                          alignItems: 'center', 
                                          gap: '4px', 
                                          color: '#4ade80', 
                                          fontSize: '0.64rem', 
                                          fontWeight: 900, 
                                          background: 'rgba(34, 197, 94, 0.16)',
                                          padding: '2px 6px',
                                          borderRadius: '4px'
                                        }}
                                      >
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                                        LIVE
                                      </span>
                                    </div>

                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        disabled={aIdx === 0}
                                        onClick={() => handleMoveFeedArticle(sec.id, aIdx, 'up')}
                                        title="Move Left (Earlier in Feed)"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '5px',
                                          border: '1px solid rgba(255, 255, 255, 0.15)',
                                          background: 'rgba(255, 255, 255, 0.1)',
                                          color: '#ffffff',
                                          cursor: aIdx === 0 ? 'not-allowed' : 'pointer',
                                          opacity: aIdx === 0 ? 0.35 : 1
                                        }}
                                      >
                                        <ArrowLeft size={13} />
                                      </button>

                                      <button
                                        type="button"
                                        disabled={aIdx === secArticles.length - 1}
                                        onClick={() => handleMoveFeedArticle(sec.id, aIdx, 'down')}
                                        title="Move Right (Later in Feed)"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '5px',
                                          border: '1px solid rgba(255, 255, 255, 0.15)',
                                          background: 'rgba(255, 255, 255, 0.1)',
                                          color: '#ffffff',
                                          cursor: aIdx === secArticles.length - 1 ? 'not-allowed' : 'pointer',
                                          opacity: aIdx === secArticles.length - 1 ? 0.35 : 1
                                        }}
                                      >
                                        <ArrowRight size={13} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenPicker({ sectionId: sec.id, type: 'feed-replace', index: aIdx })}
                                        title="Swap or Replace with another article"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '5px',
                                          border: '1px solid rgba(234, 88, 12, 0.4)',
                                          background: 'rgba(234, 88, 12, 0.25)',
                                          color: '#fb923c',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <ArrowLeftRight size={13} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFeedArticle(sec.id, aIdx)}
                                        title="Delete from feed"
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
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Thumbnail Wrap */}
                                  <div 
                                    className="mhp-blog-thumb-wrap"
                                    style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden', background: '#0f172a' }}
                                  >
                                    <div className="lse-card-img-overlay">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const newImg = window.prompt("Enter new photo URL for this article:", artImg);
                                          if (newImg && newImg.trim() && newImg !== artImg) {
                                            handleInlineArticleUpdate(sec.id, art, { image: newImg.trim(), featuredImage: newImg.trim() });
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
                                        <span>Change Photo</span>
                                      </button>
                                    </div>

                                    <img 
                                      src={artImg} 
                                      alt={artTitle} 
                                      className="mhp-blog-thumb"
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80';
                                      }}
                                    />

                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 65%, rgba(15, 23, 42, 0.75) 100%)', pointerEvents: 'none' }} />

                                    {/* Category Pill in Bottom-Left of Image */}
                                    <span 
                                      contentEditable={true}
                                      suppressContentEditableWarning={true}
                                      className="lse-direct-editable"
                                      onBlur={(e) => {
                                        const val = e.currentTarget.textContent.trim();
                                        if (val && val !== artCat) {
                                          handleInlineArticleUpdate(sec.id, art, { category: val, categoryName: val, categoryLabel: val });
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          e.currentTarget.blur();
                                        }
                                      }}
                                      title="Click directly to edit category badge"
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
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                        cursor: 'text'
                                      }}
                                    >
                                      {artCat}
                                    </span>
                                  </div>

                                  {/* Card Content Body */}
                                  <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', background: '#ffffff' }}>
                                    <div>
                                      <h3 
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        className="lse-direct-editable"
                                        onBlur={(e) => {
                                          const val = e.currentTarget.textContent.trim();
                                          if (val && val !== artTitle) {
                                            handleInlineArticleUpdate(sec.id, art, { title: val });
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.currentTarget.blur();
                                          }
                                        }}
                                        title="Click directly to edit title"
                                        style={{ 
                                          cursor: 'text',
                                          fontSize: '0.98rem',
                                          fontWeight: 750,
                                          lineHeight: 1.38,
                                          color: '#0f172a',
                                          margin: '0 0 8px',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden'
                                        }}
                                      >
                                        {artTitle}
                                      </h3>

                                      <p 
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        className="lse-direct-editable"
                                        onBlur={(e) => {
                                          const val = e.currentTarget.textContent.trim();
                                          if (val !== (art.excerpt || '')) {
                                            handleInlineArticleUpdate(sec.id, art, { excerpt: val, summary: val, subtitle: val });
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.currentTarget.blur();
                                          }
                                        }}
                                        title="Click directly to edit excerpt teaser"
                                        style={{
                                          fontSize: '0.82rem',
                                          color: '#64748b',
                                          lineHeight: 1.45,
                                          margin: '0 0 10px',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          cursor: 'text'
                                        }}
                                      >
                                        {art.excerpt || art.summary || 'Click directly to add lead excerpt teaser'}
                                      </p>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
                                        <span 
                                          contentEditable={true}
                                          suppressContentEditableWarning={true}
                                          className="lse-direct-editable"
                                          onBlur={(e) => {
                                            const val = e.currentTarget.textContent.trim();
                                            if (val && val !== artAuthor) {
                                              handleInlineArticleUpdate(sec.id, art, { author: val, authorName: val });
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              e.currentTarget.blur();
                                            }
                                          }}
                                          title="Click directly to edit author"
                                          style={{ color: '#475569', fontWeight: 650, cursor: 'text' }}
                                        >
                                          {artAuthor}
                                        </span>
                                        <span>•</span>
                                        <span>{artDate}</span>
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              );
                            })}

                            {/* + Plus Add Article Card */}
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
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '1.75rem 1.25rem',
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                              >
                                <div
                                  style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 22px rgba(234, 88, 12, 0.35)',
                                    marginBottom: '1rem'
                                  }}
                                >
                                  <Plus size={30} strokeWidth={2.6} />
                                </div>

                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
                                  + Add Article Card
                                </h4>

                                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.45, maxWidth: '220px' }}>
                                  {maxFit - secArticles.length} more card{maxFit - secArticles.length === 1 ? '' : 's'} fit in this feed
                                </p>

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
                              </div>
                            ) : null}
                          </div>
                        </section>
                      )}

                      {/* 3. NEWSLETTER BANNER SECTION (DIRECT IN-PLACE EDITABLE) */}
                      {isNewsletter && (
                        <section className="mhp-newsletter-section" style={{ margin: 0 }}>
                          <div 
                            className="mhp-newsletter-card" 
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', 
                              border: '1.5px solid rgba(234, 88, 12, 0.35)', 
                              borderRadius: '16px', 
                              padding: '2.5rem' 
                            }}
                          >
                            <div className="mhp-newsletter-left">
                              <div className="mhp-newsletter-icon-wrap" style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c' }}>
                                <Mail size={32} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h2 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="mhp-newsletter-title lse-direct-editable" 
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val && val !== (sec.data?.headline || sec.data?.title)) {
                                      handleUpdateSectionData(sec.id, { headline: val, title: val, heading: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit headline"
                                  style={{ color: '#ffffff', margin: '0 0 6px', outline: 'none', cursor: 'text' }}
                                >
                                  {sec.data?.headline || sec.data?.title || "Get the Latest Blogs Delivered to Your Inbox"}
                                </h2>
                                <p 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable" 
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val !== sec.data?.subtitle) {
                                      handleUpdateSectionData(sec.id, { subtitle: val, description: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit subtitle"
                                  style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8', outline: 'none', cursor: 'text' }}
                                >
                                  {sec.data?.subtitle || sec.data?.description || "Unfiltered insights on venture capital, frontier tech, and high-growth leadership directly in your inbox."}
                                </p>
                              </div>
                            </div>

                            <div className="mhp-newsletter-form">
                              <div className="mhp-newsletter-input-box" style={{ position: 'relative' }}>
                                <span
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val && val !== (sec.data?.placeholder || 'Enter your email address')) {
                                      handleUpdateSectionData(sec.id, { placeholder: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit placeholder"
                                  style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.9rem', cursor: 'text', display: 'inline-block', minWidth: '160px' }}
                                >
                                  {sec.data?.placeholder || "Enter your email address"}
                                </span>
                              </div>
                              <button 
                                type="button" 
                                className="mhp-newsletter-btn"
                                style={{ cursor: 'pointer' }}
                              >
                                <span
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val && val !== (sec.data?.buttonText || 'Subscribe')) {
                                      handleUpdateSectionData(sec.id, { buttonText: val, btnText: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit button label"
                                  style={{ color: '#ffffff', cursor: 'text' }}
                                >
                                  {sec.data?.buttonText || sec.data?.btnText || "Subscribe"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </section>
                      )}
                    </div>
                  );
                })
              )}
                <div
                  onClick={() => {
                    setInsertAtIndex(null);
                    setIsAddSectionModalOpen(true);
                  }}
                  role="button"
                  tabIndex={0}
                  title="Insert another section component to this page"
                  style={{
                    marginTop: '2rem',
                    padding: '2.5rem 1.5rem',
                    borderRadius: '16px',
                    border: '2px dashed rgba(234, 88, 12, 0.6)',
                    background: 'linear-gradient(180deg, rgba(255, 247, 237, 0.6) 0%, rgba(255, 255, 255, 0.8) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#ea580c',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <Plus size={26} strokeWidth={2.5} />
                  </div>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    + Add Another Section Component
                  </h3>
                  <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    Insert a new story feed, category desk, multimedia showcase, or banner to this page.
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────
          MODAL: ARTICLE PICKER FOR SLOTS & CARDS
         ───────────────────────────────────────────────────────── */}
      {isPickerOpen && (
        <div className="lbe-picker-overlay" onClick={() => setIsPickerOpen(false)}>
          <div className="lbe-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="lbe-picker-header">
              <h4 className="lbe-picker-title" style={{ margin: 0 }}>
                {pickerTarget?.type?.startsWith('hero') ? 'Select Article for Hero Banner' : 
                 pickerTarget?.type?.startsWith('popular') ? 'Select Article for Popular Posts' :
                 'Select Article for Feed Slot'}
              </h4>
              <button 
                type="button" 
                className="lbe-picker-close-btn"
                onClick={() => setIsPickerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lbe-picker-toolbar">
              <div className="lbe-picker-search-wrap">
                <input
                  type="text"
                  placeholder="Search articles by title, author, desk..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="lbe-picker-search-input"
                  autoFocus
                />
              </div>

              <div className="lbe-picker-categories">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`lbe-picker-cat-pill ${pickerCategory === cat ? 'active' : ''}`}
                    onClick={() => setPickerCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="lbe-picker-body">
              {filteredPickerArticles.length === 0 ? (
                <div className="lbe-picker-empty" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                  <p style={{ color: '#94a3b8' }}>No articles match your search query.</p>
                </div>
              ) : (
                <div className="lbe-picker-grid">
                  {filteredPickerArticles.map(art => {
                    const artId = art._id || art.id;
                    const artTitle = art.title || 'Untitled';
                    const artImg = (typeof art.featuredImage === 'string' ? art.featuredImage : art.featuredImage?.url) || art.image || art.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80';
                    const artCat = art.categoryName || art.categoryLabel || art.category || 'Startups';

                    return (
                      <div
                        key={artId}
                        className="lbe-picker-card"
                        onClick={() => handleSelectPickerArticle(art)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="lbe-picker-card-thumb-wrap">
                          <img src={artImg} alt={artTitle} className="lbe-picker-card-thumb" />
                          <span className="lbe-picker-card-category">{artCat}</span>
                        </div>
                        <div className="lbe-picker-card-content">
                          <h5 className="lbe-picker-card-title">{artTitle}</h5>
                          <button
                            type="button"
                            className="lbe-picker-select-btn article"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPickerArticle(art);
                            }}
                          >
                            Select Article
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          MODAL: ADD SECTION MODAL
         ───────────────────────────────────────────────────────── */}
      {isAddSectionModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddSectionModalOpen(false)}>
          <div className="section-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Add Page Section</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddSectionModalOpen(false)}
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
                    onClick={() => handleAddSectionDirectly(item.type)}
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

    </div>
  );
}
