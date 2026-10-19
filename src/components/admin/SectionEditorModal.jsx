import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Sparkles } from 'lucide-react';

export const SECTION_DEFINITIONS = [
  { type: 'hero', label: 'Hero Banner', desc: 'Main top header with headline, subhead, background image and CTA button.' },
  { type: 'stories_feed', label: 'Article & Story Feed', desc: 'Dynamic or curated editorial news grid with category filter and view-all link.' },
  { type: 'trending', label: 'Trending News Feed', desc: 'High-velocity popular and trending startup dispatches.' },
  { type: 'spotlight', label: 'Tech & Startup Spotlight', desc: 'Spotlight block focusing on deep tech, AI, and emerging ventures.' },
  { type: 'newsletter', label: 'Newsletter Subscription', desc: 'Opt-in email newsletter subscription callout banner.' },
  { type: 'text', label: 'Text / About Block', desc: 'Heading, narrative text body, and optional badge.' },
  { type: 'image_text', label: 'Image + Text Split', desc: 'Two-column layout pairing a visual banner with text content.' },
  { type: 'services', label: 'Services Grid', desc: 'Cards listing offerings with icons, descriptions, and action links.' },
  { type: 'portfolio', label: 'Portfolio & Projects', desc: 'Showcase grid displaying work samples, case studies, or projects.' },
  { type: 'testimonials', label: 'Testimonials & Reviews', desc: 'Client endorsements with quotes, author names, roles, and ratings.' },
  { type: 'features', label: 'Features Grid', desc: 'Multi-column list highlighting core capabilities or benefits.' },
  { type: 'stats', label: 'Key Metrics & Numbers', desc: 'Bold metric numbers with labels and growth badges.' },
  { type: 'faq', label: 'Frequently Asked Questions', desc: 'Accordion list of common questions and answers.' },
  { type: 'cta', label: 'Call to Action (CTA)', desc: 'Full-width banner driving user conversions, inquiries, or signups.' },
  { type: 'contact', label: 'Contact Details', desc: 'Contact inquiry block with email, phone, location address, and socials.' },
  { type: 'brands', label: 'Client / Brand Logos', desc: 'Carousel or grid of partner companies and featured logos.' }
];

const CATEGORY_CHOICES = [
  { value: '', label: 'All Categories (Dynamic Feed)' },
  { value: 'Startups', label: 'Startups & Ecosystem' },
  { value: 'Technology', label: 'Technology & Cloud' },
  { value: 'AI', label: 'AI & DeepTech' },
  { value: 'Enterprise', label: 'Enterprise & SaaS' },
  { value: 'FinTech', label: 'FinTech & Web3' },
  { value: 'HerStory', label: 'HerStory (Women Leaders)' },
  { value: 'SMBStory', label: 'SMBStory (MSME & D2C)' },
  { value: 'SocialStory', label: 'SocialStory (Impact)' },
  { value: 'Hindi', label: 'YS Hindi Edition' }
];

export default function SectionEditorModal({ section, isOpen, onClose, onSave, onOpenLiveStudio }) {
  const [formData, setFormData] = useState(() => section?.data || {});

  useEffect(() => {
    if (section?.data) {
      setFormData({ ...(section.data || {}) });
    }
  }, [section]);

  if (!isOpen || !section) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // List item helpers for array fields (services, portfolio, testimonials, faq, etc.)
  const handleArrayItemChange = (arrayKey, index, subField, value) => {
    setFormData(prev => {
      const arr = [...(prev[arrayKey] || [])];
      arr[index] = { ...arr[index], [subField]: value };
      return { ...prev, [arrayKey]: arr };
    });
  };

  const handleAddArrayItem = (arrayKey, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayKey]: [...(prev[arrayKey] || []), defaultItem]
    }));
  };

  const handleRemoveArrayItem = (arrayKey, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayKey]: (prev[arrayKey] || []).filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...section,
      data: formData
    });
    onClose();
  };

  const sectionMeta = SECTION_DEFINITIONS.find(d => d.type === section.type) || {
    label: section.type.toUpperCase(),
    desc: 'Custom Page Section'
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="section-editor-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3>Configure {sectionMeta.label}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="modal-form-scrollable">
          {onOpenLiveStudio && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.12) 0%, rgba(249, 115, 22, 0.08) 100%)',
              border: '1.5px solid rgba(234, 88, 12, 0.35)',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Sparkles size={18} color="#ea580c" />
                <div>
                  <strong style={{ fontSize: '0.92rem', color: '#ea580c', display: 'block' }}>Prefer Live Visual WYSIWYG Editing?</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Edit text, articles, photos, and layouts directly on the live visual section preview.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenLiveStudio}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '7px',
                  fontWeight: 750,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                }}
              >
                <Sparkles size={14} />
                <span>Launch Live Studio</span>
              </button>
            </div>
          )}

          {/* 1. HERO SECTION */}
          {section.type === 'hero' && (
            <div className="form-fields-group">

              {/* Section Admin Heading & Badge */}
              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Section Title (CMS Admin Label)</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Stories & Editorial Hero Slider"
                    value={formData.heading || formData.title || ''}
                    onChange={(e) => {
                      handleChange('heading', e.target.value);
                      handleChange('title', e.target.value);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Section Badge / Kicker Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. HEADLINE STORIES, BREAKING NEWS"
                    value={formData.badge || ''}
                    onChange={(e) => handleChange('badge', e.target.value)}
                  />
                </div>
              </div>

              {/* Main Headline */}
              <div className="form-group">
                <label>Main Headline *</label>
                <input
                  type="text"
                  placeholder="e.g. Stories That Matter in Indian & Global Startups"
                  value={formData.headline || formData.title || formData.heading || ''}
                  onChange={(e) => {
                    handleChange('headline', e.target.value);
                    handleChange('title', e.target.value);
                  }}
                  required
                />
              </div>

              {/* Subheading / Lead Excerpt */}
              <div className="form-group">
                <label>Subheadline / Lead Excerpt</label>
                <textarea
                  rows={3}
                  placeholder="Unfiltered founder playbooks, deep tech breakthroughs, and market movements..."
                  value={formData.subheadline || formData.subtitle || formData.description || ''}
                  onChange={(e) => {
                    handleChange('subheadline', e.target.value);
                    handleChange('subtitle', e.target.value);
                  }}
                />
              </div>

              {/* Background Cover Image URL */}
              <div className="form-group">
                <label>Hero Background Image URL (Fallback / Default Banner Cover)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.bgImage || formData.image || ''}
                  onChange={(e) => {
                    handleChange('bgImage', e.target.value);
                    handleChange('image', e.target.value);
                  }}
                />
                {(formData.bgImage || formData.image) && (
                  <div className="image-preview-box">
                    <img src={formData.bgImage || formData.image} alt="Hero preview" />
                  </div>
                )}
              </div>

              {/* CTA Action Buttons */}
              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Primary Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Read More"
                    value={formData.primaryBtnText || formData.buttonText || ''}
                    onChange={(e) => {
                      handleChange('primaryBtnText', e.target.value);
                      handleChange('buttonText', e.target.value);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Primary Button Destination URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /latest or /trending"
                    value={formData.primaryBtnUrl || formData.buttonUrl || ''}
                    onChange={(e) => {
                      handleChange('primaryBtnUrl', e.target.value);
                      handleChange('buttonUrl', e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Secondary Button Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Meet Our Bureau"
                    value={formData.secondaryBtnText || ''}
                    onChange={(e) => handleChange('secondaryBtnText', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Secondary Button Destination URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /editorial-team or /about"
                    value={formData.secondaryBtnUrl || ''}
                    onChange={(e) => handleChange('secondaryBtnUrl', e.target.value)}
                  />
                </div>
              </div>

              {/* Hero Slider & Story Source Configuration */}
              <div style={{ marginTop: '1.25rem', padding: '1.15rem', background: 'var(--bg-secondary, rgba(0,0,0,0.02))', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                  Hero Slider & Story Source Settings
                </h4>

                <div className="form-row-two-col">
                  <div className="form-group">
                    <label>Content Source Mode</label>
                    <select
                      value={formData.heroSource || 'dynamic'}
                      onChange={(e) => handleChange('heroSource', e.target.value)}
                    >
                      <option value="dynamic">Dynamic Editorial Feed (Auto-pull from featured stories)</option>
                      <option value="custom">Custom Admin Slides (Create and manage individual slides)</option>
                      <option value="static">Single Static Banner (Display headline & cover above)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Feed Category Filter (For Dynamic Mode)</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => handleChange('category', e.target.value)}
                      disabled={formData.heroSource === 'custom' || formData.heroSource === 'static'}
                    >
                      {CATEGORY_CHOICES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-two-col">
                  <div className="form-group">
                    <label>Max Slides Limit in Carousel</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="5"
                      value={formData.slideLimit || 5}
                      onChange={(e) => handleChange('slideLimit', parseInt(e.target.value, 10) || 5)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Auto-Rotate Interval (Seconds, 0 to disable)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      placeholder="7"
                      value={formData.autoPlayInterval !== undefined ? formData.autoPlayInterval : 7}
                      onChange={(e) => handleChange('autoPlayInterval', parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Slides Manager (Available when heroSource === 'custom') */}
              {formData.heroSource === 'custom' && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div className="sub-items-header">
                    <h4>Custom Hero Slides ({(formData.slides || []).length})</h4>
                    <button
                      type="button"
                      className="btn-add-sub-item"
                      onClick={() => handleAddArrayItem('slides', {
                        title: 'Featured Headline Story',
                        excerpt: 'Comprehensive overview of the lead startup story.',
                        category: 'Startups',
                        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
                        author: 'Editorial Desk',
                        date: 'Today',
                        readTime: '4 min read',
                        primaryBtnText: 'Read More',
                        link: '/latest'
                      })}
                    >
                      <Plus size={14} />
                      <span>Add Slide</span>
                    </button>
                  </div>

                  <div className="sub-items-stack">
                    {(formData.slides || []).map((slide, idx) => (
                      <div key={idx} className="sub-item-card">
                        <div className="sub-item-top">
                          <span className="sub-item-num">Slide #{idx + 1}</span>
                          <button
                            type="button"
                            className="btn-remove-sub-item"
                            onClick={() => handleRemoveArrayItem('slides', idx)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="form-row-two-col">
                          <div className="form-group">
                            <label>Slide Title *</label>
                            <input
                              type="text"
                              placeholder="Slide Headline"
                              value={slide.title || ''}
                              onChange={(e) => handleArrayItemChange('slides', idx, 'title', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Category Tag</label>
                            <input
                              type="text"
                              placeholder="e.g. AI / FinTech"
                              value={slide.category || ''}
                              onChange={(e) => handleArrayItemChange('slides', idx, 'category', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Cover Image URL</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={slide.image || ''}
                            onChange={(e) => handleArrayItemChange('slides', idx, 'image', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Slide Excerpt / Subheadline</label>
                          <textarea
                            rows={2}
                            placeholder="Teaser excerpt for this slide..."
                            value={slide.excerpt || slide.description || ''}
                            onChange={(e) => handleArrayItemChange('slides', idx, 'excerpt', e.target.value)}
                          />
                        </div>

                        <div className="form-row-two-col">
                          <div className="form-group">
                            <label>Author Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Editorial Team"
                              value={slide.author || ''}
                              onChange={(e) => handleArrayItemChange('slides', idx, 'author', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Read Time</label>
                            <input
                              type="text"
                              placeholder="e.g. 5 min read"
                              value={slide.readTime || ''}
                              onChange={(e) => handleArrayItemChange('slides', idx, 'readTime', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-row-two-col">
                          <div className="form-group">
                            <label>Button Label</label>
                            <input
                              type="text"
                              placeholder="Read More"
                              value={slide.primaryBtnText || 'Read More'}
                              onChange={(e) => handleArrayItemChange('slides', idx, 'primaryBtnText', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Destination URL</label>
                            <input
                              type="text"
                              placeholder="/latest or /stories/slug"
                              value={slide.link || slide.primaryBtnUrl || ''}
                              onChange={(e) => {
                                handleArrayItemChange('slides', idx, 'link', e.target.value);
                                handleArrayItemChange('slides', idx, 'primaryBtnUrl', e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Posts Sidebar Configuration */}
              <div style={{ marginTop: '1.25rem', padding: '1.15rem', background: 'var(--bg-secondary, rgba(0,0,0,0.02))', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                    Popular Posts Sidebar
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 650, fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.showPopular !== false}
                      onChange={(e) => handleChange('showPopular', e.target.checked)}
                    />
                    <span>Show Popular Sidebar</span>
                  </label>
                </div>

                {formData.showPopular !== false && (
                  <>
                    <div className="form-row-two-col">
                      <div className="form-group">
                        <label>Sidebar Section Title</label>
                        <input
                          type="text"
                          placeholder="Popular Posts"
                          value={formData.popularTitle || ''}
                          onChange={(e) => handleChange('popularTitle', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Max Popular Stories Count</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="5"
                          value={formData.popularLimit || 5}
                          onChange={(e) => handleChange('popularLimit', parseInt(e.target.value, 10) || 5)}
                        />
                      </div>
                    </div>

                    <div className="form-row-two-col">
                      <div className="form-group">
                        <label>"View All" Button Label</label>
                        <input
                          type="text"
                          placeholder="View All"
                          value={formData.viewAllText || 'View All'}
                          onChange={(e) => handleChange('viewAllText', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>"View All" Destination URL</label>
                        <input
                          type="text"
                          placeholder="/trending"
                          value={formData.viewAllUrl || '/trending'}
                          onChange={(e) => handleChange('viewAllUrl', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 2. TEXT / ABOUT SECTION */}
          {section.type === 'text' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Badge (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WHO WE ARE, PHILOSOPHY"
                  value={formData.badge || ''}
                  onChange={(e) => handleChange('badge', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Heading / Title</label>
                <input
                  type="text"
                  placeholder="Section title"
                  value={formData.title || formData.heading || ''}
                  onChange={(e) => {
                    handleChange('title', e.target.value);
                    handleChange('heading', e.target.value);
                  }}
                />
              </div>

              <div className="form-group">
                <label>Body Content (HTML / Rich Text supported)</label>
                <textarea
                  rows={9}
                  placeholder="Detailed text or HTML paragraphs..."
                  value={formData.content || formData.body || ''}
                  onChange={(e) => {
                    handleChange('content', e.target.value);
                    handleChange('body', e.target.value);
                  }}
                />
              </div>
            </div>
          )}

          {/* 3. IMAGE + TEXT SECTION */}
          {section.type === 'image_text' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Heading *</label>
                <input
                  type="text"
                  value={formData.heading || ''}
                  onChange={(e) => handleChange('heading', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => handleChange('image', e.target.value)}
                />
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Image Position</label>
                  <select
                    value={formData.imagePosition || 'left'}
                    onChange={(e) => handleChange('imagePosition', e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Action Button (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Discover More"
                    value={formData.buttonText || ''}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. SERVICES GRID SECTION */}
          {section.type === 'services' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  placeholder="e.g. Specialized Capabilities"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Section Subtitle / Description</label>
                <input
                  type="text"
                  placeholder="e.g. End-to-end solutions tailored for high-growth ventures"
                  value={formData.subtitle || ''}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                />
              </div>

              <div className="sub-items-header">
                <h4>Services List ({(formData.items || []).length})</h4>
                <button
                  type="button"
                  className="btn-add-sub-item"
                  onClick={() => handleAddArrayItem('items', { title: 'New Service', description: 'Comprehensive service overview...', icon: 'Zap' })}
                >
                  <Plus size={14} />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="sub-items-stack">
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="sub-item-card">
                    <div className="sub-item-top">
                      <span className="sub-item-num">#{idx + 1}</span>
                      <button
                        type="button"
                        className="btn-remove-sub-item"
                        onClick={() => handleRemoveArrayItem('items', idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Service Title"
                        value={item.title || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'title', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        rows={2}
                        placeholder="Service Description"
                        value={item.description || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. TESTIMONIALS SECTION */}
          {section.type === 'testimonials' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  placeholder="e.g. Backed by Founders and Operators"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div className="sub-items-header">
                <h4>Quotes ({(formData.items || []).length})</h4>
                <button
                  type="button"
                  className="btn-add-sub-item"
                  onClick={() => handleAddArrayItem('items', { name: 'Founder Name', role: 'CEO at Venture', quote: 'Exceptional strategic execution.' })}
                >
                  <Plus size={14} />
                  <span>Add Testimonial</span>
                </button>
              </div>

              <div className="sub-items-stack">
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="sub-item-card">
                    <div className="sub-item-top">
                      <span className="sub-item-num">Quote #{idx + 1}</span>
                      <button
                        type="button"
                        className="btn-remove-sub-item"
                        onClick={() => handleRemoveArrayItem('items', idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-group">
                      <textarea
                        rows={3}
                        placeholder="Endorsement quote text..."
                        value={item.quote || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'quote', e.target.value)}
                      />
                    </div>
                    <div className="form-row-two-col">
                      <input
                        type="text"
                        placeholder="Person Name"
                        value={item.name || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Title / Company"
                        value={item.role || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'role', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. CALL TO ACTION (CTA) SECTION */}
          {section.type === 'cta' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>CTA Headline *</label>
                <input
                  type="text"
                  placeholder="e.g. Ready to Scale Your Venture?"
                  value={formData.heading || ''}
                  onChange={(e) => handleChange('heading', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={2}
                  placeholder="Compelling call to action subtext..."
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule Call"
                    value={formData.buttonText || ''}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Button Destination</label>
                  <input
                    type="text"
                    placeholder="e.g. /contact or mailto:info@..."
                    value={formData.buttonUrl || ''}
                    onChange={(e) => handleChange('buttonUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. FAQ SECTION */}
          {section.type === 'faq' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>FAQ Section Title</label>
                <input
                  type="text"
                  placeholder="Frequently Asked Questions"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div className="sub-items-header">
                <h4>Questions & Answers ({(formData.items || []).length})</h4>
                <button
                  type="button"
                  className="btn-add-sub-item"
                  onClick={() => handleAddArrayItem('items', { question: 'What is the turnaround time?', answer: 'Our standard sprint runs 2 weeks.' })}
                >
                  <Plus size={14} />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="sub-items-stack">
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="sub-item-card">
                    <div className="sub-item-top">
                      <span className="sub-item-num">Q#{idx + 1}</span>
                      <button
                        type="button"
                        className="btn-remove-sub-item"
                        onClick={() => handleRemoveArrayItem('items', idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Question"
                        value={item.question || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'question', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        rows={2}
                        placeholder="Answer"
                        value={item.answer || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'answer', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. KEY METRICS & STATS */}
          {section.type === 'stats' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  placeholder="Our Impact in Numbers"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div className="sub-items-header">
                <h4>Metric Counters ({(formData.items || []).length})</h4>
                <button
                  type="button"
                  className="btn-add-sub-item"
                  onClick={() => handleAddArrayItem('items', { number: '$100M+', label: 'Capital Raised', meta: 'Across 150+ portfolio companies' })}
                >
                  <Plus size={14} />
                  <span>Add Metric</span>
                </button>
              </div>

              <div className="sub-items-stack">
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="sub-item-card">
                    <div className="sub-item-top">
                      <span className="sub-item-num">Metric #{idx + 1}</span>
                      <button
                        type="button"
                        className="btn-remove-sub-item"
                        onClick={() => handleRemoveArrayItem('items', idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-row-two-col">
                      <input
                        type="text"
                        placeholder="Number (e.g. 10x, $50M)"
                        value={item.number || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'number', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g. Growth)"
                        value={item.label || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'label', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. CONTACT SECTION */}
          {section.type === 'contact' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Get in Touch"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    placeholder="contact@goreadpost.com"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 (080) 4123-5678"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Physical Address</label>
                <input
                  type="text"
                  placeholder="Bengaluru, Karnataka, India"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* 10. ARTICLE & STORY FEED */}
          {section.type === 'stories_feed' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Display Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Latest from the Blog, Venture Playbooks"
                  value={formData.title || formData.heading || ''}
                  onChange={(e) => {
                    handleChange('title', e.target.value);
                    handleChange('heading', e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subtitle / Editorial Teaser</label>
                <input
                  type="text"
                  placeholder="e.g. Real-time reporting and latest editorial dispatches"
                  value={formData.subtitle || formData.subheading || ''}
                  onChange={(e) => {
                    handleChange('subtitle', e.target.value);
                    handleChange('subheading', e.target.value);
                  }}
                />
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Feed Category Filter</label>
                  <select
                    value={formData.category || formData.filterCategory || ''}
                    onChange={(e) => {
                      handleChange('category', e.target.value);
                      handleChange('filterCategory', e.target.value);
                    }}
                  >
                    {CATEGORY_CHOICES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Max Stories Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    placeholder="6"
                    value={formData.limit || 6}
                    onChange={(e) => handleChange('limit', parseInt(e.target.value, 10) || 6)}
                  />
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>"View All" Button Label</label>
                  <input
                    type="text"
                    placeholder="View All"
                    value={formData.viewAllText || 'View All'}
                    onChange={(e) => handleChange('viewAllText', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>"View All" Destination URL</label>
                  <input
                    type="text"
                    placeholder="/latest"
                    value={formData.viewAllUrl || '/latest'}
                    onChange={(e) => handleChange('viewAllUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 11. TRENDING NEWS FEED */}
          {section.type === 'trending' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Title *</label>
                <input
                  type="text"
                  placeholder="Trending Now"
                  value={formData.title || formData.heading || 'Trending Now'}
                  onChange={(e) => {
                    handleChange('title', e.target.value);
                    handleChange('heading', e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subtitle / Description</label>
                <input
                  type="text"
                  placeholder="High-velocity stories capturing builder attention"
                  value={formData.subtitle || formData.subheading || ''}
                  onChange={(e) => {
                    handleChange('subtitle', e.target.value);
                    handleChange('subheading', e.target.value);
                  }}
                />
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Max Stories Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="6"
                    value={formData.limit || 6}
                    onChange={(e) => handleChange('limit', parseInt(e.target.value, 10) || 6)}
                  />
                </div>

                <div className="form-group">
                  <label>"View All" Destination URL</label>
                  <input
                    type="text"
                    placeholder="/trending"
                    value={formData.viewAllUrl || '/trending'}
                    onChange={(e) => handleChange('viewAllUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 12. SPOTLIGHT & FEATURED FOCUS */}
          {section.type === 'spotlight' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Title *</label>
                <input
                  type="text"
                  placeholder="Tech & Startup Spotlight"
                  value={formData.title || formData.heading || 'Tech & Startup Spotlight'}
                  onChange={(e) => {
                    handleChange('title', e.target.value);
                    handleChange('heading', e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subtitle / Description</label>
                <input
                  type="text"
                  placeholder="Deep tech, generative AI, and emerging ventures"
                  value={formData.subtitle || formData.subheading || ''}
                  onChange={(e) => {
                    handleChange('subtitle', e.target.value);
                    handleChange('subheading', e.target.value);
                  }}
                />
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Category Focus</label>
                  <select
                    value={formData.category || formData.filterCategory || 'Technology'}
                    onChange={(e) => {
                      handleChange('category', e.target.value);
                      handleChange('filterCategory', e.target.value);
                    }}
                  >
                    {CATEGORY_CHOICES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Spotlight Badge Text</label>
                  <input
                    type="text"
                    placeholder="DEEPTECH FOCUS"
                    value={formData.badgeText || 'DEEPTECH FOCUS'}
                    onChange={(e) => handleChange('badgeText', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Max Stories Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="6"
                    value={formData.limit || 6}
                    onChange={(e) => handleChange('limit', parseInt(e.target.value, 10) || 6)}
                  />
                </div>

                <div className="form-group">
                  <label>"View All" Destination URL</label>
                  <input
                    type="text"
                    placeholder="/category/technology"
                    value={formData.viewAllUrl || '/category/technology'}
                    onChange={(e) => handleChange('viewAllUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 13. NEWSLETTER BANNER */}
          {section.type === 'newsletter' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Main Headline *</label>
                <input
                  type="text"
                  placeholder="Get the Latest Blogs Delivered to Your Inbox"
                  value={formData.headline || formData.title || formData.heading || 'Get the Latest Blogs Delivered to Your Inbox'}
                  onChange={(e) => {
                    handleChange('headline', e.target.value);
                    handleChange('title', e.target.value);
                    handleChange('heading', e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subtitle / Value Proposition</label>
                <input
                  type="text"
                  placeholder="Join 100,000+ founders and engineers receiving our dispatches."
                  value={formData.subtitle || formData.subheading || ''}
                  onChange={(e) => {
                    handleChange('subtitle', e.target.value);
                    handleChange('subheading', e.target.value);
                  }}
                />
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Input Placeholder</label>
                  <input
                    type="text"
                    placeholder="Enter your email address"
                    value={formData.placeholder || 'Enter your email address'}
                    onChange={(e) => handleChange('placeholder', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Button Label</label>
                  <input
                    type="text"
                    placeholder="Subscribe"
                    value={formData.buttonText || 'Subscribe'}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 14. FEATURES GRID SECTION */}
          {section.type === 'features' && (
            <div className="form-fields-group">
              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Section Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. KEY CAPABILITIES"
                    value={formData.badge || ''}
                    onChange={(e) => handleChange('badge', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Section Heading *</label>
                  <input
                    type="text"
                    placeholder="e.g. Key Platform Features"
                    value={formData.title || formData.heading || ''}
                    onChange={(e) => {
                      handleChange('title', e.target.value);
                      handleChange('heading', e.target.value);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subtitle / Description</label>
                <input
                  type="text"
                  placeholder="Discover what makes our journalism unique..."
                  value={formData.subtitle || formData.subheading || ''}
                  onChange={(e) => {
                    handleChange('subtitle', e.target.value);
                    handleChange('subheading', e.target.value);
                  }}
                />
              </div>

              <div className="sub-items-header">
                <h4>Features List ({(formData.items || []).length})</h4>
                <button
                  type="button"
                  className="btn-add-sub-item"
                  onClick={() => handleAddArrayItem('items', { title: 'New Feature', description: 'Feature highlights and benefits...', icon: 'Zap' })}
                >
                  <Plus size={14} />
                  <span>Add Feature</span>
                </button>
              </div>

              <div className="sub-items-stack">
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="sub-item-card">
                    <div className="sub-item-top">
                      <span className="sub-item-num">Feature #{idx + 1}</span>
                      <button
                        type="button"
                        className="btn-remove-sub-item"
                        onClick={() => handleRemoveArrayItem('items', idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-row-two-col">
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          placeholder="Feature Title"
                          value={item.title || ''}
                          onChange={(e) => handleArrayItemChange('items', idx, 'title', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Icon</label>
                        <select
                          value={item.icon || 'Zap'}
                          onChange={(e) => handleArrayItemChange('items', idx, 'icon', e.target.value)}
                        >
                          <option value="Zap">Zap (Lightning)</option>
                          <option value="Shield">Shield (Security)</option>
                          <option value="Award">Award (Excellence)</option>
                          <option value="Layers">Layers (Stack)</option>
                          <option value="Globe">Globe (Global)</option>
                          <option value="Sparkles">Sparkles (Magic)</option>
                          <option value="CheckCircle2">CheckCircle (Verified)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        rows={2}
                        placeholder="Feature description..."
                        value={item.description || ''}
                        onChange={(e) => handleArrayItemChange('items', idx, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 15. PORTFOLIO & PROJECTS SECTION */}
          {section.type === 'portfolio' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Heading *</label>
                <input
                  type="text"
                  placeholder="e.g. Featured Work & Case Studies"
                  value={formData.title || formData.heading || ''}
                  onChange={(e) => {
                    handleChange('title', e.target.value);
                    handleChange('heading', e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subtitle / Description</label>
                <input
                  type="text"
                  placeholder="Explore how we help founders achieve market dominance..."
                  value={formData.subtitle || formData.subheading || ''}
                  onChange={(e) => {
                    handleChange('subtitle', e.target.value);
                    handleChange('subheading', e.target.value);
                  }}
                />
              </div>

              <div className="sub-items-header">
                <h4>Portfolio Items ({(formData.items || formData.projects || []).length})</h4>
                <button
                  type="button"
                  className="btn-add-sub-item"
                  onClick={() => {
                    const newItem = {
                      title: 'New Showcase Project',
                      category: 'Venture & Tech',
                      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
                      description: 'Project case study overview and metrics achieved.',
                      link: '#'
                    };
                    const currentArr = formData.items || formData.projects || [];
                    const nextArr = [...currentArr, newItem];
                    setFormData(prev => ({ ...prev, items: nextArr, projects: nextArr }));
                  }}
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="sub-items-stack">
                {(formData.items || formData.projects || []).map((proj, idx) => (
                  <div key={idx} className="sub-item-card">
                    <div className="sub-item-top">
                      <span className="sub-item-num">Project #{idx + 1}</span>
                      <button
                        type="button"
                        className="btn-remove-sub-item"
                        onClick={() => {
                          const currentArr = formData.items || formData.projects || [];
                          const nextArr = currentArr.filter((_, i) => i !== idx);
                          setFormData(prev => ({ ...prev, items: nextArr, projects: nextArr }));
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-row-two-col">
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          placeholder="Project Title"
                          value={proj.title || ''}
                          onChange={(e) => {
                            const currentArr = [...(formData.items || formData.projects || [])];
                            currentArr[idx] = { ...currentArr[idx], title: e.target.value };
                            setFormData(prev => ({ ...prev, items: currentArr, projects: currentArr }));
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Category Badge</label>
                        <input
                          type="text"
                          placeholder="e.g. AI / Fintech"
                          value={proj.category || ''}
                          onChange={(e) => {
                            const currentArr = [...(formData.items || formData.projects || [])];
                            currentArr[idx] = { ...currentArr[idx], category: e.target.value };
                            setFormData(prev => ({ ...prev, items: currentArr, projects: currentArr }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-row-two-col">
                      <div className="form-group">
                        <label>Cover Image URL</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={proj.image || ''}
                          onChange={(e) => {
                            const currentArr = [...(formData.items || formData.projects || [])];
                            currentArr[idx] = { ...currentArr[idx], image: e.target.value };
                            setFormData(prev => ({ ...prev, items: currentArr, projects: currentArr }));
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Case Study Link (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://... or /case-studies/1"
                          value={proj.link || ''}
                          onChange={(e) => {
                            const currentArr = [...(formData.items || formData.projects || [])];
                            currentArr[idx] = { ...currentArr[idx], link: e.target.value };
                            setFormData(prev => ({ ...prev, items: currentArr, projects: currentArr }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        rows={2}
                        placeholder="Description of the project or results..."
                        value={proj.description || ''}
                        onChange={(e) => {
                          const currentArr = [...(formData.items || formData.projects || [])];
                          currentArr[idx] = { ...currentArr[idx], description: e.target.value };
                          setFormData(prev => ({ ...prev, items: currentArr, projects: currentArr }));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 16. CLIENT & BRAND LOGOS SECTION */}
          {section.type === 'brands' && (
            <div className="form-fields-group">
              <div className="form-group">
                <label>Section Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Featured Across Leading Portals & Partners"
                  value={formData.title || formData.heading || ''}
                  onChange={(e) => {
                    handleChange('title', e.target.value);
                    handleChange('heading', e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subtitle (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Trusted by 200+ venture funds and media syndicates"
                  value={formData.subtitle || formData.subheading || ''}
                  onChange={(e) => {
                    handleChange('subtitle', e.target.value);
                    handleChange('subheading', e.target.value);
                  }}
                />
              </div>

              <div className="sub-items-header">
                <h4>Brand Logos ({(formData.items || []).length})</h4>
                <button
                  type="button"
                  className="btn-add-sub-item"
                  onClick={() => handleAddArrayItem('items', { name: 'Brand Name', logo: '' })}
                >
                  <Plus size={14} />
                  <span>Add Brand</span>
                </button>
              </div>

              <div className="sub-items-stack">
                {(formData.items || []).map((brand, idx) => (
                  <div key={idx} className="sub-item-card">
                    <div className="sub-item-top">
                      <span className="sub-item-num">Brand #{idx + 1}</span>
                      <button
                        type="button"
                        className="btn-remove-sub-item"
                        onClick={() => handleRemoveArrayItem('items', idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-row-two-col">
                      <div className="form-group">
                        <label>Brand Name</label>
                        <input
                          type="text"
                          placeholder="e.g. TechSparks"
                          value={brand.name || ''}
                          onChange={(e) => handleArrayItemChange('items', idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Logo Image URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://... or leave empty for text badge"
                          value={brand.logo || ''}
                          onChange={(e) => handleArrayItemChange('items', idx, 'logo', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-admin-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-admin-primary">
              <Save size={15} />
              <span>Save Section Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
