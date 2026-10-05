import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { query, getClient, closePool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get all migration files
 */
async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = join(__dirname, '../../migrations');
  try {
    const files = await readdir(migrationsDir);
    return files.filter((f) => f.endsWith('.sql')).sort();
  } catch {
    console.error(
      'Migrations directory not found. Make sure migrations/ exists.'
    );
    return [];
  }
}

/**
 * Read migration file
 */
async function readMigrationFile(filename: string): Promise<string> {
  const migrationsDir = join(__dirname, '../../migrations');
  const content = await readFile(join(migrationsDir, filename), 'utf-8');
  return content;
}

/**
 * Create migrations table if it doesn't exist
 */
async function createMigrationsTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Migrations table ready');
  } catch (error) {
    console.error('Failed to create migrations table:', error);
    throw error;
  }
}

/**
 * Get list of already-executed migrations
 */
async function getExecutedMigrations(): Promise<Set<string>> {
  try {
    const result = await query('SELECT name FROM migrations ORDER BY executed_at');
    const executed = new Set<string>();
    (result.rows as { name: string }[]).forEach((row) => {
      executed.add(row.name);
    });
    return executed;
  } catch {
    return new Set();
  }
}

/**
 * Record migration as executed
 */
async function recordMigration(name: string): Promise<void> {
  await query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

/**
 * Run all pending migrations
 */
async function runMigrations(): Promise<void> {
  console.log('🔄 Starting database migrations...\n');

  const client = await getClient();

  try {
    // Create migrations table
    await createMigrationsTable();

    // Get list of executed migrations
    const executed = await getExecutedMigrations();
    console.log(`Found ${executed.size} previously executed migrations\n`);

    // Get all migration files
    const files = await getMigrationFiles();
    if (files.length === 0) {
      console.warn('⚠️  No migration files found in migrations/ directory');
      return;
    }

    // Track pending migrations
    const pending = files.filter((f) => !executed.has(f));

    if (pending.length === 0) {
      console.log('✅ Database is up to date! No migrations to run.');
      return;
    }

    console.log(`Running ${pending.length} pending migration(s):\n`);

    // Execute each pending migration
    for (const file of pending) {
      try {
        console.log(`  📝 ${file}...`);

        // Read migration file
        const sql = await readMigrationFile(file);

        // Split by semicolon to handle multiple statements
        const statements = sql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        // Execute each statement
        for (const statement of statements) {
          await client.query(statement);
        }

        // Record migration as executed
        await recordMigration(file);
        console.log(`     ✓ Success`);
      } catch (error) {
        console.error(`     ❌ Failed:`);
        console.error(error);
        throw error;
      }
    }

    console.log(`\n✅ All migrations completed successfully!`);
    console.log(`\nDatabase schema created with:`);
    console.log('  - users table (internal team)');
    console.log('  - categories table (Infrastructure, Illegal Dumping)');
    console.log('  - reports table (civic issues)');
    console.log('  - report_media table (photos/videos)');
    console.log('  - status_history table (audit trail)');
  } finally {
    client.release();
    await closePool();
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
