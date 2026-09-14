-- MOKA Fleet Platform - Secure Fraud Database Schema
-- Optimized for PostgreSQL and prepared for training XGBoost models.

-- Table 1: Fraud Scores Summary (Stores final evaluation outputs and decision)
CREATE TABLE IF NOT EXISTS fraud_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255) NOT NULL,
    driver_id VARCHAR(255) NOT NULL,
    vehicle_id VARCHAR(255) NOT NULL,
    station_id VARCHAR(255) NOT NULL,
    liters_requested NUMERIC(10, 2) NOT NULL,
    final_score INT NOT NULL CHECK (final_score BETWEEN 0 AND 100),
    decision VARCHAR(50) NOT NULL, -- 'ALLOW', 'FLAG_REVIEW', 'BLOCK_AND_LOCK'
    ml_probability NUMERIC(5, 4) DEFAULT 0.0, -- XGBoost prediction output probability [0, 1]
    time_of_day TIME NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1: Monday, 7: Sunday
    vehicle_age_years INT NOT NULL,
    is_fraud BOOLEAN DEFAULT FALSE, -- Correct label (set during audit/dispute resolution)
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Detailed Fraud Logs (Immutable audit trail for individual rules)
CREATE TABLE IF NOT EXISTS fraud_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fraud_score_id UUID REFERENCES fraud_scores(id) ON DELETE CASCADE,
    rule_id VARCHAR(100) NOT NULL, -- e.g. 'VOLUME_MISMATCH', 'DUPLICATE_PHOTO'
    result VARCHAR(50) NOT NULL,    -- 'TRIGGERED' or 'PASSED'
    score_contribution INT NOT NULL,
    details TEXT,                    -- JSON/Text breakdown of variables compared
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Photo Hash Key-Value Store (Simulating Redis cache with TTL)
CREATE TABLE IF NOT EXISTS photo_hashes (
    photo_hash VARCHAR(64) PRIMARY KEY, -- SHA-256 Hash
    transaction_id VARCHAR(255) NOT NULL,
    driver_id VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- Indexes for lightning-fast queries and high throughput streaming
CREATE INDEX IF NOT EXISTS idx_fraud_scores_driver ON fraud_scores(driver_id);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_vehicle ON fraud_scores(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_transaction ON fraud_scores(transaction_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_score_id ON fraud_logs(fraud_score_id);
CREATE INDEX IF NOT EXISTS idx_photo_hashes_expires ON photo_hashes(expires_at);

-- Cleanup function to purge expired photo hashes (equivalent to Redis TTL eviction)
CREATE OR REPLACE FUNCTION purge_expired_hashes() RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    DELETE FROM photo_hashes WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
