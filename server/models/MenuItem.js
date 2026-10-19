import mongoose from 'mongoose';

const dropdownItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  categoryId: { type: String, default: '' },
  query: { type: String, default: '' },
  url: { type: String, default: '' },
  action: { type: String, default: '' },
  scrollId: { type: String, default: '' }
}, { _id: false });

const dropdownColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [dropdownItemSchema]
}, { _id: false });

const menuItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ['category', 'page', 'link', 'anchor'], default: 'category' },
    target: { type: String, default: '' },
    hasDropdown: { type: Boolean, default: false },
    isBadge: { type: Boolean, default: false },
    badgeText: { type: String, default: '' },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    dropdownColumns: [dropdownColumnSchema]
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
