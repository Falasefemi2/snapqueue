import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10000,
});

export async function executeSql(text: string, values?: unknown[]) {
  return await pool.query(text, values);
}

export async function close() {
  return await pool.end();
}
