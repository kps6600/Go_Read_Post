import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Filter, ChevronDown } from 'lucide-react';
import { CommentService } from '../../services/commentService';
import './AdminCommentsView.css';

// Curated author & executive profile logos / avatars
const AUTHOR_LOGOS = {
  'Aditya Mathur': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'Rohit Shenoy': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'Priya Sundaram': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'Vikramaditya Shah': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80',
  'Ananya Deshmukh': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'Kunal Mehra': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'Neha Singhania': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'Editorial Desk': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80'
};

const DEFAULT_AVATAR_POOL = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80'
];

function getAuthorAvatar(comment) {
  if (comment.avatar) return comment.avatar;
  if (comment.authorAvatar) return comment.authorAvatar;
  if (comment.logo) return comment.logo;
  if (comment.userAvatar) return comment.userAvatar;
  
  const name = (comment.author || '').trim();
  if (AUTHOR_LOGOS[name]) return AUTHOR_LOGOS[name];

  if (!name) return DEFAULT_AVATAR_POOL[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_AVATAR_POOL[Math.abs(hash) % DEFAULT_AVATAR_POOL.length];
}

// Convert raw slug to pleasant content title
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
  const [contentsList, setContentsList] = useState([]);
  const [metrics, setMetrics] = useState({ 
    totalReviews: 0, 
    totalComments: 0, 
    approvedCount: 0, 
    pendingCount: 0, 
    rejectedHiddenCount: 0,
    rejectedCount: 0, 
    hiddenCount: 0,
    articlesCount: 0,
    videosCount: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [contentTypeFilter, setContentTypeFilter] = useState('all'); // 'all' | 'article' | 'video'
  const [selectedStorySlug, setSelectedStorySlug] = useState('all'); // 'all' | specific slug
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending_review' | 'approved' | 'rejected_hidden'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'likes'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Pagination & Page Size (Show 10 comments per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter Popover State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Rejection Reason Modal State
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    commentId: null,
    reason: '',
    selectedPreset: ''
  });

  // Inline Editorial Reply Box State: { [commentId]: { isOpen: boolean, text: string } }
  const [replyBoxes, setReplyBoxes] = useState({});

  useEffect(() => {
    loadContentsList();
  }, []);

  useEffect(() => {
    loadComments();
  }, [contentTypeFilter, selectedStorySlug, statusFilter, sortBy]);

  const loadContentsList = async () => {
    try {
      const data = await CommentService.getCommentedContents();
      if (Array.isArray(data)) {
        setContentsList(data);
      }
    } catch (err) {
      console.warn('Failed to load contents list:', err);
    }
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await CommentService.getAdminComments({
        contentType: contentTypeFilter,
        storySlug: selectedStorySlug,
        status: statusFilter,
        search: searchQuery,
        sortBy: sortBy,
        limit: 500
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

  const handleSyncComments = async () => {
    setIsSyncing(true);
    try {
      const res = await CommentService.syncComments();
      onShowToast?.(res.message || 'Comments synchronized successfully from database.');
      await loadComments();
      await loadContentsList();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to sync comments');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComments();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setLoading(true);
    CommentService.getAdminComments({ 
      contentType: contentTypeFilter,
      storySlug: selectedStorySlug,
      status: statusFilter, 
      search: '', 
      sortBy: sortBy,
      limit: 500 
    })
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
      const confirmed = window.confirm('Are you sure you want to hide this review? It will immediately disappear from the public website.');
      if (!confirmed) return;
    }

    setActionLoadingId(commentId);
    try {
      await CommentService.updateCommentStatus(commentId, nextStatus, rejectionReason);
      onShowToast?.(`Review marked as ${nextStatus.replace('_', ' ')}`);
      await loadComments();
      loadContentsList();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update review status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Pin / Unpin Comment
  const handleTogglePin = async (commentId, currentPinStatus) => {
    setActionLoadingId(commentId);
    try {
      const updated = await CommentService.togglePinComment(commentId, !currentPinStatus);
      onShowToast?.(updated.isPinned ? '📌 Review pinned to top of discussion' : 'Review unpinned');
      await loadComments();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to toggle pin status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open / Toggle Reply Box
  const toggleReplyBox = (commentId, existingReply = '') => {
    setReplyBoxes(prev => {
      const current = prev[commentId];
      if (current && current.isOpen) {
        return { ...prev, [commentId]: { isOpen: false, text: '' } };
      }
      return {
        ...prev,
        [commentId]: {
          isOpen: true,
          text: existingReply || ''
        }
      };
    });
  };

  // Submit Editorial Reply
  const handleSubmitReply = async (commentId) => {
    const box = replyBoxes[commentId];
    if (!box || !box.text.trim()) {
      onShowToast?.('Please write a reply before posting');
      return;
    }

    setActionLoadingId(commentId);
    try {
      await CommentService.adminReplyComment(commentId, box.text.trim(), 'Editorial Desk');
      onShowToast?.('Official Editorial Reply published');
      setReplyBoxes(prev => ({ ...prev, [commentId]: { isOpen: false, text: '' } }));
      await loadComments();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to post reply');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Editorial Reply
  const handleDeleteReply = async (commentId) => {
    if (!window.confirm('Are you sure you want to remove the editorial reply for this comment?')) return;
    setActionLoadingId(commentId);
    try {
      await CommentService.deleteAdminReply(commentId);
      onShowToast?.('Editorial reply removed');
      await loadComments();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to remove reply');
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
      loadContentsList();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to delete review');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Active Story / Video Info
  const activeContentInfo = useMemo(() => {
    if (selectedStorySlug === 'all') return null;
    return contentsList.find(c => c.storySlug.toLowerCase() === selectedStorySlug.toLowerCase());
  }, [selectedStorySlug, contentsList]);

  // Client-side Sort & Filter refinement
  const filteredSortedComments = useMemo(() => {
    let list = [...comments];

    // Content Type Filter
    if (contentTypeFilter !== 'all') {
      list = list.filter(c => (c.contentType || 'article').toLowerCase() === contentTypeFilter.toLowerCase());
    }

    // Specific Story / Video Filter
    if (selectedStorySlug !== 'all') {
      list = list.filter(c => (c.storySlug || '').toLowerCase() === selectedStorySlug.toLowerCase());
    }

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

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        (c.author || '').toLowerCase().includes(q) ||
        (c.text || '').toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.storySlug || '').toLowerCase().includes(q) ||
        (c.contentTitle || '').toLowerCase().includes(q) ||
        (c.userEmail || '').toLowerCase().includes(q) ||
        (c.rejection_reason || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      // Pinned always first unless specifically sorting by likes/oldest
      if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (Boolean(b.isPinned) !== Boolean(a.isPinned)) {
        return Boolean(b.isPinned) ? 1 : -1;
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return list;
  }, [comments, contentTypeFilter, selectedStorySlug, statusFilter, searchQuery, sortBy]);

  // Reset to first page when search or any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStorySlug, statusFilter, contentTypeFilter, sortBy]);

  // Total pages based on 10 cards per page
  const totalPages = Math.max(1, Math.ceil(filteredSortedComments.length / pageSize));

  // Automatically keep currentPage within valid range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Sliced reviews: exactly 10 cards shown at once per page
  const paginatedComments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSortedComments.slice(startIndex, startIndex + pageSize);
  }, [filteredSortedComments, currentPage, pageSize]);

  // Separate articles vs videos in dropdown options
  const articlesInList = useMemo(() => contentsList.filter(c => c.contentType === 'article'), [contentsList]);
  const videosInList = useMemo(() => contentsList.filter(c => c.contentType === 'video'), [contentsList]);

  return (
    <div className="acv-container">
      {/* ── 4 KPI Review Moderation Cards (Synchronized with selected filter) ── */}
      <div className="acv-stats-grid">
        {/* Total Reviews */}
        <div 
          className={`acv-kpi-card kpi-total ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
          title="Click to view all reviews"
        >
          <div className="acv-kpi-content">
            <span className="acv-kpi-label" style={{ color: '#475569' }}>
              Total Reviews
            </span>
            <div className="acv-kpi-number" style={{ color: '#0f172a' }}>
              {selectedStorySlug !== 'all' ? filteredSortedComments.length : (metrics.totalReviews || metrics.totalComments || comments.length)}
            </div>
          </div>
        </div>

        {/* Approved & Live */}
        <div 
          className={`acv-kpi-card kpi-approved ${statusFilter === 'approved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('approved')}
          title="Click to view approved & live reviews"
        >
          <div className="acv-kpi-content">
            <span className="acv-kpi-label" style={{ color: '#15803d' }}>
              Approved &amp; Live
            </span>
            <div className="acv-kpi-number" style={{ color: '#16a34a' }}>
              {selectedStorySlug !== 'all' ? filteredSortedComments.filter(c => (c.status || 'approved') === 'approved').length : (metrics.approvedCount || 0)}
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div 
          className={`acv-kpi-card kpi-pending ${statusFilter === 'pending_review' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending_review')}
          title="Click to view reviews pending moderation"
        >
          <div className="acv-kpi-content">
            <span className="acv-kpi-label" style={{ color: '#b45309' }}>
              Pending Review
            </span>
            <div className="acv-kpi-number" style={{ color: '#d97706' }}>
              {selectedStorySlug !== 'all' ? filteredSortedComments.filter(c => c.status === 'pending' || c.status === 'pending_review').length : (metrics.pendingCount || 0)}
            </div>
          </div>
        </div>

        {/* Rejected / Hidden */}
        <div 
          className={`acv-kpi-card kpi-rejected ${statusFilter === 'rejected_hidden' ? 'active' : ''}`}
          onClick={() => setStatusFilter('rejected_hidden')}
          title="Click to view rejected and hidden reviews"
        >
          <div className="acv-kpi-content">
            <span className="acv-kpi-label" style={{ color: '#b91c1c' }}>
              Rejected / Hidden
            </span>
            <div className="acv-kpi-number" style={{ color: '#dc2626' }}>
              {selectedStorySlug !== 'all' ? filteredSortedComments.filter(c => c.status === 'rejected' || c.status === 'hidden').length : (metrics.rejectedHiddenCount !== undefined ? metrics.rejectedHiddenCount : (metrics.rejectedCount || 0))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search & Sort Controls ── */}
      <div className="acv-toolbar">
        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} className="acv-search-box">
          <div className="acv-search-input-wrap">
            <Search size={15} className="acv-search-icon" />
            <input 
              type="text" 
              placeholder="Search author, comment text, article, or video title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="acv-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="acv-search-clear-btn" 
                onClick={handleClearSearch}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Unified Filter Button & Popover */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button 
              type="button" 
              className={`abv-filter-btn ${contentTypeFilter !== 'all' || sortBy !== 'newest' ? 'active' : ''} ${isFilterOpen ? 'open' : ''}`}
              onClick={() => setIsFilterOpen(prev => !prev)}
              title="Filter by Content Type & Sort Order"
            >
              <Filter size={14} className="abv-filter-icon" />
              <span>Filters</span>
              {(contentTypeFilter !== 'all' || sortBy !== 'newest') && (
                <span className="abv-filter-count-badge">
                  {(contentTypeFilter !== 'all' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)}
                </span>
              )}
              <ChevronDown size={13} className={`abv-filter-chevron ${isFilterOpen ? 'rotated' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="abv-filter-popover" style={{ minWidth: '260px' }}>
                <div className="abv-filter-popover-header">
                  <span className="abv-filter-popover-title">
                    <Filter size={13} />
                    <span>Filter Comments</span>
                  </span>
                  {(contentTypeFilter !== 'all' || sortBy !== 'newest') && (
                    <button 
                      type="button" 
                      className="abv-filter-reset-btn"
                      onClick={() => {
                        setContentTypeFilter('all');
                        setSortBy('newest');
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="abv-filter-popover-body">
                  {/* Content Type Filter */}
                  <div className="abv-filter-field">
                    <label className="abv-filter-label">CONTENT TYPE</label>
                    <select 
                      className="abv-popover-select"
                      value={contentTypeFilter} 
                      onChange={e => setContentTypeFilter(e.target.value)}
                    >
                      <option value="all">All (Articles &amp; Videos)</option>
                      <option value="article">Articles Only</option>
                      <option value="video">Videos Only</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="abv-filter-field">
                    <label className="abv-filter-label">SORT ORDER</label>
                    <select 
                      className="abv-popover-select"
                      value={sortBy} 
                      onChange={e => setSortBy(e.target.value)}
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="likes">Sort: Most Likes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* ── Reviews Feed ── */}
      {loading ? (
        <div className="acv-loading-state">
          <p>Loading discussions from database...</p>
        </div>
      ) : filteredSortedComments.length === 0 ? (
        <div className="acv-empty-box">
          <h3 className="acv-empty-title">No Reviews Found</h3>
          <p className="acv-empty-desc">
            {searchQuery 
              ? `No reviews matched your search for "${searchQuery}".` 
              : selectedStorySlug !== 'all'
              ? `There are no reviews for "${activeContentInfo?.contentTitle || selectedStorySlug}" under the current filter.`
              : statusFilter === 'pending_review'
              ? 'Great work! All reviews have been moderated. No reviews currently pending.'
              : statusFilter === 'approved'
              ? 'No approved reviews found in the database.'
              : statusFilter === 'rejected_hidden'
              ? 'No rejected or hidden reviews found.'
              : 'There are currently no review records matching these filters.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || selectedStorySlug !== 'all' || contentTypeFilter !== 'all' ) && (
            <button 
              type="button" 
              className="acv-refresh-btn" 
              onClick={() => { 
                setSearchQuery(''); 
                setStatusFilter('all'); 
                setSelectedStorySlug('all'); 
                setContentTypeFilter('all'); 
                }}
              style={{ margin: '0 auto' }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="acv-comments-list">
          {paginatedComments.map((comment) => {
            const commentId = comment._id || comment.id;
            const isProcessing = actionLoadingId === commentId;
            const rawStatus = (comment.status || 'approved').toLowerCase();
            const isPending = rawStatus === 'pending_review' || rawStatus === 'pending';
            const isApproved = rawStatus === 'approved';
            const isRejected = rawStatus === 'rejected';
            const isHidden = rawStatus === 'hidden';
            const isPinned = Boolean(comment.isPinned);
            const isVideo = comment.contentType === 'video';

            const avatarLogo = getAuthorAvatar(comment);
            const titleToShow = comment.contentTitle || formatSlugToTitle(comment.storySlug);
            const initialLetter = (comment.author || 'R').charAt(0).toUpperCase();
            const replyBoxState = replyBoxes[commentId] || { isOpen: false, text: '' };

            return (
              <div 
                key={commentId}
                className={`acv-comment-card status-${rawStatus} ${isPinned ? 'pinned-featured' : ''}`}
              >
                {/* Top Row: Avatar Logo, Author, Target Content Badge, Status & Pin */}
                <div className="acv-comment-top-row">
                  <div className="acv-author-cluster">
                    {/* Author Profile Logo / Avatar */}
                    <div className="acv-avatar-wrap">
                      <img 
                        src={avatarLogo} 
                        alt={comment.author || 'Author'} 
                        className="acv-avatar-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextElementSibling) {
                            e.target.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="acv-avatar-fallback">
                        {initialLetter}
                      </div>
                    </div>

                    {/* Author Details */}
                    <div className="acv-author-info">
                      <div className="acv-author-name-line">
                        <span className="acv-author-name">
                          {comment.author || 'Community Reader'}
                        </span>
                        {comment.role && (
                          <span className="acv-author-role">
                            • {comment.role}
                          </span>
                        )}
                      </div>

                      <div className="acv-meta-subline">
                        <span>{comment.time || (comment.createdAt ? new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently')}</span>
                        {comment.likes > 0 && (
                          <span className="acv-likes-pill">
                            • {comment.likes} likes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Content Indicator & Badges (No Icons) */}
                  <div className="acv-card-right-cluster">
                    {/* Target Article / Video Link & Badge */}
                    <button
                      type="button"
                      className="acv-content-item-badge"
                      onClick={() => {
                        if (selectedStorySlug === comment.storySlug) {
                          setSelectedStorySlug('all');
                        } else {
                          setSelectedStorySlug(comment.storySlug);
                        }
                      }}
                      title={`Filter by "${titleToShow}" (${isVideo ? 'Video' : 'Article'})`}
                    >
                      <span className="acv-cib-text">
                        <strong>{isVideo ? '[VIDEO]' : '[ARTICLE]'}</strong> {titleToShow}
                      </span>
                    </button>

                    {/* Pinned Badge */}
                    {isPinned && (
                      <span className="acv-pinned-badge" title="Pinned to top">
                        Pinned
                      </span>
                    )}

                    {/* Status Pill */}
                    <span className={`acv-status-badge ${isApproved ? 'status-approved approved' : ''} ${isPending ? 'status-pending pending' : ''} ${isRejected ? 'status-rejected rejected' : ''} ${isHidden ? 'status-hidden hidden' : ''}`}>
                      {isApproved && 'APPROVED'}
                      {isPending && 'PENDING'}
                      {isRejected && 'REJECTED'}
                      {isHidden && 'HIDDEN'}
                    </span>
                  </div>
                </div>

                {/* Comment Body */}
                <div 
                  className="acv-comment-body"
                >
                  "{comment.text}"
                </div>

                {/* Rejection Note if present */}
                {comment.rejection_reason && (
                  <div className="acv-rejection-box">
                    <div>
                      <strong>Rejection Note:</strong> {comment.rejection_reason}
                    </div>
                  </div>
                )}

                {/* ── Official Editorial Reply Display (If already replied) ── */}
                {comment.adminReply && comment.adminReply.text && (
                  <div className="acv-editorial-reply-box">
                    <div className="acv-erb-header">
                      <div className="acv-erb-badge">
                        <img 
                          src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=80" 
                          alt="Editorial Desk" 
                          className="acv-erb-avatar" 
                        />
                        <span className="acv-erb-title">{comment.adminReply.author || 'Editorial Desk'}</span>
                        <span className="acv-erb-tag">OFFICIAL STAFF RESPONSE</span>
                      </div>
                      <div className="acv-erb-actions">
                        <button
                          type="button"
                          className="acv-erb-btn edit"
                          onClick={() => toggleReplyBox(commentId, comment.adminReply.text)}
                          title="Edit this editorial response"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="acv-erb-btn delete"
                          onClick={() => handleDeleteReply(commentId)}
                          title="Remove editorial response"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="acv-erb-text">
                      {comment.adminReply.text}
                    </p>
                  </div>
                )}

                {/* ── Inline Editorial Reply Editor (When toggled open) ── */}
                {replyBoxState.isOpen && (
                  <div className="acv-reply-editor-wrap">
                    <div className="acv-rew-header">
                      <span className="acv-rew-title">
                        <span>Reply as <strong>Editorial Desk</strong>:</span>
                      </span>

                    </div>



                    <textarea
                      className="acv-modal-textarea"
                      placeholder="Write verified editorial perspective to be displayed publicly under this reader comment..."
                      rows={3}
                      value={replyBoxState.text}
                      onChange={e => setReplyBoxes(prev => ({
                        ...prev,
                        [commentId]: { ...prev[commentId], text: e.target.value }
                      }))}
                    />

                    <div className="acv-rew-footer">
                      <button
                        type="button"
                        className="acv-btn-delete"
                        onClick={() => toggleReplyBox(commentId)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="acv-btn-approve"
                        disabled={isProcessing || !replyBoxState.text.trim()}
                        onClick={() => handleSubmitReply(commentId)}
                      >
                        Publish Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions Row (No Icons, Solid Colors) */}
                <div className="acv-actions-row">
                  {/* Left Action: Pin to Top */}
                  <div className="acv-left-actions">
                    <button
                      type="button"
                      className={`acv-action-btn-pin ${isPinned ? 'is-pinned' : ''}`}
                      disabled={isProcessing}
                      onClick={() => handleTogglePin(commentId, isPinned)}
                      title={isPinned ? 'Unpin this comment' : 'Pin this comment to the top'}
                    >
                      <span>{isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
                    </button>




                  </div>

                  {/* Right Actions: Workflow Moderation */}
                  <div className="acv-right-actions">
                    {/* Actions for Pending Reviews */}
                    {isPending && (
                      <>
                        <button
                          type="button"
                          className="acv-btn-approve"
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(commentId, 'approved')}
                          title="Approve review and make it live on the public website"
                        >
                          <span>{isProcessing ? 'Updating...' : 'Approve & Publish'}</span>
                        </button>
                        <button
                          type="button"
                          className="acv-btn-reject"
                          disabled={isProcessing}
                          onClick={() => openRejectDialog(commentId)}
                          title="Reject review and keep out of public view"
                        >
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
                        >
                          <span>{isProcessing ? 'Updating...' : 'Hide from Public'}</span>
                        </button>
                        <button
                          type="button"
                          className="acv-btn-reject"
                          disabled={isProcessing}
                          onClick={() => openRejectDialog(commentId)}
                          title="Reject this review"
                        >
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
                        >
                          <span>{isProcessing ? 'Updating...' : 'Restore & Approve'}</span>
                        </button>
                        <button
                          type="button"
                          className="acv-btn-reevaluate"
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(commentId, 'pending_review')}
                          title="Move back to pending moderation"
                        >
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
                        >
                          <span>{isProcessing ? 'Updating...' : 'Unhide & Approve'}</span>
                        </button>
                        <button
                          type="button"
                          className="acv-btn-reevaluate"
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(commentId, 'pending_review')}
                          title="Move back to pending review"
                        >
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
                    >
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Modern Pagination Bar ── */}
        {totalPages > 1 && (
          <div className="acv-pagination-bar">
            <div className="acv-pagination-info">
              Showing <span className="acv-pg-bold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="acv-pg-bold">{Math.min(currentPage * pageSize, filteredSortedComments.length)}</span> of{' '}
              <span className="acv-pg-bold">{filteredSortedComments.length}</span> reviews
            </div>

            <div className="acv-pagination-actions">
              <button
                type="button"
                className="acv-page-nav-btn"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 320, behavior: 'smooth' });
                }}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="acv-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return (
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 2
                    );
                  })
                  .reduce((acc, page, idx, arr) => {
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                      acc.push(`ellipsis-${page}`);
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map(item => {
                    if (typeof item === 'string') {
                      return <span key={item} className="acv-page-ellipsis">…</span>;
                    }
                    return (
                      <button
                        key={item}
                        type="button"
                        className={`acv-page-number-btn ${currentPage === item ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentPage(item);
                          window.scrollTo({ top: 320, behavior: 'smooth' });
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
              </div>

              <button
                type="button"
                className="acv-page-nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 320, behavior: 'smooth' });
                }}
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </>
    )}

      {/* ── Rejection Reason Modal ── */}
      {rejectModal.isOpen && (
        <div className="acv-modal-overlay" onClick={closeRejectDialog}>
          <div className="acv-modal-card" onClick={e => e.stopPropagation()}>
            <div className="acv-modal-header">
              <h3 className="acv-modal-title">
                <span>Reject Review</span>
              </h3>
              <button 
                type="button" 
                onClick={closeRejectDialog}
                className="acv-modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="acv-modal-body">
              <p style={{ fontSize: '0.84rem', color: '#0f172a', margin: '0 0 0.5rem' }}>
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
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
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
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
