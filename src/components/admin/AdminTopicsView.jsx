import React, { useState, useEffect, useMemo } from 'react';
import { 
  Hash, Plus, Edit2, Trash2, Search, ExternalLink, RefreshCw, 
  AlertCircle, AlertTriangle, CheckCircle, Check, X, Globe, 
  ChevronRight, FileText, CheckSquare, Layers, Eye, EyeOff
} from 'lucide-react';
import { TaxonomyService } from '../../services/taxonomyService';

export default function AdminTopicsView({ onShowToast }) {
  // Data state
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search, filter & sort state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc'); // name_asc | name_desc | articles_desc | updated_desc

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    categoryIds: [],
    seoTitle: '',
    seoDescription: '',
    isActive: true
  });

  // Delete & Usage state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [topicsData, catsData] = await Promise.all([
        TaxonomyService.getAdminTopics(),
        TaxonomyService.getCategories()
      ]);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load topics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = topics.length;
    const active = topics.filter(t => t.isActive !== false).length;
    const inactive = total - active;
    const totalArticles = topics.reduce((sum, t) => sum + (t.publishedArticlesCount || 0), 0);
    return { total, active, inactive, totalArticles };
  }, [topics]);

  // Open Create
  const openCreateModal = () => {
    setEditingTopic(null);
    setIsSlugManuallyEdited(false);
    setFormErrors({});
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      categoryIds: [],
      seoTitle: '',
      seoDescription: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Open Edit
  const openEditModal = (top) => {
    setEditingTopic(top);
    setIsSlugManuallyEdited(true);
    setFormErrors({});

    const catIds = Array.isArray(top.categoryIds) 
      ? top.categoryIds.map(c => typeof c === 'object' && c?._id ? c._id : c)
      : [];

    setFormData({
      name: top.name || '',
      slug: top.slug || '',
      description: top.description || '',
      image: top.image || '',
      categoryIds: catIds,
      seoTitle: top.seoTitle || '',
      seoDescription: top.seoDescription || '',
      isActive: top.isActive !== false
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
      seoTitle: prev.seoTitle || (val ? `${val} - GoReadPost Topics` : '')
    }));

    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
  };

  const handleSlugChange = (val) => {
    setIsSlugManuallyEdited(true);
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug: clean }));
    if (formErrors.slug) setFormErrors(prev => ({ ...prev, slug: null }));
  };

  const toggleCategorySelection = (catId) => {
    setFormData(prev => {
      const exists = prev.categoryIds.includes(catId);
      return {
        ...prev,
        categoryIds: exists 
          ? prev.categoryIds.filter(id => id !== catId)
          : [...prev.categoryIds, catId]
      };
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Topic name is required';
    if (!formData.slug.trim()) errors.slug = 'URL slug is required';
    else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    } else {
      const duplicate = topics.find(t => 
        t.slug === formData.slug && (!editingTopic || (t._id !== editingTopic._id && t.slug !== editingTopic.slug))
      );
      if (duplicate) {
        errors.slug = `Slug "${formData.slug}" is already in use by topic "${duplicate.name}"`;
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
        slug: formData.slug.trim()
      };

      if (editingTopic) {
        const id = editingTopic._id || editingTopic.slug;
        await TaxonomyService.updateTopic(id, payload);
        onShowToast?.(`Topic "${payload.name}" updated successfully!`);
      } else {
        await TaxonomyService.createTopic(payload);
        onShowToast?.(`Topic "${payload.name}" created successfully!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      setFormErrors(prev => ({ ...prev, submit: err.message || 'Error saving topic' }));
    } finally {
      setSaving(false);
    }
  };

  // Toggle active/inactive
  const handleToggleStatus = async (top) => {
    const newStatus = top.isActive === false ? true : false;
    const id = top._id || top.slug;
    try {
      await TaxonomyService.updateTopic(id, { isActive: newStatus });
      onShowToast?.(`Topic "${top.name}" is now ${newStatus ? 'Active' : 'Inactive'}`);
      setTopics(prev => prev.map(t => (t._id === id || t.slug === id) ? { ...t, isActive: newStatus } : t));
    } catch (err) {
      alert(err.message || 'Failed to update topic status');
    }
  };

  // Prompt delete
  const handlePromptDelete = async (top) => {
    setTopicToDelete(top);
    setUsageData(null);
    setDeleteModalOpen(true);
    setLoadingUsage(true);

    try {
      const id = top._id || top.slug;
      const usage = await TaxonomyService.getTopicUsage(id);
      setUsageData(usage);
    } catch (err) {
      setUsageData({
        publishedCount: top.publishedArticlesCount || 0,
        draftCount: top.draftArticlesCount || 0,
        totalCount: (top.publishedArticlesCount || 0) + (top.draftArticlesCount || 0),
        recentArticles: []
      });
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!topicToDelete) return;
    setDeleting(true);
    try {
      const id = topicToDelete._id || topicToDelete.slug;
      await TaxonomyService.deleteTopic(id, true);
      onShowToast?.(`Topic "${topicToDelete.name}" deleted.`);
      setDeleteModalOpen(false);
      setTopicToDelete(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete topic');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected topics? Articles will remain untouched.`)) return;

    setBulkProcessing(true);
    try {
      await TaxonomyService.bulkDeleteTopics(Array.from(selectedIds));
      onShowToast?.(`Deleted ${count} topics successfully`);
      setSelectedIds(new Set());
      loadData();
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
        await TaxonomyService.updateTopic(id, { isActive });
      }
      onShowToast?.(`Updated status for ${selectedIds.size} topics`);
      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      alert('Error updating topics: ' + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    let result = topics.filter(t => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.isActive !== false) ||
        (statusFilter === 'inactive' && t.isActive === false);

      const matchesCategory =
        categoryFilter === 'all' ||
        (Array.isArray(t.categoryIds) && t.categoryIds.some(c => {
          const id = typeof c === 'object' && c?._id ? c._id : c;
          const slug = typeof c === 'object' && c?.slug ? c.slug : '';
          return id === categoryFilter || slug === categoryFilter;
        }));

      return matchesSearch && matchesStatus && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'articles_desc') return (b.publishedArticlesCount || 0) - (a.publishedArticlesCount || 0);
      if (sortBy === 'updated_desc') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      return 0;
    });

    return result;
  }, [topics, search, statusFilter, categoryFilter, sortBy]);

  // Paginated slice
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedTopics = useMemo(() => {
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
          <span style={{ color: 'var(--brand-primary, #e11d48)', fontWeight: 600 }}>Topics</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hash size={26} color="var(--brand-primary, #e11d48)" />
              Topics
            </h1>
            <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
              Organize articles around subjects readers want to explore.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Refresh Topics Data"
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
            >
              <RefreshCw size={15} className={refreshing ? 'rotate-icon' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.35rem',
                backgroundColor: 'var(--brand-primary, #e11d48)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.28)'
              }}
            >
              <Plus size={17} />
              <span>+ Add Topic</span>
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
            <Hash size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.total}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Total Topics</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.9rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{stats.active}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Active Subjects</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.9rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{stats.totalArticles}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Published Stories</div>
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
            placeholder="Search topics by subject name or slug..." 
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
          {/* Associated Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
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
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c._id || c.slug} value={c._id || c.slug}>{c.name}</option>
              ))}
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

          {/* Sort Filter */}
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
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="articles_desc">Most Published Articles</option>
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
              backgroundColor: '#e11d48',
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
              style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'underline' }}
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
              onClick={() => handleBulkStatus(true)}
              disabled={bulkProcessing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                background: '#ffffff',
                border: '1px solid #10b981',
                borderRadius: '7px',
                color: '#047857',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Check size={14} /> Set Active
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus(false)}
              disabled={bulkProcessing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <EyeOff size={14} /> Set Inactive
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                backgroundColor: '#e11d48',
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

      {/* ── Topics Table Card ── */}
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
                <th style={{ width: '42px', padding: '0.85rem 0.95rem' }}>
                  <input 
                    type="checkbox"
                    checked={paginatedTopics.length > 0 && paginatedTopics.every(t => selectedIds.has(t._id || t.slug))}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) {
                        paginatedTopics.forEach(t => next.add(t._id || t.slug));
                      } else {
                        paginatedTopics.forEach(t => next.delete(t._id || t.slug));
                      }
                      setSelectedIds(next);
                    }}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Topic Name &amp; Description
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  URL Slug
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Associated Categories
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', textAlign: 'center' }}>
                  Published Articles
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
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading topics catalog...</div>
                  </td>
                </tr>
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                      <Hash size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                      {search ? 'No topics matched your search' : 'No editorial topics created'}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
                      {search ? `Try clearing your search term "${search}".` : 'Create subjects like OpenAI, Quick Commerce, or Electric Vehicles to group related stories.'}
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
                        + Add First Topic
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedTopics.map((top) => {
                  const id = top._id || top.slug;
                  const isSelected = selectedIds.has(id);
                  const publishedCount = top.publishedArticlesCount || 0;
                  const isActive = top.isActive !== false;
                  const formattedDate = top.updatedAt 
                    ? new Date(top.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Active Topic';

                  // Categories associated
                  const associatedCats = Array.isArray(top.categoryIds) 
                    ? top.categoryIds.map(c => typeof c === 'object' && c?.name ? c.name : (categories.find(cat => cat._id === c || cat.slug === c)?.name)).filter(Boolean)
                    : [];

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

                      {/* Name & Description */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: top.image ? `url(${top.image}) center/cover no-repeat` : '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--brand-primary)',
                            flexShrink: 0
                          }}>
                            {!top.image && <Hash size={18} />}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>{top.name}</strong>
                            {top.description && (
                              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {top.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* URL Slug */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <a
                          href={`/topic/${top.slug}`}
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
                          title="Click to view public topic archive"
                        >
                          <span>/topic/{top.slug}</span>
                          <ExternalLink size={11} />
                        </a>
                      </td>

                      {/* Associated Categories */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                          {associatedCats.length > 0 ? (
                            associatedCats.map((cn, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  color: '#475569',
                                  fontWeight: 600
                                }}
                              >
                                {cn}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Universal (All)</span>
                          )}
                        </div>
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

                      {/* Status Toggle */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(top)}
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
                            onClick={() => openEditModal(top)}
                            title="Edit Topic"
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
                            href={`/topic/${top.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Preview Topic Archive"
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
                            onClick={() => handlePromptDelete(top)}
                            title="Delete Topic"
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
            Showing <strong>{filteredAndSorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to <strong>{Math.min(currentPage * pageSize, filteredAndSorted.length)}</strong> of <strong>{filteredAndSorted.length}</strong> topics
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
                <option value={10}>10</option>
                <option value={25}>25</option>
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

      {/* ── CREATE / EDIT TOPIC MODAL ── */}
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
            {/* Header */}
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
                  {editingTopic ? `Edit Topic: ${editingTopic.name}` : 'Create New Topic'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Create curated subjects and connect them with relevant publication categories
                </p>
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

            {/* Form Body */}
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
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Generative AI"
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
                      /topic/
                    </span>
                    <input
                      type="text"
                      placeholder="generative-ai"
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

              {/* Row 2: Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Topic Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Overview of this topic displayed at the top of the topic page..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Row 3: Associated Categories (Multi-Select Chips) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Associated Categories (Click to toggle)
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  background: '#f8fafc',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  maxHeight: '140px',
                  overflowY: 'auto'
                }}>
                  {categories.map(cat => {
                    const id = cat._id || cat.slug;
                    const isSelected = formData.categoryIds.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleCategorySelection(id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 11px',
                          borderRadius: '20px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: `1px solid ${isSelected ? 'var(--brand-primary)' : '#cbd5e1'}`,
                          background: isSelected ? '#fff1f2' : '#ffffff',
                          color: isSelected ? 'var(--brand-primary)' : '#475569',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Selected: {formData.categoryIds.length === 0 ? 'Universal (All Categories)' : `${formData.categoryIds.length} categories`}
                </span>
              </div>

              {/* Row 4: Image & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Featured Header / Hero Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
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
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Status
                  </label>
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
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 5: SEO Meta */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                  <Globe size={16} color="var(--brand-primary)" />
                  <span>Topic Search Engine Metadata (SEO)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      SEO Meta Title ({formData.seoTitle.length}/60 chars)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stories & News about Artificial Intelligence | GoReadPost"
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
                      placeholder="Search engine summary snippet for this topic..."
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
                    background: 'var(--brand-primary, #e11d48)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
                  }}
                >
                  {saving ? 'Saving...' : editingTopic ? 'Save Changes' : 'Create Topic'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── DELETE & USAGE MODAL ── */}
      {deleteModalOpen && topicToDelete && (
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
                Delete Topic "{topicToDelete.name}"?
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#be123c', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px' }}>
                        <AlertCircle size={16} />
                        <span>Topic is associated with {usageData.totalCount} article(s)</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#881337', margin: 0, lineHeight: 1.5 }}>
                        Deleting this topic will detach it from existing articles. The articles themselves will <strong>not</strong> be deleted.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem' }}>
                      This topic currently has <strong>0 associated articles</strong>. It is safe to delete.
                    </p>
                  )}

                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Are you sure you want to permanently delete this topic?
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
