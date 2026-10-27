import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Comment from '../models/Comment.js';
import Article from '../models/Article.js';
import { isDbConnected } from '../db.js';
import { protectAuth, verifyJwtToken } from '../middleware/auth.js';
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

// Read fallback JSON comments
function readFallbackComments() {
  try {
    if (fs.existsSync(fallbackCommentsPath)) {
      const data = fs.readFileSync(fallbackCommentsPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
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

// Generate initial seed comments for a story if none exist
function getSeedCommentsForSlug(slug) {
  const now = Date.now();
  return [
    {
      storySlug: slug,
      author: 'Vikramaditya Shah',
      role: 'Principal, Peak Capital',
      text: 'Crucial analysis on this ecosystem shift. The capital discipline we are seeing across the current cohort will set a much stronger foundation for the next decade.',
      likes: 18,
      status: 'approved',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      storySlug: slug,
      author: 'Ananya Deshmukh',
      role: 'VP Product, SaaS Scale',
      text: 'Particularly agree with the observations on operational efficiency. Real value creation is finally getting the spotlight over pure GMV chasing.',
      likes: 12,
      status: 'approved',
      createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    }
  ];
}

/**
 * GET /api/comments
 * Query: ?slug=<story-slug>&limit=50
 */
router.get('/', async (req, res) => {
  try {
    const slug = (req.query.slug || req.query.storySlug || '').trim();
    if (!slug) {
      return res.status(400).json({ success: false, message: 'slug query parameter is required' });
    }

    const normalizedSlug = slug.toLowerCase();

    if (isDbConnected()) {
      let dbComments = await Comment.find({ 
        storySlug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') },
        status: 'approved'
      }).sort({ createdAt: -1 }).lean();

      // If no comments in DB yet for this post, seed the 2 realistic starter comments
      if (!dbComments || dbComments.length === 0) {
        const seedData = getSeedCommentsForSlug(normalizedSlug);
        try {
          const inserted = await Comment.insertMany(seedData);
          dbComments = inserted.map(doc => doc.toObject());
          // Also sync to file store
          const fileComments = readFallbackComments();
          fileComments.push(...dbComments);
          writeFallbackComments(fileComments);
        } catch (seedErr) {
          console.warn('Could not insert seed comments:', seedErr.message);
        }
      }

      const formatted = dbComments.map(c => ({
        id: c._id ? String(c._id) : c.id,
        _id: c._id ? String(c._id) : c.id,
        storySlug: c.storySlug,
        userId: c.userId ? String(c.userId) : null,
        userEmail: c.userEmail || '',
        author: c.author || 'Reader Contributor',
        role: c.role || 'Community Member',
        text: c.text,
        likes: c.likes || 0,
        likedBy: Array.isArray(c.likedBy) ? c.likedBy : [],
        isEdited: Boolean(c.isEdited),
        createdAt: c.createdAt,
        time: formatRelativeTime(c.createdAt)
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted
      });
    }

    // Fallback store
    let comments = readFallbackComments();
    let postComments = comments.filter(c => (c.storySlug || '').toLowerCase() === normalizedSlug);

    if (postComments.length === 0) {
      const seedData = getSeedCommentsForSlug(normalizedSlug).map((c, i) => ({
        _id: `comment_${Date.now()}_${i}`,
        id: `comment_${Date.now()}_${i}`,
        ...c
      }));
      comments.push(...seedData);
      writeFallbackComments(comments);
      postComments = seedData;
    }

    const formatted = postComments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(c => ({
        id: c._id || c.id,
        _id: c._id || c.id,
        storySlug: c.storySlug,
        userId: c.userId ? String(c.userId) : null,
        userEmail: c.userEmail || '',
        author: c.author || 'Reader Contributor',
        role: c.role || 'Community Member',
        text: c.text,
        likes: c.likes || 0,
        likedBy: Array.isArray(c.likedBy) ? c.likedBy : [],
        isEdited: Boolean(c.isEdited),
        createdAt: c.createdAt,
        time: formatRelativeTime(c.createdAt)
      }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reader discussion' });
  }
});

/**
 * POST /api/comments
 * Body: { storySlug, author, role, text }
 * Requires user authentication
 */
router.post('/', protectAuth, async (req, res) => {
  try {
    const user = req.user || req.admin;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please sign in to post your perspective.' });
    }

    const { storySlug, author, role, text } = req.body;

    if (!storySlug || !storySlug.trim()) {
      return res.status(400).json({ success: false, message: 'Story identifier (storySlug) is required' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Perspective text is required' });
    }

    const normalizedSlug = storySlug.trim().toLowerCase();
    const commentAuthor = (author && author.trim()) || user.name || user.username || 'Community Reader';
    const commentRole = (role && role.trim()) || user.title || user.designation || (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'Editorial Team' : 'Community Member');
    const commentText = text.trim();

    const newCommentPayload = {
      storySlug: normalizedSlug,
      userId: user._id,
      userEmail: user.email || '',
      author: commentAuthor,
      role: commentRole,
      text: commentText,
      likes: 0,
      isEdited: false,
      status: 'approved',
      createdAt: new Date()
    };

    let savedComment = null;

    if (isDbConnected()) {
      // Find matching article to link articleId if available
      try {
        const article = await Article.findOne({ 
          $or: [{ slug: normalizedSlug }, { _id: mongoose.isValidObjectId(normalizedSlug) ? normalizedSlug : null }] 
        }).select('_id');
        if (article) {
          newCommentPayload.articleId = article._id;
        }
      } catch (e) {}

      const created = await Comment.create(newCommentPayload);
      savedComment = created.toObject();

      // Mirror to fallback file store as well for safety
      try {
        const fileComments = readFallbackComments();
        fileComments.unshift(savedComment);
        writeFallbackComments(fileComments);
      } catch (e) {}
    } else {
      // File store only
      const id = 'comment_' + Date.now();
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
      data: {
        id: savedComment._id ? String(savedComment._id) : savedComment.id,
        _id: savedComment._id ? String(savedComment._id) : savedComment.id,
        storySlug: savedComment.storySlug,
        userId: savedComment.userId ? String(savedComment.userId) : null,
        userEmail: savedComment.userEmail || '',
        author: savedComment.author,
        role: savedComment.role,
        text: savedComment.text,
        likes: savedComment.likes || 0,
        isEdited: false,
        createdAt: savedComment.createdAt,
        time: 'Just now'
      }
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
        data: {
          id: String(comment._id),
          _id: String(comment._id),
          storySlug: comment.storySlug,
          userId: comment.userId ? String(comment.userId) : null,
          userEmail: comment.userEmail || '',
          author: comment.author,
          role: comment.role,
          text: comment.text,
          likes: comment.likes || 0,
          isEdited: true,
          createdAt: comment.createdAt,
          time: formatRelativeTime(comment.createdAt)
        }
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
      data: {
        id: comment._id || comment.id,
        _id: comment._id || comment.id,
        storySlug: comment.storySlug,
        userId: comment.userId ? String(comment.userId) : null,
        userEmail: comment.userEmail || '',
        author: comment.author,
        role: comment.role,
        text: comment.text,
        likes: comment.likes || 0,
        isEdited: true,
        createdAt: comment.createdAt,
        time: formatRelativeTime(comment.createdAt)
      }
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update perspective' });
  }
});

/**
 * POST /api/comments/:id/like
 * Toggle like for a comment: strictly 1 like per user, or dislike/unlike if clicked again
 */
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    let userId = null;

    // 1. Check Authorization header if user is logged in
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyJwtToken(token);
        if (decoded && decoded.id) {
          userId = String(decoded.id);
        }
      } catch (e) {}
    }

    // 2. Fallback to client identifier sent from browser
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
        // User already liked -> UNLIKE / REMOVE LIKE
        comment.likedBy.splice(existingIndex, 1);
        comment.likes = Math.max(0, (comment.likes || 1) - 1);
        isLikedNow = false;
      } else {
        // User has not liked yet -> GIVE 1 LIKE
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

// ADMIN COMMENTS ROUTER
export const adminCommentsRouter = express.Router();

adminCommentsRouter.get('/', protectAuth, async (req, res) => {
  try {
    const { status, search, limit = 100 } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { author: regex },
          { text: regex },
          { role: regex },
          { storySlug: regex },
          { userEmail: regex }
        ];
      }

      const comments = await Comment.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).lean();
      const totalComments = await Comment.countDocuments();
      const approvedCount = await Comment.countDocuments({ status: 'approved' });
      const pendingCount = await Comment.countDocuments({ status: 'pending' });
      const rejectedCount = await Comment.countDocuments({ status: 'rejected' });

      return res.json({
        success: true,
        count: comments.length,
        metrics: { totalComments, approvedCount, pendingCount, rejectedCount },
        data: comments.map(c => ({
          ...c,
          id: c._id ? String(c._id) : c.id,
          _id: c._id ? String(c._id) : c.id,
          time: formatRelativeTime(c.createdAt)
        }))
      });
    }

    let comments = readFallbackComments();
    if (status && status !== 'all') comments = comments.filter(c => c.status === status);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      comments = comments.filter(c => 
        (c.author || '').toLowerCase().includes(q) ||
        (c.text || '').toLowerCase().includes(q) ||
        (c.storySlug || '').toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: comments.length,
      metrics: {
        totalComments: comments.length,
        approvedCount: comments.filter(c => c.status === 'approved').length,
        pendingCount: comments.filter(c => c.status === 'pending').length,
        rejectedCount: comments.filter(c => c.status === 'rejected').length
      },
      data: comments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

adminCommentsRouter.put('/:id/status', protectAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required (approved, pending, rejected)' });
    }

    if (isDbConnected()) {
      const updated = await Comment.findByIdAndUpdate(id, { status }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Comment not found' });
      return res.json({ success: true, message: `Comment marked as ${status}`, data: updated });
    }

    const comments = readFallbackComments();
    const item = comments.find(c => String(c._id || c.id) === String(id));
    if (!item) return res.status(404).json({ success: false, message: 'Comment not found' });
    item.status = status;
    writeFallbackComments(comments);

    res.json({ success: true, message: `Comment marked as ${status}`, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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

export default router;
