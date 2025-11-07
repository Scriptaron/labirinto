# Labirinto Monorepo

Monorepo contendo os projetos Labirinto.

## Estrutura

```
labirinto-monorepo/
├── apps/
│   ├── web/          # Aplicação Next.js com i18n
│   └── blog/         # Blog em Astro (acessível via /blog)
├── packages/         # Pacotes compartilhados (futuro)
└── pnpm-workspace.yaml
```

## Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar apenas Next.js (porta 3000)
pnpm dev

# Rodar apenas Astro blog (porta 4321)
pnpm dev:blog

# Rodar ambos simultaneamente
pnpm dev:all
```

## Build

```bash
# Build de tudo
pnpm build

# Build individual
pnpm build:web
pnpm build:blog
```

## Como funciona

- Next.js roda na porta **3000**
- Astro roda na porta **4321**
- Requisições para `/blog` são automaticamente redirecionadas do Next.js para o Astro
- Em produção, você pode usar Nginx ou CDN para rotear as requisições
