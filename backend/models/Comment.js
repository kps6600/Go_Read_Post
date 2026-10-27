import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    storySlug: {
      type: String,
      required: [true, 'Story slug or identifier is required'],
      trim: true,
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
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
      index: true
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ storySlug: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);
