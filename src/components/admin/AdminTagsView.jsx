import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag as TagIcon, Plus, Edit2, Trash2, Search, ExternalLink, 
  RefreshCw, AlertCircle, AlertTriangle, CheckCircle, Check, 
  X, ChevronRight, FileText, CheckSquare, GitMerge, Sparkles, 
  Eye, EyeOff
} from 'lucide-react';
import { TaxonomyService } from '../../services/taxonomyService';

export default function AdminTagsView({ onShowToast }) {
  // Data state
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search, filter & sort state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [usageFilter, setUsageFilter] = useState('all'); // all | in_use | unused
  const [sortBy, setSortBy] = useState('articles_desc'); // articles_desc | name_asc | name_desc | updated_desc

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modal / Form state (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  // Merge modal state
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [sourceTagId, setSourceTagId] = useState('');
  const [targetTagId, setTargetTagId] = useState('');
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await TaxonomyService.getAdminTags();
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load tags');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = tags.length;
    const active = tags.filter(t => t.isActive !== false).length;
    const inUse = tags.filter(t => (t.articlesCount || t.count || 0) > 0).length;
    const unused = total - inUse;
    const totalAssignments = tags.reduce((sum, t) => sum + (t.articlesCount || t.count || 0), 0);
    return { total, active, inUse, unused, totalAssignments };
  }, [tags]);

  // Open Create
  const openCreateModal = () => {
    setEditingTag(null);
    setIsSlugManuallyEdited(false);
    setFormErrors({});
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Open Edit
  const openEditModal = (tag) => {
    setEditingTag(tag);
    setIsSlugManuallyEdited(true);
    setFormErrors({});
    setFormData({
      name: tag.name || '',
      slug: tag.slug || '',
      description: tag.description || '',
      isActive: tag.isActive !== false
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
      slug: newSlug
    }));

    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
  };

  const handleSlugChange = (val) => {
    setIsSlugManuallyEdited(true);
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug: clean }));
    if (formErrors.slug) setFormErrors(prev => ({ ...prev, slug: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Tag name is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    } else {
      const duplicate = tags.find(t => 
        t.slug === formData.slug && (!editingTag || (t._id !== editingTag._id && t.slug !== editingTag.slug))
      );
      if (duplicate) {
        errors.slug = `Slug "${formData.slug}" is already in use by tag "${duplicate.name}"`;
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
        name: formData.name.trim().replace(/^#/, ''),
        slug: formData.slug.trim()
      };

      if (editingTag) {
        const id = editingTag._id || editingTag.slug;
        await TaxonomyService.updateTag(id, payload);
        onShowToast?.(`Tag #${payload.name} updated successfully!`);
      } else {
        await TaxonomyService.createTag(payload);
        onShowToast?.(`Tag #${payload.name} created successfully!`);
      }
      setIsModalOpen(false);
      loadTags();
    } catch (err) {
      console.error(err);
      setFormErrors(prev => ({ ...prev, submit: err.message || 'Error saving tag' }));
    } finally {
      setSaving(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (tag) => {
    const newStatus = tag.isActive === false ? true : false;
    const id = tag._id || tag.slug;
    try {
      await TaxonomyService.updateTag(id, { isActive: newStatus });
      onShowToast?.(`Tag #${tag.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
      setTags(prev => prev.map(t => (t._id === id || t.slug === id) ? { ...t, isActive: newStatus } : t));
    } catch (err) {
      alert(err.message || 'Failed to update tag status');
    }
  };

  // Merge modal
  const openMergeModal = (tag = null) => {
    setSourceTagId(tag ? (tag._id || tag.slug) : '');
    setTargetTagId('');
    setMergeError(null);
    setMergeModalOpen(true);
  };

  const handleExecuteMerge = async (e) => {
    e.preventDefault();
    if (!sourceTagId || !targetTagId) {
      setMergeError('Please select both a source tag and a target tag.');
      return;
    }
    if (sourceTagId === targetTagId) {
      setMergeError('Source tag and Target tag must be different.');
      return;
    }

    setMerging(true);
    setMergeError(null);
    try {
      const res = await TaxonomyService.mergeTags(sourceTagId, targetTagId);
      onShowToast?.(res.message || 'Tags merged successfully!');
      setMergeModalOpen(false);
      loadTags();
    } catch (err) {
      setMergeError(err.message || 'Failed to merge tags');
    } finally {
      setMerging(false);
    }
  };

  // Clean Unused Tags
  const handleCleanUnused = async () => {
    if (stats.unused === 0) {
      alert('All tags are currently in use! No unused tags to clean.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete all ${stats.unused} unused tags (0 associated articles)?`)) return;

    try {
      const res = await TaxonomyService.deleteUnusedTags();
      onShowToast?.(res.message || 'Unused tags cleaned up successfully');
      loadTags();
    } catch (err) {
      alert(err.message || 'Failed to clean unused tags');
    }
  };

  // Prompt single delete
  const handlePromptDelete = async (tag) => {
    setTagToDelete(tag);
    setUsageData(null);
    setDeleteModalOpen(true);
    setLoadingUsage(true);

    try {
      const id = tag._id || tag.slug;
      const usage = await TaxonomyService.getTagUsage(id);
      setUsageData(usage);
    } catch (err) {
      setUsageData({
        publishedCount: tag.articlesCount || tag.count || 0,
        draftCount: 0,
        totalCount: tag.articlesCount || tag.count || 0,
        recentArticles: []
      });
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;
    setDeleting(true);
    try {
      const id = tagToDelete._id || tagToDelete.slug;
      await TaxonomyService.deleteTag(id, true);
      onShowToast?.(`Tag #${tagToDelete.name} deleted successfully.`);
      setDeleteModalOpen(false);
      setTagToDelete(null);
      loadTags();
    } catch (err) {
      alert(err.message || 'Failed to delete tag');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected tags? Articles will be safely detached.`)) return;

    setBulkProcessing(true);
    try {
      await TaxonomyService.bulkDeleteTags(Array.from(selectedIds));
      onShowToast?.(`Deleted ${count} tags successfully`);
      setSelectedIds(new Set());
      loadTags();
    } catch (err) {
      alert('Error during bulk delete: ' + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    let result = tags.filter(t => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.isActive !== false) ||
        (statusFilter === 'inactive' && t.isActive === false);

      const count = t.articlesCount || t.count || 0;
      const matchesUsage =
        usageFilter === 'all' ||
        (usageFilter === 'in_use' && count > 0) ||
        (usageFilter === 'unused' && count === 0);

      return matchesSearch && matchesStatus && matchesUsage;
    });

    result.sort((a, b) => {
      const aCount = a.articlesCount || a.count || 0;
      const bCount = b.articlesCount || b.count || 0;

      if (sortBy === 'articles_desc') return bCount - aCount;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'updated_desc') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      return 0;
    });

    return result;
  }, [tags, search, statusFilter, usageFilter, sortBy]);

  // Paginated slice
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedTags = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  return (
    <div className="admin-page-container">
      
      {/* ── Breadcrumb & Top Header ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500 }}>
          <span>Editorial CMS</span>
          <ChevronRight size={13} />
          <span>Taxonomy & Entities</span>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--brand-primary, #dc2626)', fontWeight: 600 }}>Tags</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TagIcon size={26} color="var(--brand-primary, #dc2626)" />
              Tags
            </h1>
            <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
              Manage keywords that help readers discover related content.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => openMergeModal()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.65rem 0.95rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '9px',
                color: '#475569',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Merge duplicate tags into a single tag"
            >
              <GitMerge size={15} color="#2563eb" />
              <span>Merge Duplicates</span>
            </button>

            <button
              type="button"
              onClick={handleCleanUnused}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.65rem 0.95rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '9px',
                color: '#475569',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Delete all tags with 0 associated articles"
            >
              <Trash2 size={15} color="#dc2626" />
              <span>Clean Unused ({stats.unused})</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.35rem',
                backgroundColor: 'var(--brand-primary, #dc2626)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.28)'
              }}
            >
              <Plus size={17} />
              <span>+ Add Tag</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Stats Strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ background: '#ffffff', padding: '0.9rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}>
            <TagIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.total}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Total Keywords</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.9rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{stats.inUse}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>In Active Use</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.9rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{stats.totalAssignments}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Article Attachments</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.9rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706', lineHeight: 1 }}>{stats.unused}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Unused Tags (0 Uses)</div>
          </div>
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
            placeholder="Search tags by keyword or slug..." 
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

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Usage Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Usage:</span>
            <select
              value={usageFilter}
              onChange={(e) => {
                setUsageFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Tags</option>
              <option value="in_use">In Active Use ({stats.inUse})</option>
              <option value="unused">Unused (0 Articles) ({stats.unused})</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="articles_desc">Most Associated Articles</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="updated_desc">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Bulk Actions Bar ── */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          padding: '10px 16px',
          borderRadius: '10px',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}>
              {selectedIds.size} Selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set(filteredAndSorted.map(t => t._id || t.slug)))}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'underline' }}
            >
              Select All ({filteredAndSorted.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
            >
              Clear Selection
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                backgroundColor: '#dc2626',
                border: 'none',
                borderRadius: '7px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
              {bulkProcessing ? 'Processing...' : `Delete Selected (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}

      {/* ── Tags Table Card ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ width: '42px', padding: '0.85rem 0.95rem' }}>
                  <input 
                    type="checkbox"
                    checked={paginatedTags.length > 0 && paginatedTags.every(t => selectedIds.has(t._id || t.slug))}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) {
                        paginatedTags.forEach(t => next.add(t._id || t.slug));
                      } else {
                        paginatedTags.forEach(t => next.delete(t._id || t.slug));
                      }
                      setSelectedIds(next);
                    }}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Tag Name &amp; Keyword
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  URL Slug
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'center' }}>
                  Associated Articles
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
                  <td colSpan="7" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={26} className="rotate-icon" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem', color: 'var(--brand-primary)' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading tags index...</div>
                  </td>
                </tr>
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                      <TagIcon size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                      {search ? 'No tags matched your search' : 'No editorial tags created'}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
                      {search ? `Try clearing your search term "${search}".` : 'Add keywords like #AI, #Funding, or #Blinkit to connect related content.'}
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
                        onClick={openCreateModal}
                        style={{ padding: '0.65rem 1.35rem', background: 'var(--brand-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                      >
                        + Add First Tag
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedTags.map((tag) => {
                  const id = tag._id || tag.slug;
                  const isSelected = selectedIds.has(id);
                  const count = tag.articlesCount || tag.count || 0;
                  const isActive = tag.isActive !== false;
                  const formattedDate = tag.updatedAt 
                    ? new Date(tag.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'System Tag';

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

                      {/* Tag Name */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f1f5f9',
                            color: '#0f172a',
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.88rem'
                          }}>
                            <span style={{ color: 'var(--brand-primary)' }}>#</span>
                            <span>{tag.name}</span>
                          </span>
                          {tag.description && (
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              ({tag.description})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Slug */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <a
                          href={`/tag/${tag.slug}`}
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
                          title="Click to view public tag archive"
                        >
                          <span>/tag/{tag.slug}</span>
                          <ExternalLink size={11} />
                        </a>
                      </td>

                      {/* Associated Articles Count */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3px 9px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: count > 0 ? '#eff6ff' : '#f1f5f9',
                          color: count > 0 ? '#1d4ed8' : '#94a3b8',
                          border: `1px solid ${count > 0 ? '#bfdbfe' : '#e2e8f0'}`
                        }}>
                          {count}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tag)}
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
                            onClick={() => openEditModal(tag)}
                            title="Edit Tag"
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

                          <button
                            type="button"
                            onClick={() => openMergeModal(tag)}
                            title="Merge this tag into another"
                            style={{
                              padding: '6px',
                              background: '#eff6ff',
                              border: '1px solid #dbeafe',
                              borderRadius: '7px',
                              color: '#2563eb',
                              cursor: 'pointer'
                            }}
                          >
                            <GitMerge size={14} />
                          </button>

                          <a
                            href={`/tag/${tag.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Preview Tag Archive"
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
                            <Eye size={14} />
                          </a>

                          <button
                            type="button"
                            onClick={() => handlePromptDelete(tag)}
                            title="Delete Tag"
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

        {/* ── Table Footer & Pagination ── */}
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
            Showing <strong>{filteredAndSorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to <strong>{Math.min(currentPage * pageSize, filteredAndSorted.length)}</strong> of <strong>{filteredAndSorted.length}</strong> tags
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  background: '#ffffff'
                }}
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                  color: currentPage === 1 ? '#94a3b8' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, padding: '0 4px' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                  color: currentPage === totalPages ? '#94a3b8' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT TAG MODAL ── */}
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
            maxWidth: '520px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
            overflow: 'hidden'
          }}>
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
                  {editingTag ? `Edit Tag: #${editingTag.name}` : 'Create New Keyword Tag'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Define keyword chip for story discoverability and search indexing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {formErrors.submit && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {formErrors.submit}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Tag Keyword Name *
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '0.65rem 0.75rem', fontSize: '0.9rem', color: 'var(--brand-primary)', fontWeight: 800 }}>
                    #
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Funding"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0 8px 8px 0',
                      border: `1px solid ${formErrors.name ? '#ef4444' : '#cbd5e1'}`,
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
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
                    /tag/
                  </span>
                  <input
                    type="text"
                    placeholder="funding"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Contextual note or descriptor for editors"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'flex',
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
                    Active Tag (Selectable in Article Editor)
                  </span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
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
                  {saving ? 'Saving...' : editingTag ? 'Save Changes' : 'Create Tag'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── MERGE DUPLICATE TAGS MODAL ── */}
      {mergeModalOpen && (
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
            maxWidth: '540px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitMerge size={17} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Merge Duplicate Tags
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Consolidate duplicate keywords into a canonical tag
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMergeModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleExecuteMerge} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {mergeError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{mergeError}</span>
                </div>
              )}

              <div style={{
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '12px 14px',
                borderRadius: '9px',
                fontSize: '0.82rem',
                color: '#1e40af',
                lineHeight: 1.5
              }}>
                <strong>How merge works:</strong> All articles currently tagged with <em>Source Tag</em> will be automatically re-assigned to <em>Target Tag</em>. The <em>Source Tag</em> will then be permanently deleted.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  1. Source Tag (Will be absorbed &amp; deleted) *
                </label>
                <select
                  value={sourceTagId}
                  onChange={(e) => setSourceTagId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="">Select source tag to absorb...</option>
                  {tags.map(t => (
                    <option key={t._id || t.slug} value={t._id || t.slug}>
                      #{t.name} ({t.articlesCount || t.count || 0} articles)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  2. Target Canonical Tag (Will keep all articles) *
                </label>
                <select
                  value={targetTagId}
                  onChange={(e) => setTargetTagId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="">Select target canonical tag to keep...</option>
                  {tags
                    .filter(t => (t._id || t.slug) !== sourceTagId)
                    .map(t => (
                      <option key={t._id || t.slug} value={t._id || t.slug}>
                        #{t.name} ({t.articlesCount || t.count || 0} articles)
                      </option>
                    ))}
                </select>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setMergeModalOpen(false)}
                  disabled={merging}
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
                  disabled={merging}
                  style={{
                    padding: '0.65rem 1.45rem',
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {merging ? 'Merging Tags...' : 'Confirm & Merge Tags'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── DELETE & USAGE MODAL ── */}
      {deleteModalOpen && tagToDelete && (
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
                Delete Tag "#{tagToDelete.name}"?
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
                        <span>Tag is attached to {usageData.totalCount} article(s)</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#881337', margin: 0, lineHeight: 1.5 }}>
                        Deleting this tag will detach it from all {usageData.totalCount} article(s). The articles themselves will <strong>not</strong> be deleted.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem' }}>
                      This tag has <strong>0 associated articles</strong>. It is safe to delete.
                    </p>
                  )}

                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Are you sure you want to permanently delete this tag?
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
