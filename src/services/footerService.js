import { AuthService } from './authService';

export const FooterService = {
  async getFooter() {
    try {
      const res = await fetch('/api/footer');
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (e) {
      return null;
    }
  },

  async getAdminFooter() {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/footer', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async updateFooter(data) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/footer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update footer');

    // Broadcast footer update event to instantly refresh live components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('footer:change', { detail: json.data }));
    }

    return json.data;
  }
};
