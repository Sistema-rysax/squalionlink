# 🔄 Ciclo Operacional

## Conceito

O **Ciclo Operacional** é a unidade fundamental de produtividade em operações de mina/terraplanagem. Representa o percurso completo que um equipamento de transporte faz:

```
FILA CARGA → CARGA → TRANSPORTE CHEIO → FILA DESCARGA → DESCARGA → TRANSPORTE VAZIO → (volta ao início)
```

Cada etapa do ciclo é cronometrada, geolocalizada e associada a áreas (origem/destino). O sistema calcula automaticamente tempos, produtividade, e identifica gargalos.

## Por que é importante?

| Indicador | Calculado a partir do ciclo |
|-----------|---------------------------|
| Produção (ton/h) | Carga × ciclos / hora |
| Tempo médio de ciclo | Soma das etapas |
| Fila média | Tempo em fila carga + fila descarga |
| Tempo de manobra | Carga + descarga |
| DMT (Distância Média de Transporte) | Distância transporte cheio |
| Ociosidade | Tempo em fila vs. tempo total |
| Eficiência de frota | Ciclos reais vs. ciclos possíveis |
| Match frota | Caminhões vs. escavadeiras (balanceamento) |

## Etapas do Ciclo

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CICLO COMPLETO                                │
│                                                                      │
│  ┌─────────┐   ┌───────┐   ┌──────────────┐   ┌─────────────┐      │
│  │  FILA   │──▶│ CARGA │──▶│  TRANSPORTE  │──▶│    FILA     │      │
│  │  CARGA  │   │       │   │    CHEIO     │   │  DESCARGA   │      │
│  └─────────┘   └───────┘   └──────────────┘   └──────┬──────┘      │
│                                                       │              │
│  ┌──────────────────────────────────────────┐   ┌─────▼──────┐      │
│  │          TRANSPORTE VAZIO                │◀──│  DESCARGA  │      │
│  │          (retorno)                       │   │            │      │
│  └──────────────────────────────────────────┘   └────────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

| Etapa | Tipo Área | Detecção |
|-------|-----------|----------|
| Fila Carga | ORIGEM | Equipamento entra na geofence de carga e está parado/lento |
| Carga | ORIGEM | Equipamento está sendo carregado (velocidade ~0, escavadeira próxima) |
| Transporte Cheio | Rota | Saiu da origem, direção ao destino |
| Fila Descarga | DESTINO | Entrou na geofence de descarga e está parado/lento |
| Descarga | DESTINO | Basculamento detectado (sensor ou tempo) |
| Transporte Vazio | Rota | Saiu do destino, direção à origem |

## Modelagem

### Tabelas

```sql
-- Definição das etapas possíveis (configurável por tenant)
ciclo_etapa_definicao (
    id_ciclo_etapa_definicao BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    codigo VARCHAR(30) UNIQUE NOT NULL,      -- 'FILA_CARGA','CARGA','TRANSP_CHEIO','FILA_DESCARGA','DESCARGA','TRANSP_VAZIO','MANOBRA_CARGA','MANOBRA_DESCARGA'
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,               -- 'FILA','OPERACAO','TRANSPORTE','MANOBRA'
    classificacao VARCHAR(20) NOT NULL,      -- 'PRODUTIVO','IMPRODUTIVO','NEUTRO'
    cor VARCHAR(7),
    icone VARCHAR(50),
    ordem INT NOT NULL,                      -- sequência no ciclo
    ativo BOOLEAN NOT NULL DEFAULT true
)

-- Configuração do ciclo por modelo/grupo de equipamento
ciclo_configuracao (
    id_ciclo_configuracao BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_modelo_equipamento BIGINT FK,         -- config por modelo
    id_grupo_equipamento BIGINT FK,          -- ou por grupo (um dos dois)
    nome VARCHAR(100) NOT NULL,              -- 'Ciclo Padrão Caminhão'
    
    -- Parâmetros de detecção automática
    velocidade_carga_max NUMERIC(5,1) DEFAULT 3,       -- km/h (abaixo = considerado parado/carregando)
    velocidade_descarga_max NUMERIC(5,1) DEFAULT 3,
    velocidade_fila_max NUMERIC(5,1) DEFAULT 5,        -- km/h (abaixo em área de carga = fila)
    tempo_minimo_carga_seg INT DEFAULT 30,             -- mínimo para considerar carga válida
    tempo_minimo_descarga_seg INT DEFAULT 15,
    tempo_maximo_carga_seg INT DEFAULT 600,            -- máximo (acima = anomalia)
    tempo_maximo_fila_seg INT DEFAULT 1800,            -- 30min max fila
    distancia_minima_ciclo_km NUMERIC(6,2) DEFAULT 0.5, -- mínimo para considerar ciclo válido
    
    -- Carga padrão
    carga_nominal_ton NUMERIC(10,2),                   -- tonelagem padrão do modelo
    
    -- Detecção
    modo_deteccao VARCHAR(20) NOT NULL DEFAULT 'GPS',  -- 'GPS','SENSOR','HIBRIDO'
    -- GPS: detecta por geofence + velocidade
    -- SENSOR: detecta por sensor de basculamento/carga
    -- HIBRIDO: combina ambos
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL,
    dt_alteracao TIMESTAMP NOT NULL
)

-- Ciclo operacional (instância de um ciclo completo)
ciclo_operacional (
    id_ciclo_operacional BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,       -- caminhão
    id_operador BIGINT FK,                   -- operador do caminhão
    id_equipamento_carga BIGINT FK,          -- escavadeira/carregadeira que carregou
    id_operador_carga BIGINT FK,             -- operador da escavadeira
    id_turno BIGINT FK,
    
    -- Áreas
    id_area_origem BIGINT NOT NULL FK,       -- onde carregou (area tipo ORIGEM)
    id_subarea_origem BIGINT FK,             -- bancada/frente específica
    id_area_destino BIGINT NOT NULL FK,      -- onde descarregou (area tipo DESTINO)
    id_subarea_destino BIGINT FK,
    id_rota BIGINT FK,                       -- rota utilizada (se mapeada)
    
    -- Material
    id_material BIGINT FK,                   -- minério, estéril, etc.
    carga_ton NUMERIC(10,2),                 -- tonelagem real (se balança/sensor)
    carga_estimada_ton NUMERIC(10,2),        -- estimada (nominal do modelo ou fator de enchimento)
    
    -- Status do ciclo
    status VARCHAR(20) NOT NULL,             -- 'EM_ANDAMENTO','COMPLETO','INCOMPLETO','CANCELADO','ANOMALIA'
    numero_ciclo INT,                        -- sequência do ciclo naquele turno/dia
    
    -- Tempos (em segundos) — calculados ao fechar
    tempo_fila_carga_seg INT,
    tempo_manobra_carga_seg INT,
    tempo_carga_seg INT,
    tempo_transporte_cheio_seg INT,
    tempo_fila_descarga_seg INT,
    tempo_manobra_descarga_seg INT,
    tempo_descarga_seg INT,
    tempo_transporte_vazio_seg INT,
    tempo_total_ciclo_seg INT,               -- soma de tudo
    
    -- Distâncias (km)
    distancia_cheio_km NUMERIC(8,2),
    distancia_vazio_km NUMERIC(8,2),
    distancia_total_km NUMERIC(8,2),
    
    -- Velocidades médias
    velocidade_media_cheio NUMERIC(5,1),
    velocidade_media_vazio NUMERIC(5,1),
    
    -- Horímetro
    horimetro_inicio NUMERIC(12,2),
    horimetro_fim NUMERIC(12,2),
    
    -- Timestamps (UTC)
    dt_inicio_ciclo TIMESTAMP NOT NULL,      -- início da fila de carga
    dt_fim_ciclo TIMESTAMP,                  -- fim do transporte vazio (= início do próximo)
    dt_registro TIMESTAMP NOT NULL,
    dt_alteracao TIMESTAMP NOT NULL
) PARTITION BY RANGE (dt_registro);          -- particionar por mês

-- Etapas individuais do ciclo (detalhe de cada fase)
ciclo_etapa (
    id_ciclo_etapa BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_ciclo_operacional BIGINT NOT NULL FK,
    id_ciclo_etapa_definicao BIGINT NOT NULL FK,  -- qual etapa é
    
    -- Posição
    latitude_inicio NUMERIC(10,7),
    longitude_inicio NUMERIC(10,7),
    latitude_fim NUMERIC(10,7),
    longitude_fim NUMERIC(10,7),
    id_area BIGINT FK,                       -- área onde ocorreu
    
    -- Métricas
    duracao_seg INT NOT NULL,
    distancia_km NUMERIC(8,2),
    velocidade_media NUMERIC(5,1),
    velocidade_maxima NUMERIC(5,1),
    
    -- Timestamps
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP NOT NULL,
    
    -- Qualidade
    origem_dado VARCHAR(20) NOT NULL,        -- 'AUTOMATICO','MANUAL','CORRIGIDO'
    confianca NUMERIC(3,2),                  -- 0.00 a 1.00 (qualidade da detecção)
    
    dt_registro TIMESTAMP NOT NULL
) PARTITION BY RANGE (dt_registro);

-- Material transportado (catálogo)
material (
    id_material BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    nome VARCHAR(100) NOT NULL,              -- 'Minério de Ferro', 'Estéril', 'Fosfato'
    codigo VARCHAR(20),
    densidade_ton_m3 NUMERIC(4,2),           -- para cálculo de volume → peso
    cor VARCHAR(7),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL
)

-- Fator de enchimento (% da caçamba preenchida — varia por material e operador)
fator_enchimento (
    id_fator_enchimento BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_modelo_equipamento BIGINT NOT NULL FK,
    id_material BIGINT FK,                   -- NULL = padrão para qualquer material
    fator NUMERIC(4,2) NOT NULL DEFAULT 0.85, -- 85% preenchimento padrão
    ativo BOOLEAN NOT NULL DEFAULT true
)

-- Parada dentro do ciclo (quando o caminhão para fora do esperado)
ciclo_parada (
    id_ciclo_parada BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_ciclo_operacional BIGINT NOT NULL FK,
    id_ciclo_etapa BIGINT FK,                -- em qual etapa parou
    motivo VARCHAR(50),                      -- 'SINALEIRO','PISTA_INTERDITADA','MECANICO','DESCONHECIDO'
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    duracao_seg INT NOT NULL,
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP NOT NULL,
    dt_registro TIMESTAMP NOT NULL
)

-- Resumo diário de produção por equipamento (materializado)
ciclo_resumo_diario (
    id_ciclo_resumo_diario BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,
    id_area_origem BIGINT FK,
    id_area_destino BIGINT FK,
    id_material BIGINT FK,
    id_turno BIGINT FK,
    data_referencia DATE NOT NULL,           -- dia (em UTC)
    
    -- Contadores
    total_ciclos INT NOT NULL DEFAULT 0,
    total_ciclos_completos INT NOT NULL DEFAULT 0,
    total_ciclos_incompletos INT NOT NULL DEFAULT 0,
    
    -- Produção
    carga_total_ton NUMERIC(12,2) DEFAULT 0,
    carga_media_ton NUMERIC(10,2),
    
    -- Tempos médios (segundos)
    tempo_medio_ciclo_seg INT,
    tempo_medio_fila_carga_seg INT,
    tempo_medio_carga_seg INT,
    tempo_medio_transporte_cheio_seg INT,
    tempo_medio_fila_descarga_seg INT,
    tempo_medio_descarga_seg INT,
    tempo_medio_transporte_vazio_seg INT,
    
    -- Distâncias
    dmt_medio_km NUMERIC(8,2),              -- Distância Média de Transporte
    distancia_total_km NUMERIC(10,2),
    
    -- Velocidades
    velocidade_media_cheio NUMERIC(5,1),
    velocidade_media_vazio NUMERIC(5,1),
    
    -- Eficiência
    horas_produtivas NUMERIC(6,2),
    horas_improdutivas NUMERIC(6,2),        -- fila, espera
    percentual_fila NUMERIC(5,2),           -- % do tempo em fila
    
    dt_calculo TIMESTAMP NOT NULL,           -- quando foi calculado/atualizado
    UNIQUE(id_tenant, id_equipamento, id_turno, data_referencia, id_area_origem, id_area_destino, id_material)
)

-- Resumo diário de produção por FRENTE/ESCAVADEIRA
ciclo_resumo_frente (
    id_ciclo_resumo_frente BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento_carga BIGINT NOT NULL FK, -- escavadeira
    id_area_origem BIGINT NOT NULL FK,       -- frente de lavra
    id_turno BIGINT FK,
    data_referencia DATE NOT NULL,
    
    -- Produção da frente
    total_ciclos INT NOT NULL DEFAULT 0,
    total_caminhoes_atendidos INT DEFAULT 0,
    carga_total_ton NUMERIC(12,2) DEFAULT 0,
    
    -- Tempos médios
    tempo_medio_carga_seg INT,               -- quanto tempo para carregar cada caminhão
    tempo_entre_caminhoes_seg INT,           -- tempo ocioso entre caminhões
    
    -- Eficiência
    horas_operacao NUMERIC(6,2),
    horas_ociosa NUMERIC(6,2),              -- esperando caminhão
    taxa_utilizacao NUMERIC(5,2),           -- % do tempo carregando
    
    dt_calculo TIMESTAMP NOT NULL,
    UNIQUE(id_tenant, id_equipamento_carga, id_turno, data_referencia, id_area_origem)
)
```

### Índices

```sql
-- Ciclo operacional
CREATE INDEX idx_ciclo_oper_tenant_equip_dt ON ciclo_operacional (id_tenant, id_equipamento, dt_inicio_ciclo DESC);
CREATE INDEX idx_ciclo_oper_tenant_dt ON ciclo_operacional (id_tenant, dt_inicio_ciclo DESC);
CREATE INDEX idx_ciclo_oper_tenant_origem ON ciclo_operacional (id_tenant, id_area_origem, dt_inicio_ciclo DESC);
CREATE INDEX idx_ciclo_oper_tenant_carga ON ciclo_operacional (id_tenant, id_equipamento_carga, dt_inicio_ciclo DESC);
CREATE INDEX idx_ciclo_oper_status ON ciclo_operacional (id_tenant, status) WHERE status = 'EM_ANDAMENTO';

-- Etapas
CREATE INDEX idx_ciclo_etapa_ciclo ON ciclo_etapa (id_ciclo_operacional, id_ciclo_etapa_definicao);

-- Resumos
CREATE INDEX idx_ciclo_resumo_diario_dt ON ciclo_resumo_diario (id_tenant, data_referencia DESC);
CREATE INDEX idx_ciclo_resumo_frente_dt ON ciclo_resumo_frente (id_tenant, data_referencia DESC);
```

## Engine de Detecção Automática de Ciclo

### Máquina de Estados

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
    ┌───────────────────────┐                            │
    │    AGUARDANDO_CICLO   │ ◄── equipamento sem ciclo   │
    │    (idle/sem rota)    │     ativo no momento        │
    └──────────┬────────────┘                            │
               │ Entra em geofence ORIGEM                │
               ▼                                         │
    ┌───────────────────────┐                            │
    │     FILA_CARGA        │ vel < fila_max + em ORIGEM  │
    │                       │                            │
    └──────────┬────────────┘                            │
               │ vel ≈ 0 + próximo da escavadeira        │
               ▼                                         │
    ┌───────────────────────┐                            │
    │       CARGA           │ parado na frente de lavra   │
    │                       │                            │
    └──────────┬────────────┘                            │
               │ vel > carga_max + saiu da ORIGEM        │
               ▼                                         │
    ┌───────────────────────┐                            │
    │   TRANSPORTE_CHEIO    │ em movimento, CHEIO         │
    │                       │                            │
    └──────────┬────────────┘                            │
               │ Entra em geofence DESTINO               │
               ▼                                         │
    ┌───────────────────────┐                            │
    │    FILA_DESCARGA      │ vel < fila_max + em DESTINO │
    │                       │                            │
    └──────────┬────────────┘                            │
               │ vel ≈ 0 + detecta basculamento          │
               ▼                                         │
    ┌───────────────────────┐                            │
    │      DESCARGA         │ basculando/descarregando    │
    │                       │                            │
    └──────────┬────────────┘                            │
               │ vel > descarga_max + saiu do DESTINO    │
               ▼                                         │
    ┌───────────────────────┐                            │
    │   TRANSPORTE_VAZIO    │ em movimento, VAZIO         │
    │                       │                            │
    └──────────┬────────────┘                            │
               │ Entra em geofence ORIGEM novamente       │
               │ → FECHA ciclo atual                     │
               │ → ABRE novo ciclo (FILA_CARGA)          │
               └─────────────────────────────────────────┘
```

### Pseudocódigo do Worker

```typescript
// Executado a cada posição GPS recebida

async function processarCiclo(posicao: GpsPosition) {
    const { id_equipamento, latitude, longitude, velocidade, dt_gps } = posicao;
    
    // 1. Buscar ciclo ativo do equipamento
    let cicloAtivo = await getCicloAtivo(id_equipamento);
    
    // 2. Identificar em qual área está
    const areaAtual = await identificarArea(latitude, longitude);
    
    // 3. Buscar configuração de ciclo do modelo
    const config = await getConfigCiclo(id_equipamento);
    
    // 4. State machine
    if (!cicloAtivo) {
        // Sem ciclo ativo — verificar se entrou em área ORIGEM
        if (areaAtual?.tipo === 'ORIGEM') {
            cicloAtivo = await abrirCiclo(id_equipamento, areaAtual, dt_gps);
            await registrarEtapa(cicloAtivo, 'FILA_CARGA', dt_gps);
        }
        return;
    }
    
    const etapaAtual = cicloAtivo.etapa_atual;
    
    switch (etapaAtual) {
        case 'FILA_CARGA':
            // Se velocidade caiu para ~0 e está próximo do equipamento de carga
            if (velocidade <= config.velocidade_carga_max) {
                const escavadeira = await detectarEquipamentoCargaProximo(latitude, longitude);
                if (escavadeira) {
                    await fecharEtapa(cicloAtivo, 'FILA_CARGA', dt_gps);
                    await registrarEtapa(cicloAtivo, 'CARGA', dt_gps);
                    cicloAtivo.id_equipamento_carga = escavadeira.id;
                }
            }
            break;
            
        case 'CARGA':
            // Se começou a se mover e saiu da origem
            if (velocidade > config.velocidade_carga_max && !areaAtual?.tipo === 'ORIGEM') {
                await fecharEtapa(cicloAtivo, 'CARGA', dt_gps);
                await registrarEtapa(cicloAtivo, 'TRANSPORTE_CHEIO', dt_gps);
            }
            break;
            
        case 'TRANSPORTE_CHEIO':
            // Se entrou em área DESTINO
            if (areaAtual?.tipo === 'DESTINO') {
                await fecharEtapa(cicloAtivo, 'TRANSPORTE_CHEIO', dt_gps);
                await registrarEtapa(cicloAtivo, 'FILA_DESCARGA', dt_gps);
                cicloAtivo.id_area_destino = areaAtual.id;
            }
            break;
            
        case 'FILA_DESCARGA':
            // Se velocidade caiu para ~0 (momento do basculamento)
            if (velocidade <= config.velocidade_descarga_max) {
                await fecharEtapa(cicloAtivo, 'FILA_DESCARGA', dt_gps);
                await registrarEtapa(cicloAtivo, 'DESCARGA', dt_gps);
            }
            break;
            
        case 'DESCARGA':
            // Se começou a se mover e saiu do destino
            if (velocidade > config.velocidade_descarga_max) {
                await fecharEtapa(cicloAtivo, 'DESCARGA', dt_gps);
                await registrarEtapa(cicloAtivo, 'TRANSPORTE_VAZIO', dt_gps);
            }
            break;
            
        case 'TRANSPORTE_VAZIO':
            // Se entrou em área ORIGEM novamente → ciclo completo!
            if (areaAtual?.tipo === 'ORIGEM') {
                await fecharEtapa(cicloAtivo, 'TRANSPORTE_VAZIO', dt_gps);
                await fecharCiclo(cicloAtivo, dt_gps);  // calcula tempos totais
                // Abre novo ciclo automaticamente
                const novoCiclo = await abrirCiclo(id_equipamento, areaAtual, dt_gps);
                await registrarEtapa(novoCiclo, 'FILA_CARGA', dt_gps);
            }
            break;
    }
}
```

## Cálculos de Produção

### Produtividade do Caminhão

```
Produção (ton/h) = carga_ton × ciclos_por_hora

Ciclos por hora = 3600 / tempo_medio_ciclo_seg

Exemplo:
  Carga = 90 ton
  Tempo médio ciclo = 1800 seg (30 min)
  Ciclos/hora = 3600 / 1800 = 2
  Produção = 90 × 2 = 180 ton/h
```

### DMT (Distância Média de Transporte)

```
DMT = Σ(distancia_cheio_km) / total_ciclos

Impacta diretamente no tempo de ciclo e dimensionamento de frota.
```

### Match Frota (Dimensionamento)

```
Caminhões necessários = tempo_ciclo_caminhao / tempo_carga_escavadeira

Exemplo:
  Ciclo caminhão = 30 min
  Tempo de carga = 5 min
  Caminhões = 30 / 5 = 6 caminhões por escavadeira

Se menos: escavadeira fica ociosa (tempo entre caminhões alto)
Se mais: caminhões ficam em fila excessiva
```

### Índice de Fila

```
Índice de Fila (%) = (tempo_fila_carga + tempo_fila_descarga) / tempo_total_ciclo × 100

Benchmark mineração:
  < 15% = Excelente
  15-25% = Aceitável
  25-35% = Atenção
  > 35% = Crítico (redimensionar frota)
```

### Utilização do Tempo

```
┌─────────────────────────────────────────────────────┐
│ TEMPO TOTAL DO TURNO (ex: 12h)                      │
├───────────────────────────────────────┬─────────────┤
│ Tempo Operacional                     │ Tempo Parado│
├────────────────────┬──────────────────┤             │
│ Produtivo          │ Improdutivo      │  Manutenção │
│ (transporte+carga+ │ (fila+espera+    │  Sem operador│
│  descarga)         │  manobra)        │  Reserva    │
└────────────────────┴──────────────────┴─────────────┘
```

## Anomalias e Alertas do Ciclo

| Anomalia | Condição | Ação |
|----------|----------|------|
| Ciclo muito longo | tempo_total > 2× tempo médio | Alerta + investigar |
| Fila excessiva | tempo_fila > tempo_maximo_fila_seg | Alerta dispatch |
| Ciclo incompleto | Equipamento troca de atividade/desliga no meio | Marca INCOMPLETO |
| Carga muito rápida | tempo_carga < tempo_minimo_carga_seg | Possível carga parcial |
| Rota errada | Destino diferente do esperado | Alerta operador |
| Sem carga detectada | Ciclo sem equipamento de carga associado | Preencher manual |
| Velocidade anormal | Vel média muito acima/abaixo do histórico | Verificar |

## Integração com Outros Módulos

```
Ciclo Operacional
    │
    ├──→ Atividades: ao iniciar ciclo, atividade muda para "Transporte Carregado/Vazio"
    │
    ├──→ Rotograma: velocidade durante transporte é validada contra as cercas
    │
    ├──→ Abastecimento: se parou para abastecer, pausa o ciclo (ciclo_parada)
    │
    ├──→ Manutenção: se parou por falha mecânica, ciclo marca INCOMPLETO + abre solicitação
    │
    ├──→ Checklist: pré-operação valida se equipamento pode iniciar ciclos
    │
    └──→ KPI Dashboard: alimenta DF%, produção, DMT, match frota em tempo real
```

## Dashboard de Ciclos (Sugestão Visual)

```
┌────────────────────────────────────────────────────────────────┐
│  PRODUÇÃO TEMPO REAL              Turno A | 09/06/2026         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 1847 │  │ 32.4 │  │ 28:30│  │ 12.3 │  │ 18%  │           │
│  │ ton  │  │min/ci│  │ DMT  │  │km/h  │  │ fila │           │
│  │PRODUZ│  │CICLO │  │ médio│  │vel.md│  │ INDIC│           │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘           │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MAPA com caminhões em movimento                        │  │
│  │  🟢 = transporte cheio  🔵 = transporte vazio           │  │
│  │  🟡 = em fila           🔴 = parado (anomalia)          │  │
│  │  ⚫ = carregando/descarregando                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TIMELINE DO CICLO (por equipamento)                    │  │
│  │                                                          │  │
│  │  CAT-01  [███FILA██|██CARGA██|████TRANSP CHEIO████|...] │  │
│  │  CAT-02  [██TRANSP VAZIO███|███FILA██|██CARGA██|...   ] │  │
│  │  CAT-03  [██CARGA██|████████TRANSP CHEIO████████|...  ] │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Tabelas Adicionadas neste Módulo

| Tabela | Registros esperados/mês |
|--------|------------------------|
| ciclo_etapa_definicao | ~8 (lookup) |
| ciclo_configuracao | ~5-20 (por modelo) |
| ciclo_operacional | ~50.000-500.000 (particionado) |
| ciclo_etapa | ~300.000-3.000.000 (particionado) |
| material | ~5-20 (lookup) |
| fator_enchimento | ~10-50 |
| ciclo_parada | ~5.000-50.000 |
| ciclo_resumo_diario | ~30 × equips × materiais |
| ciclo_resumo_frente | ~30 × frentes |
| **Total novas:** | **9 tabelas** |
