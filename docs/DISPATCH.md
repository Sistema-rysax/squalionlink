# 🎯 Dispatch & Alocação de Frota

## Conceito

O **Dispatch** (Despacho) é o módulo responsável por alocar equipamentos de transporte às frentes de carga e pontos de descarga, otimizando a produtividade e minimizando filas. Funciona como o "cérebro" da operação em tempo real.

## Modos de Operação

| Modo | Descrição | Uso |
|------|-----------|-----|
| MANUAL | Supervisor decide cada alocação via dashboard | Operações menores ou situações atípicas |
| SEMI_AUTOMATICO | Sistema sugere, supervisor aprova | Padrão inicial — confiança progressiva |
| AUTOMATICO | Sistema aloca e notifica operador diretamente | Operações maduras com dados históricos |

## Fluxo de Dispatch

```
1. Caminhão termina ciclo (descarga) → fica DISPONÍVEL
2. Engine calcula:
   - Quais frentes estão operando?
   - Qual a fila atual em cada frente?
   - Qual o tempo estimado de ciclo para cada rota?
   - Prioridade de produção por material/frente?
3. Decisão: envia caminhão para frente com melhor score
4. Operador recebe no tablet: "Ir para Frente Norte - Bancada 3"
5. Se operador não confirma em X seg → re-despacha ou alerta supervisor
```

## Modelagem

### Tabelas

```sql
-- Configuração do dispatch
dispatch_configuracao (
    id_dispatch_configuracao BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    modo VARCHAR(20) NOT NULL DEFAULT 'MANUAL',  -- 'MANUAL','SEMI_AUTOMATICO','AUTOMATICO'
    
    -- Parâmetros do algoritmo
    peso_fila NUMERIC(3,2) DEFAULT 0.40,          -- peso da fila no score (0-1)
    peso_distancia NUMERIC(3,2) DEFAULT 0.30,     -- peso da distância no score
    peso_prioridade NUMERIC(3,2) DEFAULT 0.20,    -- peso da prioridade da frente
    peso_compatibilidade NUMERIC(3,2) DEFAULT 0.10, -- peso da compatibilidade equip/rota
    
    -- Tempos
    timeout_confirmacao_seg INT DEFAULT 60,        -- tempo para operador confirmar
    intervalo_recalculo_seg INT DEFAULT 30,        -- recalcula a cada X seg
    
    -- Restrições
    max_caminhoes_por_frente INT DEFAULT 8,        -- evitar congestionamento
    min_caminhoes_por_frente INT DEFAULT 2,        -- mínimo para manter produção
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL,
    dt_alteracao TIMESTAMP NOT NULL
)

-- Frente de operação (instância ativa de uma área ORIGEM com escavadeira)
frente_operacao (
    id_frente_operacao BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_area BIGINT NOT NULL FK,              -- área tipo ORIGEM
    id_subarea BIGINT FK,                    -- bancada específica
    id_equipamento_carga BIGINT NOT NULL FK, -- escavadeira/carregadeira
    id_operador_carga BIGINT FK,
    id_material BIGINT FK,                   -- material sendo lavrado
    
    -- Status
    status VARCHAR(20) NOT NULL,             -- 'ATIVA','PAUSADA','ENCERRADA'
    prioridade INT NOT NULL DEFAULT 5,       -- 1(máx) a 10(mín)
    
    -- Meta
    meta_producao_ton NUMERIC(12,2),         -- meta do turno em ton
    producao_atual_ton NUMERIC(12,2) DEFAULT 0,
    
    -- Destino padrão
    id_area_destino_padrao BIGINT FK,        -- para onde mandar por padrão
    
    -- Controle
    caminhoes_alocados INT DEFAULT 0,        -- quantos estão alocados agora
    tempo_medio_fila_seg INT DEFAULT 0,      -- fila média atual
    
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL,
    dt_alteracao TIMESTAMP NOT NULL
)

-- Ponto de descarga ativo
ponto_descarga (
    id_ponto_descarga BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_area BIGINT NOT NULL FK,              -- área tipo DESTINO
    id_subarea BIGINT FK,
    
    status VARCHAR(20) NOT NULL,             -- 'ATIVO','PAUSADO','ENCERRADO'
    prioridade INT NOT NULL DEFAULT 5,
    
    -- Restrições
    max_caminhoes_simultaneos INT DEFAULT 3,
    aceita_materiais JSONB,                  -- [id_material1, id_material2] ou NULL = todos
    
    -- Controle
    caminhoes_em_fila INT DEFAULT 0,
    tempo_medio_descarga_seg INT DEFAULT 0,
    
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL
)

-- Ordem de despacho (cada vez que o sistema manda um caminhão para algum lugar)
dispatch_ordem (
    id_dispatch_ordem BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,       -- caminhão despachado
    id_operador BIGINT FK,
    
    -- De onde veio / Para onde vai
    id_frente_operacao BIGINT FK,            -- frente de destino (carga)
    id_ponto_descarga BIGINT FK,             -- ponto de descarga (se enviando para descarregar)
    id_area_destino BIGINT NOT NULL FK,      -- área destino final
    id_rota BIGINT FK,                       -- rota sugerida
    
    -- Decisão
    modo_despacho VARCHAR(20) NOT NULL,      -- 'MANUAL','SISTEMA','OVERRIDE'
    id_usuario_despacho BIGINT FK,           -- quem despachou (se manual)
    score NUMERIC(6,3),                      -- score calculado pelo algoritmo
    motivo TEXT,                             -- justificativa da decisão
    
    -- Status
    status VARCHAR(20) NOT NULL,             
    -- 'ENVIADA' → 'CONFIRMADA' → 'EM_TRANSITO' → 'CHEGOU' → 'CONCLUIDA'
    -- ou 'REJEITADA' / 'TIMEOUT' / 'CANCELADA'
    
    -- Timestamps
    dt_despacho TIMESTAMP NOT NULL,          -- quando foi despachado
    dt_confirmacao TIMESTAMP,                -- quando operador confirmou
    dt_chegada TIMESTAMP,                    -- quando chegou no destino
    dt_conclusao TIMESTAMP,                  -- quando terminou (carga/descarga feita)
    
    -- Tempo estimado vs real
    tempo_estimado_chegada_seg INT,
    tempo_real_chegada_seg INT,
    
    dt_registro TIMESTAMP NOT NULL
)

-- Histórico de disponibilidade (quando o caminhão fica disponível para despacho)
dispatch_disponibilidade (
    id_dispatch_disponibilidade BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,
    status VARCHAR(20) NOT NULL,             -- 'DISPONIVEL','DESPACHADO','INDISPONIVEL'
    motivo_indisponivel VARCHAR(50),         -- 'MANUTENCAO','ABASTECIMENTO','SEM_OPERADOR','TROCA_TURNO'
    dt_status TIMESTAMP NOT NULL,
    dt_registro TIMESTAMP NOT NULL
)

-- Regra de roteamento (frente X só manda para destino Y)
dispatch_regra_roteamento (
    id_dispatch_regra_roteamento BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_frente_operacao BIGINT FK,            -- NULL = regra global
    id_area_origem BIGINT FK,
    id_area_destino BIGINT NOT NULL FK,
    id_material BIGINT FK,                   -- NULL = qualquer material
    prioridade INT DEFAULT 5,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL
)
```

### Índices

```sql
CREATE INDEX idx_frente_oper_tenant_status ON frente_operacao (id_tenant, status) WHERE status = 'ATIVA';
CREATE INDEX idx_dispatch_ordem_tenant_equip ON dispatch_ordem (id_tenant, id_equipamento, dt_despacho DESC);
CREATE INDEX idx_dispatch_ordem_status ON dispatch_ordem (id_tenant, status) WHERE status IN ('ENVIADA','CONFIRMADA','EM_TRANSITO');
CREATE INDEX idx_dispatch_disp_tenant_equip ON dispatch_disponibilidade (id_tenant, id_equipamento, dt_status DESC);
```

## Algoritmo de Score

```typescript
function calcularScoreFrente(caminhao, frente, config): number {
    // 1. Score de fila (quanto menor a fila, melhor)
    const maxFila = config.max_caminhoes_por_frente;
    const scoreFila = 1 - (frente.caminhoes_alocados / maxFila);
    
    // 2. Score de distância (quanto menor, melhor)
    const distancia = calcularDistancia(caminhao.posicao, frente.posicao);
    const maxDist = 10; // km (normalização)
    const scoreDistancia = 1 - Math.min(distancia / maxDist, 1);
    
    // 3. Score de prioridade (normalizado 1-10 → 0-1)
    const scorePrioridade = 1 - ((frente.prioridade - 1) / 9);
    
    // 4. Score de compatibilidade
    const scoreCompat = verificarCompatibilidade(caminhao, frente) ? 1 : 0.3;
    
    // Score final ponderado
    return (
        scoreFila * config.peso_fila +
        scoreDistancia * config.peso_distancia +
        scorePrioridade * config.peso_prioridade +
        scoreCompat * config.peso_compatibilidade
    );
}
```

## Comunicação com Operador

```
Sistema decide → Emite via Socket.IO → Tablet do caminhão

Tela do operador:
┌─────────────────────────────────┐
│  🎯 NOVO DESTINO                │
│                                 │
│  Ir para: FRENTE NORTE          │
│  Bancada: 3                     │
│  Material: Minério de Ferro     │
│  Escavadeira: ESC-05            │
│                                 │
│  Distância: 2.3 km              │
│  Tempo estimado: 8 min          │
│                                 │
│  [✅ CONFIRMAR]  [❌ REJEITAR]   │
│                                 │
│  Auto-confirma em: 0:45         │
└─────────────────────────────────┘
```

## Métricas do Dispatch

| KPI | Fórmula |
|-----|---------|
| Taxa de confirmação | Confirmadas / Total × 100 |
| Tempo médio resposta | Média(dt_confirmacao - dt_despacho) |
| Aderência | Ordens seguidas corretamente / Total |
| Erro estimativa | abs(tempo_real - tempo_estimado) / tempo_estimado |
| Ociosidade | Tempo DISPONIVEL sem despacho / Tempo total |
