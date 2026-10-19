import express from 'express';
import Submission from '../models/Submission.js';
import Article from '../models/Article.js';
import Story from '../models/Story.js';
import { isDbConnected } from '../db.js';
import { protectAdmin } from '../middleware/auth.js';
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

export async function ensureSubmissionsSeeded() {
  if (!isDbConnected()) return;
  try {
    const count = await Submission.countDocuments();
    if (count === 0) {
      await Submission.insertMany(INITIAL_SUBMISSIONS);
      console.log('✅ Seeded starter Submissions into MongoDB');
    }
  } catch (e) {}
}

// PUBLIC: POST /api/submissions (submit pitch or contact lead)
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const type = payload.type || 'pitch';

    if (type === 'pitch') {
      if (!payload.startupName || !payload.headline || !payload.summary) {
        return res.status(400).json({ success: false, message: 'Startup Name, Headline, and Summary are required.' });
      }
    } else {
      if (!payload.name || !payload.email || !payload.message) {
        return res.status(400).json({ success: false, message: 'Name, Email, and Message are required.' });
      }
    }

    const submissionData = {
      ...payload,
      type,
      status: 'pending',
      createdAt: new Date()
    };

    if (isDbConnected()) {
      const created = await Submission.create(submissionData);
      return res.status(201).json({
        success: true,
        message: type === 'pitch' ? 'Pitch submitted successfully to GoReadPost Bureau!' : 'Message received! Our team will get back to you.',
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

// ADMIN: GET /api/admin/submissions
adminSubmissionsRouter.get('/', protectAdmin, async (req, res) => {
  try {
    const { type, status, search, limit = 100 } = req.query;

    if (isDbConnected()) {
      await ensureSubmissionsSeeded();
      const filter = {};
      if (type && type !== 'all') filter.type = type;
      if (status && status !== 'all') filter.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { startupName: regex },
          { founderName: regex },
          { name: regex },
          { email: regex },
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

// ADMIN: POST /api/admin/submissions/:id/convert-to-article
adminSubmissionsRouter.post('/:id/convert-to-article', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const subm = await Submission.findById(id);
      if (!subm) return res.status(404).json({ success: false, message: 'Submission not found' });

      const slug = (subm.startupName || subm.headline || 'pitch')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

      const newArticle = await Article.create({
        title: subm.headline || `${subm.startupName}: Next-Gen ${subm.sector} Innovation`,
        slug,
        subtitle: `${subm.startupName} founded by ${subm.founderName}. ${subm.metricMoat ? `Traction metric: ${subm.metricMoat}` : ''}`,
        excerpt: subm.summary,
        content: `<p>${subm.summary}</p><p>${subm.details || 'Building next-generation infrastructure for high-scale enterprise and consumer adoption.'}</p>${subm.metricMoat ? `<h3>Traction & Moat</h3><p>${subm.metricMoat}</p>` : ''}${subm.website ? `<p><strong>Official Website:</strong> <a href="${subm.website}" target="_blank" rel="noopener noreferrer">${subm.website}</a></p>` : ''}`,
        authorName: subm.founderName || 'Founder Contributor',
        authorTitle: `${subm.founderRole || 'Founder'}, ${subm.startupName}`,
        categoryName: subm.sector?.includes('AI') ? 'AI & DeepTech' : 'Startups',
        tags: [subm.startupName, subm.sector, subm.stage].filter(Boolean),
        status: 'published',
        publishedAt: new Date(),
        views: 120,
        claps: 25,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
          caption: `${subm.startupName} founders`,
          credit: 'GoReadPost Editorial'
        }
      });

      subm.status = 'published';
      subm.convertedArticleId = newArticle._id;
      await subm.save();

      return res.json({
        success: true,
        message: `Successfully converted pitch to published article "${newArticle.title}"!`,
        article: newArticle
      });
    }

    res.status(200).json({ success: true, message: 'Converted (offline simulation)' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: DELETE /api/admin/submissions/:id
adminSubmissionsRouter.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Submission.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Submission deleted' });
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
