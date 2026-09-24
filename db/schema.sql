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
