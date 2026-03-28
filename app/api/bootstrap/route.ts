import { NextResponse } from "next/server";
import { ensureDatabase, getPool } from "@/lib/db";
import { Charge, Client, Product, StorageData } from "@/app/_components/dashboard/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureDatabase();
    const pool = getPool();

    const [clientsResult, productsResult, chargesResult] = await Promise.all([
      pool.query(
        "SELECT id, full_name, city, cpf, created_at FROM clients ORDER BY created_at DESC",
      ),
      pool.query(
        "SELECT id, name, price, created_at FROM products ORDER BY created_at DESC",
      ),
      pool.query(
        "SELECT id, client_id, client_name, city, product_id, product_name, amount, created_at FROM charges ORDER BY created_at DESC",
      ),
    ]);

    const clients: Client[] = clientsResult.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      city: row.city,
      cpf: row.cpf,
      createdAt: Number(row.created_at),
    }));

    const products: Product[] = productsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price),
      createdAt: Number(row.created_at),
    }));

    const charges: Charge[] = chargesResult.rows.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      city: row.city,
      productId: row.product_id,
      productName: row.product_name,
      amount: Number(row.amount),
      createdAt: Number(row.created_at),
    }));

    const data: StorageData = { clients, products, charges };
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar dados.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
