import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Bookmark, Share2, ChevronRight, Clock,
  ArrowRight, Check, X, Mail
} from 'lucide-react';
import { NewsletterService } from '../services/newsletterService';

import {
  SOCIAL_SUB_NAV,
  SOCIAL_HERO_STORY,
  SOCIAL_HERO_SIDEBAR_STORIES,
  SOCIAL_GRID_STORIES,
  SOCIAL_LATEST_STORIES,
  SOCIAL_EXPERT_OPINION_STORIES
} from '../data/socialStoryData';

export default function SocialStoryPage({
  onSelectStory,
  isSaved,
  onToggleSave,
  onShareStory,
  onBackToHome,
  onShowToast,
  onOpenAuthModal,
  customStories = []
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const baseStories = useMemo(() => {
    if (customStories && customStories.length > 0) {
      const existingIds = new Set(customStories.map(s => s.id || s._id));
      const fallback = SOCIAL_GRID_STORIES.filter(s => !existingIds.has(s.id));
      return [...customStories, ...fallback];
    }
    return SOCIAL_GRID_STORIES;
  }, [customStories]);

  const heroStory = (customStories && customStories.length > 0 ? customStories[0] : null) || SOCIAL_HERO_STORY;

  const filteredGridStories = useMemo(() => {
    return baseStories.filter(item => {
      if (activeTab !== 'all') {
        const matchesTab =
          (item.categoryTag && item.categoryTag.toLowerCase().includes(activeTab.toLowerCase())) ||
          (item.subTopic && item.subTopic.toLowerCase().includes(activeTab.toLowerCase())) ||
          (item.tag && item.tag.toLowerCase().includes(activeTab.toLowerCase()));
        if (!matchesTab) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(q) &&
          !item.tag.toLowerCase().includes(q) &&
          !item.author.name.toLowerCase().includes(q) &&
          !item.summary.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      try {
        await NewsletterService.subscribe({
          email: newsletterEmail.trim(),
          publications: ['The Sunday Read'],
          source: 'social_story_page'
        });
      } catch (err) {
        console.warn('Subscription error:', err.message);
      }
      setNewsletterSubmitted(true);
      if (onShowToast) onShowToast('✓ Subscribed to SocialStory Weekly!');
      setNewsletterEmail('');
    }
  };

  const handleStoryClick = (story) => {
    if (onSelectStory) {
      onSelectStory({
        id: story.id,
        title: story.title,
        subtitle: story.excerpt || story.summary,
        summary: story.excerpt || story.summary,
        categoryLabel: story.tag || story.categoryTag || 'SocialStory',
        category: 'social-story',
        image: story.image,
        fallbackImage: story.fallbackImage,
        readTime: story.readTime,
        publishedAt: story.publishedAt,
        author: story.author,
        content: story.content || [story.summary]
      });
    }
  };

  return (
    <div className="ssp-wrapper">
      <div className="container">

        {/* ── Breadcrumb ─────────────────────────────── */}
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
          <span className="ssp-crumb-current">SocialStory</span>
        </nav>

        {/* ── Filter Pills + Search ──────────────────── */}
        <section className="ssp-filter-bar">
          <div className="ssp-topic-pills">
            {SOCIAL_SUB_NAV.map((nav) => (
              <button
                key={nav.id}
                type="button"
                className={`ssp-topic-pill ${activeTab === nav.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(nav.id); setSearchQuery(''); }}
              >
                {nav.label}
              </button>
            ))}
          </div>

          <div className="ssp-search-box">
            <Search size={14} className="ssp-search-icon" />
            <input
              type="text"
              placeholder="Search stories, topics, authors…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ssp-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="ssp-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </section>

        {/* ── Hero 2-Column Layout ───────────────────── */}
        {activeTab === 'all' && !searchQuery.trim() && (
          <section className="ssp-hero-section">

            {/* Left: Main Feature Card */}
            <article
              className="ssp-hero-main"
              onClick={() => handleStoryClick(heroStory)}
            >
              <div className="ssp-hero-media">
                <img
                  src={heroStory.image || heroStory.banner || heroStory.coverImage}
                  alt={heroStory.title}
                  className="ssp-hero-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = heroStory.fallbackImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'; }}
                />
                <div className="ssp-hero-overlay" />
                <span className="ssp-hero-badge">{heroStory.tag || heroStory.categoryLabel || 'Social Impact'}</span>
              </div>
              <div className="ssp-hero-body">
                <h2 className="ssp-hero-title">{heroStory.title}</h2>
                <p className="ssp-hero-excerpt">{heroStory.excerpt || heroStory.summary || heroStory.subtitle}</p>
                <div className="ssp-card-footer">
                  <div className="ssp-author-row">
                    <img
                      src={heroStory.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={heroStory.author?.name || 'Editorial Team'}
                      className="ssp-author-avatar"
                    />
                    <div className="ssp-author-info">
                      <span className="ssp-author-name">{heroStory.author?.name || 'Editorial Bureau'}</span>
                      <span className="ssp-meta-dot">·</span>
                      <span className="ssp-read-time">
                        <Clock size={11} />
                        {heroStory.readTime || '4 min read'}
                      </span>
                    </div>
                  </div>
                  <div className="ssp-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`ssp-icon-btn ${isSaved && isSaved(heroStory.id || heroStory._id) ? 'saved' : ''}`}
                      onClick={() => onToggleSave && onToggleSave(heroStory)}
                      title="Bookmark"
                    >
                      <Bookmark size={14} fill={isSaved && isSaved(heroStory.id || heroStory._id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      className="ssp-icon-btn"
                      onClick={() => onShareStory && onShareStory(heroStory)}
                      title="Share"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Right: 3 Sidebar Cards */}
            <aside className="ssp-hero-sidebar">
              {SOCIAL_HERO_SIDEBAR_STORIES.map((item, idx) => {
                const saved = isSaved ? isSaved(item.id) : false;
                return (
                  <article
                    key={item.id}
                    className={`ssp-sidebar-item ${idx < SOCIAL_HERO_SIDEBAR_STORIES.length - 1 ? 'with-divider' : ''}`}
                    onClick={() => handleStoryClick(item)}
                  >
                    <div className="ssp-sidebar-thumb-wrap">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="ssp-sidebar-thumb"
                        onError={(e) => { e.target.onerror = null; e.target.src = item.fallbackImage; }}
                        loading="lazy"
                      />
                    </div>
                    <div className="ssp-sidebar-body">
                      <span className="ssp-sidebar-tag">{item.tag}</span>
                      <h3 className="ssp-sidebar-title">{item.shortTitle || item.title}</h3>
                      <div className="ssp-sidebar-meta">
                        <span className="ssp-author-name">{item.author.name}</span>
                        <span className="ssp-meta-dot">·</span>
                        <span className="ssp-read-time">
                          <Clock size={11} />
                          {item.readTime}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </aside>

          </section>
        )}

        {/* ── Active Filter Notice ───────────────────── */}
        {(activeTab !== 'all' || searchQuery.trim()) && (
          <div className="ssp-filter-notice">
            <span>
              {searchQuery.trim()
                ? <>Results for "<strong>{searchQuery}</strong>"</>
                : <>Category: <strong>{SOCIAL_SUB_NAV.find(t => t.id === activeTab)?.label}</strong></>}
              &nbsp;·&nbsp; {filteredGridStories.length} stories
            </span>
            <button
              type="button"
              className="ssp-reset-btn"
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
            >
              Show all
            </button>
          </div>
        )}

        {/* ── 6-Card Story Grid ──────────────────────── */}
        <section className="ssp-grid-section">
          {activeTab === 'all' && !searchQuery.trim() && (
            <div className="ssp-section-header">
              <h2 className="ssp-section-title">Featured Stories</h2>
              <p className="ssp-section-subtitle">Impact journalism across India and Asia</p>
            </div>
          )}
          <div className="ssp-story-grid">
            {filteredGridStories.map((card) => {
              const cardSaved = isSaved ? isSaved(card.id) : false;
              return (
                <article
                  key={card.id}
                  className="ssp-story-card"
                  onClick={() => handleStoryClick(card)}
                >
                  <div className="ssp-story-media">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="ssp-story-img"
                      onError={(e) => { e.target.onerror = null; e.target.src = card.fallbackImage; }}
                      loading="lazy"
                    />
                    <span className="ssp-story-tag">{card.tag}</span>
                  </div>
                  <div className="ssp-story-body">
                    <h3 className="ssp-story-title">{card.title}</h3>
                    <p className="ssp-story-excerpt">{card.summary}</p>
                    <div className="ssp-card-footer">
                      <div className="ssp-author-row">
                        <img
                          src={card.author.avatar}
                          alt={card.author.name}
                          className="ssp-author-avatar"
                        />
                        <div className="ssp-author-info">
                          <span className="ssp-author-name">{card.author.name}</span>
                          <span className="ssp-meta-dot">·</span>
                          <span className="ssp-read-time">
                            <Clock size={11} />
                            {card.readTime}
                          </span>
                        </div>
                      </div>
                      <div className="ssp-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`ssp-icon-btn ${cardSaved ? 'saved' : ''}`}
                          onClick={() => onToggleSave && onToggleSave(card)}
                          title={cardSaved ? 'Saved' : 'Save'}
                        >
                          <Bookmark size={13} fill={cardSaved ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          className="ssp-icon-btn"
                          onClick={() => onShareStory && onShareStory(card)}
                          title="Share"
                        >
                          <Share2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {filteredGridStories.length === 0 && (
            <div className="ssp-empty-state">
              <p>No stories found. <button type="button" onClick={() => { setActiveTab('all'); setSearchQuery(''); }}>Reset filters</button></p>
            </div>
          )}
        </section>

        {/* ── Latest Stories ─────────────────────────── */}
        {activeTab === 'all' && !searchQuery.trim() && (
          <section className="ssp-latest-section">
            <div className="ssp-section-header">
              <div>
                <h2 className="ssp-section-title">Latest Stories</h2>
                <p className="ssp-section-subtitle">Published stories, interviews, and updates on SocialStory</p>
              </div>
              <button type="button" className="ssp-see-all-btn">
                See all <ChevronRight size={15} />
              </button>
            </div>
            <div className="ssp-three-col-grid">
              {SOCIAL_LATEST_STORIES.map((item) => (
                <article
                  key={item.id}
                  className="ssp-compact-card"
                  onClick={() => handleStoryClick(item)}
                >
                  <div className="ssp-compact-media">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="ssp-compact-img"
                      onError={(e) => { e.target.onerror = null; e.target.src = item.fallbackImage; }}
                      loading="lazy"
                    />
                    <span className="ssp-compact-tag">{item.tag}</span>
                  </div>
                  <div className="ssp-compact-body">
                    <h3 className="ssp-compact-title">{item.shortTitle || item.title}</h3>
                    <div className="ssp-compact-footer">
                      <span className="ssp-author-name">{item.author.name}</span>
                      <span className="ssp-meta-dot">·</span>
                      <span className="ssp-read-time">
                        <Clock size={11} />
                        {item.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Newsletter Banner ──────────────────────── */}
        {activeTab === 'all' && !searchQuery.trim() && (
          <section className="ssp-newsletter-section">
            <div className="ssp-newsletter-inner">
              <div className="ssp-nl-icon-wrap" aria-hidden="true">
                <Mail size={22} />
              </div>
              <div className="ssp-nl-text">
                <h2 className="ssp-nl-title">Join our newsletter</h2>
                <p className="ssp-nl-desc">
                  Sign up to receive your weekly brief of top impactful stories from India and Asia.
                </p>
              </div>
              <div className="ssp-nl-form-wrap">
                {newsletterSubmitted ? (
                  <div className="ssp-nl-success">
                    <Check size={15} />
                    <span>You're subscribed!</span>
                  </div>
                ) : (
                  <form className="ssp-nl-form" onSubmit={handleNewsletterSubmit}>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="ssp-nl-input"
                      required
                    />
                    <button type="submit" className="ssp-nl-submit">
                      Subscribe
                      <ArrowRight size={14} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Expert Opinion ─────────────────────────── */}
        {activeTab === 'all' && !searchQuery.trim() && (
          <section className="ssp-latest-section">
            <div className="ssp-section-header">
              <div>
                <h2 className="ssp-section-title">Expert Opinion</h2>
                <p className="ssp-section-subtitle">Thought leaders and subject matter experts across sectors</p>
              </div>
              <button type="button" className="ssp-see-all-btn">
                See all <ChevronRight size={15} />
              </button>
            </div>
            <div className="ssp-three-col-grid">
              {SOCIAL_EXPERT_OPINION_STORIES.map((item) => (
                <article
                  key={item.id}
                  className="ssp-compact-card"
                  onClick={() => handleStoryClick(item)}
                >
                  <div className="ssp-compact-media">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="ssp-compact-img"
                      onError={(e) => { e.target.onerror = null; e.target.src = item.fallbackImage; }}
                      loading="lazy"
                    />
                    <span className="ssp-compact-tag">{item.tag}</span>
                  </div>
                  <div className="ssp-compact-body">
                    <h3 className="ssp-compact-title">{item.shortTitle || item.title}</h3>
                    <div className="ssp-compact-footer">
                      <span className="ssp-author-name">{item.author.name}</span>
                      <span className="ssp-meta-dot">·</span>
                      <span className="ssp-read-time">
                        <Clock size={11} />
                        {item.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
