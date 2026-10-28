import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Search, ExternalLink, RefreshCw, AlertCircle, X, 
  CheckSquare, Upload, Globe, BookOpen, Lock, Camera, Check, Eye, ArrowLeft, 
  Calendar, FileText, User
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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Single Author Details Page state (/admin/authors/:author_name)
  const [singleAuthorData, setSingleAuthorData] = useState(null);
  const [singleAuthorLoading, setSingleAuthorLoading] = useState(false);
  const [singleAuthorError, setSingleAuthorError] = useState(null);

  // Author Edit/Create Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    designation: '',
    bio: '',
    image: '',
    profileImage: '',
    email: '',
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
      email: author.email || '',
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
        email: formData.email.trim(),
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

  const filteredAuthors = authors.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.designation?.toLowerCase().includes(search.toLowerCase()) ||
    a.slug?.toLowerCase().includes(search.toLowerCase()) ||
    a.bio?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Modal Form Renderer ──
  const renderEditModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="aav-modal-overlay">
        <div className="aav-modal">
          <div className="aav-modal-header">
            <h3 className="aav-modal-title">
              {editingAuthor ? `Edit Author: ${editingAuthor.name}` : 'Create Author Profile'}
            </h3>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>
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

                    <input
                      type="url"
                      placeholder="Or enter image URL (e.g. https://...)"
                      value={formData.image}
                      onChange={e => setFormData(prev => ({ ...prev, image: e.target.value, profileImage: e.target.value }))}
                      className="aav-photo-url-input"
                    />
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

              {/* 6. Total Published Articles (Locked Auto-Calculated Field) */}
              <div className="aav-form-section" style={{ marginBottom: 0 }}>
                <div className="aav-locked-metric-box">
                  <div className="aav-metric-info">
                    <span className="aav-metric-title">
                      <Lock size={13} />
                      <span>6. Total Published Articles (Auto-Calculated)</span>
                    </span>
                    <p className="aav-metric-subtext">
                      Automatically calculated based on published blog posts assigned to this author. Manual editing is locked and updates automatically when articles are published or unpublished.
                    </p>
                  </div>

                  <div className="aav-metric-badge" title="Live published count">
                    {formData.publishedArticlesCount} {formData.publishedArticlesCount === 1 ? 'Article' : 'Articles'}
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

  // ══════════════════════════════════════════════════════════════════
  // ── VIEW 1: DEDICATED AUTHOR DETAILS PAGE (/admin/authors/:slug) ──
  // ══════════════════════════════════════════════════════════════════
  if (authorSlug) {
    const author = singleAuthorData?.author;
    const articles = singleAuthorData?.articles || [];
    const publishedCount = author?.publishedArticlesCount ?? author?.totalPublishedArticles ?? articles.length;
    const socials = author?.socialLinks || {};

    return (
      <div className="aav-detail-container">
        {/* Navigation & Breadcrumb */}
        <div className="aav-detail-nav-bar">
          <div className="aav-detail-breadcrumb">
            <button
              type="button"
              onClick={handleBackToList}
              className="aav-detail-btn-back"
              title="Return to Authors list"
            >
              <ArrowLeft size={14} />
              <span>All Authors</span>
            </button>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>
              {author ? author.name : authorSlug}
            </span>
          </div>

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

                    <div className="aav-detail-badges-row">
                      <div className="aav-detail-badge-metric" title="Auto-calculated published articles count">
                        <BookOpen size={13} />
                        <span>{publishedCount} Published {publishedCount === 1 ? 'Article' : 'Articles'}</span>
                        <Lock size={11} style={{ opacity: 0.7 }} />
                      </div>
                    </div>
                  </div>
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

                {/* Published Articles Card */}
                <div className="aav-detail-card">
                  <div className="aav-detail-card-header">
                    <h3 className="aav-detail-card-title">
                      <BookOpen size={16} color="#dc2626" />
                      <span>Published Articles ({articles.length})</span>
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      Live Attribution
                    </span>
                  </div>

                  {articles.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                      <p style={{ margin: 0, fontSize: '0.88rem' }}>
                        No published articles currently assigned to this author.
                      </p>
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
                                <h4 className="aav-detail-article-title" title={art.title}>
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
                                    <span>• {art.views} views</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="aav-detail-article-actions">
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
                  )}
                </div>
              </div>

              {/* Right Column: Social Media Links & Metadata */}
              <div>
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
                      <span>Email:</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{author.email || 'Not provided'}</span>
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

  // ══════════════════════════════════════════════════════════════════
  // ── VIEW 2: AUTHORS LIST WORKSPACE (/admin/authors) ───────────────
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="aav-root">
      
      {/* ── Page Header ── */}
      <div className="aav-header-wrap">
        <div className="aav-header-title-box">
          <h1>Author Profiles</h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="aav-btn-primary"
        >
          <Plus size={16} />
          <span>Add New Author</span>
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '10px', color: '#dc2626', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
        </div>
      )}

      {/* ── Toolbar: Search & Controls ── */}
      <div className="aav-toolbar-wrap">
        <div className="aav-toolbar-left">
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
        </div>

        <div className="aav-toolbar-right">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 600, userSelect: 'none' }}>
            <input 
              type="checkbox"
              checked={selectedIds.size > 0 && selectedIds.size === filteredAuthors.length}
              onChange={(e) => {
                if (e.target.checked) setSelectedIds(new Set(filteredAuthors.map(a => a._id || a.slug)));
                else setSelectedIds(new Set());
              }}
              style={{ accentColor: '#dc2626', width: '15px', height: '15px', cursor: 'pointer' }}
            />
            <span>Select All</span>
          </label>

          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
            {filteredAuthors.length} {filteredAuthors.length === 1 ? 'Author' : 'Authors'}
          </span>

          <button 
            type="button"
            onClick={loadAuthors} 
            className="aav-btn-refresh" 
            title="Refresh authors list"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Authors Card Grid ── */}
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
        <div className="aav-grid">
          {filteredAuthors.map((author) => {
            const avatarUrl = author.image || author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';
            const id = author._id || author.slug;
            const isSelected = selectedIds.has(id);
            const publishedCount = author.publishedArticlesCount ?? author.totalPublishedArticles ?? 0;
            const socials = author.socialLinks || {};

            return (
              <div
                key={id}
                className={`aav-card ${isSelected ? 'selected' : ''}`}
              >
                <div>
                  {/* Top Row: Avatar, Names, Checkbox */}
                  <div className="aav-card-top">
                    <div className="aav-card-author-info">
                      <img
                        src={avatarUrl}
                        alt={author.name}
                        className="aav-avatar"
                        onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'; }}
                      />
                      <div className="aav-author-names">
                        <h3 className="aav-author-name" title={author.name}>{author.name}</h3>
                        <p className="aav-author-designation" title={author.designation || 'Staff Reporter'}>
                          {author.designation || 'Staff Reporter'}
                        </p>
                        
                        {/* 6. Total Published Articles Metric Badge */}
                        <div className="aav-article-count-pill" title="Automatically calculated number of published blog posts assigned to this author">
                          <BookOpen size={12} />
                          <span>{publishedCount} Published {publishedCount === 1 ? 'Article' : 'Articles'}</span>
                        </div>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        if (e.target.checked) next.add(id);
                        else next.delete(id);
                        setSelectedIds(next);
                      }}
                      style={{ cursor: 'pointer', width: '17px', height: '17px', accentColor: '#dc2626' }}
                    />
                  </div>

                  {/* 4. Short Biography Snippet */}
                  <p className="aav-card-bio" title={author.bio}>
                    {author.bio || 'GoReadPost editorial journalist covering innovative startups, tech disruptors, and founders.'}
                  </p>
                </div>

                <div>
                  {/* 5. Social Media Links Row */}
                  <div className="aav-card-socials">
                    <span style={{ fontSize: '0.72rem', fontWeight: 750, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
                      Social:
                    </span>
                    
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

                  {/* Card Footer: View Profile (Opens /admin/authors/:slug) & Action Buttons */}
                  <div className="aav-card-footer">
                    <a
                      href={`/admin/authors/${encodeURIComponent(author.slug || author.name.toLowerCase().replace(/\s+/g, '-'))}`}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                          e.preventDefault();
                          handleOpenAuthorDetails(author.slug || author.name.toLowerCase().replace(/\s+/g, '-'));
                        }
                      }}
                      className="aav-link-public"
                      title={`Open author details page for ${author.name}`}
                    >
                      <Eye size={13} />
                      <span>View Profile</span>
                    </a>

                    <div className="aav-card-actions">
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
            );
          })}
        </div>
      )}

      {/* Modal Dialog: Edit / Create Author Profile */}
      {renderEditModal()}
    </div>
  );
}
