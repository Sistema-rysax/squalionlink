# ⛽ Abastecimento & 💬 Mensageria (Sala de Controle ↔ Equipamento)

## Visão Geral

Dois módulos que complementam a operação em tempo real:

1. **Abastecimento** — Controle completo de combustível: nível do tanque via telemetria, registro de abastecimentos, previsão do próximo, consumo por hora/ton, autonomia
2. **Mensageria** — Comunicação bidirecional entre sala de controle e operador via hardware (tablet), com histórico, status de leitura e tipos de mensagem

---

## 1. Abastecimento

### Dados de Telemetria (CAN Bus)

O hardware de telemetria pode fornecer em tempo real:

| Dado CAN | Campo | Unidade | Frequência |
|----------|-------|---------|-----------|
| Nível do tanque | nivel_tanque_pct | % (0-100) | 30s-1min |
| Nível do tanque | nivel_tanque_litros | Litros | 30s-1min |
| Consumo instantâneo | consumo_instantaneo_lh | L/h | 5s |
| Temperatura combustível | temperatura_combustivel | °C | 1min |
| Pressão combustível | pressao_combustivel | bar | 1min |

### Expansão do equipamento_snapshot

```sql
-- Adicionar ao equipamento_snapshot (ALTER TABLE)
ALTER TABLE equipamento_snapshot ADD COLUMN IF NOT EXISTS (
    -- ═══ TANQUE / COMBUSTÍVEL (telemetria CAN) ═══
    nivel_tanque_pct NUMERIC(5,2),           -- 0-100% (do sensor CAN)
    nivel_tanque_litros NUMERIC(8,2),        -- litros calculados (% × capacidade_tanque)
    capacidade_tanque_litros NUMERIC(8,2),   -- vem do modelo (fixo)
    consumo_instantaneo_lh NUMERIC(8,2),     -- L/h no momento (CAN)
    consumo_medio_turno_lh NUMERIC(8,2),     -- média do turno atual
    dt_leitura_tanque TIMESTAMP,             -- quando recebeu último dado
    
    -- Previsão
    autonomia_horas NUMERIC(6,2),            -- litros_atuais / consumo_medio
    autonomia_km NUMERIC(8,2),              -- se tiver dado de consumo/km
    previsao_proximo_abastecimento TIMESTAMP, -- NOW() + autonomia_horas
    alerta_tanque_baixo BOOLEAN DEFAULT false, -- TRUE se nivel < threshold
    
    -- Último abastecimento (expandido)
    dt_ultimo_abastecimento TIMESTAMP,
    litros_ultimo_abastecimento NUMERIC(10,2),
    horimetro_no_abastecimento NUMERIC(12,2),
    odometro_no_abastecimento NUMERIC(12,2),
    id_operador_abastecimento BIGINT,
    nome_operador_abastecimento VARCHAR(255),
    
    -- Consumo calculado
    consumo_medio_lh NUMERIC(8,2),           -- média geral (últimos N abastecimentos)
    consumo_lt_ton NUMERIC(8,4),             -- L/ton (eficiência de transporte)
    consumo_lt_km NUMERIC(8,4)              -- L/km (eficiência de percurso)
);
```

### Modelagem: Abastecimento

```sql
-- ═══════════════════════════════════════════════════════════════
-- POSTO DE ABASTECIMENTO (área de abastecimento)
-- ═══════════════════════════════════════════════════════════════
posto_abastecimento (
    id_posto_abastecimento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area BIGINT REFERENCES area(id_area),  -- área geofence do posto
    
    nome VARCHAR(100) NOT NULL,              -- 'Posto Central', 'Comboio 01'
    tipo VARCHAR(20) NOT NULL,               -- 'FIXO', 'COMBOIO' (caminhão comboio)
    id_equipamento_comboio BIGINT REFERENCES equipamento(id_equipamento), -- se COMBOIO
    
    -- Capacidade
    capacidade_litros NUMERIC(12,2),
    estoque_atual_litros NUMERIC(12,2),
    
    -- Controle
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ABASTECIMENTO (cada evento de abastecimento)
-- ═══════════════════════════════════════════════════════════════
abastecimento (
    id_abastecimento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_operador BIGINT REFERENCES operador(id_operador),
    id_posto_abastecimento BIGINT REFERENCES posto_abastecimento(id_posto_abastecimento),
    id_turno BIGINT REFERENCES turno(id_turno),
    
    -- Tipo de combustível
    id_combustivel BIGINT REFERENCES combustivel(id_combustivel),
    
    -- Quantidades
    litros NUMERIC(10,2) NOT NULL,
    
    -- Medidores no momento do abastecimento
    horimetro_momento NUMERIC(12,2),
    odometro_momento NUMERIC(12,2),
    nivel_tanque_antes_pct NUMERIC(5,2),     -- % antes de abastecer (se disponível via CAN)
    nivel_tanque_depois_pct NUMERIC(5,2),    -- % depois (confirma que abasteceu)
    
    -- Cálculos (delta desde último abastecimento)
    horas_desde_ultimo NUMERIC(8,2),         -- horímetro atual - horímetro último abast
    km_desde_ultimo NUMERIC(10,2),           -- odômetro atual - odômetro último abast
    consumo_calculado_lh NUMERIC(8,2),       -- litros / horas_desde_ultimo
    consumo_calculado_lkm NUMERIC(8,4),      -- litros / km_desde_ultimo
    
    -- Produção desde último abastecimento (para L/ton)
    toneladas_desde_ultimo NUMERIC(12,2),
    consumo_calculado_lt NUMERIC(8,4),       -- litros / toneladas
    
    -- Validação
    origem VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    -- MANUAL (operador registra), SENSOR (medidor de vazão), TELEMETRIA (detectado por queda+subida de nível)
    
    validado BOOLEAN DEFAULT false,          -- supervisor conferiu?
    id_usuario_validacao BIGINT REFERENCES usuario(id_usuario),
    
    -- Localização
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    
    observacao TEXT,
    dt_abastecimento TIMESTAMP NOT NULL,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abast_equip ON abastecimento(id_equipamento, dt_abastecimento DESC);
CREATE INDEX idx_abast_turno ON abastecimento(id_tenant, id_turno, dt_abastecimento);
CREATE INDEX idx_abast_posto ON abastecimento(id_posto_abastecimento);

-- ═══════════════════════════════════════════════════════════════
-- CONFIGURAÇÃO DE ALERTA DE TANQUE (por modelo ou equipamento)
-- ═══════════════════════════════════════════════════════════════
config_alerta_tanque (
    id_config_alerta_tanque BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_modelo_equipamento BIGINT REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_equipamento BIGINT REFERENCES equipamento(id_equipamento), -- override por equip
    
    nivel_alerta_pct NUMERIC(5,2) NOT NULL DEFAULT 20, -- alertar quando < 20%
    nivel_critico_pct NUMERIC(5,2) NOT NULL DEFAULT 10, -- crítico quando < 10%
    autonomia_alerta_horas NUMERIC(6,2) DEFAULT 2,     -- alertar quando autonomia < 2h
    
    CONSTRAINT chk_modelo_ou_equip CHECK (
        id_modelo_equipamento IS NOT NULL OR id_equipamento IS NOT NULL
    )
);
```

### Detecção Automática de Abastecimento (via Telemetria)

```typescript
// Engine que detecta abastecimento pela subida repentina do nível do tanque
// Sem precisar de registro manual

async function detectarAbastecimentoAutomatico(idEquipamento: number, nivelAtual: number) {
  const snapshot = await getSnapshot(idEquipamento);
  const nivelAnterior = snapshot.nivel_tanque_pct;
  
  // Se nível subiu > 15% em menos de 5 minutos → abastecimento detectado
  if (nivelAtual - nivelAnterior > 15) {
    const litrosEstimados = ((nivelAtual - nivelAnterior) / 100) * snapshot.capacidade_tanque_litros;
    
    await registrarAbastecimento({
      id_equipamento: idEquipamento,
      litros: litrosEstimados,
      nivel_tanque_antes_pct: nivelAnterior,
      nivel_tanque_depois_pct: nivelAtual,
      horimetro_momento: snapshot.horimetro_atual,
      odometro_momento: snapshot.odometro_atual,
      id_operador: snapshot.id_operador_atual,
      origem: 'TELEMETRIA',  // detectado automaticamente
      validado: false         // supervisor precisa confirmar litros exatos
    });
  }
}
```

### Tela: Dashboard de Abastecimento

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ⛽ Abastecimento — Controle                                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ │  4.230  │ │  62.4   │ │  2.1    │ │    3    │ │    1    │          │
│ │  L hoje │ │  L/h    │ │ L/ton   │ │ < 20%   │ │ < 10%   │          │
│ │         │ │  média  │ │  média  │ │  alerta │ │ crítico │          │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                                          │
│ ┌─── Nível do Tanque (Frota) ───────────────────────────────────────┐   │
│ │ Equip   │ Tanque │ Nível │ Consumo │ Autonomia │ Próx. Abast.    │   │
│ │ CAT-01  │ ████████████████████░░░░  78%  │ 58 L/h │ ~5.4h │ ~14:30 │   │
│ │ CAT-02  │ ██████████████░░░░░░░░░░  55%  │ 65 L/h │ ~3.4h │ ~12:20 │   │
│ │ CAT-03  │ ██████░░░░░░░░░░░░░░░░░░  22%  │  —     │  —    │ ⚠️     │   │
│ │ CAT-04  │ ████████████████████████  92%  │ 60 L/h │ ~6.1h │ ~15:00 │   │
│ │ CAT-05  │ ████░░░░░░░░░░░░░░░░░░░░  15%  │ 63 L/h │ ~0.9h │ 🔴 JÁ  │   │
│ │ ESC-01  │ ██████████████████░░░░░░  68%  │ 175L/h │ ~3.1h │ ~12:00 │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── Últimos Abastecimentos ────────────────────────────────────────┐   │
│ │ Data/Hora     │ Equip  │ Litros │ Operador    │ Posto   │ Tipo    │   │
│ │ 09/06 08:45   │ CAT-04 │ 620 L  │ João Silva  │ Central │ Manual  │   │
│ │ 09/06 07:30   │ CAT-01 │ 580 L  │ Pedro Costa │ Central │ Manual  │   │
│ │ 09/06 06:10   │ ESC-01 │ 1200 L │ Maria Souza │ Comboio │ Sensor  │   │
│ │ 08/06 22:15   │ CAT-02 │ 610 L  │ Carlos S.   │ Central │ Telem.⚠️│   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── Consumo Médio por Equipamento (L/h) — Último mês ──────────────┐  │
│ │  CAT-01  ████████████████  58 L/h                                  │  │
│ │  CAT-02  █████████████████  65 L/h  ⚠️ +12% vs modelo              │  │
│ │  CAT-04  ████████████████  60 L/h                                  │  │
│ │  CAT-05  █████████████████  63 L/h                                 │  │
│ │  ESC-01  ██████████████████████████████████  175 L/h               │  │
│ │  Meta modelo 777G: 62 L/h ─ ─ ─ ─                                 │  │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mensageria (Sala de Controle ↔ Operador)

### Conceito

A sala de controle precisa se comunicar com operadores via tablet/hardware. Exemplos:
- "Vá para Frente Norte" (dispatch manual)
- "Pare o equipamento imediatamente — área interditada"
- "Seu checklist está pendente"
- Operador responde: "Entendido" / "Problema no freio, preciso de mecânico"

É um **chat simplificado** entre sala e equipamento, com:
- Mensagens de texto
- Mensagens pré-definidas (templates)
- Status de leitura (enviado → entregue → lido)
- Prioridade (normal, urgente, emergência)
- Histórico completo
- Funciona offline (entra na fila de sync)

### Modelagem

```sql
-- ═══════════════════════════════════════════════════════════════
-- MENSAGEM (cada mensagem enviada/recebida)
-- ═══════════════════════════════════════════════════════════════
mensagem_operacional (
    id_mensagem_operacional BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    -- Participantes
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_operador BIGINT REFERENCES operador(id_operador),   -- operador no momento
    
    -- Direção
    direcao VARCHAR(10) NOT NULL,            -- 'SALA_EQUIP' ou 'EQUIP_SALA'
    
    -- Remetente (quem escreveu)
    id_usuario_remetente BIGINT REFERENCES usuario(id_usuario),  -- se veio da sala
    -- Se veio do equipamento: id_operador é o remetente
    
    -- Conteúdo
    tipo VARCHAR(20) NOT NULL DEFAULT 'TEXTO',
    -- TEXTO, TEMPLATE, ALERTA, DISPATCH, SISTEMA
    
    conteudo TEXT NOT NULL,                   -- texto da mensagem
    id_mensagem_template BIGINT REFERENCES mensagem_template(id_mensagem_template), -- se é template
    
    -- Prioridade
    prioridade VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    -- NORMAL, URGENTE, EMERGENCIA
    -- EMERGENCIA: toca alarme no tablet, exige confirmação
    
    -- Status de entrega
    status VARCHAR(20) NOT NULL DEFAULT 'ENVIADO',
    -- ENVIADO      → saiu do remetente
    -- ENTREGUE     → chegou no device destinatário
    -- LIDO         → operador/usuário visualizou
    -- RESPONDIDO   → tem resposta vinculada
    -- EXPIRADO     → não foi lido no prazo (se tinha prazo)
    
    dt_envio TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_entrega TIMESTAMP,                    -- quando chegou no device
    dt_leitura TIMESTAMP,                    -- quando foi aberto/lido
    
    -- Resposta (se é reply a outra mensagem)
    id_mensagem_pai BIGINT REFERENCES mensagem_operacional(id_mensagem_operacional),
    
    -- Expiração
    expira_em_minutos INT,                   -- NULL = não expira
    dt_expiracao TIMESTAMP,                  -- calculado: dt_envio + expira_em_minutos
    
    -- Metadata
    latitude NUMERIC(10,7),                  -- posição quando enviou/recebeu
    longitude NUMERIC(10,7),
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_msg_equip ON mensagem_operacional(id_equipamento, dt_envio DESC);
CREATE INDEX idx_msg_status ON mensagem_operacional(id_tenant, status, dt_envio DESC);
CREATE INDEX idx_msg_usuario ON mensagem_operacional(id_usuario_remetente, dt_envio DESC);

-- ═══════════════════════════════════════════════════════════════
-- TEMPLATES DE MENSAGEM (mensagens pré-definidas, envio rápido)
-- ═══════════════════════════════════════════════════════════════
mensagem_template (
    id_mensagem_template BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    categoria VARCHAR(50) NOT NULL,          -- 'DISPATCH', 'SEGURANCA', 'MANUTENCAO', 'GERAL'
    titulo VARCHAR(100) NOT NULL,            -- título curto para listagem
    conteudo TEXT NOT NULL,                   -- texto completo
    
    -- Variáveis que podem ser preenchidas
    variaveis JSONB,                         -- [{"nome": "area", "label": "Área"}, {"nome": "motivo", "label": "Motivo"}]
    -- Ex: "Dirija-se para {{area}} imediatamente. Motivo: {{motivo}}"
    
    prioridade_padrao VARCHAR(20) DEFAULT 'NORMAL',
    expira_em_minutos_padrao INT,            -- expiração default
    
    -- Requer confirmação do operador?
    requer_confirmacao BOOLEAN DEFAULT false,
    
    icone VARCHAR(50),
    cor VARCHAR(7),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CONVERSA / THREAD (agrupa mensagens por equipamento por turno)
-- ═══════════════════════════════════════════════════════════════
mensagem_conversa (
    id_mensagem_conversa BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_turno BIGINT REFERENCES turno(id_turno),
    
    -- Contadores
    total_mensagens INT DEFAULT 0,
    mensagens_nao_lidas_sala INT DEFAULT 0,    -- não lidas pela sala
    mensagens_nao_lidas_equip INT DEFAULT 0,   -- não lidas pelo operador
    
    -- Última mensagem (para listagem)
    ultima_mensagem_preview TEXT,
    dt_ultima_mensagem TIMESTAMP,
    
    dt_inicio TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_fim TIMESTAMP                          -- quando turno fecha
);

CREATE INDEX idx_conv_equip ON mensagem_conversa(id_equipamento, dt_inicio DESC);
```

### Respostas rápidas do operador

O operador no tablet não deve digitar muito (está operando). Tem botões de resposta rápida:

```sql
-- Respostas rápidas configuráveis
mensagem_resposta_rapida (
    id_mensagem_resposta_rapida BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    texto VARCHAR(100) NOT NULL,             -- 'Entendido', 'A caminho', 'Preciso de apoio'
    icone VARCHAR(50),
    categoria VARCHAR(50),                   -- 'CONFIRMACAO', 'PROBLEMA', 'STATUS'
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true
);
```

### Tela: Sala de Controle — Chat

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 💬 Mensagens — Sala de Controle                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─── Conversas ─────────────┐ ┌─── CAT-01 (João Silva) ─────────────┐  │
│ │                            │ │                                      │  │
│ │ 🟢 CAT-01 (João)     2min │ │  ┌─────────────────────────────┐    │  │
│ │    "Entendido, indo p..."  │ │  │ 🏢 Sala (08:30)             │    │  │
│ │                            │ │  │ Dirija-se para Frente Norte. │    │  │
│ │ 🟡 CAT-02 (Carlos)   15m  │ │  │ Prioridade: ⭐ Alta          │    │  │
│ │    "Preciso de mecâni..."  │ │  │              ✓✓ Lido 08:31   │    │  │
│ │                            │ │  └─────────────────────────────┘    │  │
│ │ 🟢 CAT-04 (Pedro)    30m  │ │                                      │  │
│ │    "✓ A caminho"           │ │  ┌─────────────────────────────┐    │  │
│ │                            │ │  │ 🚜 João (08:31)              │    │  │
│ │ 🔴 CAT-05 (Roberto)  1h   │ │  │ Entendido, indo pra lá.     │    │  │
│ │    ⚠️ Não leu (URGENTE)   │ │  │              ✓✓ Lido 08:31   │    │  │
│ │                            │ │  └─────────────────────────────┘    │  │
│ │ 🟢 ESC-01 (Maria)    2h   │ │                                      │  │
│ │    "OK, checklist feito"   │ │  ┌─────────────────────────────┐    │  │
│ │                            │ │  │ 🏢 Sala (09:15)             │    │  │
│ │                            │ │  │ Troque atividade para        │    │  │
│ │                            │ │  │ Transporte Estéril.          │    │  │
│ │                            │ │  │              ✓ Entregue       │    │  │
│ │                            │ │  └─────────────────────────────┘    │  │
│ │                            │ │                                      │  │
│ │                            │ │                                      │  │
│ └────────────────────────────┘ │ ┌──────────────────────────────────┐│  │
│                                 │ │ [📋 Templates ▾] [Digite msg...] ││  │
│ ┌─── Envio em Massa ────────┐ │ │ [Enviar] [🔴 Urgente]            ││  │
│ │ Enviar para:               │ │ └──────────────────────────────────┘│  │
│ │ ☐ Todos  ☐ Caminhões      │ └──────────────────────────────────────┘  │
│ │ ☐ Escavadeiras ☐ Frente N │                                           │
│ │ [Compor mensagem em massa] │                                           │
│ └────────────────────────────┘                                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Tela: Tablet do Operador

```
┌────────────────────────────────────────┐
│ 💬 Mensagens                    CAT-01 │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🏢 Sala de Controle     09:15   │  │
│  │                                  │  │
│  │ Troque atividade para            │  │
│  │ Transporte Estéril.              │  │
│  │                                  │  │
│  │ Prioridade: Normal               │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🚨 URGENTE         Sala  09:45  │  │
│  │                                  │  │
│  │ Área Britador interditada.       │  │
│  │ NÃO se aproxime. Aguarde.       │  │
│  │                                  │  │
│  │ [✅ Confirmar Leitura]           │  │
│  └──────────────────────────────────┘  │
│                                        │
│ ┌──── Respostas Rápidas ─────────────┐ │
│ │ [✅ Entendido] [🚗 A caminho]     │ │
│ │ [🔧 Preciso apoio] [⛽ Abastecendo]│ │
│ │ [❌ Não posso] [💬 Digitar...]     │ │
│ └────────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### Integração com Sync Mobile

As mensagens participam do protocolo de sync:

**Download (Server → Device):**
- Mensagens com `direcao = 'SALA_EQUIP'` e `id_equipamento = meu_equip`
- Filtro: apenas mensagens com sync_versao > última versão do device

**Upload (Device → Server):**
- Mensagens com `direcao = 'EQUIP_SALA'`
- Confirmações de leitura (`dt_leitura` update)
- Respostas do operador

**Push:**
- Mensagem URGENTE/EMERGÊNCIA: push notification imediata (acorda o app)
- Mensagem NORMAL: próximo sync regular

---

## API Endpoints

### Abastecimento

```
# CRUD
GET    /api/abastecimento                        -- listar (filtros: equip, data, turno, posto)
POST   /api/abastecimento                        -- registrar (manual)
PUT    /api/abastecimento/:id                    -- editar
POST   /api/abastecimento/:id/validar            -- supervisor valida

# Postos
GET    /api/posto-abastecimento                  -- listar postos
POST   /api/posto-abastecimento                  -- criar posto

# Dashboard
GET    /api/abastecimento/dashboard              -- KPIs (consumo médio, litros/dia)
GET    /api/abastecimento/niveis                 -- nível do tanque de toda frota
GET    /api/abastecimento/previsao               -- próximo abastecimento previsto por equip
GET    /api/abastecimento/consumo-analise        -- consumo por equip/modelo/operador
GET    /api/abastecimento/alertas                -- tanques baixos/críticos

# Config
GET    /api/config-alerta-tanque                 -- configs de alerta
POST   /api/config-alerta-tanque                 -- criar config
```

### Mensageria

```
# Mensagens
POST   /api/mensagem                             -- enviar mensagem (sala → equip)
POST   /api/mensagem/massa                       -- enviar para múltiplos equipamentos
GET    /api/mensagem/conversas                   -- listar conversas ativas
GET    /api/mensagem/conversa/:equipId           -- histórico de um equipamento
PUT    /api/mensagem/:id/lida                    -- marcar como lida
GET    /api/mensagem/nao-lidas                   -- mensagens pendentes de leitura

# Templates
GET    /api/mensagem-template                    -- listar templates
POST   /api/mensagem-template                    -- criar template
PUT    /api/mensagem-template/:id                -- editar

# Respostas rápidas
GET    /api/mensagem-resposta-rapida             -- listar
POST   /api/mensagem-resposta-rapida             -- criar

# Stats
GET    /api/mensagem/stats                       -- tempo médio de leitura, % respondidas
```

---

## Regras de Negócio

### Abastecimento

| # | Regra |
|---|-------|
| 1 | Se nível < config.nivel_alerta_pct → alerta amarelo no dashboard |
| 2 | Se nível < config.nivel_critico_pct → alerta vermelho + notificação sala |
| 3 | Detecção automática: subida > 15% em < 5min = abastecimento (origem: TELEMETRIA) |
| 4 | Consumo médio = média ponderada dos últimos 5 abastecimentos |
| 5 | Autonomia = nivel_atual_litros / consumo_medio_lh |
| 6 | Se consumo > 120% do modelo → alerta (possível vazamento ou problema motor) |
| 7 | Abastecimento detectado por telemetria requer validação do supervisor |

### Mensageria

| # | Regra |
|---|-------|
| 1 | Mensagem EMERGÊNCIA toca alarme no tablet (áudio + vibração + tela cheia) |
| 2 | Mensagem EMERGÊNCIA exige confirmação de leitura (botão) |
| 3 | Se URGENTE não lida em 5min → escala para supervisor + alerta na sala |
| 4 | Mensagem com template pode ter variáveis (preenchidas na hora do envio) |
| 5 | Envio em massa: mesma mensagem para filtro (todos, grupo, área) |
| 6 | Operador usa respostas rápidas (1 toque) — minimizar digitação |
| 7 | Histórico mantido por turno (conversa agrupa por equip + turno) |
| 8 | Offline: mensagens entram na sync queue, entregues quando reconectar |

---

## Tabelas adicionadas

| # | Tabela | Domínio |
|---|--------|---------|
| 1 | posto_abastecimento | Abastecimento |
| 2 | abastecimento | Abastecimento |
| 3 | config_alerta_tanque | Abastecimento |
| 4 | mensagem_operacional | Mensageria |
| 5 | mensagem_template | Mensageria |
| 6 | mensagem_conversa | Mensageria |
| 7 | mensagem_resposta_rapida | Mensageria |

**Total acumulado: ~114 tabelas**

---

## Funcionalidades (MODULES.md)

| # | Módulo | Código | Descrição |
|---|--------|--------|-----------|
| 31 | Operação | OPERACAO_ABASTECIMENTO | Registro, validação, dashboard combustível |
| 32 | Operação | OPERACAO_MENSAGERIA | Chat sala↔equip, templates, respostas rápidas |
| 33 | Telemetria | TELEMETRIA_TANQUE | Nível tanque via CAN, detecção automática |
