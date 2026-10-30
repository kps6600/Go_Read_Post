import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye,
  Layers, X, Filter, Check,
  ChevronDown, Sparkles,
  Laptop, Tablet, Smartphone, ExternalLink
} from 'lucide-react';
import { PageService } from '../../services/pageService';

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

export const CANONICAL_FRONTEND_PAGES = [
  // 1. Core Platform Pages
  { id: 'home', title: 'Homepage', slug: '', route: '/', status: 'published', order: 1, sectionsCount: 12 },
  { id: 'latest', title: 'Latest Articles', slug: 'latest', route: '/latest', status: 'published', order: 2, sectionsCount: 4 },
  { id: 'trending', title: 'Trending Stories', slug: 'trending', route: '/trending', status: 'published', order: 3, sectionsCount: 4 },
  { id: 'category', title: 'Category Page & Desks', slug: 'categories', route: '/categories', status: 'published', order: 4, sectionsCount: 2 },
  { id: 'topics', title: 'Topics & Tags Directory', slug: 'topics', route: '/topics', status: 'published', order: 5, sectionsCount: 3 },
  { id: 'videos', title: 'Videos (YS TV)', slug: 'videos', route: '/videos', status: 'published', order: 6, sectionsCount: 5 },
  { id: 'newsletter', title: 'Newsletter Dispatches', slug: 'newsletter', route: '/newsletter', status: 'published', order: 7, sectionsCount: 3 },
  { id: 'search', title: 'Search & Archive Discovery', slug: 'search', route: '/search', status: 'published', order: 8, sectionsCount: 2 },

  // 2. Specialty Hubs & Curated Brands
  { id: 'ai-story', title: 'AI & DeepTech (AI Story)', slug: 'ai-story', route: '/ai-story', status: 'published', order: 9, sectionsCount: 3 },
  { id: 'her-story', title: 'HerStory', slug: 'her-story', route: '/her-story', status: 'published', order: 10, sectionsCount: 3 },
  { id: 'social-story', title: 'SocialStory', slug: 'social-story', route: '/social-story', status: 'published', order: 11, sectionsCount: 3 },
  { id: 'smbstory', title: 'SMBStory', slug: 'smbstory', route: '/smbstory', status: 'published', order: 12, sectionsCount: 3 },
  { id: 'enterprise', title: 'Enterprise Story', slug: 'enterprise', route: '/enterprise', status: 'published', order: 13, sectionsCount: 3 },
  { id: 'founder-first', title: 'Founder First Playbooks', slug: 'founder-first', route: '/founder-first', status: 'published', order: 14, sectionsCount: 2 },
  { id: 'hindi', title: 'YS Hindi', slug: 'hindi', route: '/hindi', status: 'published', order: 15, sectionsCount: 2 },
  { id: 'techsparks', title: 'TechSparks Summit', slug: 'techsparks', route: '/techsparks', status: 'published', order: 16, sectionsCount: 2 },

  // 3. Company, Trust & Information Pages
  { id: 'about', title: 'About Us', slug: 'about', route: '/about', status: 'published', order: 17, sectionsCount: 3 },
  { id: 'contact', title: 'Contact Us', slug: 'contact', route: '/contact', status: 'published', order: 18, sectionsCount: 4 },
  { id: 'advertise', title: 'Advertise With Us', slug: 'advertise', route: '/advertise', status: 'published', order: 19, sectionsCount: 3 },
  { id: 'editorial-team', title: 'Editorial Team & Masthead', slug: 'editorial-team', route: '/editorial-team', status: 'published', order: 20, sectionsCount: 3 },
  { id: 'careers', title: 'Careers', slug: 'careers', route: '/careers', status: 'published', order: 21, sectionsCount: 2 },
  { id: 'pitch', title: 'Pitch Story', slug: 'pitch', route: '/pitch', status: 'published', order: 22, sectionsCount: 2 },
  { id: 'privacy', title: 'Privacy Policy', slug: 'privacy', route: '/privacy', status: 'published', order: 23, sectionsCount: 1 },
  { id: 'terms', title: 'Terms of Service', slug: 'terms', route: '/terms', status: 'published', order: 24, sectionsCount: 1 },
  { id: 'disclaimer', title: 'Disclaimer', slug: 'disclaimer', route: '/disclaimer', status: 'published', order: 25, sectionsCount: 1 }
];

export default function AdminPagesView({ onNavigate, onShowToast, filterCategory }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
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
      const rawList = Array.isArray(data) ? data : [];

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

  const filteredPages = pages.filter((page) => {
    const q = searchQuery.toLowerCase().trim();
    const isLive = page.status === 'published' || page.status === 'active';
    const matchSearch = !q || page.title?.toLowerCase().includes(q) || page.slug?.toLowerCase().includes(q) || page.description?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && isLive) ||
      (statusFilter === 'draft' && !isLive);
    const matchCategory = !filterCategory || page.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
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

  return (
    <div className="admin-page-container">

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (() => {
        const page = pages.find(p => p.id === deleteConfirmId);
        return page ? <DeleteModal page={page} /> : null;
      })()}

      {/* ── Summary Stats Strip (Responsive Full Width Grid) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Total Pages */}
        <div 
          onClick={() => setStatusFilter('all')}
          style={{ 
            background: '#ffffff', 
            padding: '1rem 1.25rem', 
            borderRadius: '12px', 
            border: statusFilter === 'all' ? '1.5px solid #0f172a' : '1px solid #e2e8f0', 
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
          title="Filter by all pages"
        >
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{pages.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Total Pages</div>
        </div>

        {/* Published */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'published' ? 'all' : 'published')}
          style={{ 
            background: '#ffffff', 
            padding: '1rem 1.25rem', 
            borderRadius: '12px', 
            border: statusFilter === 'published' ? '1.5px solid #059669' : '1px solid #e2e8f0', 
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
          title="Filter by published pages"
        >
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{publishedCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Published / Live</div>
        </div>

        {/* Drafts */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'draft' ? 'all' : 'draft')}
          style={{ 
            background: '#ffffff', 
            padding: '1rem 1.25rem', 
            borderRadius: '12px', 
            border: statusFilter === 'draft' ? '1.5px solid #dc2626' : '1px solid #e2e8f0', 
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
          title="Filter by draft pages"
        >
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{draftCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Drafts</div>
        </div>

        {/* Total Sections */}
        <div 
          style={{ 
            background: '#ffffff', 
            padding: '1rem 1.25rem', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
          title="Total configured sections across all pages"
        >
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{totalSections}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Total Sections</div>
        </div>
      </div>

      {/* ── Search, Filters & Controls Bar ── */}
      <div style={{
        background: '#ffffff',
        padding: '0.85rem 1.15rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        marginBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          padding: '0.55rem 0.95rem',
          borderRadius: '9px',
          border: '1px solid #e2e8f0',
          flex: 1,
          minWidth: '240px'
        }}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by title, description, or slug…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.88rem',
              color: '#0f172a',
              width: '100%',
              fontWeight: 500
            }}
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

        {/* Filter Dropdown */}
        <div style={{ position: 'relative' }} ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterDropdownOpen(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1rem',
              background: statusFilter !== 'all' ? '#fff1f2' : '#ffffff',
              border: statusFilter !== 'all' ? '1px solid #fecaca' : '1px solid #e2e8f0',
              borderRadius: '9px',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: statusFilter !== 'all' ? '#dc2626' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Filter size={15} />
            <span>
              {statusFilter === 'all'
                ? 'All Status'
                : statusFilter === 'published'
                ? 'Live Only'
                : 'Draft Only'}
            </span>
            <span style={{
              background: statusFilter !== 'all' ? '#dc2626' : '#f1f5f9',
              color: statusFilter !== 'all' ? '#ffffff' : '#64748b',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '0.74rem',
              fontWeight: 700
            }}>
              {filteredPages.length}
            </span>
            <ChevronDown size={13} style={{ transform: filterDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
          </button>

          {filterDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 50,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              padding: '6px',
              minWidth: '200px'
            }}>
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
          onClick={() => onNavigate('/admin/pages/create')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.55rem 1.25rem',
            backgroundColor: 'var(--brand-primary, #dc2626)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.28)',
            transition: 'transform 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Plus size={16} />
          <span>Create Page</span>
        </button>
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
          <div style={{ overflowX: 'auto' }}>
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
                            onClick={() => setPreviewPage(page)}
                            title={`Preview ${page.title} in same space`}
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
                            onClick={() => {
                              const targetId = page.id || page._id || page.slug || 'home';
                              onNavigate(`/admin/pages/${targetId}/edit`);
                            }}
                            title="Edit page & sections"
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
      {/* ── Same Space Live Page Preview Modal ── */}
      {previewPage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setPreviewPage(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '95vw',
              maxWidth: '1360px',
              height: '90vh',
              maxHeight: '920px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              {/* Page Title & Route */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                  {previewPage.title}
                </span>
                <code style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  background: '#e2e8f0',
                  color: '#334155',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 600
                }}>
                  {previewPage.route || (previewPage.slug ? `/${previewPage.slug.replace(/^\/+/, '')}` : '/')}
                </code>
              </div>

              {/* Viewport Device Switcher */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#e2e8f0',
                padding: '3px',
                borderRadius: '9px',
                gap: '2px'
              }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: previewDevice === 'desktop' ? '#ffffff' : 'transparent',
                    color: previewDevice === 'desktop' ? '#0f172a' : '#64748b',
                    boxShadow: previewDevice === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Laptop size={14} />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: previewDevice === 'tablet' ? '#ffffff' : 'transparent',
                    color: previewDevice === 'tablet' ? '#0f172a' : '#64748b',
                    boxShadow: previewDevice === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Tablet size={14} />
                  <span>Tablet (768px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: previewDevice === 'mobile' ? '#ffffff' : 'transparent',
                    color: previewDevice === 'mobile' ? '#0f172a' : '#64748b',
                    boxShadow: previewDevice === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Smartphone size={14} />
                  <span>Mobile (375px)</span>
                </button>
              </div>

              {/* Actions: External & Close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.open(previewPage.route || (previewPage.slug ? `/${previewPage.slug.replace(/^\/+/, '')}` : '/'), '_blank')}
                  title="Open live site in external browser tab"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Open Tab</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewPage(null)}
                  title="Close preview"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Iframe Content */}
            <div style={{
              flex: 1,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: previewDevice === 'desktop' ? '0' : '1.5rem'
            }}>
              <iframe
                title={`Preview of ${previewPage.title}`}
                src={previewPage.route || (previewPage.slug ? `/${previewPage.slug.replace(/^\/+/, '')}` : '/')}
                style={{
                  width: previewDevice === 'desktop' ? '100%' : (previewDevice === 'tablet' ? '768px' : '375px'),
                  height: '100%',
                  border: previewDevice === 'desktop' ? 'none' : '1px solid #cbd5e1',
                  borderRadius: previewDevice === 'desktop' ? '0' : '12px',
                  boxShadow: previewDevice === 'desktop' ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.15)',
                  background: '#ffffff',
                  transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}