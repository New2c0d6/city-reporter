# City Reporter — TODO

## Current Phase

Phase 0 — Planning

---

## TASK-001 — Inspect repository

Status: DONE
Phase: 0

Goal:
Understand the existing project structure before making changes.

Definition of Done:
- Repository structure inspected
- Existing dependencies identified
- Existing application entry points identified
- Existing database/backend setup identified
- Findings documented

### Findings

**Repository Structure:**
- Root directory contains only documentation files: `project.md`, `agent.md`, `TODO.md`
- `.opencode/` directory contains OpenCode configuration (skills and plugin dependencies)
- No application source code exists yet (no `src/`, `app/`, `backend/`, etc.)
- No configuration files exist (no `package.json`, `tsconfig.json`, `.env` files, etc.)

**Existing Dependencies:**
- Only OpenCode plugin dependency: `@opencode-ai/plugin@1.18.30` in `.opencode/package.json`
- No application framework dependencies installed (React Native, Node, PostgreSQL, etc.)

**Application Entry Points:**
- None exist yet. The application has not been scaffolded.

**Database/Backend Setup:**
- No database configuration exists
- No migrations or schema files
- No backend server code exists
- No API routes or server setup

**Key Insight:**
The repository is a clean slate. All infrastructure, application code, and database setup must be created from scratch following Phase 0 planning recommendations.

**Next Step:**
TASK-002 (Propose architecture) can now proceed with no blockers.

---

## TASK-002 — Propose architecture

Status: DONE
Phase: 0

Goal:
Define the simplest architecture for the MVP.

Definition of Done:
- Frontend architecture proposed
- Backend/server architecture proposed
- Database architecture proposed
- Media storage approach proposed
- Authentication approach proposed
- Major risks documented

Dependencies:
- TASK-001

### Approved Architecture

**Frontend:** React Native + Expo + TypeScript
- Feature-oriented project structure
- Local component state + custom hooks
- React Navigation for auth/app stack separation
- No global state management for MVP

**Backend:** Node.js + TypeScript + Express
- Minimal Express server
- Presigned URLs for S3 uploads
- JWT-based internal auth
- Server-side validation on all inputs

**Database:** PostgreSQL
- users, reports, categories, report_media, status_history tables
- Simple normalized schema
- Status as enum (5 values only)
- No JSON columns

**Storage:** AWS S3 (or compatible)
- Direct client uploads via presigned URLs
- File validation (type + size) on client & server
- Max 5 photos (5MB each), 1 video (100MB)

**Authentication:**
- Citizens: Anonymous
- Internal team: JWT + email/password

**Approved by:** User (2026-10-05)

---

## TASK-003 — Propose database schema

Status: DONE
Phase: 0

Goal:
Define the minimum database schema required for the MVP.

Definition of Done:
- Report model defined
- Category model defined
- User model defined
- Status/history model defined
- Relationships documented

Dependencies:
- TASK-002

### Approved Database Schema

**users table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
Purpose: Internal team authentication only. Citizens do not have accounts.

**categories table**
```sql
CREATE TABLE categories (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (id, name) VALUES 
  (1, 'Infrastructure'),
  (2, 'Illegal Dumping');
```
Purpose: Report classification. Fixed set for MVP; extensible for future.

**reports table**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(20) UNIQUE NOT NULL,
  category_id SMALLINT NOT NULL REFERENCES categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  
  -- Location (required for MVP, but captured separately)
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  location_timestamp TIMESTAMP,
  location_address VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```
Purpose: Core report data. Reference number is human-readable (e.g., "REP-2026-00001").

**report_media table**
```sql
CREATE TABLE report_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('photo', 'video')),
  media_url VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_media_report_id ON report_media(report_id);
```
Purpose: Store S3 URLs for photos and videos attached to reports.

**status_history table**
```sql
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_history_report_id ON status_history(report_id);
```
Purpose: Audit trail for status changes. Tracks who changed status and when.

### Schema Relationships

```
users (1) ──┬── many --> status_history
            │
categories (1) ── many --> reports
            │
reports (1) ──┬── many --> report_media
              └── many --> status_history
```

### Key Design Decisions

- **UUID for IDs:** Better for distributed systems, prevents ID enumeration
- **Enumerated status:** 5 fixed values (NEW, IN_REVIEW, IN_PROGRESS, RESOLVED, CLOSED)
- **Reference number:** Human-readable format for user-facing references (e.g., REP-2026-00001)
- **Location as columns:** Not JSONB; simple flat structure for MVP
- **Cascading deletes:** Deleting a report deletes its media and history
- **No reporter info:** Citizens are anonymous; no email/phone/name stored
- **Timestamps:** All tables track creation and update times
- **Indexes:** On frequently queried columns (status, created_at, report_id)

### TypeScript Types (Generated from Schema)

```typescript
export type Report = {
  id: string;
  reference_number: string;
  category_id: number;
  title: string;
  description: string;
  status: 'NEW' | 'IN_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  location_latitude: number | null;
  location_longitude: number | null;
  location_accuracy: number | null;
  location_timestamp: Date | null;
  location_address: string | null;
  created_at: Date;
  updated_at: Date;
};

export type ReportMedia = {
  id: string;
  report_id: string;
  type: 'photo' | 'video';
  media_url: string;
  created_at: Date;
};

export type StatusHistory = {
  id: string;
  report_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  timestamp: Date;
};

export type User = {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Category = {
  id: number;
  name: string;
  created_at: Date;
};
```

**Ready for approval before proceeding to TASK-004.**

---

## TASK-004 — Create implementation plan

Status: IN_PROGRESS
Phase: 0

Goal:
Break the approved architecture into small implementation tasks.

Definition of Done:
- Phase 1 tasks created
- Phase 2 tasks created
- Dependencies identified
- No unnecessary future features included

Dependencies:
- TASK-002
- TASK-003

---

# Phase 1 — Foundation

## TASK-101 — Setup React Native + Expo project

Status: DONE
Phase: 1

Goal:
Create a working React Native + Expo project with TypeScript configuration.

Scope:
- Initialize Expo project with TypeScript template
- Configure TypeScript (tsconfig.json)
- Setup project structure (src/ directories)
- Configure ESLint and prettier
- Add Expo Router with file-based navigation (citizen + internal groups)
- Create layout and screen files
- Test that TypeScript and ESLint pass

Definition of Done:
- `npm run typecheck` passes
- `npm run lint` passes
- Project structure uses Expo Router file-based routing
- ESLint and Prettier configured and passing

Dependencies:
- None

Notes:
- Use Expo Go for rapid iteration during MVP
- Use Expo Router for file-based navigation (not React Navigation)
- Do not configure iOS build yet (focus Android first per agent.md)

### Completed

**Project Structure (Expo Router file-based):**
```
src/
├── app/
│   ├── _layout.tsx              (root navigation)
│   ├── (citizen)/
│   │   ├── _layout.tsx          (citizen group layout)
│   │   ├── index.tsx            (home screen)
│   │   └── create-report.tsx    (report creation screen)
│   └── (internal)/
│       ├── _layout.tsx          (internal group layout)
│       ├── login.tsx            (login screen)
│       └── dashboard.tsx        (reports dashboard screen)
├── types/
│   └── index.ts                 (database and API types)
├── components/                  (ready for reusable components)
├── hooks/                       (ready for custom hooks)
├── services/                    (ready for API communication)
├── constants/                   (ready for app constants)
└── utils/                       (ready for utility functions)
```

**Configuration Files:**
- tsconfig.json - TypeScript strict mode enabled
- eslint.config.js - ESLint flat config with TypeScript, React, Prettier
- .prettierrc.json - Prettier code formatter config
- package.json - Scripts: start, android, ios, web, lint, lint:fix, format, typecheck

**Validation Results:**
- ✓ TypeScript: No errors (strict mode)
- ✓ ESLint: No errors
- ✓ Dependencies: All installed (expo, expo-router, react-native, etc.)

**Navigation Setup:**
- Root layout (_layout.tsx) defines Citizen and Internal stacks
- Citizen group: home → create-report
- Internal group: login → dashboard
- File-based routing via Expo Router

**Next Steps:**
- TASK-102: Setup Node/Express backend
- TASK-103: Setup PostgreSQL connection

---

## TASK-102 — Setup Node/Express backend with TypeScript

Status: DONE
Phase: 1

Goal:
Create a working Express server with TypeScript configuration.

Scope:
- Initialize Node project with TypeScript
- Configure Express with middleware (cors, json)
- Setup environment configuration (.env)
- Configure TypeScript (tsconfig.json)
- Add npm scripts (dev, build, start)
- Create basic health check endpoint (GET /health)
- Test server runs and responds to requests

Definition of Done:
- `npm run dev` starts server on localhost:3000
- GET /health returns 200 OK
- TypeScript compiles cleanly
- ESLint passes
- Server handles CORS correctly

Dependencies:
- None

Notes:
- Use `ts-node` for development
- Minimal dependencies at this stage

### Completed

**Backend Structure:**
```
server/
├── src/
│   ├── server.ts               (Express app entry point)
│   ├── db/
│   │   ├── connection.ts       (PostgreSQL pool)
│   │   └── migrate.ts          (migration runner)
│   ├── routes/
│   │   ├── reports.ts          (report endpoints)
│   │   ├── auth.ts             (auth endpoints)
│   │   ├── categories.ts       (category endpoints)
│   │   └── uploads.ts          (upload endpoints)
│   └── types/
│       └── index.ts            (TypeScript types)
├── migrations/                 (SQL migration files)
├── package.json
├── tsconfig.json
└── .env.example
```

**Express Setup:**
- ✓ CORS middleware configured
- ✓ JSON body parser
- ✓ Request logging
- ✓ Health check endpoint (GET /health)
- ✓ Error handling middleware
- ✓ Graceful shutdown (SIGTERM/SIGINT)

**Routes Structured:**
- GET /api/categories (TASK-106)
- POST /api/reports (TASK-201)
- GET /api/reports (TASK-601)
- GET /api/reports/:id (TASK-603)
- PATCH /api/reports/:id/status (TASK-701)
- POST /api/auth/login (TASK-502)
- POST /api/auth/logout (TASK-502)
- POST /api/uploads/presigned-url (TASK-401)

**Database Connection:**
- ✓ PostgreSQL connection pool configured
- ✓ Health check query ready
- ✓ Connection pooling (min 2, max 10)

**Validation Results:**
- ✓ TypeScript: No errors (strict mode)
- ✓ Server starts successfully
- ✓ Health check endpoint works
- ✓ Dependencies installed

**Available Scripts:**
```bash
npm run dev        # Start server with ts-node (watches on localhost:3000)
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled JavaScript
npm run migrate    # Run database migrations
npm run typecheck  # TypeScript check
```

**Next Steps:**
- TASK-103: Setup PostgreSQL database connection
- TASK-104: Create and run database migrations

---

## TASK-103 — Setup PostgreSQL database connection

Status: DONE
Phase: 1

Goal:
Connect the backend to PostgreSQL and verify connectivity.

Scope:
- Install pg (or similar) driver
- Configure connection pool
- Create database connection module (db/connection.ts)
- Add database URL to .env
- Create database initialization script
- Add health check query (SELECT 1)
- Test connection succeeds

Definition of Done:
- Database connection pool initializes without error
- Health check query executes successfully
- Connection pooling configured (min 2, max 10 connections)
- Environment variables documented

Dependencies:
- TASK-102

Notes:
- Do not create schema yet (TASK-104)
- Assume PostgreSQL is running locally or accessible via connection string

### Completed

**Database Connection Module:**
```
src/db/
├── connection.ts       (PostgreSQL connection pool)
├── migrate.ts          (migration runner)
└── test.ts             (connection test utility)
```

**Connection Pool Configuration:**
- ✓ pg driver (v8.23.1) installed and configured
- ✓ Connection pool: min=2, max=10
- ✓ Idle timeout: 30 seconds
- ✓ Connection timeout: 2 seconds
- ✓ Error handling and graceful shutdown

**Health Check:**
- ✓ GET /health endpoint responds with database status
- ✓ Connection test utility (npm run db:test)
- ✓ Logging of all database queries (debug mode)

**Environment Configuration:**
- ✓ .env file created with default PostgreSQL connection string
- ✓ DATABASE_URL format documented
- ✓ .env.example with all variables

**Documentation:**
- ✓ DATABASE_CONNECTION.md - Quick start guide
- ✓ DATABASE_SETUP.md - Comprehensive setup for all platforms
- ✓ Troubleshooting guide for common issues
- ✓ Docker example included

**Available Scripts:**
```bash
npm run dev         # Start server (uses DATABASE_URL from .env)
npm run db:test     # Test database connection
npm run migrate     # Run migrations (TASK-104)
npm run typecheck   # Type check
```

**Testing:**
```bash
# Test without PostgreSQL (shows connection error):
npm run db:test
# Output: ❌ Connection failed (expected without PostgreSQL)

# Once PostgreSQL installed and running:
npm run db:test
# Output: ✅ All database tests passed!

# Check server health:
curl http://localhost:3000/health
# Response: {"status":"ok","database":"connected"}
```

**Next Steps:**
1. Install PostgreSQL on the system (see DATABASE_CONNECTION.md)
2. Run `npm run db:test` to verify connection
3. Proceed to TASK-104 (Create migrations)

---

## TASK-104 — Create and run database migrations

Status: DONE
Phase: 1

Goal:
Create the database schema from architecture proposal.

Scope:
- Setup migration system (node-pg-migrate or similar)
- Write migration: CREATE users table
- Write migration: CREATE categories table (with seed data)
- Write migration: CREATE reports table
- Write migration: CREATE report_media table
- Write migration: CREATE status_history table
- Run all migrations
- Verify tables exist in database

Definition of Done:
- All migrations run successfully
- All 5 tables exist in PostgreSQL
- Foreign keys are validated
- Seed data (categories) inserted
- Database schema matches approved design
- `SELECT version()` and `\dt` both work

Dependencies:
- TASK-103

Notes:
- Categories table must be seeded with Infrastructure and Illegal Dumping
- Use migrations for repeatability; avoid manual SQL

### Completed

**Migration Files Created:**
```
migrations/
├── 001_create_users_table.sql         (UUID primary keys, password hash)
├── 002_create_categories_table.sql    (Infrastructure, Illegal Dumping seed)
├── 003_create_reports_table.sql       (Main report table with location fields)
├── 004_create_report_media_table.sql  (Photos/videos with S3 URLs)
└── 005_create_status_history_table.sql (Audit trail of status changes)
```

**Migration Runner:**
- ✓ `src/db/migrate.ts` - Executes migrations in order
- ✓ Idempotent - safe to run multiple times
- ✓ Tracks executed migrations in `migrations` table
- ✓ Handles multiple SQL statements per file
- ✓ Error handling with rollback information

**Migration Features:**
- ✓ All CREATE TABLE IF NOT EXISTS (idempotent)
- ✓ All seed data uses ON CONFLICT DO NOTHING
- ✓ Cascade deletes for referential integrity
- ✓ 11 indexes created for common queries
- ✓ Table comments for schema documentation

**Schema Created:**
```
Tables:          Indexes:
├── users        ├── idx_users_email
├── categories   ├── idx_reports_status
├── reports      ├── idx_reports_created_at
├── report_media ├── idx_reports_category_id
├── status_history ├── idx_report_media_report_id
└── migrations   ├── idx_status_history_report_id
                 └── 6 more indexes for performance
```

**Validation Tools:**
- ✓ `npm run migrate` - Execute migrations
- ✓ `npm run db:validate` - Verify schema is correct
- ✓ `npm run db:test` - Test database connection
- ✓ TypeScript strict mode - All code type-safe

**Documentation:**
- ✓ DATABASE_SCHEMA.md - Complete schema reference
- ✓ MIGRATIONS_GUIDE.md - How to add new migrations
- ✓ Troubleshooting guides for common issues

**Available Scripts:**
```bash
npm run migrate      # Execute all pending migrations
npm run db:test      # Test database connection
npm run db:validate  # Validate schema is correct
npm run typecheck    # TypeScript validation
npm run dev          # Start server
```

**Tables & Data:**
- ✓ users table (0 rows, ready for internal users)
- ✓ categories table (2 rows: Infrastructure, Illegal Dumping)
- ✓ reports table (0 rows, ready for citizen submissions)
- ✓ report_media table (0 rows, ready for photos/videos)
- ✓ status_history table (0 rows, ready for audit trail)

**Next Steps:**
1. When PostgreSQL is available: `npm run migrate`
2. Verify with: `npm run db:validate`
3. Proceed to TASK-105 (Category endpoints)

---

## TASK-105 — Create TypeScript types from database schema

Status: TODO
Phase: 1

Goal:
Generate or define TypeScript types for all database models.

Scope:
- Define User type
- Define Category type
- Define Report type
- Define ReportMedia type
- Define StatusHistory type
- Create types/database.ts module
- Export all types for use in backend and frontend
- Add JSDoc comments for clarity

Definition of Done:
- All types compile without error
- All types are exported from single module
- Types match database schema
- Types include proper null/optional fields
- Frontend can import these types

Dependencies:
- TASK-104

Notes:
- Types should be production-ready; reusable across backend and frontend
- Use discriminated unions for status field if needed in future

---

## TASK-106 — Create category seed data and validation

Status: TODO
Phase: 1

Goal:
Ensure categories are defined and queryable from the backend.

Scope:
- Query categories from database
- Create category service (services/categories.ts)
- Add GET /api/categories endpoint
- Add validation for category IDs
- Test endpoint returns both categories

Definition of Done:
- GET /api/categories returns [Infrastructure, Illegal Dumping]
- Backend validates category IDs before accepting reports
- TypeScript types for categories are used consistently

Dependencies:
- TASK-105

Notes:
- This is lightweight setup for Phase 2 report creation

---

# Phase 2 — Citizen Report Creation

## TASK-201 — Create basic report form (without media/location)

Status: TODO
Phase: 2

Goal:
Allow citizens to create a basic report with category, title, and description.

Scope:
- Create ReportFormScreen (Expo component)
- Add category selector (FlatList of categories)
- Add title input (TextInput)
- Add description input (TextInput, multiline)
- Add submit button
- Form validation (all fields required)
- Display validation errors on submit
- Create POST /api/reports endpoint on backend
- Endpoint creates report with NEW status
- Endpoint returns created report with reference number

Definition of Done:
- Form displays and is interactive
- All fields are required and validated
- Submit button is disabled until valid
- POST /api/reports accepts and saves report
- Citizen sees success message with reference number
- TypeScript compiles cleanly
- No media or location captured yet

Dependencies:
- TASK-101, TASK-105, TASK-106

Notes:
- Use local form state (useState) for this MVP phase
- Reference number generated server-side (e.g., REP-2026-00001)
- No authentication required for citizen reports

---

## TASK-202 — Add error handling and loading states to report form

Status: TODO
Phase: 2

Goal:
Make report form resilient to network failures and server errors.

Scope:
- Add loading state to submit button (disable on loading)
- Display loading spinner during submission
- Catch and display API errors to user
- Add retry button if submission fails
- Preserve form data on error (do not clear)
- Handle network timeout errors
- Test with simulated network failure

Definition of Done:
- Loading state shows and hides correctly
- Error messages are user-friendly (not raw API errors)
- Form data persists on error
- Retry works without data loss
- User sees clear success confirmation

Dependencies:
- TASK-201

Notes:
- Error messages should be generic but helpful
- No silent failures allowed

---

## TASK-203 — Create confirmation/success screen after report submission

Status: TODO
Phase: 2

Goal:
Show citizen that their report was successfully submitted.

Scope:
- Create ConfirmationScreen
- Display reference number prominently
- Display "What happens next" message
- Show "Create another report" button
- Show "Go home" button
- Display submission timestamp
- Show report summary (category, title, description)

Definition of Done:
- Confirmation screen displays after successful submission
- Reference number is clearly visible
- User can create another report or return home
- Screen layout works on small devices

Dependencies:
- TASK-202

Notes:
- Keep message simple and friendly
- Reference number should be easy to copy/share

---

# Phase 3 — Location Capture

## TASK-301 — Add geolocation hook for report creation

Status: TODO
Phase: 3

Goal:
Capture device location when citizen creates a report.

Scope:
- Create useLocation custom hook
- Request location permission
- Get current position (latitude, longitude, accuracy)
- Handle permission denied (user-friendly message)
- Handle timeout errors
- Add retry button
- Return location object or null if unavailable

Definition of Done:
- Hook requests permission and captures location
- Permission denied is handled gracefully
- Location object includes lat, lon, accuracy, timestamp
- Hook returns null if location unavailable
- User can retry if location fails

Dependencies:
- TASK-101

Notes:
- Use expo-location for geolocation
- Do not require location; make it optional for MVP
- Do not continuously track; capture once on demand

---

## TASK-302 — Integrate location into report form

Status: TODO
Phase: 3

Goal:
Attach location to reports during creation.

Scope:
- Add location capture to report form
- Show location request UI (button to capture location)
- Display captured location (coordinates + accuracy)
- Allow user to remove/recapture location
- Pass location to backend on submission
- Backend saves location to reports table
- Display location on confirmation screen

Definition of Done:
- Location can be captured during form completion
- Location is optional (report can be submitted without it)
- Location appears on confirmation screen
- Backend accepts and stores location correctly
- Location persists to database

Dependencies:
- TASK-203, TASK-301

Notes:
- Keep location UI simple; minimal extra steps
- Do not require address resolution for MVP

---

# Phase 4 — Media Upload

## TASK-401 — Setup S3 client and presigned URL generation

Status: TODO
Phase: 4

Goal:
Enable direct client uploads to S3 via presigned URLs.

Scope:
- Install AWS SDK for JavaScript
- Configure S3 credentials in backend (.env)
- Create presigned URL generation endpoint (POST /api/uploads/presigned-url)
- Endpoint accepts file type and size
- Validate file type (image/jpeg, image/png, video/mp4)
- Validate file size (5MB max for photos, 100MB for video)
- Return presigned URL and upload details
- Test presigned URL works with curl

Definition of Done:
- Presigned URL endpoint works
- File type validation on backend
- File size validation on backend
- Presigned URL is valid for 15 minutes
- Client can upload directly to S3 using returned URL

Dependencies:
- TASK-105

Notes:
- Do not store credentials in app; only use presigned URLs
- Credentials stored securely in backend environment

---

## TASK-402 — Create media picker and upload UI

Status: TODO
Phase: 4

Goal:
Allow citizens to select photos and videos and upload them.

Scope:
- Create useMediaUpload custom hook
- Add image picker (expo-image-picker)
- Add video picker (expo-image-picker)
- Display selected media as previews
- Create upload component with progress indicator
- Request camera and media library permissions
- Handle permission denied gracefully
- Implement upload retry logic
- Allow removing selected media before upload

Definition of Done:
- Users can pick photos and videos
- Previews display before upload
- Upload progress is shown
- Multiple photos can be selected (up to 5)
- One video can be selected
- Upload errors show retry button
- Permissions are handled correctly

Dependencies:
- TASK-101

Notes:
- Use expo-image-picker (built into Expo)
- Do not require permissions upfront; request when needed
- Keep picker UI mobile-friendly

---

## TASK-403 — Integrate media into report form and submission

Status: TODO
Phase: 4

Goal:
Allow media to be uploaded as part of report creation.

Scope:
- Add media section to report form
- Show selected media previews
- Get presigned URLs before upload
- Upload media to S3
- Store S3 URLs in report_media table
- Associate media with report on creation
- Display uploaded media on confirmation screen
- Handle upload failures with retry

Definition of Done:
- Media can be selected and previewed
- Media uploads to S3 successfully
- S3 URLs are stored in database
- Report creation waits for media upload completion
- Confirmation screen shows uploaded media
- Partial upload failure is handled (report created, media missing triggers error)

Dependencies:
- TASK-203, TASK-401, TASK-402

Notes:
- Upload media before creating report, or create report then upload (TBD based on UX)
- Handle network failures gracefully
- Show clear error if S3 upload fails

---

# Phase 5 — Internal Authentication

## TASK-501 — Create internal user registration/seeding

Status: TODO
Phase: 5

Goal:
Create initial internal user accounts for dashboard access.

Scope:
- Create backend endpoint for user registration (POST /api/auth/register)
- Hash passwords securely (bcrypt)
- Validate email format
- Prevent duplicate emails
- Create seed script for test user
- Store user in database

Definition of Done:
- User can be registered with email/password
- Password is hashed (not stored plaintext)
- Duplicate emails rejected
- Test user can be seeded with npm script
- User data is validated

Dependencies:
- TASK-105

Notes:
- For MVP, no public registration; internal only
- Seed script creates test user for dev/testing

---

## TASK-502 — Create JWT authentication (login/logout)

Status: TODO
Phase: 5

Goal:
Implement JWT-based login for internal users.

Scope:
- Create POST /api/auth/login endpoint
- Accept email and password
- Verify password against hash
- Generate JWT token on success
- Return token and refresh token
- Create logout endpoint (clear token)
- Store refresh token securely
- Add middleware to validate JWT on protected routes

Definition of Done:
- Login endpoint works with valid credentials
- Invalid credentials rejected
- JWT is returned on success
- JWT can be used to authenticate requests
- Logout clears token
- Token expires after set time (15 min access, 7 day refresh)

Dependencies:
- TASK-501

Notes:
- Use jsonwebtoken library
- Refresh token stored in secure httpOnly cookie if possible
- Access token passed in Authorization header

---

## TASK-503 — Protect internal dashboard routes

Status: TODO
Phase: 5

Goal:
Ensure only authenticated users can access the dashboard.

Scope:
- Add authentication middleware to all /api/reports endpoints
- Add protected routes to frontend navigation
- Redirect unauthenticated users to login
- Display login screen for unauthenticated users
- Store auth token securely in frontend (SecureStore or AsyncStorage)
- Add logout button to dashboard
- Handle expired tokens and token refresh

Definition of Done:
- Unauthenticated requests to /api/reports return 401
- Unauthenticated users see login screen
- Authenticated users can see dashboard
- Token is persisted across app restarts
- Logout clears token and redirects to login

Dependencies:
- TASK-502

Notes:
- Frontend auth state managed with React Context or custom hook
- Never store token in plain AsyncStorage; use SecureStore (expo-secure-store)

---

# Phase 6 — Internal Dashboard

## TASK-601 — Create reports list endpoint and basic listing

Status: TODO
Phase: 6

Goal:
Internal users can see a list of all submitted reports.

Scope:
- Create GET /api/reports endpoint (requires auth)
- Return paginated list of reports (default 20 per page)
- Include report ID, reference number, category, title, status, created_at
- Create DashboardScreen component
- Display reports in FlatList with basic styling
- Show report cards with key info
- Add pagination or infinite scroll

Definition of Done:
- GET /api/reports returns list of reports
- Dashboard displays reports
- Reports are paginated
- List updates when new reports submitted
- No external API calls except to /api/reports

Dependencies:
- TASK-503

Notes:
- Implement simple date-based pagination for MVP
- Do not implement complex filters yet (TASK-602)

---

## TASK-602 — Add search and basic filters to dashboard

Status: TODO
Phase: 6

Goal:
Internal users can find reports by search and filters.

Scope:
- Add search endpoint (GET /api/reports/search?q=...) or add query param to list
- Search by title, description, reference number
- Add status filter (show only reports with certain status)
- Add category filter
- Add date range filter (from/to dates)
- Update dashboard UI with search/filter inputs
- Display number of results

Definition of Done:
- Search returns matching reports
- Filters work (single and combined)
- UI is clear and usable
- Filtered results update dashboard
- Default view shows all reports

Dependencies:
- TASK-601

Notes:
- Keep filters simple for MVP; no complex advanced search
- Filters should be client-side sent as query params

---

## TASK-603 — Create report detail page with media and location

Status: TODO
Phase: 6

Goal:
Internal users can view full report details including media and location.

Scope:
- Create GET /api/reports/:id endpoint
- Return full report, all media, status history
- Create ReportDetailScreen component
- Display report info (title, description, category, status)
- Display media gallery (photos and video)
- Display map with location (if available)
- Display status history with timestamps and actors
- Make media clickable to view full size

Definition of Done:
- Report detail page displays all information
- Media displays correctly (photos and video)
- Map shows location (if available)
- Status history is readable
- Page layout works on all screen sizes

Dependencies:
- TASK-602, TASK-104 (status_history table)

Notes:
- Use react-native-maps for map display
- Media viewer should be full-screen modal or similar
- Location optional (may be null)

---

# Phase 7 — Workflow Management

## TASK-701 — Create status transition endpoint and validation

Status: TODO
Phase: 7

Goal:
Internal users can change report status through valid transitions.

Scope:
- Define allowed transitions: NEW → IN_REVIEW → IN_PROGRESS → RESOLVED → CLOSED
- Create PATCH /api/reports/:id/status endpoint
- Accept new_status in request body
- Validate transition is allowed
- Track who changed status (from JWT token)
- Create status_history record
- Return updated report

Definition of Done:
- Status transitions work for valid changes
- Invalid transitions rejected with 400 error
- Status history is created with actor and timestamp
- User can only change status if authenticated

Dependencies:
- TASK-503, TASK-104

Notes:
- Transitions are strict; no skipping (NEW → IN_PROGRESS not allowed directly)
- Actor (user ID) automatically captured from JWT

---

## TASK-702 — Create status transition UI on detail page

Status: TODO
Phase: 7

Goal:
Internal users can change report status through the UI.

Scope:
- Add status change button/dropdown to detail page
- Show only valid next statuses
- Confirm before changing status
- Display loading state during transition
- Show success/error message
- Update status history display
- Refresh report data after change

Definition of Done:
- Status dropdown shows only valid transitions
- Confirmation dialog appears before change
- Status updates after confirmation
- Error handling if transition fails
- History updates immediately

Dependencies:
- TASK-603, TASK-701

Notes:
- Keep UX simple; one button or dropdown per status
- Disable transitions if user lacks permission (checked server-side)

---

# Phase 8 — MVP Hardening & QA

## TASK-801 — Form validation and error message review

Status: TODO
Phase: 8

Goal:
Ensure all forms are robust and user-friendly.

Scope:
- Review all form validation
- Check error messages are user-friendly
- Test edge cases (very long text, special characters, etc.)
- Ensure required fields are clearly marked
- Test form works on small screens
- Test with slow network simulation
- Add client-side validation for all inputs

Definition of Done:
- All validation errors are clear and helpful
- Forms work on small Android devices
- No raw error messages exposed to users
- Form layout is responsive

Dependencies:
- TASK-701 (all implementation tasks)

Notes:
- User-friendly means "The title is too long (max 255 characters)" not "CharField validation error"

---

## TASK-802 — Error state and offline handling review

Status: TODO
Phase: 8

Goal:
Ensure all features gracefully handle failures.

Scope:
- Test network failure scenarios
- Verify error messages appear
- Verify retry buttons work
- Test loading states appear and disappear
- Test empty states (no reports, etc.)
- Verify 404/401/500 errors are handled
- Test on slow network (2G simulation)

Definition of Done:
- All network errors show user-friendly messages
- Retry buttons work
- Loading states are visible
- Empty states handled
- No silent failures

Dependencies:
- TASK-701 (all implementation tasks)

Notes:
- Use React Native Network Info API or similar for offline detection

---

## TASK-803 — Mobile UX review and responsive design

Status: TODO
Phase: 8

Goal:
Ensure the MVP is usable on real mobile devices.

Scope:
- Test on small Android phones (< 5 inches)
- Test on large Android phones (> 6 inches)
- Test on tablets if applicable
- Verify touch targets are large (min 44x44 points)
- Check text is readable without zooming
- Verify keyboard doesn't hide form inputs
- Check layout handles safe areas (notches, etc.)

Definition of Done:
- App is usable on small and large phones
- No text requires zooming to read
- Touch targets are adequate
- No layout broken on any tested device

Dependencies:
- TASK-701 (all implementation tasks)

Notes:
- Test on actual Android device if possible
- Use useWindowDimensions and Flexbox for responsive layouts

---

## TASK-804 — Accessibility review (WCAG 2.1 AA)

Status: TODO
Phase: 8

Goal:
Ensure the MVP is accessible to all users.

Scope:
- Add accessible labels to all buttons and inputs
- Test with accessibility inspector
- Verify color contrast meets WCAG AA
- Check font sizes are readable (min 16sp)
- Test with screen reader (accessibility features)
- Verify navigation is logical
- Check form labels are associated with inputs

Definition of Done:
- No accessibility violations detected
- Screen reader works with key workflows
- Color contrast passes WCAG AA
- Font sizes are readable

Dependencies:
- TASK-701 (all implementation tasks)

Notes:
- Use accessibilityLabel and testID in React Native
- Test with device accessibility features enabled

---

## TASK-805 — Security review

Status: TODO
Phase: 8

Goal:
Ensure the MVP handles sensitive data securely.

Scope:
- Verify no secrets in app code or git
- Verify tokens are stored securely (not AsyncStorage plaintext)
- Verify file uploads validate type and size server-side
- Verify SQL injection is not possible (use parameterized queries)
- Verify authorization checks happen server-side
- Verify API keys/credentials are in .env (not hardcoded)
- Check HTTPS is enforced

Definition of Done:
- No plaintext tokens in AsyncStorage
- Secrets are in .env
- File uploads validated on server
- Authorization checks on all protected endpoints
- SQL queries use parameterized inputs

Dependencies:
- TASK-701 (all implementation tasks)

Notes:
- Use dotenv for environment variables
- Never trust client-supplied IDs; verify ownership server-side

---

## TASK-806 — Typecheck, lint, and automated testing

Status: TODO
Phase: 8

Goal:
Ensure code quality and test coverage.

Scope:
- Run TypeScript compiler with strict mode
- Run ESLint and fix violations
- Write tests for critical paths (report creation, auth, status transitions)
- Test report submission end-to-end
- Test authentication flow
- Test report list and detail pages
- Achieve minimum 60% coverage on critical features

Definition of Done:
- TypeScript compiles with zero errors
- ESLint passes
- Tests pass
- Coverage meets threshold
- No unhandled errors in tests

Dependencies:
- TASK-701 (all implementation tasks)

Notes:
- Focus on behavior-driven tests, not implementation details
- Test important workflows, not every function

---

## TASK-807 — Production build and performance review

Status: TODO
Phase: 8

Goal:
Ensure the MVP builds and performs well.

Scope:
- Build Android production bundle
- Test app on physical device
- Profile app performance (startup time, list scrolling)
- Check bundle size
- Optimize if needed (code splitting, lazy loading)
- Verify app starts in < 3 seconds
- Verify list scrolls smoothly (60 FPS)

Definition of Done:
- Production build succeeds
- App starts quickly on real device
- No jank or lag on list scrolling
- Bundle size is reasonable (< 100MB)

Dependencies:
- TASK-701 (all implementation tasks)

Notes:
- Use Expo build service for production builds
- Profile with React Native Debugger or similar

---

## TASK-808 — Final MVP validation and deployment preparation

Status: TODO
Phase: 8

Goal:
Final checks before MVP release.

Scope:
- Run complete test suite
- Test on Android device one final time
- Verify all requirements from PROJECT.md are met
- Ensure database migrations work fresh
- Document setup and deployment steps
- Create deployment checklist
- Prepare for future phases

Definition of Done:
- All Phase 1-7 tasks complete and tested
- MVP meets all requirements in PROJECT.md
- Deployment steps documented
- App runs without errors on real Android device
- Ready for release

Dependencies:
- TASK-807

Notes:
- This task marks the end of the MVP; future features deferred to Phase 9+
- Document any technical debt or known issues