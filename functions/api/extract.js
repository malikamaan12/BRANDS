// Cloudflare Pages Function: /api/extract
// Automated IP Extraction Endpoint (Google Sheets CSV Sync & Gemini AI Web Search Grounding)

import { neon } from '@neondatabase/serverless';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const dbUrl = env.DATABASE_URL;
  const geminiKey = env.GEMINI_API_KEY;

  try {
    const body = await request.json();
    const { action, sheetUrl, apiKey, queryFocus, items = [] } = body;

    // Helper: Normalize signature
    const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

    // ------------------------------------------------------------------------
    // ACTION 1: Direct Batch Ingestion of Client-Extracted IPs
    // ------------------------------------------------------------------------
    if (action === 'save_batch' && Array.isArray(items) && items.length > 0) {
      if (!dbUrl) {
        return new Response(JSON.stringify({ success: true, saved: items.length, note: 'Saved client-side' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const sql = neon(dbUrl);
      let inserted = 0;

      for (const ip of items) {
        const venueStr = typeof ip.venue_fit === 'string' ? ip.venue_fit : (Array.isArray(ip.venue_fit) ? ip.venue_fit.join(', ') : '');
        await sql`
          INSERT INTO entertainment_ips (
            id, title, category, image, licensor, producer, person, email,
            website, linkedin_url, social, past_shows, past_show_url,
            venue_fit, brand_details, status, email_template, notes, updated_at
          ) VALUES (
            ${ip.id},
            ${ip.title || ''},
            ${ip.category || 'Touring Entertainment'},
            ${ip.image || ''},
            ${ip.licensor || ''},
            ${ip.producer || ''},
            ${ip.person || ''},
            ${ip.email || ''},
            ${ip.website || ''},
            ${ip.linkedin_url || ''},
            ${ip.social || ''},
            ${ip.past_shows || ''},
            ${ip.past_show_url || ''},
            ${venueStr},
            ${JSON.stringify(ip.brand_details || {})}::jsonb,
            ${ip.status || 'Not Contacted'},
            ${ip.email_template || ''},
            ${ip.notes || ''},
            NOW()
          ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            category = EXCLUDED.category,
            licensor = EXCLUDED.licensor,
            producer = EXCLUDED.producer,
            updated_at = NOW();
        `;
        inserted++;
      }

      return new Response(JSON.stringify({ success: true, inserted }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // ------------------------------------------------------------------------
    // ACTION 2: Proxy Fetch Google Sheet CSV
    // ------------------------------------------------------------------------
    if (action === 'sync_sheet' && sheetUrl) {
      let targetCsv = sheetUrl.trim();
      const idMatch = targetCsv.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (idMatch && !targetCsv.includes('export?format=csv')) {
        targetCsv = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
      }

      const sheetRes = await fetch(targetCsv, {
        headers: { Accept: 'text/csv, text/plain, */*' }
      });

      if (!sheetRes.ok) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Google Sheets returned HTTP ${sheetRes.status}. Ensure the document sharing is set to "Anyone with the link can view".` 
        }), {
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

    // ------------------------------------------------------------------------
    // ACTION 3: Server-Side Gemini AI Web Search Crawling
    // ------------------------------------------------------------------------
    if (action === 'gemini_extract') {
      const activeKey = apiKey || geminiKey;
      if (!activeKey) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'GEMINI_API_KEY is not configured on Cloudflare or provided by client.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const prompt = `You are a premier entertainment intelligence scout for Qatar Tourism & Doha live event promoters.
Search the live web for 5 REAL, active international touring productions, arena stunt spectacles, immersive exhibitions, or Broadway/West End stage shows touring in 2025-2026.
Focus: ${queryFocus || 'Premier family entertainment, arena spectacles, and immersive exhibitions'}.

CRITICAL ANTI-DUPLICATION RULE:
DO NOT INCLUDE any property or franchise that already exists in our portfolio:
Disney On Ice, PAW Patrol, Harry Potter, Jurassic World, Cirque du Soleil, Monster Jam, Peppa Pig, Blippi, CoComelon, Marvel, Pixar, Bluey, Monopoly, Hot Wheels, Crayola, Transformers, Sesame Street, Smurfs, Minecraft, Barbie, LEGO, Sonic, Pokemon, Dora, Care Bears, Play-Doh.

Return ONLY a strict JSON array of objects with keys:
"title", "category", "licensor", "producer", "person", "email", "website", "linkedin_url", "past_shows", "venue_fit", "brand_details", "notes"

Doha Venues to match: QNCC Theater, DECC Exhibition Halls, Lusail Multipurpose Arena, Katara Opera House, Place Vendôme Atrium.
Do NOT include markdown backticks or commentary. Only raw JSON.`;

      const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-lite-latest'];
      let aiJson = null;
      let lastErr = null;

      for (const model of models) {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
        const aiRes = await fetch(geminiEndpoint, {
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
        return new Response(JSON.stringify({ 
          success: false, 
          error: lastErr || 'Failed to query Gemini API' 
        }), {
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

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
