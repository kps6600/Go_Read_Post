const fs = require('fs');

// ========================================================
// 1. UPDATE LiveSectionEditor.jsx
// ========================================================
let lseCode = fs.readFileSync('frontend/src/components/admin/LiveSectionEditor.jsx', 'utf8');

// Replace isArticleFeed definition
lseCode = lseCode.replace(
  /const isArticleFeed = \['stories_feed'[^;]+;/,
  `const isArticleFeed = ['stories_feed', 'story_feed', 'article_feed', 'article_story_feed', 'latest_blogs', 'latest', 'trending', 'popular_editors', 'business', 'spotlight', 'technology', 'ai'].includes(secType) || secType.includes('feed') || secType.includes('story') || secType.includes('article') || secType.includes('blog') || secType.includes('category') || secType.includes('desk') || secType.startsWith('category_');`
);

// Replace branch condition for isLatestPage
lseCode = lseCode.replace(
  /\{isArticleFeed && \(pageId === 'latest' \|\| section\?\.id === 'latest_feed' \? \(/,
  `{isArticleFeed && ((pageId === 'latest' && (secType === 'latest_feed' || secType === 'latest' || section?.id === 'latest_feed')) ? (`
);

// Replace section title span in homepage / category section view with contentEditable h2
lseCode = lseCode.replace(
  /<div className="mhp-section-title-wrap">\s*<span>\{getSectionTitle\(\)\}<\/span>\s*<\/div>/,
  `<div className="mhp-section-title-wrap">
                      <h2
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        className="mhp-section-title lse-direct-editable"
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== getSectionTitle()) {
                            updateDataDirectly({ heading: val, title: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title="Click directly on text to edit section title"
                        style={{ cursor: 'text', margin: 0, fontSize: '1.35rem', fontWeight: 800 }}
                      >
                        {getSectionTitle()}
                      </h2>
                    </div>`
);

// Replace category pill in homepage section cards with contentEditable
lseCode = lseCode.replace(
  /<span \s*style=\{\{\s*position: 'absolute',\s*bottom: '10px',\s*left: '10px',\s*zIndex: 10,\s*background: '#0f172a',\s*color: '#ffffff',\s*fontSize: '0.68rem',\s*fontWeight: 850,\s*letterSpacing: '0.06em',\s*padding: '4px 9px',\s*borderRadius: '5px',\s*textTransform: 'uppercase',\s*boxShadow: '0 2px 6px rgba\(0,0,0,0.5\)'\s*\}\}\s*>\s*\{artCat\}\s*<\/span>/,
  `<span 
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              className="lse-direct-editable"
                              onBlur={(e) => {
                                const val = e.currentTarget.textContent.trim();
                                if (val && val !== artCat) {
                                  handleInlineArticleUpdate(blog, { category: val, categoryName: val, categoryLabel: val });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                }
                              }}
                              title="Click directly to edit category badge"
                              style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                zIndex: 10,
                                background: '#0f172a',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                fontWeight: 850,
                                letterSpacing: '0.06em',
                                padding: '4px 9px',
                                borderRadius: '5px',
                                textTransform: 'uppercase',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                cursor: 'text'
                              }}
                            >
                              {artCat}
                            </span>`
);

// Replace excerpt in homepage section cards with contentEditable
lseCode = lseCode.replace(
  /\{blog\.excerpt && \(\s*<p \s*style=\{\{\s*fontSize: '0\.82rem',\s*color: '#64748b',\s*lineHeight: 1\.45,\s*margin: '0 0 10px',\s*display: '-webkit-box',\s*WebkitLineClamp: 2,\s*WebkitBoxOrient: 'vertical',\s*overflow: 'hidden'\s*\}\}\s*>\s*\{blog\.excerpt\}\s*<\/p>\s*\)\}/,
  `<p 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val !== (blog.excerpt || '')) {
                                      handleInlineArticleUpdate(blog, { excerpt: val, summary: val, subtitle: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit excerpt teaser"
                                  style={{
                                    fontSize: '0.82rem',
                                    color: '#64748b',
                                    lineHeight: 1.45,
                                    margin: '0 0 10px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    cursor: 'text'
                                  }}
                                >
                                  {blog.excerpt || 'Click directly to edit excerpt teaser'}
                                </p>`
);

// Replace author in homepage section cards with contentEditable
lseCode = lseCode.replace(
  /<span style=\{\{\s*color: '#475569',\s*fontWeight: 650\s*\}\}>\{artAuthor\}<\/span>/,
  `<span 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val && val !== artAuthor) {
                                      handleInlineArticleUpdate(blog, { author: val, authorName: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  title="Click directly to edit author name"
                                  style={{ color: '#475569', fontWeight: 650, cursor: 'text' }}
                                >
                                  {artAuthor}
                                </span>`
);

fs.writeFileSync('frontend/src/components/admin/LiveSectionEditor.jsx', lseCode, 'utf8');
console.log('LiveSectionEditor.jsx successfully updated.');
