const fs = require('fs');

const editorPath = 'frontend/src/components/admin/AdminPageEditor.jsx';
let code = fs.readFileSync(editorPath, 'utf8');

// Replace lines around where activeTab === 'sections' is handled
const targetStr = `  // ── 2. DEDICATED FULL-SCREEN WHOLE HOMEPAGE STUDIO PAGE VIEW ──
  if (isWholeHomeStudioOpen) {
    return (
      <div className="admin-live-studio-dedicated-page">
        <LiveHomepageStudio
          isOpen={true}
          initialSections={sections}
          stories={allStories.length ? allStories : ALL_STORIES}
          onClose={handleCloseWholeHomeStudio}
          onSaveSuccess={(updatedSections) => {
            if (updatedSections) setSections(updatedSections);
            fetchPage();
            onShowToast?.('Whole homepage layout and articles permanently saved live!');
          }}
        />
      </div>
    );
  }`;

const replacementStr = `  // ── 2. DEDICATED WHOLE PAGE LIVE VISUAL STUDIO (DEFAULT VIEW) ──
  if (activeTab === 'sections') {
    return (
      <div className="admin-live-studio-dedicated-page" style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
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
          onSaveSuccess={(updatedSections) => {
            if (updatedSections) setSections(updatedSections);
            fetchPage();
            onShowToast?.(\`"\${displayTitle}" layout and articles permanently saved live!\`);
          }}
          onOpenSettings={() => setActiveTab('seo')}
        />
      </div>
    );
  }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(editorPath, code, 'utf8');
console.log('Updated AdminPageEditor.jsx to return LiveWholePageStudio when activeTab === sections.');
