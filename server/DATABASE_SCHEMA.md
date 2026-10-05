# Database Schema

## Overview

City Reporter uses PostgreSQL with 5 core tables, all created via migrations.

## Schema Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (UUID, PK)   │
│ email           │ ← unique
│ password_hash   │
│ name            │
│ created_at      │
│ updated_at      │
└─────────────────┘
         △
         │ (foreign key)
         │
┌─────────────────────────────────┐
│        status_history           │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ report_id (UUID, FK) ──────┐    │
│ old_status                 │    │
│ new_status                 │    │
│ changed_by (UUID, FK) ─────┤    │
│ timestamp                  │    │
└─────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼──────────┐    │    ┌──────────▼────────┐
    │   reports     │    │    │ report_media      │
    ├───────────────┤    │    ├───────────────────┤
    │ id (UUID, PK) │    │    │ id (UUID, PK)     │
    │ reference_no. │    │    │ report_id (FK) ◄──┤
    │ category_id ──┼────┤    │ type              │
    │ title         │    │    │ media_url         │
    │ description   │    │    │ created_at        │
    │ status        │    │    └───────────────────┘
    │ priority      │    │
    │ location_*    │    │
    │ created_at    │    │
    │ updated_at    │    │
    └───────────────┘    │
         △               │
         └───────────────┘
    (references)

┌──────────────────┐
│   categories     │
├──────────────────┤
│ id (SMALLINT, PK)│
│ name             │ ← unique
│ created_at       │
└──────────────────┘

┌──────────────────┐
│   migrations     │
├──────────────────┤
│ id (SERIAL, PK)  │
│ name             │ ← unique
│ executed_at      │
└──────────────────┘
```

## Tables

### users

Internal team user accounts for dashboard access.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| email | VARCHAR(255) | UNIQUE NOT NULL | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| name | VARCHAR(255) | | User display name |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_email` - For login lookups

**Example:**
```sql
INSERT INTO users (email, password_hash, name) 
VALUES ('john@example.com', '$2b$10$...', 'John Doe');
```

### categories

Report issue categories. Fixed set for MVP.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SMALLINT | PRIMARY KEY | Manual ID (1, 2, etc.) |
| name | VARCHAR(100) | UNIQUE NOT NULL | Category name |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Seeded Data:**
```
1 - Infrastructure
2 - Illegal Dumping
```

**Example:**
```sql
INSERT INTO categories (id, name) VALUES (1, 'Infrastructure');
```

### reports

Civic issue reports submitted by citizens.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| reference_number | VARCHAR(20) | UNIQUE NOT NULL | Human-readable (e.g., REP-2026-00001) |
| category_id | SMALLINT | FK → categories.id | Issue type |
| title | VARCHAR(255) | NOT NULL | Report title |
| description | TEXT | NOT NULL | Detailed description |
| status | VARCHAR(20) | CHECK, DEFAULT 'NEW' | NEW, IN_REVIEW, IN_PROGRESS, RESOLVED, CLOSED |
| priority | VARCHAR(10) | CHECK, DEFAULT 'MEDIUM' | LOW, MEDIUM, HIGH |
| location_latitude | DECIMAL(10,8) | | WGS84 latitude (nullable) |
| location_longitude | DECIMAL(11,8) | | WGS84 longitude (nullable) |
| location_accuracy | DECIMAL(10,2) | | Accuracy in meters (nullable) |
| location_timestamp | TIMESTAMP | | When location was captured (nullable) |
| location_address | VARCHAR(500) | | Street address if available (nullable) |
| created_at | TIMESTAMP | DEFAULT NOW() | Report submission time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_reports_status` - For dashboard filtering
- `idx_reports_created_at` - For timeline queries
- `idx_reports_category_id` - For category filtering
- `idx_reports_reference_number` - For lookups

**Example:**
```sql
INSERT INTO reports (
  reference_number, category_id, title, description, 
  status, location_latitude, location_longitude
) VALUES (
  'REP-2026-00001', 1, 'Pothole on Main St', 'Large pothole...',
  'NEW', 40.7128, -74.0060
);
```

### report_media

Photos and videos attached to reports (stored as S3 URLs).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| report_id | UUID | FK → reports.id, CASCADE | Reference to report |
| type | VARCHAR(10) | CHECK | 'photo' or 'video' |
| media_url | VARCHAR(1000) | NOT NULL | S3 URL to media |
| created_at | TIMESTAMP | DEFAULT NOW() | Upload time |

**Indexes:**
- `idx_report_media_report_id` - For report lookups
- `idx_report_media_type` - For media type filtering

**Example:**
```sql
INSERT INTO report_media (report_id, type, media_url) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'photo', 
  'https://bucket.s3.amazonaws.com/photo-1234.jpg');
```

### status_history

Audit trail of report status changes.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| report_id | UUID | FK → reports.id, CASCADE | Reference to report |
| old_status | VARCHAR(20) | | Previous status (NULL for initial) |
| new_status | VARCHAR(20) | NOT NULL | New status |
| changed_by | UUID | FK → users.id | User who made change (NULL for system) |
| timestamp | TIMESTAMP | DEFAULT NOW() | When change occurred |

**Indexes:**
- `idx_status_history_report_id` - For report history
- `idx_status_history_timestamp` - For timeline queries
- `idx_status_history_changed_by` - For user activity

**Example:**
```sql
INSERT INTO status_history (report_id, old_status, new_status, changed_by) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', 
  'NEW', 'IN_REVIEW', 
  '660e8400-e29b-41d4-a716-446655440001'
);
```

### migrations

Tracks which migration files have been executed.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PRIMARY KEY | Auto-increment |
| name | VARCHAR(255) | UNIQUE NOT NULL | Migration filename |
| executed_at | TIMESTAMP | DEFAULT NOW() | Execution time |

**Created automatically by migration runner.**

## Key Constraints

### Primary Keys
All user-facing records use `UUID` for security (prevents ID enumeration)

### Foreign Keys
- `reports.category_id` → `categories.id` (NOT NULL)
- `report_media.report_id` → `reports.id` (CASCADE delete)
- `status_history.report_id` → `reports.id` (CASCADE delete)
- `status_history.changed_by` → `users.id` (nullable, for system actions)

### Check Constraints
```sql
-- Report status values
CHECK (status IN ('NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))

-- Priority values
CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))

-- Media type values
CHECK (type IN ('photo', 'video'))
```

## Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| idx_users_email | users | email | Fast login lookups |
| idx_reports_status | reports | status | Dashboard filtering |
| idx_reports_created_at | reports | created_at DESC | Timeline queries |
| idx_reports_category_id | reports | category_id | Category filtering |
| idx_reports_reference_number | reports | reference_number | Lookup by ref# |
| idx_report_media_report_id | report_media | report_id | Find media by report |
| idx_report_media_type | report_media | type | Filter by media type |
| idx_status_history_report_id | status_history | report_id | Audit trail by report |
| idx_status_history_timestamp | status_history | timestamp DESC | Timeline queries |
| idx_status_history_changed_by | status_history | changed_by | User activity |

## Migrations

Migrations are applied in order:

1. **001_create_users_table.sql** - Internal user accounts
2. **002_create_categories_table.sql** - Issue categories + seed data
3. **003_create_reports_table.sql** - Civic issue reports
4. **004_create_report_media_table.sql** - Photos and videos
5. **005_create_status_history_table.sql** - Audit trail

Run with:
```bash
npm run migrate
```

## Data Integrity

### Referential Integrity
- Reports MUST reference a valid category
- Report media MUST reference a valid report
- Status history MUST reference a valid report
- Status history CAN reference a user (NULL for system actions)

### Cascading Deletes
If a report is deleted:
- All associated media is automatically deleted
- All associated status history is automatically deleted

### Constraints
- Email addresses are unique per user
- Reference numbers are globally unique
- Category names are unique
- Migration names are unique (prevents re-execution)

## Running Migrations

### Prerequisites

Ensure PostgreSQL Docker container is running:

```bash
# Start container if not already running
docker-compose up -d

# Verify it's running
docker ps | grep city-reporter-db
```

### For New Database

```bash
cd server
npm run migrate
```

Output:
```
🔄 Starting database migrations...

✓ Migrations table ready
Found 0 previously executed migrations

Running 5 pending migration(s):

  📝 001_create_users_table.sql...
     ✓ Success
  📝 002_create_categories_table.sql...
     ✓ Success
  📝 003_create_reports_table.sql...
     ✓ Success
  📝 004_create_report_media_table.sql...
     ✓ Success
  📝 005_create_status_history_table.sql...
     ✓ Success

✅ All migrations completed successfully!

Database schema created with:
  - users table (internal team)
  - categories table (Infrastructure, Illegal Dumping)
  - reports table (civic issues)
  - report_media table (photos/videos)
  - status_history table (audit trail)
```

### For Existing Database

Migrations that have already run are skipped automatically.

```bash
npm run migrate
```

Output:
```
🔄 Starting database migrations...

✓ Migrations table ready
Found 5 previously executed migrations

✅ Database is up to date! No migrations to run.
```

### Troubleshooting Migrations

If migrations fail:

```bash
# Check container is running
docker ps | grep city-reporter-db

# Check container logs
docker logs city-reporter-db

# Verify connection
docker exec city-reporter-db psql -U postgres -c "SELECT 1"

# Try running migrations again
npm run migrate
```

## Queries

### Common queries

```sql
-- Get all reports with status
SELECT reference_number, title, status, created_at 
FROM reports 
ORDER BY created_at DESC;

-- Get report with all media
SELECT r.*, m.media_url, m.type 
FROM reports r 
LEFT JOIN report_media m ON r.id = m.report_id 
WHERE r.id = $1;

-- Get report status history
SELECT u.name, sh.old_status, sh.new_status, sh.timestamp 
FROM status_history sh 
LEFT JOIN users u ON sh.changed_by = u.id 
WHERE sh.report_id = $1 
ORDER BY sh.timestamp;

-- Count reports by status
SELECT status, COUNT(*) 
FROM reports 
GROUP BY status;
```

## Next Steps

After migrations are run:

1. **Verify schema** (from Docker container):
   ```bash
   docker exec city-reporter-db psql -U postgres -d city_reporter -c "\dt"
   ```
   
2. **View table details**:
   ```bash
   docker exec city-reporter-db psql -U postgres -d city_reporter -c "\d reports"
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Begin implementing endpoints** (TASK-105+)

## Docker Database Management

### Viewing Data

```bash
# Connect to database in container
docker exec -it city-reporter-db psql -U postgres -d city_reporter

# Common queries
SELECT * FROM reports;
SELECT * FROM categories;
SELECT * FROM users;
```

### Backup and Restore

```bash
# Backup entire database
docker exec city-reporter-db pg_dump -U postgres city_reporter > backup.sql

# Restore from backup
docker exec -i city-reporter-db psql -U postgres city_reporter < backup.sql
```

### Reset Database

```bash
# Stop container
docker-compose down -v

# Start fresh (recreates all volumes)
docker-compose up -d

# Run migrations again
npm run migrate
```
