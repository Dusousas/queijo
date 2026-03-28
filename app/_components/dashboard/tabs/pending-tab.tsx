import { useMemo, useState } from "react";
import { DetailModal } from "../detail-modal";
import { Charge, ClientDebtSnapshot } from "../types";
import { formatDate, toBrl } from "../utils";

type PendingTabProps = {
  charges: Charge[];
  clientDebtSnapshots: ClientDebtSnapshot[];
  onRegisterPayment: (chargeId: string, paymentAmount: number) => Promise<void>;
};

function getRemainingAmount(charge: Charge) {
  return Math.max(0, charge.amount - charge.paidAmount);
}

function getStatusLabel(charge: Charge) {
  if (charge.status === "pago") return "Pago";
  if (charge.status === "parcial") return "Parcial";
  return "Pendente";
}

export function PendingTab({
  charges,
  clientDebtSnapshots,
  onRegisterPayment,
}: PendingTabProps) {
  const [query, setQuery] = useState("");
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, string>>({});
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const debtors = useMemo(
    () => clientDebtSnapshots.filter((snapshot) => snapshot.totalDue > 0),
    [clientDebtSnapshots],
  );

  const filteredDebtors = useMemo(() => {
    if (!normalizedQuery) return debtors.slice(0, 8);

    return debtors.filter((snapshot) =>
      `${snapshot.clientName} ${snapshot.city}`.toLowerCase().includes(normalizedQuery),
    );
  }, [debtors, normalizedQuery]);

  const cityGroups = useMemo(() => {
    const aggregate = new Map<
      string,
      { city: string; debtors: number; totalDue: number; totalOpenCharges: number }
    >();

    for (const snapshot of debtors) {
      const current = aggregate.get(snapshot.city) ?? {
        city: snapshot.city,
        debtors: 0,
        totalDue: 0,
        totalOpenCharges: 0,
      };

      current.debtors += 1;
      current.totalDue += snapshot.totalDue;
      current.totalOpenCharges += snapshot.totalOpenCharges;
      aggregate.set(snapshot.city, current);
    }

    return Array.from(aggregate.values()).sort((a, b) => b.totalDue - a.totalDue);
  }, [debtors]);

  const visibleCities = useMemo(() => cityGroups.slice(0, 6), [cityGroups]);

  const selectedClient = useMemo(
    () => debtors.find((snapshot) => snapshot.clientId === selectedClientId) ?? null,
    [debtors, selectedClientId],
  );

  const selectedClientCharges = useMemo(
    () =>
      selectedClientId
        ? charges.filter((charge) => charge.clientId === selectedClientId)
        : [],
    [charges, selectedClientId],
  );

  const selectedCityDebtors = useMemo(
    () =>
      selectedCity
        ? debtors.filter((snapshot) => snapshot.city.toLowerCase() === selectedCity.toLowerCase())
        : [],
    [debtors, selectedCity],
  );

  async function handlePaymentSubmit(charge: Charge) {
    const rawValue = paymentDrafts[charge.id] ?? "";
    const parsed = Number(rawValue);
    const remaining = getRemainingAmount(charge);

    if (Number.isNaN(parsed) || parsed <= 0) {
      return;
    }

    await onRegisterPayment(charge.id, Math.min(parsed, remaining));
    setPaymentDrafts((prev) => ({ ...prev, [charge.id]: "" }));
  }

  return (
    <section className="stack">
      <div className="overview-kpi-grid">
        <article className="card overview-kpi-card">
          <p>Clientes devendo</p>
          <h3>{debtors.length}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Fiados em aberto</p>
          <h3>{charges.length}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Saldo pendente</p>
          <h3>{toBrl(debtors.reduce((sum, item) => sum + item.totalDue, 0))}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Cidades com pendencia</p>
          <h3>{cityGroups.length}</h3>
        </article>
      </div>

      <article className="card stack-sm">
        <div className="pending-toolbar">
          <div>
            <h3 className="list-title">Buscar pendencias</h3>
            <p className="helper">
              Pesquise por nome ou cidade. Toque no resultado para abrir o detalhe no pop-up.
            </p>
          </div>

          <label className="field pending-search">
            <span>Buscar nome ou cidade</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex: Ana Laura ou Torrinha"
            />
          </label>
        </div>

        <div className="city-chip-row">
          {visibleCities.map((city) => (
            <button
              key={city.city}
              type="button"
              className="city-chip"
              onClick={() => setSelectedCity(city.city)}
            >
              <strong>{city.city}</strong>
              <span>{city.debtors} cliente(s)</span>
            </button>
          ))}
        </div>

        <div className="pending-results-list">
          {filteredDebtors.length === 0 ? (
            <div className="card muted">Nenhum cliente encontrado com pendencia.</div>
          ) : (
            filteredDebtors.map((snapshot) => (
              <button
                key={snapshot.clientId}
                type="button"
                className="pending-result-card"
                onClick={() => setSelectedClientId(snapshot.clientId)}
              >
                <div>
                  <h4>{snapshot.clientName}</h4>
                  <p>{snapshot.city}</p>
                </div>
                <div className="pending-result-meta">
                  <span>{snapshot.totalOpenCharges} fiado(s)</span>
                  <strong>{toBrl(snapshot.totalDue)}</strong>
                </div>
              </button>
            ))
          )}
        </div>
      </article>

      {selectedClient ? (
        <DetailModal
          title={selectedClient.clientName}
          subtitle={`${selectedClient.city} • ${selectedClient.totalOpenCharges} fiado(s) em aberto`}
          onClose={() => setSelectedClientId(null)}
        >
          <div className="modal-metric-grid">
            <article className="card overview-mini-card">
              <p>Ja gastou</p>
              <h4>{toBrl(selectedClient.totalSpent)}</h4>
            </article>
            <article className="card overview-mini-card">
              <p>Ja pagou</p>
              <h4>{toBrl(selectedClient.totalPaid)}</h4>
            </article>
            <article className="card overview-mini-card">
              <p>Em aberto</p>
              <h4>{toBrl(selectedClient.totalDue)}</h4>
            </article>
          </div>

          <div className="modal-records">
            {selectedClientCharges.map((charge) => {
              const remaining = getRemainingAmount(charge);
              return (
                <article key={charge.id} className="card charge-manage-card">
                  <div className="charge-manage-head">
                    <div>
                      <h4>{charge.productName}</h4>
                      <p>Atualizado em {formatDate(charge.updatedAt)}</p>
                    </div>
                    <span className={`status-pill ${charge.status}`}>{getStatusLabel(charge)}</span>
                  </div>

                  <div className="charge-balance-grid">
                    <div>
                      <span>Total</span>
                      <strong>{toBrl(charge.amount)}</strong>
                    </div>
                    <div>
                      <span>Pago</span>
                      <strong>{toBrl(charge.paidAmount)}</strong>
                    </div>
                    <div>
                      <span>Restante</span>
                      <strong>{toBrl(remaining)}</strong>
                    </div>
                  </div>

                  <div className="payment-row">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={paymentDrafts[charge.id] ?? ""}
                      onChange={(event) =>
                        setPaymentDrafts((prev) => ({
                          ...prev,
                          [charge.id]: event.target.value,
                        }))
                      }
                      placeholder={`Registrar pagamento ate ${toBrl(remaining)}`}
                    />
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => void handlePaymentSubmit(charge)}
                    >
                      Marcar pagamento
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </DetailModal>
      ) : null}

      {selectedCity ? (
        <DetailModal
          title={`Pendencias em ${selectedCity}`}
          subtitle={`${selectedCityDebtors.length} cliente(s) com saldo em aberto`}
          onClose={() => setSelectedCity(null)}
        >
          <div className="modal-metric-grid">
            <article className="card overview-mini-card">
              <p>Saldo total</p>
              <h4>{toBrl(selectedCityDebtors.reduce((sum, item) => sum + item.totalDue, 0))}</h4>
            </article>
            <article className="card overview-mini-card">
              <p>Clientes devendo</p>
              <h4>{selectedCityDebtors.length}</h4>
            </article>
            <article className="card overview-mini-card">
              <p>Fiados abertos</p>
              <h4>{selectedCityDebtors.reduce((sum, item) => sum + item.totalOpenCharges, 0)}</h4>
            </article>
          </div>

          <div className="modal-records">
            {selectedCityDebtors.map((snapshot) => (
              <button
                key={snapshot.clientId}
                type="button"
                className="pending-result-card"
                onClick={() => {
                  setSelectedCity(null);
                  setSelectedClientId(snapshot.clientId);
                }}
              >
                <div>
                  <h4>{snapshot.clientName}</h4>
                  <p>{snapshot.totalOpenCharges} fiado(s) em aberto</p>
                </div>
                <div className="pending-result-meta">
                  <span>Ja pagou {toBrl(snapshot.totalPaid)}</span>
                  <strong>{toBrl(snapshot.totalDue)}</strong>
                </div>
              </button>
            ))}
          </div>
        </DetailModal>
      ) : null}
    </section>
  );
}
