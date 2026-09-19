const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function databaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) throw new Error('DATABASE_URL is not set.');

  const parsed = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('DATABASE_URL must use the postgres or postgresql protocol.');
  }

  return parsed;
}

async function main() {
  const url = databaseUrl();
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const client = new Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 15_000,
    ssl: local ? undefined : { rejectUnauthorized: false },
  });

  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(schema);
    await client.query('COMMIT');
    console.log('Database migration complete.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
