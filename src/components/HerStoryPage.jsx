import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Bookmark, Share2, Heart, Award, Clock, Eye, 
  CheckCircle, Sparkles, Copy, Check, ChevronRight, MessageSquare,
  Flame, TrendingUp, Send, User, Compass, Volume2, VolumeX,
  Play, Pause, Quote, MapPin, Dumbbell, Trophy, ExternalLink,
  Cpu, BookOpen
} from 'lucide-react';

import { HER_STORY_PROFILES, ALL_HER_STORIES } from '../data/herStoryData';

export default function HerStoryPage({
  onBackToHome,
  isSaved,
  onToggleSave,
  onShareStory,
  onShowToast,
  initialStoryId = 'prableen-pullup'
}) {
  const [activeStoryId, setActiveStoryId] = useState(initialStoryId);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(384);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const articleRef = useRef(null);

  // Active Story Object from dataset
  const story = HER_STORY_PROFILES[activeStoryId] || HER_STORY_PROFILES['prableen-pullup'];

  // Scroll to top and reset interaction state whenever active story changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLiked(false);
    setLikeCount(Math.floor(Math.random() * 180) + 320);
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
      onShowToast('👏 Applauded story! Shared with HerStory community.');
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
      const text = story.audioNarrationText || `${story.title}. Reported by ${story.author} for HerStory.`;
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

  const renderBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Trophy': return <Trophy size={14} color="#f59e0b" />;
      case 'Sparkles': return <Sparkles size={14} color="#f59e0b" />;
      case 'Cpu': return <Cpu size={14} color="#f59e0b" />;
      case 'TrendingUp': return <TrendingUp size={14} color="#f59e0b" />;
      case 'Volume2': return <Volume2 size={14} color="#f59e0b" />;
      case 'Compass': return <Compass size={14} color="#f59e0b" />;
      case 'BookOpen': return <BookOpen size={14} color="#f59e0b" />;
      case 'Flame': return <Flame size={14} color="#f59e0b" />;
      case 'Award': return <Award size={14} color="#f59e0b" />;
      default: return <Sparkles size={14} color="#f59e0b" />;
    }
  };

  // Get initials for the quote badge avatar
  const getInitials = (name) => {
    if (!name) return 'HS';
    return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="grp-herstory-page" ref={articleRef}>
      
      {/* 1. TOP READING PROGRESS BAR */}
      <div className="grp-reading-progress-track">
        <div 
          className="grp-reading-progress-fill" 
          style={{ width: `${readProgress}%` }} 
        />
      </div>

      <div className="container">
        
        {/* 2. BREADCRUMBS & BRAND IDENTITY */}
        <nav className="grp-page-breadcrumbs">
          <button 
            type="button" 
            className="grp-breadcrumb-btn" 
            onClick={onBackToHome}
          >
            <ArrowLeft size={15} />
            <span>Home</span>
          </button>
          <span className="grp-breadcrumb-sep">/</span>
          <span className="grp-breadcrumb-muted">Brands</span>
          <span className="grp-breadcrumb-sep">/</span>
          <div className="grp-brand-pill">
            <span className="grp-brand-symbol">♀</span>
            <span className="grp-brand-name">HerStory Exclusive</span>
          </div>
        </nav>

        {/* 3. HERO SHOWCASE WRAPPER */}
        <section className="grp-hero-spotlight-wrapper">
          
          {/* Main Headline */}
          <div className="grp-hero-headline-block">
            <h1 className="grp-article-title grp-hero-title-elevated">
              {story.mainHeadline || (story.id === 'prableen-pullup' ? "She couldn't do one pull-up." : story.title)}
            </h1>
            <p className="grp-hero-subheading">
              {story.id === 'prableen-pullup' ? (
                <>Today, Prableen Kaur Gill is <span className="grp-hero-title-accent">Asia’s No. 1 Street Lifter</span></>
              ) : (story.heroSubheading || story.subtitle)}
            </p>
          </div>

          {/* Full-Width Byline & Social Engagement Ribbon */}
          <div className="grp-byline-card-box grp-byline-fullwidth">
            <div className="grp-byline-author-info">
              <img 
                src={story.avatar} 
                alt={story.author} 
                className="grp-byline-avatar"
              />
              <div className="grp-byline-text-meta">
                <div className="grp-byline-name-row">
                  <span className="grp-author-name">{story.author}</span>
                  <CheckCircle size={14} className="grp-verified-icon" />
                </div>
                <div className="grp-byline-sub">
                  <span>{story.role}</span>
                  <span className="grp-dot-sep">·</span>
                  <span>{story.date}</span>
                  <span className="grp-dot-sep">·</span>
                  <span><Clock size={12} style={{display:'inline', marginRight:'3px'}} />{story.readTime}</span>
                  <span className="grp-dot-sep">·</span>
                  <span><Eye size={12} style={{display:'inline', marginRight:'3px'}} />{story.views}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grp-byline-actions">
              <button 
                type="button" 
                className={`grp-action-pill ${isPlayingAudio ? 'saved' : ''}`}
                onClick={toggleAudio}
                title={isPlayingAudio ? 'Pause narrated story' : 'Listen to story narration'}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause size={14} color="#dc2626" />
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>Playing Narration</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={14} />
                    <span>Listen ({story.readTime})</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                className={`grp-action-pill ${isArticleSaved ? 'saved' : ''}`}
                onClick={() => onToggleSave && onToggleSave(story)}
                title={isArticleSaved ? 'Saved to bookmarks' : 'Save story'}
              >
                <Bookmark size={15} fill={isArticleSaved ? 'currentColor' : 'none'} />
                <span>{isArticleSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button 
                type="button" 
                className="grp-action-pill"
                onClick={handleShare}
                title="Share this story"
              >
                {copied ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button 
                type="button" 
                className={`grp-action-pill grp-clap-pill ${liked ? 'clapped' : ''}`}
                onClick={handleClap}
                title="Applaud story"
              >
                <Heart size={15} fill={liked ? '#dc2626' : 'none'} color={liked ? '#dc2626' : 'currentColor'} />
                <span>{likeCount}</span>
              </button>
            </div>
          </div>

          {/* Hero Content Showcase Container Card (matching all other sections) */}
          <div className="grp-hero-showcase-card">
            <div className="grp-hero-split-grid">
              
              {/* Left: Hero Image Media Card */}
              <div className="grp-hero-visual-col">
                <div className="grp-hero-curated-card">
                  <img 
                    src={story.heroImage} 
                    alt={story.title} 
                    className="grp-hero-img-element"
                  />
                  
                  {/* Floating Badges */}
                  <div className="grp-card-floating-badge-top-left">
                    {renderBadgeIcon(story.heroBadgeIcon)}
                    <span>{story.heroBadgeText}</span>
                  </div>

                  <div className="grp-card-floating-badge-top-right">
                    <span className="grp-hs-watermark-text">HS</span>
                  </div>

                  {/* Bottom Overlay Telemetry Bar */}
                  <div className="grp-hero-telemetry-overlay">
                    <div className="grp-telemetry-left">
                      <span className="grp-telemetry-name">{story.protagonistName}</span>
                      <span className="grp-telemetry-sub">{story.protagonistSub}</span>
                      <span className="grp-telemetry-photo-by">Photo credit: <em>{story.photoCredit}</em> · Official HerStory Feature</span>
                    </div>
                    <div className="grp-telemetry-tag">
                      <span>{story.verifiedTag}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Milestones & Motto Panel */}
              <div className="grp-hero-briefing-col">
                <div className="grp-milestones-card">
                  <div className="grp-milestones-header">
                    <span>{story.milestonesHeader}</span>
                  </div>
                  
                  <ul className="grp-milestones-list">
                    {story.milestones.map((milestone, idx) => (
                      <li key={idx} className="grp-milestone-item">
                        <div className="grp-milestone-content">
                          <strong>{milestone.title}</strong>
                          <p dangerouslySetInnerHTML={{ __html: milestone.description }} />
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Athlete / Protagonist Motto Box */}
                  <div className="grp-milestone-motto-box">
                    <p className="grp-motto-text">
                      “{story.mottoText}”
                    </p>
                    <div className="grp-quote-author-row">
                      <div className="grp-quote-author-bar" />
                      <cite className="grp-feature-quote-author">{story.mottoAuthor}</cite>
                      <span className="grp-quote-author-title">{story.mottoRole}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6. MAIN ARTICLE CONTENT BODY (100% Full-Width Professional View) */}
        <div className="grp-article-layout-grid grp-full-width-article">
          
          {/* Main Reading Flow */}
          <article className="grp-prose-container grp-prose-full-width">
            
            {/* Opening Lead Story Card + Mindset Quote in ONE Row (100% Breadth) */}
            <div className="grp-lead-mindset-split-row">
              
              {/* Left: Opening Lead Story Card */}
              <div className="grp-lead-story-hero-card">
                <p className="grp-prose-lead">
                  <span className="grp-drop-cap">{story.leadStoryDropCap}</span>
                  {story.leadStoryText}
                </p>
              </div>

              {/* Right: Professional Mindset / Philosophy Quote Showcase */}
              <div className="grp-mindset-quote-card">
                <div className="grp-mindset-quote-glow" />
                <Quote size={28} className="grp-mindset-quote-symbol" />
                <div className="grp-mindset-quote-body">
                  <blockquote className="grp-mindset-quote-text">
                    “{story.philosophyQuote}”
                  </blockquote>
                  <div className="grp-mindset-author-row">
                    <div className="grp-mindset-author-avatar-badge">
                      {getInitials(story.protagonistName)}
                    </div>
                    <div>
                      <span className="grp-mindset-author-name">{story.protagonistName}</span>
                      <span className="grp-mindset-author-context">{story.philosophyKicker} · {story.protagonistSub}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Disciplines Quad Grid (when applicable, e.g. Street Lifting) */}
            {story.disciplines && story.disciplines.length > 0 && (
              <div className="grp-streetlifting-explainer-card">
                
                {/* Header Row: Title on Left, Description on Right in ONE Row */}
                <div className="grp-explainer-header-row">
                  <div className="grp-explainer-title-col">
                    <h3 className="grp-explainer-title">
                      Powerlifting on a Bar: Four Compound Disciplines
                    </h3>
                  </div>

                  <div className="grp-explainer-desc-col">
                    <p className="grp-explainer-lead">
                      Street lifting combines maximum one-rep attempts across pull-ups, bar dips, muscle-ups, and back squats with heavy plate loads suspended from weight belts around the waist.
                    </p>
                  </div>
                </div>

                {/* 4 Disciplines Cards in ONE Row across 100% Breadth */}
                <div className="grp-disciplines-quad-grid">
                  {story.disciplines.map((d, idx) => (
                    <div key={idx} className="grp-discipline-tile">
                      <div className="grp-discipline-top">
                        <div className="grp-discipline-title-row">
                          <strong className="grp-discipline-name">{d.name}</strong>
                          {d.gold && (
                            <span className="grp-discipline-record-tag">
                              <Trophy size={11} />
                              Record
                            </span>
                          )}
                        </div>
                        <p className="grp-discipline-sub">{d.sub}</p>
                      </div>

                      <div className="grp-discipline-stat-row">
                        <span className="grp-stat-label">
                          {d.gold ? 'Historic Record' : 'PR Benchmark'}
                        </span>
                        <span className="grp-stat-value">
                          {d.stat.replace(/^.*:\s*/, '')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* SECTION 1: Narrative Feature Split Showcase (Media on Left, Narrative & Pullquote on Right) */}
            <div className="grp-feature-split-showcase">
              
              {/* Media Column */}
              <div className="grp-feature-media-col">
                <div className="grp-feature-media-frame">
                  <img 
                    src={story.featureImage} 
                    alt={story.section1Title}
                    className="grp-feature-portrait-img"
                  />
                </div>

                <div className="grp-feature-media-caption">
                  <span>{story.featureCaption}</span>
                </div>
              </div>

              {/* Text Narrative Column */}
              <div className="grp-feature-content-col">
                <div className="grp-section-header-block" style={{ marginTop: 0 }}>
                  <h2 className="grp-section-heading">
                    {story.section1Title}
                  </h2>
                </div>

                <p className="grp-feature-prose grp-feature-lead-prose">
                  <span className="grp-drop-cap">{story.section1LeadDropCap}</span>
                  {story.section1Lead}
                </p>

                <p className="grp-feature-prose">
                  {story.section1Body}
                </p>

                {/* Editorial Pullquote */}
                <div className="grp-feature-pullquote">
                  <p className="grp-feature-quote-text">
                    {story.section1PullquoteText}
                  </p>
                  <div className="grp-quote-author-row">
                    <div className="grp-quote-author-bar" />
                    <cite className="grp-feature-quote-author">{story.section1PullquoteAuthor}</cite>
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 2: Deep Dive Narrative + Modern Pullquote in ONE ROW */}
            <div className="grp-section2-split-row">
              
              {/* Left: Narrative Column */}
              <div className="grp-section2-narrative-col">
                <div className="grp-section-header-block" style={{ marginTop: 0 }}>
                  <h2 className="grp-section-heading">
                    {story.section2Title}
                  </h2>
                </div>

                <p className="grp-prose-p">
                  {story.section2Lead}
                </p>

                <p className="grp-prose-p" style={{ marginBottom: 0 }}>
                  {story.section2Body}
                </p>
              </div>

              {/* Right: Signature Modern Pull-Quote Card */}
              <blockquote className="grp-modern-pullquote" style={{ margin: 0 }}>
                <p className="grp-pullquote-text">
                  “{story.section2ModernQuote}”
                </p>
                <div className="grp-pullquote-footer">
                  <div className="grp-pullquote-avatar-badge">
                    {getInitials(story.section2ModernAuthor)}
                  </div>
                  <div className="grp-pullquote-author-meta">
                    <cite className="grp-pullquote-author-name">{story.section2ModernAuthor}</cite>
                    <span className="grp-pullquote-author-title">{story.section2ModernRole}</span>
                  </div>
                </div>
              </blockquote>

            </div>

            {/* Callout Box - Executive Horizontal Row UI */}
            <div className="grp-callout-box">
              <div className="grp-callout-left-col">
                <h4 className="grp-callout-title">
                  {story.calloutTitle}
                </h4>
              </div>

              <div className="grp-callout-right-col">
                <p className="grp-prose-p grp-callout-body">
                  {story.calloutText}
                </p>
              </div>
            </div>

            {/* SECTION 3: Community Impact & Key Takeaway in ONE ROW */}
            <div className="grp-section3-split-row">
              
              {/* Left: Narrative Column */}
              <div className="grp-section3-narrative-col">
                <div className="grp-section-header-block" style={{ marginTop: 0 }}>
                  <h2 className="grp-section-heading">
                    {story.section3Title}
                  </h2>
                </div>

                <p className="grp-prose-p">
                  {story.section3Body1}
                </p>

                <p className="grp-prose-p" style={{ marginBottom: 0 }}>
                  {story.section3Body2}
                </p>
              </div>

              {/* Right: Key Editorial Takeaway Card */}
              <div className="grp-section3-takeaway-col">
                <div className="grp-takeaway-card">
                  <div className="grp-takeaway-quote-wrap">
                    <Quote size={24} className="grp-takeaway-watermark-icon" />
                    <p className="grp-takeaway-text">
                      “{story.takeawayText ? story.takeawayText.replace(/^“|”$/g, '') : ''}”
                    </p>
                  </div>

                  <div className="grp-takeaway-footer">
                    <div className="grp-takeaway-author-pill">
                      <Heart size={13} className="grp-takeaway-author-icon" />
                      <span>Core Philosophy & Community Impact</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Article Footer Split Row: Author Profile on Left, Editorial Sign-off & Engagement on Right */}
            <div className="grp-article-footer-split-row">
              
              {/* Left: Author Profile Bio Card */}
              <div className="grp-author-profile-card">
                <img 
                  src={story.avatar} 
                  alt={story.author} 
                  className="grp-author-card-avatar"
                />
                <div className="grp-author-card-details">
                  <div className="grp-author-card-header">
                    <div>
                      <h4 className="grp-author-card-name">{story.author}</h4>
                      <span className="grp-author-card-role">{story.role}</span>
                    </div>
                    <button 
                      type="button" 
                      className="grp-follow-author-btn"
                      onClick={() => onShowToast && onShowToast(`Following ${story.author}!`)}
                    >
                      Follow Beat
                    </button>
                  </div>
                  <p className="grp-author-card-bio">
                    {story.author} writes on inspiring women pioneers, leaders, innovators, and grassroots entrepreneurs breaking frontiers across India and Asia.
                  </p>
                </div>
              </div>

              {/* Right: Editorial Governance & Engagement Card */}
              <div className="grp-editorial-governance-card">
                <div className="grp-governance-header">
                  <div className="grp-signoff-badge-row">
                    <span className="grp-signoff-text">Edited by <strong>{story.editor}</strong></span>
                  </div>
                </div>

                <div className="grp-reaction-toolbar grp-embedded-reaction-toolbar">
                  <div className="grp-reaction-left">
                    <button 
                      type="button" 
                      className={`grp-clap-btn ${liked ? 'active' : ''}`}
                      onClick={handleClap}
                    >
                      <Heart size={18} fill={liked ? '#dc2626' : 'none'} color={liked ? '#dc2626' : 'currentColor'} />
                      <span>{liked ? 'Applauded' : 'Clap for Story'}</span>
                      <span className="grp-clap-counter">{likeCount}</span>
                    </button>

                    <button 
                      type="button" 
                      className="grp-secondary-action-btn"
                      onClick={handleShare}
                    >
                      <Share2 size={16} />
                      <span>Share Story</span>
                    </button>
                  </div>

                  <div className="grp-reaction-right">
                    <button 
                      type="button" 
                      className={`grp-secondary-action-btn ${isArticleSaved ? 'saved' : ''}`}
                      onClick={() => onToggleSave && onToggleSave(story)}
                    >
                      <Bookmark size={16} fill={isArticleSaved ? 'currentColor' : 'none'} />
                      <span>{isArticleSaved ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>
                  </div>
                </div>

                {/* Hashtag Pills */}
                <div className="grp-article-tags-wrap grp-embedded-tags-wrap">
                  {story.tags.map(tag => (
                    <span key={tag} className="grp-story-tag-pill">{tag}</span>
                  ))}
                </div>
              </div>

            </div>

          </article>
        </div>

        {/* 7. SIMILAR STORIES GRID (Clicking any card renders that story live) */}
        <section className="grp-similar-stories-section">
          
          <div className="grp-similar-header-row">
            <div>
              <h2 className="grp-similar-title">Similar Inspiring Stories</h2>
              <p className="grp-similar-subtitle">
                Explore more journeys of women pioneers, founders, and changemakers
              </p>
            </div>

            <button 
              type="button" 
              className="grp-view-all-btn"
              onClick={onBackToHome}
            >
              <span>Explore All Desks</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grp-similar-cards-grid">
            {ALL_HER_STORIES
              .filter(item => item.id !== activeStoryId)
              .map((item) => {
                const isItemSaved = isSaved ? isSaved(item.id) : false;
                return (
                  <article 
                    key={item.id} 
                    className="grp-similar-card"
                    onClick={() => {
                      setActiveStoryId(item.id);
                      if (onShowToast) {
                        onShowToast(`📖 Now reading: "${item.title}"`);
                      }
                    }}
                  >
                    <div className="grp-similar-card-media">
                      <img 
                        src={item.heroImage} 
                        alt={item.title} 
                        className="grp-similar-card-img"
                        loading="lazy"
                      />
                      <span className="grp-similar-cat-badge">{item.category}</span>
                      <button 
                        type="button" 
                        className={`grp-similar-bookmark-btn ${isItemSaved ? 'active' : ''}`}
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

                    <div className="grp-similar-card-body">
                      <h3 className="grp-similar-card-title">{item.title}</h3>
                      <p className="grp-similar-card-desc">{item.subtitle}</p>
                      
                      <div className="grp-similar-card-footer">
                        <div className="grp-similar-author-row">
                          <img 
                            src={item.avatar} 
                            alt={item.author} 
                            className="grp-similar-avatar"
                          />
                          <span className="grp-similar-author-name">{item.author}</span>
                        </div>
                        <span className="grp-similar-read-pill">
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
