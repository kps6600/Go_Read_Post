// GoReadPost Founder First Page Configuration & Schema
export const FOUNDER_STORAGE_KEY = 'goreadpost_founder_page_custom_v1';

export const DEFAULT_FOUNDER_DATA = {
  header: {
    backBtnText: 'Back to Frontpage'
  },
  filterTags: [
    { id: 'all', label: 'All Playbooks' },
    { id: 'unicorn', label: 'Unicorn Playbooks' },
    { id: 'bootstrapped', label: 'Bootstrapped Heroes' },
    { id: 'zero-to-one', label: 'Zero to One' },
    { id: 'pivot', label: 'Pivot & Resilience' },
    { id: 'letter', label: 'Founder Letters' }
  ],
  stories: [
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
  ],
  ctaBanner: {
    enabled: true,
    heading: 'Building something audacious in India?',
    subheading: 'Our editorial bureau covers breakthrough technology, bootstrapping miracles, and early-stage builders. Share your metrics and deck directly with our newsroom.',
    buttonText: 'Submit Founder Pitch'
  },
  seo: {
    title: 'Founder First | Zero-to-One Playbooks & Builder Journeys',
    description: 'Unfiltered founder playbooks, bootstrapping lessons, and scaling blueprints from India’s audacious builders.',
    keywords: 'founder stories, startups, zero to one, bootstrapped heroes, entrepreneurship, playbooks'
  }
};

export function getStoredFounderData() {
  try {
    const raw = localStorage.getItem(FOUNDER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_FOUNDER_DATA,
          ...parsed,
          header: { ...DEFAULT_FOUNDER_DATA.header, ...(parsed.header || {}) },
          filterTags: Array.isArray(parsed.filterTags) && parsed.filterTags.length > 0 ? parsed.filterTags : DEFAULT_FOUNDER_DATA.filterTags,
          stories: Array.isArray(parsed.stories) && parsed.stories.length > 0 ? parsed.stories : DEFAULT_FOUNDER_DATA.stories,
          ctaBanner: { ...DEFAULT_FOUNDER_DATA.ctaBanner, ...(parsed.ctaBanner || {}) },
          seo: { ...DEFAULT_FOUNDER_DATA.seo, ...(parsed.seo || {}) }
        };
      }
    }
  } catch (e) {
    console.warn('Error reading stored founder page data:', e);
  }
  return DEFAULT_FOUNDER_DATA;
}

export function saveStoredFounderData(data) {
  try {
    localStorage.setItem(FOUNDER_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('goreadpost:founder-updated', { detail: data }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error saving stored founder page data:', e);
  }
}
