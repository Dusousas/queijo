"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BottomNav } from "./dashboard/bottom-nav";
import { STORAGE_KEY, TAB_COPY } from "./dashboard/constants";
import { DesktopSidebar } from "./dashboard/desktop-sidebar";
import { DesktopTopbar } from "./dashboard/desktop-topbar";
import { ChargesTab } from "./dashboard/tabs/charges-tab";
import { ClientsTab } from "./dashboard/tabs/clients-tab";
import { GeneralTab } from "./dashboard/tabs/general-tab";
import { ProductsTab } from "./dashboard/tabs/products-tab";
import { ReportsTab } from "./dashboard/tabs/reports-tab";
import {
  Charge,
  ChargeFormState,
  Client,
  ClientFormState,
  Product,
  ProductFormState,
  ReportSummary,
  StorageData,
  TabKey,
} from "./dashboard/types";
import { createId, formatCpf } from "./dashboard/utils";

export function MvpDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("geral");
  const [isReady, setIsReady] = useState(false);
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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StorageData;
        setClients(Array.isArray(parsed.clients) ? parsed.clients : []);
        setProducts(Array.isArray(parsed.products) ? parsed.products : []);
        setCharges(Array.isArray(parsed.charges) ? parsed.charges : []);
      }
    } catch {
      // If parsing fails, keep empty lists.
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const payload: StorageData = { clients, products, charges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [charges, clients, isReady, products]);

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
    const totalDebt = totalSales;
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
      avgTicket,
      byCity,
      byProduct,
    };
  }, [charges]);

  const tabCounters: Record<TabKey, number> = useMemo(
    () => ({
      geral: charges.length + clients.length + products.length,
      clientes: clients.length,
      cobranca: charges.length,
      produtos: products.length,
      relatorios: report.byCity.length + report.byProduct.length,
    }),
    [charges.length, clients.length, products.length, report.byCity.length, report.byProduct.length],
  );

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

  const topDebtors = useMemo(() => {
    const debtorMap = new Map<string, number>();
    for (const charge of charges) {
      debtorMap.set(charge.clientName, (debtorMap.get(charge.clientName) ?? 0) + charge.amount);
    }

    return Array.from(debtorMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [charges]);

  const activeTabCopy = TAB_COPY[activeTab];

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

  function handleClientSubmit(event: FormEvent<HTMLFormElement>) {
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

    setClients((prev) => [newClient, ...prev]);
    setClientForm({ fullName: "", city: "", cpf: "" });
  }

  function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
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

    setProducts((prev) => [newProduct, ...prev]);
    setProductForm({ name: "", price: "" });
  }

  function handleChargeSubmit(event: FormEvent<HTMLFormElement>) {
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
      createdAt: Date.now(),
    };

    setCharges((prev) => [newCharge, ...prev]);
    setChargeForm({ clientId: "", productId: "", amount: "" });
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
          <DesktopTopbar />

          <div className="mobile-frame">
            <header className="app-header">
              <h1>{activeTabCopy.title}</h1>
              <p className="muted">{activeTabCopy.description}</p>
            </header>

            <main className="app-content">
              {!isReady ? <div className="card">Carregando seus dados...</div> : null}

              {isReady && activeTab === "geral" ? (
                <GeneralTab
                  totalDebt={report.totalDebt}
                  totalEntries={report.totalSales}
                  totalClients={clients.length}
                  totalProducts={products.length}
                  totalCharges={charges.length}
                  avgTicket={report.avgTicket}
                  monthSeries={monthSeries}
                  citySeries={report.byCity}
                  productSeries={report.byProduct}
                  topDebtors={topDebtors}
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
                  charges={charges}
                  form={chargeForm}
                  onFormChange={updateChargeForm}
                  selectedClientCity={selectedClient?.city ?? ""}
                  selectedProductPrice={selectedProduct?.price ?? null}
                  onSubmit={handleChargeSubmit}
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
