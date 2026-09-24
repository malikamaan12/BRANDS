-- =========================================================================
-- Neon Serverless PostgreSQL Schema: Doha Live Entertainment IP Hub
-- Design: Stateless, optimized for auto-suspend (zero idle compute cost)
-- =========================================================================

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
    venue_fit JSONB DEFAULT '[]'::jsonb,
    brand_details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) DEFAULT 'Prospect',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Optimize indexed lookups for filtering and category views
CREATE INDEX IF NOT EXISTS idx_ips_category ON entertainment_ips(category);
CREATE INDEX IF NOT EXISTS idx_ips_status ON entertainment_ips(status);
CREATE INDEX IF NOT EXISTS idx_ips_updated_at ON entertainment_ips(updated_at DESC);

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_ips_timestamp ON entertainment_ips;
CREATE TRIGGER trigger_update_ips_timestamp
    BEFORE UPDATE ON entertainment_ips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- Role-Based Access Control (RBAC) Users Table
-- =========================================================================
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

CREATE INDEX IF NOT EXISTS idx_users_email ON iphub_users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON iphub_users(role);

-- Seed initial E3 Administrator and Team Users
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


