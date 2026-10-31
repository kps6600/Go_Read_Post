const fs = require('fs');

const studioPath = 'frontend/src/components/admin/LiveWholePageStudio.jsx';
let code = fs.readFileSync(studioPath, 'utf8');

// Define isLatestPage near the top of the component
if (!code.includes('const isLatestPage =')) {
  code = code.replace(
    /const sectionRefs = useRef\(\{\}\);/,
    `const sectionRefs = useRef({});\n  const isLatestPage = pageId === 'latest' || pageSlug === 'latest';`
  );
}

// Update Tip bar
const oldTipBar = `<div className="lhs-tip-bar">
            <div className="lhs-tip-text">
              <Sparkles size={16} color="#fbbf24" />
              <span>
                <strong>Whole Page Live Studio:</strong> Click any text, headline, or category to edit in-place. Hover images to change photos. Reorder sections with <strong>↑ Up / ↓ Down</strong>.
              </span>
            </div>

            <button
              type="button"
              className="lse-toolbar-btn primary"
              onClick={() => {
                setInsertAtIndex(null);
                setIsAddSectionModalOpen(true);
              }}
            >
              <Plus size={14} />
              <span>+ Add Section to Page</span>
            </button>
          </div>`;

const newTipBar = `<div className="lhs-tip-bar">
            <div className="lhs-tip-text">
              <Sparkles size={16} color="#fbbf24" />
              <span>
                <strong>{isLatestPage ? 'Latest Articles Live UI Studio:' : 'Whole Page Live Studio:'}</strong> Click any headline, category tag, excerpt, or author to edit in-place. Hover article thumbnails to change photos. Reorder cards with <strong>← Left / Right →</strong>.
              </span>
            </div>

            {!isLatestPage && (
              <button
                type="button"
                className="lse-toolbar-btn primary"
                onClick={() => {
                  setInsertAtIndex(null);
                  setIsAddSectionModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>+ Add Section to Page</span>
              </button>
            )}
          </div>`;

code = code.replace(oldTipBar, newTipBar);

// Hide bottom "+ Add Another Section" card if isLatestPage
const oldBottomCardStart = `{/* ── Prominent Bottom "+ Add Another Section to Page" Card ── */}
                <div
                  onClick={() => {`;

const newBottomCardStart = `{/* ── Prominent Bottom "+ Add Another Section to Page" Card ── */}
                {!isLatestPage && (
                <div
                  onClick={() => {`;

const oldBottomCardEnd = `</span>
                </div>`;

const newBottomCardEnd = `</span>
                </div>
                )}`;

if (code.includes(oldBottomCardStart)) {
  code = code.replace(oldBottomCardStart, newBottomCardStart);
  code = code.replace(oldBottomCardEnd, newBottomCardEnd);
}

fs.writeFileSync(studioPath, code, 'utf8');
console.log('Cleaned up tip bar and bottom card for latest page.');
