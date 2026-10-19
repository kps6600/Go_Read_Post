import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Bookmark, Trash2, BookOpen, Clock, Search, 
  UserCheck, ShieldCheck, LogIn, ExternalLink, Sparkles, Check
} from 'lucide-react';
import { AuthService } from '../services/authService';

export default function BookmarksDrawer({
  isOpen,
  onClose,
  savedStories = [],
  onSelectStory,
  onRemoveBookmark,
  onClearAll,
  onOpenAuthModal,
  currentUser: propUser
}) {
  const [currentUser, setCurrentUser] = useState(() => propUser || AuthService.getUser());
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (propUser !== undefined) {
      setCurrentUser(propUser);
    }
  }, [propUser]);

  // Keep user updated if login state changes
  useEffect(() => {
    const updateUser = () => setCurrentUser(AuthService.getUser());
    window.addEventListener('auth:change', updateUser);
    return () => window.removeEventListener('auth:change', updateUser);
  }, []);

  // Lock body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter saved stories by search
  const filteredStories = savedStories.filter((story) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const title = (story.title || '').toLowerCase();
    const summary = (story.summary || story.subtitle || '').toLowerCase();
    const category = (story.categoryLabel || story.category || '').toLowerCase();
    const author = (story.author?.name || '').toLowerCase();
    return title.includes(q) || summary.includes(q) || category.includes(q) || author.includes(q);
  });

  // Calculate estimated total read time
  const totalReadMinutes = savedStories.reduce((acc, curr) => {
    const match = (curr.readTime || '').match(/\d+/);
    return acc + (match ? parseInt(match[0], 10) : 4);
  }, 0);

  const handleCopyLink = (story) => {
    const slug = story.slug || story.id || story._id;
    const url = `${window.location.origin}/article/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearAllConfirm = () => {
    if (savedStories.length === 0) return;
    if (window.confirm(`Are you sure you want to clear all ${savedStories.length} saved stories from your reading list?`)) {
      if (onClearAll) {
        onClearAll();
      }
    }
  };

  const drawerElement = (
    <div className={`bookmarks-drawer-root ${isOpen ? 'open' : ''}`}>
      {/* Backdrop overlay */}
      <div 
        className={`bookmarks-drawer-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Slide-out Drawer */}
      <aside 
        className={`bookmarks-drawer-panel ${isOpen ? 'open' : ''}`}
        aria-label="Saved Stories Drawer"
        role="dialog"
      >
        {/* Drawer Header */}
        <div className="bdp-header">
          <div className="bdp-header-title-wrap">
            <div className="bdp-icon-badge">
              <Bookmark size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="bdp-title">Your Reading List</h3>
              <span className="bdp-subtitle">
                {savedStories.length === 1 ? '1 Story Saved' : `${savedStories.length} Stories Saved`}
              </span>
            </div>
          </div>

          <button 
            type="button" 
            className="bdp-close-btn" 
            onClick={onClose}
            aria-label="Close reading list"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Scoping Identity Banner */}
        <div className="bdp-user-banner">
          {currentUser ? (
            <div className="bdp-user-info">
              <div className="bdp-avatar">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                  <span>{(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="bdp-user-meta">
                <div className="bdp-user-name">
                  <span>{currentUser.name || currentUser.username}</span>
                  <span className="bdp-role-tag">{currentUser.role || 'MEMBER'}</span>
                </div>
                <div className="bdp-user-status">
                  <ShieldCheck size={12} color="var(--accent-emerald)" />
                  <span>Private to your account & synced with MongoDB</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bdp-guest-banner">
              <div className="bdp-guest-text">
                <strong>Guest Mode:</strong> Stories saved locally on this browser.
              </div>
              {onOpenAuthModal && (
                <button 
                  type="button" 
                  className="bdp-login-link-btn"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal('login');
                  }}
                >
                  <LogIn size={13} />
                  <span>Sign In to Sync</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Bar (Search & Clear) */}
        {savedStories.length > 0 && (
          <div className="bdp-toolbar">
            <div className="bdp-search-box">
              <Search size={14} />
              <input 
                type="text"
                placeholder="Search saved stories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="bdp-search-clear" onClick={() => setSearch('')}>
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="bdp-toolbar-actions">
              <span className="bdp-time-badge" title="Estimated total reading time">
                <Clock size={12} />
                <span>~{totalReadMinutes} min read</span>
              </span>

              {onClearAll && (
                <button 
                  type="button" 
                  className="bdp-clear-btn" 
                  onClick={handleClearAllConfirm}
                  title="Clear all bookmarks"
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Story List Body */}
        <div className="bdp-body">
          {!currentUser ? (
            <div className="bdp-empty-state">
              <div className="bdp-empty-icon-wrap">
                <Bookmark size={36} color="var(--brand-primary)" />
              </div>
              <h4>Log in to View Saved Stories</h4>
              <p>
                Sign in to access your personal reading list and access saved articles across your devices.
              </p>
              {onOpenAuthModal && (
                <button 
                  type="button" 
                  className="bdp-explore-btn"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal('login');
                  }}
                >
                  <LogIn size={16} />
                  <span>Log In to Your Account</span>
                </button>
              )}
            </div>
          ) : savedStories.length === 0 ? (
            <div className="bdp-empty-state">
              <div className="bdp-empty-icon-wrap">
                <Bookmark size={36} color="var(--brand-primary)" />
              </div>
              <h4>Your reading list is empty</h4>
              <p>
                Save articles, interviews, and deeptech reports while reading to enjoy them offline or at your own leisure.
              </p>
              <button 
                type="button" 
                className="bdp-explore-btn"
                onClick={onClose}
              >
                <Sparkles size={16} />
                <span>Explore Top Stories</span>
              </button>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="bdp-empty-state">
              <h4>No matches found</h4>
              <p>No saved articles matching "{search}".</p>
              <button 
                type="button" 
                className="bdp-explore-btn secondary"
                onClick={() => setSearch('')}
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="bdp-stories-list">
              {filteredStories.map((story) => {
                const storyId = story.id || story._id || story.slug;
                const category = story.categoryLabel || story.category || 'Editorial';
                const readTime = story.readTime || '4 min read';
                const image = story.image || story.coverImage || '/assets/prableen_hero_exact.png';

                return (
                  <article key={storyId} className="bdp-card">
                    <div className="bdp-card-thumb-wrap">
                      <img 
                        src={image} 
                        alt={story.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = story.fallbackImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <span className="bdp-card-tag">{category}</span>
                    </div>

                    <div className="bdp-card-content">
                      <h4 
                        className="bdp-card-title"
                        onClick={() => {
                          if (onSelectStory) onSelectStory(story);
                          onClose();
                        }}
                        title={story.title}
                      >
                        {story.title}
                      </h4>

                      {story.summary && (
                        <p className="bdp-card-summary">
                          {story.summary}
                        </p>
                      )}

                      <div className="bdp-card-footer">
                        <div className="bdp-card-meta">
                          <span className="bdp-read-time">
                            <Clock size={12} />
                            <span>{readTime}</span>
                          </span>
                          {story.author?.name && (
                            <span className="bdp-author-dot">
                              • {story.author.name}
                            </span>
                          )}
                        </div>

                        <div className="bdp-card-actions">
                          <button
                            type="button"
                            className="bdp-share-btn"
                            onClick={() => handleCopyLink(story)}
                            title="Copy link"
                          >
                            {copiedId === storyId ? <Check size={13} color="var(--accent-emerald)" /> : <ExternalLink size={13} />}
                          </button>

                          <button 
                            type="button"
                            className="bdp-read-btn"
                            onClick={() => {
                              if (onSelectStory) onSelectStory(story);
                              onClose();
                            }}
                          >
                            <BookOpen size={13} />
                            <span>Read</span>
                          </button>

                          <button 
                            type="button"
                            className="bdp-remove-btn"
                            onClick={() => {
                              if (onRemoveBookmark) onRemoveBookmark(storyId);
                            }}
                            title="Remove from saved stories"
                            aria-label="Remove bookmark"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {savedStories.length > 0 && (
          <div className="bdp-footer">
            <span className="bdp-footer-note">
              ⚡ Stories are cached for rapid access
            </span>
            <button type="button" className="bdp-footer-close-btn" onClick={onClose}>
              Done Reading
            </button>
          </div>
        )}
      </aside>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(drawerElement, document.body);
}
