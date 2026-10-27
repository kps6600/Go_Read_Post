import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Search, ExternalLink, RefreshCw, AlertCircle, X, Mail, CheckSquare
} from 'lucide-react';
import { TaxonomyService } from '../../services/taxonomyService';

export default function AdminAuthorsView({ onShowToast }) {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    designation: '',
    bio: '',
    image: '',
    email: '',
    socialLinks: {
      twitter: '',
      linkedin: ''
    }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TaxonomyService.getAuthors();
      setAuthors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAuthor(null);
    setFormData({
      name: '',
      slug: '',
      designation: 'Staff Reporter',
      bio: '',
      image: '',
      email: '',
      socialLinks: { twitter: '', linkedin: '' }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name || '',
      slug: author.slug || '',
      designation: author.designation || 'Staff Reporter',
      bio: author.bio || '',
      image: author.image || author.profileImage || '',
      email: author.email || '',
      socialLinks: {
        twitter: author.socialLinks?.twitter || '',
        linkedin: author.socialLinks?.linkedin || ''
      }
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setSaving(true);
    try {
      if (editingAuthor) {
        await TaxonomyService.updateAuthor(editingAuthor._id, formData);
        if (onShowToast) onShowToast(`Author "${formData.name}" updated!`);
      } else {
        await TaxonomyService.createAuthor(formData);
        if (onShowToast) onShowToast(`Author "${formData.name}" created!`);
      }
      setIsModalOpen(false);
      loadAuthors();
    } catch (err) {
      alert(err.message || 'Error saving author');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (author) => {
    if (!window.confirm(`Delete author "${author.name}"? Articles by this author will remain published.`)) return;
    try {
      await TaxonomyService.deleteAuthor(author._id);
      if (onShowToast) onShowToast(`Author "${author.name}" deleted`);
      loadAuthors();
    } catch (err) {
      alert(err.message || 'Error deleting author');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected authors? Articles will remain published.`)) return;
    setBulkDeleting(true);
    try {
      await TaxonomyService.bulkDeleteAuthors(Array.from(selectedIds));
      if (onShowToast) onShowToast(`Deleted ${count} authors successfully`);
      setSelectedIds(new Set());
      loadAuthors();
    } catch (err) {
      alert(err.message || 'Error during bulk delete');
    } finally {
      setBulkDeleting(false);
    }
  };

  const filteredAuthors = authors.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.designation?.toLowerCase().includes(search.toLowerCase()) ||
    a.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-container">


      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              padding: '4px 12px',
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
              {selectedIds.size === filteredAuthors.length ? 'All filtered authors selected' : `${selectedIds.size} of ${filteredAuthors.length} authors selected`}
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set(filteredAuthors.map(a => a._id || a.slug)))}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
            >
              Select All ({filteredAuthors.length})
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search authors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>
            <input 
              type="checkbox"
              checked={selectedIds.size > 0 && selectedIds.size === filteredAuthors.length}
              onChange={(e) => {
                if (e.target.checked) setSelectedIds(new Set(filteredAuthors.map(a => a._id || a.slug)));
                else setSelectedIds(new Set());
              }}
            />
            <span>Select All</span>
          </label>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{filteredAuthors.length} Authors</span>
          <button onClick={loadAuthors} style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }} title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              background: 'var(--brand-primary, #0ea5e9)', color: '#fff', border: 'none', borderRadius: '8px',
              fontWeight: '600', fontSize: '0.84rem', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)'
            }}
          >
            <Plus size={15} />
            <span>Add New Author</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
          <div>Loading authors...</div>
        </div>
      ) : filteredAuthors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <Users size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px' }}>No Authors Found</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px' }}>Create your first news author or editorial byline.</p>
          <button onClick={openCreateModal} style={{ padding: '8px 16px', background: 'var(--brand-primary, #0ea5e9)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Add First Author
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredAuthors.map((author) => {
            const avatarUrl = author.image || author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';
            const id = author._id || author.slug;
            const isSelected = selectedIds.has(id);
            return (
              <div
                key={id}
                style={{
                  background: isSelected ? '#fff1f2' : '#fff', padding: '20px', borderRadius: '12px',
                  border: isSelected ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={avatarUrl}
                        alt={author.name}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                        onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'; }}
                      />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{author.name}</h3>
                        <span style={{ fontSize: '13px', color: 'var(--brand-primary, #0ea5e9)', fontWeight: '600' }}>
                          {author.designation || 'Staff Reporter'}
                        </span>
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
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  </div>

                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {author.bio || 'GoReadPost editorial journalist covering innovative startups, tech disruptors, and founders.'}
                  </p>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a
                    href={`/author/${author.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: 'var(--brand-primary, #0ea5e9)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                  >
                    <span>View /author/{author.slug}</span>
                    <ExternalLink size={12} />
                  </a>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => openEditModal(author)}
                      style={{ padding: '6px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#334155' }}
                      title="Edit Author"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(author)}
                      style={{ padding: '6px', border: '1px solid #fecaca', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                      title="Delete Author"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '560px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                {editingAuthor ? `Edit Author: ${editingAuthor.name}` : 'Add New Editorial Author'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rekha Balakrishnan"
                    value={formData.name}
                    onChange={e => handleNameChange(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rekha-balakrishnan"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Designation / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Tech Editor"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Avatar Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Author Biography</label>
                <textarea
                  rows={3}
                  placeholder="Short bio shown on author profile and byline cards..."
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Twitter / X URL</label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/..."
                    value={formData.socialLinks.twitter}
                    onChange={e => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.socialLinks.linkedin}
                    onChange={e => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '8px 18px', background: 'var(--brand-primary, #0ea5e9)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {saving ? 'Saving...' : editingAuthor ? 'Update Author' : 'Create Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
