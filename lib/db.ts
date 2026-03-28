import { Pool } from "pg";

declare global {
  var __queijoPool: Pool | undefined;
  var __queijoInitPromise: Promise<void> | undefined;
}

function getConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT ?? "5432";
  const database = process.env.POSTGRES_DB;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;

  if (!host || !database || !user || !password) {
    throw new Error(
      "Postgres nao configurado. Defina DATABASE_URL ou POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER e POSTGRES_PASSWORD.",
    );
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

export function getPool() {
  if (!global.__queijoPool) {
    global.__queijoPool = new Pool({
      connectionString: getConnectionString(),
      ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false,
    });
  }

  return global.__queijoPool;
}

export async function ensureDatabase() {
  if (!global.__queijoInitPromise) {
    global.__queijoInitPromise = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          city TEXT NOT NULL,
          cpf TEXT NOT NULL,
          created_at BIGINT NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price NUMERIC(12, 2) NOT NULL,
          created_at BIGINT NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS charges (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          client_name TEXT NOT NULL,
          city TEXT NOT NULL,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
          product_name TEXT NOT NULL,
          amount NUMERIC(12, 2) NOT NULL,
          created_at BIGINT NOT NULL
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_charges_created_at ON charges(created_at DESC);
      `);
    })();
  }

  await global.__queijoInitPromise;
}
