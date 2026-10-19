import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    series: {
      type: String,
      default: 'Founders Unfiltered',
      trim: true
    },
    category: {
      type: String,
      default: 'interviews',
      trim: true
    },
    categoryLabel: {
      type: String,
      default: 'Founder Interview',
      trim: true
    },
    duration: {
      type: String,
      default: '24:00',
      trim: true
    },
    views: {
      type: mongoose.Schema.Types.Mixed,
      default: 1200
    },
    likes: {
      type: mongoose.Schema.Types.Mixed,
      default: 85
    },
    publishedAt: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    guest: {
      type: String,
      default: '',
      trim: true
    },
    guestRole: {
      type: String,
      default: '',
      trim: true
    },
    guestCompany: {
      type: String,
      default: '',
      trim: true
    },
    guestAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    guestBio: {
      type: String,
      default: ''
    },
    host: {
      type: String,
      default: 'Shradha Sharma'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80'
    },
    fallbackImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    },
    youtubeEmbedUrl: {
      type: String,
      default: 'https://www.youtube.com/embed/cKxRvEZd3Mw?autoplay=1&rel=0'
    },
    videoUrl: {
      type: String,
      default: 'https://www.youtube.com/watch?v=cKxRvEZd3Mw'
    },
    description: {
      type: String,
      default: ''
    },
    highlights: {
      type: [String],
      default: []
    },
    chapters: [
      {
        time: { type: String, default: '00:00' },
        label: { type: String, default: '' },
        summary: { type: String, default: '' }
      }
    ],
    transcript: [
      {
        speaker: { type: String, default: '' },
        time: { type: String, default: '' },
        text: { type: String, default: '' }
      }
    ],
    tags: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published'
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

videoSchema.index({ category: 1, createdAt: -1 });

export default mongoose.models.Video || mongoose.model('Video', videoSchema);
