import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goreadpost';

const footerData = {
  aboutText: 'GoReadPost is the leading digital publishing network chronicling the growth of startups, tech innovation, venture capital, and visionary entrepreneurs across India and global ecosystems.',
  copyrightText: '© 2026 GoReadPost Media Technologies Pvt. Ltd. All rights reserved.',
  brandCtaText: '',
  brandCtaLink: '/pitch',
  trustBadgeText: '100% Independent Editorial Integrity',
  liveDeskText: 'LIVE DESK',
  liveDeskLocations: 'Bengaluru • New Delhi • San Francisco • Singapore',
  bottomCommunityTag: 'Built with precision for the global builder community',
  bottomEditionText: 'Global Edition (English)',
  socialLinks: {
    twitter: 'https://twitter.com/goreadpost',
    linkedin: 'https://linkedin.com/company/goreadpost',
    youtube: 'https://youtube.com/@goreadpost',
    facebook: 'https://facebook.com/goreadpost',
    instagram: 'https://instagram.com/goreadpost',
    whatsapp: 'https://whatsapp.com/channel/goreadpost',
    telegram: 'https://t.me/goreadpost',
    rss: '/#feed'
  },
  directChannels: {
    enabled: false,
    title: '',
    description: '',
    items: []
  },
  columns: [
    {
      title: 'PUBLICATIONS',
      links: [
        { label: 'Startups & Funding', url: '/category/startups', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Technology & AI', url: '/category/technology', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'AI Topic Hub', url: '/topic/artificial-intelligence', badge: 'Hot', badgeColor: '#4f46e5', openInNewTab: false },
        { label: 'ChatGPT & LLMs', url: '/tag/chatgpt', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Founder Stories', url: '/category/startups', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Video Shows (YSTV)', url: '/videos', badge: '', badgeColor: '', openInNewTab: false }
      ]
    },
    {
      title: 'DISCOVER & INDEXES',
      links: [
        { label: 'Latest Stories', url: '/latest', badge: 'Live', badgeColor: '#ea580c', openInNewTab: false },
        { label: 'Trending Articles', url: '/trending', badge: '🔥', badgeColor: '#ef4444', openInNewTab: false },
        { label: 'Search Archive', url: '/search', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Resources & Reports', url: '/resources', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Newsletter Digest', url: '/newsletter', badge: '', badgeColor: '', openInNewTab: false }
      ]
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', url: '/about', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Contact Us', url: '/contact', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Advertise With Us', url: '/advertise', badge: 'Partner', badgeColor: '#10b981', openInNewTab: false },
        { label: 'Editorial Team', url: '/editorial-team', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Careers', url: '/careers', badge: "Hiring", badgeColor: '', openInNewTab: false },
        { label: 'Pitch Story', url: '/pitch', badge: '', badgeColor: '', openInNewTab: false }
      ]
    },
    {
      title: 'LEGAL & TRUST',
      links: [
        { label: 'Editorial Policy', url: '/editorial-policy', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Privacy Policy', url: '/privacy-policy', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Terms of Service', url: '/terms', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Disclaimer', url: '/disclaimer', badge: '', badgeColor: '', openInNewTab: false }
      ]
    }
  ]
};

async function run() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const Footer = (await import('../server/models/Footer.js')).default;
    let doc = await Footer.findOne();
    if (!doc) {
      doc = await Footer.create(footerData);
      console.log('Created new footer doc in MongoDB');
    } else {
      Object.assign(doc, footerData);
      await doc.save();
      console.log('Updated existing footer doc in MongoDB');
    }
    process.exit(0);
  } catch (err) {
    console.error('Update error:', err.message);
    process.exit(1);
  }
}

run();
