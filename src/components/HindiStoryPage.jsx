import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Bookmark, Share2, ChevronRight, Clock,
  Play, Pause, ChevronDown, Check, X, ExternalLink, Sparkles,
  Layers, Volume2, Award, TrendingUp, BookOpen
} from 'lucide-react';

import {
  HINDI_SUB_NAV,
  HINDI_TECHSPARKS_SECTION,
  HINDI_STARTUPS_SECTION,
  HINDI_AI_TECH_SECTION,
  HINDI_SIMILAR_STORIES,
  ALL_HINDI_STORIES
} from '../data/hindiStoryData';

export default function HindiStoryPage({
  onSelectStory,
  isSaved,
  onToggleSave,
  onShareStory,
  onBackToHome,
  onShowToast,
  onOpenAuthModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filtered stories when searching
  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return ALL_HINDI_STORIES.filter(s => 
      s.title.toLowerCase().includes(q) ||
      (s.summary && s.summary.toLowerCase().includes(q)) ||
      (s.categoryTag && s.categoryTag.toLowerCase().includes(q)) ||
      (s.tag && s.tag.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleStoryClick = () => {
    // Popup modal disabled per user request
  };

  const handleShare = (e, story) => {
    e.stopPropagation();
    if (onShareStory) {
      onShareStory(story);
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      if (onShowToast) onShowToast('Story link copied to clipboard!');
    }
  };

  const handleBookmark = (e, story) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(story);
      const currentlySaved = isSaved ? isSaved(story.id) : false;
      if (onShowToast) {
        onShowToast(!currentlySaved ? '✓ Added to your saved reading list' : 'Removed from saved reading list');
      }
    }
  };

  return (
    <div className="enterprise-page-wrapper hindi-page-wrapper">
      {/* ── Breadcrumb Navigation ── */}
      <div className="container" style={{ paddingTop: '1.25rem' }}>
        <nav className="ssp-breadcrumb" aria-label="Breadcrumb">
          <button
            type="button"
            className="ssp-back-btn"
            onClick={onBackToHome}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </button>
          <span className="ssp-sep">/</span>
          <span className="ssp-crumb-muted">Brands</span>
          <span className="ssp-sep">/</span>
          <span className="ssp-crumb-current">YS Hindi (हिंदी)</span>
        </nav>
      </div>

      {/* ── Topic Filter Pills Bar ── */}
      <div className="container" style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
        <div className="hindi-filter-pills-bar">
          <div className="hindi-brand-badge-pill">
            <span className="hindi-badge-dot" />
            <span>YS हिंदी</span>
          </div>
          <div className="hindi-pills-scroll">
            {HINDI_SUB_NAV.map((nav) => (
              <button
                key={nav.id}
                type="button"
                className={`hindi-pill-btn ${activeTab === nav.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(nav.id);
                  setSearchQuery('');
                }}
              >
                {nav.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search Filter Results View (If active search) ── */}
      {filteredStories ? (
        <main className="container enterprise-main-content">
          <div className="enterprise-search-results-banner">
            <h2>खोज परिणाम: "{searchQuery}"</h2>
            <p>YS हिंदी में {filteredStories.length} कहानियां मिलीं</p>
            <button 
              type="button" 
              className="enterprise-clear-search-pill"
              onClick={() => setSearchQuery('')}
            >
              खोज हटाएं (Clear Search)
            </button>
          </div>

          <div className="enterprise-search-grid">
            {filteredStories.map((story) => (
              <article 
                key={story.id} 
                className="enterprise-search-card"
                onClick={() => onSelectStory && onSelectStory(story)}
              >
                <div className="enterprise-card-img-wrap">
                  <img 
                    src={story.image} 
                    alt={story.title} 
                    onError={(e) => {
                      if (story.fallbackImage) e.target.src = story.fallbackImage;
                    }}
                  />
                  <span className="enterprise-badge-tag">{story.tag || story.categoryTag}</span>
                </div>
                <div className="enterprise-card-body">
                  <h3 className="enterprise-card-title">{story.title}</h3>
                  <p className="enterprise-card-excerpt">{story.summary}</p>
                  <div className="enterprise-card-meta">
                    <span>{story.readTime || '3 MIN READ'}</span>
                    <div className="enterprise-card-actions">
                      <button 
                        type="button" 
                        onClick={(e) => handleBookmark(e, story)}
                        className={`enterprise-action-btn ${isSaved && isSaved(story.id) ? 'saved' : ''}`}
                        title="Save story"
                      >
                        <Bookmark size={15} fill={isSaved && isSaved(story.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleShare(e, story)}
                        className="enterprise-action-btn"
                        title="Share story"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      ) : (
        <main className="container enterprise-main-content">
          
          {/* ══════════════════════════════════════════════
              Section 1: TechSparks 2024 Bengaluru Lead Story
             ══════════════════════════════════════════════ */}
          <section className="enterprise-content-section" style={{ borderTop: 'none', paddingTop: 0, marginTop: '1.25rem' }}>
            <div className="enterprise-two-col-layout">
              {/* Featured Left Card */}
              <div 
                className="enterprise-featured-box"
                onClick={() => onSelectStory && onSelectStory(HINDI_TECHSPARKS_SECTION.featuredStory)}
              >
                <div className="enterprise-featured-image-box">
                  <img 
                    src={HINDI_TECHSPARKS_SECTION.featuredStory.image} 
                    alt={HINDI_TECHSPARKS_SECTION.featuredStory.title} 
                    onError={(e) => {
                      if (HINDI_TECHSPARKS_SECTION.featuredStory.fallbackImage) {
                        e.target.src = HINDI_TECHSPARKS_SECTION.featuredStory.fallbackImage;
                      }
                    }}
                  />
                  <span className="enterprise-es-watermark" style={{ background: '#dc2626' }}>TechSparks 2024</span>
                </div>
                <div className="enterprise-featured-body">
                  <h3 className="enterprise-featured-title">
                    {HINDI_TECHSPARKS_SECTION.featuredStory.title}
                  </h3>
                  <div className="enterprise-item-meta-row">
                    <span className="enterprise-source-tag">BY YS HINDI</span>
                    <span className="enterprise-meta-dot">•</span>
                    <span className="enterprise-time-tag">{HINDI_TECHSPARKS_SECTION.featuredStory.readTime || '5 MIN READ'}</span>
                    
                    <div className="enterprise-inline-actions">
                      <button 
                        type="button" 
                        onClick={(e) => handleBookmark(e, HINDI_TECHSPARKS_SECTION.featuredStory)}
                        className={`enterprise-meta-icon-btn ${isSaved && isSaved(HINDI_TECHSPARKS_SECTION.featuredStory.id) ? 'saved' : ''}`}
                        title="Save story"
                      >
                        <Bookmark size={16} fill={isSaved && isSaved(HINDI_TECHSPARKS_SECTION.featuredStory.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleShare(e, HINDI_TECHSPARKS_SECTION.featuredStory)}
                        className="enterprise-meta-icon-btn"
                        title="Share story"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right List Column (4 Items) */}
              <div className="enterprise-list-col">
                {HINDI_TECHSPARKS_SECTION.listStories.map((story) => (
                  <article 
                    key={story.id} 
                    className="enterprise-list-item"
                    onClick={() => onSelectStory && onSelectStory(story)}
                  >
                    <h4 className="enterprise-list-item-title">{story.title}</h4>
                    <div className="enterprise-item-meta-row">
                      <span className="enterprise-source-tag">BY YS HINDI</span>
                      <span className="enterprise-meta-dot">•</span>
                      <span className="enterprise-time-tag">{story.readTime || '3 MIN READ'}</span>
                      <div className="enterprise-inline-actions">
                        <button 
                          type="button" 
                          onClick={(e) => handleBookmark(e, story)}
                          className={`enterprise-meta-icon-btn ${isSaved && isSaved(story.id) ? 'saved' : ''}`}
                          title="Save story"
                        >
                          <Bookmark size={13} fill={isSaved && isSaved(story.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              Section 2: Startups & Business (स्टार्टअप्स और कारोबार)
             ══════════════════════════════════════════════ */}
          <section className="enterprise-content-section">
            <div className="enterprise-two-col-layout">
              {/* Featured Left Card */}
              <div 
                className="enterprise-featured-box"
                onClick={() => onSelectStory && onSelectStory(HINDI_STARTUPS_SECTION.featuredStory)}
              >
                <div className="enterprise-featured-image-box">
                  <img 
                    src={HINDI_STARTUPS_SECTION.featuredStory.image} 
                    alt={HINDI_STARTUPS_SECTION.featuredStory.title}
                    onError={(e) => {
                      if (HINDI_STARTUPS_SECTION.featuredStory.fallbackImage) {
                        e.target.src = HINDI_STARTUPS_SECTION.featuredStory.fallbackImage;
                      }
                    }}
                  />
                  <span className="enterprise-es-watermark">YS हिंदी</span>
                </div>
                <div className="enterprise-featured-body">
                  <h3 className="enterprise-featured-title">
                    {HINDI_STARTUPS_SECTION.featuredStory.title}
                  </h3>
                  <div className="enterprise-item-meta-row">
                    <span className="enterprise-source-tag">BY YS HINDI</span>
                    <span className="enterprise-meta-dot">•</span>
                    <span className="enterprise-time-tag">{HINDI_STARTUPS_SECTION.featuredStory.readTime || '4 MIN READ'}</span>
                    
                    <div className="enterprise-inline-actions">
                      <button 
                        type="button" 
                        onClick={(e) => handleBookmark(e, HINDI_STARTUPS_SECTION.featuredStory)}
                        className={`enterprise-meta-icon-btn ${isSaved && isSaved(HINDI_STARTUPS_SECTION.featuredStory.id) ? 'saved' : ''}`}
                        title="Save story"
                      >
                        <Bookmark size={16} fill={isSaved && isSaved(HINDI_STARTUPS_SECTION.featuredStory.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleShare(e, HINDI_STARTUPS_SECTION.featuredStory)}
                        className="enterprise-meta-icon-btn"
                        title="Share story"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right List Column (4 Items) */}
              <div className="enterprise-list-col">
                {HINDI_STARTUPS_SECTION.listStories.map((story) => (
                  <article 
                    key={story.id} 
                    className="enterprise-list-item"
                    onClick={() => onSelectStory && onSelectStory(story)}
                  >
                    <h4 className="enterprise-list-item-title">{story.title}</h4>
                    <div className="enterprise-item-meta-row">
                      <span className="enterprise-source-tag">BY YS HINDI</span>
                      <span className="enterprise-meta-dot">•</span>
                      <span className="enterprise-time-tag">{story.readTime || '3 MIN READ'}</span>
                      <div className="enterprise-inline-actions">
                        <button 
                          type="button" 
                          onClick={(e) => handleBookmark(e, story)}
                          className={`enterprise-meta-icon-btn ${isSaved && isSaved(story.id) ? 'saved' : ''}`}
                          title="Save story"
                        >
                          <Bookmark size={13} fill={isSaved && isSaved(story.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              Section 3: Deep Tech & AI (टेक व AI)
             ══════════════════════════════════════════════ */}
          <section className="enterprise-content-section">
            <div className="enterprise-two-col-layout">
              {/* Featured Left Card */}
              <div 
                className="enterprise-featured-box"
                onClick={() => onSelectStory && onSelectStory(HINDI_AI_TECH_SECTION.featuredStory)}
              >
                <div className="enterprise-featured-image-box">
                  <img 
                    src={HINDI_AI_TECH_SECTION.featuredStory.image} 
                    alt={HINDI_AI_TECH_SECTION.featuredStory.title}
                    onError={(e) => {
                      if (HINDI_AI_TECH_SECTION.featuredStory.fallbackImage) {
                        e.target.src = HINDI_AI_TECH_SECTION.featuredStory.fallbackImage;
                      }
                    }}
                  />
                  <span className="enterprise-es-watermark">AI &amp; TECH</span>
                </div>
                <div className="enterprise-featured-body">
                  <h3 className="enterprise-featured-title">
                    {HINDI_AI_TECH_SECTION.featuredStory.title}
                  </h3>
                  <div className="enterprise-item-meta-row">
                    <span className="enterprise-source-tag">BY YS HINDI</span>
                    <span className="enterprise-meta-dot">•</span>
                    <span className="enterprise-time-tag">{HINDI_AI_TECH_SECTION.featuredStory.readTime || '5 MIN READ'}</span>
                    
                    <div className="enterprise-inline-actions">
                      <button 
                        type="button" 
                        onClick={(e) => handleBookmark(e, HINDI_AI_TECH_SECTION.featuredStory)}
                        className={`enterprise-meta-icon-btn ${isSaved && isSaved(HINDI_AI_TECH_SECTION.featuredStory.id) ? 'saved' : ''}`}
                        title="Save story"
                      >
                        <Bookmark size={16} fill={isSaved && isSaved(HINDI_AI_TECH_SECTION.featuredStory.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleShare(e, HINDI_AI_TECH_SECTION.featuredStory)}
                        className="enterprise-meta-icon-btn"
                        title="Share story"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right List Column (4 Items) */}
              <div className="enterprise-list-col">
                {HINDI_AI_TECH_SECTION.listStories.map((story) => (
                  <article 
                    key={story.id} 
                    className="enterprise-list-item"
                    onClick={() => onSelectStory && onSelectStory(story)}
                  >
                    <h4 className="enterprise-list-item-title">{story.title}</h4>
                    <div className="enterprise-item-meta-row">
                      <span className="enterprise-source-tag">BY YS HINDI</span>
                      <span className="enterprise-meta-dot">•</span>
                      <span className="enterprise-time-tag">{story.readTime || '3 MIN READ'}</span>
                      <div className="enterprise-inline-actions">
                        <button 
                          type="button" 
                          onClick={(e) => handleBookmark(e, story)}
                          className={`enterprise-meta-icon-btn ${isSaved && isSaved(story.id) ? 'saved' : ''}`}
                          title="Save story"
                        >
                          <Bookmark size={13} fill={isSaved && isSaved(story.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              Section 4: 8 Similar Stories Grid (संबंधित खबरें)
             ══════════════════════════════════════════════ */}
          <section className="hindi-similar-stories-section" style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border-light)' }}>
            <div className="hindi-similar-header">
              <h3 className="hindi-similar-heading">Similar Stories</h3>
              <p className="hindi-similar-subheading">संबंधित खबरें और ताजा अपडेट्स</p>
            </div>

            <div className="hindi-similar-grid">
              {HINDI_SIMILAR_STORIES.map((story) => (
                <article
                  key={story.id}
                  className="hindi-similar-card"
                  onClick={() => onSelectStory && onSelectStory(story)}
                >
                  <div className="hindi-card-thumb-wrap">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      onError={(e) => {
                        if (story.fallbackImage) e.target.src = story.fallbackImage;
                      }}
                      loading="lazy"
                    />
                    <span className="hindi-card-category-badge">{story.tag}</span>
                  </div>

                  <div className="hindi-card-content">
                    <h4 className="hindi-card-title">{story.title}</h4>
                    <div className="hindi-card-meta">
                      <span>{story.readTime}</span>
                      <div className="enterprise-inline-actions">
                        <button 
                          type="button" 
                          onClick={(e) => handleBookmark(e, story)}
                          className={`enterprise-meta-icon-btn ${isSaved && isSaved(story.id) ? 'saved' : ''}`}
                          title="Save story"
                        >
                          <Bookmark size={14} fill={isSaved && isSaved(story.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => handleShare(e, story)}
                          className="enterprise-meta-icon-btn"
                          title="Share story"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </main>
      )}
    </div>
  );
}
