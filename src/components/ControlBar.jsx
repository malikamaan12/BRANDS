import React from 'react';
import { Search, LayoutGrid, Layers, Table, MapPin, X, Flame, Sparkles, Filter, RotateCcw, Zap } from 'lucide-react';

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
    { id: 'all', label: 'All Formats', icon: '✨', isSpecial: false },
    { 
      id: 'today', 
      label: "Today's Leads", 
      icon: '🔥', 
      count: todayLeadsCount, 
      isFlame: true,
      tooltip: "Show newly extracted daily properties (Zero duplicates)"
    },
    { id: 'theatrical', label: 'Stage & Musicals', icon: '🎭', isSpecial: false },
    { id: 'exhibition', label: 'Exhibitions & Immersive', icon: '🏛️', isSpecial: false },
    { id: 'arena', label: 'Arena & Stunts', icon: '🏎️', isSpecial: false },
    { id: 'fec', label: 'Family Play & FEC', icon: '🎪', isSpecial: false },
    { id: 'concert', label: 'Live Symphony', icon: '🎻', isSpecial: false }
  ];

  return (
    <section className="controls-wrapper" aria-label="Controls and filters">
      <div className="glass-panel control-bar enhanced-control-bar">
        
        {/* Top Row: Search Box & Segmented View Switcher */}
        <div className="control-top-row">
          
          {/* Apple-Style Glass Search Input */}
          <div className="apple-search-box">
            <Search className="apple-search-icon" size={17} />
            <input 
              type="text" 
              className="apple-search-input"
              placeholder="Search properties, licensors, producers, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search entertainment IPs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="apple-search-clear-btn"
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick "Today's Leads" Highlight Toggle Pill */}
          <button
            type="button"
            className={`today-lead-quick-toggle ${isTodayActive ? 'active' : ''}`}
            onClick={handleToggleTodayFilter}
            title={todayLeadsCount > 0 ? "Filter to today's freshly ingested leads" : "Extract 10 leads for today"}
          >
            <Flame size={15} className={`flame-icon ${isTodayActive ? 'flame-flicker' : ''}`} />
            <span className="toggle-label">Today's Leads</span>
            <span className="today-lead-pill-count">
              {todayLeadsCount > 0 ? `+${todayLeadsCount}` : 'New'}
            </span>
          </button>

          {/* Segmented Control View Switcher (Desktop & Mobile Adaptive) */}
          <div className="segmented-control" role="tablist" aria-label="View modes">
            <button 
              className={`segment-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards grid view"
              role="tab"
              aria-selected={viewMode === 'cards'}
            >
              <LayoutGrid size={15} />
              <span className="segment-label">Cards</span>
            </button>

            <button 
              className={`segment-btn ${viewMode === 'deck3d' ? 'active' : ''}`}
              onClick={() => setViewMode('deck3d')}
              title="3D Spatial Deck Showcase"
              role="tab"
              aria-selected={viewMode === 'deck3d'}
            >
              <Layers size={15} />
              <span className="segment-label">3D Deck</span>
            </button>
            
            <button 
              className={`segment-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Dense table view"
              role="tab"
              aria-selected={viewMode === 'table'}
            >
              <Table size={15} />
              <span className="segment-label">Table</span>
            </button>

            <button 
              className={`segment-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Deal pipeline kanban board"
              role="tab"
              aria-selected={viewMode === 'kanban'}
            >
              <span style={{ display: 'inline-flex', gap: 2 }}>
                <span style={{ width: 2.5, height: 11, background: 'currentColor', borderRadius: 1 }}></span>
                <span style={{ width: 2.5, height: 7, background: 'currentColor', borderRadius: 1 }}></span>
                <span style={{ width: 2.5, height: 13, background: 'currentColor', borderRadius: 1 }}></span>
              </span>
              <span className="segment-label">Kanban</span>
            </button>

            <button 
              className={`segment-btn ${viewMode === 'venues' ? 'active' : ''}`}
              onClick={() => setViewMode('venues')}
              title="Doha venues matrix"
              role="tab"
              aria-selected={viewMode === 'venues'}
            >
              <MapPin size={15} />
              <span className="segment-label">Venues</span>
            </button>
          </div>

        </div>

        {/* Quick Filter Pill Chips Carousel (Smooth Mobile Swipe with Edge Fade) */}
        <div className="category-chips-wrapper">
          <div className="category-chips-carousel" role="toolbar" aria-label="Category quick filters">
            {CATEGORY_CHIPS.map((chip) => {
              const isSelected = chip.id === 'today' ? isTodayActive : filterCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  className={`chip-pill ${chip.isFlame ? 'chip-flame' : ''} ${isSelected ? 'active' : ''}`}
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
        </div>

        {/* Multi-Dimensional Filter Selects Row (Responsive Grid on Mobile) */}
        <div className="control-filter-row">
          
          {/* Filter 1: Today's Leads / Lead Ingestion Origin */}
          <div className="filter-select-wrapper">
            <select 
              className={`apple-select ${filterLeadType === 'today' ? 'apple-select-active' : ''}`}
              value={filterLeadType} 
              onChange={(e) => {
                const val = e.target.value;
                setFilterLeadType(val);
                if (val === 'today') setFilterCategory('today');
                else if (filterCategory === 'today') setFilterCategory('all');
              }}
              aria-label="Filter by lead date"
            >
              <option value="all">📅 All Dates (Total: {totalCount})</option>
              <option value="today">🔥 Today's Discoveries ({todayLeadsCount})</option>
              <option value="core">💎 Core Portfolio (44 Curated)</option>
            </select>
          </div>

          {/* Filter 2: Target Qatar Venue */}
          <div className="filter-select-wrapper">
            <select 
              className={`apple-select ${filterVenue !== 'all' ? 'apple-select-active' : ''}`}
              value={filterVenue} 
              onChange={(e) => setFilterVenue(e.target.value)}
              aria-label="Filter by Doha venue"
            >
              <option value="all">📍 All Doha Venues</option>
              <option value="qncc">QNCC (Theater & Halls)</option>
              <option value="decc">DECC (Exhibition Halls)</option>
              <option value="lusail">Lusail & ABHA Arena</option>
              <option value="katara">Katara Cultural Village</option>
              <option value="malls">Luxury Malls (Vendôme, MoQ, DFC)</option>
              <option value="aspire">Aspire Zone & Al Maha</option>
            </select>
          </div>

          {/* Filter 3: Deal Negotiation Stage */}
          <div className="filter-select-wrapper">
            <select 
              className={`apple-select ${filterStatus !== 'all' ? 'apple-select-active' : ''}`}
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by deal status"
            >
              <option value="all">📊 All Deal Stages</option>
              <option value="Not Contacted">1. Not Contacted</option>
              <option value="Outreach Sent">2. Outreach Sent</option>
              <option value="In Discussion">3. In Discussion</option>
              <option value="Terms Received">4. Terms Received</option>
              <option value="Confirmed">5. Host Confirmed</option>
            </select>
          </div>

          {/* Reset Filters & Active Counts Bar */}
          <div className="filter-actions-group">
            {isAnyFilterActive && (
              <button 
                className="apple-btn apple-btn-glass reset-filter-btn"
                onClick={handleResetFilters}
                title="Reset all search queries and filters"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            )}

            <div className="filtered-counter-pill" title={`${filteredCount} properties match active filters`}>
              <span className="count-num">{filteredCount}</span>
              <span className="count-divider">/</span>
              <span className="count-total">{totalCount} leads</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
