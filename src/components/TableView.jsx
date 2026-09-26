import React from 'react';
import { ExternalLink, Mail, Trash2, Lock, RotateCcw } from 'lucide-react';

export default function TableView({ ips, onOpenDossier, onOpenPitch, currentUser, onDeleteIP, onShowToast, onResetFilters }) {
  const isAdmin = currentUser?.role === 'admin';

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
    <div className="glass-panel table-container">
      <table className="apple-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title & Category</th>
            <th>Licensor</th>
            <th>Producer</th>
            <th>Target Doha Venue</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ips.map((ip) => {
            const statusClass = getStatusClass(ip.status);

            return (
              <tr key={ip.id}>
                <td>
                  <span className="ip-id-chip">{ip.id}</span>
                </td>

                <td>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                    {ip.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>
                    {ip.category}
                  </div>
                </td>

                <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {ip.licensor}
                </td>

                <td style={{ color: 'var(--text-secondary)' }}>
                  {ip.producer}
                </td>

                <td>
                  <span className="venue-tag-pill">
                    {typeof ip.venue_fit === 'string' ? ip.venue_fit : (Array.isArray(ip.venue_fit) ? ip.venue_fit.join(', ') : '')}
                  </span>
                </td>

                <td>
                  <span className={`status-pill ${getStatusClass(ip.status || 'Not Contacted')}`}>
                    {ip.status || 'Not Contacted'}
                  </span>
                </td>

                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    <button 
                      className="apple-btn apple-btn-glass"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
                      onClick={() => onOpenDossier(ip)}
                      title="View dossier"
                    >
                      <ExternalLink size={12} />
                      <span>Dossier</span>
                    </button>

                    <button 
                      className="apple-btn apple-btn-outline-gold"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                      onClick={() => onOpenPitch(ip)}
                      title="Pitch email"
                    >
                      <Mail size={12} />
                      <span>Pitch</span>
                    </button>

                    {/* RBAC Delete Property Button */}
                    <button 
                      className="apple-btn"
                      style={{ 
                        padding: '0.35rem 0.55rem', 
                        fontSize: '0.76rem',
                        background: isAdmin ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                        border: isAdmin ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isAdmin ? '#f87171' : 'var(--text-tertiary)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (isAdmin) {
                          if (confirm(`Permanently delete "${ip.title}" (${ip.id}) from the IP HUB portfolio?`)) {
                            onDeleteIP(ip.id);
                          }
                        } else {
                          onShowToast && onShowToast('🔒 Action Restricted: Normal users cannot delete cards. Administrator access required.');
                        }
                      }}
                      title={isAdmin ? `Delete "${ip.title}" (Admin Only)` : `Deletion restricted: Normal users cannot delete cards`}
                    >
                      {isAdmin ? <Trash2 size={12} /> : <Lock size={11} />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getStatusClass(status) {
  switch (status) {
    case 'Not Contacted': return 'status-not-contacted';
    case 'Outreach Sent': return 'status-outreach-sent';
    case 'In Discussion': return 'status-in-discussion';
    case 'Terms Received': return 'status-terms-received';
    case 'Confirmed': return 'status-confirmed';
    default: return 'status-not-contacted';
  }
}
