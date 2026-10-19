import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Filter, Eye, Check, X, 
  ArrowLeft, RefreshCw, Sparkles, BookOpen, Database, 
  ExternalLink, CheckCircle2, Clock, FileText, Image as ImageIcon,
  Tag, User, Calendar, Layers, BarChart3, AlertCircle, Menu,
  Layout, Globe, Sliders, CheckSquare, ChevronRight, Send, ArrowUpRight,
  ChevronDown, ChevronUp, FolderPlus, Link2, ListPlus
} from 'lucide-react';
import { StoryService } from '../services/storyService';
import { MenuService } from '../services/menuService';
import { PageService } from '../services/pageService';

const BRANDS = [
  'GoReadPost',
  'EnterpriseStory',
  'YS हिंदी',
  'SMBStory',
  'AIStory',
  'HerStory',
  'SocialStory'
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'startups', label: 'Startups' },
  { id: 'enterprise', label: 'Enterprise' },
  { id: 'smbstory', label: 'SMBStory (MSME / D2C)' },
  { id: 'hindi', label: 'Hindi (YS हिंदी)' },
  { id: 'ai-story', label: 'AI Story' },
  { id: 'her-story', label: 'HerStory' },
  { id: 'social-story', label: 'SocialStory' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'deeptech', label: 'DeepTech' }
];

export default function AdminPanel({ onBackToSite, onSelectStory, onShowToast, onNavigateToPage }) {
  // Top Tabs State: 'stories' | 'menu' | 'pages'
  const [activeAdminTab, setActiveAdminTab] = useState('stories');

  // --- STORIES STATE ---
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStories: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    totalViews: 0,
    totalClaps: 0,
    isMongoConnected: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'published' | 'draft' | 'scheduled'

  // Story Editor Modal
  const [isStoryEditorOpen, setIsStoryEditorOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [storyFormData, setStoryFormData] = useState({
    title: '',
    subtitle: '',
    summary: '',
    brand: 'GoReadPost',
    category: 'startups',
    categoryTag: 'Startups',
    tag: 'LATEST',
    image: '',
    authorName: 'Editorial Desk',
    authorTitle: 'Staff Reporter',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    readTime: '4 min read',
    publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    content: '',
    tags: '',
    status: 'published', // 'published' | 'draft' | 'scheduled'
    scheduledPublishAt: ''
  });

  // --- MENU NAVBAR STATE ---
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [isMenuEditorOpen, setIsMenuEditorOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    id: '',
    label: '',
    type: 'category', // 'category' | 'page' | 'link' | 'anchor'
    target: '',
    hasDropdown: false,
    isBadge: false,
    badgeText: '',
    visible: true,
    dropdownColumns: []
  });

  // --- SUB-MENU ACCORDION & QUICK BUILDER STATES ---
  const [expandedMenuIds, setExpandedMenuIds] = useState({});
  const [quickSubMenuModal, setQuickSubMenuModal] = useState({
    isOpen: false,
    item: null,
    columnChoice: 'existing', // 'existing' | 'new'
    selectedColIndex: 0,
    newColumnTitle: '',
    label: '',
    destType: 'category',
    target: 'startups'
  });
  const [inlineColTitles, setInlineColTitles] = useState({});
  const [inlineLinkData, setInlineLinkData] = useState({});
  const [modalNewColTitle, setModalNewColTitle] = useState('');
  const [modalNewLinkData, setModalNewLinkData] = useState({});

  // --- PAGES STATE ---
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [isPageEditorOpen, setIsPageEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageFormData, setPageFormData] = useState({
    id: '',
    title: '',
    slug: '',
    brand: 'GoReadPost',
    description: '',
    heroHeadline: '',
    heroSubhead: '',
    heroBanner: '',
    status: 'active',
    showInNav: true
  });

  // Load all CMS collections
  const loadData = async () => {
    setLoading(true);
    try {
      const [storyRes, statsRes, menuRes, pageRes] = await Promise.all([
        StoryService.getStories(),
        StoryService.getStats(),
        MenuService.getMenuItems(),
        PageService.getPages()
      ]);
      setStories(storyRes.data || []);
      setStats(statsRes || {});
      setMenuItems(menuRes || []);
      setPages(pageRes || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- STORY ACTIONS ---
  const handleOpenStoryEditor = (story = null) => {
    if (story) {
      setEditingStory(story);
      // Format scheduled date for datetime-local input if present
      let scheduledStr = '';
      if (story.scheduledPublishAt) {
        try {
          const d = new Date(story.scheduledPublishAt);
          scheduledStr = d.toISOString().slice(0, 16);
        } catch (e) {}
      }

      setStoryFormData({
        title: story.title || '',
        subtitle: story.subtitle || '',
        summary: story.summary || '',
        brand: story.brand || 'GoReadPost',
        category: story.category || 'startups',
        categoryTag: story.categoryTag || story.categoryLabel || 'Editorial',
        tag: story.tag || 'LATEST',
        image: story.image || story.heroImage || '',
        authorName: story.author?.name || 'Editorial Desk',
        authorTitle: story.author?.title || 'Staff Reporter',
        authorAvatar: story.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        readTime: story.readTime || '4 min read',
        publishedAt: story.publishedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: Array.isArray(story.content) ? story.content.join('\n\n') : (story.content || ''),
        tags: Array.isArray(story.tags) ? story.tags.join(', ') : '',
        status: story.status || 'published',
        scheduledPublishAt: scheduledStr
      });
    } else {
      setEditingStory(null);
      setStoryFormData({
        title: '',
        subtitle: '',
        summary: '',
        brand: 'GoReadPost',
        category: 'startups',
        categoryTag: 'Startups',
        tag: 'EXCLUSIVE',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80',
        authorName: 'Editorial Desk',
        authorTitle: 'Staff Reporter',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        readTime: '4 min read',
        publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: '',
        tags: 'Startups, Venture, Tech',
        status: 'published',
        scheduledPublishAt: ''
      });
    }
    setIsStoryEditorOpen(true);
  };

  const handleSaveStory = async (e) => {
    e.preventDefault();
    if (!storyFormData.title.trim()) {
      alert('Story Title is required.');
      return;
    }
    if (!storyFormData.image.trim()) {
      alert('Featured Image URL is required.');
      return;
    }

    if (storyFormData.status === 'scheduled' && !storyFormData.scheduledPublishAt) {
      alert('Please specify a date and time for scheduled publishing.');
      return;
    }

    setIsSavingStory(true);
    try {
      const payload = {
        title: storyFormData.title.trim(),
        subtitle: storyFormData.subtitle.trim(),
        summary: storyFormData.summary.trim(),
        brand: storyFormData.brand,
        category: storyFormData.category,
        categoryTag: storyFormData.categoryTag || 'Editorial',
        tag: storyFormData.tag || 'LATEST',
        image: storyFormData.image.trim(),
        author: {
          name: storyFormData.authorName || 'Editorial Desk',
          title: storyFormData.authorTitle || 'Staff Reporter',
          avatar: storyFormData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
        },
        readTime: storyFormData.readTime || '4 min read',
        publishedAt: storyFormData.publishedAt,
        content: storyFormData.content.split('\n\n').filter(p => p.trim().length > 0),
        tags: storyFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: storyFormData.status,
        scheduledPublishAt: storyFormData.status === 'scheduled' ? new Date(storyFormData.scheduledPublishAt).toISOString() : null
      };

      if (editingStory) {
        await StoryService.updateStory(editingStory._id || editingStory.id, payload);
        onShowToast?.(`Story "${payload.title}" updated successfully!`);
      } else {
        await StoryService.createStory(payload);
        onShowToast?.(`Story "${payload.title}" created successfully!`);
      }

      setIsStoryEditorOpen(false);
      await loadData();
    } catch (err) {
      alert('Failed to save story: ' + err.message);
    } finally {
      setIsSavingStory(false);
    }
  };

  const handleDeleteStory = async (story) => {
    if (!window.confirm(`Are you sure you want to delete story "${story.title}"?`)) return;
    try {
      await StoryService.deleteStory(story._id || story.id);
      onShowToast?.('Story deleted successfully.');
      await loadData();
    } catch (e) {
      alert('Failed to delete story.');
    }
  };

  const handleToggleStoryStatus = async (story, newStatus) => {
    try {
      await StoryService.updateStory(story._id || story.id, {
        status: newStatus,
        scheduledPublishAt: newStatus === 'scheduled' ? story.scheduledPublishAt : null
      });
      onShowToast?.(`Story status updated to ${newStatus.toUpperCase()}`);
      await loadData();
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  const handleReseedStories = async () => {
    if (!window.confirm('Reset/Reseed stories database with default curated stories?')) return;
    setLoading(true);
    await StoryService.seedInitialData();
    await loadData();
    onShowToast?.('Database successfully seeded with default stories!');
  };

  // --- MENU NAVBAR ACTIONS ---
  const handleOpenMenuEditor = (item = null) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuFormData({
        id: item.id || '',
        label: item.label || '',
        type: item.type || 'category',
        target: item.target || item.id || '',
        hasDropdown: Boolean(item.hasDropdown),
        isBadge: Boolean(item.isBadge),
        badgeText: item.badgeText || '',
        visible: item.visible !== false,
        dropdownColumns: item.dropdownColumns || []
      });
    } else {
      setEditingMenuItem(null);
      setMenuFormData({
        id: '',
        label: '',
        type: 'category',
        target: '',
        hasDropdown: false,
        isBadge: false,
        badgeText: '',
        visible: true,
        dropdownColumns: []
      });
    }
    setIsMenuEditorOpen(true);
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!menuFormData.label.trim()) {
      alert('Menu label is required.');
      return;
    }

    try {
      if (editingMenuItem) {
        await MenuService.updateMenuItem(editingMenuItem.id, menuFormData);
        onShowToast?.(`Menu item "${menuFormData.label}" updated!`);
      } else {
        await MenuService.createMenuItem(menuFormData);
        onShowToast?.(`Menu item "${menuFormData.label}" created!`);
      }
      setIsMenuEditorOpen(false);
      const updated = await MenuService.getMenuItems();
      setMenuItems(updated);
    } catch (err) {
      alert('Failed to save menu item: ' + err.message);
    }
  };

  const handleDeleteMenuItem = async (item) => {
    if (!window.confirm(`Delete menu item "${item.label}"?`)) return;
    try {
      await MenuService.deleteMenuItem(item.id);
      onShowToast?.(`Menu item "${item.label}" deleted.`);
      const updated = await MenuService.getMenuItems();
      setMenuItems(updated);
    } catch (e) {
      alert('Failed to delete menu item.');
    }
  };

  const handleToggleMenuVisibility = async (item) => {
    try {
      await MenuService.updateMenuItem(item.id, { visible: !item.visible });
      const updated = await MenuService.getMenuItems();
      setMenuItems(updated);
      onShowToast?.(`Menu item "${item.label}" is now ${!item.visible ? 'Visible' : 'Hidden'}.`);
    } catch (e) {}
  };

  const handleResetMenu = async () => {
    if (!window.confirm('Reset Navbar Menu to default curated structure?')) return;
    const res = await MenuService.resetMenuDefaults();
    setMenuItems(res);
    onShowToast?.('Navbar Menu reset to defaults!');
  };

  // --- SUB-MENU REACTIVE MANAGEMENT HANDLERS ---
  const toggleMenuSubMenuExpand = (itemId) => {
    setExpandedMenuIds(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Open Quick Add Sub-Menu Modal
  const handleOpenQuickSubMenu = (menuItem, colIdx = 0) => {
    const hasExistingCols = menuItem.dropdownColumns && menuItem.dropdownColumns.length > 0;
    setQuickSubMenuModal({
      isOpen: true,
      item: menuItem,
      columnChoice: hasExistingCols ? 'existing' : 'new',
      selectedColIndex: Math.max(0, colIdx || 0),
      newColumnTitle: hasExistingCols ? '' : 'Featured Topics',
      label: '',
      destType: 'category',
      target: 'startups'
    });
  };

  // Save from Quick Sub-Menu Modal
  const handleSaveQuickSubMenu = async (e) => {
    e.preventDefault();
    const { item, columnChoice, selectedColIndex, newColumnTitle, label, destType, target } = quickSubMenuModal;
    if (!item) return;
    if (!label.trim()) {
      alert('Please enter a sub-menu link label');
      return;
    }

    try {
      const existingCols = item.dropdownColumns ? JSON.parse(JSON.stringify(item.dropdownColumns)) : [];
      let targetColIdx = selectedColIndex;

      if (columnChoice === 'new' || existingCols.length === 0) {
        const titleToUse = newColumnTitle.trim() || 'Featured Links';
        existingCols.push({ title: titleToUse, items: [] });
        targetColIdx = existingCols.length - 1;
      }

      if (!existingCols[targetColIdx]) {
        existingCols[targetColIdx] = { title: 'General Links', items: [] };
      }

      const newSubLink = {
        label: label.trim(),
        categoryId: destType === 'category' ? target : '',
        url: destType === 'link' ? target : '',
        query: destType === 'query' ? target : '',
        target: target || ''
      };

      existingCols[targetColIdx].items = [...(existingCols[targetColIdx].items || []), newSubLink];

      await MenuService.updateMenuItem(item.id, {
        hasDropdown: true,
        dropdownColumns: existingCols
      });

      const updated = await MenuService.getMenuItems();
      setMenuItems(updated);
      setQuickSubMenuModal(prev => ({ ...prev, isOpen: false }));
      // Ensure drawer is open so user sees the newly added link immediately
      setExpandedMenuIds(prev => ({ ...prev, [item.id]: true }));
      onShowToast?.(`Sub-menu link "${label}" added to "${item.label}"!`);
    } catch (err) {
      alert('Failed to add sub-menu: ' + err.message);
    }
  };

  // Add column directly to an item
  const handleAddColumnDirect = async (item, colTitle) => {
    if (!colTitle || !colTitle.trim()) {
      alert('Please enter a column title');
      return;
    }
    try {
      const existingCols = item.dropdownColumns ? [...item.dropdownColumns] : [];
      const updatedCols = [...existingCols, { title: colTitle.trim(), items: [] }];
      await MenuService.updateMenuItem(item.id, {
        hasDropdown: true,
        dropdownColumns: updatedCols
      });
      const updated = await MenuService.getMenuItems();
      setMenuItems(updated);
      setInlineColTitles(prev => ({ ...prev, [item.id]: '' }));
      onShowToast?.(`Column "${colTitle.trim()}" added to "${item.label}"!`);
    } catch (err) {
      alert('Failed to add column: ' + err.message);
    }
  };

  // Delete column directly from an item
  const handleDeleteColumnDirect = async (item, colIdx) => {
    const colName = item.dropdownColumns?.[colIdx]?.title || 'Column';
    if (!window.confirm(`Delete "${colName}" and all its sub-links?`)) return;
    try {
      const updatedCols = item.dropdownColumns.filter((_, idx) => idx !== colIdx);
      await MenuService.updateMenuItem(item.id, {
        dropdownColumns: updatedCols,
        hasDropdown: updatedCols.length > 0
      });
      const updated = await MenuService.getMenuItems();
      setMenuItems(updated);
      onShowToast?.(`Column "${colName}" deleted.`);
    } catch (err) {
      alert('Failed to delete column.');
    }
  };

  // Add sub-link directly inside a specific column of an item
  const handleAddSubLinkDirect = async (item, colIdx) => {
    const key = `${item.id}-${colIdx}`;
    const data = inlineLinkData[key] || { label: '', destType: 'category', target: 'startups' };
    if (!data.label || !data.label.trim()) {
      alert('Please enter a link label');
      return;
    }
    try {
      const updatedCols = item.dropdownColumns.map((col, idx) => {
        if (idx !== colIdx) return col;
        const items = [...(col.items || [])];
        items.push({
          label: data.label.trim(),
          categoryId: data.destType === 'category' ? data.target : '',
          url: data.destType === 'link' ? data.target : '',
          query: data.destType === 'query' ? data.target : '',
          target: data.target || ''
        });
        return { ...col, items };
      });

      await MenuService.updateMenuItem(item.id, {
        hasDropdown: true,
        dropdownColumns: updatedCols
      });
      const updated = await MenuService.getMenuItems();
      setMenuItems(updated);
      setInlineLinkData(prev => ({
        ...prev,
        [key]: { label: '', destType: 'category', target: 'startups' }
      }));
      onShowToast?.(`Added "${data.label}" to "${item.dropdownColumns[colIdx]?.title}"!`);
    } catch (err) {
      alert('Failed to add sub-link: ' + err.message);
    }
  };

  // Delete sub-link directly from a column
  const handleDeleteSubLinkDirect = async (item, colIdx, linkIdx) => {
    try {
      const updatedCols = item.dropdownColumns.map((col, cIdx) => {
        if (cIdx !== colIdx) return col;
        return {
          ...col,
          items: col.items.filter((_, lIdx) => lIdx !== linkIdx)
        };
      });
      await MenuService.updateMenuItem(item.id, {
        dropdownColumns: updatedCols
      });
      const updated = await MenuService.getMenuItems();
      setMenuItems(updated);
      onShowToast?.(`Sub-link removed.`);
    } catch (err) {
      alert('Failed to remove sub-link.');
    }
  };

  // Modal: Add column
  const handleModalAddColumn = (colTitle) => {
    if (!colTitle || !colTitle.trim()) {
      alert('Please enter a column title');
      return;
    }
    setMenuFormData(prev => ({
      ...prev,
      hasDropdown: true,
      dropdownColumns: [
        ...prev.dropdownColumns,
        { title: colTitle.trim(), items: [] }
      ]
    }));
    setModalNewColTitle('');
  };

  // Modal: Remove column
  const handleModalRemoveColumn = (colIdx) => {
    setMenuFormData(prev => ({
      ...prev,
      dropdownColumns: prev.dropdownColumns.filter((_, idx) => idx !== colIdx)
    }));
  };

  // Modal: Add link to column
  const handleModalAddLink = (colIdx) => {
    const data = modalNewLinkData[colIdx] || { label: '', destType: 'category', target: 'startups' };
    if (!data.label || !data.label.trim()) {
      alert('Please enter a link label');
      return;
    }
    setMenuFormData(prev => {
      const cols = [...prev.dropdownColumns];
      const targetCol = { ...cols[colIdx] };
      const items = [...(targetCol.items || [])];
      items.push({
        label: data.label.trim(),
        categoryId: data.destType === 'category' ? data.target : '',
        url: data.destType === 'link' ? data.target : '',
        query: data.destType === 'query' ? data.target : '',
        target: data.target || ''
      });
      targetCol.items = items;
      cols[colIdx] = targetCol;
      return { ...prev, dropdownColumns: cols };
    });
    setModalNewLinkData(prev => ({
      ...prev,
      [colIdx]: { label: '', destType: 'category', target: 'startups' }
    }));
  };

  // Modal: Remove link from column
  const handleModalRemoveLink = (colIdx, linkIdx) => {
    setMenuFormData(prev => {
      const cols = [...prev.dropdownColumns];
      const targetCol = { ...cols[colIdx] };
      targetCol.items = targetCol.items.filter((_, idx) => idx !== linkIdx);
      cols[colIdx] = targetCol;
      return { ...prev, dropdownColumns: cols };
    });
  };

  // --- PAGES ACTIONS ---
  const handleOpenPageEditor = (page = null) => {
    if (page) {
      setEditingPage(page);
      setPageFormData({
        id: page.id || '',
        title: page.title || '',
        slug: page.slug || '',
        brand: page.brand || 'GoReadPost',
        description: page.description || '',
        heroHeadline: page.heroHeadline || '',
        heroSubhead: page.heroSubhead || '',
        heroBanner: page.heroBanner || '',
        status: page.status || 'active',
        showInNav: page.showInNav !== false
      });
    } else {
      setEditingPage(null);
      setPageFormData({
        id: '',
        title: '',
        slug: '',
        brand: 'GoReadPost',
        description: '',
        heroHeadline: '',
        heroSubhead: '',
        heroBanner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
        status: 'active',
        showInNav: true
      });
    }
    setIsPageEditorOpen(true);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!pageFormData.title.trim()) {
      alert('Page Title is required.');
      return;
    }
    try {
      if (editingPage) {
        await PageService.updatePage(editingPage.id, pageFormData);
        onShowToast?.(`Page "${pageFormData.title}" updated!`);
      } else {
        await PageService.createPage(pageFormData);
        onShowToast?.(`Page "${pageFormData.title}" created!`);
      }
      setIsPageEditorOpen(false);
      const updated = await PageService.getPages();
      setPages(updated);
    } catch (err) {
      alert('Failed to save page: ' + err.message);
    }
  };

  const handleDeletePage = async (page) => {
    if (page.id === 'home') {
      alert('Cannot delete primary Homepage.');
      return;
    }
    if (!window.confirm(`Delete page "${page.title}"?`)) return;
    try {
      await PageService.deletePage(page.id);
      onShowToast?.(`Page "${page.title}" deleted.`);
      const updated = await PageService.getPages();
      setPages(updated);
    } catch (e) {
      alert('Failed to delete page.');
    }
  };

  const handleResetPages = async () => {
    if (!window.confirm('Reset all pages to default configuration?')) return;
    const res = await PageService.resetPagesDefaults();
    setPages(res);
    onShowToast?.('Pages reset to defaults!');
  };

  // Filtered stories calculation
  const filteredStories = stories.filter(story => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (story.title && story.title.toLowerCase().includes(q)) ||
      (story.summary && story.summary.toLowerCase().includes(q)) ||
      (story.author?.name && story.author.name.toLowerCase().includes(q));

    const matchesBrand = selectedBrand === 'all' || story.brand === selectedBrand;
    const matchesCat = selectedCategory === 'all' || story.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || (story.status || 'published') === selectedStatus;

    return matchesSearch && matchesBrand && matchesCat && matchesStatus;
  });

  return (
    <div className="admin-panel-wrapper">
      {/* 1. Global Enterprise App Header */}
      <header className="admin-top-navbar">
        <div className="admin-nav-left">
          <div className="admin-brand-mark">
            <div className="brand-badge-logo">G</div>
            <div className="brand-info">
              <span className="brand-name">GOREADPOST</span>
              <span className="brand-env-badge">ENTERPRISE CMS</span>
            </div>
          </div>
          <div className="admin-divider-v" />
          <div className="admin-nav-breadcrumb">
            <span className="breadcrumb-section">Workspace</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">
              {activeAdminTab === 'stories' ? 'Stories & Articles' : activeAdminTab === 'menu' ? 'Navbar & Menu' : 'Pages & Desks'}
            </span>
          </div>
        </div>

        <div className="admin-nav-right">
          <div className={`db-status-pill ${stats.isMongoConnected ? 'connected' : 'local'}`}>
            <span className="status-indicator-dot" />
            <Database size={13} />
            <span>{stats.isMongoConnected ? 'MongoDB Live' : 'Local Fallback'}</span>
          </div>

          <button className="admin-icon-action-btn" onClick={loadData} title="Sync Live Data from Database">
            <RefreshCw size={13} className={loading ? 'spin-animate' : ''} />
            <span>Sync</span>
          </button>

          <div className="admin-divider-v" />

          <button className="admin-btn-back-website" onClick={onBackToSite} title="Return to GoReadPost Public Website">
            <ArrowLeft size={14} />
            <span>Back to Website</span>
          </button>

          <div className="admin-user-profile-badge">
            <div className="admin-avatar">ED</div>
            <div className="admin-user-details">
              <span className="admin-user-name">Editorial Desk</span>
              <span className="admin-role-tag">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Segmented Navigation Tabs */}
      <div className="admin-segmented-tabs-bar">
        <button 
          className={`admin-nav-tab-item ${activeAdminTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('stories')}
        >
          <BookOpen size={16} />
          <span>Stories & Posts</span>
          <span className="tab-counter-badge">{stories.length}</span>
        </button>

        <button 
          className={`admin-nav-tab-item ${activeAdminTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('menu')}
        >
          <Menu size={16} />
          <span>Navbar Menu Manager</span>
          <span className="tab-counter-badge">{menuItems.length}</span>
        </button>

        <button 
          className={`admin-nav-tab-item ${activeAdminTab === 'pages' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('pages')}
        >
          <Layout size={16} />
          <span>Pages & Desks Manager</span>
          <span className="tab-counter-badge">{pages.length}</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: STORIES & POSTS MANAGEMENT
         ======================================================== */}
      {activeAdminTab === 'stories' && (
        <>
          {/* Live KPI Metrics */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Stories</span>
              </div>
              <div className="stat-number">{stats.totalStories || stories.length}</div>
              <div className="stat-meta">Across all desks & categories</div>
            </div>

            <div className="admin-stat-card highlight-green">
              <div className="stat-card-header">
                <span className="stat-label">Published</span>
              </div>
              <div className="stat-number">{stats.published || stories.filter(s => (s.status || 'published') === 'published').length}</div>
              <div className="stat-meta">Live on public website</div>
            </div>

            <div className="admin-stat-card highlight-orange">
              <div className="stat-card-header">
                <span className="stat-label">Drafts</span>
              </div>
              <div className="stat-number">{stats.drafts || stories.filter(s => s.status === 'draft').length}</div>
              <div className="stat-meta">Unpublished works in progress</div>
            </div>

            <div className="admin-stat-card highlight-purple">
              <div className="stat-card-header">
                <span className="stat-label">Scheduled Posts</span>
              </div>
              <div className="stat-number">{stats.scheduled || stories.filter(s => s.status === 'scheduled').length}</div>
              <div className="stat-meta">Auto-publish on timer queue</div>
            </div>

            <div className="admin-stat-card highlight-blue">
              <div className="stat-card-header">
                <span className="stat-label">Total Views</span>
              </div>
              <div className="stat-number">{(stats.totalViews || 0).toLocaleString()}</div>
              <div className="stat-meta">Reader impressions across site</div>
            </div>
          </div>

          {/* Filtering and Actions Bar */}
          <div className="admin-controls-card">
            <div className="controls-row-top">
              <div className="admin-search-wrapper">
                <Search size={18} className="search-icon-svg" />
                <input
                  type="text"
                  placeholder="Search stories by title, summary, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search-input"
                />
                {searchQuery && (
                  <button className="admin-search-clear" onClick={() => setSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="controls-right-cluster">
                <button className="admin-btn-secondary" onClick={handleReseedStories} title="Reseed default stories in MongoDB">
                  <Database size={15} />
                  <span>Reseed Database</span>
                </button>
                <button className="admin-btn-primary" onClick={() => handleOpenStoryEditor(null)}>
                  <Plus size={16} />
                  <span>+ New Story</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="controls-filters-row">
              <div className="filter-group">
                <span className="filter-label">Status:</span>
                <button 
                  className={`filter-pill ${selectedStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('all')}
                >
                  All ({stories.length})
                </button>
                <button 
                  className={`filter-pill ${selectedStatus === 'published' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('published')}
                >
                  🟢 Published ({stories.filter(s => (s.status || 'published') === 'published').length})
                </button>
                <button 
                  className={`filter-pill ${selectedStatus === 'draft' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('draft')}
                >
                  🟡 Drafts ({stories.filter(s => s.status === 'draft').length})
                </button>
                <button 
                  className={`filter-pill ${selectedStatus === 'scheduled' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('scheduled')}
                >
                  🟣 Scheduled ({stories.filter(s => s.status === 'scheduled').length})
                </button>
              </div>

              <div className="filter-group">
                <span className="filter-label">Brand:</span>
                <select 
                  value={selectedBrand} 
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Brands ({stories.length})</option>
                  {BRANDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <span className="filter-label">Category:</span>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="controls-results-count">
                <span>Showing <strong>{filteredStories.length}</strong> of <strong>{stories.length}</strong></span>
                {(searchQuery || selectedBrand !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                  <button 
                    className="clear-filters-link"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedBrand('all');
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stories Table */}
          <div className="admin-table-container">
            {loading ? (
              <div className="admin-loading-state">
                <RefreshCw size={28} className="spin-animate" />
                <p>Loading stories from database...</p>
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="admin-empty-state">
                <AlertCircle size={36} color="var(--accent-orange)" />
                <h4>No stories match your filter criteria</h4>
                <p>Try resetting filters or creating a new story using "+ New Story".</p>
                <button className="admin-btn-primary" onClick={() => handleOpenStoryEditor(null)}>
                  <Plus size={16} /> Create First Story
                </button>
              </div>
            ) : (
              <table className="admin-stories-table">
                <thead>
                  <tr>
                    <th style={{ width: '48%' }}>Story Article</th>
                    <th style={{ width: '13%' }}>Brand / Desk</th>
                    <th style={{ width: '13%' }}>Author</th>
                    <th style={{ width: '12%' }}>Status</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStories.map((story) => {
                    const storyId = story._id || story.id;
                    const isDraft = story.status === 'draft';
                    const isScheduled = story.status === 'scheduled';
                    const isPublished = (story.status || 'published') === 'published';

                    return (
                      <tr key={storyId} className="table-story-row">
                        <td className="story-meta-cell">
                          <div className="story-cell-wrapper">
                            <img 
                              src={story.image || story.heroImage} 
                              alt={story.title} 
                              className="story-table-thumb"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200';
                              }}
                            />
                            <div className="story-text-info">
                              <div className="story-tags-row">
                                <span className="category-badge-chip">{story.categoryTag || story.category || 'Editorial'}</span>
                                {story.tag && <span className="headline-tag-chip">{story.tag}</span>}
                              </div>
                              <h4 className="story-table-title" onClick={() => onSelectStory(story)}>
                                {story.title}
                              </h4>
                              {story.subtitle && <p className="story-table-subtitle">{story.subtitle}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="brand-cell">
                          <span className="brand-badge-pill">{story.brand || 'GoReadPost'}</span>
                        </td>

                        <td className="author-cell">
                          <img 
                            src={story.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'} 
                            alt={story.author?.name} 
                            className="author-avatar-tiny"
                          />
                          <span>{story.author?.name || 'Editorial'}</span>
                        </td>

                        <td className="status-cell">
                          {isPublished && (
                            <button 
                              className="status-pill-btn published"
                              onClick={() => handleToggleStoryStatus(story, 'draft')}
                              title="Click to move to Draft"
                            >
                              <span className="status-dot" />
                              Published
                            </button>
                          )}
                          {isDraft && (
                            <button 
                              className="status-pill-btn draft"
                              onClick={() => handleToggleStoryStatus(story, 'published')}
                              title="Click to Publish Now"
                            >
                              <span className="status-dot" />
                              Draft
                            </button>
                          )}
                          {isScheduled && (
                            <button 
                              className="status-pill-btn scheduled"
                              onClick={() => handleToggleStoryStatus(story, 'published')}
                              title="Click to Publish Now immediately"
                            >
                              <Clock size={12} />
                              Scheduled
                            </button>
                          )}
                          {isScheduled && story.scheduledPublishAt && (
                            <div style={{ fontSize: '0.7rem', color: '#9333ea', marginTop: '0.2rem' }}>
                              {new Date(story.scheduledPublishAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </td>

                        <td className="actions-cell" style={{ textAlign: 'right' }}>
                          <div className="action-buttons-cluster">
                            <button 
                              className="table-icon-btn view" 
                              onClick={() => onSelectStory(story)}
                              title="Preview Full Story Page"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              className="table-icon-btn edit" 
                              onClick={() => handleOpenStoryEditor(story)}
                              title="Edit Story"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              className="table-icon-btn delete" 
                              onClick={() => handleDeleteStory(story)}
                              title="Delete Story"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ========================================================
          TAB 2: NAVBAR MENU MANAGER
         ======================================================== */}
      {activeAdminTab === 'menu' && (
        <div className="admin-menu-manager-section">
          <div className="admin-controls-card">
            <div className="controls-row-top">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Navbar Menu Controller
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Create, edit, reorder, show/hide navbar links, and manage 3-column dropdowns in real time.
                </p>
              </div>

              <div className="controls-right-cluster">
                <button className="admin-btn-secondary" onClick={handleResetMenu}>
                  <RefreshCw size={15} />
                  <span>Reset Defaults</span>
                </button>
                <button className="admin-btn-primary" onClick={() => handleOpenMenuEditor(null)}>
                  <Plus size={18} />
                  <span>+ Add Nav Item</span>
                </button>
              </div>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-stories-table">
              <thead>
                <tr>
                  <th style={{ width: '8%' }}>Order / ID</th>
                  <th style={{ width: '22%' }}>Menu Label</th>
                  <th style={{ width: '12%' }}>Type</th>
                  <th style={{ width: '15%' }}>Target</th>
                  <th style={{ width: '18%' }}>Sub-Menu Dropdowns</th>
                  <th style={{ width: '10%' }}>Visibility</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item, idx) => {
                  const isExpanded = Boolean(expandedMenuIds[item.id]);
                  const cols = item.dropdownColumns || [];
                  const totalSubLinks = cols.reduce((sum, col) => sum + (col.items?.length || 0), 0);

                  return (
                    <React.Fragment key={item.id || idx}>
                      <tr>
                        <td>
                          <code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{idx + 1} ({item.id})</code>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 750 }}>
                            <span>{item.label}</span>
                            {item.isBadge && (
                              <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', background: '#ea580c', color: '#fff', borderRadius: '4px', fontWeight: 800 }}>
                                {item.badgeText || 'BADGE'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="menu-type-badge">{item.type || 'category'}</span>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.8rem', color: '#ea580c' }}>{item.target || item.id}</code>
                        </td>
                        <td>
                          {cols.length > 0 ? (
                            <button 
                              type="button"
                              className={`submenu-toggle-badge ${isExpanded ? 'expanded' : ''}`}
                              onClick={() => toggleMenuSubMenuExpand(item.id)}
                              title="Click to view and configure sub-menus"
                            >
                              <Layers size={13} />
                              <span>{cols.length} Col{cols.length > 1 ? 's' : ''} · {totalSubLinks} Link{totalSubLinks !== 1 ? 's' : ''}</span>
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="submenu-add-pill-btn"
                              onClick={() => handleOpenQuickSubMenu(item)}
                              title="Click to add sub-menu to this navbar item"
                            >
                              <Plus size={12} />
                              <span>+ Add Sub-Menu</span>
                            </button>
                          )}
                        </td>
                        <td>
                          <button 
                            className={`visibility-toggle-chip ${item.visible !== false ? 'visible' : 'hidden'}`}
                            onClick={() => handleToggleMenuVisibility(item)}
                            title="Click to toggle visibility"
                          >
                            {item.visible !== false ? <Check size={12} /> : <X size={12} />}
                            <span>{item.visible !== false ? 'Visible' : 'Hidden'}</span>
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-buttons-cluster">
                            <button
                              className="table-icon-btn add-sub"
                              onClick={() => handleOpenQuickSubMenu(item)}
                              title="Add Sub-Menu Link to this item"
                            >
                              <ListPlus size={15} />
                            </button>
                            <button 
                              className="table-icon-btn edit" 
                              onClick={() => handleOpenMenuEditor(item)}
                              title="Edit Nav Item"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              className="table-icon-btn delete" 
                              onClick={() => handleDeleteMenuItem(item)}
                              title="Delete Nav Item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-Menu Management Drawer */}
                      {isExpanded && (
                        <tr className="admin-submenu-drawer-tr">
                          <td colSpan={7}>
                            <div className="admin-submenu-drawer-container">
                              <div className="admin-submenu-drawer-header">
                                <div className="admin-submenu-drawer-title-wrap">
                                  <Layers size={18} color="#ea580c" />
                                  <div>
                                    <div className="admin-submenu-drawer-title">
                                      Sub-Menu Mega Dropdown for "{item.label}"
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                      Live columns and sub-menu links sync instantly with website header navigation.
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <button 
                                    type="button" 
                                    className="admin-btn-primary" 
                                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                                    onClick={() => handleOpenQuickSubMenu(item)}
                                  >
                                    <Plus size={14} />
                                    <span>+ Add Sub-Menu Link</span>
                                  </button>
                                  <button 
                                    type="button" 
                                    className="admin-btn-secondary" 
                                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                    onClick={() => toggleMenuSubMenuExpand(item.id)}
                                  >
                                    <X size={14} />
                                    <span>Close</span>
                                  </button>
                                </div>
                              </div>

                              {/* Columns Grid */}
                              <div className="admin-submenu-cols-grid">
                                {cols.map((col, cIdx) => (
                                  <div key={cIdx} className="admin-submenu-col-card">
                                    <div className="admin-submenu-col-header">
                                      <div className="admin-submenu-col-title">
                                        <span>{col.title}</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                          ({col.items?.length || 0})
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteColumnDirect(item, cIdx)}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                                        title={`Delete column "${col.title}"`}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>

                                    <div className="admin-submenu-links-list">
                                      {(!col.items || col.items.length === 0) ? (
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem 0' }}>
                                          No sub-links in this column yet.
                                        </div>
                                      ) : (
                                        col.items.map((sub, sIdx) => {
                                          const tag = sub.categoryId || sub.url || sub.query || sub.target || 'link';
                                          return (
                                            <div key={sIdx} className="admin-submenu-link-item">
                                              <div className="admin-sublink-meta">
                                                <span className="admin-sublink-name">{sub.label}</span>
                                                <span className="admin-sublink-tag">{tag}</span>
                                              </div>
                                              <button
                                                type="button"
                                                className="admin-sublink-delete-btn"
                                                onClick={() => handleDeleteSubLinkDirect(item, cIdx, sIdx)}
                                                title={`Delete "${sub.label}"`}
                                              >
                                                <X size={13} />
                                              </button>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>

                                    {/* Inline Quick-Add inside this column */}
                                    <div className="admin-sublink-inline-add">
                                      <div className="admin-sublink-inline-add-row">
                                        <input
                                          type="text"
                                          placeholder="Sub-link label (e.g. AI Startups)"
                                          value={inlineLinkData[`${item.id}-${cIdx}`]?.label || ''}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setInlineLinkData(prev => ({
                                              ...prev,
                                              [`${item.id}-${cIdx}`]: {
                                                ...(prev[`${item.id}-${cIdx}`] || { destType: 'category', target: 'startups' }),
                                                label: val
                                              }
                                            }));
                                          }}
                                          style={{ flex: 1.2 }}
                                        />
                                      </div>
                                      <div className="admin-sublink-inline-add-row">
                                        <select
                                          value={inlineLinkData[`${item.id}-${cIdx}`]?.destType || 'category'}
                                          onChange={(e) => {
                                            const type = e.target.value;
                                            const defaultTarget = type === 'category' ? 'startups' : type === 'page' ? 'just-in' : type === 'link' ? 'https://' : 'funding';
                                            setInlineLinkData(prev => ({
                                              ...prev,
                                              [`${item.id}-${cIdx}`]: {
                                                ...(prev[`${item.id}-${cIdx}`] || { label: '' }),
                                                destType: type,
                                                target: defaultTarget
                                              }
                                            }));
                                          }}
                                          style={{ flex: 0.9 }}
                                        >
                                          <option value="category">Category Desk</option>
                                          <option value="page">Page Route</option>
                                          <option value="link">Custom URL</option>
                                          <option value="query">Search Query</option>
                                        </select>

                                        {inlineLinkData[`${item.id}-${cIdx}`]?.destType === 'category' ? (
                                          <select
                                            value={inlineLinkData[`${item.id}-${cIdx}`]?.target || 'startups'}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setInlineLinkData(prev => ({
                                                ...prev,
                                                [`${item.id}-${cIdx}`]: {
                                                  ...(prev[`${item.id}-${cIdx}`] || { label: '', destType: 'category' }),
                                                  target: val
                                                }
                                              }));
                                            }}
                                            style={{ flex: 1 }}
                                          >
                                            {CATEGORIES.map(c => (
                                              <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                          </select>
                                        ) : (
                                          <input
                                            type="text"
                                            placeholder="Target (e.g. ai-story, /just-in, https://...)"
                                            value={inlineLinkData[`${item.id}-${cIdx}`]?.target || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setInlineLinkData(prev => ({
                                                ...prev,
                                                [`${item.id}-${cIdx}`]: {
                                                  ...(prev[`${item.id}-${cIdx}`] || { label: '', destType: 'link' }),
                                                  target: val
                                                }
                                              }));
                                            }}
                                            style={{ flex: 1 }}
                                          />
                                        )}

                                        <button
                                          type="button"
                                          className="admin-sublink-inline-add-btn"
                                          onClick={() => handleAddSubLinkDirect(item, cIdx)}
                                        >
                                          <Plus size={13} />
                                          <span>Add</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* + Add Column Card */}
                                <div className="admin-submenu-add-col-card">
                                  <FolderPlus size={24} color="#ea580c" />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                                    Add Dropdown Column
                                  </span>
                                  <input
                                    type="text"
                                    placeholder="Column Title (e.g. Playbooks)"
                                    value={inlineColTitles[item.id] || ''}
                                    onChange={(e) => setInlineColTitles({ ...inlineColTitles, [item.id]: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddColumnDirect(item, inlineColTitles[item.id]);
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="admin-btn-primary"
                                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                                    onClick={() => handleAddColumnDirect(item, inlineColTitles[item.id])}
                                  >
                                    <Plus size={13} />
                                    <span>Create Column</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: PAGES & DESKS MANAGER
         ======================================================== */}
      {activeAdminTab === 'pages' && (
        <div className="admin-pages-manager-section">
          <div className="admin-controls-card">
            <div className="controls-row-top">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Website Pages & Desk Manager
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Control headlines, hero banners, status, and navigation for every page across the portal.
                </p>
              </div>

              <div className="controls-right-cluster">
                <button className="admin-btn-secondary" onClick={handleResetPages}>
                  <RefreshCw size={15} />
                  <span>Reset Default Pages</span>
                </button>
                <button className="admin-btn-primary" onClick={() => handleOpenPageEditor(null)}>
                  <Plus size={18} />
                  <span>+ Create Page</span>
                </button>
              </div>
            </div>
          </div>

          <div className="admin-pages-grid">
            {pages.map((page) => (
              <div key={page.id} className="admin-page-card">
                <div className="page-card-banner">
                  <img src={page.heroBanner} alt={page.title} />
                  <span className={`page-card-badge ${page.status || 'active'}`}>
                    {page.status || 'active'}
                  </span>
                </div>
                <div className="page-card-body">
                  <h4 className="page-card-title">{page.title}</h4>
                  <div className="page-card-slug">Slug: {page.slug}</div>
                  <p className="page-card-desc">
                    {page.heroHeadline || page.description || 'No description provided.'}
                  </p>
                  <div className="page-card-footer">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Desk: {page.brand || 'GoReadPost'}
                    </span>
                    <div className="action-buttons-cluster">
                      <button 
                        className="table-icon-btn edit"
                        onClick={() => handleOpenPageEditor(page)}
                        title="Edit Page Settings"
                      >
                        <Edit2 size={15} />
                      </button>
                      {page.id !== 'home' && (
                        <button 
                          className="table-icon-btn delete"
                          onClick={() => handleDeletePage(page)}
                          title="Delete Page"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: STORY EDITOR (WITH SCHEDULE POST & DRAFTS)
         ======================================================== */}
      {isStoryEditorOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsStoryEditorOpen(false)}>
          <div className="admin-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>{editingStory ? 'Edit Story Article' : 'Create & Publish Story'}</h2>
                <p>Support for instant publish, scheduling for later, and draft saves.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsStoryEditorOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="admin-editor-form">
              <div className="form-grid-two-col">
                {/* Left Column: Core Content */}
                <div className="form-col">
                  <div className="form-group">
                    <label>Story Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Cynlr raises $10M to give robotic arms visual intuition"
                      value={storyFormData.title}
                      onChange={(e) => setStoryFormData({ ...storyFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Subtitle / Deck</label>
                    <input
                      type="text"
                      placeholder="e.g., Inside the Bengaluru deep tech lab creating automated vision"
                      value={storyFormData.subtitle}
                      onChange={(e) => setStoryFormData({ ...storyFormData, subtitle: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Summary / Excerpt *</label>
                    <textarea
                      rows={3}
                      placeholder="Brief teaser displayed on homepage cards..."
                      value={storyFormData.summary}
                      onChange={(e) => setStoryFormData({ ...storyFormData, summary: e.target.value })}
                    />
                  </div>

                  <div className="form-row-split">
                    <div className="form-group">
                      <label>Brand Desk</label>
                      <select
                        value={storyFormData.brand}
                        onChange={(e) => setStoryFormData({ ...storyFormData, brand: e.target.value })}
                      >
                        {BRANDS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={storyFormData.category}
                        onChange={(e) => setStoryFormData({ ...storyFormData, category: e.target.value })}
                      >
                        {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Full Body Paragraphs (Markdown / Text)</label>
                    <textarea
                      rows={8}
                      placeholder="Write your article body here. Separate paragraphs with double enter (blank line)..."
                      value={storyFormData.content}
                      onChange={(e) => setStoryFormData({ ...storyFormData, content: e.target.value })}
                    />
                  </div>
                </div>

                {/* Right Column: Scheduling, Meta & Media */}
                <div className="form-col">
                  {/* PUBLISHING & SCHEDULING CONTROLLER */}
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 800 }}>Publishing Workflow</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <button
                        type="button"
                        className={`filter-pill ${storyFormData.status === 'published' ? 'active' : ''}`}
                        onClick={() => setStoryFormData({ ...storyFormData, status: 'published' })}
                        style={{ textAlign: 'center', justifyContent: 'center' }}
                      >
                        🚀 Publish Now
                      </button>
                      <button
                        type="button"
                        className={`filter-pill ${storyFormData.status === 'draft' ? 'active' : ''}`}
                        onClick={() => setStoryFormData({ ...storyFormData, status: 'draft' })}
                        style={{ textAlign: 'center', justifyContent: 'center' }}
                      >
                        💾 Save Draft
                      </button>
                      <button
                        type="button"
                        className={`filter-pill ${storyFormData.status === 'scheduled' ? 'active' : ''}`}
                        onClick={() => setStoryFormData({ ...storyFormData, status: 'scheduled' })}
                        style={{ textAlign: 'center', justifyContent: 'center' }}
                      >
                        ⏰ Schedule Post
                      </button>
                    </div>

                    {storyFormData.status === 'scheduled' && (
                      <div className="schedule-control-box">
                        <div className="schedule-header">
                          <Clock size={16} />
                          <span>Schedule Publish Date & Time</span>
                        </div>
                        <input
                          type="datetime-local"
                          value={storyFormData.scheduledPublishAt}
                          onChange={(e) => setStoryFormData({ ...storyFormData, scheduledPublishAt: e.target.value })}
                          required={storyFormData.status === 'scheduled'}
                          className="modern-search-input"
                          style={{ background: 'var(--bg-card)' }}
                        />
                        <p style={{ fontSize: '0.74rem', color: '#9333ea', lineHeight: 1.4 }}>
                          The story will automatically convert to <strong>Published</strong> when the scheduled time arrives.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Featured Image URL *</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={storyFormData.image}
                      onChange={(e) => setStoryFormData({ ...storyFormData, image: e.target.value })}
                      required
                    />
                    {storyFormData.image && (
                      <div className="form-image-preview">
                        <img 
                          src={storyFormData.image} 
                          alt="Preview" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500';
                          }}
                        />
                        <span className="preview-label">Live Image Preview</span>
                      </div>
                    )}
                  </div>

                  <div className="form-row-split">
                    <div className="form-group">
                      <label>Category Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. ROBOTICS"
                        value={storyFormData.categoryTag}
                        onChange={(e) => setStoryFormData({ ...storyFormData, categoryTag: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Headline Tag / Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. EXCLUSIVE / JUST IN"
                        value={storyFormData.tag}
                        onChange={(e) => setStoryFormData({ ...storyFormData, tag: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-split">
                    <div className="form-group">
                      <label>Author Name</label>
                      <input
                        type="text"
                        value={storyFormData.authorName}
                        onChange={(e) => setStoryFormData({ ...storyFormData, authorName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Read Time</label>
                      <input
                        type="text"
                        value={storyFormData.readTime}
                        onChange={(e) => setStoryFormData({ ...storyFormData, readTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Comma-Separated Tags</label>
                    <input
                      type="text"
                      placeholder="AI, Robotics, Seed Funding, Deep Tech"
                      value={storyFormData.tags}
                      onChange={(e) => setStoryFormData({ ...storyFormData, tags: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsStoryEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={isSavingStory}>
                  {isSavingStory ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" /> Saving...
                    </>
                  ) : editingStory ? (
                    'Save Changes'
                  ) : storyFormData.status === 'draft' ? (
                    'Save as Draft'
                  ) : storyFormData.status === 'scheduled' ? (
                    'Schedule Story'
                  ) : (
                    'Publish Story Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: NAVBAR MENU ITEM EDITOR
         ======================================================== */}
      {isMenuEditorOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsMenuEditorOpen(false)}>
          <div className="admin-editor-modal" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>{editingMenuItem ? 'Edit Navbar Item' : 'Add New Navbar Item'}</h2>
                <p>Customize links, destinations, badges, and multi-column mega dropdowns.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsMenuEditorOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="admin-editor-form">
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div className="form-row-split">
                  <div className="form-group">
                    <label>Menu Label *</label>
                    <input
                      type="text"
                      placeholder="e.g. Podcasts / Global Tech"
                      value={menuFormData.label}
                      onChange={(e) => setMenuFormData({ ...menuFormData, label: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Identifier ID / Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. podcasts"
                      value={menuFormData.id}
                      onChange={(e) => setMenuFormData({ ...menuFormData, id: e.target.value })}
                      disabled={Boolean(editingMenuItem)}
                    />
                  </div>
                </div>

                <div className="form-row-split">
                  <div className="form-group">
                    <label>Action / Navigation Type</label>
                    <select
                      value={menuFormData.type}
                      onChange={(e) => setMenuFormData({ ...menuFormData, type: e.target.value })}
                    >
                      <option value="category">Category Desk Filter</option>
                      <option value="page">Website Page (Just In, AIStory, etc.)</option>
                      <option value="link">External / Custom URL</option>
                      <option value="anchor">Homepage Section Anchor (Scroll to ID)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Target Destination</label>
                    <input
                      type="text"
                      placeholder="e.g. just-in, founder-first, https://..."
                      value={menuFormData.target}
                      onChange={(e) => setMenuFormData({ ...menuFormData, target: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-split">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <input
                      type="checkbox"
                      id="hasDropdown"
                      checked={menuFormData.hasDropdown}
                      onChange={(e) => setMenuFormData({ ...menuFormData, hasDropdown: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="hasDropdown" style={{ cursor: 'pointer', fontWeight: 700 }}>
                      Enable Mega Dropdown Menu
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <input
                      type="checkbox"
                      id="visible"
                      checked={menuFormData.visible}
                      onChange={(e) => setMenuFormData({ ...menuFormData, visible: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="visible" style={{ cursor: 'pointer', fontWeight: 700 }}>
                      Visible in Header Navbar
                    </label>
                  </div>
                </div>

                <div className="form-row-split">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <input
                      type="checkbox"
                      id="isBadge"
                      checked={menuFormData.isBadge}
                      onChange={(e) => setMenuFormData({ ...menuFormData, isBadge: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="isBadge" style={{ cursor: 'pointer', fontWeight: 700 }}>
                      Show Pulse Badge
                    </label>
                  </div>

                  {menuFormData.isBadge && (
                    <div className="form-group">
                      <label>Badge Text</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026 / NEW"
                        value={menuFormData.badgeText}
                        onChange={(e) => setMenuFormData({ ...menuFormData, badgeText: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Visual Mega Sub-Menu Columns & Links Builder */}
                {menuFormData.hasDropdown && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.65rem' }}>
                      <div>
                        <label style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          Mega Sub-Menu Columns ({menuFormData.dropdownColumns.length})
                        </label>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                          Add multi-column sub-navigation with direct category, page, or custom URL links.
                        </p>
                      </div>

                      {/* Add Column inline row */}
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <input
                          type="text"
                          placeholder="New Column Title (e.g. Playbooks)"
                          value={modalNewColTitle}
                          onChange={(e) => setModalNewColTitle(e.target.value)}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', width: '210px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleModalAddColumn(modalNewColTitle);
                            }
                          }}
                        />
                        <button 
                          type="button" 
                          className="admin-btn-primary" 
                          onClick={() => handleModalAddColumn(modalNewColTitle)}
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          <Plus size={14} /> Add Column
                        </button>
                      </div>
                    </div>

                    {menuFormData.dropdownColumns.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No dropdown columns configured yet. Type a column title above and click "+ Add Column".
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                        {menuFormData.dropdownColumns.map((col, cIdx) => (
                          <div key={cIdx} className="admin-submenu-col-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                            <div className="admin-submenu-col-header">
                              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                                Column {cIdx + 1}: {col.title} ({col.items?.length || 0} links)
                              </strong>
                              <button
                                type="button"
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                                onClick={() => handleModalRemoveColumn(cIdx)}
                                title="Remove this column"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Sub-links in this column */}
                            <div className="admin-submenu-links-list">
                              {(!col.items || col.items.length === 0) ? (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                                  No sub-links in this column yet.
                                </div>
                              ) : (
                                col.items.map((it, iIdx) => {
                                  const tag = it.categoryId || it.url || it.query || it.target || 'link';
                                  return (
                                    <div key={iIdx} className="admin-submenu-link-item">
                                      <div className="admin-sublink-meta">
                                        <span className="admin-sublink-name">{it.label}</span>
                                        <span className="admin-sublink-tag">{tag}</span>
                                      </div>
                                      <button
                                        type="button"
                                        className="admin-sublink-delete-btn"
                                        onClick={() => handleModalRemoveLink(cIdx, iIdx)}
                                        title={`Remove "${it.label}"`}
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Inline Add Link to this column inside Modal */}
                            <div className="admin-sublink-inline-add">
                              <div className="admin-sublink-inline-add-row">
                                <input
                                  type="text"
                                  placeholder="Sub-link label (e.g. AI Startups)"
                                  value={modalNewLinkData[cIdx]?.label || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setModalNewLinkData(prev => ({
                                      ...prev,
                                      [cIdx]: {
                                        ...(prev[cIdx] || { destType: 'category', target: 'startups' }),
                                        label: val
                                      }
                                    }));
                                  }}
                                  style={{ flex: 1.2 }}
                                />
                              </div>
                              <div className="admin-sublink-inline-add-row">
                                <select
                                  value={modalNewLinkData[cIdx]?.destType || 'category'}
                                  onChange={(e) => {
                                    const type = e.target.value;
                                    const def = type === 'category' ? 'startups' : type === 'page' ? 'just-in' : type === 'link' ? 'https://' : 'funding';
                                    setModalNewLinkData(prev => ({
                                      ...prev,
                                      [cIdx]: {
                                        ...(prev[cIdx] || { label: '' }),
                                        destType: type,
                                        target: def
                                      }
                                    }));
                                  }}
                                  style={{ flex: 0.9 }}
                                >
                                  <option value="category">Category Desk</option>
                                  <option value="page">Page Route</option>
                                  <option value="link">Custom URL</option>
                                  <option value="query">Search Query</option>
                                </select>

                                {modalNewLinkData[cIdx]?.destType === 'category' ? (
                                  <select
                                    value={modalNewLinkData[cIdx]?.target || 'startups'}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setModalNewLinkData(prev => ({
                                        ...prev,
                                        [cIdx]: {
                                          ...(prev[cIdx] || { label: '', destType: 'category' }),
                                          target: val
                                        }
                                      }));
                                    }}
                                    style={{ flex: 1 }}
                                  >
                                    {CATEGORIES.map(c => (
                                      <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    placeholder="Target (e.g. /just-in, https://...)"
                                    value={modalNewLinkData[cIdx]?.target || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setModalNewLinkData(prev => ({
                                        ...prev,
                                        [cIdx]: {
                                          ...(prev[cIdx] || { label: '', destType: 'link' }),
                                          target: val
                                        }
                                      }));
                                    }}
                                    style={{ flex: 1 }}
                                  />
                                )}

                                <button
                                  type="button"
                                  className="admin-sublink-inline-add-btn"
                                  onClick={() => handleModalAddLink(cIdx)}
                                >
                                  <Plus size={13} />
                                  <span>Add Link</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsMenuEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingMenuItem ? 'Save Menu Item' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: QUICK ADD SUB-MENU LINK TO NAVBAR ITEM
         ======================================================== */}
      {quickSubMenuModal.isOpen && quickSubMenuModal.item && (
        <div className="admin-modal-overlay" onClick={() => setQuickSubMenuModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="admin-editor-modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>Add Sub-Menu to "{quickSubMenuModal.item.label}"</h2>
                <p>Attach a column link or create a new column in this navbar menu item.</p>
              </div>
              <button 
                type="button"
                className="modal-close-btn" 
                onClick={() => setQuickSubMenuModal(prev => ({ ...prev, isOpen: false }))}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickSubMenu} className="admin-editor-form">
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                
                {/* Column Selection */}
                <div className="form-group">
                  <label>Target Dropdown Column *</label>
                  {quickSubMenuModal.item.dropdownColumns && quickSubMenuModal.item.dropdownColumns.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <select
                        value={quickSubMenuModal.columnChoice === 'new' ? 'NEW_COLUMN' : quickSubMenuModal.selectedColIndex}
                        onChange={(e) => {
                          if (e.target.value === 'NEW_COLUMN') {
                            setQuickSubMenuModal(prev => ({ ...prev, columnChoice: 'new' }));
                          } else {
                            setQuickSubMenuModal(prev => ({
                              ...prev,
                              columnChoice: 'existing',
                              selectedColIndex: parseInt(e.target.value, 10)
                            }));
                          }
                        }}
                      >
                        {quickSubMenuModal.item.dropdownColumns.map((col, idx) => (
                          <option key={idx} value={idx}>
                            Existing Column {idx + 1}: {col.title} ({col.items?.length || 0} links)
                          </option>
                        ))}
                        <option value="NEW_COLUMN">+ Create New Column...</option>
                      </select>

                      {quickSubMenuModal.columnChoice === 'new' && (
                        <input
                          type="text"
                          placeholder="Enter new column title (e.g. Featured Playbooks)"
                          value={quickSubMenuModal.newColumnTitle}
                          onChange={(e) => setQuickSubMenuModal(prev => ({ ...prev, newColumnTitle: e.target.value }))}
                          required
                          autoFocus
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        This menu item has no columns yet. A new column will be created:
                      </p>
                      <input
                        type="text"
                        placeholder="Column Title (e.g. Featured Playbooks, Categories)"
                        value={quickSubMenuModal.newColumnTitle}
                        onChange={(e) => setQuickSubMenuModal(prev => ({ ...prev, newColumnTitle: e.target.value }))}
                        required
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Link Label */}
                <div className="form-group">
                  <label>Sub-Menu Link Label *</label>
                  <input
                    type="text"
                    placeholder="e.g. Generative AI Spotlight, Unicorn Playbooks"
                    value={quickSubMenuModal.label}
                    onChange={(e) => setQuickSubMenuModal(prev => ({ ...prev, label: e.target.value }))}
                    required
                  />
                </div>

                {/* Destination Type & Target */}
                <div className="form-row-split">
                  <div className="form-group">
                    <label>Destination Type</label>
                    <select
                      value={quickSubMenuModal.destType}
                      onChange={(e) => {
                        const type = e.target.value;
                        const def = type === 'category' ? 'startups' : type === 'page' ? 'just-in' : type === 'link' ? 'https://' : 'funding';
                        setQuickSubMenuModal(prev => ({ ...prev, destType: type, target: def }));
                      }}
                    >
                      <option value="category">Category Desk</option>
                      <option value="page">Website Page</option>
                      <option value="link">Custom / External URL</option>
                      <option value="query">Search Query</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Destination Target</label>
                    {quickSubMenuModal.destType === 'category' ? (
                      <select
                        value={quickSubMenuModal.target}
                        onChange={(e) => setQuickSubMenuModal(prev => ({ ...prev, target: e.target.value }))}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. just-in, ai-story, https://..."
                        value={quickSubMenuModal.target}
                        onChange={(e) => setQuickSubMenuModal(prev => ({ ...prev, target: e.target.value }))}
                        required
                      />
                    )}
                  </div>
                </div>

              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="admin-btn-secondary" 
                  onClick={() => setQuickSubMenuModal(prev => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  <Plus size={16} />
                  <span>Add Sub-Menu Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: PAGE SETTINGS EDITOR
         ======================================================== */}
      {isPageEditorOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsPageEditorOpen(false)}>
          <div className="admin-editor-modal" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>{editingPage ? `Edit Page: ${editingPage.title}` : 'Create New Page'}</h2>
                <p>Manage hero headlines, hero banner imagery, and page status.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsPageEditorOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="admin-editor-form">
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div className="form-row-split">
                  <div className="form-group">
                    <label>Page Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. AIStory - Deep Tech & Generative AI"
                      value={pageFormData.title}
                      onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>URL Slug / Route Key</label>
                    <input
                      type="text"
                      placeholder="e.g. ai-story"
                      value={pageFormData.slug}
                      onChange={(e) => setPageFormData({ ...pageFormData, slug: e.target.value })}
                      disabled={editingPage?.id === 'home'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hero Headline</label>
                  <input
                    type="text"
                    placeholder="Main headline displayed atop the page"
                    value={pageFormData.heroHeadline}
                    onChange={(e) => setPageFormData({ ...pageFormData, heroHeadline: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Hero Subhead / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short description or sub-heading for the desk"
                    value={pageFormData.heroSubhead}
                    onChange={(e) => setPageFormData({ ...pageFormData, heroSubhead: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Hero Banner Image URL</label>
                  <input
                    type="url"
                    value={pageFormData.heroBanner}
                    onChange={(e) => setPageFormData({ ...pageFormData, heroBanner: e.target.value })}
                  />
                  {pageFormData.heroBanner && (
                    <div className="form-image-preview">
                      <img src={pageFormData.heroBanner} alt="Hero preview" />
                      <span className="preview-label">Banner Preview</span>
                    </div>
                  )}
                </div>

                <div className="form-row-split">
                  <div className="form-group">
                    <label>Brand Desk Association</label>
                    <select
                      value={pageFormData.brand}
                      onChange={(e) => setPageFormData({ ...pageFormData, brand: e.target.value })}
                    >
                      {BRANDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Page Status</label>
                    <select
                      value={pageFormData.status}
                      onChange={(e) => setPageFormData({ ...pageFormData, status: e.target.value })}
                    >
                      <option value="active">Active (Live)</option>
                      <option value="hidden">Hidden</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsPageEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingPage ? 'Save Page Settings' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
