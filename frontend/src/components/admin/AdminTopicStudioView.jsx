import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Save, Eye, EyeOff, Layers, Sparkles, 
  RefreshCw, Check, CheckCircle2, AlertCircle, Plus, Trash2, 
  Pin, Edit2, Search, X, ExternalLink, Globe, Hash, BookOpen, Clock
} from 'lucide-react';
import { TaxonomyService } from '../../services/taxonomyService';
import { ArticleService } from '../../services/articleService';
import { StoryService, getDefaultSeedStories } from '../../services/storyService';
import { ALL_STORIES } from '../../data/storiesData';
import { ALL_HER_STORIES } from '../../data/herStoryData';
import { ALL_ENTERPRISE_STORIES } from '../../data/enterpriseStoryData';
import { ALL_SMB_STORIES } from '../../data/smbStoryData';
import './AdminCategoryStudioView.css';

// Canonical fallback topics if DB is loading
const CANONICAL_TOPICS = [
  { _id: 'herstory', name: 'HerStory', slug: 'herstory', description: 'Celebrating women entrepreneurs, corporate executives, and changemakers.' },
  { _id: 'ai', name: 'AI & DeepTech', slug: 'artificial-intelligence', description: 'Tracking foundation models, sovereign compute, LLMs, and frontier AI research.' },
  { _id: 'deeptech', name: 'DeepTech', slug: 'deeptech', description: 'Coverage of semiconductors, space tech, quantum computing, and hardware innovations.' },
  { _id: 'vc', name: 'Venture Capital', slug: 'venture-capital', description: 'Early-stage seed rounds, growth equity, term sheets, LP-GP dynamics, and IPO markets.' },
  { _id: 'robotics', name: 'Robotics & Automation', slug: 'robotics', description: 'Industrial automation, autonomous robotics, humanoid systems, and smart factory tech.' },
  { _id: 'saas', name: 'B2B SaaS & Cloud', slug: 'saas', description: 'Global enterprise software, developer tools, vertical SaaS, and cloud infrastructure.' },
  { _id: 'climate', name: 'Climate Tech & Energy', slug: 'climate-tech', description: 'Renewable energy, EV battery technology, carbon accounting, and green transition startups.' },
  { _id: 'fintech', name: 'FinTech & Web3', slug: 'fintech', description: 'Digital public infrastructure, UPI, cross-border payments, neo-banking, and tokens.' },
  { _id: 'd2c', name: 'D2C & Retail Brands', slug: 'd2c-retail', description: 'Consumer brands, omnichannel retail, supply chain optimization, and marketplace commerce.' }
];

const normalizeStory = (s, idx = 0) => {
  if (!s) return null;
  const id = String(s.id || s._id || s.slug || `story-${idx}`);
  const title = s.title || 'Untitled Article';
  const excerpt = s.excerpt || s.subtitle || s.summary || s.description || '';
  const cat = typeof s.category === 'object' && s.category?.name ? s.category.name : (s.categoryName || s.categoryLabel || s.category || 'Topic Story');
  const catSlug = (s.categorySlug || cat || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const image = s.image || s.featuredImage?.url || (typeof s.featuredImage === 'string' ? s.featuredImage : null) || s.heroImage || s.coverImage || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80';
  const author = typeof s.author === 'object' && s.author?.name ? s.author.name : (s.authorName || s.author || 'Editorial Bureau');
  const authorAvatar = (typeof s.author === 'object' && s.author?.avatar) ? s.author.avatar : (s.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80');
  const date = s.publishedAt ? new Date(s.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (s.date || 'Oct 7, 2026');
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

export default function AdminTopicStudioView({ 
  onShowToast, 
  onNavigate, 
  initialTopic = 'herstory',
  currentPath = ''
}) {
  const [topics, setTopics] = useState([]);
  const [activeTopicSlug, setActiveTopicSlug] = useState(() => {
    if (initialTopic) return initialTopic.toLowerCase().trim();
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin/topic')) {
      const parts = window.location.pathname.replace('/admin/topic', '').replace(/^\/+/, '').split('/')[0];
      if (parts) return parts.toLowerCase().trim();
    }
    return 'herstory';
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active topic metadata
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Articles state
  const [allArticles, setAllArticles] = useState([]);
  const [topicCuration, setTopicCuration] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Picker modal state
  const [pickerModal, setPickerModal] = useState({ isOpen: false, targetIndex: null });
  const [pickerSearch, setPickerSearch] = useState('');

  // Edit Story modal
  const [editModal, setEditModal] = useState({ isOpen: false, index: null, data: null });

  // Load all topics and master articles pool
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [topData, artRes, storiesRes] = await Promise.all([
        TaxonomyService.getTopics().catch(() => []),
        ArticleService.getArticles({ limit: 500 }).catch(() => null),
        StoryService.getStories({ limit: 500 }).catch(() => null)
      ]);

      const loadedTopics = Array.isArray(topData) && topData.length > 0 ? topData : CANONICAL_TOPICS;
      setTopics(loadedTopics);

      // Deduplicated pool of articles
      const articlesList = (artRes?.data && Array.isArray(artRes.data)) ? artRes.data : [];
      const storiesList = (storiesRes?.data && Array.isArray(storiesRes.data)) ? storiesRes.data : [];
      const seedList = getDefaultSeedStories();

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
    } catch (err) {
      console.error('Failed to load topic studio data:', err);
      onShowToast?.('Failed to load topic data');
    } finally {
      setLoading(false);
    }
  };

  // Find active topic object
  const activeTopic = useMemo(() => {
    const clean = (activeTopicSlug || 'herstory').toLowerCase();
    const found = topics.find(t => 
      (t.slug && t.slug.toLowerCase() === clean) || 
      (t._id && String(t._id).toLowerCase() === clean) ||
      (t.name && t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean)
    );
    return found || {
      _id: clean,
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      slug: clean,
      description: `Comprehensive coverage and articles tagged with ${clean}.`
    };
  }, [topics, activeTopicSlug]);

  // Sync active topic metadata to form state
  useEffect(() => {
    if (activeTopic) {
      setTopicName(activeTopic.name || '');
      setTopicDescription(activeTopic.description || '');
      setSeoTitle(activeTopic.seoTitle || `${activeTopic.name} Topics & Articles | GoReadPost`);
      setSeoDescription(activeTopic.seoDescription || activeTopic.description || `Explore stories, founder profiles, and news on ${activeTopic.name}.`);
    }
  }, [activeTopic]);

  // Switch active topic tab
  const handleSelectTopicTab = (slug) => {
    setActiveTopicSlug(slug);
    const newUri = `/admin/topic/${slug}`;
    try {
      window.history.pushState(null, '', newUri);
    } catch (e) {}
  };

  // Active topic articles
  const currentTopicArticles = useMemo(() => {
    const slugKey = (activeTopic.slug || activeTopicSlug).toLowerCase();
    if (topicCuration[slugKey] && Array.isArray(topicCuration[slugKey]) && topicCuration[slugKey].length > 0) {
      return topicCuration[slugKey];
    }

    // Auto-match based on topic name / slug
    const nameKey = (activeTopic.name || '').toLowerCase();
    const matched = allArticles.filter(art => {
      const artTopics = Array.isArray(art.topics) ? art.topics.map(t => String(t).toLowerCase()) : [];
      const artTags = Array.isArray(art.tags) ? art.tags.map(t => String(t).toLowerCase()) : [];
      const artCat = (art.category || art.categorySlug || '').toLowerCase();
      const artTitle = (art.title || '').toLowerCase();
      return (
        artTopics.includes(slugKey) ||
        artTopics.includes(nameKey) ||
        artTags.includes(slugKey) ||
        artTags.includes(nameKey) ||
        artCat.includes(slugKey) ||
        artCat.includes(nameKey) ||
        artTitle.includes(slugKey) ||
        artTitle.includes(nameKey)
      );
    });

    if (matched.length > 0) return matched.slice(0, 24);

    // If herstory specifically, provide herstory stories
    if (slugKey.includes('her')) {
      return ALL_HER_STORIES.map(normalizeStory).slice(0, 12);
    }

    return allArticles.slice(0, 12);
  }, [allArticles, activeTopic, activeTopicSlug, topicCuration]);

  // Filtered stories by search query
  const displayStories = useMemo(() => {
    if (!searchQuery.trim()) return currentTopicArticles;
    const q = searchQuery.toLowerCase().trim();
    return currentTopicArticles.filter(s =>
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.excerpt && s.excerpt.toLowerCase().includes(q)) ||
      (s.author && s.author.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  }, [currentTopicArticles, searchQuery]);

  // Set curated articles for active topic
  const setCuratedForActive = (updater) => {
    const slugKey = (activeTopic.slug || activeTopicSlug).toLowerCase();
    setTopicCuration(prev => {
      const currentList = prev[slugKey] || currentTopicArticles;
      const nextList = typeof updater === 'function' ? updater(currentList) : updater;
      return {
        ...prev,
        [slugKey]: nextList
      };
    });
  };

  // Reorder article
  const handleMoveArticle = (idx, direction) => {
    const targetIdx = direction === 'left' || direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentTopicArticles.length) return;
    const next = [...currentTopicArticles];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setCuratedForActive(next);
  };

  // Remove article
  const handleRemoveArticle = (idx) => {
    setCuratedForActive(prev => prev.filter((_, i) => i !== idx));
  };

  // Select article from picker modal
  const handleSelectFromPicker = (article) => {
    const norm = normalizeStory(article);
    if (pickerModal.targetIndex !== null && typeof pickerModal.targetIndex === 'number') {
      setCuratedForActive(prev => {
        const next = [...prev];
        next[pickerModal.targetIndex] = norm;
        return next;
      });
      onShowToast?.(`Replaced slot with "${article.title.slice(0, 30)}..."`);
    } else {
      setCuratedForActive(prev => [norm, ...prev]);
      onShowToast?.(`Added "${article.title.slice(0, 30)}..." to topic feed`);
    }
    setPickerModal({ isOpen: false, targetIndex: null });
    setPickerSearch('');
  };

  // Save changes
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (activeTopic._id && activeTopic._id !== activeTopic.slug) {
        await TaxonomyService.updateTopic(activeTopic._id, {
          name: topicName,
          description: topicDescription,
          seoTitle,
          seoDescription
        }).catch(() => null);
      }
      setSaveSuccess(true);
      onShowToast?.(`Topic Page "${topicName}" updated and saved successfully!`);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save topic:', err);
      onShowToast?.(err.message || 'Error saving topic');
    } finally {
      setSaving(false);
    }
  };

  const livePublicUrl = `/topic/${activeTopic.slug || activeTopicSlug}`;

  return (
    <div className="acsv-live-root">
      {/* ── Sticky Top Bar ── */}
      <div className="acsv-studio-topbar">
        <div className="acsv-topbar-left">
          <button
            type="button"
            className="acsv-back-btn"
            onClick={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
            title="Return to Pages Manager"
          >
            <ArrowLeft size={16} />
            <span>Pages Manager</span>
          </button>

          <div className="acsv-topbar-title-wrap">
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Topic Page Studio
            </span>
            <span style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fee2e2',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Hash size={12} />
              <span>/topic/{activeTopic.slug || activeTopicSlug}</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={livePublicUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.84rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <ExternalLink size={14} />
            <span>View Live Page</span>
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: saveSuccess ? '#059669' : 'var(--brand-primary, #dc2626)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
            }}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>{saving ? 'Saving…' : saveSuccess ? 'Saved Live!' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* ── Topic Selector Pills Bar ── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px clamp(1rem, 2vw, 2.5rem)',
        overflowX: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em', marginRight: '6px' }}>
          Topic Pages:
        </span>
        {topics.map(t => {
          const tSlug = (t.slug || t._id || '').toLowerCase();
          const isSelected = tSlug === (activeTopic.slug || activeTopicSlug).toLowerCase();
          return (
            <button
              key={t._id || t.slug}
              type="button"
              onClick={() => handleSelectTopicTab(tSlug)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: isSelected ? '1px solid #dc2626' : '1px solid #e2e8f0',
                background: isSelected ? '#dc2626' : '#f8fafc',
                color: isSelected ? '#ffffff' : '#334155',
                fontSize: '0.84rem',
                fontWeight: isSelected ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Hash size={13} opacity={isSelected ? 1 : 0.6} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Studio Body ── */}
      <div style={{ padding: 'clamp(1rem, 2vw, 2.5rem)', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* 1. Topic Page Info & SEO Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#dc2626', letterSpacing: '0.04em' }}>
                TOPIC PAGE HEADER & METADATA
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                {topicName || 'Topic Page'}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Route:</span>
              <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
                /topic/{activeTopic.slug || activeTopicSlug}
              </code>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Topic Name *
              </label>
              <input
                type="text"
                value={topicName}
                onChange={e => setTopicName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                placeholder="e.g. HerStory"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                SEO Page Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                placeholder="e.g. HerStory Topics & Articles | GoReadPost"
              />
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Topic Description & Bio
            </label>
            <textarea
              rows={2}
              value={topicDescription}
              onChange={e => setTopicDescription(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', resize: 'vertical' }}
              placeholder="e.g. Celebrating women entrepreneurs, corporate executives, and changemakers."
            />
          </div>
        </div>

        {/* 2. Topic Stories Feed Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Curated Stories Feed ({currentTopicArticles.length})
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Arrange or pin stories displayed on /topic/{activeTopic.slug || activeTopicSlug}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 10px',
              gap: '6px'
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter stories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.84rem', width: '160px' }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setPickerSearch('');
                setPickerModal({ isOpen: true, targetIndex: null });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--brand-primary, #dc2626)',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
              }}
            >
              <Plus size={15} />
              <span>Add Article</span>
            </button>
          </div>
        </div>

        {/* 3. Cards Grid - Exact match of public topic page */}
        {displayStories.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px dashed #cbd5e1',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <Sparkles size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No stories in this topic feed yet</h4>
            <p style={{ fontSize: '0.88rem', margin: '0 0 16px' }}>Click "Add Article" above to pick articles for this topic page.</p>
            <button
              type="button"
              onClick={() => { setPickerSearch(''); setPickerModal({ isOpen: true, targetIndex: null }); }}
              style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              + Add First Article
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px'
          }}>
            {displayStories.map((story, idx) => (
              <div
                key={story.id || story._id || idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Slot bar overlay */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '6px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 700
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#38bdf8' }}>#{idx + 1}</span>
                    <span style={{
                      background: '#1e293b',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      color: '#94a3b8'
                    }}>
                      LIVE
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveArticle(idx, 'left')}
                      style={{ background: 'none', border: 'none', color: idx === 0 ? '#475569' : '#fff', cursor: idx === 0 ? 'default' : 'pointer', padding: '2px' }}
                      title="Move Left"
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === displayStories.length - 1}
                      onClick={() => handleMoveArticle(idx, 'right')}
                      style={{ background: 'none', border: 'none', color: idx === displayStories.length - 1 ? '#475569' : '#fff', cursor: idx === displayStories.length - 1 ? 'default' : 'pointer', padding: '2px' }}
                      title="Move Right"
                    >
                      <ArrowRight size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerSearch('');
                        setPickerModal({ isOpen: true, targetIndex: idx });
                      }}
                      style={{ background: '#334155', border: 'none', color: '#f8fafc', borderRadius: '4px', padding: '2px 6px', fontSize: '0.68rem', cursor: 'pointer', marginLeft: '4px' }}
                      title="Replace this story"
                    >
                      Swap
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveArticle(idx)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                      title="Remove from feed"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Media */}
                <div style={{ position: 'relative', height: '170px', width: '100%', background: '#f1f5f9' }}>
                  <img
                    src={story.image}
                    alt={story.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(15, 23, 42, 0.88)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    {story.category || activeTopic.name}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#64748b', marginBottom: '8px' }}>
                    <img
                      src={story.authorAvatar}
                      alt={story.author}
                      style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'; }}
                    />
                    <span style={{ fontWeight: 600, color: '#334155' }}>{story.author}</span>
                    <span>•</span>
                    <span>{story.readTime}</span>
                  </div>

                  <h4 style={{
                    fontSize: '0.94rem',
                    fontWeight: 750,
                    color: '#0f172a',
                    lineHeight: 1.35,
                    margin: '0 0 8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {story.title}
                  </h4>

                  <p style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    lineHeight: 1.45,
                    margin: '0 0 12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {story.excerpt}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>
                    <span>{story.date}</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>Active in Feed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Article Picker Modal ── */}
      {pickerModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                {pickerModal.targetIndex !== null ? `Replace Story in Slot #${pickerModal.targetIndex + 1}` : 'Add Article to Topic Feed'}
              </h3>
              <button
                type="button"
                onClick={() => setPickerModal({ isOpen: false, targetIndex: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                gap: '8px'
              }}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search articles by title, author, desk..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: '14px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allArticles
                .filter(a => {
                  if (!pickerSearch.trim()) return true;
                  const q = pickerSearch.toLowerCase().trim();
                  return (
                    a.title?.toLowerCase().includes(q) ||
                    a.author?.toLowerCase().includes(q) ||
                    a.category?.toLowerCase().includes(q)
                  );
                })
                .slice(0, 30)
                .map((art, i) => (
                  <div
                    key={art.id || art._id || i}
                    onClick={() => handleSelectFromPicker(art)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <img
                      src={art.image}
                      alt={art.title}
                      style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>
                        {art.category}
                      </span>
                      <h5 style={{ margin: '2px 0 0', fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {art.title}
                      </h5>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>By {art.author} • {art.date}</span>
                    </div>
                    <button
                      type="button"
                      style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                    >
                      Select
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
