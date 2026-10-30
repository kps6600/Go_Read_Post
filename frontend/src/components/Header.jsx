import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Moon, Sun, Bookmark, Send, X, 
  ChevronDown, ChevronRight, LayoutDashboard,
  User as UserIcon, LogOut, ShieldCheck
} from 'lucide-react';
import { NAV_LINKS, NAV_DROPDOWNS_DATA, BRANDS_MENU_DATA } from '../data/storiesData';
import { AuthService } from '../services/authService';
import { useNavigation } from '../context/NavigationContext';
export default function Header({ 
  theme, 
  setTheme, 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory,
  savedCount,
  onOpenBookmarks,
  onOpenPitchModal,
  onOpenSideDrawer,
  onShowToast,
  onOpenAuthModal,
  onOpenProModal,
  onOpenAdmin,
  navLinks,
  onSearchSubmit,
  onGoHome,
  currentUser: propUser,
  siteSettings
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => propUser || AuthService.getUser());
  const [logoImgFailed, setLogoImgFailed] = useState(false);
  const { navigationTree, loading: navLoading } = useNavigation();

  useEffect(() => {
    setLogoImgFailed(false);
  }, [siteSettings?.logo]);

  const [currentPath, setCurrentPath] = useState(() => {
    try {
      return window.location.pathname;
    } catch (e) {
      return '/';
    }
  });

  useEffect(() => {
    const handleLocationChange = () => {
      try {
        setCurrentPath(window.location.pathname);
        setIsNavHidden(false);
      } catch (e) {}
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const searchInputRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchFocusedRef = useRef(false);
  const mobileSearchOpenRef = useRef(false);

  useEffect(() => {
    searchFocusedRef.current = searchFocused;
  }, [searchFocused]);

  useEffect(() => {
    mobileSearchOpenRef.current = mobileSearchOpen;
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (propUser !== undefined) {
      setCurrentUser(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    const handleAuth = (e) => {
      const u = e.detail?.user !== undefined ? e.detail.user : AuthService.getUser();
      setCurrentUser(u);
    };
    window.addEventListener('auth:change', handleAuth);
    AuthService.checkAuth().then(() => {
      setCurrentUser(AuthService.getUser());
    }).catch(() => {});
    return () => window.removeEventListener('auth:change', handleAuth);
  }, []);

  // Live scroll progress & smart hide-on-scroll header behavior
  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY || 0;
    const scrollThreshold = 10; // Minimum scroll delta in px to prevent micro-jitter

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const progress = (currentScrollY / totalHeight) * 100;
            setScrollProgress(Math.min(100, Math.max(0, progress)));
          }
          setIsScrolled(currentScrollY > 20);

          // If search is active/focused or mobile search drawer is open, keep navbar visible
          if (searchFocusedRef.current || mobileSearchOpenRef.current) {
            setIsNavHidden(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          const diff = currentScrollY - lastScrollY;

          if (currentScrollY <= 60) {
            // Near the top of the page, always show navbar
            setIsNavHidden(false);
          } else if (diff > scrollThreshold) {
            // Scrolling DOWN -> hide navbar
            setIsNavHidden(true);
            setActiveDropdown(null);
            setUserDropdownOpen(false);
          } else if (diff < -scrollThreshold) {
            // Scrolling UP -> reveal navbar
            setIsNavHidden(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileSearchOpen(false);
        setUserDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Derive normalized dynamic nav links directly from MongoDB navigation API
  // Priority: DB navigationTree > navLinks prop > static NAV_LINKS fallback
  const sourceNav = (Array.isArray(navigationTree) && navigationTree.length > 0)
    ? navigationTree
    : (navLinks && navLinks.length > 0 ? navLinks : NAV_LINKS);

  // Normalize slug/url aliases to a single dedup key so items like
  // "just-in" (slug) and "latest" (slug) that both represent the same
  // Latest section don't appear twice in the navbar.
  const _navDedupeKey = (link) => {
    const slug = (link.slug || link.id || '').toLowerCase();
    const url  = (link.url || link.target || '').toLowerCase().replace(/\/$/, '');
    if (slug === 'just-in' || slug === 'latest' || url === '/latest' || url === '/category/latest' || url === '/just-in') return '__latest__';
    if (slug === 'trending' || url === '/trending' || url === '/category/trending') return '__trending__';
    return slug || url || (link.title || link.label || '').toLowerCase();
  };

  const effectiveNavLinks = (() => {
    const _seen = new Set();
    return sourceNav
      .filter(link => {
        if (link.isActive === false || link.visible === false || link.isVisible === false) return false;
        const vis = (link.visibility || 'PUBLIC').toUpperCase();
        if (vis === 'MOBILE') return false; // Skip mobile-only on desktop
        if (vis === 'LOGGED_IN' && !currentUser) return false;
        if (vis === 'ADMIN_ONLY' && !AuthService.isStaff(currentUser)) return false;
        // Deduplicate: keep only the first occurrence of each semantic nav item
        const key = _navDedupeKey(link);
        if (key && _seen.has(key)) return false;
        if (key) _seen.add(key);
        return true;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  })().map(link => {
      const id = link.slug || link.id || (link._id ? String(link._id) : '');
      const label = link.title || link.label || 'Menu';
      const isFromDb = Boolean(link._id);

      // Filter child links: keep real child pages with title or label
      const validChildren = (link.children || []).filter(c => {
        if (!c) return false;
        if (c.isActive === false || c.isVisible === false) return false;
        return Boolean(c.title || c.label);
      });
      const hasValidChildren = validChildren.length > 0;

      // Curated dropdown data fallback for standard editorial menus (Categories, Topics, Company)
      const fallbackData = NAV_DROPDOWNS_DATA[id] || NAV_DROPDOWNS_DATA[link.slug] || NAV_DROPDOWNS_DATA[link.id];

      let columns = link.dropdownColumns;
      if ((!columns || columns.length === 0) && hasValidChildren) {
        const hasGrandchildren = validChildren.some(c => c.children && c.children.length > 0);
        if (hasGrandchildren) {
          columns = validChildren.map(child => ({
            title: child.title || child.label,
            items: (child.children && child.children.length > 0)
              ? child.children.map(gc => ({
                  label: gc.title || gc.label,
                  url: gc.url || (gc.slug ? `/${gc.slug}` : '#'),
                  target: gc.url || (gc.slug ? `/${gc.slug}` : '#'),
                  badge: gc.badge || gc.badgeText || null
                }))
              : [{ 
                  label: child.title || child.label, 
                  url: child.url || (child.slug ? `/${child.slug}` : '#'), 
                  target: child.url || (child.slug ? `/${child.slug}` : '#'),
                  badge: child.badge || child.badgeText || null 
                }]
          }));
        } else {
          columns = [
            {
              title: label,
              items: validChildren.map(child => ({
                label: child.title || child.label,
                url: child.url || (child.slug ? `/${child.slug}` : '#'),
                target: child.url || (child.slug ? `/${child.slug}` : '#'),
                badge: child.badge || child.badgeText || null
              }))
            }
          ];
        }
      }

      if ((!columns || columns.length === 0) && fallbackData?.columns) {
        columns = fallbackData.columns;
      }
      const dropdownData = (columns && columns.length > 0)
        ? { columns, align: fallbackData?.align || 'center' }
        : (fallbackData || null);

      const hasColumns = Boolean((columns && columns.length > 0) || (dropdownData && dropdownData.columns && dropdownData.columns.length > 0));
      const isBrands = id === 'brands' || link.slug === 'brands';

      // An item has a dropdown if it has columns or is brands
      const hasDropdown = Boolean(
        (link.hasDropdown || link.type === 'dropdown' || link.type === 'mega' || hasValidChildren || isBrands || Boolean(dropdownData)) &&
        (hasColumns || isBrands)
      );

      return {
        ...link,
        id,
        label,
        hasDropdown,
        dropdownData,
        dropdownColumns: hasColumns ? (columns || dropdownData?.columns || []) : []
      };
    });

  // 100% URL-driven active tab evaluator (prevents label or ID hijacking)
  const isNavActive = (link) => {
    if (!link) return false;
    const linkUrl = (link.url || link.target || '').trim();
    const normCurrent = (currentPath || '/').toLowerCase().replace(/\/$/, '') || '/';
    const normLink = linkUrl.toLowerCase().replace(/\/$/, '') || '/';

    // 1. Explicit configured URL
    if (linkUrl) {
      if (normLink === '/') {
        return normCurrent === '/' && (activeCategory === 'all' || activeCategory === 'home');
      }

      if (normLink === '/category/latest' || normLink === '/latest' || normLink === '/just-in') {
        return activeCategory === 'latest' || normCurrent === '/category/latest' || normCurrent === '/latest' || normCurrent === '/just-in';
      }

      if (normLink.startsWith('/category/')) {
        const catSlug = normLink.replace('/category/', '').split('/')[0].split('?')[0];
        return activeCategory === catSlug || normCurrent === normLink;
      }

      if (normLink.startsWith('/topic/')) {
        const topicSlug = normLink.replace('/topic/', '').split('/')[0].split('?')[0];
        return activeCategory === `topic:${topicSlug}` || normCurrent === normLink;
      }

      if (normLink === '/trending' || normLink === '/category/trending') {
        return activeCategory === 'trending' || normCurrent === '/trending' || normCurrent === '/category/trending';
      }

      if (normLink === '/videos' || normLink === '/video' || normLink === '/ystv') {
        return activeCategory === 'videos' || normCurrent === '/videos';
      }

      if (normLink === '/newsletter') {
        return activeCategory === 'newsletter' || normCurrent === '/newsletter';
      }


      return normCurrent === normLink;
    }

    // 2. Fallback by link identifier if no direct URL is configured
    if (link.id === 'home' || link.slug === 'home') {
      return normCurrent === '/' && (activeCategory === 'all' || activeCategory === 'home');
    }
    if (link.id === 'just-in' || link.id === 'latest' || link.slug === 'just-in' || link.slug === 'latest') {
      return activeCategory === 'latest' || normCurrent === '/latest' || normCurrent === '/category/latest';
    }
    if (link.id === 'trending' || link.slug === 'trending') {
      return activeCategory === 'trending' || normCurrent === '/trending';
    }

    return activeCategory === link.id || activeCategory === link.slug;
  };

  const handleMouseEnter = (linkId, hasDropdown) => {
    if (!hasDropdown) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown(linkId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 320);
  };

  const handleNavClick = (linkId, hasDropdown, linkItem, e) => {
    if (hasDropdown) {
      if (e) e.preventDefault();
      setActiveDropdown(prev => prev === linkId ? null : linkId);
      return;
    }
    setActiveDropdown(null);

    const directUrl = (linkItem?.url || linkItem?.target || '').trim();

    // 1. External Link check (if user configured openInNewTab or external protocol)
    if (directUrl && (directUrl.startsWith('http://') || directUrl.startsWith('https://') || linkItem?.openInNewTab || linkItem?.type === 'external')) {
      if (e) e.preventDefault();
      window.open(directUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2. Direct URL navigation from Admin Navigation Panel
    if (directUrl) {
      if (e) e.preventDefault();

      if (directUrl.startsWith('/#')) {
        const anchorId = directUrl.replace('/#', '');
        const el = document.getElementById(anchorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      // Root Homepage navigation
      if (directUrl === '/') {
        setActiveCategory('all');
        setSearchQuery('');
        try {
          window.history.pushState(null, '', '/');
          window.dispatchEvent(new Event('popstate'));
        } catch (err) {}
        if (onGoHome) onGoHome();
        setCurrentPath('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Category Latest / Just In navigation
      if (directUrl === '/category/latest' || directUrl === '/latest' || directUrl === '/just-in') {
        setActiveCategory('latest');
        setSearchQuery('');
        window.history.pushState(null, '', directUrl);
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath(directUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Dynamic Category URL: e.g. /category/startups, /category/technology, etc.
      if (directUrl.startsWith('/category/')) {
        const catSlug = directUrl.replace('/category/', '').split('/')[0].split('?')[0];
        setActiveCategory(catSlug || 'all');
        setSearchQuery('');
        window.history.pushState(null, '', directUrl);
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath(directUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Dynamic Topic URL: e.g. /topic/ai
      if (directUrl.startsWith('/topic/')) {
        const topicSlug = directUrl.replace('/topic/', '').split('/')[0].split('?')[0];
        setActiveCategory('topic:' + topicSlug);
        setSearchQuery('');
        window.history.pushState(null, '', directUrl);
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath(directUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (directUrl === '/trending' || directUrl === '/category/trending') {
        setActiveCategory('trending');
        setSearchQuery('');
        window.history.pushState(null, '', directUrl);
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath(directUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (directUrl === '/videos' || directUrl === '/video' || directUrl === '/ystv') {
        setActiveCategory('videos');
        setSearchQuery('');
        window.history.pushState(null, '', directUrl);
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath(directUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (directUrl === '/newsletter') {
        setActiveCategory('newsletter');
        setSearchQuery('');
        window.history.pushState(null, '', directUrl);
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath(directUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (directUrl === '/resources') {
        setActiveCategory('all');
        setSearchQuery('');
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }


      if (directUrl === '/founder-first') {
        setActiveCategory('startups');
        setSearchQuery('');
        window.history.pushState(null, '', '/category/startups');
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath('/category/startups');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (directUrl === '/brands' || directUrl === '/category/hindi' || directUrl === '/hindi' || directUrl === '/category/ys-hindi') {
        setActiveCategory('all');
        setSearchQuery('');
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Default direct URL push (e.g. dynamic pages, custom links)
      setSearchQuery('');
      window.history.pushState(null, '', directUrl);
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath(directUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Fallback when NO directUrl was provided:
    const targetDesk = linkItem?.target || linkItem?.slug || linkId;

    if (targetDesk === 'home' || linkId === 'home') {
      if (e) e.preventDefault();
      setActiveCategory('all');
      setSearchQuery('');
      try {
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new Event('popstate'));
      } catch (err) {}
      if (onGoHome) onGoHome();
      setCurrentPath('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetDesk === 'just-in' || targetDesk === 'latest' || linkId === 'just-in' || linkId === 'latest') {
      if (e) e.preventDefault();
      setActiveCategory('latest');
      setSearchQuery('');
      window.history.pushState(null, '', '/latest');
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath('/latest');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetDesk === 'trending' || linkId === 'trending') {
      if (e) e.preventDefault();
      setActiveCategory('trending');
      setSearchQuery('');
      window.history.pushState(null, '', '/trending');
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath('/trending');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Known brand & category desks
    if (['startups', 'technology', 'ai-deeptech', 'ai', 'enterprise', 'fintech', 'leadership', 'ai-story', 'her-story', 'herstory', 'social-story', 'smbstory', 'smb-story'].includes(targetDesk)) {
      if (e) e.preventDefault();
      setActiveCategory(targetDesk);
      setSearchQuery('');
      window.history.pushState(null, '', `/category/${targetDesk}`);
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath(`/category/${targetDesk}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetDesk === 'hindi' || targetDesk === 'ys-hindi' || targetDesk === 'yshindi') {
      if (e) e.preventDefault();
      setActiveCategory('all');
      setSearchQuery('');
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetDesk === 'resources') {
      if (e) e.preventDefault();
      setActiveCategory('all');
      setSearchQuery('');
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetDesk === 'brands') {
      if (e) e.preventDefault();
      setActiveCategory('all');
      setSearchQuery('');
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetDesk === 'newsletter') {
      if (e) e.preventDefault();
      setActiveCategory('newsletter');
      setSearchQuery('');
      window.history.pushState(null, '', '/newsletter');
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath('/newsletter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (['ystv', 'videos', 'video'].includes(targetDesk)) {
      if (e) e.preventDefault();
      setActiveCategory('videos');
      setSearchQuery('');
      window.history.pushState(null, '', '/videos');
      window.dispatchEvent(new Event('popstate'));
      setCurrentPath('/videos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Homepage Anchor Navigation
    if (linkItem?.type === 'anchor') {
      const el = document.getElementById(linkItem.target || linkId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    // If activeCategory is not 'all' or user has a search query, reset to home page first
    if (activeCategory !== 'all' || searchQuery.trim()) {
      setActiveCategory('all');
      setSearchQuery('');
      window.history.pushState(null, '', window.location.pathname);
      setTimeout(() => {
        const el = document.getElementById(linkId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 70);
      return;
    }

    const el = document.getElementById(linkId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (hasDropdown) {
      setActiveDropdown(activeDropdown === linkId ? null : linkId);
    } else {
      setActiveCategory(linkId);
      setSearchQuery('');
    }
  };

  const handleSubItemClick = (item) => {
    // Custom URL or External Link
    const directUrl = (item.url || (item.target && (item.target.startsWith('http') || item.target.startsWith('/')) ? item.target : null) || '').trim();
    if (directUrl) {
      if (directUrl.startsWith('http://') || directUrl.startsWith('https://') || item.openInNewTab) {
        window.open(directUrl, '_blank', 'noopener,noreferrer');
      } else if (directUrl === '/') {
        setActiveCategory('all');
        setSearchQuery('');
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new Event('popstate'));
        if (onGoHome) onGoHome();
        setCurrentPath('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (directUrl === '/category/latest' || directUrl === '/latest' || directUrl === '/just-in') {
          setActiveCategory('latest');
        } else if (directUrl.startsWith('/category/')) {
          const cat = directUrl.replace('/category/', '').split('/')[0].split('?')[0];
          setActiveCategory(cat || 'all');
        } else if (directUrl.startsWith('/topic/')) {
          const top = directUrl.replace('/topic/', '').split('/')[0].split('?')[0];
          setActiveCategory('topic:' + top);
        }
        setSearchQuery('');
        window.history.pushState(null, '', directUrl);
        window.dispatchEvent(new Event('popstate'));
        setCurrentPath(directUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setActiveDropdown(null);
      return;
    }

    if (item.externalUrl || item.categoryId === 'captable' || item.target === 'captable' || (item.label && item.label.toLowerCase().includes('captable'))) {
      window.open(item.externalUrl || 'https://the-captable.com/', '_blank', 'noopener,noreferrer');
      setActiveDropdown(null);
      return;
    }

    const catKey = item.categoryId || item.target || '';
    if (catKey === 'just-in' || (item.label && item.label.toLowerCase() === 'just in')) {
      setActiveCategory('just-in');
      setSearchQuery('');
      window.history.pushState(null, '', '?tag=Just%20In');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (catKey === 'ai-story' || (item.label && item.label.toLowerCase().includes('ai story'))) {
      setActiveCategory('ai');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/ai');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (catKey === 'her-story' || (item.label && item.label.toLowerCase().includes('herstory'))) {
      setActiveCategory('herstory');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/herstory');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (catKey === 'social-story' || (item.label && item.label.toLowerCase().includes('socialstory'))) {
      setActiveCategory('social-story');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/social-story');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (
      catKey === 'smbstory' || 
      catKey === 'smb-story' || 
      (item.label && item.label.toLowerCase().includes('smbstory')) ||
      (item.label && item.label.toLowerCase().includes('smb story'))
    ) {
      setActiveCategory('smbstory');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/smbstory');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (
      catKey === 'enterprise' || 
      catKey === 'enterprisestory' || 
      (item.label && item.label.toLowerCase().includes('enterprise'))
    ) {
      setActiveCategory('enterprise');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/enterprise');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (
      catKey === 'hindi' || 
      (item.label && item.label.toLowerCase().includes('hindi'))
    ) {
      setActiveCategory('all');
      setSearchQuery('');
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (item.action === 'pitch') {
      if (onOpenPitchModal) onOpenPitchModal();
    } else if (item.scrollId) {
      const el = document.getElementById(item.scrollId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (item.categoryId || item.target) {
      setActiveCategory(item.categoryId || item.target);
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.query) {
      setActiveCategory('all');
      setSearchQuery(item.query);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveDropdown(null);
  };

  const handleBrandItemClick = (brandItem) => {
    if (
      brandItem.externalUrl || 
      brandItem.categoryId === 'captable' || 
      (brandItem.title && brandItem.title.toLowerCase().includes('captable'))
    ) {
      window.open(brandItem.externalUrl || 'https://the-captable.com/', '_blank', 'noopener,noreferrer');
      setActiveDropdown(null);
      return;
    }
    if (
      brandItem.categoryId === 'ai-story' || 
      (brandItem.title && brandItem.title.toLowerCase().includes('ai story'))
    ) {
      setActiveCategory('ai');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/ai');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (
      brandItem.categoryId === 'her-story' || 
      (brandItem.title && brandItem.title.toLowerCase().includes('herstory'))
    ) {
      setActiveCategory('herstory');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/herstory');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (
      brandItem.categoryId === 'social-story' || 
      (brandItem.title && brandItem.title.toLowerCase().includes('socialstory'))
    ) {
      setActiveCategory('social-story');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/social-story');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (
      brandItem.categoryId === 'smbstory' || 
      brandItem.categoryId === 'smb-story' || 
      (brandItem.title && brandItem.title.toLowerCase().includes('smbstory')) ||
      (brandItem.title && brandItem.title.toLowerCase().includes('smb story'))
    ) {
      setActiveCategory('smbstory');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/smbstory');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (
      brandItem.categoryId === 'enterprise' || 
      brandItem.categoryId === 'enterprisestory' || 
      (brandItem.title && brandItem.title.toLowerCase().includes('enterprise'))
    ) {
      setActiveCategory('enterprise');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/enterprise');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (
      brandItem.categoryId === 'hindi' || 
      (brandItem.title && brandItem.title.toLowerCase().includes('hindi'))
    ) {
      setActiveCategory('hindi');
      setSearchQuery('');
      window.history.pushState(null, '', '/category/hindi');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveDropdown(null);
      return;
    }
    if (brandItem.categoryId) {
      setActiveCategory(brandItem.categoryId);
      setSearchQuery('');
      window.history.pushState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (brandItem.title) {
      setActiveCategory('all');
      setSearchQuery(brandItem.title);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveDropdown(null);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const triggerToast = (msg) => {
    if (onShowToast) onShowToast(msg);
  };

  // Limit secondary categorical navbar to 7 primary items; excess items appear under "More"
  const MAX_PRIMARY_NAV_ITEMS = 7;
  const visibleNavLinks = effectiveNavLinks.slice(0, MAX_PRIMARY_NAV_ITEMS);
  const overflowNavLinks = effectiveNavLinks.slice(MAX_PRIMARY_NAV_ITEMS);
  const hasOverflow = overflowNavLinks.length > 0;

  const isOverflowActive = overflowNavLinks.some(link => isNavActive(link));
  const isMoreDropdownOpen = activeDropdown === 'more';

  return (
    <header className={`header-wrapper ${isScrolled ? 'header-scrolled' : ''} ${isNavHidden ? 'header-hidden' : ''}`}>

      {/* Top Reading Progress Bar */}
      <div 
        className="navbar-reading-bar" 
        style={{ width: `${scrollProgress}%` }} 
      />

      <div className="container">
        {/* 2. Main Tier Navbar: Original Logo + Search + Actions */}
        <div className="modern-nav-main">
          
          {/* Left: Mobile Menu Button & Original Logo */}
          <div className="nav-left-box">
            <button 
              className="modern-menu-btn"
              onClick={onOpenSideDrawer}
              aria-label="Open navigation menu"
              title="Navigation Menu"
            >
              <span className="menu-bar" />
              <span className="menu-bar" style={{ width: '14px' }} />
              <span className="menu-bar" style={{ width: '18px' }} />
            </button>

            {/* Dynamic Brand Logo: Image Logo OR [Emblem] BrandName */}
            <div 
              className="modern-logo-wrap"
              style={{ cursor: 'pointer' }}
              onClick={(e) => { 
                e.preventDefault();
                setActiveCategory('all'); 
                setSearchQuery(''); 
                window.history.pushState(null, '', '/');
                window.dispatchEvent(new Event('popstate'));
                if (onGoHome) onGoHome();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title={siteSettings?.siteTitle || "GoReadPost Home"}
            >
              {siteSettings?.logo && !logoImgFailed ? (
                <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={siteSettings.logo} 
                    alt={siteSettings?.siteTitle || siteSettings?.siteName || 'Brand Logo'} 
                    style={{ maxHeight: '38px', maxWidth: '140px', objectFit: 'contain' }}
                    referrerPolicy="no-referrer"
                    onError={() => setLogoImgFailed(true)}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary, #0f172a)', lineHeight: 1.15 }}>
                      {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', marginTop: '1px' }}>
                      Read • Learn • Grow
                    </div>
                  </div>
                </div>
              ) : (
                <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="brand-emblem" style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#ef4444',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.3rem',
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.28)',
                    flexShrink: 0
                  }}>
                    {siteSettings?.brandEmblem || 'G'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary, #0f172a)', lineHeight: 1.15 }}>
                      {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', marginTop: '1px' }}>
                      Read • Learn • Grow
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Omnibar */}
          <div className={`modern-search-box ${searchFocused ? 'focused' : ''}`}>
            <Search size={19} className="search-icon-svg" />
            <input 
              ref={searchInputRef}
              type="text" 
              className="modern-search-input"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  if (onSearchSubmit) {
                    onSearchSubmit(searchQuery.trim());
                  } else {
                    window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }
              }}
            />
            {searchQuery && (
              <button 
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Right: Actions Cluster */}
          <div className="nav-actions-box">
            {/* Mobile Search Toggle */}
            <button
              className="mobile-search-toggle-btn"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              title="Search"
              aria-label="Search stories"
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Dynamic Authentication Cluster */}
            {currentUser ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="modern-icon-pill"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer'
                  }}
                  title={currentUser.name || currentUser.username}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-primary, #dc2626)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    {(currentUser.name || currentUser.username || 'U').charAt(0)}
                  </div>
                  <span className="action-pill-text" style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(currentUser.name || currentUser.username || 'User').split(' ')[0]}
                  </span>
                  <ChevronDown size={14} style={{ opacity: 0.7 }} />
                </button>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    padding: '12px',
                    zIndex: 1000,
                    color: 'var(--text-primary, #111827)'
                  }}>
                    <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color, #f3f4f6)', marginBottom: '8px' }}>
                       <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser.name || currentUser.username}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6b7280)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
                      <div style={{ marginTop: '6px' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(220, 38, 38, 0.15)',
                          color: '#dc2626',
                          textTransform: 'uppercase'
                        }}>
                          {currentUser.role || 'READER'}
                        </span>
                      </div>
                    </div>

                    {AuthService.isStaff(currentUser) && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenAdmin) onOpenAdmin();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          background: 'none',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#dc2626',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          textAlign: 'left'
                        }}
                      >
                        <LayoutDashboard size={15} color="#dc2626" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenBookmarks) onOpenBookmarks();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'inherit',
                        fontSize: '0.85rem',
                        textAlign: 'left'
                      }}
                    >
                      <Bookmark size={15} />
                      <span>Saved Stories ({savedCount || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        AuthService.logout();
                        if (onShowToast) onShowToast('Logged out successfully.');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        marginTop: '4px',
                        borderTop: '1px solid var(--border-color, #f3f4f6)',
                        background: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottom: 'none',
                        borderRadius: '0 0 6px 6px',
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontSize: '0.85rem',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={15} color="#ef4444" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Log in */}
                <button 
                  className="header-link-btn"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                >
                  Log in
                </button>

                {/* Sign Up */}
                <button 
                  className="header-link-btn"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Bookmarks Counter Button */}
            <button 
              className="modern-icon-pill" 
              onClick={() => {
                if (!currentUser) {
                  if (onShowToast) onShowToast('Please log in to view your saved stories.');
                  if (onOpenAuthModal) onOpenAuthModal('login');
                  return;
                }
                if (onOpenBookmarks) onOpenBookmarks();
              }}
              title="Saved Stories"
              aria-label="Saved Stories"
            >
              <Bookmark size={20} />
              <span className="action-pill-text">Saved</span>
              {Boolean(currentUser && savedCount > 0) && <span className="saved-counter-badge">{savedCount}</span>}
            </button>

            {/* Theme Toggle Sun / Moon */}
            <button 
              className="modern-theme-btn" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={20} color="#fbbf24" className="rotate-icon" />
              ) : (
                <Moon size={20} className="rotate-icon" />
              )}
            </button>

            {/* Pitch Story / Submit Website Primary CTA */}
            <button className="modern-pitch-btn" onClick={onOpenPitchModal}>
              <Send size={18} />
              <span className="pitch-btn-label">Pitch Story</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Omnibar */}
        {mobileSearchOpen && (
          <div className="mobile-search-expandable">
            <Search size={16} className="search-icon-svg" />
            <input 
              type="text" 
              autoFocus
              className="modern-search-input"
              placeholder="Search stories, founders, deeptech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* 3. Secondary Tier: Categorical Navigation with 3-Column Mega Dropdowns */}
        <nav className="modern-nav-sub">
          <div className="nav-pills-row">
            {visibleNavLinks.map((link, idx) => {
              const hasColumns = Boolean(
                (link.dropdownColumns && link.dropdownColumns.length > 0) ||
                link.id === 'brands' ||
                link.slug === 'brands'
              );
              const hasDropdown = Boolean(link.hasDropdown && hasColumns);
              const isDropdownOpen = hasDropdown && activeDropdown === link.id;
              const isActive = isNavActive(link) || isDropdownOpen;
              const dropdownAlign = link.dropdownData?.align || (idx >= visibleNavLinks.length - 2 ? 'right' : (idx <= 1 ? 'left' : 'center'));

              return (
                <div 
                  key={link._id || link.id || link.slug} 
                  className={`dropdown-container ${link.id === 'brands' ? 'dropdown-static-parent' : ''} ${isDropdownOpen ? 'dropdown-active' : ''}`}
                  onMouseEnter={() => handleMouseEnter(link.id, hasDropdown)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`modern-cat-tab ${isActive ? 'active' : ''} ${link.isBadge ? 'summit-tab' : ''}`}
                    onClick={(e) => handleNavClick(link.id, hasDropdown, link, e)}
                    aria-expanded={hasDropdown ? isDropdownOpen : undefined}
                    aria-haspopup={hasDropdown ? 'true' : undefined}
                  >
                    <span>
                      {link.isBadge && link.badgeText && link.label.includes(link.badgeText)
                        ? link.label.replace(link.badgeText, '').trim()
                        : link.label}
                    </span>
                    {link.isBadge && (
                      <span className="nav-pulse-badge">
                        <span className="nav-badge-dot" />
                        <span>{link.badgeText || "2026"}</span>
                      </span>
                    )}
                    {hasDropdown && (
                      <span 
                        className="cat-tab-chevron-wrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === link.id ? null : link.id);
                        }}
                        title="Toggle menu"
                      >
                        <ChevronDown 
                          size={15} 
                          className={`chevron-icon ${isDropdownOpen ? 'rotated' : ''}`} 
                        />
                      </span>
                    )}
                  </button>

                  {/* 1. Dedicated Brands Mega Dropdown (Exact match with reference screenshot) */}
                  {link.hasDropdown && isDropdownOpen && link.id === 'brands' && (
                    <div 
                      className="brands-reference-mega"
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        setActiveDropdown('brands');
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button 
                        type="button" 
                        className="brands-close-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(null);
                        }}
                        aria-label="Close brands menu"
                        title="Close"
                      >
                        <X size={15} />
                      </button>

                      <div className="brands-3col-layout">
                        {/* Column 1: The CapTable, SocialStory, Hindi */}
                        <div className="brands-col">
                          {BRANDS_MENU_DATA.filter(b => b.col === 1).map((item, idx) => (
                            <div 
                              key={idx} 
                              className="brand-entry-box"
                              onClick={() => handleBrandItemClick(item)}
                            >
                              <h3 className="brand-heading">{item.title}</h3>
                              <div className="brand-story-row">
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="brand-story-thumb" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = item.fallbackImage;
                                  }}
                                  loading="lazy"
                                />
                                <p className="brand-story-text">{item.storyTitle}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Column 2: AI Story, SMBStory, Tamil */}
                        <div className="brands-col">
                          {BRANDS_MENU_DATA.filter(b => b.col === 2).map((item, idx) => (
                            <div 
                              key={idx} 
                              className="brand-entry-box"
                              onClick={() => handleBrandItemClick(item)}
                            >
                              <h3 className="brand-heading">{item.title}</h3>
                              <div className="brand-story-row">
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="brand-story-thumb" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = item.fallbackImage;
                                  }}
                                  loading="lazy"
                                />
                                <p className="brand-story-text">{item.storyTitle}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Column 3: HerStory, EnterpriseStory */}
                        <div className="brands-col">
                          {BRANDS_MENU_DATA.filter(b => b.col === 3).map((item, idx) => (
                            <div 
                              key={idx} 
                              className="brand-entry-box"
                              onClick={() => handleBrandItemClick(item)}
                            >
                              <h3 className="brand-heading">{item.title}</h3>
                              <div className="brand-story-row">
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="brand-story-thumb" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = item.fallbackImage;
                                  }}
                                  loading="lazy"
                                />
                                <p className="brand-story-text">{item.storyTitle}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Other Categorized Child Dropdowns (CMS submenus, Custom, Resources, Reports) */}
                  {hasDropdown && isDropdownOpen && link.id !== 'brands' && link.dropdownColumns && link.dropdownColumns.length > 0 && (
                    <div 
                      className={`modern-mega-dropdown dropdown-align-${dropdownAlign} cols-${link.dropdownColumns.length} ${(link.dropdownColumns && link.dropdownColumns.length === 1) ? 'single-column' : ''}`}
                      style={{
                        width: 'max-content',
                        minWidth: link.dropdownColumns.length === 1 
                          ? '220px' 
                          : link.dropdownColumns.length === 2 
                            ? '450px' 
                            : '680px',
                        maxWidth: 'calc(100vw - 2rem)'
                      }}
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        setActiveDropdown(link.id);
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div 
                        className={`reports-cols-grid cols-${link.dropdownColumns.length} ${(link.dropdownColumns && link.dropdownColumns.length === 1) ? 'single-column-grid' : ''}`}
                        style={{
                          gridTemplateColumns: link.dropdownColumns.length === 1 
                            ? '1fr' 
                            : `repeat(${link.dropdownColumns.length}, minmax(180px, 230px))`,
                          gap: '1.5rem',
                          padding: '0'
                        }}
                      >
                        {link.dropdownColumns.map((col, cIdx) => (
                          <div key={cIdx} className="reports-column">
                            <div className="reports-col-title">{col.title}</div>
                            <ul className="reports-sub-list">
                              {col.items?.map((subItem, sIdx) => (
                                <li 
                                  key={sIdx}
                                  className="reports-sub-item"
                                >
                                  <a
                                    href={subItem.url || '#'}
                                    className="reports-sub-link"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSubItemClick(subItem);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      width: '100%',
                                      textDecoration: 'none',
                                      color: 'inherit'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span>{subItem.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="sub-item-chevron" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* "More" overflow dropdown for categories/desks beyond the first 5 */}
            {hasOverflow && (
              <div 
                className={`dropdown-container overflow-more-container ${isMoreDropdownOpen ? 'dropdown-active' : ''}`}
                onMouseEnter={() => handleMouseEnter('more', true)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`modern-cat-tab more-cat-tab ${isOverflowActive || isMoreDropdownOpen ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'more' ? null : 'more');
                  }}
                  aria-expanded={isMoreDropdownOpen}
                  aria-haspopup="true"
                  title="More desks and sections"
                >
                  <span>More</span>
                  <span className="cat-tab-chevron-wrap">
                    <ChevronDown 
                      size={17} 
                      className={`chevron-icon ${isMoreDropdownOpen ? 'rotated' : ''}`} 
                    />
                  </span>
                </button>

                {isMoreDropdownOpen && (
                  <div 
                    className="modern-mega-dropdown dropdown-align-center single-column more-dropdown-menu"
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                      setActiveDropdown('more');
                    }}
                    onMouseLeave={handleMouseLeave}
                    style={{ minWidth: '240px', maxWidth: '320px' }}
                  >
                    <div className="reports-cols-grid single-column-grid">
                      <div className="reports-column">
                        <div 
                          className="reports-col-title" 
                          style={{ 
                            fontSize: '0.78rem', 
                            letterSpacing: '0.04em', 
                            textTransform: 'uppercase', 
                            marginBottom: '0.5rem', 
                            opacity: 0.75 
                          }}
                        >
                          More Desks & Sections
                        </div>
                        <ul className="reports-sub-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                          {overflowNavLinks.map((overflowLink) => {
                            const isLinkActive = isNavActive(overflowLink);

                            const hasSubItems = overflowLink.dropdownColumns && overflowLink.dropdownColumns.length > 0;

                            return (
                              <li key={overflowLink._id || overflowLink.id || overflowLink.slug} className="reports-sub-item" style={{ marginBottom: '4px' }}>
                                <a
                                  href={overflowLink.url || '#'}
                                  className="reports-sub-link"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNavClick(overflowLink.id, false, overflowLink, e);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    textDecoration: 'none',
                                    color: isLinkActive ? 'var(--primary-color, #dc2626)' : 'inherit',
                                    fontWeight: isLinkActive ? 650 : 500,
                                    padding: '7px 10px',
                                    borderRadius: '6px',
                                    background: isLinkActive ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{overflowLink.label}</span>
                                    {overflowLink.isBadge && (
                                      <span className="nav-pulse-badge">
                                        <span className="nav-badge-dot" />
                                        <span>{overflowLink.badgeText || "2026"}</span>
                                      </span>
                                    )}
                                  </div>
                                  <ChevronRight size={15} className="sub-item-chevron" style={{ opacity: 0.5 }} />
                                </a>

                                {/* Nested sub-items if present */}
                                {hasSubItems && (
                                  <ul style={{ listStyle: 'none', paddingLeft: '12px', margin: '3px 0 6px 6px', borderLeft: '2px solid rgba(150, 150, 150, 0.2)' }}>
                                    {overflowLink.dropdownColumns.flatMap(c => c.items || []).map((subItem, subIdx) => (
                                      <li key={subIdx} style={{ margin: '2px 0' }}>
                                        <a
                                          href={subItem.url || '#'}
                                          className="reports-sub-link"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleSubItemClick(subItem);
                                          }}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '4px 8px',
                                            fontSize: '0.82rem',
                                            color: 'var(--text-secondary, #64748b)',
                                            textDecoration: 'none',
                                            borderRadius: '4px'
                                          }}
                                        >
                                          <span>{subItem.label}</span>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

      </div>
    </header>
  );
}
