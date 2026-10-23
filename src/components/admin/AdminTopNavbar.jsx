import React from 'react';
import { Menu, Database, RefreshCw, ExternalLink, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function AdminTopNavbar({
  currentPath,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenMobileSidebar,
  onViewSite,
  isDbConnected = true,
  onSyncData,
  adminUser
}) {
  // Compute breadcrumb title from path
  const getBreadcrumbTitle = () => {
    if (currentPath === '/admin/dashboard') return 'Dashboard';
    if (currentPath === '/admin/posts/create' || currentPath === '/admin/blogs/create') return 'Articles / Create Article';
    if ((currentPath.startsWith('/admin/posts') || currentPath.startsWith('/admin/blogs')) && currentPath.includes('/edit')) return 'Articles / Edit Story';
    if (currentPath === '/admin/posts' || currentPath === '/admin/blogs') return 'Editorial Articles & Posts';
    if (currentPath === '/admin/homepage' || currentPath.startsWith('/admin/homepage')) return 'Homepage Live Studio & CMS';
    if (currentPath === '/admin/pages/create') return 'Pages / Create Page';
    if (currentPath.startsWith('/admin/pages') && currentPath.includes('/edit')) return 'Pages / Edit Page & Sections';
    if (currentPath === '/admin/pages') return 'Pages Manager';
    if (currentPath === '/admin/services') return 'Services Content';
    if (currentPath === '/admin/portfolio') return 'Portfolio Showcase';
    if (currentPath === '/admin/testimonials') return 'Testimonials';
    if (currentPath === '/admin/media') return 'Media Library';
    if (currentPath === '/admin/navigation') return 'Navbar Menu Manager';
    if (currentPath === '/admin/footer') return 'Footer Configuration';
    if (currentPath === '/admin/seo') return 'Global SEO & Metadata';
    if (currentPath === '/admin/settings') return 'Website Settings';
    return 'Admin Console';
  };

  return (
    <header className="admin-console-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-sidebar-toggle-btn"
          onClick={onToggleSidebar || onOpenMobileSidebar}
          aria-label={isSidebarOpen ? "Hide sidebar" : "Open sidebar"}
          title={isSidebarOpen ? "Hide sidebar (Ctrl+B)" : "Open sidebar (Ctrl+B)"}
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="topbar-breadcrumbs">
          <span className="crumb-root">CMS</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-active">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Database Status */}
        <div className={`db-status-badge ${isDbConnected ? 'live' : 'fallback'}`}>
          <span className="db-pulse-dot" />
          <Database size={13} />
          <span>{isDbConnected ? 'MongoDB Live' : 'Local Fallback'}</span>
        </div>

        {/* Sync Button */}
        {onSyncData && (
          <button
            type="button"
            className="topbar-sync-btn"
            onClick={onSyncData}
            title="Sync Live Records"
          >
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
        )}

        {/* Live Website Preview */}
        <button
          type="button"
          className="topbar-live-site-btn"
          onClick={onViewSite}
          title="Return to Public Website"
        >
          <ExternalLink size={14} />
          <span>Live Site</span>
        </button>

        <div className="topbar-divider-v" />

        {/* User Badge */}
        <div className="topbar-user-pill">
          <div className="topbar-user-avatar">
            {(adminUser?.name || adminUser?.username || 'Admin').substring(0, 2).toUpperCase()}
          </div>
          <div className="topbar-user-meta">
            <span className="topbar-user-name">{adminUser?.name || adminUser?.username || 'Admin'}</span>
            <span className="topbar-user-role">
              <ShieldCheck size={11} color="var(--accent-emerald)" />
              <span>
                {adminUser?.role === 'SUPER_ADMIN'
                  ? 'Super Admin'
                  : adminUser?.role === 'ADMIN'
                  ? 'Admin'
                  : (adminUser?.role || 'Admin')}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
