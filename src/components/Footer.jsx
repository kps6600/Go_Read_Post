import React, { useState, useEffect } from 'react';
import { 
  Send, Globe, ArrowUp, ArrowUpRight, ShieldCheck, 
  ExternalLink, Rss, MessageSquare, Radio
} from 'lucide-react';
import { FooterService } from '../services/footerService';

const renderSocialIcon = (platform, label = '') => {
  const p = (platform || label || '').toLowerCase();
  if (p.includes('twitter') || p === 'x') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    );
  }
  if (p.includes('youtube')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (p.includes('instagram')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (p.includes('whatsapp')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
      </svg>
    );
  }
  if (p.includes('telegram')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.942z"/>
      </svg>
    );
  }
  if (p.includes('rss') || p.includes('feed')) {
    return <Rss size={14} />;
  }
  if (p.includes('discord')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    );
  }
  if (p.includes('threads')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.87 0 5.512-.999 7.61-2.677l-1.636-2.03C16.326 20.61 14.26 21.3 12 21.3c-5.128 0-9.3-4.172-9.3-9.3S6.872 2.7 12 2.7s9.3 4.172 9.3 9.3c0 2.13-.67 4.1-1.84 5.7l1.78 1.48C22.84 17.07 23.7 14.65 23.7 12c0-6.627-5.373-12-11.7-12zm.23 7.2c-2.65 0-4.8 2.15-4.8 4.8s2.15 4.8 4.8 4.8c1.39 0 2.65-.59 3.53-1.54l-1.68-1.55c-.48.55-1.16.89-1.85.89-1.44 0-2.6-1.16-2.6-2.6s1.16-2.6 2.6-2.6c1.15 0 2.13.75 2.48 1.8h2.24c-.42-2.27-2.37-3.99-4.72-3.99z"/>
      </svg>
    );
  }
  if (p.includes('github')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    );
  }
  return <Globe size={14} />;
};

export default function Footer({ onCategoryClick, onOpenPitchModal, siteSettings }) {
  const [footerData, setFooterData] = useState({
    aboutText: 'GoReadPost is your trusted source for quality blogs, tips, and insights across technology, business, education, health and lifestyle.',
    copyrightText: '© 2025 GoReadPost. All rights reserved.',
    brandCtaText: 'Pitch Your Story',
    brandCtaLink: '/pitch',
    trustBadgeText: '100% Independent Editorial Integrity',
    liveDeskText: 'LIVE DESK',
    liveDeskLocations: 'Bengaluru • New Delhi • San Francisco • Singapore',
    bottomCommunityTag: 'Built with precision for the global builder community',
    bottomEditionText: 'Global Edition (English)',
    socialLinks: {
      facebook: 'https://facebook.com/goreadpost',
      twitter: 'https://twitter.com/goreadpost',
      youtube: 'https://youtube.com/@goreadpost',
      linkedin: 'https://linkedin.com/company/goreadpost',
      instagram: 'https://instagram.com/goreadpost'
    },
    directChannels: {
      enabled: false,
      title: 'DIRECT CHANNELS',
      description: '',
      items: []
    },
    columns: [
      {
        title: 'Quick Links',
        links: [
          { label: 'Home', url: '/', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'Latest', url: '/latest', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'Categories', url: '/categories', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'Topics', url: '/topics', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'Trending', url: '/trending', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'About Us', url: '/about', badge: '', badgeColor: '', openInNewTab: false }
        ]
      },
      {
        title: 'Legal',
        links: [
          { label: 'Editorial Policy', url: '/editorial-policy', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'Privacy Policy', url: '/privacy-policy', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'Terms & Conditions', url: '/terms', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'Disclaimer', url: '/disclaimer', badge: '', badgeColor: '', openInNewTab: false },
          { label: 'Contact Us', url: '/contact', badge: '', badgeColor: '', openInNewTab: false }
        ]
      },
      {
        title: 'RSS Feed',
        isRss: true,
        links: [
          { label: 'Subscribe to RSS Feed', url: '/rss.xml', badge: 'Live', badgeColor: '#ef4444', openInNewTab: true }
        ]
      }
    ]
  });

  const loadFooterData = () => {
    FooterService.getFooter().then(data => {
      if (data) {
        setFooterData(prev => ({
          ...prev,
          ...data,
          socialLinks: Array.isArray(data.socialLinks)
            ? data.socialLinks
            : (typeof data.socialLinks === 'object' && data.socialLinks !== null)
              ? { ...prev.socialLinks, ...data.socialLinks }
              : prev.socialLinks,
          directChannels: {
            ...prev.directChannels,
            ...(data.directChannels || {}),
            items: Array.isArray(data.directChannels?.items) && data.directChannels.items.length > 0
              ? data.directChannels.items
              : prev.directChannels.items
          },
          columns: Array.isArray(data.columns) && data.columns.length > 0 ? data.columns : prev.columns
        }));
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadFooterData();

    // Listen to real-time footer updates from the CMS
    const handleFooterChange = (e) => {
      if (e.detail) {
        setFooterData(prev => ({
          ...prev,
          ...e.detail,
          socialLinks: Array.isArray(e.detail.socialLinks)
            ? e.detail.socialLinks
            : (typeof e.detail.socialLinks === 'object' && e.detail.socialLinks !== null)
              ? { ...prev.socialLinks, ...e.detail.socialLinks }
              : prev.socialLinks,
          directChannels: {
            ...prev.directChannels,
            ...(e.detail.directChannels || {})
          },
          columns: Array.isArray(e.detail.columns) && e.detail.columns.length > 0
            ? e.detail.columns
            : prev.columns
        }));
      } else {
        loadFooterData();
      }
    };

    window.addEventListener('footer:change', handleFooterChange);
    return () => window.removeEventListener('footer:change', handleFooterChange);
  }, []);

  const [showFloatingTop, setShowFloatingTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowFloatingTop(true);
      } else {
        setShowFloatingTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e, lnk) => {
    if (!lnk || !lnk.url || lnk.url.startsWith('#')) {
      e.preventDefault();
      scrollToTop();
      return;
    }
    if (lnk.openInNewTab || lnk.url.startsWith('http://') || lnk.url.startsWith('https://')) {
      // Allow external link to navigate or open in new tab
      return;
    }
    e.preventDefault();
    if (lnk.url.startsWith('/category/')) {
      const cat = lnk.url.replace('/category/', '').split('/')[0];
      if (onCategoryClick) onCategoryClick(cat);
    }
    window.history.pushState(null, '', lnk.url);
    window.dispatchEvent(new Event('popstate'));
    scrollToTop();
  };

  const handleCtaClick = () => {
    const ctaLink = footerData.brandCtaLink || '/pitch';
    if (ctaLink === '/pitch' && onOpenPitchModal) {
      onOpenPitchModal();
      return;
    }
    if (ctaLink.startsWith('http://') || ctaLink.startsWith('https://')) {
      window.open(ctaLink, '_blank', 'noopener,noreferrer');
      return;
    }
    window.history.pushState(null, '', ctaLink);
    window.dispatchEvent(new Event('popstate'));
    scrollToTop();
  };

  const visibleColumns = (footerData.columns || []).filter(c => !c.title?.toUpperCase().includes('DIRECT CHANNELS'));
  const hasChannels = false;
  const colCount = visibleColumns.length;
  const totalCols = 1 + (colCount > 0 ? colCount : 3);

  const liveLocations = footerData.liveDeskLocations || siteSettings?.liveDeskLocations || 'Bengaluru • New Delhi • San Francisco • Singapore';
  const liveDeskText = footerData.liveDeskText || 'LIVE DESK';

  const socialList = (() => {
    if (Array.isArray(footerData.socialLinks)) {
      return footerData.socialLinks
        .filter(s => s && s.url && typeof s.url === 'string' && s.url.trim() !== '')
        .map(s => ({
          platform: s.platform || 'link',
          label: s.label || s.platform || 'Social',
          url: s.url
        }));
    }
    if (typeof footerData.socialLinks === 'object' && footerData.socialLinks !== null) {
      return Object.entries({ ...footerData.socialLinks, ...(siteSettings?.socialLinks || {}) })
        .filter(([_, val]) => {
          if (!val) return false;
          if (typeof val === 'string') return val.trim() !== '';
          if (typeof val === 'object' && val.url && typeof val.url === 'string') return val.url.trim() !== '';
          return false;
        })
        .map(([platform, val]) => ({
          platform,
          label: platform.charAt(0).toUpperCase() + platform.slice(1),
          url: typeof val === 'string' ? val : (val.url || '#')
        }));
    }
    return [];
  })();

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        
        {/* Top Utility Bar: Live Editorial Desk & Social Channels */}
        <div className="footer-top-bar">
          <div className="footer-live-status">
            <span className="live-pulse-dot" />
            <span className="live-status-text">
              <strong>{liveDeskText}</strong> • {liveLocations}
            </span>
          </div>

          <div className="footer-top-actions">
            {/* Social Connect Icons */}
            <div className="footer-social-icons">
              {socialList.map((item, idx) => (
                <a 
                  key={idx}
                  href={item.url} 
                  target={item.url?.startsWith('http') ? "_blank" : undefined}
                  rel={item.url?.startsWith('http') ? "noopener noreferrer" : undefined}
                  className="footer-social-btn" 
                  title={item.label || item.platform}
                  aria-label={item.label || item.platform}
                >
                  {renderSocialIcon(item.platform, item.label)}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div 
          className="footer-grid"
          style={{ '--footer-total-cols': totalCols }}
        >
          
          {/* Brand & Mission Column */}
          <div className="footer-brand-col">
            <div 
              className="footer-brand-logo" 
              onClick={() => {
                window.history.pushState(null, '', '/');
                window.dispatchEvent(new Event('popstate'));
                scrollToTop();
              }} 
              role="button" 
              tabIndex={0}
            >
              {siteSettings?.logo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={siteSettings.logo} 
                    alt={siteSettings?.siteTitle || siteSettings?.siteName || 'Brand Logo'} 
                    style={{ maxHeight: '38px', maxWidth: '140px', objectFit: 'contain' }}
                    referrerPolicy="no-referrer"
                  />
                  {(siteSettings?.siteName || siteSettings?.brandPrefix) && (
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#fff' }}>
                      {siteSettings?.siteName || siteSettings?.brandPrefix}
                      {siteSettings?.brandSuffix ? <span className="dot">{siteSettings.brandSuffix}</span> : null}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
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
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
                    flexShrink: 0
                  }}>
                    {siteSettings?.brandEmblem || 'G'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.15 }}>
                      {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em', marginTop: '1px' }}>
                      Read • Learn • Grow
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="footer-mission-text">
              {footerData.aboutText || siteSettings?.footerDescription}
            </p>

            <div className="footer-trust-badge">
              <ShieldCheck size={16} className="trust-badge-icon" />
              <span>{footerData.trustBadgeText || '100% Independent Editorial Integrity'}</span>
            </div>
          </div>

          {/* Dynamic Navigation Columns */}
          {visibleColumns.map((col, idx) => (
            <div key={idx} className={`footer-col footer-col-cat-${(idx % 4) + 1}`}>
              <h4 className="footer-col-heading">
                <span className={`footer-col-indicator cat-indicator-${(idx % 4) + 1}`} />
                <span>{col.title}</span>
              </h4>
              <ul className="footer-links">
                {(col.links || []).map((lnk, lIdx) => (
                  <li key={lIdx}>
                    <a 
                      href={lnk.url || '#top'} 
                      onClick={(e) => handleLinkClick(e, lnk)}
                      target={lnk.openInNewTab ? '_blank' : undefined}
                      rel={lnk.openInNewTab ? 'noopener noreferrer' : undefined}
                    >
                      <span className="footer-link-label">{lnk.label}</span>
                      {lnk.badge ? (
                        <span 
                          className="footer-pill-badge" 
                          style={{ 
                            background: lnk.badgeColor || 'var(--brand-primary, #e11d48)', 
                            color: '#fff' 
                          }}
                        >
                          {lnk.badge}
                        </span>
                      ) : (
                        <ArrowUpRight size={13} className="footer-link-arrow" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright-box">
            <span>{footerData.copyrightText || siteSettings?.copyrightText}</span>
          </div>

          <div className="footer-bottom-meta">
            <span className="footer-community-tag">
              {footerData.bottomCommunityTag || 'Built with precision for the global builder community'}
            </span>
            <span className="footer-dot-sep">•</span>
            <div className="footer-edition-selector">
              <Globe size={13} className="globe-icon" />
              <span>{footerData.bottomEditionText || 'Global Edition (English)'}</span>
            </div>
          </div>
        </div>

      </div>
      
      {/* Floating Back To Top Button */}
      <button 
        type="button" 
        className={`floating-back-to-top-btn ${showFloatingTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        title="Back to top"
        aria-label="Back to top"
      >
        <span>Back to Top</span>
        <ArrowUp size={15} className="top-arrow-icon" />
      </button>
    </footer>
  );
}
