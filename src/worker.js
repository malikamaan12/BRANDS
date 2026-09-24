// Cloudflare Worker entry point for Workers & Pages Static Assets
// Powered by @neondatabase/serverless connectionless HTTP driver
// STRICT SCALE-TO-ZERO GUARANTEE: Ephemeral execution terminates immediately, allowing Neon to auto-suspend.

import { neon } from '@neondatabase/serverless';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. API: /api/ips
    if (url.pathname === '/api/ips') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }

      if (!env.DATABASE_URL) {
        return new Response(JSON.stringify({
          source: 'offline-fallback',
          warning: 'DATABASE_URL environment variable is not configured. Operating in local cache mode.',
          ips: []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      try {
        const sql = neon(env.DATABASE_URL);

        if (request.method === 'GET') {
          const rows = await sql`
            SELECT id, title, category, image, licensor, producer, person, email, 
                   website, linkedin_url, social, past_shows, past_show_url, 
                   venue_fit, brand_details, status, notes, updated_at
            FROM entertainment_ips
            ORDER BY updated_at DESC
          `;
          return new Response(JSON.stringify({ source: 'neon-serverless', count: rows.length, ips: rows }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (request.method === 'POST') {
          const payload = await request.json();
          const items = Array.isArray(payload) ? payload : [payload];
          for (const item of items) {
            await sql`
              INSERT INTO entertainment_ips (
                id, title, category, image, licensor, producer, person, email,
                website, linkedin_url, social, past_shows, past_show_url,
                venue_fit, brand_details, status, notes, updated_at
              ) VALUES (
                ${item.id},
                ${item.title || ''},
                ${item.category || 'General'},
                ${item.image || ''},
                ${item.licensor || ''},
                ${item.producer || ''},
                ${item.person || ''},
                ${item.email || ''},
                ${item.website || ''},
                ${item.linkedin_url || ''},
                ${item.social || ''},
                ${item.past_shows || ''},
                ${item.past_show_url || ''},
                ${JSON.stringify(item.venue_fit || [])}::jsonb,
                ${JSON.stringify(item.brand_details || {})}::jsonb,
                ${item.status || 'Prospect'},
                ${item.notes || ''},
                NOW()
              )
              ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                category = EXCLUDED.category,
                image = EXCLUDED.image,
                licensor = EXCLUDED.licensor,
                producer = EXCLUDED.producer,
                person = EXCLUDED.person,
                email = EXCLUDED.email,
                website = EXCLUDED.website,
                linkedin_url = EXCLUDED.linkedin_url,
                social = EXCLUDED.social,
                past_shows = EXCLUDED.past_shows,
                past_show_url = EXCLUDED.past_show_url,
                venue_fit = EXCLUDED.venue_fit,
                brand_details = EXCLUDED.brand_details,
                status = EXCLUDED.status,
                notes = EXCLUDED.notes,
                updated_at = NOW();
            `;
          }
          return new Response(JSON.stringify({ success: true, count: items.length }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // 2. API: /api/sync
    if (url.pathname === '/api/sync') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }

      if (!env.DATABASE_URL) {
        return new Response(JSON.stringify({ source: 'offline-local', message: 'DATABASE_URL not set' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      try {
        const { items = [] } = await request.json();
        const sql = neon(env.DATABASE_URL);
        const [{ count }] = await sql`SELECT count(*)::int FROM entertainment_ips`;

        if (count === 0 && items.length > 0) {
          for (const item of items) {
            await sql`
              INSERT INTO entertainment_ips (
                id, title, category, image, licensor, producer, person, email,
                website, linkedin_url, social, past_shows, past_show_url,
                venue_fit, brand_details, status, notes, updated_at
              ) VALUES (
                ${item.id},
                ${item.title || ''},
                ${item.category || 'General'},
                ${item.image || ''},
                ${item.licensor || ''},
                ${item.producer || ''},
                ${item.person || ''},
                ${item.email || ''},
                ${item.website || ''},
                ${item.linkedin_url || ''},
                ${item.social || ''},
                ${item.past_shows || ''},
                ${item.past_show_url || ''},
                ${JSON.stringify(item.venue_fit || [])}::jsonb,
                ${JSON.stringify(item.brand_details || {})}::jsonb,
                ${item.status || 'Prospect'},
                ${item.notes || ''},
                NOW()
              ) ON CONFLICT (id) DO NOTHING;
            `;
          }
        }

        const remoteIps = await sql`
          SELECT id, title, category, image, licensor, producer, person, email, 
                 website, linkedin_url, social, past_shows, past_show_url, 
                 venue_fit, brand_details, status, notes, updated_at
          FROM entertainment_ips
          ORDER BY updated_at DESC
        `;

        return new Response(JSON.stringify({
          source: 'neon-serverless',
          syncedAt: new Date().toISOString(),
          count: remoteIps.length,
          ips: remoteIps
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // 3. Fallback to static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
