import { Pool, type PoolConfig, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

function databaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) throw new Error('DATABASE_URL is not set.');

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('DATABASE_URL is not a valid PostgreSQL connection string.');
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('DATABASE_URL must use the postgres or postgresql protocol.');
  }

  return parsed;
}

function createPool() {
  const url = databaseUrl();
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const config: PoolConfig = {
    connectionString: url.toString(),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 12_000,
    allowExitOnIdle: true,
    ssl: local ? undefined : { rejectUnauthorized: false },
  };

  const nextPool = new Pool(config);
  nextPool.on('error', error => {
    console.error('Idle PostgreSQL client error:', error);
  });
  return nextPool;
}

function getPool() {
  pool ??= createPool();
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, [...params]);
  return result.rows;
}
