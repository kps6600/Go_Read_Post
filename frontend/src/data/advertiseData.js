// GoReadPost Media Kit & Advertising Page Data Configuration
export const ADVERTISE_STORAGE_KEY = 'goreadpost_advertise_page_v1';

export const DEFAULT_ADVERTISE_DATA = {
  hero: {
    badge: 'MEDIA KIT & BRAND PARTNERSHIPS 2026',
    titlePrefix: 'Amplify Your Brand to India’s Most Influential',
    titleHighlight: 'Builders & Decision Makers',
    subtitle: 'GoReadPost delivers high-impact native stories, high-open executive newsletters, video spotlight shows, and bespoke industry roundtables tailored for high-growth tech enterprises, VCs, and visionary innovators.',
    primaryCtaText: 'Download 2026 Media Kit',
    secondaryCtaText: 'Schedule Campaign Call',
    trustStats: [
      { value: '5.2M+', label: 'Monthly Pageviews' },
      { value: '450K+', label: 'Newsletter Subscribers' },
      { value: '42%', label: 'Average Open Rate' },
      { value: '78%', label: 'Founder & CXO Decision-Makers' }
    ]
  },
  demographics: {
    heading: 'High-Intent Executive Audience Profile',
    subheading: 'Connect directly with capital allocators, technical founders, and enterprise buyers who drive the digital economy.',
    roles: [
      { label: 'Founders, CEOs & Managing Directors', pct: 45, color: '#ef4444' },
      { label: 'CTOs, VPs of Engineering & Product Leads', pct: 30, color: '#3b82f6' },
      { label: 'VC Partners, Angel Investors & Allocators', pct: 15, color: '#10b981' },
      { label: 'Policy Shapers & Corporate Strategists', pct: 10, color: '#8b5cf6' }
    ],
    sectors: [
      { name: 'AI & DeepTech', tag: 'Fastest Growing' },
      { name: 'Fintech & BFSI', tag: 'High Liquidity' },
      { name: 'Enterprise SaaS', tag: 'Global Buyers' },
      { name: 'CleanTech & Mobility', tag: 'ESG Focused' },
      { name: 'Consumer Brands (D2C)', tag: 'Scale Movers' },
      { name: 'Bio & HealthTech', tag: 'Breakthroughs' }
    ],
    geographies: [
      { city: 'Bengaluru', pct: '34%' },
      { city: 'Delhi-NCR', pct: '26%' },
      { city: 'Mumbai', pct: '18%' },
      { city: 'Hyderabad & Pune', pct: '12%' },
      { city: 'Global (US, SEA, UK)', pct: '10%' }
    ]
  },
  programs: [
    {
      id: 'native-stories',
      title: 'Sponsored Editorial Stories',
      tag: 'FLAGSHIP FORMAT',
      description: 'Deep-dive founder features and product narratives produced by senior business journalists with high-fidelity storytelling.',
      features: [
        'Guaranteed placement on Homepage lead carousel',
        'Syndication across Google News & RSS distribution',
        'Permanent SEO equity with authoritative dofollow backlinks',
        'Dedicated social blast across LinkedIn, X & Telegram'
      ],
      turnaround: '4–6 Business Days',
      badgeColor: '#ef4444'
    },
    {
      id: 'newsletter-takeover',
      title: 'Executive Newsletter Takeovers',
      tag: 'HIGHEST CTR',
      description: 'Solus sponsorship or primary hero placement in our morning briefing delivered straight to 450,000+ verified builder inboxes.',
      features: [
        '42% average open rate with zero ad-blocker loss',
        'Sole sponsor exclusivity per newsletter edition',
        'Custom CTA button with real-time UTM tracking',
        'Post-send detailed delivery and click analytics'
      ],
      turnaround: 'Booking 2 Weeks in Advance',
      badgeColor: '#3b82f6'
    },
    {
      id: 'video-spotlights',
      title: 'Studio Dialogues & YSTV Features',
      tag: 'MAX ENGAGEMENT',
      description: 'High-production video interview filmed at our Bengaluru or studio hubs, packaged into multi-channel snackable assets.',
      features: [
        'Full 15-20 min masterclass interview on YouTube',
        '4x vertical micro-reels optimized for LinkedIn & Instagram',
        'Full audio syndication across Spotify & Apple Podcasts',
        'Companion long-form editorial article included'
      ],
      turnaround: '7–10 Business Days',
      badgeColor: '#8b5cf6'
    },
    {
      id: 'category-ownership',
      title: 'Category & Vertical Ownership',
      tag: 'MAX BRAND RECALL',
      description: '100% Share-of-Voice header and in-article banner branding across high-traffic verticals (AI Story, SMBStory, HerStory).',
      features: [
        'Exclusive top-tier banner on all category articles',
        '“Powered by [Your Brand]” editorial series co-branding',
        'Lead capture integration for whitepapers or beta signups',
        'Monthly guaranteed minimum 500,000 impressions'
      ],
      turnaround: 'Quarterly & Annual Retainers',
      badgeColor: '#10b981'
    },
    {
      id: 'research-reports',
      title: 'Co-Branded Research & Benchmarks',
      tag: 'THOUGHT LEADERSHIP',
      description: 'Original sector benchmark reports co-authored with GoReadPost Intelligence, establishing your company as the market standard.',
      features: [
        'Rigorous methodology with surveyed founder data',
        'Dedicated landing page with gated lead capture',
        'Executive webinar launch with industry panel',
        'Extensive quote syndication across press releases'
      ],
      turnaround: '4–6 Weeks Project Cycle',
      badgeColor: '#f59e0b'
    },
    {
      id: 'vip-roundtables',
      title: 'Closed-Door VIP Roundtables & Summits',
      tag: 'HIGH-TOUCH PIPELINE',
      description: 'Curated private dinners bringing together 20–25 pre-qualified enterprise buyers, CTOs, and founders for meaningful dialogue.',
      features: [
        'We handle 100% of guest curation & VIP RSVPs',
        'Five-star hospitality & structured panel moderation',
        'Post-event takeaways dossier published to readership',
        'Direct relationship building with enterprise procurement leads'
      ],
      turnaround: 'Monthly Calendar Slots',
      badgeColor: '#ec4899'
    }
  ],
  caseStudies: [
    {
      brand: 'ScaleEngine AI',
      metric: '3.8x',
      label: 'Qualified Pipeline Growth',
      quote: 'The GoReadPost native feature and newsletter takeover generated our single highest-converting inbound week of the year.',
      author: 'Aarav Singhania, CMO @ ScaleEngine'
    },
    {
      brand: 'Nexus Cloud Security',
      metric: '1,420+',
      label: 'Enterprise CTO Signups',
      quote: 'Unlike generic ad networks, GoReadPost readers actually read the technical nuances. The engagement quality is unmatched.',
      author: 'Priya Sundaram, VP Marketing @ Nexus'
    },
    {
      brand: 'Indus Capital Partners',
      metric: '850+',
      label: 'Pitch Submissions',
      quote: 'Our fund launch campaign via TechSparks & GoReadPost established immediate credibility with top tier Indian founders.',
      author: 'Vikram Merchant, Managing Partner'
    }
  ],
  faqs: [
    {
      q: 'What is the turnaround time for a sponsored native article?',
      a: 'Once your brief is submitted, our editorial team completes drafting within 3 business days. After your review and approval, the story goes live within 24 hours aligned with your preferred launch window.'
    },
    {
      q: 'How does GoReadPost maintain editorial credibility with sponsored content?',
      a: 'We adhere to strict transparency standards. All partner stories are clearly labeled with a partner badge while maintaining the same journalistic depth, rigorous fact-checking, and polished prose as our core reporting.'
    },
    {
      q: 'Can we include custom tracking links and UTM parameters?',
      a: 'Yes, absolutely. We support standard Google Analytics UTM links, conversion tracking pixels, custom promo codes, and dedicated landing page redirects with full reporting.'
    },
    {
      q: 'Do you offer custom multi-month campaign packages?',
      a: 'Yes. Most high-growth partners opt for quarterly or annual retainers that blend sponsored stories, weekly newsletter slots, video features, and event sponsorships at discounted bundled rates.'
    }
  ],
  contact: {
    email: 'advertise@goreadpost.com',
    phone: '+91 (080) 4123-5680',
    address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    slaText: 'Average response time: Under 2 hours during market hours (Mon–Fri)'
  }
};
