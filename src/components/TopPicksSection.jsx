import React from 'react';
import { Clock, Bookmark, Share2 } from 'lucide-react';
import { TOP_PICKS } from '../data/storiesData';

export default function TopPicksSection({ 
  stories,
  title = 'Top Picks',
  subtitle,
  onSelectStory, 
  isSaved, 
  onToggleSave, 
  onShareStory 
}) {
  const displayStories = (stories && stories.length >= 4)
    ? stories.slice(0, 4)
    : (stories && stories.length > 0)
      ? [...stories, ...TOP_PICKS.filter(p => !stories.some(s => (s.id || s._id) === p.id))].slice(0, 4)
      : TOP_PICKS.slice(0, 4);

  return (
    <section className="section-wrapper top-picks-section">
      <div className="container">
        {/* Section Header */}
        <div className="top-picks-header">
          <div className="top-picks-title-wrap">
            <h2 className="top-picks-title">{title}</h2>
            {subtitle && <p className="top-picks-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>{subtitle}</p>}
          </div>
        </div>

        {/* 4 Cards Grid - Fully Responsive */}
        <div className="top-picks-grid">
          {displayStories.map((item, index) => {
            const itemId = item.id || item._id;
            const saved = isSaved ? isSaved(itemId) : false;
            const itemImg = item.image || (typeof item.featuredImage === 'string' ? item.featuredImage : item.featuredImage?.url) || item.fallbackImage || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&auto=format&fit=crop&q=80';
            const itemCat = item.categoryLabel || item.category || 'TOP PICK';
            const itemAuthor = item.author?.name || (typeof item.author === 'string' ? item.author : 'YourStory Desk');
            const itemReadTime = item.readTime || (item.readingTime ? `${item.readingTime} min read` : '4 min read');
            const itemSummary = item.summary || item.excerpt || (item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 95) + '...' : '');

            return (
              <article 
                key={itemId || index}
                className="top-pick-card"
                onClick={() => onSelectStory(item)}
              >
                <div className="top-pick-media">
                  <img 
                    src={itemImg} 
                    alt={item.title}
                    className="top-pick-img"
                    onError={(e) => {
                      const fb = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&auto=format&fit=crop&q=80';
                      if (e.target.src !== fb) {
                        e.target.src = fb;
                      }
                    }}
                    loading="lazy"
                  />
                  <span className="top-pick-tag">
                    {itemCat}
                  </span>
                  <span className="top-pick-rank">0{index + 1}</span>
                </div>

                <div className="top-pick-body">
                  <h3 className="top-pick-headline">
                    {item.title}
                  </h3>
                  {itemSummary && (
                    <p className="top-pick-summary">
                      {itemSummary}
                    </p>
                  )}

                  <div className="top-pick-footer">
                    <div className="top-pick-meta">
                      <span className="top-pick-author">{itemAuthor}</span>
                      <span className="meta-sep">•</span>
                      <span className="top-pick-read">
                        <Clock size={12} className="meta-icon" />
                        <span>{itemReadTime}</span>
                      </span>
                    </div>

                    <div className="top-pick-actions" onClick={(e) => e.stopPropagation()}>
                      {onToggleSave && (
                        <button 
                          className={`editorial-icon-btn${saved ? ' active' : ''}`}
                          onClick={() => onToggleSave(item)}
                          title={saved ? "Remove bookmark" : "Save story"}
                          aria-label="Save story"
                        >
                          <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      {onShareStory && (
                        <button 
                          className="editorial-icon-btn"
                          onClick={() => onShareStory(item)}
                          title="Share story"
                          aria-label="Share story"
                        >
                          <Share2 size={15} />
                        </button>
                      )}
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

