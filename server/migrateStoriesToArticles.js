import { connectDB } from './db.js';
import Story from './models/Story.js';
import Article from './models/Article.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrateStoriesToArticles() {
  await connectDB();
  const stories = await Story.find();
  console.log('Total stories in DB:', stories.length);

  let inserted = 0;
  let skipped = 0;

  for (const s of stories) {
    const sSlug = s.slug || s.id || s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Article.findOne({
      $or: [{ slug: sSlug }, { title: s.title }]
    });

    if (existing) {
      skipped++;
      continue;
    }

    const contentStr = Array.isArray(s.content) ? s.content.join('\n\n') : (s.content || '');
    const imageUrl = s.image || s.fallbackImage || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80';

    await Article.create({
      title: s.title,
      slug: sSlug,
      subtitle: s.subtitle || '',
      excerpt: s.summary || s.subtitle || (contentStr.slice(0, 160) + '...'),
      content: contentStr,
      featuredImage: {
        url: imageUrl,
        alt: s.title,
        caption: '',
        credit: s.brand || 'GoReadPost'
      },
      authorName: s.author?.name || 'Editorial Desk',
      authorTitle: s.author?.title || 'Staff Reporter',
      authorAvatar: s.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      categoryName: s.categoryTag || s.category || 'Startups',
      tags: Array.isArray(s.tags) ? s.tags : (s.tags ? s.tags.split(',').map(t => t.trim()) : ['startups']),
      topics: [s.categoryTag || s.category || 'Startups'],
      contentType: 'article',
      readingTime: s.readTime || '4 min read',
      language: s.category === 'hindi' ? 'Hindi' : 'English',
      location: 'India',
      isFeatured: Boolean(s.isFeatured || s.tag === 'FEATURED'),
      isTrending: Boolean(s.tag === 'TRENDING'),
      isBreaking: Boolean(s.tag === 'BREAKING'),
      status: s.status || 'published',
      publishedAt: s.createdAt || new Date(),
      views: s.views || Math.floor(Math.random() * 2000) + 200,
      claps: s.claps || 50
    });
    inserted++;
  }

  const finalArticleCount = await Article.countDocuments();
  console.log(`Migration complete! Inserted: ${inserted}, Skipped: ${skipped}, Total Articles in DB: ${finalArticleCount}`);

  // Sync to fallback articles store
  const allArticles = await Article.find().lean();
  const fallbackArticlesPath = path.join(__dirname, 'articles_data_store.json');
  fs.writeFileSync(fallbackArticlesPath, JSON.stringify(allArticles, null, 2), 'utf-8');
  console.log('Synchronized to fallback articles store:', fallbackArticlesPath);
}

// Run directly if called as a script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateStoriesToArticles()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
