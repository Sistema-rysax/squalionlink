# 📡 Gestão de Hardware — Módulo Completo

## Conceito

O **Hardware** é um ativo da PLATAFORMA (não do tenant). A empresa que opera o SqualionLink (ex: Rysax) possui todos os dispositivos e os **distribui entre seus clientes (tenants)**. É uma gestão patrimonial completa:

- Quantos dispositivos por tipo estão em cada cliente?
- Há quanto tempo estão lá?
- Por quantos clientes já passou?
- Quando entrou no sistema?
- Histórico completo de movimentação (entrada → cliente A → manutenção → cliente B → ...)

> ⚠️ **Diferença fundamental**: Hardware NÃO pertence ao tenant. Pertence à plataforma e é CEDIDO ao tenant.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PLATAFORMA (Master Admin)                       │
│                                                                     │
│  tipo_hardware ──→ hardware ──→ hardware_movimentacao               │
│                       │                                             │
│                       │── hardware_manutencao                       │
│                       │                                             │
│                       └── hardware_equipamento (vínculo ao equip)   │
│                                                                     │
│  Visão: "Tenho 200 GPS, 150 tablets, 80 câmeras — distribuídos     │
│           entre 12 clientes"                                        │
└─────────────────────────────────────────────────────────────────────┘
           │ (cedido a)
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         TENANT (Cliente)                             │
│                                                                     │
│  Vê apenas: hardware que está atribuído a ele                       │
│  Pode: vincular ao equipamento, reportar defeito                    │
│  NÃO pode: mover entre tenants, dar baixa                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Modelagem

### Tabelas

```sql
-- ═══════════════════════════════════════════════════════════════
-- TIPO DE HARDWARE (catálogo master — gerido pela plataforma)
-- ═══════════════════════════════════════════════════════════════
tipo_hardware (
    id_tipo_hardware BIGSERIAL PRIMARY KEY,
    -- SEM id_tenant — é da plataforma!
    
    nome VARCHAR(100) NOT NULL,             -- 'GPS/Telemetria', 'Tablet', 'Câmera Fadiga'
    codigo VARCHAR(30) NOT NULL UNIQUE,     -- 'GPS', 'TABLET', 'CAM_FADIGA', 'SENSOR_CARGA'
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(7),                         -- cor no dashboard
    
    -- Comportamento
    requer_comunicacao BOOLEAN DEFAULT true, -- gera alerta quando offline?
    tempo_offline_alerta_min INT DEFAULT 30, -- minutos sem heartbeat = alerta
    vida_util_meses INT,                    -- vida útil estimada (36, 48 meses)
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- HARDWARE (dispositivo físico — ativo patrimonial da plataforma)
-- ═══════════════════════════════════════════════════════════════
hardware (
    id_hardware BIGSERIAL PRIMARY KEY,
    id_tipo_hardware BIGINT NOT NULL REFERENCES tipo_hardware(id_tipo_hardware),
    
    -- ─── Identificação ───
    codigo_patrimonio VARCHAR(50) UNIQUE,    -- código interno da empresa (PAT-00123)
    numero_serie VARCHAR(100),
    marca VARCHAR(100) NOT NULL,            -- 'Hexagon', 'Samsung', 'Seeing Machines'
    modelo VARCHAR(100),                    -- 'SmartMine R4', 'Tab Active 5'
    
    -- ─── Conectividade ───
    imei VARCHAR(20),
    iccid VARCHAR(30),                      -- identificador SIM card
    numero_chip VARCHAR(20),                -- telefone do chip
    ip_fixo VARCHAR(45),
    mac_address VARCHAR(17),
    firmware_versao VARCHAR(50),
    
    -- ─── Aquisição ───
    dt_entrada_sistema TIMESTAMP NOT NULL,  -- quando entrou no inventário
    dt_aquisicao TIMESTAMP,                 -- data de compra
    valor_aquisicao NUMERIC(12,2),          -- custo de compra
    nota_fiscal VARCHAR(50),                -- NF de compra
    fornecedor VARCHAR(200),                -- de quem comprou
    dt_garantia_fim TIMESTAMP,              -- vencimento garantia
    
    -- ─── Localização atual ───
    id_tenant_atual BIGINT REFERENCES tenant(id_tenant), -- NULL = em estoque central
    id_equipamento_atual BIGINT REFERENCES equipamento(id_equipamento), -- NULL = não instalado
    dt_atribuicao_tenant TIMESTAMP,         -- quando foi pro tenant atual
    dt_instalacao_equipamento TIMESTAMP,    -- quando instalou no equip atual
    
    -- ─── Estado ───
    status VARCHAR(30) NOT NULL DEFAULT 'ESTOQUE',
    -- ESTOQUE           → no depósito central, disponível
    -- EM_TRANSITO       → sendo enviado para um cliente
    -- CEDIDO            → com o tenant, não instalado em equip
    -- INSTALADO         → com o tenant, instalado em equipamento
    -- MANUTENCAO        → em reparo (interno ou garantia)
    -- DESCARTADO        → baixa definitiva (defeito irreparável, obsoleto)
    -- EXTRAVIADO        → perdido / roubado
    
    -- ─── Contadores ───
    total_tenants_passados INT DEFAULT 0,   -- por quantos clientes já passou
    total_dias_em_campo INT DEFAULT 0,      -- dias fora do estoque (acumulado)
    total_manutencoes INT DEFAULT 0,        -- quantas vezes foi pra manutenção
    
    -- ─── Observações ───
    observacoes TEXT,
    
    -- ─── Controle ───
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_baixa TIMESTAMP                      -- se DESCARTADO ou EXTRAVIADO
);

-- Índices
CREATE INDEX idx_hw_tipo ON hardware(id_tipo_hardware);
CREATE INDEX idx_hw_tenant ON hardware(id_tenant_atual) WHERE id_tenant_atual IS NOT NULL;
CREATE INDEX idx_hw_status ON hardware(status);
CREATE INDEX idx_hw_serie ON hardware(numero_serie) WHERE numero_serie IS NOT NULL;
CREATE UNIQUE INDEX idx_hw_imei ON hardware(imei) WHERE imei IS NOT NULL;
CREATE INDEX idx_hw_patrimonio ON hardware(codigo_patrimonio);

-- ═══════════════════════════════════════════════════════════════
-- MOVIMENTAÇÃO DE HARDWARE (histórico completo de vida do device)
-- ═══════════════════════════════════════════════════════════════
hardware_movimentacao (
    id_hardware_movimentacao BIGSERIAL PRIMARY KEY,
    id_hardware BIGINT NOT NULL REFERENCES hardware(id_hardware),
    
    -- De onde → pra onde
    tipo_movimentacao VARCHAR(30) NOT NULL,
    -- ENTRADA_SISTEMA     → primeiro registro (compra/recebimento)
    -- ENVIO_CLIENTE       → estoque → tenant
    -- RETORNO_ESTOQUE     → tenant → estoque central
    -- TRANSFERENCIA       → tenant A → tenant B (direta)
    -- ENVIO_MANUTENCAO    → qualquer lugar → manutenção
    -- RETORNO_MANUTENCAO  → manutenção → estoque ou tenant
    -- INSTALACAO          → vínculo ao equipamento
    -- DESINSTALACAO       → remoção do equipamento
    -- BAIXA               → descarte/extravio definitivo
    
    -- Contexto da movimentação
    id_tenant_origem BIGINT REFERENCES tenant(id_tenant),      -- NULL = estoque central
    id_tenant_destino BIGINT REFERENCES tenant(id_tenant),     -- NULL = estoque central
    id_equipamento_origem BIGINT REFERENCES equipamento(id_equipamento),
    id_equipamento_destino BIGINT REFERENCES equipamento(id_equipamento),
    
    -- Detalhes
    motivo VARCHAR(255),                    -- 'Instalação em novo equipamento', 'Defeito reportado'
    observacao TEXT,
    numero_rastreio VARCHAR(100),           -- se enviado por transportadora
    
    -- Quem fez
    id_usuario_acao BIGINT REFERENCES usuario(id_usuario),
    
    -- Quando
    dt_movimentacao TIMESTAMP NOT NULL,     -- quando ocorreu
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hw_mov_hardware ON hardware_movimentacao(id_hardware, dt_movimentacao DESC);
CREATE INDEX idx_hw_mov_tenant_orig ON hardware_movimentacao(id_tenant_origem, dt_movimentacao);
CREATE INDEX idx_hw_mov_tenant_dest ON hardware_movimentacao(id_tenant_destino, dt_movimentacao);
CREATE INDEX idx_hw_mov_tipo ON hardware_movimentacao(tipo_movimentacao);

-- ═══════════════════════════════════════════════════════════════
-- MANUTENÇÃO DE HARDWARE (quando vai pra reparo)
-- ═══════════════════════════════════════════════════════════════
hardware_manutencao (
    id_hardware_manutencao BIGSERIAL PRIMARY KEY,
    id_hardware BIGINT NOT NULL REFERENCES hardware(id_hardware),
    
    tipo VARCHAR(30) NOT NULL,              -- 'PREVENTIVA', 'CORRETIVA', 'GARANTIA'
    motivo VARCHAR(255) NOT NULL,           -- 'Tela trincada', 'Sem sinal GPS', 'Bateria inchada'
    
    -- Onde está sendo reparado
    local_reparo VARCHAR(200),              -- 'Assistência Samsung SP', 'Oficina interna'
    numero_os_externa VARCHAR(50),          -- OS do fornecedor de reparo
    
    -- Custos
    custo_reparo NUMERIC(12,2),
    coberto_garantia BOOLEAN DEFAULT false,
    
    -- Datas
    dt_entrada TIMESTAMP NOT NULL,          -- quando entrou em manutenção
    dt_previsao_retorno TIMESTAMP,          -- previsão
    dt_retorno TIMESTAMP,                   -- quando voltou (NULL = ainda em manutenção)
    
    -- Resultado
    status VARCHAR(20) NOT NULL DEFAULT 'EM_REPARO',
    -- EM_REPARO, CONCLUIDA, IRREPARAVEL
    diagnostico TEXT,                       -- o que foi identificado
    servico_executado TEXT,                 -- o que foi feito
    
    id_usuario_abertura BIGINT REFERENCES usuario(id_usuario),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hw_man_hardware ON hardware_manutencao(id_hardware, dt_entrada DESC);
CREATE INDEX idx_hw_man_status ON hardware_manutencao(status) WHERE status = 'EM_REPARO';
```

---

## Visões e Queries Úteis

### Dashboard: Hardware por tipo × cliente

```sql
-- Quantos de cada tipo em cada tenant
CREATE VIEW vw_hardware_distribuicao AS
SELECT 
    t.nome_fantasia AS cliente,
    th.nome AS tipo,
    th.codigo AS tipo_codigo,
    COUNT(*) AS quantidade,
    COUNT(*) FILTER (WHERE h.status = 'INSTALADO') AS instalados,
    COUNT(*) FILTER (WHERE h.status = 'CEDIDO') AS cedidos_nao_instalados,
    MIN(h.dt_atribuicao_tenant) AS mais_antigo_desde,
    AVG(EXTRACT(DAY FROM NOW() - h.dt_atribuicao_tenant))::INT AS media_dias_no_cliente
FROM hardware h
JOIN tipo_hardware th ON th.id_tipo_hardware = h.id_tipo_hardware
JOIN tenant t ON t.id_tenant = h.id_tenant_atual
WHERE h.id_tenant_atual IS NOT NULL
  AND h.status IN ('CEDIDO', 'INSTALADO')
GROUP BY t.nome_fantasia, th.nome, th.codigo
ORDER BY t.nome_fantasia, th.nome;
```

### Ficha do hardware: por quantos clientes passou

```sql
-- Histórico completo de um hardware específico
SELECT 
    hm.dt_movimentacao,
    hm.tipo_movimentacao,
    t_orig.nome_fantasia AS de_cliente,
    t_dest.nome_fantasia AS para_cliente,
    e_orig.codigo AS de_equipamento,
    e_dest.codigo AS para_equipamento,
    hm.motivo,
    u.nome AS responsavel
FROM hardware_movimentacao hm
LEFT JOIN tenant t_orig ON t_orig.id_tenant = hm.id_tenant_origem
LEFT JOIN tenant t_dest ON t_dest.id_tenant = hm.id_tenant_destino
LEFT JOIN equipamento e_orig ON e_orig.id_equipamento = hm.id_equipamento_origem
LEFT JOIN equipamento e_dest ON e_dest.id_equipamento = hm.id_equipamento_destino
LEFT JOIN usuario u ON u.id_usuario = hm.id_usuario_acao
WHERE hm.id_hardware = :id
ORDER BY hm.dt_movimentacao DESC;
```

### KPIs de hardware

```sql
-- Resumo geral
SELECT
    (SELECT COUNT(*) FROM hardware WHERE ativo = true) AS total_ativos,
    (SELECT COUNT(*) FROM hardware WHERE status = 'ESTOQUE') AS em_estoque,
    (SELECT COUNT(*) FROM hardware WHERE status = 'INSTALADO') AS instalados,
    (SELECT COUNT(*) FROM hardware WHERE status = 'CEDIDO') AS cedidos,
    (SELECT COUNT(*) FROM hardware WHERE status = 'MANUTENCAO') AS em_manutencao,
    (SELECT COUNT(*) FROM hardware WHERE status = 'DESCARTADO') AS descartados,
    (SELECT COUNT(DISTINCT id_tenant_atual) FROM hardware WHERE id_tenant_atual IS NOT NULL) AS clientes_com_hw,
    (SELECT SUM(valor_aquisicao) FROM hardware WHERE ativo = true) AS valor_patrimonio_total;
```

---

## API Endpoints

### Gestão Patrimonial (Master Admin)

```
# ── Catálogo de Tipos ──
GET    /api/admin/tipo-hardware                   -- listar todos os tipos
POST   /api/admin/tipo-hardware                   -- criar tipo
PUT    /api/admin/tipo-hardware/:id               -- editar tipo

# ── CRUD Hardware ──
GET    /api/admin/hardware                        -- listar todos (filtros: tipo, status, tenant, marca)
POST   /api/admin/hardware                        -- cadastrar novo (status: ESTOQUE)
PUT    /api/admin/hardware/:id                    -- editar dados do device
GET    /api/admin/hardware/:id                    -- ficha completa (+ movimentações + manutenções)
DELETE /api/admin/hardware/:id                    -- soft delete (dt_baixa)

# ── Movimentações ──
POST   /api/admin/hardware/:id/enviar-cliente     -- ESTOQUE → TENANT (cria movimentação ENVIO_CLIENTE)
POST   /api/admin/hardware/:id/retornar-estoque   -- TENANT → ESTOQUE (cria RETORNO_ESTOQUE)
POST   /api/admin/hardware/:id/transferir         -- TENANT A → TENANT B (cria TRANSFERENCIA)
POST   /api/admin/hardware/:id/enviar-manutencao  -- qualquer → MANUTENÇÃO
POST   /api/admin/hardware/:id/retornar-manutencao -- MANUTENÇÃO → ESTOQUE ou TENANT
POST   /api/admin/hardware/:id/dar-baixa          -- DESCARTADO ou EXTRAVIADO
GET    /api/admin/hardware/:id/movimentacoes      -- histórico completo

# ── Manutenção de Hardware ──
GET    /api/admin/hardware-manutencao             -- listar todas (filtros: status, tipo)
POST   /api/admin/hardware/:id/manutencao         -- abrir registro de manutenção
PUT    /api/admin/hardware-manutencao/:id         -- atualizar (diagnóstico, conclusão)
GET    /api/admin/hardware-manutencao/abertas     -- todas em reparo no momento

# ── Dashboard / Relatórios ──
GET    /api/admin/hardware/dashboard              -- KPIs gerais
GET    /api/admin/hardware/distribuicao           -- por tipo × cliente
GET    /api/admin/hardware/aging                  -- tempo médio em cada cliente
GET    /api/admin/hardware/garantias-vencendo     -- garantias que vencem em X dias
GET    /api/admin/hardware/offline                -- devices sem comunicação > threshold
```

### Visão do Tenant (Cliente)

```
# O tenant só vê hardware cedido a ele
GET    /api/hardware                              -- listar hardware do meu tenant
GET    /api/hardware/:id                          -- detalhe (apenas se é do meu tenant)
POST   /api/hardware/:id/instalar                 -- vincular ao equipamento (CEDIDO → INSTALADO)
POST   /api/hardware/:id/desinstalar              -- remover do equipamento (INSTALADO → CEDIDO)
POST   /api/hardware/:id/reportar-defeito         -- reporta problema (gera notificação pro master)
GET    /api/equipamento/:id/hardware              -- devices instalados em um equipamento
```

---

## Fluxo de Vida do Hardware

```
┌──────────┐     ENTRADA_SISTEMA      ┌──────────┐
│  COMPRA  │ ──────────────────────▶  │ ESTOQUE  │
└──────────┘                          └────┬─────┘
                                           │
                    ENVIO_CLIENTE           │     RETORNO_ESTOQUE
              ┌────────────────────────────▶│◀────────────────────┐
              │                            │                      │
         ┌────▼─────┐              ┌──────▼──────┐        ┌─────┴──────┐
         │  CEDIDO  │              │  EM TRÂNSITO │        │  RETORNO   │
         │ (tenant) │              └─────────────┘        └────────────┘
         └────┬─────┘
              │
              │ INSTALACAO                          DESINSTALACAO
              ▼                                         ▲
         ┌──────────┐                                   │
         │INSTALADO │ ──────────────────────────────────┘
         │(no equip)│
         └────┬─────┘
              │
              │ ENVIO_MANUTENCAO
              ▼
         ┌──────────┐     RETORNO_MANUTENCAO     ┌──────────┐
         │MANUTENÇÃO│ ──────────────────────────▶ │ ESTOQUE  │
         │          │                             │ ou CEDIDO│
         └────┬─────┘                             └──────────┘
              │
              │ (se IRREPARAVEL)
              ▼
         ┌──────────┐
         │DESCARTADO│ ← fim de vida
         └──────────┘
```

---

## Tela: Dashboard de Hardware (Master Admin)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 📡 Gestão de Hardware                                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │   247   │ │   182   │ │    38   │ │    12   │ │     8   │           │
│ │  Total  │ │Instalado│ │ Estoque │ │Manut.   │ │ Offline │           │
│ │  Ativos │ │         │ │         │ │         │ │  > 1h   │           │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                                          │
│ ┌─── Distribuição por Cliente ──────────────────────────────────────┐   │
│ │ Cliente          │ GPS │ Tablet │ Câmera │ Sensor │ Total │ Desde │   │
│ │─────────────────────────────────────────────────────────────────── │   │
│ │ Mineradora ABC   │  38 │    35  │    20  │    15  │   108 │ 2023  │   │
│ │ Transportes XYZ  │  14 │    12  │     6  │     0  │    32 │ 2024  │   │
│ │ Locações Delta   │   5 │     5  │     2  │     0  │    12 │ 2025  │   │
│ │ (Estoque)        │  12 │     8  │    10  │     8  │    38 │  —    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── Movimentações Recentes ────────────────────────────────────────┐   │
│ │ 09/06 14:30 │ GPS-00145 │ Envio → Mineradora ABC    │ João      │   │
│ │ 09/06 10:00 │ TAB-00088 │ Retorno ← Transportes XYZ │ Maria     │   │
│ │ 08/06 16:00 │ CAM-00034 │ Manutenção (tela trincada) │ Carlos   │   │
│ │ 08/06 09:00 │ GPS-00102 │ Transferência XYZ → Delta  │ Admin    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── Alertas ───────────────────────────────────────────────────────┐   │
│ │ 🔴 8 devices offline > 1h (ver)                                    │   │
│ │ 🟡 3 garantias vencem em 30 dias (ver)                             │   │
│ │ 🟡 2 devices em manutenção > 15 dias (ver)                        │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Tela: Ficha do Hardware

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 📡 GPS-00145 — Hexagon SmartMine R4                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Status: 🟢 INSTALADO    │ Cliente: Mineradora ABC  │ Equip: CAT-01      │
│                                                                          │
│ ┌─── Dados ──────────────────────────────┐ ┌─── Vida ──────────────────┐│
│ │ Patrimônio: PAT-00145                  │ │ Entrada: 15/03/2023       ││
│ │ Série: HX-2023-A-4582                  │ │ Tempo no sistema: 2a 3m   ││
│ │ IMEI: 356938035643809                  │ │ Clientes passados: 2      ││
│ │ Firmware: v4.2.1                       │ │ Total dias em campo: 780  ││
│ │ IP: 192.168.1.45                       │ │ Manutenções: 1            ││
│ │ Garantia: até 15/03/2026              │ │ Valor: R$ 12.500,00       ││
│ └────────────────────────────────────────┘ └────────────────────────────┘│
│                                                                          │
│ ┌─── Timeline de Movimentações ─────────────────────────────────────┐   │
│ │                                                                    │   │
│ │ ● 15/03/2023  ENTRADA_SISTEMA (compra NF 4521 — fornecedor X)    │   │
│ │ │                                                                  │   │
│ │ ● 20/03/2023  ENVIO_CLIENTE → Transportes XYZ                    │   │
│ │ │              └── instalado no CAT-07                             │   │
│ │ │              └── 14 meses neste cliente                          │   │
│ │ │                                                                  │   │
│ │ ● 10/05/2024  RETORNO_ESTOQUE ← Transportes XYZ                  │   │
│ │ │              └── motivo: "Fim contrato"                          │   │
│ │ │                                                                  │   │
│ │ ● 15/05/2024  ENVIO_MANUTENCAO                                   │   │
│ │ │              └── motivo: "Revisão preventiva pré-envio"          │   │
│ │ │              └── local: Oficina interna                          │   │
│ │ │                                                                  │   │
│ │ ● 22/05/2024  RETORNO_MANUTENCAO → Estoque                       │   │
│ │ │                                                                  │   │
│ │ ● 01/06/2024  ENVIO_CLIENTE → Mineradora ABC                     │   │
│ │ │              └── instalado no CAT-01                             │   │
│ │ │              └── 12 meses neste cliente (atual)                  │   │
│ │ │                                                                  │   │
│ │ ◉ AGORA       INSTALADO — Mineradora ABC / CAT-01                │   │
│ │               └── última comunicação: 3 seg atrás                  │   │
│ │               └── firmware: v4.2.1 (atualizado)                    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Regras de Negócio

| # | Regra | Implementação |
|---|-------|---------------|
| 1 | Hardware é ativo da PLATAFORMA, não do tenant | `tipo_hardware` sem `id_tenant`. `hardware` tem `id_tenant_atual` (referência de onde está agora) |
| 2 | Toda mudança de estado gera movimentação | Trigger ou service layer: qualquer UPDATE em status/tenant/equipamento → INSERT em `hardware_movimentacao` |
| 3 | Tenant só vê hardware cedido a ele | RLS: `WHERE id_tenant_atual = current_tenant()` |
| 4 | Master admin vê tudo | Bypass RLS para role master |
| 5 | Contadores são mantidos automaticamente | Trigger: ao ENVIO_CLIENTE, incrementa `total_tenants_passados`; cron diário recalcula `total_dias_em_campo` |
| 6 | Não pode instalar hardware de outro tenant | CHECK: hardware.id_tenant_atual = equipamento.id_tenant ao instalar |
| 7 | Ao dar baixa, hardware permanece no histórico | Soft delete via `dt_baixa`, `status = DESCARTADO`. Nunca DELETE físico. |
| 8 | Alerta de offline | Cron: se `requer_comunicacao = true` AND `dt_ultima_comunicacao < NOW() - threshold` → gera alerta |
| 9 | Garantia vencendo | Cron: se `dt_garantia_fim < NOW() + 30 dias` → notificação ao admin |

---

## Funcionalidade no MODULES.md

| # | Módulo | Código | Escopo | Descrição |
|---|--------|--------|--------|-----------|
| 21 | Admin | ADMIN_HARDWARE | Master | Gestão completa: CRUD, movimentações, manutenção, dashboard |
| 22 | Frota | FROTA_HARDWARE | Tenant | Ver hardware cedido, instalar/desinstalar em equipamentos |

---

## Permissões

| Ação | Master Admin | Admin Tenant | Supervisor | Operador |
|------|:---:|:---:|:---:|:---:|
| Ver todos os hardware | ✅ | ❌ | ❌ | ❌ |
| Cadastrar hardware | ✅ | ❌ | ❌ | ❌ |
| Enviar/transferir/retornar | ✅ | ❌ | ❌ | ❌ |
| Dar baixa | ✅ | ❌ | ❌ | ❌ |
| Ver hardware do meu tenant | ✅ | ✅ | ✅ | ❌ |
| Instalar em equipamento | ✅ | ✅ | ✅ | ❌ |
| Reportar defeito | ✅ | ✅ | ✅ | ✅ |

---

## Impacto nas outras tabelas

### Remoção de duplicidade

A versão anterior tinha `hardware` com `id_tenant NOT NULL`. Isso criava o problema de precisar "recriar" o device quando movia entre tenants. A nova versão:

- `hardware.id_tenant_atual` é **NULLABLE** e **mutável** — muda via movimentação
- `hardware_historico` (versão antiga) é **substituído** por `hardware_movimentacao` — mais completo e tipado
- O campo `dt_ultima_comunicacao` permanece no `hardware` (atualizado pelo engine de telemetria)

### Integração com telemetria

O engine de GPS já faz:
```
GPS packet chega → identifica hardware por IMEI → identifica equipamento via hardware.id_equipamento_atual → grava em gps_posicao
```

Agora também atualiza:
```
UPDATE hardware SET dt_ultima_comunicacao = NOW(), firmware_versao = :fw WHERE imei = :imei
```
