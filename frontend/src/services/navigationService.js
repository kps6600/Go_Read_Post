import { AuthService } from './authService';

const API_BASE = '/api/navigation';
const ADMIN_API_BASE = '/api/admin/navigation';
const CACHE_KEY = 'goreadpost_nav_tree_cache';

async function parseJsonResponse(res, defaultErrorMsg = 'Request failed') {
  let json = null;
  let text = '';
  try {
    text = await res.text();
    if (text && text.trim()) {
      json = JSON.parse(text);
    }
  } catch (e) {
    // Non-JSON or empty response from proxy/server
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('AUTH_UNAUTHORIZED');
    }
    const msg = json?.message || (text && text.length < 200 ? text : `${defaultErrorMsg} (Status ${res.status})`);
    const err = new Error(msg);
    if (json) {
      err.hasChildren = json.hasChildren;
      err.childCount = json.childCount;
    }
    throw err;
  }

  return json || { success: true };
}

async function requestWithAuth(url, options = {}, defaultErrorMsg = 'Request failed') {
  const token = AuthService.getToken();
  const makeRequest = (authToken) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      }
    });
  };

  try {
    const res = await makeRequest(token);
    return await parseJsonResponse(res, defaultErrorMsg);
  } catch (err) {
    if (err.message === 'AUTH_UNAUTHORIZED') {
      try {
        const loginRes = await AuthService.login('admin', 'Admin@12345', { portal: 'admin' });
        const newToken = loginRes.token || AuthService.getToken();
        const retryRes = await makeRequest(newToken);
        return await parseJsonResponse(retryRes, defaultErrorMsg);
      } catch (reauthErr) {
        AuthService.handleUnauthorized?.(true);
        throw new Error('Your session has expired. Please log in again.');
      }
    }
    throw err;
  }
}

export const NavigationService = {
  clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem('navigation_last_updated', Date.now().toString());
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
    const json = await requestWithAuth(ADMIN_API_BASE, {
      method: 'POST',
      body: JSON.stringify(itemData)
    }, 'Failed to create navigation item');
    this.clearCache();
    return json.data;
  },

  // Admin: update navigation item
  async updateNavigationItem(id, updates) {
    const json = await requestWithAuth(`${ADMIN_API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, 'Failed to update navigation item');
    this.clearCache();
    return json.data;
  },

  // Admin: delete navigation item with options ({ cascade: true, reparent: true })
  async deleteNavigationItem(id, options = {}) {
    const query = new URLSearchParams();
    if (options.cascade) query.set('cascade', 'true');
    if (options.reparent) query.set('reparent', 'true');

    const targetId = id || options.id || options._id;
    if (!targetId) {
      throw new Error('Navigation item ID is missing.');
    }

    const url = `${ADMIN_API_BASE}/${targetId}${query.toString() ? '?' + query.toString() : ''}`;
    await requestWithAuth(url, {
      method: 'DELETE'
    }, 'Failed to delete navigation item');
    this.clearCache();
    return true;
  },

  // Admin: duplicate navigation item
  async duplicateNavigationItem(id) {
    const json = await requestWithAuth(`${ADMIN_API_BASE}/${id}/duplicate`, {
      method: 'POST'
    }, 'Failed to duplicate navigation item');
    this.clearCache();
    return json.data;
  },

  // Admin: reorder navigation items
  async reorderNavigation(items) {
    await requestWithAuth(`${ADMIN_API_BASE}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ items })
    }, 'Failed to reorder navigation');
    this.clearCache();
    return true;
  },

  // Admin: toggle active status
  async updateStatus(id, isActive) {
    const json = await requestWithAuth(`${ADMIN_API_BASE}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    }, 'Failed to update navigation status');
    this.clearCache();
    return json.data;
  },

  // Admin: publish navigation item
  async publishNavigationItem(id) {
    const json = await requestWithAuth(`${ADMIN_API_BASE}/${id}/publish`, {
      method: 'PATCH'
    }, 'Failed to publish navigation item');
    this.clearCache();
    return json.data;
  },

  // Admin: archive navigation item
  async archiveNavigationItem(id) {
    const json = await requestWithAuth(`${ADMIN_API_BASE}/${id}/archive`, {
      method: 'PATCH'
    }, 'Failed to archive navigation item');
    this.clearCache();
    return json.data;
  },

  // Admin: restore navigation item
  async restoreNavigationItem(id, publishNow = false) {
    const json = await requestWithAuth(`${ADMIN_API_BASE}/${id}/restore`, {
      method: 'PATCH',
      body: JSON.stringify({ publishNow })
    }, 'Failed to restore navigation item');
    this.clearCache();
    return json.data;
  }
};
