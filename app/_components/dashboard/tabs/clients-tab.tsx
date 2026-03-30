import { FormEvent } from "react";
import { Client, ClientFormState } from "../types";

type ClientsTabProps = {
  clients: Client[];
  form: ClientFormState;
  onFormChange: (field: keyof ClientFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ClientsTab({
  clients,
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

      <div className="card stack-sm">
        <div>
          <h3 className="list-title">Clientes cadastrados ({clients.length})</h3>
          <p className="helper">Lista simples com os clientes que ja foram cadastrados.</p>
        </div>
        {clients.length === 0 ? (
          <p className="muted">Nenhum cliente cadastrado.</p>
        ) : (
          <ul className="simple-record-list">
            {clients.map((client) => (
              <li key={client.id} className="simple-record-item">
                <div>
                  <strong>{client.fullName}</strong>
                  <p>{client.city}</p>
                </div>
                <small>{client.cpf}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
