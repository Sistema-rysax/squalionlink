# 🌐 Internacionalização & Timezone

## Idiomas Suportados

| Código | Idioma |
|--------|--------|
| pt-BR | Português (Brasil) |
| en | English |
| de | Deutsch |
| fr | Français |
| es | Español |

## Estratégia de Data/Hora

### Regra de Ouro

> **TODO dado temporal é armazenado em UTC+0. Sem exceção.**

### Tipo de Coluna

```sql
-- USAR:
dt_registro TIMESTAMP WITHOUT TIME ZONE  -- armazena datetime puro em UTC

-- NÃO USAR:
-- TIMESTAMP WITH TIME ZONE (timestamptz)
-- o timezone fica no cadastro do tenant, não no dado
```

### Tenant tem seu offset

```sql
tenant (
    ...
    utc_offset VARCHAR(6) NOT NULL DEFAULT '+00:00',   -- ex: '-03:00'
    timezone_id VARCHAR(50) NOT NULL DEFAULT 'UTC',    -- ex: 'America/Sao_Paulo'
    ...
)
```

### Frontend (conversão)

```typescript
// O frontend SEMPRE recebe UTC do backend
// Converte para exibição usando o timezone do tenant

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Exibir para o usuário
const displayDate = dayjs.utc(dtFromApi).tz(tenant.timezone_id);
// '2026-06-08 22:21:37' para America/Sao_Paulo

// Enviar para o backend (sempre UTC)
const sendDate = dayjs(localInput).utc().format('YYYY-MM-DD HH:mm:ss');
```

### Backend (sempre UTC)

```typescript
// Toda data gerada no backend:
const now = new Date().toISOString(); // UTC

// Toda data recebida do frontend: validar que é UTC
// Se frontend enviar em local, converter para UTC antes de salvar
```

## Estratégia de i18n

### Interface (Frontend)

Arquivos JSON por idioma:

```
src/locales/
├── pt-BR.json
├── en.json
├── de.json
├── fr.json
└── es.json
```

Library: **react-i18next**

### Dados do Banco (tabelas lookup)

Tabela genérica de traduções:

```sql
CREATE TABLE traducao (
    id_traducao BIGSERIAL PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    id_registro BIGINT NOT NULL,
    campo VARCHAR(100) NOT NULL,
    idioma VARCHAR(5) NOT NULL,
    valor TEXT NOT NULL,
    UNIQUE(tabela, id_registro, campo, idioma)
);

-- Exemplo: traduzir area_tipo
INSERT INTO traducao VALUES
(1, 'area_tipo', 1, 'nome', 'pt-BR', 'Origem'),
(2, 'area_tipo', 1, 'nome', 'en', 'Source'),
(3, 'area_tipo', 1, 'nome', 'de', 'Herkunft'),
(4, 'area_tipo', 1, 'nome', 'fr', 'Origine'),
(5, 'area_tipo', 1, 'nome', 'es', 'Origen');
```

### Seleção de Idioma (prioridade)

1. Preferência do usuário (`usuario.idioma`)
2. Idioma padrão do tenant (`tenant.idioma_padrao`)
3. Fallback: `pt-BR`

### Header HTTP

```
Accept-Language: pt-BR
X-Timezone: America/Sao_Paulo
```
