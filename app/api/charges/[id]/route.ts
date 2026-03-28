import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase, getPool } from "@/lib/db";
import { Charge } from "@/app/_components/dashboard/types";

export const runtime = "nodejs";

function resolveStatus(amount: number, paidAmount: number): Charge["status"] {
  if (paidAmount <= 0) return "pendente";
  if (paidAmount >= amount) return "pago";
  return "parcial";
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await ensureDatabase();
    const { id } = await context.params;
    const body = (await request.json()) as { paymentAmount?: number };
    const paymentAmount = Number(body.paymentAmount);

    if (!id || Number.isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ error: "Pagamento invalido." }, { status: 400 });
    }

    const pool = getPool();
    const currentResult = await pool.query(
      `
        SELECT id, amount, paid_amount, status
        FROM charges
        WHERE id = $1
      `,
      [id],
    );

    if (currentResult.rowCount === 0) {
      return NextResponse.json({ error: "Cobranca nao encontrada." }, { status: 404 });
    }

    const current = currentResult.rows[0];
    const amount = Number(current.amount);
    const nextPaidAmount = Math.min(amount, Number(current.paid_amount) + paymentAmount);
    const nextStatus = resolveStatus(amount, nextPaidAmount);
    const updatedAt = Date.now();

    const result = await pool.query(
      `
        UPDATE charges
        SET paid_amount = $2,
            status = $3,
            updated_at = $4
        WHERE id = $1
        RETURNING id, client_id, client_name, city, product_id, product_name, amount, paid_amount, status, created_at, updated_at
      `,
      [id, nextPaidAmount, nextStatus, updatedAt],
    );

    const row = result.rows[0];
    const charge: Charge = {
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      city: row.city,
      productId: row.product_id,
      productName: row.product_name,
      amount: Number(row.amount),
      paidAmount: Number(row.paid_amount),
      status: row.status,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    };

    return NextResponse.json(charge);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao registrar pagamento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
