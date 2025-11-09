# Labirinto Monorepo

Monorepo contendo os projetos Labirinto com suporte completo a internacionalização (i18n).

## Estrutura

```
labirinto-monorepo/
├── apps/
│   ├── web/          # Aplicação Next.js com i18n
│   └── blog/         # Blog em Astro com i18n
├── packages/
│   └── i18n-config/  # Configuração compartilhada de i18n
└── pnpm-workspace.yaml
```

## Funcionalidades i18n

- ✅ Suporte a 3 idiomas: Português, English, Español
- ✅ Detecção automática do idioma do navegador
- ✅ Cookie compartilhado entre Next.js e Astro
- ✅ URLs com prefixo de idioma (ex: `/pt/blog`, `/en/blog`)
- ✅ Seletor de idioma com ícone
- ✅ Slugs descritivos por idioma
- ✅ Links alternativos entre traduções do mesmo post
- ✅ Testes automatizados

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

## Testes

```bash
# Rodar todos os testes
pnpm test

# Testar apenas o pacote i18n
pnpm test:i18n

# Testar apenas o blog
pnpm test:blog
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

### Estrutura de URLs

- Next.js: `http://localhost:3000/{locale}/` (ex: `/pt/`, `/en/`)
- Blog: `http://localhost:4321/{locale}/blog` (ex: `/pt/blog`, `/en/blog`)

### Detecção de Idioma

1. Verifica o cookie `NEXT_LOCALE`
2. Se não houver cookie, detecta do header `Accept-Language`
3. Se não houver header, usa o idioma padrão (português)

### Posts do Blog

Os posts devem ser organizados por idioma:

```
src/content/blog/
├── pt/
│   └── primeiro-post.md
├── en/
│   └── first-post.md
└── es/
    └── primer-post.md
```

Cada post deve ter:
- `lang`: idioma do post
- `slug`: slug descritivo no idioma
- `alternates`: referências para o mesmo post em outros idiomas

### Produção

Em produção, configure seu servidor/CDN para rotear:
- `/{locale}/*` → Next.js
- `/{locale}/blog/*` → Astro
