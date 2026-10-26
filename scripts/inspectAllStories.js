import { ALL_STORIES, SPOTLIGHT_STORIES, FOUNDER_FIRST_STORIES, JUST_IN_STORIES, LEADERSHIP_LENS_STORIES, AI_STORIES, CAPTABLE_STORIES, TOP_PICKS, LEAD_STORY } from '../src/data/storiesData.js';
import { ALL_ENTERPRISE_STORIES } from '../src/data/enterpriseStoryData.js';
import { ALL_SMB_STORIES, SMB_STORY_PROFILES } from '../src/data/smbStoryData.js';
import { ALL_HINDI_STORIES } from '../src/data/hindiStoryData.js';
import { ALL_HER_STORIES, HER_STORY_PROFILES } from '../src/data/herStoryData.js';
import { SOCIAL_HERO_STORY, SOCIAL_HERO_SIDEBAR_STORIES, SOCIAL_GRID_STORIES, SOCIAL_LATEST_STORIES, SOCIAL_EXPERT_OPINION_STORIES } from '../src/data/socialStoryData.js';

console.log('--- STORY DATASETS INSPECTION ---');
console.log('ALL_STORIES:', ALL_STORIES?.length);
console.log('ALL_ENTERPRISE_STORIES:', ALL_ENTERPRISE_STORIES?.length);
console.log('ALL_SMB_STORIES:', ALL_SMB_STORIES?.length);
console.log('ALL_HINDI_STORIES:', ALL_HINDI_STORIES?.length);
console.log('ALL_HER_STORIES:', ALL_HER_STORIES?.length);
console.log('SOCIAL_GRID_STORIES:', SOCIAL_GRID_STORIES?.length);
console.log('SOCIAL_LATEST_STORIES:', SOCIAL_LATEST_STORIES?.length);
console.log('HER_STORY_PROFILES keys:', Object.keys(HER_STORY_PROFILES || {}).length);
console.log('SMB_STORY_PROFILES keys:', Object.keys(SMB_STORY_PROFILES || {}).length);
