# Dockerfile para Next.js Web App
FROM node:24-alpine AS base

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependências apenas quando necessário
FROM base AS deps
WORKDIR /app

# Copiar todo o código para garantir que o pnpm workspace funcione
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/web ./apps/web

# Instalar todas as dependências do workspace (incluindo packages locais)
RUN pnpm install --frozen-lockfile

# Build da aplicação
FROM base AS builder
WORKDIR /app

# Copiar tudo da etapa deps (já com node_modules instalados)
COPY --from=deps /app ./

# Build do package i18n-config primeiro
RUN cd packages/i18n-config && pnpm build || true

# Build da aplicação web
WORKDIR /app/apps/web
RUN pnpm build

# Imagem de produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Ajustar permissões
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Variáveis de ambiente necessárias para o Infisical (runtime)
ENV INFISICAL_CLIENT_ID=""
ENV INFISICAL_CLIENT_SECRET=""
ENV INFISICAL_PROJECT_ID=""
ENV INFISICAL_ENVIRONMENT="dev"

CMD ["node", "apps/web/server.js"]
