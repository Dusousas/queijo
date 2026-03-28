import { FormEvent, useMemo, useState } from "react";
import { Product, ProductFormState } from "../types";
import { toBrl } from "../utils";

type ProductsTabProps = {
  products: Product[];
  form: ProductFormState;
  onFormChange: (field: keyof ProductFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProductsTab({ products, form, onFormChange, onSubmit }: ProductsTabProps) {
  const [search, setSearch] = useState("");
  const [showAllProducts, setShowAllProducts] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, search]);

  const visibleProducts = useMemo(
    () => (showAllProducts ? filteredProducts : filteredProducts.slice(0, 6)),
    [filteredProducts, showAllProducts],
  );

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
        <div className="compact-list-head">
          <div>
            <h3 className="list-title">Produtos cadastrados ({products.length})</h3>
            <p className="helper">Mantenha a lista enxuta e busque rapido quando precisar.</p>
          </div>
          <label className="field compact-search">
            <span>Buscar produto</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowAllProducts(false);
              }}
              placeholder="Nome do produto"
            />
          </label>
        </div>

        {products.length === 0 ? (
          <div className="card muted">Nenhum produto cadastrado.</div>
        ) : filteredProducts.length === 0 ? (
          <div className="card muted">Nenhum produto encontrado.</div>
        ) : (
          <>
            <div className="records-grid compact-records-grid">
              {visibleProducts.map((product) => (
                <article key={product.id} className="card card-list">
                  <h4>{product.name}</h4>
                  <p className="value">{toBrl(product.price)}</p>
                </article>
              ))}
            </div>

            {filteredProducts.length > visibleProducts.length ? (
              <button
                type="button"
                className="inline-toggle"
                onClick={() => setShowAllProducts(true)}
              >
                Ver mais {filteredProducts.length - visibleProducts.length} produto(s)
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
