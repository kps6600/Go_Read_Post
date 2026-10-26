import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    parentId: { type: mongoose.Schema.Types.Mixed, ref: 'Category', default: null },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

categorySchema.index({ parentId: 1, order: 1 });

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
