import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { isDbConnected } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackFilePath = path.join(__dirname, '..', 'menu_data_store.json');

export const DEFAULT_MENU_ITEMS = [
  {
    id: "founder-first",
    label: "Founder First",
    type: "anchor",
    target: "founder-first",
    hasDropdown: true,
    isBadge: false,
    order: 1,
    visible: true,
    dropdownColumns: [
      {
        title: "Journeys & Playbooks",
        items: [
          { label: "Unicorn Playbooks", query: "unicorn" },
          { label: "Bootstrapped Heroes", query: "bootstrapped" },
          { label: "Zero to One Stories", query: "founder" },
          { label: "Pivot & Resilience", query: "pivot" }
        ]
      },
      {
        title: "Early-Stage & Capital",
        items: [
          { label: "Seed & Angel Checks", query: "seed" },
          { label: "Cap Table Rules", categoryId: "captable" },
          { label: "Pitch Deck Teardowns", action: "pitch" }
        ]
      },
      {
        title: "Scale & Leadership",
        items: [
          { label: "First 100 Hires", query: "hiring" },
          { label: "Global Expansion", query: "expansion" },
          { label: "Path to IPO", query: "ipo" }
        ]
      }
    ]
  },
  {
    id: "just-in",
    label: "Just In",
    type: "page",
    target: "just-in",
    hasDropdown: true,
    isBadge: false,
    order: 2,
    visible: true,
    dropdownColumns: [
      {
        title: "Breaking & Live",
        items: [
          { label: "Real-Time Headlines", query: "news" },
          { label: "Today's Funding Checks", query: "funding" },
          { label: "Policy & Regulatory", query: "policy" }
        ]
      },
      {
        title: "Trending Sectors",
        items: [
          { label: "AI Startups & LLMs", categoryId: "ai-story" },
          { label: "D2C Brands & MSMEs", categoryId: "smbstory" },
          { label: "Enterprise Tech", categoryId: "enterprise" }
        ]
      }
    ]
  },
  {
    id: "brands",
    label: "Brands",
    type: "category",
    target: "brands",
    hasDropdown: true,
    isBadge: false,
    order: 3,
    visible: true,
    dropdownColumns: [
      {
        title: "Flagship Desks",
        items: [
          { label: "EnterpriseStory", categoryId: "enterprise" },
          { label: "YS हिंदी", categoryId: "hindi" },
          { label: "SMBStory", categoryId: "smbstory" },
          { label: "AIStory", categoryId: "ai-story" },
          { label: "HerStory", categoryId: "her-story" },
          { label: "SocialStory", categoryId: "social-story" }
        ]
      }
    ]
  },
  {
    id: "resources",
    label: "Resources",
    type: "link",
    target: "resources",
    hasDropdown: true,
    isBadge: false,
    order: 4,
    visible: true,
    dropdownColumns: [
      {
        title: "Founder Toolkit",
        items: [
          { label: "Valuation Benchmark", query: "valuation" },
          { label: "Pitch Guides", action: "pitch" },
          { label: "CapTable Deep-dives", categoryId: "captable" }
        ]
      }
    ]
  },
  {
    id: "ystv",
    label: "YSTV",
    type: "anchor",
    target: "ystv",
    hasDropdown: false,
    isBadge: false,
    order: 5,
    visible: true,
    dropdownColumns: []
  },
  {
    id: "techsparks",
    label: "TechSparks 2026",
    type: "link",
    target: "https://techsparks.yourstory.com",
    hasDropdown: false,
    isBadge: true,
    badgeText: "2026",
    order: 6,
    visible: true,
    dropdownColumns: []
  },
  {
    id: "newsletter",
    label: "Newsletter",
    type: "anchor",
    target: "newsletter",
    hasDropdown: false,
    isBadge: false,
    order: 7,
    visible: true,
    dropdownColumns: []
  }
];

function readFallbackMenu() {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  writeFallbackMenu(DEFAULT_MENU_ITEMS);
  return DEFAULT_MENU_ITEMS;
}

function writeFallbackMenu(data) {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

// 1. GET /api/menu
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      let items = await MenuItem.find().sort({ order: 1 });
      if (items.length === 0) {
        // Seed default menu items
        await MenuItem.insertMany(DEFAULT_MENU_ITEMS);
        items = await MenuItem.find().sort({ order: 1 });
      }
      return res.json({ success: true, data: items });
    }

    const items = readFallbackMenu();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. POST /api/menu (Create item)
router.post('/', async (req, res) => {
  try {
    const { label, id, type = 'category', target = '', hasDropdown = false, isBadge = false, badgeText = '', visible = true, dropdownColumns = [] } = req.body;
    if (!label) return res.status(400).json({ success: false, message: 'Label is required' });

    const itemId = id || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newItem = {
      id: itemId,
      label,
      type,
      target: target || itemId,
      hasDropdown,
      isBadge,
      badgeText,
      visible,
      order: Date.now(),
      dropdownColumns: dropdownColumns || []
    };

    if (isDbConnected()) {
      // Check existing id
      const existing = await MenuItem.findOne({ id: itemId });
      if (existing) {
        return res.status(400).json({ success: false, message: `Menu item with id "${itemId}" already exists.` });
      }
      const created = await MenuItem.create(newItem);
      return res.status(201).json({ success: true, message: 'Menu item created', data: created });
    }

    const list = readFallbackMenu();
    if (list.some(m => m.id === itemId)) {
      return res.status(400).json({ success: false, message: `Menu item with id "${itemId}" already exists.` });
    }
    list.push(newItem);
    writeFallbackMenu(list);

    res.status(201).json({ success: true, message: 'Menu item created', data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. PUT /api/menu/:id (Update item)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbConnected()) {
      const updated = await MenuItem.findOneAndUpdate({ id }, updates, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Menu item not found' });
      return res.json({ success: true, message: 'Menu item updated', data: updated });
    }

    const list = readFallbackMenu();
    const index = list.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Menu item not found' });

    list[index] = { ...list[index], ...updates };
    writeFallbackMenu(list);

    res.json({ success: true, message: 'Menu item updated', data: list[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. DELETE /api/menu/:id (Delete item)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await MenuItem.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ success: false, message: 'Menu item not found' });
      return res.json({ success: true, message: 'Menu item deleted' });
    }

    let list = readFallbackMenu();
    const initialLen = list.length;
    list = list.filter(m => m.id !== id);
    if (list.length === initialLen) return res.status(404).json({ success: false, message: 'Menu item not found' });
    writeFallbackMenu(list);

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. POST /api/menu/reset (Reset to default)
router.post('/reset', async (req, res) => {
  try {
    if (isDbConnected()) {
      await MenuItem.deleteMany({});
      await MenuItem.insertMany(DEFAULT_MENU_ITEMS);
      const items = await MenuItem.find().sort({ order: 1 });
      return res.json({ success: true, message: 'Menu reset to defaults', data: items });
    }

    writeFallbackMenu(DEFAULT_MENU_ITEMS);
    res.json({ success: true, message: 'Menu reset to defaults', data: DEFAULT_MENU_ITEMS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
