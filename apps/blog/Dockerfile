# Dockerfile para Astro Blog
FROM node:24-alpine AS base

# Desativar telemetria do Astro
ENV ASTRO_TELEMETRY_DISABLED=1

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependências apenas quando necessário
FROM base AS deps
WORKDIR /app

# Copiar todo o código para garantir que o pnpm workspace funcione
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/blog ./apps/blog

# Instalar todas as dependências do workspace (incluindo packages locais)
RUN pnpm install --frozen-lockfile

# Build da aplicação
FROM base AS builder
WORKDIR /app

# Copiar tudo da etapa deps (já com node_modules instalados)
COPY --from=deps /app ./

# Build do package i18n-config primeiro
RUN cd packages/i18n-config && pnpm build || true

# Build da aplicação blog
WORKDIR /app/apps/blog

# Argumentos de build para Infisical
ARG INFISICAL_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_PROJECT_ID
ARG INFISICAL_ENVIRONMENT="dev"

# Disponibilizar variáveis de ambiente durante o build
ENV INFISICAL_CLIENT_ID=$INFISICAL_CLIENT_ID
ENV INFISICAL_CLIENT_SECRET=$INFISICAL_CLIENT_SECRET
ENV INFISICAL_PROJECT_ID=$INFISICAL_PROJECT_ID
ENV INFISICAL_ENVIRONMENT=$INFISICAL_ENVIRONMENT

RUN pnpm build

# Imagem de produção com servidor Node
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Criar usuário não-root
RUN addgroup --system --gid 1001 astro
RUN adduser --system --uid 1001 astro

# Copiar build estático
COPY --from=builder /app/apps/blog/dist ./dist

# Ajustar permissões
RUN chown -R astro:astro /app

USER astro

EXPOSE 4321

ENV HOST=0.0.0.0
ENV PORT=4321

# Servir os arquivos estáticos com npx serve (sem instalação)
CMD ["npx", "serve@latest", "dist", "-l", "4321", "--no-port-switching"]
