"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BottomNav } from "./dashboard/bottom-nav";
import { DesktopSidebar } from "./dashboard/desktop-sidebar";
import { LogoutButton } from "./dashboard/logout-button";
import { ChargesTab } from "./dashboard/tabs/charges-tab";
import { ClientsTab } from "./dashboard/tabs/clients-tab";
import { GeneralTab } from "./dashboard/tabs/general-tab";
import { PendingTab } from "./dashboard/tabs/pending-tab";
import { ProductsTab } from "./dashboard/tabs/products-tab";
import { ReportsTab } from "./dashboard/tabs/reports-tab";
import {
  Charge,
  ChargeFormState,
  Client,
  ClientDebtSnapshot,
  ClientFormState,
  Product,
  ProductFormState,
  ReportSummary,
  StorageData,
  TabKey,
} from "./dashboard/types";
import { createId, formatCpf } from "./dashboard/utils";

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = (await response.json()) as T | { error?: string };

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data && data.error
        ? data.error
        : "Erro ao processar requisicao.";
    throw new Error(message);
  }

  return data as T;
}

export function MvpDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("geral");
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);

  const [clientForm, setClientForm] = useState<ClientFormState>({
    fullName: "",
    city: "",
    cpf: "",
  });

  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    price: "",
  });

  const [chargeForm, setChargeForm] = useState<ChargeFormState>({
    clientId: "",
    productId: "",
    amount: "",
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsSyncing(true);
      try {
        const payload = await readJson<StorageData>("/api/bootstrap");
        if (!active) return;
        setClients(Array.isArray(payload.clients) ? payload.clients : []);
        setProducts(Array.isArray(payload.products) ? payload.products : []);
        setCharges(Array.isArray(payload.charges) ? payload.charges : []);
        setErrorMessage("");
      } catch (error) {
        if (!active) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Nao foi possivel carregar os dados do banco.",
        );
      } finally {
        if (active) {
          setIsReady(true);
          setIsSyncing(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === chargeForm.clientId),
    [chargeForm.clientId, clients],
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === chargeForm.productId),
    [chargeForm.productId, products],
  );

  const report = useMemo<ReportSummary>(() => {
    const totalSales = charges.reduce((sum, item) => sum + item.amount, 0);
    const totalReceived = charges.reduce((sum, item) => sum + item.paidAmount, 0);
    const totalDebt = charges.reduce(
      (sum, item) => sum + Math.max(0, item.amount - item.paidAmount),
      0,
    );
    const avgTicket = charges.length > 0 ? totalSales / charges.length : 0;

    const cityMap = new Map<string, number>();
    const productMap = new Map<string, number>();

    for (const item of charges) {
      cityMap.set(item.city, (cityMap.get(item.city) ?? 0) + item.amount);
      productMap.set(item.productName, (productMap.get(item.productName) ?? 0) + item.amount);
    }

    const byCity = Array.from(cityMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const byProduct = Array.from(productMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalSales,
      totalDebt,
      totalReceived,
      avgTicket,
      byCity,
      byProduct,
    };
  }, [charges]);

  const monthSeries = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; period: string; total: number }[] = [];

    for (let i = 11; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const period = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      buckets.push({ key, period, total: 0 });
    }

    const indexByKey = new Map(buckets.map((item, index) => [item.key, index]));

    for (const charge of charges) {
      const date = new Date(charge.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const index = indexByKey.get(key);
      if (index !== undefined) {
        buckets[index].total += charge.amount;
      }
    }

    return buckets.map(({ period, total }) => ({
      period: period.charAt(0).toUpperCase() + period.slice(1),
      total,
    }));
  }, [charges]);

  const pendingCharges = useMemo(
    () => charges.filter((charge) => charge.status !== "pago"),
    [charges],
  );

  const clientDebtSnapshots = useMemo<ClientDebtSnapshot[]>(() => {
    const aggregate = new Map<
      string,
      ClientDebtSnapshot
    >();

    for (const charge of charges) {
      const current = aggregate.get(charge.clientId) ?? {
        clientId: charge.clientId,
        clientName: charge.clientName,
        city: charge.city,
        totalSpent: 0,
        totalPaid: 0,
        totalDue: 0,
        totalOpenCharges: 0,
      };

      current.totalSpent += charge.amount;
      current.totalPaid += charge.paidAmount;
      current.totalDue += Math.max(0, charge.amount - charge.paidAmount);
      if (charge.status !== "pago") {
        current.totalOpenCharges += 1;
      }

      aggregate.set(charge.clientId, current);
    }

    return Array.from(aggregate.values()).sort((a, b) => b.totalDue - a.totalDue);
  }, [charges]);

  const debtorsCount = useMemo(
    () => clientDebtSnapshots.filter((snapshot) => snapshot.totalDue > 0).length,
    [clientDebtSnapshots],
  );

  const tabCounters: Record<TabKey, number> = useMemo(
    () => ({
      geral: debtorsCount + pendingCharges.length,
      cobranca: charges.length,
      pendencias: pendingCharges.length,
      clientes: clients.length,
      produtos: products.length,
      relatorios: report.byCity.length + report.byProduct.length,
    }),
    [
      debtorsCount,
      pendingCharges.length,
      charges.length,
      clients.length,
      products.length,
      report.byCity.length,
      report.byProduct.length,
    ],
  );

  function updateClientForm(field: keyof ClientFormState, value: string) {
    setClientForm((prev) => ({
      ...prev,
      [field]: field === "cpf" ? formatCpf(value) : value,
    }));
  }

  function updateProductForm(field: keyof ProductFormState, value: string) {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateChargeForm(field: keyof ChargeFormState, value: string) {
    setChargeForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleClientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clientForm.fullName.trim() || !clientForm.city.trim() || !clientForm.cpf) {
      return;
    }

    const newClient: Client = {
      id: createId(),
      fullName: clientForm.fullName.trim(),
      city: clientForm.city.trim(),
      cpf: clientForm.cpf,
      createdAt: Date.now(),
    };

    setIsSyncing(true);
    try {
      const savedClient = await readJson<Client>("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      setClients((prev) => [savedClient, ...prev]);
      setClientForm({ fullName: "", city: "", cpf: "" });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel salvar o cliente.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(productForm.price);

    if (!productForm.name.trim() || Number.isNaN(value) || value <= 0) {
      return;
    }

    const newProduct: Product = {
      id: createId(),
      name: productForm.name.trim(),
      price: value,
      createdAt: Date.now(),
    };

    setIsSyncing(true);
    try {
      const savedProduct = await readJson<Product>("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      setProducts((prev) => [savedProduct, ...prev]);
      setProductForm({ name: "", price: "" });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel salvar o produto.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleChargeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClient || !selectedProduct) return;

    const amount =
      Number(chargeForm.amount) > 0 ? Number(chargeForm.amount) : selectedProduct.price;
    if (Number.isNaN(amount) || amount <= 0) return;

    const newCharge: Charge = {
      id: createId(),
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      city: selectedClient.city,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      amount,
      paidAmount: 0,
      status: "pendente",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setIsSyncing(true);
    try {
      const savedCharge = await readJson<Charge>("/api/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCharge),
      });
      setCharges((prev) => [savedCharge, ...prev]);
      setChargeForm({ clientId: "", productId: "", amount: "" });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel salvar a cobranca.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleRegisterPayment(chargeId: string, paymentAmount: number) {
    setIsSyncing(true);
    try {
      const savedCharge = await readJson<Charge>(`/api/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentAmount }),
      });

      setCharges((prev) =>
        prev.map((charge) => (charge.id === savedCharge.id ? savedCharge : charge)),
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel registrar o pagamento.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="dashboard-layout">
        <DesktopSidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          tabCounters={tabCounters}
        />

        <div className="desktop-workspace">
          <div className="mobile-frame">
            <main className="app-content">
              <div className="content-actions">
                <LogoutButton />
              </div>

              {!isReady ? <div className="card">Carregando seus dados...</div> : null}
              {isReady && isSyncing ? <div className="card">Sincronizando com o banco...</div> : null}
              {errorMessage ? <div className="card">{errorMessage}</div> : null}

              {isReady && activeTab === "geral" ? (
                <GeneralTab
                  totalSales={report.totalSales}
                  totalDebt={report.totalDebt}
                  totalReceived={report.totalReceived}
                  totalOpenClients={debtorsCount}
                  monthSeries={monthSeries}
                />
              ) : null}

              {isReady && activeTab === "clientes" ? (
                <ClientsTab
                  clients={clients}
                  form={clientForm}
                  onFormChange={updateClientForm}
                  onSubmit={handleClientSubmit}
                />
              ) : null}

              {isReady && activeTab === "cobranca" ? (
                <ChargesTab
                  clients={clients}
                  products={products}
                  form={chargeForm}
                  onFormChange={updateChargeForm}
                  selectedClientCity={selectedClient?.city ?? ""}
                  selectedProductPrice={selectedProduct?.price ?? null}
                  onSubmit={handleChargeSubmit}
                  clientDebtSnapshots={clientDebtSnapshots}
                />
              ) : null}

              {isReady && activeTab === "pendencias" ? (
                <PendingTab
                  charges={pendingCharges}
                  clientDebtSnapshots={clientDebtSnapshots}
                  onRegisterPayment={handleRegisterPayment}
                />
              ) : null}

              {isReady && activeTab === "produtos" ? (
                <ProductsTab
                  products={products}
                  form={productForm}
                  onFormChange={updateProductForm}
                  onSubmit={handleProductSubmit}
                />
              ) : null}

              {isReady && activeTab === "relatorios" ? (
                <ReportsTab report={report} clientsCount={clients.length} />
              ) : null}
            </main>

            <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
