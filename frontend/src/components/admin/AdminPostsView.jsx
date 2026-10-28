import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Filter, Eye, EyeOff, 
  ExternalLink, Calendar, User, Tag, CheckCircle, Clock, 
  RefreshCw, AlertCircle, Save, Sparkles, FileText, Image as ImageIcon,
  X, Check, ChevronDown, BookOpen, Layers, ArrowUpRight, Flame,
  Share2, Hash, Globe, Video, Link2, List, ListOrdered, Quote, Code,
  Heading1, Heading2, Heading3, Bold, Italic, Underline, Upload, CheckSquare, Square, Send,
  Lock, Unlock, Copy, ArrowLeft, Archive, RotateCcw, FileEdit,
  Star, TrendingUp, Zap, Award, LayoutGrid, Info
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { TaxonomyService } from '../../services/taxonomyService';
import { MediaService } from '../../services/mediaService';
import TipTapEditor from './TipTapEditor';
import LiveArticleStudio from './LiveArticleStudio';
import './LiveArticleStudio.css';

export const DESKS = [
  { id: 'all', label: 'All Desks' },
  { id: 'GoReadPost', label: 'GoReadPost Main' },
  { id: 'AIStory', label: 'AIStory' },
  { id: 'HerStory', label: 'HerStory' },
  { id: 'SMBStory', label: 'SMBStory' },
  { id: 'EnterpriseStory', label: 'EnterpriseStory' },
  { id: 'YS हिंदी', label: 'YS हिंदी' },
  { id: 'SocialStory', label: 'SocialStory' }
];

export const TOPIC_PRESETS = [
  'AI', 'Generative AI', 'FinTech', 'DeepTech', 'SaaS', 'B2B', 'D2C', 
  'Startups', 'Funding', 'Women In Tech', 'MSME', 'Bootstrapped', 'Unicorn'
];

export default function AdminPostsView({ onShowToast, currentPath = '/admin/posts', onNavigate }) {
  // Articles state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState(() => {
    if (currentPath === '/admin/drafts' || currentPath?.includes('/draft')) return 'draft';
    if (currentPath === '/admin/archived' || currentPath?.includes('/archived')) return 'archived';
    return 'all';
  }); // 'all' | 'published' | 'draft' | 'scheduled' | 'archived'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDesk, setSelectedDesk] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    }
    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  const activeFilterCount = (selectedDesk !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0);
  
  // Taxonomies from DB
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);

  // Media Library Modal for image picking
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState('featured'); // 'featured' | 'inline'
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Post Editor State (Dedicated Page View)
  const [isEditorOpen, setIsEditorOpen] = useState(() => {
    return Boolean(currentPath && (currentPath.includes('/create') || currentPath.includes('/edit')));
  });
  const [editorTab, setEditorTab] = useState('content'); // 'content' | 'media' | 'publishing' | 'seo'
  const [editingArticle, setEditingArticle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [showSlugSuggestions, setShowSlugSuggestions] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [editorMode, setEditorMode] = useState('tiptap'); // 'tiptap' | 'code'
  const [isSlugExpanded, setIsSlugExpanded] = useState(false);
  const [isExcerptExpanded, setIsExcerptExpanded] = useState(false);
  const [viewingArticleDetails, setViewingArticleDetails] = useState(null);
  const [copiedDetailSlug, setCopiedDetailSlug] = useState(false);

  useEffect(() => {
    if (viewingArticleDetails) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setViewingArticleDetails(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewingArticleDetails]);

  // Rich Text Editor textarea ref for inserting markdown/html tokens
  const contentTextareaRef = useRef(null);
  const tiptapEditorRef = useRef(null);

  // Form Data conforming to Article schema
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    excerpt: '',
    content: '',
    featuredImage: {
      url: '',
      alt: '',
      caption: '',
      credit: ''
    },
    authorId: '',
    authorName: 'Editorial Desk',
    authorTitle: 'Staff Reporter',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    categoryId: '',
    categoryName: 'Startups',
    brand: 'GoReadPost',
    topics: ['Startups'],
    tags: 'startups, innovation, ecosystem',
    contentType: 'Article',
    readingTime: '4 min read',
    language: 'en',
    location: 'India',
    isFeatured: false,
    isBreaking: false,
    isTrending: false,
    isEditorPick: false,
    status: 'published', // 'draft' | 'scheduled' | 'published' | 'archived'
    scheduledAt: '',
    publishedAt: '',
    seo: {
      title: '',
      description: '',
      keywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: ''
    }
  });

  // Quick Inline Adders for Author and Category
  const [quickAuthorName, setQuickAuthorName] = useState('');
  const [quickAuthorTitle, setQuickAuthorTitle] = useState('');
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [showQuickAuthor, setShowQuickAuthor] = useState(false);

  // Topics Multi-Select State
  const [topicSearchInput, setTopicSearchInput] = useState('');
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // Tags Multi-Select State
  const [newTagInput, setNewTagInput] = useState('');
  const [tagSuggestionsOpen, setTagSuggestionsOpen] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const tagInputRef = useRef(null);

  // Filtered available lists (enforcing active-only for new, preserving current assignments when editing)
  const availableCategories = useMemo(() => {
    return (categories || []).filter(c => c.isActive !== false || c._id === formData.categoryId || c.name === formData.categoryName);
  }, [categories, formData.categoryId, formData.categoryName]);

  const availableTopics = useMemo(() => {
    const currentTopicNames = (Array.isArray(formData.topics) ? formData.topics : []).map(t => (t || '').toLowerCase());
    return (topics || []).filter(t => t.isActive !== false || currentTopicNames.includes((t.name || '').toLowerCase()));
  }, [topics, formData.topics]);

  const availableTags = useMemo(() => {
    const currentTagTokens = (typeof formData.tags === 'string' ? formData.tags : '')
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);
    return (tags || []).filter(t => t.isActive !== false || currentTagTokens.includes((t.name || '').toLowerCase()));
  }, [tags, formData.tags]);

  // Topic Toggle Handler
  const handleToggleTopic = (topicName) => {
    if (!topicName) return;
    const clean = topicName.trim();
    const currentList = Array.isArray(formData.topics) ? [...formData.topics] : [];
    const exists = currentList.some(t => t.toLowerCase() === clean.toLowerCase());
    const updated = exists 
      ? currentList.filter(t => t.toLowerCase() !== clean.toLowerCase())
      : [...currentList, clean];

    const resolvedIds = updated.map(name => {
      const match = (topics || []).find(t => (t.name || '').toLowerCase() === name.toLowerCase());
      return match ? match._id : null;
    }).filter(Boolean);

    setFormData(prev => ({
      ...prev,
      topics: updated,
      topicIds: resolvedIds
    }));
  };

  // Inline Quick Topic Creator
  const handleCreateQuickTopic = async (nameToCreate) => {
    const name = (nameToCreate || topicSearchInput || '').trim();
    if (!name) return;
    setIsCreatingTopic(true);
    try {
      const created = await TaxonomyService.createTopic({
        name,
        slug: slugify(name),
        isActive: true,
        categoryIds: formData.categoryId ? [formData.categoryId] : []
      });
      setTopics(prev => [...prev, created]);
      handleToggleTopic(created.name);
      setTopicSearchInput('');
      setIsTopicDropdownOpen(false);
      if (onShowToast) onShowToast(`Created new topic "${created.name}" and attached to story!`);
    } catch (err) {
      alert(`Could not create topic: ${err.message}`);
    } finally {
      setIsCreatingTopic(false);
    }
  };

  // Tag Chips Handlers
  const handleAddTag = (text) => {
    const clean = (text || '').trim().replace(/^#/, '');
    if (!clean) return;
    const currentList = (typeof formData.tags === 'string' ? formData.tags : '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    if (!currentList.some(t => t.toLowerCase() === clean.toLowerCase())) {
      currentList.push(clean);
      const resolvedTagIds = currentList.map(name => {
        const match = (tags || []).find(t => (t.name || '').toLowerCase() === name.toLowerCase());
        return match ? match._id : null;
      }).filter(Boolean);

      setFormData(prev => ({
        ...prev,
        tags: currentList.join(', '),
        tagIds: resolvedTagIds
      }));
    }
    setNewTagInput('');
    setTagSuggestionsOpen(false);
  };

  const handleRemoveTag = (tokenToRemove) => {
    const currentList = (typeof formData.tags === 'string' ? formData.tags : '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const updated = currentList.filter(t => t.toLowerCase() !== tokenToRemove.toLowerCase());
    const resolvedTagIds = updated.map(name => {
      const match = (tags || []).find(t => (t.name || '').toLowerCase() === name.toLowerCase());
      return match ? match._id : null;
    }).filter(Boolean);

    setFormData(prev => ({
      ...prev,
      tags: updated.join(', '),
      tagIds: resolvedTagIds
    }));
  };

  // Inline Quick Tag Creator
  const handleCreateQuickTag = async (nameToCreate) => {
    const name = (nameToCreate || newTagInput || '').trim().replace(/^#/, '');
    if (!name) return;
    setIsCreatingTag(true);
    try {
      const created = await TaxonomyService.createTag({
        name,
        slug: slugify(name),
        isActive: true
      });
      setTags(prev => [...prev, created]);
      handleAddTag(created.name);
      setNewTagInput('');
      setTagSuggestionsOpen(false);
      if (onShowToast) onShowToast(`Created new tag "#${created.name}" and attached to story!`);
    } catch (err) {
      alert(`Could not create tag: ${err.message}`);
    } finally {
      setIsCreatingTag(false);
    }
  };

  // Delete Confirm Modal
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Selected for bulk
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadArticles(),
        loadTaxonomies()
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const res = await ArticleService.getAdminArticles({ limit: 500 });
      if (res && res.data) {
        setArticles(res.data);
        setTotalCount(res.pagination?.total || res.data.length);
      }
    } catch (err) {
      console.error('Error loading admin articles:', err);
    }
  };

  const loadTaxonomies = async () => {
    try {
      const [cats, auths, tops, tgs] = await Promise.all([
        TaxonomyService.getCategories(),
        TaxonomyService.getAuthors(),
        TaxonomyService.getTopics(),
        TaxonomyService.getTags()
      ]);
      setCategories(cats || []);
      setAuthors(auths || []);
      setTopics(tops || []);
      setTags(tgs || []);
    } catch (err) {
      console.error('Error loading taxonomies:', err);
    }
  };

  const loadMediaLibrary = async () => {
    setMediaLoading(true);
    try {
      const files = await MediaService.getFiles();
      setMediaFiles(Array.isArray(files) ? files : []);
    } catch (err) {
      console.error('Error loading media:', err);
    } finally {
      setMediaLoading(false);
    }
  };

  // Slug generator helper
  const slugify = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  // Helper for category branding accents & colors
  const getCategoryMeta = (categoryName) => {
    const lower = (categoryName || '').toLowerCase();
    if (lower.includes('tech') || lower.includes('ai') || lower.includes('deeptech') || lower.includes('software')) {
      return {
        dotColor: '#38bdf8',
        bgColor: 'rgba(14, 165, 233, 0.12)',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        textColor: '#0284c7'
      };
    }
    if (lower.includes('startup') || lower.includes('fund') || lower.includes('venture') || lower.includes('deal')) {
      return {
        dotColor: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(52, 211, 153, 0.3)',
        textColor: '#059669'
      };
    }
    if (lower.includes('fintech') || lower.includes('crypto') || lower.includes('bank') || lower.includes('market')) {
      return {
        dotColor: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.12)',
        borderColor: 'rgba(167, 139, 250, 0.3)',
        textColor: '#7c3aed'
      };
    }
    if (lower.includes('herstory') || lower.includes('women') || lower.includes('social')) {
      return {
        dotColor: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.12)',
        borderColor: 'rgba(244, 114, 182, 0.3)',
        textColor: '#db2777'
      };
    }
    return {
      dotColor: '#ea580c',
      bgColor: 'rgba(234, 88, 12, 0.12)',
      borderColor: 'rgba(251, 146, 60, 0.3)',
      textColor: '#ea580c'
    };
  };

  // Robust helper to extract or fallback article cover image
  const getArticleCoverImage = (art) => {
    if (!art) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80';
    
    // 1. Direct featuredImage object or string
    const fUrl = art.featuredImage?.url || (typeof art.featuredImage === 'string' ? art.featuredImage : '');
    if (fUrl && typeof fUrl === 'string' && fUrl.trim()) return fUrl.trim();

    if (art.image && typeof art.image === 'string' && art.image.trim()) return art.image.trim();
    if (art.heroImage && typeof art.heroImage === 'string' && art.heroImage.trim()) return art.heroImage.trim();
    if (art.coverImage && typeof art.coverImage === 'string' && art.coverImage.trim()) return art.coverImage.trim();
    if (art.thumbnail && typeof art.thumbnail === 'string' && art.thumbnail.trim()) return art.thumbnail.trim();
    if (art.seo?.ogImage && typeof art.seo.ogImage === 'string' && art.seo.ogImage.trim()) return art.seo.ogImage.trim();

    // 2. Content blocks image
    if (Array.isArray(art.contentBlocks) && art.contentBlocks.length > 0) {
      for (const b of art.contentBlocks) {
        if (b.type === 'image') {
          const bUrl = typeof b.image === 'string' ? b.image : (b.url || b.image?.url || '');
          if (bUrl && typeof bUrl === 'string' && bUrl.trim()) return bUrl.trim();
        }
        if (b.images && Array.isArray(b.images) && b.images.length > 0) {
          const imgUrl = b.images[0]?.url || (typeof b.images[0] === 'string' ? b.images[0] : '');
          if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim()) return imgUrl.trim();
        }
      }
    }

    // 3. Image embedded in HTML content
    if (art.content && typeof art.content === 'string') {
      const match = art.content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) return match[1];
    }

    // 4. Category / Topic tailored fallback
    const cat = (art.categoryName || art.categoryTag || art.category || '').toLowerCase();
    const title = (art.title || '').toLowerCase();
    if (cat.includes('tech') || cat.includes('cyber') || cat.includes('defense') || title.includes('cyber') || title.includes('tech')) {
      return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80';
    }
    if (cat.includes('ai') || title.includes('ai') || title.includes('intelligence')) {
      return 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80';
    }
    if (cat.includes('fintech') || cat.includes('crypto') || cat.includes('finance')) {
      return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80';
    }
    if (cat.includes('startup') || cat.includes('fund') || cat.includes('business')) {
      return 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80';
    }
    if (cat.includes('social') || cat.includes('climate') || cat.includes('energy')) {
      return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80';
    }

    return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80';
  };

  // Helper for extracting clean topic / tag list from article
  const getArticleTopics = (art) => {
    const list = [];
    if (Array.isArray(art.topics)) {
      art.topics.forEach(t => {
        const name = typeof t === 'string' ? t.trim() : (t?.name || '');
        if (name && !list.includes(name)) list.push(name);
      });
    } else if (typeof art.topics === 'string' && art.topics.trim()) {
      art.topics.split(',').forEach(t => {
        const clean = t.trim();
        if (clean && !list.includes(clean)) list.push(clean);
      });
    }

    if (Array.isArray(art.tags)) {
      art.tags.forEach(t => {
        const name = typeof t === 'string' ? t.trim() : (t?.name || '');
        if (name && !list.includes(name)) list.push(name);
      });
    } else if (typeof art.tags === 'string' && art.tags.trim()) {
      art.tags.split(',').forEach(t => {
        const clean = t.trim();
        if (clean && !list.includes(clean)) list.push(clean);
      });
    }

    if (list.length === 0 && (art.categoryName || art.categoryTag || art.category)) {
      list.push(art.categoryName || art.categoryTag || art.category);
    }
    return list;
  };


  // Helper for extracting clean excerpt or snippet from article
  const getArticleExcerpt = (art) => {
    if (!art) return '';
    if (art.excerpt && art.excerpt.trim()) return art.excerpt.trim();
    if (art.subtitle && art.subtitle.trim()) return art.subtitle.trim();
    if (art.summary && art.summary.trim()) return art.summary.trim();

    const titleNorm = (art.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (Array.isArray(art.contentBlocks) && art.contentBlocks.length > 0) {
      for (const b of art.contentBlocks) {
        const raw = b.content || b.text || '';
        if (raw) {
          const clean = raw
            .replace(/<figcaption[^>]*>.*?<\/figcaption>/gi, ' ')
            .replace(/<figure[^>]*>.*?<\/figure>/gi, ' ')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
          
          const cleanNorm = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (clean && clean.length > 20 && !cleanNorm.startsWith(titleNorm) && !titleNorm.startsWith(cleanNorm)) {
            return clean.slice(0, 240);
          }
        }
      }

      for (const b of art.contentBlocks) {
        const raw = b.content || b.text || '';
        if (raw) {
          const clean = raw
            .replace(/<figcaption[^>]*>.*?<\/figcaption>/gi, ' ')
            .replace(/<figure[^>]*>.*?<\/figure>/gi, ' ')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
          if (clean && clean.length > 15) return clean.slice(0, 240);
        }
      }
    }

    if (art.content && typeof art.content === 'string') {
      const clean = art.content
        .replace(/<figcaption[^>]*>.*?<\/figcaption>/gi, ' ')
        .replace(/<figure[^>]*>.*?<\/figure>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      if (clean) return clean.slice(0, 240);
    }

    return '';
  };

  // Concise SEO slug generator (removes common filler words)
  const getShortSlug = (text) => {
    if (!text) return '';
    const stopwords = new Set(['a', 'an', 'the', 'is', 'in', 'at', 'of', 'on', 'for', 'to', 'and', 'how', 'with', 'by', 'are', 'was', 'were', 'it', 'its', 'from']);
    const words = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter(w => !stopwords.has(w) && w.length > 0);
    return slugify(words.join(' '));
  };

  // Generate multiple intelligent auto-suggestions for URL slug
  const generateSlugSuggestions = (title, category = '') => {
    if (!title || !title.trim()) return [];
    const baseSlug = slugify(title);
    if (!baseSlug) return [];
    const shortSlug = getShortSlug(title);
    const currentYear = new Date().getFullYear();
    const suggestions = [];

    // 1. Standard Headline Slug
    suggestions.push({
      id: 'full',
      label: 'Standard Slug',
      badge: 'Exact Title',
      slug: baseSlug,
      desc: 'Clean direct transliteration of headline'
    });

    // 2. SEO Concise Slug (stop words removed)
    if (shortSlug && shortSlug !== baseSlug) {
      suggestions.push({
        id: 'seo',
        label: 'SEO Concise',
        badge: 'Rank Recommended',
        slug: shortSlug,
        desc: 'Removes stop words (how, is, in, the) for higher search rank'
      });
    }

    // 3. Category Prefixed Slug
    if (category) {
      const catSlug = slugify(category);
      if (catSlug && !baseSlug.startsWith(catSlug)) {
        suggestions.push({
          id: 'category',
          label: `${category} Tagged`,
          badge: 'Taxonomy',
          slug: `${catSlug}-${shortSlug || baseSlug}`,
          desc: `Prepends "${category.toLowerCase()}" context in URL path`
        });
      }
    }

    // 4. Year-Stamped Slug
    suggestions.push({
      id: 'year',
      label: `Dated Edition (+${currentYear})`,
      badge: 'Year Stamped',
      slug: `${shortSlug || baseSlug}-${currentYear}`,
      desc: 'Great for annual reports, listicles & yearly reviews'
    });

    // 5. Punchy Ultra-Short Slug
    const words = baseSlug.split('-').filter(Boolean);
    if (words.length > 4) {
      const punchy = words.slice(0, 3).join('-');
      if (punchy !== shortSlug && punchy !== baseSlug) {
        suggestions.push({
          id: 'punchy',
          label: 'Ultra-Short Slug',
          badge: 'Social Friendly',
          slug: punchy,
          desc: 'Brief character length ideal for social media sharing'
        });
      }
    }

    return suggestions;
  };

  // Keyboard shortcut listener (Ctrl/Cmd + S) to save
  useEffect(() => {
    const handleEditorKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (isEditorOpen) {
          e.preventDefault();
          handleSaveArticle();
        }
      }
    };
    window.addEventListener('keydown', handleEditorKeyDown);
    return () => window.removeEventListener('keydown', handleEditorKeyDown);
  }, [isEditorOpen, formData, saving]);

  // Synchronize route with editor view and status tabs
  useEffect(() => {
    if (
      currentPath === '/admin/articles/new' || 
      currentPath === '/admin/articles/create' || 
      currentPath === '/admin/posts/create' || 
      currentPath === '/admin/blogs/create' ||
      currentPath?.endsWith('/new')
    ) {
      if (!isEditorOpen) handleOpenCreate();
    } else if (currentPath && (currentPath.includes('/posts/') || currentPath.includes('/blogs/') || currentPath.includes('/articles/')) && currentPath.includes('/edit')) {
      const parts = currentPath.split('/');
      const editIndex = parts.indexOf('edit');
      const targetId = editIndex > 0 ? parts[editIndex - 1] : null;
      if (targetId && (!editingArticle || (editingArticle._id !== targetId && editingArticle.id !== targetId))) {
        const found = articles.find(a => (a._id === targetId || a.id === targetId || a.slug === targetId));
        if (found) {
          handleOpenEdit(found);
        } else {
          ArticleService.getAdminArticleById(targetId)
            .then(art => art && handleOpenEdit(art))
            .catch(() => {});
        }
      }
    } else if (currentPath === '/admin/drafts' || currentPath?.includes('/draft')) {
      setActiveTab('draft');
    } else if (currentPath === '/admin/archived' || currentPath?.includes('/archived')) {
      setActiveTab('archived');
    }
  }, [currentPath]);

  const handleTitleChange = (val) => {
    setFormData(prev => {
      // Auto-update slug if auto-sync is on, or if slug was untouched/empty
      const shouldAutoSync = isAutoSlug || !prev.slug || !slugManuallyEdited;
      const newSlug = shouldAutoSync ? slugify(val) : prev.slug;
      return {
        ...prev,
        title: val,
        slug: newSlug,
        seo: {
          ...prev.seo,
          title: (!prev.seo.title || prev.seo.title === prev.title) ? val : prev.seo.title,
          ogTitle: (!prev.seo.ogTitle || prev.seo.ogTitle === prev.title) ? val : prev.seo.ogTitle
        }
      };
    });
  };

  const handleApplySuggestedSlug = (chosenSlug, isStandard = false) => {
    setFormData(prev => ({ ...prev, slug: chosenSlug }));
    setIsAutoSlug(isStandard);
    setSlugManuallyEdited(!isStandard);
    if (onShowToast) onShowToast(`Applied slug: "${chosenSlug}"`);
  };

  const handleAutoSuggestSlug = (customText) => {
    const base = customText !== undefined ? customText : formData.title;
    const generated = slugify(base || 'story');
    setFormData(prev => ({ ...prev, slug: generated }));
    setIsAutoSlug(true);
    setSlugManuallyEdited(false);
    setShowSlugSuggestions(true);
    if (onShowToast) onShowToast('Slug auto-suggested and synced with headline!');
  };

  const handleCopySlugUrl = () => {
    const slugVal = formData.slug || slugify(formData.title || 'story');
    const fullUrl = `https://goreadpost.com/article/${slugVal}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
      if (onShowToast) onShowToast('Full article URL copied to clipboard!');
    }
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setSlugManuallyEdited(false);
    setIsAutoSlug(true);
    setEditorTab('content');

    const firstActiveCat = (categories || []).find(c => c.isActive !== false) || (categories || [])[0] || null;
    const firstActiveTop = (topics || []).find(t => t.isActive !== false);

    setFormData({
      title: '',
      slug: '',
      subtitle: '',
      excerpt: '',
      content: '',
      featuredImage: {
        url: '',
        alt: '',
        caption: '',
        credit: ''
      },
      authorId: authors[0]?._id || '',
      authorName: authors[0]?.name || 'Editorial Desk',
      authorTitle: authors[0]?.designation || 'Senior Technology Reporter',
      authorAvatar: authors[0]?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      categoryId: firstActiveCat?._id || '',
      categoryName: firstActiveCat?.name || 'Startups',
      subCategoryId: '',
      brand: 'GoReadPost',
      topics: firstActiveTop ? [firstActiveTop.name] : [],
      topicIds: firstActiveTop ? [firstActiveTop._id] : [],
      tags: '',
      tagIds: [],
      contentType: 'Article',
      readingTime: '4 min read',
      language: 'en',
      location: 'India',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      isEditorPick: false,
      status: 'published',
      scheduledAt: '',
      publishedAt: new Date().toISOString(),
      seo: {
        title: '',
        description: '',
        keywords: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: ''
      }
    });
    setIsEditorOpen(true);
    if (onNavigate) {
      onNavigate('/admin/articles/new');
    } else {
      try { window.history.pushState(null, '', '/admin/articles/new'); } catch (e) {}
    }
  };

  const handleOpenEdit = (article) => {
    setEditingArticle(article);
    setSlugManuallyEdited(true);
    setIsAutoSlug(false);
    setEditorTab('content');

    let featuredUrl = '';
    if (typeof article.featuredImage === 'string') {
      featuredUrl = article.featuredImage;
    } else if (article.featuredImage && typeof article.featuredImage === 'object') {
      let u = article.featuredImage.url;
      while (u && typeof u === 'object') {
        u = u.url || '';
      }
      featuredUrl = typeof u === 'string' ? u : '';
    } else if (typeof article.image === 'string') {
      featuredUrl = article.image;
    }

    const matchedCat = (categories || []).find(c => c._id === article.categoryId || c.name === article.categoryName || c.slug === article.categoryName);

    setFormData({
      title: article.title || '',
      slug: article.slug || slugify(article.title || ''),
      subtitle: article.subtitle || '',
      excerpt: article.excerpt || article.summary || '',
      content: article.content || '',
      featuredImage: {
        url: featuredUrl,
        alt: (article.featuredImage && typeof article.featuredImage === 'object' ? article.featuredImage.alt : '') || article.title || '',
        caption: (article.featuredImage && typeof article.featuredImage === 'object' ? article.featuredImage.caption : '') || '',
        credit: (article.featuredImage && typeof article.featuredImage === 'object' ? article.featuredImage.credit : '') || article.photoCredit || ''
      },
      authorId: article.authorId || '',
      authorName: article.authorName || article.author?.name || 'Editorial Desk',
      authorTitle: article.authorTitle || article.author?.role || 'Staff Reporter',
      authorAvatar: article.authorAvatar || article.author?.avatar || '',
      categoryId: article.categoryId || matchedCat?._id || '',
      categoryName: article.categoryName || matchedCat?.name || article.categoryTag || 'Startups',
      subCategoryId: article.subCategoryId || '',
      brand: article.brand || 'GoReadPost',
      topics: Array.isArray(article.topics) && article.topics.length > 0
        ? article.topics
        : (Array.isArray(article.topicIds) ? article.topicIds.map(t => (typeof t === 'object' && t ? t.name : t)).filter(Boolean) : (article.topic ? [article.topic] : [])),
      topicIds: Array.isArray(article.topicIds)
        ? article.topicIds.map(t => (typeof t === 'object' && t ? t._id : t)).filter(Boolean)
        : [],
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
      tagIds: Array.isArray(article.tagIds)
        ? article.tagIds.map(t => (typeof t === 'object' && t ? t._id : t)).filter(Boolean)
        : [],
      contentType: article.contentType || 'Article',
      readingTime: article.readingTime || article.readTime || '4 min read',
      language: article.language || 'en',
      location: article.location || 'India',
      isFeatured: Boolean(article.isFeatured || article.tag === 'FEATURED'),
      isBreaking: Boolean(article.isBreaking || article.tag === 'BREAKING'),
      isTrending: Boolean(article.isTrending || article.tag === 'TRENDING'),
      isEditorPick: Boolean(article.isEditorPick),
      status: article.status || 'published',
      scheduledAt: article.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : '',
      publishedAt: article.publishedAt || '',
      seo: {
        title: article.seo?.title || article.title || '',
        description: article.seo?.description || article.excerpt || '',
        keywords: article.seo?.keywords || '',
        canonicalUrl: article.seo?.canonicalUrl || '',
        ogTitle: article.seo?.ogTitle || article.title || '',
        ogDescription: article.seo?.ogDescription || article.excerpt || '',
        ogImage: article.seo?.ogImage || featuredUrl || ''
      }
    });
    const articleId = article._id || article.id;
    setIsEditorOpen(true);
    if (onNavigate) {
      onNavigate(`/admin/articles/${articleId}/edit`);
    } else {
      try { window.history.pushState(null, '', `/admin/articles/${articleId}/edit`); } catch (e) {}
    }
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingArticle(null);
    if (onNavigate) {
      onNavigate('/admin/articles');
    } else {
      try { window.history.pushState(null, '', '/admin/articles'); } catch (e) {}
    }
  };

  const handleSaveArticle = async (forcedStatus = null) => {
    if (!formData.title.trim()) {
      alert('Please provide an article headline/title.');
      return;
    }

    if (!formData.categoryName && !formData.categoryId) {
      alert('Please select a Primary Category for this article.');
      return;
    }

    setSaving(true);
    try {
      const finalSlug = (formData.slug.trim() || slugify(formData.title)).replace(/^\/+|\/+$/g, '');
      const finalStatus = forcedStatus || formData.status;

      let safeFeaturedUrl = '';
      if (typeof formData.featuredImage === 'string') {
        safeFeaturedUrl = formData.featuredImage;
      } else if (formData.featuredImage && typeof formData.featuredImage === 'object') {
        let curr = formData.featuredImage.url;
        while (curr && typeof curr === 'object') {
          curr = curr.url || '';
        }
        safeFeaturedUrl = typeof curr === 'string' ? curr : '';
      }

      const activeTagList = typeof formData.tags === 'string'
        ? formData.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
        : (Array.isArray(formData.tags) ? formData.tags.map(t => t.replace(/^#/, '')) : []);

      const activeTopicList = Array.isArray(formData.topics)
        ? formData.topics.map(t => t.trim()).filter(Boolean)
        : [];

      // Resolve topicIds against DB topics
      const resolvedTopicIds = activeTopicList.map(name => {
        const match = (topics || []).find(t => (t.name || '').toLowerCase() === name.toLowerCase());
        return match ? match._id : null;
      }).filter(Boolean);

      // Resolve tagIds against DB tags
      const resolvedTagIds = activeTagList.map(name => {
        const match = (tags || []).find(t => (t.name || '').toLowerCase() === name.toLowerCase());
        return match ? match._id : null;
      }).filter(Boolean);

      const payload = {
        ...formData,
        slug: finalSlug,
        status: finalStatus,
        featuredImage: {
          url: safeFeaturedUrl,
          alt: (formData.featuredImage && typeof formData.featuredImage === 'object' ? formData.featuredImage.alt : '') || formData.title || '',
          caption: (formData.featuredImage && typeof formData.featuredImage === 'object' ? formData.featuredImage.caption : '') || '',
          credit: (formData.featuredImage && typeof formData.featuredImage === 'object' ? formData.featuredImage.credit : '') || ''
        },
        authorId: formData.authorId || null,
        categoryId: formData.categoryId || null,
        categoryName: formData.categoryName || 'General',
        subCategoryId: formData.subCategoryId || null,
        topicIds: resolvedTopicIds,
        topics: activeTopicList,
        tagIds: resolvedTagIds,
        tags: activeTagList,
        publishedAt: finalStatus === 'published' ? (formData.publishedAt || new Date().toISOString()) : null,
        scheduledAt: finalStatus === 'scheduled' ? formData.scheduledAt : null,
        readingTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
        seo: {
          title: formData.seo?.title?.trim() || formData.title,
          description: formData.seo?.description?.trim() || formData.excerpt || formData.subtitle,
          keywords: formData.seo?.keywords?.trim() || activeTagList.join(', '),
          canonicalUrl: formData.seo?.canonicalUrl?.trim() || `${window.location.origin}/article/${finalSlug}`,
          ogTitle: formData.seo?.ogTitle?.trim() || formData.seo?.title?.trim() || formData.title,
          ogDescription: formData.seo?.ogDescription?.trim() || formData.seo?.description?.trim() || formData.excerpt,
          ogImage: formData.seo?.ogImage || safeFeaturedUrl || ''
        }
      };

      if (editingArticle) {
        const id = editingArticle._id || editingArticle.id;
        await ArticleService.updateArticle(id, payload);
        if (onShowToast) onShowToast(`Updated story "${payload.title}" successfully!`);
      } else {
        await ArticleService.createArticle(payload);
        if (onShowToast) onShowToast(`Published new article "${payload.title}" to GoReadPost!`);
      }

      handleCloseEditor();
      await loadArticles();
    } catch (err) {
      alert('Error saving article: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (article) => {
    const id = article._id || article.id;
    let nextStatus = 'published';
    if (article.status === 'published') nextStatus = 'draft';
    else if (article.status === 'draft') nextStatus = 'published';
    else if (article.status === 'archived') nextStatus = 'draft';

    try {
      if (nextStatus === 'published') {
        await ArticleService.publishArticle(id);
      } else {
        await ArticleService.unpublishArticle(id);
      }
      if (onShowToast) onShowToast(`Article set to ${nextStatus.toUpperCase()}`);
      await loadArticles();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleToggleFrontend = async (article) => {
    const id = article._id || article.id;
    try {
      const updated = await ArticleService.toggleFrontendVisibility(id);
      const nextDisabled = updated ? updated.disabledFromFrontend : !article.disabledFromFrontend;
      if (onShowToast) {
        onShowToast(`Frontend display ${nextDisabled ? 'DISABLED' : 'ENABLED'}`);
      }
      setViewingArticleDetails(prev => prev ? ({ ...prev, disabledFromFrontend: nextDisabled }) : null);
      await loadArticles();
    } catch (err) {
      alert('Error toggling frontend visibility: ' + err.message);
    }
  };

  const handleArchiveArticle = async (article) => {
    const id = article._id || article.id;
    if (!window.confirm(`Archive "${article.title}"? This will hide it from the live site and move it to the Archived tab.`)) return;
    try {
      await ArticleService.archiveArticle(id);
      if (onShowToast) onShowToast(`Archived "${article.title}"`);
      await loadArticles();
    } catch (err) {
      alert('Error archiving article: ' + err.message);
    }
  };

  const handleRestoreArticle = async (article) => {
    const id = article._id || article.id;
    try {
      await ArticleService.unpublishArticle(id); // Restores as draft
      if (onShowToast) onShowToast(`Restored "${article.title}" to Drafts`);
      await loadArticles();
    } catch (err) {
      alert('Error restoring article: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    const id = articleToDelete._id || articleToDelete.id;
    setDeleting(true);
    try {
      await ArticleService.deleteArticle(id);
      if (onShowToast) onShowToast(`Deleted article "${articleToDelete.title}"`);
      setArticleToDelete(null);
      await loadArticles();
    } catch (err) {
      alert('Error deleting article: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected articles? This action will permanently remove them from the database.`)) {
      return;
    }
    setDeleting(true);
    try {
      const idsArray = Array.from(selectedIds);
      await ArticleService.bulkDeleteArticles(idsArray);
      if (onShowToast) onShowToast(`Successfully deleted ${count} articles.`);
      setSelectedIds(new Set());
      await loadArticles();
    } catch (err) {
      alert('Error deleting articles: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.size === 0) return;
    try {
      const idsArray = Array.from(selectedIds);
      await ArticleService.bulkUpdateStatus(idsArray, newStatus);
      if (onShowToast) onShowToast(`Updated status to "${newStatus}" for ${idsArray.length} articles.`);
      setSelectedIds(new Set());
      await loadArticles();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Rich Text Editor Toolbar Actions (Inserts HTML/Markdown tokens into content textarea)
  const insertTextAtCursor = (before, after = '') => {
    const el = contentTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = formData.content;
    const selected = current.substring(start, end);
    const replacement = before + (selected || 'sample text') + after;
    const newContent = current.substring(0, start) + replacement + current.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + replacement.length - after.length);
    }, 50);
  };

  const handleOpenMediaPicker = (target = 'featured') => {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
    loadMediaLibrary();
  };

  const handleSelectMediaFile = (file) => {
    if (mediaPickerTarget === 'featured') {
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          ...prev.featuredImage,
          url: file.url,
          alt: file.altText || prev.featuredImage.alt || prev.title,
          caption: file.caption || prev.featuredImage.caption,
          credit: file.credit || prev.featuredImage.credit || 'GoReadPost Media Bureau'
        }
      }));
    } else {
      // Inline image into article content
      if (editorMode === 'tiptap' && tiptapEditorRef.current) {
        tiptapEditorRef.current.chain().focus().setImage({ 
          src: file.url, 
          alt: file.altText || file.originalName || 'Editorial illustration' 
        }).run();
      } else {
        const imageSnippet = `\n<figure class="editorial-inline-img">\n  <img src="${file.url}" alt="${file.altText || 'Editorial illustration'}" />\n  <figcaption>${file.caption || ''} (Photo: ${file.credit || 'GoReadPost Bureau'})</figcaption>\n</figure>\n`;
        insertTextAtCursor(imageSnippet, '');
      }
    }
    setIsMediaPickerOpen(false);
  };

  const handleQuickAddAuthor = async () => {
    if (!quickAuthorName.trim()) return;
    try {
      const created = await TaxonomyService.createAuthor({
        name: quickAuthorName.trim(),
        designation: quickAuthorTitle.trim() || 'Contributing Writer',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        bio: 'Editorial writer covering technology, founders, and venture ecosystems.'
      });
      if (created) {
        setAuthors(prev => [created, ...prev]);
        setFormData(prev => ({
          ...prev,
          authorId: created._id,
          authorName: created.name,
          authorTitle: created.designation,
          authorAvatar: created.profileImage
        }));
        setQuickAuthorName('');
        setQuickAuthorTitle('');
        setShowQuickAuthor(false);
        if (onShowToast) onShowToast(`Added new author "${created.name}"`);
      }
    } catch (err) {
      alert('Error creating author: ' + err.message);
    }
  };

  const handleQuickAddCategory = async () => {
    if (!quickCategoryName.trim()) return;
    try {
      const created = await TaxonomyService.createCategory({
        name: quickCategoryName.trim(),
        slug: slugify(quickCategoryName.trim()),
        description: 'Editorial category desk'
      });
      if (created) {
        setCategories(prev => [created, ...prev]);
        setFormData(prev => ({
          ...prev,
          categoryId: created._id,
          categoryName: created.name
        }));
        setQuickCategoryName('');
        if (onShowToast) onShowToast(`Added category "${created.name}"`);
      }
    } catch (err) {
      alert('Error creating category: ' + err.message);
    }
  };

  // Filtered Articles based on Tab, Search, Desk, Category, Author
  const filteredArticles = articles.filter(a => {
    // 1. Tab filter
    if (activeTab === 'published' && a.status !== 'published') return false;
    if (activeTab === 'draft' && a.status !== 'draft') return false;
    if (activeTab === 'scheduled' && a.status !== 'scheduled') return false;
    if (activeTab === 'archived' && a.status !== 'archived') return false;

    // 2. Search
    const q = search.trim().toLowerCase();
    if (q) {
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchSlug = (a.slug || '').toLowerCase().includes(q);
      const matchAuthor = (a.authorName || a.author?.name || '').toLowerCase().includes(q);
      const matchExcerpt = (a.excerpt || a.summary || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchAuthor && !matchExcerpt) return false;
    }

    // 3. Category
    if (selectedCategory !== 'all') {
      const cat = (a.categoryName || a.categoryTag || a.category || '').toLowerCase();
      if (!cat.includes(selectedCategory.toLowerCase())) return false;
    }

    // 4. Desk
    if (selectedDesk !== 'all') {
      const b = (a.brand || '').toLowerCase();
      const c = (a.category || '').toLowerCase();
      const target = selectedDesk.toLowerCase();
      if (!b.includes(target) && !c.includes(target)) return false;
    }

    return true;
  }).sort((a, b) => {
    if (activeTab === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    return 0;
  });

  // KPI Stats
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const scheduledCount = articles.filter(a => a.status === 'scheduled').length;
  const archivedCount = articles.filter(a => a.status === 'archived').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // Bulk selection status breakdown
  const selectedArticles = useMemo(() => {
    if (selectedIds.size === 0) return [];
    return articles.filter(a => selectedIds.has(a._id || a.id));
  }, [articles, selectedIds]);

  const hasPublishedSelected = useMemo(() => {
    return selectedArticles.some(a => (a.status || 'published') === 'published');
  }, [selectedArticles]);

  const hasDraftOrScheduledSelected = useMemo(() => {
    return selectedArticles.some(a => (a.status || 'published') !== 'published');
  }, [selectedArticles]);

  // Conditional button flags:
  // - If selected article is not published -> show Publish button & Delete button
  // - If selected article is published -> show Send Draft button & Delete button
  // - If both published & unpublished are selected -> show ONLY Delete button
  const showBulkPublish = selectedIds.size > 0 && hasDraftOrScheduledSelected && !hasPublishedSelected;
  const showBulkDraft = selectedIds.size > 0 && hasPublishedSelected && !hasDraftOrScheduledSelected;
  const showBulkDelete = selectedIds.size > 0;

  // Word count and read time calculations
  const wordCount = formData.content ? formData.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Extracted Media Picker Modal
  const renderMediaPickerModal = () => {
    if (!isMediaPickerOpen) return null;
    return (
      <div className="modal-overlay" onClick={() => setIsMediaPickerOpen(false)}>
        <div 
          className="anv-modal-dialog" 
          style={{ maxWidth: '850px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="anv-modal-header">
            <div className="anv-modal-title-box">
              <ImageIcon size={20} color="#ea580c" />
              <div>
                <h3>Select Asset from Media Library</h3>
              </div>
            </div>
            <button className="anv-modal-close" onClick={() => setIsMediaPickerOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
            {mediaLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <RefreshCw size={24} className="rotate-icon" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : mediaFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No media assets uploaded yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {mediaFiles.map((f, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelectMediaFile(f)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid transparent',
                      background: 'var(--bg-tertiary)',
                      position: 'relative'
                    }}
                    className="media-picker-item"
                  >
                    <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
                      <img 
                        src={f.url} 
                        alt={f.altText || ''} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div style={{ padding: '0.4rem', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.originalName || f.filename}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="anv-modal-footer">
            <button className="anv-modal-btn cancel" onClick={() => setIsMediaPickerOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // Dedicated Full-Page Article Studio View
  // Dedicated Full-Page Article Studio View
  const renderEditorPage = () => {
    const displaySlug = formData.slug || (formData.title ? slugify(formData.title) : 'story-headline');

    return (
      <div className="aem-editor-page">
        {/* Top Header Bar */}
        <header className="aem-page-header">
          <div className="aem-page-header-left">
            <button 
              type="button" 
              className="aem-back-btn" 
              onClick={handleCloseEditor}
              title="Return to articles list"
            >
              <ArrowLeft size={16} />
              <span>Articles</span>
            </button>
            <div className="aem-header-divider" />
            <div className="aem-page-title-box">
              <div className="aem-page-meta-row">
                <span className="aem-header-chip">{formData.brand || 'GoReadPost'}</span>
                <span className={`aem-status-pill ${formData.status}`}>
                  <span className="aem-status-dot" />
                  {formData.status === 'published' ? 'Live' : formData.status === 'draft' ? 'Draft' : formData.status}
                </span>
                <span className="aem-meta-stat">
                  <FileText size={13} /> {wordCount} words
                </span>
                <span className="aem-meta-stat">
                  <Clock size={13} /> ~{readTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>

          <div className="aem-page-header-actions">
            {formData.slug && (
              <a 
                href={`/article/${formData.slug}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="aem-btn-preview"
                title="Preview public article"
              >
                <ExternalLink size={14} />
                <span>Preview</span>
              </a>
            )}
            <button 
              type="button" 
              className="aem-btn-draft" 
              onClick={() => handleSaveArticle('draft')}
              disabled={saving}
              title="Save as Draft (Ctrl+S)"
            >
              <Save size={14} />
              <span>Save Draft</span>
              <kbd className="aem-kbd-hint">Ctrl+S</kbd>
            </button>
            <button 
              type="button" 
              className="aem-btn-publish" 
              onClick={() => handleSaveArticle('published')}
              disabled={saving}
            >
              <Send size={15} />
              <span>{saving ? 'Publishing...' : editingArticle ? 'Update Article' : 'Publish Article'}</span>
            </button>
          </div>
        </header>

        {/* Top Horizontal Tabs Bar */}
        <div className="aem-top-tabs-bar">
          <div className="aem-top-tabs-nav">
            {[
              { 
                id: 'content', 
                label: 'Story & Canvas', 
                icon: FileText,
                pill: `${wordCount} words`
              },
              { 
                id: 'media', 
                label: 'Media & Cover', 
                icon: ImageIcon,
                pill: formData.featuredImage?.url ? 'Cover Set' : 'No Cover'
              },
              { 
                id: 'taxonomy', 
                label: 'Taxonomy & Byline', 
                icon: Layers,
                pill: formData.categoryName || 'General'
              },
              { 
                id: 'publishing', 
                label: 'Publishing & Placement', 
                icon: Calendar,
                pill: formData.status
              },
              { 
                id: 'seo', 
                label: 'SEO & Social Share', 
                icon: Globe,
                pill: formData.seo?.title ? 'Configured' : 'Auto'
              }
            ].map(t => {
              const Icon = t.icon;
              const isActive = editorTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`aem-top-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setEditorTab(t.id)}
                >
                  <Icon size={16} className="aem-top-tab-icon" />
                  <span className="aem-top-tab-title">{t.label}</span>
                  {t.pill && <span className="aem-top-tab-pill">{t.pill}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Canvas Layout (Clean & Spacious - Redundant Ribbon Removed) */}
        <div className="aem-page-layout">
          <main className="aem-right-canvas">
            <div className="aem-right-canvas-inner">
              {/* TAB 1: STORY CONTENT & RICH TEXT */}
              {editorTab === 'content' && (
                <div className="aem-doc-card">
                  {/* Quick Featured Cover Banner Slot directly on canvas */}
                  {formData.featuredImage?.url ? (
                    <div className="aem-canvas-cover-banner">
                      <img 
                        src={formData.featuredImage.url} 
                        alt={formData.featuredImage.alt || 'Article Cover'} 
                        className="aem-canvas-cover-img"
                      />
                      <div className="aem-canvas-cover-controls">
                        <button 
                          type="button" 
                          className="aem-canvas-cover-btn"
                          onClick={() => handleOpenMediaPicker('featured')}
                          title="Change Cover Image"
                        >
                          <ImageIcon size={13} /> Change Cover
                        </button>
                        <button 
                          type="button" 
                          className="aem-canvas-cover-btn"
                          onClick={() => setEditorTab('media')}
                          title="Edit Details & Attribution"
                        >
                          <Edit2 size={13} /> Edit Details
                        </button>
                        <button 
                          type="button" 
                          className="aem-canvas-cover-btn danger"
                          onClick={() => setFormData(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, url: '' } }))}
                          title="Remove Cover Image"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="aem-canvas-cover-prompt">
                      <button 
                        type="button"
                        className="aem-add-cover-btn"
                        onClick={() => handleOpenMediaPicker('featured')}
                      >
                        <ImageIcon size={16} />
                        <span>Add Featured Cover Image</span>
                      </button>
                      <span className="aem-add-cover-hint">Optional · 16:9 landscape banner for hero spotlight</span>
                    </div>
                  )}

                  {/* Modern Editorial Headline */}
                  <div className="aem-headline-wrapper">
                    <input 
                      type="text" 
                      className="aem-editorial-headline"
                      placeholder="Title of your story..."
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      autoFocus={!formData.title}
                    />
                  </div>

                  {/* Subtitle / Deck */}
                  <div className="aem-subtitle-wrapper">
                    <input 
                      type="text" 
                      className="aem-editorial-subtitle"
                      placeholder="Add an engaging standfirst or subtitle beneath the headline..."
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    />
                  </div>

                  {/* Sleek Inline Permalink Widget */}
                  <div className="aem-inline-permalink-bar">
                    <div className="aem-permalink-link-group">
                      <Link2 size={13} className="aem-permalink-icon" />
                      <span className="aem-permalink-domain">https://goreadpost.com/article/</span>
                      <span className="aem-permalink-slug" title={`Full URL: https://goreadpost.com/article/${displaySlug}`}>
                        {displaySlug}
                      </span>
                    </div>
                    
                    <div className="aem-permalink-actions">
                      <button 
                        type="button" 
                        className={`aem-permalink-btn ${isSlugExpanded ? 'active' : ''}`}
                        onClick={() => setIsSlugExpanded(!isSlugExpanded)}
                        title="Customize slug and view auto-suggestions"
                      >
                        <Edit2 size={12} />
                        <span>{isSlugExpanded ? 'Close Settings' : 'Customize Slug'}</span>
                      </button>

                      <button 
                        type="button" 
                        className="aem-permalink-btn"
                        onClick={handleCopySlugUrl}
                        title="Copy article URL"
                      >
                        {copiedSlug ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                        <span>{copiedSlug ? 'Copied' : 'Copy'}</span>
                      </button>

                      {isAutoSlug ? (
                        <span className="aem-permalink-tag auto" title="Slug syncs automatically with headline">
                          <Sparkles size={11} /> Auto-Sync Active
                        </span>
                      ) : (
                        <button 
                          type="button" 
                          className="aem-permalink-tag custom"
                          onClick={() => {
                            setIsAutoSlug(true);
                            setSlugManuallyEdited(false);
                            if (formData.title) handleAutoSuggestSlug(formData.title);
                          }}
                          title="Click to reset and sync slug with headline"
                        >
                          <RefreshCw size={11} /> Reset to Title
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Slug Editor & Auto-Suggestions Drawer */}
                  {isSlugExpanded && (
                    <div className="aem-slug-expanded-drawer">
                      <div className="aem-slug-drawer-top">
                        <div className="aem-slug-drawer-title">
                          <Sparkles size={14} color="var(--brand-primary)" />
                          <span>Custom URL Slug & Smart Presets</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button 
                            type="button"
                            className="aem-slug-mini-btn"
                            onClick={() => {
                              if (!showSlugSuggestions) setShowSlugSuggestions(true);
                              handleAutoSuggestSlug();
                            }}
                          >
                            <Sparkles size={12} /> Auto-suggest Options
                          </button>
                          <button 
                            type="button" 
                            className="aem-slug-mini-btn"
                            onClick={() => setIsSlugExpanded(false)}
                          >
                            Done
                          </button>
                        </div>
                      </div>

                      <div className="aem-slug-box">
                        <span className="aem-slug-prefix">https://goreadpost.com/article/</span>
                        <input 
                          type="text" 
                          className="aem-slug-input"
                          placeholder={formData.title ? slugify(formData.title) : 'custom-article-slug'}
                          value={formData.slug}
                          onChange={(e) => {
                            setSlugManuallyEdited(true);
                            setIsAutoSlug(false);
                            setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }));
                          }}
                        />
                      </div>

                      {/* Suggestions Grid */}
                      {formData.title && formData.title.trim().length > 1 && (
                        <div className="aem-slug-suggestions-grid">
                          {generateSlugSuggestions(formData.title, formData.categoryName).map((sugg) => {
                            const isSelected = (formData.slug || slugify(formData.title)) === sugg.slug;
                            return (
                              <div 
                                key={sugg.id} 
                                className={`aem-slug-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleApplySuggestedSlug(sugg.slug, sugg.id === 'full')}
                              >
                                <div className="aem-slug-card-top">
                                  <span className="aem-slug-card-badge">{sugg.badge}</span>
                                  {isSelected ? (
                                    <span className="aem-slug-applied">
                                      <Check size={12} /> Applied
                                    </span>
                                  ) : (
                                    <span className="aem-slug-apply-action">
                                      Apply →
                                    </span>
                                  )}
                                </div>
                                <div className="aem-slug-card-val">
                                  {sugg.slug}
                                </div>
                                <div className="aem-slug-card-desc">
                                  {sugg.desc}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clean Collapsible Card Teaser & Excerpt */}
                  <div className="aem-excerpt-collapsible">
                    <button 
                      type="button" 
                      className="aem-excerpt-toggle"
                      onClick={() => setIsExcerptExpanded(!isExcerptExpanded)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} color="#64748b" />
                        <span className="aem-excerpt-label">Story Teaser & Excerpt (Optional)</span>
                        <span className="aem-excerpt-count">
                          {(formData.excerpt || '').length}/220 chars
                        </span>
                      </div>
                      <ChevronDown 
                        size={15} 
                        style={{ 
                          transform: isExcerptExpanded ? 'rotate(180deg)' : 'none', 
                          transition: 'transform 0.2s ease',
                          color: '#64748b' 
                        }} 
                      />
                    </button>
                    {isExcerptExpanded && (
                      <div className="aem-excerpt-body">
                        <textarea 
                          rows="2"
                          className="aem-textarea aem-excerpt-textarea"
                          placeholder="Write a concise teaser summary for social cards, search snippets, and feed previews..."
                          value={formData.excerpt}
                          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                          maxLength={220}
                        />
                      </div>
                    )}
                  </div>

                  {/* Rich Text Editor Toolbar & Textarea / TipTap */}
                  <div className="aem-form-group aem-body-editor-group">
                    <div className="aem-editor-header-bar">
                      <label className="aem-label" style={{ margin: 0 }}>
                        <BookOpen size={15} color="var(--brand-primary)" />
                        <span>Story Content</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          type="button" 
                          className="aem-media-btn"
                          onClick={() => handleOpenMediaPicker('inline')}
                        >
                          <ImageIcon size={14} /> Insert Media
                        </button>
                      </div>
                    </div>
                    {editorMode === 'tiptap' ? (
                      <div className="aem-tiptap-container">
                        <TipTapEditor
                          content={formData.content}
                          onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                          onEditorReady={(editor) => { tiptapEditorRef.current = editor; }}
                          onOpenMediaPicker={() => handleOpenMediaPicker('inline')}
                        />
                      </div>
                    ) : (
                      <div className="aem-editor-container">
                        <div className="aem-editor-toolbar">
                          <div className="aem-toolbar-group">
                            <button type="button" title="Heading 1" onClick={() => insertTextAtCursor('<h1>', '</h1>')} className="aem-tool-btn"><Heading1 size={14} /></button>
                            <button type="button" title="Heading 2" onClick={() => insertTextAtCursor('<h2>', '</h2>')} className="aem-tool-btn"><Heading2 size={14} /></button>
                            <button type="button" title="Heading 3" onClick={() => insertTextAtCursor('<h3>', '</h3>')} className="aem-tool-btn"><Heading3 size={14} /></button>
                          </div>
                          <div className="aem-tool-divider" />
                          <div className="aem-toolbar-group">
                            <button type="button" title="Bold" onClick={() => insertTextAtCursor('<strong>', '</strong>')} className="aem-tool-btn"><Bold size={14} /></button>
                            <button type="button" title="Italic" onClick={() => insertTextAtCursor('<em>', '</em>')} className="aem-tool-btn"><Italic size={14} /></button>
                            <button type="button" title="Underline" onClick={() => insertTextAtCursor('<u>', '</u>')} className="aem-tool-btn"><Underline size={14} /></button>
                          </div>
                          <div className="aem-tool-divider" />
                          <div className="aem-toolbar-group">
                            <button type="button" title="Blockquote" onClick={() => insertTextAtCursor('<blockquote>', '</blockquote>')} className="aem-tool-btn"><Quote size={14} /></button>
                            <button type="button" title="Bullet List" onClick={() => insertTextAtCursor('<ul>\n  <li>', '</li>\n</ul>')} className="aem-tool-btn"><List size={14} /></button>
                            <button type="button" title="Numbered List" onClick={() => insertTextAtCursor('<ol>\n  <li>', '</li>\n</ol>')} className="aem-tool-btn"><ListOrdered size={14} /></button>
                            <button type="button" title="Code Block" onClick={() => insertTextAtCursor('<pre><code>', '</code></pre>')} className="aem-tool-btn"><Code size={14} /></button>
                            <button type="button" title="Horizontal Line" onClick={() => insertTextAtCursor('\n<hr />\n', '')} className="aem-tool-btn">―</button>
                          </div>
                          <div className="aem-tool-divider" />
                          <div className="aem-toolbar-group">
                            <button 
                              type="button" 
                              title="Insert Link" 
                              onClick={() => {
                                const url = prompt('Enter destination URL: (e.g. https://...)');
                                if (url) insertTextAtCursor(`<a href="${url}" target="_blank">`, '</a>');
                              }} 
                              className="aem-tool-btn"
                            >
                              <Link2 size={14} />
                            </button>
                            <button 
                              type="button" 
                              title="Embed Video" 
                              onClick={() => {
                                const videoUrl = prompt('Enter YouTube or video embed URL: (e.g. https://www.youtube.com/embed/...)');
                                if (videoUrl) insertTextAtCursor(`\n<div class="video-embed"><iframe src="${videoUrl}" allowfullscreen></iframe></div>\n`, '');
                              }} 
                              className="aem-tool-btn"
                            >
                              <Video size={14} />
                            </button>
                          </div>
                        </div>

                        <textarea 
                          ref={contentTextareaRef}
                          rows="14"
                          className="aem-textarea-canvas"
                          placeholder="Write your full editorial article here. You can use standard paragraphs or formatted HTML tags (<p>, <h2>, <blockquote>, <ul>, <figure>)..."
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        />

                        <div className="aem-editor-statusbar">
                          <span>Markdown & HTML supported</span>
                          <span>{formData.content ? formData.content.trim().split(/\s+/).filter(Boolean).length : 0} words · ~{Math.max(1, Math.ceil((formData.content ? formData.content.trim().split(/\s+/).filter(Boolean).length : 0) / 200))} min read</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA & COVER */}
              {editorTab === 'media' && (
                <div className="aem-deck-layout">
                  {/* FEATURED COVER IMAGE STUDIO */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <ImageIcon size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Featured Cover Image</h4>
                          <p className="aem-studio-subtitle">Display banner for article header, homepage hero spotlights, and social sharing</p>
                        </div>
                      </div>
                      <div className="aem-studio-actions">
                        {formData.featuredImage.url && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, url: '' } }))}
                            className="aem-btn-ghost-danger"
                            title="Remove image"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                        <button 
                          type="button" 
                          className="aem-media-btn-primary" 
                          onClick={() => handleOpenMediaPicker('featured')}
                        >
                          <ImageIcon size={15} /> Browse Media Library
                        </button>
                      </div>
                    </div>

                    {formData.featuredImage.url ? (
                      <div className="aem-cover-preview-card">
                        <div className="aem-cover-image-stage">
                          <img 
                            src={formData.featuredImage.url} 
                            alt={formData.featuredImage.alt || 'Article Cover'} 
                            className="aem-cover-preview-img"
                          />
                          <div className="aem-cover-floating-overlay">
                            <span className="aem-cover-ratio-pill">16:9 Editorial Canvas</span>
                            <div className="aem-cover-overlay-buttons">
                              <button 
                                type="button" 
                                className="aem-frosted-btn"
                                onClick={() => handleOpenMediaPicker('featured')}
                              >
                                <Upload size={13} /> Change Image
                              </button>
                              <button 
                                type="button" 
                                className="aem-frosted-btn"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    seo: {
                                      ...prev.seo,
                                      ogImage: prev.featuredImage.url
                                    }
                                  }));
                                  if (onShowToast) onShowToast('Synced cover to OpenGraph Social Image!');
                                }}
                              >
                                <Share2 size={13} /> Sync to OG Social
                              </button>
                              <a 
                                href={formData.featuredImage.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="aem-frosted-btn"
                              >
                                <ExternalLink size={13} /> View Full
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="aem-form-grid-2" style={{ marginTop: '1.25rem' }}>
                          <div className="aem-form-group">
                            <label className="aem-label">
                              <span>Direct Image URL *</span>
                              <span className="aem-label-hint">CDN link or media file</span>
                            </label>
                            <div className="aem-input-icon-wrap">
                              <Link2 size={15} className="aem-input-icon" />
                              <input 
                                type="text" 
                                className="aem-input aem-input-with-icon"
                                placeholder="https://images.unsplash.com/... or /uploads/..."
                                value={formData.featuredImage.url}
                                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, url: e.target.value } }))}
                              />
                            </div>
                          </div>

                          <div className="aem-form-group">
                            <label className="aem-label">
                              <span>Alt Text (SEO & Accessibility)</span>
                              <span className="aem-label-hint">Screen readers & search rank</span>
                            </label>
                            <input 
                              type="text" 
                              className="aem-input"
                              placeholder="e.g. AI startup founders pitching at summit"
                              value={formData.featuredImage.alt}
                              onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, alt: e.target.value } }))}
                            />
                          </div>

                          <div className="aem-form-group">
                            <label className="aem-label">
                              <span>Photo Credit & Attribution</span>
                              <span className="aem-label-hint">Photographer or agency</span>
                            </label>
                            <input 
                              type="text" 
                              className="aem-input"
                              placeholder="e.g. GoReadPost Media / Reuters / Unsplash"
                              value={formData.featuredImage.credit}
                              onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, credit: e.target.value } }))}
                            />
                          </div>

                          <div className="aem-form-group">
                            <label className="aem-label">
                              <span>Image Caption / Context</span>
                              <span className="aem-label-hint">Shown under hero image</span>
                            </label>
                            <input 
                              type="text" 
                              className="aem-input"
                              placeholder="e.g. Keynote address at the Global AI Summit 2026"
                              value={formData.featuredImage.caption}
                              onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, caption: e.target.value } }))}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aem-cover-dropzone-wrap">
                        <div 
                          className="aem-cover-empty-dropzone"
                          onClick={() => handleOpenMediaPicker('featured')}
                        >
                          <div className="aem-dropzone-icon-circle">
                            <ImageIcon size={28} color="var(--brand-primary)" />
                          </div>
                          <div>
                            <span className="aem-dropzone-heading">Select or upload a cover image</span>
                            <span className="aem-dropzone-desc">Recommended 16:9 ratio (1200 × 675px) in JPG, PNG, or WebP</span>
                          </div>
                          <button type="button" className="aem-media-btn-primary" style={{ pointerEvents: 'none' }}>
                            <ImageIcon size={15} /> Browse Media Library
                          </button>
                        </div>

                        <div className="aem-or-divider">
                          <span>OR PASTE DIRECT URL</span>
                        </div>

                        <div className="aem-input-icon-wrap">
                          <Link2 size={15} className="aem-input-icon" />
                          <input 
                            type="text" 
                            className="aem-input aem-input-with-icon"
                            placeholder="Paste external image URL (e.g. https://images.unsplash.com/...)"
                            value={formData.featuredImage.url}
                            onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, url: e.target.value } }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TAXONOMY & STORY DETAILS */}
              {editorTab === 'taxonomy' && (
                <div className="aem-deck-layout">
                  {/* 1. AUTHORSHIP & BYLINE STUDIO */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <User size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Authorship & Editorial Byline</h4>
                          <p className="aem-studio-subtitle">Assign reporter credit, avatar portrait, and professional title</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickAuthor(prev => !prev)}
                        className="aem-link-action"
                      >
                        <Plus size={13} />
                        <span>{showQuickAuthor ? 'Cancel' : 'Add New Author'}</span>
                      </button>
                    </div>

                    <div className="aem-form-grid-2">
                      <div className="aem-form-group">
                        <label className="aem-label">
                          <span>Select Author Profile *</span>
                        </label>
                        <div className="aem-input-icon-wrap">
                          <User size={15} className="aem-input-icon" />
                          <select 
                            className="aem-select aem-input-with-icon"
                            value={formData.authorId || formData.authorName}
                            onChange={(e) => {
                              const chosen = authors.find(a => a._id === e.target.value || a.name === e.target.value);
                              if (chosen) {
                                setFormData(prev => ({
                                  ...prev,
                                  authorId: chosen._id,
                                  authorName: chosen.name,
                                  authorTitle: chosen.designation || 'Staff Reporter',
                                  authorAvatar: chosen.profileImage || ''
                                }));
                              } else {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  authorName: e.target.value,
                                  authorId: '',
                                  authorTitle: 'Staff Reporter',
                                  authorAvatar: ''
                                }));
                              }
                            }}
                          >
                            <option value="Editorial Desk">Editorial Desk (GoReadPost Staff)</option>
                            {authors.map(a => (
                              <option key={a._id} value={a._id}>{a.name} — {a.designation || 'Reporter'}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="aem-form-group">
                        <label className="aem-label">
                          <span>Author Designation / Role</span>
                          <span className="aem-label-hint">Editorial title</span>
                        </label>
                        <input 
                          type="text" 
                          className="aem-input"
                          placeholder="e.g. Senior Tech Correspondent"
                          value={formData.authorTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, authorTitle: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Expandable Quick Add Author Drawer */}
                    {showQuickAuthor && (
                      <div className="aem-quick-author-card" style={{ marginTop: '1rem' }}>
                        <div className="aem-quick-author-fields">
                          <input 
                            type="text" 
                            className="aem-input"
                            placeholder="Author Full Name" 
                            value={quickAuthorName}
                            onChange={(e) => setQuickAuthorName(e.target.value)}
                          />
                          <input 
                            type="text" 
                            className="aem-input"
                            placeholder="Role (e.g. Senior Tech Editor)" 
                            value={quickAuthorTitle}
                            onChange={(e) => setQuickAuthorTitle(e.target.value)}
                          />
                        </div>
                        <div className="aem-quick-author-actions">
                          <button 
                            type="button" 
                            className="aem-btn-ghost"
                            onClick={() => setShowQuickAuthor(false)}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            className="aem-media-btn-primary"
                            onClick={handleQuickAddAuthor}
                          >
                            Create & Assign
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. CATEGORIES, SUB-CATEGORY & EDITORIAL DESK */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <Layers size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Categories & Editorial Desk</h4>
                          <p className="aem-studio-subtitle">Classify content hierarchy and route to brand channels</p>
                        </div>
                      </div>
                      <span className="aem-studio-badge">{categories.length} Total Sections</span>
                    </div>

                    <div className="aem-form-grid-3">
                      {/* Primary Category */}
                      <div className="aem-form-group">
                        <label className="aem-label">
                          <span>Primary Category *</span>
                          <span className="aem-label-hint">Main story section</span>
                        </label>
                        <div className="aem-input-icon-wrap">
                          <Layers size={15} className="aem-input-icon" />
                          <select 
                            className="aem-select aem-input-with-icon"
                            value={formData.categoryName}
                            onChange={(e) => {
                              const cat = categories.find(c => c.name === e.target.value);
                              setFormData(prev => ({ 
                                ...prev, 
                                categoryName: e.target.value,
                                categoryId: cat?._id || prev.categoryId
                              }));
                            }}
                          >
                            {availableCategories.map(c => (
                              <option key={c._id || c.slug} value={c.name}>
                                {c.name} {c.isActive === false ? '(Inactive)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Sub-Category */}
                      <div className="aem-form-group">
                        <label className="aem-label">
                          <span>Sub-Category / Pillar</span>
                          <span className="aem-label-hint">Optional specialization</span>
                        </label>
                        <select
                          className="aem-select"
                          value={formData.subCategoryId || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, subCategoryId: e.target.value }))}
                        >
                          <option value="">None / General {formData.categoryName}</option>
                          {categories
                            .filter(c => c.parentId && (c.parentId === formData.categoryId || c.parentId?._id === formData.categoryId))
                            .map(c => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          {categories
                            .filter(c => c.parentId && (!formData.categoryId || (c.parentId !== formData.categoryId && c.parentId?._id !== formData.categoryId)))
                            .map(c => (
                              <option key={c._id} value={c._id}>{c.name} (Other)</option>
                            ))}
                        </select>
                      </div>

                      {/* Brand Desk */}
                      <div className="aem-form-group">
                        <label className="aem-label">
                          <span>Editorial Desk / Brand</span>
                          <span className="aem-label-hint">Publication channel</span>
                        </label>
                        <select 
                          className="aem-select"
                          value={formData.brand}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        >
                          {DESKS.filter(d => d.id !== 'all').map(d => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3. LOCALE, BUREAU & READING TIME */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <Globe size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Locale, Bureau & Read Time</h4>
                          <p className="aem-studio-subtitle">Regional reporting attribution and reading estimation</p>
                        </div>
                      </div>
                    </div>

                    <div className="aem-form-grid-3">
                      <div className="aem-form-group">
                        <label className="aem-label">
                          <span>Publication Language</span>
                          <span className="aem-label-hint">Content language</span>
                        </label>
                        <select 
                          className="aem-select"
                          value={formData.language || 'English'}
                          onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="Spanish">Spanish (Español)</option>
                          <option value="French">French (Français)</option>
                          <option value="German">German (Deutsch)</option>
                          <option value="Japanese">Japanese (日本語)</option>
                        </select>
                      </div>

                      <div className="aem-form-group">
                        <label className="aem-label">
                          <span>Bureau / Location</span>
                          <span className="aem-label-hint">Reporting dateline</span>
                        </label>
                        <input 
                          type="text" 
                          className="aem-input"
                          placeholder="e.g. Bengaluru / India"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>

                      <div className="aem-form-group">
                        <div className="aem-field-header-row">
                          <label className="aem-label" style={{ margin: 0 }}>
                            <span>Reading Time</span>
                          </label>
                          <button
                            type="button"
                            className="aem-btn-sync"
                            onClick={() => {
                              const calculated = `~${readTimeMinutes} min read`;
                              setFormData(prev => ({ ...prev, readingTime: calculated }));
                              if (onShowToast) onShowToast(`Calculated read time: ${calculated}`);
                            }}
                          >
                            <Sparkles size={11} /> Auto Calc
                          </button>
                        </div>
                        <div className="aem-input-icon-wrap">
                          <Clock size={15} className="aem-input-icon" />
                          <input 
                            type="text" 
                            className="aem-input aem-input-with-icon"
                            placeholder="e.g. 4 min read"
                            value={formData.readingTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, readingTime: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. STORY TAXONOMY: TOPICS & TAGS */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <Tag size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Topics &amp; Keyword Tags</h4>
                          <p className="aem-studio-subtitle">Classify story into subject topics and attach discoverability keyword tags</p>
                        </div>
                      </div>
                    </div>

                    {/* Associated Topics Section */}
                    <div className="aem-form-group" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <label className="aem-label" style={{ margin: 0 }}>
                          <span>Associated Topics (Multi-Select)</span>
                          <span className="aem-label-hint">Curated editorial subjects</span>
                        </label>
                        {Array.isArray(formData.topics) && formData.topics.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, topics: [], topicIds: [] }))}
                            className="aem-link-action-danger"
                          >
                            Clear ({formData.topics.length})
                          </button>
                        )}
                      </div>

                      {/* Selected Topics Chips Bar */}
                      <div 
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '0.45rem',
                          minHeight: '42px',
                          padding: '0.5rem 0.75rem',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          marginBottom: '0.65rem'
                        }}
                      >
                        {(!formData.topics || formData.topics.length === 0) ? (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            No topics attached yet. Search below or select from editorial topics.
                          </span>
                        ) : (
                          formData.topics.map((topName, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="aem-topic-pill-modern is-active" 
                              style={{ fontSize: '0.8rem' }}
                            >
                              <Check size={12} className="aem-pill-check" />
                              <span>{topName}</span>
                              <button
                                type="button"
                                className="aem-chip-remove"
                                onClick={() => handleToggleTopic(topName)}
                                title="Remove topic"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Topic Search & Add Bar */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div className="aem-input-icon-wrap" style={{ flex: 1 }}>
                          <Search size={14} className="aem-input-icon" />
                          <input
                            type="text"
                            className="aem-input aem-input-with-icon"
                            placeholder="Search editorial topics or type a new topic..."
                            value={topicSearchInput}
                            onChange={(e) => {
                              setTopicSearchInput(e.target.value);
                              setIsTopicDropdownOpen(true);
                            }}
                            onFocus={() => setIsTopicDropdownOpen(true)}
                          />
                          {topicSearchInput && (
                            <button
                              type="button"
                              onClick={() => setTopicSearchInput('')}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          className="aem-btn aem-btn-secondary"
                          style={{ whiteSpace: 'nowrap', gap: '0.35rem' }}
                          onClick={() => {
                            if (topicSearchInput.trim()) {
                              handleCreateQuickTopic(topicSearchInput);
                            } else {
                              setIsTopicDropdownOpen(prev => !prev);
                            }
                          }}
                          disabled={isCreatingTopic}
                        >
                          <Plus size={14} />
                          <span>{topicSearchInput.trim() ? `+ Add "${topicSearchInput.trim().slice(0, 15)}"` : 'Browse All'}</span>
                        </button>
                      </div>

                      {/* Dropdown list of topics */}
                      {isTopicDropdownOpen && (
                        <div 
                          className="aem-topics-dropdown-popover" 
                          style={{
                            marginTop: '0.45rem',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            background: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                            padding: '0.4rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.5rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                            <span>AVAILABLE TOPICS</span>
                            <button type="button" onClick={() => setIsTopicDropdownOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                              <X size={13} />
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.35rem', padding: '0.4rem 0.2rem' }}>
                            {availableTopics
                              .filter(t => !topicSearchInput.trim() || t.name.toLowerCase().includes(topicSearchInput.toLowerCase()))
                              .map(t => {
                                const isSelected = (formData.topics || []).some(x => x.toLowerCase() === t.name.toLowerCase());
                                return (
                                  <div
                                    key={t._id || t.slug}
                                    onClick={() => handleToggleTopic(t.name)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      padding: '0.4rem 0.6rem',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      background: isSelected ? '#fff1f2' : '#f8fafc',
                                      border: isSelected ? '1px solid #fecdd3' : '1px solid #f1f5f9',
                                      fontSize: '0.8rem',
                                      fontWeight: isSelected ? 700 : 500,
                                      color: isSelected ? '#dc2626' : '#334155'
                                    }}
                                  >
                                    {isSelected ? <CheckSquare size={14} color="#dc2626" /> : <Square size={14} color="#94a3b8" />}
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                                  </div>
                                );
                              })}
                            {availableTopics.filter(t => !topicSearchInput.trim() || t.name.toLowerCase().includes(topicSearchInput.toLowerCase())).length === 0 && (
                              <div style={{ gridColumn: '1 / -1', padding: '0.8rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                                No matching topic found for "{topicSearchInput}".
                                <button
                                  type="button"
                                  onClick={() => handleCreateQuickTopic(topicSearchInput)}
                                  style={{ display: 'block', margin: '0.4rem auto 0', color: '#dc2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                  + Create new topic "{topicSearchInput}"
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Keyword Tags Section */}
                    <div className="aem-form-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <label className="aem-label" style={{ margin: 0 }}>
                          <span>Keyword Tags (Multi-Select &amp; Removable Chips)</span>
                          <span className="aem-label-hint">Type a tag and press Enter or comma to add</span>
                        </label>
                        {((formData.tags || '').split(',').map(t => t.trim()).filter(Boolean)).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, tags: '', tagIds: [] }))}
                            className="aem-link-action-danger"
                          >
                            Clear all tags ({((formData.tags || '').split(',').map(t => t.trim()).filter(Boolean)).length})
                          </button>
                        )}
                      </div>

                      {/* Interactive Tag Chips Container */}
                      <div 
                        className="aem-interactive-tag-box"
                        onClick={() => tagInputRef.current?.focus()}
                        style={{ position: 'relative' }}
                      >
                        {(formData.tags || '')
                          .split(',')
                          .map(t => t.trim())
                          .filter(Boolean)
                          .map((token, idx) => (
                            <span key={idx} className="aem-tag-chip">
                              <span className="aem-chip-hash">#</span>
                              <span className="aem-chip-text">{token}</span>
                              <button
                                type="button"
                                className="aem-chip-remove"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTag(token);
                                }}
                                title="Remove tag"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        
                        <input 
                          ref={tagInputRef}
                          type="text" 
                          className="aem-tag-chip-input"
                          placeholder={!(formData.tags || '').trim() ? "Type tag & press Enter or comma..." : "+ Add tag..."}
                          value={newTagInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.includes(',')) {
                              val.split(',').forEach(p => handleAddTag(p));
                            } else {
                              setNewTagInput(val);
                              setTagSuggestionsOpen(Boolean(val.trim()));
                            }
                          }}
                          onFocus={() => {
                            if (newTagInput.trim()) setTagSuggestionsOpen(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag(newTagInput);
                            } else if (e.key === 'Backspace' && !newTagInput) {
                              const list = (formData.tags || '').split(',').map(t => t.trim()).filter(Boolean);
                              if (list.length > 0) {
                                handleRemoveTag(list[list.length - 1]);
                              }
                            }
                          }}
                        />
                      </div>

                      {/* Autocomplete suggestions dropdown when typing */}
                      {tagSuggestionsOpen && newTagInput.trim() && (
                        <div 
                          style={{
                            marginTop: '0.3rem',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            background: '#ffffff',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                            padding: '0.3rem'
                          }}
                        >
                          {availableTags
                            .filter(t => t.name.toLowerCase().includes(newTagInput.trim().toLowerCase()))
                            .map(t => (
                              <div
                                key={t._id || t.slug}
                                onClick={() => handleAddTag(t.name)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  color: '#1e293b'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <span>#{t.name}</span>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t.count || 0} stories</span>
                              </div>
                            ))}
                          <div
                            onClick={() => handleCreateQuickTag(newTagInput)}
                            style={{
                              padding: '0.4rem 0.6rem',
                              borderTop: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              color: '#dc2626',
                              fontWeight: 700
                            }}
                          >
                            + Create new tag "#{newTagInput.trim()}" in database
                          </div>
                        </div>
                      )}

                      {/* Suggested Popular DB Tags */}
                      <div className="aem-suggested-topics-area">
                        <div className="aem-suggested-topics-label">
                          <Sparkles size={13} color="var(--brand-primary)" />
                          <span>Popular Database Tags (Click to toggle)</span>
                        </div>
                        <div className="aem-suggested-topics-grid">
                          {availableTags.slice(0, 12).map(t => {
                            const activeTags = typeof formData.tags === 'string' 
                              ? formData.tags.split(',').map(x => x.trim().toLowerCase()) 
                              : [];
                            const isIncluded = activeTags.includes(t.name.toLowerCase());
                            return (
                              <button
                                key={t._id || t.slug}
                                type="button"
                                onClick={() => {
                                  if (isIncluded) {
                                    handleRemoveTag(t.name);
                                  } else {
                                    handleAddTag(t.name);
                                  }
                                }}
                                className={`aem-topic-pill-modern ${isIncluded ? 'is-active' : ''}`}
                              >
                                {isIncluded ? <Check size={12} className="aem-pill-check" /> : <Plus size={12} className="aem-pill-plus" />}
                                <span>#{t.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PUBLISHING & EDITORIAL PLACEMENT */}
              {editorTab === 'publishing' && (
                <div className="aem-deck-layout">
                  {/* Strategy, Format & Status */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <Calendar size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Publishing Strategy & Status</h4>
                          <p className="aem-studio-subtitle">Configure editorial content format, lifecycle stage, and publication timing</p>
                        </div>
                      </div>
                      <span className="aem-studio-badge">Lifecycle & Timing</span>
                    </div>

                    <div className="aem-form-grid-2">
                      {/* Content Format */}
                      <div className="aem-form-group">
                        <label className="aem-label"><span>Editorial Content Type *</span></label>
                        <div className="aem-input-icon-wrap">
                          <FileText size={15} className="aem-input-icon" />
                          <select 
                            className="aem-select aem-input-with-icon"
                            value={formData.contentType}
                            onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                          >
                            <option value="Article">Standard Article</option>
                            <option value="News">Breaking News Story</option>
                            <option value="Interview">Founder Interview</option>
                            <option value="Opinion">Opinion & Column</option>
                            <option value="Analysis">Deep Market Analysis</option>
                            <option value="Report">Research Report</option>
                            <option value="Press Release">Press Release</option>
                          </select>
                        </div>
                      </div>

                      {/* Lifecycle Status Pills */}
                      <div className="aem-form-group">
                        <label className="aem-label"><span>Article Publication Status *</span></label>
                        <div className="aem-status-pills-row">
                          {[
                            { id: 'published', label: 'Published' },
                            { id: 'draft', label: 'Draft' },
                            { id: 'scheduled', label: 'Scheduled' },
                            { id: 'archived', label: 'Archived' }
                          ].map(st => (
                            <button
                              key={st.id}
                              type="button"
                              className={`aem-status-pill-opt status-${st.id} ${formData.status === st.id ? 'active' : ''}`}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  status: st.id,
                                  scheduledAt: st.id === 'scheduled' ? (prev.scheduledAt || new Date(Date.now() + 86400000).toISOString().slice(0, 16)) : prev.scheduledAt
                                }));
                              }}
                            >
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.id === 'published' ? '#059669' : st.id === 'scheduled' ? '#8b5cf6' : st.id === 'draft' ? '#d97706' : '#64748b' }} />
                              <span>{st.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Publication Datetime Controls */}
                    <div className="aem-form-grid-2" style={{ marginTop: '1.25rem' }}>
                      {/* Published At date override */}
                      <div className="aem-form-group">
                        <div className="aem-field-header-row">
                          <label className="aem-label" style={{ margin: 0 }}>
                            <span>Published Timestamp</span>
                            <span className="aem-label-hint">For live or backdated stories</span>
                          </label>
                          <button
                            type="button"
                            className="aem-btn-sync"
                            onClick={() => {
                              const nowIso = new Date().toISOString();
                              setFormData(prev => ({ ...prev, publishedAt: nowIso }));
                              if (onShowToast) onShowToast('Set published timestamp to now!');
                            }}
                          >
                            <Clock size={11} /> Now
                          </button>
                        </div>
                        <input 
                          type="datetime-local" 
                          className="aem-input"
                          value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                        />
                      </div>

                      {/* Scheduled Publication Box */}
                      <div style={{ background: '#f8fafc', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontWeight: 750, fontSize: '0.88rem', color: '#0f172a' }}>
                              Auto-Schedule Release
                            </span>
                            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                              {formData.scheduledAt 
                                ? `Scheduled for ${new Date(formData.scheduledAt).toLocaleString()}`
                                : 'Release at specific future date & time.'}
                            </p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={Boolean(formData.scheduledAt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
                                setFormData(prev => ({ ...prev, scheduledAt: tomorrow, status: 'scheduled' }));
                              } else {
                                setFormData(prev => ({ ...prev, scheduledAt: '', status: prev.status === 'scheduled' ? 'draft' : prev.status }));
                              }
                            }}
                            style={{ cursor: 'pointer', width: '19px', height: '19px', accentColor: 'var(--brand-primary)' }} 
                          />
                        </div>

                        {formData.scheduledAt && (
                          <div style={{ marginTop: '0.75rem' }}>
                            <input 
                              type="datetime-local" 
                              className="aem-input"
                              value={formData.scheduledAt}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value, status: 'scheduled' }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Homepage & Placement Spotlight Flags */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <Award size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Homepage & Placement Spotlight</h4>
                          <p className="aem-studio-subtitle">Spotlight this story across key homepage sections, breaking tickers, and curated grids</p>
                        </div>
                      </div>
                      <span className="aem-studio-badge">Editorial Flags</span>
                    </div>

                    <div className="aem-tiles-grid">
                      <div 
                        className={`aem-tile-card ${formData.isFeatured ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                      >
                        <div className="aem-tile-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Star size={15} color={formData.isFeatured ? 'var(--brand-primary)' : '#64748b'} />
                            <span className="aem-tile-title">Featured Story</span>
                          </div>
                          <span className="aem-tile-desc">Hero spotlight & top carousel banner</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={formData.isFeatured} 
                          onChange={() => {}} 
                          style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }} 
                        />
                      </div>

                      <div 
                        className={`aem-tile-card ${formData.isTrending ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, isTrending: !prev.isTrending }))}
                      >
                        <div className="aem-tile-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <TrendingUp size={15} color={formData.isTrending ? 'var(--brand-primary)' : '#64748b'} />
                            <span className="aem-tile-title">Trending Story</span>
                          </div>
                          <span className="aem-tile-desc">Sidebar trending list & popular reads</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={formData.isTrending} 
                          onChange={() => {}} 
                          style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }} 
                        />
                      </div>

                      <div 
                        className={`aem-tile-card ${formData.isBreaking ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, isBreaking: !prev.isBreaking }))}
                      >
                        <div className="aem-tile-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Zap size={15} color={formData.isBreaking ? 'var(--brand-primary)' : '#64748b'} />
                            <span className="aem-tile-title">Breaking News</span>
                          </div>
                          <span className="aem-tile-desc">Top banner ticker alert & breaking badge</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={formData.isBreaking} 
                          onChange={() => {}} 
                          style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }} 
                        />
                      </div>

                      <div 
                        className={`aem-tile-card ${formData.isEditorPick ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, isEditorPick: !prev.isEditorPick }))}
                      >
                        <div className="aem-tile-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Award size={15} color={formData.isEditorPick ? 'var(--brand-primary)' : '#64748b'} />
                            <span className="aem-tile-title">Editor's Pick</span>
                          </div>
                          <span className="aem-tile-desc">Curated badge & category priority</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={formData.isEditorPick} 
                          onChange={() => {}} 
                          style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SEO & SOCIAL SHARE */}
              {editorTab === 'seo' && (
                <div className="aem-deck-layout">
                  {/* Search Engine Optimization */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <Globe size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Search Engine Optimization (Meta)</h4>
                          <p className="aem-studio-subtitle">Optimize search ranking, snippet titles, and crawling metadata</p>
                        </div>
                      </div>
                      <span className="aem-studio-badge">Google SERP Ready</span>
                    </div>

                    <div className="aem-form-group">
                      <div className="aem-field-header-row">
                        <label className="aem-label" style={{ margin: 0 }}>
                          <span>Meta Title Tag</span>
                          <span className="aem-label-hint">Max 60 characters recommended</span>
                        </label>
                        <div className="aem-field-actions">
                          <span className={`aem-char-counter ${(formData.seo?.title || '').length > 60 ? 'danger' : 'good'}`}>
                            {(formData.seo?.title || '').length}/60 chars
                          </span>
                          <button
                            type="button"
                            className="aem-btn-sync"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                seo: { ...prev.seo, title: prev.title }
                              }));
                              if (onShowToast) onShowToast('Synced Meta Title with article headline!');
                            }}
                          >
                            <Sparkles size={11} /> Sync Title
                          </button>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        className="aem-input"
                        placeholder={formData.title || 'Compelling search title with target keywords...'}
                        value={formData.seo?.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                      />
                    </div>

                    <div className="aem-form-group">
                      <div className="aem-field-header-row">
                        <label className="aem-label" style={{ margin: 0 }}>
                          <span>Meta Description</span>
                          <span className="aem-label-hint">Max 160 characters recommended</span>
                        </label>
                        <div className="aem-field-actions">
                          <span className={`aem-char-counter ${(formData.seo?.description || '').length > 160 ? 'danger' : 'good'}`}>
                            {(formData.seo?.description || '').length}/160 chars
                          </span>
                          <button
                            type="button"
                            className="aem-btn-sync"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                seo: { ...prev.seo, description: prev.excerpt }
                              }));
                              if (onShowToast) onShowToast('Synced Meta Description with story excerpt!');
                            }}
                          >
                            <Sparkles size={11} /> Sync Excerpt
                          </button>
                        </div>
                      </div>
                      <textarea 
                        rows="3"
                        className="aem-input"
                        style={{ height: 'auto', padding: '0.75rem' }}
                        placeholder={formData.excerpt || 'Concise editorial summary for Google snippets and search results...'}
                        value={formData.seo?.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                      />
                    </div>

                    <div className="aem-form-grid-2">
                      <div className="aem-form-group">
                        <label className="aem-label">
                          <span>Target Search Keywords</span>
                          <span className="aem-label-hint">Comma separated</span>
                        </label>
                        <input 
                          type="text" 
                          className="aem-input"
                          placeholder="e.g. startup funding, venture capital 2026, tech trends"
                          value={formData.seo?.keywords || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, keywords: e.target.value } }))}
                        />
                      </div>

                      <div className="aem-form-group">
                        <div className="aem-field-header-row">
                          <label className="aem-label" style={{ margin: 0 }}>
                            <span>Canonical URL</span>
                            <span className="aem-label-hint">Prevents duplicate content</span>
                          </label>
                          <button
                            type="button"
                            className="aem-btn-sync"
                            onClick={() => {
                              const canon = `https://goreadpost.com/article/${displaySlug}`;
                              setFormData(prev => ({ ...prev, seo: { ...prev.seo, canonicalUrl: canon } }));
                              if (onShowToast) onShowToast(`Generated Canonical URL: ${canon}`);
                            }}
                          >
                            <Link2 size={11} /> Auto Fill
                          </button>
                        </div>
                        <input 
                          type="text" 
                          className="aem-input"
                          placeholder={`https://goreadpost.com/article/${displaySlug}`}
                          value={formData.seo?.canonicalUrl || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, canonicalUrl: e.target.value } }))}
                        />
                      </div>
                    </div>

                    {/* Google Live SERP Snippet Preview */}
                    <div style={{ marginTop: '1.25rem' }}>
                      <label className="aem-label">
                        <span>Live Google Search Result Preview</span>
                        <span className="aem-label-hint">Simulated desktop snippet</span>
                      </label>
                      <div className="aem-google-preview-box">
                        <div className="aem-google-preview-url">
                          <span style={{ color: '#202124', fontWeight: 600 }}>GoReadPost</span>
                          <span style={{ color: '#5f6368' }}>› article › {displaySlug}</span>
                        </div>
                        <div className="aem-google-preview-title">
                          {formData.seo?.title || formData.title || 'Article Headline — GoReadPost Editorial'}
                        </div>
                        <div className="aem-google-preview-desc">
                          {formData.seo?.description || formData.excerpt || 'Read the full in-depth editorial coverage on GoReadPost. Stay updated with the latest in business, tech and startups.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Media & Open Graph */}
                  <div className="aem-studio-card">
                    <div className="aem-studio-header">
                      <div className="aem-studio-title-group">
                        <div className="aem-studio-icon-bubble">
                          <Share2 size={19} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <h4 className="aem-studio-title">Social Share & OpenGraph Cards</h4>
                          <p className="aem-studio-subtitle">Customize how this story appears when shared on X (Twitter), LinkedIn, Facebook & WhatsApp</p>
                        </div>
                      </div>
                      <span className="aem-studio-badge">OpenGraph 2.0</span>
                    </div>

                    <div className="aem-form-grid-2">
                      <div className="aem-form-group">
                        <div className="aem-field-header-row">
                          <label className="aem-label" style={{ margin: 0 }}>
                            <span>Social Title (og:title)</span>
                          </label>
                          <button
                            type="button"
                            className="aem-btn-sync"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                seo: { ...prev.seo, ogTitle: prev.seo?.title || prev.title }
                              }));
                            }}
                          >
                            <Sparkles size={11} /> Sync Title
                          </button>
                        </div>
                        <input 
                          type="text" 
                          className="aem-input"
                          placeholder={formData.seo?.title || formData.title || 'Catchy social share title...'}
                          value={formData.seo?.ogTitle || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogTitle: e.target.value } }))}
                        />
                      </div>

                      <div className="aem-form-group">
                        <div className="aem-field-header-row">
                          <label className="aem-label" style={{ margin: 0 }}>
                            <span>Social Image URL (og:image)</span>
                          </label>
                          {formData.featuredImage?.url && (
                            <button
                              type="button"
                              className="aem-btn-sync"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  seo: { ...prev.seo, ogImage: prev.featuredImage.url }
                                }));
                                if (onShowToast) onShowToast('Using Featured Cover Image as Social OG Image');
                              }}
                            >
                              <ImageIcon size={11} /> Use Cover Image
                            </button>
                          )}
                        </div>
                        <input 
                          type="text" 
                          className="aem-input"
                          placeholder={formData.featuredImage?.url || 'https://...'}
                          value={formData.seo?.ogImage || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogImage: e.target.value } }))}
                        />
                      </div>
                    </div>

                    <div className="aem-form-group">
                      <div className="aem-field-header-row">
                        <label className="aem-label" style={{ margin: 0 }}>
                          <span>Social Description (og:description)</span>
                        </label>
                        <button
                          type="button"
                          className="aem-btn-sync"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              seo: { ...prev.seo, ogDescription: prev.seo?.description || prev.excerpt }
                            }));
                          }}
                        >
                          <Sparkles size={11} /> Sync Desc
                        </button>
                      </div>
                      <textarea 
                        rows="2"
                        className="aem-input"
                        style={{ height: 'auto', padding: '0.75rem' }}
                        placeholder={formData.seo?.description || formData.excerpt || 'Engaging summary designed for social feeds...'}
                        value={formData.seo?.ogDescription || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogDescription: e.target.value } }))}
                      />
                    </div>

                    {/* Social Media Card Live Preview */}
                    <div style={{ marginTop: '1.25rem' }}>
                      <label className="aem-label">
                        <span>Live Social Share Card Preview</span>
                        <span className="aem-label-hint">Facebook / LinkedIn / X Card</span>
                      </label>
                      <div className="aem-social-preview-box">
                        {(formData.seo?.ogImage || formData.featuredImage?.url) ? (
                          <div className="aem-social-preview-img-wrap">
                            <img 
                              src={formData.seo?.ogImage || formData.featuredImage?.url} 
                              alt="Social preview" 
                              className="aem-social-preview-img"
                            />
                          </div>
                        ) : (
                          <div className="aem-social-preview-empty-stage">
                            <ImageIcon size={26} color="#94a3b8" />
                            <span className="aem-social-empty-title">No Social Card Image Attached</span>
                            <span className="aem-social-empty-sub">Upload a Featured Cover Image or set a custom og:image above</span>
                          </div>
                        )}
                        <div className="aem-social-preview-content">
                          <div className="aem-social-preview-domain">GOREADPOST.COM</div>
                          <div className="aem-social-preview-title">
                            {formData.seo?.ogTitle || formData.seo?.title || formData.title || 'Headline Story on GoReadPost'}
                          </div>
                          <div className="aem-social-preview-desc">
                            {formData.seo?.ogDescription || formData.seo?.description || formData.excerpt || 'Discover in-depth reporting and insights on innovation, business, and tech leaders.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Canvas Bottom Action Bar */}
            <div className="aem-canvas-bottom-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                  Press <strong>Ctrl + S</strong> to quickly save changes
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="aem-btn-cancel" 
                  onClick={handleCloseEditor}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="aem-btn-draft" 
                  onClick={() => handleSaveArticle('draft')}
                  disabled={saving}
                >
                  Save as Draft
                </button>
                <button 
                  type="button" 
                  className="aem-btn-publish" 
                  onClick={() => handleSaveArticle('published')}
                  disabled={saving}
                >
                  <Send size={15} />
                  <span>{saving ? 'Publishing...' : editingArticle ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>
            </div>
            </div>
          </main>
        </div>

        {/* Media Picker Modal */}
        {renderMediaPickerModal()}
      </div>
    );
  };

  if (isEditorOpen) {
    return (
      <LiveArticleStudio 
        article={editingArticle}
        onClose={handleCloseEditor}
        onSaveSuccess={async () => {
          await loadArticles();
        }}
        onShowToast={onShowToast}
        categories={categories}
        authors={authors}
        topics={topics}
        tags={tags}
      />
    );
  }

  // Full-Page Article Details View
  const renderArticleFullDetailsPage = (art) => {
    const coverImg = getArticleCoverImage(art);
    const coverCaption = art.featuredImage?.caption || '';
    const coverCredit = art.featuredImage?.credit || art.photoCredit || '';
    const authorImg = art.authorAvatar || art.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
    const authorName = art.authorName || art.author?.name || 'Editorial Desk';
    const authorTitle = art.authorTitle || art.author?.designation || 'Staff Reporter';
    const catName = art.categoryName || art.categoryTag || art.category || 'General';
    const desk = art.brand || 'GoReadPost';
    const catMeta = getCategoryMeta(catName);
    const topics = getArticleTopics(art);
    const detailExcerpt = getArticleExcerpt(art);
    const tagsList = (typeof art.tags === 'string' 
      ? art.tags.split(',') 
      : Array.isArray(art.tags) 
        ? art.tags 
        : []
    ).map(t => typeof t === 'string' ? t.trim() : (t?.name || '')).filter(Boolean);
    const pubDate = art.publishedAt 
      ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : (art.createdAt ? new Date(art.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft');
    const readingTime = art.readingTime || '4 min read';
    const viewsCount = (art.views || 0).toLocaleString();
    const articleSlug = art.slug || slugify(art.title);
    const articlePath = `/article/${articleSlug}`;
    const articleUrl = typeof window !== 'undefined' ? `${window.location.origin}${articlePath}` : articlePath;

    const handleCopyUrl = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(articleUrl);
        setCopiedDetailSlug(true);
        setTimeout(() => setCopiedDetailSlug(false), 2200);
      }
    };

    // Check if article has structured story fields from preset data (e.g. HerStory, SMB, Enterprise)
    const hasStructuredStory = art.leadStoryText || art.section1Body || art.section2Body || art.section3Body1 || art.section1Lead || art.story || art.fullStory || art.body;

    return (
      <div className="abv-fullpage-details-wrapper">
        {/* Sticky Top Bar */}
        <div className="abv-fullpage-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="abv-fullpage-back-btn"
              onClick={() => setViewingArticleDetails(null)}
              title="Return to Articles list (Esc)"
            >
              <ArrowLeft size={16} />
              <span>Back to Articles</span>
            </button>

            <button
              type="button"
              className={`abv-card-status-badge status-${art.status || 'published'}`}
              style={{ position: 'static', cursor: 'pointer' }}
              onClick={async () => {
                await handleTogglePublish(art);
                setViewingArticleDetails(prev => prev ? ({ ...prev, status: prev.status === 'published' ? 'draft' : 'published' }) : null);
              }}
              title={`Workflow Status: ${(art.status || 'published').toUpperCase()}. Click to switch between Published & Draft.`}
            >
              <span className="abv-status-dot" />
              {art.status || 'published'}
            </button>

            {art.disabledFromFrontend && (
              <span 
                className="abv-flag-badge" 
                style={{ 
                  background: 'rgba(217, 119, 6, 0.12)', 
                  color: '#d97706', 
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  fontSize: '0.72rem', 
                  padding: '0.2rem 0.55rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="This article is currently hidden from the public frontend site"
              >
                <EyeOff size={11} /> Hidden from Frontend
              </span>
            )}

            {art.isFeatured && (
              <span className="abv-flag-badge flag-featured" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
                <Star size={11} /> Featured
              </span>
            )}
            {art.isTrending && (
              <span className="abv-flag-badge flag-trending" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
                <TrendingUp size={11} /> Trending
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="abv-modal-btn"
              style={{
                background: art.disabledFromFrontend ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                color: art.disabledFromFrontend ? '#059669' : '#d97706',
                border: `1px solid ${art.disabledFromFrontend ? 'rgba(5, 150, 105, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`,
                cursor: 'pointer'
              }}
              onClick={() => handleToggleFrontend(art)}
              title={art.disabledFromFrontend ? "Currently hidden from public frontend site - Click to show on frontend" : "Currently visible on public frontend site - Click to hide from frontend"}
            >
              {art.disabledFromFrontend ? (
                <>
                  <Eye size={14} />
                  <span>Enable on Frontend</span>
                </>
              ) : (
                <>
                  <EyeOff size={14} />
                  <span>Disable from Frontend</span>
                </>
              )}
            </button>



            <button 
              type="button" 
              className="abv-modal-btn"
              style={{
                background: 'var(--brand-primary)',
                color: '#ffffff'
              }}
              onClick={() => {
                const toEdit = art;
                setViewingArticleDetails(null);
                handleOpenEdit(toEdit);
              }}
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Full Details Content Card */}
        <div className="abv-fullpage-card">
          {/* Cover Media Banner */}
          <div className="abv-fullpage-cover-wrap">
            <img 
              src={coverImg} 
              alt={art.title || 'Cover image'} 
              className="abv-fullpage-cover-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="abv-detail-cover-meta-bar">
              <div className="abv-card-category-pill" style={{ position: 'relative', inset: 'auto', margin: 0 }}>
                <span 
                  className="abv-category-indicator-dot" 
                  style={{ background: catMeta.dotColor }} 
                />
                <span>{catName}</span>
              </div>
              {desk && <span className="abv-detail-desk-pill">{desk}</span>}
              {readingTime && (
                <span className="abv-detail-desk-pill" style={{ marginLeft: 'auto' }}>
                  <Clock size={11} /> {readingTime}
                </span>
              )}
            </div>
            {(coverCaption || coverCredit) && (
              <div className="abv-detail-cover-caption">
                {coverCaption && <span>{coverCaption}</span>}
                {coverCredit && <span style={{ opacity: 0.8 }}>Photo Credit: {coverCredit}</span>}
              </div>
            )}
          </div>

          {/* Headline & Subtitle */}
          <div>
            <h1 className="abv-detail-headline">{art.title}</h1>
            {art.subtitle && (
              <h2 className="abv-detail-subtitle">{art.subtitle}</h2>
            )}
          </div>

          {/* Quick Metadata Info Grid */}
          <div className="abv-detail-meta-grid">
            {/* Author */}
            <div className="abv-detail-meta-card">
              <img src={authorImg} alt={authorName} className="abv-detail-author-avatar" />
              <div>
                <div className="abv-detail-meta-label">Author</div>
                <div className="abv-detail-meta-val">{authorName}</div>
                <div className="abv-detail-meta-sub">{authorTitle}</div>
              </div>
            </div>

            {/* Publication Date */}
            <div className="abv-detail-meta-card">
              <Calendar size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <div>
                <div className="abv-detail-meta-label">Published Date</div>
                <div className="abv-detail-meta-val">{pubDate}</div>
                <div className="abv-detail-meta-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={12} /> {viewsCount} total views
                </div>
              </div>
            </div>

            {/* Category & Format */}
            <div className="abv-detail-meta-card">
              <Tag size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <div>
                <div className="abv-detail-meta-label">Category &amp; Format</div>
                <div className="abv-detail-meta-val">{catName}</div>
                <div className="abv-detail-meta-sub">{art.contentType || 'Article'} • {art.language || 'English'}</div>
              </div>
            </div>
          </div>

          {/* Excerpt / Summary */}
          {detailExcerpt && (
            <div className="abv-detail-excerpt-box">
              <div className="abv-detail-section-title">
                <Quote size={14} color="#0284c7" />
                <span>Story Excerpt / Executive Summary</span>
              </div>
              <p className="abv-detail-excerpt-text">{detailExcerpt}</p>
            </div>
          )}

          {/* Topics & Tags */}
          {(topics.length > 0 || tagsList.length > 0) && (
            <div className="abv-detail-taxonomy-box">
              {topics.length > 0 && (
                <div className="abv-detail-taxonomy-group">
                  <span className="abv-detail-tax-label">Topics:</span>
                  <div className="abv-detail-pill-wrap">
                    {topics.map((top, idx) => (
                      <span key={idx} className="abv-detail-topic-pill">
                        <Tag size={10} /> {top}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tagsList.length > 0 && (
                <div className="abv-detail-taxonomy-group">
                  <span className="abv-detail-tax-label">Tags:</span>
                  <div className="abv-detail-pill-wrap">
                    {tagsList.map((tag, idx) => (
                      <span key={idx} className="abv-detail-tag-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Article Body Content */}
          <div className="abv-detail-content-section">
            <div className="abv-detail-section-title">
              <BookOpen size={15} color="#0284c7" />
              <span>Full Article Body</span>
            </div>

            {art.contentBlocks && Array.isArray(art.contentBlocks) && art.contentBlocks.length > 0 ? (
              <div className="abv-detail-blocks-container">
                {art.contentBlocks.map((block, bIdx) => {
                  if (block.type === 'heading') {
                    return (
                      <h3 key={bIdx} className="abv-detail-block-heading">
                        {block.text}
                      </h3>
                    );
                  }
                  if (block.type === 'image') {
                    const bImg = typeof block.image === 'string' ? block.image : (block.url || block.image?.url || '');
                    return (
                      <div key={bIdx} className="abv-detail-block-image-wrap">
                        {bImg && <img src={bImg} alt={block.alt || ''} className="abv-detail-block-img" />}
                        {(block.caption || block.credit) && (
                          <p className="abv-detail-block-img-caption">
                            {block.caption} {block.credit && `(Credit: ${block.credit})`}
                          </p>
                        )}
                      </div>
                    );
                  }
                  if (block.type === 'testimonial' || block.type === 'quote') {
                    return (
                      <blockquote key={bIdx} className="abv-detail-block-quote">
                        <p>"{block.quote || block.text}"</p>
                        {block.author && <cite>— {block.author} {block.designation ? `(${block.designation})` : ''}</cite>}
                      </blockquote>
                    );
                  }
                  return (
                    <div 
                      key={bIdx} 
                      className="abv-detail-block-paragraph"
                      dangerouslySetInnerHTML={{ __html: block.text || block.content || '' }}
                    />
                  );
                })}
              </div>
            ) : art.content && typeof art.content === 'string' && art.content.trim().length > 0 ? (
              <div 
                className="abv-detail-article-content"
                dangerouslySetInnerHTML={{ __html: art.content }}
              />
            ) : hasStructuredStory ? (
              <div className="abv-detail-blocks-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {art.mottoText && (
                  <blockquote className="abv-detail-block-quote" style={{ borderLeftColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}>
                    <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-primary)' }}>"{art.mottoText}"</p>
                    {art.mottoAuthor && <cite>— {art.mottoAuthor} {art.mottoRole ? `(${art.mottoRole})` : ''}</cite>}
                  </blockquote>
                )}
                {art.leadStoryText && (
                  <p className="abv-detail-block-paragraph" style={{ fontSize: '1.05rem', lineHeight: 1.7, fontWeight: 500 }}>
                    {art.leadStoryText}
                  </p>
                )}
                {art.section1Title && (
                  <h3 className="abv-detail-block-heading" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '1rem' }}>
                    {art.section1Title}
                  </h3>
                )}
                {art.featureImage && (
                  <div className="abv-detail-block-image-wrap">
                    <img src={art.featureImage} alt={art.featureCaption || 'Story feature'} className="abv-detail-block-img" />
                    {art.featureCaption && <p className="abv-detail-block-img-caption">{art.featureCaption}</p>}
                  </div>
                )}
                {art.section1Lead && (
                  <p className="abv-detail-block-paragraph" style={{ lineHeight: 1.7 }}>
                    {art.section1Lead}
                  </p>
                )}
                {art.section1Body && (
                  <p className="abv-detail-block-paragraph" style={{ lineHeight: 1.7 }}>
                    {art.section1Body}
                  </p>
                )}
                {art.section1PullquoteText && (
                  <blockquote className="abv-detail-block-quote">
                    <p>{art.section1PullquoteText}</p>
                    {art.section1PullquoteAuthor && <cite>— {art.section1PullquoteAuthor}</cite>}
                  </blockquote>
                )}
                {art.section2Title && (
                  <h3 className="abv-detail-block-heading" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '1rem' }}>
                    {art.section2Title}
                  </h3>
                )}
                {art.section2Lead && (
                  <p className="abv-detail-block-paragraph" style={{ lineHeight: 1.7 }}>
                    {art.section2Lead}
                  </p>
                )}
                {art.section2ModernQuote && (
                  <blockquote className="abv-detail-block-quote">
                    <p>"{art.section2ModernQuote}"</p>
                    {art.section2ModernAuthor && <cite>— {art.section2ModernAuthor} {art.section2ModernRole ? `(${art.section2ModernRole})` : ''}</cite>}
                  </blockquote>
                )}
                {art.section2Body && (
                  <p className="abv-detail-block-paragraph" style={{ lineHeight: 1.7 }}>
                    {art.section2Body}
                  </p>
                )}
                {art.calloutTitle && (
                  <div className="abv-detail-excerpt-box" style={{ borderLeftColor: '#10b981', background: 'rgba(16, 185, 129, 0.08)' }}>
                    <div style={{ fontWeight: 800, color: '#059669', marginBottom: '0.35rem' }}>{art.calloutTitle}</div>
                    <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6 }}>{art.calloutText}</p>
                  </div>
                )}
                {art.section3Title && (
                  <h3 className="abv-detail-block-heading" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '1rem' }}>
                    {art.section3Title}
                  </h3>
                )}
                {art.section3Body1 && (
                  <p className="abv-detail-block-paragraph" style={{ lineHeight: 1.7 }}>
                    {art.section3Body1}
                  </p>
                )}
                {art.section3Body2 && (
                  <p className="abv-detail-block-paragraph" style={{ lineHeight: 1.7 }}>
                    {art.section3Body2}
                  </p>
                )}
                {art.takeawayText && (
                  <blockquote className="abv-detail-block-quote" style={{ borderLeftColor: 'var(--brand-primary)', background: 'rgba(2, 132, 199, 0.08)' }}>
                    <p style={{ fontWeight: 600 }}>{art.takeawayText}</p>
                  </blockquote>
                )}
                {(art.fullStory || art.story || art.body) && (
                  <div 
                    className="abv-detail-article-content"
                    dangerouslySetInnerHTML={{ __html: art.fullStory || art.story || art.body }}
                  />
                )}
              </div>
            ) : (
              <div className="abv-detail-empty-content">
                <Info size={16} />
                <span>No body content written for this article yet. Click "Edit" to compose content.</span>
              </div>
            )}
          </div>

          {/* Permalink & Full URL Box */}
          <div className="abv-detail-slug-box">
            <div className="abv-detail-slug-info">
              <Globe size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span className="abv-detail-slug-label">URL:</span>
              <a 
                href={articlePath} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="abv-detail-slug-text"
                title={`Open ${articlePath} in new tab`}
              >
                {articlePath}
              </a>
            </div>
            <button 
              type="button" 
              className="abv-detail-copy-btn"
              onClick={handleCopyUrl}
              title="Copy full article URL"
            >
              {copiedDetailSlug ? (
                <>
                  <Check size={13} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Copied URL!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
        </div>



        {/* Delete Confirmation Modal if triggered */}
        {articleToDelete && (
          <div className="modal-overlay" onClick={() => setArticleToDelete(null)}>
            <div className="anv-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="anv-modal-header">
                <div className="anv-modal-title-box">
                  <AlertCircle size={22} color="#dc2626" />
                  <div>
                    <h3>Delete Editorial Article?</h3>
                  </div>
                </div>
                <button className="anv-modal-close" onClick={() => setArticleToDelete(null)}>
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '1rem 0' }}>
                Are you sure you want to delete <strong>"{articleToDelete.title}"</strong>?
              </p>

              <div className="anv-modal-footer">
                <button className="anv-modal-btn cancel" onClick={() => setArticleToDelete(null)}>Cancel</button>
                <button 
                  className="anv-modal-btn delete-btn" 
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{ background: '#dc2626', color: '#fff' }}
                >
                  {deleting ? 'Deleting...' : 'Delete Article'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (viewingArticleDetails) {
    return renderArticleFullDetailsPage(viewingArticleDetails);
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'archived') {
      if (currentPath !== '/admin/archived') onNavigate?.('/admin/archived');
    } else {
      if (currentPath === '/admin/archived') onNavigate?.('/admin/articles');
    }
  };

  return (
    <div className="abv-container">
      {/* 1. KPI Cards */}
      <div className="abv-kpi-row" style={{ marginTop: '0.25rem' }}>
        <div 
          className={`abv-kpi-card kpi-all ${activeTab === 'all' ? 'active' : ''}`} 
          onClick={() => handleTabClick('all')} 
          role="button"
          tabIndex={0}
          title="Filter: All Posts"
        >
          <div className="abv-kpi-num">{articles.length}</div>
          <div className="abv-kpi-label">All Posts</div>
        </div>
        <div 
          className={`abv-kpi-card kpi-published ${activeTab === 'published' ? 'active' : ''}`} 
          onClick={() => handleTabClick('published')} 
          role="button"
          tabIndex={0}
          title="Filter: Published (Live) Posts"
        >
          <div className="abv-kpi-num" style={{ color: 'var(--accent-emerald, #059669)' }}>{publishedCount}</div>
          <div className="abv-kpi-label">Published (Live)</div>
        </div>
        <div 
          className={`abv-kpi-card kpi-draft ${activeTab === 'draft' ? 'active' : ''}`} 
          onClick={() => handleTabClick('draft')} 
          role="button"
          tabIndex={0}
          title="Filter: Draft Posts"
        >
          <div className="abv-kpi-num" style={{ color: 'var(--brand-primary, #dc2626)' }}>{draftCount}</div>
          <div className="abv-kpi-label">Drafts</div>
        </div>
        <div 
          className={`abv-kpi-card kpi-scheduled ${activeTab === 'scheduled' ? 'active' : ''}`} 
          onClick={() => handleTabClick('scheduled')} 
          role="button"
          tabIndex={0}
          title="Filter: Scheduled Posts"
        >
          <div className="abv-kpi-num" style={{ color: '#8b5cf6' }}>{scheduledCount}</div>
          <div className="abv-kpi-label">Scheduled</div>
        </div>
        <div 
          className={`abv-kpi-card kpi-views ${activeTab === 'views' ? 'active' : ''}`} 
          onClick={() => handleTabClick('views')} 
          role="button"
          tabIndex={0}
          title="Sort by: Most Viewed Posts"
        >
          <div className="abv-kpi-num" style={{ color: '#0284c7' }}>{(totalViews || 0).toLocaleString()}</div>
          <div className="abv-kpi-label">Total Views</div>
        </div>
      </div>


      {/* 4. Controls & Filters Omnibar */}
      <div className="abv-filter-bar abv-controls-panel">
        <div className="abv-search-box">
          <Search size={16} className="abv-search-icon" />
          <input 
            type="text" 
            placeholder="Search by article title, author, or slug..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="abv-clear-search" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="abv-filter-group">
          {activeFilterCount > 0 && (
            <div className="abv-active-filter-chips">
              {selectedDesk !== 'all' && (
                <span className="abv-active-chip">
                  <span>Desk: {DESKS.find(d => d.id === selectedDesk)?.label || selectedDesk}</span>
                  <button type="button" onClick={() => setSelectedDesk('all')} title="Remove desk filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="abv-active-chip">
                  <span>Category: {selectedCategory}</span>
                  <button type="button" onClick={() => setSelectedCategory('all')} title="Remove category filter">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="abv-filter-dropdown-container" ref={filterDropdownRef}>
            <button 
              type="button" 
              className={`abv-filter-btn ${activeFilterCount > 0 ? 'active' : ''} ${isFilterDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsFilterDropdownOpen(prev => !prev)}
              title="Filter by Desk and Category"
            >
              <Filter size={14} className="abv-filter-icon" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="abv-filter-count-badge">{activeFilterCount}</span>
              )}
              <ChevronDown size={13} className={`abv-filter-chevron ${isFilterDropdownOpen ? 'rotated' : ''}`} />
            </button>

            {isFilterDropdownOpen && (
              <div className="abv-filter-popover">
                <div className="abv-filter-popover-header">
                  <div className="abv-filter-popover-title">
                    <Filter size={13} />
                    <span>Filter Articles</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <button 
                      type="button" 
                      className="abv-filter-reset-btn"
                      onClick={() => {
                        setSelectedDesk('all');
                        setSelectedCategory('all');
                      }}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                <div className="abv-filter-popover-body">
                  {/* Desk Filter */}
                  <div className="abv-filter-field">
                    <label className="abv-filter-label">Desk</label>
                    <select 
                      value={selectedDesk} 
                      onChange={(e) => setSelectedDesk(e.target.value)}
                      className="abv-popover-select"
                    >
                      {DESKS.map(b => (
                        <option key={b.id} value={b.id}>{b.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="abv-filter-field">
                    <label className="abv-filter-label">Category</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="abv-popover-select"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => (
                        <option key={c._id || c.slug} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            type="button" 
            className="abv-create-article-btn"
            onClick={handleOpenCreate}
            title="Create New Article"
          >
            <Plus size={15} />
            <span>Create Article</span>
          </button>
        </div>
      </div>



      {/* 5. Articles Content: Cards Grid View */}
      <div>
          {/* Cards Header: Select All, Conditional Actions, & Count */}
          <div className="abv-cards-header-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label className="abv-select-all-label" title="Select all articles">
                <input 
                  type="checkbox" 
                  className="admin-table-checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(filteredArticles.map(a => a._id || a.id)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                  checked={selectedIds.size > 0 && selectedIds.size === filteredArticles.length}
                />
                <span>Select All</span>
              </label>
              {selectedIds.size > 0 && (
                <span className="abv-selected-pill">
                  {selectedIds.size} of {filteredArticles.length} selected
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {selectedIds.size > 0 && (
                <div className="abv-bulk-actions-group">
                  {showBulkPublish && (
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange('published')}
                      className="abv-bulk-btn abv-bulk-btn-publish"
                      title="Publish selected article(s)"
                    >
                      <CheckCircle size={14} />
                      <span>Publish</span>
                    </button>
                  )}
                  {showBulkDraft && (
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange('draft')}
                      className="abv-bulk-btn abv-bulk-btn-draft"
                      title="Send selected article(s) to draft"
                    >
                      <Clock size={14} />
                      <span>Send Draft</span>
                    </button>
                  )}
                  {showBulkDelete && (
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={deleting}
                      className="abv-bulk-btn abv-bulk-btn-delete"
                      title="Delete selected article(s)"
                    >
                      <Trash2 size={14} />
                      <span>{deleting ? 'Deleting...' : `Delete (${selectedIds.size})`}</span>
                    </button>
                  )}
                </div>
              )}

              <div className="abv-cards-count-badge">
                <span>
                  {activeTab === 'draft' && 'Drafts: '}
                  {activeTab === 'published' && 'Published: '}
                  {activeTab === 'scheduled' && 'Scheduled: '}
                  {activeTab === 'views' && 'Most Viewed: '}
                  {activeTab === 'all' && 'All Posts: '}
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
              <RefreshCw size={26} color="var(--brand-primary)" className="rotate-icon" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Loading editorial articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
              <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Posts Found</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
                {search ? `No articles matching "${search}"` : 
                 activeTab === 'draft' ? 'No draft articles found. You can create a new article and save it as draft.' :
                 activeTab === 'scheduled' ? 'No scheduled articles found.' :
                 activeTab === 'published' ? 'No published articles found.' :
                 'No articles currently in this section.'}
              </p>
              <button className="abv-btn-primary" onClick={handleOpenCreate} style={{ margin: '0 auto' }}>
                <Plus size={15} /> Create First Article
              </button>
            </div>
          ) : (
            <div className="abv-cards-grid">
              {filteredArticles.map(article => {
                const id = article._id || article.id;
                const isSelected = selectedIds.has(id);
                const slug = article.slug || slugify(article.title);
                const coverImage = getArticleCoverImage(article);
                const authorImg = article.authorAvatar || article.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80';
                const authorLabel = article.authorName || article.author?.name || 'Editorial Desk';
                const categoryLabel = article.categoryName || article.categoryTag || article.category || 'Startups';
                const deskLabel = article.brand || 'GoReadPost';
                const viewsCount = article.views || 0;
                const catMeta = getCategoryMeta(categoryLabel);
                const cardTopics = getArticleTopics(article);
                const displayTopics = cardTopics.filter(t => t.toLowerCase() !== categoryLabel.toLowerCase());
                const cardExcerpt = getArticleExcerpt(article);

                return (
                  <div 
                    key={id} 
                    className={`abv-article-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setViewingArticleDetails(article)}
                  >
                    {/* 16:9 Cover Media Header */}
                    <div className="abv-card-media">
                      <img 
                        src={coverImage} 
                        alt={article.title} 
                        className="abv-card-img" 
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="abv-card-media-overlay" />

                      {/* Bulk Select Button */}
                      <button 
                        type="button"
                        className={`abv-card-select-btn ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = new Set(selectedIds);
                          if (isSelected) next.delete(id);
                          else next.add(id);
                          setSelectedIds(next);
                        }}
                        title={isSelected ? "Deselect article" : "Select article"}
                        aria-label={isSelected ? "Deselect article" : "Select article"}
                      >
                        <Check size={13} strokeWidth={3} className="abv-select-check-icon" />
                      </button>

                      {/* Status Toggle Badge */}
                      <button
                        type="button"
                        className={`abv-card-status-badge status-${article.status || 'published'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(article);
                        }}
                        title="Click to toggle publish status"
                      >
                        <span className="abv-status-dot" />
                        {article.status || 'published'}
                      </button>

                      {/* Unified Badges: Category & Trending/Featured together side-by-side */}
                      <div className="abv-card-media-badges">
                        {/* Glassmorphic Category Badge with Indicator Dot */}
                        <div className="abv-card-category-pill">
                          <span 
                            className="abv-category-indicator-dot" 
                            style={{ background: catMeta.dotColor, boxShadow: `0 0 6px ${catMeta.dotColor}` }} 
                          />
                          <span>{categoryLabel}</span>
                        </div>

                        {article.disabledFromFrontend && (
                          <span 
                            className="abv-flag-badge" 
                            style={{ 
                              background: 'rgba(30, 41, 59, 0.75)', 
                              color: '#fbbf24', 
                              border: '1px solid rgba(251, 191, 36, 0.35)',
                              fontSize: '0.72rem'
                            }} 
                            title="Hidden from public frontend"
                          >
                            <EyeOff size={11} /> Hidden
                          </span>
                        )}

                        {article.isTrending && (
                          <span className="abv-flag-badge flag-trending">
                            <TrendingUp size={11} /> Trending
                          </span>
                        )}
                        {article.isFeatured && (
                          <span className="abv-flag-badge flag-featured">
                            <Star size={11} /> Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="abv-card-body">
                      {/* Topics & Read Time Row */}
                      <div className="abv-card-topics-meta-row">
                        <div className="abv-card-topics-chips">
                          {displayTopics.slice(0, 1).map((topic, tIdx) => (
                            <span key={tIdx} className="abv-card-topic-tag" title={`Topic: ${topic}`}>
                              <Tag size={10} className="abv-topic-icon" />
                              <span>{topic}</span>
                            </span>
                          ))}
                          {displayTopics.length > 1 && (
                            <span className="abv-card-topic-tag more" title={displayTopics.slice(1).join(', ')}>
                              +{displayTopics.length - 1}
                            </span>
                          )}
                        </div>

                        {article.readingTime && (
                          <span className="abv-card-readtime-pill">
                            <Clock size={11} /> {article.readingTime}
                          </span>
                        )}
                      </div>

                      <h3 className="abv-card-title" title={article.title}>
                        {article.title}
                      </h3>

                      {/* Excerpt preview if available */}
                      {cardExcerpt && (
                        <p className="abv-card-excerpt" title={cardExcerpt}>
                          {cardExcerpt}
                        </p>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="abv-card-footer">
                      <div className="abv-card-author-meta">
                        <img 
                          src={authorImg} 
                          alt=""
                          className="abv-card-author-img"
                        />
                        <div className="abv-card-author-text">
                          <span className="abv-card-author-name">
                            {authorLabel}
                          </span>
                          <span className="abv-card-date">
                            <Calendar size={11} />
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Draft'}
                          </span>
                        </div>
                      </div>

                      <div className="abv-card-actions-meta">
                        <div className="abv-card-views" title={`${viewsCount.toLocaleString()} views`}>
                          <Eye size={13} />
                          <span>{viewsCount.toLocaleString()}</span>
                        </div>

                        <div className="abv-card-actions">
                          <button 
                            type="button"
                            className="abv-action-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(article);
                            }}
                            title="Edit article"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            type="button"
                            className="abv-action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setArticleToDelete(article);
                            }}
                            title="Delete article"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      {/* MEDIA LIBRARY SELECTOR MODAL */}
      {renderMediaPickerModal()}



      {/* 8. DELETE CONFIRMATION MODAL */}
      {articleToDelete && (
        <div className="modal-overlay" onClick={() => setArticleToDelete(null)}>
          <div className="anv-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="anv-modal-header">
              <div className="anv-modal-title-box">
                <AlertCircle size={22} color="#dc2626" />
                <div>
                  <h3>Delete Editorial Article?</h3>
                </div>
              </div>
              <button className="anv-modal-close" onClick={() => setArticleToDelete(null)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '1rem 0' }}>
              Are you sure you want to delete <strong>"{articleToDelete.title}"</strong>?
              <br /><br />
              The public URL <code>/article/{articleToDelete.slug}</code> will return a 404 Not Found error immediately.
            </p>

            <div className="anv-modal-footer">
              <button className="anv-modal-btn cancel" onClick={() => setArticleToDelete(null)}>Cancel</button>
              <button 
                className="anv-modal-btn delete-btn" 
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{ background: '#dc2626', color: '#fff' }}
              >
                {deleting ? 'Deleting...' : 'Delete Article'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
