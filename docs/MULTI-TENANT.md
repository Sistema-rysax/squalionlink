# 🏢 Multi-Tenant Strategy

## Abordagem: Banco Único com Row Level Security (RLS)

### Princípios

1. **Toda tabela de negócio** tem coluna `id_tenant BIGINT NOT NULL`
2. **RLS habilitado** em todas as tabelas (exceto tabelas globais como `plano`, `funcionalidade`)
3. **Contexto do tenant** setado por transação via `SET LOCAL`
4. **Índices compostos** sempre começam com `id_tenant`

### Implementação PostgreSQL

```sql
-- Habilitar RLS na tabela
ALTER TABLE equipamento ENABLE ROW LEVEL SECURITY;

-- Policy de leitura
CREATE POLICY tenant_isolation_select ON equipamento
    FOR SELECT
    USING (id_tenant = current_setting('app.current_tenant')::bigint);

-- Policy de inserção
CREATE POLICY tenant_isolation_insert ON equipamento
    FOR INSERT
    WITH CHECK (id_tenant = current_setting('app.current_tenant')::bigint);

-- Policy de update
CREATE POLICY tenant_isolation_update ON equipamento
    FOR UPDATE
    USING (id_tenant = current_setting('app.current_tenant')::bigint);

-- Policy de delete
CREATE POLICY tenant_isolation_delete ON equipamento
    FOR DELETE
    USING (id_tenant = current_setting('app.current_tenant')::bigint);
```

### Middleware Node.js

```typescript
// middleware/tenant.middleware.ts
export const tenantMiddleware = async (req, res, next) => {
    const tenantId = req.user?.tenantId; // extraído do JWT
    
    if (!tenantId) {
        return res.status(401).json({ error: 'Tenant não identificado' });
    }

    // Seta o tenant na conexão do pool
    req.db = await pool.connect();
    await req.db.query(`SET LOCAL app.current_tenant = ${tenantId}`);
    
    next();
};
```

### Tabelas SEM RLS (globais)

- `plano` — compartilhado entre todos
- `funcionalidade` — features do sistema
- `plano_funcionalidade` — relação plano ↔ feature
- `traducao` — i18n strings

### Tabelas COM RLS (isoladas por tenant)

Todas as demais (~50 tabelas).

### Índices Recomendados

```sql
-- Padrão: sempre id_tenant primeiro
CREATE INDEX idx_equipamento_tenant ON equipamento (id_tenant, id_equipamento);
CREATE INDEX idx_equipamento_tenant_status ON equipamento (id_tenant, status) WHERE dt_deletado IS NULL;
CREATE INDEX idx_gps_posicao_tenant_equip_dt ON gps_posicao (id_tenant, id_equipamento, dt_registro DESC);
```

### Partitioning (GPS)

```sql
CREATE TABLE gps_posicao (
    id_gps_posicao BIGSERIAL,
    id_tenant BIGINT NOT NULL,
    id_equipamento BIGINT NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    dt_registro TIMESTAMP NOT NULL
) PARTITION BY RANGE (dt_registro);

-- Partições mensais
CREATE TABLE gps_posicao_2026_01 PARTITION OF gps_posicao
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE gps_posicao_2026_02 PARTITION OF gps_posicao
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... auto-criar via cron job
```

### Migração de Schema

Todas as migrations rodam uma única vez (banco único).

Usar: **Knex.js migrations** ou **Prisma Migrate** ou **node-pg-migrate**.
