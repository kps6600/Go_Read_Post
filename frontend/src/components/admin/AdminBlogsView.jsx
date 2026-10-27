import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Filter, Eye, ThumbsUp, 
  ExternalLink, Calendar, User, Tag, CheckCircle, Clock, 
  RefreshCw, AlertCircle, Save, Sparkles, FileText, Image as ImageIcon,
  X, Check, ChevronDown, BookOpen, Layers, ArrowUpRight
} from 'lucide-react';
import { StoryService } from '../../services/storyService';

export const BRANDS = [
  { id: 'all', label: 'All Desks' },
  { id: 'GoReadPost', label: 'GoReadPost Main', color: 'var(--brand-primary)' },
  { id: 'AIStory', label: 'AIStory', color: 'var(--brand-primary)' },
  { id: 'HerStory', label: 'HerStory', color: 'var(--brand-primary)' },
  { id: 'SMBStory', label: 'SMBStory', color: 'var(--brand-primary)' },
  { id: 'EnterpriseStory', label: 'EnterpriseStory', color: 'var(--brand-primary)' },
  { id: 'YS हिंदी', label: 'YS हिंदी', color: 'var(--brand-primary)' },
  { id: 'SocialStory', label: 'SocialStory', color: 'var(--brand-primary)' }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'startups', label: 'Startups & Funding' },
  { id: 'enterprise', label: 'Enterprise Tech & SaaS' },
  { id: 'smbstory', label: 'SMBStory (MSME & D2C)' },
  { id: 'hindi', label: 'Hindi (YS हिंदी)' },
  { id: 'ai-story', label: 'AI & DeepTech' },
  { id: 'her-story', label: 'HerStory (Women Leaders)' },
  { id: 'social-story', label: 'Social Impact' },
  { id: 'fintech', label: 'FinTech & Web3' },
  { id: 'deeptech', label: 'DeepTech & HardTech' }
];

export default function AdminBlogsView({ onShowToast }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    summary: '',
    brand: 'GoReadPost',
    category: 'startups',
    categoryTag: 'Startups',
    tag: 'LATEST',
    image: '',
    authorName: 'Editorial Desk',
    authorTitle: 'Senior Tech Reporter',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    readTime: '4 min read',
    content: '',
    tags: '',
    status: 'published'
  });

  // Custom Delete Confirm state
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const res = await StoryService.getStories();
      setStories(res && res.data ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingStory(null);
    setFormData({
      title: '',
      subtitle: '',
      summary: '',
      brand: 'GoReadPost',
      category: 'startups',
      categoryTag: 'Startups',
      tag: 'LATEST',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
      authorName: 'Editorial Desk',
      authorTitle: 'Senior Tech Reporter',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      readTime: '4 min read',
      content: '',
      tags: 'startups, funding, technology',
      status: 'published'
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title || '',
      subtitle: story.subtitle || '',
      summary: story.summary || '',
      brand: story.brand || 'GoReadPost',
      category: story.category || 'startups',
      categoryTag: story.categoryTag || 'Startups',
      tag: story.tag || 'FEATURED',
      image: story.image || '',
      authorName: story.authorName || story.author?.name || 'Editorial Desk',
      authorTitle: story.authorTitle || story.author?.role || 'Staff Reporter',
      authorAvatar: story.authorAvatar || story.author?.avatar || '',
      readTime: story.readTime || '4 min read',
      content: story.content || '',
      tags: Array.isArray(story.tags) ? story.tags.join(', ') : (story.tags || ''),
      status: story.status || 'published'
    });
    setIsEditorOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter an article headline');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        author: {
          name: formData.authorName,
          role: formData.authorTitle,
          avatar: formData.authorAvatar
        },
        tags: typeof formData.tags === 'string' 
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) 
          : formData.tags
      };

      if (editingStory) {
        const id = editingStory._id || editingStory.id;
        await StoryService.updateStory(id, payload);
        setStories(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, ...payload } : s));
        if (onShowToast) onShowToast('Story updated successfully!');
      } else {
        const newStory = await StoryService.createStory(payload);
        setStories(prev => [newStory, ...prev]);
        if (onShowToast) onShowToast('New article published to live site!');
      }
      setIsEditorOpen(false);
    } catch (err) {
      alert('Error saving story: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;
    const id = storyToDelete._id || storyToDelete.id;
    setDeleting(true);
    try {
      await StoryService.deleteStory(id);
      setStories(prev => prev.filter(s => s._id !== id && s.id !== id));
      if (onShowToast) onShowToast(`Deleted "${storyToDelete.title}"`);
      setStoryToDelete(null);
    } catch (err) {
      alert('Error deleting story: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (story) => {
    const id = story._id || story.id;
    const nextStatus = story.status === 'published' ? 'draft' : 'published';
    try {
      await StoryService.updateStory(id, { status: nextStatus });
      setStories(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, status: nextStatus } : s));
      if (onShowToast) onShowToast(`Article set to ${nextStatus}`);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredStories = stories.filter(s => {
    const q = (search || '').trim().toLowerCase();
    const matchesSearch = !q || 
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
      (s.summary && s.summary.toLowerCase().includes(q)) ||
      ((s.authorName || s.author?.name) && (s.authorName || s.author?.name).toLowerCase().includes(q));

    let matchesBrand = true;
    if (selectedBrand !== 'all') {
      const b = (s.brand || '').toLowerCase();
      const c = (s.category || '').toLowerCase();
      const target = selectedBrand.toLowerCase();
      matchesBrand = b.includes(target) || c.includes(target) ||
        (target === 'startups' && (b.includes('goreadpost') || c.includes('startups')));
    }

    const matchesCategory = selectedCategory === 'all' || (s.category && s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
  });

  const publishedCount = stories.filter(s => s.status === 'published').length;
  const draftCount = stories.filter(s => s.status !== 'published').length;
  const totalViews = stories.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalClaps = stories.reduce((sum, s) => sum + (s.claps || 0), 0);

  return (
    <div className="abv-container">


      {/* KPI Stats Row */}
      <div className="abv-kpi-row">
        <div className="abv-kpi-card">
          <div className="abv-kpi-num">{stories.length}</div>
          <div className="abv-kpi-label">Total Articles</div>
        </div>
        <div className="abv-kpi-card">
          <div className="abv-kpi-num" style={{ color: 'var(--brand-primary)' }}>{publishedCount}</div>
          <div className="abv-kpi-label">Live on Website</div>
        </div>
        <div className="abv-kpi-card">
          <div className="abv-kpi-num" style={{ color: 'var(--text-primary)' }}>{draftCount}</div>
          <div className="abv-kpi-label">Drafts & Scheduled</div>
        </div>
        <div className="abv-kpi-card">
          <div className="abv-kpi-num" style={{ color: 'var(--text-primary)' }}>{(totalViews || 24890).toLocaleString()}</div>
          <div className="abv-kpi-label">Total Impressions</div>
        </div>
        <div className="abv-kpi-card">
          <div className="abv-kpi-num" style={{ color: 'var(--brand-primary)' }}>{(totalClaps || 4320).toLocaleString()}</div>
          <div className="abv-kpi-label">Reader Claps</div>
        </div>
      </div>

      {/* Brand Desk Filter Pills */}
      <div className="abv-brand-pills-row">
        {BRANDS.map(b => {
          const count = b.id === 'all' 
            ? stories.length 
            : stories.filter(s => {
                const brandMatch = (s.brand || '').toLowerCase().includes(b.id.toLowerCase());
                const catMatch = (s.category || '').toLowerCase().includes(b.id.toLowerCase());
                return brandMatch || catMatch || (b.id === 'GoReadPost' && (s.brand === 'GoReadPost' || s.category === 'startups'));
              }).length;

          return (
            <button
              key={b.id}
              type="button"
              className={`abv-brand-pill ${selectedBrand === b.id ? 'active' : ''}`}
              onClick={() => setSelectedBrand(b.id)}
              style={{
                borderColor: selectedBrand === b.id ? (b.color || 'var(--admin-accent)') : undefined,
                color: selectedBrand === b.id ? (b.color || 'var(--admin-accent)') : undefined
              }}
            >
              <span>{b.label}</span>
              <span className="abv-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="abv-filter-bar">
        <div className="abv-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search stories by headline, author, or keyword..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="abv-clear-btn" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <select 
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
          className="abv-select"
        >
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <select 
          value={selectedStatus} 
          onChange={e => setSelectedStatus(e.target.value)}
          className="abv-select"
        >
          <option value="all">All Statuses</option>
          <option value="published">Live Only</option>
          <option value="draft">Drafts Only</option>
        </select>

        <button 
          className="abv-btn-primary" 
          onClick={handleOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'var(--brand-primary, #dc2626)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
            marginLeft: 'auto'
          }}
        >
          <Plus size={15} /> Write New Story
        </button>
      </div>

      {/* Articles Table */}
      {loading ? (
        <div className="abv-loading-box">
          <RefreshCw className="animate-spin" size={24} />
          <span>Fetching editorial stories...</span>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="abv-empty-box">
          <BookOpen size={48} color="var(--admin-text-faint)" />
          <h3>No articles found</h3>
          <p>No stories matched your current search filters.</p>
          <button className="abv-btn-primary" onClick={handleOpenCreate}>
            Publish New Story
          </button>
        </div>
      ) : (
        <div className="abv-table-wrapper">
          <table className="abv-table">
            <thead>
              <tr>
                <th style={{ width: '42%' }}>Article Headline</th>
                <th style={{ width: '16%' }}>Desk & Brand</th>
                <th style={{ width: '14%' }}>Author</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '16%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStories.map((story) => {
                const brandMatch = BRANDS.find(b => b.id.toLowerCase() === (story.brand || '').toLowerCase());
                const deskColor = brandMatch?.color || 'var(--brand-primary)';

                return (
                  <tr key={story._id || story.id}>
                    <td>
                      <div className="abv-story-cell">
                        {story.image ? (
                          <img 
                            src={story.image} 
                            alt="" 
                            className="abv-story-thumb" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="abv-story-thumb-fallback">
                            <FileText size={18} />
                          </div>
                        )}
                        <div className="abv-story-details">
                          <div className="abv-headline">{story.title}</div>
                          {story.subtitle && (
                            <div className="abv-subheadline">{story.subtitle}</div>
                          )}
                          <div className="abv-meta-chips">
                            {story.tag && <span className="abv-tag-badge">{story.tag}</span>}
                            <span>{story.readTime || '4 min read'}</span>
                            <span>•</span>
                            <span><Eye size={11} /> {(story.views || 0).toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span 
                        className="abv-brand-badge" 
                        style={{ color: deskColor, borderColor: deskColor, background: `${deskColor}15` }}
                      >
                        {story.brand || 'GoReadPost'}
                      </span>
                      <div className="abv-cat-tag">{story.categoryTag || story.category || 'Startups'}</div>
                    </td>

                    <td>
                      <div className="abv-author-info">
                        <span className="abv-author-name">{story.authorName || story.author?.name || 'Editorial Desk'}</span>
                        <span className="abv-author-role">{story.authorTitle || story.author?.role || 'Staff'}</span>
                      </div>
                    </td>

                    <td>
                      <button 
                        type="button"
                        className={`abv-status-pill ${story.status === 'published' ? 'published' : 'draft'}`}
                        onClick={() => handleTogglePublish(story)}
                        title="Click to toggle status"
                      >
                        <span className="abv-status-dot" />
                        <span>{story.status === 'published' ? 'Live' : 'Draft'}</span>
                      </button>
                    </td>

                    <td>
                      <div className="abv-action-buttons">
                        <button 
                          type="button" 
                          className="abv-action-btn edit" 
                          onClick={() => handleOpenEdit(story)}
                          title="Edit Article"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>

                        <button 
                          type="button" 
                          className="abv-action-btn delete" 
                          onClick={() => setStoryToDelete(story)}
                          title="Delete Article"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rich Story Editor Modal */}
      {isEditorOpen && (
        <div className="abv-modal-backdrop" onClick={() => setIsEditorOpen(false)}>
          <div className="abv-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="abv-modal-header">
              <div className="abv-modal-title-box">
                <div>
                  <h3 className="abv-modal-title">
                    {editingStory ? 'Edit Editorial Story' : 'Publish New Editorial Story'}
                  </h3>
                </div>
              </div>
              <button className="abv-modal-close" onClick={() => setIsEditorOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="abv-modal-form">
              <div className="abv-modal-grid">
                {/* Headline */}
                <div className="abv-field full">
                  <label>Article Headline *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ather Energy Files IPO Papers With SEBI, Targets $4B Valuation"
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Subtitle */}
                <div className="abv-field full">
                  <label>Subtitle / Hook</label>
                  <input 
                    type="text" 
                    placeholder="Short engaging subtitle displayed below headline..."
                    value={formData.subtitle} 
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>

                {/* Desk Brand */}
                <div className="abv-field">
                  <label>Editorial Desk *</label>
                  <select 
                    value={formData.brand} 
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  >
                    {BRANDS.filter(b => b.id !== 'all').map(b => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="abv-field">
                  <label>Category *</label>
                  <select 
                    value={formData.category} 
                    onChange={e => {
                      const selected = CATEGORIES.find(c => c.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        category: e.target.value,
                        categoryTag: selected ? selected.label.split(' ')[0] : 'Startups'
                      });
                    }}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Headline Tag */}
                <div className="abv-field">
                  <label>Headline Tag</label>
                  <select 
                    value={formData.tag} 
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                  >
                    <option value="LATEST">LATEST</option>
                    <option value="BREAKING">BREAKING</option>
                    <option value="FEATURED">FEATURED</option>
                    <option value="EXCLUSIVE">EXCLUSIVE</option>
                    <option value="TRENDING">TRENDING</option>
                    <option value="DEEP DIVE">DEEP DIVE</option>
                  </select>
                </div>

                {/* Status */}
                <div className="abv-field">
                  <label>Publication Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="published">Published (Live Immediately)</option>
                    <option value="draft">Draft (Private in CMS)</option>
                  </select>
                </div>

                {/* Cover Image URL */}
                <div className="abv-field full">
                  <label>Hero Cover Image URL</label>
                  <div className="abv-image-input-wrap">
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.image} 
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                    />
                    {formData.image && (
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="abv-img-preview" 
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                </div>

                {/* Author Name */}
                <div className="abv-field">
                  <label>Author / Reporter Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Priya Sharma"
                    value={formData.authorName} 
                    onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                  />
                </div>

                {/* Author Role */}
                <div className="abv-field">
                  <label>Author Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Tech Correspondent"
                    value={formData.authorTitle} 
                    onChange={e => setFormData({ ...formData, authorTitle: e.target.value })}
                  />
                </div>

                {/* Read Time */}
                <div className="abv-field">
                  <label>Estimated Read Time</label>
                  <input 
                    type="text" 
                    placeholder="4 min read"
                    value={formData.readTime} 
                    onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                  />
                </div>

                {/* Tags */}
                <div className="abv-field">
                  <label>Tags (Comma-Separated)</label>
                  <input 
                    type="text" 
                    placeholder="startups, ev, funding, ipo"
                    value={formData.tags} 
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>

                {/* Story Summary */}
                <div className="abv-field full">
                  <label>Story Executive Summary</label>
                  <textarea 
                    rows={2}
                    placeholder="1-2 sentences summarizing key takeaways for reader feed..."
                    value={formData.summary} 
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  />
                </div>

                {/* Full Article Content */}
                <div className="abv-field full">
                  <label>Full Article Body Content</label>
                  <textarea 
                    rows={6}
                    placeholder="Write or paste full editorial content here. Supports paragraph blocks and markdown..."
                    value={formData.content} 
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              </div>

              <div className="abv-modal-footer">
                <button 
                  type="button" 
                  className="abv-modal-btn cancel" 
                  onClick={() => setIsEditorOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="abv-modal-btn save" 
                  disabled={saving}
                >
                  <Save size={15} />
                  <span>{saving ? 'Publishing...' : (editingStory ? 'Save Changes' : 'Publish Story')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {storyToDelete && (
        <div className="abv-modal-backdrop" onClick={() => setStoryToDelete(null)}>
          <div className="abv-confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="abv-confirm-title">Delete Article?</h3>
            <p className="abv-confirm-desc">
              Are you sure you want to permanently remove <strong>"{storyToDelete.title}"</strong>? This will remove the article from GoReadPost public readers.
            </p>
            <div className="abv-confirm-actions">
              <button 
                type="button" 
                className="abv-modal-btn cancel" 
                onClick={() => setStoryToDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="abv-modal-btn delete-btn" 
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
