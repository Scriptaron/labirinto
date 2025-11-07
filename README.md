# Labirinto Monorepo

Monorepo contendo os projetos Labirinto.

## Estrutura

```
labirinto-monorepo/
├── apps/
│   └── web/          # Aplicação Next.js com i18n
├── packages/         # Pacotes compartilhados (futuro)
└── pnpm-workspace.yaml
```

## Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar Next.js em modo dev
pnpm dev

# Build
pnpm build
```

## Próximos Passos

- Adicionar Astro para o blog em `apps/blog`
- Criar pacotes compartilhados em `packages/` conforme necessário
