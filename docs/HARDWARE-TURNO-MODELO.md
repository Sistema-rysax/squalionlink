# 🔧 Hardware, Modelo Enriquecido & Regime de Turno

## Visão Geral

Este documento detalha três adições críticas ao sistema:

1. **Hardware** — Dispositivos vinculados ao equipamento (telemetria, câmeras, tablets, sensores)
2. **Modelo Enriquecido** — Campos operacionais (volume, passes, compatibilidade) + vínculos M:N (atividades, checklists, fatores)
3. **Regime de Turno** — Calendário que garante cobertura 24h sem gaps/sobreposições

---

## 1. Hardware

> ⚠️ **MOVIDO**: A gestão completa de hardware (patrimonial, movimentação entre clientes, manutenção de devices) está em **HARDWARE-GESTAO.md**. Este capítulo mantém apenas o resumo de integração.

### Conceito (ver HARDWARE-GESTAO.md para detalhes)

Hardware é ativo da PLATAFORMA, não do tenant. A plataforma distribui dispositivos entre clientes e rastreia todo o ciclo de vida. Cada equipamento pode ter N dispositivos instalados simultaneamente.

**Setup típico em mineração:**

| Tipo | Exemplos | Função |
|------|----------|--------|
| 📡 Telemetria/GPS | Hexagon, Wenco, MineStar, Astra | Posição, velocidade, ignição, horímetro |
| 📱 Tablet | Samsung Tab Active, Getac | Interface operador, checklist, dispatch |
| 📷 Câmera | Caterpillar DSS, Seeing Machines, Cipia | Segurança, detecção fadiga |
| ⚖️ Sensor de Carga | VIMS, LoadRite, Payload Meter | Peso da caçamba (payload) |
| 🔘 TPMS | Rimex, Kal Tire, Michelin MEMS | Pressão e temperatura pneus |
| 📻 Rádio | Motorola, Hytera | Comunicação voz |
| 🚨 Radar Proximidade | Hexagon CAS, RCT, Strata | Anti-colisão |
| 😴 Sensor Fadiga | Seeing Machines Guardian, Caterpillar DSS | Alerta sonolência/distração |
| 📊 CAN Bus | Interface OBD/CAN | Dados motor, transmissão, freios |

### Modelagem

```sql
-- Tipos de hardware (lookup configurável pelo tenant)
tipo_hardware (
    id_tipo_hardware BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,             -- 'GPS/Telemetria', 'Tablet', 'Câmera Fadiga'
    descricao TEXT,
    icone VARCHAR(50),
    requer_comunicacao BOOLEAN DEFAULT true, -- se TRUE, gera alerta quando offline
    tempo_offline_alerta_min INT DEFAULT 30, -- minutos sem comunicar = alerta
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Dispositivo de hardware (instância física)
hardware (
    id_hardware BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_tipo_hardware BIGINT NOT NULL REFERENCES tipo_hardware(id_tipo_hardware),
    id_equipamento BIGINT REFERENCES equipamento(id_equipamento), -- NULLABLE: pode estar em estoque
    
    -- Identificação
    marca VARCHAR(100),                     -- 'Hexagon', 'Samsung', 'Seeing Machines'
    modelo VARCHAR(100),                    -- 'SmartMine', 'Tab Active 5', 'Guardian Gen3'
    numero_serie VARCHAR(100),
    patrimonio VARCHAR(50),                 -- código patrimonial interno
    
    -- Conectividade
    imei VARCHAR(20),
    iccid VARCHAR(30),                      -- SIM card
    numero_chip VARCHAR(20),                -- número telefônico do chip
    ip_fixo VARCHAR(45),
    mac_address VARCHAR(17),
    firmware_versao VARCHAR(50),
    
    -- Estado
    status VARCHAR(20) NOT NULL DEFAULT 'ESTOQUE',
    -- ESTOQUE, INSTALADO, MANUTENCAO, DESCARTADO
    
    dt_instalacao TIMESTAMP,                -- quando foi instalado no equipamento atual
    dt_ultima_comunicacao TIMESTAMP,        -- heartbeat — NULL = nunca comunicou
    dt_validade_garantia TIMESTAMP,
    
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP                   -- soft delete
);

-- Índices
CREATE INDEX idx_hardware_tenant_equip ON hardware(id_tenant, id_equipamento) WHERE id_equipamento IS NOT NULL;
CREATE INDEX idx_hardware_serie ON hardware(numero_serie) WHERE numero_serie IS NOT NULL;
CREATE UNIQUE INDEX idx_hardware_imei ON hardware(imei) WHERE imei IS NOT NULL;

-- Histórico de vinculação (auditoria de trocas)
hardware_historico (
    id_hardware_historico BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_hardware BIGINT NOT NULL REFERENCES hardware(id_hardware),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    
    dt_vinculacao TIMESTAMP NOT NULL,       -- quando instalou
    dt_desvinculacao TIMESTAMP,             -- quando removeu (NULL = ainda instalado)
    motivo_desvinculacao VARCHAR(100),       -- 'Troca preventiva', 'Defeito', 'Upgrade'
    id_usuario_acao BIGINT REFERENCES usuario(id_usuario),
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hw_hist_equip ON hardware_historico(id_equipamento, dt_vinculacao DESC);
```

### Regras de Negócio

1. **Unicidade por tipo**: Um equipamento pode ter N hardwares, mas tipicamente 1 por tipo (ex: 1 GPS, 1 tablet). Não forçamos UNIQUE porque pode ter 2 câmeras (frente + traseira).
2. **Troca**: Ao desvincular, o sistema cria registro em `hardware_historico`, seta `dt_desvinculacao`, e limpa `id_equipamento` no hardware.
3. **Alerta offline**: Se `tipo_hardware.requer_comunicacao = true` e `dt_ultima_comunicacao` > X minutos, gera alerta.
4. **Status automático**: Ao vincular → `INSTALADO`. Ao desvincular → `ESTOQUE`. Se for pra OS → `MANUTENCAO`.

### Fluxo

```
1. Admin cadastra tipos de hardware (GPS, Tablet, Câmera...)
2. Admin cadastra hardware com serial, IMEI, etc. (status: ESTOQUE)
3. Técnico vincula hardware ao equipamento:
   - hardware.id_equipamento = CAT-01
   - hardware.status = INSTALADO
   - hardware.dt_instalacao = NOW()
   - INSERT hardware_historico (dt_vinculacao = NOW())
4. Hardware começa a comunicar → atualiza dt_ultima_comunicacao
5. Se parar de comunicar > tempo_offline_alerta_min → alerta
6. Ao trocar: desvincula antigo (motivo) + vincula novo
```

---

## 2. Modelo de Equipamento — Enriquecimento

### Contexto

O `modelo_equipamento` atual tem campos básicos. Precisamos adicionar:
- Campos operacionais específicos por tipo (transporte vs. carga)
- Vínculos M:N com atividades, checklists e materiais
- Compatibilidade entre modelos (escavadeira ↔ caminhão)

### Campos adicionais no modelo_equipamento

```sql
ALTER TABLE modelo_equipamento ADD COLUMN IF NOT EXISTS (
    -- === TRANSPORTE (caminhões) ===
    volume_cacamba_m3 NUMERIC(8,2),         -- capacidade geométrica (60m³, 92m³)
    velocidade_maxima_cheio NUMERIC(5,1),   -- km/h design carregado
    velocidade_maxima_vazio NUMERIC(5,1),   -- km/h design vazio
    tempo_basculamento_seg INT,             -- tempo médio de descarga
    
    -- === CARGA (escavadeiras, pás) ===
    volume_pa_m3 NUMERIC(8,2),             -- capacidade do bucket (34m³, 40m³)
    tempo_ciclo_carga_seg INT,             -- tempo de 1 passada (28s, 32s)
    alcance_maximo_m NUMERIC(6,2),         -- raio de alcance
    profundidade_escavacao_m NUMERIC(6,2), -- profundidade máxima
    altura_descarga_m NUMERIC(6,2),        -- altura de dump
    
    -- === GERAL ===
    velocidade_maxima_km_h NUMERIC(5,1),   -- velocidade design geral
    raio_giro_m NUMERIC(6,2),             -- raio mínimo de giro
    numero_eixos INT,                      -- eixos (caminhão)
    tipo_tracao VARCHAR(30),              -- '4x4', '6x6', 'Esteira'
    fator_enchimento_padrao NUMERIC(4,3)  -- fator default (0.85-0.95)
);
```

### Tabelas de vinculação M:N

```sql
-- ATIVIDADES por modelo (já existe como atividade_modelo no ATIVIDADES.md)
-- ✅ Não duplicar — usar atividade_modelo existente
-- Campos: id_atividade_modelo, id_tenant, id_atividade, id_modelo_equipamento

-- CHECKLIST por modelo (já existe como checklist_item_modelo no DATABASE.md)
-- ⚠️ RENOMEAR para checklist_grupo_modelo (faz mais sentido vincular GRUPO, não item)
checklist_grupo_modelo (
    id_checklist_grupo_modelo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_checklist_grupo BIGINT NOT NULL REFERENCES checklist_grupo(id_checklist_grupo),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    obrigatorio BOOLEAN NOT NULL DEFAULT false,  -- checklist obrigatório para este modelo?
    ativo BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(id_tenant, id_checklist_grupo, id_modelo_equipamento)
);

-- FATOR DE ENCHIMENTO por material × modelo
modelo_fator_enchimento (
    id_modelo_fator_enchimento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_material BIGINT NOT NULL REFERENCES material(id_material),
    fator_enchimento NUMERIC(4,3) NOT NULL,      -- 0.85, 0.92, 0.95
    volume_efetivo_m3 NUMERIC(8,2),              -- GENERATED: volume_cacamba × fator
    peso_efetivo_ton NUMERIC(10,2),              -- GENERATED: volume_efetivo × densidade_material
    observacao TEXT,
    UNIQUE(id_tenant, id_modelo_equipamento, id_material)
);

-- COMPATIBILIDADE CARGA ↔ TRANSPORTE
modelo_compatibilidade (
    id_modelo_compatibilidade BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_modelo_carga BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_modelo_transporte BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    passes_estimado INT NOT NULL,                -- quantas passadas para encher
    tempo_carga_estimado_seg INT,                -- tempo total estimado de carga
    match_ideal BOOLEAN DEFAULT false,           -- combinação otimizada?
    observacao TEXT,
    UNIQUE(id_tenant, id_modelo_carga, id_modelo_transporte)
);
```

### Raciocínio dos Passes

```
passes = CEIL(volume_cacamba_caminhao / (volume_pa_escavadeira × fator_enchimento))

Exemplo:
- 777G: volume_cacamba = 60 m³
- Liebherr 6060: volume_pa = 34 m³, fator = 0.92
- volume_efetivo_pa = 34 × 0.92 = 31.28 m³
- passes = CEIL(60 / 31.28) = 2 passadas

Tempo de carga = passes × tempo_ciclo_carga_seg
             = 2 × 28s = 56 segundos
```

### Verificação de Duplicidades

| Vínculo | Já existe? | Ação |
|---------|-----------|------|
| Atividade ↔ Modelo | ✅ `atividade_modelo` (ATIVIDADES.md) | Manter como está |
| Checklist ↔ Modelo | ⚠️ `checklist_item_modelo` vincula item, não grupo | Criar `checklist_grupo_modelo` (vincula grupo inteiro) |
| Material ↔ Modelo (fator) | ❌ Não existe | Criar `modelo_fator_enchimento` |
| Modelo ↔ Modelo (compat.) | ❌ Não existe | Criar `modelo_compatibilidade` |
| Combustível ↔ Modelo | ✅ `modelo_combustivel` (DATABASE.md) | Manter como está |

---

## 3. Regime de Turno

### Conceito

O **Regime de Turno** é um calendário que define a escala de trabalho da operação. Ele garante:
- **Cobertura total 24h** — nenhum minuto sem turno definido
- **Sem sobreposição** — nunca dois turnos no mesmo horário
- **Classificação automática** — qualquer timestamp cai em exatamente 1 turno
- **Hora fora de frota** — slots sem turno ativo = equipamento não deveria operar

### Por que é diferente da tabela `turno` atual?

A tabela `turno` define **templates** estáticos (Turno A = 06-18h). Mas:
- E se na segunda-feira for 06-14h / 14-22h / 22-06h (3 turnos)?
- E se no feriado for 06-18h / 18-06h (2 turnos)?
- E se em dezembro mudar o regime?

Precisamos de um **calendário real** com datas específicas:

```
turno (template)         →  "Turno A: 06h-18h"
regime_turno             →  "Regime 2x12h Mineração"
regime_turno_calendario  →  "Dia 01/05/2026: Turno A de 06h às 18h, Turno B de 18h às 06h"
```

### Modelagem

```sql
-- Regime de Turno (template de escala — ex: "12x12", "8x8x8", "12x12 +admin")
regime_turno (
    id_regime_turno BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,             -- '2 turnos 12h', '3 turnos 8h', 'Administrativo'
    descricao TEXT,
    
    -- Padrão cíclico (para geração automática)
    padrao_tipo VARCHAR(20) NOT NULL,       -- 'FIXO', 'CICLICO', 'CUSTOMIZADO'
    -- FIXO: mesmo padrão todos os dias
    -- CICLICO: repete a cada N dias (ex: 5x2, 4x1)
    -- CUSTOMIZADO: definido dia a dia
    
    padrao_ciclo_dias INT,                  -- para CICLICO: tamanho do ciclo (7 = semanal)
    padrao_definicao JSONB,                 -- definição do padrão (ver exemplos abaixo)
    
    dt_inicio_vigencia TIMESTAMP NOT NULL,  -- quando esse regime começa a valer
    dt_fim_vigencia TIMESTAMP,              -- NULL = vigente indefinidamente
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Calendário realizado (cada slot = 1 turno em 1 dia específico)
regime_turno_calendario (
    id_regime_turno_calendario BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_regime_turno BIGINT NOT NULL REFERENCES regime_turno(id_regime_turno),
    id_turno BIGINT NOT NULL REFERENCES turno(id_turno),
    
    dt_inicio TIMESTAMP NOT NULL,           -- '2026-05-01 06:00:00' (UTC)
    dt_fim TIMESTAMP NOT NULL,              -- '2026-05-01 18:00:00' (UTC)
    
    -- Validações
    -- CHECK(dt_fim > dt_inicio)
    -- Duração = dt_fim - dt_inicio (em horas)
    
    tipo VARCHAR(20) DEFAULT 'NORMAL',      -- 'NORMAL', 'EXTRA', 'CANCELADO'
    observacao TEXT,
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraint: não pode haver sobreposição dentro do mesmo regime
    EXCLUDE USING gist (
        id_regime_turno WITH =,
        tsrange(dt_inicio, dt_fim) WITH &&
    )
);

-- Índices
CREATE INDEX idx_rtc_regime_data ON regime_turno_calendario(id_regime_turno, dt_inicio);
CREATE INDEX idx_rtc_tenant_periodo ON regime_turno_calendario(id_tenant, dt_inicio, dt_fim);

-- Vinculação: quais equipamentos seguem qual regime
equipamento_regime_turno (
    id_equipamento_regime_turno BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_regime_turno BIGINT NOT NULL REFERENCES regime_turno(id_regime_turno),
    dt_inicio TIMESTAMP NOT NULL,           -- quando esse equip começou nesse regime
    dt_fim TIMESTAMP,                       -- NULL = vigente
    UNIQUE(id_tenant, id_equipamento, id_regime_turno, dt_inicio)
);
```

### Padrão (padrao_definicao JSONB)

Exemplo **FIXO** (2 turnos 12h, todos os dias iguais):
```json
{
  "slots": [
    { "id_turno": 1, "hora_inicio": "06:00", "hora_fim": "18:00" },
    { "id_turno": 2, "hora_inicio": "18:00", "hora_fim": "06:00" }
  ]
}
```

Exemplo **FIXO** (3 turnos 8h):
```json
{
  "slots": [
    { "id_turno": 1, "hora_inicio": "06:00", "hora_fim": "14:00" },
    { "id_turno": 2, "hora_inicio": "14:00", "hora_fim": "22:00" },
    { "id_turno": 3, "hora_inicio": "22:00", "hora_fim": "06:00" }
  ]
}
```

Exemplo **CÍCLICO** (5 dias trabalho + 2 folga):
```json
{
  "ciclo_dias": 7,
  "dias": [
    { "dia": 1, "slots": [{"id_turno":1,"hora_inicio":"06:00","hora_fim":"18:00"},{"id_turno":2,"hora_inicio":"18:00","hora_fim":"06:00"}] },
    { "dia": 2, "slots": [{"id_turno":1,"hora_inicio":"06:00","hora_fim":"18:00"},{"id_turno":2,"hora_inicio":"18:00","hora_fim":"06:00"}] },
    { "dia": 3, "slots": [{"id_turno":1,"hora_inicio":"06:00","hora_fim":"18:00"},{"id_turno":2,"hora_inicio":"18:00","hora_fim":"06:00"}] },
    { "dia": 4, "slots": [{"id_turno":1,"hora_inicio":"06:00","hora_fim":"18:00"},{"id_turno":2,"hora_inicio":"18:00","hora_fim":"06:00"}] },
    { "dia": 5, "slots": [{"id_turno":1,"hora_inicio":"06:00","hora_fim":"18:00"},{"id_turno":2,"hora_inicio":"18:00","hora_fim":"06:00"}] },
    { "dia": 6, "slots": [] },
    { "dia": 7, "slots": [] }
  ]
}
```
> Nos dias 6 e 7 (folga), os slots ficam vazios → sistema contabiliza como **Hora Fora de Frota (HFF)**.

### Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **Cobertura 24h** | A soma dos slots dentro de um dia DEVE = 24h (quando operando). Validação no backend. |
| **Sem sobreposição** | EXCLUDE constraint no PostgreSQL impede 2 slots no mesmo range temporal. |
| **Gaps = HFF** | Se um dia tem 16h de turno, as 8h restantes = Hora Fora de Frota. Sistema calcula DF% excluindo HFF. |
| **Geração automática** | Para padrão FIXO/CICLICO, o sistema gera calendário X meses à frente automaticamente. |
| **Edição dia-a-dia** | Para CUSTOMIZADO, admin preenche slot por slot. UI valida que não há gap ou overlap. |
| **Vínculo por equipamento** | Cada equipamento segue um regime. Equipamentos diferentes podem ter regimes diferentes. |
| **Herança por grupo** | Se não definido individualmente, herda do grupo de equipamento. |

### Cálculo de Indicadores com Regime

```
Horas Calendário (HC) = 24h × dias do período
Horas Fora de Frota (HFF) = horas sem turno no calendário
Horas Programadas (HP) = HC - HFF
Horas de Manutenção (HM) = tempo em OS
Horas Disponíveis (HD) = HP - HM
DF% = HD / HP × 100

Exemplo:
- Mês: 30 dias × 24h = 720h (HC)
- Regime 2×12h todos os dias: HP = 720h, HFF = 0h
- Regime 5×2 (segunda a sexta, 12h/dia): HP = 30 × (5/7) × 12 = 257h, HFF = 463h
```

### Fluxo da Tela

```
┌──────────────────────────────────────────────────────────────────────┐
│ REGIME DE TURNO - Configuração                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ 1. Criar Regime (nome, tipo: FIXO/CICLICO/CUSTOM)                   │
│    └── Se FIXO: define slots (hora_inicio/hora_fim por turno)        │
│    └── Se CICLICO: define ciclo + padrão por dia do ciclo            │
│    └── Se CUSTOM: vai direto pro calendário                          │
│                                                                      │
│ 2. Aplicar Padrão → Gerar Calendário                                │
│    └── Seleciona período (ex: Jan-Dez 2026)                          │
│    └── Clica "Gerar" → preenche regime_turno_calendario              │
│    └── Validação: soma dos slots = 24h por dia (ou menos com HFF)    │
│                                                                      │
│ 3. Visualizar Calendário                                            │
│    ┌──────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐    │
│    │ Semana   │ Seg  │ Ter  │ Qua  │ Qui  │ Sex  │ Sáb  │ Dom  │    │
│    ├──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤    │
│    │ 01-07    │ A+B  │ A+B  │ A+B  │ A+B  │ A+B  │ A+B  │ A+B  │    │
│    │ 08-14    │ A+B  │ A+B  │ A+B  │ A+B  │ A+B  │ A+B  │ A+B  │    │
│    └──────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘    │
│    Legenda: 🟦 Turno A (06-18) 🟪 Turno B (18-06) ⬜ HFF           │
│                                                                      │
│ 4. Ajustes Pontuais                                                 │
│    └── Clica no dia/slot → editar ou cancelar                        │
│    └── Inserir turno EXTRA (hora extra)                              │
│    └── Marcar CANCELADO (feriado, paralisação)                       │
│                                                                      │
│ 5. Vincular Equipamentos                                            │
│    └── Seleciona equipamentos/grupos → vincula ao regime             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Validações do Backend

```typescript
// Ao gerar calendário ou salvar slot:
function validarSlot(regimeId: number, dtInicio: Date, dtFim: Date) {
  // 1. dt_fim > dt_inicio
  if (dtFim <= dtInicio) throw new Error('Fim deve ser posterior ao início');
  
  // 2. Duração máxima = 24h
  const horas = (dtFim - dtInicio) / 3600000;
  if (horas > 24) throw new Error('Slot não pode exceder 24h');
  
  // 3. Sem sobreposição (o EXCLUDE constraint já garante, mas validamos antes)
  const conflito = await db.query(
    'SELECT 1 FROM regime_turno_calendario WHERE id_regime_turno = $1 AND tsrange(dt_inicio, dt_fim) && tsrange($2, $3)',
    [regimeId, dtInicio, dtFim]
  );
  if (conflito.rows.length) throw new Error('Sobreposição com slot existente');
}

// Ao "fechar" calendário de um mês:
function validarCobertura(regimeId: number, mes: Date) {
  // Soma total de horas no mês
  const total = await db.query(
    'SELECT SUM(EXTRACT(EPOCH FROM dt_fim - dt_inicio)/3600) as horas FROM regime_turno_calendario WHERE id_regime_turno = $1 AND dt_inicio >= $2 AND dt_inicio < $3',
    [regimeId, inicioMes, fimMes]
  );
  
  const horasCalendario = diasNoMes * 24;
  const horasPreenchidas = total.rows[0].horas;
  const horasForaFrota = horasCalendario - horasPreenchidas;
  
  // Alerta (não erro) se HFF > 0 — pode ser intencional
  if (horasForaFrota > 0) {
    return { valido: true, alerta: `${horasForaFrota}h fora de frota no período` };
  }
  return { valido: true };
}
```

---

## 4. Atualização do Diagrama de Domínios

### Novas tabelas (12 adições)

| Domínio | Tabela | Descrição |
|---------|--------|-----------|
| Frota | `tipo_hardware` | Tipos de dispositivo (GPS, Câmera, Tablet...) |
| Frota | `hardware` | Dispositivo físico com serial, IMEI |
| Frota | `hardware_historico` | Log de vinculações/desvinculações |
| Frota | `checklist_grupo_modelo` | M:N checklist grupo ↔ modelo |
| Frota | `modelo_fator_enchimento` | Fator por material × modelo |
| Frota | `modelo_compatibilidade` | Passes escavadeira ↔ caminhão |
| Operação | `regime_turno` | Template de regime (FIXO/CICLICO/CUSTOM) |
| Operação | `regime_turno_calendario` | Slots realizados por dia |
| Operação | `equipamento_regime_turno` | Vinculação equip → regime |

### Tabelas renomeadas/ajustadas

| Antes | Depois | Motivo |
|-------|--------|--------|
| `checklist_item_modelo` | `checklist_grupo_modelo` | Vincula grupo (não item individual) ao modelo |

### Tabelas que NÃO mudam (já estão corretas)

| Tabela | Motivo |
|--------|--------|
| `atividade_modelo` | Já vincula atividade ↔ modelo corretamente |
| `modelo_combustivel` | Já vincula combustível ↔ modelo |
| `turno` | Permanece como template — referenciado pelo calendário |

---

## 5. Contagem Total Atualizada

| Domínio | Tabelas |
|---------|---------|
| Plataforma | 9 |
| Contratada | 2 |
| Frota | 13 (+6: tipo_hardware, hardware, hardware_historico, checklist_grupo_modelo, modelo_fator_enchimento, modelo_compatibilidade) |
| Checklist | 5 (ajustado: removeu checklist_item_modelo) |
| Área & Geo | 4 |
| Operador | 4 |
| Atividade | 6 |
| Ciclo | 5 |
| Dispatch | 4+ |
| Manutenção | 14 |
| Telemetria & GPS | 4 |
| Almoxarifado | 3 |
| Relatório | 6 |
| Regime de Turno | 3 (regime_turno, regime_turno_calendario, equipamento_regime_turno) |
| Alertas | 1 |
| i18n | 1 |
| Auditoria | 1 |
| **TOTAL** | **~85 tabelas** |

---

## 6. Funcionalidades adicionais ao MODULES.md

| # | Módulo | Código | Descrição |
|---|--------|--------|-----------|
| 19 | Frota | FROTA_HARDWARE | Cadastro e gestão de dispositivos (GPS, tablets, câmeras) |
| 20 | Planejamento | PLANEJAMENTO_REGIME | Regime de turno e calendário operacional |

---

## 7. API Endpoints novos

### Hardware
```
GET    /api/tipo-hardware                     -- listar tipos
POST   /api/tipo-hardware                     -- criar tipo
GET    /api/hardware                           -- listar (filtros: tipo, equipamento, status)
POST   /api/hardware                           -- cadastrar device
PUT    /api/hardware/:id                       -- editar
POST   /api/hardware/:id/vincular              -- vincular a equipamento
POST   /api/hardware/:id/desvincular           -- desvincular (com motivo)
GET    /api/hardware/:id/historico             -- histórico de trocas
GET    /api/equipamento/:id/hardware           -- hardware instalado no equip
```

### Regime de Turno
```
GET    /api/regime-turno                       -- listar regimes
POST   /api/regime-turno                       -- criar regime
PUT    /api/regime-turno/:id                   -- editar
POST   /api/regime-turno/:id/gerar-calendario  -- gerar calendário a partir do padrão
GET    /api/regime-turno/:id/calendario        -- consultar calendário (filtro: mês)
POST   /api/regime-turno/:id/calendario        -- inserir slot manual
PUT    /api/regime-turno/:id/calendario/:slotId -- editar slot
DELETE /api/regime-turno/:id/calendario/:slotId -- cancelar slot
POST   /api/regime-turno/:id/vincular-equipamentos  -- vincular equipamentos
GET    /api/equipamento/:id/regime-turno       -- regime do equipamento
GET    /api/regime-turno/:id/validar/:mes      -- validar cobertura do mês
```

### Modelo (novos)
```
GET    /api/modelo-equipamento/:id/fatores     -- fatores de enchimento por material
POST   /api/modelo-equipamento/:id/fatores     -- cadastrar fator
GET    /api/modelo-equipamento/:id/compatibilidade  -- combinações carga/transporte
POST   /api/modelo-compatibilidade             -- cadastrar compatibilidade
GET    /api/modelo-equipamento/:id/checklists  -- checklists vinculados ao modelo
POST   /api/modelo-equipamento/:id/checklists  -- vincular checklist grupo
```
