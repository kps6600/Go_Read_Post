import { AuthService } from './authService';

const API_BASE = '/api/videos';
const ADMIN_API_BASE = '/api/admin/videos';

export const VideoService = {
  // Public: Fetch published videos
  async getVideos(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.featured) query.append('featured', 'true');
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.limit) query.append('limit', params.limit);

    try {
      const res = await fetch(`${API_BASE}?${query.toString()}`);
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err) {
      console.warn('Error fetching videos from API:', err.message);
      return [];
    }
  },

  // Public: Fetch video by slug or ID
  async getVideoBySlugOrId(idOrSlug) {
    if (!idOrSlug) return null;
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(idOrSlug)}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        return json.data;
      }
      return null;
    } catch (err) {
      console.warn('Error fetching video by slug/id:', err.message);
      return null;
    }
  },

  // Admin: Fetch all videos (including drafts, archived)
  async getAdminVideos(params = {}) {
    const token = AuthService.getToken();
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.limit) query.append('limit', params.limit);

    try {
      const res = await fetch(`${ADMIN_API_BASE}?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err) {
      console.warn('Error fetching admin videos:', err.message);
      return [];
    }
  },

  // Admin: Create video
  async createVideo(videoData) {
    const token = AuthService.getToken();
    const res = await fetch(ADMIN_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(videoData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create video');
    }
    return json.data;
  },

  // Admin: Update video
  async updateVideo(id, videoData) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(videoData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update video');
    }
    return json.data;
  },

  // Admin: Delete video
  async deleteVideo(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete video');
    }
    return true;
  }
};
