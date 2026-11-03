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
    <div className="anv-container">
      {/* Overview Header Card */}
      <div className="anv-header-card">
        <div className="anv-header-left">
          <h2 className="anv-page-title">
            <BarChart3 size={20} color="#dc2626" />
            <span>Readership & Analytics</span>
          </h2>
          <p className="anv-page-subtitle">Real-time reader volume, catalog distribution, and content engagement.</p>
        </div>
        <div className="anv-header-actions">
          <div className="anv-live-badge">
            <span className="anv-pulse-dot" />
            <span>Live Data</span>
          </div>
          <button 
            type="button" 
            className="anv-refresh-btn" 
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
      <div className="anv-kpi-grid">
        {/* 1. Total Views */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">TOTAL READS</span>
            <div className="anv-kpi-icon-pill anv-kpi-icon-blue">
              <Eye size={15} />
            </div>
          </div>
          <div className="anv-kpi-value">
            {(metrics.totalViews || 0).toLocaleString()}
          </div>
          <div className="anv-kpi-footer">
            <span>avg ~{metrics.avgViewsPerArticle || 0} / story</span>
          </div>
        </div>

        {/* 2. Total Articles */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">ARTICLES</span>
            <div className="anv-kpi-icon-pill anv-kpi-icon-emerald">
              <FileText size={15} />
            </div>
          </div>
          <div className="anv-kpi-value">
            {metrics.totalArticles || 0}
          </div>
          <div className="anv-kpi-footer">
            <span>{metrics.publishedCount || 0} published stories</span>
          </div>
        </div>

        {/* 3. Authors */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">AUTHORS</span>
            <div className="anv-kpi-icon-pill anv-kpi-icon-purple">
              <Users size={15} />
            </div>
          </div>
          <div className="anv-kpi-value">
            {metrics.totalAuthors || 0}
          </div>
          <div className="anv-kpi-footer">
            <span>verified contributors</span>
          </div>
        </div>

        {/* 4. Real Categories */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">CATEGORIES</span>
            <div className="anv-kpi-icon-pill anv-kpi-icon-amber">
              <Layers size={15} />
            </div>
          </div>
          <div className="anv-kpi-value">
            {metrics.totalCategories || 0}
          </div>
          <div className="anv-kpi-footer">
            <span>editorial verticals</span>
          </div>
        </div>

        {/* 5. Reader Claps / Engagement */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">TOTAL ENGAGEMENT</span>
            <div className="anv-kpi-icon-pill anv-kpi-icon-rose">
              <Heart size={15} />
            </div>
          </div>
          <div className="anv-kpi-value">
            {(metrics.totalClaps || 0).toLocaleString()}
          </div>
          <div className="anv-kpi-footer">
            <span>reader claps & reactions</span>
          </div>
        </div>
      </div>

      {/* Grid: Top Articles & Categories Breakdown */}
      <div className="anv-details-grid">
        {/* Top Articles by Real Views */}
        <div className="anv-card">
          <div className="anv-card-header">
            <h3 className="anv-card-title">
              <TrendingUp size={18} color="#dc2626" />
              <span>Most Read Articles</span>
            </h3>
            <span className="anv-card-badge">
              Top 10 Readership
            </span>
          </div>

          {(data?.topArticles || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '13px', margin: '16px 0' }}>No readership data accumulated yet.</p>
          ) : (
            <div className="anv-articles-list">
              {(data?.topArticles || []).map((art, idx) => {
                const catColor = CATEGORY_ACCENTS[art.categoryName] || '#dc2626';
                const rankClass = idx === 0 ? 'anv-rank-top1' : idx === 1 ? 'anv-rank-top2' : idx === 2 ? 'anv-rank-top3' : 'anv-rank-other';
                
                return (
                  <div key={art._id || idx} className="anv-article-row">
                    <div className="anv-article-top-row">
                      <span className={`anv-rank-badge ${rankClass}`}>#{idx + 1}</span>
                      <span className="anv-views-chip">
                        <Eye size={12} />
                        {(art.views || 0).toLocaleString()}
                      </span>
                    </div>

                    <a 
                      href={`/article/${art.slug}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="anv-article-title-link"
                      title={art.title}
                    >
                      {art.title}
                    </a>

                    <div className="anv-article-meta-row">
                      <span 
                        className="anv-cat-chip"
                        style={{
                          color: catColor,
                          background: `${catColor}14`,
                          border: `1px solid ${catColor}30`
                        }}
                      >
                        {art.categoryName || 'Startups'}
                      </span>
                      <span className="anv-dot-sep">•</span>
                      <span>{art.authorName || 'Editorial Desk'}</span>
                      {art.claps > 0 && (
                        <>
                          <span className="anv-dot-sep">•</span>
                          <span className="anv-claps-chip">
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
        <div className="anv-card">
          <div className="anv-card-header">
            <h3 className="anv-card-title">
              <Layers size={18} color="#0284c7" />
              <span>Category Volume</span>
            </h3>
            <span className="anv-card-badge">
              Vertical Distribution
            </span>
          </div>

          {(data?.categoryBreakdown || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '13px', margin: '16px 0' }}>No categories available.</p>
          ) : (
            <div className="anv-cats-list">
              {(data?.categoryBreakdown || []).map((cat, idx) => {
                const color = CATEGORY_ACCENTS[cat.name] || '#0284c7';
                const sharePercent = Math.round((cat.articlesCount / totalCatArticles) * 100);

                return (
                  <div key={idx} className="anv-cat-item">
                    <div className="anv-cat-item-top">
                      <div className="anv-cat-name-box">
                        <span className="anv-cat-bullet" style={{ background: color }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="anv-cat-views-badge" style={{ color: color }}>
                        {(cat.views || 0).toLocaleString()} reads
                      </span>
                    </div>

                    <div className="anv-cat-item-sub">
                      <span>{cat.articlesCount} articles</span>
                      <span>{sharePercent}% volume</span>
                    </div>

                    <div className="anv-progress-track">
                      <div
                        className="anv-progress-bar"
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
