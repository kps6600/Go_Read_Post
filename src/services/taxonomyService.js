import { AuthService } from './authService';

export const TaxonomyService = {
  // Categories
  async getCategories() {
    try {
      const res = await fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (e) {
      return [];
    }
  },

  async getAdminCategories() {
    try {
      const token = AuthService.getToken();
      const res = await fetch(`/api/admin/categories?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return this.getCategories();
  },

  async getCategoryUsage(id) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/categories/${id}/usage`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch category usage');
    return json.data;
  },

  async getCategoryBySlug(slug, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `/api/categories/${slug}${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Category not found');
    return json.data;
  },

  async createCategory(data) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create category');
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('category:change'));
    return json.data;
  },

  async updateCategory(id, data) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update category');
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('category:change'));
    return json.data;
  },

  async deleteCategory(id, force = false) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/categories/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      const err = new Error(json.message || 'Failed to delete category');
      if (json.inUse) {
        err.inUse = true;
        err.articleCount = json.articleCount;
      }
      throw err;
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('category:change'));
    return true;
  },

  // Authors
  async getAuthors() {
    try {
      const res = await fetch('/api/authors');
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (e) {
      return [];
    }
  },

  async getAuthorBySlug(slug, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `/api/authors/${slug}${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Author not found');
    return json.data;
  },

  async createAuthor(data) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/authors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create author');
    return json.data;
  },

  async updateAuthor(id, data) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/authors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update author');
    return json.data;
  },

  async deleteAuthor(id) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/authors/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete author');
    return true;
  },

  // Topics
  async getTopics() {
    try {
      const res = await fetch(`/api/topics?_t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (e) {
      return [];
    }
  },

  async getAdminTopics() {
    try {
      const token = AuthService.getToken();
      const res = await fetch(`/api/admin/topics?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return this.getTopics();
  },

  async getTopicUsage(id) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/topics/${id}/usage`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch topic usage');
    return json.data;
  },

  async getTopicBySlug(slug, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `/api/topics/${slug}${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Topic not found');
    return json.data;
  },

  async createTopic(data) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create topic');
    return json.data;
  },

  async updateTopic(id, data) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/topics/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update topic');
    return json.data;
  },

  async deleteTopic(id, force = false) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/topics/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      const err = new Error(json.message || 'Failed to delete topic');
      if (json.inUse) {
        err.inUse = true;
        err.articleCount = json.articleCount;
      }
      throw err;
    }
    return true;
  },

  // Tags
  async getTags() {
    try {
      const res = await fetch('/api/tags');
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (e) {
      return [];
    }
  },

  async getAdminTags() {
    try {
      const token = AuthService.getToken();
      const res = await fetch(`/api/admin/tags?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return this.getTags();
  },

  async getTagUsage(id) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/tags/${id}/usage`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch tag usage');
    return json.data;
  },

  async getTagBySlug(slug, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `/api/tags/${slug}${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Tag not found');
    return json.data;
  },

  async createTag(data) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create tag');
    return json.data;
  },

  async updateTag(id, data) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/tags/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update tag');
    return json.data;
  },

  async mergeTags(sourceTagId, targetTagId) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/tags/merge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ sourceTagId, targetTagId })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to merge tags');
    return json;
  },

  async deleteUnusedTags() {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/tags/unused/all', {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete unused tags');
    return json;
  },

  async deleteTag(id, force = false) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/tags/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      const err = new Error(json.message || 'Failed to delete tag');
      if (json.inUse) {
        err.inUse = true;
        err.articleCount = json.articleCount;
      }
      throw err;
    }
    return true;
  },

  // Bulk Deletions
  async bulkDeleteCategories(ids) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/categories/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete categories');
    return json;
  },

  async bulkDeleteAuthors(ids) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/authors/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete authors');
    return json;
  },

  async bulkDeleteTopics(ids) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/topics/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete topics');
    return json;
  },

  async bulkDeleteTags(ids) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/tags/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete tags');
    return json;
  }
};
