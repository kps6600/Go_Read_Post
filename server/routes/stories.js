import express from 'express';
import mongoose from 'mongoose';
import Story from '../models/Story.js';
import Article from '../models/Article.js';
import { isDbConnected } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to normalize an Article document into Story structure expected by frontend
export function mapArticleToStory(art) {
  if (!art) return null;
  const a = art.toObject ? art.toObject() : { ...art };
  let img = '';
  if (typeof a.featuredImage === 'string') img = a.featuredImage;
  else if (a.featuredImage && typeof a.featuredImage === 'object') {
    let u = a.featuredImage.url;
    while (u && typeof u === 'object') u = u.url || '';
    img = typeof u === 'string' ? u : '';
  }
  if (!img && a.image) img = a.image;
  if (!img) img = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80';

  let tag = 'LATEST';
  if (a.isFeatured) tag = 'FEATURED';
  else if (a.isBreaking) tag = 'BREAKING';
  else if (a.isTrending) tag = 'TRENDING';
  else if (a.isEditorsPick) tag = "EDITOR'S PICK";

  const isHexId = (v) => typeof v === 'string' && /^[0-9a-fA-F]{24}$/.test(v.trim());
  let catName = a.categoryName;
  if (!catName || isHexId(catName)) {
    if (a.category && typeof a.category === 'object' && a.category.name && !isHexId(a.category.name)) {
      catName = a.category.name;
    } else if (typeof a.category === 'string' && a.category.trim() && !isHexId(a.category)) {
      catName = a.category;
    } else if (Array.isArray(a.topics) && a.topics[0] && !isHexId(a.topics[0])) {
      catName = a.topics[0];
    } else if (Array.isArray(a.tags) && a.tags[0] && !isHexId(a.tags[0])) {
      catName = a.tags[0];
    } else {
      catName = 'Technology';
    }
  }
  const catSlug = (catName || 'technology').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  return {
    _id: a._id ? String(a._id) : ('story_' + (a.slug || Date.now())),
    id: a.slug || (a._id ? String(a._id) : ('story_' + Date.now())),
    title: a.title || 'Untitled Story',
    subtitle: a.subtitle || '',
    summary: a.excerpt || a.subtitle || '',
    excerpt: a.excerpt || a.subtitle || '',
    slug: a.slug || '',
    brand: a.brand || 'GoReadPost',
    category: catSlug,
    categoryTag: catName,
    categoryLabel: catName,
    tag,
    image: img,
    fallbackImage: img,
    author: {
      name: a.authorName || 'Editorial Desk',
      title: a.authorTitle || 'Senior Staff Reporter',
      avatar: a.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
    },
    authorName: a.authorName || 'Editorial Desk',
    authorTitle: a.authorTitle || 'Senior Staff Reporter',
    authorAvatar: a.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    readTime: a.readingTime || '4 min read',
    readingTime: a.readingTime || '4 min read',
    publishedAt: a.publishedAt 
      ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : (a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'),
    content: Array.isArray(a.content) ? a.content : [a.content || ''],
    tags: Array.isArray(a.tags) ? a.tags : (typeof a.tags === 'string' ? a.tags.split(',').map(t => t.trim()) : []),
    status: a.status || 'published',
    views: a.views || 0,
    claps: a.claps || 142,
    isFeatured: !!a.isFeatured,
    isTrending: !!a.isTrending,
    isBreaking: !!a.isBreaking,
    isEditorsPick: !!a.isEditorsPick,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt
  };
}

// Local JSON fallback store file path
const fallbackFilePath = path.join(__dirname, '..', 'data_store.json');

function readFallbackData() {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading fallback file:', e);
  }
  return [];
}

function writeFallbackData(data) {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving fallback file:', e);
  }
}

async function autoPublishScheduled() {
  try {
    const now = new Date();
    if (isDbConnected()) {
      await Story.updateMany(
        { status: 'scheduled', scheduledPublishAt: { $lte: now } },
        { $set: { status: 'published' } }
      );
      await Article.updateMany(
        { status: 'scheduled', scheduledAt: { $lte: now } },
        { $set: { status: 'published', publishedAt: now } }
      );
    } else {
      let stories = readFallbackData();
      let changed = false;
      stories = stories.map(s => {
        if (s.status === 'scheduled' && s.scheduledPublishAt && new Date(s.scheduledPublishAt) <= now) {
          changed = true;
          return { ...s, status: 'published' };
        }
        return s;
      });
      if (changed) writeFallbackData(stories);
    }
  } catch (e) {
    console.error('Error in autoPublishScheduled:', e);
  }
}

// 1. GET /api/stories (Fetches live articles from MongoDB Article collection, mapped to Story format)
router.get('/', async (req, res) => {
  try {
    await autoPublishScheduled();
    const { category, brand, status, search, limit = 500, page = 1 } = req.query;

    if (isDbConnected()) {
      const desiredStatus = (!status || status === 'all') ? 'published' : status;
      const articleQuery = {};
      if (desiredStatus !== 'all') articleQuery.status = desiredStatus;

      if (category && category !== 'all') {
        const catClean = category.trim().replace(/-/g, ' ');
        articleQuery.$or = [
          { categoryName: new RegExp(category, 'i') },
          { categoryName: new RegExp(catClean, 'i') },
          { category: new RegExp(category, 'i') },
          { topics: new RegExp(category, 'i') },
          { tags: new RegExp(category, 'i') }
        ];
      }

      if (brand && brand !== 'all') {
        const brandRegex = new RegExp(brand, 'i');
        articleQuery.$or = [
          ...(articleQuery.$or || []),
          { brand: brandRegex },
          { categoryName: brandRegex }
        ];
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        articleQuery.$or = [
          { title: regex },
          { subtitle: regex },
          { excerpt: regex },
          { authorName: regex }
        ];
      }

      // Check Article collection first (admin primary post store)
      const totalArticles = await Article.countDocuments(articleQuery);
      if (totalArticles > 0) {
        const articles = await Article.find(articleQuery)
          .sort({ publishedAt: -1, createdAt: -1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit));

        const mappedStories = articles.map(mapArticleToStory);
        return res.json({ success: true, count: mappedStories.length, total: totalArticles, data: mappedStories });
      }

      // Fallback query to Story collection
      const query = {};
      if (category && category !== 'all') query.category = category;
      if (brand && brand !== 'all') query.brand = brand;
      if (status && status !== 'all') query.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ title: regex }, { summary: regex }, { 'author.name': regex }];
      }

      const stories = await Story.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Story.countDocuments(query);
      return res.json({ success: true, count: stories.length, total, data: stories });
    }

    // Fallback Store
    let stories = readFallbackData();
    if (category && category !== 'all') {
      stories = stories.filter(s => s.category === category);
    }
    if (brand && brand !== 'all') {
      stories = stories.filter(s => s.brand === brand);
    }
    if (status && status !== 'all') {
      stories = stories.filter(s => s.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      stories = stories.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.summary && s.summary.toLowerCase().includes(q)) ||
        (s.author?.name && s.author.name.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: stories.length, total: stories.length, data: stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET /api/stats
router.get('/stats', async (req, res) => {
  try {
    await autoPublishScheduled();
    if (isDbConnected()) {
      const totalStories = await Story.countDocuments();
      const published = await Story.countDocuments({ status: 'published' });
      const drafts = await Story.countDocuments({ status: 'draft' });
      const scheduled = await Story.countDocuments({ status: 'scheduled' });
      const aggregateResult = await Story.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            totalClaps: { $sum: '$claps' }
          }
        }
      ]);

      return res.json({
        success: true,
        stats: {
          totalStories,
          published,
          drafts,
          scheduled,
          totalViews: aggregateResult[0]?.totalViews || 0,
          totalClaps: aggregateResult[0]?.totalClaps || 0,
          isMongoConnected: true
        }
      });
    }

    const stories = readFallbackData();
    res.json({
      success: true,
      stats: {
        totalStories: stories.length,
        published: stories.filter(s => s.status === 'published').length,
        drafts: stories.filter(s => s.status === 'draft').length,
        scheduled: stories.filter(s => s.status === 'scheduled').length,
        totalViews: stories.reduce((acc, s) => acc + (s.views || 0), 0),
        totalClaps: stories.reduce((acc, s) => acc + (s.claps || 0), 0),
        isMongoConnected: false
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET /api/stories/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let story = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        const art = await Article.findById(id).catch(() => null);
        if (art) return res.json({ success: true, data: mapArticleToStory(art) });
        story = await Story.findById(id).catch(() => null);
      }
      if (!story) {
        const art = await Article.findOne({ $or: [{ slug: id }, { title: id }] }).catch(() => null);
        if (art) return res.json({ success: true, data: mapArticleToStory(art) });
      }
      if (!story) {
        story = await Story.findOne({ $or: [{ id }, { slug: id }, { title: id }] }).catch(() => null);
      }
      if (story) return res.json({ success: true, data: story });
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const stories = readFallbackData();
    const found = stories.find(s => s._id === id || s.id === id || s.slug === id);
    if (!found) return res.status(404).json({ success: false, message: 'Story not found' });
    res.json({ success: true, data: found });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /api/stories
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.title || !payload.image) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    // Generate slug
    const slug = (payload.title || 'story')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const storyData = {
      ...payload,
      id: payload.id || 'story_' + Date.now(),
      slug: payload.slug || slug,
      claps: payload.claps || 140,
      views: payload.views || 0,
      status: payload.status || 'published',
      publishedAt: payload.publishedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    if (isDbConnected()) {
      const created = await Story.create(storyData);
      return res.status(201).json({ success: true, message: 'Story created in MongoDB', data: created });
    }

    // Fallback store
    const stories = readFallbackData();
    const newStory = {
      ...storyData,
      _id: storyData.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    stories.unshift(newStory);
    writeFallbackData(stories);

    res.status(201).json({ success: true, message: 'Story created', data: newStory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. PUT /api/stories/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await Story.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).catch(() => null);
      }
      if (!updated) {
        updated = await Story.findOneAndUpdate({ $or: [{ id }, { slug: id }] }, updateData, { new: true, runValidators: true }).catch(() => null);
      }
      if (!updated) return res.status(404).json({ success: false, message: 'Story not found' });
      return res.json({ success: true, message: 'Story updated in MongoDB', data: updated });
    }

    const stories = readFallbackData();
    const index = stories.findIndex(s => s._id === id || s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Story not found' });

    stories[index] = {
      ...stories[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeFallbackData(stories);

    res.json({ success: true, message: 'Story updated', data: stories[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. DELETE /api/stories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        await Article.findByIdAndDelete(id).catch(() => null);
        deleted = await Story.findByIdAndDelete(id).catch(() => null);
      }
      if (!deleted) {
        await Article.findOneAndDelete({ $or: [{ slug: id }, { title: id }] }).catch(() => null);
        deleted = await Story.findOneAndDelete({ $or: [{ id }, { slug: id }, { title: id }] }).catch(() => null);
      }
      return res.json({ success: true, message: 'Story deleted from database' });
    }

    let stories = readFallbackData();
    const initialLen = stories.length;
    stories = stories.filter(s => s._id !== id && s.id !== id);
    if (stories.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    writeFallbackData(stories);

    res.json({ success: true, message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. PATCH /api/stories/:id/clap
router.patch('/:id/clap', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      let story = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        story = await Story.findByIdAndUpdate(id, { $inc: { claps: 1 } }, { new: true }).catch(() => null);
      }
      if (!story) {
        story = await Story.findOneAndUpdate({ $or: [{ id }, { slug: id }] }, { $inc: { claps: 1 } }, { new: true }).catch(() => null);
      }
      return res.json({ success: true, claps: story?.claps });
    }

    const stories = readFallbackData();
    const story = stories.find(s => s._id === id || s.id === id);
    if (story) {
      story.claps = (story.claps || 0) + 1;
      writeFallbackData(stories);
      return res.json({ success: true, claps: story.claps });
    }
    res.status(404).json({ success: false, message: 'Story not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. POST /api/stories/seed
router.post('/seed', async (req, res) => {
  try {
    const initialStories = req.body.stories || [];
    if (!Array.isArray(initialStories) || initialStories.length === 0) {
      return res.status(400).json({ success: false, message: 'No stories provided to seed' });
    }

    const sanitized = initialStories.map((s, idx) => {
      const item = { ...s };
      if (item._id && !mongoose.Types.ObjectId.isValid(item._id)) {
        delete item._id;
      }
      item.id = item.id || ('story_' + Date.now() + '_' + idx);
      item.title = item.title || 'Curated Article';
      item.image = item.image || item.heroImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80';
      item.brand = item.brand || 'GoReadPost';
      item.category = item.category || 'startups';
      item.status = item.status || 'published';
      item.views = item.views || Math.floor(Math.random() * 800) + 150;
      item.claps = item.claps || 142;
      return item;
    });

    if (isDbConnected()) {
      const count = await Story.countDocuments();
      if (count > 0 && !req.query.force) {
        return res.json({ success: true, message: `MongoDB already contains ${count} stories. Pass ?force=true to overwrite.` });
      }
      if (req.query.force) await Story.deleteMany({});
      await Story.insertMany(sanitized, { ordered: false });
      return res.json({ success: true, message: `Successfully seeded ${sanitized.length} stories into MongoDB!` });
    }

    writeFallbackData(sanitized);
    res.json({ success: true, message: `Successfully seeded ${sanitized.length} stories into local store!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
