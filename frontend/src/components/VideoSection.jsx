import React, { useState, useEffect } from 'react';
import { Play, Tv, ArrowRight, Clock, Eye, Sparkles, X, User, Share2, Bookmark } from 'lucide-react';
import { VIDEO_EPISODES, getStoredVideos } from '../data/videoData';
import { VideoService } from '../services/videoService';
import VideoPlayerModal from './VideoPlayerModal';

export default function VideoSection({ onSelectVideo, onNavigateVideos, isSaved, onToggleSave }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState(() => getStoredVideos());

  useEffect(() => {
    VideoService.getVideos({ limit: 10 }).then(dbVideos => {
      if (Array.isArray(dbVideos) && dbVideos.length > 0) {
        setVideos(dbVideos);
      }
    }).catch(() => {});
  }, []);

  const heroVideo = videos.find(v => v.isFeatured) || videos[0] || VIDEO_EPISODES[0];
  const gridVideos = videos.filter(v => v._id !== heroVideo?._id && v.id !== heroVideo?.id).slice(0, 6);

  const handleWatch = (video) => {
    if (onSelectVideo) {
      onSelectVideo(video);
    } else {
      setSelectedVideo(video);
    }
  };

  const handleGoToVideosPage = () => {
    if (onNavigateVideos) {
      onNavigateVideos();
    } else {
      window.history.pushState(null, '', '/videos');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="section-wrapper vsec-landing-wrapper" id="video-shows">
      <div className="container">
        {/* Section Header Row */}
        <div className="vsec-header-row">
          <div className="vsec-header-title-box">
            <h2 className="vsec-section-title">Video Stories &amp; Masterclasses</h2>
          </div>

          <button 
            type="button" 
            className="vsec-explore-all-btn"
            onClick={handleGoToVideosPage}
            aria-label="View all video episodes"
          >
            <span>Explore All Videos</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Master Showcase Layout: Hero on Left/Top + Grid */}
        <div className="vsec-showcase-grid">
          {/* Big Featured Hero Video Card */}
          <div 
            className="vsec-hero-card"
            onClick={() => handleWatch(heroVideo)}
            role="button"
            tabIndex={0}
            aria-label={`Watch ${heroVideo.title}`}
          >
            <div className="vsec-hero-thumb-stage">
              <img 
                src={heroVideo.image} 
                alt={heroVideo.title} 
                className="vsec-hero-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = heroVideo.fallbackImage;
                }}
              />
              <div className="vsec-hero-gradient-overlay" />
              
              <div className="vsec-hero-floating-badges">
                <span className="vsec-premiere-pill">
                  <Sparkles size={12} />
                  <span>SEASON PREMIERE</span>
                </span>
                <span className="vsec-duration-pill">
                  <Clock size={12} />
                  <span>{heroVideo.duration}</span>
                </span>
                <button
                  type="button"
                  className={`vsec-hero-save-badge-btn ${isSaved && isSaved(heroVideo.id || heroVideo._id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleSave) onToggleSave(heroVideo);
                  }}
                  title={isSaved && isSaved(heroVideo.id || heroVideo._id) ? "Remove from bookmarks" : "Save video"}
                  aria-label="Save video"
                >
                  <Bookmark size={13} fill={isSaved && isSaved(heroVideo.id || heroVideo._id) ? '#ffffff' : 'none'} color="#ffffff" />
                  <span>{isSaved && isSaved(heroVideo.id || heroVideo._id) ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Pulsing Play Button */}
              <div className="vsec-hero-play-circle">
                <Play size={26} fill="#ffffff" color="#ffffff" style={{ marginLeft: '3px' }} />
              </div>
            </div>

            <div className="vsec-hero-info">
              <div className="vsec-hero-series-tag">{heroVideo.series}</div>
              <h3 className="vsec-hero-title">{heroVideo.title}</h3>
              <p className="vsec-hero-desc">{heroVideo.description}</p>
              
              <div className="vsec-hero-footer">
                <div className="vsec-guest-wrap">
                  <User size={13} />
                  <span><strong>{heroVideo.guest}</strong> ({heroVideo.guestRole})</span>
                </div>
                <div className="vsec-views-wrap">
                  <Eye size={13} />
                  <span>{heroVideo.views} views</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Card Supporting Video Grid */}
          <div className="vsec-sub-grid">
            {gridVideos.map((vid) => (
              <div 
                key={vid.id}
                className="vsec-card"
                onClick={() => handleWatch(vid)}
                role="button"
                tabIndex={0}
                aria-label={`Watch ${vid.title}`}
              >
                <div className="vsec-card-thumb-wrap">
                  <img 
                    src={vid.image} 
                    alt={vid.title} 
                    className="vsec-card-thumb"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = vid.fallbackImage;
                    }}
                  />
                  <div className="vsec-card-play-overlay">
                    <div className="vsec-card-play-btn">
                      <Play size={16} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                  <span className="vsec-card-duration">{vid.duration}</span>
                  <button
                    type="button"
                    className={`vsec-card-save-btn ${isSaved && isSaved(vid.id || vid._id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleSave) onToggleSave(vid);
                    }}
                    title={isSaved && isSaved(vid.id || vid._id) ? "Remove from saved bookmarks" : "Save video"}
                    aria-label="Save video"
                  >
                    <Bookmark size={13} fill={isSaved && isSaved(vid.id || vid._id) ? '#ffffff' : 'none'} color="#ffffff" />
                  </button>
                </div>

                <div className="vsec-card-body">
                  <div className="vsec-card-series">{vid.series}</div>
                  <h4 className="vsec-card-title">{vid.title}</h4>
                  
                  <div className="vsec-card-meta">
                    <span className="vsec-card-guest">{vid.guest}</span>
                    <span className="vsec-card-meta-dot">•</span>
                    <span className="vsec-card-views">{vid.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner Linking to Dedicated Videos Page */}
        <div className="vsec-bottom-strip">
          <div className="vsec-bottom-strip-text">
            <strong>Looking for deeptech keynotes and founder dialogues?</strong>
            <span>Browse our entire streaming catalog featuring over 24 original studio episodes and masterclasses.</span>
          </div>
          <button 
            type="button" 
            className="vsec-bottom-strip-btn"
            onClick={handleGoToVideosPage}
          >
            <span>Go to Videos Hub</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Ultra-Premium Cinema Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          onSelectVideo={(v) => setSelectedVideo(v)}
        />
      )}
    </section>
  );
}
