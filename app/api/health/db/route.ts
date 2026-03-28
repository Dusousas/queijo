import { NextResponse } from "next/server";
import { ensureDatabase, getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureDatabase();
    const pool = getPool();

    const [metaResult, clientsResult, productsResult, chargesResult] = await Promise.all([
      pool.query(
        `
          SELECT
            current_database() AS database_name,
            NOW() AS checked_at
        `,
      ),
      pool.query("SELECT COUNT(*)::int AS total FROM clients"),
      pool.query("SELECT COUNT(*)::int AS total FROM products"),
      pool.query("SELECT COUNT(*)::int AS total FROM charges"),
    ]);

    return NextResponse.json({
      ok: true,
      database: metaResult.rows[0]?.database_name ?? null,
      checkedAt: metaResult.rows[0]?.checked_at ?? null,
      totals: {
        clients: clientsResult.rows[0]?.total ?? 0,
        products: productsResult.rows[0]?.total ?? 0,
        charges: chargesResult.rows[0]?.total ?? 0,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao conectar no banco de dados.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
