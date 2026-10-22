// GoReadPost About Us Page Configuration & Schema
export const ABOUT_STORAGE_KEY = 'goreadpost_about_page_custom_v1';

export const DEFAULT_ABOUT_DATA = {
  hero: {
    badge: '',
    titlePrefix: 'Where Thoughts Find Their',
    titleHighlight: 'Infinite Orbit',
    subtitle: 'GoReadPost is an independent publishing platform designed to amplify voices that matter, spark curiosity, and build a global community around transformative ideas.',
    primaryBtnText: 'Discover Our Story',
    primaryBtnTarget: '#who-we-are',
    secondaryBtnText: 'Meet the Team',
    secondaryBtnTarget: '#team',
    trustStats: [
      { value: '250K+', label: 'Monthly Readers' },
      { value: '15K+', label: 'Published Perspectives' },
      { value: '100%', label: 'Ad-Free Sanctuary' }
    ]
  },
  whoWeAre: {
    headingPrefix: 'Built for thinkers, writers, and ',
    headingHighlight: 'curious minds.',
    paragraph1: 'Founded in 2023, GoReadPost began with a single vision: to strip away the noise of modern algorithms and give long-form content the thoughtful home it deserves.',
    paragraph2: 'We empower writers with intuitive tools, sleek visual formats, and direct audience connections, while offering readers an ad-free sanctuary for modern tech, culture, design, and philosophy insights.',
    highlightCards: [
      {
        title: 'Ad-Free Experience',
        desc: 'Pure, uninterrupted reading for continuous focus.',
        accent: 'card-cyan-accent'
      },
      {
        title: 'Creator First',
        desc: 'Monetization models that directly empower authors.',
        accent: 'card-magenta-accent'
      }
    ],
    values: [
      {
        id: 'val-1',
        icon: 'feather',
        title: 'Uncompromising Quality',
        desc: 'Every story published on GoReadPost undergoes refined community curation to maintain high literary standards.',
        colorBox: 'box-blue'
      },
      {
        id: 'val-2',
        icon: 'globe',
        title: 'Global Knowledge Exchange',
        desc: 'Connecting perspective-shifting stories from over 120 countries, translated natively in real time.',
        colorBox: 'box-purple'
      },
      {
        id: 'val-3',
        icon: 'shield',
        title: 'Data & Privacy Respect',
        desc: 'Zero invasive trackers, zero sold personal data. Your curiosity remains strictly your own business.',
        colorBox: 'box-rose'
      }
    ]
  },
  statsBar: {
    stats: [
      { num: '250K+', label: 'ACTIVE READERS', isCyan: false },
      { num: '15K+', label: 'PUBLISHED WRITERS', isCyan: false },
      { num: '85M+', label: 'MONTHLY READS', isCyan: false },
      { num: '120+', label: 'COUNTRIES REACHED', isCyan: true }
    ]
  },
  teamSection: {
    title: 'Meet Our Core Team',
    subtitle: 'The engineers, editors, and designers shaping the future of digital writing.',
    members: [
      {
        id: 'team-1',
        name: 'Elena Rostova',
        role: 'Founder & Editor-in-Chief',
        bio: 'Former tech journalist passionate about long-form essayist culture and decentralization.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        github: '',
        website: 'https://goreadpost.com',
        community: ''
      },
      {
        id: 'team-2',
        name: 'Marcus Chen',
        role: 'Head of Product',
        bio: 'Design-obsessed developer focused on crafting minimalist writing user interfaces.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        website: '',
        community: ''
      },
      {
        id: 'team-3',
        name: 'Sarah Jenkins',
        role: 'Community Director',
        bio: 'Connecting writers, hosting digital workshops, and cultivating creator mentorships.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        github: '',
        website: '',
        community: 'https://discord.com'
      },
      {
        id: 'team-4',
        name: 'Devon Vance',
        role: 'Lead AI Engineer',
        bio: 'Building intelligent context discovery systems that respect user data privacy.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        linkedin: '',
        github: 'https://github.com',
        website: 'https://goreadpost.com',
        community: ''
      }
    ]
  },
  seo: {
    title: 'About Us | GoReadPost Media',
    description: 'GoReadPost is the premier digital journalism network chronicling breakthrough founders, deep technology, AI revolutions, and venture capital.',
    keywords: 'about us, GoReadPost, editorial, tech media, startup journalism'
  }
};

export function getStoredAboutData() {
  try {
    const raw = localStorage.getItem(ABOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_ABOUT_DATA,
          ...parsed,
          hero: { ...DEFAULT_ABOUT_DATA.hero, ...(parsed.hero || {}) },
          whoWeAre: { ...DEFAULT_ABOUT_DATA.whoWeAre, ...(parsed.whoWeAre || {}) },
          statsBar: { ...DEFAULT_ABOUT_DATA.statsBar, ...(parsed.statsBar || {}) },
          teamSection: { ...DEFAULT_ABOUT_DATA.teamSection, ...(parsed.teamSection || {}) },
          seo: { ...DEFAULT_ABOUT_DATA.seo, ...(parsed.seo || {}) }
        };
      }
    }
  } catch (e) {
    console.warn('Error reading stored about page data:', e);
  }
  return DEFAULT_ABOUT_DATA;
}

export function saveStoredAboutData(data) {
  try {
    localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error saving stored about page data:', e);
  }
}
