import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, CheckCircle2, XCircle, Clock, Trash2, 
  Search, Filter, RefreshCw, ExternalLink, ThumbsUp, AlertCircle, Eye
} from 'lucide-react';
import { CommentService } from '../../services/commentService';

export default function AdminCommentsView({ onShowToast }) {
  const [comments, setComments] = useState([]);
  const [metrics, setMetrics] = useState({ totalComments: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadComments();
  }, [statusFilter]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await CommentService.getAdminComments({
        status: statusFilter,
        search: searchQuery
      });
      if (res && res.data) {
        setComments(res.data);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComments();
  };

  const handleUpdateStatus = async (commentId, nextStatus) => {
    setActionLoadingId(commentId);
    try {
      await CommentService.updateCommentStatus(commentId, nextStatus);
      setComments(prev => prev.map(c => (c._id === commentId || c.id === commentId) ? { ...c, status: nextStatus } : c));
      onShowToast?.(`Comment marked as ${nextStatus}`);
      loadComments();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this comment from the database?')) return;
    setActionLoadingId(commentId);
    try {
      await CommentService.adminDeleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId && c.id !== commentId));
      onShowToast?.('Comment permanently removed from database.');
      loadComments();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to delete comment');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="admin-posts-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Reader Discussions & Perspectives
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Moderate reader comments submitted across articles and community editorial discussions.
          </p>
        </div>
        <button 
          className="admin-btn-secondary" 
          onClick={loadComments} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} className={loading ? 'spin-anim' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="adv-stats-row" style={{ marginBottom: '1.5rem' }}>
        <div className="adv-stat-card">
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
            <MessageSquare size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Total Perspectives</span>
            <div className="adv-stat-number">{metrics.totalComments || comments.length}</div>
            <span className="adv-stat-sub">Across all live articles</span>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Approved &amp; Live</span>
            <div className="adv-stat-number">{metrics.approvedCount}</div>
            <span className="adv-stat-sub">Visible to public readers</span>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Pending Review</span>
            <div className="adv-stat-number">{metrics.pendingCount}</div>
            <span className="adv-stat-sub">Awaiting moderation</span>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626' }}>
            <XCircle size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Rejected / Hidden</span>
            <div className="adv-stat-number">{metrics.rejectedCount}</div>
            <span className="adv-stat-sub">Flagged or policy filtered</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="adv-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'All Comments' },
            { id: 'approved', label: 'Approved' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'rejected', label: 'Rejected' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`adv-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '280px' }}>
          <div className="adv-search-box" style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search perspectives, author, story..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px' }}
            />
          </div>
          <button type="submit" className="admin-btn-secondary" style={{ height: '38px' }}>Search</button>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="admin-loading-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 12px' }} />
          <p>Loading perspectives from database...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="admin-empty-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
          <MessageSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, fontWeight: 700 }}>No comments found</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No perspectives matched your current status filter or query.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map((comment) => {
            const commentId = comment._id || comment.id;
            const isProcessing = actionLoadingId === commentId;

            return (
              <div 
                key={commentId}
                className="admin-comment-row-card"
                style={{
                  background: 'var(--bg-card, #fff)',
                  border: '1px solid var(--border-light, #e2e8f0)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  transition: 'box-shadow 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'var(--brand-light, rgba(225,29,72,0.1))',
                        color: 'var(--brand-primary, #dc2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      {(comment.author || 'R').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 750, color: 'var(--text-primary)' }}>{comment.author}</span>
                        {comment.role && (
                          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {comment.role}
                          </span>
                        )}
                        {comment.userEmail && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ({comment.userEmail})
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>Posted {comment.time || new Date(comment.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ThumbsUp size={12} /> {comment.likes || 0} Likes
                        </span>
                        {comment.storySlug && (
                          <>
                            <span>•</span>
                            <a 
                              href={`/articles/${comment.storySlug}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--brand-primary)', textDecoration: 'none' }}
                              title="View Article Page"
                            >
                              <span>Slug: /{comment.storySlug}</span>
                              <ExternalLink size={12} />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span 
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: comment.status === 'approved' ? 'rgba(16, 185, 129, 0.12)' : (comment.status === 'rejected' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
                        color: comment.status === 'approved' ? '#059669' : (comment.status === 'rejected' ? '#dc2626' : '#d97706')
                      }}
                    >
                      {comment.status || 'approved'}
                    </span>
                  </div>
                </div>

                {/* Perspective Text Body */}
                <div 
                  style={{
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                    color: 'var(--text-primary)',
                    background: '#f8fafc',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--brand-primary, #dc2626)'
                  }}
                >
                  "{comment.text}"
                </div>

                {/* Actions Bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-light, #f1f5f9)', paddingTop: '0.75rem' }}>
                  {comment.status !== 'approved' && (
                    <button
                      className="admin-btn-secondary"
                      style={{ height: '32px', fontSize: '0.8rem', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(commentId, 'approved')}
                    >
                      <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
                      Approve &amp; Show Live
                    </button>
                  )}

                  {comment.status !== 'rejected' && (
                    <button
                      className="admin-btn-secondary"
                      style={{ height: '32px', fontSize: '0.8rem', color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(commentId, 'rejected')}
                    >
                      <XCircle size={14} style={{ marginRight: '4px' }} />
                      Reject / Hide
                    </button>
                  )}

                  <button
                    className="admin-btn-secondary"
                    style={{ height: '32px', fontSize: '0.8rem', color: '#64748b' }}
                    disabled={isProcessing}
                    onClick={() => handleDelete(commentId)}
                    title="Delete permanently from database"
                  >
                    <Trash2 size={14} style={{ marginRight: '4px' }} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
