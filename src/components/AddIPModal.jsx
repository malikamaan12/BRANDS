import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function AddIPModal({ isOpen, onClose, onAddIP }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    licensor: '',
    producer: '',
    person: '',
    email: '',
    website: '',
    venue_fit: '',
    past_shows: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.licensor || !formData.venue_fit) {
      alert('Please fill in required fields (Title, Category, Licensor, and Venue Fit).');
      return;
    }

    const email_template = `Subject: Host Partnership Inquiry: Bringing ${formData.title} to Doha, Qatar\n\nDear ${formData.producer || formData.licensor} Touring Team,\n\nI am writing to inquire regarding hosting and co-producing ${formData.title} in Doha, Qatar. Our event production organization in Doha delivers turnkey family entertainment and theatrical seasons, working with venues including ${formData.venue_fit}. We provide full technical staging, marketing, venue liaison, and promoter coordination. Could we schedule a preliminary call to discuss touring availability, Middle East routing windows, and licensing terms?\n\nBest regards,`;

    const newIP = {
      ...formData,
      status: 'Not Contacted',
      social: '',
      email_template
    };

    onAddIP(newIP);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-elevated modal-window"
        style={{ maxWidth: 740 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addIPModalTitle"
      >
        <div className="modal-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="traffic-lights">
              <div className="traffic-light traffic-close" onClick={onClose} style={{ cursor: 'pointer' }}></div>
              <div className="traffic-light traffic-min"></div>
              <div className="traffic-light traffic-max"></div>
            </div>
            <h2 id="addIPModalTitle" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginLeft: '0.5rem' }}>
              Register New Entertainment IP
            </h2>
          </div>
          <button className="apple-btn apple-btn-glass" style={{ padding: '0.35rem 0.55rem' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-scroll" style={{ maxHeight: '72vh' }}>
            <div className="specs-grid">
              
              <div className="spec-cell">
                <label className="spec-cell-label">IP Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  placeholder="e.g. Blue Man Group Live" 
                  value={formData.title}
                  onChange={handleChange}
                  className="apple-search-input"
                  style={{ marginTop: 4, padding: '0.45rem 0.75rem' }}
                />
              </div>

              <div className="spec-cell">
                <label className="spec-cell-label">Category / Format *</label>
                <input 
                  type="text" 
                  name="category" 
                  required
                  placeholder="e.g. Arena Theatrical Spectacle" 
                  value={formData.category}
                  onChange={handleChange}
                  className="apple-search-input"
                  style={{ marginTop: 4, padding: '0.45rem 0.75rem' }}
                />
              </div>

              <div className="spec-cell">
                <label className="spec-cell-label">Licensor / IP Owner *</label>
                <input 
                  type="text" 
                  name="licensor" 
                  required
                  placeholder="e.g. Cirque du Soleil Entertainment" 
                  value={formData.licensor}
                  onChange={handleChange}
                  className="apple-search-input"
                  style={{ marginTop: 4, padding: '0.45rem 0.75rem' }}
                />
              </div>

              <div className="spec-cell">
                <label className="spec-cell-label">Tour Producer / Agency</label>
                <input 
                  type="text" 
                  name="producer" 
                  placeholder="e.g. Live Nation Touring" 
                  value={formData.producer}
                  onChange={handleChange}
                  className="apple-search-input"
                  style={{ marginTop: 4, padding: '0.45rem 0.75rem' }}
                />
              </div>

              <div className="spec-cell">
                <label className="spec-cell-label">Contact Person</label>
                <input 
                  type="text" 
                  name="person" 
                  placeholder="e.g. Jane Doe (VP Touring)" 
                  value={formData.person}
                  onChange={handleChange}
                  className="apple-search-input"
                  style={{ marginTop: 4, padding: '0.45rem 0.75rem' }}
                />
              </div>

              <div className="spec-cell">
                <label className="spec-cell-label">Contact Email</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="booking@agency.com" 
                  value={formData.email}
                  onChange={handleChange}
                  className="apple-search-input"
                  style={{ marginTop: 4, padding: '0.45rem 0.75rem' }}
                />
              </div>

              <div className="spec-cell" style={{ gridColumn: '1 / -1' }}>
                <label className="spec-cell-label">Target Doha Venue Fit *</label>
                <input 
                  type="text" 
                  name="venue_fit" 
                  required
                  placeholder="e.g. QNCC Theater (2,300 seats) or Lusail Arena" 
                  value={formData.venue_fit}
                  onChange={handleChange}
                  className="apple-search-input"
                  style={{ marginTop: 4, padding: '0.45rem 0.75rem' }}
                />
              </div>

              <div className="spec-cell" style={{ gridColumn: '1 / -1' }}>
                <label className="spec-cell-label">Past Tour Benchmarks</label>
                <input 
                  type="text" 
                  name="past_shows" 
                  placeholder="e.g. 50-city international arena tour, 1.2M attendees" 
                  value={formData.past_shows}
                  onChange={handleChange}
                  className="apple-search-input"
                  style={{ marginTop: 4, padding: '0.45rem 0.75rem' }}
                />
              </div>

              <div className="spec-cell" style={{ gridColumn: '1 / -1' }}>
                <label className="spec-cell-label">Strategy / Season Notes</label>
                <textarea 
                  name="notes" 
                  placeholder="Seasonal timing notes, Eid festival fit, school holidays..." 
                  value={formData.notes}
                  onChange={handleChange}
                  className="apple-textarea"
                  style={{ marginTop: 4, minHeight: 65 }}
                />
              </div>

            </div>
          </div>

          <div style={{
            padding: '1rem 1.75rem',
            background: 'rgba(14, 20, 34, 0.95)',
            borderTop: '1px solid var(--glass-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button type="button" className="apple-btn apple-btn-glass" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="apple-btn apple-btn-primary">
              <Plus size={15} />
              <span>Save IP Lead</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
