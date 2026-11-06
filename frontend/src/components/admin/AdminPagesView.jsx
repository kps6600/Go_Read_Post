import AdminPageEditor from './AdminPageEditor';
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye,
  Layers, X, Filter, Check,
  ChevronDown, Sparkles,
  ArrowLeft
} from 'lucide-react';
import { PageService } from '../../services/pageService';
import './AdminPagesView.css';

export const identifyEditablePage = (page) => {
  const id = (page?.id || '').toLowerCase();
  const slug = (page?.slug || '').toLowerCase().replace(/^\/+/, '');
  const title = (page?.title || '').toLowerCase();

  if (id === 'home' || slug === '' || slug === 'home' || title.startsWith('home')) return 'home';
  if (id === 'category' || slug === 'categories' || slug === 'category' || title.includes('category')) return 'category';
  if (id === 'contact' || slug === 'contact' || slug === 'contact-us' || title.includes('contact')) return 'contact';
  if (id === 'about' || slug === 'about' || slug === 'about-us' || title.includes('about')) return 'about';
  if (id === 'page_advertise' || id === 'advertise' || slug === 'advertise' || slug === 'advertise-with-us' || title.includes('advertise')) return 'advertise';

  return null;
};

export const CANONICAL_TOPIC_PAGES = [];

export const CANONICAL_FRONTEND_PAGES = [
  // 1. Core Frontline Editorial Verticals & Desks
  // 1. Core Frontline Editorial Verticals & Desks
  { id: 'home', title: 'Homepage', slug: '', route: '/', status: 'published', order: 1, sectionsCount: 12 },
  { id: 'latest', title: 'Latest Articles', slug: 'latest', route: '/latest', status: 'published', order: 2, sectionsCount: 4 },
  { id: 'trending', title: 'Trending Stories', slug: 'trending', route: '/trending', status: 'published', order: 3, sectionsCount: 4 },
  { id: 'category', title: 'Category Page & Desks', slug: 'category', route: '/category', status: 'published', order: 4, sectionsCount: 2 },
  { id: 'startups', title: 'Startups & Capital Desk', slug: 'category/startups', route: '/category/startups', status: 'published', order: 5, sectionsCount: 2 },
  { id: 'technology', title: 'Technology & Cloud Desk', slug: 'category/technology', route: '/category/technology', status: 'published', order: 6, sectionsCount: 2 },
  { id: 'ai-story', title: 'AI & DeepTech (AI Story)', slug: 'category/ai-story', route: '/category/ai-story', status: 'published', order: 7, sectionsCount: 2 },
  { id: 'enterprise', title: 'Enterprise & IT Beat', slug: 'category/enterprise', route: '/category/enterprise', status: 'published', order: 8, sectionsCount: 2 },
  { id: 'fintech', title: 'FinTech & Capital Beat', slug: 'category/fintech', route: '/category/fintech', status: 'published', order: 9, sectionsCount: 2 },
  { id: 'smbstory', title: 'SMBStory (MSME, Retail & D2C)', slug: 'category/smbstory', route: '/category/smbstory', status: 'published', order: 10, sectionsCount: 2 },
  { id: 'her-story', title: 'HerStory (Women Leaders)', slug: 'category/her-story', route: '/category/her-story', status: 'published', order: 11, sectionsCount: 2 },
  { id: 'social-story', title: 'SocialStory (Impact & Climate)', slug: 'category/social-story', route: '/category/social-story', status: 'published', order: 12, sectionsCount: 2 },
  { id: 'leadership', title: 'Leadership & Founder Playbooks', slug: 'category/leadership', route: '/category/leadership', status: 'published', order: 13, sectionsCount: 2 },

  // 2. Discoverability & Multi-Media Dispatches
  { id: 'videos', title: 'Videos (YS TV)', slug: 'videos', route: '/videos', status: 'published', order: 14, sectionsCount: 5 },
  { id: 'hindi', title: 'YS Hindi', slug: 'hindi', route: '/hindi', status: 'published', order: 15, sectionsCount: 2 },

  // 4. Company, Trust & Information Pages
  { id: 'about', title: 'About Us', slug: 'about', route: '/about', status: 'published', order: 16, sectionsCount: 3 },
  { id: 'contact', title: 'Contact Us', slug: 'contact', route: '/contact', status: 'published', order: 17, sectionsCount: 4 },
  { id: 'advertise', title: 'Advertise With Us', slug: 'advertise', route: '/advertise', status: 'published', order: 18, sectionsCount: 3 },
  { id: 'pitch', title: 'Pitch Story', slug: 'pitch', route: '/pitch', status: 'published', order: 19, sectionsCount: 2 }
];

export default function AdminPagesView({ onNavigate, onShowToast, filterCategory }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('list'); // 'list' | 'preview' | 'edit'
  const [selectedPage, setSelectedPage] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    }
    if (filterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [filterDropdownOpen]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await PageService.getPages();
      const rawList = (Array.isArray(data) ? data : []).filter(p => {
        const s = (p.slug || '').toLowerCase();
        const id = (p.id || p._id || '').toLowerCase();
        return !s.startsWith('topic/') && !id.startsWith('topic_') && p.pageType !== 'topic';
      });

      // Merge canonical frontend pages with MongoDB data
      const mergedPages = CANONICAL_FRONTEND_PAGES.map((canon) => {
        const found = rawList.find(p => {
          const pId = (p.id || p._id || '').toLowerCase();
          const pSlug = (p.slug || '').toLowerCase().replace(/^\/+/, '');
          const canonSlug = (canon.slug || '').toLowerCase().replace(/^\/+/, '');
          return pId === canon.id || (canonSlug && pSlug === canonSlug);
        });

        if (found) {
          return {
            ...canon,
            ...found,
            id: found.id || found._id || canon.id,
            title: found.title || canon.title,
            slug: found.slug !== undefined ? found.slug : canon.slug,
            route: canon.route,
            status: found.status || canon.status,
            sections: found.sections || [],
            sectionsCount: (found.sections && found.sections.length > 0) ? found.sections.length : canon.sectionsCount
          };
        }
        return {
          ...canon,
          sections: canon.sections || [],
          sectionsCount: canon.sectionsCount
        };
      });

      // Include any user-created custom dynamic pages from backend
      rawList.forEach(p => {
        const pId = (p.id || p._id || '').toLowerCase();
        const pSlug = (p.slug || '').toLowerCase().replace(/^\/+/, '');
        const alreadyIncluded = mergedPages.some(m => {
          const mId = (m.id || '').toLowerCase();
          const mSlug = (m.slug || '').toLowerCase().replace(/^\/+/, '');
          return mId === pId || (pSlug && mSlug === pSlug);
        });

        if (!alreadyIncluded) {
          mergedPages.push({
            id: p.id || p._id,
            title: p.title || 'Custom Landing Page',
            slug: p.slug || '',
            route: `/${p.slug || ''}`,
            status: p.status || 'published',
            sections: p.sections || [],
            sectionsCount: p.sections?.length || 0,
            isCustom: true
          });
        }
      });

      setPages(mergedPages);
    } catch (err) {
      console.error('Failed to load pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const handleTogglePublish = async (page) => {
    setActionLoadingId(page.id);
    try {
      const isLive = page.status === 'published' || page.status === 'active';
      let updated;
      if (isLive) {
        updated = await PageService.unpublishPage(page.id);
        onShowToast?.(`"${page.title}" moved to draft.`);
      } else {
        updated = await PageService.publishPage(page.id);
        onShowToast?.(`"${page.title}" is now live!`);
      }
      setPages(prev => prev.map(p =>
        p.id === page.id ? (updated || { ...p, status: isLive ? 'draft' : 'published' }) : p
      ));
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (page) => {
    if (page.id === 'home' || page.slug === '' || page.slug === '/') { 
      onShowToast?.('Primary Homepage cannot be deleted.'); 
      return; 
    }
    setDeleteConfirmId(null);
    setActionLoadingId(page.id);
    try {
      await PageService.deletePage(page.id);
      setPages(prev => prev.filter(p => p.id !== page.id));
      onShowToast?.(`"${page.title}" deleted.`);
    } catch (err) {
      onShowToast?.(err.message || 'Failed to delete');
    } finally {
      setActionLoadingId(null);
    }
  };

    const getPageGroup = (p) => {
    if ((p.slug && p.slug.startsWith('category/')) || p.id === 'category' || p.slug === 'category' || p.slug === 'categories') return 'category';
    if (['about', 'contact', 'advertise', 'pitch'].includes(p.id) || ['about', 'contact', 'advertise', 'pitch'].includes(p.slug)) return 'company';
    return 'core';
  };
  const categoryPagesCount = pages.filter(p => getPageGroup(p) === 'category').length;
  const corePagesCount = pages.filter(p => getPageGroup(p) === 'core').length;
  const companyPagesCount = pages.filter(p => getPageGroup(p) === 'company').length;

  const filteredPages = pages.filter((page) => {
    const q = searchQuery.toLowerCase().trim();
    const isLive = page.status === 'published' || page.status === 'active';
    const matchSearch = !q || page.title?.toLowerCase().includes(q) || page.slug?.toLowerCase().includes(q) || page.description?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && isLive) ||
      (statusFilter === 'draft' && !isLive);
    const matchType = typeFilter === 'all' || getPageGroup(page) === typeFilter;
    const matchCategory = !filterCategory || page.category === filterCategory;
    return matchSearch && matchStatus && matchType && matchCategory;
  });

  const publishedCount = pages.filter(p => p.status === 'published' || p.status === 'active').length;
  const draftCount = pages.length - publishedCount;
  const totalSections = pages.reduce((acc, p) => acc + ((p.sections && p.sections.length > 0) ? p.sections.length : (p.sectionsCount || 0)), 0);

  // Delete confirm modal
  const DeleteModal = ({ page }) => (
    <div className="apv-delete-overlay" onClick={() => setDeleteConfirmId(null)}>
      <div className="apv-delete-modal" onClick={e => e.stopPropagation()}>
        <h4>Delete Page?</h4>
        <p>This will permanently delete <strong>"{page.title}"</strong> and all its sections. This cannot be undone.</p>
        <div className="apv-delete-actions">
          <button className="apv-btn-ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
          <button
            className="apv-btn-danger"
            onClick={() => handleDelete(page)}
            disabled={actionLoadingId === page.id}
          >
            <Trash2 size={14} />
            {actionLoadingId === page.id ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );

      const handleEditPage = (page) => {
    if (!page) return;
    const isHome = page.slug === '' || page.slug === '/' || page.id === 'home' || page.id === 'homepage' || (page.title && page.title.toLowerCase().startsWith('home'));
    let targetUrl;
        if (isHome) {
      targetUrl = '/admin/pages/home/edit';
    } else if (page.slug && page.slug.startsWith('category/')) {
      const catSlug = page.slug.replace('category/', '');
      targetUrl = `/admin/pages/${page.id || catSlug}/edit`;
    } else if (page.id === 'category' || page.slug === 'category' || page.slug === 'categories') {
      targetUrl = '/admin/pages/category/edit';
    } else if (page.slug && page.slug.startsWith('topic/')) {
      const topicSlug = page.slug.replace('topic/', '');
      targetUrl = `/admin/topic/${topicSlug}`;
    } else if (page.pageType === 'topic' || (page.id && page.id.startsWith('topic_'))) {
      const topicSlug = page.slug ? page.slug.replace('topic/', '') : page.id.replace('topic_', '');
      targetUrl = `/admin/topic/${topicSlug}`;
    } else {
      const targetId = page.slug ? page.slug.replace(/^\/+/, '') : (page.id || page._id);
      targetUrl = `/admin/pages/${targetId}/edit`;
    }
    if (onNavigate) {
      onNavigate(targetUrl);
    } else {
      window.history.pushState(null, '', targetUrl);
      setSelectedPage(page);
      setActiveMode('edit');
    }
  };

  if (activeMode === 'preview' && selectedPage) {
    const previewUrl = selectedPage.route || (selectedPage.slug ? `/${selectedPage.slug.replace(/^\/+/, '')}` : '/');
    return (
      <div className="admin-page-container">
        {/* Header toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => { setActiveMode('list'); setSelectedPage(null); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.05rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedPage.title}
              </span>
              <code style={{
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                background: '#f1f5f9',
                color: '#475569',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 600
              }}>
                {previewUrl}
              </code>
                        </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleEditPage(selectedPage)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: 'var(--brand-primary, #dc2626)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Edit2 size={13} />
              <span>Edit Page</span>
            </button>
          </div>
        </div>

        {/* Embedded Iframe right in the same space */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          padding: 0,
          minHeight: '800px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <iframe
            title={`Live view of ${selectedPage.title}`}
            src={previewUrl}
            style={{
              width: '100%',
              height: '820px',
              border: 'none',
              background: '#ffffff'
            }}
          />
        </div>
      </div>
    );
  }

  if (activeMode === 'edit' && selectedPage) {
    const editPageId = selectedPage.id || selectedPage._id || selectedPage.slug || 'home';
    return (
      <div className="admin-page-container">

        {/* Page Editor rendered right in the same space */}
        <AdminPageEditor
          pageId={editPageId}
          onNavigate={(target) => {
            if (target === '/admin/pages' || target === 'pages' || target === '/admin/pages/') {
              setActiveMode('list');
              setSelectedPage(null);
              window.history.pushState(null, '', '/admin/pages');
            } else {
              onNavigate?.(target);
            }
          }}
          onShowToast={onShowToast}
        />
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Delete Confirm Modal */}
      {deleteConfirmId && (() => {
        const page = pages.find(p => p.id === deleteConfirmId);
        return page ? <DeleteModal page={page} /> : null;
      })()}

      {/* ── Summary Stats Strip (Responsive Full Width Grid) ── */}
      <div className="apv-kpi-grid">
        {/* Total Pages */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`apv-kpi-card ${statusFilter === 'all' ? 'active' : ''}`}
          title="Filter by all pages"
        >
          <div className="apv-kpi-val" style={{ color: '#0f172a' }}>{pages.length}</div>
          <div className="apv-kpi-lbl">Total Pages</div>
        </div>

        {/* Published */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'published' ? 'all' : 'published')}
          className={`apv-kpi-card ${statusFilter === 'published' ? 'active' : ''}`}
          title="Filter by published pages"
        >
          <div className="apv-kpi-val" style={{ color: '#059669' }}>{publishedCount}</div>
          <div className="apv-kpi-lbl">Published / Live</div>
        </div>

        {/* Drafts */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'draft' ? 'all' : 'draft')}
          className={`apv-kpi-card ${statusFilter === 'draft' ? 'active' : ''}`}
          title="Filter by draft pages"
        >
          <div className="apv-kpi-val" style={{ color: '#dc2626' }}>{draftCount}</div>
          <div className="apv-kpi-lbl">Drafts</div>
        </div>

        {/* Total Sections */}
        <div 
          className="apv-kpi-card"
          title="Total configured sections across all pages"
        >
          <div className="apv-kpi-val" style={{ color: '#2563eb' }}>{totalSections}</div>
          <div className="apv-kpi-lbl">Total Sections</div>
        </div>
      </div>

      {/* ── Search, Filters & Controls Bar ── */}
      <div className="apv-toolbar-wrap">
        {/* Search Box */}
        <div className="apv-search-box">
          <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            type="text"
            className="apv-search-input-field"
            placeholder="Search by title, description, or slug…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Actions Row (Filter Dropdown & Create Page Button side-by-side) */}
        <div className="apv-toolbar-actions">
          {/* Filter Dropdown */}
          <div className="apv-filter-wrap" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterDropdownOpen(prev => !prev)}
              className={`apv-filter-dropdown-btn ${statusFilter !== 'all' ? 'active' : ''}`}
            >
              <Filter size={15} />
              <span>
                {statusFilter === 'all'
                  ? 'All Status'
                  : statusFilter === 'published'
                  ? 'Live Only'
                  : 'Draft Only'}
              </span>
              <span 
                className="apv-filter-count-chip"
                style={{
                  background: statusFilter !== 'all' ? '#dc2626' : '#f1f5f9',
                  color: statusFilter !== 'all' ? '#ffffff' : '#64748b'
                }}
              >
                {filteredPages.length}
              </span>
              <ChevronDown size={13} style={{ transform: filterDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
            </button>

            {filterDropdownOpen && (
              <div className="apv-filter-popover-menu">
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>
                  Filter Status
                </div>
                {[
                  { key: 'all', label: 'All Pages', count: pages.length },
                  { key: 'published', label: 'Published / Live', count: publishedCount, dot: '#10b981' },
                  { key: 'draft', label: 'Draft', count: draftCount, dot: '#f59e0b' }
                ].map(opt => {
                  const isSelected = statusFilter === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setStatusFilter(opt.key); setFilterDropdownOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 10px',
                        background: isSelected ? '#f8fafc' : 'transparent',
                        border: 'none',
                        borderRadius: '7px',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#0f172a' : '#475569',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {opt.dot ? (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.dot }} />
                        ) : (
                          <span style={{ width: '8px' }} />
                        )}
                        <span>{opt.label}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{opt.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* + Create Page Button */}
          <button
            type="button"
            className="apv-create-page-btn"
            onClick={() => onNavigate?.('/admin/pages/create')}
          >
            <Plus size={16} />
            <span>Create Page</span>
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <div className="apv-loading-spinner" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Loading pages…</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
              <Sparkles size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>No pages found</h4>
            <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : 'No pages match the active filters.'}
            </p>
            {!searchQuery && (
              <button 
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                style={{ padding: '0.55rem 1.15rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="apv-table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '820px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'center', width: '65px' }}>
                    S.No.
                  </th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', width: '35%' }}>
                    Page Title
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', width: '18%' }}>
                    Route / Slug
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'center', width: '12%' }}>
                    Sections
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'center', width: '14%' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'right', width: '18%' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, index) => {
                  const isLive = page.status === 'published' || page.status === 'active';
                  const sections = (page.sections && page.sections.length > 0) ? page.sections.length : (page.sectionsCount || 0);
                  const isActing = actionLoadingId === page.id;
                  const pageType = identifyEditablePage(page);
                  const targetSlug = page.slug || page.id || '';
                  const previewUrl = page.route || (page.slug ? `/${page.slug.replace(/^\/+/, '')}` : '/');

                  return (
                    <tr 
                      key={page.id || page._id || targetSlug} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontSize: '0.86rem', fontWeight: 700, color: '#64748b' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                          {(page.title || '').replace(/\s*-\s*Live Portal/i, '')}
                        </span>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <code style={{
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 600
                        }}>
                          {previewUrl}
                        </code>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '4px 9px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700
                        }}>
                          <Layers size={13} style={{ color: '#64748b' }} />
                          {sections}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(page)}
                          disabled={isActing}
                          title={isLive ? 'Click to unpublish' : 'Click to publish'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: isLive ? '1px solid #a7f3d0' : '1px solid #fed7aa',
                            background: isLive ? '#ecfdf5' : '#fffbeb',
                            color: isLive ? '#065f46' : '#9a3412',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: isLive ? '#10b981' : '#f59e0b'
                          }} />
                          {isActing ? '…' : isLive ? 'Live' : 'Draft'}
                        </button>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPage(page);
                              setActiveMode('preview');
                            }}
                            title={`Preview ${page.title} right here`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#64748b',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditPage(page)}
                            title="Edit page & sections right here"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: 'var(--brand-primary, #dc2626)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer row count */}
        {!loading && filteredPages.length > 0 && (
          <div style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#f8fafc'
          }}>
            <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
              Showing <strong>{filteredPages.length}</strong> of <strong>{pages.length}</strong> pages
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
