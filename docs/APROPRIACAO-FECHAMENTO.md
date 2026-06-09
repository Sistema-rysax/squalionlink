# 🎯 Apropriação de Rota & Fechamento de Período

## Visão Geral

Dois módulos complementares que fecham o ciclo de planejamento ↔ controle:

1. **Apropriação de Rota** — Configura para cada combinação Origem×Destino: centro de custo, tempo de ciclo esperado, distância média, ciclos/hora esperados
2. **Fechamento de Período** — Controle de lock/unlock de dados por período, com auditoria de quem fechou/reabriu

---

## 1. Apropriação de Rota

### Conceito

Para cada **combinação Origem → Destino**, o planejamento define os parâmetros esperados. Isso permite:

- Saber o **centro de custo** responsável por aquele transporte
- Comparar **tempo real** vs. **tempo planejado** de ciclo
- Calcular **ciclos esperados/hora** para dimensionamento de frota
- Alimentar o **orçamento** (custo por ton × distância × centro de custo)
- Detectar **desvios**: se o tempo real > planejado, há ineficiência

### Por que é diferente da tabela `rota`?

| `rota` (já existe) | `apropriacao_rota` (novo) |
|---------------------|---------------------------|
| Define o CAMINHO físico (polyline) | Define os PARÂMETROS OPERACIONAIS |
| Distância geométrica fixa | Distância média operacional (pode variar) |
| Tempo estimado genérico | Tempo de ciclo por fase (carga, transporte, etc.) |
| Não tem centro de custo | Vincula centro de custo contábil |
| Não muda por período | Pode mudar por período/campanha |

A `rota` é o traçado no mapa. A `apropriacao_rota` é o **contrato operacional** daquela rota.

### Modelagem

```sql
-- ═══════════════════════════════════════════════════════════════
-- CENTRO DE CUSTO (lookup — vem do ERP ou cadastrado manual)
-- ═══════════════════════════════════════════════════════════════
centro_custo (
    id_centro_custo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    codigo VARCHAR(30) NOT NULL,            -- '4.1.001', 'MIN-NORTE-001'
    nome VARCHAR(200) NOT NULL,             -- 'Lavra Frente Norte', 'Transporte Estéril'
    tipo VARCHAR(30),                       -- 'PRODUCAO', 'SERVICO', 'APOIO', 'OVERHEAD'
    id_centro_custo_pai BIGINT REFERENCES centro_custo(id_centro_custo), -- hierárquico
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, codigo)
);

-- ═══════════════════════════════════════════════════════════════
-- APROPRIAÇÃO DE ROTA (parâmetros operacionais por Origem×Destino)
-- ═══════════════════════════════════════════════════════════════
apropriacao_rota (
    id_apropriacao_rota BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    -- ─── Combinação Origem × Destino ───
    id_area_origem BIGINT NOT NULL REFERENCES area(id_area),
    id_area_destino BIGINT NOT NULL REFERENCES area(id_area),
    id_rota BIGINT REFERENCES rota(id_rota),               -- rota física (opcional)
    id_material BIGINT REFERENCES material(id_material),    -- material transportado (opcional, permite diferente config por material na mesma rota)
    
    -- ─── Centro de Custo ───
    id_centro_custo BIGINT REFERENCES centro_custo(id_centro_custo),
    
    -- ─── Parâmetros Planejados ───
    distancia_media_km NUMERIC(8,2) NOT NULL,               -- DMT planejada
    
    -- Tempos esperados (segundos)
    tempo_fila_carga_seg INT DEFAULT 0,                     -- tempo em fila antes da carga
    tempo_carga_seg INT NOT NULL,                           -- tempo de carregamento
    tempo_transporte_cheio_seg INT NOT NULL,                -- transporte ida (carregado)
    tempo_fila_descarga_seg INT DEFAULT 0,                  -- tempo em fila antes da descarga
    tempo_descarga_seg INT NOT NULL,                        -- tempo de basculamento
    tempo_transporte_vazio_seg INT NOT NULL,                -- transporte volta (vazio)
    tempo_manobra_seg INT DEFAULT 0,                        -- manobras extras
    
    -- Calculados (GENERATED ou via trigger)
    tempo_ciclo_total_seg INT,                              -- soma de todos os tempos
    ciclos_hora NUMERIC(5,2),                               -- 3600 / tempo_ciclo_total
    
    -- Velocidades esperadas
    velocidade_media_cheio_km_h NUMERIC(5,1),
    velocidade_media_vazio_km_h NUMERIC(5,1),
    
    -- ─── Vigência ───
    dt_inicio_vigencia TIMESTAMP NOT NULL,                  -- quando esse planejamento começa a valer
    dt_fim_vigencia TIMESTAMP,                              -- NULL = vigente indefinidamente
    
    -- ─── Metadata ───
    observacao TEXT,
    id_usuario_responsavel BIGINT REFERENCES usuario(id_usuario),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraint: não pode ter duas apropriações ativas para mesma combinação no mesmo período
    -- (origem + destino + material + período sem overlap)
    EXCLUDE USING gist (
        id_tenant WITH =,
        id_area_origem WITH =,
        id_area_destino WITH =,
        COALESCE(id_material, 0) WITH =,
        tsrange(dt_inicio_vigencia, COALESCE(dt_fim_vigencia, 'infinity')) WITH &&
    )
);

-- Índices
CREATE INDEX idx_apropr_tenant_vigencia ON apropriacao_rota(id_tenant, dt_inicio_vigencia DESC);
CREATE INDEX idx_apropr_origem_destino ON apropriacao_rota(id_area_origem, id_area_destino);
CREATE INDEX idx_apropr_cc ON apropriacao_rota(id_centro_custo);

-- ═══════════════════════════════════════════════════════════════
-- APROPRIAÇÃO DE ROTA — POR MODELO (opcional, refinamento)
-- Se o tempo de ciclo varia significativamente por modelo de caminhão
-- ═══════════════════════════════════════════════════════════════
apropriacao_rota_modelo (
    id_apropriacao_rota_modelo BIGSERIAL PRIMARY KEY,
    id_apropriacao_rota BIGINT NOT NULL REFERENCES apropriacao_rota(id_apropriacao_rota),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    
    -- Override dos tempos da apropriação principal (para este modelo específico)
    tempo_transporte_cheio_seg INT,
    tempo_transporte_vazio_seg INT,
    velocidade_media_cheio_km_h NUMERIC(5,1),
    velocidade_media_vazio_km_h NUMERIC(5,1),
    ciclos_hora NUMERIC(5,2),               -- override calculado
    
    UNIQUE(id_apropriacao_rota, id_modelo_equipamento)
);
```

### Cálculos

```
Tempo Ciclo Total = FC + CG + TC + FD + DC + TV + Manobra
                  = 180 + 120 + 420 + 60 + 90 + 360 + 30
                  = 1260 seg (21 min)

Ciclos/Hora = 3600 / 1260 = 2.86 ciclos/h

Produção esperada/hora (por caminhão) = ciclos_hora × carga_media_ton
                                       = 2.86 × 90t = 257 ton/h

Frota necessária (para meta) = meta_ton_hora / producao_por_caminhao
                              = 1000 / 257 = 3.9 → 4 caminhões
```

### Uso no sistema

| Quem consome | Como usa |
|---|---|
| **Dashboard KPI** | Compara tempo_ciclo_real vs. tempo_ciclo_planejado (delta %) |
| **Dispatch** | Usa ciclos_hora para calcular quantos caminhões alocar por frente |
| **Relatório Produção** | Produção real vs. produção esperada (ciclos_hora × carga × horas trabalhadas) |
| **Orçamento** | Centro de custo × distância × custo por tonelada-km |
| **Alerta de desvio** | Se tempo real > 120% do planejado → alerta ao supervisor |

### API Endpoints

```
GET    /api/centro-custo                          -- listar (hierárquico)
POST   /api/centro-custo                          -- criar
PUT    /api/centro-custo/:id                      -- editar
GET    /api/centro-custo/:id/arvore               -- árvore completa

GET    /api/apropriacao-rota                      -- listar (filtros: origem, destino, material, vigente)
POST   /api/apropriacao-rota                      -- criar nova apropriação
PUT    /api/apropriacao-rota/:id                  -- editar
GET    /api/apropriacao-rota/:id                  -- detalhe
DELETE /api/apropriacao-rota/:id                  -- desativar (soft)

GET    /api/apropriacao-rota/vigente              -- todas vigentes no momento
GET    /api/apropriacao-rota/matriz               -- matriz origem×destino com KPIs planejados

POST   /api/apropriacao-rota/:id/modelos          -- cadastrar override por modelo
GET    /api/apropriacao-rota/:id/comparativo      -- planejado vs. realizado (ciclos do período)
```

---

## 2. Fechamento de Período

### Conceito

O **Fechamento de Período** é o mecanismo que permite "travar" os dados de produção, atividades e operação de um período (dia, semana, mês), impedindo edições posteriores sem autorização explícita.

**Problemas que resolve:**
- Operador edita retroativamente uma atividade de 3 dias atrás → dados de KPI mudam sem controle
- Supervisor quer "bater" a produção do turno → precisa saber que ninguém vai alterar depois
- Auditoria: quem aprovou os números de maio? Quando?
- Contabilidade: precisa de dados "congelados" para custeio mensal

### Modelagem

```sql
-- ═══════════════════════════════════════════════════════════════
-- TIPO DE FECHAMENTO (quais dados são controlados)
-- ═══════════════════════════════════════════════════════════════
tipo_fechamento (
    id_tipo_fechamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    codigo VARCHAR(50) NOT NULL,            -- 'PRODUCAO', 'ATIVIDADE', 'MANUTENCAO', 'ABASTECIMENTO'
    nome VARCHAR(100) NOT NULL,             -- 'Produção (Ciclos)', 'Atividades (Log)', 'Manutenção (OS)'
    descricao TEXT,
    
    -- Quais tabelas são afetadas pelo lock
    tabelas_afetadas JSONB NOT NULL,        -- ["ciclo_operacional","ciclo_etapa","ciclo_parada"]
    
    -- Regras
    granularidade VARCHAR(20) NOT NULL,     -- 'TURNO', 'DIA', 'SEMANA', 'MES'
    permite_reabertura BOOLEAN DEFAULT true,
    max_reaberturas INT DEFAULT 3,          -- máximo de vezes que pode reabrir (0 = ilimitado)
    prazo_fechamento_dias INT DEFAULT 3,    -- deve fechar até X dias após o período
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, codigo)
);

-- ═══════════════════════════════════════════════════════════════
-- PERÍODO DE FECHAMENTO (instância: um mês, um dia, um turno)
-- ═══════════════════════════════════════════════════════════════
fechamento_periodo (
    id_fechamento_periodo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_tipo_fechamento BIGINT NOT NULL REFERENCES tipo_fechamento(id_tipo_fechamento),
    
    -- ─── Período ───
    dt_inicio_periodo TIMESTAMP NOT NULL,   -- início do período (ex: 2026-05-01 00:00:00)
    dt_fim_periodo TIMESTAMP NOT NULL,      -- fim do período (ex: 2026-05-31 23:59:59)
    referencia VARCHAR(50),                 -- label legível: 'Mai/2026', '01/05/2026 Turno A'
    
    -- ─── Status ───
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    -- ABERTO      → dados podem ser editados normalmente
    -- FECHADO     → dados travados, não permite edição
    -- REABERTO    → foi fechado mas reaberto (com justificativa)
    
    -- ─── Quem/Quando fechou ───
    id_usuario_fechamento BIGINT REFERENCES usuario(id_usuario),
    dt_fechamento TIMESTAMP,                -- quando foi fechado
    observacao_fechamento TEXT,              -- motivo/comentário do fechamento
    
    -- ─── Contadores no momento do fechamento (snapshot) ───
    snapshot_dados JSONB,                   -- resumo no momento do lock
    -- Ex: {"ciclos_total": 847, "producao_ton": 42350, "tempo_operacao_h": 456.2}
    
    -- ─── Metadata ───
    total_reaberturas INT DEFAULT 0,        -- contador de quantas vezes reabriu
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_tenant, id_tipo_fechamento, dt_inicio_periodo)
);

CREATE INDEX idx_fech_tenant_status ON fechamento_periodo(id_tenant, status);
CREATE INDEX idx_fech_periodo ON fechamento_periodo(dt_inicio_periodo, dt_fim_periodo);

-- ═══════════════════════════════════════════════════════════════
-- HISTÓRICO DE AÇÕES NO FECHAMENTO (auditoria completa)
-- ═══════════════════════════════════════════════════════════════
fechamento_historico (
    id_fechamento_historico BIGSERIAL PRIMARY KEY,
    id_fechamento_periodo BIGINT NOT NULL REFERENCES fechamento_periodo(id_fechamento_periodo),
    
    acao VARCHAR(20) NOT NULL,              -- 'FECHAMENTO', 'REABERTURA', 'REFECHAMENTO'
    
    -- Quem
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    nome_usuario VARCHAR(255),              -- snapshot do nome (para histórico)
    
    -- Quando
    dt_acao TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Contexto
    justificativa TEXT,                     -- obrigatória para REABERTURA
    ip_origem VARCHAR(45),                  -- IP de onde fez a ação
    
    -- Snapshot no momento da ação
    snapshot_dados JSONB                    -- estado dos dados naquele momento
);

CREATE INDEX idx_fech_hist_periodo ON fechamento_historico(id_fechamento_periodo, dt_acao DESC);

-- ═══════════════════════════════════════════════════════════════
-- EDIÇÕES EM PERÍODO REABERTO (log do que foi alterado)
-- ═══════════════════════════════════════════════════════════════
fechamento_edicao (
    id_fechamento_edicao BIGSERIAL PRIMARY KEY,
    id_fechamento_periodo BIGINT NOT NULL REFERENCES fechamento_periodo(id_fechamento_periodo),
    
    -- O que foi editado
    tabela VARCHAR(100) NOT NULL,           -- 'ciclo_operacional', 'equipamento_atividade_historico'
    id_registro BIGINT NOT NULL,            -- PK do registro editado
    campo VARCHAR(100),                     -- campo que mudou (NULL = registro inteiro)
    valor_antes TEXT,                       -- valor anterior
    valor_depois TEXT,                      -- valor novo
    
    -- Quem/Quando
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    dt_edicao TIMESTAMP NOT NULL DEFAULT NOW(),
    justificativa TEXT                      -- por que editou
);

CREATE INDEX idx_fech_edit_periodo ON fechamento_edicao(id_fechamento_periodo);
```

### Enforcement: Como travar as edições?

O lock é enforced no **backend (middleware)** e opcionalmente via **RLS policy**:

```sql
-- Policy RLS: impede UPDATE/DELETE em ciclo_operacional quando período fechado
CREATE POLICY ciclo_periodo_fechado ON ciclo_operacional
    FOR UPDATE
    USING (
        NOT EXISTS (
            SELECT 1 FROM fechamento_periodo fp
            JOIN tipo_fechamento tf ON tf.id_tipo_fechamento = fp.id_tipo_fechamento
            WHERE fp.id_tenant = ciclo_operacional.id_tenant
              AND tf.codigo = 'PRODUCAO'
              AND fp.status = 'FECHADO'
              AND ciclo_operacional.dt_inicio_ciclo >= fp.dt_inicio_periodo
              AND ciclo_operacional.dt_inicio_ciclo < fp.dt_fim_periodo
        )
    );

-- Mesmo para equipamento_atividade_historico
CREATE POLICY atividade_periodo_fechado ON equipamento_atividade_historico
    FOR UPDATE
    USING (
        NOT EXISTS (
            SELECT 1 FROM fechamento_periodo fp
            JOIN tipo_fechamento tf ON tf.id_tipo_fechamento = fp.id_tipo_fechamento
            WHERE fp.id_tenant = equipamento_atividade_historico.id_tenant
              AND tf.codigo = 'ATIVIDADE'
              AND fp.status = 'FECHADO'
              AND equipamento_atividade_historico.dt_inicio >= fp.dt_inicio_periodo
              AND equipamento_atividade_historico.dt_inicio < fp.dt_fim_periodo
        )
    );
```

**No middleware (Node.js):**

```typescript
// Middleware que verifica antes de qualquer UPDATE em dados operacionais
async function checkPeriodoFechado(tenantId: number, tabela: string, dtReferencia: Date) {
  const fechado = await db.query(`
    SELECT fp.id_fechamento_periodo, fp.referencia, fp.status
    FROM fechamento_periodo fp
    JOIN tipo_fechamento tf ON tf.id_tipo_fechamento = fp.id_tipo_fechamento
    WHERE fp.id_tenant = $1
      AND $2 = ANY(SELECT jsonb_array_elements_text(tf.tabelas_afetadas))
      AND fp.status = 'FECHADO'
      AND $3 >= fp.dt_inicio_periodo
      AND $3 < fp.dt_fim_periodo
  `, [tenantId, tabela, dtReferencia]);
  
  if (fechado.rows.length > 0) {
    throw new ForbiddenError(
      `Período "${fechado.rows[0].referencia}" está FECHADO. Solicite reabertura ao responsável.`
    );
  }
}
```

### Fluxo

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE FECHAMENTO                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. PERÍODO ABERTO (padrão)                                         │
│     └── Dados podem ser editados normalmente                         │
│     └── Status: 🟢 ABERTO                                           │
│                                                                      │
│  2. SUPERVISOR/ADMIN FECHA O PERÍODO                                │
│     └── Valida dados (sem inconsistências graves)                    │
│     └── Gera snapshot (totaliza ciclos, produção, horas)             │
│     └── Registra em fechamento_historico (quem, quando)              │
│     └── Status: 🔴 FECHADO                                          │
│     └── A partir daqui: tentativas de UPDATE → erro 403              │
│                                                                      │
│  3. NECESSIDADE DE CORREÇÃO                                         │
│     └── Usuário tenta editar → recebe "Período Fechado"              │
│     └── Solicita reabertura (com justificativa)                      │
│                                                                      │
│  4. ADMIN REABRE O PERÍODO                                          │
│     └── Exige justificativa obrigatória                              │
│     └── Registra em fechamento_historico                             │
│     └── Status: 🟡 REABERTO                                         │
│     └── contador total_reaberturas++                                 │
│     └── Dados podem ser editados novamente                           │
│     └── Toda edição é logada em fechamento_edicao                    │
│                                                                      │
│  5. REFECHAMENTO                                                    │
│     └── Após correções, admin fecha novamente                        │
│     └── Novo snapshot + registro no histórico                        │
│     └── Status: 🔴 FECHADO                                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### API Endpoints

```
# ── Tipo de Fechamento (config) ──
GET    /api/tipo-fechamento                       -- listar tipos configurados
POST   /api/tipo-fechamento                       -- criar tipo
PUT    /api/tipo-fechamento/:id                   -- editar

# ── Períodos ──
GET    /api/fechamento                            -- listar períodos (filtro: tipo, status, data)
GET    /api/fechamento/calendario                 -- visão calendário (status por mês/dia)
GET    /api/fechamento/:id                        -- detalhe com histórico
POST   /api/fechamento/gerar                      -- gerar períodos do mês (bulk create com status ABERTO)

# ── Ações ──
POST   /api/fechamento/:id/fechar                 -- fechar período (requer permissão)
POST   /api/fechamento/:id/reabrir                -- reabrir (requer justificativa + permissão superior)
POST   /api/fechamento/:id/refechar               -- fechar novamente após reabertura

# ── Auditoria ──
GET    /api/fechamento/:id/historico              -- quem fechou, reabriu, quando
GET    /api/fechamento/:id/edicoes                -- todas as edições feitas durante reabertura
GET    /api/fechamento/resumo-mes/:mes            -- resumo: quantos abertos/fechados no mês

# ── Status check (usado pelo middleware antes de editar) ──
GET    /api/fechamento/check                      -- query: tabela + dt_referencia → retorna se locked
```

### Tela: Controle de Período

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔒 Fechamento de Período                         [ Produção ▾ ] Jun/2026│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│ │   30    │ │    24   │ │     4   │ │     2   │                       │
│ │  Total  │ │ Fechados│ │ Abertos │ │Reabertos│                       │
│ │Períodos │ │   🔴    │ │   🟢    │ │   🟡    │                       │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                       │
│                                                                          │
│ ┌─── Calendário ────────────────────────────────────────────────────┐   │
│ │                           JUNHO 2026                               │   │
│ │  Seg    Ter    Qua    Qui    Sex    Sáb    Dom                    │   │
│ │  01🔴  02🔴  03🔴  04🔴  05🔴  06🔴  07🔴                   │   │
│ │  08🔴  09🟢  10🟢  11🟢  12     13     14                    │   │
│ │  ...                                                               │   │
│ │                                                                    │   │
│ │  Legenda: 🔴 Fechado  🟢 Aberto  🟡 Reaberto  ⬜ Futuro          │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── Detalhes do Dia Selecionado ───────────────────────────────────┐   │
│ │ 📅 01/06/2026 — Produção                    Status: 🔴 FECHADO    │   │
│ │                                                                    │   │
│ │ Snapshot: 147 ciclos │ 12.847 ton │ 456.2h operação               │   │
│ │                                                                    │   │
│ │ Fechado por: Kleyton Miranda │ 02/06/2026 08:30                   │   │
│ │ Obs: "Dados conferidos com despacho"                               │   │
│ │                                                                    │   │
│ │ Histórico:                                                         │   │
│ │  • 02/06 08:30 — FECHAMENTO por Kleyton Miranda                   │   │
│ │  • 03/06 14:00 — REABERTURA por João Silva                        │   │
│ │    └ Justificativa: "Ciclo #4521 com origem incorreta"            │   │
│ │  • 03/06 14:45 — REFECHAMENTO por Kleyton Miranda                 │   │
│ │                                                                    │   │
│ │ Edições durante reabertura:                                        │   │
│ │  • ciclo_operacional #4521 — id_area_origem: 3→5 (João, 14:22)   │   │
│ │                                                                    │   │
│ │ [🔓 Reabrir]  [📥 Exportar]  [📊 Ver dados]                      │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── Ações em Massa ────────────────────────────────────────────────┐   │
│ │ Selecione: ☐ 09/06  ☐ 10/06  ☐ 11/06                            │   │
│ │ [🔴 Fechar Selecionados]  [🔓 Reabrir Selecionados]              │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Permissões

| Ação | Admin | Supervisor | Planejador | Operador |
|------|:---:|:---:|:---:|:---:|
| Ver status dos períodos | ✅ | ✅ | ✅ | ❌ |
| Fechar período | ✅ | ✅ | ❌ | ❌ |
| Reabrir período | ✅ | ❌ | ❌ | ❌ |
| Editar dados em período reaberto | ✅ | ✅ | ✅ | ❌ |
| Ver histórico/auditoria | ✅ | ✅ | ✅ | ❌ |
| Configurar tipos de fechamento | ✅ | ❌ | ❌ | ❌ |

---

## Tipos de Fechamento sugeridos

| Código | Nome | Granularidade | Tabelas Afetadas |
|--------|------|---------------|------------------|
| PRODUCAO | Produção (Ciclos) | DIA | ciclo_operacional, ciclo_etapa, ciclo_parada |
| ATIVIDADE | Log de Atividades | DIA | equipamento_atividade_historico, atividade_alerta |
| MANUTENCAO | Ordens de Serviço | MES | ordem_servico, ordem_servico_item, ordem_servico_peca |
| ABASTECIMENTO | Abastecimentos | MES | abastecimento |
| HORIMETRO | Leituras Horímetro | MES | horimetro_leitura |

---

## Tabelas adicionadas neste documento

| # | Tabela | Domínio |
|---|--------|---------|
| 1 | `centro_custo` | Planejamento |
| 2 | `apropriacao_rota` | Planejamento |
| 3 | `apropriacao_rota_modelo` | Planejamento |
| 4 | `tipo_fechamento` | Controle |
| 5 | `fechamento_periodo` | Controle |
| 6 | `fechamento_historico` | Controle |
| 7 | `fechamento_edicao` | Controle |

**Total acumulado: ~92 tabelas**

---

## Funcionalidades (MODULES.md)

| # | Módulo | Código | Descrição |
|---|--------|--------|-----------|
| 23 | Planejamento | PLANEJAMENTO_APROPRIACAO | Config de centro de custo + parâmetros por rota |
| 24 | Controle | CONTROLE_FECHAMENTO | Fechamento/reabertura de períodos com auditoria |
