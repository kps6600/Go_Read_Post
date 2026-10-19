import { connectDB } from './db.js';
import HomepageSection, { DEFAULT_HOMEPAGE_SECTIONS } from './models/Homepage.js';

async function syncOrder() {
  await connectDB();
  console.log('Connected to MongoDB. Updating homepage sections...');
  for (const s of DEFAULT_HOMEPAGE_SECTIONS) {
    await HomepageSection.findOneAndUpdate(
      { sectionKey: s.sectionKey },
      { 
        $set: { 
          order: s.order, 
          title: s.title, 
          subtitle: s.subtitle, 
          limit: s.limit,
          filterCategory: s.filterCategory || '',
          filterTag: s.filterTag || ''
        } 
      },
      { upsert: true, new: true }
    );
  }
  const all = await HomepageSection.find().sort({ order: 1 });
  console.log('UPDATED HOMEPAGE SECTIONS:');
  all.forEach(sec => {
    console.log(`[Order ${sec.order}] ${sec.sectionKey}: "${sec.title}" (Limit: ${sec.limit})`);
  });
  process.exit(0);
}

syncOrder().catch(err => {
  console.error('Error syncing homepage sections:', err);
  process.exit(1);
});
