import mongoose from 'mongoose';

// 1. Publication Schema
const publicationSchema = new mongoose.Schema(
  {
    pubId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'daily' },
    schedule: { type: String, default: 'Daily · 8:00 AM IST' },
    cadenceBadge: { type: String, default: 'DAILY BRIEFING' },
    subscribers: { type: Number, default: 142000 },
    subscribersLabel: { type: String, default: '142,000+' },
    editor: { type: String, default: 'Editorial Bureau' },
    openRate: { type: String, default: '52.4%' },
    color: { type: String, default: '#e11d48' },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    latestIssue: {
      number: { type: String, default: '#101' },
      date: { type: String, default: 'Today' },
      title: { type: String, default: '' },
      snippet: { type: String, default: '' },
      readingTime: { type: String, default: '4 min read' },
      author: { type: String, default: 'Editorial Bureau' },
      tags: [{ type: String }],
      fullContent: [{ type: String }]
    }
  },
  { timestamps: true }
);

// 2. Dispatch (Issue) Schema
const dispatchSchema = new mongoose.Schema(
  {
    dispatchId: { type: String, required: true, unique: true, trim: true },
    publicationId: { type: String, required: true, trim: true },
    publicationName: { type: String, required: true, trim: true },
    issueNumber: { type: Number, default: 1 },
    date: { type: String, default: 'Today' },
    publishedAt: { type: Date, default: Date.now },
    readTime: { type: String, default: '4 min read' },
    subject: { type: String, required: true, trim: true },
    teaser: { type: String, default: '' },
    tags: [{ type: String }],
    openRate: { type: String, default: '51.4%' },
    delivered: { type: Number, default: 142000 },
    badge: { type: String, default: 'Latest Issue' },
    fullContent: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'published' }
  },
  { timestamps: true }
);

// 3. Subscriber Schema
const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    publications: [{ type: String }],
    status: { type: String, enum: ['Active', 'Unsubscribed', 'Paused'], default: 'Active' },
    source: { type: String, default: 'newsletter_page' },
    subscribedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Publication = mongoose.models.Publication || mongoose.model('Publication', publicationSchema);
export const Dispatch = mongoose.models.Dispatch || mongoose.model('Dispatch', dispatchSchema);
export const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);
