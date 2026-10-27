import express from 'express';
import Article from '../models/Article.js';
import Author from '../models/Author.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';
import { isDbConnected } from '../db.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protectAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      const [
        totalArticles,
        publishedCount,
        draftCount,
        scheduledCount,
        archivedCount,
        totalAuthors,
        totalCategories,
        totalTopics,
        topArticles,
        articlesForViews
      ] = await Promise.all([
        Article.countDocuments(),
        Article.countDocuments({ status: 'published' }),
        Article.countDocuments({ status: 'draft' }),
        Article.countDocuments({ status: 'scheduled' }),
        Article.countDocuments({ status: 'archived' }),
        Author.countDocuments(),
        Category.countDocuments(),
        Topic.countDocuments(),
        Article.find({ status: 'published' }).sort({ views: -1 }).limit(10).select('title slug views claps categoryName authorName publishedAt'),
        Article.find().select('views claps')
      ]);

      const totalViews = articlesForViews.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalClaps = articlesForViews.reduce((acc, a) => acc + (a.claps || 0), 0);
      const avgViewsPerArticle = Math.round(totalViews / Math.max(1, publishedCount));

      // Category breakdown across all real taxonomy categories
      const categoryAggregation = await Article.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$categoryName', count: { $sum: 1 }, totalViews: { $sum: '$views' } } },
        { $sort: { count: -1, totalViews: -1 } }
      ]);

      return res.json({
        success: true,
        data: {
          metrics: {
            totalViews,
            totalClaps,
            avgViewsPerArticle,
            totalArticles,
            publishedCount,
            draftCount,
            scheduledCount,
            archivedCount,
            totalAuthors,
            totalCategories,
            totalTopics
          },
          topArticles,
          categoryBreakdown: categoryAggregation.map(c => ({
            name: c._id || 'Unassigned',
            articlesCount: c.count,
            views: c.totalViews
          }))
        }
      });
    }

    // Offline fallback data
    res.json({
      success: true,
      data: {
        metrics: {
          totalViews: 142580,
          totalArticles: 124,
          publishedCount: 112,
          draftCount: 8,
          scheduledCount: 3,
          archivedCount: 1,
          totalAuthors: 18,
          totalCategories: 12,
          totalTopics: 24
        },
        topArticles: [],
        categoryBreakdown: [
          { name: 'Technology', articlesCount: 42, views: 68000 },
          { name: 'Startups', articlesCount: 38, views: 45000 },
          { name: 'AI & DeepTech', articlesCount: 22, views: 24000 }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
