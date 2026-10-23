import React, { useState, useEffect } from 'react';
import { 
  Upload, Image as ImageIcon, Trash2, Copy, Check, 
  ExternalLink, Search, RefreshCw, AlertCircle, File, HardDrive, X, CheckSquare
} from 'lucide-react';
import { MediaService } from '../../services/mediaService';

export default function AdminMediaView({ onShowToast }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

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

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    try {
      const res = await MediaService.uploadFile(selectedFile);
      if (res && res.file) {
        setFiles(prev => [res.file, ...prev]);
        if (onShowToast) onShowToast('Media asset uploaded successfully!');
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (url) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    if (onShowToast) onShowToast('Image URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    try {
      await MediaService.deleteFile(fileToDelete.filename);
      setFiles(prev => prev.filter(f => f.filename !== fileToDelete.filename));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(fileToDelete.filename);
        if (fileToDelete._id) next.delete(fileToDelete._id);
        return next;
      });
      if (onShowToast) onShowToast('File deleted successfully');
      setFileToDelete(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.originalName?.toLowerCase().includes(search.toLowerCase()) ||
    f.filename?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (identifier) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(identifier)) next.delete(identifier);
      else next.add(identifier);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFiles.map(f => f.filename || f._id)));
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
      loadFiles();
    } catch (err) {
      alert(err.message || 'Error during bulk delete');
    } finally {
      setBulkDeleting(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="amv-container">


      {error && (
        <div className="amv-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div style={{
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '8px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckSquare size={13} />
              <span>{selectedIds.size} Selected</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#881337', fontWeight: 600 }}>
              {selectedIds.size === filteredFiles.length ? 'All filtered media files selected' : `${selectedIds.size} of ${filteredFiles.length} media files selected`}
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set(filteredFiles.map(f => f.filename || f._id)))}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
            >
              Select All ({filteredFiles.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              Clear Selection
            </button>
          </div>

          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Trash2 size={15} />
            {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="amv-toolbar">
        <div className="amv-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search media files by name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="amv-clear-btn" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="amv-toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {filteredFiles.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox"
                checked={filteredFiles.length > 0 && selectedIds.size === filteredFiles.length}
                onChange={handleSelectAll}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#dc2626' }}
              />
              <span>Select All</span>
            </label>
          )}
          <span className="amv-count-badge">
            <HardDrive size={13} />
            <span>{filteredFiles.length} Assets</span>
          </span>
          <button className="amv-refresh-btn" onClick={loadFiles} title="Reload">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <label className={`amv-btn-upload ${uploading ? 'disabled' : ''}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: 'var(--brand-primary, #dc2626)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
          }}>
            <Upload size={15} />
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="amv-loading-box">
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading asset library...</span>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="amv-empty-box">
          <ImageIcon size={48} color="var(--admin-text-faint)" />
          <h3>No media assets found</h3>
          <p>Upload your first story cover, hero graphic, or reporter headshot.</p>
          <label className="amv-btn-upload">
            <Upload size={16} />
            <span>Upload Image</span>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      ) : (
        <div className="amv-grid">
          {filteredFiles.map((file) => {
            const fileIdentifier = file.filename || file._id;
            const isSelected = selectedIds.has(fileIdentifier);
            return (
              <div 
                key={file.filename} 
                className="amv-card"
                style={{
                  outline: isSelected ? '2px solid #dc2626' : 'none',
                  backgroundColor: isSelected ? '#fff1f2' : undefined,
                  transition: 'outline 0.15s ease'
                }}
              >
                <div className="amv-img-wrap" style={{ position: 'relative' }}>
                  {/* Select Checkbox */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 10,
                      backgroundColor: isSelected ? '#dc2626' : 'rgba(15, 23, 42, 0.65)',
                      borderRadius: '4px',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(fileIdentifier)}
                      style={{ 
                        width: '15px', 
                        height: '15px', 
                        cursor: 'pointer',
                        accentColor: '#dc2626',
                        margin: 0
                      }}
                    />
                  </div>

                  <img 
                    src={file.url} 
                    alt={file.originalName} 
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="amv-img-overlay">
                    <button 
                      type="button" 
                      className="amv-overlay-btn" 
                      onClick={() => handleCopyUrl(file.url)}
                      title="Copy URL"
                    >
                      {copiedUrl === file.url ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
                    </button>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="amv-overlay-btn"
                      title="Open Full Image"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button 
                      type="button" 
                      className="amv-overlay-btn delete" 
                      onClick={() => setFileToDelete(file)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="amv-meta">
                  <div className="amv-name" title={file.originalName}>{file.originalName}</div>
                  <div className="amv-details">
                    <span>{formatSize(file.size)}</span>
                    <span>•</span>
                    <button 
                      type="button"
                      className="amv-copy-link"
                      onClick={() => handleCopyUrl(file.url)}
                    >
                      {copiedUrl === file.url ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="amv-modal-backdrop" onClick={() => setFileToDelete(null)}>
          <div className="amv-confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Delete Media Asset?</h3>
            <p>
              Are you sure you want to delete <strong>"{fileToDelete.originalName}"</strong>? Any story or dynamic page linking to this image URL may show a broken image.
            </p>
            <div className="amv-confirm-actions">
              <button 
                type="button" 
                className="amv-modal-btn cancel" 
                onClick={() => setFileToDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="amv-modal-btn delete-btn" 
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
