import { AuthService } from './authService';

const GUEST_KEY = 'goreadpost_bookmarks_guest';

export const BookmarkService = {
  // Get storage key strictly scoped to current logged-in user
  getStorageKey(user = null) {
    const u = user || AuthService.getUser();
    if (u && (u.id || u._id || u.email || u.username)) {
      const identifier = String(u.id || u._id || u.email || u.username);
      return `goreadpost_bookmarks_user_${identifier}`;
    }
    return null;
  },

  // Read local bookmarks for currently active logged-in user
  getLocalBookmarks() {
    try {
      // Permanently purge any unauthenticated guest or legacy shared key
      localStorage.removeItem('goreadpost_bookmarks_guest');
      localStorage.removeItem('goreadpost_bookmarks');

      if (!AuthService.isAuthenticated()) {
        return [];
      }

      const user = AuthService.getUser();
      const userKey = this.getStorageKey(user);
      if (!userKey) return [];

      const raw = localStorage.getItem(userKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('BookmarkService.getLocalBookmarks error:', err);
    }
    return [];
  },

  // Save to current user's local storage and notify listeners
  saveLocalBookmarks(bookmarks) {
    try {
      if (!AuthService.isAuthenticated()) return;
      const key = this.getStorageKey();
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(bookmarks || []));
      this.notifyChange(bookmarks || []);
    } catch (err) {
      console.warn('BookmarkService.saveLocalBookmarks error:', err);
    }
  },

  notifyChange(bookmarks = null) {
    try {
      const data = bookmarks !== null ? bookmarks : this.getLocalBookmarks();
      window.dispatchEvent(new CustomEvent('bookmarks:change', { detail: data }));
    } catch (e) {}
  },

  // Fetch bookmarks from backend MongoDB for logged-in user only
  async getBookmarks() {
    // If not authenticated, unauthenticated users have strictly zero saved stories
    if (!AuthService.isAuthenticated()) {
      try {
        localStorage.removeItem('goreadpost_bookmarks_guest');
        localStorage.removeItem('goreadpost_bookmarks');
      } catch (e) {}
      return [];
    }

    try {
      const token = AuthService.getToken();
      if (!token) return [];

      const res = await fetch('/api/auth/bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookmarks)) {
          // Strictly use the user's saved articles from the server
          this.saveLocalBookmarks(data.bookmarks);
          return data.bookmarks;
        }
      }
    } catch (err) {
      console.warn('BookmarkService.getBookmarks API error:', err);
    }

    return this.getLocalBookmarks();
  },

  // Toggle bookmark for current user
  async toggleBookmark(story) {
    if (!story || !AuthService.isAuthenticated()) return false;
    const storyId = String(story.id || story._id || story.slug);
    const current = this.getLocalBookmarks();
    const exists = current.some(s => {
      if (!s) return false;
      if (typeof s === 'string') return String(s) === storyId;
      return String(s.id) === storyId || String(s._id) === storyId || String(s.slug) === storyId;
    });

    let updated = [];
    let isSaved = false;

    if (exists) {
      updated = current.filter(s => {
        if (!s) return false;
        if (typeof s === 'string') return String(s) !== storyId;
        return String(s.id) !== storyId && String(s._id) !== storyId && String(s.slug) !== storyId;
      });
      isSaved = false;
    } else {
      const cleanStory = {
        id: storyId,
        _id: story._id || storyId,
        title: story.title || 'Untitled Story',
        summary: story.summary || story.subtitle || '',
        image: story.image || story.coverImage || '',
        category: story.category || 'General',
        categoryLabel: story.categoryLabel || story.category || 'General',
        readTime: story.readTime || '4 min read',
        slug: story.slug || storyId,
        author: story.author || null,
        publishedAt: story.publishedAt || story.date || new Date().toISOString()
      };
      updated = [cleanStory, ...current];
      isSaved = true;
    }

    // Update locally immediately
    this.saveLocalBookmarks(updated);

    // Sync with backend if authenticated
    if (AuthService.isAuthenticated()) {
      try {
        const token = AuthService.getToken();
        fetch('/api/auth/bookmarks/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ story })
        }).catch(() => {});
      } catch (e) {}
    }

    return isSaved;
  },

  // Remove single bookmark
  async removeBookmark(storyId) {
    const target = String(storyId);
    const current = this.getLocalBookmarks();
    const updated = current.filter(s => {
      if (!s) return false;
      if (typeof s === 'string') return String(s) !== target;
      return String(s.id) !== target && String(s._id) !== target && String(s.slug) !== target;
    });

    this.saveLocalBookmarks(updated);

    if (AuthService.isAuthenticated()) {
      try {
        const token = AuthService.getToken();
        fetch('/api/auth/bookmarks', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ storyId })
        }).catch(() => {});
      } catch (e) {}
    }

    return updated;
  },

  // Clear all bookmarks for active user
  async clearAll() {
    this.saveLocalBookmarks([]);

    if (AuthService.isAuthenticated()) {
      try {
        const token = AuthService.getToken();
        fetch('/api/auth/bookmarks', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      } catch (e) {}
    }

    return [];
  },

  // Sync an array of bookmarks to server
  async syncBookmarks(bookmarks) {
    if (!AuthService.isAuthenticated() || !Array.isArray(bookmarks)) return;
    try {
      const token = AuthService.getToken();
      await fetch('/api/auth/bookmarks/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookmarks })
      });
    } catch (e) {}
  },

  // Helper to test if a story is saved
  isStorySaved(storyId, bookmarksList = null) {
    if (!storyId || !AuthService.isAuthenticated()) return false;
    const target = String(storyId);
    const list = bookmarksList || this.getLocalBookmarks();
    return list.some(s => {
      if (!s) return false;
      if (typeof s === 'string') return String(s) === target;
      return String(s.id) === target || String(s._id) === target || String(s.slug) === target;
    });
  }
};

// Global listener for auth login / logout events to switch bookmark state automatically
if (typeof window !== 'undefined') {
  window.addEventListener('auth:change', () => {
    BookmarkService.getBookmarks().then(b => {
      BookmarkService.notifyChange(b);
    });
  });
}
