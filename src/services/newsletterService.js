// Service for GoReadPost Newsletter Publications, Dispatches, and Subscriptions

const API_BASE = '/api/newsletters';

export const NewsletterService = {
  async getPublications() {
    try {
      const res = await fetch(`${API_BASE}/publications`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.success && Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.warn('Failed to fetch publications from backend, using fallback:', err.message);
      return [];
    }
  },

  async getDispatches() {
    try {
      const res = await fetch(`${API_BASE}/dispatches`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.success && Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.warn('Failed to fetch dispatches from backend, using fallback:', err.message);
      return [];
    }
  },

  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.success && data.data ? data.data : null;
    } catch (err) {
      console.warn('Failed to fetch stats from backend:', err.message);
      return null;
    }
  },

  async subscribe({ email, publications = [], source = 'newsletter_page' }) {
    try {
      const res = await fetch(`${API_BASE}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, publications, source })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Subscription failed. Please check your email.');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Admin: Get all subscribers
  async getAdminSubscribers() {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    try {
      const res = await fetch(`${API_BASE}/admin/subscribers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      return data.success && Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.warn('Error fetching subscribers:', err.message);
      return [];
    }
  },

  // Admin: Add subscriber
  async addSubscriber({ email, publications, status = 'Active' }) {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    const res = await fetch(`${API_BASE}/admin/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email, publications, status })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to add subscriber');
    return data.data;
  },

  // Admin: Delete subscriber
  async deleteSubscriber(id) {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    const res = await fetch(`${API_BASE}/admin/subscribers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete subscriber');
    return true;
  },

  // Admin: Get all publications
  async getAdminPublications() {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    try {
      const res = await fetch(`${API_BASE}/admin/publications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      return data.success && Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.warn('Error fetching admin publications:', err.message);
      return [];
    }
  },

  // Admin: Save / Toggle publication
  async updatePublication(id, updateData) {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    const res = await fetch(`${API_BASE}/admin/publications/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update publication');
    return data.data;
  },

  // Admin: Create publication
  async createPublication(pubData) {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    const res = await fetch(`${API_BASE}/admin/publications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(pubData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create publication');
    return data.data;
  },

  // Admin: Get all dispatches
  async getAdminDispatches() {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    try {
      const res = await fetch(`${API_BASE}/admin/dispatches`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      return data.success && Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.warn('Error fetching admin dispatches:', err.message);
      return [];
    }
  },

  // Admin: Create dispatch
  async createDispatch(dispatchData) {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    const res = await fetch(`${API_BASE}/admin/dispatches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dispatchData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create dispatch');
    return data.data;
  },

  // Admin: Delete dispatch
  async deleteDispatch(id) {
    const token = localStorage.getItem('token') || localStorage.getItem('goreadpost_admin_token');
    const res = await fetch(`${API_BASE}/admin/dispatches/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete dispatch');
    return true;
  }
};
