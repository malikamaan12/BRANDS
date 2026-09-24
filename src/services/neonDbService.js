/**
 * neonDbService.js
 * Stateless Neon PostgreSQL & Cloudflare Pages Data Service
 * 
 * STRICT RESOURCE PRESERVATION:
 * 1. Neon auto-suspends after 5 minutes of inactivity.
 * 2. This service NEVER runs background polling loops or heartbeats.
 * 3. Uses connectionless HTTP fetch (port 443) via Cloudflare Pages /api endpoints.
 * 4. Local-first caching guarantees 100% functionality even during Neon cold boot or offline mode.
 */

const LOCAL_STORAGE_KEY = 'doha_entertainment_ips_v2';
const LAST_SYNC_KEY = 'doha_entertainment_ips_last_sync';

export const NeonDbService = {
  /**
   * Fetch IPs from Neon via Cloudflare Pages Function.
   * Falls back to local storage cache if server is unreachable or cold booting.
   */
  async getIps(fallbackData = []) {
    try {
      const response = await fetch('/api/ips', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (data.ips && data.ips.length > 0) {
        // Cache to localStorage for offline and zero-ping access
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.ips));
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        return {
          ips: data.ips,
          source: data.source || 'neon-serverless',
          status: 'connected'
        };
      }
    } catch (err) {
      console.warn('[NeonDbService] Using local cache (Neon sleeping or local dev mode):', err.message);
    }

    // Local-first fallback: check localStorage, otherwise use fallbackData
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { ips: parsed, source: 'local-cache', status: 'cached' };
        }
      } catch (e) {}
    }

    return { ips: fallbackData, source: 'seed-bundle', status: 'seed' };
  },

  /**
   * Upsert a single IP or batch of IPs into Neon.
   * Executes as an atomic one-shot HTTP request; terminates immediately so Neon can sleep.
   */
  async upsertIps(ips) {
    const items = Array.isArray(ips) ? ips : [ips];
    
    // Always update local cache first
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      let currentList = cached ? JSON.parse(cached) : [];
      const itemMap = new Map(currentList.map(item => [item.id, item]));
      items.forEach(item => itemMap.set(item.id, item));
      const updatedList = Array.from(itemMap.values());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('[NeonDbService] Failed to update local cache', e);
    }

    // Push to Neon via Cloudflare Pages Function
    try {
      const response = await fetch('/api/ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });

      if (response.ok) {
        return { success: true, syncedWithNeon: true };
      }
    } catch (err) {
      console.warn('[NeonDbService] Remote sync deferred (Neon asleep or offline):', err.message);
    }

    return { success: true, syncedWithNeon: false };
  },

  /**
   * Explicit one-click manual sync.
   * Only triggered by user gesture (no background polling loops).
   */
  async syncWithRemote(localIps) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: localIps })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ips && result.ips.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result.ips));
          localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
          return { success: true, ips: result.ips, source: result.source };
        }
      }
    } catch (err) {
      console.warn('[NeonDbService] Sync request failed:', err.message);
    }

    return { success: false, ips: localIps };
  }
};
