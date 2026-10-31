const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'LatestArticlesPage.jsx');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add ArrowLeft, ArrowRight, Trash2, ArrowLeftRight, Image as ImageIcon, Settings to imports if needed
content = content.replace(
  "import { \n  ChevronRight, ChevronLeft, Search, Mail, CheckCircle2, \n  ArrowRight, LayoutGrid, Tag, Layers, Cpu, Briefcase, \n  GraduationCap, Heart, Plane, Utensils, Atom, Sparkles, TrendingUp,\n  Edit3, Bookmark\n} from 'lucide-react';",
  "import { \n  ChevronRight, ChevronLeft, Search, Mail, CheckCircle2, \n  ArrowRight, ArrowLeft, ArrowLeftRight, Trash2, Plus, LayoutGrid, Tag, Layers, Cpu, Briefcase, \n  GraduationCap, Heart, Plane, Utensils, Atom, Sparkles, TrendingUp,\n  Edit3, Bookmark, Image as ImageIcon, Settings\n} from 'lucide-react';"
);

// 2. Add isEditMode state and update handlers inside LatestArticlesPage component
const stateSnippet = `  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [liveArticles, setLiveArticles] = useState([]);

  // Live direct UI edit handlers
  const handleUpdatePageSettings = async (updates) => {
    try {
      await PageService.updatePage('latest', {
        title: updates.title !== undefined ? updates.title : (pageConfig?.title || 'Latest Articles & Dispatches'),
        description: updates.description !== undefined ? updates.description : (pageConfig?.description || ''),
        heroSubhead: updates.description !== undefined ? updates.description : (pageConfig?.description || ''),
        status: 'published'
      });
      setPageConfig(prev => ({ ...prev, ...updates }));
      if (onShowToast) onShowToast('Page title and description updated live!');
    } catch (e) {
      console.warn('Could not update page settings:', e);
    }
  };

  const handleUpdateNewsletterBanner = async (bannerData) => {
    try {
      const currentSections = pageConfig?.sections || [];
      const updatedSections = currentSections.map(s => {
        if (s.type === 'newsletter' || s.id === 'newsletter' || s.id === 'latest_newsletter') {
          return { ...s, data: bannerData, customConfig: bannerData };
        }
        return s;
      });
      await PageService.updatePage('latest', {
        sections: updatedSections
      });
      if (onShowToast) onShowToast('Newsletter banner updated live!');
    } catch (e) {
      console.warn('Could not update newsletter banner:', e);
    }
  };

  const handleInlineStoryUpdate = async (story, updates) => {
    if (!story) return;
    const artId = story._id || story.id || story.slug;

    // Optimistically update liveArticles in state
    setLiveArticles(prev => prev.map(a => {
      const aId = a._id || a.id || a.slug;
      if (String(aId) === String(artId)) {
        return { ...a, ...updates };
      }
      return a;
    }));

    // Update MongoDB Article / Story collection
    try {
      const payload = { ...updates };
      if (updates.authorName) {
        payload.authorName = updates.authorName;
        payload.author = { name: updates.authorName };
      }
      if (updates.category) {
        payload.categoryName = updates.category;
        payload.categoryLabel = updates.category;
      }
      try {
        await ArticleService.updateArticle(artId, payload);
      } catch (e1) {
        try {
          await StoryService.updateStory(artId, payload);
        } catch (e2) {}
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('article:change'));
        window.dispatchEvent(new CustomEvent('story:change'));
      }
    } catch (e) {
      console.warn('Could not update article:', e);
    }
  };

  const handleMoveStoryInFeed = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentStories.length) return;
    const reordered = [...liveArticles];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setLiveArticles(reordered);
    if (onShowToast) onShowToast('Story order updated live!');
  };

  const handleDeleteStoryFromFeed = async (story) => {
    const title = getStoryTitle(story);
    if (!window.confirm(\`Remove "\${title}" from the Latest Articles feed?\`)) return;
    const artId = story._id || story.id || story.slug;
    setLiveArticles(prev => prev.filter(a => String(a._id || a.id || a.slug) !== String(artId)));
    if (onShowToast) onShowToast(\`"\${title}" removed from feed.\`);
  };`;

if (!content.includes('const [isEditMode, setIsEditMode] = useState(true);')) {
  content = content.replace("  const [isAdminUser, setIsAdminUser] = useState(false);\n  const [liveArticles, setLiveArticles] = useState([]);", stateSnippet);
}

// 3. Add Page Header and Admin Bar above Category Filter Pills Bar
const oldTop = `      {/* ── Category Filter Pills Bar ── */}
      <div className="lap-category-pills-bar">`;

const newTop = `      {/* ── Admin Visual Editor Toolbar ── */}
      {isAdminUser && (
        <div className="lap-admin-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#ea580c', 
              color: '#ffffff', 
              padding: '4px 10px', 
              borderRadius: '6px', 
              fontSize: '0.78rem', 
              fontWeight: 850 
            }}>
              ✏️ LIVE UI STUDIO
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
              Direct In-Place Editing Active
            </span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Auto-saves directly to server
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsEditMode(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: isEditMode ? '#fff7ed' : '#f1f5f9',
                border: isEditMode ? '1.5px solid #fdba74' : '1px solid #cbd5e1',
                color: isEditMode ? '#ea580c' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              {isEditMode ? '✏️ Edit Mode: ON' : '👁️ Reader Preview'}
            </button>

            <button
              type="button"
              onClick={() => {
                const titlePrompt = window.prompt("Add article title to latest feed:");
                if (titlePrompt && titlePrompt.trim()) {
                  const newArt = {
                    id: 'art_' + Date.now(),
                    title: titlePrompt.trim(),
                    subtitle: 'Exclusive reporting from GoReadPost newsroom.',
                    summary: 'Exclusive reporting from GoReadPost newsroom.',
                    category: 'Startups',
                    categoryName: 'Startups',
                    categoryLabel: 'Startups',
                    authorName: 'Editorial Desk',
                    author: { name: 'Editorial Desk' },
                    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
                    publishedAt: new Date().toISOString(),
                    readTime: '4 min read',
                    isNewlyAdded: true
                  };
                  setLiveArticles(prev => [newArt, ...prev]);
                  ArticleService.createArticle(newArt).catch(() => {});
                  if (onShowToast) onShowToast('New article card added to Latest feed!');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#ea580c',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 750,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
              }}
            >
              <Plus size={14} />
              <span>Add Article</span>
            </button>

            <a
              href="/admin/pages/latest/edit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Settings size={14} />
              <span>Pages Manager</span>
            </a>
          </div>
        </div>
      )}

      {/* ── Page Header (Direct In-Place Editable) ── */}
      <div className="lap-header" style={{ marginBottom: '1.75rem' }}>
        <h1
          contentEditable={isAdminUser && isEditMode}
          suppressContentEditableWarning={true}
          className={isAdminUser && isEditMode ? "lap-title lse-direct-editable" : "lap-title"}
          onBlur={(e) => {
            const val = e.currentTarget.textContent.trim();
            if (val) handleUpdatePageSettings({ title: val });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          title={isAdminUser && isEditMode ? "Click directly to edit page headline" : undefined}
          style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
        >
          {pageConfig?.title || "Latest Articles & Dispatches"}
        </h1>
        <p
          contentEditable={isAdminUser && isEditMode}
          suppressContentEditableWarning={true}
          className={isAdminUser && isEditMode ? "lap-subtitle lse-direct-editable" : "lap-subtitle"}
          onBlur={(e) => {
            const val = e.currentTarget.textContent.trim();
            handleUpdatePageSettings({ description: val });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          title={isAdminUser && isEditMode ? "Click directly to edit page subtitle" : undefined}
          style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
        >
          {pageConfig?.description || "Real-time dispatches, founder stories, deeptech, venture capital reporting, and latest scoops."}
        </p>
      </div>

      {/* ── Category Filter Pills Bar ── */}
      <div className="lap-category-pills-bar">`;

if (content.includes(oldTop)) {
  content = content.replace(oldTop, newTop);
  console.log('Replaced oldTop successfully');
} else {
  console.log('Could not find oldTop');
}

// 4. Update the card body in LatestArticlesPage.jsx to be in-place editable
const oldCardMarkup = `                  <article 
                    key={storyId} 
                    className="lap-card"
                    onClick={() => onSelectStory && onSelectStory(story)}
                  >
                    <div className="lap-thumb-wrap">
                      <img 
                        src={storyImg} 
                        alt={storyTitle} 
                        className="lap-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                        }}
                        loading="lazy"
                      />
                      {isNewlyAdded(story) && (
                        <span className="lap-badge-new">
                          <span className="lap-badge-new-dot" /> NEW
                        </span>
                      )}
                      <span className="lap-category-on-image">
                        {storyCat}
                      </span>
                      <button 
                        type="button" 
                        className={\`lap-card-save-btn \${isCardSaved ? 'active' : ''}\`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(story);
                        }}
                        title={isCardSaved ? 'Remove from saved bookmarks' : 'Save story'}
                        aria-label="Save story"
                      >
                        <Bookmark size={15} fill={isCardSaved ? '#ffffff' : 'none'} color="#ffffff" />
                      </button>
                    </div>

                    <div className="lap-card-body">
                      <h3 className="lap-card-title">
                        {storyTitle}
                      </h3>

                      <div className="lap-card-meta">
                        <div className="lap-card-meta-left">
                          <img 
                            src={storyAvatar} 
                            alt={storyAuthor} 
                            className="lap-author-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span className="lap-author-name">{storyAuthor}</span>
                          <span className="lap-meta-sep">•</span>
                          <span>{storyDate}</span>
                          <span className="lap-meta-sep">•</span>
                          <span>{storyReadTime}</span>
                        </div>
                      </div>
                    </div>
                  </article>`;

const newCardMarkup = `                  <article 
                    key={storyId} 
                    className="lap-card"
                    onClick={() => {
                      if (!isAdminUser || !isEditMode) {
                        onSelectStory && onSelectStory(story);
                      }
                    }}
                    style={{ position: 'relative' }}
                  >
                    {/* Admin Floating Card Action Bar */}
                    {isAdminUser && isEditMode && (
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          gap: '6px'
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ea580c' }}>
                          #{idx + 1}
                        </span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveStoryInFeed(idx, 'up')}
                            title="Move earlier (left)"
                            style={{
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: idx === 0 ? 'not-allowed' : 'pointer',
                              opacity: idx === 0 ? 0.35 : 1
                            }}
                          >
                            <ArrowLeft size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === currentStories.length - 1}
                            onClick={() => handleMoveStoryInFeed(idx, 'down')}
                            title="Move later (right)"
                            style={{
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: idx === currentStories.length - 1 ? 'not-allowed' : 'pointer',
                              opacity: idx === currentStories.length - 1 ? 0.35 : 1
                            }}
                          >
                            <ArrowRight size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStoryFromFeed(story)}
                            title="Delete article from feed"
                            style={{
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#ef4444',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="lap-thumb-wrap" style={{ position: 'relative' }}>
                      <img 
                        src={storyImg} 
                        alt={storyTitle} 
                        className="lap-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                        }}
                        loading="lazy"
                      />

                      {/* Photo Change Overlay on Hover */}
                      {isAdminUser && isEditMode && (
                        <div className="lse-card-img-overlay">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newImg = window.prompt("Enter new photo URL for this article:", storyImg);
                              if (newImg && newImg.trim() && newImg !== storyImg) {
                                handleInlineStoryUpdate(story, { image: newImg.trim(), featuredImage: newImg.trim() });
                              }
                            }}
                            style={{
                              background: 'rgba(15, 23, 42, 0.88)',
                              color: '#ffffff',
                              border: '1px solid rgba(255,255,255,0.25)',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 750,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              backdropFilter: 'blur(4px)'
                            }}
                            title="Change photo URL"
                          >
                            <ImageIcon size={12} />
                            <span>Photo</span>
                          </button>
                        </div>
                      )}

                      {isNewlyAdded(story) && (
                        <span className="lap-badge-new">
                          <span className="lap-badge-new-dot" /> NEW
                        </span>
                      )}
                      <span 
                        contentEditable={isAdminUser && isEditMode}
                        suppressContentEditableWarning={true}
                        className={isAdminUser && isEditMode ? "lap-category-on-image lse-direct-editable" : "lap-category-on-image"}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== storyCat) {
                            handleInlineStoryUpdate(story, { category: val, categoryName: val, categoryLabel: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title={isAdminUser && isEditMode ? "Click directly to edit category badge" : undefined}
                        style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
                      >
                        {storyCat}
                      </span>
                      <button 
                        type="button" 
                        className={\`lap-card-save-btn \${isCardSaved ? 'active' : ''}\`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(story);
                        }}
                        title={isCardSaved ? 'Remove from saved bookmarks' : 'Save story'}
                        aria-label="Save story"
                      >
                        <Bookmark size={15} fill={isCardSaved ? '#ffffff' : 'none'} color="#ffffff" />
                      </button>
                    </div>

                    <div className="lap-card-body">
                      <h3 
                        contentEditable={isAdminUser && isEditMode}
                        suppressContentEditableWarning={true}
                        className={isAdminUser && isEditMode ? "lap-card-title lse-direct-editable" : "lap-card-title"}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== storyTitle) {
                            handleInlineStoryUpdate(story, { title: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title={isAdminUser && isEditMode ? "Click directly on text to edit article title" : undefined}
                        style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
                      >
                        {storyTitle}
                      </h3>

                      {storyExcerpt && (
                        <p
                          contentEditable={isAdminUser && isEditMode}
                          suppressContentEditableWarning={true}
                          className={isAdminUser && isEditMode ? "lse-direct-editable" : ""}
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent.trim();
                            if (val !== storyExcerpt) {
                              handleInlineStoryUpdate(story, { summary: val, excerpt: val, subtitle: val });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          style={{
                            fontSize: '0.82rem',
                            color: '#64748b',
                            lineHeight: 1.45,
                            margin: '0 0 10px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            cursor: isAdminUser && isEditMode ? 'text' : 'default'
                          }}
                          title={isAdminUser && isEditMode ? "Click directly to edit summary teaser" : undefined}
                        >
                          {storyExcerpt}
                        </p>
                      )}

                      <div className="lap-card-meta">
                        <div className="lap-card-meta-left">
                          <img 
                            src={storyAvatar} 
                            alt={storyAuthor} 
                            className="lap-author-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span 
                            contentEditable={isAdminUser && isEditMode}
                            suppressContentEditableWarning={true}
                            className={isAdminUser && isEditMode ? "lap-author-name lse-direct-editable" : "lap-author-name"}
                            onBlur={(e) => {
                              const val = e.currentTarget.textContent.trim();
                              if (val && val !== storyAuthor) {
                                handleInlineStoryUpdate(story, { authorName: val, author: val });
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.currentTarget.blur();
                              }
                            }}
                            title={isAdminUser && isEditMode ? "Click directly to edit author" : undefined}
                            style={isAdminUser && isEditMode ? { cursor: 'text' } : {}}
                          >
                            {storyAuthor}
                          </span>
                          <span className="lap-meta-sep">•</span>
                          <span>{storyDate}</span>
                          <span className="lap-meta-sep">•</span>
                          <span>{storyReadTime}</span>
                        </div>
                      </div>
                    </div>
                  </article>`;

if (content.includes(oldCardMarkup)) {
  content = content.replace(oldCardMarkup, newCardMarkup);
  console.log('Replaced oldCardMarkup successfully');
} else {
  console.log('Could not find oldCardMarkup');
}

// 5. Add NewsletterBanner before closing lap-page-wrapper
const oldBottom = `          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="lap-pagination">
              <button 
                type="button" 
                className="lap-page-btn" 
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  className={\`lap-page-btn \${currentPage === page ? 'active' : ''}\`}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                >
                  {page}
                </button>
              ))}

              <button 
                type="button" 
                className="lap-page-btn" 
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>


      </div>
    </div>`;

const newBottom = `          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="lap-pagination">
              <button 
                type="button" 
                className="lap-page-btn" 
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  className={\`lap-page-btn \${currentPage === page ? 'active' : ''}\`}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                >
                  {page}
                </button>
              ))}

              <button 
                type="button" 
                className="lap-page-btn" 
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Newsletter Subscription Banner (Direct In-Place Editable) ── */}
      <NewsletterBanner
        data={newsletterSec?.data || {}}
        isAdmin={isAdminUser && isEditMode}
        onUpdate={handleUpdateNewsletterBanner}
        onShowToast={onShowToast}
      />
    </div>`;

if (content.includes(oldBottom)) {
  content = content.replace(oldBottom, newBottom);
  console.log('Replaced oldBottom successfully');
} else {
  console.log('Could not find oldBottom');
}

fs.writeFileSync(filePath, content, 'utf8');
