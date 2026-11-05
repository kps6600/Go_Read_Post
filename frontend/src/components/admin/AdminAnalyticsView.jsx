import React, { useState, useEffect } from 'react';
import { 
  Eye, AlertCircle, Layers, Heart, TrendingUp
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

const formatK = (num) => {
  if (!num || num <= 0) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
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
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="anv-kpi-grid">
        {/* 1. Total Views */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">TOTAL READS</span>
          </div>
          <div className="anv-kpi-value">
            {(metrics.totalViews || 0).toLocaleString()}
          </div>
        </div>

        {/* 2. Total Articles */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">ARTICLES</span>
          </div>
          <div className="anv-kpi-value">
            {metrics.totalArticles || 0}
          </div>
        </div>

        {/* 3. Authors */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">AUTHORS</span>
          </div>
          <div className="anv-kpi-value">
            {metrics.totalAuthors || 0}
          </div>
        </div>

        {/* 4. Real Categories */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">CATEGORIES</span>
          </div>
          <div className="anv-kpi-value">
            {metrics.totalCategories || 0}
          </div>
        </div>

        {/* 5. Reader Claps / Engagement */}
        <div className="anv-kpi-card">
          <div className="anv-kpi-top">
            <span className="anv-kpi-label">TOTAL ENGAGEMENT</span>
          </div>
          <div className="anv-kpi-value">
            {(metrics.totalClaps || 0).toLocaleString()}
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
                    <div className="anv-article-main">
                      <span className={`anv-rank-badge ${rankClass}`}>#{idx + 1}</span>
                      <a 
                        href={`/article/${art.slug}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="anv-article-title-link"
                        title={art.title}
                      >
                        {art.title}
                      </a>
                    </div>

                    <div className="anv-article-footer-row">
                      <div className="anv-article-meta-left">
                        <span 
                          className="anv-cat-chip"
                          style={{
                            color: catColor
                          }}
                        >
                          {art.categoryName || 'Startups'}
                        </span>
                        <span className="anv-author-name">{art.authorName || 'Editorial Desk'}</span>
                        {art.claps > 0 && (
                          <span className="anv-claps-chip">
                            <Heart size={10} color="#e11d48" fill="#e11d48" />
                            <span>{formatK(art.claps)}</span>
                          </span>
                        )}
                      </div>

                      <div className="anv-article-views-right">
                        <Eye size={12} />
                        <span>{formatK(art.views || 0)}</span>
                      </div>
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
                        {formatK(cat.views || 0)} reads
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
