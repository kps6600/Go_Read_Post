import { AuthService } from './authService';

const API_BASE = '/api/articles';
const ADMIN_API_BASE = '/api/admin/articles';

function notifyArticleChange() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('goreadpost_dynamic_stories');
      localStorage.removeItem('goreadpost_stories_v2');
      localStorage.removeItem('goreadpost_stories_v3');
      localStorage.setItem('articles_last_updated', Date.now().toString());
    } catch (e) {}
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('article:change'));
      window.dispatchEvent(new CustomEvent('story:change'));
      window.dispatchEvent(new CustomEvent('homepage:change'));
    }, 20);
  }
}

export const ArticleService = {
  // Public: get published articles
  async getArticles(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}${query ? `?${query}` : ''}`);
    const json = await res.json();
    return json;
  },

  // Public: get single article by slug
  async getArticleBySlug(slug) {
    const res = await fetch(`${API_BASE}/${slug}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Article not found');
    }
    return json.data;
  },

  // Admin: get all articles with all statuses
  async getAdminArticles(params = {}) {
    const token = AuthService.getToken();
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${ADMIN_API_BASE}${query ? `?${query}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    return json;
  },

  // Admin: get article by id
  async getAdminArticleById(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Article not found');
    }
    return json.data;
  },

  // Admin: create article
  async createArticle(data) {
    const token = AuthService.getToken();
    const res = await fetch(ADMIN_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create article');
    }
    notifyArticleChange();
    return json.data;
  },

  // Admin: update article
  async updateArticle(id, data) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update article');
    }
    notifyArticleChange();
    return json.data;
  },

  // Admin: delete article
  async deleteArticle(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete article');
    }
    notifyArticleChange();
    return true;
  },

  // Admin: publish
  async publishArticle(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/publish`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    notifyArticleChange();
    return json.data;
  },

  // Admin: unpublish
  async unpublishArticle(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/unpublish`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    notifyArticleChange();
    return json.data;
  },

  // Admin: toggle frontend visibility independently
  async toggleFrontendVisibility(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/toggle-frontend`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    notifyArticleChange();
    return json.data;
  },

  // Admin: schedule
  async scheduleArticle(id, scheduledAt) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/schedule`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ scheduledAt })
    });
    const json = await res.json();
    notifyArticleChange();
    return json.data;
  },

  // Admin: archive
  async archiveArticle(id) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/${id}/archive`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    notifyArticleChange();
    return json.data;
  },

  // Admin: bulk delete
  async bulkDeleteArticles(ids) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to bulk delete articles');
    }
    notifyArticleChange();
    return json;
  },

  // Admin: bulk status update
  async bulkUpdateStatus(ids, status) {
    const token = AuthService.getToken();
    const res = await fetch(`${ADMIN_API_BASE}/bulk-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids, status })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to bulk update status');
    }
    notifyArticleChange();
    return json;
  }
};
