.PHONY: help start stop restart build rebuild logs status clean shell generate-keys setup

# Variáveis
DOCKER_COMPOSE := docker-compose
SHELL_SERVICE ?= web

# Cores para output
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Mostra esta ajuda
	@echo "$(GREEN)Labirinto Docker Management$(NC)"
	@echo ""
	@echo "Uso: make [comando]"
	@echo ""
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "Serviços disponíveis:"
	@echo "  - web       (Next.js - porta 3000)"
	@echo "  - blog      (Astro - porta 4321)"
	@echo "  - infisical (Infisical - porta 8080)"
	@echo "  - postgres  (PostgreSQL)"
	@echo "  - redis     (Redis)"

setup: ## Configuração inicial (copia .env.example para .env)
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Criando arquivo .env...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ Arquivo .env criado!$(NC)"; \
		echo "$(YELLOW)⚠ IMPORTANTE: Edite o arquivo .env e configure as variáveis obrigatórias!$(NC)"; \
		echo "Execute 'make generate-keys' para gerar chaves de segurança."; \
	else \
		echo "$(GREEN)✓ Arquivo .env já existe$(NC)"; \
	fi

generate-keys: ## Gera chaves de segurança para ENCRYPTION_KEY e AUTH_SECRET
	@echo "$(GREEN)Gerando chaves de segurança...$(NC)"
	@echo ""
	@echo "ENCRYPTION_KEY:"
	@openssl rand -hex 32
	@echo ""
	@echo "AUTH_SECRET:"
	@openssl rand -hex 32
	@echo ""
	@echo "$(YELLOW)⚠ Copie essas chaves para o arquivo .env$(NC)"

start: setup ## Inicia todos os containers
	@echo "$(GREEN)Iniciando containers...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Containers iniciados!$(NC)"
	@make status
	@echo ""
	@echo "$(GREEN)URLs dos serviços:$(NC)"
	@echo "  Infisical: http://localhost:8080"
	@echo "  Web:       http://localhost:3000"
	@echo "  Blog:      http://localhost:4321"

stop: ## Para todos os containers
	@echo "$(GREEN)Parando containers...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Containers parados!$(NC)"

restart: ## Reinicia todos os containers
	@echo "$(GREEN)Reiniciando containers...$(NC)"
	$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✓ Containers reiniciados!$(NC)"

build: setup ## Build das imagens Docker
	@echo "$(GREEN)Building imagens...$(NC)"
	$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Build concluído!$(NC)"

rebuild: setup ## Rebuild das imagens sem cache
	@echo "$(GREEN)Rebuilding imagens (sem cache)...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✓ Rebuild concluído!$(NC)"

logs: ## Mostra logs (use SERVICE=nome para serviço específico)
	@if [ -z "$(SERVICE)" ]; then \
		$(DOCKER_COMPOSE) logs -f; \
	else \
		$(DOCKER_COMPOSE) logs -f $(SERVICE); \
	fi

logs-web: ## Mostra logs do serviço web
	$(DOCKER_COMPOSE) logs -f web

logs-blog: ## Mostra logs do serviço blog
	$(DOCKER_COMPOSE) logs -f blog

logs-infisical: ## Mostra logs do Infisical
	$(DOCKER_COMPOSE) logs -f infisical

status: ## Mostra status dos containers
	@echo "$(GREEN)Status dos containers:$(NC)"
	@$(DOCKER_COMPOSE) ps

clean: ## Remove containers, redes e volumes (CUIDADO!)
	@echo "$(YELLOW)⚠ Isso irá parar e remover todos os containers, redes e volumes!$(NC)"
	@read -p "Tem certeza? (y/N) " -n 1 -r; \
	echo; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		echo "$(GREEN)Limpando ambiente...$(NC)"; \
		$(DOCKER_COMPOSE) down -v; \
		echo "$(GREEN)✓ Ambiente limpo!$(NC)"; \
	else \
		echo "Operação cancelada."; \
	fi

shell: ## Abre shell em um container (use SERVICE=nome)
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)Especifique o serviço: make shell SERVICE=web$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Abrindo shell no container $(SERVICE)...$(NC)"
	$(DOCKER_COMPOSE) exec $(SERVICE) sh

shell-web: ## Abre shell no container web
	$(DOCKER_COMPOSE) exec web sh

shell-blog: ## Abre shell no container blog
	$(DOCKER_COMPOSE) exec blog sh

shell-infisical: ## Abre shell no container Infisical
	$(DOCKER_COMPOSE) exec infisical sh

shell-postgres: ## Abre shell no PostgreSQL
	$(DOCKER_COMPOSE) exec postgres psql -U infisical

ps: status ## Alias para status

up: start ## Alias para start

down: stop ## Alias para stop

# Comandos de desenvolvimento
dev-web: ## Inicia apenas o serviço web em modo dev
	$(DOCKER_COMPOSE) up web

dev-blog: ## Inicia apenas o serviço blog em modo dev
	$(DOCKER_COMPOSE) up blog

# Backup
backup-db: ## Faz backup do banco de dados PostgreSQL
	@echo "$(GREEN)Fazendo backup do banco de dados...$(NC)"
	@mkdir -p backup
	@$(DOCKER_COMPOSE) exec -T postgres pg_dump -U infisical infisical > backup/db-backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✓ Backup salvo em backup/$(NC)"

restore-db: ## Restaura backup do banco de dados (use BACKUP_FILE=caminho)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(YELLOW)Especifique o arquivo: make restore-db BACKUP_FILE=backup/db-backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Restaurando backup...$(NC)"
	@$(DOCKER_COMPOSE) exec -T postgres psql -U infisical infisical < $(BACKUP_FILE)
	@echo "$(GREEN)✓ Backup restaurado!$(NC)"

# Comandos de manutenção
prune: ## Remove imagens, containers e volumes não utilizados
	@echo "$(YELLOW)⚠ Isso irá remover recursos Docker não utilizados$(NC)"
	@read -p "Tem certeza? (y/N) " -n 1 -r; \
	echo; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		docker system prune -a --volumes; \
		echo "$(GREEN)✓ Limpeza concluída!$(NC)"; \
	else \
		echo "Operação cancelada."; \
	fi

# Deploy
deploy-dokploy: ## Mostra instruções para deploy no Dokploy
	@echo "$(GREEN)Deploy no Dokploy$(NC)"
	@echo ""
	@echo "1. Configure as variáveis de ambiente no Dokploy"
	@echo "2. Conecte seu repositório Git"
	@echo "3. Aponte para o arquivo docker-compose.yml"
	@echo "4. Configure os domínios"
	@echo ""
	@echo "Consulte DOKPLOY.md para instruções completas"
	@echo ""
	@echo "Gere chaves com: make generate-keys"

# Versão Cloud (sem Infisical self-hosted)
cloud-start: ## Inicia containers usando Infisical Cloud
	@echo "$(GREEN)Iniciando containers (Cloud version)...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.cloud.example .env; \
		echo "$(YELLOW)⚠ Arquivo .env criado. Configure suas variáveis!$(NC)"; \
	fi
	$(DOCKER_COMPOSE) -f docker-compose.cloud.yml up -d
	@echo "$(GREEN)✓ Containers iniciados!$(NC)"

cloud-stop: ## Para containers (versão cloud)
	$(DOCKER_COMPOSE) -f docker-compose.cloud.yml down

cloud-logs: ## Logs da versão cloud
	$(DOCKER_COMPOSE) -f docker-compose.cloud.yml logs -f

cloud-build: ## Build da versão cloud
	$(DOCKER_COMPOSE) -f docker-compose.cloud.yml build

cloud-status: ## Status da versão cloud
	$(DOCKER_COMPOSE) -f docker-compose.cloud.yml ps
