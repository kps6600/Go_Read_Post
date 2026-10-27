import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'site_settings' },
    siteTitle: { type: String, default: 'GoReadPost' },
    siteName: { type: String, default: 'GoReadPost' },
    siteTagline: { type: String, default: 'Stories of Founders, Technology, & Capital' },
    tagline: { type: String, default: 'Stories of Founders, Technology, & Capital' },
    brandEmblem: { type: String, default: 'G' },
    brandPrefix: { type: String, default: 'GoRead' },
    brandSuffix: { type: String, default: 'Post' },
    logo: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    favicon: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    editionYear: { type: String, default: '2026' },
    editionText: { type: String, default: 'EDITION 2026' },
    liveDeskLocations: { type: String, default: 'Bengaluru • New Delhi • San Francisco • Singapore' },
    announcementText: { type: String, default: '⚡ JUST IN: India Tech Ecosystem Funding Crosses $12B in Q1 2026' },
    announcementLink: { type: String, default: '/?tag=just+in' },
    showAnnouncement: { type: Boolean, default: true },
    contactEmail: { type: String, default: 'editor@goreadpost.com' },
    phone: { type: String, default: '+91 (080) 4123-5678' },
    address: { type: String, default: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038' },
    socialLinks: {
      twitter: { type: String, default: 'https://twitter.com/goreadpost' },
      linkedin: { type: String, default: 'https://linkedin.com/company/goreadpost' },
      youtube: { type: String, default: 'https://youtube.com/@goreadpost' },
      instagram: { type: String, default: 'https://instagram.com/goreadpost' },
      facebook: { type: String, default: 'https://facebook.com/goreadpost' },
      whatsapp: { type: String, default: '' },
      telegram: { type: String, default: '' }
    },
    defaultSeoTitle: { type: String, default: 'GoReadPost | Stories of Founders, Technology & Capital' },
    defaultSeoDescription: { type: String, default: 'Leading Indian & Global digital media platform delivering unfiltered reporting on startups, funding, deep tech, and market dynamics.' },
    footerDescription: { type: String, default: 'The premier digital journalism network chronicling breakthrough founders, deep technology, AI revolutions, venture capital, and economic innovation across India and the global startup ecosystem.' },
    copyrightText: { type: String, default: '© 2026 GoReadPost Media Technologies Pvt. Ltd. All rights reserved.' }
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema);
