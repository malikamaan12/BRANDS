import React, { useState, useEffect, useMemo } from 'react';
import { loadIPs, saveIPs, resetIPs, matchesCategory, isTodayLead } from './data/ips';
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
import ExtractionModal from './components/ExtractionModal';
import Toast from './components/Toast';
import { authService } from './services/authService';
import { getExtractionSettings, syncFromGoogleSheet } from './services/extractionService';

export default function App() {
  const [ips, setIps] = useState(() => loadIPs());
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false);
  const [dossierInitialTab, setDossierInitialTab] = useState('overview');
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

  // Initial mount: seamlessly check and synchronize with remote Neon PostgreSQL
  useEffect(() => {
    let isMounted = true;
    NeonDbService.getIps(ips).then((result) => {
      if (isMounted && result?.ips?.length) {
        setIps(result.ips);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Derived counts for lead origin
  const todayLeadsCount = useMemo(() => {
    return ips.filter((ip) => isTodayLead(ip)).length;
  }, [ips]);

  const coreLeadsCount = useMemo(() => {
    return ips.filter((ip) => !isTodayLead(ip)).length;
  }, [ips]);

  // Unified Category Counts for Stats Overview and Filter Chips
  const categoryCounts = useMemo(() => {
    return {
      all: ips.length,
      today: todayLeadsCount,
      theatrical: ips.filter((ip) => matchesCategory(ip.category, 'theatrical')).length,
      exhibition: ips.filter((ip) => matchesCategory(ip.category, 'exhibition')).length,
      arena: ips.filter((ip) => matchesCategory(ip.category, 'arena')).length,
      fec: ips.filter((ip) => matchesCategory(ip.category, 'fec')).length,
      concert: ips.filter((ip) => matchesCategory(ip.category, 'concert')).length,
    };
  }, [ips, todayLeadsCount]);

  // Live Deal Stage Pipeline Counts
  const statusCounts = useMemo(() => {
    let active = 0;
    let notContacted = 0;
    let outreachSent = 0;
    let inDiscussion = 0;
    let termsReceived = 0;
    let confirmed = 0;

    ips.forEach((ip) => {
      const s = ip.status || 'Not Contacted';
      if (s !== 'Not Contacted') active++;
      if (s === 'Not Contacted') notContacted++;
      else if (s === 'Outreach Sent') outreachSent++;
      else if (s === 'In Discussion') inDiscussion++;
      else if (s === 'Terms Received') termsReceived++;
      else if (s === 'Confirmed') confirmed++;
    });

    return { active, notContacted, outreachSent, inDiscussion, termsReceived, confirmed };
  }, [ips]);

  // Venue Counts
  const venueCounts = useMemo(() => {
    let qncc = 0, decc = 0, lusail = 0, katara = 0, malls = 0, aspire = 0;
    ips.forEach((ip) => {
      const v = typeof ip.venue_fit === 'string'
        ? ip.venue_fit.toLowerCase()
        : (Array.isArray(ip.venue_fit) ? ip.venue_fit.join(', ').toLowerCase() : '');
      if (v.includes('qncc')) qncc++;
      if (v.includes('decc')) decc++;
      if (v.includes('lusail') || v.includes('abha')) lusail++;
      if (v.includes('katara')) katara++;
      if (v.includes('mall') || v.includes('place vendôme') || v.includes('vendome') || v.includes('festival city') || v.includes('msheireb')) malls++;
      if (v.includes('aspire') || v.includes('al maha') || v.includes('outdoor')) aspire++;
    });
    return { qncc, decc, lusail, katara, malls, aspire };
  }, [ips]);

  // Persist to unified localStorage whenever IPs change
  useEffect(() => {
    saveIPs(ips);
  }, [ips]);

  // Support direct linking / preview via URL ?ip=IP-003
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ipParam = params.get('ip');
    if (ipParam && ips.length > 0) {
      const found = ips.find(item => (item.id || '').toLowerCase() === ipParam.toLowerCase());
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
      NeonDbService.upsertIps(newlyExtracted).catch(() => {});
    });
    if (res?.extracted > 0) {
      showToast(`⚡ Automated Daily Extraction: Ingested ${res.extracted} new verified entertainment IPs!`);
    }
  }, []);

  // Auto-sync from configured Google Sheet on startup (if enabled in settings)
  useEffect(() => {
    const settings = getExtractionSettings();
    if (settings.autoSyncEnabled && settings.googleSheetUrl) {
      syncFromGoogleSheet(settings.googleSheetUrl, ips)
        .then((res) => {
          if (res?.newIPs?.length > 0) {
            setIps((prev) => [...res.newIPs, ...prev]);
            NeonDbService.pushIps(res.newIPs).catch(() => {});
            showToast(`📊 Google Sheet Auto-Sync: Ingested ${res.newIPs.length} new properties!`);
          }
        })
        .catch((err) => {
          console.warn('Background Google Sheet sync:', err.message);
        });
    }
  }, []);

  // Filtered IPs calculation with complete null-safety
  const filteredIPs = useMemo(() => {
    return ips.filter((ip) => {
      const title = (ip.title || '').toLowerCase();
      const licensor = (ip.licensor || '').toLowerCase();
      const producer = (ip.producer || '').toLowerCase();
      const category = (ip.category || '').toLowerCase();
      const id = (ip.id || '').toLowerCase();
      const venueFitStr = typeof ip.venue_fit === 'string'
        ? ip.venue_fit
        : (Array.isArray(ip.venue_fit) ? ip.venue_fit.join(', ') : '');
      const venueLower = venueFitStr.toLowerCase();

      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          title.includes(q) ||
          licensor.includes(q) ||
          producer.includes(q) ||
          category.includes(q) ||
          venueLower.includes(q) ||
          id.includes(q);
        if (!match) return false;
      }

      // 2. Today's Lead / Origin filter
      const isToday = isTodayLead(ip);

      if (filterLeadType === 'today' || filterCategory === 'today') {
        if (!isToday) return false;
      } else if (filterLeadType === 'core') {
        if (isToday) return false;
      }

      // 3. Category filter (standardized across entire app)
      if (filterCategory !== 'all' && filterCategory !== 'today') {
        if (!matchesCategory(ip.category, filterCategory)) {
          return false;
        }
      }

      // 4. Venue filter
      if (filterVenue !== 'all') {
        const ven = venueLower;
        if (filterVenue === 'qncc' && !ven.includes('qncc')) return false;
        if (filterVenue === 'decc' && !ven.includes('decc')) return false;
        if (filterVenue === 'lusail' && !(ven.includes('lusail') || ven.includes('abha'))) return false;
        if (filterVenue === 'katara' && !ven.includes('katara')) return false;
        if (filterVenue === 'malls' && !(ven.includes('mall') || ven.includes('place vendôme') || ven.includes('vendome') || ven.includes('festival city') || ven.includes('msheireb'))) return false;
        if (filterVenue === 'aspire' && !(ven.includes('aspire') || ven.includes('al maha') || ven.includes('outdoor'))) return false;
      }

      // 5. Status filter
      if (filterStatus !== 'all') {
        const currentStatus = ip.status || 'Not Contacted';
        if (filterStatus === 'active') {
          if (currentStatus === 'Not Contacted') return false;
        } else if (currentStatus !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  }, [ips, searchQuery, filterCategory, filterVenue, filterStatus, filterLeadType]);

  // Open dossier modal to overview tab
  const handleOpenDossier = (ip) => {
    setSelectedIP(ip);
    setDossierInitialTab('overview');
  };

  // Open dossier modal specifically to pitch email tab
  const handleOpenPitch = (ip) => {
    setSelectedIP(ip);
    setDossierInitialTab('pitch');
  };

  // Update a single IP (persists locally and remotely to Neon)
  const handleUpdateIP = (updatedIP) => {
    setIps((prev) => prev.map((item) => (item.id === updatedIP.id ? updatedIP : item)));
    if (selectedIP && selectedIP.id === updatedIP.id) {
      setSelectedIP(updatedIP);
    }
    // Background push to Neon
    NeonDbService.upsertIps(updatedIP).catch(() => {});
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

  // Add new IP with collision-free sequential ID generation
  const handleAddIP = (newIPData) => {
    let maxNum = 0;
    ips.forEach((ip) => {
      const match = (ip.id || '').match(/IP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const newId = `IP-${String(maxNum + 1).padStart(3, '0')}`;
    const newIP = { id: newId, ...newIPData };

    setIps((prev) => [newIP, ...prev]);
    // Persist to remote Neon
    NeonDbService.upsertIps(newIP).catch(() => {});
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
      `"${(ip.id || '').replace(/"/g, '""')}"`,
      `"${(ip.title || '').replace(/"/g, '""')}"`,
      `"${(ip.category || '').replace(/"/g, '""')}"`,
      `"${(ip.licensor || '').replace(/"/g, '""')}"`,
      `"${(ip.producer || '').replace(/"/g, '""')}"`,
      `"${(ip.person || '').replace(/"/g, '""')}"`,
      `"${(ip.email || '').replace(/"/g, '""')}"`,
      `"${(ip.website || '').replace(/"/g, '""')}"`,
      `"${(typeof ip.venue_fit === 'string' ? ip.venue_fit : '').replace(/"/g, '""')}"`,
      `"${(ip.status || '').replace(/"/g, '""')}"`,
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
      showToast(`⚡ Discovery pool is fully up-to-date! All pipeline properties are active.`);
    }
  };

  // Explicit one-shot on-demand sync with Neon Serverless Postgres via Cloudflare
  const handleSyncNeon = async () => {
    setIsSyncing(true);
    showToast('☁️ Connecting to Neon Serverless via Cloudflare...');
    try {
      const res = await NeonDbService.syncWithRemote(ips);
      if (res.success && res.ips?.length) {
        setIps(res.ips);
        showToast(`☁️ Neon Serverless Synced: ${res.ips.length} properties synchronized! Neon scaling to 0.`);
      } else {
        showToast('☁️ Local cache active. Configure DATABASE_URL in Cloudflare to connect remote Neon instance.');
      }
    } catch (err) {
      showToast(`☁️ Neon connection: ${err.message || 'Offline fallback mode active'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // RBAC Property Deletion: Admin has full control; Normal User is restricted
  const handleDeleteIP = async (ipId) => {
    if (!authService.canDeleteIP(currentUser)) {
      showToast('🔒 Action Restricted: Normal users cannot delete cards. Administrator access required.');
      return;
    }
    const target = ips.find((item) => item.id === ipId);
    setIps((prev) => prev.filter((item) => item.id !== ipId));
    if (selectedIP && selectedIP.id === ipId) {
      setSelectedIP(null);
    }

    // Persist delete to Neon database to prevent resurrection
    await NeonDbService.deleteIp(ipId);
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
        onOpenExtractionModal={() => setIsExtractionModalOpen(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onResetData={handleResetData}
        onExtractDailyIPs={handleExtractDailyIPs}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
        onSyncNeon={handleSyncNeon}
        isSyncing={isSyncing}
      />

      <StatsOverview 
        ips={ips}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterLeadType={filterLeadType}
        setFilterLeadType={setFilterLeadType}
        categoryCounts={categoryCounts}
        statusCounts={statusCounts}
      />

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
        coreLeadsCount={coreLeadsCount}
        categoryCounts={categoryCounts}
        statusCounts={statusCounts}
        venueCounts={venueCounts}
        onExtractDailyIPs={handleExtractDailyIPs}
        filteredCount={filteredIPs.length}
        totalCount={ips.length}
      />

      <main className="main-view-container">
        {viewMode === 'cards' && (
          <CardsView
            ips={filteredIPs}
            onOpenDossier={handleOpenDossier}
            onOpenPitch={handleOpenPitch}
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
            onOpenDossier={handleOpenDossier}
            onOpenPitch={handleOpenPitch}
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
            onOpenDossier={handleOpenDossier}
            onOpenPitch={handleOpenPitch}
            currentUser={currentUser}
            onDeleteIP={handleDeleteIP}
            onShowToast={showToast}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            ips={filteredIPs}
            onOpenDossier={handleOpenDossier}
            onAdvanceStatus={handleAdvanceStatus}
          />
        )}

        {viewMode === 'venues' && (
          <VenuesMatrix
            ips={filteredIPs}
            onOpenDossier={handleOpenDossier}
            onOpenPitch={handleOpenPitch}
          />
        )}
      </main>

      <IPDossierModal
        ip={selectedIP}
        initialTab={dossierInitialTab}
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

      <ExtractionModal
        isOpen={isExtractionModalOpen}
        onClose={() => setIsExtractionModalOpen(false)}
        existingIPs={ips}
        onAddExtractedIPs={(newIPs) => {
          if (!newIPs || newIPs.length === 0) return;
          setIps((prev) => [...newIPs, ...prev]);
        }}
        onShowToast={showToast}
      />

      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
        onOpenExtractionModal={() => setIsExtractionModalOpen(true)}
      />
    </>
  );
}
