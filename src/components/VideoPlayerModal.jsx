import React, { useState, useEffect } from 'react';
import { 
  X, Play, Clock, Eye, Share2, Check, Bookmark, ThumbsUp, 
  Sparkles, MessageSquare, ListOrdered, FileText, User, 
  Maximize2, Minimize2, Lightbulb, Volume2, ArrowLeft, Send
} from 'lucide-react';
import { VIDEO_EPISODES } from '../data/videoData';
import './VideoPlayerModal.css';

export default function VideoPlayerModal({ video, onClose, onSelectVideo }) {
  const [currentVideo, setCurrentVideo] = useState(video);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'chapters' | 'transcript' | 'comments'
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(18400);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [isTheaterExpanded, setIsTheaterExpanded] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  
  // Interactive discussion comments
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      name: 'Aditya Mathur',
      role: 'Principal, Stellaris Venture Partners',
      time: '3 hours ago',
      text: 'The breakdown on domestic AI token economics vs Silicon Valley cloud margin models is by far the most lucid explanation in Indian tech media right now.',
      likes: 42
    },
    {
      id: 2,
      name: 'Rohit Shenoy',
      role: 'VP Engineering, Sarvam AI',
      time: '6 hours ago',
      text: 'Crucial point about megawatt power distribution and co-locating datacenters directly next to solar farms in southern India. Thermal management is where software meets hard reality.',
      likes: 29
    },
    {
      id: 3,
      name: 'Priya Sundaram',
      role: 'Founder, IndicFlow',
      time: '1 day ago',
      text: 'Krutrim’s approach to synthetic vernacular token generation solves the massive context drop typical of western foundation models on regional scripts.',
      likes: 18
    }
  ]);

  // Sync state if prop changes
  useEffect(() => {
    if (video) {
      setCurrentVideo(video);
      // Parse initial like count if available
      const rawLikes = parseInt(video.likes?.replace(/[^0-9]/g, '') || '18') * 1000;
      setLikeCount(rawLikes || 18400);
      setIsLiked(false);
      setSelectedChapter(null);
    }
  }, [video]);

  // ESC key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!currentVideo) return null;

  const handleSwitchVideo = (newVid) => {
    setCurrentVideo(newVid);
    if (onSelectVideo) onSelectVideo(newVid);
    window.history.replaceState(null, '', `/videos?id=${newVid.id}`);
    setSelectedChapter(null);
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/videos?id=${currentVideo.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newEntry = {
      id: Date.now(),
      name: 'Guest Operator',
      role: 'Tech Community Member',
      time: 'Just now',
      text: newComment.trim(),
      likes: 0
    };
    setComments([newEntry, ...comments]);
    setNewComment('');
  };

  // Find other episodes for the playlist queue
  const upNextVideos = VIDEO_EPISODES.filter(v => v.id !== currentVideo.id);

  return (
    <div className="cvp-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className={`cvp-cinema-stage ${isTheaterExpanded ? 'expanded' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <header className="cvp-top-header">
          <div className="cvp-header-left">
            <button 
              type="button" 
              className="cvp-back-btn" 
              onClick={onClose}
              title="Close Cinema Mode (Esc)"
            >
              <ArrowLeft size={16} />
              <span>Back to Shows</span>
            </button>
            <div className="cvp-header-divider" />
            <span className="cvp-series-pill">{currentVideo.series}</span>
            <span className="cvp-category-tag">{currentVideo.categoryLabel}</span>
          </div>

          <div className="cvp-header-right">
            {/* Theater Expand Toggle */}
            <button 
              type="button" 
              className={`cvp-header-action-btn ${isTheaterExpanded ? 'active' : ''}`}
              onClick={() => setIsTheaterExpanded(!isTheaterExpanded)}
              title={isTheaterExpanded ? "Standard Theater Mode" : "Expand Cinema View"}
            >
              {isTheaterExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isTheaterExpanded ? "Standard" : "Expand"}</span>
            </button>

            {/* Close Modal Button */}
            <button 
              type="button" 
              className="cvp-close-btn" 
              onClick={onClose}
              aria-label="Close cinema player"
            >
              <X size={18} />
              <span className="cvp-esc-hint">ESC</span>
            </button>
          </div>
        </header>

        {/* Video Player Cinema Viewport */}
        <div className="cvp-video-screen-wrapper">
          <div className="cvp-video-viewport">
            <iframe
              src={currentVideo.youtubeEmbedUrl || "https://www.youtube.com/embed/cKxRvEZd3Mw?autoplay=1&rel=0"}
              title={currentVideo.title}
              className="cvp-video-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        {/* Interactive Player Action Bar */}
        <div className="cvp-action-bar">
          <div className="cvp-action-left">
            <button 
              type="button" 
              className={`cvp-act-pill ${isLiked ? 'liked' : ''}`} 
              onClick={handleToggleLike}
            >
              <ThumbsUp size={15} fill={isLiked ? "var(--brand-primary)" : "none"} />
              <span>{(likeCount / 1000).toFixed(1)}K</span>
            </button>

            <button 
              type="button" 
              className={`cvp-act-pill ${isSaved ? 'saved' : ''}`} 
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark size={15} fill={isSaved ? "var(--brand-primary)" : "none"} />
              <span>{isSaved ? 'In Watchlist' : 'Watch Later'}</span>
            </button>

            <button 
              type="button" 
              className="cvp-act-pill" 
              onClick={handleShare}
            >
              {isCopied ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
              <span>{isCopied ? 'Link Copied!' : 'Share Show'}</span>
            </button>
          </div>

          <div className="cvp-action-right">
            <div className="cvp-meta-stat">
              <Eye size={14} />
              <span>{currentVideo.views} views</span>
            </div>
            <div className="cvp-meta-stat">
              <Clock size={14} />
              <span>{currentVideo.duration}</span>
            </div>
            <div className="cvp-meta-stat">
              <span>Published {currentVideo.publishedAt}</span>
            </div>
          </div>
        </div>

        {/* Two-Column Master Watch Experience */}
        <div className="cvp-content-grid">
          {/* Main Editorial & Interactive Column (Left ~68%) */}
          <div className="cvp-main-column">
            {/* Title & Host info */}
            <h1 className="cvp-episode-title">{currentVideo.title}</h1>

            {/* Guest Profile Card */}
            <div className="cvp-guest-card">
              <img 
                src={currentVideo.guestAvatar || currentVideo.image} 
                alt={currentVideo.guest} 
                className="cvp-guest-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = currentVideo.fallbackImage;
                }}
              />
              <div className="cvp-guest-info">
                <div className="cvp-guest-name-row">
                  <span className="cvp-guest-name">{currentVideo.guest}</span>
                  <span className="cvp-verified-badge" title="Verified Founder / Operator">
                    ✓ Verified
                  </span>
                </div>
                <div className="cvp-guest-role">
                  {currentVideo.guestRole} • <strong>{currentVideo.guestCompany}</strong>
                </div>
                <p className="cvp-guest-bio">
                  {currentVideo.guestBio || currentVideo.description}
                </p>
              </div>
            </div>

            {/* Tabbed Interactive Section */}
            <div className="cvp-tabs-bar">
              <button 
                type="button" 
                className={`cvp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Sparkles size={14} />
                <span>Overview &amp; Key Takeaways</span>
              </button>

              <button 
                type="button" 
                className={`cvp-tab-btn ${activeTab === 'chapters' ? 'active' : ''}`}
                onClick={() => setActiveTab('chapters')}
              >
                <ListOrdered size={14} />
                <span>Chapters &amp; Timestamps ({currentVideo.chapters?.length || 4})</span>
              </button>

              <button 
                type="button" 
                className={`cvp-tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
                onClick={() => setActiveTab('transcript')}
              >
                <FileText size={14} />
                <span>Dialogue Excerpts</span>
              </button>

              <button 
                type="button" 
                className={`cvp-tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                <MessageSquare size={14} />
                <span>Discussion ({comments.length})</span>
              </button>
            </div>

            {/* Tab Content Display */}
            <div className="cvp-tab-body">
              {/* Tab 1: Overview & Insights */}
              {activeTab === 'overview' && (
                <div className="cvp-overview-tab">
                  <p className="cvp-full-description">
                    {currentVideo.description}
                  </p>

                  {currentVideo.highlights && (
                    <div className="cvp-takeaways-box">
                      <div className="cvp-takeaways-header">
                        <Lightbulb size={16} color="var(--brand-primary)" />
                        <h4>Key Strategic Insights for Founders &amp; Operators</h4>
                      </div>
                      <div className="cvp-takeaways-list">
                        {currentVideo.highlights.map((item, idx) => (
                          <div key={idx} className="cvp-takeaway-item">
                            <span className="cvp-takeaway-num">{idx + 1}</span>
                            <span className="cvp-takeaway-text">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="cvp-production-credits">
                    <div className="cvp-credit-item">
                      <span className="cvp-credit-label">Host &amp; Lead Interviewer</span>
                      <span className="cvp-credit-val">{currentVideo.host}</span>
                    </div>
                    <div className="cvp-credit-item">
                      <span className="cvp-credit-label">Executive Production</span>
                      <span className="cvp-credit-val">GoReadPost Media Studios</span>
                    </div>
                    <div className="cvp-credit-item">
                      <span className="cvp-credit-label">Format &amp; Resolution</span>
                      <span className="cvp-credit-val">4K UHD Master • Dolby Spatial Mix</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Chapters & Timestamps */}
              {activeTab === 'chapters' && (
                <div className="cvp-chapters-tab">
                  <div className="cvp-chapters-list">
                    {(currentVideo.chapters || [
                      { time: '00:00', label: 'Opening Thesis & Vision', summary: 'Executive summary of the session.' },
                      { time: '08:15', label: 'Architecture Breakdown', summary: 'Detailed technical engineering architecture.' },
                      { time: '19:40', label: 'Market Dynamics & Unit Economics', summary: 'Capital and go-to-market trade-offs.' },
                      { time: '32:10', label: '2027 Strategic Outlook', summary: 'Long term ecosystem vision.' }
                    ]).map((chapter, idx) => (
                      <div 
                        key={idx} 
                        className={`cvp-chapter-row ${selectedChapter === idx ? 'selected' : ''}`}
                        onClick={() => setSelectedChapter(idx)}
                      >
                        <span className="cvp-chapter-time-pill">{chapter.time}</span>
                        <div className="cvp-chapter-info">
                          <strong className="cvp-chapter-title">{chapter.label}</strong>
                          <p className="cvp-chapter-summary">{chapter.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Transcript Excerpts */}
              {activeTab === 'transcript' && (
                <div className="cvp-transcript-tab">
                  <div className="cvp-transcript-list">
                    {(currentVideo.transcript || [
                      { speaker: currentVideo.host, time: '01:15', text: 'Welcome everyone. Today we are unpacking one of the most high-stakes founder missions across the tech ecosystem.' },
                      { speaker: currentVideo.guest, time: '02:40', text: 'When you take a multi-decade approach, you realize you cannot build on top of someone else’s foundation. You have to own the core infrastructure.' }
                    ]).map((t, idx) => (
                      <div key={idx} className="cvp-quote-bubble">
                        <div className="cvp-quote-speaker-bar">
                          <strong className="cvp-quote-speaker">{t.speaker}</strong>
                          <span className="cvp-quote-timestamp">{t.time}</span>
                        </div>
                        <p className="cvp-quote-text">"{t.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Founder Discussion & Community */}
              {activeTab === 'comments' && (
                <div className="cvp-comments-tab">
                  {/* Leave comment form */}
                  <form onSubmit={handleAddComment} className="cvp-comment-form">
                    <textarea 
                      rows={2}
                      className="cvp-comment-input"
                      placeholder="Add an operator takeaway or question for the editorial team..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="cvp-comment-btn-row">
                      <span className="cvp-comment-guideline">Operator discourse is moderated for high-signal insights</span>
                      <button type="submit" className="cvp-comment-submit-btn">
                        <Send size={13} />
                        <span>Post Comment</span>
                      </button>
                    </div>
                  </form>

                  {/* Comments list */}
                  <div className="cvp-comments-list">
                    {comments.map((c) => (
                      <div key={c.id} className="cvp-comment-card">
                        <div className="cvp-comment-avatar">
                          {c.name.charAt(0)}
                        </div>
                        <div className="cvp-comment-body">
                          <div className="cvp-comment-header">
                            <div>
                              <strong className="cvp-comment-name">{c.name}</strong>
                              <span className="cvp-comment-role">• {c.role}</span>
                            </div>
                            <span className="cvp-comment-time">{c.time}</span>
                          </div>
                          <p className="cvp-comment-text">{c.text}</p>
                          <div className="cvp-comment-footer">
                            <button type="button" className="cvp-comment-like-btn">
                              <ThumbsUp size={12} />
                              <span>{c.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Up Next & Playlist Queue (Right ~32%) */}
          <aside className="cvp-queue-column">
            <div className="cvp-queue-card">
              <div className="cvp-queue-header">
                <div className="cvp-queue-title-row">
                  <h3>Up Next in Series</h3>
                  <span className="cvp-queue-count">{upNextVideos.length} Episodes</span>
                </div>
                <div className="cvp-autoplay-row">
                  <span className="cvp-autoplay-label">Autoplay Next</span>
                  <label className="cvp-toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={autoplayNext} 
                      onChange={() => setAutoplayNext(!autoplayNext)} 
                    />
                    <span className="cvp-toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Playlist Item Cards */}
              <div className="cvp-queue-list">
                {upNextVideos.map((vid, idx) => (
                  <div 
                    key={vid.id}
                    className="cvp-queue-item"
                    onClick={() => handleSwitchVideo(vid)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="cvp-queue-thumb-wrap">
                      <img 
                        src={vid.image} 
                        alt={vid.title} 
                        className="cvp-queue-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = vid.fallbackImage;
                        }}
                      />
                      <span className="cvp-queue-duration">{vid.duration}</span>
                      <div className="cvp-queue-play-hover">
                        <Play size={16} fill="#fff" color="#fff" />
                      </div>
                    </div>

                    <div className="cvp-queue-details">
                      <span className="cvp-queue-series-tag">{vid.series}</span>
                      <h4 className="cvp-queue-item-title">{vid.title}</h4>
                      <div className="cvp-queue-meta">
                        <span>{vid.guest}</span>
                        <span>•</span>
                        <span>{vid.views} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
