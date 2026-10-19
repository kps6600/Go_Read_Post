import React, { useState } from 'react';
import { 
  BookOpen, Download, ExternalLink, ArrowLeft, Search, FileText, 
  Calculator, Shield, Users, CheckCircle2, Sparkles, Filter, Code
} from 'lucide-react';

export default function ResourcesPage({ onBackToHome }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const RESOURCES = [
    {
      id: 'res-captable',
      title: 'Interactive Cap Table & Dilution Modeling Template',
      category: 'finance',
      categoryLabel: 'Finance & Capital',
      format: 'Google Sheet / Excel',
      icon: Calculator,
      downloads: '18,400+ downloads',
      desc: 'Simulate SAFE notes, convertible debt, pre-money vs post-money options pool creation, and future round dilution across Seed to Series B.'
    },
    {
      id: 'res-termsheet',
      title: 'The Indian Startup Term Sheet Teardown Guide',
      category: 'legal',
      categoryLabel: 'Legal & Governance',
      format: 'Comprehensive PDF Guide',
      icon: Shield,
      downloads: '24,100+ downloads',
      desc: 'A line-by-line breakdown of liquidation preferences, board control clauses, tag-along rights, and protective provisions for founders.'
    },
    {
      id: 'res-pitchdeck',
      title: 'Deconstructed: 15 Pitch Decks That Raised Over $50M in India',
      category: 'fundraising',
      categoryLabel: 'Fundraising & Decks',
      format: 'Annotated Slides PDF',
      icon: FileText,
      downloads: '32,900+ downloads',
      desc: 'Real early-stage slide decks from Swiggy, Cred, Postman, and Ather with notes on narrative structure, TAM framing, and metrics.'
    },
    {
      id: 'res-saasmetrics',
      title: '2026 India SaaS Metric Benchmarks: CAC, LTV & Net Retention',
      category: 'growth',
      categoryLabel: 'Growth & Metrics',
      format: 'Research Report',
      icon: Code,
      downloads: '14,200+ downloads',
      desc: 'Median efficiency metrics across 200+ Indian B2B SaaS companies categorized by ARR bands ($0-$1M, $1M-$5M, $5M-$20M).'
    },
    {
      id: 'res-esop',
      title: 'Standard ESOP Policy & Grant Agreement Template (Indian Co Law)',
      category: 'legal',
      categoryLabel: 'Legal & Governance',
      format: 'Word & Docx Template',
      icon: FileText,
      downloads: '19,800+ downloads',
      desc: 'Vetting-compliant ESOP vesting schedule templates with cliff periods, accelerated vesting clauses, and exercise windows.'
    },
    {
      id: 'res-investors',
      title: 'Curated Active Angel & Seed Fund Directory 2026',
      category: 'fundraising',
      categoryLabel: 'Fundraising & Decks',
      format: 'Notion Database',
      icon: Users,
      downloads: '41,500+ downloads',
      desc: 'A verified database of 350+ active angel syndicates, micro-VCs, and family offices investing actively in India with thesis tags.'
    }
  ];

  const CATEGORIES = [
    { id: 'all', label: 'All Resources' },
    { id: 'fundraising', label: 'Fundraising & Decks' },
    { id: 'finance', label: 'Finance & Cap Table' },
    { id: 'legal', label: 'Legal & Governance' },
    { id: 'growth', label: 'Growth & SaaS Benchmarks' }
  ];

  const filteredResources = RESOURCES.filter(r => {
    const matchesCat = activeCategory === 'all' || r.category === activeCategory;
    const matchesSearch = !search.trim() || 
      r.title.toLowerCase().includes(search.toLowerCase()) || 
      r.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="rep-page-container">
      {/* Top Nav Strip */}
      <div className="rep-nav-strip">
        <button className="rep-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Back to Frontpage</span>
        </button>
        <div className="rep-badge-top">
          <BookOpen size={14} color="#e11d48" />
          <span>FOUNDER TOOLKIT • VETTED TEMPLATES & DATA</span>
        </div>
      </div>

      {/* Hero */}
      <section className="rep-hero-banner">
        <div className="rep-hero-content">
          <span className="rep-kicker">ESSENTIAL FOUNDER ASSETS</span>
          <h1 className="rep-hero-title">
            Open-Source Startup Playbooks, Models & Templates
          </h1>
          <p className="rep-hero-desc">
            Download production-ready cap table models, vetted legal contracts, investor databases, 
            and metric frameworks designed to accelerate your execution.
          </p>

          <div className="rep-search-bar">
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search templates, term sheets, SaaS benchmarks, ESOP models..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <div className="rep-filter-bar">
        <div className="rep-filter-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`rep-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="rep-grid">
        {filteredResources.map(res => {
          const Icon = res.icon;
          return (
            <div key={res.id} className="rep-card">
              <div className="rep-card-top">
                <div className="rep-icon-bubble">
                  <Icon size={22} color="#e11d48" />
                </div>
                <span className="rep-format-tag">{res.format}</span>
              </div>
              
              <span className="rep-cat-label">{res.categoryLabel}</span>
              <h3 className="rep-card-title">{res.title}</h3>
              <p className="rep-card-desc">{res.desc}</p>
              
              <div className="rep-card-footer">
                <span className="rep-card-downloads">{res.downloads}</span>
                <button className="rep-download-btn" onClick={() => alert(`Downloading: ${res.title}`)}>
                  <Download size={14} />
                  <span>Get Asset</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
