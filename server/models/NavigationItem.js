import mongoose from 'mongoose';

const navigationItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    url: { type: String, default: '#', trim: true },
    type: { 
      type: String, 
      enum: ['link', 'dropdown', 'mega', 'mega_menu', 'category', 'topic', 'page', 'external', 'custom', 'group'], 
      default: 'link',
      lowercase: true
    },
    parentId: { 
      type: mongoose.Schema.Types.Mixed, 
      ref: 'NavigationItem', 
      default: null 
    },
    icon: { type: String, default: '' },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    openInNewTab: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: ['PUBLIC', 'LOGGED_IN', 'ADMIN_ONLY', 'MOBILE', 'DESKTOP'],
      default: 'PUBLIC',
      uppercase: true
    },
    target: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
      default: 'PUBLISHED',
      uppercase: true
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

navigationItemSchema.index({ parentId: 1, order: 1 });
navigationItemSchema.index({ isActive: 1, order: 1 });
navigationItemSchema.index({ status: 1 });
navigationItemSchema.index({ slug: 1 });
navigationItemSchema.index({ type: 1 });
navigationItemSchema.index({ visibility: 1 });

export default mongoose.models.NavigationItem || mongoose.model('NavigationItem', navigationItemSchema);
