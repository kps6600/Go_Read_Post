import React from 'react';
import { 
  Clock, Bookmark, Share2, ArrowRight
} from 'lucide-react';
import { LEAD_STORY, CAPTABLE_STORIES } from '../data/storiesData';

export default function HeroLeadSection({ 
  leadStory = LEAD_STORY,
  onSelectStory, 
  isSaved, 
  onToggleSave, 
  onShareStory 
}) {
  const currentLead = leadStory || LEAD_STORY;
  const saved = isSaved ? isSaved(currentLead.id || currentLead._id) : false;
  const authorName = currentLead.author?.name || currentLead.authorName || 'Editorial Desk';
  const authorTitle = currentLead.author?.title || currentLead.author?.role || currentLead.authorTitle || 'Staff Reporter';
  const authorAvatar = currentLead.author?.avatar || currentLead.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';
  const categoryLabel = currentLead.categoryLabel || currentLead.categoryTag || currentLead.category || 'SPECIAL REPORT';
  const readTime = currentLead.readTime || currentLead.readingTime || '4 min read';
  const heroImage = currentLead.image || currentLead.heroImage || currentLead.featuredImage?.url || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80';

  return (
    <section className="section-wrapper hero-lead-section">
      <div className="container">

        {/* 2. Main Hero Layout: Cinematic Hero Banner (Left) + CapTable Intelligence Sidebar (Right) */}
        <div className="hero-lead-layout">
          
          {/* Main Cinematic Hero Banner Card */}
          <article 
            className="hero-cinematic-banner"
            onClick={() => onSelectStory(currentLead)}
            role="button"
            tabIndex={0}
          >
            {/* Visual Media with Multi-Layered Overlays */}
            <div className="hero-banner-visual">
              <img 
                src={heroImage} 
                alt={currentLead.title}
                className="hero-banner-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = currentLead.fallbackImage || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80';
                }}
              />
              <div className="hero-banner-gradient-top" />
              <div className="hero-banner-gradient-base" />

              {/* Top Floating Badge */}
              <div className="hero-floating-badges">
                <span className="hero-lead-pill">Front Page Lead</span>
              </div>
            </div>

            {/* Hero Text & Narrative Content */}
            <div className="hero-banner-content">
              {/* Meta Kicker Row */}
              <div className="hero-meta-row">
                <div className="hero-kicker-tag">
                  <span className="kicker-square">■</span>
                  <span className="kicker-label">{categoryLabel}</span>
                </div>

                <span className="hero-dot-sep">•</span>

                <span className="hero-read-pill">
                  <Clock size={13} className="meta-clock" />
                  <span>{readTime}</span>
                </span>

                <span className="hero-dot-sep">•</span>

                <span className="hero-date-text">{currentLead.publishedAt || 'Today'}</span>
              </div>

              {/* Majestic Headline */}
              <h1 className="hero-banner-title">{currentLead.title}</h1>

              {/* Hero Footer: Author Chip & Action Controls */}
              <div className="hero-banner-footer" onClick={(e) => e.stopPropagation()}>
                <div className="hero-author-box">
                  <img 
                    src={authorAvatar} 
                    alt={authorName} 
                    className="hero-author-avatar"
                  />
                  <div className="hero-author-info">
                    <span className="hero-author-name">{authorName}</span>
                    <span className="hero-author-role">{authorTitle}</span>
                  </div>
                </div>

                <div className="hero-actions-cluster">
                  <button 
                    type="button"
                    className="hero-read-btn"
                    onClick={() => onSelectStory(currentLead)}
                  >
                    <span>Read Story</span>
                    <ArrowRight size={14} className="hero-btn-arrow" />
                  </button>

                  <button 
                    type="button"
                    className={`hero-action-circle-btn ${saved ? 'active' : ''}`}
                    onClick={() => onToggleSave(currentLead)}
                    title={saved ? "Remove bookmark" : "Save for later"}
                    aria-label="Bookmark story"
                  >
                    <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                  </button>

                  <button 
                    type="button"
                    className="hero-action-circle-btn"
                    onClick={() => onShareStory(currentLead)}
                    title="Share story"
                    aria-label="Share story"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Right Column: The CapTable Exclusives Dossier */}
          <aside className="captable-sidebar">
            <div className="captable-header">
              <div 
                className="captable-brand-box"
                onClick={() => window.open('https://the-captable.com/', '_blank', 'noopener,noreferrer')}
                style={{ cursor: 'pointer' }}
                title="Visit The CapTable (the-captable.com)"
              >
                <span className="exclusive-badge">EXCLUSIVE</span>
                <h3 className="captable-header-title">The CapTable</h3>
              </div>
              <div 
                className="captable-header-label-box" 
                onClick={() => window.open('https://the-captable.com/', '_blank', 'noopener,noreferrer')}
                role="button"
                tabIndex={0}
                title="Visit The CapTable (the-captable.com)"
              >
                <span className="captable-header-label">Deep Dives</span>
                <ArrowRight size={15} className="captable-header-arrow" />
              </div>
            </div>

            <div className="captable-panel">
              <div className="captable-list">
                {CAPTABLE_STORIES.map((story, idx) => (
                  <article 
                    key={story.id}
                    className="captable-item-card"
                    onClick={() => onSelectStory(story)}
                  >
                    <div className="captable-content">
                      <div className="captable-row-top">
                        <span className="captable-rank-number">0{idx + 1}</span>
                        <h4 className="captable-item-title">
                          {story.title}
                        </h4>
                      </div>
                      <div className="captable-item-meta">
                        <span>{story.publishedAt}</span>
                        <span className="meta-sep">•</span>
                        <span>{story.readTime}</span>
                      </div>
                    </div>

                    <div className="captable-thumb-wrapper">
                      <img 
                        src={story.image || (typeof story.featuredImage === 'string' ? story.featuredImage : story.featuredImage?.url) || story.fallbackImage || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80'} 
                        alt={story.title}
                        className="captable-thumb-img"
                        onError={(e) => {
                          const fb = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80';
                          if (e.target.src !== fb) {
                            e.target.src = fb;
                          }
                        }}
                        loading="lazy"
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div 
                className="captable-panel-footer"
                onClick={() => window.open('https://the-captable.com/', '_blank', 'noopener,noreferrer')}
                role="button"
                tabIndex={0}
                title="Visit The CapTable (the-captable.com)"
              >
                <span>Explore all CapTable stories</span>
                <ArrowRight size={16} className="panel-footer-arrow" />
              </div>
            </div>
          </aside>

        </div>

      </div>
    </section>
  );
}
