import { FormEvent, useMemo, useState } from "react";
import { ChargeFormState, Client, ClientDebtSnapshot, Product } from "../types";
import { toBrl } from "../utils";

type ChargesTabProps = {
  clients: Client[];
  products: Product[];
  form: ChargeFormState;
  onFormChange: (field: keyof ChargeFormState, value: string) => void;
  selectedClientCity: string;
  selectedProductPrice: number | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  clientDebtSnapshots: ClientDebtSnapshot[];
};

function getClientSearchText(client: Client) {
  return `${client.fullName} ${client.city} ${client.cpf}`.toLowerCase();
}

function getClientLabel(client: Client) {
  return `${client.fullName} - ${client.city}`;
}

export function ChargesTab({
  clients,
  products,
  form,
  onFormChange,
  selectedClientCity,
  selectedProductPrice,
  onSubmit,
  clientDebtSnapshots,
}: ChargesTabProps) {
  const [clientSearch, setClientSearch] = useState("");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === form.clientId) ?? null,
    [clients, form.clientId],
  );

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) {
      return clients.slice(0, 8);
    }

    return clients
      .filter((client) => getClientSearchText(client).includes(query))
      .slice(0, 8);
  }, [clientSearch, clients]);

  const selectedClientSummary = useMemo(
    () => clientDebtSnapshots.find((snapshot) => snapshot.clientId === form.clientId) ?? null,
    [clientDebtSnapshots, form.clientId],
  );

  function handleClientPick(client: Client) {
    onFormChange("clientId", client.id);
    setClientSearch(getClientLabel(client));
  }

  function clearSelectedClient() {
    onFormChange("clientId", "");
    setClientSearch("");
  }

  return (
    <section className="stack">
      <div className="overview-kpi-grid">
        <article className="card overview-kpi-card">
          <p>Clientes cadastrados</p>
          <h3>{clients.length}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Produtos ativos</p>
          <h3>{products.length}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Clientes devendo</p>
          <h3>{clientDebtSnapshots.filter((item) => item.totalDue > 0).length}</h3>
        </article>
        <article className="card overview-kpi-card">
          <p>Saldo aberto</p>
          <h3>{toBrl(clientDebtSnapshots.reduce((sum, item) => sum + item.totalDue, 0))}</h3>
        </article>
      </div>

      <form className="card stack-sm" onSubmit={onSubmit}>
        <div>
          <h3 className="list-title">Lancar novo fiado</h3>
          <p className="helper">
            Escolha o cliente rapidamente, confira o historico dele e registre a nova compra.
          </p>
        </div>

        <label className="field">
          <span>Cliente</span>
          <input
            value={clientSearch}
            onChange={(event) => {
              setClientSearch(event.target.value);
              if (form.clientId) {
                onFormChange("clientId", "");
              }
            }}
            placeholder="Busque por nome, cidade ou CPF"
            autoComplete="off"
            required={!form.clientId}
          />
        </label>

        <div className="picker-card">
          <div className="picker-head">
            <span className="helper">
              {selectedClient
                ? `Selecionado: ${selectedClient.fullName}`
                : "Toque em um cliente para preencher o fiado"}
            </span>
            {selectedClient ? (
              <button type="button" className="ghost-button" onClick={clearSelectedClient}>
                Limpar
              </button>
            ) : null}
          </div>

          <div className="picker-results">
            {filteredClients.length === 0 ? (
              <p className="helper">Nenhum cliente encontrado com esse filtro.</p>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className={client.id === form.clientId ? "picker-option active" : "picker-option"}
                  onClick={() => handleClientPick(client)}
                >
                  <strong>{client.fullName}</strong>
                  <span>
                    {client.city} - {client.cpf}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedClientSummary ? (
          <div className="summary-banner">
            <div>
              <span>Ja gastou</span>
              <strong>{toBrl(selectedClientSummary.totalSpent)}</strong>
            </div>
            <div>
              <span>Ja pagou</span>
              <strong>{toBrl(selectedClientSummary.totalPaid)}</strong>
            </div>
            <div>
              <span>Saldo em aberto</span>
              <strong>{toBrl(selectedClientSummary.totalDue)}</strong>
            </div>
          </div>
        ) : null}

        <label className="field">
          <span>Produto</span>
          <select
            value={form.productId}
            onChange={(event) => onFormChange("productId", event.target.value)}
            required
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {toBrl(product.price)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Valor do fiado (opcional)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={form.amount}
            onChange={(event) => onFormChange("amount", event.target.value)}
            placeholder={
              selectedProductPrice !== null
                ? `Padrao: ${toBrl(selectedProductPrice)}`
                : "Ex: 35.90"
            }
          />
        </label>

        <div className="notice">
          <span>Cidade:</span> {selectedClientCity || "-"}
        </div>

        {selectedClientSummary?.totalOpenCharges ? (
          <div className="notice notice-info">
            <span>Atencao:</span> esse cliente tem {selectedClientSummary.totalOpenCharges} fiado(s)
            em aberto.
          </div>
        ) : null}

        <button
          className="primary-button"
          type="submit"
          disabled={clients.length === 0 || products.length === 0 || !form.clientId}
        >
          Adicionar fiado
        </button>

        {(clients.length === 0 || products.length === 0) && (
          <p className="helper">
            Para lancar fiado, primeiro cadastre pelo menos 1 cliente e 1 produto.
          </p>
        )}
      </form>
    </section>
  );
}
