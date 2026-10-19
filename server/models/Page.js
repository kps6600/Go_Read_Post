import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) },
    type: { 
      type: String, 
      required: true,
      trim: true
    },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' }
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    brand: { type: String, default: 'GoReadPost' },
    description: { type: String, default: '' },
    heroHeadline: { type: String, default: '' },
    heroSubhead: { type: String, default: '' },
    heroBanner: { type: String, default: '' },
    status: { type: String, enum: ['published', 'draft', 'active', 'hidden'], default: 'draft' },
    showInNav: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
    sections: { type: [sectionSchema], default: [] },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for fast lookup
pageSchema.index({ status: 1 });
pageSchema.index({ order: 1 });

export default mongoose.models.Page || mongoose.model('Page', pageSchema);
