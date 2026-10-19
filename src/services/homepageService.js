import { AuthService } from './authService';

export const HomepageService = {
  async getPublicHomepage(all = false) {
    try {
      const url = all ? '/api/homepage?all=true' : '/api/homepage';
      const res = await fetch(url);
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (e) {
      return [];
    }
  },

  async getAdminSections() {
    try {
      const token = AuthService.getToken();
      const res = await fetch('/api/admin/homepage', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {}

    // Fallback: fetch all sections (including disabled) from homepage endpoint
    return this.getPublicHomepage(true);
  },

  async updateSections(sections) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/homepage', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ sections })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update homepage');
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('homepage:change', { detail: json.data }));
    return json.data;
  },

  async updateSection(sectionKey, data) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/homepage/${sectionKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update section');
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('homepage:change', { detail: json.data }));
    return json.data;
  }
};
