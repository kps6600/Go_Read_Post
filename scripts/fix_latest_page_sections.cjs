const fs = require('fs');
const path = require('path');
const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));

async function fixLatestPage() {
  // 1. Update pages_data_store.json
  const storePath = path.resolve(__dirname, '../backend/pages_data_store.json');
  if (fs.existsSync(storePath)) {
    const raw = fs.readFileSync(storePath, 'utf8');
    const pages = JSON.parse(raw);
    const latestPage = pages.find(p => p.id === 'latest' || p.slug === 'latest');
    if (latestPage) {
      latestPage.sections = [
        {
          id: "latest_feed",
          sectionKey: "latest_feed",
          type: "stories_feed",
          order: 1,
          enabled: true,
          title: "Latest Articles Feed",
          data: {
            title: "Latest Articles",
            heading: "Latest Articles",
            subtitle: "Chronological reporting, breaking investigations, venture intelligence, and real-time newsroom dispatches.",
            category: "",
            limit: 16,
            viewAllText: "Load More Stories",
            viewAllUrl: "/latest"
          }
        },
        {
          id: "newsletter",
          sectionKey: "newsletter",
          type: "newsletter",
          order: 2,
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
      ];
      fs.writeFileSync(storePath, JSON.stringify(pages, null, 2), 'utf8');
      console.log('Updated backend/pages_data_store.json for latest page.');
    }
  }

  // 2. Update MongoDB if connected
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goreadpost';
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB.');

    const PageSchema = new mongoose.Schema({}, { strict: false });
    const Page = mongoose.models.Page || mongoose.model('Page', PageSchema, 'pages');

    const updated = await Page.findOneAndUpdate(
      { $or: [{ id: 'latest' }, { slug: 'latest' }] },
      {
        $set: {
          title: "Latest Articles",
          slug: "latest",
          description: "Chronological reporting, breaking investigations, venture intelligence, and real-time newsroom dispatches.",
          status: "published",
          sections: [
            {
              id: "latest_feed",
              sectionKey: "latest_feed",
              type: "stories_feed",
              order: 1,
              enabled: true,
              title: "Latest Articles Feed",
              data: {
                title: "Latest Articles",
                heading: "Latest Articles",
                subtitle: "Chronological reporting, breaking investigations, venture intelligence, and real-time newsroom dispatches.",
                category: "",
                limit: 16,
                viewAllText: "Load More Stories",
                viewAllUrl: "/latest"
              }
            },
            {
              id: "newsletter",
              sectionKey: "newsletter",
              type: "newsletter",
              order: 2,
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
        }
      },
      { new: true, upsert: true }
    );
    console.log('Successfully updated MongoDB Page "latest":', updated ? 'OK' : 'FAIL');
    await mongoose.disconnect();
  } catch (err) {
    console.warn('MongoDB update skipped or failed:', err.message);
  }
}

fixLatestPage();
