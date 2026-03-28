import { FormEvent } from "react";
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
  return (
    <section className="stack">
      <form className="card stack-sm" onSubmit={onSubmit}>
        <label className="field">
          <span>Cliente</span>
          <select
            value={form.clientId}
            onChange={(event) => onFormChange("clientId", event.target.value)}
            required
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName} - {client.city}
              </option>
            ))}
          </select>
        </label>

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
          disabled={clients.length === 0 || products.length === 0}
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
