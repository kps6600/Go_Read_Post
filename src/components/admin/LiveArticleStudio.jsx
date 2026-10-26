import React, { useState, useEffect, useRef, useMemo } from 'react';
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

// Default initial block for newly created stories: single clean section
const DEFAULT_INITIAL_BLOCKS = [
  {
    id: 'blk_sec_1',
    type: 'section',
    heading: '',
    content: ''
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

  // Advanced metadata collapse toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Hidden file inputs for direct PC upload
  const coverFileInputRef = useRef(null);
  const blockFileInputRef = useRef(null);
  const targetBlockIdRef = useRef(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBlockImage, setUploadingBlockImage] = useState(false);

  // Categories, Authors & Tags
  const [categories, setCategories] = useState(propCategories);
  const [authors, setAuthors] = useState(propAuthors);
  const [availableTags, setAvailableTags] = useState(propTags);
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
          url: article.featuredImage?.url || (typeof article.featuredImage === 'string' ? article.featuredImage : '') || article.image || '',
          alt: article.featuredImage?.alt || article.title || 'Featured story image',
          caption: article.featuredImage?.caption || '',
          credit: article.featuredImage?.credit || article.photoCredit || ''
        },
        readingTime: article.readingTime || article.readTime || '1 min read',
        status: article.status || 'published',
        isFeatured: Boolean(article.isFeatured),
        isTrending: Boolean(article.isTrending),
        isBreaking: Boolean(article.isBreaking),
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
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

    // Brand new clean story for easy editing
    return {
      _id: null,
      title: '',
      slug: '',
      subtitle: '',
      excerpt: '',
      contentType: 'article',
      brand: 'GoReadPost',
      categoryId: '',
      categoryName: 'Startups',
      authorId: '',
      authorName: 'Editorial Desk',
      authorTitle: 'Senior Tech Reporter',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      featuredImage: {
        url: '',
        alt: '',
        caption: '',
        credit: ''
      },
      readingTime: '1 min read',
      status: 'published',
      isFeatured: false,
      isTrending: true,
      isBreaking: false,
      tags: '',
      topics: ['Startups'],
      seo: {
        title: '',
        description: '',
        keywords: '',
        ogImage: ''
      },
      contentBlocks: [{ id: 'blk_sec_' + Date.now().toString(36), type: 'section', heading: '', content: '' }]
    };
  });

  // Load taxonomies (Categories, Authors, Tags) if not provided
  useEffect(() => {
    if (categories.length === 0) {
      TaxonomyService.getCategories().then(res => res && setCategories(Array.isArray(res) ? res : res.data || [])).catch(() => {});
    }
    if (authors.length === 0) {
      TaxonomyService.getAuthors().then(res => res && setAuthors(Array.isArray(res) ? res : res.data || [])).catch(() => {});
    }
    if (availableTags.length === 0) {
      TaxonomyService.getAdminTags().then(res => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (list.length > 0) {
          setAvailableTags(list);
        } else {
          TaxonomyService.getTags().then(tRes => {
            const tList = Array.isArray(tRes) ? tRes : (tRes?.data || []);
            setAvailableTags(tList);
          }).catch(() => {});
        }
      }).catch(() => {
        TaxonomyService.getTags().then(tRes => {
          const tList = Array.isArray(tRes) ? tRes : (tRes?.data || []);
          setAvailableTags(tList);
        }).catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    if (propTags && propTags.length > 0) {
      setAvailableTags(propTags);
    }
  }, [propTags]);

  // Current selected tags array
  const currentTags = useMemo(() => {
    if (!formData.tags) return [];
    if (Array.isArray(formData.tags)) return formData.tags.map(t => t.trim()).filter(Boolean);
    return formData.tags.split(',').map(t => t.trim()).filter(Boolean);
  }, [formData.tags]);

  const handleSelectTagFromDropdown = (tagName) => {
    if (!tagName) return;
    const cleanTag = tagName.trim();
    if (!cleanTag) return;
    const exists = currentTags.some(t => t.toLowerCase() === cleanTag.toLowerCase());
    if (exists) return;
    const updated = [...currentTags, cleanTag];
    setFormData(prev => ({
      ...prev,
      tags: updated.join(', ')
    }));
  };

  const handleRemoveTag = (tagNameToRemove) => {
    const updated = currentTags.filter(t => t.toLowerCase() !== tagNameToRemove.toLowerCase());
    setFormData(prev => ({
      ...prev,
      tags: updated.join(', ')
    }));
  };

  // Compute Word Count & Estimated Read Time
  const stats = useMemo(() => {
    let text = (formData.title || '') + ' ' + (formData.subtitle || '') + ' ';
    (formData.contentBlocks || []).forEach(b => {
      if (b.heading) text += b.heading + ' ';
      if (b.content) text += b.content + ' ';
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

  // Direct PC Image Upload Handler (Cover)
  const handleCoverFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          featuredImage: { ...prev.featuredImage, url: reader.result }
        }));
      };
      reader.readAsDataURL(file);

      const uploaded = await MediaService.uploadFile(file);
      if (uploaded && (uploaded.url || uploaded.path)) {
        const finalUrl = uploaded.url || uploaded.path;
        setFormData(prev => ({
          ...prev,
          featuredImage: { ...prev.featuredImage, url: finalUrl }
        }));
      }
      if (onShowToast) onShowToast('Cover image updated');
    } catch (err) {
      console.warn('Cover upload fallback:', err);
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Direct PC Image Upload Trigger & Handler (Inline Block)
  const triggerBlockImageUpload = (blockId) => {
    targetBlockIdRef.current = blockId;
    if (blockFileInputRef.current) {
      blockFileInputRef.current.click();
    }
  };

  const handleBlockImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    const targetId = targetBlockIdRef.current;
    if (!file || !targetId) return;

    setUploadingBlockImage(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        handleUpdateBlock(targetId, { url: reader.result });
      };
      reader.readAsDataURL(file);

      const uploaded = await MediaService.uploadFile(file);
      if (uploaded && (uploaded.url || uploaded.path)) {
        const finalUrl = uploaded.url || uploaded.path;
        handleUpdateBlock(targetId, { url: finalUrl });
      }
      if (onShowToast) onShowToast('Image uploaded');
    } catch (err) {
      console.warn('Block image upload fallback:', err);
    } finally {
      setUploadingBlockImage(false);
      targetBlockIdRef.current = null;
      if (blockFileInputRef.current) blockFileInputRef.current.value = '';
    }
  };

  // ── Block Operations ──
  const handleAddBlock = (type) => {
    const id = 'blk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    let newBlock = null;

    if (type === 'section') {
      newBlock = {
        id,
        type: 'section',
        heading: '',
        content: ''
      };
    } else if (type === 'image') {
      newBlock = {
        id,
        type: 'image',
        url: '',
        caption: '',
        credit: '',
        alt: '',
        layout: 'standard'
      };
    }

    if (newBlock) {
      setFormData(prev => ({
        ...prev,
        contentBlocks: [...prev.contentBlocks, newBlock]
      }));
      if (onShowToast) onShowToast(type === 'section' ? 'Added new Section' : 'Added new Image');
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

  // Compile blocks into semantic HTML string for database & public feed
  const compileBlocksToHtml = (blocks) => {
    return blocks.map(b => {
      if (b.type === 'section') {
        let sectionHtml = '';
        if (b.heading && b.heading.trim()) {
          sectionHtml += `<h2 class="map-body-heading">${b.heading.trim()}</h2>\n`;
        }
        if (b.content && b.content.trim()) {
          const paras = b.content.split('\n').filter(p => p.trim().length > 0);
          sectionHtml += paras.map(p => `<p>${p.trim()}</p>`).join('\n');
        }
        return sectionHtml;
      }
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
            ← Articles
          </button>
          <div className="las-title-meta">
            <div className="las-studio-badge-row">
              <span className="las-studio-title">
                {formData._id ? `Edit: ${formData.title}` : 'Add New Article'}
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
              <span>Editor</span>
            </button>
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Split View (Editor + Live Preview)"
            >
              <span>Split Studio</span>
            </button>
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              title="Full Live Public Preview"
            >
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
                <span>Desktop</span>
              </button>
              <button 
                type="button" 
                className={`las-view-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
                onClick={() => setPreviewDevice('mobile')}
                title="Mobile Phone View"
              >
                <span>Mobile</span>
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
            <span>Save Draft</span>
          </button>

          <button 
            type="button" 
            className="las-btn las-btn-publish"
            onClick={() => handleSaveArticle('published')}
            disabled={saving}
          >
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
              {/* Hidden file inputs for direct PC upload */}
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverFileUpload}
              />
              <input
                ref={blockFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleBlockImageFileUpload}
              />

              {/* CARD 1: ARTICLE DETAILS */}
              <div className="las-card">
                <div className="las-card-title-row">
                  <div>
                    <h3 className="las-card-title">
                      <span>Article Details</span>
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    {stats.words} words · ~{stats.minutes} min read
                  </div>
                </div>

                {/* Headline input */}
                <input 
                  type="text" 
                  className="las-headline-input"
                  placeholder="Enter article title / headline here..."
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

                {/* Metadata Row: Category & Author */}
                <div className="las-grid-2" style={{ marginTop: '1rem' }}>
                  <div className="las-form-group">
                    <label className="las-label">Category</label>
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
                    <label className="las-label">Author Byline</label>
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

                {/* Collapsible Advanced Toggle */}
                <div style={{ marginTop: '0.85rem' }}>
                  <button
                    type="button"
                    className="las-advanced-toggle-btn"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <span>{showAdvanced ? 'Hide Advanced Settings (URL Slug, Tags)' : 'Advanced Settings (Custom URL Slug, Tags)'}</span>
                  </button>

                  {showAdvanced && (
                    <div className="las-grid-2" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0' }}>
                      <div className="las-form-group">
                        <label className="las-label">URL Slug</label>
                        <input 
                          type="text" 
                          className="las-input"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                          placeholder="custom-story-slug"
                        />
                      </div>

                      <div className="las-form-group">
                        <label className="las-label">Tags</label>
                        
                        {/* Dropdown displaying all tags from the Tag section */}
                        <select 
                          className="las-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleSelectTagFromDropdown(e.target.value);
                            }
                          }}
                        >
                          <option value="">
                            {availableTags.length > 0 
                              ? `-- Select a tag from Tag section (${availableTags.length} tags) --`
                              : '-- Select a tag from Tag section --'}
                          </option>
                          {availableTags.map(t => {
                            const tagName = typeof t === 'string' ? t : (t.name || t.slug);
                            const isSelected = currentTags.some(curr => curr.toLowerCase() === (tagName || '').toLowerCase());
                            return (
                              <option 
                                key={t._id || t.slug || tagName} 
                                value={tagName}
                                disabled={isSelected}
                              >
                                #{tagName} {isSelected ? '(Already added)' : ''}
                              </option>
                            );
                          })}
                          {availableTags.length === 0 && (
                            <>
                              <option value="Startups">#Startups</option>
                              <option value="AI">#AI</option>
                              <option value="Technology">#Technology</option>
                              <option value="Funding">#Funding</option>
                              <option value="FinTech">#FinTech</option>
                              <option value="HerStory">#HerStory</option>
                              <option value="Enterprise">#Enterprise</option>
                              <option value="Venture Capital">#Venture Capital</option>
                            </>
                          )}
                        </select>

                        {/* Selected Tag Chips */}
                        {currentTags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.45rem' }}>
                            {currentTags.map((t, idx) => (
                              <span 
                                key={idx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.78rem',
                                  fontWeight: 650
                                }}
                              >
                                #{t}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(t)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#3b82f6',
                                    fontSize: '0.9rem',
                                    lineHeight: 1,
                                    padding: '0 2px',
                                    fontWeight: 700
                                  }}
                                  title={`Remove ${t}`}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Optional text input for direct comma-separated typing */}
                        <div style={{ marginTop: '0.4rem' }}>
                          <input 
                            type="text" 
                            className="las-input"
                            value={formData.tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="Or type tags (comma separated)..."
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: FEATURED COVER IMAGE */}
              <div className="las-card">
                <div className="las-card-title-row">
                  <div>
                    <h3 className="las-card-title">
                      <span>Featured Cover Image</span>
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="las-btn las-btn-draft"
                      onClick={() => coverFileInputRef.current && coverFileInputRef.current.click()}
                      disabled={uploadingCover}
                    >
                      {uploadingCover ? 'Uploading...' : 'Upload from PC'}
                    </button>
                    <button 
                      type="button" 
                      className="las-btn las-btn-draft"
                      onClick={() => openMediaPicker({ type: 'featured' })}
                    >
                      Browse Media
                    </button>
                  </div>
                </div>

                {formData.featuredImage?.url ? (
                  <div>
                    <div className="las-cover-stage">
                      <img 
                        src={formData.featuredImage.url} 
                        alt={formData.featuredImage.alt || 'Cover image'} 
                        className="las-cover-img"
                      />
                      <div className="las-cover-overlay">
                        <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '4px' }}>
                          Featured Cover
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button" 
                            className="las-btn las-btn-draft"
                            onClick={() => coverFileInputRef.current && coverFileInputRef.current.click()}
                          >
                            Change Image
                          </button>
                          <button 
                            type="button" 
                            className="las-btn las-btn-draft"
                            style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                            onClick={() => setFormData(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, url: '' } }))}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="las-grid-2" style={{ marginTop: '0.85rem' }}>
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
                          placeholder="https://..."
                        />
                      </div>
                      <div className="las-form-group">
                        <label className="las-label">Photo Credit / Caption</label>
                        <input 
                          type="text" 
                          className="las-input"
                          value={formData.featuredImage.credit || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            featuredImage: { ...prev.featuredImage, credit: e.target.value, caption: e.target.value }
                          }))}
                          placeholder="Photo by / Credit"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="las-upload-box">
                    <div className="las-upload-box-actions">
                      <button 
                        type="button" 
                        className="las-upload-main-btn"
                        onClick={() => coverFileInputRef.current && coverFileInputRef.current.click()}
                        disabled={uploadingCover}
                      >
                        {uploadingCover ? 'Uploading...' : 'Upload Cover from Computer'}
                      </button>
                      <button 
                        type="button" 
                        className="las-btn las-btn-draft"
                        onClick={() => openMediaPicker({ type: 'featured' })}
                      >
                        Browse Media Library
                      </button>
                    </div>
                    <div style={{ margin: '0.75rem auto 0.5rem auto', maxWidth: '450px' }}>
                      <input 
                        type="text" 
                        className="las-input" 
                        placeholder="Or paste an image URL directly..." 
                        value={formData.featuredImage.url}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          featuredImage: { ...prev.featuredImage, url: e.target.value }
                        }))}
                        style={{ textAlign: 'center' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3: ARTICLE SECTIONS */}
              <div className="las-blocks-section">
                <div className="las-blocks-header">
                  <div>
                    <h3 className="las-card-title">
                      <span>Article Sections</span>
                    </h3>
                  </div>

                  {/* Primary Add Action Button */}
                  <div className="las-add-block-toolbar">
                    <button 
                      type="button" 
                      className="las-add-block-btn primary"
                      onClick={() => handleAddBlock('section')}
                      title="Add a new Section with Heading & Content"
                    >
                      + Add Section (Heading & Content)
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
                          <span style={{ fontWeight: 750 }}>
                            {block.type === 'section' ? `Section #${index + 1}` : `Image #${index + 1}`}
                          </span>
                        </span>

                        <div className="las-block-actions">
                          <button 
                            type="button" 
                            className="las-block-action-btn"
                            disabled={index === 0}
                            onClick={() => handleMoveBlock(index, -1)}
                            title="Move Up"
                          >
                            Move Up
                          </button>
                          <button 
                            type="button" 
                            className="las-block-action-btn"
                            disabled={index === formData.contentBlocks.length - 1}
                            onClick={() => handleMoveBlock(index, 1)}
                            title="Move Down"
                          >
                            Move Down
                          </button>
                          <button 
                            type="button" 
                            className="las-block-action-btn delete"
                            onClick={() => handleRemoveBlock(block.id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Block Body Editor */}
                      <div className="las-block-body">
                        {/* 1. SECTION BLOCK (HEADING + CONTENT) */}
                        {block.type === 'section' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div>
                              <label className="las-label" style={{ color: '#0f172a', fontWeight: 700 }}>
                                Section Heading
                              </label>
                              <input 
                                type="text"
                                className="las-section-input"
                                value={block.heading || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { heading: e.target.value })}
                                placeholder="Enter heading..."
                              />
                            </div>

                            <div>
                              <label className="las-label" style={{ color: '#0f172a', fontWeight: 700 }}>
                                Section Content
                              </label>
                              <textarea 
                                rows={6}
                                className="las-section-textarea"
                                value={block.content || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                                placeholder="Write or paste your article content here..."
                              />
                            </div>
                          </div>
                        )}

                        {/* 2. BLOG IMAGE BLOCK */}
                        {block.type === 'image' && (
                          <div>
                            {block.url ? (
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                                <img 
                                  src={block.url} 
                                  alt={block.caption || 'Blog image preview'} 
                                  style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1', flexShrink: 0 }} 
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '0.5rem' }}>
                                    <button
                                      type="button"
                                      className="las-btn las-btn-draft"
                                      onClick={() => triggerBlockImageUpload(block.id)}
                                      disabled={uploadingBlockImage}
                                    >
                                      {uploadingBlockImage ? 'Uploading...' : 'Change Image (PC)'}
                                    </button>
                                    <button
                                      type="button"
                                      className="las-btn las-btn-draft"
                                      onClick={() => openMediaPicker({ type: 'blockImage', blockId: block.id })}
                                    >
                                      Media Library
                                    </button>
                                  </div>
                                  <input 
                                    type="text" 
                                    className="las-input" 
                                    value={block.url} 
                                    onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })} 
                                    placeholder="Image URL..." 
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="las-upload-box" style={{ padding: '1rem', marginBottom: '0.85rem' }}>
                                <div className="las-upload-box-actions">
                                  <button
                                    type="button"
                                    className="las-upload-main-btn"
                                    onClick={() => triggerBlockImageUpload(block.id)}
                                    disabled={uploadingBlockImage}
                                  >
                                    <span>{uploadingBlockImage ? 'Uploading...' : 'Upload Image from Computer'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="las-btn las-btn-draft"
                                    onClick={() => openMediaPicker({ type: 'blockImage', blockId: block.id })}
                                  >
                                    Browse Media
                                  </button>
                                </div>
                                <input 
                                  type="text" 
                                  className="las-input" 
                                  placeholder="Or paste an image URL directly..." 
                                  value={block.url || ''} 
                                  onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })}
                                  style={{ textAlign: 'center', maxWidth: '420px', margin: '0 auto' }}
                                />
                              </div>
                            )}

                            <div className="las-grid-2">
                              <div className="las-form-group">
                                <label className="las-label">Caption</label>
                                <input 
                                  type="text" 
                                  className="las-input"
                                  value={block.caption || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                                  placeholder="Caption describing this photo..."
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
                            </div>
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

                {/* Featured Cover Banner */}
                {liveArticle.image && (
                  <div className="map-hero-wrapper" style={{ margin: '1.25rem 0' }}>
                    <img 
                      src={liveArticle.image} 
                      alt={liveArticle.title} 
                      className="map-hero-img"
                    />
                  </div>
                )}

                {/* Article Headline */}
                <h1 className="map-title" title={liveArticle.title} style={{ whiteSpace: 'normal' }}>
                  {liveArticle.title || 'Untitled Headline'}
                </h1>

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
                        <span className="map-verified-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✓
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

                    // Section (Heading + Content)
                    if (block.type === 'section') {
                      const paras = (block.content || '').split('\n').filter(p => p.trim().length > 0);
                      return (
                        <div key={key} className="map-body-section" style={{ marginBottom: '1.75rem' }}>
                          {block.heading && <h2 className="map-body-heading">{block.heading}</h2>}
                          {paras.map((p, pIdx) => (
                            <p key={pIdx}>{p}</p>
                          ))}
                          {!block.heading && paras.length === 0 && (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Empty section...</p>
                          )}
                        </div>
                      );
                    }

                    // Multiple Images
                    if (block.type === 'image') {
                      return (
                        <figure key={key} className={`map-inline-figure ${block.layout || 'standard'}`}>
                          {block.url ? (
                            <img src={block.url} alt={block.caption || ''} className="map-inline-img" />
                          ) : (
                            <div style={{ padding: '2rem', background: '#f1f5f9', textAlign: 'center', color: '#94a3b8', borderRadius: '8px' }}>
                              No image chosen
                            </div>
                          )}
                          {(block.caption || block.credit) && (
                            <figcaption className="map-inline-caption">
                              {block.caption} {block.credit && <span className="map-photo-credit">· Photo: {block.credit}</span>}
                            </figcaption>
                          )}
                        </figure>
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
                <span>Media Library Asset Picker</span>
              </h3>
              <button 
                type="button" 
                className="las-block-action-btn"
                onClick={() => setIsMediaPickerOpen(false)}
              >
                Close
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
              {mediaLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>Loading media files...</p>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
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
            <h3 style={{ fontSize: '1.3rem', fontWeight: 850, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Permanently Delete Article?
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Are you sure you want to permanently delete <strong>"{formData.title}"</strong>? This action cannot be undone.
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
