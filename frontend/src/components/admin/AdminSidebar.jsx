import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, FileText, Image as ImageIcon, 
  Menu as MenuIcon, PanelBottom, Search, Settings, 
  LogOut, ExternalLink, X, ChevronRight, Newspaper, Layers,
  Hash, Tag, Users, Shield, BarChart3, FileEdit, Archive,
  Mail, MessageSquare, Send, Sparkles, Flame, Compass, Rocket, Video
} from 'lucide-react';
import { SettingService } from '../../services/settingService';

export const ADMIN_NAV_GROUPS = [
  {
    group: 'MAIN WORKSPACE',
    items: [
      { id: 'dashboard', path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },
  {
    group: 'EDITORIAL CONTENT',
    items: [
      { id: 'articles', path: '/admin/articles', label: 'All Articles', icon: BookOpen },
      { id: 'videos', path: '/admin/videos', label: 'All Videos', icon: Video },
      { id: 'comments', path: '/admin/comments', label: 'Comments', icon: MessageSquare },
      { id: 'media', path: '/admin/media', label: 'Media Library', icon: ImageIcon },
      { id: 'authors', path: '/admin/authors', label: 'Authors', icon: Users },
    ]
  },
  {
    group: 'MULTIMEDIA & AUDIENCE',
    items: [
      { id: 'submissions', path: '/admin/submissions', label: 'Startup Pitches & Leads', icon: Send },
    ]
  },
  {
    group: 'TAXONOMY & ENTITIES',
    items: [
      { id: 'categories', path: '/admin/categories', label: 'Categories', icon: Layers },
      { id: 'topics', path: '/admin/topics', label: 'Topics', icon: Hash },
      { id: 'tags', path: '/admin/tags', label: 'Tags', icon: Tag },
    ]
  },
  {
    group: 'SITE ARCHITECTURE & CMS',
    items: [
      { id: 'homepage', path: '/admin/homepage', label: 'Homepage Studio', icon: Sparkles, badge: 'LIVE' },
      { id: 'category', path: '/admin/category', label: 'Category Page Studio', icon: Layers, badge: 'LIVE' },
      { id: 'contact', path: '/admin/pages/contact/edit', label: 'Contact Us Studio', icon: Mail, badge: 'LIVE' },
      { id: 'about', path: '/admin/about', label: 'About Us Studio', icon: Compass, badge: 'LIVE' },
      { id: 'advertise', path: '/admin/pages/page_advertise/edit', label: 'Advertise With Us', icon: Newspaper, badge: 'LIVE' },
      { id: 'pages', path: '/admin/pages', label: 'Pages Manager', icon: FileText },
      { id: 'navigation', path: '/admin/navigation', label: 'Navigation CMS', icon: MenuIcon },
      { id: 'footer', path: '/admin/footer', label: 'Footer CMS', icon: PanelBottom },
    ]
  },
  {
    group: 'ACCESS & SETTINGS',
    items: [
      { id: 'users', path: '/admin/users', label: 'Users & Roles', icon: Shield },
      { id: 'seo', path: '/admin/seo', label: 'SEO & Meta Tags', icon: Search },
      { id: 'settings', path: '/admin/settings', label: 'Site Settings', icon: Settings },
    ]
  }
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV_GROUPS.flatMap(g => g.items);

export default function AdminSidebar({
  currentPath,
  onNavigate,
  onLogout,
  onViewSite,
  adminUser,
  isOpen = true,
  onClose,
  onToggle,
  isOpenMobile,
  onCloseMobile,
  siteSettings: propSettings
}) {
  const [siteSettings, setSiteSettings] = useState(() => propSettings || SettingService.getLocalSettings());
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (propSettings) {
      setSiteSettings(propSettings);
    }
  }, [propSettings]);

  useEffect(() => {
    setImgFailed(false);
  }, [siteSettings?.logo, siteSettings?.logoUrl]);

  useEffect(() => {
    if (!siteSettings) {
      SettingService.getSettings().then(st => st && setSiteSettings(st)).catch(() => {});
    }

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

  return (
    <>
      {(isOpenMobile || (isOpen && typeof window !== 'undefined' && window.innerWidth <= 768)) && (
        <div className="admin-sidebar-backdrop" onClick={onClose || onCloseMobile} />
      )}

      <aside className={`admin-cms-sidebar ${!isOpen ? 'closed' : ''} ${isOpenMobile ? 'open-mobile' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div 
            className="sidebar-brand-link" 
            onClick={() => onNavigate('/admin/dashboard')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}
            title={siteSettings?.siteTitle || siteSettings?.siteName || "Dashboard"}
          >
            {(siteSettings?.logo || siteSettings?.logoUrl) && !imgFailed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, maxWidth: '100%' }}>
                <img 
                  src={siteSettings.logo || siteSettings.logoUrl} 
                  alt={siteSettings?.siteTitle || siteSettings?.siteName || 'Logo'} 
                  style={{ maxHeight: '32px', maxWidth: '36px', objectFit: 'contain', flexShrink: 0 }}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                />
                <div className="sidebar-brand-text" style={{ minWidth: 0, overflow: 'hidden' }}>
                  <h3 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                  </h3>
                  <span className="sidebar-tag">EDITORIAL CMS</span>
                </div>
              </div>
            ) : (
              <>
                <div className="sidebar-logo-mark">
                  {siteSettings?.brandEmblem || (siteSettings?.siteName ? siteSettings.siteName.trim().charAt(0).toUpperCase() : 'G')}
                </div>
                <div className="sidebar-brand-text" style={{ minWidth: 0, overflow: 'hidden' }}>
                  <h3 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {siteSettings?.brandPrefix || (siteSettings?.brandSuffix && siteSettings?.siteName?.endsWith(siteSettings.brandSuffix) ? siteSettings.siteName.slice(0, -siteSettings.brandSuffix.length) : siteSettings?.siteName) || 'GoRead'}
                    {siteSettings?.brandSuffix ? (
                      <span style={{ color: 'var(--brand-primary)' }}>
                        {siteSettings.brandSuffix}
                      </span>
                    ) : null}
                  </h3>
                  <span className="sidebar-tag">EDITORIAL CMS</span>
                </div>
              </>
            )}
          </div>
          
        </div>

        {/* Navigation Items Grouped */}
        <nav className="sidebar-nav-menu">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.group} className="sidebar-nav-group-section">
              <div className="sidebar-section-label">{group.group}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || 
                  (item.id === 'homepage' && (currentPath === '/admin/homepage' || currentPath.startsWith('/admin/homepage'))) ||
                  (item.id === 'archived' && (currentPath === '/admin/archived' || currentPath.startsWith('/admin/archived') || currentPath.includes('/archived'))) ||
                  (item.id === 'videos' && (currentPath === '/admin/videos' || currentPath.startsWith('/admin/videos'))) ||
                  (item.id === 'articles' && (currentPath === '/admin/articles' || currentPath.startsWith('/admin/articles') || currentPath.startsWith('/admin/posts') || currentPath.startsWith('/admin/blogs') || currentPath === '/admin/drafts' || currentPath.startsWith('/admin/drafts')) && !currentPath.includes('/archived')) ||
                  (item.id === 'pages' && (currentPath === '/admin/pages' || (currentPath.startsWith('/admin/pages') && !currentPath.startsWith('/admin/homepage')))) ||
                  (item.id === 'users' && (currentPath === '/admin/users' || currentPath === '/admin/roles'));

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate(item.path);
                      onCloseMobile?.();
                    }}
                  >
                    <div className="nav-item-icon">
                      <Icon size={17} />
                    </div>
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && (
                      <span style={{
                        marginLeft: 'auto',
                        marginRight: '6px',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                        color: '#fff',
                        letterSpacing: '0.04em'
                      }}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} className="active-arrow" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom User & Actions */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-view-site-btn"
            onClick={onViewSite}
            title="Open Live Public Website"
          >
            <ExternalLink size={15} />
            <span>View Live Website</span>
          </button>

          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {(adminUser?.name || 'Admin').substring(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="user-name">{adminUser?.name || adminUser?.username || 'Editorial Admin'}</span>
              <span className="user-email">
                {adminUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : (adminUser?.role === 'ADMIN' ? 'Admin' : (adminUser?.role || 'Admin'))}
              </span>
            </div>
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
