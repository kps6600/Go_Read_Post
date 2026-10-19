import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import NavigationItem from '../models/NavigationItem.js';
import NavigationAuditLog from '../models/NavigationAuditLog.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, requireRoles, verifyJwtToken } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackFilePath = path.join(__dirname, '..', 'navigation_data_store.json');

// In-Memory Navigation Cache
let navCache = {
  tree: null,
  timestamp: 0,
  version: 1
};
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateNavCache() {
  navCache.tree = null;
  navCache.timestamp = 0;
  navCache.version += 1;
}

// Default initial navigation seed matching GoReadPost editorial hierarchy
export const DEFAULT_NAVIGATION_ITEMS = [
  {
    title: 'Latest',
    slug: 'latest',
    url: '/latest',
    type: 'link',
    order: 1,
    level: 0,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    openInNewTab: false,
    children: []
  },
  {
    title: 'Trending',
    slug: 'trending',
    url: '/trending',
    type: 'link',
    order: 2,
    level: 0,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    openInNewTab: false,
    children: []
  },
  {
    title: 'Categories',
    slug: 'categories',
    url: '/category/startups',
    type: 'dropdown',
    order: 3,
    level: 0,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    openInNewTab: false,
    children: [
      {
        title: 'Core Desks',
        slug: 'core-desks',
        type: 'group',
        order: 1,
        children: [
          { title: 'Startups & Ecosystem', slug: 'startups', url: '/category/startups', type: 'link', order: 1 },
          { title: 'Technology & Cloud', slug: 'technology', url: '/category/technology', type: 'link', order: 2 },
          { title: 'AI & DeepTech', slug: 'ai-deeptech', url: '/category/ai-deeptech', type: 'link', order: 3 },
          { title: 'Enterprise & SaaS', slug: 'enterprise', url: '/category/enterprise', type: 'link', order: 4 },
          { title: 'FinTech & Web3', slug: 'fintech', url: '/category/fintech', type: 'link', order: 5 }
        ]
      },
      {
        title: 'Specialty Hubs',
        slug: 'specialty-desks',
        type: 'group',
        order: 2,
        children: [
          { title: 'Founder Stories', slug: 'founder-stories', url: '/founder-first', type: 'link', order: 1 },
          { title: 'HerStory (Women Leaders)', slug: 'her-story', url: '/category/her-story', type: 'link', order: 2 },
          { title: 'SMBStory (MSME & D2C)', slug: 'smbstory', url: '/category/smbstory', type: 'link', order: 3 },
          { title: 'SocialStory (Impact & Climate)', slug: 'social-story', url: '/category/social-story', type: 'link', order: 4 },
          { title: 'YS Hindi Edition', slug: 'hindi', url: '/category/hindi', type: 'link', order: 5 }
        ]
      },
      {
        title: 'Multimedia & Hubs',
        slug: 'multimedia-hubs',
        type: 'group',
        order: 3,
        children: [
          { title: 'Videos & Studio Shows', slug: 'videos-hub', url: '/videos', type: 'link', order: 1 },
          { title: 'TechSparks Summit', slug: 'techsparks-hub', url: '/techsparks', type: 'link', order: 2 },
          { title: 'Brands Hub', slug: 'brands-hub', url: '/brands', type: 'link', order: 3 },
          { title: 'Research & Reports', slug: 'resources-hub', url: '/resources', type: 'link', order: 4 }
        ]
      }
    ]
  },
  {
    title: 'Topics',
    slug: 'topics',
    url: '/topic/artificial-intelligence',
    type: 'dropdown',
    order: 4,
    level: 0,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    openInNewTab: false,
    children: [
      {
        title: 'Frontier Tech & AI',
        slug: 'frontier-tech',
        type: 'group',
        order: 1,
        children: [
          { title: 'Artificial Intelligence', slug: 'ai-topic-link', url: '/topic/artificial-intelligence', type: 'link', order: 1 },
          { title: 'ChatGPT & LLMs', slug: 'chatgpt-tag-link', url: '/tag/chatgpt', type: 'link', order: 2 },
          { title: 'Compute & Chips', slug: 'compute-link', url: '/topic/compute', type: 'link', order: 3 },
          { title: 'Robotics & Automation', slug: 'robotics-link', url: '/topic/robotics', type: 'link', order: 4 },
          { title: 'Cybersecurity & Defense', slug: 'cyber-link', url: '/topic/cyber', type: 'link', order: 5 }
        ]
      },
      {
        title: 'Markets & Capital',
        slug: 'markets-capital',
        type: 'group',
        order: 2,
        children: [
          { title: 'Venture Capital & Deals', slug: 'vc-link', url: '/topic/venture-capital', type: 'link', order: 1 },
          { title: 'Seed & Early-Stage', slug: 'seed-link', url: '/topic/seed-funding', type: 'link', order: 2 },
          { title: 'Unicorns & Late Stage', slug: 'unicorns-link', url: '/topic/unicorns', type: 'link', order: 3 },
          { title: 'IPO & Public Markets', slug: 'ipo-link', url: '/topic/ipo', type: 'link', order: 4 }
        ]
      },
      {
        title: 'Global Trends',
        slug: 'global-trends',
        type: 'group',
        order: 3,
        children: [
          { title: 'Climate Tech & Energy', slug: 'climate-link', url: '/topic/climate-tech', type: 'link', order: 1 },
          { title: 'Digital Infrastructure (DPI)', slug: 'dpi-link', url: '/topic/dpi', type: 'link', order: 2 },
          { title: 'B2B SaaS & Cloud', slug: 'saas-link', url: '/topic/saas', type: 'link', order: 3 },
          { title: 'Web3 & Decentralized', slug: 'web3-link', url: '/topic/web3', type: 'link', order: 4 }
        ]
      }
    ]
  },
  {
    title: 'Company & Trust',
    slug: 'company',
    url: '/about',
    type: 'dropdown',
    order: 5,
    level: 0,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    openInNewTab: false,
    children: [
      {
        title: 'Company & Connect',
        slug: 'company-connect',
        type: 'group',
        order: 1,
        children: [
          { title: 'About Us', slug: 'about-us', url: '/about', type: 'link', order: 1 },
          { title: 'Contact Us', slug: 'contact-us', url: '/contact', type: 'link', order: 2 },
          { title: 'Advertise With Us', slug: 'advertise-link', url: '/advertise', type: 'link', order: 3 },
          { title: 'Editorial Team', slug: 'editorial-team-link', url: '/editorial-team', type: 'link', order: 4 },
          { title: 'Careers', slug: 'careers-link', url: '/careers', type: 'link', order: 5 },
          { title: 'Pitch Story', slug: 'pitch-link', url: '/pitch', type: 'link', order: 6 }
        ]
      },
      {
        title: 'Standards & Legal',
        slug: 'standards-legal',
        type: 'group',
        order: 2,
        children: [
          { title: 'Editorial Policy', slug: 'editorial-policy-link', url: '/editorial-policy', type: 'link', order: 1 },
          { title: 'Privacy Policy', slug: 'privacy-policy-link', url: '/privacy-policy', type: 'link', order: 2 },
          { title: 'Terms of Service', slug: 'terms-link', url: '/terms', type: 'link', order: 3 },
          { title: 'Disclaimer', slug: 'disclaimer-link', url: '/disclaimer', type: 'link', order: 4 }
        ]
      }
    ]
  },
  {
    title: 'Videos',
    slug: 'videos',
    url: '/videos',
    type: 'link',
    order: 6,
    level: 0,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    openInNewTab: false,
    children: []
  },
  {
    title: 'Newsletter',
    slug: 'newsletter',
    url: '/newsletter',
    type: 'link',
    order: 7,
    level: 0,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    openInNewTab: false,
    children: []
  }
];

// Helper to flatten default tree for database seeding
function flattenSeedTree(tree, parentId = null, level = 0) {
  let list = [];
  tree.forEach((item, idx) => {
    const id = (item._id && mongoose.Types.ObjectId.isValid(item._id)) 
      ? item._id 
      : new mongoose.Types.ObjectId().toString();

    const flatItem = {
      _id: id,
      title: item.title,
      slug: item.slug,
      url: item.url || (item.slug ? ('/' + item.slug) : '#'),
      type: (item.type || 'link').toLowerCase(),
      parentId: parentId,
      icon: item.icon || '',
      image: item.image || '',
      description: item.description || '',
      order: item.order || (idx + 1),
      level: item.level !== undefined ? item.level : level,
      status: (item.status || 'PUBLISHED').toUpperCase(),
      isActive: item.isActive !== false,
      isVisible: item.isVisible !== false,
      visibility: item.visibility || 'PUBLIC',
      openInNewTab: Boolean(item.openInNewTab),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(flatItem);
    if (item.children && item.children.length > 0) {
      list = list.concat(flattenSeedTree(item.children, id, level + 1));
    }
  });
  return list;
}

// Build hierarchical tree from flat list using parentId
export function buildNavigationTree(flatItems, parentId = null) {
  const result = [];
  const pIdStr = parentId ? String(parentId) : null;

  const children = flatItems.filter(item => {
    const itemParentStr = item.parentId ? String(item.parentId) : null;
    return itemParentStr === pIdStr;
  });

  children.sort((a, b) => (a.order || 0) - (b.order || 0));

  for (const child of children) {
    const node = {
      _id: child._id,
      id: child._id,
      title: child.title,
      slug: child.slug,
      url: child.url,
      type: (child.type || 'link').toLowerCase(),
      parentId: child.parentId,
      icon: child.icon || '',
      image: child.image || '',
      description: child.description || '',
      order: child.order || 0,
      level: child.level || 0,
      status: (child.status || (child.isActive === false ? 'DRAFT' : 'PUBLISHED')).toUpperCase(),
      isActive: child.isActive !== false,
      isVisible: child.isVisible !== false,
      visibility: child.visibility || 'PUBLIC',
      openInNewTab: Boolean(child.openInNewTab),
      children: buildNavigationTree(flatItems, child._id)
    };
    result.push(node);
  }

  return result;
}

// Check circular hierarchy
async function isDescendant(potentialChildId, ancestorId) {
  if (!potentialChildId || !ancestorId) return false;
  if (String(potentialChildId) === String(ancestorId)) return true;

  if (isDbConnected()) {
    let current = potentialChildId;
    const visited = new Set();
    while (current) {
      if (String(current) === String(ancestorId)) return true;
      if (visited.has(String(current))) break;
      visited.add(String(current));
      const item = await NavigationItem.findById(current).select('parentId');
      current = item ? item.parentId : null;
    }
    return false;
  }

  const list = readFallbackNav();
  let current = potentialChildId;
  const visited = new Set();
  while (current) {
    if (String(current) === String(ancestorId)) return true;
    if (visited.has(String(current))) break;
    visited.add(String(current));
    const item = list.find(i => String(i._id) === String(current));
    current = item ? item.parentId : null;
  }
  return false;
}

// Calculate level from parent
async function getMenuLevel(parentId) {
  if (!parentId) return 0;
  if (isDbConnected()) {
    const parent = await NavigationItem.findById(parentId).select('level');
    return parent ? (parent.level || 0) + 1 : 0;
  }
  const list = readFallbackNav();
  const parent = list.find(i => String(i._id) === String(parentId));
  return parent ? (parent.level || 0) + 1 : 0;
}

// Generate URL automatically from type & slug
function generateMenuUrl(type, slug, manualUrl) {
  const normType = (type || 'link').toLowerCase();
  const cleanSlug = (slug || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  // 1. If an explicit manual URL is provided (e.g. landing page or external link), always honor it
  if (manualUrl && typeof manualUrl === 'string' && manualUrl.trim() && manualUrl.trim() !== '#') {
    return manualUrl.trim();
  }

  // 2. Predefined taxonomy routes
  if (normType === 'category') {
    return cleanSlug ? `/category/${cleanSlug}` : '/category';
  }
  if (normType === 'topic') {
    return cleanSlug ? `/topic/${cleanSlug}` : '/topic';
  }
  if (normType === 'page') {
    return cleanSlug ? `/${cleanSlug}` : '/';
  }
  if (normType === 'external' || normType === 'custom') {
    return (manualUrl && manualUrl.trim()) ? manualUrl.trim() : (cleanSlug ? `/${cleanSlug}` : '#');
  }
  return cleanSlug ? `/${cleanSlug}` : (manualUrl && manualUrl.trim() ? manualUrl.trim() : '#');
}

// Read JSON fallback
function readFallbackNav() {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const initial = flattenSeedTree(DEFAULT_NAVIGATION_ITEMS);
  writeFallbackNav(initial);
  return initial;
}

function writeFallbackNav(data) {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

// --------------------------------------------------------------------------
// 1. PUBLIC API: GET /api/navigation (Cached public hierarchical navigation tree)
// --------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (isDbConnected()) {
      let totalCount = await NavigationItem.countDocuments();
      if (totalCount === 0) {
        const flatSeeds = flattenSeedTree(DEFAULT_NAVIGATION_ITEMS);
        for (const seed of flatSeeds) {
          await NavigationItem.create(seed);
        }
      }

      const items = await NavigationItem.find({ 
        isActive: true, 
        isVisible: { $ne: false },
        visibility: { $ne: 'ADMIN_ONLY' },
        $or: [
          { status: 'PUBLISHED' },
          { status: { $exists: false } },
          { status: null }
        ]
      }).sort({ order: 1 });

      const tree = buildNavigationTree(items, null);
      return res.json({ success: true, data: tree });
    }

    const flatFallback = readFallbackNav().filter(i => {
      const isLive = i.isActive !== false && i.visibility !== 'ADMIN_ONLY';
      const isPub = !i.status || i.status === 'PUBLISHED';
      return isLive && isPub;
    });
    const tree = buildNavigationTree(flatFallback, null);
    res.json({ success: true, data: tree });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --------------------------------------------------------------------------
// ADMIN ROUTER
// --------------------------------------------------------------------------
export const adminNavigationRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'goreadpost_cms_super_secret_jwt_key_2026_prod';

// Authenticate admin token if present; allow GET inspection so CMS views never break; strictly guard mutations
adminNavigationRouter.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyJwtToken(token);
      req.user = decoded;
      req.admin = decoded;
    } catch (e) {}
  }

  // Allow read operations (GET) so CMS view doesn't block on expired/absent session token
  if (req.method === 'GET') {
    return next();
  }

  // Enforce strict admin privileges for all writes / mutations (POST, PUT, DELETE, PATCH)
  return protectAdmin(req, res, next);
});

// 2. ADMIN API: GET /api/admin/navigation (Returns flat list and full tree)
adminNavigationRouter.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      let items = await NavigationItem.find().sort({ order: 1 });
      if (items.length === 0) {
        const flatSeeds = flattenSeedTree(DEFAULT_NAVIGATION_ITEMS);
        for (const seed of flatSeeds) {
          await NavigationItem.create(seed);
        }
        items = await NavigationItem.find().sort({ order: 1 });
      }
      const tree = buildNavigationTree(items, null);
      return res.json({ success: true, data: { flat: items, tree } });
    }

    const flatFallback = readFallbackNav();
    const tree = buildNavigationTree(flatFallback, null);
    res.json({ success: true, data: { flat: flatFallback, tree } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. ADMIN API: GET /api/admin/navigation/audit-logs
adminNavigationRouter.get('/audit-logs', async (req, res) => {
  try {
    if (isDbConnected()) {
      const logs = await NavigationAuditLog.find().sort({ timestamp: -1 }).limit(100);
      return res.json({ success: true, data: logs });
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. ADMIN API: GET /api/admin/navigation/:id
adminNavigationRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const item = await NavigationItem.findById(id);
      if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
      return res.json({ success: true, data: item });
    }
    const list = readFallbackNav();
    const item = list.find(i => String(i._id) === String(id));
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. ADMIN API: POST /api/admin/navigation (Create item / child / grandchild)
adminNavigationRouter.post('/', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { 
      title, 
      slug, 
      url, 
      type = 'link', 
      parentId = null, 
      icon = '', 
      image = '', 
      description = '', 
      order = 0, 
      status = 'PUBLISHED',
      isActive = true, 
      isVisible = true,
      visibility = 'PUBLIC',
      openInNewTab = false,
      target = '',
      metadata = {}
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Menu title/name is required' });
    }

    const itemSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const cleanType = (type || 'link').toLowerCase();
    const itemUrl = (url && typeof url === 'string' && url.trim() && url.trim() !== '#') 
      ? url.trim() 
      : generateMenuUrl(cleanType, itemSlug, url);

    const cleanParentId = (parentId && parentId !== 'null' && parentId !== '') ? parentId : null;
    const level = await getMenuLevel(cleanParentId);
    const cleanStatus = (status || 'PUBLISHED').toUpperCase();

    let createdItem;

    if (isDbConnected()) {
      createdItem = await NavigationItem.create({
        title: title.trim(),
        slug: itemSlug,
        url: itemUrl,
        type: cleanType,
        parentId: cleanParentId,
        icon,
        image,
        description,
        order: Number(order) || Date.now(),
        level,
        status: cleanStatus,
        isActive: cleanStatus === 'PUBLISHED' ? (isActive !== false) : false,
        isVisible: isVisible !== false,
        visibility: (visibility || 'PUBLIC').toUpperCase(),
        openInNewTab: Boolean(openInNewTab),
        target: target || '',
        metadata: metadata || {}
      });

      // Audit Log
      await NavigationAuditLog.create({
        action: 'CREATE',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        menuId: String(createdItem._id),
        menuTitle: createdItem.title,
        details: `Created menu "${createdItem.title}" (${createdItem.type}) under parent: ${cleanParentId || 'root'}`,
        changes: createdItem.toObject()
      }).catch(() => {});
    } else {
      const list = readFallbackNav();
      const id = 'nav_' + itemSlug + '_' + Date.now().toString(36);
      createdItem = {
        _id: id,
        title: title.trim(),
        slug: itemSlug,
        url: itemUrl,
        type: cleanType,
        parentId: cleanParentId,
        icon,
        image,
        description,
        order: Number(order) || list.length + 1,
        level,
        isActive: isActive !== false,
        isVisible: isVisible !== false,
        visibility: (visibility || 'PUBLIC').toUpperCase(),
        openInNewTab: Boolean(openInNewTab),
        target: target || '',
        metadata: metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(createdItem);
      writeFallbackNav(list);
    }

    invalidateNavCache();
    return res.status(201).json({ success: true, message: 'Menu item created successfully', data: createdItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. ADMIN API: PUT /api/admin/navigation/:id (Update navigation item)
adminNavigationRouter.put('/:id', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.parentId === 'null' || updates.parentId === '') updates.parentId = null;

    // Circular hierarchy prevention
    if (updates.parentId) {
      if (String(updates.parentId) === String(id)) {
        return res.status(400).json({ success: false, message: 'A menu item cannot be its own parent.' });
      }
      const circular = await isDescendant(updates.parentId, id);
      if (circular) {
        return res.status(400).json({ success: false, message: 'Circular parent relationship detected: a menu cannot be assigned to one of its descendants.' });
      }
      updates.level = await getMenuLevel(updates.parentId);
    } else if (updates.parentId === null) {
      updates.level = 0;
    }

    if (updates.type) {
      updates.type = updates.type.toLowerCase();
    }
    if (updates.slug) {
      updates.slug = updates.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (updates.url && typeof updates.url === 'string' && updates.url.trim() && updates.url.trim() !== '#') {
      updates.url = updates.url.trim();
    } else if (!updates.url || updates.url === '#') {
      updates.url = generateMenuUrl(updates.type, updates.slug, updates.url);
    }

    if (updates.status) {
      updates.status = updates.status.toUpperCase();
      if (updates.status === 'PUBLISHED' && updates.isActive === undefined) {
        updates.isActive = true;
      } else if ((updates.status === 'DRAFT' || updates.status === 'ARCHIVED') && updates.isActive === undefined) {
        updates.isActive = false;
      }
    }

    let updatedItem;

    if (isDbConnected()) {
      updatedItem = await NavigationItem.findByIdAndUpdate(id, updates, { returnDocument: 'after' });
      if (!updatedItem) return res.status(404).json({ success: false, message: 'Menu item not found' });

      // Audit Log
      await NavigationAuditLog.create({
        action: 'UPDATE',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        menuId: String(id),
        menuTitle: updatedItem.title,
        details: `Updated menu "${updatedItem.title}"`,
        changes: updates
      }).catch(() => {});
    } else {
      const list = readFallbackNav();
      const idx = list.findIndex(i => String(i._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: 'Menu item not found' });

      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFallbackNav(list);
      updatedItem = list[idx];
    }

    invalidateNavCache();
    return res.json({ success: true, message: 'Menu item updated', data: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. ADMIN API: DELETE /api/admin/navigation/:id (Delete with child protection)
adminNavigationRouter.delete('/:id', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { cascade, reparent } = req.query; // 'true' or undefined

    if (isDbConnected()) {
      let target = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        target = await NavigationItem.findById(id);
      }
      if (!target) {
        target = await NavigationItem.findOne({ $or: [{ slug: id }, { id: id }] }).catch(() => null);
      }

      if (!target) {
        // Check fallback store
        let list = readFallbackNav();
        const fallbackTarget = list.find(i => String(i._id) === String(id) || String(i.slug) === String(id));
        if (fallbackTarget) {
          list = list.filter(i => String(i._id) !== String(fallbackTarget._id));
          writeFallbackNav(list);
        }
        invalidateNavCache();
        return res.json({ success: true, message: 'Menu item deleted successfully' });
      }

      const actualId = target._id;
      const children = await NavigationItem.find({ $or: [{ parentId: actualId }, { parentId: String(actualId) }] });
      const childCount = children.length;

      if (childCount > 0 && cascade !== 'true' && reparent !== 'true') {
        return res.status(400).json({
          success: false,
          hasChildren: true,
          childCount,
          message: `This menu contains ${childCount} child menu(s). Please specify how to handle them (delete children too, or move them to the parent).`
        });
      }

      if (reparent === 'true') {
        // Re-parent children to target's parentId
        const newParentId = target.parentId;
        const newLevel = newParentId ? await getMenuLevel(newParentId) : 0;
        await NavigationItem.updateMany(
          { $or: [{ parentId: actualId }, { parentId: String(actualId) }] },
          { parentId: newParentId, level: newLevel }
        );
        await NavigationItem.findByIdAndDelete(actualId);
      } else {
        // Cascade delete item and all descendants recursively
        const toDelete = [actualId];
        let queue = [actualId];
        const visited = new Set([String(actualId)]);
        while (queue.length > 0) {
          const cur = queue.shift();
          const curChildren = await NavigationItem.find({ $or: [{ parentId: cur }, { parentId: String(cur) }] });
          for (const ch of curChildren) {
            if (!visited.has(String(ch._id))) {
              visited.add(String(ch._id));
              toDelete.push(ch._id);
              queue.push(ch._id);
            }
          }
        }
        await NavigationItem.deleteMany({ _id: { $in: toDelete } });
      }

      // Also clean from fallback store if present
      try {
        let list = readFallbackNav();
        const initialLen = list.length;
        list = list.filter(i => String(i._id) !== String(id) && String(i._id) !== String(actualId));
        if (list.length !== initialLen) {
          writeFallbackNav(list);
        }
      } catch (e) {}

      // Audit Log
      await NavigationAuditLog.create({
        action: 'DELETE',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        menuId: String(actualId),
        menuTitle: target.title,
        details: `Deleted menu "${target.title}" (mode: ${reparent === 'true' ? 'reparent children' : 'cascade delete'})`
      }).catch(() => {});
    } else {
      let list = readFallbackNav();
      const target = list.find(i => String(i._id) === String(id) || String(i.slug) === String(id));
      if (!target) {
        invalidateNavCache();
        return res.json({ success: true, message: 'Menu item deleted successfully' });
      }

      const children = list.filter(i => String(i.parentId) === String(id));
      const childCount = children.length;

      if (childCount > 0 && cascade !== 'true' && reparent !== 'true') {
        return res.status(400).json({
          success: false,
          hasChildren: true,
          childCount,
          message: `This menu contains ${childCount} child menu(s).`
        });
      }

      if (reparent === 'true') {
        list.forEach(i => {
          if (String(i.parentId) === String(id)) {
            i.parentId = target.parentId;
            i.level = target.level || 0;
          }
        });
        list = list.filter(i => String(i._id) !== String(id));
      } else {
        const toDelete = new Set([String(id)]);
        let changed = true;
        while (changed) {
          changed = false;
          for (const it of list) {
            if (it.parentId && toDelete.has(String(it.parentId)) && !toDelete.has(String(it._id))) {
              toDelete.add(String(it._id));
              changed = true;
            }
          }
        }
        list = list.filter(it => !toDelete.has(String(it._id)));
      }
      writeFallbackNav(list);
    }

    invalidateNavCache();
    return res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. ADMIN API: PATCH /api/admin/navigation/reorder (Update display orders)
adminNavigationRouter.patch('/reorder', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array required' });
    }

    if (isDbConnected()) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = typeof item === 'object' ? (item.id || item._id) : item;
        const orderNum = typeof item === 'object' && item.order !== undefined ? item.order : i + 1;
        await NavigationItem.findByIdAndUpdate(itemId, { order: orderNum });
      }

      await NavigationAuditLog.create({
        action: 'REORDER',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        details: `Reordered ${items.length} menu items`
      }).catch(() => {});
    } else {
      const list = readFallbackNav();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = typeof item === 'object' ? (item.id || item._id) : item;
        const orderNum = typeof item === 'object' && item.order !== undefined ? item.order : i + 1;
        const target = list.find(it => String(it._id) === String(itemId));
        if (target) target.order = orderNum;
      }
      writeFallbackNav(list);
    }

    invalidateNavCache();
    res.json({ success: true, message: 'Menu order updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. ADMIN API: PATCH /api/admin/navigation/:id/status (Toggle active/inactive)
adminNavigationRouter.patch('/:id/status', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    let updated;
    if (isDbConnected()) {
      updated = await NavigationItem.findByIdAndUpdate(id, { isActive }, { returnDocument: 'after' });
      if (!updated) return res.status(404).json({ success: false, message: 'Menu item not found' });

      await NavigationAuditLog.create({
        action: 'STATUS_CHANGE',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        menuId: String(id),
        menuTitle: updated.title,
        details: `${isActive ? 'Enabled' : 'Disabled'} menu "${updated.title}"`
      }).catch(() => {});
    } else {
      const list = readFallbackNav();
      const target = list.find(it => String(it._id) === String(id));
      if (!target) return res.status(404).json({ success: false, message: 'Menu item not found' });
      target.isActive = isActive;
      writeFallbackNav(list);
      updated = target;
    }

    invalidateNavCache();
    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. ADMIN API: POST /api/admin/navigation/:id/duplicate (Duplicate menu item)
adminNavigationRouter.post('/:id/duplicate', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const original = await NavigationItem.findById(id);
      if (!original) return res.status(404).json({ success: false, message: 'Menu item not found' });

      const copySlug = `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
      const duplicated = await NavigationItem.create({
        title: `${original.title} (Copy)`,
        slug: copySlug,
        url: original.url.startsWith('/') ? original.url + '-copy' : original.url,
        type: original.type,
        parentId: original.parentId,
        icon: original.icon,
        image: original.image,
        description: original.description,
        order: (original.order || 0) + 1,
        level: original.level || 0,
        isActive: original.isActive,
        isVisible: original.isVisible,
        visibility: original.visibility || 'PUBLIC',
        openInNewTab: original.openInNewTab,
        target: original.target,
        metadata: original.metadata || {}
      });

      await NavigationAuditLog.create({
        action: 'DUPLICATE',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        menuId: String(duplicated._id),
        menuTitle: duplicated.title,
        details: `Duplicated menu "${original.title}" into "${duplicated.title}"`
      }).catch(() => {});

      invalidateNavCache();
      return res.status(201).json({ success: true, message: 'Menu duplicated successfully', data: duplicated });
    }

    const list = readFallbackNav();
    const original = list.find(i => String(i._id) === String(id));
    if (!original) return res.status(404).json({ success: false, message: 'Menu item not found' });

    const copySlug = `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
    const duplicated = {
      ...original,
      _id: 'nav_' + copySlug,
      title: `${original.title} (Copy)`,
      slug: copySlug,
      order: (original.order || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(duplicated);
    writeFallbackNav(list);
    invalidateNavCache();
    res.status(201).json({ success: true, message: 'Menu duplicated successfully', data: duplicated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. ADMIN API: PATCH /api/admin/navigation/:id/publish (Publish menu item)
adminNavigationRouter.patch('/:id/publish', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    let updated;
    if (isDbConnected()) {
      updated = await NavigationItem.findByIdAndUpdate(
        id, 
        { status: 'PUBLISHED', isActive: true }, 
        { returnDocument: 'after' }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Menu item not found' });

      await NavigationAuditLog.create({
        action: 'PUBLISH',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        menuId: String(id),
        menuTitle: updated.title,
        details: `Published menu "${updated.title}" live to public website`
      }).catch(() => {});
    } else {
      const list = readFallbackNav();
      const target = list.find(i => String(i._id) === String(id));
      if (!target) return res.status(404).json({ success: false, message: 'Menu item not found' });
      target.status = 'PUBLISHED';
      target.isActive = true;
      writeFallbackNav(list);
      updated = target;
    }

    invalidateNavCache();
    res.json({ success: true, message: `Menu "${updated.title}" is now Published live!`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 12. ADMIN API: PATCH /api/admin/navigation/:id/archive (Archive menu item)
adminNavigationRouter.patch('/:id/archive', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    let updated;
    if (isDbConnected()) {
      updated = await NavigationItem.findByIdAndUpdate(
        id, 
        { status: 'ARCHIVED', isActive: false }, 
        { returnDocument: 'after' }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Menu item not found' });

      await NavigationAuditLog.create({
        action: 'ARCHIVE',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        menuId: String(id),
        menuTitle: updated.title,
        details: `Archived menu "${updated.title}"`
      }).catch(() => {});
    } else {
      const list = readFallbackNav();
      const target = list.find(i => String(i._id) === String(id));
      if (!target) return res.status(404).json({ success: false, message: 'Menu item not found' });
      target.status = 'ARCHIVED';
      target.isActive = false;
      writeFallbackNav(list);
      updated = target;
    }

    invalidateNavCache();
    res.json({ success: true, message: `Menu "${updated.title}" archived successfully`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. ADMIN API: PATCH /api/admin/navigation/:id/restore (Restore archived menu item)
adminNavigationRouter.patch('/:id/restore', requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { publishNow } = req.body || {};
    const targetStatus = publishNow ? 'PUBLISHED' : 'DRAFT';
    const targetActive = publishNow ? true : false;

    let updated;
    if (isDbConnected()) {
      updated = await NavigationItem.findByIdAndUpdate(
        id, 
        { status: targetStatus, isActive: targetActive }, 
        { returnDocument: 'after' }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Menu item not found' });

      await NavigationAuditLog.create({
        action: 'RESTORE',
        adminId: req.user?.id || req.user?._id || 'admin',
        adminName: req.user?.name || req.user?.username || 'Admin',
        adminEmail: req.user?.email || '',
        menuId: String(id),
        menuTitle: updated.title,
        details: `Restored archived menu "${updated.title}" as ${targetStatus}`
      }).catch(() => {});
    } else {
      const list = readFallbackNav();
      const target = list.find(i => String(i._id) === String(id));
      if (!target) return res.status(404).json({ success: false, message: 'Menu item not found' });
      target.status = targetStatus;
      target.isActive = targetActive;
      writeFallbackNav(list);
      updated = target;
    }

    invalidateNavCache();
    res.json({ success: true, message: `Menu "${updated.title}" restored as ${targetStatus}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
