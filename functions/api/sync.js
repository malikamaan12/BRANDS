// Cloudflare Pages Function: /api/sync
// Batch synchronize local client items with Neon Serverless Postgres
// STRICT IDLE GUARANTEE: Ephemeral execution terminates immediately, allowing Neon to auto-suspend.

import { neon } from '@neondatabase/serverless';

export async function onRequestPost(context) {
  const { request, env } = context;
  const dbUrl = env.DATABASE_URL;

  if (!dbUrl) {
    return new Response(JSON.stringify({ 
      source: 'offline-local',
      message: 'Cloudflare Pages DATABASE_URL is not set. Operating in offline/local cache mode.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { items = [] } = await request.json();
    const sql = neon(dbUrl);

    // 1. Fetch remote count
    const [{ count }] = await sql`SELECT count(*)::int FROM entertainment_ips`;

    // 2. If remote database is empty and items were provided, seed the table in batch
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

    // 3. Fetch all active rows to sync back to client
    const remoteIps = await sql`
      SELECT 
        id, title, category, image, licensor, producer, person, email, 
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

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
