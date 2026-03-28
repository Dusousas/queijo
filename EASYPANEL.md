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

## Usar o banco do Easypanel no localhost

### Opcao recomendada: tunel SSH

Essa e a opcao mais segura, porque o Postgres nao precisa ficar exposto publicamente.

No seu computador local, abra um tunel SSH para o servidor:

```bash
ssh -L 5432:127.0.0.1:5432 usuario@SEU_SERVIDOR
```

Depois disso, no projeto local, crie um `.env.local` baseado em `.env.local.example` com:

```bash
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=lp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=8767
POSTGRES_SSL=false
```

Tambem pode usar:

```bash
DATABASE_URL=postgresql://postgres:8767@127.0.0.1:5432/lp
```

Com o tunel aberto, rode localmente:

```bash
npm run dev
```

### O que precisa alterar no Easypanel para essa opcao

Nada no app web.

Voce so precisa ter:

- o Postgres `queijo-db` rodando
- acesso SSH ao servidor onde o Easypanel esta instalado

### Opcao alternativa: expor o Postgres publicamente

Se voce quiser conectar sem SSH tunnel, precisa expor a porta `5432` do servico Postgres no Easypanel ou no servidor.

Depois disso, no `.env.local`, troque `POSTGRES_HOST` pelo dominio ou IP publico do servidor.

Exemplo:

```bash
POSTGRES_HOST=SEU_IP_OU_DOMINIO
POSTGRES_PORT=5432
POSTGRES_DB=lp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=8767
POSTGRES_SSL=false
```

Essa opcao e menos segura. Se escolher esse caminho, o ideal e restringir IP e usar senha forte.
