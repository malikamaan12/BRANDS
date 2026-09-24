import React from 'react';
import { Search, LayoutGrid, Layers, Table, MapPin, X, Flame, RotateCcw } from 'lucide-react';

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
  onExtractDailyIPs,
  filteredCount,
  totalCount
}) {
  const isAnyFilterActive = Boolean(
    searchQuery.trim() ||
    filterCategory !== 'all' ||
    filterVenue !== 'all' ||
    filterStatus !== 'all' ||
    filterLeadType !== 'all'
  );

  const isTodayActive = filterLeadType === 'today' || filterCategory === 'today';

  const handleToggleTodayFilter = () => {
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
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterVenue('all');
    setFilterStatus('all');
    setFilterLeadType('all');
  };

  const CATEGORY_CHIPS = [
    { id: 'all', label: 'All Formats', icon: '✨' },
    { 
      id: 'today', 
      label: "Today's Leads", 
      icon: '🔥', 
      count: todayLeadsCount, 
      isFlame: true,
      tooltip: "Show newly extracted daily properties (Zero duplicates)"
    },
    { id: 'theatrical', label: 'Stage & Musicals', icon: '🎭' },
    { id: 'exhibition', label: 'Exhibitions & Immersive', icon: '🏛️' },
    { id: 'arena', label: 'Arena & Stunts', icon: '🏎️' },
    { id: 'fec', label: 'Family Play & FEC', icon: '🎪' },
    { id: 'concert', label: 'Live Symphony', icon: '🎻' }
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
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

        {/* Row 2: Category Chips & Compact Inline Dropdowns */}
        <div className="control-bar-minimal-bottom">
          
          {/* Quick Filter Pill Chips Carousel */}
          <div className="minimal-chips-carousel" role="toolbar" aria-label="Category quick filters">
            {CATEGORY_CHIPS.map((chip) => {
              const isSelected = chip.id === 'today' ? isTodayActive : filterCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  className={`chip-pill-minimal ${chip.isFlame ? 'chip-flame' : ''} ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    if (chip.id === 'today') {
                      handleToggleTodayFilter();
                    } else {
                      if (filterLeadType === 'today') setFilterLeadType('all');
                      setFilterCategory(chip.id);
                    }
                  }}
                  title={chip.tooltip || `Filter by ${chip.label}`}
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
                <option value="all">📍 All Venues</option>
                <option value="qncc">QNCC Theater</option>
                <option value="decc">DECC Exhibition</option>
                <option value="lusail">Lusail Arena</option>
                <option value="katara">Katara Village</option>
                <option value="malls">Luxury Malls</option>
                <option value="aspire">Aspire Zone</option>
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
                <option value="all">📊 All Stages</option>
                <option value="Not Contacted">1. Not Contacted</option>
                <option value="Outreach Sent">2. Outreach Sent</option>
                <option value="In Discussion">3. In Discussion</option>
                <option value="Terms Received">4. Terms Received</option>
                <option value="Confirmed">5. Confirmed</option>
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
                  if (val === 'today') setFilterCategory('today');
                  else if (filterCategory === 'today') setFilterCategory('all');
                }}
                aria-label="Filter by lead date"
              >
                <option value="all">📅 All Dates</option>
                <option value="today">🔥 Today ({todayLeadsCount})</option>
                <option value="core">💎 Core (44)</option>
              </select>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
