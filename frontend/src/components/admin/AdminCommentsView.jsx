import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, CheckCircle2, XCircle, Clock, Trash2, 
  Search, RefreshCw, ExternalLink, ThumbsUp, AlertCircle, 
  Eye, EyeOff, CheckSquare, X, ShieldAlert, Check, ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { CommentService } from '../../services/commentService';
import './AdminCommentsView.css';

// Avatar background gradient generator
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
];

function getAvatarGradient(name) {
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

// Convert raw slug to pleasant article title
function formatSlugToTitle(slug) {
  if (!slug) return 'Community Story';
  const clean = slug.replace(/^target-was-/, '').replace(/-/g, ' ');
  return clean.replace(/\b\w/g, c => c.toUpperCase());
}

const PRESET_REJECTION_REASONS = [
  'Spam or Promotional Content',
  'Violates Community Guidelines',
  'Off-Topic or Irrelevant',
  'Inappropriate or Offensive Language',
  'Unverified Claims / Misinformation'
];

export default function AdminCommentsView({ onShowToast }) {
  const [comments, setComments] = useState([]);
  const [metrics, setMetrics] = useState({ 
    totalReviews: 0, 
    totalComments: 0, 
    approvedCount: 0, 
    pendingCount: 0, 
    rejectedHiddenCount: 0,
    rejectedCount: 0, 
    hiddenCount: 0 
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending_review' | 'approved' | 'rejected_hidden'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'likes'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Rejection Reason Modal State
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    commentId: null,
    reason: '',
    selectedPreset: ''
  });

  useEffect(() => {
    loadComments();
  }, [statusFilter, sortBy]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await CommentService.getAdminComments({
        status: statusFilter,
        search: searchQuery,
        sortBy: sortBy
      });
      if (res && res.data) {
        setComments(res.data);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComments();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setLoading(true);
    CommentService.getAdminComments({ status: statusFilter, search: '', sortBy: sortBy })
      .then(res => {
        if (res && res.data) {
          setComments(res.data);
          if (res.metrics) setMetrics(res.metrics);
        }
      })
      .finally(() => setLoading(false));
  };

  // Status Updater (Approve, Hide, Move to Pending)
  const handleUpdateStatus = async (commentId, nextStatus, rejectionReason = '') => {
    if (nextStatus === 'hidden') {
      const confirmed = window.confirm('Are you sure you want to hide this approved review? It will immediately disappear from the public website.');
      if (!confirmed) return;
    }

    setActionLoadingId(commentId);
    try {
      await CommentService.updateCommentStatus(commentId, nextStatus, rejectionReason);
      onShowToast?.(`Review marked as ${nextStatus.replace('_', ' ')}`);
      await loadComments();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update review status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Rejection Dialog
  const openRejectDialog = (commentId) => {
    setRejectModal({
      isOpen: true,
      commentId,
      reason: '',
      selectedPreset: ''
    });
  };

  const closeRejectDialog = () => {
    setRejectModal({
      isOpen: false,
      commentId: null,
      reason: '',
      selectedPreset: ''
    });
  };

  const handleConfirmReject = async () => {
    const finalReason = rejectModal.reason.trim() || rejectModal.selectedPreset || 'Does not meet editorial guidelines';
    const { commentId } = rejectModal;
    closeRejectDialog();

    if (commentId) {
      await handleUpdateStatus(commentId, 'rejected', finalReason);
    }
  };

  // Single Delete
  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review from the database? This action cannot be undone.')) return;
    setActionLoadingId(commentId);
    try {
      await CommentService.adminDeleteComment(commentId);
      onShowToast?.('Review permanently removed from database.');
      await loadComments();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to delete review');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Client-side Sort & Filter refinement
  const filteredSortedComments = useMemo(() => {
    let list = [...comments];

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending_review') {
        list = list.filter(c => c.status === 'pending_review' || c.status === 'pending');
      } else if (statusFilter === 'rejected_hidden') {
        list = list.filter(c => c.status === 'rejected' || c.status === 'hidden');
      } else {
        list = list.filter(c => (c.status || 'approved').toLowerCase() === statusFilter.toLowerCase());
      }
    }

    // Search query filter (instant client-side fallback)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        (c.author || '').toLowerCase().includes(q) ||
        (c.text || '').toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.storySlug || '').toLowerCase().includes(q) ||
        (c.userEmail || '').toLowerCase().includes(q) ||
        (c.rejection_reason || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // 'newest' default
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return list;
  }, [comments, statusFilter, searchQuery, sortBy]);

  return (
    <div className="acv-container" style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* ── Top Header ── */}
      <div className="acv-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="acv-page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Reader Discussions &amp; Moderation
        </h1>
      </div>

      {/* ── 4 KPI Cards in One Horizontal Line (Clean Minimal) ── */}
      <div 
        className="acv-stats-grid" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}
      >
        {/* Total Reviews */}
        <div 
          className={`acv-kpi-card ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
          title="Click to view all reviews"
          style={{
            background: '#ffffff',
            border: statusFilter === 'all' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            boxShadow: statusFilter === 'all' ? '0 0 0 2px rgba(220, 38, 38, 0.15), 0 4px 12px rgba(220, 38, 38, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="acv-kpi-content" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="acv-kpi-label" style={{ fontSize: '0.74rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
              Total Reviews
            </span>
            <div className="acv-kpi-number" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.15 }}>
              {metrics.totalReviews || metrics.totalComments || comments.length}
            </div>
          </div>
        </div>

        {/* Approved & Live */}
        <div 
          className={`acv-kpi-card ${statusFilter === 'approved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('approved')}
          title="Click to view approved & live reviews"
          style={{
            background: '#ffffff',
            border: statusFilter === 'approved' ? '2px solid #059669' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            boxShadow: statusFilter === 'approved' ? '0 0 0 2px rgba(5, 150, 105, 0.15), 0 4px 12px rgba(5, 150, 105, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="acv-kpi-content" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="acv-kpi-label" style={{ fontSize: '0.74rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
              Approved &amp; Live
            </span>
            <div className="acv-kpi-number" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#059669', lineHeight: 1.15 }}>
              {metrics.approvedCount || 0}
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div 
          className={`acv-kpi-card ${statusFilter === 'pending_review' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending_review')}
          title="Click to view reviews pending moderation"
          style={{
            background: '#ffffff',
            border: statusFilter === 'pending_review' ? '2px solid #d97706' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            boxShadow: statusFilter === 'pending_review' ? '0 0 0 2px rgba(217, 119, 6, 0.15), 0 4px 12px rgba(217, 119, 6, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="acv-kpi-content" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="acv-kpi-label" style={{ fontSize: '0.74rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
              Pending Review
            </span>
            <div className="acv-kpi-number" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#d97706', lineHeight: 1.15 }}>
              {metrics.pendingCount || 0}
            </div>
          </div>
        </div>

        {/* Rejected / Hidden */}
        <div 
          className={`acv-kpi-card ${statusFilter === 'rejected_hidden' ? 'active' : ''}`}
          onClick={() => setStatusFilter('rejected_hidden')}
          title="Click to view rejected and hidden reviews"
          style={{
            background: '#ffffff',
            border: statusFilter === 'rejected_hidden' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            boxShadow: statusFilter === 'rejected_hidden' ? '0 0 0 2px rgba(220, 38, 38, 0.15), 0 4px 12px rgba(220, 38, 38, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="acv-kpi-content" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="acv-kpi-label" style={{ fontSize: '0.74rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
              Rejected / Hidden
            </span>
            <div className="acv-kpi-number" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#dc2626', lineHeight: 1.15 }}>
              {metrics.rejectedHiddenCount !== undefined ? metrics.rejectedHiddenCount : (metrics.rejectedCount || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Full-Width Search & Sort Controls ── */}
      <div className="acv-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', width: '100%' }}>
        {/* Search Box: Full Width */}
        <form onSubmit={handleSearchSubmit} className="acv-search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', color: '#94a3b8', pointerEvents: 'none' }} />
          <input 
            type="text" 
            placeholder="Search author, content, story..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="acv-search-input"
            style={{
              width: '100%',
              height: '42px',
              padding: '0 2.25rem 0 2.6rem',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '0.88rem',
              background: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="acv-search-clear-btn" 
              onClick={handleClearSearch}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Sort Dropdown */}
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)} 
          className="acv-sort-select"
          style={{
            height: '42px',
            padding: '0 1rem',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: '#ffffff',
            color: '#334155',
            outline: 'none',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="likes">Sort: Most Likes</option>
        </select>
      </div>

      {/* ── Results Count Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.25rem 0.75rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
        <span>Showing {filteredSortedComments.length} {filteredSortedComments.length === 1 ? 'review' : 'reviews'}</span>
      </div>

      {/* ── Reviews Feed ── */}
      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <RefreshCw size={26} color="#dc2626" className="spin-anim" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>Loading review records from database...</p>
        </div>
      ) : filteredSortedComments.length === 0 ? (
        <div className="acv-empty-box">
          <div className="acv-empty-icon-wrap">
            <MessageSquare size={28} />
          </div>
          <h3 className="acv-empty-title">No Reviews Found</h3>
          <p className="acv-empty-desc">
            {searchQuery 
              ? `No reviews matched your search for "${searchQuery}".` 
              : statusFilter === 'pending_review'
              ? 'Great work! All reviews have been moderated. No reviews currently pending.'
              : statusFilter === 'approved'
              ? 'No approved reviews found in the database.'
              : statusFilter === 'rejected_hidden'
              ? 'No rejected or hidden reviews found.'
              : 'There are currently no review records in the database.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button 
              type="button"
              className="acv-refresh-btn" 
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              style={{ margin: '0 auto' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="acv-comments-list">
          {filteredSortedComments.map((comment) => {
            const commentId = comment._id || comment.id;
            const isProcessing = actionLoadingId === commentId;
            const rawStatus = (comment.status || 'approved').toLowerCase();
            const isPending = rawStatus === 'pending_review' || rawStatus === 'pending';
            const isApproved = rawStatus === 'approved';
            const isRejected = rawStatus === 'rejected';
            const isHidden = rawStatus === 'hidden';
            
            const avatarGrad = getAvatarGradient(comment.author || 'Reader');
            const articleTitle = formatSlugToTitle(comment.storySlug);
            const initialLetter = (comment.author || 'R').charAt(0).toUpperCase();

            return (
              <div 
                key={commentId}
                className={`acv-comment-card status-${rawStatus}`}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                  marginBottom: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Top Row: Logo, Name, Date/Time */}
                <div className="acv-comment-top-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div className="acv-author-cluster" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Logo / Avatar */}
                    <div 
                      className="acv-avatar" 
                      style={{ 
                        background: avatarGrad,
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        minHeight: '42px',
                        maxWidth: '42px',
                        maxHeight: '42px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                        flexShrink: 0
                      }}
                    >
                      {initialLetter}
                    </div>

                    {/* Author Details: Name and Date/Time */}
                    <div className="acv-author-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div className="acv-author-name-line" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="acv-author-name" style={{ fontSize: '0.95rem', fontWeight: 750, color: '#0f172a' }}>
                          {comment.author || 'Community Reader'}
                        </span>
                      </div>

                      <div className="acv-meta-subline" style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        <span>{comment.time || (comment.createdAt ? new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Body */}
                <div 
                  className="acv-comment-body"
                  style={{
                    fontSize: '0.94rem',
                    lineHeight: 1.6,
                    color: '#1e293b',
                    background: '#f8fafc',
                    padding: '0.9rem 1.15rem',
                    borderRadius: '10px',
                    borderLeft: isApproved ? '3px solid #10b981' : isPending ? '3px solid #f59e0b' : '3px solid #ef4444',
                    fontStyle: 'italic'
                  }}
                >
                  "{comment.text}"
                </div>

                {/* Rejection Note if present */}
                {comment.rejection_reason && (
                  <div 
                    className="acv-rejection-box"
                    style={{
                      marginTop: '0.4rem',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '8px',
                      padding: '0.6rem 0.85rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.82rem',
                      color: '#be123c',
                      lineHeight: 1.45
                    }}
                  >
                    <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontWeight: 750, color: '#9f1239' }}>Rejection Note:</strong> {comment.rejection_reason}
                    </div>
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div 
                  className="acv-actions-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Actions for Pending Reviews */}
                  {isPending && (
                    <>
                      <button
                        type="button"
                        className="acv-btn-approve"
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(commentId, 'approved')}
                        title="Approve review and make it live on the public website"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#059669',
                          padding: '6px 13px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isProcessing ? 'Updating...' : 'Approve & Publish'}</span>
                      </button>
                      <button
                        type="button"
                        className="acv-btn-reject"
                        disabled={isProcessing}
                        onClick={() => openRejectDialog(commentId, false)}
                        title="Reject review and keep out of public view"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#fef2f2',
                          border: '1px solid #fecdd3',
                          color: '#dc2626',
                          padding: '6px 13px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <XCircle size={14} />
                        <span>{isProcessing ? 'Updating...' : 'Reject Review'}</span>
                      </button>
                    </>
                  )}

                  {/* Actions for Approved Reviews */}
                  {isApproved && (
                    <>
                      <button
                        type="button"
                        className="acv-btn-hide"
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(commentId, 'hidden')}
                        title="Hide approved review immediately from public view"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: '6px 13px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <EyeOff size={14} />
                        <span>{isProcessing ? 'Updating...' : 'Hide from Public'}</span>
                      </button>
                      <button
                        type="button"
                        className="acv-btn-reject"
                        disabled={isProcessing}
                        onClick={() => openRejectDialog(commentId, false)}
                        title="Reject this review"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#fef2f2',
                          border: '1px solid #fecdd3',
                          color: '#dc2626',
                          padding: '6px 13px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* Actions for Rejected Reviews */}
                  {isRejected && (
                    <>
                      <button
                        type="button"
                        className="acv-btn-restore"
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(commentId, 'approved')}
                        title="Restore and approve this review"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#16a34a',
                          padding: '6px 13px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isProcessing ? 'Updating...' : 'Restore & Approve'}</span>
                      </button>
                      <button
                        type="button"
                        className="acv-btn-delete"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#fffbeb',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#d97706',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 650,
                          cursor: 'pointer'
                        }}
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(commentId, 'pending_review')}
                        title="Move back to pending moderation"
                      >
                        <RotateCcw size={13} />
                        <span>Re-evaluate</span>
                      </button>
                    </>
                  )}

                  {/* Actions for Hidden Reviews */}
                  {isHidden && (
                    <>
                      <button
                        type="button"
                        className="acv-btn-restore"
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(commentId, 'approved')}
                        title="Unhide and make visible publicly"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#16a34a',
                          padding: '6px 13px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} />
                        <span>{isProcessing ? 'Updating...' : 'Unhide & Approve'}</span>
                      </button>
                      <button
                        type="button"
                        className="acv-btn-delete"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#fffbeb',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#d97706',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 650,
                          cursor: 'pointer'
                        }}
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(commentId, 'pending_review')}
                        title="Move back to pending review"
                      >
                        <RotateCcw size={13} />
                        <span>Move to Pending</span>
                      </button>
                    </>
                  )}

                  {/* Permanent Delete */}
                  <button
                    type="button"
                    className="acv-btn-delete"
                    disabled={isProcessing}
                    onClick={() => handleDelete(commentId)}
                    title="Permanently remove from database"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rejection Reason Modal ── */}
      {rejectModal.isOpen && (
        <div className="acv-modal-overlay" onClick={closeRejectDialog}>
          <div className="acv-modal-card" onClick={e => e.stopPropagation()}>
            <div className="acv-modal-header">
              <h3 className="acv-modal-title">
                <ShieldAlert size={18} color="#dc2626" />
                <span>Reject Review</span>
              </h3>
              <button 
                type="button" 
                onClick={closeRejectDialog}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="acv-modal-body">
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 0.5rem' }}>
                Select an editorial policy reason or enter custom moderation notes for rejecting this content:
              </p>

              {/* Preset Quick Tags */}
              <div className="acv-preset-tags">
                {PRESET_REJECTION_REASONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`acv-preset-tag ${rejectModal.selectedPreset === preset ? 'selected' : ''}`}
                    onClick={() => {
                      setRejectModal(prev => ({
                        ...prev,
                        selectedPreset: prev.selectedPreset === preset ? '' : preset,
                        reason: prev.selectedPreset === preset ? prev.reason : preset
                      }));
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom Textarea */}
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Moderation Reason / Rejection Note:
              </label>
              <textarea
                className="acv-modal-textarea"
                placeholder="Explain why this review was rejected..."
                value={rejectModal.reason}
                onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="acv-modal-footer">
              <button
                type="button"
                className="acv-btn-delete"
                onClick={closeRejectDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="acv-btn-reject"
                onClick={handleConfirmReject}
              >
                <XCircle size={14} />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
