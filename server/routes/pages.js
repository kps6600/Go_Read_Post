import express from 'express';
import mongoose from 'mongoose';
import Page from '../models/Page.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, verifyJwtToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Ensure all page endpoints never get stale-cached by browsers
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackFilePath = path.join(__dirname, '..', 'pages_data_store.json');
const JWT_SECRET = process.env.JWT_SECRET || 'goreadpost_cms_super_secret_jwt_key_2026_prod';

function buildPageQuery(param) {
  const clean = (param || '').trim();
  const or = [
    { id: clean },
    { slug: clean.toLowerCase() },
    { slug: clean.toLowerCase().replace(/^\/+/, '') },
    { slug: `/${clean.toLowerCase().replace(/^\/+/, '')}` }
  ];
  if (mongoose.Types.ObjectId.isValid(clean)) {
    or.unshift({ _id: clean });
  }
  return { $or: or };
}

function findFallbackPage(list, param) {
  const clean = (param || '').trim();
  return list.find(p => 
    (p._id && p._id.toString() === clean) || 
    p.id === clean || 
    p.slug === clean.toLowerCase() ||
    p.slug === clean.toLowerCase().replace(/^\/+/, '') ||
    p.slug === `/${clean.toLowerCase().replace(/^\/+/, '')}`
  );
}

export const DEFAULT_PAGES = [
  {
    id: "home",
    title: "Homepage - Live Portal",
    slug: "",
    brand: "GoReadPost",
    description: "Main portal covering startup dispatches, fundraises, playbooks, and leadership features.",
    heroHeadline: "Stories That Matter in Indian & Global Startups",
    heroSubhead: "Unfiltered founder playbooks, deep tech breakthroughs, and market movements.",
    heroBanner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 1,
    seo: {
      title: "GoReadPost | Stories of Founders, Technology & Capital",
      description: "Leading media platform delivering unfiltered reporting on startups, funding, and deep tech.",
      keywords: ["startups", "venture capital", "deeptech", "entrepreneurship"]
    },
    sections: [
      {
        id: "sec_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          heading: "Stories That Matter in Indian & Global Startups",
          subheading: "Unfiltered founder playbooks, deep tech breakthroughs, and capital movements.",
          buttonText: "Explore Stories",
          buttonUrl: "#top",
          image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80"
        }
      }
    ]
  },
  {
    id: "latest",
    title: "Latest Stories",
    slug: "latest",
    brand: "GoReadPost",
    description: "Real-time dispatches, breaking news, and latest stories across the ecosystem.",
    heroHeadline: "Latest Dispatches & Breaking News",
    heroSubhead: "Unfiltered minute-by-minute reporting from startup newsrooms and global bureaus.",
    heroBanner: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 2,
    seo: {
      title: "Latest Stories | GoReadPost",
      description: "Discover the latest articles, startup developments, and venture capital updates.",
      keywords: ["latest news", "breaking news", "startups"]
    },
    sections: []
  },
  {
    id: "trending",
    title: "Trending Stories",
    slug: "trending",
    brand: "GoReadPost",
    description: "Most read, viral, and trending startup stories.",
    heroHeadline: "Trending in Technology & Business",
    heroSubhead: "Stories capturing the attention of founders, engineers, and market leaders today.",
    heroBanner: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 3,
    seo: {
      title: "Trending Stories | GoReadPost",
      description: "Explore the most read and viral startup dispatches.",
      keywords: ["trending", "viral stories", "startup trends"]
    },
    sections: [
      {
        id: "trending_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          title: "Top Trending Hero Slider",
          heading: "Top Trending Hero Slider",
          headline: "Discover the Top Trending Insights",
          subheadline: "Explore trending stories and verified updates across the business and startup ecosystem.",
          badge: "TRENDING NOW",
          primaryBtnText: "Read Story",
          primaryBtnUrl: "/latest",
          slideLimit: 5,
          autoPlayInterval: 7,
          heroSource: "custom",
          showPopular: false
        }
      },
      {
        id: "trending_feed",
        type: "stories_feed",
        order: 2,
        enabled: true,
        data: {
          title: "Ranked Trending Stories Feed",
          heading: "Ranked Stories",
          subtitle: "Real-time popularity index based on reader engagement and viral velocity",
          category: "",
          limit: 4,
          badgeText: "POPULAR NOW",
          viewAllText: "View All Trending",
          viewAllUrl: "/trending"
        }
      },
      {
        id: "trending_sidebar",
        type: "newsletter",
        order: 3,
        enabled: true,
        data: {
          title: "Trending Sidebar & Newsletter Banner",
          heading: "Stay Updated",
          headline: "Stay Updated",
          subtitle: "Get the latest trending articles, insights and updates delivered to your inbox.",
          buttonText: "Subscribe",
          placeholder: "Enter your email address",
          sidebarTitle: "Trending Now",
          tags: ["AI", "Web Development", "React", "Next.js", "Python", "JavaScript", "DSA", "Career", "Productivity", "Investing", "Startups", "Technology"]
        }
      }
    ]
  },
  {
    id: "videos",
    title: "Video Shows (YSTV)",
    slug: "videos",
    brand: "GoReadPost",
    description: "Original studio video shows, founder interviews, and video dispatches.",
    heroHeadline: "Studio Broadcasts & Founder Interviews",
    heroSubhead: "High-impact visual journalism with visionary founders and investors.",
    heroBanner: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 4,
    seo: {
      title: "Video Shows & Studio Broadcasts | GoReadPost",
      description: "Watch exclusive founder interviews and studio sessions.",
      keywords: ["videos", "interviews", "shows"]
    },
    sections: []
  },
  {
    id: "newsletter",
    title: "Newsletter & Dispatches",
    slug: "newsletter",
    brand: "GoReadPost",
    description: "Curated weekly and daily dispatches delivered directly to founders and investors.",
    heroHeadline: "The Executive Morning Briefing",
    heroSubhead: "The smartest 5-minute daily breakdown of capital movements and startup strategies.",
    heroBanner: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 5,
    seo: {
      title: "Newsletter Subscription | GoReadPost",
      description: "Subscribe to GoReadPost daily dispatches and intelligence briefs.",
      keywords: ["newsletter", "daily brief", "subscriptions"]
    },
    sections: []
  },
  {
    id: "category",
    title: "Category Content & Desks",
    slug: "categories",
    brand: "GoReadPost",
    description: "Comprehensive reporting, strategic perspectives, and startup breakdowns across all editorial categories and desks.",
    heroHeadline: "Curated Reporting Across All Editorial Verticals",
    heroSubhead: "Explore deep insights, operational lessons, and strategic perspectives from Indian founders and industry pioneers.",
    heroBanner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 6,
    seo: {
      title: "Editorial Categories & Desks | GoReadPost Intelligence",
      description: "Curated reporting, deep analysis, and breaking investigative coverage from the editorial desks at GoReadPost.",
      keywords: ["categories", "startups", "technology", "ai", "enterprise", "fintech"]
    },
    sections: [
      {
        id: "category_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          title: "Category Featured Spotlight",
          heading: "Curated Reporting Across All Editorial Verticals",
          headline: "Curated Reporting Across All Editorial Verticals",
          subheadline: "Explore deep insights, operational lessons, and strategic perspectives from Indian founders and industry pioneers.",
          badge: "EDITORIAL DESKS",
          buttonText: "Read Story",
          buttonUrl: "#feed",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80",
          heroSource: "auto"
        }
      },
      {
        id: "category_feed",
        type: "stories_feed",
        order: 2,
        enabled: true,
        data: {
          title: "Category Editorial Feed",
          heading: "All Editorial Desks",
          subtitle: "Discover high-impact stories, breaking scoops, and founder journeys across curated verticals",
          layoutMode: "grid",
          cardsPerPage: 10,
          defaultSort: "latest",
          showPills: true,
          showHero: true,
          curation: {}
        }
      }
    ]
  },
  {
    id: "about",
    title: "About Us",
    slug: "about",
    brand: "GoReadPost",
    description: "Learn about GoReadPost's mission, editorial charter, and global bureaus.",
    heroHeadline: "Powering the Stories That Build Tomorrow",
    heroSubhead: "GoReadPost is India's leading digital publication for startup stories, venture capital news, and emerging technology. We bring you insights, analysis, and real stories from the people shaping Bharat's innovation economy.",
    heroBanner: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 6,
    seo: {
      title: "About Us | GoReadPost Media",
      description: "GoReadPost is the premier digital journalism network chronicling breakthrough founders, deep technology, AI revolutions, and venture capital.",
      keywords: ["about us", "GoReadPost", "editorial", "tech media", "startup journalism"]
    },
    sections: [
      {
        id: "about_mission",
        type: "text",
        order: 1,
        enabled: true,
        data: {
          title: "Our Mission & Journalistic Manifesto",
          alignment: "left",
          maxWidth: "860px",
          content: "<p style='font-size: 1.15rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 1.25rem;'>We believe that entrepreneurs, engineers, and risk-takers are the foundational architects of the future. Our newsroom exists to report their triumphs, audits, pivots, and operational breakthroughs with uncompromising independence and technical rigor.</p><h3 style='font-size: 1.25rem; font-weight: 750; margin: 1.75rem 0 0.75rem; color: var(--text-primary);'>The Pillars of GoReadPost Reporting</h3><ul style='padding-left: 1.25rem; line-height: 1.8; margin-bottom: 1.5rem; color: var(--text-secondary);'><li><strong>Zero Pay-to-Play Coverage:</strong> Editorial coverage is 100% earned. Our newsroom maintains an impenetrable wall between editorial judgment and commercial partnerships.</li><li><strong>First-Principles Technical Depth:</strong> We go beyond surface press releases to inspect unit economics, infrastructure architecture, and compute bottlenecks.</li><li><strong>Radical Transparency & Empathy:</strong> We document the brutal realities of venture capital, down-rounds, and turnaround journeys alongside hypergrowth triumphs.</li></ul>"
        }
      },
      {
        id: "about_beats",
        type: "services",
        order: 2,
        enabled: true,
        data: {
          badge: "OUR BEATS",
          heading: "Core Newsroom Desks",
          subheading: "Dedicated bureaus delivering daily investigations, market analyses, and founder access.",
          items: [
            {
              icon: "Zap",
              title: "AI & Sovereign DeepTech",
              description: "Tracking frontier foundation models, GPU compute sovereignty, robotics, and semiconductor supply chains."
            },
            {
              icon: "Shield",
              title: "The CapTable & Venture Capital",
              description: "Seed-to-IPO cap table movements, term sheet diligence, LP-GP dynamics, and private market audits."
            },
            {
              icon: "Award",
              title: "Founders Unfiltered",
              description: "Behind-the-scenes long-form journalism chronicling the operational pivots, failures, and triumphs of company builders."
            },
            {
              icon: "Layers",
              title: "Enterprise & Cloud Resilience",
              description: "Enterprise software, cybersecurity, GCCs, and high-stakes digital transformations shaping global corporate stacks."
            },
            {
              icon: "Globe",
              title: "HerStory & Inclusivity",
              description: "Amplifying trailblazing women founders, corporate innovators, and researchers breaking industry barriers."
            },
            {
              icon: "Sparkles",
              title: "SMBStory & Manufacturing",
              description: "The heartbeat of Indian manufacturing hubs, direct-to-consumer (D2C) brands, and scaling MSME powerhouses."
            }
          ]
        }
      },
      {
        id: "about_cta",
        type: "cta",
        order: 3,
        enabled: true,
        data: {
          badge: "GET IN TOUCH",
          heading: "Have a Breaking Story or Whistleblower Tip?",
          description: "Our investigative desk reviews tips, funding announcements, and exclusive data on a continuous basis.",
          primaryBtnText: "Pitch Your Story to the Bureau",
          primaryBtnUrl: "/pitch",
          secondaryBtnText: "Meet the Editorial Team",
          secondaryBtnUrl: "/editorial-team"
        }
      }
    ]
  },
  {
    id: "page_advertise",
    title: "Advertise With Us",
    slug: "advertise",
    brand: "GoReadPost",
    description: "Partner with India’s leading technology, founders, and capital intelligence publication.",
    heroHeadline: "Amplify Your Brand to 5M+ Founders, Decision Makers & Investors",
    heroSubhead: "High-impact sponsored stories, native brand integration, newsletter takeovers, and executive events.",
    heroBanner: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 7,
    seo: {
      title: "Advertise & Partner with GoReadPost | Media Kit 2026",
      description: "Reach high-net-worth founders, venture capitalists, and technology leaders through GoReadPost native advertising.",
      keywords: ["advertise", "sponsorship", "partner", "media kit"]
    },
    sections: [
      {
        id: "sec_adv_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "BRAND PARTNERSHIPS & MEDIA KIT",
          headline: "Reach Founders, VCs, and High-Intent Leaders",
          subheadline: "GoReadPost delivers premium native content, high-open newsletter sponsorships, and executive events tailored to high-growth tech brands.",
          ctaPrimaryText: "Request Media Kit",
          ctaPrimaryLink: "#contact"
        }
      },
      {
        id: "sec_adv_services",
        type: "services",
        order: 2,
        enabled: true,
        data: {
          title: "Advertising Formats & Programs",
          subtitle: "Choose from multi-channel editorial packages designed for maximum market impact.",
          services: [
            {
              title: "Sponsored Editorial Stories",
              description: "Deep-dive founder feature stories produced by award-winning business journalists.",
              icon: "FileText"
            },
            {
              title: "Daily Newsletter Takeovers",
              description: "Direct placement in morning executive briefing with 42% average open rate.",
              icon: "Mail"
            },
            {
              title: "Video & YSTV Features",
              description: "Broadcast-quality founder interviews distributed across YouTube and social channels.",
              icon: "Tv"
            },
            {
              title: "Custom Research Reports",
              description: "White-labeled industry sector benchmarks and data reports co-branded with GoReadPost.",
              icon: "BarChart"
            }
          ]
        }
      },
      {
        id: "sec_adv_contact",
        type: "contact",
        order: 3,
        enabled: true,
        data: {
          title: "Contact Advertising & Sponsorships Desk",
          subtitle: "Request our 2026 Rate Card, Audience Demographics, and Case Studies.",
          email: "advertise@goreadpost.com",
          phone: "+91 (080) 4123-5680",
          address: "Ad Sales Bureau, Indiranagar, Bengaluru 560038"
        }
      }
    ]
  },
  {
    id: "founder-first",
    slug: "founder-first",
    title: "Founder First - Zero to One Playbooks",
    brand: "GoReadPost",
    description: "Curated founder playbooks, bootstrapping miracles, and startup scaling blueprints from India's audacious builders.",
    heroHeadline: "Founder First Desk",
    heroSubhead: "Unfiltered founder playbooks, bootstrapping lessons, and scaling blueprints from India’s audacious builders.",
    heroBanner: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 5,
    sections: [
      { id: "founder_playbooks", type: "stories", order: 1, enabled: true, title: "Founder Playbooks" },
      { id: "founder_cta", type: "cta", order: 2, enabled: true, title: "Pitch Callout Banner" }
    ],
    seo: {
      title: "Founder First | Zero-to-One Playbooks & Builder Journeys",
      description: "Unfiltered founder playbooks, bootstrapping lessons, and scaling blueprints from India’s audacious builders.",
      keywords: ["startups", "founder stories", "zero to one", "bootstrapped", "playbooks"]
    }
  }
];

export async function ensureDefaultPages() {
  if (!isDbConnected()) return;
  try {
    for (const p of DEFAULT_PAGES) {
      const exists = await Page.findOne({ $or: [{ slug: p.slug.toLowerCase() }, { id: p.id }] });
      if (!exists) {
        await Page.create(p).catch(() => {});
      }
    }
  } catch (e) {
    console.error('ensureDefaultPages error:', e);
  }
}

function readFallbackPages() {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  writeFallbackPages(DEFAULT_PAGES);
  return DEFAULT_PAGES;
}

function writeFallbackPages(data) {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

// 1. GET /api/pages (List all pages with optional status filter)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    if (isDbConnected()) {
      await ensureDefaultPages();
      let pages = await Page.find(filter).sort({ order: 1, createdAt: -1 });
      if (pages.length === 0 && !status) {
        await Page.insertMany(DEFAULT_PAGES);
        pages = await Page.find(filter).sort({ order: 1, createdAt: -1 });
      }
      return res.json({ success: true, count: pages.length, data: pages });
    }

    let pages = readFallbackPages();
    if (status) {
      pages = pages.filter(p => p.status === status);
    }
    res.json({ success: true, count: pages.length, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET /api/pages/slug/:slug (Public dynamic page route)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const isPreview = req.query.preview === 'true';
    const cleanSlug = slug.toLowerCase().trim();

    // Check preview authentication if preview requested
    let isAuthorizedPreview = false;
    if (isPreview && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          verifyJwtToken(token);
          isAuthorizedPreview = true;
        }
      } catch (e) {}
    }

    const SLUG_ALIASES = {
      'about-us': 'about',
      'authors': 'editorial-team',
      'team': 'editorial-team',
      'pitch-story': 'pitch',
      'jobs': 'careers',
      'privacy-policy': 'privacy',
      'terms-of-service': 'terms',
      'disclaimers': 'disclaimer',
      'terms-and-conditions': 'terms',
    };
    const canonicalSlug = SLUG_ALIASES[cleanSlug] || cleanSlug;

    if (isDbConnected()) {
      let page = await Page.findOne({ slug: cleanSlug });
      if (!page && canonicalSlug !== cleanSlug) {
        page = await Page.findOne({ slug: canonicalSlug });
      }
      if (!page && (cleanSlug === 'latest' || cleanSlug === 'just-in')) {
        page = await Page.findOne({ slug: cleanSlug === 'latest' ? 'just-in' : 'latest' });
      }
      if (!page) {
        const defaultMatch = DEFAULT_PAGES.find(p => p.slug.toLowerCase() === canonicalSlug);
        if (defaultMatch) {
          try {
            page = await Page.create(defaultMatch);
          } catch(e) {
            page = await Page.findOne({ slug: canonicalSlug });
          }
        }
      }
      if (!page) {
        return res.status(404).json({ success: false, message: `Page with slug "/${cleanSlug}" not found.` });
      }

      // Check if published or authorized preview
      const isLive = page.status === 'published' || page.status === 'active';
      if (!isLive && !isAuthorizedPreview) {
        return res.status(403).json({
          success: false,
          message: 'This page is currently an unpublished draft. Publish the page to make it publicly accessible.'
        });
      }

      // Sort sections by order and filter out disabled sections if public
      const sortedSections = (page.sections || [])
        .filter(s => isAuthorizedPreview ? true : s.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const responseData = page.toObject();
      responseData.sections = sortedSections;

      return res.json({ success: true, data: responseData });
    }

    // Local fallback
    const pages = readFallbackPages();
    let found = pages.find(p => p.slug === cleanSlug || p.slug === canonicalSlug);
    if (!found && (cleanSlug === 'latest' || cleanSlug === 'just-in')) {
      found = pages.find(p => p.slug === (cleanSlug === 'latest' ? 'just-in' : 'latest'));
    }
    if (!found) {
      found = DEFAULT_PAGES.find(p => p.slug.toLowerCase() === canonicalSlug);
    }
    if (!found) {
      return res.status(404).json({ success: false, message: `Page with slug "/${cleanSlug}" not found.` });
    }

    const isLive = found.status === 'published' || found.status === 'active';
    if (!isLive && !isAuthorizedPreview) {
      return res.status(403).json({
        success: false,
        message: 'This page is currently an unpublished draft. Publish the page to make it publicly accessible.'
      });
    }

    const sortedSections = (found.sections || [])
      .filter(s => isAuthorizedPreview ? true : s.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ success: true, data: { ...found, sections: sortedSections } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET /api/pages/:id (Fetch single page by ID or slug for editor)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const page = await Page.findOne(buildPageQuery(id));
      if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
      return res.json({ success: true, data: page });
    }

    const pages = readFallbackPages();
    const found = findFallbackPage(pages, id);
    if (!found) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: found });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /api/pages (Create new dynamic page)
router.post('/', protectAdmin, async (req, res) => {
  try {
    const { title, slug, id, status = 'draft', seo = {}, sections = [], showInNav = false, brand = 'GoReadPost' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Page title is required' });
    }

    // Format & validate clean slug
    const generatedSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!generatedSlug) {
      return res.status(400).json({ success: false, message: 'A valid alphanumeric slug is required' });
    }

    // Reserved slugs check
    const reserved = ['admin', 'api', 'login', 'dashboard', 'uploads', 'assets'];
    if (reserved.includes(generatedSlug)) {
      return res.status(400).json({ success: false, message: `The slug "${generatedSlug}" is reserved by the system.` });
    }

    const pageId = id || generatedSlug;

    const newPage = {
      id: pageId,
      title: title.trim(),
      slug: generatedSlug,
      brand: brand || 'GoReadPost',
      description: req.body.description || '',
      heroHeadline: req.body.heroHeadline || title,
      heroSubhead: req.body.heroSubhead || '',
      heroBanner: req.body.heroBanner || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      status: status === 'published' ? 'published' : 'draft',
      showInNav: !!showInNav,
      order: Date.now(),
      seo: {
        title: seo.title || `${title} | GoReadPost`,
        description: seo.description || `Read about ${title} on GoReadPost.`,
        keywords: Array.isArray(seo.keywords) ? seo.keywords : typeof seo.keywords === 'string' ? seo.keywords.split(',').map(s => s.trim()) : [],
        ogTitle: seo.ogTitle || title,
        ogDescription: seo.ogDescription || seo.description || '',
        ogImage: seo.ogImage || ''
      },
      sections: Array.isArray(sections) ? sections : [],
      publishedAt: status === 'published' ? new Date() : null
    };

    if (isDbConnected()) {
      const existing = await Page.findOne({ $or: [{ id: pageId }, { slug: generatedSlug }] });
      if (existing) {
        return res.status(400).json({ success: false, message: `A page with slug "/${generatedSlug}" already exists.` });
      }
      const created = await Page.create(newPage);
      return res.status(201).json({ success: true, message: 'Page created successfully', data: created });
    }

    const list = readFallbackPages();
    if (list.some(p => p.id === pageId || p.slug === generatedSlug)) {
      return res.status(400).json({ success: false, message: `A page with slug "/${generatedSlug}" already exists.` });
    }
    list.push(newPage);
    writeFallbackPages(list);

    res.status(201).json({ success: true, message: 'Page created successfully', data: newPage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. PUT /api/pages/:id (Update page details, SEO, and sections)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.slug) {
      updates.slug = updates.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    if (isDbConnected()) {
      // Check duplicate slug if slug is changing
      if (updates.slug) {
        const conflict = await Page.findOne({
          slug: updates.slug,
          $and: [
            ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: { $ne: new mongoose.Types.ObjectId(id) } }] : []),
            { id: { $ne: id } }
          ]
        });
        if (conflict && conflict.id !== id && conflict._id?.toString() !== id) {
          return res.status(400).json({ success: false, message: `The slug "/${updates.slug}" is already in use by another page.` });
        }
      }

      const updated = await Page.findOneAndUpdate(buildPageQuery(id), updates, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Page not found' });
      try {
        const list = readFallbackPages();
        const found = findFallbackPage(list, id);
        if (found) {
          const index = list.indexOf(found);
          list[index] = { ...list[index], ...updates };
          writeFallbackPages(list);
        }
      } catch (e) {}
      return res.json({ success: true, message: 'Page updated successfully', data: updated });
    }

    const list = readFallbackPages();
    const found = findFallbackPage(list, id);
    if (!found) return res.status(404).json({ success: false, message: 'Page not found' });

    const index = list.indexOf(found);
    list[index] = { ...list[index], ...updates };
    writeFallbackPages(list);

    res.json({ success: true, message: 'Page updated successfully', data: list[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. PUT /api/pages/:id/publish
router.put('/:id/publish', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const update = { status: 'published', publishedAt: new Date() };

    if (isDbConnected()) {
      const updated = await Page.findOneAndUpdate(buildPageQuery(id), update, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Page not found' });
      return res.json({ success: true, message: 'Page published live', data: updated });
    }

    const list = readFallbackPages();
    const found = findFallbackPage(list, id);
    if (!found) return res.status(404).json({ success: false, message: 'Page not found' });

    const index = list.indexOf(found);
    list[index] = { ...list[index], ...update };
    writeFallbackPages(list);

    res.json({ success: true, message: 'Page published live', data: list[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. PUT /api/pages/:id/unpublish
router.put('/:id/unpublish', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const update = { status: 'draft' };

    if (isDbConnected()) {
      const updated = await Page.findOneAndUpdate(buildPageQuery(id), update, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Page not found' });
      return res.json({ success: true, message: 'Page moved to draft', data: updated });
    }

    const list = readFallbackPages();
    const found = findFallbackPage(list, id);
    if (!found) return res.status(404).json({ success: false, message: 'Page not found' });

    const index = list.indexOf(found);
    list[index] = { ...list[index], ...update };
    writeFallbackPages(list);

    res.json({ success: true, message: 'Page moved to draft', data: list[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. DELETE /api/pages/:id
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'home') {
      return res.status(400).json({ success: false, message: 'The primary Homepage cannot be deleted.' });
    }

    if (isDbConnected()) {
      const deleted = await Page.findOneAndDelete(buildPageQuery(id));
      if (!deleted) return res.status(404).json({ success: false, message: 'Page not found' });
      return res.json({ success: true, message: 'Page deleted successfully' });
    }

    let list = readFallbackPages();
    const found = findFallbackPage(list, id);
    if (!found) return res.status(404).json({ success: false, message: 'Page not found' });

    list = list.filter(p => p !== found);
    writeFallbackPages(list);

    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. POST /api/pages/reset
router.post('/reset', protectAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      await Page.deleteMany({});
      await Page.insertMany(DEFAULT_PAGES);
      const pages = await Page.find().sort({ order: 1 });
      return res.json({ success: true, message: 'Pages reset to defaults', data: pages });
    }

    writeFallbackPages(DEFAULT_PAGES);
    res.json({ success: true, message: 'Pages reset to defaults', data: DEFAULT_PAGES });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
