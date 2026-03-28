import { FormEvent } from "react";
import { Product, ProductFormState } from "../types";
import { toBrl } from "../utils";

type ProductsTabProps = {
  products: Product[];
  form: ProductFormState;
  onFormChange: (field: keyof ProductFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProductsTab({ products, form, onFormChange, onSubmit }: ProductsTabProps) {
  return (
    <section className="stack">
      <form className="card stack-sm" onSubmit={onSubmit}>
        <label className="field">
          <span>Nome do produto</span>
          <input
            value={form.name}
            onChange={(event) => onFormChange("name", event.target.value)}
            placeholder="Ex: Queijo Minas 500g"
            required
          />
        </label>
        <label className="field">
          <span>Valor</span>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={form.price}
            onChange={(event) => onFormChange("price", event.target.value)}
            placeholder="Ex: 29.90"
            required
          />
        </label>
        <button className="primary-button" type="submit">
          Salvar produto
        </button>
      </form>

      <div className="stack-sm">
        <h3 className="list-title">Produtos cadastrados ({products.length})</h3>
        {products.length === 0 ? (
          <div className="card muted">Nenhum produto cadastrado.</div>
        ) : (
          <div className="records-grid">
            {products.map((product) => (
              <article key={product.id} className="card card-list">
                <h4>{product.name}</h4>
                <p className="value">{toBrl(product.price)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
