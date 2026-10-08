# City Reporter - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ and npm 9+
- Docker (for PostgreSQL)
- Expo Go app on your phone (for mobile testing)

### Step 1: Verify Services Are Running

```bash
# Check if database container is running
docker ps | grep postgres

# If not running, start it
docker start city-reporter-db

# Verify database connection
cd server
npm run db:test
```

Expected output: `✅ All database tests passed!`

### Step 2: Start Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
✓ Server running at http://0.0.0.0:3000
✓ Health check: http://0.0.0.0:3000/health
```

### Step 3: Start Frontend

In a new terminal:

```bash
cd /home/noel/projects/city-reporter
npm start
```

This will:
1. Start the Expo dev server on port 8081
2. Display a QR code
3. Open options menu

### Step 4: View the App

#### Option A: Android Emulator
```bash
npm run android
```

#### Option B: Expo Go (Fastest)
1. Install [Expo Go](https://expo.dev/go)
2. Scan the QR code from terminal
3. App opens in Expo Go

#### Option C: Web
```bash
npm run web
```

### Step 5: Test Report Creation

1. **Home Screen** - Shows "City Reporter" with action cards
2. **Create Report** - Fill out:
   - Category: "Infrastructure"
   - Title: "Broken streetlight"
   - Description: "Light is not working at Main St"
   - Press Submit
3. **Confirmation Screen** - Shows reference number (REP-2026-00001, etc.)

### Verify Everything Works

#### Frontend Check
```bash
npm run typecheck    # TypeScript validation
npm run lint         # Code quality check
```

#### Backend Check
```bash
cd server
npm run typecheck    # TypeScript validation
npm run typecheck    # Code quality check
```

#### Database Check
```bash
cd server
npm run db:test      # Connection test
npm run db:validate  # Schema validation
```

## 📱 File Structure

### Frontend (`src/`)
```
src/app/
  (citizen)/
    index.tsx              ← Home screen
    create-report.tsx      ← Report form
    confirmation.tsx       ← Success screen
  (internal)/
    login.tsx              ← Admin login (TODO)
    dashboard.tsx          ← Admin dashboard (TODO)
constants/
  theme.ts                 ← Design system tokens
  api.ts                   ← API configuration
services/
  api.ts                   ← API client
```

### Backend (`server/`)
```
src/
  server.ts                ← Express app
  routes/
    reports.ts             ← Report endpoints
    categories.ts          ← Category endpoints
  services/
    reports.ts             ← Report logic
    categories.ts          ← Category logic
  db/
    connection.ts          ← PostgreSQL pool
    migrate.ts             ← Migration runner
migrations/                ← Database migrations
```

## 🧪 Test the API Directly

### List Categories
```bash
curl http://localhost:3000/api/categories
```

Expected response:
```json
[
  {"id":1,"name":"Infrastructure","created_at":"2026-10-05T..."},
  {"id":2,"name":"Illegal Dumping","created_at":"2026-10-05T..."}
]
```

### Create a Report
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "title": "Pothole on Main Street",
    "description": "Large hole that needs repair"
  }'
```

Expected response:
```json
{
  "id":"cc1a2948-69cf-4b8b-a0f9-6e4b55994526",
  "reference_number":"REP-2026-00001",
  "category_id":1,
  "title":"Pothole on Main Street",
  "status":"NEW",
  ...
}
```

### Get All Reports
```bash
curl http://localhost:3000/api/reports
```

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","database":"connected"}
```

## 🎨 Design System

All styling uses **native React Native StyleSheet** with design tokens from `src/constants/theme.ts`:

- **Colors**: Primary blue (2563eb), semantic colors, neutral scale
- **Typography**: 8-level scale (display, page title, section, body, etc.)
- **Spacing**: 4px grid (4, 8, 12, 16, 24, 32, 48, 64px)
- **Borders**: 8px inputs/buttons, 12px cards, 16px modals

See `STYLING_GUIDE.md` for detailed patterns.

## 🐛 Troubleshooting

### Black screen / 500 error
```bash
# Clear cache and restart
npm start -c
```

### Database not connecting
```bash
# Check if running
docker ps | grep postgres

# Start if needed
docker start city-reporter-db

# Test connection
cd server && npm run db:test
```

### API not responding
```bash
# Restart backend
cd server
npm run dev

# Test endpoint
curl http://localhost:3000/health
```

### Form won't submit
1. Check console for errors: `npm start` terminal
2. Verify backend is running: `cd server && npm run dev`
3. Verify database is running: `npm run db:test`

See `TROUBLESHOOTING.md` for more help.

## 📚 Next Steps

### Continue Development
- **Phase 3**: Add location capture
  - `TASK-301`: Geolocation hook
  - `TASK-302`: Integrate into form

- **Phase 4**: Add media upload
  - `TASK-401`: S3 presigned URLs
  - `TASK-402`: Photo/video picker
  - `TASK-403`: Integrate into form

- **Phase 5**: Internal authentication
  - `TASK-501`: User registration
  - `TASK-502`: JWT login/logout
  - `TASK-503`: Protect dashboard

See `TODO.md` for complete task breakdown.

### Useful Commands

```bash
# Frontend
npm start              # Start dev server
npm run android       # Build and run on Android
npm run typecheck     # TypeScript validation
npm run lint          # ESLint validation
npm run lint:fix      # Auto-fix lint issues

# Backend
cd server
npm run dev           # Start dev server
npm run build         # Compile to dist/
npm run migrate       # Run migrations
npm run db:test       # Test database
npm run typecheck     # TypeScript validation
npm run lint          # ESLint validation
```

## 💡 Development Tips

1. **Keep three terminals open:**
   - Terminal 1: Database running
   - Terminal 2: Backend (`npm run dev`)
   - Terminal 3: Frontend (`npm start`)

2. **Use fast reload:**
   - Make changes to code
   - Expo automatically reloads on save
   - No need to rebuild

3. **Check types before running:**
   ```bash
   npm run typecheck    # Catches errors early
   ```

4. **Test API with curl:**
   - Faster than through the app
   - Easier to debug

5. **Read the logs:**
   - Frontend errors show in `npm start` terminal
   - Backend errors show in `npm run dev` terminal
   - Database logs show in `npm run db:test`

## ✅ All Systems Green

When everything is working:

```bash
# Terminal 1: Database
docker ps | grep postgres  # ✓ Running

# Terminal 2: Backend
npm run db:test            # ✓ Connected
npm run dev                # ✓ Server running

# Terminal 3: Frontend
npm start                  # ✓ Dev server ready
# Scan QR code with Expo Go

# Terminal 4: Test API
curl http://localhost:3000/api/categories  # ✓ Returns JSON
```

Then:
1. Open Expo Go on phone
2. Scan QR code
3. See home screen
4. Tap "Report an Issue"
5. Fill form and submit
6. See success screen with reference number ✨

Happy coding! 🚀
