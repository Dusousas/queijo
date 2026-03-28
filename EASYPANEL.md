# Easypanel Deploy

Este projeto esta pronto para deploy via Docker no Easypanel.

## O que foi configurado

- `next.config.ts` com `output: "standalone"`
- `Dockerfile` multi-stage para build de producao
- `.dockerignore` para reduzir o contexto do build
- conexao com Postgres via `pg`
- auto-criacao das tabelas na primeira execucao do app

## Como subir no Easypanel

1. Crie um novo app usando o repositorio Git deste projeto.
2. Selecione a opcao de deploy com `Dockerfile`.
3. Use a porta `3000`.
4. Nao e necessario comando customizado. O container inicia com:

```bash
node server.js
```

## Variaveis uteis

O container ja define:

- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`
- `NEXT_TELEMETRY_DISABLED=1`

Se quiser, no Easypanel voce pode sobrescrever `PORT`, mas o padrao recomendado e `3000`.

## Variaveis do Postgres no Easypanel

No app web, configure estas envs:

```bash
POSTGRES_HOST=queijo-db
POSTGRES_PORT=5432
POSTGRES_DB=lp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<sua-senha-do-postgres>
POSTGRES_SSL=false
```

Se preferir, voce tambem pode usar uma unica env:

```bash
DATABASE_URL=postgresql://postgres:<sua-senha-do-postgres>@queijo-db:5432/lp
```

## Tabelas criadas automaticamente

Na primeira subida, o app cria:

- `clients`
- `products`
- `charges`

Entao nao e necessario rodar migration manual para este MVP.
