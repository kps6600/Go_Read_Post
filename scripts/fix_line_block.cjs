const fs = require('fs');

const studioPath = 'frontend/src/components/admin/LiveWholePageStudio.jsx';
let content = fs.readFileSync(studioPath, 'utf8');
const lines = content.split('\n');

// Replace lines 2020-2025 (0-indexed: 2019 to 2025)
const targetBlock = lines.slice(2018, 2026).join('\n');
console.log('Target block:\n', targetBlock);

const newBlock = `                      )}
                    </div>
                  );
                })
              )}`;

content = content.replace(targetBlock, newBlock);
fs.writeFileSync(studioPath, content, 'utf8');
console.log('Replaced target block!');
