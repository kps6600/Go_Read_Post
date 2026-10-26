import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Search, Bookmark, Share2, Sparkles, 
  Cpu, Bot, Zap, ArrowRight, Check, X, Terminal,
  TrendingUp, Newspaper, ChevronRight, ChevronLeft, Clock
} from 'lucide-react';
import { NewsletterService } from '../services/newsletterService';

const SUB_TOPICS = [
  'All',
  'Generative AI',
  'LLMs & Models',
  'Enterprise AI',
  'Robotics & Automation',
  'AI Chips & Compute'
];

export default function AIStoryPage({
  aiStories = [],
  onSelectStory,
  isSaved,
  onToggleSave,
  onShareStory,
  onBackToHome
}) {
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 6;

  // Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Top featured sliding stories (top 4 stories)
  const slidingFeaturedStories = useMemo(() => {
    if (aiStories && aiStories.length > 0) {
      return aiStories.slice(0, Math.min(4, aiStories.length));
    }
    return [];
  }, [aiStories]);

  const nextSlide = () => {
    if (slidingFeaturedStories.length > 0) {
      setActiveSlide((prev) => (prev + 1) % slidingFeaturedStories.length);
    }
  };

  const prevSlide = () => {
    if (slidingFeaturedStories.length > 0) {
      setActiveSlide((prev) => (prev - 1 + slidingFeaturedStories.length) % slidingFeaturedStories.length);
    }
  };

  // Autoplay slider every 5.5s (pauses on hover)
  useEffect(() => {
    if (isHovered || slidingFeaturedStories.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slidingFeaturedStories.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered, slidingFeaturedStories.length]);

  // Touch swipe support
  const minSwipeDistance = 45;
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  // Filter stories based on topic and search query
  const filteredStories = useMemo(() => {
    return aiStories.filter(story => {
      // Topic filter
      if (selectedTopic !== 'All') {
        const matchesTopic = 
          story.subTopic === selectedTopic ||
          story.categoryTag?.toLowerCase().includes(selectedTopic.toLowerCase()) ||
          story.title.toLowerCase().includes(selectedTopic.toLowerCase());
        if (!matchesTopic) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = story.title.toLowerCase().includes(q);
        const matchSummary = (story.summary || '').toLowerCase().includes(q);
        const matchTag = (story.categoryTag || '').toLowerCase().includes(q);
        const matchAuthor = (story.author?.name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchTag && !matchAuthor) return false;
      }

      return true;
    });
  }, [aiStories, selectedTopic, searchQuery]);

  // Stories for grid (skip lead if showing All and no search, or show filtered)
  const gridStories = useMemo(() => {
    if (selectedTopic === 'All' && !searchQuery.trim() && filteredStories.length > 1) {
      return filteredStories.slice(1);
    }
    return filteredStories;
  }, [filteredStories, selectedTopic, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(gridStories.length / storiesPerPage));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * storiesPerPage;
  const currentStories = gridStories.slice(startIndex, startIndex + storiesPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      try {
        await NewsletterService.subscribe({
          email: newsletterEmail.trim(),
          publications: ['DeepTech & Indic AI Wire'],
          source: 'ai_story_page'
        });
      } catch (err) {
        console.warn('Subscription error:', err.message);
      }
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="ai-story-page-wrapper">
      <div className="container">
        
        {/* Top Breadcrumb Navigation */}
        <nav className="ai-breadcrumb" aria-label="Breadcrumb">
          <button 
            type="button" 
            className="ai-breadcrumb-back"
            onClick={onBackToHome}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </button>
          <span className="ai-breadcrumb-sep">/</span>
          <span className="ai-breadcrumb-muted">Brands</span>
          <span className="ai-breadcrumb-sep">/</span>
          <span className="ai-breadcrumb-current">AI Story</span>
        </nav>

        {/* Filter Toolbar: Sub-Topics + In-Hub Search Omnibar */}
        <section className="ai-filter-toolbar">
          <div className="ai-topic-pills">
            {SUB_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                className={`ai-topic-pill ${selectedTopic === topic ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCurrentPage(1);
                }}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="ai-search-box">
            <Search size={15} className="ai-search-icon" />
            <input 
              type="text"
              placeholder="Search AI models, startups, talent..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="ai-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="ai-clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </section>

        {/* Featured Sliding Cards (Displayed on All Stories tab without active search) */}
        {selectedTopic === 'All' && !searchQuery.trim() && slidingFeaturedStories.length > 0 && (
          <section className="ai-featured-section">
            <div 
              className="ai-slider-wrapper"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Sliding Track */}
              <div 
                className="ai-slider-track"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {slidingFeaturedStories.map((story, index) => (
                  <div key={story.id || index} className="ai-slide-item">
                    <article 
                      className="ai-featured-card"
                      onClick={() => onSelectStory(story)}
                    >
                      <div className="ai-featured-media">
                        <img 
                          src={story.image} 
                          alt={story.title} 
                          className="ai-featured-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = story.fallbackImage;
                          }}
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                        <div className="ai-slide-badges">
                          <span className="ai-featured-tag">LEAD STORY</span>
                          <span className="ai-slide-counter-badge">
                            0{index + 1} / 0{slidingFeaturedStories.length}
                          </span>
                        </div>
                      </div>

                      <div className="ai-featured-content">
                        {/* 1. Header Meta Bar */}
                        <div className="ai-card-meta-top">
                          <span className="ai-card-date">
                            <Clock size={12} className="ai-meta-clock-icon" />
                            {story.formattedDate || story.publishedAt}
                          </span>
                          <span className="ai-meta-bullet">•</span>
                          <span className="ai-card-readtime">{story.readTime}</span>
                          {story.subTopic && (
                            <span className="ai-card-subtopic-tag">{story.subTopic}</span>
                          )}
                        </div>

                        {/* 2. Main Headline */}
                        <h2 className="ai-featured-title">{story.title}</h2>

                        {/* 3. Editorial Subtitle / Excerpt */}
                        <p className="ai-featured-subtitle">{story.subtitle}</p>

                        {/* 4. Executive Brief Box (Fills empty space with high-value intelligence) */}
                        {story.summary && (
                          <div className="ai-featured-brief-box">
                            <p className="ai-brief-content">{story.summary}</p>
                          </div>
                        )}

                        {/* 5. Footer: Author Info & Action Buttons */}
                        <div className="ai-featured-footer">
                          <div className="ai-author-info">
                            <img 
                              src={story.author?.avatar} 
                              alt={story.author?.name} 
                              className="ai-author-avatar" 
                            />
                            <div>
                              <div className="ai-author-name">{story.author?.name}</div>
                              <div className="ai-author-title">{story.author?.title || 'Editorial Desk'}</div>
                            </div>
                          </div>

                          <div className="ai-card-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                              type="button"
                              className="ai-read-full-btn"
                              onClick={() => onSelectStory(story)}
                              title="Read full article"
                            >
                              <span>Read Story</span>
                              <ArrowRight size={13} />
                            </button>
                            <button 
                              type="button"
                              className={`ai-action-btn ${isSaved && isSaved(story.id) ? 'active' : ''}`}
                              onClick={() => onToggleSave(story)}
                              title={isSaved && isSaved(story.id) ? "Remove bookmark" : "Save article"}
                              aria-label="Save story"
                            >
                              <Bookmark size={15} fill={isSaved && isSaved(story.id) ? "currentColor" : "none"} />
                            </button>
                            <button 
                              type="button"
                              className="ai-action-btn"
                              onClick={() => onShareStory(story)}
                              title="Share article"
                              aria-label="Share story"
                            >
                              <Share2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>

              {/* Prev / Next Slider Navigation Arrows */}
              {slidingFeaturedStories.length > 1 && (
                <>
                  <button 
                    type="button"
                    className="ai-slider-nav-btn prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    aria-label="Previous story slide"
                    title="Previous story"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button 
                    type="button"
                    className="ai-slider-nav-btn next"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    aria-label="Next story slide"
                    title="Next story"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Slider Pagination Dots & Autoplay Indicator */}
                  <div className="ai-slider-pagination" onClick={(e) => e.stopPropagation()}>
                    {slidingFeaturedStories.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        className={`ai-slider-dot ${activeSlide === dotIdx ? 'active' : ''}`}
                        onClick={() => setActiveSlide(dotIdx)}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Section Header: Stories Count & Active Topic */}
        <div className="ai-feed-header">
          <div className="ai-feed-title-wrap">
            <h2 className="ai-feed-title">
              {selectedTopic === 'All' ? 'Latest AI Stories & Deep Dives' : `${selectedTopic} Intelligence`}
            </h2>
            <span className="ai-feed-count">
              Showing <strong>{filteredStories.length}</strong> {filteredStories.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {(selectedTopic !== 'All' || searchQuery) && (
            <button 
              type="button" 
              className="ai-reset-filters-btn"
              onClick={() => {
                setSelectedTopic('All');
                setSearchQuery('');
                setCurrentPage(1);
              }}
            >
              Reset to All
            </button>
          )}
        </div>

        {/* Stories Grid */}
        {currentStories.length === 0 ? (
          <div className="ai-empty-state">
            <Bot size={44} className="ai-empty-icon" />
            <h3>No AI stories found matching your criteria</h3>
            <p>Try searching for terms like "LLM", "Sarvam", "Robotics", or clear the current topic filter.</p>
            <button 
              type="button"
              className="editorial-action-btn"
              onClick={() => {
                setSelectedTopic('All');
                setSearchQuery('');
                setCurrentPage(1);
              }}
            >
              View All AI Stories
            </button>
          </div>
        ) : (
          <div className="ai-stories-grid">
            {currentStories.map((story) => {
              const saved = isSaved ? isSaved(story.id) : false;
              const displayDate = story.formattedDate || '10/01/2026';
              const displayTag = story.categoryTag || story.subTopic || 'AI & DEEPTECH';

              return (
                <article 
                  key={story.id} 
                  className="ai-story-card"
                  onClick={() => onSelectStory(story)}
                >
                  {/* Card Media */}
                  <div className="ai-card-media-box">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="ai-card-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = story.fallbackImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                      }}
                      loading="lazy"
                    />
                    <span className="ai-card-watermark">AI</span>
                  </div>

                  {/* Card Body */}
                  <div className="ai-card-body">
                    <div className="ai-card-meta-line">
                      <span className="ai-card-badge">{displayTag}</span>
                      <span className="ai-card-date">{displayDate}</span>
                    </div>

                    <h3 className="ai-card-title">{story.title}</h3>
                    <p className="ai-card-summary">{story.summary}</p>

                    {/* Card Footer */}
                    <div className="ai-card-footer">
                      <div className="ai-author-row">
                        {story.author?.avatar && (
                          <img 
                            src={story.author.avatar} 
                            alt={story.author.name} 
                            className="ai-author-small-img" 
                          />
                        )}
                        <span className="ai-author-small-name">{story.author?.name || 'AI Bureau'}</span>
                      </div>

                      <div className="ai-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button"
                          className={`ai-action-btn ${saved ? 'active' : ''}`}
                          onClick={() => onToggleSave(story)}
                          title={saved ? "Remove bookmark" : "Save article"}
                          aria-label="Save story"
                        >
                          <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
                        </button>
                        <button 
                          type="button"
                          className="ai-action-btn"
                          onClick={() => onShareStory(story)}
                          title="Share article"
                          aria-label="Share story"
                        >
                          <Share2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="ai-pagination-container">
            <button
              type="button"
              className="ai-page-btn nav-btn"
              disabled={validPage === 1}
              onClick={() => handlePageChange(validPage - 1)}
            >
              Previous
            </button>

            <div className="ai-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`ai-page-number-btn ${pageNum === validPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="ai-page-btn nav-btn"
              disabled={validPage === totalPages}
              onClick={() => handlePageChange(validPage + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* AI Story Dispatch Newsletter Banner */}
        <section className="ai-newsletter-card">
          <div className="ai-newsletter-content">
            <h3 className="ai-newsletter-title">Stay at the forefront of the AI transformation</h3>
            <p className="ai-newsletter-desc">
              Get our curated weekly briefing covering breakthrough foundational models, sovereign compute deployments, enterprise case studies, and interviews with pioneering AI founders.
            </p>
            
            {newsletterSubscribed ? (
              <div className="ai-newsletter-success">
                <Check size={18} />
                <span>You are subscribed to the AI Story Dispatch. Welcome aboard!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="ai-newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your work email address..." 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="ai-newsletter-input"
                />
                <button type="submit" className="ai-newsletter-submit-btn">
                  <span>Subscribe Now</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
