import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase, getPool } from "@/lib/db";
import { Client } from "@/app/_components/dashboard/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await ensureDatabase();
    const body = (await request.json()) as Client;

    if (!body.id || !body.fullName?.trim() || !body.city?.trim() || !body.cpf?.trim()) {
      return NextResponse.json({ error: "Dados do cliente invalidos." }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `
        INSERT INTO clients (id, full_name, city, cpf, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [body.id, body.fullName.trim(), body.city.trim(), body.cpf.trim(), body.createdAt],
    );

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar cliente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
