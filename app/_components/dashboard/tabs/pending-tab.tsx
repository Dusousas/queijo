import { useMemo, useState } from "react";
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
  const [showAllDebtors, setShowAllDebtors] = useState(false);
  const [showAllCharges, setShowAllCharges] = useState(false);

  const filteredDebtors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return clientDebtSnapshots
      .filter((snapshot) => snapshot.totalDue > 0)
      .filter((snapshot) =>
        normalized
          ? `${snapshot.clientName} ${snapshot.city}`.toLowerCase().includes(normalized)
          : true,
      );
  }, [clientDebtSnapshots, query]);

  const filteredCharges = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return charges.filter((charge) =>
      normalized
        ? `${charge.clientName} ${charge.city} ${charge.productName}`.toLowerCase().includes(normalized)
        : true,
    );
  }, [charges, query]);

  const visibleDebtors = useMemo(
    () => (showAllDebtors ? filteredDebtors : filteredDebtors.slice(0, 4)),
    [filteredDebtors, showAllDebtors],
  );

  const visibleCharges = useMemo(
    () => (showAllCharges ? filteredCharges : filteredCharges.slice(0, 5)),
    [filteredCharges, showAllCharges],
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
          <h3>{filteredDebtors.length}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Fiados em aberto</p>
          <h3>{filteredCharges.length}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Saldo pendente</p>
          <h3>{toBrl(filteredDebtors.reduce((sum, item) => sum + item.totalDue, 0))}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Ja recebido</p>
          <h3>{toBrl(filteredDebtors.reduce((sum, item) => sum + item.totalPaid, 0))}</h3>
        </article>
      </div>

      <article className="card stack-sm">
        <div className="pending-toolbar">
          <div>
            <h3 className="list-title">Gerenciar pendencias</h3>
            <p className="helper">
              Veja apenas quem ainda deve e registre pagamentos parciais ou quites.
            </p>
          </div>

          <label className="field pending-search">
            <span>Buscar cliente</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowAllDebtors(false);
                setShowAllCharges(false);
              }}
              placeholder="Nome, cidade ou produto"
            />
          </label>
        </div>

        <div className="debtor-grid">
          {filteredDebtors.length === 0 ? (
            <div className="card muted">Nenhum cliente com saldo em aberto.</div>
          ) : (
            visibleDebtors.map((snapshot) => (
              <article key={snapshot.clientId} className="debtor-card">
                <div>
                  <h4>{snapshot.clientName}</h4>
                  <p>{snapshot.city}</p>
                </div>
                <div className="debtor-metrics">
                  <span>Ja gastou {toBrl(snapshot.totalSpent)}</span>
                  <span>Ja pagou {toBrl(snapshot.totalPaid)}</span>
                  <span>{snapshot.totalOpenCharges} fiado(s) em aberto</span>
                  <strong>Deve {toBrl(snapshot.totalDue)}</strong>
                </div>
              </article>
            ))
          )}
        </div>

        {filteredDebtors.length > visibleDebtors.length ? (
          <button
            type="button"
            className="inline-toggle"
            onClick={() => setShowAllDebtors(true)}
          >
            Ver mais {filteredDebtors.length - visibleDebtors.length} cliente(s)
          </button>
        ) : null}
      </article>

      <article className="card stack-sm">
        <h3 className="list-title">Lancamentos pendentes ({filteredCharges.length})</h3>
        {filteredCharges.length === 0 ? (
          <div className="card muted">Nenhum fiado pendente no momento.</div>
        ) : (
          <>
            <div className="records-grid compact-records-grid">
              {visibleCharges.map((charge) => {
                const remaining = getRemainingAmount(charge);
                return (
                  <article key={charge.id} className="card charge-manage-card">
                    <div className="charge-manage-head">
                      <div>
                        <h4>{charge.clientName}</h4>
                        <p>
                          {charge.city} - {charge.productName}
                        </p>
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

                    <small>Atualizado em {formatDate(charge.updatedAt)}</small>
                  </article>
                );
              })}
            </div>

            {filteredCharges.length > visibleCharges.length ? (
              <button
                type="button"
                className="inline-toggle"
                onClick={() => setShowAllCharges(true)}
              >
                Ver mais {filteredCharges.length - visibleCharges.length} lancamento(s)
              </button>
            ) : null}
          </>
        )}
      </article>
    </section>
  );
}
