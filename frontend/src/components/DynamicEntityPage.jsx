import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, RefreshCw, AlertCircle, BookOpen, Layers, Users, Hash, Tag,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { TaxonomyService } from '../services/taxonomyService';
import StoriesGrid from './StoriesGrid';

export default function DynamicEntityPage({
  type = 'category',
  slug,
  onBack,
  onSelectStory,
  isSaved,
  onToggleSave,
  onShareStory,
  onClapStory
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    if (!slug) return;
    setPage(1);
    setSelectedCategory('all');
  }, [type, slug]);

  useEffect(() => {
    if (!slug) return;
    loadEntity();
  }, [type, slug, page, sort, selectedCategory]);

  useEffect(() => {
    const entity = data ? (data[type] || data.category || data.author || data.topic || data.tag) : null;
    const name = (slug === 'latest' || slug === 'just-in') ? 'Latest Stories & News' : (entity?.seoTitle || entity?.name || slug);
    if (name) {
      const typeLabel = type === 'category' ? 'Desk' : type.charAt(0).toUpperCase() + type.slice(1);
      document.title = `${name} | GoReadPost ${typeLabel}`;
    }
    const metaDesc = entity?.seoDescription || entity?.description;
    if (metaDesc) {
      let metaEl = document.querySelector('meta[name="description"]');
      if (!metaEl) {
        metaEl = document.createElement('meta');
        metaEl.setAttribute('name', 'description');
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', metaDesc);
    }
    return () => {
      document.title = 'GoReadPost - Business, Tech & Startup Intelligence';
    };
  }, [data, type, slug]);

  const loadEntity = async () => {
    setLoading(true);
    setError(null);
    try {
      let res = null;
      const params = { 
        page, 
        limit: 12, 
        sort,
        ...(selectedCategory && selectedCategory !== 'all' ? { category: selectedCategory } : {})
      };
      if (type === 'category') {
        res = await TaxonomyService.getCategoryBySlug(slug, params);
      } else if (type === 'author') {
        res = await TaxonomyService.getAuthorBySlug(slug, params);
      } else if (type === 'topic') {
        res = await TaxonomyService.getTopicBySlug(slug, params);
      } else if (type === 'tag') {
        res = await TaxonomyService.getTagBySlug(slug, params);
      }

      if (res) {
        setData(res);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(`${type.toUpperCase()} not found`);
      }
    } catch (err) {
      setError(err.message || `Failed to load ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const fallbackDefaultImg = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80';
  const entity = data ? (data[type] || data.category || data.author || data.topic || data.tag || {}) : {};
  const articles = (data?.articles || []).map(a => {
    const rawImg = a.image || (typeof a.featuredImage === 'string' ? a.featuredImage : a.featuredImage?.url) || a.heroImage;
    const validImg = (rawImg && typeof rawImg === 'string' && rawImg.trim().length > 0 && !rawImg.includes('[object') && !rawImg.includes('undefined')) 
      ? rawImg 
      : fallbackDefaultImg;

    return {
      ...a,
      id: a._id || a.slug,
      image: validImg,
      fallbackImage: fallbackDefaultImg,
      categoryTag: a.categoryName || 'STORY',
      categoryLabel: a.categoryName || 'Story',
      author: {
        name: a.authorName || 'Editorial Staff',
        role: a.authorTitle || 'Reporter',
        avatar: a.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
      },
      publishedAt: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'
    };
  });

  if (loading && !data) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem 1rem' }}>
        <RefreshCw size={36} color="var(--brand-primary, #ea580c)" style={{ animation: 'spin 1.2s linear infinite' }} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Loading {entity.name || slug}...</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Retrieving curated editorial coverage from GoReadPost</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary, #ea580c)', marginBottom: '1.25rem' }}>
          <AlertCircle size={30} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          {type?.toUpperCase()} Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          We couldn't locate any records for <code>/{type}/{slug}</code>. The section may have been renamed or archived.
        </p>
        <button
          onClick={onBack}
          className="modern-pitch-btn"
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}
        >
          <ArrowLeft size={15} /> Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="dynamic-entity-page-wrapper" style={{ minHeight: '70vh', padding: '1.25rem 0 4rem' }}>
      <div className="container">
        
        {/* 1. Breadcrumb Navigation (Exact GoReadPost Standard) */}
        <nav className="just-in-breadcrumb" aria-label="Breadcrumb">
          <button 
            type="button" 
            className="breadcrumb-home-link"
            onClick={onBack}
          >
            <ArrowLeft size={14} />
            <span>Home</span>
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-muted">
            {type === 'category' ? 'Desks' : type === 'author' ? 'Authors' : type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">
            {(slug === 'latest' || slug === 'just-in') ? 'Latest News' : (entity.name || slug)}
          </span>
        </nav>

        {/* 2. Page Controls & Filter Bar */}
        <div className="section-header-row" style={{ marginBottom: '1.25rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.85rem' }}>
          <div className="section-title-box">
            {type === 'author' ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
                <img
                  src={entity.image || entity.profileImage || fallbackDefaultImg}
                  alt={entity.name}
                  style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary, #dc2626)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  onError={e => { e.currentTarget.src = fallbackDefaultImg; }}
                />
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h1 className="section-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{entity.name}</h1>
                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: 750,
                      color: '#0284c7',
                      background: 'rgba(2, 132, 199, 0.1)',
                      border: '1px solid rgba(2, 132, 199, 0.28)',
                      padding: '2px 9px',
                      borderRadius: '999px'
                    }}>
                      {pagination?.total || entity.publishedArticlesCount || entity.totalPublishedArticles || 0} Published Articles
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: 'var(--brand-primary, #dc2626)', fontWeight: '750', marginTop: '2px' }}>
                    {entity.designation || 'Technology Writer'}
                  </div>

                  {entity.bio && (
                    <p style={{ margin: '0.4rem 0 0.6rem', maxWidth: '760px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      {entity.bio}
                    </p>
                  )}

                  {/* Author Social Media Links */}
                  {entity.socialLinks && Object.values(entity.socialLinks).some(Boolean) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {entity.socialLinks.linkedin && (
                        <a href={entity.socialLinks.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" style={{ color: '#0077b5', display: 'inline-flex' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                      )}
                      {entity.socialLinks.facebook && (
                        <a href={entity.socialLinks.facebook} target="_blank" rel="noreferrer" title="Facebook" style={{ color: '#1877f2', display: 'inline-flex' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                        </a>
                      )}
                      {entity.socialLinks.instagram && (
                        <a href={entity.socialLinks.instagram} target="_blank" rel="noreferrer" title="Instagram" style={{ color: '#e4405f', display: 'inline-flex' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                      )}
                      {entity.socialLinks.twitter && (
                        <a href={entity.socialLinks.twitter} target="_blank" rel="noreferrer" title="X (Twitter)" style={{ color: '#0f172a', display: 'inline-flex' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      )}
                      {entity.socialLinks.youtube && (
                        <a href={entity.socialLinks.youtube} target="_blank" rel="noreferrer" title="YouTube" style={{ color: '#ff0000', display: 'inline-flex' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                        </a>
                      )}
                      {entity.socialLinks.website && (
                        <a href={entity.socialLinks.website} target="_blank" rel="noreferrer" title="Personal Website" style={{ color: '#475569', display: 'inline-flex' }}>
                          <Globe size={16} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (slug === 'latest' || slug === 'just-in') ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
                  Desk:
                </span>
                {[
                  { id: 'all', label: 'All Desks' },
                  { id: 'startups', label: 'Startups' },
                  { id: 'technology', label: 'Technology' },
                  { id: 'ai', label: 'AI & DeepTech' },
                  { id: 'enterprise', label: 'Enterprise' },
                  { id: 'fintech', label: 'FinTech' },
                  { id: 'grassroots', label: 'Grassroots' },
                  { id: 'women', label: 'Women in Tech' }
                ].map(desk => (
                  <button
                    key={desk.id}
                    type="button"
                    onClick={() => { setSelectedCategory(desk.id); setPage(1); }}
                    className={`ys-brand-pill ${selectedCategory === desk.id ? 'active' : ''}`}
                    style={{
                      fontSize: '0.76rem',
                      padding: '0.22rem 0.75rem',
                      borderRadius: '16px',
                      fontWeight: selectedCategory === desk.id ? 700 : 500,
                      background: selectedCategory === desk.id ? 'var(--brand-primary, #ea580c)' : 'transparent',
                      color: selectedCategory === desk.id ? '#ffffff' : 'inherit',
                      borderColor: selectedCategory === desk.id ? 'var(--brand-primary, #ea580c)' : 'var(--border-medium, #cbd5e1)'
                    }}
                  >
                    {desk.label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {pagination.total > 0 && `${pagination.total} stories in ${entity.name || slug}`}
              </div>
            )}
          </div>

          {/* Sort Pills on Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
              Sort:
            </span>
            {[
              { id: 'latest', label: 'Latest' },
              { id: 'popular', label: 'Most Viewed' },
              { id: 'claps', label: 'Top Applauded' },
              { id: 'oldest', label: 'Archive' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setSort(s.id); setPage(1); }}
                className={`ys-brand-pill ${sort === s.id ? 'active' : ''}`}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.25rem 0.75rem',
                  background: sort === s.id ? 'var(--brand-primary, #ea580c)' : 'transparent',
                  color: sort === s.id ? '#ffffff' : 'inherit',
                  borderColor: sort === s.id ? 'var(--brand-primary, #ea580c)' : 'var(--border-medium, #cbd5e1)'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Empty State */}
        {articles.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '16px', border: '1px solid var(--border-light, #e2e8f0)', maxWidth: '640px', margin: '2rem auto' }}>
            <BookOpen size={36} color="var(--brand-primary, #ea580c)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No Articles Published Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              Our editorial desk is preparing fresh stories for {entity.name || slug}. Check back shortly for updates.
            </p>
            <button 
              type="button" 
              onClick={onBack}
              className="modern-pitch-btn"
              style={{ padding: '0.65rem 1.35rem', fontSize: '0.88rem' }}
            >
              <ArrowLeft size={15} /> Back to Frontpage
            </button>
          </div>
        )}

        {/* 4. Stories Grid */}
        {articles.length > 0 && (
          <div>
            <StoriesGrid
              stories={articles}
              title=""
              onSelectStory={onSelectStory}
              isSaved={isSaved}
              onToggleSave={onToggleSave}
              onShareStory={onShareStory}
              onClapStory={onClapStory}
            />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem' }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium, #cbd5e1)',
                    background: 'var(--bg-secondary, #fff)',
                    color: 'var(--text-primary)',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    opacity: page <= 1 ? 0.45 : 1,
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: p === page ? 'none' : '1px solid var(--border-medium, #cbd5e1)',
                      background: p === page ? 'var(--brand-primary, #ea580c)' : 'var(--bg-secondary, #fff)',
                      color: p === page ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '13px'
                    }}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => {
                    setPage(p => Math.min(pagination.totalPages, p + 1));
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium, #cbd5e1)',
                    background: 'var(--bg-secondary, #fff)',
                    color: 'var(--text-primary)',
                    cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                    opacity: page >= pagination.totalPages ? 0.45 : 1,
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
