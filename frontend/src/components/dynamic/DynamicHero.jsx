import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DynamicHero({ data = {} }) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // Slides array if curated via Live Banner Editor or custom slides
  const slides = Array.isArray(data.slides) && data.slides.length > 0 ? data.slides : null;

  // Autoplay carousel if multiple slides exist
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const intervalSec = data.autoPlayInterval !== undefined ? Number(data.autoPlayInterval) : 7;
    if (intervalSec <= 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx(prev => (prev + 1) % slides.length);
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [slides, data.autoPlayInterval]);

  const activeSlide = slides ? (slides[currentSlideIdx] || slides[0]) : null;

  const headline = (activeSlide?.title) || (activeSlide?.headline) || data.headline || data.title || data.heading || 'Elevate Your Digital Presence';
  const subheadline = (activeSlide?.excerpt) || (activeSlide?.subheadline) || data.subheadline || data.subtitle || data.description || 'Scale faster with our cutting-edge solutions designed for modern high-growth businesses.';
  const badge = (activeSlide?.category) || (activeSlide?.badge) || data.badge || 'WHAT WE DO';
  const primaryBtnText = (activeSlide?.primaryBtnText) || data.primaryBtnText || data.buttonText || 'Get Started Now';
  const primaryBtnUrl = (activeSlide?.link) || (activeSlide?.primaryBtnUrl) || data.primaryBtnUrl || data.buttonUrl || '#contact';
  const secondaryBtnText = data.secondaryBtnText || '';
  const secondaryBtnUrl = data.secondaryBtnUrl || '#services';
  const bgImage = (activeSlide?.image) || (activeSlide?.bgImage) || data.bgImage || data.image || '';
  const alignment = data.alignment || 'center';

  const isCenter = alignment === 'center';

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (!slides) return;
    setCurrentSlideIdx(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (!slides) return;
    setCurrentSlideIdx(prev => (prev + 1) % slides.length);
  };

  return (
    <section 
      className={`dyn-hero-section ${bgImage ? 'has-bg' : ''}`}
      style={{
        backgroundImage: bgImage ? `linear-gradient(rgba(10, 15, 30, 0.85), rgba(10, 15, 30, 0.9)), url(${bgImage})` : undefined,
        position: 'relative'
      }}
    >
      <div className="dyn-container" style={{ width: '100%', maxWidth: '100%', textAlign: isCenter ? 'center' : 'left' }}>
        {badge && (
          <div className={`dyn-hero-badge ${isCenter ? 'mx-auto' : ''}`}>
            <Sparkles size={14} />
            <span>{badge}</span>
          </div>
        )}

        <h1 className="dyn-hero-title">
          {headline}
        </h1>

        {subheadline && (
          <p className={`dyn-hero-subtitle ${isCenter ? 'mx-auto' : ''}`}>
            {subheadline}
          </p>
        )}

        <div className={`dyn-hero-buttons ${isCenter ? 'justify-center' : ''}`}>
          {primaryBtnText && (
            <a 
              href={primaryBtnUrl || '#'} 
              className="dyn-btn-primary"
            >
              <span>{primaryBtnText}</span>
              <ArrowRight size={16} />
            </a>
          )}
          {secondaryBtnText && (
            <a 
              href={secondaryBtnUrl || '#'} 
              className="dyn-btn-secondary"
            >
              <span>{secondaryBtnText}</span>
            </a>
          )}
        </div>

        {/* Carousel controls if multi-slide hero */}
        {slides && slides.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCenter ? 'center' : 'flex-start', gap: '12px', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentSlideIdx(idx)}
                  style={{
                    width: idx === currentSlideIdx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === currentSlideIdx ? '#ea580c' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
