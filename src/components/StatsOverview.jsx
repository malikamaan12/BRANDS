import React from 'react';
import { Layers, Theater, Compass, Trophy, Sparkles, Music, Send } from 'lucide-react';

export default function StatsOverview({
  ips = [],
  filterCategory = 'all',
  setFilterCategory,
  filterStatus = 'all',
  setFilterStatus,
  filterLeadType = 'all',
  setFilterLeadType,
  categoryCounts = {},
  statusCounts = {}
}) {
  const total = ips.length;

  const handleTotalClick = () => {
    if (setFilterCategory) setFilterCategory('all');
    if (setFilterStatus) setFilterStatus('all');
    if (setFilterLeadType) setFilterLeadType('all');
  };

  const handleCategoryClick = (catId) => {
    if (!setFilterCategory) return;
    if (filterCategory === catId) {
      setFilterCategory('all');
    } else {
      setFilterCategory(catId);
      if (filterCategory === 'today' && setFilterLeadType) {
        setFilterLeadType('all');
      }
    }
  };

  const handleStatusClick = () => {
    if (!setFilterStatus) return;
    setFilterStatus((prev) => (prev === 'active' ? 'all' : 'active'));
  };

  const isTotalActive = filterCategory === 'all' && filterStatus === 'all' && filterLeadType === 'all';

  return (
    <section className="stats-container" aria-label="Portfolio Key Metrics">
      <div className="stats-glass-strip">
        
        {/* 1. Total Portfolio */}
        <div 
          className={`stat-item interactive ${isTotalActive ? 'active' : ''}`}
          onClick={handleTotalClick}
          role="button"
          tabIndex={0}
          title="Click to view all portfolio properties"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTotalClick(); }}
        >
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-gold)' }}>
            <Layers size={18} />
          </div>
          <div>
            <div className="stat-item-num">{total}</div>
            <div className="stat-item-label">Total Portfolio</div>
          </div>
        </div>

        {/* 2. Stage Theatricals */}
        <div 
          className={`stat-item interactive ${filterCategory === 'theatrical' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('theatrical')}
          role="button"
          tabIndex={0}
          title="Click to filter by Stage & Theatrical Musicals"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCategoryClick('theatrical'); }}
        >
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-cyan)' }}>
            <Theater size={18} />
          </div>
          <div>
            <div className="stat-item-num">{categoryCounts?.theatrical ?? 0}</div>
            <div className="stat-item-label">Stage Theatricals</div>
          </div>
        </div>

        {/* 3. Exhibitions */}
        <div 
          className={`stat-item interactive ${filterCategory === 'exhibition' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('exhibition')}
          role="button"
          tabIndex={0}
          title="Click to filter by Exhibitions & Immersive Experiences"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCategoryClick('exhibition'); }}
        >
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-purple)' }}>
            <Compass size={18} />
          </div>
          <div>
            <div className="stat-item-num">{categoryCounts?.exhibition ?? 0}</div>
            <div className="stat-item-label">Exhibitions</div>
          </div>
        </div>

        {/* 4. Arena & Stunts */}
        <div 
          className={`stat-item interactive ${filterCategory === 'arena' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('arena')}
          role="button"
          tabIndex={0}
          title="Click to filter by Arena & Stunt Spectacles"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCategoryClick('arena'); }}
        >
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-rose)' }}>
            <Trophy size={18} />
          </div>
          <div>
            <div className="stat-item-num">{categoryCounts?.arena ?? 0}</div>
            <div className="stat-item-label">Arena & Stunts</div>
          </div>
        </div>

        {/* 5. Family Play & FEC */}
        <div 
          className={`stat-item interactive ${filterCategory === 'fec' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('fec')}
          role="button"
          tabIndex={0}
          title="Click to filter by Family Entertainment Centers & Active Play"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCategoryClick('fec'); }}
        >
          <div className="stat-item-icon-box" style={{ color: '#f59e0b' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div className="stat-item-num">{categoryCounts?.fec ?? 0}</div>
            <div className="stat-item-label">Family FEC & Play</div>
          </div>
        </div>

        {/* 6. Live Symphony */}
        <div 
          className={`stat-item interactive ${filterCategory === 'concert' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('concert')}
          role="button"
          tabIndex={0}
          title="Click to filter by Live Symphony & Film Orchestras"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCategoryClick('concert'); }}
        >
          <div className="stat-item-icon-box" style={{ color: '#38bdf8' }}>
            <Music size={18} />
          </div>
          <div>
            <div className="stat-item-num">{categoryCounts?.concert ?? 0}</div>
            <div className="stat-item-label">Live Symphony</div>
          </div>
        </div>

        {/* 7. Active Pipeline */}
        <div 
          className={`stat-item interactive ${filterStatus === 'active' ? 'active' : ''}`}
          onClick={handleStatusClick}
          role="button"
          tabIndex={0}
          title="Click to filter by active deals in pipeline"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStatusClick(); }}
        >
          <div className="stat-item-icon-box" style={{ color: 'var(--accent-emerald)' }}>
            <Send size={18} />
          </div>
          <div>
            <div className="stat-item-num">{statusCounts?.active ?? 0}</div>
            <div className="stat-item-label">Active Outreach</div>
          </div>
        </div>

      </div>
    </section>
  );
}
