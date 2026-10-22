import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye,
  Layers, X, Filter, Check,
  ChevronDown, Sparkles
} from 'lucide-react';
import { PageService } from '../../services/pageService';

const COMPANY_SLUGS = ['about', 'advertise'];
const PORTAL_SLUGS = ['trending', 'videos', 'newsletter', 'category', 'categories', 'topics', 'topic'];

const getPageGroup = (page) => {
  const s = (page.slug || page.id || '').toLowerCase().replace(/^\/+/, '');
  if (COMPANY_SLUGS.includes(s)) return { key: 'company', label: 'Company & Connect', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' };
  if (PORTAL_SLUGS.includes(s)) return { key: 'feeds', label: 'Editorial Feeds', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' };
  return { key: 'portal', label: 'Site Architecture', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' };
};

export default function AdminPagesView({ onNavigate, onShowToast, filterCategory }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
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
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="apv-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
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

        <div className="apv-filter-wrap" ref={filterRef}>
          <button
            type="button"
            className={`apv-filter-btn ${statusFilter !== 'all' ? 'active' : ''}`}
            onClick={() => setFilterDropdownOpen(prev => !prev)}
            aria-expanded={filterDropdownOpen}
          >
            <Filter size={15} />
            <span>
              {statusFilter === 'all'
                ? 'Filter'
                : statusFilter === 'published'
                ? 'Filter: Live'
                : 'Filter: Draft'}
            </span>
            <span className="apv-filter-count-badge">
              {statusFilter === 'all' ? pages.length : statusFilter === 'published' ? publishedCount : draftCount}
            </span>
            <ChevronDown
              size={13}
              style={{
                transform: filterDropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.18s ease'
              }}
            />
          </button>

          {filterDropdownOpen && (
            <div className="apv-filter-popover">
              <div className="apv-filter-popover-header">Filter by Status</div>

              {[
                { key: 'all', label: 'All Status', count: pages.length },
                { key: 'published', label: 'Live / Published', count: publishedCount, dot: '#10b981' },
                { key: 'draft', label: 'Draft', count: draftCount, dot: '#f59e0b' },
              ].map(opt => {
                const isSelected = statusFilter === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={`apv-filter-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setStatusFilter(opt.key);
                      setFilterDropdownOpen(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {opt.dot ? (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: opt.dot,
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <span style={{ width: '8px' }} />
                      )}
                      <span>{opt.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span className="apv-filter-option-count">{opt.count}</span>
                      {isSelected && <Check size={14} className="apv-filter-check" />}
                    </div>
                  </button>
                );
              })}

              {statusFilter !== 'all' && (
                <>
                  <div className="apv-filter-popover-divider" />
                  <button
                    type="button"
                    className="apv-filter-reset-btn"
                    onClick={() => {
                      setStatusFilter('all');
                      setFilterDropdownOpen(false);
                    }}
                  >
                    Reset to All Status
                  </button>
                </>
              )}
            </div>
          )}
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
        ) : (
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
                  const targetSlug = page.slug || page.id || '';
                  const previewUrl = (!targetSlug || targetSlug === 'home' || targetSlug === '/') ? '/' : `/${targetSlug.replace(/^\/+/, '')}`;

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
                            className="apv-action-btn preview"
                            onClick={() => window.open(previewUrl, '_blank')}
                            title="Preview public page"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="apv-action-btn edit"
                            onClick={() => {
                              if (page.id === 'trending' || targetSlug === 'trending') {
                                onNavigate('/admin/trending');
                              } else if (page.id === 'category' || targetSlug === 'category' || targetSlug === 'categories') {
                                onNavigate('/admin/category');
                              } else if (page.id === 'founder' || page.id === 'founder-first' || targetSlug === 'founder' || targetSlug === 'founder-first') {
                                onNavigate('/admin/founder');
                              } else if (page.id === 'videos' || targetSlug === 'videos') {
                                onNavigate('/admin/videos');
                              } else if (page.id === 'about' || targetSlug === 'about' || targetSlug === 'about-us') {
                                onNavigate('/admin/about');
                              } else if (page.id === 'topics' || targetSlug === 'topics') {
                                onNavigate('/admin/topics');
                              } else {
                                onNavigate(`/admin/pages/${page.id || page._id || targetSlug}/edit`);
                              }
                            }}
                            title="Edit page & sections"
                          >
                            <Edit2 size={14} />
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
          <div className="apv-footer-row">
            <span>Showing <strong>{filteredPages.length}</strong> of <strong>{pages.length}</strong> pages</span>
          </div>
        )}
      </div>
    </div>
  );
}
