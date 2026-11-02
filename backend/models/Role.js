import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['SUPER_ADMIN', 'AUTHOR', 'USER', 'READER', 'ADMIN', 'EDITOR']
    },
    description: { type: String, default: '' },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

export const DEFAULT_ROLES = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full platform authority with user management and all privileges',
    permissions: ['all', 'manage_users', 'manage_roles', 'manage_settings', 'publish_articles', 'manage_navigation', 'manage_media', 'manage_homepage', 'manage_footer']
  },
  {
    name: 'AUTHOR',
    description: 'Content creator able to draft, upload media, and submit articles',
    permissions: ['create_articles', 'edit_own_articles', 'upload_media']
  },
  {
    name: 'USER',
    description: 'Registered website reader and subscriber with story bookmarking and commenting',
    permissions: ['read_articles', 'save_bookmarks', 'clap_articles']
  }
];

export default mongoose.models.Role || mongoose.model('Role', roleSchema);
