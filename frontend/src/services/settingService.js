import { AuthService } from './authService';

const API_BASE = '/api/settings';
const STORAGE_KEY = 'goreadpost_site_settings';

export const SettingService = {
  // Synchronous local cache for zero-delay instant render on page reload
  getLocalSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  async getSettings() {
    try {
      const res = await fetch(`${API_BASE}?_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          } catch (e) {}
          return json.data;
        }
      }
    } catch (e) {}

    // Resilient fallback to local cache
    return this.getLocalSettings();
  },

  async updateSettings(settingsData) {
    try {
      const res = await fetch(API_BASE, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(settingsData)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('settings:change', { detail: json.data }));
        }
        return json.data;
      }
      if (res.status === 401) {
        AuthService.handleUnauthorized?.(true);
      }
      throw new Error(json.message || 'Failed to update settings');
    } catch (e) {
      throw e;
    }
  }
};
