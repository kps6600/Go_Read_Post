import React, { useState, useEffect } from 'react';
import { 
  Tv, Play, Plus, Search, Filter, Trash2, Edit3, Eye, 
  Clock, ThumbsUp, User, ExternalLink, Check, X, Sparkles,
  ArrowUpRight, RefreshCw, Film, Video, Calendar, Share2,
  CheckCircle2, AlertCircle, Layers, Sliders,
  Flame, Star, Image as ImageIcon, Link as LinkIcon, RotateCcw
} from 'lucide-react';
import { VIDEO_EPISODES, VIDEO_CATEGORIES, getStoredVideos, saveStoredVideos, STORAGE_KEY } from '../../data/videoData';
import { VideoService } from '../../services/videoService';
import VideoPlayerModal from '../VideoPlayerModal';

const YoutubeIcon = ({ size = 16, style, color = '#e11d48' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={style}
    color={color}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export function parseVideoUrl(input) {
  if (!input) return null;
  const str = input.trim();

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

export default function AdminVideosView({ onShowToast }) {
  const [videos, setVideos] = useState(() => getStoredVideos());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVideosFromDb();
  }, [selectedCategory]);

  const loadVideosFromDb = async () => {
    setLoading(true);
    try {
      const data = await VideoService.getAdminVideos({
        category: selectedCategory,
        search: searchQuery
      });
      if (Array.isArray(data) && data.length > 0) {
        setVideos(data);
        saveStoredVideos(data);
      }
    } catch (err) {
      console.warn('Could not load videos from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [previewVideo, setPreviewVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    title: '',
    series: 'Founders Unfiltered',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    duration: '35:00',
    views: '120K',
    likes: '12.4K',
    guest: '',
    guestRole: 'Founder & CEO',
    guestCompany: '',
    guestBio: '',
    host: 'Shradha Sharma',
    rawVideoUrl: 'https://www.youtube.com/watch?v=cKxRvEZd3Mw',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/cKxRvEZd3Mw?autoplay=1&rel=0',
    description: '',
    highlights: ['Key operational breakthrough', 'Capital allocation strategy', 'Next 3-year vision'],
    isFeatured: false,
    isTrending: true,
    status: 'published'
  });

  // UI helpers in modal
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [videoDetectionStatus, setVideoDetectionStatus] = useState(null);

  // Persist whenever videos change
  useEffect(() => {
    saveStoredVideos(videos);
  }, [videos]);

  // Filter videos
  const filteredVideos = videos.filter(v => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (v.title || '').toLowerCase().includes(q);
      const matchGuest = (v.guest || '').toLowerCase().includes(q);
      const matchSeries = (v.series || '').toLowerCase().includes(q);
      const matchHost = (v.host || '').toLowerCase().includes(q);
      if (!matchTitle && !matchGuest && !matchSeries && !matchHost) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalEpisodes = videos.length;
  const totalViewsNum = videos.reduce((sum, v) => {
    const raw = parseInt(v.views?.replace(/[^0-9]/g, '') || '0');
    return sum + raw;
  }, 0);
  const seriesCount = new Set(videos.map(v => v.series)).size;

  const handleVideoUrlChange = (val) => {
    const parsed = parseVideoUrl(val);
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        rawVideoUrl: val,
        youtubeEmbedUrl: parsed.embedUrl,
        image: prev.image && !prev.image.includes('youtube') && !prev.image.includes('unsplash') ? prev.image : parsed.maxResThumb,
        fallbackImage: parsed.hqThumb
      }));
      setVideoDetectionStatus({ valid: true, id: parsed.id, provider: parsed.provider });
    } else {
      setFormData(prev => ({
        ...prev,
        rawVideoUrl: val,
        youtubeEmbedUrl: val
      }));
      setVideoDetectionStatus(val.trim() ? { valid: false } : null);
    }
  };

  const handleAutoFetchDetails = async (targetUrl = null) => {
    const urlToFetch = targetUrl || formData.rawVideoUrl || formData.youtubeEmbedUrl;
    if (!urlToFetch || !urlToFetch.trim()) {
      alert('Please paste a YouTube video URL first.');
      return;
    }
    const parsed = parseVideoUrl(urlToFetch);
    const queryUrl = parsed ? parsed.watchUrl : urlToFetch;

    setIsFetchingMeta(true);
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(queryUrl)}`);
      const data = await res.json();
      if (data && data.title) {
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          guest: prev.guest || (data.author_name ? data.author_name.replace(/ - Topic$/, '').replace(/ Official$/, '') : ''),
          image: data.thumbnail_url || (parsed ? parsed.maxResThumb : prev.image),
          fallbackImage: parsed ? parsed.hqThumb : prev.fallbackImage,
          rawVideoUrl: queryUrl,
          youtubeEmbedUrl: parsed ? parsed.embedUrl : prev.youtubeEmbedUrl
        }));
        if (parsed) {
          setVideoDetectionStatus({ valid: true, id: parsed.id, provider: parsed.provider });
        }
        if (onShowToast) onShowToast(`✨ Auto-fetched video info & HD thumbnail for "${data.title.slice(0, 35)}..."`);
      } else if (parsed) {
        setFormData(prev => ({
          ...prev,
          youtubeEmbedUrl: parsed.embedUrl,
          image: parsed.maxResThumb,
          fallbackImage: parsed.hqThumb
        }));
        setVideoDetectionStatus({ valid: true, id: parsed.id, provider: parsed.provider });
        if (onShowToast) onShowToast(`Detected YouTube ID (${parsed.id}) and applied HD poster!`);
      } else {
        alert('Could not auto-fetch video info. You can still fill details manually.');
      }
    } catch (err) {
      if (parsed) {
        setFormData(prev => ({
          ...prev,
          youtubeEmbedUrl: parsed.embedUrl,
          image: parsed.maxResThumb,
          fallbackImage: parsed.hqThumb
        }));
        setVideoDetectionStatus({ valid: true, id: parsed.id, provider: parsed.provider });
        if (onShowToast) onShowToast(`Detected YouTube ID (${parsed.id}) and set thumbnail!`);
      } else {
        alert('Could not connect to metadata service. Please check your internet or enter details manually.');
      }
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleAddHighlight = (text) => {
    const clean = (text || newHighlightInput || '').trim();
    if (!clean) return;
    if (!formData.highlights.includes(clean)) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, clean]
      }));
    }
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleOpenCreate = () => {
    setEditingVideo(null);
    setIsLivePreview(false);
    setNewHighlightInput('');
    const defaultYt = 'https://www.youtube.com/watch?v=cKxRvEZd3Mw';
    const parsed = parseVideoUrl(defaultYt);
    setFormData({
      title: '',
      series: 'Founders Unfiltered',
      category: 'interviews',
      categoryLabel: 'Founder Interview',
      duration: '38:00',
      views: '145K',
      likes: '14.2K',
      guest: '',
      guestRole: 'Founder & CEO',
      guestCompany: '',
      guestBio: '',
      host: 'Shradha Sharma',
      rawVideoUrl: defaultYt,
      image: parsed ? parsed.maxResThumb : 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80',
      fallbackImage: parsed ? parsed.hqThumb : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      youtubeEmbedUrl: parsed ? parsed.embedUrl : 'https://www.youtube.com/embed/cKxRvEZd3Mw?autoplay=1&rel=0',
      description: '',
      highlights: [
        'Strategic architecture and market breakthrough',
        'Unit economics and sustainable scale formula',
        'Leadership lessons from the hyper-growth phase'
      ],
      isFeatured: false,
      isTrending: true,
      status: 'published'
    });
    if (parsed) {
      setVideoDetectionStatus({ valid: true, id: parsed.id, provider: 'YouTube' });
    }
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVideo(v);
    setIsLivePreview(false);
    setNewHighlightInput('');
    const rawUrl = v.youtubeEmbedUrl || `https://www.youtube.com/watch?v=${v.id}`;
    const parsed = parseVideoUrl(rawUrl);
    setFormData({
      title: v.title || '',
      series: v.series || 'Founders Unfiltered',
      category: v.category || 'interviews',
      categoryLabel: v.categoryLabel || 'Founder Interview',
      duration: v.duration || '35:00',
      views: v.views || '150K',
      likes: v.likes || '12K',
      guest: v.guest || '',
      guestRole: v.guestRole || '',
      guestCompany: v.guestCompany || '',
      guestBio: v.guestBio || '',
      host: v.host || 'Shradha Sharma',
      rawVideoUrl: parsed ? parsed.watchUrl : rawUrl,
      image: v.image || (parsed ? parsed.maxResThumb : ''),
      fallbackImage: v.fallbackImage || (parsed ? parsed.hqThumb : ''),
      youtubeEmbedUrl: v.youtubeEmbedUrl || (parsed ? parsed.embedUrl : ''),
      description: v.description || '',
      highlights: Array.isArray(v.highlights) && v.highlights.length > 0 ? v.highlights : ['Key operational milestone'],
      isFeatured: Boolean(v.isFeatured),
      isTrending: Boolean(v.isTrending),
      status: v.status || 'published'
    });
    if (parsed) {
      setVideoDetectionStatus({ valid: true, id: parsed.id, provider: parsed.provider });
    }
    setIsCreateModalOpen(true);
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Are you sure you want to remove this video production from database?')) {
      try {
        await VideoService.deleteVideo(id);
      } catch (e) {
        console.warn('Could not delete from server DB:', e);
      }
      const updated = videos.filter(v => (v._id !== id && v.id !== id));
      setVideos(updated);
      saveStoredVideos(updated);
      onShowToast?.('Video episode removed successfully from database');
    }
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide an episode title.');
      return;
    }

    const parsed = parseVideoUrl(formData.rawVideoUrl || formData.youtubeEmbedUrl);
    const finalEmbedUrl = parsed ? parsed.embedUrl : (formData.youtubeEmbedUrl || '');
    const finalThumb = formData.image || (parsed ? parsed.maxResThumb : 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200');

    // Matching category label
    const catObj = VIDEO_CATEGORIES.find(c => c.id === formData.category);
    const categoryLabel = catObj ? catObj.label : 'Founder Interview';

    const payload = {
      ...formData,
      categoryLabel,
      youtubeEmbedUrl: finalEmbedUrl,
      videoUrl: formData.rawVideoUrl || (parsed ? parsed.watchUrl : finalEmbedUrl),
      image: finalThumb
    };

    let updatedList = [];
    if (editingVideo) {
      const targetId = editingVideo._id || editingVideo.id;
      let saved = null;
      try {
        saved = await VideoService.updateVideo(targetId, payload);
      } catch (err) {
        console.warn('Error saving to DB:', err);
      }
      updatedList = videos.map(v => {
        if (v._id === targetId || v.id === targetId) {
          return saved || { ...v, ...payload };
        }
        return v;
      });
      if (onShowToast) onShowToast(`Updated episode in database: "${formData.title}"`);
    } else {
      let created = null;
      try {
        created = await VideoService.createVideo(payload);
      } catch (err) {
        console.warn('Error creating video in DB:', err);
      }
      const newEntry = created || {
        ...payload,
        id: `video-${Date.now()}`,
        publishedAt: 'Just now'
      };
      updatedList = [newEntry, ...videos];
      if (onShowToast) onShowToast(`Published video episode to database: "${formData.title}"`);
    }

    setVideos(updatedList);
    saveStoredVideos(updatedList);
    setIsCreateModalOpen(false);
    setEditingVideo(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all video data to original studio catalog?')) {
      localStorage.removeItem(STORAGE_KEY);
      setVideos(VIDEO_EPISODES);
      saveStoredVideos(VIDEO_EPISODES);
      onShowToast?.('Video catalog reset to defaults');
    }
  };

  return (
    <div className="admin-posts-container">
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button 
          type="button" 
          className="adv-secondary-btn" 
          onClick={handleResetDefaults}
          title="Restore default catalog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: 'var(--bg-card, #fff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: 'var(--text-secondary, #64748b)'
          }}
        >
          <RefreshCw size={14} />
          <span>Reset Defaults</span>
        </button>

        <button 
          type="button" 
          className="adv-primary-btn" 
          onClick={handleOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            background: 'var(--brand-primary, #e11d48)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)'
          }}
        >
          <Plus size={16} />
          <span>New Video Episode</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="adv-stats-row" style={{ marginBottom: '1.5rem' }}>
        <div className="adv-stat-card">
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(225, 29, 72, 0.12)', color: '#e11d48' }}>
            <Tv size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Total Video Episodes</span>
            <div className="adv-stat-number">{totalEpisodes}</div>
            <span className="adv-stat-sub">Across {seriesCount} studio series</span>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0284c7' }}>
            <Eye size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Total Views Logged</span>
            <div className="adv-stat-number">{(totalViewsNum / 1000).toFixed(1)}M+</div>
            <span className="adv-stat-sub">High-signal founder plays</span>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <Film size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Studio Formats</span>
            <div className="adv-stat-number">{VIDEO_CATEGORIES.length}</div>
            <span className="adv-stat-sub">Interviews, Masterclass &amp; Keynotes</span>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <ThumbsUp size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Operator Engagement</span>
            <div className="adv-stat-number">280K+</div>
            <span className="adv-stat-sub">Likes &amp; bookmarks recorded</span>
          </div>
        </div>
      </div>

      {/* Omnibar: Search, Filters & View Toggle */}
      <div className="admin-posts-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search episodes by title, guest, host, or series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {VIDEO_CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              className={`adv-tab-pill ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 650,
                border: selectedCategory === c.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-light)',
                background: selectedCategory === c.id ? 'rgba(225, 29, 72, 0.1)' : 'var(--bg-card)',
                color: selectedCategory === c.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* View Mode */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <button 
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: 'none',
              background: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Table
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('cards')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: 'none',
              background: viewMode === 'cards' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'cards' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Main Video List Display */}
      {viewMode === 'table' ? (
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Video Episode</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Series &amp; Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Featuring Guest</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Metrics</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map(vid => (
                  <tr key={vid.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s ease' }}>
                    {/* Title + Thumbnail */}
                    <td style={{ padding: '0.85rem 1rem', minWidth: '320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div 
                          style={{ position: 'relative', width: '80px', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', background: '#000', cursor: 'pointer', flexShrink: 0 }}
                          onClick={() => setPreviewVideo(vid)}
                          title="Preview video"
                        >
                          <img 
                            src={vid.image} 
                            alt={vid.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = vid.fallbackImage; }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={14} fill="#fff" color="#fff" />
                          </div>
                        </div>
                        <div>
                          <strong 
                            style={{ display: 'block', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 750, lineHeight: 1.35 }}
                            onClick={() => handleOpenEdit(vid)}
                          >
                            {vid.title}
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ID: {vid.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Series */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 750, color: '#e11d48', background: 'rgba(225, 29, 72, 0.1)', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                        {vid.series}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {vid.categoryLabel}
                      </div>
                    </td>

                    {/* Guest */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{vid.guest}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{vid.guestRole} • {vid.guestCompany}</span>
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {vid.duration}
                    </td>

                    {/* Views & Likes */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div><Eye size={12} style={{ display: 'inline', marginRight: '3px' }} />{vid.views} views</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '2px' }}>
                        <ThumbsUp size={11} style={{ display: 'inline', marginRight: '3px' }} />{vid.likes || '10K'} likes
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button 
                          type="button" 
                          onClick={() => setPreviewVideo(vid)}
                          style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                          title="Watch in Cinema Player"
                        >
                          <Play size={13} />
                        </button>

                        <button 
                          type="button" 
                          onClick={() => handleOpenEdit(vid)}
                          style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                          title="Edit Episode"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button 
                          type="button" 
                          onClick={() => handleDeleteVideo(vid.id)}
                          style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(225,29,72,0.2)', background: 'rgba(225,29,72,0.06)', color: '#e11d48', cursor: 'pointer' }}
                          title="Delete Episode"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
          {filteredVideos.map(vid => (
            <div 
              key={vid.id} 
              style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div 
                style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', cursor: 'pointer' }}
                onClick={() => setPreviewVideo(vid)}
              >
                <img 
                  src={vid.image} 
                  alt={vid.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = vid.fallbackImage; }}
                />
                <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                  {vid.duration}
                </span>
                <span style={{ position: 'absolute', top: '6px', left: '6px', background: '#e11d48', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
                  {vid.series}
                </span>
              </div>

              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', fontWeight: 750, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {vid.title}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                  <User size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  <strong>{vid.guest}</strong> ({vid.guestRole})
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {vid.views} views
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setPreviewVideo(vid)}
                      style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      Watch
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleOpenEdit(vid)}
                      style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteVideo(vid.id)}
                      style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(225,29,72,0.2)', background: 'rgba(225,29,72,0.06)', color: '#e11d48', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Studio Production Modal (Industry-Grade CMS Workbench) */}
      {isCreateModalOpen && (
        <div className="video-studio-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div 
            className="video-studio-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="video-studio-header">
              <div>
                <div className="video-studio-badge">
                  <Film size={14} />
                  <span>{editingVideo ? 'EDIT EPISODE' : 'NEW STUDIO PRODUCTION'}</span>
                </div>
                <h3 className="video-studio-title">
                  {editingVideo ? `Edit: ${editingVideo.title}` : 'Add New Video Episode'}
                </h3>
                <p className="video-studio-subtitle">
                  Paste YouTube or Vimeo link with instant 1-click auto-metadata extraction and 16:9 stage preview.
                </p>
              </div>
              <button 
                type="button" 
                className="video-studio-close-btn" 
                onClick={() => setIsCreateModalOpen(false)}
                title="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form with 2-Column Studio Grid */}
            <form onSubmit={handleSaveVideo} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="video-studio-body">
                
                {/* ═══ LEFT COLUMN: Media Source, Live Stage & Visual Assets ═══ */}
                <div className="video-studio-pane">
                  
                  {/* Smart Video Import Card */}
                  <div className="video-studio-card card-highlight">
                    <div className="video-studio-card-title">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e11d48' }}>
                        <Sparkles size={16} />
                        1-Click Smart Video Import
                      </span>
                      {videoDetectionStatus && (
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '999px',
                          background: videoDetectionStatus.valid ? '#ecfdf5' : '#fef2f2',
                          color: videoDetectionStatus.valid ? '#059669' : '#dc2626',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {videoDetectionStatus.valid ? (
                            <>
                              <CheckCircle2 size={12} />
                              {videoDetectionStatus.provider} ({videoDetectionStatus.id})
                            </>
                          ) : (
                            <>
                              <AlertCircle size={12} />
                              Invalid URL
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <YoutubeIcon size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#e11d48' }} />
                        <input 
                          type="text"
                          placeholder="Paste YouTube watch URL, shorts, or embed URL..."
                          value={formData.rawVideoUrl}
                          onChange={(e) => handleVideoUrlChange(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutoFetchDetails()}
                        disabled={isFetchingMeta}
                        className="adv-secondary-btn"
                        style={{
                          whiteSpace: 'nowrap',
                          padding: '0.55rem 0.85rem',
                          background: '#f8fafc',
                          borderColor: '#cbd5e1',
                          color: '#0f172a',
                          fontWeight: 750,
                          fontSize: '0.8rem'
                        }}
                        title="Fetch title, guest, and HD thumbnail from YouTube oEmbed"
                      >
                        {isFetchingMeta ? (
                          <>
                            <RefreshCw size={13} className="spin-animate" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} color="#e11d48" />
                            Auto-Fetch
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Demos:</span>
                      <button 
                        type="button" 
                        className="video-pill-preset"
                        onClick={() => {
                          const demo = 'https://www.youtube.com/watch?v=cKxRvEZd3Mw';
                          handleVideoUrlChange(demo);
                          handleAutoFetchDetails(demo);
                        }}
                      >
                        Ola Krutrim AI
                      </button>
                      <button 
                        type="button" 
                        className="video-pill-preset"
                        onClick={() => {
                          const demo = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                          handleVideoUrlChange(demo);
                          handleAutoFetchDetails(demo);
                        }}
                      >
                        Studio Keynote
                      </button>
                    </div>
                  </div>

                  {/* 16:9 Cinema Stage Preview & Interactive Player Card */}
                  <div className="video-studio-card">
                    <div className="video-studio-card-title">
                      <span>16:9 Stage Preview</span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => setIsLivePreview(false)}
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: !isLivePreview ? '#e11d48' : 'var(--border-light)',
                            background: !isLivePreview ? 'rgba(225, 29, 72, 0.08)' : 'transparent',
                            color: !isLivePreview ? '#e11d48' : 'var(--text-secondary)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Poster View
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsLivePreview(true)}
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: isLivePreview ? '#e11d48' : 'var(--border-light)',
                            background: isLivePreview ? 'rgba(225, 29, 72, 0.08)' : 'transparent',
                            color: isLivePreview ? '#e11d48' : 'var(--text-secondary)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Live Player
                        </button>
                      </div>
                    </div>

                    <div className="video-stage-box">
                      {isLivePreview && formData.youtubeEmbedUrl ? (
                        <iframe
                          src={formData.youtubeEmbedUrl}
                          title={formData.title || 'Video Preview'}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <img 
                            src={formData.image || formData.fallbackImage} 
                            alt={formData.title || 'Video poster'} 
                            className="video-stage-poster"
                            onError={(e) => { e.target.onerror = null; e.target.src = formData.fallbackImage; }}
                          />
                          <div 
                            className="video-stage-play-overlay"
                            onClick={() => setIsLivePreview(true)}
                            title="Click to play preview"
                          >
                            <div className="video-stage-play-btn">
                              <Play size={22} fill="#ffffff" style={{ marginLeft: '3px' }} />
                            </div>
                          </div>
                          <span className="video-stage-tag">{formData.series}</span>
                          <span className="video-stage-duration">{formData.duration || '00:00'}</span>
                        </>
                      )}
                    </div>

                    {/* Poster Presets & Custom URL */}
                    <div style={{ marginTop: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 750, color: 'var(--text-secondary)' }}>
                          Thumbnail Poster URL
                        </label>
                        {videoDetectionStatus?.id && (
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              type="button"
                              className="video-pill-preset"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  image: `https://img.youtube.com/vi/${videoDetectionStatus.id}/maxresdefault.jpg`
                                }));
                              }}
                            >
                              MaxRes (1080p)
                            </button>
                            <button
                              type="button"
                              className="video-pill-preset"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  image: `https://img.youtube.com/vi/${videoDetectionStatus.id}/hqdefault.jpg`
                                }));
                              }}
                            >
                              HQ (720p)
                            </button>
                          </div>
                        )}
                      </div>
                      <input 
                        type="text"
                        placeholder="https://img.youtube.com/... or https://images.unsplash.com/..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Duration & Engagement Preset Card */}
                  <div className="video-studio-card">
                    <div className="video-studio-card-title">
                      <span>Runtime &amp; Metrics</span>
                      <Clock size={14} color="var(--text-muted)" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Duration (MM:SS) *
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. 38:00"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem',
                            fontWeight: 700
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Display Views
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. 145K"
                          value={formData.views}
                          onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Display Likes
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. 12.8K"
                          value={formData.likes}
                          onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Presets:</span>
                      {['15:00', '25:00', '35:00', '45:00', '58:30'].map(dur => (
                        <button
                          key={dur}
                          type="button"
                          className={`video-pill-preset ${formData.duration === dur ? 'is-active' : ''}`}
                          onClick={() => setFormData({ ...formData, duration: dur })}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* ═══ RIGHT COLUMN: Metadata, Taxonomy, Guest & Highlights ═══ */}
                <div className="video-studio-pane">

                  {/* Primary Editorial Info */}
                  <div className="video-studio-card">
                    <div className="video-studio-card-title">
                      <span>Editorial Identification</span>
                      <Film size={14} color="#e11d48" />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                        Episode Title *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Building Sovereign AI Stack: Bhavish Aggarwal on Krutrim..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.92rem',
                          fontWeight: 700
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                          Series Franchise *
                        </label>
                        <select 
                          value={formData.series}
                          onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem',
                            fontWeight: 600
                          }}
                        >
                          <option value="Founders Unfiltered">Founders Unfiltered</option>
                          <option value="Studio Masterclass">Studio Masterclass</option>
                          <option value="DeepTech Spotlight">DeepTech Spotlight</option>
                          <option value="TechSparks Archives">TechSparks Archives</option>
                          <option value="Capital Roundtable">Capital Roundtable</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                          Category Track *
                        </label>
                        <select 
                          value={formData.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            const catObj = VIDEO_CATEGORIES.find(c => c.slug === val);
                            setFormData({
                              ...formData,
                              category: val,
                              categoryLabel: catObj ? catObj.title : val
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem',
                            fontWeight: 600
                          }}
                        >
                          {VIDEO_CATEGORIES.filter(c => c.slug !== 'all').map(cat => (
                            <option key={cat.slug} value={cat.slug}>
                              {cat.title} ({cat.slug})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                        Episode Synopsis / Brief
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Inside the high-stakes ambition to build India's sovereign AI infrastructure, computational sovereignty, and scaling foundational models..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          lineHeight: 1.5,
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>

                  {/* Guest & Host Credentials */}
                  <div className="video-studio-card">
                    <div className="video-studio-card-title">
                      <span>Featured Guest &amp; Host</span>
                      <User size={14} color="#64748b" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Guest Full Name *
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Bhavish Aggarwal"
                          value={formData.guest}
                          onChange={(e) => setFormData({ ...formData, guest: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem',
                            fontWeight: 700
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Guest Role
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. Founder & CEO"
                          value={formData.guestRole}
                          onChange={(e) => setFormData({ ...formData, guestRole: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Guest Company
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. Ola & Krutrim"
                          value={formData.guestCompany}
                          onChange={(e) => setFormData({ ...formData, guestCompany: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Anchor / Host
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Shradha Sharma"
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Key Takeaways & Discussion Highlights Chip Builder */}
                  <div className="video-studio-card">
                    <div className="video-studio-card-title">
                      <span>Key Discussion Takeaways</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formData.highlights.length} added
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <input 
                        type="text"
                        placeholder="Add takeaway (e.g. $50M seed round breakdown)..."
                        value={newHighlightInput}
                        onChange={(e) => setNewHighlightInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddHighlight();
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem'
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddHighlight()}
                        className="adv-secondary-btn"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>

                    {/* Chips Display */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {formData.highlights.map((item, idx) => (
                        <span 
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '999px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.75rem',
                            color: 'var(--text-primary)',
                            fontWeight: 600
                          }}
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Remove takeaway"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {formData.highlights.length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No takeaways added yet. Type above and press Enter.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Placement & Publication Settings */}
                  <div className="video-studio-card">
                    <div className="video-studio-card-title">
                      <span>Placement &amp; Distribution</span>
                      <Sliders size={14} color="var(--text-muted)" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        background: formData.isFeatured ? '#fff1f2' : 'var(--bg-secondary)',
                        cursor: 'pointer'
                      }}>
                        <input 
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          style={{ accentColor: '#e11d48' }}
                        />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: formData.isFeatured ? '#e11d48' : 'var(--text-primary)' }}>
                          Hero Featured
                        </span>
                      </label>

                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        background: formData.isTrending ? '#ecfdf5' : 'var(--bg-secondary)',
                        cursor: 'pointer'
                      }}>
                        <input 
                          type="checkbox"
                          checked={formData.isTrending}
                          onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                          style={{ accentColor: '#059669' }}
                        />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: formData.isTrending ? '#059669' : 'var(--text-primary)' }}>
                          Trending Feed
                        </span>
                      </label>

                      <div>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          <option value="published">Status: Published</option>
                          <option value="draft">Status: Draft</option>
                          <option value="archived">Status: Archived</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Footer Bar */}
              <div className="video-studio-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="adv-secondary-btn"
                    onClick={() => {
                      setPreviewVideo({
                        ...formData,
                        id: editingVideo?.id || 'live-preview-temp'
                      });
                    }}
                    style={{ fontSize: '0.78rem', padding: '0.5rem 0.85rem' }}
                    title="Open in GoReadPost Fullscreen Cinema Player"
                  >
                    <Play size={13} fill="currentColor" />
                    Cinema Player Test
                  </button>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Auto-saves to browser storage &amp; updates public /videos page instantly
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="adv-secondary-btn" 
                    onClick={() => setIsCreateModalOpen(false)}
                    style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="adv-primary-btn"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    <Check size={16} />
                    <span>{editingVideo ? 'Save Changes' : 'Publish Video Episode'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cinema Player Preview Inside Admin */}
      {previewVideo && (
        <VideoPlayerModal 
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
          onSelectVideo={(v) => setPreviewVideo(v)}
        />
      )}
    </div>
  );
}
