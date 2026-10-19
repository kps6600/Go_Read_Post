import React from 'react';
import { Star } from 'lucide-react';

export default function DynamicTestimonials({ data = {} }) {
  const title = data.title || data.heading || 'Trusted by Visionary Leaders';
  const subtitle = data.subtitle || data.subheading || 'Hear what founders, tech executives, and venture partners say about working with us.';
  const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];

  const defaultTestimonials = [
    {
      name: 'Aditi Sharma',
      role: 'Founder & CEO, ZetaScale',
      quote: 'GoReadPost helped us launch our story to over 50,000 founders across India within 48 hours. Our inbound investor enquiries tripled in the first week.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80'
    },
    {
      name: 'Rahul Varma',
      role: 'Managing Partner, Peak Horizon Capital',
      quote: 'The level of depth, editorial diligence, and speed this team brings is second to none in the Indian tech ecosystem.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
    },
    {
      name: 'Pooja Iyer',
      role: 'Chief Marketing Officer, HyperCloud',
      quote: 'Their modern CMS and storytelling capabilities enabled us to deliver high-converting campaigns that directly boosted pipeline revenue.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
    }
  ];

  const items = testimonials.length > 0 
    ? testimonials 
    : (Array.isArray(data.items) && data.items.length > 0) 
      ? data.items 
      : defaultTestimonials;

  return (
    <section className="dyn-section dyn-testimonials-section">
      <div className="dyn-container">
        <div className="dyn-section-header">
          <span className="dyn-section-badge">TESTIMONIALS</span>
          <h2 className="dyn-section-title">{title}</h2>
          {subtitle && <p className="dyn-section-subtitle">{subtitle}</p>}
        </div>

        <div className="dyn-testimonials-grid">
          {items.map((item, idx) => (
            <div key={idx} className="dyn-testimonial-card">
              <div className="dyn-testimonial-stars">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="dyn-testimonial-quote">"{item.quote}"</p>
              <div className="dyn-testimonial-author">
                {item.avatar && (
                  <img src={item.avatar} alt={item.name} className="dyn-testimonial-avatar" />
                )}
                <div>
                  <h4 className="dyn-testimonial-name">{item.name}</h4>
                  <span className="dyn-testimonial-role">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
