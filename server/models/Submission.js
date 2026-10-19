import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['pitch', 'contact', 'lead'],
      default: 'pitch',
      index: true
    },
    // Pitch fields
    startupName: {
      type: String,
      trim: true,
      default: ''
    },
    founderName: {
      type: String,
      trim: true,
      default: ''
    },
    founderRole: {
      type: String,
      trim: true,
      default: 'Founder & CEO'
    },
    sector: {
      type: String,
      trim: true,
      default: 'AI & Deep Tech'
    },
    stage: {
      type: String,
      trim: true,
      default: 'Seed / Early Stage'
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    metricMoat: {
      type: String,
      trim: true,
      default: ''
    },
    headline: {
      type: String,
      trim: true,
      default: ''
    },
    summary: {
      type: String,
      trim: true,
      default: ''
    },
    details: {
      type: String,
      default: ''
    },

    // Contact / Lead fields
    name: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    subject: {
      type: String,
      trim: true,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'published', 'archived', 'rejected'],
      default: 'pending',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    convertedArticleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null
    }
  },
  {
    timestamps: true
  }
);

submissionSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
