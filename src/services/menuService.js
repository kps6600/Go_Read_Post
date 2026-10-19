const STORAGE_KEY = 'goreadpost_menu_items';
const API_BASE = '/api/menu';

export const MenuService = {
  async getMenuItems() {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (e) {}

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) return JSON.parse(local);
    } catch (e) {}

    return [];
  },

  async createMenuItem(itemData) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const json = await res.json();
      if (json.success && json.data) {
        const items = await this.getMenuItems();
        return json.data;
      }
      throw new Error(json.message || 'Failed to create menu item');
    } catch (e) {
      // Fallback
      const current = await this.getMenuItems();
      const newItem = {
        ...itemData,
        id: itemData.id || itemData.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        visible: itemData.visible !== false,
        order: Date.now()
      };
      current.push(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return newItem;
    }
  },

  async updateMenuItem(id, updates) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (e) {}

    // Fallback
    const current = await this.getMenuItems();
    const idx = current.findIndex(m => m.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current[idx];
    }
    return null;
  },

  async deleteMenuItem(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const current = (await this.getMenuItems()).filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        return true;
      }
    } catch (e) {}

    const current = (await this.getMenuItems()).filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return true;
  },

  async resetMenuDefaults() {
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        return json.data;
      }
    } catch (e) {}
    return [];
  }
};
