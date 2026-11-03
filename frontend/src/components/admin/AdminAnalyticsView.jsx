import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Eye, AlertCircle, Sparkles, Layers, FileText, Users, Heart, RefreshCw, TrendingUp
} from 'lucide-react';
import { AnalyticsService } from '../../services/analyticsService';
import './AdminAnalyticsView.css';

const CATEGORY_ACCENTS = {
  'Startups': '#dc2626',
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
    <div className="aav-container">
      {/* Overview Header Card */}
      <div className="aav-header-card">
        <div className="aav-header-left">
          <h2 className="aav-page-title">
            <BarChart3 size={20} color="#dc2626" />
            <span>Readership & Analytics</span>
          </h2>
          <p className="aav-page-subtitle">Real-time reader volume, catalog distribution, and content engagement.</p>
        </div>
        <div className="aav-header-actions">
          <div className="aav-live-badge">
            <span className="aav-pulse-dot" />
            <span>Live Data</span>
          </div>
          <button 
            type="button" 
            className="aav-refresh-btn" 
            onClick={loadAnalytics}
            disabled={loading}
            title="Refresh Analytics"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Cards Grid (Balanced 2-col on Mobile, 5-col on Desktop) */}
      <div className="aav-kpi-grid">
        {/* 1. Total Views */}
        <div className="aav-kpi-card">
          <div className="aav-kpi-top">
            <span className="aav-kpi-label">TOTAL READS</span>
            <div className="aav-kpi-icon-pill aav-kpi-icon-blue">
              <Eye size={15} />
            </div>
          </div>
          <div className="aav-kpi-value">
            {(metrics.totalViews || 0).toLocaleString()}
          </div>
          <div className="aav-kpi-footer">
            <span>avg ~{metrics.avgViewsPerArticle || 0} / story</span>
          </div>
        </div>

        {/* 2. Total Articles */}
        <div className="aav-kpi-card">
          <div className="aav-kpi-top">
            <span className="aav-kpi-label">ARTICLES</span>
            <div className="aav-kpi-icon-pill aav-kpi-icon-emerald">
              <FileText size={15} />
            </div>
          </div>
          <div className="aav-kpi-value">
            {metrics.totalArticles || 0}
          </div>
          <div className="aav-kpi-footer">
            <span>{metrics.publishedCount || 0} published stories</span>
          </div>
        </div>

        {/* 3. Authors */}
        <div className="aav-kpi-card">
          <div className="aav-kpi-top">
            <span className="aav-kpi-label">AUTHORS</span>
            <div className="aav-kpi-icon-pill aav-kpi-icon-purple">
              <Users size={15} />
            </div>
          </div>
          <div className="aav-kpi-value">
            {metrics.totalAuthors || 0}
          </div>
          <div className="aav-kpi-footer">
            <span>verified contributors</span>
          </div>
        </div>

        {/* 4. Real Categories */}
        <div className="aav-kpi-card">
          <div className="aav-kpi-top">
            <span className="aav-kpi-label">CATEGORIES</span>
            <div className="aav-kpi-icon-pill aav-kpi-icon-amber">
              <Layers size={15} />
            </div>
          </div>
          <div className="aav-kpi-value">
            {metrics.totalCategories || 0}
          </div>
          <div className="aav-kpi-footer">
            <span>editorial verticals</span>
          </div>
        </div>

        {/* 5. Reader Claps / Engagement */}
        <div className="aav-kpi-card">
          <div className="aav-kpi-top">
            <span className="aav-kpi-label">TOTAL ENGAGEMENT</span>
            <div className="aav-kpi-icon-pill aav-kpi-icon-rose">
              <Heart size={15} />
            </div>
          </div>
          <div className="aav-kpi-value">
            {(metrics.totalClaps || 0).toLocaleString()}
          </div>
          <div className="aav-kpi-footer">
            <span>reader claps & reactions</span>
          </div>
        </div>
      </div>

      {/* Grid: Top Articles & Categories Breakdown */}
      <div className="aav-details-grid">
        {/* Top Articles by Real Views */}
        <div className="aav-card">
          <div className="aav-card-header">
            <h3 className="aav-card-title">
              <TrendingUp size={18} color="#dc2626" />
              <span>Most Read Articles</span>
            </h3>
            <span className="aav-card-badge">
              Top 10 Readership
            </span>
          </div>

          {(data?.topArticles || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '13px', margin: '16px 0' }}>No readership data accumulated yet.</p>
          ) : (
            <div className="aav-articles-list">
              {(data?.topArticles || []).map((art, idx) => {
                const catColor = CATEGORY_ACCENTS[art.categoryName] || '#dc2626';
                const rankClass = idx === 0 ? 'aav-rank-top1' : idx === 1 ? 'aav-rank-top2' : idx === 2 ? 'aav-rank-top3' : 'aav-rank-other';
                
                return (
                  <div key={art._id || idx} className="aav-article-row">
                    <div className="aav-article-top-row">
                      <span className={`aav-rank-badge ${rankClass}`}>#{idx + 1}</span>
                      <span className="aav-views-chip">
                        <Eye size={12} />
                        {(art.views || 0).toLocaleString()}
                      </span>
                    </div>

                    <a 
                      href={`/article/${art.slug}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="aav-article-title-link"
                      title={art.title}
                    >
                      {art.title}
                    </a>

                    <div className="aav-article-meta-row">
                      <span 
                        className="aav-cat-chip"
                        style={{
                          color: catColor,
                          background: `${catColor}14`,
                          border: `1px solid ${catColor}30`
                        }}
                      >
                        {art.categoryName || 'Startups'}
                      </span>
                      <span className="aav-dot-sep">•</span>
                      <span>{art.authorName || 'Editorial Desk'}</span>
                      {art.claps > 0 && (
                        <>
                          <span className="aav-dot-sep">•</span>
                          <span className="aav-claps-chip">
                            <Heart size={10} color="#e11d48" fill="#e11d48" />
                            <span>{art.claps}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real Category Volume Breakdown */}
        <div className="aav-card">
          <div className="aav-card-header">
            <h3 className="aav-card-title">
              <Layers size={18} color="#0284c7" />
              <span>Category Volume</span>
            </h3>
            <span className="aav-card-badge">
              Vertical Distribution
            </span>
          </div>

          {(data?.categoryBreakdown || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '13px', margin: '16px 0' }}>No categories available.</p>
          ) : (
            <div className="aav-cats-list">
              {(data?.categoryBreakdown || []).map((cat, idx) => {
                const color = CATEGORY_ACCENTS[cat.name] || '#0284c7';
                const sharePercent = Math.round((cat.articlesCount / totalCatArticles) * 100);

                return (
                  <div key={idx} className="aav-cat-item">
                    <div className="aav-cat-item-top">
                      <div className="aav-cat-name-box">
                        <span className="aav-cat-bullet" style={{ background: color }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="aav-cat-views-badge" style={{ color: color }}>
                        {(cat.views || 0).toLocaleString()} reads
                      </span>
                    </div>

                    <div className="aav-cat-item-sub">
                      <span>{cat.articlesCount} articles</span>
                      <span>{sharePercent}% volume</span>
                    </div>

                    <div className="aav-progress-track">
                      <div
                        className="aav-progress-bar"
                        style={{
                          width: `${Math.min(100, Math.max(5, sharePercent))}%`,
                          background: color
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
