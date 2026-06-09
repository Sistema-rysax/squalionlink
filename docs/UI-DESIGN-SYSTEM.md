# 🎨 UI Design System — SqualionLink

## Filosofia de Design

O SqualionLink adota uma interface **"Game-Style Dashboard"** — informação densa apresentada de forma clara, com feedback visual imediato, animações sutis, e interatividade constante. O sistema deve transmitir a sensação de um **painel de controle de operação**, onde tudo acontece em tempo real.

### Princípios

| Princípio | Descrição |
|-----------|-----------|
| **Densidade sem confusão** | Muita informação por tela, mas organizada hierarquicamente |
| **Real-time feedback** | Toda ação tem resposta visual instantânea (<100ms) |
| **Consistência obsessiva** | Mesmo componente = mesmo comportamento, SEMPRE |
| **Mobile-ready** | Desktop-first MAS responsivo (tablet em campo) |
| **Acessibilidade** | WCAG 2.1 AA mínimo, contraste, foco visível, screen reader |
| **Dark mode first** | Operação 24h, muitos supervisores de turno noturno |

---

## Stack Frontend

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | React 18+ (Vite) | Componentização, ecossistema, performance |
| Linguagem | TypeScript (strict) | Segurança de tipos, DX |
| Styling | Tailwind CSS 4 | Utility-first, design tokens, JIT |
| Componentes base | shadcn/ui (customizado) | Headless, acessível, extensível |
| State | Zustand + React Query | Simples, performático, cache inteligente |
| Gráficos | Recharts | Declarativo, customizável, SVG performático |
| Mapa | Deck.gl + MapLibre GL | WebGL, 100k+ pontos, 3D |
| Animações | Framer Motion | Enter/exit, layout, gestures |
| Tabelas | TanStack Table v8 | Headless, sort, filter, virtualização |
| Formulários | React Hook Form + Zod | Performático, validação type-safe |
| i18n | react-i18next | Namespaces, lazy load, plural rules |
| Ícones | Lucide React | Consistente, tree-shakeable |
| Data | date-fns + date-fns-tz | Leve, imutável, timezone handling |

---

## Design Tokens

### Cores

```css
/* Tema Dark (padrão) */
:root {
    /* Background */
    --bg-primary: #0F172A;       /* slate-900 — fundo principal */
    --bg-secondary: #1E293B;     /* slate-800 — cards, sidebars */
    --bg-tertiary: #334155;      /* slate-700 — hovers, elevated */
    --bg-surface: #1E293B;       /* superfícies */
    
    /* Text */
    --text-primary: #F8FAFC;     /* slate-50 */
    --text-secondary: #94A3B8;   /* slate-400 */
    --text-muted: #64748B;       /* slate-500 */
    
    /* Brand */
    --brand-primary: #3B82F6;    /* blue-500 */
    --brand-hover: #2563EB;      /* blue-600 */
    --brand-light: #DBEAFE;      /* blue-100 (textos em fundo brand) */
    
    /* Semânticas */
    --success: #10B981;          /* emerald-500 */
    --warning: #F59E0B;          /* amber-500 */
    --danger: #EF4444;           /* red-500 */
    --info: #06B6D4;             /* cyan-500 */
    
    /* Status operacional */
    --status-operando: #10B981;
    --status-parado: #F59E0B;
    --status-manutencao: #EF4444;
    --status-disponivel: #3B82F6;
    --status-reserva: #8B5CF6;
    
    /* Borders */
    --border-default: #334155;   /* slate-700 */
    --border-hover: #475569;     /* slate-600 */
    --border-focus: #3B82F6;     /* brand */
    
    /* Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
    --shadow-glow: 0 0 15px rgba(59,130,246,0.3);
    
    /* Spacing scale */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;
    --space-16: 64px;
}

/* Tema Light */
[data-theme="light"] {
    --bg-primary: #FFFFFF;
    --bg-secondary: #F8FAFC;
    --bg-tertiary: #F1F5F9;
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-muted: #94A3B8;
    --border-default: #E2E8F0;
    /* ... demais ajustes */
}
```

### Tipografia

```css
:root {
    /* Font Family */
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    
    /* Font Scale */
    --text-xs: 0.75rem;    /* 12px — labels pequenos, badges */
    --text-sm: 0.875rem;   /* 14px — corpo padrão em tabelas, secundário */
    --text-base: 1rem;     /* 16px — corpo padrão */
    --text-lg: 1.125rem;   /* 18px — subtítulos */
    --text-xl: 1.25rem;    /* 20px — títulos de card */
    --text-2xl: 1.5rem;    /* 24px — títulos de seção */
    --text-3xl: 1.875rem;  /* 30px — títulos de página */
    --text-4xl: 2.25rem;   /* 36px — KPI grande */
    --text-5xl: 3rem;      /* 48px — hero number */
    
    /* Font Weight */
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;
    
    /* Line Height */
    --leading-tight: 1.25;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
}
```

---

## Componentes Core

### 1. DataTable (Tabela CRUD Padrão)

**A tabela é o componente mais usado do sistema.** Toda listagem, relatório tabular, e drill-down usa o mesmo componente. Deve ser **obsessivamente consistente**.

#### Funcionalidades obrigatórias

| Feature | Descrição | Implementação |
|---------|-----------|---------------|
| **Sort** | Click no header → asc/desc/none | TanStack Table sorting |
| **Filtro por coluna** | Dropdown no header (estilo Excel) | Custom filter UI por tipo |
| **Busca global** | Input no topo, debounce 300ms | Filtra todas as colunas visíveis |
| **Paginação** | Inferior, com tamanho configurável | 10/20/50/100 por página |
| **Seleção** | Checkbox na primeira coluna | Single + multi select |
| **Ações em massa** | Barra aparece ao selecionar | Delete, export, mover |
| **Resize colunas** | Arrastar borda do header | Drag handle |
| **Reordenar colunas** | Drag & drop header | DnD |
| **Colunas fixas** | Primeiras N colunas fixas no scroll | sticky positioning |
| **Exportar** | Excel, CSV, PDF da view atual | Respeitando filtros/sort |
| **Densidade** | Compact / Normal / Relaxed | Toggle no toolbar |
| **Virtualização** | Para >500 linhas | react-virtual |
| **Loading** | Skeleton rows enquanto carrega | Animated pulse |
| **Empty state** | Ilustração + texto quando 0 resultados | Contextual |
| **Totalizadores** | Rodapé com soma/média das colunas numéricas | Configurável |

#### Anatomia da DataTable

```
┌────────────────────────────────────────────────────────────────────────────┐
│ TOOLBAR                                                                    │
│ ┌──────────────────────────┐  ┌─────────┐  ┌───────┐  ┌─────┐  ┌──────┐ │
│ │ 🔍 Buscar equipamentos...│  │Filtros ▾│  │Colunas│  │ + │  │⋮ Menu│ │
│ └──────────────────────────┘  └─────────┘  └───────┘  └─────┘  └──────┘ │
│                                                                            │
│ Filtros ativos: [Turno: A ×] [Status: Operando ×]      [Limpar todos]     │
├────────────────────────────────────────────────────────────────────────────┤
│ HEADER (sortable + filterable)                                             │
│ ┌──┬──────────────┬──────────┬──────────┬────────┬──────────┬──────────┐  │
│ │☐ │ Equipamento ▲│ Modelo ≡ │ Status ≡ │ Prod. ▼│ DMT    ≡ │ Ações    │  │
│ │  │  [🔍 Filtro] │ [Multi▾] │ [Multi▾] │        │          │          │  │
│ ├──┼──────────────┼──────────┼──────────┼────────┼──────────┼──────────┤  │
│ │☐ │ CAT-01       │ 777G     │ 🟢 Oper. │ 1,450  │ 3.2 km   │ [⋮]     │  │
│ │☐ │ CAT-02       │ 777G     │ 🟡 Fila  │ 1,380  │ 2.8 km   │ [⋮]     │  │
│ │☑ │ CAT-03       │ 785D     │ 🔴 Manut │   -    │  -       │ [⋮]     │  │
│ │☐ │ CAT-04       │ 785D     │ 🟢 Oper. │ 1,290  │ 3.5 km   │ [⋮]     │  │
│ │☐ │ ESC-01       │ 6060     │ 🟢 Oper. │ 4,200  │  -       │ [⋮]     │  │
│ ├──┼──────────────┼──────────┼──────────┼────────┼──────────┼──────────┤  │
│ │  │              │          │ TOTAL:   │ 8,320  │ avg 3.2  │          │  │
│ └──┴──────────────┴──────────┴──────────┴────────┴──────────┴──────────┘  │
├────────────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                                     │
│ 1 selecionado | [🗑️ Deletar] [📤 Exportar]    Mostrando 1-20 de 52       │
│                                               [< 1 2 3 >] | 20/página ▾  │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Tipos de Filtro por Coluna

| Tipo dado | Filtro | UI |
|-----------|--------|----|
| TEXT | Contains, Starts with, Exact | Input text |
| NUMBER | >, <, =, between | Input number |
| ENUM/STATUS | Multi-select | Checkbox list + busca |
| DATE | Range (de → até) | Date picker range |
| BOOLEAN | Sim/Não/Todos | Toggle 3-state |
| ENTITY (FK) | Multi-select com busca | Combobox async |

#### Props da DataTable

```typescript
interface DataTableProps<T> {
    // Dados
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    
    // Features (tudo true por padrão)
    enableSort?: boolean;
    enableColumnFilter?: boolean;
    enableGlobalSearch?: boolean;
    enablePagination?: boolean;
    enableSelection?: boolean;
    enableColumnResize?: boolean;
    enableColumnReorder?: boolean;
    enableExport?: boolean;
    enableDensity?: boolean;
    enableTotals?: boolean;
    
    // Paginação
    pageSize?: number;                // default: 20
    pageSizeOptions?: number[];       // default: [10, 20, 50, 100]
    
    // Server-side (para tabelas grandes)
    serverSide?: boolean;
    totalRows?: number;
    onPaginationChange?: (page: number, size: number) => void;
    onSortChange?: (sort: SortState[]) => void;
    onFilterChange?: (filters: FilterState[]) => void;
    
    // Ações
    onRowClick?: (row: T) => void;
    onSelectionChange?: (selected: T[]) => void;
    bulkActions?: BulkAction[];       // ações em massa
    rowActions?: RowAction[];         // menu ⋮ por linha
    
    // Layout
    density?: 'compact' | 'normal' | 'relaxed';
    stickyColumns?: number;           // primeiras N fixas
    maxHeight?: string;               // scroll vertical
    
    // Personalização
    emptyState?: ReactNode;
    toolbar?: ReactNode;              // toolbar customizado adicional
}
```

---

### 2. Card / Panel

```
┌─────────────────────────────────────────┐
│ Header (título + ações)                  │
│ ┌─────────────────────────┐  ┌────────┐ │
│ │ 📊 Produção por Turno   │  │ ⋮  ↗ ✕│ │
│ └─────────────────────────┘  └────────┘ │
├─────────────────────────────────────────┤
│ Body (conteúdo)                          │
│                                          │
│  Chart / Table / Form / Content          │
│                                          │
├─────────────────────────────────────────┤
│ Footer (opcional — ações, info)          │
│ Atualizado há 2 min          [Ver mais] │
└─────────────────────────────────────────┘
```

```typescript
interface CardProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    actions?: CardAction[];       // botões no header
    collapsible?: boolean;
    loading?: boolean;
    noPadding?: boolean;          // para tabelas/charts full-bleed
    footer?: ReactNode;
    className?: string;
}
```

---

### 3. KPI Card

```
┌────────────────────────┐
│  📈 Disponibilidade     │
│                         │
│      87.3%              │  ← valor grande (text-4xl, font-bold)
│                         │
│  ▲ 2.1% vs ontem       │  ← delta com cor (verde=bom, vermelho=ruim)
│                         │
│  Meta: 85%  🟢          │  ← semáforo vs meta
│  ▁▂▃▄▅▆▇█▇▆▅▄▅▆▇       │  ← sparkline (últimos 14 dias)
└────────────────────────┘
```

```typescript
interface KPICardProps {
    label: string;
    value: number | string;
    format?: 'percent' | 'number' | 'currency' | 'duration';
    delta?: {
        value: number;
        label: string;        // 'vs ontem', 'vs semana passada'
        invertColors?: boolean; // true se menor = melhor (ex: MTTR)
    };
    target?: {
        value: number;
        status: 'above' | 'within' | 'below';
    };
    sparkline?: number[];      // dados para mini-gráfico
    icon?: LucideIcon;
    onClick?: () => void;      // drill-down
}
```

---

### 4. Formulários

Todos os formulários seguem o mesmo padrão visual e de validação.

```
┌─────────────────────────────────────────────────────────────────┐
│  Novo Equipamento                                     [✕ Fechar]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────── Dados Gerais ──────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Código *                    Nome                          │  │
│  │  ┌─────────────────────┐    ┌─────────────────────────┐   │  │
│  │  │ CAT-08              │    │ Caterpillar 08          │   │  │
│  │  └─────────────────────┘    └─────────────────────────┘   │  │
│  │                                                            │  │
│  │  Modelo *                    Contratada *                  │  │
│  │  ┌─────────────────────┐    ┌─────────────────────────┐   │  │
│  │  │ 777G            ▾  │    │ Mineradora ABC       ▾  │   │  │
│  │  └─────────────────────┘    └─────────────────────────┘   │  │
│  │                                                            │  │
│  │  Ano Fabricação      Placa            Chassi               │  │
│  │  ┌───────────┐      ┌───────────┐    ┌───────────────┐    │  │
│  │  │ 2022      │      │ ABC-1234  │    │ 9BWZZZ377V... │    │  │
│  │  └───────────┘      └───────────┘    └───────────────┘    │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────── Operação ──────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Horímetro Atual          Odômetro Atual                   │  │
│  │  ┌─────────────────┐     ┌─────────────────┐              │  │
│  │  │ 12,450.5     h  │     │ 85,230      km  │              │  │
│  │  └─────────────────┘     └─────────────────┘              │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                          [Cancelar]  [💾 Salvar Equipamento]     │
└─────────────────────────────────────────────────────────────────┘
```

#### Regras de formulário

| Regra | Detalhe |
|-------|---------|
| Labels sempre acima do input | Nunca inline/placeholder-only |
| Obrigatórios com * vermelho | Após o label |
| Validação inline | Erro aparece ao sair do campo (onBlur) |
| Agrupamento por seção | Fieldset com título |
| Botão primário à direita | Salvar = último botão, destaque brand |
| Cancelar sem confirmação | A menos que tenha dados preenchidos |
| Toast de sucesso | Após salvar, 3 seg auto-dismiss |
| Dados perdidos | Modal confirma se navegar com alterações |

---

### 5. Modal / Sheet / Dialog

| Tipo | Quando usar |
|------|-------------|
| **Modal** | Confirmações, formulários curtos (1-3 campos) |
| **Sheet (Drawer)** | Formulários longos, detalhes, edição (lateral direita) |
| **Dialog** | Confirmação destrutiva (deletar, cancelar) |
| **Toast** | Feedback rápido (sucesso, erro não-crítico) |
| **Command Palette** | Busca global, navegação rápida (Ctrl+K) |

---

### 6. Navegação

#### Sidebar (Desktop)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                               │
│ │ SIDE │  CONTENT                                                      │
│ │ BAR  │                                                               │
│ │      │                                                               │
│ │ 🏠   │  ┌─────────────────────────────────────────────────────────┐  │
│ │ Home │  │  Breadcrumb: Frota > Equipamentos > CAT-01              │  │
│ │      │  ├─────────────────────────────────────────────────────────┤  │
│ │ 🚜   │  │                                                         │  │
│ │ Frota│  │  Page content                                           │  │
│ │  ├──▶│  │                                                         │  │
│ │  ├ Eq│  │                                                         │  │
│ │  ├ Mo│  │                                                         │  │
│ │  └ Gr│  │                                                         │  │
│ │      │  │                                                         │  │
│ │ 📋   │  │                                                         │  │
│ │Check │  │                                                         │  │
│ │      │  │                                                         │  │
│ │ 🗺️   │  │                                                         │  │
│ │ Mapa │  │                                                         │  │
│ │      │  │                                                         │  │
│ │ 🔧   │  │                                                         │  │
│ │Manut.│  │                                                         │  │
│ │      │  │                                                         │  │
│ │ 📊   │  │                                                         │  │
│ │Relat.│  │                                                         │  │
│ │      │  │                                                         │  │
│ │──────│  │                                                         │  │
│ │ ⚙️   │  │                                                         │  │
│ │Config│  │                                                         │  │
│ └──────┘  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

- Sidebar **colapsável** (ícones only ou ícones + label)
- Submenu expande inline (tree-style)
- Badge com contadores (alertas, OS pendentes)
- User avatar + dropdown no bottom
- Tema toggle (dark/light)

---

### 7. Mapa (Game-Style)

O mapa é o coração visual do sistema. Utiliza **Deck.gl** sobre **MapLibre GL** para renderizar milhares de pontos com performance.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ MAP VIEW (fullscreen ou panel)                                          │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                                                                   │  │
│  │     🟢CAT-01  ───────→                                           │  │
│  │                         ╱╲                                        │  │
│  │     🟡CAT-02       ╱────  ────╲    🔵CAT-04                      │  │
│  │         │      ╱──────────────────╲   ←─────                     │  │
│  │         ▼   [FRENTE NORTE]          [BRITADOR]                   │  │
│  │                                                                   │  │
│  │  🔴CAT-03 ⚠️                    🟢ESC-01 ⛏️                       │  │
│  │  (PARADO 15min)                  (CARREGANDO)                    │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─── LEGENDA ─────────────────────────────────────────────────────┐   │
│  │ 🟢 Operando  🔵 Transp.Vazio  🟡 Fila/Espera  🔴 Parado/Alerta │   │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─── MINI PANEL (flutuante) ──┐                                       │
│  │ CAT-01 | 777G               │                                       │
│  │ Ativ: Transporte Cheio      │                                       │
│  │ Vel: 42 km/h | Ciclo #7     │                                       │
│  │ Op: João Silva              │                                       │
│  │ [Ver detalhes]              │                                       │
│  └─────────────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Features do Mapa

| Feature | Detalhe |
|---------|---------|
| **Ícones por tipo** | Caminhão, escavadeira, motoniveladora (SVG animado) |
| **Cor = status** | Verde, azul, amarelo, vermelho |
| **Trail** | Rastro das últimas N posições (polyline com fade) |
| **Geofences** | Polígonos semi-transparentes das áreas |
| **Clusters** | Agrupamento quando zoom out (com contagem) |
| **Tooltip** | Hover mostra mini-info |
| **Click** | Abre painel lateral com detalhes |
| **Animação** | Equipamentos se movem suavemente entre posições |
| **Heatmap** | Layer de densidade de tráfego (toggle) |
| **3D Terrain** | Elevação do terreno em operações de mina |
| **Night mode** | Mapa escuro para turno noturno |
| **Filtro visual** | Filtrar no mapa por status, modelo, frente |

---

## Padrões de Interação

### Loading States

| Tipo | Quando | Componente |
|------|--------|------------|
| Skeleton | Carregamento inicial | Pulse animated blocks |
| Spinner inline | Ação pontual (salvar, filtrar) | Spinner 16px no botão |
| Progress bar | Upload, processamento longo | Top bar ou inline |
| Optimistic UI | Ações rápidas (toggle, status) | Aplica visual imediato, reverte se falhar |

### Empty States

Toda tela vazia deve ter:
1. Ilustração relevante (SVG inline, NOT placeholder)
2. Título explicativo
3. Descrição curta
4. CTA (Call to Action) — botão para criar/importar

```
        ┌─────────────────────────┐
        │     🚜                   │
        │  (ilustração SVG)       │
        │                         │
        │  Nenhum equipamento     │
        │  cadastrado ainda       │
        │                         │
        │  Comece adicionando seu │
        │  primeiro equipamento.  │
        │                         │
        │  [+ Novo Equipamento]   │
        └─────────────────────────┘
```

### Confirmação Destrutiva

```
┌─────────────────────────────────────┐
│  ⚠️ Deletar equipamento?            │
│                                     │
│  CAT-03 (Caterpillar 777G)         │
│  será removido permanentemente.    │
│                                     │
│  Esta ação não pode ser desfeita.  │
│                                     │
│  Digite "CAT-03" para confirmar:   │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│        [Cancelar]  [🗑️ Deletar]     │
└─────────────────────────────────────┘
```

### Notificações / Toasts

```
Posição: top-right (desktop), bottom-center (mobile)
Duration: sucesso=3s, info=5s, warning=8s, error=persistent

┌─ Toast ──────────────────────────────────┐
│ ✅ Equipamento cadastrado com sucesso    ✕│
│    CAT-08 adicionado à frota.             │
│    [Visualizar]                           │
└───────────────────────────────────────────┘
```

---

## Layout de Páginas

### 1. Página de Listagem (CRUD)

```
┌─ Header ─────────────────────────────────────────────────────────┐
│  Equipamentos                      [+ Novo] [📥 Importar] [⋮]   │
│  52 equipamentos cadastrados                                     │
└──────────────────────────────────────────────────────────────────┘
┌─ Tabs (opcional) ────────────────────────────────────────────────┐
│  [Todos] [Operando] [Manutenção] [Inativos]                     │
└──────────────────────────────────────────────────────────────────┘
┌─ DataTable ──────────────────────────────────────────────────────┐
│  (componente padrão com sort, filtro, paginação)                 │
└──────────────────────────────────────────────────────────────────┘
```

### 2. Página de Detalhe

```
┌─ Breadcrumb ─────────────────────────────────────────────────────┐
│  Frota > Equipamentos > CAT-01                                   │
└──────────────────────────────────────────────────────────────────┘
┌─ Header ─────────────────────────────────────────────────────────┐
│  ┌────┐                                                          │
│  │ 🚜 │  CAT-01 — Caterpillar 777G         [✏️ Editar] [⋮]      │
│  │ img│  Contratada: Mineradora ABC | Status: 🟢 Operando        │
│  └────┘                                                          │
└──────────────────────────────────────────────────────────────────┘
┌─ KPI Row ────────────────────────────────────────────────────────┐
│  [Horímetro: 12,450h] [DF: 89%] [Prod: 1,450 ton] [DMT: 3.2km] │
└──────────────────────────────────────────────────────────────────┘
┌─ Tabs ───────────────────────────────────────────────────────────┐
│  [Resumo] [Ciclos] [Manutenções] [Checklist] [Componentes] [GPS]│
├──────────────────────────────────────────────────────────────────┤
│  (conteúdo da tab selecionada — charts, tables, timeline)        │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Dashboard

```
┌─ Filtros Globais ────────────────────────────────────────────────┐
│  Turno: [A ▾]  Período: [Hoje ▾]  Frente: [Todas ▾]             │
└──────────────────────────────────────────────────────────────────┘
┌─ KPI Cards ──────────────────────────────────────────────────────┐
│  [ KPI ] [ KPI ] [ KPI ] [ KPI ] [ KPI ]                        │
└──────────────────────────────────────────────────────────────────┘
┌─ Grid 2×2 ───────────────────────────────────────────────────────┐
│  ┌────────────────────────────┐  ┌────────────────────────────┐  │
│  │  Chart (linha temporal)    │  │  Chart (donut/composição)  │  │
│  └────────────────────────────┘  └────────────────────────────┘  │
│  ┌────────────────────────────┐  ┌────────────────────────────┐  │
│  │  Mapa mini (ou tabela)    │  │  Ranking (barras horiz.)   │  │
│  └────────────────────────────┘  └────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Responsividade

| Breakpoint | Largura | Layout |
|-----------|---------|--------|
| `sm` | <640px | Mobile: sidebar = bottom nav, cards stack, table scroll horizontal |
| `md` | 640-1024px | Tablet: sidebar colapsada, grid 1-2 cols |
| `lg` | 1024-1440px | Desktop: sidebar expandida, grid 2-3 cols |
| `xl` | >1440px | Wide: sidebar + content + optional panel lateral |

---

## Animações

| Elemento | Tipo | Duração | Easing |
|----------|------|---------|--------|
| Page transition | Fade + slide up | 200ms | ease-out |
| Modal enter | Scale 0.95→1 + fade | 200ms | spring |
| Modal exit | Scale 1→0.95 + fade | 150ms | ease-in |
| Toast enter | Slide from right | 300ms | spring |
| Table row hover | Background color | 100ms | linear |
| Chart bars enter | Grow from bottom | 500ms | ease-out (stagger 50ms) |
| Loading skeleton | Pulse gradient | 1.5s | infinite linear |
| Status badge pulse | Scale 1→1.1→1 | 1s | infinite ease |
| KPI value change | Number counter | 800ms | ease-out |
| Map marker move | Lerp position | 1000ms | linear |

---

## Acessibilidade (a11y)

| Requisito | Implementação |
|-----------|---------------|
| Contraste mínimo 4.5:1 | Validar todos os tokens |
| Focus visible | Ring 2px brand em todos os interativos |
| Keyboard navigation | Tab order lógico, Escape fecha modais |
| Screen reader | aria-label, role, aria-live para updates |
| Reduced motion | `prefers-reduced-motion`: sem animações |
| Font scale | rem everywhere, suporta até 200% |
| Skip to content | Link oculto no topo |
| Error messages | `aria-describedby` + `aria-invalid` |

---

## Padrão de Gráficos (Recharts)

### Configuração base de todos os charts

```typescript
const chartDefaults = {
    // Paleta principal
    colors: [
        '#3B82F6', // blue-500
        '#10B981', // emerald-500
        '#F59E0B', // amber-500
        '#8B5CF6', // violet-500
        '#EC4899', // pink-500
        '#06B6D4', // cyan-500
        '#F97316', // orange-500
        '#14B8A6', // teal-500
    ],
    
    // Estilo do grid
    grid: {
        strokeDasharray: '3 3',
        stroke: 'var(--border-default)',
        opacity: 0.5,
    },
    
    // Eixos
    axis: {
        tick: { fill: 'var(--text-muted)', fontSize: 12 },
        axisLine: { stroke: 'var(--border-default)' },
    },
    
    // Tooltip
    tooltip: {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        borderRadius: 8,
        boxShadow: 'var(--shadow-lg)',
    },
    
    // Legend
    legend: {
        align: 'right',
        verticalAlign: 'top',
        iconType: 'circle',
        iconSize: 8,
    },
    
    // Animação
    animation: {
        duration: 500,
        easing: 'ease-out',
    },
    
    // Responsivo
    responsive: true,
    aspect: 16/9,  // ratio padrão
};
```

### Wrapper de Chart

```typescript
// Todo chart no sistema usa esse wrapper
interface ChartContainerProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;          // botões no header (fullscreen, download)
    loading?: boolean;
    error?: string;
    empty?: boolean;
    emptyMessage?: string;
    height?: number | string;     // default: 300px
    children: ReactNode;          // Recharts components
}

// Funcionalidades automáticas do container:
// - Header com título + ações
// - Loading skeleton
// - Error state
// - Empty state
// - Resize observer (responsive)
// - Download como PNG/SVG (button no header)
// - Fullscreen mode (expand)
```

---

## Componentes de Formulário

| Componente | Uso |
|-----------|-----|
| `<Input>` | Texto, número, senha, busca |
| `<Select>` | Dropdown single-select |
| `<MultiSelect>` | Tags + dropdown multi-select |
| `<Combobox>` | Select com busca async (FK entities) |
| `<DatePicker>` | Data única |
| `<DateRangePicker>` | Período (de → até) |
| `<TimePicker>` | Horário |
| `<Checkbox>` | Boolean |
| `<Switch>` | Boolean toggle (ativo/inativo) |
| `<RadioGroup>` | Opção única de N |
| `<Textarea>` | Texto longo |
| `<FileUpload>` | Drag & drop + click |
| `<NumberInput>` | Com stepper + unidade (h, km, ton) |
| `<ColorPicker>` | Seleção de cor para áreas/grupos |
| `<GeoEditor>` | Desenhar polígono no mapa (geofences) |

---

## Nomenclatura de Componentes (Convenção)

```
src/
├── components/
│   ├── ui/                    # Primitivos (botão, input, dialog)
│   │   ├── Button.tsx
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx
│   │   │   ├── DataTableToolbar.tsx
│   │   │   ├── DataTablePagination.tsx
│   │   │   ├── DataTableColumnFilter.tsx
│   │   │   └── index.ts
│   │   ├── Chart/
│   │   │   ├── ChartContainer.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   └── index.ts
│   │   └── ...
│   ├── layout/                # Sidebar, Header, Footer, Breadcrumb
│   ├── forms/                 # Form wrappers por domínio
│   │   ├── EquipamentoForm.tsx
│   │   ├── OperadorForm.tsx
│   │   └── ...
│   └── features/             # Componentes de negócio
│       ├── mapa/
│       │   ├── MapView.tsx
│       │   ├── EquipmentLayer.tsx
│       │   ├── GeofenceLayer.tsx
│       │   └── TrailLayer.tsx
│       ├── ciclo/
│       │   ├── CycleTimeline.tsx
│       │   └── CycleStatus.tsx
│       └── report-builder/
│           ├── ReportCanvas.tsx
│           ├── WidgetConfigurator.tsx
│           └── ContextSelector.tsx
├── pages/                     # Rotas (React Router)
├── hooks/                     # Custom hooks
├── stores/                    # Zustand stores
├── services/                  # API calls
├── types/                     # TypeScript types
└── utils/                     # Helpers
```

---

## Regras de Ouro

1. **Toda tabela tem sort + filtro + paginação** — sem exceção, inclusive em modais e panels.
2. **Toda ação destrutiva pede confirmação** — modal com texto, não apenas "OK/Cancel".
3. **Todo loading tem skeleton** — não spinner genérico em tela cheia.
4. **Todo chart é interativo** — tooltip, click para drill, responsive.
5. **Todo formulário valida inline** — não esperar submit para mostrar erro.
6. **Todo componente é tipado** — interfaces TypeScript, nunca `any`.
7. **Dark mode é o padrão** — light mode funcional mas secundário.
8. **Componente > código repetido** — se usou 2x, abstrai.
9. **Mobile funcional, não perfeito** — desktop-first, tablet OK, mobile mínimo.
10. **Performance é feature** — virtualizar listas >100, lazy load routes, code split.
