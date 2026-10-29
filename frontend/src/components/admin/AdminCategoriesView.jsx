import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Edit2, Trash2, Search, Check, Clock,
  ExternalLink, Layers, RefreshCw, X, CheckSquare,
  AlertTriangle, AlertCircle, EyeOff, 
  ArrowUpDown, Filter, ChevronDown, CheckCircle, FileText,
  Sparkles, Image as ImageIcon, Link2, Globe
} from 'lucide-react';
import { TaxonomyService } from '../../services/taxonomyService';

export default function AdminCategoriesView({ onShowToast }) {
  // Data state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search, filter & sort state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [parentFilter, setParentFilter] = useState('all'); // all | root | sub
  const [sortBy, setSortBy] = useState('order'); // order | name_asc | name_desc | published_desc | drafts_desc | updated_desc
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Unified Filter Popover state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (sortBy !== 'order' ? 1 : 0);

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    seoTitle: '',
    seoDescription: '',
    order: 0,
    isActive: true
  });

  // Delete / Usage modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await TaxonomyService.getAdminCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(c => c.isActive !== false).length;
    const inactive = total - active;
    const totalPublished = categories.reduce((sum, c) => sum + (c.publishedArticlesCount || 0), 0);
    const totalDrafts = categories.reduce((sum, c) => sum + (c.draftArticlesCount || 0), 0);
    return { total, active, inactive, totalPublished, totalDrafts };
  }, [categories]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsSlugManuallyEdited(false);
    setFormErrors({});
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: '',
      seoTitle: '',
      seoDescription: '',
      order: categories.length + 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsSlugManuallyEdited(true);
    setFormErrors({});
    const parentVal = typeof cat.parentId === 'object' && cat.parentId?._id 
      ? cat.parentId._id 
      : (cat.parentId || '');

    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      parentId: parentVal,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      order: cat.order || 0,
      isActive: cat.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (val) => {
    const newSlug = isSlugManuallyEdited 
      ? formData.slug 
      : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: newSlug,
      seoTitle: prev.seoTitle || (val ? `${val} - GoReadPost` : '')
    }));

    if (formErrors.name) {
      setFormErrors(prev => ({ ...prev, name: null }));
    }
  };

  const handleSlugChange = (val) => {
    setIsSlugManuallyEdited(true);
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug: clean }));
    if (formErrors.slug) {
      setFormErrors(prev => ({ ...prev, slug: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    if (!formData.slug.trim()) {
      errors.slug = 'URL slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    } else {
      // Check duplicate slug among other categories
      const duplicate = categories.find(c => 
        c.slug === formData.slug && (!editingCategory || (c._id !== editingCategory._id && c.slug !== editingCategory.slug))
      );
      if (duplicate) {
        errors.slug = `Slug "${formData.slug}" is already used by category "${duplicate.name}"`;
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        order: Number(formData.order) || 0,
        parentId: formData.parentId || null
      };

      if (editingCategory) {
        const id = editingCategory._id || editingCategory.slug;
        await TaxonomyService.updateCategory(id, payload);
        onShowToast?.(`Category "${payload.name}" updated successfully!`);
      } else {
        await TaxonomyService.createCategory(payload);
        onShowToast?.(`Category "${payload.name}" created successfully!`);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
      setFormErrors(prev => ({ ...prev, submit: err.message || 'Operation failed' }));
    } finally {
      setSaving(false);
    }
  };

  // Toggle single category status
  const handleToggleStatus = async (cat) => {
    const newStatus = cat.isActive === false ? true : false;
    const id = cat._id || cat.slug;
    try {
      await TaxonomyService.updateCategory(id, { isActive: newStatus });
      onShowToast?.(`Category "${cat.name}" is now ${newStatus ? 'Active' : 'Inactive'}`);
      setCategories(prev => prev.map(c => (c._id === id || c.slug === id) ? { ...c, isActive: newStatus } : c));
    } catch (err) {
      alert(err.message || 'Failed to update category status');
    }
  };

  // Open Delete / Usage Modal
  const handlePromptDelete = async (cat) => {
    setCategoryToDelete(cat);
    setUsageData(null);
    setDeleteModalOpen(true);
    setLoadingUsage(true);

    try {
      const id = cat._id || cat.slug;
      const usage = await TaxonomyService.getCategoryUsage(id);
      setUsageData(usage);
    } catch (err) {
      console.error('Failed to load category usage:', err);
      // Fallback usage from row data
      setUsageData({
        publishedCount: cat.publishedArticlesCount || 0,
        draftCount: cat.draftArticlesCount || 0,
        totalCount: (cat.publishedArticlesCount || 0) + (cat.draftArticlesCount || 0),
        recentArticles: []
      });
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      const id = categoryToDelete._id || categoryToDelete.slug;
      await TaxonomyService.deleteCategory(id, true);
      onShowToast?.(`Category "${categoryToDelete.name}" deleted successfully.`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected categories? Associated articles will need reassignment.`)) return;
    
    setBulkProcessing(true);
    try {
      await TaxonomyService.bulkDeleteCategories(Array.from(selectedIds));
      onShowToast?.(`Deleted ${count} categories successfully`);
      setSelectedIds(new Set());
      loadCategories();
    } catch (err) {
      alert('Error during bulk delete: ' + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkStatus = async (isActive) => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        await TaxonomyService.updateCategory(id, { isActive });
      }
      onShowToast?.(`Updated status for ${selectedIds.size} categories`);
      setSelectedIds(new Set());
      loadCategories();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    let result = categories.filter(c => {
      // Search
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || 
        c.name.toLowerCase().includes(q) || 
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      // Status
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && c.isActive !== false) || 
        (statusFilter === 'inactive' && c.isActive === false);

      // Parent/Hierarchy
      const isSub = Boolean(c.parentId);
      const matchesParent = 
        parentFilter === 'all' ||
        (parentFilter === 'root' && !isSub) ||
        (parentFilter === 'sub' && isSub);

      return matchesSearch && matchesStatus && matchesParent;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'order') return (a.order || 0) - (b.order || 0);
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'published_desc') return (b.publishedArticlesCount || 0) - (a.publishedArticlesCount || 0);
      if (sortBy === 'drafts_desc') return (b.draftArticlesCount || 0) - (a.draftArticlesCount || 0);
      if (sortBy === 'updated_desc') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      return 0;
    });

    return result;
  }, [categories, search, statusFilter, parentFilter, sortBy]);

  return (
    <div className="admin-page-container">

      {/* ── Summary Stats Strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div 
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          style={{ 
            background: '#ffffff', 
            padding: '1rem 1.25rem', 
            borderRadius: '12px', 
            border: statusFilter === 'all' ? '1.5px solid #0f172a' : '1px solid #e2e8f0', 
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Filter by all categories"
        >
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Total Categories</div>
        </div>

        <div 
          onClick={() => { setStatusFilter(statusFilter === 'active' ? 'all' : 'active'); setCurrentPage(1); }}
          style={{ 
            background: '#ffffff', 
            padding: '1rem 1.25rem', 
            borderRadius: '12px', 
            border: statusFilter === 'active' ? '1.5px solid #059669' : '1px solid #e2e8f0', 
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Filter by active sections"
        >
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{stats.active}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Active Sections</div>
        </div>

        <div 
          onClick={() => { setStatusFilter(statusFilter === 'inactive' ? 'all' : 'inactive'); setCurrentPage(1); }}
          style={{ 
            background: '#ffffff', 
            padding: '1rem 1.25rem', 
            borderRadius: '12px', 
            border: statusFilter === 'inactive' ? '1.5px solid #dc2626' : '1px solid #e2e8f0', 
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Filter by not active sections"
        >
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{stats.inactive}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Not Active</div>
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
        marginBottom: '1rem',
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
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search categories by name, slug or description..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.88rem',
              background: 'transparent',
              color: '#0f172a'
            }}
          />
          {search && (
            <button 
              type="button" 
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter & Sort Popover Button */}
        <div ref={filterRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.55rem 0.95rem',
              borderRadius: '9px',
              border: activeFilterCount > 0 ? '1px solid #dc2626' : '1px solid #cbd5e1',
              background: activeFilterCount > 0 ? '#fff1f2' : '#ffffff',
              color: activeFilterCount > 0 ? '#dc2626' : '#334155',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Filter and sort categories"
          >
            <Filter size={15} color={activeFilterCount > 0 ? '#dc2626' : '#64748b'} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span style={{
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '1px 6px',
                lineHeight: 1.2
              }}>
                {activeFilterCount}
              </span>
            )}
            <ChevronDown 
              size={14} 
              style={{
                transform: isFilterOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.18s ease',
                color: activeFilterCount > 0 ? '#dc2626' : '#64748b'
              }} 
            />
          </button>

          {isFilterOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.04)',
              width: '280px',
              zIndex: 50,
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                  <Filter size={14} color="#dc2626" />
                  <span>Filter Categories</span>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setSortBy('order');
                      setCurrentPage(1);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    color: '#1e293b',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <option value="all">All Status ({categories.length})</option>
                  <option value="active">Active Only ({stats.active})</option>
                  <option value="inactive">Inactive Only ({stats.inactive})</option>
                </select>
              </div>

              {/* Sort By */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    color: '#1e293b',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <option value="order">Custom Order</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="published_desc">Most Published</option>
                  <option value="drafts_desc">Most Drafts</option>
                  <option value="updated_desc">Recently Updated</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* + Add Category Button */}
        <button
          type="button"
          onClick={handleOpenCreate}
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
          <span>+ Add Category</span>
        </button>
      </div>

      {/* ── Sub-Header Bar: Select All, Bulk Actions & Count ── */}
      <div className="abv-cards-header-bar" style={{ marginBottom: '0.5rem', padding: '0.4rem 0.25rem 0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label className="abv-select-all-label" title="Select all categories">
            <input
              type="checkbox"
              className="admin-table-checkbox"
              checked={selectedIds.size > 0 && selectedIds.size === filteredAndSorted.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(new Set(filteredAndSorted.map(c => c._id || c.slug)));
                } else {
                  setSelectedIds(new Set());
                }
              }}
            />
            <span>Select All</span>
          </label>
          {selectedIds.size > 0 && (
            <span className="abv-selected-pill">
              {selectedIds.size} of {filteredAndSorted.length} selected
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <div className="abv-bulk-actions-group">
              <button
                type="button"
                onClick={() => handleBulkStatus(false)}
                disabled={bulkProcessing}
                className="abv-bulk-btn abv-bulk-btn-draft"
                title="Set selected categories to inactive"
              >
                <Clock size={14} />
                <span>Send Draft</span>
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkProcessing}
                className="abv-bulk-btn abv-bulk-btn-delete"
                title="Delete selected categories"
              >
                <Trash2 size={14} />
                <span>{bulkProcessing ? 'Deleting...' : `Delete (${selectedIds.size})`}</span>
              </button>
            </div>
          )}
          <div className="abv-cards-count-badge">
            <span>
              {statusFilter === 'active' && 'Active: '}
              {statusFilter === 'inactive' && 'Inactive: '}
              {statusFilter === 'all' && 'All Posts: '}
              {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Categories Table Card ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ width: '42px', padding: '0.85rem 0.95rem' }}></th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Category Name
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  URL Slug
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'center' }}>
                  Published
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'center' }}>
                  Drafts
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'center' }}>
                  Status
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Last Updated
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={26} className="rotate-icon" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem', color: 'var(--brand-primary)' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading publication categories...</div>
                  </td>
                </tr>
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                      <Layers size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                      {search ? 'No categories matched your search' : 'No publication categories found'}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
                      {search ? `Try adjusting or clearing your search query "${search}".` : 'Create primary sections like Startups, Tech, or Enterprise to organize articles.'}
                    </p>
                    {search ? (
                      <button 
                        type="button" 
                        onClick={() => setSearch('')}
                        style={{ padding: '0.55rem 1.15rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer' }}
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleOpenCreate}
                        style={{ padding: '0.65rem 1.35rem', background: 'var(--brand-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                      >
                        + Add First Category
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((cat) => {
                  const id = cat._id || cat.slug;
                  const isSelected = selectedIds.has(id);
                  const parentName = typeof cat.parentId === 'object' && cat.parentId?.name 
                    ? cat.parentId.name 
                    : (categories.find(c => (c._id === cat.parentId || c.slug === cat.parentId))?.name);
                  const publishedCount = cat.publishedArticlesCount || 0;
                  const draftCount = cat.draftArticlesCount || 0;
                  const isActive = cat.isActive !== false;
                  const formattedDate = cat.updatedAt 
                    ? new Date(cat.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Editorial Core';

                  return (
                    <tr 
                      key={id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#fff1f2' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '0.9rem 0.95rem' }}>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            if (e.target.checked) next.add(id);
                            else next.delete(id);
                            setSelectedIds(next);
                          }}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>

                      {/* Category Name */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>{cat.name}</strong>
                          {parentName && (
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '1px 6px',
                              borderRadius: '5px',
                              background: '#f1f5f9',
                              color: '#475569',
                              fontWeight: 600
                            }}>
                              Sub-pillar of {parentName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* URL Slug */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <a
                          href={`/category/${cat.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: '0.82rem',
                            color: '#2563eb',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#eff6ff',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #dbeafe'
                          }}
                          title="Click to view public category page"
                        >
                          <span>/category/{cat.slug}</span>
                        </a>
                      </td>

                      {/* Published Count */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3px 9px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: publishedCount > 0 ? '#ecfdf5' : '#f1f5f9',
                          color: publishedCount > 0 ? '#059669' : '#94a3b8',
                          border: `1px solid ${publishedCount > 0 ? '#a7f3d0' : '#e2e8f0'}`
                        }}>
                          {publishedCount}
                        </span>
                      </td>

                      {/* Draft Count */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3px 9px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: draftCount > 0 ? '#fef3c7' : '#f1f5f9',
                          color: draftCount > 0 ? '#b45309' : '#94a3b8',
                          border: `1px solid ${draftCount > 0 ? '#fde68a' : '#e2e8f0'}`
                        }}>
                          {draftCount}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          title={`Click to ${isActive ? 'deactivate' : 'activate'}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: `1px solid ${isActive ? '#bbf7d0' : '#e2e8f0'}`,
                            background: isActive ? '#f0fdf4' : '#f8fafc',
                            color: isActive ? '#15803d' : '#64748b'
                          }}
                        >
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isActive ? '#22c55e' : '#94a3b8'
                          }} />
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Last Updated */}
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category Details"
                            style={{
                              padding: '6px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '7px',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          <a
                            href={`/category/${cat.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View Live Category Page"
                            style={{
                              padding: '6px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '7px',
                              color: '#2563eb',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            type="button"
                            onClick={() => handlePromptDelete(cat)}
                            title="Delete Category"
                            style={{
                              padding: '6px',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '7px',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        </div>

      {/* ── CREATE / EDIT CATEGORY MODAL ── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {formErrors.submit && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{formErrors.submit}</span>
                </div>
              )}

              {/* Row 1: Name and Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artificial Intelligence"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${formErrors.name ? '#ef4444' : '#cbd5e1'}`,
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.name && (
                    <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>{formErrors.name}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    URL Slug *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '0.65rem 0.6rem', fontSize: '0.82rem', color: '#64748b' }}>
                      /category/
                    </span>
                    <input
                      type="text"
                      placeholder="artificial-intelligence"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '0 8px 8px 0',
                        border: `1px solid ${formErrors.slug ? '#ef4444' : '#cbd5e1'}`,
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {formErrors.slug && (
                    <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>{formErrors.slug}</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Status
                </label>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: formData.isActive ? '#ecfdf5' : '#f8fafc',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: formData.isActive ? '#059669' : '#64748b' }}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>

              {/* Row 5: SEO Accordion */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                  <Globe size={16} color="var(--brand-primary)" />
                  <span>Search Engine Optimization (SEO Metadata)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      SEO Meta Title ({formData.seoTitle.length}/60 chars)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Startups News, Insights & Stories | GoReadPost"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      SEO Meta Description ({formData.seoDescription.length}/160 chars)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Search engine summary snippet for this category archive..."
                      value={formData.seoDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.65rem 1.5rem',
                    background: 'var(--brand-primary, #dc2626)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── DELETE & USAGE CONFIRMATION MODAL ── */}
      {deleteModalOpen && categoryToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem 1.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <AlertTriangle size={26} />
              </div>

              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Delete Category "{categoryToDelete.name}"?
              </h3>

              {loadingUsage ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={20} className="rotate-icon" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Checking article associations...</p>
                </div>
              ) : (
                <div>
                  {usageData && usageData.totalCount > 0 ? (
                    <div style={{
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px' }}>
                        <AlertCircle size={16} />
                        <span>Category is actively used in {usageData.totalCount} article(s)!</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#881337', margin: '0 0 8px', lineHeight: 1.5 }}>
                        • <strong>{usageData.publishedCount}</strong> published article(s)<br />
                        • <strong>{usageData.draftCount}</strong> draft / review article(s)
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#9f1239', margin: 0, fontWeight: 500 }}>
                        Deleting this category will orphan these articles from this section. We recommend reassigning them before deleting.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem' }}>
                      This category currently has <strong>0 associated articles</strong>. It is safe to delete.
                    </p>
                  )}

                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Are you sure you want to proceed with permanent deletion?
                  </p>
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{
                    padding: '0.65rem 1.45rem',
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  {deleting ? 'Deleting...' : 'Confirm & Delete'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
