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
- [Rotograma & Velocidade](docs/ROTOGRAMA.md)
- [Atividades & Status](docs/ATIVIDADES.md)
- [Ciclo Operacional](docs/CICLO-OPERACIONAL.md)
- [i18n & Timezone](docs/I18N-TIMEZONE.md)
- [Docker](docs/DOCKER.md)

## Módulos Principais

- 🚜 Gestão de Frota (equipamento, modelo, grupo, fabricante)
- 📋 Checklist Engine (grupo, item, criticidade, foto, modelo)
- 🗺️ Áreas & Geofencing (origem, destino, improdutiva, manutenção)
- 🛣️ Rotograma (cercas virtuais, velocidade seco/chuva, excesso)
- 🏷️ Atividades (grupo, tipo, regras movimento/parada, alertas inteligentes)
- 📊 Status Real-Time (status operacional por equipamento, mapa game-style)
- 🔧 Manutenção Preventiva (plano, gatilho, programação, OS)
- 🚨 Manutenção Corretiva (solicitação, diagnóstico, causa raiz)
- 👷 Gestão de Operadores (habilitação, documentos, turno)
- 🔄 Ciclo Operacional (carga → transporte → descarga, produtividade, DMT, match frota)
- 📡 Telemetria & GPS (posição, evento, horímetro)
- 📦 Almoxarifado (peças, estoque, movimentação)
- 🏭 Contratadas (proprietário do equipamento)
- 🔔 Alertas & Notificações
- 📊 KPI Dashboard (DF%, MTBF, MTTR)

## Licença

Proprietário - Sistema Rysax © 2026
