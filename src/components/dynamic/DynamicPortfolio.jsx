import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function DynamicPortfolio({ data = {} }) {
  const title = data.title || data.heading || 'Featured Work & Case Studies';
  const subtitle = data.subtitle || data.subheading || 'Explore how we have helped brands and founders achieve market dominance.';
  const projects = Array.isArray(data.projects) ? data.projects : [];

  const defaultProjects = [
    {
      title: 'NexTech AI Platform',
      category: 'SaaS / AI',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      description: 'Scaled enterprise analytics dashboard for 500k monthly active users.'
    },
    {
      title: 'FinEdge Wealth App',
      category: 'Fintech',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      description: 'End-to-end mobile banking interface with bank-grade biometric security.'
    },
    {
      title: 'D2C Brand Launchpad',
      category: 'E-Commerce',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      description: 'High-speed headless Shopify storefront yielding 4.2% conversion rate.'
    }
  ];

  const items = projects.length > 0 
    ? projects 
    : (Array.isArray(data.items) && data.items.length > 0) 
      ? data.items 
      : defaultProjects;

  return (
    <section className="dyn-section dyn-portfolio-section">
      <div className="dyn-container">
        <div className="dyn-section-header">
          <span className="dyn-section-badge">PORTFOLIO</span>
          <h2 className="dyn-section-title">{title}</h2>
          {subtitle && <p className="dyn-section-subtitle">{subtitle}</p>}
        </div>

        <div className="dyn-portfolio-grid">
          {items.map((proj, idx) => (
            <div key={idx} className="dyn-portfolio-card">
              <div className="dyn-portfolio-image-wrap">
                <img src={proj.image} alt={proj.title} loading="lazy" />
                <span className="dyn-portfolio-category">{proj.category}</span>
              </div>
              <div className="dyn-portfolio-body">
                <h3 className="dyn-portfolio-title">{proj.title}</h3>
                <p className="dyn-portfolio-desc">{proj.description}</p>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noreferrer" className="dyn-portfolio-link">
                    <span>View Case Study</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
