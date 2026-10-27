import React, { useState, useEffect } from 'react';
import { 
  FileText, Globe, CheckCircle, Clock, Eye, ThumbsUp, Plus, 
  ArrowUpRight, Image as ImageIcon, Navigation, Settings, Search,
  RefreshCw, TrendingUp, Sparkles, Layers, ShieldCheck, BookOpen,
  Cpu, Heart, ShoppingBag, Building2, Languages, Rocket, Activity,
  ChevronRight, Calendar, User, ExternalLink, Archive, FileEdit, RotateCcw,
  Tv, Mail, MessageSquare, Send
} from 'lucide-react';
import { PageService } from '../../services/pageService';
import { StoryService } from '../../services/storyService';
import { ArticleService } from '../../services/articleService';
import { AuthService } from '../../services/authService';
import { SettingService } from '../../services/settingService';
import { CommentService } from '../../services/commentService';
import { SubmissionService } from '../../services/submissionService';
import { VideoService } from '../../services/videoService';
import { TaxonomyService } from '../../services/taxonomyService';
import { NewsletterService } from '../../services/newsletterService';

export default function AdminDashboardView({ onNavigate, onShowToast, siteSettings: propSettings }) {
  const [siteSettings, setSiteSettings] = useState(() => propSettings || SettingService.getLocalSettings());
  const [imgFailed, setImgFailed] = useState(false);
  const [pages, setPages] = useState([]);
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [commentsMetric, setCommentsMetric] = useState({ totalComments: 0, pendingCount: 0 });
  const [submissionsMetric, setSubmissionsMetric] = useState({ totalPitches: 0, pendingCount: 0 });
  const [newsletterMetric, setNewsletterMetric] = useState({ publicationsCount: 0, subscribersCount: 0 });
  const [videoCount, setVideoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [storyFilter, setStoryFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'archived'
  const user = AuthService.getUser() || { name: 'Editor-in-Chief', email: 'admin@goreadpost.com' };

  useEffect(() => {
    if (propSettings) setSiteSettings(propSettings);
  }, [propSettings]);

  useEffect(() => {
    setImgFailed(false);
  }, [siteSettings?.logo, siteSettings?.logoUrl]);

  useEffect(() => {
    if (!siteSettings) {
      SettingService.getSettings().then(st => st && setSiteSettings(st)).catch(() => {});
    }
    const handleSettingsChange = (e) => {
      if (e.detail) {
        setSiteSettings(e.detail);
      } else {
        SettingService.getSettings().then(st => st && setSiteSettings(st)).catch(() => {});
      }
    };
    window.addEventListener('settings:change', handleSettingsChange);
    return () => window.removeEventListener('settings:change', handleSettingsChange);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pgs, articlesRes, sts, commRes, subRes, vids, cats, pubs, subs] = await Promise.all([
        PageService.getPages().catch(() => []),
        ArticleService.getAdminArticles({ limit: 500 }).catch(() => null),
        StoryService.getStories().catch(() => ({ data: [] })),
        CommentService.getAdminComments().catch(() => null),
        SubmissionService.getAdminSubmissions().catch(() => null),
        VideoService.getAdminVideos().catch(() => []),
        TaxonomyService.getCategories().catch(() => []),
        NewsletterService.getPublications().catch(() => []),
        NewsletterService.getAdminSubscribers().catch(() => [])
      ]);
      setPages(Array.isArray(pgs) ? pgs : (pgs?.data || []));

      const adminArticles = (articlesRes && articlesRes.data && Array.isArray(articlesRes.data))
        ? articlesRes.data
        : (sts && sts.data ? sts.data : []);

      setStories(adminArticles);
      if (commRes && commRes.metrics) setCommentsMetric(commRes.metrics);
      if (subRes && subRes.metrics) setSubmissionsMetric(subRes.metrics);
      if (Array.isArray(vids)) setVideoCount(vids.length);
      if (Array.isArray(cats)) setCategories(cats);
      setNewsletterMetric({
        publicationsCount: Array.isArray(pubs) ? pubs.length : 0,
        subscribersCount: Array.isArray(subs) ? subs.length : 0
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const publishedPages = pages.filter(p => p.status === 'published' || p.status === 'active').length;
  const draftPages = pages.filter(p => p.status !== 'published' && p.status !== 'active').length;
  const publishedStories = stories.filter(s => s.status === 'published').length;
  const draftStories = stories.filter(s => s.status === 'draft').length;
  const archivedStories = stories.filter(s => s.status === 'archived').length;
  const scheduledStories = stories.filter(s => s.status === 'scheduled').length;
  const totalViews = stories.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalClaps = stories.reduce((sum, s) => sum + (s.claps || 0), 0);

  // Exact Database Article Count for Each Category
  const getCategoryArticleCount = (cat) => {
    if (!cat) return 0;
    const nameLower = (cat.name || '').toLowerCase().trim();
    const slugLower = (cat.slug || '').toLowerCase().trim();
    
    return stories.filter(s => {
      const sCatName = (s.categoryName || '').toLowerCase().trim();
      const sCat = (s.category || '').toLowerCase().trim();
      return sCatName === nameLower || sCat === nameLower || sCat === slugLower || sCatName === slugLower;
    }).length;
  };

  // Aesthetic category styling with automatic fallback for any DB category
  const getCategoryStyle = (cat) => {
    const slug = (cat?.slug || '').toLowerCase();
    const name = (cat?.name || '').toLowerCase();
    
    if (slug.includes('startup') || name.includes('startup')) {
      return { icon: Rocket, color: '#dc2626', bg: '#fff1f2' };
    }
    if ((slug.includes('tech') && !slug.includes('deeptech')) || name === 'technology') {
      return { icon: Cpu, color: '#2563eb', bg: '#eff6ff' };
    }
    if (slug.includes('ai') || slug.includes('deeptech') || name.includes('deeptech')) {
      return { icon: Sparkles, color: '#0284c7', bg: '#f0f9ff' };
    }
    if (slug.includes('enterprise') || name.includes('enterprise')) {
      return { icon: Building2, color: '#4f46e5', bg: '#eef2ff' };
    }
    if (slug.includes('smb') || name.includes('smb')) {
      return { icon: ShoppingBag, color: '#d97706', bg: '#fffbeb' };
    }
    if (slug.includes('her') || name.includes('her')) {
      return { icon: Heart, color: '#db2777', bg: '#fdf2f8' };
    }
    if (slug.includes('social') || name.includes('social')) {
      return { icon: Activity, color: '#059669', bg: '#ecfdf5' };
    }
    if (slug.includes('hindi') || name.includes('हिंदी')) {
      return { icon: Languages, color: '#ea580c', bg: '#fff7ed' };
    }
    if (slug.includes('fintech') || name.includes('fintech')) {
      return { icon: TrendingUp, color: '#0891b2', bg: '#ecfeff' };
    }
    return { icon: Layers, color: '#6366f1', bg: '#eef2ff' };
  };

  return (
    <div className="adv-container">
      {/* Editorial Hub Welcome Header */}
      <div className="adv-welcome-banner">
        <div className="adv-welcome-left">
          <h1 className="adv-welcome-title">
            Welcome back, <span>{user?.name || 'Editorial Admin'}</span>
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Digital Media Network • Content Command Center
          </p>
        </div>
        <div className="adv-welcome-brand-badge">
          <div className="adv-brand-logo-preview">
            {(siteSettings?.logo || siteSettings?.logoUrl) && !imgFailed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 6px' }}>
                <img 
                  src={siteSettings.logo || siteSettings.logoUrl} 
                  alt={siteSettings?.siteTitle || siteSettings?.siteName || 'Logo'} 
                  style={{ maxHeight: '34px', maxWidth: '38px', objectFit: 'contain' }}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                />
                <div className="adv-brand-meta">
                  <span className="adv-brand-name">
                    {siteSettings?.siteName || siteSettings?.brandPrefix || 'GoReadPost'}
                  </span>
                  <span className="adv-brand-sub">EDITORIAL CMS</span>
                </div>
              </div>
            ) : (
              <>
                <div className="adv-brand-emblem">
                  {siteSettings?.brandEmblem || (siteSettings?.siteName ? siteSettings.siteName.trim().charAt(0).toUpperCase() : 'G')}
                </div>
                <div className="adv-brand-meta">
                  <span className="adv-brand-name">
                    {siteSettings?.brandPrefix || (siteSettings?.brandSuffix && siteSettings?.siteName?.endsWith(siteSettings.brandSuffix) ? siteSettings.siteName.slice(0, -siteSettings.brandSuffix.length) : siteSettings?.siteName) || 'GoRead'}
                    {siteSettings?.brandSuffix ? <span>{siteSettings.brandSuffix}</span> : null}
                  </span>
                  <span className="adv-brand-sub">EDITORIAL CMS</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="adv-stats-row">
        <div className="adv-stat-card" onClick={() => onNavigate('/admin/articles')}>
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <BookOpen size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Total Articles</span>
            <div className="adv-stat-number">{stories.length}</div>
            <div className="adv-stat-footer positive">
              <span className="adv-stat-live-dot" />
              <span>{publishedStories} Live • {stories.length} Total</span>
            </div>
          </div>
        </div>

        <div className="adv-stat-card" onClick={() => onNavigate('/admin/drafts')}>
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <FileEdit size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Drafts & Revisions</span>
            <div className="adv-stat-number" style={{ color: draftStories > 0 ? '#d97706' : 'inherit' }}>
              {draftStories}
            </div>
            <div className="adv-stat-footer neutral">
              <span>{draftStories > 0 ? `${draftStories} In progress` : 'No pending drafts'}</span>
            </div>
          </div>
        </div>


        <div className="adv-stat-card" onClick={() => onNavigate('/admin/pages')}>
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' }}>
            <Globe size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Dynamic Landing Pages</span>
            <div className="adv-stat-number">{pages.length}</div>
            <div className="adv-stat-footer positive">
              <span>{publishedPages} Published • {draftPages} Drafts</span>
            </div>
          </div>
        </div>

        <div className="adv-stat-card" onClick={() => onNavigate('/admin/videos')}>
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' }}>
            <Tv size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Video Productions</span>
            <div className="adv-stat-number">{videoCount} Shows</div>
            <div className="adv-stat-footer positive">
              <span className="adv-stat-live-dot" />
              <span>MongoDB Synced • {videoCount} Episodes</span>
            </div>
          </div>
        </div>

        <div className="adv-stat-card" onClick={() => onNavigate('/admin/comments')}>
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
            <MessageSquare size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Reader Comments</span>
            <div className="adv-stat-number">{commentsMetric.totalComments || 0}</div>
            <div className="adv-stat-footer positive">
              <span>{commentsMetric.pendingCount || 0} pending review</span>
            </div>
          </div>
        </div>

        <div className="adv-stat-card" onClick={() => onNavigate('/admin/submissions')}>
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c' }}>
            <Send size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Startup Pitches & Leads</span>
            <div className="adv-stat-number">{submissionsMetric.totalPitches || 0}</div>
            <div className="adv-stat-footer positive">
              <span>{submissionsMetric.pendingCount || 0} unreviewed decks</span>
            </div>
          </div>
        </div>

        <div className="adv-stat-card" onClick={() => onNavigate('/admin/newsletters')}>
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <Mail size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Newsletters &amp; Audiences</span>
            <div className="adv-stat-number">{newsletterMetric.publicationsCount} Editions</div>
            <div className="adv-stat-footer positive">
              <span>{newsletterMetric.subscribersCount} DB Subscribers</span>
            </div>
          </div>
        </div>

        <div className="adv-stat-card" onClick={() => onNavigate('/admin/categories')}>
          <div className="adv-stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
            <Layers size={22} />
          </div>
          <div className="adv-stat-content">
            <span className="adv-stat-label">Database Categories</span>
            <div className="adv-stat-number">{categories.length} Categories</div>
            <div className="adv-stat-footer positive">
              <span className="adv-stat-live-dot" />
              <span>{publishedStories} Live Stories Covered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title: Content Categories & Desks (100% Database Driven) */}
      <div className="adv-section-header">
        <div>
          <h2 className="adv-section-title">Content Categories &amp; Desks</h2>
          <p className="adv-section-desc">Active coverage categories stored in database ({categories.length} registered)</p>
        </div>
        <button 
          className="adv-link-btn" 
          onClick={() => onNavigate('/admin/categories')}
        >
          <span>Manage Categories ({categories.length})</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Dynamic Database Categories Grid */}
      <div className="adv-desks-grid-modern">
        {categories.map((cat) => {
          const style = getCategoryStyle(cat);
          const CatIcon = style.icon;
          const count = getCategoryArticleCount(cat);
          return (
            <div 
              key={cat._id || cat.id || cat.slug} 
              className="adv-desk-card-modern"
              onClick={() => onNavigate('/admin/articles')}
              title={`View ${cat.name} stories in database`}
            >
              <div className="adv-desk-icon-bubble" style={{ background: style.bg, color: style.color }}>
                <CatIcon size={19} />
              </div>
              <div className="adv-desk-info-compact">
                <span className="adv-desk-title-compact">{cat.name}</span>
                <span className="adv-desk-count-compact">
                  <strong>{count}</strong> {count === 1 ? 'Story' : 'Stories'}
                </span>
              </div>
              <div className="adv-desk-arrow-pill" style={{ color: style.color }}>
                <ArrowUpRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Stories & Dynamic Pages */}
      <div className="adv-two-col-grid">
        {/* Left Column: Recent Stories */}
        <div className="adv-panel-card">
          <div className="adv-panel-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 className="adv-panel-title">Recent Editorial Stories</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className={`adv-tab-pill ${storyFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStoryFilter('all')}
              >
                All ({stories.length})
              </button>
              <button 
                type="button" 
                className={`adv-tab-pill ${storyFilter === 'published' ? 'active' : ''}`}
                onClick={() => setStoryFilter('published')}
              >
                Live ({publishedStories})
              </button>
              <button 
                type="button" 
                className={`adv-tab-pill ${storyFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStoryFilter('draft')}
              >
                Drafts ({draftStories})
              </button>
              <button 
                className="adv-btn-sm" 
                onClick={() => {
                  if (storyFilter === 'draft') onNavigate('/admin/drafts');
                  else onNavigate('/admin/articles');
                }}
              >
                {storyFilter === 'draft' ? 'Manage Drafts' : 'Manage Stories'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="adv-loading-state">
              <RefreshCw className="animate-spin" size={20} />
              <span>Loading latest stories...</span>
            </div>
          ) : stories.length === 0 ? (
            <div className="adv-empty-box">
              <BookOpen size={36} color="var(--admin-text-faint)" />
              <p>No stories published yet.</p>
              <button className="adv-btn-primary" onClick={() => onNavigate('/admin/articles/create')}>
                Publish First Story
              </button>
            </div>
          ) : (
            (() => {
              const displayedStories = stories.filter(story => {
                if (storyFilter === 'all') return true;
                if (storyFilter === 'published') return story.status === 'published';
                if (storyFilter === 'draft') return story.status === 'draft';
                return true;
              }).slice(0, 5);

              if (displayedStories.length === 0) {
                return (
                  <div className="adv-empty-box" style={{ padding: '2rem 1rem' }}>
                    {storyFilter === 'draft' ? (
                      <>
                        <FileEdit size={32} color="#d97706" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No draft stories currently</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          All editorial stories are currently published.
                        </p>
                        <button className="adv-btn-primary" onClick={() => onNavigate('/admin/articles/create')}>
                          <Plus size={14} /> Create New Story Draft
                        </button>
                      </>
                    ) : (
                      <>
                        <BookOpen size={32} color="var(--admin-text-faint)" style={{ margin: '0 auto 0.5rem' }} />
                        <p>No stories found in this view.</p>
                      </>
                    )}
                  </div>
                );
              }

              return (
                <div className="adv-stories-list">
                  {displayedStories.map((story) => {
                    const storyImg = story.featuredImage?.url || story.image;
                    const deskOrCategory = story.brand || story.categoryName || 'GoReadPost';
                    const storySlug = story.slug || (story._id || story.id);
                    return (
                      <div key={story._id || story.id} className="adv-story-row-modern">
                        <div className="adv-story-thumb-wrap">
                          {storyImg ? (
                            <img 
                              src={storyImg} 
                              alt="" 
                              className="adv-story-thumb-img" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="adv-story-thumb-fallback">
                              <FileText size={18} color="var(--brand-primary)" />
                            </div>
                          )}
                        </div>
                        <div className="adv-story-info-modern">
                          <div className="adv-story-badge-row">
                            <span className="adv-story-category-tag">{deskOrCategory}</span>
                            <span className={`adv-story-status-tag ${story.status || 'published'}`}>
                              {story.status === 'published' ? 'Live' : story.status === 'draft' ? 'Draft' : story.status === 'archived' ? 'Archived' : 'Scheduled'}
                            </span>
                          </div>
                          <h4 
                            className="adv-story-headline"
                            onClick={() => onNavigate(`/admin/posts/${story._id || story.id}/edit`)}
                            title={story.title}
                          >
                            {story.title}
                          </h4>
                          <div className="adv-story-meta-row">
                            <span><User size={11} /> {story.authorName || 'Editorial Desk'}</span>
                            <span>•</span>
                            <span><Eye size={11} /> {(story.views || 0).toLocaleString()} views</span>
                            <span>•</span>
                            <span><ThumbsUp size={11} /> {story.claps || 0} claps</span>
                          </div>
                        </div>
                        <div className="adv-story-actions-modern">
                          <button 
                            className="adv-btn-edit-action" 
                            onClick={() => onNavigate(`/admin/posts/${story._id || story.id}/edit`)}
                            title="Edit Story"
                          >
                            Edit
                          </button>
                          <a 
                            href={`/story/${storySlug}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="adv-btn-view-action"
                            title="View Story Live"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {/* Right Column: Dynamic Pages & System Health */}
        <div className="adv-right-col">
          {/* Dynamic Pages Box */}
          <div className="adv-panel-card">
            <div className="adv-panel-header">
              <div>
                <h3 className="adv-panel-title">Editable Site Pages ({pages.length})</h3>
              </div>
              <button 
                className="adv-btn-sm" 
                onClick={() => onNavigate('/admin/pages')}
              >
                Manage Pages
              </button>
            </div>

            {loading ? (
              <div className="adv-loading-state">
                <RefreshCw className="animate-spin" size={20} />
                <span>Loading pages...</span>
              </div>
            ) : pages.length === 0 ? (
              <div className="adv-empty-box">
                <FileText size={36} color="var(--admin-text-faint)" />
                <p>No site pages found.</p>
                <button className="adv-btn-primary" onClick={() => onNavigate('/admin/pages')}>
                  Go to Pages CMS
                </button>
              </div>
            ) : (
              <div className="adv-pages-list">
                {pages.slice(0, 7).map((page) => {
                  const pageType = (page.id === 'home' || page.slug === '' || page.slug === 'home') ? 'home'
                    : (page.id === 'category' || page.slug === 'categories' || page.slug === 'category') ? 'category'
                    : (page.id === 'contact' || page.slug === 'contact') ? 'contact'
                    : (page.id === 'about' || page.slug === 'about') ? 'about'
                    : (page.id === 'page_advertise' || page.id === 'advertise' || page.slug === 'advertise') ? 'advertise'
                    : page.id;

                  let pageUrl = '/';
                  if (pageType === 'category') pageUrl = '/categories';
                  else if (pageType === 'contact') pageUrl = '/contact';
                  else if (pageType === 'about') pageUrl = '/about';
                  else if (pageType === 'advertise') pageUrl = '/advertise';
                  else pageUrl = '/';

                  const handleEdit = () => {
                    if (pageType === 'home') onNavigate('/admin/homepage');
                    else if (pageType === 'category') onNavigate('/admin/category');
                    else if (pageType === 'about') onNavigate('/admin/about');
                    else if (pageType === 'contact') onNavigate('/admin/pages/contact/edit');
                    else if (pageType === 'advertise') onNavigate('/admin/pages/page_advertise/edit');
                    else onNavigate(`/admin/pages/${page._id || page.id}/edit`);
                  };

                  return (
                    <div key={page._id || page.id} className="adv-page-row-modern">
                      <div className="adv-page-icon-wrap">
                        <Globe size={18} />
                      </div>
                      <div className="adv-page-info-modern">
                        <div className="adv-page-title-modern">{page.title}</div>
                        <div className="adv-page-path-pill">{pageUrl}</div>
                      </div>
                      <div className="adv-page-actions-modern">
                        <span className={`adv-status-dot ${page.status === 'published' ? 'published' : 'draft'}`} title={page.status} />
                        <button 
                          className="adv-btn-edit-action"
                          onClick={handleEdit}
                          title="Edit Page"
                        >
                          Edit
                        </button>
                        <a 
                          href={pageUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="adv-btn-view-action"
                          title="Live Page Preview"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {pages.length > 7 && (
              <button 
                className="adv-link-btn"
                style={{ alignSelf: 'flex-start', marginTop: '0.25rem', fontSize: '0.8rem' }}
                onClick={() => onNavigate('/admin/pages')}
              >
                View all dynamic pages ({pages.length}) →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
