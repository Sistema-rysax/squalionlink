# 🚜 SqualionLink - Fleet Management System

> Sistema de Gestão de Frotas com arquitetura multi-tenant, foco em mineração e operações pesadas.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite + Deck.gl/Mapbox (mapa estilo game) |
| Backend | Node.js (Express) + Docker |
| Banco de Dados | PostgreSQL (multi-tenant, banco único, RLS) |
| Cache/Queue | Redis + BullMQ |
| Storage | MinIO / S3 (fotos, documentos) |
| Real-time | Socket.IO |

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Modelagem de Dados](docs/DATABASE.md)
- [Multi-Tenant](docs/MULTI-TENANT.md)
- [Módulos](docs/MODULES.md)
- [i18n & Timezone](docs/I18N-TIMEZONE.md)
- [Docker](docs/DOCKER.md)

## Módulos Principais

- 🚜 Gestão de Frota (equipamento, modelo, grupo, fabricante)
- 📋 Checklist Engine (grupo, item, criticidade, foto, modelo)
- 🗺️ Áreas & Geofencing (origem, destino, improdutiva, manutenção)
- 🔧 Manutenção Preventiva (plano, gatilho, programação, OS)
- 🚨 Manutenção Corretiva (solicitação, diagnóstico, causa raiz)
- 👷 Gestão de Operadores (habilitação, documentos, turno)
- 📡 Telemetria & GPS (posição, evento, horímetro)
- 📦 Almoxarifado (peças, estoque, movimentação)
- 🏭 Contratadas (proprietário do equipamento)
- 🔔 Alertas & Notificações
- 📊 KPI Dashboard (DF%, MTBF, MTTR)

## Licença

Proprietário - Sistema Rysax © 2026
