import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Sparkles, Plus, Trash2, 
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Monitor, Smartphone, ArrowUp, ArrowDown,
  Search, RefreshCw, Layers, Eye, EyeOff,
  Edit2, Edit3, Image as ImageIcon, Type,
  Mail, Bookmark, Zap, CheckCircle, LayoutGrid, Heart,
  Sliders, Filter, FileText, ExternalLink
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { StoryService, getDefaultSeedStories } from '../../services/storyService';
import { ALL_STORIES, TOP_PICKS, SPOTLIGHT_STORIES } from '../../data/storiesData';
import LiveBannerEditor from './LiveBannerEditor';
import './LiveSectionEditor.css';
import '../ModernHomepage.css';
import '../LatestArticlesPage.css';

const CATEGORY_CHOICES = [
  { value: '', label: 'All Categories (Dynamic Feed)' },
  { value: 'Startups', label: 'Startups & Ecosystem' },
  { value: 'Technology', label: 'Technology & Cloud' },
  { value: 'AI', label: 'AI & DeepTech' },
  { value: 'Enterprise', label: 'Enterprise & SaaS' },
  { value: 'FinTech', label: 'FinTech & Web3' },
  { value: 'HerStory', label: 'HerStory (Women Leaders)' },
  { value: 'SMBStory', label: 'SMBStory (MSME & D2C)' },
  { value: 'SocialStory', label: 'SocialStory (Impact)' },
  { value: 'Hindi', label: 'YS Hindi Edition' }
];

const getSafeString = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.name) return String(val.name);
    if (val.title) return String(val.title);
    if (val.label) return String(val.label);
    if (val.url) return String(val.url);
    return fallback;
  }
  return String(val);
};

class SectionEditorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Section editor error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="lse-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#0f172a', border: '1.5px solid #ea580c', borderRadius: '16px', padding: '2.5rem', maxWidth: '580px', color: '#fff', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <h3 style={{ color: '#ea580c', margin: '0 0 12px', fontSize: '1.3rem' }}>Section Visual Editor</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '0 0 24px', lineHeight: 1.6 }}>
              {this.state.error?.message || 'A data formatting issue occurred while rendering this section.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 750 }}
              >
                Reload Section
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onClose?.();
                }}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 750 }}
              >
                Close Editor
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function LiveSectionEditor({
  section,
  isOpen,
  onClose,
  onSave,
  onAutoSave = null,
  stories = [],
  pageId = null
}) {
  if (!isOpen || !section) return null;

  // Delegate Hero sections directly to specialized LiveBannerEditor
  const isHero = section.type === 'hero' || section.type === 'hero_popular' || section.id === 'hero_popular' || (section.type || '').toLowerCase().includes('hero');
  if (isHero) {
    return (
      <SectionEditorErrorBoundary onClose={onClose}>
        <LiveBannerEditor
          section={section}
          isOpen={isOpen}
          onClose={onClose}
          onSave={onSave}
          onAutoSave={onAutoSave}
          stories={stories}
          pageId={pageId}
        />
      </SectionEditorErrorBoundary>
    );
  }

  return (
    <SectionEditorErrorBoundary onClose={onClose}>
      <LiveGenericSectionStudio
        section={section}
        onClose={onClose}
        onSave={onSave}
        onAutoSave={onAutoSave}
        stories={stories}
        pageId={pageId}
      />
    </SectionEditorErrorBoundary>
  );
}

function LiveGenericSectionStudio({
  section,
  onClose,
  onSave,
  onAutoSave,
  stories = [],
  pageId = null
}) {
  const [data, setData] = useState(() => section?.data || {});
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'mobile'
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [availableArticles, setAvailableArticles] = useState(() => {
    if (stories && stories.length > 0) return stories;
    const defaults = getDefaultSeedStories();
    return defaults.length ? defaults : ALL_STORIES;
  });



  // Dedicated Article Edit Modal State
  const [isArticleEditModalOpen, setIsArticleEditModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleFormData, setArticleFormData] = useState({
    id: '',
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    category: '',
    authorName: '',
    authorTitle: '',
    authorAvatar: '',
    image: '',
    readTime: '',
    status: 'published'
  });
  const [articleSaveStatus, setArticleSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // Modal Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // { type: 'add' | 'replace', index?: number }
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  // Quick Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Sync data on section change
  useEffect(() => {
    if (section?.data) {
      setData({ ...section.data });
    }
  }, [section]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isArticleEditModalOpen) {
          setIsArticleEditModalOpen(false);
        } else if (isEditModalOpen) {
          setIsEditModalOpen(false);
        } else if (isPickerOpen) {
          setIsPickerOpen(false);
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isEditModalOpen, isPickerOpen, isArticleEditModalOpen]);

  // Load published articles from database on mount (pulls all 500 articles across all desks)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveArticles = async () => {
      try {
        const [articleRes, storyRes] = await Promise.allSettled([
          ArticleService.getArticles({ limit: 500 }),
          StoryService.getStories({ limit: 500 })
        ]);
        const articlesList = articleRes.status === 'fulfilled' && Array.isArray(articleRes.value?.data) ? articleRes.value.data : [];
        const storiesList = storyRes.status === 'fulfilled' && Array.isArray(storyRes.value?.data) ? storyRes.value.data : [];
        const seedList = getDefaultSeedStories();
        const merged = [...articlesList, ...storiesList, ...seedList];
        if (isMounted) {
          if (merged.length > 0) {
            setAvailableArticles(merged);
          } else {
            setAvailableArticles(stories.length ? stories : ALL_STORIES);
          }
        }
      } catch (e) {
        if (isMounted && (!availableArticles || availableArticles.length === 0)) {
          setAvailableArticles(getDefaultSeedStories());
        }
      }
    };
    fetchLiveArticles();
    return () => { isMounted = false; };
  }, []);

  const pool = useMemo(() => {
    const combined = [];
    const seen = new Set();
    const sourceList = [
      ...(Array.isArray(availableArticles) ? availableArticles : []),
      ...(Array.isArray(stories) ? stories : []),
      ...getDefaultSeedStories(),
      ...ALL_STORIES
    ];
    for (const item of sourceList) {
      if (!item || typeof item !== 'object') continue;
      const key = String(item.slug || item.id || item._id || item.title || '').trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }
    return combined;
  }, [availableArticles, stories]);

  // Filtered articles in Picker
  const filteredPickerArticles = useMemo(() => {
    return pool.filter(a => {
      if (!a) return false;
      const title = getSafeString(a.title, '').toLowerCase();
      const cat = getSafeString(a.categoryLabel || a.category, '').toLowerCase();
      const author = getSafeString(typeof a.author === 'object' && a.author ? a.author.name : a.author, '').toLowerCase();
      const q = pickerSearch.trim().toLowerCase();

      const matchesSearch = !q || title.includes(q) || cat.includes(q) || author.includes(q);
      const matchesCat = pickerCategory === 'All' || cat.includes(pickerCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [pool, pickerSearch, pickerCategory]);

  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    pool.forEach(a => {
      if (!a) return;
      const c = getSafeString(a.categoryLabel || a.category, '');
      if (c && typeof c === 'string') cats.add(c.trim());
    });
    return Array.from(cats).slice(0, 10);
  }, [pool]);

  // ─────────────────────────────────────────────────────────
  // INSTANT AUTO-SAVE PERSISTENCE TO DATABASE
  // ─────────────────────────────────────────────────────────
  const persistToDatabase = async (nextData) => {
    const finalData = nextData || data;
    setData(finalData);
    setSaveStatus('saving');
    try {
      if (onAutoSave) {
        await onAutoSave(finalData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (err) {
      console.error('Failed to auto-save section:', err);
      setSaveStatus('error');
    }
  };

  // Section Type Identification
  const secType = (section.type || section.sectionKey || '').toLowerCase();
  const isArticleFeed = ['stories_feed', 'story_feed', 'article_feed', 'article_story_feed', 'latest_blogs', 'latest', 'trending', 'popular_editors', 'business', 'spotlight', 'technology', 'ai'].includes(secType) || secType.includes('feed') || secType.includes('story') || secType.includes('article') || secType.includes('blog');
  const isNewsletter = secType === 'newsletter';
  const isImageText = secType === 'image_text';
  const isText = secType === 'text';
  const isCTA = secType === 'cta';
  const isGridList = ['services', 'portfolio', 'testimonials', 'features', 'stats', 'brands', 'faq', 'contact'].includes(secType);

  // Maximum articles that fit cleanly in the frontend grid without awkward trailing spaces:
  // - Homepage grid (4 columns wide): 8 articles (exactly 2 complete rows of 4).
  // - Latest articles page (4 columns wide): 16 articles (exactly 4 complete rows of 4).
  const isLatestPage = pageId === 'latest' || section?.id === 'latest_feed';
  const isSpotlight = secType === 'spotlight' || section?.id === 'spotlight';
  const isTrending = secType === 'trending' || section?.id === 'trending';
  const isLatestSection = secType === 'latest_blogs' || secType === 'latest' || section?.id === 'latest_blogs';
  const maxArticlesFit = isLatestPage 
    ? 16 
    : (isSpotlight || isTrending
        ? 8
        : (isLatestSection ? 4 : 8)
      );

  // EXACT FRONTEND ARTICLES RESOLVER (Matches ModernHomepageView.jsx 1:1)
  const frontendArticles = useMemo(() => {
    // 1. If custom curated articles are pinned in data.articles, use them up to max capacity
    if (Array.isArray(data.articles) && data.articles.length > 0) {
      return data.articles.filter(Boolean).slice(0, maxArticlesFit);
    }
    
    // 2. Otherwise compute default frontend pool matching ModernHomepageView
    let sectionPool = [];
    if (secType === 'trending') {
      const trending = pool.filter(s => 
        s && (s.isTrending || s.trending || s.tag === 'TRENDING' || s.tag === 'POPULAR' || s.tag === 'VIRAL')
      );
      const combined = [...trending];
      for (const b of pool) {
        if (combined.length >= limit) break;
        if (!combined.some(c => String(c.id || c._id || c.slug) === String(b.id || b._id || b.slug))) {
          combined.push(b);
        }
      }
      sectionPool = combined;
    } else if (secType === 'spotlight' || secType === 'technology' || secType === 'ai') {
      const tech = pool.filter(s => {
        if (!s) return false;
        const cat = getSafeString(s.category || s.categoryLabel || s.categoryName, '').toLowerCase();
        return cat.includes('tech') || cat.includes('ai') || cat.includes('startup') || cat.includes('enterprise');
      });
      const combined = [...tech];
      for (const b of pool) {
        if (combined.length >= limit) break;
        if (!combined.some(c => String(c.id || c._id || c.slug) === String(b.id || b._id || b.slug))) {
          combined.push(b);
        }
      }
      sectionPool = combined;
    } else if (secType === 'popular_editors' || secType === 'business') {
      const picks = pool.filter(s => 
        s && (s.isFeatured || s.tag === 'TOP PICK' || s.tag === 'FEATURED' || s.tag === 'EDITOR' || s.isLead)
      );
      const combined = [...picks];
      for (const b of pool) {
        if (combined.length >= limit) break;
        if (!combined.some(c => String(c.id || c._id || c.slug) === String(b.id || b._id || b.slug))) {
          combined.push(b);
        }
      }
      sectionPool = combined;
    } else {
      // Default: Latest Blogs / Stories Feed
      let base = pool;
      const filterCat = getSafeString(data.category, '').toLowerCase().trim();
      if (filterCat) {
        const matched = pool.filter(s => getSafeString(s.category || s.categoryLabel || s.categoryName, '').toLowerCase().includes(filterCat));
        if (matched.length > 0) base = matched;
      }
      sectionPool = [...base].sort((a, b) => {
        const dateA = new Date(a?.publishedAt || a?.date || a?.createdAt || 0);
        const dateB = new Date(b?.publishedAt || b?.date || b?.createdAt || 0);
        return dateB - dateA;
      });
    }

    return sectionPool.slice(0, limit);
  }, [data.articles, data.limit, data.category, secType, pool]);

  const activeArticles = frontendArticles;

  const handleSaveAndApply = async () => {
    const finalData = {
      ...data,
      articles: frontendArticles,
      limit: frontendArticles.length,
      hasCustomArticles: true
    };
    setSaveStatus('saving');
    try {
      if (onAutoSave) {
        await onAutoSave(finalData);
      } else if (onSave) {
        await onSave(finalData);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save section:', err);
      setSaveStatus('error');
    }
  };

  // Dedicated Article Edit Handlers
  const handleOpenArticleEditor = (article) => {
    setEditingArticle(article);
    setArticleFormData({
      id: article._id || article.id || article.slug,
      title: article.title || '',
      subtitle: article.subtitle || article.excerpt || article.summary || '',
      excerpt: article.excerpt || article.summary || article.subtitle || '',
      content: article.content || article.body || article.excerpt || article.summary || '',
      category: article.categoryLabel || article.categoryTag || article.categoryName || article.category || 'Startups',
      authorName: typeof article.author === 'object' ? article.author?.name || '' : (article.authorName || article.author || 'Editorial Bureau'),
      authorTitle: typeof article.author === 'object' ? article.author?.title || '' : (article.authorTitle || 'Senior Staff Reporter'),
      authorAvatar: article.authorAvatar || (typeof article.author === 'object' && article.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      image: article.image || article.coverImage || (typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage?.url) || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80',
      readTime: article.readTime || (article.readingTime ? `${article.readingTime} min read` : '4 min read'),
      status: article.status || 'published'
    });
    setArticleSaveStatus('idle');
    setIsArticleEditModalOpen(true);
  };

  const handleSaveArticleContent = async () => {
    if (!editingArticle) return;
    setArticleSaveStatus('saving');
    try {
      const artId = editingArticle._id || editingArticle.id || articleFormData.id;
      const payload = {
        title: articleFormData.title,
        subtitle: articleFormData.subtitle || articleFormData.excerpt,
        excerpt: articleFormData.excerpt || articleFormData.subtitle,
        content: articleFormData.content,
        categoryName: articleFormData.category,
        category: articleFormData.category,
        authorName: articleFormData.authorName,
        authorTitle: articleFormData.authorTitle,
        authorAvatar: articleFormData.authorAvatar,
        featuredImage: articleFormData.image,
        image: articleFormData.image,
        readingTime: parseInt(articleFormData.readTime, 10) || 5,
        readTime: articleFormData.readTime,
        status: articleFormData.status || 'published'
      };

      try {
        await ArticleService.updateArticle(artId, payload);
      } catch (e1) {
        try {
          await StoryService.updateStory(artId, payload);
        } catch (e2) {}
      }

      const updatedArticleObj = {
        ...editingArticle,
        ...payload,
        id: artId,
        _id: artId,
        categoryLabel: articleFormData.category
      };

      setAvailableArticles(prev => prev.map(a => String(a._id || a.id || a.slug) === String(artId) ? { ...a, ...updatedArticleObj } : a));

      if (Array.isArray(data.articles) && data.articles.length > 0) {
        const nextCustom = data.articles.map(a => String(a._id || a.id || a.slug) === String(artId) ? { ...a, ...updatedArticleObj } : a);
        persistToDatabase({ ...data, articles: nextCustom });
      }

      setArticleSaveStatus('saved');
      setTimeout(() => {
        setArticleSaveStatus('idle');
        setIsArticleEditModalOpen(false);
      }, 700);
    } catch (err) {
      console.error('Failed to save article:', err);
      setArticleSaveStatus('error');
    }
  };

  // ─────────────────────────────────────────────────────────
  // ARTICLE CURATION & REORDERING HANDLERS
  // ─────────────────────────────────────────────────────────
  const handleAutoFillToMax = () => {
    const needed = maxArticlesFit - activeArticles.length;
    if (needed <= 0) return;
    const existingKeys = new Set(activeArticles.map(a => String(a.slug || a.id || a._id || a.title || '').trim().toLowerCase()));
    const candidates = pool.filter(p => {
      if (!p) return false;
      const key = String(p.slug || p.id || p._id || p.title || '').trim().toLowerCase();
      return key && !existingKeys.has(key);
    });
    const toAdd = candidates.slice(0, needed).map(a => ({
      id: a._id || a.id || `art-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      articleId: a._id || a.id,
      title: a.title || 'Untitled Article',
      excerpt: a.excerpt || a.summary || a.description || '',
      category: a.categoryLabel || a.category || 'News',
      categoryLabel: a.categoryLabel || a.category || 'News',
      image: a.image || a.coverImage || a.fallbackImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
      author: typeof a.author === 'object' ? a.author?.name : (a.author || 'Editorial Bureau'),
      authorAvatar: a.authorAvatar || a.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      date: a.publishedAt || a.date || 'Today',
      readTime: a.readTime || '4 min read',
      slug: a.slug || a._id || a.id,
      link: a.slug ? `/stories/${a.slug}` : `/stories/${a._id || a.id}`,
      isCustom: true
    }));
    const nextArticles = [...activeArticles, ...toAdd];
    const nextData = { ...data, articles: nextArticles, limit: (isSpotlight || isTrending) ? 8 : (isLatestSection ? 4 : nextArticles.length), hasCustomArticles: true };
    persistToDatabase(nextData);
  };

  const handleOpenPicker = (target) => {
    if (target?.type === 'add' && activeArticles.length >= maxArticlesFit) {
      alert(`This section has reached the maximum capacity of ${maxArticlesFit} articles that fit on the frontend grid. Use Replace (↻) or Delete (🗑) on an existing card to change articles.`);
      return;
    }
    setPickerTarget(target);
    setPickerSearch('');
    setPickerCategory('All');
    setIsPickerOpen(true);
  };

  const handleSelectArticle = (article) => {
    const formatted = {
      id: article._id || article.id || `art-${Date.now()}`,
      articleId: article._id || article.id,
      title: article.title || 'Untitled Article',
      excerpt: article.excerpt || article.summary || article.description || '',
      category: article.categoryLabel || article.category || 'News',
      categoryLabel: article.categoryLabel || article.category || 'News',
      image: article.image || article.coverImage || article.fallbackImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
      author: typeof article.author === 'object' ? article.author?.name : (article.author || 'Editorial Bureau'),
      authorAvatar: article.authorAvatar || article.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      date: article.publishedAt || article.date || 'Today',
      readTime: article.readTime || '4 min read',
      slug: article.slug || article._id || article.id,
      link: article.slug ? `/stories/${article.slug}` : `/stories/${article._id || article.id}`,
      isCustom: true
    };

    let nextArticles = [...activeArticles];
    if (pickerTarget?.type === 'replace' && typeof pickerTarget.index === 'number') {
      nextArticles[pickerTarget.index] = formatted;
    } else {
      if (nextArticles.length >= maxArticlesFit) {
        setIsPickerOpen(false);
        return;
      }
      nextArticles.push(formatted);
    }

    const nextData = { ...data, articles: nextArticles, limit: (isSpotlight || isTrending) ? 8 : (isLatestSection ? 4 : nextArticles.length), hasCustomArticles: true };
    persistToDatabase(nextData);
    setIsPickerOpen(false);
  };

  const handleMoveArticle = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activeArticles.length) return;
    const nextArticles = [...activeArticles];
    const temp = nextArticles[idx];
    nextArticles[idx] = nextArticles[targetIdx];
    nextArticles[targetIdx] = temp;

    const nextData = { ...data, articles: nextArticles, hasCustomArticles: true };
    persistToDatabase(nextData);
  };

  const handleRemoveArticle = (idx, e) => {
    e?.stopPropagation();
    const nextArticles = activeArticles.filter((_, i) => i !== idx);
    const nextData = { ...data, articles: nextArticles, limit: (isSpotlight || isTrending) ? 8 : (isLatestSection ? 4 : nextArticles.length), hasCustomArticles: true };
    persistToDatabase(nextData);
  };

  // ─────────────────────────────────────────────────────────
  // QUICK EDIT MODAL HANDLERS
  // ─────────────────────────────────────────────────────────
  const handleOpenEditModal = () => {
    setEditFormData({
      title: data.title || data.heading || '',
      subtitle: data.subtitle || data.subheading || data.description || '',
      badge: data.badge || data.badgeText || '',
      viewAllText: data.viewAllText || 'View All',
      viewAllUrl: data.viewAllUrl || '/latest',
      category: data.category || '',
      limit: (isSpotlight || isTrending) ? 8 : (isLatestSection ? 4 : (data.limit || activeArticles.length || 8)),
      // Newsletter
      headline: data.headline || data.title || '',
      buttonText: data.buttonText || 'Subscribe',
      placeholder: data.placeholder || 'Enter your email address',
      // Image Text
      image: data.image || data.bgImage || '',
      imagePosition: data.imagePosition || 'left',
      buttonUrl: data.buttonUrl || data.primaryBtnUrl || '',
      // CTA
      primaryBtnText: data.primaryBtnText || data.buttonText || '',
      primaryBtnUrl: data.primaryBtnUrl || data.buttonUrl || '',
      secondaryBtnText: data.secondaryBtnText || '',
      secondaryBtnUrl: data.secondaryBtnUrl || '',
      bgImage: data.bgImage || data.image || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditModal = () => {
    const nextData = {
      ...data,
      ...editFormData,
      heading: editFormData.title || editFormData.heading || data.heading,
      description: editFormData.subtitle || editFormData.description || data.description,
      badgeText: editFormData.badge || data.badgeText
    };
    persistToDatabase(nextData);
    setIsEditModalOpen(false);
  };

  const getSectionTitle = () => {
    const raw = data.title || data.heading || data.headline || section.title;
    if (raw && !raw.includes('STORIES_FEED')) return raw;
    if (secType === 'stories_feed' || secType.includes('feed')) return 'Article & Story Feed';
    return 'Latest Articles';
  };

  const getSectionSubtitle = () => {
    return data.subtitle || data.subheading || data.description || '';
  };

  return (
    <div className="lse-overlay dedicated-page-view">
      {/* Sleek Floating Save Button */}
      <button
        type="button"
        className="lse-floating-save-btn"
        onClick={handleSaveAndApply}
        disabled={saveStatus === 'saving'}
        title="Save changes live to homepage"
        style={{
          position: 'fixed',
          top: '16px',
          right: '60px',
          zIndex: 99999,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '8px 20px',
          background: saveStatus === 'saved' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : saveStatus === 'error'
            ? '#ef4444'
            : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          fontSize: '0.84rem',
          fontWeight: 750,
          cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow: saveStatus === 'saved'
            ? '0 4px 14px rgba(16, 185, 129, 0.45)'
            : '0 4px 14px rgba(234, 88, 12, 0.45)',
          transition: 'all 0.2s ease'
        }}
      >
        {saveStatus === 'saving' ? (
          <>
            <RefreshCw size={14} className="lbe-spin" />
            <span>Saving...</span>
          </>
        ) : saveStatus === 'saved' ? (
          <>
            <Check size={16} />
            <span>Saved Live!</span>
          </>
        ) : saveStatus === 'error' ? (
          <>
            <span>Failed (Retry)</span>
          </>
        ) : (
          <>
            <Check size={16} />
            <span>Save</span>
          </>
        )}
      </button>

      <button
        type="button"
        className="lse-floating-close-btn"
        onClick={onClose}
        title="Close"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        }}
      >
        <X size={17} />
      </button>

      {/* ── Main Studio Canvas ── */}
      <main className="lse-workspace">
        <div className={`lse-canvas-wrapper ${deviceView === 'mobile' ? 'mobile-view' : ''}`}>
          {/* ── Real Frontend Page Content ── */}
          <div className="lse-browser-frame">
            {/* Real Frontend Website Body */}
            <div className="lse-real-frontend-sheet">
              {/* Real Frontend Content Container */}
              <div className={pageId === 'latest' ? "lap-page-wrapper" : "mhp-container"} style={{ padding: '1.5rem clamp(1rem, 2.5vw, 2.5rem) 3rem' }}>
                
                {/* Active Section */}
                <div className="lse-active-section-wrapper">

            {/* 1. ARTICLE FEED RENDERER (Latest Blogs, Trending, Popular, Spotlight) */}
            {isArticleFeed && (pageId === 'latest' || section?.id === 'latest_feed' ? (
              /* REAL FRONTEND LATEST ARTICLES PAGE VIEW */
              <div className="lap-page-wrapper" style={{ padding: '0 0 2rem' }}>
                {/* Real Frontend Header (Title + Subtitle) */}
                <div className="lap-header" style={{ marginBottom: '1.75rem' }}>
                  <h1 className="lap-title">
                    {getSectionTitle()}
                  </h1>
                </div>

                {/* Real Frontend Category Filter Pills Bar */}
                <div className="lap-category-pills-bar">
                  {['All', 'Startups', 'Technology', 'AI', 'Enterprise', 'FinTech', 'HerStory', 'SMBStory', 'SocialStory', 'Hindi'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`lap-pill-btn ${(data.category || 'All').toLowerCase() === cat.toLowerCase() || (cat === 'All' && !data.category) ? 'active' : ''}`}
                      onClick={() => {
                        const nextCat = cat === 'All' ? '' : cat;
                        const next = { ...data, category: nextCat };
                        persistToDatabase(next);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Real Frontend Responsive Card Grid (4 columns) */}
                <div className="lap-main-layout">
                  <div className="lap-left-col">
                    <div className="lap-articles-grid">
                      {activeArticles.map((story, idx) => {
                        if (!story) return null;
                        const artId = story.id || story._id || `lap-card-${idx}`;
                        const artTitle = getSafeString(story.title, 'Featured Story');
                        const artImg = getSafeString(story.image || story.coverImage || (typeof story.featuredImage === 'string' ? story.featuredImage : story.featuredImage?.url), 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80');
                        const artCat = getSafeString(story.categoryLabel || story.category, 'Startups');
                        const artExcerpt = getSafeString(story.summary || story.subtitle || story.excerpt || (typeof story.content === 'string' ? story.content.slice(0, 130) + '...' : ''), '');
                        const artAuthor = getSafeString(typeof story.author === 'object' && story.author ? story.author.name : (story.author || 'Editorial Bureau'), 'Editorial Bureau');
                        const artAvatar = getSafeString(story.authorAvatar || (typeof story.author === 'object' && story.author ? story.author.avatar : ''), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80');
                        const artDate = story.publishedAt || story.date || 'Today';
                        const artReadTime = getSafeString(story.readTime || (story.readingTime ? `${story.readingTime} min read` : '5 min read'), '5 min read');

                        return (
                          <article 
                            key={artId} 
                            className="lap-card lse-hover-item"
                            style={{ 
                              position: 'relative',
                              background: '#ffffff',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'all 0.25s ease'
                            }}
                          >
                          {/* Top Control Bar: Rank Badge + Horizontal Action Buttons directly ABOVE the card image */}
                          <div 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 10px',
                              background: '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                              gap: '8px'
                            }}
                          >
                            {/* Left: Position Indicator Badge */}
                            <div 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                color: '#0f172a'
                              }}
                              title={`Position #${idx + 1} in grid`}
                            >
                              <span style={{ color: '#ea580c', fontWeight: 850 }}>#{idx + 1}</span>
                            </div>

                            {/* Right: Horizontal Action Buttons */}
                            <div 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveArticle(idx, 'up')}
                                title="Move earlier (to left)"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#334155',
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  opacity: idx === 0 ? 0.35 : 1,
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <ArrowLeft size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === activeArticles.length - 1}
                                onClick={() => handleMoveArticle(idx, 'down')}
                                title="Move later (to right)"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#334155',
                                  cursor: idx === activeArticles.length - 1 ? 'not-allowed' : 'pointer',
                                  opacity: idx === activeArticles.length - 1 ? 0.35 : 1,
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <ArrowRight size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenArticleEditor(story)}
                                title="Edit this article's content"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenPicker({ type: 'replace', index: idx })}
                                title="Replace this article"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <RefreshCw size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleRemoveArticle(idx, e)}
                                title="Delete this article permanently"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid #fecaca',
                                  background: '#fef2f2',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div 
                            className="lap-thumb-wrap"
                            onClick={() => handleOpenArticleEditor(story)}
                            style={{ 
                              position: 'relative', 
                              width: '100%', 
                              height: '190px', 
                              overflow: 'hidden', 
                              cursor: 'pointer',
                              background: '#0f172a'
                            }}
                            title="Click to edit article"
                          >
                            <img 
                              src={artImg} 
                              alt={artTitle} 
                              className="lap-thumb"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transition: 'transform 0.4s ease'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                              }}
                            />

                            {/* Bottom Gradient for Category Tag Legibility */}
                            <div 
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(180deg, transparent 65%, rgba(15, 23, 42, 0.75) 100%)',
                                pointerEvents: 'none'
                              }}
                            />

                            <span 
                              style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                zIndex: 10,
                                background: '#0f172a',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                fontWeight: 850,
                                letterSpacing: '0.06em',
                                padding: '4px 9px',
                                borderRadius: '5px',
                                textTransform: 'uppercase',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                              }}
                            >
                              {artCat}
                            </span>
                          </div>

                            <div 
                              style={{
                                padding: '1.15rem',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                justifyContent: 'space-between',
                                background: '#ffffff'
                              }}
                            >
                              <div>
                                <h3 
                                  onClick={() => handleOpenArticleEditor(story)}
                                  style={{ 
                                    cursor: 'pointer',
                                    fontSize: '0.98rem',
                                    fontWeight: 750,
                                    lineHeight: 1.38,
                                    color: '#0f172a',
                                    margin: '0 0 8px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                  title="Click to edit article title"
                                >
                                  {artTitle}
                                </h3>
                                {artExcerpt && (
                                  <p 
                                    style={{
                                      fontSize: '0.82rem',
                                      color: '#64748b',
                                      lineHeight: 1.45,
                                      margin: '0 0 10px',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {artExcerpt}
                                  </p>
                                )}
                                <div 
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.76rem',
                                    color: '#94a3b8',
                                    fontWeight: 600,
                                    marginBottom: '14px'
                                  }}
                                >
                                  <span style={{ color: '#475569', fontWeight: 650 }}>{artAuthor}</span>
                                  <span>•</span>
                                  <span>{artDate}</span>
                                </div>
                              </div>

                              {/* Direct Quick Action to Edit Article & Content */}
                              <button
                                type="button"
                                onClick={() => handleOpenArticleEditor(story)}
                                title="Edit this article's title, summary, body content, author or image"
                                style={{
                                  width: '100%',
                                  padding: '9px 14px',
                                  borderRadius: '9px',
                                  background: '#f8fafc',
                                  border: '1.5px solid #e2e8f0',
                                  color: '#0f172a',
                                  fontSize: '0.82rem',
                                  fontWeight: 750,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '7px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                }}
                              >
                                <Edit3 size={14} color="#ea580c" />
                                <span>Edit Article & Content</span>
                              </button>
                            </div>
                          </article>
                        );
                      })}

                      {/* + Plus Add Article Card (Only shown if below max fit capacity) */}
                      {activeArticles.length < maxArticlesFit ? (
                        <div
                          className="lap-card lse-add-article-card"
                          onClick={() => handleOpenPicker({ type: 'add' })}
                          role="button"
                          tabIndex={0}
                          title={`Add an article to slot #${activeArticles.length + 1} of ${maxArticlesFit}`}
                          style={{
                            position: 'relative',
                            minHeight: '380px',
                            background: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)',
                            border: '2px dashed #ea580c',
                            borderRadius: '16px',
                            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#ffedd5',
                              color: '#c2410c',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              marginBottom: '1rem'
                            }}
                          >
                            <span>Slot #{activeArticles.length + 1} of {maxArticlesFit} Max</span>
                          </div>

                          <div
                            className="lse-add-plus-badge"
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 8px 22px rgba(234, 88, 12, 0.35)',
                              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              marginBottom: '1rem'
                            }}
                          >
                            <Plus size={30} strokeWidth={2.6} />
                          </div>

                          <h4
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              color: '#0f172a',
                              margin: '0 0 0.4rem',
                              letterSpacing: '-0.01em'
                            }}
                          >
                            + Add Article Card
                          </h4>

                          <p
                            style={{
                              fontSize: '0.82rem',
                              color: '#64748b',
                              margin: '0 0 1rem',
                              lineHeight: 1.45,
                              maxWidth: '220px'
                            }}
                          >
                            {maxArticlesFit - activeArticles.length} more card{maxArticlesFit - activeArticles.length === 1 ? '' : 's'} fit in this feed
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '210px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '9999px',
                                background: '#ea580c',
                                color: '#ffffff',
                                fontWeight: 750,
                                fontSize: '0.82rem',
                                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                              }}
                            >
                              <Plus size={15} /> Select Article
                            </span>

                            {pool.length > activeArticles.length && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAutoFillToMax();
                                }}
                                title="Auto-fill the remaining slots to complete the frontend grid"
                                style={{
                                  background: 'transparent',
                                  border: '1.5px solid #fdba74',
                                  borderRadius: '9999px',
                                  padding: '6px 12px',
                                  color: '#ea580c',
                                  fontSize: '0.74rem',
                                  fontWeight: 750,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '5px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Sparkles size={12} />
                                <span>Auto-fill to Max ({maxArticlesFit})</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Full Capacity Indicator */}
                      {activeArticles.length >= maxArticlesFit && (
                        <div
                          style={{
                            gridColumn: '1 / -1',
                            marginTop: '0.5rem',
                            padding: '12px 18px',
                            borderRadius: '12px',
                            background: 'rgba(34, 197, 94, 0.08)',
                            border: '1.5px solid rgba(34, 197, 94, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={17} color="#16a34a" />
                            <span style={{ fontSize: '0.86rem', fontWeight: 750, color: '#15803d' }}>
                              Feed Full ({activeArticles.length}/{maxArticlesFit} Articles) • Perfectly fits the frontend layout.
                            </span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            To replace or delete cards, use the action buttons on any card above.
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* HOMEPAGE SECTION VIEW */
              <section className="mhp-content-section" style={{ margin: 0, padding: 0 }}>
                {/* Real Frontend Section Header */}
                <div className="mhp-section-header" style={{ marginBottom: '1.75rem' }}>
                  <div className="mhp-section-header-left">
                    <div className="mhp-section-title-wrap">
                      <span>{getSectionTitle()}</span>
                    </div>
                  </div>
                  <span 
                    className="mhp-view-all-link"
                    style={{ cursor: 'default' }}
                  >
                    {data.viewAllText || (secType === 'trending' ? 'View All Trending' : secType === 'popular_editors' ? 'Explore Popular' : secType === 'spotlight' ? 'Explore Startups' : 'View All Articles')} <ArrowRight size={14} />
                  </span>
                </div>

                <div className="mhp-blog-cards-grid">
                    {frontendArticles.map((blog, idx) => {
                      if (!blog) return null;
                      const artId = blog.id || blog._id || `card-${idx}`;
                      const artTitle = getSafeString(blog.title, 'Featured Story');
                      const artImg = getSafeString((typeof blog.featuredImage === 'string' ? blog.featuredImage : blog.featuredImage?.url) || blog.image || blog.coverImage, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80');
                      const artCat = getSafeString(blog.categoryName || blog.categoryLabel || blog.category, 'Startups');
                      const artAuthor = getSafeString(typeof blog.author === 'object' && blog.author ? blog.author.name : (blog.authorName || blog.author), 'Editorial Bureau');
                      const artDate = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : getSafeString(blog.date, 'Today');

                      return (
                        <article 
                          key={artId} 
                          className="mhp-blog-card lse-hover-item"
                          style={{ 
                            position: 'relative',
                            background: '#ffffff',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '2px solid #ea580c',
                            boxShadow: '0 6px 20px rgba(234, 88, 12, 0.12)',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          {/* Top Control Bar: Rank Badge + Horizontal Action Buttons directly ABOVE the card image */}
                          <div 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 10px',
                              background: '#0f172a',
                              borderBottom: '1px solid rgba(234, 88, 12, 0.35)',
                              gap: '8px'
                            }}
                          >
                            {/* Left: Position Indicator Badge with Live Indicator */}
                            <div 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.76rem',
                                fontWeight: 800
                              }}
                              title={`Position #${idx + 1} • Live on Frontend Grid`}
                            >
                              <span style={{ color: '#fb923c' }}>#{idx + 1}</span>
                              <span 
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  color: '#4ade80', 
                                  fontSize: '0.64rem', 
                                  fontWeight: 900, 
                                  letterSpacing: '0.04em',
                                  background: 'rgba(34, 197, 94, 0.16)',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                                LIVE
                              </span>
                            </div>

                            {/* Right: Horizontal Action Buttons */}
                            <div 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveArticle(idx, 'up')}
                                title="Move Left (Earlier in Feed)"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#ffffff',
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  opacity: idx === 0 ? 0.35 : 1,
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <ArrowLeft size={13} />
                              </button>

                              <button
                                type="button"
                                disabled={idx === frontendArticles.length - 1}
                                onClick={() => handleMoveArticle(idx, 'down')}
                                title="Move Right (Later in Feed)"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#ffffff',
                                  cursor: idx === frontendArticles.length - 1 ? 'not-allowed' : 'pointer',
                                  opacity: idx === frontendArticles.length - 1 ? 0.35 : 1,
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <ArrowRight size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenArticleEditor(blog)}
                                title="Edit Article Details"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Edit2 size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenPicker({ type: 'replace', index: idx })}
                                title="Swap with another article"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <RefreshCw size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleRemoveArticle(idx, e)}
                                title="Delete from feed"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  background: 'rgba(239, 68, 68, 0.25)',
                                  color: '#fca5a5',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Thumbnail Wrap (Clean Image with Category Tag) */}
                          <div 
                            className="mhp-blog-thumb-wrap"
                            onClick={() => handleOpenArticleEditor(blog)}
                            style={{ 
                              position: 'relative', 
                              width: '100%', 
                              height: '190px', 
                              overflow: 'hidden', 
                              cursor: 'pointer',
                              background: '#0f172a'
                            }}
                            title="Click to edit article"
                          >
                            <img 
                              src={artImg} 
                              alt={artTitle} 
                              className="mhp-blog-thumb"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transition: 'transform 0.4s ease'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80';
                              }}
                            />

                            {/* Bottom Legibility Gradient Overlay */}
                            <div 
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(180deg, transparent 65%, rgba(15, 23, 42, 0.75) 100%)',
                                pointerEvents: 'none'
                              }}
                            />

                            {/* Category Pill in Bottom-Left of Image */}
                            <span 
                              style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                zIndex: 10,
                                background: '#0f172a',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                fontWeight: 850,
                                letterSpacing: '0.06em',
                                padding: '4px 9px',
                                borderRadius: '5px',
                                textTransform: 'uppercase',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                              }}
                            >
                              {artCat}
                            </span>
                          </div>

                          {/* Card Content Body */}
                          <div 
                            style={{
                              padding: '1.15rem',
                              display: 'flex',
                              flexDirection: 'column',
                              flex: 1,
                              justifyContent: 'space-between',
                              background: '#ffffff'
                            }}
                          >
                            <div>
                              <h3 
                                onClick={() => handleOpenArticleEditor(blog)}
                                style={{ 
                                  cursor: 'pointer',
                                  fontSize: '0.98rem',
                                  fontWeight: 750,
                                  lineHeight: 1.38,
                                  color: '#0f172a',
                                  margin: '0 0 8px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                                title="Click to edit article title"
                              >
                                {artTitle}
                              </h3>

                              {blog.excerpt && (
                                <p 
                                  style={{
                                    fontSize: '0.82rem',
                                    color: '#64748b',
                                    lineHeight: 1.45,
                                    margin: '0 0 10px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {blog.excerpt}
                                </p>
                              )}

                              <div 
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.76rem',
                                  color: '#94a3b8',
                                  fontWeight: 600,
                                  marginBottom: '14px'
                                }}
                              >
                                <span style={{ color: '#475569', fontWeight: 650 }}>{artAuthor}</span>
                                <span>•</span>
                                <span>{artDate}</span>
                              </div>
                            </div>

                            {/* Direct Quick Action to Edit Article & Content */}
                            <button
                              type="button"
                              onClick={() => handleOpenArticleEditor(blog)}
                              title="Open editor to change title, summary, body content, author or image"
                              style={{
                                width: '100%',
                                padding: '9px 14px',
                                borderRadius: '9px',
                                background: '#f8fafc',
                                border: '1.5px solid #e2e8f0',
                                color: '#0f172a',
                                fontSize: '0.82rem',
                                fontWeight: 750,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '7px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                              }}
                            >
                              <Edit3 size={14} color="#ea580c" />
                              <span>Edit Article & Content</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}

                    {/* + Plus Add Article Card (Only shown if below max fit capacity) */}
                    {activeArticles.length < maxArticlesFit ? (
                      <div
                        className="mhp-blog-card lse-add-article-card"
                        onClick={() => handleOpenPicker({ type: 'add' })}
                        role="button"
                        tabIndex={0}
                        title={`Add an article to slot #${activeArticles.length + 1} of ${maxArticlesFit}`}
                        style={{
                          position: 'relative',
                          minHeight: '380px',
                          background: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)',
                          border: '2px dashed #ea580c',
                          borderRadius: '16px',
                          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2rem 1.5rem',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#ffedd5',
                            color: '#c2410c',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            marginBottom: '1rem'
                          }}
                        >
                          <span>Slot #{activeArticles.length + 1} of ${maxArticlesFit} Max</span>
                        </div>

                        <div
                          className="lse-add-plus-badge"
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 22px rgba(234, 88, 12, 0.35)',
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            marginBottom: '1rem'
                          }}
                        >
                          <Plus size={30} strokeWidth={2.6} />
                        </div>

                        <h4
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 0.4rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          + Add Article Card
                        </h4>

                        <p
                          style={{
                            fontSize: '0.82rem',
                            color: '#64748b',
                            margin: '0 0 1rem',
                            lineHeight: 1.45,
                            maxWidth: '220px'
                          }}
                        >
                          {maxArticlesFit - activeArticles.length} more card{maxArticlesFit - activeArticles.length === 1 ? '' : 's'} fit in this homepage section
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '210px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              borderRadius: '9999px',
                              background: '#ea580c',
                              color: '#ffffff',
                              fontWeight: 750,
                              fontSize: '0.82rem',
                              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                            }}
                          >
                            <Plus size={15} /> Select Article
                          </span>

                          {pool.length > activeArticles.length && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAutoFillToMax();
                              }}
                              title="Auto-fill the remaining slots to complete the frontend grid"
                              style={{
                                background: 'transparent',
                                border: '1.5px solid #fdba74',
                                borderRadius: '9999px',
                                padding: '6px 12px',
                                color: '#ea580c',
                                fontSize: '0.74rem',
                                fontWeight: 750,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Sparkles size={12} />
                              <span>Auto-fill to Max ({maxArticlesFit})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Full Capacity Indicator for Homepage Section */}
                    {activeArticles.length >= maxArticlesFit && (
                      <div
                        style={{
                          gridColumn: '1 / -1',
                          marginTop: '0.5rem',
                          padding: '12px 18px',
                          borderRadius: '12px',
                          background: 'rgba(34, 197, 94, 0.08)',
                          border: '1.5px solid rgba(34, 197, 94, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={17} color="#16a34a" />
                          <span style={{ fontSize: '0.86rem', fontWeight: 750, color: '#15803d' }}>
                            Section Full ({activeArticles.length}/{maxArticlesFit} Articles) • Perfectly fills the row on the frontend homepage.
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          To replace or delete cards, use the action buttons on any card above.
                        </span>
                      </div>
                    )}

                </div>
              </section>
            ))}

            {/* 2. NEWSLETTER BANNER RENDERER */}
            {isNewsletter && (
              <section className="mhp-newsletter-section" style={{ margin: 0 }}>
                <div className="mhp-newsletter-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', border: '1.5px solid rgba(234, 88, 12, 0.35)', borderRadius: '16px', padding: '2.5rem' }}>
                  <div className="mhp-newsletter-left">
                    <div className="mhp-newsletter-icon-wrap" style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c' }}>
                      <Mail size={32} />
                    </div>
                    <div>
                      <h2 
                        className="mhp-newsletter-title lse-inline-edit-hint" 
                        onClick={handleOpenEditModal}
                        title="Click to edit headline"
                        style={{ color: '#ffffff', margin: '0 0 6px' }}
                      >
                        {data.headline || data.title || "Get the Latest Blogs Delivered to Your Inbox"}
                      </h2>
                      <p 
                        className="lse-inline-edit-hint" 
                        onClick={handleOpenEditModal}
                        title="Click to edit subtitle"
                        style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8' }}
                      >
                        {data.subtitle || "Unfiltered insights on venture capital, frontier tech, and high-growth leadership directly in your inbox."}
                      </p>
                    </div>
                  </div>

                  <form className="mhp-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                    <input 
                      type="email" 
                      placeholder={data.placeholder || "Enter your email address"}
                      className="mhp-newsletter-input lse-inline-edit-hint"
                      onClick={handleOpenEditModal}
                      title="Click to edit placeholder"
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                    <button 
                      type="button" 
                      className="mhp-newsletter-btn lse-inline-edit-hint"
                      onClick={handleOpenEditModal}
                      title="Click to edit button text"
                      style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#ffffff', fontWeight: 800 }}
                    >
                      {data.buttonText || "Subscribe"}
                    </button>
                  </form>
                </div>
              </section>
            )}

            {/* 3. IMAGE + TEXT SPLIT RENDERER */}
            {isImageText && (
              <div style={{ display: 'grid', gridTemplateColumns: deviceView === 'mobile' ? '1fr' : '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
                {data.imagePosition === 'left' && (
                  <div className="lse-inline-edit-hint" onClick={handleOpenEditModal} title="Click to edit image URL">
                    <img 
                      src={data.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80'} 
                      alt="Banner" 
                      style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} 
                    />
                  </div>
                )}
                <div>
                  {data.badge && (
                    <span 
                      className="lse-inline-edit-hint" 
                      onClick={handleOpenEditModal}
                      style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', fontWeight: 800, fontSize: '0.78rem', marginBottom: '1rem' }}
                    >
                      {data.badge}
                    </span>
                  )}
                  <h2 
                    className="lse-inline-edit-hint" 
                    onClick={handleOpenEditModal}
                    style={{ fontSize: '2rem', fontWeight: 850, color: '#ffffff', margin: '0 0 1rem', lineHeight: 1.25 }}
                  >
                    {data.heading || data.title || "Built for the Next Generation of Builders"}
                  </h2>
                  <p 
                    className="lse-inline-edit-hint" 
                    onClick={handleOpenEditModal}
                    style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.5rem' }}
                  >
                    {data.description || data.subtitle || "Comprehensive reporting that cuts through the noise. Get actionable frameworks and genuine founder journeys."}
                  </p>
                  {(data.buttonText || 'Read More') && (
                    <button 
                      type="button" 
                      className="lse-inline-edit-hint" 
                      onClick={handleOpenEditModal}
                      style={{ padding: '10px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>{data.buttonText || 'Read More'}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
                {data.imagePosition !== 'left' && (
                  <div className="lse-inline-edit-hint" onClick={handleOpenEditModal} title="Click to edit image URL">
                    <img 
                      src={data.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80'} 
                      alt="Banner" 
                      style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4. CALL TO ACTION (CTA) RENDERER */}
            {isCTA && (
              <div 
                style={{
                  padding: '3.5rem 2rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  background: data.bgImage ? `linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.94)), url(${data.bgImage})` : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  backgroundSize: 'cover',
                  border: '1.5px solid rgba(234, 88, 12, 0.35)'
                }}
              >
                {data.badge && (
                  <span className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', fontWeight: 800, fontSize: '0.78rem', marginBottom: '1rem' }}>
                    {data.badge}
                  </span>
                )}
                <h2 className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem' }}>
                  {data.heading || data.title || "Ready to Amplify Your Ecosystem Voice?"}
                </h2>
                <p className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                  {data.description || data.subtitle || "Partner with GoReadPost to reach thousands of high-conviction founders, engineers, and venture capital investors."}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ padding: '12px 26px', borderRadius: '8px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>{data.primaryBtnText || data.buttonText || 'Get In Touch'}</span>
                    <ArrowRight size={16} />
                  </button>
                  {data.secondaryBtnText && (
                    <button type="button" className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ padding: '12px 26px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontWeight: 750, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                      <span>{data.secondaryBtnText}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 5. TEXT / ABOUT BLOCK */}
            {isText && (
              <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                {data.badge && (
                  <span className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', fontWeight: 800, fontSize: '0.78rem', marginBottom: '1rem' }}>
                    {data.badge}
                  </span>
                )}
                <h2 className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '2.2rem', fontWeight: 850, color: '#ffffff', margin: '0 0 1.25rem' }}>
                  {data.heading || data.title || "About Our Journalism"}
                </h2>
                <div className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.8, textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {data.content || data.body || data.description || "We report with absolute independence on high-impact technology, venture capital trends, and emerging founder stories across Bharat and global hubs."}
                </div>
              </div>
            )}

            {/* 6. GRID / LIST SECTIONS (Services, Features, Stats, Testimonials, Portfolio, Brands, FAQ, Contact) */}
            {isGridList && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  {data.badge && (
                    <span className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', fontWeight: 800, fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                      {data.badge}
                    </span>
                  )}
                  <h2 className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '2rem', fontWeight: 850, color: '#ffffff', margin: '0 0 0.5rem' }}>
                    {getSectionTitle()}
                  </h2>
                  {getSectionSubtitle() && (
                    <p className="lse-inline-edit-hint" onClick={handleOpenEditModal} style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
                      {getSectionSubtitle()}
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: deviceView === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {(data.items || []).map((item, idx) => (
                    <div 
                      key={idx}
                      className="lse-hover-item"
                      style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1.5rem', position: 'relative' }}
                    >
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#ffffff', fontWeight: 750 }}>
                        {item.title || item.name || item.number || `Item #${idx + 1}`}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        {item.description || item.quote || item.label || item.meta || ''}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="lse-toolbar-btn primary"
                    onClick={handleOpenEditModal}
                  >
                    <Edit3 size={14} />
                    <span>Manage Section Items & Texts</span>
                  </button>
                </div>
              </div>
            )}

                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── Quick Edit Modal ── */}
      {isEditModalOpen && (
        <div className="lse-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="lse-modal" onClick={e => e.stopPropagation()}>
            <div className="lse-modal-header">
              <h4>
                <Edit3 size={17} color="#fb923c" />
                <span>Live Edit Section: {getSectionTitle()}</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lse-modal-body">
              <div className="lse-input-group">
                <label>Section Title / Heading</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={e => setEditFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Latest from the Blog"
                />
              </div>

              <div className="lse-input-group">
                <label>Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={editFormData.subtitle || ''}
                  onChange={e => setEditFormData(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Supporting narrative or section description..."
                />
              </div>

              {isArticleFeed && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="lse-input-group">
                      <label>View All Button Text</label>
                      <input
                        type="text"
                        value={editFormData.viewAllText || ''}
                        onChange={e => setEditFormData(p => ({ ...p, viewAllText: e.target.value }))}
                        placeholder="View All Articles"
                      />
                    </div>
                    <div className="lse-input-group">
                      <label>View All Destination URL</label>
                      <input
                        type="text"
                        value={editFormData.viewAllUrl || ''}
                        onChange={e => setEditFormData(p => ({ ...p, viewAllUrl: e.target.value }))}
                        placeholder="/latest or /trending"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="lse-input-group">
                      <label>Default Category Filter</label>
                      <select
                        value={editFormData.category || ''}
                        onChange={e => setEditFormData(p => ({ ...p, category: e.target.value }))}
                      >
                        {CATEGORY_CHOICES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="lse-input-group">
                      <label>Max Articles in Grid</label>
                      <input
                        type="number"
                        min="2"
                        max="24"
                        value={editFormData.limit || 6}
                        onChange={e => setEditFormData(p => ({ ...p, limit: parseInt(e.target.value, 10) || 6 }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {isNewsletter && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="lse-input-group">
                    <label>Button Text</label>
                    <input
                      type="text"
                      value={editFormData.buttonText || ''}
                      onChange={e => setEditFormData(p => ({ ...p, buttonText: e.target.value }))}
                      placeholder="Subscribe"
                    />
                  </div>
                  <div className="lse-input-group">
                    <label>Input Placeholder</label>
                    <input
                      type="text"
                      value={editFormData.placeholder || ''}
                      onChange={e => setEditFormData(p => ({ ...p, placeholder: e.target.value }))}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              )}

              {(isImageText || isCTA) && (
                <div className="lse-input-group">
                  <label>Background / Cover Image URL</label>
                  <input
                    type="text"
                    value={editFormData.image || editFormData.bgImage || ''}
                    onChange={e => setEditFormData(p => ({ ...p, image: e.target.value, bgImage: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {(editFormData.image || editFormData.bgImage) && (
                    <div style={{ marginTop: '8px', maxHeight: '140px', overflow: 'hidden', borderRadius: '8px' }}>
                      <img src={editFormData.image || editFormData.bgImage} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              )}

              {(isImageText || isCTA) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="lse-input-group">
                    <label>Primary Button Text</label>
                    <input
                      type="text"
                      value={editFormData.primaryBtnText || editFormData.buttonText || ''}
                      onChange={e => setEditFormData(p => ({ ...p, primaryBtnText: e.target.value, buttonText: e.target.value }))}
                      placeholder="Read More"
                    />
                  </div>
                  <div className="lse-input-group">
                    <label>Primary Button Link</label>
                    <input
                      type="text"
                      value={editFormData.primaryBtnUrl || editFormData.buttonUrl || ''}
                      onChange={e => setEditFormData(p => ({ ...p, primaryBtnUrl: e.target.value, buttonUrl: e.target.value }))}
                      placeholder="/about or #contact"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="lse-modal-footer">
              <button
                type="button"
                className="lse-btn-cancel"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lse-btn-save"
                onClick={handleSaveEditModal}
              >
                <Check size={15} />
                <span>Update Section & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Article Picker Modal ── */}
      {isPickerOpen && (
        <div className="lbe-picker-overlay" onClick={() => setIsPickerOpen(false)}>
          <div className="lbe-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="lbe-picker-header">
              <div>
                <h4 className="lbe-picker-title">
                  <Layers size={18} color="#38bdf8" />
                  <span>
                    {pickerTarget?.type === 'replace' ? `Replace Article #${(pickerTarget?.index ?? 0) + 1}` : `Select Article to Add (Slot #${activeArticles.length + 1} of ${maxArticlesFit} Max)`}
                  </span>
                </h4>
                <p className="lbe-picker-subtitle">
                  {pickerTarget?.type === 'replace' ? 'Pick a published article to swap into this slot.' : `This section fits up to ${maxArticlesFit} articles on the frontend grid. Choose an article to fill this slot.`}
                </p>
              </div>
              <button 
                type="button" 
                className="lbe-picker-close-btn"
                onClick={() => setIsPickerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lbe-picker-toolbar">
              <div className="lbe-picker-search-wrap">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search articles by title, author, desk..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="lbe-picker-search-input"
                  autoFocus
                />
                {pickerSearch && (
                  <button 
                    type="button" 
                    onClick={() => setPickerSearch('')}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="lbe-picker-categories">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`lbe-picker-cat-pill ${pickerCategory === cat ? 'active' : ''}`}
                    onClick={() => setPickerCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="lbe-picker-body">
              {filteredPickerArticles.length === 0 ? (
                <div className="lbe-picker-empty">
                  <p>No articles found matching "{pickerSearch}".</p>
                </div>
              ) : (
                <div className="lbe-picker-grid">
                  {filteredPickerArticles.map(article => {
                    const artId = article._id || article.id;
                    const artTitle = article.title || 'Untitled Article';
                    const artImg = article.image || article.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
                    const artCat = article.categoryLabel || article.category || 'Article';
                    const artAuthor = typeof article.author === 'object' ? article.author?.name : (article.author || 'Author');

                    return (
                      <div 
                        key={artId} 
                        className="lbe-picker-card"
                        onClick={() => handleSelectArticle(article)}
                      >
                        <div className="lbe-picker-card-thumb-wrap">
                          <img src={artImg} alt={artTitle} className="lbe-picker-card-thumb" />
                          <span className="lbe-picker-card-category">{artCat}</span>
                        </div>
                        <div className="lbe-picker-card-content">
                          <h5 className="lbe-picker-card-title">{artTitle}</h5>
                          <div className="lbe-picker-card-meta">
                            <span>{artAuthor}</span>
                          </div>
                          <button 
                            type="button" 
                            className="lbe-picker-select-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectArticle(article);
                            }}
                          >
                            <Check size={13} />
                            <span>Select This Article</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Dedicated Article Content & Metadata Editor Modal ── */}
      {isArticleEditModalOpen && (
        <div className="lse-modal-overlay" onClick={() => setIsArticleEditModalOpen(false)}>
          <div className="lse-article-modal" onClick={e => e.stopPropagation()}>
            <div className="lse-article-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#ea580c" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Edit Article & Content</h4>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Changes are saved to the database and update across all frontend pages
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                className="lbe-picker-close-btn"
                onClick={() => setIsArticleEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lse-article-modal-body">
              <div className="lse-input-group">
                <label>Article Title *</label>
                <input
                  type="text"
                  value={articleFormData.title}
                  onChange={e => setArticleFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Headline of the story..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="lse-input-group">
                  <label>Desk / Category</label>
                  <select
                    value={articleFormData.category}
                    onChange={e => setArticleFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Startups">Startups & Ecosystem</option>
                    <option value="Technology">Technology & Cloud</option>
                    <option value="AI">AI & DeepTech</option>
                    <option value="Enterprise">Enterprise & SaaS</option>
                    <option value="FinTech">FinTech & Web3</option>
                    <option value="HerStory">HerStory (Women Leaders)</option>
                    <option value="SMBStory">SMBStory (MSME & D2C)</option>
                    <option value="SocialStory">SocialStory (Impact)</option>
                    <option value="Hindi">YS Hindi Edition</option>
                  </select>
                </div>

                <div className="lse-input-group">
                  <label>Estimated Reading Time</label>
                  <input
                    type="text"
                    value={articleFormData.readTime}
                    onChange={e => setArticleFormData(prev => ({ ...prev, readTime: e.target.value }))}
                    placeholder="e.g. 5 min read"
                  />
                </div>
              </div>

              <div className="lse-input-group">
                <label>Summary / Excerpt (Lead Paragraph)</label>
                <textarea
                  rows={2}
                  value={articleFormData.excerpt}
                  onChange={e => setArticleFormData(prev => ({ ...prev, excerpt: e.target.value, subtitle: e.target.value }))}
                  placeholder="Short teaser shown on the card preview..."
                />
              </div>

              <div className="lse-input-group">
                <label>Article Body Content</label>
                <textarea
                  rows={6}
                  value={articleFormData.content}
                  onChange={e => setArticleFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Full text or HTML content of the article..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="lse-input-group">
                  <label>Author Name</label>
                  <input
                    type="text"
                    value={articleFormData.authorName}
                    onChange={e => setArticleFormData(prev => ({ ...prev, authorName: e.target.value }))}
                    placeholder="Author name..."
                  />
                </div>
                <div className="lse-input-group">
                  <label>Author Title / Role</label>
                  <input
                    type="text"
                    value={articleFormData.authorTitle}
                    onChange={e => setArticleFormData(prev => ({ ...prev, authorTitle: e.target.value }))}
                    placeholder="e.g. Senior Staff Reporter"
                  />
                </div>
              </div>

              <div className="lse-input-group">
                <label>Featured Image URL</label>
                <input
                  type="text"
                  value={articleFormData.image}
                  onChange={e => setArticleFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                />
                {articleFormData.image && (
                  <div style={{ marginTop: '8px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img 
                      src={articleFormData.image} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={e => { e.target.style.display = 'none'; }} 
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="lse-article-modal-footer">
              <button 
                type="button" 
                className="lse-modal-btn cancel" 
                onClick={() => setIsArticleEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lse-modal-btn save"
                onClick={handleSaveArticleContent}
                disabled={articleSaveStatus === 'saving'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {articleSaveStatus === 'saving' ? (
                  <>
                    <RefreshCw size={14} className="lse-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : articleSaveStatus === 'saved' ? (
                  <>
                    <CheckCircle size={14} color="#22c55e" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Save Article Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
