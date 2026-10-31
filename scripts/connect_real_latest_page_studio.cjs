const fs = require('fs');

// ========================================================
// 1. UPDATE LatestArticlesPage.jsx
// ========================================================
const lapPath = 'frontend/src/components/LatestArticlesPage.jsx';
let lapCode = fs.readFileSync(lapPath, 'utf8');

// Add isStudioView prop
lapCode = lapCode.replace(
  /export default function LatestArticlesPage\(\{([\s\S]*?)onToggleSave\s*\}\)/,
  `export default function LatestArticlesPage({$1onToggleSave, isStudioView = false })`
);

// Update isAdminUser default
lapCode = lapCode.replace(
  /const \[isAdminUser, setIsAdminUser\] = useState\(false\);/,
  `const [isAdminUser, setIsAdminUser] = useState(() => isStudioView ? true : false);`
);

// Update useEffect for isAdminUser
lapCode = lapCode.replace(
  /if \(token && \(u\.role === 'admin' \|\| u\.role === 'superadmin' \|\| u\.role === 'SUPER_ADMIN' \|\| localStorage\.getItem\('adminToken'\)\)\) \{\s*setIsAdminUser\(true\);\s*\}/,
  `if (isStudioView || (token && (u.role === 'admin' || u.role === 'superadmin' || u.role === 'SUPER_ADMIN' || localStorage.getItem('adminToken')))) {
        setIsAdminUser(true);
      }`
);

// Hide lap-admin-toolbar if isStudioView is true
lapCode = lapCode.replace(
  /\{isAdminUser && \(\s*<div className="lap-admin-toolbar">/,
  `{isAdminUser && !isStudioView && (\n        <div className="lap-admin-toolbar">`
);

fs.writeFileSync(lapPath, lapCode, 'utf8');
console.log('Successfully updated LatestArticlesPage.jsx');

// ========================================================
// 2. UPDATE LiveWholePageStudio.jsx
// ========================================================
const studioPath = 'frontend/src/components/admin/LiveWholePageStudio.jsx';
let studioCode = fs.readFileSync(studioPath, 'utf8');

// Import LatestArticlesPage
if (!studioCode.includes("import LatestArticlesPage from '../LatestArticlesPage';")) {
  studioCode = studioCode.replace(
    /import '\.\.\/LatestArticlesPage\.css';/,
    `import '../LatestArticlesPage.css';\nimport LatestArticlesPage from '../LatestArticlesPage';`
  );
}

// In LiveWholePageStudio, check isLatestPage
const targetCanvasStart = `<div className="mhp-container" style={{ padding: '1.5rem clamp(1rem, 2.5vw, 2.5rem) 3rem' }}>
                {sections.map((sec, idx) => {`;

const replacementCanvasStart = `<div className="mhp-container" style={{ padding: '1.5rem clamp(1rem, 2.5vw, 2.5rem) 3rem' }}>
                {(pageId === 'latest' || pageSlug === 'latest') ? (
                  /* ── REAL FRONTEND LATEST ARTICLES PAGE IN LIVE STUDIO ── */
                  <LatestArticlesPage
                    isStudioView={true}
                    onShowToast={(msg) => {
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus('idle'), 2500);
                    }}
                  />
                ) : (
                  /* ── HOMEPAGE & DYNAMIC SECTIONS CANVAS ── */
                  sections.map((sec, idx) => {`;

const targetCanvasEnd = `                {/* ── Prominent Bottom "+ Add Another Section to Page" Card ── */}`;

const replacementCanvasEnd = `                ))}

                {/* ── Prominent Bottom "+ Add Another Section to Page" Card ── */}`;

if (studioCode.includes(targetCanvasStart)) {
  studioCode = studioCode.replace(targetCanvasStart, replacementCanvasStart);
  studioCode = studioCode.replace(targetCanvasEnd, replacementCanvasEnd);
  console.log('Successfully added conditional rendering of real LatestArticlesPage in LiveWholePageStudio.jsx');
} else {
  console.log('targetCanvasStart not found in LiveWholePageStudio.jsx');
}

// In LiveWholePageStudio header, add a quick "+ Add Article" button when editing Latest Articles page
const targetHeaderActions = `{onOpenSettings && (`;
const newAddArticleBtn = `{(pageId === 'latest' || pageSlug === 'latest') && (
            <button
              type="button"
              className="lhs-btn-preview"
              onClick={() => {
                const titlePrompt = window.prompt("Add article title to latest feed:");
                if (titlePrompt && titlePrompt.trim()) {
                  const newArt = {
                    id: 'art_' + Date.now(),
                    title: titlePrompt.trim(),
                    subtitle: 'Exclusive reporting from GoReadPost newsroom.',
                    summary: 'Exclusive reporting from GoReadPost newsroom.',
                    category: 'Startups',
                    categoryName: 'Startups',
                    categoryLabel: 'Startups',
                    authorName: 'Editorial Desk',
                    author: { name: 'Editorial Desk' },
                    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
                    publishedAt: new Date().toISOString(),
                    readTime: '4 min read',
                    isNewlyAdded: true
                  };
                  ArticleService.createArticle(newArt).then(() => {
                    window.dispatchEvent(new CustomEvent('article:change'));
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 2500);
                  }).catch(() => {});
                }
              }}
              title="Add a new article card directly to Latest feed"
              style={{ background: '#ea580c', color: '#ffffff', border: 'none' }}
            >
              <Plus size={14} />
              <span>+ Add Article</span>
            </button>
          )}

          {onOpenSettings && (`;

studioCode = studioCode.replace(targetHeaderActions, newAddArticleBtn);

fs.writeFileSync(studioPath, studioCode, 'utf8');
console.log('Successfully updated LiveWholePageStudio.jsx');
