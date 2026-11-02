import React, { useState, useEffect } from 'react';
import { 
  Send, Mail, Building, Link, DollarSign, CheckCircle, Clock, 
  Trash2, Search, Filter, RefreshCw, ExternalLink, Sparkles, BookOpen, 
  ArrowUpRight, AlertCircle, FileText, Phone, User, Film, Play
} from 'lucide-react';
import { SubmissionService } from '../../services/submissionService';

export default function AdminSubmissionsView({ onShowToast, onNavigate }) {
  const [submissions, setSubmissions] = useState([]);
  const [metrics, setMetrics] = useState({ totalPitches: 0, totalContacts: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'pitch' | 'contact'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'reviewing' | 'published' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, [typeFilter, statusFilter]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await SubmissionService.getAdminSubmissions({
        type: typeFilter,
        status: statusFilter,
        search: searchQuery
      });
      if (res && res.data) {
        setSubmissions(res.data);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadSubmissions();
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    setActionId(id);
    try {
      await SubmissionService.updateSubmission(id, { status: nextStatus });
      setSubmissions(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, status: nextStatus } : s));
      onShowToast?.(`Status updated to ${nextStatus}`);
      loadSubmissions();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const handleConvertToArticle = async (id, pitchFormat) => {
    setActionId(id);
    try {
      const res = await SubmissionService.convertToArticle(id);
      const isVideo = pitchFormat === 'video';
      onShowToast?.(res.message || (isVideo ? 'Video Story approved & published live!' : 'Pitch successfully published as article!'));
      await loadSubmissions();

      if (res.article?._id && onNavigate) {
        setTimeout(() => {
          onNavigate('/admin/articles');
        }, 1200);
      } else if (res.video?._id && onNavigate) {
        setTimeout(() => {
          onNavigate('/admin/videos');
        }, 1200);
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to publish story');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission permanently from database?')) return;
    setActionId(id);
    try {
      await SubmissionService.deleteSubmission(id);
      setSubmissions(prev => prev.filter(s => s._id !== id && s.id !== id));
      onShowToast?.('Submission deleted from database.');
      loadSubmissions();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to delete');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="admin-posts-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Startup Pitches &amp; Inbound Leads
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Review authored story pitches, pitch deck submissions from tech founders, and partner inquiries.
          </p>
        </div>
        <button 
          className="admin-btn-secondary" 
          onClick={loadSubmissions} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} className={loading ? 'spin-anim' : ''} />
          <span>Refresh Submissions</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="adv-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Story &amp; Startup Pitches</span>
            <div className="adv-stat-number">{metrics.totalPitches}</div>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Contact Inquiries</span>
            <div className="adv-stat-number">{metrics.totalContacts}</div>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Pending Action</span>
            <div className="adv-stat-number">{metrics.pendingCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="adv-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Submissions' },
            { id: 'pitch', label: 'Startup & Story Pitches' },
            { id: 'contact', label: 'Contact Messages' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`adv-tab-btn ${typeFilter === tab.id ? 'active' : ''}`}
              onClick={() => setTypeFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}

          <span style={{ borderRight: '1px solid var(--border-light)', margin: '0 4px' }} />

          {[
            { id: 'all', label: 'All Status' },
            { id: 'pending', label: 'Pending' },
            { id: 'reviewing', label: 'Reviewing' },
            { id: 'published', label: 'Published' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`adv-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
              style={{ fontSize: '0.8rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', minWidth: '260px' }}>
          <div className="adv-search-box" style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search startup, author, headline..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px' }}
            />
          </div>
          <button type="submit" className="admin-btn-secondary" style={{ height: '38px' }}>Search</button>
        </form>
      </div>

      {/* Submissions Feed */}
      {loading ? (
        <div className="admin-loading-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 12px' }} />
          <p>Loading submissions from database...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="admin-empty-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
          <Send size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, fontWeight: 700 }}>No submissions found</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No story pitches or contact leads matched your criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submissions.map((sub) => {
            const subId = sub._id || sub.id;
            const isPitch = sub.type === 'pitch';
            const isVideo = sub.pitchFormat === 'video';
            const isArticlePitch = sub.pitchFormat === 'article';
            const isBusy = actionId === subId;

            // Icon & Badges
            let iconBox = <Building size={18} />;
            let iconBg = 'rgba(220, 38, 38, 0.1)';
            let iconColor = '#dc2626';
            let badgeText = 'Startup Pitch';
            let badgeBg = '#fff1f2';
            let badgeColor = '#dc2626';

            if (!isPitch) {
              iconBox = <Mail size={18} />;
              iconBg = 'rgba(14, 165, 233, 0.1)';
              iconColor = '#0284c7';
              badgeText = 'Contact Lead';
              badgeBg = '#f0f9ff';
              badgeColor = '#0284c7';
            } else if (isVideo) {
              iconBox = <Film size={18} />;
              iconBg = 'rgba(147, 51, 234, 0.1)';
              iconColor = '#9333ea';
              badgeText = '🎬 Video Story Pitch';
              badgeBg = '#faf5ff';
              badgeColor = '#9333ea';
            } else if (isArticlePitch) {
              iconBox = <FileText size={18} />;
              iconBg = 'rgba(220, 38, 38, 0.1)';
              iconColor = '#dc2626';
              badgeText = '✍️ Article Story Pitch';
              badgeBg = '#fff1f2';
              badgeColor = '#dc2626';
            }

            const authorOrFounder = sub.founderName || sub.authorName || sub.name || 'Contributing Author';
            const role = sub.founderRole || (isVideo ? 'Video Creator' : 'Author / Contributor');
            const headlineTitle = sub.headline || sub.title || sub.startupName || 'Untitled Pitch';

            return (
              <div 
                key={subId}
                style={{
                  background: 'var(--bg-card, #fff)',
                  border: '1px solid var(--border-light, #e2e8f0)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: iconBg,
                        color: iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {iconBox}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                          {isPitch ? (sub.startupName || headlineTitle) : (sub.subject || 'Inquiry')}
                        </h4>
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background: badgeBg,
                            color: badgeColor
                          }}
                        >
                          {badgeText}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span>From: <strong>{authorOrFounder}</strong> ({role})</span>
                        {(sub.email || sub.authorEmail || sub.phone) && (
                          <span>Contact: {[sub.email || sub.authorEmail, sub.phone].filter(Boolean).join(' · ')}</span>
                        )}
                        <span>Received {new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div>
                    <span 
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: sub.status === 'published' ? 'rgba(16, 185, 129, 0.12)' : (sub.status === 'reviewing' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
                        color: sub.status === 'published' ? '#059669' : (sub.status === 'reviewing' ? '#2563eb' : '#d97706')
                      }}
                    >
                      {sub.status || 'pending'}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                {isPitch ? (
                  <div style={{ 
                    background: '#f8fafc', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    border: '1px solid #edf2f7', 
                    display: 'flex', 
                    gap: '14px', 
                    alignItems: 'flex-start',
                    flexWrap: 'wrap'
                  }}>
                    {/* Optional Thumbnail */}
                    {(sub.coverImage || sub.image) && (
                      <div style={{ width: '120px', height: '75px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0', background: '#000' }}>
                        <img 
                          src={sub.coverImage || sub.image} 
                          alt="Pitch Cover" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        "{sub.headline || headlineTitle}"
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {sub.summary}
                      </div>
                      {sub.details && (
                        <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px', whiteSpace: 'pre-line' }}>
                          {sub.details}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.8rem', flexWrap: 'wrap', color: '#64748b' }}>
                        {sub.sector && <span>Category / Sector: <strong>{sub.sector}</strong></span>}
                        {sub.stage && <span>Status: <strong>{sub.stage}</strong></span>}
                        {sub.metricMoat && <span>Traction: <strong style={{ color: '#059669' }}>{sub.metricMoat}</strong></span>}
                        {sub.videoUrl && (
                          <a href={sub.videoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#9333ea', fontWeight: 600 }}>
                            <Play size={12} /> <span>Watch Video</span> <ExternalLink size={12} />
                          </a>
                        )}
                        {sub.website && (
                          <a href={sub.website} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--brand-primary)' }}>
                            <span>Website</span> <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                    "{sub.message}"
                  </div>
                )}

                {/* Actions Bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-light, #f1f5f9)', paddingTop: '0.75rem' }}>
                  {isPitch && sub.status === 'published' && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '5px', marginRight: 'auto' }}>
                      <CheckCircle size={15} /> Published Live on GoReadPost
                    </span>
                  )}

                  {isPitch && sub.status !== 'published' && (
                    <button
                      className="admin-btn-primary"
                      style={{ height: '32px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                      disabled={isBusy}
                      onClick={() => handleConvertToArticle(subId, sub.pitchFormat)}
                    >
                      <Sparkles size={14} />
                      {isVideo ? 'Approve & Publish Video' : 'Approve & Publish Article'}
                    </button>
                  )}

                  {sub.status !== 'reviewing' && sub.status !== 'published' && (
                    <button
                      className="admin-btn-secondary"
                      style={{ height: '32px', fontSize: '0.8rem' }}
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(subId, 'reviewing')}
                    >
                      Mark In Review
                    </button>
                  )}

                  <button
                    className="admin-btn-secondary"
                    style={{ height: '32px', fontSize: '0.8rem', color: '#64748b' }}
                    disabled={isBusy}
                    onClick={() => handleDelete(subId)}
                  >
                    <Trash2 size={14} style={{ marginRight: '4px' }} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
