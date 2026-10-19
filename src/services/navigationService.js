import { AuthService } from './authService';

const API_BASE = '/api/navigation';
const ADMIN_API_BASE = '/api/admin/navigation';
const CACHE_KEY = 'goreadpost_nav_tree_cache';

export const NavigationService = {
  clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:change'));
      }
    } catch (e) {}
  },

  // Public navigation tree directly from database (always live)
  async getNavigation() {
    try {
      const res = await fetch(`${API_BASE}?_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('NavigationService.getNavigation fetch error:', e.message);
    }

    return [];
  },

  // Admin: get all navigation items (flat + tree) directly from database
  async getAdminNavigation() {
    try {
      const token = AuthService.getToken();
      const res = await fetch(`${ADMIN_API_BASE}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.flat) {
          return json.data;
        }
      }
    } catch (e) {
      console.error('getAdminNavigation error:', e);
    }

    // Resilient fallback to public navigation API if admin endpoint returned empty or is offline
    try {
      const pubRes = await fetch(API_BASE);
      if (pubRes.ok) {
        const pubJson = await pubRes.json();
        if (pubJson.success && Array.isArray(pubJson.data) && pubJson.data.length > 0) {
          const flat = [];
          const flatten = (items, parentId = null) => {
            items.forEach((it, idx) => {
              const flatItem = {
                ...it,
                _id: it._id || it.id || ('nav_' + it.slug),
                parentId: parentId,
                status: it.status || 'PUBLISHED',
                isActive: it.isActive !== false,
                order: it.order || (idx + 1)
              };
              flat.push(flatItem);
              if (it.children && it.children.length > 0) {
                flatten(it.children, flatItem._id);
              }
            });
          };
          flatten(pubJson.data);
          return { flat, tree: pubJson.data };
        }
      }
    } catch (e) {}

    return { flat: [], tree: [] };
  },

  // Admin: get audit logs
  async getAuditLogs() {
    try {
      const token = AuthService.getToken();
      const res = await fetch(`${ADMIN_API_BASE}/audit-logs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.error('getAuditLogs error:', e);
    }
    return [];
  },

  // Admin: create navigation item
  async createNavigationItem(itemData) {
    const token = AuthService.getToken();
    const res = await fetch(ADMIN_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(itemData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create navigation item');
    }
    this.clearCache();
    return json.data;
  },

  // Admin: update navigation item
  async updateNavigationItem(id, updates) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update navigation item');
    }
    this.clearCache();
    return json.data;
  },

  // Admin: delete navigation item with options ({ cascade: true, reparent: true })
  async deleteNavigationItem(id, options = {}) {
    const token = AuthService.getToken();
    const query = new URLSearchParams();
    if (options.cascade) query.set('cascade', 'true');
    if (options.reparent) query.set('reparent', 'true');

    const url = `${ADMIN_API_BASE}/${id}${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      const err = new Error(json.message || 'Failed to delete navigation item');
      err.hasChildren = json.hasChildren;
      err.childCount = json.childCount;
      throw err;
    }
    this.clearCache();
    return true;
  },

  // Admin: duplicate navigation item
  async duplicateNavigationItem(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to duplicate navigation item');
    }
    this.clearCache();
    return json.data;
  },

  // Admin: reorder navigation items
  async reorderNavigation(items) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ items })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to reorder navigation');
    }
    this.clearCache();
    return true;
  },

  // Admin: toggle active status
  async updateStatus(id, isActive) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ isActive })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update navigation status');
    }
    this.clearCache();
    return json.data;
  },

  // Admin: publish navigation item
  async publishNavigationItem(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to publish navigation item');
    }
    return json.data;
  },

  // Admin: archive navigation item
  async archiveNavigationItem(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/archive`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to archive navigation item');
    }
    return json.data;
  },

  // Admin: restore navigation item
  async restoreNavigationItem(id, publishNow = false) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/restore`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ publishNow })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to restore navigation item');
    }
    return json.data;
  }
};
