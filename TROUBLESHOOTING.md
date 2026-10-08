# City Reporter - Troubleshooting Guide

## Common Issues and Solutions

### Issue: Black screen or "Failed to load resource: 500 error" on startup

**Symptoms:**
- Expo shows "Failed to load resource: the server responded with a status of 500"
- Screen is black
- MIME type error with Hermes bundle

**Solutions:**

1. **Clear bundler cache:**
```bash
# Frontend
cd /home/noel/projects/city-reporter
rm -rf .expo node_modules/.cache
npm start -- --clear

# Or using Android
npm run android -- --clear
```

2. **Restart the dev server:**
```bash
# Kill any existing Expo instances
pkill -f "expo start"

# Start fresh
npm start
```

3. **Check React Compiler:**
- The app.json has `"reactCompiler": false` to avoid compilation issues
- If you want to enable it, be aware it may cause build errors

4. **Verify database connection:**
```bash
cd server
npm run db:test
```

The app tries to load categories from `http://localhost:3000/api/categories` on startup. Make sure the backend is running.

5. **Check for TypeScript errors:**
```bash
npm run typecheck
```

6. **Reset modules:**
```bash
rm -rf node_modules
npm install
npm start
```

### Issue: "Cannot find module" errors

**Solutions:**

1. **Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check import paths:**
- Ensure all imports use correct relative paths
- TypeScript strict mode will catch most issues

3. **Clear Metro cache:**
```bash
npx expo start -c
```

### Issue: API call failures (404 on /api/categories, etc.)

**Solutions:**

1. **Start the backend server:**
```bash
cd /home/noel/projects/city-reporter/server
npm run dev
```

2. **Verify API endpoint:**
```bash
# Test categories endpoint
curl http://localhost:3000/api/categories

# Test health
curl http://localhost:3000/health
```

3. **Check API URL configuration:**
- In `src/constants/api.ts`, the base URL defaults to `http://localhost:3000/api`
- For device/emulator, you may need to change to your machine IP

### Issue: Form doesn't display or styles are wrong

**Solutions:**

1. **Check theme imports:**
- All screens import from `src/constants/theme.ts`
- Verify the file exists and exports all color, spacing, typography tokens

2. **Verify StyleSheet usage:**
- All components use React Native's `StyleSheet.create()`
- No Tailwind classes should be in the code

3. **Test on different screen sizes:**
- Use Android emulator with different device profiles
- Styles should adapt to screen size using Flexbox

### Issue: Database migration errors

**Solutions:**

1. **Check PostgreSQL is running:**
```bash
# Docker container should be running
docker ps | grep postgres

# Or verify with
npm run db:test
```

2. **Reset database (if needed):**
```bash
# Connect to PostgreSQL
psql -U postgres -d city_reporter

# Drop and recreate (careful!)
DROP TABLE IF EXISTS migrations CASCADE;
DROP TABLE IF EXISTS status_history CASCADE;
DROP TABLE IF EXISTS report_media CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

# Re-run migrations
npm run migrate
```

3. **Check migration files:**
- Located in `server/migrations/`
- All files should be valid SQL
- Check for duplicate IDs or syntax errors

### Issue: TypeScript compilation errors

**Solutions:**

1. **Check strict mode:**
```bash
npm run typecheck
```

2. **Fix type errors:**
- All types must match between frontend and backend
- Shared types in `src/types/index.ts`

3. **Verify imports:**
- TypeScript requires explicit type imports sometimes
- Use `import type { Type } from '...'`

### Issue: Build succeeds but app crashes on first load

**Solutions:**

1. **Check console for errors:**
- Expo shows errors in the terminal
- Check for "error loading form" or API fetch failures

2. **Verify API is accessible:**
```bash
# From your machine
curl http://localhost:3000/api/categories

# You should get JSON response
```

3. **Check for unhandled rejections:**
- API calls may fail silently if not properly caught
- All API calls should have try/catch or .catch()

4. **Look for circular imports:**
```bash
# TypeScript will catch these
npm run typecheck
```

## Environment Setup

### Required Services

1. **PostgreSQL:**
```bash
# Check if running
docker ps | grep postgres

# If not running
docker start city-reporter-db

# Verify connection
cd server && npm run db:test
```

2. **Backend (Express):**
```bash
cd server
npm run dev
# Should print: ✓ Server running at http://localhost:3000
```

3. **Frontend (Expo):**
```bash
cd /home/noel/projects/city-reporter
npm start
# Opens QR code for Expo Go
```

### Development Environment Checklist

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] PostgreSQL 15 running in Docker
- [ ] Backend running on localhost:3000
- [ ] Frontend dev server running on localhost:8081
- [ ] TypeScript check passing: `npm run typecheck`
- [ ] ESLint check passing: `npm run lint`

## Debugging Tips

### Enable Debug Logging

In `src/services/api.ts`, the API client has request/response logging built in.

### Monitor Network Requests

1. **Expo Go:**
- Open DevTools in Expo
- Check Network tab
- Monitor API calls

2. **Android Emulator:**
- Use Android Studio Monitor
- Or use `adb logcat | grep city-reporter`

### Check Database State

```bash
# Connect to PostgreSQL
psql -U postgres -d city_reporter

# List all tables
\dt

# Check categories
SELECT * FROM categories;

# Check reports
SELECT id, reference_number, title, status FROM reports LIMIT 5;

# Check migrations
SELECT * FROM migrations ORDER BY name DESC;
```

## Performance Tips

1. **Keep emulator running** - Startup is slow
2. **Use `npm run typecheck`** - Catches errors before runtime
3. **Test API endpoints with curl** - Faster than through the app
4. **Use Android Studio emulator** - Better performance than physical device

## Getting Help

### Check Logs

1. **Frontend errors:**
```bash
npm start
# Watch terminal for error messages
```

2. **Backend errors:**
```bash
cd server && npm run dev
# Watch terminal for query/error logs
```

3. **Database errors:**
```bash
npm run db:test
# Shows connection status and test results
```

### Verify All Systems

```bash
# In root directory
echo "=== TypeScript ===" && npm run typecheck
echo "=== ESLint ===" && npm run lint
echo "=== Database ===" && cd server && npm run db:test

# In server directory
echo "=== Backend ===" && npm run typecheck
```

## Advanced Debugging

### Metro Debugger

1. Start Expo: `npm start`
2. Press `j` for Metro debugger
3. Opens DevTools with bundle visualization

### React DevTools

1. Install: `npm install -g react-devtools`
2. Run: `react-devtools`
3. Monitor component tree and props

### Database Query Logging

In `server/src/db/connection.ts`, queries are logged to console:
```
Executed query { text: 'SELECT...', duration: 42, rows: 1 }
```

## Common Solutions Checklist

When troubleshooting, try in this order:

1. [ ] Restart Expo dev server: `npm start -c` (clear cache)
2. [ ] Check TypeScript: `npm run typecheck`
3. [ ] Verify database: `npm run db:test`
4. [ ] Check backend: `curl http://localhost:3000/health`
5. [ ] Kill and restart backend: `cd server && npm run dev`
6. [ ] Clear node_modules: `rm -rf node_modules && npm install`
7. [ ] Check for syntax errors in recent files
8. [ ] Review git diff for accidental changes

## Still Having Issues?

1. Check the DEVELOPMENT_SUMMARY.md for project structure
2. Review STYLING_GUIDE.md for component patterns
3. Look at existing working screens for reference
4. Verify all imports and paths are correct
5. Ensure all theme tokens exist in src/constants/theme.ts
