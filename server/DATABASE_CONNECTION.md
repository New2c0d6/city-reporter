# Database Connection Setup

## Current Status

The database connection infrastructure is ready. PostgreSQL runs in a Docker container for easy local development.

## Quick Start with Docker

### Step 1: Start PostgreSQL Container

**Option A: Using docker run:**
```bash
docker run -d \
  --name city-reporter-db \
  -e POSTGRES_DB=city_reporter \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

**Option B: Using docker-compose (recommended):**

Create `docker-compose.yml` in project root:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: city-reporter-db
    environment:
      POSTGRES_DB: city_reporter
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Then start:
```bash
docker-compose up -d
```

### Step 2: Verify PostgreSQL is Running

```bash
# Check container status
docker ps | grep city-reporter-db

# Test connection with docker exec
docker exec city-reporter-db psql -U postgres -c "SELECT 1"

# Should output:
# ?column?
# ----------
#        1
```

### Step 3: Initialize Database

```bash
cd server

# Copy .env.example to .env and update DATABASE_URL if needed
cp .env.example .env

# Test the connection
npm run db:test

# Should output: ✅ All database tests passed!
```

### Step 4: Create Database and Schema

Database is already created during container startup. Just run migrations:
```bash
# Run migrations to create tables
npm run migrate
```

## Connection String Format

The application expects a PostgreSQL connection string in the `.env` file:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

### Default (Development)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/city_reporter
```

### Custom User

```
# Create custom user first:
psql -U postgres -c "CREATE USER city_reporter_user WITH PASSWORD 'mypassword';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE city_reporter TO city_reporter_user;"

# Then use in .env:
DATABASE_URL=postgresql://city_reporter_user:mypassword@localhost:5432/city_reporter
```

### Docker

If using Docker:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/city_reporter
```

## Connection Pool Configuration

The app uses a connection pool with these defaults (in `src/db/connection.ts`):

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,           // Maximum connections
  min: 2,            // Minimum connections
  idleTimeoutMillis: 30000,      // Close idle connections after 30s
  connectionTimeoutMillis: 2000,  // Timeout connecting after 2s
});
```

Adjust these values in `src/db/connection.ts` if needed.

## Testing the Connection

### Run Connection Test

```bash
npm run db:test
```

Output if successful:
```
🔍 Testing database connection...

1️⃣  Testing basic connection...
✓ Connection successful

2️⃣  Checking PostgreSQL version...
✓ PostgreSQL 15.2 on x86_64-pc-linux-gnu...

3️⃣  Checking existing tables...
ℹ️  No tables found (expected before running migrations)

4️⃣  Connection pool status:
  Pool configured: min=2, max=10
  Idle timeout: 30s
  Connection timeout: 2s

✅ All database tests passed!

Next steps:
  npm run migrate    (to create database schema)
```

### Run Dev Server with DB

```bash
npm run dev
```

Visit health check endpoint:
```bash
curl http://localhost:3000/health
```

Success response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## Troubleshooting

### "connect ECONNREFUSED 127.0.0.1:5432"

**Problem:** PostgreSQL container is not running

**Solution:**
```bash
# Check if container exists and its status
docker ps -a | grep city-reporter-db

# Start the container
docker start city-reporter-db

# Or with docker-compose
docker-compose up -d

# Verify it's running
docker exec city-reporter-db psql -U postgres -c "SELECT 1"
```

### "No such container"

**Problem:** Docker container doesn't exist

**Solution:**
```bash
# Create and start the container
docker run -d \
  --name city-reporter-db \
  -e POSTGRES_DB=city_reporter \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Or use docker-compose
docker-compose up -d
```

### "Port 5432 is already allocated"

**Problem:** Another container or service is using port 5432

**Solution:**
```bash
# Option 1: Stop the other container
docker stop <other-container-name>

# Option 2: Use a different port in docker-compose.yml
ports:
  - "5433:5432"  # Map to 5433 instead
# And update DATABASE_URL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/city_reporter

# Option 3: Find what's using the port
lsof -i :5432  # On Linux/Mac
netstat -ano | findstr :5432  # On Windows
```

### "database "city_reporter" does not exist"

**Problem:** Database hasn't been created yet

**Solution:**
The database is created automatically when the container starts. If this error persists:
```bash
# Check container logs
docker logs city-reporter-db

# Restart the container
docker restart city-reporter-db

# Then run migrations
npm run migrate
```

### Connection timeout

**Problem:** Connection hangs or times out

**Solution:**
1. Verify container is running: `docker ps | grep city-reporter-db`
2. Check logs: `docker logs city-reporter-db`
3. Verify DATABASE_URL is correct: `postgresql://postgres:postgres@localhost:5432/city_reporter`
4. Test connection: `docker exec city-reporter-db psql -U postgres -c "SELECT 1"`
5. If using custom port, update DATABASE_URL accordingly
6. Increase timeoutMillis in `src/db/connection.ts`

### "Could not connect to server"

**Problem:** Network connectivity issue between app and container

**Solution:**
```bash
# Ensure container is running and healthy
docker ps city-reporter-db
docker inspect city-reporter-db | grep -A 5 Healthcheck

# If not healthy, restart it
docker restart city-reporter-db

# If on Windows/Mac Docker Desktop, ensure port forwarding is working
# (should be automatic, but check Docker Desktop settings)
```

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/city_reporter

# Auth
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3 (for later)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=city-reporter

# CORS
CORS_ORIGIN=http://localhost:8081
```

## Managing Your Docker Database

### Common Commands

```bash
# View container status
docker ps -a | grep city-reporter-db

# View logs
docker logs city-reporter-db
docker logs -f city-reporter-db  # Follow logs

# Restart container
docker restart city-reporter-db

# Stop container
docker stop city-reporter-db

# Remove container (warning: data is lost)
docker rm city-reporter-db

# Backup database
docker exec city-reporter-db pg_dump -U postgres city_reporter > backup.sql

# Restore from backup
docker exec -i city-reporter-db psql -U postgres city_reporter < backup.sql
```

## Next Steps

Once the database is connected and tested:

1. **Run Migrations** (TASK-104):
   ```bash
   npm run migrate
   ```
   This creates all tables: users, reports, categories, report_media, status_history

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Verify API Endpoints**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/categories
   ```

## Database Schema

Once migrations run, the database will have:

```
Tables:
- users               (internal team users)
- categories         (Infrastructure, Illegal Dumping)
- reports            (civic reports)
- report_media       (photos/videos attached to reports)
- status_history     (audit trail of status changes)
- migrations         (tracks which migrations have run)

Indexes:
- idx_reports_status
- idx_reports_created_at
- idx_report_media_report_id
- idx_status_history_report_id
```

See `DATABASE_SCHEMA.md` for full schema details.

## Production Setup

For production environments, see `DATABASE_SETUP.md` for:
- Using managed services (AWS RDS, Azure Database, etc.)
- SSL/TLS connections
- Connection pooling services
- Backup strategies
- Monitoring and maintenance
