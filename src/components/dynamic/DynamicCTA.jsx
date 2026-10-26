import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function DynamicCTA({ data = {} }) {
  const headline = data.headline || data.heading || data.title || 'Ready to Amplify Your Brand and Accelerate Growth?';
  const description = data.description || '';
  const primaryBtnText = data.primaryBtnText || data.buttonText || 'Schedule Consultation';
  const primaryBtnUrl = data.primaryBtnUrl || data.buttonUrl || '#contact';
  const secondaryBtnText = data.secondaryBtnText || '';
  const secondaryBtnUrl = data.secondaryBtnUrl || '#services';

  return (
    <section className="dyn-section dyn-cta-section">
      <div className="dyn-container">
        <div className="dyn-cta-box">
          <div className="dyn-cta-badge">
            <Sparkles size={14} />
            <span>LET'S BUILD SOMETHING GREAT</span>
          </div>
          <h2 className="dyn-cta-title">{headline}</h2>
          {description && <p className="dyn-cta-desc">{description}</p>}
          <div className="dyn-cta-buttons">
            {primaryBtnText && (
              <a href={primaryBtnUrl || '#'} className="dyn-btn-primary light">
                <span>{primaryBtnText}</span>
                <ArrowRight size={16} />
              </a>
            )}
            {secondaryBtnText && (
              <a href={secondaryBtnUrl || '#'} className="dyn-btn-secondary light">
                <span>{secondaryBtnText}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
