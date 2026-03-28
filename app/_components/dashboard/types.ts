export type TabKey =
  | "geral"
  | "clientes"
  | "cobranca"
  | "pendencias"
  | "produtos"
  | "relatorios";

export type Client = {
  id: string;
  fullName: string;
  city: string;
  cpf: string;
  createdAt: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  createdAt: number;
};

export type Charge = {
  id: string;
  clientId: string;
  clientName: string;
  city: string;
  productId: string;
  productName: string;
  amount: number;
  paidAmount: number;
  status: "pendente" | "parcial" | "pago";
  createdAt: number;
  updatedAt: number;
};

export type ClientDebtSnapshot = {
  clientId: string;
  clientName: string;
  city: string;
  totalSpent: number;
  totalPaid: number;
  totalDue: number;
  totalOpenCharges: number;
};

export type StorageData = {
  clients: Client[];
  products: Product[];
  charges: Charge[];
};

export type ReportRow = {
  label: string;
  value: number;
};

export type ReportSummary = {
  totalSales: number;
  totalDebt: number;
  totalReceived: number;
  avgTicket: number;
  byCity: ReportRow[];
  byProduct: ReportRow[];
};

export type ClientFormState = {
  fullName: string;
  city: string;
  cpf: string;
};

export type ProductFormState = {
  name: string;
  price: string;
};

export type ChargeFormState = {
  clientId: string;
  productId: string;
  amount: string;
};
