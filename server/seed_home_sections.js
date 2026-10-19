import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goreadpost';

const defaultSections = [
  {
    id: 'hero_popular',
    type: 'hero',
    order: 1,
    enabled: true,
    data: {
      title: 'Lead Stories & Popular Posts',
      heading: 'Lead Stories & Editorial Hero Slider',
      headline: 'Stories That Matter in Indian & Global Startups',
      subheadline: 'Unfiltered founder playbooks, deep tech breakthroughs, and market movements.',
      badge: 'HEADLINE STORIES',
      primaryBtnText: 'Read More',
      primaryBtnUrl: '/latest',
      popularTitle: 'Popular Posts'
    }
  },
  {
    id: 'latest_blogs',
    type: 'stories_feed',
    order: 2,
    enabled: true,
    data: {
      title: 'Latest from the Blog',
      heading: 'Latest from the Blog',
      subtitle: 'Real-time reporting and latest editorial dispatches across the ecosystem',
      category: '',
      limit: 6,
      viewAllText: 'View All',
      viewAllUrl: '/latest'
    }
  },
  {
    id: 'trending',
    type: 'trending',
    order: 3,
    enabled: true,
    data: {
      title: 'Trending Now',
      heading: 'Trending Now',
      subtitle: 'High-velocity stories capturing builder attention and social virality',
      limit: 6,
      viewAllUrl: '/trending'
    }
  },
  {
    id: 'popular_editors',
    type: 'stories_feed',
    order: 4,
    enabled: true,
    data: {
      title: "Most Popular & Editor's Picks",
      heading: "Most Popular & Editor's Picks",
      subtitle: 'Essential reads handpicked by newsroom editors',
      category: '',
      limit: 6,
      viewAllText: 'View All',
      viewAllUrl: '/trending'
    }
  },
  {
    id: 'spotlight',
    type: 'spotlight',
    order: 5,
    enabled: true,
    data: {
      title: 'Tech & Startup Spotlight',
      heading: 'Tech & Startup Spotlight',
      subtitle: 'Deep tech breakthroughs, generative AI, and emerging ventures',
      category: 'Technology',
      badgeText: 'DEEPTECH FOCUS',
      limit: 6,
      viewAllUrl: '/category/technology'
    }
  },
  {
    id: 'newsletter',
    type: 'newsletter',
    order: 6,
    enabled: true,
    data: {
      title: 'Newsletter Subscription Banner',
      heading: 'Newsletter Subscription Banner',
      headline: 'Get the Latest Blogs Delivered to Your Inbox',
      subtitle: 'Join 100,000+ founders and engineers receiving our daily intelligence briefs.',
      buttonText: 'Subscribe',
      placeholder: 'Enter your email address'
    }
  }
];

async function seed() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('pages');
  const res = await col.updateOne(
    { id: 'home' },
    { $set: { sections: defaultSections, status: 'published' } }
  );
  console.log('Update result:', res.matchedCount, res.modifiedCount);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
