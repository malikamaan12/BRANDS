import React from 'react';
import { MapPin, Building, Sparkles, Mail } from 'lucide-react';

const VENUE_CLUSTERS = [
  {
    id: 'qncc',
    name: 'Qatar National Convention Centre (QNCC)',
    subtitle: 'Theater (2,300 seats), Auditoriums & Exhibition Halls',
    specs: 'State-of-the-art motorized rigging, multi-tier theater acoustic shell',
    matcher: (ven) => ven.includes('qncc')
  },
  {
    id: 'decc',
    name: 'Doha Exhibition and Convention Centre (DECC)',
    subtitle: 'Modular Pillar-Free Exhibition Halls (2,000–30,000 sqm)',
    specs: '8m+ vertical clearance, heavy load-bearing floors for multi-month residencies',
    matcher: (ven) => ven.includes('decc')
  },
  {
    id: 'lusail',
    name: 'Lusail Multipurpose Arena & ABHA Arena',
    subtitle: 'High-Capacity Indoor Arenas (15,300 seats) & Stadium Grounds',
    specs: 'Olympic ice chilling plant, heavy dirt floors & vehicle ventilation',
    matcher: (ven) => ven.includes('lusail') || ven.includes('abha') || ven.includes('stadium')
  },
  {
    id: 'katara',
    name: 'Katara Cultural Village & Katara Opera House',
    subtitle: 'Opera House, Drama Theater & Outdoor Amphitheatre',
    specs: 'Acoustic excellence, cultural tourism prestige, QPO symphonic pairing',
    matcher: (ven) => ven.includes('katara')
  },
  {
    id: 'malls',
    name: 'Premier Luxury Malls & Retail Atriums',
    subtitle: 'Place Vendôme, Mall of Qatar, Doha Festival City, Msheireb',
    specs: 'High dwell-time atriums, luxury shopper demographics, active FECs',
    matcher: (ven) => ven.includes('mall') || ven.includes('vendôme') || ven.includes('vendome') || ven.includes('festival city') || ven.includes('msheireb')
  },
  {
    id: 'aspire',
    name: 'Aspire Zone & Al Maha Island',
    subtitle: 'Sports Precinct, Outdoor Festival Grounds & Winter Wonderland',
    specs: 'Massive outdoor foot-traffic, high-capacity obstacle zones & pop-up parks',
    matcher: (ven) => ven.includes('aspire') || ven.includes('al maha') || ven.includes('outdoor')
  }
];

export default function VenuesMatrix({ ips, onOpenDossier, onOpenPitch }) {
  return (
    <div className="venues-grid">
      {VENUE_CLUSTERS.map((cluster) => {
        const matchedIPs = ips.filter((ip) => cluster.matcher(ip.venue_fit.toLowerCase()));

        return (
          <div key={cluster.id} className="glass-panel venue-card">
            
            {/* Cluster Header */}
            <div className="venue-card-header">
              <div className="venue-avatar">
                <Building size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {cluster.name}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {cluster.subtitle}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--accent-gold)', marginTop: '0.3rem', fontWeight: 500 }}>
                  Specs: {cluster.specs}
                </div>
              </div>
            </div>

            {/* Matched IP List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Matched Properties ({matchedIPs.length})</span>
                <span style={{ color: 'var(--accent-cyan)' }}>Doha Priority</span>
              </div>

              {matchedIPs.map((ip) => (
                <div 
                  key={ip.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 0.95rem',
                    background: 'rgba(14, 20, 34, 0.7)',
                    border: '1px solid var(--glass-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast), border-color var(--transition-fast)'
                  }}
                  onClick={() => onOpenDossier(ip)}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>
                      {ip.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                      {ip.licensor} • {ip.category}
                    </div>
                  </div>

                  <button 
                    className="apple-btn apple-btn-outline-gold"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPitch(ip);
                    }}
                    title="Generate pitch email"
                  >
                    <Mail size={12} />
                    <span>Pitch</span>
                  </button>
                </div>
              ))}

              {matchedIPs.length === 0 && (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '0.5rem 0' }}>
                  No matching IP properties found with current filters
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
