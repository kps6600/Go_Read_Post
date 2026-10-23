import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Search, Send, ExternalLink, ChevronRight, ChevronLeft,
  Home, Flame, Zap, Tv, Award, Layers, BookOpen, Mail, 
  Compass, Bookmark, Sun, Moon, ArrowRight, FolderOpen, Play, User,
  LayoutDashboard
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { AuthService } from '../services/authService';

export default function SideDrawer({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenPitchModal,
  searchQuery,
  setSearchQuery,
  activeCategory = 'all',
  savedCount = 0,
  onOpenBookmarks,
  theme,
  setTheme,
  onOpenAuthModal,
  onOpenProModal,
  onOpenAdmin,
  currentUser: propUser,
  siteSettings
}) {
  const { navigationTree } = useNavigation();
  const [currentUser, setCurrentUser] = useState(() => propUser || AuthService.getUser());

  // Navigation Stack for Hierarchical Nested Drilldown
  // e.g. [ { title: 'Just In', items: [...] }, { title: 'Breaking & Live', items: [...] } ]
  const [navStack, setNavStack] = useState([]);

  // Touch gesture tracking for swipe support
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    if (propUser !== undefined) {
      setCurrentUser(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    const handleAuth = (e) => setCurrentUser(e.detail || AuthService.getUser());
    window.addEventListener('auth:change', handleAuth);
    return () => window.removeEventListener('auth:change', handleAuth);
  }, []);

  // Reset drilldown stack when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setNavStack([]);
    }
  }, [isOpen]);

  // Filter dynamic navigation items by active status and visibility
  const activeNavTree = useMemo(() => {
    return (navigationTree || [])
      .filter(item => {
        if (item.isActive === false || item.isVisible === false) return false;
        const vis = (item.visibility || 'PUBLIC').toUpperCase();
        if (vis === 'DESKTOP') return false; // Skip desktop-only on mobile
        if (vis === 'LOGGED_IN' && !currentUser) return false;
        if (vis === 'ADMIN_ONLY' && !AuthService.isStaff(currentUser)) return false;
        return true;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [navigationTree, currentUser]);

  // Current view level items
  const currentLevel = navStack.length > 0 ? navStack[navStack.length - 1] : null;
  const currentItems = currentLevel ? currentLevel.items : activeNavTree;

  // Touch Swipe Handlers (Requirement 23)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Horizontal swipe threshold: > 60px and mostly horizontal
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX > 0) {
        // Swiped Right -> Go Back one level, or close drawer if at root
        if (navStack.length > 0) {
          setNavStack(prev => prev.slice(0, -1));
        } else {
          onClose();
        }
      }
    }
  };

  // Direct Navigation Action for Leaf or Clickable items
  const handleItemNavigation = (item) => {
    onClose();
    const directUrl = (item.url || (item.slug ? `/${item.slug}` : '')).trim();

    if (item.openInNewTab || item.type === 'external' || directUrl.startsWith('http://') || directUrl.startsWith('https://')) {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (directUrl.startsWith('/#')) {
      const anchorId = directUrl.replace('/#', '');
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    if (directUrl === '/') {
      onSelectCategory('all');
      setSearchQuery('');
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (directUrl === '/category/latest' || directUrl === '/latest' || directUrl === '/just-in') {
      onSelectCategory('latest');
      setSearchQuery('');
      window.history.pushState(null, '', directUrl);
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (directUrl.startsWith('/category/')) {
      const catSlug = directUrl.replace('/category/', '').split('/')[0].split('?')[0];
      onSelectCategory(catSlug || 'all');
      setSearchQuery('');
      window.history.pushState(null, '', directUrl);
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (directUrl.startsWith('/topic/')) {
      const topicSlug = directUrl.replace('/topic/', '').split('/')[0].split('?')[0];
      onSelectCategory('topic:' + topicSlug);
      setSearchQuery('');
      window.history.pushState(null, '', directUrl);
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Custom or category/topic route
    setSearchQuery('');
    window.history.pushState(null, '', directUrl || '/');
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99990,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease'
        }}
      />

      {/* Slide-in Drawer */}
      <aside 
        className={`side-drawer ${isOpen ? 'open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '88vw',
          maxWidth: '380px',
          background: 'var(--bg-primary, #ffffff)',
          color: 'var(--text-primary, #111827)',
          zIndex: 99995,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 30px rgba(0,0,0,0.25)',
          overflowY: 'auto'
        }}
      >
        {/* Top Masthead & Close */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.15rem 1.25rem',
          borderBottom: '1px solid var(--border-light, #e5e7eb)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {siteSettings?.logo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={siteSettings.logo} 
                  alt={siteSettings?.siteTitle || siteSettings?.siteName || 'Brand Logo'} 
                  style={{ maxHeight: '30px', maxWidth: '34px', objectFit: 'contain' }}
                />
                <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
                  {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                  {siteSettings?.brandSuffix ? <span style={{ color: '#dc2626' }}>{siteSettings.brandSuffix}</span> : null}
                </span>
              </div>
            ) : (
              <>
                <span style={{
                  width: '28px',
                  height: '28px',
                  background: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem'
                }}>
                  {siteSettings?.brandEmblem || (siteSettings?.siteName ? siteSettings.siteName.trim().charAt(0).toUpperCase() : 'G')}
                </span>
                <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                  {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                  {siteSettings?.brandSuffix ? <span style={{ color: '#dc2626' }}>{siteSettings.brandSuffix}</span> : null}
                </span>
              </>
            )}
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary, #6b7280)',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Omnibar */}
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-light, #e5e7eb)', background: 'var(--bg-secondary, #f9fafb)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #9ca3af)' }} />
            <input 
              type="text"
              className="search-input"
              style={{ 
                width: '100%', 
                paddingLeft: '2.4rem',
                paddingRight: '1rem',
                paddingTop: '0.55rem',
                paddingBottom: '0.55rem',
                fontSize: '0.88rem',
                borderRadius: '999px',
                border: '1px solid var(--border-light, #e5e7eb)',
                background: 'var(--bg-card, #ffffff)',
                color: 'var(--text-primary, #111827)'
              }}
              placeholder="Search stories, founders, deeptech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  onClose();
                  window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
            />
          </div>
        </div>

        {/* Drilldown Back Header (Appears when inside submenu) */}
        {navStack.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.25rem',
            background: 'rgba(220, 38, 38, 0.08)',
            borderBottom: '1px solid rgba(220, 38, 38, 0.15)'
          }}>
            <button
              onClick={() => setNavStack(prev => prev.slice(0, -1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>
              {currentLevel.title}
            </span>
          </div>
        )}

        {/* Dynamic Navigation Body with Nested Drilldown */}
        <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {currentItems.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isRoot = navStack.length === 0;

            return (
              <div 
                key={item._id || item.slug || item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  borderBottom: '1px solid var(--border-light, #f3f4f6)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onClick={() => {
                  if (hasChildren) {
                    // Drill down into child menu
                    setNavStack(prev => [...prev, { title: item.title, items: item.children }]);
                  } else {
                    handleItemNavigation(item);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: isRoot ? '0.95rem' : '0.88rem',
                    fontWeight: isRoot ? 750 : 600,
                    color: 'var(--text-primary, #111827)'
                  }}>
                    {item.title}
                  </span>
                  {item.description && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      background: 'rgba(220, 38, 38, 0.12)',
                      color: '#dc2626'
                    }}>
                      {item.description}
                    </span>
                  )}
                </div>

                {hasChildren ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                      {item.children.length}
                    </span>
                    <ChevronRight size={17} />
                  </div>
                ) : item.openInNewTab || item.type === 'external' ? (
                  <ExternalLink size={15} style={{ opacity: 0.5 }} />
                ) : null}
              </div>
            );
          })}

          {/* Quick Member Access & Utility Links (When at Root level) */}
          {navStack.length === 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light, #e5e7eb)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Member Auth */}
              {currentUser ? (
                <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-secondary, #f9fafb)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentUser.name || currentUser.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6b7280)' }}>{currentUser.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      AuthService.logout();
                      onClose();
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div>
                  <button 
                    onClick={() => {
                      onClose();
                      if (onOpenAuthModal) onOpenAuthModal('login');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary, #f3f4f6)',
                      border: '1px solid var(--border-light, #e5e7eb)',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: 'var(--text-primary, #111827)',
                      cursor: 'pointer'
                    }}
                  >
                    <User size={14} />
                    <span>Log In</span>
                  </button>
                </div>
              )}

              {/* Saved Stories */}
              <button
                onClick={() => {
                  onClose();
                  if (!currentUser) {
                    if (onOpenAuthModal) onOpenAuthModal('login');
                    return;
                  }
                  if (onOpenBookmarks) onOpenBookmarks();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary, #f9fafb)',
                  border: '1px solid var(--border-light, #e5e7eb)',
                  color: 'var(--text-primary, #111827)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bookmark size={16} />
                  <span>Saved Stories</span>
                </div>
                {Boolean(currentUser && savedCount > 0) && (
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: '#dc2626', color: '#fff' }}>
                    {savedCount}
                  </span>
                )}
              </button>

              {/* Admin Console Shortcut (only for authenticated staff) */}
              {Boolean(currentUser && AuthService.isStaff(currentUser)) && (
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAdmin) onOpenAdmin();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(220, 38, 38, 0.08)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    color: '#dc2626',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <LayoutDashboard size={16} />
                  <span>CMS Admin Console</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary, #f9fafb)',
                  border: '1px solid var(--border-light, #e5e7eb)',
                  color: 'var(--text-primary, #111827)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
              </button>
              {/* Directory & Company Navigation Links */}
              <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-light, #e5e7eb)'
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted, #9ca3af)',
                  marginBottom: '0.5rem'
                }}>
                  Explore & Company
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.4rem'
                }}>
                  {[
                    { label: 'Trending', url: '/trending' },
                    { label: 'About Us', url: '/about' },
                    { label: 'Contact Us', url: '/contact' },
                    { label: 'Advertise', url: '/advertise' },
                    { label: 'Editorial Policy', url: '/editorial-policy' },
                    { label: 'Privacy Policy', url: '/privacy-policy' },
                    { label: 'Terms of Service', url: '/terms' },
                    { label: 'Disclaimer', url: '/disclaimer' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onClose();
                        window.history.pushState(null, '', item.url);
                        window.dispatchEvent(new Event('popstate'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-light, #f3f4f6)',
                        borderRadius: '6px',
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary, #4b5563)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#dc2626';
                        e.currentTarget.style.borderColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary, #4b5563)';
                        e.currentTarget.style.borderColor = 'var(--border-light, #f3f4f6)';
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Pitch Action Card */}
          <div style={{
            background: 'var(--bg-secondary, #f9fafb)',
            border: '1px solid var(--border-light, #e5e7eb)',
            borderRadius: '10px',
            padding: '1.15rem',
            marginTop: 'auto'
          }}>
            <div style={{ fontWeight: '800', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
              Are you building a startup?
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #6b7280)', marginBottom: '0.85rem', lineHeight: '1.4' }}>
              Submit your journey to our editorial bureau to get covered on GoReadPost.
            </p>
            <button 
              className="pitch-btn" 
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem',
                borderRadius: '6px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              onClick={() => {
                onClose();
                if (onOpenPitchModal) onOpenPitchModal();
              }}
            >
              <Send size={14} />
              <span>Pitch Your Story</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-light, #e5e7eb)',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #9ca3af)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>GoReadPost Edition 2026</span>
          <span style={{ fontWeight: '700', color: '#dc2626' }}>Swipe right to go back</span>
        </div>
      </aside>
    </>
  );
}
