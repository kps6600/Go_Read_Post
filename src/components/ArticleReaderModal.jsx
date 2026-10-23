import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Bookmark, Share2, Volume2, Play, Pause, 
  MessageSquare, ThumbsUp, Send, Copy, Sparkles,
  Clock, Check, Headphones, Heart, ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ArticleReaderModal({
  story,
  onClose,
  isSaved,
  onToggleSave,
  onShowToast,
  onClapStory
}) {
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [claps, setClaps] = useState(story?.claps || 120);
  const [hasClapped, setHasClapped] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const modalScrollRef = useRef(null);

  // Comments state
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Arjun Nambiar",
      role: "VP Engineering @ SaaS Labs",
      time: "25 mins ago",
      text: "This captures the operational reality on the ground so well. Pure foundational LLMs are commoditizing; the real enterprise moat is in vertical integrations and verifiable agent safety.",
      likes: 12
    },
    {
      id: 2,
      author: "Pooja Hegde",
      role: "Founder, BharatGreen",
      time: "1 hour ago",
      text: "The point about unit economics over growth-at-all-costs is so true. We need more reporting that honors disciplined, profitable builders rather than paper valuations.",
      likes: 8
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Audio timer simulation
  useEffect(() => {
    let interval;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + (1.2 * audioSpeed);
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, audioSpeed]);

  // Track scroll inside reader modal
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight > clientHeight) {
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  // Handle Claps with confetti celebration
  const handleClap = () => {
    setClaps(prev => prev + 1);
    setHasClapped(true);
    if (onClapStory) onClapStory(story.id);

    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.8 },
      colors: ['#ea580c', '#f97316', '#fb923c', '#dc2626', '#38bdf8']
    });
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = {
      id: Date.now(),
      author: newAuthor.trim() || "Guest Reader",
      role: "GoReadPost Community Member",
      time: "Just now",
      text: newComment.trim(),
      likes: 0
    };

    setComments([added, ...comments]);
    setNewComment('');
    if (onShowToast) onShowToast("Comment posted to the conversation!");
  };

  const handleLikeComment = (commentId) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likes: isLiked ? (c.likes || 0) + 1 : Math.max(0, (c.likes || 1) - 1)
        };
      }
      return c;
    }));
  };

  const copyStoryLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    if (onShowToast) onShowToast("Article link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    setAudioProgress(newProgress);
  };

  if (!story) return null;

  const saved = isSaved && isSaved(story.id);

  // Labels & Metadata extraction
  const categoryLabel = story.categoryLabel || story.categoryTag || story.tag || story.brand || 'EDITORIAL';
  const brandName = story.brand || 'GoReadPost';
  const readDuration = story.readTime || '4 MIN READ';
  const authorName = story.author?.name || (story.brand ? `${story.brand} Editorial Desk` : "GoReadPost Editorial Team");
  const authorTitle = story.author?.title || "Senior Intelligence Desk";
  const authorAvatar = story.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80";
  const publishedDate = story.publishedAt || "Today";

  // Story paragraphs resolver
  const paragraphs = Array.isArray(story.content) && story.content.length > 0
    ? story.content
    : typeof story.content === 'string'
      ? story.content.split('\n\n').filter(Boolean)
      : [
          story.summary || story.title,
          "Market participants and ecosystem analysts point to a strategic structural transition across modern digital infrastructure. Rapid modernization, disciplined unit economics, and customer-first execution continue to separate enduring industry leaders from transitional operators.",
          "As foundational paradigms mature, enterprises are prioritizing tangible operational velocity, automated workflow orchestration, and resilient architecture designed for sustained long-term scale."
        ];

  // Highlights extraction
  const highlights = [
    paragraphs[0]?.slice(0, 140) + "...",
    "Strategic reallocation of capital and infrastructure toward high-leverage workflows.",
    "Comprehensive validation across cross-functional leadership, ecosystem partners, and operational benchmarks."
  ];

  return (
    <div className="modal-overlay reader-modal-backdrop" onClick={onClose}>
      <div 
        className="reader-modal modern-reader-modal" 
        onClick={(e) => e.stopPropagation()}
        ref={modalScrollRef}
        onScroll={handleScroll}
      >
        {/* Top Reading Progress Bar */}
        <div className="reader-top-progress-bar" style={{ width: `${scrollProgress}%` }} />

        {/* Sticky Header Bar with Premium Controls */}
        <header className="reader-header-bar modern-reader-header">
          <div className="reader-header-left">
            <span className="reader-brand-pill">
              <span className="reader-brand-dot" />
              {brandName}
            </span>
            <span className="reader-sep-dot">•</span>
            <span className="reader-category-pill">{categoryLabel}</span>
            <span className="reader-sep-dot">•</span>
            <span className="reader-time-badge">
              <Clock size={12} />
              {readDuration}
            </span>
          </div>

          <div className="reader-header-actions">
            {/* Quick Audio Pill Button */}
            <button 
              className={`reader-audio-pill-btn ${isPlayingAudio ? 'active' : ''}`}
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              title={isPlayingAudio ? "Pause Audio Narration" : "Listen to Story"}
            >
              <Headphones size={13} />
              <span>{isPlayingAudio ? 'Playing' : 'Listen'}</span>
              {isPlayingAudio && (
                <span className="audio-mini-bars">
                  <span className="bar bar-1" />
                  <span className="bar bar-2" />
                  <span className="bar bar-3" />
                </span>
              )}
            </button>

            {/* Font Size Adjuster Segmented Control */}
            <div className="reader-font-controls" title="Adjust text size">
              <button 
                type="button"
                onClick={() => setFontSize('small')} 
                className={`font-btn ${fontSize === 'small' ? 'active' : ''}`}
              >
                A-
              </button>
              <button 
                type="button"
                onClick={() => setFontSize('medium')} 
                className={`font-btn ${fontSize === 'medium' ? 'active' : ''}`}
              >
                A
              </button>
              <button 
                type="button"
                onClick={() => setFontSize('large')} 
                className={`font-btn ${fontSize === 'large' ? 'active' : ''}`}
              >
                A+
              </button>
            </div>

            {/* Bookmark Action */}
            <button 
              type="button"
              className={`reader-icon-action ${saved ? 'saved' : ''}`}
              onClick={() => onToggleSave(story)}
              title={saved ? "Saved in bookmarks" : "Save article"}
            >
              <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            </button>

            {/* Share Trigger & Dropdown */}
            <div className="reader-share-wrap">
              <button 
                type="button"
                className="reader-icon-action"
                onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                title="Share article"
              >
                <Share2 size={15} />
              </button>

              {shareDropdownOpen && (
                <div className="reader-share-dropdown">
                  <button 
                    type="button"
                    onClick={copyStoryLink}
                    className="share-drop-item"
                  >
                    {copiedLink ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(story.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="share-drop-item"
                    onClick={() => setShareDropdownOpen(false)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Share on X</span>
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="share-drop-item"
                    onClick={() => setShareDropdownOpen(false)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.5 1.5 0 1 0-.01-3 1.5 1.5 0 0 0 .01 3m1.37 9.74v-8.37H5.1v8.37h2.73z"/>
                    </svg>
                    <span>Share on LinkedIn</span>
                  </a>
                </div>
              )}
            </div>

            {/* Circular Close Button */}
            <button 
              type="button"
              className="reader-close-btn modern-close" 
              onClick={onClose}
              title="Close modal (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {/* Reader Body Content */}
        <div className="reader-body modern-reader-body">
          
          {/* Eyebrow Label */}
          <div className="reader-eyebrow-row">
            <span className="reader-topic-badge">{categoryLabel}</span>
            <span className="reader-pub-date">Published {publishedDate}</span>
          </div>

          {/* Headline */}
          <h1 className="reader-headline modern-headline">{story.title}</h1>

          {/* Subtitle / Dek */}
          {(story.subtitle || story.summary) && (
            <p className="reader-subtitle modern-subtitle">
              {story.subtitle || story.summary}
            </p>
          )}

          {/* Author & Claps Card */}
          <div className="reader-author-bar modern-author-bar">
            <div className="reader-author-profile">
              <div className="reader-avatar-wrap">
                <img 
                  src={authorAvatar} 
                  alt={authorName}
                  className="reader-avatar-img"
                />
                <span className="reader-avatar-verified" title="Verified Author">✓</span>
              </div>
              <div>
                <div className="reader-author-name">{authorName}</div>
                <div className="reader-author-meta">{authorTitle} • {readDuration}</div>
              </div>
            </div>

            {/* Interactive Claps Pill */}
            <button 
              type="button"
              onClick={handleClap}
              className={`reader-clap-btn ${hasClapped ? 'has-clapped' : ''}`}
              title="Clap to appreciate this story"
            >
              <span className="clap-emoji">👏</span>
              <span className="clap-count">{claps} Claps</span>
            </button>
          </div>

          {/* Hero Image Box */}
          <div className="reader-hero-wrapper">
            <img 
              src={story.image} 
              alt={story.title}
              className="reader-hero-img modern-hero-img"
              onError={(e) => {
                e.target.onerror = null;
                if (story.fallbackImage) e.target.src = story.fallbackImage;
              }}
            />
            <div className="reader-img-caption">
              <span>Photo: Editorial Coverage • GoReadPost Exclusive</span>
              <span className="caption-badge">Verified Analysis</span>
            </div>
          </div>

          {/* Audio Player Card (Apple Podcasts / Spotify Style) */}
          <div className="reader-audio-player modern-audio-player">
            <button 
              type="button"
              className="audio-play-btn modern-audio-btn"
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              title={isPlayingAudio ? "Pause Narration" : "Listen to Story"}
            >
              {isPlayingAudio ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
            </button>

            <div className="audio-player-center">
              <div className="audio-info-row">
                <span className="audio-label">
                  <Volume2 size={13} className="audio-speaker-icon" />
                  <strong>Audio Edition</strong>
                  <span className="audio-subtext">(AI Voice Narration)</span>
                </span>
                <span className="audio-percentage">{Math.round(audioProgress)}%</span>
              </div>
              <div 
                className="audio-progress-bar modern-scrubber"
                onClick={handleScrubberClick}
                title="Click to seek narration"
              >
                <div className="audio-progress-fill" style={{ width: `${audioProgress}%` }}>
                  <span className="audio-scrub-thumb" />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setAudioSpeed(prev => prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : prev === 1.5 ? 2 : 1)}
              className="audio-speed-btn"
              title="Change Narration Speed"
            >
              {audioSpeed}x
            </button>
          </div>

          {/* Key Takeaways / Executive Summary Box */}
          <div className="reader-takeaways-card">
            <div className="takeaways-header">
              <Sparkles size={16} className="takeaways-icon" />
              <span>Key Highlights &amp; Insights</span>
            </div>
            <ul className="takeaways-list">
              {highlights.map((point, idx) => (
                <li key={idx}>
                  <ChevronRight size={13} className="takeaway-bullet-icon" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Prose Content */}
          <div className={`reader-prose modern-prose font-size-${fontSize}`}>
            {paragraphs.map((para, idx) => (
              <p key={idx} className={idx === 0 ? 'first-paragraph' : ''}>
                {para}
              </p>
            ))}
          </div>

          {/* Tags Cloud */}
          {story.tags && story.tags.length > 0 && (
            <div className="reader-tags-cloud">
              {story.tags.map((tag, idx) => (
                <span key={idx} className="reader-tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Article End Engagement Bar */}
          <div className="reader-end-actions-card">
            <div className="end-actions-text">
              <h4>Enjoyed this report?</h4>
              <p>Applaud this story or bookmark it to your personal library.</p>
            </div>
            <div className="end-actions-buttons">
              <button 
                type="button"
                onClick={handleClap}
                className="end-clap-btn"
              >
                <span>👏 {claps}</span>
              </button>
              <button 
                type="button"
                onClick={() => onToggleSave(story)}
                className={`end-save-btn ${saved ? 'saved' : ''}`}
              >
                <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                <span>{saved ? 'Saved' : 'Save Story'}</span>
              </button>
              <button 
                type="button"
                onClick={copyStoryLink}
                className="end-share-btn"
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Reader Discussion / Comments Section */}
          <div className="comments-section modern-comments">
            <div className="comments-header-row">
              <h3 className="comments-heading">
                <MessageSquare size={18} />
                <span>Reader Discussion ({comments.length})</span>
              </h3>
              <span className="comments-guideline">Community moderated</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="comment-input-box modern-comment-box">
              <div className="comment-form-row">
                <input 
                  type="text" 
                  placeholder="Your Name / Designation..."
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="comment-name-input"
                />
              </div>
              <textarea 
                className="comment-textarea modern-textarea"
                placeholder="Share your perspective, operational counterpoint, or industry insights..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <div className="comment-submit-row">
                <span className="comment-hint">Markdown supported</span>
                <button type="submit" className="pitch-btn comment-submit-btn">
                  <Send size={13} />
                  <span>Post Perspective</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="comments-list-wrap">
              {comments.map((comment) => (
                <article key={comment.id} className="comment-card modern-comment-card">
                  <div className="comment-top-row">
                    <div className="comment-author-block">
                      <div className="comment-author-avatar">
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <div className="comment-user">{comment.author}</div>
                        <div className="comment-role-meta">{comment.role} • {comment.time}</div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleLikeComment(comment.id)}
                      className={`comment-like-btn ${comment.isLiked ? 'active' : ''}`}
                      title={comment.isLiked ? "Unlike / remove like" : "Applaud perspective (1 like)"}
                      aria-pressed={Boolean(comment.isLiked)}
                    >
                      <ThumbsUp size={12} fill={comment.isLiked ? "currentColor" : "none"} />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </article>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
