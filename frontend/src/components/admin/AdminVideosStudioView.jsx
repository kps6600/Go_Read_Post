import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Plus, Trash2, ArrowLeft, ArrowRight, Search, X, 
  Eye, Clock, Film, Tv, Flame, Heart, ChevronLeft, ChevronRight, User, ExternalLink
} from 'lucide-react';
import { VIDEO_EPISODES, VIDEO_CATEGORIES, getStoredVideos, saveStoredVideos } from '../../data/videoData';
import { VideoService } from '../../services/videoService';
import VideoPlayerModal from '../VideoPlayerModal';
import './AdminVideosStudioView.css';

export default function AdminVideosStudioView({ onShowToast, onNavigate, isStudioView = false }) {
  const [videos, setVideos] = useState(() => getStoredVideos());
  const [allCatalogVideos, setAllCatalogVideos] = useState(VIDEO_EPISODES);
  const [activeSeries, setActiveSeries] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(null);

  // Picker Modal State
  const [pickerModal, setPickerModal] = useState({ isOpen: false, targetIndex: null });
  const [pickerSearch, setPickerSearch] = useState('');

  // Load from backend service if available
  useEffect(() => {
    VideoService.getVideos().then(dbVideos => {
      if (Array.isArray(dbVideos) && dbVideos.length > 0) {
        setAllCatalogVideos(prev => {
          const map = new Map();
          [...dbVideos, ...prev].forEach(v => {
            const id = v.id || v._id;
            if (id && !map.has(id)) map.set(id, v);
          });
          return Array.from(map.values());
        });
      }
    }).catch(() => {});
  }, []);

  // Sync with storage changes
  useEffect(() => {
    const handleStorage = () => setVideos(getStoredVideos());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Listen to Top Bar "+ Add Card" event
  useEffect(() => {
    const handleOpenAddCard = () => {
      setPickerModal({ isOpen: true, targetIndex: null });
    };

    window.addEventListener('open:add-video-card', handleOpenAddCard);
    window.addEventListener('open:add-card', handleOpenAddCard);

    return () => {
      window.removeEventListener('open:add-video-card', handleOpenAddCard);
      window.removeEventListener('open:add-card', handleOpenAddCard);
    };
  }, []);

  // Top 4 spotlight episodes for the hero banner
  const spotlightVideos = useMemo(() => {
    return videos.slice(0, 4);
  }, [videos]);

  const activeSpotlight = spotlightVideos[spotlightIdx] || videos[0] || VIDEO_EPISODES[0];

  const handlePrevSpotlight = () => {
    setSpotlightIdx(prev => (prev - 1 + spotlightVideos.length) % spotlightVideos.length);
  };

  const handleNextSpotlight = () => {
    setSpotlightIdx(prev => (prev + 1) % spotlightVideos.length);
  };

  // Reorder video cards
  const handleMoveVideo = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= videos.length) return;
    const next = [...videos];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setVideos(next);
    saveStoredVideos(next);
  };

  // Delete video card
  const handleDeleteVideo = (idx) => {
    const next = videos.filter((_, i) => i !== idx);
    setVideos(next);
    saveStoredVideos(next);
    onShowToast?.('Removed video card from YS TV');
  };

  // Add or Replace from Picker
  const handleSelectFromPicker = (vid) => {
    if (pickerModal.targetIndex !== null && typeof pickerModal.targetIndex === 'number') {
      const next = [...videos];
      next[pickerModal.targetIndex] = vid;
      setVideos(next);
      saveStoredVideos(next);
      onShowToast?.(`Replaced card with "${vid.title.slice(0, 30)}..."`);
    } else {
      // Check if already in list
      const exists = videos.some(v => (v.id || v._id) === (vid.id || vid._id));
      if (exists) {
        // Bring to front
        const filtered = videos.filter(v => (v.id || v._id) !== (vid.id || vid._id));
        const next = [vid, ...filtered];
        setVideos(next);
        saveStoredVideos(next);
        onShowToast?.(`Moved "${vid.title.slice(0, 30)}..." to top of feed`);
      } else {
        const next = [vid, ...videos];
        setVideos(next);
        saveStoredVideos(next);
        onShowToast?.(`Added "${vid.title.slice(0, 30)}..." to YS TV`);
      }
    }
    setPickerModal({ isOpen: false, targetIndex: null });
    setPickerSearch('');
  };

  // Filtered videos for display in grid
  const filteredVideos = useMemo(() => {
    let list = videos;
    if (activeSeries !== 'all') {
      list = list.filter(v => {
        const cat = (v.category || '').toLowerCase();
        const ser = (v.series || '').toLowerCase();
        const target = activeSeries.toLowerCase();
        return cat === target || ser.includes(target) || target.includes(cat);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        (v.title && v.title.toLowerCase().includes(q)) ||
        (v.series && v.series.toLowerCase().includes(q)) ||
        (v.guest && v.guest.toLowerCase().includes(q)) ||
        (v.guestCompany && v.guestCompany.toLowerCase().includes(q)) ||
        (v.host && v.host.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [videos, activeSeries, searchQuery]);

  // Picker filtered list
  const availablePickerVideos = useMemo(() => {
    if (!pickerSearch.trim()) return allCatalogVideos;
    const q = pickerSearch.toLowerCase().trim();
    return allCatalogVideos.filter(v => 
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.series && v.series.toLowerCase().includes(q)) ||
      (v.guest && v.guest.toLowerCase().includes(q))
    );
  }, [allCatalogVideos, pickerSearch]);

  const activeCategoryObj = VIDEO_CATEGORIES.find(c => c.id === activeSeries) || VIDEO_CATEGORIES[0];

  return (
    <div className="avsv-container">
      {/* ── 1. Hero Spotlight Banner ── */}
      {activeSpotlight && (
        <section className="avsv-hero-wrapper">
          <div 
            className="avsv-hero-card"
            style={{ 
              backgroundImage: `url(${activeSpotlight.image || activeSpotlight.fallbackImage || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200'})` 
            }}
          >
            <div className="avsv-hero-overlay" />

            <div className="avsv-hero-content">
              <div>
                <div className="avsv-hero-top-badges">
                  <span className="avsv-hero-badge">
                    YS TV EXCLUSIVE
                  </span>
                  <span className="avsv-hero-series-badge">
                    {activeSpotlight.series || activeSpotlight.categoryLabel || 'Original Show'}
                  </span>
                </div>

                <h1 className="avsv-hero-headline">
                  {activeSpotlight.title}
                </h1>

                <p className="avsv-hero-subhead">
                  {activeSpotlight.description || activeSpotlight.guestBio || 'Curated executive masterclasses, venture playbooks, and high-stakes founder interviews.'}
                </p>
              </div>

              <div className="avsv-hero-footer">
                <div className="avsv-hero-author-cluster">
                  <img 
                    src={activeSpotlight.guestAvatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200'} 
                    alt={activeSpotlight.guest || 'Guest'}
                    className="avsv-hero-avatar"
                  />
                  <div>
                    <div className="avsv-hero-author-name">
                      {activeSpotlight.guest || 'Featured Leader'}
                    </div>
                    <div className="avsv-hero-author-meta">
                      <span>{activeSpotlight.guestCompany || activeSpotlight.guestRole || 'Executive Guest'}</span>
                      <span>•</span>
                      <Clock size={12} />
                      <span>{activeSpotlight.duration || '35:00'}</span>
                      <span>•</span>
                      <Eye size={12} />
                      <span>{activeSpotlight.views || '120K'} views</span>
                    </div>
                  </div>
                </div>

                <div className="avsv-hero-actions-cluster">
                  <button 
                    type="button" 
                    className="avsv-hero-cta"
                    onClick={() => setPlayingVideo(activeSpotlight)}
                  >
                    <Play size={16} fill="#ffffff" />
                    <span>Watch Episode</span>
                  </button>

                  {spotlightVideos.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="avsv-hero-nav-btn"
                        onClick={handlePrevSpotlight}
                        title="Previous Spotlight"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <span className="avsv-hero-counter">
                        {spotlightIdx + 1} / {spotlightVideos.length}
                      </span>

                      <button 
                        type="button" 
                        className="avsv-hero-nav-btn"
                        onClick={handleNextSpotlight}
                        title="Next Spotlight"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Series Navigation & Search Toolbar Card ── */}
      <section className="avsv-filter-toolbar">
        <div className="avsv-pills-row">
          {VIDEO_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`avsv-series-pill ${activeSeries === cat.id ? 'active' : ''}`}
              onClick={() => setActiveSeries(cat.id)}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="avsv-toolbar-bottom-row">
          <div className="avsv-search-box">
            <Search size={15} color="#94a3b8" />
            <input 
              type="text" 
              className="avsv-search-input"
              placeholder={`Search in ${activeSeries === 'all' ? 'all episodes' : activeCategoryObj.label}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="avsv-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="avsv-toolbar-meta">
            <span className="avsv-meta-dot" />
            <span>
              {searchQuery ? (
                <>Found <strong>{filteredVideos.length}</strong> matching episodes</>
              ) : (
                <>Viewing <strong>{activeSeries === 'all' ? 'All Episodes' : activeCategoryObj.label}</strong> &bull; {filteredVideos.length} {filteredVideos.length === 1 ? 'curated episode' : 'curated episodes'}</>
              )}
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. Editorial 4-Column Video Cards Grid ── */}
      {filteredVideos.length === 0 ? (
        <div style={{
          padding: '4rem 1rem',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px dashed #cbd5e1'
        }}>
          <Film size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a' }}>No video episodes found in this series</h3>
          <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.9rem' }}>
            Add episodes from the catalog to curate this vertical.
          </p>
          <button
            type="button"
            className="avsv-picker-add-btn"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            onClick={() => setPickerModal({ isOpen: true, targetIndex: null })}
          >
            <Plus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            <span>Add Video Episode</span>
          </button>
        </div>
      ) : (
        <div className="avsv-editorial-4col-grid">
          {filteredVideos.map((vid, idx) => {
            const masterIdx = videos.findIndex(v => (v.id || v._id) === (vid.id || vid._id));
            const targetIdx = masterIdx >= 0 ? masterIdx : idx;

            return (
              <div key={vid.id || idx} className="avsv-video-card">
                {/* Top Admin Control Bar */}
                <div className="avsv-card-admin-bar">
                  <div className={`avsv-rank-badge ${idx < 3 ? 'top-rank' : ''}`}>
                    <span>#{idx + 1}</span>
                  </div>

                  <div className="avsv-card-btn-group">
                    <button
                      type="button"
                      className="avsv-action-icon-btn"
                      onClick={() => handleMoveVideo(targetIdx, 'up')}
                      disabled={targetIdx === 0}
                      title="Move Earlier"
                    >
                      <ArrowLeft size={12} />
                    </button>

                    <button
                      type="button"
                      className="avsv-action-icon-btn"
                      onClick={() => handleMoveVideo(targetIdx, 'down')}
                      disabled={targetIdx >= videos.length - 1}
                      title="Move Later"
                    >
                      <ArrowRight size={12} />
                    </button>

                    <button
                      type="button"
                      className="avsv-action-icon-btn danger"
                      onClick={() => handleDeleteVideo(targetIdx)}
                      title="Remove from feed"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* 16:9 Thumbnail with Overlay & Duration */}
                <div 
                  className="avsv-thumb-wrap"
                  onClick={() => setPlayingVideo(vid)}
                  title="Click to preview video"
                >
                  <img 
                    src={vid.image || vid.fallbackImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
                    alt={vid.title} 
                    className="avsv-thumb-img"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'; }}
                  />
                  <div className="avsv-duration-badge">
                    {vid.duration || '30:00'}
                  </div>
                  <div className="avsv-play-overlay">
                    <div className="avsv-play-circle">
                      <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                </div>

                {/* Card Interior */}
                <div className="avsv-card-body">
                  <div>
                    <div className="avsv-card-series">
                      {vid.series || vid.categoryLabel || 'Original Show'}
                    </div>

                    <h3 className="avsv-card-title" title={vid.title}>
                      {vid.title}
                    </h3>

                    {vid.guest && (
                      <div className="avsv-card-guest-row">
                        <img 
                          src={vid.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'} 
                          alt="" 
                          className="avsv-card-guest-avatar"
                        />
                        <span className="avsv-card-guest-name">
                          {vid.guest} {vid.guestCompany ? `• ${vid.guestCompany}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="avsv-card-meta-footer">
                    <span>{vid.publishedAt || 'Recent'}</span>
                    <span>{vid.views || '120K'} views</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Add Video Episode Picker Modal ── */}
      {pickerModal.isOpen && (
        <div className="avsv-modal-backdrop" onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}>
          <div className="avsv-modal-card" onClick={e => e.stopPropagation()}>
            <div className="avsv-modal-header">
              <span className="avsv-modal-title">
                {pickerModal.targetIndex !== null ? 'Replace Video Card' : 'Add Video Episode to YS TV'}
              </span>
              <button 
                type="button" 
                className="avsv-modal-close-btn"
                onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}
              >
                <X size={18} />
              </button>
            </div>

            <div className="avsv-modal-body">
              <div className="avsv-picker-search">
                <Search size={16} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search episodes by title, series, or guest..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="avsv-search-input"
                  autoFocus
                />
              </div>

              <div>
                {availablePickerVideos.map(vid => (
                  <div key={vid.id} className="avsv-picker-item">
                    <img 
                      src={vid.image || vid.fallbackImage} 
                      alt="" 
                      className="avsv-picker-thumb"
                    />
                    <div className="avsv-picker-info">
                      <div className="avsv-picker-title">{vid.title}</div>
                      <div className="avsv-picker-sub">
                        {vid.series} &bull; {vid.guest || vid.host} &bull; {vid.duration}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="avsv-picker-add-btn"
                      onClick={() => handleSelectFromPicker(vid)}
                    >
                      {pickerModal.targetIndex !== null ? 'Replace' : 'Add Card'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Video Player Modal Preview ── */}
      {playingVideo && (
        <VideoPlayerModal 
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          onSelectVideo={vid => setPlayingVideo(vid)}
        />
      )}
    </div>
  );
}

