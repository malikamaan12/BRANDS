import React from 'react';
import { ExternalLink, Mail, Trash2, Lock } from 'lucide-react';

export default function TableView({ ips, onOpenDossier, onOpenPitch, currentUser, onDeleteIP, onShowToast }) {
  const isAdmin = currentUser?.role === 'admin';

  if (ips.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>No entertainment properties match your filters</p>
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
                  <span className="venue-tag-pill">{ip.venue_fit}</span>
                </td>

                <td>
                  <span className={`status-pill ${statusClass}`}>
                    {ip.status}
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
