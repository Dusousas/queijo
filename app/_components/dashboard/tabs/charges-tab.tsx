import { FormEvent, useMemo, useState } from "react";
import { Charge, ChargeFormState, Client, Product } from "../types";
import { formatDate, toBrl } from "../utils";

type ChargesTabProps = {
  clients: Client[];
  products: Product[];
  charges: Charge[];
  form: ChargeFormState;
  onFormChange: (field: keyof ChargeFormState, value: string) => void;
  selectedClientCity: string;
  selectedProductPrice: number | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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
  charges,
  form,
  onFormChange,
  selectedClientCity,
  selectedProductPrice,
  onSubmit,
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
      <form className="card stack-sm" onSubmit={onSubmit}>
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
                : "Toque em um cliente da lista abaixo"}
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
          <span>Valor devido (opcional)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={form.amount}
            onChange={(event) => onFormChange("amount", event.target.value)}
            placeholder={
              selectedProductPrice !== null ? `Padrao: ${toBrl(selectedProductPrice)}` : "Ex: 35.90"
            }
          />
        </label>

        <div className="notice">
          <span>Cidade:</span> {selectedClientCity || "-"}
        </div>
        <button
          className="primary-button"
          type="submit"
          disabled={clients.length === 0 || products.length === 0 || !form.clientId}
        >
          Registrar cobranca
        </button>
        {(clients.length === 0 || products.length === 0) && (
          <p className="helper">Para cobrar, primeiro cadastre pelo menos 1 cliente e 1 produto.</p>
        )}
      </form>

      <div className="stack-sm">
        <h3 className="list-title">Pendencias ({charges.length})</h3>
        {charges.length === 0 ? (
          <div className="card muted">Nenhuma cobranca registrada.</div>
        ) : (
          <div className="records-grid">
            {charges.map((charge) => (
              <article key={charge.id} className="card card-list">
                <h4>{charge.clientName}</h4>
                <p>
                  {charge.city} - {charge.productName}
                </p>
                <p className="value">{toBrl(charge.amount)}</p>
                <small>{formatDate(charge.createdAt)}</small>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
