import { AuthService } from './authService';

export const AnalyticsService = {
  async getAnalytics() {
    const token = AuthService.getToken();
    const res = await fetch('/api/admin/analytics', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const json = await res.json();
    return json.success ? json.data : null;
  }
};
