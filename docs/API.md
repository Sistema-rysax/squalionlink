# 🔌 API Documentation

## Convenções

| Item | Padrão |
|------|--------|
| Base URL | `/api/v1` |
| Formato | JSON |
| Auth | Bearer Token (JWT) |
| Paginação | `?page=1&limit=20` |
| Ordenação | `?sort=dt_registro&order=desc` |
| Filtros | `?status=ATIVO&id_modelo=5` |
| Busca | `?search=CAT` |
| Soft Delete | Nunca retorna deletados (dt_deletado IS NOT NULL) |
| Datas | ISO 8601 UTC: `2026-06-09T01:43:00Z` |
| Erros | `{ error: string, code: string, details?: any }` |

## Headers Obrigatórios

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept-Language: pt-BR           // idioma preferido
X-Timezone: America/Sao_Paulo   // timezone para contexto (dados sempre UTC)
```

## Autenticação

```
POST   /api/v1/auth/login              # Login (email + senha) → JWT
POST   /api/v1/auth/refresh            # Refresh token
POST   /api/v1/auth/forgot-password    # Solicitar reset
POST   /api/v1/auth/reset-password     # Resetar senha com token
GET    /api/v1/auth/me                 # Dados do usuário logado + tenant + permissões
```

### Response de Login

```json
{
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 86400,
    "user": {
        "id_usuario": 1,
        "nome": "João Silva",
        "email": "joao@empresa.com",
        "idioma": "pt-BR"
    },
    "tenant": {
        "id_tenant": 1,
        "nome_fantasia": "Mineradora ABC",
        "timezone_id": "America/Sao_Paulo",
        "utc_offset": "-03:00"
    },
    "funcionalidades": ["FROTA_EQUIPAMENTO", "CHECKLIST_EXECUCAO", "TELEMETRIA_GPS", ...]
}
```

## Endpoints por Módulo

### 🚜 Frota

```
# Equipamento
GET    /api/v1/equipamentos                    # Listar (com filtros)
GET    /api/v1/equipamentos/:id                # Detalhe
POST   /api/v1/equipamentos                    # Criar
PUT    /api/v1/equipamentos/:id                # Atualizar
DELETE /api/v1/equipamentos/:id                # Soft delete
GET    /api/v1/equipamentos/:id/historico      # Histórico de status
GET    /api/v1/equipamentos/:id/componentes    # Componentes do equipamento
GET    /api/v1/equipamentos/:id/ciclos         # Ciclos do equipamento
GET    /api/v1/equipamentos/:id/manutencoes    # OS do equipamento

# Modelo
GET    /api/v1/modelos                         # Listar modelos
POST   /api/v1/modelos                         # Criar
PUT    /api/v1/modelos/:id                     # Atualizar
GET    /api/v1/modelos/:id/atividades          # Atividades do modelo
GET    /api/v1/modelos/:id/checklists          # Checklists do modelo

# Fabricante / Grupo / Combustível
GET    /api/v1/fabricantes
GET    /api/v1/grupos-equipamento
GET    /api/v1/combustiveis

# Contratada
GET    /api/v1/contratadas
POST   /api/v1/contratadas
PUT    /api/v1/contratadas/:id
```

### 📋 Checklist

```
# Configuração
GET    /api/v1/checklists/grupos               # Listar grupos
POST   /api/v1/checklists/grupos               # Criar grupo
PUT    /api/v1/checklists/grupos/:id           # Atualizar grupo
GET    /api/v1/checklists/grupos/:id/itens     # Itens do grupo
POST   /api/v1/checklists/itens               # Criar item
PUT    /api/v1/checklists/itens/:id           # Atualizar item

# Execução
POST   /api/v1/checklists/execucoes           # Iniciar checklist
PUT    /api/v1/checklists/execucoes/:id       # Atualizar (adicionar respostas)
POST   /api/v1/checklists/execucoes/:id/finalizar  # Finalizar
GET    /api/v1/checklists/execucoes           # Listar execuções (filtros)
GET    /api/v1/checklists/execucoes/:id       # Detalhe com respostas e fotos
POST   /api/v1/checklists/execucoes/:id/fotos # Upload foto
```

### 🗺️ Áreas

```
GET    /api/v1/areas                           # Listar (com geofence)
POST   /api/v1/areas                           # Criar
PUT    /api/v1/areas/:id                       # Atualizar
GET    /api/v1/areas/:id/subareas              # Subáreas
GET    /api/v1/areas/tipos                     # Tipos de área
GET    /api/v1/rotas                           # Listar rotas
POST   /api/v1/rotas                           # Criar rota
```

### 🛣️ Rotograma

```
GET    /api/v1/rotogramas                      # Listar
POST   /api/v1/rotogramas                      # Criar
PUT    /api/v1/rotogramas/:id                  # Atualizar
GET    /api/v1/rotogramas/:id/cercas           # Cercas do rotograma
POST   /api/v1/rotogramas/:id/cercas           # Adicionar cerca
PUT    /api/v1/rotogramas/cercas/:id           # Atualizar cerca
POST   /api/v1/rotogramas/:id/vincular         # Vincular a equipamento
DELETE /api/v1/rotogramas/:id/vincular/:id_equip # Desvincular
GET    /api/v1/excessos-velocidade             # Listar excessos (filtros)
PUT    /api/v1/condicao-climatica              # Alterar seco/chuva
```

### 🏷️ Atividades

```
GET    /api/v1/atividades                      # Listar
POST   /api/v1/atividades                      # Criar
PUT    /api/v1/atividades/:id                  # Atualizar
GET    /api/v1/atividades/tipos                # Tipos de atividade
GET    /api/v1/atividades/grupos               # Grupos
POST   /api/v1/atividades/:id/vincular-modelo  # Vincular a modelo
GET    /api/v1/equipamentos/:id/status-atual   # Status real-time
GET    /api/v1/equipamentos/status-frota       # Status de toda a frota
GET    /api/v1/atividades/alertas              # Alertas de atividade
```

### 🔧 Manutenção

```
# Plano Preventivo
GET    /api/v1/manutencao/planos               # Listar planos
POST   /api/v1/manutencao/planos               # Criar plano
PUT    /api/v1/manutencao/planos/:id           # Atualizar
GET    /api/v1/manutencao/planos/:id/gatilhos  # Gatilhos do plano
GET    /api/v1/manutencao/planos/:id/itens     # Itens do plano
GET    /api/v1/manutencao/programacao          # Programações futuras

# Solicitação Corretiva
POST   /api/v1/manutencao/solicitacoes         # Abrir solicitação
GET    /api/v1/manutencao/solicitacoes         # Listar
PUT    /api/v1/manutencao/solicitacoes/:id     # Atualizar status

# Ordem de Serviço
GET    /api/v1/manutencao/ordens-servico       # Listar OS
POST   /api/v1/manutencao/ordens-servico       # Criar OS
PUT    /api/v1/manutencao/ordens-servico/:id   # Atualizar OS
POST   /api/v1/manutencao/ordens-servico/:id/itens    # Add item
POST   /api/v1/manutencao/ordens-servico/:id/pecas    # Add peça
POST   /api/v1/manutencao/ordens-servico/:id/mao-obra # Add HH
POST   /api/v1/manutencao/ordens-servico/:id/concluir # Concluir OS

# Catálogos
GET    /api/v1/manutencao/sintomas
GET    /api/v1/manutencao/causas
GET    /api/v1/manutencao/sistemas-componentes
```

### 🔄 Ciclo Operacional

```
GET    /api/v1/ciclos                          # Listar ciclos (filtros)
GET    /api/v1/ciclos/:id                      # Detalhe com etapas
GET    /api/v1/ciclos/:id/etapas               # Etapas do ciclo
GET    /api/v1/ciclos/resumo-diario            # Resumo por dia
GET    /api/v1/ciclos/resumo-frente            # Resumo por frente
GET    /api/v1/ciclos/em-andamento             # Ciclos ativos agora
```

### 🎯 Dispatch

```
GET    /api/v1/dispatch/frentes                # Frentes ativas
POST   /api/v1/dispatch/frentes                # Ativar frente
PUT    /api/v1/dispatch/frentes/:id            # Atualizar (prioridade, destino)
POST   /api/v1/dispatch/frentes/:id/pausar     # Pausar frente
POST   /api/v1/dispatch/despachar              # Despachar caminhão manualmente
GET    /api/v1/dispatch/ordens                 # Ordens de despacho
GET    /api/v1/dispatch/disponibilidade        # Caminhões disponíveis
PUT    /api/v1/dispatch/configuracao           # Config do algoritmo
```

### 📡 Telemetria

```
GET    /api/v1/telemetria/posicoes             # Últimas posições de todos
GET    /api/v1/telemetria/posicoes/:id_equip   # Histórico GPS do equipamento
GET    /api/v1/telemetria/eventos              # Eventos operacionais
GET    /api/v1/telemetria/trail/:id_equip      # Rastro (últimas X posições)
POST   /api/v1/telemetria/horimetro           # Registrar leitura manual
GET    /api/v1/telemetria/abastecimentos       # Listar abastecimentos
POST   /api/v1/telemetria/abastecimentos       # Registrar abastecimento
```

### 👷 Operadores

```
GET    /api/v1/operadores                      # Listar
POST   /api/v1/operadores                      # Criar
PUT    /api/v1/operadores/:id                  # Atualizar
GET    /api/v1/operadores/:id/habilitacoes     # Habilitações
GET    /api/v1/operadores/:id/documentos       # Documentos
POST   /api/v1/operadores/:id/documentos       # Upload documento
GET    /api/v1/operadores/:id/producao         # KPI do operador
```

### 📦 Almoxarifado

```
GET    /api/v1/pecas                           # Listar peças
POST   /api/v1/pecas                           # Criar
GET    /api/v1/pecas/:id/estoque               # Estoque da peça
POST   /api/v1/pecas/:id/movimentacao          # Entrada/Saída
GET    /api/v1/pecas/estoque-baixo             # Alertas de estoque mínimo
```

### 📊 KPI

```
GET    /api/v1/kpi/disponibilidade             # DF% (filtros: periodo, equipamento, modelo)
GET    /api/v1/kpi/producao                    # Produção (filtros: periodo, frente, material)
GET    /api/v1/kpi/mtbf-mttr                   # MTBF/MTTR por equipamento
GET    /api/v1/kpi/operadores                  # Ranking operadores
GET    /api/v1/kpi/consumo                     # Consumo combustível
GET    /api/v1/kpi/metas                       # Metas configuradas
PUT    /api/v1/kpi/metas                       # Definir/atualizar metas
GET    /api/v1/kpi/snapshot/:data              # Snapshot histórico de um dia
```

### 🔔 Alertas

```
GET    /api/v1/alertas                         # Listar (filtros: tipo, severidade, lido)
PUT    /api/v1/alertas/:id/ler                 # Marcar como lido
PUT    /api/v1/alertas/ler-todos               # Marcar todos como lidos
GET    /api/v1/alertas/contadores              # Contadores por tipo/severidade
```

### ⚙️ Admin

```
# Usuários
GET    /api/v1/admin/usuarios                  # Listar
POST   /api/v1/admin/usuarios                  # Criar
PUT    /api/v1/admin/usuarios/:id              # Atualizar
DELETE /api/v1/admin/usuarios/:id              # Desativar

# Perfis
GET    /api/v1/admin/perfis                    # Listar
POST   /api/v1/admin/perfis                    # Criar
PUT    /api/v1/admin/perfis/:id                # Atualizar
GET    /api/v1/admin/perfis/:id/funcionalidades # Funcionalidades do perfil

# Funcionalidades disponíveis (do plano)
GET    /api/v1/admin/funcionalidades           # Todas do plano do tenant

# Planos (super admin)
GET    /api/v1/admin/planos                    # Listar planos
POST   /api/v1/admin/planos                    # Criar
PUT    /api/v1/admin/planos/:id                # Atualizar
```

## WebSocket Events (Socket.IO)

### Client → Server

```typescript
// Entrar na sala do tenant (auth via token)
socket.emit('join', { token: 'jwt...' });

// Operador seleciona atividade
socket.emit('atividade:selecionar', { id_equipamento, id_atividade });

// Operador confirma despacho
socket.emit('dispatch:confirmar', { id_dispatch_ordem });
```

### Server → Client

```typescript
// Posição GPS atualizada (broadcast para sala do tenant)
socket.on('gps:posicao', { id_equipamento, lat, lng, vel, dt_gps });

// Status do equipamento mudou
socket.on('equipamento:status', { id_equipamento, status_operacional, id_atividade });

// Novo alerta
socket.on('alerta:novo', { id_alerta, tipo, severidade, titulo, id_equipamento });

// Excesso de velocidade
socket.on('excesso:novo', { id_equipamento, velocidade, limite, cerca });

// Ciclo atualizado (nova etapa)
socket.on('ciclo:etapa', { id_equipamento, etapa, dt_inicio });

// Despacho para operador
socket.on('dispatch:ordem', { id_equipamento, destino, tempo_estimado });

// KPI atualizado
socket.on('kpi:update', { indicador, valor, delta });
```

## Paginação (Response padrão)

```json
{
    "data": [...],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 147,
        "totalPages": 8
    }
}
```

## Códigos de Erro

| HTTP | Code | Descrição |
|------|------|-----------|
| 400 | VALIDATION_ERROR | Dados inválidos |
| 401 | UNAUTHORIZED | Token inválido/expirado |
| 403 | FORBIDDEN | Sem permissão (funcionalidade não no plano/perfil) |
| 403 | PLAN_LIMIT | Limite do plano atingido (max_equipamentos, etc.) |
| 404 | NOT_FOUND | Recurso não encontrado |
| 409 | CONFLICT | Conflito (ex: equipamento já vinculado) |
| 422 | BUSINESS_RULE | Regra de negócio violada |
| 429 | RATE_LIMIT | Muitas requisições |
| 500 | INTERNAL_ERROR | Erro interno |
```
