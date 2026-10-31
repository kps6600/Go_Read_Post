const fs = require('fs');

const studioPath = 'frontend/src/components/admin/LiveWholePageStudio.jsx';
let code = fs.readFileSync(studioPath, 'utf8');

code = code.replace(
  /\s*\)\;\s*\}\)\s*\}\)\)\s*\{[\s\S]*?Prominent Bottom/,
  `);
                })
              )}

                {/* ── Prominent Bottom`
);

fs.writeFileSync(studioPath, code, 'utf8');
console.log('Fixed closing parens in LiveWholePageStudio.jsx');
