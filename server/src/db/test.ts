/**
 * Database connection test utility
 * Run with: npm run db:test
 */

import { query, healthCheck, closePool } from './connection.js';

async function testConnection(): Promise<void> {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣  Testing basic connection...');
    const healthy = await healthCheck();
    if (!healthy) {
      console.error('❌ Connection failed');
      process.exit(1);
    }
    console.log('✓ Connection successful\n');

    // Test 2: Version check
    console.log('2️⃣  Checking PostgreSQL version...');
    const versionResult = await query('SELECT version()');
    const version = (versionResult.rows[0] as { version: string }).version;
    console.log(`✓ ${version}\n`);

    // Test 3: List tables
    console.log('3️⃣  Checking existing tables...');
    const tablesResult = await query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );
    const tables = tablesResult.rows as { table_name: string }[];
    if (tables.length === 0) {
      console.log('ℹ️  No tables found (expected before running migrations)\n');
    } else {
      console.log('Existing tables:');
      tables.forEach((t) => {
        console.log(`  - ${t.table_name}`);
      });
      console.log();
    }

    // Test 4: Check pool status
    console.log('4️⃣  Connection pool status:');
    console.log('  Pool configured: min=2, max=10');
    console.log('  Idle timeout: 30s');
    console.log('  Connection timeout: 2s\n');

    console.log('✅ All database tests passed!');
    console.log(
      '\nNext steps:\n  npm run migrate    (to create database schema)\n'
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

testConnection();
