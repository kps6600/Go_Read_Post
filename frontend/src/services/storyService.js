import { ALL_STORIES } from '../data/storiesData';
import { ALL_ENTERPRISE_STORIES } from '../data/enterpriseStoryData';
import { ALL_SMB_STORIES } from '../data/smbStoryData';
import { ALL_HER_STORIES } from '../data/herStoryData';
import { SOCIAL_HERO_STORY, SOCIAL_GRID_STORIES, SOCIAL_LATEST_STORIES, SOCIAL_HERO_SIDEBAR_STORIES } from '../data/socialStoryData';

const STORAGE_KEY = 'goreadpost_dynamic_stories';
const API_BASE = '/api/stories';

function notifyStoryChange() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('goreadpost_dynamic_stories');
      localStorage.removeItem('goreadpost_stories_v2');
      localStorage.removeItem('goreadpost_stories_v3');
      localStorage.setItem('articles_last_updated', Date.now().toString());
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('article:change'));
    window.dispatchEvent(new CustomEvent('story:change'));
    window.dispatchEvent(new CustomEvent('homepage:change'));
  }
}

// Combine default hardcoded stories as seed base
export function getDefaultSeedStories() {
  const combined = [
    ...ALL_STORIES.map(s => ({ ...s, brand: s.brand || 'GoReadPost' })),
    ...ALL_ENTERPRISE_STORIES.map(s => ({ ...s, brand: 'EnterpriseStory', category: 'enterprise' })),
    ...ALL_SMB_STORIES.map(s => ({ ...s, brand: 'SMBStory', category: 'smbstory' })),
    ...(ALL_HER_STORIES || []).map(s => ({ ...s, brand: 'HerStory', category: 'herstory' })),
    { ...SOCIAL_HERO_STORY, brand: 'SocialStory', category: 'social-story' },
    ...(SOCIAL_GRID_STORIES || []).map(s => ({ ...s, brand: 'SocialStory', category: 'social-story' })),
    ...(SOCIAL_LATEST_STORIES || []).map(s => ({ ...s, brand: 'SocialStory', category: 'social-story' })),
    ...(SOCIAL_HERO_SIDEBAR_STORIES || []).map(s => ({ ...s, brand: 'SocialStory', category: 'social-story' }))
  ];
  const map = new Map();
  combined.forEach(s => {
    if (s && s.id && !map.has(s.id)) {
      map.set(s.id, {
        ...s,
        id: s.id,
        image: s.image || s.heroImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80',
        status: s.status || 'published',
        claps: s.claps || 142,
        views: s.views || Math.floor(Math.random() * 1200) + 300,
        createdAt: s.publishedAt ? new Date().toISOString() : new Date().toISOString()
      });
    }
  });
  return Array.from(map.values());
}

// Local Storage helpers for seamless fallback
function getLocalStories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = getDefaultSeedStories();
  setLocalStories(defaults);
  return defaults;
}

function setLocalStories(stories) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  } catch (e) {}
}

export const StoryService = {
  // Fetch all stories with query filters
  async getStories(params = {}) {
    try {
      const query = new URLSearchParams();
      query.append('limit', params.limit || '500');
      if (params.category && params.category !== 'all') query.append('category', params.category);
      if (params.brand && params.brand !== 'all') query.append('brand', params.brand);
      if (params.status && params.status !== 'all') query.append('status', params.status);
      if (params.search && params.search.trim()) query.append('search', params.search.trim());

      query.append('_t', String(Date.now()));
      const res = await fetch(`${API_BASE}?${query.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (json.data.length > 0) {
            setLocalStories(json.data);
            return { data: json.data, isServer: true };
          } else if (!params.search && (!params.category || params.category === 'all')) {
            // Database is fresh/empty: auto-seed initial stories into MongoDB!
            await this.seedInitialData();
            const secondRes = await fetch(`${API_BASE}?${query.toString()}`, { cache: 'no-store' });
            if (secondRes.ok) {
              const secondJson = await secondRes.json();
              if (secondJson.success && Array.isArray(secondJson.data) && secondJson.data.length > 0) {
                setLocalStories(secondJson.data);
                return { data: secondJson.data, isServer: true };
              }
            }
          } else {
            return { data: [], isServer: true };
          }
        }
      }
    } catch (err) {
      // Server not reachable yet, use local store fallback
    }

    // Local fallback
    let stories = getLocalStories();
    if (params.category && params.category !== 'all') {
      stories = stories.filter(s => s.category === params.category);
    }
    if (params.brand && params.brand !== 'all') {
      stories = stories.filter(s => s.brand === params.brand);
    }
    if (params.status && params.status !== 'all') {
      stories = stories.filter(s => (s.status || 'published') === params.status);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      stories = stories.filter(s =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.summary && s.summary.toLowerCase().includes(q)) ||
        (s.author?.name && s.author.name.toLowerCase().includes(q))
      );
    }
    return { data: stories, isServer: false };
  },

  // Get single story
  async getStoryById(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {}

    const local = getLocalStories();
    return local.find(s => s._id === id || s.id === id || s.slug === id) || null;
  },

  // Create new story
  async createStory(storyData) {
    const newStory = {
      ...storyData,
      id: 'story_' + Date.now(),
      _id: 'story_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      claps: storyData.claps || 120,
      views: 1
    };

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const list = getLocalStories();
          list.unshift(json.data);
          setLocalStories(list);
          return json.data;
        }
      }
    } catch (err) {}

    // Fallback store
    const list = getLocalStories();
    list.unshift(newStory);
    setLocalStories(list);
    notifyStoryChange();
    return newStory;
  },

  // Update story
  async updateStory(id, storyData) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const list = getLocalStories().map(s => (s._id === id || s.id === id ? json.data : s));
          setLocalStories(list);
          return json.data;
        }
      }
    } catch (err) {}

    const list = getLocalStories().map(s => {
      if (s._id === id || s.id === id) {
        return { ...s, ...storyData, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    setLocalStories(list);
    notifyStoryChange();
    return list.find(s => s._id === id || s.id === id);
  },

  // Delete story
  async deleteStory(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const list = getLocalStories().filter(s => s._id !== id && s.id !== id);
        setLocalStories(list);
        return true;
      }
    } catch (err) {}

    const list = getLocalStories().filter(s => s._id !== id && s.id !== id);
    setLocalStories(list);
    notifyStoryChange();
    return true;
  },

  // Clap story
  async clapStory(id) {
    try {
      fetch(`${API_BASE}/${id}/clap`, { method: 'PATCH' }).catch(() => {});
    } catch (err) {}

    const list = getLocalStories().map(s => {
      if (s._id === id || s.id === id) {
        return { ...s, claps: (s.claps || 0) + 1 };
      }
      return s;
    });
    setLocalStories(list);
  },

  // Get stats for Admin Dashboard
  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) return json.stats;
      }
    } catch (err) {}

    const stories = getLocalStories();
    return {
      totalStories: stories.length,
      published: stories.filter(s => (s.status || 'published') === 'published').length,
      drafts: stories.filter(s => s.status === 'draft').length,
      scheduled: stories.filter(s => s.status === 'scheduled').length,
      totalViews: stories.reduce((acc, s) => acc + (s.views || 0), 0),
      totalClaps: stories.reduce((acc, s) => acc + (s.claps || 0), 0),
      isMongoConnected: false
    };
  },

  // Reset / reseed database
  async seedInitialData() {
    const defaults = getDefaultSeedStories();
    try {
      const res = await fetch(`${API_BASE}/seed?force=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories: defaults })
      });
      if (res.ok) {
        setLocalStories(defaults);
        return true;
      }
    } catch (err) {}

    setLocalStories(defaults);
    return true;
  }
};
