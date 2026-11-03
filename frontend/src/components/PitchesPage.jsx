import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, Search, Filter, Sparkles, Plus, ExternalLink, Calendar, 
  User, CheckCircle2, Clock, FileText, Tv, X, ChevronRight, ArrowLeft,
  TrendingUp, Globe, Building, AlertCircle
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
        <div className="pp-kpi-card">
          <div className="pp-kpi-icon" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
            <FileText size={20} />
          </div>
          <div className="pp-kpi-info">
            <span className="pp-kpi-num">{totalCount}</span>
            <span className="pp-kpi-label">Total Story Pitches</span>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
            <Tv size={20} />
          </div>
          <div className="pp-kpi-info">
            <span className="pp-kpi-num">{videoPitchesCount}</span>
            <span className="pp-kpi-label">Video Productions</span>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
            <Sparkles size={20} />
          </div>
          <div className="pp-kpi-info">
            <span className="pp-kpi-num">{articlePitchesCount}</span>
            <span className="pp-kpi-label">Article Story Briefs</span>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="pp-kpi-info">
            <span className="pp-kpi-num">{pendingCount}</span>
            <span className="pp-kpi-label">In Review Desk</span>
          </div>
        </div>
      </div>

      {/* Interactive Search & Filter Toolbar */}
      <div className="pp-toolbar">
        <div className="pp-search-box">
          <Search size={16} color="#94a3b8" />
          <input 
            type="text"
            className="pp-search-input"
            placeholder="Search pitches by headline, founder, author, or sector..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="pp-search-clear" 
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="pp-filters-right">
          <button 
            type="button"
            className={`pp-filter-pill ${formatFilter === 'all' ? 'active' : ''}`}
            onClick={() => setFormatFilter('all')}
          >
            All Formats ({totalCount})
          </button>
          <button 
            type="button"
            className={`pp-filter-pill ${formatFilter === 'article' ? 'active' : ''}`}
            onClick={() => setFormatFilter('article')}
          >
            Article Pitches ({articlePitchesCount})
          </button>
          <button 
            type="button"
            className={`pp-filter-pill ${formatFilter === 'video' ? 'active' : ''}`}
            onClick={() => setFormatFilter('video')}
          >
            Video Shows ({videoPitchesCount})
          </button>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--bg-card, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">In Review</option>
            <option value="approved">Approved</option>
          </select>

          <button 
            type="button" 
            className="pp-hero-action-btn"
            style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: '8px' }}
            onClick={onOpenPitchModal}
            title="Submit a new story pitch"
          >
            <Plus size={15} />
            <span>Pitch a Story</span>
          </button>
        </div>
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
            className="pp-hero-action-btn"
            style={{ margin: '0 auto', fontSize: '0.84rem', padding: '8px 18px' }}
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

