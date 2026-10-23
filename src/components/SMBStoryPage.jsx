import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Bookmark, Share2, Heart, Award, Clock, Eye, 
  CheckCircle, Sparkles, Copy, Check, ChevronRight, MessageSquare,
  Flame, TrendingUp, Send, User, Compass, Volume2, VolumeX,
  Play, Pause, Quote, MapPin, Briefcase, Factory, Store, ExternalLink,
  Cpu, BookOpen, Building2, PackageCheck, Lightbulb
} from 'lucide-react';

import { SMB_STORY_PROFILES, ALL_SMB_STORIES } from '../data/smbStoryData';

export default function SMBStoryPage({
  onBackToHome,
  onSelectStory,
  isSaved,
  onToggleSave,
  onShareStory,
  onShowToast,
  initialStoryId = 'pac-cosmetics'
}) {
  const [activeStoryId, setActiveStoryId] = useState(initialStoryId);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(412);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const articleRef = useRef(null);

  // Sync with initialStoryId from route/URL
  useEffect(() => {
    if (initialStoryId && initialStoryId !== activeStoryId) {
      setActiveStoryId(initialStoryId);
    }
  }, [initialStoryId]);

  // Active Story Object from dataset
  const story = SMB_STORY_PROFILES[activeStoryId] || SMB_STORY_PROFILES['pac-cosmetics'];

  // Scroll to top and reset interaction state whenever active story changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLiked(false);
    setLikeCount(Math.floor(Math.random() * 140) + 380);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, [activeStoryId]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const totalHeight = el.scrollHeight;
      const scrolled = window.scrollY - (el.getBoundingClientRect().top + window.scrollY) + window.innerHeight;
      const pct = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
      setReadProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isArticleSaved = isSaved ? isSaved(story.id) : false;

  const handleShare = () => {
    if (onShareStory) {
      onShareStory(story);
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      if (onShowToast) onShowToast('Story link copied to clipboard!');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleClap = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (!liked && onShowToast) {
      onShowToast('👏 Applauded story! Shared with SMBStory community.');
    }
  };

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(!isPlayingAudio);
      if (onShowToast) onShowToast(isPlayingAudio ? 'Audio narration paused' : '🎙️ Audio narration playing');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      if (onShowToast) onShowToast('Audio narration paused');
    } else {
      window.speechSynthesis.cancel();
      const text = story.audioNarrationText || `${story.title}. Reported by ${story.author} for SMBStory.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      if (onShowToast) onShowToast(`🎙️ Audio narration playing: "${story.title}"`);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'SMB';
    return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleSimilarCardClick = (item) => {
    setActiveStoryId(item.id);
    try {
      window.history.pushState(null, '', `?brand=smbstory&story=${item.id}`);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onShowToast) {
      onShowToast(`📖 Now reading: "${item.title}"`);
    }
  };

  return (
    <div className="smb-story-page" ref={articleRef}>
      
      {/* 1. TOP READING PROGRESS BAR */}
      <div className="smb-reading-progress-track">
        <div 
          className="smb-reading-progress-fill" 
          style={{ width: `${readProgress}%` }} 
        />
      </div>

      <div className="container">
        
        {/* 2. BREADCRUMBS & BRAND IDENTITY */}
        <nav className="smb-page-breadcrumbs">
          <button 
            type="button" 
            className="smb-breadcrumb-btn" 
            onClick={onBackToHome}
          >
            <ArrowLeft size={15} />
            <span>Home</span>
          </button>
          <span className="smb-breadcrumb-sep">/</span>
          <span className="smb-breadcrumb-muted">Brands</span>
          <span className="smb-breadcrumb-sep">/</span>
          <div className="smb-brand-pill">
            <span className="smb-brand-badge-text">SMBStory</span>
            <span className="smb-brand-exclusive">Exclusive</span>
          </div>
        </nav>

        {/* 3. HERO SHOWCASE WRAPPER */}
        <section className="smb-hero-spotlight-wrapper">
          
          {/* Main Headline */}
          <div className="smb-hero-headline-block">
            <div className="smb-category-eyebrow">
              <span className="smb-eyebrow-tag">{story.categoryTag || 'D2C BRANDS'}</span>
              <span className="smb-eyebrow-dot">·</span>
              <span className="smb-eyebrow-sub">MADE IN INDIA ENTREPRENEURSHIP</span>
            </div>
            <h1 className="smb-article-title">
              {story.mainHeadline || story.title}
            </h1>
            <p className="smb-hero-subheading">
              {story.heroSubheading || story.subtitle}
            </p>
          </div>

          {/* Byline & Engagement Ribbon */}
          <div className="smb-byline-card-box">
            <div className="smb-byline-left">
              <img 
                src={story.avatar} 
                alt={story.author} 
                className="smb-author-avatar-img"
              />
              <div className="smb-author-meta-info">
                <div className="smb-author-name-row">
                  <span className="smb-author-fullname">{story.author}</span>
                  <span className="smb-author-verified-badge" title="SMBStory Verified Editor">
                    <CheckCircle size={13} fill="#dc2626" color="#ffffff" />
                  </span>
                </div>
                <div className="smb-author-submeta">
                  <span className="smb-author-role">{story.role}</span>
                  <span className="smb-meta-divider">·</span>
                  <span className="smb-publish-date">{story.date}</span>
                  <span className="smb-meta-divider">·</span>
                  <span className="smb-readtime-pill">
                    <Clock size={12} />
                    <span>{story.readTime}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="smb-byline-actions">
              <button 
                type="button" 
                className={`smb-action-pill-btn ${isPlayingAudio ? 'active-audio' : ''}`}
                onClick={toggleAudio}
                title={isPlayingAudio ? 'Pause Narration' : 'Listen to story'}
              >
                {isPlayingAudio ? <Pause size={14} /> : <Volume2 size={14} />}
                <span>{isPlayingAudio ? 'Playing' : 'Listen'}</span>
              </button>

              <button 
                type="button" 
                className={`smb-action-pill-btn ${liked ? 'active-clap' : ''}`}
                onClick={handleClap}
                title="Applaud story"
              >
                <Heart size={14} fill={liked ? '#dc2626' : 'none'} color={liked ? '#dc2626' : 'currentColor'} />
                <span>{likeCount}</span>
              </button>

              <button 
                type="button" 
                className="smb-action-pill-btn"
                onClick={handleShare}
                title="Share story"
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button 
                type="button" 
                className={`smb-action-pill-btn ${isArticleSaved ? 'active-save' : ''}`}
                onClick={() => onToggleSave && onToggleSave(story)}
                title={isArticleSaved ? 'Saved in Bookmarks' : 'Save for later'}
              >
                <Bookmark size={14} fill={isArticleSaved ? '#dc2626' : 'none'} color={isArticleSaved ? '#dc2626' : 'currentColor'} />
                <span>{isArticleSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="smb-hero-media-showcase">
            <img 
              src={story.heroImage || story.image} 
              alt={story.title} 
              className="smb-hero-full-img"
              style={{ objectPosition: story.heroImagePosition || 'center 25%' }}
              loading="eager"
            />
            <div className="smb-hero-floating-badge">
              <Award size={14} color="#dc2626" />
              <span>{story.heroBadgeText}</span>
            </div>
            <div className="smb-hero-media-caption">
              <span>{story.heroCaption || `${story.author} — SMBStory Desk`}</span>
            </div>
          </div>

        </section>

        {/* 4. KEY METRICS STATS GRID (ROW) */}
        {story.stats && story.stats.length > 0 && (
          <section className="smb-metrics-card-grid">
            {story.stats.map((stat, idx) => (
              <div key={idx} className="smb-metric-item">
                <span className="smb-metric-value">{stat.value}</span>
                <span className="smb-metric-label">{stat.label}</span>
                <span className="smb-metric-sub">{stat.sub}</span>
              </div>
            ))}
          </section>
        )}

        {/* 5. ROW-WISE CONTENT ARCHITECTURE (MATCHING PREVIOUS PAGES) */}
        <div className="smb-content-rows-container">
          
          {/* ── ROW 1: Lead Origin Story Card + Founder Mindset Quote Side-by-Side ── */}
          <div className="smb-split-row">
            
            {/* Left: Lead Story Narrative Card */}
            <div className="smb-lead-narrative-card">
              <p className="smb-prose-lead">
                <span className="smb-dropcap">{story.leadDropCap || (story.leadParagraph ? story.leadParagraph[0] : 'W')}</span>
                {story.leadParagraph}
              </p>
              {story.leadSubtext && (
                <p className="smb-lead-subtext">
                  {story.leadSubtext}
                </p>
              )}
            </div>

            {/* Right: Founder Conviction Mindset Quote Card */}
            <div className="smb-mindset-quote-card">
              <div className="smb-mindset-glow" />
              <Quote size={28} className="smb-mindset-quote-icon" />
              <div className="smb-mindset-body">
                <blockquote className="smb-mindset-text">
                  {story.mottoText}
                </blockquote>
                <div className="smb-mindset-author-row">
                  <div className="smb-mindset-avatar-badge">
                    {getInitials(story.mottoAuthor)}
                  </div>
                  <div>
                    <span className="smb-mindset-author-name">{story.mottoAuthor}</span>
                    <span className="smb-mindset-author-title">{story.mottoRole}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── ROW 2: Chapter Narrative Deep Dive + Pullquote Side-by-Side ── */}
          <div className="smb-split-row">
            
            {/* Left: Chapter Narrative Card */}
            <div className="smb-chapter-narrative-card">
              <h2 className="smb-row-card-title">
                {story.section2Title}
              </h2>
              <p className="smb-row-prose">
                {story.section2Prose1}
              </p>
              {story.section2Prose2 && (
                <p className="smb-row-prose" style={{ marginBottom: 0 }}>
                  {story.section2Prose2}
                </p>
              )}
            </div>

            {/* Right: Signature Pullquote Card */}
            <div className="smb-signature-pullquote-card">
              <blockquote className="smb-signature-quote-text">
                {story.pullquoteText}
              </blockquote>
              <div className="smb-pullquote-author-row">
                <div className="smb-mindset-avatar-badge" style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>
                  {getInitials(story.pullquoteAuthor)}
                </div>
                <div>
                  <span className="smb-mindset-author-name">{story.pullquoteAuthor}</span>
                  <span className="smb-mindset-author-title">{story.pullquoteRole}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── ROW 3: Horizontal Dossier Row ── */}
          <div className="smb-horizontal-dossier-card">
            <div className="smb-dossier-left-col">
              <h3 className="smb-dossier-title">
                {story.dossierTitle}
              </h3>
              {story.dossierPills && story.dossierPills.length > 0 && (
                <div className="smb-dossier-stats-pills">
                  {story.dossierPills.map((pill, pIdx) => (
                    <span key={pIdx} className="smb-dossier-pill">{pill}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="smb-dossier-right-col">
              <p className="smb-dossier-prose">
                {story.dossierProse1}
              </p>
              {story.dossierProse2 && (
                <p className="smb-dossier-prose" style={{ marginBottom: 0 }}>
                  {story.dossierProse2}
                </p>
              )}
            </div>
          </div>

          {/* ── ROW 4: Unit Economics / Industry Narrative + Key Takeaways Card Side-by-Side ── */}
          <div className="smb-split-row">
            
            {/* Left: Chapter Narrative Card */}
            <div className="smb-chapter-narrative-card">
              <h2 className="smb-row-card-title">
                {story.section3Title}
              </h2>
              <p className="smb-row-prose">
                {story.section3Prose1}
              </p>
              {story.section3Prose2 && (
                <p className="smb-row-prose" style={{ marginBottom: 0 }}>
                  {story.section3Prose2}
                </p>
              )}
            </div>

            {/* Right: Key Takeaways Card */}
            <div className="smb-takeaways-card" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="smb-takeaways-header">
                <Lightbulb size={18} className="smb-sparkle-icon" />
                <h3>Key Takeaways for Indian Entrepreneurs</h3>
              </div>
              <ul className="smb-takeaways-list">
                {story.takeaways && story.takeaways.map((item, tIdx) => (
                  <li key={tIdx}>
                    <CheckCircle size={16} className="smb-check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ── ROW 5: Article Footer Split Row: Author Profile on Left, Community Engagement & Tags on Right ── */}
          <div className="smb-split-row smb-footer-split-row">
            
            {/* Left: Author Profile Bio Card */}
            <div className="smb-author-bio-card">
              <img 
                src={story.avatar} 
                alt={story.author} 
                className="smb-bio-avatar-img"
              />
              <div className="smb-bio-details">
                <div className="smb-bio-header">
                  <div>
                    <h4 className="smb-bio-name">{story.author}</h4>
                    <span className="smb-bio-role">{story.role}</span>
                  </div>
                  <span className="smb-verified-badge-pill">
                    <CheckCircle size={12} fill="#dc2626" color="#ffffff" />
                    Verified Desk
                  </span>
                </div>
                <p className="smb-bio-summary">
                  {story.bioSummary || "Covering Indian small and medium enterprises, manufacturing supply chains, direct-to-consumer innovators, and grassroots business models across India."}
                </p>
              </div>
            </div>

            {/* Right: Engagement & Topic Pills Card */}
            <div className="smb-engagement-footer-card">
              <div className="smb-footer-actions-row">
                <button 
                  type="button" 
                  className={`smb-clap-btn ${liked ? 'active' : ''}`}
                  onClick={handleClap}
                >
                  <Heart size={18} fill={liked ? '#dc2626' : 'none'} color={liked ? '#dc2626' : 'currentColor'} />
                  <span>{liked ? 'Applauded' : 'Clap for Story'}</span>
                  <span className="smb-clap-counter">{likeCount}</span>
                </button>

                <button 
                  type="button" 
                  className="smb-secondary-action-btn"
                  onClick={handleShare}
                >
                  <Share2 size={16} />
                  <span>{copied ? 'Link Copied!' : 'Share Story'}</span>
                </button>

                <button 
                  type="button" 
                  className={`smb-secondary-action-btn ${isArticleSaved ? 'saved' : ''}`}
                  onClick={() => onToggleSave && onToggleSave(story)}
                >
                  <Bookmark size={16} fill={isArticleSaved ? '#dc2626' : 'none'} color={isArticleSaved ? '#dc2626' : 'currentColor'} />
                  <span>{isArticleSaved ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              </div>

              {/* Hashtag Pills */}
              <div className="smb-article-tags-wrap" style={{ marginTop: '1.25rem' }}>
                {story.tags && story.tags.map(tag => (
                  <span key={tag} className="smb-story-tag-pill">#{tag}</span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 6. SIMILAR STORIES GRID (8 CARDS IN 2 ROWS) */}
        <section className="smb-similar-stories-section">
          
          <div className="smb-similar-header-row">
            <div>
              <h2 className="smb-similar-title">Similar Stories</h2>
              <p className="smb-similar-subtitle">
                More stories you can explore from the desk
              </p>
            </div>

            <button 
              type="button" 
              className="smb-view-all-btn"
              onClick={onBackToHome}
            >
              <span>Explore All Desks</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="smb-similar-cards-grid">
            {ALL_SMB_STORIES
              .filter(item => item.id !== activeStoryId)
              .map((item) => {
                const isItemSaved = isSaved ? isSaved(item.id) : false;
                return (
                  <article 
                    key={item.id} 
                    className="smb-similar-card"
                    onClick={() => handleSimilarCardClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="smb-similar-card-media">
                      <img 
                        src={item.image || item.heroImage} 
                        alt={item.title} 
                        className="smb-similar-card-img"
                        style={{ objectPosition: item.cardPosition || 'center 25%' }}
                        loading="lazy"
                      />
                      <span className="smb-similar-cat-badge">{item.category}</span>
                      <button 
                        type="button" 
                        className={`smb-similar-bookmark-btn ${isItemSaved ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(item);
                        }}
                        title={isItemSaved ? 'Saved' : 'Save'}
                        aria-label="Bookmark"
                      >
                        <Bookmark size={14} fill={isItemSaved ? '#dc2626' : 'none'} color={isItemSaved ? '#dc2626' : 'white'} />
                      </button>
                    </div>

                    <div className="smb-similar-card-body">
                      <div className="smb-similar-card-date-row">
                        <span className="smb-similar-date">{item.date}</span>
                      </div>

                      <h3 className="smb-similar-card-title">{item.title}</h3>
                      <p className="smb-similar-card-desc">{item.subtitle}</p>
                      
                      <div className="smb-similar-card-footer">
                        <div className="smb-similar-author-row">
                          <img 
                            src={item.avatar} 
                            alt={item.author} 
                            className="smb-similar-avatar"
                          />
                          <span className="smb-similar-author-name">{item.author}</span>
                        </div>
                        <span className="smb-similar-read-pill">
                          <Clock size={11} />
                          {item.readTime}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>

        </section>

      </div>
    </div>
  );
}
