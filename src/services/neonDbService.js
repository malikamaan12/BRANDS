/**
 * neonDbService.js
 * Stateless Neon PostgreSQL & Cloudflare Pages Data Service
 * 
 * STRICT RESOURCE PRESERVATION:
 * 1. Neon auto-suspends after 5 minutes of inactivity.
 * 2. This service NEVER runs background polling loops or heartbeats.
 * 3. Uses connectionless HTTP fetch (port 443) via Cloudflare /api endpoints.
 * 4. Local-first caching guarantees 100% functionality even during Neon cold boot or offline mode.
 */

// UNIFIED STORAGE KEY (Matches src/data/ips.js)
const LOCAL_STORAGE_KEY = 'doha_entertainment_ips_react';
const LAST_SYNC_KEY = 'doha_entertainment_ips_last_sync';

export const NeonDbService = {
  /**
   * Fetch IPs from Neon via Cloudflare /api/ips.
   * Falls back to local storage cache if server is unreachable or cold booting.
   */
  async getIps(fallbackData = []) {
    try {
      const response = await fetch('/api/ips', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ips && data.ips.length > 0) {
          // Normalize items and guarantee email_template & venue_fit
          const normalized = data.ips.map(item => {
            const fallback = fallbackData.find(f => f.id === item.id) || {};
            const venueFitStr = typeof item.venue_fit === 'string'
              ? item.venue_fit
              : (Array.isArray(item.venue_fit) ? item.venue_fit.join(', ') : (item.venue_fit ? JSON.stringify(item.venue_fit) : ''));

            return {
              ...fallback,
              ...item,
              venue_fit: venueFitStr || fallback.venue_fit || '',
              email_template: item.email_template || fallback.email_template || `Subject: Host Partnership Inquiry: ${item.title} in Doha\n\nDear ${item.producer || item.licensor} Team,\n\nWe are writing to explore hosting ${item.title} in Doha, Qatar. Best regards,`
            };
          });

          // Cache to unified localStorage
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
          localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
          return {
            ips: normalized,
            source: data.source || 'neon-serverless',
            status: 'connected'
          };
        }
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

    // Push to Neon via Cloudflare /api/ips
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
   * Permanently delete an IP from Neon and local cache.
   */
  async deleteIp(id) {
    // 1. Remove from local cache immediately
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const currentList = JSON.parse(cached);
        const filtered = currentList.filter(item => item.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('[NeonDbService] Failed removing from local cache', e);
    }

    // 2. Issue DELETE request to Neon API
    try {
      const response = await fetch(`/api/ips?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        return { success: true, remoteDeleted: true };
      }
    } catch (err) {
      console.warn('[NeonDbService] Remote delete deferred:', err.message);
    }

    return { success: true, remoteDeleted: false };
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
          // Normalize fields
          const normalized = result.ips.map(item => {
            const local = localIps.find(l => l.id === item.id) || {};
            const venueFitStr = typeof item.venue_fit === 'string'
              ? item.venue_fit
              : (Array.isArray(item.venue_fit) ? item.venue_fit.join(', ') : (item.venue_fit ? JSON.stringify(item.venue_fit) : ''));

            return {
              ...local,
              ...item,
              venue_fit: venueFitStr || local.venue_fit || '',
              email_template: item.email_template || local.email_template || ''
            };
          });

          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
          localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
          return { success: true, ips: normalized, source: result.source };
        }
      }
    } catch (err) {
      console.warn('[NeonDbService] Sync request failed:', err.message);
    }

    return { success: false, ips: localIps };
  }
};
