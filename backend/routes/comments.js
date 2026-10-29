import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Comment from '../models/Comment.js';
import Article from '../models/Article.js';
import Video from '../models/Video.js';
import { isDbConnected } from '../db.js';
import { protectAuth, verifyJwtToken } from '../middleware/auth.js';
import { ensureCommentsSeeded } from '../scripts/seedComments.js';

export { ensureCommentsSeeded };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackCommentsPath = path.join(__dirname, '..', 'comments_data_store.json');
const JWT_SECRET = process.env.JWT_SECRET || 'goreadpost_cms_super_secret_jwt_key_2026_prod';

// Helper to calculate relative time
export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recently';
  const now = new Date();
  const date = new Date(dateInput);
  const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Convert raw slug to pleasant content title
export function formatSlugToTitle(slug) {
  if (!slug) return 'Community Discussion';
  const clean = slug.replace(/^target-was-/, '').replace(/-/g, ' ');
  return clean.replace(/\b\w/g, c => c.toUpperCase());
}

// Known video slugs
const KNOWN_VIDEO_SLUGS = new Set([
  'building-indias-sovereign-ai-stack-bhavish-aggarwal',
  'startup-dilution-nithin-kamath-bootstrapping-profit',
  'ghazal-alagh-mamaearth-honasa-fmcg-moat'
]);

// Seed comments for articles vs videos
function getSeedCommentsForSlug(slug, contentType = 'article', title = '') {
  const now = Date.now();
  const normalizedSlug = (slug || '').toLowerCase();
  const isVideo = contentType === 'video' || KNOWN_VIDEO_SLUGS.has(normalizedSlug) || normalizedSlug.includes('video');

  if (isVideo) {
    return [
      {
        storySlug: slug,
        contentType: 'video',
        contentTitle: title || 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
        author: 'Aditya Mathur',
        role: 'Principal, Stellaris Venture Partners',
        text: 'The breakdown on domestic AI token economics vs Silicon Valley cloud margin models is by far the most lucid explanation in Indian tech media right now.',
        likes: 42,
        isPinned: true,
        status: 'approved',
        adminReply: {
          text: 'Appreciate the feedback, Aditya. We spent 3 weeks verifying the compute amortisation figures with chip architects.',
          author: 'Editorial Desk',
          repliedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        storySlug: slug,
        contentType: 'video',
        contentTitle: title || 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
        author: 'Rohit Shenoy',
        role: 'VP Engineering, Sarvam AI',
        text: 'Crucial point about megawatt power distribution and co-locating datacenters directly next to solar farms in southern India. Thermal management is where software meets hard reality.',
        likes: 29,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        storySlug: slug,
        contentType: 'video',
        contentTitle: title || 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
        author: 'Priya Sundaram',
        role: 'Founder, IndicFlow',
        text: 'Krutrim’s approach to synthetic vernacular token generation solves the massive context drop typical of western foundation models on regional scripts.',
        likes: 18,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  return [
    {
      storySlug: slug,
      contentType: 'article',
      contentTitle: title || formatSlugToTitle(slug),
      author: 'Vikramaditya Shah',
      role: 'Principal, Peak Capital',
      text: 'Crucial analysis on this ecosystem shift. The capital discipline we are seeing across the current cohort will set a much stronger foundation for the next decade.',
      likes: 18,
      isPinned: true,
      status: 'approved',
      adminReply: {
        text: 'Spot on analysis, Vikramaditya. Our follow-up piece on Q4 capital allocation will dive deeper into Series B valuations.',
        author: 'Editorial Desk',
        repliedAt: new Date(now - 1 * 60 * 60 * 1000).toISOString()
      },
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      storySlug: slug,
      contentType: 'article',
      contentTitle: title || formatSlugToTitle(slug),
      author: 'Ananya Deshmukh',
      role: 'VP Product, SaaS Scale',
      text: 'Particularly agree with the observations on operational efficiency. Real value creation is finally getting the spotlight over pure GMV chasing.',
      likes: 12,
      isPinned: false,
      status: 'approved',
      createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString()
    }
  ];
}

// Read fallback JSON comments & normalize fields
function readFallbackComments() {
  try {
    if (fs.existsSync(fallbackCommentsPath)) {
      const data = fs.readFileSync(fallbackCommentsPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        let changed = false;
        let hasVideoComment = false;

        parsed.forEach(c => {
          if (!c.contentType) {
            const isVid = KNOWN_VIDEO_SLUGS.has(c.storySlug) || (c.storySlug || '').toLowerCase().includes('video');
            c.contentType = isVid ? 'video' : 'article';
            changed = true;
          }
          if (c.contentType === 'video') {
            hasVideoComment = true;
          }
          if (!c.contentTitle) {
            c.contentTitle = formatSlugToTitle(c.storySlug);
            changed = true;
          }
          if (c.isPinned === undefined) {
            c.isPinned = false;
            changed = true;
          }
        });

        // Ensure at least sample video discussion exists so Admin can experience video comment handling immediately
        if (!hasVideoComment) {
          const videoSeeds = getSeedCommentsForSlug('building-indias-sovereign-ai-stack-bhavish-aggarwal', 'video').map((item, idx) => ({
            _id: `video_comm_${Date.now()}_${idx}`,
            id: `video_comm_${Date.now()}_${idx}`,
            ...item
          }));
          parsed.unshift(...videoSeeds);
          changed = true;
        }

        if (changed) {
          writeFallbackComments(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading comments_data_store.json:', err.message);
  }
  return [];
}

// Write fallback JSON comments
function writeFallbackComments(data) {
  try {
    fs.writeFileSync(fallbackCommentsPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing comments_data_store.json:', err.message);
  }
}

/**
 * Format a comment doc/object into unified response structure
 */
function formatCommentResponse(c) {
  return {
    id: c._id ? String(c._id) : c.id,
    _id: c._id ? String(c._id) : c.id,
    storySlug: c.storySlug,
    contentType: c.contentType || 'article',
    contentTitle: c.contentTitle || formatSlugToTitle(c.storySlug),
    videoId: c.videoId || null,
    articleId: c.articleId ? String(c.articleId) : null,
    userId: c.userId ? String(c.userId) : null,
    userEmail: c.userEmail || '',
    author: c.author || 'Reader Contributor',
    role: c.role || 'Community Member',
    text: c.text,
    likes: c.likes || 0,
    likedBy: Array.isArray(c.likedBy) ? c.likedBy : [],
    isEdited: Boolean(c.isEdited),
    isPinned: Boolean(c.isPinned),
    adminReply: c.adminReply && c.adminReply.text ? {
      text: c.adminReply.text,
      author: c.adminReply.author || 'Editorial Desk',
      repliedAt: c.adminReply.repliedAt || null
    } : null,
    status: c.status || 'approved',
    rejection_reason: c.rejection_reason || '',
    createdAt: c.createdAt,
    time: formatRelativeTime(c.createdAt)
  };
}

/**
 * GET /api/comments
 * Query: ?slug=<story-slug>&contentType=article|video&limit=50
 */
router.get('/', async (req, res) => {
  try {
    const slug = (req.query.slug || req.query.storySlug || '').trim();
    const contentTypeReq = (req.query.contentType || '').trim().toLowerCase();

    if (!slug) {
      return res.status(400).json({ success: false, message: 'slug query parameter is required' });
    }

    const normalizedSlug = slug.toLowerCase();
    const isVideoSlug = contentTypeReq === 'video' || KNOWN_VIDEO_SLUGS.has(normalizedSlug) || normalizedSlug.includes('video');
    const finalContentType = isVideoSlug ? 'video' : 'article';

    if (isDbConnected()) {
      let dbComments = await Comment.find({ 
        storySlug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') },
        status: 'approved'
      }).sort({ isPinned: -1, createdAt: -1 }).lean();

      // If no comments in DB yet for this post, seed starter comments
      if (!dbComments || dbComments.length === 0) {
        let contentTitle = '';
        if (finalContentType === 'article') {
          try {
            const art = await Article.findOne({ slug: normalizedSlug }).select('title');
            if (art) contentTitle = art.title;
          } catch (e) {}
        } else {
          try {
            const vid = await Video.findOne({ slug: normalizedSlug }).select('title');
            if (vid) contentTitle = vid.title;
          } catch (e) {}
        }

        const seedData = getSeedCommentsForSlug(normalizedSlug, finalContentType, contentTitle);
        try {
          const inserted = await Comment.insertMany(seedData);
          dbComments = inserted.map(doc => doc.toObject());
          // Sync to file store
          const fileComments = readFallbackComments();
          fileComments.push(...dbComments);
          writeFallbackComments(fileComments);
        } catch (seedErr) {
          console.warn('Could not insert seed comments:', seedErr.message);
        }
      }

      const formatted = dbComments.map(formatCommentResponse);

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted
      });
    }

    // Fallback store
    let comments = readFallbackComments();
    let postComments = comments.filter(c => 
      (c.storySlug || '').toLowerCase() === normalizedSlug && 
      (c.status || 'approved') === 'approved'
    );

    if (postComments.length === 0) {
      const seedData = getSeedCommentsForSlug(normalizedSlug, finalContentType).map((c, i) => ({
        _id: `${finalContentType}_comm_${Date.now()}_${i}`,
        id: `${finalContentType}_comm_${Date.now()}_${i}`,
        ...c
      }));
      comments.push(...seedData);
      writeFallbackComments(comments);
      postComments = seedData;
    }

    const formatted = postComments
      .sort((a, b) => {
        if (Boolean(b.isPinned) !== Boolean(a.isPinned)) {
          return Boolean(b.isPinned) ? 1 : -1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .map(formatCommentResponse);

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch discussion' });
  }
});

/**
 * POST /api/comments
 * Body: { storySlug, author, role, text, contentType, contentTitle, videoId }
 * Requires user authentication
 */
router.post('/', protectAuth, async (req, res) => {
  try {
    const user = req.user || req.admin;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please sign in to post your perspective.' });
    }

    const { storySlug, author, role, text, contentType, contentTitle, videoId } = req.body;

    if (!storySlug || !storySlug.trim()) {
      return res.status(400).json({ success: false, message: 'Story identifier (storySlug) is required' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Perspective text is required' });
    }

    const normalizedSlug = storySlug.trim().toLowerCase();
    const isVideo = contentType === 'video' || KNOWN_VIDEO_SLUGS.has(normalizedSlug) || normalizedSlug.includes('video');
    const finalContentType = isVideo ? 'video' : 'article';

    const commentAuthor = (author && author.trim()) || user.name || user.username || 'Community Reader';
    const commentRole = (role && role.trim()) || user.title || user.designation || (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'Editorial Team' : 'Community Member');
    const commentText = text.trim();

    let resolvedTitle = (contentTitle && contentTitle.trim()) || '';
    if (!resolvedTitle) {
      if (finalContentType === 'article' && isDbConnected()) {
        try {
          const art = await Article.findOne({ slug: normalizedSlug }).select('title');
          if (art) resolvedTitle = art.title;
        } catch (e) {}
      } else if (finalContentType === 'video' && isDbConnected()) {
        try {
          const vid = await Video.findOne({ slug: normalizedSlug }).select('title');
          if (vid) resolvedTitle = vid.title;
        } catch (e) {}
      }
    }
    if (!resolvedTitle) {
      resolvedTitle = formatSlugToTitle(normalizedSlug);
    }

    const newCommentPayload = {
      storySlug: normalizedSlug,
      contentType: finalContentType,
      contentTitle: resolvedTitle,
      videoId: finalContentType === 'video' ? (videoId || normalizedSlug) : null,
      userId: user._id || user.id || null,
      userEmail: user.email || '',
      author: commentAuthor,
      role: commentRole,
      text: commentText,
      likes: 0,
      likedBy: [],
      isEdited: false,
      isPinned: false,
      adminReply: { text: '', author: '', repliedAt: null },
      status: 'approved',
      createdAt: new Date()
    };

    let savedComment = null;

    if (isDbConnected()) {
      if (finalContentType === 'article') {
        try {
          const article = await Article.findOne({ 
            $or: [{ slug: normalizedSlug }, { _id: mongoose.isValidObjectId(normalizedSlug) ? normalizedSlug : null }] 
          }).select('_id');
          if (article) {
            newCommentPayload.articleId = article._id;
          }
        } catch (e) {}
      }

      const created = await Comment.create(newCommentPayload);
      savedComment = created.toObject();

      // Mirror to fallback file store
      try {
        const fileComments = readFallbackComments();
        fileComments.unshift(savedComment);
        writeFallbackComments(fileComments);
      } catch (e) {}
    } else {
      // File store only
      const id = `${finalContentType}_comm_${Date.now()}`;
      savedComment = {
        _id: id,
        id,
        ...newCommentPayload,
        createdAt: newCommentPayload.createdAt.toISOString()
      };
      const fileComments = readFallbackComments();
      fileComments.unshift(savedComment);
      writeFallbackComments(fileComments);
    }

    return res.status(201).json({
      success: true,
      message: 'Your perspective has been posted successfully',
      data: formatCommentResponse(savedComment)
    });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to post perspective' });
  }
});

/**
 * PUT /api/comments/:id
 * Body: { text }
 * Requires user authentication (Owner or Staff)
 */
router.put('/:id', protectAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user = req.user || req.admin;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Updated perspective text cannot be empty.' });
    }

    const isStaff = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const currentUserId = user._id ? String(user._id) : (user.id ? String(user.id) : null);

    if (isDbConnected()) {
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ success: false, message: 'Perspective not found.' });
      }

      const commentOwnerId = comment.userId ? String(comment.userId) : null;
      const isOwner = (commentOwnerId && currentUserId && commentOwnerId === currentUserId) ||
                      (comment.userEmail && user.email && comment.userEmail.toLowerCase() === user.email.toLowerCase()) ||
                      (comment.author && user.name && comment.author.toLowerCase() === user.name.toLowerCase()) ||
                      isStaff;

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You can only edit your own perspective.' });
      }

      comment.text = text.trim();
      comment.isEdited = true;
      await comment.save();

      // Mirror update in fallback file store
      const fileComments = readFallbackComments();
      const match = fileComments.find(c => String(c._id || c.id) === String(id));
      if (match) {
        match.text = comment.text;
        match.isEdited = true;
        writeFallbackComments(fileComments);
      }

      return res.json({
        success: true,
        message: 'Perspective updated successfully',
        data: formatCommentResponse(comment)
      });
    }

    // Fallback file store update
    const fileComments = readFallbackComments();
    const comment = fileComments.find(c => String(c._id || c.id) === String(id));
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Perspective not found.' });
    }

    const commentOwnerId = comment.userId ? String(comment.userId) : null;
    const isOwner = (commentOwnerId && currentUserId && commentOwnerId === currentUserId) ||
                    (comment.userEmail && user.email && comment.userEmail.toLowerCase() === user.email.toLowerCase()) ||
                    (comment.author && user.name && comment.author.toLowerCase() === user.name.toLowerCase()) ||
                    isStaff;

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'You can only edit your own perspective.' });
    }

    comment.text = text.trim();
    comment.isEdited = true;
    writeFallbackComments(fileComments);

    return res.json({
      success: true,
      message: 'Perspective updated successfully',
      data: formatCommentResponse(comment)
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update perspective' });
  }
});

/**
 * POST /api/comments/:id/like
 * Toggle like for a comment: 1 like per user or unlike if clicked again
 */
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    let userId = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyJwtToken(token);
        if (decoded && decoded.id) {
          userId = String(decoded.id);
        }
      } catch (e) {}
    }

    if (!userId) {
      userId = req.body?.userId || req.headers['x-client-id'] || req.query.userId || 'anonymous_user';
    }
    userId = String(userId);

    let updatedLikes = 0;
    let isLikedNow = false;

    if (isDbConnected()) {
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ success: false, message: 'Perspective not found' });
      }

      if (!Array.isArray(comment.likedBy)) {
        comment.likedBy = [];
      }

      const existingIndex = comment.likedBy.indexOf(userId);

      if (existingIndex !== -1) {
        comment.likedBy.splice(existingIndex, 1);
        comment.likes = Math.max(0, (comment.likes || 1) - 1);
        isLikedNow = false;
      } else {
        comment.likedBy.push(userId);
        comment.likes = (comment.likes || 0) + 1;
        isLikedNow = true;
      }

      await comment.save();
      updatedLikes = comment.likes;

      // Mirror to fallback file store
      const fileComments = readFallbackComments();
      const item = fileComments.find(c => String(c._id || c.id) === String(id));
      if (item) {
        item.likes = comment.likes;
        item.likedBy = comment.likedBy;
        writeFallbackComments(fileComments);
      }

      return res.json({
        success: true,
        liked: isLikedNow,
        likes: updatedLikes,
        message: isLikedNow ? 'Perspective liked' : 'Perspective unliked'
      });
    }

    // Fallback file store update
    const fileComments = readFallbackComments();
    const item = fileComments.find(c => String(c._id || c.id) === String(id));
    if (item) {
      if (!Array.isArray(item.likedBy)) {
        item.likedBy = [];
      }
      const existingIndex = item.likedBy.indexOf(userId);

      if (existingIndex !== -1) {
        item.likedBy.splice(existingIndex, 1);
        item.likes = Math.max(0, (item.likes || 1) - 1);
        isLikedNow = false;
      } else {
        item.likedBy.push(userId);
        item.likes = (item.likes || 0) + 1;
        isLikedNow = true;
      }

      updatedLikes = item.likes;
      writeFallbackComments(fileComments);

      return res.json({
        success: true,
        liked: isLikedNow,
        likes: updatedLikes,
        message: isLikedNow ? 'Perspective liked' : 'Perspective unliked'
      });
    }

    return res.status(404).json({ success: false, message: 'Perspective not found' });
  } catch (error) {
    console.error('Error toggling like on comment:', error);
    res.status(500).json({ success: false, message: 'Failed to update like status' });
  }
});

/**
 * DELETE /api/comments/:id
 * Remove a comment (Owner or Staff)
 */
router.delete('/:id', protectAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user || req.admin;
    const isStaff = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const currentUserId = user._id ? String(user._id) : (user.id ? String(user.id) : null);

    if (isDbConnected()) {
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ success: false, message: 'Perspective not found.' });
      }

      const commentOwnerId = comment.userId ? String(comment.userId) : null;
      const isOwner = (commentOwnerId && currentUserId && commentOwnerId === currentUserId) ||
                      (comment.userEmail && user.email && comment.userEmail.toLowerCase() === user.email.toLowerCase()) ||
                      (comment.author && user.name && comment.author.toLowerCase() === user.name.toLowerCase()) ||
                      isStaff;

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You are not authorized to delete this perspective.' });
      }

      await Comment.findByIdAndDelete(id);
    }

    const fileComments = readFallbackComments().filter(c => String(c._id || c.id) !== String(id));
    writeFallbackComments(fileComments);

    res.json({ success: true, message: 'Perspective deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});

// ═════════════════════════════════════════════════════════════════
// ADMIN COMMENTS ROUTER (SEPARATE ARTICLES & VIDEOS MODERATION)
// ═════════════════════════════════════════════════════════════════
export const adminCommentsRouter = express.Router();

/**
 * POST /api/admin/comments/sync
 * Re-seed and synchronize all discussions into MongoDB
 */
adminCommentsRouter.post('/sync', protectAuth, async (req, res) => {
  try {
    const result = await ensureCommentsSeeded(true);
    res.json({
      success: true,
      message: 'Successfully synchronized comments into database.',
      metrics: result.metrics,
      count: result.count
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/comments
 * Query params: status, contentType, storySlug, search, sortBy, limit, page
 */
adminCommentsRouter.get('/', protectAuth, async (req, res) => {
  try {
    const { status, contentType, storySlug, author, search, sortBy = 'newest', limit = 100, page = 1 } = req.query;

    if (isDbConnected()) {
      const filter = {};

      // Status filter
      if (status && status !== 'all') {
        if (status === 'pending_review' || status === 'pending') {
          filter.status = { $in: ['pending', 'pending_review'] };
        } else if (status === 'rejected_hidden') {
          filter.status = { $in: ['rejected', 'hidden'] };
        } else {
          filter.status = status;
        }
      }

      // Content Type filter ('article' | 'video')
      if (contentType && contentType !== 'all') {
        filter.contentType = contentType.toLowerCase();
      }

      // Specific Story / Video slug filter
      if (storySlug && storySlug !== 'all' && storySlug.trim()) {
        filter.storySlug = { $regex: new RegExp(`^${storySlug.trim()}$`, 'i') };
      }

      // Author filter
      if (author && author !== 'all' && author.trim()) {
        filter.author = { $regex: new RegExp('^' + author.trim() + '$', 'i') };
      }

      // Text search
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { author: regex },
          { text: regex },
          { role: regex },
          { storySlug: regex },
          { contentTitle: regex },
          { userEmail: regex },
          { rejection_reason: regex }
        ];
      }

      // Sorting
      let sortSpec = { isPinned: -1, createdAt: -1 };
      if (sortBy === 'likes') {
        sortSpec = { likes: -1, createdAt: -1 };
      } else if (sortBy === 'oldest') {
        sortSpec = { createdAt: 1 };
      }

      const comments = await Comment.find(filter)
        .sort(sortSpec)
        .limit(Number(limit))
        .lean();

      // Aggregate global or contextual metrics
      const totalComments = await Comment.countDocuments();
      const approvedCount = await Comment.countDocuments({ status: 'approved' });
      const pendingCount = await Comment.countDocuments({ status: { $in: ['pending', 'pending_review'] } });
      const rejectedCount = await Comment.countDocuments({ status: 'rejected' });
      const hiddenCount = await Comment.countDocuments({ status: 'hidden' });
      const articlesCount = await Comment.countDocuments({ contentType: 'article' });
      const videosCount = await Comment.countDocuments({ contentType: 'video' });

      return res.json({
        success: true,
        count: comments.length,
        metrics: { 
          totalReviews: totalComments,
          totalComments, 
          approvedCount, 
          pendingCount, 
          rejectedHiddenCount: rejectedCount + hiddenCount,
          rejectedCount,
          hiddenCount,
          articlesCount,
          videosCount
        },
        data: comments.map(formatCommentResponse)
      });
    }

    // Fallback JSON handling
    let comments = readFallbackComments();

    // 1. Status Filter
    if (status && status !== 'all') {
      if (status === 'pending_review' || status === 'pending') {
        comments = comments.filter(c => c.status === 'pending' || c.status === 'pending_review');
      } else if (status === 'rejected_hidden') {
        comments = comments.filter(c => c.status === 'rejected' || c.status === 'hidden');
      } else {
        comments = comments.filter(c => (c.status || 'approved').toLowerCase() === status.toLowerCase());
      }
    }

    // 2. Content Type Filter
    if (contentType && contentType !== 'all') {
      const typeNorm = contentType.toLowerCase();
      comments = comments.filter(c => (c.contentType || 'article').toLowerCase() === typeNorm);
    }

    // 3. Story / Video Slug Filter
    if (storySlug && storySlug !== 'all' && storySlug.trim()) {
      const slugNorm = storySlug.trim().toLowerCase();
      comments = comments.filter(c => (c.storySlug || '').toLowerCase() === slugNorm);
    }

    // Author Filter
    if (author && author !== 'all' && author.trim()) {
      const aNorm = author.trim().toLowerCase();
      comments = comments.filter(c => (c.author || '').toLowerCase() === aNorm);
    }

    // 4. Search Filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      comments = comments.filter(c => 
        (c.author || '').toLowerCase().includes(q) ||
        (c.text || '').toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.storySlug || '').toLowerCase().includes(q) ||
        (c.contentTitle || '').toLowerCase().includes(q) ||
        (c.userEmail || '').toLowerCase().includes(q) ||
        (c.rejection_reason || '').toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    comments.sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // Pinned items stay prominent
      if (Boolean(b.isPinned) !== Boolean(a.isPinned)) {
        return Boolean(b.isPinned) ? 1 : -1;
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    const allStoreComments = readFallbackComments();
    const approvedTotal = allStoreComments.filter(c => (c.status || 'approved') === 'approved').length;
    const pendingTotal = allStoreComments.filter(c => c.status === 'pending' || c.status === 'pending_review').length;
    const rejectedTotal = allStoreComments.filter(c => c.status === 'rejected').length;
    const hiddenTotal = allStoreComments.filter(c => c.status === 'hidden').length;
    const articlesTotal = allStoreComments.filter(c => (c.contentType || 'article') === 'article').length;
    const videosTotal = allStoreComments.filter(c => c.contentType === 'video').length;

    res.json({
      success: true,
      count: comments.length,
      metrics: {
        totalReviews: allStoreComments.length,
        totalComments: allStoreComments.length,
        approvedCount: approvedTotal,
        pendingCount: pendingTotal,
        rejectedHiddenCount: rejectedTotal + hiddenTotal,
        rejectedCount: rejectedTotal,
        hiddenCount: hiddenTotal,
        articlesCount: articlesTotal,
        videosCount: videosTotal
      },
      data: comments.map(formatCommentResponse)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/comments/contents
 * Returns a grouped summary of all Articles and Videos that currently have discussions.
 * Allows the admin panel to populate an intuitive "Filter by Story / Video" selector.
 */
adminCommentsRouter.get('/contents', protectAuth, async (req, res) => {
  try {
    let allComments = [];

    if (isDbConnected()) {
      allComments = await Comment.find({}).select('storySlug contentType contentTitle status').lean();
    } else {
      allComments = readFallbackComments();
    }

    const contentMap = new Map();

    for (const c of allComments) {
      const slug = (c.storySlug || 'general').toLowerCase();
      const type = c.contentType || 'article';
      const title = c.contentTitle || formatSlugToTitle(slug);
      const key = `${type}:${slug}`;

      if (!contentMap.has(key)) {
        contentMap.set(key, {
          storySlug: slug,
          contentType: type,
          contentTitle: title,
          totalCount: 0,
          approvedCount: 0,
          pendingCount: 0,
          rejectedCount: 0
        });
      }

      const item = contentMap.get(key);
      item.totalCount++;
      const st = (c.status || 'approved').toLowerCase();
      if (st === 'approved') item.approvedCount++;
      else if (st === 'pending' || st === 'pending_review') item.pendingCount++;
      else item.rejectedCount++;
    }

    const contentList = Array.from(contentMap.values()).sort((a, b) => b.totalCount - a.totalCount);

    res.json({
      success: true,
      data: contentList
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/comments/:id/status
 * Updates review status (approved, pending, pending_review, rejected, hidden)
 */
adminCommentsRouter.put('/:id/status', protectAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    const allowed = ['approved', 'pending', 'pending_review', 'rejected', 'hidden'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Valid status is required (${allowed.join(', ')})` });
    }

    const updatePayload = { status };
    if (rejection_reason !== undefined) {
      updatePayload.rejection_reason = rejection_reason;
    }

    if (isDbConnected()) {
      const updated = await Comment.findByIdAndUpdate(id, updatePayload, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Comment not found' });
      return res.json({ success: true, message: `Review marked as ${status}`, data: formatCommentResponse(updated) });
    }

    const comments = readFallbackComments();
    const item = comments.find(c => String(c._id || c.id) === String(id));
    if (!item) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    item.status = status;
    if (rejection_reason !== undefined) {
      item.rejection_reason = rejection_reason;
    }
    writeFallbackComments(comments);

    res.json({ success: true, message: `Review marked as ${status}`, data: formatCommentResponse(item) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/admin/comments/:id/reply
 * Admin / Editorial Desk replies directly to a reader's perspective
 */
adminCommentsRouter.post('/:id/reply', protectAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author = 'Editorial Desk' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty' });
    }

    const replyObj = {
      text: text.trim(),
      author: author.trim() || 'Editorial Desk',
      repliedAt: new Date()
    };

    if (isDbConnected()) {
      const updated = await Comment.findByIdAndUpdate(
        id, 
        { adminReply: replyObj }, 
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Comment not found' });
      return res.json({ success: true, message: 'Editorial reply posted successfully', data: formatCommentResponse(updated) });
    }

    const comments = readFallbackComments();
    const item = comments.find(c => String(c._id || c.id) === String(id));
    if (!item) return res.status(404).json({ success: false, message: 'Comment not found' });

    item.adminReply = replyObj;
    writeFallbackComments(comments);

    res.json({ success: true, message: 'Editorial reply posted successfully', data: formatCommentResponse(item) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/admin/comments/:id/reply
 * Remove an existing editorial reply
 */
adminCommentsRouter.delete('/:id/reply', protectAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const updated = await Comment.findByIdAndUpdate(
        id, 
        { adminReply: { text: '', author: '', repliedAt: null } }, 
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Comment not found' });
      return res.json({ success: true, message: 'Editorial reply removed', data: formatCommentResponse(updated) });
    }

    const comments = readFallbackComments();
    const item = comments.find(c => String(c._id || c.id) === String(id));
    if (!item) return res.status(404).json({ success: false, message: 'Comment not found' });

    item.adminReply = { text: '', author: '', repliedAt: null };
    writeFallbackComments(comments);

    res.json({ success: true, message: 'Editorial reply removed', data: formatCommentResponse(item) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/comments/:id/pin
 * Toggle or set pinned status
 */
adminCommentsRouter.put('/:id/pin', protectAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;

    if (isDbConnected()) {
      const comment = await Comment.findById(id);
      if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

      comment.isPinned = isPinned !== undefined ? Boolean(isPinned) : !comment.isPinned;
      await comment.save();

      return res.json({ 
        success: true, 
        message: comment.isPinned ? 'Comment pinned to top' : 'Comment unpinned', 
        data: formatCommentResponse(comment) 
      });
    }

    const comments = readFallbackComments();
    const item = comments.find(c => String(c._id || c.id) === String(id));
    if (!item) return res.status(404).json({ success: false, message: 'Comment not found' });

    item.isPinned = isPinned !== undefined ? Boolean(isPinned) : !item.isPinned;
    writeFallbackComments(comments);

    res.json({ 
      success: true, 
      message: item.isPinned ? 'Comment pinned to top' : 'Comment unpinned', 
      data: formatCommentResponse(item) 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/admin/comments/:id
 * Permanently deletes review
 */
adminCommentsRouter.delete('/:id', protectAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Comment.findByIdAndDelete(id);
    }
    const comments = readFallbackComments().filter(c => String(c._id || c.id) !== String(id));
    writeFallbackComments(comments);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/comments/bulk/status
 * Bulk status updater
 */
adminCommentsRouter.put('/bulk/status', protectAuth, async (req, res) => {
  try {
    const { ids, status, rejection_reason } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of comment IDs is required' });
    }

    const updatePayload = { status };
    if (rejection_reason) updatePayload.rejection_reason = rejection_reason;

    if (isDbConnected()) {
      await Comment.updateMany({ _id: { $in: ids } }, updatePayload);
    }

    const comments = readFallbackComments();
    const idSet = new Set(ids.map(String));
    comments.forEach(c => {
      if (idSet.has(String(c._id || c.id))) {
        c.status = status;
        if (rejection_reason) c.rejection_reason = rejection_reason;
      }
    });
    writeFallbackComments(comments);

    res.json({ success: true, message: `${ids.length} reviews updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/admin/comments/bulk-delete
 * Bulk delete
 */
adminCommentsRouter.post('/bulk-delete', protectAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of comment IDs is required' });
    }

    if (isDbConnected()) {
      await Comment.deleteMany({ _id: { $in: ids } });
    }

    const idSet = new Set(ids.map(String));
    const comments = readFallbackComments().filter(c => !idSet.has(String(c._id || c.id)));
    writeFallbackComments(comments);

    res.json({ success: true, message: `${ids.length} reviews permanently deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
