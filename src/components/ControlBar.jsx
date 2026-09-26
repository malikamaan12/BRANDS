import React from 'react';
import { Search, LayoutGrid, Layers, Table, MapPin, X, RotateCcw, Sparkles } from 'lucide-react';

export default function ControlBar({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterVenue,
  setFilterVenue,
  filterStatus,
  setFilterStatus,
  filterLeadType = 'all',
  setFilterLeadType,
  todayLeadsCount = 0,
  coreLeadsCount = 0,
  categoryCounts = {},
  statusCounts = {},
  venueCounts = {},
  onExtractDailyIPs,
  filteredCount,
  totalCount,
  isGlobalSearchFallback = false,
  onResetFilters
}) {
  const isAnyFilterActive = Boolean(
    searchQuery.trim() ||
    filterCategory !== 'all' ||
    filterVenue !== 'all' ||
    filterStatus !== 'all' ||
    filterLeadType !== 'all'
  );

  const isTodayActive = filterLeadType === 'today' || filterCategory === 'today';

  const handleChipClick = (chipId) => {
    if (chipId === 'today') {
      if (isTodayActive) {
        setFilterLeadType('all');
        if (filterCategory === 'today') setFilterCategory('all');
      } else {
        if (todayLeadsCount === 0 && onExtractDailyIPs) {
          onExtractDailyIPs();
        }
        setFilterLeadType('today');
        setFilterCategory('today');
      }
    } else {
      if (filterCategory === chipId && filterLeadType !== 'today') {
        setFilterCategory('all');
      } else {
        setFilterCategory(chipId);
        if (filterCategory === 'today') {
          setFilterLeadType('all');
        }
      }
    }
  };

  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      setSearchQuery('');
      setFilterCategory('all');
      setFilterVenue('all');
      setFilterStatus('all');
      setFilterLeadType('all');
    }
  };

  const CATEGORY_CHIPS = [
    { id: 'all', label: 'All Formats', icon: '✨', count: totalCount },
    { 
      id: 'today', 
      label: "Today's Leads", 
      icon: '🔥', 
      count: todayLeadsCount, 
      isFlame: true,
      tooltip: "Show newly extracted daily properties (Zero duplicates)"
    },
    { id: 'theatrical', label: 'Stage & Musicals', icon: '🎭', count: categoryCounts?.theatrical ?? 0 },
    { id: 'exhibition', label: 'Exhibitions & Immersive', icon: '🏛️', count: categoryCounts?.exhibition ?? 0 },
    { id: 'arena', label: 'Arena & Stunts', icon: '🏎️', count: categoryCounts?.arena ?? 0 },
    { id: 'fec', label: 'Family Play & FEC', icon: '🎪', count: categoryCounts?.fec ?? 0 },
    { id: 'concert', label: 'Live Symphony', icon: '🎻', count: categoryCounts?.concert ?? 0 }
  ];

  return (
    <section className="controls-wrapper" aria-label="Controls and filters">
      <div className="glass-panel control-bar minimal-control-bar">
        
        {/* Row 1: Search Box & Segmented View Switcher & Counter */}
        <div className="control-bar-minimal-top">
          
          {/* Minimal Glass Search Input */}
          <div className="apple-search-box-minimal">
            <Search className="apple-search-icon-minimal" size={15} />
            <input 
              type="text" 
              className="apple-search-input-minimal"
              placeholder="Search properties, licensors, producers, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search entertainment IPs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="apple-search-clear-minimal"
                title="Clear search"
                aria-label="Clear search"
                type="button"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Segmented Control View Switcher */}
          <div className="segmented-control-minimal" role="tablist" aria-label="View modes">
            <button 
              className={`segment-btn-minimal ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards Grid"
              role="tab"
              aria-selected={viewMode === 'cards'}
              type="button"
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>

            <button 
              className={`segment-btn-minimal ${viewMode === 'deck3d' ? 'active' : ''}`}
              onClick={() => setViewMode('deck3d')}
              title="3D Spatial Deck Showcase"
              role="tab"
              aria-selected={viewMode === 'deck3d'}
              type="button"
            >
              <Layers size={14} />
              <span>3D Deck</span>
            </button>
            
            <button 
              className={`segment-btn-minimal ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Dense Table"
              role="tab"
              aria-selected={viewMode === 'table'}
              type="button"
            >
              <Table size={14} />
              <span>Table</span>
            </button>

            <button 
              className={`segment-btn-minimal ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Deal Pipeline Kanban"
              role="tab"
              aria-selected={viewMode === 'kanban'}
              type="button"
            >
              <span style={{ display: 'inline-flex', gap: 2 }}>
                <span style={{ width: 2, height: 10, background: 'currentColor', borderRadius: 1 }}></span>
                <span style={{ width: 2, height: 6, background: 'currentColor', borderRadius: 1 }}></span>
                <span style={{ width: 2, height: 11, background: 'currentColor', borderRadius: 1 }}></span>
              </span>
              <span>Kanban</span>
            </button>

            <button 
              className={`segment-btn-minimal ${viewMode === 'venues' ? 'active' : ''}`}
              onClick={() => setViewMode('venues')}
              title="Venues Matrix"
              role="tab"
              aria-selected={viewMode === 'venues'}
              type="button"
            >
              <MapPin size={14} />
              <span>Venues</span>
            </button>
          </div>

          {/* Filter Status Badge & Reset Action */}
          <div className="minimal-status-cluster">
            <div className="minimal-counter-badge" title={`${filteredCount} of ${totalCount} properties match filters`}>
              <span className="count-num">{filteredCount}</span>
              <span className="count-divider">/</span>
              <span className="count-total">{totalCount}</span>
            </div>

            {isAnyFilterActive && (
              <button 
                className="minimal-reset-btn"
                onClick={handleResetFilters}
                title="Reset all search queries and filters"
                type="button"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>
        
        {/* Global Search Intelligent Fallback Notice */}
        {isGlobalSearchFallback && (
          <div 
            className="global-search-fallback-banner" 
            style={{
              margin: '0.45rem 0.25rem 0.65rem',
              padding: '0.45rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.14) 0%, rgba(56, 189, 248, 0.12) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: '#fef3c7',
              animation: 'fadeIn 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
              <span>
                Showing <strong>{filteredCount}</strong> results across the entire portfolio for "<strong>{searchQuery}</strong>" (none matched your active category/venue filter).
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="apple-btn apple-btn-outline-gold"
              style={{
                padding: '0.22rem 0.55rem',
                fontSize: '0.72rem',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              type="button"
              title="Clear category and venue filters to explore full search results"
            >
              <RotateCcw size={11} />
              <span>Clear Filter Restrictions</span>
            </button>
          </div>
        )}

        {/* Row 2: Category Chips & Compact Inline Dropdowns */}
        <div className="control-bar-minimal-bottom">
          
          {/* Quick Filter Pill Chips Carousel */}
          <div className="minimal-chips-carousel" role="toolbar" aria-label="Category quick filters">
            {CATEGORY_CHIPS.map((chip) => {
              const isSelected = chip.id === 'today'
                ? isTodayActive
                : (filterCategory === chip.id && !isTodayActive);

              return (
                <button
                  key={chip.id}
                  className={`chip-pill-minimal ${chip.isFlame ? 'chip-flame' : ''} ${isSelected ? 'active' : ''}`}
                  onClick={() => handleChipClick(chip.id)}
                  title={chip.tooltip || `Filter by ${chip.label}`}
                  type="button"
                >
                  <span className="chip-icon">{chip.icon}</span>
                  <span className="chip-text">{chip.label}</span>
                  {chip.count !== undefined && (
                    <span className={`chip-count ${chip.isFlame ? 'chip-flame-count' : ''}`}>
                      {chip.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Inline Compact Select Dropdowns */}
          <div className="minimal-selects-cluster">
            
            {/* Target Venue */}
            <div className="minimal-select-wrap">
              <select 
                className={`apple-select-minimal ${filterVenue !== 'all' ? 'active' : ''}`}
                value={filterVenue} 
                onChange={(e) => setFilterVenue(e.target.value)}
                aria-label="Filter by venue"
              >
                <option value="all">📍 All Venues ({totalCount})</option>
                <option value="qncc">QNCC Theater ({venueCounts?.qncc ?? 0})</option>
                <option value="decc">DECC Exhibition ({venueCounts?.decc ?? 0})</option>
                <option value="lusail">Lusail Arena ({venueCounts?.lusail ?? 0})</option>
                <option value="katara">Katara Village ({venueCounts?.katara ?? 0})</option>
                <option value="malls">Luxury Malls ({venueCounts?.malls ?? 0})</option>
                <option value="aspire">Aspire Zone ({venueCounts?.aspire ?? 0})</option>
              </select>
            </div>

            {/* Deal Negotiation Stage */}
            <div className="minimal-select-wrap">
              <select 
                className={`apple-select-minimal ${filterStatus !== 'all' ? 'active' : ''}`}
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by deal status"
              >
                <option value="all">📊 All Stages ({totalCount})</option>
                <option value="active">⚡ Active Pipeline ({statusCounts?.active ?? 0})</option>
                <option value="Not Contacted">1. Not Contacted ({statusCounts?.notContacted ?? 0})</option>
                <option value="Outreach Sent">2. Outreach Sent ({statusCounts?.outreachSent ?? 0})</option>
                <option value="In Discussion">3. In Discussion ({statusCounts?.inDiscussion ?? 0})</option>
                <option value="Terms Received">4. Terms Received ({statusCounts?.termsReceived ?? 0})</option>
                <option value="Confirmed">5. Confirmed ({statusCounts?.confirmed ?? 0})</option>
              </select>
            </div>

            {/* Ingestion / Date Origin */}
            <div className="minimal-select-wrap">
              <select 
                className={`apple-select-minimal ${filterLeadType !== 'all' ? 'active' : ''}`}
                value={filterLeadType} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterLeadType(val);
                  if (val === 'today') {
                    setFilterCategory('today');
                  } else if (filterCategory === 'today') {
                    setFilterCategory('all');
                  }
                }}
                aria-label="Filter by lead date"
              >
                <option value="all">📅 All Dates ({totalCount})</option>
                <option value="today">🔥 Today's Leads ({todayLeadsCount})</option>
                <option value="core">💎 Core Portfolio ({coreLeadsCount})</option>
              </select>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
