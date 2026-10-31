const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/admin/LiveBannerEditor.jsx', 'utf8');

// Replace h1.mhp-hero-title
code = code.replace(
  /<h1\s+className="mhp-hero-title"[^>]*>[\s\S]*?\{currentSlide\.title\}[\s\S]*?<\/h1>/,
  `<h1 
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className="mhp-hero-title lse-direct-editable" 
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim();
                        if (val && val !== currentSlide.title) {
                          handleInlineSlideUpdate({ title: val, headline: val });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      title="Click directly on text to edit headline"
                      style={{ margin: '0 0 1rem', lineHeight: 1.2, cursor: 'text' }}
                    >
                      {currentSlide.title}
                    </h1>`
);

// Replace p.mhp-hero-desc
code = code.replace(
  /\{currentSlide\.excerpt && \(\s*<p\s+className="mhp-hero-desc"[^>]*>[\s\S]*?<\/p>\s*\)\}/,
  `<p 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        className="mhp-hero-desc lse-direct-editable" 
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val !== currentSlide.excerpt) {
                            handleInlineSlideUpdate({ excerpt: val, subheadline: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title="Click directly on text to edit excerpt"
                        style={{ margin: '0 0 1.25rem', cursor: 'text' }}
                      >
                        {currentSlide.excerpt || 'Click directly to edit excerpt'}
                      </p>`
);

fs.writeFileSync('frontend/src/components/admin/LiveBannerEditor.jsx', code, 'utf8');
console.log('Hero title and excerpt updated.');
