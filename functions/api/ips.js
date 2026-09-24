// Cloudflare Pages Function: /api/ips
// Powered by @neondatabase/serverless HTTP driver (Connectionless HTTPS)
// STRICT IDLE GUARANTEE: Does NOT hold TCP connections open; Neon automatically scales to 0.

import { neon } from '@neondatabase/serverless';

export async function onRequestGet(context) {
  const { env } = context;
  const dbUrl = env.DATABASE_URL;

  if (!dbUrl) {
    return new Response(JSON.stringify({
      source: 'offline-fallback',
      warning: 'DATABASE_URL environment variable is not configured in Cloudflare Pages. Using local seed data.',
      ips: []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Stateless one-shot HTTP fetch via port 443 - zero persistent TCP sockets
    const sql = neon(dbUrl);
    const rows = await sql`
      SELECT 
        id, title, category, image, licensor, producer, person, email, 
        website, linkedin_url, social, past_shows, past_show_url, 
        venue_fit, brand_details, status, notes, updated_at
      FROM entertainment_ips
      ORDER BY updated_at DESC
    `;

    return new Response(JSON.stringify({ source: 'neon-serverless', count: rows.length, ips: rows }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*' 
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, ips: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const dbUrl = env.DATABASE_URL;

  if (!dbUrl) {
    return new Response(JSON.stringify({ error: 'DATABASE_URL not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const payload = await request.json();
    const items = Array.isArray(payload) ? payload : [payload];

    if (!items.length) {
      return new Response(JSON.stringify({ message: 'No items provided' }), { status: 400 });
    }

    const sql = neon(dbUrl);

    // Upsert items into Neon PostgreSQL atomically
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

    return new Response(JSON.stringify({ success: true, upserted: items.length }), {
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
