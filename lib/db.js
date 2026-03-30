const { Pool } = require('pg');

let pool;

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';
}

function getPool() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('DATABASE_URL or SUPABASE_DB_URL is not set');
  }
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

module.exports = { getPool, query };
