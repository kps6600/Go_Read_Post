import React, { useState } from 'react';
import { ArrowLeft, Save, Sparkles, Check, AlertCircle, X, ExternalLink, Layers, Hash } from 'lucide-react';
import { PageService } from '../../services/pageService';

const BRAND_DESKS = [
  { id: 'GoReadPost', label: 'GoReadPost Main (Network)' },
  { id: 'AIStory', label: 'AIStory (DeepTech & AI)' },
  { id: 'HerStory', label: 'HerStory (Women Leaders)' },
  { id: 'SMBStory', label: 'SMBStory (MSME & D2C)' },
  { id: 'EnterpriseStory', label: 'EnterpriseStory (B2B SaaS)' },
  { id: 'YS हिंदी', label: 'YS हिंदी (Regional Bharat)' },
  { id: 'SocialStory', label: 'SocialStory (Impact & Climate)' }
];

export default function AdminPageCreate({ onNavigate, onShowToast }) {
  const [pageType, setPageType] = useState('standard'); // 'standard' | 'topic' | 'category'
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('GoReadPost');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [status, setStatus] = useState('draft');
  const [addStarterHero, setAddStarterHero] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-slug generator
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
      if (!seoTitle) {
        setSeoTitle(`${val} | GoReadPost`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title for the page.');
      return;
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!cleanSlug) {
      setError('Please provide a valid slug (e.g. seo-services).');
      return;
    }

        setLoading(true);
    try {
      const finalSlug = pageType === 'topic' 
        ? `topic/${cleanSlug}`
        : pageType === 'category'
        ? `category/${cleanSlug}`
        : cleanSlug;

      if (pageType === 'topic') {
        // Also register in Taxonomy
        await TaxonomyService.createTopic({
          name: title.trim(),
          slug: cleanSlug,
          description: description.trim(),
          seoTitle: seoTitle.trim() || `${title.trim()} Topics & Articles | GoReadPost`,
          seoDescription: seoDescription.trim() || description.trim()
        }).catch(() => null);
      }

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        pageType,
        brand,
        description: description.trim(),
        status,
        seo: {
          title: seoTitle.trim() || (pageType === 'topic' ? `${title.trim()} Topics & Articles | GoReadPost` : `${title.trim()} | GoReadPost`),
          description: seoDescription.trim() || description.trim() || `Explore ${title.trim()} on GoReadPost.`,
          keywords: seoKeywords ? seoKeywords.split(',').map(s => s.trim()).filter(Boolean) : []
        },
        sections: addStarterHero ? [
          {
            id: 'sec_' + Date.now(),
            type: 'hero',
            order: 1,
            enabled: true,
            data: {
              heading: title.trim(),
              subheading: description.trim() || (pageType === 'topic' ? 'Comprehensive coverage, analyses, and stories.' : 'Comprehensive guide, insights, and coverage on GoReadPost.'),
              buttonText: 'Explore Coverage',
              buttonUrl: '#content',
              image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'
            }
          }
        ] : []
      };

      const created = await PageService.createPage(payload);
      onShowToast?.(`Page "${created.title}" created successfully!`);

      if (pageType === 'topic') {
        onNavigate(`/admin/topic/${cleanSlug}`);
      } else if (pageType === 'category') {
        onNavigate(`/admin/category/${cleanSlug}`);
      } else {
        onNavigate(`/admin/pages/${created.id}/edit`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  const previewSnippetTitle = seoTitle || (title ? `${title} | GoReadPost` : 'Page Title | GoReadPost');
  const previewSnippetDesc = seoDescription || description || 'Summary snippet displayed in search engine results and social previews on GoReadPost.';
  const previewSlug = slug || 'your-page-slug';

  return (
    <div className="apc-container">
      {/* Top Header & Breadcrumb */}
      <div className="apc-header">
        <button
          type="button"
          className="apc-back-btn"
          onClick={() => onNavigate('/admin/pages')}
        >
          <ArrowLeft size={14} />
          <span>Back to Dynamic Pages</span>
        </button>

        <h1 className="apc-title">Create New Dynamic Page</h1>
      </div>

      {error && (
        <div className="afv-alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Form Grid */}
      <form onSubmit={handleSubmit} className="apc-grid">
        {/* Left Column: Page Identity & SEO */}
        <div className="apc-main-col">
          {/* Card 0: Page Architecture Type */}
          <div className="apc-card" style={{ marginBottom: '16px' }}>
            <div className="apc-card-header">
              <h3 className="apc-card-title">Select Page Architecture Type</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '10px' }}>
              {[
                { id: 'standard', label: 'Standard Page', hint: 'e.g. /my-landing-page', icon: Layers },
                { id: 'topic', label: 'Topic Hub Page', hint: 'e.g. /topic/herstory', icon: Hash, badge: 'RECOMMENDED' },
                { id: 'category', label: 'Category Beat', hint: 'e.g. /category/startups', icon: Sparkles }
              ].map(t => {
                const isSel = pageType === t.id;
                const Icon = t.icon;
                return (
                  <div
                    key={t.id}
                    onClick={() => setPageType(t.id)}
                    style={{
                      border: isSel ? '2px solid var(--brand-primary, #dc2626)' : '1px solid #e2e8f0',
                      background: isSel ? '#fff1f2' : '#ffffff',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isSel ? '#dc2626' : '#334155', fontWeight: 800, fontSize: '0.9rem' }}>
                        <Icon size={16} />
                        <span>{t.label}</span>
                      </div>
                      {t.badge && (
                        <span style={{ fontSize: '0.62rem', background: '#10b981', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: isSel ? '#991b1b' : '#64748b' }}>
                      {t.hint}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 1: Page Identity */}
          <div className="apc-card">
            <div className="apc-card-header">
              <div>
                <h3 className="apc-card-title">Page Identity & Routing</h3>
              </div>
            </div>

            <div className="apc-form-group">
              <label className="apc-label" htmlFor="create-page-title">
                <span>Page Name / Headline *</span>
                <span className="apc-label-hint">Shown in browser tab and hero header</span>
              </label>
              <input
                id="create-page-title"
                className="apc-input"
                type="text"
                placeholder="e.g. Enterprise Cloud Summit, TechSparks Bharat, Startup Playbooks"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="apc-form-group">
              <label className="apc-label" htmlFor="create-page-slug">
                <span>Permanent URL Slug *</span>
                <span className="apc-label-hint">Lowercase, hyphenated path</span>
              </label>
              <div className="apc-slug-wrapper">
                <span className="apc-slug-prefix">
                  {pageType === 'topic' ? 'https://goreadpost.com/topic/' : pageType === 'category' ? 'https://goreadpost.com/category/' : 'https://goreadpost.com/'}
                </span>
                <input
                  id="create-page-slug"
                  className="apc-slug-input"
                  type="text"
                  placeholder="cloud-summit-2026"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManuallyEdited(true);
                  }}
                  required
                />
              </div>
            </div>

            <div className="apc-form-group">
              <label className="apc-label" htmlFor="create-page-brand">
                <span>Editorial Desk / Vertical</span>
                <span className="apc-label-hint">Associated GoReadPost publication desk</span>
              </label>
              <select
                id="create-page-brand"
                className="apc-select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                {BRAND_DESKS.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="apc-form-group">
              <label className="apc-label" htmlFor="create-page-desc">
                <span>Brief Overview / Deck Subtitle</span>
                <span className="apc-label-hint">Short editorial synopsis</span>
              </label>
              <textarea
                id="create-page-desc"
                className="apc-textarea"
                rows={3}
                placeholder="A concise summary explaining what this page covers, keynote speakers, or research highlights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Card 2: SEO & Search Dominance */}
          <div className="apc-card">
            <div className="apc-card-header">
              <div>
                <h3 className="apc-card-title">Search Engine Optimization (SEO)</h3>
              </div>
            </div>

            <div className="apc-form-group">
              <label className="apc-label" htmlFor="create-seo-title">
                <span>SEO Meta Title</span>
                <span className="apc-label-hint">{(seoTitle || '').length} / 60 recommended</span>
              </label>
              <input
                id="create-seo-title"
                className="apc-input"
                type="text"
                placeholder="e.g. Enterprise Cloud Summit 2026 | GoReadPost"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>

            <div className="apc-form-group">
              <label className="apc-label" htmlFor="create-seo-desc">
                <span>SEO Meta Description</span>
                <span className="apc-label-hint">{(seoDescription || '').length} / 160 recommended</span>
              </label>
              <textarea
                id="create-seo-desc"
                className="apc-textarea"
                rows={3}
                placeholder="Summary snippet displayed in search engine results and social previews..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>

            <div className="apc-form-group">
              <label className="apc-label" htmlFor="create-seo-keywords">
                <span>Keywords (Comma separated)</span>
                <span className="apc-label-hint">Search engine indexing tags</span>
              </label>
              <input
                id="create-seo-keywords"
                className="apc-input"
                type="text"
                placeholder="saas, cloud infrastructure, tech events, bangalore summit"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
              />
            </div>

            {/* Live Google Search Result Simulator */}
            <div className="apc-form-group" style={{ marginTop: '0.85rem' }}>
              <span className="apc-label">Google Search Result Preview</span>
              <div className="apc-google-box">
                <div className="apc-google-url">https://goreadpost.com › {previewSlug}</div>
                <div className="apc-google-title">{previewSnippetTitle}</div>
                <div className="apc-google-desc">{previewSnippetDesc}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Publication & Save Actions */}
        <div className="apc-side-col">
          {/* Card 3: Publication Status */}
          <div className="apc-card">
            <div className="apc-card-header">
              <h3 className="apc-card-title">Visibility & Status</h3>
            </div>

            <div className="apc-status-cards">
              <div
                className={`apc-status-option ${status === 'draft' ? 'active' : ''}`}
                onClick={() => setStatus('draft')}
              >
                <div className="apc-status-name">
                  {status === 'draft' && <Check size={14} />}
                  <span>Draft</span>
                </div>
                <p className="apc-status-desc">Private work-in-progress. Only visible to editorial admins.</p>
              </div>

              <div
                className={`apc-status-option ${status === 'published' ? 'active' : ''}`}
                onClick={() => setStatus('published')}
              >
                <div className="apc-status-name">
                  {status === 'published' && <Check size={14} />}
                  <span>Published</span>
                </div>
                <p className="apc-status-desc">Live immediately for public readers upon creation.</p>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={addStarterHero}
                  onChange={(e) => setAddStarterHero(e.target.checked)}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--brand-primary)' }}
                />
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                    Generate Starter Hero Section
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>
                    Automatically sets up a headline, subtitle, and primary call-to-action out of the box.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Card 4: Action Buttons */}
          <div className="apc-card">
            <div className="apc-actions">
              <button
                type="submit"
                className="apc-btn-primary"
                disabled={loading}
              >
                <Save size={16} />
                <span>{loading ? 'Creating Page…' : 'Create & Open Section Editor'}</span>
              </button>

              <button
                type="button"
                className="apc-btn-cancel"
                onClick={() => onNavigate('/admin/pages')}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Quick Tip Card */}
          <div className="apc-tip-box">
            <strong>Next step:</strong> After creating this page, you will be taken to the visual Section Builder where you can arrange Hero banners, Articles Feeds, Services Grids, Portfolio showcases, Testimonials, and FAQ accordions.
          </div>
        </div>
      </form>
    </div>
  );
}
