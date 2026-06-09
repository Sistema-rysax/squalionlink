# 🏷️ Atividades & Status do Equipamento

## Conceito

O sistema de **Atividades** define o que o equipamento está fazendo a cada momento. Cada modelo de equipamento tem um conjunto de atividades possíveis, categorizadas e com regras de comportamento que permitem:

- Saber o **status operacional atual** do equipamento em tempo real
- Gerar **alertas inteligentes** baseados em velocidade × atividade
- Controlar **logoff automático** do app mobile
- Classificar tempo em: produtivo, improdutivo, manutenção, etc.

## Fluxo

```
1. Admin cadastra Grupos de Atividade (Operação, Manutenção, Apoio, Improdutiva...)
2. Admin cadastra Atividades dentro de cada grupo
3. Associa atividades ao Modelo de Equipamento (N:N)
4. Define regras por atividade (movimento/parada, velocidade, logoff)
5. Operador seleciona atividade no app mobile
6. Sistema monitora GPS e valida:
   - Atividade diz "PARADA" mas equipamento está andando? → ALERTA
   - Atividade diz "MOVIMENTO" mas equipamento parou há X min? → ALERTA
7. Dashboard mostra status atual de cada equipamento em tempo real
```

## Modelagem

### Tabelas

```sql
-- Tipo/Categoria de atividade
atividade_tipo (
    id_atividade_tipo BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    nome VARCHAR(100) NOT NULL,             -- 'Operação', 'Manutenção', 'Apoio', 'Improdutiva'
    classificacao VARCHAR(30) NOT NULL,     -- 'PRODUTIVA', 'IMPRODUTIVA', 'MANUTENCAO', 'APOIO', 'RESERVA'
    cor VARCHAR(7),                         -- cor no dashboard/mapa
    icone VARCHAR(50),                      -- nome do ícone
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL
)

-- Grupo de atividade (agrupa atividades de mesmo contexto)
atividade_grupo (
    id_atividade_grupo BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_atividade_tipo BIGINT NOT NULL FK,
    nome VARCHAR(100) NOT NULL,             -- 'Transporte Minério', 'Manutenção Corretiva'
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL
)

-- Atividade (item específico)
atividade (
    id_atividade BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_atividade_grupo BIGINT NOT NULL FK,
    codigo VARCHAR(20) NOT NULL,            -- 'TRANSP_MIN', 'MANUT_PREV', 'ABAST'
    nome VARCHAR(100) NOT NULL,             -- 'Transporte de Minério', 'Abastecimento'
    descricao TEXT,
    
    -- Comportamento esperado
    tipo_movimento VARCHAR(20) NOT NULL,    -- 'MOVIMENTO', 'PARADA', 'AMBOS'
    
    -- Controles mobile
    faz_logoff_app BOOLEAN DEFAULT false,   -- ao selecionar, desloga do app?
    exige_confirmacao BOOLEAN DEFAULT false, -- precisa confirmar seleção?
    permite_manual BOOLEAN DEFAULT true,     -- operador pode selecionar manualmente?
    
    -- Regras de velocidade (para gerar alertas)
    velocidade_minima NUMERIC(5,1),         -- km/h (se MOVIMENTO: abaixo disso = alerta)
    velocidade_maxima NUMERIC(5,1),         -- km/h (acima disso = alerta, independente do rotograma)
    tempo_alerta_parado_seg INT,            -- se MOVIMENTO: após X seg parado → alerta
    tempo_alerta_movimento_seg INT,         -- se PARADA: após X seg em movimento → alerta
    
    -- Configuração de tempo
    tempo_maximo_minutos INT,               -- tempo máximo nessa atividade (ex: almoço = 60min)
    tempo_alerta_excedido_min INT,          -- alertar X min antes de estourar
    
    -- Visual
    cor VARCHAR(7),
    icone VARCHAR(50),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL,
    dt_alteracao TIMESTAMP NOT NULL
)

-- Vinculação: Atividade ↔ Modelo de Equipamento (N:N)
atividade_modelo (
    id_atividade_modelo BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_atividade BIGINT NOT NULL FK,
    id_modelo_equipamento BIGINT NOT NULL FK,
    ativo BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(id_tenant, id_atividade, id_modelo_equipamento)
)

-- Status atual do equipamento (sempre 1 registro ativo por equipamento)
equipamento_status_atual (
    id_equipamento_status_atual BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,
    id_atividade BIGINT FK,                  -- atividade atual (NULL = sem atividade)
    id_operador BIGINT FK,                   -- operador atual
    id_turno BIGINT FK,
    status_operacional VARCHAR(30) NOT NULL,  -- 'OPERANDO', 'PARADO', 'MANUTENCAO', 'SEM_OPERADOR', 'DESLIGADO'
    velocidade_atual NUMERIC(5,1),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    id_area_atual BIGINT FK,                 -- em qual área está
    horimetro_atual NUMERIC(12,2),
    ignicao BOOLEAN,
    dt_inicio_atividade TIMESTAMP,           -- quando começou a atividade atual
    dt_ultimo_movimento TIMESTAMP,           -- última vez que se moveu
    dt_ultima_parada TIMESTAMP,              -- última vez que parou
    dt_atualizacao TIMESTAMP NOT NULL,       -- último update desse registro
    UNIQUE(id_tenant, id_equipamento)
)

-- Histórico de atividades (log de mudanças)
equipamento_atividade_historico (
    id_equipamento_atividade_historico BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,
    id_atividade BIGINT NOT NULL FK,
    id_operador BIGINT FK,
    id_turno BIGINT FK,
    dt_inicio TIMESTAMP NOT NULL,            -- quando iniciou essa atividade
    dt_fim TIMESTAMP,                        -- quando trocou (NULL = ainda ativa)
    duracao_minutos NUMERIC(10,2),           -- calculado ao fechar
    origem VARCHAR(20) NOT NULL,             -- 'OPERADOR', 'SISTEMA', 'SUPERVISOR'
    latitude_inicio NUMERIC(10,7),
    longitude_inicio NUMERIC(10,7),
    latitude_fim NUMERIC(10,7),
    longitude_fim NUMERIC(10,7),
    horimetro_inicio NUMERIC(12,2),
    horimetro_fim NUMERIC(12,2),
    dt_registro TIMESTAMP NOT NULL
) PARTITION BY RANGE (dt_registro);          -- particionar por mês (alta volumetria)

-- Alertas de atividade (gerados pela engine)
atividade_alerta (
    id_atividade_alerta BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,
    id_atividade BIGINT NOT NULL FK,
    id_operador BIGINT FK,
    tipo_alerta VARCHAR(30) NOT NULL,
    -- 'PARADO_EM_MOVIMENTO'     → atividade é MOVIMENTO mas equipamento parado
    -- 'MOVIMENTO_EM_PARADA'     → atividade é PARADA mas equipamento andando
    -- 'VELOCIDADE_ABAIXO_MIN'   → abaixo da velocidade mínima por X tempo
    -- 'VELOCIDADE_ACIMA_MAX'    → acima da velocidade máxima
    -- 'TEMPO_EXCEDIDO'          → ultrapassou tempo máximo da atividade
    -- 'SEM_ATIVIDADE'           → equipamento ligado sem atividade selecionada
    descricao TEXT,
    velocidade_momento NUMERIC(5,1),
    tempo_violacao_seg INT,                  -- há quanto tempo está violando
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    severidade VARCHAR(10) NOT NULL,         -- 'INFO', 'ATENCAO', 'CRITICO'
    resolvido BOOLEAN DEFAULT false,
    dt_evento TIMESTAMP NOT NULL,
    dt_resolucao TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL
)
```

### Índices

```sql
CREATE INDEX idx_equip_status_atual_tenant ON equipamento_status_atual (id_tenant, id_equipamento);
CREATE INDEX idx_equip_ativ_hist_tenant_equip ON equipamento_atividade_historico (id_tenant, id_equipamento, dt_inicio DESC);
CREATE INDEX idx_equip_ativ_hist_tenant_dt ON equipamento_atividade_historico (id_tenant, dt_inicio DESC);
CREATE INDEX idx_ativ_alerta_tenant_dt ON atividade_alerta (id_tenant, dt_evento DESC) WHERE resolvido = false;
CREATE INDEX idx_ativ_modelo_tenant ON atividade_modelo (id_tenant, id_modelo_equipamento);
```

## Engine de Regras (Worker Real-Time)

```
GPS Position chega (a cada 5-30 seg)
    │
    ▼
Atualiza equipamento_status_atual:
    - velocidade_atual, latitude, longitude, dt_atualizacao
    │
    ▼
Verifica atividade atual do equipamento:
    │
    ├─ Atividade = MOVIMENTO?
    │      │
    │      ├─ Velocidade < velocidade_minima por > tempo_alerta_parado_seg?
    │      │      → Gera alerta PARADO_EM_MOVIMENTO
    │      │
    │      └─ Velocidade > velocidade_maxima?
    │             → Gera alerta VELOCIDADE_ACIMA_MAX
    │
    ├─ Atividade = PARADA?
    │      │
    │      └─ Velocidade > 5 km/h por > tempo_alerta_movimento_seg?
    │             → Gera alerta MOVIMENTO_EM_PARADA
    │
    ├─ Sem atividade + Ignição ON?
    │      → Gera alerta SEM_ATIVIDADE (após X min)
    │
    └─ Tempo na atividade atual > tempo_maximo_minutos?
           → Gera alerta TEMPO_EXCEDIDO
```

## Status Operacional do Equipamento

O campo `status_operacional` em `equipamento_status_atual` é derivado automaticamente:

| Status | Condição |
|--------|----------|
| OPERANDO | Ignição ON + atividade produtiva + velocidade > 0 |
| PARADO | Ignição ON + atividade produtiva + velocidade = 0 |
| MANUTENCAO | Atividade classificada como MANUTENCAO |
| SEM_OPERADOR | Ignição ON + sem operador logado |
| DESLIGADO | Ignição OFF ou sem sinal GPS há > X min |
| IMPRODUTIVO | Atividade classificada como IMPRODUTIVA |
| RESERVA | Atividade classificada como RESERVA |

## Dashboard Real-Time

O mapa exibe cada equipamento com:
- **Ícone** do grupo de equipamento
- **Cor** baseada no status_operacional (verde=operando, amarelo=parado, vermelho=manutenção, cinza=desligado)
- **Tooltip** com: operador, atividade atual, velocidade, tempo na atividade
- **Alerta visual** (pulsando) quando há violação ativa

## Exemplos de Atividades por Modelo

### Caminhão Fora-Estrada (CAT 777G)
| Grupo | Atividade | Tipo Movimento | Alerta se... |
|-------|-----------|---------------|-------------|
| Operação | Transporte Carregado | MOVIMENTO | Parado > 5min |
| Operação | Transporte Vazio | MOVIMENTO | Parado > 5min |
| Operação | Aguardando Carga | PARADA | Andando > 30seg |
| Operação | Aguardando Descarga | PARADA | Andando > 30seg |
| Apoio | Abastecimento | PARADA | Andando > 30seg |
| Improdutiva | Troca de Turno | PARADA | > 30min |
| Improdutiva | Refeição | PARADA | > 60min |
| Manutenção | Manutenção Preventiva | PARADA | Logoff app |
| Manutenção | Manutenção Corretiva | PARADA | Logoff app |

### Escavadeira (Komatsu PC200)
| Grupo | Atividade | Tipo Movimento | Alerta se... |
|-------|-----------|---------------|-------------|
| Operação | Carregamento | PARADA | Deslocando > 60seg |
| Operação | Deslocamento | MOVIMENTO | Parado > 10min |
| Operação | Escavação | AMBOS | - |
| Apoio | Limpeza de Praça | AMBOS | - |
| Improdutiva | Aguardando Caminhão | PARADA | > 15min |
```
