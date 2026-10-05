-- Migration: Create categories table
-- Purpose: Store report issue categories
-- Created: 2026-10-05

CREATE TABLE IF NOT EXISTS categories (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial categories
INSERT INTO categories (id, name) VALUES 
  (1, 'Infrastructure'),
  (2, 'Illegal Dumping')
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE categories IS 'Report issue categories';
