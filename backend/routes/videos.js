import express from 'express';
import Video from '../models/Video.js';
import { isDbConnected } from '../db.js';
import { protectAdmin } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
export const adminVideosRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackVideosPath = path.join(__dirname, '..', 'videos_data_store.json');

const INITIAL_VIDEO_SEEDS = [
  {
    title: 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
    slug: 'building-indias-sovereign-ai-stack-bhavish-aggarwal',
    series: 'Founders Unfiltered',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    duration: '42:15',
    views: 245000,
    likes: 18400,
    publishedAt: '2 days ago',
    guest: 'Bhavish Aggarwal',
    guestRole: 'Founder & CEO',
    guestCompany: 'Ola & Krutrim',
    guestAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Pioneered mobility across India with Ola before committing $500M+ to domestic AI silicon chips and foundation models.',
    host: 'Shradha Sharma',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/cKxRvEZd3Mw?autoplay=1&rel=0',
    videoUrl: 'https://www.youtube.com/watch?v=cKxRvEZd3Mw',
    description: 'Inside the high-stakes ambition to build India’s own supercomputing infrastructure, AI silicon accelerator chips, and domestic LLMs from scratch.',
    highlights: [
      'Why India must own its compute layer rather than renting foreign GPUs',
      'Architecture breakdown of the new 10,000-accelerator datacenter in Tamil Nadu',
      'The economics of pricing Indic AI tokens 40% below Silicon Valley hyperscalers'
    ],
    chapters: [
      { time: '00:00', label: 'The Sovereign AI Imperative', summary: 'Why relying on foreign cloud APIs is a multi-decade vulnerability.' },
      { time: '06:15', label: 'Silicon Architecture & Custom ASICs', summary: 'Engineering tape-outs for Krutrim native chip.' },
      { time: '16:40', label: 'Liquid-Cooled Datacenter Realities', summary: 'Megawatt power distribution in Tamil Nadu.' }
    ],
    isFeatured: true,
    status: 'published',
    order: 1
  },
  {
    title: 'The Hard Truth About Startup Dilution: Nithin Kamath on Bootstrapping to ₹4,000 Cr Profit',
    slug: 'startup-dilution-nithin-kamath-bootstrapping-profit',
    series: 'Studio Masterclass',
    category: 'masterclass',
    categoryLabel: 'Masterclass',
    duration: '38:40',
    views: 410000,
    likes: 34200,
    publishedAt: '4 days ago',
    guest: 'Nithin Kamath',
    guestRole: 'Founder & CEO',
    guestCompany: 'Zerodha',
    guestAvatar: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Founded Zerodha in 2010 with zero outside venture capital, disrupting Indian retail capital markets.',
    host: 'Shradha Sharma',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/CBYhVcO4WgI?autoplay=1&rel=0',
    videoUrl: 'https://www.youtube.com/watch?v=CBYhVcO4WgI',
    description: 'Zerodha founder Nithin Kamath breaks down the counter-intuitive principles of building without venture capital.',
    highlights: [
      'Why keeping zero marketing spend protected product integrity for 14 years',
      'How to resist premature international expansion and maintain high profit margins'
    ],
    isFeatured: true,
    status: 'published',
    order: 2
  },
  {
    title: 'From Garage to Public Listing: Ghazal Alagh on Scaling Honasa & The FMCG Moat',
    slug: 'ghazal-alagh-mamaearth-honasa-fmcg-moat',
    series: 'Founders Unfiltered',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    duration: '34:10',
    views: 189000,
    likes: 14500,
    publishedAt: '1 week ago',
    guest: 'Ghazal Alagh',
    guestRole: 'Co-Founder & Chief Innovation Officer',
    guestCompany: 'Honasa Consumer (Mamaearth)',
    guestAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Co-founded Honasa Consumer, pioneering toxin-free personal care and steering Mamaearth to IPO.',
    host: 'HerStory Studio',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/k2P_amIMF3o?autoplay=1&rel=0',
    videoUrl: 'https://www.youtube.com/watch?v=k2P_amIMF3o',
    description: 'The journey from addressing toxin-free baby care needs to acquiring personal care brands and executing a public listing.',
    highlights: ['Iterative product innovation driven by direct consumer feedback loops'],
    isFeatured: false,
    status: 'published',
    order: 3
  }
];

function readFallbackVideos() {
  try {
    if (fs.existsSync(fallbackVideosPath)) {
      const data = fs.readFileSync(fallbackVideosPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_VIDEO_SEEDS;
}

function writeFallbackVideos(data) {
  try {
    fs.writeFileSync(fallbackVideosPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

export async function ensureVideosSeeded() {
  if (!isDbConnected()) return;
  try {
    const count = await Video.countDocuments();
    if (count === 0) {
      await Video.insertMany(INITIAL_VIDEO_SEEDS);
      console.log('✅ Seeded initial Video episodes into MongoDB');
    }
  } catch (e) {
    console.warn('Could not seed videos:', e.message);
  }
}

// PUBLIC: GET /api/videos
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, featured } = req.query;

    if (isDbConnected()) {
      await ensureVideosSeeded();
      const filter = { status: 'published' };
      if (category && category !== 'all') filter.category = category;
      if (featured === 'true') filter.isFeatured = true;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ title: regex }, { guest: regex }, { description: regex }, { series: regex }];
      }

      const videos = await Video.find(filter).sort({ order: 1, createdAt: -1 }).limit(Number(limit));
      return res.json({ success: true, count: videos.length, data: videos });
    }

    let videos = readFallbackVideos().filter(v => v.status === 'published' || !v.status);
    if (category && category !== 'all') videos = videos.filter(v => v.category === category);
    if (featured === 'true') videos = videos.filter(v => v.isFeatured);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      videos = videos.filter(v => 
        (v.title || '').toLowerCase().includes(q) || 
        (v.guest || '').toLowerCase().includes(q)
      );
    }
    res.json({ success: true, count: videos.length, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUBLIC: GET /api/videos/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    if (isDbConnected()) {
      let video = null;
      if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        video = await Video.findById(idOrSlug);
      }
      if (!video) {
        video = await Video.findOne({ slug: idOrSlug.toLowerCase() });
      }
      if (!video) {
        return res.status(404).json({ success: false, message: 'Video episode not found' });
      }
      return res.json({ success: true, data: video });
    }

    const videos = readFallbackVideos();
    const found = videos.find(v => v._id === idOrSlug || v.id === idOrSlug || v.slug === idOrSlug);
    if (!found) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: found });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: GET /api/admin/videos (returns all statuses)
adminVideosRouter.get('/', async (req, res) => {
  try {
    const { category, search, limit = 100 } = req.query;
    if (isDbConnected()) {
      await ensureVideosSeeded();
      const filter = {};
      if (category && category !== 'all') filter.category = category;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ title: regex }, { guest: regex }, { series: regex }];
      }
      const videos = await Video.find(filter).sort({ order: 1, createdAt: -1 }).limit(Number(limit));
      return res.json({ success: true, count: videos.length, data: videos });
    }

    let videos = readFallbackVideos();
    res.json({ success: true, count: videos.length, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: POST /api/admin/videos
adminVideosRouter.post('/', protectAdmin, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.title || !payload.youtubeEmbedUrl) {
      return res.status(400).json({ success: false, message: 'Video title and Embed/Video URL are required.' });
    }

    const slug = (payload.slug || payload.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const videoData = {
      ...payload,
      slug,
      views: payload.views || 100,
      likes: payload.likes || 10,
      publishedAt: payload.publishedAt || 'Just now',
      status: payload.status || 'published'
    };

    if (isDbConnected()) {
      const created = await Video.create(videoData);
      return res.status(201).json({ success: true, message: 'Video created in database', data: created });
    }

    const list = readFallbackVideos();
    const created = { ...videoData, _id: 'video_' + Date.now() };
    list.unshift(created);
    writeFallbackVideos(list);
    res.status(201).json({ success: true, message: 'Video created', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: PUT /api/admin/videos/:id
adminVideosRouter.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    if (isDbConnected()) {
      const updated = await Video.findByIdAndUpdate(id, payload, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Video not found' });
      return res.json({ success: true, message: 'Video updated in database', data: updated });
    }

    const list = readFallbackVideos();
    const idx = list.findIndex(v => String(v._id || v.id) === String(id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Video not found' });
    list[idx] = { ...list[idx], ...payload, updatedAt: new Date().toISOString() };
    writeFallbackVideos(list);
    res.json({ success: true, message: 'Video updated', data: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: DELETE /api/admin/videos/:id
adminVideosRouter.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const deleted = await Video.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Video not found' });
      return res.json({ success: true, message: 'Video removed from database' });
    }

    let list = readFallbackVideos();
    list = list.filter(v => String(v._id || v.id) !== String(id));
    writeFallbackVideos(list);
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
