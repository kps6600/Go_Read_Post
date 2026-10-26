// Authentication Service for GoReadPost (Public Users & Admin Panel)

const USER_TOKEN_KEY = 'goreadpost_auth_token';
const USER_KEY = 'goreadpost_auth_user';
const ADMIN_TOKEN_KEY = 'goreadpost_admin_token';
const ADMIN_USER_KEY = 'goreadpost_admin_user';

async function parseAuthResponse(res) {
  let data = null;
  try {
    const text = await res.text();
    if (text && text.trim()) {
      data = JSON.parse(text);
    }
  } catch (e) {
    // Non-JSON or empty response from proxy/server
  }

  if (!res.ok) {
    if (data?.message) {
      throw new Error(data.message);
    }
    if (res.status === 502 || res.status === 504 || res.status === 500) {
      throw new Error('Backend server is unreachable. Please make sure the Express server is running on port 5000 (npm run server).');
    }
    throw new Error(`Request failed (Status ${res.status}).`);
  }

  if (!data) {
    throw new Error('Backend server returned an empty or invalid response. Please check that the server is running on port 5000.');
  }

  return data;
}

export const AuthService = {
  // Public user token (readers)
  getUserToken() {
    try {
      const user = this.getUser();
      if (!user) return null;
      return localStorage.getItem(USER_TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  },

  // Dedicated admin token
  getAdminToken() {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  },

  // Smart token retriever based on current execution context
  getToken() {
    try {
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const userToken = localStorage.getItem(USER_TOKEN_KEY);
      const inAdmin = typeof window !== 'undefined' && (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.includes('admin') ||
        window.location.search.includes('admin')
      );
      if (inAdmin) {
        return adminToken || userToken || null;
      }
      if (adminToken) {
        return adminToken;
      }
      return userToken || null;
    } catch (e) {
      return null;
    }
  },

  getAdminHeaders() {
    const token = this.getAdminToken() || this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  // Strictly retrieves PUBLIC NORMAL USERS (Readers, Members).
  // Super Admin and Staff accounts are NEVER returned here so they cannot appear as normal users on the public site!
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;

      const user = JSON.parse(raw);
      if (!user) return null;

      // If an admin/super admin was previously cached in the public user key,
      // migrate it to the admin key and cleanse the public user slot!
      if (this.isAdmin(user)) {
        if (!localStorage.getItem(ADMIN_USER_KEY)) {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
          const existingToken = localStorage.getItem(USER_TOKEN_KEY);
          if (existingToken && !localStorage.getItem(ADMIN_TOKEN_KEY)) {
            localStorage.setItem(ADMIN_TOKEN_KEY, existingToken);
          }
        }
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_TOKEN_KEY);
        return null;
      }

      return user;
    } catch (e) {
      return null;
    }
  },

  // Dedicated Admin retrieval
  getAdminUser() {
    try {
      let raw = localStorage.getItem(ADMIN_USER_KEY);
      // Fallback check: if user key contained an admin from legacy sessions
      if (!raw) {
        const userRaw = localStorage.getItem(USER_KEY);
        if (userRaw) {
          const possibleAdmin = JSON.parse(userRaw);
          if (this.isAdmin(possibleAdmin)) {
            localStorage.setItem(ADMIN_USER_KEY, userRaw);
            localStorage.removeItem(USER_KEY);
            raw = userRaw;
          }
        }
      }

      if (!raw) return null;
      const admin = JSON.parse(raw);
      return (admin && this.isAdmin(admin)) ? admin : null;
    } catch (e) {
      return null;
    }
  },

  getCurrentAdmin() {
    return this.getAdminUser();
  },

  isAuthenticated() {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      return this.isAdminAuthenticated();
    }
    return this.isUserAuthenticated();
  },

  isUserAuthenticated() {
    return !!this.getUserToken() && !!this.getUser();
  },

  isAdminAuthenticated() {
    return !!this.getAdminToken() && !!this.getAdminUser();
  },

  isAdmin(user = null) {
    const u = user || this.getAdminUser() || this.getUser();
    if (!u || !u.role) return false;
    const role = (u.role || '').toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
    return ['SUPER_ADMIN', 'ADMIN'].includes(role);
  },

  isSuperAdmin(user = null) {
    const u = user || this.getAdminUser() || this.getUser();
    if (!u || !u.role) return false;
    const role = (u.role || '').toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
    return role === 'SUPER_ADMIN';
  },

  isStaff(user = null) {
    return this.isAdmin(user);
  },

  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  notifyAuthChange() {
    try {
      window.dispatchEvent(new CustomEvent('auth:change', { 
        detail: {
          user: this.getUser(),
          admin: this.getAdminUser()
        }
      }));
    } catch (e) {}
  },

  async register({ name, email, password, username }) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, username })
      });

      const data = await parseAuthResponse(res);
      if (!data.success) {
        throw new Error(data.message || 'Registration failed. Please check inputs.');
      }

      if (data.token) {
        localStorage.setItem(USER_TOKEN_KEY, data.token);
      }
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      this.notifyAuthChange();
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Login with portal context: 'public' (normal user modal) vs 'admin' (Admin Console login)
  async login(login, password, options = { portal: 'public' }) {
    const portal = options.portal || 'public';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password, portal })
      });

      const data = await parseAuthResponse(res);

      if (!data.success) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      const activeUser = data.user || data.admin;

      // Handle based on portal
      if (portal === 'admin') {
        if (!this.isAdmin(activeUser)) {
          throw new Error(`Access Denied: Only assigned administrators can access the Admin Panel. Account "${activeUser?.name || activeUser?.username}" lacks administrative privileges.`);
        }
        if (data.token) {
          localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        }
        if (activeUser) {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(activeUser));
        }
      } else {
        // Public reader portal
        if (this.isAdmin(activeUser)) {
          throw new Error('Super Administrator and Staff accounts cannot sign in through the public reader portal. Super Admin can only log in through the Admin Panel.');
        }
        if (data.token) {
          localStorage.setItem(USER_TOKEN_KEY, data.token);
        }
        if (activeUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(activeUser));
        }
      }

      this.notifyAuthChange();
      return {
        ...data,
        user: portal === 'public' ? activeUser : this.getUser(),
        admin: portal === 'admin' ? activeUser : this.getAdminUser()
      };
    } catch (err) {
      throw err;
    }
  },

  handleUnauthorized(isFromAdmin = false) {
    try {
      const inAdmin = isFromAdmin || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));
      if (inAdmin) {
        this.logoutAdmin();
      } else {
        this.logoutUser();
      }
      this.notifyAuthChange();
    } catch (e) {}
  },

  async checkAuth() {
    try {
      const inAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const token = inAdmin ? this.getAdminToken() : this.getUserToken();
      if (!token) return inAdmin ? this.getAdminUser() : this.getUser();

      const res = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (inAdmin) this.logoutAdmin();
        else this.logoutUser();
        return null;
      }

      const data = await res.json();
      const user = data.user || data.admin;
      if (user) {
        if (this.isAdmin(user)) {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
          // Make sure public user slot is clean
          localStorage.removeItem(USER_KEY);
          return inAdmin ? user : null;
        } else {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          return inAdmin ? null : user;
        }
      }
      return inAdmin ? this.getAdminUser() : this.getUser();
    } catch (e) {
      return this.getUser();
    }
  },

  async updateProfile(updates) {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      const data = await parseAuthResponse(res);
      if (!data.success) {
        throw new Error(data.message || 'Failed to update profile.');
      }
      if (data.user) {
        if (this.isAdmin(data.user)) {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
        } else {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
        this.notifyAuthChange();
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await parseAuthResponse(res);
      if (!data.success) {
        throw new Error(data.message || 'Failed to change password.');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  logoutUser() {
    try {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('goreadpost_bookmarks');
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      this.notifyAuthChange();
    } catch (e) {}
  },

  logoutAdmin() {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      this.notifyAuthChange();
    } catch (e) {}
  },

  logout(scope = 'current') {
    try {
      if (scope === 'admin') {
        this.logoutAdmin();
      } else if (scope === 'user') {
        this.logoutUser();
      } else {
        const inAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        if (inAdmin) {
          this.logoutAdmin();
        } else {
          this.logoutUser();
        }
      }
    } catch (e) {}
  }
};
