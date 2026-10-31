import express from 'express';
import HomepageSection, { DEFAULT_HOMEPAGE_SECTIONS } from '../models/Homepage.js';
import Page from '../models/Page.js';
import Article from '../models/Article.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, requireRoles } from '../middleware/auth.js';

const router = express.Router();
export const adminHomepageRouter = express.Router();

// Fallback in-memory state
let localHomepageSections = JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_SECTIONS));

// Helper: Ensure default sections in MongoDB
async function ensureDefaultSections() {
  if (!isDbConnected()) return localHomepageSections;
  const count = await HomepageSection.countDocuments();
  if (count === 0) {
    await HomepageSection.insertMany(DEFAULT_HOMEPAGE_SECTIONS);
  }
  return HomepageSection.find().sort({ order: 1 });
}

const DEFAULT_EDITORIAL_IMAGE = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&auto=format&fit=crop&q=80';

function formatHomepageArticle(art) {
  if (!art) return null;
  const a = typeof art.toObject === 'function' ? art.toObject() : art;
  const rawImg = (typeof a.featuredImage === 'string' ? a.featuredImage : a.featuredImage?.url) || a.image || a.heroImage;
  const validImg = (rawImg && typeof rawImg === 'string' && rawImg.trim().length > 0 && !rawImg.includes('[object') && !rawImg.includes('undefined'))
    ? rawImg
    : DEFAULT_EDITORIAL_IMAGE;

  return {
    ...a,
    id: a._id ? String(a._id) : (a.slug || a.id),
    _id: a._id ? String(a._id) : (a.id || a.slug),
    image: validImg,
    fallbackImage: DEFAULT_EDITORIAL_IMAGE,
    title: a.title || 'Untitled Story',
    summary: a.excerpt || a.subtitle || a.summary || '',
    category: a.categoryName || a.category || 'General',
    categoryLabel: a.categoryName || a.categoryLabel || a.category || 'General',
    readTime: a.readingTime || a.readTime || '5 min read',
    author: a.author || { name: a.authorName || 'GoReadPost Staff' }
  };
}

// 1. PUBLIC: GET /api/homepage
// Returns sections in order with live populated articles
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      await ensureDefaultSections();
      const filter = req.query.all === 'true' ? {} : { enabled: true };
      const sections = await HomepageSection.find(filter)
        .sort({ order: 1 })
        .populate({
          path: 'articleIds',
          match: { status: 'published' },
          select: 'title slug subtitle excerpt featuredImage authorName categoryName publishedAt views claps readingTime isFeatured isTrending isBreaking'
        });

      // For any section that doesn't have manually assigned articles, dynamically pull relevant published articles
      const populatedSections = await Promise.all(
        sections.map(async (sec) => {
          const doc = sec.toObject();
          if (!doc.articleIds || doc.articleIds.length === 0) {
            let filter = { status: 'published' };
            if (doc.sectionKey === 'hero') {
              filter = { status: 'published', isFeatured: true };
            } else if (doc.sectionKey === 'trending') {
              filter = { status: 'published', isTrending: true };
            } else if (doc.filterCategory) {
              filter = { status: 'published', categoryName: new RegExp(doc.filterCategory, 'i') };
            } else if (doc.filterTag) {
              filter = { status: 'published', tags: new RegExp(doc.filterTag, 'i') };
            }

            let fallbackArticles = await Article.find(filter)
              .sort({ publishedAt: -1 })
              .limit(doc.limit || 6)
              .select('title slug subtitle excerpt featuredImage authorName categoryName publishedAt views claps readingTime isFeatured isTrending isBreaking');

            if (fallbackArticles.length === 0) {
              fallbackArticles = await Article.find({ status: 'published' })
                .sort({ publishedAt: -1 })
                .limit(doc.limit || 6)
                .select('title slug subtitle excerpt featuredImage authorName categoryName publishedAt views claps readingTime isFeatured isTrending isBreaking');
            }
            doc.articles = (fallbackArticles || []).map(formatHomepageArticle);
          } else {
            doc.articles = (doc.articleIds || []).map(formatHomepageArticle);
          }
          doc.data = doc.data || doc.customConfig || {};
          doc.customConfig = doc.customConfig || doc.data || {};
          return doc;
        })
      );

      return res.json({ success: true, count: populatedSections.length, data: populatedSections });
    }

    res.json({ success: true, count: localHomepageSections.length, data: localHomepageSections });
  } catch (err) {
    console.error('Error fetching homepage layout:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. ADMIN: GET /api/admin/homepage
adminHomepageRouter.get('/', protectAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      await ensureDefaultSections();
      const sections = await HomepageSection.find()
        .sort({ order: 1 })
        .populate('articleIds', 'title slug categoryName status authorName');
      return res.json({ success: true, count: sections.length, data: sections });
    }
    res.json({ success: true, count: localHomepageSections.length, data: localHomepageSections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. ADMIN: PUT /api/admin/homepage (Batch update sections)
adminHomepageRouter.put('/', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) {
      return res.status(400).json({ success: false, message: 'Sections array is required.' });
    }

    if (isDbConnected()) {
      for (const s of sections) {
        const key = s.sectionKey || s.id || s.type;
        if (!key) continue;
        const configData = s.customConfig !== undefined ? s.customConfig : (s.data || {});
        const sectionData = s.data !== undefined ? s.data : (s.customConfig || {});
        await HomepageSection.findOneAndUpdate(
          { sectionKey: key },
          {
            sectionKey: key,
            title: s.title || (s.data && (s.data.heading || s.data.title)) || key,
            subtitle: s.subtitle || '',
            enabled: s.enabled !== undefined ? Boolean(s.enabled) : true,
            order: Number(s.order || 0),
            limit: Number(s.limit || 6),
            articleIds: s.articleIds || [],
            filterCategory: s.filterCategory || '',
            filterTag: s.filterTag || '',
            customConfig: configData,
            data: sectionData
          },
          { upsert: true, new: true }
        );
      }

      try {
        const homePage = await Page.findOne({ $or: [{ id: 'home' }, { slug: '' }] });
        if (homePage) {
          homePage.sections = sections.map((s, idx) => ({
            ...s,
            order: idx + 1,
            sectionKey: s.sectionKey || s.id || s.type,
            data: s.data !== undefined ? s.data : (s.customConfig || {}),
            customConfig: s.customConfig !== undefined ? s.customConfig : (s.data || {})
          }));
          await homePage.save();
        }
      } catch (err) {
        console.error('Error syncing batch homepage sections to Page model:', err);
      }

      const updated = await HomepageSection.find().sort({ order: 1 }).populate('articleIds', 'title slug');
      return res.json({ success: true, message: 'Homepage layout updated successfully', data: updated });
    }

    localHomepageSections = sections;
    res.json({ success: true, message: 'Homepage layout updated (local mode)', data: localHomepageSections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. ADMIN: PUT /api/admin/homepage/:sectionKey (Single Section Update)
adminHomepageRouter.put('/:sectionKey', protectAdmin, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      const mergedUpdate = {
        ...updateData,
        customConfig: updateData.customConfig !== undefined ? updateData.customConfig : (updateData.data || {}),
        data: updateData.data !== undefined ? updateData.data : (updateData.customConfig || {})
      };
      const updated = await HomepageSection.findOneAndUpdate(
        { sectionKey },
        mergedUpdate,
        { upsert: true, new: true }
      ).populate('articleIds', 'title slug');

      // Sync to Page 'home' model
      try {
        const homePage = await Page.findOne({ $or: [{ id: 'home' }, { slug: '' }] });
        if (homePage && Array.isArray(homePage.sections)) {
          const sIdx = homePage.sections.findIndex(s => (s.sectionKey || s.id || s.type) === sectionKey);
          if (sIdx !== -1) {
            homePage.sections[sIdx] = {
              ...homePage.sections[sIdx],
              data: mergedUpdate.data,
              customConfig: mergedUpdate.customConfig
            };
          } else {
            homePage.sections.push({
              id: sectionKey,
              type: sectionKey,
              sectionKey,
              enabled: true,
              data: mergedUpdate.data,
              customConfig: mergedUpdate.customConfig
            });
          }
          await homePage.save();
        }
      } catch (err) {}

      return res.json({ success: true, message: `Section ${sectionKey} updated`, data: updated });
    }

    const idx = localHomepageSections.findIndex(s => s.sectionKey === sectionKey);
    if (idx !== -1) {
      localHomepageSections[idx] = { ...localHomepageSections[idx], ...updateData };
      return res.json({ success: true, message: `Section updated (local mode)`, data: localHomepageSections[idx] });
    }
    res.status(404).json({ success: false, message: 'Section not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
