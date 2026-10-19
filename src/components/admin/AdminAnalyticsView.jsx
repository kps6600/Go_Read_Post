import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Eye, BookOpen, Users, FolderTree, TrendingUp, RefreshCw, AlertCircle, ArrowUpRight, Flame, Heart, Sparkles, Layers
} from 'lucide-react';
import { AnalyticsService } from '../../services/analyticsService';

const CATEGORY_ACCENTS = {
  'Startups': '#e11d48',
  'Technology': '#0284c7',
  'Enterprise': '#6366f1',
  'AI & DeepTech': '#8b5cf6',
  'SMBStory': '#d97706',
  'HerStory': '#ec4899',
  'SocialStory': '#10b981',
  'YS हिंदी': '#ea580c',
  'FinTech': '#059669'
};

export default function AdminAnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AnalyticsService.getAnalytics();
      if (res) setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {
    totalViews: 0,
    totalClaps: 0,
    avgViewsPerArticle: 0,
    totalArticles: 0,
    publishedCount: 0,
    draftCount: 0,
    totalAuthors: 0,
    totalCategories: 0
  };

  const totalCatArticles = (data?.categoryBreakdown || []).reduce((sum, c) => sum + (c.articlesCount || 0), 0) || Math.max(1, metrics.totalArticles);

  return (
    <div className="admin-page-container">
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Editorial Analytics & Readership
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
            Live audience impressions, taxonomy volume distribution, and engagement metrics.
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            background: 'var(--bg-card, #fff)', border: '1px solid var(--border-medium, #cbd5e1)', borderRadius: '8px',
            fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary, #334155)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)', fontSize: '0.84rem'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        {/* 1. Total Views */}
        <div style={{ background: 'var(--bg-card, #fff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL VIEWS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.02em' }}>
            {(metrics.totalViews || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '650', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} />
            <span>Organic Reader Impressions</span>
          </div>
        </div>

        {/* 2. Total Published Articles */}
        <div style={{ background: 'var(--bg-card, #fff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ARTICLES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.02em' }}>
            {metrics.totalArticles || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '6px' }}>
            <span>{metrics.publishedCount || 0} Published • {metrics.draftCount || 0} Drafts</span>
          </div>
        </div>

        {/* 3. Authors */}
        <div style={{ background: 'var(--bg-card, #fff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AUTHORS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.02em' }}>
            {metrics.totalAuthors || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '6px' }}>
            <span>Contributing Reporters & Desks</span>
          </div>
        </div>

        {/* 4. Real Categories */}
        <div style={{ background: 'var(--bg-card, #fff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>CATEGORIES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(126, 34, 206, 0.1)', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderTree size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.02em' }}>
            {metrics.totalCategories || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '6px' }}>
            <span>Active Taxonomy Verticals</span>
          </div>
        </div>

        {/* 5. Reader Claps / Engagement */}
        <div style={{ background: 'var(--bg-card, #fff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ENGAGEMENT</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.02em' }}>
            {(metrics.totalClaps || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '6px' }}>
            <span>Reader Claps & Reactions</span>
          </div>
        </div>
      </div>

      {/* Grid: Top Articles & Categories Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Top Articles by Real Views */}
        <div style={{ background: 'var(--bg-card, #fff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={17} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                Most Read Articles
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--text-muted, #64748b)' }}>
              Top 10 by Readership
            </span>
          </div>

          {(data?.topArticles || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px' }}>No readership data accumulated yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(data?.topArticles || []).map((art, idx) => (
                <div 
                  key={art._id || idx} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingBottom: '12px', 
                    borderBottom: '1px solid var(--border-light, #f1f5f9)',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '800', 
                      color: idx < 3 ? '#e11d48' : 'var(--text-muted, #94a3b8)', 
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: idx < 3 ? 'rgba(225, 29, 72, 0.08)' : 'var(--bg-tertiary, #f1f5f9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      #{idx + 1}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <a 
                        href={`/article/${art.slug}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ 
                          fontSize: '13.5px', 
                          fontWeight: '700', 
                          color: 'var(--text-primary, #0f172a)', 
                          textDecoration: 'none',
                          display: 'block',
                          lineHeight: 1.4,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {art.title}
                      </a>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          color: CATEGORY_ACCENTS[art.categoryName] || '#e11d48',
                          fontWeight: '700'
                        }}>
                          {art.categoryName || 'Startups'}
                        </span>
                        <span>•</span>
                        <span>{art.authorName || 'Editorial Desk'}</span>
                        {art.claps > 0 && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#e11d48', fontWeight: '600' }}>👏 {art.claps}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontWeight: '800', fontSize: '14px', color: '#e11d48' }}>
                      {(art.views || 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', display: 'block' }}>views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Category Volume Breakdown */}
        <div style={{ background: 'var(--bg-card, #fff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderTree size={17} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                Category Volume Breakdown
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--text-muted, #64748b)' }}>
              All 9 Taxonomy Verticals
            </span>
          </div>

          {(data?.categoryBreakdown || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px' }}>No categories available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {(data?.categoryBreakdown || []).map((cat, idx) => {
                const color = CATEGORY_ACCENTS[cat.name] || '#0284c7';
                const sharePercent = Math.round((cat.articlesCount / totalCatArticles) * 100);

                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '650', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: color, flexShrink: 0 }}></span>
                        <span style={{ color: 'var(--text-primary, #0f172a)' }}>{cat.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted, #64748b)' }}>
                          <strong>{cat.articlesCount}</strong> articles ({sharePercent}%)
                        </span>
                        <span style={{ color: color, fontWeight: '750' }}>
                          {(cat.views || 0).toLocaleString()} views
                        </span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary, #f1f5f9)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(4, sharePercent))}%`,
                          height: '100%',
                          background: color,
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

