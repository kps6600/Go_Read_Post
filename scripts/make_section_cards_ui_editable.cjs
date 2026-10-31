const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'admin', 'LiveSectionEditor.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the Latest Articles Header (lines ~1025-1031)
const oldHeader = `<div className="lap-header" style={{ marginBottom: '1.75rem' }}>
                  <h1 className="lap-title">
                    {getSectionTitle()}
                  </h1>
                </div>`;

const newHeader = `<div className="lap-header" style={{ marginBottom: '1.75rem' }}>
                  <h1 
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    className="lap-title lse-direct-editable"
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
                    title="Click directly on text to edit section heading"
                    style={{ cursor: 'text' }}
                  >
                    {getSectionTitle()}
                  </h1>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    className="lse-direct-editable"
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent.trim();
                      if (val !== (data.subtitle || data.description)) {
                        updateDataDirectly({ subtitle: val, description: val });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    title="Click directly on text to edit subtitle"
                    style={{ margin: '0.4rem 0 0', fontSize: '0.96rem', color: '#64748b', cursor: 'text' }}
                  >
                    {data.subtitle || data.description || "Chronological reporting, deep tech breakthroughs, and real-time newsroom dispatches."}
                  </p>
                </div>`;

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  console.log('Replaced lap-header in LiveSectionEditor.jsx');
}

// 2. Update the card in renderer 1 (latest articles feed)
const oldCard1 = `<div 
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
                          >
                            <img 
                              src={artImg} 
                              alt={artTitle} 
                              className="lap-thumb"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transition: 'transform 0.4s ease'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                              }}
                            />

                            {/* Bottom Gradient for Category Tag Legibility */}
                            <div 
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(180deg, transparent 65%, rgba(15, 23, 42, 0.75) 100%)',
                                pointerEvents: 'none'
                              }}
                            />

                            <span 
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
                            </span>
                          </div>

                            <div 
                              style={{
                                padding: '1.15rem',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                justifycontent: 'space-between',
                                background: '#ffffff'
                              }}
                            >
                              <div>
                                <h3 
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
                                </h3>
                                {artExcerpt && (
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
                                  <span style={{ color: '#475569', fontWeight: 650 }}>{artAuthor}</span>
                                  <span>•</span>
                                  <span>{artDate}</span>
                                </div>
                              </div>
                            </div>`;

const newCard1 = `<div 
                            className="lap-thumb-wrap"
                            style={{ 
                              position: 'relative', 
                              width: '100%', 
                              height: '190px', 
                              overflow: 'hidden', 
                              background: '#0f172a'
                            }}
                          >
                            <img 
                              src={artImg} 
                              alt={artTitle} 
                              className="lap-thumb"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transition: 'transform 0.4s ease'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80';
                              }}
                            />

                            {/* Floating Change Photo Pill on Hover */}
                            <div className="lse-card-img-overlay">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newImg = window.prompt("Enter new image URL for this article:", artImg);
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
                            </div>

                            {/* Bottom Gradient for Category Tag Legibility */}
                            <div 
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(180deg, transparent 65%, rgba(15, 23, 42, 0.75) 100%)',
                                pointerEvents: 'none'
                              }}
                            />

                            <span 
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
                            </span>
                          </div>

                            <div 
                              style={{
                                padding: '1.15rem',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                justifyContent: 'space-between',
                                background: '#ffffff'
                              }}
                            >
                              <div>
                                <h3 
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
                                </h3>
                                <p 
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
                                  title="Click directly to edit summary teaser in-place"
                                >
                                  {artExcerpt || "Click to add article summary teaser..."}
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
                                  </span>
                                  <span>•</span>
                                  <span>{artDate}</span>
                                </div>
                              </div>
                            </div>`;

// Add Swap button to top action bar in card 1
const oldActions1 = `<button
                                type="button"
                                onClick={(e) => handleRemoveArticle(idx, e)}
                                title="Delete this article permanently"`;

const newActions1 = `<button
                                type="button"
                                onClick={() => handleOpenPicker({ type: 'replace', index: idx })}
                                title="Replace with another article"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '5px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#0284c7',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <ArrowLeftRight size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleRemoveArticle(idx, e)}
                                title="Delete this article permanently"`;

content = content.replace(oldActions1, newActions1);

// Normalize line endings in matching
const normalize = s => s.replace(/\r\n/g, '\n').trim();

// Try replacing card1
const normContent = content.replace(/\r\n/g, '\n');
const normOldCard1 = normalize(oldCard1);

if (normContent.includes(normOldCard1)) {
  content = normContent.replace(normOldCard1, newCard1);
  console.log('Replaced card1 in LiveSectionEditor.jsx');
} else {
  console.log('Could not match card1 directly, let us use regex or sub-blocks');
}

fs.writeFileSync(filePath, content, 'utf8');
