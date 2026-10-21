import { AuthService } from './authService';
import { getFallbackPageBySlug, COMPANY_AND_LEGAL_PAGES } from '../data/pagesData';

const STORAGE_KEY = 'goreadpost_site_pages';
const API_BASE = '/api/pages';

function notifyPageChange() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('page:change'));
    }
  } catch (e) {}
}

export const PageService = {
  async getPages(status = null) {
    try {
      const url = status ? `${API_BASE}?status=${status}&_t=${Date.now()}` : `${API_BASE}?_t=${Date.now()}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: AuthService.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {}

    return COMPANY_AND_LEGAL_PAGES;
  },

  async getPageBySlug(slug, preview = false) {
    const cleanSlug = (slug || '').toLowerCase().trim().replace(/^\/+/, '');
    try {
      const url = `${API_BASE}/slug/${cleanSlug}${preview ? '?preview=true' : ''}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: AuthService.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      } else if (res.status === 404) {
        throw new Error(`Page "/${cleanSlug}" not found`);
      }
    } catch (e) {
      if (e.message && e.message.includes('not found')) throw e;
    }

    const fallback = getFallbackPageBySlug(cleanSlug);
    if (fallback) return fallback;

    throw new Error(`Page "/${cleanSlug}" not found`);
  },

  async getPageById(id) {
    try {
      const url = `${API_BASE}/${id}?_t=${Date.now()}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: AuthService.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (e) {}

    const pages = await this.getPages();
    return pages.find(p => p.id === id || p.slug === id) || null;
  },

  async createPage(pageData) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(pageData)
      });
      const json = await res.json();
      if (json.success && json.data) {
        notifyPageChange();
        return json.data;
      }
      throw new Error(json.message || 'Failed to create page');
    } catch (e) {
      throw e;
    }
  },

  async updatePage(id, updates) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success && json.data) {
        notifyPageChange();
        return json.data;
      }
      throw new Error(json.message || 'Failed to update page');
    } catch (e) {
      throw e;
    }
  },

  async publishPage(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}/publish`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders()
      });
      const json = await res.json();
      if (json.success && json.data) {
        notifyPageChange();
        return json.data;
      }
      throw new Error(json.message || 'Failed to publish page');
    } catch (e) {
      throw e;
    }
  },

  async unpublishPage(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}/unpublish`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders()
      });
      const json = await res.json();
      if (json.success && json.data) {
        notifyPageChange();
        return json.data;
      }
      throw new Error(json.message || 'Failed to unpublish page');
    } catch (e) {
      throw e;
    }
  },

  async deletePage(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notifyPageChange();
        return true;
      }
      throw new Error(json.message || 'Failed to delete page');
    } catch (e) {
      throw e;
    }
  },

  async resetPagesDefaults() {
    try {
      const res = await fetch(`${API_BASE}/reset`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders()
      });
      const json = await res.json();
      if (json.success && json.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        notifyPageChange();
        return json.data;
      }
    } catch (e) {}
    return [];
  }
};
