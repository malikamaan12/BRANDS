import React from 'react';
import { ArrowRight, ChevronRight, RotateCcw } from 'lucide-react';

const STAGES = [
  { id: 'Not Contacted', label: '1. Not Contacted', color: '#94a3b8' },
  { id: 'Outreach Sent', label: '2. Outreach Sent', color: '#38bdf8' },
  { id: 'In Discussion', label: '3. In Discussion', color: '#fbbf24' },
  { id: 'Terms Received', label: '4. Terms & Routing', color: '#c084fc' },
  { id: 'Confirmed', label: '5. Host Confirmed', color: '#34d399' }
];

export default function KanbanView({ ips, onOpenDossier, onAdvanceStatus, onResetFilters }) {
  if (ips.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 700 }}>No entertainment properties found</p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.84rem', marginTop: '0.4rem', maxWidth: 460 }}>
          No properties matched your current search and filters. Try adjusting your query or resetting all filters.
        </p>
        {onResetFilters && (
          <button 
            className="apple-btn apple-btn-primary" 
            style={{ marginTop: '1.25rem', padding: '0.55rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            onClick={onResetFilters}
            type="button"
          >
            <RotateCcw size={13} />
            <span>Reset All Filters & Search</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="kanban-grid">
      {STAGES.map((stage) => {
        const stageIPs = ips.filter((ip) => (ip.status || 'Not Contacted') === stage.id);

        return (
          <div key={stage.id} className="kanban-col">
            
            {/* Header */}
            <div className="kanban-col-head">
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: stage.color, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, display: 'inline-block' }}></span>
                {stage.label}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)'
              }}>
                {stageIPs.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="kanban-col-cards">
              {stageIPs.map((ip) => (
                <div 
                  key={ip.id} 
                  className="kanban-item-card"
                  onClick={() => onOpenDossier(ip)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="ip-id-chip" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>{ip.id}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-gold)' }}>{ip.licensor}</span>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, marginBottom: '0.35rem' }}>
                    {ip.title}
                  </div>

                  <div style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', marginBottom: '0.65rem' }}>
                    {ip.venue_fit}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--glass-border-subtle)',
                    paddingTop: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <button 
                      className="apple-btn apple-btn-glass"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdvanceStatus(ip);
                      }}
                      title="Advance to next deal stage"
                    >
                      <span>Advance</span>
                      <ChevronRight size={12} />
                    </button>

                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      {(ip.producer || 'Direct Licensor').split('/')[0]}
                    </span>
                  </div>

                </div>
              ))}

              {stageIPs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                  No leads in this stage
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
