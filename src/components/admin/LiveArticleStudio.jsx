import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Save, Send, Trash2, Eye, Edit3, Image as ImageIcon, 
  Heading1, Heading2, Heading3, Quote, List, Sparkles, Check, 
  Plus, ChevronUp, ChevronDown, Copy, ExternalLink, Calendar, 
  Clock, User, Tag, Layers, Globe, Star, AlertCircle, RefreshCw,
  Layout, Monitor, Smartphone, X, Upload, MessageSquare, BookOpen
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { TaxonomyService } from '../../services/taxonomyService';
import { MediaService } from '../../services/mediaService';
import './LiveArticleStudio.css';
import '../ArticlePage.css';

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

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Convert HTML content into structured content blocks if no contentBlocks exist
function parseHtmlToBlocks(html) {
  if (!html || typeof html !== 'string') return [];
  const trimmed = html.trim();
  if (!trimmed) return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    const blocks = [];

    nodes.forEach((node, idx) => {
      const id = 'blk_' + Date.now().toString(36) + '_' + idx;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'h2') {
          blocks.push({ id, type: 'heading', level: 2, text: node.textContent.trim() });
        } else if (tag === 'h3') {
          blocks.push({ id, type: 'heading', level: 3, text: node.textContent.trim() });
        } else if (tag === 'p') {
          const img = node.querySelector('img');
          if (img) {
            blocks.push({
              id,
              type: 'image',
              url: img.src || '',
              alt: img.alt || '',
              caption: '',
              credit: '',
              layout: 'standard'
            });
          } else {
            blocks.push({ id, type: 'paragraph', text: node.innerHTML.trim() });
          }
        } else if (tag === 'figure') {
          const img = node.querySelector('img');
          const figcaption = node.querySelector('figcaption');
          blocks.push({
            id,
            type: 'image',
            url: img ? img.src : '',
            alt: img ? img.alt : '',
            caption: figcaption ? figcaption.textContent.trim() : '',
            credit: '',
            layout: 'standard'
          });
        } else if (tag === 'blockquote') {
          blocks.push({
            id,
            type: 'testimonial',
            quote: node.textContent.trim(),
            author: 'Founder / Speaker',
            designation: 'Leadership',
            company: '',
            avatar: '',
            rating: 5
          });
        } else {
          blocks.push({ id, type: 'paragraph', text: node.outerHTML });
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        blocks.push({ id, type: 'paragraph', text: node.textContent.trim() });
      }
    });

    if (blocks.length > 0) return blocks;
  } catch (e) {
    console.warn('Could not parse html to blocks:', e);
  }

  return [{ id: 'blk_initial', type: 'paragraph', text: html }];
}

// Default blocks for newly created stories
const DEFAULT_INITIAL_BLOCKS = [
  {
    id: 'blk_h1',
    type: 'heading',
    level: 2,
    text: '1. The Rise of New Opportunities in the Ecosystem'
  },
  {
    id: 'blk_p1',
    type: 'paragraph',
    text: 'Modern founders and industry leaders are adopting agile strategies to accelerate business transformation. By integrating cutting-edge solutions, organizations are expanding their market footprint, unlocking scalable operational efficiencies, and reaching wider audiences than ever before.'
  },
  {
    id: 'blk_img1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
    caption: 'Founders collaborate on emerging operational frameworks and scalable customer strategies.',
    credit: 'GoReadPost Editorial Studio / Unsplash',
    alt: 'Founders collaboration',
    layout: 'standard'
  },
  {
    id: 'blk_quote1',
    type: 'testimonial',
    quote: 'Innovation is not merely adopting the latest technology — it is about creating meaningful solutions that scale and sustainably solve real customer pain points.',
    author: 'Aarav Mehta',
    designation: 'Co-Founder & CEO',
    company: 'Apex Innovations',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    rating: 5
  },
  {
    id: 'blk_h2',
    type: 'heading',
    level: 2,
    text: '2. Key Strategic Takeaways & Growth Drivers'
  },
  {
    id: 'blk_takeaways',
    type: 'takeaways',
    title: 'Key Highlights & Strategic Insights',
    items: [
      'Automation & Efficiency: Drastically cuts routine administrative overhead by over 40%.',
      'Hyper-Personalized Customer Journeys: Delivers tailored interactions across mobile and web touchpoints.',
      'Data-Backed Decision Making: Empowers product teams with actionable, real-time analytics.',
      'Scalable Unit Economics: Maximizes lifetime customer value while optimizing acquisition costs.'
    ]
  },
  {
    id: 'blk_p2',
    type: 'paragraph',
    text: 'As the market ecosystem matures, startups that balance sustainable unit economics with high-velocity innovation will lead the next wave of global enterprise growth.'
  }
];

export default function LiveArticleStudio({
  article = null,
  onClose,
  onSaveSuccess,
  onShowToast,
  categories: propCategories = [],
  authors: propAuthors = [],
  topics: propTopics = [],
  tags: propTags = []
}) {
  // View & Split layout state
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  // Categories & Authors
  const [categories, setCategories] = useState(propCategories);
  const [authors, setAuthors] = useState(propAuthors);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Media picker modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState({ type: 'featured', blockId: null });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState(() => {
    if (article) {
      let initialBlocks = [];
      if (Array.isArray(article.contentBlocks) && article.contentBlocks.length > 0) {
        initialBlocks = article.contentBlocks;
      } else if (article.content) {
        initialBlocks = parseHtmlToBlocks(article.content);
      } else {
        initialBlocks = [...DEFAULT_INITIAL_BLOCKS];
      }

      return {
        _id: article._id || article.id || null,
        title: article.title || '',
        slug: article.slug || slugify(article.title || ''),
        subtitle: article.subtitle || article.excerpt || '',
        excerpt: article.excerpt || article.summary || '',
        contentType: article.contentType || 'article',
        brand: article.brand || 'GoReadPost',
        categoryId: article.categoryId || '',
        categoryName: article.categoryName || article.categoryTag || article.category || 'Startups',
        authorId: article.authorId || '',
        authorName: article.authorName || (typeof article.author === 'string' ? article.author : article.author?.name) || 'Editorial Desk',
        authorTitle: article.authorTitle || article.author?.title || 'Staff Reporter',
        authorAvatar: article.authorAvatar || article.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        featuredImage: {
          url: article.featuredImage?.url || (typeof article.featuredImage === 'string' ? article.featuredImage : '') || article.image || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
          alt: article.featuredImage?.alt || article.title || 'Featured story image',
          caption: article.featuredImage?.caption || '',
          credit: article.featuredImage?.credit || article.photoCredit || 'GoReadPost Bureau'
        },
        readingTime: article.readingTime || article.readTime || '4 min read',
        status: article.status || 'published',
        isFeatured: Boolean(article.isFeatured),
        isTrending: Boolean(article.isTrending),
        isBreaking: Boolean(article.isBreaking),
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || 'startups, technology, growth'),
        topics: Array.isArray(article.topics) ? article.topics : ['Startups'],
        seo: {
          title: article.seo?.title || article.title || '',
          description: article.seo?.description || article.subtitle || article.excerpt || '',
          keywords: article.seo?.keywords || '',
          ogImage: article.seo?.ogImage || article.featuredImage?.url || ''
        },
        contentBlocks: initialBlocks
      };
    }

    // Brand new story template
    return {
      _id: null,
      title: 'How Next-Gen Founders Are Redefining Modern Growth & Market Innovation',
      slug: 'how-next-gen-founders-are-redefining-modern-growth',
      subtitle: 'From intelligent automation to high-velocity distribution, startups are executing sustainable strategies to dominate emerging verticals.',
      excerpt: 'Explore the key playbooks, founder perspectives, and market forces driving high-impact innovation across global ecosystems.',
      contentType: 'article',
      brand: 'GoReadPost',
      categoryId: '',
      categoryName: 'Startups',
      authorId: '',
      authorName: 'Editorial Desk',
      authorTitle: 'Senior Tech Reporter',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
        alt: 'High-growth business ecosystem',
        caption: 'Strategic innovation and cross-functional teams in modern startup hubs.',
        credit: 'GoReadPost Bureau / Unsplash'
      },
      readingTime: '4 min read',
      status: 'published',
      isFeatured: false,
      isTrending: true,
      isBreaking: false,
      tags: 'startups, tech, growth, funding, innovation',
      topics: ['Startups'],
      seo: {
        title: '',
        description: '',
        keywords: 'startups, business, innovation, technology',
        ogImage: ''
      },
      contentBlocks: [...DEFAULT_INITIAL_BLOCKS]
    };
  });

  // Load taxonomies if not provided
  useEffect(() => {
    if (categories.length === 0) {
      TaxonomyService.getCategories().then(res => res && setCategories(Array.isArray(res) ? res : res.data || [])).catch(() => {});
    }
    if (authors.length === 0) {
      TaxonomyService.getAuthors().then(res => res && setAuthors(Array.isArray(res) ? res : res.data || [])).catch(() => {});
    }
  }, []);

  // Compute Word Count & Estimated Read Time
  const stats = useMemo(() => {
    let text = formData.title + ' ' + formData.subtitle + ' ';
    formData.contentBlocks.forEach(b => {
      if (b.text) text += b.text + ' ';
      if (b.quote) text += b.quote + ' ';
      if (Array.isArray(b.items)) text += b.items.join(' ') + ' ';
    });
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [formData.title, formData.subtitle, formData.contentBlocks]);

  // Update reading time automatically
  useEffect(() => {
    setFormData(prev => ({ ...prev, readingTime: `${stats.minutes} min read` }));
  }, [stats.minutes]);

  // ── Block Operations ──
  const handleAddBlock = (type) => {
    const id = 'blk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    let newBlock = null;

    if (type === 'heading') {
      newBlock = { id, type: 'heading', level: 2, text: 'New Section Heading' };
    } else if (type === 'paragraph') {
      newBlock = { id, type: 'paragraph', text: 'Write your insightful paragraph here. You can detail key arguments, market figures, and background context...' };
    } else if (type === 'image') {
      newBlock = {
        id,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
        caption: 'Add caption describing this image...',
        credit: 'Photo: Unsplash',
        alt: 'Editorial visual illustration',
        layout: 'standard'
      };
    } else if (type === 'gallery') {
      newBlock = {
        id,
        type: 'gallery',
        images: [
          { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80', caption: 'Workshop and team sessions' },
          { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80', caption: 'Product strategy presentation' }
        ]
      };
    } else if (type === 'testimonial') {
      newBlock = {
        id,
        type: 'testimonial',
        quote: '“Focusing on user value before vanity metrics was the single most pivotal decision for our company.”',
        author: 'Rhea Sen',
        designation: 'Founder & Managing Director',
        company: 'Vanguard Ventures',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
        rating: 5
      };
    } else if (type === 'takeaways') {
      newBlock = {
        id,
        type: 'takeaways',
        title: 'Key Takeaways & Highlights',
        items: [
          'High adaptability drives long-term customer retention.',
          'Early team alignment minimizes strategic pivots later.',
          'Robust technology infrastructure guarantees 99.9% customer reliability.'
        ]
      };
    }

    if (newBlock) {
      setFormData(prev => ({
        ...prev,
        contentBlocks: [...prev.contentBlocks, newBlock]
      }));
      if (onShowToast) onShowToast(`Added new ${type} block`);
    }
  };

  const handleUpdateBlock = (id, updates) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const handleRemoveBlock = (id) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter(b => b.id !== id)
    }));
  };

  const handleMoveBlock = (index, direction) => {
    const blocks = [...formData.contentBlocks];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const temp = blocks[index];
    blocks[index] = blocks[targetIdx];
    blocks[targetIdx] = temp;
    setFormData(prev => ({ ...prev, contentBlocks: blocks }));
  };

  const handleDuplicateBlock = (block) => {
    const clone = {
      ...block,
      id: 'blk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4)
    };
    const idx = formData.contentBlocks.findIndex(b => b.id === block.id);
    const updated = [...formData.contentBlocks];
    updated.splice(idx + 1, 0, clone);
    setFormData(prev => ({ ...prev, contentBlocks: updated }));
    if (onShowToast) onShowToast(`Duplicated ${block.type} block`);
  };

  // Compile blocks into semantic HTML string for database & public feed
  const compileBlocksToHtml = (blocks) => {
    return blocks.map(b => {
      if (b.type === 'heading') {
        return `<h${b.level || 2} class="map-body-heading">${b.text}</h${b.level || 2}>`;
      }
      if (b.type === 'paragraph') {
        return `<p>${b.text}</p>`;
      }
      if (b.type === 'image') {
        return `<figure class="map-inline-figure ${b.layout || 'standard'}"><img src="${b.url}" alt="${b.alt || b.caption || 'Article illustration'}" />${b.caption || b.credit ? `<figcaption class="map-inline-caption">${b.caption || ''} ${b.credit ? `(Photo: ${b.credit})` : ''}</figcaption>` : ''}</figure>`;
      }
      if (b.type === 'gallery') {
        const imgs = (b.images || []).map(img => `<figure class="map-gallery-item"><img src="${img.url || img}" alt="${img.caption || ''}" />${img.caption ? `<figcaption class="map-gallery-caption">${img.caption}</figcaption>` : ''}</figure>`).join('');
        return `<div class="map-gallery-grid">${imgs}</div>`;
      }
      if (b.type === 'testimonial' || b.type === 'quote') {
        return `<div class="map-quote-card map-testimonial-card"><blockquote class="map-quote-text">“${b.quote || b.text}”</blockquote><div class="map-quote-author">— ${b.author || 'Contributor'}${b.designation ? `, ${b.designation}` : ''}${b.company ? ` (${b.company})` : ''}</div></div>`;
      }
      if (b.type === 'takeaways') {
        const listItems = (Array.isArray(b.items) ? b.items : []).map(it => `<li class="map-checklist-item"><div>${it}</div></li>`).join('');
        return `<div class="map-takeaways-card"><h4 class="map-takeaways-title">${b.title || 'Key Highlights'}</h4><ul class="map-checklist">${listItems}</ul></div>`;
      }
      return '';
    }).join('\n\n');
  };

  // Save / Publish Handler
  const handleSaveArticle = async (targetStatus = 'published') => {
    if (!formData.title.trim()) {
      alert('Please provide a title for the story.');
      return;
    }

    setSaving(true);
    try {
      const compiledHtml = compileBlocksToHtml(formData.contentBlocks);
      const cleanSlug = formData.slug ? slugify(formData.slug) : slugify(formData.title);

      const payload = {
        title: formData.title.trim(),
        slug: cleanSlug,
        subtitle: formData.subtitle.trim(),
        excerpt: formData.excerpt.trim() || formData.subtitle.trim(),
        contentType: formData.contentType || 'article',
        brand: formData.brand || 'GoReadPost',
        categoryName: formData.categoryName || 'Startups',
        categoryId: formData.categoryId || null,
        authorName: formData.authorName || 'Editorial Desk',
        authorTitle: formData.authorTitle || 'Senior Staff Reporter',
        authorAvatar: formData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        featuredImage: {
          url: formData.featuredImage.url,
          alt: formData.featuredImage.alt || formData.title,
          caption: formData.featuredImage.caption || '',
          credit: formData.featuredImage.credit || 'GoReadPost Bureau'
        },
        readingTime: formData.readingTime || `${stats.minutes} min read`,
        status: targetStatus,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isBreaking: formData.isBreaking,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : (formData.tags || []),
        topics: formData.topics || ['Startups'],
        content: compiledHtml,
        contentBlocks: formData.contentBlocks,
        seo: {
          title: formData.seo?.title || formData.title,
          description: formData.seo?.description || formData.excerpt || formData.subtitle,
          keywords: formData.seo?.keywords || '',
          ogImage: formData.seo?.ogImage || formData.featuredImage?.url || ''
        }
      };

      let result = null;
      if (formData._id) {
        result = await ArticleService.updateArticle(formData._id, payload);
        if (onShowToast) onShowToast(`Successfully updated "${formData.title}" (${targetStatus})`);
      } else {
        result = await ArticleService.createArticle(payload);
        if (onShowToast) onShowToast(`Successfully published "${formData.title}" to database!`);
      }

      if (onSaveSuccess) onSaveSuccess(result);
      if (onClose) onClose();
    } catch (err) {
      alert('Error saving article: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Permanent Delete Handler
  const handleConfirmPermanentDelete = async () => {
    if (!formData._id) return;
    setDeleting(true);
    try {
      await ArticleService.deleteArticle(formData._id);
      if (onShowToast) onShowToast(`Permanently deleted "${formData.title}"`);
      setShowDeleteModal(false);
      if (onSaveSuccess) onSaveSuccess(null);
      if (onClose) onClose();
    } catch (err) {
      alert('Error deleting article: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Media Library Picking
  const openMediaPicker = (target) => {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
    setMediaLoading(true);
    MediaService.getMedia()
      .then(res => {
        const list = res && res.data ? res.data : (Array.isArray(res) ? res : []);
        setMediaFiles(list);
      })
      .catch(console.error)
      .finally(() => setMediaLoading(false));
  };

  const handleSelectMedia = (file) => {
    if (!file || !file.url) return;
    if (mediaPickerTarget.type === 'featured') {
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          ...prev.featuredImage,
          url: file.url,
          alt: file.altText || file.originalName || 'Featured Cover',
          credit: file.credit || 'GoReadPost Media'
        }
      }));
    } else if (mediaPickerTarget.type === 'blockImage') {
      handleUpdateBlock(mediaPickerTarget.blockId, {
        url: file.url,
        alt: file.altText || file.originalName || 'Blog Image',
        credit: file.credit || 'GoReadPost Media'
      });
    } else if (mediaPickerTarget.type === 'testimonialAvatar') {
      handleUpdateBlock(mediaPickerTarget.blockId, {
        avatar: file.url
      });
    }
    setIsMediaPickerOpen(false);
  };

  // Live article simulation object matching public ArticlePage structure
  const liveArticle = useMemo(() => {
    return {
      title: formData.title || 'Untitled Headline',
      subtitle: formData.subtitle || '',
      categoryName: (formData.categoryName || 'STARTUPS').toUpperCase(),
      categorySlug: slugify(formData.categoryName || 'startups'),
      image: formData.featuredImage?.url || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
      photoCredit: formData.featuredImage?.caption || formData.featuredImage?.credit || '',
      authorName: formData.authorName || 'Editorial Desk',
      authorAvatar: formData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      authorTitle: formData.authorTitle || 'Senior Reporter',
      publishedDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      readDuration: formData.readingTime || `${stats.minutes} min read`,
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : (formData.tags || []),
      contentBlocks: formData.contentBlocks
    };
  }, [formData, stats.minutes]);

  return (
    <div className="las-studio-container">
      {/* ── Top Bar ── */}
      <header className="las-studio-header">
        <div className="las-header-left">
          <button 
            type="button" 
            className="las-back-btn" 
            onClick={onClose}
            title="Return to articles table"
          >
            <ArrowLeft size={16} />
            <span>Articles</span>
          </button>
          <div className="las-title-meta">
            <div className="las-studio-badge-row">
              <span className="las-studio-title">
                {formData._id ? `Edit: ${formData.title}` : 'Add New Article / Blog'}
              </span>
              <span className={`las-status-tag ${formData.status}`}>
                {formData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="las-header-center">
          <div className="las-view-toggle-group">
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'edit' ? 'active' : ''}`}
              onClick={() => setViewMode('edit')}
              title="Editor Canvas Only"
            >
              <Edit3 size={14} />
              <span>Editor</span>
            </button>
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Split View (Editor + Live Preview)"
            >
              <Layout size={14} />
              <span>Split Studio</span>
            </button>
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              title="Full Live Public Preview"
            >
              <Eye size={14} />
              <span>Live Preview</span>
            </button>
          </div>

          {viewMode !== 'edit' && (
            <div className="las-view-toggle-group">
              <button 
                type="button" 
                className={`las-view-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
                onClick={() => setPreviewDevice('desktop')}
                title="Desktop View"
              >
                <Monitor size={14} />
              </button>
              <button 
                type="button" 
                className={`las-view-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
                onClick={() => setPreviewDevice('mobile')}
                title="Mobile Phone View"
              >
                <Smartphone size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="las-header-right">
          {formData._id && (
            <button 
              type="button" 
              className="las-btn las-btn-delete"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting || saving}
              title="Permanently remove from database"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          )}

          <button 
            type="button" 
            className="las-btn las-btn-draft"
            onClick={() => handleSaveArticle('draft')}
            disabled={saving}
            title="Save as Draft (Ctrl+S)"
          >
            <Save size={15} />
            <span>Save Draft</span>
          </button>

          <button 
            type="button" 
            className="las-btn las-btn-publish"
            onClick={() => handleSaveArticle('published')}
            disabled={saving}
          >
            <Send size={15} />
            <span>{saving ? 'Publishing...' : formData._id ? 'Update Story' : 'Publish Story'}</span>
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className={`las-workspace ${viewMode}`}>
        {/* LEFT: EDITING CANVAS */}
        {viewMode !== 'preview' && (
          <div className="las-editor-pane">
            <div className="las-editor-inner">

              {/* CARD 1: STORY ESSENTIALS */}
              <div className="las-card">
                <div className="las-card-title-row">
                  <div>
                    <h3 className="las-card-title">
                      <BookOpen size={18} color="#ea580c" />
                      <span>Story Essentials</span>
                    </h3>
                    <div className="las-card-subtitle">
                      Headline, deck, author desk, and content classification
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    {stats.words} words · ~{stats.minutes} min read
                  </div>
                </div>

                {/* Headline input */}
                <input 
                  type="text" 
                  className="las-headline-input"
                  placeholder="Enter compelling headline for this story..."
                  value={formData.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title: val,
                      slug: !prev._id ? slugify(val) : prev.slug
                    }));
                  }}
                  autoFocus
                />

                {/* Subtitle / Standfirst */}
                <textarea 
                  rows={2}
                  className="las-subtitle-input"
                  placeholder="Add an engaging standfirst or subtitle beneath the headline..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                />

                {/* Metadata Row */}
                <div className="las-grid-3" style={{ marginTop: '1.25rem' }}>
                  <div className="las-form-group">
                    <label className="las-label"><Layers size={13} /> Desk / Brand</label>
                    <select 
                      className="las-select"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    >
                      {DESKS.filter(d => d.id !== 'all').map(d => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="las-form-group">
                    <label className="las-label"><Tag size={13} /> Category Desk</label>
                    <select 
                      className="las-select"
                      value={formData.categoryName}
                      onChange={(e) => {
                        const cat = categories.find(c => c.name === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          categoryName: e.target.value,
                          categoryId: cat ? cat._id : prev.categoryId
                        }));
                      }}
                    >
                      {categories.map(c => (
                        <option key={c._id || c.name} value={c.name}>{c.name}</option>
                      ))}
                      {categories.length === 0 && (
                        <>
                          <option value="Startups">Startups</option>
                          <option value="Technology">Technology</option>
                          <option value="AIStory">AI & DeepTech</option>
                          <option value="HerStory">HerStory</option>
                          <option value="FinTech">FinTech</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="las-form-group">
                    <label className="las-label"><User size={13} /> Author Byline</label>
                    <select 
                      className="las-select"
                      value={formData.authorName}
                      onChange={(e) => {
                        const auth = authors.find(a => a.name === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          authorName: e.target.value,
                          authorId: auth ? auth._id : prev.authorId,
                          authorTitle: auth ? (auth.designation || prev.authorTitle) : prev.authorTitle,
                          authorAvatar: auth ? (auth.profileImage || prev.authorAvatar) : prev.authorAvatar
                        }));
                      }}
                    >
                      {authors.map(a => (
                        <option key={a._id || a.name} value={a.name}>{a.name} ({a.designation || 'Staff'})</option>
                      ))}
                      {authors.length === 0 && (
                        <>
                          <option value="Editorial Desk">Editorial Desk</option>
                          <option value="Priya Sharma">Priya Sharma</option>
                          <option value="Vikram Malhotra">Vikram Malhotra</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Slug & Tags row */}
                <div className="las-grid-2" style={{ marginTop: '0.5rem' }}>
                  <div className="las-form-group">
                    <label className="las-label"><Globe size={13} /> URL Slug</label>
                    <input 
                      type="text" 
                      className="las-input"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                      placeholder="custom-story-slug"
                    />
                  </div>

                  <div className="las-form-group">
                    <label className="las-label"><Tag size={13} /> Tags (comma separated)</label>
                    <input 
                      type="text" 
                      className="las-input"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="startups, ai, technology, funding"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: FEATURED HERO BANNER */}
              <div className="las-card">
                <div className="las-card-title-row">
                  <div>
                    <h3 className="las-card-title">
                      <ImageIcon size={18} color="#ea580c" />
                      <span>Featured Cover Image</span>
                    </h3>
                    <div className="las-card-subtitle">
                      Main display banner for article header, homepage spotlights, and social sharing
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="las-btn las-btn-draft"
                    onClick={() => openMediaPicker({ type: 'featured' })}
                  >
                    <Upload size={14} /> Browse Media
                  </button>
                </div>

                <div className="las-cover-stage">
                  <img 
                    src={formData.featuredImage.url} 
                    alt={formData.featuredImage.alt} 
                    className="las-cover-img"
                  />
                  <div className="las-cover-overlay">
                    <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '4px' }}>
                      16:9 Featured Cover
                    </span>
                    <button 
                      type="button" 
                      className="las-btn las-btn-draft"
                      onClick={() => openMediaPicker({ type: 'featured' })}
                    >
                      <ImageIcon size={13} /> Change Cover
                    </button>
                  </div>
                </div>

                <div className="las-grid-2" style={{ marginTop: '1rem' }}>
                  <div className="las-form-group">
                    <label className="las-label">Image URL</label>
                    <input 
                      type="text" 
                      className="las-input"
                      value={formData.featuredImage.url}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        featuredImage: { ...prev.featuredImage, url: e.target.value }
                      }))}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div className="las-form-group">
                    <label className="las-label">Photo Credit / Caption</label>
                    <input 
                      type="text" 
                      className="las-input"
                      value={formData.featuredImage.credit}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        featuredImage: { ...prev.featuredImage, credit: e.target.value, caption: e.target.value }
                      }))}
                      placeholder="Photo: Unsplash / Editorial Studio"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 3: RICH STORY CONTENT & MULTIPLE BLOCKS */}
              <div className="las-blocks-section">
                <div className="las-blocks-header">
                  <div>
                    <h3 className="las-card-title">
                      <Sparkles size={18} color="#ea580c" />
                      <span>Story Content & Multi-Media Blocks</span>
                    </h3>
                    <div className="las-card-subtitle">
                      Add multiple headings, multiple blog images with captions, founder testimonials, and takeaways
                    </div>
                  </div>

                  {/* Add Block Toolbar */}
                  <div className="las-add-block-toolbar">
                    <button 
                      type="button" 
                      className="las-add-block-btn"
                      onClick={() => handleAddBlock('heading')}
                      title="Add Heading 2 or Heading 3"
                    >
                      <Heading2 size={14} /> + Heading
                    </button>
                    <button 
                      type="button" 
                      className="las-add-block-btn"
                      onClick={() => handleAddBlock('paragraph')}
                      title="Add Paragraph text"
                    >
                      <Edit3 size={14} /> + Paragraph
                    </button>
                    <button 
                      type="button" 
                      className="las-add-block-btn"
                      onClick={() => handleAddBlock('image')}
                      title="Add blog image with caption & credit"
                    >
                      <ImageIcon size={14} /> + Blog Image
                    </button>
                    <button 
                      type="button" 
                      className="las-add-block-btn"
                      onClick={() => handleAddBlock('gallery')}
                      title="Add 2-column or 3-column image gallery"
                    >
                      <Layout size={14} /> + Photo Gallery
                    </button>
                    <button 
                      type="button" 
                      className="las-add-block-btn"
                      onClick={() => handleAddBlock('testimonial')}
                      title="Add founder or customer quote testimonial"
                    >
                      <Quote size={14} /> + Testimonial
                    </button>
                    <button 
                      type="button" 
                      className="las-add-block-btn"
                      onClick={() => handleAddBlock('takeaways')}
                      title="Add bulleted key takeaways box"
                    >
                      <Sparkles size={14} /> + Takeaways
                    </button>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="las-blocks-list">
                  {formData.contentBlocks.map((block, index) => (
                    <div key={block.id || index} className="las-block-item">
                      {/* Block Item Header */}
                      <div className="las-block-header">
                        <span className="las-block-type-badge">
                          {block.type === 'heading' && <Heading2 size={13} />}
                          {block.type === 'paragraph' && <Edit3 size={13} />}
                          {block.type === 'image' && <ImageIcon size={13} />}
                          {block.type === 'gallery' && <Layout size={13} />}
                          {block.type === 'testimonial' && <Quote size={13} />}
                          {block.type === 'takeaways' && <Sparkles size={13} />}
                          <span>{block.type} Block #{index + 1}</span>
                        </span>

                        <div className="las-block-actions">
                          <button 
                            type="button" 
                            className="las-block-action-btn"
                            disabled={index === 0}
                            onClick={() => handleMoveBlock(index, -1)}
                            title="Move Block Up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="las-block-action-btn"
                            disabled={index === formData.contentBlocks.length - 1}
                            onClick={() => handleMoveBlock(index, 1)}
                            title="Move Block Down"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="las-block-action-btn"
                            onClick={() => handleDuplicateBlock(block)}
                            title="Duplicate Block"
                          >
                            <Copy size={13} />
                          </button>
                          <button 
                            type="button" 
                            className="las-block-action-btn delete"
                            onClick={() => handleRemoveBlock(block.id)}
                            title="Delete Block"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Block Body Editor */}
                      <div className="las-block-body">
                        {/* 1. HEADING BLOCK */}
                        {block.type === 'heading' && (
                          <div className="las-grid-2">
                            <div className="las-form-group" style={{ gridColumn: 'span 2' }}>
                              <label className="las-label">Heading Text</label>
                              <input 
                                type="text"
                                className="las-input"
                                value={block.text}
                                onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                                placeholder="Enter section heading..."
                              />
                            </div>
                            <div className="las-form-group">
                              <label className="las-label">Heading Level</label>
                              <select 
                                className="las-select"
                                value={block.level || 2}
                                onChange={(e) => handleUpdateBlock(block.id, { level: Number(e.target.value) })}
                              >
                                <option value={2}>Heading 2 (H2 - Major Section)</option>
                                <option value={3}>Heading 3 (H3 - Subsection)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* 2. PARAGRAPH BLOCK */}
                        {block.type === 'paragraph' && (
                          <div className="las-form-group" style={{ margin: 0 }}>
                            <label className="las-label">Paragraph Content</label>
                            <textarea 
                              rows={4}
                              className="las-textarea"
                              value={block.text}
                              onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                              placeholder="Write your editorial analysis or paragraph story..."
                            />
                          </div>
                        )}

                        {/* 3. BLOG IMAGE BLOCK (MULTIPLE IMAGES) */}
                        {block.type === 'image' && (
                          <div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                              <img 
                                src={block.url} 
                                alt={block.caption || 'Blog image preview'} 
                                style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', flexShrink: 0 }} 
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <label className="las-label">Image Source URL</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <input 
                                    type="text" 
                                    className="las-input" 
                                    value={block.url} 
                                    onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })} 
                                    placeholder="https://..." 
                                  />
                                  <button 
                                    type="button" 
                                    className="las-btn las-btn-draft"
                                    onClick={() => openMediaPicker({ type: 'blockImage', blockId: block.id })}
                                  >
                                    <ImageIcon size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="las-grid-3">
                              <div className="las-form-group">
                                <label className="las-label">Caption</label>
                                <input 
                                  type="text" 
                                  className="las-input"
                                  value={block.caption || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                                  placeholder="Photo caption..."
                                />
                              </div>
                              <div className="las-form-group">
                                <label className="las-label">Photo Credit</label>
                                <input 
                                  type="text" 
                                  className="las-input"
                                  value={block.credit || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { credit: e.target.value })}
                                  placeholder="e.g. Photo by Unsplash"
                                />
                              </div>
                              <div className="las-form-group">
                                <label className="las-label">Layout</label>
                                <select 
                                  className="las-select"
                                  value={block.layout || 'standard'}
                                  onChange={(e) => handleUpdateBlock(block.id, { layout: e.target.value })}
                                >
                                  <option value="standard">Standard Article Width</option>
                                  <option value="full-width">Full-Width Feature Display</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. GALLERY BLOCK */}
                        {block.type === 'gallery' && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                              <label className="las-label">Multiple Gallery Images</label>
                              <button 
                                type="button" 
                                className="las-btn las-btn-draft"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => {
                                  const updated = [...(block.images || []), { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', caption: 'New photo' }];
                                  handleUpdateBlock(block.id, { images: updated });
                                }}
                              >
                                <Plus size={12} /> Add Photo
                              </button>
                            </div>

                            {(block.images || []).map((img, i) => (
                              <div key={i} className="las-gallery-item-row">
                                <img src={img.url} alt="" className="las-gallery-thumb" />
                                <input 
                                  type="text" 
                                  className="las-input" 
                                  style={{ flex: 2 }}
                                  value={img.url} 
                                  onChange={(e) => {
                                    const nextImgs = [...block.images];
                                    nextImgs[i] = { ...nextImgs[i], url: e.target.value };
                                    handleUpdateBlock(block.id, { images: nextImgs });
                                  }}
                                  placeholder="Image URL"
                                />
                                <input 
                                  type="text" 
                                  className="las-input" 
                                  style={{ flex: 1 }}
                                  value={img.caption || ''} 
                                  onChange={(e) => {
                                    const nextImgs = [...block.images];
                                    nextImgs[i] = { ...nextImgs[i], caption: e.target.value };
                                    handleUpdateBlock(block.id, { images: nextImgs });
                                  }}
                                  placeholder="Caption"
                                />
                                <button 
                                  type="button" 
                                  className="las-block-action-btn delete"
                                  onClick={() => {
                                    const nextImgs = block.images.filter((_, idx) => idx !== i);
                                    handleUpdateBlock(block.id, { images: nextImgs });
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 5. TESTIMONIAL / QUOTE BLOCK */}
                        {block.type === 'testimonial' && (
                          <div>
                            <div className="las-form-group">
                              <label className="las-label"><Quote size={13} /> Quote Statement</label>
                              <textarea 
                                rows={3}
                                className="las-textarea"
                                value={block.quote}
                                onChange={(e) => handleUpdateBlock(block.id, { quote: e.target.value })}
                                placeholder="Enter impactful quote statement or leader perspective..."
                              />
                            </div>

                            <div className="las-grid-3">
                              <div className="las-form-group">
                                <label className="las-label">Speaker / Founder Name</label>
                                <input 
                                  type="text" 
                                  className="las-input"
                                  value={block.author}
                                  onChange={(e) => handleUpdateBlock(block.id, { author: e.target.value })}
                                  placeholder="e.g. Sridhar Vembu"
                                />
                              </div>
                              <div className="las-form-group">
                                <label className="las-label">Designation & Company</label>
                                <input 
                                  type="text" 
                                  className="las-input"
                                  value={block.designation}
                                  onChange={(e) => handleUpdateBlock(block.id, { designation: e.target.value })}
                                  placeholder="Co-founder & CEO, Zoho"
                                />
                              </div>
                              <div className="las-form-group">
                                <label className="las-label">Rating (Stars)</label>
                                <select 
                                  className="las-select"
                                  value={block.rating || 5}
                                  onChange={(e) => handleUpdateBlock(block.id, { rating: Number(e.target.value) })}
                                >
                                  <option value={5}>5 Stars ★★★★★</option>
                                  <option value={4}>4 Stars ★★★★</option>
                                  <option value={3}>3 Stars ★★★</option>
                                </select>
                              </div>
                            </div>

                            <div className="las-form-group">
                              <label className="las-label">Avatar Image URL</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                  type="text" 
                                  className="las-input"
                                  value={block.avatar || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { avatar: e.target.value })}
                                  placeholder="https://..."
                                />
                                <button 
                                  type="button" 
                                  className="las-btn las-btn-draft"
                                  onClick={() => openMediaPicker({ type: 'testimonialAvatar', blockId: block.id })}
                                >
                                  <ImageIcon size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="las-testimonial-preview-box">
                              <div style={{ fontSize: '0.92rem', fontStyle: 'italic', color: '#0c4a6e', marginBottom: '0.45rem' }}>
                                “{block.quote}”
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 750, color: '#0284c7' }}>
                                — {block.author} <span style={{ color: '#64748b', fontWeight: 500 }}>({block.designation})</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 6. TAKEAWAYS / HIGHLIGHTS BLOCK */}
                        {block.type === 'takeaways' && (
                          <div>
                            <div className="las-form-group">
                              <label className="las-label">Card Title</label>
                              <input 
                                type="text" 
                                className="las-input"
                                value={block.title || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                                placeholder="Key Highlights & Takeaways"
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <label className="las-label">Takeaway Points</label>
                              <button 
                                type="button" 
                                className="las-btn las-btn-draft"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => {
                                  const updated = [...(block.items || []), 'New strategic takeaway point'];
                                  handleUpdateBlock(block.id, { items: updated });
                                }}
                              >
                                <Plus size={12} /> Add Point
                              </button>
                            </div>

                            {(block.items || []).map((it, i) => (
                              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                <input 
                                  type="text" 
                                  className="las-input"
                                  value={it}
                                  onChange={(e) => {
                                    const next = [...block.items];
                                    next[i] = e.target.value;
                                    handleUpdateBlock(block.id, { items: next });
                                  }}
                                />
                                <button 
                                  type="button" 
                                  className="las-block-action-btn delete"
                                  onClick={() => {
                                    const next = block.items.filter((_, idx) => idx !== i);
                                    handleUpdateBlock(block.id, { items: next });
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* RIGHT: LIVE INTERACTIVE PREVIEW */}
        {viewMode !== 'edit' && (
          <div className="las-preview-pane">
            <div className="las-preview-header">
              <div className="las-preview-badge">
                <span className="las-preview-dot" />
                <span>Live Article View ({previewDevice})</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Rendering exact public frontend CSS
              </div>
            </div>

            <div className="las-preview-content">
              <div 
                className="modern-article-wrapper" 
                style={{ 
                  maxWidth: previewDevice === 'mobile' ? '420px' : '100%', 
                  margin: '0 auto',
                  boxShadow: previewDevice === 'mobile' ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
                  borderRadius: previewDevice === 'mobile' ? '24px' : '0',
                  padding: previewDevice === 'mobile' ? '1.5rem 1rem' : '2rem 1.5rem',
                  border: previewDevice === 'mobile' ? '8px solid #0f172a' : 'none'
                }}
              >
                {/* Category Badge */}
                <div className="map-category-badge">
                  {liveArticle.categoryName}
                </div>

                {/* Article Headline */}
                <h1 className="map-title" title={liveArticle.title} style={{ whiteSpace: 'normal' }}>
                  {liveArticle.title}
                </h1>

                {/* Subtitle / Standfirst */}
                {liveArticle.subtitle && (
                  <p className="map-subtitle">
                    {liveArticle.subtitle}
                  </p>
                )}

                {/* Featured Cover Banner */}
                {liveArticle.image && (
                  <div className="map-hero-wrapper" style={{ margin: '1.25rem 0' }}>
                    <img 
                      src={liveArticle.image} 
                      alt={liveArticle.title} 
                      className="map-hero-img"
                    />
                    {liveArticle.photoCredit && (
                      <p className="map-hero-caption">
                        {liveArticle.photoCredit}
                      </p>
                    )}
                  </div>
                )}

                {/* Author Cluster & Date */}
                <div className="map-meta-row" style={{ margin: '1.25rem 0 2rem 0' }}>
                  <div className="map-author-cluster">
                    <img 
                      src={liveArticle.authorAvatar} 
                      alt={liveArticle.authorName} 
                      className="map-author-avatar"
                    />
                    <div className="map-author-info">
                      <div className="map-author-name-row">
                        <span>By {liveArticle.authorName}</span>
                        <span className="map-verified-badge">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      </div>
                      <div className="map-date-read-row">
                        Updated on {liveArticle.publishedDate} • {liveArticle.readDuration}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Content Blocks Live Rendered */}
                <article className="map-body-content">
                  {formData.contentBlocks.map((block, idx) => {
                    const key = block.id || idx;

                    // Heading
                    if (block.type === 'heading') {
                      if (block.level === 3) {
                        return <h3 key={key} className="map-body-subheading">{block.text}</h3>;
                      }
                      return <h2 key={key} className="map-body-heading">{block.text}</h2>;
                    }

                    // Paragraph
                    if (block.type === 'paragraph') {
                      return <p key={key} dangerouslySetInnerHTML={{ __html: block.text }} />;
                    }

                    // Multiple Images
                    if (block.type === 'image') {
                      return (
                        <figure key={key} className={`map-inline-figure ${block.layout || 'standard'}`}>
                          <img src={block.url} alt={block.caption || ''} className="map-inline-img" />
                          {(block.caption || block.credit) && (
                            <figcaption className="map-inline-caption">
                              {block.caption} {block.credit && <span className="map-photo-credit">· Photo: {block.credit}</span>}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }

                    // Gallery Grid
                    if (block.type === 'gallery') {
                      const imgs = Array.isArray(block.images) ? block.images : [];
                      return (
                        <div key={key} className={`map-gallery-grid cols-${imgs.length > 2 ? 3 : 2}`}>
                          {imgs.map((img, i) => (
                            <figure key={i} className="map-gallery-item">
                              <img src={img.url || img} alt="" />
                              {img.caption && <figcaption className="map-gallery-caption">{img.caption}</figcaption>}
                            </figure>
                          ))}
                        </div>
                      );
                    }

                    // Testimonial / Founder Pullquote
                    if (block.type === 'testimonial') {
                      return (
                        <div key={key} className="map-quote-card map-testimonial-card">
                          <div className="map-quote-icon-wrap">
                            <Quote size={20} />
                          </div>
                          <blockquote className="map-quote-text">
                            “{block.quote}”
                          </blockquote>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '1.15rem' }}>
                            {block.avatar && (
                              <img 
                                src={block.avatar} 
                                alt={block.author} 
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                              />
                            )}
                            <div>
                              <div className="map-quote-author" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                                {block.author}
                              </div>
                              <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
                                {block.designation} {block.company ? `· ${block.company}` : ''}
                              </div>
                            </div>
                            {block.rating && (
                              <div style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: '1rem', letterSpacing: '2px' }}>
                                {'★'.repeat(block.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Takeaways Card
                    if (block.type === 'takeaways') {
                      const items = Array.isArray(block.items) ? block.items : [];
                      return (
                        <div key={key} className="map-takeaways-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', margin: '2.25rem 0' }}>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>
                            <Sparkles size={18} /> {block.title || 'Key Highlights & Takeaways'}
                          </h4>
                          <ul className="map-checklist">
                            {items.map((it, i) => (
                              <li key={i} className="map-checklist-item">
                                <span className="map-check-badge"><Check size={13} strokeWidth={3} /></span>
                                <div>{it}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }

                    return null;
                  })}

                  {/* Story Tags */}
                  {liveArticle.tags && liveArticle.tags.length > 0 && (
                    <div className="map-article-tags-wrap" style={{ marginTop: '2.5rem' }}>
                      <span className="map-tags-label">Tags:</span>
                      <div className="map-tags-pills">
                        {liveArticle.tags.map((tg, idx) => (
                          <span key={idx} className="map-article-tag-pill">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: MEDIA PICKER ── */}
      {isMediaPickerOpen && (
        <div className="las-modal-backdrop" onClick={() => setIsMediaPickerOpen(false)}>
          <div 
            className="las-card" 
            style={{ maxWidth: '780px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: '#ffffff', zIndex: 1000001 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="las-card-title-row">
              <h3 className="las-card-title">
                <ImageIcon size={18} color="#ea580c" />
                <span>Media Library Asset Picker</span>
              </h3>
              <button 
                type="button" 
                className="las-block-action-btn"
                onClick={() => setIsMediaPickerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
              {mediaLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <RefreshCw size={28} className="spin" color="#ea580c" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>Loading media files...</p>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <ImageIcon size={38} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontWeight: 700, color: '#334155' }}>No media files uploaded yet</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Enter an image URL directly into the URL input field.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {mediaFiles.map((f, i) => (
                    <div 
                      key={f._id || i}
                      style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc' }}
                      onClick={() => handleSelectMedia(f)}
                    >
                      <img src={f.url} alt="" style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
                      <div style={{ padding: '4px 6px', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.originalName || f.filename}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <button 
                type="button" 
                className="las-btn las-btn-draft"
                onClick={() => setIsMediaPickerOpen(false)}
              >
                Close Picker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM PERMANENT DELETE ── */}
      {showDeleteModal && (
        <div className="las-modal-backdrop" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="las-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="las-delete-icon-box">
              <Trash2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 850, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Permanently Delete Article?
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to permanently delete <strong>"{formData.title}"</strong>? This will permanently remove the article from the MongoDB database, clear it from homepage spots, and unpublish all associated stories. This action cannot be undone.
            </p>
            <div className="las-modal-actions">
              <button 
                type="button" 
                className="las-btn las-btn-draft"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="las-btn las-btn-delete"
                onClick={handleConfirmPermanentDelete}
                disabled={deleting}
                style={{ background: '#dc2626', color: '#ffffff' }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
