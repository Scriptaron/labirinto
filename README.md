# Labirinto Monorepo

[![CI](https://github.com/Scriptaron/labirinto/actions/workflows/ci.yml/badge.svg)](https://github.com/Scriptaron/labirinto/actions/workflows/ci.yml)
[![Docker](https://github.com/Scriptaron/labirinto/actions/workflows/docker.yml/badge.svg)](https://github.com/Scriptaron/labirinto/actions/workflows/docker.yml)
[![codecov](https://codecov.io/gh/Scriptaron/labirinto/branch/master/graph/badge.svg)](https://codecov.io/gh/Scriptaron/labirinto)

Monorepo contendo os projetos Labirinto com suporte completo a internacionalização (i18n).

## Estrutura

```text
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
```

## Testes

```bash
# Rodar todos os testes
pnpm -r test

# Rodar com coverage
pnpm -r test:coverage

# Testar workspace específico
pnpm --filter blog test
pnpm --filter web test
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

```text
src/content/blog/
├── pt/
│   └── primeiro-post.md
├── en/
│   └── first-post.md
└── es/
    └── primer-post.md
```

## 🐳 Docker & Deploy

Este projeto está pronto para deploy com Docker Compose usando perfis.

### 📦 Dois Profiles Disponíveis

O projeto usa um único arquivo `docker/compose.yaml` com dois profiles:

#### Profile: `selfhosted` (Padrão)

Stack completa com Infisical self-hosted + PostgreSQL + Redis + Web + Blog:

```bash
make compose-selfhosted-start
```

**Serviços incluídos:**

- **Infisical** (porta 8080): Gerenciamento de secrets self-hosted
- **PostgreSQL**: Banco de dados para o Infisical
- **Redis**: Cache para o Infisical
- **Web** (porta 3000): Aplicação Next.js
- **Blog** (porta 4321): Blog em Astro

#### Profile: `cloud`

Stack simplificada usando Infisical Cloud (apenas Web + Blog):

```bash
make compose-cloud-start
```

**Serviços incluídos:**

- **Web** (porta 3000): Aplicação Next.js
- **Blog** (porta 4321): Blog em Astro
- **Infisical Cloud**: Gerenciamento de secrets via <https://app.infisical.com>

### 🚀 Início Rápido

1. **Configure as variáveis de ambiente:**

   ```bash
   cp .env.example .env
   # Edite .env com suas configurações
   # Para cloud: ajuste NEXT_PUBLIC_INFISICAL_URL e PUBLIC_INFISICAL_URL
   ```

1. **Inicie o ambiente desejado:**

   ```bash
   # Self-hosted (stack completa)
   make compose-selfhosted-start

   # Cloud (apenas web + blog)
   make compose-cloud-start
   ```

1. **Acesse os serviços:**

   - Web: <http://localhost:3000>
   - Blog: <http://localhost:4321>
   - Infisical (selfhosted): <http://localhost:8080>

### 📋 Comandos Disponíveis

```bash
# Self-hosted
make compose-selfhosted-start   # Iniciar
make compose-selfhosted-stop    # Parar
make compose-selfhosted-restart # Reiniciar
make compose-selfhosted-logs    # Ver logs
make compose-selfhosted-ps      # Status

# Cloud
make compose-cloud-start        # Iniciar
make compose-cloud-stop         # Parar
make compose-cloud-restart      # Reiniciar
make compose-cloud-logs         # Ver logs
make compose-cloud-ps           # Status

# Limpeza
make compose-clean              # Remove containers e volumes
```

### 🔧 Configuração

O arquivo `.env` contém todas as configurações necessárias com comentários detalhados sobre cada profile. Variáveis importantes:

**Para selfhosted:**

- `ENCRYPTION_KEY`: Chave de criptografia (gerar com `openssl rand -base64 32`)
- `AUTH_SECRET`: Secret de autenticação (gerar com `openssl rand -base64 32`)
- `POSTGRES_*`: Credenciais do PostgreSQL

**Para cloud:**

- `NEXT_PUBLIC_INFISICAL_URL=https://app.infisical.com`
- `PUBLIC_INFISICAL_URL=https://app.infisical.com`

### 🌐 Produção

Em produção, configure seu reverse proxy (Nginx, Traefik, Caddy) para rotear:

- `/{locale}/*` → Next.js (porta 3000)
- `/{locale}/blog/*` → Astro (porta 4321)

Para deploy no **Dokploy**, use o compose com profiles e configure as variáveis de ambiente via interface do Dokploy.
