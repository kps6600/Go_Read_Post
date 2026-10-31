import mongoose from 'mongoose';

const homepageSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    limit: { type: Number, default: 10 },
    articleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    filterCategory: { type: String, default: '' },
    filterTag: { type: String, default: '' },
    customConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true, strict: false }
);

homepageSectionSchema.index({ order: 1 });

export const DEFAULT_HOMEPAGE_SECTIONS = [
  {
    sectionKey: 'hero_popular',
    title: 'Hero Section - Lead Stories & Popular Posts',
    subtitle: 'Primary hero editorial slider & top 5 ranked sidebar',
    enabled: true,
    order: 1,
    limit: 5,
    customConfig: {
      viewAllText: 'View All',
      viewAllUrl: '/trending',
      autoSlide: true
    }
  },
  {
    sectionKey: 'latest_blogs',
    title: 'Latest from the Blog',
    subtitle: '',
    enabled: true,
    order: 2,
    limit: 10,
    customConfig: {
      viewAllText: 'View All Articles',
      viewAllUrl: '/latest'
    }
  },
  {
    sectionKey: 'trending',
    title: 'Trending Now',
    subtitle: 'High-velocity stories capturing builder attention',
    enabled: true,
    order: 3,
    limit: 10,
    customConfig: {
      viewAllText: 'View All Trending',
      viewAllUrl: '/trending'
    }
  },
  {
    sectionKey: 'popular_editors',
    title: "Most Popular & Editor's Picks",
    subtitle: 'Essential reads handpicked by newsroom editors',
    enabled: true,
    order: 4,
    limit: 10,
    customConfig: {
      badgeText: "Editor's Choice",
      viewAllText: 'Explore Popular',
      viewAllUrl: '/category/startups'
    }
  },
  {
    sectionKey: 'spotlight',
    title: 'Tech & Startup Spotlight',
    subtitle: 'Deep tech, generative AI, and emerging ventures',
    enabled: true,
    order: 5,
    limit: 10,
    filterCategory: 'Technology',
    customConfig: {
      badgeText: 'Spotlight',
      viewAllText: 'Explore Startups',
      viewAllUrl: '/category/technology'
    }
  },
  {
    sectionKey: 'newsletter',
    title: 'Newsletter Subscription Banner',
    subtitle: 'Get the Latest Blogs Delivered to Your Inbox',
    enabled: true,
    order: 6,
    customConfig: {
      headline: 'Get the Latest Blogs Delivered to Your Inbox',
      buttonText: 'Subscribe',
      badgeText: 'DAILY BRIEF'
    }
  }
];

export default mongoose.models.HomepageSection || mongoose.model('HomepageSection', homepageSectionSchema);
