# 📱 Mobile Offline-First & Sincronização

## Visão Geral

O app mobile opera em **ambientes hostis** (mina, campo, sem sinal). Precisa funcionar **100% offline** e sincronizar de forma inteligente quando houver conectividade.

### Princípios fundamentais:

1. **Zero requisição desnecessária** — só baixa o que MUDOU desde a última sync
2. **Pacote mínimo** — compressão, delta, paginação — cada byte conta
3. **Offline-first** — app funciona sem internet, sync é oportunista
4. **Idempotente** — sync pode ser interrompida e retomada sem duplicar dados
5. **Equipamento-cêntrico** — cada tablet baixa apenas dados relevantes ao SEU equipamento
6. **Conflito controlado** — se dois devices editam o mesmo dado, regra clara de quem ganha

---

## Arquitetura

```
BACKEND (Node.js)
├── sync_engine (diff calc, pack/gzip, conflict resolver)
├── change_log (dt_alteracao, versão, entidade, operação)
└── sync_session (device X, last sync, pending, state)
         │
         │ REST API /sync (gzip, msgpack)
         │ HTTPS (quando disponível) - comprimido, delta-only
         │
    ┌────┼──────────────────────────┐
    │    │                          │
Tablet01  Tablet02              Tablet03
(CAT-01)  (CAT-02)             (ESC-01)
SQLite    SQLite                SQLite
local DB  local DB              local DB
Upload    Upload                Upload
Queue     Queue                 Queue
```

---

## Modelo de Dados — Controle de Versão

### Conceito: sync_versao

Toda tabela que precisa ser sincronizada ganha uma coluna de versão. Quando qualquer campo muda, a versão incrementa. O device pergunta: "me dá tudo que tem versão > X para meu escopo".

```sql
-- Trigger genérico para versão de sync
CREATE OR REPLACE FUNCTION fn_sync_versao() RETURNS TRIGGER AS $$
BEGIN
    NEW.sync_versao := nextval('sync_versao_' || NEW.id_tenant || '_seq');
    NEW.dt_alteracao := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em toda tabela sincronizável:
CREATE TRIGGER trg_sync_versao BEFORE INSERT OR UPDATE ON operador
    FOR EACH ROW EXECUTE FUNCTION fn_sync_versao();
```

### Tabelas de controle

```sql
-- DISPOSITIVO MOBILE (registro de cada tablet/device)
dispositivo_mobile (
    id_dispositivo_mobile BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_hardware BIGINT REFERENCES hardware(id_hardware),
    id_equipamento BIGINT REFERENCES equipamento(id_equipamento),
    device_uuid VARCHAR(100) NOT NULL UNIQUE,
    device_nome VARCHAR(100),
    plataforma VARCHAR(20),                 -- ANDROID, IOS
    versao_app VARCHAR(20),
    versao_os VARCHAR(50),
    dt_ultima_sync TIMESTAMP,
    dt_ultimo_heartbeat TIMESTAMP,
    sync_versao_servidor BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ATIVO',     -- ATIVO, INATIVO, BLOQUEADO
    total_syncs INT DEFAULT 0,
    total_bytes_baixados BIGINT DEFAULT 0,
    total_bytes_enviados BIGINT DEFAULT 0,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ESCOPO DO DISPOSITIVO (o que cada device precisa baixar)
dispositivo_escopo (
    id_dispositivo_escopo BIGSERIAL PRIMARY KEY,
    id_dispositivo_mobile BIGINT NOT NULL REFERENCES dispositivo_mobile(id_dispositivo_mobile),
    entidade VARCHAR(50) NOT NULL,           -- 'operador', 'checklist_grupo', 'atividade'
    filtro JSONB NOT NULL,                   -- criterios de filtro por escopo
    campos JSONB,                            -- projecao: so campos necessarios
    prioridade INT DEFAULT 0,
    obrigatorio BOOLEAN DEFAULT true,
    UNIQUE(id_dispositivo_mobile, entidade)
);

-- VERSAO POR ENTIDADE (evita scan desnecessario)
sync_entidade_versao (
    id_sync_entidade_versao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL,
    entidade VARCHAR(50) NOT NULL,
    ultima_versao BIGINT NOT NULL DEFAULT 0,
    total_registros INT DEFAULT 0,
    dt_ultima_alteracao TIMESTAMP,
    UNIQUE(id_tenant, entidade)
);

-- SESSAO DE SYNC (cada tentativa)
sync_sessao (
    id_sync_sessao BIGSERIAL PRIMARY KEY,
    id_dispositivo_mobile BIGINT NOT NULL REFERENCES dispositivo_mobile(id_dispositivo_mobile),
    tipo VARCHAR(20) NOT NULL,               -- INITIAL, DELTA, FORCE_FULL
    direcao VARCHAR(10) NOT NULL,            -- DOWN, UP, BOTH
    versao_cliente_inicio BIGINT NOT NULL,
    versao_servidor_fim BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',
    registros_baixados INT DEFAULT 0,
    registros_enviados INT DEFAULT 0,
    bytes_baixados INT DEFAULT 0,
    bytes_enviados INT DEFAULT 0,
    conflitos_resolvidos INT DEFAULT 0,
    duracao_ms INT,
    erro_mensagem TEXT,
    dt_inicio TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_fim TIMESTAMP
);

-- FILA DE UPLOAD (dados gerados offline)
sync_fila_upload (
    id_sync_fila_upload BIGSERIAL PRIMARY KEY,
    id_dispositivo_mobile BIGINT NOT NULL REFERENCES dispositivo_mobile(id_dispositivo_mobile),
    entidade VARCHAR(50) NOT NULL,
    operacao VARCHAR(10) NOT NULL,            -- INSERT, UPDATE
    payload JSONB NOT NULL,
    sequencia INT NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    tentativas INT DEFAULT 0,
    erro_mensagem TEXT,
    dt_criacao_local TIMESTAMP NOT NULL,
    dt_envio TIMESTAMP,
    dt_confirmacao TIMESTAMP
);
```

---

## Protocolo de Sync

### 1. Download (Server para Device)

```json
// Device pergunta:
POST /api/sync/download
{
  "device_uuid": "abc-123",
  "versao_atual": 45872,
  "entidades_necessarias": ["operador","checklist_grupo","checklist_item","atividade","area","material"]
}

// Server responde (somente registros com sync_versao > 45872):
{
  "versao_servidor": 45901,
  "total_alteracoes": 12,
  "pacotes": [
    { "entidade": "operador", "operacoes": [
        { "op": "UPSERT", "id": 45, "dados": {"nome":"...","matricula":"..."} },
        { "op": "DELETE", "id": 12 }
    ]},
    { "entidade": "checklist_item", "operacoes": [
        { "op": "UPSERT", "id": 301, "dados": {"descricao":"..."} }
    ]}
  ],
  "compressao": "gzip",
  "bytes_original": 4280,
  "bytes_comprimido": 1120
}
```

### 2. Upload (Device para Server)

```json
POST /api/sync/upload
{
  "device_uuid": "abc-123",
  "operacoes": [
    {
      "idempotency_key": "uuid-local-001",
      "entidade": "checklist_execucao",
      "operacao": "INSERT",
      "dt_criacao_local": "2026-06-09T14:30:00",
      "payload": { "id_checklist_grupo": 3, "id_equipamento": 1, "id_operador": 45, "itens": [...] }
    },
    {
      "idempotency_key": "uuid-local-002",
      "entidade": "atividade_mudanca",
      "operacao": "INSERT",
      "dt_criacao_local": "2026-06-09T14:35:00",
      "payload": { "id_atividade": 7, "id_equipamento": 1, "id_operador": 45 }
    }
  ]
}

// Server responde:
{
  "resultados": [
    { "idempotency_key": "uuid-local-001", "status": "CONFIRMADO", "id_servidor": 8842 },
    { "idempotency_key": "uuid-local-002", "status": "CONFIRMADO", "id_servidor": 8843 }
  ]
}
```

### 3. Check rapido (ETag)

```
Device: GET /api/sync/check  (Header: If-None-Match: "v-45872")
Server: 304 Not Modified (nada mudou, zero bytes transferidos)
  OU
Server: 200 OK + ETag: "v-45901" + payload delta
```

---

## Otimizacoes de Tamanho

| Tecnica | Economia | Quando usar |
|---------|----------|-------------|
| gzip no response | 60-80% | Sempre (Accept-Encoding: gzip) |
| MessagePack em vez de JSON | 20-30% | Opcional (Content-Type: application/msgpack) |
| Delta encoding (so campos que mudaram) | 90%+ | Quando registro ja existe no device |
| Projecao de campos | 40-60% | Device pede so campos que usa no SQLite |
| ETag / 304 Not Modified | 100% | Quando nada mudou (zero transfer) |
| Batch GPS (acumula e envia junto) | 70% overhead reduzido | Posicoes GPS (envelope unico) |

### Delta encoding

```json
// Em vez de enviar o operador inteiro (30 campos):
{ "op": "UPSERT", "id": 45, "dados": { "nome": "...", "cpf": "...", ...30 campos } }

// Enviar so o delta (1 campo):
{ "op": "PATCH", "id": 45, "delta": { "telefone": "(11) 99999-0000" } }
```

### Projecao (device so precisa de N campos)

Configurado no escopo: operador no tablet so precisa de id_operador, matricula, nome, id_contratada, status.
Nao precisa: cpf, telefone, email, dt_registro, dt_alteracao...
Economia: registro tem 20 campos, device usa 5 = 75% menos dados.

---

## Escopo Automatico por Equipamento

Quando um tablet e vinculado a um equipamento, o sistema calcula automaticamente:

| Prioridade | Entidade | Filtro | Registros tipicos |
|:-:|----------|--------|:-:|
| 0 | equipamento | id_equipamento = X | 1 |
| 0 | modelo_equipamento | id do modelo do equip | 1 |
| 1 | operador | habilitados ao modelo (via operador_habilitacao) | ~15 |
| 1 | checklist_grupo | vinculados ao modelo (via checklist_grupo_modelo) | ~3 |
| 1 | checklist_item | dos grupos acima | ~60 |
| 1 | atividade | do modelo (via atividade_modelo) | ~15 |
| 1 | atividade_grupo | todos ativos | ~5 |
| 2 | area | todas ativas (precisa pra geofencing local) | ~20 |
| 2 | material | todos ativos (selecao) | ~6 |
| 2 | rotograma_cerca | vinculadas ao equipamento | ~12 |
| 2 | turno | todos ativos | ~3 |
| 3 | contratada | todas ativas (ref operadores) | ~5 |

### Tamanho estimado do pacote inicial:

| Entidade | Registros | Bytes/reg | Total |
|----------|:-:|:-:|:-:|
| equipamento | 1 | 500B | 500B |
| modelo | 1 | 300B | 300B |
| operadores | ~15 | 200B | 3KB |
| checklist_grupo | ~3 | 150B | 450B |
| checklist_item | ~60 | 100B | 6KB |
| atividades | ~15 | 150B | 2.2KB |
| areas | ~20 | 400B | 8KB |
| materiais | ~6 | 80B | 480B |
| rotograma | ~12 | 200B | 2.4KB |
| turnos | ~3 | 80B | 240B |
| **TOTAL raw** | | | **~24KB** |
| **Comprimido gzip** | | | **~6KB** |

Pacote inicial: ~6KB comprimido. Delta sync tipica: menos de 1KB.

---

## Resolucao de Conflitos

### Estrategia: Last-Write-Wins com merge de campos

- Campos DIFERENTES alterados em device A e device B: merge automatico (ambos aplicam)
- MESMO campo alterado em ambos: server wins (mas loga o conflito pro admin ver)
- Dados de producao (checklist, atividade): Device Always Wins (operador no campo tem a verdade)
- INSERT-only (checklist_execucao, atividade_mudanca): sem conflito possivel (idempotency_key previne duplicacao)

---

## Upload: Prioridade

| Prioridade | Dado | Frequencia | Tamanho |
|:-:|------|-----------|---------|
| 1 (critica) | Mudanca de atividade | ~10-30/turno | 100B cada |
| 1 (critica) | Eventos (excesso vel, fadiga) | 0-5/turno | 150B cada |
| 2 (alta) | Confirmacao dispatch | 1-5/turno | 80B cada |
| 3 (normal) | Checklist execucao | 1-2/turno | 2-5KB |
| 4 (baixa) | GPS batch | continuo (acumula) | ~500KB/turno |
| 5 (pode esperar) | Fotos checklist | 0-5/turno | 200KB-1MB cada |

Fotos: podem esperar Wi-Fi. GPS: acumula 5min de posicoes e envia em batch unico.

---

## Notificacao de Mudancas (Push)

| Metodo | Quando | Como |
|--------|--------|------|
| WebSocket | Device online com conexao estavel | Server push: SYNC_AVAILABLE + entidades + versao |
| Push silencioso (FCM/APNs) | Device com dados moveis | Acorda app em background, faz sync |
| Polling com backoff | Fallback | Online: 5min. Reconexao: imediato. Nada mudou: 15min |

---

## Seguranca

| Medida | Implementacao |
|--------|---------------|
| Autenticacao | JWT com refresh token (longa duracao para offline) |
| Device binding | device_uuid + id_tenant — token so vale pra aquele device |
| Wipe remoto | Server envia comando "wipe" - app apaga SQLite + cache |
| Encriptacao local | SQLite com SQLCipher (AES-256) |
| Cert pinning | App valida certificado do server (anti-MITM) |
| Expiracao token | Offline max 7 dias sem renovar (configuravel) |
| Bloqueio device | Admin bloqueia - proxima sync retorna 403 |

---

## SQLite Local (estrutura no Device)

```sql
-- Metadata de sync
CREATE TABLE _sync_meta (
    entidade TEXT PRIMARY KEY,
    versao_local INTEGER DEFAULT 0,
    dt_ultima_sync TEXT,
    total_registros INTEGER DEFAULT 0
);

-- Fila de upload (priorizada)
CREATE TABLE _upload_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idempotency_key TEXT NOT NULL UNIQUE,
    entidade TEXT NOT NULL,
    operacao TEXT NOT NULL,
    payload TEXT NOT NULL,
    prioridade INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDENTE',
    tentativas INTEGER DEFAULT 0,
    dt_criacao TEXT NOT NULL,
    dt_envio TEXT
);

-- Tabelas espelho (filtradas pelo escopo do device)
CREATE TABLE operador (
    id_operador INTEGER PRIMARY KEY,
    matricula TEXT, nome TEXT NOT NULL,
    id_contratada INTEGER, status TEXT,
    _sync_versao INTEGER
);
-- ... demais tabelas do escopo
```

---

## API Endpoints

```
# Registro do Device
POST   /api/sync/register
PUT    /api/sync/device/:uuid/equipamento

# Download
GET    /api/sync/check                       -- ETag check (mudou algo?)
POST   /api/sync/download                    -- delta (versao_atual para atual)
POST   /api/sync/initial                     -- download completo paginado
POST   /api/sync/force-full                  -- force reload

# Upload
POST   /api/sync/upload                      -- operacoes pendentes
POST   /api/sync/upload/foto                 -- multipart comprimido
POST   /api/sync/upload/gps-batch            -- batch posicoes GPS

# Status
GET    /api/sync/status/:uuid                -- status device
GET    /api/sync/devices                     -- lista devices (admin)
GET    /api/sync/metricas                    -- metricas gerais

# Admin
POST   /api/sync/device/:uuid/bloquear
POST   /api/sync/device/:uuid/wipe
POST   /api/sync/device/:uuid/force-sync
POST   /api/sync/recalcular-escopo/:equip
```

---

## Dashboard Admin: Sync Health

```
KPIs: 52 Devices | 47 Sync OK | 3 Offline >1h | 2 Atras >100v | 0 Falha

Devices Atrasados:
  TAB-023 | CAT-03 | 2h atras    | v-45800 | 14 ops pendentes
  TAB-041 | ESC-02 | 45min       | v-45870 | 3 ops pendentes

Alertas:
  8 devices offline > 1h
  2 devices com upload pendente > 50 operacoes
  1 device com versao app desatualizada
```

---

## Tabelas adicionadas

| # | Tabela | Dominio |
|---|--------|---------|
| 1 | dispositivo_mobile | Mobile/Sync |
| 2 | dispositivo_escopo | Mobile/Sync |
| 3 | sync_entidade_versao | Mobile/Sync |
| 4 | sync_sessao | Mobile/Sync |
| 5 | sync_fila_upload | Mobile/Sync |

**Total acumulado: ~97 tabelas**

---

## Funcionalidades (MODULES.md)

| # | Modulo | Codigo | Descricao |
|---|--------|--------|-----------|
| 25 | Mobile | MOBILE_SYNC | Engine de sync (download/upload/conflito) |
| 26 | Admin | ADMIN_DEVICES | Gestao de devices mobile (status, wipe, bloqueio) |
