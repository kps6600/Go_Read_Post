import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  Layers, FileText, Globe, Clock, X, ArrowUpRight,
  LayoutGrid, List, ChevronDown, Sparkles, FilePlus2
} from 'lucide-react';
import { PageService } from '../../services/pageService';

const COMPANY_SLUGS = ['about', 'advertise'];
const PORTAL_SLUGS = ['latest', 'trending', 'videos', 'newsletter'];

export const getPageGroup = (page) => {
  const s = (page.slug || page.id || '').toLowerCase().replace(/^\/+/, '');
  if (COMPANY_SLUGS.includes(s)) return { key: 'company', label: 'Company & Connect', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' };
  if (PORTAL_SLUGS.includes(s)) return { key: 'feeds', label: 'Editorial Feeds', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' };
  return { key: 'portal', label: 'Site Architecture', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' };
};

export default function AdminPagesView({ onNavigate, onShowToast, filterCategory }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all'); // 'all' | 'company' | 'legal' | 'desks'
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await PageService.getPages();
      setPages(data || []);
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
    const isCore = ['home', 'about', 'advertise', 'latest', 'trending', 'videos', 'newsletter'].includes((page.slug || page.id || '').toLowerCase());
    if (page.id === 'home' || isCore) { 
      onShowToast?.(`"${page.title}" is an active navbar page and cannot be deleted.`); 
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
    const pageGroup = getPageGroup(page).key;
    const matchGroup = groupFilter === 'all' || pageGroup === groupFilter;
    const matchCategory = !filterCategory || page.category === filterCategory;
    return matchSearch && matchStatus && matchGroup && matchCategory;
  });

  const publishedCount = pages.filter(p => p.status === 'published' || p.status === 'active').length;
  const draftCount = pages.length - publishedCount;
  const portalCount = pages.filter(p => getPageGroup(p).key === 'portal').length;
  const companyCount = pages.filter(p => getPageGroup(p).key === 'company').length;
  const feedsCount = pages.filter(p => getPageGroup(p).key === 'feeds').length;
  const totalSections = pages.reduce((acc, p) => acc + (p.sections?.length || 0), 0);

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
    <div className="apv-root">

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (() => {
        const page = pages.find(p => p.id === deleteConfirmId);
        return page ? <DeleteModal page={page} /> : null;
      })()}

      {/* ── Top Bar: KPI Chips & Actions ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem',
        marginTop: '0.25rem'
      }}>
        <div className="apv-stats-row" style={{ margin: 0 }}>
          <div className="apv-stat-chip">
            <div>
              <span className="apv-stat-val">{pages.length}</span>
              <span className="apv-stat-lbl">Total Pages</span>
            </div>
          </div>
          <div className="apv-stat-chip">
            <div>
              <span className="apv-stat-val">{publishedCount}</span>
              <span className="apv-stat-lbl">Published</span>
            </div>
          </div>
          <div className="apv-stat-chip">
            <div>
              <span className="apv-stat-val">{draftCount}</span>
              <span className="apv-stat-lbl">Drafts</span>
            </div>
          </div>
          <div className="apv-stat-chip">
            <div>
              <span className="apv-stat-val">{totalSections}</span>
              <span className="apv-stat-lbl">Total Sections</span>
            </div>
          </div>
        </div>

        <div className="apv-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="apv-btn-ghost" onClick={fetchPages} title="Refresh">
            <RefreshCw size={15} className={loading ? 'apv-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="apv-btn-primary" onClick={() => onNavigate('/admin/pages/create')}>
            <FilePlus2 size={16} />
            <span>New Page</span>
          </button>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="apv-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Group Category Filters */}
          <div className="apv-filter-pills" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Pages', count: pages.length },
              { key: 'portal', label: 'Site Architecture', count: portalCount, color: '#7c3aed' },
              { key: 'company', label: 'Company & Connect', count: companyCount, color: '#2563eb' },
              { key: 'feeds', label: 'Editorial Feeds', count: feedsCount, color: '#059669' },
            ].map(g => (
              <button
                key={g.key}
                className={`apv-pill ${groupFilter === g.key ? 'active' : ''}`}
                onClick={() => setGroupFilter(g.key)}
                style={groupFilter === g.key && g.color ? { borderColor: g.color } : {}}
              >
                {g.label}
                <span className="apv-pill-count">{g.count}</span>
              </button>
            ))}
          </div>

          <div className="apv-view-toggle">
            <button
              className={`apv-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <List size={15} />
            </button>
            <button
              className={`apv-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="apv-search-wrap" style={{ flex: '1', minWidth: '260px' }}>
            <Search size={15} className="apv-search-icon" />
            <input
              type="text"
              className="apv-search-input"
              placeholder="Search by title, description, or slug…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="apv-search-clear" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="apv-filter-pills">
            {[
              { key: 'all', label: 'All Status', count: pages.length },
              { key: 'published', label: 'Live', count: publishedCount },
              { key: 'draft', label: 'Draft', count: draftCount },
            ].map(f => (
              <button
                key={f.key}
                className={`apv-pill ${statusFilter === f.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.key === 'published' && <span className="apv-pill-dot green" />}
                {f.key === 'draft' && <span className="apv-pill-dot amber" />}
                {f.label}
                <span className="apv-pill-count">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="apv-content-card">
        {loading ? (
          <div className="apv-loading">
            <div className="apv-loading-spinner" />
            <p>Loading pages…</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="apv-empty">
            <div className="apv-empty-icon">
              <Sparkles size={28} />
            </div>
            <h4>No pages found</h4>
            <p>
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : 'No pages match the active filters.'}
            </p>
            {!searchQuery && (
              <button className="apv-btn-primary" onClick={() => onNavigate('/admin/pages/create')}>
                <Plus size={15} />
                <span>Create New Page</span>
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="apv-table-wrap">
            <table className="apv-table">
              <thead>
                <tr>
                  <th className="apv-th" style={{ width: '38%' }}>Page</th>
                  <th className="apv-th" style={{ width: '16%' }}>Slug</th>
                  <th className="apv-th" style={{ width: '12%' }}>Sections</th>
                  <th className="apv-th" style={{ width: '14%' }}>Status</th>
                  <th className="apv-th" style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => {
                  const isLive = page.status === 'published' || page.status === 'active';
                  const sections = page.sections?.length || 0;
                  const isActing = actionLoadingId === page.id;
                  const grp = getPageGroup(page);
                  const isCore = ['home', 'about', 'editorial-team', 'careers', 'pitch', 'privacy', 'terms', 'disclaimer'].includes((page.slug || page.id || '').toLowerCase());
                  const targetSlug = page.slug || page.id || '';
                  const previewUrl = (!targetSlug || targetSlug === 'home' || targetSlug === '/') ? '/' : `/${targetSlug.replace(/^\/+/, '')}`;
                  const hasHero = page.sections?.some(s => s.type === 'hero' || s.type === 'hero_popular' || s.id === 'hero_popular' || (s.type || '').toLowerCase().includes('hero')) || page.id === 'home' || page.slug === '' || page.slug === 'home';

                  return (
                    <tr key={page.id || page._id || targetSlug} className="apv-tr">
                      <td className="apv-td">
                        <div className="apv-page-cell">
                          <div className="apv-page-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span className="apv-page-title">{page.title}</span>
                              <span 
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 750,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '6px',
                                  color: grp.color,
                                  background: grp.bg,
                                  letterSpacing: '0.02em',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {grp.label}
                              </span>
                            </div>
                            {page.description && (
                              <span className="apv-page-desc">{page.description}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="apv-td">
                        <code className="apv-slug">{previewUrl}</code>
                      </td>

                      <td className="apv-td">
                        <span className="apv-sections-badge">
                          <Layers size={12} />
                          {sections}
                        </span>
                      </td>

                      <td className="apv-td">
                        <button
                          className={`apv-status-btn ${isLive ? 'live' : 'draft'}`}
                          onClick={() => handleTogglePublish(page)}
                          disabled={isActing}
                          title={isLive ? 'Click to unpublish' : 'Click to publish'}
                        >
                          <span className="apv-status-dot" />
                          {isActing ? '…' : isLive ? 'Live' : 'Draft'}
                          <ChevronDown size={11} />
                        </button>
                      </td>

                      <td className="apv-td" style={{ textAlign: 'right' }}>
                        <div className="apv-actions">
                          <button
                            className="apv-action-btn live-studio"
                            onClick={() => onNavigate(`/admin/pages/${page.id || page._id || targetSlug}/edit?liveStudio=true`)}
                            style={{
                              background: (targetSlug === 'home' || page.id === 'home' || !targetSlug) ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : 'linear-gradient(135deg, rgba(234, 88, 12, 0.16) 0%, rgba(249, 115, 22, 0.1) 100%)',
                              color: (targetSlug === 'home' || page.id === 'home' || !targetSlug) ? '#ffffff' : '#ea580c',
                              border: '1px solid rgba(234, 88, 12, 0.38)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              boxShadow: (targetSlug === 'home' || page.id === 'home' || !targetSlug) ? '0 2px 8px rgba(234, 88, 12, 0.35)' : 'none'
                            }}
                            title={(targetSlug === 'home' || page.id === 'home' || !targetSlug) ? "Open Whole Homepage Visual Live Studio" : "Open Visual Live Studio for this page"}
                          >
                            <Sparkles size={12} fill={(targetSlug === 'home' || page.id === 'home' || !targetSlug) ? "#ffffff" : "none"} />
                            <span>{(targetSlug === 'home' || page.id === 'home' || !targetSlug) ? '⚡ Whole Home Studio' : 'Live Edit'}</span>
                          </button>
                          {hasHero && (
                            <button
                              className="apv-action-btn live-hero"
                              onClick={() => onNavigate(`/admin/pages/${page.id || page._id || targetSlug}/edit?liveHero=true`)}
                              style={{
                                background: 'rgba(234, 88, 12, 0.12)',
                                color: '#ea580c',
                                border: '1px solid rgba(234, 88, 12, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                              title="Open Live WYSIWYG Banner Studio for this page"
                            >
                              <Sparkles size={12} />
                              <span>Hero Banner</span>
                            </button>
                          )}
                          <button
                            className="apv-action-btn preview"
                            onClick={() => window.open(previewUrl, '_blank')}
                            title="Preview public page"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="apv-action-btn edit"
                            onClick={() => onNavigate(`/admin/pages/${page.id || page._id || targetSlug}/edit`)}
                            title="Edit page & sections"
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                          {!isCore && (
                            <button
                              className="apv-action-btn delete"
                              onClick={() => setDeleteConfirmId(page.id)}
                              disabled={isActing}
                              title="Delete page"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="apv-grid">
            {filteredPages.map((page) => {
              const isLive = page.status === 'published' || page.status === 'active';
              const sections = page.sections?.length || 0;
              const isActing = actionLoadingId === page.id;
              const grp = getPageGroup(page);
              const isCore = ['home', 'about', 'editorial-team', 'careers', 'pitch', 'privacy', 'terms', 'disclaimer'].includes((page.slug || page.id || '').toLowerCase());
              const targetSlug = page.slug || page.id || '';
              const previewUrl = (!targetSlug || targetSlug === 'home' || targetSlug === '/') ? '/' : `/${targetSlug.replace(/^\/+/, '')}`;
              const hasHero = page.sections?.some(s => s.type === 'hero' || s.type === 'hero_popular' || s.id === 'hero_popular' || (s.type || '').toLowerCase().includes('hero')) || page.id === 'home' || page.slug === '' || page.slug === 'home';

              return (
                <div key={page.id || page._id || targetSlug} className="apv-grid-card">
                  <div className="apv-grid-card-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={`apv-status-btn ${isLive ? 'live' : 'draft'}`} style={{ pointerEvents: 'none' }}>
                        <span className="apv-status-dot" />
                        {isLive ? 'Live' : 'Draft'}
                      </span>
                      <span 
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 750,
                          padding: '0.12rem 0.45rem',
                          borderRadius: '6px',
                          color: grp.color,
                          background: grp.bg,
                          textTransform: 'uppercase'
                        }}
                      >
                        {grp.label}
                      </span>
                    </div>
                    <button
                      className="apv-action-btn preview"
                      onClick={() => window.open(previewUrl, '_blank')}
                      title="Preview"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <div className="apv-grid-card-body">
                    <h4 className="apv-grid-title">{page.title}</h4>
                    {page.description && (
                      <p className="apv-grid-desc">{page.description}</p>
                    )}
                    <code className="apv-slug" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{previewUrl}</code>
                  </div>

                  <div className="apv-grid-card-footer">
                    <span className="apv-sections-badge">
                      <Layers size={12} />
                      {sections} section{sections !== 1 ? 's' : ''}
                    </span>
                    <div className="apv-actions">
                      <button
                        className="apv-action-btn live-studio"
                        onClick={() => onNavigate(`/admin/pages/${page.id || page._id || targetSlug}/edit?liveStudio=true`)}
                        style={{
                          background: (targetSlug === 'home' || page.id === 'home' || !targetSlug) ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : 'linear-gradient(135deg, rgba(234, 88, 12, 0.16) 0%, rgba(249, 115, 22, 0.1) 100%)',
                          color: (targetSlug === 'home' || page.id === 'home' || !targetSlug) ? '#ffffff' : '#ea580c',
                          border: '1px solid rgba(234, 88, 12, 0.38)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.73rem',
                          cursor: 'pointer'
                        }}
                        title={(targetSlug === 'home' || page.id === 'home' || !targetSlug) ? "Open Whole Homepage Visual Live Studio" : "Open Visual Live Studio for this page"}
                      >
                        <Sparkles size={11} fill={(targetSlug === 'home' || page.id === 'home' || !targetSlug) ? "#ffffff" : "none"} />
                        <span>{(targetSlug === 'home' || page.id === 'home' || !targetSlug) ? '⚡ Whole Home Studio' : 'Live Edit'}</span>
                      </button>
                      {hasHero && (
                        <button
                          className="apv-action-btn live-hero"
                          onClick={() => onNavigate(`/admin/pages/${page.id || page._id || targetSlug}/edit?liveHero=true`)}
                          style={{
                            background: 'rgba(234, 88, 12, 0.12)',
                            color: '#ea580c',
                            border: '1px solid rgba(234, 88, 12, 0.35)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.73rem',
                            cursor: 'pointer'
                          }}
                          title="Open Live WYSIWYG Banner Studio"
                        >
                          <Sparkles size={11} />
                          <span>Hero</span>
                        </button>
                      )}
                      <button
                        className="apv-action-btn edit"
                        onClick={() => onNavigate(`/admin/pages/${page.id || page._id || targetSlug}/edit`)}
                        title="Edit page & sections"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      {!isCore && (
                        <button
                          className="apv-action-btn delete"
                          onClick={() => setDeleteConfirmId(page.id)}
                          disabled={isActing}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer row count */}
        {!loading && filteredPages.length > 0 && (
          <div className="apv-footer-row">
            <span>Showing <strong>{filteredPages.length}</strong> of <strong>{pages.length}</strong> pages</span>
          </div>
        )}
      </div>
    </div>
  );
}
