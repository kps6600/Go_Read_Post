// GoReadPost About Us Page Configuration & Data
export const ABOUT_STORAGE_KEY = 'goreadpost_about_page_custom_v6';

export const DEFAULT_ABOUT_DATA = {
  hero: {
    badge: '',
    titlePrefix: 'Welcome to Our Blog —',
    titleHighlight: 'Ideas, Stories & Inspiration',
    introLead: 'We believe every great idea deserves to be shared. Our blog is a platform for discovering fresh perspectives, learning something new, and staying updated with the topics that matter to you.',
    missionStatement: 'Our mission is simple: to make useful information accessible, engaging, and easy to understand.',
    primaryBtnText: 'Explore Latest Articles',
    primaryBtnTarget: '/latest',
    secondaryBtnText: 'Contact Us',
    secondaryBtnTarget: '/contact'
  },
  whoWeAre: {
    badge: '',
    title: 'Who We Are',
    content: 'We are a passionate team of content creators, researchers, and curious minds who love exploring ideas and sharing knowledge. From informative articles and practical guides to trending topics and inspiring stories, we aim to create content that adds value to your everyday life.'
  },
  whatWeShare: {
    badge: '',
    title: 'What We Share',
    lead: '',
    items: [
      {
        id: 'share-1',
        icon: 'book',
        title: 'Informative Articles',
        description: 'Useful insights to help you learn and grow.'
      },
      {
        id: 'share-2',
        icon: 'lightbulb',
        title: 'Tips & Guides',
        description: 'Practical advice you can apply in everyday life.'
      },
      {
        id: 'share-3',
        icon: 'trending',
        title: 'Trending Topics',
        description: "Fresh perspectives on what's happening around us."
      },
      {
        id: 'share-4',
        icon: 'sparkles',
        title: 'Stories & Inspiration',
        description: 'Ideas that spark curiosity and creativity.'
      }
    ]
  },
  mission: {
    badge: '',
    title: 'Our Mission',
    description: 'Our mission is to inform, inspire, and empower our readers through quality content. We focus on making every article meaningful, easy to read, and worth your time.'
  },
  vision: {
    badge: '',
    title: 'Our Vision',
    description: 'We aspire to build a trusted blogging community where readers can explore ideas, discover opportunities, and keep learning. Your time and trust matter to us, and we strive to make every visit worthwhile.'
  },
  whyChooseUs: {
    badge: '',
    title: 'Why Choose Us?',
    points: [
      'Reader-focused and easy-to-understand content.',
      'Informative articles designed to provide real value.',
      'A commitment to quality, clarity, and continuous improvement.',
      'A welcoming platform where curiosity leads to discovery.'
    ]
  },
  community: {
    badge: '',
    title: 'Join Our Community',
    paragraph1: '',
    paragraph2: '',
    contactQuestion: 'Have a question or want to collaborate?',
    contactActionText: "Visit our Contact Us page. We'd love to hear from you.",
    contactBtnText: 'Visit Contact Us Page',
    contactBtnTarget: '/contact',
    tagline: 'Read. Discover. Learn. Grow.'
  },
  seo: {
    title: 'About Us | GoReadPost',
    description: 'Welcome to Our Blog — Ideas, Stories & Inspiration. Discover fresh perspectives, informative articles, practical tips, and inspiring stories.',
    keywords: 'About Us, GoReadPost, Ideas Stories Inspiration, Informative Articles, Tips & Guides, Trending Topics'
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
          whatWeShare: { ...DEFAULT_ABOUT_DATA.whatWeShare, ...(parsed.whatWeShare || {}) },
          mission: { ...DEFAULT_ABOUT_DATA.mission, ...(parsed.mission || {}) },
          vision: { ...DEFAULT_ABOUT_DATA.vision, ...(parsed.vision || {}) },
          whyChooseUs: { ...DEFAULT_ABOUT_DATA.whyChooseUs, ...(parsed.whyChooseUs || {}) },
          community: { ...DEFAULT_ABOUT_DATA.community, ...(parsed.community || {}) },
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
