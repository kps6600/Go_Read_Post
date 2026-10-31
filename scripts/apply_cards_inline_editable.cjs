const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'admin', 'LiveSectionEditor.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Section 1: For story (latest articles view)
// Replace thumbnail container
content = content.replace(
  `<div 
                            className="lap-thumb-wrap"
                            onClick={() => handleOpenArticleEditor(story)}
                            style={{ 
                              position: 'relative', 
                              width: '100%', 
                              height: '190px', 
                              overflow: 'hidden', 
                              cursor: 'pointer',
                              background: '#0f172a'
                            }}
                            title="Click to edit article"
                          >`,
  `<div 
                            className="lap-thumb-wrap"
                            style={{ 
                              position: 'relative', 
                              width: '100%', 
                              height: '190px', 
                              overflow: 'hidden', 
                              background: '#0f172a'
                            }}
                          >
                            <div className="lse-card-img-overlay">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newImg = window.prompt("Enter new photo URL for this article:", artImg);
                                  if (newImg && newImg.trim() && newImg !== artImg) {
                                    handleInlineArticleUpdate(story, { image: newImg.trim(), featuredImage: newImg.trim() });
                                  }
                                }}
                                style={{
                                  background: 'rgba(15, 23, 42, 0.88)',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255,255,255,0.25)',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 750,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                  backdropFilter: 'blur(4px)'
                                }}
                                title="Change photo URL"
                              >
                                <ImageIcon size={12} />
                                <span>Change Photo</span>
                              </button>
                            </div>`
);

// Replace category badge on story
content = content.replace(
  `<span 
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
                                boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                              }}
                            >
                              {artCat}
                            </span>`,
  `<span 
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              className="lse-direct-editable"
                              onBlur={(e) => {
                                const val = e.currentTarget.textContent.trim();
                                if (val && val !== artCat) {
                                  handleInlineArticleUpdate(story, { category: val, categoryName: val, categoryLabel: val });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                }
                              }}
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
                              title="Click directly to edit category badge"
                            >
                              {artCat}
                            </span>`
);

// Replace title & excerpt on story
const oldStoryTitle = `<h3 
                                  onClick={() => handleOpenArticleEditor(story)}
                                  style={{ 
                                    cursor: 'pointer',
                                    fontSize: '0.98rem',
                                    fontWeight: 750,
                                    lineHeight: 1.38,
                                    color: '#0f172a',
                                    margin: '0 0 8px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                  title="Click to edit article title"
                                >
                                  {artTitle}
                                </h3>`;

const newStoryTitle = `<h3 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val && val !== artTitle) {
                                      handleInlineArticleUpdate(story, { title: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  style={{ 
                                    cursor: 'text',
                                    fontSize: '0.98rem',
                                    fontWeight: 750,
                                    lineHeight: 1.38,
                                    color: '#0f172a',
                                    margin: '0 0 8px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                  title="Click directly to edit title in-place"
                                >
                                  {artTitle}
                                </h3>`;

content = content.replace(oldStoryTitle, newStoryTitle);

// Replace excerpt & author on story
const oldStoryExcerpt = `{artExcerpt && (
                                  <p 
                                    style={{
                                      fontSize: '0.82rem',
                                      color: '#64748b',
                                      lineHeight: 1.45,
                                      margin: '0 0 10px',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {artExcerpt}
                                  </p>
                                )}
                                <div 
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.76rem',
                                    color: '#94a3b8',
                                    fontWeight: 600
                                  }}
                                >
                                  <span style={{ color: '#475569', fontWeight: 650 }}>{artAuthor}</span>`;

const newStoryExcerpt = `<p 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val !== artExcerpt) {
                                      handleInlineArticleUpdate(story, { excerpt: val, summary: val, subtitle: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  style={{
                                    cursor: 'text',
                                    fontSize: '0.82rem',
                                    color: '#64748b',
                                    lineHeight: 1.45,
                                    margin: '0 0 10px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                  title="Click directly to edit excerpt in-place"
                                >
                                  {artExcerpt || "Click to add summary..."}
                                </p>
                                <div 
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.76rem',
                                    color: '#94a3b8',
                                    fontWeight: 600
                                  }}
                                >
                                  <span 
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    className="lse-direct-editable"
                                    onBlur={(e) => {
                                      const val = e.currentTarget.textContent.trim();
                                      if (val && val !== artAuthor) {
                                        handleInlineArticleUpdate(story, { authorName: val, author: val });
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.currentTarget.blur();
                                      }
                                    }}
                                    style={{ color: '#475569', fontWeight: 650, cursor: 'text' }}
                                    title="Click directly to edit author"
                                  >
                                    {artAuthor}
                                  </span>`;

content = content.replace(oldStoryExcerpt, newStoryExcerpt);

// Section 2: For blog (homepage feed view)
content = content.replace(
  `<div 
                            className="mhp-blog-thumb-wrap"
                            onClick={() => handleOpenArticleEditor(blog)}
                            style={{ 
                              position: 'relative', 
                              width: '100%', 
                              height: '190px', 
                              overflow: 'hidden', 
                              cursor: 'pointer',
                              background: '#0f172a'
                            }}
                            title="Click to edit article"
                          >`,
  `<div 
                            className="mhp-blog-thumb-wrap"
                            style={{ 
                              position: 'relative', 
                              width: '100%', 
                              height: '190px', 
                              overflow: 'hidden', 
                              background: '#0f172a'
                            }}
                          >
                            <div className="lse-card-img-overlay">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newImg = window.prompt("Enter new photo URL for this article:", artImg);
                                  if (newImg && newImg.trim() && newImg !== artImg) {
                                    handleInlineArticleUpdate(blog, { image: newImg.trim(), featuredImage: newImg.trim() });
                                  }
                                }}
                                style={{
                                  background: 'rgba(15, 23, 42, 0.88)',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255,255,255,0.25)',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 750,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                  backdropFilter: 'blur(4px)'
                                }}
                                title="Change photo URL"
                              >
                                <ImageIcon size={12} />
                                <span>Change Photo</span>
                              </button>
                            </div>`
);

const oldBlogTitle = `<h3 
                                onClick={() => handleOpenArticleEditor(blog)}
                                style={{ 
                                  cursor: 'pointer',
                                  fontSize: '0.98rem',
                                  fontWeight: 750,
                                  lineHeight: 1.38,
                                  color: '#0f172a',
                                  margin: '0 0 8px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                                title="Click to edit article title"
                              >
                                {artTitle}
                              </h3>`;

const newBlogTitle = `<h3 
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                className="lse-direct-editable"
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent.trim();
                                  if (val && val !== artTitle) {
                                    handleInlineArticleUpdate(blog, { title: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                }}
                                style={{ 
                                  cursor: 'text',
                                  fontSize: '0.98rem',
                                  fontWeight: 750,
                                  lineHeight: 1.38,
                                  color: '#0f172a',
                                  margin: '0 0 8px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                                title="Click directly to edit title in-place"
                              >
                                {artTitle}
                              </h3>`;

content = content.replace(oldBlogTitle, newBlogTitle);

// Replace blog excerpt & author
const oldBlogExcerpt = `{blog.excerpt && (
                                <p 
                                  style={{
                                    fontSize: '0.82rem',
                                    color: '#64748b',
                                    lineHeight: 1.45,
                                    margin: '0 0 10px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {blog.excerpt}
                                </p>
                              )}
                              <div 
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.76rem',
                                  color: '#94a3b8',
                                  fontWeight: 600
                                }}
                              >
                                <span style={{ color: '#475569', fontWeight: 650 }}>{artAuthor}</span>`;

const newBlogExcerpt = `<p 
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                className="lse-direct-editable"
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent.trim();
                                  if (val !== blog.excerpt) {
                                    handleInlineArticleUpdate(blog, { excerpt: val, summary: val, subtitle: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                }}
                                style={{
                                  cursor: 'text',
                                  fontSize: '0.82rem',
                                  color: '#64748b',
                                  lineHeight: 1.45,
                                  margin: '0 0 10px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                                title="Click directly to edit excerpt in-place"
                              >
                                {blog.excerpt || "Click to add summary..."}
                              </p>
                              <div 
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.76rem',
                                  color: '#94a3b8',
                                  fontWeight: 600
                                }}
                              >
                                <span 
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="lse-direct-editable"
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent.trim();
                                    if (val && val !== artAuthor) {
                                      handleInlineArticleUpdate(blog, { authorName: val, author: val });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  style={{ color: '#475569', fontWeight: 650, cursor: 'text' }}
                                  title="Click directly to edit author"
                                >
                                  {artAuthor}
                                </span>`;

content = content.replace(oldBlogExcerpt, newBlogExcerpt);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated article cards in LiveSectionEditor.jsx');
