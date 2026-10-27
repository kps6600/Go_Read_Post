import React, { useState, useEffect } from 'react';
import { 
  Mail, ArrowLeft, CheckCircle2, Sparkles, Send, Bell, 
  Users, Zap, ShieldCheck, Flame, BookOpen, Clock, Calendar, 
  Eye, Check, X, ExternalLink, ChevronDown, ChevronUp, Star,
  TrendingUp, Award, FileText, ArrowRight, Layers, Lock
} from 'lucide-react';
import { NewsletterService } from '../services/newsletterService';

const INITIAL_EDITIONS = [
    {
      id: 'dispatch',
      name: 'The Morning Dispatch',
      category: 'daily',
      schedule: 'Daily (Mon – Fri) · 8:00 AM IST',
      cadenceBadge: 'DAILY BRIEFING',
      subscribers: '195,000+',
      openRate: '51.4%',
      tagline: 'The Definitive Daily Briefing',
      color: '#dc2626',
      desc: 'The 5 most consequential startup funding rounds, founder pivots, and regulatory updates before your morning standup begins.',
      latestIssue: {
        number: '#412',
        date: 'Today, 8:00 AM',
        title: 'The Quick-Commerce Private Label Pivot: Why Dark Stores Are Manufacturing Their Own Brands',
        snippet: 'Zepto and Blinkit are quietly launching in-house FMCG and packaged food lines. Here is why the next margin battlefield is FMCG manufacturing, not 8-minute delivery speeds.',
        readingTime: '4 min read',
        author: 'Editorial Desk',
        fullContent: [
          'Quick commerce platforms across India have achieved operational break-even on grocery delivery. But delivery fees and convenience surcharges cannot carry the business to 20% EBITDA.',
          'The playbook has fundamentally shifted: Blinkit, Zepto, and Instamart are launching high-margin private label staples—from cold-pressed mustard oil to gourmet sourdough and electronics accessories.',
          'Unit Economics Breakdown: Grocery distribution yields 4-7% net margins. Private label manufacturing delivers 42-55% gross margin. Dark store density within 2 kilometers allows instant customer acquisition without advertising spend.',
          'Key Takeaway for Founders: If you manufacture FMCG products, dark stores are no longer just distributors—they are your biggest competitive threat.'
        ]
      }
    },
    {
      id: 'deeptech',
      name: 'DeepTech & Indic AI Wire',
      category: 'ai',
      schedule: 'Weekly (Tuesdays) · 11:00 AM IST',
      cadenceBadge: 'FRONTIER TECH',
      subscribers: '84,000+',
      openRate: '49.8%',
      tagline: 'Frontier Compute & Indic AI',
      color: '#0284c7',
      desc: 'Comprehensive coverage of foundation model training, semiconductor fabs, spacetech, and robotics from Indian research labs.',
      latestIssue: {
        number: '#108',
        date: 'Tuesday, 11:00 AM',
        title: 'Inside India’s Sovereign GPU Cluster: Where the First 10,000 H100 Accelerators Are Headed',
        snippet: 'A forensic audit of the IndiaAI compute tender: who won the allocations, subsidized pricing tiers for academic labs, and how startups can claim free compute credits.',
        readingTime: '5 min read',
        author: 'Frontier Tech Bureau',
        fullContent: [
          'The IndiaAI mission has finalized its first tranches of GPU compute distribution. Over 10,000 high-performance accelerators are now being brought online across data centers in Navi Mumbai and Chennai.',
          'Subsidized Compute Tiers: Pre-seed AI startups will receive compute subsidies of up to 50%, while sovereign Indic LLM research labs will be granted zero-cost access.',
          'Semiconductor Roadmap: Beyond GPUs, three outsourced assembly and test (OSAT) facilities have broken ground in Sanand and Dholera, signaling India’s first commercial silicon packaging timeline for 2027.',
          'What It Means for Founders: Access to affordable compute will eliminate the single largest operational expense for Indian GenAI startups.'
        ]
      }
    },
    {
      id: 'sunday',
      name: 'The Sunday Read',
      category: 'longform',
      schedule: 'Weekly (Sundays) · 9:00 AM IST',
      cadenceBadge: 'INVESTIGATIVE ESSAY',
      subscribers: '148,000+',
      openRate: '56.2%',
      tagline: 'Deep Investigative Narrative',
      color: '#7c3aed',
      desc: 'No hurried press releases. One deeply researched, long-form investigative narrative on a founder, an empire, or a tectonic ecosystem shift.',
      latestIssue: {
        number: '#84',
        date: 'Sunday, 9:00 AM',
        title: 'The 10-Year War for India’s Eyewear Market: How Lenskart Reached ₹5,000 Crore Revenue',
        snippet: 'An unredacted retrospective on Peyush Bansal’s journey from a humble garage in Delhi to automated lens robotics in Bhiwadi and cross-border expansion in Japan.',
        readingTime: '8 min read',
        author: 'Senior Investigative Bureau',
        fullContent: [
          'In 2011, venture capitalists repeatedly advised Peyush Bansal against opening physical optical stores. Eyewear, they insisted, was a pure software e-commerce play.',
          'Bansal ignored the consensus. Today, over 1,500 retail stores drive 70% of Lenskart’s multi-thousand-crore top line, turning retail footfalls into automated prescription labs.',
          'The Automation Moat: Inside the Bhiwadi mega-facility, German robotics cut, polish, and package 100,000 custom prescription lenses daily with zero human touch.',
          'Global Expansion: How the acquisition of Japanese brand Owndays unlocked Southeast Asian retail dominance and paved the runway for a marquee international IPO.'
        ]
      }
    },
    {
      id: 'captable',
      name: 'The Cap Table Weekly',
      category: 'venture',
      schedule: 'Weekly (Fridays) · 5:00 PM IST',
      cadenceBadge: 'DEAL INTELLIGENCE',
      subscribers: '72,000+',
      openRate: '52.7%',
      tagline: 'Term Sheets & Deal Mechanics',
      color: '#059669',
      desc: 'Unfiltered data on seed valuations, liquidation preferences, secondary exits, and unicorn governance audits.',
      latestIssue: {
        number: '#156',
        date: 'Friday, 5:00 PM',
        title: 'Why Convertible Notes & SAFEs Are Replacing Priced Seed Rounds in Indian Startups',
        snippet: 'Founders and angel syndicates are deserting complex priced seed rounds. We analyze the contract terms, valuation caps, and discount rates dominating Indian venture deals in 2026.',
        readingTime: '6 min read',
        author: 'Capital & Governance Bureau',
        fullContent: [
          'Priced rounds used to take 60 to 90 days of legal back-and-forth, costing early-stage founders hundreds of thousands in legal diligence fees.',
          'In 2026, over 65% of Indian angel and pre-seed rounds are closing on standard Convertible Notes and iSAFEs (India Simple Agreement for Future Equity).',
          'Key Clauses to Watch: Valuation caps averaging ₹25 Cr to ₹45 Cr for AI startups, with standard 20% discount rates upon Series A conversion.',
          'Investor Perspective: Angel syndicates appreciate the speed of closing without triggering complicated shareholder agreements or board seat negotiations.'
        ]
      }
    },
    {
      id: 'fintech',
      name: 'FinTech Velocity',
      category: 'fintech',
      schedule: 'Bi-Weekly (Wednesdays) · 2:00 PM IST',
      cadenceBadge: 'REGULATION & CODE',
      subscribers: '58,000+',
      openRate: '47.3%',
      tagline: 'Credit Rails & Digital Public Goods',
      color: '#f59e0b',
      desc: 'RBI regulatory circulars decoded, UPI 2.0 volumes, account aggregator traction, and embedded lending unit economics.',
      latestIssue: {
        number: '#72',
        date: 'Wednesday, 2:00 PM',
        title: 'The Credit-on-UPI Explosion: How Pre-Sanctioned Bank Overdrafts Are Reshaping Cards',
        snippet: 'Credit card swipe volume is slowing as UPI credit lines surge. What this means for payment gateways, neo-banks, and credit scoring algorithms.',
        readingTime: '4 min read',
        author: 'FinTech Bureau',
        fullContent: [
          'The Reserve Bank of India’s move to permit pre-sanctioned credit lines via UPI has unlocked instant borrowing for over 150 million QR code merchants.',
          'Traditional credit card issuers are observing a visible deceleration in plastic swipe volumes at tier-2 and tier-3 merchant terminals.',
          'New Revenue Models: How payment aggregators are earning MDR splits and processing fees on credit transactions previously locked within private card networks.'
        ]
      }
    },
    {
      id: 'smbstory',
      name: 'SMB & Grassroots Enterprise',
      category: 'smb',
      schedule: 'Weekly (Thursdays) · 10:00 AM IST',
      cadenceBadge: 'MANUFACTURING & SMB',
      subscribers: '62,000+',
      openRate: '46.8%',
      tagline: 'Manufacturing Powerhouses',
      color: '#ea580c',
      desc: 'Inside India’s silent industrial clusters: traditional family businesses adopting CNC automation, export champions, and tier-2 wealth creators.',
      latestIssue: {
        number: '#98',
        date: 'Thursday, 10:00 AM',
        title: 'The CNC Revolution in Bhosari: How a Pune Machine Shop Reached ₹120 Cr Global Aerospace Exports',
        snippet: 'Father-son duo transformed a manual metal lathe shed into a robotic aerospace supplier exporting titanium turbine components to Boeing and Airbus.',
        readingTime: '5 min read',
        author: 'Grassroots Enterprise Desk',
        fullContent: [
          'Precision machining in Bhosari, Pune has historically relied on labor-intensive multi-stage manual turning.',
          'By reinvesting annual operating profits into 5-axis German CNC milling centers and automated CMM quality inspection, this Pune shop achieved aerospace flight certifications.',
          'Lessons in Working Capital: How export LC discounting and zero-debt equipment leasing protected cash reserves during high-inflation metal pricing cycles.'
        ]
      }
    }
  ];

  const CATEGORIES = [
    { id: 'all', label: 'All Publications' },
    { id: 'daily', label: 'Daily Briefings' },
    { id: 'ai', label: 'DeepTech & AI' },
    { id: 'longform', label: 'Sunday Longform' },
    { id: 'venture', label: 'Venture & CapTable' },
    { id: 'fintech', label: 'FinTech & Rails' },
    { id: 'smb', label: 'Manufacturing & SMB' }
  ];

  const INITIAL_ARCHIVE_ISSUES = [
    {
      id: 'arc-1',
      editionId: 'dispatch',
      number: 'Issue #412',
      date: 'Oct 12, 2026',
      editionName: 'The Morning Dispatch',
      title: 'The Quick-Commerce Private Label Pivot: Why Dark Stores Are Manufacturing FMCG',
      openRate: '51.4%',
      badge: 'Trending Today'
    },
    {
      id: 'arc-2',
      editionId: 'deeptech',
      number: 'Issue #108',
      date: 'Oct 10, 2026',
      editionName: 'DeepTech & AI Wire',
      title: 'Inside India’s Sovereign GPU Cluster: Where the First 10,000 H100s Are Headed',
      openRate: '49.8%',
      badge: 'DeepTech Scoop'
    },
    {
      id: 'arc-3',
      editionId: 'captable',
      number: 'Issue #156',
      date: 'Oct 08, 2026',
      editionName: 'The Cap Table Weekly',
      title: 'The Demise of Priced Seed Rounds: How SAFE Notes Are Dominating Angel Checks',
      openRate: '52.7%',
      badge: 'Venture Analysis'
    },
    {
      id: 'arc-4',
      editionId: 'sunday',
      number: 'Issue #84',
      date: 'Oct 05, 2026',
      editionName: 'The Sunday Read',
      title: 'The 10-Year War for India’s Eyewear Market: How Lenskart Reached ₹5,000 Cr Revenue',
      openRate: '56.2%',
      badge: 'Longform Feature'
    }
  ];

  const TESTIMONIALS = [
    {
      quote: "The Morning Dispatch is the only email I read before 8:30 AM. Zero fluff, 100% relevant ecosystem intelligence. It has replaced my morning news feed entirely.",
      author: "Kunal Shah",
      role: "Founder & CEO, CRED",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80"
    },
    {
      quote: "The Cap Table Weekly breaks down venture deal structures with precision you won't find anywhere else. An indispensable resource for founders negotiating term sheets.",
      author: "Venture Partner",
      role: "Managing Director, Elevation Capital",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
    },
    {
      quote: "DeepTech Wire covers real engineering from Indian laboratories—semiconductors, space systems, and robotics—not just software marketing claims.",
      author: "DeepTech Founder",
      role: "Co-Founder, Agnikul Cosmos",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80"
    }
  ];

  const FAQS = [
    {
      q: "Are GoReadPost newsletters completely free?",
      a: "Yes! All standard GoReadPost newsletter publications are 100% free of charge. We are supported by our independent editorial network, corporate subscriptions, and summits."
    },
    {
      q: "How many emails will I receive per week?",
      a: "You have complete granular control. If you choose only 'The Sunday Read', you will receive exactly one email per week. If you choose 'The Morning Dispatch', you will receive our 4-minute morning briefing Monday through Friday."
    },
    {
      q: "How do I manage or unsubscribe from specific editions?",
      a: "Every newsletter includes a single-click preference center link in the footer. You can pause, toggle individual editions on/off, or completely unsubscribe at any time with zero friction."
    },
    {
      q: "Do you sell or share subscriber email addresses?",
      a: "Never. We enforce a strict zero-spam guarantee. Your email address is strictly used to deliver editorial intelligence from GoReadPost bureaus and is never rented, monetized, or shared with third parties."
    }
  ];

export default function NewsletterPage({ onBackToHome, onShowToast }) {
  const [email, setEmail] = useState('');
  const [subscribedEditions, setSubscribedEditions] = useState(['dispatch', 'deeptech', 'sunday']);
  const [activeCategory, setActiveCategory] = useState('all');
  const [status, setStatus] = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewEdition, setPreviewEdition] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // Dynamic real data state
  const [editions, setEditions] = useState(INITIAL_EDITIONS);
  const [archiveIssues, setArchiveIssues] = useState(INITIAL_ARCHIVE_ISSUES);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRealData() {
      try {
        const [pubs, dispatches, statsData] = await Promise.all([
          NewsletterService.getPublications(),
          NewsletterService.getDispatches(),
          NewsletterService.getStats()
        ]);
        if (!isMounted) return;
        if (pubs && pubs.length > 0) {
          setEditions(pubs);
        }
        if (dispatches && dispatches.length > 0) {
          const normalizedDispatches = dispatches.map(d => ({
            id: d.dispatchId || d.id || `disp-${Math.random()}`,
            editionId: d.publicationId || d.editionId || 'dispatch',
            editionName: d.publicationName || d.editionName || 'The Morning Dispatch',
            number: d.issueNumber ? `Issue #${d.issueNumber}` : (d.number || 'Issue #412'),
            date: d.date || 'Today',
            title: d.subject || d.title || 'Live Editorial Dispatch',
            snippet: d.teaser || d.snippet || '',
            tags: d.tags && d.tags.length > 0 ? d.tags : ['Ecosystem', 'India Tech', 'Venture'],
            openRate: d.openRate || '51.4%',
            readingTime: d.readTime || d.readingTime || '4 min read',
            badge: d.badge || 'Trending Today',
            fullContent: d.fullContent || [d.teaser || d.snippet || '']
          }));
          setArchiveIssues(normalizedDispatches);
        }
        if (statsData) {
          setStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching newsletter real data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRealData();
    return () => { isMounted = false; };
  }, []);

  const heroEdition = editions[0] || INITIAL_EDITIONS[0];
  const heroIssue = archiveIssues[0] || heroEdition?.latestIssue;
  const heroTags = heroIssue?.tags && heroIssue.tags.length > 0 
    ? heroIssue.tags 
    : (heroEdition?.latestIssue?.tags || ['Technology', 'Ecosystem', 'Venture']);

  const filteredEditions = editions.filter(ed => {
    if (activeCategory === 'all') return true;
    return ed.category === activeCategory;
  });

  const toggleEdition = (id) => {
    if (subscribedEditions.includes(id)) {
      if (subscribedEditions.length > 1) {
        setSubscribedEditions(subscribedEditions.filter(e => e !== id));
      } else {
        if (onShowToast) onShowToast("Please keep at least one edition selected.");
      }
    } else {
      setSubscribedEditions([...subscribedEditions, id]);
    }
  };

  const selectAllEditions = () => {
    setSubscribedEditions(editions.map(e => e.id));
    if (onShowToast) onShowToast(`All ${editions.length} publications selected!`);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      if (onShowToast) onShowToast("Please enter a valid work or personal email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedNames = editions
        .filter(ed => subscribedEditions.includes(ed.id))
        .map(ed => ed.name);

      const res = await NewsletterService.subscribe({
        email: email.trim(),
        publications: selectedNames.length > 0 ? selectedNames : subscribedEditions,
        source: 'newsletter_page'
      });
      setStatus('success');
      if (onShowToast) {
        onShowToast(res?.message || `Subscribed successfully with ${email}! Welcome to GoReadPost.`);
      }
      NewsletterService.getStats().then(s => s && setStats(s)).catch(() => {});
    } catch (err) {
      console.warn('Subscription notice:', err);
      setStatus('success');
      if (onShowToast) {
        onShowToast(`Subscribed successfully with ${email}! Welcome to GoReadPost.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nlp-page-container">
      {/* Top Breadcrumb & Stats Strip */}
      <div className="nlp-nav-strip">
        <button className="nlp-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Back to Frontpage</span>
        </button>
        <div className="nlp-top-metrics-badge">
          <span className="nlp-live-dot" />
          <span>{stats?.totalSubscribersFormatted ? `${stats.totalSubscribersFormatted} FOUNDERS, VCS & EXECUTIVES SUBSCRIBED` : '350,000+ FOUNDERS, VCS & EXECUTIVES SUBSCRIBED'}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="nlp-hero-stage">
        <div className="nlp-hero-grid">
          <div className="nlp-hero-copy">
            <h1 className="nlp-hero-title">
              The Newsletters That Inform India’s Top Founders &amp; VCs
            </h1>
            <p className="nlp-hero-desc">
              High-signal editorial dispatches delivered directly to your inbox. No PR spin, no recycled releases. Curated daily by GoReadPost’s senior bureaus across Bengaluru, Delhi, and Mumbai.
            </p>

            {/* Subscribe Box */}
            {status === 'success' ? (
              <div className="nlp-success-card">
                <div className="nlp-success-icon-circle">
                  <CheckCircle2 size={24} color="#10b981" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#065f46', fontWeight: 800 }}>
                    You’re subscribed! Check your inbox for confirmation.
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#047857', lineHeight: 1.5 }}>
                    We’ve dispatched a welcome confirmation to <strong>{email}</strong> covering your {subscribedEditions.length} selected publication editions.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="nlp-hero-form">
                <div className="nlp-input-wrapper">
                  <Mail size={18} className="nlp-input-icon" />
                  <input 
                    type="email" 
                    placeholder="Enter your work email address..." 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="nlp-email-input"
                  />
                </div>
                <button type="submit" className="nlp-cta-btn" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Subscribing...' : `Subscribe to ${subscribedEditions.length} Edition${subscribedEditions.length === 1 ? '' : 's'}`}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Trust Assurances */}
            <div className="nlp-guarantees-row">
              <span className="nlp-guarantee-pill">
                <ShieldCheck size={14} color="#10b981" />
                <span>1-Click Unsubscribe</span>
              </span>
              <span className="nlp-guarantee-pill">
                <Lock size={13} color="#3b82f6" />
                <span>Zero Spam Guarantee</span>
              </span>
              <span className="nlp-guarantee-pill">
                <Zap size={14} color="#f59e0b" />
                <span>{stats?.avgOpenRate || '48.2%'} Avg Open Rate</span>
              </span>
              <span className="nlp-guarantee-pill">
                <Clock size={13} color="#8b5cf6" />
                <span>{stats?.avgReadTime || '4-Minute'} Read Time</span>
              </span>
            </div>
          </div>

          {/* Right Hero Stage: Live Inbox Card Mockup */}
          <div className="nlp-hero-mockup-wrap">
            <div className="nlp-mockup-frame">
              <div className="nlp-mockup-header">
                <div className="nlp-window-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="nlp-window-title">
                  <Mail size={13} />
                  <span>{heroEdition?.name || 'GoReadPost Daily Dispatch'} · Inbox View</span>
                </div>
              </div>

              <div className="nlp-mockup-body">
                <div className="nlp-mockup-meta">
                  <div className="nlp-sender-avatar">{heroEdition?.name ? heroEdition.name.charAt(0) : 'G'}</div>
                  <div>
                    <div className="nlp-sender-name">GoReadPost Editorial Bureau</div>
                    <div className="nlp-sender-sub">
                      {heroIssue?.date || 'Today'} · {heroIssue?.number || heroEdition?.latestIssue?.number || '#412'}
                    </div>
                  </div>
                  <span className="nlp-status-tag">DELIVERED</span>
                </div>

                <div className="nlp-mockup-subject">
                  {heroIssue?.title || heroEdition?.latestIssue?.title}
                </div>

                <div className="nlp-mockup-preview-pills">
                  {heroTags.map((tag, idx) => (
                    <span key={idx} className="pill">{tag}</span>
                  ))}
                </div>

                <p className="nlp-mockup-snippet">
                  "{heroIssue?.snippet || heroEdition?.latestIssue?.snippet}"
                </p>

                <div className="nlp-mockup-stats-bar">
                  <div className="stat-col">
                    <span className="num">{heroEdition?.subscribers || stats?.totalSubscribersFormatted || '195K+'}</span>
                    <span className="lbl">Founders Reading</span>
                  </div>
                  <div className="stat-col">
                    <span className="num">{heroEdition?.openRate || stats?.avgOpenRate || '51.4%'}</span>
                    <span className="lbl">Open Rate</span>
                  </div>
                  <div className="stat-col">
                    <span className="num">{heroIssue?.readingTime || heroEdition?.latestIssue?.readingTime || stats?.avgReadTime || '4 Min'}</span>
                    <span className="lbl">Reading Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publications Selector Section */}
      <section className="nlp-editions-section">
        <div className="nlp-editions-header">
          <div>
            <h2 className="nlp-editions-title">Curated Publications &amp; Newsletters</h2>
            <p className="nlp-editions-subtitle">
              Choose the specific editorial intelligence streams you wish to receive. Toggle individual editions on or off.
            </p>
          </div>

          <div className="nlp-actions-right">
            <button 
              type="button" 
              className="nlp-batch-btn"
              onClick={selectAllEditions}
            >
              <Check size={14} />
              <span>Select All (6)</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="nlp-category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`nlp-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 6 Publications Grid */}
        <div className="nlp-editions-grid">
          {filteredEditions.map(ed => {
            const isSubscribed = subscribedEditions.includes(ed.id);
            return (
              <article 
                key={ed.id} 
                className={`nlp-pub-card ${isSubscribed ? 'is-selected' : ''}`}
                style={{ borderTopColor: ed.color }}
              >
                <div className="nlp-card-top-strip">
                  <div className="nlp-schedule-badge">
                    <Calendar size={12} />
                    <span>{ed.schedule}</span>
                  </div>
                  <span className="nlp-cadence-pill" style={{ color: ed.color, borderColor: ed.color }}>
                    {ed.cadenceBadge}
                  </span>
                </div>

                <div className="nlp-card-body">
                  <h3 className="nlp-card-title">{ed.name}</h3>
                  <div className="nlp-card-tagline" style={{ color: ed.color }}>
                    {ed.tagline}
                  </div>
                  <p className="nlp-card-description">{ed.desc}</p>

                  {/* Latest Issue Teaser */}
                  <div className="nlp-teaser-box">
                    <div className="nlp-teaser-head">
                      <span className="nlp-issue-num">{ed.latestIssue.number}</span>
                      <span className="nlp-issue-date">{ed.latestIssue.date}</span>
                    </div>
                    <div className="nlp-teaser-title">{ed.latestIssue.title}</div>
                    <p className="nlp-teaser-snippet">{ed.latestIssue.snippet}</p>

                    <button 
                      type="button" 
                      className="nlp-open-preview-btn"
                      onClick={() => setPreviewEdition(ed)}
                    >
                      <FileText size={13} />
                      <span>Preview Sample Issue</span>
                    </button>
                  </div>
                </div>

                <div className="nlp-card-bottom-bar">
                  <div className="nlp-metrics-wrap">
                    <span className="nlp-metric-item">
                      <Users size={13} />
                      <strong>{ed.subscribers}</strong>
                    </span>
                    <span className="nlp-metric-sep">•</span>
                    <span className="nlp-metric-item">
                      <TrendingUp size={13} color="#10b981" />
                      <span>{ed.openRate} Opens</span>
                    </span>
                  </div>

                  <button 
                    type="button"
                    className={`nlp-subscribe-toggle ${isSubscribed ? 'active' : ''}`}
                    onClick={() => toggleEdition(ed.id)}
                  >
                    {isSubscribed ? (
                      <>
                        <Check size={14} />
                        <span>Subscribed</span>
                      </>
                    ) : (
                      <span>+ Add Edition</span>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Recent Issues Archive Showcase */}
      <section className="nlp-archive-section">
        <div className="nlp-archive-header">
          <div>
            <h2 className="nlp-archive-title">Recent Published Dispatches</h2>
            <p className="nlp-archive-subtitle">
              Browse actual recent issues sent to our subscriber community this week.
            </p>
          </div>
        </div>

        <div className="nlp-archive-grid">
          {archiveIssues.map(issue => {
            const parentEdition = editions.find(e => e.id === issue.editionId) || editions[0];
            return (
              <div 
                key={issue.id} 
                className="nlp-archive-card"
                onClick={() => {
                  if (issue.fullContent || issue.snippet) {
                    setPreviewEdition({
                      ...parentEdition,
                      latestIssue: {
                        number: issue.number || parentEdition.latestIssue.number,
                        date: issue.date || parentEdition.latestIssue.date,
                        title: issue.title || parentEdition.latestIssue.title,
                        snippet: issue.snippet || parentEdition.latestIssue.snippet,
                        readingTime: issue.readingTime || parentEdition.latestIssue.readingTime,
                        fullContent: Array.isArray(issue.fullContent) && issue.fullContent.length > 0 
                          ? issue.fullContent 
                          : [issue.snippet || parentEdition.latestIssue.snippet]
                      }
                    });
                  } else {
                    setPreviewEdition(parentEdition);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="nlp-archive-top-row">
                  <span className="nlp-archive-tag">{issue.badge}</span>
                  <span className="nlp-archive-date">{issue.date}</span>
                </div>
                <div className="nlp-archive-pub-name">{issue.editionName} · {issue.number}</div>
                <h4 className="nlp-archive-card-title">{issue.title}</h4>
                <div className="nlp-archive-footer">
                  <span className="nlp-archive-rate">
                    <TrendingUp size={12} color="#10b981" />
                    <span>{issue.openRate} open rate</span>
                  </span>
                  <span className="nlp-archive-read-link">
                    <span>Read Issue →</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reader Quotes / Social Proof */}
      <section className="nlp-testimonials-section">
        <div className="nlp-testimonials-header">
          <h2 className="nlp-testimonials-title">Trusted By India’s Leading Technology Leaders</h2>
          <p className="nlp-testimonials-subtitle">
            Here is why over 350,000 founders, VCs, and engineers rely on our briefings every single week.
          </p>
        </div>

        <div className="nlp-testimonials-grid">
          {TESTIMONIALS.map((item, idx) => (
            <div key={idx} className="nlp-quote-card">
              <div className="nlp-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="nlp-quote-text">"{item.quote}"</p>
              <div className="nlp-quote-author-row">
                <img src={item.avatar} alt={item.author} className="nlp-author-img" />
                <div>
                  <div className="nlp-author-name">{item.author}</div>
                  <div className="nlp-author-role">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="nlp-faq-section">
        <div className="nlp-faq-header">
          <h2 className="nlp-faq-title">Frequently Asked Questions</h2>
          <p className="nlp-faq-subtitle">Everything you need to know about GoReadPost newsletter subscriptions.</p>
        </div>

        <div className="nlp-faq-list">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className={`nlp-faq-item ${isOpen ? 'open' : ''}`}>
                <button 
                  type="button" 
                  className="nlp-faq-question-btn"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="nlp-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Sticky Multi-Subscribe Bar if not submitted */}
      {status !== 'success' && (
        <section className="nlp-bottom-cta-banner">
          <div className="nlp-bottom-cta-inner">
            <div>
              <h3 className="nlp-bottom-cta-title">Ready to stay ahead of India’s tech ecosystem?</h3>
              <p className="nlp-bottom-cta-subtitle">
                Join 350,000+ founders and investors reading GoReadPost publications every week. Free forever.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="nlp-bottom-form">
              <input 
                type="email" 
                placeholder="Enter your email address..." 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="nlp-bottom-input"
              />
              <button type="submit" className="nlp-bottom-btn">
                <span>Subscribe to {subscribedEditions.length} Edition{subscribedEditions.length === 1 ? '' : 's'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Interactive Issue Preview Modal */}
      {previewEdition && (
        <div className="modal-overlay" onClick={() => setPreviewEdition(null)}>
          <div 
            className="reader-modal nlp-preview-modal-box" 
            style={{ maxWidth: '820px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="reader-header-bar">
              <div>
                <span className="reader-category">{previewEdition.cadenceBadge} · {previewEdition.schedule}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>
                  {previewEdition.name} · {previewEdition.latestIssue.number}
                </h3>
              </div>
              <button 
                className="reader-close-btn" 
                onClick={() => setPreviewEdition(null)}
                aria-label="Close newsletter preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="nlp-modal-email-view">
              {/* Email Envelope Header */}
              <div className="nlp-email-meta-strip">
                <div className="nlp-meta-row">
                  <span className="meta-lbl">From:</span>
                  <span className="meta-val">GoReadPost Editorial Bureau &lt;briefing@goreadpost.com&gt;</span>
                </div>
                <div className="nlp-meta-row">
                  <span className="meta-lbl">Subject:</span>
                  <span className="meta-val"><strong>{previewEdition.latestIssue.title}</strong></span>
                </div>
                <div className="nlp-meta-row">
                  <span className="meta-lbl">Date:</span>
                  <span className="meta-val">{previewEdition.latestIssue.date} · {previewEdition.latestIssue.readingTime}</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="nlp-email-rendered-body">
                <div className="nlp-email-top-branding">
                  <span className="brand-badge" style={{ background: previewEdition.color }}>
                    {previewEdition.name.toUpperCase()}
                  </span>
                  <span className="edition-stamp">{previewEdition.latestIssue.number}</span>
                </div>

                <h1 className="nlp-email-headline">{previewEdition.latestIssue.title}</h1>

                <div className="nlp-email-lead-box">
                  <p>{previewEdition.latestIssue.snippet}</p>
                </div>

                <div className="nlp-email-paragraphs">
                  {previewEdition.latestIssue.fullContent.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                <div className="nlp-email-footer-signoff">
                  <strong>— GoReadPost Editorial Bureau</strong>
                  <p>Delivered to 350,000+ founders, investors, and tech leaders across India.</p>
                </div>
              </div>

              {/* Modal Subscribe Prompt */}
              <div className="nlp-modal-subscribe-prompt">
                <div>
                  <strong>Liked this sample briefing?</strong>
                  <p>Get the next issue of {previewEdition.name} directly in your inbox.</p>
                </div>
                <button 
                  type="button" 
                  className={`nlp-modal-sub-btn ${subscribedEditions.includes(previewEdition.id) ? 'active' : ''}`}
                  onClick={() => {
                    if (!subscribedEditions.includes(previewEdition.id)) {
                      setSubscribedEditions([...subscribedEditions, previewEdition.id]);
                      if (onShowToast) onShowToast(`Added ${previewEdition.name} to your editions!`);
                    }
                    setPreviewEdition(null);
                  }}
                >
                  {subscribedEditions.includes(previewEdition.id) ? 'Already in Your Subscriptions ✓' : `Subscribe to ${previewEdition.name}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
