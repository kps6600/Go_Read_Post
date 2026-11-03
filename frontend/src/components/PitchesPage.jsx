import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, Search, Filter, Sparkles, Plus, ExternalLink, Calendar, 
  User, CheckCircle2, Clock, FileText, Tv, X, ChevronRight, ArrowLeft,
  TrendingUp, Globe, Building, AlertCircle, ChevronDown
} from 'lucide-react';
import { SubmissionService } from '../services/submissionService';
import './PitchesPage.css';

export default function PitchesPage({ 
  onBack, 
  onOpenPitchModal, 
  currentUser, 
  onShowToast 
}) {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | 'article' | 'video'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'reviewing' | 'approved'
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setFilterMenuOpen(false);
      }
    };
    if (filterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterMenuOpen]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    SubmissionService.getPublicPitches({ type: 'pitch', limit: 100 })
      .then(res => {
        if (!isMounted) return;
        const items = res?.data || [];
        setPitches(items);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('Failed to load pitches:', err);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Filtered list
  const filteredPitches = useMemo(() => {
    return pitches.filter(p => {
      // 1. Format filter
      if (formatFilter === 'article' && p.pitchFormat === 'video') return false;
      if (formatFilter === 'video' && p.pitchFormat !== 'video') return false;

      // 2. Status filter
      if (statusFilter !== 'all' && (p.status || 'pending').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const headline = (p.headline || p.title || p.startupName || '').toLowerCase();
        const summary = (p.summary || p.details || '').toLowerCase();
        const founder = (p.founderName || p.name || p.authorName || '').toLowerCase();
        const sector = (p.sector || p.category || '').toLowerCase();
        return headline.includes(q) || summary.includes(q) || founder.includes(q) || sector.includes(q);
      }

      return true;
    });
  }, [pitches, formatFilter, statusFilter, searchQuery]);

  // Statistics
  const totalCount = pitches.length;
  const articlePitchesCount = pitches.filter(p => p.pitchFormat !== 'video').length;
  const videoPitchesCount = pitches.filter(p => p.pitchFormat === 'video').length;
  const pendingCount = pitches.filter(p => (p.status || 'pending') === 'pending').length;
  const activeFiltersCount = (formatFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  return (
    <div className="pitches-page-root">
      {/* Breadcrumb Navigation */}
      <div className="pp-breadcrumb">
        <button type="button" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Home</span>
        </button>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary, #0f172a)', fontWeight: 600 }}>Pitches &amp; Author Studio</span>
      </div>

      {/* Metric KPI Row */}
      <div className="pp-kpi-row">
        <div 
          className={`pp-kpi-card pp-kpi-total ${formatFilter === 'all' && statusFilter === 'all' ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => { setFormatFilter('all'); setStatusFilter('all'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFormatFilter('all'); setStatusFilter('all'); } }}
          title="Click to view all story pitches"
        >
          <div className="pp-kpi-info">
            <span className="pp-kpi-num">{totalCount}</span>
            <span className="pp-kpi-label">Total Story Pitches</span>
          </div>
        </div>

        <div 
          className={`pp-kpi-card pp-kpi-video ${formatFilter === 'video' ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => { setFormatFilter('video'); if (statusFilter !== 'all') setStatusFilter('all'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFormatFilter('video'); if (statusFilter !== 'all') setStatusFilter('all'); } }}
          title="Click to filter video productions"
        >
          <div className="pp-kpi-info">
            <span className="pp-kpi-num">{videoPitchesCount}</span>
            <span className="pp-kpi-label">Video Productions</span>
          </div>
        </div>

        <div 
          className={`pp-kpi-card pp-kpi-article ${formatFilter === 'article' ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => { setFormatFilter('article'); if (statusFilter !== 'all') setStatusFilter('all'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFormatFilter('article'); if (statusFilter !== 'all') setStatusFilter('all'); } }}
          title="Click to filter article story briefs"
        >
          <div className="pp-kpi-info">
            <span className="pp-kpi-num">{articlePitchesCount}</span>
            <span className="pp-kpi-label">Article Story Briefs</span>
          </div>
        </div>

        <div 
          className={`pp-kpi-card pp-kpi-pending ${statusFilter === 'pending' || statusFilter === 'reviewing' ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => { setFormatFilter('all'); setStatusFilter('pending'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFormatFilter('all'); setStatusFilter('pending'); } }}
          title="Click to filter pitches in review"
        >
          <div className="pp-kpi-info">
            <span className="pp-kpi-num">{pendingCount}</span>
            <span className="pp-kpi-label">In Review Desk</span>
          </div>
        </div>
      </div>

      {/* Modern High-End Toolbar: Searchbar + One Filter Button + Primary CTA */}
      <div className="pp-toolbar-container">
        <div className="pp-toolbar-single-row">
          {/* 1. Search Input Bar */}
          <div className="pp-search-input-wrap">
            <Search size={18} className="pp-search-icon" />
            <input 
              type="text"
              className="pp-search-input-field"
              placeholder="Search pitches by headline, founder, author, or sector..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="pp-search-clear-btn" 
                onClick={() => setSearchQuery('')}
                title="Clear search query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* 2. One Filter Button after Searchbar */}
          <div className="pp-filter-dropdown-container" ref={filterMenuRef}>
            <button 
              type="button"
              className={`pp-filter-toggle-btn ${activeFiltersCount > 0 || filterMenuOpen ? 'active' : ''}`}
              onClick={() => setFilterMenuOpen(prev => !prev)}
              aria-expanded={filterMenuOpen}
              title="Filter pitches by format and status"
            >
              <Filter size={15} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="pp-filter-active-count">{activeFiltersCount}</span>
              )}
              <ChevronDown size={14} className={`pp-filter-chevron ${filterMenuOpen ? 'rotated' : ''}`} />
            </button>

            {/* Floating Filter Popover */}
            {filterMenuOpen && (
              <div className="pp-filter-popover" role="dialog">
                <div className="pp-popover-header">
                  <span className="pp-popover-title">Filter Pitches</span>
                  {activeFiltersCount > 0 && (
                    <button 
                      type="button" 
                      className="pp-popover-reset"
                      onClick={() => {
                        setFormatFilter('all');
                        setStatusFilter('all');
                      }}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Format Filter Section */}
                <div className="pp-popover-section">
                  <span className="pp-popover-label">Format</span>
                  <div className="pp-popover-options">
                    <button
                      type="button"
                      className={`pp-popover-option ${formatFilter === 'all' ? 'active' : ''}`}
                      onClick={() => { setFormatFilter('all'); setFilterMenuOpen(false); }}
                    >
                      <span>All Formats</span>
                      <span className="pp-option-badge">{totalCount}</span>
                    </button>
                    <button
                      type="button"
                      className={`pp-popover-option ${formatFilter === 'article' ? 'active' : ''}`}
                      onClick={() => { setFormatFilter('article'); setFilterMenuOpen(false); }}
                    >
                      <span>Article Pitches</span>
                      <span className="pp-option-badge">{articlePitchesCount}</span>
                    </button>
                    <button
                      type="button"
                      className={`pp-popover-option ${formatFilter === 'video' ? 'active' : ''}`}
                      onClick={() => { setFormatFilter('video'); setFilterMenuOpen(false); }}
                    >
                      <span>Video Shows</span>
                      <span className="pp-option-badge">{videoPitchesCount}</span>
                    </button>
                  </div>
                </div>

                {/* Status Filter Section */}
                <div className="pp-popover-section">
                  <span className="pp-popover-label">Review Status</span>
                  <div className="pp-popover-options">
                    <button
                      type="button"
                      className={`pp-popover-option ${statusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => { setStatusFilter('all'); setFilterMenuOpen(false); }}
                    >
                      <span>All Statuses</span>
                    </button>
                    <button
                      type="button"
                      className={`pp-popover-option ${statusFilter === 'pending' ? 'active' : ''}`}
                      onClick={() => { setStatusFilter('pending'); setFilterMenuOpen(false); }}
                    >
                      <span>Pending Review</span>
                    </button>
                    <button
                      type="button"
                      className={`pp-popover-option ${statusFilter === 'reviewing' ? 'active' : ''}`}
                      onClick={() => { setStatusFilter('reviewing'); setFilterMenuOpen(false); }}
                    >
                      <span>In Review</span>
                    </button>
                    <button
                      type="button"
                      className={`pp-popover-option ${statusFilter === 'approved' ? 'active' : ''}`}
                      onClick={() => { setStatusFilter('approved'); setFilterMenuOpen(false); }}
                    >
                      <span>Approved</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Primary CTA: Pitch a Story */}
          <button 
            type="button" 
            className="pp-primary-cta"
            onClick={onOpenPitchModal}
            title="Submit a new story pitch"
          >
            <Plus size={16} />
            <span>Pitch a Story</span>
          </button>
        </div>

        {/* Optional Active Filters Strip & Results Count */}
        {(activeFiltersCount > 0 || searchQuery.trim()) && (
          <div className="pp-active-filter-tags">
            {formatFilter !== 'all' && (
              <span className="pp-active-tag">
                <span>{formatFilter === 'article' ? 'Article Pitches' : 'Video Shows'}</span>
                <button type="button" onClick={() => setFormatFilter('all')} title="Remove filter"><X size={12} /></button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="pp-active-tag">
                <span style={{ textTransform: 'capitalize' }}>Status: {statusFilter}</span>
                <button type="button" onClick={() => setStatusFilter('all')} title="Remove filter"><X size={12} /></button>
              </span>
            )}
            <span className="pp-search-count-pill">
              Showing <strong>{filteredPitches.length}</strong> {filteredPitches.length === 1 ? 'pitch' : 'pitches'}
            </span>
          </div>
        )}
      </div>

      {/* Grid of Pitches */}
      {loading ? (
        <div className="pp-empty-card">
          <Clock size={36} className="pp-empty-icon" />
          <h3 style={{ margin: '0 0 6px', fontWeight: 700 }}>Loading pitches content...</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Gathering submitted story briefs from database.</p>
        </div>
      ) : filteredPitches.length === 0 ? (
        <div className="pp-empty-card">
          <Send size={40} className="pp-empty-icon" />
          <h3 style={{ margin: '0 0 8px', fontWeight: 750, color: 'var(--text-primary, #0f172a)' }}>No pitches found</h3>
          <p style={{ margin: '0 0 18px', fontSize: '0.9rem' }}>
            {searchQuery ? `No story pitches matched "${searchQuery}".` : 'No pitches available under this filter.'}
          </p>
          <button 
            type="button"
            className="pp-primary-cta"
            style={{ margin: '0 auto' }}
            onClick={onOpenPitchModal}
          >
            <Plus size={16} />
            <span>Submit a New Pitch</span>
          </button>
        </div>
      ) : (
        <div className="pp-grid">
          {filteredPitches.map(pitch => {
            const isVideo = pitch.pitchFormat === 'video';
            const img = pitch.coverImage || (isVideo 
              ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80');
            const headline = pitch.headline || pitch.title || pitch.startupName || 'Story Pitch';
            const sector = pitch.sector || pitch.category || 'Venture & Startups';
            const author = pitch.founderName || pitch.name || pitch.authorName || 'Contributing Author';
            const dateStr = pitch.createdAt 
              ? new Date(pitch.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recent';

            const status = (pitch.status || 'pending').toLowerCase();
            const statusBg = status === 'approved' ? '#dcfce7' : status === 'reviewing' ? '#e0e7ff' : '#fef3c7';
            const statusColor = status === 'approved' ? '#166534' : status === 'reviewing' ? '#3730a3' : '#92400e';

            return (
              <div key={pitch._id || pitch.id} className="pp-card">
                <div className="pp-card-media">
                  <img 
                    src={img} 
                    alt={headline} 
                    className="pp-card-img"
                    onError={e => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="pp-card-badge-strip">
                    <span 
                      className="pp-format-badge"
                      style={{ background: isVideo ? 'rgba(124, 58, 237, 0.85)' : 'rgba(220, 38, 38, 0.85)' }}
                    >
                      {isVideo ? <Tv size={12} /> : <FileText size={12} />}
                      <span>{isVideo ? 'Video Pitch' : 'Article Pitch'}</span>
                    </span>

                    <span 
                      className="pp-status-badge"
                      style={{ background: statusBg, color: statusColor }}
                    >
                      {pitch.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="pp-card-body">
                  <div className="pp-card-sector-row">
                    <span className="pp-card-sector">{sector}</span>
                    {pitch.stage && <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{pitch.stage}</span>}
                  </div>

                  <h3 className="pp-card-title" title={headline}>
                    {headline}
                  </h3>

                  <p className="pp-card-summary">
                    {pitch.summary || pitch.details || 'Pitch narrative submitted to GoReadPost editorial desk.'}
                  </p>

                  {pitch.metricMoat && (
                    <div className="pp-card-moat">
                      <TrendingUp size={13} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pitch.metricMoat}
                      </span>
                    </div>
                  )}

                  <div className="pp-card-footer">
                    <div className="pp-card-author">
                      <span className="pp-card-author-name">{author}</span>
                      <span className="pp-card-author-date">{dateStr}</span>
                    </div>

                    <button 
                      type="button" 
                      className="pp-view-btn"
                      onClick={() => setSelectedPitch(pitch)}
                      title="View pitch brief"
                    >
                      <span>Brief</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pitch Detail Modal */}
      {selectedPitch && (
        <div className="pp-modal-backdrop" onClick={() => setSelectedPitch(null)}>
          <div className="pp-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="pp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: selectedPitch.pitchFormat === 'video' ? '#f3e8ff' : '#fee2e2',
                    color: selectedPitch.pitchFormat === 'video' ? '#7c3aed' : '#dc2626'
                  }}
                >
                  {selectedPitch.pitchFormat === 'video' ? 'Video Pitch' : 'Article Pitch'}
                </span>
                <h3>{selectedPitch.headline || selectedPitch.title || selectedPitch.startupName}</h3>
              </div>
              <button 
                type="button" 
                className="pp-modal-close"
                onClick={() => setSelectedPitch(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="pp-modal-body">
              {selectedPitch.coverImage && (
                <img 
                  src={selectedPitch.coverImage} 
                  alt="Pitch cover" 
                  className="pp-modal-img" 
                />
              )}

              <div>
                <div className="pp-modal-section-title">Executive Summary</div>
                <div className="pp-modal-narrative">
                  {selectedPitch.summary || selectedPitch.details || 'No summary text provided.'}
                </div>
              </div>

              {selectedPitch.details && selectedPitch.details !== selectedPitch.summary && (
                <div>
                  <div className="pp-modal-section-title">Extended Pitch Narrative &amp; Story Angles</div>
                  <div className="pp-modal-narrative" style={{ whiteSpace: 'pre-line' }}>
                    {selectedPitch.details}
                  </div>
                </div>
              )}

              <div className="pp-meta-grid">
                <div className="pp-meta-item">
                  <span className="pp-modal-section-title">Submitter / Author</span>
                  <span className="pp-meta-val">{selectedPitch.founderName || selectedPitch.name || selectedPitch.authorName || 'Not specified'}</span>
                </div>
                <div className="pp-meta-item">
                  <span className="pp-modal-section-title">Sector / Category</span>
                  <span className="pp-meta-val">{selectedPitch.sector || selectedPitch.category || 'General'}</span>
                </div>
                {selectedPitch.stage && (
                  <div className="pp-meta-item">
                    <span className="pp-modal-section-title">Venture Stage</span>
                    <span className="pp-meta-val">{selectedPitch.stage}</span>
                  </div>
                )}
                {selectedPitch.website && (
                  <div className="pp-meta-item">
                    <span className="pp-modal-section-title">Website</span>
                    <a 
                      href={selectedPitch.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>{selectedPitch.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
