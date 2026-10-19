import { AuthService } from './authService';

const API_BASE = '/api/submissions';
const ADMIN_API_BASE = '/api/admin/submissions';

export const SubmissionService = {
  // Public: Submit pitch or contact inquiry
  async createSubmission(payload) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Submission failed');
    }
    return json;
  },

  // Admin: Get all submissions with filters
  async getAdminSubmissions(params = {}) {
    const token = AuthService.getToken();
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.limit) query.append('limit', params.limit);

    try {
      const res = await fetch(`${ADMIN_API_BASE}?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch submissions');
      }
      return json;
    } catch (err) {
      console.warn('Error fetching submissions:', err);
      return { success: false, data: [], metrics: { totalPitches: 0, totalContacts: 0, pendingCount: 0 } };
    }
  },

  // Admin: Update status / notes
  async updateSubmission(id, updateData) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update submission');
    }
    return json;
  },

  // Admin: Convert pitch into published article
  async convertToArticle(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${encodeURIComponent(id)}/convert-to-article`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to convert pitch');
    }
    return json;
  },

  // Admin: Delete submission
  async deleteSubmission(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete submission');
    }
    return true;
  }
};
