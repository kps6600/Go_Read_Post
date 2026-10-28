import express from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Author from '../models/Author.js';
import Topic from '../models/Topic.js';
import Tag from '../models/Tag.js';
import Article from '../models/Article.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, requireRoles } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const taxonomyFallbackPath = path.join(__dirname, '..', 'taxonomy_data_store.json');
const articlesFallbackPath = path.join(__dirname, '..', 'articles_data_store.json');

const INITIAL_TAXONOMY = {
  categories: [
    { _id: 'cat_startups', name: 'Startups', slug: 'startups', description: 'Early-stage stories, funding, and playbooks', order: 1, isActive: true },
    { _id: 'cat_technology', name: 'Technology', slug: 'technology', description: 'Tech disruption, software, and ecosystems', order: 2, isActive: true },
    { _id: 'cat_enterprise', name: 'Enterprise', slug: 'enterprise', description: 'Enterprise SaaS, cloud, and transformation', order: 3, isActive: true },
    { _id: 'cat_ai', name: 'AI & DeepTech', slug: 'ai-deeptech', parentId: 'cat_technology', description: 'LLMs, AI startups, Robotics', order: 4, isActive: true },
    { _id: 'cat_smbstory', name: 'SMBStory', slug: 'smbstory', description: 'MSME, D2C, and Indian manufacturing', order: 5, isActive: true },
    { _id: 'cat_herstory', name: 'HerStory', slug: 'her-story', description: 'Women founders, leaders, and change-makers', order: 6, isActive: true },
    { _id: 'cat_socialstory', name: 'SocialStory', slug: 'social-story', description: 'Impact, sustainability, and grassroots innovation', order: 7, isActive: true },
    { _id: 'cat_fintech', name: 'FinTech', slug: 'fintech', description: 'Payments, banking, wealthtech, and regulatory tech', order: 9, isActive: true }
  ],
  authors: [
    {
      _id: 'auth_editorial',
      name: 'Editorial Desk',
      slug: 'editorial-desk',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      bio: 'GoReadPost Senior Editorial Staff covering venture ecosystems, founders, and deep tech.',
      designation: 'Senior Tech Reporter',
      email: 'editorial@goreadpost.com',
      isActive: true
    },
    {
      _id: 'auth_rekha',
      name: 'Rekha Balakrishnan',
      slug: 'rekha-balakrishnan',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      bio: 'Editor specializing in women leadership, consumer brands, and bootstrap journeys.',
      designation: 'Editor - HerStory',
      email: 'rekha@goreadpost.com',
      isActive: true
    },
    {
      _id: 'auth_kamlesh',
      name: 'Kamlesh Sharma',
      slug: 'kamlesh-sharma',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      bio: 'Investigative tech analyst covering AI, enterprise infrastructure, and venture rounds.',
      designation: 'Chief Technology Editor',
      email: 'kamlesh@goreadpost.com',
      isActive: true
    }
  ],
  topics: [
    { _id: 'top_openai', name: 'OpenAI', slug: 'openai', description: 'Artificial general intelligence, GPT models, and Sam Altman', isActive: true },
    { _id: 'top_microsoft', name: 'Microsoft', slug: 'microsoft', description: 'Cloud, Copilot, Azure enterprise tech', isActive: true },
    { _id: 'top_google', name: 'Google', slug: 'google', description: 'Alphabet, Gemini AI, Android, DeepMind innovations', isActive: true },
    { _id: 'top_swiggy', name: 'Swiggy', slug: 'swiggy', description: 'Quick commerce, food tech, and IPO journeys', isActive: true },
    { _id: 'top_zomato', name: 'Zomato', slug: 'zomato', description: 'Blinkit, food delivery scale, and consumer internet', isActive: true }
  ],
  tags: [
    { _id: 'tag_ai', name: 'AI', slug: 'ai', count: 24 },
    { _id: 'tag_startup', name: 'Startup', slug: 'startup', count: 50 },
    { _id: 'tag_funding', name: 'Funding', slug: 'funding', count: 42 },
    { _id: 'tag_llm', name: 'LLM', slug: 'llm', count: 38 },
    { _id: 'tag_india', name: 'India', slug: 'india', count: 55 }
  ]
};

function readFallbackTaxonomy() {
  try {
    if (fs.existsSync(taxonomyFallbackPath)) {
      const data = fs.readFileSync(taxonomyFallbackPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.categories && parsed.authors) return parsed;
    }
  } catch (e) {}
  writeFallbackTaxonomy(INITIAL_TAXONOMY);
  return INITIAL_TAXONOMY;
}

function writeFallbackTaxonomy(data) {
  try {
    fs.writeFileSync(taxonomyFallbackPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

// ==========================================
// 1. CATEGORIES CRUD & PUBLIC ENDPOINTS
// ==========================================
router.get('/categories', async (req, res) => {
  try {
    if (isDbConnected()) {
      let cats = await Category.find().sort({ order: 1 });
      if (cats.length === 0) {
        await Category.insertMany(INITIAL_TAXONOMY.categories.map(({ _id, parentId, ...c }) => c));
        cats = await Category.find().sort({ order: 1 });
      }
      return res.json({ success: true, data: cats });
    }
    const store = readFallbackTaxonomy();
    res.json({ success: true, data: store.categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Single category + related articles for /category/:slug with pagination and sorting
router.get('/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const sort = req.query.sort || 'latest';

    // Build sort object
    let sortObj = { publishedAt: -1 };
    if (sort === 'popular' || sort === 'views') {
      sortObj = { views: -1, publishedAt: -1 };
    } else if (sort === 'claps') {
      sortObj = { claps: -1, publishedAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { publishedAt: 1 };
    }

    let category = null;
    let articles = [];
    let total = 0;

    // Support virtual 'latest', 'just-in', or 'trending' category
    if (slug === 'latest' || slug === 'just-in' || slug === 'trending') {
      const isTrending = slug === 'trending';
      category = {
        name: isTrending ? 'Trending Stories' : 'Latest News',
        slug,
        description: isTrending
          ? 'Most popular, highly discussed, and trending stories across GoReadPost.'
          : 'Real-time breaking stories, market developments, and latest editorial dispatches across GoReadPost.',
        order: 1,
        isActive: true
      };

      if (isDbConnected()) {
        const filter = { status: 'published' };
        if (req.query.category && req.query.category !== 'all') {
          const catQuery = req.query.category.trim();
          filter.$or = [
            { categoryName: new RegExp(`^${catQuery}$`, 'i') },
            { categoryName: new RegExp(catQuery, 'i') },
            { topics: new RegExp(catQuery, 'i') }
          ];
        }
        if (isTrending) {
          filter.$or = [
            ...(filter.$or || []),
            { isTrending: true },
            { views: { $gt: 1000 } }
          ];
        }

        total = await Article.countDocuments(filter);
        articles = await Article.find(filter)
          .sort(isTrending && sort === 'latest' ? { views: -1, publishedAt: -1 } : sortObj)
          .skip((page - 1) * limit)
          .limit(limit);
      } else {
        const store = readFallbackTaxonomy();
        total = 0;
      }

      return res.json({
        success: true,
        data: {
          category,
          articles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit))
          }
        }
      });
    }

    if (isDbConnected()) {
      category = await Category.findOne({ slug });
      if (category) {
        const filter = {
          status: 'published',
          $or: [
            { categoryId: category._id },
            { categoryName: new RegExp(`^${category.name}$`, 'i') },
            { categoryName: new RegExp(category.slug, 'i') }
          ]
        };

        total = await Article.countDocuments(filter);
        articles = await Article.find(filter)
          .sort(sortObj)
          .skip((page - 1) * limit)
          .limit(limit);
      }
    } else {
      const store = readFallbackTaxonomy();
      category = store.categories.find(c => c.slug === slug);
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      data: {
        category,
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all categories for Admin with article counts and populated parents
router.get('/admin/categories', async (req, res) => {
  try {
    if (isDbConnected()) {
      let cats = await Category.find().populate('parentId', 'name slug').sort({ order: 1 }).lean();
      if (cats.length === 0) {
        await Category.insertMany(INITIAL_TAXONOMY.categories.map(({ _id, parentId, ...c }) => c));
        cats = await Category.find().populate('parentId', 'name slug').sort({ order: 1 }).lean();
      }

      // Compute published and draft counts from Article collection
      const counts = await Article.aggregate([
        {
          $group: {
            _id: {
              categoryId: "$categoryId",
              categoryName: { $toLower: "$categoryName" },
              isPublished: { $eq: ["$status", "published"] }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      const enriched = cats.map(cat => {
        let publishedCount = 0;
        let draftCount = 0;
        counts.forEach(c => {
          const idMatch = c._id.categoryId && String(c._id.categoryId) === String(cat._id);
          const nameMatch = c._id.categoryName && (
            c._id.categoryName === (cat.name || '').toLowerCase() || 
            c._id.categoryName === (cat.slug || '').toLowerCase()
          );
          if (idMatch || nameMatch) {
            if (c._id.isPublished) {
              publishedCount += c.count;
            } else {
              draftCount += c.count;
            }
          }
        });
        return {
          ...cat,
          publishedArticlesCount: publishedCount,
          draftArticlesCount: draftCount,
          totalArticlesCount: publishedCount + draftCount
        };
      });

      return res.json({ success: true, data: enriched });
    }

    const store = readFallbackTaxonomy();
    const enriched = (store.categories || []).map(cat => ({
      ...cat,
      publishedArticlesCount: 0,
      draftArticlesCount: 0,
      totalArticlesCount: 0
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Category usage details (how many articles are using this category)
router.get('/admin/categories/:id/usage', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const cat = await Category.findById(id);
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

      const filter = {
        $or: [
          { categoryId: cat._id },
          { categoryName: new RegExp(`^${cat.name}$`, 'i') },
          { categoryName: new RegExp(`^${cat.slug}$`, 'i') }
        ]
      };

      const publishedCount = await Article.countDocuments({ ...filter, status: 'published' });
      const draftCount = await Article.countDocuments({ ...filter, status: { $ne: 'published' } });
      const recentArticles = await Article.find(filter).select('title slug status publishedAt').limit(5);

      return res.json({
        success: true,
        data: {
          category: cat,
          publishedCount,
          draftCount,
          totalCount: publishedCount + draftCount,
          recentArticles
        }
      });
    }

    res.json({ success: true, data: { publishedCount: 0, draftCount: 0, totalCount: 0, recentArticles: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/categories', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { name, slug, description, image, parentId, seoTitle, seoDescription, order, isActive } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Category name is required' });
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (isDbConnected()) {
      const existing = await Category.findOne({ slug: cleanSlug });
      if (existing) {
        return res.status(400).json({ success: false, message: `Category with slug "${cleanSlug}" already exists.` });
      }

      const created = await Category.create({
        name: name.trim(),
        slug: cleanSlug,
        description: description || '',
        image: image || '',
        parentId: parentId || null,
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        order: Number(order) || 0,
        isActive: isActive !== false
      });
      return res.status(201).json({ success: true, data: created });
    }

    const store = readFallbackTaxonomy();
    if (store.categories.some(c => c.slug === cleanSlug)) {
      return res.status(400).json({ success: false, message: `Category with slug "${cleanSlug}" already exists.` });
    }

    const newCat = {
      _id: 'cat_' + cleanSlug + '_' + Date.now().toString(36),
      name: name.trim(),
      slug: cleanSlug,
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      order: Number(order) || store.categories.length + 1,
      isActive: isActive !== false
    };
    store.categories.push(newCat);
    writeFallbackTaxonomy(store);
    res.status(201).json({ success: true, data: newCat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/categories/:id', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.slug) {
      updateData.slug = updateData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    if (isDbConnected()) {
      const isOid = mongoose.Types.ObjectId.isValid(id);
      const query = isOid ? { _id: id } : { slug: id };
      if (updateData.slug) {
        const existing = await Category.findOne({ slug: updateData.slug, ...(isOid ? { _id: { $ne: id } } : { slug: { $ne: id } }) });
        if (existing) {
          return res.status(400).json({ success: false, message: `Category with slug "${updateData.slug}" already exists.` });
        }
      }

      const updated = await Category.findOneAndUpdate(query, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.json({ success: true, data: updated });
    }
    const store = readFallbackTaxonomy();
    const idx = store.categories.findIndex(c => c._id === id || c.slug === id);
    if (idx !== -1) {
      store.categories[idx] = { ...store.categories[idx], ...updateData };
      writeFallbackTaxonomy(store);
      return res.json({ success: true, data: store.categories[idx] });
    }
    res.status(404).json({ success: false, message: 'Category not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/categories/:id', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';

    if (isDbConnected()) {
      const cat = await Category.findById(id);
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

      const articleCount = await Article.countDocuments({
        $or: [
          { categoryId: cat._id },
          { categoryName: new RegExp(`^${cat.name}$`, 'i') },
          { categoryName: new RegExp(`^${cat.slug}$`, 'i') }
        ]
      });

      if (articleCount > 0 && !force) {
        return res.status(400).json({
          success: false,
          inUse: true,
          articleCount,
          message: `Category "${cat.name}" is assigned to ${articleCount} article(s). Please reassign them or confirm deletion.`
        });
      }

      await Category.findByIdAndDelete(id);
      return res.json({ success: true, message: `Category "${cat.name}" deleted successfully` });
    }
    const store = readFallbackTaxonomy();
    store.categories = store.categories.filter(c => c._id !== id && c.slug !== id);
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/categories/bulk-delete', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of category IDs is required' });
    }
    if (isDbConnected()) {
      const result = await Category.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: `Deleted ${result.deletedCount} categories`, deletedCount: result.deletedCount });
    }
    const store = readFallbackTaxonomy();
    const strIds = new Set(ids.map(String));
    store.categories = store.categories.filter(c => !strIds.has(String(c._id)) && !strIds.has(String(c.slug)));
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Deleted categories successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. AUTHORS CRUD & PUBLIC ENDPOINTS
// ==========================================

// Helper: Calculate live published article counts for authors
async function getAuthorsWithArticleCounts(authorsList) {
  if (!Array.isArray(authorsList)) return [];

  if (isDbConnected()) {
    try {
      const idCounts = await Article.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: "$authorId", count: { $sum: 1 } } }
      ]);

      const nameCounts = await Article.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: { $toLower: "$authorName" }, count: { $sum: 1 } } }
      ]);

      const idMap = new Map();
      idCounts.forEach(c => {
        if (c._id) idMap.set(String(c._id), c.count);
      });

      const nameMap = new Map();
      nameCounts.forEach(c => {
        if (c._id) nameMap.set(c._id, c.count);
      });

      return authorsList.map(a => {
        const doc = (a && typeof a.toObject === 'function') ? a.toObject() : { ...a };
        const aId = String(doc._id || '');
        const aName = (doc.name || '').trim().toLowerCase();
        let count = idMap.get(aId) || 0;
        if (count === 0 && nameMap.has(aName)) {
          count = nameMap.get(aName);
        }
        doc.publishedArticlesCount = count;
        doc.totalPublishedArticles = count;
        return doc;
      });
    } catch (e) {
      console.warn('Error aggregating author article counts:', e.message);
    }
  }

  // Fallback mode using articles_data_store.json
  let fallbackArticles = [];
  try {
    if (fs.existsSync(articlesFallbackPath)) {
      fallbackArticles = JSON.parse(fs.readFileSync(articlesFallbackPath, 'utf-8'));
    }
  } catch (e) {}

  return authorsList.map(a => {
    const doc = (a && typeof a.toObject === 'function') ? a.toObject() : { ...a };
    const aId = String(doc._id || '');
    const aName = (doc.name || '').trim().toLowerCase();
    const count = fallbackArticles.filter(art => {
      if (art.status !== 'published') return false;
      if (art.authorId && String(art.authorId) === aId) return true;
      if (art.authorName && art.authorName.trim().toLowerCase() === aName) return true;
      return false;
    }).length;

    doc.publishedArticlesCount = count;
    doc.totalPublishedArticles = count;
    return doc;
  });
}

// Public list of authors with live auto-calculated published article counts
router.get('/authors', async (req, res) => {
  try {
    if (isDbConnected()) {
      let authors = await Author.find().sort({ name: 1 });
      if (authors.length === 0) {
        await Author.insertMany(INITIAL_TAXONOMY.authors.map(({ _id, ...a }) => a));
        authors = await Author.find().sort({ name: 1 });
      }
      const enriched = await getAuthorsWithArticleCounts(authors);
      return res.json({ success: true, data: enriched });
    }
    const store = readFallbackTaxonomy();
    const enriched = await getAuthorsWithArticleCounts(store.authors || []);
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin list of authors with live article counts
router.get('/admin/authors', protectAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      let authors = await Author.find().sort({ name: 1 });
      if (authors.length === 0) {
        await Author.insertMany(INITIAL_TAXONOMY.authors.map(({ _id, ...a }) => a));
        authors = await Author.find().sort({ name: 1 });
      }
      const enriched = await getAuthorsWithArticleCounts(authors);
      return res.json({ success: true, data: enriched });
    }
    const store = readFallbackTaxonomy();
    const enriched = await getAuthorsWithArticleCounts(store.authors || []);
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Single author + related stories for /author/:slug with pagination and auto-calculated count
router.get('/authors/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const sort = req.query.sort || 'latest';

    let sortObj = { publishedAt: -1 };
    if (sort === 'popular' || sort === 'views') {
      sortObj = { views: -1, publishedAt: -1 };
    } else if (sort === 'claps') {
      sortObj = { claps: -1, publishedAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { publishedAt: 1 };
    }

    const rawSlug = String(slug || '').trim();
    const decodedSlug = decodeURIComponent(rawSlug).trim();
    const slugHyphenated = decodedSlug.toLowerCase().replace(/[\s_]+/g, '-');
    const slugUnderscored = decodedSlug.toLowerCase().replace(/[\s-]+/g, '_');
    const escapedText = decodedSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRegex = new RegExp(`^${escapedText}$`, 'i');
    const slugRegex = new RegExp(`^(${slugHyphenated}|${slugUnderscored}|${escapedText})$`, 'i');

    let author = null;
    let articles = [];
    let total = 0;

    if (isDbConnected()) {
      const orConditions = [
        { slug: rawSlug },
        { slug: decodedSlug },
        { slug: slugHyphenated },
        { slug: slugUnderscored },
        { slug: slugRegex },
        { name: nameRegex }
      ];
      if (mongoose.Types.ObjectId.isValid(rawSlug)) {
        orConditions.push({ _id: rawSlug });
      }

      author = await Author.findOne({ $or: orConditions });

      // If user requests auther_name / author_name (or test URI placeholder) and it doesn't exist yet, auto-provision it!
      if (!author && (slugHyphenated === 'auther-name' || slugHyphenated === 'author-name' || slugUnderscored === 'auther_name' || slugUnderscored === 'author_name')) {
        author = await Author.findOne({ slug: { $in: ['auther_name', 'author_name', 'auther-name', 'author-name'] } });
        if (!author) {
          author = await Author.create({
            name: 'Author Name',
            slug: 'auther_name',
            designation: 'Senior Technology Journalist',
            bio: 'Expert technology journalist and contributing author covering AI, deep tech innovations, venture capital, and startups for GoReadPost.',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
            profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
            email: 'author@goreadpost.com',
            socialLinks: {
              linkedin: 'https://linkedin.com',
              facebook: 'https://facebook.com',
              instagram: 'https://instagram.com',
              twitter: 'https://x.com',
              youtube: 'https://youtube.com',
              website: 'https://goreadpost.com'
            },
            isActive: true
          });
        }
      }

      if (author) {
        const filter = {
          status: 'published',
          $or: [
            { authorId: author._id },
            { authorName: new RegExp(`^${author.name}$`, 'i') }
          ]
        };

        total = await Article.countDocuments(filter);
        articles = await Article.find(filter)
          .sort(sortObj)
          .skip((page - 1) * limit)
          .limit(limit);
      }
    } else {
      const store = readFallbackTaxonomy();
      const target = decodedSlug.toLowerCase();
      author = (store.authors || []).find(a => {
        if (!a) return false;
        const aSlug = String(a.slug || '').toLowerCase();
        const aName = String(a.name || '').toLowerCase();
        const aId = String(a._id || '');
        return (
          aSlug === rawSlug.toLowerCase() ||
          aSlug === target ||
          aSlug === slugHyphenated ||
          aSlug === slugUnderscored ||
          aName === target ||
          aName === target.replace(/[-_]+/g, ' ') ||
          aId === rawSlug
        );
      });

      if (!author && (slugHyphenated === 'auther-name' || slugHyphenated === 'author-name' || slugUnderscored === 'auther_name' || slugUnderscored === 'author_name')) {
        author = {
          _id: 'auth_auther_name',
          name: 'Author Name',
          slug: 'auther_name',
          designation: 'Senior Technology Journalist',
          bio: 'Expert technology journalist and contributing author covering AI, deep tech innovations, venture capital, and startups for GoReadPost.',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
          email: 'author@goreadpost.com',
          socialLinks: {
            linkedin: 'https://linkedin.com',
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            twitter: 'https://x.com',
            youtube: 'https://youtube.com',
            website: 'https://goreadpost.com'
          },
          isActive: true
        };
      }

      if (author) {
        let fallbackArticles = [];
        try {
          if (fs.existsSync(articlesFallbackPath)) {
            fallbackArticles = JSON.parse(fs.readFileSync(articlesFallbackPath, 'utf-8'));
          }
        } catch (e) {}

        const aId = String(author._id || '');
        const aName = (author.name || '').trim().toLowerCase();
        const matched = fallbackArticles.filter(art => {
          if (art.status !== 'published') return false;
          if (art.authorId && String(art.authorId) === aId) return true;
          if (art.authorName && art.authorName.trim().toLowerCase() === aName) return true;
          return false;
        });
        total = matched.length;
        articles = matched.slice((page - 1) * limit, page * limit);
      }
    }

    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    const authorObj = (author && typeof author.toObject === 'function') ? author.toObject() : { ...author };
    authorObj.publishedArticlesCount = total;
    authorObj.totalPublishedArticles = total;

    res.json({
      success: true,
      data: {
        author: authorObj,
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/authors', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { name, slug, image, profileImage, bio, designation, email, socialLinks } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Author name is required' });
    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Strict security rule: Do not allow manual editing or overriding of published article count
    delete req.body.publishedArticlesCount;
    delete req.body.totalPublishedArticles;
    delete req.body.articleCount;
    delete req.body.totalArticlesCount;

    const formattedSocialLinks = {
      linkedin: socialLinks?.linkedin || '',
      facebook: socialLinks?.facebook || '',
      instagram: socialLinks?.instagram || '',
      twitter: socialLinks?.twitter || '',
      youtube: socialLinks?.youtube || '',
      website: socialLinks?.website || '',
      github: socialLinks?.github || ''
    };

    if (isDbConnected()) {
      const created = await Author.create({
        name,
        slug: cleanSlug,
        image: image || profileImage || '',
        profileImage: profileImage || image || '',
        bio: bio || '',
        designation: designation || 'Staff Reporter',
        email: email || '',
        socialLinks: formattedSocialLinks
      });
      const [enriched] = await getAuthorsWithArticleCounts([created]);
      return res.status(201).json({ success: true, data: enriched || created });
    }

    const store = readFallbackTaxonomy();
    const newAuthor = {
      _id: 'auth_' + cleanSlug + '_' + Date.now().toString(36),
      name,
      slug: cleanSlug,
      image: image || profileImage || '',
      profileImage: profileImage || image || '',
      bio: bio || '',
      designation: designation || 'Staff Reporter',
      email: email || '',
      socialLinks: formattedSocialLinks,
      isActive: true
    };
    store.authors.push(newAuthor);
    writeFallbackTaxonomy(store);
    const [enriched] = await getAuthorsWithArticleCounts([newAuthor]);
    res.status(201).json({ success: true, data: enriched || newAuthor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/authors/:id', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { id } = req.params;

    // Strict security rule: Do not allow manual editing or overriding of published article count
    delete req.body.publishedArticlesCount;
    delete req.body.totalPublishedArticles;
    delete req.body.articleCount;
    delete req.body.totalArticlesCount;

    if (req.body.socialLinks) {
      req.body.socialLinks = {
        linkedin: req.body.socialLinks.linkedin || '',
        facebook: req.body.socialLinks.facebook || '',
        instagram: req.body.socialLinks.instagram || '',
        twitter: req.body.socialLinks.twitter || '',
        youtube: req.body.socialLinks.youtube || '',
        website: req.body.socialLinks.website || '',
        github: req.body.socialLinks.github || ''
      };
    }

    if (req.body.image && !req.body.profileImage) {
      req.body.profileImage = req.body.image;
    } else if (req.body.profileImage && !req.body.image) {
      req.body.image = req.body.profileImage;
    }

    if (isDbConnected()) {
      const isOid = mongoose.Types.ObjectId.isValid(id);
      const query = isOid ? { _id: id } : { slug: id };
      const updated = await Author.findOneAndUpdate(query, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Author not found' });
      const [enriched] = await getAuthorsWithArticleCounts([updated]);
      return res.json({ success: true, data: enriched || updated });
    }
    const store = readFallbackTaxonomy();
    const idx = store.authors.findIndex(a => a._id === id || a.slug === id);
    if (idx !== -1) {
      store.authors[idx] = { ...store.authors[idx], ...req.body };
      writeFallbackTaxonomy(store);
      const [enriched] = await getAuthorsWithArticleCounts([store.authors[idx]]);
      return res.json({ success: true, data: enriched || store.authors[idx] });
    }
    res.status(404).json({ success: false, message: 'Author not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/authors/:id', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Author.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Author deleted' });
    }
    const store = readFallbackTaxonomy();
    store.authors = store.authors.filter(a => a._id !== id && a.slug !== id);
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Author deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/authors/bulk-delete', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of author IDs is required' });
    }
    if (isDbConnected()) {
      const result = await Author.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: `Deleted ${result.deletedCount} authors`, deletedCount: result.deletedCount });
    }
    const store = readFallbackTaxonomy();
    const strIds = new Set(ids.map(String));
    store.authors = store.authors.filter(a => !strIds.has(String(a._id)) && !strIds.has(String(a.slug)));
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Deleted authors successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. TOPICS CRUD & PUBLIC ENDPOINTS
// ==========================================
router.get('/topics', async (req, res) => {
  try {
    if (isDbConnected()) {
      let topics = await Topic.find().populate('categoryIds', 'name slug').sort({ name: 1 });
      if (topics.length === 0) {
        await Topic.insertMany(INITIAL_TAXONOMY.topics.map(({ _id, ...t }) => t));
        topics = await Topic.find().populate('categoryIds', 'name slug').sort({ name: 1 });
      }
      return res.json({ success: true, data: topics });
    }
    const store = readFallbackTaxonomy();
    res.json({ success: true, data: store.topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Topics list with article counts and populated category associations
router.get('/admin/topics', async (req, res) => {
  try {
    if (isDbConnected()) {
      let topics = await Topic.find().populate('categoryIds', 'name slug').sort({ name: 1 }).lean();
      if (topics.length === 0) {
        await Topic.insertMany(INITIAL_TAXONOMY.topics.map(({ _id, ...t }) => t));
        topics = await Topic.find().populate('categoryIds', 'name slug').sort({ name: 1 }).lean();
      }

      // Aggregate article counts by topic
      const counts = await Article.aggregate([
        { $unwind: "$topicIds" },
        {
          $group: {
            _id: {
              topicId: "$topicIds",
              isPublished: { $eq: ["$status", "published"] }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      const nameCounts = await Article.aggregate([
        { $unwind: "$topics" },
        {
          $group: {
            _id: {
              topicName: { $toLower: "$topics" },
              isPublished: { $eq: ["$status", "published"] }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      const enriched = topics.map(topic => {
        let publishedCount = 0;
        let draftCount = 0;

        counts.forEach(c => {
          if (c._id.topicId && String(c._id.topicId) === String(topic._id)) {
            if (c._id.isPublished) publishedCount += c.count;
            else draftCount += c.count;
          }
        });

        if (publishedCount === 0 && draftCount === 0) {
          nameCounts.forEach(c => {
            if (c._id.topicName && (c._id.topicName === (topic.name || '').toLowerCase() || c._id.topicName === (topic.slug || '').toLowerCase())) {
              if (c._id.isPublished) publishedCount += c.count;
              else draftCount += c.count;
            }
          });
        }

        return {
          ...topic,
          publishedArticlesCount: publishedCount,
          draftArticlesCount: draftCount,
          totalArticlesCount: publishedCount + draftCount
        };
      });

      return res.json({ success: true, data: enriched });
    }

    const store = readFallbackTaxonomy();
    res.json({
      success: true,
      data: (store.topics || []).map(t => ({
        ...t,
        publishedArticlesCount: 0,
        draftArticlesCount: 0,
        totalArticlesCount: 0
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Topic usage details (how many articles are using this topic)
router.get('/admin/topics/:id/usage', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const topic = await Topic.findById(id);
      if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

      const filter = {
        $or: [
          { topicIds: topic._id },
          { topics: new RegExp(`^${topic.name}$`, 'i') },
          { topics: new RegExp(`^${topic.slug}$`, 'i') }
        ]
      };

      const publishedCount = await Article.countDocuments({ ...filter, status: 'published' });
      const draftCount = await Article.countDocuments({ ...filter, status: { $ne: 'published' } });
      const recentArticles = await Article.find(filter).select('title slug status publishedAt').limit(5);

      return res.json({
        success: true,
        data: {
          topic,
          publishedCount,
          draftCount,
          totalCount: publishedCount + draftCount,
          recentArticles
        }
      });
    }

    res.json({ success: true, data: { publishedCount: 0, draftCount: 0, totalCount: 0, recentArticles: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Single topic + related articles for /topic/:slug with pagination and sorting
router.get('/topics/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const sort = req.query.sort || 'latest';

    let sortObj = { publishedAt: -1 };
    if (sort === 'popular' || sort === 'views') {
      sortObj = { views: -1, publishedAt: -1 };
    } else if (sort === 'claps') {
      sortObj = { claps: -1, publishedAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { publishedAt: 1 };
    }

    let topic = null;
    let articles = [];
    let total = 0;

    if (isDbConnected()) {
      topic = await Topic.findOne({ slug }).populate('categoryIds', 'name slug');
      const topicName = topic ? topic.name : slug;
      const filter = {
        status: 'published',
        $or: [
          ...(topic ? [{ topicIds: topic._id }] : []),
          { topics: new RegExp(`^${topicName}$`, 'i') },
          { topics: new RegExp(`^${slug}$`, 'i') },
          { title: new RegExp(topicName, 'i') },
          { excerpt: new RegExp(topicName, 'i') }
        ]
      };

      total = await Article.countDocuments(filter);
      articles = await Article.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      const store = readFallbackTaxonomy();
      topic = store.topics.find(t => t.slug === slug);
    }

    if (!topic && total === 0) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    res.json({
      success: true,
      data: {
        topic: topic || { name: slug, slug },
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/topics', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { name, slug, description, image, categoryIds, seoTitle, seoDescription, isActive } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Topic name is required' });
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (isDbConnected()) {
      const existing = await Topic.findOne({ slug: cleanSlug });
      if (existing) {
        return res.status(400).json({ success: false, message: `Topic with slug "${cleanSlug}" already exists.` });
      }

      const created = await Topic.create({
        name: name.trim(),
        slug: cleanSlug,
        description: description || '',
        image: image || '',
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        isActive: isActive !== false
      });
      const populated = await Topic.findById(created._id).populate('categoryIds', 'name slug');
      return res.status(201).json({ success: true, data: populated });
    }

    const store = readFallbackTaxonomy();
    if (store.topics.some(t => t.slug === cleanSlug)) {
      return res.status(400).json({ success: false, message: `Topic with slug "${cleanSlug}" already exists.` });
    }

    const newTop = {
      _id: 'top_' + cleanSlug + '_' + Date.now().toString(36),
      name: name.trim(),
      slug: cleanSlug,
      description: description || '',
      image: image || '',
      categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      isActive: isActive !== false
    };
    store.topics.push(newTop);
    writeFallbackTaxonomy(store);
    res.status(201).json({ success: true, data: newTop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/topics/:id', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.slug) {
      updateData.slug = updateData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    if (isDbConnected()) {
      const isOid = mongoose.Types.ObjectId.isValid(id);
      const query = isOid ? { _id: id } : { slug: id };
      if (updateData.slug) {
        const existing = await Topic.findOne({ slug: updateData.slug, ...(isOid ? { _id: { $ne: id } } : { slug: { $ne: id } }) });
        if (existing) {
          return res.status(400).json({ success: false, message: `Topic with slug "${updateData.slug}" already exists.` });
        }
      }

      const updated = await Topic.findOneAndUpdate(query, updateData, { new: true }).populate('categoryIds', 'name slug');
      if (!updated) return res.status(404).json({ success: false, message: 'Topic not found' });
      return res.json({ success: true, data: updated });
    }

    const store = readFallbackTaxonomy();
    const idx = store.topics.findIndex(t => t._id === id || t.slug === id);
    if (idx !== -1) {
      store.topics[idx] = { ...store.topics[idx], ...updateData };
      writeFallbackTaxonomy(store);
      return res.json({ success: true, data: store.topics[idx] });
    }
    res.status(404).json({ success: false, message: 'Topic not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/topics/:id', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';

    if (isDbConnected()) {
      const topic = await Topic.findById(id);
      if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

      const articleCount = await Article.countDocuments({
        $or: [
          { topicIds: topic._id },
          { topics: new RegExp(`^${topic.name}$`, 'i') },
          { topics: new RegExp(`^${topic.slug}$`, 'i') }
        ]
      });

      if (articleCount > 0 && !force) {
        return res.status(400).json({
          success: false,
          inUse: true,
          articleCount,
          message: `Topic "${topic.name}" is attached to ${articleCount} article(s). Please confirm deletion to detach.`
        });
      }

      // Detach from articles if deleting
      await Article.updateMany(
        { topicIds: topic._id },
        { $pull: { topicIds: topic._id } }
      );

      await Topic.findByIdAndDelete(id);
      return res.json({ success: true, message: `Topic "${topic.name}" deleted successfully` });
    }

    const store = readFallbackTaxonomy();
    store.topics = store.topics.filter(t => t._id !== id && t.slug !== id);
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/topics/bulk-delete', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of topic IDs is required' });
    }
    if (isDbConnected()) {
      await Article.updateMany(
        { topicIds: { $in: ids } },
        { $pull: { topicIds: { $in: ids } } }
      );
      const result = await Topic.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: `Deleted ${result.deletedCount} topics`, deletedCount: result.deletedCount });
    }
    const store = readFallbackTaxonomy();
    const strIds = new Set(ids.map(String));
    store.topics = store.topics.filter(t => !strIds.has(String(t._id)) && !strIds.has(String(t.slug)));
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Deleted topics successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. TAGS CRUD & PUBLIC ENDPOINTS
// ==========================================
router.get('/tags', async (req, res) => {
  try {
    if (isDbConnected()) {
      let tags = await Tag.find().sort({ count: -1, name: 1 });
      if (tags.length === 0) {
        await Tag.insertMany(INITIAL_TAXONOMY.tags.map(({ _id, ...tg }) => tg));
        tags = await Tag.find().sort({ count: -1, name: 1 });
      }
      return res.json({ success: true, data: tags });
    }
    const store = readFallbackTaxonomy();
    res.json({ success: true, data: store.tags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Tags list with accurate article usage counts
router.get('/admin/tags', async (req, res) => {
  try {
    if (isDbConnected()) {
      let tags = await Tag.find().sort({ count: -1, name: 1 }).lean();
      if (tags.length === 0) {
        await Tag.insertMany(INITIAL_TAXONOMY.tags.map(({ _id, ...tg }) => tg));
        tags = await Tag.find().sort({ count: -1, name: 1 }).lean();
      }

      // Aggregate real article count per tag
      const counts = await Article.aggregate([
        { $unwind: "$tags" },
        {
          $group: {
            _id: { $toLower: "$tags" },
            count: { $sum: 1 }
          }
        }
      ]);

      const countMap = {};
      counts.forEach(c => {
        if (c._id) countMap[c._id] = c.count;
      });

      const enriched = tags.map(tag => {
        const lowerName = (tag.name || '').toLowerCase();
        const lowerSlug = (tag.slug || '').toLowerCase();
        const articleCount = countMap[lowerName] || countMap[lowerSlug] || tag.count || 0;
        return {
          ...tag,
          articlesCount: articleCount,
          count: articleCount,
          isActive: tag.isActive !== false
        };
      });

      return res.json({ success: true, data: enriched });
    }

    const store = readFallbackTaxonomy();
    res.json({
      success: true,
      data: (store.tags || []).map(t => ({
        ...t,
        articlesCount: t.count || 0,
        isActive: true
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tag usage inspection
router.get('/admin/tags/:id/usage', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const tag = await Tag.findById(id);
      if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });

      const filter = {
        $or: [
          { tagIds: tag._id },
          { tags: new RegExp(`^${tag.name}$`, 'i') },
          { tags: new RegExp(`^${tag.slug}$`, 'i') }
        ]
      };

      const publishedCount = await Article.countDocuments({ ...filter, status: 'published' });
      const draftCount = await Article.countDocuments({ ...filter, status: { $ne: 'published' } });
      const recentArticles = await Article.find(filter).select('title slug status publishedAt').limit(5);

      return res.json({
        success: true,
        data: {
          tag,
          publishedCount,
          draftCount,
          totalCount: publishedCount + draftCount,
          recentArticles
        }
      });
    }

    res.json({ success: true, data: { publishedCount: 0, draftCount: 0, totalCount: 0, recentArticles: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Single tag + related articles for /tag/:slug with pagination and sorting
router.get('/tags/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const sort = req.query.sort || 'latest';

    let sortObj = { publishedAt: -1 };
    if (sort === 'popular' || sort === 'views') {
      sortObj = { views: -1, publishedAt: -1 };
    } else if (sort === 'claps') {
      sortObj = { claps: -1, publishedAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { publishedAt: 1 };
    }

    let tag = null;
    let articles = [];
    let total = 0;

    if (isDbConnected()) {
      tag = await Tag.findOne({ slug });
      const tagName = tag ? tag.name : slug;
      const filter = {
        status: 'published',
        $or: [
          ...(tag ? [{ tagIds: tag._id }] : []),
          { tags: new RegExp(`^${tagName}$`, 'i') },
          { tags: new RegExp(`^${slug}$`, 'i') }
        ]
      };

      total = await Article.countDocuments(filter);
      articles = await Article.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      const store = readFallbackTaxonomy();
      tag = store.tags.find(t => t.slug === slug) || { name: slug, slug, count: 0 };
    }

    if (!tag && total === 0) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    res.json({
      success: true,
      data: {
        tag: tag || { name: slug, slug, count: total },
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/tags', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { name, slug, description, isActive } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Tag name is required' });
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (isDbConnected()) {
      const existing = await Tag.findOne({ slug: cleanSlug });
      if (existing) {
        return res.status(400).json({ success: false, message: `Tag with slug "${cleanSlug}" already exists.` });
      }

      const created = await Tag.create({
        name: name.trim(),
        slug: cleanSlug,
        description: description || '',
        count: 0,
        isActive: isActive !== false
      });
      return res.status(201).json({ success: true, data: created });
    }

    const store = readFallbackTaxonomy();
    if (store.tags.some(t => t.slug === cleanSlug)) {
      return res.status(400).json({ success: false, message: `Tag with slug "${cleanSlug}" already exists.` });
    }

    const newTag = {
      _id: 'tag_' + cleanSlug + '_' + Date.now().toString(36),
      name: name.trim(),
      slug: cleanSlug,
      description: description || '',
      count: 0,
      isActive: isActive !== false
    };
    store.tags.push(newTag);
    writeFallbackTaxonomy(store);
    res.status(201).json({ success: true, data: newTag });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/tags/:id', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.slug) {
      updateData.slug = updateData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    if (isDbConnected()) {
      const isOid = mongoose.Types.ObjectId.isValid(id);
      const query = isOid ? { _id: id } : { slug: id };
      if (updateData.slug) {
        const existing = await Tag.findOne({ slug: updateData.slug, ...(isOid ? { _id: { $ne: id } } : { slug: { $ne: id } }) });
        if (existing) {
          return res.status(400).json({ success: false, message: `Tag with slug "${updateData.slug}" already exists.` });
        }
      }

      const updated = await Tag.findOneAndUpdate(query, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Tag not found' });
      return res.json({ success: true, data: updated });
    }

    const store = readFallbackTaxonomy();
    const idx = store.tags.findIndex(t => t._id === id || t.slug === id);
    if (idx !== -1) {
      store.tags[idx] = { ...store.tags[idx], ...updateData };
      writeFallbackTaxonomy(store);
      return res.json({ success: true, data: store.tags[idx] });
    }
    res.status(404).json({ success: false, message: 'Tag not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Merge duplicate tags: sourceTag into targetTag
router.post('/admin/tags/merge', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { sourceTagId, targetTagId } = req.body;
    if (!sourceTagId || !targetTagId) {
      return res.status(400).json({ success: false, message: 'Both sourceTagId and targetTagId are required' });
    }
    if (String(sourceTagId) === String(targetTagId)) {
      return res.status(400).json({ success: false, message: 'Source and target tags must be different' });
    }

    if (isDbConnected()) {
      const sourceTag = await Tag.findById(sourceTagId);
      const targetTag = await Tag.findById(targetTagId);

      if (!sourceTag || !targetTag) {
        return res.status(404).json({ success: false, message: 'Source or Target tag not found' });
      }

      // 1. Reassign tagIds in Article documents
      await Article.updateMany(
        { tagIds: sourceTag._id },
        {
          $pull: { tagIds: sourceTag._id },
          $addToSet: { tagIds: targetTag._id }
        }
      );

      // 2. Reassign strings in article.tags
      const affectedArticles = await Article.find({
        tags: new RegExp(`^${sourceTag.name}$`, 'i')
      });

      for (const art of affectedArticles) {
        const cleanTags = (art.tags || []).map(t =>
          t.toLowerCase() === sourceTag.name.toLowerCase() ? targetTag.name : t
        );
        art.tags = [...new Set(cleanTags)];
        await art.save();
      }

      // 3. Recount articles on target tag
      const newCount = await Article.countDocuments({
        $or: [
          { tagIds: targetTag._id },
          { tags: new RegExp(`^${targetTag.name}$`, 'i') }
        ]
      });
      targetTag.count = newCount;
      await targetTag.save();

      // 4. Remove source tag
      await Tag.findByIdAndDelete(sourceTag._id);

      return res.json({
        success: true,
        message: `Successfully merged #${sourceTag.name} into #${targetTag.name}. Updated ${affectedArticles.length} article(s).`,
        data: targetTag
      });
    }

    const store = readFallbackTaxonomy();
    store.tags = store.tags.filter(t => t._id !== sourceTagId);
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Tags merged successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete unused tags (tags with 0 associated articles)
router.delete('/admin/tags/unused/all', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    if (isDbConnected()) {
      const allTags = await Tag.find();
      let deletedCount = 0;
      for (const tag of allTags) {
        const count = await Article.countDocuments({
          $or: [
            { tagIds: tag._id },
            { tags: new RegExp(`^${tag.name}$`, 'i') },
            { tags: new RegExp(`^${tag.slug}$`, 'i') }
          ]
        });
        if (count === 0) {
          await Tag.findByIdAndDelete(tag._id);
          deletedCount++;
        }
      }
      return res.json({ success: true, message: `Removed ${deletedCount} unused tags`, deletedCount });
    }
    res.json({ success: true, message: 'Unused tags cleaned up', deletedCount: 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/tags/:id', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';

    if (isDbConnected()) {
      const tag = await Tag.findById(id);
      if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });

      const articleCount = await Article.countDocuments({
        $or: [
          { tagIds: tag._id },
          { tags: new RegExp(`^${tag.name}$`, 'i') }
        ]
      });

      if (articleCount > 0 && !force) {
        return res.status(400).json({
          success: false,
          inUse: true,
          articleCount,
          message: `Tag "#${tag.name}" is attached to ${articleCount} article(s). Confirm deletion to detach.`
        });
      }

      // Detach from articles if deleting
      await Article.updateMany(
        { tagIds: tag._id },
        { $pull: { tagIds: tag._id, tags: tag.name } }
      );

      await Tag.findByIdAndDelete(id);
      return res.json({ success: true, message: `Tag "#${tag.name}" deleted successfully` });
    }

    const store = readFallbackTaxonomy();
    store.tags = store.tags.filter(t => t._id !== id && t.slug !== id);
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/tags/bulk-delete', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of tag IDs is required' });
    }
    if (isDbConnected()) {
      await Article.updateMany(
        { tagIds: { $in: ids } },
        { $pull: { tagIds: { $in: ids } } }
      );
      const result = await Tag.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: `Deleted ${result.deletedCount} tags`, deletedCount: result.deletedCount });
    }
    const store = readFallbackTaxonomy();
    const strIds = new Set(ids.map(String));
    store.tags = store.tags.filter(t => !strIds.has(String(t._id)) && !strIds.has(String(t.slug)));
    writeFallbackTaxonomy(store);
    res.json({ success: true, message: 'Deleted tags successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
