import { AuthService } from './authService';

export const UserService = {
  async getUsers() {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/users', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  },

  async getRoles() {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/users/roles', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  },

  async createUser(data) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create user');
    return json.data;
  },

  async updateUser(id, data) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update user');
    return json.data;
  },

  async deleteUser(id) {
    const token = AuthService.getToken();
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete user');
    return true;
  },

  async bulkDelete(ids) {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/users/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to bulk delete users');
    return json;
  }
};
