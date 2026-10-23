import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, isDbConnected } from './db.js';
import Article from './models/Article.js';
import storiesRouter from './routes/stories.js';
import menuRouter from './routes/menu.js';
import navigationRouter, { adminNavigationRouter } from './routes/navigation.js';
import articlesRouter, { adminArticlesRouter } from './routes/articles.js';
import taxonomyRouter from './routes/taxonomy.js';
import pagesRouter from './routes/pages.js';
import authRouter, { ensureDefaultAdmin } from './routes/auth.js';
import usersRouter from './routes/users.js';
import homepageRouter, { adminHomepageRouter } from './routes/homepage.js';
import footerRouter, { adminFooterRouter } from './routes/footer.js';
import analyticsRouter from './routes/analytics.js';
import searchRouter from './routes/search.js';
import settingsRouter from './routes/settings.js';
import mediaRouter from './routes/media.js';
import newslettersRouter from './routes/newsletters.js';
import commentsRouter, { adminCommentsRouter } from './routes/comments.js';
import videosRouter, { adminVideosRouter, ensureVideosSeeded } from './routes/videos.js';
import submissionsRouter, { adminSubmissionsRouter, ensureSubmissionsSeeded } from './routes/submissions.js';
import { migrateStoriesToArticles } from './migrateStoriesToArticles.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads folder for uploaded images & media
app.use('/uploads', express.static(uploadsDir));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GoReadPost CMS Express API'
  });
});

app.post('/api/client-error-log', (req, res) => {
  console.error('🔴 CLIENT ERROR LOGGED:', JSON.stringify(req.body, null, 2));
  try {
    fs.appendFileSync(path.join(__dirname, '..', 'scratch', 'client_errors.log'), JSON.stringify(req.body, null, 2) + '\n---\n');
  } catch (e) {}
  res.json({ ok: true });
});

// Mounted API Routes
app.use('/api/auth', authRouter);
app.use('/api/admin/users', usersRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/admin/navigation', adminNavigationRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/admin/articles', adminArticlesRouter);
app.use('/api/homepage', homepageRouter);
app.use('/api/admin/homepage', adminHomepageRouter);
app.use('/api/footer', footerRouter);
app.use('/api/admin/footer', adminFooterRouter);
app.use('/api/admin/analytics', analyticsRouter);
app.use('/api/search', searchRouter);
app.use('/api', taxonomyRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/newsletters', newslettersRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/admin/comments', adminCommentsRouter);
app.use('/api/videos', videosRouter);
app.use('/api/admin/videos', adminVideosRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin/submissions', adminSubmissionsRouter);

// Dynamic XML Sitemap for SEO & Search Engine Crawlers
app.get(['/sitemap.xml', '/api/sitemap.xml'], async (req, res) => {
  try {
    const baseUrl = process.env.SITE_URL || 'https://goreadpost.com';
    let articles = [];

    if (isDbConnected()) {
      articles = await Article.find({ 
        status: 'published',
        publishedAt: { $lte: new Date() }
      }).select('slug updatedAt publishedAt').lean();
    } else {
      const fallbackPath = path.join(__dirname, 'articles_data_store.json');
      if (fs.existsSync(fallbackPath)) {
        const list = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        articles = list.filter(a => a.status === 'published');
      }
    }

    const staticRoutes = [
      '',
      '/latest',
      '/trending',
      '/categories',
      '/about',
      '/contact',
      '/advertise',
      '/videos'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const r of staticRoutes) {
      xml += `  <url>\n    <loc>${baseUrl}${r}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${r === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }

    // Published articles only (drafts & scheduled posts are strictly excluded)
    for (const art of articles) {
      const lastMod = new Date(art.updatedAt || art.publishedAt || Date.now()).toISOString();
      xml += `  <url>\n    <loc>${baseUrl}/blog/${art.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Start Server immediately so port 5000 is open without waiting for DB/migrations
app.listen(PORT, () => {
  console.log(`🚀 Express Server running on http://localhost:${PORT}`);
  console.log(`📡 Articles API active at http://localhost:${PORT}/api/articles`);
  console.log(`🗺️ Sitemap active at http://localhost:${PORT}/sitemap.xml`);
  console.log(`🧭 Navigation API active at http://localhost:${PORT}/api/navigation`);
  console.log(`🏠 Homepage CMS API active at http://localhost:${PORT}/api/homepage`);
  console.log(`📺 Videos API active at http://localhost:${PORT}/api/videos`);
  console.log(`📬 Submissions (Pitches) API active at http://localhost:${PORT}/api/submissions`);
  console.log(`💬 Comments Moderation API active at http://localhost:${PORT}/api/admin/comments`);
  console.log(`🔍 Search API active at http://localhost:${PORT}/api/search`);
  console.log(`📊 Analytics API active at http://localhost:${PORT}/api/admin/analytics`);
  console.log(`👥 Users API active at http://localhost:${PORT}/api/admin/users`);
  console.log(`🔐 Auth API active at http://localhost:${PORT}/api/auth`);
  console.log(`🖼️ Media API active at http://localhost:${PORT}/api/media`);
});

// Perform database connection and seeding asynchronously in background
(async function initDatabase() {
  try {
    await connectDB();
    await ensureDefaultAdmin();
    await migrateStoriesToArticles();
    await ensureVideosSeeded();
    await ensureSubmissionsSeeded();

    // Reliable Scheduled Publication Background Worker
    setInterval(async () => {
      try {
        if (isDbConnected()) {
          const now = new Date();
          const dueArticles = await Article.find({
            status: 'scheduled',
            scheduledAt: { $lte: now }
          });

          for (const art of dueArticles) {
            art.status = 'published';
            art.publishedAt = now;
            await art.save();
            console.log(`⏰ Scheduled article published automatically: "${art.title}" (${art.slug})`);
          }
        }
      } catch (err) {
        console.warn('Scheduled publisher worker error:', err?.message);
      }
    }, 30000); // Poll every 30 seconds
  } catch (err) {
    console.error('Database initialization warning:', err?.message || err);
  }
})();

