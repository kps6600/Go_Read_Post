import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { 
  ALL_STORIES, 
  SPOTLIGHT_STORIES, 
  FOUNDER_FIRST_STORIES, 
  JUST_IN_STORIES, 
  LEADERSHIP_LENS_STORIES, 
  AI_STORIES, 
  CAPTABLE_STORIES, 
  TOP_PICKS, 
  LEAD_STORY 
} from '../src/data/storiesData.js';
import { ALL_ENTERPRISE_STORIES } from '../src/data/enterpriseStoryData.js';
import { ALL_SMB_STORIES, SMB_STORY_PROFILES } from '../src/data/smbStoryData.js';
import { ALL_HINDI_STORIES } from '../src/data/hindiStoryData.js';
import { ALL_HER_STORIES, HER_STORY_PROFILES } from '../src/data/herStoryData.js';
import { 
  SOCIAL_HERO_STORY, 
  SOCIAL_HERO_SIDEBAR_STORIES, 
  SOCIAL_GRID_STORIES, 
  SOCIAL_LATEST_STORIES, 
  SOCIAL_EXPERT_OPINION_STORIES 
} from '../src/data/socialStoryData.js';

import Story from '../server/models/Story.js';
import Page from '../server/models/Page.js';
import MenuItem from '../server/models/MenuItem.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goreadpost';

function normalizeStory(raw, defaultBrand, defaultCategory) {
  if (!raw) return null;
  const s = { ...raw };

  const id = s.id || ('story_' + Math.random().toString(36).substr(2, 9));
  const title = s.title || s.mainHeadline || 'Editorial Article';
  const subtitle = s.subtitle || s.heroSubheading || s.excerpt || '';
  const summary = s.summary || s.excerpt || s.subtitle || (typeof s.leadStoryText === 'string' ? s.leadStoryText.slice(0, 180) : '') || title;

  let brand = s.brand || defaultBrand || 'GoReadPost';
  if (brand.toLowerCase() === 'ai story') brand = 'AIStory';
  if (brand.toLowerCase() === 'enterprise story') brand = 'EnterpriseStory';

  let category = s.category || defaultCategory || 'startups';
  let categoryTag = s.categoryTag || s.categoryLabel || s.subTopic || s.category || 'Editorial';
  let tag = s.tag || 'FEATURED';

  let image = s.image || s.heroImage || s.featureImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80';
  if (typeof image !== 'string' || image.startsWith('data:')) {
    image = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80';
  }

  let author = {
    name: 'Editorial Desk',
    title: 'Staff Reporter',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
  };

  if (typeof s.author === 'string') {
    author.name = s.author;
  } else if (s.author && typeof s.author === 'object') {
    author.name = s.author.name || 'Editorial Desk';
    author.title = s.author.title || s.author.role || 'Staff Reporter';
    author.avatar = s.author.avatar || author.avatar;
  }
  if (s.avatar) author.avatar = s.avatar;
  if (s.role) author.title = s.role;

  let content = [];
  if (Array.isArray(s.content) && s.content.length > 0) {
    content = s.content.map(c => typeof c === 'string' ? c : JSON.stringify(c));
  } else if (typeof s.content === 'string') {
    content = [s.content];
  } else if (s.section1Body || s.leadStoryText) {
    content = [
      s.leadStoryText || '',
      s.section1Lead || '',
      s.section1Body || '',
      s.section2Lead || '',
      s.section2Body || '',
      s.section3Body1 || '',
      s.section3Body2 || ''
    ].filter(Boolean);
  } else {
    content = [summary, subtitle].filter(Boolean);
  }

  let tags = [];
  if (Array.isArray(s.tags)) tags = s.tags;
  else if (typeof s.tags === 'string') tags = s.tags.split(',').map(t => t.trim());
  else tags = [brand.toLowerCase(), category.toLowerCase()];

  return {
    id,
    title,
    subtitle,
    summary,
    slug: s.slug || id.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    brand,
    category,
    categoryTag,
    tag,
    image,
    author,
    readTime: s.readTime || '4 min read',
    publishedAt: s.publishedAt || s.date || 'Oct 2026',
    content,
    tags,
    status: 'published',
    views: s.views || Math.floor(Math.random() * 8500) + 1200,
    claps: s.claps || Math.floor(Math.random() * 450) + 75,
    isFeatured: !!s.isFeatured
  };
}

async function run() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully!');

  const allItems = new Map();

  function add(item, defaultBrand, defaultCategory) {
    const normalized = normalizeStory(item, defaultBrand, defaultCategory);
    if (normalized && normalized.id && normalized.title && !allItems.has(normalized.id)) {
      allItems.set(normalized.id, normalized);
    }
  }

  // 1. AI Stories
  (AI_STORIES || []).forEach(s => add(s, 'AIStory', 'ai-story'));

  // 2. HerStory
  (ALL_HER_STORIES || []).forEach(s => add(s, 'HerStory', 'herstory'));
  Object.values(HER_STORY_PROFILES || {}).forEach(s => add(s, 'HerStory', 'herstory'));

  // 3. SMBStory
  (ALL_SMB_STORIES || []).forEach(s => add(s, 'SMBStory', 'smbstory'));
  Object.values(SMB_STORY_PROFILES || {}).forEach(s => add(s, 'SMBStory', 'smbstory'));

  // 4. EnterpriseStory
  (ALL_ENTERPRISE_STORIES || []).forEach(s => add(s, 'EnterpriseStory', 'enterprise'));

  // 5. YS Hindi
  (ALL_HINDI_STORIES || []).forEach(s => add(s, 'YS हिंदी', 'hindi'));

  // 6. SocialStory
  add(SOCIAL_HERO_STORY, 'SocialStory', 'social-story');
  (SOCIAL_HERO_SIDEBAR_STORIES || []).forEach(s => add(s, 'SocialStory', 'social-story'));
  (SOCIAL_GRID_STORIES || []).forEach(s => add(s, 'SocialStory', 'social-story'));
  (SOCIAL_LATEST_STORIES || []).forEach(s => add(s, 'SocialStory', 'social-story'));
  (SOCIAL_EXPERT_OPINION_STORIES || []).forEach(s => add(s, 'SocialStory', 'social-story'));

  // 7. General Website Stories (Spotlight, Founder First, Just In, Captable, Top Picks, etc.)
  add(LEAD_STORY, 'GoReadPost', 'startups');
  (TOP_PICKS || []).forEach(s => add(s, 'GoReadPost', 'top-picks'));
  (CAPTABLE_STORIES || []).forEach(s => add(s, 'GoReadPost', 'captable'));
  (SPOTLIGHT_STORIES || []).forEach(s => add(s, 'GoReadPost', 'spotlight'));
  (FOUNDER_FIRST_STORIES || []).forEach(s => add(s, 'GoReadPost', 'founder-first'));
  (JUST_IN_STORIES || []).forEach(s => add(s, 'GoReadPost', 'just-in'));
  (LEADERSHIP_LENS_STORIES || []).forEach(s => add(s, 'GoReadPost', 'leadership-lens'));
  (ALL_STORIES || []).forEach(s => add(s, 'GoReadPost', 'startups'));

  const finalStories = Array.from(allItems.values());
  console.log(`Total unique curated stories gathered from website: ${finalStories.length}`);

  // Summary by brand desk
  const brandCounts = {};
  finalStories.forEach(s => {
    brandCounts[s.brand] = (brandCounts[s.brand] || 0) + 1;
  });
  console.log('Stories count per Brand Desk:');
  console.table(brandCounts);

  // Clear existing stories collection and repopulate with complete set
  await Story.deleteMany({});
  await Story.insertMany(finalStories, { ordered: false });
  console.log(`✅ Successfully seeded all ${finalStories.length} stories into MongoDB!`);

  // Verify count in DB
  const countInDb = await Story.countDocuments();
  console.log(`Verified count in DB: ${countInDb} stories`);

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
