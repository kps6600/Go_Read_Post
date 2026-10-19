import React, { useState } from 'react';
import { 
  Rocket, ArrowLeft, TrendingUp, DollarSign, Award, BookOpen, 
  Send, ExternalLink, Bookmark, Share2, ThumbsUp, Eye, Sparkles, Filter
} from 'lucide-react';

export default function FounderFirstPage({ 
  onBackToHome, 
  onSelectStory, 
  onOpenPitchModal,
  isSaved,
  onToggleSave,
  onShareStory 
}) {
  const [selectedTag, setSelectedTag] = useState('all');

  const FOUNDER_STORIES = [
    {
      id: 'ff-zerodha-bootstrapped',
      title: 'How Zerodha Built a ₹4,000 Crore Profit Engine Without Taking a Single Rupee of VC Capital',
      founder: 'Nithin Kamath & Nikhil Kamath',
      company: 'Zerodha',
      stage: 'Bootstrapped / Profitable',
      tag: 'bootstrapped',
      tagLabel: 'Bootstrapped Heroes',
      readTime: '6 min read',
      excerpt: 'The counter-intuitive decisions that defied conventional startup playbooks: zero marketing spend, proprietary tech stack, and building for the long horizon.',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
      views: 38400,
      metric: '₹4,000 Cr+ PAT'
    },
    {
      id: 'ff-postman-api-empire',
      title: 'From an Open-Source Side Project in Bengaluru to an Enterprise API Standard Used by 30M Developers',
      founder: 'Abhinav Asthana',
      company: 'Postman',
      stage: 'Series D / $5.6B Valuation',
      tag: 'unicorn',
      tagLabel: 'Unicorn Playbooks',
      readTime: '7 min read',
      excerpt: 'How developer-led product viral growth helped three Indian developers establish the global operating system for web APIs.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      views: 29100,
      metric: '30M+ Global Devs'
    },
    {
      id: 'ff-ather-hardware-pivot',
      title: 'The Hardware Graveyard: How Ather Survived 5 Years of R&D Before Shipping Their First Electric Scooter',
      founder: 'Tarun Mehta & Swapnil Jain',
      company: 'Ather Energy',
      stage: 'Pre-IPO / $1.3B Valuation',
      tag: 'pivot',
      tagLabel: 'Pivot & Resilience',
      readTime: '8 min read',
      excerpt: 'Manufacturing vehicles in India requires iron-willed resilience. Tarun Mehta shares the dark days of supply chain crises and how deep engineering saved them.',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      views: 24700,
      metric: '150,000+ EV Deliveries'
    },
    {
      id: 'ff-lenskart-omnichannel',
      title: 'Zero to IPO: Peyush Bansal on Turning Spectacles into High-Margin Fashion Accessories',
      founder: 'Peyush Bansal',
      company: 'Lenskart',
      stage: 'Unicorn / Omnichannel',
      tag: 'unicorn',
      tagLabel: 'Unicorn Playbooks',
      readTime: '5 min read',
      excerpt: 'Why vertical integration from automated lens fabrication in Bhiwadi to 2,000+ retail stores was the only moat that held up against international giants.',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      views: 31200,
      metric: '2,000+ Retail Outlets'
    },
    {
      id: 'ff-curefoods-cloud-kitchen',
      title: 'Ankit Nagori’s Multi-Brand Playbook: Scaling 100+ Cloud Kitchens with Unit Economics That Work',
      founder: 'Ankit Nagori',
      company: 'Curefoods (EatFit)',
      stage: 'Series C / Growth',
      tag: 'zero-to-one',
      tagLabel: 'Zero to One',
      readTime: '6 min read',
      excerpt: 'After leaving Flipkart, Ankit applied operational rigor to dark kitchens, proving that food brands can be profitable without endless discount subsidies.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      views: 18900,
      metric: '₹550 Cr+ ARR'
    },
    {
      id: 'ff-founder-letter-recession',
      title: 'Dear Founder: A Letter on Preserving Runway When Growth Multiples Drop by 80%',
      founder: 'GoReadPost Editorial Board',
      company: 'Editorial Insights',
      stage: 'Macro Blueprint',
      tag: 'letter',
      tagLabel: 'Founder Letters',
      readTime: '4 min read',
      excerpt: 'Survival math for Series A founders facing slower fundraising cycles: managing burn rate, customer concentration, and hiring freezes with empathy.',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
      views: 42100,
      metric: 'Ecosystem Essay'
    }
  ];

  const FILTER_TAGS = [
    { id: 'all', label: 'All Playbooks' },
    { id: 'unicorn', label: 'Unicorn Playbooks' },
    { id: 'bootstrapped', label: 'Bootstrapped Heroes' },
    { id: 'zero-to-one', label: 'Zero to One' },
    { id: 'pivot', label: 'Pivot & Resilience' },
    { id: 'letter', label: 'Founder Letters' }
  ];

  const displayedStories = selectedTag === 'all' 
    ? FOUNDER_STORIES 
    : FOUNDER_STORIES.filter(s => s.tag === selectedTag);

  return (
    <div className="ffp-page-container">
      {/* Top Navigation Strip */}
      <div className="ffp-nav-strip">
        <button className="ffp-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Back to Frontpage</span>
        </button>
        <div className="ffp-desk-badge">
          <Rocket size={14} color="#e11d48" />
          <span>FOUNDER FIRST DESK • ZERO TO ONE PLAYBOOKS</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="ffp-hero-banner">
        <div className="ffp-hero-content">
          <span className="ffp-kicker">BY FOUNDERS, FOR FOUNDERS</span>
          <h1 className="ffp-hero-title">
            The Playbook for India's Next Generation of Builders
          </h1>
          <p className="ffp-hero-desc">
            Deep-dive investigations into how India’s most resilient founders survived product-market 
            rejections, navigated cap table politics, and scaled from zero to market leadership.
          </p>

          <div className="ffp-pillars-row">
            <div className="ffp-pillar-card">
              <Award size={20} color="#e11d48" />
              <div>
                <strong>Uncompromising Moats</strong>
                <span>Unit economics over vanity GMV</span>
              </div>
            </div>
            <div className="ffp-pillar-card">
              <TrendingUp size={20} color="#e11d48" />
              <div>
                <strong>Growth Playbooks</strong>
                <span>Real metrics, no PR spin</span>
              </div>
            </div>
            <div className="ffp-pillar-card">
              <DollarSign size={20} color="#e11d48" />
              <div>
                <strong>Cap Table Health</strong>
                <span>Dilution rules for early rounds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="ffp-filter-bar">
        <div className="ffp-filter-pills">
          {FILTER_TAGS.map(tab => (
            <button
              key={tab.id}
              className={`ffp-tab-btn ${selectedTag === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTag(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="ffp-pitch-cta-btn" onClick={onOpenPitchModal}>
          <Send size={14} />
          <span>Pitch Your Journey</span>
        </button>
      </div>

      {/* Stories Grid */}
      <div className="ffp-stories-grid">
        {displayedStories.map(story => (
          <div key={story.id} className="ffp-story-card">
            <div className="ffp-story-media" onClick={() => onSelectStory && onSelectStory(story)}>
              <img src={story.image} alt={story.title} className="ffp-story-img" />
              <div className="ffp-story-badge-strip">
                <span className="ffp-category-pill">{story.tagLabel}</span>
                <span className="ffp-metric-pill">{story.metric}</span>
              </div>
            </div>
            <div className="ffp-story-body">
              <div className="ffp-founder-line">
                <strong>{story.founder}</strong> • <span className="ffp-company-tag">{story.company}</span>
              </div>
              <h3 className="ffp-story-title" onClick={() => onSelectStory && onSelectStory(story)}>
                {story.title}
              </h3>
              <p className="ffp-story-excerpt">{story.excerpt}</p>
              
              <div className="ffp-story-footer">
                <div className="ffp-story-meta">
                  <span><Eye size={12} /> {story.views.toLocaleString()} reads</span>
                  <span>•</span>
                  <span>{story.readTime}</span>
                </div>
                <div className="ffp-story-actions">
                  <button 
                    className="ffp-icon-btn" 
                    onClick={() => onToggleSave && onToggleSave(story.id)}
                    title="Bookmark Playbook"
                  >
                    <Bookmark size={15} fill={isSaved && isSaved(story.id) ? '#e11d48' : 'none'} color={isSaved && isSaved(story.id) ? '#e11d48' : 'currentColor'} />
                  </button>
                  <button 
                    className="ffp-icon-btn"
                    onClick={() => onShareStory && onShareStory(story)}
                    title="Share Playbook"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pitch Your Story Callout Banner */}
      <section className="ffp-cta-banner">
        <div className="ffp-cta-inner">
          <div className="ffp-cta-text">
            <h2>Building something audacious in India?</h2>
            <p>
              Our editorial bureau covers breakthrough technology, bootstrapping miracles, and 
              early-stage builders. Share your metrics and deck directly with our newsroom.
            </p>
          </div>
          <button className="ffp-btn-glow" onClick={onOpenPitchModal}>
            <Send size={16} />
            <span>Submit Founder Pitch</span>
          </button>
        </div>
      </section>
    </div>
  );
}
