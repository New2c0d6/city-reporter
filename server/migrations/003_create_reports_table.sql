-- Migration: Create reports table
-- Purpose: Store civic issue reports from citizens
-- Created: 2026-10-05

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(20) UNIQUE NOT NULL,
  category_id SMALLINT NOT NULL REFERENCES categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW' 
    CHECK (status IN ('NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' 
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  
  -- Location data (stored as flat columns for simplicity)
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  location_timestamp TIMESTAMP,
  location_address VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_reference_number ON reports(reference_number);

-- Add comments
COMMENT ON TABLE reports IS 'Civic issue reports submitted by citizens';
COMMENT ON COLUMN reports.reference_number IS 'Human-readable reference (e.g., REP-2026-00001)';
COMMENT ON COLUMN reports.status IS 'Report workflow status';
COMMENT ON COLUMN reports.location_latitude IS 'Latitude of issue (WGS84)';
COMMENT ON COLUMN reports.location_longitude IS 'Longitude of issue (WGS84)';
