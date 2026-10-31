const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/admin/LiveBannerEditor.jsx', 'utf8');

// 1. Add handleInlineSlideUpdate and handleInlinePopularUpdate functions before persistToDatabase
const handlerCode = `
  const handleInlineSlideUpdate = (updates) => {
    if (slides.length === 0) return;
    const nextSlides = [...slides];
    nextSlides[activeSlideIdx] = {
      ...nextSlides[activeSlideIdx],
      ...updates
    };
    updateSlidesState(nextSlides, activeSlideIdx);
    persistToDatabase(nextSlides, popularArticles);
  };

  const handleInlinePopularUpdate = (idx, updates) => {
    if (!popularArticles[idx]) return;
    const nextPop = [...popularArticles];
    nextPop[idx] = {
      ...nextPop[idx],
      ...updates
    };
    updatePopularState(nextPop);
    persistToDatabase(slides, nextPop);
  };
`;

code = code.replace(
  /\/\/ INSTANT AUTO-SAVE PERSISTENCE TO DATABASE/,
  `${handlerCode}\n  // INSTANT AUTO-SAVE PERSISTENCE TO DATABASE`
);

// 2. Add Change Photo overlay button on Hero Card
const heroOverlayTarget = `<div className="mhp-hero-overlay" />`;
const heroOverlayReplacement = `<div className="mhp-hero-overlay" />

                  {/* Direct Change Photo Overlay Button */}
                  <div className="lse-card-img-overlay" style={{ top: '16px', right: '16px', zIndex: 30 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentImg = currentSlide.image || '';
                        const newImg = window.prompt("Enter new background photo URL for this hero slide:", currentImg);
                        if (newImg && newImg.trim() && newImg !== currentImg) {
                          handleInlineSlideUpdate({ image: newImg.trim(), bgImage: newImg.trim() });
                        }
                      }}
                      style={{
                        background: 'rgba(15, 23, 42, 0.92)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 750,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                      }}
                      title="Change Hero Background Photo URL"
                    >
                      <ImageIcon size={14} />
                      <span>Change Photo</span>
                    </button>
                  </div>`;

code = code.replace(heroOverlayTarget, heroOverlayReplacement);

// 3. Make Category on Hero Slide contentEditable
const oldSlideCat = `<span>{currentSlide.category}</span>`;
const newSlideCat = `<span 
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          className="lse-direct-editable"
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent.trim();
                            if (val && val !== currentSlide.category) {
                              handleInlineSlideUpdate({ category: val, badge: val });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          title="Click directly to edit category badge"
                          style={{ cursor: 'text' }}
                        >
                          {currentSlide.category}
                        </span>`;
code = code.replace(oldSlideCat, newSlideCat);

// 4. Make Title on Hero Slide contentEditable
const oldSlideTitle = `<h1 
                      className="mhp-hero-title" 
                      style={{ margin: '0 0 1rem', lineHeight: 1.2 }}
                    >
                      {currentSlide.title}
                    </h1>`;

const newSlideTitle = `<h1 
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
                    </h1>`;
code = code.replace(oldSlideTitle, newSlideTitle);

// 5. Make Excerpt on Hero Slide contentEditable
const oldSlideExcerpt = `{currentSlide.excerpt && (
                      <p 
                        className="mhp-hero-desc" 
                        style={{ margin: '0 0 1.25rem' }}
                      >
                        {currentSlide.excerpt}
                      </p>
                    )}`;

const newSlideExcerpt = `<p 
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
                      </p>`;
code = code.replace(oldSlideExcerpt, newSlideExcerpt);

// 6. Make Primary Button Text on Hero Slide contentEditable
const oldBtnText = `<span>{currentSlide.primaryBtnText || 'Read More'}</span>`;
const newBtnText = `<span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        className="lse-direct-editable"
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== (currentSlide.primaryBtnText || 'Read More')) {
                            handleInlineSlideUpdate({ primaryBtnText: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        title="Click directly to edit button label"
                        style={{ cursor: 'text' }}
                      >
                        {currentSlide.primaryBtnText || 'Read More'}
                      </span>`;
code = code.replace(oldBtnText, newBtnText);

// 7. Make Popular Title contentEditable
const oldPopTitle = `<span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{data.popularTitle || 'Popular Posts'}</span>`;
const newPopTitle = `<span 
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className="lse-direct-editable"
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim();
                        if (val && val !== (data.popularTitle || 'Popular Posts')) {
                          setData(prev => ({ ...prev, popularTitle: val }));
                          const finalData = { ...data, popularTitle: val, slides, popularArticles };
                          if (onAutoSave) onAutoSave(finalData);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      title="Click directly to edit section title"
                      style={{ fontWeight: 800, fontSize: '1.1rem', cursor: 'text' }}
                    >
                      {data.popularTitle || 'Popular Posts'}
                    </span>`;
code = code.replace(oldPopTitle, newPopTitle);

// 8. Make Popular Post Item Title contentEditable
const oldItemTitle = `<h4 className="mhp-popular-title">{item.title}</h4>`;
const newItemTitle = `<h4 
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          className="mhp-popular-title lse-direct-editable"
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent.trim();
                            if (val && val !== item.title) {
                              handleInlinePopularUpdate(idx, { title: val });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          title="Click directly to edit title"
                          style={{ cursor: 'text' }}
                        >
                          {item.title}
                        </h4>`;
code = code.replace(oldItemTitle, newItemTitle);

// 9. Make Popular Post Item Category contentEditable
const oldItemCat = `{item.category && <span style={{ color: '#fb923c', marginRight: '4px' }}>{item.category} •</span>}`;
const newItemCat = `{item.category && (
                            <span 
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              className="lse-direct-editable"
                              onBlur={(e) => {
                                const val = e.currentTarget.textContent.trim();
                                if (val && val !== item.category) {
                                  handleInlinePopularUpdate(idx, { category: val });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                }
                              }}
                              title="Click directly to edit category"
                              style={{ color: '#fb923c', marginRight: '4px', cursor: 'text' }}
                            >
                              {item.category} •
                            </span>
                          )}`;
code = code.replace(oldItemCat, newItemCat);

// 10. Wrap Popular Post Thumbnail with Photo Overlay
const oldItemThumb = `<img \n                          src={item.image} \n                          alt={item.title} \n                          className="mhp-popular-thumb"\n                          loading="lazy"\n                        />`;
const newItemThumb = `<div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }} className="lbe-popular-thumb-wrap">
                          <div className="lse-card-img-overlay" style={{ top: '2px', right: '2px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newImg = window.prompt("Enter new photo URL for this story:", item.image);
                                if (newImg && newImg.trim() && newImg !== item.image) {
                                  handleInlinePopularUpdate(idx, { image: newImg.trim(), coverImage: newImg.trim() });
                                }
                              }}
                              style={{
                                background: 'rgba(15, 23, 42, 0.92)',
                                color: '#ffffff',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                fontSize: '0.62rem',
                                cursor: 'pointer'
                              }}
                              title="Change photo URL"
                            >
                              <ImageIcon size={10} />
                            </button>
                          </div>
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="mhp-popular-thumb"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>`;
code = code.replace(oldItemThumb, newItemThumb);

fs.writeFileSync('frontend/src/components/admin/LiveBannerEditor.jsx', code, 'utf8');
console.log('LiveBannerEditor.jsx successfully updated with in-place UI editable capabilities.');
