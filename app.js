// Doha Entertainment IP CRM - Application Logic
// Built with Vanilla JS & Modern Web Standards

let currentIPs = [];
let currentFilterCategory = 'all';
let currentFilterVenue = 'all';
let currentFilterStatus = 'all';
let currentSearchQuery = '';
let currentViewMode = 'cards'; // 'cards' | 'table' | 'kanban' | 'venues'
let activeIP = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  currentIPs = getStoredIPs();
  initStats();
  initEventListeners();
  renderCurrentView();
  initModalLightDismiss();
});

// Calculate and render KPI metrics
function initStats() {
  const total = currentIPs.length;
  
  // Categorize
  const theatricalCount = currentIPs.filter(ip => 
    ip.category.toLowerCase().includes('theatrical') || 
    ip.category.toLowerCase().includes('musical') || 
    ip.category.toLowerCase().includes('stage')
  ).length;

  const exhibitionCount = currentIPs.filter(ip => 
    ip.category.toLowerCase().includes('exhibition') || 
    ip.category.toLowerCase().includes('walk-through') ||
    ip.category.toLowerCase().includes('museum')
  ).length;

  const arenaCount = currentIPs.filter(ip => 
    ip.category.toLowerCase().includes('arena') || 
    ip.category.toLowerCase().includes('stunt') || 
    ip.category.toLowerCase().includes('ice')
  ).length;

  const contactedCount = currentIPs.filter(ip => ip.status !== 'Not Contacted').length;

  document.getElementById('statTotalIPs').textContent = total;
  document.getElementById('statTheatrical').textContent = theatricalCount;
  document.getElementById('statExhibitions').textContent = exhibitionCount;
  document.getElementById('statArena').textContent = arenaCount;
  document.getElementById('statContacted').textContent = contactedCount;
}

// Event Listeners for Filters, Search, and Navigation
function initEventListeners() {
  // Search Input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    renderCurrentView();
  });

  // Filter Category
  const filterCat = document.getElementById('filterCategory');
  filterCat.addEventListener('change', (e) => {
    currentFilterCategory = e.target.value;
    renderCurrentView();
  });

  // Filter Venue
  const filterVen = document.getElementById('filterVenue');
  filterVen.addEventListener('change', (e) => {
    currentFilterVenue = e.target.value;
    renderCurrentView();
  });

  // Filter Status
  const filterStat = document.getElementById('filterStatus');
  filterStat.addEventListener('change', (e) => {
    currentFilterStatus = e.target.value;
    renderCurrentView();
  });

  // View Mode Tabs
  const viewBtns = document.querySelectorAll('.view-tab-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentViewMode = btn.dataset.view;
      renderCurrentView();
    });
  });

  // Export Buttons
  document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
  document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
  document.getElementById('btnResetData').addEventListener('click', handleResetData);
  document.getElementById('btnAddNewIP').addEventListener('click', openAddIPModal);

  // New IP Form Submit
  const newIPForm = document.getElementById('newIPForm');
  newIPForm.addEventListener('submit', handleNewIPSubmit);
}

// Filter the dataset based on active controls
function getFilteredIPs() {
  return currentIPs.filter(ip => {
    // Search query match
    if (currentSearchQuery) {
      const matchSearch = 
        ip.title.toLowerCase().includes(currentSearchQuery) ||
        ip.licensor.toLowerCase().includes(currentSearchQuery) ||
        ip.producer.toLowerCase().includes(currentSearchQuery) ||
        ip.category.toLowerCase().includes(currentSearchQuery) ||
        ip.venue_fit.toLowerCase().includes(currentSearchQuery) ||
        ip.id.toLowerCase().includes(currentSearchQuery);
      if (!matchSearch) return false;
    }

    // Category match
    if (currentFilterCategory !== 'all') {
      const cat = ip.category.toLowerCase();
      if (currentFilterCategory === 'theatrical' && !(cat.includes('stage') || cat.includes('theatrical') || cat.includes('musical') || cat.includes('puppet'))) {
        return false;
      }
      if (currentFilterCategory === 'exhibition' && !(cat.includes('exhibition') || cat.includes('walk-through') || cat.includes('experience') || cat.includes('museum'))) {
        return false;
      }
      if (currentFilterCategory === 'arena' && !(cat.includes('arena') || cat.includes('stunt') || cat.includes('ice') || cat.includes('motorsport'))) {
        return false;
      }
      if (currentFilterCategory === 'fec' && !(cat.includes('fec') || cat.includes('play') || cat.includes('inflatable') || cat.includes('pop-up') || cat.includes('sports'))) {
        return false;
      }
      if (currentFilterCategory === 'concert' && !(cat.includes('concert') || cat.includes('symphony') || cat.includes('orchestra'))) {
        return false;
      }
    }

    // Venue match
    if (currentFilterVenue !== 'all') {
      const ven = ip.venue_fit.toLowerCase();
      if (currentFilterVenue === 'qncc' && !ven.includes('qncc')) return false;
      if (currentFilterVenue === 'decc' && !ven.includes('decc')) return false;
      if (currentFilterVenue === 'lusail' && !(ven.includes('lusail') || ven.includes('abha'))) return false;
      if (currentFilterVenue === 'katara' && !ven.includes('katara')) return false;
      if (currentFilterVenue === 'malls' && !(ven.includes('mall') || ven.includes('place vendôme') || ven.includes('vendome') || ven.includes('festival city') || ven.includes('msheireb'))) return false;
      if (currentFilterVenue === 'aspire' && !(ven.includes('aspire') || ven.includes('al maha') || ven.includes('outdoor'))) return false;
    }

    // Status match
    if (currentFilterStatus !== 'all') {
      if (ip.status !== currentFilterStatus) return false;
    }

    return true;
  });
}

// Render the active view
function renderCurrentView() {
  const filtered = getFilteredIPs();
  document.getElementById('resultsCount').textContent = `Showing ${filtered.length} of ${currentIPs.length} IPs`;

  const container = document.getElementById('viewsContainer');
  container.innerHTML = '';

  if (currentViewMode === 'cards') {
    renderCardsView(filtered, container);
  } else if (currentViewMode === 'table') {
    renderTableView(filtered, container);
  } else if (currentViewMode === 'kanban') {
    renderKanbanView(filtered, container);
  } else if (currentViewMode === 'venues') {
    renderVenuesView(filtered, container);
  }
}

// 1. CARDS VIEW
function renderCardsView(ips, container) {
  if (ips.length === 0) {
    container.innerHTML = getEmptyStateHTML();
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  ips.forEach(ip => {
    const card = document.createElement('div');
    card.className = 'ip-card';

    const statusClass = getStatusBadgeClass(ip.status);

    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="ip-id-tag">${escapeHtml(ip.id)}</span>
          <span class="status-badge ${statusClass}">${escapeHtml(ip.status)}</span>
        </div>
        <h3 class="card-title">${escapeHtml(ip.title)}</h3>
        <span class="card-category-tag">${escapeHtml(ip.category)}</span>
        
        <div class="card-meta-list">
          <div class="meta-row">
            <strong>Licensor:</strong> <span>${escapeHtml(ip.licensor)}</span>
          </div>
          <div class="meta-row">
            <strong>Producer:</strong> <span>${escapeHtml(ip.producer)}</span>
          </div>
          <div class="meta-row">
            <strong>Venue Fit:</strong>
            <span class="venue-badge-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              ${escapeHtml(ip.venue_fit)}
            </span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button class="btn btn-outline-gold btn-sm" onclick="openDetailsModal('${ip.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          View Dossier
        </button>
        <button class="btn btn-primary btn-sm" onclick="openPitchModal('${ip.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          Pitch Email
        </button>
      </div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// 2. TABLE VIEW
function renderTableView(ips, container) {
  if (ips.length === 0) {
    container.innerHTML = getEmptyStateHTML();
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';

  let html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title & Category</th>
          <th>Licensor</th>
          <th>Producer</th>
          <th>Target Doha Venue</th>
          <th>Status</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  ips.forEach(ip => {
    const statusClass = getStatusBadgeClass(ip.status);
    html += `
      <tr>
        <td><span class="ip-id-tag">${escapeHtml(ip.id)}</span></td>
        <td>
          <div class="table-title">${escapeHtml(ip.title)}</div>
          <div style="font-size:0.75rem; color:var(--accent-cyan);">${escapeHtml(ip.category)}</div>
        </td>
        <td>${escapeHtml(ip.licensor)}</td>
        <td>${escapeHtml(ip.producer)}</td>
        <td>
          <span class="venue-badge-pill">${escapeHtml(ip.venue_fit)}</span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${escapeHtml(ip.status)}</span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="openDetailsModal('${ip.id}')" title="View Lead Details">
            Dossier
          </button>
          <button class="btn btn-primary btn-sm" onclick="openPitchModal('${ip.id}')" title="Pitch Email">
            Email
          </button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  wrapper.innerHTML = html;
  container.appendChild(wrapper);
}

// 3. KANBAN PIPELINE VIEW
function renderKanbanView(ips, container) {
  const stages = [
    { id: 'Not Contacted', label: '1. Not Contacted', color: '#94a3b8' },
    { id: 'Outreach Sent', label: '2. Outreach Sent', color: '#38bdf8' },
    { id: 'In Discussion', label: '3. In Discussion', color: '#fbbf24' },
    { id: 'Terms Received', label: '4. Terms & Routing', color: '#c084fc' },
    { id: 'Confirmed', label: '5. Host Confirmed', color: '#34d399' }
  ];

  const board = document.createElement('div');
  board.className = 'kanban-board';

  stages.forEach(stage => {
    const colIPs = ips.filter(ip => {
      if (stage.id === 'Not Contacted') return ip.status === 'Not Contacted';
      return ip.status === stage.id;
    });

    const col = document.createElement('div');
    col.className = 'kanban-column';

    let cardsHtml = '';
    colIPs.forEach(ip => {
      cardsHtml += `
        <div class="kanban-card" onclick="openDetailsModal('${ip.id}')">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
            <span class="ip-id-tag" style="font-size:0.7rem;">${escapeHtml(ip.id)}</span>
            <span style="font-size:0.75rem; color:var(--text-gold); font-weight:600;">${escapeHtml(ip.licensor)}</span>
          </div>
          <div class="kanban-card-title">${escapeHtml(ip.title)}</div>
          <div style="font-size:0.74rem; color:var(--text-muted); margin-bottom:0.5rem;">${escapeHtml(ip.venue_fit)}</div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.4rem; margin-top:0.4rem;">
            <button class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="event.stopPropagation(); quickAdvanceStatus('${ip.id}')">
              Advance ➔
            </button>
            <span style="font-size:0.7rem; color:var(--text-secondary);">${escapeHtml(ip.producer)}</span>
          </div>
        </div>
      `;
    });

    if (colIPs.length === 0) {
      cardsHtml = `<div style="text-align:center; padding:2rem 1rem; color:var(--text-muted); font-size:0.8rem;">No IPs in this stage</div>`;
    }

    col.innerHTML = `
      <div class="kanban-column-header">
        <span class="kanban-col-title" style="color:${stage.color};">
          ● ${stage.label}
        </span>
        <span class="kanban-count">${colIPs.length}</span>
      </div>
      <div class="kanban-cards-list">
        ${cardsHtml}
      </div>
    `;

    board.appendChild(col);
  });

  container.appendChild(board);
}

// 4. DOHA VENUES MATRIX VIEW
function renderVenuesView(ips, container) {
  const venueClusters = [
    {
      id: 'qncc',
      name: 'Qatar National Convention Centre (QNCC)',
      subtitle: 'Theater (2,300 seats), Auditoriums & Exhibition Halls',
      specs: 'World-class rigging, tiered seating, massive backstage facilities',
      matcher: (ven) => ven.includes('qncc')
    },
    {
      id: 'decc',
      name: 'Doha Exhibition and Convention Centre (DECC)',
      subtitle: 'Modular Pillar-Free Exhibition Halls (2,000–30,000 sqm)',
      specs: 'Requires 2-3 month residencies, 8m+ height clearance, high floor loads',
      matcher: (ven) => ven.includes('decc')
    },
    {
      id: 'lusail',
      name: 'Lusail Multipurpose Arena & ABHA Arena',
      subtitle: 'Indoor Arenas (15,000+ capacity) & Stadium Grounds',
      specs: 'Olympic ice chilling plant, heavy dirt floors & vehicle ventilation',
      matcher: (ven) => ven.includes('lusail') || ven.includes('abha') || ven.includes('stadium')
    },
    {
      id: 'katara',
      name: 'Katara Cultural Village & Katara Opera House',
      subtitle: 'Opera House, Drama Theater & Outdoor Amphitheatre',
      specs: 'Acoustic excellence, cultural tourism prestige, QPO symphonic pairing',
      matcher: (ven) => ven.includes('katara')
    },
    {
      id: 'malls',
      name: 'Premier Luxury Malls & Retail Atriums',
      subtitle: 'Place Vendôme, Mall of Qatar, Doha Festival City, Msheireb',
      specs: 'High dwell-time atriums, luxury shopper demographics, active FECs',
      matcher: (ven) => ven.includes('mall') || ven.includes('vendôme') || ven.includes('vendome') || ven.includes('festival city') || ven.includes('msheireb')
    },
    {
      id: 'aspire',
      name: 'Aspire Zone & Al Maha Island',
      subtitle: 'Sports Precinct, Outdoor Festival Grounds & Winter Wonderland',
      specs: 'Massive outdoor foot-traffic, high-capacity obstacle zones & pop-up parks',
      matcher: (ven) => ven.includes('aspire') || ven.includes('al maha') || ven.includes('outdoor')
    }
  ];

  const grid = document.createElement('div');
  grid.className = 'venues-matrix-grid';

  venueClusters.forEach(cluster => {
    const matchedIPs = ips.filter(ip => cluster.matcher(ip.venue_fit.toLowerCase()));

    const clusterCard = document.createElement('div');
    clusterCard.className = 'venue-cluster-card';

    let ipRowsHtml = '';
    matchedIPs.forEach(ip => {
      ipRowsHtml += `
        <div class="venue-ip-row" onclick="openDetailsModal('${ip.id}')" style="cursor:pointer;">
          <div>
            <div style="font-weight:700; color:#ffffff; font-size:0.88rem;">${escapeHtml(ip.title)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(ip.licensor)} • ${escapeHtml(ip.category)}</div>
          </div>
          <button class="btn btn-outline-gold btn-sm" onclick="event.stopPropagation(); openPitchModal('${ip.id}')">
            Pitch
          </button>
        </div>
      `;
    });

    if (matchedIPs.length === 0) {
      ipRowsHtml = `<div style="color:var(--text-muted); font-size:0.8rem; padding:0.5rem 0;">No matching IPs with current filters</div>`;
    }

    clusterCard.innerHTML = `
      <div class="venue-cluster-header">
        <div class="venue-cluster-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>
        <div>
          <h3 class="venue-cluster-title">${escapeHtml(cluster.name)}</h3>
          <div class="venue-cluster-specs">${escapeHtml(cluster.subtitle)}</div>
          <div style="font-size:0.72rem; color:var(--text-gold); margin-top:0.25rem;">Specs: ${escapeHtml(cluster.specs)}</div>
        </div>
      </div>
      <div class="venue-ip-item-list">
        <div style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.04em;">
          Matched IP Properties (${matchedIPs.length})
        </div>
        ${ipRowsHtml}
      </div>
    `;

    grid.appendChild(clusterCard);
  });

  container.appendChild(grid);
}

// Quick status advancer for Kanban
function quickAdvanceStatus(ipId) {
  const ip = currentIPs.find(item => item.id === ipId);
  if (!ip) return;

  const sequence = ['Not Contacted', 'Outreach Sent', 'In Discussion', 'Terms Received', 'Confirmed'];
  const currentIndex = sequence.indexOf(ip.status);
  if (currentIndex < sequence.length - 1) {
    ip.status = sequence[currentIndex + 1];
    saveStoredIPs(currentIPs);
    initStats();
    renderCurrentView();
    showToast(`Status updated to "${ip.status}" for ${ip.title}`);
  }
}

// Open Detail Dossier Modal
function openDetailsModal(ipId) {
  const ip = currentIPs.find(item => item.id === ipId);
  if (!ip) return;
  activeIP = ip;

  const modal = document.getElementById('detailsModal');
  document.getElementById('modalIPId').textContent = ip.id;
  document.getElementById('modalTitle').textContent = ip.title;
  document.getElementById('modalCategory').textContent = ip.category;

  document.getElementById('modalLicensor').textContent = ip.licensor;
  document.getElementById('modalProducer').textContent = ip.producer;
  document.getElementById('modalPerson').textContent = ip.person;
  
  const webLink = document.getElementById('modalWebsite');
  webLink.href = ip.website;
  webLink.textContent = ip.website;

  document.getElementById('modalEmail').textContent = ip.email;
  document.getElementById('modalSocial').textContent = ip.social;
  document.getElementById('modalPastShows').textContent = ip.past_shows;
  document.getElementById('modalVenueFit').textContent = ip.venue_fit;

  // Status Selector
  const statusSelect = document.getElementById('modalStatusSelect');
  statusSelect.value = ip.status;
  statusSelect.onchange = (e) => {
    ip.status = e.target.value;
    saveStoredIPs(currentIPs);
    initStats();
    renderCurrentView();
    showToast(`Status saved: ${ip.status}`);
  };

  // Notes Textarea
  const notesText = document.getElementById('modalNotesInput');
  notesText.value = ip.notes || '';
  notesText.oninput = (e) => {
    ip.notes = e.target.value;
    saveStoredIPs(currentIPs);
  };

  // Email Template Preview
  document.getElementById('modalEmailTemplate').textContent = ip.email_template;

  modal.showModal();
}

// Open Pitch Email Modal directly
function openPitchModal(ipId) {
  openDetailsModal(ipId);
  const emailSection = document.getElementById('modalEmailSection');
  if (emailSection) {
    emailSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Copy Email Template to Clipboard
function copyEmailTemplate() {
  if (!activeIP) return;
  navigator.clipboard.writeText(activeIP.email_template).then(() => {
    showToast('Pitch email copied to clipboard!');
  }).catch(err => {
    console.error(err);
    showToast('Could not copy text.');
  });
}

// Copy Subject line to Clipboard
function copySubjectLine() {
  if (!activeIP) return;
  const match = activeIP.email_template.match(/Subject:\s*(.*)/i);
  const subject = match ? match[1] : `Host Partnership Inquiry: ${activeIP.title} in Doha`;
  navigator.clipboard.writeText(subject).then(() => {
    showToast('Subject line copied!');
  });
}

// Launch default email client
function launchMailClient() {
  if (!activeIP) return;
  const match = activeIP.email_template.match(/Subject:\s*(.*)\n\n([\s\S]*)/i);
  let subject = `Host Partnership Inquiry: ${activeIP.title} in Doha, Qatar`;
  let body = activeIP.email_template;

  if (match) {
    subject = match[1];
    body = match[2];
  }

  // Extract first valid email
  const emails = activeIP.email.split(/[\/,|]/).map(s => s.trim()).filter(s => s.includes('@'));
  const recipient = emails[0] || '';

  const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}

// Add New IP Modal
function openAddIPModal() {
  const modal = document.getElementById('addIPModal');
  document.getElementById('newIPForm').reset();
  modal.showModal();
}

function handleNewIPSubmit(e) {
  e.preventDefault();
  
  const newId = `IP-${String(currentIPs.length + 1).padStart(3, '0')}`;
  const title = document.getElementById('newTitle').value.trim();
  const category = document.getElementById('newCategory').value.trim();
  const licensor = document.getElementById('newLicensor').value.trim();
  const producer = document.getElementById('newProducer').value.trim();
  const person = document.getElementById('newPerson').value.trim();
  const website = document.getElementById('newWebsite').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const past_shows = document.getElementById('newPastShows').value.trim();
  const venue_fit = document.getElementById('newVenueFit').value.trim();
  const notes = document.getElementById('newNotes').value.trim();

  const email_template = `Subject: Host Partnership Inquiry: Bringing ${title} to Doha, Qatar\n\nDear ${producer} Team,\n\nI am reaching out regarding hosting and co-producing ${title} in Doha, Qatar. Our event production organization in Doha specializes in bringing world-class live family entertainment and experiential IPs to the region. Given ${title}'s popularity, we are exploring hosting options at premier venues such as ${venue_fit}. We provide turnkey local staging, marketing, technical logistics, and venue coordination. Could we schedule a preliminary call to discuss touring availability, Middle East routing, and licensing terms?\n\nBest regards,`;

  const newIP = {
    id: newId,
    title,
    category,
    licensor,
    producer,
    person,
    website,
    email,
    social: '',
    past_shows,
    venue_fit,
    status: 'Not Contacted',
    email_template,
    notes
  };

  currentIPs.unshift(newIP);
  saveStoredIPs(currentIPs);
  initStats();
  renderCurrentView();

  document.getElementById('addIPModal').close();
  showToast(`Successfully added new IP: ${title}`);
}

// Export Data as JSON
function exportJSON() {
  const jsonStr = JSON.stringify(currentIPs, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `doha_entertainment_ips_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported dataset to JSON');
}

// Export Data as CSV
function exportCSV() {
  const headers = ['ID', 'Title', 'Category', 'Licensor', 'Producer', 'Contact Person', 'Email', 'Website', 'Venue Fit', 'Status', 'Notes'];
  const rows = currentIPs.map(ip => [
    `"${ip.id.replace(/"/g, '""')}"`,
    `"${ip.title.replace(/"/g, '""')}"`,
    `"${ip.category.replace(/"/g, '""')}"`,
    `"${ip.licensor.replace(/"/g, '""')}"`,
    `"${ip.producer.replace(/"/g, '""')}"`,
    `"${ip.person.replace(/"/g, '""')}"`,
    `"${ip.email.replace(/"/g, '""')}"`,
    `"${ip.website.replace(/"/g, '""')}"`,
    `"${ip.venue_fit.replace(/"/g, '""')}"`,
    `"${ip.status.replace(/"/g, '""')}"`,
    `"${(ip.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `doha_entertainment_ips_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported dataset to CSV');
}

// Reset data to defaults
function handleResetData() {
  if (confirm('Are you sure you want to reset all data back to the default 44 entertainment IP properties? Any customized notes or statuses will be reset.')) {
    currentIPs = resetStoredIPs();
    initStats();
    renderCurrentView();
    showToast('Data reset to original 44 IPs');
  }
}

// Helper: Status badge class
function getStatusBadgeClass(status) {
  switch (status) {
    case 'Not Contacted': return 'status-not-contacted';
    case 'Outreach Sent': return 'status-outreach-sent';
    case 'In Discussion': return 'status-in-discussion';
    case 'Terms Received': return 'status-terms-received';
    case 'Confirmed': return 'status-confirmed';
    default: return 'status-not-contacted';
  }
}

// Helper: Empty state HTML
function getEmptyStateHTML() {
  return `
    <div style="text-align:center; padding: 4rem 2rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted); margin-bottom:1rem;">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <h3 style="font-family:var(--font-display); font-size:1.2rem; color:#fff; margin-bottom:0.5rem;">No Matching Entertainment IPs</h3>
      <p style="color:var(--text-secondary); font-size:0.85rem; max-width:400px; margin:0 auto 1.5rem auto;">Try adjusting your search query, venue filters, or category tags to find leads.</p>
      <button class="btn btn-secondary btn-sm" onclick="clearFilters()">Clear All Filters</button>
    </div>
  `;
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterCategory').value = 'all';
  document.getElementById('filterVenue').value = 'all';
  document.getElementById('filterStatus').value = 'all';
  currentSearchQuery = '';
  currentFilterCategory = 'all';
  currentFilterVenue = 'all';
  currentFilterStatus = 'all';
  renderCurrentView();
}

// Light-Dismiss fallback for <dialog> as per Modern Web Guidance
function initModalLightDismiss() {
  const dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(dialog => {
    // If browser doesn't natively support closedBy attribute
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          dialog.close();
        }
      });
    }
  });
}

// Toast notification display
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
