import React from 'react';

export default function DynamicBrands({ data = {} }) {
  const title = data.title || data.heading || 'Trusted by Builders & Industry Leaders';
  const subtitle = data.subtitle || data.subheading || '';
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0 && !title) return null;

  return (
    <section className="dyn-section" style={{ padding: '3rem 0', width: '100%', background: 'var(--bg-secondary, rgba(0,0,0,0.02))' }}>
      <div className="dyn-container">
        {(title || subtitle) && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {title && (
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem', color: 'var(--text-secondary)' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '0.95rem', color: 'var(--text-tertiary)', maxWidth: '580px', margin: '0 auto' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2.5rem', 
            flexWrap: 'wrap',
            opacity: 0.85
          }}
        >
          {items.map((brand, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: 750, 
                fontSize: '1.1rem',
                color: 'var(--text-primary)',
                padding: '0.75rem 1.5rem',
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '10px'
              }}
            >
              {brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={brand.name || 'Brand'} 
                  style={{ height: '28px', maxWidth: '120px', objectFit: 'contain' }} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
              <span>{brand.name || brand.label || `Partner ${idx + 1}`}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
