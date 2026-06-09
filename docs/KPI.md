# 📊 KPI & Indicadores

## Conceito

O módulo de KPI concentra todos os indicadores de performance da operação. Utiliza **views materializadas** no PostgreSQL para consultas rápidas, atualizadas periodicamente via cron job ou evento.

## Indicadores Principais

### 🔧 Manutenção

| KPI | Fórmula | Meta típica |
|-----|---------|-------------|
| **DF% (Disponibilidade Física)** | (Horas Disponíveis / Horas Calendário) × 100 | > 85% |
| **MTBF (Mean Time Between Failures)** | Horas Operação / Nº Falhas | Maximizar |
| **MTTR (Mean Time To Repair)** | Σ Tempo Reparo / Nº Reparos | Minimizar |
| **Backlog** | OS Abertas × Tempo Médio Execução | < 2 semanas |
| **Custo/Hora** | Custo Total Manutenção / Horas Operação | Benchmark |
| **% Preventiva vs Corretiva** | OS Preventivas / Total OS × 100 | > 70% preventiva |
| **Aderência PM** | Preventivas Executadas no Prazo / Programadas × 100 | > 90% |

### 🚜 Operação / Produção

| KPI | Fórmula | Meta típica |
|-----|---------|-------------|
| **Produção (ton/h)** | Total Toneladas / Horas Efetivas | Por modelo |
| **Utilização (UF%)** | Horas Trabalhadas / Horas Disponíveis × 100 | > 75% |
| **Índice de Fila** | Tempo em Fila / Tempo Ciclo × 100 | < 20% |
| **DMT** | Distância Média de Transporte (km) | Monitorar |
| **Ciclos/Turno** | Ciclos Completos por Turno | Maximizar |
| **Rendimento** | Produção Real / Produção Planejada × 100 | > 90% |
| **Match Frota** | Tempo Ciclo / Tempo Carga | Otimizar |

### 👷 Operador

| KPI | Fórmula | Meta típica |
|-----|---------|-------------|
| **Produtividade Operador** | Toneladas / Horas Operadas | Ranking |
| **Excessos Velocidade** | Nº Excessos / Horas Operadas | Minimizar |
| **Aderência Checklist** | Checklists Conformes / Total × 100 | > 95% |
| **Tempo Ocioso** | Horas sem Atividade Produtiva / Horas Turno | < 15% |

### ⛽ Consumo

| KPI | Fórmula | Meta típica |
|-----|---------|-------------|
| **Consumo (L/h)** | Litros Abastecidos / Horas Operação | Por modelo |
| **Consumo (L/ton)** | Litros / Toneladas Produzidas | Minimizar |
| **Consumo (L/km)** | Litros / km Percorridos | Benchmark |

## Modelagem

### Views Materializadas

```sql
-- KPI de Disponibilidade Física (diário por equipamento)
CREATE MATERIALIZED VIEW mv_kpi_disponibilidade AS
SELECT
    e.id_tenant,
    e.id_equipamento,
    d.data_referencia,
    t.id_turno,
    
    -- Horas calendário (horas do turno)
    EXTRACT(EPOCH FROM (t.hora_fim - t.hora_inicio)) / 3600.0 AS horas_calendario,
    
    -- Horas em manutenção
    COALESCE(SUM(
        CASE WHEN os.tipo IN ('PREVENTIVA','CORRETIVA') 
        THEN os.tempo_parada_horas END
    ), 0) AS horas_manutencao,
    
    -- DF%
    CASE 
        WHEN EXTRACT(EPOCH FROM (t.hora_fim - t.hora_inicio)) / 3600.0 > 0
        THEN (1 - COALESCE(SUM(
            CASE WHEN os.tipo IN ('PREVENTIVA','CORRETIVA') 
            THEN os.tempo_parada_horas END
        ), 0) / (EXTRACT(EPOCH FROM (t.hora_fim - t.hora_inicio)) / 3600.0)) * 100
        ELSE 0
    END AS disponibilidade_fisica_pct

FROM equipamento e
CROSS JOIN generate_series(
    CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE, '1 day'
) AS d(data_referencia)
CROSS JOIN turno t ON t.id_tenant = e.id_tenant AND t.ativo = true
LEFT JOIN ordem_servico os ON os.id_equipamento = e.id_equipamento
    AND os.dt_abertura::date = d.data_referencia
    AND os.id_tenant = e.id_tenant
WHERE e.ativo = true AND e.dt_deletado IS NULL
GROUP BY e.id_tenant, e.id_equipamento, d.data_referencia, t.id_turno, t.hora_inicio, t.hora_fim;

CREATE UNIQUE INDEX idx_mv_kpi_disp ON mv_kpi_disponibilidade 
    (id_tenant, id_equipamento, data_referencia, id_turno);

-- Refresh periódico (a cada 15 min via cron)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_disponibilidade;
```

```sql
-- KPI de Produção (diário)
CREATE MATERIALIZED VIEW mv_kpi_producao AS
SELECT
    co.id_tenant,
    co.id_equipamento,
    co.id_equipamento_carga,
    co.id_area_origem,
    co.id_area_destino,
    co.id_material,
    co.id_turno,
    co.dt_inicio_ciclo::date AS data_referencia,
    
    -- Ciclos
    COUNT(*) AS total_ciclos,
    COUNT(*) FILTER (WHERE co.status = 'COMPLETO') AS ciclos_completos,
    
    -- Produção
    SUM(COALESCE(co.carga_ton, co.carga_estimada_ton)) AS producao_ton,
    AVG(COALESCE(co.carga_ton, co.carga_estimada_ton)) AS carga_media_ton,
    
    -- Tempos (médias em minutos)
    AVG(co.tempo_total_ciclo_seg) / 60.0 AS tempo_medio_ciclo_min,
    AVG(co.tempo_fila_carga_seg) / 60.0 AS tempo_medio_fila_carga_min,
    AVG(co.tempo_carga_seg) / 60.0 AS tempo_medio_carga_min,
    AVG(co.tempo_transporte_cheio_seg) / 60.0 AS tempo_medio_transp_cheio_min,
    AVG(co.tempo_fila_descarga_seg) / 60.0 AS tempo_medio_fila_descarga_min,
    AVG(co.tempo_descarga_seg) / 60.0 AS tempo_medio_descarga_min,
    AVG(co.tempo_transporte_vazio_seg) / 60.0 AS tempo_medio_transp_vazio_min,
    
    -- Distâncias
    AVG(co.distancia_cheio_km) AS dmt_medio_km,
    SUM(co.distancia_total_km) AS distancia_total_km,
    
    -- Velocidades
    AVG(co.velocidade_media_cheio) AS vel_media_cheio,
    AVG(co.velocidade_media_vazio) AS vel_media_vazio,
    
    -- Índice de fila
    AVG(
        (COALESCE(co.tempo_fila_carga_seg, 0) + COALESCE(co.tempo_fila_descarga_seg, 0))::numeric 
        / NULLIF(co.tempo_total_ciclo_seg, 0) * 100
    ) AS indice_fila_pct

FROM ciclo_operacional co
WHERE co.dt_inicio_ciclo >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY co.id_tenant, co.id_equipamento, co.id_equipamento_carga, 
         co.id_area_origem, co.id_area_destino, co.id_material,
         co.id_turno, co.dt_inicio_ciclo::date;

CREATE UNIQUE INDEX idx_mv_kpi_prod ON mv_kpi_producao 
    (id_tenant, data_referencia, id_equipamento, id_turno, id_area_origem, id_area_destino, id_material);
```

```sql
-- KPI de MTBF / MTTR (por equipamento, últimos 90 dias)
CREATE MATERIALIZED VIEW mv_kpi_mtbf_mttr AS
SELECT
    e.id_tenant,
    e.id_equipamento,
    me.id_modelo_equipamento,
    
    -- MTBF: horas entre falhas
    CASE 
        WHEN COUNT(os.id_ordem_servico) FILTER (WHERE os.tipo = 'CORRETIVA') > 0
        THEN (
            EXTRACT(EPOCH FROM (MAX(os.dt_abertura) - MIN(os.dt_abertura))) / 3600.0
        ) / COUNT(os.id_ordem_servico) FILTER (WHERE os.tipo = 'CORRETIVA')
        ELSE NULL
    END AS mtbf_horas,
    
    -- MTTR: tempo médio de reparo
    AVG(os.tempo_parada_horas) FILTER (WHERE os.tipo = 'CORRETIVA') AS mttr_horas,
    
    -- Contadores
    COUNT(os.id_ordem_servico) FILTER (WHERE os.tipo = 'CORRETIVA') AS total_corretivas,
    COUNT(os.id_ordem_servico) FILTER (WHERE os.tipo = 'PREVENTIVA') AS total_preventivas,
    
    -- Custo
    SUM(os.custo_total) AS custo_total_manutencao,
    SUM(os.custo_total) / NULLIF(SUM(os.tempo_parada_horas), 0) AS custo_por_hora_parada

FROM equipamento e
JOIN modelo_equipamento me ON e.id_modelo_equipamento = me.id_modelo_equipamento
LEFT JOIN ordem_servico os ON os.id_equipamento = e.id_equipamento 
    AND os.dt_abertura >= CURRENT_DATE - INTERVAL '90 days'
    AND os.status = 'CONCLUIDA'
WHERE e.ativo = true
GROUP BY e.id_tenant, e.id_equipamento, me.id_modelo_equipamento;
```

```sql
-- KPI de Operador (últimos 30 dias)
CREATE MATERIALIZED VIEW mv_kpi_operador AS
SELECT
    o.id_tenant,
    o.id_operador,
    o.nome,
    
    -- Produção
    COUNT(co.id_ciclo_operacional) AS total_ciclos,
    SUM(COALESCE(co.carga_ton, co.carga_estimada_ton)) AS producao_ton,
    
    -- Velocidade
    COUNT(ev.id_excesso_velocidade) AS total_excessos_velocidade,
    
    -- Checklist
    COUNT(ce.id_checklist_execucao) AS total_checklists,
    COUNT(ce.id_checklist_execucao) FILTER (WHERE ce.total_nao_conforme = 0) AS checklists_conformes,
    
    -- Horas
    SUM(eah.duracao_minutos) / 60.0 AS horas_operadas

FROM operador o
LEFT JOIN ciclo_operacional co ON co.id_operador = o.id_operador 
    AND co.dt_inicio_ciclo >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN excesso_velocidade ev ON ev.id_operador = o.id_operador
    AND ev.dt_evento >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN checklist_execucao ce ON ce.id_operador = o.id_operador
    AND ce.dt_inicio >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN equipamento_atividade_historico eah ON eah.id_operador = o.id_operador
    AND eah.dt_inicio >= CURRENT_DATE - INTERVAL '30 days'
WHERE o.ativo = true
GROUP BY o.id_tenant, o.id_operador, o.nome;
```

### Tabela de Metas

```sql
-- Meta de KPI (configurável por tenant)
kpi_meta (
    id_kpi_meta BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    indicador VARCHAR(50) NOT NULL,          -- 'DF_PCT','MTBF','PRODUCAO_TON_H','INDICE_FILA'
    id_modelo_equipamento BIGINT FK,         -- NULL = global
    id_equipamento BIGINT FK,               -- NULL = por modelo ou global
    meta_valor NUMERIC(12,2) NOT NULL,
    meta_tipo VARCHAR(10) NOT NULL,         -- 'MIN','MAX','RANGE'
    meta_minimo NUMERIC(12,2),              -- para tipo RANGE
    meta_maximo NUMERIC(12,2),
    unidade VARCHAR(20),                    -- '%','horas','ton/h','km'
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL
)

-- Snapshot diário de KPIs (para histórico e trend)
kpi_snapshot_diario (
    id_kpi_snapshot BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    data_referencia DATE NOT NULL,
    indicador VARCHAR(50) NOT NULL,
    dimensao VARCHAR(50),                   -- 'EQUIPAMENTO','MODELO','FRENTE','OPERADOR','GLOBAL'
    id_dimensao BIGINT,                     -- id do equipamento/modelo/operador
    valor NUMERIC(12,4) NOT NULL,
    meta_valor NUMERIC(12,2),
    status_meta VARCHAR(10),                -- 'ACIMA','DENTRO','ABAIXO'
    dt_calculo TIMESTAMP NOT NULL,
    UNIQUE(id_tenant, data_referencia, indicador, dimensao, id_dimensao)
)
```

## Cron Jobs para Refresh

```typescript
// Executar a cada 15 minutos
cron.schedule('*/15 * * * *', async () => {
    await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_disponibilidade');
    await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_producao');
});

// Executar a cada hora
cron.schedule('0 * * * *', async () => {
    await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_mtbf_mttr');
    await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_operador');
});

// Executar 1x ao dia (meia-noite UTC) — snapshot diário
cron.schedule('0 0 * * *', async () => {
    await calcularSnapshotDiario();
});
```

## Dashboard Sugerido

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 DASHBOARD KPI                     Turno A | 09/06/2026          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │  87.3%  │ │  342h   │ │  4.2h   │ │  2,450  │ │  18.2%  │     │
│  │   DF%   │ │  MTBF   │ │  MTTR   │ │ ton/h   │ │  Fila   │     │
│  │  ▲ 1.2% │ │  ▲ 12h  │ │  ▼ 0.5h │ │  ▲ 5%   │ │  ▼ 2%   │     │
│  │  🟢 meta│ │  🟢 meta│ │  🟡 meta│ │  🟢 meta│ │  🟢 meta│     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│                                                                     │
│  ┌────────────────────────────┐  ┌────────────────────────────┐    │
│  │  📈 DF% - Últimos 30 dias │  │  📈 Produção - Últimos 30d │    │
│  │  [gráfico de linha/trend]  │  │  [gráfico barras empilhadas│    │
│  │                            │  │   por material]            │    │
│  └────────────────────────────┘  └────────────────────────────┘    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  🏆 RANKING OPERADORES (Top 10 produtividade)               │  │
│  │  1. João Silva      - 185 ton/h - 0 excessos - 100% CKL    │  │
│  │  2. Carlos Santos   - 172 ton/h - 1 excesso  - 98% CKL     │  │
│  │  3. ...                                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```
