import mongoose from 'mongoose';
import Story from '../server/models/Story.js';
import { ALL_HER_STORIES, HER_STORY_PROFILES } from '../src/data/herStoryData.js';

mongoose.connect('mongodb://127.0.0.1:27017/goreadpost').then(async () => {
  console.log('Checking HerStory profiles:');
  for (const [k, s] of Object.entries(HER_STORY_PROFILES || {})) {
    const existing = await Story.findOne({ id: s.id });
    console.log(`Profile [${k}], id: ${s.id}, in DB: ${!!existing}`);
    if (!existing) {
      try {
        let image = s.heroImage;
        if (!image || typeof image !== 'string' || image.startsWith('data:')) {
          image = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80';
        }
        await Story.create({
          id: s.id,
          title: s.title || s.mainHeadline,
          subtitle: s.subtitle || s.heroSubheading || '',
          summary: s.subtitle || s.title,
          slug: s.id,
          brand: 'HerStory',
          category: 'herstory',
          categoryTag: s.category || 'Women in Business',
          tag: 'HERSTORY',
          image,
          author: {
            name: typeof s.author === 'string' ? s.author : 'Rekha Balakrishnan',
            title: s.role || 'Senior Features Writer, HerStory',
            avatar: s.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80'
          },
          readTime: s.readTime || '4 min read',
          publishedAt: s.date || 'Oct 2026',
          status: 'published',
          views: 3200,
          claps: 210
        });
        console.log(`  -> Inserted ${s.id}`);
      } catch (err) {
        console.error(`  -> Failed ${s.id}:`, err.message);
      }
    }
  }
  const count = await Story.countDocuments({ brand: 'HerStory' });
  console.log('Total HerStory in DB now:', count);
  await mongoose.disconnect();
});
