import React from 'react';

export default function DynamicText({ data = {} }) {
  const title = data.title || data.heading || '';
  const content = data.content || data.body || data.description || '';
  const badge = data.badge || '';
  const alignment = data.alignment || 'left';

  return (
    <section className="dyn-section dyn-text-section" style={{ width: '100%', padding: '3.5rem 0' }}>
      <div className="dyn-container" style={{ width: '100%', maxWidth: '100%', textAlign: alignment }}>
        {badge && (
          <span 
            style={{ 
              display: 'inline-block',
              fontSize: '0.75rem', 
              fontWeight: 800, 
              color: 'var(--brand-primary, #ea580c)', 
              background: 'rgba(234, 88, 12, 0.1)', 
              padding: '0.3rem 0.75rem', 
              borderRadius: '9999px',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {badge}
          </span>
        )}
        {title && <h2 className="dyn-section-title">{title}</h2>}
        <div 
          className="dyn-prose-content"
          style={{ width: '100%', maxWidth: '100%' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
