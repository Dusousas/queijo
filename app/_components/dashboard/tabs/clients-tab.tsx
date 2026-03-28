import { FormEvent } from "react";
import { Client, ClientDebtSnapshot, ClientFormState } from "../types";
import { toBrl } from "../utils";

type ClientsTabProps = {
  clients: Client[];
  clientDebtSnapshots: ClientDebtSnapshot[];
  form: ClientFormState;
  onFormChange: (field: keyof ClientFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ClientsTab({
  clients,
  clientDebtSnapshots,
  form,
  onFormChange,
  onSubmit,
}: ClientsTabProps) {
  return (
    <section className="stack">
      <form className="card stack-sm" onSubmit={onSubmit}>
        <label className="field">
          <span>Nome completo</span>
          <input
            value={form.fullName}
            onChange={(event) => onFormChange("fullName", event.target.value)}
            placeholder="Ex: Joao Carlos da Silva"
            required
          />
        </label>
        <label className="field">
          <span>Cidade</span>
          <input
            value={form.city}
            onChange={(event) => onFormChange("city", event.target.value)}
            placeholder="Ex: Belo Horizonte"
            required
          />
        </label>
        <label className="field">
          <span>CPF</span>
          <input
            value={form.cpf}
            onChange={(event) => onFormChange("cpf", event.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
            required
          />
        </label>
        <button className="primary-button" type="submit">
          Salvar cliente
        </button>
      </form>

      <div className="stack-sm">
        <h3 className="list-title">Clientes cadastrados ({clients.length})</h3>
        {clients.length === 0 ? (
          <div className="card muted">Nenhum cliente cadastrado.</div>
        ) : (
          <div className="records-grid">
            {clients.map((client) => (
              <article key={client.id} className="card card-list">
                <h4>{client.fullName}</h4>
                <p>{client.city}</p>
                <p>{client.cpf}</p>
                {(() => {
                  const summary = clientDebtSnapshots.find((item) => item.clientId === client.id);
                  if (!summary) {
                    return <small>Ainda sem compras registradas.</small>;
                  }

                  return (
                    <div className="client-summary-list">
                      <small>Ja gastou <strong>{toBrl(summary.totalSpent)}</strong></small>
                      <small>Ja pagou <strong>{toBrl(summary.totalPaid)}</strong></small>
                      <small>Em aberto <strong>{toBrl(summary.totalDue)}</strong></small>
                    </div>
                  );
                })()}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
