/**
 * Validate database schema
 * Run with: npm run db:validate
 */

import { query, closePool } from './connection.js';

async function validateSchema(): Promise<void> {
  console.log('🔍 Validating database schema...\n');

  try {
    // Check each table exists
    console.log('1️⃣  Checking tables exist:');

    const tables = [
      'users',
      'categories',
      'reports',
      'report_media',
      'status_history',
    ];

    for (const table of tables) {
      const result = await query(
        `SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = $1
        )`,
        [table]
      );

      const exists = (result.rows[0] as { exists: boolean }).exists;
      if (exists) {
        console.log(`   ✓ ${table}`);
      } else {
        console.log(`   ✗ ${table} - NOT FOUND`);
        throw new Error(`Table ${table} not found`);
      }
    }

    console.log();

    // Check row counts
    console.log('2️⃣  Checking data:');

    for (const table of tables) {
      const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = (result.rows[0] as { count: number }).count;
      console.log(`   ${table}: ${count} rows`);
    }

    console.log();

    // Check categories are seeded
    console.log('3️⃣  Checking categories are seeded:');
    const catResult = await query(
      'SELECT id, name FROM categories ORDER BY id'
    );
    const categories = catResult.rows as { id: number; name: string }[];

    if (categories.length === 0) {
      throw new Error('Categories not seeded');
    }

    for (const cat of categories) {
      console.log(`   ${cat.id}: ${cat.name}`);
    }

    console.log();

    // Check indexes
    console.log('4️⃣  Checking indexes created:');
    const indexResult = await query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename != 'pg_catalog'
      ORDER BY indexname
    `);
    const indexes = indexResult.rows as { indexname: string }[];

    if (indexes.length === 0) {
      console.warn('   ⚠️  No indexes found');
    } else {
      console.log(`   ${indexes.length} indexes found:`);
      indexes.forEach((idx) => {
        if (!idx.indexname.startsWith('pg_')) {
          console.log(`   ✓ ${idx.indexname}`);
        }
      });
    }

    console.log();

    console.log('✅ Schema validation passed!');
    console.log(
      '\nNext steps:\n  npm run dev         (start the server)\n'
    );
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

validateSchema();
