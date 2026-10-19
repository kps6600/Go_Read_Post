import React from 'react';
import { Clock, Bookmark, Share2 } from 'lucide-react';

const DEFAULT_EDITORIAL_FALLBACK = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&auto=format&fit=crop&q=80';

export default function StoriesGrid({
  id,
  stories,
  title = "Latest Stories",
  subtitle = null,
  icon: IconComponent,
  onSelectStory,
  isSaved,
  onToggleSave,
  onShareStory,
  onClapStory
}) {
  if (!stories || stories.length === 0) {
    return (
      <section className="section-wrapper" id={id}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No stories found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Try searching with a different term or exploring our categories.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-wrapper" id={id}>
      <div className="container">
        <div className="section-header-row">
          <div className="section-title-box">
            <div>
              <h2 className="section-title">{title}</h2>
              {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="section-meta-counter">
            <span>{stories.length} {stories.length === 1 ? 'Story' : 'Stories'}</span>
          </div>
        </div>
 
        <div className={`stories-editorial-grid ${stories.length === 4 ? 'grid-4-cols' : 'grid-3-cols'}`}>
          {stories.map((story) => {
            const storyId = story.id || story._id || story.slug;
            const saved = isSaved ? isSaved(storyId) : false;
            const rawImage = story.image || 
                             (typeof story.featuredImage === 'string' ? story.featuredImage : story.featuredImage?.url) ||
                             story.heroImage || 
                             story.coverImage ||
                             story.fallbackImage;
            const fallback = (story.fallbackImage && typeof story.fallbackImage === 'string' && !story.fallbackImage.includes('undefined'))
              ? story.fallbackImage
              : DEFAULT_EDITORIAL_FALLBACK;
            const displayImage = (rawImage && typeof rawImage === 'string' && rawImage.trim().length > 0 && !rawImage.includes('[object') && !rawImage.includes('undefined'))
              ? rawImage
              : fallback;

            const summaryText = story.summary || story.excerpt || story.subtitle || '';
            const authorName = story.author?.name || story.authorName || 'GoReadPost Bureau';
            const readTimeText = story.readTime || story.readingTime || '5 min read';
            const categoryText = story.categoryLabel || story.categoryName || story.category || title || 'Story';

            return (
              <article
                key={storyId}
                className="editorial-story-card"
                onClick={() => onSelectStory(story)}
              >
                <div className="editorial-card-media">
                  <img
                    src={displayImage}
                    alt={story.title}
                    className="editorial-card-img"
                    loading="lazy"
                    onError={(e) => {
                      if (e.target.src !== fallback) {
                        e.target.src = fallback;
                      }
                    }}
                  />
                </div>

                <div className="editorial-card-body">
                  <div className="editorial-card-kicker">
                    <span className="editorial-kicker-square">■</span>
                    <span className="editorial-kicker-label">
                      {categoryText}
                    </span>
                  </div>

                  <h3 className="editorial-card-title">{story.title}</h3>
                  {summaryText && <p className="editorial-card-summary">{summaryText}</p>}

                  <div className="editorial-card-footer" onClick={(e) => e.stopPropagation()}>
                    <div className="editorial-card-meta-left">
                      <span className="editorial-card-author">{authorName}</span>
                      <span className="editorial-card-bullet">•</span>
                      <span className="editorial-card-time">{readTimeText}</span>
                      {story.publishedAt && (
                        <>
                          <span className="editorial-card-bullet">•</span>
                          <span className="editorial-card-date">{story.publishedAt}</span>
                        </>
                      )}
                    </div>

                    <div className="editorial-card-actions">
                      <button 
                        className={`editorial-icon-btn${saved ? ' active' : ''}`} 
                        onClick={() => onToggleSave(story)} 
                        title={saved ? 'Remove bookmark' : 'Save article'} 
                        aria-label="Save story"
                      >
                        <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        className="editorial-icon-btn" 
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
      </div>
    </section>
  );
}
