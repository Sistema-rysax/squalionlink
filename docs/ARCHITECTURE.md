# 🏗️ Arquitetura do Sistema

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite)                                │
│  - Hosted: Vercel / S3+CloudFront                       │
│  - Map: Deck.gl ou Mapbox GL (estilo game/3D)           │
│  - State: Zustand                                       │
│  - Real-time: Socket.IO client                          │
│  - i18n: react-i18next (pt-BR, en, de, fr, es)         │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / WSS
┌────────────────────────▼────────────────────────────────┐
│  BACKEND (Node.js - Docker)                             │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ API Gateway │  │ Auth Service│  │ Tenant Router  │  │
│  │  (Express)  │  │ (JWT+RBAC)  │  │ (RLS Context)  │  │
│  └──────┬──────┘  └─────────────┘  └────────────────┘  │
│         │                                               │
│  ┌──────▼──────────────────────────────────────────┐    │
│  │  Domain Services                                │    │
│  │  - Fleet / Equipment / Model                    │    │
│  │  - Checklist Engine                             │    │
│  │  - Maintenance (Preventiva + Corretiva)         │    │
│  │  - Operations (Telemetria, Ciclos)              │    │
│  │  - Area / Geo                                   │    │
│  │  - Almoxarifado                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │ Queue Worker │  │ Cron Jobs│  │ Socket.IO Server│   │
│  │  (BullMQ)   │  │(Alertas) │  │  (Real-time)    │   │
│  └──────────────┘  └──────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  DATA LAYER                                             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  PostgreSQL 16 (Banco Único Multi-Tenant)       │    │
│  │  + Row Level Security (RLS)                     │    │
│  │  + Partitioning na tabela GPS por mês           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────┐  ┌────────────┐                         │
│  │   Redis    │  │ MinIO/S3   │                         │
│  │ (cache+    │  │ (fotos,    │                         │
│  │  queues+   │  │  docs,     │                         │
│  │  sessions) │  │  anexos)   │                         │
│  └────────────┘  └────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

## Fluxo de Request

1. Request chega no API Gateway (Express)
2. Middleware de Auth valida JWT
3. Extrai `id_tenant` do token
4. Middleware de Tenant seta `SET LOCAL app.current_tenant = X` na conexão PG
5. RLS Policy filtra automaticamente por tenant
6. Middleware de Permissão valida: funcionalidade do perfil está no plano do tenant?
7. Controller processa e retorna

## Padrão de Autorização

```
Request → JWT → id_tenant + id_usuario
                    ↓
            usuario_perfil → perfil_funcionalidade
                    ↓
            VERIFICA: funcionalidade ∈ plano_funcionalidade do tenant?
                    ↓
            ✅ Autorizado | ❌ 403 Forbidden
```

## Estrutura de Pastas (Backend)

```
src/
├── config/          # DB, Redis, env vars
├── middleware/      # auth, tenant, permission, error-handler
├── modules/
│   ├── auth/        # login, refresh, forgot-password
│   ├── tenant/      # CRUD tenants (admin)
│   ├── user/        # CRUD usuários
│   ├── plan/        # planos e funcionalidades
│   ├── fleet/       # equipamento, modelo, fabricante, grupo
│   ├── checklist/   # grupo, item, execução
│   ├── area/        # area, subarea, geofence
│   ├── operator/    # operador, habilitação, documento
│   ├── maintenance/ # OS, preventiva, corretiva
│   ├── telemetry/   # GPS, eventos, horímetro
│   ├── stock/       # peças, estoque
│   ├── contractor/  # contratadas
│   └── alert/       # alertas e notificações
├── shared/          # utils, validators, i18n
├── jobs/            # BullMQ workers
└── socket/          # Socket.IO handlers
```
