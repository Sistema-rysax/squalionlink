# 🗺️ Rotograma & Controle de Velocidade

## Conceito

O **Rotograma** é um conjunto de cercas virtuais (geofences) vinculado a um equipamento, que define limites de velocidade por trecho — diferenciados entre condição **seco** e **chuva**. Quando o equipamento ultrapassa a velocidade permitida na cerca atual, o sistema gera um alerta de **excesso de velocidade**.

## Fluxo

```
1. Admin cria um Rotograma (nome, descrição)
2. Define cercas (polígonos/círculos) com velocidade máx seco/chuva
3. Vincula o Rotograma ao Equipamento
4. Telemetria recebe GPS do equipamento em tempo real
5. Engine verifica:
   - Em qual cerca o equipamento está?
   - Qual a condição atual? (seco/chuva — definido manualmente ou por integração meteo)
   - Velocidade atual > velocidade permitida na cerca + condição?
   - Se SIM → gera evento EXCESSO_VELOCIDADE com detalhes
6. Dashboard exibe alertas em tempo real no mapa
```

## Modelagem

### Tabelas

```sql
-- Rotograma (agrupador de cercas)
rotograma (
    id_rotograma BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7),                          -- cor no mapa
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL,         -- UTC
    dt_alteracao TIMESTAMP NOT NULL
)

-- Cerca do rotograma (cada trecho com seu limite)
rotograma_cerca (
    id_rotograma_cerca BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_rotograma BIGINT NOT NULL FK,
    nome VARCHAR(100) NOT NULL,             -- 'Trecho Rampa Norte', 'Curva Britador'
    tipo_geometria VARCHAR(20) NOT NULL,    -- 'POLIGONO', 'CIRCULO', 'CORREDOR'
    geofence JSONB NOT NULL,                -- GeoJSON (polygon ou point+radius)
    raio_metros NUMERIC(10,2),              -- se tipo CIRCULO
    largura_corredor_metros NUMERIC(10,2),  -- se tipo CORREDOR
    velocidade_max_seco NUMERIC(5,1) NOT NULL,   -- km/h
    velocidade_max_chuva NUMERIC(5,1) NOT NULL,  -- km/h
    tolerancia_km NUMERIC(5,1) DEFAULT 0,        -- margem antes de gerar alerta
    sentido VARCHAR(20),                    -- 'IDA', 'VOLTA', 'AMBOS'
    ordem INT DEFAULT 0,                    -- sequência no rotograma
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL
)

-- Vinculação: Rotograma ↔ Equipamento (N:N)
rotograma_equipamento (
    id_rotograma_equipamento BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_rotograma BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,
    dt_inicio TIMESTAMP NOT NULL,           -- quando começou a valer
    dt_fim TIMESTAMP,                       -- NULL = vigente
    ativo BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(id_tenant, id_rotograma, id_equipamento, dt_inicio)
)

-- Condição climática atual (por área ou global do tenant)
condicao_climatica (
    id_condicao_climatica BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_area BIGINT FK,                      -- NULL = vale para todo o site
    condicao VARCHAR(10) NOT NULL,          -- 'SECO', 'CHUVA'
    id_usuario BIGINT FK,                   -- quem alterou
    dt_inicio TIMESTAMP NOT NULL,           -- quando iniciou a condição
    dt_fim TIMESTAMP,                       -- NULL = condição atual
    dt_registro TIMESTAMP NOT NULL
)

-- Evento de excesso de velocidade (gerado automaticamente)
excesso_velocidade (
    id_excesso_velocidade BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_equipamento BIGINT NOT NULL FK,
    id_operador BIGINT FK,
    id_rotograma BIGINT NOT NULL FK,
    id_rotograma_cerca BIGINT NOT NULL FK,
    velocidade_registrada NUMERIC(5,1) NOT NULL,  -- km/h que estava
    velocidade_permitida NUMERIC(5,1) NOT NULL,   -- km/h máximo na cerca
    excesso_km NUMERIC(5,1) NOT NULL,             -- diferença
    condicao_pista VARCHAR(10) NOT NULL,           -- 'SECO' ou 'CHUVA'
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    duracao_segundos INT,                          -- quanto tempo ficou acima
    dt_evento TIMESTAMP NOT NULL,                  -- UTC
    dt_registro TIMESTAMP NOT NULL
)
```

### Índices Importantes

```sql
CREATE INDEX idx_rotograma_equip_tenant ON rotograma_equipamento (id_tenant, id_equipamento) WHERE ativo = true;
CREATE INDEX idx_excesso_vel_tenant_dt ON excesso_velocidade (id_tenant, dt_evento DESC);
CREATE INDEX idx_excesso_vel_equip ON excesso_velocidade (id_tenant, id_equipamento, dt_evento DESC);
CREATE INDEX idx_excesso_vel_operador ON excesso_velocidade (id_tenant, id_operador, dt_evento DESC);
```

## Engine de Processamento (Worker)

```
GPS Position chega (via Socket/Queue)
    │
    ▼
Busca rotograma ativo do equipamento
    │
    ▼
Para cada cerca do rotograma:
    - Point-in-polygon? (PostGIS ST_Contains ou cálculo JS)
    │
    ▼
Se está dentro de uma cerca:
    - Busca condição climática atual (seco/chuva)
    - Velocidade atual > (velocidade_max_{condicao} + tolerancia)?
    │
    ▼
Se SIM:
    - INSERT excesso_velocidade
    - Emite Socket.IO event → dashboard
    - Emite alerta (tabela alerta)
    - Se integrado: pode acionar buzzer/notificação no tablet de bordo
```

## Regras de Negócio

1. Um equipamento pode ter **apenas 1 rotograma ativo** por vez (dt_fim IS NULL)
2. As cercas podem se sobrepor — vale a **mais restritiva** (menor velocidade)
3. Tolerância configurável por cerca (ex: 5 km/h a mais antes de alertar)
4. Condição climática pode ser alterada por supervisor via app ou integração meteorológica
5. O excesso só gera evento após X segundos acima do limite (evitar picos momentâneos) — configurável no `rotograma.tempo_minimo_excesso_seg`
