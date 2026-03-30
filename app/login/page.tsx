import { getLoginErrorMessage, hasValidSession, isAuthConfigured } from "@/lib/auth";

export const metadata = {
  title: "Entrar | Controle de Cobrancas",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const hasSession = await hasValidSession();
  const configured = isAuthConfigured();
  const errorMessage =
    (hasSession ? "" : getLoginErrorMessage(searchParams.error)) ||
    (configured ? "" : getLoginErrorMessage("missing-password"));

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">Queijo DS</p>
          <h1>Acesse o painel</h1>
          <p className="muted">
            Use a senha configurada no Easypanel pela variavel <code>APP_PASSWORD</code>.
          </p>
        </div>

        <form action="/api/auth/login" method="post" className="auth-form">
          <label className="field" htmlFor="password">
            <span>Senha</span>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Digite a senha do painel"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

          <button
            type="submit"
            className="primary-button"
            disabled={!configured || hasSession}
          >
            Entrar no painel
          </button>
        </form>
      </section>
    </main>
  );
}
