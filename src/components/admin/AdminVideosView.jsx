import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Plus, Search, Filter, Trash2, Edit2, RefreshCw, 
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, 
  Check, X, ExternalLink, Clock, Sparkles, ThumbsUp, Layers,
  Film, Video as VideoIcon, Tv, Eye, User
} from 'lucide-react';
import { 
  VIDEO_EPISODES, 
  VIDEO_CATEGORIES, 
  getStoredVideos, 
  saveStoredVideos 
} from '../../data/videoData';
import { VideoService } from '../../services/videoService';
import { PageService } from '../../services/pageService';
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

  return {
    ...v,
    id,
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
  const [editModal, setEditModal] = useState({ isOpen: false, isCreate: false, index: null, data: null });
  const [pickerModal, setPickerModal] = useState({ isOpen: false, targetIndex: null });
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

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
        return (
          title.includes(q) || 
          guest.includes(q) || 
          host.includes(q) || 
          series.includes(q) || 
          desc.includes(q) || 
          company.includes(q)
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
        setEditModal(prev => ({
          ...prev,
          data: {
            ...prev.data,
            title: data.title || prev.data.title,
            guest: prev.data.guest || (data.author_name ? data.author_name.replace(/ - Topic$/, '').replace(/ Official$/, '') : ''),
            image: data.thumbnail_url || (parsed ? parsed.maxResThumb : prev.data.image),
            videoUrl: queryUrl,
            youtubeEmbedUrl: parsed ? parsed.embedUrl : (prev.data.youtubeEmbedUrl || queryUrl)
          }
        }));
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
      youtubeEmbedUrl: parsed ? parsed.embedUrl : (data.youtubeEmbedUrl || data.videoUrl),
      videoUrl: parsed ? parsed.watchUrl : (data.videoUrl || data.youtubeEmbedUrl),
      image: data.image || (parsed ? parsed.maxResThumb : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80')
    });

    if (isCreate) {
      setRankedVideos(prev => [finalVideo, ...prev]);
      setAllVideos(prev => [finalVideo, ...prev]);
      if (onShowToast) onShowToast(`Added new video: "${finalVideo.title.slice(0, 35)}..."`);
    } else if (typeof index === 'number' && index >= 0) {
      setRankedVideos(prev => {
        const next = [...prev];
        next[index] = finalVideo;
        return next;
      });
      setAllVideos(prev => {
        const next = [...prev];
        const aIdx = next.findIndex(v => v.id === finalVideo.id || v._id === finalVideo._id);
        if (aIdx >= 0) next[aIdx] = finalVideo;
        return next;
      });
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
            onClick={() => setEditModal({
              isOpen: true,
              isCreate: true,
              index: null,
              data: {
                title: '',
                series: 'Founders Unfiltered',
                category: 'interviews',
                categoryLabel: 'Founder Interview',
                duration: '30:00',
                views: '120K',
                guest: '',
                guestRole: 'Founder & CEO',
                guestCompany: '',
                guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                host: 'Shradha Sharma',
                image: '',
                videoUrl: '',
                youtubeEmbedUrl: '',
                description: '',
                highlights: []
              }
            })}
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

              <button
                type="button"
                className="avv-hero-play-btn"
                onClick={() => setPreviewVideo(activeSlide)}
                title="Play full video episode"
              >
                <Play size={15} fill="currentColor" />
                <span>Watch Episode</span>
              </button>
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
                    <div className="avv-rank-label">
                      <span style={{ color: '#ea580c', fontWeight: 850 }}>#{displayRank + 1}</span>
                      <span style={{ marginLeft: '6px', opacity: 0.65 }}>in Video Showcase</span>
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
                  <div className="avv-card-interior">
                    {/* Left Column: 16:9 Thumbnail + Guest Meta Directly Below Image */}
                    <div className="avv-card-thumb-column">
                      <div 
                        className="avv-card-thumb-wrap"
                        onClick={() => setPreviewVideo(video)}
                        title="Click to play preview"
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
                        <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 750 }}>
                          🔥 {vidViews} views
                        </span>
                      </div>

                      <h3 className="avv-card-title">{vidTitle}</h3>

                      {vidDesc && (
                        <p className="avv-card-desc">{vidDesc}</p>
                      )}

                      <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(video)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(234, 88, 12, 0.1)',
                            color: '#ea580c',
                            border: '1px solid rgba(234, 88, 12, 0.25)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 750,
                            cursor: 'pointer'
                          }}
                        >
                          <Play size={12} fill="currentColor" />
                          <span>Watch Preview</span>
                        </button>

                        {video.videoUrl && (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#64748b',
                              fontSize: '0.76rem',
                              fontWeight: 650,
                              textDecoration: 'none'
                            }}
                            title="Open external video link"
                          >
                            <ExternalLink size={12} />
                            <span>Source</span>
                          </a>
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

      {/* ── MODAL 2: Video Editor Modal (Create / Edit) ── */}
      {editModal.isOpen && editModal.data && (
        <div className="avv-modal-overlay" onClick={() => setEditModal({ isOpen: false, isCreate: false, index: null, data: null })}>
          <div className="avv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="avv-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={20} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {editModal.isCreate ? 'Create New Video Episode' : `Edit Video Episode #${(editModal.index || 0) + 1}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModal({ isOpen: false, isCreate: false, index: null, data: null })}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="avv-modal-body">
              {/* Video URL with Auto-fetch Button */}
              <div className="avv-form-group">
                <label className="avv-form-label">YouTube or Vimeo Video URL</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="avv-form-input"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={editModal.data.videoUrl || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const parsed = parseVideoUrl(val);
                      setEditModal(prev => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          videoUrl: val,
                          youtubeEmbedUrl: parsed ? parsed.embedUrl : (prev.data.youtubeEmbedUrl || val),
                          image: prev.data.image || (parsed ? parsed.maxResThumb : '')
                        }
                      }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoFetchYouTube()}
                    disabled={isFetchingMeta}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isFetchingMeta ? <RefreshCw size={13} className="avv-spin" /> : <Sparkles size={13} />}
                    <span>Auto-Fetch</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="avv-form-group">
                <label className="avv-form-label">Episode Title *</label>
                <input
                  type="text"
                  className="avv-form-input"
                  placeholder="e.g. Building India's Sovereign AI Stack: Bhavish Aggarwal on Krutrim"
                  value={editModal.data.title || ''}
                  onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                />
              </div>

              {/* 2-Column: Series & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="avv-form-group">
                  <label className="avv-form-label">Series / Show Name</label>
                  <input
                    type="text"
                    className="avv-form-input"
                    placeholder="e.g. Founders Unfiltered"
                    value={editModal.data.series || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, series: e.target.value } }))}
                  />
                </div>

                <div className="avv-form-group">
                  <label className="avv-form-label">Format / Category</label>
                  <select
                    className="avv-form-select"
                    value={editModal.data.category || 'interviews'}
                    onChange={e => {
                      const catId = e.target.value;
                      const matched = VIDEO_CATEGORIES.find(c => c.id === catId);
                      setEditModal(prev => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          category: catId,
                          categoryLabel: matched ? matched.label : catId
                        }
                      }));
                    }}
                  >
                    {VIDEO_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2-Column: Duration & Views */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="avv-form-group">
                  <label className="avv-form-label">Duration (e.g. 42:15)</label>
                  <input
                    type="text"
                    className="avv-form-input"
                    placeholder="42:15"
                    value={editModal.data.duration || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, duration: e.target.value } }))}
                  />
                </div>

                <div className="avv-form-group">
                  <label className="avv-form-label">Views Count (e.g. 245K)</label>
                  <input
                    type="text"
                    className="avv-form-input"
                    placeholder="245K"
                    value={editModal.data.views || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, views: e.target.value } }))}
                  />
                </div>
              </div>

              {/* Guest & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="avv-form-group">
                  <label className="avv-form-label">Guest Name</label>
                  <input
                    type="text"
                    className="avv-form-input"
                    placeholder="e.g. Bhavish Aggarwal"
                    value={editModal.data.guest || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, guest: e.target.value } }))}
                  />
                </div>

                <div className="avv-form-group">
                  <label className="avv-form-label">Guest Role / Company</label>
                  <input
                    type="text"
                    className="avv-form-input"
                    placeholder="e.g. Founder & CEO, Ola & Krutrim"
                    value={editModal.data.guestRole || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, guestRole: e.target.value } }))}
                  />
                </div>
              </div>

              {/* Thumbnail Image URL with Preview */}
              <div className="avv-form-group">
                <label className="avv-form-label">Thumbnail Image URL</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {editModal.data.image && (
                    <img 
                      src={editModal.data.image} 
                      alt="Thumbnail preview" 
                      style={{ width: '80px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <input
                    type="text"
                    className="avv-form-input"
                    placeholder="https://..."
                    value={editModal.data.image || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, image: e.target.value } }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="avv-form-group">
                <label className="avv-form-label">Episode Description & Summary</label>
                <textarea
                  className="avv-form-textarea"
                  rows={3}
                  placeholder="Summary of the conversation, key takeaways, and discussion points..."
                  value={editModal.data.description || ''}
                  onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }))}
                />
              </div>
            </div>

            <div className="avv-modal-footer">
              <button
                type="button"
                className="avv-btn-secondary"
                onClick={() => setEditModal({ isOpen: false, isCreate: false, index: null, data: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="avv-btn-primary"
                onClick={handleSaveEditModal}
              >
                <Check size={16} />
                <span>{editModal.isCreate ? 'Add Video' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
