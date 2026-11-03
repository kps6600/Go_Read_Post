import express from 'express';
import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import Article from '../models/Article.js';
import Video from '../models/Video.js';
import Story from '../models/Story.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, protectAuthor } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
export const adminSubmissionsRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackSubmissionsPath = path.join(__dirname, '..', 'submissions_data_store.json');

const INITIAL_SUBMISSIONS = [
  {
    type: 'pitch',
    pitchFormat: 'article',
    startupName: 'Cynlr Robotics',
    founderName: 'Gokul N A & N A Nikhil',
    founderRole: 'Co-Founders',
    sector: 'DeepTech & Robotics',
    stage: 'Series A',
    website: 'https://cynlr.com',
    metricMoat: '$14.5M Raised, 24 Global Deployments',
    headline: 'How Cynlr is teaching robotic arms to see, understand and manipulate objects like human hands',
    summary: 'Bengaluru-based deeptech robotics pioneer Cynlr develops neuro-inspired vision hardware and software pipelines enabling robots to handle dynamic unstructured manufacturing environments.',
    details: 'With proprietary visual intelligence, Cynlr enables universal manipulation across high-speed industrial assembly lines.',
    name: 'Gokul N A',
    email: 'founders@cynlr.com',
    phone: '+91 98450 77112',
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 72)
  },

  {
    type: 'pitch',
    pitchFormat: 'article',
    startupName: 'Neuraflow AI',
    founderName: 'Aditya Kulkarni',
    founderRole: 'Founder & CEO',
    sector: 'AI & Deep Tech',
    stage: 'Seed / Early Stage',
    website: 'https://neuraflow.ai',
    metricMoat: '$420K ARR, 140 Enterprise Clients in 6 Months',
    headline: 'Neuraflow AI launches autonomous agentic QA reasoning pipelines for high-reliability software teams',
    summary: 'Neuraflow AI eliminates flaky manual regression testing by deploying specialized self-correcting neural agents.',
    details: 'Backed by leading angel syndicates, Neuraflow represents the first commercial Indic agentic test framework.',
    name: 'Aditya Kulkarni',
    email: 'aditya@neuraflow.ai',
    phone: '+91 98234 11223',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    type: 'contact',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@apexventure.in',
    phone: '+91 99887 76655',
    subject: 'Partnership Inquiry for TechSparks 2027 Sponsorship',
    message: 'We are looking to host an exclusive closed-door LP roundtable during the upcoming Bengaluru edition. Please connect us with your corporate alliances desk.',
    status: 'reviewing',
    createdAt: new Date(Date.now() - 3600000 * 24)
  }
];

function readFallbackSubmissions() {
  try {
    if (fs.existsSync(fallbackSubmissionsPath)) {
      const data = fs.readFileSync(fallbackSubmissionsPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_SUBMISSIONS;
}

function writeFallbackSubmissions(data) {
  try {
    fs.writeFileSync(fallbackSubmissionsPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}


const seedLockPath = path.join(__dirname, '..', '.submissions_seeded');

export async function ensureSubmissionsSeeded() {
  if (!isDbConnected()) return;
  try {
    if (fs.existsSync(seedLockPath)) {
      return; // Already seeded once. Respect user deletions permanently!
    }
    const count = await Submission.countDocuments();
    if (count === 0) {
      await Submission.insertMany(INITIAL_SUBMISSIONS);
      console.log('✅ Seeded starter Submissions into MongoDB');
    }
    fs.writeFileSync(seedLockPath, new Date().toISOString(), 'utf-8');
  } catch (e) {}
}


// Sync any authored draft pitches (articles or videos) into the submissions collection
async function syncAuthorDraftPitchesToSubmissions() {
  if (!isDbConnected()) return;
  try {
    // Clean up any previously published submissions so they do not show in the submissions queue
    // Keep published submissions intact so they appear in published view

    // 1. Sync Author Articles (drafts, pending pitches, and published stories)
    const authorArticles = await Article.find({
      $or: [
        { isPitch: true },
        { authorName: { $exists: true, $ne: '' } }
      ]
    }).sort({ createdAt: -1 }).limit(100);

    for (const draft of authorArticles) {
      const headline = draft.title || '';
      if (!headline) continue;

      const exists = await Submission.findOne({
        $or: [
          { draftArticleId: String(draft._id) },
          { headline: headline }
        ]
      });

      if (!exists) {
        await Submission.create({
          type: 'pitch',
          pitchFormat: 'article',
          draftArticleId: String(draft._id),
          startupName: draft.categoryName || 'Author Story Pitch',
          founderName: draft.authorName || 'Contributing Author',
          founderRole: draft.authorTitle || 'Contributing Author',
          sector: draft.categoryName || 'Startups',
          stage: draft.status === 'published' ? 'Published Story' : 'Story Draft',
          headline: headline,
          summary: draft.subtitle || draft.excerpt || (draft.content ? draft.content.replace(/<[^>]*>/g, '').slice(0, 180) : 'Author story submission.'),
          details: draft.content ? draft.content.replace(/<[^>]*>/g, '').slice(0, 800) : '',
          coverImage: draft.featuredImage?.url || draft.image || '',
          name: draft.authorName || 'Contributing Author',
          email: draft.pitchedByEmail || (draft.authorName ? `${draft.authorName.toLowerCase().replace(/\s+/g, '.')}@goreadpost.com` : ''),
          authorEmail: draft.pitchedByEmail || (draft.authorName ? `${draft.authorName.toLowerCase().replace(/\s+/g, '.')}@goreadpost.com` : ''),
          category: draft.categoryName || 'Startups',
          status: draft.status === 'published' ? 'published' : (draft.status || 'pending'),
          createdAt: draft.publishedAt || draft.createdAt || new Date()
        });
      } else if (draft.status === 'published' && exists.status !== 'published') {
        exists.status = 'published';
        await exists.save();
      }
    }

    // 2. Sync Videos (shows and pitch concepts)
    if (mongoose.models.Video) {
      const authorVideos = await Video.find({}).sort({ createdAt: -1 }).limit(30);

      for (const vid of authorVideos) {
        const headline = vid.title || '';
        if (!headline) continue;

        const exists = await Submission.findOne({
          $or: [
            { draftVideoId: String(vid._id) },
            { headline: headline }
          ]
        });

        if (!exists) {
          await Submission.create({
            type: 'pitch',
            pitchFormat: 'video',
            draftVideoId: String(vid._id),
            startupName: vid.series || vid.categoryLabel || vid.category || 'Video Production',
            founderName: vid.author || vid.authorName || vid.guestName || 'Contributing Creator',
            founderRole: 'Video Creator',
            sector: vid.category || 'Media & Tech',
            stage: vid.status === 'published' ? 'Live Video' : 'Video Production Draft',
            headline: headline,
            summary: vid.excerpt || vid.description || 'Video show pitch submitted for broadcast.',
            details: vid.description || '',
            coverImage: vid.thumbnail || '',
            name: vid.author || vid.authorName || vid.guestName || 'Contributing Creator',
            email: 'creator@goreadpost.com',
            authorEmail: 'creator@goreadpost.com',
            category: vid.category || 'Videos',
            status: vid.status === 'published' ? 'published' : (vid.status || 'pending'),
            createdAt: vid.createdAt || new Date()
          });
        }
      }
    }
  } catch (err) {
    console.warn('Sync draft pitches warning:', err.message);
  }
}

// PUBLIC / AUTHOR: POST /api/submissions (submit pitch or contact lead)
router.post('/', (req, res, next) => {
  const type = req.body?.type || 'pitch';
  if (type === 'pitch') {
    return protectAuthor(req, res, next);
  }
  next();
}, async (req, res) => {
  try {
    const payload = req.body;
    const type = payload.type || 'pitch';

    if (type === 'pitch') {
      const headline = payload.headline || payload.title;
      const summary = payload.summary || payload.subtitle || payload.excerpt || payload.description;
      const startupName = payload.startupName || payload.categoryName || payload.series || (payload.pitchFormat === 'video' ? 'Video Pitch' : 'Author Story Pitch');

      if (!headline || !summary) {
        return res.status(400).json({ success: false, message: 'Story Headline/Title and Summary are required.' });
      }

      payload.headline = headline;
      payload.summary = summary;
      payload.startupName = startupName;
      if (!payload.founderName) {
        payload.founderName = payload.name || payload.authorName || 'Author Contributor';
      }
    } else {
      if (!payload.name || !payload.email || !payload.message) {
        return res.status(400).json({ success: false, message: 'Name, Email, and Message are required.' });
      }
    }

    const submissionData = {
      ...payload,
      type,
      status: payload.status || 'pending',
      createdAt: new Date()
    };

    if (isDbConnected()) {
      const created = await Submission.create(submissionData);
      return res.status(201).json({
        success: true,
        message: type === 'pitch' ? 'Pitch submitted successfully to Editorial Bureau!' : 'Message received! Our team will get back to you.',
        data: created
      });
    }

    const list = readFallbackSubmissions();
    const created = { ...submissionData, _id: 'subm_' + Date.now() };
    list.unshift(created);
    writeFallbackSubmissions(list);

    res.status(201).json({
      success: true,
      message: 'Submitted successfully',
      data: created
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUBLIC: GET /api/submissions (List of Pitches Content)
router.get('/', async (req, res) => {
  try {
    const { type, status, search, author, email, limit = 100 } = req.query;

    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '');
    const isAuthenticated = Boolean(token && token !== 'null' && token !== 'undefined');

    // 🔒 Protect author pitches: Unauthenticated callers cannot fetch author pitches
    if (!isAuthenticated) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    if (isDbConnected()) {
      await syncAuthorDraftPitchesToSubmissions();

      const filter = {};
      if (type && type !== 'all') {
        filter.type = type;
      }
      if (status && status !== 'all') {
        filter.status = status;
      }

      const andClauses = [];

      if (email || author) {
        const authorConds = [];
        if (email && email.trim()) {
          const em = email.trim();
          const emAlt = em.includes('-') ? em.replace(/-/g, '.') : em.replace(/\./g, '-');
          const emReg = new RegExp(em, 'i');
          const emAltReg = new RegExp(emAlt, 'i');
          authorConds.push(
            { email: { $in: [emReg, emAltReg] } },
            { authorEmail: { $in: [emReg, emAltReg] } }
          );
        }
        if (author && author.trim()) {
          const aReg = new RegExp(author.trim(), 'i');
          authorConds.push(
            { founderName: aReg },
            { name: aReg },
            { authorName: aReg }
          );
        }
        if (authorConds.length > 0) {
          andClauses.push({ $or: authorConds });
        }
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        andClauses.push({
          $or: [
            { startupName: regex },
            { founderName: regex },
            { name: regex },
            { headline: regex },
            { subject: regex },
            { sector: regex },
            { category: regex }
          ]
        });
      }

      if (andClauses.length === 1) {
        Object.assign(filter, andClauses[0]);
      } else if (andClauses.length > 1) {
        filter.$and = andClauses;
      }

      const items = await Submission.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
      return res.json({
        success: true,
        count: items.length,
        data: items
      });
    } else {
      let list = readFallbackSubmissions();
      if (type && type !== 'all') list = list.filter(s => s.type === type);
      if (status && status !== 'all') list = list.filter(s => s.status === status);
      if (email || author) {
        const em = (email || '').toLowerCase().trim();
        const emAlt = em.includes('-') ? em.replace(/-/g, '.') : em.replace(/\./g, '-');
        const an = (author || '').toLowerCase().trim();
        list = list.filter(s => {
          const sEm = (s.email || s.authorEmail || '').toLowerCase();
          const sName = (s.founderName || s.name || s.authorName || '').toLowerCase();
          const emMatch = em && (sEm.includes(em) || sEm.includes(emAlt));
          const nameMatch = an && (sName.includes(an) || an.includes(sName));
          return emMatch || nameMatch;
        });
      }
      return res.json({ success: true, count: list.length, data: list });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: GET /api/admin/submissions
adminSubmissionsRouter.get('/', protectAdmin, async (req, res) => {
  try {
    const { type, status, search, limit = 100 } = req.query;

    if (isDbConnected()) {
      await syncAuthorDraftPitchesToSubmissions();

      const filter = { status: { $ne: 'published' } };
      if (type && type !== 'all') filter.type = type;
      if (status && status !== 'all') {
        filter.status = status;
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { startupName: regex },
          { founderName: regex },
          { name: regex },
          { email: regex },
          { authorEmail: regex },
          { headline: regex },
          { subject: regex }
        ];
      }

      const items = await Submission.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
      const totalPitches = await Submission.countDocuments({ type: 'pitch' });
      const totalContacts = await Submission.countDocuments({ type: 'contact' });
      const pendingCount = await Submission.countDocuments({ status: 'pending' });

      return res.json({
        success: true,
        count: items.length,
        metrics: { totalPitches, totalContacts, pendingCount },
        data: items
      });
    }

    let items = readFallbackSubmissions();
    items = items.filter(i => i.status !== 'published');
    if (type && type !== 'all') items = items.filter(i => i.type === type);
    if (status && status !== 'all') items = items.filter(i => i.status === status);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: PUT /api/admin/submissions/:id
adminSubmissionsRouter.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (isDbConnected()) {
      const updated = await Submission.findByIdAndUpdate(id, { ...(status ? { status } : {}), ...(notes !== undefined ? { notes } : {}) }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Submission not found' });
      return res.json({ success: true, message: 'Submission updated', data: updated });
    }

    const list = readFallbackSubmissions();
    const idx = list.findIndex(i => String(i._id || i.id) === String(id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Submission not found' });
    list[idx] = { ...list[idx], ...req.body, updatedAt: new Date().toISOString() };
    writeFallbackSubmissions(list);
    res.json({ success: true, message: 'Submission updated', data: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: POST /api/admin/submissions/:id/convert-to-article (Approve & Publish Live)
adminSubmissionsRouter.post('/:id/convert-to-article', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const targetStatus = req.body?.status === 'draft' || req.query?.status === 'draft' ? 'draft' : 'published';

    if (isDbConnected()) {
      const subm = await Submission.findById(id);
      if (!subm) return res.status(404).json({ success: false, message: 'Submission not found' });

      // 1. If linked to an existing draft Article, publish or keep as draft
      if (subm.draftArticleId) {
        let existingArticle = null;
        try {
          existingArticle = await Article.findById(subm.draftArticleId);
        } catch (e) {}

        if (existingArticle) {
          existingArticle.status = targetStatus;
          existingArticle.isPitch = false;
          if (targetStatus === 'published') {
            existingArticle.publishedAt = new Date();
          }
          await existingArticle.save();

          await Submission.findByIdAndDelete(id);

          return res.json({
            success: true,
            message: targetStatus === 'draft'
              ? `Saved article "${existingArticle.title}" to Drafts!`
              : `Successfully approved & published article "${existingArticle.title}" live to GoReadPost!`,
            article: existingArticle
          });
        }
      }

      // 2. If linked to an existing draft Video, publish or keep as draft
      if (subm.draftVideoId) {
        let existingVideo = null;
        try {
          existingVideo = await Video.findById(subm.draftVideoId);
        } catch (e) {}

        if (existingVideo) {
          existingVideo.status = targetStatus;
          existingVideo.isPitch = false;
          await existingVideo.save();

          await Submission.findByIdAndDelete(id);

          return res.json({
            success: true,
            message: targetStatus === 'draft'
              ? `Saved video "${existingVideo.title}" to Drafts!`
              : `Successfully approved & published video "${existingVideo.title}" live to GoReadPost!`,
            video: existingVideo
          });
        }
      }

      // 3. Inbound Startup Pitch without pre-existing draft: create new published or draft Article
      const slug = (subm.startupName || subm.headline || 'pitch')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

      const newArticle = await Article.create({
        title: subm.headline || `${subm.startupName}: Next-Gen ${subm.sector} Innovation`,
        slug,
        subtitle: `${subm.startupName} founded by ${subm.founderName}. ${subm.metricMoat ? `Traction metric: ${subm.metricMoat}` : ''}`,
        excerpt: subm.summary,
        content: subm.details ? `<p>${subm.summary}</p><p>${subm.details}</p>` : `<p>${subm.summary}</p>`,
        authorName: subm.founderName || subm.name || 'Founder Contributor',
        authorTitle: `${subm.founderRole || 'Founder'}, ${subm.startupName}`,
        categoryName: subm.category || (subm.sector?.includes('AI') ? 'AI & DeepTech' : 'Startups'),
        tags: [subm.startupName, subm.sector, subm.stage].filter(Boolean),
        status: targetStatus,
        publishedAt: targetStatus === 'published' ? new Date() : null,
        views: targetStatus === 'published' ? 120 : 0,
        claps: 0,
        featuredImage: {
          url: subm.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
          caption: `${subm.startupName} founders`,
          credit: 'GoReadPost Editorial'
        }
      });

      await Submission.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: targetStatus === 'draft'
          ? `Successfully saved pitch as draft article "${newArticle.title}"!`
          : `Successfully approved & published pitch as article "${newArticle.title}"!`,
        article: newArticle
      });
    }

    // Fallback mode
    const list = readFallbackSubmissions();
    const idx = list.findIndex(i => String(i._id || i.id) === String(id));
    if (idx !== -1) {
      list.splice(idx, 1);
      writeFallbackSubmissions(list);
    }
    res.status(200).json({ success: true, message: 'Story pitch approved & published live!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: DELETE /api/admin/submissions/:id
adminSubmissionsRouter.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await Submission.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Submission.findOneAndDelete({ $or: [{ _id: id }, { id: id }, { draftArticleId: id }] });
      }
      if (deleted && deleted.draftArticleId) {
        try {
          await Article.findByIdAndUpdate(deleted.draftArticleId, { isPitch: false });
        } catch (e) {}
      }
      return res.json({ success: true, message: 'Submission deleted from database' });
    }
    let list = readFallbackSubmissions();
    list = list.filter(i => String(i._id || i.id) !== String(id));
    writeFallbackSubmissions(list);
    res.json({ success: true, message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
