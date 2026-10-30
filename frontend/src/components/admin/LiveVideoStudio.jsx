import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Film, Play, Plus, Trash2, UploadCloud, FolderOpen, 
  Sparkles, Bold, Italic, Underline, AlignLeft, AlignCenter, 
  RemoveFormatting, Clock, Check, X, AlertCircle, Copy, 
  RefreshCw, Eye, ThumbsUp, Tag, Star, Bookmark, Search, ChevronDown
} from 'lucide-react';
import { VideoService } from '../../services/videoService';
import { MediaService } from '../../services/mediaService';
import './LiveArticleStudio.css';
import './LiveVideoStudio.css';

// Preset series options
const VIDEO_SERIES_OPTIONS = [
  'Founders Unfiltered',
  'Studio Masterclass',
  'DeepTech Horizons',
  'TechSparks Sessions',
  'Startup Diaries',
  'AI Revolution',
  'Fintech Frontiers',
  'Unicorn Playbook',
  'HerStory Spotlight'
];

// Preset categories
const VIDEO_CATEGORIES_PRESET = [
  { id: 'interviews', label: 'Founder Interview' },
  { id: 'masterclass', label: 'Studio Masterclass' },
  { id: 'deeptech', label: 'DeepTech Special' },
  { id: 'keynotes', label: 'Keynotes & Summits' },
  { id: 'market', label: 'Market Dispatches' },
  { id: 'technology', label: 'Technology & AI' }
];

export function parseVideoUrl(input) {
  if (!input) return null;
  const str = String(input).trim();

  // YouTube watch / share / embed / shorts
  const ytMatch = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      provider: 'YouTube',
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      maxResThumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      hqThumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  // Direct MP4 / local upload file / webm
  if (/\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(str) || str.startsWith('blob:') || str.startsWith('data:video') || str.includes('/uploads/')) {
    return {
      provider: 'Direct Video (MP4)',
      id: str,
      embedUrl: str,
      watchUrl: str,
      maxResThumb: '',
      hqThumb: ''
    };
  }

  // Vimeo
  const vimeoMatch = str.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const vid = vimeoMatch[3];
    return {
      provider: 'Vimeo',
      id: vid,
      embedUrl: `https://player.vimeo.com/video/${vid}`,
      watchUrl: `https://vimeo.com/${vid}`,
      maxResThumb: '',
      hqThumb: ''
    };
  }

  return null;
}

export function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `video-${Date.now()}`;
}


const FALLBACK_TOPICS = [
  'Startups',
  'Venture Capital',
  'Bootstrapping',
  'Growth & Scaling',
  'Artificial Intelligence',
  'Generative AI',
  'SaaS',
  'Leadership',
  'Fintech',
  'DeepTech',
  'Product Design',
  'E-Commerce'
];

const FALLBACK_TAGS = [
  'founders',
  'venture',
  'ai',
  'scale',
  'bootstrapped',
  'saas',
  'funding',
  'fintech',
  'deeptech',
  'tech',
  'leadership',
  'growth'
];

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
  prefix = '',
  singleSelect = false
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
    if (singleSelect) {
      if (isSelected(val)) {
        onRemove(val);
      } else {
        onSelect(val);
      }
      setIsOpen(false);
      setSearchQuery('');
    } else {
      if (isSelected(val)) {
        onRemove(val);
      } else {
        onSelect(val);
      }
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
          {!singleSelect && (
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
          )}
        </label>
        {!singleSelect && selectedValues.length > 0 && onClearAll && (
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
            : (singleSelect ? `${prefix}${selectedValues[0]}` : `${selectedValues.length} ${label} selected (click to edit)`)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {singleSelect && selectedValues.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onClearAll) onClearAll();
                else if (onRemove) onRemove(selectedValues[0]);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              title={`Clear ${label.toLowerCase()}`}
            >
              <X size={13} />
            </button>
          )}
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
      </div>

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
                  if (singleSelect) setIsOpen(false);
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

          {canAddCustom && (
            <button
              type="button"
              onClick={() => {
                onSelect(searchQuery.trim());
                setSearchQuery('');
                if (singleSelect) setIsOpen(false);
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
              <span>Add "${searchQuery.trim()}" as custom {label.toLowerCase()}</span>
            </button>
          )}

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
                      type={singleSelect ? 'radio' : 'checkbox'}
                      name={singleSelect ? `single-select-${label}` : undefined}
                      checked={checked}
                      onChange={() => {}}
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

          {!singleSelect && (
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
          )}
        </div>
      )}

      {!singleSelect && selectedValues.length > 0 && (
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
                  color: theme.chipRemove,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
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

export default function LiveVideoStudio({ 
  video = null, 
  onClose, 
  onSaveSuccess, 
  onShowToast, 
  categories = [] 
}) {
  // Master View Mode: 'edit' | 'preview'
  const [viewMode, setViewMode] = useState('edit');

  // Loading & Saving state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Hidden File Inputs for PC Upload
  const coverFileInputRef = useRef(null);
  const titleTextareaRef = useRef(null);

  // Media Library modal picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');

  // Advanced toggles
  const [isAutoSlug, setIsAutoSlug] = useState(!video);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State: ONLY Header and Description (preserving existing meta if editing)
  const [formData, setFormData] = useState(() => {
    if (video) {
      const parsed = parseVideoUrl(video.videoUrl || video.youtubeEmbedUrl);
      return {
        _id: video._id || video.id,
        title: video.title || '',
        slug: video.slug || slugify(video.title || ''),
        description: video.description || '',
        videoUrl: video.videoUrl || (parsed ? parsed.watchUrl : ''),
        youtubeEmbedUrl: video.youtubeEmbedUrl || (parsed ? parsed.embedUrl : ''),
        image: video.image || (parsed ? (parsed.maxResThumb || parsed.hqThumb) : ''),
        fallbackImage: video.fallbackImage || '',
        duration: video.duration || '28:00',
        series: video.series || 'Founders Unfiltered',
        category: video.category || 'interviews',
        categoryLabel: video.categoryLabel || 'Founder Interview',
        status: video.status || 'published',
        isFeatured: Boolean(video.isFeatured),
        views: video.views || 145000,
        likes: video.likes || 12800,
        order: video.order || 0,
        titleAlign: 'left',
        // Preserve any existing extra fields for DB fidelity
        guest: video.guest || '',
        guestRole: video.guestRole || '',
        guestCompany: video.guestCompany || '',
        guestAvatar: video.guestAvatar || '',
        guestBio: video.guestBio || '',
        host: video.host || 'Shradha Sharma',
        highlights: Array.isArray(video.highlights) ? video.highlights : [],
        chapters: Array.isArray(video.chapters) ? video.chapters : [],
        transcript: Array.isArray(video.transcript) ? video.transcript : [],
        tags: Array.isArray(video.tags) ? video.tags : [],
        topics: Array.isArray(video.topics) ? video.topics : []
      };
    }
    return {
      _id: null,
      title: '',
      slug: '',
      description: '',
      videoUrl: '',
      youtubeEmbedUrl: '',
      image: '',
      fallbackImage: '',
      duration: '28:00',
      series: 'Founders Unfiltered',
      category: 'interviews',
      categoryLabel: 'Founder Interview',
      status: 'published',
      isFeatured: false,
      views: 1200,
      likes: 85,
      order: 0,
      titleAlign: 'left',
      guest: '',
      guestRole: '',
      guestCompany: '',
      guestAvatar: '',
      guestBio: '',
      host: 'Shradha Sharma',
      highlights: [],
      chapters: [],
      transcript: [],
      tags: [],
      topics: []
    };
  });

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, saving]);

  // Detected Video Provider
  const detectedVideo = useMemo(() => {
    return parseVideoUrl(formData.videoUrl || formData.youtubeEmbedUrl);
  }, [formData.videoUrl, formData.youtubeEmbedUrl]);

  // Handle URL change with auto embed extraction and thumbnail fetch
  const handleVideoUrlChange = (val) => {
    const parsed = parseVideoUrl(val);
    setFormData(prev => {
      const next = { ...prev, videoUrl: val };
      if (parsed) {
        next.youtubeEmbedUrl = parsed.embedUrl;
        if (!next.image && (parsed.maxResThumb || parsed.hqThumb)) {
          next.image = parsed.maxResThumb || parsed.hqThumb;
        }
      }
      return next;
    });
  };

  // Topic Single-Select Handlers (Can Choose Only One)
  const handleSelectTopic = (val) => {
    setFormData(prev => ({ ...prev, topics: val ? [val] : [] }));
  };
  const handleRemoveTopic = () => {
    setFormData(prev => ({ ...prev, topics: [] }));
  };
  const handleClearAllTopics = () => {
    setFormData(prev => ({ ...prev, topics: [] }));
  };

  const handleSelectTag = (val) => {
    const clean = val.replace(/^#/, '').trim();
    if (clean && !formData.tags.includes(clean)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, clean] }));
    }
  };
  const handleRemoveTag = (val) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== val) }));
  };
  const handleClearAllTags = () => {
    setFormData(prev => ({ ...prev, tags: [] }));
  };

  const availableCategories = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map(c => typeof c === 'string' ? { id: c, name: c } : { id: c._id || c.id || c.name, name: c.name || c.label });
    }
    return [
      { id: 'Founder Interview', name: 'Founder Interview' },
      { id: 'Studio Masterclass', name: 'Studio Masterclass' },
      { id: 'DeepTech Special', name: 'DeepTech Special' },
      { id: 'Startups', name: 'Startups' },
      { id: 'Technology & AI', name: 'Technology & AI' },
      { id: 'HerStory', name: 'HerStory' },
      { id: 'FinTech', name: 'FinTech' }
    ];
  }, [categories]);

  // Headline Title Change with Auto-slug
  const handleTitleChange = (val) => {
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: (isAutoSlug || !prev.slug) ? slugify(val) : prev.slug
    }));
  };

  // Auto-fetch YouTube HD thumbnail
  const handleFetchYoutubeThumbnail = () => {
    if (detectedVideo && (detectedVideo.maxResThumb || detectedVideo.hqThumb)) {
      setFormData(prev => ({
        ...prev,
        image: detectedVideo.maxResThumb || detectedVideo.hqThumb
      }));
      if (onShowToast) onShowToast('YouTube thumbnail imported successfully!');
    } else {
      alert('Please enter a valid YouTube video URL first.');
    }
  };

  // Cover / Media PC File Upload
  const handleCoverFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (!isVideo) {
          setFormData(prev => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);

      const uploaded = await MediaService.uploadFile(file);
      if (uploaded && (uploaded.url || uploaded.path)) {
        const finalUrl = uploaded.url || uploaded.path;
        if (isVideo) {
          setFormData(prev => ({
            ...prev,
            videoUrl: finalUrl,
            youtubeEmbedUrl: finalUrl
          }));
          if (onShowToast) onShowToast('Video stream attached from PC');
        } else {
          setFormData(prev => ({ ...prev, image: finalUrl }));
          if (onShowToast) onShowToast('Cover thumbnail updated from PC');
        }
      }
    } catch (err) {
      console.warn('Cover upload fallback:', err);
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Helper: check if a media asset is a video
  const isAssetVideo = (file) => {
    if (!file) return false;
    if (file.mediaType === 'video') return true;
    if (file.type && file.type.startsWith('video/')) return true;
    if (file.mimeType && file.mimeType.startsWith('video/')) return true;
    const name = (file.filename || file.originalName || file.url || file.path || '').toLowerCase();
    return /\.(mp4|webm|mov|mkv|m4v|avi|ogv)$/i.test(name);
  };

  // Media Library Picker Open (SHOW ONLY VIDEOS)
  const openMediaPicker = () => {
    setIsMediaPickerOpen(true);
    setMediaLoading(true);
    MediaService.getMedia({ type: 'video' })
      .then(files => {
        // Enforce strict video filtering
        const videoList = Array.isArray(files) ? files.filter(isAssetVideo) : [];
        setMediaFiles(videoList);
      })
      .catch(err => {
        console.warn('Media fetch error:', err);
        setMediaFiles([]);
      })
      .finally(() => setMediaLoading(false));
  };

  // Select Video from Library
  const handleSelectMedia = (file) => {
    const url = file.url || file.path;
    setFormData(prev => ({ 
      ...prev, 
      videoUrl: url, 
      youtubeEmbedUrl: url,
      image: prev.image || file.poster || file.thumbnail || ''
    }));

    // Auto-extract thumbnail frame from video if no cover image exists
    if (!formData.image && url) {
      try {
        const vid = document.createElement('video');
        vid.src = url;
        vid.crossOrigin = 'anonymous';
        vid.currentTime = 1;
        vid.muted = true;
        vid.onloadeddata = () => {
          setTimeout(() => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = vid.videoWidth || 640;
              canvas.height = vid.videoHeight || 360;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              setFormData(p => ({ ...p, image: p.image || dataUrl }));
            } catch {}
          }, 200);
        };
      } catch {}
    }

    if (onShowToast) onShowToast(`Selected video "${file.filename || file.originalName || 'video'}"`);
    setIsMediaPickerOpen(false);
  };

  // Remove Video Stream
  const handleRemoveVideo = () => {
    setFormData(prev => ({
      ...prev,
      videoUrl: '',
      youtubeEmbedUrl: '',
      image: ''
    }));
    if (onShowToast) onShowToast('Video removed successfully');
  };

  // Headline Formatting Toolbar
  const applyHeadlineFormat = (type) => {
    const el = titleTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = formData.title || '';
    const selected = current.slice(start, end);

    let next = current;
    if (type === 'bold') {
      next = selected ? current.slice(0, start) + `<strong>${selected}</strong>` + current.slice(end) : current + ' <strong>Bold</strong>';
    } else if (type === 'italic') {
      next = selected ? current.slice(0, start) + `<em>${selected}</em>` + current.slice(end) : current + ' <em>Italic</em>';
    } else if (type === 'title-case') {
      const textToTransform = selected || current;
      const transformed = textToTransform.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      next = selected ? current.slice(0, start) + transformed + current.slice(end) : transformed;
    } else if (type === 'uppercase') {
      const textToTransform = selected || current;
      const transformed = textToTransform.toUpperCase();
      next = selected ? current.slice(0, start) + transformed + current.slice(end) : transformed;
    } else if (type === 'lowercase') {
      const textToTransform = selected || current;
      const transformed = textToTransform.toLowerCase();
      next = selected ? current.slice(0, start) + transformed + current.slice(end) : transformed;
    } else if (type === 'align-left') {
      setFormData(prev => ({ ...prev, titleAlign: 'left' }));
      return;
    } else if (type === 'align-center') {
      setFormData(prev => ({ ...prev, titleAlign: 'center' }));
      return;
    } else if (type === 'clear') {
      next = current.replace(/<[^>]*>/g, '');
    }

    setFormData(prev => ({ ...prev, title: next }));
  };

  // Copy Public Link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/videos/${formData.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    if (onShowToast) onShowToast('Public video link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Save Episode Handler (draft or published)
  const handleSaveVideo = async (targetStatus = null) => {
    const cleanTitle = (formData.title || '').trim();
    if (!cleanTitle) {
      alert('Please enter a video episode title / header before saving.');
      return;
    }

    const finalVideoUrl = (formData.videoUrl || formData.youtubeEmbedUrl || 'https://www.youtube.com/watch?v=cKxRvEZd3Mw').trim();
    const parsed = parseVideoUrl(finalVideoUrl);
    const finalEmbedUrl = formData.youtubeEmbedUrl || (parsed ? parsed.embedUrl : finalVideoUrl);
    const finalCover = formData.image || (parsed ? (parsed.maxResThumb || parsed.hqThumb) : '') || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80';
    const statusToSave = targetStatus || formData.status || 'published';

    const payload = {
      title: cleanTitle,
      slug: (formData.slug || slugify(cleanTitle)).trim(),
      description: (formData.description || '').trim(),
      videoUrl: finalVideoUrl,
      youtubeEmbedUrl: finalEmbedUrl,
      image: finalCover,
      fallbackImage: formData.fallbackImage || finalCover,
      series: (formData.series || 'Founders Unfiltered').trim(),
      category: formData.category || 'interviews',
      categoryLabel: formData.categoryLabel || 'Founder Interview',
      duration: (formData.duration || '24:00').trim(),
      status: statusToSave,
      isFeatured: Boolean(formData.isFeatured),
      views: formData.views || 100,
      likes: formData.likes || 10,
      order: formData.order || 0,
      // Preserve any existing fields
      guest: formData.guest || '',
      guestRole: formData.guestRole || '',
      guestCompany: formData.guestCompany || '',
      guestAvatar: formData.guestAvatar || '',
      guestBio: formData.guestBio || '',
      host: formData.host || 'Shradha Sharma',
      highlights: formData.highlights || [],
      chapters: formData.chapters || [],
      transcript: formData.transcript || [],
      tags: formData.tags || [],
      topics: formData.topics || []
    };

    setSaving(true);
    try {
      if (formData._id) {
        await VideoService.updateVideo(formData._id, payload);
        if (onShowToast) onShowToast(`Video "${payload.title}" updated successfully!`);
      } else {
        await VideoService.createVideo(payload);
        if (onShowToast) onShowToast(`Video "${payload.title}" published successfully!`);
      }
      if (onSaveSuccess) await onSaveSuccess();
    } catch (err) {
      console.error('Failed to save video:', err);
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Video Handler
  const handleDeleteVideo = async () => {
    if (!formData._id) return;
    setDeleting(true);
    try {
      await VideoService.deleteVideo(formData._id);
      if (onShowToast) onShowToast(`Video "${formData.title}" deleted.`);
      if (onSaveSuccess) await onSaveSuccess();
      setShowDeleteModal(false);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const plainTitle = (formData.title || '').replace(/<[^>]*>/g, '');
  const titleCharCount = plainTitle.length;
  const titleWordCount = plainTitle.trim() ? plainTitle.trim().split(/\s+/).length : 0;
  const descCharCount = (formData.description || '').length;
  const descWordCount = (formData.description || '').trim() ? (formData.description || '').trim().split(/\s+/).length : 0;

  return (
    <div className="las-studio-container">
      {/* ── Top Header Navigation Bar ── */}
      <header className="las-studio-header">
        <div className="las-header-left">
          <button 
            type="button" 
            className="las-back-btn" 
            onClick={onClose}
            title="Return to videos table"
          >
            <ArrowLeft size={16} />
            <span>Videos</span>
          </button>
          
          <div className="las-title-meta">
            <div className="las-studio-badge-row">
              <span 
                className="las-studio-status-badge"
                style={{
                  background: formData.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: formData.status === 'published' ? '#10b981' : '#f59e0b',
                  borderColor: formData.status === 'published' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer'
                }}
                onClick={() => setFormData(p => ({ ...p, status: p.status === 'published' ? 'draft' : 'published' }))}
                title="Click to toggle Published vs Draft"
              >
                ● {formData.status.toUpperCase()}
              </span>
              <span className="las-studio-title">
                {formData._id ? `Edit: ${plainTitle || 'Video Episode'}` : 'New Video Episode'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher (Editor & Live Preview) */}
        <div className="las-header-center">
          <div className="las-view-toggle-group">
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'edit' ? 'active' : ''}`}
              onClick={() => setViewMode('edit')}
              title="Video Editor"
            >
              <Film size={13} style={{ marginRight: '5px' }} />
              <span>Editor</span>
            </button>
            <button 
              type="button" 
              className={`las-view-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              title="Full Public Video Preview"
            >
              <Eye size={13} style={{ marginRight: '5px' }} />
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
              title="Permanently remove video episode"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}

          <button 
            type="button" 
            className="las-btn las-btn-draft"
            onClick={() => handleSaveVideo('draft')}
            disabled={saving}
            title="Save as Draft (Ctrl+S)"
          >
            <span>Save Draft</span>
          </button>

          <button 
            type="button" 
            className="las-btn las-btn-publish"
            onClick={() => handleSaveVideo('published')}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>{formData._id ? 'Update Video' : 'Publish Video'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className={`las-workspace ${viewMode}`}>
        {/* Hidden file input for direct PC cover or video upload */}
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleCoverFileUpload}
        />

        {/* ══════════════════════════════════════════════════════
            VIEW 1: VIDEO FORM (HEADER & DESCRIPTION ONLY)
           ══════════════════════════════════════════════════════ */}
        {viewMode === 'edit' && (
          <div className="las-editor-pane">
            <div className="las-editor-inner">

              {/* CARD: VIDEO STREAM / MEDIA (ABOVE HEADER) */}
              <div className="las-card">
                {detectedVideo?.embedUrl ? (
                  <>
                    <div className="las-card-title-row" style={{ marginBottom: '1rem', borderBottom: 'none', paddingBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Film size={16} color="#dc2626" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                          Video Stream
                        </span>
                        <span style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 7px',
                          borderRadius: '999px'
                        }}>
                          {detectedVideo.provider}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="las-block-action-btn"
                          onClick={() => {
                            if (coverFileInputRef.current) coverFileInputRef.current.click();
                          }}
                          title="Upload replacement video from computer"
                        >
                          <UploadCloud size={13} />
                          <span>{uploadingCover ? 'Uploading...' : 'Replace Video (PC)'}</span>
                        </button>
                        <button
                          type="button"
                          className="las-block-action-btn"
                          onClick={openMediaPicker}
                          title="Select another video from Media Library"
                        >
                          <FolderOpen size={13} />
                          <span>Media Library</span>
                        </button>
                        <button
                          type="button"
                          className="las-block-action-btn delete"
                          onClick={handleRemoveVideo}
                          title="Remove this video"
                        >
                          <Trash2 size={13} />
                          <span>Remove Video</span>
                        </button>
                      </div>
                    </div>

                    <div className="lvs-video-player-container" style={{ marginTop: 0 }}>
                      {detectedVideo.provider === 'Direct Video (MP4)' ? (
                        <video
                          src={detectedVideo.embedUrl}
                          controls
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                        />
                      ) : (
                        <iframe
                          src={detectedVideo.embedUrl}
                          title="Episode Stream Preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </>
                ) : formData.image ? (
                  <>
                    <div className="las-card-title-row" style={{ marginBottom: '1rem', borderBottom: 'none', paddingBottom: 0 }}>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="las-block-action-btn"
                          onClick={() => {
                            if (coverFileInputRef.current) coverFileInputRef.current.click();
                          }}
                          title="Upload replacement cover image from computer"
                        >
                          <UploadCloud size={13} />
                          <span>{uploadingCover ? 'Uploading...' : 'Replace Thumbnail (PC)'}</span>
                        </button>
                        <button
                          type="button"
                          className="las-block-action-btn"
                          onClick={openMediaPicker}
                          title="Select an image from Media Library"
                        >
                          <FolderOpen size={13} />
                          <span>Media Library</span>
                        </button>
                        <button
                          type="button"
                          className="las-block-action-btn delete"
                          onClick={() => setFormData(p => ({ ...p, image: '' }))}
                          title="Remove cover thumbnail"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="las-cover-image-preview-wrap">
                      <div className="las-cover-preview-img-container">
                        <img 
                          src={formData.image} 
                          alt="Video Thumbnail" 
                          className="las-cover-preview-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="las-cover-meta-bar">
                          <div className="las-cover-badge-pill">
                            <span>{formData.categoryLabel || formData.category || 'Startups'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="las-cover-dropzone">
                    <div className="las-cover-dropzone-content" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="las-btn las-btn-publish"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => {
                            if (coverFileInputRef.current) coverFileInputRef.current.click();
                          }}
                          disabled={uploadingCover}
                        >
                          <UploadCloud size={14} />
                          <span>{uploadingCover ? 'Uploading...' : 'Upload Video (PC)'}</span>
                        </button>
                        <button
                          type="button"
                          className="las-btn"
                          style={{ background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                          onClick={openMediaPicker}
                        >
                          <FolderOpen size={14} />
                          <span>Browse Media Library</span>
                        </button>
                        {detectedVideo?.provider === 'YouTube' && (
                          <button
                            type="button"
                            className="las-btn"
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                            onClick={handleFetchYoutubeThumbnail}
                          >
                            <Sparkles size={14} />
                            <span>Auto-fetch YouTube Thumbnail</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 1: HEADER */}
              <div className="las-card">
                <div className="las-card-title-row">
                  <div>
                    <h3 className="las-card-title">
                      <span>Header</span>
                    </h3>
                  </div>
                </div>

                {/* Headline Formatting Toolbar */}
                <div className="las-headline-toolbar" style={{ marginTop: '0.5rem' }}>
                  <div className="las-headline-tools-group">
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('bold')}
                      title="Bold selection"
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      className="las-headline-tool-btn"
                      onClick={() => applyHeadlineFormat('italic')}
                      title="Italic selection"
                    >
                      <Italic size={15} />
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
                    <span>{titleCharCount} chars</span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span>{titleWordCount} words</span>
                  </div>
                </div>

                {/* Headline Title Input */}
                <textarea 
                  ref={titleTextareaRef}
                  rows={2}
                  className="las-headline-input"
                  placeholder="Enter video episode title / header here..."
                  value={formData.title}
                  style={{ textAlign: formData.titleAlign || 'left' }}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  autoFocus
                />





                {/* Metadata Row: Category, Topics, Tags */}
                <div className="las-grid-3" style={{ marginTop: '1.25rem' }}>
                  {/* Category */}
                  <div className="las-form-group">
                    <label className="las-label">Category</label>
                    <select 
                      className="las-select"
                      value={formData.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = availableCategories.find(c => c.id === val || c.name === val);
                        setFormData(p => ({
                          ...p,
                          category: val,
                          categoryLabel: match ? match.name : val
                        }));
                      }}
                    >
                      {availableCategories.map(c => (
                        <option key={c.id} value={c.name || c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Topic Single-Select (Choose Only One) */}
                  <div className="las-form-group">
                    <MultiSelectField
                      label="Topic"
                      icon={Bookmark}
                      placeholder="-- Select topic --"
                      options={FALLBACK_TOPICS}
                      selectedValues={formData.topics}
                      onSelect={handleSelectTopic}
                      onRemove={handleRemoveTopic}
                      onClearAll={handleClearAllTopics}
                      colorTheme="indigo"
                      prefix=""
                      singleSelect={true}
                    />
                  </div>

                  {/* Tags Multi-Select */}
                  <div className="las-form-group">
                    <MultiSelectField
                      label="Tags"
                      icon={Tag}
                      placeholder="-- Select tags --"
                      options={FALLBACK_TAGS}
                      selectedValues={formData.tags}
                      onSelect={handleSelectTag}
                      onRemove={handleRemoveTag}
                      onClearAll={handleClearAllTags}
                      colorTheme="blue"
                      prefix="#"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: DESCRIPTION */}
              <div className="las-card">
                <div className="las-card-title-row">
                  <div>
                    <h3 className="las-card-title">
                      <span>Description</span>
                    </h3>
                  </div>
                  <div className="las-headline-counter">
                    <span>{descCharCount} chars</span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span>{descWordCount} words</span>
                  </div>
                </div>

                <div className="las-form-group" style={{ margin: 0 }}>
                  <textarea 
                    rows={8}
                    className="las-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Enter full video description, show notes, background context, and key discussion highlights here..."
                    style={{ fontSize: '0.95rem', lineHeight: '1.65', minHeight: '180px' }}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 2: LIVE VIEW (PUBLIC VIDEO PLAYER SIMULATOR)
           ══════════════════════════════════════════════════════ */}
        {viewMode === 'preview' && (
          <div className="las-editor-pane" style={{ background: '#f8fafc', overflowY: 'auto' }}>
            <div className="lvs-preview-container">
              {/* Cinematic Video Player Box */}
              <div className="lvs-preview-hero">
                {detectedVideo?.embedUrl && (
                  <div className="lvs-video-player-container" style={{ margin: 0 }}>
                    <iframe
                      src={detectedVideo.embedUrl}
                      title="Episode Stream Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div className="lvs-preview-meta-row">
                  <span className="lvs-preview-series-pill">{formData.series || 'Masterclass'}</span>
                  <span className="lvs-preview-badge">{formData.categoryLabel || 'Interview'}</span>
                  <span className="lvs-preview-badge"><Clock size={12} /> {formData.duration}</span>
                  <span className="lvs-preview-badge"><Eye size={12} /> {typeof formData.views === 'number' ? formData.views.toLocaleString() : formData.views} views</span>
                  <span className="lvs-preview-badge"><ThumbsUp size={12} /> {typeof formData.likes === 'number' ? formData.likes.toLocaleString() : formData.likes} likes</span>
                </div>

                <h1 className="lvs-preview-title">
                  {plainTitle || 'Untitled Video Episode'}
                </h1>
              </div>

              {/* Description */}
              {formData.description && (
                <div className="lvs-preview-synopsis">
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Description
                  </h3>
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{formData.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Media Library Modal Picker (SHOW ONLY VIDEOS) ── */}
      {isMediaPickerOpen && (
        <div className="abv-modal-overlay" onClick={() => setIsMediaPickerOpen(false)}>
          <div className="abv-media-picker-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div className="abv-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Film size={20} color="#dc2626" />
                <h3 className="abv-modal-title" style={{ margin: 0 }}>Select Video from Library</h3>
                <span style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.4px'
                }}>
                  Videos Only
                </span>
              </div>
              <button type="button" className="abv-modal-close-btn" onClick={() => setIsMediaPickerOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <input 
                type="text" 
                className="las-input"
                placeholder="Search videos by filename..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                style={{ background: '#ffffff' }}
              />
            </div>

            <div className="abv-media-picker-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', padding: '1.25rem', gap: '14px' }}>
              {mediaLoading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                  <RefreshCw className="animate-spin" size={28} color="#dc2626" style={{ margin: '0 auto 10px' }} />
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Loading video assets...</span>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Film size={22} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '0.95rem', fontWeight: 700 }}>No Video Files Found</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Only video files are displayed here. Upload a video file (.mp4, .webm) or add videos to the Media Library.
                  </p>
                </div>
              ) : (
                mediaFiles
                  .filter(f => !mediaSearch || (f.filename || f.originalName || '').toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map(file => (
                    <div 
                      key={file._id || file.filename || file.url} 
                      className="abv-media-picker-card"
                      onClick={() => handleSelectMedia(file)}
                      style={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1.5px solid #e2e8f0',
                        background: '#090d16',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, border-color 0.15s ease'
                      }}
                      title={`Click to select ${file.filename || file.originalName || 'video'}`}
                    >
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#090d16', overflow: 'hidden' }}>
                        {(file.poster || file.thumbnail || file.image) ? (
                          <img
                            src={file.poster || file.thumbnail || file.image}
                            alt={file.altText || file.filename}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                              const yt = (file.url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                              if (yt && yt[1]) {
                                e.target.src = `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
                              }
                            }}
                          />
                        ) : (
                          <video
                            src={file.url || file.path}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            preload="metadata"
                            muted
                            playsInline
                            onMouseEnter={(e) => { e.target.play().catch(() => {}); }}
                            onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                          />
                        )}
                        {file.duration && (
                          <div style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '6px',
                            background: 'rgba(0, 0, 0, 0.8)',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 5px',
                            borderRadius: '4px',
                            zIndex: 2
                          }}>
                            {file.duration}
                          </div>
                        )}
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                          pointerEvents: 'none'
                        }}>
                          <Play size={16} fill="currentColor" />
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#f8fafc',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          VIDEO
                        </div>
                      </div>
                      <div style={{ padding: '8px 10px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                        <span 
                          style={{ 
                            display: 'block', 
                            fontSize: '0.8rem', 
                            fontWeight: 650, 
                            color: '#1e293b', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}
                          title={file.filename}
                        >
                          {file.filename || file.originalName || 'Video Asset'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {showDeleteModal && (
        <div className="abv-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="abv-delete-dialog" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Delete Video Episode?</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>This action cannot be undone.</p>
              </div>
            </div>

            <p style={{ margin: '16px 0', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{plainTitle}"</strong>? It will be permanently removed from MongoDB.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="abv-btn-cancel" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="abv-btn-primary" 
                onClick={handleDeleteVideo}
                disabled={deleting}
                style={{ background: '#dc2626' }}
              >
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
