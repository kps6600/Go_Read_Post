import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'READER']
    },
    description: { type: String, default: '' },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

export const DEFAULT_ROLES = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full system ownership with user management and all privileges',
    permissions: ['all', 'manage_users', 'manage_roles', 'manage_settings', 'publish_articles', 'manage_navigation', 'manage_media', 'manage_homepage', 'manage_footer']
  },
  {
    name: 'ADMIN',
    description: 'Administrative access across content, navigation, and settings',
    permissions: ['publish_articles', 'manage_navigation', 'manage_media', 'manage_categories', 'manage_homepage', 'manage_footer']
  },
  {
    name: 'EDITOR',
    description: 'Editorial oversight to draft, review, edit and publish articles',
    permissions: ['publish_articles', 'manage_media', 'manage_categories', 'edit_all_articles']
  },
  {
    name: 'AUTHOR',
    description: 'Content creator able to draft and submit articles for review',
    permissions: ['create_articles', 'edit_own_articles', 'upload_media']
  },
  {
    name: 'READER',
    description: 'Community reader and subscriber with story bookmarking and commenting',
    permissions: ['read_articles', 'save_bookmarks', 'clap_articles']
  }
];

export default mongoose.models.Role || mongoose.model('Role', roleSchema);
