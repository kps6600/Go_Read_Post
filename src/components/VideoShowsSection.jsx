import React, { useState } from 'react';
import { Tv, Play, X, User, Eye, Clock } from 'lucide-react';
import { VIDEO_SHOWS } from '../data/storiesData';

export default function VideoShowsSection() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <section className="section-wrapper" id="video-shows">
      <div className="container">
        <div className="section-header-row">
          <div className="section-title-box">
            <div className="section-icon-badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <Tv size={18} />
            </div>
            <div>
              <h2 className="section-title">GoReadPost Studio &amp; Shows</h2>
              <p className="section-subtitle">Founder interviews, industry masterclasses, and executive dialogues</p>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--brand-primary)' }}>
            Original Series
          </div>
        </div>

        <div className="videos-grid">
          {VIDEO_SHOWS.map((video) => (
            <div 
              key={video.id} 
              className="video-card"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="video-thumb-wrapper">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="video-thumb"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="play-button-overlay">
                  <Play size={20} fill="#ffffff" />
                </div>
                <span className="duration-badge">{video.duration}</span>
              </div>

              <div className="video-info">
                <div className="video-series-tag">{video.series}</div>
                <h4 className="video-title">{video.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={12} /> {video.host}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Eye size={12} /> {video.views}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div 
            className="reader-modal" 
            style={{ maxWidth: '800px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reader-header-bar">
              <div>
                <span className="reader-category">{selectedVideo.series}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{selectedVideo.title}</h3>
              </div>
              <button className="reader-close-btn" onClick={() => setSelectedVideo(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title={selectedVideo.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span><strong>Host:</strong> {selectedVideo.host}</span>
                <span>•</span>
                <span><strong>Guest:</strong> {selectedVideo.guest}</span>
                <span>•</span>
                <span><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />{selectedVideo.duration}</span>
              </div>

              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {selectedVideo.description || selectedVideo.seo?.description || (Array.isArray(selectedVideo.highlights) && selectedVideo.highlights[0]) || ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
