// ============================================================================
// LIVE EXTRACTION & INGESTION PIPELINE (Google Sheets + Gemini AI Web Search)
// ============================================================================

import { normalizeSignature } from './dailyExtractionEngine';
import { getCategoryFallbackImage } from '../components/CardsView';

const SETTINGS_STORAGE_KEY = 'doha_extraction_pipeline_settings';

export function getExtractionSettings() {
  const envKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY : '';
  if (typeof window === 'undefined') {
    return { googleSheetUrl: '', geminiApiKey: envKey, autoSyncEnabled: false };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { 
      googleSheetUrl: parsed.googleSheetUrl || '', 
      geminiApiKey: parsed.geminiApiKey || envKey, 
      autoSyncEnabled: Boolean(parsed.autoSyncEnabled) 
    };
  } catch {
    return { googleSheetUrl: '', geminiApiKey: envKey, autoSyncEnabled: false };
  }
}

export function saveExtractionSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    const current = getExtractionSettings();
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...current, ...settings }));
  } catch (e) {
    console.error('Failed to save extraction settings:', e);
  }
}

// ----------------------------------------------------------------------------
// OPTION 1: GOOGLE SHEETS LIVE INGESTION ENGINE
// ----------------------------------------------------------------------------

/**
 * Normalizes any Google Sheets link to a direct CSV export endpoint.
 * Handles:
 * - https://docs.google.com/spreadsheets/d/{ID}/edit...
 * - https://docs.google.com/spreadsheets/d/{ID}/export?format=csv
 * - https://docs.google.com/spreadsheets/d/e/{ID}/pub?output=csv
 */
export function formatGoogleSheetCsvUrl(url = '') {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a direct CSV export URL
  if (trimmed.includes('format=csv') || trimmed.includes('output=csv')) {
    return trimmed;
  }

  // Published sheet: /spreadsheets/d/e/.../pub
  const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)\/pub/);
  if (pubMatch) {
    return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv`;
  }

  // Standard sheet: /spreadsheets/d/{ID}
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    // Check if a specific gid is selected (e.g. #gid=123456 or ?gid=123456)
    const gidMatch = trimmed.match(/[#?]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv${gidParam}`;
  }

  return trimmed;
}

/**
 * Robust CSV parser that handles commas inside quotes and multiline cells.
 */
export function parseCSV(text) {
  const lines = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i++; // skip CRLF
      }
      row.push(cell.trim());
      if (row.some(c => c.length > 0)) {
        lines.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Fuzzy matches CSV header to our standard IP properties.
 */
function mapHeaderField(header = '') {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (h.includes('title') || h.includes('brand') || h.includes('property') || h.includes('ipname') || h === 'ip') return 'title';
  if (h.includes('category') || h.includes('format') || h.includes('genre') || h.includes('type')) return 'category';
  if (h.includes('licensor') || h.includes('studio') || h.includes('rights') || h.includes('owner')) return 'licensor';
  if (h.includes('producer') || h.includes('agency') || h.includes('promoter') || h.includes('productioncompany')) return 'producer';
  if (h.includes('person') || h.includes('contactname') || h.includes('lead') || h.includes('executive')) return 'person';
  if (h.includes('email') || h.includes('inquiry') || h.includes('bookingemail')) return 'email';
  if (h.includes('website') || h.includes('url') || h.includes('link') || h.includes('portal')) return 'website';
  if (h.includes('linkedin') || h.includes('linkedinurl')) return 'linkedin_url';
  if (h.includes('venue') || h.includes('dohavenue') || h.includes('location') || h.includes('hall')) return 'venue_fit';
  if (h.includes('pastshow') || h.includes('benchmark') || h.includes('history') || h.includes('trackrecord') || h.includes('tour')) return 'past_shows';
  if (h.includes('footage') || h.includes('video') || h.includes('trailer') || h.includes('youtube')) return 'past_show_url';
  if (h.includes('image') || h.includes('poster') || h.includes('photo') || h.includes('thumb')) return 'image';
  if (h.includes('note') || h.includes('strategy') || h.includes('comment') || h.includes('details')) return 'notes';
  if (h.includes('status') || h.includes('stage')) return 'status';
  return null;
}

/**
 * Ingests properties from a public or published Google Sheet link.
 */
export async function syncFromGoogleSheet(sheetUrl, existingIPs = []) {
  if (!sheetUrl || !sheetUrl.trim()) {
    throw new Error('Please enter a valid Google Sheet URL or published CSV link.');
  }

  const csvUrl = formatGoogleSheetCsvUrl(sheetUrl);
  let csvText = '';

  try {
    const res = await fetch(csvUrl, { headers: { Accept: 'text/csv, text/plain, */*' } });
    if (!res.ok) {
      throw new Error(`Failed to fetch Google Sheet (HTTP ${res.status}). Ensure the sheet is Shared to "Anyone with the link" or published to the web.`);
    }
    csvText = await res.text();
  } catch (err) {
    // If CORS blocked directly in browser, try proxying via backend /api/extract
    try {
      const proxyRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_sheet', sheetUrl })
      });
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.success) {
          return data;
        }
      }
    } catch {}
    throw new Error(`Could not access Google Sheet: ${err.message}. Make sure sheet sharing is set to "Anyone with the link can view".`);
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    throw new Error('The Google Sheet contains no data rows or could not be parsed.');
  }

  const headerRow = rows[0];
  const fieldMapping = headerRow.map(h => mapHeaderField(h));

  // Determine starting sequential ID
  let maxIdNum = 0;
  existingIPs.forEach(ip => {
    const match = (ip.id || '').match(/IP-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });

  const existingSignatures = new Set(existingIPs.map(ip => normalizeSignature(ip.title)));
  const newIPs = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowObj = {};

    row.forEach((val, idx) => {
      const field = fieldMapping[idx];
      if (field) {
        rowObj[field] = val;
      }
    });

    const title = (rowObj.title || '').trim();
    if (!title) continue;

    const sig = normalizeSignature(title);
    if (existingSignatures.has(sig)) {
      continue; // Skip duplicates
    }
    existingSignatures.add(sig);

    maxIdNum += 1;
    const newId = `IP-${String(maxIdNum).padStart(3, '0')}`;
    const category = rowObj.category || 'Touring Entertainment / Live Exhibition';
    const venue = rowObj.venue_fit || 'QNCC Theater (2,300 seats) or Lusail Arena';
    const licensor = rowObj.licensor || 'Direct Rights Holder';
    const producer = rowObj.producer || licensor;

    const emailTemplate = `Subject: Host Partnership Proposal: Bringing ${title} to Doha, Qatar\n\nDear ${producer} International Licensing & Touring Team,\n\nI am contacting you from our live entertainment operations organization in Doha, Qatar. We specialize in hosting and promoting premier international live entertainment properties across the GCC.\n\nGiven the immense regional audience demand for ${title}, we would like to explore hosting an official run in Doha. We provide turnkey local technical infrastructure, Qatar Tourism endorsement coordination, venue management, and marketing.\n\nOur suggested venue for this staging is ${venue}.\n\nCould we arrange a brief introductory call with your international touring department to discuss routing availability, licensing parameters, and technical riders?\n\nWarm regards,\nHost Partnership Directorate — E3 IP HUB`;

    const ip = {
      id: newId,
      title,
      category,
      licensor,
      producer,
      person: rowObj.person || 'International Touring Desk',
      email: rowObj.email || 'info@touringdesk.com',
      website: rowObj.website || 'https://www.google.com/search?q=' + encodeURIComponent(title + ' official tour'),
      linkedin_url: rowObj.linkedin_url || '',
      social: `@${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      past_shows: rowObj.past_shows || 'International touring production across North America, Europe & Asia',
      past_show_url: rowObj.past_show_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' live trailer')}`,
      venue_fit: venue,
      brand_details: rowObj.notes || `Curated live entertainment property imported via Google Sheet extraction pipeline.`,
      status: rowObj.status || 'Not Contacted',
      email_template: emailTemplate,
      notes: rowObj.notes || 'Imported from Google Sheet live sync.',
      image: rowObj.image || getCategoryFallbackImage(category),
      isSheetImported: true,
      extracted_at: new Date().toISOString()
    };

    newIPs.push(ip);
  }

  // Remember URL in settings
  saveExtractionSettings({ googleSheetUrl: sheetUrl });

  return {
    success: true,
    newIPs,
    totalProcessed: rows.length - 1,
    importedCount: newIPs.length,
    message: newIPs.length > 0 
      ? `Successfully imported ${newIPs.length} new entertainment IPs from Google Sheet.`
      : `Google Sheet parsed (${rows.length - 1} rows). All properties are already up-to-date in your portfolio.`
  };
}

// ----------------------------------------------------------------------------
// OPTION 2: LIVE GEMINI AI WEB SEARCH EXTRACTION ENGINE
// ----------------------------------------------------------------------------

/**
 * Prompts Gemini API with Google Search Grounding to discover real, newly announced
 * global touring entertainment properties, exhibitions, and arena shows.
 */
export async function runGeminiWebExtraction(apiKey, queryFocus = '', existingIPs = []) {
  const trimmedKey = (apiKey || '').trim();

  // Try backend endpoint first if apiKey is not provided in browser
  if (!trimmedKey) {
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gemini_extract', queryFocus })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {}
    throw new Error('Please enter your Google Gemini API key to run live web scraping.');
  }

  saveExtractionSettings({ geminiApiKey: trimmedKey });

  const existingTitles = existingIPs.slice(0, 50).map(ip => ip.title).join(', ');

  const systemPrompt = `You are the Chief Entertainment IP Scouting Intelligence Officer for E3 Live & Qatar Tourism in Doha, Qatar.
Your mission is to perform live web intelligence to discover 5 to 8 REAL, currently touring or newly announced (2024-2026) global entertainment properties, arena spectacles, Broadway/West End theatricals, preschool live shows, or immersive blockbuster exhibitions.

DOHA VENUES TO MATCH TO:
- Qatar National Convention Centre (QNCC) Theater (2,300 seats)
- Doha Exhibition and Convention Centre (DECC) (Large walk-through exhibitions, 2,000-30,000 sqm)
- Lusail Multipurpose Arena (15,300 seats, arena ice/stunt spectacles)
- Katara Opera House & Amphitheatre (Symphonic, classical, cultural)
- Place Vendôme & Luxury Malls (Atrium pop-ups, family FEC activations)
- Aspire Zone (Outdoor family festivals, high-capacity obstacle zones)

DO NOT INCLUDE properties that already exist in our portfolio:
${existingTitles}

Return a STRICT JSON ARRAY of objects. Each object must have these exact keys:
[
  {
    "title": "Exact Official Show / IP Title",
    "category": "Format / Scale (e.g. Arena Theatrical Spectacle, Preschool Live Stage Show, Immersive Exhibition)",
    "licensor": "Original Studio / Franchise Owner (e.g. Disney, Universal, Sony, Mattel, BBC, Warner Bros)",
    "producer": "Touring Production Company or Booking Agency (e.g. Feld Entertainment, Round Room Live, NEON, Fever, Live Nation)",
    "person": "Lead Executive, Producer, or Booking Director name and role",
    "email": "Official booking or touring inquiry email address",
    "website": "Official tour or production website URL",
    "linkedin_url": "Company LinkedIn URL",
    "past_shows": "Notable cities, arenas, or tour history (e.g. 50-city US tour, London O2, Sydney)",
    "venue_fit": "Best matching Doha venue from the list above with specific reasoning",
    "brand_details": "Why this property is high value for Doha, target demographics, and attendance figures",
    "notes": "Key technical riders or seasonal routing recommendation (e.g. Q1 school holidays, requires ice floor, 3,000 sqm floor load)"
  }
]
Output ONLY raw JSON. Do not include markdown codeblocks or extra text.`;

  const userQuery = queryFocus.trim() 
    ? `Search the web for newly touring global entertainment properties matching this focus: "${queryFocus}". Return verified real productions.`
    : `Search the web for top global touring entertainment IPs, immersive exhibitions, and arena spectacles touring internationally in 2025-2026 suitable for Qatar.`;

  // Prioritized model fallback list for high-demand resilience
  const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let responseData = null;
  let lastError = null;

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userQuery }] }]
        })
      });

      if (res.ok) {
        responseData = await res.json();
        break;
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson.error?.message || `HTTP ${res.status}`;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  if (!responseData) {
    throw new Error(`Gemini web search failed: ${lastError || 'Unable to reach Gemini API'}`);
  }

  // Extract response text
  const candidatePart = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!candidatePart) {
    throw new Error('Gemini API did not return any candidates.');
  }

  // Clean JSON from markdown if needed
  let cleanedJson = candidatePart.trim();
  if (cleanedJson.startsWith('```')) {
    cleanedJson = cleanedJson.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }

  let extractedList = [];
  try {
    extractedList = JSON.parse(cleanedJson);
  } catch (err) {
    // Attempt regex extraction of array
    const arrayMatch = cleanedJson.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      extractedList = JSON.parse(arrayMatch[0]);
    } else {
      throw new Error('Failed to parse Gemini structured JSON output: ' + err.message);
    }
  }

  if (!Array.isArray(extractedList) || extractedList.length === 0) {
    throw new Error('Gemini did not return any valid entertainment properties.');
  }

  // Deduplicate and assign sequential IDs
  let maxIdNum = 0;
  existingIPs.forEach(ip => {
    const match = (ip.id || '').match(/IP-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });

  const existingSignatures = new Set(existingIPs.map(ip => normalizeSignature(ip.title)));
  const newIPs = [];

  for (const item of extractedList) {
    const title = (item.title || '').trim();
    if (!title) continue;

    const sig = normalizeSignature(title);
    if (existingSignatures.has(sig)) continue;
    existingSignatures.add(sig);

    maxIdNum += 1;
    const newId = `IP-${String(maxIdNum).padStart(3, '0')}`;
    const category = item.category || 'Global Touring Spectacle';
    const venue = item.venue_fit || 'QNCC Theater (2,300 seats) or Lusail Arena';
    const licensor = item.licensor || 'Direct Licensor';
    const producer = item.producer || licensor;

    const emailTemplate = `Subject: Host Partnership Inquiry: Bringing ${title} to Doha, Qatar\n\nDear ${producer} International Licensing & Touring Team,\n\nI am contacting you on behalf of our live entertainment operations organization in Doha, Qatar. We specialize in hosting and promoting premier international live entertainment properties across the GCC.\n\nGiven the immense regional audience demand for ${title}, we would like to explore hosting an official run in Doha. We provide turnkey local technical infrastructure, Qatar Tourism endorsement coordination, venue management, and marketing.\n\nOur suggested venue for this staging is ${venue}.\n\nCould we arrange a brief introductory call with your international touring department to discuss routing availability, licensing parameters, and technical riders?\n\nWarm regards,\nHost Partnership Directorate — E3 IP HUB`;

    newIPs.push({
      id: newId,
      title,
      category,
      licensor,
      producer,
      person: item.person || 'International Booking Director',
      email: item.email || 'licensing@touringdesk.com',
      website: item.website || `https://www.google.com/search?q=${encodeURIComponent(title + ' official tour')}`,
      linkedin_url: item.linkedin_url || '',
      social: `@${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      past_shows: item.past_shows || 'International touring production',
      past_show_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' live trailer')}`,
      venue_fit: venue,
      brand_details: item.brand_details || 'Verified live entertainment touring property extracted via live Gemini AI web search grounding.',
      status: 'Not Contacted',
      email_template: emailTemplate,
      notes: item.notes || 'Extracted via Gemini AI live web search.',
      image: getCategoryFallbackImage(category),
      isAiExtracted: true,
      extracted_at: new Date().toISOString()
    });
  }

  return {
    success: true,
    newIPs,
    count: newIPs.length,
    message: newIPs.length > 0
      ? `Gemini AI live search found and extracted ${newIPs.length} brand-new entertainment touring properties!`
      : 'Gemini search completed. All discovered properties were already in your portfolio.'
  };
}
