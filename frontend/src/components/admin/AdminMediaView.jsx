import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Trash2, Copy, Check, 
  ExternalLink, Search, RefreshCw, AlertCircle, File, 
  HardDrive, X, CheckSquare, Film, Eye, Download, Play, 
  Layers, Sparkles, Filter, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { MediaService } from '../../services/mediaService';
import './AdminMediaView.css';

export default function AdminMediaView({ onShowToast }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'image' | 'video'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'largest' | 'smallest' | 'name'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16); // Default 16 (4 rows of 4 cards)
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [brokenImages, setBrokenImages] = useState(new Set());

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await MediaService.syncMedia();
      await loadFiles();
      if (onShowToast) {
        onShowToast(res?.message || 'Media assets synchronized from database');
      }
    } catch (err) {
      if (onShowToast) onShowToast('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MediaService.getFiles();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  const uploadSingleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await MediaService.uploadFile(file);
      if (res && res.file) {
        setFiles(prev => [res.file, ...prev]);
        if (onShowToast) onShowToast(`"${file.name}" uploaded successfully!`);
      } else {
        await loadFiles();
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
      if (onShowToast) onShowToast('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await uploadSingleFile(selectedFile);
    }
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      await uploadSingleFile(droppedFiles[0]);
    }
  };

  const handleCopyUrl = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    if (onShowToast) onShowToast('Media URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    try {
      const idOrFilename = fileToDelete._id || fileToDelete.filename || fileToDelete.originalName;
      await MediaService.deleteFile(idOrFilename);
      setFiles(prev => prev.filter(f => (f._id !== fileToDelete._id && f.filename !== fileToDelete.filename)));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(fileToDelete.filename);
        if (fileToDelete._id) next.delete(fileToDelete._id);
        return next;
      });
      if (previewAsset && (previewAsset.filename === fileToDelete.filename || previewAsset._id === fileToDelete._id)) {
        setPreviewAsset(null);
      }
      if (onShowToast) onShowToast('Media asset deleted successfully');
      setFileToDelete(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (identifier) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(identifier)) next.delete(identifier);
      else next.add(identifier);
      return next;
    });
  };

  const isAssetVideo = (file) => {
    if (!file) return false;
    const mt = String(file.mediaType || '').toLowerCase();
    if (mt === 'video') return true;
    const t = String(file.type || '').toLowerCase();
    if (t.includes('video/')) return true;
    const mime = String(file.mimeType || '').toLowerCase();
    if (mime.includes('video/')) return true;
    const name = (file.filename || file.originalName || file.url || '').toLowerCase();
    return /\.(mp4|webm|mov|mkv|m4v)($|\?|#)/i.test(name) || /youtube\.com|youtu\.be|vimeo\.com/i.test(name);
  };

  const getFileExtension = (file) => {
    if (!file) return 'FILE';
    const name = file.originalName || file.filename || file.url || '';
    const match = name.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    return match ? match[1].toUpperCase() : (isAssetVideo(file) ? 'MP4' : 'IMAGE');
  };

  const getCleanTitle = (file) => {
    if (!file) return 'Media Asset';
    const raw = file.originalName || file.filename || file.caption || file.altText || 'Media Asset';
    // Clean up internal timestamp hashes if present for cleaner display
    return raw.replace(/_[0-9]{10,}\./, '.');
  };

  const formatSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = files.length;
    let videoCount = 0;
    let imageCount = 0;
    let totalBytes = 0;

    files.forEach(f => {
      if (isAssetVideo(f)) videoCount++;
      else imageCount++;
      totalBytes += Number(f.size || f.sizeBytes || 0);
    });

    return {
      total,
      images: imageCount,
      videos: videoCount,
      totalStorage: formatSize(totalBytes)
    };
  }, [files]);

  // Filtered & Sorted files
  const filteredFiles = useMemo(() => {
    let list = files.filter(f => {
      const filename = (f.filename || '').toLowerCase();
      const orig = (f.originalName || '').toLowerCase();
      const alt = (f.altText || '').toLowerCase();
      const cap = (f.caption || '').toLowerCase();
      const q = search.toLowerCase().trim();

      const matchesSearch = !q || filename.includes(q) || orig.includes(q) || alt.includes(q) || cap.includes(q);
      if (!matchesSearch) return false;

      const isVid = isAssetVideo(f);
      if (typeFilter === 'image' && isVid) return false;
      if (typeFilter === 'video' && !isVid) return false;

      return true;
    });

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'largest') {
        return (Number(b.size || 0)) - (Number(a.size || 0));
      }
      if (sortBy === 'smallest') {
        return (Number(a.size || 0)) - (Number(b.size || 0));
      }
      if (sortBy === 'name') {
        const nameA = (a.originalName || a.filename || '').toLowerCase();
        const nameB = (b.originalName || b.filename || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return list;
  }, [files, search, typeFilter, sortBy]);

  // Reset page when search, type filter, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, sortBy, pageSize]);

  // Pagination calculation
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredFiles.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedFiles = useMemo(() => {
    if (pageSize === 'all') return filteredFiles;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFiles.slice(startIndex, startIndex + pageSize);
  }, [filteredFiles, currentPage, pageSize]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFiles.map((f, idx) => f._id || f.filename || f.url || `media-${idx}`)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected media files? This action cannot be undone.`)) return;

    setBulkDeleting(true);
    try {
      await MediaService.bulkDelete(Array.from(selectedIds));
      if (onShowToast) onShowToast(`Deleted ${count} media files successfully`);
      setSelectedIds(new Set());
      await loadFiles();
    } catch (err) {
      alert(err.message || 'Error during bulk delete');
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div 
      className="amv-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      {/* ── KPI Stats Cards Bar ── */}
      <div className="amv-stats-grid">
        {/* Total Assets */}
        <div 
          className={`amv-stat-card ${typeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTypeFilter('all')}
          title="Click to view all assets"
        >
          <div className="amv-stat-info">
            <span className="amv-stat-label">Total Assets</span>
            <span className="amv-stat-value">{metrics.total}</span>
          </div>
        </div>

        {/* Images */}
        <div 
          className={`amv-stat-card ${typeFilter === 'image' ? 'active' : ''}`}
          onClick={() => setTypeFilter('image')}
          title="Click to view image assets only"
        >
          <div className="amv-stat-info">
            <span className="amv-stat-label">Images</span>
            <span className="amv-stat-value">{metrics.images}</span>
          </div>
        </div>

        {/* Videos */}
        <div 
          className={`amv-stat-card ${typeFilter === 'video' ? 'active' : ''}`}
          onClick={() => setTypeFilter('video')}
          title="Click to view video assets only"
        >
          <div className="amv-stat-info">
            <span className="amv-stat-label">Videos</span>
            <span className="amv-stat-value">{metrics.videos}</span>
          </div>
        </div>

        {/* Storage Used */}
        <div className="amv-stat-card" style={{ cursor: 'default' }}>
          <div className="amv-stat-info">
            <span className="amv-stat-label">Storage Used</span>
            <span className="amv-stat-value">{metrics.totalStorage}</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          color: '#9f1239',
          borderRadius: '8px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.86rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button 
            type="button" 
            onClick={() => setError(null)} 
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9f1239' }}
          >
            ✕
          </button>
        </div>
      )}


      {/* ── Toolbar: Search, Sort & Upload ── */}
      <div className="amv-toolbar-wrap">
        <div className="amv-toolbar-left">
          {/* Search Box */}
          <div className="amv-search-bar">
            <Search size={15} className="amv-search-icon" />
            <input 
              type="text" 
              placeholder="Search media files by name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="amv-search-input"
            />
            {search && (
              <button 
                type="button" 
                className="amv-search-clear" 
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Custom Sort Selector */}
          <div className="amv-sort-wrap">
            <ArrowUpDown size={13} className="amv-sort-icon" />
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)} 
              className="amv-sort-dropdown"
              title="Sort media files"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="largest">Sort: Largest</option>
              <option value="smallest">Sort: Smallest</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
            <ChevronDown size={13} className="amv-sort-chevron" />
          </div>
        </div>

        <div className="amv-toolbar-right">
          <button
            type="button"
            className="amv-btn-secondary"
            onClick={handleSync}
            disabled={syncing || loading}
            title="Sync all media assets from database and files"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              cursor: (syncing || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          <label 
            className={`amv-btn-upload-primary ${uploading ? 'disabled' : ''}`}
            title="Upload image or video file"
          >
            <Upload size={15} />
            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,video/*" 
              style={{ display: 'none' }} 
              onChange={handleFileInputChange}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* ── Drag & Drop Active Banner ── */}
      {isDragging && (
        <div className="amv-drop-overlay dragging">
          <Upload size={38} />
          <h3 className="amv-drop-title">Drop your file here to upload</h3>
          <p className="amv-drop-desc">Supports high-res PNG, JPG, WEBP, SVG, and MP4 videos</p>
        </div>
      )}

      {/* ── Assets Count Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 12px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0' }}>
          <span>
            {typeFilter === 'image' && 'Images: '}
            {typeFilter === 'video' && 'Videos: '}
            {typeFilter === 'all' && 'All Assets: '}
            <strong style={{ color: '#0f172a' }}>{filteredFiles.length}</strong> {filteredFiles.length === 1 ? 'file' : 'files'}
            {totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ''}
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={13} />
              <span>{bulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Media Grid ── */}
      {loading ? (
        <div className="amv-empty-container">
          <RefreshCw className="animate-spin" size={32} color="#dc2626" />
          <h3 className="amv-empty-title">Loading Media Library...</h3>
          <p className="amv-empty-desc">Fetching asset catalog from server.</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="amv-empty-container">
          <div className="amv-empty-icon-wrap">
            <ImageIcon size={32} />
          </div>
          <h3 className="amv-empty-title">
            {search ? 'No Matching Media Files' : 'No Media Assets Yet'}
          </h3>
          <p className="amv-empty-desc">
            {search 
              ? `No files matched "${search}". Try searching with a different keyword.` 
              : typeFilter !== 'all'
              ? `No ${typeFilter === 'video' ? 'videos' : 'images'} found in the library.`
              : 'Upload your first cover photo, article graphic, or video to build your asset library.'}
          </p>
          {search ? (
            <button 
              type="button" 
              className="amv-btn-upload-primary"
              onClick={() => { setSearch(''); setTypeFilter('all'); }}
            >
              Reset Filters
            </button>
          ) : (
            <button 
              type="button" 
              className="amv-btn-upload-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Upload Your First File</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="amv-media-grid">
          {paginatedFiles.map((file, idx) => {
            const fileIdentifier = file._id || file.filename || file.url || `media-${idx}`;
            const isSelected = selectedIds.has(fileIdentifier);
            const isVideo = isAssetVideo(file);
            const fileExt = getFileExtension(file);
            const cleanTitle = getCleanTitle(file);
            const isBroken = brokenImages.has(file.url);
            const isCopied = copiedUrl === file.url;

            return (
              <div 
                key={fileIdentifier} 
                className={`amv-media-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setPreviewAsset(file)}
              >
                {/* Thumbnail Wrap */}
                <div className="amv-thumb-wrap">
                  {/* Select Checkbox (Top Left) */}
                  <div 
                    className="amv-card-checkbox-wrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(fileIdentifier);
                    }}
                    title={isSelected ? 'Deselect asset' : 'Select asset'}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(fileIdentifier)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Format Badge (Top Right) */}
                  <div className={`amv-card-type-badge ${isVideo ? 'video' : ''}`}>
                    {isVideo && <Film size={11} />}
                    <span>{fileExt}</span>
                  </div>

                  {/* Thumbnail Visuals */}
                  {isVideo ? (
                    <div className="amv-video-thumb-container">
                      {(file.poster || file.thumbnail || file.image) ? (
                        <img 
                          src={file.poster || file.thumbnail || file.image}
                          alt={cleanTitle}
                          className="amv-video-poster-img"
                          loading="lazy"
                          onError={(e) => {
                            const yt = (file.url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                            if (yt && yt[1]) {
                              e.target.src = `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
                            }
                          }}
                        />
                      ) : (
                        <video 
                          src={file.url} 
                          className="amv-video-preview" 
                          preload="metadata"
                          muted 
                          playsInline
                          onMouseEnter={(e) => {
                            e.target.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                          }}
                        />
                      )}
                      <div className="amv-video-play-center" title="Click to preview video">
                        <Play size={18} fill="currentColor" />
                      </div>
                      {file.duration && (
                        <span className="amv-video-duration-pill">{file.duration}</span>
                      )}
                    </div>
                  ) : isBroken ? (
                    <div className="amv-fallback-preview">
                      <ImageIcon size={32} className="amv-fallback-icon" />
                      <span className="amv-fallback-text">{fileExt} Image</span>
                    </div>
                  ) : (
                    <img 
                      src={file.url} 
                      alt={cleanTitle} 
                      loading="lazy"
                      className="amv-thumb-img"
                      onError={() => {
                        setBrokenImages(prev => new Set(prev).add(file.url));
                      }}
                    />
                  )}

                  {/* Hover Action Overlay */}
                  <div 
                    className="amv-card-overlay" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      type="button" 
                      className="amv-overlay-action-btn"
                      onClick={() => setPreviewAsset(file)}
                      title="Quick Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="amv-overlay-action-btn delete"
                      onClick={() => setFileToDelete(file)}
                      title="Delete Asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Metadata Footer */}
                <div className="amv-card-meta">
                  <div className="amv-card-title-row">
                    <span className="amv-card-filename" title={file.originalName || file.filename}>
                      {cleanTitle}
                    </span>
                  </div>

                  <div className="amv-card-sub-row">
                    <span className="amv-card-size-badge">
                      {formatSize(file.size || file.sizeBytes)}
                    </span>
                    <span>{formatDate(file.createdAt)}</span>
                    <button 
                      type="button"
                      className={`amv-copy-link-btn ${isCopied ? 'copied' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(file.url);
                      }}
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Modern Pagination Bar ── */}
        {filteredFiles.length > 0 && (
          <div className="abv-pagination-bar">
            <div className="abv-pagination-left">
              <div className="abv-pagination-info">
                {pageSize === 'all' ? (
                  <>Showing all <span className="abv-pg-bold">{filteredFiles.length}</span> media assets</>
                ) : (
                  <>
                    Showing{' '}
                    <span className="abv-pg-bold">
                      {((currentPage - 1) * pageSize + 1) === Math.min(currentPage * pageSize, filteredFiles.length)
                        ? (currentPage - 1) * pageSize + 1
                        : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredFiles.length)}`}
                    </span>{' '}
                    of <span className="abv-pg-bold">{filteredFiles.length}</span> media assets
                  </>
                )}
              </div>

              <span className="abv-pagination-divider" aria-hidden="true" />

              <div className="abv-page-size-wrap">
                <div className="abv-select-shell">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
                      setPageSize(val);
                      setCurrentPage(1);
                    }}
                    className="abv-page-size-select"
                    aria-label="Media files per page"
                  >
                    <option value={12}>12 per page</option>
                    <option value={16}>16 per page</option>
                    <option value={24}>24 per page</option>
                    <option value={48}>48 per page</option>
                    <option value="all">Show all</option>
                  </select>
                  <ChevronDown size={14} className="abv-select-chevron" aria-hidden="true" />
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="abv-pagination-actions">
                <button
                  type="button"
                  className="abv-page-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="abv-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return (
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1 ||
                        (currentPage <= 3 && page <= 4) ||
                        (currentPage >= totalPages - 2 && page >= totalPages - 3)
                      );
                    })
                    .reduce((acc, page, idx, arr) => {
                      if (idx > 0 && page - arr[idx - 1] > 1) {
                        acc.push(`ellipsis-${page}`);
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map(item => {
                      if (typeof item === 'string') {
                        return <span key={item} className="abv-page-ellipsis">…</span>;
                      }
                      return (
                        <button
                          key={item}
                          type="button"
                          className={`abv-page-number-btn ${currentPage === item ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentPage(item);
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }}
                        >
                          {item}
                        </button>
                      );
                    })}
                </div>

                <button
                  type="button"
                  className="abv-page-nav-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  title="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </>
    )}

      {/* ── Fullscreen Lightbox Preview Modal ── */}
      {previewAsset && (
        <div 
          className="amv-lightbox-overlay" 
          onClick={() => setPreviewAsset(null)}
        >
          <div 
            className="amv-lightbox-dialog" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="amv-lightbox-header">
              <div className="amv-lightbox-title-wrap">
                {isAssetVideo(previewAsset) ? <Film size={18} color="#dc2626" /> : <ImageIcon size={18} color="#dc2626" />}
                <h3 className="amv-lightbox-title" title={previewAsset.originalName || previewAsset.filename}>
                  {getCleanTitle(previewAsset)}
                </h3>
              </div>
              <button 
                type="button" 
                className="amv-lightbox-close-btn"
                onClick={() => setPreviewAsset(null)}
                title="Close preview (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Preview */}
            <div className="amv-lightbox-content">
              {isAssetVideo(previewAsset) ? (
                (() => {
                  const url = previewAsset.url || '';
                  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
                  if (yt && yt[1]) {
                    return (
                      <div style={{ width: '100%', height: '100%', minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <iframe 
                          src={`https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`}
                          title={getCleanTitle(previewAsset)}
                          style={{ width: '100%', height: '100%', minHeight: '440px', border: 'none', borderRadius: '8px' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  return (
                    <video 
                      src={previewAsset.url} 
                      controls 
                      autoPlay
                      className="amv-lightbox-full-video"
                    />
                  );
                })()
              ) : (
                <img 
                  src={previewAsset.url} 
                  alt={getCleanTitle(previewAsset)} 
                  className="amv-lightbox-full-img"
                />
              )}
            </div>

            {/* Footer */}
            <div className="amv-lightbox-footer">
              <div className="amv-lightbox-meta-chips">
                <span className="amv-lightbox-chip">
                  Format: {getFileExtension(previewAsset)}
                </span>
                <span className="amv-lightbox-chip">
                  Size: {formatSize(previewAsset.size || previewAsset.sizeBytes)}
                </span>
                <span className="amv-lightbox-chip">
                  Uploaded: {formatDate(previewAsset.createdAt)}
                </span>
              </div>

              <div className="amv-lightbox-actions">
                <button 
                  type="button" 
                  className="amv-lightbox-btn copy"
                  onClick={() => handleCopyUrl(previewAsset.url)}
                >
                  {copiedUrl === previewAsset.url ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedUrl === previewAsset.url ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
                <a 
                  href={previewAsset.url} 
                  download 
                  target="_blank" 
                  rel="noreferrer"
                  className="amv-lightbox-btn outline"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <button 
                  type="button" 
                  className="amv-lightbox-btn delete"
                  onClick={() => {
                    setFileToDelete(previewAsset);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {fileToDelete && (
        <div className="amv-lightbox-overlay" onClick={() => setFileToDelete(null)}>
          <div className="amv-delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="amv-delete-header">
              <div className="amv-delete-warning-icon">
                <AlertCircle size={24} />
              </div>
              <h3 className="amv-delete-title">Delete Media Asset?</h3>
            </div>
            <p className="amv-delete-body">
              Are you sure you want to permanently delete <strong>"{getCleanTitle(fileToDelete)}"</strong>? Stories or pages linked to this asset URL will no longer be able to display it.
            </p>
            <div className="amv-delete-footer">
              <button 
                type="button" 
                className="amv-btn-cancel" 
                onClick={() => setFileToDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="amv-btn-danger" 
                onClick={handleConfirmDelete}
                disabled={deleting}
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
