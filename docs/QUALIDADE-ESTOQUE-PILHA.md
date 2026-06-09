# 🪨 Qualidade de Material & Gestão de Pilha/Estoque

## Visão Geral

Dois módulos interligados:

1. **Qualidade de Material** — Cada subárea de origem tem composição química/granulométrica que define a qualidade do minério extraído dali
2. **Gestão de Pilha/Estoque** — Áreas de destino gerenciáveis que acumulam material de várias origens, com cálculo de qualidade média ponderada em tempo real

### Fluxo Simplificado:

```
SUBÁREA A (origem)              SUBÁREA B (origem)
Fe: 62%, SiO2: 4%              Fe: 58%, SiO2: 7%
Granul: <8mm 45%               Granul: <8mm 38%
        │                               │
        │ 3000 ton                      │ 2000 ton
        ▼                               ▼
┌──────────────────────────────────────────────────┐
│              PILHA BRITADOR (destino)              │
│                                                    │
│  Capacidade: 50.000 ton                           │
│  Estoque atual: 32.400 ton (64.8%)                │
│  Qualidade média ponderada:                       │
│    Fe: (62×3000 + 58×2000) / 5000 = 60.4%        │
│    SiO2: (4×3000 + 7×2000) / 5000 = 5.2%         │
│    Granul <8mm: (45×3000 + 38×2000) / 5000 = 42.2%│
└──────────────────────────────────────────────────┘
```

---

## 1. Qualidade de Material

### Conceito

Cada **subárea** (bancada de lavra) tem uma composição conhecida, tipicamente vinda de:
- Sondagem geológica (antes da lavra)
- Análise laboratorial (amostras periódicas)
- Modelo de blocos (software de geologia)

Essa qualidade é definida por **elementos** (Fe, SiO2, Al2O3, P, Mn...) e **faixas granulométricas** (<8mm, 8-25mm, >25mm...), todos em porcentagem.

### Modelagem

```sql
-- ═══════════════════════════════════════════════════════════════
-- ELEMENTO DE QUALIDADE (catálogo: Fe, SiO2, Al2O3, P, Mn, H2O...)
-- ═══════════════════════════════════════════════════════════════
elemento_qualidade (
    id_elemento_qualidade BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    codigo VARCHAR(20) NOT NULL,             -- 'Fe', 'SiO2', 'Al2O3', 'P', 'Mn', 'PPC', 'H2O'
    nome VARCHAR(100) NOT NULL,              -- 'Ferro', 'Sílica', 'Alumina', 'Fósforo'
    unidade VARCHAR(10) NOT NULL DEFAULT '%', -- '%', 'ppm', 'g/t'
    tipo VARCHAR(20) NOT NULL,               -- 'QUIMICO', 'GRANULOMETRICO', 'FISICO'
    
    -- Limites globais (spec do produto final)
    limite_minimo NUMERIC(10,4),             -- ex: Fe >= 60%
    limite_maximo NUMERIC(10,4),             -- ex: SiO2 <= 5%
    meta_valor NUMERIC(10,4),                -- ex: Fe meta = 64%
    
    -- Classificação para cálculo de blending
    direcao_qualidade VARCHAR(10),           -- 'MAIOR_MELHOR' (Fe), 'MENOR_MELHOR' (SiO2, P)
    
    cor VARCHAR(7),                          -- cor no gráfico
    ordem INT DEFAULT 0,                     -- ordem de exibição
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_tenant, codigo)
);

-- ═══════════════════════════════════════════════════════════════
-- FAIXA GRANULOMÉTRICA (catálogo: <8mm, 8-25mm, 25-50mm, >50mm)
-- ═══════════════════════════════════════════════════════════════
faixa_granulometrica (
    id_faixa_granulometrica BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    nome VARCHAR(50) NOT NULL,               -- '<8mm', '8-25mm', '25-50mm', '>50mm'
    limite_inferior_mm NUMERIC(8,2),         -- 0, 8, 25, 50
    limite_superior_mm NUMERIC(8,2),         -- 8, 25, 50, NULL (infinito)
    
    -- Spec do produto
    meta_percentual NUMERIC(5,2),            -- meta: 45% < 8mm
    limite_minimo_pct NUMERIC(5,2),
    limite_maximo_pct NUMERIC(5,2),
    
    cor VARCHAR(7),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_tenant, nome)
);

-- ═══════════════════════════════════════════════════════════════
-- QUALIDADE DA SUBÁREA (composição por subárea — a "verdade" geológica)
-- ═══════════════════════════════════════════════════════════════
subarea_qualidade (
    id_subarea_qualidade BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_subarea BIGINT NOT NULL REFERENCES subarea(id_subarea),
    id_elemento_qualidade BIGINT NOT NULL REFERENCES elemento_qualidade(id_elemento_qualidade),
    
    valor NUMERIC(10,4) NOT NULL,            -- ex: 62.30 (%)
    
    -- Vigência (pode mudar conforme avança a lavra)
    dt_inicio_vigencia TIMESTAMP NOT NULL,
    dt_fim_vigencia TIMESTAMP,               -- NULL = vigente
    
    -- Origem do dado
    origem VARCHAR(30) NOT NULL,             -- 'SONDAGEM', 'LABORATORIO', 'MODELO_BLOCOS', 'MANUAL'
    id_usuario_responsavel BIGINT REFERENCES usuario(id_usuario),
    observacao TEXT,
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Não pode ter 2 valores vigentes para mesmo elemento na mesma subárea
    EXCLUDE USING gist (
        id_subarea WITH =,
        id_elemento_qualidade WITH =,
        tsrange(dt_inicio_vigencia, COALESCE(dt_fim_vigencia, 'infinity')) WITH &&
    )
);

CREATE INDEX idx_sq_subarea ON subarea_qualidade(id_subarea, id_elemento_qualidade);

-- ═══════════════════════════════════════════════════════════════
-- GRANULOMETRIA DA SUBÁREA (distribuição por faixa)
-- ═══════════════════════════════════════════════════════════════
subarea_granulometria (
    id_subarea_granulometria BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_subarea BIGINT NOT NULL REFERENCES subarea(id_subarea),
    id_faixa_granulometrica BIGINT NOT NULL REFERENCES faixa_granulometrica(id_faixa_granulometrica),
    
    percentual NUMERIC(5,2) NOT NULL,        -- ex: 45.00 (%)
    -- CHECK: soma de todos os percentuais da subárea = 100%
    
    dt_inicio_vigencia TIMESTAMP NOT NULL,
    dt_fim_vigencia TIMESTAMP,
    origem VARCHAR(30) NOT NULL,
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    
    EXCLUDE USING gist (
        id_subarea WITH =,
        id_faixa_granulometrica WITH =,
        tsrange(dt_inicio_vigencia, COALESCE(dt_fim_vigencia, 'infinity')) WITH &&
    )
);
```

### Wizard de Importação

Para carregar qualidade em massa (vem do geólogo em Excel/CSV):

```sql
-- ═══════════════════════════════════════════════════════════════
-- IMPORTAÇÃO (controle de uploads em massa)
-- ═══════════════════════════════════════════════════════════════
importacao (
    id_importacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    tipo VARCHAR(30) NOT NULL,               -- 'AREA', 'SUBAREA', 'QUALIDADE', 'GRANULOMETRIA', 'OPERADOR', 'EQUIPAMENTO'
    
    -- Arquivo
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT,
    formato VARCHAR(10) NOT NULL,            -- 'CSV', 'XLSX', 'JSON'
    
    -- Resultado
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    -- PENDENTE, VALIDANDO, VALIDADO, IMPORTANDO, CONCLUIDA, ERRO, CANCELADA
    
    total_linhas INT,
    linhas_validas INT,
    linhas_erro INT,
    linhas_importadas INT,
    
    -- Erros detalhados
    erros JSONB,                             -- [{"linha": 5, "campo": "Fe", "erro": "Valor > 100%"}]
    
    -- Mapeamento de colunas (wizard step 2)
    mapeamento_colunas JSONB,               -- {"col_A": "codigo_subarea", "col_B": "Fe", "col_C": "SiO2"}
    
    -- Configuração
    config JSONB,                            -- {"separador": ";", "decimal": ",", "encoding": "utf-8"}
    
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_conclusao TIMESTAMP
);

-- Linhas individuais da importação (para review antes de confirmar)
importacao_linha (
    id_importacao_linha BIGSERIAL PRIMARY KEY,
    id_importacao BIGINT NOT NULL REFERENCES importacao(id_importacao),
    
    numero_linha INT NOT NULL,
    dados_brutos JSONB NOT NULL,             -- dados originais da linha
    dados_mapeados JSONB,                    -- dados após mapeamento
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    -- PENDENTE, VALIDO, ERRO, IMPORTADO, IGNORADO
    
    erros JSONB,                             -- erros de validação desta linha
    id_registro_criado BIGINT               -- PK do registro criado após import
);

CREATE INDEX idx_imp_linha_import ON importacao_linha(id_importacao, status);
```

### Fluxo do Wizard de Importação

```
┌──────────────────────────────────────────────────────────────────────┐
│ WIZARD DE IMPORTAÇÃO                                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Step 1: UPLOAD DO ARQUIVO                                           │
│   ┌─────────────────────────────────────────────┐                   │
│   │  📁 Arraste ou selecione (CSV, XLSX)        │                   │
│   │     Encoding: [UTF-8 ▾]  Separador: [; ▾]  │                   │
│   └─────────────────────────────────────────────┘                   │
│                                                                      │
│ Step 2: MAPEAMENTO DE COLUNAS                                       │
│   Arquivo             →    Sistema                                   │
│   ┌──────────┐            ┌──────────────────────┐                  │
│   │ Coluna A │  ────────▶ │ Código Subárea       │                  │
│   │ Coluna B │  ────────▶ │ Fe (%)               │                  │
│   │ Coluna C │  ────────▶ │ SiO2 (%)             │                  │
│   │ Coluna D │  ────────▶ │ Al2O3 (%)            │                  │
│   │ Coluna E │  ────────▶ │ P (%)                │                  │
│   │ Coluna F │  ────────▶ │ < 8mm (%)            │                  │
│   │ Coluna G │  ────────▶ │ 8-25mm (%)           │                  │
│   │ Coluna H │  ────────▶ │ (ignorar)            │                  │
│   └──────────┘            └──────────────────────┘                  │
│                                                                      │
│ Step 3: VALIDAÇÃO (preview)                                         │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │ # │ Subárea │ Fe    │ SiO2  │ Al2O3 │ P     │ Status     │    │
│   │ 1 │ BN-01   │ 62.30 │ 4.10  │ 2.80  │ 0.04  │ ✅ Válido  │    │
│   │ 2 │ BN-02   │ 58.50 │ 7.20  │ 3.10  │ 0.06  │ ✅ Válido  │    │
│   │ 3 │ XX-99   │ 45.00 │ 12.00 │ 5.00  │ 0.08  │ ⚠️ Subárea│    │
│   │   │         │       │       │       │       │  não existe│    │
│   │ 4 │ BN-03   │ 110.0 │ 3.50  │ 2.40  │ 0.03  │ ❌ Fe>100% │    │
│   └────────────────────────────────────────────────────────────┘    │
│   ✅ 2 válidos  ⚠️ 1 aviso  ❌ 1 erro                              │
│                                                                      │
│ Step 4: CONFIRMAÇÃO E IMPORTAÇÃO                                    │
│   [Importar apenas válidos]  [Corrigir e revalidar]  [Cancelar]     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Gestão de Pilha / Estoque

### Conceito

Uma **Pilha** (ou Estoque) é uma área de destino que:
- Acumula material de várias origens ao longo do tempo
- Tem uma **capacidade máxima** (ton)
- Tem **qualidade calculada** = média ponderada da qualidade de cada carga que entrou
- Pode ter **saída** (retomada — alimentação da usina)
- Precisa ser monitorada em tempo real: quanto tem? qual a qualidade agora?

### Modelagem

```sql
-- ═══════════════════════════════════════════════════════════════
-- PILHA / ESTOQUE (área gerenciável com capacidade)
-- ═══════════════════════════════════════════════════════════════
pilha_estoque (
    id_pilha_estoque BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area BIGINT NOT NULL REFERENCES area(id_area),  -- área de destino associada
    
    nome VARCHAR(100) NOT NULL,              -- 'Pilha Britador', 'Estoque ROM', 'Pilha Pulmão'
    codigo VARCHAR(30),
    
    -- Capacidade
    capacidade_max_ton NUMERIC(14,2) NOT NULL,  -- capacidade máxima em toneladas
    capacidade_max_m3 NUMERIC(14,2),            -- em volume (se aplicável)
    
    -- Estado atual (atualizado por trigger/cron a cada ciclo)
    estoque_atual_ton NUMERIC(14,2) NOT NULL DEFAULT 0,
    estoque_atual_pct NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN capacidade_max_ton > 0 
             THEN (estoque_atual_ton / capacidade_max_ton * 100)
             ELSE 0 END
    ) STORED,
    
    -- Limites operacionais
    nivel_minimo_ton NUMERIC(14,2),          -- abaixo = alerta (risco parar usina)
    nivel_maximo_ton NUMERIC(14,2),          -- acima = alerta (risco overflow)
    nivel_critico_ton NUMERIC(14,2),         -- emergência
    
    -- Tipo de operação
    tipo VARCHAR(20) NOT NULL,               -- 'ROM', 'PRODUTO', 'ESTERIL', 'PULMAO', 'BLENDING'
    permite_entrada BOOLEAN DEFAULT true,    -- aceita material
    permite_saida BOOLEAN DEFAULT true,      -- permite retomada
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- QUALIDADE ATUAL DA PILHA (snapshot em tempo real)
-- Recalculada a cada entrada/saída
-- ═══════════════════════════════════════════════════════════════
pilha_qualidade_atual (
    id_pilha_qualidade_atual BIGSERIAL PRIMARY KEY,
    id_pilha_estoque BIGINT NOT NULL REFERENCES pilha_estoque(id_pilha_estoque),
    id_elemento_qualidade BIGINT NOT NULL REFERENCES elemento_qualidade(id_elemento_qualidade),
    
    valor_medio_ponderado NUMERIC(10,4) NOT NULL,  -- qualidade atual (média ponderada)
    
    -- Comparação com spec
    dentro_spec BOOLEAN,                     -- valor está entre min e max do elemento?
    desvio_meta NUMERIC(10,4),              -- valor - meta (positivo = acima, negativo = abaixo)
    
    dt_ultimo_calculo TIMESTAMP NOT NULL,
    
    UNIQUE(id_pilha_estoque, id_elemento_qualidade)
);

-- ═══════════════════════════════════════════════════════════════
-- MOVIMENTAÇÃO DA PILHA (cada entrada ou saída)
-- ═══════════════════════════════════════════════════════════════
pilha_movimentacao (
    id_pilha_movimentacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_pilha_estoque BIGINT NOT NULL REFERENCES pilha_estoque(id_pilha_estoque),
    
    tipo VARCHAR(10) NOT NULL,               -- 'ENTRADA', 'SAIDA', 'AJUSTE'
    
    -- Origem/Destino
    id_area_origem BIGINT REFERENCES area(id_area),       -- de onde veio (para ENTRADA)
    id_subarea_origem BIGINT REFERENCES subarea(id_subarea), -- subárea específica
    id_area_destino_saida BIGINT REFERENCES area(id_area),  -- pra onde foi (para SAIDA)
    
    -- Quantidade
    toneladas NUMERIC(12,2) NOT NULL,
    
    -- Vínculo com ciclo (se veio de transporte)
    id_ciclo_operacional BIGINT REFERENCES ciclo_operacional(id_ciclo_operacional),
    
    -- Estoque resultante (snapshot após esta movimentação)
    estoque_apos_ton NUMERIC(14,2) NOT NULL,
    
    -- Qualidade da carga específica que entrou
    -- (para posterior cálculo da média ponderada)
    qualidade_carga JSONB,                   -- {"Fe": 62.3, "SiO2": 4.1, "Al2O3": 2.8}
    
    id_usuario BIGINT REFERENCES usuario(id_usuario),
    dt_movimentacao TIMESTAMP NOT NULL,
    observacao TEXT,
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pilha_mov_pilha ON pilha_movimentacao(id_pilha_estoque, dt_movimentacao DESC);
CREATE INDEX idx_pilha_mov_ciclo ON pilha_movimentacao(id_ciclo_operacional) WHERE id_ciclo_operacional IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- HISTÓRICO DE QUALIDADE DA PILHA (série temporal)
-- Para gráficos de evolução da qualidade ao longo do tempo
-- ═══════════════════════════════════════════════════════════════
pilha_qualidade_historico (
    id_pilha_qualidade_historico BIGSERIAL PRIMARY KEY,
    id_pilha_estoque BIGINT NOT NULL REFERENCES pilha_estoque(id_pilha_estoque),
    
    -- Snapshot periódico (a cada hora ou a cada N movimentações)
    estoque_momento_ton NUMERIC(14,2) NOT NULL,
    qualidade_momento JSONB NOT NULL,        -- {"Fe": 60.4, "SiO2": 5.2, "Al2O3": 3.0}
    granulometria_momento JSONB,             -- {"<8mm": 42.2, "8-25mm": 35.1, ">25mm": 22.7}
    
    dt_registro TIMESTAMP NOT NULL
) PARTITION BY RANGE (dt_registro);  -- particionar por mês (alta volumetria)

CREATE INDEX idx_pqh_pilha ON pilha_qualidade_historico(id_pilha_estoque, dt_registro DESC);
```

### Cálculo da Média Ponderada

```sql
-- Recalcular qualidade da pilha após cada entrada
-- Fórmula: novo_valor = (valor_atual × estoque_antes + valor_carga × ton_carga) / estoque_depois

CREATE OR REPLACE FUNCTION fn_recalcular_qualidade_pilha(
    p_id_pilha BIGINT,
    p_toneladas NUMERIC,
    p_qualidade_carga JSONB,
    p_tipo VARCHAR  -- 'ENTRADA' ou 'SAIDA'
) RETURNS VOID AS $$
DECLARE
    v_estoque_antes NUMERIC;
    v_estoque_depois NUMERIC;
    v_elemento RECORD;
    v_valor_carga NUMERIC;
    v_valor_atual NUMERIC;
    v_novo_valor NUMERIC;
BEGIN
    -- Pegar estoque atual
    SELECT estoque_atual_ton INTO v_estoque_antes FROM pilha_estoque WHERE id_pilha_estoque = p_id_pilha;
    
    IF p_tipo = 'ENTRADA' THEN
        v_estoque_depois := v_estoque_antes + p_toneladas;
    ELSE
        v_estoque_depois := v_estoque_antes - p_toneladas;
    END IF;
    
    -- Para cada elemento que tem valor na carga
    FOR v_elemento IN 
        SELECT pqa.id_elemento_qualidade, pqa.valor_medio_ponderado, eq.codigo
        FROM pilha_qualidade_atual pqa
        JOIN elemento_qualidade eq ON eq.id_elemento_qualidade = pqa.id_elemento_qualidade
        WHERE pqa.id_pilha_estoque = p_id_pilha
    LOOP
        v_valor_atual := v_elemento.valor_medio_ponderado;
        v_valor_carga := (p_qualidade_carga ->> v_elemento.codigo)::NUMERIC;
        
        IF v_valor_carga IS NOT NULL AND v_estoque_depois > 0 THEN
            IF p_tipo = 'ENTRADA' THEN
                -- Média ponderada: (atual×antes + carga×tons) / depois
                v_novo_valor := (v_valor_atual * v_estoque_antes + v_valor_carga * p_toneladas) / v_estoque_depois;
            ELSE
                -- Na saída: a qualidade da pilha NÃO muda (saiu com a qualidade da pilha)
                v_novo_valor := v_valor_atual;
            END IF;
            
            -- Atualizar
            UPDATE pilha_qualidade_atual 
            SET valor_medio_ponderado = v_novo_valor,
                dt_ultimo_calculo = NOW(),
                dentro_spec = (v_novo_valor BETWEEN 
                    (SELECT limite_minimo FROM elemento_qualidade WHERE id_elemento_qualidade = v_elemento.id_elemento_qualidade)
                    AND 
                    (SELECT limite_maximo FROM elemento_qualidade WHERE id_elemento_qualidade = v_elemento.id_elemento_qualidade)
                ),
                desvio_meta = v_novo_valor - (SELECT meta_valor FROM elemento_qualidade WHERE id_elemento_qualidade = v_elemento.id_elemento_qualidade)
            WHERE id_pilha_estoque = p_id_pilha 
              AND id_elemento_qualidade = v_elemento.id_elemento_qualidade;
        END IF;
    END LOOP;
    
    -- Atualizar estoque
    UPDATE pilha_estoque SET estoque_atual_ton = v_estoque_depois, dt_alteracao = NOW()
    WHERE id_pilha_estoque = p_id_pilha;
END;
$$ LANGUAGE plpgsql;
```

### Integração com Ciclo Operacional

Quando um ciclo é finalizado (descarga confirmada), o sistema:

```
1. Identifica área de destino do ciclo
2. Verifica se é uma pilha_estoque
3. Se sim:
   a. Busca qualidade da subárea de origem (subarea_qualidade)
   b. Calcula toneladas (ciclo.carga_ton)
   c. INSERT pilha_movimentacao (ENTRADA)
   d. Chama fn_recalcular_qualidade_pilha()
   e. Se estoque > nivel_maximo → alerta
   f. Se estoque < nivel_minimo → alerta
```

---

## Tela: Dashboard da Pilha

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🪨 Gestão de Pilhas & Estoque                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─── Visão Geral ───────────────────────────────────────────────────┐   │
│ │                                                                    │   │
│ │  Pilha Britador     ████████████████████░░░░░░░  64.8%            │   │
│ │  32.400 / 50.000 t  Fe: 60.4% ✅  SiO2: 5.2% ⚠️  P: 0.05% ✅    │   │
│ │                                                                    │   │
│ │  Estoque ROM        ████████████░░░░░░░░░░░░░░░  42.0%            │   │
│ │  21.000 / 50.000 t  Fe: 58.1% ⚠️  SiO2: 6.8% ❌  P: 0.07% ✅    │   │
│ │                                                                    │   │
│ │  Pilha Pulmão       ██████████████████████████░░  88.5% ⚠️        │   │
│ │  44.250 / 50.000 t  Fe: 63.2% ✅  SiO2: 3.1% ✅  P: 0.03% ✅    │   │
│ │                                                                    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── Pilha Selecionada: Britador ───────────────────────────────────┐   │
│ │                                                                    │   │
│ │  ┌── Qualidade Atual vs. Spec ────────────────────────────────┐   │   │
│ │  │ Elemento │ Atual  │ Meta   │ Min    │ Máx    │ Status      │   │   │
│ │  │ Fe       │ 60.4%  │ 64.0%  │ 60.0%  │ 68.0%  │ ✅ Spec    │   │   │
│ │  │ SiO2     │ 5.2%   │ 4.0%   │ 0%     │ 5.0%   │ ⚠️ Acima   │   │   │
│ │  │ Al2O3    │ 3.0%   │ 2.5%   │ 0%     │ 3.5%   │ ✅ Spec    │   │   │
│ │  │ P        │ 0.05%  │ 0.04%  │ 0%     │ 0.06%  │ ✅ Spec    │   │   │
│ │  │ Mn       │ 0.18%  │ 0.15%  │ 0%     │ 0.25%  │ ✅ Spec    │   │   │
│ │  └───────────────────────────────────────────────────────────────┘│   │
│ │                                                                    │   │
│ │  ┌── Granulometria ───────────────────────────────────────────┐   │   │
│ │  │ < 8mm:   42.2% (meta: 45%)  ████████████████░░ -2.8%      │   │   │
│ │  │ 8-25mm:  35.1% (meta: 35%)  ██████████████░░░░ +0.1%      │   │   │
│ │  │ > 25mm:  22.7% (meta: 20%)  ████████████░░░░░░ +2.7% ⚠️   │   │   │
│ │  └────────────────────────────────────────────────────────────┘   │   │
│ │                                                                    │   │
│ │  ┌── Evolução Fe% (últimas 72h) ──────────────────────────────┐  │   │
│ │  │  64 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ META ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │  │   │
│ │  │  62 ─────╲                                                  │  │   │
│ │  │  60 ──────╲───────╱──────╲────────── ATUAL                 │  │   │
│ │  │  58 ───────╲────╱─────────╲──────── MIN ─ ─ ─ ─ ─ ─ ─ ─   │  │   │
│ │  │     06h   12h   18h   00h   06h   12h                      │  │   │
│ │  └────────────────────────────────────────────────────────────┘   │   │
│ │                                                                    │   │
│ │  ┌── Origens que alimentam (hoje) ─────────────────────────────┐  │   │
│ │  │ Subárea    │ Tons  │ Fe    │ SiO2  │ Ciclos │ Contribuição │  │   │
│ │  │ BN-01      │ 3.200 │ 62.3% │ 4.1%  │ 36     │ 42%          │  │   │
│ │  │ BN-02      │ 2.100 │ 58.5% │ 7.2%  │ 24     │ 28%          │  │   │
│ │  │ BS-01      │ 1.500 │ 61.0% │ 4.8%  │ 17     │ 20%          │  │   │
│ │  │ BN-03      │ 800   │ 59.2% │ 5.5%  │ 9      │ 10%          │  │   │
│ │  └────────────────────────────────────────────────────────────┘   │   │
│ │                                                                    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```
# -- Elementos de Qualidade --
GET    /api/elemento-qualidade                   -- listar elementos (Fe, SiO2...)
POST   /api/elemento-qualidade                   -- criar elemento
PUT    /api/elemento-qualidade/:id               -- editar (limites, meta)

# -- Faixas Granulométricas --
GET    /api/faixa-granulometrica                 -- listar faixas
POST   /api/faixa-granulometrica                 -- criar faixa
PUT    /api/faixa-granulometrica/:id             -- editar

# -- Qualidade por Subárea --
GET    /api/subarea/:id/qualidade                -- qualidade atual da subárea
POST   /api/subarea/:id/qualidade                -- cadastrar/atualizar valores
GET    /api/subarea/:id/granulometria            -- distribuição granulométrica
POST   /api/subarea/:id/granulometria            -- cadastrar distribuição

# -- Importação (Wizard) --
POST   /api/importacao/upload                    -- step 1: upload arquivo
POST   /api/importacao/:id/mapear                -- step 2: definir mapeamento
POST   /api/importacao/:id/validar               -- step 3: validar dados
GET    /api/importacao/:id/preview               -- step 3: preview com erros
POST   /api/importacao/:id/executar              -- step 4: importar válidos
GET    /api/importacao                           -- histórico de importações

# -- Pilha / Estoque --
GET    /api/pilha-estoque                        -- listar pilhas (com estoque atual)
POST   /api/pilha-estoque                        -- criar pilha
PUT    /api/pilha-estoque/:id                    -- editar (capacidade, limites)
GET    /api/pilha-estoque/:id                    -- detalhe completo

# -- Qualidade da Pilha --
GET    /api/pilha-estoque/:id/qualidade          -- qualidade atual (todos elementos)
GET    /api/pilha-estoque/:id/qualidade/historico -- série temporal
GET    /api/pilha-estoque/:id/origens            -- de onde veio (breakdown por subárea)

# -- Movimentações --
GET    /api/pilha-estoque/:id/movimentacoes      -- histórico entrada/saída
POST   /api/pilha-estoque/:id/entrada-manual     -- entrada manual (ajuste)
POST   /api/pilha-estoque/:id/saida-manual       -- saída manual (retomada)
POST   /api/pilha-estoque/:id/ajuste             -- ajuste inventário

# -- Dashboard --
GET    /api/pilha-estoque/dashboard              -- visão geral todas as pilhas
GET    /api/pilha-estoque/alertas                -- pilhas fora de spec ou nível crítico
```

---

## Permissões

| Ação | Admin | Geólogo | Supervisor | Operador |
|------|:---:|:---:|:---:|:---:|
| Config elementos/faixas | ✅ | ✅ | ❌ | ❌ |
| Editar qualidade subárea | ✅ | ✅ | ❌ | ❌ |
| Importar dados (wizard) | ✅ | ✅ | ❌ | ❌ |
| Ver qualidade pilha | ✅ | ✅ | ✅ | ❌ |
| Entrada/saída manual | ✅ | ❌ | ✅ | ❌ |
| Ajuste inventário | ✅ | ❌ | ❌ | ❌ |

---

## Tabelas adicionadas

| # | Tabela | Domínio |
|---|--------|---------|
| 1 | elemento_qualidade | Qualidade |
| 2 | faixa_granulometrica | Qualidade |
| 3 | subarea_qualidade | Qualidade |
| 4 | subarea_granulometria | Qualidade |
| 5 | importacao | Importação |
| 6 | importacao_linha | Importação |
| 7 | pilha_estoque | Estoque/Pilha |
| 8 | pilha_qualidade_atual | Estoque/Pilha |
| 9 | pilha_movimentacao | Estoque/Pilha |
| 10 | pilha_qualidade_historico | Estoque/Pilha |

**Total acumulado: ~107 tabelas**

---

## Funcionalidades (MODULES.md)

| # | Módulo | Código | Descrição |
|---|--------|--------|-----------|
| 27 | Qualidade | QUALIDADE_CONFIG | Elementos, faixas, limites |
| 28 | Qualidade | QUALIDADE_SUBAREA | Composição por subárea de lavra |
| 29 | Qualidade | QUALIDADE_PILHA | Dashboard de pilha com média ponderada |
| 30 | Importação | IMPORTACAO_WIZARD | Upload e importação guiada de dados |
