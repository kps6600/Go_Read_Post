const fs = require('fs');
const content = fs.readFileSync('frontend/src/data/pagesData.js', 'utf8');
const matches = [...content.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('Pages/sections in pagesData.js:', matches);
