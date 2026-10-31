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
import AdminAboutView from './AdminAboutView';
import AdminNewslettersView from './AdminNewslettersView';
import AdminCommentsView from './AdminCommentsView';
import AdminSubmissionsView from './AdminSubmissionsView';
import AdminTrendingView from './AdminTrendingView';
import AdminCategoryStudioView from './AdminCategoryStudioView';
import AdminFounderView from './AdminFounderView';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_open');
    if (saved !== null) return saved === 'true';
    return true; // Default open
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_open', String(next));
      return next;
    });
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    localStorage.setItem('admin_sidebar_open', 'false');
  };

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
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
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

    // Videos CMS: /admin/videos
    if (currentPath === '/admin/videos' || currentPath.startsWith('/admin/videos')) {
      return <AdminVideosView onShowToast={onShowToast} onNavigate={handleNavigate} currentPath={currentPath} />;
    }

    // About Us Page Studio: /admin/about
    if (currentPath === '/admin/about' || currentPath.startsWith('/admin/about')) {
      return <AdminAboutView onShowToast={onShowToast} onNavigate={handleNavigate} />;
    }

    // Founder First Studio: /admin/founder or /admin/founder-first
    if (currentPath === '/admin/founder' || currentPath.startsWith('/admin/founder')) {
      return <AdminFounderView onShowToast={onShowToast} onNavigate={handleNavigate} />;
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

    // 5. Authors: /admin/authors or /admin/authors/:author_name
    if (currentPath === '/admin/authors' || currentPath.startsWith('/admin/authors/')) {
      const rawAuthorSlug = currentPath.startsWith('/admin/authors/')
        ? decodeURIComponent(currentPath.replace('/admin/authors/', '').split('/')[0].split('?')[0] || '')
        : null;

      return (
        <AdminAuthorsView 
          authorSlug={rawAuthorSlug || null}
          onNavigate={handleNavigate}
          onShowToast={onShowToast} 
        />
      );
    }

    // 6. Homepage CMS & Live Studio: /admin/homepage
    if (currentPath === '/admin/homepage' || currentPath.startsWith('/admin/homepage')) {
      return (
        <AdminPageEditor 
          pageId="home" 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // 6b. Trending CMS & Live Studio: /admin/trending
    if (currentPath === '/admin/trending' || currentPath.startsWith('/admin/trending')) {
      return (
        <AdminPageEditor 
          pageId="trending" 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // 6c. Category Page Live Studio: /admin/category or /admin/category-studio
    if (currentPath === '/admin/category' || currentPath.startsWith('/admin/category')) {
      return (
        <AdminPageEditor 
          pageId="category" 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // 6d. About Us Studio: /admin/about
    if (currentPath === '/admin/about' || currentPath.startsWith('/admin/about')) {
      return (
        <AdminPageEditor 
          pageId="about" 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // 6e. Contact Us Studio: /admin/contact
    if (currentPath === '/admin/contact' || currentPath.startsWith('/admin/contact')) {
      return (
        <AdminPageEditor 
          pageId="contact" 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
        />
      );
    }

    // 6f. Advertise With Us Studio: /admin/advertise
    if (currentPath === '/admin/advertise' || currentPath.startsWith('/admin/advertise')) {
      return (
        <AdminPageEditor 
          pageId="page_advertise" 
          onNavigate={handleNavigate} 
          onShowToast={onShowToast} 
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

    // 14. Pages Editor: /admin/pages/:id/edit (Unified in same space)
    if (currentPath.startsWith('/admin/pages') && currentPath.includes('/edit')) {
      const cleanPath = currentPath.split('?')[0];
      const parts = cleanPath.split('/');
      const editIndex = parts.indexOf('edit');
      const rawId = editIndex > 0 ? parts[editIndex - 1] : 'home';
      const pageId = (!rawId || rawId === 'pages') ? 'home' : rawId;
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

  // Check if we are on a full-page page editor route (Trending Studio, Videos Studio, About Studio, Founder Studio, Homepage Editor, Page Sections Editor, Page Create)
  const isPageEditorRoute = (
    currentPath === '/admin/founder' ||
    currentPath.startsWith('/admin/founder') ||
    currentPath === '/admin/trending' ||
    currentPath.startsWith('/admin/trending') ||
    currentPath === '/admin/category' ||
    currentPath.startsWith('/admin/category') ||
    currentPath === '/admin/about' ||
    currentPath.startsWith('/admin/about') ||
    currentPath === '/admin/homepage' ||
    currentPath.startsWith('/admin/homepage')
  );

  if (isPageEditorRoute) {
    return (
      <div className="admin-fullpage-studio-root">
        {renderActiveView()}
      </div>
    );
  }

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
    <div className={`admin-cms-wrapper ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar 
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onViewSite={() => handleNavigate('/')}
        adminUser={adminUser}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onToggle={handleToggleSidebar}
        siteSettings={siteSettings}
      />

      <div className="admin-main-stage">
        <AdminTopNavbar 
          currentPath={currentPath}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
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
