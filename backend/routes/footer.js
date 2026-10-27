import express from 'express';
import Footer from '../models/Footer.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, requireRoles } from '../middleware/auth.js';

const router = express.Router();
export const adminFooterRouter = express.Router();

export const DEFAULT_FOOTER_DATA = {
  key: 'main_footer',
  aboutText: 'GoReadPost is the leading digital publishing network chronicling the growth of startups, tech innovation, venture capital, and visionary entrepreneurs across India and global ecosystems.',
  copyrightText: '© 2026 GoReadPost Media Technologies Pvt. Ltd. All rights reserved.',
  brandCtaText: '',
  brandCtaLink: '/pitch',
  trustBadgeText: '100% Independent Editorial Integrity',
  liveDeskText: 'LIVE DESK',
  liveDeskLocations: 'Bengaluru • New Delhi • San Francisco • Singapore',
  bottomCommunityTag: 'Built with precision for the global builder community',
  bottomEditionText: 'Global Edition (English)',
  socialLinks: [
    { platform: 'twitter', label: 'Twitter / X', url: 'https://twitter.com/goreadpost' },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/goreadpost' },
    { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com/@goreadpost' },
    { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/goreadpost' },
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/goreadpost' },
    { platform: 'whatsapp', label: 'WhatsApp', url: 'https://whatsapp.com/channel/goreadpost' },
    { platform: 'telegram', label: 'Telegram', url: 'https://t.me/goreadpost' },
    { platform: 'rss', label: 'RSS Feed', url: '/#feed' }
  ],
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
        { label: 'DeepTech & AI', url: '/category/technology', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Founder Stories', url: '/category/startups', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Video Shows (YSTV)', url: '/videos', badge: '', badgeColor: '', openInNewTab: false }
      ]
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', url: '/about', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Editorial Team', url: '/editorial-team', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Careers', url: '/careers', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Pitch Story', url: '/pitch', badge: '', badgeColor: '', openInNewTab: false }
      ]
    },
    {
      title: 'LEGAL & COMPLIANCE',
      links: [
        { label: 'Privacy Policy', url: '/privacy', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Terms of Service', url: '/terms', badge: '', badgeColor: '', openInNewTab: false },
        { label: 'Disclaimer', url: '/disclaimer', badge: '', badgeColor: '', openInNewTab: false }
      ]
    }
  ]
};

let localFooterData = JSON.parse(JSON.stringify(DEFAULT_FOOTER_DATA));

function normalizeSocial(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const PRESET_LABELS = {
      twitter: 'Twitter / X',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      facebook: 'Facebook',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      rss: 'RSS Feed'
    };
    return Object.entries(raw)
      .filter(([_, url]) => Boolean(url))
      .map(([platform, url]) => ({
        platform,
        label: PRESET_LABELS[platform] || (platform.charAt(0).toUpperCase() + platform.slice(1)),
        url
      }));
  }
  return DEFAULT_FOOTER_DATA.socialLinks;
}

function normalizeFooter(doc) {
  if (!doc) return DEFAULT_FOOTER_DATA;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...DEFAULT_FOOTER_DATA,
    ...obj,
    socialLinks: normalizeSocial(obj.socialLinks),
    directChannels: {
      ...DEFAULT_FOOTER_DATA.directChannels,
      ...(obj.directChannels || {}),
      items: Array.isArray(obj.directChannels?.items)
        ? obj.directChannels.items
        : DEFAULT_FOOTER_DATA.directChannels.items
    },
    columns: Array.isArray(obj.columns)
      ? obj.columns
      : DEFAULT_FOOTER_DATA.columns
  };
}

async function getOrCreateFooter() {
  if (!isDbConnected()) return localFooterData;
  let doc = await Footer.findOne();
  if (!doc) {
    doc = await Footer.create(DEFAULT_FOOTER_DATA);
  }
  return normalizeFooter(doc);
}

// 1. PUBLIC: GET /api/footer
router.get('/', async (req, res) => {
  try {
    const footer = await getOrCreateFooter();
    res.json({ success: true, data: footer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. ADMIN: GET /api/admin/footer
adminFooterRouter.get('/', protectAdmin, async (req, res) => {
  try {
    const footer = await getOrCreateFooter();
    res.json({ success: true, data: footer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. ADMIN: PUT /api/admin/footer
adminFooterRouter.put('/', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const data = req.body || {};
    if (isDbConnected()) {
      let doc = await Footer.findOne();
      if (!doc) {
        doc = await Footer.create({ ...DEFAULT_FOOTER_DATA, ...data });
      } else {
        Object.assign(doc, data);
        if (data.columns !== undefined) {
          doc.columns = data.columns;
          doc.markModified('columns');
        }
        if (data.socialLinks !== undefined) {
          doc.socialLinks = data.socialLinks;
          doc.markModified('socialLinks');
        }
        if (data.directChannels !== undefined) {
          doc.directChannels = data.directChannels;
          doc.markModified('directChannels');
        }
        await doc.save();
      }
      const normalized = normalizeFooter(doc);
      return res.json({ success: true, message: 'Footer configuration saved successfully', data: normalized });
    }

    localFooterData = normalizeFooter({ ...localFooterData, ...data });
    res.json({ success: true, message: 'Footer saved (local mode)', data: localFooterData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
