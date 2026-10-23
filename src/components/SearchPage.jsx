import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowLeft, RefreshCw, Hash, Tag, Layers, Users,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { SearchService } from '../services/searchService';
import StoriesGrid from './StoriesGrid';

export default function SearchPage({
  initialQuery = '',
  onSelectStory,
  onNavigateEntity,
  onBack,
  isSaved,
  onToggleSave,
  onShareStory,
  onClapStory
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({
    articles: [],
    authors: [],
    topics: [],
    categories: [],
    tags: []
  });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (query) {
      document.title = `Search: "${query}" | GoReadPost`;
    } else {
      document.title = 'Search Intelligence & Archives | GoReadPost';
    }
    return () => {
      document.title = 'GoReadPost - Business, Tech & Startup Intelligence';
    };
  }, [query]);

  const handleSearch = async (searchStr) => {
    const q = (searchStr !== undefined ? searchStr : query).trim();
    if (!q) return;
    setLoading(true);
    setCurrentPage(1);
    try {
      const data = await SearchService.search(q);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchFallbackImg = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80';
  const formattedArticles = (results.articles || []).map(a => {
    const rawImg = a.image || (typeof a.featuredImage === 'string' ? a.featuredImage : a.featuredImage?.url) || a.heroImage;
    const validImg = (rawImg && typeof rawImg === 'string' && rawImg.trim().length > 0 && !rawImg.includes('[object') && !rawImg.includes('undefined')) 
      ? rawImg 
      : searchFallbackImg;

    return {
      ...a,
      id: a._id || a.slug,
      image: validImg,
      fallbackImage: searchFallbackImg,
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

  const totalHits = 
    (results.articles?.length || 0) + 
    (results.authors?.length || 0) + 
    (results.topics?.length || 0) + 
    (results.categories?.length || 0) + 
    (results.tags?.length || 0);

  const totalPages = Math.max(1, Math.ceil(formattedArticles.length / pageSize));
  const paginatedArticles = formattedArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="search-results-page-wrapper" style={{ minHeight: '70vh', padding: '1.25rem 0 4rem' }}>
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
          <span className="breadcrumb-muted">Search</span>
          {query && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">"{query}"</span>
            </>
          )}
        </nav>

        {/* 2. Clean Search Results Bar */}
        <div className="section-header-row" style={{ marginBottom: '1.25rem', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {query ? (
              <span>Showing results for <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong> ({totalHits} found)</span>
            ) : (
              <span>Search GoReadPost stories and reports</span>
            )}
          </div>
          <div className="section-meta-counter">
            <span>{formattedArticles.length} {formattedArticles.length === 1 ? 'Story' : 'Stories'}</span>
          </div>
        </div>

        {/* 3. Related Desks & Tags Pills (Clean, Non-Intrusive Strip) */}
        {!loading && (results.categories?.length > 0 || results.tags?.length > 0 || results.authors?.length > 0) && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            flexWrap: 'wrap', 
            marginBottom: '1.75rem',
            padding: '0.65rem 1rem',
            background: 'var(--bg-secondary, #f8fafc)',
            borderRadius: '9999px',
            border: '1px solid var(--border-light, #e2e8f0)'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
              Related:
            </span>

            {results.categories?.map(c => (
              <button
                key={c._id || c.slug}
                type="button"
                onClick={() => onNavigateEntity?.('category', c.slug)}
                className="ys-brand-pill"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Layers size={12} color="var(--brand-primary, #dc2626)" />
                <span>{c.name} Desk</span>
              </button>
            ))}

            {results.tags?.map(t => (
              <button
                key={t._id || t.slug}
                type="button"
                onClick={() => onNavigateEntity?.('tag', t.slug)}
                className="ys-brand-pill"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Tag size={12} color="var(--brand-primary, #dc2626)" />
                <span>#{t.name}</span>
              </button>
            ))}

            {results.authors?.map(a => (
              <button
                key={a._id || a.slug}
                type="button"
                onClick={() => onNavigateEntity?.('author', a.slug)}
                className="ys-brand-pill"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Users size={12} color="var(--brand-primary, #dc2626)" />
                <span>{a.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* 4. Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <RefreshCw size={36} color="var(--brand-primary, #dc2626)" style={{ animation: 'spin 1.2s linear infinite' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Searching Editorial Archive...
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              Querying stories, deeptech reports, and venture rounds
            </p>
          </div>
        )}

        {/* 5. Empty State */}
        {!loading && formattedArticles.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 1.5rem', 
            background: 'var(--bg-secondary, #f8fafc)', 
            borderRadius: '16px', 
            border: '1px solid var(--border-light, #e2e8f0)',
            maxWidth: '680px',
            margin: '2rem auto'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'rgba(234, 88, 12, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem',
              color: 'var(--brand-primary, #dc2626)'
            }}>
              <Search size={28} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No Stories Found Matching "{query}"
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We couldn't locate articles with that exact keyword. Try broader terms like <strong>"Startups"</strong>, <strong>"AI"</strong>, or explore our category desks.
            </p>
            <button 
              type="button" 
              onClick={onBack}
              className="modern-pitch-btn"
              style={{ padding: '0.65rem 1.35rem', fontSize: '0.88rem' }}
            >
              <ArrowLeft size={15} /> Return to Homepage
            </button>
          </div>
        )}

        {/* 6. Results Articles Grid (Native GoReadPost Grid) */}
        {!loading && formattedArticles.length > 0 && (
          <div>
            <StoriesGrid 
              stories={paginatedArticles}
              title=""
              onSelectStory={onSelectStory}
              isSaved={isSaved}
              onToggleSave={onToggleSave}
              onShareStory={onShareStory}
              onClapStory={onClapStory}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem' }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
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
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.45 : 1,
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: p === currentPage ? 'none' : '1px solid var(--border-medium, #cbd5e1)',
                      background: p === currentPage ? 'var(--brand-primary, #dc2626)' : 'var(--bg-secondary, #fff)',
                      color: p === currentPage ? '#fff' : 'var(--text-primary)',
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
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
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
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.45 : 1,
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
