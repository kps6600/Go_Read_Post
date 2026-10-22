import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit2, ArrowLeft, ArrowRight,
  Eye, Check, ExternalLink, RefreshCw, Layers, ShieldCheck, 
  Feather, Globe, Users, Award, Zap, Heart, MessageSquare,
  Search, Link as LinkIcon, Compass, FileText
} from 'lucide-react';
import { 
  DEFAULT_ABOUT_DATA, 
  getStoredAboutData, 
  saveStoredAboutData 
} from '../../data/aboutData';
import { PageService } from '../../services/pageService';
import AboutSection from '../AboutSection';
import './AdminAboutView.css';

export default function AdminAboutView({ onShowToast, onNavigate }) {
  const [aboutData, setAboutData] = useState(() => getStoredAboutData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'story' | 'values' | 'stats' | 'team' | 'seo' | 'preview'

  // Team Member Modal State
  const [memberModal, setMemberModal] = useState({
    isOpen: false,
    isCreate: false,
    index: null,
    data: {
      name: '',
      role: '',
      bio: '',
      image: '',
      linkedin: '',
      github: '',
      website: '',
      community: ''
    }
  });

  useEffect(() => {
    loadAboutPage();
  }, []);

  const loadAboutPage = async () => {
    setLoading(true);
    try {
      const page = await PageService.getPageById('about').catch(() => null);
      if (page?.data && typeof page.data === 'object' && page.data.hero) {
        setAboutData(prev => ({ ...prev, ...page.data }));
      } else {
        setAboutData(getStoredAboutData());
      }
    } catch (e) {
      console.warn('Error loading about page data:', e);
      setAboutData(getStoredAboutData());
    } finally {
      setLoading(false);
    }
  };

  // Direct state updaters
  const updateHero = (field, value) => {
    setAboutData(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateTrustStat = (index, field, value) => {
    setAboutData(prev => {
      const stats = [...(prev.hero.trustStats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return {
        ...prev,
        hero: { ...prev.hero, trustStats: stats }
      };
    });
  };

  const updateWhoWeAre = (field, value) => {
    setAboutData(prev => ({
      ...prev,
      whoWeAre: { ...prev.whoWeAre, [field]: value }
    }));
  };

  const updateHighlightCard = (index, field, value) => {
    setAboutData(prev => {
      const cards = [...(prev.whoWeAre.highlightCards || [])];
      cards[index] = { ...cards[index], [field]: value };
      return {
        ...prev,
        whoWeAre: { ...prev.whoWeAre, highlightCards: cards }
      };
    });
  };

  const updateValueItem = (index, field, value) => {
    setAboutData(prev => {
      const vals = [...(prev.whoWeAre.values || [])];
      vals[index] = { ...vals[index], [field]: value };
      return {
        ...prev,
        whoWeAre: { ...prev.whoWeAre, values: vals }
      };
    });
  };

  const updateStatItem = (index, field, value) => {
    setAboutData(prev => {
      const stats = [...(prev.statsBar.stats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return {
        ...prev,
        statsBar: { ...prev.statsBar, stats }
      };
    });
  };

  const updateSeo = (field, value) => {
    setAboutData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  // Team Member Reorder & CRUD
  const handleMoveMember = (index, direction) => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    const members = [...(aboutData.teamSection?.members || [])];
    if (newIdx < 0 || newIdx >= members.length) return;

    const temp = members[index];
    members[index] = members[newIdx];
    members[newIdx] = temp;

    setAboutData(prev => ({
      ...prev,
      teamSection: { ...prev.teamSection, members }
    }));

    if (onShowToast) onShowToast(`Moved member to #${newIdx + 1}`);
  };

  const handleDeleteMember = (index) => {
    const members = [...(aboutData.teamSection?.members || [])];
    const memberName = members[index]?.name || 'Member';
    if (!window.confirm(`Remove ${memberName} from team list?`)) return;

    members.splice(index, 1);
    setAboutData(prev => ({
      ...prev,
      teamSection: { ...prev.teamSection, members }
    }));
    if (onShowToast) onShowToast(`Removed ${memberName}`);
  };

  const handleSaveMemberModal = () => {
    const { isCreate, index, data } = memberModal;
    if (!data.name || !data.name.trim()) {
      alert('Member name is required.');
      return;
    }

    const members = [...(aboutData.teamSection?.members || [])];
    if (isCreate) {
      members.push({ ...data, id: `team-${Date.now()}` });
      if (onShowToast) onShowToast(`Added ${data.name} to team.`);
    } else if (typeof index === 'number' && index >= 0) {
      members[index] = { ...data };
      if (onShowToast) onShowToast(`Updated ${data.name}.`);
    }

    setAboutData(prev => ({
      ...prev,
      teamSection: { ...prev.teamSection, members }
    }));

    setMemberModal({ isOpen: false, isCreate: false, index: null, data: {} });
  };

  // Save changes live to storage, server, and public view
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update localStorage for instant local sync
      saveStoredAboutData(aboutData);

      // 2. Persist to PageService in backend
      const payload = {
        id: 'about',
        title: 'About Us',
        slug: 'about',
        description: aboutData.hero.subtitle || "Learn about GoReadPost's mission, editorial charter, and global bureaus.",
        status: 'published',
        data: aboutData,
        seo: {
          title: aboutData.seo.title || 'About Us | GoReadPost Media',
          description: aboutData.seo.description || aboutData.hero.subtitle,
          keywords: (aboutData.seo.keywords || '').split(',').map(s => s.trim()).filter(Boolean)
        }
      };

      await PageService.updatePage('about', payload).catch(e => {
        console.warn('PageService update non-fatal warning:', e);
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onShowToast) onShowToast('About Us Page permanently saved and published live!');
    } catch (err) {
      console.error('Failed to save about page:', err);
      if (onShowToast) onShowToast(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="aav-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw size={34} className="aav-spin" color="#ea580c" />
        <p style={{ color: '#64748b', fontWeight: 650, marginTop: '14px', fontSize: '0.95rem' }}>
          Loading About Page Studio...
        </p>
      </div>
    );
  }

  const { hero, whoWeAre, statsBar, teamSection, seo } = aboutData;

  return (
    <div className="aav-fullpage-root">
      {/* ── Studio Topbar ── */}
      <header className="aav-studio-topbar">
        <div className="aav-topbar-left">
          <button
            type="button"
            className="aav-back-nav-btn"
            onClick={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
            title="Return to Pages Management"
          >
            <ArrowLeft size={16} />
            <span>Back to Pages</span>
          </button>
        </div>

        <div className="aav-topbar-right">
          <button
            type="button"
            className="aav-btn-secondary"
            onClick={() => window.open('/about', '_blank')}
            title="Open live public about page in new window"
          >
            <Eye size={15} />
            <span>View Live Page</span>
          </button>

          <button
            type="button"
            className={`aav-btn-primary ${saveSuccess ? 'saved' : ''}`}
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="aav-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check size={16} />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="aav-container">
        {/* ── Navigation Tabs ── */}
        <div className="aav-tabs-bar">
          <button
            type="button"
            className={`aav-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
            onClick={() => setActiveTab('hero')}
          >
            <Sparkles size={15} />
            <span>Hero & Manifesto</span>
          </button>

          <button
            type="button"
            className={`aav-tab-btn ${activeTab === 'story' ? 'active' : ''}`}
            onClick={() => setActiveTab('story')}
          >
            <Compass size={15} />
            <span>Mission & Narrative</span>
          </button>

          <button
            type="button"
            className={`aav-tab-btn ${activeTab === 'values' ? 'active' : ''}`}
            onClick={() => setActiveTab('values')}
          >
            <ShieldCheck size={15} />
            <span>Core Values</span>
          </button>

          <button
            type="button"
            className={`aav-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <Zap size={15} />
            <span>Impact Metrics</span>
          </button>

          <button
            type="button"
            className={`aav-tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users size={15} />
            <span>Core Team ({teamSection?.members?.length || 0})</span>
          </button>

          <button
            type="button"
            className={`aav-tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            <Search size={15} />
            <span>SEO Settings</span>
          </button>

          <button
            type="button"
            className={`aav-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
            style={{ marginLeft: 'auto', background: activeTab === 'preview' ? '#ea580c' : 'rgba(234, 88, 12, 0.08)', color: activeTab === 'preview' ? '#ffffff' : '#ea580c' }}
          >
            <Eye size={15} />
            <span>Full Live Preview</span>
          </button>
        </div>

        {/* ── TAB 1: HERO & MANIFESTO ── */}
        {activeTab === 'hero' && (
          <div className="aav-section-card">
            <div className="aav-card-header">
              <div className="aav-card-header-left">
                <div className="aav-card-icon-wrap">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="aav-card-title">Hero & Manifesto Section</h3>
                  <div className="aav-card-subtitle">Headline, manifesto subtitle, actions, and trust stat counters</div>
                </div>
              </div>
            </div>

            <div className="aav-form-grid-2">
              <div className="aav-form-group">
                <label className="aav-form-label">Headline Prefix</label>
                <input
                  type="text"
                  className="aav-form-input"
                  value={hero?.titlePrefix || ''}
                  onChange={e => updateHero('titlePrefix', e.target.value)}
                  placeholder="Where Thoughts Find Their"
                />
              </div>

              <div className="aav-form-group">
                <label className="aav-form-label">
                  Headline Highlight (Gradient Text)
                  <span className="aav-form-hint">Rendered with vibrant editorial gradient</span>
                </label>
                <input
                  type="text"
                  className="aav-form-input"
                  value={hero?.titleHighlight || ''}
                  onChange={e => updateHero('titleHighlight', e.target.value)}
                  placeholder="Infinite Orbit"
                />
              </div>
            </div>

            <div className="aav-form-group">
              <label className="aav-form-label">Manifesto Subtitle Paragraph</label>
              <textarea
                className="aav-form-textarea"
                rows={3}
                value={hero?.subtitle || ''}
                onChange={e => updateHero('subtitle', e.target.value)}
                placeholder="GoReadPost is an independent publishing platform designed to amplify voices that matter..."
              />
            </div>

            <div className="aav-form-grid-2">
              <div className="aav-form-group">
                <label className="aav-form-label">Primary Button Text & Target</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="aav-form-input"
                    value={hero?.primaryBtnText || ''}
                    onChange={e => updateHero('primaryBtnText', e.target.value)}
                    placeholder="Discover Our Story"
                  />
                  <input
                    type="text"
                    className="aav-form-input"
                    style={{ maxWidth: '160px' }}
                    value={hero?.primaryBtnTarget || ''}
                    onChange={e => updateHero('primaryBtnTarget', e.target.value)}
                    placeholder="#who-we-are"
                  />
                </div>
              </div>

              <div className="aav-form-group">
                <label className="aav-form-label">Secondary Button Text & Target</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="aav-form-input"
                    value={hero?.secondaryBtnText || ''}
                    onChange={e => updateHero('secondaryBtnText', e.target.value)}
                    placeholder="Meet the Team"
                  />
                  <input
                    type="text"
                    className="aav-form-input"
                    style={{ maxWidth: '160px' }}
                    value={hero?.secondaryBtnTarget || ''}
                    onChange={e => updateHero('secondaryBtnTarget', e.target.value)}
                    placeholder="#team"
                  />
                </div>
              </div>
            </div>

            {/* Trust Stats Bar */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <label className="aav-form-label" style={{ marginBottom: '10px' }}>
                Hero Trust Bar Counters (3 Badges)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                {(hero?.trustStats || []).map((st, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 750 }}>Badge #{idx + 1}</span>
                    <input
                      type="text"
                      className="aav-form-input"
                      value={st.value || ''}
                      onChange={e => updateTrustStat(idx, 'value', e.target.value)}
                      placeholder="e.g. 250K+"
                    />
                    <input
                      type="text"
                      className="aav-form-input"
                      value={st.label || ''}
                      onChange={e => updateTrustStat(idx, 'label', e.target.value)}
                      placeholder="e.g. Monthly Readers"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MISSION & STORY ("WHO WE ARE") ── */}
        {activeTab === 'story' && (
          <div className="aav-section-card">
            <div className="aav-card-header">
              <div className="aav-card-header-left">
                <div className="aav-card-icon-wrap">
                  <Compass size={20} />
                </div>
                <div>
                  <h3 className="aav-card-title">Mission & Narrative ("Who We Are")</h3>
                  <div className="aav-card-subtitle">Founding narrative, story paragraphs, and mini highlight feature cards</div>
                </div>
              </div>
            </div>

            <div className="aav-form-grid-2">
              <div className="aav-form-group">
                <label className="aav-form-label">Heading Prefix</label>
                <input
                  type="text"
                  className="aav-form-input"
                  value={whoWeAre?.headingPrefix || ''}
                  onChange={e => updateWhoWeAre('headingPrefix', e.target.value)}
                  placeholder="Built for thinkers, writers, and "
                />
              </div>

              <div className="aav-form-group">
                <label className="aav-form-label">Heading Highlight (Teal Gradient)</label>
                <input
                  type="text"
                  className="aav-form-input"
                  value={whoWeAre?.headingHighlight || ''}
                  onChange={e => updateWhoWeAre('headingHighlight', e.target.value)}
                  placeholder="curious minds."
                />
              </div>
            </div>

            <div className="aav-form-group">
              <label className="aav-form-label">Story Paragraph 1 (Founding Vision)</label>
              <textarea
                className="aav-form-textarea"
                rows={3}
                value={whoWeAre?.paragraph1 || ''}
                onChange={e => updateWhoWeAre('paragraph1', e.target.value)}
                placeholder="Founded in 2023, GoReadPost began with a single vision..."
              />
            </div>

            <div className="aav-form-group">
              <label className="aav-form-label">Story Paragraph 2 (Platform Commitment)</label>
              <textarea
                className="aav-form-textarea"
                rows={3}
                value={whoWeAre?.paragraph2 || ''}
                onChange={e => updateWhoWeAre('paragraph2', e.target.value)}
                placeholder="We empower writers with intuitive tools, sleek visual formats..."
              />
            </div>

            {/* 2 Mini Feature Cards */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <label className="aav-form-label" style={{ marginBottom: '10px' }}>
                Mini Highlight Feature Cards (2 Cards)
              </label>
              <div className="aav-form-grid-2">
                {(whoWeAre?.highlightCards || []).map((card, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 800 }}>Feature Card #{idx + 1}</span>
                    <input
                      type="text"
                      className="aav-form-input"
                      value={card.title || ''}
                      onChange={e => updateHighlightCard(idx, 'title', e.target.value)}
                      placeholder="e.g. Ad-Free Experience"
                    />
                    <textarea
                      className="aav-form-textarea"
                      rows={2}
                      value={card.desc || ''}
                      onChange={e => updateHighlightCard(idx, 'desc', e.target.value)}
                      placeholder="e.g. Pure, uninterrupted reading for continuous focus."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CORE VALUES ── */}
        {activeTab === 'values' && (
          <div className="aav-section-card">
            <div className="aav-card-header">
              <div className="aav-card-header-left">
                <div className="aav-card-icon-wrap">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="aav-card-title">Core Values (Glass Card Pillars)</h3>
                  <div className="aav-card-subtitle">Three pillars displayed inside the right-hand glass value card</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(whoWeAre?.values || []).map((val, idx) => (
                <div key={val.id || idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Pillar #{idx + 1}</span>
                    <select
                      className="aav-form-select"
                      style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
                      value={val.icon || 'feather'}
                      onChange={e => updateValueItem(idx, 'icon', e.target.value)}
                    >
                      <option value="feather">Feather (Writing & Quality)</option>
                      <option value="globe">Globe (Global Exchange)</option>
                      <option value="shield">Shield (Data & Privacy)</option>
                      <option value="zap">Zap (Speed & Innovation)</option>
                      <option value="award">Award (Excellence)</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    className="aav-form-input"
                    value={val.title || ''}
                    onChange={e => updateValueItem(idx, 'title', e.target.value)}
                    placeholder="Pillar Title (e.g. Uncompromising Quality)"
                  />

                  <textarea
                    className="aav-form-textarea"
                    rows={2}
                    value={val.desc || ''}
                    onChange={e => updateValueItem(idx, 'desc', e.target.value)}
                    placeholder="Pillar description detailing commitment..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: IMPACT METRICS ── */}
        {activeTab === 'stats' && (
          <div className="aav-section-card">
            <div className="aav-card-header">
              <div className="aav-card-header-left">
                <div className="aav-card-icon-wrap">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="aav-card-title">Impact Metrics Bar</h3>
                  <div className="aav-card-subtitle">4 primary numbers demonstrating global reach and audience size</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {(statsBar?.stats || []).map((st, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800 }}>Metric Column #{idx + 1}</span>
                  <input
                    type="text"
                    className="aav-form-input"
                    style={{ fontSize: '1.15rem', fontWeight: 850, color: st.isCyan ? '#06b6d4' : '#0f172a' }}
                    value={st.num || ''}
                    onChange={e => updateStatItem(idx, 'num', e.target.value)}
                    placeholder="e.g. 250K+"
                  />
                  <input
                    type="text"
                    className="aav-form-input"
                    value={st.label || ''}
                    onChange={e => updateStatItem(idx, 'label', e.target.value)}
                    placeholder="e.g. ACTIVE READERS"
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748b', cursor: 'pointer', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      checked={!!st.isCyan}
                      onChange={e => updateStatItem(idx, 'isCyan', e.target.checked)}
                    />
                    <span>Highlight with Cyan Accent</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: CORE TEAM MEMBERS ── */}
        {activeTab === 'team' && (
          <div className="aav-section-card">
            <div className="aav-card-header">
              <div className="aav-card-header-left">
                <div className="aav-card-icon-wrap">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="aav-card-title">Core Leadership & Editorial Team</h3>
                  <div className="aav-card-subtitle">Manage leadership profiles, bios, roles, avatars, and social links</div>
                </div>
              </div>

              <button
                type="button"
                className="aav-btn-secondary"
                onClick={() => setMemberModal({
                  isOpen: true,
                  isCreate: true,
                  index: null,
                  data: {
                    name: '',
                    role: 'Editor',
                    bio: '',
                    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                    linkedin: '',
                    github: '',
                    website: '',
                    community: ''
                  }
                })}
              >
                <Plus size={15} />
                <span>Add Team Member</span>
              </button>
            </div>

            <div className="aav-form-grid-2" style={{ marginBottom: '1.25rem' }}>
              <div className="aav-form-group">
                <label className="aav-form-label">Team Section Title</label>
                <input
                  type="text"
                  className="aav-form-input"
                  value={teamSection?.title || ''}
                  onChange={e => setAboutData(prev => ({ ...prev, teamSection: { ...prev.teamSection, title: e.target.value } }))}
                  placeholder="Meet Our Core Team"
                />
              </div>

              <div className="aav-form-group">
                <label className="aav-form-label">Team Section Subtitle</label>
                <input
                  type="text"
                  className="aav-form-input"
                  value={teamSection?.subtitle || ''}
                  onChange={e => setAboutData(prev => ({ ...prev, teamSection: { ...prev.teamSection, subtitle: e.target.value } }))}
                  placeholder="The engineers, editors, and designers shaping the future..."
                />
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="aav-team-grid">
              {(teamSection?.members || []).map((member, idx) => (
                <div key={member.id || idx} className="aav-team-card">
                  <div className="aav-team-card-top">
                    <img 
                      src={member.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                      alt={member.name} 
                      className="aav-team-avatar"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'; }}
                    />

                    <div className="aav-team-actions">
                      <button
                        type="button"
                        className="aav-icon-btn"
                        disabled={idx <= 0}
                        onClick={() => handleMoveMember(idx, 'up')}
                        title="Move earlier in order"
                      >
                        <ArrowLeft size={13} />
                      </button>

                      <button
                        type="button"
                        className="aav-icon-btn"
                        disabled={idx >= (teamSection?.members?.length || 0) - 1}
                        onClick={() => handleMoveMember(idx, 'down')}
                        title="Move later in order"
                      >
                        <ArrowRight size={13} />
                      </button>

                      <button
                        type="button"
                        className="aav-icon-btn"
                        onClick={() => setMemberModal({
                          isOpen: true,
                          isCreate: false,
                          index: idx,
                          data: { ...member }
                        })}
                        title="Edit member details"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        className="aav-icon-btn danger"
                        onClick={() => handleDeleteMember(idx)}
                        title="Remove member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="aav-team-name">{member.name}</h4>
                    <span className="aav-team-role">{member.role}</span>
                  </div>

                  {member.bio && (
                    <p className="aav-team-bio">{member.bio}</p>
                  )}

                  <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '6px' }}>
                    {member.linkedin && <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>LinkedIn</span>}
                    {member.github && <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>GitHub</span>}
                    {member.website && <span style={{ fontSize: '0.72rem', background: '#ffedd5', color: '#c2410c', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Web</span>}
                    {member.community && <span style={{ fontSize: '0.72rem', background: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Discord</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 6: SEO SETTINGS ── */}
        {activeTab === 'seo' && (
          <div className="aav-section-card">
            <div className="aav-card-header">
              <div className="aav-card-header-left">
                <div className="aav-card-icon-wrap">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="aav-card-title">SEO & Metadata Configuration</h3>
                  <div className="aav-card-subtitle">Search engine title, meta description, and social sharing tags</div>
                </div>
              </div>
            </div>

            <div className="aav-form-group">
              <label className="aav-form-label">SEO Page Title</label>
              <input
                type="text"
                className="aav-form-input"
                value={seo?.title || ''}
                onChange={e => updateSeo('title', e.target.value)}
                placeholder="About Us | GoReadPost Media"
              />
            </div>

            <div className="aav-form-group">
              <label className="aav-form-label">Meta Description</label>
              <textarea
                className="aav-form-textarea"
                rows={3}
                value={seo?.description || ''}
                onChange={e => updateSeo('description', e.target.value)}
                placeholder="GoReadPost is the premier digital journalism network chronicling breakthrough founders..."
              />
            </div>

            <div className="aav-form-group">
              <label className="aav-form-label">Keywords (Comma separated)</label>
              <input
                type="text"
                className="aav-form-input"
                value={seo?.keywords || ''}
                onChange={e => updateSeo('keywords', e.target.value)}
                placeholder="about us, GoReadPost, editorial, tech media, startup journalism"
              />
            </div>
          </div>
        )}

        {/* ── TAB 7: LIVE FULLPAGE PREVIEW ── */}
        {activeTab === 'preview' && (
          <div className="aav-section-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Live Preview of /about</span>
              </div>
              <button
                type="button"
                className="aav-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setActiveTab('hero')}
              >
                Back to Editor Controls
              </button>
            </div>

            <div className="aav-preview-wrapper">
              <AboutSection page={{ data: aboutData }} />
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: TEAM MEMBER EDIT / CREATE ── */}
      {memberModal.isOpen && (
        <div className="aav-modal-overlay" onClick={() => setMemberModal({ isOpen: false, isCreate: false, index: null, data: {} })}>
          <div className="aav-modal-box" onClick={e => e.stopPropagation()}>
            <div className="aav-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {memberModal.isCreate ? 'Add Core Team Member' : `Edit Team Member: ${memberModal.data?.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMemberModal({ isOpen: false, isCreate: false, index: null, data: {} })}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="aav-modal-body">
              <div className="aav-form-grid-2">
                <div className="aav-form-group">
                  <label className="aav-form-label">Full Name *</label>
                  <input
                    type="text"
                    className="aav-form-input"
                    value={memberModal.data?.name || ''}
                    onChange={e => setMemberModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                    placeholder="e.g. Elena Rostova"
                  />
                </div>

                <div className="aav-form-group">
                  <label className="aav-form-label">Role / Title *</label>
                  <input
                    type="text"
                    className="aav-form-input"
                    value={memberModal.data?.role || ''}
                    onChange={e => setMemberModal(prev => ({ ...prev, data: { ...prev.data, role: e.target.value } }))}
                    placeholder="e.g. Founder & Editor-in-Chief"
                  />
                </div>
              </div>

              <div className="aav-form-group">
                <label className="aav-form-label">Avatar Image URL</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {memberModal.data?.image && (
                    <img
                      src={memberModal.data.image}
                      alt="Preview"
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <input
                    type="text"
                    className="aav-form-input"
                    value={memberModal.data?.image || ''}
                    onChange={e => setMemberModal(prev => ({ ...prev, data: { ...prev.data, image: e.target.value } }))}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              <div className="aav-form-group">
                <label className="aav-form-label">Short Biography</label>
                <textarea
                  className="aav-form-textarea"
                  rows={3}
                  value={memberModal.data?.bio || ''}
                  onChange={e => setMemberModal(prev => ({ ...prev, data: { ...prev.data, bio: e.target.value } }))}
                  placeholder="Former tech journalist passionate about long-form essayist culture and decentralization."
                />
              </div>

              {/* Social Links */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <label className="aav-form-label" style={{ marginBottom: '8px' }}>Social Profiles & Links</label>
                <div className="aav-form-grid-2">
                  <div className="aav-form-group">
                    <label className="aav-form-hint">LinkedIn URL</label>
                    <input
                      type="text"
                      className="aav-form-input"
                      value={memberModal.data?.linkedin || ''}
                      onChange={e => setMemberModal(prev => ({ ...prev, data: { ...prev.data, linkedin: e.target.value } }))}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div className="aav-form-group">
                    <label className="aav-form-hint">GitHub URL</label>
                    <input
                      type="text"
                      className="aav-form-input"
                      value={memberModal.data?.github || ''}
                      onChange={e => setMemberModal(prev => ({ ...prev, data: { ...prev.data, github: e.target.value } }))}
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div className="aav-form-group">
                    <label className="aav-form-hint">Website / Portfolio</label>
                    <input
                      type="text"
                      className="aav-form-input"
                      value={memberModal.data?.website || ''}
                      onChange={e => setMemberModal(prev => ({ ...prev, data: { ...prev.data, website: e.target.value } }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="aav-form-group">
                    <label className="aav-form-hint">Discord / Community / X</label>
                    <input
                      type="text"
                      className="aav-form-input"
                      value={memberModal.data?.community || ''}
                      onChange={e => setMemberModal(prev => ({ ...prev, data: { ...prev.data, community: e.target.value } }))}
                      placeholder="https://discord.com or https://x.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="aav-modal-footer">
              <button
                type="button"
                className="aav-btn-secondary"
                onClick={() => setMemberModal({ isOpen: false, isCreate: false, index: null, data: {} })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="aav-btn-primary"
                onClick={handleSaveMemberModal}
              >
                <Check size={16} />
                <span>Save Member</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
