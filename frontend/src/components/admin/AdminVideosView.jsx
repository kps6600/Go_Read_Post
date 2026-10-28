import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Plus, Search, Filter, Trash2, Edit2, RefreshCw, 
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, 
  Check, X, ExternalLink, Clock, Sparkles, ThumbsUp, Layers,
  Film, Video as VideoIcon, Tv, Eye, EyeOff, User, FileText, Copy, Tag, Star, TrendingUp, Globe,
  Bookmark, Hash, ListPlus, Sliders, CheckCircle2
} from 'lucide-react';
import { 
  VIDEO_EPISODES, 
  VIDEO_CATEGORIES, 
  getStoredVideos, 
  saveStoredVideos 
} from '../../data/videoData';
import { VideoService } from '../../services/videoService';
import { MediaService } from '../../services/mediaService';
import { PageService } from '../../services/pageService';
import { TaxonomyService } from '../../services/taxonomyService';
import VideoPlayerModal from '../VideoPlayerModal';
import './AdminVideosView.css';

// Rank color helpers matching Trending Studio & Visual CMS
const RANK_COLORS = [
  { text: '#dc2626', bg: '#ffe4e6' }, // 1 - Rose
  { text: '#2563eb', bg: '#dbeafe' }, // 2 - Blue
  { text: '#7c3aed', bg: '#ede9fe' }, // 3 - Purple
  { text: '#059669', bg: '#d1fae5' }, // 4 - Emerald
  { text: '#0284c7', bg: '#e0f2fe' }, // 5 - Sky
  { text: '#ea580c', bg: '#ffedd5' }, // 6 - Orange
  { text: '#db2777', bg: '#fce7f3' }, // 7 - Pink
  { text: '#4f46e5', bg: '#e0e7ff' }, // 8 - Indigo
];

const CATEGORY_COLORS = {
  interviews: '#ea580c', // Orange
  masterclass: '#7c3aed', // Purple
  deeptech: '#2563eb',   // Blue
  keynotes: '#059669',   // Emerald
  market: '#dc2626',     // Rose
  all: '#ea580c'
};

const getCategoryColor = (catKey) => {
  if (!catKey) return '#ea580c';
  const clean = String(catKey).toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [k, color] of Object.entries(CATEGORY_COLORS)) {
    if (clean.includes(k)) return color;
  }
  return '#ea580c';
};


// Popular video topic tags for quick one-click tagging
const POPULAR_VIDEO_TAGS = [
  'AI & LLMs',
  'DeepTech',
  'Startups',
  'Founder Story',
  'Bootstrapped',
  'Funding & VC',
  'Robotics',
  'SaaS',
  'Fintech',
  'EV & Mobility',
  'Semiconductors',
  'Leadership',
  'E-Commerce',
  'Masterclass'
];

// Robust Video URL parser for YouTube and Vimeo
export function parseVideoUrl(input) {
  if (!input) return null;
  const str = String(input).trim();

  // YouTube watch / share / embed / shorts
  const ytWatchMatch = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    const id = ytWatchMatch[1];
    return {
      provider: 'YouTube',
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      maxResThumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      hqThumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  const ytShortsMatch = str.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
  if (ytShortsMatch && ytShortsMatch[1]) {
    const id = ytShortsMatch[1];
    return {
      provider: 'YouTube',
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      maxResThumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      hqThumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  // Direct uploaded video file from device (blob, data, /uploads/, or mp4/webm/mov/mkv)
  if (/\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(str) || str.startsWith('blob:') || str.startsWith('data:video') || str.includes('/uploads/')) {
    return {
      provider: 'DeviceUpload',
      id: str,
      embedUrl: str,
      watchUrl: str,
      maxResThumb: '',
      hqThumb: ''
    };
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return {
      provider: 'YouTube',
      id: str,
      embedUrl: `https://www.youtube.com/embed/${str}?autoplay=1&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${str}`,
      maxResThumb: `https://img.youtube.com/vi/${str}/maxresdefault.jpg`,
      hqThumb: `https://img.youtube.com/vi/${str}/hqdefault.jpg`
    };
  }

  // Vimeo
  const vimeoMatch = str.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    const id = vimeoMatch[3];
    return {
      provider: 'Vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      watchUrl: `https://vimeo.com/${id}`,
      maxResThumb: '',
      hqThumb: ''
    };
  }

  return null;
}

// Clean normalizer ensuring all video objects have complete, uniform properties
const normalizeVideo = (v, index = 0) => {
  if (!v) return null;
  const id = String(v.id || v._id || `video-${index}`);
  const title = v.title || 'Untitled Video Episode';
  const series = v.series || 'Founders Unfiltered';
  const category = v.category || 'interviews';
  const matchedCat = VIDEO_CATEGORIES.find(c => c.id === category);
  const categoryLabel = v.categoryLabel || (matchedCat ? matchedCat.label : 'Video Episode');
  const duration = v.duration || '28:15';
  const views = typeof v.views === 'number' ? `${Math.round(v.views / 1000)}K` : (v.views || '180K');
  const publishedAt = v.publishedAt || 'Recently';
  const guest = v.guest || 'Featured Guest';
  const guestRole = v.guestRole || 'Founder & CEO';
  const guestCompany = v.guestCompany || '';
  const guestAvatar = v.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
  const guestBio = v.guestBio || '';
  const host = v.host || 'Shradha Sharma';

  // Extract thumbnail with fallback to YouTube HQ
  const parsed = parseVideoUrl(v.youtubeEmbedUrl || v.videoUrl || '');
  const image = v.image || v.fallbackImage || (parsed ? parsed.maxResThumb : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80');
  const youtubeEmbedUrl = v.youtubeEmbedUrl || (parsed ? parsed.embedUrl : '');
  const videoUrl = v.videoUrl || (parsed ? parsed.watchUrl : (v.youtubeEmbedUrl || ''));
  const description = v.description || (Array.isArray(v.highlights) && v.highlights[0]) || '';
  const highlights = Array.isArray(v.highlights) ? v.highlights : [];
  const chapters = Array.isArray(v.chapters) ? v.chapters : [];
  const transcript = Array.isArray(v.transcript) ? v.transcript : [];

  const isPub = v.status !== 'draft' && v.enabled !== false;
  const slug = v.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '');
  const seo = {
    title: v.seo?.title || title,
    description: v.seo?.description || (v.description || ''),
    keywords: v.seo?.keywords || '',
    slug: v.seo?.slug || slug
  };
  const initialTags = Array.isArray(v.tags) && v.tags.length > 0 
    ? v.tags 
    : (Array.isArray(v.topics) && v.topics.length > 0 
        ? v.topics 
        : [v.categoryLabel || category, series || 'Startups'].filter(Boolean));
  const tags = Array.from(new Set(initialTags));
  const topics = Array.isArray(v.topics) && v.topics.length > 0 ? v.topics : tags;
  return {
    ...v,
    id,
    status: isPub ? 'published' : 'draft',
    enabled: isPub,
    tags,
    topics,
    slug,
    seo,
    _id: v._id || id,
    title,
    series,
    category,
    categoryLabel,
    duration,
    views,
    publishedAt,
    guest,
    guestRole,
    guestCompany,
    guestAvatar,
    guestBio,
    host,
    image,
    fallbackImage: v.fallbackImage || (parsed ? parsed.hqThumb : image),
    youtubeEmbedUrl,
    videoUrl,
    description,
    highlights,
    chapters,
    transcript
  };
};

export default function AdminVideosView({ onShowToast, onNavigate }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // All available videos pool (deduplicated)
  const [allVideos, setAllVideos] = useState([]);

  // Ordered ranked videos displayed on the page
  const [rankedVideos, setRankedVideos] = useState([]);

  // Active Category filter in the videos toolbar
  const [activeCategory, setActiveCategory] = useState('all');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Hero Spotlight Slider State
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Pagination & view mode
  const [showAllCards, setShowAllCards] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const CARDS_PER_PAGE = 8;

  // Modals state
  const [previewVideo, setPreviewVideo] = useState(null);
  const [viewingVideoDetails, setViewingVideoDetails] = useState(null);
  const [copiedVideoLink, setCopiedVideoLink] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, isCreate: false, index: null, data: null });
  const [editorActiveTab, setEditorActiveTab] = useState('main');
  const [studioView, setStudioView] = useState('edit');
  const [tagInput, setTagInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [pickerModal, setPickerModal] = useState({ isOpen: false, targetIndex: null });
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const videoFileInputRef = useRef(null);
  const posterFileInputRef = useRef(null);

  // Project Taxonomies (Categories, Authors, Topics, Tags already in the project)
  const [projectCategories, setProjectCategories] = useState([]);
  const [projectAuthors, setProjectAuthors] = useState([]);
  const [projectTopics, setProjectTopics] = useState([]);
  const [projectTags, setProjectTags] = useState([]);

  useEffect(() => {
    loadTaxonomies();
  }, []);

  const loadTaxonomies = async () => {
    try {
      const [cats, auths, tops, tgs] = await Promise.all([
        TaxonomyService.getCategories().catch(() => []),
        TaxonomyService.getAuthors().catch(() => []),
        TaxonomyService.getTopics().catch(() => []),
        TaxonomyService.getTags().catch(() => [])
      ]);
      if (Array.isArray(cats) && cats.length > 0) setProjectCategories(cats);
      if (Array.isArray(auths) && auths.length > 0) setProjectAuthors(auths);
      if (Array.isArray(tops) && tops.length > 0) setProjectTopics(tops);
      if (Array.isArray(tgs) && tgs.length > 0) setProjectTags(tgs);
    } catch (err) {
      console.warn('Error loading project taxonomies:', err);
    }
  };

  // Combined Category list merging project categories & video formats
  const allAvailableCategories = useMemo(() => {
    const projectList = [];
    const seen = new Set();

    if (Array.isArray(projectCategories) && projectCategories.length > 0) {
      projectCategories.forEach(c => {
        const name = c.name || c.label || c.title;
        const id = c.slug || c._id || (name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : '');
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          projectList.push({ id, label: name, isProject: true });
        }
      });
    }

    const videoList = [];
    VIDEO_CATEGORIES.forEach(c => {
      if (c.id !== 'all' && !seen.has(c.label.toLowerCase())) {
        seen.add(c.label.toLowerCase());
        videoList.push(c);
      }
    });

    return { 
      projectCategories: projectList, 
      videoFormats: videoList, 
      all: [...projectList, ...videoList] 
    };
  }, [projectCategories]);

  // Curated project topics
  const availableProjectTopics = useMemo(() => {
    const list = [];
    const seen = new Set();
    if (Array.isArray(projectTopics)) {
      projectTopics.forEach(t => {
        const name = typeof t === 'string' ? t : (t?.name || '');
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push(name);
        }
      });
    }
    const defaults = ['AI & LLMs', 'DeepTech', 'Startups', 'Fintech', 'Robotics', 'SaaS & Cloud', 'EV & Mobility', 'Funding & VC'];
    defaults.forEach(d => {
      if (!seen.has(d.toLowerCase())) {
        seen.add(d.toLowerCase());
        list.push(d);
      }
    });
    return list;
  }, [projectTopics]);

  // Curated keyword tags
  const availableProjectTags = useMemo(() => {
    const list = [];
    const seen = new Set();
    if (Array.isArray(projectTags)) {
      projectTags.forEach(t => {
        const name = typeof t === 'string' ? t : (t?.name || '');
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push(name);
        }
      });
    }
    POPULAR_VIDEO_TAGS.forEach(t => {
      if (!seen.has(t.toLowerCase())) {
        seen.add(t.toLowerCase());
        list.push(t);
      }
    });
    return list;
  }, [projectTags]);

  // Category Filter Popover Dropdown
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load videos data from backend API, local storage, and page config
  useEffect(() => {
    loadVideosData();
  }, []);

  const loadVideosData = async () => {
    setLoading(true);
    try {
      const [adminVideosRes, storedList, pageData] = await Promise.all([
        VideoService.getAdminVideos().catch(() => []),
        Promise.resolve(getStoredVideos()),
        PageService.getPageById('videos').catch(() => null)
      ]);

      // Combine and deduplicate across all available video sources
      const combined = [];
      const seen = new Set();
      const rawPool = [
        ...(Array.isArray(adminVideosRes) ? adminVideosRes : []),
        ...(Array.isArray(storedList) ? storedList : []),
        ...VIDEO_EPISODES
      ];

      rawPool.forEach((v, idx) => {
        if (!v || typeof v !== 'object') return;
        const norm = normalizeVideo(v, idx);
        if (!norm) return;
        const key = String(norm.id || norm._id || norm.slug || norm.title).toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          combined.push(norm);
        }
      });

      setAllVideos(combined);

      // Restore custom order from page section or fallback to combined list
      if (pageData) {
        setPage(pageData);
        const feedSec = (pageData.sections || []).find(s => s.type === 'video_feed' || s.id === 'videos_feed');
        if (feedSec?.data?.videos && Array.isArray(feedSec.data.videos) && feedSec.data.videos.length > 0) {
          const customNorm = feedSec.data.videos.map((v, i) => normalizeVideo(v, i));
          const customIds = new Set(customNorm.map(v => String(v.id || v._id || v.slug)));
          const remaining = combined.filter(v => !customIds.has(String(v.id || v._id || v.slug)));
          setRankedVideos([...customNorm, ...remaining]);
        } else {
          setRankedVideos(combined);
        }
      } else {
        setRankedVideos(combined);
      }
    } catch (err) {
      console.error('Failed to load videos studio data:', err);
      const fallbackList = getStoredVideos().map((v, i) => normalizeVideo(v, i));
      setAllVideos(fallbackList);
      setRankedVideos(fallbackList);
    } finally {
      setLoading(false);
    }
  };

  // Hero section strictly showcases ONLY the Top 5 Ranked Videos (#1 to #5)
  const heroSlides = useMemo(() => {
    return rankedVideos.slice(0, 5);
  }, [rankedVideos]);

  // Keep activeSlideIdx in safe bounds
  useEffect(() => {
    if (activeSlideIdx >= heroSlides.length && heroSlides.length > 0) {
      setActiveSlideIdx(0);
    }
  }, [heroSlides.length, activeSlideIdx]);

  const activeSlide = heroSlides[activeSlideIdx] || heroSlides[0] || {};

  const handleNextSlide = () => {
    setActiveSlideIdx(prev => (prev + 1) % Math.max(1, heroSlides.length));
  };

  const handlePrevSlide = () => {
    setActiveSlideIdx(prev => (prev - 1 + heroSlides.length) % Math.max(1, heroSlides.length));
  };

  // Dynamic category stats across all videos
  const categoryStats = useMemo(() => {
    const counts = { all: allVideos.length };
    allVideos.forEach(v => {
      const cat = v.category || 'interviews';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allVideos]);

  // Categories list with 'all' first, followed by defined categories
  const categoriesList = useMemo(() => {
    const definedIds = VIDEO_CATEGORIES.map(c => c.id);
    const extraIds = Object.keys(categoryStats).filter(id => !definedIds.includes(id));
    return [...VIDEO_CATEGORIES, ...extraIds.map(id => ({ id, label: id }))];
  }, [categoryStats]);

  // Filtered list of ranked videos
  const displayRankedVideos = useMemo(() => {
    let list = rankedVideos;
    if (activeCategory !== 'all') {
      const target = activeCategory.toLowerCase().trim();
      list = list.filter(v => {
        const cat = (v.category || '').toLowerCase().trim();
        return cat === target || cat.includes(target);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => {
        const title = (v.title || '').toLowerCase();
        const guest = (v.guest || '').toLowerCase();
        const host = (v.host || '').toLowerCase();
        const series = (v.series || '').toLowerCase();
        const desc = (v.description || '').toLowerCase();
        const company = (v.guestCompany || '').toLowerCase();
        const tagsStr = Array.isArray(v.tags) ? v.tags.join(' ').toLowerCase() : '';
        const topicsStr = Array.isArray(v.topics) ? v.topics.join(' ').toLowerCase() : '';
        return (
          title.includes(q) || 
          guest.includes(q) || 
          host.includes(q) || 
          series.includes(q) || 
          desc.includes(q) || 
          company.includes(q) ||
          tagsStr.includes(q) ||
          topicsStr.includes(q)
        );
      });
    }
    return list;
  }, [rankedVideos, activeCategory, searchQuery]);

  const visibleVideos = useMemo(() => {
    if (showAllCards) return displayRankedVideos;
    const start = currentPage * CARDS_PER_PAGE;
    return displayRankedVideos.slice(start, start + CARDS_PER_PAGE);
  }, [displayRankedVideos, showAllCards, currentPage]);

  const totalPages = Math.max(1, Math.ceil(displayRankedVideos.length / CARDS_PER_PAGE));

  // Reorder videos earlier/later in the ranked list
  const handleMoveVideo = (index, direction) => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= rankedVideos.length) return;

    setRankedVideos(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[newIdx];
      next[newIdx] = temp;
      return next;
    });

    if (onShowToast) {
      onShowToast(`Repositioned to #${newIdx + 1}`);
    }
  };

  // Remove video from ranked showcase
  const handleRemoveVideo = (index) => {
    const videoToRemove = rankedVideos[index];
    if (!videoToRemove) return;
    const confirmDelete = window.confirm(`Remove "${videoToRemove.title.slice(0, 40)}..." from Video Showcase?`);
    if (!confirmDelete) return;

    setRankedVideos(prev => prev.filter((_, idx) => idx !== index));
    if (onShowToast) onShowToast('Video removed from showcase.');
  };

  // Swap / replace video at target index from picker modal
  const handleReplaceVideo = (chosenVideo) => {
    const targetIdx = pickerModal.targetIndex;
    if (typeof targetIdx !== 'number' || targetIdx < 0 || !chosenVideo) return;

    const normChosen = normalizeVideo(chosenVideo);
    setRankedVideos(prev => {
      const next = [...prev];
      next[targetIdx] = normChosen;
      return next;
    });

    setPickerModal({ isOpen: false, targetIndex: null });
    if (onShowToast) onShowToast(`Replaced position #${targetIdx + 1} with "${normChosen.title.slice(0, 35)}..."`);
  };


  // Helper: Add topic to active editing video
  const handleAddTopic = (rawTopic) => {
    const topic = (rawTopic || topicInput).trim();
    if (!topic) return;
    setEditModal(prev => {
      if (!prev.data) return prev;
      const currentTopics = Array.isArray(prev.data.topics) ? prev.data.topics : [];
      if (currentTopics.some(t => t.toLowerCase() === topic.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        data: {
          ...prev.data,
          topics: [...currentTopics, topic]
        }
      };
    });
    setTopicInput('');
  };

  // Helper: Remove topic from active editing video
  const handleRemoveTopic = (topicToRemove) => {
    setEditModal(prev => {
      if (!prev.data) return prev;
      const currentTopics = Array.isArray(prev.data.topics) ? prev.data.topics : [];
      return {
        ...prev,
        data: {
          ...prev.data,
          topics: currentTopics.filter(t => t !== topicToRemove)
        }
      };
    });
  };

  // Helper: Add keyword tag to active editing video
  const handleAddTag = (rawTag) => {
    const tag = (rawTag || tagInput).trim().replace(/^#/, '');
    if (!tag) return;
    setEditModal(prev => {
      if (!prev.data) return prev;
      const currentTags = Array.isArray(prev.data.tags) ? prev.data.tags : [];
      if (currentTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        data: {
          ...prev.data,
          tags: [...currentTags, tag]
        }
      };
    });
    setTagInput('');
  };

  // Helper: Remove keyword tag from active editing video
  const handleRemoveTag = (tagToRemove) => {
    setEditModal(prev => {
      if (!prev.data) return prev;
      const currentTags = Array.isArray(prev.data.tags) ? prev.data.tags : [];
      return {
        ...prev,
        data: {
          ...prev.data,
          tags: currentTags.filter(t => t !== tagToRemove)
        }
      };
    });
  };

  // Helper: Add key discussion highlight
  const handleAddHighlight = (rawHighlight) => {
    const hl = (rawHighlight || highlightInput).trim();
    if (!hl) return;
    setEditModal(prev => {
      if (!prev.data) return prev;
      const currentHighlights = Array.isArray(prev.data.highlights) ? prev.data.highlights : [];
      return {
        ...prev,
        data: {
          ...prev.data,
          highlights: [...currentHighlights, hl]
        }
      };
    });
    setHighlightInput('');
  };

  // Helper: Remove key discussion highlight
  const handleRemoveHighlight = (idxToRemove) => {
    setEditModal(prev => {
      if (!prev.data) return prev;
      const currentHighlights = Array.isArray(prev.data.highlights) ? prev.data.highlights : [];
      return {
        ...prev,
        data: {
          ...prev.data,
          highlights: currentHighlights.filter((_, idx) => idx !== idxToRemove)
        }
      };
    });
  };


  // Lock body & html scroll while full-page studio is open (prevents double scrollbars)
  useEffect(() => {
    if (editModal.isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [editModal.isOpen]);


  // Handler: Direct video upload from device
  const handleDeviceVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    const localBlobUrl = URL.createObjectURL(file);
    const fileNameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

    setEditModal(prev => {
      if (!prev.data) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          videoUrl: localBlobUrl,
          youtubeEmbedUrl: localBlobUrl,
          title: prev.data.title || fileNameClean
        }
      };
    });

    if (onShowToast) onShowToast(`Selected video file: "${file.name}". Processing...`);

    // Extract first frame thumbnail and duration via HTML5 video element
    try {
      const tempVideo = document.createElement('video');
      tempVideo.src = localBlobUrl;
      tempVideo.preload = 'metadata';
      tempVideo.muted = true;
      tempVideo.onloadedmetadata = () => {
        const durSec = Math.round(tempVideo.duration);
        const mins = Math.floor(durSec / 60);
        const secs = String(durSec % 60).padStart(2, '0');
        const formattedDur = `${mins}:${secs}`;
        
        setEditModal(prev => {
          if (!prev.data) return prev;
          return {
            ...prev,
            data: {
              ...prev.data,
              duration: formattedDur
            }
          };
        });

        tempVideo.currentTime = Math.min(1, Math.max(0.1, tempVideo.duration / 2));
      };
      tempVideo.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = tempVideo.videoWidth || 640;
          canvas.height = tempVideo.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            const thumbData = canvas.toDataURL('image/jpeg', 0.82);
            setEditModal(prev => {
              if (!prev.data || prev.data.image) return prev;
              return {
                ...prev,
                data: {
                  ...prev.data,
                  image: thumbData
                }
              };
            });
          }
        } catch (e) {}
      };
    } catch (e) {}

    // Upload to server
    try {
      const uploaded = await MediaService.uploadFile(file);
      if (uploaded && (uploaded.url || uploaded.path)) {
        const finalUrl = uploaded.url || uploaded.path;
        setEditModal(prev => {
          if (!prev.data) return prev;
          return {
            ...prev,
            data: {
              ...prev.data,
              videoUrl: finalUrl,
              youtubeEmbedUrl: finalUrl
            }
          };
        });
        if (onShowToast) onShowToast(`Video "${file.name}" uploaded from device successfully!`);
      }
    } catch (err) {
      console.warn('Video server upload fallback, using local media:', err);
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  // Handler: Direct thumbnail poster upload from device
  const handleDevicePosterUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPoster(true);
    const localUrl = URL.createObjectURL(file);
    setEditModal(prev => {
      if (!prev.data) return prev;
      return {
        ...prev,
        data: { ...prev.data, image: localUrl }
      };
    });

    try {
      const uploaded = await MediaService.uploadFile(file);
      if (uploaded && (uploaded.url || uploaded.path)) {
        const finalUrl = uploaded.url || uploaded.path;
        setEditModal(prev => {
          if (!prev.data) return prev;
          return {
            ...prev,
            data: { ...prev.data, image: finalUrl }
          };
        });
        if (onShowToast) onShowToast('Thumbnail poster uploaded from device!');
      }
    } catch (err) {
      console.warn('Poster upload fallback:', err);
    } finally {
      setIsUploadingPoster(false);
      if (posterFileInputRef.current) posterFileInputRef.current.value = '';
    }
  };

  // Auto-fetch YouTube metadata (Title, HD thumbnail, channel name)
  const handleAutoFetchYouTube = async (url) => {
    const targetUrl = url || editModal?.data?.videoUrl || editModal?.data?.youtubeEmbedUrl;
    if (!targetUrl || !targetUrl.trim()) {
      alert('Please enter a YouTube video URL first.');
      return;
    }

    const parsed = parseVideoUrl(targetUrl);
    const queryUrl = parsed ? parsed.watchUrl : targetUrl;

    setIsFetchingMeta(true);
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(queryUrl)}`);
      const data = await res.json();

      if (data && data.title) {
        // Auto-extract contextual topic tags from title
        const titleStr = data.title.toLowerCase();
        const detectedTags = [];
        if (titleStr.includes('ai') || titleStr.includes('llm') || titleStr.includes('gpt')) detectedTags.push('AI & LLMs');
        if (titleStr.includes('robot')) detectedTags.push('Robotics');
        if (titleStr.includes('chip') || titleStr.includes('silicon') || titleStr.includes('deeptech')) detectedTags.push('DeepTech');
        if (titleStr.includes('saas') || titleStr.includes('cloud')) detectedTags.push('SaaS');
        if (titleStr.includes('startup') || titleStr.includes('founder') || titleStr.includes('ceo')) detectedTags.push('Startups');
        if (titleStr.includes('bootstrap') || titleStr.includes('profit')) detectedTags.push('Bootstrapped');
        if (titleStr.includes('ev') || titleStr.includes('electric') || titleStr.includes('krutrim') || titleStr.includes('ola')) detectedTags.push('EV & Mobility');
        if (titleStr.includes('market') || titleStr.includes('capital') || titleStr.includes('dilution') || titleStr.includes('vc') || titleStr.includes('fund')) detectedTags.push('Funding & VC');
        if (detectedTags.length === 0) detectedTags.push('Startups', 'Tech');

        setEditModal(prev => {
          const existingTags = Array.isArray(prev.data.tags) ? prev.data.tags : [];
          const mergedTags = Array.from(new Set([...existingTags, ...detectedTags]));
          return {
            ...prev,
            data: {
              ...prev.data,
              title: data.title || prev.data.title,
              guest: prev.data.guest || (data.author_name ? data.author_name.replace(/ - Topic$/, '').replace(/ Official$/, '') : ''),
              image: data.thumbnail_url || (parsed ? parsed.maxResThumb : prev.data.image),
              videoUrl: queryUrl,
              youtubeEmbedUrl: parsed ? parsed.embedUrl : (prev.data.youtubeEmbedUrl || queryUrl),
              tags: mergedTags,
              topics: mergedTags
            }
          };
        });
        if (onShowToast) onShowToast(`✨ Auto-fetched info & HD poster for "${data.title.slice(0, 35)}..."`);
      } else if (parsed) {
        setEditModal(prev => ({
          ...prev,
          data: {
            ...prev.data,
            image: parsed.maxResThumb,
            youtubeEmbedUrl: parsed.embedUrl,
            videoUrl: parsed.watchUrl
          }
        }));
        if (onShowToast) onShowToast(`Detected YouTube ID (${parsed.id}) and set HD thumbnail!`);
      } else {
        alert('Could not auto-fetch metadata. You can enter details manually.');
      }
    } catch (e) {
      if (parsed) {
        setEditModal(prev => ({
          ...prev,
          data: {
            ...prev.data,
            image: parsed.maxResThumb,
            youtubeEmbedUrl: parsed.embedUrl,
            videoUrl: parsed.watchUrl
          }
        }));
        if (onShowToast) onShowToast(`Detected YouTube ID (${parsed.id}) and set HD thumbnail!`);
      }
    } finally {
      setIsFetchingMeta(false);
    }
  };


  // Toggle frontend visibility for video
  const handleToggleVideoPublish = async (video) => {
    if (!video) return;
    const isCurrentlyPublished = video.status !== 'draft' && video.enabled !== false;
    const nextStatus = isCurrentlyPublished ? 'draft' : 'published';
    const nextEnabled = !isCurrentlyPublished;

    const updated = {
      ...video,
      status: nextStatus,
      enabled: nextEnabled
    };

    setRankedVideos(prev => {
      const next = prev.map(v => ((v.id === video.id || v._id === video._id || v.title === video.title) ? updated : v));
      saveStoredVideos(next);
      return next;
    });

    setAllVideos(prev => prev.map(v => ((v.id === video.id || v._id === video._id || v.title === video.title) ? updated : v)));

    setViewingVideoDetails(prev => prev ? ({ ...prev, status: nextStatus, enabled: nextEnabled }) : null);

    const targetId = video._id || video.id;
    if (targetId && !String(targetId).startsWith('video-')) {
      try {
        await VideoService.updateVideo(targetId, { status: nextStatus, enabled: nextEnabled });
      } catch (e) {
        console.warn('API update failed:', e);
      }
    }

    if (onShowToast) onShowToast(`Video "${video.title.slice(0, 25)}..." set to ${nextStatus.toUpperCase()}`);
  };

  // Save changes from Edit/Create Video modal
  const handleSaveEditModal = () => {
    const { isCreate, index, data } = editModal;
    if (!data.title || !data.title.trim()) {
      alert('Video title is required.');
      return;
    }

    const parsed = parseVideoUrl(data.videoUrl || data.youtubeEmbedUrl);
    const finalVideo = normalizeVideo({
      ...data,
      id: isCreate ? `video-${Date.now()}` : data.id,
      status: data.status || 'published',
      enabled: data.enabled !== false,
      youtubeEmbedUrl: parsed ? parsed.embedUrl : (data.youtubeEmbedUrl || data.videoUrl),
      videoUrl: parsed ? parsed.watchUrl : (data.videoUrl || data.youtubeEmbedUrl),
      image: data.image || (parsed ? parsed.maxResThumb : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80')
    });

    setViewingVideoDetails(prev => {
      if (!prev) return null;
      if (prev.id === finalVideo.id || prev._id === finalVideo._id || prev.title === data.title) {
        return finalVideo;
      }
      return prev;
    });

    if (isCreate) {
      setRankedVideos(prev => {
        const next = [finalVideo, ...prev];
        saveStoredVideos(next);
        return next;
      });
      setAllVideos(prev => [finalVideo, ...prev]);
      try {
        VideoService.createVideo(finalVideo).catch(err => console.warn('Backend API create error:', err));
      } catch (e) {}
      if (onShowToast) onShowToast(`Added new video: "${finalVideo.title.slice(0, 35)}..."`);
    } else if (typeof index === 'number' && index >= 0) {
      setRankedVideos(prev => {
        const next = [...prev];
        next[index] = finalVideo;
        saveStoredVideos(next);
        return next;
      });
      setAllVideos(prev => {
        const next = [...prev];
        const aIdx = next.findIndex(v => v.id === finalVideo.id || v._id === finalVideo._id);
        if (aIdx >= 0) next[aIdx] = finalVideo;
        return next;
      });
      const targetId = finalVideo._id || finalVideo.id;
      if (targetId && !String(targetId).startsWith('video-')) {
        try {
          VideoService.updateVideo(targetId, finalVideo).catch(err => console.warn('Backend API update error:', err));
        } catch (e) {}
      }
      if (onShowToast) onShowToast(`Updated video #${index + 1}`);
    }

    setEditModal({ isOpen: false, isCreate: false, index: null, data: null });
  };

  // Save all changes live to storage, database, and page layout
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Save ordered video list to localStorage
      saveStoredVideos(rankedVideos);

      // 2. Persist to PageService layout for /videos
      const updatedSections = [
        {
          id: 'videos_hero',
          type: 'hero',
          order: 1,
          enabled: true,
          data: {
            title: 'Top Spotlight Videos',
            heading: 'Studio Broadcasts & Founder Interviews',
            slides: heroSlides,
            heroSource: 'custom'
          }
        },
        {
          id: 'videos_feed',
          type: 'video_feed',
          order: 2,
          enabled: true,
          data: {
            title: 'Ranked Video Showcase',
            heading: 'Featured Shows & Episodes',
            videos: rankedVideos,
            hasCustomVideos: true
          }
        }
      ];

      const pagePayload = {
        id: 'videos',
        title: page?.title || 'Video Shows (YSTV)',
        slug: 'videos',
        description: page?.description || 'Original studio video shows, founder interviews, and video dispatches.',
        status: 'published',
        sections: updatedSections
      };

      await PageService.updatePage('videos', pagePayload).catch(e => {
        console.warn('PageService updatePage non-fatal warning:', e);
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onShowToast) onShowToast('Video Showcase layout permanently saved and published live!');
    } catch (err) {
      console.error('Failed to save videos studio:', err);
      if (onShowToast) onShowToast(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered pool for video picker modal
  const filteredPickerPool = useMemo(() => {
    return allVideos.filter(v => {
      const q = pickerSearch.trim().toLowerCase();
      const matchSearch = !q || 
        (v.title || '').toLowerCase().includes(q) || 
        (v.guest || '').toLowerCase().includes(q) || 
        (v.series || '').toLowerCase().includes(q);
      const matchCat = pickerCategory === 'all' || v.category === pickerCategory;
      return matchSearch && matchCat;
    });
  }, [allVideos, pickerSearch, pickerCategory]);

  if (loading) {
    return (
      <div className="avv-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw size={34} className="avv-spin" color="#ea580c" />
        <p style={{ color: '#64748b', fontWeight: 650, marginTop: '14px', fontSize: '0.95rem' }}>
          Loading Video Studio CMS...
        </p>
      </div>
    );
  }

  const slideTitle = activeSlide.title || 'Studio Broadcasts & Founder Interviews';
  const slideDesc = activeSlide.description || (activeSlide.highlights && activeSlide.highlights[0]) || '';
  const slideCat = activeSlide.categoryLabel || activeSlide.category || 'Interviews';
  const slideImg = activeSlide.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80';
  const slideGuest = activeSlide.guest || 'Featured Founder';
  const slideRole = activeSlide.guestRole ? `${activeSlide.guestRole}${activeSlide.guestCompany ? `, ${activeSlide.guestCompany}` : ''}` : '';
  const slideAvatar = activeSlide.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const slideDuration = activeSlide.duration || '35:00';
  const slideViews = activeSlide.views || '200K';

  
  // ── EARLY RETURN: Full-Page Video Studio (Guarantees only ONE scrollbar) ──
  if (editModal.isOpen && editModal.data) {
    const d = editModal.data;
    const parsed = parseVideoUrl(d.videoUrl || d.youtubeEmbedUrl);
    const liveEmbedUrl = parsed ? parsed.embedUrl : (d.youtubeEmbedUrl || '');
    const watchSrc = parsed ? parsed.watchUrl : (d.videoUrl || '');
    const currentTags = Array.isArray(d.tags) ? d.tags : [];
    const currentTopics = Array.isArray(d.topics) ? d.topics : [];
    const currentHighlights = Array.isArray(d.highlights) ? d.highlights : [];
    const isPub = d.status !== 'draft' && d.enabled !== false;
    const catColor = getCategoryColor(d.category);

    const currentSlug = d.slug || (d.title ? d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) : 'video-episode');
    const seoTitle = d.seo?.title || d.title || 'Video Episode';
    const seoDesc = d.seo?.description || d.description || 'Watch the full video interview and key discussion highlights on GoReadPost Studio.';

    return (
      <div className="lvs-studio-container">
        {/* ── Top Bar with Return, Center View Switcher, and Actions ── */}
        <header className="lvs-header">
          <div className="lvs-header-left">
            <button
              type="button"
              className="lvs-back-btn"
              onClick={() => setEditModal({ isOpen: false, isCreate: false, index: null, data: null })}
              title="Return to videos list"
            >
              <span>Back to Videos</span>
            </button>

            <div className="lvs-title-block">
              <span className="lvs-title-text">
                {editModal.isCreate ? 'Add New Video Episode' : (d.title || 'Edit Video Episode')}
              </span>
              <span className={`lvs-status-pill ${isPub ? 'published' : 'draft'}`}>
                {isPub ? '• LIVE ON SITE' : '• DRAFT'}
              </span>
            </div>
          </div>

          {/* ── Center View Switcher: [ Add / Edit Details ] vs [ Live View ] ── */}
          <div className="lvs-header-center">
            <div className="lvs-view-switch">
              <button
                type="button"
                className={`lvs-view-btn ${studioView === 'edit' ? 'active' : ''}`}
                onClick={() => setStudioView('edit')}
              >
                <span>Add / Edit Episode</span>
              </button>

              <button
                type="button"
                className={`lvs-view-btn ${studioView === 'live' ? 'active' : ''}`}
                onClick={() => setStudioView('live')}
              >
                <span>Live View</span>
              </button>
            </div>
          </div>

          {/* ── Right Actions ── */}
          <div className="lvs-header-right">
            <button
              type="button"
              className={`abv-action-btn visibility-btn ${isPub ? 'active' : 'inactive'}`}
              onClick={() => {
                setEditModal(prev => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    status: isPub ? 'draft' : 'published',
                    enabled: !isPub
                  }
                }));
              }}
              style={{ cursor: 'pointer', padding: '0.42rem 0.9rem', fontSize: '0.8rem' }}
              title={isPub ? "Currently visible to readers - Click to set draft" : "Hidden from readers - Click to publish"}
            >
              <span>{isPub ? 'Frontend: ON' : 'Frontend: OFF'}</span>
            </button>

            <button
              type="button"
              className="lvs-btn-draft"
              onClick={() => {
                setEditModal(prev => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    status: 'draft',
                    enabled: false
                  }
                }));
                handleSaveEditModal();
              }}
              title="Save as draft (hidden from public site)"
            >
              Save Draft
            </button>

            <button
              type="button"
              className="lvs-btn-publish"
              onClick={handleSaveEditModal}
              title="Publish live to public site"
            >
              <span>{editModal.isCreate ? 'Publish Video' : 'Save Changes'}</span>
            </button>
          </div>
        </header>

        {/* ── Studio Body ── */}
        <div className="lvs-body">
          {studioView === 'edit' && (
            <div className="lvs-edit-grid">
              {/* Left Main Column: Video URL, Heading, Subheading, SEO & Highlights */}
              <div className="lvs-edit-main">
                {/* Card 1: Video File & Live Player Preview (Device Upload) */}
                <div className="lvs-card">
                  <div className="lvs-card-header">
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>Video File & Player Preview</h4>
                    <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700 }}>
                      Upload directly from your device
                    </span>
                  </div>

                  {/* Hidden File Input for Device Video Upload */}
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    style={{ display: 'none' }}
                    onChange={handleDeviceVideoUpload}
                  />

                  {/* Action Bar: Upload from Device */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        disabled={isUploadingVideo}
                        className="lvs-autofetch-btn"
                        title="Upload video file (MP4, WebM, MOV, MKV) directly from your device"
                      >
                        <span>{isUploadingVideo ? 'Uploading Video...' : (d.videoUrl ? 'Replace Video from Device' : 'Upload Video from Device')}</span>
                      </button>

                      {d.videoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditModal(prev => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                videoUrl: '',
                                youtubeEmbedUrl: ''
                              }
                            }));
                          }}
                          className="avv-btn-secondary"
                          style={{ padding: '7px 12px', fontSize: '0.78rem' }}
                          title="Remove current video file"
                        >
                          Remove Video
                        </button>
                      )}
                    </div>

                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {d.videoUrl ? 'Video file loaded and ready' : 'Supported: MP4, WebM, QuickTime MOV, MKV'}
                    </span>
                  </div>

                  {/* Video Player Preview or Device Dropzone */}
                  {liveEmbedUrl ? (
                    <div className="lvs-player-embed">
                      {parsed?.provider === 'DeviceUpload' || /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(liveEmbedUrl) || liveEmbedUrl.startsWith('blob:') || liveEmbedUrl.startsWith('data:video') ? (
                        <video
                          src={liveEmbedUrl}
                          controls
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000000' }}
                        />
                      ) : (
                        <iframe
                          src={liveEmbedUrl}
                          title="Preview player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                      )}
                    </div>
                  ) : d.image ? (
                    <div className="lvs-player-embed">
                      <img src={d.image} alt="Poster preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div 
                      className="lvs-player-empty"
                      onClick={() => videoFileInputRef.current?.click()}
                      style={{ cursor: 'pointer' }}
                      title="Click to choose a video file from your device"
                    >
                      <span style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 700 }}>
                        Click here to upload video from your device
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Supports MP4, WebM, QuickTime MOV, MKV files
                      </span>
                    </div>
                  )}
                </div>

                {/* Card 2: Heading & Subheading */}
                <div className="lvs-card">
                  <div className="lvs-card-header">
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>Episode Heading & Narrative</h4>
                  </div>

                  <div className="avv-form-group">
                    <label className="avv-form-label">Episode Heading / Title *</label>
                    <input
                      type="text"
                      className="avv-form-input"
                      style={{ fontSize: '1.08rem', fontWeight: 750, padding: '10px 14px' }}
                      placeholder="e.g. Building India's Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories"
                      value={d.title || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setEditModal(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            title: val,
                            slug: prev.data.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                          }
                        }));
                      }}
                    />
                  </div>

                  <div className="avv-form-group" style={{ marginBottom: 0 }}>
                    <label className="avv-form-label">Subheading / Episode Narrative Hook</label>
                    <textarea
                      className="avv-form-textarea"
                      rows={3}
                      placeholder="Inside the high-stakes ambition to build domestic infrastructure, deeptech algorithms, and scalable economics..."
                      value={d.description || ''}
                      onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }))}
                    />
                  </div>
                </div>


                {/* Card 4: SEO & Social Metadata */}
                <div className="lvs-card">
                  <div className="lvs-card-header">
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>SEO & Social Search Optimization</h4>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Google SERP listing</span>
                  </div>

                  {/* Google Preview Card */}
                  <div className="avv-google-preview-card" style={{ marginBottom: '14px' }}>
                    <div className="avv-google-preview-label">Google Search Result Preview</div>
                    <div className="avv-google-preview-url">
                      <span>https://goreadpost.com</span> › videos › {currentSlug}
                    </div>
                    <div className="avv-google-preview-title">
                      {seoTitle} | GoReadPost Video Studio
                    </div>
                    <div className="avv-google-preview-desc">
                      {seoDesc.slice(0, 160)}
                    </div>
                  </div>

                  <div className="avv-form-group">
                    <label className="avv-form-label">URL Slug / Permalink</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', overflow: 'hidden' }}>
                      <span style={{ padding: '0 12px', fontSize: '0.8rem', color: '#64748b', fontWeight: 650, background: 'rgba(0,0,0,0.03)', borderRight: '1px solid var(--border-color, #cbd5e1)', whiteSpace: 'nowrap' }}>
                        goreadpost.com/videos/
                      </span>
                      <input
                        type="text"
                        className="avv-form-input"
                        style={{ border: 'none', background: 'transparent' }}
                        value={d.slug || ''}
                        placeholder="building-indias-sovereign-ai-stack"
                        onChange={e => setEditModal(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '')
                          }
                        }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="avv-form-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label className="avv-form-label" style={{ margin: 0 }}>SEO Meta Title</label>
                        <span style={{ fontSize: '0.72rem', color: (d.seo?.title || d.title || '').length > 60 ? '#dc2626' : '#64748b' }}>
                          {(d.seo?.title || d.title || '').length} / 60
                        </span>
                      </div>
                      <input
                        type="text"
                        className="avv-form-input"
                        placeholder="Optimized title tag..."
                        value={d.seo?.title || ''}
                        onChange={e => setEditModal(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            seo: { ...prev.data.seo, title: e.target.value }
                          }
                        }))}
                      />
                    </div>

                    <div className="avv-form-group">
                      <label className="avv-form-label">SEO Focus Keywords</label>
                      <input
                        type="text"
                        className="avv-form-input"
                        placeholder="sovereign ai, krutrim, chips..."
                        value={d.seo?.keywords || ''}
                        onChange={e => setEditModal(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            seo: { ...prev.data.seo, keywords: e.target.value }
                          }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="avv-form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label className="avv-form-label" style={{ margin: 0 }}>SEO Meta Description</label>
                      <span style={{ fontSize: '0.72rem', color: (d.seo?.description || d.description || '').length > 160 ? '#dc2626' : '#64748b' }}>
                        {(d.seo?.description || d.description || '').length} / 160
                      </span>
                    </div>
                    <textarea
                      className="avv-form-textarea"
                      rows={2}
                      placeholder="Concise description listing in Google..."
                      value={d.seo?.description || ''}
                      onChange={e => setEditModal(prev => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          seo: { ...prev.data.seo, description: e.target.value }
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar Column: Category, Series, Author, Tags, Poster, Stats */}
              <div className="lvs-edit-sidebar">
                {/* Sidebar Card 1: Category */}
                <div className="lvs-card">
                  <div className="lvs-card-header">
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>Category</h4>
                    {allAvailableCategories.projectCategories.length > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {allAvailableCategories.projectCategories.length} project categories
                      </span>
                    )}
                  </div>

                  <div className="avv-form-group" style={{ marginBottom: 0 }}>
                    <label className="avv-form-label">Format / Category *</label>
                    <select
                      className="avv-form-select"
                      value={d.category || 'interviews'}
                      onChange={e => {
                        const val = e.target.value;
                        const matched = allAvailableCategories.all.find(c => c.id === val || c.label === val || c.name === val);
                        setEditModal(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            category: val,
                            categoryLabel: matched ? (matched.label || matched.name) : val
                          }
                        }));
                      }}
                    >
                      {allAvailableCategories.projectCategories.length > 0 && (
                        <optgroup label="Project Categories (Already Present)">
                          {allAvailableCategories.projectCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Video Formats & Shows">
                        {allAvailableCategories.videoFormats.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Sidebar Card 2: Author / Guest Details */}
                <div className="lvs-card">
                  <div className="lvs-card-header">
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>Author / Guest Details</h4>
                    {projectAuthors.length > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {projectAuthors.length} project authors
                      </span>
                    )}
                  </div>

                  {/* Dropdown: Choose from existing authors in the project */}
                  {projectAuthors.length > 0 && (
                    <div className="avv-form-group">
                      <label className="avv-form-label">Select Author / Guest from Project</label>
                      <select
                        className="avv-form-select"
                        value=""
                        onChange={e => {
                          const val = e.target.value;
                          if (!val) return;
                          const chosen = projectAuthors.find(a => a._id === val || a.name === val);
                          if (chosen) {
                            setEditModal(prev => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                guest: chosen.name,
                                guestRole: chosen.designation || prev.data.guestRole || 'Contributing Author',
                                guestAvatar: chosen.profileImage || chosen.avatar || prev.data.guestAvatar || ''
                              }
                            }));
                            if (onShowToast) onShowToast(`Selected author "${chosen.name}"`);
                          }
                        }}
                      >
                        <option value="">-- Choose from {projectAuthors.length} project authors --</option>
                        {projectAuthors.map(a => (
                          <option key={a._id || a.slug || a.name} value={a._id || a.name}>
                            {a.name} {a.designation ? `(${a.designation})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="avv-form-group" style={{ marginBottom: 0 }}>
                    <label className="avv-form-label">Author / Featured Guest Name *</label>
                    <input
                      type="text"
                      className="avv-form-input"
                      placeholder="e.g. Bhavish Aggarwal"
                      value={d.guest || ''}
                      onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, guest: e.target.value } }))}
                      list="lvs-authors-datalist"
                    />
                    <datalist id="lvs-authors-datalist">
                      {projectAuthors.map(a => (
                        <option key={a._id || a.name} value={a.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Sidebar Card 3: Topics */}
                <div className="lvs-card">
                  <div className="lvs-card-header">
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>Topics ({currentTopics.length})</h4>
                    {availableProjectTopics.length > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Click to attach
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="avv-form-input"
                      placeholder="Add editorial topic..."
                      value={topicInput}
                      onChange={e => setTopicInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTopic();
                        }
                      }}
                      list="lvs-topics-datalist"
                    />
                    <datalist id="lvs-topics-datalist">
                      {availableProjectTopics.map((t, idx) => (
                        <option key={idx} value={t} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      className="avv-btn-secondary"
                      onClick={() => handleAddTopic()}
                      style={{ padding: '6px 14px', fontWeight: 700 }}
                    >
                      Add
                    </button>
                  </div>

                  <div className="avv-tags-wrap" style={{ minHeight: '34px', marginBottom: '10px' }}>
                    {currentTopics.length === 0 ? (
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        No topics attached yet.
                      </span>
                    ) : (
                      currentTopics.map((top, tIdx) => (
                        <span key={tIdx} className="avv-tag-chip" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
                          <span>{top}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(top)}
                            className="avv-tag-remove"
                            title="Remove topic"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {availableProjectTopics.slice(0, 12).map((popTop, pIdx) => {
                      const isAlready = currentTopics.some(t => t.toLowerCase() === popTop.toLowerCase());
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          className={`avv-tag-suggestion ${isAlready ? 'selected' : ''}`}
                          onClick={() => {
                            if (isAlready) {
                              handleRemoveTopic(popTop);
                            } else {
                              handleAddTopic(popTop);
                            }
                          }}
                        >
                          <span>{isAlready ? '✓ ' + popTop : '+ ' + popTop}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar Card 4: Tags */}
                <div className="lvs-card">
                  <div className="lvs-card-header">
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>Tags ({currentTags.length})</h4>
                    {availableProjectTags.length > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Click to attach
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="avv-form-input"
                      placeholder="Add keyword tag..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      list="lvs-tags-datalist"
                    />
                    <datalist id="lvs-tags-datalist">
                      {availableProjectTags.map((t, idx) => (
                        <option key={idx} value={t} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      className="avv-btn-secondary"
                      onClick={() => handleAddTag()}
                      style={{ padding: '6px 14px', fontWeight: 700 }}
                    >
                      Add
                    </button>
                  </div>

                  <div className="avv-tags-wrap" style={{ minHeight: '34px', marginBottom: '10px' }}>
                    {currentTags.length === 0 ? (
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        No keyword tags added yet.
                      </span>
                    ) : (
                      currentTags.map((tag, tIdx) => (
                        <span key={tIdx} className="avv-tag-chip">
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="avv-tag-remove"
                            title="Remove tag"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {availableProjectTags.slice(0, 12).map((popTag, pIdx) => {
                      const isAlready = currentTags.some(t => t.toLowerCase() === popTag.toLowerCase());
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          className={`avv-tag-suggestion ${isAlready ? 'selected' : ''}`}
                          onClick={() => {
                            if (isAlready) {
                              handleRemoveTag(popTag);
                            } else {
                              handleAddTag(popTag);
                            }
                          }}
                        >
                          <span>{isAlready ? '✓ #' + popTag : '+ #' + popTag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar Card 4: Poster Thumbnail & Stats */}
                <div className="lvs-card">
                  <div className="lvs-card-header">
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>Media & Stats</h4>
                  </div>

                  <div className="avv-form-group">
                    <input
                      ref={posterFileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleDevicePosterUpload}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                      <label className="avv-form-label" style={{ margin: 0 }}>Thumbnail Poster</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => posterFileInputRef.current?.click()}
                          disabled={isUploadingPoster}
                          style={{ background: 'transparent', border: 'none', color: '#ea580c', fontSize: '0.72rem', fontWeight: 750, cursor: 'pointer' }}
                        >
                          {isUploadingPoster ? 'Uploading...' : 'Upload from Device'}
                        </button>
                        {parsed && parsed.maxResThumb && (
                          <button
                            type="button"
                            onClick={() => setEditModal(prev => ({ ...prev, data: { ...prev.data, image: parsed.maxResThumb } }))}
                            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.72rem', fontWeight: 650, cursor: 'pointer' }}
                          >
                            Use YouTube HD
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {d.image && (
                        <img
                          src={d.image}
                          alt="Poster"
                          style={{ width: '60px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <input
                        type="text"
                        className="avv-form-input"
                        placeholder="https://... or upload from device"
                        value={d.image || ''}
                        onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, image: e.target.value } }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="avv-form-label">Duration</label>
                      <input
                        type="text"
                        className="avv-form-input"
                        placeholder="42:15"
                        value={d.duration || ''}
                        onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, duration: e.target.value } }))}
                      />
                    </div>

                    <div>
                      <label className="avv-form-label">Views</label>
                      <input
                        type="text"
                        className="avv-form-input"
                        placeholder="245K"
                        value={d.views || ''}
                        onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, views: e.target.value } }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              VIEW B: [ 👁️ Live View ] Exact Frontend Public Page Preview
             ═══════════════════════════════════════════════════════ */}
          {studioView === 'live' && (
            <div className="lvs-live-container">
              {/* Public Page Stage Header */}
              <div className="lvs-live-banner">
                {liveEmbedUrl ? (
                  <div className="avv-details-player-wrap">
                    {parsed?.provider === 'DeviceUpload' || /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(liveEmbedUrl) || liveEmbedUrl.startsWith('blob:') || liveEmbedUrl.startsWith('data:video') ? (
                      <video
                        src={liveEmbedUrl}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000000' }}
                      />
                    ) : (
                      <iframe
                        src={liveEmbedUrl}
                        title={d.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="avv-details-iframe"
                      />
                    )}
                  </div>
                ) : d.image ? (
                  <div className="avv-details-poster-wrap">
                    <img src={d.image} alt={d.title} className="avv-details-poster-img" />
                    <div className="avv-details-play-hint">
                      <Play size={28} fill="#ffffff" color="#ffffff" />
                    </div>
                  </div>
                ) : (
                  <div className="avv-details-poster-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#ffffff' }}>Add a YouTube/Vimeo URL to preview player</span>
                  </div>
                )}
              </div>

              {/* Public Metadata Strip */}
              <div className="lvs-live-details-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span className="avv-card-cat" style={{ background: catColor, margin: 0 }}>
                    {d.categoryLabel || d.category || 'Interview'}
                  </span>
                  {d.series && (
                    <span className="avv-details-series-pill">
                      {d.series}
                    </span>
                  )}
                  <span style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 750, marginLeft: 'auto' }}>
                    🔥 {d.views || '120K'} views • ⏱️ {d.duration || '30:00'}
                  </span>
                </div>

                <h1 className="lvs-live-title">{d.title || 'Untitled Episode Title'}</h1>

                {/* Topic Tags */}
                {currentTags.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', margin: '10px 0 16px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 750, color: '#64748b' }}>Topics:</span>
                    {currentTags.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 9px',
                          borderRadius: '4px',
                          background: 'rgba(234, 88, 12, 0.08)',
                          color: '#ea580c',
                          border: '1px solid rgba(234, 88, 12, 0.2)'
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Guest Profile Card */}
                <div className="avv-details-meta-grid" style={{ marginBottom: '18px' }}>
                  <div className="avv-details-meta-card">
                    <img
                      src={d.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={d.guest || 'Featured Guest'}
                      className="avv-details-avatar"
                    />
                    <div>
                      <div className="avv-details-meta-label">Featured Guest</div>
                      <div className="avv-details-meta-val">{d.guest || 'Featured Speaker'}</div>
                      <div className="avv-details-meta-sub">
                        {d.guestRole || 'Founder & CEO'} {d.guestCompany ? `• ${d.guestCompany}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="avv-details-meta-card">
                    <div>
                      <div className="avv-details-meta-label">Host & Production</div>
                      <div className="avv-details-meta-val">{d.host || 'Shradha Sharma'}</div>
                      <div className="avv-details-meta-sub">{d.series || 'Founders Unfiltered'}</div>
                    </div>
                  </div>
                </div>

                {/* Narrative Description */}
                {d.description && (
                  <div className="avv-details-desc-box" style={{ marginBottom: '16px' }}>
                    <div className="avv-details-section-title">
                      <span>Episode Summary & Discussion</span>
                    </div>
                    <p className="avv-details-desc-text">{d.description}</p>
                  </div>
                )}

                {/* Highlights List */}
                {currentHighlights.length > 0 && (
                  <div className="avv-details-highlights-box" style={{ marginBottom: '16px' }}>
                    <div className="avv-details-section-title">
                      <span>Key Highlights & Insights</span>
                    </div>
                    <ul className="avv-details-highlights-list">
                      {currentHighlights.map((h, hIdx) => (
                        <li key={hIdx}>{typeof h === 'string' ? h : (h?.text || '')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Source Box */}
                {watchSrc && (
                  <div className="avv-details-link-box">
                    <div className="avv-details-link-info">
                      <span className="avv-details-link-label">Video Source:</span>
                      <code className="avv-details-link-text">{watchSrc}</code>
                    </div>
                    <a
                      href={watchSrc}
                      target="_blank"
                      rel="noreferrer"
                      className="avv-details-copy-btn"
                      style={{ textDecoration: 'none' }}
                    >
                      <span>Open External</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="avv-fullpage-root">
      {/* ── Studio Sticky Topbar ── */}
      <header className="avv-studio-topbar">
        <div className="avv-topbar-left">
          <button
            type="button"
            className="avv-back-nav-btn"
            onClick={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
            title="Return to Pages Management"
          >
            <ArrowLeft size={16} />
            <span>Back to Pages</span>
          </button>
        </div>

        <div className="avv-topbar-right">
          <button
            type="button"
            className="avv-btn-secondary"
            onClick={() => {
              setEditModal({
                isOpen: true,
                isCreate: true,
                index: null,
                data: {
                  title: '',
                  series: 'Founders Unfiltered',
                  category: 'interviews',
                  categoryLabel: 'Founder Interview',
                  tags: ['Founder Interview', 'Startups'],
                  topics: ['Founder Interview', 'Startups'],
                  duration: '30:00',
                  views: '120K',
                  guest: '',
                  guestRole: 'Founder & CEO',
                  guestCompany: '',
                  guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                  host: 'Shradha Sharma',
                  status: 'published',
                  enabled: true,
                  slug: '',
                  seo: {
                    title: '',
                    description: '',
                    keywords: '',
                    slug: ''
                  },
                  image: '',
                  videoUrl: '',
                  youtubeEmbedUrl: '',
                  description: '',
                  highlights: []
                }
              });
              setEditorActiveTab('main'); setStudioView('edit');
              setTagInput('');
              setHighlightInput('');
            }}
          >
            <Plus size={16} />
            <span>New Video</span>
          </button>

          <button
            type="button"
            className={`avv-btn-primary ${saveSuccess ? 'saved' : ''}`}
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="avv-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check size={16} />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="avv-container">
        {/* ── SECTION A: Top Interactive Hero Spotlight Slider (Top 5 Ranked Videos) ── */}
        {heroSlides.length > 0 && activeSlide && (
          <div 
            className="avv-hero-preview-box"
            style={{ backgroundImage: `url(${slideImg})`, position: 'relative' }}
          >
            <div className="avv-hero-overlay" />
            
            <div className="avv-hero-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="avv-hero-badge" style={{ background: getCategoryColor(activeSlide.category) }}>
                  {slideCat}
                </span>
                <span style={{ 
                  background: 'rgba(234, 88, 12, 0.95)', 
                  color: '#ffffff', 
                  fontSize: '0.74rem', 
                  fontWeight: 800, 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  letterSpacing: '0.04em' 
                }}>
                  VIDEO SPOTLIGHT • TOP RANK #{activeSlideIdx + 1}
                </span>
                {Array.isArray(activeSlide.tags) && activeSlide.tags.slice(0, 3).map((t, idx) => (
                  <span key={idx} style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    color: '#ffffff', 
                    fontSize: '0.72rem', 
                    fontWeight: 750, 
                    padding: '3px 9px', 
                    borderRadius: '12px', 
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    #{t}
                  </span>
                ))}
              </div>

              <h3 className="avv-hero-title">{slideTitle}</h3>

              {slideDesc && (
                <p className="avv-hero-desc">{slideDesc}</p>
              )}

              <div className="avv-hero-meta">
                <img src={slideAvatar} alt={slideGuest} className="avv-hero-avatar" />
                <span style={{ fontWeight: 750, color: '#ffffff' }}>
                  {slideGuest} {slideRole ? `(${slideRole})` : ''}
                </span>
                <span>•</span>
                <span>Host: {activeSlide.host || 'Shradha Sharma'}</span>
                <span>•</span>
                <span>⏱ {slideDuration}</span>
                <span>•</span>
                <span>🔥 {slideViews} views</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="avv-hero-play-btn"
                  onClick={() => setPreviewVideo(activeSlide)}
                  title="Play full video episode"
                >
                  <Play size={15} fill="currentColor" />
                  <span>Watch Episode</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sIdx = rankedVideos.findIndex(v => v.id === activeSlide.id || v._id === activeSlide._id || v.title === activeSlide.title);
                    setEditModal({
                      isOpen: true,
                      isCreate: false,
                      index: sIdx >= 0 ? sIdx : activeSlideIdx,
                      data: { ...activeSlide }
                    });
                    setEditorActiveTab('main'); setStudioView('edit');
                    setTagInput('');
                    setHighlightInput('');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Edit this spotlight video (Heading, tags, categories, topics...)"
                >
                  <Edit2 size={14} />
                  <span>Edit Spotlight Video</span>
                </button>
              </div>
            </div>

            {/* Slider Controls Bottom-Right */}
            <div style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Previous spotlight episode"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Next spotlight episode"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {heroSlides.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveSlideIdx(idx)}
                    title={`Spotlight Episode ${idx + 1} (Rank #${idx + 1})`}
                    style={{
                      width: idx === activeSlideIdx ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: idx === activeSlideIdx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION B: Ranked Video Showcase Grid ── */}
        <div className="avv-section-card" id="avv-videos-section">
          {/* Unified Search & Category Filter Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            {/* Left: Prominent Search Input */}
            <div className="avv-search-bar" style={{ flex: '1', minWidth: '300px', maxWidth: '540px' }}>
              <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search videos by title, guest, series, topic..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
                className="avv-search-input"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')} 
                  className="avv-search-clear-btn"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Right: Filter Button with Popover Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }} ref={filterRef}>
              <button
                type="button"
                className={`avv-filter-dropdown-btn ${activeCategory !== 'all' ? 'active' : ''}`}
                onClick={() => setFilterDropdownOpen(prev => !prev)}
                aria-expanded={filterDropdownOpen}
                title="Filter episodes by show format"
              >
                <Filter size={15} />
                <span>
                  {activeCategory === 'all' 
                    ? 'Filter by Category' 
                    : `Format: ${categoriesList.find(c => c.id === activeCategory)?.label || activeCategory}`}
                </span>
                <span className="avv-filter-count-badge">
                  {categoryStats[activeCategory] || allVideos.length}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: filterDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              {filterDropdownOpen && (
                <div className="avv-filter-popover-menu">
                  <div className="avv-filter-popover-title">Filter by Show Format</div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {categoriesList.map(cat => {
                      const isSelected = activeCategory === cat.id;
                      const count = categoryStats[cat.id] || 0;
                      const dotColor = getCategoryColor(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`avv-filter-popover-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setActiveCategory(cat.id);
                            setCurrentPage(0);
                            setFilterDropdownOpen(false);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span 
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: dotColor,
                                flexShrink: 0
                              }}
                            />
                            <span style={{ fontWeight: isSelected ? 750 : 500 }}>{cat.label}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="avv-filter-popover-count">{count}</span>
                            {isSelected && <Check size={14} color="#ea580c" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {activeCategory !== 'all' && (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '4px' }}>
                      <button
                        type="button"
                        className="avv-filter-reset-btn"
                        onClick={() => {
                          setActiveCategory('all');
                          setCurrentPage(0);
                          setFilterDropdownOpen(false);
                        }}
                      >
                        Reset to All Formats ({allVideos.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Count & View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <div>
              Showing <strong style={{ color: '#0f172a' }}>{visibleVideos.length}</strong> of <strong style={{ color: '#0f172a' }}>{displayRankedVideos.length}</strong> Videos
              {searchQuery && ` (filtered by "${searchQuery}")`}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 650 }}>View Mode:</span>
              <button
                type="button"
                onClick={() => setShowAllCards(true)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: showAllCards ? '#ea580c' : '#cbd5e1',
                  background: showAllCards ? 'rgba(234, 88, 12, 0.1)' : '#ffffff',
                  color: showAllCards ? '#ea580c' : '#475569',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                Show All ({displayRankedVideos.length})
              </button>
              <button
                type="button"
                onClick={() => setShowAllCards(false)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: !showAllCards ? '#ea580c' : '#cbd5e1',
                  background: !showAllCards ? 'rgba(234, 88, 12, 0.1)' : '#ffffff',
                  color: !showAllCards ? '#ea580c' : '#475569',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                Paginated (8/page)
              </button>
            </div>
          </div>

          {/* 2-Column Responsive Card Grid (arranged over the screen) */}
          <div className="avv-cards-grid">
            {visibleVideos.map((video, inPageIdx) => {
              const vidId = video.id || video._id || `vid-${inPageIdx}`;
              const displayRank = showAllCards ? inPageIdx : currentPage * CARDS_PER_PAGE + inPageIdx;
              const rankColor = RANK_COLORS[displayRank % RANK_COLORS.length];
              const masterRankIdx = rankedVideos.findIndex(v => (v.id || v._id) === (video.id || video._id));
              const targetIdx = masterRankIdx >= 0 ? masterRankIdx : displayRank;

              const vidTitle = video.title || 'Untitled Episode';
              const vidCat = video.categoryLabel || video.category || 'Interview';
              const vidDesc = video.description || (video.highlights && video.highlights[0]) || '';
              const vidImg = video.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
              const vidGuest = video.guest || 'Featured Guest';
              const vidRole = video.guestRole ? `${video.guestRole}${video.guestCompany ? `, ${video.guestCompany}` : ''}` : '';
              const vidAvatar = video.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
              const vidDuration = video.duration || '25:00';
              const vidViews = video.views || '150K';

              return (
                <div key={vidId} className="avv-card-item">
                  {/* Top Control Bar: Position + Action Buttons */}
                  <div className="avv-card-admin-bar">
                    <div className="avv-rank-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ea580c', fontWeight: 850 }}>#{displayRank + 1}</span>
                      <span style={{ opacity: 0.65 }}>in Video Showcase</span>
                      {video.status === 'draft' || video.enabled === false ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 750, padding: '2px 8px', borderRadius: '4px', background: 'rgba(217, 119, 6, 0.12)', color: '#d97706', border: '1px solid rgba(217, 119, 6, 0.25)', letterSpacing: '0.02em' }}>
                          • DRAFT
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', fontWeight: 750, padding: '2px 8px', borderRadius: '4px', background: 'rgba(5, 150, 105, 0.12)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.25)', letterSpacing: '0.02em' }}>
                          • LIVE ON SITE
                        </span>
                      )}
                    </div>

                    <div className="avv-card-btn-group">
                      <button
                        type="button"
                        className="avv-icon-btn"
                        disabled={targetIdx <= 0}
                        onClick={() => handleMoveVideo(targetIdx, 'up')}
                        title="Move earlier (# position)"
                      >
                        <ArrowLeft size={13} />
                      </button>

                      <button
                        type="button"
                        className="avv-icon-btn"
                        disabled={targetIdx >= rankedVideos.length - 1}
                        onClick={() => handleMoveVideo(targetIdx, 'down')}
                        title="Move later (# position)"
                      >
                        <ArrowRight size={13} />
                      </button>

                      <button
                        type="button"
                        className="avv-icon-btn"
                        onClick={() => setPickerModal({ isOpen: true, targetIndex: targetIdx })}
                        title="Swap/replace this video"
                      >
                        <RefreshCw size={13} />
                      </button>

                      <button
                        type="button"
                        className="avv-icon-btn"
                        onClick={() => setEditModal({
                          isOpen: true,
                          isCreate: false,
                          index: targetIdx,
                          data: { ...video }
                        })}
                        title="Edit video episode details"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        className="avv-icon-btn danger"
                        onClick={() => handleRemoveVideo(targetIdx)}
                        title="Remove from video showcase"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card Interior - Horizontal Layout */}
                  <div className="avv-card-interior" onClick={() => setViewingVideoDetails(video)} style={{ cursor: 'pointer' }}>
                    {/* Left Column: 16:9 Thumbnail + Guest Meta Directly Below Image */}
                    <div className="avv-card-thumb-column">
                      <div 
                        className="avv-card-thumb-wrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingVideoDetails(video);
                        }}
                        title="Click to view full video episode details & play"
                      >
                        <div 
                          className="avv-card-badge"
                          style={{ color: rankColor.text, background: rankColor.bg }}
                        >
                          {displayRank + 1}
                        </div>

                        <div className="avv-card-duration-badge">
                          <Clock size={10} />
                          <span>{vidDuration}</span>
                        </div>

                        <div className="avv-play-overlay-icon">
                          <Play size={18} fill="currentColor" />
                        </div>

                        <img 
                          src={vidImg} 
                          alt={vidTitle} 
                          className="avv-card-thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
                          }}
                          loading="lazy"
                        />
                      </div>

                      {/* Guest Meta Directly BELOW the Image (Exact User Requirement) */}
                      <div className="avv-card-meta-below-img">
                        <img src={vidAvatar} alt={vidGuest} className="avv-card-meta-avatar" />
                        <div className="avv-card-meta-info">
                          <span className="avv-card-meta-author" title={vidGuest}>
                            {vidGuest}
                          </span>
                          <div className="avv-card-meta-sub" title={vidRole || video.host}>
                            <span>{vidRole || video.host || 'Founder'}</span>
                            <span>•</span>
                            <span>{vidDuration}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Title, Category, Description, and Actions */}
                    <div className="avv-card-body">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '0.45rem' }}>
                        <span 
                          className="avv-card-cat"
                          style={{ background: getCategoryColor(video.category), margin: 0 }}
                        >
                          {vidCat}
                        </span>
                        {Array.isArray(video.tags) && video.tags.length > 0 && (
                          <span 
                            style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              background: 'rgba(234, 88, 12, 0.08)', 
                              color: '#ea580c',
                              border: '1px solid rgba(234, 88, 12, 0.2)'
                            }}
                          >
                            #{video.tags[0]}
                          </span>
                        )}
                        {Array.isArray(video.tags) && video.tags.length > 1 && (
                          <span 
                            style={{ 
                              fontSize: '0.68rem', 
                              fontWeight: 750, 
                              padding: '1px 6px', 
                              borderRadius: '10px', 
                              background: 'rgba(100, 116, 139, 0.12)', 
                              color: '#64748b'
                            }}
                            title={video.tags.slice(1).join(', ')}
                          >
                            +{video.tags.length - 1}
                          </span>
                        )}
                        <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 750 }}>
                          🔥 {vidViews} views
                        </span>
                      </div>

                      <h3 className="avv-card-title">{vidTitle}</h3>

                      {vidDesc && (
                        <p className="avv-card-desc">{vidDesc}</p>
                      )}

                      <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Play size={11} color="#ea580c" />
                          <span>Click to open full player & details</span>
                        </span>
                        {video.series && (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            {video.series}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls (when not showAllCards) */}
          {!showAllCards && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                disabled={currentPage <= 0}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: currentPage <= 0 ? 'not-allowed' : 'pointer',
                  opacity: currentPage <= 0 ? 0.4 : 1
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 650, padding: '0 8px' }}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages - 1 ? 0.4 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL 1: Full Interactive Video Player Modal ── */}
      {previewVideo && (
        <VideoPlayerModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
        />
      )}

      {/* ── MODAL 1B: Video Full Details Modal ── */}
      {viewingVideoDetails && (() => {
        const vid = viewingVideoDetails;
        const targetIdx = rankedVideos.findIndex(v => v.id === vid.id || v._id === vid._id || v.title === vid.title);
        const parsed = parseVideoUrl(vid.videoUrl || vid.youtubeEmbedUrl);
        const embedSrc = parsed ? parsed.embedUrl : vid.youtubeEmbedUrl;
        const watchSrc = parsed ? parsed.watchUrl : (vid.videoUrl || '');
        const isPublished = vid.status !== 'draft' && vid.enabled !== false;
        const catColor = getCategoryColor(vid.category);
        const hostName = vid.host || 'Editorial Desk';

        const handleCopyLink = () => {
          if (navigator.clipboard && watchSrc) {
            navigator.clipboard.writeText(watchSrc);
            setCopiedVideoLink(true);
            setTimeout(() => setCopiedVideoLink(false), 2200);
          }
        };

        return (
          <div className="avv-modal-overlay" onClick={() => setViewingVideoDetails(null)}>
            <div 
              className="avv-modal-box avv-details-box" 
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="avv-modal-header avv-details-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div className="avv-details-header-icon">
                    <Film size={18} color="#ea580c" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                        Video Episode Details
                      </h3>
                      {/* Frontend Visibility Toggle Button */}
                      <button
                        type="button"
                        className={`abv-action-btn visibility-btn ${isPublished ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleVideoPublish(vid)}
                        style={{ cursor: 'pointer', padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                        title={isPublished ? "Showing in frontend - Click to disable" : "Hidden from frontend - Click to enable"}
                      >
                        {isPublished ? (
                          <>
                            <Eye size={13} />
                            <span>Frontend: ON</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} />
                            <span>Frontend: OFF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingVideoDetails(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                  title="Close preview"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="avv-modal-body avv-details-body">
                {/* Embedded Video Player */}
                {embedSrc ? (
                  <div className="avv-details-player-wrap">
                    <iframe
                      src={embedSrc}
                      title={vid.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="avv-details-iframe"
                    />
                  </div>
                ) : vid.image ? (
                  <div className="avv-details-poster-wrap">
                    <img src={vid.image} alt={vid.title} className="avv-details-poster-img" />
                    <div className="avv-details-play-hint">
                      <Play size={24} fill="#ffffff" color="#ffffff" />
                    </div>
                  </div>
                ) : null}

                {/* Title & Format Strip */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span 
                      className="avv-card-cat"
                      style={{ background: catColor, margin: 0, padding: '3px 12px', fontSize: '0.75rem' }}
                    >
                      {vid.categoryLabel || vid.category}
                    </span>
                    {vid.series && (
                      <span className="avv-details-series-pill">
                        {vid.series}
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 750, marginLeft: 'auto' }}>
                      🔥 {vid.views} views • ⏱️ {vid.duration}
                    </span>
                  </div>

                  <h1 className="avv-details-title">{vid.title}</h1>
                  {Array.isArray(vid.tags) && vid.tags.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <Tag size={13} color="#ea580c" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-muted, #64748b)' }}>Topics:</span>
                      {vid.tags.map((t, tIdx) => (
                        <span 
                          key={tIdx} 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(234, 88, 12, 0.08)',
                            color: '#ea580c',
                            border: '1px solid rgba(234, 88, 12, 0.2)'
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Guest & Host Profile Cards */}
                <div className="avv-details-meta-grid">
                  {/* Guest Profile Card */}
                  <div className="avv-details-meta-card">
                    <img 
                      src={vid.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                      alt={vid.guest || 'Guest'} 
                      className="avv-details-avatar"
                    />
                    <div>
                      <div className="avv-details-meta-label">Featured Guest</div>
                      <div className="avv-details-meta-val">{vid.guest || 'Featured Speaker'}</div>
                      <div className="avv-details-meta-sub">
                        {vid.guestRole || 'Founder & Leader'} {vid.guestCompany ? `• ${vid.guestCompany}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Host / Production Info */}
                  <div className="avv-details-meta-card">
                    <User size={20} color="#ea580c" style={{ flexShrink: 0 }} />
                    <div>
                      <div className="avv-details-meta-label">Host & Show</div>
                      <div className="avv-details-meta-val">{hostName}</div>
                      <div className="avv-details-meta-sub">{vid.series || 'Founders Unfiltered'}</div>
                    </div>
                  </div>
                </div>

                {/* Episode Description & Summary */}
                {vid.description && (
                  <div className="avv-details-desc-box">
                    <div className="avv-details-section-title">
                      <FileText size={15} color="#ea580c" />
                      <span>Episode Summary & Discussion</span>
                    </div>
                    <p className="avv-details-desc-text">{vid.description}</p>
                  </div>
                )}

                {/* Highlights / Takeaways if available */}
                {Array.isArray(vid.highlights) && vid.highlights.length > 0 && (
                  <div className="avv-details-highlights-box">
                    <div className="avv-details-section-title">
                      <Sparkles size={15} color="#ea580c" />
                      <span>Key Highlights & Insights</span>
                    </div>
                    <ul className="avv-details-highlights-list">
                      {vid.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{typeof h === 'string' ? h : (h?.text || h?.title || '')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Permalink & Video Source Box */}
                {watchSrc && (
                  <div className="avv-details-link-box">
                    <div className="avv-details-link-info">
                      <VideoIcon size={16} color="var(--text-muted, #64748b)" />
                      <span className="avv-details-link-label">Video Source:</span>
                      <code className="avv-details-link-text">{watchSrc}</code>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="avv-details-copy-btn"
                        onClick={handleCopyLink}
                        title="Copy full video link"
                      >
                        {copiedVideoLink ? (
                          <>
                            <Check size={13} color="#10b981" />
                            <span style={{ color: '#10b981' }}>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                      <a
                        href={watchSrc}
                        target="_blank"
                        rel="noreferrer"
                        className="avv-details-copy-btn"
                        style={{ textDecoration: 'none' }}
                      >
                        <ExternalLink size={13} />
                        <span>Open Source</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="avv-modal-footer avv-details-footer">
                <button
                  type="button"
                  className="avv-btn-secondary"
                  style={{
                    background: isPublished ? 'rgba(217, 119, 6, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                    color: isPublished ? '#d97706' : '#059669',
                    borderColor: isPublished ? 'rgba(217, 119, 6, 0.3)' : 'rgba(5, 150, 105, 0.3)',
                    marginRight: 'auto'
                  }}
                  onClick={() => handleToggleVideoPublish(vid)}
                >
                  {isPublished ? (
                    <>
                      <EyeOff size={14} />
                      <span>Disable from Frontend</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      <span>Enable on Frontend</span>
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  className="avv-btn-secondary" 
                  onClick={() => setViewingVideoDetails(null)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="avv-btn-primary"
                  style={{ background: '#ea580c' }}
                  onClick={() => {
                    const toEdit = viewingVideoDetails;
                    setViewingVideoDetails(null);
                    setEditModal({
                      isOpen: true,
                      isCreate: false,
                      index: targetIdx >= 0 ? targetIdx : 0,
                      data: { ...toEdit }
                    });
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}


      {/* ── MODAL 3: Video Picker / Swap Modal ── */}
      {pickerModal.isOpen && (
        <div className="avv-modal-overlay" onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}>
          <div className="avv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="avv-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={18} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Swap Video for Position #{typeof pickerModal.targetIndex === 'number' ? pickerModal.targetIndex + 1 : 1}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="avv-modal-body">
              {/* Search & Filter in Picker */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="avv-search-bar" style={{ flex: 1, padding: '7px 14px' }}>
                  <Search size={14} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by title, guest, series..."
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    className="avv-search-input"
                  />
                  {pickerSearch && (
                    <button type="button" onClick={() => setPickerSearch('')} className="avv-search-clear-btn">✕</button>
                  )}
                </div>

                <select
                  className="avv-form-select"
                  style={{ width: 'auto', minWidth: '160px' }}
                  value={pickerCategory}
                  onChange={e => setPickerCategory(e.target.value)}
                >
                  <option value="all">All Formats</option>
                  {VIDEO_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* List of Videos */}
              <div className="avv-picker-grid">
                {filteredPickerPool.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>No videos found.</p>
                ) : (
                  filteredPickerPool.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="avv-picker-card"
                      onClick={() => handleReplaceVideo(item)}
                    >
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80'} 
                        alt={item.title} 
                        className="avv-picker-thumb"
                      />
                      <div className="avv-picker-details">
                        <span className="avv-picker-title">{item.title}</span>
                        <div className="avv-picker-meta">
                          <span style={{ color: getCategoryColor(item.category), fontWeight: 700 }}>
                            {item.categoryLabel || item.category}
                          </span>
                          <span>•</span>
                          <span>{item.guest}</span>
                          <span>•</span>
                          <span>{item.duration}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ea580c',
                          background: 'rgba(234, 88, 12, 0.1)',
                          color: '#ea580c',
                          fontSize: '0.78rem',
                          fontWeight: 750,
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="avv-modal-footer">
              <button
                type="button"
                className="avv-btn-secondary"
                onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
