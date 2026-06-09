# 📈 Report Builder (Construtor de Relatórios)

## Conceito

O **Report Builder** é um módulo de criação e visualização de relatórios customizáveis, onde qualquer usuário com permissão pode montar relatórios visuais a partir dos contextos de dados disponíveis no sistema. É um motor unificado utilizado tanto pelo **tenant** quanto pelo **administrador master** da plataforma.

---

## Hierarquia de Relatórios

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CAMADAS DE RELATÓRIOS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. PLATAFORMA (Master Admin)                                           │
│     └── Criados pelo admin master, compartilhados com tenants           │
│         └── Tenant recebe como "Relatório de Sistema" (read-only)       │
│                                                                         │
│  2. TENANT (Admin do cliente)                                           │
│     └── Criados pelo admin do tenant                                    │
│         └── Disponível para todos os usuários do tenant                 │
│                                                                         │
│  3. PESSOAL (Qualquer usuário)                                          │
│     └── Criados pelo próprio usuário                                    │
│         └── Privado, a menos que compartilhado                          │
│                                                                         │
│  4. COMPARTILHADO                                                       │
│     └── Relatório pessoal compartilhado com outros usuários/perfis      │
│         └── Read-only para quem recebe (ou editável, config.)           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Visibilidade no menu do usuário:

```
📊 Relatórios
├── 📌 Sistema (vem do master admin, não editável)
│   ├── Produção Diária Padrão
│   ├── DF% Mensal
│   └── Resumo Operacional
├── 🏢 Meu Tenant (criados pelo admin do tenant)
│   ├── Controle de Fila por Frente
│   └── Ranking Operadores
├── 👤 Meus Relatórios (criados por mim)
│   ├── Análise Turno Noite
│   └── Consumo Diesel Caterpillar
└── 🤝 Compartilhados comigo
    ├── DMT por Mês (de João Silva)
    └── Checklist Anomalias (de Maria Souza)
```

---

## Contextos de Dados (Data Sources)

O Report Builder opera sobre **contextos** — cada contexto é uma view ou conjunto de dados pré-processado que o motor disponibiliza para consulta.

| Contexto | Dados disponíveis | Métricas |
|----------|-------------------|----------|
| **PRODUCAO** | Ciclos, carga, DMT, etapas, frente, turno | ton, ciclos/h, tempo médio, DMT, % fila |
| **ATIVIDADE** | Histórico de atividades, duração, tipo | horas por atividade, % produtiva, ociosidade |
| **CHECKLIST** | Execuções, itens, conformidade, fotos | % conforme, itens críticos, tendência |
| **MANUTENCAO** | OS, preventiva, corretiva, backlog | DF%, MTBF, MTTR, custo, HH, backlog |
| **ROTOGRAMA** | Excessos de velocidade por cerca | total excessos, velocidade média, top operadores |
| **OPERADOR** | Produção, excessos, checklist, horas | ranking, eficiência, violações |
| **EQUIPAMENTO** | Status, horímetro, consumo, disponibilidade | utilização, custo/hora, consumo L/h |
| **DISPATCH** | Ordens, confirmações, tempo resposta, aderência | taxa confirmação, ociosidade frota |
| **ABASTECIMENTO** | Litros, custo, km/L, L/h | consumo médio, custo por equip |
| **ESTOQUE** | Movimentações, nível, consumo peças | giro, estoque mínimo, custo peça/equip |

### Dimensões disponíveis por contexto

Cada contexto expõe **dimensões** (eixos de agrupamento) e **métricas** (valores calculados):

```typescript
interface ReportContext {
    id: string;
    nome: string;
    dimensoes: Dimension[];  // por onde agrupar
    metricas: Metric[];      // o que calcular
    filtros: Filter[];       // como filtrar
}

// Exemplo: PRODUCAO
{
    id: 'PRODUCAO',
    nome: 'Produção & Ciclos',
    dimensoes: [
        { campo: 'data', tipo: 'DATE', label: 'Data' },
        { campo: 'turno', tipo: 'CATEGORY', label: 'Turno' },
        { campo: 'equipamento', tipo: 'CATEGORY', label: 'Equipamento' },
        { campo: 'modelo', tipo: 'CATEGORY', label: 'Modelo' },
        { campo: 'operador', tipo: 'CATEGORY', label: 'Operador' },
        { campo: 'area_origem', tipo: 'CATEGORY', label: 'Frente (Origem)' },
        { campo: 'area_destino', tipo: 'CATEGORY', label: 'Destino' },
        { campo: 'material', tipo: 'CATEGORY', label: 'Material' },
        { campo: 'equipamento_carga', tipo: 'CATEGORY', label: 'Escavadeira' },
        { campo: 'hora', tipo: 'HOUR', label: 'Hora do Dia' },
        { campo: 'semana', tipo: 'WEEK', label: 'Semana' },
        { campo: 'mes', tipo: 'MONTH', label: 'Mês' },
    ],
    metricas: [
        { campo: 'total_ciclos', agregacao: 'COUNT', label: 'Total de Ciclos' },
        { campo: 'producao_ton', agregacao: 'SUM', label: 'Produção (ton)' },
        { campo: 'tempo_medio_ciclo', agregacao: 'AVG', label: 'Tempo Médio Ciclo (min)' },
        { campo: 'dmt_km', agregacao: 'AVG', label: 'DMT (km)' },
        { campo: 'indice_fila', agregacao: 'AVG', label: 'Índice de Fila (%)' },
        { campo: 'velocidade_media', agregacao: 'AVG', label: 'Velocidade Média (km/h)' },
        { campo: 'carga_media', agregacao: 'AVG', label: 'Carga Média (ton)' },
    ],
    filtros: [
        { campo: 'periodo', tipo: 'DATE_RANGE', obrigatorio: true },
        { campo: 'equipamento', tipo: 'MULTI_SELECT' },
        { campo: 'modelo', tipo: 'MULTI_SELECT' },
        { campo: 'turno', tipo: 'MULTI_SELECT' },
        { campo: 'material', tipo: 'MULTI_SELECT' },
        { campo: 'area_origem', tipo: 'MULTI_SELECT' },
    ]
}
```

---

## Tipos de Visualização

O motor utiliza **Recharts** como biblioteca única de gráficos (React, performático, responsivo).

| Tipo | Código | Uso ideal |
|------|--------|-----------|
| 📊 Barras Vertical | `BAR` | Comparação entre categorias |
| 📊 Barras Horizontal | `BAR_H` | Ranking, top-N |
| 📊 Barras Empilhadas | `STACKED_BAR` | Composição + comparação |
| 📈 Linha | `LINE` | Tendência temporal |
| 📈 Área | `AREA` | Tendência com volume |
| 🍩 Donut | `DONUT` | Proporção (poucos itens) |
| 🥧 Pizza | `PIE` | Proporção (poucos itens, sem furo) |
| 📋 Tabela | `TABLE` | Detalhamento, drill-down |
| 🧮 Matrix | `MATRIX` | Cruzamento 2D (heatmap) |
| 🔢 KPI Card | `KPI_CARD` | Indicador único com delta |
| 📊 Combo (Linha + Barra) | `COMBO` | Dual-axis (ex: produção + fila) |
| 📊 Waterfall | `WATERFALL` | Decomposição de tempo |

### Componente de Chart

```typescript
interface ChartConfig {
    tipo: ChartType;
    titulo: string;
    
    // Dados
    contexto: string;         // 'PRODUCAO', 'CHECKLIST', etc.
    dimensao_x: string;       // campo de agrupamento no eixo X
    dimensao_serie?: string;  // campo que gera múltiplas séries (stacked/grouped)
    metricas: string[];       // campos de valor
    
    // Filtros aplicados
    filtros: AppliedFilter[];
    
    // Visual
    cores?: string[];         // paleta customizada
    mostrar_legenda: boolean;
    mostrar_label: boolean;
    formato_valor?: string;   // 'number', 'percent', 'currency', 'duration'
    
    // Interatividade
    ordenar_por?: string;     // campo + direção
    limite?: number;          // top N resultados
    drill_down?: DrillConfig; // ao clicar, filtrar por X
}
```

---

## Interface do Builder

### Tela Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Construtor de Relatórios          [Salvar] [Exportar PDF] [← Voltar]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────────────────────┐  │
│  │ CONFIGURAÇÃO    │  │              PREVIEW                        │  │
│  │                 │  │                                             │  │
│  │ Contexto:       │  │  ┌───────────────────────────────────────┐  │  │
│  │ [Produção    ▾] │  │  │                                       │  │  │
│  │                 │  │  │     GRÁFICO RENDERIZADO                │  │  │
│  │ Tipo:           │  │  │     (Recharts - live preview)          │  │  │
│  │ [Barras Emp. ▾] │  │  │                                       │  │  │
│  │                 │  │  │     ████ ████ ████ ████                │  │  │
│  │ Dimensão X:     │  │  │     ████ ████ ████ ████                │  │  │
│  │ [Data        ▾] │  │  │     ████ ████ ████ ████                │  │  │
│  │                 │  │  │     Jan  Fev  Mar  Abr                 │  │  │
│  │ Séries:         │  │  │                                       │  │  │
│  │ [Material    ▾] │  │  └───────────────────────────────────────┘  │  │
│  │                 │  │                                             │  │
│  │ Métricas:       │  │  ┌───────────────────────────────────────┐  │  │
│  │ ☑ Produção ton  │  │  │  TABELA DE DADOS (opcional)           │  │  │
│  │ ☑ DMT           │  │  │  Equipam. | Prod. | DMT | Fila% | ▲▼│  │  │
│  │ ☐ Vel. Média    │  │  │  CAT-01   | 1450  | 3.2 | 18%   |   │  │  │
│  │ ☐ Índice Fila   │  │  │  CAT-02   | 1380  | 2.8 | 21%   |   │  │  │
│  │                 │  │  │  CAT-03   | 1290  | 3.5 | 15%   |   │  │  │
│  │ ────────────── │  │  └───────────────────────────────────────┘  │  │
│  │                 │  │                                             │  │
│  │ FILTROS:        │  └─────────────────────────────────────────────┘  │
│  │                 │                                                    │
│  │ Período:        │                                                    │
│  │ [01/06 → 09/06] │                                                   │
│  │                 │                                                    │
│  │ Turno:          │                                                    │
│  │ [Todos       ▾] │                                                   │
│  │                 │                                                    │
│  │ Equipamento:    │                                                    │
│  │ [Selecionar...] │                                                   │
│  └─────────────────┘                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tela de Relatório Salvo (Visualização)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Produção Diária - Turno A         [Editar] [Compartilhar] [PDF]     │
│  Criado por: João Silva | Última atualização: 09/06/2026               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Filtro ativo: 01/06/2026 → 09/06/2026 | Turno A | Todas as frentes   │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  GRID DE WIDGETS (layout drag-and-drop)                          │  │
│  │                                                                   │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│  │
│  │  │   12,450    │ │   28.3 min  │ │    3.1 km   │ │   17.8%     ││  │
│  │  │  Produção   │ │  Tempo Ciclo│ │     DMT     │ │   Fila      ││  │
│  │  │  ▲ 5.2%     │ │  ▼ 1.2 min │ │  = mesmo    │ │  ▼ 2.1%    ││  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│  │
│  │                                                                   │  │
│  │  ┌────────────────────────────────┐ ┌────────────────────────────┐│  │
│  │  │  📈 Produção por Dia (Linha)   │ │  🍩 Material (Donut)      ││  │
│  │  │                                │ │                            ││  │
│  │  │  ──────/──────/──── meta     │ │     ╭───╮                 ││  │
│  │  │  ────/──────/──────── real   │ │   ╭─┤   ├─╮  Minério 62% ││  │
│  │  │                                │ │   │ ╰───╯ │  Estéril 38% ││  │
│  │  └────────────────────────────────┘ └────────────────────────────┘│  │
│  │                                                                   │  │
│  │  ┌───────────────────────────────────────────────────────────────┐│  │
│  │  │  📋 Tabela Detalhada                                         ││  │
│  │  │  [🔍 Buscar...] [📥 Exportar Excel]                          ││  │
│  │  │  Equip ▲▼ | Prod ▲▼ | Ciclos ▲▼ | DMT ▲▼ | Fila% ▲▼       ││  │
│  │  │  CAT-01   | 1,450   | 48      | 3.2    | 18%              ││  │
│  │  │  CAT-02   | 1,380   | 45      | 2.8    | 21%              ││  │
│  │  │  ...                                                         ││  │
│  │  │  Página 1 de 3  [< 1 2 3 >]  Mostrando 20 de 52            ││  │
│  │  └───────────────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Modelagem

### Tabelas

```sql
-- Definição de um relatório
relatorio (
    id_relatorio BIGSERIAL PK,
    id_tenant BIGINT FK,                     -- NULL = relatório de plataforma (master)
    id_usuario_criador BIGINT FK,            -- quem criou
    
    -- Identificação
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    
    -- Classificação
    tipo VARCHAR(20) NOT NULL,               -- 'PLATAFORMA','TENANT','PESSOAL'
    contexto VARCHAR(30) NOT NULL,           -- 'PRODUCAO','CHECKLIST','MANUTENCAO',...
    
    -- Configuração do relatório (JSON completo)
    configuracao JSONB NOT NULL,             -- widgets, layout, filtros padrão
    -- Estrutura:
    -- {
    --   "layout": { "cols": 12, "widgets": [...] },
    --   "filtros_padrao": { "periodo": "ULTIMOS_7_DIAS", ... },
    --   "refresh_auto": false,
    --   "refresh_intervalo_seg": 300
    -- }
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO', -- 'RASCUNHO','PUBLICADO','ARQUIVADO'
    
    -- Controle
    favorito BOOLEAN DEFAULT false,
    ordem INT DEFAULT 0,                     -- ordenação no menu
    
    -- Timestamps
    dt_registro TIMESTAMP NOT NULL,
    dt_alteracao TIMESTAMP NOT NULL,
    dt_deletado TIMESTAMP
)

-- Widget dentro do relatório (gráfico/tabela individual)
relatorio_widget (
    id_relatorio_widget BIGSERIAL PK,
    id_relatorio BIGINT NOT NULL FK,
    
    -- Posição no grid (layout responsivo 12 colunas)
    grid_x INT NOT NULL DEFAULT 0,           -- coluna início (0-11)
    grid_y INT NOT NULL DEFAULT 0,           -- linha início
    grid_w INT NOT NULL DEFAULT 6,           -- largura em colunas (1-12)
    grid_h INT NOT NULL DEFAULT 4,           -- altura em unidades
    
    -- Tipo de visualização
    tipo_chart VARCHAR(20) NOT NULL,         -- 'BAR','LINE','DONUT','TABLE','KPI_CARD','MATRIX',...
    titulo VARCHAR(200),
    
    -- Configuração do chart
    config JSONB NOT NULL,
    -- Estrutura:
    -- {
    --   "dimensao_x": "data",
    --   "dimensao_serie": "material",
    --   "metricas": ["producao_ton", "dmt_km"],
    --   "cores": ["#3B82F6", "#10B981"],
    --   "formato_valor": "number",
    --   "mostrar_legenda": true,
    --   "mostrar_label": false,
    --   "ordenar": { "campo": "producao_ton", "direcao": "DESC" },
    --   "limite": 10,
    --   "drill_down": { "nivel": "equipamento", "contexto": "PRODUCAO" }
    -- }
    
    -- Para tipo TABLE/MATRIX
    config_tabela JSONB,
    -- Estrutura:
    -- {
    --   "colunas": [
    --     { "campo": "equipamento", "label": "Equipamento", "largura": 150, "fixo": true },
    --     { "campo": "producao_ton", "label": "Produção (ton)", "formato": "number", "sort": true }
    --   ],
    --   "paginacao": { "por_pagina": 20 },
    --   "exportar": ["excel", "csv"],
    --   "filtro_coluna": true,
    --   "totalizadores": ["producao_ton", "total_ciclos"]
    -- }
    
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true
)

-- Compartilhamento
relatorio_compartilhamento (
    id_relatorio_compartilhamento BIGSERIAL PK,
    id_relatorio BIGINT NOT NULL FK,
    
    -- Com quem compartilhar (um dos campos preenchido)
    id_tenant_destino BIGINT FK,             -- compartilhar com todo o tenant (master→tenant)
    id_usuario_destino BIGINT FK,            -- compartilhar com usuário específico
    id_perfil_destino BIGINT FK,             -- compartilhar com perfil (todos que têm esse perfil)
    
    -- Permissões
    permissao VARCHAR(10) NOT NULL DEFAULT 'VIEW', -- 'VIEW','EDIT','ADMIN'
    
    dt_compartilhamento TIMESTAMP NOT NULL,
    dt_revogacao TIMESTAMP                   -- NULL = ativo
)

-- Favoritos do usuário
relatorio_favorito (
    id_relatorio_favorito BIGSERIAL PK,
    id_usuario BIGINT NOT NULL FK,
    id_relatorio BIGINT NOT NULL FK,
    ordem INT DEFAULT 0,
    dt_registro TIMESTAMP NOT NULL,
    UNIQUE(id_usuario, id_relatorio)
)

-- Histórico de execução (para analytics: quem viu o quê, quando)
relatorio_execucao (
    id_relatorio_execucao BIGSERIAL PK,
    id_relatorio BIGINT NOT NULL FK,
    id_usuario BIGINT NOT NULL FK,
    id_tenant BIGINT NOT NULL FK,
    filtros_aplicados JSONB,
    tempo_geracao_ms INT,                    -- performance tracking
    exportou BOOLEAN DEFAULT false,
    formato_exportacao VARCHAR(10),          -- 'PDF','EXCEL','CSV'
    dt_execucao TIMESTAMP NOT NULL
) PARTITION BY RANGE (dt_execucao);

-- Agendamento de envio automático
relatorio_agendamento (
    id_relatorio_agendamento BIGSERIAL PK,
    id_tenant BIGINT NOT NULL FK,
    id_relatorio BIGINT NOT NULL FK,
    id_usuario_criador BIGINT NOT NULL FK,
    
    -- Quando enviar
    cron_expression VARCHAR(50) NOT NULL,    -- '0 7 * * 1' (segunda 7h)
    timezone VARCHAR(50) NOT NULL,           -- usa timezone do tenant
    
    -- Para quem enviar
    destinatarios JSONB NOT NULL,            -- [{ tipo: 'EMAIL', valor: 'x@y.com' }, { tipo: 'USUARIO', id: 5 }]
    
    -- Formato
    formato VARCHAR(10) NOT NULL DEFAULT 'PDF', -- 'PDF','EXCEL','LINK'
    
    -- Filtros fixos (sobrescreve padrão do relatório)
    filtros_override JSONB,
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    ultima_execucao TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL
)
```

### Índices

```sql
CREATE INDEX idx_relatorio_tenant ON relatorio (id_tenant, status) WHERE dt_deletado IS NULL;
CREATE INDEX idx_relatorio_tipo ON relatorio (tipo, contexto) WHERE status = 'PUBLICADO';
CREATE INDEX idx_relatorio_comp_usuario ON relatorio_compartilhamento (id_usuario_destino) WHERE dt_revogacao IS NULL;
CREATE INDEX idx_relatorio_comp_tenant ON relatorio_compartilhamento (id_tenant_destino) WHERE dt_revogacao IS NULL;
CREATE INDEX idx_relatorio_comp_perfil ON relatorio_compartilhamento (id_perfil_destino) WHERE dt_revogacao IS NULL;
CREATE INDEX idx_relatorio_fav_usuario ON relatorio_favorito (id_usuario);
CREATE INDEX idx_relatorio_exec_dt ON relatorio_execucao (id_tenant, dt_execucao DESC);
```

---

## Motor de Query (Backend)

### Arquitetura

```
Requisição do usuário (relatório + filtros)
    │
    ▼
┌───────────────────────────────┐
│  Report Engine Service         │
│                               │
│  1. Validar permissões        │
│  2. Resolver contexto         │ ← busca a "data source" SQL
│  3. Aplicar filtros + RLS     │ ← tenant isolation garantido
│  4. Executar query            │ ← query builder dinâmico
│  5. Agregar dados             │
│  6. Formatar resposta         │
└───────────────────────────────┘
    │
    ▼
┌───────────────────────────────┐
│  Cache (Redis)                 │
│  TTL: 5 min por combinação    │
│  Key: tenant:contexto:filtros │
└───────────────────────────────┘
    │
    ▼
Response JSON → Frontend Recharts renderiza
```

### Query Builder

```typescript
// O motor traduz config JSON em SQL seguro
class ReportQueryBuilder {
    build(config: WidgetConfig, filters: Filter[], tenantId: number): SQL {
        const source = this.resolveSource(config.contexto);
        // source = view ou tabela base com joins pré-definidos
        
        let query = sql`
            SELECT 
                ${this.buildSelect(config.dimensao_x, config.metricas)}
            FROM ${source}
            WHERE id_tenant = ${tenantId}
                AND ${this.buildFilters(filters)}
            GROUP BY ${config.dimensao_x}
            ${config.dimensao_serie ? sql`ORDER BY ${config.ordenar}` : sql``}
            ${config.limite ? sql`LIMIT ${config.limite}` : sql``}
        `;
        
        return query;
    }
}
```

---

## Exportação

| Formato | Biblioteca | Uso |
|---------|-----------|-----|
| PDF | `@react-pdf/renderer` ou `puppeteer` (server-side) | Relatório visual completo |
| Excel | `exceljs` | Tabelas com formatação, fórmulas |
| CSV | Nativo | Dados brutos |
| Imagem | `html2canvas` + `recharts` SVG export | Gráfico individual |

---

## Permissões (Funcionalidades)

| Funcionalidade | Quem pode |
|----------------|-----------|
| `RELATORIO_VISUALIZAR` | Qualquer perfil com acesso |
| `RELATORIO_CRIAR` | Perfis com permissão de criação |
| `RELATORIO_COMPARTILHAR` | Perfis com permissão + dono do relatório |
| `RELATORIO_ADMIN_TENANT` | Admin do tenant (publica para todos) |
| `RELATORIO_ADMIN_PLATAFORMA` | Master admin (publica para tenants) |
| `RELATORIO_EXPORTAR` | Configurável por perfil |
| `RELATORIO_AGENDAR` | Configurável por perfil |

---

## API Endpoints

```
# CRUD Relatórios
GET    /api/v1/relatorios                       # Listar (meus + tenant + compartilhados + sistema)
POST   /api/v1/relatorios                       # Criar
GET    /api/v1/relatorios/:id                   # Detalhe (config completa)
PUT    /api/v1/relatorios/:id                   # Salvar alterações
DELETE /api/v1/relatorios/:id                   # Soft delete
POST   /api/v1/relatorios/:id/duplicar          # Duplicar como pessoal

# Execução
POST   /api/v1/relatorios/:id/executar          # Gerar dados (com filtros no body)
POST   /api/v1/relatorios/:id/exportar          # Exportar PDF/Excel/CSV

# Compartilhamento
POST   /api/v1/relatorios/:id/compartilhar      # Compartilhar
DELETE /api/v1/relatorios/:id/compartilhar/:comp_id  # Revogar

# Favoritos
POST   /api/v1/relatorios/:id/favoritar         # Add favorito
DELETE /api/v1/relatorios/:id/favoritar         # Remove favorito

# Agendamento
POST   /api/v1/relatorios/:id/agendar           # Criar agendamento
PUT    /api/v1/relatorios/agendamentos/:id      # Atualizar
DELETE /api/v1/relatorios/agendamentos/:id      # Remover

# Contextos (meta)
GET    /api/v1/relatorios/contextos             # Lista de contextos disponíveis
GET    /api/v1/relatorios/contextos/:id         # Dimensões e métricas do contexto

# Admin Plataforma
POST   /api/v1/admin/relatorios                 # Criar relatório de plataforma
POST   /api/v1/admin/relatorios/:id/distribuir  # Compartilhar com tenants
```

---

## Tabelas Adicionadas

| Tabela | Descrição |
|--------|-----------|
| relatorio | Definição do relatório |
| relatorio_widget | Widgets (charts/tables) do relatório |
| relatorio_compartilhamento | Com quem está compartilhado |
| relatorio_favorito | Favoritos do usuário |
| relatorio_execucao | Log de uso (analytics) |
| relatorio_agendamento | Envios automáticos |
| **Total novas:** | **6 tabelas** |
