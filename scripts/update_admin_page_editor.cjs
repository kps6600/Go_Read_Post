const fs = require('fs');

const editorPath = 'frontend/src/components/admin/AdminPageEditor.jsx';
let code = fs.readFileSync(editorPath, 'utf8');

// 1. Import LiveWholePageStudio
if (!code.includes('LiveWholePageStudio')) {
  code = code.replace(
    /import LiveHomepageStudio from '\.\/LiveHomepageStudio';/,
    `import LiveHomepageStudio from './LiveHomepageStudio';\nimport LiveWholePageStudio from './LiveWholePageStudio';`
  );
}

// 2. In AdminPageEditor, when activeTab === 'sections', replace the static row builder with LiveWholePageStudio
const oldTab1Pattern = /\{\/\* ========================================================\s*TAB 1: SECTION-BASED PAGE BUILDER\s*======================================================== \*\/\}\s*\{activeTab === 'sections' && \([\s\S]*?\{\/\* ========================================================\s*TAB 2: PAGE INFORMATION & SEO/;

const newTab1Code = `{/* ========================================================
          TAB 1: WHOLE PAGE LIVE VISUAL STUDIO (FULL WYSIWYG)
         ======================================================== */}
      {activeTab === 'sections' && (
        <div className="admin-live-whole-page-studio-container" style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          <LiveWholePageStudio
            isOpen={true}
            pageId={pageId}
            pageTitle={displayTitle}
            pageSlug={displaySlug}
            initialSections={sections}
            stories={allStories.length ? allStories : ALL_STORIES}
            onClose={() => {
              if (onNavigate) {
                onNavigate('/admin/pages');
              } else {
                window.location.href = '/admin/pages';
              }
            }}
            onSaveSuccess={(updated) => {
              if (updated) setSections(updated);
              fetchPage();
              onShowToast?.(\`"\${displayTitle}" layout and articles permanently saved live!\`);
            }}
            onOpenSettings={() => setActiveTab('seo')}
          />
        </div>
      )}

      {/* ========================================================
          TAB 2: PAGE INFORMATION & SEO`;

if (code.match(oldTab1Pattern)) {
  code = code.replace(oldTab1Pattern, newTab1Code);
  console.log('Successfully replaced static row table with LiveWholePageStudio in AdminPageEditor.jsx');
} else {
  console.log('oldTab1Pattern did not match. Trying line slice replacement...');
  const lines = code.split('\n');
  const startIdx = lines.findIndex(l => l.includes('TAB 1: SECTION-BASED PAGE BUILDER'));
  const endIdx = lines.findIndex(l => l.includes('TAB 2: PAGE INFORMATION & SEO'));
  if (startIdx !== -1 && endIdx !== -1) {
    const before = lines.slice(0, startIdx - 1);
    const after = lines.slice(endIdx - 1);
    code = before.join('\n') + '\n' + newTab1Code + '\n' + after.join('\n');
    console.log('Successfully replaced via line slicing!');
  }
}

fs.writeFileSync(editorPath, code, 'utf8');
