import React, { useState } from 'react';
import { 
  Bookmark, Share2, ArrowLeft,
  ChevronLeft, ChevronRight, Search, ChevronDown, ChevronUp, Check, X
} from 'lucide-react';

const BRANDS = [
  'YourStory', 'SocialStory', 'HerStory', 'EnterpriseStory',
  'SMBStory', 'DecryptingStory', 'AI Story', 'AutoStory',
  'YS Gulf', 'YSWeekender', 'YS Life', 'Kannada',
  'BlockchainStory', 'Germany', 'Hindi'
];

const INITIAL_AUTHORS = [
  'Team YS', 'Sujata Sangwan', 'Trisha Medhi', 'Sayan Sen', 'Thimmaya Poojary'
];

const MORE_AUTHORS = [
  'Shradha Sharma', 'Bhavya Kaushik', 'Apurva P', 'Sindhu Kashyap'
];

const INITIAL_CATEGORIES = [
  'News', 'Stories', 'Funding', 'Government', 'Helpdesk for Coronavirus', 'Ecommerce'
];

const MORE_CATEGORIES = [
  'Startups', 'DeepTech', 'Cryptocurrency', 'EdTech', 'EV & Mobility'
];

const INITIAL_TAGS = [
  'Just In', 'Business', 'INNOVATION', 'Coronavirus', 'India', 'Entrepreneurship'
];

const MORE_TAGS = [
  'AI', 'Robotics', 'Fintech', 'Venture Capital', 'Electric Vehicles'
];

export default function JustInTagPage({
  allJustInStories = [],
  onSelectStory,
  isSaved,
  onToggleSave,
  onShareStory,
  onBackToHome,
  currentPage = 1,
  onPageChange
}) {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showVideosOnly, setShowVideosOnly] = useState(false);

  // Authors filter
  const [authorSearch, setAuthorSearch] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [showMoreAuthors, setShowMoreAuthors] = useState(false);

  // Categories filter
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  // Tags filter
  const [tagSearch, setTagSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Just In']);
  const [showMoreTags, setShowMoreTags] = useState(false);

  const [sortOrder, setSortOrder] = useState('latest');
  const storiesPerPage = 9; // 3 rows of 3 cards next to the sidebar

  // Toggle helpers
  const toggleBrand = (b) => {
    setSelectedBrand(prev => (prev === b ? null : b));
    if (onPageChange) onPageChange(1);
  };

  const toggleAuthor = (author) => {
    setSelectedAuthors(prev => 
      prev.includes(author) ? prev.filter(a => a !== author) : [...prev, author]
    );
    if (onPageChange) onPageChange(1);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    if (onPageChange) onPageChange(1);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    if (onPageChange) onPageChange(1);
  };

  const handleVideoToggle = () => {
    setShowVideosOnly(prev => !prev);
    if (onPageChange) onPageChange(1);
  };

  const clearAllFilters = () => {
    setSelectedBrand(null);
    setShowVideosOnly(false);
    setSelectedAuthors([]);
    setSelectedCategories([]);
    setSelectedTags(['Just In']);
    if (onPageChange) onPageChange(1);
  };

  const hasActiveFilters = Boolean(
    selectedBrand || 
    showVideosOnly || 
    selectedAuthors.length > 0 || 
    selectedCategories.length > 0 || 
    selectedTags.some(t => t !== 'Just In')
  );

  // Filter lists by search query
  const allAuthorsList = [...INITIAL_AUTHORS, ...(showMoreAuthors ? MORE_AUTHORS : [])];
  const filteredAuthorsList = allAuthorsList.filter(a => 
    a.toLowerCase().includes(authorSearch.toLowerCase())
  );

  const allCategoriesList = [...INITIAL_CATEGORIES, ...(showMoreCategories ? MORE_CATEGORIES : [])];
  const filteredCategoriesList = allCategoriesList.filter(c => 
    c.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const allTagsList = [...INITIAL_TAGS, ...(showMoreTags ? MORE_TAGS : [])];
  const filteredTagsList = allTagsList.filter(t => 
    t.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Filter actual stories
  const filteredStories = allJustInStories.filter(story => {
    // 1. Brand filter (handles exact brand & related brand topics)
    if (selectedBrand) {
      const b = selectedBrand.toLowerCase().trim();
      const storyBrand = (story.brand || '').toLowerCase().trim();
      const title = (story.title || '').toLowerCase();
      const summary = (story.summary || '').toLowerCase();
      const categoryTag = (story.categoryTag || '').toLowerCase();
      const author = (story.author?.name || '').toLowerCase();

      let match = false;
      if (storyBrand === b) {
        match = true;
      } else if (b === 'herstory') {
        match = storyBrand.includes('herstory') || title.includes('women') || title.includes('female') || title.includes('nudge') || author.includes('trisha');
      } else if (b === 'socialstory') {
        match = storyBrand.includes('social') || title.includes('housing') || title.includes('welfare') || summary.includes('partner') || title.includes('symbiotics');
      } else if (b === 'smbstory') {
        match = storyBrand.includes('smb') || title.includes('lenskart') || title.includes('kredx') || title.includes('msme') || summary.includes('small retailers');
      } else if (b === 'enterprisestory') {
        match = storyBrand.includes('enterprise') || title.includes('freshworks') || title.includes('pine labs') || title.includes('b2b') || title.includes('groww');
      } else if (b === 'ai story') {
        match = storyBrand.includes('ai') || title.includes('ai') || title.includes('genai') || title.includes('robot') || title.includes('deeptech') || title.includes('sarvam') || title.includes('semiconductor');
      } else if (b === 'autostory') {
        match = storyBrand.includes('auto') || title.includes('ola') || title.includes('electric') || title.includes('ev') || title.includes('ather') || title.includes('flipkart deploys');
      } else if (b === 'decryptingstory' || b === 'blockchainstory') {
        match = storyBrand.includes('crypto') || storyBrand.includes('decrypt') || title.includes('coinswitch') || categoryTag.includes('crypto');
      } else if (b === 'ys life') {
        match = storyBrand.includes('life') || title.includes('district') || title.includes('zomato') || categoryTag.includes('entertainment');
      } else if (b === 'ysweekender') {
        match = storyBrand.includes('weekender') || title.includes('roundup') || title.includes('wrap');
      } else if (b === 'kannada') {
        match = storyBrand.includes('kannada') || title.includes('iim') || title.includes('bengaluru');
      } else if (b === 'hindi' || b === 'germany') {
        match = storyBrand.includes(b) || title.includes('delhi') || title.includes('bharat');
      } else if (b === 'yourstory') {
        match = true;
      }
      if (!match) return false;
    }

    // 2. Tag filter
    if (selectedTags.length > 0 && !selectedTags.includes('Just In')) {
      const match = selectedTags.some(t => 
        (story.categoryTag || '').toLowerCase().includes(t.toLowerCase()) ||
        (story.topic || '').toLowerCase().includes(t.toLowerCase()) ||
        story.title.toLowerCase().includes(t.toLowerCase())
      );
      if (!match) return false;
    }

    // 3. Category filter
    if (selectedCategories.length > 0) {
      const match = selectedCategories.some(c => 
        (story.categoryTag || '').toLowerCase() === c.toLowerCase() ||
        (story.topic || '').toLowerCase() === c.toLowerCase() ||
        story.title.toLowerCase().includes(c.toLowerCase())
      );
      if (!match) return false;
    }

    // 4. Author filter
    if (selectedAuthors.length > 0) {
      const authorName = story.author?.name || '';
      const match = selectedAuthors.some(a => authorName.toLowerCase().includes(a.toLowerCase()));
      if (!match) return false;
    }

    // 5. Video toggle
    if (showVideosOnly && !story.hasVideo && !story.videoUrl) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStories.length / storiesPerPage));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validPage - 1) * storiesPerPage;
  const currentStories = filteredStories.slice(startIndex, startIndex + storiesPerPage);

  const handlePageClick = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    onPageChange(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="just-in-page-wrapper">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="just-in-breadcrumb" aria-label="Breadcrumb">
          <button 
            type="button" 
            className="breadcrumb-home-link"
            onClick={onBackToHome}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-muted">Tags</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Just In</span>
        </nav>

        {/* Search Results Layout: Left Sidebar + Right Card Grid */}
        <div className="ys-search-page-layout">
          {/* Left Side Filters Sidebar - Exactly matching user screenshots */}
          <aside className="ys-filter-sidebar">
            
            {/* 1. BRAND Section */}
            <div className="ys-filter-section">
              <h4 className="ys-filter-heading">BRAND</h4>
              <div className="ys-brand-pills-wrap">
                {BRANDS.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className={`ys-brand-pill ${selectedBrand === brand ? 'active' : ''}`}
                    onClick={() => toggleBrand(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div className="ys-filter-divider" />

            {/* 2. VIDEOS Section */}
            <div className="ys-filter-section">
              <h4 className="ys-filter-heading">VIDEOS</h4>
              <div className="ys-video-toggle-row">
                <span className="ys-toggle-label">Show video stories only</span>
                <button
                  type="button"
                  className={`ys-switch-btn ${showVideosOnly ? 'active' : ''}`}
                  onClick={handleVideoToggle}
                  aria-pressed={showVideosOnly}
                >
                  <span className="ys-switch-thumb" />
                </button>
              </div>
            </div>

            <div className="ys-filter-divider" />

            {/* 3. AUTHORS Section */}
            <div className="ys-filter-section">
              <h4 className="ys-filter-heading">AUTHORS</h4>
              
              <div className="ys-filter-search-box">
                <Search size={14} className="ys-search-input-icon" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  className="ys-filter-input"
                />
              </div>

              <div className="ys-checkbox-list">
                {filteredAuthorsList.map((author) => {
                  const isChecked = selectedAuthors.includes(author);
                  return (
                    <label key={author} className="ys-checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => toggleAuthor(author)} 
                        className="ys-hidden-checkbox"
                      />
                      <span className={`ys-custom-checkbox ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <Check size={11} strokeWidth={3.5} />}
                      </span>
                      <span className="ys-checkbox-label">{author}</span>
                    </label>
                  );
                })}
              </div>

              {!authorSearch && (
                <button
                  type="button"
                  className="ys-see-more-btn"
                  onClick={() => setShowMoreAuthors(!showMoreAuthors)}
                >
                  <span>{showMoreAuthors ? 'See Less' : 'See More'}</span>
                  {showMoreAuthors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            <div className="ys-filter-divider" />

            {/* 4. CATEGORIES Section */}
            <div className="ys-filter-section">
              <h4 className="ys-filter-heading">CATEGORIES</h4>
              
              <div className="ys-filter-search-box">
                <Search size={14} className="ys-search-input-icon" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="ys-filter-input"
                />
              </div>

              <div className="ys-checkbox-list">
                {filteredCategoriesList.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label key={cat} className="ys-checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => toggleCategory(cat)} 
                        className="ys-hidden-checkbox"
                      />
                      <span className={`ys-custom-checkbox ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <Check size={11} strokeWidth={3.5} />}
                      </span>
                      <span className="ys-checkbox-label">{cat}</span>
                    </label>
                  );
                })}
              </div>

              {!categorySearch && (
                <button
                  type="button"
                  className="ys-see-more-btn"
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                >
                  <span>{showMoreCategories ? 'See Less' : 'See More'}</span>
                  {showMoreCategories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            <div className="ys-filter-divider" />

            {/* 5. TAGS Section */}
            <div className="ys-filter-section">
              <h4 className="ys-filter-heading">TAGS</h4>
              
              <div className="ys-filter-search-box">
                <Search size={14} className="ys-search-input-icon" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="ys-filter-input"
                />
              </div>

              <div className="ys-checkbox-list">
                {filteredTagsList.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <label key={tag} className="ys-checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => toggleTag(tag)} 
                        className="ys-hidden-checkbox"
                      />
                      <span className={`ys-custom-checkbox ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <span className="ys-checked-dot" />}
                      </span>
                      <span className={`ys-checkbox-label ${isChecked ? 'active-bold' : ''}`}>{tag}</span>
                    </label>
                  );
                })}
              </div>

              {!tagSearch && (
                <button
                  type="button"
                  className="ys-see-more-btn"
                  onClick={() => setShowMoreTags(!showMoreTags)}
                >
                  <span>{showMoreTags ? 'See Less' : 'See More'}</span>
                  {showMoreTags ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

          </aside>

          {/* Right Side Main Content */}
          <main className="ys-results-main">
            {/* Top Toolbar: Results count & Sort & Active Filters */}
            <div className="ys-results-top-bar">
              <div className="ys-results-count-text">
                Showing <strong>{filteredStories.length}</strong> {filteredStories.length === 1 ? 'story' : 'stories'}
                {selectedBrand ? (
                  <span> for brand: <span className="highlight-tag">"{selectedBrand}"</span></span>
                ) : (
                  <span> for tag: <span className="highlight-tag">"Just In"</span></span>
                )}
              </div>

              {hasActiveFilters && (
                <div className="ys-active-filters-row">
                  {selectedBrand && (
                    <button 
                      type="button" 
                      className="ys-active-filter-badge"
                      onClick={() => toggleBrand(selectedBrand)}
                      title="Remove brand filter"
                    >
                      Brand: {selectedBrand}
                      <X size={12} />
                    </button>
                  )}
                  {showVideosOnly && (
                    <button 
                      type="button" 
                      className="ys-active-filter-badge"
                      onClick={handleVideoToggle}
                      title="Remove video only filter"
                    >
                      Videos Only
                      <X size={12} />
                    </button>
                  )}
                  {selectedAuthors.map(author => (
                    <button 
                      key={author} 
                      type="button" 
                      className="ys-active-filter-badge"
                      onClick={() => toggleAuthor(author)}
                      title={`Remove author ${author}`}
                    >
                      Author: {author}
                      <X size={12} />
                    </button>
                  ))}
                  {selectedCategories.map(cat => (
                    <button 
                      key={cat} 
                      type="button" 
                      className="ys-active-filter-badge"
                      onClick={() => toggleCategory(cat)}
                      title={`Remove category ${cat}`}
                    >
                      Category: {cat}
                      <X size={12} />
                    </button>
                  ))}
                  {selectedTags.filter(t => t !== 'Just In').map(tag => (
                    <button 
                      key={tag} 
                      type="button" 
                      className="ys-active-filter-badge"
                      onClick={() => toggleTag(tag)}
                      title={`Remove tag ${tag}`}
                    >
                      Tag: {tag}
                      <X size={12} />
                    </button>
                  ))}
                  <button 
                    type="button" 
                    className="ys-clear-all-filters-btn"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* 3-Column Cards Grid */}
            {currentStories.length === 0 ? (
              <div className="just-in-empty-box">
                <h3>No stories found for the selected filters</h3>
                <p>Try clearing your filter selections to see more stories.</p>
                <button 
                  className="editorial-action-btn"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="ys-search-grid ys-grid-with-sidebar">
                {currentStories.map((story) => {
                  const saved = isSaved ? isSaved(story.id) : false;
                  const displayDate = story.formattedDate || '9/29/2026';
                  const displayCategory = story.categoryTag || story.topic || 'NEWS';

                  return (
                    <article 
                      key={story.id} 
                      className="ys-search-card"
                      onClick={() => onSelectStory(story)}
                    >
                      {/* Top Thumbnail with YS Watermark */}
                      <div className="ys-search-card-media">
                        <img 
                          src={story.image || (typeof story.featuredImage === 'string' ? story.featuredImage : story.featuredImage?.url) || story.fallbackImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'} 
                          alt={story.title} 
                          className="ys-search-card-img"
                          onError={(e) => {
                            const fb = story.fallbackImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
                            if (e.target.src !== fb) {
                              e.target.src = fb;
                            }
                          }}
                          loading="lazy"
                        />
                        <span className="ys-search-card-watermark">YS</span>
                      </div>

                      {/* Body: Date -> Title -> Bottom Category Tag & Actions */}
                      <div className="ys-search-card-body">
                        <span className="ys-search-card-date">{displayDate}</span>
                        <h3 className="ys-search-card-title">{story.title}</h3>

                        <div className="ys-search-card-footer">
                          <span className="ys-search-card-category">{displayCategory}</span>

                          <div className="ys-search-card-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                              type="button"
                              className={`ys-card-action-btn ${saved ? 'active' : ''}`}
                              onClick={() => onToggleSave(story)}
                              title={saved ? "Remove bookmark" : "Save article"}
                              aria-label="Save story"
                            >
                              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
                            </button>
                            <button 
                              type="button"
                              className="ys-card-action-btn"
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

            {/* Numbered Pagination Controls (< 1 2 3 ... >) */}
            {totalPages > 1 && (
              <div className="just-in-pagination-bar">
                <button
                  type="button"
                  className="pagination-step-btn"
                  onClick={() => handlePageClick(validPage - 1)}
                  disabled={validPage === 1}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="pagination-numbers-list">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-number-btn ${pageNum === validPage ? 'active' : ''}`}
                      onClick={() => handlePageClick(pageNum)}
                      aria-current={pageNum === validPage ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pagination-step-btn"
                  onClick={() => handlePageClick(validPage + 1)}
                  disabled={validPage === totalPages}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

