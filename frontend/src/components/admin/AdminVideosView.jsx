import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Plus, Search, Filter, Trash2, Edit2, RefreshCw, 
  ChevronDown, Check, X, ExternalLink, Clock, ThumbsUp, Layers,
  Film, Video as VideoIcon, Tv, Eye, User, FileText, Copy, Tag, Star, TrendingUp,
  LayoutGrid, List, AlertCircle, Save, CheckCircle2, ChevronRight, Upload
} from 'lucide-react';
import { VideoService } from '../../services/videoService';
import { MediaService } from '../../services/mediaService';
import { TaxonomyService } from '../../services/taxonomyService';
import VideoPlayerModal from '../VideoPlayerModal';
import LiveVideoStudio from './LiveVideoStudio';
import './AdminVideosView.css';

export const VIDEO_CATEGORIES_PRESET = [
  { id: 'all', label: 'All Categories' },
  { id: 'interviews', label: 'Founder Interview' },
  { id: 'masterclass', label: 'Studio Masterclass' },
  { id: 'deeptech', label: 'DeepTech Special' },
  { id: 'keynotes', label: 'Keynotes & Summits' },
  { id: 'market', label: 'Market Dispatches' }
];

export const VIDEO_SERIES_PRESET = [
  { id: 'all', label: 'All Series' },
  { id: 'Founders Unfiltered', label: 'Founders Unfiltered' },
  { id: 'Studio Masterclass', label: 'Studio Masterclass' },
  { id: 'DeepTech Horizons', label: 'DeepTech Horizons' },
  { id: 'TechSparks Sessions', label: 'TechSparks Sessions' }
];

// Helper to parse YouTube or Vimeo URL
export function parseVideoUrl(input) {
  if (!input) return null;
  const str = String(input).trim();

  // YouTube watch / share / embed / shorts
  const ytMatch = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      provider: 'YouTube',
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      maxResThumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      hqThumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  // Direct MP4 / local upload file
  if (/\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(str) || str.startsWith('blob:') || str.startsWith('data:video') || str.includes('/uploads/')) {
    return {
      provider: 'LocalUpload',
      id: str,
      embedUrl: str,
      watchUrl: str,
      maxResThumb: '',
      hqThumb: ''
    };
  }

  return null;
}

export function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `video-${Date.now()}`;
}

export default function AdminVideosView({ onShowToast, onNavigate, currentPath = '/admin/videos' }) {
  // Video List State
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'published' | 'draft'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'views_desc' | 'title_asc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // Selected videos for bulk operations
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Player & Detail Modal
  const [previewVideo, setPreviewVideo] = useState(null);

  // Delete State
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Editor Modal / Drawer State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  // Media picker modal for thumbnail or avatar

  // Taxonomies from DB
  const [dbCategories, setDbCategories] = useState([]);
  const [dbTopics, setDbTopics] = useState([]);



  // Close filter popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    }
    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  // Load Videos on Mount
  useEffect(() => {
    loadVideos();
    loadTaxonomies();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await VideoService.getAdminVideos();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load videos:', err);
      if (onShowToast) onShowToast('Failed to load videos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTaxonomies = async () => {
    try {
      const [cats, tops] = await Promise.all([
        TaxonomyService.getCategories().catch(() => []),
        TaxonomyService.getTopics().catch(() => [])
      ]);
      setDbCategories(Array.isArray(cats) ? cats : []);
      setDbTopics(Array.isArray(tops) ? tops : []);
    } catch (e) {}
  };

  // Open Create Studio
  const handleOpenCreate = () => {
    setEditingVideo(null);
    setIsEditorOpen(true);
  };

  // Open Edit Studio
  const handleOpenEdit = (v) => {
    setEditingVideo(v);
    setIsEditorOpen(true);
  };

  // Toggle Video Status (Published vs Draft)
  const handleToggleStatus = async (v, e) => {
    e?.stopPropagation();
    const newStatus = v.status === 'published' ? 'draft' : 'published';
    try {
      await VideoService.updateVideo(v._id || v.id, { status: newStatus });
      setVideos(prev => prev.map(item => (item._id === v._id || item.id === v.id) ? { ...item, status: newStatus } : item));
      if (onShowToast) onShowToast(`Status updated to ${newStatus}`);
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  // Delete Video Handler
  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    setDeleting(true);
    try {
      await VideoService.deleteVideo(videoToDelete._id || videoToDelete.id);
      setVideos(prev => prev.filter(v => (v._id !== videoToDelete._id && v.id !== videoToDelete.id)));
      if (onShowToast) onShowToast(`Video "${videoToDelete.title}" deleted.`);
      setVideoToDelete(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = videos.length;
    let published = 0;
    let draft = 0;
    let totalViews = 0;

    videos.forEach(v => {
      const isPub = v.status !== 'draft' && v.enabled !== false;
      if (isPub) published++;
      else draft++;
      const vCount = typeof v.views === 'number' ? v.views : parseInt(String(v.views || '0').replace(/[^0-9]/g, '')) * (String(v.views || '').toLowerCase().includes('k') ? 1000 : 1);
      totalViews += (isNaN(vCount) ? 0 : vCount);
    });

    const formattedViews = totalViews >= 1000000 
      ? `${(totalViews / 1000000).toFixed(1)}M` 
      : (totalViews >= 1000 ? `${Math.round(totalViews / 1000)}K` : totalViews);

    return { total, published, draft, views: formattedViews };
  }, [videos]);

  // Filtered & Sorted Videos
  const filteredVideos = useMemo(() => {
    let list = videos.filter(v => {
      const isPub = v.status !== 'draft' && v.enabled !== false;
      if (activeTab === 'published' && !isPub) return false;
      if (activeTab === 'draft' && isPub) return false;

      if (selectedCategory !== 'all' && (v.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedSeries !== 'all' && (v.series || '').toLowerCase() !== selectedSeries.toLowerCase()) {
        return false;
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchTitle = (v.title || '').toLowerCase().includes(q);
        const matchGuest = (v.guest || '').toLowerCase().includes(q);
        const matchHost = (v.host || '').toLowerCase().includes(q);
        const matchSeries = (v.series || '').toLowerCase().includes(q);
        const matchCat = (v.categoryLabel || v.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchGuest && !matchHost && !matchSeries && !matchCat) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'views_desc') {
        const aV = typeof a.views === 'number' ? a.views : parseInt(String(a.views || '0').replace(/[^0-9]/g, ''));
        const bV = typeof b.views === 'number' ? b.views : parseInt(String(b.views || '0').replace(/[^0-9]/g, ''));
        return (bV || 0) - (aV || 0);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return list;
  }, [videos, activeTab, selectedCategory, selectedSeries, search, sortBy]);

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) + (selectedSeries !== 'all' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0);

  if (isEditorOpen) {
    return (
      <LiveVideoStudio
        video={editingVideo}
        onClose={() => setIsEditorOpen(false)}
        onSaveSuccess={async () => {
          await loadVideos();
          setIsEditorOpen(false);
        }}
        onShowToast={onShowToast}
        categories={dbCategories}
      />
    );
  }

  return (
    <div className="abv-container">


      {/* ── KPI Stats Cards Bar (Matching Articles view) ── */}
      <div className="abv-kpi-row" style={{ marginTop: '0.25rem' }}>
        {/* Total Videos */}
        <div 
          className={`abv-kpi-card kpi-all ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          title="Click to view all video episodes"
        >
          <div className="abv-kpi-num">{metrics.total}</div>
          <div className="abv-kpi-label">TOTAL VIDEOS</div>
        </div>

        {/* Published */}
        <div 
          className={`abv-kpi-card kpi-published ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
          title="Click to view published episodes"
        >
          <div className="abv-kpi-num" style={{ color: '#059669' }}>{metrics.published}</div>
          <div className="abv-kpi-label">PUBLISHED</div>
        </div>

        {/* Drafts */}
        <div 
          className={`abv-kpi-card kpi-draft ${activeTab === 'draft' ? 'active' : ''}`}
          onClick={() => setActiveTab('draft')}
          title="Click to view draft episodes"
        >
          <div className="abv-kpi-num" style={{ color: '#d97706' }}>{metrics.draft}</div>
          <div className="abv-kpi-label">DRAFTS</div>
        </div>

        {/* Total Views */}
        <div className="abv-kpi-card kpi-views" style={{ cursor: 'default' }}>
          <div className="abv-kpi-num" style={{ color: '#2563eb' }}>{metrics.views}</div>
          <div className="abv-kpi-label">TOTAL VIEWS</div>
        </div>
      </div>

      {/* ── Toolbar: Search, Filters & View Toggle ── */}
      {/* ── 4. Controls & Filters Omnibar (Matching Articles & Comments views) ── */}
      <div className="abv-filter-bar abv-controls-panel">
        {/* Search Box */}
        <div className="abv-search-box">
          <Search size={16} className="abv-search-icon" />
          <input 
            type="text" 
            placeholder="Search videos by title, host, guest, or series..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="abv-clear-search" onClick={() => setSearch('')} title="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Group: Unified Filters Popover & Create Button */}
        <div className="abv-filter-group">
          {/* Unified Filter Button & Popover */}
          <div className="abv-filter-dropdown-container" ref={filterDropdownRef} style={{ position: 'relative' }}>
            <button 
              type="button" 
              className={`abv-filter-btn ${activeFilterCount > 0 ? 'active' : ''} ${isFilterDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsFilterDropdownOpen(prev => !prev)}
              title="Filter by Category, Series & Sort Order"
            >
              <Filter size={14} className="abv-filter-icon" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="abv-filter-count-badge">{activeFilterCount}</span>
              )}
              <ChevronDown size={13} className={`abv-filter-chevron ${isFilterDropdownOpen ? 'rotated' : ''}`} />
            </button>

            {isFilterDropdownOpen && (
              <div className="abv-filter-popover" style={{ minWidth: '260px' }}>
                <div className="abv-filter-popover-header">
                  <div className="abv-filter-popover-title">
                    <Filter size={13} />
                    <span>Filter Videos</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <button 
                      type="button" 
                      className="abv-filter-reset-btn"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSeries('all');
                        setSortBy('newest');
                      }}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                <div className="abv-filter-popover-body">
                  {/* Category Filter */}
                  <div className="abv-filter-field">
                    <label className="abv-filter-label">CATEGORY</label>
                    <select 
                      className="abv-popover-select"
                      value={selectedCategory} 
                      onChange={e => setSelectedCategory(e.target.value)}
                    >
                      {VIDEO_CATEGORIES_PRESET.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                      {dbCategories.map(c => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Series Filter */}
                  <div className="abv-filter-field">
                    <label className="abv-filter-label">SERIES</label>
                    <select 
                      className="abv-popover-select"
                      value={selectedSeries} 
                      onChange={e => setSelectedSeries(e.target.value)}
                    >
                      {VIDEO_SERIES_PRESET.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="abv-filter-field">
                    <label className="abv-filter-label">SORT ORDER</label>
                    <select 
                      className="abv-popover-select"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="views_desc">Most Viewed</option>
                      <option value="title_asc">Title (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Create New Video Button */}
          <button 
            type="button" 
            className="abv-create-article-btn"
            onClick={handleOpenCreate}
            title="Create New Video"
          >
            <Plus size={15} />
            <span>New Video</span>
          </button>
        </div>
      </div>

      {/* ── Content View: Loading, Empty, Grid or Table ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <RefreshCw className="animate-spin" size={32} color="#dc2626" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Loading Video Library...</h3>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.88rem' }}>Fetching video episodes from MongoDB.</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Tv size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>No Video Episodes Found</h3>
          <p style={{ margin: '6px 0 16px', color: '#64748b', fontSize: '0.88rem' }}>
            {search ? `No videos matching "${search}"` : 'Get started by creating your first video episode.'}
          </p>
          <button 
            type="button" 
            className="abv-btn-primary" 
            onClick={search ? () => setSearch('') : handleOpenCreate}
            style={{ margin: '0 auto' }}
          >
            <Plus size={15} />
            <span>{search ? 'Clear Search' : 'Add First Video'}</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid Cards View (16:9 Showcase Cards) ── */
        <div className="abv-video-cards-grid">
          {filteredVideos.map((v) => {
            const isPub = v.status !== 'draft' && v.enabled !== false;
            const thumbUrl = v.image || v.fallbackImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80';

            return (
              <div key={v._id || v.id} className="abv-video-card">
                {/* 16:9 Thumbnail Header */}
                <div className="abv-video-thumb-wrap" onClick={() => setPreviewVideo(v)}>
                  <img 
                    src={thumbUrl} 
                    alt={v.title} 
                    className="abv-video-thumb-img" 
                    loading="lazy"
                  />
                  <div className="abv-video-thumb-overlay">
                    <div className="abv-video-play-btn">
                      <Play size={20} fill="#ffffff" color="#ffffff" />
                    </div>
                  </div>

                  {/* Duration Pill */}
                  <div className="abv-video-duration-pill">
                    <Clock size={11} />
                    <span>{v.duration || '24:00'}</span>
                  </div>

                  {/* Status Toggle Badge */}
                  <button 
                    type="button"
                    className={`abv-video-status-pill ${isPub ? 'published' : 'draft'}`}
                    onClick={(e) => handleToggleStatus(v, e)}
                    title={`Click to switch to ${isPub ? 'Draft' : 'Published'}`}
                  >
                    {isPub ? 'Published' : 'Draft'}
                  </button>
                </div>

                {/* Card Body */}
                <div className="abv-video-card-body">
                  {/* Category & Series Badges */}
                  <div className="abv-video-tag-row">
                    <span className="abv-video-series-badge">{v.series || 'Founders Unfiltered'}</span>
                    <span className="abv-video-cat-badge">{v.categoryLabel || v.category || 'Interview'}</span>
                  </div>

                  {/* Title */}
                  <h3 
                    className="abv-video-card-title" 
                    title={v.title}
                    onClick={() => setPreviewVideo(v)}
                  >
                    {v.title}
                  </h3>

                  {/* Guest & Host Row */}
                  {(v.guest || v.host) && (
                    <div className="abv-video-guest-row">
                      <img 
                        src={v.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                        alt={v.guest || v.host} 
                        className="abv-video-guest-avatar" 
                      />
                      <div className="abv-video-guest-meta">
                        <div className="abv-video-guest-name">{v.guest || v.host}</div>
                        <div className="abv-video-guest-role">{v.guestRole || v.guestCompany || `Host: ${v.host}`}</div>
                      </div>
                    </div>
                  )}

                  {/* Card Meta Footer */}
                  <div className="abv-video-card-footer">
                    <div className="abv-video-stats">
                      <span title="Views">
                        <Eye size={13} />
                        {typeof v.views === 'number' ? `${Math.round(v.views / 1000)}K` : (v.views || '120K')}
                      </span>
                      <span title="Likes">
                        <ThumbsUp size={13} />
                        {v.likes || 42}
                      </span>
                    </div>

                    <div className="abv-video-actions">
                      <button 
                        type="button" 
                        className="abv-icon-btn play"
                        onClick={() => setPreviewVideo(v)}
                        title="Watch Episode"
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                      <button 
                        type="button" 
                        className="abv-icon-btn edit"
                        onClick={() => handleOpenEdit(v)}
                        title="Edit Video"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        type="button" 
                        className="abv-icon-btn delete"
                        onClick={() => setVideoToDelete(v)}
                        title="Delete Video"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table Mode ── */
        <div className="abv-video-table-wrap">
          <table className="abv-video-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Preview</th>
                <th>Episode Title & Series</th>
                <th>Category</th>
                <th>Guest / Host</th>
                <th>Views</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVideos.map((v) => {
                const isPub = v.status !== 'draft' && v.enabled !== false;
                const thumbUrl = v.image || v.fallbackImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80';

                return (
                  <tr key={v._id || v.id}>
                    <td>
                      <div className="abv-table-thumb-cell" onClick={() => setPreviewVideo(v)}>
                        <img src={thumbUrl} alt={v.title} className="abv-table-thumb-img" />
                        <span className="abv-table-duration">{v.duration || '24:00'}</span>
                        <div className="abv-table-play-icon">
                          <Play size={12} fill="#fff" color="#fff" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div 
                        className="abv-table-title" 
                        onClick={() => setPreviewVideo(v)} 
                        title={v.title}
                      >
                        {v.title}
                      </div>
                      <div className="abv-table-sub">
                        <span>{v.series || 'Founders Unfiltered'}</span>
                        <span style={{ margin: '0 4px' }}>•</span>
                        <code>/{v.slug || slugify(v.title)}</code>
                      </div>
                    </td>
                    <td>
                      <span className="abv-table-cat-pill">{v.categoryLabel || v.category || 'Interview'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={v.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'} 
                          alt="" 
                          style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.guest || v.host}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.guestCompany || v.guestRole || 'Speaker'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                        {typeof v.views === 'number' ? `${Math.round(v.views / 1000)}K` : (v.views || '120K')}
                      </span>
                    </td>
                    <td>
                      <button 
                        type="button"
                        className={`abv-video-status-pill ${isPub ? 'published' : 'draft'}`}
                        onClick={(e) => handleToggleStatus(v, e)}
                        title={`Click to switch to ${isPub ? 'Draft' : 'Published'}`}
                      >
                        {isPub ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="abv-icon-btn play"
                          onClick={() => setPreviewVideo(v)}
                          title="Watch Episode"
                        >
                          <Play size={14} fill="currentColor" />
                        </button>
                        <button 
                          type="button" 
                          className="abv-icon-btn edit"
                          onClick={() => handleOpenEdit(v)}
                          title="Edit Episode"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          type="button" 
                          className="abv-icon-btn delete"
                          onClick={() => setVideoToDelete(v)}
                          title="Delete Episode"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Video Player Modal ── */}
      {previewVideo && (
        <VideoPlayerModal 
          video={previewVideo} 
          onClose={() => setPreviewVideo(null)} 
          onSelectVideo={(other) => setPreviewVideo(other)}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {videoToDelete && (
        <div className="abv-modal-overlay" onClick={() => setVideoToDelete(null)}>
          <div className="abv-delete-dialog" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Delete Video Episode?</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>This action cannot be undone.</p>
              </div>
            </div>

            <p style={{ margin: '16px 0', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{videoToDelete.title}"</strong>? It will be permanently removed from MongoDB.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="abv-btn-cancel" 
                onClick={() => setVideoToDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="abv-btn-primary" 
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{ background: '#dc2626' }}
              >
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
