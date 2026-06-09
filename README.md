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

### 📖 Visão Geral
- [Overview — Texto explicativo completo](docs/OVERVIEW.md)

### 🏗️ Arquitetura & Infra
- [Arquitetura do Sistema](docs/ARCHITECTURE.md)
- [Multi-Tenant (RLS)](docs/MULTI-TENANT.md)
- [Docker Compose](docs/DOCKER.md)
- [i18n & Timezone](docs/I18N-TIMEZONE.md)

### 📊 Modelagem de Dados
- [Database — Tabelas e Convenções](docs/DATABASE.md)
- [SQL Schema Completo](schema/001_initial.sql)

### 📦 Módulos
- [Módulos & Planos](docs/MODULES.md)
- [Rotograma & Velocidade](docs/ROTOGRAMA.md)
- [Atividades & Status Real-Time](docs/ATIVIDADES.md)
- [Ciclo Operacional](docs/CICLO-OPERACIONAL.md)
- [Dispatch & Alocação](docs/DISPATCH.md)
- [KPI & Indicadores](docs/KPI.md)

### 📈 Relatórios
- [Report Builder (Construtor de Relatórios)](docs/REPORT-BUILDER.md)

### 🎨 UI/UX
- [Design System — Layout, Componentes, Padrões](docs/UI-DESIGN-SYSTEM.md)

### 🔌 API
- [API Documentation (REST + WebSocket)](docs/API.md)

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
