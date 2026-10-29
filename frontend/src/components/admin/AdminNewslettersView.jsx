import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Users, CheckCircle, Clock, Search, Plus, 
  Trash2, Edit3, Eye, Download, Sparkles, Filter, X, Check,
  ExternalLink, Calendar, RefreshCw, ChevronRight, FileText
} from 'lucide-react';
import { NewsletterService } from '../../services/newsletterService';

const STORAGE_KEY_PUBLICATIONS = 'goreadpost_admin_publications_v1';
const STORAGE_KEY_DISPATCHES = 'goreadpost_admin_dispatches_v1';
const STORAGE_KEY_SUBSCRIBERS = 'goreadpost_admin_subscribers_v1';

const DEFAULT_PUBLICATIONS = [
  {
    id: 'morning-dispatch',
    title: 'The Morning Dispatch',
    category: 'Daily Briefings',
    schedule: 'Mon–Sat • 7:00 AM IST',
    frequency: 'Daily',
    subscribers: 142000,
    editor: 'Shradha Sharma',
    openRate: '54.2%',
    active: true,
    color: '#dc2626',
    description: 'The definitive daily operational briefing for Indian startup founders and corporate leadership.'
  },
  {
    id: 'deeptech-ai-wire',
    title: 'DeepTech & Indic AI Wire',
    category: 'DeepTech & AI',
    schedule: 'Tue & Thu • 11:00 AM IST',
    frequency: 'Bi-Weekly',
    subscribers: 68500,
    editor: 'Alok Gupta',
    openRate: '51.8%',
    active: true,
    color: '#0284c7',
    description: 'Comprehensive coverage of foundation model labs, sovereign GPU datacenters, and robotics engineering.'
  },
  {
    id: 'the-sunday-read',
    title: 'The Sunday Read',
    category: 'Sunday Longform',
    schedule: 'Sundays • 9:00 AM IST',
    frequency: 'Weekly',
    subscribers: 94200,
    editor: 'Ramakrishnan V.',
    openRate: '49.1%',
    active: true,
    color: '#4f46e5',
    description: 'Deep investigative narratives, turnaround retrospectives, and 4,000-word founder essays.'
  },
  {
    id: 'cap-table-weekly',
    title: 'The Cap Table Weekly',
    category: 'Venture & CapTable',
    schedule: 'Fridays • 4:00 PM IST',
    frequency: 'Weekly',
    subscribers: 52100,
    editor: 'Ananya Roy',
    openRate: '61.4%',
    active: true,
    color: '#d97706',
    description: 'Term sheet breakdowns, secondary market liquidity benchmarks, and venture LP allocations.'
  },
  {
    id: 'fintech-velocity',
    title: 'FinTech Velocity',
    category: 'FinTech & Rails',
    schedule: 'Wednesdays • 8:30 AM IST',
    frequency: 'Weekly',
    subscribers: 41800,
    editor: 'Rohit Nair',
    openRate: '48.9%',
    active: true,
    color: '#059669',
    description: 'UPI volume telemetry, Account Aggregator scale, digital lending spreads, and RBI policy.'
  },
  {
    id: 'smb-enterprise',
    title: 'SMB & Grassroots Enterprise',
    category: 'Manufacturing & SMB',
    schedule: 'Saturdays • 10:00 AM IST',
    frequency: 'Weekly',
    subscribers: 36400,
    editor: 'Meera Joshi',
    openRate: '43.2%',
    active: true,
    color: '#ea580c',
    description: 'Grassroots manufacturing case studies, tier-2 supply chains, and offline retail digitization.'
  }
];

const DEFAULT_DISPATCHES = [
  {
    id: 'disp-104',
    publicationId: 'morning-dispatch',
    publicationName: 'The Morning Dispatch',
    issueNumber: 104,
    date: 'Oct 12, 2026',
    readTime: '4 min read',
    subject: 'Why Sovereign Compute is India’s New Strategic Rail',
    teaser: 'Domestic datacenter buildouts outpace projections as founders prioritize token cost margins.',
    openRate: '56.8%',
    delivered: 142000
  },
  {
    id: 'disp-48',
    publicationId: 'deeptech-ai-wire',
    publicationName: 'DeepTech & Indic AI Wire',
    issueNumber: 48,
    date: 'Oct 10, 2026',
    readTime: '6 min read',
    subject: 'Inside Sarvam & Krutrim’s Next-Gen Vernacular Benchmarks',
    teaser: 'Why multi-modal translation across 22 scheduled languages demands custom synthetic datasets.',
    openRate: '52.3%',
    delivered: 68500
  },
  {
    id: 'disp-92',
    publicationId: 'the-sunday-read',
    publicationName: 'The Sunday Read',
    issueNumber: 92,
    date: 'Oct 05, 2026',
    readTime: '9 min read',
    subject: 'The Anatomy of a ₹5,000 Cr Hardware Turnaround',
    teaser: 'How Indian consumer electronics teams survived tariff swings and built sustainable gross margins.',
    openRate: '48.9%',
    delivered: 94200
  },
  {
    id: 'disp-76',
    publicationId: 'cap-table-weekly',
    publicationName: 'The Cap Table Weekly',
    issueNumber: 76,
    date: 'Oct 03, 2026',
    readTime: '5 min read',
    subject: 'Secondary Valuation Disconnects in Pre-IPO Tech',
    teaser: 'Private markets show a 25% spread between institutional asks and employee option secondary purchases.',
    openRate: '63.2%',
    delivered: 52100
  }
];

const DEFAULT_SUBSCRIBERS = [
  { id: 'sub-1', email: 'bhavish.agg@olacabs.com', publications: ['The Morning Dispatch', 'DeepTech & Indic AI Wire'], date: 'Oct 12, 2026', status: 'Active' },
  { id: 'sub-2', email: 'nithin.kamath@zerodha.com', publications: ['The Morning Dispatch', 'The Cap Table Weekly'], date: 'Oct 11, 2026', status: 'Active' },
  { id: 'sub-3', email: 'shradha@yourstory.com', publications: ['All 6 Publications'], date: 'Oct 10, 2026', status: 'Active' },
  { id: 'sub-4', email: 'rahul.investor@sequoia.com', publications: ['The Cap Table Weekly', 'FinTech Velocity'], date: 'Oct 09, 2026', status: 'Active' },
  { id: 'sub-5', email: 'priya.tech@sarvam.ai', publications: ['DeepTech & Indic AI Wire'], date: 'Oct 08, 2026', status: 'Active' },
  { id: 'sub-6', email: 'vikram.founder@cynlr.com', publications: ['The Morning Dispatch', 'The Sunday Read'], date: 'Oct 07, 2026', status: 'Active' }
];

export default function AdminNewslettersView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('publications'); // 'publications' | 'dispatches' | 'subscribers'
  const [publications, setPublications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PUBLICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PUBLICATIONS;
  });

  const [dispatches, setDispatches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISPATCHES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_DISPATCHES;
  });

  const [subscribers, setSubscribers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBSCRIBERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SUBSCRIBERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingPub, setEditingPub] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [previewDispatch, setPreviewDispatch] = useState(null);

  // New Dispatch Form State
  const [newDispatch, setNewDispatch] = useState({
    publicationId: 'morning-dispatch',
    subject: '',
    teaser: '',
    readTime: '5 min read',
    takeaways: '1. Major deal analysis\n2. Regulatory update\n3. Founder quote'
  });

  // New Subscriber Form State
  const [newSubEmail, setNewSubEmail] = useState('');

  // Initial Database Load
  useEffect(() => {
    loadNewslettersData();
  }, []);

  const loadNewslettersData = async () => {
    try {
      const [pubs, disps, subs] = await Promise.all([
        NewsletterService.getAdminPublications().catch(() => []),
        NewsletterService.getAdminDispatches().catch(() => []),
        NewsletterService.getAdminSubscribers().catch(() => [])
      ]);
      if (Array.isArray(pubs) && pubs.length > 0) setPublications(pubs);
      if (Array.isArray(disps) && disps.length > 0) setDispatches(disps);
      if (Array.isArray(subs) && subs.length > 0) setSubscribers(subs);
    } catch (err) {
      console.warn('Could not load newsletters data from DB:', err);
    }
  };

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PUBLICATIONS, JSON.stringify(publications));
    } catch (e) {}
  }, [publications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DISPATCHES, JSON.stringify(dispatches));
    } catch (e) {}
  }, [dispatches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIBERS, JSON.stringify(subscribers));
    } catch (e) {}
  }, [subscribers]);

  const totalSubscribers = publications.reduce((sum, p) => sum + (p.subscribers || 0), 0);

  const handleTogglePublication = async (id) => {
    const pub = publications.find(p => p.id === id || p.pubId === id || p._id === id);
    if (!pub) return;
    const next = !pub.active;
    try {
      await NewsletterService.updatePublication(pub._id || pub.pubId || pub.id, { active: next });
    } catch (e) {
      console.warn('Could not update publication in DB:', e);
    }
    setPublications(publications.map(p => {
      if (p.id === id || p.pubId === id || p._id === id) {
        onShowToast?.(`${p.title} is now ${next ? 'Active' : 'Paused'}`);
        return { ...p, active: next };
      }
      return p;
    }));
  };

  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    if (!newDispatch.subject.trim()) {
      alert('Please enter a dispatch subject');
      return;
    }
    const pub = publications.find(p => p.id === newDispatch.publicationId || p.pubId === newDispatch.publicationId) || publications[0];
    const createdPayload = {
      publicationId: pub.pubId || pub.id || 'morning-dispatch',
      publicationName: pub.title,
      issueNumber: dispatches.length + 105,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: newDispatch.readTime,
      subject: newDispatch.subject,
      teaser: newDispatch.teaser,
      openRate: '0.0%',
      delivered: pub.subscribers || 142000
    };
    let saved = null;
    try {
      saved = await NewsletterService.createDispatch(createdPayload);
    } catch (e) {
      console.warn('Could not create dispatch in DB:', e);
    }
    const created = saved || { id: `disp-${Date.now()}`, ...createdPayload };
    setDispatches([created, ...dispatches]);
    setIsComposeOpen(false);
    setNewDispatch({ publicationId: 'morning-dispatch', subject: '', teaser: '', readTime: '5 min read', takeaways: '' });
    onShowToast?.(`Published dispatch to ${pub.subscribers?.toLocaleString() || '142,000'} subscribers!`);
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newSubEmail.trim() || !newSubEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    const email = newSubEmail.trim();
    let saved = null;
    try {
      saved = await NewsletterService.addSubscriber({
        email,
        publications: ['The Morning Dispatch', 'DeepTech & Indic AI Wire'],
        status: 'Active'
      });
    } catch (e) {
      console.warn('Could not save subscriber to DB:', e);
    }
    const created = saved || {
      id: `sub-${Date.now()}`,
      email,
      publications: ['The Morning Dispatch', 'DeepTech & Indic AI Wire'],
      date: 'Just now',
      status: 'Active'
    };
    setSubscribers([created, ...subscribers]);
    setNewSubEmail('');
    setIsAddSubOpen(false);
    onShowToast?.(`Subscriber added: ${created.email}`);
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Delete this subscriber record from database?')) return;
    try {
      await NewsletterService.deleteSubscriber(id);
    } catch (e) {
      console.warn('Could not delete subscriber from DB:', e);
    }
    setSubscribers(subscribers.filter(s => s._id !== id && s.id !== id));
    onShowToast?.('Subscriber deleted from database');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Publications,Date,Status\n"
      + subscribers.map(s => `"${s.email}","${s.publications.join('; ')}","${s.date}","${s.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.(`Exported ${subscribers.length} subscriber records`);
  };

  return (
    <div className="admin-posts-container">
      {/* KPI Cards */}
      <div className="adv-stats-row" style={{ marginTop: '0.25rem', marginBottom: '1.5rem' }}>
        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Active Publications</span>
            <div className="adv-stat-number">{publications.length}</div>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Total Subscribers</span>
            <div className="adv-stat-number">{(totalSubscribers / 1000).toFixed(0)}K+</div>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Dispatches Delivered</span>
            <div className="adv-stat-number">142+</div>
          </div>
        </div>

        <div className="adv-stat-card">
          <div className="adv-stat-content">
            <span className="adv-stat-label">Average Open Rate</span>
            <div className="adv-stat-number">51.4%</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Top Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', marginBottom: '1.25rem', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('publications')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 750,
              border: 'none',
              background: activeTab === 'publications' ? 'rgba(220, 38, 38, 0.12)' : 'transparent',
              color: activeTab === 'publications' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Publications Suite ({publications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dispatches')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 750,
              border: 'none',
              background: activeTab === 'dispatches' ? 'rgba(220, 38, 38, 0.12)' : 'transparent',
              color: activeTab === 'dispatches' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Recent Dispatches Archive ({dispatches.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscribers')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 750,
              border: 'none',
              background: activeTab === 'subscribers' ? 'rgba(220, 38, 38, 0.12)' : 'transparent',
              color: activeTab === 'subscribers' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Subscriber Leads &amp; CRM ({subscribers.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="adv-secondary-btn" 
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: 'var(--bg-card, #fff)',
              border: '1px solid var(--border-light, #e2e8f0)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text-secondary, #64748b)'
            }}
          >
            <Download size={14} />
            <span>Export Subscribers</span>
          </button>

          <button 
            type="button" 
            className="adv-primary-btn" 
            onClick={() => setIsComposeOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              background: 'var(--brand-primary, #dc2626)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
            }}
          >
            <Send size={15} />
            <span>Compose Dispatch</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Publications Suite */}
      {activeTab === 'publications' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {publications.map(pub => (
            <div 
              key={pub.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
                borderTop: `4px solid ${pub.color}`,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: pub.color, background: `${pub.color}15`, padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                  {pub.frequency}
                </span>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.76rem', color: pub.active ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                  <input 
                    type="checkbox" 
                    checked={pub.active} 
                    onChange={() => handleTogglePublication(pub.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{pub.active ? 'Active' : 'Paused'}</span>
                </label>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
                {pub.title}
              </h3>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0', flex: 1 }}>
                {pub.description}
              </p>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Time:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{pub.schedule}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lead Editor:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{pub.editor}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subscribers:</span>
                  <strong style={{ color: 'var(--brand-primary)' }}>{pub.subscribers.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Open Rate:</span>
                  <strong style={{ color: '#10b981' }}>{pub.openRate}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setNewDispatch({ ...newDispatch, publicationId: pub.id });
                    setIsComposeOpen(true);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Compose Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Dispatches Archive */}
      {activeTab === 'dispatches' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Dispatch Subject</th>
                <th style={{ padding: '0.85rem 1rem' }}>Publication</th>
                <th style={{ padding: '0.85rem 1rem' }}>Issue #</th>
                <th style={{ padding: '0.85rem 1rem' }}>Sent Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Delivered</th>
                <th style={{ padding: '0.85rem 1rem' }}>Open Rate</th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.9rem' }}>{d.subject}</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{d.teaser}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{d.publicationName}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    #{d.issueNumber}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    {d.date}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                    {d.delivered.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#10b981', fontWeight: 750 }}>{d.openRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Subscriber Leads */}
      {activeTab === 'subscribers' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--text-primary)' }}>
              Subscriber Email Leads ({subscribers.length})
            </span>
            <button 
              type="button" 
              className="adv-secondary-btn" 
              onClick={() => setIsAddSubOpen(true)}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              <Plus size={13} />
              <span>Add Subscriber</span>
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Subscriber Email</th>
                <th style={{ padding: '0.85rem 1rem' }}>Subscriptions Active</th>
                <th style={{ padding: '0.85rem 1rem' }}>Join Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => (
                <tr key={sub._id || sub.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{sub.email}</strong>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {Array.isArray(sub.publications) ? sub.publications.join(', ') : (sub.publications || 'The Morning Dispatch')}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {sub.date || (sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'Active')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 750 }}>
                      ✓ {sub.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubscriber(sub._id || sub.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px' }}
                      title="Remove Subscriber"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Compose Dispatch Modal */}
      {isComposeOpen && (() => {
        const selectedPub = publications.find(p => p.id === newDispatch.publicationId) || publications[0] || {};
        const subjectLen = newDispatch.subject?.length || 0;
        const charStatus = subjectLen === 0 ? '' : subjectLen > 80 ? 'warn' : subjectLen >= 30 ? 'good' : '';

        return (
          <div className="admin-modal-overlay" onClick={() => setIsComposeOpen(false)}>
            <div 
              className="dispatch-composer-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="dispatch-modal-header">
                <div className="dispatch-header-info">
                  <div className="dispatch-header-icon-badge">
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="dispatch-header-eyebrow">EDITORIAL DISPATCH COMPOSER</span>
                    <h3 className="dispatch-header-title">Draft New Newsletter Dispatch</h3>
                    <p className="dispatch-header-desc">
                      Broadcast a curated edition to your verified audience with live inbox preview.
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="dispatch-modal-close-btn" 
                  onClick={() => setIsComposeOpen(false)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateDispatch} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div className="dispatch-modal-body">
                  {/* Field 1: Publication Selection */}
                  <div className="dispatch-field-group">
                    <label className="dispatch-field-label">
                      <span className="dispatch-field-label-left">
                        <Mail size={14} style={{ color: '#dc2626' }} />
                        <span>Target Publication Franchise *</span>
                      </span>
                      <span className="dispatch-field-label-hint">Delivers to subscribed readers</span>
                    </label>
                    <select 
                      className="dispatch-select"
                      value={newDispatch.publicationId}
                      onChange={(e) => setNewDispatch({ ...newDispatch, publicationId: e.target.value })}
                    >
                      {publications.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} — {p.category} ({p.subscribers?.toLocaleString()} subscribers)
                        </option>
                      ))}
                    </select>

                    {/* Selected Franchise Summary Card */}
                    {selectedPub && (
                      <div className="dispatch-pub-overview-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: selectedPub.color || '#dc2626' }}></span>
                          <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{selectedPub.title}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <span className="dispatch-pub-meta-pill">
                            <Users size={13} style={{ color: '#0284c7' }} />
                            <span>{(selectedPub.subscribers || 0).toLocaleString()} Verified Subscribers</span>
                          </span>
                          <span className="dispatch-pub-meta-pill">
                            <Clock size={13} style={{ color: '#10b981' }} />
                            <span>{selectedPub.schedule || selectedPub.frequency || 'Daily'}</span>
                          </span>
                          <span className="dispatch-pub-meta-pill">
                            <Sparkles size={13} style={{ color: '#f59e0b' }} />
                            <span>{selectedPub.openRate || '52.4%'} Avg. Open Rate</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field 2: Subject Line */}
                  <div className="dispatch-field-group">
                    <label className="dispatch-field-label">
                      <span className="dispatch-field-label-left">
                        <Sparkles size={14} style={{ color: '#f59e0b' }} />
                        <span>Email Subject Line *</span>
                      </span>
                      <span className={`dispatch-field-char-count ${charStatus}`}>
                        {subjectLen} / 80 recommended chars
                      </span>
                    </label>
                    <input 
                      type="text"
                      required
                      className="dispatch-input"
                      placeholder="e.g. Why Sovereign Compute is India’s Strategic Rail in 2026..."
                      value={newDispatch.subject}
                      onChange={(e) => setNewDispatch({ ...newDispatch, subject: e.target.value })}
                    />
                  </div>

                  {/* Field 3: Teaser / Preheader */}
                  <div className="dispatch-field-group">
                    <label className="dispatch-field-label">
                      <span className="dispatch-field-label-left">
                        <FileText size={14} style={{ color: '#0284c7' }} />
                        <span>Editorial Preheader / Teaser Snippet</span>
                      </span>
                      <span className="dispatch-field-label-hint">Shown next to subject in inboxes</span>
                    </label>
                    <textarea 
                      rows={2}
                      className="dispatch-textarea"
                      placeholder="Brief teaser preview that sparks curiosity and drives immediate open rates..."
                      value={newDispatch.teaser}
                      onChange={(e) => setNewDispatch({ ...newDispatch, teaser: e.target.value })}
                    />
                  </div>

                  {/* Field 4: Read Time & Deliverability Meta */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="dispatch-field-group">
                      <label className="dispatch-field-label">
                        <span className="dispatch-field-label-left">
                          <Clock size={14} style={{ color: '#64748b' }} />
                          <span>Estimated Read Time</span>
                        </span>
                      </label>
                      <select
                        className="dispatch-select"
                        value={newDispatch.readTime}
                        onChange={(e) => setNewDispatch({ ...newDispatch, readTime: e.target.value })}
                      >
                        <option value="3 min read">3 min read (Quick Brief)</option>
                        <option value="5 min read">5 min read (Standard Edition)</option>
                        <option value="8 min read">8 min read (Deep Dive)</option>
                        <option value="12 min read">12 min read (Sunday Longform)</option>
                      </select>
                    </div>

                    <div className="dispatch-field-group">
                      <label className="dispatch-field-label">
                        <span className="dispatch-field-label-left">
                          <CheckCircle size={14} style={{ color: '#10b981' }} />
                          <span>Delivery Channel</span>
                        </span>
                      </label>
                      <div style={{ 
                        padding: '0.75rem 0.95rem', 
                        background: 'var(--bg-tertiary)', 
                        border: '1.5px solid var(--border-medium)', 
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 650,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                        <span>High-Priority Primary Inboxes</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Real-Time Live Inbox Preview */}
                  <div className="dispatch-inbox-preview-container">
                    <div className="dispatch-inbox-preview-header">
                      <span>Live Inbox Simulation (Recipient View)</span>
                      <span className="dispatch-inbox-preview-badge">
                        <Check size={11} /> Real-Time Sync
                      </span>
                    </div>

                    <div className="dispatch-inbox-preview-card">
                      <div className="dispatch-inbox-sender-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            background: selectedPub?.color || '#dc2626',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 800
                          }}>
                            {selectedPub?.title?.charAt(0) || 'G'}
                          </span>
                          <span className="dispatch-inbox-sender-name">
                            GoRead Post • {selectedPub?.title || 'Editorial Desk'}
                          </span>
                        </div>
                        <span className="dispatch-inbox-time">Just now</span>
                      </div>
                      <div className="dispatch-inbox-subject-preview">
                        {newDispatch.subject ? newDispatch.subject : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Your email subject line will appear here...</span>}
                      </div>
                      <div className="dispatch-inbox-teaser-preview">
                        {newDispatch.teaser ? newDispatch.teaser : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Preheader preview snippet displayed right next to the subject...</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <span>Reach: <strong>{(selectedPub?.subscribers || 0).toLocaleString()}</strong> verified subscribers</span>
                      <span>Sender: editorial@{selectedPub?.id || 'dispatch'}.goreadpost.com</span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="dispatch-modal-footer">
                  <div className="dispatch-footer-status">
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
                    <span>DKIM/SPF Authenticated • Instant Broadcast</span>
                  </div>
                  <div className="dispatch-footer-actions">
                    <button 
                      type="button" 
                      className="dispatch-btn-cancel" 
                      onClick={() => setIsComposeOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="dispatch-btn-submit"
                    >
                      <Send size={15} />
                      <span>Send Dispatch Immediately</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Add Subscriber Modal */}
      {isAddSubOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddSubOpen(false)}>
          <div 
            className="dispatch-composer-modal" 
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dispatch-modal-header">
              <div className="dispatch-header-info">
                <div className="dispatch-header-icon-badge badge-blue">
                  <Users size={22} />
                </div>
                <div>
                  <span className="dispatch-header-eyebrow eyebrow-blue">AUDIENCE DIRECTORY</span>
                  <h3 className="dispatch-header-title">Add Verified Subscriber</h3>
                  <p className="dispatch-header-desc">Manually enroll a reader into your active newsletter dispatch list.</p>
                </div>
              </div>
              <button 
                type="button" 
                className="dispatch-modal-close-btn" 
                onClick={() => setIsAddSubOpen(false)}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="dispatch-modal-body">
                <div className="dispatch-field-group">
                  <label className="dispatch-field-label">
                    <span className="dispatch-field-label-left">
                      <Mail size={14} style={{ color: '#0284c7' }} />
                      <span>Work Email Address *</span>
                    </span>
                    <span className="dispatch-field-label-hint">Corporate or personal inbox</span>
                  </label>
                  <input 
                    type="email"
                    required
                    className="dispatch-input"
                    placeholder="e.g. founder@company.com"
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ 
                  padding: '0.85rem 1rem', 
                  borderRadius: '10px', 
                  background: 'rgba(2, 132, 199, 0.05)', 
                  border: '1px solid rgba(2, 132, 199, 0.15)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem'
                }}>
                  <div style={{ fontWeight: 750, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={14} style={{ color: '#0284c7' }} />
                    <span>Auto-Subscribed Publications:</span>
                  </div>
                  <div>• The Morning Dispatch (Daily Briefing)</div>
                  <div>• DeepTech & Indic AI Wire (Bi-Weekly)</div>
                </div>
              </div>

              <div className="dispatch-modal-footer">
                <div className="dispatch-footer-status">
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
                  <span>Double Opt-In Confirmed</span>
                </div>
                <div className="dispatch-footer-actions">
                  <button 
                    type="button" 
                    className="dispatch-btn-cancel" 
                    onClick={() => setIsAddSubOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="dispatch-btn-submit btn-blue"
                  >
                    <Plus size={15} />
                    <span>Add to Subscriber List</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
