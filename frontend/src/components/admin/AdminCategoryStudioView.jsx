import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Save, Eye, EyeOff, Layers, Sparkles, 
  RefreshCw, Check, CheckCircle2, AlertCircle, Plus, Trash2, 
  Pin, Edit2, Edit3, Search, X, Monitor, Tablet, Smartphone, 
  ExternalLink, Globe, Sliders, Image as ImageIcon, BookOpen, Clock
} from 'lucide-react';
import { PageService } from '../../services/pageService';
import { ArticleService } from '../../services/articleService';
import { StoryService, getDefaultSeedStories } from '../../services/storyService';
import { ALL_STORIES } from '../../data/storiesData';
import { ALL_HER_STORIES } from '../../data/herStoryData';
import { ALL_ENTERPRISE_STORIES } from '../../data/enterpriseStoryData';
import { ALL_SMB_STORIES } from '../../data/smbStoryData';
import { CORE_CATEGORIES } from '../CategoryContentPage';
import './AdminCategoryStudioView.css';

// Normalize article object
const normalizeStory = (s, idx = 0) => {
  if (!s) return null;
  const id = String(s.id || s._id || s.slug || `story-${idx}`);
  const title = s.title || 'Untitled Article';
  const excerpt = s.excerpt || s.subtitle || s.summary || s.description || '';
  const cat = typeof s.category === 'object' && s.category?.name ? s.category.name : (s.categoryName || s.categoryLabel || s.category || 'Startups');
  const catSlug = (s.categorySlug || cat || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const image = s.image || s.featuredImage?.url || (typeof s.featuredImage === 'string' ? s.featuredImage : null) || s.heroImage || s.coverImage || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80';
  const author = typeof s.author === 'object' && s.author?.name ? s.author.name : (s.authorName || s.author || 'Editorial Bureau');
  const authorAvatar = (typeof s.author === 'object' && s.author?.avatar) ? s.author.avatar : (s.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80');
  const date = s.publishedAt ? new Date(s.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (s.date || 'Today');
  const readTime = s.readTime || (s.readingTime ? `${s.readingTime} min read` : '5 min read');

  return {
    ...s,
    id,
    _id: s._id || id,
    title,
    excerpt,
    category: cat,
    categoryName: cat,
    categorySlug: catSlug,
    image,
    author,
    authorName: author,
    authorAvatar,
    date,
    readTime,
    publishedAt: s.publishedAt || new Date().toISOString()
  };
};

export default function AdminCategoryStudioView({ onShowToast, onNavigate, isStudioView = false }) {
  // Loading & saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Master articles pool
  const [allArticles, setAllArticles] = useState([]);
  const [page, setPage] = useState(null);

  // Active Category filter on the live page
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Layout & Feed Settings
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' (4 cards in one row)
  const [showHero, setShowHero] = useState(true);

  // 2. Hero Spotlight Banner State
  const [heroHeading, setHeroHeading] = useState('Curated Reporting Across All Editorial Verticals');
  const [heroSubhead, setHeroSubhead] = useState('Explore deep insights, operational lessons, and strategic perspectives from Indian founders and industry pioneers.');
  const [heroBadge, setHeroBadge] = useState('EDITORIAL DESKS');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80');
  const [heroBtnText, setHeroBtnText] = useState('Explore Stories');

  // 3. Category Curation (Per-category curated list of stories)
  const [categoryCuration, setCategoryCuration] = useState({});

  // 4. Modals state
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [pickerModal, setPickerModal] = useState({ isOpen: false, targetIndex: null });
  const [pickerSearch, setPickerSearch] = useState('');
  const [editModal, setEditModal] = useState({ isOpen: false, index: null, data: null });

  // Load category page configuration & articles
  useEffect(() => {
    loadCategoryStudioData();
  }, []);

  const loadCategoryStudioData = async () => {
    setLoading(true);
    try {
      const [pageData, articlesRes, storiesRes] = await Promise.all([
        PageService.getPageById('category').catch(() => null),
        ArticleService.getArticles({ limit: 500 }).catch(() => null),
        StoryService.getStories({ limit: 500 }).catch(() => null)
      ]);

      const articlesList = (articlesRes?.data && Array.isArray(articlesRes.data)) ? articlesRes.data : [];
      const storiesList = (storiesRes?.data && Array.isArray(storiesRes.data)) ? storiesRes.data : [];
      const seedList = getDefaultSeedStories();

      // Combined deduplicated pool across all sources
      const combined = [];
      const seen = new Set();
      const rawPool = [
        ...articlesList,
        ...storiesList,
        ...seedList,
        ...ALL_STORIES,
        ...ALL_HER_STORIES,
        ...ALL_ENTERPRISE_STORIES,
        ...ALL_SMB_STORIES
      ];

      for (const item of rawPool) {
        if (!item || typeof item !== 'object') continue;
        const norm = normalizeStory(item);
        if (!norm) continue;
        const key = String(norm.slug || norm.id || norm._id || norm.title).toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          combined.push(norm);
        }
      }

      setAllArticles(combined);

      if (pageData) {
        setPage(pageData);
        const heroSec = (pageData.sections || []).find(s => s.type === 'hero' || s.id === 'category_hero');
        const feedSec = (pageData.sections || []).find(s => s.type === 'stories_feed' || s.id === 'category_feed');

        if (heroSec?.data) {
          setHeroHeading(heroSec.data.heading || heroSec.data.title || 'Curated Reporting Across All Editorial Verticals');
          setHeroSubhead(heroSec.data.subheadline || heroSec.data.subtitle || '');
          setHeroBadge(heroSec.data.badge || 'EDITORIAL DESKS');
          setHeroImage(heroSec.data.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80');
          setHeroBtnText(heroSec.data.buttonText || 'Explore Stories');
          setShowHero(heroSec.enabled !== false);
        }

        if (feedSec?.data) {
          setLayoutMode(feedSec.data.layoutMode === '2col' ? 'grid' : (feedSec.data.layoutMode || 'grid'));
          if (feedSec.data.curation && typeof feedSec.data.curation === 'object') {
            setCategoryCuration(feedSec.data.curation);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load category studio data:', err);
      onShowToast?.('Failed to load category page data');
    } finally {
      setLoading(false);
    }
  };

  // Active desk curated stories
  const activeCategoryKey = activeCategory.toLowerCase();

  const currentCategoryStories = useMemo(() => {
    // 1. If custom curated list exists for this category, use it
    if (categoryCuration[activeCategoryKey] && Array.isArray(categoryCuration[activeCategoryKey]) && categoryCuration[activeCategoryKey].length > 0) {
      return categoryCuration[activeCategoryKey];
    }

    // 2. Otherwise auto-filter from allArticles
    if (activeCategory === 'All') return allArticles.slice(0, 24);

    return allArticles.filter(a => {
      const cat = (a.categorySlug || a.category || '').toLowerCase();
      return cat.includes(activeCategoryKey) || activeCategoryKey.includes(cat);
    }).slice(0, 24);
  }, [allArticles, activeCategory, activeCategoryKey, categoryCuration]);

  // Filtered stories by search query on the live page
  const displayStories = useMemo(() => {
    if (!searchQuery.trim()) return currentCategoryStories;
    const q = searchQuery.toLowerCase().trim();
    return currentCategoryStories.filter(s => 
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.excerpt && s.excerpt.toLowerCase().includes(q)) ||
      (s.author && s.author.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  }, [currentCategoryStories, searchQuery]);

  // Set curated articles for active category
  const setCuratedForActive = (updater) => {
    setCategoryCuration(prev => {
      const currentList = prev[activeCategoryKey] || currentCategoryStories;
      const nextList = typeof updater === 'function' ? updater(currentList) : updater;
      return {
        ...prev,
        [activeCategoryKey]: nextList
      };
    });
  };

  // Reorder article
  const handleMoveArticle = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentCategoryStories.length) return;
    const next = [...currentCategoryStories];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setCuratedForActive(next);
  };

  // Pin article to top
  const handleTogglePin = (idx) => {
    const item = currentCategoryStories[idx];
    const isPinned = item.isPinned;
    const updated = { ...item, isPinned: !isPinned };
    const remaining = currentCategoryStories.filter((_, i) => i !== idx);
    const next = updated.isPinned ? [updated, ...remaining] : [...remaining, updated];
    setCuratedForActive(next);
  };

  // Remove article from category desk
  const handleRemoveArticle = (idx) => {
    setCuratedForActive(prev => prev.filter((_, i) => i !== idx));
  };

  // Select article from picker modal (Add or Replace)
  const handleSelectFromPicker = (article) => {
    const norm = normalizeStory(article);
    if (pickerModal.targetIndex !== null && typeof pickerModal.targetIndex === 'number') {
      // Replace existing
      setCuratedForActive(prev => {
        const next = [...prev];
        next[pickerModal.targetIndex] = norm;
        return next;
      });
      onShowToast?.(`Replaced story with "${article.title.slice(0, 30)}..."`);
    } else {
      // Add to front
      setCuratedForActive(prev => [norm, ...prev]);
      onShowToast?.(`Added "${article.title.slice(0, 30)}..." to ${activeCategory.toUpperCase()}`);
    }
    setPickerModal({ isOpen: false, targetIndex: null });
    setPickerSearch('');
  };

  // Save inline edit modal
  const handleSaveEditModal = () => {
    const { index, data } = editModal;
    if (typeof index === 'number' && data) {
      setCuratedForActive(prev => {
        const next = [...prev];
        next[index] = { ...next[index], ...data };
        return next;
      });
    }
    setEditModal({ isOpen: false, index: null, data: null });
    onShowToast?.('Story details updated on live page!');
  };

  // Save and publish live
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updatedSections = [
        {
          id: 'category_hero',
          type: 'hero',
          order: 1,
          enabled: showHero,
          data: {
            title: heroHeading,
            heading: heroHeading,
            headline: heroHeading,
            subheadline: heroSubhead,
            badge: heroBadge,
            buttonText: heroBtnText,
            buttonUrl: '#feed',
            image: heroImage,
            heroSource: 'custom'
          }
        },
        {
          id: 'category_feed',
          type: 'stories_feed',
          order: 2,
          enabled: true,
          data: {
            title: 'Category Editorial Feed',
            heading: 'All Editorial Desks',
            subtitle: 'Discover high-impact stories, breaking scoops, and founder journeys across curated verticals',
            layoutMode,
            showHero,
            curation: categoryCuration
          }
        }
      ];

      const payload = {
        id: 'category',
        title: 'Category Content & Desks',
        slug: 'categories',
        brand: 'GoReadPost',
        description: 'Comprehensive reporting, strategic perspectives, and startup breakdowns across all editorial categories and desks.',
        heroHeadline: heroHeading,
        heroSubhead: heroSubhead,
        heroBanner: heroImage,
        status: 'published',
        sections: updatedSections
      };

      await PageService.updatePage('category', payload);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onShowToast?.('Category Page changes published live!');
    } catch (err) {
      console.error('Failed to save category page:', err);
      onShowToast?.(err.message || 'Failed to save category page');
    } finally {
      setSaving(false);
    }
  };

  // Filter master articles for picker modal
  const filteredPickerArticles = useMemo(() => {
    if (!pickerSearch.trim()) return allArticles.slice(0, 30);
    const q = pickerSearch.toLowerCase().trim();
    return allArticles.filter(a => 
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [allArticles, pickerSearch]);

  if (loading) {
    return (
      <div className="acsv-live-root" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw size={36} className="spin-animate" color="#ea580c" />
        <p style={{ color: '#64748b', fontWeight: 650, marginTop: '14px' }}>Loading Live Category Page...</p>
      </div>
    );
  }

  return (
    <div className="acsv-live-root" style={isStudioView ? { minHeight: 'auto', background: 'transparent' } : {}}>
      {/* ── 1. Top Sticky Studio Bar ── */}
      {!isStudioView && (
      <header className="acsv-studio-topbar">
        <div className="acsv-topbar-left">
          <button
            type="button"
            className="acsv-back-btn"
            onClick={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
            title="Return to Pages Management"
          >
            <ArrowLeft size={16} />
            <span>Back to Pages</span>
          </button>

          <div className="acsv-topbar-title-wrap">
            <span className="acsv-topbar-title">Category Page Studio</span>
            <span className="acsv-topbar-slug">/categories</span>
            <span className="acsv-topbar-pill">Live Visual Studio</span>
          </div>
        </div>

        <div className="acsv-topbar-right">

          <a
            href="/categories"
            target="_blank"
            rel="noopener noreferrer"
            className="acsv-btn-secondary"
            title="Open live public category page"
          >
            <ExternalLink size={14} />
            <span>View Public</span>
          </a>

          <button
            type="button"
            className={`acsv-btn-primary ${saveSuccess ? 'saved' : ''}`}
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="spin-animate" />
                <span>Publishing...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check size={16} />
                <span>Published Live!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>
      )}

      {/* ── 2. Live Page Container ── */}
      <div className="acsv-container">
        
        {/* ── SECTION A: Live Top Hero Spotlight Banner ── */}
        {showHero ? (
          <div className="acsv-hero-wrapper">
            {/* Top-Right Floating Admin Edit Controls */}
            <div className="acsv-hero-admin-controls">
              <button
                type="button"
                className="acsv-hero-action-btn"
                onClick={() => setHeroModalOpen(true)}
                title="Edit headline, subhead, badge and image"
              >
                <Edit2 size={13} />
                <span>Edit Hero Spotlight</span>
              </button>

              <button
                type="button"
                className="acsv-hero-action-btn"
                onClick={() => setShowHero(false)}
                title="Hide hero banner from page"
              >
                <EyeOff size={13} />
                <span>Hide</span>
              </button>
            </div>

            {/* Live Hero Banner Render */}
            <div 
              className="acsv-hero-live-card"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="acsv-hero-live-overlay" />
              
              <div className="acsv-hero-live-content">
                <h1 className="acsv-hero-headline">
                  {heroHeading}
                </h1>

                <p className="acsv-hero-subhead">
                  {heroSubhead}
                </p>

                <div className="acsv-hero-footer-bar">
                  <div className="acsv-hero-author-cluster">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" 
                      alt="Editorial Bureau"
                      className="acsv-hero-author-avatar"
                    />
                    <div>
                      <div className="acsv-hero-author-name">Editorial Bureau</div>
                      <div className="acsv-hero-author-meta">Featured Lead Story • 5 min read</div>
                    </div>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
                    <span className="acsv-hero-badge" style={{ margin: 0 }}>
                      <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {heroBadge}
                    </span>

                    <button type="button" className="acsv-hero-cta-btn">
                      <span>{heroBtnText}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '1.25rem 1.75rem',
            background: '#ffffff',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '14px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
              <EyeOff size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 650 }}>Hero Spotlight Banner is currently hidden.</span>
            </div>
            <button
              type="button"
              className="acsv-btn-primary"
              onClick={() => setShowHero(true)}
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              <Eye size={14} />
              <span>Enable Hero Banner</span>
            </button>
          </div>
        )}

        {/* ── SECTION B: Live Category Navigation & Desk Filter Bar ── */}
        <div className="acsv-filter-toolbar">
          <div className="acsv-pills-row">
            <button
              type="button"
              className={`acsv-desk-pill ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              <span>All Desks</span>
            </button>

            {CORE_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                type="button"
                className={`acsv-desk-pill ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="acsv-toolbar-right">
            <div className="acsv-search-box">
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search stories in desk..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="acsv-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="acsv-btn-primary"
              onClick={() => setPickerModal({ isOpen: true, targetIndex: null })}
              style={{ padding: '7px 16px', fontSize: '0.84rem' }}
            >
              <Plus size={15} />
              <span>Add Story</span>
            </button>
          </div>
        </div>

        {/* ── SECTION C: Live Editorial Stories Feed (2-Column Magazine Grid) ── */}
        {displayStories.length === 0 ? (
          <div style={{
            padding: '4rem 1rem',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px dashed #cbd5e1'
          }}>
            <BookOpen size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', color: '#0f172a' }}>No stories in {activeCategory} desk</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.9rem' }}>
              Add articles from the master pool to curate this vertical.
            </p>
            <button
              type="button"
              className="acsv-btn-primary"
              onClick={() => setPickerModal({ isOpen: true, targetIndex: null })}
            >
              <Plus size={16} />
              <span>Add Story from Pool</span>
            </button>
          </div>
        ) : (
          <div className="acsv-editorial-4col-grid">
            {displayStories.map((story, idx) => {
              const masterIdx = currentCategoryStories.findIndex(s => (s.id || s._id || s.slug) === (story.id || story._id || story.slug));
              const targetIdx = masterIdx >= 0 ? masterIdx : idx;

              return (
                <div key={story.id || idx} className="acsv-editorial-card">
                  {/* Top Admin Control Bar on the card */}
                  <div className="acsv-card-admin-bar">
                    <div className="acsv-rank-badge">
                      <span>#{idx + 1}</span>
                      {story.isPinned && (
                        <span style={{ 
                          background: 'rgba(234, 88, 12, 0.15)', 
                          color: '#ea580c', 
                          padding: '1px 6px', 
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 800
                        }}>
                          PINNED TOP
                        </span>
                      )}
                    </div>

                    <div className="acsv-card-btn-group">
                      <button
                        type="button"
                        className={`acsv-action-icon-btn ${story.isPinned ? 'pin-active' : ''}`}
                        onClick={() => handleTogglePin(targetIdx)}
                        title={story.isPinned ? "Unpin story" : "Pin to top of desk"}
                      >
                        <Pin size={12} />
                      </button>

                      <button
                        type="button"
                        className="acsv-action-icon-btn"
                        onClick={() => handleMoveArticle(targetIdx, 'up')}
                        disabled={targetIdx === 0}
                        title="Move Up / Earlier"
                      >
                        <ArrowLeft size={12} />
                      </button>

                      <button
                        type="button"
                        className="acsv-action-icon-btn"
                        onClick={() => handleMoveArticle(targetIdx, 'down')}
                        disabled={targetIdx >= currentCategoryStories.length - 1}
                        title="Move Down / Later"
                      >
                        <ArrowRight size={12} />
                      </button>

                      <button
                        type="button"
                        className="acsv-action-icon-btn"
                        onClick={() => setPickerModal({ isOpen: true, targetIndex: targetIdx })}
                        title="Replace this story"
                      >
                        <RefreshCw size={12} />
                      </button>

                      <button
                        type="button"
                        className="acsv-action-icon-btn"
                        onClick={() => setEditModal({ isOpen: true, index: targetIdx, data: { ...story } })}
                        title="Edit Story Details"
                      >
                        <Edit2 size={12} />
                      </button>

                      <button
                        type="button"
                        className="acsv-action-icon-btn danger"
                        onClick={() => handleRemoveArticle(targetIdx)}
                        title="Remove from desk"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Vertical 4-Cards Per Row Card Interior */}
                  <div className="acsv-card-grid-interior">
                    <div className="acsv-card-grid-thumb-wrap">
                      <img 
                        src={story.image} 
                        alt="" 
                        className="acsv-card-grid-thumb"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&fit=crop'; }}
                      />
                      <span className="acsv-card-cat-badge">
                        {story.categoryName || story.category}
                      </span>
                    </div>

                    <div className="acsv-card-grid-body">
                      <div className="acsv-card-meta-row">
                        <Clock size={11} />
                        <span>{story.date}</span>
                        <span>•</span>
                        <span>{story.readTime}</span>
                      </div>

                      <h3 className="acsv-card-title">
                        {story.title}
                      </h3>

                      <p className="acsv-card-excerpt">
                        {story.excerpt}
                      </p>

                      <div className="acsv-card-footer">
                        <div className="acsv-card-author-wrap">
                          <img 
                            src={story.authorAvatar} 
                            alt="" 
                            className="acsv-card-author-avatar"
                          />
                          <span className="acsv-card-author-name">{story.authorName || story.author}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL 1: EDIT HERO SPOTLIGHT BANNER ── */}
      {heroModalOpen && (
        <div className="acsv-modal-overlay" onClick={() => setHeroModalOpen(false)}>
          <div className="acsv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="acsv-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  Edit Hero Spotlight Banner
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setHeroModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="acsv-modal-body">
              <div className="acsv-form-group">
                <label className="acsv-form-label">Eyebrow Badge Pill</label>
                <input 
                  type="text"
                  className="acsv-form-input"
                  value={heroBadge}
                  onChange={e => setHeroBadge(e.target.value)}
                  placeholder="EDITORIAL DESKS"
                />
              </div>

              <div className="acsv-form-group">
                <label className="acsv-form-label">Main Headline</label>
                <input 
                  type="text"
                  className="acsv-form-input"
                  value={heroHeading}
                  onChange={e => setHeroHeading(e.target.value)}
                  placeholder="Curated Reporting Across All Editorial Verticals"
                />
              </div>

              <div className="acsv-form-group">
                <label className="acsv-form-label">Subheadline Paragraph</label>
                <textarea 
                  className="acsv-form-textarea"
                  rows={3}
                  value={heroSubhead}
                  onChange={e => setHeroSubhead(e.target.value)}
                  placeholder="Explore deep insights, operational lessons, and strategic perspectives..."
                />
              </div>

              <div className="acsv-form-group">
                <label className="acsv-form-label">Action Button Text</label>
                <input 
                  type="text"
                  className="acsv-form-input"
                  value={heroBtnText}
                  onChange={e => setHeroBtnText(e.target.value)}
                  placeholder="Explore Stories"
                />
              </div>

              <div className="acsv-form-group">
                <label className="acsv-form-label">Hero Cover Image URL</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="text"
                    className="acsv-form-input"
                    value={heroImage}
                    onChange={e => setHeroImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {heroImage && (
                    <img 
                      src={heroImage} 
                      alt="" 
                      style={{ width: '80px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="acsv-modal-footer">
              <button 
                type="button" 
                className="acsv-btn-secondary" 
                onClick={() => setHeroModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PICK OR REPLACE STORY FROM POOL ── */}
      {pickerModal.isOpen && (
        <div className="acsv-modal-overlay" onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}>
          <div className="acsv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="acsv-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {pickerModal.targetIndex !== null ? 'Replace Story' : `Add Story to ${activeCategory.toUpperCase()} Desk`}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="acsv-modal-body">
              <div className="acsv-search-box" style={{ width: '100%' }}>
                <Search size={15} color="#94a3b8" />
                <input 
                  type="text" 
                  className="acsv-search-input" 
                  placeholder="Search articles by title, author, or keyword..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                {filteredPickerArticles.map(a => (
                  <div 
                    key={a.id} 
                    onClick={() => handleSelectFromPicker(a)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: '#ffffff'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ea580c'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <img 
                      src={a.image} 
                      alt="" 
                      style={{ width: '56px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&fit=crop'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '6px', marginTop: '2px' }}>
                        <span style={{ color: '#ea580c', fontWeight: 700 }}>{a.categoryName || a.category}</span>
                        <span>•</span>
                        <span>By {a.authorName || a.author}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="acsv-btn-primary" 
                      style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                    >
                      {pickerModal.targetIndex !== null ? 'Replace' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="acsv-modal-footer">
              <button 
                type="button" 
                className="acsv-btn-secondary" 
                onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: EDIT STORY DETAILS INLINE ── */}
      {editModal.isOpen && editModal.data && (
        <div className="acsv-modal-overlay" onClick={() => setEditModal({ isOpen: false, index: null, data: null })}>
          <div className="acsv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="acsv-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  Customize Story Display
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setEditModal({ isOpen: false, index: null, data: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="acsv-modal-body">
              <div className="acsv-form-group">
                <label className="acsv-form-label">Article Headline</label>
                <input 
                  type="text"
                  className="acsv-form-input"
                  value={editModal.data.title || ''}
                  onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                />
              </div>

              <div className="acsv-form-group">
                <label className="acsv-form-label">Excerpt / Subtitle</label>
                <textarea 
                  className="acsv-form-textarea"
                  rows={3}
                  value={editModal.data.excerpt || ''}
                  onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, excerpt: e.target.value } }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="acsv-form-group">
                  <label className="acsv-form-label">Category Desk Label</label>
                  <input 
                    type="text"
                    className="acsv-form-input"
                    value={editModal.data.categoryName || editModal.data.category || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, categoryName: e.target.value, category: e.target.value } }))}
                  />
                </div>

                <div className="acsv-form-group">
                  <label className="acsv-form-label">Author Name</label>
                  <input 
                    type="text"
                    className="acsv-form-input"
                    value={editModal.data.authorName || editModal.data.author || ''}
                    onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, authorName: e.target.value, author: e.target.value } }))}
                  />
                </div>
              </div>

              <div className="acsv-form-group">
                <label className="acsv-form-label">Thumbnail Image URL</label>
                <input 
                  type="text"
                  className="acsv-form-input"
                  value={editModal.data.image || ''}
                  onChange={e => setEditModal(prev => ({ ...prev, data: { ...prev.data, image: e.target.value } }))}
                />
              </div>
            </div>

            <div className="acsv-modal-footer">
              <button 
                type="button" 
                className="acsv-btn-secondary" 
                onClick={() => setEditModal({ isOpen: false, index: null, data: null })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="acsv-btn-primary" 
                onClick={handleSaveEditModal}
              >
                Save Story Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
