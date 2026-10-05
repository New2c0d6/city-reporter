-- Migration: Create status_history table
-- Purpose: Track status changes for audit trail
-- Created: 2026-10-05

CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_status_history_report_id ON status_history(report_id);
CREATE INDEX IF NOT EXISTS idx_status_history_timestamp ON status_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_by ON status_history(changed_by);

-- Add comments
COMMENT ON TABLE status_history IS 'Audit trail of report status changes';
COMMENT ON COLUMN status_history.changed_by IS 'User ID of who changed the status (NULL for system changes)';
