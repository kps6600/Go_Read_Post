const fs = require('fs');

const cssPath = 'frontend/src/components/admin/LiveHomepageStudio.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Update .lhs-workspace
css = css.replace(
  /\.lhs-workspace\s*\{[\s\S]*?background:[^;]+;\s*\}/,
  `.lhs-workspace {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: radial-gradient(circle at 50% 20%, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.98) 100%);
}`
);

// Update .lhs-canvas-wrapper
css = css.replace(
  /\.lhs-canvas-wrapper\s*\{[\s\S]*?gap:\s*1\.25rem;\s*\}/,
  `.lhs-canvas-wrapper {
  width: 100%;
  max-width: 1420px;
  flex-shrink: 0;
  transition: max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}`
);

// Update .lhs-browser-frame
css = css.replace(
  /\.lhs-browser-frame\s*\{[\s\S]*?flex-direction:\s*column;\s*\}/,
  `.lhs-browser-frame {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.28);
  position: relative;
  overflow: visible;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}`
);

// Update .lhs-real-frontend-sheet
css = css.replace(
  /\.lhs-real-frontend-sheet\s*\{[\s\S]*?font-family:[^;]+;\s*\}/,
  `.lhs-real-frontend-sheet {
  background: #ffffff;
  color: #0f172a;
  min-height: auto;
  border-radius: 16px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated LiveHomepageStudio.css for smooth full-page scrolling.');
