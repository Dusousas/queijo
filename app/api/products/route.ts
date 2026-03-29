import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase, getPool } from "@/lib/db";
import { Product } from "@/app/_components/dashboard/types";
import { isAuthenticatedRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  try {
    await ensureDatabase();
    const body = (await request.json()) as Product;

    if (!body.id || !body.name?.trim() || Number.isNaN(body.price) || body.price <= 0) {
      return NextResponse.json({ error: "Dados do produto invalidos." }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `
        INSERT INTO products (id, name, price, created_at)
        VALUES ($1, $2, $3, $4)
      `,
      [body.id, body.name.trim(), body.price, body.createdAt],
    );

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar produto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
