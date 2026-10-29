import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    type: { type: String, default: 'image/jpeg' },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    duration: { type: String, default: '' },
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
    credit: { type: String, default: '' },
    provider: { type: String, default: 'local' },
    publicId: { type: String, default: '' },
    uploadedBy: { type: String, default: 'admin' }
  },
  { timestamps: true }
);

mediaSchema.index({ mediaType: 1 });
mediaSchema.index({ filename: 'text', altText: 'text', caption: 'text' });

export default mongoose.models.Media || mongoose.model('Media', mediaSchema);
