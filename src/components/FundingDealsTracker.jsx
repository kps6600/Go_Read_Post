import React, { useState } from 'react';
import { DollarSign, Search, Building2, MapPin, ArrowUpRight, TrendingUp } from 'lucide-react';
import { FUNDING_DEALS } from '../data/storiesData';

export default function FundingDealsTracker() {
  const [filterSector, setFilterSector] = useState('all');

  const filteredDeals = filterSector === 'all' 
    ? FUNDING_DEALS 
    : FUNDING_DEALS.filter(d => d.sector.toLowerCase().includes(filterSector.toLowerCase()));

  return (
    <section className="section-wrapper" id="deals-tracker">
      <div className="container">
        <div className="section-header-row">
          <div className="section-title-box">
            <div className="section-icon-badge">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="section-title">Funding &amp; Capital Tracker</h2>
              <p className="section-subtitle">Venture rounds, seed capital, and institutional dealflow</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`cat-pill ${filterSector === 'all' ? 'active' : ''}`}
              onClick={() => setFilterSector('all')}
            >
              All Deals
            </button>
            <button 
              className={`cat-pill ${filterSector === 'cyber' ? 'active' : ''}`}
              onClick={() => setFilterSector('cyber')}
            >
              Cybersecurity
            </button>
            <button 
              className={`cat-pill ${filterSector === 'robotics' ? 'active' : ''}`}
              onClick={() => setFilterSector('robotics')}
            >
              Robotics
            </button>
            <button 
              className={`cat-pill ${filterSector === 'space' ? 'active' : ''}`}
              onClick={() => setFilterSector('space')}
            >
              SpaceTech
            </button>
            <button 
              className={`cat-pill ${filterSector === 'd2c' ? 'active' : ''}`}
              onClick={() => setFilterSector('d2c')}
            >
              Consumer &amp; D2C
            </button>
          </div>
        </div>

        <div className="deals-board">
          <div className="deals-table-wrapper">
            <table className="deals-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Amount</th>
                  <th>Round</th>
                  <th>Sector</th>
                  <th>Lead Investors</th>
                  <th>Location</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <div className="deal-company-name">{deal.company}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', maxWidth: '300px' }}>
                        {deal.summary}
                      </div>
                    </td>
                    <td>
                      <span className="deal-amount-pill">{deal.amount}</span>
                    </td>
                    <td>
                      <span className="deal-round-pill">{deal.round}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {deal.sector}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {deal.leadInvestors.map((inv, idx) => (
                          <span key={idx} style={{ 
                            fontSize: '0.75rem', 
                            background: 'var(--bg-tertiary)', 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '4px' 
                          }}>
                            {inv}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} />
                        <span>{deal.city}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {deal.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
