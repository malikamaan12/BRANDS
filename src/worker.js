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

    // 3. API: /api/users (Role-Based User Management & RBAC Provisioning)
    if (url.pathname === '/api/users') {
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
        return new Response(JSON.stringify({ source: 'offline-local', users: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      try {
        const sql = neon(env.DATABASE_URL);

        // Ensure iphub_users table exists in Neon PostgreSQL
        await sql`
          CREATE TABLE IF NOT EXISTS iphub_users (
            id VARCHAR(64) PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(32) NOT NULL DEFAULT 'user',
            title TEXT,
            is_root BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
        `;

        if (request.method === 'GET') {
          // Ensure all 7 official E3 team credentials exist in Neon
          await sql`
            INSERT INTO iphub_users (id, name, email, password, role, title, is_root, is_active)
            VALUES 
              ('usr-admin-01', 'E3 Master Administrator', 'admin@eeeqa.com', 'E3qatech@123!', 'admin', 'Chief Executive & Platform Administrator', true, true),
              ('usr-admin-02', 'Amaan Malik', 'amaan@eeeqa.com', 'E3qatech@123!', 'admin', 'Operations Director & Administrator', false, true),
              ('usr-user-01', 'Hussain', 'hussain@eeeqa.com', 'E3qatech@123!', 'user', 'Entertainment Licensing Specialist', false, true),
              ('usr-user-02', 'Suhail', 'suhail@eeeqa.com', 'E3qatech@123!', 'user', 'Brand Partnership Lead', false, true),
              ('usr-user-03', 'Adil', 'adil@eeeqa.com', 'E3qatech@123!', 'user', 'Host Operations Lead', false, true),
              ('usr-user-04', 'M. Ali', 'm.ali@eeeqa.com', 'E3qatech@123!', 'user', 'Licensing Specialist', false, true),
              ('usr-user-05', 'Ahmad', 'ahmad@eeeqa.com', 'E3qatech@123!', 'user', 'Events Producer & Licensing Associate', false, true)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              password = EXCLUDED.password,
              role = EXCLUDED.role,
              title = EXCLUDED.title,
              updated_at = NOW();
          `;

          // Remove legacy placeholder records
          await sql`DELETE FROM iphub_users WHERE email IN ('admin@iphub.com', 'user@iphub.com');`;

          const rows = await sql`
            SELECT id, name, email, password, role, title, is_root, is_active, created_at, updated_at
            FROM iphub_users
            ORDER BY created_at ASC
          `;
          return new Response(JSON.stringify({ source: 'neon-serverless', count: rows.length, users: rows }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (request.method === 'POST') {
          const body = await request.json();
          const { action, user, userId, newPassword } = body;

          if (action === 'delete' && userId) {
            await sql`DELETE FROM iphub_users WHERE id = ${userId} AND is_root = false`;
            return new Response(JSON.stringify({ success: true, deleted: userId }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          if (action === 'update_password' && userId && newPassword) {
            await sql`UPDATE iphub_users SET password = ${newPassword}, updated_at = NOW() WHERE id = ${userId}`;
            return new Response(JSON.stringify({ success: true, updated: userId }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          if (action === 'upsert' && user) {
            await sql`
              INSERT INTO iphub_users (id, name, email, password, role, title, is_root, is_active, updated_at)
              VALUES (
                ${user.id},
                ${user.name},
                ${user.email.toLowerCase()},
                ${user.password},
                ${user.role || 'user'},
                ${user.title || ''},
                ${Boolean(user.is_root)},
                ${user.is_active !== false},
                NOW()
              )
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                password = EXCLUDED.password,
                role = EXCLUDED.role,
                title = EXCLUDED.title,
                is_active = EXCLUDED.is_active,
                updated_at = NOW();
            `;
            return new Response(JSON.stringify({ success: true, user }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // 4. Fallback to static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
