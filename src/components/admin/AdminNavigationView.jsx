import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, 
  ArrowUp, ArrowDown, RefreshCw, X, Link as LinkIcon,
  ChevronDown, ChevronUp, ExternalLink, Sparkles, Check,
  Search, Layers, Folder, FolderPlus, Copy, GripVertical,
  Info, Home, FileText, Database, Briefcase, Rocket,
  Users, Mail, Video, TrendingUp, Compass, Cpu, Flame, Building2
} from 'lucide-react';
import { NavigationService } from '../../services/navigationService';
import { useNavigation } from '../../context/NavigationContext';

export default function AdminNavigationView({ onShowToast }) {
  const { refreshNavigation } = useNavigation();

  // Navigation Data
  const [flatItems, setFlatItems] = useState([]);
  const [treeItems, setTreeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Type Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Expanded Items set
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Taxonomy for easy selection
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [pages, setPages] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [inheritParentPath, setInheritParentPath] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    url: '',
    type: 'link',
    parentId: null,
    description: '',
    order: 1,
    isActive: true,
    openInNewTab: false
  });

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load Initial Data
  useEffect(() => {
    loadNavigation();
    loadTaxonomies();
  }, []);

  const loadNavigation = async () => {
    setLoading(true);
    try {
      const res = await NavigationService.getAdminNavigation();
      if (res) {
        setFlatItems(res.flat || []);
        setTreeItems(res.tree || []);
      }
    } catch (err) {
      console.error('Error loading navigation:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTaxonomies = async () => {
    try {
      const [catsRes, topicsRes, pagesRes] = await Promise.all([
        fetch('/api/categories').then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
        fetch('/api/topics').then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
        fetch('/api/pages').then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      setCategories(catsRes.data || []);
      setTopics(topicsRes.data || []);
      setPages(Array.isArray(pagesRes) ? pagesRes : (pagesRes.data || []));
    } catch (e) {
      console.warn('Failed to load taxonomy selectors:', e);
    }
  };

  // Toggle Expanded state for dropdowns
  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter root items
  const filteredRoots = useMemo(() => {
    return treeItems.filter(root => {
      // Type filter
      if (typeFilter !== 'ALL') {
        const rootType = (root.type || 'link').toLowerCase();
        if (rootType !== typeFilter.toLowerCase()) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRoot = 
          (root.title && root.title.toLowerCase().includes(q)) ||
          (root.slug && root.slug.toLowerCase().includes(q)) ||
          (root.url && root.url.toLowerCase().includes(q));
        
        const matchesChild = (items) => {
          if (!items || !items.length) return false;
          return items.some(item => 
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.url && item.url.toLowerCase().includes(q)) ||
            matchesChild(item.children)
          );
        };

        if (!matchesRoot && !matchesChild(root.children)) return false;
      }
      return true;
    });
  }, [treeItems, typeFilter, searchQuery]);

  // Parent Options for Modal
  const parentOptions = useMemo(() => {
    return flatItems.filter(i => {
      if (editingItem && String(i._id) === String(editingItem._id)) return false;
      return true;
    });
  }, [flatItems, editingItem]);

  // Parent Item Context for Modal
  const parentItem = useMemo(() => {
    if (!formData.parentId) return null;
    return flatItems.find(i => String(i._id) === String(formData.parentId)) || null;
  }, [formData.parentId, flatItems]);

  const parentBase = useMemo(() => {
    if (!parentItem) return '';
    if (parentItem.url && parentItem.url !== '#' && parentItem.url.startsWith('/')) {
      return parentItem.url.replace(/\/+$/, '');
    }
    return `/${parentItem.slug || ''}`.replace(/\/+$/, '');
  }, [parentItem]);

  // Open Add Modal
  const handleOpenAdd = (parentId = null, presetType = 'link') => {
    setEditingItem(null);
    const siblings = flatItems.filter(i => String(i.parentId || '') === String(parentId || ''));
    const isSpecialType = presetType === 'external' || presetType === 'custom';
    setInheritParentPath(Boolean(parentId && !isSpecialType));
    setFormData({
      title: '',
      slug: '',
      url: '',
      type: presetType,
      parentId: parentId || null,
      description: '',
      order: siblings.length + 1,
      isActive: true,
      openInNewTab: false
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const itemUrl = (item.url && item.url !== '#') ? item.url : (item.slug ? `/${item.slug}` : '');
    
    // Check if item inherits parent path
    let shouldInherit = false;
    if (item.parentId) {
      const parent = flatItems.find(i => String(i._id) === String(item.parentId));
      if (parent) {
        const pBase = (parent.url && parent.url !== '#' && parent.url.startsWith('/'))
          ? parent.url.replace(/\/+$/, '')
          : `/${parent.slug || ''}`.replace(/\/+$/, '');
        if (pBase && itemUrl.startsWith(`${pBase}/`) && item.type !== 'external' && item.type !== 'custom') {
          shouldInherit = true;
        }
      }
    }
    setInheritParentPath(shouldInherit);

    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      url: itemUrl,
      type: item.type || 'link',
      parentId: item.parentId || null,
      description: item.description || '',
      order: item.order || 1,
      isActive: item.isActive !== false,
      openInNewTab: Boolean(item.openInNewTab)
    });
    setIsModalOpen(true);
  };

  // Duplicate Item
  const handleDuplicate = async (item) => {
    try {
      await NavigationService.duplicateNavigationItem(item._id);
      if (onShowToast) onShowToast(`Duplicated "${item.title}"`);
      await loadNavigation();
      refreshNavigation();
    } catch (err) {
      alert('Failed to duplicate: ' + err.message);
    }
  };

  // Auto-generate slug and URL from title
  const handleTitleChange = (val) => {
    const slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    setFormData(prev => {
      // Check if user has already entered a custom or external URL
      const hasCustomUrl = prev.url && (
        prev.url.startsWith('http://') || 
        prev.url.startsWith('https://') || 
        prev.type === 'external' || 
        prev.type === 'custom' || 
        (!inheritParentPath && prev.url !== '' && prev.url !== '#')
      );

      let computedUrl = prev.url;
      if (!hasCustomUrl) {
        if (prev.type === 'category') {
          computedUrl = slug ? `/category/${slug}` : '';
        } else if (prev.type === 'topic') {
          computedUrl = slug ? `/topic/${slug}` : '';
        } else if (parentItem && inheritParentPath) {
          computedUrl = slug ? `${parentBase}/${slug}` : parentBase;
        } else {
          computedUrl = slug ? `/${slug}` : '';
        }
      }

      return {
        ...prev,
        title: val,
        slug: prev.slug || slug,
        url: computedUrl
      };
    });
  };

  // Change type and sync URL
  const handleTypeChange = (newType) => {
    setFormData(prev => {
      const slug = (prev.slug || '').trim() || prev.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let computedUrl = prev.url;

      if (newType === 'category') {
        computedUrl = slug ? `/category/${slug}` : '/category/';
      } else if (newType === 'topic') {
        computedUrl = slug ? `/topic/${slug}` : '/topic/';
      } else if (newType === 'page') {
        computedUrl = slug ? `/${slug}` : '/';
      } else if (newType === 'external' || newType === 'custom') {
        setInheritParentPath(false);
        if (!computedUrl || computedUrl.startsWith('/category/') || computedUrl.startsWith('/topic/')) {
          computedUrl = slug ? `/${slug}` : '/';
        }
      } else if (parentItem && inheritParentPath) {
        computedUrl = slug ? `${parentBase}/${slug}` : parentBase;
      } else {
        computedUrl = slug ? `/${slug}` : (prev.url && prev.url !== '#' ? prev.url : '/');
      }

      return {
        ...prev,
        type: newType,
        url: computedUrl
      };
    });
  };

  // Direct URL change for landing pages, custom URLs, external links, etc.
  const handleUrlChange = (val) => {
    setFormData(prev => ({
      ...prev,
      url: val
    }));
  };

  // Change slug directly
  const handleSlugChange = (val) => {
    const raw = val.trim();
    let cleanSlug = raw.toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
    setFormData(prev => {
      let computedUrl = prev.url;
      if (inheritParentPath && parentItem) {
        computedUrl = cleanSlug ? `${parentBase}/${cleanSlug}` : parentBase;
      }
      return {
        ...prev,
        slug: cleanSlug,
        url: computedUrl
      };
    });
  };

  // Toggle inheriting parent URL path
  const handleToggleInheritParent = (checked) => {
    setInheritParentPath(checked);
    if (!parentItem) return;

    const currentSlug = formData.slug || formData.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (checked) {
      // Append parent path prefix
      const relativePart = (formData.url || '').replace(new RegExp(`^${parentBase}/?`), '').replace(/^\/+/, '');
      const slugToUse = relativePart || currentSlug;
      setFormData(prev => ({
        ...prev,
        url: slugToUse ? `${parentBase}/${slugToUse}` : parentBase
      }));
    } else {
      // Detach from parent path so it points directly to any landing page or custom URL
      let detached = (formData.url || '').replace(new RegExp(`^${parentBase}/?`), '');
      if (detached && !detached.startsWith('/') && !detached.startsWith('http')) {
        detached = `/${detached}`;
      }
      setFormData(prev => ({
        ...prev,
        url: detached || (currentSlug ? `/${currentSlug}` : '/')
      }));
    }
  };

  // Save (Create or Update)
  const handleSaveItem = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a menu name.');
      return;
    }

    setSaving(true);
    try {
      const fallbackSlug = formData.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'menu-item';
      const cleanSlug = formData.slug?.trim() || fallbackSlug;
      let finalUrl = (formData.url || '').trim();

      if (!finalUrl || finalUrl === '#') {
        if (formData.type === 'category') {
          finalUrl = `/category/${cleanSlug}`;
        } else if (formData.type === 'topic') {
          finalUrl = `/topic/${cleanSlug}`;
        } else if (parentItem && inheritParentPath) {
          finalUrl = `${parentBase}/${cleanSlug}`;
        } else {
          finalUrl = `/${cleanSlug}`;
        }
      } else {
        // If not starting with protocol or slash or hash
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('/') && !finalUrl.startsWith('#') && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:')) {
          finalUrl = `/${finalUrl}`;
        }
      }

      const payload = {
        title: formData.title.trim(),
        slug: cleanSlug,
        url: finalUrl,
        type: formData.type || 'link',
        parentId: formData.parentId || null,
        order: formData.order || 1,
        isActive: formData.isActive !== false,
        openInNewTab: Boolean(formData.openInNewTab)
      };

      if (editingItem) {
        await NavigationService.updateNavigationItem(editingItem._id, payload);
        if (Number(editingItem.order) !== Number(formData.order)) {
          const siblings = flatItems
            .filter(i => String(i.parentId || '') === String(formData.parentId || '') && String(i._id) !== String(editingItem._id))
            .sort((a, b) => ((Number(a.order) || 0) - (Number(b.order) || 0)) || (a.title || '').localeCompare(b.title || ''));
          const insertIdx = Math.max(0, Math.min((Number(formData.order) || 1) - 1, siblings.length));
          siblings.splice(insertIdx, 0, { _id: editingItem._id, order: Number(formData.order) || 1 });
          const reordered = siblings.map((s, idx) => ({ id: s._id, order: idx + 1 }));
          await NavigationService.reorderNavigation(reordered);
        }
        if (onShowToast) onShowToast(`Updated "${payload.title}"`);
      } else {
        const created = await NavigationService.createNavigationItem(payload);
        if (formData.order && Number(formData.order) > 0) {
          const siblings = flatItems
            .filter(i => String(i.parentId || '') === String(formData.parentId || ''))
            .sort((a, b) => ((Number(a.order) || 0) - (Number(b.order) || 0)) || (a.title || '').localeCompare(b.title || ''));
          const insertIdx = Math.max(0, Math.min((Number(formData.order) || 1) - 1, siblings.length));
          siblings.splice(insertIdx, 0, created || { _id: payload.slug, order: Number(formData.order) });
          const reordered = siblings.map((s, idx) => ({ id: s._id, order: idx + 1 }));
          await NavigationService.reorderNavigation(reordered);
        }
        if (onShowToast) onShowToast(`Added "${payload.title}"`);
      }

      setIsModalOpen(false);
      await loadNavigation();
      refreshNavigation();
    } catch (err) {
      alert('Error saving menu item: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Visibility (Active/Inactive)
  const handleToggleStatus = async (item) => {
    const nextStatus = item.isActive === false;
    try {
      await NavigationService.updateStatus(item._id, nextStatus);
      await loadNavigation();
      refreshNavigation();
      if (onShowToast) onShowToast(`"${item.title}" is now ${nextStatus ? 'Published' : 'Hidden'}`);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Move Order (Up / Down) with sequential normalization
  const handleMoveOrder = async (item, direction, siblingsList) => {
    // 1. Sort current siblings deterministically by order, then by title
    const sorted = [...siblingsList].sort((a, b) => ((Number(a.order) || 0) - (Number(b.order) || 0)) || (a.title || '').localeCompare(b.title || ''));
    const currIdx = sorted.findIndex(i => String(i._id) === String(item._id));
    if (currIdx === -1) return;
    const targetIdx = currIdx + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    // 2. Splice and reposition item at targetIdx
    const reorderedList = [...sorted];
    const [moved] = reorderedList.splice(currIdx, 1);
    reorderedList.splice(targetIdx, 0, moved);

    // 3. Assign clean 1-based sequential integers: 1, 2, 3, 4, 5...
    const newItemsOrder = reorderedList.map((s, idx) => ({
      id: s._id,
      order: idx + 1
    }));

    // Optimistically update local tree state so the UI moves instantly
    setTreeItems(prevTree => {
      const updateList = (list) => {
        return list.map(node => {
          const match = newItemsOrder.find(o => String(o.id) === String(node._id));
          const updatedNode = match ? { ...node, order: match.order } : node;
          if (updatedNode.children && updatedNode.children.length > 0) {
            return { ...updatedNode, children: updateList(updatedNode.children) };
          }
          return updatedNode;
        }).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      };
      return updateList(prevTree);
    });

    try {
      await NavigationService.reorderNavigation(newItemsOrder);
      await loadNavigation();
      refreshNavigation();
      if (onShowToast) onShowToast(`Moved "${item.title}" ${direction < 0 ? 'up' : 'down'}`);
    } catch (err) {
      alert('Failed to reorder: ' + err.message);
      await loadNavigation();
    }
  };

  // Direct Order Change (e.g. typing or selecting a new number)
  const handleDirectOrderChange = async (item, newOrder, siblingsList) => {
    const targetOrder = Math.max(1, parseInt(newOrder, 10) || 1);
    const sorted = [...siblingsList]
      .filter(i => String(i._id) !== String(item._id))
      .sort((a, b) => ((Number(a.order) || 0) - (Number(b.order) || 0)) || (a.title || '').localeCompare(b.title || ''));

    // Insert item at (targetOrder - 1) position
    const insertIdx = Math.max(0, Math.min(targetOrder - 1, sorted.length));
    sorted.splice(insertIdx, 0, item);

    const newItemsOrder = sorted.map((s, idx) => ({
      id: s._id,
      order: idx + 1
    }));

    try {
      await NavigationService.reorderNavigation(newItemsOrder);
      await loadNavigation();
      refreshNavigation();
      if (onShowToast) onShowToast(`Position for "${item.title}" updated to #${insertIdx + 1}`);
    } catch (err) {
      alert('Failed to update order: ' + err.message);
      await loadNavigation();
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const targetId = deleteTarget._id || deleteTarget.id;
      await NavigationService.deleteNavigationItem(targetId, { cascade: true });
      if (onShowToast) onShowToast(`Deleted "${deleteTarget.title}"`);
      setDeleteTarget(null);
      await loadNavigation();
      refreshNavigation();
    } catch (err) {
      if (onShowToast) {
        onShowToast('Error deleting item: ' + err.message, 'error');
      } else {
        alert('Error deleting item: ' + err.message);
      }
      setDeleteTarget(null);
      await loadNavigation();
      refreshNavigation();
    } finally {
      setDeleting(false);
    }
  };

  // Dynamic Lucide Icon Mapper
  const getItemIcon = (item) => {
    const title = (item.title || '').toLowerCase();
    const slug = (item.slug || '').toLowerCase();
    const type = (item.type || '').toLowerCase();

    if (title.includes('home') || slug === 'home') return <Home size={18} strokeWidth={2.2} />;
    if (title.includes('startups') || slug.includes('startup')) return <Rocket size={18} strokeWidth={2.2} />;
    if (title.includes('about') || title.includes('team') || slug.includes('about')) return <Users size={18} strokeWidth={2.2} />;
    if (title.includes('contact') || title.includes('newsletter') || slug.includes('newsletter')) return <Mail size={18} strokeWidth={2.2} />;
    if (title.includes('video') || title.includes('tv') || slug.includes('video')) return <Video size={18} strokeWidth={2.2} />;
    if (title.includes('fintech') || title.includes('money') || title.includes('capital') || title.includes('market')) return <TrendingUp size={18} strokeWidth={2.2} />;
    if (title.includes('ai') || title.includes('deeptech')) return <Sparkles size={18} strokeWidth={2.2} />;
    if (title.includes('tech') || slug.includes('tech')) return <FileText size={18} strokeWidth={2.2} />;
    if (title.includes('software') || title.includes('cloud')) return <FileText size={18} strokeWidth={2.2} />;
    if (title.includes('gadget') || title.includes('compute') || title.includes('data')) return <Database size={18} strokeWidth={2.2} />;
    if (title.includes('business') || title.includes('enterprise')) return <Briefcase size={18} strokeWidth={2.2} />;
    if (title.includes('company')) return <Building2 size={18} strokeWidth={2.2} />;
    if (title.includes('category') || title.includes('categories')) return <Layers size={18} strokeWidth={2.2} />;
    if (title.includes('topic') || title.includes('topics')) return <Compass size={18} strokeWidth={2.2} />;
    if (type === 'dropdown' || type === 'mega') return <FileText size={18} strokeWidth={2.2} />;
    return <FileText size={18} strokeWidth={2.2} />;
  };

  // Format Type Label nicely like the image
  const formatTypeLabel = (type) => {
    const t = (type || 'link').toLowerCase();
    if (t === 'dropdown' || t === 'mega') return 'Dropdown';
    if (t === 'category') return 'Category';
    if (t === 'topic') return 'Topic';
    if (t === 'page') return 'CMS Page';
    if (t === 'external') return 'External Link';
    if (t === 'custom' || t === 'custom link') return 'Custom Link';
    return 'Simple Link';
  };


  const countDescendants = (node) => {
    if (!node.children || !node.children.length) return 0;
    return node.children.reduce((acc, c) => acc + 1 + countDescendants(c), 0);
  };

  // Common Action Button Styling
  const actionBtnStyle = {
    background: 'none',
    border: 'none',
    padding: '5px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#475569',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease'
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'inherit' }}>
      
      {/* ── TOP FILTER & ACTION TOOLBAR ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#ffffff',
        padding: '0.85rem 1.15rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Left: Search & Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Search navbar items or URLs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {['ALL', 'dropdown', 'link', 'category', 'topic', 'page'].map(tKey => (
              <button
                key={tKey}
                type="button"
                onClick={() => setTypeFilter(tKey)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 650,
                  border: '1px solid',
                  borderColor: typeFilter === tKey ? 'var(--brand-primary, #ea580c)' : 'transparent',
                  background: typeFilter === tKey ? 'rgba(234, 88, 12, 0.08)' : 'transparent',
                  color: typeFilter === tKey ? 'var(--brand-primary, #ea580c)' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tKey === 'ALL' ? 'All Items' : (tKey.charAt(0).toUpperCase() + tKey.slice(1))}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Counter & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            fontSize: '0.78rem', 
            fontWeight: 700, 
            color: '#64748b', 
            background: '#f8fafc', 
            padding: '5px 12px', 
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            whiteSpace: 'nowrap'
          }}>
            {treeItems.length} Root Items • {flatItems.length} Total Links
          </span>

          <button
            type="button"
            onClick={loadNavigation}
            title="Refresh navigation list"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── PROFESSIONAL TREE TABLE MATCHING REFERENCE DESIGN ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={26} className="animate-spin" style={{ color: 'var(--brand-primary, #ea580c)', margin: '0 auto 10px auto' }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Loading Navigation Structure...</p>
          </div>
        ) : filteredRoots.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <Layers size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>No Navigation Items Found</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 1rem 0' }}>Try clearing your filters or create a new navigation menu item.</p>
            <button
              type="button"
              onClick={() => handleOpenAdd(null, 'link')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'var(--brand-primary, #ea580c)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span>Create Navbar Item</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '820px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.82rem', fontWeight: 700 }}>
                  <th style={{ padding: '14px 20px', width: '110px' }}>Order</th>
                  <th style={{ padding: '14px 20px', width: '280px' }}>Menu Item</th>
                  <th style={{ padding: '14px 20px', width: '160px' }}>Type</th>
                  <th style={{ padding: '14px 20px' }}>URL / Link</th>
                  <th style={{ padding: '14px 20px', width: '150px' }}>Status</th>
                  <th style={{ padding: '14px 20px', width: '180px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoots.map((root, rootIdx) => {
                  const rootOrderNum = root.order || (rootIdx + 1);
                  const hasChildren = root.children && root.children.length > 0;
                  const isExpanded = expandedIds.has(root._id);

                  return (
                    <React.Fragment key={root._id}>
                      {/* ── ROOT LEVEL ROW ── */}
                      <tr 
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isExpanded ? '#fbfcfe' : '#ffffff',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* 1. Order Column */}
                        <td style={{ padding: '13px 20px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <GripVertical size={16} color="#94a3b8" style={{ cursor: 'grab', flexShrink: 0 }} />
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={root.order !== undefined ? root.order : (rootIdx + 1)}
                              onChange={async (e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val > 0) {
                                  await handleDirectOrderChange(root, val, filteredRoots);
                                }
                              }}
                              style={{
                                width: '48px',
                                textAlign: 'center',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '4px 6px',
                                fontWeight: 750,
                                fontSize: '0.86rem',
                                color: '#1e293b',
                                background: '#ffffff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                outline: 'none'
                              }}
                              title="Click to edit order position directly"
                            />
                          </div>
                        </td>

                        {/* 2. Menu Item */}
                        <td style={{ padding: '13px 20px', verticalAlign: 'middle' }}>
                          <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: hasChildren ? 'pointer' : 'default' }}
                            onClick={() => hasChildren && toggleExpand(root._id)}
                          >
                            <div style={{ color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {getItemIcon(root)}
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a' }}>
                              {root.title}
                            </span>
                            {root.description && (
                              <span style={{
                                fontSize: '0.66rem',
                                fontWeight: 750,
                                background: 'rgba(234, 88, 12, 0.1)',
                                color: 'var(--brand-primary, #ea580c)',
                                padding: '2px 7px',
                                borderRadius: '4px'
                              }}>
                                {root.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Type */}
                        <td style={{ padding: '13px 20px', verticalAlign: 'middle', color: '#64748b', fontSize: '0.86rem', fontWeight: 500 }}>
                          {formatTypeLabel(root.type)}
                        </td>

                        {/* 4. URL / Link */}
                        <td style={{ padding: '13px 20px', verticalAlign: 'middle', color: '#64748b', fontSize: '0.86rem' }}>
                          <span style={{ color: '#64748b' }}>
                            {(root.url && root.url !== '#') ? root.url : (root.slug ? `/${root.slug}` : '#')}
                          </span>
                          {root.openInNewTab && (
                            <ExternalLink size={12} color="#94a3b8" style={{ marginLeft: '6px', verticalAlign: 'middle' }} />
                          )}
                        </td>

                        {/* 5. Status Pill */}
                        <td style={{ padding: '13px 20px', verticalAlign: 'middle' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(root)}
                            title="Click to toggle status"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: root.isActive !== false ? '#ecfdf5' : '#fef2f2',
                              color: root.isActive !== false ? '#059669' : '#dc2626',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: root.isActive !== false ? '#10b981' : '#ef4444' }} />
                            <span>{root.isActive !== false ? 'Published' : 'Hidden'}</span>
                          </button>
                        </td>

                        {/* 6. Actions */}
                        <td style={{ padding: '13px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {/* Reorder Up/Down */}
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(root, -1, filteredRoots)}
                              disabled={rootIdx === 0}
                              title="Move Up"
                              style={{ ...actionBtnStyle, opacity: rootIdx === 0 ? 0.3 : 1 }}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(root, 1, filteredRoots)}
                              disabled={rootIdx === filteredRoots.length - 1}
                              title="Move Down"
                              style={{ ...actionBtnStyle, opacity: rootIdx === filteredRoots.length - 1 ? 0.3 : 1 }}
                            >
                              <ArrowDown size={14} />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(root)}
                              title="Edit"
                              style={actionBtnStyle}
                            >
                              <Edit2 size={16} />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicate(root)}
                              title="Duplicate"
                              style={actionBtnStyle}
                            >
                              <Copy size={16} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(root)}
                              title="Delete"
                              style={{ ...actionBtnStyle, color: '#dc2626' }}
                            >
                              <Trash2 size={16} />
                            </button>

                            {/* Add Submenu Button (+) at the end of row */}
                            <button
                              type="button"
                              onClick={() => handleOpenAdd(root._id, 'link')}
                              title={`Add Submenu under "${root.title}"`}
                              style={{ ...actionBtnStyle, color: 'var(--brand-primary, #ea580c)' }}
                            >
                              <Plus size={16} strokeWidth={2.5} />
                            </button>

                            {/* Expand Chevron (Pointing down when closed, up when open) */}
                            {hasChildren ? (
                              <button
                                type="button"
                                onClick={() => toggleExpand(root._id)}
                                title={isExpanded ? 'Collapse submenus' : 'Expand submenus'}
                                style={{ ...actionBtnStyle, color: '#0f172a' }}
                              >
                                {isExpanded ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
                              </button>
                            ) : (
                              <div style={{ width: '28px', height: '28px', flexShrink: 0 }} />
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ── CHILD LEVEL ROWS (INDENTED LIKE 2.1, 2.2, 2.3 WITH LEFT GUIDE LINE) ── */}
                      {isExpanded && hasChildren && root.children.map((child, childIdx) => {
                        const childOrderNum = `${rootOrderNum}.${childIdx + 1}`;
                        const hasGrandchildren = child.children && child.children.length > 0;
                        const isChildExpanded = expandedIds.has(child._id);

                        return (
                          <React.Fragment key={child._id}>
                            <tr style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: '#fcfdfe',
                              transition: 'background 0.15s ease'
                            }}>
                              {/* 1. Indented Order Column with Tree Line */}
                              <td style={{ padding: '11px 20px', verticalAlign: 'middle', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '28px', position: 'relative' }}>
                                  {/* Vertical Tree Connector Guide Line */}
                                  <div style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '-15px',
                                    bottom: childIdx === root.children.length - 1 && (!hasGrandchildren || !isChildExpanded) ? '50%' : '-15px',
                                    width: '2px',
                                    background: '#cbd5e1'
                                  }} />

                                  <GripVertical size={14} color="#94a3b8" style={{ cursor: 'grab', flexShrink: 0 }} />
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '7px',
                                    padding: '3px 10px',
                                    fontWeight: 750,
                                    fontSize: '0.82rem',
                                    color: '#475569',
                                    minWidth: '38px',
                                    background: '#ffffff'
                                  }}>
                                    {childOrderNum}
                                  </span>
                                </div>
                              </td>

                              {/* 2. Menu Item */}
                              <td style={{ padding: '11px 20px', verticalAlign: 'middle' }}>
                                <div 
                                  style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', cursor: hasGrandchildren ? 'pointer' : 'default' }}
                                  onClick={() => hasGrandchildren && toggleExpand(child._id)}
                                >
                                  <div style={{ color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {getItemIcon(child)}
                                  </div>
                                  <span style={{ fontWeight: 750, fontSize: '0.9rem', color: '#1e293b' }}>
                                    {child.title}
                                  </span>
                                  {child.description && (
                                    <span style={{
                                      fontSize: '0.64rem',
                                      fontWeight: 750,
                                      background: '#fff7ed',
                                      color: '#ea580c',
                                      padding: '1px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      {child.description}
                                    </span>
                                  )}
                                  {hasGrandchildren && (
                                    <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 650 }}>
                                      {child.children.length} links
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 3. Type */}
                              <td style={{ padding: '11px 20px', verticalAlign: 'middle', color: '#64748b', fontSize: '0.85rem' }}>
                                {formatTypeLabel(child.type)}
                              </td>

                              {/* 4. URL / Link */}
                              <td style={{ padding: '11px 20px', verticalAlign: 'middle', color: '#64748b', fontSize: '0.85rem' }}>
                                <span>{(child.url && child.url !== '#') ? child.url : (child.slug ? `/${child.slug}` : '#')}</span>
                              </td>

                              {/* 5. Status Pill */}
                              <td style={{ padding: '11px 20px', verticalAlign: 'middle' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(child)}
                                  title="Click to toggle status"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: child.isActive !== false ? '#ecfdf5' : '#fef2f2',
                                    color: child.isActive !== false ? '#059669' : '#dc2626',
                                    padding: '3px 11px',
                                    borderRadius: '20px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: child.isActive !== false ? '#10b981' : '#ef4444' }} />
                                  <span>{child.isActive !== false ? 'Published' : 'Hidden'}</span>
                                </button>
                              </td>

                              {/* 6. Actions */}
                              <td style={{ padding: '11px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOrder(child, -1, root.children)}
                                    disabled={childIdx === 0}
                                    title="Move Up"
                                    style={{ ...actionBtnStyle, opacity: childIdx === 0 ? 0.3 : 1 }}
                                  >
                                    <ArrowUp size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOrder(child, 1, root.children)}
                                    disabled={childIdx === root.children.length - 1}
                                    title="Move Down"
                                    style={{ ...actionBtnStyle, opacity: childIdx === root.children.length - 1 ? 0.3 : 1 }}
                                  >
                                    <ArrowDown size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(child)}
                                    title="Edit"
                                    style={actionBtnStyle}
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicate(child)}
                                    title="Duplicate"
                                    style={actionBtnStyle}
                                  >
                                    <Copy size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(child)}
                                    title="Delete"
                                    style={{ ...actionBtnStyle, color: '#dc2626' }}
                                  >
                                    <Trash2 size={15} />
                                  </button>

                                  {/* Add Submenu Button (+) at the end of child row */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdd(child._id, 'link')}
                                    title={`Add Submenu under "${child.title}"`}
                                    style={{ ...actionBtnStyle, color: 'var(--brand-primary, #ea580c)' }}
                                  >
                                    <Plus size={15} strokeWidth={2.5} />
                                  </button>

                                  {/* Expand Chevron (if has children) */}
                                  {hasGrandchildren ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpand(child._id)}
                                      title={isChildExpanded ? 'Collapse submenus' : 'Expand submenus'}
                                      style={{ ...actionBtnStyle, color: '#0f172a' }}
                                    >
                                      {isChildExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                                    </button>
                                  ) : (
                                    <div style={{ width: '28px', height: '28px', flexShrink: 0 }} />
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* ── GRANDCHILD LEVEL ROWS (E.G. 2.1.1, 2.1.2) ── */}
                            {isChildExpanded && hasGrandchildren && child.children.map((grand, grandIdx) => {
                              const grandOrderNum = `${childOrderNum}.${grandIdx + 1}`;

                              return (
                                <tr key={grand._id} style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                  {/* Order with 2nd Level Indentation */}
                                  <td style={{ padding: '9px 20px', verticalAlign: 'middle', position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '54px', position: 'relative' }}>
                                      {/* Tree Connector Lines */}
                                      <div style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '-15px',
                                        bottom: '-15px',
                                        width: '2px',
                                        background: '#cbd5e1'
                                      }} />
                                      <div style={{
                                        position: 'absolute',
                                        left: '38px',
                                        top: '-15px',
                                        bottom: grandIdx === child.children.length - 1 ? '50%' : '-15px',
                                        width: '2px',
                                        background: '#cbd5e1'
                                      }} />

                                      <GripVertical size={13} color="#94a3b8" style={{ cursor: 'grab', flexShrink: 0 }} />
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        padding: '2px 8px',
                                        fontWeight: 700,
                                        fontSize: '0.78rem',
                                        color: '#64748b',
                                        minWidth: '42px',
                                        background: '#ffffff'
                                      }}>
                                        {grandOrderNum}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Menu Item */}
                                  <td style={{ padding: '9px 20px', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px' }}>
                                      <div style={{ color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {getItemIcon(grand)}
                                      </div>
                                      <span style={{ fontWeight: 650, fontSize: '0.86rem', color: '#334155' }}>
                                        {grand.title}
                                      </span>
                                      {grand.description && (
                                        <span style={{ fontSize: '0.62rem', background: '#fff7ed', color: '#ea580c', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                                          {grand.description}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Type */}
                                  <td style={{ padding: '9px 20px', verticalAlign: 'middle', color: '#64748b', fontSize: '0.82rem' }}>
                                    {formatTypeLabel(grand.type)}
                                  </td>

                                  {/* URL / Link */}
                                  <td style={{ padding: '9px 20px', verticalAlign: 'middle', color: '#64748b', fontSize: '0.82rem' }}>
                                    <span>{(grand.url && grand.url !== '#') ? grand.url : (grand.slug ? `/${grand.slug}` : '#')}</span>
                                  </td>

                                  {/* Status */}
                                  <td style={{ padding: '9px 20px', verticalAlign: 'middle' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStatus(grand)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: grand.isActive !== false ? '#ecfdf5' : '#fef2f2',
                                        color: grand.isActive !== false ? '#059669' : '#dc2626',
                                        padding: '2px 9px',
                                        borderRadius: '20px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: grand.isActive !== false ? '#10b981' : '#ef4444' }} />
                                      <span>{grand.isActive !== false ? 'Published' : 'Hidden'}</span>
                                    </button>
                                  </td>

                                  {/* Actions */}
                                  <td style={{ padding: '9px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveOrder(grand, -1, child.children)}
                                        disabled={grandIdx === 0}
                                        title="Move Up"
                                        style={{ ...actionBtnStyle, opacity: grandIdx === 0 ? 0.3 : 1 }}
                                      >
                                        <ArrowUp size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveOrder(grand, 1, child.children)}
                                        disabled={grandIdx === child.children.length - 1}
                                        title="Move Down"
                                        style={{ ...actionBtnStyle, opacity: grandIdx === child.children.length - 1 ? 0.3 : 1 }}
                                      >
                                        <ArrowDown size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEdit(grand)}
                                        title="Edit"
                                        style={actionBtnStyle}
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicate(grand)}
                                        title="Duplicate"
                                        style={actionBtnStyle}
                                      >
                                        <Copy size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteTarget(grand)}
                                        title="Delete"
                                        style={{ ...actionBtnStyle, color: '#dc2626' }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* ── ROW AT THE END OF ALL ROWS TO ADD NEW ROOT MENU ITEM ── */}
                <tr style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                  <td colSpan={6} style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenAdd(null, 'link')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 26px',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1',
                        background: '#f8fafc',
                        color: 'var(--brand-primary, #ea580c)',
                        fontSize: '0.86rem',
                        fontWeight: 750,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      <span>Add Menu Item</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── STYLISH TIP BAR AT BOTTOM (EXACTLY MATCHING IMAGE) ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          background: '#eff6ff',
          borderTop: '1px solid #dbeafe',
          color: '#1e40af',
          fontSize: '0.82rem',
          fontWeight: 600
        }}>
          <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>Tip: Click on the arrow icon on any menu to expand its submenus. Use the action buttons to edit, duplicate, or delete menu items.</span>
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.1rem 1.35rem',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingItem 
                    ? `Edit Menu Item: "${editingItem.title}"` 
                    : parentItem 
                      ? `Add Child to "${parentItem.title}"` 
                      : 'Add Menu Item'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {editingItem 
                    ? 'Update item name, type, and slug' 
                    : parentItem 
                      ? `Configure child menu item directly under "${parentItem.title}"` 
                      : 'Create a top-level menu item for the navigation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Parent Banner (Locked when adding child) */}
              {parentItem ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Folder size={15} color="#16a34a" />
                    <span style={{ color: '#166534' }}>
                      Adding child under: <strong>"{parentItem.title}"</strong>
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 750,
                    color: '#15803d',
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    Child Item
                  </span>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#475569'
                }}>
                  <Home size={15} color="#64748b" />
                  <span>Position: <strong>Main Top Navigation Bar</strong></span>
                </div>
              )}

              {/* 1. Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {parentItem ? 'Child Menu Name *' : 'Menu Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={parentItem ? 'e.g. AI & DeepTech, Gadgets, Funding' : 'e.g. Categories, Topics, About Us'}
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>

              {/* 2. Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Menu Type *
                </label>
                <select
                  value={formData.type}
                  onChange={e => handleTypeChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    background: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="link">Simple Link</option>
                  {!parentItem && <option value="dropdown">Dropdown Menu</option>}
                  <option value="category">Category</option>
                  <option value="topic">Topic</option>
                  <option value="page">CMS Page</option>
                  <option value="custom">Landing Page / Custom URL</option>
                  <option value="external">External Link</option>
                </select>

                {/* Quick Taxonomy Pickers (Auto fills Name and Slug) */}
                {formData.type === 'category' && categories.length > 0 && (
                  <div style={{ marginTop: '8px', background: '#f0f9ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>
                      Select Existing Category (Auto-fills Name & Slug):
                    </label>
                    <select
                      onChange={e => {
                        const sel = categories.find(c => c.slug === e.target.value);
                        if (sel) {
                          setFormData(prev => ({
                            ...prev,
                            title: sel.name,
                            slug: sel.slug,
                            url: `/category/${sel.slug}`
                          }));
                        }
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="">— Choose a category —</option>
                      {categories.map(c => (
                        <option key={c._id || c.slug} value={c.slug}>{c.name} (/category/{c.slug})</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.type === 'topic' && topics.length > 0 && (
                  <div style={{ marginTop: '8px', background: '#eef2ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#4338ca', marginBottom: '4px' }}>
                      Select Existing Topic (Auto-fills Name & Slug):
                    </label>
                    <select
                      onChange={e => {
                        const sel = topics.find(t => t.slug === e.target.value);
                        if (sel) {
                          setFormData(prev => ({
                            ...prev,
                            title: sel.name,
                            slug: sel.slug,
                            url: `/topic/${sel.slug}`
                          }));
                        }
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #a5b4fc', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="">— Choose a topic —</option>
                      {topics.map(t => (
                        <option key={t._id || t.slug} value={t.slug}>{t.name} (/topic/{t.slug})</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.type === 'page' && pages.length > 0 && (
                  <div style={{ marginTop: '8px', background: '#f0fdfa', padding: '10px 12px', borderRadius: '8px', border: '1px solid #99f6e4' }}>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>
                      Select Existing CMS Page (Auto-fills Name & Slug):
                    </label>
                    <select
                      onChange={e => {
                        const sel = pages.find(p => p.slug === e.target.value);
                        if (sel) {
                          setFormData(prev => ({
                            ...prev,
                            title: sel.title,
                            slug: sel.slug,
                            url: `/${sel.slug}`
                          }));
                        }
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #5eead4', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="">— Choose a page —</option>
                      {pages.map(p => (
                        <option key={p._id || p.slug} value={p.slug}>{p.title} (/{p.slug})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Link / Target URL */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                    Target Link / URL *
                  </label>
                  <span style={{ fontSize: '0.73rem', color: '#64748b' }}>
                    Any landing page, custom URL, or full link
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. /landing-page, https://example.com, or /about"
                  value={formData.url || ''}
                  onChange={e => handleUrlChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Optional Parent Path Inheritance Toggle for Child Items */}
                {parentItem && (
                  <div style={{
                    marginTop: '10px',
                    background: inheritParentPath ? '#f8fafc' : '#f0fdf4',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: inheritParentPath ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
                    transition: 'all 0.2s ease'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={inheritParentPath}
                        onChange={e => handleToggleInheritParent(e.target.checked)}
                        style={{ width: '15px', height: '15px', accentColor: 'var(--brand-primary, #ea580c)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                        Append parent path prefix (<code>{parentBase}/...</code>)
                      </span>
                    </label>
                    <p style={{ margin: '4px 0 0 23px', fontSize: '0.74rem', color: inheritParentPath ? '#64748b' : '#15803d', lineHeight: 1.4 }}>
                      {inheritParentPath 
                        ? `Path will follow "${parentItem.title}" structure.` 
                        : '✓ Optional & Independent: Unchecked allows this item to link directly to ANY landing page, external link, or custom route.'}
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Display Order Position */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Navbar Order Position
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.order || 1}
                    onChange={e => setFormData(prev => ({ ...prev, order: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                    style={{
                      width: '90px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      fontWeight: 700
                    }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Position #{formData.order || 1} (e.g. 1 = first navbar item, 2 = second)
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.84rem',
                    fontWeight: 650,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--brand-primary, #ea580c)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  {saving && <RefreshCw size={13} className="animate-spin" />}
                  <span>
                    {editingItem 
                      ? 'Save Changes' 
                      : parentItem 
                        ? `Add Child Item` 
                        : 'Create Menu Item'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.25rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid #fee2e2'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.98rem', fontWeight: 800, color: '#991b1b' }}>
              Delete Navigation Item?
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>? 
              {deleteTarget.children && deleteTarget.children.length > 0 && (
                <span style={{ display: 'block', marginTop: '6px', color: '#dc2626', fontWeight: 650 }}>
                  ⚠️ This menu contains {countDescendants(deleteTarget)} sub-link(s) which will also be permanently deleted.
                </span>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 650,
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting && <RefreshCw size={12} className="animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
