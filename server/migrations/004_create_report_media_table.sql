-- Migration: Create report_media table
-- Purpose: Store photos and videos attached to reports
-- Created: 2026-10-05

CREATE TABLE IF NOT EXISTS report_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('photo', 'video')),
  media_url VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for report lookups
CREATE INDEX IF NOT EXISTS idx_report_media_report_id ON report_media(report_id);
CREATE INDEX IF NOT EXISTS idx_report_media_type ON report_media(type);

-- Add comments
COMMENT ON TABLE report_media IS 'Photos and videos attached to reports (stored as S3 URLs)';
COMMENT ON COLUMN report_media.type IS 'Media type: photo or video';
COMMENT ON COLUMN report_media.media_url IS 'S3 URL to the media file';
