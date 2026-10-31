const fs = require('fs');

const editorPath = 'frontend/src/components/admin/AdminPageEditor.jsx';
let code = fs.readFileSync(editorPath, 'utf8');

const declarations = `  const isHomepage = pageId === 'home' || page?.id === 'home' || page?.slug === '' || page?.slug === '/' || slug === '' || slug === '/' || (page?.title && page.title.toLowerCase().startsWith('home'));
  const isLive = status === 'published' || status === 'active';
  const rawTopTitle = title || page?.title || (isHomepage ? 'Homepage' : 'Edit Page');
  const displayTitle = isHomepage ? rawTopTitle.replace(/\\s*-\\s*Live Portal/i, '').trim() || 'Homepage' : rawTopTitle.replace(/\\s*-\\s*Live Portal/i, '').trim();
  const displaySlug = isHomepage ? '/' : (slug ? \`/\${slug.replace(/^\\/+/, '')}\` : (pageId && !pageId.match(/^[0-9a-fA-F]{24}$/) ? \`/\${pageId}\` : '/'));
`;

// Remove declarations from below if (activeTab === 'sections')
code = code.replace(declarations, '');

// Place declarations before if (activeTab === 'sections')
code = code.replace(
  /  \/\/ ── 2\. DEDICATED WHOLE PAGE LIVE VISUAL STUDIO/,
  `${declarations}\n  // ── 2. DEDICATED WHOLE PAGE LIVE VISUAL STUDIO`
);

fs.writeFileSync(editorPath, code, 'utf8');
console.log('Moved displayTitle and displaySlug declarations before activeTab check.');
