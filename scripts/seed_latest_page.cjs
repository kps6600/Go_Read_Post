const fs = require('fs');
const path = require('path');
const mongoose = require('../backend/node_modules/mongoose');

const storePath = path.join(__dirname, '..', 'backend', 'pages_data_store.json');
let storeData = [];
try {
  storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
} catch (e) {
  storeData = [];
}

const latestPageObj = {
  id: "latest",
  title: "Latest Articles",
  slug: "latest",
  brand: "GoReadPost",
  description: "Chronological reporting, breaking investigations, venture intelligence, and real-time newsroom dispatches.",
  heroHeadline: "Latest Articles & Dispatches",
  heroSubhead: "Unfiltered founder reporting, deep tech breakthroughs, and market movements updated continuously.",
  heroBanner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80",
  status: "published",
  showInNav: true,
  order: 2,
  seo: {
    title: "Latest Articles & Newsroom Dispatches | GoReadPost",
    description: "Real-time dispatches, founder stories, deeptech, venture capital reporting, and latest scoops.",
    keywords: ["latest articles", "breaking news", "startups", "technology", "venture capital"]
  },
  sections: [
    {
      id: "latest_hero",
      sectionKey: "latest_hero",
      type: "hero",
      order: 1,
      enabled: true,
      title: "Hero Section - Latest Articles & Dispatches",
      data: {
        badge: "REAL-TIME DISPATCHES",
        heading: "Latest Articles & Dispatches",
        title: "Latest Articles & Dispatches",
        headline: "Latest Articles & Dispatches",
        subheadline: "Real-time reporting, founder interviews, and high-velocity stories across India and the global startup ecosystem.",
        subtitle: "Real-time reporting, founder interviews, and high-velocity stories across India and the global startup ecosystem.",
        popularTitle: "Top Trending Dispatches",
        primaryBtnText: "Explore Latest Feed",
        primaryBtnUrl: "#feed",
        heroSource: "auto"
      }
    },
    {
      id: "latest_feed",
      sectionKey: "latest_feed",
      type: "stories_feed",
      order: 2,
      enabled: true,
      title: "Latest from the Newsroom (Feed)",
      data: {
        title: "Latest from the Newsroom",
        heading: "Latest from the Newsroom",
        subtitle: "Chronological feed of all published dispatches, scoops, and startup breakdowns.",
        category: "",
        limit: 16,
        viewAllText: "Load More Stories",
        viewAllUrl: "/latest"
      }
    },
    {
      id: "category_startups",
      sectionKey: "category_startups",
      type: "category_startups",
      order: 3,
      enabled: true,
      title: "Category Desk: Startups & Capital",
      data: {
        title: "Category Desk: Startups & Capital",
        heading: "Category Desk: Startups & Capital",
        subtitle: "Early-stage fundraising, venture deals, term sheets, and founder dispatches.",
        category: "Startups",
        limit: 8,
        viewAllText: "Explore Startups",
        viewAllUrl: "/category/startups"
      }
    },
    {
      id: "newsletter",
      sectionKey: "newsletter",
      type: "newsletter",
      order: 4,
      enabled: true,
      title: "Newsletter Subscription Banner",
      data: {
        title: "Newsletter Subscription Banner",
        heading: "Newsletter Subscription Banner",
        headline: "Get the Latest Blogs Delivered to Your Inbox",
        subtitle: "Unfiltered insights on venture capital, frontier tech, and high-growth leadership directly in your inbox.",
        placeholder: "Enter your email address",
        buttonText: "Subscribe"
      }
    }
  ]
};

// Update pages_data_store.json
const idx = storeData.findIndex(p => p.id === 'latest' || p.slug === 'latest');
if (idx !== -1) {
  storeData[idx] = { ...storeData[idx], ...latestPageObj };
} else {
  storeData.splice(1, 0, latestPageObj);
}
fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf8');
console.log('Saved latest page to pages_data_store.json');

// Update MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/goreadpost').then(async () => {
  const collection = mongoose.connection.db.collection('pages');
  const res = await collection.updateOne(
    { $or: [{ id: 'latest' }, { slug: 'latest' }] },
    { $set: latestPageObj },
    { upsert: true }
  );
  console.log('MongoDB updateOne result:', res);
  process.exit(0);
}).catch(err => {
  console.error('MongoDB seed error:', err);
  process.exit(0);
});

