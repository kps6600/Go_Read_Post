import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goreadpost';
const fallbackFilePath = path.join(__dirname, 'pages_data_store.json');

// Exactly the 5 sections requested
const ONLY_5_HOMEPAGE_SECTIONS = [
  {
    id: 'hero_popular',
    type: 'hero',
    order: 1,
    enabled: true,
    data: {
      title: 'Lead Stories & Editorial Hero Slider',
      heading: 'Lead Stories & Editorial Hero Slider',
      headline: 'Bootstrapping ₹12 Cr organic skincare from a single kitchen stove',
      subheadline: 'How Rekha Sharma turned a ₹500 grocery investment into an 800-store distribution powerhouse.',
      badge: 'Startups',
      primaryBtnText: 'Read More',
      primaryBtnUrl: '/latest',
      popularTitle: 'Popular Posts',
      showPopular: true,
      popularLimit: 5,
      heroSource: 'custom',
      bgImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
      slides: [
        {
          id: 'hero-slide-1',
          title: 'Bootstrapping ₹12 Cr organic skincare from a single kitchen stove',
          excerpt: 'How Rekha Sharma turned a ₹500 grocery investment into an 800-store distribution powerhouse.',
          category: 'Startups',
          image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
          author: 'Editorial Bureau',
          date: 'Today',
          readTime: '4 min read',
          primaryBtnText: 'Read More',
          link: '/latest',
          isCustom: true
        }
      ],
      popularArticles: [
        {
          title: "टेकस्पार्क्स 2024: 'द न्यू टेक ऑर्डर' की थीम पर बेंगलुरु में सजेगा भारत के सबसे बड़े टेक-स्टार्टअप महाकुंभ का मंच",
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80',
          readTime: '5 min read',
          category: 'Trending',
          slug: 'techsparks-2024-bengaluru'
        },
        {
          title: 'Bootstrapping ₹12 Cr organic skincare from a single kitchen stove',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80',
          readTime: '5 min read',
          category: 'Trending',
          slug: 'sim-8'
        },
        {
          title: 'Solar Sisters: Electrifying 40 off-grid tribal hamlets in Rajasthan',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80',
          readTime: '6 min read',
          category: 'Trending',
          slug: 'sim-7'
        },
        {
          title: 'How a mobile bicycle library is educating 5,000 rural girls in Bihar',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80',
          readTime: '4 min read',
          category: 'Trending',
          slug: 'sim-6'
        },
        {
          title: 'His software is inside your router. Now he wants it inside much smaller things',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80',
          readTime: '8 min read',
          category: 'Trending',
          slug: 'lead-5'
        }
      ]
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
      viewAllText: 'View All Articles',
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
      viewAllText: 'View All Trending',
      viewAllUrl: '/trending'
    }
  },
  {
    id: 'spotlight',
    type: 'spotlight',
    order: 4,
    enabled: true,
    data: {
      title: 'Tech & Startup Spotlight',
      heading: 'Tech & Startup Spotlight',
      subtitle: 'Deep tech breakthroughs, generative AI, and emerging ventures',
      category: 'Technology',
      badgeText: 'DEEPTECH FOCUS',
      limit: 6,
      viewAllText: 'Explore Startups',
      viewAllUrl: '/category/technology'
    }
  },
  {
    id: 'newsletter',
    type: 'newsletter',
    order: 5,
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

async function sync() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // 1. Update pages collection (home page)
    const pagesCol = db.collection('pages');
    const pageUpdate = await pagesCol.updateOne(
      { id: 'home' },
      { 
        $set: { 
          sections: ONLY_5_HOMEPAGE_SECTIONS,
          status: 'published'
        } 
      },
      { upsert: true }
    );
    console.log('Updated pages collection (5 sections):', pageUpdate.matchedCount, pageUpdate.modifiedCount);

    // 2. Prune and sync homepagesections collection
    const homeSectionsCol = db.collection('homepagesections');
    await homeSectionsCol.deleteMany({
      sectionKey: { $nin: ['hero_popular', 'latest_blogs', 'trending', 'spotlight', 'newsletter'] }
    });

    for (const sec of ONLY_5_HOMEPAGE_SECTIONS) {
      await homeSectionsCol.updateOne(
        { sectionKey: sec.id },
        {
          $set: {
            sectionKey: sec.id,
            title: sec.data.heading || sec.data.title,
            subtitle: sec.data.subtitle || sec.data.subheadline || '',
            enabled: sec.enabled,
            order: sec.order,
            limit: sec.data.limit || 6,
            filterCategory: sec.data.category || '',
            filterTag: ''
          }
        },
        { upsert: true }
      );
    }
    console.log('Updated homepagesections collection with 5 sections.');

    // 3. Update fallback JSON file
    if (fs.existsSync(fallbackFilePath)) {
      try {
        const raw = fs.readFileSync(fallbackFilePath, 'utf8');
        const list = JSON.parse(raw);
        const homeIdx = list.findIndex(p => p.id === 'home' || p.slug === '');
        if (homeIdx >= 0) {
          list[homeIdx].sections = ONLY_5_HOMEPAGE_SECTIONS;
          fs.writeFileSync(fallbackFilePath, JSON.stringify(list, null, 2), 'utf8');
          console.log('Updated pages_data_store.json file with 5 sections.');
        }
      } catch (e) {
        console.error('Error updating fallback JSON:', e.message);
      }
    }

    await mongoose.disconnect();
    console.log('Successfully configured exactly 5 homepage sections!');
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
}

sync();
