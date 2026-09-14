-- PostgreSQL Database Schema for EXPRO Compliance Fuel Reporting & Audit Trails

-- 1. Table for EXPRO Reports (Header info and aggregates)
CREATE TABLE IF NOT EXISTS expro_reports (
    id VARCHAR(50) PRIMARY KEY,
    biller_id VARCHAR(50) NOT NULL DEFAULT 'MOKA-001',
    report_period VARCHAR(100) NOT NULL,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_liters NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reference_id VARCHAR(100) UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'APPROVED', -- 'APPROVED', 'REJECTED', 'PENDING'
    xml_payload TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for individual Transactions attached to EXPRO Reports
CREATE TABLE IF NOT EXISTS expro_transactions (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(50) REFERENCES expro_reports(id) ON DELETE CASCADE,
    vehicle_id VARCHAR(50) NOT NULL,
    project_code VARCHAR(100) NOT NULL,
    cost_center VARCHAR(50) NOT NULL,
    fuel_liters NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(8, 2) NOT NULL DEFAULT 2.18,
    total_amount NUMERIC(12, 2) NOT NULL,
    vat_amount NUMERIC(12, 2) NOT NULL,
    total_with_vat NUMERIC(12, 2) NOT NULL,
    station_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    odometer_before INTEGER NOT NULL,
    odometer_after INTEGER NOT NULL,
    anomaly_flags JSONB DEFAULT '{}'::jsonb, -- Store flagging status: { isAnomaly, impossibleEfficiency, excessiveFueling24h, odometerDecrease, unapprovedStation }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for Sovereign Auditor Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'ACCESS_DASHBOARD', 'VIEW_XML', 'EXPORT_EXCEL', 'EXPORT_PDF', 'CRON_TRIGGER'
    details TEXT,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for high performance query resolution
CREATE INDEX IF NOT EXISTS idx_expro_reports_period ON expro_reports(report_period);
CREATE INDEX IF NOT EXISTS idx_expro_transactions_report ON expro_transactions(report_id);
CREATE INDEX IF NOT EXISTS idx_expro_transactions_vehicle ON expro_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expro_transactions_project ON expro_transactions(project_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
