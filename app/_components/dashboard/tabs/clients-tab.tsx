import { FormEvent, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [showAllClients, setShowAllClients] = useState(false);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return clients.filter((client) =>
      `${client.fullName} ${client.city} ${client.cpf}`.toLowerCase().includes(query),
    );
  }, [clients, search]);

  const visibleClients = useMemo(
    () => (showAllClients ? filteredClients : filteredClients.slice(0, 4)),
    [filteredClients, showAllClients],
  );

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
        <div className="compact-list-head">
          <div>
            <h3 className="list-title">Clientes cadastrados ({clients.length})</h3>
            <p className="helper">Busque rapido e abra mais itens so quando precisar.</p>
          </div>
          <label className="field compact-search">
            <span>Buscar cliente</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowAllClients(false);
              }}
              placeholder="Nome, cidade ou CPF"
            />
          </label>
        </div>

        {clients.length === 0 ? (
          <div className="card muted">Nenhum cliente cadastrado.</div>
        ) : !search.trim() ? (
          <div className="card muted">
            Digite um nome, cidade ou CPF para localizar um cliente.
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="card muted">Nenhum cliente encontrado.</div>
        ) : (
          <>
            <div className="records-grid compact-records-grid">
              {visibleClients.map((client) => (
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

            {filteredClients.length > visibleClients.length ? (
              <button
                type="button"
                className="inline-toggle"
                onClick={() => setShowAllClients(true)}
              >
                Ver mais {filteredClients.length - visibleClients.length} cliente(s)
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
