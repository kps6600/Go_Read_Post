import React from 'react';

export default function DynamicStats({ data = {} }) {
  const title = data.title || data.heading || '';
  const subtitle = data.subtitle || data.subheading || '';
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0 && !title) return null;

  return (
    <section className="dyn-section" style={{ padding: '3.5rem 0', width: '100%' }}>
      <div className="dyn-container">
        {(title || subtitle) && (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {title && (
              <h2 style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1.5rem' 
          }}
        >
          {items.map((stat, idx) => (
            <div 
              key={idx} 
              style={{ 
                background: 'var(--bg-surface, #ffffff)', 
                border: '1px solid var(--border-color, #e2e8f0)', 
                borderRadius: '16px', 
                padding: '2rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}
            >
              <div 
                style={{ 
                  fontSize: 'clamp(2.25rem, 3.5vw, 3rem)', 
                  fontWeight: 900, 
                  color: 'var(--brand-primary, #ea580c)', 
                  lineHeight: 1.1,
                  marginBottom: '0.5rem'
                }}
              >
                {stat.number || stat.value || stat.stat}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {stat.label || stat.title}
              </div>
              {stat.meta && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {stat.meta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
