import React, { useState, useEffect } from 'react';
import { 
  Globe, Eye, Plus, Trash2, 
  ArrowUp, ArrowDown, EyeOff, CheckCircle2, AlertCircle, 
  Layers, Settings as SettingsIcon, RefreshCw, X, Sparkles
} from 'lucide-react';
import { PageService } from '../../services/pageService';
import SectionEditorModal, { SECTION_DEFINITIONS } from './SectionEditorModal';
import LiveBannerEditor from './LiveBannerEditor';
import LiveSectionEditor from './LiveSectionEditor';
import LiveHomepageStudio from './LiveHomepageStudio';
import { ALL_STORIES } from '../../data/storiesData';

export default function AdminPageEditor({ pageId, onNavigate, onShowToast }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'seo'
  const [editingSection, setEditingSection] = useState(null);
  const [liveBannerEditingSection, setLiveBannerEditingSection] = useState(null);
  const [liveEditingSection, setLiveEditingSection] = useState(null);
  const [isWholeHomeStudioOpen, setIsWholeHomeStudioOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [seo, setSeo] = useState({
    title: '',
    description: '',
    keywords: [],
    ogImage: ''
  });
  const [sections, setSections] = useState([]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const data = await PageService.getPageById(pageId);
      if (data) {
        setPage(data);
        setTitle(data.title || '');
        setSlug(data.slug || '');
        setDescription(data.description || '');
        setStatus(data.status || 'draft');
        setSeo({
          title: data.seo?.title || '',
          description: data.seo?.description || '',
          keywords: Array.isArray(data.seo?.keywords) ? data.seo.keywords : [],
          ogImage: data.seo?.ogImage || ''
        });
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error('Failed to load page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) fetchPage();
  }, [pageId]);

  useEffect(() => {
    if (sections.length > 0 && !liveEditingSection && !liveBannerEditingSection && !isWholeHomeStudioOpen) {
      if (window.location.search.includes('liveHero=true')) {
        const heroSec = sections.find(s => s.type === 'hero' || s.type === 'hero_popular' || s.id === 'hero_popular' || (s.type || '').toLowerCase().includes('hero'));
        if (heroSec) {
          setLiveEditingSection(heroSec);
        }
      } else if (window.location.search.includes('liveStudio=true')) {
        if (pageId === 'home') {
          setIsWholeHomeStudioOpen(true);
        } else {
          setLiveEditingSection(sections[0]);
        }
      } else if (window.location.search.includes('liveSection=')) {
        const match = window.location.search.match(/liveSection=([^&]+)/);
        if (match && match[1]) {
          const sec = sections.find(s => s.id === match[1] || s.type === match[1]);
          if (sec) setLiveEditingSection(sec);
        }
      }
    }
  }, [sections, pageId]);

  // Section Reordering
  const handleMoveSection = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    // Update orders
    const updated = reordered.map((sec, i) => ({ ...sec, order: i + 1 }));
    setSections(updated);
  };

  // Section Toggle Enabled/Disabled
  const handleToggleSectionEnabled = (sectionId) => {
    setSections(prev =>
      prev.map(sec => sec.id === sectionId ? { ...sec, enabled: sec.enabled === false ? true : false } : sec)
    );
  };

  // Delete Section
  const handleDeleteSection = (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    setSections(prev => prev.filter(sec => sec.id !== sectionId));
  };

  // Add New Section
  const handleCreateSection = (sectionType) => {
    const def = SECTION_DEFINITIONS.find(d => d.type === sectionType);
    let initialData = {
      title: def?.label || `${sectionType.toUpperCase()} Section`,
      heading: def?.label || `${sectionType.toUpperCase()} Section`
    };

    if (sectionType === 'stories_feed') {
      initialData = {
        title: 'Editorial Stories Feed',
        heading: 'Editorial Stories Feed',
        subtitle: 'Latest updates and dispatches across the ecosystem',
        category: '',
        limit: 6,
        viewAllText: 'View All',
        viewAllUrl: '/latest'
      };
    } else if (sectionType === 'trending') {
      initialData = {
        title: 'Trending Now',
        heading: 'Trending Now',
        subtitle: 'High-velocity stories capturing builder attention',
        limit: 6,
        viewAllUrl: '/trending'
      };
    } else if (sectionType === 'spotlight') {
      initialData = {
        title: 'Tech & Startup Spotlight',
        heading: 'Tech & Startup Spotlight',
        subtitle: 'Deep tech, generative AI, and emerging ventures',
        category: 'Technology',
        badgeText: 'DEEPTECH FOCUS',
        limit: 6,
        viewAllUrl: '/category/technology'
      };
    } else if (sectionType === 'newsletter') {
      initialData = {
        title: 'Newsletter Subscription Banner',
        heading: 'Newsletter Subscription Banner',
        headline: 'Get the Latest Blogs Delivered to Your Inbox',
        subtitle: 'Join 100,000+ founders and engineers receiving our daily intelligence briefs.',
        buttonText: 'Subscribe',
        placeholder: 'Enter your email address'
      };
    } else if (sectionType === 'features') {
      initialData = {
        title: 'Key Platform Features',
        heading: 'Key Platform Features',
        subtitle: 'Discover what makes our journalism and reporting unique',
        badge: 'KEY CAPABILITIES',
        items: [
          { title: 'Unfiltered Access', description: 'Direct conversations with founders and operators.', icon: 'Zap' },
          { title: 'Capital Intelligence', description: 'Term sheets, valuations, and market movements.', icon: 'Award' },
          { title: 'Deep Tech Teardowns', description: 'Technical analysis on AI, chips, and cloud infrastructure.', icon: 'Layers' }
        ]
      };
    } else if (sectionType === 'stats') {
      initialData = {
        title: 'Our Impact in Numbers',
        heading: 'Our Impact in Numbers',
        subtitle: 'Trusted by founders, angel networks, and venture funds globally',
        items: [
          { number: '500K+', label: 'Monthly Readers', meta: 'Founders & Engineers' },
          { number: '1,200+', label: 'Stories Published', meta: 'In-depth coverage' },
          { number: '85+', label: 'Unicorns Covered', meta: 'Across Bharat & Global' },
          { number: '$2.5B+', label: 'Funding Tracked', meta: 'Venture Capital deals' }
        ]
      };
    } else if (sectionType === 'brands') {
      initialData = {
        title: 'Featured Across Leading Portals & Partners',
        heading: 'Featured Across Leading Portals & Partners',
        items: [
          { name: 'TechSparks', label: 'TechSparks' },
          { name: 'Startup Bharat', label: 'Startup Bharat' },
          { name: 'FoundersHub', label: 'FoundersHub' },
          { name: 'CapTable Daily', label: 'CapTable Daily' }
        ]
      };
    } else if (sectionType === 'image_text') {
      initialData = {
        heading: 'Built for the Next Generation of Builders',
        description: 'Comprehensive reporting that cuts through the noise. Get actionable frameworks and genuine stories.',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80',
        imagePosition: 'left',
        buttonText: 'Read More',
        buttonUrl: '/about',
        badge: 'MISSION & VALUES'
      };
    } else if (sectionType === 'hero') {
      initialData = {
        title: 'Lead Stories & Editorial Hero Banner',
        heading: 'Lead Stories & Editorial Hero Banner',
        headline: 'Stories That Matter in Startups, Technology & Capital',
        subheadline: 'Unfiltered founder playbooks, deep tech breakthroughs, and market movements.',
        badge: 'HEADLINE DISPATCHES',
        primaryBtnText: 'Read Latest',
        primaryBtnUrl: '/latest',
        popularTitle: 'Popular Posts'
      };
    } else if (sectionType === 'services') {
      initialData = {
        title: 'Specialized Capabilities & Newsroom Desks',
        heading: 'Specialized Capabilities & Newsroom Desks',
        subtitle: 'In-depth coverage spanning seed stage to public listing',
        badge: 'OUR BEATS',
        items: [
          { title: 'Venture Capital & Deals', description: 'Real-time intelligence on fundings, valuations, and term sheets.', icon: 'Zap' },
          { title: 'DeepTech & Generative AI', description: 'Technical tear-downs and market analysis on frontier innovation.', icon: 'Award' },
          { title: 'Global Enterprise & SaaS', description: 'Cross-border SaaS scaling playbooks and market penetration.', icon: 'Globe' }
        ]
      };
    } else if (sectionType === 'portfolio') {
      initialData = {
        title: 'Featured Case Studies & High-Impact Stories',
        heading: 'Featured Case Studies & High-Impact Stories',
        subtitle: 'Explore our deepest investigative journalism and brand spotlights',
        items: [
          {
            title: 'From Seed to Decacorn: The Playbook',
            category: 'Deep Dive',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
            description: 'How three Bangalore founders built a $10B enterprise engine.',
            link: '/stories'
          },
          {
            title: 'The AI Silicon Revolution',
            category: 'Hardware & AI',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
            description: 'Why fabless chip startups are raising record seed rounds in India.',
            link: '/stories'
          }
        ]
      };
    } else if (sectionType === 'testimonials') {
      initialData = {
        title: 'Trusted by Visionary Founders & Operators',
        heading: 'Trusted by Visionary Founders & Operators',
        subtitle: 'What ecosystem leaders say about our coverage and reporting',
        items: [
          {
            name: 'Pooja Sharma',
            role: 'Founder & CEO, ScaleStack',
            quote: 'GoReadPost has become the definitive morning read for our entire engineering and leadership team.',
            rating: 5,
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80'
          },
          {
            name: 'Rohan Mehta',
            role: 'General Partner, Alpha Capital',
            quote: 'Uncompromising editorial rigor, speed, and genuine market insight.',
            rating: 5,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
          }
        ]
      };
    } else if (sectionType === 'faq') {
      initialData = {
        title: 'Frequently Asked Questions',
        heading: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about our platform, syndicate access, and editorial guidelines',
        items: [
          {
            question: 'How often are stories and breaking news published?',
            answer: 'Our editorial desk updates continuously throughout the day with breaking news dispatches, deep investigative features, and market analysis.'
          },
          {
            question: 'Can founders submit stories or press releases?',
            answer: 'Yes! Founders and PR representatives can submit announcements directly through our Submit Story portal for editorial review.'
          },
          {
            question: 'How do I subscribe to the GoReadPost daily digest?',
            answer: 'Use the newsletter subscription box above or in our footer to receive our curated morning briefs straight to your inbox.'
          }
        ]
      };
    } else if (sectionType === 'cta') {
      initialData = {
        title: 'Amplify Your Story With GoReadPost',
        heading: 'Amplify Your Story With GoReadPost',
        description: 'Join over 500,000 monthly readers discovering the builders shaping the next economic era.',
        primaryBtnText: 'Explore Membership',
        primaryBtnUrl: '/contact',
        secondaryBtnText: 'Submit Press Release',
        secondaryBtnUrl: '/submit'
      };
    } else if (sectionType === 'contact') {
      initialData = {
        title: 'Get in Touch with our Editorial Bureau',
        heading: 'Get in Touch with our Editorial Bureau',
        subtitle: 'Have a breaking tip, partnership proposal, or feedback? We want to hear from you.',
        email: 'newsroom@goreadpost.com',
        phone: '+91 (080) 4123-5678',
        address: '100ft Road, Indiranagar, Bengaluru, Karnataka 560038'
      };
    } else if (sectionType === 'text') {
      initialData = {
        title: 'About GoReadPost Media',
        heading: 'About GoReadPost Media',
        badge: 'OUR MISSION',
        content: '<p>GoReadPost is India’s premier digital news and storytelling platform dedicated to championing entrepreneurs, innovators, and changemakers. From ground-up grassroots movements to multi-billion dollar tech unicorns, we chronicle the journey of building the future.</p>'
      };
    }

    const newSec = {
      id: 'sec_' + Date.now(),
      type: sectionType,
      order: sections.length + 1,
      enabled: true,
      data: initialData
    };
    setSections(prev => [...prev, newSec]);
    setIsAddSectionOpen(false);
    if (sectionType === 'hero') {
      setLiveBannerEditingSection(newSec);
    } else {
      setEditingSection(newSec);
    }
  };

  // Save changes to backend
  const handleSavePage = async (publishOverride = null) => {
    setSaving(true);
    try {
      const targetStatus = publishOverride || status;
      const targetSlug = pageId === 'home' ? '' : slug.trim();
      const payload = {
        title: title.trim(),
        slug: targetSlug,
        description: description.trim(),
        status: targetStatus,
        seo: {
          title: seo.title.trim() || `${title} | GoReadPost`,
          description: seo.description.trim() || description.trim(),
          keywords: Array.isArray(seo.keywords) ? seo.keywords : typeof seo.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : [],
          ogImage: seo.ogImage.trim()
        },
        sections: sections.map((s, idx) => ({ ...s, order: idx + 1 }))
      };

      const updated = await PageService.updatePage(pageId, payload);
      setPage(updated);
      setStatus(targetStatus);
      onShowToast?.(
        publishOverride === 'published'
          ? (pageId === 'home' || !targetSlug ? 'Homepage is now published live!' : `Page "/${targetSlug}" is now published live!`)
          : 'Page draft saved successfully.'
      );
    } catch (err) {
      alert(err.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-view-container">
        <div className="admin-loading-indicator">
          <RefreshCw size={26} className="spin-animate" />
          <p>Loading page editor...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="admin-view-container">
        <div className="admin-empty-indicator">
          <AlertCircle size={36} color="var(--brand-primary)" />
          <h4>Page Not Found</h4>
          <p>The requested page ID could not be loaded.</p>
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => onNavigate('/admin/pages')}
          >
            Return to Pages
          </button>
        </div>
      </div>
    );
  }

  const isLive = status === 'published' || status === 'active';

  return (
    <div className="admin-view-container">
      {/* Segmented Editor Tabs */}
      <div className="admin-segmented-tabs-bar">
        <button
          type="button"
          className={`admin-nav-tab-item ${activeTab === 'sections' ? 'active' : ''}`}
          onClick={() => setActiveTab('sections')}
        >
          <Layers size={16} />
          <span>Page Sections Builder</span>
          <span className="tab-counter-badge">{sections.length}</span>
        </button>

        <button
          type="button"
          className={`admin-nav-tab-item ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          <Globe size={16} />
          <span>Page Info & SEO Settings</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: SECTION-BASED PAGE BUILDER
         ======================================================== */}
      {activeTab === 'sections' && (
        <div className="section-builder-wrapper">
          <div className="section-builder-top">
            <div>
              <h3 style={{ margin: 0 }}>Page Sections Layout</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => handleSavePage('draft')}
                disabled={saving}
              >
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => handleSavePage('published')}
                disabled={saving}
              >
                <CheckCircle2 size={16} />
                <span>{isLive ? 'Update Published' : 'Publish Live'}</span>
              </button>
            </div>
          </div>

          {/* Section Stack */}
          {sections.length === 0 ? (
            <div className="admin-empty-indicator">
              <Layers size={36} color="var(--brand-primary)" />
              <h4>No sections configured yet</h4>
              <p>Add your first section to construct this page layout.</p>
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => setIsAddSectionOpen(true)}
              >
                <Plus size={16} />
                <span>+ Add First Section</span>
              </button>
            </div>
          ) : (
            <div className="section-builder-stack">
              {sections.map((sec, idx) => {
                const def = SECTION_DEFINITIONS.find(d => d.type === sec.type) || {
                  label: sec.type.toUpperCase()
                };
                const isEnabled = sec.enabled !== false;

                return (
                  <div
                    key={sec.id || idx}
                    className={`section-stack-card ${!isEnabled ? 'disabled' : ''}`}
                  >
                    {/* Drag / Reorder Buttons */}
                    <div className="section-reorder-controls">
                      <button
                        type="button"
                        className="reorder-btn"
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, 'up')}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <span className="section-order-num">{idx + 1}</span>
                      <button
                        type="button"
                        className="reorder-btn"
                        disabled={idx === sections.length - 1}
                        onClick={() => handleMoveSection(idx, 'down')}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Section Information Preview */}
                    <div className="section-info-meta">
                      <div className="section-type-badge">
                        <span>{def.label}</span>
                        {!isEnabled && <span className="disabled-pill">Disabled</span>}
                      </div>
                      <div className="section-headline-preview">
                        {sec.data?.heading || sec.data?.title || sec.data?.headline || def.label || `Section ${idx + 1}`}
                      </div>
                    </div>

                    {/* Section Actions */}
                    <div className="section-card-actions">
                      <button
                        type="button"
                        className="btn-section-action"
                        onClick={() => handleToggleSectionEnabled(sec.id)}
                        title={isEnabled ? 'Disable Section' : 'Enable Section'}
                      >
                        {isEnabled ? <Eye size={15} /> : <EyeOff size={15} color="var(--text-muted)" />}
                        <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      {/* Live Visual WYSIWYG Editor Button (For EVERY section!) */}
                      <button
                        type="button"
                        className="btn-section-action live-edit"
                        onClick={() => setLiveEditingSection(sec)}
                        style={{
                          background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 750,
                          padding: '6px 14px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                        title={`Open Live Visual Editor for "${def.label || sec.type}"`}
                      >
                        <Sparkles size={15} />
                        <span>Live Edit</span>
                      </button>

                      <button
                        type="button"
                        className="btn-section-action delete"
                        onClick={() => handleDeleteSection(sec.id)}
                        title="Remove Section"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Add Section Button */}
          {sections.length > 0 && (
            <div className="add-section-footer-bar">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setIsAddSectionOpen(true)}
              >
                <Plus size={16} />
                <span>+ Add Another Section</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: PAGE INFORMATION & SEO
         ======================================================== */}
      {activeTab === 'seo' && (
        <div className="admin-editor-card">
          <div className="editor-form-grid">
            <div className="editor-card-section">
              <h3 className="section-title">
                <SettingsIcon size={18} color="var(--brand-primary)" />
                <span>Page Attributes</span>
              </h3>

              <div className="form-group">
                <label>Page Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>URL Slug {pageId === 'home' ? '(Root /)' : '*'}</label>
                <input
                  type="text"
                  value={pageId === 'home' ? '/' : slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={pageId === 'home'}
                  required={pageId !== 'home'}
                />
                <span className="field-hint">Public URL path: https://goreadpost.com{(!slug || slug === 'home' || slug === '/') ? '' : `/${slug}`}</span>
              </div>

              <div className="form-group">
                <label>Page Summary Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="editor-card-section">
              <h3 className="section-title">
                <Globe size={18} color="var(--brand-primary)" />
                <span>SEO & Meta Tags</span>
              </h3>

              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  placeholder="e.g. SEO Services | GoReadPost"
                  value={seo.title}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Snippet displayed on search engine result cards..."
                  value={seo.description}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Keywords (Comma separated)</label>
                <input
                  type="text"
                  placeholder="seo, services, digital growth"
                  value={Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords}
                  onChange={(e) => setSeo({ ...seo, keywords: e.target.value.split(',').map(s => s.trim()) })}
                />
              </div>

              <div className="form-group">
                <label>Open Graph Share Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={seo.ogImage || ''}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-light, #e2e8f0)' }}>
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => handleSavePage()}
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                <span>{saving ? 'Saving...' : 'Save Page & SEO Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: ADD SECTION PICKER
         ======================================================== */}
      {isAddSectionOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddSectionOpen(false)}>
          <div className="section-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Add Page Section</h3>
                <p>Select a section component to insert into this dynamic page.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddSectionOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="section-types-grid">
              {SECTION_DEFINITIONS.map((item) => (
                <div
                  key={item.type}
                  className="section-type-card"
                  onClick={() => handleCreateSection(item.type)}
                >
                  <div className="type-badge-icon">
                    <Plus size={16} />
                  </div>
                  <h4>{item.label}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: SECTION CONTENT EDITOR
         ======================================================== */}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          isOpen={!!editingSection}
          onClose={() => setEditingSection(null)}
          onSave={(updatedSection) => {
            setSections(prev =>
              prev.map(s => s.id === updatedSection.id ? updatedSection : s)
            );
            onShowToast?.(`Section "${updatedSection.type}" updated.`);
          }}
          onOpenLiveStudio={() => {
            const sec = editingSection;
            setEditingSection(null);
            setLiveEditingSection(sec);
          }}
        />
      )}

      {/* ========================================================
          MODAL 3: LIVE WYSIWYG SECTION STUDIO (ALL SECTIONS)
         ======================================================== */}
      {liveEditingSection && (
        <LiveSectionEditor
          section={liveEditingSection}
          isOpen={Boolean(liveEditingSection)}
          pageId={pageId}
          onClose={() => setLiveEditingSection(null)}
          onAutoSave={async (updatedData) => {
            const updatedSections = sections.map(s => s.id === liveEditingSection.id ? { ...s, data: updatedData } : s);
            setSections(updatedSections);

            try {
              const targetSlug = pageId === 'home' || page?.id === 'home' ? '' : (slug || page?.slug || '').trim();
              const payload = {
                title: (title || page?.title || (pageId === 'home' ? 'Homepage - Live Portal' : 'Custom Page')).trim(),
                slug: targetSlug,
                description: (description || page?.description || '').trim(),
                status: status || page?.status || 'published',
                seo: {
                  title: (seo?.title || page?.seo?.title || '').trim() || `${title || page?.title || 'Page'} | GoReadPost`,
                  description: (seo?.description || page?.seo?.description || '').trim() || (description || page?.description || '').trim(),
                  keywords: Array.isArray(seo?.keywords) ? seo.keywords : typeof seo?.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : (page?.seo?.keywords || []),
                  ogImage: (seo?.ogImage || page?.seo?.ogImage || '').trim()
                },
                sections: updatedSections
              };
              const updatedPage = await PageService.updatePage(pageId, payload);
              if (updatedPage) setPage(updatedPage);
              return updatedPage;
            } catch (err) {
              console.error('Failed to auto-save section:', err);
              throw err;
            }
          }}
          onSave={async (updatedData) => {
            const updatedSections = sections.map(s => s.id === liveEditingSection.id ? { ...s, data: updatedData } : s);
            setSections(updatedSections);
            setLiveEditingSection(null);

            // Automatically persist immediately to the database so refreshing keeps changes permanently!
            try {
              const targetSlug = pageId === 'home' || page?.id === 'home' ? '' : (slug || page?.slug || '').trim();
              const payload = {
                title: (title || page?.title || (pageId === 'home' ? 'Homepage - Live Portal' : 'Custom Page')).trim(),
                slug: targetSlug,
                description: (description || page?.description || '').trim(),
                status: status || page?.status || 'published',
                seo: {
                  title: (seo?.title || page?.seo?.title || '').trim() || `${title || page?.title || 'Page'} | GoReadPost`,
                  description: (seo?.description || page?.seo?.description || '').trim() || (description || page?.description || '').trim(),
                  keywords: Array.isArray(seo?.keywords) ? seo.keywords : typeof seo?.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : (page?.seo?.keywords || []),
                  ogImage: (seo?.ogImage || page?.seo?.ogImage || '').trim()
                },
                sections: updatedSections
              };
              const updatedPage = await PageService.updatePage(pageId, payload);
              if (updatedPage) setPage(updatedPage);
              onShowToast?.(`Section "${updatedData.title || updatedData.heading || liveEditingSection.type}" permanently saved and published live!`);
            } catch (err) {
              console.error('Failed to save section:', err);
              onShowToast?.('Section updated in editor. Click "Publish Live" to save.');
            }
          }}
          stories={ALL_STORIES}
        />
      )}

      {/* Fallback legacy modal if liveBannerEditingSection is ever explicitly opened */}
      {liveBannerEditingSection && (
        <LiveBannerEditor
          section={liveBannerEditingSection}
          isOpen={Boolean(liveBannerEditingSection)}
          pageId={pageId}
          onClose={() => setLiveBannerEditingSection(null)}
          onAutoSave={async (updatedData) => {
            const updatedSections = sections.map(s => s.id === liveBannerEditingSection.id ? { ...s, data: updatedData } : s);
            setSections(updatedSections);

            try {
              const targetSlug = pageId === 'home' || page?.id === 'home' ? '' : (slug || page?.slug || '').trim();
              const payload = {
                title: (title || page?.title || (pageId === 'home' ? 'Homepage - Live Portal' : 'Custom Page')).trim(),
                slug: targetSlug,
                description: (description || page?.description || '').trim(),
                status: status || page?.status || 'published',
                seo: {
                  title: (seo?.title || page?.seo?.title || '').trim() || `${title || page?.title || 'Page'} | GoReadPost`,
                  description: (seo?.description || page?.seo?.description || '').trim() || (description || page?.description || '').trim(),
                  keywords: Array.isArray(seo?.keywords) ? seo.keywords : typeof seo?.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : (page?.seo?.keywords || []),
                  ogImage: (seo?.ogImage || page?.seo?.ogImage || '').trim()
                },
                sections: updatedSections
              };
              const updatedPage = await PageService.updatePage(pageId, payload);
              if (updatedPage) setPage(updatedPage);
              return updatedPage;
            } catch (err) {
              console.error('Failed to auto-save banner:', err);
              throw err;
            }
          }}
          onSave={async (updatedData) => {
            const updatedSections = sections.map(s => s.id === liveBannerEditingSection.id ? { ...s, data: updatedData } : s);
            setSections(updatedSections);
            setLiveBannerEditingSection(null);

            try {
              const targetSlug = pageId === 'home' || page?.id === 'home' ? '' : (slug || page?.slug || '').trim();
              const payload = {
                title: (title || page?.title || (pageId === 'home' ? 'Homepage - Live Portal' : 'Custom Page')).trim(),
                slug: targetSlug,
                description: (description || page?.description || '').trim(),
                status: status || page?.status || 'published',
                seo: {
                  title: (seo?.title || page?.seo?.title || '').trim() || `${title || page?.title || 'Page'} | GoReadPost`,
                  description: (seo?.description || page?.seo?.description || '').trim() || (description || page?.description || '').trim(),
                  keywords: Array.isArray(seo?.keywords) ? seo.keywords : typeof seo?.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : (page?.seo?.keywords || []),
                  ogImage: (seo?.ogImage || page?.seo?.ogImage || '').trim()
                },
                sections: updatedSections
              };
              const updatedPage = await PageService.updatePage(pageId, payload);
              if (updatedPage) setPage(updatedPage);
              onShowToast?.('Hero banner content permanently saved and published live!');
            } catch (err) {
              console.error('Failed to save banner:', err);
              onShowToast?.('Banner updated in editor. Click "Publish Live" to save.');
            }
          }}
          stories={ALL_STORIES}
        />
      )}

      {/* ========================================================
          MODAL 4: WHOLE HOMEPAGE VISUAL LIVE STUDIO
         ======================================================== */}
      {isWholeHomeStudioOpen && (
        <LiveHomepageStudio
          isOpen={isWholeHomeStudioOpen}
          initialSections={sections}
          stories={ALL_STORIES}
          onClose={() => {
            setIsWholeHomeStudioOpen(false);
            if (typeof window !== 'undefined' && window.location.search.includes('liveStudio=true')) {
              window.history.replaceState(null, '', `/admin/pages/${pageId}/edit`);
            }
          }}
          onSaveSuccess={(updatedSections) => {
            setSections(updatedSections);
            onShowToast?.('Whole homepage layout and articles permanently saved live!');
          }}
        />
      )}
    </div>
  );
}
