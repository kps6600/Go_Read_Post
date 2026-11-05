import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import HomepageSection, { DEFAULT_HOMEPAGE_SECTIONS } from '../models/Homepage.js';
import Page from '../models/Page.js';
import Article from '../models/Article.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, requireRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackFilePath = path.join(__dirname, '..', 'pages_data_store.json');

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

      // For any section, prioritize custom curated articles if present
      const populatedSections = await Promise.all(
        sections.map(async (sec) => {
          const doc = sec.toObject();
          const sData = doc.data || doc.customConfig || {};

          // Guarantee clean id and type on returned object
          doc.id = doc.id || doc.sectionKey || String(doc._id);
          const isHero = doc.sectionKey === 'hero_popular' || doc.id === 'hero_popular' || doc.type === 'hero' || (doc.title && doc.title.toLowerCase().includes('hero'));
          doc.type = doc.type || (isHero ? 'hero' : (doc.sectionKey?.startsWith('sec_') ? 'stories_feed' : doc.sectionKey || 'stories_feed'));

          const customArticles = (Array.isArray(sData.articles) && sData.articles.length > 0)
            ? sData.articles
            : ((Array.isArray(doc.articles) && doc.articles.length > 0) ? doc.articles : null);

          if (customArticles && customArticles.length > 0) {
            const allPublishedArticles = await Article.find({ status: 'published' })
              .select('title slug subtitle excerpt featuredImage authorName categoryName publishedAt views claps readingTime isFeatured isTrending isBreaking')
              .lean();
            const liveMap = new Map();
            allPublishedArticles.forEach(a => {
              if (a._id) liveMap.set(String(a._id), a);
              if (a.slug) liveMap.set(String(a.slug).toLowerCase(), a);
              if (a.title) liveMap.set(String(a.title).trim().toLowerCase(), a);
            });
            const enrichedCustom = customArticles.map(raw => {
              const a = typeof raw.toObject === 'function' ? raw.toObject() : { ...raw };
              const live = liveMap.get(String(a._id || a.id || a.articleId)) ||
                           liveMap.get(String(a.slug || '').toLowerCase()) ||
                           liveMap.get(String(a.title || '').trim().toLowerCase());
              if (live) {
                if (live.views !== undefined) a.views = live.views;
                if (live.claps !== undefined) a.claps = live.claps;
              }
              return a;
            });
            doc.articles = enrichedCustom.map(formatHomepageArticle);
          } else if (doc.articleIds && doc.articleIds.length > 0) {
            doc.articles = (doc.articleIds || []).map(formatHomepageArticle);
          } else {
            let filter = { status: 'published' };
            if (doc.sectionKey === 'hero' || doc.type === 'hero') {
              filter = { status: 'published', isFeatured: true };
            } else if (doc.sectionKey === 'trending' || doc.type === 'trending') {
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
          }
          doc.data = { ...(doc.customConfig || {}), ...(doc.data || {}) };
          doc.customConfig = { ...(doc.data || {}), ...(doc.customConfig || {}) };
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
      const normalized = sections.map(s => {
        const doc = s.toObject();
        doc.id = doc.id || doc.sectionKey || String(doc._id);
        const isHero = doc.sectionKey === 'hero_popular' || doc.id === 'hero_popular' || doc.type === 'hero' || (doc.title && doc.title.toLowerCase().includes('hero'));
        doc.type = doc.type || (isHero ? 'hero' : (doc.sectionKey?.startsWith('sec_') ? 'stories_feed' : doc.sectionKey || 'stories_feed'));
        return doc;
      });
      return res.json({ success: true, count: normalized.length, data: normalized });
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

    // Sanitize sections to guarantee type and id
    const sanitizedSections = sections.map((s, idx) => {
      const isHero = s.type === 'hero' || s.sectionKey === 'hero_popular' || s.id === 'hero_popular' || (s.title && s.title.toLowerCase().includes('hero'));
      const resolvedType = s.type || (isHero ? 'hero' : (s.sectionKey && !s.sectionKey.startsWith('sec_') ? s.sectionKey : 'stories_feed'));
      const resolvedKey = s.sectionKey || (isHero ? 'hero_popular' : (s.id || `sec_${resolvedType}_${idx + 1}`));
      const resolvedId = s.id || resolvedKey;
      const sData = s.data !== undefined ? s.data : (s.customConfig || {});
      const sCustom = s.customConfig !== undefined ? s.customConfig : (s.data || {});

      return {
        ...s,
        id: resolvedId,
        type: resolvedType,
        sectionKey: resolvedKey,
        order: Number(s.order || idx + 1),
        title: s.title || (sData && (sData.heading || sData.title)) || resolvedKey,
        subtitle: s.subtitle || (sData && sData.subtitle) || '',
        enabled: s.enabled !== undefined ? Boolean(s.enabled) : true,
        data: sData,
        customConfig: sCustom
      };
    });

    if (isDbConnected()) {
      const currentKeys = sanitizedSections.map(s => s.sectionKey).filter(Boolean);
      if (currentKeys.length > 0) {
        await HomepageSection.deleteMany({ sectionKey: { $nin: currentKeys } });
      }
      for (const s of sanitizedSections) {
        const key = s.sectionKey;
        const configData = s.customConfig || {};
        const sectionData = s.data || {};
        const artIds = Array.isArray(sectionData?.articleIds)
          ? sectionData.articleIds
          : (Array.isArray(sectionData?.articles) ? sectionData.articles.map(a => a._id || a.id).filter(Boolean) : (s.articleIds || []));
        await HomepageSection.findOneAndUpdate(
          { sectionKey: key },
          {
            id: s.id,
            type: s.type,
            sectionKey: key,
            title: s.title,
            subtitle: s.subtitle,
            enabled: s.enabled,
            order: s.order,
            limit: Number(s.limit || 6),
            articleIds: artIds,
            articles: Array.isArray(sectionData?.articles) ? sectionData.articles : [],
            filterCategory: s.filterCategory || '',
            filterTag: s.filterTag || '',
            customConfig: configData,
            data: sectionData
          },
          { upsert: true, new: true }
        );
      }

      // Sync to Page 'home' in MongoDB
      try {
        const homePage = await Page.findOne({ $or: [{ id: 'home' }, { slug: '' }] });
        if (homePage) {
          homePage.sections = sanitizedSections;
          await homePage.save();
        }
      } catch (err) {
        console.error('Error syncing batch homepage sections to Page model:', err);
      }

      // Also sync to pages_data_store.json file
      try {
        if (fs.existsSync(fallbackFilePath)) {
          const list = JSON.parse(fs.readFileSync(fallbackFilePath, 'utf8'));
          const homeIdx = list.findIndex(p => p.id === 'home' || p.slug === '');
          if (homeIdx !== -1) {
            list[homeIdx].sections = sanitizedSections;
            fs.writeFileSync(fallbackFilePath, JSON.stringify(list, null, 2), 'utf8');
          }
        }
      } catch (e) {}

      const updated = await HomepageSection.find().sort({ order: 1 }).populate('articleIds', 'title slug');
      return res.json({ success: true, message: 'Homepage layout updated successfully in database', data: updated });
    }

    localHomepageSections = sanitizedSections;
    // Also sync to file in local mode
    try {
      if (fs.existsSync(fallbackFilePath)) {
        const list = JSON.parse(fs.readFileSync(fallbackFilePath, 'utf8'));
        const homeIdx = list.findIndex(p => p.id === 'home' || p.slug === '');
        if (homeIdx !== -1) {
          list[homeIdx].sections = sanitizedSections;
          fs.writeFileSync(fallbackFilePath, JSON.stringify(list, null, 2), 'utf8');
        }
      }
    } catch (e) {}

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
      if (updateData.type) mergedUpdate.type = updateData.type;
      if (updateData.id) mergedUpdate.id = updateData.id;

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
              customConfig: mergedUpdate.customConfig,
              ...(mergedUpdate.type ? { type: mergedUpdate.type } : {}),
              ...(mergedUpdate.title ? { title: mergedUpdate.title } : {}),
              ...(mergedUpdate.enabled !== undefined ? { enabled: mergedUpdate.enabled } : {})
            };
          } else {
            homePage.sections.push({
              id: updateData.id || sectionKey,
              type: updateData.type || sectionKey,
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
