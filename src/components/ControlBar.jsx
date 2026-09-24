import { Search, LayoutGrid, Layers, Table, MapPin, X, Filter } from 'lucide-react';

const CATEGORY_CHIPS = [
  { id: 'all', label: 'All Formats', count: 44, icon: '✨' },
  { id: 'theatrical', label: 'Stage & Musicals', count: 14, icon: '🎭' },
  { id: 'exhibition', label: 'Walk-Through Exhibitions', count: 11, icon: '🏛️' },
  { id: 'arena', label: 'Arena & Stunts', count: 5, icon: '🏎️' },
  { id: 'fec', label: 'Interactive Play & FEC', count: 10, icon: '🎪' },
  { id: 'concert', label: 'Live Symphony', count: 2, icon: '🎻' }
];

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
  filteredCount,
  totalCount
}) {
  return (
    <section className="controls-wrapper" aria-label="Controls and filters">
      <div className="glass-panel control-bar">
        
        {/* Top Control Row: Search & Segmented Switcher */}
        <div className="control-top-row">
          
          {/* Apple-Style Search Input */}
          <div className="apple-search-box">
            <Search className="apple-search-icon" size={18} />
            <input 
              type="text" 
              className="apple-search-input"
              placeholder="Search 44 properties by title, licensor, producer, character, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 4
                }}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Apple Segmented Control View Switcher */}
          <div className="segmented-control" role="tablist">
            <button 
              className={`segment-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards grid view"
              role="tab"
              aria-selected={viewMode === 'cards'}
            >
              <LayoutGrid size={15} />
              <span>Cards</span>
            </button>

            <button 
              className={`segment-btn ${viewMode === 'deck3d' ? 'active' : ''}`}
              onClick={() => setViewMode('deck3d')}
              title="3D Spatial Deck Showcase"
              role="tab"
              aria-selected={viewMode === 'deck3d'}
            >
              <Layers size={15} />
              <span>3D Deck</span>
            </button>
            
            <button 
              className={`segment-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Dense table view"
              role="tab"
              aria-selected={viewMode === 'table'}
            >
              <Table size={15} />
              <span>Table</span>
            </button>

            <button 
              className={`segment-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Deal pipeline kanban board"
              role="tab"
              aria-selected={viewMode === 'kanban'}
            >
              <span style={{ display: 'inline-flex', gap: 2 }}>
                <span style={{ width: 3, height: 12, background: 'currentColor', borderRadius: 1 }}></span>
                <span style={{ width: 3, height: 8, background: 'currentColor', borderRadius: 1 }}></span>
                <span style={{ width: 3, height: 14, background: 'currentColor', borderRadius: 1 }}></span>
              </span>
              <span>Kanban</span>
            </button>

            <button 
              className={`segment-btn ${viewMode === 'venues' ? 'active' : ''}`}
              onClick={() => setViewMode('venues')}
              title="Doha venues matrix"
              role="tab"
              aria-selected={viewMode === 'venues'}
            >
              <MapPin size={15} />
              <span>Venues</span>
            </button>
          </div>

        </div>

        {/* Quick Filter Pill Chips Carousel */}
        <div className="category-chips-carousel" role="toolbar" aria-label="Category quick filters">
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = filterCategory === chip.id;
            return (
              <button
                key={chip.id}
                className={`chip-pill ${isActive ? 'active' : ''}`}
                onClick={() => setFilterCategory(chip.id)}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
                <span className="chip-count">{chip.count}</span>
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Row: Target Doha Venue & Deal Stage */}
        <div className="control-filter-row">
          
          <select 
            className="apple-select" 
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

          <select 
            className="apple-select" 
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

          {(searchQuery || filterCategory !== 'all' || filterVenue !== 'all' || filterStatus !== 'all') && (
            <button 
              className="apple-btn apple-btn-glass"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setFilterVenue('all');
                setFilterStatus('all');
              }}
            >
              Reset All
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {filteredCount} of {totalCount} properties
          </span>

        </div>

      </div>
    </section>
  );
}
