import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  label: { type: String, default: '' },
  url: { type: String, default: '' },
  badge: { type: String, default: '' },
  badgeColor: { type: String, default: '' },
  openInNewTab: { type: Boolean, default: false }
}, { _id: false });

const columnSchema = new mongoose.Schema({
  title: { type: String, default: 'Section' },
  links: [linkSchema]
}, { _id: false });

const directChannelSchema = new mongoose.Schema({
  title: { type: String, default: 'WhatsApp Channel' },
  meta: { type: String, default: '120K+ Founders' },
  url: { type: String, default: '#top' },
  icon: { type: String, default: 'Radio' }
}, { _id: false });

const footerSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main_footer', unique: true },
    aboutText: {
      type: String,
      default: 'The premier digital journalism network chronicling breakthrough founders, deep technology, AI revolutions, venture capital, and economic innovation across India and the global startup ecosystem.'
    },
    copyrightText: {
      type: String,
      default: '© 2026 GoReadPost Media Technologies Pvt. Ltd. All rights reserved.'
    },
    brandCtaText: {
      type: String,
      default: 'Pitch Your Story'
    },
    brandCtaLink: {
      type: String,
      default: '/pitch'
    },
    trustBadgeText: {
      type: String,
      default: '100% Independent Editorial Integrity'
    },
    liveDeskText: {
      type: String,
      default: 'LIVE DESK'
    },
    liveDeskLocations: {
      type: String,
      default: 'Bengaluru • New Delhi • San Francisco • Singapore'
    },
    bottomCommunityTag: {
      type: String,
      default: 'Built with precision for the global builder community'
    },
    bottomEditionText: {
      type: String,
      default: 'Global Edition (English)'
    },
    socialLinks: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    directChannels: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Direct Channels' },
      description: { type: String, default: 'Get breaking scoops, venture data, and executive briefings delivered directly to your feeds.' },
      items: [directChannelSchema]
    },
    columns: [columnSchema]
  },
  { timestamps: true }
);

export default mongoose.models.Footer || mongoose.model('Footer', footerSchema);
