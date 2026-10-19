import { AuthService } from './authService';

const API_BASE = '/api/comments';

export const CommentService = {
  /**
   * Fetch all comments for a given story slug
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
   * Post a new perspective permanently to the database
   * @param {string} storySlug 
   * @param {{ author: string, role: string, text: string }} payload 
   * @returns {Promise<Object>}
   */
  async postComment(storySlug, { author, role, text }) {
    if (!storySlug || !text) {
      throw new Error('Story identifier and comment text are required');
    }
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Please sign in to post your perspective.');
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
    return json.data;
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
   * Admin: Fetch all comments with filters & stats
   */
  async getAdminComments(params = {}) {
    const token = AuthService.getToken();
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.limit) query.append('limit', params.limit);

    try {
      const res = await fetch(`/api/admin/comments?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch comments');
      }
      return json;
    } catch (err) {
      console.warn('Error fetching admin comments:', err);
      return { success: false, data: [], metrics: { totalComments: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 } };
    }
  },

  /**
   * Admin: Update comment status (approved, pending, rejected)
   */
  async updateCommentStatus(commentId, status) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/comments/${encodeURIComponent(commentId)}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update status');
    }
    return json;
  },

  /**
   * Admin: Delete comment
   */
  async adminDeleteComment(commentId) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/comments/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete comment');
    }
    return true;
  }
};
