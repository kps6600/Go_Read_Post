import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/authService';
import { SettingService } from '../../services/settingService';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import AdminTopNavbar from './AdminTopNavbar';
import AdminDashboardView from './AdminDashboardView';
import AdminPagesView from './AdminPagesView';
import AdminPageCreate from './AdminPageCreate';
import AdminPageEditor from './AdminPageEditor';
import AdminMediaView from './AdminMediaView';
import AdminNavigationView from './AdminNavigationView';
import AdminFooterView from './AdminFooterView';
import AdminSEOView from './AdminSEOView';
import AdminSettingsView from './AdminSettingsView';
import AdminPostsView from './AdminPostsView';
import AdminCategoriesView from './AdminCategoriesView';
import AdminTopicsView from './AdminTopicsView';
import AdminTagsView from './AdminTagsView';
import AdminAuthorsView from './AdminAuthorsView';
import AdminHomepageView from './AdminHomepageView';
import AdminUsersView from './AdminUsersView';
import AdminAnalyticsView from './AdminAnalyticsView';
import AdminVideosView from './AdminVideosView';
import AdminNewslettersView from './AdminNewslettersView';
import AdminCommentsView from './AdminCommentsView';
import AdminSubmissionsView from './AdminSubmissionsView';

export default function AdminLayout({ onBackToSite, onShowToast, siteSettings: propSettings }) {
  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname;
    if (p === '/admin' || p === '/admin/') return '/admin/dashboard';
    return p.startsWith('/admin') ? p : '/admin/dashboard';
  });

  const [siteSettings, setSiteSettings] = useState(() => propSettings || SettingService.getLocalSettings());

  useEffect(() => {
    if (propSettings) setSiteSettings(propSettings);
  }, [propSettings]);

  useEffect(() => {
    SettingService.getSettings().then(st => st && setSiteSettings(st)).catch(() => {});
    const handleSettingsChange = (e) => {
      if (e.detail) {
        setSiteSettings(e.detail);
      } else {
        SettingService.getSettings().then(st => st && setSiteSettings(st)).catch(() => {});
      }
    };
    window.addEventListener('settings:change', handleSettingsChange);
    return () => window.removeEventListener('settings:change', handleSettingsChange);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(() => AuthService.isAdminAuthenticated());
  const [adminUser, setAdminUser] = useState(() => AuthService.getAdminUser());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p.startsWith('/admin') ? p : '/admin/dashboard');
      setIsAuthenticated(AuthService.isAdminAuthenticated());
      setAdminUser(AuthService.getAdminUser());
    };
    const handleAuthChange = () => {
      setIsAuthenticated(AuthService.isAdminAuthenticated());
      setAdminUser(AuthService.getAdminUser());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('auth:change', handleAuthChange);

    // Verify token validity against backend to prevent stale session lockouts
    if (AuthService.isAdminAuthenticated()) {
      AuthService.checkAuth().then(verifiedUser => {
        if (!verifiedUser || !AuthService.isAdmin(verifiedUser)) {
          setIsAuthenticated(false);
          setAdminUser(null);
        } else {
          setAdminUser(verifiedUser);
        }
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('auth:change', handleAuthChange);
    };
  }, []);

  const handleNavigate = (path) => {
    if (path === '/') {
      if (onBackToSite) {
        onBackToSite();
      } else {
        window.history.pushState(null, '', '/');
        window.location.reload();
      }
      return;
    }

    window.history.pushState(null, '', path);
    setCurrentPath(path);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    const currentUser = user || AuthService.getAdminUser() || { name: 'Administrator' };
    setAdminUser(currentUser);
    handleNavigate('/admin/dashboard');
    if (onShowToast) onShowToast(`Welcome back, ${currentUser.name || 'Administrator'}!`);
  };

  const handleLogout = () => {
    AuthService.logoutAdmin();
    setIsAuthenticated(false);
    setAdminUser(null);
    handleNavigate('/admin/login');
    if (onShowToast) onShowToast('You have been logged out.');
  };

  const isAdminAuthenticated = isAuthenticated && AuthService.isAdmin(adminUser);

  // If user is accessing /admin/login specifically or is not an assigned admin
  if (!isAdminAuthenticated || currentPath === '/admin/login') {
    return (
      <AdminLogin 
        onLoginSuccess={handleLoginSuccess}
        onBackToSite={() => handleNavigate('/')}
        unauthorizedUser={isAuthenticated && !AuthService.isAdmin(adminUser) ? adminUser : null}
        siteSettings={siteSettings}
      />
    );
  }

  // Determine active view component
  const renderActiveView = () => {
    // 1. Analytics: /admin/analytics
    if (currentPath === '/admin/analytics') {
      return <AdminAnalyticsView onShowToast={onShowToast} />;
    }

    // Videos TV CMS: /admin/videos
    if (currentPath === '/admin/videos') {
      return <AdminVideosView onShowToast={onShowToast} />;
    }

    // Newsletters CMS: /admin/newsletters
    if (currentPath === '/admin/newsletters') {
      return <AdminNewslettersView onShowToast={onShowToast} />;
    }

    // Reader Comments & Perspectives: /admin/comments
    if (currentPath === '/admin/comments') {
      return <AdminCommentsView onShowToast={onShowToast} />;
    }

    // Startup Pitches & Contact Inquiries: /admin/submissions or /admin/pitches
    if (currentPath === '/admin/submissions' || currentPath === '/admin/pitches') {
      return <AdminSubmissionsView onShowToast={onShowToast} onNavigate={handleNavigate} />;
    }

    // 2. Categories: /admin/categories
    if (currentPath === '/admin/categories') {
      return <AdminCategoriesView onShowToast={onShowToast} />;
    }

    // 3. Topics: /admin/topics
    if (currentPath === '/admin/topics') {
      return <AdminTopicsView onShowToast={onShowToast} />;
    }

    // 4. Tags: /admin/tags
    if (currentPath === '/admin/tags') {
      return <AdminTagsView onShowToast={onShowToast} />;
    }

    // 5. Authors: /admin/authors
    if (currentPath === '/admin/authors') {
      return <AdminAuthorsView onShowToast={onShowToast} />;
    }

    // 6. Homepage CMS & Live Studio: /admin/homepage
    if (currentPath === '/admin/homepage' || currentPath.startsWith('/admin/homepage')) {
      return (
        <AdminHomepageView 
          onShowToast={onShowToast} 
          onNavigate={handleNavigate} 
        />
      );
    }

    // 7. Users & Roles: /admin/users or /admin/roles
    if (currentPath === '/admin/users' || currentPath === '/admin/roles') {
      return <AdminUsersView onShowToast={onShowToast} />;
    }

    // 8. Media Library: /admin/media
    if (currentPath === '/admin/media') {
      return <AdminMediaView onShowToast={onShowToast} />;
    }

    // 9. Navigation Menu: /admin/navigation
    if (currentPath === '/admin/navigation') {
      return <AdminNavigationView onShowToast={onShowToast} />;
    }

    // 10. Footer: /admin/footer
    if (currentPath === '/admin/footer') {
      return <AdminFooterView onShowToast={onShowToast} />;
    }

    // 11. SEO: /admin/seo
    if (currentPath === '/admin/seo') {
      return <AdminSEOView onShowToast={onShowToast} />;
    }

    // 12. Site Settings: /admin/settings
    if (currentPath === '/admin/settings') {
      return <AdminSettingsView onShowToast={onShowToast} onNavigate={handleNavigate} />;
    }

    // 13. Articles CMS: /admin/articles, /admin/drafts, /admin/archived, /admin/articles/create, /admin/posts, /admin/blogs, etc.
    if (
      currentPath.startsWith('/admin/articles') || 
      currentPath.startsWith('/admin/posts') || 
      currentPath.startsWith('/admin/blogs') ||
      currentPath === '/admin/drafts' ||
      currentPath.startsWith('/admin/drafts') ||
      currentPath === '/admin/archived' ||
      currentPath.startsWith('/admin/archived')
    ) {
      return (
        <AdminPostsView 
          onShowToast={onShowToast} 
          currentPath={currentPath}
          onNavigate={handleNavigate}
        />
      );
    }

    // 14. Pages Editor: /admin/pages/:id/edit
    if (currentPath.startsWith('/admin/pages') && currentPath.includes('/edit')) {
      const cleanPath = currentPath.split('?')[0];
      const parts = cleanPath.split('/');
      const editIndex = parts.indexOf('edit');
      const pageId = editIndex > 0 ? parts[editIndex - 1] : null;
      return (
        <AdminPageEditor 
          pageId={pageId} 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // 15. Create Page: /admin/pages/create
    if (currentPath === '/admin/pages/create') {
      return (
        <AdminPageCreate 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // 16. Pages List: /admin/pages
    if (currentPath === '/admin/pages') {
      return (
        <AdminPagesView 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // 17. Homepage Live Studio: /admin/homepage
    if (currentPath === '/admin/homepage' || currentPath.startsWith('/admin/homepage')) {
      return (
        <AdminPageEditor 
          pageId="home" 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // Default: Dashboard /admin/dashboard
    return (
      <AdminDashboardView 
        onNavigate={handleNavigate} 
        onShowToast={onShowToast} 
        siteSettings={siteSettings}
      />
    );
  };

  // Check if we are on an article create/edit studio route
  const isPostEditorRoute = (
    currentPath.startsWith('/admin/articles') || 
    currentPath.startsWith('/admin/posts') || 
    currentPath.startsWith('/admin/blogs')
  ) && (
    currentPath.includes('/create') || 
    currentPath.includes('/edit') || 
    currentPath.includes('/new')
  );

  return (
    <div className="admin-cms-wrapper">
      <AdminSidebar 
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onViewSite={() => handleNavigate('/')}
        adminUser={adminUser}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        siteSettings={siteSettings}
      />

      <div className="admin-main-stage">
        <AdminTopNavbar 
          currentPath={currentPath}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onViewSite={() => handleNavigate('/')}
          adminUser={adminUser}
        />

        <main className={`admin-content-viewport ${isPostEditorRoute ? 'editor-no-padding' : ''}`}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
