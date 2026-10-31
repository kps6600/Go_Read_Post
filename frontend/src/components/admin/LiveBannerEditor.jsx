import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Sparkles, Plus, Trash2, 
  ArrowRight, ChevronLeft, ChevronRight,
  Monitor, Smartphone, ArrowUp, ArrowDown,
  Search, RefreshCw, Layers, Eye, EyeOff,
  Edit2, Edit3, Image as ImageIcon, Type, Play
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { HomepageService } from '../../services/homepageService';
import { VideoService } from '../../services/videoService';
import { ALL_STORIES } from '../../data/storiesData';
import { VIDEO_EPISODES } from '../../data/videoData';
import './LiveBannerEditor.css';
import './LiveSectionEditor.css';
import '../ModernHomepage.css';

// Category extraction helper supporting MongoDB models, API responses, and static pools
const extractCategory = (item) => {
  if (!item) return '';
  if (typeof item.categoryName === 'string' && item.categoryName.trim()) return item.categoryName.trim();
  if (typeof item.categoryLabel === 'string' && item.categoryLabel.trim()) return item.categoryLabel.trim();
  if (typeof item.category === 'string' && item.category.trim()) return item.category.trim();
  if (typeof item.category === 'object' && item.category) {
    const val = item.category.name || item.category.label || item.category.title || '';
    if (val && typeof val === 'string') return val.trim();
  }
  if (typeof item.series === 'string' && item.series.trim()) return item.series.trim();
  return '';
};

// Formatter to standardize an article or video object for Hero Slider
const formatForHeroSlide = (item) => {
  const id = item._id || item.id || `slide-${Date.now()}`;
  const title = item.title || 'Featured Story';
  const isVideo = item.itemType === 'video' || item.type === 'video' || !!item.duration || !!item.youtubeEmbedUrl;
  const excerpt = item.summary || item.excerpt || item.description || 
    (typeof item.content === 'string' ? item.content.slice(0, 160) : '') || 
    'Comprehensive reporting on innovation and founder journeys.';
  const category = extractCategory(item) || (isVideo ? 'Video' : 'Startups');
  const image = item.image || item.coverImage || item.bannerImage || item.fallbackImage || item.thumbnail ||
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80';
  const authorName = typeof item.author === 'object' 
    ? (item.author?.name || 'Editorial Bureau') 
    : (item.author || item.host || item.guest || 'Editorial Bureau');
  const authorAvatar = item.author?.avatar || item.authorAvatar || item.guestAvatar || 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const date = item.publishedAt || item.date || item.formattedDate || 'Today';
  const readTime = isVideo 
    ? (item.duration ? `🎬 ${item.duration}` : '🎬 Video') 
    : (item.readTime || (item.readingTime ? `${item.readingTime} min read` : '4 min read'));
  const slug = item.slug || id;
  const link = isVideo ? `/videos/${slug}` : `/stories/${slug}`;

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
    primaryBtnText: isVideo ? 'Watch Video' : 'Read More',
    link,
    slug,
    itemType: isVideo ? 'video' : 'article'
  };
};

// Formatter to standardize an article or video object for Popular Posts Sidebar
const formatForPopularPost = (item) => {
  const id = item._id || item.id || `popular-${Date.now()}`;
  const title = item.title || 'Popular Story';
  const isVideo = item.itemType === 'video' || item.type === 'video' || !!item.duration || !!item.youtubeEmbedUrl;
  const image = item.image || item.coverImage || item.fallbackImage || item.thumbnail || 
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80';
  const readTime = isVideo
    ? (item.duration ? `🎬 ${item.duration}` : '🎬 Video')
    : (item.readTime || (item.readingTime ? `${item.readingTime} min read` : '3 min read'));
  const category = extractCategory(item) || (isVideo ? 'Video' : 'Trending');
  const slug = item.slug || id;
  const link = isVideo ? `/videos/${slug}` : `/stories/${slug}`;
  const author = typeof item.author === 'object' ? (item.author?.name || 'Author') : (item.author || item.host || item.guest || 'Editorial');
  const date = item.publishedAt || item.date || 'Today';

  return {
    id,
    _id: item._id || id,
    title,
    image,
    coverImage: image,
    readTime,
    category,
    slug,
    link,
    author,
    date,
    itemType: isVideo ? 'video' : 'article'
  };
};

export default function LiveBannerEditor({ 
  section, 
  isOpen, 
  onClose, 
  onSave,
  stories = [],
  pageId = null,
  onAutoSave = null
}) {
  const [data, setData] = useState(() => section?.data || {});
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'mobile'
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [availableArticles, setAvailableArticles] = useState(() => {
    if (stories && stories.length > 0) return stories;
    return ALL_STORIES;
  });

  // Modal Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // { type: 'hero-add' | 'hero-replace' | 'popular-add' | 'popular-replace', index?: number }
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');
  const [availableVideos, setAvailableVideos] = useState(VIDEO_EPISODES);
  const [pickerContentType, setPickerContentType] = useState('all'); // 'all' | 'articles' | 'videos'
  const [selectedPickerCards, setSelectedPickerCards] = useState([]);

  // Slide Content Edit Modal State
  const [isSlideEditOpen, setIsSlideEditOpen] = useState(false);
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    image: '',
    primaryBtnText: 'Read More',
    link: '',
    author: ''
  });

  // Popular Title Inline Edit State
  const [isEditingPopularTitle, setIsEditingPopularTitle] = useState(false);
  const [popularTitleValue, setPopularTitleValue] = useState(() => data.popularTitle || 'Popular Posts');

  // Load published articles from database on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLiveArticles = async () => {
      try {
        const res = await ArticleService.getArticles({ limit: 150 });
        const list = Array.isArray(res?.data) ? res.data : [];
        if (isMounted) {
          if (list.length > 0) {
            setAvailableArticles(list);
          } else {
            setAvailableArticles(stories.length ? stories : ALL_STORIES);
          }
        }
      } catch (e) {
        if (isMounted && (!availableArticles || availableArticles.length === 0)) {
          setAvailableArticles(ALL_STORIES);
        }
      }
    };
    fetchLiveArticles();
    return () => { isMounted = false; };
  }, []);

  // Sync section data on open
  useEffect(() => {
    if (section?.data) {
      setData({ ...section.data });
    }
  }, [section]);

  // Pool of available stories & videos
  const pool = useMemo(() => {
    return availableArticles.length > 0 ? availableArticles : (stories.length ? stories : ALL_STORIES);
  }, [availableArticles, stories]);

  const videoPool = useMemo(() => {
    return availableVideos.length > 0 ? availableVideos : VIDEO_EPISODES;
  }, [availableVideos]);

  const combinedPool = useMemo(() => {
    const arts = pool.map(a => ({ ...a, itemType: 'article' }));
    const vids = videoPool.map(v => ({ 
      ...v, 
      itemType: 'video', 
      categoryLabel: v.categoryLabel || v.series || 'Video',
      category: v.categoryLabel || v.series || 'Video'
    }));
    if (pickerContentType === 'articles') return arts;
    if (pickerContentType === 'videos') return vids;
    return [...arts, ...vids];
  }, [pool, videoPool, pickerContentType]);

  // Filtered articles & videos inside the Picker Modal
  const filteredPickerArticles = useMemo(() => {
    return combinedPool.filter(a => {
      const title = (a.title || '').toLowerCase();
      const rawCat = extractCategory(a);
      const cat = rawCat.toLowerCase();
      const author = (typeof a.author === 'object' && a.author ? a.author.name || '' : (a.author || a.host || a.guest || '')).toLowerCase();
      const q = pickerSearch.trim().toLowerCase();

      const matchesSearch = !q || title.includes(q) || cat.includes(q) || author.includes(q);
      const matchesCat = pickerCategory === 'All' || cat === pickerCategory.toLowerCase() || cat.includes(pickerCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [combinedPool, pickerSearch, pickerCategory]);

  // Dynamic counts for each category in current content pool
  const categoryCounts = useMemo(() => {
    const counts = { All: combinedPool.length };
    combinedPool.forEach(a => {
      const c = extractCategory(a);
      if (c) {
        counts[c] = (counts[c] || 0) + 1;
      }
    });
    return counts;
  }, [combinedPool]);

  // Unique categories for picker filtering, strictly matched to active content type
  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    const targetPool = pickerContentType === 'articles' ? pool : (pickerContentType === 'videos' ? videoPool : combinedPool);
    
    targetPool.forEach(a => {
      const c = extractCategory(a);
      if (c && typeof c === 'string') cats.add(c.trim());
    });

    // Provide standard categories if few were discovered
    if (cats.size <= 2 && pickerContentType !== 'videos') {
      ['Startups', 'Technology', 'AI & DeepTech', 'HerStory', 'SMBStory', 'SocialStory'].forEach(c => cats.add(c));
    }
    return Array.from(cats).slice(0, 14);
  }, [pool, videoPool, combinedPool, pickerContentType]);

  if (!isOpen || !section) return null;

  // Initialize or retrieve popular articles (Sidebar 1-5)
  const rawPopular = Array.isArray(data.popularArticles) || data.hasCustomPopular
    ? (Array.isArray(data.popularArticles) ? data.popularArticles : []).filter(item => {
        if (!item) return false;
        if (item.title || item.image || item.isCustom || !item.articleId) return true;
        const id = String(item.articleId || item._id || item.id || item.slug);
        return pool.some(p => String(p._id || p.id || p.slug) === id || p.title === item.title) ||
               videoPool.some(v => String(v._id || v.id || v.slug) === id || v.title === item.title);
      })
    : null;

  const popularArticles = (rawPopular !== null
    ? rawPopular
    : pool.slice(0, Number(data.popularLimit) || 5).map(formatForPopularPost)).slice(0, 5);

  // Unified Content Flow:
  // If there is NO content in the popular list (popularArticles.length === 0), make the banner section empty ([]).
  // If any content is present in the popular list (popularArticles.length > 0), show it in the banner section!
  const rawSlides = Array.isArray(data.slides) && data.slides.length > 0
    ? data.slides.filter(s => {
        if (!s) return false;
        if (s.title || s.image || s.isCustom || !s.articleId) return true;
        const id = String(s.articleId || s.id || s._id || s.slug);
        return pool.some(p => String(p._id || p.id || p.slug) === id || p.title === s.title) ||
               videoPool.some(v => String(v._id || v.id || v.slug) === id || v.title === s.title);
      })
    : null;

  const slides = popularArticles.length > 0
    ? (rawSlides && rawSlides.length > 0 ? rawSlides : popularArticles.map(formatForHeroSlide))
    : [];

  const currentSlide = slides[activeSlideIdx] || slides[0] || {};
  const showPopular = data.showPopular !== false && pageId !== 'trending' && section?.id !== 'trending_hero';

  // ─────────────────────────────────────────────────────────
  
  const handleInlineSlideUpdate = (updates) => {
    if (slides.length === 0) return;
    const nextSlides = [...slides];
    nextSlides[activeSlideIdx] = {
      ...nextSlides[activeSlideIdx],
      ...updates
    };
    updateSlidesState(nextSlides, activeSlideIdx);
    persistToDatabase(nextSlides, popularArticles);
  };

  const handleInlinePopularUpdate = (idx, updates) => {
    if (!popularArticles[idx]) return;
    const nextPop = [...popularArticles];
    nextPop[idx] = {
      ...nextPop[idx],
      ...updates
    };
    updatePopularState(nextPop);
    persistToDatabase(slides, nextPop);
  };

  // INSTANT AUTO-SAVE PERSISTENCE TO DATABASE
  // ─────────────────────────────────────────────────────────
  const persistToDatabase = async (nextSlides, nextPopular) => {
    const sl = nextSlides !== undefined ? nextSlides : slides;
    const pop = nextPopular !== undefined ? nextPopular : popularArticles;

    const finalData = {
      ...data,
      slides: sl,
      popularArticles: pop,
      hasCustomSlides: true,
      hasCustomPopular: true,
      heroSource: 'custom',
      showPopular: showPopular,
      headline: sl.length > 0 ? (sl[0]?.title || '') : '',
      subheadline: sl.length > 0 ? (sl[0]?.excerpt || '') : '',
      badge: sl.length > 0 ? (sl[0]?.category || '') : '',
      bgImage: sl.length > 0 ? (sl[0]?.image || '') : '',
      image: sl.length > 0 ? (sl[0]?.image || '') : ''
    };

    setSaveStatus('saving');
    try {
      // 1. Instant parent auto-save
      if (onAutoSave) {
        onAutoSave(finalData).catch(() => {});
      }

      // 2. Direct instant API update to homepage section
      HomepageService.updateSection('hero_popular', {
        data: finalData,
        customConfig: finalData
      }).catch(() => {});

      // 3. Direct instant broadcast to live frontend views & storage
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('homepage:change', { detail: [{ sectionKey: 'hero_popular', data: finalData, customConfig: finalData }] }));
        window.dispatchEvent(new CustomEvent('page:change'));
        try {
          localStorage.setItem('homepage_last_updated', Date.now().toString());
        } catch (e) {}
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Failed to auto-save banner change:', err);
      setSaveStatus('error');
    }
  };

  // ─────────────────────────────────────────────────────────
  // HERO SLIDE ACTIONS & REORDERING
  // ─────────────────────────────────────────────────────────
  const handleOpenSlideEditor = () => {
    const s = slides[activeSlideIdx] || {};
    setSlideFormData({
      title: s.title || '',
      excerpt: s.excerpt || '',
      category: s.category || '',
      image: s.image || '',
      primaryBtnText: s.primaryBtnText || 'Read More',
      link: s.link || '',
      author: s.author || 'Editorial Bureau'
    });
    setIsSlideEditOpen(true);
  };

  const handleCreateCustomSlide = () => {
    const newCustomSlide = {
      id: `custom-slide-${Date.now()}`,
      title: 'New Custom Headline',
      excerpt: 'Add your summary or excerpt here...',
      category: 'FEATURED',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
      author: 'Editorial Bureau',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      date: 'Today',
      readTime: '3 min read',
      primaryBtnText: 'Read More',
      link: '/latest',
      isCustom: true
    };
    const nextSlides = [...slides, newCustomSlide];
    const newIdx = nextSlides.length - 1;
    updateSlidesState(nextSlides, newIdx);
    persistToDatabase(nextSlides, popularArticles);
    setSlideFormData({
      title: newCustomSlide.title,
      excerpt: newCustomSlide.excerpt,
      category: newCustomSlide.category,
      image: newCustomSlide.image,
      primaryBtnText: newCustomSlide.primaryBtnText,
      link: newCustomSlide.link,
      author: newCustomSlide.author
    });
    setIsSlideEditOpen(true);
  };

  const handleSaveSlideEditor = () => {
    const nextSlides = [...slides];
    nextSlides[activeSlideIdx] = {
      ...nextSlides[activeSlideIdx],
      ...slideFormData,
      title: slideFormData.title.trim() || 'Headline Story',
      headline: slideFormData.title.trim() || 'Headline Story',
      excerpt: slideFormData.excerpt,
      subheadline: slideFormData.excerpt,
      category: slideFormData.category,
      badge: slideFormData.category,
      image: slideFormData.image,
      bgImage: slideFormData.image,
      isCustom: true
    };
    updateSlidesState(nextSlides, activeSlideIdx);
    persistToDatabase(nextSlides, popularArticles);
    setIsSlideEditOpen(false);
  };

  const handleSavePopularTitle = () => {
    const trimmed = (popularTitleValue || '').trim() || 'Popular Posts';
    setData(prev => ({ ...prev, popularTitle: trimmed }));
    setIsEditingPopularTitle(false);
    const finalData = { ...data, popularTitle: trimmed, slides, popularArticles };
    if (onAutoSave) onAutoSave(finalData);
  };

    const updateSlidesState = (newSlides, newActiveIdx = null) => {
    setData(prev => ({
      ...prev,
      slides: newSlides,
      hasCustomSlides: true,
      heroSource: 'custom',
      headline: newSlides.length > 0 ? (newSlides[0]?.title || '') : '',
      subheadline: newSlides.length > 0 ? (newSlides[0]?.excerpt || '') : '',
      badge: newSlides.length > 0 ? (newSlides[0]?.category || '') : '',
      bgImage: newSlides.length > 0 ? (newSlides[0]?.image || '') : '',
      image: newSlides.length > 0 ? (newSlides[0]?.image || '') : ''
    }));
    if (newActiveIdx !== null && newActiveIdx >= 0) {
      setActiveSlideIdx(newActiveIdx);
    } else {
      setActiveSlideIdx(0);
    }
  };

  // Move slide position earlier (Up/Left)
  const handleMoveSlideEarlier = (idx) => {
    if (idx <= 0) return;
    const next = [...slides];
    const temp = next[idx];
    next[idx] = next[idx - 1];
    next[idx - 1] = temp;
    updateSlidesState(next, idx - 1);
    persistToDatabase(next, popularArticles);
  };

  // Move slide position later (Down/Right)
  const handleMoveSlideLater = (idx) => {
    if (idx >= slides.length - 1) return;
    const next = [...slides];
    const temp = next[idx];
    next[idx] = next[idx + 1];
    next[idx + 1] = temp;
    updateSlidesState(next, idx + 1);
    persistToDatabase(next, popularArticles);
  };

  // Delete slide from carousel (allows clearing to 0 slides)
  const handleDeleteSlide = (idx, e) => {
    e?.stopPropagation();
    const next = slides.filter((_, i) => i !== idx);
    const newIdx = Math.max(0, Math.min(activeSlideIdx, next.length - 1));
    updateSlidesState(next, newIdx);
    persistToDatabase(next, popularArticles);
  };

  // ─────────────────────────────────────────────────────────
  // POPULAR POSTS ACTIONS & REORDERING
  // ─────────────────────────────────────────────────────────
  const updatePopularState = (newPopular) => {
    setData(prev => ({
      ...prev,
      popularArticles: newPopular,
      hasCustomPopular: true
    }));
  };

  // Move popular post position up (e.g. #2 to #1)
  const handleMovePopularUp = (idx) => {
    if (idx <= 0) return;
    const next = [...popularArticles];
    const temp = next[idx];
    next[idx] = next[idx - 1];
    next[idx - 1] = temp;
    updatePopularState(next);
    persistToDatabase(slides, next);
  };

  // Move popular post position down (e.g. #1 to #2)
  const handleMovePopularDown = (idx) => {
    if (idx >= popularArticles.length - 1) return;
    const next = [...popularArticles];
    const temp = next[idx];
    next[idx] = next[idx + 1];
    next[idx + 1] = temp;
    updatePopularState(next);
    persistToDatabase(slides, next);
  };

  // Remove article from popular posts
  const handleDeletePopular = (idx) => {
    const next = popularArticles.filter((_, i) => i !== idx);
    const nextSlides = next.length > 0 ? next.map(formatForHeroSlide) : [];
    setData(prev => ({
      ...prev,
      popularArticles: next,
      slides: nextSlides,
      hasCustomPopular: true,
      hasCustomSlides: true,
      headline: nextSlides.length > 0 ? (nextSlides[0]?.title || '') : '',
      subheadline: nextSlides.length > 0 ? (nextSlides[0]?.excerpt || '') : '',
      badge: nextSlides.length > 0 ? (nextSlides[0]?.category || '') : '',
      bgImage: nextSlides.length > 0 ? (nextSlides[0]?.image || '') : '',
      image: nextSlides.length > 0 ? (nextSlides[0]?.image || '') : ''
    }));
    persistToDatabase(nextSlides, next);
  };

  // ─────────────────────────────────────────────────────────
  // ARTICLE PICKER HANDLER
  // ─────────────────────────────────────────────────────────
  const handleSwitchPickerContentType = (type) => {
    setPickerContentType(type);
    setPickerCategory('All');
  };

  const handleOpenPicker = (target) => {
    if (target?.type === 'popular-add' && popularArticles.length >= 5) {
      alert("Popular Posts is full (5/5 cards). Please delete a card before selecting more.");
      return;
    }
    setSelectedPickerCards([]);
    setPickerTarget(target);
    setPickerSearch('');
    setPickerCategory('All');
    setPickerContentType(target?.mode || target?.defaultTab || 'articles');
    setIsPickerOpen(true);
  };

  const handleConfirmAddSelected = () => {
    if (selectedPickerCards.length === 0) return;
    const remaining = Math.max(0, 5 - popularArticles.length);
    if (remaining <= 0) {
      alert("Popular Posts is full (5/5 cards).");
      setIsPickerOpen(false);
      setSelectedPickerCards([]);
      return;
    }
    const toAdd = selectedPickerCards.slice(0, remaining).map(formatForPopularPost);
    const nextPop = [...popularArticles, ...toAdd].slice(0, 5);
    const nextSlides = nextPop.map(formatForHeroSlide);
    setData(prev => ({
      ...prev,
      popularArticles: nextPop,
      slides: nextSlides,
      hasCustomPopular: true,
      hasCustomSlides: true,
      headline: nextSlides[0]?.title || '',
      subheadline: nextSlides[0]?.excerpt || '',
      badge: nextSlides[0]?.category || '',
      bgImage: nextSlides[0]?.image || '',
      image: nextSlides[0]?.image || ''
    }));
    persistToDatabase(nextSlides, nextPop);
    setIsPickerOpen(false);
    setSelectedPickerCards([]);
  };

  const handleSelectArticleFromPicker = (article) => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'hero-add') {
      const newSlide = formatForHeroSlide(article);
      const nextSlides = [...slides, newSlide];
      updateSlidesState(nextSlides, nextSlides.length - 1);
      persistToDatabase(nextSlides, popularArticles);
    } else if (pickerTarget.type === 'hero-replace') {
      const targetIdx = pickerTarget.index ?? activeSlideIdx;
      const nextSlides = [...slides];
      nextSlides[targetIdx] = formatForHeroSlide(article);
      updateSlidesState(nextSlides, targetIdx);
      persistToDatabase(nextSlides, popularArticles);
    } else if (pickerTarget.type === 'popular-add') {
      const remaining = Math.max(0, 5 - popularArticles.length);
      if (remaining <= 0) {
        alert("Popular Posts is full (5/5 cards). You cannot select more cards.");
        setIsPickerOpen(false);
        return;
      }
      const newPop = formatForPopularPost(article);
      const nextPop = [...popularArticles, newPop].slice(0, 5);
      const nextSlides = nextPop.map(formatForHeroSlide);
      setData(prev => ({
        ...prev,
        popularArticles: nextPop,
        slides: nextSlides,
        hasCustomPopular: true,
        hasCustomSlides: true,
        headline: nextSlides[0]?.title || '',
        subheadline: nextSlides[0]?.excerpt || '',
        badge: nextSlides[0]?.category || '',
        bgImage: nextSlides[0]?.image || '',
        image: nextSlides[0]?.image || ''
      }));
      persistToDatabase(nextSlides, nextPop);
    } else if (pickerTarget.type === 'popular-replace') {
      const targetIdx = pickerTarget.index;
      const nextPop = [...popularArticles];
      nextPop[targetIdx] = formatForPopularPost(article);
      updatePopularState(nextPop);
      persistToDatabase(slides, nextPop);
    }

    setIsPickerOpen(false);
  };

  // ─────────────────────────────────────────────────────────
  // APPLY / SAVE TO PAGE
  // ─────────────────────────────────────────────────────────
  const handleSaveAndApply = async () => {
    const finalData = {
      ...data,
      slides: slides,
      popularArticles: popularArticles,
      hasCustomSlides: true,
      hasCustomPopular: true,
      heroSource: 'custom',
      showPopular: showPopular,
      headline: slides.length > 0 ? (slides[0]?.title || '') : (data.headline || ''),
      subheadline: slides.length > 0 ? (slides[0]?.excerpt || '') : (data.subheadline || ''),
      badge: slides.length > 0 ? (slides[0]?.category || '') : (data.badge || ''),
      bgImage: slides.length > 0 ? (slides[0]?.image || '') : (data.bgImage || ''),
      image: slides.length > 0 ? (slides[0]?.image || '') : (data.image || '')
    };
    setSaveStatus('saving');
    try {
      // Direct instant API update
      await HomepageService.updateSection('hero_popular', {
        data: finalData,
        customConfig: finalData
      }).catch(() => {});

      if (onSave) {
        await onSave(finalData);
      } else if (onAutoSave) {
        await onAutoSave(finalData);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('homepage:change', { detail: [{ sectionKey: 'hero_popular', data: finalData, customConfig: finalData }] }));
        window.dispatchEvent(new CustomEvent('page:change'));
        try {
          localStorage.setItem('homepage_last_updated', Date.now().toString());
        } catch (e) {}
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save banner:', err);
      setSaveStatus('error');
    }
  };

  const remainingPopularSlots = Math.max(0, 5 - popularArticles.length);
  const isPopularAdd = pickerTarget?.type === 'popular-add';
  const maxSelectable = isPopularAdd ? remainingPopularSlots : 1;

  return (
    <div className="lbe-overlay">
      {/* Sleek Floating Save Button */}
      <button
        type="button"
        className="lbe-floating-save-btn"
        onClick={handleSaveAndApply}
        disabled={saveStatus === 'saving'}
        title="Save changes live to homepage"
        style={{
          position: 'fixed',
          top: '16px',
          right: '60px',
          zIndex: 99999,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '8px 20px',
          background: saveStatus === 'saved' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : saveStatus === 'error'
            ? '#ef4444'
            : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          fontSize: '0.84rem',
          fontWeight: 750,
          cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow: saveStatus === 'saved'
            ? '0 4px 14px rgba(16, 185, 129, 0.45)'
            : '0 4px 14px rgba(234, 88, 12, 0.45)',
          transition: 'all 0.2s ease'
        }}
      >
        {saveStatus === 'saving' ? (
          <>
            <RefreshCw size={14} className="lbe-spin" />
            <span>Saving...</span>
          </>
        ) : saveStatus === 'saved' ? (
          <>
            <Check size={16} />
            <span>Saved Live!</span>
          </>
        ) : saveStatus === 'error' ? (
          <>
            <span>Failed (Retry)</span>
          </>
        ) : (
          <>
            <Check size={16} />
            <span>Save</span>
          </>
        )}
      </button>

      <button
        type="button"
        className="lse-floating-close-btn"
        onClick={onClose}
        title="Close"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        }}
      >
        <X size={17} />
      </button>

      {/* ── Main Studio Canvas ── */}
      <main className="lbe-workspace">
        <div className={`lbe-canvas-wrapper ${deviceView === 'mobile' ? 'mobile-view' : ''}`}>

          {/* ── Live Banner Section ── */}
          <section className={`mhp-hero-popular-grid ${!showPopular ? 'full-width' : ''}`}>
            
            {/* ── Left Hero Slide Card ── */}
            <div 
              className={`mhp-hero-card ${slides.length === 0 ? 'empty-hero' : ''}`}
              style={{ 
                backgroundImage: slides.length > 0 && currentSlide.image ? `url(${currentSlide.image})` : 'none',
                position: 'relative'
              }}
            >
              {slides.length > 0 ? (
                <>
                  <div className="mhp-hero-overlay" />

                  {/* Direct Change Photo Overlay Button */}
                  <div className="lse-card-img-overlay" style={{ top: '16px', right: '16px', zIndex: 30 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentImg = currentSlide.image || '';
                        const newImg = window.prompt("Enter new background photo URL for this hero slide:", currentImg);
                        if (newImg && newImg.trim() && newImg !== currentImg) {
                          handleInlineSlideUpdate({ image: newImg.trim(), bgImage: newImg.trim() });
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



                  {/* Real Article Content on Hero Slide */}
                  <div className="mhp-hero-content">
                    {currentSlide.category && (
                      <div style={{ marginBottom: '0.65rem' }}>
                        <span 
                          style={{
                            background: 'rgba(234, 88, 12, 0.3)',
                            border: '1px solid rgba(234, 88, 12, 0.6)',
                            color: '#fb923c',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <span 
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          className="lse-direct-editable"
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent.trim();
                            if (val && val !== currentSlide.category) {
                              handleInlineSlideUpdate({ category: val, badge: val });
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
                          {currentSlide.category}
                        </span>
                        </span>
                      </div>
                    )}

                    <h1 
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className="mhp-hero-title lse-direct-editable" 
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim();
                        if (val && val !== currentSlide.title) {
                          handleInlineSlideUpdate({ title: val, headline: val });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      title="Click directly on text to edit headline"
                      style={{ margin: '0 0 1rem', lineHeight: 1.2, cursor: 'text' }}
                    >
                      {currentSlide.title}
                    </h1>

                    <p 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        className="mhp-hero-desc lse-direct-editable" 
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val !== currentSlide.excerpt) {
                            handleInlineSlideUpdate({ excerpt: val, subheadline: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title="Click directly on text to edit excerpt"
                        style={{ margin: '0 0 1.25rem', cursor: 'text' }}
                      >
                        {currentSlide.excerpt || 'Click directly to edit excerpt'}
                      </p>

                    <div className="mhp-author-meta" style={{ flexWrap: 'wrap', gap: '8px' }}>
                      {currentSlide.authorAvatar && (
                        <img 
                          src={currentSlide.authorAvatar} 
                          alt={currentSlide.author || ''} 
                          className="mhp-author-avatar"
                        />
                      )}
                      {currentSlide.author && (
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{currentSlide.author}</span>
                      )}
                      {currentSlide.date && (
                        <>
                          <span className="mhp-meta-sep">•</span>
                          <span style={{ color: '#cbd5e1' }}>{currentSlide.date}</span>
                        </>
                      )}
                      {currentSlide.readTime && (
                        <>
                          <span className="mhp-meta-sep">•</span>
                          <span style={{ color: '#cbd5e1' }}>{currentSlide.readTime}</span>
                        </>
                      )}
                    </div>

                    <div className="mhp-hero-bottom-actions">
                      <div className="mhp-hero-read-btn">
                        <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        className="lse-direct-editable"
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== (currentSlide.primaryBtnText || 'Read More')) {
                            handleInlineSlideUpdate({ primaryBtnText: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title="Click directly to edit button label"
                        style={{ cursor: 'text' }}
                      >
                        {currentSlide.primaryBtnText || 'Read More'}
                      </span>
                        <ArrowRight size={15} color="#0f172a" />
                      </div>
                      {currentSlide.category && (
                        <span className="mhp-category-tag">
                          {currentSlide.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slider Dots Navigation */}
                  {slides.length > 1 && (
                    <div className="mhp-slider-nav">
                      <div className="mhp-slider-dots">
                        {slides.map((_, idx) => (
                          <span 
                            key={idx}
                            className={`mhp-slider-dot ${idx === activeSlideIdx ? 'active' : ''}`}
                            onClick={() => setActiveSlideIdx(idx)}
                          />
                        ))}
                      </div>
                      <button 
                        type="button"
                        className="mhp-slider-btn" 
                        onClick={() => setActiveSlideIdx((activeSlideIdx - 1 + slides.length) % slides.length)}
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        type="button"
                        className="mhp-slider-btn" 
                        onClick={() => setActiveSlideIdx((activeSlideIdx + 1) % slides.length)}
                        aria-label="Next slide"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="lbe-hero-empty-state">
                  <h3 className="lbe-hero-empty-title">Hero Banner</h3>
                </div>
              )}
            </div>


            {/* ── Right Popular Posts Sidebar (With Position Up/Down Reorder) ── */}
            {showPopular && (
              <div className="mhp-popular-card">
                <div className="mhp-section-header" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div className="mhp-section-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span 
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className="lse-direct-editable"
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim();
                        if (val && val !== (data.popularTitle || 'Popular Posts')) {
                          setData(prev => ({ ...prev, popularTitle: val }));
                          const finalData = { ...data, popularTitle: val, slides, popularArticles };
                          if (onAutoSave) onAutoSave(finalData);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      title="Click directly to edit section title"
                      style={{ fontWeight: 800, fontSize: '1.1rem', cursor: 'text' }}
                    >
                      {data.popularTitle || 'Popular Posts'}
                    </span>
                  </div>

                  {/* Header Add Buttons: Split for Article vs Video */}
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
                      title={popularArticles.length >= 5 ? "Popular Posts is full (5/5 cards). Delete a card first to select new ones." : "Open All Articles popup to add an article to Popular Posts (Max 5)"}
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Article</span>
                    </button>
                    <button
                      type="button"
                      className="lbe-btn-add-mini video"
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
                        handleOpenPicker({ type: 'popular-add', mode: 'videos' });
                      }}
                      title={popularArticles.length >= 5 ? "Popular Posts is full (5/5 cards). Delete a card first to select new ones." : "Open All Videos popup to add a video to Popular Posts (Max 5)"}
                    >
                      <Play size={9} fill="currentColor" />
                      <span>Video</span>
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
                        {/* Rank Number */}
                        <div className="mhp-popular-rank" title={`Position #${idx + 1}`}>
                          {idx + 1}
                        </div>

                        {/* Thumbnail */}
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="mhp-popular-thumb"
                          loading="lazy"
                        />

                        {/* Info */}
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
                            {item.category && (
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
                              {item.category} •
                            </span>
                          )}
                            {item.readTime || '3 min read'}
                          </span>
                        </div>

                        {/* Direct Position Reorder & Change Controls */}
                        <div className="lbe-item-reorder-group">
                          <button
                            type="button"
                            className="lbe-reorder-btn arrow-btn"
                            disabled={idx === 0}
                            onClick={() => handleMovePopularUp(idx)}
                            title={`Move Up to Position #${idx}`}
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            className="lbe-reorder-btn arrow-btn"
                            disabled={idx === popularArticles.length - 1}
                            onClick={() => handleMovePopularDown(idx)}
                            title={`Move Down to Position #${idx + 2}`}
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            className="lbe-reorder-btn danger"
                            onClick={() => handleDeletePopular(idx)}
                            title="Remove from popular posts"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}


                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────
          ARTICLE PICKER MODAL
         ───────────────────────────────────────────────────────── */}
      {isPickerOpen && (
        <div className="lbe-picker-overlay" onClick={() => setIsPickerOpen(false)}>
          <div className="lbe-picker-modal" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="lbe-picker-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 className="lbe-picker-title" style={{ margin: 0 }}>
                  <Layers size={18} color="#38bdf8" />
                  <span>
                    {pickerTarget?.mode === 'videos' || pickerContentType === 'videos'
                      ? 'All Videos Catalog (Select for Popular Posts)'
                      : 'All Articles Library (Select for Popular Posts)'}
                  </span>
                </h4>
                {isPopularAdd && (
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: selectedPickerCards.length === maxSelectable ? 'rgba(34, 197, 94, 0.16)' : 'rgba(56, 189, 248, 0.14)',
                    color: selectedPickerCards.length === maxSelectable ? '#4ade80' : '#38bdf8',
                    border: '1px solid ' + (selectedPickerCards.length === maxSelectable ? 'rgba(34, 197, 94, 0.35)' : 'rgba(56, 189, 248, 0.3)'),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    {selectedPickerCards.length > 0 
                      ? selectedPickerCards.length + '/' + maxSelectable + ' Selected' 
                      : maxSelectable + ' slot' + (maxSelectable > 1 ? 's' : '') + ' left to select'}
                  </span>
                )}
              </div>
              <button 
                type="button" 
                className="lbe-picker-close-btn"
                onClick={() => {
                  setIsPickerOpen(false);
                  setSelectedPickerCards([]);
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search, Tabs, and Category Filters */}
            <div className="lbe-picker-toolbar">
              {/* Only show tabs if not in dedicated mode */}
              {!pickerTarget?.mode && (
                <div className="lbe-picker-type-tabs">
                  <button
                    type="button"
                    className={`lbe-picker-type-tab ${pickerContentType === 'articles' ? 'active' : ''}`}
                    onClick={() => handleSwitchPickerContentType('articles')}
                  >
                    📄 Articles ({pool.length})
                  </button>
                  <button
                    type="button"
                    className={`lbe-picker-type-tab ${pickerContentType === 'videos' ? 'active' : ''}`}
                    onClick={() => handleSwitchPickerContentType('videos')}
                  >
                    🎬 Videos ({videoPool.length})
                  </button>
                </div>
              )}

              <div className="lbe-picker-search-wrap">
                <div className="lbe-picker-search-icon-box">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder={pickerTarget?.mode === 'videos' || pickerContentType === 'videos' ? 'Search videos by title, series, guest...' : 'Search articles by title, author, desk...'}
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="lbe-picker-search-input"
                  autoFocus
                />
                <div className="lbe-picker-search-actions">
                  {pickerSearch && (
                    <button 
                      type="button" 
                      onClick={() => setPickerSearch('')}
                      className="lbe-picker-search-clear-btn"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <span className="lbe-picker-search-count-badge">
                    {filteredPickerArticles.length} {filteredPickerArticles.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="lbe-picker-categories">
                {availableCategories.map(cat => {
                  const isActive = pickerCategory === cat;
                  const count = categoryCounts[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`lbe-picker-cat-pill ${isActive ? 'active' : ''}`}
                      onClick={() => setPickerCategory(cat)}
                    >
                      <span className="lbe-picker-cat-name">{cat}</span>
                      {count !== undefined && (
                        <span className="lbe-picker-cat-badge">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Articles & Videos List / Grid */}
            <div className="lbe-picker-body">
              {filteredPickerArticles.length === 0 ? (
                <div className="lbe-picker-empty">
                  <p>No content found matching "{pickerSearch}".</p>
                </div>
              ) : (
                <div className="lbe-picker-grid">
                  {filteredPickerArticles.map(article => {
                    const artId = article._id || article.id || article.slug || article.title;
                    const artTitle = article.title || 'Untitled';
                    const artImg = article.image || article.coverImage || article.fallbackImage || article.thumbnail || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
                    const isVid = article.itemType === 'video' || !!article.duration || !!article.youtubeEmbedUrl;
                    const artCat = extractCategory(article) || (isVid ? 'Video' : 'Article');
                    const artAuthor = typeof article.author === 'object' ? (article.author?.name || 'Author') : (article.author || article.host || article.guest || 'Author');
                    const artDate = isVid ? (article.duration ? ('\u{1F3AC} ' + article.duration) : '\u{1F3AC} Video') : (article.publishedAt || article.date || 'Recent');

                    const alreadyInPopular = isPopularAdd && popularArticles.some(p => {
                      const pId = p._id || p.id || p.slug || p.title;
                      return pId && artId && String(pId).trim().toLowerCase() === String(artId).trim().toLowerCase();
                    });

                    const isSelected = selectedPickerCards.some(a => {
                      const aId = a._id || a.id || a.slug || a.title;
                      return aId && artId && String(aId).trim().toLowerCase() === String(artId).trim().toLowerCase();
                    });

                    const isSlotsFull = isPopularAdd && !isSelected && selectedPickerCards.length >= maxSelectable;

                    const handleCardInteraction = () => {
                      if (alreadyInPopular) return;

                      if (!isPopularAdd || maxSelectable <= 1) {
                        handleSelectArticleFromPicker(article);
                        return;
                      }

                      // Multi-select mode
                      if (isSelected) {
                        setSelectedPickerCards(prev => prev.filter(a => {
                          const aId = a._id || a.id || a.slug || a.title;
                          return String(aId).trim().toLowerCase() !== String(artId).trim().toLowerCase();
                        }));
                      } else {
                        if (selectedPickerCards.length >= maxSelectable) {
                          alert('You can select only max ' + maxSelectable + ' card' + (maxSelectable > 1 ? 's' : '') + ' (' + maxSelectable + ' slot' + (maxSelectable > 1 ? 's' : '') + ' left to select).');
                          return;
                        }
                        setSelectedPickerCards(prev => [...prev, article]);
                      }
                    };

                    return (
                      <div 
                        key={artId} 
                        className={'lbe-picker-card' + (isSelected ? ' selected' : '') + (alreadyInPopular ? ' already-added' : '')}
                        style={{
                          ...(isSelected ? { borderColor: '#38bdf8', boxShadow: '0 0 0 2px rgba(56, 189, 248, 0.45)' } : {}),
                          ...(alreadyInPopular ? { opacity: 0.55, cursor: 'not-allowed' } : {})
                        }}
                        onClick={handleCardInteraction}
                      >
                        <div className="lbe-picker-card-thumb-wrap">
                          <img src={artImg} alt={artTitle} className="lbe-picker-card-thumb" />
                          <span className={'lbe-picker-card-category' + (isVid ? ' video' : '')}>
                            {isVid ? ('\u{1F3AC} ' + artCat) : artCat}
                          </span>
                          {alreadyInPopular && (
                            <span style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(15, 23, 42, 0.85)',
                              color: '#94a3b8',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(148, 163, 184, 0.3)'
                            }}>
                              In Popular
                            </span>
                          )}
                          {isSelected && (
                            <span style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#22c55e',
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.5)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Check size={11} strokeWidth={3} />
                              <span>Selected</span>
                            </span>
                          )}
                        </div>
                        <div className="lbe-picker-card-content">
                          <h5 className="lbe-picker-card-title">{artTitle}</h5>
                          <div className="lbe-picker-card-meta">
                            <span>{artAuthor}</span>
                            <span>•</span>
                            <span>{artDate}</span>
                          </div>
                          <button 
                            type="button" 
                            disabled={alreadyInPopular || isSlotsFull}
                            className={'lbe-picker-select-btn ' + (isVid ? 'video' : 'article') + (isSelected ? ' selected' : '')}
                            style={
                              alreadyInPopular
                                ? { opacity: 0.5, cursor: 'not-allowed', background: '#334155', color: '#94a3b8' }
                                : isSelected
                                ? { background: '#16a34a', color: '#ffffff', borderColor: '#22c55e' }
                                : isSlotsFull
                                ? { opacity: 0.45, cursor: 'not-allowed', background: '#1e293b', color: '#64748b' }
                                : {}
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardInteraction();
                            }}
                          >
                            {alreadyInPopular ? (
                              <span>Already in Popular</span>
                            ) : isSelected ? (
                              <>
                                <Check size={13} strokeWidth={3} />
                                <span>Selected ({selectedPickerCards.findIndex(a => {
                                  const aId = a._id || a.id || a.slug || a.title;
                                  return String(aId).trim().toLowerCase() === String(artId).trim().toLowerCase();
                                }) + 1}/{maxSelectable})</span>
                              </>
                            ) : isSlotsFull ? (
                              <span>Max ({maxSelectable}) Selected</span>
                            ) : isVid ? (
                              <>
                                <Play size={11} fill="currentColor" />
                                <span>{maxSelectable > 1 ? 'Select Video' : 'Select This Video'}</span>
                              </>
                            ) : (
                              <>
                                <Check size={13} />
                                <span>{maxSelectable > 1 ? 'Select Article' : 'Select This Article'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Multi-Select Floating Footer Bar when more than 1 slot is open */}
            {isPopularAdd && maxSelectable > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                background: '#0b1120',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'sticky',
                bottom: 0,
                zIndex: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>
                    <strong>{selectedPickerCards.length}</strong> of <strong>{maxSelectable}</strong> card{maxSelectable > 1 ? 's' : ''} selected
                  </span>
                  {selectedPickerCards.length < maxSelectable && (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      ({maxSelectable - selectedPickerCards.length} slot{maxSelectable - selectedPickerCards.length > 1 ? 's' : ''} left)
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedPickerCards.length > 0 && (
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        padding: '6px 14px',
                        borderRadius: '7px',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedPickerCards([])}
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={selectedPickerCards.length === 0}
                    style={{
                      background: selectedPickerCards.length > 0 ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                      color: selectedPickerCards.length > 0 ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '7px 18px',
                      borderRadius: '7px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: selectedPickerCards.length > 0 ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={handleConfirmAddSelected}
                  >
                    <Check size={15} strokeWidth={2.5} />
                    <span>
                      {selectedPickerCards.length > 0
                        ? ('Add ' + selectedPickerCards.length + ' Card' + (selectedPickerCards.length > 1 ? 's' : '') + ' to Popular Posts')
                        : ('Select up to ' + maxSelectable + ' Cards')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* —— Slide Content & Photo Editor Modal —— */}
      {isSlideEditOpen && (
        <div className="lbe-slide-edit-overlay" onClick={() => setIsSlideEditOpen(false)}>
          <div className="lbe-slide-edit-modal" onClick={e => e.stopPropagation()}>
            <div className="lbe-slide-edit-header">
              <h4>
                <Edit3 size={17} color="#fb923c" />
                <span>Edit Hero Slide #{activeSlideIdx + 1} Content</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsSlideEditOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lbe-slide-edit-body">
              <div className="lbe-input-group">
                <label>Badge / Category Tag</label>
                <input
                  type="text"
                  value={slideFormData.category}
                  onChange={e => setSlideFormData(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. STARTUPS, DEEPTECH FOCUS, BREAKING"
                />
              </div>

              <div className="lbe-input-group">
                <label>Main Headline *</label>
                <input
                  type="text"
                  value={slideFormData.title}
                  onChange={e => setSlideFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Compelling story headline"
                />
              </div>

              <div className="lbe-input-group">
                <label>Subheadline / Lead Excerpt</label>
                <textarea
                  rows={3}
                  value={slideFormData.excerpt}
                  onChange={e => setSlideFormData(p => ({ ...p, excerpt: e.target.value }))}
                  placeholder="Lead paragraph or executive summary"
                />
              </div>

              <div className="lbe-input-group">
                <label>Hero Background Image URL</label>
                <input
                  type="text"
                  value={slideFormData.image}
                  onChange={e => setSlideFormData(p => ({ ...p, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                />
                {slideFormData.image && (
                  <div style={{ marginTop: '8px', maxHeight: '140px', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={slideFormData.image} alt="Slide Preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="lbe-input-group">
                  <label>Primary Button Text</label>
                  <input
                    type="text"
                    value={slideFormData.primaryBtnText}
                    onChange={e => setSlideFormData(p => ({ ...p, primaryBtnText: e.target.value }))}
                    placeholder="e.g. Read More"
                  />
                </div>
                <div className="lbe-input-group">
                  <label>Story Link / Destination URL</label>
                  <input
                    type="text"
                    value={slideFormData.link}
                    onChange={e => setSlideFormData(p => ({ ...p, link: e.target.value }))}
                    placeholder="e.g. /stories/slug or /latest"
                  />
                </div>
              </div>

              <div className="lbe-input-group">
                <label>Author Byline</label>
                <input
                  type="text"
                  value={slideFormData.author}
                  onChange={e => setSlideFormData(p => ({ ...p, author: e.target.value }))}
                  placeholder="e.g. Editorial Bureau"
                />
              </div>
            </div>

            <div className="lbe-slide-edit-footer">
              <button
                type="button"
                className="lbe-btn-cancel"
                onClick={() => setIsSlideEditOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lbe-btn-save"
                onClick={handleSaveSlideEditor}
              >
                <Check size={15} />
                <span>Update Slide & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

