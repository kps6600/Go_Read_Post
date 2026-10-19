import React, { useState, useRef } from 'react';
import { Play, Tv, Eye, ArrowUpRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { CONVERSATIONS_SHOWS } from '../data/storiesData';
import conversationsLogoLight from '../assets/conversations_full_logo@2x.png';
import conversationsLogoDark from '../assets/conversations_full_logo_dark@2x.png';
import cynlrThumb from '../assets/cynlr_thumb.png';

const HERO_CONVERSATIONS = [
  {
    id: 'conv-hero-1',
    brand: 'GoReadPost Originals',
    title: 'Race to Give Machines Human-Like Intelligence | Can India Build Robots That Think, Learn & Adapt?',
    summary: "Inside Cynlr's mission to give robotic arms visual intelligence, real-time depth sensing, and human-like intuitive dexterity for next-gen manufacturing.",
    image: cynlrThumb,
    fallbackImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    host: 'TechSparks Studio',
    series: 'The Spark Series',
    duration: '18:45',
    views: '145K'
  },
  {
    id: 'conv-hero-2',
    brand: 'GoReadPost Originals',
    title: 'Agnikul’s Big Bet to Make Rockets Reusable and Turn Them Into Space Platforms',
    summary: 'Inside Agnikul Cosmos mission to revolutionize small satellite launches with 3D-printed single-piece engines and mobile launchpads.',
    image: 'https://images.yourstory.com/cs/2/1a70b4f0170611edbdd8b5d28d859895/Untitleddesign-2026-07-24T150110-1784885793428.jpg?mode=min&ar=16%3A9&format=auto&w=1200&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1517976487504-59a1a08420e7?w=800&auto=format&fit=crop&q=80',
    host: 'Frontier Tech Bureau',
    series: 'The Spark Series',
    duration: '24:10',
    views: '220K'
  },
  {
    id: 'conv-hero-3',
    brand: 'GoReadPost Originals',
    title: 'AI Agents Will Change Everything: Pramod Varma on reimagining value exchange for the intelligent era',
    summary: 'Beckn and Aadhaar chief architect Pramod Varma breaks down how autonomous agent networks will reshape commerce, fintech, and digital public infrastructure.',
    image: 'https://images.yourstory.com/cs/2/21ccd920843c11ec88170b5512a0f9d5/2XElasticONHackathon800x400px-1789632852735.jpg?mode=fit&crop=faces&ar=16%3A9&format=auto&w=1200&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    host: 'Disruptor Dialogues',
    series: 'Future of Tech',
    duration: '35:15',
    views: '310K'
  },
  {
    id: 'conv-hero-4',
    brand: 'GoReadPost Originals',
    title: 'How a 28-Year-Old Team Built India’s First Private Orbital Rocket',
    summary: 'Skyroot Aerospace co-founders discuss building Vikram-S from scratch, navigating ISRO partnerships, and scaling private spacetech.',
    image: 'https://images.yourstory.com/cs/series/Masseffect-01-1733232506337.png?mode=crop&ar=1%3A1&format=auto&w=1200&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    host: 'Spacetech Desk',
    series: 'The Mass Effect',
    duration: '28:50',
    views: '190K'
  },
  {
    id: 'conv-hero-5',
    brand: 'GoReadPost Originals',
    title: 'AI, Skills & Opportunity: India\'s Blueprint for the Next Decade of Frontier Tech',
    summary: 'Exclusive fireside addressing AI disruption, global talent mobility, vocational training, and preparing young founders for frontier industry roles.',
    image: 'https://images.yourstory.com/cs/series/1000068554-1755856651167.jpg?mode=crop&ar=1%3A1&format=auto&w=1200&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    host: 'Policy Conclave',
    series: 'In Conversation',
    duration: '21:30',
    views: '165K'
  }
];

export default function ConversationsSection({ onSelectVideo }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const seriesScrollRef = useRef(null);

  const activeStory = HERO_CONVERSATIONS[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? HERO_CONVERSATIONS.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === HERO_CONVERSATIONS.length - 1 ? 0 : prev + 1));
  };

  const scrollSeries = (direction) => {
    if (seriesScrollRef.current) {
      const scrollAmount = seriesScrollRef.current.clientWidth * 0.75;
      seriesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="section-wrapper conversations-section" id="ystv">
      <div className="container">
        {/* Top subtle divider line matching screenshot */}
        <div className="conversations-top-divider" />

        {/* Header Row: Left Logo + Right Carousel Controls */}
        <div className="conversations-header-row">
          <div className="conversations-logo-container" aria-label="Conversations">
            <img 
              src={conversationsLogoLight} 
              alt="Conversations" 
              className="conversations-logo-img conversations-logo-light" 
            />
            <img 
              src={conversationsLogoDark} 
              alt="Conversations" 
              className="conversations-logo-img conversations-logo-dark" 
            />
          </div>

          {/* Carousel Navigation Arrows & Counter in Header */}
          <div className="conversations-header-controls">
            <div className="conversations-dots-track">
              {HERO_CONVERSATIONS.map((_, i) => (
                <span 
                  key={i} 
                  className={`conversations-dot-indicator ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(i)}
                  title={`Go to episode ${i + 1}`}
                />
              ))}
            </div>
            <span className="conversations-slide-counter">
              {String(currentIndex + 1).padStart(2, '0')} / {String(HERO_CONVERSATIONS.length).padStart(2, '0')}
            </span>
            <div className="conversations-carousel-btn-group">
              <button 
                type="button"
                className="conversations-carousel-btn" 
                onClick={handlePrev}
                aria-label="Previous story"
                title="Previous story"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                type="button"
                className="conversations-carousel-btn" 
                onClick={handleNext}
                aria-label="Next story"
                title="Next story"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Studio Showcase Card Container */}
        <div className="conversations-stage-card">
          <div className="conversations-hero-container">
            {/* Left Column: Brand, Title, Summary, Action Cluster */}
            <div className="conversations-hero-content">
              <div className="conversations-hero-brand-row">
                <span className="conversations-live-pill">
                  <span className="live-dot" />
                  <span>STUDIO EXCLUSIVE</span>
                </span>
                {activeStory.series && (
                  <span className="conversations-series-badge">
                    {activeStory.series}
                  </span>
                )}
                {activeStory.duration && (
                  <span className="conversations-duration-badge">
                    <Clock size={12} />
                    <span>{activeStory.duration} MIN</span>
                  </span>
                )}
              </div>

              <h3 
                className="conversations-hero-main-title"
                onClick={() => onSelectVideo(activeStory)}
              >
                {activeStory.title}
              </h3>

              {activeStory.summary && (
                <p className="conversations-hero-desc">
                  {activeStory.summary}
                </p>
              )}

              <div className="conversations-hero-actions-group">
                <button 
                  type="button"
                  className="conversations-watch-btn"
                  onClick={() => onSelectVideo(activeStory)}
                >
                  <Play size={15} fill="currentColor" />
                  <span>Watch Episode</span>
                </button>

                <button 
                  type="button"
                  className="conversations-highlights-action"
                  onClick={() => onSelectVideo(activeStory)}
                >
                  <span>View Highlights</span>
                  <ArrowUpRight size={15} className="conversations-arrow-icon" />
                </button>

                {activeStory.views && (
                  <div className="conversations-views-indicator">
                    <Eye size={14} />
                    <span>{activeStory.views} plays</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: 16:9 Video Showcase */}
            <div className="conversations-hero-media-col">
              <div 
                className="conversations-video-card-box"
                onClick={() => onSelectVideo(activeStory)}
                role="button"
                tabIndex={0}
                aria-label={`Watch ${activeStory.title}`}
              >
                <div className="conversations-video-frame">
                  <img 
                    src={activeStory.image} 
                    alt={activeStory.title} 
                    className="conversations-video-poster"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = activeStory.fallbackImage;
                    }}
                    loading="lazy"
                  />

                  {/* Video Overlays: Series Pill & Duration Badge */}
                  <div className="conversations-video-badge-top">
                    <span className="conversations-video-pill">
                      <Tv size={11} />
                      <span>{activeStory.series || 'GoReadPost TV'}</span>
                    </span>
                  </div>

                  {activeStory.duration && (
                    <div className="conversations-video-duration-badge">
                      <span>{activeStory.duration}</span>
                    </div>
                  )}

                  {/* Vivid YouTube Red Play Button with Pulse Aura */}
                  <div className="conversations-play-overlay">
                    <div className="conversations-yt-play-button">
                      <Play size={24} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Series Grid Section */}
        <div className="featured-series-block">
          <div className="section-header-row">
            <div className="section-title-box">
              <div>
                <h2 className="section-title">Featured Series</h2>
              </div>
            </div>
          </div>

          <div className="featured-series-carousel-wrapper">
            <button
              type="button"
              className="featured-series-nav-btn featured-series-nav-prev"
              onClick={() => scrollSeries('left')}
              aria-label="Previous series"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="featured-series-track" ref={seriesScrollRef}>
              {CONVERSATIONS_SHOWS.map((item) => (
                <article
                  key={item.id}
                  className="featured-series-card"
                  onClick={() => onSelectVideo(item)}
                >
                  <div className="featured-series-img-wrap">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="featured-series-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = item.fallbackImage;
                      }}
                      loading="lazy"
                    />
                  </div>

                  <div className="featured-series-content">
                    <div className="featured-series-category-row">
                      <span className="featured-series-sq">■</span>
                      <span className="featured-series-cat-text">
                        {item.categoryLabel || 'Startups'}
                      </span>
                    </div>
                    <h4 className="featured-series-card-title">{item.title}</h4>
                    {item.summary && (
                      <p className="featured-series-card-desc">{item.summary}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="featured-series-nav-btn featured-series-nav-next"
              onClick={() => scrollSeries('right')}
              aria-label="Next series"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
