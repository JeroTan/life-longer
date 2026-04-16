-- schema.sql for LifeLonger (Cloudflare D1 / SQLite)

-- 1. Users Table (Tracks identity, credits, and storage limits)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    credits INTEGER DEFAULT 0,
    max_saved_analyses INTEGER DEFAULT 3, -- Freemium storage limit for saved analyses
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Biomarkers Table (The scientific reference data)
DROP TABLE IF EXISTS biomarkers;
CREATE TABLE biomarkers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    optimal_range TEXT,
    standard_range TEXT
);

-- 3. Master Interventions Table (The GRADE-assessed protocols)
DROP TABLE IF EXISTS interventions;
CREATE TABLE interventions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    grade_evidence TEXT NOT NULL,
    target_mechanism TEXT
);

-- 4. Relational Mapping (Links biomarkers to their proven interventions)
DROP TABLE IF EXISTS biomarker_interventions;
CREATE TABLE biomarker_interventions (
    biomarker_id INTEGER,
    intervention_id INTEGER,
    PRIMARY KEY (biomarker_id, intervention_id),
    FOREIGN KEY (biomarker_id) REFERENCES biomarkers(id) ON DELETE CASCADE,
    FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE CASCADE
);

-- 5. User Health Tracker (Where users log their actual bloodwork/wearable data)
DROP TABLE IF EXISTS user_biomarker_logs;
CREATE TABLE user_biomarker_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    biomarker_id INTEGER NOT NULL,
    recorded_value REAL NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (biomarker_id) REFERENCES biomarkers(id) ON DELETE CASCADE
);

-- 6. Saved Analyses (The freemium storage feature for users)
DROP TABLE IF EXISTS saved_analyses;
CREATE TABLE saved_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    analysis_data TEXT NOT NULL, -- Stores the JSON/text result of their L-II score and protocol plan
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Webhook Idempotency (Prevents Lemon Squeezy from double-crediting during retries)
DROP TABLE IF EXISTS processed_webhooks;
CREATE TABLE processed_webhooks (
    webhook_id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Credit Ledger (Immutable audit trail for financial/credit troubleshooting)
DROP TABLE IF EXISTS credit_ledger;
CREATE TABLE credit_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Positive for top-ups (e.g., +50), Negative for usage (e.g., -1)
    reason TEXT NOT NULL,    -- e.g., 'lemon_squeezy_purchase', 'biomarker_analysis', 'storage_upgrade'
    reference_id TEXT,       -- e.g., The Lemon Squeezy Order ID or Action ID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);