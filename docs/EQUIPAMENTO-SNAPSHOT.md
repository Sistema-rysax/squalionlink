# 🎛️ Snapshot do Equipamento — Status Completo em Tempo Real

## Conceito

A tabela `equipamento_status_atual` já existe no ATIVIDADES.md com dados básicos (atividade, operador, velocidade, GPS). Porém faltam dados críticos que o sistema precisa ter acesso **instantâneo** sem fazer JOINs pesados:

- Último odômetro
- Último horímetro
- Último checklist (quando, resultado)
- Última OS (aberta? qual?)
- Último abastecimento
- Último excesso de velocidade
- Tempo na atividade atual
- Hardware status (comunicando?)
- Regime de turno atual

**Princípio**: 1 registro por equipamento, SEMPRE atualizado. Qualquer tela que mostre "estado atual" consulta APENAS esta tabela — zero subqueries.

---

## Tabela Expandida

```sql
-- ═══════════════════════════════════════════════════════════════
-- SNAPSHOT COMPLETO DO EQUIPAMENTO (1 registro por equip, real-time)
-- ═══════════════════════════════════════════════════════════════
-- Substitui/expande a versão anterior de equipamento_status_atual

DROP TABLE IF EXISTS equipamento_status_atual;

CREATE TABLE equipamento_snapshot (
    id_equipamento_snapshot BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    
    -- ═══ OPERAÇÃO ATUAL ═══
    status_operacional VARCHAR(30) NOT NULL DEFAULT 'DESLIGADO',
    -- OPERANDO, PARADO, MANUTENCAO, SEM_OPERADOR, DESLIGADO, FORA_FROTA
    
    -- Atividade
    id_atividade_atual BIGINT REFERENCES atividade(id_atividade),
    nome_atividade_atual VARCHAR(100),       -- desnormalizado (evita JOIN)
    dt_inicio_atividade TIMESTAMP,
    duracao_atividade_seg INT,               -- calculado: NOW() - dt_inicio (atualizado periodicamente)
    
    -- Operador
    id_operador_atual BIGINT REFERENCES operador(id_operador),
    nome_operador_atual VARCHAR(255),        -- desnormalizado
    matricula_operador_atual VARCHAR(30),    -- desnormalizado
    dt_login_operador TIMESTAMP,             -- quando o operador logou neste equip
    
    -- Turno
    id_turno_atual BIGINT REFERENCES turno(id_turno),
    nome_turno_atual VARCHAR(50),
    
    -- ═══ POSIÇÃO / GPS ═══
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    velocidade_atual NUMERIC(5,1),
    direcao INT,                             -- graus (0-360)
    ignicao BOOLEAN,
    id_area_atual BIGINT REFERENCES area(id_area),
    nome_area_atual VARCHAR(100),            -- desnormalizado
    dt_ultima_posicao TIMESTAMP,             -- timestamp do último GPS recebido
    
    -- Movimento
    dt_ultimo_movimento TIMESTAMP,           -- última vez que velocidade > 0
    dt_ultima_parada TIMESTAMP,             -- última vez que velocidade = 0 após movimento
    tempo_parado_seg INT,                    -- há quanto tempo está parado (se parado)
    
    -- ═══ CONTADORES / MEDIDORES ═══
    horimetro_atual NUMERIC(12,2),
    dt_leitura_horimetro TIMESTAMP,          -- quando recebeu esse valor
    
    odometro_atual NUMERIC(12,2),
    dt_leitura_odometro TIMESTAMP,
    
    -- ═══ ÚLTIMO CHECKLIST ═══
    id_ultimo_checklist BIGINT REFERENCES checklist_execucao(id_checklist_execucao),
    tipo_ultimo_checklist VARCHAR(30),        -- 'PRE_OPERACAO', 'FIM_TURNO'
    resultado_ultimo_checklist VARCHAR(20),   -- 'CONFORME', 'NAO_CONFORME'
    total_itens_nao_conforme INT,
    dt_ultimo_checklist TIMESTAMP,
    
    -- ═══ ÚLTIMA MANUTENÇÃO / OS ═══
    id_os_aberta BIGINT REFERENCES ordem_servico(id_ordem_servico),
    tipo_os_aberta VARCHAR(20),              -- 'CORRETIVA', 'PREVENTIVA'
    prioridade_os_aberta VARCHAR(20),
    dt_abertura_os TIMESTAMP,
    
    -- Próxima preventiva
    proxima_preventiva_nome VARCHAR(100),
    proxima_preventiva_gatilho VARCHAR(50),   -- 'Horímetro: 500h' ou 'Data: 15/07'
    proxima_preventiva_restante VARCHAR(50),  -- '120h restantes' ou '6 dias'
    
    -- ═══ ÚLTIMO ABASTECIMENTO ═══
    dt_ultimo_abastecimento TIMESTAMP,
    litros_ultimo_abastecimento NUMERIC(10,2),
    horimetro_ultimo_abastecimento NUMERIC(12,2),
    consumo_medio_lh NUMERIC(8,2),           -- L/h calculado (últimos N abastecimentos)
    autonomia_estimada_horas NUMERIC(8,2),   -- baseado no consumo médio e tanque
    
    -- ═══ ÚLTIMO CICLO ═══
    id_ultimo_ciclo BIGINT,
    dt_fim_ultimo_ciclo TIMESTAMP,
    duracao_ultimo_ciclo_seg INT,
    carga_ultimo_ciclo_ton NUMERIC(10,2),
    
    -- Produção do turno atual
    ciclos_turno_atual INT DEFAULT 0,
    producao_turno_atual_ton NUMERIC(12,2) DEFAULT 0,
    
    -- ═══ ÚLTIMO EXCESSO DE VELOCIDADE ═══
    dt_ultimo_excesso TIMESTAMP,
    velocidade_ultimo_excesso NUMERIC(5,1),
    limite_ultimo_excesso NUMERIC(5,1),
    
    -- ═══ HARDWARE ═══
    hardware_gps_status VARCHAR(20),         -- 'ONLINE', 'OFFLINE', 'SEM_DEVICE'
    dt_ultimo_heartbeat_gps TIMESTAMP,
    hardware_tablet_status VARCHAR(20),
    dt_ultimo_heartbeat_tablet TIMESTAMP,
    
    -- ═══ COMUNICAÇÃO ═══
    dt_ultima_comunicacao TIMESTAMP,          -- mais recente entre GPS e tablet
    segundos_sem_comunicacao INT,             -- NOW() - dt_ultima_comunicacao
    
    -- ═══ REGIME / DISPONIBILIDADE ═══
    em_horario_turno BOOLEAN DEFAULT true,   -- está dentro de um turno programado?
    horas_trabalhadas_turno NUMERIC(6,2),    -- horas efetivas no turno atual
    
    -- ═══ CONTROLE ═══
    dt_atualizacao TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_tenant, id_equipamento)
);

-- Índices de acesso rápido
CREATE INDEX idx_eqs_tenant ON equipamento_snapshot(id_tenant);
CREATE INDEX idx_eqs_status ON equipamento_snapshot(id_tenant, status_operacional);
CREATE INDEX idx_eqs_area ON equipamento_snapshot(id_area_atual);
CREATE INDEX idx_eqs_operador ON equipamento_snapshot(id_operador_atual);
CREATE INDEX idx_eqs_comunicacao ON equipamento_snapshot(id_tenant, dt_ultima_comunicacao);
```

---

## Quem atualiza o quê?

| Campo | Trigger / Origem | Frequência |
|-------|-----------------|-----------|
| latitude, longitude, velocidade, direcao | Engine GPS (cada posição recebida) | 5-30s |
| ignicao | Engine GPS | 5-30s |
| horimetro_atual, odometro_atual | Engine GPS (CAN bus) ou leitura manual | 5-30s ou manual |
| id_atividade_atual, nome_atividade | Engine Atividade (app mobile ou sistema) | Evento |
| id_operador_atual, nome_operador | Login/logout no app mobile | Evento |
| id_area_atual, nome_area | Engine Geofence (detecta entrada/saída) | Evento |
| dt_ultimo_movimento, dt_ultima_parada | Engine GPS (velocidade > 0 ou = 0) | 5-30s |
| id_ultimo_checklist, resultado | Após sync de checklist do mobile | Evento |
| id_os_aberta, tipo_os, prioridade | Ao abrir/fechar OS | Evento |
| dt_ultimo_abastecimento, litros | Após registro de abastecimento | Evento |
| id_ultimo_ciclo, produção turno | Engine Ciclo (ao fechar ciclo) | Evento |
| dt_ultimo_excesso | Engine Rotograma (ao detectar excesso) | Evento |
| hardware_*_status | Heartbeat check (cron 1min) | 1 min |
| consumo_medio, autonomia | Recalculado a cada abastecimento | Evento |
| proxima_preventiva_* | Recalculado a cada atualização de horímetro | 5-30s |
| ciclos_turno, producao_turno | Incrementado a cada ciclo fechado | Evento |
| em_horario_turno | Verificado contra regime_turno_calendario | Evento (troca turno) |

---

## Engine de Atualização

```typescript
// Chamado pelo engine de GPS a cada posição recebida
async function atualizarSnapshotGPS(idEquipamento: number, posicao: GPSPosicao) {
  await db.query(`
    UPDATE equipamento_snapshot SET
      latitude = $2,
      longitude = $3,
      velocidade_atual = $4,
      direcao = $5,
      ignicao = $6,
      horimetro_atual = COALESCE($7, horimetro_atual),
      odometro_atual = COALESCE($8, odometro_atual),
      dt_ultima_posicao = $9,
      dt_ultima_comunicacao = $9,
      hardware_gps_status = 'ONLINE',
      dt_ultimo_heartbeat_gps = $9,
      -- Movimento
      dt_ultimo_movimento = CASE WHEN $4 > 0 THEN $9 ELSE dt_ultimo_movimento END,
      dt_ultima_parada = CASE WHEN $4 = 0 AND velocidade_atual > 0 THEN $9 ELSE dt_ultima_parada END,
      tempo_parado_seg = CASE WHEN $4 = 0 THEN EXTRACT(EPOCH FROM $9 - COALESCE(dt_ultima_parada, $9))::INT ELSE 0 END,
      -- Horímetro
      dt_leitura_horimetro = CASE WHEN $7 IS NOT NULL THEN $9 ELSE dt_leitura_horimetro END,
      dt_leitura_odometro = CASE WHEN $8 IS NOT NULL THEN $9 ELSE dt_leitura_odometro END,
      -- Controle
      dt_atualizacao = NOW()
    WHERE id_equipamento = $1
  `, [idEquipamento, posicao.lat, posicao.lng, posicao.vel, posicao.dir,
      posicao.ignicao, posicao.horimetro, posicao.odometro, posicao.dt]);
  
  // Verificar geofence (área atual)
  await verificarAreaAtual(idEquipamento, posicao.lat, posicao.lng);
  
  // Verificar excesso de velocidade
  await verificarExcessoVelocidade(idEquipamento, posicao.vel);
}

// Chamado quando operador muda atividade
async function atualizarSnapshotAtividade(idEquipamento: number, idAtividade: number, idOperador: number) {
  const ativ = await getAtividade(idAtividade);
  const oper = await getOperador(idOperador);
  
  await db.query(`
    UPDATE equipamento_snapshot SET
      id_atividade_atual = $2,
      nome_atividade_atual = $3,
      dt_inicio_atividade = NOW(),
      duracao_atividade_seg = 0,
      id_operador_atual = $4,
      nome_operador_atual = $5,
      matricula_operador_atual = $6,
      status_operacional = CASE 
        WHEN $7 = 'PRODUTIVA' THEN 'OPERANDO'
        WHEN $7 = 'MANUTENCAO' THEN 'MANUTENCAO'
        ELSE 'PARADO'
      END,
      dt_atualizacao = NOW()
    WHERE id_equipamento = $1
  `, [idEquipamento, idAtividade, ativ.nome, idOperador, oper.nome, oper.matricula, ativ.classificacao]);
}

// Chamado ao finalizar ciclo
async function atualizarSnapshotCiclo(idEquipamento: number, ciclo: CicloOperacional) {
  await db.query(`
    UPDATE equipamento_snapshot SET
      id_ultimo_ciclo = $2,
      dt_fim_ultimo_ciclo = $3,
      duracao_ultimo_ciclo_seg = $4,
      carga_ultimo_ciclo_ton = $5,
      ciclos_turno_atual = ciclos_turno_atual + 1,
      producao_turno_atual_ton = producao_turno_atual_ton + $5,
      dt_atualizacao = NOW()
    WHERE id_equipamento = $1
  `, [idEquipamento, ciclo.id, ciclo.dt_fim, ciclo.duracao_seg, ciclo.carga_ton]);
}

// Cron a cada 1 minuto: verificar devices offline
async function cronVerificarOffline() {
  await db.query(`
    UPDATE equipamento_snapshot SET
      hardware_gps_status = CASE 
        WHEN dt_ultimo_heartbeat_gps < NOW() - INTERVAL '5 minutes' THEN 'OFFLINE'
        ELSE hardware_gps_status END,
      hardware_tablet_status = CASE 
        WHEN dt_ultimo_heartbeat_tablet < NOW() - INTERVAL '5 minutes' THEN 'OFFLINE'
        ELSE hardware_tablet_status END,
      segundos_sem_comunicacao = EXTRACT(EPOCH FROM NOW() - dt_ultima_comunicacao)::INT
    WHERE status_operacional != 'DESLIGADO'
  `);
}
```

---

## Views para consulta rápida

```sql
-- View: Painel completo (o que a tela de monitoramento usa)
CREATE VIEW vw_equipamento_monitor AS
SELECT 
    es.*,
    e.codigo AS equipamento_codigo,
    me.nome AS modelo_nome,
    ge.nome AS grupo_nome,
    c.nome_fantasia AS contratada_nome
FROM equipamento_snapshot es
JOIN equipamento e ON e.id_equipamento = es.id_equipamento
JOIN modelo_equipamento me ON me.id_modelo_equipamento = e.id_modelo_equipamento
JOIN grupo_equipamento ge ON ge.id_grupo_equipamento = me.id_grupo_equipamento
JOIN contratada c ON c.id_contratada = e.id_contratada
WHERE e.ativo = true;

-- View: Equipamentos offline
CREATE VIEW vw_equipamento_offline AS
SELECT * FROM equipamento_snapshot
WHERE hardware_gps_status = 'OFFLINE'
  AND status_operacional NOT IN ('DESLIGADO', 'FORA_FROTA')
ORDER BY dt_ultima_comunicacao ASC;

-- View: Próximas preventivas
CREATE VIEW vw_proximas_preventivas AS
SELECT 
    id_equipamento, 
    proxima_preventiva_nome,
    proxima_preventiva_restante
FROM equipamento_snapshot
WHERE proxima_preventiva_nome IS NOT NULL
ORDER BY proxima_preventiva_restante ASC;
```

---

## API Endpoint

```
GET /api/equipamento/:id/snapshot          -- snapshot completo de 1 equipamento
GET /api/equipamento/snapshot              -- snapshot de TODOS (lista paginada, filtros: status, area, grupo)
GET /api/equipamento/snapshot/resumo       -- contadores: operando, parado, manutencao, offline
GET /api/equipamento/snapshot/offline      -- só os offline
GET /api/equipamento/snapshot/mapa         -- otimizado pra mapa: id, lat, lng, vel, status, cor
```

---

## Tela: Ficha do Equipamento (snapshot)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🚜 CAT-01 — Caterpillar 777G                    🟢 OPERANDO             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─── Operação Atual ────────────────────────────────────────────────┐   │
│ │ Atividade:  Transporte Cheio        │ Há 12 min                    │   │
│ │ Operador:   João Silva (OP-001)     │ Logado há 3h 45min           │   │
│ │ Turno:      A (06:00–18:00)         │ 9h 15min trabalhadas         │   │
│ │ Velocidade: 42 km/h                 │ Direção: 245° (SW)           │   │
│ │ Área:       Rota Principal          │ Ignição: ✅ ON               │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── Contadores ────────────┐ ┌─── Produção Turno ──────────────────┐  │
│ │ Horímetro: 12.450,3 h     │ │ Ciclos:    18                        │  │
│ │ Atualizado: 3s atrás      │ │ Produção:  1.620 ton                 │  │
│ │                            │ │ Último:    92t (há 12 min)           │  │
│ │ Odômetro: 84.230 km       │ │ Tempo médio ciclo: 24 min            │  │
│ │ Atualizado: 3s atrás      │ └──────────────────────────────────────┘  │
│ └────────────────────────────┘                                           │
│                                                                          │
│ ┌─── GPS/Comunicação ───────┐ ┌─── Último Checklist ────────────────┐  │
│ │ Lat: -20.123456           │ │ Pré-Operação Caminhão               │  │
│ │ Lng: -43.987654           │ │ Resultado: ✅ CONFORME (22/22)       │  │
│ │ GPS: 🟢 Online (3s)      │ │ Data: hoje 06:15                     │  │
│ │ Tablet: 🟢 Online (8s)   │ └──────────────────────────────────────┘  │
│ └────────────────────────────┘                                           │
│                                                                          │
│ ┌─── Manutenção ────────────┐ ┌─── Combustível ─────────────────────┐  │
│ │ OS Aberta: Nenhuma ✅      │ │ Último abast: 08/06 18:30 (420L)    │  │
│ │ Próx. Preventiva:         │ │ Consumo médio: 62 L/h                │  │
│ │  "Troca filtros 500h"     │ │ Autonomia estimada: ~6.5h            │  │
│ │  Faltam: 48h              │ └──────────────────────────────────────┘  │
│ └────────────────────────────┘                                           │
│                                                                          │
│ ┌─── Último Excesso ────────┐ ┌─── Hardware ────────────────────────┐  │
│ │ 08/06 14:32               │ │ GPS: Hexagon R4 (SN: HX-4582)  🟢  │  │
│ │ 68 km/h (limite: 60)      │ │ Tablet: Samsung Tab Active     🟢   │  │
│ │ Local: Curva Britador     │ │ Câmera: Seeing Machines        🟢   │  │
│ └────────────────────────────┘ └──────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Diferença da versão anterior

| Campo | Antes (equipamento_status_atual) | Agora (equipamento_snapshot) |
|-------|------|------|
| Atividade | ✅ id + dt_inicio | ✅ + nome + duração calculada |
| Operador | ✅ id | ✅ + nome + matrícula + dt_login |
| GPS | ✅ lat, lng, vel | ✅ + direção + dt_posição + tempo_parado |
| Horímetro | ✅ valor | ✅ + dt_leitura |
| Odômetro | ❌ | ✅ valor + dt_leitura |
| Checklist | ❌ | ✅ id + tipo + resultado + dt |
| OS aberta | ❌ | ✅ id + tipo + prioridade + dt |
| Preventiva próxima | ❌ | ✅ nome + gatilho + restante |
| Abastecimento | ❌ | ✅ dt + litros + consumo + autonomia |
| Ciclo/Produção | ❌ | ✅ último ciclo + produção turno |
| Excesso velocidade | ❌ | ✅ dt + velocidade + limite |
| Hardware status | ❌ | ✅ GPS + tablet status + heartbeat |
| Área atual | ✅ id | ✅ + nome (desnormalizado) |
| Comunicação | ❌ | ✅ dt + segundos_sem_comunicacao |

---

## Regras

1. **Um registro por equipamento** — UNIQUE(id_tenant, id_equipamento)
2. **Nunca faz JOIN para consultar estado atual** — tudo desnormalizado nesta tabela
3. **Atualizado por eventos** — não por polling (cada engine atualiza seu pedaço)
4. **Cron complementar** — a cada 1 min recalcula: tempo_parado, duração_atividade, hardware offline
5. **Reset no início do turno** — ciclos_turno_atual e producao_turno_atual zerados

---

## Tabela renomeada

| Antes | Agora | Motivo |
|-------|-------|--------|
| equipamento_status_atual | **equipamento_snapshot** | Nome reflete melhor: é um snapshot completo, não só status |

**Nenhuma tabela nova** — é uma expansão da existente. Total permanece ~107 tabelas.
