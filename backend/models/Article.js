import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    subtitle: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    contentBlocks: { type: Array, default: [] },
    featuredImage: {
      url: { type: String, default: '' },
      alt: { type: String, default: '' },
      caption: { type: String, default: '' },
      credit: { type: String, default: '' }
    },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', default: null },
    authorName: { type: String, default: 'Editorial Desk' },
    authorTitle: { type: String, default: 'Senior Staff Reporter' },
    authorAvatar: { type: String, default: '' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    categoryName: { type: String, default: 'Startups' },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    topicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    tags: [{ type: String }],
    topics: [{ type: String }],
    contentType: { 
      type: String, 
      enum: ['news', 'article', 'interview', 'opinion', 'analysis', 'report', 'press_release'], 
      default: 'article' 
    },
    readingTime: { type: String, default: '4 min read' },
    language: { type: String, default: 'English' },
    location: { type: String, default: 'Bengaluru / India' },
    isFeatured: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isEditorsPick: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['draft', 'in_review', 'scheduled', 'published', 'archived'], 
      default: 'published' 
    },
    publishedAt: { type: Date, default: Date.now },
    scheduledAt: { type: Date, default: null },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
      ogTitle: { type: String, default: '' },
      ogDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' }
    },
    views: { type: Number, default: 0 },
    claps: { type: Number, default: 0 }
  },
  { timestamps: true }
);

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ isFeatured: 1 });
articleSchema.index({ isTrending: 1 });
articleSchema.index({ categoryName: 1 });

export default mongoose.models.Article || mongoose.model('Article', articleSchema);
