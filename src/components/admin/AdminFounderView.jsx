import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rocket, Plus, Trash2, Edit2, ArrowUp, ArrowDown, ArrowLeft,
  ArrowRight, Eye, Check, RefreshCw, Sparkles, Send, 
  Tag, BookOpen, Globe, Search, X, CheckCircle2, Bookmark, 
  Share2, Settings, ExternalLink
} from 'lucide-react';
import { 
  getStoredFounderData, 
  saveStoredFounderData, 
  DEFAULT_FOUNDER_DATA 
} from '../../data/founderData';
import { PageService } from '../../services/pageService';
import { ArticleService } from '../../services/articleService';
import './AdminFounderView.css';

function getArticleImage(art) {
  if (!art) return 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80';
  if (typeof art.featuredImage === 'string' && art.featuredImage) return art.featuredImage;
  if (art.featuredImage && typeof art.featuredImage === 'object') {
    let u = art.featuredImage.url;
    while (u && typeof u === 'object') u = u.url || '';
    if (typeof u === 'string' && u) return u;
  }
  if (typeof art.image === 'string' && art.image) return art.image;
  if (typeof art.heroImage === 'string' && art.heroImage) return art.heroImage;
  if (typeof art.coverImage === 'string' && art.coverImage) return art.coverImage;
  return 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80';
}

export default function AdminFounderView({ onShowToast, onNavigate }) {
  const [founderData, setFounderData] = useState(() => getStoredFounderData());
  const [selectedTag, setSelectedTag] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Article Picker modal (shown when clicking "+ Add Story")
  const [articlePicker, setArticlePicker] = useState({
    isOpen: false,
    search: '',
    category: 'all'
  });

  // Story edit / create modal
  const [storyModal, setStoryModal] = useState({
    isOpen: false,
    isCreate: false,
    index: null,
    data: {
      id: '',
      title: '',
      founder: '',
      company: '',
      stage: '',
      tag: 'unicorn',
      tagLabel: 'Unicorn Playbooks',
      readTime: '6 min read',
      excerpt: '',
      image: '',
      views: 12000,
      metric: ''
    }
  });

  // Filter tag edit / create modal
  const [tagModal, setTagModal] = useState({
    isOpen: false,
    isCreate: false,
    index: null,
    data: { id: '', label: '' }
  });

  // Header modal
  const [headerModal, setHeaderModal] = useState({
    isOpen: false,
    badgeText: '',
    backBtnText: ''
  });

  // CTA banner modal
  const [bannerModal, setBannerModal] = useState({
    isOpen: false,
    enabled: true,
    heading: '',
    subheading: '',
    buttonText: ''
  });

  // SEO modal
  const [seoModal, setSeoModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    keywords: ''
  });

  useEffect(() => {
    loadFounderPage();
    loadArticles();
  }, []);

  const loadFounderPage = async () => {
    setLoading(true);
    try {
      const page = await PageService.getPageById('founder-first').catch(() => null);
      if (page?.data && typeof page.data === 'object' && page.data.stories) {
        setFounderData(prev => ({ ...prev, ...page.data }));
      } else {
        setFounderData(getStoredFounderData());
      }
    } catch (e) {
      console.warn('Error loading founder page data:', e);
      setFounderData(getStoredFounderData());
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const res = await ArticleService.getArticles({ limit: 500 }).catch(() => null);
      let list = (res?.data && Array.isArray(res.data)) ? res.data : Array.isArray(res) ? res : [];
      if (!list || list.length === 0) {
        const adminRes = await ArticleService.getAdminArticles({ limit: 500 }).catch(() => null);
        list = (adminRes?.data && Array.isArray(adminRes.data)) ? adminRes.data : Array.isArray(adminRes) ? adminRes : [];
      }
      if (Array.isArray(list) && list.length > 0) {
        setArticles(list);
      }
    } catch (e) {
      console.warn('Error loading articles:', e);
    }
  };

  // ── ARTICLE PICKER HANDLERS ──
  // Triggered when clicking "+ Add Story" button
  const openCreateStory = () => {
    setArticlePicker({
      isOpen: true,
      search: '',
      category: 'all'
    });
  };

  // Instant 1-click add from article picker
  const handleQuickAddArticle = (art) => {
    const artImg = getArticleImage(art);
    const newStory = {
      id: `ff-${art.slug || art._id || Date.now()}`,
      title: art.title || '',
      founder: art.author?.name || art.authorName || art.author || 'Founder & CEO',
      company: art.categoryName || art.categoryLabel || art.category || 'Startup',
      stage: 'Series A / Growth',
      tag: founderData.filterTags?.[1]?.id || 'unicorn',
      tagLabel: founderData.filterTags?.[1]?.label || 'Unicorn Playbooks',
      readTime: art.readTime || `${art.readingTime || 5} min read`,
      excerpt: art.excerpt || art.subtitle || art.summary || '',
      image: artImg,
      views: art.views || Math.floor(Math.random() * 20000) + 5000,
      metric: '₹50 Cr+ ARR'
    };
    setFounderData(prev => ({
      ...prev,
      stories: [newStory, ...(prev.stories || [])]
    }));
    setArticlePicker({ isOpen: false, search: '', category: 'all' });
    if (onShowToast) onShowToast(`Added "${art.title.slice(0, 32)}..." to Founder Playbooks!`);
  };

  // Select article and open details modal to customize founder name, company, metric before adding
  const handleSelectArticleForCustomization = (art) => {
    const artImg = getArticleImage(art);
    setArticlePicker({ isOpen: false, search: '', category: 'all' });
    setStoryModal({
      isOpen: true,
      isCreate: true,
      index: null,
      data: {
        id: `ff-${art.slug || art._id || Date.now()}`,
        title: art.title || '',
        founder: art.author?.name || art.authorName || art.author || 'Founder & CEO',
        company: art.categoryName || art.categoryLabel || art.category || 'Startup',
        stage: 'Series A / Growth',
        tag: founderData.filterTags?.[1]?.id || 'unicorn',
        tagLabel: founderData.filterTags?.[1]?.label || 'Unicorn Playbooks',
        readTime: art.readTime || `${art.readingTime || 5} min read`,
        excerpt: art.excerpt || art.subtitle || art.summary || '',
        image: artImg,
        views: art.views || Math.floor(Math.random() * 20000) + 5000,
        metric: '₹50 Cr+ ARR'
      }
    });
  };

  // Create a completely custom card from scratch without picking an article
  const openBlankStoryModal = () => {
    setArticlePicker({ isOpen: false, search: '', category: 'all' });
    setStoryModal({
      isOpen: true,
      isCreate: true,
      index: null,
      data: {
        id: `ff-${Date.now()}`,
        title: '',
        founder: '',
        company: '',
        stage: 'Series A / Growth',
        tag: founderData.filterTags?.[1]?.id || 'unicorn',
        tagLabel: founderData.filterTags?.[1]?.label || 'Unicorn Playbooks',
        readTime: '5 min read',
        excerpt: '',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
        views: Math.floor(Math.random() * 20000) + 5000,
        metric: '₹50 Cr+ ARR'
      }
    });
  };

  // ── SAVE HANDLER ──
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save to local storage & dispatch real-time events
      saveStoredFounderData(founderData);

      // 2. Persist to backend /api/pages
      const pagePayload = {
        id: 'founder-first',
        slug: 'founder-first',
        title: 'Founder First - Playbooks & Builder Journeys',
        brand: 'GoReadPost',
        description: 'Unfiltered founder playbooks, bootstrapping lessons, and scaling blueprints from India’s audacious builders.',
        status: 'published',
        data: founderData,
        seo: founderData.seo || {}
      };

      try {
        await PageService.updatePage('founder-first', pagePayload);
      } catch (err) {
        await PageService.createPage(pagePayload).catch(() => {});
      }

      setSaveSuccess(true);
      if (onShowToast) onShowToast('Founder First Page permanently saved and published live!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Save failed:', e);
      if (onShowToast) onShowToast('Error saving changes to backend');
    } finally {
      setSaving(false);
    }
  };

  // ── STORY CRUD ──

  const openEditStory = (story, index) => {
    setStoryModal({
      isOpen: true,
      isCreate: false,
      index,
      data: { ...story }
    });
  };

  const saveStoryModal = () => {
    if (!storyModal.data.title.trim()) {
      alert('Please provide a story title.');
      return;
    }

    setFounderData(prev => {
      const list = [...(prev.stories || [])];
      if (storyModal.isCreate) {
        list.push({ ...storyModal.data, id: storyModal.data.id || `ff-${Date.now()}` });
      } else {
        list[storyModal.index] = { ...storyModal.data };
      }
      return { ...prev, stories: list };
    });

    setStoryModal({ isOpen: false, isCreate: false, index: null, data: {} });
  };

  const deleteStory = (index, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this founder story?')) return;
    setFounderData(prev => {
      const list = prev.stories.filter((_, i) => i !== index);
      return { ...prev, stories: list };
    });
  };

  const moveStory = (index, dir, e) => {
    if (e) e.stopPropagation();
    setFounderData(prev => {
      const list = [...prev.stories];
      const targetIndex = index + dir;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, stories: list };
    });
  };

  const handleSelectArticleToAutoFill = (articleId) => {
    const art = articles.find(a => (a.id === articleId || a._id === articleId));
    if (!art) return;

    setStoryModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        title: art.title || prev.data.title,
        excerpt: art.excerpt || art.summary || prev.data.excerpt,
        image: art.image || art.coverImage || prev.data.image,
        founder: art.author || art.founder || prev.data.founder,
        company: art.category || prev.data.company,
        readTime: art.readTime || `${art.readTimeMinutes || 5} min read`
      }
    }));
  };

  // ── FILTER TAGS CRUD ──
  const openCreateTag = () => {
    setTagModal({
      isOpen: true,
      isCreate: true,
      index: null,
      data: { id: '', label: '' }
    });
  };

  const openEditTag = (tag, index) => {
    setTagModal({
      isOpen: true,
      isCreate: false,
      index,
      data: { ...tag }
    });
  };

  const saveTagModal = () => {
    if (!tagModal.data.label.trim()) return;
    const cleanId = (tagModal.data.id || tagModal.data.label)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    setFounderData(prev => {
      const list = [...(prev.filterTags || [])];
      if (tagModal.isCreate) {
        list.push({ id: cleanId, label: tagModal.data.label.trim() });
      } else {
        list[tagModal.index] = { ...tagModal.data, id: cleanId };
      }
      return { ...prev, filterTags: list };
    });

    setTagModal({ isOpen: false, isCreate: false, index: null, data: {} });
  };

  const deleteTag = (index, e) => {
    if (e) e.stopPropagation();
    if (founderData.filterTags[index]?.id === 'all') {
      alert('The "All Playbooks" filter cannot be deleted.');
      return;
    }
    if (!window.confirm('Delete this filter tag?')) return;
    setFounderData(prev => ({
      ...prev,
      filterTags: prev.filterTags.filter((_, i) => i !== index)
    }));
  };

  // ── HEADER EDIT MODAL ──
  const openEditHeader = () => {
    setHeaderModal({
      isOpen: true,
      badgeText: founderData.header?.badgeText || 'FOUNDER FIRST DESK • ZERO TO ONE PLAYBOOKS',
      backBtnText: founderData.header?.backBtnText || 'Back to Frontpage'
    });
  };

  const saveHeaderModal = () => {
    setFounderData(prev => ({
      ...prev,
      header: {
        ...(prev.header || {}),
        badgeText: headerModal.badgeText,
        backBtnText: headerModal.backBtnText
      }
    }));
    setHeaderModal({ isOpen: false, badgeText: '', backBtnText: '' });
  };

  // ── BANNER EDIT MODAL ──
  const openEditBanner = () => {
    setBannerModal({
      isOpen: true,
      enabled: founderData.ctaBanner?.enabled !== false,
      heading: founderData.ctaBanner?.heading || 'Building something audacious in India?',
      subheading: founderData.ctaBanner?.subheading || 'Our editorial bureau covers breakthrough technology, bootstrapping miracles, and early-stage builders. Share your metrics and deck directly with our newsroom.',
      buttonText: founderData.ctaBanner?.buttonText || 'Submit Founder Pitch'
    });
  };

  const saveBannerModal = () => {
    setFounderData(prev => ({
      ...prev,
      ctaBanner: {
        ...(prev.ctaBanner || {}),
        enabled: bannerModal.enabled,
        heading: bannerModal.heading,
        subheading: bannerModal.subheading,
        buttonText: bannerModal.buttonText
      }
    }));
    setBannerModal({ isOpen: false, enabled: true, heading: '', subheading: '', buttonText: '' });
  };

  // ── SEO MODAL ──
  const openEditSeo = () => {
    setSeoModal({
      isOpen: true,
      title: founderData.seo?.title || '',
      description: founderData.seo?.description || '',
      keywords: founderData.seo?.keywords || ''
    });
  };

  const saveSeoModal = () => {
    setFounderData(prev => ({
      ...prev,
      seo: {
        ...(prev.seo || {}),
        title: seoModal.title,
        description: seoModal.description,
        keywords: seoModal.keywords
      }
    }));
    setSeoModal({ isOpen: false, title: '', description: '', keywords: '' });
  };

  const stories = founderData.stories || [];
  const filterTags = founderData.filterTags || [];
  const header = founderData.header || {};
  const ctaBanner = founderData.ctaBanner || {};

  const displayedStories = selectedTag === 'all' 
    ? stories 
    : stories.filter(s => s.tag === selectedTag);

  // Available categories for article picker filtering
  const pickerCategories = useMemo(() => {
    const set = new Set();
    articles.forEach(a => {
      const cat = a.categoryName || a.categoryLabel || a.category;
      if (cat && typeof cat === 'string') set.add(cat.trim());
    });
    return ['all', ...Array.from(set)];
  }, [articles]);

  // Filtered published articles pool for article picker modal
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      if (!a) return false;
      const q = (articlePicker.search || '').toLowerCase().trim();
      const title = (a.title || '').toLowerCase();
      const author = (a.author?.name || a.authorName || a.author || '').toLowerCase();
      const cat = (a.categoryName || a.categoryLabel || a.category || '').toLowerCase();
      const matchesSearch = !q || title.includes(q) || author.includes(q) || cat.includes(q);

      if (articlePicker.category !== 'all') {
        const target = articlePicker.category.toLowerCase().trim();
        const matchesCategory = cat === target || cat.includes(target);
        return matchesSearch && matchesCategory;
      }
      return matchesSearch;
    });
  }, [articles, articlePicker.search, articlePicker.category]);

  return (
    <div className="afv-live-root">
      {/* ── DESIGNED STUDIO HEADER BAR ── */}
      <header className="afv-studio-topbar">
        <div className="afv-topbar-left">
          <button 
            type="button" 
            className="afv-header-btn-back"
            onClick={() => onNavigate ? onNavigate('/admin/pages') : window.history.back()}
            title="Return to Pages Management"
          >
            <ArrowLeft size={16} />
            <span>Back to Pages</span>
          </button>
        </div>

        <div className="afv-topbar-right">
          <button 
            type="button" 
            className="afv-header-btn-add"
            onClick={openCreateStory}
            title="Add a new founder playbook card"
          >
            <Plus size={16} />
            <span>Add Story</span>
          </button>

          <button 
            type="button" 
            className={`afv-header-btn-save ${saveSuccess ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
            title="Save all changes live to database"
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="spinning" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Save Live</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── LIVE FOUNDER FIRST PAGE CANVAS ── */}
      <div className="afv-live-canvas">
        <div className="ffp-page-container">
          {/* Filter Tabs */}
          <div className="ffp-filter-bar">
            <div className="ffp-filter-pills" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              {filterTags.map((tab, idx) => (
                <div key={tab.id} className="afv-tag-item-wrap">
                  <button
                    className={`ffp-tab-btn ${selectedTag === tab.id ? 'active' : ''}`}
                    onClick={() => setSelectedTag(tab.id)}
                    onDoubleClick={() => openEditTag(tab, idx)}
                    title="Click to filter • Double click to edit tag"
                  >
                    {tab.label}
                  </button>
                  {tab.id !== 'all' && (
                    <button 
                      type="button" 
                      className="afv-tag-del-btn" 
                      title={`Delete "${tab.label}" tag`}
                      onClick={(e) => deleteTag(idx, e)}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className="afv-add-tag-inline-btn" 
                onClick={openCreateTag}
                title="Add a new filter category"
              >
                <Plus size={12} />
                <span>Add Tag</span>
              </button>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="ffp-stories-grid">
            {displayedStories.map((story, idx) => (
              <div 
                key={story.id || idx} 
                className="ffp-story-card afv-live-card"
                onClick={() => openEditStory(story, idx)}
                title="Click anywhere on card to edit details"
              >
                {/* On-Card Live Floating Action Toolbar */}
                <div className="afv-card-hover-toolbar" onClick={e => e.stopPropagation()}>
                  <button 
                    type="button" 
                    className="afv-card-tool-btn" 
                    title="Move Left"
                    disabled={idx === 0}
                    onClick={(e) => moveStory(idx, -1, e)}
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <button 
                    type="button" 
                    className="afv-card-tool-btn" 
                    title="Move Right"
                    disabled={idx === stories.length - 1}
                    onClick={(e) => moveStory(idx, 1, e)}
                  >
                    <ArrowRight size={13} />
                  </button>
                  <button 
                    type="button" 
                    className="afv-card-tool-btn" 
                    title="Edit Story"
                    onClick={() => openEditStory(story, idx)}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    type="button" 
                    className="afv-card-tool-btn danger" 
                    title="Delete Story"
                    onClick={(e) => deleteStory(idx, e)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="ffp-story-media">
                  <img src={story.image} alt={story.title} className="ffp-story-img" />
                  <div className="ffp-story-badge-strip">
                    <span className="ffp-category-pill">{story.tagLabel || story.tag}</span>
                    {story.metric && <span className="ffp-metric-pill">{story.metric}</span>}
                  </div>
                </div>

                <div className="ffp-story-body">
                  <div className="ffp-founder-line">
                    <strong>{story.founder}</strong>{story.company ? <> • <span className="ffp-company-tag">{story.company}</span></> : null}
                  </div>
                  <h3 className="ffp-story-title">
                    {story.title}
                  </h3>
                  <p className="ffp-story-excerpt">{story.excerpt}</p>
                  
                  <div className="ffp-story-footer">
                    <div className="ffp-story-meta">
                      <span><Eye size={12} /> {Number(story.views || 0).toLocaleString()} reads</span>
                      <span>•</span>
                      <span>{story.readTime || '5 min read'}</span>
                    </div>
                    <div className="ffp-story-actions">
                      <button 
                        type="button"
                        className="ffp-icon-btn" 
                        title="Bookmark Playbook"
                        onClick={e => e.stopPropagation()}
                      >
                        <Bookmark size={15} />
                      </button>
                      <button 
                        type="button"
                        className="ffp-icon-btn"
                        title="Share Playbook"
                        onClick={e => e.stopPropagation()}
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM FLOATING SEO & CONTROLS BAR ── */}
      <footer className="afv-bottom-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button" 
            className="afv-back-btn" 
            onClick={() => onNavigate ? onNavigate('/admin/pages') : window.history.back()}
            title="Exit studio back to Pages CMS"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} />
            <span>Exit Studio</span>
          </button>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 650 }}>
            {stories.length} Playbook Cards Published
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {filterTags.length} Active Categories
          </span>
        </div>
        <button 
          type="button" 
          className="afv-back-btn" 
          onClick={openEditSeo}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Settings size={14} />
          <span>Edit Page SEO & Meta</span>
        </button>
      </footer>

      {/* ── ARTICLE PICKER MODAL (When clicking "+ Add Story") ── */}
      {articlePicker.isOpen && (
        <div className="afv-modal-overlay" onClick={() => setArticlePicker(prev => ({ ...prev, isOpen: false }))}>
          <div className="afv-picker-modal-dialog" onClick={e => e.stopPropagation()}>
            {/* Search and Category Filter Toolbar with Close Button */}
            <div className="afv-picker-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="afv-picker-search-box" style={{ flex: 1 }}>
                  <Search size={16} color="#64748b" />
                  <input 
                    type="text" 
                    className="afv-picker-search-input"
                    placeholder="Search articles by title, author, category..."
                    value={articlePicker.search}
                    onChange={e => setArticlePicker(prev => ({ ...prev, search: e.target.value }))}
                    autoFocus
                  />
                  {articlePicker.search && (
                    <button 
                      type="button" 
                      className="afv-picker-clear-search"
                      onClick={() => setArticlePicker(prev => ({ ...prev, search: '' }))}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button 
                  type="button" 
                  className="afv-icon-btn" 
                  onClick={() => setArticlePicker(prev => ({ ...prev, isOpen: false }))}
                  title="Close"
                  style={{ width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0 }}
                >
                  <X size={18} />
                </button>
              </div>

              {pickerCategories.length > 1 && (
                <div className="afv-picker-category-pills">
                  {pickerCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`afv-picker-cat-btn ${articlePicker.category === cat ? 'active' : ''}`}
                      onClick={() => setArticlePicker(prev => ({ ...prev, category: cat }))}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Articles List / Grid */}
            <div className="afv-picker-list-viewport">
              {filteredArticles.length === 0 ? (
                <div className="afv-picker-empty">
                  <BookOpen size={40} color="#94a3b8" />
                  <h4>No matching articles found</h4>
                  <p>Try searching for a different keyword or select "All" categories.</p>
                </div>
              ) : (
                <div className="afv-picker-articles-grid">
                  {filteredArticles.map((art, idx) => {
                    const artImg = getArticleImage(art);
                    const artAuthor = art.author?.name || art.authorName || art.author || 'Editorial';
                    const artCat = art.categoryName || art.categoryLabel || art.category || 'Article';
                    const rawRead = art.readTime || art.readingTime;
                    const artRead = typeof rawRead === 'number' 
                      ? `${rawRead} min read` 
                      : typeof rawRead === 'string' 
                        ? (rawRead.includes('min') ? rawRead : `${rawRead} min read`) 
                        : '5 min read';

                    return (
                      <div 
                        key={art._id || art.id || idx} 
                        className="afv-picker-card"
                        onClick={() => handleQuickAddArticle(art)}
                        title="Click to add this article"
                      >
                        <div className="afv-picker-card-media">
                          <img src={artImg} alt={art.title} className="afv-picker-card-img" />
                          <span className="afv-picker-card-cat">{artCat}</span>
                        </div>
                        <div className="afv-picker-card-content">
                          <div className="afv-picker-card-meta">
                            <span className="afv-picker-author">{artAuthor}</span>
                            <span>•</span>
                            <span>{artRead}</span>
                          </div>
                          <h4 className="afv-picker-card-title">{art.title}</h4>
                          <p className="afv-picker-card-excerpt">
                            {art.excerpt || art.subtitle || art.summary || 'Read full playbook and insights...'}
                          </p>
                          <div className="afv-picker-card-actions" onClick={e => e.stopPropagation()}>
                            <button 
                              type="button" 
                              className="afv-picker-btn-quick"
                              onClick={() => handleQuickAddArticle(art)}
                              title="Add this article to page"
                            >
                              <Plus size={14} />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Picker Footer */}
            <div className="afv-picker-footer">
              <span className="afv-picker-count-text">
                Showing <strong>{filteredArticles.length}</strong> of {articles.length} articles
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  type="button" 
                  className="afv-picker-btn-manual"
                  onClick={openBlankStoryModal}
                  title="Create a custom card without picking an article"
                >
                  <Plus size={14} />
                  <span>Create Blank Playbook</span>
                </button>
                <button 
                  type="button" 
                  className="afv-btn-cancel"
                  onClick={() => setArticlePicker(prev => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STORY EDIT MODAL ── */}
      {storyModal.isOpen && (
        <div className="afv-modal-overlay" onClick={() => setStoryModal({ isOpen: false, isCreate: false, index: null, data: {} })}>
          <div className="afv-modal-content" onClick={e => e.stopPropagation()}>
            <div className="afv-modal-header">
              <h3>{storyModal.isCreate ? 'Add Founder Playbook' : 'Edit Founder Playbook'}</h3>
              <button 
                type="button" 
                className="afv-icon-btn" 
                onClick={() => setStoryModal({ isOpen: false, isCreate: false, index: null, data: {} })}
              >
                <X size={16} />
              </button>
            </div>

            <div className="afv-modal-body">
              {articles.length > 0 && (
                <div className="afv-field-group" style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label className="afv-label" style={{ color: '#0f172a' }}>
                    <Sparkles size={13} color="#dc2626" />
                    <span>Auto-Fill from Existing Published Article</span>
                  </label>
                  <select 
                    className="afv-select"
                    onChange={(e) => handleSelectArticleToAutoFill(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select an article to import title, excerpt, and image…</option>
                    {articles.map(art => (
                      <option key={art.id || art._id} value={art.id || art._id}>
                        {art.title} ({art.category || 'Article'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="afv-field-group">
                <label className="afv-label">Playbook Headline / Title *</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={storyModal.data.title || ''}
                  onChange={(e) => setStoryModal(prev => ({
                    ...prev,
                    data: { ...prev.data, title: e.target.value }
                  }))}
                  placeholder="e.g. How Zerodha Built a ₹4,000 Crore Profit Engine..."
                />
              </div>

              <div className="afv-form-grid">
                <div className="afv-field-group">
                  <label className="afv-label">Founder(s) Name</label>
                  <input 
                    type="text" 
                    className="afv-input"
                    value={storyModal.data.founder || ''}
                    onChange={(e) => setStoryModal(prev => ({
                      ...prev,
                      data: { ...prev.data, founder: e.target.value }
                    }))}
                    placeholder="e.g. Nithin Kamath & Nikhil Kamath"
                  />
                </div>

                <div className="afv-field-group">
                  <label className="afv-label">Company Name</label>
                  <input 
                    type="text" 
                    className="afv-input"
                    value={storyModal.data.company || ''}
                    onChange={(e) => setStoryModal(prev => ({
                      ...prev,
                      data: { ...prev.data, company: e.target.value }
                    }))}
                    placeholder="e.g. Zerodha"
                  />
                </div>
              </div>

              <div className="afv-form-grid">
                <div className="afv-field-group">
                  <label className="afv-label">Stage / Funding</label>
                  <input 
                    type="text" 
                    className="afv-input"
                    value={storyModal.data.stage || ''}
                    onChange={(e) => setStoryModal(prev => ({
                      ...prev,
                      data: { ...prev.data, stage: e.target.value }
                    }))}
                    placeholder="e.g. Bootstrapped / Profitable"
                  />
                </div>

                <div className="afv-field-group">
                  <label className="afv-label">Metric Pill (Hero stat)</label>
                  <input 
                    type="text" 
                    className="afv-input"
                    value={storyModal.data.metric || ''}
                    onChange={(e) => setStoryModal(prev => ({
                      ...prev,
                      data: { ...prev.data, metric: e.target.value }
                    }))}
                    placeholder="e.g. ₹4,000 Cr+ PAT"
                  />
                </div>
              </div>

              <div className="afv-form-grid">
                <div className="afv-field-group">
                  <label className="afv-label">Filter Category Tag</label>
                  <select 
                    className="afv-select"
                    value={storyModal.data.tag || 'unicorn'}
                    onChange={(e) => {
                      const selected = founderData.filterTags?.find(t => t.id === e.target.value);
                      setStoryModal(prev => ({
                        ...prev,
                        data: { 
                          ...prev.data, 
                          tag: e.target.value,
                          tagLabel: selected ? selected.label : prev.data.tagLabel
                        }
                      }));
                    }}
                  >
                    {(founderData.filterTags || []).filter(t => t.id !== 'all').map(tag => (
                      <option key={tag.id} value={tag.id}>{tag.label} ({tag.id})</option>
                    ))}
                  </select>
                </div>

                <div className="afv-field-group">
                  <label className="afv-label">Custom Tag Badge Label</label>
                  <input 
                    type="text" 
                    className="afv-input"
                    value={storyModal.data.tagLabel || ''}
                    onChange={(e) => setStoryModal(prev => ({
                      ...prev,
                      data: { ...prev.data, tagLabel: e.target.value }
                    }))}
                    placeholder="e.g. Bootstrapped Heroes"
                  />
                </div>
              </div>

              <div className="afv-form-grid">
                <div className="afv-field-group">
                  <label className="afv-label">Estimated Read Time</label>
                  <input 
                    type="text" 
                    className="afv-input"
                    value={storyModal.data.readTime || ''}
                    onChange={(e) => setStoryModal(prev => ({
                      ...prev,
                      data: { ...prev.data, readTime: e.target.value }
                    }))}
                    placeholder="e.g. 6 min read"
                  />
                </div>

                <div className="afv-field-group">
                  <label className="afv-label">Total Reads / Views</label>
                  <input 
                    type="number" 
                    className="afv-input"
                    value={storyModal.data.views || 0}
                    onChange={(e) => setStoryModal(prev => ({
                      ...prev,
                      data: { ...prev.data, views: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="38000"
                  />
                </div>
              </div>

              <div className="afv-field-group">
                <label className="afv-label">Cover Image URL</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={storyModal.data.image || ''}
                  onChange={(e) => setStoryModal(prev => ({
                    ...prev,
                    data: { ...prev.data, image: e.target.value }
                  }))}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {storyModal.data.image && (
                  <div style={{ marginTop: '8px' }}>
                    <img 
                      src={storyModal.data.image} 
                      alt="Preview" 
                      style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                  </div>
                )}
              </div>

              <div className="afv-field-group">
                <label className="afv-label">Excerpt / Story Summary</label>
                <textarea 
                  className="afv-textarea"
                  rows={3}
                  value={storyModal.data.excerpt || ''}
                  onChange={(e) => setStoryModal(prev => ({
                    ...prev,
                    data: { ...prev.data, excerpt: e.target.value }
                  }))}
                  placeholder="The counter-intuitive decisions that defied conventional startup playbooks..."
                />
              </div>
            </div>

            <div className="afv-modal-footer">
              <button 
                type="button" 
                className="afv-btn-cancel"
                onClick={() => setStoryModal({ isOpen: false, isCreate: false, index: null, data: {} })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="afv-btn-submit"
                onClick={saveStoryModal}
              >
                {storyModal.isCreate ? 'Add Playbook' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER TAG EDIT MODAL ── */}
      {tagModal.isOpen && (
        <div className="afv-modal-overlay" onClick={() => setTagModal({ isOpen: false, isCreate: false, index: null, data: {} })}>
          <div className="afv-modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="afv-modal-header">
              <h3>{tagModal.isCreate ? 'Add Category Tag' : 'Edit Category Tag'}</h3>
              <button 
                type="button" 
                className="afv-icon-btn" 
                onClick={() => setTagModal({ isOpen: false, isCreate: false, index: null, data: {} })}
              >
                <X size={16} />
              </button>
            </div>

            <div className="afv-modal-body">
              <div className="afv-field-group">
                <label className="afv-label">Tag Label (Display text) *</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={tagModal.data.label || ''}
                  onChange={(e) => setTagModal(prev => ({
                    ...prev,
                    data: { ...prev.data, label: e.target.value }
                  }))}
                  placeholder="e.g. Bootstrapped Heroes"
                />
              </div>

              <div className="afv-field-group">
                <label className="afv-label">Identifier Slug (Optional)</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={tagModal.data.id || ''}
                  onChange={(e) => setTagModal(prev => ({
                    ...prev,
                    data: { ...prev.data, id: e.target.value }
                  }))}
                  placeholder="e.g. bootstrapped"
                />
              </div>
            </div>

            <div className="afv-modal-footer">
              <button 
                type="button" 
                className="afv-btn-cancel"
                onClick={() => setTagModal({ isOpen: false, isCreate: false, index: null, data: {} })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="afv-btn-submit"
                onClick={saveTagModal}
              >
                Save Filter Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER EDIT MODAL ── */}
      {headerModal.isOpen && (
        <div className="afv-modal-overlay" onClick={() => setHeaderModal({ isOpen: false, badgeText: '', backBtnText: '' })}>
          <div className="afv-modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="afv-modal-header">
              <h3>Edit Desk Header</h3>
              <button 
                type="button" 
                className="afv-icon-btn" 
                onClick={() => setHeaderModal({ isOpen: false, badgeText: '', backBtnText: '' })}
              >
                <X size={16} />
              </button>
            </div>

            <div className="afv-modal-body">
              <div className="afv-field-group">
                <label className="afv-label">Back Button Text</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={headerModal.backBtnText}
                  onChange={(e) => setHeaderModal(prev => ({ ...prev, backBtnText: e.target.value }))}
                  placeholder="e.g. Back to Frontpage"
                />
              </div>
            </div>

            <div className="afv-modal-footer">
              <button 
                type="button" 
                className="afv-btn-cancel"
                onClick={() => setHeaderModal({ isOpen: false, badgeText: '', backBtnText: '' })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="afv-btn-submit"
                onClick={saveHeaderModal}
              >
                Save Header
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BANNER EDIT MODAL ── */}
      {bannerModal.isOpen && (
        <div className="afv-modal-overlay" onClick={() => setBannerModal({ isOpen: false, enabled: true, heading: '', subheading: '', buttonText: '' })}>
          <div className="afv-modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="afv-modal-header">
              <h3>Edit Pitch Callout Banner</h3>
              <button 
                type="button" 
                className="afv-icon-btn" 
                onClick={() => setBannerModal({ isOpen: false, enabled: true, heading: '', subheading: '', buttonText: '' })}
              >
                <X size={16} />
              </button>
            </div>

            <div className="afv-modal-body">
              <div className="afv-field-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 750 }}>
                  <input 
                    type="checkbox" 
                    checked={bannerModal.enabled}
                    onChange={(e) => setBannerModal(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                  <span>Show Callout Banner on Page</span>
                </label>
              </div>

              <div className="afv-field-group">
                <label className="afv-label">Banner Heading</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={bannerModal.heading}
                  onChange={(e) => setBannerModal(prev => ({ ...prev, heading: e.target.value }))}
                  placeholder="e.g. Building something audacious in India?"
                />
              </div>

              <div className="afv-field-group">
                <label className="afv-label">Subheading & Instructions</label>
                <textarea 
                  className="afv-textarea"
                  rows={3}
                  value={bannerModal.subheading}
                  onChange={(e) => setBannerModal(prev => ({ ...prev, subheading: e.target.value }))}
                  placeholder="Our editorial bureau covers breakthrough technology..."
                />
              </div>

              <div className="afv-field-group">
                <label className="afv-label">Button Label</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={bannerModal.buttonText}
                  onChange={(e) => setBannerModal(prev => ({ ...prev, buttonText: e.target.value }))}
                  placeholder="e.g. Submit Founder Pitch"
                />
              </div>
            </div>

            <div className="afv-modal-footer">
              <button 
                type="button" 
                className="afv-btn-cancel"
                onClick={() => setBannerModal({ isOpen: false, enabled: true, heading: '', subheading: '', buttonText: '' })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="afv-btn-submit"
                onClick={saveBannerModal}
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEO MODAL ── */}
      {seoModal.isOpen && (
        <div className="afv-modal-overlay" onClick={() => setSeoModal({ isOpen: false, title: '', description: '', keywords: '' })}>
          <div className="afv-modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="afv-modal-header">
              <h3>Edit Founder First SEO & Metadata</h3>
              <button 
                type="button" 
                className="afv-icon-btn" 
                onClick={() => setSeoModal({ isOpen: false, title: '', description: '', keywords: '' })}
              >
                <X size={16} />
              </button>
            </div>

            <div className="afv-modal-body">
              <div className="afv-field-group">
                <label className="afv-label">Page Title</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={seoModal.title}
                  onChange={(e) => setSeoModal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Founder First | Zero-to-One Playbooks"
                />
              </div>

              <div className="afv-field-group">
                <label className="afv-label">Meta Description</label>
                <textarea 
                  className="afv-textarea"
                  rows={3}
                  value={seoModal.description}
                  onChange={(e) => setSeoModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Unfiltered founder playbooks..."
                />
              </div>

              <div className="afv-field-group">
                <label className="afv-label">Keywords (Comma separated)</label>
                <input 
                  type="text" 
                  className="afv-input"
                  value={seoModal.keywords}
                  onChange={(e) => setSeoModal(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="startups, founders, bootstrapped, zero to one"
                />
              </div>
            </div>

            <div className="afv-modal-footer">
              <button 
                type="button" 
                className="afv-btn-cancel"
                onClick={() => setSeoModal({ isOpen: false, title: '', description: '', keywords: '' })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="afv-btn-submit"
                onClick={saveSeoModal}
              >
                Save SEO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Action Button for instant access when scrolling */}
      <button 
        type="button" 
        className={`afv-floating-save-btn ${saveSuccess ? 'saved' : ''}`}
        onClick={handleSave}
        disabled={saving}
        title="Save all changes live to database"
      >
        {saving ? (
          <>
            <RefreshCw size={15} className="spinning" />
            <span>Saving...</span>
          </>
        ) : saveSuccess ? (
          <>
            <CheckCircle2 size={16} />
            <span>Saved Live!</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={16} />
            <span>Save Live</span>
          </>
        )}
      </button>
    </div>
  );
}
