import React, { useState, useEffect } from 'react';
import { 
  Send, Mail, Building, Link, DollarSign, CheckCircle, Clock, 
  Trash2, Search, Filter, RefreshCw, Sparkles, BookOpen, 
  ArrowUpRight, AlertCircle, FileText, Phone, User, Film
} from 'lucide-react';
import { SubmissionService } from '../../services/submissionService';
import './AdminSubmissionsView.css';

export default function AdminSubmissionsView({ onShowToast, onNavigate }) {
  const [submissions, setSubmissions] = useState([]);
  const [metrics, setMetrics] = useState({ totalPitches: 0, totalContacts: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'pitch' | 'contact'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'reviewing' | 'published' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, [typeFilter, statusFilter]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await SubmissionService.getAdminSubmissions({
        type: typeFilter,
        status: statusFilter,
        search: searchQuery
      });
      if (res && res.data) {
        const activeSubmissions = res.data.filter(s => s.status !== 'published');
        setSubmissions(activeSubmissions);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadSubmissions();
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    setActionId(id);
    try {
      await SubmissionService.updateSubmission(id, { status: nextStatus });
      setSubmissions(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, status: nextStatus } : s));
      onShowToast?.(`Status updated to ${nextStatus}`);
      loadSubmissions();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const handleConvertToArticle = async (id, pitchFormat) => {
    setActionId(id);
    try {
      const targetSub = submissions.find(s => String(s._id || s.id) === String(id));
      setSubmissions(prev => prev.filter(s => String(s._id || s.id) !== String(id)));
      if (targetSub) {
        setMetrics(prev => ({
          ...prev,
          totalPitches: Math.max(0, (prev.totalPitches || 0) - 1),
          pendingCount: targetSub.status === 'pending' ? Math.max(0, (prev.pendingCount || 0) - 1) : (prev.pendingCount || 0)
        }));
      }

      const res = await SubmissionService.convertToArticle(id);
      const isVideo = pitchFormat === 'video';
      onShowToast?.(res.message || (isVideo ? 'Video Story approved & published live!' : 'Pitch successfully published as article!'));
      await loadSubmissions();

      if (res.article?._id && onNavigate) {
        setTimeout(() => {
          onNavigate('/admin/articles');
        }, 1200);
      } else if (res.video?._id && onNavigate) {
        setTimeout(() => {
          onNavigate('/admin/videos');
        }, 1200);
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to publish story');
    } finally {
      setActionId(null);
    }
  };

  
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!submissionToDelete) return;
    const id = String(submissionToDelete._id || submissionToDelete.id || '');
    setDeleting(true);
    setActionId(id);
    try {
      // Optimistic instant removal
      setSubmissions(prev => prev.filter(s => String(s._id || s.id) !== id));
      setMetrics(prev => ({
        ...prev,
        totalPitches: submissionToDelete.type === 'pitch' ? Math.max(0, (prev.totalPitches || 0) - 1) : (prev.totalPitches || 0),
        totalContacts: submissionToDelete.type === 'contact' ? Math.max(0, (prev.totalContacts || 0) - 1) : (prev.totalContacts || 0),
        pendingCount: submissionToDelete.status === 'pending' ? Math.max(0, (prev.pendingCount || 0) - 1) : (prev.pendingCount || 0)
      }));

      await SubmissionService.deleteSubmission(id);
      onShowToast?.('Submission deleted successfully.');
      setSubmissionToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      onShowToast?.(err.message || 'Failed to delete submission');
      loadSubmissions();
    } finally {
      setDeleting(false);
      setActionId(null);
    }
  };


  return (
    <div className="admin-posts-container">
      

      {/* KPI Stats */}
      <div className="adv-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Story &amp; Startup Pitches</span>
            <div className="adv-stat-number">{metrics.totalPitches}</div>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Contact Inquiries</span>
            <div className="adv-stat-number">{metrics.totalContacts}</div>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Pending Action</span>
            <div className="adv-stat-number">{metrics.pendingCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="adv-filter-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', minWidth: '260px' }}>
          <div className="adv-search-box" style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search startup, author, headline..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px' }}
            />
          </div>
          <button type="submit" className="admin-btn-secondary" style={{ height: '38px' }}>Search</button>
        </form>
      </div>

      {/* Submissions Feed */}
      {loading ? (
        <div className="admin-loading-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 12px' }} />
          <p>Loading submissions from database...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="admin-empty-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
          <Send size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, fontWeight: 700 }}>No submissions found</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No story pitches or contact leads matched your criteria.</p>
        </div>
      ) : (
        <div className="asv-cards-grid">
          {submissions.filter(s => s.status !== 'published').map((sub) => {
            const subId = sub._id || sub.id;
            const isPitch = sub.type === 'pitch';
            const isVideo = sub.pitchFormat === 'video';
            const isBusy = actionId === subId;

            const authorOrFounder = sub.founderName || sub.authorName || sub.name || 'Contributing Author';
            const role = sub.founderRole || (isVideo ? 'Video Creator' : (isPitch ? 'Author / Contributor' : 'Inbound Inquirer'));
            const headlineTitle = isPitch ? (sub.headline || sub.title || sub.startupName || 'Untitled Story Pitch') : (sub.subject || 'Direct Inbound Inquiry');
            
            // Thumbnail selection
            const defaultCover = isVideo 
              ? 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80';
            const thumbUrl = sub.coverImage || sub.image || (isPitch ? defaultCover : null);
            const authorInitial = (authorOrFounder.charAt(0) || 'A').toUpperCase();

            return (
              <div key={subId} className="asv-card">
                {/* 16:9 Media Header */}
                {thumbUrl ? (
                  <div className="asv-card-media">
                    <img 
                      src={thumbUrl} 
                      alt={headlineTitle} 
                      className="asv-card-img" 
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultCover;
                      }}
                    />
                    <div className="asv-card-overlay" />

                    {/* Top-Left Format Badge */}
                    <span className={`asv-format-badge ${isVideo ? 'pitch-video' : 'pitch-article'}`}>
                      {isVideo ? <Film size={12} /> : <FileText size={12} />}
                      <span>{isVideo ? 'Video Pitch' : 'Article Pitch'}</span>
                    </span>

                    {/* Top-Right Status Pill */}
                    <span className={`asv-status-pill ${sub.status === 'reviewing' ? 'reviewing' : 'pending'}`}>
                      <span className="asv-status-dot" />
                      <span>{sub.status === 'reviewing' ? 'In Review' : 'Pending'}</span>
                    </span>

                    {/* Bottom-Left Startup / Sector Pill */}
                    {(sub.startupName || sub.sector) && (
                      <span className="asv-media-meta-pill">
                        <Building size={11} style={{ flexShrink: 0 }} />
                        <span>{sub.startupName || sub.sector}</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="asv-card-media-contact">
                    {/* Top-Left Format Badge */}
                    <span className="asv-format-badge contact">
                      <Mail size={12} />
                      <span>Contact Inbound</span>
                    </span>

                    {/* Top-Right Status Pill */}
                    <span className={`asv-status-pill ${sub.status === 'reviewing' ? 'reviewing' : 'pending'}`}>
                      {sub.status || 'pending'}
                    </span>

                    <div className="asv-contact-icon-bubble">
                      <Mail size={24} />
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>
                      DIRECT INQUIRY LEAD
                    </div>
                  </div>
                )}

                {/* Card Body */}
                <div className="asv-card-body">
                  
                  {/* Title */}
                  <h3 className="asv-card-title" title={headlineTitle}>
                    {headlineTitle}
                  </h3>

                  {/* Summary / Excerpt */}
                  <p className="asv-card-summary" title={sub.summary || sub.message}>
                    {sub.summary || sub.message}
                  </p>



                  {/* Submitter Meta Row */}
                  <div className="asv-author-row">
                    <div className="asv-author-avatar">
                      {authorInitial}
                    </div>
                    <div className="asv-author-info">
                      <div className="asv-author-name">{authorOrFounder}</div>
                      <div className="asv-author-meta-sub">
                        <span>{role}</span>
                        <span>•</span>
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="asv-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    {isPitch && (
                      <button
                        type="button"
                        className="asv-btn-approve"
                        disabled={isBusy}
                        onClick={() => handleConvertToArticle(subId, sub.pitchFormat)}
                      >
                        <Sparkles size={14} style={{ flexShrink: 0 }} />
                        <span>Approve & Publish</span>
                      </button>
                    )}

                    {sub.status !== 'reviewing' ? (
                      <button
                        type="button"
                        className="asv-btn-review"
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(subId, 'reviewing')}
                      >
                        <Clock size={13} style={{ flexShrink: 0 }} />
                        <span>Mark In Review</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="asv-btn-review"
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(subId, 'pending')}
                        title="Move back to pending queue"
                      >
                        <Clock size={13} style={{ flexShrink: 0 }} />
                        <span>Set Pending</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="asv-btn-delete"
                    disabled={isBusy}
                    onClick={() => setSubmissionToDelete(sub)}
                    title="Delete submission"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* ── Delete Confirmation Modal ── */}
      {submissionToDelete && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => !deleting && setSubmissionToDelete(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Delete Submission?</h3>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.82rem' }}>This action cannot be undone.</p>
              </div>
            </div>

            <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>"{submissionToDelete.startupName || submissionToDelete.headline || submissionToDelete.subject || 'this submission'}"</strong>? It will be removed from database.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setSubmissionToDelete(null)}
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)'
                }}
              >
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}