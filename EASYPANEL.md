# Easypanel Deploy

Este projeto esta pronto para deploy via Docker no Easypanel.

## O que foi configurado

- `next.config.ts` com `output: "standalone"`
- `Dockerfile` multi-stage para build de producao
- `.dockerignore` para reduzir o contexto do build

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
