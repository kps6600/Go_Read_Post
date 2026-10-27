import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, TrendingUp, BookOpen, 
  Send, ExternalLink, Bookmark, Share2, ThumbsUp, Eye, Sparkles, Filter
} from 'lucide-react';
import { getStoredFounderData } from '../data/founderData';
import { PageService } from '../services/pageService';

export default function FounderFirstPage({ 
  onBackToHome, 
  onSelectStory, 
  onOpenPitchModal,
  isSaved,
  onToggleSave,
  onShareStory 
}) {
  const [selectedTag, setSelectedTag] = useState('all');
  const [founderData, setFounderData] = useState(() => getStoredFounderData());

  useEffect(() => {
    // 1. Fetch fresh from backend /api/pages
    PageService.getPageById('founder-first').then(page => {
      if (page?.data && typeof page.data === 'object' && page.data.stories) {
        setFounderData(prev => ({ ...prev, ...page.data }));
      }
    }).catch(() => {});

    // 2. Real-time update listeners from Admin
    const handleUpdate = (e) => {
      if (e?.detail) {
        setFounderData(e.detail);
      } else {
        setFounderData(getStoredFounderData());
      }
    };

    window.addEventListener('goreadpost:founder-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('goreadpost:founder-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const stories = founderData.stories || [];
  const filterTags = founderData.filterTags || [];
  const header = founderData.header || {};
  const ctaBanner = founderData.ctaBanner || {};

  const displayedStories = selectedTag === 'all' 
    ? stories 
    : stories.filter(s => s.tag === selectedTag);

  return (
    <div className="ffp-page-container">
      {/* Filter Tabs */}
      <div className="ffp-filter-bar">
        <div className="ffp-filter-pills">
          {filterTags.map(tab => (
            <button
              key={tab.id}
              className={`ffp-tab-btn ${selectedTag === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTag(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="ffp-stories-grid">
        {displayedStories.map(story => (
          <div key={story.id} className="ffp-story-card">
            <div className="ffp-story-media" onClick={() => onSelectStory && onSelectStory(story)}>
              <img src={story.image} alt={story.title} className="ffp-story-img" />
              <div className="ffp-story-badge-strip">
                <span className="ffp-category-pill">{story.tagLabel || story.tag}</span>
                {story.metric && <span className="ffp-metric-pill">{story.metric}</span>}
              </div>
            </div>
            <div className="ffp-story-body">
              <div className="ffp-founder-line">
                <strong>{story.founder}</strong>{story.company ? <> • <span className="ffp-company-tag">{story.company}</span></> : null}
              </div>
              <h3 className="ffp-story-title" onClick={() => onSelectStory && onSelectStory(story)}>
                {story.title}
              </h3>
              
              <div className="ffp-story-footer">
                <div className="ffp-story-meta">
                  <span><Eye size={12} /> {Number(story.views || 0).toLocaleString()} reads</span>
                  <span>•</span>
                  <span>{story.readTime || '5 min read'}</span>
                </div>
                <div className="ffp-story-actions">
                  <button 
                    className="ffp-icon-btn"
                    onClick={() => onShareStory && onShareStory(story)}
                    title="Share Playbook"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
