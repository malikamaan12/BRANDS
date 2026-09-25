import React from 'react';
import { Layers, Theater, Compass, Trophy, Send } from 'lucide-react';

export default function StatsOverview({ ips }) {
  const total = ips.length;

  const theatrical = ips.filter(ip => {
    const c = (ip.category || '').toLowerCase();
    return (c.includes('stage') || c.includes('theatrical') || c.includes('musical') || c.includes('puppet')) && !c.includes('inflatable') && !c.includes('interactive');
  }).length;

  const exhibitions = ips.filter(ip => {
    const c = (ip.category || '').toLowerCase();
    return (c.includes('exhibition') || c.includes('museum')) && !c.includes('stage');
  }).length;

  const arena = ips.filter(ip => {
    const c = (ip.category || '').toLowerCase();
    return c.includes('arena') || c.includes('stunt') || c.includes('ice') || c.includes('motorsport');
  }).length;

  const inPipeline = ips.filter(ip => ip.status !== 'Not Contacted').length;

  return (
    <section className="stats-container" aria-label="Portfolio Key Metrics">
      <div className="stats-glass-strip">
        
        {/* 1. Total Portfolio */}
        <div className="stat-item">
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-gold)' }}>
            <Layers size={18} />
          </div>
          <div>
            <div className="stat-item-num">{total}</div>
            <div className="stat-item-label">Total Portfolio</div>
          </div>
        </div>

        {/* 2. Theatrical Musicals */}
        <div className="stat-item">
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-cyan)' }}>
            <Theater size={18} />
          </div>
          <div>
            <div className="stat-item-num">{theatrical}</div>
            <div className="stat-item-label">Stage Theatricals</div>
          </div>
        </div>

        {/* 3. Exhibitions */}
        <div className="stat-item">
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-purple)' }}>
            <Compass size={18} />
          </div>
          <div>
            <div className="stat-item-num">{exhibitions}</div>
            <div className="stat-item-label">Exhibitions</div>
          </div>
        </div>

        {/* 4. Arena & Stunts */}
        <div className="stat-item">
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-rose)' }}>
            <Trophy size={18} />
          </div>
          <div>
            <div className="stat-item-num">{arena}</div>
            <div className="stat-item-label">Arena & Stunts</div>
          </div>
        </div>

        {/* 5. Active in Pipeline */}
        <div className="stat-item">
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-emerald)' }}>
            <Send size={18} />
          </div>
          <div>
            <div className="stat-item-num">{inPipeline}</div>
            <div className="stat-item-label">Active Outreach</div>
          </div>
        </div>

      </div>
    </section>
  );
}
