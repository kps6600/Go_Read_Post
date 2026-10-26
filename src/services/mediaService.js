import { AuthService } from './authService';

const API_BASE = '/api/media';

export const MediaService = {
  // Get all media files (supports both getFiles and getMedia aliases)
  async getMedia() {
    try {
      const token = AuthService.getToken();
      const res = await fetch(API_BASE, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json.data;
      }
    } catch (e) {
      console.warn('MediaService.getMedia error:', e);
    }
    return [];
  },

  async getFiles() {
    return this.getMedia();
  },

  // Upload media using base64 payload
  async uploadMedia(base64Data, filename) {
    const token = AuthService.getToken();
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ base64Data, filename })
    });
    const json = await res.json();
    if (res.ok && json.success) return json.data;
    throw new Error(json.message || 'Media upload failed');
  },

  // Upload browser File object (supports uploadFile alias)
  async uploadFile(file) {
    if (typeof file === 'string') {
      const res = await this.uploadMedia(file, 'image');
      return { file: res, ...res };
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await this.uploadMedia(reader.result, file.name);
          resolve({ file: res, ...res });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk'));
      reader.readAsDataURL(file);
    });
  },

  // Delete media file (supports both deleteFile and deleteMedia aliases)
  async deleteMedia(filename) {
    const token = AuthService.getToken();
    const res = await fetch(`${API_BASE}/${filename}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (res.ok && json.success) return true;
    throw new Error(json.message || 'Failed to delete file');
  },

  async deleteFile(filename) {
    return this.deleteMedia(filename);
  },

  async bulkDelete(ids) {
    const token = AuthService.getToken();
    const res = await fetch(`${API_BASE}/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (res.ok && json.success) return json;
    throw new Error(json.message || 'Failed to bulk delete media');
  }
};
