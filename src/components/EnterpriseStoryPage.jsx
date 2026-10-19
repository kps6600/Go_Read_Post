import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Bookmark, Share2, ChevronRight, Clock,
  Play, Pause, ChevronDown, Check, X, ExternalLink, Sparkles,
  Layers, Volume2, Award, TrendingUp, Briefcase, Building2
} from 'lucide-react';

import {
  ENTERPRISE_CONVERSATIONS,
  ENTERPRISE_INNOVATION_SECTION,
  ENTERPRISE_CORPORATE_SECTION,
  ENTERPRISE_GCC_SECTION,
  ENTERPRISE_INTERVIEW_SECTION,
  ALL_ENTERPRISE_STORIES
} from '../data/enterpriseStoryData';

export default function EnterpriseStoryPage({
  onSelectStory,
  isSaved,
  onToggleSave,
  onShareStory,
  onBackToHome,
  onShowToast,
  onOpenAuthModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(ENTERPRISE_CONVERSATIONS.featuredVideo);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Filtered stories when searching
  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return ALL_ENTERPRISE_STORIES.filter(s => 
      s.title.toLowerCase().includes(q) ||
      (s.summary && s.summary.toLowerCase().includes(q)) ||
      (s.categoryTag && s.categoryTag.toLowerCase().includes(q)) ||
      (s.tag && s.tag.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleStoryClick = (story) => {
    if (onSelectStory) {
      onSelectStory({
        id: story.id,
        title: story.title,
        subtitle: story.subtitle || story.summary,
        summary: story.summary || story.subtitle,
        categoryLabel: story.categoryTag || story.tag || 'EnterpriseStory',
        category: 'enterprise',
        brand: 'EnterpriseStory',
        image: story.image,
        fallbackImage: story.fallbackImage,
        readTime: story.readTime,
        publishedAt: story.publishedAt,
        author: story.author,
        content: story.content || [story.summary]
      });
    }
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
    <div className="enterprise-page-wrapper">
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
          <span className="ssp-crumb-current">EnterpriseStory</span>
        </nav>
      </div>

      {/* ── Search Filter Results View (If active search) ── */}
      {filteredStories ? (
        <main className="container enterprise-main-content">
          <div className="enterprise-search-results-banner">
            <h2>Search Results for "{searchQuery}"</h2>
            <p>{filteredStories.length} stories found across EnterpriseStory</p>
            <button 
              type="button" 
              className="enterprise-clear-search-pill"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          </div>

          <div className="enterprise-search-grid">
            {filteredStories.map((story) => (
              <article 
                key={story.id} 
                className="enterprise-search-card"
                onClick={() => handleStoryClick(story)}
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
              1. "Conversations >" Video Interview Series
             ══════════════════════════════════════════════ */}
          <section className="enterprise-conversations-section">
            <div className="enterprise-conv-header">
              <h2 className="enterprise-conv-title">
                <span>Conversations</span>
                <ChevronRight size={24} className="enterprise-conv-arrow" />
              </h2>
              <p className="enterprise-conv-subtitle">
                {ENTERPRISE_CONVERSATIONS.sectionSubtitle}
              </p>
            </div>

            <div className="enterprise-conv-layout">
              {/* Left Column: Featured Video Card */}
              <div className="enterprise-video-feature-col">
                <div 
                  className="enterprise-video-box"
                  onClick={() => setIsVideoModalOpen(true)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="enterprise-interview-split-screen">
                    <div className="enterprise-interview-half left">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80" 
                        alt="Sulajja Firodia Motwani" 
                      />
                      <div className="enterprise-speaker-nameplate">
                        <strong>SULAJJA FIRODIA MOTWANI</strong>
                        <span>FOUNDER &amp; CEO, KINETIC GREEN</span>
                      </div>
                    </div>
                    <div className="enterprise-interview-half right">
                      <img 
                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80" 
                        alt="Shradha Sharma" 
                      />
                      <div className="enterprise-speaker-nameplate">
                        <strong>SHRADHA SHARMA</strong>
                        <span>FOUNDER &amp; CEO, YOURSTORY</span>
                      </div>
                    </div>

                    <div className="enterprise-video-overlay-center">
                      <div className="enterprise-play-pulse-btn">
                        <Play size={26} fill="white" className="enterprise-play-icon" />
                      </div>
                    </div>

                    <span className="enterprise-video-duration-pill">
                      {activeVideo.duration || '24:18'}
                    </span>
                  </div>
                </div>

                <div className="enterprise-video-info">
                  <h3 
                    className="enterprise-video-headline"
                    onClick={() => setIsVideoModalOpen(true)}
                  >
                    {activeVideo.title}
                  </h3>
                  <button 
                    type="button" 
                    className="enterprise-watch-link"
                    onClick={() => setIsVideoModalOpen(true)}
                  >
                    <span>Watch episode</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Right Column: Playlist */}
              <div className="enterprise-playlist-col">
                <div className="enterprise-playlist-header">
                  <h4>Playlist</h4>
                  <span className="enterprise-playlist-badge">4 Episodes</span>
                </div>
                <div className="enterprise-playlist-items">
                  {ENTERPRISE_CONVERSATIONS.playlist.map((item) => {
                    const isSelected = activeVideo.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`enterprise-playlist-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setActiveVideo({
                            ...item,
                            summary: item.summary || item.title,
                            description: item.summary || item.title
                          });
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="enterprise-playlist-thumb-wrap">
                          <img src={item.thumbnail} alt={item.title} />
                          <div className="enterprise-playlist-play-mini">
                            <Play size={10} fill="white" />
                          </div>
                          <span className="enterprise-playlist-time">{item.duration}</span>
                        </div>
                        <div className="enterprise-playlist-details">
                          <span className="enterprise-playlist-series-tag">{item.series}</span>
                          <h5 className="enterprise-playlist-title">{item.title}</h5>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              3. "Innovation" Section
             ══════════════════════════════════════════════ */}
          <section className="enterprise-content-section">
            <div className="enterprise-two-col-layout">
              {/* Featured Left Card */}
              <div 
                className="enterprise-featured-box"
                onClick={() => handleStoryClick(ENTERPRISE_INNOVATION_SECTION.featuredStory)}
              >
                <div className="enterprise-featured-image-box">
                  <img 
                    src={ENTERPRISE_INNOVATION_SECTION.featuredStory.image} 
                    alt={ENTERPRISE_INNOVATION_SECTION.featuredStory.title} 
                    onError={(e) => {
                      if (ENTERPRISE_INNOVATION_SECTION.featuredStory.fallbackImage) {
                        e.target.src = ENTERPRISE_INNOVATION_SECTION.featuredStory.fallbackImage;
                      }
                    }}
                  />
                </div>
                <div className="enterprise-featured-body">
                  <h3 className="enterprise-featured-title">
                    {ENTERPRISE_INNOVATION_SECTION.featuredStory.title}
                  </h3>
                  <div className="enterprise-item-meta-row">
                    <span className="enterprise-source-tag">BY ENTERPRISESTORY</span>
                    <span className="enterprise-meta-dot">•</span>
                    <span className="enterprise-time-tag">4 MIN READ</span>
                    
                    <div className="enterprise-inline-actions">
                      <button 
                        type="button" 
                        onClick={(e) => handleBookmark(e, ENTERPRISE_INNOVATION_SECTION.featuredStory)}
                        className={`enterprise-meta-icon-btn ${isSaved && isSaved(ENTERPRISE_INNOVATION_SECTION.featuredStory.id) ? 'saved' : ''}`}
                        title="Save story"
                      >
                        <Bookmark size={16} fill={isSaved && isSaved(ENTERPRISE_INNOVATION_SECTION.featuredStory.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleShare(e, ENTERPRISE_INNOVATION_SECTION.featuredStory)}
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
                {ENTERPRISE_INNOVATION_SECTION.listStories.map((story) => (
                  <article 
                    key={story.id} 
                    className="enterprise-list-item"
                    onClick={() => handleStoryClick(story)}
                  >
                    <span className="enterprise-red-label">{story.tag || 'LATEST'}</span>
                    <h4 className="enterprise-list-item-title">{story.title}</h4>
                    <div className="enterprise-item-meta-row">
                      <span className="enterprise-source-tag">BY ENTERPRISESTORY</span>
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
              4. "Corporate" Section
             ══════════════════════════════════════════════ */}
          <section className="enterprise-content-section">
            <div className="enterprise-two-col-layout">
              {/* Featured Left Card */}
              <div 
                className="enterprise-featured-box"
                onClick={() => handleStoryClick(ENTERPRISE_CORPORATE_SECTION.featuredStory)}
              >
                <div className="enterprise-featured-image-box">
                  <img 
                    src={ENTERPRISE_CORPORATE_SECTION.featuredStory.image} 
                    alt={ENTERPRISE_CORPORATE_SECTION.featuredStory.title}
                    onError={(e) => {
                      if (ENTERPRISE_CORPORATE_SECTION.featuredStory.fallbackImage) {
                        e.target.src = ENTERPRISE_CORPORATE_SECTION.featuredStory.fallbackImage;
                      }
                    }}
                  />
                </div>
                <div className="enterprise-featured-body">
                  <h3 className="enterprise-featured-title">
                    {ENTERPRISE_CORPORATE_SECTION.featuredStory.title}
                  </h3>
                  <div className="enterprise-item-meta-row">
                    <span className="enterprise-source-tag">BY ENTERPRISESTORY</span>
                    <span className="enterprise-meta-dot">•</span>
                    <span className="enterprise-time-tag">4 MIN READ</span>
                    
                    <div className="enterprise-inline-actions">
                      <button 
                        type="button" 
                        onClick={(e) => handleBookmark(e, ENTERPRISE_CORPORATE_SECTION.featuredStory)}
                        className={`enterprise-meta-icon-btn ${isSaved && isSaved(ENTERPRISE_CORPORATE_SECTION.featuredStory.id) ? 'saved' : ''}`}
                        title="Save story"
                      >
                        <Bookmark size={16} fill={isSaved && isSaved(ENTERPRISE_CORPORATE_SECTION.featuredStory.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleShare(e, ENTERPRISE_CORPORATE_SECTION.featuredStory)}
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
                {ENTERPRISE_CORPORATE_SECTION.listStories.map((story) => (
                  <article 
                    key={story.id} 
                    className="enterprise-list-item"
                    onClick={() => handleStoryClick(story)}
                  >
                    <span className={`enterprise-red-label ${story.tag === 'FINANCIAL RESULTS' ? 'financial' : ''}`}>
                      {story.tag || 'LATEST'}
                    </span>
                    <h4 className="enterprise-list-item-title">{story.title}</h4>
                    <div className="enterprise-item-meta-row">
                      <span className="enterprise-source-tag">BY ENTERPRISESTORY</span>
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
              5. "GCC" Section
             ══════════════════════════════════════════════ */}
          <section className="enterprise-content-section">
            <div className="enterprise-two-col-layout">
              {/* Featured Left Card */}
              <div 
                className="enterprise-featured-box"
                onClick={() => handleStoryClick(ENTERPRISE_GCC_SECTION.featuredStory)}
              >
                <div className="enterprise-featured-image-box">
                  <img 
                    src={ENTERPRISE_GCC_SECTION.featuredStory.image} 
                    alt={ENTERPRISE_GCC_SECTION.featuredStory.title}
                    onError={(e) => {
                      if (ENTERPRISE_GCC_SECTION.featuredStory.fallbackImage) {
                        e.target.src = ENTERPRISE_GCC_SECTION.featuredStory.fallbackImage;
                      }
                    }}
                  />
                </div>
                <div className="enterprise-featured-body">
                  <h3 className="enterprise-featured-title">
                    {ENTERPRISE_GCC_SECTION.featuredStory.title}
                  </h3>
                  <div className="enterprise-item-meta-row">
                    <span className="enterprise-source-tag">BY ENTERPRISESTORY</span>
                    <span className="enterprise-meta-dot">•</span>
                    <span className="enterprise-time-tag">4 MIN READ</span>
                    
                    <div className="enterprise-inline-actions">
                      <button 
                        type="button" 
                        onClick={(e) => handleBookmark(e, ENTERPRISE_GCC_SECTION.featuredStory)}
                        className={`enterprise-meta-icon-btn ${isSaved && isSaved(ENTERPRISE_GCC_SECTION.featuredStory.id) ? 'saved' : ''}`}
                        title="Save story"
                      >
                        <Bookmark size={16} fill={isSaved && isSaved(ENTERPRISE_GCC_SECTION.featuredStory.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleShare(e, ENTERPRISE_GCC_SECTION.featuredStory)}
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
                {ENTERPRISE_GCC_SECTION.listStories.map((story) => (
                  <article 
                    key={story.id} 
                    className="enterprise-list-item"
                    onClick={() => handleStoryClick(story)}
                  >
                    <span className="enterprise-red-label">{story.tag || 'LATEST'}</span>
                    <h4 className="enterprise-list-item-title">{story.title}</h4>
                    <div className="enterprise-item-meta-row">
                      <span className="enterprise-source-tag">BY ENTERPRISESTORY</span>
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
              6. "Interview" Section
             ══════════════════════════════════════════════ */}
          <section className="enterprise-content-section">
            <div className="enterprise-two-col-layout">
              {/* Featured Left Card */}
              <div 
                className="enterprise-featured-box"
                onClick={() => handleStoryClick(ENTERPRISE_INTERVIEW_SECTION.featuredStory)}
              >
                <div className="enterprise-featured-image-box">
                  <img 
                    src={ENTERPRISE_INTERVIEW_SECTION.featuredStory.image} 
                    alt={ENTERPRISE_INTERVIEW_SECTION.featuredStory.title}
                    onError={(e) => {
                      if (ENTERPRISE_INTERVIEW_SECTION.featuredStory.fallbackImage) {
                        e.target.src = ENTERPRISE_INTERVIEW_SECTION.featuredStory.fallbackImage;
                      }
                    }}
                  />
                  <span className="enterprise-es-watermark">ES</span>
                </div>
                <div className="enterprise-featured-body">
                  <h3 className="enterprise-featured-title">
                    {ENTERPRISE_INTERVIEW_SECTION.featuredStory.title}
                  </h3>
                  <div className="enterprise-item-meta-row">
                    <span className="enterprise-source-tag">BY ENTERPRISESTORY</span>
                    <span className="enterprise-meta-dot">•</span>
                    <span className="enterprise-time-tag">5 MIN READ</span>
                    
                    <div className="enterprise-inline-actions">
                      <button 
                        type="button" 
                        onClick={(e) => handleBookmark(e, ENTERPRISE_INTERVIEW_SECTION.featuredStory)}
                        className={`enterprise-meta-icon-btn ${isSaved && isSaved(ENTERPRISE_INTERVIEW_SECTION.featuredStory.id) ? 'saved' : ''}`}
                        title="Save story"
                      >
                        <Bookmark size={16} fill={isSaved && isSaved(ENTERPRISE_INTERVIEW_SECTION.featuredStory.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleShare(e, ENTERPRISE_INTERVIEW_SECTION.featuredStory)}
                        className="enterprise-meta-icon-btn"
                        title="Share story"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right List Column */}
              <div className="enterprise-list-col">
                {ENTERPRISE_INTERVIEW_SECTION.listStories.map((story) => (
                  <article 
                    key={story.id} 
                    className="enterprise-list-item"
                    onClick={() => handleStoryClick(story)}
                  >
                    <span className="enterprise-red-label">{story.tag || 'INTERVIEW'}</span>
                    <h4 className="enterprise-list-item-title">{story.title}</h4>
                    <div className="enterprise-item-meta-row">
                      <span className="enterprise-source-tag">BY ENTERPRISESTORY</span>
                      <span className="enterprise-meta-dot">•</span>
                      <span className="enterprise-time-tag">{story.readTime || '4 MIN READ'}</span>
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

        </main>
      )}

      {/* ── Video Modal for C-Suite Episode ── */}
      {isVideoModalOpen && (
        <div className="modal-overlay" onClick={() => setIsVideoModalOpen(false)}>
          <div 
            className="enterprise-video-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="enterprise-vmodal-header">
              <div>
                <span className="enterprise-vmodal-badge">{activeVideo.series || 'C-SUITE'}</span>
                <h3 className="enterprise-vmodal-title">{activeVideo.title}</h3>
              </div>
              <button 
                type="button" 
                className="enterprise-vmodal-close" 
                onClick={() => setIsVideoModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="enterprise-vmodal-screen">
              <div className="enterprise-interview-split-screen large">
                <div className="enterprise-interview-half left">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80" 
                    alt="Sulajja Firodia Motwani" 
                  />
                  <div className="enterprise-speaker-nameplate">
                    <strong>SULAJJA FIRODIA MOTWANI</strong>
                    <span>FOUNDER &amp; CEO, KINETIC GREEN</span>
                  </div>
                </div>
                <div className="enterprise-interview-half right">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80" 
                    alt="Shradha Sharma" 
                  />
                  <div className="enterprise-speaker-nameplate">
                    <strong>SHRADHA SHARMA</strong>
                    <span>FOUNDER &amp; CEO, YOURSTORY</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="enterprise-vmodal-body">
              <p>{activeVideo.summary || activeVideo.description}</p>
              <div className="enterprise-vmodal-actions">
                <button
                  type="button"
                  className="enterprise-vmodal-btn"
                  onClick={() => {
                    if (onShowToast) onShowToast('Full HD episode stream queued.');
                  }}
                >
                  <Play size={15} fill="currentColor" />
                  <span>Resume Playback</span>
                </button>
                <button
                  type="button"
                  className="enterprise-vmodal-btn secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href).catch(() => {});
                    if (onShowToast) onShowToast('Episode link copied to clipboard!');
                  }}
                >
                  <Share2 size={15} />
                  <span>Share Episode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
