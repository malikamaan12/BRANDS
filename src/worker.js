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
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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

        // Ensure table has email_template column
        await sql`
          CREATE TABLE IF NOT EXISTS entertainment_ips (
            id VARCHAR(64) PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            image TEXT,
            licensor TEXT,
            producer TEXT,
            person TEXT,
            email TEXT,
            website TEXT,
            linkedin_url TEXT,
            social TEXT,
            past_shows TEXT,
            past_show_url TEXT,
            venue_fit TEXT,
            brand_details JSONB DEFAULT '{}'::jsonb,
            status VARCHAR(32) DEFAULT 'Not Contacted',
            email_template TEXT,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
        `;

        if (request.method === 'GET') {
          const rows = await sql`
            SELECT id, title, category, image, licensor, producer, person, email, 
                   website, linkedin_url, social, past_shows, past_show_url, 
                   venue_fit, brand_details, status, email_template, notes, updated_at
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
            const venueStr = typeof item.venue_fit === 'string' ? item.venue_fit : JSON.stringify(item.venue_fit || '');
            await sql`
              INSERT INTO entertainment_ips (
                id, title, category, image, licensor, producer, person, email,
                website, linkedin_url, social, past_shows, past_show_url,
                venue_fit, brand_details, status, email_template, notes, updated_at
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
                ${venueStr},
                ${JSON.stringify(item.brand_details || {})}::jsonb,
                ${item.status || 'Not Contacted'},
                ${item.email_template || ''},
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
                email_template = EXCLUDED.email_template,
                notes = EXCLUDED.notes,
                updated_at = NOW();
            `;
          }
          return new Response(JSON.stringify({ success: true, count: items.length }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (request.method === 'DELETE') {
          let idToDelete = url.searchParams.get('id');
          if (!idToDelete) {
            try {
              const body = await request.json();
              idToDelete = body.id;
            } catch {}
          }
          if (idToDelete) {
            await sql`DELETE FROM entertainment_ips WHERE id = ${idToDelete}`;
            return new Response(JSON.stringify({ success: true, deleted: idToDelete }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
          return new Response(JSON.stringify({ error: 'Missing ID for deletion' }), {
            status: 400,
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
            const venueStr = typeof item.venue_fit === 'string' ? item.venue_fit : JSON.stringify(item.venue_fit || '');
            await sql`
              INSERT INTO entertainment_ips (
                id, title, category, image, licensor, producer, person, email,
                website, linkedin_url, social, past_shows, past_show_url,
                venue_fit, brand_details, status, email_template, notes, updated_at
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
                ${venueStr},
                ${JSON.stringify(item.brand_details || {})}::jsonb,
                ${item.status || 'Prospect'},
                ${item.email_template || ''},
                ${item.notes || ''},
                NOW()
              ) ON CONFLICT (id) DO NOTHING;
            `;
          }
        }

        const remoteIps = await sql`
          SELECT id, title, category, image, licensor, producer, person, email, 
                 website, linkedin_url, social, past_shows, past_show_url, 
                 venue_fit, brand_details, status, email_template, notes, updated_at
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
          // Seed defaults ONLY if they do not exist; NEVER overwrite passwords on conflict!
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
              role = EXCLUDED.role,
              title = EXCLUDED.title,
              updated_at = NOW();
          `;

          // Remove legacy placeholder records
          await sql`DELETE FROM iphub_users WHERE email IN ('admin@iphub.com', 'user@iphub.com');`;

          // CRITICAL SECURITY FIX: NEVER return plaintext passwords to client!
          const rows = await sql`
            SELECT id, name, email, role, title, is_root, is_active, created_at, updated_at
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
          const { action, user, userId, newPassword, email, password } = body;

          // Secure login action
          if (action === 'login' && email && password) {
            const trimmedEmail = email.trim().toLowerCase();
            const trimmedPass = password.trim();
            const foundUsers = await sql`
              SELECT id, name, email, role, title, is_root, is_active
              FROM iphub_users
              WHERE LOWER(email) = ${trimmedEmail} AND password = ${trimmedPass} AND is_active = true
              LIMIT 1
            `;
            if (foundUsers.length > 0) {
              return new Response(JSON.stringify({ success: true, user: foundUsers[0] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
              });
            }
            return new Response(JSON.stringify({ success: false, error: 'Invalid corporate email or password.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          if (action === 'delete' && userId) {
            await sql`DELETE FROM iphub_users WHERE id = ${userId} AND is_root = false`;
            return new Response(JSON.stringify({ success: true, deleted: userId }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          if (action === 'update_password' && userId && newPassword) {
            await sql`UPDATE iphub_users SET password = ${newPassword.trim()}, updated_at = NOW() WHERE id = ${userId}`;
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
                ${user.password || 'E3qatech@123!'},
                ${user.role || 'user'},
                ${user.title || ''},
                ${Boolean(user.is_root)},
                ${user.is_active !== false},
                NOW()
              )
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                role = EXCLUDED.role,
                title = EXCLUDED.title,
                is_active = EXCLUDED.is_active,
                updated_at = NOW();
            `;
            const sanitizedUser = { ...user };
            delete sanitizedUser.password;
            return new Response(JSON.stringify({ success: true, user: sanitizedUser }), {
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

    // 4. Live Extraction & Ingestion Pipeline (/api/extract)
    if (url.pathname === '/api/extract') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { action, sheetUrl, apiKey, queryFocus, items = [] } = body;
          const dbUrl = env.DATABASE_URL;
          const geminiKey = env.GEMINI_API_KEY;

          // Direct batch save to Neon
          if (action === 'save_batch' && Array.isArray(items) && items.length > 0) {
            if (dbUrl) {
              const sql = neon(dbUrl);
              for (const ip of items) {
                const venueStr = typeof ip.venue_fit === 'string' ? ip.venue_fit : (Array.isArray(ip.venue_fit) ? ip.venue_fit.join(', ') : '');
                await sql`
                  INSERT INTO entertainment_ips (
                    id, title, category, image, licensor, producer, person, email,
                    website, linkedin_url, social, past_shows, past_show_url,
                    venue_fit, brand_details, status, email_template, notes, updated_at
                  ) VALUES (
                    ${ip.id}, ${ip.title || ''}, ${ip.category || 'Touring Entertainment'}, ${ip.image || ''},
                    ${ip.licensor || ''}, ${ip.producer || ''}, ${ip.person || ''}, ${ip.email || ''},
                    ${ip.website || ''}, ${ip.linkedin_url || ''}, ${ip.social || ''}, ${ip.past_shows || ''},
                    ${ip.past_show_url || ''}, ${venueStr}, ${JSON.stringify(ip.brand_details || {})}::jsonb,
                    ${ip.status || 'Not Contacted'}, ${ip.email_template || ''}, ${ip.notes || ''}, NOW()
                  ) ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title, category = EXCLUDED.category, updated_at = NOW();
                `;
              }
            }
            return new Response(JSON.stringify({ success: true, count: items.length }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          // Proxy fetch Google Sheet CSV
          if (action === 'sync_sheet' && sheetUrl) {
            let targetCsv = sheetUrl.trim();
            const idMatch = targetCsv.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (idMatch && !targetCsv.includes('export?format=csv')) {
              targetCsv = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
            }
            const sheetRes = await fetch(targetCsv, { headers: { Accept: 'text/csv, text/plain, */*' } });
            if (!sheetRes.ok) {
              return new Response(JSON.stringify({ success: false, error: `Google Sheets returned HTTP ${sheetRes.status}` }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
              });
            }
            const csvData = await sheetRes.text();
            return new Response(JSON.stringify({ success: true, csv: csvData }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          // Gemini AI web search
          if (action === 'gemini_extract') {
            const activeKey = apiKey || geminiKey;
            if (!activeKey) {
              return new Response(JSON.stringify({ success: false, error: 'GEMINI_API_KEY is not configured.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
              });
            }

            const prompt = `Search the web for 5 REAL, active international touring entertainment properties, exhibitions, or arena shows touring in 2025-2026. Focus: ${queryFocus || 'Family entertainment, arena spectacles, and immersive exhibitions'}. Return ONLY a strict JSON array of objects with keys: "title", "category", "licensor", "producer", "person", "email", "website", "linkedin_url", "past_shows", "venue_fit", "brand_details", "notes". Doha venues: QNCC, DECC, Lusail Arena, Katara, Place Vendôme. Output raw JSON only.`;

            const models = ['gemini-flash-latest', 'gemini-3.5-flash-lite'];
            let aiJson = null;
            let lastErr = null;

            for (const model of models) {
              const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ role: 'user', parts: [{ text: prompt }] }]
                })
              });

              if (aiRes.ok) {
                aiJson = await aiRes.json();
                break;
              } else {
                const errBody = await aiRes.json().catch(() => ({}));
                lastErr = errBody.error?.message || `HTTP ${aiRes.status}`;
              }
            }

            if (!aiJson) {
              return new Response(JSON.stringify({ success: false, error: lastErr || 'Gemini API unavailable' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
              });
            }

            const rawText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
            let cleaned = rawText.trim().replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
            let parsed = [];
            try {
              parsed = JSON.parse(cleaned);
            } catch {
              const m = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
              if (m) parsed = JSON.parse(m[0]);
            }

            return new Response(JSON.stringify({ success: true, properties: parsed }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }
    }

    // 5. Fallback to static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
