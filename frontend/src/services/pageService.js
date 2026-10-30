import { HomepageService } from './homepageService';
import { CANONICAL_FRONTEND_PAGES } from '../components/admin/AdminPagesView';
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
    const cleanId = (id || '').toLowerCase().trim();
    if (cleanId === 'home' || cleanId === '' || cleanId === '/') {
      let homeSections = [];
      try {
        homeSections = await HomepageService.getAdminSections();
      } catch (e) {}
      return {
        _id: 'home',
        id: 'home',
        title: 'Homepage',
        slug: '',
        status: 'published',
        description: 'GoReadPost Main Editorial Homepage & Lead Portals',
        sections: homeSections && homeSections.length > 0 ? homeSections : [
          { id: 'hero_popular', type: 'hero_popular', title: 'Lead Stories & Editorial Hero Slider', enabled: true },
          { id: 'latest_blogs', type: 'latest_blogs', title: 'Latest from the Blog', enabled: true },
          { id: 'trending', type: 'trending', title: 'Trending Now', enabled: true },
          { id: 'popular_editors', type: 'popular_editors', title: "Most Popular & Editor's Picks", enabled: true },
          { id: 'spotlight', type: 'spotlight', title: 'Tech & Startup Spotlight', enabled: true },
          { id: 'newsletter', type: 'newsletter', title: 'Newsletter Subscription Banner', enabled: true }
        ],
        seo: {
          title: 'GoReadPost | Stories of Founders, Technology & Startups',
          description: 'Definitive journal of startup breakdowns, deeptech, venture capital, and builder journeys.',
          keywords: ['startups', 'technology', 'founders', 'venture capital']
        }
      };
    }

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
    const foundInDb = pages.find(p => (p.id && p.id.toLowerCase() === cleanId) || (p.slug && p.slug.toLowerCase() === cleanId));
    if (foundInDb) return foundInDb;

    const fallback = getFallbackPageBySlug(cleanId);
    if (fallback) return fallback;

    if (Array.isArray(CANONICAL_FRONTEND_PAGES)) {
      const canon = CANONICAL_FRONTEND_PAGES.find(c => (c.id && c.id.toLowerCase() === cleanId) || (c.slug && c.slug.toLowerCase() === cleanId));
      if (canon) {
        return {
          _id: canon.id,
          id: canon.id,
          title: canon.title,
          slug: canon.slug,
          status: canon.status || 'published',
          description: `${canon.title} portal & editorial sections`,
          sections: canon.sections || [],
          seo: {
            title: `${canon.title} | GoReadPost`,
            description: `${canon.title} on GoReadPost publication`,
            keywords: [canon.id, canon.slug]
          }
        };
      }
    }

    return null;
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
    const cleanId = (id || '').toLowerCase().trim();
    if (cleanId === 'home' || cleanId === '' || cleanId === '/') {
      if (Array.isArray(updates.sections)) {
        try {
          await HomepageService.updateSections(updates.sections);
        } catch (e) {}
      }
      notifyPageChange();
      return {
        id: 'home',
        title: updates.title || 'Homepage',
        slug: '',
        status: updates.status || 'published',
        sections: updates.sections || [],
        seo: updates.seo || {}
      };
    }
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
