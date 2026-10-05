import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Error handling for pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a query using the connection pool
 */
export async function query(
  text: string,
  params?: unknown[]
): Promise<{ rows: unknown[]; rowCount: number | null }> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
}

/**
 * Get a client for transaction support
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Health check: verify database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Health check failed', error);
    return false;
  }
}

/**
 * Gracefully close the pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
