// GoReadPost Contact Page Configuration & Data
export const CONTACT_STORAGE_KEY = 'goreadpost_contact_page_custom_v1';

export const DEFAULT_CONTACT_DATA = {
  hero: {
    badge: 'CONNECT & COLLABORATE',
    titlePrefix: 'Get in Touch With',
    titleHighlight: 'Our Newsroom & Team',
    subtitle: 'Have a breaking story scoop, an editorial pitch, an advertising partnership inquiry, or reader feedback? Our editors and correspondents are ready to connect.',
    responseNotice: '⚡ Average response time: Under 2 business hours (09:00 - 18:30 IST)'
  },
  channels: {
    phone: '+91 928 933 8990',
    displayPhone: '+91 928 933 8990',
    rawWhatsApp: '919289338990',
    primaryEmail: 'contact@goreadpost.com',
    editorialEmail: 'editorial@goreadpost.com',
    advertiseEmail: 'advertise@goreadpost.com',
    pressEmail: 'press@goreadpost.com',
    workingHours: 'Monday – Friday, 9:00 AM – 6:30 PM IST',
    weekendCoverage: 'Breaking news desk active 24/7'
  },
  departments: [
    {
      id: 'editorial',
      title: 'Editorial & Story Pitches',
      email: 'editorial@goreadpost.com',
      desc: 'Exclusive funding announcements, founder scoops, product launches, and news tips.',
      badge: 'Newsroom',
      actionText: 'Pitch a Story'
    },
    {
      id: 'advertising',
      title: 'Brand Solutions & Ads',
      email: 'advertise@goreadpost.com',
      desc: 'Sponsored content, brand storytelling series, category takeovers, and newsletter ads.',
      badge: 'Commercial',
      actionText: 'Explore Media Kit'
    },
    {
      id: 'press',
      title: 'Press & Media Relations',
      email: 'press@goreadpost.com',
      desc: 'Interviews with our correspondents, media citations, event partnerships, and republishing.',
      badge: 'PR Bureau',
      actionText: 'Media Desk'
    },
    {
      id: 'support',
      title: 'Reader Support & Feedback',
      email: 'contact@goreadpost.com',
      desc: 'Bug reports, article corrections, account inquiries, or general community queries.',
      badge: 'Assistance',
      actionText: 'Get Support'
    }
  ],
  bureaus: [
    {
      city: 'Bengaluru (HQ)',
      tag: 'Global Bureau',
      address: 'Indiranagar 100ft Road, Stage 1, Bengaluru, Karnataka 560038',
      phone: '+91 928 933 8990',
      email: 'bengaluru@goreadpost.com',
      hours: '09:00 - 18:30 IST'
    },
    {
      city: 'Mumbai',
      tag: 'Financial Desk',
      address: 'The Capital, G Block, Bandra-Kurla Complex (BKC), Mumbai, Maharashtra 400051',
      phone: '+91 928 933 8990',
      email: 'mumbai@goreadpost.com',
      hours: '09:30 - 18:30 IST'
    },
    {
      city: 'Delhi-NCR',
      tag: 'Policy & Enterprise',
      address: 'DLF CyberCity, Building 10, Tower B, Gurugram, Haryana 122002',
      phone: '+91 928 933 8990',
      email: 'delhi@goreadpost.com',
      hours: '09:00 - 18:30 IST'
    }
  ],
  faqs: [
    {
      q: 'How do I submit a startup or founder pitch for editorial coverage?',
      a: 'Send your pitch directly via the form on this page or email editorial@goreadpost.com. Please include verified details: funding stage, lead investors, key metrics, problem being solved, and executive bios. Embargoed announcements should be submitted 48–72 hours prior.'
    },
    {
      q: 'Does GoReadPost ever charge money for editorial articles?',
      a: 'Never. All editorial coverage, startup spotlights, and journalist interviews on GoReadPost are 100% free and earned. Any commercial or sponsored campaigns are clearly flagged under our Brand Solutions desk and labeled as Sponsored.'
    },
    {
      q: 'How fast can our team launch a sponsored brand campaign?',
      a: 'Our brand solutions team typically responds within 2 business hours. Sponsored articles, founder interviews, and category banners can be drafted, reviewed, and published within 24 to 48 hours.'
    },
    {
      q: 'How do I request an editorial correction or factual update?',
      a: 'We hold accuracy to the highest standard. Select "Editorial Correction" in the contact form, provide the article URL, specify the incorrect statement, and include supporting verifiable evidence. Our senior editors review corrections promptly.'
    },
    {
      q: 'Can I republish or syndicate GoReadPost articles on my platform?',
      a: 'Non-commercial excerpts (under 100 words) with clear canonical link attribution are permitted. For full syndication, translation, or print licensing, email press@goreadpost.com.'
    }
  ],
  seo: {
    title: 'Contact Us | GoReadPost — Editorial Newsroom & Support',
    description: 'Get in touch with GoReadPost. Pitch a startup story, explore advertising partnerships, report editorial corrections, or reach out to our Bengaluru, Mumbai, and Delhi bureaus.'
  }
};

export const getStoredContactData = () => {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONTACT_DATA, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse contact page local data:', e);
  }
  return DEFAULT_CONTACT_DATA;
};

export const saveStoredContactData = (data) => {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
    return true;
  } catch (e) {
    console.error('Failed to save contact data to localStorage:', e);
    return false;
  }
};
