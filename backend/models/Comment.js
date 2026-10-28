import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    storySlug: {
      type: String,
      required: [true, 'Story slug or identifier is required'],
      trim: true,
      index: true
    },
    contentType: {
      type: String,
      enum: ['article', 'video'],
      default: 'article',
      index: true
    },
    contentTitle: {
      type: String,
      default: '',
      trim: true
    },
    videoId: {
      type: String,
      default: null,
      index: true
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    userEmail: {
      type: String,
      default: ''
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true
    },
    adminReply: {
      text: { type: String, default: '' },
      author: { type: String, default: 'Editorial Desk' },
      repliedAt: { type: Date, default: null }
    },
    rejection_reason: {
      type: String,
      default: ''
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      default: 'Reader Contributor'
    },
    role: {
      type: String,
      trim: true,
      default: 'Community Member'
    },
    text: {
      type: String,
      required: [true, 'Comment perspective text is required'],
      trim: true
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'pending_review', 'rejected', 'hidden'],
      default: 'approved',
      index: true
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ storySlug: 1, createdAt: -1 });
commentSchema.index({ contentType: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);

