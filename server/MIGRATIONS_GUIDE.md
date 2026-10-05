# Migration Guide

## Overview

City Reporter uses SQL-based migrations to manage database schema. All migrations are version-controlled and run in order.

## Migration Files

Located in `server/migrations/`:

```
migrations/
├── 001_create_users_table.sql
├── 002_create_categories_table.sql
├── 003_create_reports_table.sql
├── 004_create_report_media_table.sql
└── 005_create_status_history_table.sql
```

## Running Migrations

### Prerequisites

1. PostgreSQL installed and running
2. Database created: `createdb -U postgres city_reporter`
3. CONNECTION_URL set in `.env`

### Run All Migrations

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

### Validate Schema

After migrations, validate the schema:

```bash
npm run db:validate
```

Output:
```
🔍 Validating database schema...

1️⃣  Checking tables exist:
   ✓ users
   ✓ categories
   ✓ reports
   ✓ report_media
   ✓ status_history

2️⃣  Checking data:
   users: 0 rows
   categories: 2 rows
   reports: 0 rows
   report_media: 0 rows
   status_history: 0 rows

3️⃣  Checking categories are seeded:
   1: Infrastructure
   2: Illegal Dumping

4️⃣  Checking indexes created:
   11 indexes found:
   ✓ idx_reports_category_id
   ✓ idx_reports_created_at
   ...

✅ Schema validation passed!

Next steps:
  npm run dev         (start the server)
```

## How Migrations Work

### Migration Runner

`src/db/migrate.ts` is the migration executor:

1. Creates `migrations` table (if needed)
2. Reads all `.sql` files from `migrations/`
3. Queries `migrations` table for already-executed migrations
4. Executes only pending migrations
5. Records each migration as executed

### Idempotency

Migrations are **idempotent** - safe to run multiple times:

```sql
-- Uses IF NOT EXISTS, so re-running is safe
CREATE TABLE IF NOT EXISTS users (...)

-- Uses ON CONFLICT to prevent duplicates
INSERT INTO categories (id, name) VALUES (1, 'Infrastructure')
ON CONFLICT (id) DO NOTHING;
```

## Migration Order & Dependencies

Migrations must run in order due to foreign key dependencies:

```
1. users                     (no dependencies)
2. categories                (no dependencies)
3. reports                   (depends on categories)
4. report_media              (depends on reports)
5. status_history            (depends on reports, users)
```

The runner sorts files alphabetically and executes them sequentially.

## Schema Changes

### To Add a New Table

1. Create `006_create_new_table.sql` in `migrations/`
2. Run `npm run migrate`

Example:
```sql
-- migrations/006_create_comments_table.sql
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_report_id ON comments(report_id);
```

### To Add a Column

1. Create a new migration file
2. Use `ALTER TABLE` to add the column

```sql
-- migrations/007_add_resolved_by_to_reports.sql
ALTER TABLE reports ADD COLUMN resolved_by UUID REFERENCES users(id);
ALTER TABLE reports ADD COLUMN resolved_at TIMESTAMP;
```

### To Modify a Column

1. Create a new migration file
2. Use `ALTER TABLE` with appropriate changes

```sql
-- migrations/008_increase_title_length.sql
ALTER TABLE reports ALTER COLUMN title TYPE VARCHAR(500);
```

### To Add an Index

```sql
-- migrations/009_add_category_index.sql
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
```

## Important Rules

### Do's

✅ Use `IF NOT EXISTS` for CREATE TABLE/INDEX  
✅ Use `ON CONFLICT DO NOTHING` for seed data  
✅ Add comments explaining the migration purpose  
✅ Keep migrations focused and small  
✅ Test migrations locally before deploying  
✅ Use numbered filenames in order (001, 002, etc.)  
✅ Make migrations idempotent (safe to run twice)  

### Don'ts

❌ Modify or rename existing migration files  
❌ Delete migration files (if needed, create a rollback migration)  
❌ Run migrations manually with `psql` (always use the runner)  
❌ Use DDL without IF EXISTS checks (unless you know it's new)  
❌ Create migrations that depend on non-existent tables  
❌ Use transactions (pg doesn't support transactional DDL)  

## Environment Variables

Migrations read from `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/city_reporter
NODE_ENV=development
```

## Troubleshooting

### "Migration already exists but not tracked"

**Problem:** Manually created tables/indexes before migration system existed

**Solution:**
1. Add them to a new migration file
2. Add their names to migrations table manually
3. Run `npm run migrate` again

```sql
-- Manually register already-executed migration:
INSERT INTO migrations (name) VALUES ('001_create_users_table.sql');
```

### "Foreign key constraint violation"

**Problem:** Migration tried to create constraint before referenced table

**Solution:**
- Check migration order
- Ensure dependencies are created first
- User created before reports in order

### "Column already exists"

**Problem:** Ran same migration twice or duplicate columns

**Solution:**
- Use `IF NOT EXISTS` in all CREATE statements
- Use `ON CONFLICT` for inserts

```sql
-- Good - won't error if table exists
CREATE TABLE IF NOT EXISTS users (...);

-- Bad - will error if table already exists
CREATE TABLE users (...);
```

### "Index name already exists"

**Problem:** Creating index with duplicate name

**Solution:**
- Use `IF NOT EXISTS` in CREATE INDEX
- Use unique index names

```sql
-- Good
CREATE INDEX IF NOT EXISTS idx_unique_name ON table(column);

-- Bad - will error if index exists
CREATE INDEX idx_name ON table(column);
```

## Production Considerations

### Before Deploying Migrations to Production

1. **Test locally**
   ```bash
   npm run db:test
   npm run migrate
   npm run db:validate
   ```

2. **Backup database**
   ```bash
   pg_dump -U postgres city_reporter > backup.sql
   ```

3. **Review migrations**
   - Check all files are correct
   - Verify no data loss

4. **Schedule downtime** (if needed)
   - For large schema changes
   - For data migrations

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Validate**
   ```bash
   npm run db:validate
   ```

### Backup Strategy

Always backup before migrations:

```bash
# Full database backup
pg_dump city_reporter > backup-$(date +%s).sql

# Tables only
pg_dump -t users -t reports city_reporter > tables-backup.sql

# Restore from backup
psql city_reporter < backup.sql
```

### Rollback (If Needed)

Rollback is manual - create a new migration file:

```sql
-- migrations/999_rollback_failed_migration.sql
-- Undo changes from migration 008

DROP COLUMN resolved_by FROM reports;
DROP COLUMN resolved_at FROM reports;
```

Then run:
```bash
npm run migrate
```

## Development Workflow

### When Adding Features

1. Check what tables/columns you need
2. Create a new migration file
3. Run locally:
   ```bash
   npm run migrate
   npm run db:validate
   ```
4. Test the feature
5. Commit migration file

### When Collaborating

If another developer adds migrations:

1. Pull latest code
2. Run migrations:
   ```bash
   npm run migrate
   ```
3. Validate:
   ```bash
   npm run db:validate
   ```
4. Continue development

## Performance Considerations

### When to Add Indexes

Add indexes for columns that are:
- Frequently filtered (WHERE clauses)
- Frequently joined (ON clauses)
- Frequently sorted (ORDER BY clauses)

```sql
-- Good - status is filtered often
CREATE INDEX idx_reports_status ON reports(status);

-- Good - created_at is sorted often
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Avoid - rarely used column
-- Don't index every column
```

### Foreign Key Indexes

PostgreSQL automatically indexes foreign key columns for performance.

## Getting Help

### Check Migration Status

```bash
# Connect to database
psql -U postgres city_reporter

# List migrations executed
SELECT * FROM migrations ORDER BY executed_at;

# Check tables exist
\dt

# Check indexes
\di
```

### Review Migration Files

```bash
# View all migration files
ls -la server/migrations/

# View specific migration
cat server/migrations/003_create_reports_table.sql
```

## Next Steps

After migrations are successful:

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Verify endpoints:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Proceed to TASK-105:**
   - Implement API endpoints
   - Integrate with frontend
