import React, { useState, useEffect, useMemo } from 'react';
import { loadIPs, saveIPs, resetIPs } from './data/ips';
import { checkAndTriggerDailyExtraction, extractBatchDailyIPs } from './services/dailyExtractionEngine';
import { NeonDbService } from './services/neonDbService';
import NavigationBar from './components/NavigationBar';
import StatsOverview from './components/StatsOverview';
import ControlBar from './components/ControlBar';
import CardsView from './components/CardsView';
import DeckView3D from './components/DeckView3D';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import VenuesMatrix from './components/VenuesMatrix';
import IPDossierModal from './components/IPDossierModal';
import AddIPModal from './components/AddIPModal';
import LoginModal from './components/LoginModal';
import LoginScreen from './components/LoginScreen';
import AdminPanelModal from './components/AdminPanelModal';
import Toast from './components/Toast';
import { authService, DEFAULT_USERS } from './services/authService';

export default function App() {
  const [ips, setIps] = useState(() => loadIPs());
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('view');
      if (['cards', 'deck3d', 'table', 'kanban', 'venues'].includes(p)) return p;
    }
    return 'cards';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVenue, setFilterVenue] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLeadType, setFilterLeadType] = useState('all'); // 'all' | 'today' | 'core'
  const [selectedIP, setSelectedIP] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Count how many leads were discovered today / daily extracted
  const todayLeadsCount = useMemo(() => {
    return ips.filter((ip) => {
      return (
        ip.isDailyDiscovered === true ||
        Boolean(ip.extracted_at) ||
        Boolean(ip.extracted_date) ||
        parseInt(ip.id.replace('IP-', ''), 10) > 44
      );
    }).length;
  }, [ips]);

  // Persist to localStorage whenever IPs change
  useEffect(() => {
    saveIPs(ips);
  }, [ips]);

  // Support direct linking / preview via URL ?ip=IP-003
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ipParam = params.get('ip');
    if (ipParam && ips.length > 0) {
      const found = ips.find(item => item.id.toLowerCase() === ipParam.toLowerCase());
      if (found) setSelectedIP(found);
    }
  }, [ips]);

  // Toast trigger helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  // Automated 24-hour daily extraction check on mount (ensuring at least 10 daily with zero duplicates)
  useEffect(() => {
    const res = checkAndTriggerDailyExtraction(ips, (newlyExtracted) => {
      setIps((prev) => [...prev, ...newlyExtracted]);
    });
    if (res?.extracted > 0) {
      showToast(`⚡ Automated Daily Extraction: Ingested ${res.extracted} new verified entertainment IPs!`);
    }
  }, []);

  // Filtered IPs calculation
  const filteredIPs = useMemo(() => {
    return ips.filter((ip) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          ip.title.toLowerCase().includes(q) ||
          ip.licensor.toLowerCase().includes(q) ||
          ip.producer.toLowerCase().includes(q) ||
          ip.category.toLowerCase().includes(q) ||
          ip.venue_fit.toLowerCase().includes(q) ||
          ip.id.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Today's Lead / Origin filter
      const isTodayLead =
        ip.isDailyDiscovered === true ||
        Boolean(ip.extracted_at) ||
        Boolean(ip.extracted_date) ||
        parseInt(ip.id.replace('IP-', ''), 10) > 44;

      if (filterLeadType === 'today' || filterCategory === 'today') {
        if (!isTodayLead) return false;
      } else if (filterLeadType === 'core') {
        if (isTodayLead) return false;
      }

      // 3. Category filter (skip if filterCategory is 'today' since handled above)
      if (filterCategory !== 'all' && filterCategory !== 'today') {
        const cat = ip.category.toLowerCase();
        if (filterCategory === 'theatrical' && !(cat.includes('stage') || cat.includes('theatrical') || cat.includes('musical') || cat.includes('puppet'))) {
          return false;
        }
        if (filterCategory === 'exhibition' && !(cat.includes('exhibition') || cat.includes('walk-through') || cat.includes('experience') || cat.includes('museum'))) {
          return false;
        }
        if (filterCategory === 'arena' && !(cat.includes('arena') || cat.includes('stunt') || cat.includes('ice') || cat.includes('motorsport'))) {
          return false;
        }
        if (filterCategory === 'fec' && !(cat.includes('fec') || cat.includes('play') || cat.includes('inflatable') || cat.includes('pop-up') || cat.includes('sports'))) {
          return false;
        }
        if (filterCategory === 'concert' && !(cat.includes('concert') || cat.includes('symphony') || cat.includes('orchestra'))) {
          return false;
        }
      }

      // 4. Venue filter
      if (filterVenue !== 'all') {
        const ven = ip.venue_fit.toLowerCase();
        if (filterVenue === 'qncc' && !ven.includes('qncc')) return false;
        if (filterVenue === 'decc' && !ven.includes('decc')) return false;
        if (filterVenue === 'lusail' && !(ven.includes('lusail') || ven.includes('abha'))) return false;
        if (filterVenue === 'katara' && !ven.includes('katara')) return false;
        if (filterVenue === 'malls' && !(ven.includes('mall') || ven.includes('place vendôme') || ven.includes('vendome') || ven.includes('festival city') || ven.includes('msheireb'))) return false;
        if (filterVenue === 'aspire' && !(ven.includes('aspire') || ven.includes('al maha') || ven.includes('outdoor'))) return false;
      }

      // 5. Status filter
      if (filterStatus !== 'all') {
        if (ip.status !== filterStatus) return false;
      }

      return true;
    });
  }, [ips, searchQuery, filterCategory, filterVenue, filterStatus, filterLeadType]);

  // Update a single IP (e.g. notes, status)
  const handleUpdateIP = (updatedIP) => {
    setIps((prev) => prev.map((item) => (item.id === updatedIP.id ? updatedIP : item)));
    if (selectedIP && selectedIP.id === updatedIP.id) {
      setSelectedIP(updatedIP);
    }
  };

  // Quick advance pipeline stage for Kanban
  const handleAdvanceStatus = (ip) => {
    const sequence = ['Not Contacted', 'Outreach Sent', 'In Discussion', 'Terms Received', 'Confirmed'];
    const currentIndex = sequence.indexOf(ip.status);
    if (currentIndex < sequence.length - 1) {
      const nextStatus = sequence[currentIndex + 1];
      const updated = { ...ip, status: nextStatus };
      handleUpdateIP(updated);
      showToast(`Status updated to "${nextStatus}" for ${ip.title}`);
    }
  };

  // Add new IP
  const handleAddIP = (newIPData) => {
    const nextNum = ips.length + 1;
    const newId = `IP-${String(nextNum).padStart(3, '0')}`;
    const newIP = { id: newId, ...newIPData };

    setIps((prev) => [newIP, ...prev]);
    showToast(`Added new property: ${newIP.title}`);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(ips, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doha_entertainment_ips_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported full portfolio to JSON');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Licensor', 'Producer', 'Contact Person', 'Email', 'Website', 'Venue Fit', 'Status', 'Notes'];
    const rows = ips.map((ip) => [
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

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doha_entertainment_ips_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported full portfolio to CSV');
  };

  // Reset Data to defaults
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all portfolio data back to the original 44 entertainment properties?')) {
      const reset = resetIPs();
      setIps(reset);
      showToast('Reset to original 44 properties');
    }
  };

  // Manual trigger to extract at least 10 brand-new unique entertainment IPs & branded events
  const handleExtractDailyIPs = () => {
    const result = extractBatchDailyIPs(ips, 10);
    if (result.added.length > 0) {
      setIps((prev) => [...prev, ...result.added]);
      // Background async push to Neon (stateless, closes immediately)
      NeonDbService.upsertIps(result.added).catch(() => {});
      showToast(`⚡ Daily Extraction: Ingested ${result.added.length} new IPs (${result.remainingInPool} left in pool, 0 duplicates)!`);
    } else {
      showToast(`⚡ Discovery pool is fully up-to-date! All 16+ pipeline properties are already active in portfolio.`);
    }
  };

  // One-shot on-demand sync with Neon Serverless Postgres via Cloudflare Pages Function
  // STRICT ARCHITECTURAL RULE: Only runs when user requests it; Neon scales to 0 when idle.
  const handleSyncNeon = async () => {
    setIsSyncing(true);
    showToast('☁️ Connecting to Neon Serverless via Cloudflare Pages...');
    try {
      const res = await NeonDbService.syncWithRemote(ips);
      if (res.success && res.ips?.length) {
        setIps(res.ips);
        showToast(`☁️ Neon Serverless Synced: ${res.ips.length} properties synchronized! Neon scaling to 0.`);
      } else {
        showToast('☁️ Local cache active. Configure DATABASE_URL in Cloudflare Pages to connect remote Neon instance.');
      }
    } catch (err) {
      showToast(`☁️ Neon connection: ${err.message || 'Offline fallback mode active'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // RBAC Property Deletion: Admin has full control; Normal User is restricted
  const handleDeleteIP = (ipId) => {
    if (!authService.canDeleteIP(currentUser)) {
      showToast('🔒 Action Restricted: Normal users cannot delete cards. Administrator access required.');
      return;
    }
    const target = ips.find((item) => item.id === ipId);
    setIps((prev) => prev.filter((item) => item.id !== ipId));
    if (selectedIP && selectedIP.id === ipId) {
      setSelectedIP(null);
    }
    showToast(`Deleted property: ${target?.title || ipId}`);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    showToast('Signed out of IP HUB.');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}! (${user.role === 'admin' ? '👑 Master Admin' : '👤 Normal User'})`);
  };

  // If user is not authenticated, render the dedicated Login Gateway
  if (!currentUser) {
    return (
      <>
        <Toast message={toastMessage} />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <>
      <Toast message={toastMessage} />

      <NavigationBar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onResetData={handleResetData}
        onExtractDailyIPs={handleExtractDailyIPs}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
      />

      <StatsOverview ips={ips} />

      <ControlBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterVenue={filterVenue}
        setFilterVenue={setFilterVenue}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterLeadType={filterLeadType}
        setFilterLeadType={setFilterLeadType}
        todayLeadsCount={todayLeadsCount}
        onExtractDailyIPs={handleExtractDailyIPs}
        filteredCount={filteredIPs.length}
        totalCount={ips.length}
      />

      <main className="main-view-container">
        {viewMode === 'cards' && (
          <CardsView
            ips={filteredIPs}
            onOpenDossier={(ip) => setSelectedIP(ip)}
            onOpenPitch={(ip) => setSelectedIP(ip)}
            onUpdateStatus={(ip, newStatus) => {
              const updated = { ...ip, status: newStatus };
              handleUpdateIP(updated);
              showToast(`Status updated to "${newStatus}"`);
            }}
            onShowToast={showToast}
            currentUser={currentUser}
            onDeleteIP={handleDeleteIP}
          />
        )}

        {viewMode === 'deck3d' && (
          <DeckView3D
            ips={filteredIPs}
            onOpenDossier={(ip) => setSelectedIP(ip)}
            onOpenPitch={(ip) => setSelectedIP(ip)}
            onUpdateStatus={(ip, newStatus) => {
              const updated = { ...ip, status: newStatus };
              handleUpdateIP(updated);
              showToast(`Status updated to "${newStatus}"`);
            }}
            onShowToast={showToast}
          />
        )}

        {viewMode === 'table' && (
          <TableView
            ips={filteredIPs}
            onOpenDossier={(ip) => setSelectedIP(ip)}
            onOpenPitch={(ip) => setSelectedIP(ip)}
            currentUser={currentUser}
            onDeleteIP={handleDeleteIP}
            onShowToast={showToast}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            ips={filteredIPs}
            onOpenDossier={(ip) => setSelectedIP(ip)}
            onAdvanceStatus={handleAdvanceStatus}
          />
        )}

        {viewMode === 'venues' && (
          <VenuesMatrix
            ips={filteredIPs}
            onOpenDossier={(ip) => setSelectedIP(ip)}
            onOpenPitch={(ip) => setSelectedIP(ip)}
          />
        )}
      </main>

      <IPDossierModal
        ip={selectedIP}
        onClose={() => setSelectedIP(null)}
        onUpdateIP={handleUpdateIP}
        onShowToast={showToast}
        currentUser={currentUser}
        onDeleteIP={handleDeleteIP}
      />

      <AddIPModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddIP={handleAddIP}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
      />
    </>
  );
}
