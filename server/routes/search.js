import express from 'express';
import Article from '../models/Article.js';
import Author from '../models/Author.js';
import Topic from '../models/Topic.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import { isDbConnected } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = (req.query.q || req.query.query || '').trim();
    if (!query) {
      return res.json({
        success: true,
        query: '',
        data: {
          articles: [],
          authors: [],
          topics: [],
          categories: [],
          tags: []
        },
        totalResults: 0
      });
    }

    const regex = new RegExp(query, 'i');
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    if (isDbConnected()) {
      const articleFilter = {
        status: 'published',
        $or: [
          { title: regex },
          { subtitle: regex },
          { excerpt: regex },
          { content: regex },
          { authorName: regex },
          { tags: regex },
          { topics: regex },
          { categoryName: regex }
        ]
      };

      const [articles, totalArticles, authors, topics, categories, tags] = await Promise.all([
        Article.find(articleFilter)
          .sort({ publishedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select('title slug subtitle excerpt featuredImage authorName categoryName publishedAt readingTime views claps'),

        Article.countDocuments(articleFilter),

        Author.find({
          isActive: true,
          $or: [{ name: regex }, { designation: regex }, { bio: regex }]
        }).limit(10).select('name slug designation profileImage image bio'),

        Topic.find({
          isActive: true,
          $or: [{ name: regex }, { description: regex }]
        }).limit(10).select('name slug description'),

        Category.find({
          isActive: true,
          $or: [{ name: regex }, { description: regex }]
        }).limit(10).select('name slug description image'),

        Tag.find({
          name: regex
        }).limit(15).select('name slug count')
      ]);

      const totalResults = totalArticles + authors.length + topics.length + categories.length + tags.length;

      return res.json({
        success: true,
        query,
        totalResults,
        pagination: {
          page,
          limit,
          totalArticles,
          totalPages: Math.max(1, Math.ceil(totalArticles / limit))
        },
        data: {
          articles,
          authors,
          topics,
          categories,
          tags
        }
      });
    }

    res.json({
      success: true,
      query,
      totalResults: 0,
      data: {
        articles: [],
        authors: [],
        topics: [],
        categories: [],
        tags: []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
