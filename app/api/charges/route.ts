import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase, getPool } from "@/lib/db";
import { Charge } from "@/app/_components/dashboard/types";
import { isAuthenticatedRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

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
    const paidAmount = Number.isFinite(body.paidAmount) ? body.paidAmount : 0;
    const status = body.status ?? "pendente";
    const updatedAt = body.updatedAt ?? body.createdAt;

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
          paid_amount,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        body.id,
        body.clientId,
        body.clientName.trim(),
        body.city.trim(),
        body.productId,
        body.productName.trim(),
        body.amount,
        paidAmount,
        status,
        body.createdAt,
        updatedAt,
      ],
    );

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar cobranca.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
