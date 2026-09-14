-- ====================================================================
-- PostgreSQL Schema for Security Logs and Audit Trails
-- Engineered for MOKA SIEM (Wazuh/Splunk) Integration & NCA Compliance
-- ====================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Audit Trail Table
-- Tracks sovereign actions, edits, downloads, and exports (e.g., ZATCA compliance, Expro files)
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- EXPORT, UPDATE, DELETE, VIEW, FORCE_BYPASS
    resource VARCHAR(150) NOT NULL, -- Table name, document, or API route
    details TEXT NOT NULL, -- Detailed description (e.g., "Exported 1500 records of KSA transactions")
    ip_address VARCHAR(45) NOT NULL, -- Supports IPv4 and IPv6
    device_info VARCHAR(255) NOT NULL, -- Browser User-Agent, mobile app serial, or terminal ID
    region VARCHAR(5) DEFAULT 'SA', -- SA or SD
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast SIEM queries and compliance reporting
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_trail(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_region ON audit_trail(region);


-- Create Security Logs Table
-- Tracks failed logins, rate limit breaches, validation errors, and SOC-related security alarms
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- FAILED_LOGIN, RATE_LIMIT_EXCEEDED, XSS_ATTEMPT, INJECTION_ATTEMPT, CSRF_MISMATCH, FILE_SCAN_FAILED
    severity VARCHAR(20) NOT NULL, -- INFO, WARNING, HIGH, CRITICAL
    source_ip VARCHAR(45) NOT NULL, -- Inbound attacker or user IP
    user_identifier VARCHAR(100), -- Input email or username (if applicable)
    payload TEXT, -- Request body snapshot, metadata, or file properties
    mitigation_action VARCHAR(255), -- Action taken (e.g., "IP Blocked", "Session Terminated", "File Deleted")
    alert_soc BOOLEAN DEFAULT FALSE, -- True if escalated to SOC (Wazuh/Splunk alert generated)
    region VARCHAR(5) DEFAULT 'SA',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for rapid SOC alerts and anomaly detection
CREATE INDEX IF NOT EXISTS idx_security_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_source_ip ON security_logs(source_ip);
CREATE INDEX IF NOT EXISTS idx_security_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_alert_soc ON security_logs(alert_soc);
CREATE INDEX IF NOT EXISTS idx_security_user_identifier ON security_logs(user_identifier);
