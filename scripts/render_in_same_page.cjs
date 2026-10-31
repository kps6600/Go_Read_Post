const fs = require('fs');

const editorPath = 'frontend/src/components/admin/AdminPageEditor.jsx';
let code = fs.readFileSync(editorPath, 'utf8');

// 1. Add LatestArticlesPage and ExternalLink / Settings imports if needed
if (!code.includes("import LatestArticlesPage from '../LatestArticlesPage';")) {
  code = code.replace(
    /import LiveWholePageStudio from '\.\/LiveWholePageStudio';/,
    `import LiveWholePageStudio from './LiveWholePageStudio';\nimport LatestArticlesPage from '../LatestArticlesPage';`
  );
}

if (!code.includes('ExternalLink,')) {
  code = code.replace(
    /import\s*\{\s*Globe,/,
    `import {\n  ExternalLink, Settings, Globe,`
  );
}

// 2. Remove the early return block that hijacked the screen with position: fixed
const earlyReturnRegex = /\/\/\s*── 2\.\s*DEDICATED WHOLE PAGE LIVE VISUAL STUDIO[\s\S]*?if\s*\(activeTab === 'sections'\)\s*\{[\s\S]*?return\s*\(\s*<div className="admin-live-studio-dedicated-page"[\s\S]*?<\/div>\s*\);\s*\}/;

if (code.match(earlyReturnRegex)) {
  code = code.replace(earlyReturnRegex, '');
  console.log('Removed early return fullscreen block.');
} else {
  console.log('earlyReturnRegex not matched');
}

// 3. Update the main return to render the in-place editor in the SAME page container
const oldTabsAndTab1Regex = /<div style=\{\{\s*width: '100%', margin: '0 auto', boxSizing: 'border-box'\s*\}\}>[\s\S]*?\{\/\* ========================================================\s*TAB 1: WHOLE PAGE LIVE VISUAL STUDIO[\s\S]*?<\/div>\s*\}\)\s*\}[\s\S]*?\{\/\* ========================================================\s*TAB 2: PAGE INFORMATION & SEO/;

const newTabsAndTab1Code = `<div style={{ width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Segmented Editor Tabs */}
        <div className="admin-segmented-tabs-bar" style={{ display: 'none' }}>
          <button
            type="button"
            className={\`admin-nav-tab-item \${activeTab === 'sections' ? 'active' : ''}\`}
            onClick={() => setActiveTab('sections')}
          >
            <span>Live UI Studio</span>
          </button>
          <button
            type="button"
            className={\`admin-nav-tab-item \${activeTab === 'seo' ? 'active' : ''}\`}
            onClick={() => setActiveTab('seo')}
          >
            <span>Page Info & SEO Settings</span>
          </button>
        </div>

      {/* ========================================================
          TAB 1: LIVE UI VISUAL STUDIO (RENDERED IN THE SAME PAGE)
         ======================================================== */}
      {activeTab === 'sections' && (
        pageId === 'latest' ? (
          <div 
            className="admin-same-page-visual-editor"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'visible',
              padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              marginBottom: '2rem'
            }}
          >
            <LatestArticlesPage
              isStudioView={true}
              onShowToast={onShowToast}
            />
          </div>
        ) : (
          <div 
            className="admin-same-page-visual-editor"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'visible',
              padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              marginBottom: '2rem'
            }}
          >
            <LiveWholePageStudio
              isOpen={true}
              pageId={pageId}
              pageTitle={displayTitle}
              pageSlug={displaySlug}
              initialSections={sections}
              stories={allStories.length ? allStories : ALL_STORIES}
              onClose={() => onNavigate ? onNavigate('/admin/pages') : (window.location.href = '/admin/pages')}
              onSaveSuccess={(updated) => {
                if (updated) setSections(updated);
                fetchPage();
                onShowToast?.(\`"\${displayTitle}" layout and articles permanently saved live!\`);
              }}
              onOpenSettings={() => setActiveTab('seo')}
            />
          </div>
        )
      )}

      {/* ========================================================
          TAB 2: PAGE INFORMATION & SEO`;

if (code.match(oldTabsAndTab1Regex)) {
  code = code.replace(oldTabsAndTab1Regex, newTabsAndTab1Code);
  console.log('Successfully updated main return to render in SAME page!');
} else {
  console.log('oldTabsAndTab1Regex not matched. Searching lines...');
  const lines = code.split('\n');
  const startIdx = lines.findIndex(l => l.includes("className=\"admin-segmented-tabs-bar\""));
  const endIdx = lines.findIndex(l => l.includes("TAB 2: PAGE INFORMATION & SEO"));
  if (startIdx !== -1 && endIdx !== -1) {
    const before = lines.slice(0, startIdx - 1);
    const after = lines.slice(endIdx - 1);
    code = before.join('\n') + '\n' + newTabsAndTab1Code + '\n' + after.join('\n');
    console.log('Successfully replaced via line slicing!');
  }
}

// 4. Update Header Card with nice in-place buttons (Toggle SEO, View Live Page, Publish Live)
const oldHeaderRight = `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleSavePage('published')}
            disabled={saving}`;

const newHeaderRight = `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'seo' ? 'sections' : 'seo')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.05rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: activeTab === 'seo' ? '#eff6ff' : '#ffffff',
              color: activeTab === 'seo' ? '#2563eb' : '#334155',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Settings size={15} />
            <span>{activeTab === 'seo' ? '👁️ Live UI Studio' : '⚙️ Page Info & SEO'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.open(displaySlug, '_blank')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.05rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={15} />
            <span>View Live Page</span>
          </button>

          <button
            type="button"
            onClick={() => handleSavePage('published')}
            disabled={saving}`;

code = code.replace(oldHeaderRight, newHeaderRight);

fs.writeFileSync(editorPath, code, 'utf8');
console.log('AdminPageEditor.jsx successfully updated.');

