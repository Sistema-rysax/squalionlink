# 🧠 Modelo Mental Completo — SqualionLink

## Revisão Geral & Auditoria de Consistência

Documento gerado após revisão completa dos 21 docs do repositório.
Identifica: duplicidades, relacionamentos faltantes, campos obrigatórios, constraints de unicidade, padrões de componente UI.

---

## 1. DUPLICIDADES ENCONTRADAS E RESOLVIDAS

### 1.1 equipamento_status_atual vs equipamento_snapshot
- **Problema**: ATIVIDADES.md define `equipamento_status_atual`, EQUIPAMENTO-SNAPSHOT.md redefine como `equipamento_snapshot`
- **Resolução**: ❌ REMOVER `equipamento_status_atual` → ✅ USAR apenas `equipamento_snapshot`
- Todos os refs a `equipamento_status_atual` devem apontar para `equipamento_snapshot`

### 1.2 perfil_funcionalidade vs perfil_permissao
- **Problema**: DATABASE.md original menciona `perfil_funcionalidade` (vínculo simples). AUTH-PERMISSOES-EMAIL.md cria `perfil_permissao` (com ações granulares)
- **Resolução**: ❌ REMOVER `perfil_funcionalidade` → ✅ USAR apenas `perfil_permissao`

### 1.3 funcionalidade (antes) vs funcionalidade (depois)
- **Problema**: A tabela `funcionalidade` original não tinha grupo nem ações disponíveis
- **Resolução**: ✅ Reestruturar: adicionar `id_funcionalidade_grupo` e `acoes_disponiveis`

### 1.4 Campo consumo_medio_lh duplicado
- **Problema**: Aparece em `equipamento_snapshot` (doc SNAPSHOT) E em ABASTECIMENTO (snapshot expansion)
- **Resolução**: ✅ Um único campo no snapshot. Calculado pelo engine de abastecimento.

### 1.5 Campos de abastecimento no snapshot
- **Problema**: SNAPSHOT.md já tinha `dt_ultimo_abastecimento` + `litros_ultimo_abastecimento`. ABASTECIMENTO.md expande com mais campos.
- **Resolução**: ✅ Versão do ABASTECIMENTO é a definitiva (mais completa). SNAPSHOT.md era a versão inicial.

---

## 2. RELACIONAMENTOS FALTANTES (CORRIGIDOS)

### 2.1 Tabelas que precisam de id_tenant e NÃO tinham explicitamente:
| Tabela | Fix |
|--------|-----|
| email_template | Adicionar id_tenant (NULL = global plataforma, NOT NULL = override do tenant) |
| modulo | NÃO precisa id_tenant (é global da plataforma) ✅ |
| funcionalidade_grupo | NÃO precisa (global) ✅ |
| funcionalidade | NÃO precisa (global — visibilidade controlada pelo plano) ✅ |

### 2.2 FKs faltantes / implícitas:
| De | Para | Relação | Status |
|----|------|---------|--------|
| abastecimento | turno | id_turno (em qual turno ocorreu) | ✅ Já tem |
| abastecimento | combustivel | id_combustivel (tipo de combustível) | ⚠️ Falta tabela `combustivel` |
| mensagem_operacional | turno | id_turno (contexto) | ⚠️ Falta (via mensagem_conversa) |
| equipamento | modelo_equipamento | capacidade_tanque vem do modelo | ⚠️ Adicionar campo no modelo |
| config_alerta_tanque | N/A | Depende de capacidade estar no modelo | ✅ OK via modelo |
| checklist_execucao | turno | Em qual turno foi executado | ⚠️ Avaliar adicionar |
| ordem_servico | turno | Em qual turno foi aberta | ⚠️ Avaliar adicionar |
| abastecimento | equipamento_snapshot | Atualiza snapshot após registro | ✅ Via engine (não FK) |

### 2.3 Tabelas faltantes identificadas:
| Tabela | Motivo |
|--------|--------|
| `combustivel` | Tipo de combustível (Diesel S10, S500, Arla 32) — ref em abastecimento |
| `tanque_reservatorio` | Tanques/reservatórios do posto (capacidade, nível atual) |
| `notificacao` | Sistema de notificações in-app (não só email) |
| `notificacao_config` | O que cada usuário quer receber (email, push, in-app) |
| `webhook_config` | Integrações outbound (chamar API externa ao ocorrer evento) |

---

## 3. MODELO RELACIONAL COMPLETO (Entidade → Relacionamentos)

### 3.1 Núcleo (Tenant + Usuário)

```
tenant
 ├── usuario (N)
 │    ├── usuario_credencial (1)
 │    ├── usuario_mfa (N — pode ter TOTP + SMS)
 │    ├── usuario_sso (N — pode ter Entra + Google)
 │    ├── auth_sessao (N)
 │    └── auth_log (N)
 ├── perfil (N)
 │    └── perfil_permissao (N) → funcionalidade + ações
 ├── auth_config (1)
 ├── sso_provedor (N)
 ├── email_config (1)
 └── traducao (N)
```

### 3.2 Frota

```
tenant
 ├── fabricante (N)
 ├── grupo_equipamento (N)
 │    └── modelo_equipamento (N) → fabricante
 │         ├── modelo_compatibilidade (N) — carga↔transporte
 │         ├── modelo_fator_enchimento (N) — por material
 │         ├── checklist_grupo_modelo (N) — checklists por modelo
 │         └── equipamento (N) → contratada
 │              ├── equipamento_snapshot (1) — estado real-time
 │              ├── equipamento_componente (N) — motor, pneus, etc
 │              ├── equipamento_hardware (N) → hardware (plataforma)
 │              ├── operador_habilitacao (N) — quem pode operar
 │              ├── abastecimento (N)
 │              ├── ordem_servico (N)
 │              ├── checklist_execucao (N)
 │              ├── gps_posicao (N) — particionado/mês
 │              ├── equipamento_atividade_historico (N)
 │              ├── ciclo_operacional (N)
 │              └── mensagem_conversa (N)
 ├── contratada (N) — dona dos equipamentos
 └── combustivel (N) — tipos de combustível
```

### 3.3 Operador

```
tenant
 └── operador (N)
      ├── operador_habilitacao (N) → modelo_equipamento
      ├── operador_documento (N) — CNH, ASO, etc
      ├── operador_turno_calendario (N) — escala do operador
      └── [aparece em]: equipamento_snapshot.id_operador_atual,
                        abastecimento.id_operador,
                        checklist_execucao.id_operador,
                        ciclo_operacional.id_operador
```

### 3.4 Áreas & Rotas

```
tenant
 ├── area (N)
 │    ├── subarea (N) — bancadas
 │    │    └── subarea_qualidade (N) — qualidade por bancada
 │    ├── rotograma (N) — limites de velocidade
 │    │    └── rotograma_trecho (N) — segmentos + velocidades
 │    └── rota (N) — origem → destino
 │         ├── apropriacao_rota (N) — centro_custo + DMT + ciclo
 │         │    └── apropriacao_rota_modelo (N) — override por modelo
 │         └── ciclo_operacional (N)
 ├── material (N) — ROM, Estéril, Minério
 │    └── material_elemento (N) — composição química
 └── centro_custo (N) — onde debitar
```

### 3.5 Operação / Atividades

```
tenant
 ├── atividade (N) — config de atividades possíveis
 │    └── atividade_regra (N) — regras de alerta por atividade
 ├── turno (N)
 │    └── regime_turno (N)
 │         └── regime_turno_calendario (N) — EXCLUDE constraint
 ├── periodo_fechamento (N) — ABERTO/FECHADO/REABERTO
 └── alerta (N) — alertas gerados pelo sistema
```

### 3.6 Qualidade & Pilha

```
tenant
 ├── elemento_quimico (N) — Fe, SiO2, Al2O3
 ├── pilha (N) — pilhas de estoque
 │    ├── pilha_qualidade_atual (1) — média ponderada
 │    ├── pilha_qualidade_historico (N) — entradas/saídas
 │    └── pilha_movimentacao (N) — entrada/saída ton
 └── granulometria_faixa (N) — faixas de granulometria
```

### 3.7 Manutenção

```
tenant
 ├── tipo_manutencao (N) — CORRETIVA, PREVENTIVA
 ├── plano_manutencao (N)
 │    └── plano_manutencao_item (N) — cada serviço do plano
 ├── ordem_servico (N) → equipamento
 │    ├── os_item (N) — serviços na OS
 │    └── os_peca (N) → peca
 ├── peca (N) — catálogo
 │    └── peca_movimentacao (N) — entrada/saída estoque
 └── solicitacao_manutencao (N) — pedido do operador
```

### 3.8 Hardware (Plataforma)

```
-- SEM id_tenant (patrimônio da Rysax)
tipo_hardware (N) — GPS, Tablet, Câmera
 └── hardware (N) — cada device individual
      ├── hardware_movimentacao (N) — ESTOQUE→CEDIDO→INSTALADO...
      ├── hardware_manutencao (N)
      └── equipamento_hardware (N) → equipamento (tenant)
           -- id_tenant_atual (nullable): em qual cliente está agora
```

### 3.9 Plano & Assinatura

```
plano (N) — BASIC, PROFESSIONAL, ENTERPRISE
 ├── plano_funcionalidade (N) → funcionalidade
 │    -- Quais funcionalidades cada plano inclui
 └── tenant.id_plano → limita perfil_permissao
```

---

## 4. CAMPOS OBRIGATÓRIOS POR TELA (NOT NULL)

### Legenda
- 🔴 = NOT NULL (obrigatório, bloqueia submit)
- 🟡 = Recomendado (warning, mas permite salvar)
- ⚪ = Opcional

### 4.1 Equipamento (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Código/TAG | 🔴 | VARCHAR(30) | UNIQUE per tenant |
| Modelo | 🔴 | FK select | Inline create se tem FROTA_MODELO.CRIAR |
| Contratada | 🔴 | FK select | Inline create se tem FROTA_CONTRATADA.CRIAR |
| Número de série | 🟡 | VARCHAR(50) | UNIQUE per tenant (se preenchido) |
| Ano fabricação | 🟡 | INT | |
| Placa | ⚪ | VARCHAR(10) | UNIQUE per tenant (se preenchido) |
| Chassi | ⚪ | VARCHAR(50) | UNIQUE per tenant (se preenchido) |
| Horímetro inicial | 🟡 | NUMERIC | Default 0 |
| Odômetro inicial | ⚪ | NUMERIC | Default 0 |
| Status | 🔴 | ENUM select | Default: ATIVO |
| Foto | ⚪ | Upload | |

### 4.2 Operador (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome completo | 🔴 | VARCHAR(255) | |
| Matrícula | 🔴 | VARCHAR(30) | UNIQUE per tenant |
| CPF | 🟡 | VARCHAR(14) | UNIQUE per tenant (mascarado) |
| Contratada | 🔴 | FK select | |
| Cargo | 🟡 | VARCHAR(100) | |
| Status | 🔴 | ENUM | Default: ATIVO |
| Habilitações | 🟡 | Multi-select modelo | Quais modelos pode operar |
| Telefone | ⚪ | VARCHAR(20) | |
| Data admissão | ⚪ | DATE | |
| Foto | ⚪ | Upload | |

### 4.3 Modelo de Equipamento (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(100) | UNIQUE per tenant |
| Fabricante | 🔴 | FK select | Inline create |
| Grupo | 🔴 | FK select | Inline create |
| Tipo operação | 🔴 | ENUM | CARGA, TRANSPORTE, APOIO |
| Capacidade (ton) | 🔴 se TRANSPORTE | NUMERIC | |
| Volume caçamba (m³) | 🟡 | NUMERIC | |
| Capacidade tanque (L) | 🟡 | NUMERIC | Necessário pra % tanque funcionar |
| Velocidade máx (km/h) | 🟡 | NUMERIC | Para alertas de excesso |
| Qtd passes | ⚪ | INT | Via modelo_compatibilidade |

### 4.4 Área (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(100) | UNIQUE per tenant |
| Tipo | 🔴 | ENUM | FRENTE_LAVRA, PILHA, BRITADOR, ROTA, APOIO, DESCARGA |
| Polígono (geofence) | 🔴 | JSONB / GeoJSON | Desenhado no mapa |
| Cor no mapa | 🟡 | VARCHAR(7) | Hex color |
| Material padrão | ⚪ | FK select | |
| Ativa | 🔴 | BOOLEAN | Default: true |

### 4.5 Atividade (Config)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(100) | UNIQUE per tenant |
| Código | 🔴 | VARCHAR(20) | UNIQUE per tenant |
| Classificação | 🔴 | ENUM | PRODUTIVA, IMPRODUTIVA, MANUTENCAO |
| Tipo | 🔴 | ENUM | OPERACIONAL, FILA, MANOBRA, DESLOCAMENTO |
| Cor | 🔴 | VARCHAR(7) | Para timeline/gráficos |
| Ícone | 🟡 | VARCHAR(50) | |
| Conta como DF | 🔴 | BOOLEAN | Default conforme classificação |

### 4.6 Turno (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(50) | UNIQUE per tenant |
| Código | 🔴 | VARCHAR(10) | UNIQUE per tenant (A, B, C) |
| Hora início | 🔴 | TIME | |
| Hora fim | 🔴 | TIME | |
| Cor | 🟡 | VARCHAR(7) | |
| Cruza meia-noite | 🔴 | BOOLEAN | Calculado auto (fim < inicio) |

### 4.7 Contratada (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Razão social | 🔴 | VARCHAR(255) | |
| Nome fantasia | 🔴 | VARCHAR(255) | UNIQUE per tenant |
| CNPJ | 🟡 | VARCHAR(18) | UNIQUE per tenant |
| Tipo | 🔴 | ENUM | PROPRIA, TERCEIRIZADA |
| Contato nome | ⚪ | VARCHAR(255) | |
| Contato telefone | ⚪ | VARCHAR(20) | |
| Contato email | ⚪ | VARCHAR(255) | |

### 4.8 Material (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(100) | UNIQUE per tenant |
| Código | 🔴 | VARCHAR(20) | UNIQUE per tenant |
| Tipo | 🔴 | ENUM | MINERIO, ESTERIL, MISTO |
| Densidade (t/m³) | 🟡 | NUMERIC | Necessário para cálculos de volume |
| Cor | 🟡 | VARCHAR(7) | |

### 4.9 Posto de Abastecimento (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(100) | UNIQUE per tenant |
| Tipo | 🔴 | ENUM | FIXO, COMBOIO |
| Área (geofence) | 🟡 | FK select | Se FIXO |
| Equipamento comboio | 🔴 se COMBOIO | FK select | |
| Capacidade (L) | 🟡 | NUMERIC | |

### 4.10 Checklist Grupo (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(100) | UNIQUE per tenant |
| Tipo | 🔴 | ENUM | PRE_OPERACAO, FIM_TURNO, INSPECAO |
| Modelos vinculados | 🔴 | Multi FK | Quais modelos usam este checklist |
| Itens | 🔴 | Inline list (≥1) | Pelo menos 1 item |

### 4.11 Checklist Item (dentro do grupo)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Descrição | 🔴 | VARCHAR(255) | UNIQUE dentro do grupo |
| Tipo resposta | 🔴 | ENUM | CONFORME_NAO_CONFORME, TEXTO, NUMERO, FOTO |
| Obrigatório | 🔴 | BOOLEAN | Default: true |
| Ordem | 🔴 | INT | Auto-incremento |
| Requer foto se NC | ⚪ | BOOLEAN | |
| Requer observação se NC | ⚪ | BOOLEAN | |

### 4.12 Ordem de Serviço (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Equipamento | 🔴 | FK select | |
| Tipo | 🔴 | ENUM | CORRETIVA, PREVENTIVA |
| Prioridade | 🔴 | ENUM | BAIXA, MEDIA, ALTA, URGENTE |
| Descrição | 🔴 | TEXT | |
| Solicitante | 🔴 | FK (auto: user logado) | |
| Data prevista | 🟡 | DATE | |
| Componente | ⚪ | FK select | Qual componente afetado |

### 4.13 Rota (Origem → Destino)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Origem (área) | 🔴 | FK select | |
| Destino (área) | 🔴 | FK select | |
| Material | 🔴 | FK select | |
| Distância (km) | 🟡 | NUMERIC | |
| UNIQUE | — | — | (id_tenant, origem, destino, material) |

### 4.14 Usuário (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(255) | |
| Email | 🔴 | VARCHAR(255) | UNIQUE global |
| Perfil | 🔴 | FK select | |
| Contratada | 🟡 | FK select | Para restrição "só vê sua contratada" |
| Telefone | ⚪ | VARCHAR(20) | |
| Idioma preferido | 🟡 | ENUM | Default: pt-BR |
| MFA obrigatório | — | — | Vem da auth_config do tenant |
| Status | 🔴 | ENUM | ATIVO, INATIVO, BLOQUEADO |

### 4.15 Perfil (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Nome | 🔴 | VARCHAR(100) | UNIQUE per tenant |
| Descrição | 🟡 | TEXT | |
| É admin | 🔴 | BOOLEAN | Default: false (se true, bypass permissões) |
| Permissões | 🔴 | Matrix funcionalidade×ações | Tela dedicada |

### 4.16 Mensagem Template (CRUD)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Título | 🔴 | VARCHAR(100) | UNIQUE per tenant |
| Conteúdo | 🔴 | TEXT | |
| Categoria | 🔴 | ENUM | DISPATCH, SEGURANCA, MANUTENCAO, GERAL |
| Prioridade padrão | 🔴 | ENUM | Default: NORMAL |
| Requer confirmação | 🔴 | BOOLEAN | Default: false |

### 4.17 Abastecimento (Registro)
| Campo | Obrig. | Tipo | Notas |
|-------|--------|------|-------|
| Equipamento | 🔴 | FK select | |
| Litros | 🔴 | NUMERIC | > 0 |
| Data/hora | 🔴 | DATETIME | Default: NOW() |
| Posto | 🟡 | FK select | |
| Combustível | 🔴 | FK select | Inline create |
| Operador | 🟡 | FK select | Auto-preenche do snapshot |
| Horímetro momento | 🟡 | NUMERIC | Auto-preenche do snapshot |
| Odômetro momento | ⚪ | NUMERIC | Auto-preenche do snapshot |

---

## 5. CONSTRAINTS DE UNICIDADE (UNIQUE)

### Regra geral: UNIQUE é sempre **por tenant** (exceto email de usuário e entidades de plataforma)

```sql
-- ═══ PADRÃO: UNIQUE PER TENANT ═══

-- Equipamento
UNIQUE(id_tenant, codigo)                    -- TAG do equipamento
UNIQUE(id_tenant, numero_serie) WHERE numero_serie IS NOT NULL
UNIQUE(id_tenant, placa) WHERE placa IS NOT NULL

-- Operador
UNIQUE(id_tenant, matricula)
UNIQUE(id_tenant, cpf) WHERE cpf IS NOT NULL

-- Modelo
UNIQUE(id_tenant, nome)                      -- "CAT 777G" único por cliente

-- Área
UNIQUE(id_tenant, nome)

-- Atividade
UNIQUE(id_tenant, codigo)
UNIQUE(id_tenant, nome)

-- Turno
UNIQUE(id_tenant, codigo)
UNIQUE(id_tenant, nome)

-- Contratada
UNIQUE(id_tenant, nome_fantasia)
UNIQUE(id_tenant, cnpj) WHERE cnpj IS NOT NULL

-- Material
UNIQUE(id_tenant, codigo)
UNIQUE(id_tenant, nome)

-- Rota (combinação)
UNIQUE(id_tenant, id_area_origem, id_area_destino, id_material)

-- Perfil
UNIQUE(id_tenant, nome)

-- Checklist Grupo
UNIQUE(id_tenant, nome)

-- Posto Abastecimento
UNIQUE(id_tenant, nome)

-- Combustível
UNIQUE(id_tenant, nome)

-- Centro Custo
UNIQUE(id_tenant, codigo)

-- Mensagem Template
UNIQUE(id_tenant, titulo)

-- ═══ UNIQUE GLOBAL (sem tenant) ═══

-- Usuário
UNIQUE(email)                               -- email é login, globalmente único

-- Hardware (plataforma)
UNIQUE(numero_serie)                        -- SN de cada device é global

-- Funcionalidade (catálogo)
UNIQUE(codigo)                              -- 'FROTA_EQUIPAMENTO' único no sistema
```

### Partial UNIQUE (com WHERE)

```sql
-- Apropriação: só 1 ativa por rota+material
UNIQUE(id_tenant, id_area_origem, id_area_destino, id_material) 
  WHERE dt_fim IS NULL

-- Regime turno: EXCLUDE constraint (sem overlap de datas)
EXCLUDE USING gist (
  id_equipamento WITH =,
  daterange(dt_inicio, dt_fim) WITH &&
)

-- Snapshot: 1 por equipamento
UNIQUE(id_tenant, id_equipamento)
```

---

## 6. PADRÃO DE COMPONENTE UI: INLINE CREATE

### Princípio
> Se o campo é um FK (select/combobox) e o usuário tem permissão de CRIAR na funcionalidade daquela entidade, ele pode criar ali mesmo sem sair da tela.

### Implementação (componente `SmartSelect`)

```tsx
// Componente reutilizável para todo o sistema
interface SmartSelectProps {
  // Dados
  label: string;
  endpoint: string;           // '/api/modelo-equipamento'
  value: number | null;
  onChange: (id: number) => void;
  
  // Permissão de criar inline
  funcionalidadeCriar?: string;   // 'FROTA_MODELO'
  formCriarComponent?: React.FC;  // formulário compacto para criar
  
  // Comportamento
  required?: boolean;
  placeholder?: string;
  searchable?: boolean;       // permite digitar para filtrar
  allowClear?: boolean;
}
```

**Lógica:**
1. Componente carrega opções do endpoint
2. Se usuário tem permissão `funcionalidadeCriar.CRIAR` → mostra botão "+" no canto
3. Botão "+" abre um mini-form (dialog inline ou popover) com campos obrigatórios
4. Ao salvar no mini-form → POST no endpoint → novo item selecionado automaticamente
5. Se NÃO tem permissão → botão "+" não aparece. Só seleciona dos existentes.

### Mapa de SmartSelect por tela:

| Tela | Campo Select | FK para | Funcionalidade para inline create |
|------|--------------|---------|----------------------------------|
| Equipamento | Modelo | modelo_equipamento | FROTA_MODELO |
| Equipamento | Contratada | contratada | FROTA_CONTRATADA |
| Equipamento | Fabricante (via modelo) | fabricante | FROTA_FABRICANTE |
| Modelo | Fabricante | fabricante | FROTA_FABRICANTE |
| Modelo | Grupo | grupo_equipamento | FROTA_GRUPO |
| Operador | Contratada | contratada | FROTA_CONTRATADA |
| Área | Material padrão | material | AREA_MATERIAL |
| Rota | Origem (área) | area | AREA_CADASTRO |
| Rota | Destino (área) | area | AREA_CADASTRO |
| Rota | Material | material | AREA_MATERIAL |
| Abastecimento | Equipamento | equipamento | (não cria — só seleciona) |
| Abastecimento | Posto | posto_abastecimento | OPERACAO_ABASTECIMENTO |
| Abastecimento | Combustível | combustivel | OPERACAO_ABASTECIMENTO |
| OS | Equipamento | equipamento | (não cria) |
| OS | Componente | equipamento_componente | (não cria inline) |
| Checklist | Modelos | modelo_equipamento | (multi-select, não cria) |
| Mensagem | Template | mensagem_template | OPERACAO_MSG_TEMPLATE |
| Usuário | Perfil | perfil | ADMIN_PERFIL |
| Usuário | Contratada | contratada | FROTA_CONTRATADA |
| Apropriação | Centro custo | centro_custo | PLANEJ_CENTRO_CUSTO |

### Regra: quando NÃO mostrar inline create
- Entidades complexas (equipamento, operador, OS) → não faz sentido criar inline
- Entidades com muitos campos obrigatórios → abrir drawer/sheet dedicado
- Limitar inline create a entidades com 1-3 campos (nome, código, tipo)

---

## 7. TABELAS FALTANTES IDENTIFICADAS

```sql
-- ═══════════════════════════════════════════════════════════════
-- COMBUSTÍVEL (tipo de combustível)
-- ═══════════════════════════════════════════════════════════════
combustivel (
    id_combustivel BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    nome VARCHAR(50) NOT NULL,               -- 'Diesel S10', 'Diesel S500', 'Arla 32'
    codigo VARCHAR(20) NOT NULL,
    unidade VARCHAR(10) NOT NULL DEFAULT 'L', -- litros, kg
    custo_unitario NUMERIC(10,4),            -- R$/L (para cálculo de custo)
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_tenant, nome),
    UNIQUE(id_tenant, codigo)
);

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICAÇÃO IN-APP (bell icon no header)
-- ═══════════════════════════════════════════════════════════════
notificacao (
    id_notificacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    
    tipo VARCHAR(30) NOT NULL,
    -- ALERTA_EQUIPAMENTO, OS_ATRIBUIDA, FECHAMENTO, DOCUMENTO_VENCENDO,
    -- CHECKLIST_NC, MENSAGEM_RECEBIDA, SISTEMA
    
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    
    -- Link para onde navegar ao clicar
    rota_frontend VARCHAR(200),
    parametros JSONB,                        -- {"id_equipamento": 123}
    
    -- Prioridade visual
    prioridade VARCHAR(20) DEFAULT 'NORMAL', -- BAIXA, NORMAL, ALTA, CRITICA
    
    -- Estado
    lida BOOLEAN NOT NULL DEFAULT false,
    dt_leitura TIMESTAMP,
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_expiracao TIMESTAMP                   -- auto-remove após X dias
);

CREATE INDEX idx_notif_user ON notificacao(id_usuario, lida, dt_registro DESC);

-- ═══════════════════════════════════════════════════════════════
-- PREFERÊNCIA DE NOTIFICAÇÃO (por usuário)
-- ═══════════════════════════════════════════════════════════════
notificacao_preferencia (
    id_notificacao_preferencia BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    
    tipo_notificacao VARCHAR(30) NOT NULL,    -- mesmo ENUM de notificacao.tipo
    
    canal_web BOOLEAN DEFAULT true,          -- mostra no bell icon?
    canal_email BOOLEAN DEFAULT false,       -- envia email?
    canal_push BOOLEAN DEFAULT false,        -- push notification (se tem app)?
    
    UNIQUE(id_usuario, tipo_notificacao)
);

-- ═══════════════════════════════════════════════════════════════
-- GRUPO EQUIPAMENTO (faltava modelagem formal)
-- ═══════════════════════════════════════════════════════════════
grupo_equipamento (
    id_grupo_equipamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    nome VARCHAR(100) NOT NULL,              -- 'Caminhão Fora de Estrada', 'Escavadeira', 'Perfuratriz'
    codigo VARCHAR(20) NOT NULL,
    tipo_operacao VARCHAR(20) NOT NULL,      -- CARGA, TRANSPORTE, APOIO, PERFURACAO
    icone VARCHAR(50),
    cor VARCHAR(7),
    ordem INT DEFAULT 0,
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_tenant, nome),
    UNIQUE(id_tenant, codigo)
);

-- ═══════════════════════════════════════════════════════════════
-- FABRICANTE
-- ═══════════════════════════════════════════════════════════════
fabricante (
    id_fabricante BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    nome VARCHAR(100) NOT NULL,              -- 'Caterpillar', 'Komatsu', 'Volvo'
    pais_origem VARCHAR(50),
    logo_url VARCHAR(500),
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_tenant, nome)
);

-- ═══════════════════════════════════════════════════════════════
-- MODELO EQUIPAMENTO (adicionar capacidade_tanque)
-- ═══════════════════════════════════════════════════════════════
-- ALTER TABLE modelo_equipamento ADD COLUMN:
--   capacidade_tanque_litros NUMERIC(8,2)    -- necessário para % de tanque
--   peso_operacional_kg NUMERIC(12,2)        -- para cálculos de carga
--   potencia_hp NUMERIC(8,1)                 -- ficha técnica
--   velocidade_maxima_kmh NUMERIC(5,1)       -- para rotograma

-- ═══════════════════════════════════════════════════════════════
-- AUDIT TRAIL (log genérico de alterações)
-- ═══════════════════════════════════════════════════════════════
audit_trail (
    id_audit_trail BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_usuario BIGINT REFERENCES usuario(id_usuario),
    
    tabela VARCHAR(100) NOT NULL,            -- 'equipamento', 'operador'
    id_registro BIGINT NOT NULL,             -- PK do registro alterado
    acao VARCHAR(20) NOT NULL,               -- 'INSERT', 'UPDATE', 'DELETE'
    
    dados_antes JSONB,                       -- estado anterior (NULL se INSERT)
    dados_depois JSONB,                      -- estado novo (NULL se DELETE)
    campos_alterados TEXT[],                 -- ['nome', 'status'] — quais campos mudaram
    
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tabela ON audit_trail(id_tenant, tabela, id_registro, dt_registro DESC);
CREATE INDEX idx_audit_user ON audit_trail(id_usuario, dt_registro DESC);
```

---

## 8. VALIDAÇÕES DE NEGÓCIO (por entidade)

### 8.1 Validações ao CRIAR/EDITAR

| Entidade | Validação | Tipo |
|----------|-----------|------|
| Equipamento | Código não pode ter espaço/caractere especial | Frontend + Backend |
| Equipamento | Se tem placa, formato válido (AAA-0000 ou AAA0A00) | Frontend |
| Equipamento | Horímetro inicial ≥ 0 | Backend |
| Operador | CPF válido (dígito verificador) | Frontend + Backend |
| Operador | Matrícula: alfanumérico, sem espaço | Frontend |
| Turno | Hora início ≠ hora fim | Backend |
| Turno | Não sobrepor com outro turno do mesmo regime | Backend (EXCLUDE) |
| Rota | Origem ≠ Destino | Backend |
| Apropriação | Não duplicar (mesma rota+material ativa) | UNIQUE WHERE |
| Abastecimento | Litros > 0 e < capacidade_tanque × 1.1 | Backend |
| Abastecimento | Horímetro ≥ horímetro anterior | Backend |
| OS | Não pode abrir OS se equipamento já tem OS aberta do mesmo tipo | Backend |
| Checklist | Grupo precisa ter ≥ 1 item | Backend |
| Perfil | Não pode ter perfil sem nenhuma permissão (warning) | Frontend |
| Usuário | Email formato válido | Frontend + Backend |
| Mensagem | Conteúdo ≤ 500 caracteres | Frontend + Backend |
| Área | Polígono precisa ter ≥ 3 pontos | Backend |
| Área | Polígono não pode se auto-intersectar | Backend |

### 8.2 Validações ao DELETAR (soft delete)

| Entidade | Bloqueio | Mensagem |
|----------|----------|----------|
| Equipamento | Se tem snapshot ativo (em operação) | "Equipamento em operação. Coloque INATIVO antes de remover." |
| Modelo | Se tem equipamentos vinculados | "Existem X equipamentos deste modelo." |
| Contratada | Se tem equipamentos ou operadores | "Contratada possui vínculos ativos." |
| Área | Se é origem/destino de rota ativa | "Área utilizada em X rotas." |
| Material | Se usado em rotas ou pilhas | "Material em uso." |
| Turno | Se usado em regime ativo | "Turno em uso no regime atual." |
| Perfil | Se tem usuários vinculados | "X usuários utilizam este perfil." |
| Atividade | Se é atividade atual de algum equipamento | "Atividade em uso por X equipamentos." |
| Combustível | Se tem abastecimentos | "Combustível possui registros." |
| Posto | Se tem abastecimentos | "Posto possui registros." |

---

## 9. O QUE FALTA PARA GARANTIR QUE FUNCIONA

### 9.1 Infraestrutura / Cross-cutting

| Item | Status | Prioridade |
|------|--------|-----------|
| Audit trail genérico (quem alterou o quê, quando) | ⚠️ Adicionado neste doc | ALTA |
| Notificações in-app (bell icon) | ⚠️ Adicionado neste doc | ALTA |
| Preferência de notificação por usuário | ⚠️ Adicionado neste doc | MÉDIA |
| Rate limiting por tenant (evitar abuse) | ❌ Falta doc | MÉDIA |
| Soft delete cascata (se deleta contratada, equips ficam orphan?) | ❌ Definir regra | ALTA |
| Versionamento de API (/v1/) | ❌ Falta definir | BAIXA |
| Health check endpoint (/health) | ❌ Trivial | BAIXA |
| Paginação padrão (cursor vs offset) | ❌ Definir | MÉDIA |
| Filtros genéricos (como a API recebe filtros?) | ❌ Definir | ALTA |
| Upload de arquivos (fotos equip, docs operador, anexos OS) | ❌ Falta doc | ALTA |

### 9.2 Tabela: modelo_equipamento — campos faltantes

```sql
-- Campos que DEVEM existir para o sistema funcionar:
capacidade_tanque_litros NUMERIC(8,2)    -- sem isso, % tanque não funciona
peso_operacional_kg NUMERIC(12,2)        -- cálculos de carga
potencia_hp NUMERIC(8,1)                 -- ficha técnica / relatórios
velocidade_maxima_kmh NUMERIC(5,1)       -- default para rotograma
consumo_referencia_lh NUMERIC(8,2)       -- consumo esperado do fabricante (para alertar desvio)
```

### 9.3 Padrão de paginação e filtros

```typescript
// Request padrão para listagem
GET /api/equipamento?
  page=1&
  pageSize=25&
  sort=codigo&
  sortDir=asc&
  search=CAT&                    // busca textual (nome, código)
  filter[status]=ATIVO&          // filtro exato
  filter[id_contratada]=5&       // FK filtro
  filter[id_grupo]=2&
  dateFrom=2024-01-01&           // range de data
  dateTo=2024-12-31

// Response padrão
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 142,
    "totalPages": 6
  }
}
```

### 9.4 Upload de arquivos

```sql
-- Tabela genérica de arquivo (qualquer entidade pode ter anexos)
arquivo (
    id_arquivo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    -- Vínculo polimórfico
    entidade VARCHAR(50) NOT NULL,           -- 'equipamento', 'operador', 'ordem_servico'
    id_entidade BIGINT NOT NULL,             -- PK da entidade
    
    -- Arquivo
    nome_original VARCHAR(255) NOT NULL,
    nome_storage VARCHAR(255) NOT NULL,      -- nome no S3
    tipo_mime VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    
    -- Categorização
    categoria VARCHAR(50),                   -- 'FOTO', 'DOCUMENTO', 'RELATORIO', 'ANEXO'
    descricao VARCHAR(255),
    
    -- Storage
    bucket VARCHAR(100) NOT NULL,
    path_s3 VARCHAR(500) NOT NULL,
    url_presigned VARCHAR(1000),             -- gerado sob demanda (expira)
    
    -- Controle
    id_usuario_upload BIGINT REFERENCES usuario(id_usuario),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_arquivo_entidade ON arquivo(entidade, id_entidade);
```

---

## 10. MODELO MENTAL — DIAGRAMA DE DEPENDÊNCIAS

```
                        ┌────────────────────────────────┐
                        │         PLATAFORMA             │
                        │  (Rysax - sem id_tenant)       │
                        ├────────────────────────────────┤
                        │ • tipo_hardware                │
                        │ • hardware                     │
                        │ • hardware_movimentacao        │
                        │ • plano (BASIC/PRO/ENTERPRISE) │
                        │ • modulo                       │
                        │ • funcionalidade_grupo         │
                        │ • funcionalidade               │
                        └──────────┬─────────────────────┘
                                   │
                                   │ plano → habilita funcionalidades
                                   │ hardware → cedido para tenant
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            TENANT (RLS)                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─── IDENTIDADE ──────┐  ┌─── ACESSO ──────────────────────────────┐  │
│  │ tenant               │  │ usuario → credencial → mfa → sessao    │  │
│  │ auth_config          │  │ perfil → perfil_permissao              │  │
│  │ sso_provedor         │  │ usuario_sso                            │  │
│  │ email_config         │  │ auth_log                               │  │
│  └──────────────────────┘  └─────────────────────────────────────────┘  │
│                                                                          │
│  ┌─── CADASTROS BASE ──────────────────────────────────────────────┐    │
│  │ fabricante                                                       │    │
│  │ grupo_equipamento                                                │    │
│  │ modelo_equipamento → modelo_compatibilidade                      │    │
│  │                    → modelo_fator_enchimento                      │    │
│  │ contratada                                                       │    │
│  │ combustivel                                                      │    │
│  │ material → material_elemento                                     │    │
│  │ elemento_quimico                                                 │    │
│  │ centro_custo                                                     │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── FROTA ────────────────────────────────────────────────────────┐   │
│  │ equipamento → equipamento_snapshot (1:1 real-time)                │   │
│  │             → equipamento_componente                              │   │
│  │             → equipamento_hardware (→ hardware plataforma)        │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─── PESSOAS ──────────────────────────────────────────────────────┐   │
│  │ operador → operador_habilitacao (→ modelo)                        │   │
│  │          → operador_documento                                     │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─── ÁREAS & ROTAS ───────────────────────────────────────────────┐    │
│  │ area → subarea → subarea_qualidade                               │    │
│  │     → rotograma → rotograma_trecho                               │    │
│  │ rota (origem→destino→material)                                    │    │
│  │ apropriacao_rota → apropriacao_rota_modelo                       │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── OPERAÇÃO (tempo real) ────────────────────────────────────────┐   │
│  │ atividade → atividade_regra                                       │   │
│  │ turno → regime_turno → regime_turno_calendario                    │   │
│  │ gps_posicao (particionado)                                        │   │
│  │ equipamento_atividade_historico (particionado)                     │   │
│  │ ciclo_operacional                                                 │   │
│  │ alerta                                                            │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─── ABASTECIMENTO ───────────────────────────────────────────────┐    │
│  │ posto_abastecimento                                              │    │
│  │ abastecimento                                                     │    │
│  │ config_alerta_tanque                                              │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── MANUTENÇÃO ──────────────────────────────────────────────────┐    │
│  │ plano_manutencao → plano_manutencao_item                         │    │
│  │ ordem_servico → os_item → os_peca                                │    │
│  │ solicitacao_manutencao                                            │    │
│  │ peca → peca_movimentacao                                          │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── CHECKLIST ───────────────────────────────────────────────────┐    │
│  │ checklist_grupo → checklist_item                                  │    │
│  │ checklist_grupo_modelo (→ modelo)                                 │    │
│  │ checklist_execucao → checklist_execucao_item                      │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── QUALIDADE & PILHA ──────────────────────────────────────────┐    │
│  │ pilha → pilha_qualidade_atual (1:1)                              │    │
│  │       → pilha_qualidade_historico                                 │    │
│  │       → pilha_movimentacao                                        │    │
│  │ granulometria_faixa                                               │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── MENSAGERIA ──────────────────────────────────────────────────┐    │
│  │ mensagem_operacional                                              │    │
│  │ mensagem_template                                                 │    │
│  │ mensagem_conversa                                                 │    │
│  │ mensagem_resposta_rapida                                          │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── CONTROLE ────────────────────────────────────────────────────┐    │
│  │ periodo_fechamento                                                │    │
│  │ audit_trail                                                       │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── COMUNICAÇÃO ─────────────────────────────────────────────────┐    │
│  │ email_fila                                                        │    │
│  │ email_template (NULL = global, NOT NULL = tenant override)        │    │
│  │ notificacao                                                       │    │
│  │ notificacao_preferencia                                           │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─── RELATÓRIOS ──────────────────────────────────────────────────┐    │
│  │ relatorio_definicao                                               │    │
│  │ relatorio_agendamento                                             │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 11. CONTAGEM FINAL DE TABELAS

| Domínio | Tabelas | Novas nesta revisão |
|---------|---------|---------------------|
| Tenant & Config | 3 | — |
| Auth & Acesso | 10 | — |
| Permissão | 4 | — |
| Frota (equip, modelo, componente) | 12 | — |
| Operador | 4 | — |
| Área, Rota, Material | 10 | — |
| Atividade & Turno | 7 | — |
| GPS & Telemetria | 3 | — |
| Ciclo Operacional | 3 | — |
| Checklist | 5 | — |
| Manutenção | 7 | — |
| Qualidade & Pilha | 6 | — |
| Abastecimento | 4 | +1 (combustivel) |
| Mensageria | 4 | — |
| Hardware (plataforma) | 5 | — |
| Email | 3 | — |
| Notificação | 2 | +2 (notificacao, preferencia) |
| Relatórios | 3 | — |
| Controle (fechamento, audit) | 3 | +1 (audit_trail) |
| Sync Mobile | 2 | — |
| Dispatch | 3 | — |
| Arquivo/Upload | 1 | +1 (arquivo) |
| Tradução/i18n | 1 | — |
| Plano & Funcionalidade | 2 | — |
| **TOTAL** | **~132** | **+5 novas** |

---

## 12. REGRAS DE SOFT DELETE (CASCATA)

```
Ao soft-deletar (dt_deletado = NOW()):

contratada.dt_deletado
  → NÃO cascata (equipamentos e operadores ficam, ficam "orphans visíveis")
  → Frontend mostra warning: "Contratada inativa — X equipamentos vinculados"
  → Admin deve reatribuir ou inativar equipamentos

equipamento.dt_deletado (na verdade muda status = INATIVO)
  → equipamento_snapshot: mantém (histórico), status_operacional = 'DESLIGADO'
  → NÃO aparece em listagens padrão (filtro WHERE ativo = true)
  → Dados históricos (ciclos, atividades, GPS) preservados

operador.dt_deletado
  → Se está logado em equipamento: FORÇAR logout antes (erro na validação)
  → Histórico preservado (atividades, checklists aparecem com "Operador: João (inativo)")

area.dt_deletado
  → Se tem rota ativa: BLOQUEAR (não pode deletar)
  → Se não tem rota: OK, sumir do mapa

modelo_equipamento.dt_deletado
  → Se tem equipamentos: BLOQUEAR
  → Se não tem: OK

perfil.dt_deletado
  → Se tem usuários: BLOQUEAR (reassigne antes)

turno.dt_deletado
  → Se em regime ativo: BLOQUEAR
  → Se só em regimes antigos: OK
```

---

## 13. CHECKLIST DE COMPLETUDE

### ✅ Implementado nos docs
- [x] Multi-tenancy com RLS
- [x] CRUD completo de todas as entidades
- [x] Permissão granular (funcionalidade × ação)
- [x] Auth desacoplado + MFA
- [x] SSO Microsoft Entra ID
- [x] Email transacional
- [x] Snapshot em tempo real
- [x] Abastecimento + nível tanque
- [x] Mensageria sala↔equip
- [x] Mobile offline-first
- [x] Qualidade & Pilha
- [x] Rotograma & velocidade
- [x] Ciclo operacional
- [x] Dispatch
- [x] Manutenção & OS
- [x] Checklist
- [x] Hardware como plataforma
- [x] Fechamento de período
- [x] Report builder
- [x] i18n + timezone

### ⚠️ Adicionado NESTA revisão
- [x] Audit trail genérico
- [x] Notificações in-app
- [x] Preferência de notificação
- [x] Upload de arquivos (S3)
- [x] Tabela combustível
- [x] Campos obrigatórios mapeados
- [x] Constraints UNIQUE mapeados
- [x] Padrão de paginação/filtros
- [x] SmartSelect (inline create)
- [x] Validações de negócio
- [x] Regras de soft delete/cascata

### ❌ Ainda não documentado (próximos passos)
- [ ] WebSocket events (quais eventos, payload, channels)
- [ ] Rate limiting strategy
- [ ] Cache strategy (Redis: o quê cachear, TTL)
- [ ] Backup & disaster recovery
- [ ] Seed data (dados iniciais obrigatórios por tenant novo)
- [ ] Onboarding flow (primeiro acesso do tenant)
- [ ] Integração com ERP (SAP, TOTVS)
- [ ] Blending / otimização de mistura
- [ ] Dashboard de KPIs (quais gráficos exatamente, queries)
- [ ] Logs de aplicação (structured logging, observability)
