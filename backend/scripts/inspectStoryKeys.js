import { ALL_STORIES, AI_STORIES } from '../../frontend/src/data/storiesData.js';
import { ALL_ENTERPRISE_STORIES } from '../../frontend/src/data/enterpriseStoryData.js';
import { ALL_SMB_STORIES } from '../../frontend/src/data/smbStoryData.js';
import { ALL_HINDI_STORIES } from '../../frontend/src/data/hindiStoryData.js';
import { ALL_HER_STORIES } from '../../frontend/src/data/herStoryData.js';
import { SOCIAL_HERO_STORY, SOCIAL_GRID_STORIES } from '../../frontend/src/data/socialStoryData.js';

console.log('Sample ALL_STORIES[0]:', Object.keys(ALL_STORIES[0]));
console.log('Sample AI_STORIES[0]:', Object.keys(AI_STORIES[0]), 'brand:', AI_STORIES[0].brand, 'category:', AI_STORIES[0].category);
console.log('Sample ENTERPRISE[0]:', Object.keys(ALL_ENTERPRISE_STORIES[0]), 'brand:', ALL_ENTERPRISE_STORIES[0].brand, 'cat:', ALL_ENTERPRISE_STORIES[0].category);
console.log('Sample SMB[0]:', Object.keys(ALL_SMB_STORIES[0]), 'brand:', ALL_SMB_STORIES[0].brand, 'cat:', ALL_SMB_STORIES[0].category);
console.log('Sample HINDI[0]:', Object.keys(ALL_HINDI_STORIES[0]), 'brand:', ALL_HINDI_STORIES[0].brand, 'cat:', ALL_HINDI_STORIES[0].category);
console.log('Sample HER[0]:', Object.keys(ALL_HER_STORIES[0]), 'brand:', ALL_HER_STORIES[0].brand, 'cat:', ALL_HER_STORIES[0].category);
console.log('Sample SOCIAL:', Object.keys(SOCIAL_GRID_STORIES[0]), 'brand:', SOCIAL_GRID_STORIES[0].brand, 'cat:', SOCIAL_GRID_STORIES[0].category);
