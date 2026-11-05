import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Search, ExternalLink, RefreshCw, AlertCircle, X,
  CheckSquare, Upload, Globe, BookOpen, Lock, Camera, Check, Eye, EyeOff, Copy, ArrowLeft, 
  Calendar, FileText, User, LayoutGrid, List, Tv, Send, Play, SlidersHorizontal, Filter, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { TaxonomyService } from '../../services/taxonomyService';
import { AuthService } from '../../services/authService';
import './AdminAuthorsView.css';

// Crisp SVG Icons for Social Platforms
const SocialSvg = ({ name, size = 15 }) => {
  switch (name) {
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'twitter': // X (Twitter)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </svg>
      );
    case 'website':
    default:
      return <Globe size={size} />;
  }
};

export default function AdminAuthorsView({ authorSlug, onNavigate, onShowToast }) {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filterHasArticles, setFilterHasArticles] = useState('all');
  const filterRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default 10 authors per page

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const activeFilterCount = (sortBy !== 'name' ? 1 : 0) + (filterHasArticles !== 'all' ? 1 : 0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Single Author Details Page state (/admin/authors/:author_name)
  const [singleAuthorData, setSingleAuthorData] = useState(null);
  const [authorContentTab, setAuthorContentTab] = useState('articles'); // 'articles' | 'videos' | 'pitches'
  const [singleAuthorLoading, setSingleAuthorLoading] = useState(false);
  const [singleAuthorError, setSingleAuthorError] = useState(null);

  // Author Edit/Create Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [showModalPassword, setShowModalPassword] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    designation: '',
    bio: '',
    image: '',
    profileImage: '',
    email: '',
    password: 'Author@12345',
    socialLinks: {
      linkedin: '',
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      website: ''
    },
    publishedArticlesCount: 0
  });

  useEffect(() => {
    if (authorSlug) {
      loadSingleAuthor(authorSlug);
    } else {
      loadAuthors();
    }
  }, [authorSlug]);

  const loadAuthors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TaxonomyService.getAdminAuthors();
      setAuthors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const loadSingleAuthor = async (slug) => {
    setSingleAuthorLoading(true);
    setSingleAuthorError(null);
    setSingleAuthorData(null);
    try {
      const res = await TaxonomyService.getAuthorBySlug(slug);
      if (res && res.author) {
        setSingleAuthorData(res);
      } else {
        setSingleAuthorError(`Author profile "${slug}" not found.`);
      }
    } catch (err) {
      setSingleAuthorError(err.message || 'Failed to load author profile details');
    } finally {
      setSingleAuthorLoading(false);
    }
  };

  const handleBackToList = () => {
    if (onNavigate) {
      onNavigate('/admin/authors');
    } else {
      window.history.pushState(null, '', '/admin/authors');
      window.location.reload();
    }
  };

  const handleOpenAuthorDetails = (slug) => {
    if (onNavigate) {
      onNavigate(`/admin/authors/${slug}`);
    } else {
      window.history.pushState(null, '', `/admin/authors/${slug}`);
      window.location.reload();
    }
  };

  const openCreateModal = () => {
    setEditingAuthor(null);
    setFormData({
      name: '',
      slug: '',
      designation: 'Technology Writer',
      bio: '',
      image: '',
      profileImage: '',
      email: '',
      password: 'Author@12345',
      socialLinks: {
        linkedin: '',
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
        website: ''
      },
      publishedArticlesCount: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (author) => {
    setEditingAuthor(author);
    const count = author.publishedArticlesCount ?? author.totalPublishedArticles ?? 0;
    setFormData({
      name: author.name || '',
      slug: author.slug || '',
      designation: author.designation || 'Staff Reporter',
      bio: author.bio || '',
      image: author.image || author.profileImage || '',
      profileImage: author.profileImage || author.image || '',
      email: author.email || ((author.slug || 'author') + '@goreadpost.com'),
      password: author.password || 'Author@12345',
      socialLinks: {
        linkedin: author.socialLinks?.linkedin || '',
        facebook: author.socialLinks?.facebook || '',
        instagram: author.socialLinks?.instagram || '',
        twitter: author.socialLinks?.twitter || '',
        youtube: author.socialLinks?.youtube || '',
        website: author.socialLinks?.website || ''
      },
      publishedArticlesCount: count
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (val) => {
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: editingAuthor ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }));
  };

  // Image Upload handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;

        try {
          const token = AuthService.getToken();
          const res = await fetch('/api/media/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              base64Data,
              filename: `author_${(formData.slug || 'profile')}_${Date.now()}`
            })
          });

          const json = await res.json();
          if (res.ok && json.success && json.data?.url) {
            setFormData(prev => ({
              ...prev,
              image: json.data.url,
              profileImage: json.data.url
            }));
            if (onShowToast) onShowToast('Profile photo uploaded successfully!');
            return;
          }
        } catch (uploadErr) {
          console.warn('Backend image upload fallback to Base64:', uploadErr);
        }

        // Fallback to local Data URL
        setFormData(prev => ({
          ...prev,
          image: base64Data,
          profileImage: base64Data
        }));
        if (onShowToast) onShowToast('Profile photo attached');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Error reading image file: ' + err.message);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        designation: formData.designation.trim() || 'Staff Reporter',
        bio: formData.bio.trim(),
        image: formData.image || formData.profileImage || '',
        profileImage: formData.profileImage || formData.image || '',
        email: formData.email.trim() || ((formData.slug || 'author') + '@goreadpost.com'),
        password: formData.password || 'Author@12345',
        socialLinks: {
          linkedin: formData.socialLinks.linkedin.trim(),
          facebook: formData.socialLinks.facebook.trim(),
          instagram: formData.socialLinks.instagram.trim(),
          twitter: formData.socialLinks.twitter.trim(),
          youtube: formData.socialLinks.youtube.trim(),
          website: formData.socialLinks.website.trim()
        }
      };

      if (editingAuthor) {
        await TaxonomyService.updateAuthor(editingAuthor._id || editingAuthor.slug, payload);
        if (onShowToast) onShowToast(`Author "${payload.name}" updated successfully!`);
      } else {
        await TaxonomyService.createAuthor(payload);
        if (onShowToast) onShowToast(`Author "${payload.name}" created successfully!`);
      }
      setIsModalOpen(false);

      if (authorSlug) {
        loadSingleAuthor(payload.slug || authorSlug);
      } else {
        loadAuthors();
      }
    } catch (err) {
      alert(err.message || 'Error saving author');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (author) => {
    const publishedCount = author.publishedArticlesCount ?? author.totalPublishedArticles ?? 0;
    const warning = publishedCount > 0 
      ? `Author "${author.name}" has ${publishedCount} published article(s). Deleting this profile will keep the articles published under editorial attribution. Continue?`
      : `Delete author profile "${author.name}"?`;

    if (!window.confirm(warning)) return;

    try {
      await TaxonomyService.deleteAuthor(author._id || author.slug);
      if (onShowToast) onShowToast(`Author "${author.name}" deleted`);
      if (authorSlug) {
        handleBackToList();
      } else {
        loadAuthors();
      }
    } catch (err) {
      alert(err.message || 'Error deleting author');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Delete ${count} selected author${count > 1 ? 's' : ''}? This cannot be undone.`)) return;
    try {
      for (const id of Array.from(selectedIds)) {
        await TaxonomyService.deleteAuthor(id);
      }
      if (onShowToast) onShowToast(`Deleted ${count} author${count > 1 ? 's' : ''}`);
      setSelectedIds(new Set());
      loadAuthors();
    } catch (err) {
      alert(err.message || 'Error deleting authors');
    }
  };

  const filteredAuthors = authors
    .filter(a => {
      const q = search.toLowerCase();
      const matchesSearch =
        a.name?.toLowerCase().includes(q) ||
        a.designation?.toLowerCase().includes(q) ||
        a.slug?.toLowerCase().includes(q) ||
        a.bio?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filterHasArticles === 'with') return (a.publishedArticlesCount || a.totalPublishedArticles || 0) > 0;
      if (filterHasArticles === 'without') return (a.publishedArticlesCount || a.totalPublishedArticles || 0) === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'articles') return (b.publishedArticlesCount || b.totalPublishedArticles || 0) - (a.publishedArticlesCount || a.totalPublishedArticles || 0);
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

  // Reset page when search, sort, or article filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, filterHasArticles, pageSize]);

  // Pagination calculation
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredAuthors.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedAuthors = useMemo(() => {
    if (pageSize === 'all') return filteredAuthors;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAuthors.slice(startIndex, startIndex + pageSize);
  }, [filteredAuthors, currentPage, pageSize]);

  // â”€â”€ Modal Form Renderer â”€â”€
  const renderEditModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="aav-modal-overlay">
        <div className="aav-modal">
          <div className="aav-modal-header">
            <h3 className="aav-modal-title">
              {editingAuthor ? `Edit Author: ${editingAuthor.name}` : 'Create Author Profile'}
            </h3>

          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="aav-modal-body">
              
              {/* 1. Author Profile Photo */}
              <div className="aav-form-section">
                <div className="aav-form-section-title">
                  <Camera size={14} color="#dc2626" />
                  <span>1. Author Profile Photo</span>
                </div>

                <div className="aav-photo-uploader">
                  <img
                    src={formData.image || formData.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
                    alt="Profile Preview"
                    className="aav-photo-preview"
                    onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'; }}
                  />
                  <div className="aav-photo-controls">
                    <div className="aav-photo-btns">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aav-btn-upload"
                        disabled={uploadingPhoto}
                      >
                        <Upload size={13} />
                        <span>{uploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
                      </button>

                      {(formData.image || formData.profileImage) && (
                        <button
                          type="button"
                          className="aav-btn-remove-photo"
                          onClick={() => setFormData(prev => ({ ...prev, image: '', profileImage: '' }))}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 & 3. Full Name, Slug & Designation */}
              <div className="aav-form-section">
                <div className="aav-form-section-title">
                  <Users size={14} color="#dc2626" />
                  <span>2 & 3. Author Identity & Role</span>
                </div>

                <div className="aav-form-grid-2">
                  <div className="aav-form-field">
                    <label className="aav-form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Author's full name (e.g., Rekha Balakrishnan)"
                      value={formData.name}
                      onChange={e => handleNameChange(e.target.value)}
                      className="aav-form-input"
                    />
                  </div>

                  <div className="aav-form-field">
                    <label className="aav-form-label">Profile Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., rekha-balakrishnan"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      className="aav-form-input"
                    />
                  </div>
                </div>

                <div className="aav-form-field">
                  <label className="aav-form-label">
                    Designation / Professional Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Technology Writer, Editor, Software Developer"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="aav-form-input"
                  />
                </div>
              </div>

              {/* Author Login Credentials */}
              <div className="aav-form-section" style={{ background: '#fdf2f2', border: '1px solid #fee2e2', borderRadius: '10px', padding: '14px' }}>
                <div className="aav-form-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991b1b', fontWeight: 800 }}>
                    <Lock size={15} color="#dc2626" />
                    <span>Author Login Credentials (Author Simple Login)</span>
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    {editingAuthor ? 'EDIT CREDENTIALS' : 'NEW AUTHOR'}
                  </span>
                </div>

                <div className="aav-form-grid-2">
                  <div className="aav-form-field">
                    <label className="aav-form-label" style={{ fontWeight: 700, color: '#374151' }}>Author Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., author@goreadpost.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="aav-form-input"
                      style={{ background: '#ffffff', borderColor: '#fca5a5' }}
                    />
                  </div>

                  <div className="aav-form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="aav-form-label" style={{ margin: 0, fontWeight: 700, color: '#374151' }}>Author Login Password *</label>
                      <button
                        type="button"
                        onClick={() => {
                          const rand = 'Author@' + Math.floor(1000 + Math.random() * 9000);
                          setFormData(prev => ({ ...prev, password: rand }));
                          if (onShowToast) onShowToast(`Generated new password: ${rand}`);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.72rem',
                          fontWeight: 750,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        ⚡ Randomize
                      </button>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showModalPassword ? 'text' : 'password'}
                        required
                        placeholder="e.g., Author@12345"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="aav-form-input"
                        style={{
                          background: '#ffffff',
                          borderColor: '#fca5a5',
                          paddingRight: '64px',
                          fontFamily: showModalPassword ? 'monospace' : 'inherit',
                          fontWeight: 700,
                          color: '#dc2626'
                        }}
                      />
                      <div style={{ position: 'absolute', right: '6px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => setShowModalPassword(!showModalPassword)}
                          title={showModalPassword ? 'Hide password' : 'Show password'}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        >
                          {showModalPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.password || 'Author@12345');
                            if (onShowToast) onShowToast('Password copied to clipboard!');
                          }}
                          title="Copy password"
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        >
                          <Copy size={15} />
                        </button>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#7f1d1d', marginTop: '4px', display: 'block' }}>
                      Use this password when signing in through the public modal to unlock <strong>Pitch Story</strong>.
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Short Biography */}
              <div className="aav-form-section">
                <div className="aav-form-section-title">
                  <BookOpen size={14} color="#dc2626" />
                  <span>4. Short Biography</span>
                </div>

                <div className="aav-form-field" style={{ marginBottom: 0 }}>
                  <textarea
                    rows={3}
                    placeholder="A brief description of the author's background, expertise, and interests..."
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="aav-form-textarea"
                  />
                </div>
              </div>

              {/* 5. Social Media Links */}
              <div className="aav-form-section">
                <div className="aav-form-section-title">
                  <Globe size={14} color="#dc2626" />
                  <span>5. Social Media Links</span>
                </div>

                <div className="aav-form-grid-2">
                  <div className="aav-form-field">
                    <label className="aav-form-label">LinkedIn URL</label>
                    <div className="aav-social-input-wrap">
                      <span className="aav-social-input-icon"><SocialSvg name="linkedin" size={14} /></span>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.socialLinks.linkedin}
                        onChange={e => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                        })}
                        className="aav-social-input"
                      />
                    </div>
                  </div>

                  <div className="aav-form-field">
                    <label className="aav-form-label">Facebook URL</label>
                    <div className="aav-social-input-wrap">
                      <span className="aav-social-input-icon"><SocialSvg name="facebook" size={14} /></span>
                      <input
                        type="url"
                        placeholder="https://facebook.com/username"
                        value={formData.socialLinks.facebook}
                        onChange={e => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                        })}
                        className="aav-social-input"
                      />
                    </div>
                  </div>

                  <div className="aav-form-field">
                    <label className="aav-form-label">Instagram URL</label>
                    <div className="aav-social-input-wrap">
                      <span className="aav-social-input-icon"><SocialSvg name="instagram" size={14} /></span>
                      <input
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={formData.socialLinks.instagram}
                        onChange={e => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                        })}
                        className="aav-social-input"
                      />
                    </div>
                  </div>

                  <div className="aav-form-field">
                    <label className="aav-form-label">X (Twitter) URL</label>
                    <div className="aav-social-input-wrap">
                      <span className="aav-social-input-icon"><SocialSvg name="twitter" size={14} /></span>
                      <input
                        type="url"
                        placeholder="https://x.com/username"
                        value={formData.socialLinks.twitter}
                        onChange={e => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                        })}
                        className="aav-social-input"
                      />
                    </div>
                  </div>

                  <div className="aav-form-field">
                    <label className="aav-form-label">YouTube URL</label>
                    <div className="aav-social-input-wrap">
                      <span className="aav-social-input-icon"><SocialSvg name="youtube" size={14} /></span>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@channel"
                        value={formData.socialLinks.youtube}
                        onChange={e => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                        })}
                        className="aav-social-input"
                      />
                    </div>
                  </div>

                  <div className="aav-form-field">
                    <label className="aav-form-label">Personal Website URL</label>
                    <div className="aav-social-input-wrap">
                      <span className="aav-social-input-icon"><SocialSvg name="website" size={14} /></span>
                      <input
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={formData.socialLinks.website}
                        onChange={e => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, website: e.target.value }
                        })}
                        className="aav-social-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Published Articles (Read-Only Auto-Synced Field) */}
              <div className="aav-form-section" style={{ marginBottom: 0 }}>
                <div className="aav-locked-metric-box">
                  <div className="aav-metric-info">
                    <span className="aav-metric-title">
                      <BookOpen size={15} color="#2563eb" />
                      <span>Total Published Articles</span>
                    </span>

                  </div>

                  <div className="aav-metric-badge" title="Live published count">
                    <BookOpen size={12} />
                    <span>{formData.publishedArticlesCount} {formData.publishedArticlesCount === 1 ? 'Article' : 'Articles'}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="aav-modal-footer">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="aav-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.name.trim()}
                className="aav-btn-save"
              >
                {saving ? 'Saving...' : editingAuthor ? 'Update Author Profile' : 'Create Author Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // â”€â”€ VIEW 1: DEDICATED AUTHOR DETAILS PAGE (/admin/authors/:slug) â”€â”€
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (authorSlug) {
    const author = singleAuthorData?.author;
    const articles = singleAuthorData?.articles || [];
    const videos = singleAuthorData?.videos || [];
    const pitches = singleAuthorData?.pitches || [];
    const publishedCount = author?.publishedArticlesCount ?? author?.totalPublishedArticles ?? articles.length;
    const socials = author?.socialLinks || {};

    return (
      <div className="aav-detail-container">
        {/* Navigation & Breadcrumb */}
        <div className="aav-detail-nav-bar">
          <button
            type="button"
            onClick={handleBackToList}
            className="aav-detail-btn-back"
            title="Return to Authors list"
          >
            <ArrowLeft size={14} />
            <span>All Authors</span>
          </button>

          {/* Top navigation actions */}
        </div>

        {singleAuthorLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 12px', color: '#dc2626' }} />
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading author details & articles...</div>
          </div>
        ) : singleAuthorError || !author ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800 }}>Author Not Found</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
              {singleAuthorError || `We couldn't locate any author record for "${authorSlug}".`}
            </p>
            <button
              type="button"
              onClick={handleBackToList}
              className="aav-detail-btn-back"
              style={{ margin: '0 auto' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Authors List</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Hero Profile Card */}
            <div className="aav-detail-hero-card">
              <div className="aav-detail-hero-inner">
                <div className="aav-detail-author-identity">
                  <img
                    src={author.image || author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
                    alt={author.name}
                    className="aav-detail-lg-avatar"
                    onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'; }}
                  />
                  <div>
                    <h1 className="aav-detail-main-name">{author.name}</h1>
                    <div className="aav-detail-designation-tag">
                      {author.designation || 'Staff Reporter'}
                    </div>
                  </div>
                </div>

                <div className="aav-detail-hero-actions">
                  <div className="aav-detail-badges-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="aav-detail-badge-metric" title="Published articles by author">
                      <BookOpen size={13} />
                      <span>{articles.length} {articles.length === 1 ? 'Article' : 'Articles'}</span>
                    </div>
                    <div className="aav-detail-badge-metric" style={{ background: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' }} title="Video productions by author">
                      <Tv size={13} />
                      <span>{videos.length} {videos.length === 1 ? 'Video' : 'Videos'}</span>
                    </div>
                    <div className="aav-detail-badge-metric" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }} title="Pitches submitted by author">
                      <Send size={13} />
                      <span>{pitches.length} {pitches.length === 1 ? 'Pitch' : 'Pitches'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(author)}
                    className="aav-detail-btn-edit"
                  >
                    <Edit2 size={15} />
                    <span>Edit Author</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Details Grid */}
            <div className="aav-detail-grid-layout">
              {/* Left Column: Biography & Published Articles */}
              <div>
                {/* Biography Card */}
                <div className="aav-detail-card">
                  <div className="aav-detail-card-header">
                    <h3 className="aav-detail-card-title">
                      <FileText size={16} color="#dc2626" />
                      <span>Biography & Expertise</span>
                    </h3>
                  </div>
                  <p className="aav-detail-bio-body">
                    {author.bio || 'No biography written for this author yet.'}
                  </p>
                </div>

                {/* Content Showcase Card: Articles, Videos, and Pitches */}
                <div className="aav-detail-card">
                  <div className="aav-detail-card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setAuthorContentTab('articles')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: authorContentTab === 'articles' ? '1px solid #dc2626' : '1px solid #e2e8f0',
                          background: authorContentTab === 'articles' ? '#dc2626' : '#f8fafc',
                          color: authorContentTab === 'articles' ? '#ffffff' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <BookOpen size={13} />
                        <span>Articles ({articles.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthorContentTab('videos')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: authorContentTab === 'videos' ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                          background: authorContentTab === 'videos' ? '#7c3aed' : '#f8fafc',
                          color: authorContentTab === 'videos' ? '#ffffff' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Tv size={13} />
                        <span>Videos ({videos.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthorContentTab('pitches')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: authorContentTab === 'pitches' ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          background: authorContentTab === 'pitches' ? '#0f172a' : '#f8fafc',
                          color: authorContentTab === 'pitches' ? '#ffffff' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Send size={13} />
                        <span>Pitches ({pitches.length})</span>
                      </button>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      {authorContentTab === 'articles' ? 'Published Articles' : authorContentTab === 'videos' ? 'Video Shows & Productions' : 'Author Studio Submissions'}
                    </span>
                  </div>

                  {/* 1. ARTICLES LIST */}
                  {authorContentTab === 'articles' && (
                    articles.length === 0 ? (
                      <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                        <BookOpen size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                        <p style={{ margin: '0 0 10px', fontSize: '0.88rem' }}>No published articles currently assigned to this author.</p>
                        <button
                          type="button"
                          onClick={() => onNavigate?.('/admin/posts/create')}
                          className="aav-btn-primary"
                          style={{ margin: '0 auto', fontSize: '0.8rem', padding: '6px 14px' }}
                        >
                          <Plus size={13} /> Create Article
                        </button>
                      </div>
                    ) : (
                      <div className="aav-detail-articles-list">
                        {articles.map((art) => {
                          const img = art.image || art.featuredImage?.url || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80';
                          return (
                            <div key={art._id || art.slug} className="aav-detail-article-card">
                              <div className="aav-detail-article-left">
                                <img
                                  src={img}
                                  alt={art.title}
                                  className="aav-detail-article-thumb"
                                  onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80'; }}
                                />
                                <div className="aav-detail-article-info">
                                  <h4 
                                    className="aav-detail-article-title" 
                                    title={art.title}
                                    onClick={() => onNavigate?.(`/admin/posts/${art._id || art.id}/edit`)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {art.title}
                                  </h4>
                                  <div className="aav-detail-article-meta">
                                    <span className="aav-detail-article-cat">
                                      {art.categoryName || 'Article'}
                                    </span>
                                    {art.publishedAt && (
                                      <span>
                                        {new Date(art.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                    )}
                                    {typeof art.views === 'number' && (
                                      <span>• {art.views.toLocaleString()} views</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="aav-detail-article-actions">
                                <button
                                  type="button"
                                  onClick={() => onNavigate?.(`/admin/posts/${art._id || art.id}/edit`)}
                                  className="aav-btn-action"
                                  title="Edit article"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <a
                                  href={`/article/${art.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="aav-btn-action"
                                  title="View public article"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}

                  {/* 2. VIDEOS LIST */}
                  {authorContentTab === 'videos' && (
                    videos.length === 0 ? (
                      <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                        <Tv size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                        <p style={{ margin: '0 0 10px', fontSize: '0.88rem' }}>No video shows or productions hosted by this author yet.</p>
                        <button
                          type="button"
                          onClick={() => onNavigate?.('/admin/videos-studio')}
                          className="aav-btn-primary"
                          style={{ margin: '0 auto', fontSize: '0.8rem', padding: '6px 14px' }}
                        >
                          <Plus size={13} /> Create Video Show
                        </button>
                      </div>
                    ) : (
                      <div className="aav-detail-articles-list">
                        {videos.map((vid) => {
                          const vImg = vid.image || vid.fallbackImage || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80';
                          return (
                            <div key={vid._id || vid.id} className="aav-detail-article-card">
                              <div className="aav-detail-article-left">
                                <div style={{ position: 'relative', width: '64px', height: '52px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden' }}>
                                  <img
                                    src={vImg}
                                    alt={vid.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80'; }}
                                  />
                                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Play size={14} color="#fff" fill="#fff" />
                                  </div>
                                </div>
                                <div className="aav-detail-article-info">
                                  <h4 
                                    className="aav-detail-article-title" 
                                    title={vid.title}
                                    onClick={() => onNavigate?.(`/admin/videos-studio?id=${vid._id || vid.id}`)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {vid.title}
                                  </h4>
                                  <div className="aav-detail-article-meta">
                                    <span className="aav-detail-article-cat" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                                      {vid.category || 'Video Show'}
                                    </span>
                                    {vid.duration && <span>{vid.duration}</span>}
                                    {typeof vid.views === 'number' && <span>• {vid.views.toLocaleString()} views</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="aav-detail-article-actions">
                                <button
                                  type="button"
                                  onClick={() => onNavigate?.(`/admin/videos-studio?id=${vid._id || vid.id}`)}
                                  className="aav-btn-action"
                                  title="Edit video in studio"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <a
                                  href="/videos"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="aav-btn-action"
                                  title="View videos player"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}

                  {/* 3. PITCHES LIST */}
                  {authorContentTab === 'pitches' && (
                    pitches.length === 0 ? (
                      <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                        <Send size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                        <p style={{ margin: '0 0 10px', fontSize: '0.88rem' }}>No story pitches or leads submitted by this author yet.</p>
                        <button
                          type="button"
                          onClick={() => onNavigate?.('/admin/submissions')}
                          className="aav-btn-primary"
                          style={{ margin: '0 auto', fontSize: '0.8rem', padding: '6px 14px' }}
                        >
                          View Submissions Queue
                        </button>
                      </div>
                    ) : (
                      <div className="aav-detail-articles-list">
                        {pitches.map((p) => {
                          const pImg = p.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80';
                          const isVideoPitch = p.pitchFormat === 'video';
                          const statusBg = p.status === 'approved' ? '#dcfce7' : p.status === 'reviewing' ? '#e0e7ff' : '#fef3c7';
                          const statusColor = p.status === 'approved' ? '#166534' : p.status === 'reviewing' ? '#3730a3' : '#92400e';

                          return (
                            <div key={p._id || p.id} className="aav-detail-article-card">
                              <div className="aav-detail-article-left">
                                <img
                                  src={pImg}
                                  alt={p.headline || p.title}
                                  className="aav-detail-article-thumb"
                                  onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80'; }}
                                />
                                <div className="aav-detail-article-info">
                                  <h4 className="aav-detail-article-title" title={p.headline || p.title}>
                                    {p.headline || p.title}
                                  </h4>
                                  <div className="aav-detail-article-meta">
                                    <span 
                                      className="aav-detail-article-cat"
                                      style={{ 
                                        background: isVideoPitch ? 'rgba(124, 58, 237, 0.1)' : 'rgba(220, 38, 38, 0.08)',
                                        color: isVideoPitch ? '#7c3aed' : '#dc2626'
                                      }}
                                    >
                                      {isVideoPitch ? 'Video Pitch' : 'Article Pitch'}
                                    </span>
                                    <span style={{ background: statusBg, color: statusColor, padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>
                                      {p.status || 'Pending'}
                                    </span>
                                    {p.createdAt && (
                                      <span>
                                        {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="aav-detail-article-actions">
                                <button
                                  type="button"
                                  onClick={() => onNavigate?.('/admin/submissions')}
                                  className="aav-btn-action"
                                  title="Manage in Submissions queue"
                                  style={{ padding: '0 10px', fontSize: '0.76rem', fontWeight: 700, gap: '4px', display: 'inline-flex', alignItems: 'center' }}
                                >
                                  <span>Review Pitch</span>
                                  <ExternalLink size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Right Column: Social Media Links & Metadata */}
              <div className="aav-detail-sidebar-col">
                {/* Social Media Links Card */}
                <div className="aav-detail-card">
                  <div className="aav-detail-card-header">
                    <h3 className="aav-detail-card-title">
                      <Globe size={16} color="#dc2626" />
                      <span>Social Media Profiles</span>
                    </h3>
                  </div>

                  <div className="aav-detail-social-cards">
                    {[
                      { key: 'linkedin', label: 'LinkedIn', url: socials.linkedin },
                      { key: 'facebook', label: 'Facebook', url: socials.facebook },
                      { key: 'instagram', label: 'Instagram', url: socials.instagram },
                      { key: 'twitter', label: 'X (Twitter)', url: socials.twitter },
                      { key: 'youtube', label: 'YouTube', url: socials.youtube },
                      { key: 'website', label: 'Personal Website', url: socials.website }
                    ].map(soc => (
                      <div key={soc.key} className="aav-detail-social-row">
                        <div className="aav-detail-social-left">
                          <span style={{ color: '#dc2626', display: 'inline-flex' }}><SocialSvg name={soc.key} size={14} /></span>
                          <span>{soc.label}</span>
                        </div>
                        {soc.url ? (
                          <a href={soc.url} target="_blank" rel="noreferrer" className="aav-detail-social-anchor" title={soc.url}>
                            <span>Visit</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>None</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Information / Metadata */}
                <div className="aav-detail-card">
                  <div className="aav-detail-card-header">
                    <h3 className="aav-detail-card-title">
                      <Lock size={15} color="#dc2626" />
                      <span>Profile Information</span>
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Login Email:</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{author.email || ((author.slug || 'author') + '@goreadpost.com')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Login Password:</span>
                      <span style={{ fontWeight: 700, color: '#dc2626', fontFamily: 'monospace', background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecaca' }}>
                        {author.password || 'Author@12345'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Status:</span>
                      <span style={{ fontWeight: 750, color: '#16a34a' }}>Active Author</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Total Articles:</span>
                      <span style={{ fontWeight: 750, color: '#0284c7' }}>{publishedCount} published</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dialog: Edit Author Profile */}
        {renderEditModal()}
      </div>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // â”€â”€ VIEW 2: AUTHORS LIST WORKSPACE (/admin/authors) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <div className="aav-root">
      

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '10px', color: '#dc2626', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>âœ•</button>
        </div>
      )}

      {/* â”€â”€ Toolbar: Search & Controls â”€â”€ */}
      <div className="aav-toolbar-wrap">
        <div className="aav-search-bar">
          <Search size={15} className="aav-search-icon" />
            <input
              type="text"
              placeholder="Search authors by name, role, or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="aav-search-input"
            />
            {search && (
              <button
                type="button"
                className="aav-search-clear"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

        <div className="aav-toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
          {/* Filter Popover Button */}
          <div ref={filterRef} style={{ position: 'relative', flex: '1 1 auto', minWidth: 0 }}>
            <button
              type="button"
              className={`aav-filter-btn${activeFilterCount > 0 ? ' active' : ''}`}
              onClick={() => setFilterOpen(v => !v)}
              title="Filter and sort authors"
              style={{ width: '100%', justifyContent: 'center', whiteSpace: 'nowrap' }}
            >
              <Filter size={15} color={activeFilterCount > 0 ? '#dc2626' : '#64748b'} />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="aav-filter-badge">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown 
                size={14} 
                style={{
                  transform: filterOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.18s ease',
                  color: activeFilterCount > 0 ? '#dc2626' : '#64748b'
                }} 
              />
            </button>

            {filterOpen && (
              <div className="aav-filter-popover">
                <div className="aav-filter-popover-header">
                  <div className="aav-filter-popover-title">
                    <Filter size={14} color="#dc2626" />
                    <span>Filter Authors</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      className="aav-filter-popover-reset"
                      onClick={() => {
                        setSortBy('name');
                        setFilterHasArticles('all');
                      }}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                <div className="aav-filter-popover-group">
                  <label className="aav-filter-popover-label">Sort By</label>
                  <select
                    className="aav-filter-popover-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="articles">Most Articles</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div className="aav-filter-popover-group">
                  <label className="aav-filter-popover-label">Articles</label>
                  <select
                    className="aav-filter-popover-select"
                    value={filterHasArticles}
                    onChange={e => setFilterHasArticles(e.target.value)}
                  >
                    <option value="all">All Authors ({authors.length})</option>
                    <option value="with">With Articles</option>
                    <option value="without">Without Articles</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="aav-btn-primary"
            style={{ backgroundColor: 'var(--brand-primary, #dc2626)', borderColor: 'var(--brand-primary, #dc2626)', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.28)', flex: '1 1 auto', minWidth: 0, justifyContent: 'center', whiteSpace: 'nowrap' }}
          >
            <Plus size={15} />
            <span>Add Author</span>
          </button>
        </div>
      </div>

      {/* Sub-Header Bar: Select All & Bulk Actions (Above Cards) */}
      {filteredAuthors.length > 0 && (
        <div className={`abv-cards-header-bar ${selectedIds.size > 0 ? 'has-selection' : ''}`}>
          <div className="abv-cards-header-left">
            <label className="abv-select-all-label" title="Select authors on this page">
              <input
                type="checkbox"
                checked={paginatedAuthors.length > 0 && paginatedAuthors.every(a => selectedIds.has(a._id || a.slug))}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      paginatedAuthors.forEach(a => next.add(a._id || a.slug));
                      return next;
                    });
                  } else {
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      paginatedAuthors.forEach(a => next.delete(a._id || a.slug));
                      return next;
                    });
                  }
                }}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#dc2626' }}
              />
              <span>Select Page</span>
            </label>
            {selectedIds.size > 0 && (
              <span className="abv-selected-pill">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          <div className="abv-cards-header-right">
            {selectedIds.size > 0 ? (
              <div className="abv-bulk-actions-group">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="abv-bulk-btn abv-bulk-btn-delete"
                  title="Delete selected authors"
                >
                  <Trash2 size={14} />
                  <span>Delete ({selectedIds.size})</span>
                </button>
              </div>
            ) : totalPages > 1 ? (
              <div className="abv-header-pagination">
                <span className="abv-header-pg-text">
                  Showing{' '}
                  <strong>
                    {((currentPage - 1) * pageSize + 1) === Math.min(currentPage * pageSize, filteredAuthors.length)
                      ? (currentPage - 1) * pageSize + 1
                      : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredAuthors.length)}`}
                  </strong>{' '}
                  of <strong>{filteredAuthors.length}</strong>
                </span>
              </div>
            ) : (
              <div className="abv-cards-count-badge">
                <span>
                  {filteredAuthors.length} {filteredAuthors.length === 1 ? 'author' : 'authors'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authors Card Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: '#64748b' }}>
          <RefreshCw className="animate-spin" size={26} style={{ margin: '0 auto 12px', color: '#dc2626' }} />
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Loading author profiles & article metrics...</div>
        </div>
      ) : filteredAuthors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
          <Users size={44} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800 }}>No Authors Found</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 18px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            {search ? `No author profiles matched "${search}". Try clearing your search.` : 'Create your first editorial journalist or contributing writer profile.'}
          </p>
          <button 
            type="button"
            onClick={openCreateModal} 
            className="aav-btn-primary"
            style={{ margin: '0 auto' }}
          >
            <Plus size={16} />
            <span>Add Author Profile</span>
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="aav-list">
              {paginatedAuthors.map((author, index) => {
                const serialNumber = pageSize === 'all' ? index + 1 : (currentPage - 1) * pageSize + index + 1;
                const avatarUrl = author.image || author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';
                const id = author._id || author.slug;
                const isSelected = selectedIds.has(id);
                const publishedCount = author.publishedArticlesCount ?? author.totalPublishedArticles ?? 0;
                const socials = author.socialLinks || {};

                return (
                  <div key={id} className="aav-list-row-item">
                    {/* Checkbox (Left side outside of card) */}
                    <div className="aav-list-check-outside">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(id);
                          else next.delete(id);
                          setSelectedIds(next);
                        }}
                        style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#dc2626' }}
                      />
                    </div>

                    <div
                      className={`aav-list-card ${isSelected ? 'selected' : ''}`}
                    >
                      {/* Top Row: Sr. No -> Logo -> Name (with Staff Reporter below) -> Published Articles */}
                      <div className="aav-list-top-row">
                        <div className="aav-sr-col">
                          <span className="aav-sr-no" title={`Sr. No ${serialNumber}`}>
                            {serialNumber}
                          </span>
                        </div>

                        <img
                          src={avatarUrl}
                          alt={author.name}
                          className="aav-list-avatar"
                          onClick={() => handleOpenAuthorDetails(author.slug || author.name.toLowerCase().replace(/\s+/g, '-'))}
                          style={{ cursor: 'pointer' }}
                          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'; }}
                        />

                        <div className="aav-list-names">
                          <h3 
                            className="aav-author-name" 
                            title={author.name}
                            onClick={() => handleOpenAuthorDetails(author.slug || author.name.toLowerCase().replace(/\s+/g, '-'))}
                            style={{ cursor: 'pointer' }}
                          >
                            {author.name}
                          </h3>
                          <p className="aav-author-designation" title={author.designation || 'Staff Reporter'}>
                            {author.designation || 'Staff Reporter'}
                          </p>
                        </div>

                        <div className="aav-article-count-pill" title="Automatically calculated number of published blog posts assigned to this author">
                          <BookOpen size={11} />
                          <span>{publishedCount} Published {publishedCount === 1 ? 'Article' : 'Articles'}</span>
                        </div>
                      </div>

                {/* Short Biography Snippet */}
                <p className="aav-list-bio" title={author.bio}>
                  {author.bio || 'GoReadPost editorial journalist covering innovative startups, tech disruptors, and founders.'}
                </p>

                {/* List Author Credentials */}
                <div className="aav-list-credentials" style={{
                  fontSize: '0.72rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 8px',
                  borderRadius: '6px'
                }}>
                  <div style={{ color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={author.email}>
                    ✉️ {author.email || ((author.slug || 'author') + '@goreadpost.com')}
                  </div>
                  <div style={{ color: '#dc2626', fontWeight: 700, fontFamily: 'monospace' }}>
                    🔑 {author.password || 'Author@12345'}
                  </div>
                </div>

                {/* Bottom Row: Social Links & Actions in ONE Line */}
                <div className="aav-list-bottom-row">
                  {/* Social Links */}
                  <div className="aav-list-socials">
                    
                    <a
                      href={socials.linkedin || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.linkedin ? '' : 'disabled'}`}
                      title={socials.linkedin ? `LinkedIn: ${socials.linkedin}` : 'No LinkedIn link'}
                    >
                      <SocialSvg name="linkedin" size={13} />
                    </a>

                    <a
                      href={socials.facebook || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.facebook ? '' : 'disabled'}`}
                      title={socials.facebook ? `Facebook: ${socials.facebook}` : 'No Facebook link'}
                    >
                      <SocialSvg name="facebook" size={13} />
                    </a>

                    <a
                      href={socials.instagram || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.instagram ? '' : 'disabled'}`}
                      title={socials.instagram ? `Instagram: ${socials.instagram}` : 'No Instagram link'}
                    >
                      <SocialSvg name="instagram" size={13} />
                    </a>

                    <a
                      href={socials.twitter || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.twitter ? '' : 'disabled'}`}
                      title={socials.twitter ? `X / Twitter: ${socials.twitter}` : 'No X / Twitter link'}
                    >
                      <SocialSvg name="twitter" size={13} />
                    </a>

                    <a
                      href={socials.youtube || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.youtube ? '' : 'disabled'}`}
                      title={socials.youtube ? `YouTube: ${socials.youtube}` : 'No YouTube channel'}
                    >
                      <SocialSvg name="youtube" size={13} />
                    </a>

                    <a
                      href={socials.website || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.website ? '' : 'disabled'}`}
                      title={socials.website ? `Website: ${socials.website}` : 'No Personal Website'}
                    >
                      <SocialSvg name="website" size={13} />
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="aav-list-actions">
                    <div className="aav-card-actions">
                      <button
                        type="button"
                        onClick={() => handleOpenAuthorDetails(author.slug || author.name.toLowerCase().replace(/\s+/g, '-'))}
                        className="aav-btn-action"
                        title="View Author Profile"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(author)}
                        className="aav-btn-action"
                        title="Edit Author Profile"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(author)}
                        className="aav-btn-action delete"
                        title="Delete Author"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        <div className="aav-grid">
          {paginatedAuthors.map((author, index) => {
            const serialNumber = pageSize === 'all' ? index + 1 : (currentPage - 1) * pageSize + index + 1;
            const avatarUrl = author.image || author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';
            const id = author._id || author.slug;
            const isSelected = selectedIds.has(id);
            const publishedCount = author.publishedArticlesCount ?? author.totalPublishedArticles ?? 0;
            const socials = author.socialLinks || {};

            return (
              <div key={id} className="aav-grid-row-wrapper">
                {/* Checkbox (Left side outside of card) */}
                <div className="aav-grid-check-outside">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) next.add(id);
                      else next.delete(id);
                      setSelectedIds(next);
                    }}
                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#dc2626' }}
                  />
                </div>

                <div
                  className={`aav-card ${isSelected ? 'selected' : ''}`}
                >
                  <div>
                    {/* Top Row: Sr. No -> Logo -> Name (with Staff Reporter below) -> Published Articles */}
                    <div className="aav-card-top">
                      <span className="aav-grid-sr-badge" title={`Sr. No ${serialNumber}`}>
                        {serialNumber}
                      </span>

                      <img
                        src={avatarUrl}
                        alt={author.name}
                        className="aav-avatar"
                        onClick={() => handleOpenAuthorDetails(author.slug || author.name.toLowerCase().replace(/\s+/g, '-'))}
                        style={{ cursor: 'pointer' }}
                        onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'; }}
                      />

                      <div className="aav-author-names">
                        <h3 
                          className="aav-author-name" 
                          title={author.name}
                          onClick={() => handleOpenAuthorDetails(author.slug || author.name.toLowerCase().replace(/\s+/g, '-'))}
                          style={{ cursor: 'pointer' }}
                        >
                          {author.name}
                        </h3>
                        <p className="aav-author-designation" title={author.designation || 'Staff Reporter'}>
                          {author.designation || 'Staff Reporter'}
                        </p>
                      </div>

                      <div className="aav-article-count-pill" title="Automatically calculated number of published blog posts assigned to this author">
                        <BookOpen size={11} />
                        <span>{publishedCount} Published {publishedCount === 1 ? 'Article' : 'Articles'}</span>
                      </div>
                    </div>

                  {/* 4. Short Biography Snippet */}
                  <p className="aav-card-bio" title={author.bio}>
                    {author.bio || 'GoReadPost editorial journalist covering innovative startups, tech disruptors, and founders.'}
                  </p>

                  {/* Author Login Credentials Box */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    marginBottom: '10px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b' }}>Email:</span>
                      <strong style={{ color: '#0f172a' }}>{author.email || ((author.slug || 'author') + '@goreadpost.com')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b' }}>Password:</span>
                      <strong style={{ color: '#dc2626', fontFamily: 'monospace', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px' }}>
                        {author.password || 'Author@12345'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 5. Social Media Links & Action Buttons in ONE Line */}
                <div className="aav-card-bottom-row">
                  {/* Social Media Links Row */}
                  <div className="aav-card-socials">
                    
                    {/* LinkedIn */}
                    <a
                      href={socials.linkedin || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.linkedin ? '' : 'disabled'}`}
                      title={socials.linkedin ? `LinkedIn: ${socials.linkedin}` : 'No LinkedIn link'}
                    >
                      <SocialSvg name="linkedin" size={13} />
                    </a>

                    {/* Facebook */}
                    <a
                      href={socials.facebook || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.facebook ? '' : 'disabled'}`}
                      title={socials.facebook ? `Facebook: ${socials.facebook}` : 'No Facebook link'}
                    >
                      <SocialSvg name="facebook" size={13} />
                    </a>

                    {/* Instagram */}
                    <a
                      href={socials.instagram || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.instagram ? '' : 'disabled'}`}
                      title={socials.instagram ? `Instagram: ${socials.instagram}` : 'No Instagram link'}
                    >
                      <SocialSvg name="instagram" size={13} />
                    </a>

                    {/* X (Twitter) */}
                    <a
                      href={socials.twitter || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.twitter ? '' : 'disabled'}`}
                      title={socials.twitter ? `X / Twitter: ${socials.twitter}` : 'No X / Twitter link'}
                    >
                      <SocialSvg name="twitter" size={13} />
                    </a>

                    {/* YouTube */}
                    <a
                      href={socials.youtube || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.youtube ? '' : 'disabled'}`}
                      title={socials.youtube ? `YouTube: ${socials.youtube}` : 'No YouTube channel'}
                    >
                      <SocialSvg name="youtube" size={13} />
                    </a>

                    {/* Personal Website */}
                    <a
                      href={socials.website || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`aav-social-icon-btn ${socials.website ? '' : 'disabled'}`}
                      title={socials.website ? `Website: ${socials.website}` : 'No Personal Website'}
                    >
                      <SocialSvg name="website" size={13} />
                    </a>
                  </div>

                  {/* Card Footer: Action Buttons */}
                  <div className="aav-card-footer">
                    <div className="aav-card-actions">
                      <button
                        type="button"
                        onClick={() => handleOpenAuthorDetails(author.slug || author.name.toLowerCase().replace(/\s+/g, '-'))}
                        className="aav-btn-action"
                        title="View Author Profile"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(author)}
                        className="aav-btn-action"
                        title="Edit Author Profile"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(author)}
                        className="aav-btn-action delete"
                        title="Delete Author"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* ── Modern Pagination Bar ── */}
      {filteredAuthors.length > 0 && (
        <div className="abv-pagination-bar">
          <div className="abv-pagination-left">
            <div className="abv-pagination-info">
              {pageSize === 'all' ? (
                <>Showing all <span className="abv-pg-bold">{filteredAuthors.length}</span> authors</>
              ) : (
                <>
                  Showing{' '}
                  <span className="abv-pg-bold">
                    {((currentPage - 1) * pageSize + 1) === Math.min(currentPage * pageSize, filteredAuthors.length)
                      ? (currentPage - 1) * pageSize + 1
                      : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredAuthors.length)}`}
                  </span>{' '}
                  of <span className="abv-pg-bold">{filteredAuthors.length}</span> authors
                </>
              )}
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

      {/* Modal Dialog: Edit / Create Author Profile */}
      {renderEditModal()}
    </div>
  );
}
