import express from 'express';
import Setting from '../models/Setting.js';
import { isDbConnected } from '../db.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

export const DEFAULT_SETTINGS = {
  key: 'site_settings',
  siteTitle: 'GoReadPost',
  siteName: 'GoReadPost',
  siteTagline: 'Stories of Founders, Technology, & Capital',
  tagline: 'Stories of Founders, Technology, & Capital',
  brandEmblem: 'G',
  brandPrefix: 'GoRead',
  brandSuffix: 'Post',
  logo: '',
  logoUrl: '',
  favicon: '',
  faviconUrl: '',
  editionYear: '2026',
  editionText: 'EDITION 2026',
  liveDeskLocations: 'Bengaluru • New Delhi • San Francisco • Singapore',
  announcementText: '⚡ JUST IN: India Tech Ecosystem Funding Crosses $12B in Q1 2026',
  announcementLink: '/?tag=just+in',
  showAnnouncement: true,
  contactEmail: 'editor@goreadpost.com',
  phone: '+91 (080) 4123-5678',
  contactPhone: '+91 (080) 4123-5678',
  address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
  socialLinks: {
    twitter: 'https://twitter.com/goreadpost',
    linkedin: 'https://linkedin.com/company/goreadpost',
    youtube: 'https://youtube.com/@goreadpost',
    instagram: 'https://instagram.com/goreadpost',
    facebook: 'https://facebook.com/goreadpost',
    whatsapp: '',
    telegram: ''
  },
  defaultSeoTitle: 'GoReadPost | Stories of Founders, Technology & Capital',
  defaultSeoDescription: 'Leading Indian & Global digital media platform delivering unfiltered reporting on startups, funding, deep tech, and market dynamics.',
  footerDescription: 'The premier digital journalism network chronicling breakthrough founders, deep technology, AI revolutions, venture capital, and economic innovation across India and the global startup ecosystem.',
  copyrightText: '© 2026 GoReadPost Media Technologies Pvt. Ltd. All rights reserved.'
};

const normalizeSettings = (doc) => {
  if (!doc) return DEFAULT_SETTINGS;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const siteName = obj.siteName || obj.siteTitle || DEFAULT_SETTINGS.siteTitle;
  const siteTitle = obj.siteTitle || obj.siteName || DEFAULT_SETTINGS.siteTitle;
  const brandEmblem = (obj.brandEmblem !== undefined && obj.brandEmblem !== null && String(obj.brandEmblem).trim() !== '')
    ? String(obj.brandEmblem).trim()
    : (siteName ? siteName.trim().charAt(0).toUpperCase() : DEFAULT_SETTINGS.brandEmblem);

  return {
    ...DEFAULT_SETTINGS,
    ...obj,
    siteName,
    siteTitle,
    tagline: obj.tagline ?? obj.siteTagline ?? DEFAULT_SETTINGS.siteTagline,
    siteTagline: obj.siteTagline ?? obj.tagline ?? DEFAULT_SETTINGS.siteTagline,
    logoUrl: obj.logoUrl ?? obj.logo ?? '',
    logo: obj.logo ?? obj.logoUrl ?? '',
    contactPhone: obj.contactPhone ?? obj.phone ?? DEFAULT_SETTINGS.phone,
    phone: obj.phone ?? obj.contactPhone ?? DEFAULT_SETTINGS.phone,
    brandEmblem,
    brandPrefix: obj.brandPrefix !== undefined && obj.brandPrefix !== null ? obj.brandPrefix : (obj.brandSuffix ? '' : siteName),
    brandSuffix: obj.brandSuffix !== undefined && obj.brandSuffix !== null ? obj.brandSuffix : '',
    editionYear: obj.editionYear ?? DEFAULT_SETTINGS.editionYear,
    editionText: obj.editionText ?? DEFAULT_SETTINGS.editionText,
    liveDeskLocations: obj.liveDeskLocations ?? DEFAULT_SETTINGS.liveDeskLocations,
    socialLinks: {
      ...DEFAULT_SETTINGS.socialLinks,
      ...(obj.socialLinks || {})
    }
  };
};

// 1. GET /api/settings (Public: returns global site settings)
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (isDbConnected()) {
      let settings = await Setting.findOne({ key: 'site_settings' });
      if (!settings) {
        settings = await Setting.create(DEFAULT_SETTINGS);
      }
      return res.json({ success: true, data: normalizeSettings(settings) });
    }
    return res.json({ success: true, data: DEFAULT_SETTINGS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. PUT /api/settings (Protected: update global site settings)
router.put('/', protectAdmin, async (req, res) => {
  try {
    const raw = req.body || {};
    const updates = {
      ...raw,
      siteTitle: raw.siteTitle ?? raw.siteName,
      siteName: raw.siteName ?? raw.siteTitle,
      siteTagline: raw.siteTagline ?? raw.tagline,
      tagline: raw.tagline ?? raw.siteTagline,
      logo: raw.logo ?? raw.logoUrl ?? '',
      logoUrl: raw.logoUrl ?? raw.logo ?? '',
      phone: raw.phone ?? raw.contactPhone,
      contactPhone: raw.contactPhone ?? raw.phone,
      brandEmblem: raw.brandEmblem ?? '',
      brandPrefix: raw.brandPrefix ?? '',
      brandSuffix: raw.brandSuffix ?? '',
      editionText: raw.editionText ?? ''
    };
    
    if (isDbConnected()) {
      const updated = await Setting.findOneAndUpdate(
        { key: 'site_settings' },
        { ...updates, key: 'site_settings' },
        { new: true, upsert: true }
      );
      return res.json({ success: true, message: 'Settings updated successfully', data: normalizeSettings(updated) });
    }
    return res.json({ success: true, message: 'Settings saved in local mode', data: normalizeSettings({ ...DEFAULT_SETTINGS, ...updates }) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
