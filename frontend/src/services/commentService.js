import { AuthService } from './authService';

const API_BASE = '/api/comments';
const ADMIN_API_BASE = '/api/admin/comments';

export const CommentService = {
  /**
   * Fetch all approved comments for a given story slug (public)
   * @param {string} slug 
   * @returns {Promise<Array>}
   */
  async getComments(slug) {
    if (!slug) return [];
    try {
      const res = await fetch(`${API_BASE}?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch comments from server:', err);
      return [];
    }
  },

  /**
   * Post a new review/perspective permanently to the database.
   * Review is created with 'pending_review' status on the server.
   * @param {string} storySlug 
   * @param {{ author: string, role: string, text: string }} payload 
   * @returns {Promise<{ data: Object, message: string }>}
   */
  async postComment(storySlug, { author, role, text }) {
    if (!storySlug || !text) {
      throw new Error('Story identifier and comment text are required');
    }
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Please sign in to share your perspective.');
    }

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        storySlug,
        author: author || 'Community Reader',
        role: role || 'Community Member',
        text
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to submit perspective');
    }
    return {
      data: json.data,
      message: json.message || 'Your perspective has been submitted for editorial review.'
    };
  },

  /**
   * Toggle like for a comment in the database (1 like per user or unlike)
   * @param {string|number} commentId 
   * @param {string} [userId]
   * @returns {Promise<{ likes: number, liked: boolean }>}
   */
  async likeComment(commentId, userId) {
    if (!commentId) return { likes: 0, liked: false };
    try {
      const token = AuthService.getToken();
      const res = await fetch(`${API_BASE}/${encodeURIComponent(commentId)}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId })
      });
      const json = await res.json();
      if (json && json.success) {
        return {
          likes: json.likes,
          liked: Boolean(json.liked)
        };
      }
    } catch (err) {
      console.warn('Failed to toggle like on server:', err);
    }
    return { likes: 0, liked: false };
  },

  /**
   * Update an existing perspective (Owner or Admin)
   * @param {string|number} commentId 
   * @param {string} text 
   * @returns {Promise<Object>}
   */
  async updateComment(commentId, text) {
    if (!commentId || !text) {
      throw new Error('Comment identifier and updated text are required');
    }
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Please sign in to update your perspective.');
    }
    const res = await fetch(`${API_BASE}/${encodeURIComponent(commentId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update perspective');
    }
    return json.data;
  },

  /**
   * Delete a perspective (Owner or Admin)
   * @param {string|number} commentId 
   * @returns {Promise<boolean>}
   */
  async deleteComment(commentId) {
    if (!commentId) return false;
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Please sign in to delete your perspective.');
    }
    const res = await fetch(`${API_BASE}/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete perspective');
    }
    return true;
  },

  /**
   * Admin: Fetch all reviews/comments with tabs, filters, search, sorting & database statistics
   * @param {{ status?: string, search?: string, sortBy?: string, limit?: number, page?: number }} params
   */
  async getAdminComments(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.limit) query.append('limit', params.limit);
    if (params.page) query.append('page', params.page);

    try {
      const res = await fetch(`${ADMIN_API_BASE}?${query.toString()}`, {
        headers: AuthService.getAdminHeaders()
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch reviews');
      }
      return json;
    } catch (err) {
      console.warn('Error fetching admin reviews:', err);
      return { 
        success: false, 
        data: [], 
        metrics: { 
          totalReviews: 0, 
          totalComments: 0, 
          approvedCount: 0, 
          pendingCount: 0, 
          rejectedHiddenCount: 0,
          rejectedCount: 0, 
          hiddenCount: 0 
        } 
      };
    }
  },

  /**
   * Admin: Update review status (approved, rejected, hidden, pending_review)
   * @param {string|number} commentId 
   * @param {'approved'|'rejected'|'hidden'|'pending_review'} status 
   * @param {string} [rejectionReason]
   */
  async updateCommentStatus(commentId, status, rejectionReason = '') {
    const res = await fetch(`${ADMIN_API_BASE}/${encodeURIComponent(commentId)}/status`, {
      method: 'PUT',
      headers: AuthService.getAdminHeaders(),
      body: JSON.stringify({ 
        status, 
        rejection_reason: rejectionReason 
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update review status');
    }
    return json;
  },

  /**
   * Admin: Bulk update status for multiple reviews
   * @param {Array<string>} ids 
   * @param {'approved'|'rejected'|'hidden'|'pending_review'} status 
   * @param {string} [rejectionReason] 
   */
  async bulkUpdateStatus(ids, status, rejectionReason = '') {
    const res = await fetch(`${ADMIN_API_BASE}/bulk/status`, {
      method: 'PUT',
      headers: AuthService.getAdminHeaders(),
      body: JSON.stringify({ 
        ids, 
        status, 
        rejection_reason: rejectionReason 
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to perform bulk update');
    }
    return json;
  },

  /**
   * Admin: Bulk delete multiple reviews permanently
   * @param {Array<string>} ids 
   */
  async bulkDeleteComments(ids) {
    const res = await fetch(`${ADMIN_API_BASE}/bulk-delete`, {
      method: 'POST',
      headers: AuthService.getAdminHeaders(),
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete reviews');
    }
    return json;
  },

  /**
   * Admin: Delete review permanently
   */
  async adminDeleteComment(commentId) {
    const res = await fetch(`${ADMIN_API_BASE}/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: AuthService.getAdminHeaders()
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete review');
    }
    return true;
  }
};
