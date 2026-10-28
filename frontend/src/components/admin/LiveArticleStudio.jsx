import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, RemoveFormatting,
  Image as ImageIcon, UploadCloud, FolderOpen, Trash2, RefreshCw,
  Search, Check, X, ChevronDown, Plus, Tag, Bookmark, Calendar, Clock, Eye, Globe, Share2, Sparkles, Link2
} from 'lucide-react';
import { ArticleService } from '../../services/articleService';
import { TaxonomyService } from '../../services/taxonomyService';
import { MediaService } from '../../services/mediaService';
import TipTapEditor from './TipTapEditor';
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
    content: '',
    images: []
  }
];

// Helper to extract and normalize article content/description into editable section blocks
function extractInitialBlocks(art) {
  if (!art) return [...DEFAULT_INITIAL_BLOCKS];

  // 1. If contentBlocks exist
  if (Array.isArray(art.contentBlocks) && art.contentBlocks.length > 0) {
    const hasSectionBlocks = art.contentBlocks.some(b => b && b.type === 'section');
    if (hasSectionBlocks) {
      return art.contentBlocks.map((b, idx) => {
        if (!b) return null;
        if (b.type === 'section') {
          return {
            id: b.id || `blk_sec_${idx + 1}`,
            type: 'section',
            heading: b.heading || '',
            content: b.content || b.text || '',
            images: Array.isArray(b.images) ? b.images : (b.image ? [b.image] : [])
          };
        }
        if (b.type === 'image') return b;
        const textContent = b.text || b.content || b.html || b.quote || '';
        return {
          id: b.id || `blk_sec_${idx + 1}`,
          type: 'section',
          heading: b.type === 'heading' ? textContent : '',
          content: b.type === 'heading' ? '' : `<p>${textContent}</p>`,
          images: []
        };
      }).filter(Boolean);
    } else {
      const compiledHtml = art.contentBlocks.map(b => {
        if (!b) return '';
        if (b.type === 'heading') return `<h${b.level || 2}>${b.text || ''}</h${b.level || 2}>`;
        if (b.type === 'quote' || b.type === 'testimonial') return `<blockquote><p>${b.quote || b.text || ''}</p></blockquote>`;
        return `<p>${b.text || b.content || b.html || ''}</p>`;
      }).filter(Boolean).join('\n');

      if (compiledHtml) {
        return [{
          id: 'blk_sec_1',
          type: 'section',
          heading: '',
          content: compiledHtml,
          images: []
        }];
      }
    }
  }

  // 2. If art.content is string or array
  if (art.content) {
    let htmlContent = '';
    if (typeof art.content === 'string' && art.content.trim()) {
      htmlContent = art.content.trim();
    } else if (Array.isArray(art.content) && art.content.length > 0) {
      htmlContent = art.content.map(p => (typeof p === 'string' ? `<p>${p}</p>` : '')).filter(Boolean).join('\n');
    }
    if (htmlContent) {
      return [{
        id: 'blk_sec_1',
        type: 'section',
        heading: '',
        content: htmlContent,
        images: []
      }];
    }
  }

  // 3. Structured Story fields (e.g. HerStory, SMBStory, EnterpriseStory)
  const hasStructured = art.leadStoryText || art.leadParagraph || art.section1Body || art.section2Body || art.section3Body1 || art.section2Prose1;
  if (hasStructured) {
    const sections = [];

    // Section 1
    const sec1Heading = art.section1Title || '';
    let sec1Html = '';
    if (art.leadStoryText || art.leadParagraph) {
      sec1Html += `<p>${art.leadStoryText || art.leadParagraph}</p>\n`;
    }
    if (art.section1Lead || art.leadSubtext) {
      sec1Html += `<p>${art.section1Lead || art.leadSubtext}</p>\n`;
    }
    if (art.section1Body) {
      sec1Html += `<p>${art.section1Body}</p>\n`;
    }
    if (art.section1PullquoteText || art.pullquoteText) {
      sec1Html += `<blockquote><p>${art.section1PullquoteText || art.pullquoteText}</p></blockquote>\n`;
    }
    const sec1Images = art.featureImage ? [{ url: art.featureImage, caption: art.featureCaption || '', credit: '' }] : [];

    if (sec1Html || sec1Heading || sec1Images.length > 0) {
      sections.push({
        id: 'blk_sec_1',
        type: 'section',
        heading: sec1Heading,
        content: sec1Html.trim(),
        images: sec1Images
      });
    }

    // Section 2
    const sec2Heading = art.section2Title || '';
    let sec2Html = '';
    if (art.section2Lead) {
      sec2Html += `<p>${art.section2Lead}</p>\n`;
    }
    if (art.section2Body || art.section2Prose1) {
      sec2Html += `<p>${art.section2Body || art.section2Prose1}</p>\n`;
    }
    if (art.section2Prose2) {
      sec2Html += `<p>${art.section2Prose2}</p>\n`;
    }
    if (art.section2ModernQuote) {
      sec2Html += `<blockquote><p>${art.section2ModernQuote}</p></blockquote>\n`;
    }
    if (sec2Html || sec2Heading) {
      sections.push({
        id: 'blk_sec_2',
        type: 'section',
        heading: sec2Heading,
        content: sec2Html.trim(),
        images: []
      });
    }

    // Section 3
    const sec3Heading = art.section3Title || art.dossierTitle || '';
    let sec3Html = '';
    if (art.dossierProse1) {
      sec3Html += `<p>${art.dossierProse1}</p>\n`;
    }
    if (art.dossierProse2) {
      sec3Html += `<p>${art.dossierProse2}</p>\n`;
    }
    if (art.section3Body1) {
      sec3Html += `<p>${art.section3Body1}</p>\n`;
    }
    if (art.section3Body2 || art.section3Prose1) {
      sec3Html += `<p>${art.section3Body2 || art.section3Prose1}</p>\n`;
    }
    if (art.section3Prose2) {
      sec3Html += `<p>${art.section3Prose2}</p>\n`;
    }
    if (art.takeawayText) {
      sec3Html += `<blockquote><p>${art.takeawayText}</p></blockquote>\n`;
    }
    if (Array.isArray(art.takeaways) && art.takeaways.length > 0) {
      sec3Html += `<ul>${art.takeaways.map(t => `<li>${t}</li>`).join('')}</ul>\n`;
    }
    if (sec3Html || sec3Heading) {
      sections.push({
        id: 'blk_sec_3',
        type: 'section',
        heading: sec3Heading,
        content: sec3Html.trim(),
        images: []
      });
    }

    if (sections.length > 0) {
      return sections;
    }
  }

  // 4. If description, body, story, fullStory
  const genericBody = art.description || art.body || art.story || art.fullStory;
  if (genericBody && typeof genericBody === 'string' && genericBody.trim()) {
    const formatted = /<[a-z][\s\S]*>/i.test(genericBody)
      ? genericBody
      : genericBody.split('\n\n').filter(Boolean).map(p => `<p>${p}</p>`).join('\n');
    return [{
      id: 'blk_sec_1',
      type: 'section',
      heading: '',
      content: formatted,
      images: []
    }];
  }

  // 5. Excerpt / summary fallback
  const fallbackSummary = art.excerpt || art.summary || art.subtitle;
  if (fallbackSummary && typeof fallbackSummary === 'string' && fallbackSummary.trim()) {
    return [{
      id: 'blk_sec_1',
      type: 'section',
      heading: '',
      content: `<p>${fallbackSummary.trim()}</p>`,
      images: []
    }];
  }

  return [...DEFAULT_INITIAL_BLOCKS];
}

const FALLBACK_TOPICS = [
  'Startups', 'Technology', 'AI & DeepTech', 'Venture Capital', 'FinTech',
  'Enterprise & SaaS', 'HerStory', 'SMB & MSME', 'CleanTech', 'Policy & Governance'
];

const FALLBACK_TAGS = [
  'Startups', 'AI', 'Technology', 'Funding', 'FinTech', 'HerStory',
  'Enterprise', 'Venture Capital', 'Innovation', 'Growth'
];

// Reusable Searchable Multi-Select Component for Topics & Tags
function MultiSelectField({
  label,
  icon: IconComponent,
  placeholder,
  options = [],
  selectedValues = [],
  onSelect,
  onRemove,
  onClearAll,
  colorTheme = 'indigo',
  prefix = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const normalizedOptions = useMemo(() => {
    const set = new Set();
    options.forEach(opt => {
      const name = typeof opt === 'string' ? opt.trim() : ((opt?.name || opt?.slug || '').trim());
      if (name) set.add(name);
    });
    // Ensure selected values are also present as options
    selectedValues.forEach(val => {
      if (val && val.trim()) set.add(val.trim());
    });
    return Array.from(set);
  }, [options, selectedValues]);

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(opt => opt.toLowerCase().includes(q));
  }, [normalizedOptions, searchQuery]);

  const canAddCustom = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return false;
    return !normalizedOptions.some(opt => opt.toLowerCase() === q.toLowerCase());
  }, [searchQuery, normalizedOptions]);

  const isSelected = (val) => {
    return selectedValues.some(curr => curr.toLowerCase() === val.toLowerCase());
  };

  const handleToggle = (val) => {
    if (isSelected(val)) {
      onRemove(val);
    } else {
      onSelect(val);
    }
  };

  const theme = colorTheme === 'indigo' ? {
    accent: '#4f46e5',
    chipBg: '#f5f3ff',
    chipBorder: '#ddd6fe',
    chipText: '#4338ca',
    chipRemove: '#6366f1',
    badgeBg: '#4f46e5',
    focusGlow: 'rgba(79, 70, 229, 0.12)'
  } : {
    accent: '#2563eb',
    chipBg: '#eff6ff',
    chipBorder: '#bfdbfe',
    chipText: '#1d4ed8',
    chipRemove: '#3b82f6',
    badgeBg: '#2563eb',
    focusGlow: 'rgba(37, 99, 235, 0.12)'
  };

  return (
    <div className="las-multiselect-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <label className="las-label" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {IconComponent && <IconComponent size={14} color={theme.accent} />}
          <span>{label}</span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '1px 7px',
            borderRadius: '999px',
            background: selectedValues.length > 0 ? theme.badgeBg : '#e2e8f0',
            color: selectedValues.length > 0 ? '#ffffff' : '#64748b'
          }}>
            {selectedValues.length}
          </span>
        </label>
        {selectedValues.length > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 650,
              cursor: 'pointer',
              padding: 0
            }}
            title={`Clear all selected ${label.toLowerCase()}`}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Trigger Button */}
      <div
        className={`las-select ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: '42px',
          padding: '0.5rem 0.85rem',
          borderRadius: '8px',
          border: isOpen ? `1.5px solid ${theme.accent}` : '1px solid #cbd5e1',
          background: '#ffffff',
          cursor: 'pointer',
          boxSizing: 'border-box',
          boxShadow: isOpen ? `0 0 0 3px ${theme.focusGlow}` : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{
          fontSize: '0.86rem',
          color: selectedValues.length > 0 ? '#0f172a' : '#94a3b8',
          fontWeight: selectedValues.length > 0 ? 600 : 450,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingRight: '6px'
        }}>
          {selectedValues.length === 0 
            ? placeholder 
            : `${selectedValues.length} ${label} selected (click to edit)`}
        </span>
        <ChevronDown 
          size={15} 
          color="#64748b" 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.18s ease',
            flexShrink: 0
          }} 
        />
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08)',
            zIndex: 220,
            padding: '0.65rem',
            boxSizing: 'border-box'
          }}
        >
          {/* Search box inside dropdown */}
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search 
              size={14} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              autoFocus
              placeholder={`Search ${label.toLowerCase()} or type custom...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  e.preventDefault();
                  onSelect(searchQuery.trim());
                  setSearchQuery('');
                }
              }}
              style={{
                width: '100%',
                height: '35px',
                padding: '0 0.75rem 0 2rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Quick Add Custom Button */}
          {canAddCustom && (
            <button
              type="button"
              onClick={() => {
                onSelect(searchQuery.trim());
                setSearchQuery('');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.65rem',
                marginBottom: '0.45rem',
                borderRadius: '6px',
                background: theme.chipBg,
                border: `1px dashed ${theme.chipBorder}`,
                color: theme.chipText,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Plus size={14} />
              <span>Add "{searchQuery.trim()}" as custom {label.toLowerCase()}</span>
            </button>
          )}

          {/* Options Checklist */}
          <div style={{ maxHeight: '190px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredOptions.map((opt, idx) => {
              const checked = isSelected(opt);
              return (
                <div
                  key={`${opt}-${idx}`}
                  onClick={() => handleToggle(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.42rem 0.65rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: checked ? theme.chipBg : 'transparent',
                    transition: 'background 0.12s ease',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!checked) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!checked) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}} // handled by parent div onClick
                      style={{ cursor: 'pointer', accentColor: theme.accent }}
                    />
                    <span style={{
                      fontSize: '0.84rem',
                      fontWeight: checked ? 700 : 500,
                      color: checked ? theme.chipText : '#334155'
                    }}>
                      {prefix}{opt}
                    </span>
                  </label>
                  {checked && <Check size={14} color={theme.accent} />}
                </div>
              );
            })}
            {filteredOptions.length === 0 && !canAddCustom && (
              <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                No {label.toLowerCase()} found
              </div>
            )}
          </div>

          {/* Dropdown Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.5rem',
            marginTop: '0.45rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              {selectedValues.length} selected
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '0.3rem 0.85rem',
                borderRadius: '6px',
                background: theme.accent,
                border: 'none',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Selected Chips Bar */}
      {selectedValues.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.45rem' }}>
          {selectedValues.map((val, idx) => (
            <span
              key={`${val}-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: theme.chipBg,
                border: `1px solid ${theme.chipBorder}`,
                color: theme.chipText,
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <span>{prefix}{val}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(val);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.chipRemove,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Remove ${val}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

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
  // View mode layout state ('edit' | 'preview')
  const [viewMode, setViewMode] = useState('edit');

  // Advanced metadata collapse toggle (always open by default)
  const [showAdvanced, setShowAdvanced] = useState(true);


  // Hidden file inputs for direct PC upload
  const coverFileInputRef = useRef(null);
  const blockFileInputRef = useRef(null);
  const multiImageFileInputRef = useRef(null);
  const sectionImageFileInputRef = useRef(null);
  const titleTextareaRef = useRef(null);
  const targetBlockIdRef = useRef(null);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBlockImage, setUploadingBlockImage] = useState(false);
  const [uploadingMultipleImages, setUploadingMultipleImages] = useState(false);
  const [uploadingSectionImage, setUploadingSectionImage] = useState(false);
  const [selectedMediaItems, setSelectedMediaItems] = useState([]);

  // Categories, Authors, Topics & Tags
  const [categories, setCategories] = useState(propCategories);
  const [authors, setAuthors] = useState(propAuthors);
  const [availableTopics, setAvailableTopics] = useState(propTopics);
  const [availableTags, setAvailableTags] = useState(propTags);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');

  const getPresetTime = (presetType) => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    if (presetType === 'tomorrow_9am') {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    } else if (presetType === 'tomorrow_6pm') {
      d.setDate(d.getDate() + 1);
      d.setHours(18, 0, 0, 0);
    } else if (presetType === 'in_2_days') {
      d.setDate(d.getDate() + 2);
      d.setHours(9, 0, 0, 0);
    } else if (presetType === 'next_monday') {
      const day = d.getDay();
      const daysUntilMonday = ((8 - day) % 7) || 7;
      d.setDate(d.getDate() + daysUntilMonday);
      d.setHours(9, 0, 0, 0);
    }
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleOpenScheduleModal = () => {
    if (formData.scheduledAt) {
      try {
        const d = new Date(formData.scheduledAt);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setScheduleDateTime(formatted);
      } catch (e) {
        setScheduleDateTime(getPresetTime('tomorrow_9am'));
      }
    } else {
      setScheduleDateTime(getPresetTime('tomorrow_9am'));
    }
    setShowScheduleModal(true);
  };

  // SEO helper sync actions
  const handleSyncSeoTitle = () => {
    const raw = (formData.title || '').replace(/<[^>]*>/g, '').trim();
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, title: raw }
    }));
    if (onShowToast) onShowToast('Synced Meta Title with article headline!');
  };

  const handleSyncSeoDescription = () => {
    const desc = (formData.excerpt || formData.subtitle || '').trim();
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, description: desc }
    }));
    if (onShowToast) onShowToast('Synced Meta Description with excerpt!');
  };

  const handleAutoFillCanonical = () => {
    const cleanSlug = formData.slug ? slugify(formData.slug) : slugify(formData.title.replace(/<[^>]*>/g, ''));
    const url = `https://goreadpost.com/article/${cleanSlug || 'story'}`;
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, canonicalUrl: url }
    }));
    if (onShowToast) onShowToast(`Canonical URL set to ${url}`);
  };

  const handleSyncOgTitle = () => {
    const title = (formData.seo?.title || formData.title || '').replace(/<[^>]*>/g, '').trim();
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, ogTitle: title }
    }));
    if (onShowToast) onShowToast('Synced Social Share Title!');
  };

  const handleSyncOgDescription = () => {
    const desc = (formData.seo?.description || formData.excerpt || formData.subtitle || '').trim();
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, ogDescription: desc }
    }));
    if (onShowToast) onShowToast('Synced Social Share Description!');
  };

  const handleUseCoverForOg = () => {
    const cover = formData.featuredImage?.url || 
                  (formData.contentBlocks?.find(b => (b.images && b.images.length > 0) || b.image)?.images?.[0]?.url) || '';
    if (!cover) {
      alert('Please add a featured or section image first.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, ogImage: cover }
    }));
    if (onShowToast) onShowToast('Set cover image as Social Share Image!');
  };

  const renderSeoFieldsBlock = (isStandaloneView = false) => {
    const displaySlug = formData.slug || slugify(formData.title.replace(/<[^>]*>/g, '')) || 'custom-story-slug';
    const serpTitle = formData.seo?.title || (formData.title ? formData.title.replace(/<[^>]*>/g, '') : 'Story Headline — GoReadPost Editorial');
    const serpDesc = formData.seo?.description || formData.excerpt || formData.subtitle || 'Read the full in-depth editorial coverage on GoReadPost. Stay updated with the latest in tech, business and startups.';
    const ogImage = formData.seo?.ogImage || formData.featuredImage?.url || '';

    return (
      <div className="las-seo-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* CARD A: GOOGLE SEARCH & META TAGS */}
        <div className="las-seo-card">
          <div className="las-seo-header">
            <div className="las-seo-title-group">
              <div className="las-seo-icon-badge">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="las-seo-title">Search Engine Optimization (Google SERP)</h4>
                <p className="las-seo-subtitle">Configure search snippet titles, descriptions, and crawl metadata</p>
              </div>
            </div>
            <span className="las-seo-badge">Google SERP Ready</span>
          </div>

          {/* Live Google Search Preview */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="las-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
              <span>Live Google Search Result Preview</span>
            </label>
            <div className="las-google-serp-box">
              <div className="las-google-serp-url">
                <span style={{ color: '#202124', fontWeight: 700 }}>GoReadPost</span>
                <span style={{ color: '#5f6368' }}>› article › {displaySlug}</span>
              </div>
              <div className="las-google-serp-title">
                {serpTitle}
              </div>
              <div className="las-google-serp-desc">
                {serpDesc}
              </div>
            </div>
          </div>

          {/* Meta Title */}
          <div className="las-form-group" style={{ marginBottom: '1.1rem' }}>
            <div className="las-seo-field-header">
              <label className="las-label" style={{ margin: 0 }}>
                <span>Meta Title Tag</span>
              </label>
              <div className="las-seo-actions-row">
                <span className={`las-seo-char-counter ${(formData.seo?.title || '').length > 60 ? 'danger' : 'good'}`}>
                  {(formData.seo?.title || '').length}/60 chars
                </span>
                <button type="button" className="las-seo-sync-btn" onClick={handleSyncSeoTitle}>
                  <Sparkles size={11} /> Sync Title
                </button>
              </div>
            </div>
            <input 
              type="text" 
              className="las-input"
              placeholder={formData.title.replace(/<[^>]*>/g, '') || 'Search optimized title with high-intent keywords...'}
              value={formData.seo?.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
            />
          </div>

          {/* Meta Description */}
          <div className="las-form-group" style={{ marginBottom: '1.1rem' }}>
            <div className="las-seo-field-header">
              <label className="las-label" style={{ margin: 0 }}>
                <span>Meta Description Tag</span>
              </label>
              <div className="las-seo-actions-row">
                <span className={`las-seo-char-counter ${(formData.seo?.description || '').length > 160 ? 'danger' : 'good'}`}>
                  {(formData.seo?.description || '').length}/160 chars
                </span>
                <button type="button" className="las-seo-sync-btn" onClick={handleSyncSeoDescription}>
                  <Sparkles size={11} /> Sync Excerpt
                </button>
              </div>
            </div>
            <textarea 
              rows="3"
              className="las-input"
              style={{ height: 'auto', padding: '0.75rem', resize: 'vertical' }}
              placeholder={formData.excerpt || formData.subtitle || 'Concise editorial summary for Google snippets and search results...'}
              value={formData.seo?.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
            />
          </div>

          {/* Keywords & Canonical Grid */}
          <div className="las-grid-2">
            <div className="las-form-group">
              <label className="las-label">
                <span>Target Keywords</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginLeft: '6px' }}>(Comma separated)</span>
              </label>
              <input 
                type="text" 
                className="las-input"
                placeholder="e.g. startup, funding 2026, tech trends"
                value={formData.seo?.keywords || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, keywords: e.target.value } }))}
              />
            </div>

            <div className="las-form-group">
              <div className="las-seo-field-header">
                <label className="las-label" style={{ margin: 0 }}>
                  <span>Canonical URL</span>
                </label>
                <button type="button" className="las-seo-sync-btn" onClick={handleAutoFillCanonical}>
                  <Link2 size={11} /> Auto Fill
                </button>
              </div>
              <input 
                type="text" 
                className="las-input"
                placeholder={`https://goreadpost.com/article/${displaySlug}`}
                value={formData.seo?.canonicalUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, canonicalUrl: e.target.value } }))}
              />
            </div>
          </div>
        </div>

        {/* CARD B: SOCIAL SHARE & OPEN GRAPH (OG TAGS) */}
        <div className="las-seo-card">
          <div className="las-seo-header">
            <div className="las-seo-title-group">
              <div className="las-seo-icon-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                <Share2 size={20} />
              </div>
              <div>
                <h4 className="las-seo-title">Social Share & OpenGraph Cards</h4>
                <p className="las-seo-subtitle">Control card previews when shared on WhatsApp, LinkedIn, X (Twitter), and Facebook</p>
              </div>
            </div>
            <span className="las-seo-badge" style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>OpenGraph 2.0</span>
          </div>

          {/* Live Social Share Card Preview */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="las-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
              <span>Live Social Card Preview (LinkedIn / Twitter / WhatsApp)</span>
            </label>
            <div className="las-social-card-preview">
              <div className="las-social-card-img-wrap">
                {ogImage ? (
                  <img src={ogImage} alt="Social share card" className="las-social-card-img" />
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No Social Image Selected (will fall back to cover photo)
                  </div>
                )}
              </div>
              <div className="las-social-card-content">
                <div className="las-social-card-domain">goreadpost.com</div>
                <div className="las-social-card-title">
                  {formData.seo?.ogTitle || serpTitle}
                </div>
                <div className="las-social-card-desc">
                  {formData.seo?.ogDescription || serpDesc}
                </div>
              </div>
            </div>
          </div>

          {/* Social Title & Image Grid */}
          <div className="las-grid-2">
            <div className="las-form-group">
              <div className="las-seo-field-header">
                <label className="las-label" style={{ margin: 0 }}>
                  <span>Social Title (og:title)</span>
                </label>
                <button type="button" className="las-seo-sync-btn" onClick={handleSyncOgTitle}>
                  <Sparkles size={11} /> Sync Title
                </button>
              </div>
              <input 
                type="text" 
                className="las-input"
                placeholder={serpTitle}
                value={formData.seo?.ogTitle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogTitle: e.target.value } }))}
              />
            </div>

            <div className="las-form-group">
              <div className="las-seo-field-header">
                <label className="las-label" style={{ margin: 0 }}>
                  <span>Social Image URL (og:image)</span>
                </label>
                <button type="button" className="las-seo-sync-btn" onClick={handleUseCoverForOg}>
                  <ImageIcon size={11} /> Use Cover Photo
                </button>
              </div>
              <input 
                type="text" 
                className="las-input"
                placeholder="https://images.unsplash.com/..."
                value={formData.seo?.ogImage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogImage: e.target.value } }))}
              />
            </div>
          </div>

          <div className="las-form-group" style={{ marginTop: '1rem' }}>
            <div className="las-seo-field-header">
              <label className="las-label" style={{ margin: 0 }}>
                <span>Social Description (og:description)</span>
              </label>
              <button type="button" className="las-seo-sync-btn" onClick={handleSyncOgDescription}>
                <Sparkles size={11} /> Sync Description
              </button>
            </div>
            <textarea 
              rows="2"
              className="las-input"
              style={{ height: 'auto', padding: '0.65rem', resize: 'vertical' }}
              placeholder={serpDesc}
              value={formData.seo?.ogDescription || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogDescription: e.target.value } }))}
            />
          </div>
        </div>

        {isStandaloneView && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="las-card-btn-secondary" 
              onClick={() => setViewMode('edit')}
              style={{ padding: '0.6rem 1.25rem' }}
            >
              ← Back to Article Editor
            </button>
          </div>
        )}
      </div>
    );
  };


  const handleConfirmSchedule = () => {
    if (!scheduleDateTime) {
      alert('Please select a valid publication date and time.');
      return;
    }
    const chosen = new Date(scheduleDateTime);
    if (isNaN(chosen.getTime())) {
      alert('Invalid date format.');
      return;
    }
    if (chosen.getTime() <= Date.now()) {
      alert('Scheduled time must be in the future.');
      return;
    }
    setShowScheduleModal(false);
    handleSaveArticle('scheduled', chosen.toISOString());
  };

  // Media picker modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState({ type: 'featured', blockId: null });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState(() => {
    if (article) {
      const initialBlocks = extractInitialBlocks(article);

      return {
        _id: article._id || article.id || null,
        title: article.title || '',
        slug: article.slug || slugify(article.title || ''),
        subtitle: article.subtitle || article.excerpt || article.description || '',
        excerpt: article.excerpt || article.summary || article.description || '',
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
        scheduledAt: article.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : '',
        status: article.status || 'published',
        isFeatured: Boolean(article.isFeatured),
        isTrending: Boolean(article.isTrending),
        isBreaking: Boolean(article.isBreaking),
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
        topics: Array.isArray(article.topics) ? article.topics : ['Startups'],
        titleAlign: article.titleAlign || 'left',
        seo: {
          title: article.seo?.title || article.title || '',
          description: article.seo?.description || article.description || article.subtitle || article.excerpt || '',
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
      scheduledAt: '',
      status: 'published',
      isFeatured: false,
      isTrending: true,
      isBreaking: false,
      tags: '',
      topics: ['Startups'],
      titleAlign: 'left',
      seo: {
        title: '',
        description: '',
        keywords: '',
        ogImage: ''
      },
      contentBlocks: [{ id: 'blk_sec_' + Date.now().toString(36), type: 'section', heading: '', content: '', images: [] }]
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
    if (availableTopics.length === 0) {
      TaxonomyService.getAdminTopics().then(res => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (list.length > 0) {
          setAvailableTopics(list);
        } else {
          TaxonomyService.getTopics().then(tRes => {
            const tList = Array.isArray(tRes) ? tRes : (tRes?.data || []);
            setAvailableTopics(tList);
          }).catch(() => {});
        }
      }).catch(() => {
        TaxonomyService.getTopics().then(tRes => {
          const tList = Array.isArray(tRes) ? tRes : (tRes?.data || []);
          setAvailableTopics(tList);
        }).catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    if (propTags && propTags.length > 0) {
      setAvailableTags(propTags);
    }
  }, [propTags]);

  useEffect(() => {
    if (propTopics && propTopics.length > 0) {
      setAvailableTopics(propTopics);
    }
  }, [propTopics]);

  // Current selected topics array
  const currentTopics = useMemo(() => {
    if (!formData.topics) return [];
    if (Array.isArray(formData.topics)) {
      return formData.topics.map(t => typeof t === 'string' ? t.trim() : (t?.name || '')).filter(Boolean);
    }
    if (typeof formData.topics === 'string') {
      return formData.topics.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
  }, [formData.topics]);

  const handleSelectTopic = (topicName) => {
    if (!topicName) return;
    const clean = topicName.trim();
    if (!clean) return;
    if (currentTopics.some(t => t.toLowerCase() === clean.toLowerCase())) return;
    const updated = [...currentTopics, clean];
    setFormData(prev => ({
      ...prev,
      topics: updated
    }));
  };

  const handleRemoveTopic = (topicNameToRemove) => {
    const updated = currentTopics.filter(t => t.toLowerCase() !== topicNameToRemove.toLowerCase());
    setFormData(prev => ({
      ...prev,
      topics: updated
    }));
  };

  const handleClearAllTopics = () => {
    setFormData(prev => ({ ...prev, topics: [] }));
  };

  // Current selected tags array
  const currentTags = useMemo(() => {
    if (!formData.tags) return [];
    if (Array.isArray(formData.tags)) return formData.tags.map(t => t.trim()).filter(Boolean);
    return formData.tags.split(',').map(t => t.trim()).filter(Boolean);
  }, [formData.tags]);

  const handleSelectTag = (tagName) => {
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

  const handleClearAllTags = () => {
    setFormData(prev => ({ ...prev, tags: '' }));
  };

  // Auto-resize headline textarea dynamically
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = `${Math.max(48, titleTextareaRef.current.scrollHeight)}px`;
    }
  }, [formData.title]);

  // Rich formatting actions for headline
  const applyHeadlineFormat = (action) => {
    const el = titleTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = formData.title || '';

    if (action === 'align-left') {
      setFormData(prev => ({ ...prev, titleAlign: 'left' }));
      return;
    }
    if (action === 'align-center') {
      setFormData(prev => ({ ...prev, titleAlign: 'center' }));
      return;
    }

    if (start !== end) {
      const selected = text.substring(start, end);
      let transformed = selected;

      if (action === 'bold') {
        transformed = selected.startsWith('<strong>') && selected.endsWith('</strong>')
          ? selected.slice(8, -9)
          : `<strong>${selected}</strong>`;
      } else if (action === 'italic') {
        transformed = selected.startsWith('<em>') && selected.endsWith('</em>')
          ? selected.slice(4, -5)
          : `<em>${selected}</em>`;
      } else if (action === 'underline') {
        transformed = selected.startsWith('<u>') && selected.endsWith('</u>')
          ? selected.slice(3, -4)
          : `<u>${selected}</u>`;
      } else if (action === 'title-case') {
        transformed = selected.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
      } else if (action === 'uppercase') {
        transformed = selected.toUpperCase();
      } else if (action === 'lowercase') {
        transformed = selected.toLowerCase();
      } else if (action === 'clear') {
        transformed = selected.replace(/<[^>]*>/g, '');
      }

      const nextTitle = text.substring(0, start) + transformed + text.substring(end);
      setFormData(prev => ({
        ...prev,
        title: nextTitle,
        slug: !prev._id ? slugify(nextTitle.replace(/<[^>]*>/g, '')) : prev.slug
      }));

      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + transformed.length);
      }, 0);
    } else {
      if (action === 'title-case') {
        const nextTitle = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
        setFormData(prev => ({ ...prev, title: nextTitle }));
      } else if (action === 'uppercase') {
        setFormData(prev => ({ ...prev, title: text.toUpperCase() }));
      } else if (action === 'lowercase') {
        setFormData(prev => ({ ...prev, title: text.toLowerCase() }));
      } else if (action === 'clear') {
        const nextTitle = text.replace(/<[^>]*>/g, '');
        setFormData(prev => ({ ...prev, title: nextTitle }));
      }
    }
  };

  // Rich formatting actions for Section Headings
  const applySectionHeadingFormat = (blockId, action) => {
    const block = (formData.contentBlocks || []).find(b => b.id === blockId);
    if (!block) return;
    const text = block.heading || '';

    if (action === 'h2' || action === 'h3') {
      const level = action === 'h2' ? 2 : 3;
      handleUpdateBlock(blockId, { headingLevel: level });
      return;
    }

    if (action === 'align-left') {
      handleUpdateBlock(blockId, { headingAlign: 'left' });
      return;
    }
    if (action === 'align-center') {
      handleUpdateBlock(blockId, { headingAlign: 'center' });
      return;
    }

    const inputEl = document.getElementById(`las-heading-input-${blockId}`);
    const start = inputEl ? inputEl.selectionStart : 0;
    const end = inputEl ? inputEl.selectionEnd : text.length;

    if (inputEl && start !== end) {
      const selected = text.substring(start, end);
      let transformed = selected;

      if (action === 'bold') {
        transformed = selected.startsWith('<strong>') && selected.endsWith('</strong>')
          ? selected.slice(8, -9)
          : `<strong>${selected}</strong>`;
      } else if (action === 'italic') {
        transformed = selected.startsWith('<em>') && selected.endsWith('</em>')
          ? selected.slice(4, -5)
          : `<em>${selected}</em>`;
      } else if (action === 'underline') {
        transformed = selected.startsWith('<u>') && selected.endsWith('</u>')
          ? selected.slice(3, -4)
          : `<u>${selected}</u>`;
      } else if (action === 'title-case') {
        transformed = selected.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
      } else if (action === 'uppercase') {
        transformed = selected.toUpperCase();
      } else if (action === 'lowercase') {
        transformed = selected.toLowerCase();
      } else if (action === 'clear') {
        transformed = selected.replace(/<[^>]*>/g, '');
      }

      const nextHeading = text.substring(0, start) + transformed + text.substring(end);
      handleUpdateBlock(blockId, { heading: nextHeading });

      setTimeout(() => {
        if (inputEl) {
          inputEl.focus();
          inputEl.setSelectionRange(start, start + transformed.length);
        }
      }, 0);
    } else {
      if (action === 'bold') {
        const nextHeading = text.startsWith('<strong>') && text.endsWith('</strong>')
          ? text.slice(8, -9)
          : (text ? `<strong>${text}</strong>` : '');
        handleUpdateBlock(blockId, { heading: nextHeading });
      } else if (action === 'italic') {
        const nextHeading = text.startsWith('<em>') && text.endsWith('</em>')
          ? text.slice(4, -5)
          : (text ? `<em>${text}</em>` : '');
        handleUpdateBlock(blockId, { heading: nextHeading });
      } else if (action === 'underline') {
        const nextHeading = text.startsWith('<u>') && text.endsWith('</u>')
          ? text.slice(3, -4)
          : (text ? `<u>${text}</u>` : '');
        handleUpdateBlock(blockId, { heading: nextHeading });
      } else if (action === 'title-case') {
        handleUpdateBlock(blockId, { heading: text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()) });
      } else if (action === 'uppercase') {
        handleUpdateBlock(blockId, { heading: text.toUpperCase() });
      } else if (action === 'lowercase') {
        handleUpdateBlock(blockId, { heading: text.toLowerCase() });
      } else if (action === 'clear') {
        handleUpdateBlock(blockId, { heading: text.replace(/<[^>]*>/g, '') });
      }
    }
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
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [formData.title, formData.subtitle, formData.contentBlocks]);

  // Track if reading time was manually edited by the user
  const [isReadingTimeCustom, setIsReadingTimeCustom] = useState(() => {
    return Boolean(article?.readingTime || article?.readTime);
  });

  // Update reading time automatically unless user manually customized it
  useEffect(() => {
    if (!isReadingTimeCustom) {
      setFormData(prev => ({ ...prev, readingTime: `~${stats.minutes} min read` }));
    }
  }, [stats.minutes, isReadingTimeCustom]);

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

  // Direct PC Multiple Images Upload Handler
  const handleMultiImageFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingMultipleImages(true);
    if (onShowToast) onShowToast(`Uploading ${files.length} images...`);

    try {
      const uploadedBlocks = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const res = await MediaService.uploadFile(file);
          const finalUrl = res && (res.url || res.path) ? (res.url || res.path) : '';
          if (finalUrl) {
            uploadedBlocks.push({
              id: 'blk_img_' + Date.now().toString(36) + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
              type: 'image',
              url: finalUrl,
              alt: file.name.replace(/\.[^/.]+$/, ''),
              caption: '',
              credit: 'GoReadPost Media',
              layout: 'standard'
            });
          }
        } catch (uploadErr) {
          console.warn(`Failed to upload ${file.name}:`, uploadErr);
        }
      }

      if (uploadedBlocks.length > 0) {
        setFormData(prev => ({
          ...prev,
          contentBlocks: [...prev.contentBlocks, ...uploadedBlocks]
        }));
        if (onShowToast) onShowToast(`Successfully added ${uploadedBlocks.length} images to article!`);
      }
    } finally {
      setUploadingMultipleImages(false);
      if (multiImageFileInputRef.current) multiImageFileInputRef.current.value = '';
    }
  };

  // Direct PC Section Image Upload Trigger & Handlers
  const triggerSectionImageUpload = (blockId) => {
    setTargetSectionId(blockId);
    if (sectionImageFileInputRef.current) {
      sectionImageFileInputRef.current.click();
    }
  };

  const handleSectionImageFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const blockId = targetSectionId;
    if (files.length === 0 || !blockId) return;

    setUploadingSectionImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const uploaded = await MediaService.uploadFile(file);
          const finalUrl = uploaded && (uploaded.url || uploaded.path) ? (uploaded.url || uploaded.path) : '';
          if (finalUrl) {
            const newImg = {
              url: finalUrl,
              caption: '',
              credit: 'GoReadPost Media',
              alt: file.name.replace(/\.[^/.]+$/, '')
            };
            setFormData(prev => ({
              ...prev,
              contentBlocks: prev.contentBlocks.map(b => {
                if (b.id !== blockId) return b;
                const existingImages = Array.isArray(b.images) && b.images.length > 0
                  ? b.images
                  : (b.image?.url ? [b.image] : (typeof b.image === 'string' && b.image ? [{ url: b.image }] : []));
                return {
                  ...b,
                  image: newImg,
                  images: [...existingImages, newImg]
                };
              })
            }));
          }
        } catch (err) {
          console.warn('Failed to upload section image:', err);
        }
      }
      if (onShowToast) onShowToast(files.length > 1 ? `Added ${files.length} images to section` : 'Section image uploaded');
    } finally {
      setUploadingSectionImage(false);
      setTargetSectionId(null);
      if (sectionImageFileInputRef.current) sectionImageFileInputRef.current.value = '';
    }
  };

  const handleRemoveSectionImage = (blockId, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map(b => {
        if (b.id !== blockId) return b;
        const existing = Array.isArray(b.images) ? [...b.images] : (b.image ? [b.image] : []);
        const updated = existing.filter((_, idx) => idx !== imageIndex);
        return {
          ...b,
          image: updated.length > 0 ? updated[0] : null,
          images: updated
        };
      })
    }));
  };

  const handleUpdateSectionImage = (blockId, imageIndex, updates) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map(b => {
        if (b.id !== blockId) return b;
        const existing = Array.isArray(b.images) && b.images.length > 0 
          ? [...b.images] 
          : (b.image ? [{ ...b.image }] : []);
        if (!existing[imageIndex]) existing[imageIndex] = { url: '' };
        existing[imageIndex] = { ...existing[imageIndex], ...updates };
        return {
          ...b,
          image: existing[0],
          images: existing
        };
      })
    }));
  };

  const handleToggleSectionImagePosition = (blockId, pos) => {
    handleUpdateBlock(blockId, { imagePosition: pos });
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
        content: '',
        images: []
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
          const level = b.headingLevel || 2;
          const align = b.headingAlign ? ` style="text-align: ${b.headingAlign};"` : '';
          sectionHtml += `<h${level} class="map-body-heading"${align}>${b.heading.trim()}</h${level}>\n`;
        }

        // Section Images
        const secImages = Array.isArray(b.images) && b.images.length > 0
          ? b.images
          : (b.image?.url ? [b.image] : (typeof b.image === 'string' && b.image ? [{ url: b.image }] : []));

        const imagesHtml = secImages.map(img => {
          const captionHtml = (img.caption || img.credit)
            ? `<figcaption class="map-inline-caption">${img.caption || ''} ${img.credit ? `(Photo: ${img.credit})` : ''}</figcaption>`
            : '';
          return `<figure class="map-inline-figure standard"><img src="${img.url || img}" alt="${img.caption || img.alt || 'Section image'}" />${captionHtml}</figure>`;
        }).join('\n');

        if (b.imagePosition !== 'bottom' && imagesHtml) {
          sectionHtml += imagesHtml + '\n';
        }

        if (b.content && b.content.trim()) {
          const hasHtml = /<[a-z][\s\S]*>/i.test(b.content);
          if (hasHtml) {
            sectionHtml += b.content.trim() + '\n';
          } else {
            const paras = b.content.split('\n').filter(p => p.trim().length > 0);
            sectionHtml += paras.map(p => `<p>${p.trim()}</p>`).join('\n');
          }
        }

        if (b.imagePosition === 'bottom' && imagesHtml) {
          sectionHtml += imagesHtml + '\n';
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
  const handleSaveArticle = async (targetStatus = 'published', targetScheduledAt = null) => {
    if (!formData.title.trim()) {
      alert('Please provide a title for the story.');
      return;
    }

    setSaving(true);
    try {
      const compiledHtml = compileBlocksToHtml(formData.contentBlocks);
      const cleanSlug = formData.slug ? slugify(formData.slug) : slugify(formData.title.replace(/<[^>]*>/g, ''));

      // Auto-derive excerpt from first substantial paragraph if not manually entered
      let derivedExcerpt = (formData.excerpt || '').trim() || (formData.subtitle || '').trim();
      if (!derivedExcerpt && Array.isArray(formData.contentBlocks)) {
        const titleNorm = (formData.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const b of formData.contentBlocks) {
          const raw = b.content || b.text || '';
          if (raw) {
            const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const cleanNorm = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean && clean.length > 20 && !cleanNorm.startsWith(titleNorm) && !titleNorm.startsWith(cleanNorm)) {
              derivedExcerpt = clean.slice(0, 240);
              break;
            }
          }
        }
        if (!derivedExcerpt) {
          for (const b of formData.contentBlocks) {
            const raw = b.content || b.text || '';
            if (raw) {
              const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              if (clean && clean.length > 15) {
                derivedExcerpt = clean.slice(0, 240);
                break;
              }
            }
          }
        }
      }

      const payload = {
        title: formData.title.trim(),
        slug: cleanSlug,
        subtitle: formData.subtitle.trim(),
        titleAlign: formData.titleAlign || 'left',
        excerpt: derivedExcerpt,
        contentType: formData.contentType || 'article',
        brand: formData.brand || 'GoReadPost',
        categoryName: formData.categoryName || 'Startups',
        categoryId: formData.categoryId || null,
        authorName: formData.authorName || 'Editorial Desk',
        authorTitle: formData.authorTitle || 'Senior Staff Reporter',
        authorAvatar: formData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        featuredImage: {
          url: formData.featuredImage?.url || (formData.contentBlocks?.find(b => (b.images && b.images.length > 0) || b.image)?.images?.[0]?.url) || (typeof formData.contentBlocks?.find(b => b.image)?.image === 'string' ? formData.contentBlocks?.find(b => b.image)?.image : formData.contentBlocks?.find(b => b.image)?.image?.url) || '',
          alt: formData.featuredImage?.alt || formData.title,
          caption: formData.featuredImage?.caption || '',
          credit: formData.featuredImage?.credit || 'GoReadPost Bureau'
        },
        readingTime: formData.readingTime || `${stats.minutes} min read`,
        status: targetStatus,
        scheduledAt: targetStatus === 'scheduled' 
          ? (targetScheduledAt || formData.scheduledAt || new Date(Date.now() + 86400000).toISOString()) 
          : null,
        publishedAt: targetStatus === 'published' 
          ? (formData.publishedAt || new Date().toISOString()) 
          : (targetStatus === 'scheduled' ? null : (formData.publishedAt || null)),
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
        if (onShowToast) {
          if (targetStatus === 'scheduled') {
            const dateStr = new Date(payload.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            onShowToast(`Story scheduled for ${dateStr}!`);
          } else {
            onShowToast(`Successfully updated "${formData.title}" (${targetStatus})`);
          }
        }
      } else {
        result = await ArticleService.createArticle(payload);
        if (onShowToast) {
          if (targetStatus === 'scheduled') {
            const dateStr = new Date(payload.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            onShowToast(`Story created and scheduled for ${dateStr}!`);
          } else {
            onShowToast(`Successfully published "${formData.title}" to database!`);
          }
        }
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
    setSelectedMediaItems([]);
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
      setIsMediaPickerOpen(false);
    } else if (mediaPickerTarget.type === 'blockImage') {
      handleUpdateBlock(mediaPickerTarget.blockId, {
        url: file.url,
        alt: file.altText || file.originalName || 'Blog Image',
        credit: file.credit || 'GoReadPost Media'
      });
      setIsMediaPickerOpen(false);
    } else if (mediaPickerTarget.type === 'sectionImage') {
      const blockId = mediaPickerTarget.blockId;
      const newImg = {
        url: file.url,
        caption: '',
        credit: file.credit || 'GoReadPost Media',
        alt: file.altText || file.originalName || 'Section Image'
      };
      setFormData(prev => ({
        ...prev,
        contentBlocks: prev.contentBlocks.map(b => {
          if (b.id !== blockId) return b;
          const existingImages = Array.isArray(b.images) && b.images.length > 0
            ? b.images
            : (b.image?.url ? [b.image] : (typeof b.image === 'string' && b.image ? [{ url: b.image }] : []));
          return {
            ...b,
            image: newImg,
            images: [...existingImages, newImg]
          };
        })
      }));
      setIsMediaPickerOpen(false);
      if (onShowToast) onShowToast('Image added to section');
    } else if (mediaPickerTarget.type === 'testimonialAvatar') {
      handleUpdateBlock(mediaPickerTarget.blockId, {
        avatar: file.url
      });
      setIsMediaPickerOpen(false);
    } else if (mediaPickerTarget.type === 'multiImage') {
      setSelectedMediaItems(prev => {
        const exists = prev.some(item => (item._id || item.url) === (file._id || file.url));
        if (exists) {
          return prev.filter(item => (item._id || item.url) !== (file._id || file.url));
        } else {
          return [...prev, file];
        }
      });
    }
  };

  const handleInsertMultipleFromMediaPicker = () => {
    if (selectedMediaItems.length === 0) return;
    const newBlocks = selectedMediaItems.map((file, i) => ({
      id: 'blk_img_' + Date.now().toString(36) + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
      type: 'image',
      url: file.url,
      alt: file.altText || file.originalName || 'Article Image',
      caption: '',
      credit: file.credit || 'GoReadPost Media',
      layout: 'standard'
    }));

    setFormData(prev => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, ...newBlocks]
    }));
    if (onShowToast) onShowToast(`Added ${newBlocks.length} images from Media Library`);
    setIsMediaPickerOpen(false);
    setSelectedMediaItems([]);
  };

  // Live article simulation object matching public ArticlePage structure
  const liveArticle = useMemo(() => {
    return {
      title: formData.title || 'Untitled Headline',
      subtitle: formData.subtitle || '',
      categoryName: (formData.categoryName || 'STARTUPS').toUpperCase(),
      categorySlug: slugify(formData.categoryName || 'startups'),
      image: formData.featuredImage?.url || (formData.contentBlocks?.find(b => (b.images && b.images.length > 0) || b.image)?.images?.[0]?.url) || (typeof formData.contentBlocks?.find(b => b.image)?.image === 'string' ? formData.contentBlocks?.find(b => b.image)?.image : formData.contentBlocks?.find(b => b.image)?.image?.url) || '',
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

  // Check if liveArticle.image is already rendered in any content section
  const isCoverRenderedInBody = useMemo(() => {
    if (!liveArticle?.image || !Array.isArray(formData?.contentBlocks)) return false;
    const cleanCover = liveArticle.image.trim().replace(/^https?:\/\/[^\/]+/, '').split('?')[0];
    if (!cleanCover) return false;

    for (const block of formData.contentBlocks) {
      if (!block) continue;
      if (block.type === 'section') {
        if (Array.isArray(block.images)) {
          for (const img of block.images) {
            const u = (img?.url || (typeof img === 'string' ? img : '')).trim();
            if (u && (u === liveArticle.image || u.replace(/^https?:\/\/[^\/]+/, '').split('?')[0] === cleanCover)) {
              return true;
            }
          }
        }
        const singleSecImg = (block.image?.url || (typeof block.image === 'string' ? block.image : '')).trim();
        if (singleSecImg && (singleSecImg === liveArticle.image || singleSecImg.replace(/^https?:\/\/[^\/]+/, '').split('?')[0] === cleanCover)) {
          return true;
        }
      } else if (block.type === 'image' && block.url) {
        const u = block.url.trim();
        if (u === liveArticle.image || u.replace(/^https?:\/\/[^\/]+/, '').split('?')[0] === cleanCover) {
          return true;
        }
      }
    }
    return false;
  }, [liveArticle?.image, formData?.contentBlocks]);

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
              title="Main Page Article Editor"
            >
              <span>Main Page</span>
            </button>
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'seo' ? 'active' : ''}`}
              onClick={() => setViewMode('seo')}
              title="SEO & Social Metadata"
            >
              <Globe size={13} style={{ marginRight: '4px' }} />
              <span>SEO</span>
            </button>
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              title="Full Live View"
            >
              <Eye size={13} style={{ marginRight: '4px' }} />
              <span>Live View</span>
            </button>
          </div>
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
            className={`las-btn las-btn-schedule ${formData.status === 'scheduled' ? 'active' : ''}`}
            onClick={handleOpenScheduleModal}
            disabled={saving}
            title="Schedule Story to publish automatically at a future time"
          >
            <Clock size={14} />
            <span>
              {formData.status === 'scheduled' && formData.scheduledAt
                ? 'Scheduled'
                : 'Schedule'}
            </span>
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
        {/* TAB 1: MAIN PAGE (ARTICLE EDITOR) */}
        {viewMode === 'edit' && (
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
                  <div className="las-stats-badge">
                    <input 
                      type="text"
                      className="las-stats-input"
                      value={formData.readingTime ?? `~${stats.minutes} min read`}
                      onChange={(e) => {
                        setIsReadingTimeCustom(true);
                        setFormData(prev => ({ ...prev, readingTime: e.target.value }));
                      }}
                      title="Click to edit estimated reading time"
                      placeholder={`~${stats.minutes} min read`}
                    />
                    {isReadingTimeCustom && (
                      <button
                        type="button"
                        className="las-stats-reset-btn"
                        title="Reset to auto-calculated time"
                        onClick={() => {
                          setIsReadingTimeCustom(false);
                          setFormData(prev => ({ ...prev, readingTime: `~${stats.minutes} min read` }));
                        }}
                      >
                        ↺ auto
                      </button>
                    )}
                  </div>
                </div>

                {/* Rich Headline Formatting Toolbar */}
                <div className="las-headline-toolbar">
                  <div className="las-headline-tools-group">
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('bold')}
                      title="Bold selection (<strong>)"
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('italic')}
                      title="Italic selection (<em>)"
                    >
                      <Italic size={15} />
                    </button>
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('underline')}
                      title="Underline selection (<u>)"
                    >
                      <Underline size={15} />
                    </button>
                    <span className="las-headline-tool-sep" />
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('title-case')}
                      title="Title Case (Capitalize Words)"
                      style={{ fontSize: '0.78rem', fontWeight: 800 }}
                    >
                      Aa
                    </button>
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('uppercase')}
                      title="UPPERCASE"
                      style={{ fontSize: '0.74rem', fontWeight: 800 }}
                    >
                      AA
                    </button>
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('lowercase')}
                      title="lowercase"
                      style={{ fontSize: '0.74rem', fontWeight: 700 }}
                    >
                      aa
                    </button>
                    <span className="las-headline-tool-sep" />
                    <button
                      type="button"
                      className={`las-headline-tool-btn ${(formData.titleAlign || 'left') === 'left' ? 'active' : ''}`}
                      onClick={() => applyHeadlineFormat('align-left')}
                      title="Align Left"
                    >
                      <AlignLeft size={15} />
                    </button>
                    <button
                      type="button"
                      className={`las-headline-tool-btn ${formData.titleAlign === 'center' ? 'active' : ''}`}
                      onClick={() => applyHeadlineFormat('align-center')}
                      title="Align Center"
                    >
                      <AlignCenter size={15} />
                    </button>
                    <span className="las-headline-tool-sep" />
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('clear')}
                      title="Clear HTML tags from title"
                    >
                      <RemoveFormatting size={15} />
                    </button>
                  </div>

                  <div className="las-headline-counter">
                    <span>
                      {(formData.title || '').replace(/<[^>]*>/g, '').length} chars
                    </span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span>
                      {(formData.title || '').replace(/<[^>]*>/g, '').trim() ? (formData.title || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0} words
                    </span>
                  </div>
                </div>

                {/* Auto-expanding Headline Textarea */}
                <textarea 
                  ref={titleTextareaRef}
                  rows={1}
                  className="las-headline-input"
                  placeholder="Enter article title / headline here..."
                  value={formData.title}
                  style={{ textAlign: formData.titleAlign || 'left' }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title: val,
                      slug: !prev._id ? slugify(val.replace(/<[^>]*>/g, '')) : prev.slug
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
                    <span>{showAdvanced ? 'Hide Advanced Settings (URL Slug, Topics, Tags)' : 'Advanced Settings (URL Slug, Topics, Tags)'}</span>
                  </button>

                  {showAdvanced && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* URL Slug */}
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

                      {/* Topics & Tags Row (Multi-Select) */}
                      <div className="las-grid-2">
                        {/* Topics Multi-Select */}
                        <div className="las-form-group">
                          <MultiSelectField
                            label="Topics"
                            icon={Bookmark}
                            placeholder="-- Select topics (multi-select) --"
                            options={availableTopics.length > 0 ? availableTopics : FALLBACK_TOPICS}
                            selectedValues={currentTopics}
                            onSelect={handleSelectTopic}
                            onRemove={handleRemoveTopic}
                            onClearAll={handleClearAllTopics}
                            colorTheme="indigo"
                            prefix=""
                          />
                        </div>

                        {/* Tags Multi-Select */}
                        <div className="las-form-group">
                          <MultiSelectField
                            label="Tags"
                            icon={Tag}
                            placeholder={availableTags.length > 0 
                              ? `-- Select tags (${availableTags.length} tags) --`
                              : '-- Select tags (multi-select) --'}
                            options={availableTags.length > 0 ? availableTags : FALLBACK_TAGS}
                            selectedValues={currentTags}
                            onSelect={handleSelectTag}
                            onRemove={handleRemoveTag}
                            onClearAll={handleClearAllTags}
                            colorTheme="blue"
                            prefix="#"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: ARTICLE SECTIONS */}
              <div className="las-blocks-section">
                <div className="las-blocks-header">
                  <div>
                    <h3 className="las-card-title">
                      <span>Article Sections</span>
                    </h3>
                  </div>

                  {/* Hidden multi-image file input */}
                  <input
                    ref={multiImageFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleMultiImageFileUpload}
                  />

                  {/* Hidden section image file input */}
                  <input
                    ref={sectionImageFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleSectionImageFileUpload}
                  />

                  {/* Primary Add Action Toolbar */}
                  <div className="las-add-block-toolbar">
                    <button 
                      type="button" 
                      className="las-add-block-btn primary"
                      onClick={() => handleAddBlock('section')}
                      title="Add a new Section with Heading & Content"
                    >
                      + Add Section
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
                        {/* 1. SECTION BLOCK (SINGLE UNIFIED EDITABLE CANVAS + INTEGRATED SECTION MEDIA) */}
                        {block.type === 'section' && (() => {
                          const secImages = Array.isArray(block.images) && block.images.length > 0
                            ? block.images
                            : (block.image?.url ? [block.image] : (typeof block.image === 'string' && block.image ? [{ url: block.image }] : []));

                          return (
                            <div className="las-section-block-wrapper">
                              {/* Section Content (TipTap Editor) */}
                              <div className="las-section-tiptap">
                                <TipTapEditor
                                  key={block.id}
                                  content={block.content ? (block.heading ? `<h2>${block.heading}</h2>\n${block.content}` : block.content) : (block.heading ? `<h2>${block.heading}</h2>` : '')}
                                  onChange={(html) => handleUpdateBlock(block.id, { content: html, heading: '' })}
                                  onOpenMediaPicker={() => openMediaPicker({ type: 'sectionImage', blockId: block.id })}
                                  placeholder="Write your section content... Use H2 or H3 from the toolbar above for headings, format text, insert images, lists, and quotes."
                                />
                              </div>

                              {/* Section Media (Image Attachment) */}
                              <div className="las-section-media-container">
                                {secImages.length === 0 ? (
                                  <div className="las-section-media-empty">
                                    <div className="las-section-media-empty-info">
                                      <ImageIcon size={16} className="las-section-media-icon" />
                                      <span className="las-section-media-empty-text">Section Image (Optional)</span>
                                    </div>
                                    <div className="las-section-media-btn-row">
                                      <button
                                        type="button"
                                        className="las-section-media-btn upload"
                                        onClick={() => triggerSectionImageUpload(block.id)}
                                        disabled={uploadingSectionImage && targetSectionId === block.id}
                                        title="Upload image from your computer to this section"
                                      >
                                        <UploadCloud size={14} />
                                        <span>{uploadingSectionImage && targetSectionId === block.id ? 'Uploading...' : 'Add Image (PC)'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="las-section-media-btn library"
                                        onClick={() => openMediaPicker({ type: 'sectionImage', blockId: block.id })}
                                        title="Select image from Media Library"
                                      >
                                        <FolderOpen size={14} />
                                        <span>Media Library</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="las-section-media-attached">
                                    <div className="las-section-media-attached-header">
                                      <div className="las-section-media-header-left">
                                        <ImageIcon size={16} className="las-section-media-icon active" />
                                        <span className="las-section-media-attached-title">
                                          Section {secImages.length === 1 ? 'Image' : `Images (${secImages.length})`}
                                        </span>
                                      </div>
                                      <div className="las-section-media-header-right">
                                        <div className="las-section-pos-toggle">
                                          <span className="las-pos-label">Position:</span>
                                          <button
                                            type="button"
                                            className={`las-pos-btn ${(block.imagePosition || 'top') === 'top' ? 'active' : ''}`}
                                            onClick={() => handleToggleSectionImagePosition(block.id, 'top')}
                                            title="Display image at top of section"
                                          >
                                            Top
                                          </button>
                                          <button
                                            type="button"
                                            className={`las-pos-btn ${block.imagePosition === 'bottom' ? 'active' : ''}`}
                                            onClick={() => handleToggleSectionImagePosition(block.id, 'bottom')}
                                            title="Display image below section text"
                                          >
                                            Bottom
                                          </button>
                                        </div>
                                        <button
                                          type="button"
                                          className="las-section-add-more-btn"
                                          onClick={() => triggerSectionImageUpload(block.id)}
                                          title="Add another image to this section"
                                        >
                                          <Plus size={13} />
                                          <span>Add Another (PC)</span>
                                        </button>
                                        <button
                                          type="button"
                                          className="las-section-add-more-btn"
                                          onClick={() => openMediaPicker({ type: 'sectionImage', blockId: block.id })}
                                          title="Add another from Media Library"
                                        >
                                          <FolderOpen size={13} />
                                          <span>Media Library</span>
                                        </button>
                                      </div>
                                    </div>

                                    <div className="las-section-images-list">
                                      {secImages.map((img, imgIdx) => (
                                        <div key={imgIdx} className="las-section-image-card">
                                          <div className="las-section-image-thumb-wrap">
                                            <img 
                                              src={img.url || img} 
                                              alt={img.caption || `Section image ${imgIdx + 1}`} 
                                              className="las-section-image-thumb" 
                                            />
                                          </div>
                                          <div className="las-section-image-meta">
                                            <div className="las-section-meta-row">
                                              <input
                                                type="text"
                                                className="las-section-meta-input"
                                                placeholder="Image caption / description..."
                                                value={img.caption || ''}
                                                onChange={(e) => handleUpdateSectionImage(block.id, imgIdx, { caption: e.target.value })}
                                              />
                                              <input
                                                type="text"
                                                className="las-section-meta-input credit"
                                                placeholder="Photo credit / source..."
                                                value={img.credit || ''}
                                                onChange={(e) => handleUpdateSectionImage(block.id, imgIdx, { credit: e.target.value })}
                                              />
                                              <button
                                                type="button"
                                                className="las-section-img-remove-btn"
                                                onClick={() => handleRemoveSectionImage(block.id, imgIdx)}
                                                title="Remove image from section"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0 0.85rem 0' }}>
                                <button
                                  type="button"
                                  className="las-card-btn-primary"
                                  onClick={() => triggerBlockImageUpload(block.id)}
                                  disabled={uploadingBlockImage}
                                >
                                  <UploadCloud size={15} />
                                  <span>{uploadingBlockImage ? 'Uploading...' : 'Upload Image from Computer'}</span>
                                </button>
                                <button
                                  type="button"
                                  className="las-card-btn-secondary"
                                  onClick={() => openMediaPicker({ type: 'blockImage', blockId: block.id })}
                                >
                                  <FolderOpen size={15} />
                                  <span>Browse Media Library</span>
                                </button>
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

        {/* TAB 2: DEDICATED SEO PAGE TAB */}
        {viewMode === 'seo' && (
          <div className="las-editor-pane" style={{ background: '#f8fafc', width: '100%', flex: 1 }}>
            <div className="las-editor-inner" style={{ maxWidth: '960px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}>
                    <Globe size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#0f172a', margin: '0 0 3px 0' }}>SEO & Social Share Studio</h2>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>Configure search engine snippets, target keywords, canonical URLs, and OpenGraph social previews</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="las-card-btn-secondary"
                  onClick={() => setViewMode('edit')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  ← Back to Main Page
                </button>
              </div>

              {renderSeoFieldsBlock(true)}
            </div>
          </div>
        )}

        {/* TAB 3: LIVE VIEW TAB */}
        {viewMode === 'preview' && (
          <div className="las-preview-pane">
            <div className="las-preview-header">
              <div className="las-preview-badge">
                <span className="las-preview-dot" />
                <span>Live Article View</span>
              </div>
            </div>

            <div className="las-preview-content">
              <div 
                className="modern-article-wrapper" 
                style={{ 
                  maxWidth: '100%', 
                  margin: '0 auto',
                  padding: '2rem 1.5rem'
                }}
              >
                {/* Category Badge */}
                <div className="map-category-badge">
                  {liveArticle.categoryName}
                </div>

                {/* Featured Cover Banner (Only if not already displayed in sections) */}
                {liveArticle.image && !isCoverRenderedInBody && (
                  <div className="map-hero-wrapper" style={{ margin: '1.25rem 0' }}>
                    <img 
                      src={liveArticle.image} 
                      alt={liveArticle.title} 
                      className="map-hero-img"
                    />
                  </div>
                )}

                {/* Article Headline */}
                <h1 
                  className="map-title" 
                  title={liveArticle.title} 
                  style={{ whiteSpace: 'normal', textAlign: formData.titleAlign || 'left' }}
                  dangerouslySetInnerHTML={{ __html: liveArticle.title || 'Untitled Headline' }}
                />

                {/* Subtitle / Standfirst */}
                {liveArticle.subtitle && (
                  <p 
                    className="map-subtitle" 
                    style={{ 
                      fontSize: '1.18rem', 
                      color: '#475569', 
                      lineHeight: 1.5, 
                      margin: '0.5rem 0 1.25rem',
                      textAlign: formData.titleAlign || 'left' 
                    }}
                  >
                    {liveArticle.subtitle}
                  </p>
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

                    // Section (Heading + Image(s) + Content)
                    if (block.type === 'section') {
                      const hasHtml = /<[a-z][\s\S]*>/i.test(block.content || '');
                      const paras = !hasHtml ? (block.content || '').split('\n').filter(p => p.trim().length > 0) : [];
                      const secImages = Array.isArray(block.images) && block.images.length > 0
                        ? block.images
                        : (block.image?.url ? [block.image] : (typeof block.image === 'string' && block.image ? [{ url: block.image }] : []));

                      const renderSecImages = () => (
                        secImages.map((img, sIdx) => (
                          <figure key={sIdx} className="map-inline-figure standard" style={{ margin: '1.25rem 0' }}>
                            <img src={img.url || img} alt={img.caption || 'Section image'} className="map-inline-img" />
                            {(img.caption || img.credit) && (
                              <figcaption className="map-inline-caption">
                                {img.caption} {img.credit ? `(Photo: ${img.credit})` : ''}
                              </figcaption>
                            )}
                          </figure>
                        ))
                      );

                      return (
                        <div key={key} className="map-body-section" style={{ marginBottom: '1.75rem' }}>
                          {block.heading && (
                            (block.headingLevel || 2) === 3 ? (
                              <h3 
                                className="map-body-heading" 
                                style={{ textAlign: block.headingAlign || 'left' }}
                                dangerouslySetInnerHTML={{ __html: block.heading }}
                              />
                            ) : (
                              <h2 
                                className="map-body-heading" 
                                style={{ textAlign: block.headingAlign || 'left' }}
                                dangerouslySetInnerHTML={{ __html: block.heading }}
                              />
                            )
                          )}
                          {block.imagePosition !== 'bottom' && renderSecImages()}
                          {hasHtml ? (
                            <div className="map-body-rich-content" dangerouslySetInnerHTML={{ __html: block.content }} />
                          ) : (
                            paras.map((p, pIdx) => (
                              <p key={pIdx}>{p}</p>
                            ))
                          )}
                          {block.imagePosition === 'bottom' && renderSecImages()}
                          {!block.heading && secImages.length === 0 && (!block.content || (!hasHtml && paras.length === 0)) && (
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
                  {mediaFiles.map((f, i) => {
                    const isSelected = selectedMediaItems.some(item => (item._id || item.url) === (f._id || f.url));
                    return (
                      <div 
                        key={f._id || i}
                        style={{ 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0', 
                          cursor: 'pointer', 
                          background: isSelected ? '#eff6ff' : '#f8fafc',
                          position: 'relative',
                          boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => handleSelectMedia(f)}
                      >
                        <img src={f.url} alt="" style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#2563eb',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                          }}>
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{ padding: '4px 6px', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isSelected ? 700 : 500 }}>
                          {f.originalName || f.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              {mediaPickerTarget.type === 'multiImage' ? (
                <>
                  <span style={{ fontSize: '0.82rem', fontWeight: 650, color: '#475569' }}>
                    {selectedMediaItems.length} images selected (click images to toggle)
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="las-btn las-btn-draft"
                      onClick={() => setIsMediaPickerOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="las-card-btn-primary"
                      disabled={selectedMediaItems.length === 0}
                      onClick={handleInsertMultipleFromMediaPicker}
                    >
                      Insert Selected Images ({selectedMediaItems.length})
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Click an image to select it</span>
                  <button 
                    type="button" 
                    className="las-btn las-btn-draft"
                    onClick={() => setIsMediaPickerOpen(false)}
                  >
                    Close Picker
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM PERMANENT DELETE ── */}
      {/* ── MODAL: SCHEDULE ARTICLE ── */}
      {showScheduleModal && (
        <div className="las-modal-backdrop" onClick={() => !saving && setShowScheduleModal(false)}>
          <div className="las-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="las-schedule-modal-header">
              <div className="las-schedule-modal-title-wrap">
                <div className="las-schedule-icon-badge">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                    Schedule Story
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Set a future date and time for automatic publication
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="las-schedule-close-btn" 
                onClick={() => setShowScheduleModal(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {formData.status === 'scheduled' && formData.scheduledAt && (
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#6d28d9' }}>
                <Calendar size={15} />
                <span>Currently scheduled for <strong>{new Date(formData.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong></span>
              </div>
            )}

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                Quick Presets
              </label>
              <div className="las-schedule-presets-grid">
                <button 
                  type="button" 
                  className="las-schedule-preset-btn"
                  onClick={() => setScheduleDateTime(getPresetTime('tomorrow_9am'))}
                >
                  <Calendar size={13} color="#9333ea" />
                  <span>Tomorrow 9:00 AM</span>
                </button>
                <button 
                  type="button" 
                  className="las-schedule-preset-btn"
                  onClick={() => setScheduleDateTime(getPresetTime('tomorrow_6pm'))}
                >
                  <Clock size={13} color="#9333ea" />
                  <span>Tomorrow 6:00 PM</span>
                </button>
                <button 
                  type="button" 
                  className="las-schedule-preset-btn"
                  onClick={() => setScheduleDateTime(getPresetTime('in_2_days'))}
                >
                  <Calendar size={13} color="#9333ea" />
                  <span>In 2 Days 9:00 AM</span>
                </button>
                <button 
                  type="button" 
                  className="las-schedule-preset-btn"
                  onClick={() => setScheduleDateTime(getPresetTime('next_monday'))}
                >
                  <Calendar size={13} color="#9333ea" />
                  <span>Next Monday 9:00 AM</span>
                </button>
              </div>
            </div>

            <div className="las-schedule-datetime-wrap">
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                Publication Date & Time (Local Time)
              </label>
              <input 
                type="datetime-local" 
                className="las-schedule-datetime-input"
                min={(() => {
                  const d = new Date();
                  const pad = (n) => String(n).padStart(2, '0');
                  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                })()}
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
              />
            </div>

            {scheduleDateTime && (
              <div className="las-schedule-callout">
                <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  Story will automatically go live on{' '}
                  <strong>
                    {new Date(scheduleDateTime).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(scheduleDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
              </div>
            )}

            <div className="las-schedule-modal-footer">
              <div style={{ display: 'flex', gap: '8px' }}>
                {formData.status === 'scheduled' && (
                  <button 
                    type="button" 
                    className="las-btn"
                    style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem' }}
                    onClick={() => {
                      setShowScheduleModal(false);
                      handleSaveArticle('draft');
                    }}
                    disabled={saving}
                  >
                    Unschedule to Draft
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                <button 
                  type="button" 
                  className="las-btn"
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569' }}
                  onClick={() => setShowScheduleModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="las-schedule-confirm-btn"
                  onClick={handleConfirmSchedule}
                  disabled={saving || !scheduleDateTime}
                >
                  <Clock size={14} />
                  <span>{saving ? 'Scheduling...' : formData.status === 'scheduled' ? 'Update Schedule' : 'Schedule Story'}</span>
                </button>
              </div>
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
