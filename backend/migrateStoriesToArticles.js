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

  let inserted = 0;
  let skipped = 0;

  // 1. Seed from fallback articles store (articles_data_store.json)
  const fallbackArticlesPath = path.join(__dirname, 'articles_data_store.json');
  if (fs.existsSync(fallbackArticlesPath)) {
    try {
      const raw = fs.readFileSync(fallbackArticlesPath, 'utf-8');
      const fallbackArticles = JSON.parse(raw);
      if (Array.isArray(fallbackArticles) && fallbackArticles.length > 0) {
        console.log(`Checking ${fallbackArticles.length} fallback articles from articles_data_store.json...`);
        for (const art of fallbackArticles) {
          const artSlug = art.slug || (art.title ? art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`);
          
          const existing = await Article.findOne({
            $or: [{ slug: artSlug }, { title: art.title }]
          });

          if (existing) {
            skipped++;
            continue;
          }

          let imgUrl = '';
          if (typeof art.featuredImage === 'string') {
            imgUrl = art.featuredImage;
          } else if (art.featuredImage && typeof art.featuredImage === 'object') {
            imgUrl = art.featuredImage.url || '';
          }
          if (!imgUrl && art.image) imgUrl = art.image;
          if (!imgUrl) imgUrl = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80';

          const contentStr = Array.isArray(art.content) ? art.content.join('\n\n') : (art.content || '');

          await Article.create({
            title: art.title,
            slug: artSlug,
            subtitle: art.subtitle || '',
            excerpt: art.excerpt || art.subtitle || (contentStr.slice(0, 160) + '...'),
            content: contentStr,
            featuredImage: {
              url: imgUrl,
              alt: art.title,
              caption: '',
              credit: art.credit || art.brand || 'GoReadPost'
            },
            authorName: art.authorName || (typeof art.author === 'object' ? art.author?.name : art.author) || 'Editorial Desk',
            authorTitle: art.authorTitle || (typeof art.author === 'object' ? art.author?.title : '') || 'Senior Staff Reporter',
            authorAvatar: art.authorAvatar || (typeof art.author === 'object' ? art.author?.avatar : '') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
            categoryName: art.categoryName || art.categoryLabel || art.category || 'Startups',
            tags: Array.isArray(art.tags) ? art.tags : (art.tags ? art.tags.split(',').map(t => t.trim()) : ['startups']),
            topics: Array.isArray(art.topics) ? art.topics : [art.categoryName || 'Startups'],
            contentType: art.contentType || 'article',
            readingTime: art.readingTime || art.readTime || '4 min read',
            language: art.language || (art.category === 'hindi' ? 'Hindi' : 'English'),
            location: art.location || 'India',
            isFeatured: Boolean(art.isFeatured || art.tag === 'FEATURED'),
            isTrending: Boolean(art.isTrending || art.tag === 'TRENDING'),
            isBreaking: Boolean(art.isBreaking || art.tag === 'BREAKING'),
            isEditorsPick: Boolean(art.isEditorsPick || art.tag === "EDITOR'S PICK"),
            status: 'published',
            publishedAt: art.publishedAt || art.createdAt || new Date(),
            views: art.views || Math.floor(Math.random() * 2000) + 200,
            claps: art.claps || 50
          });
          inserted++;
        }
      }
    } catch (e) {
      console.error('Error importing fallback articles:', e);
    }
  }

  // 2. Also import from data_store.json
  const storiesFilePath = path.join(__dirname, 'data_store.json');
  if (fs.existsSync(storiesFilePath)) {
    try {
      const rawStories = fs.readFileSync(storiesFilePath, 'utf-8');
      const fileStories = JSON.parse(rawStories);
      if (Array.isArray(fileStories)) {
        for (const s of fileStories) {
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
            categoryName: s.categoryTag || s.categoryLabel || s.category || 'Startups',
            tags: Array.isArray(s.tags) ? s.tags : (s.tags ? s.tags.split(',').map(t => t.trim()) : ['startups']),
            topics: [s.categoryTag || s.category || 'Startups'],
            contentType: 'article',
            readingTime: s.readTime || '4 min read',
            language: s.category === 'hindi' ? 'Hindi' : 'English',
            location: 'India',
            isFeatured: Boolean(s.isFeatured || s.tag === 'FEATURED'),
            isTrending: Boolean(s.tag === 'TRENDING'),
            isBreaking: Boolean(s.tag === 'BREAKING'),
            status: 'published',
            publishedAt: s.publishedAt || s.createdAt || new Date(),
            views: s.views || Math.floor(Math.random() * 2000) + 200,
            claps: s.claps || 50
          });
          inserted++;
        }
      }
    } catch (e) {
      console.error('Error importing file stories to articles:', e);
    }
  }

  const finalArticleCount = await Article.countDocuments();
  console.log(`Migration complete! Inserted: ${inserted}, Skipped: ${skipped}, Total Articles in DB: ${finalArticleCount}`);
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
