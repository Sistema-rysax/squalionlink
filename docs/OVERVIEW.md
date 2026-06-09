# 📖 SqualionLink — Visão Geral do Sistema

## O que é o SqualionLink?

O **SqualionLink** é uma plataforma de **Fleet Management** (Gestão de Frotas) projetada para operações de mineração, terraplanagem e logística pesada. Diferente de sistemas genéricos de rastreamento, o SqualionLink foi desenhado com foco na **produtividade operacional** — integrando telemetria, manutenção, controle de operador e ciclo produtivo em uma única plataforma.

O sistema opera em modelo **multi-tenant** (SaaS), atendendo múltiplos clientes em uma única infraestrutura, com isolamento total de dados e configuração independente por cliente.

---

## Para quem é?

| Perfil | Como usa |
|--------|----------|
| **Mineradoras** | Controle de ciclo de transporte, produção, DMT, match frota |
| **Construtoras/Terraplanagem** | Gestão de equipamentos, manutenção, checklist pré-operação |
| **Empresas de locação** | Controle de frota por contratada, horímetro, manutenção preventiva |
| **Operações logísticas pesadas** | Rotograma, controle velocidade, alocação de frota |

---

## Princípios de Design

### 1. Tempo Real (Real-Time First)

O sistema foi projetado para operar em **tempo real**. A cada posição GPS recebida (5-30 segundos), múltiplas engines processam simultaneamente:

- **Engine de Ciclo**: detecta em qual etapa o equipamento está
- **Engine de Rotograma**: verifica se está dentro dos limites de velocidade
- **Engine de Atividade**: valida se o comportamento condiz com a atividade selecionada
- **Engine de Geofence**: identifica em qual área/cerca o equipamento se encontra
- **Engine de Alertas**: consolida violações e notifica em tempo real

Todas as atualizações são propagadas via **WebSocket (Socket.IO)** para os dashboards conectados, proporcionando uma experiência de "painel de controle" estilo game.

### 2. Multi-Tenant com Isolamento Real

Não é apenas um `WHERE id_tenant = X` na aplicação. O isolamento é garantido a nível de **PostgreSQL Row Level Security (RLS)** — impossível um bug de código vazar dados entre tenants. Cada transação define seu contexto e o banco reforça a política.

### 3. UTC Everywhere

Todo dado temporal é armazenado em **UTC+0**. O tenant configura seu timezone (`America/Sao_Paulo`, `Europe/Berlin`, etc.) e toda conversão acontece no frontend. Isso elimina ambiguidade em operações que cruzam fusos e simplifica cálculos de turno.

### 4. Multi-idioma Nativo

O sistema suporta **5 idiomas** (pt-BR, en, de, fr, es) tanto na interface quanto em dados configuráveis do banco. Novos idiomas podem ser adicionados sem alteração de schema.

### 5. Orientado a Regras de Negócio

Cada módulo não é apenas CRUD. Os módulos têm **engines inteligentes** que:
- Detectam ciclos automaticamente por GPS
- Geram alertas baseados em comportamento × expectativa
- Programam manutenções baseadas em horímetro real
- Calculam KPIs em tempo real via views materializadas
- Despacham caminhões com algoritmo de otimização

---

## Arquitetura em Alto Nível

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                     │
│                                                                     │
│  React + Vite + TypeScript                                          │
│  Mapa: Deck.gl / Mapbox GL (estilo game, 3D, tempo real)           │
│  State: Zustand    Real-Time: Socket.IO    i18n: react-i18next     │
│  Charts: Recharts/Nivo    Animations: Framer Motion                │
│                                                                     │
│  Hospedagem: Vercel / S3 + CloudFront (SPA estática)               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS + WSS
┌───────────────────────────────▼─────────────────────────────────────┐
│                        BACKEND (Docker)                              │
│                                                                     │
│  Node.js + Express + TypeScript                                     │
│                                                                     │
│  Camadas:                                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Middleware: Auth (JWT) → Tenant (RLS) → Permission (RBAC)   │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ Controllers: REST API + WebSocket handlers                   │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ Services: Lógica de negócio por domínio                     │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ Repositories: Acesso a dados (queries SQL / ORM)            │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ Engines: Ciclo, Rotograma, Atividade, Alerta, Dispatch      │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ Workers (BullMQ): Jobs assíncronos, cron, processamento     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Docker Compose: api + worker + postgres + redis + minio            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                        DADOS                                        │
│                                                                     │
│  PostgreSQL 16 — Banco único multi-tenant com RLS                   │
│  ~76 tabelas + views materializadas + partitioning (GPS, ciclos)    │
│                                                                     │
│  Redis 7 — Cache, sessões, filas BullMQ, pub/sub Socket.IO          │
│                                                                     │
│  MinIO/S3 — Fotos (checklist, OS), documentos, anexos              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Módulos do Sistema

### 🚜 Gestão de Frota
Cadastro completo de equipamentos com hierarquia: **Fabricante → Modelo → Equipamento**. Cada equipamento pertence a uma **Contratada** (dona), que pode ser o próprio tenant ou uma empresa terceira. Suporta múltiplos combustíveis por modelo, componentes rastreáveis com vida útil, e histórico completo de status.

### 📋 Checklist Engine
Motor de checklists flexível onde cada item pode ser obrigatório ou não, ter criticidade (baixa/média/alta/crítica), exigir foto, e estar vinculado a modelos de equipamento específicos. Suporta tipos de resposta variados (sim/não, numérico, escala, múltipla escolha). Itens não-conformes podem gerar Ordens de Serviço automaticamente.

### 🗺️ Áreas & Geofencing
Cadastro de áreas com tipagem operacional (origem, destino, improdutiva, manutenção, abastecimento, estacionamento). Cada área tem um polígono geográfico (GeoJSON) para detecção automática de entrada/saída. Subáreas permitem granularidade (ex: bancada dentro de uma frente de lavra).

### 🛣️ Rotograma
Conjunto de cercas virtuais vinculado ao equipamento com limites de velocidade diferenciados para **pista seca** e **chuva**. Engine em tempo real detecta excessos e gera alertas com detalhes (velocidade, limite, duração, localização). A condição climática é controlada pelo supervisor.

### 🏷️ Atividades & Status
Define o que cada equipamento pode estar fazendo, categorizado por tipo (produtiva, improdutiva, manutenção, apoio). Cada atividade tem regras de comportamento: se é feita em movimento ou parada, se faz logoff do app, tempos máximos, e limites de velocidade. O sistema monitora continuamente e gera alertas quando o comportamento não condiz com a atividade (ex: equipamento parado em atividade de transporte).

### 🔄 Ciclo Operacional
Coração produtivo do sistema. Detecta automaticamente por GPS o ciclo completo: fila de carga → carregamento → transporte cheio → fila de descarga → descarga → retorno vazio. Calcula tempos por etapa, distâncias, velocidades, produção em toneladas, e alimenta todos os KPIs de produtividade.

### 🎯 Dispatch
Módulo de alocação inteligente de frota. Decide para qual frente de carga enviar cada caminhão disponível, considerando: tamanho da fila, distância, prioridade da frente, e compatibilidade. Opera em três modos: manual, semi-automático (sugere) e automático (decide e notifica operador).

### 🔧 Manutenção Preventiva
Planos de manutenção com gatilhos configuráveis (por horímetro, quilometragem, dias ou ciclos). O sistema monitora automaticamente e gera programações futuras. Quando o gatilho é atingido, cria a Ordem de Serviço e alerta os responsáveis.

### 🚨 Manutenção Corretiva
Fluxo completo de solicitação → diagnóstico → execução. Operadores ou supervisores abrem chamados informando sintoma e urgência. O sistema cataloga falhas por sistema/componente e causa raiz, alimentando indicadores de confiabilidade (MTBF/MTTR).

### 📝 Ordem de Serviço
Unifica preventiva e corretiva em um fluxo único de OS. Registra itens executados, peças consumidas, mão de obra (HH por mecânico), tempo de parada, e custo total. Fotos e laudos podem ser anexados.

### 👷 Gestão de Operadores
Cadastro com habilitações (quais modelos pode operar), documentos com validade (CNH, ASO, NRs), escala de turnos, e vínculo com contratada. Sistema alerta sobre documentos vencendo.

### 📡 Telemetria & GPS
Recepção e processamento de posições GPS em tempo real. Armazena em tabela particionada por mês (alta volumetria). Registra eventos operacionais (ignição, idle, geofence), leituras de horímetro, e abastecimentos.

### 📦 Almoxarifado
Controle de peças e insumos com estoque mínimo, movimentações (entrada/saída/reserva), e rastreio de consumo por OS. Alerta quando estoque atinge nível mínimo.

### 📊 KPI Dashboard
Views materializadas que consolidam indicadores em tempo quase-real (refresh a cada 15 min). Inclui: Disponibilidade Física, MTBF, MTTR, Produção, Índice de Fila, DMT, Ranking de Operadores, Consumo. Metas configuráveis com semáforo visual.

### 🔔 Alertas & Notificações
Sistema unificado de alertas que consolida todas as fontes: excesso velocidade, manutenção vencida, documento vencendo, estoque baixo, anomalia de ciclo, violação de atividade. Propagados via WebSocket + push notification no mobile.

---

## Fluxo de uma Operação Típica (Dia na Mina)

```
05:30 — Troca de turno
         Supervisor ativa frentes de operação no Dispatch
         Define condição de pista: SECO
         
05:45 — Operadores fazem login no tablet
         Selecionam equipamento
         Preenchem Checklist Pré-Operação
         ├── Se tudo conforme → libera para operação
         └── Se não conforme (item crítico) → bloqueia + abre OS

06:00 — Operação inicia
         Engine de Ciclo começa a detectar automaticamente
         Dashboard mostra mapa com todos os equipamentos em tempo real
         
06:00~18:00 — Operação contínua
         • Ciclos sendo detectados e contabilizados
         • Rotograma verificando velocidade a cada GPS
         • Dispatch alocando caminhões para frentes
         • KPIs atualizando a cada 15 min
         • Alertas disparando em tempo real:
           - CAT-07 excedeu velocidade na Curva do Britador
           - ESC-03 ociosa há 15 min (sem caminhão)
           - Preventiva do CAT-12 vence em 50h
           
10:00 — Começa a chover
         Supervisor altera condição: CHUVA
         Limites de velocidade reduzidos automaticamente em todo rotograma
         
12:00 — CAT-05 reporta falha mecânica
         Operador seleciona atividade "Manutenção Corretiva" → logoff app
         Sistema marca ciclo como INCOMPLETO
         Supervisor abre Solicitação de Manutenção
         Mecânico recebe, diagnostica, abre OS
         
14:30 — CAT-05 retorna à operação
         OS fechada, tempo de parada registrado
         MTTR atualizado, DF% recalculado
         
17:30 — Fim do turno se aproxima
         Dashboard mostra produção vs meta
         Supervisor verifica se metas foram atingidas
         Operadores finalizam último ciclo
         
18:00 — Troca de turno
         Checklists de fim de turno
         Relatório automático gerado com KPIs do dia
```

---

## Diferencial Competitivo

| Aspecto | SqualionLink | Concorrentes genéricos |
|---------|-------------|----------------------|
| Ciclo automático por GPS | ✅ State machine completa | ❌ Apenas rastreamento |
| Rotograma seco/chuva | ✅ Com tolerância e sentido | ⚠️ Velocidade única |
| Atividades com regras | ✅ Alertas inteligentes | ❌ Apenas log |
| Dispatch otimizado | ✅ Algoritmo com score | ⚠️ Manual apenas |
| Multi-tenant RLS | ✅ Isolamento a nível de DB | ⚠️ Apenas WHERE |
| Multi-idioma | ✅ 5 idiomas nativos | ⚠️ Inglês apenas |
| Manutenção integrada | ✅ PM+MC+OS+Peças | ⚠️ Módulo separado |
| Real-time game-style | ✅ WebSocket + Deck.gl | ⚠️ Polling + mapa simples |

---

## Roadmap Sugerido

### Fase 1 — MVP (3-4 meses)
- [ ] Backend: Auth + Tenant + Usuário + Perfil
- [ ] Backend: Equipamento + Modelo + Contratada
- [ ] Backend: Área + Geofence
- [ ] Backend: Checklist (config + execução)
- [ ] Backend: GPS + Mapa tempo real
- [ ] Frontend: Login + Dashboard básico + Mapa
- [ ] Frontend: CRUD Frota + Checklist
- [ ] Mobile: Login + Checklist + Seleção atividade

### Fase 2 — Produtividade (2-3 meses)
- [ ] Engine de Ciclo Operacional
- [ ] Atividades com regras e alertas
- [ ] Rotograma e controle de velocidade
- [ ] KPIs básicos (DF%, Produção, Fila)
- [ ] Dashboard produção tempo real

### Fase 3 — Manutenção (2-3 meses)
- [ ] Manutenção Preventiva (plano + gatilho + programação)
- [ ] Manutenção Corretiva (solicitação + OS)
- [ ] Almoxarifado (peças + estoque)
- [ ] KPIs manutenção (MTBF, MTTR, Backlog)

### Fase 4 — Otimização (2-3 meses)
- [ ] Dispatch automático
- [ ] KPIs avançados + metas + snapshots
- [ ] Relatórios exportáveis (PDF, Excel)
- [ ] Notificações push mobile
- [ ] Integração meteorológica (auto seco/chuva)

### Fase 5 — Escala (contínuo)
- [ ] App mobile offline-first
- [ ] Integração com ERPs (SAP, TOTVS)
- [ ] Machine Learning (previsão de falha, otimização de rota)
- [ ] API pública para integrações
- [ ] White-label para revendas
