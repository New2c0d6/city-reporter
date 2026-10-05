# Database Setup Guide

## Overview

City Reporter uses PostgreSQL as the primary database. This guide explains how to set up PostgreSQL using Docker for local development.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+

## Local Development Setup with Docker

### 1. Start PostgreSQL Container

Using Docker, start a PostgreSQL container:

```bash
docker run -d \
  --name city-reporter-db \
  -e POSTGRES_DB=city_reporter \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

Or use Docker Compose for easier management. Create a `docker-compose.yml` in your project root:

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

Start with Docker Compose:
```bash
docker-compose up -d
```

### 2. Verify PostgreSQL is Running

```bash
# Check container is running
docker ps | grep city-reporter-db

# Test connection
docker exec city-reporter-db psql -U postgres -c "SELECT 1"

# Or from your host machine (if psql is installed)
psql -U postgres -h localhost -c "SELECT 1"
```

### 3. Configure Connection String

Update `.env` in the server directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/city_reporter
```

### 4. Verify Connection

Run the health check:
```bash
cd server
npm run dev

# In another terminal:
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 5. Run Migrations

Once database is connected, initialize the schema:
```bash
npm run migrate
```

This will:
- Create all tables (users, reports, categories, report_media, status_history)
- Create indexes
- Insert default categories (Infrastructure, Illegal Dumping)

## Connection Pool Configuration

The application uses a connection pool with:
- **min**: 2 connections
- **max**: 10 connections
- **idleTimeoutMillis**: 30 seconds
- **connectionTimeoutMillis**: 2 seconds

Adjust in `src/db/connection.ts` if needed for your environment.

## Troubleshooting

### "Cannot connect to database"

1. Verify PostgreSQL container is running:
   ```bash
   docker ps | grep city-reporter-db
   ```

2. Check container health:
   ```bash
   docker logs city-reporter-db
   ```

3. Verify DATABASE_URL is correct:
   ```bash
   # The URL format is:
   postgresql://[user]:[password]@[host]:[port]/[database]
   # Docker default:
   postgresql://postgres:postgres@localhost:5432/city_reporter
   ```

4. Test connection directly:
   ```bash
   docker exec city-reporter-db psql -U postgres -c "SELECT 1"
   ```

### "ECONNREFUSED"

PostgreSQL container is not running. Start it:
```bash
# Using docker run
docker start city-reporter-db

# Using docker-compose
docker-compose up -d

# Verify it's running
docker ps | grep city-reporter-db
```

### "No such container"

Container doesn't exist. Create and start it:
```bash
# With docker run
docker run -d \
  --name city-reporter-db \
  -e POSTGRES_DB=city_reporter \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Or with docker-compose
docker-compose up -d
```

### "port is already allocated"

Port 5432 is in use. Either:
```bash
# Stop the existing container
docker stop city-reporter-db

# Or use a different port in docker-compose.yml
ports:
  - "5433:5432"  # Map to 5433 instead
# And update DATABASE_URL to use port 5433
```

### Connection pool timeout

If getting "Client was not acquired" errors, the connection pool may be exhausted. This usually means:
- Too many open connections
- Slow queries keeping connections open
- Database is slow to respond

Check `src/db/connection.ts` and increase pool size if needed.

## Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| NODE_ENV | No | development | Set to 'production' for prod |
| PORT | No | 3000 | Server port |
| HOST | No | localhost | Server host |

## Next Steps

After setting up the database:
1. Run migrations: `npm run migrate`
2. Verify connection works
3. Proceed to TASK-104 (Create migrations)

## Stopping and Cleaning Up

### Stop the Docker Container

```bash
# Using docker
docker stop city-reporter-db

# Using docker-compose
docker-compose down

# Remove container entirely (careful: data is lost)
docker rm city-reporter-db
```

### Backup Database

```bash
# Create a backup
docker exec city-reporter-db pg_dump -U postgres city_reporter > backup.sql

# Restore from backup
docker exec -i city-reporter-db psql -U postgres city_reporter < backup.sql
```

## Production Considerations

For production:
- Use strong passwords for database credentials
- Use a managed PostgreSQL service (AWS RDS, Azure Database, Heroku, etc.)
- Enable SSL connections (sslmode=require in connection string)
- Use connection pooling service (PgBouncer) for better resource management
- Regular backups
- Monitor query performance
- Use read replicas for scaling reads
- For Docker in production, use managed container services (AWS ECS, Kubernetes, etc.)

Example production connection string with SSL:
```
postgresql://user:password@prod-db.example.com:5432/city_reporter?sslmode=require
```
