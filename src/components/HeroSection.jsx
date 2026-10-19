import React from 'react';
import { Clock, Heart, Bookmark, Share2, TrendingUp } from 'lucide-react';

export default function HeroSection({ 
  heroStory, 
  topPicks, 
  onSelectStory, 
  isSaved, 
  onToggleSave,
  onShareStory
}) {
  if (!heroStory) return null;

  return (
    <section className="section-wrapper" style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
      <div className="container">
        <div className="hero-grid">
          {/* Main Hero Featured Story */}
          <article 
            className="hero-main-card" 
            onClick={() => onSelectStory(heroStory)}
          >
            <div className="hero-media-wrapper">
              <span className="hero-tag-badge">
                Lead Story
              </span>
              <img 
                src={heroStory.image} 
                alt={heroStory.title}
                className="hero-media-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = heroStory.fallbackImage;
                }}
              />
            </div>

            <div className="hero-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <span className="card-tag">{heroStory.categoryLabel}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> {heroStory.readTime}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{heroStory.publishedAt}</span>
              </div>

              <h1 className="hero-title">{heroStory.title}</h1>
              <p className="hero-subtitle">{heroStory.subtitle}</p>

              {/* Story Meta & Controls */}
              <div className="story-meta" onClick={(e) => e.stopPropagation()}>
                <div className="author-chip">
                  <img 
                    src={heroStory.author.avatar} 
                    alt={heroStory.author.name} 
                    className="author-avatar"
                  />
                  <div>
                    <div className="author-name">{heroStory.author.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{heroStory.author.title}</div>
                  </div>
                </div>

                <div className="actions-row">
                  <button 
                    className={`card-action-btn ${isSaved(heroStory.id) ? 'active' : ''}`}
                    onClick={() => onToggleSave(heroStory)}
                    title="Bookmark Story"
                  >
                    <Bookmark size={15} fill={isSaved(heroStory.id) ? 'currentColor' : 'none'} />
                    <span>{isSaved(heroStory.id) ? 'Saved' : 'Save'}</span>
                  </button>

                  <button 
                    className="card-action-btn"
                    onClick={() => onShareStory(heroStory)}
                    title="Share Story"
                  >
                    <Share2 size={15} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar Top Picks */}
          <aside className="hero-sidebar">
            <div className="sidebar-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="var(--brand-primary)" />
                <span>Top Picks</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Must Read
              </span>
            </div>

            <div className="picks-list">
              {topPicks.map((pick) => (
                <div 
                  key={pick.id} 
                  className="pick-card"
                  onClick={() => onSelectStory(pick)}
                >
                  <img 
                    src={pick.image} 
                    alt={pick.title}
                    className="pick-thumb"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = pick.fallbackImage;
                    }}
                  />
                  <div className="pick-content">
                    <div>
                      <span className="pick-category">{pick.categoryLabel}</span>
                      <h3 className="pick-title">{pick.title}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        <span>{pick.publishedAt}</span>
                        <span>•</span>
                        <span>{pick.readTime}</span>
                      </div>
                      <button 
                        type="button"
                        className={`pick-save-btn ${isSaved && isSaved(pick.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(pick);
                        }}
                        title={isSaved && isSaved(pick.id) ? 'Remove bookmark' : 'Save story'}
                        aria-label="Save story"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isSaved && isSaved(pick.id) ? '#ea580c' : 'var(--text-muted)',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Bookmark size={13} fill={isSaved && isSaved(pick.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
