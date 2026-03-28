import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase, getPool } from "@/lib/db";
import { Charge } from "@/app/_components/dashboard/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await ensureDatabase();
    const body = (await request.json()) as Charge;

    if (
      !body.id ||
      !body.clientId ||
      !body.clientName?.trim() ||
      !body.city?.trim() ||
      !body.productId ||
      !body.productName?.trim() ||
      Number.isNaN(body.amount) ||
      body.amount <= 0
    ) {
      return NextResponse.json({ error: "Dados da cobranca invalidos." }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `
        INSERT INTO charges (
          id,
          client_id,
          client_name,
          city,
          product_id,
          product_name,
          amount,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        body.id,
        body.clientId,
        body.clientName.trim(),
        body.city.trim(),
        body.productId,
        body.productName.trim(),
        body.amount,
        body.createdAt,
      ],
    );

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar cobranca.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
