import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goreadpost';

const navigationTreeData = [
  {
    title: 'Latest',
    slug: 'latest',
    url: '/latest',
    type: 'link',
    order: 1,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    children: []
  },
  {
    title: 'Trending',
    slug: 'trending',
    url: '/trending',
    type: 'link',
    order: 2,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    children: []
  },
  {
    title: 'Categories',
    slug: 'categories',
    url: '/category/startups',
    type: 'dropdown',
    order: 3,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
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
          { title: 'Founder Stories', slug: 'founder-stories', url: '/category/startups', type: 'link', order: 1 },
          { title: 'HerStory (Women Leaders)', slug: 'her-story', url: '/category/her-story', type: 'link', order: 2 },
          { title: 'SMBStory (MSME & D2C)', slug: 'smbstory', url: '/category/smbstory', type: 'link', order: 3 },
          { title: 'SocialStory (Impact & Climate)', slug: 'social-story', url: '/category/social-story', type: 'link', order: 4 }
        ]
      },
      {
        title: 'Multimedia & Hubs',
        slug: 'multimedia-hubs',
        type: 'group',
        order: 3,
        children: [
          { title: 'Videos & Studio Shows', slug: 'videos-hub', url: '/videos', type: 'link', order: 1 }
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
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
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
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
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
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    children: []
  },
  {
    title: 'Newsletter',
    slug: 'newsletter',
    url: '/newsletter',
    type: 'link',
    order: 7,
    isActive: true,
    isVisible: true,
    visibility: 'PUBLIC',
    children: []
  }
];

function flattenTree(items, parentId = null, level = 0) {
  let list = [];
  items.forEach((item, idx) => {
    const id = new mongoose.Types.ObjectId();
    const flat = {
      _id: id,
      title: item.title,
      slug: item.slug,
      url: item.url || '#',
      type: (item.type || 'link').toLowerCase(),
      parentId: parentId,
      order: item.order || (idx + 1),
      level: level,
      status: 'PUBLISHED',
      isActive: true,
      isVisible: true,
      visibility: item.visibility || 'PUBLIC',
      openInNewTab: Boolean(item.openInNewTab)
    };
    list.push(flat);
    if (item.children && item.children.length > 0) {
      list = list.concat(flattenTree(item.children, id, level + 1));
    }
  });
  return list;
}

async function run() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const NavigationItem = (await import('../models/NavigationItem.js')).default;
    
    // Clear old items and insert fresh tree
    await NavigationItem.deleteMany({});
    const flatItems = flattenTree(navigationTreeData);
    await NavigationItem.insertMany(flatItems);
    console.log(`Successfully seeded ${flatItems.length} navigation items into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('Update navigation error:', err.message);
    process.exit(1);
  }
}

run();
