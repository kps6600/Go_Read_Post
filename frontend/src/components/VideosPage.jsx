import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Tv, ArrowLeft, Eye, Clock, Share2, Sparkles, X, 
  Search, Check, User, ChevronRight, ChevronLeft, ThumbsUp, Flame, Radio,
  Filter, SlidersHorizontal, ChevronDown, Bookmark
} from 'lucide-react';
import { VIDEO_EPISODES, VIDEO_CATEGORIES, getStoredVideos } from '../data/videoData';
import { VideoService } from '../services/videoService';
import VideoPlayerModal from './VideoPlayerModal';
import './VideosPage.css';

export default function VideosPage({ onBackToHome, onSelectVideo, isSaved, onToggleSave }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [allVideos, setAllVideos] = useState(() => getStoredVideos());
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    VideoService.getVideos().then(dbVideos => {
      if (Array.isArray(dbVideos) && dbVideos.length > 0) {
        setAllVideos(dbVideos);
      }
    }).catch(() => {});

    const handleUpdate = () => setAllVideos(getStoredVideos());
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  // Top 4 hero spotlight videos
  const spotlightVideos = useMemo(() => {
    return allVideos.slice(0, 4);
  }, [allVideos]);

  // Automatic hero slider (every 4.5 seconds, pauses when user hovers over the card)
  useEffect(() => {
    if (!spotlightVideos || spotlightVideos.length <= 1 || isHeroHovered) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % spotlightVideos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [spotlightVideos, isHeroHovered]);

  const heroVideo = spotlightVideos[heroIndex] || allVideos[0] || VIDEO_EPISODES[0];

  // Auto-open video if ID or v query param exists in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get('id') || params.get('v');
      if (videoId && videoId !== 'undefined' && videoId !== 'null') {
        const found = allVideos.find(v => String(v.id) === String(videoId) || String(v._id) === String(videoId) || String(v.slug) === String(videoId));
        if (found) {
          handlePlayVideo(found);
        }
      }
    } catch (e) {}
  }, [allVideos]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allVideos.length };
    allVideos.forEach(v => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [allVideos]);

  const activeCategoryObj = useMemo(() => {
    return VIDEO_CATEGORIES.find(c => c.id === activeCategory) || VIDEO_CATEGORIES[0];
  }, [activeCategory]);

  // Filter videos by category and search keyword
  const filteredVideos = useMemo(() => {
    return allVideos.filter(vid => {
      // Category filter
      if (activeCategory !== 'all' && vid.category !== activeCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (vid.title || '').toLowerCase().includes(q);
        const matchGuest = (vid.guest || '').toLowerCase().includes(q);
        const matchSeries = (vid.series || '').toLowerCase().includes(q);
        const matchDesc = (vid.description || '').toLowerCase().includes(q);
        const matchCompany = (vid.guestCompany || '').toLowerCase().includes(q);
        if (!matchTitle && !matchGuest && !matchSeries && !matchDesc && !matchCompany) return false;
      }
      return true;
    });
  }, [allVideos, activeCategory, searchQuery]);

  const handlePlayVideo = (vid) => {
    if (!vid) return;
    const vId = vid.id || vid._id || vid.slug;
    try {
      if (vId) {
        window.history.replaceState(null, '', `/videos?id=${encodeURIComponent(vId)}`);
      }
    } catch (e) {}
    if (onSelectVideo) {
      onSelectVideo(vid);
    } else {
      setPlayingVideo(vid);
    }
  };

  const handleShareVideo = (e, vid) => {
    e.stopPropagation();
    if (!vid) return;
    const vId = vid.id || vid._id || vid.slug;
    const shareUrl = vId ? `${window.location.origin}/videos?id=${encodeURIComponent(vId)}` : window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(vId || 'copied');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="vpage-container">
      {/* Featured Big Stage Cinema Banner */}
      <section className="vpage-hero-cinema">
        <div 
          className="vpage-stage-card"
          onClick={() => handlePlayVideo(heroVideo)}
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          role="button"
          tabIndex={0}
          aria-label={`Watch ${heroVideo.title}`}
        >
          {/* Previous / Next slide buttons on hover */}
          {spotlightVideos.length > 1 && (
            <>
              <button
                type="button"
                className="vpage-stage-arrow-btn prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroIndex((prev) => (prev - 1 + spotlightVideos.length) % spotlightVideos.length);
                }}
                aria-label="Previous Spotlight"
                title="Previous episode"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="vpage-stage-arrow-btn next"
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroIndex((prev) => (prev + 1) % spotlightVideos.length);
                }}
                aria-label="Next Spotlight"
                title="Next episode"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <img 
            key={heroVideo.id}
            src={heroVideo.image} 
            alt={heroVideo.title} 
            className="vpage-stage-bg" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = heroVideo.fallbackImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="vpage-stage-overlay">
            <h1 className="vpage-stage-title">{heroVideo.title}</h1>
            
            <div className="vpage-stage-meta">
              <span className="vpage-stage-guest">
                <User size={13} style={{ display: 'inline', marginRight: '5px' }} />
                {heroVideo.guest} {heroVideo.guestCompany ? `• ${heroVideo.guestCompany}` : ''}
              </span>
              <span className="vpage-meta-dot">•</span>
              <span><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />{heroVideo.duration}</span>
              <span className="vpage-meta-dot">•</span>
              <span><Eye size={13} style={{ display: 'inline', marginRight: '4px' }} />{heroVideo.views} views</span>
            </div>

            <div className="vpage-stage-btn-row">
              <div className="vpage-stage-cta-group">
                <button 
                  type="button" 
                  className="vpage-play-hero-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVideo(heroVideo);
                  }}
                >
                  <Play size={18} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                  <span>Watch Episode Now</span>
                </button>

                <button 
                  type="button" 
                  className={`vpage-save-hero-btn ${isSaved && isSaved(heroVideo.id || heroVideo._id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleSave) onToggleSave(heroVideo);
                  }}
                  title={isSaved && isSaved(heroVideo.id || heroVideo._id) ? "Remove from bookmarks" : "Save video"}
                >
                  <Bookmark size={16} fill={isSaved && isSaved(heroVideo.id || heroVideo._id) ? 'currentColor' : 'none'} />
                  <span>{isSaved && isSaved(heroVideo.id || heroVideo._id) ? 'Saved' : 'Save'}</span>
                </button>

                <button 
                  type="button" 
                  className="vpage-share-hero-btn"
                  onClick={(e) => handleShareVideo(e, heroVideo)}
                  title="Copy share link"
                >
                  {copiedId === heroVideo.id ? <Check size={16} color="#34d399" /> : <Share2 size={16} />}
                  <span>{copiedId === heroVideo.id ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>

              {/* Auto sliding indicator dots without text */}
              <div className="vpage-spotlight-tabs" onClick={(e) => e.stopPropagation()}>
                {spotlightVideos.map((vid, idx) => (
                  <button
                    key={vid.id}
                    type="button"
                    className={`vpage-spotlight-dot ${heroIndex === idx ? 'active' : ''}`}
                    onClick={() => setHeroIndex(idx)}
                    title={vid.title}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User-Friendly Filter & Search Omnibar */}
      <section className="vpage-filter-section">
        <div className="vpage-omnibar">
          {/* Search Box (Expanded Size) */}
          <div className="vpage-search-box">
            <Search size={20} className="vpage-search-icon" />
            <input 
              type="text" 
              className="vpage-search-input"
              placeholder="Search episodes, guests, series, founders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="vpage-search-clear" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Button & Dropdown (Right Side) */}
          <div className="vpage-filter-dropdown-container" ref={filterDropdownRef}>
            <button
              type="button"
              className={`vpage-filter-btn ${activeCategory !== 'all' ? 'active' : ''} ${isFilterOpen ? 'open' : ''}`}
              onClick={() => setIsFilterOpen(prev => !prev)}
              aria-expanded={isFilterOpen}
              aria-label="Filter episodes by series"
            >
              <SlidersHorizontal size={17} className="vpage-filter-btn-icon" />
              <span className="vpage-filter-btn-label">
                {activeCategory === 'all' ? 'Filter by Series' : activeCategoryObj.label}
              </span>
              <span className="vpage-filter-btn-badge">
                {categoryCounts[activeCategory] || 0}
              </span>
              <ChevronDown size={15} className={`vpage-filter-btn-chevron ${isFilterOpen ? 'rotated' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="vpage-filter-dropdown-menu">
                <div className="vpage-filter-dropdown-header">
                  <span className="vpage-filter-dropdown-title">Filter by Series</span>
                  {activeCategory !== 'all' && (
                    <button 
                      type="button" 
                      className="vpage-filter-reset-link"
                      onClick={() => {
                        setActiveCategory('all');
                        setIsFilterOpen(false);
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="vpage-filter-options-list">
                  {VIDEO_CATEGORIES.map(cat => {
                    const count = categoryCounts[cat.id] || 0;
                    const isSelected = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`vpage-filter-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsFilterOpen(false);
                        }}
                      >
                        <div className="vpage-option-left">
                          <span className={`vpage-option-radio ${isSelected ? 'selected' : ''}`}>
                            {isSelected && <span className="vpage-option-radio-dot" />}
                          </span>
                          <span className="vpage-option-label">{cat.label}</span>
                        </div>
                        <span className={`vpage-option-count ${count > 0 ? 'has-items' : 'zero'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Chips & Feedback Bar */}
        {(activeCategory !== 'all' || searchQuery.trim()) && (
          <div className="vpage-active-filters-bar">
            <div className="vpage-active-chips">
              {activeCategory !== 'all' && (
                <div className="vpage-active-chip">
                  <span>Series: <strong>{activeCategoryObj.label}</strong></span>
                  <button 
                    type="button" 
                    onClick={() => setActiveCategory('all')} 
                    title="Remove series filter"
                    aria-label="Remove series filter"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {searchQuery.trim() && (
                <div className="vpage-active-chip">
                  <span>Keyword: "<strong>{searchQuery}</strong>"</span>
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')} 
                    title="Remove keyword filter"
                    aria-label="Remove keyword filter"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="vpage-results-meta">
              <span>Showing <strong>{filteredVideos.length}</strong> episode{filteredVideos.length === 1 ? '' : 's'}</span>
              <button 
                type="button"
                className="vpage-reset-all-btn"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset All
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Video Episodes Grid */}
      <section className="vpage-grid-section">
        {filteredVideos.length > 0 ? (
          <div className="vpage-video-grid">
            {filteredVideos.map(vid => (
              <article 
                key={vid.id} 
                className="vpage-card"
                onClick={() => handlePlayVideo(vid)}
                role="button"
                tabIndex={0}
                aria-label={`Watch ${vid.title}`}
              >
                <div className="vpage-thumb-stage">
                  <img 
                    src={vid.image} 
                    alt={vid.title} 
                    className="vpage-thumb-img" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = vid.fallbackImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="vpage-thumb-play-overlay">
                    <div className="vpage-thumb-play-circle">
                      <Play size={20} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                  <span className="vpage-thumb-duration">{vid.duration}</span>
                  <button 
                    type="button" 
                    className={`vpage-card-save-btn ${isSaved && isSaved(vid.id || vid._id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleSave) onToggleSave(vid);
                    }}
                    title={isSaved && isSaved(vid.id || vid._id) ? "Remove from saved bookmarks" : "Save video"}
                    aria-label="Save video"
                  >
                    <Bookmark size={14} fill={isSaved && isSaved(vid.id || vid._id) ? '#ffffff' : 'none'} color="#ffffff" />
                  </button>
                </div>

                <div className="vpage-card-content">
                  <div className="vpage-card-top-row">
                    <span className="vpage-series-tag">{vid.series}</span>
                    <div className="vpage-card-actions-group">
                      <button 
                        type="button" 
                        className="vpage-card-share-btn"
                        onClick={(e) => handleShareVideo(e, vid)}
                        title="Share episode link"
                        aria-label="Share episode"
                      >
                        {copiedId === vid.id ? <Check size={14} color="#34d399" /> : <Share2 size={14} />}
                      </button>
                    </div>
                  </div>

                  <h3 className="vpage-card-title">{vid.title}</h3>

                  <div className="vpage-card-footer">
                    <div className="vpage-card-guest">
                      <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      <span>{vid.guest}</span>
                    </div>
                    <div className="vpage-card-views">
                      <Eye size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      <span>{vid.views}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="vpage-empty-state">
            <Tv size={42} color="#dc2626" style={{ margin: '0 auto' }} />
            <h3>No video episodes match your criteria</h3>
            <p>Try searching for a different founder name, company, topic or reset your filters.</p>
            <button 
              type="button" 
              className="vpage-btn-reset"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Ultra-Premium Cinema Video Player Modal */}
      {playingVideo && (
        <VideoPlayerModal 
          video={playingVideo} 
          onClose={() => {
            setPlayingVideo(null);
            try {
              window.history.replaceState(null, '', '/videos');
            } catch (e) {}
          }} 
          onSelectVideo={(v) => handlePlayVideo(v)}
        />
      )}
    </div>
  );
}
