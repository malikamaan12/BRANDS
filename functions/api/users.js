// Cloudflare Pages Function: /api/users
// Role-Based User Management & RBAC Provisioning backed by Neon Serverless PostgreSQL

import { neon } from '@neondatabase/serverless';

export async function onRequestGet(context) {
  const { env } = context;
  const dbUrl = env.DATABASE_URL;

  if (!dbUrl) {
    return new Response(JSON.stringify({ source: 'offline-local', users: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const sql = neon(dbUrl);

    // Ensure iphub_users table exists
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
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, users: [] }), {
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
    const body = await request.json();
    const { action, user, userId, newPassword } = body;
    const sql = neon(dbUrl);

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
