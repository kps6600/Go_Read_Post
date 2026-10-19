import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true
    },
    subtitle: {
      type: String,
      trim: true,
      default: ''
    },
    summary: {
      type: String,
      trim: true,
      default: ''
    },
    slug: {
      type: String,
      trim: true,
      index: true
    },
    brand: {
      type: String,
      default: 'GoReadPost'
    },
    category: {
      type: String,
      default: 'all',
      index: true
    },
    categoryTag: {
      type: String,
      default: 'Editorial'
    },
    tag: {
      type: String,
      default: 'LATEST'
    },
    image: {
      type: String,
      required: [true, 'Featured image URL is required']
    },
    fallbackImage: {
      type: String,
      default: ''
    },
    author: {
      name: { type: String, default: 'Editorial Desk' },
      title: { type: String, default: 'Staff Reporter' },
      avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' }
    },
    readTime: {
      type: String,
      default: '4 min read'
    },
    publishedAt: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    content: {
      type: [String],
      default: []
    },
    contentBlocks: {
      type: Array,
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'scheduled'],
      default: 'published',
      index: true
    },
    scheduledPublishAt: {
      type: Date,
      default: null
    },
    views: {
      type: Number,
      default: 0
    },
    claps: {
      type: Number,
      default: 142
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Story || mongoose.model('Story', storySchema);
