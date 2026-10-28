import express from 'express';
import Article from '../models/Article.js';
import Story from '../models/Story.js';
import Page from '../models/Page.js';
import { isDbConnected } from '../db.js';
import { migrateStoriesToArticles } from '../migrateStoriesToArticles.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackArticlesPath = path.join(__dirname, '..', 'articles_data_store.json');
const fallbackStoriesPath = path.join(__dirname, '..', 'data_store.json');
const fallbackPagesPath = path.join(__dirname, '..', 'pages_data_store.json');

function readFallbackArticles() {
  try {
    if (fs.existsSync(fallbackArticlesPath)) {
      const data = fs.readFileSync(fallbackArticlesPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function writeFallbackArticles(data) {
  try {
    fs.writeFileSync(fallbackArticlesPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

// Helper to keep existing Story collection / data_store.json in sync with published articles
async function syncToStories(article) {
  try {
    if (article.disabledFromFrontend || article.status !== 'published') {
      if (isDbConnected()) {
        await Story.findOneAndDelete({ $or: [{ slug: article.slug }, { title: article.title }] }).catch(() => null);
      } else if (fs.existsSync(fallbackStoriesPath)) {
        try {
          let stories = JSON.parse(fs.readFileSync(fallbackStoriesPath, 'utf-8'));
          stories = stories.filter(s => s.slug !== article.slug && s.title !== article.title);
          fs.writeFileSync(fallbackStoriesPath, JSON.stringify(stories, null, 2), 'utf-8');
        } catch (e) {}
      }
      return;
    }

    let storyImage = '';
    if (typeof article.featuredImage === 'string') {
      storyImage = article.featuredImage;
    } else if (article.featuredImage && typeof article.featuredImage === 'object') {
      let u = article.featuredImage.url;
      while (u && typeof u === 'object') {
        u = u.url || '';
      }
      storyImage = typeof u === 'string' ? u : '';
    }
    if (!storyImage && typeof article.image === 'string') {
      storyImage = article.image;
    }
    if (!storyImage) {
      storyImage = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80';
    }

    const storyPayload = {
      title: article.title,
      subtitle: article.subtitle || '',
      summary: article.excerpt || article.subtitle || '',
      brand: 'GoReadPost',
      category: (article.categoryName || 'startups').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryTag: article.categoryName || 'Startups',
      tag: article.isFeatured ? 'FEATURED' : article.isBreaking ? 'BREAKING' : article.isTrending ? 'TRENDING' : 'LATEST',
      image: storyImage,
      authorName: article.authorName || 'Editorial Desk',
      authorTitle: article.authorTitle || 'Staff Reporter',
      authorAvatar: article.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      readTime: article.readingTime || '4 min read',
      publishedAt: new Date(article.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: article.content || '',
      contentBlocks: Array.isArray(article.contentBlocks) ? article.contentBlocks : [],
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
      status: 'published',
      slug: article.slug,
      views: article.views || 0,
      claps: article.claps || 0
    };

    if (isDbConnected()) {
      await Story.findOneAndUpdate(
        { $or: [{ slug: article.slug }, { title: article.title }] },
        storyPayload,
        { upsert: true, new: true }
      );
    } else {
      let stories = [];
      if (fs.existsSync(fallbackStoriesPath)) {
        try {
          stories = JSON.parse(fs.readFileSync(fallbackStoriesPath, 'utf-8'));
        } catch (e) {}
      }
      const existingIdx = stories.findIndex(s => s.slug === article.slug || s.title === article.title);
      if (existingIdx !== -1) {
        stories[existingIdx] = { ...stories[existingIdx], ...storyPayload };
      } else {
        stories.unshift({ _id: 'story_' + article.slug, ...storyPayload });
      }
      fs.writeFileSync(fallbackStoriesPath, JSON.stringify(stories, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error syncing article to stories:', err);
  }
}

// --------------------------------------------------------------------------
// 1. PUBLIC API: GET /api/articles (Filtered, paginated, status=published)
// --------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category = '', 
      tag = '', 
      topic = '', 
      featured, 
      trending, 
      breaking 
    } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = { status: 'published', disabledFromFrontend: { $ne: true } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.$or = [
        { categoryName: { $regex: category, $options: 'i' } },
        { category: { $regex: category, $options: 'i' } }
      ];
    }
    if (tag) query.tags = { $in: [tag] };
    if (topic) query.topics = { $in: [topic] };
    if (featured === 'true' || featured === true) query.isFeatured = true;
    if (trending === 'true' || trending === true) query.isTrending = true;
    if (breaking === 'true' || breaking === true) query.isBreaking = true;

    if (isDbConnected()) {
      let count = await Article.countDocuments();
      if (count < 40) {
        try {
          await migrateStoriesToArticles();
        } catch (e) {
          console.error('Error during auto-seed in GET /api/articles:', e);
        }
      }

      const [articles, total] = await Promise.all([
        Article.find(query).sort({ publishedAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
        Article.countDocuments(query)
      ]);
      return res.json({
        success: true,
        data: articles,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10))
        }
      });
    }

    // Fallback store
    let fallback = readFallbackArticles().filter(a => a.status === 'published');
    fallback.sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
    if (search) {
      const s = search.toLowerCase();
      fallback = fallback.filter(a => a.title.toLowerCase().includes(s) || (a.excerpt && a.excerpt.toLowerCase().includes(s)));
    }
    if (featured === 'true' || featured === true) fallback = fallback.filter(a => a.isFeatured);
    if (trending === 'true' || trending === true) fallback = fallback.filter(a => a.isTrending);

    const total = fallback.length;
    const paginated = fallback.slice(skip, skip + parseInt(limit, 10));

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --------------------------------------------------------------------------
// 2. PUBLIC API: GET /api/articles/:slug (Fetch single post by unique slug)
// --------------------------------------------------------------------------
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      const article = await Article.findOneAndUpdate(
        { slug, status: 'published' },
        { $inc: { views: 1 } },
        { new: true }
      );

      if (!article) {
        return res.status(404).json({ success: false, message: 'Article not found or not yet published.' });
      }

      return res.json({ success: true, data: article });
    }

    const fallback = readFallbackArticles();
    const article = fallback.find(a => a.slug === slug && a.status === 'published');
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found or not yet published.' });
    }
    article.views = (article.views || 0) + 1;
    writeFallbackArticles(fallback);
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --------------------------------------------------------------------------
// 3. ADMIN APIS: /api/admin/articles
// --------------------------------------------------------------------------
export const adminArticlesRouter = express.Router();

// List all posts (draft, scheduled, published, archived)
adminArticlesRouter.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', status = '', category = '' } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.categoryName = { $regex: category, $options: 'i' };
    }

    if (isDbConnected()) {
      const [articles, total] = await Promise.all([
        Article.find(query).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
        Article.countDocuments(query)
      ]);
      return res.json({
        success: true,
        data: articles,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10))
        }
      });
    }

    let fallback = readFallbackArticles();
    if (status && status !== 'all') fallback = fallback.filter(a => a.status === status);
    if (search) {
      const s = search.toLowerCase();
      fallback = fallback.filter(a => a.title.toLowerCase().includes(s) || a.authorName.toLowerCase().includes(s));
    }
    const total = fallback.length;
    const paginated = fallback.slice(skip, skip + parseInt(limit, 10));

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get post by ID
adminArticlesRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const article = await Article.findById(id);
      if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
      return res.json({ success: true, data: article });
    }
    const fallback = readFallbackArticles();
    const article = fallback.find(a => String(a._id || a.id) === String(id));
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper to sanitize incoming article payload and prevent schema casting errors
function sanitizeArticlePayload(raw) {
  const payload = { ...raw };
  delete payload._id;
  delete payload.id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;

  if (payload.contentType) {
    payload.contentType = String(payload.contentType).toLowerCase().trim().replace(/[\s-]+/g, '_');
  }
  if (payload.status) {
    payload.status = String(payload.status).toLowerCase().trim().replace(/[\s-]+/g, '_');
  }

  // Prevent Cast to ObjectId failed for value ""
  if (payload.authorId === '' || payload.authorId === undefined) payload.authorId = null;
  if (payload.categoryId === '' || payload.categoryId === undefined) payload.categoryId = null;
  if (payload.subCategoryId === '' || payload.subCategoryId === undefined) payload.subCategoryId = null;

  // Sanitize featuredImage so that url is always a string and not nested object
  if (payload.featuredImage !== undefined) {
    let imgUrl = '';
    let alt = '';
    let caption = '';
    let credit = '';

    if (typeof payload.featuredImage === 'string') {
      imgUrl = payload.featuredImage;
    } else if (payload.featuredImage && typeof payload.featuredImage === 'object') {
      let rawUrl = payload.featuredImage.url;
      while (rawUrl && typeof rawUrl === 'object') {
        rawUrl = rawUrl.url || '';
      }
      imgUrl = typeof rawUrl === 'string' ? rawUrl : '';
      alt = typeof payload.featuredImage.alt === 'string' ? payload.featuredImage.alt : '';
      caption = typeof payload.featuredImage.caption === 'string' ? payload.featuredImage.caption : '';
      credit = typeof payload.featuredImage.credit === 'string' ? payload.featuredImage.credit : '';
    }

    payload.featuredImage = {
      url: imgUrl,
      alt,
      caption,
      credit
    };
  }

  // Sanitize SEO ogImage as well
  if (payload.seo && typeof payload.seo === 'object') {
    let ogImg = payload.seo.ogImage;
    while (ogImg && typeof ogImg === 'object') {
      ogImg = ogImg.url || '';
    }
    payload.seo.ogImage = typeof ogImg === 'string' ? ogImg : (payload.featuredImage?.url || '');
  }

  return payload;
}

// Create Post (Section 14 & 15)
adminArticlesRouter.post('/', async (req, res) => {
  try {
    const rawPayload = req.body;
    if (!rawPayload.title || !rawPayload.title.trim()) {
      return res.status(400).json({ success: false, message: 'Article title is required' });
    }

    const payload = sanitizeArticlePayload(rawPayload);

    const baseSlug = (payload.slug || payload.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let uniqueSlug = baseSlug;

    // Check slug uniqueness
    if (isDbConnected()) {
      const existing = await Article.findOne({ slug: uniqueSlug });
      if (existing) {
        uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
      }

      const newArticle = await Article.create({
        ...payload,
        slug: uniqueSlug,
        publishedAt: payload.status === 'published' ? (payload.publishedAt || new Date()) : null
      });

      if (newArticle.status === 'published') {
        await syncToStories(newArticle);
      }

      return res.status(201).json({ success: true, message: 'Article created successfully', data: newArticle });
    }

    const fallback = readFallbackArticles();
    if (fallback.some(a => a.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const newArticle = {
      _id: 'art_' + Date.now().toString(36),
      ...payload,
      slug: uniqueSlug,
      views: 0,
      claps: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: payload.status === 'published' ? (payload.publishedAt || new Date().toISOString()) : null
    };

    fallback.unshift(newArticle);
    writeFallbackArticles(fallback);
    if (newArticle.status === 'published') {
      syncToStories(newArticle);
    }

    res.status(201).json({ success: true, message: 'Article created successfully', data: newArticle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Post
adminArticlesRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = sanitizeArticlePayload(req.body);

    if (isDbConnected()) {
      const updated = await Article.findByIdAndUpdate(id, updates, { new: true, runValidators: false });
      if (!updated) return res.status(404).json({ success: false, message: 'Article not found' });
      if (updated.status === 'published') {
        await syncToStories(updated);
      } else {
        await Story.findOneAndDelete({ $or: [{ slug: updated.slug }, { title: updated.title }] }).catch(() => null);
      }
      return res.json({ success: true, message: 'Article updated successfully', data: updated });
    }

    const fallback = readFallbackArticles();
    const idx = fallback.findIndex(a => String(a._id || a.id) === String(id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Article not found' });

    fallback[idx] = { ...fallback[idx], ...updates, updatedAt: new Date().toISOString() };
    writeFallbackArticles(fallback);
    if (fallback[idx].status === 'published') {
      syncToStories(fallback[idx]);
    } else {
      let stories = [];
      if (fs.existsSync(fallbackStoriesPath)) {
        try { stories = JSON.parse(fs.readFileSync(fallbackStoriesPath, 'utf-8')); } catch (e) {}
      }
      stories = stories.filter(s => s.slug !== fallback[idx].slug && s.title !== fallback[idx].title);
      fs.writeFileSync(fallbackStoriesPath, JSON.stringify(stories, null, 2), 'utf-8');
    }
    res.json({ success: true, message: 'Article updated successfully', data: fallback[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper to clean deleted articles from any embedded Page layout sections
async function cleanArticleFromPages(deletedIds = [], deletedSlugs = [], deletedTitles = []) {
  try {
    const idSet = new Set(deletedIds.map(String));
    const slugSet = new Set(deletedSlugs.map(s => String(s).toLowerCase()));
    const titleSet = new Set(deletedTitles.map(t => String(t).toLowerCase()));

    const isMatch = (item) => {
      if (!item) return false;
      if (item.id && idSet.has(String(item.id))) return true;
      if (item._id && idSet.has(String(item._id))) return true;
      if (item.articleId && idSet.has(String(item.articleId))) return true;
      if (item.slug && slugSet.has(String(item.slug).toLowerCase())) return true;
      if (item.title && titleSet.has(String(item.title).toLowerCase())) return true;
      return false;
    };

    if (isDbConnected()) {
      const pages = await Page.find();
      for (const p of pages) {
        let changed = false;
        const updatedSections = (p.sections || []).map(sec => {
          if (sec.data && (sec.data.slides || sec.data.popularArticles)) {
            const nextData = { ...sec.data };
            if (Array.isArray(nextData.slides)) {
              const origLen = nextData.slides.length;
              nextData.slides = nextData.slides.filter(s => !isMatch(s));
              if (nextData.slides.length !== origLen) changed = true;
            }
            if (Array.isArray(nextData.popularArticles)) {
              const origLen = nextData.popularArticles.length;
              nextData.popularArticles = nextData.popularArticles.filter(s => !isMatch(s));
              if (nextData.popularArticles.length !== origLen) changed = true;
            }
            return { ...(sec.toObject ? sec.toObject() : sec), data: nextData };
          }
          return sec;
        });
        if (changed) {
          await Page.updateOne({ _id: p._id }, { $set: { sections: updatedSections } });
        }
      }
    }

    if (fs.existsSync(fallbackPagesPath)) {
      try {
        let pages = JSON.parse(fs.readFileSync(fallbackPagesPath, 'utf-8'));
        if (Array.isArray(pages)) {
          let fileChanged = false;
          pages = pages.map(p => {
            if (Array.isArray(p.sections)) {
              p.sections = p.sections.map(sec => {
                if (sec.data && (sec.data.slides || sec.data.popularArticles)) {
                  const nextData = { ...sec.data };
                  if (Array.isArray(nextData.slides)) {
                    const origLen = nextData.slides.length;
                    nextData.slides = nextData.slides.filter(s => !isMatch(s));
                    if (nextData.slides.length !== origLen) fileChanged = true;
                  }
                  if (Array.isArray(nextData.popularArticles)) {
                    const origLen = nextData.popularArticles.length;
                    nextData.popularArticles = nextData.popularArticles.filter(s => !isMatch(s));
                    if (nextData.popularArticles.length !== origLen) fileChanged = true;
                  }
                  return { ...sec, data: nextData };
                }
                return sec;
              });
            }
            return p;
          });
          if (fileChanged) {
            fs.writeFileSync(fallbackPagesPath, JSON.stringify(pages, null, 2), 'utf-8');
          }
        }
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error cleaning article from pages:', err);
  }
}

// Delete Post
adminArticlesRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;

    if (isDbConnected()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await Article.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Article.findOneAndDelete({ $or: [{ slug: id }, { title: id }] });
      }
      // Also delete corresponding story
      const storyDeleted = await Story.findOneAndDelete({
        $or: [
          { slug: id },
          { title: id },
          ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
        ]
      }).catch(() => null);

      if (deleted && deleted.slug) {
        await Story.deleteMany({ $or: [{ slug: deleted.slug }, { title: deleted.title }] }).catch(() => null);
      }
      if (!deleted && storyDeleted) {
        deleted = storyDeleted;
      }
    }

    // Always remove from fallback files so restarting never brings it back
    let fallback = readFallbackArticles();
    const target = fallback.find(a => String(a._id) === String(id) || a.slug === id);
    fallback = fallback.filter(a => String(a._id) !== String(id) && a.slug !== id && (deleted ? (a.slug !== deleted.slug && a.title !== deleted.title) : true));
    writeFallbackArticles(fallback);

    if (fs.existsSync(fallbackStoriesPath)) {
      try {
        let stories = JSON.parse(fs.readFileSync(fallbackStoriesPath, 'utf-8'));
        stories = stories.filter(s => String(s._id) !== String(id) && s.slug !== id && (deleted ? (s.slug !== deleted.slug && s.title !== deleted.title) : true));
        fs.writeFileSync(fallbackStoriesPath, JSON.stringify(stories, null, 2), 'utf-8');
      } catch (e) {}
    }

    const delSlugs = [id];
    const delTitles = [];
    if (deleted) {
      if (deleted.slug) delSlugs.push(deleted.slug);
      if (deleted.title) delTitles.push(deleted.title);
    }
    if (target) {
      if (target.slug) delSlugs.push(target.slug);
      if (target.title) delTitles.push(target.title);
    }

    // Purge from all pages (slides and popularArticles)
    await cleanArticleFromPages([id], delSlugs, delTitles);

    if (!deleted && !target && isDbConnected()) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    return res.json({ success: true, message: 'Article permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk Delete Articles
adminArticlesRouter.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of article IDs is required' });
    }

    let targetSlugs = [];
    let targetTitles = [];
    let deletedCount = 0;

    if (isDbConnected()) {
      const validObjectIds = ids.filter(i => mongoose.Types.ObjectId.isValid(i));
      const strIds = ids.map(String);

      const targets = await Article.find({
        $or: [
          ...(validObjectIds.length > 0 ? [{ _id: { $in: validObjectIds } }] : []),
          { slug: { $in: strIds } }
        ]
      }).select('slug title');
      targetSlugs = targets.map(t => t.slug).filter(Boolean);
      targetTitles = targets.map(t => t.title).filter(Boolean);

      const result = await Article.deleteMany({
        $or: [
          ...(validObjectIds.length > 0 ? [{ _id: { $in: validObjectIds } }] : []),
          { slug: { $in: strIds } }
        ]
      });
      deletedCount = result.deletedCount || 0;
      if (targetSlugs.length > 0) {
        await Story.deleteMany({ $or: [{ slug: { $in: targetSlugs } }, { title: { $in: targetTitles } }] }).catch(() => null);
      }
    }

    const strIds = new Set(ids.map(String));
    let fallback = readFallbackArticles();
    const beforeCount = fallback.length;
    fallback = fallback.filter(a => !strIds.has(String(a._id || a.id)));
    writeFallbackArticles(fallback);
    deletedCount = deletedCount || (beforeCount - fallback.length);

    if (fs.existsSync(fallbackStoriesPath)) {
      try {
        let stories = JSON.parse(fs.readFileSync(fallbackStoriesPath, 'utf-8'));
        stories = stories.filter(s => !strIds.has(String(s._id || s.id)));
        fs.writeFileSync(fallbackStoriesPath, JSON.stringify(stories, null, 2), 'utf-8');
      } catch (e) {}
    }

    await cleanArticleFromPages(ids, targetSlugs, targetTitles);

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} articles`,
      deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk Status Update (published, draft, archived)
adminArticlesRouter.post('/bulk-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ success: false, message: 'Valid article IDs and status are required' });
    }

    if (isDbConnected()) {
      const result = await Article.updateMany(
        { _id: { $in: ids } },
        { $set: { status, ...(status === 'published' ? { publishedAt: new Date() } : {}) } }
      );
      return res.json({
        success: true,
        message: `Updated status for ${result.modifiedCount} articles to "${status}"`,
        modifiedCount: result.modifiedCount
      });
    }

    let fallback = readFallbackArticles();
    const strIds = new Set(ids.map(String));
    fallback = fallback.map(a => {
      if (strIds.has(String(a._id || a.id))) {
        return { ...a, status, ...(status === 'published' ? { publishedAt: new Date() } : {}) };
      }
      return a;
    });
    writeFallbackArticles(fallback);

    res.json({ success: true, message: `Updated status for articles to "${status}"` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Status actions: publish, unpublish, schedule, archive
adminArticlesRouter.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { status: 'published', publishedAt: new Date() };

    if (isDbConnected()) {
      const updated = await Article.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Article not found' });
      await syncToStories(updated);
      return res.json({ success: true, message: 'Article published live', data: updated });
    }

    const fallback = readFallbackArticles();
    const target = fallback.find(a => String(a._id || a.id) === String(id));
    if (!target) return res.status(404).json({ success: false, message: 'Article not found' });
    Object.assign(target, updateData);
    writeFallbackArticles(fallback);
    syncToStories(target);
    res.json({ success: true, message: 'Article published live', data: target });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

adminArticlesRouter.patch('/:id/unpublish', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { status: 'draft', publishedAt: null };

    if (isDbConnected()) {
      const updated = await Article.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Article not found' });
      await Story.findOneAndDelete({ $or: [{ slug: updated.slug }, { title: updated.title }] });
      return res.json({ success: true, message: 'Article unpublished (saved as draft)', data: updated });
    }

    const fallback = readFallbackArticles();
    const target = fallback.find(a => String(a._id || a.id) === String(id));
    if (!target) return res.status(404).json({ success: false, message: 'Article not found' });
    Object.assign(target, updateData);
    writeFallbackArticles(fallback);
    res.json({ success: true, message: 'Article unpublished (saved as draft)', data: target });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

adminArticlesRouter.patch('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;
    const updateData = { status: 'scheduled', scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86400000) };

    if (isDbConnected()) {
      const updated = await Article.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Article not found' });
      return res.json({ success: true, message: 'Article publication scheduled', data: updated });
    }

    const fallback = readFallbackArticles();
    const target = fallback.find(a => String(a._id || a.id) === String(id));
    if (!target) return res.status(404).json({ success: false, message: 'Article not found' });
    Object.assign(target, updateData);
    writeFallbackArticles(fallback);
    res.json({ success: true, message: 'Article publication scheduled', data: target });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

adminArticlesRouter.patch('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { status: 'archived' };

    if (isDbConnected()) {
      const updated = await Article.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Article not found' });
      await Story.findOneAndDelete({ slug: updated.slug });
      return res.json({ success: true, message: 'Article archived', data: updated });
    }

    const fallback = readFallbackArticles();
    const target = fallback.find(a => String(a._id || a.id) === String(id));
    if (!target) return res.status(404).json({ success: false, message: 'Article not found' });
    Object.assign(target, updateData);
    writeFallbackArticles(fallback);
    res.json({ success: true, message: 'Article archived', data: target });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

adminArticlesRouter.patch('/:id/toggle-frontend', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const article = await Article.findById(id);
      if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
      article.disabledFromFrontend = !article.disabledFromFrontend;
      await article.save();
      await syncToStories(article);
      return res.json({ 
        success: true, 
        message: `Frontend display ${article.disabledFromFrontend ? 'disabled' : 'enabled'}`, 
        data: article 
      });
    }

    const fallback = readFallbackArticles();
    const target = fallback.find(a => String(a._id || a.id) === String(id));
    if (!target) return res.status(404).json({ success: false, message: 'Article not found' });
    target.disabledFromFrontend = !target.disabledFromFrontend;
    writeFallbackArticles(fallback);
    syncToStories(target);
    return res.json({ 
      success: true, 
      message: `Frontend display ${target.disabledFromFrontend ? 'disabled' : 'enabled'}`, 
      data: target 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
