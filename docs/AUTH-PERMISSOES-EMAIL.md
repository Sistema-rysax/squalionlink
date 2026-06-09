# 🔐 Autenticação, Permissões Granulares & Comunicação

## Visão Geral

Três pilares de infraestrutura que permeiam todo o sistema:

1. **Permissões Granulares (RBAC+)** — Funcionalidades agrupadas com ações CRUD individuais, perfis flexíveis
2. **Autenticação & MFA** — Módulo desacoplado, reutilizável, com MFA multi-fator
3. **Email** — Engine de envio transacional e notificações
4. **SSO / Microsoft Entra ID** — Integração enterprise para login federado

---

## 1. Permissões Granulares

### Problema com o modelo anterior

O modelo anterior tinha:
- `funcionalidade` (código único tipo FROTA_EQUIPAMENTO)
- `perfil_funcionalidade` (vincula funcionalidade ao perfil)

**Limitação**: não diferencia quem pode VER vs. quem pode EDITAR vs. quem pode DELETAR. Era tudo-ou-nada.

### Novo modelo: Funcionalidade + Ação

```
Módulo: "Frota"
  └── Grupo: "Equipamentos"
       └── Funcionalidade: "FROTA_EQUIPAMENTO"
            ├── Ação: VISUALIZAR    ← pode ver a listagem
            ├── Ação: CRIAR         ← pode cadastrar novo
            ├── Ação: EDITAR        ← pode alterar existente
            ├── Ação: DELETAR       ← pode soft-delete
            └── Ação: EXPORTAR      ← pode exportar dados
```

Cada perfil seleciona QUAIS ações de QUAIS funcionalidades tem acesso.

### Modelagem

```sql
-- ═══════════════════════════════════════════════════════════════
-- MÓDULO (agrupador de nível 1)
-- ═══════════════════════════════════════════════════════════════
modulo (
    id_modulo BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,      -- 'FROTA', 'CHECKLIST', 'MANUTENCAO', 'OPERACAO'
    nome VARCHAR(100) NOT NULL,              -- 'Frota', 'Checklist', 'Manutenção'
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(7),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- GRUPO DE FUNCIONALIDADE (agrupador de nível 2, dentro do módulo)
-- ═══════════════════════════════════════════════════════════════
funcionalidade_grupo (
    id_funcionalidade_grupo BIGSERIAL PRIMARY KEY,
    id_modulo BIGINT NOT NULL REFERENCES modulo(id_modulo),
    codigo VARCHAR(50) NOT NULL UNIQUE,      -- 'FROTA_EQUIPAMENTOS', 'FROTA_MODELOS'
    nome VARCHAR(100) NOT NULL,              -- 'Equipamentos', 'Modelos'
    descricao TEXT,                          -- 'Gerenciar cadastro de equipamentos da frota'
    icone VARCHAR(50),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- FUNCIONALIDADE (item específico — granular)
-- Representa UMA tela ou UMA operação do sistema
-- ═══════════════════════════════════════════════════════════════
funcionalidade (
    id_funcionalidade BIGSERIAL PRIMARY KEY,
    id_funcionalidade_grupo BIGINT NOT NULL REFERENCES funcionalidade_grupo(id_funcionalidade_grupo),
    
    codigo VARCHAR(80) NOT NULL UNIQUE,      -- 'FROTA_EQUIPAMENTO', 'FROTA_EQUIPAMENTO_COMPONENTE'
    nome VARCHAR(150) NOT NULL,              -- 'Cadastro de Equipamentos'
    descricao TEXT,                          -- 'Permite gerenciar equipamentos (caminhões, escavadeiras...)'
    
    -- Quais ações esta funcionalidade suporta
    acoes_disponiveis JSONB NOT NULL DEFAULT '["VISUALIZAR","CRIAR","EDITAR","DELETAR"]',
    -- Possíveis: VISUALIZAR, CRIAR, EDITAR, DELETAR, EXPORTAR, IMPORTAR, APROVAR, EXECUTAR
    
    -- Metadata para UI de configuração de perfil
    rota_frontend VARCHAR(200),              -- '/frota/equipamentos' (para highlight no menu)
    requer_plano_minimo VARCHAR(20),         -- 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'
    
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- PERFIL ↔ FUNCIONALIDADE + AÇÕES (a concessão efetiva)
-- ═══════════════════════════════════════════════════════════════
perfil_permissao (
    id_perfil_permissao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_perfil BIGINT NOT NULL REFERENCES perfil(id_perfil),
    id_funcionalidade BIGINT NOT NULL REFERENCES funcionalidade(id_funcionalidade),
    
    -- Ações concedidas (subset de funcionalidade.acoes_disponiveis)
    acoes JSONB NOT NULL,                    -- ["VISUALIZAR","CRIAR","EDITAR"]
    -- Se só tem VISUALIZAR → read-only
    -- Se tem CRIAR+EDITAR mas não DELETAR → não pode excluir
    
    -- Restrições adicionais (campo livre para regras finas)
    restricoes JSONB,                        -- {"somente_propria_contratada": true}
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_tenant, id_perfil, id_funcionalidade)
);

CREATE INDEX idx_pp_perfil ON perfil_permissao(id_perfil);
CREATE INDEX idx_pp_func ON perfil_permissao(id_funcionalidade);
```

### Catálogo completo de funcionalidades

```
MÓDULO: FROTA
├── Grupo: Equipamentos
│   ├── FROTA_EQUIPAMENTO          [V,C,E,D,EX]   Cadastro de equipamentos
│   ├── FROTA_EQUIPAMENTO_COMP     [V,C,E,D]       Componentes do equipamento
│   └── FROTA_EQUIPAMENTO_HW       [V,C,E,D]       Hardware vinculado ao equip (tenant view)
├── Grupo: Modelos
│   ├── FROTA_MODELO               [V,C,E,D]       Modelos de equipamento
│   ├── FROTA_MODELO_COMPAT        [V,C,E,D]       Compatibilidade carga/transporte
│   └── FROTA_MODELO_FATOR         [V,C,E,D]       Fator de enchimento por material
├── Grupo: Contratadas
│   └── FROTA_CONTRATADA           [V,C,E,D,EX]   Empresas contratadas
└── Grupo: Fabricantes
    └── FROTA_FABRICANTE           [V,C,E,D]       Fabricantes

MÓDULO: OPERADOR
├── Grupo: Cadastro
│   ├── OPERADOR_CADASTRO          [V,C,E,D,EX]   Cadastro de operadores
│   ├── OPERADOR_HABILITACAO       [V,C,E,D]       Habilitações por modelo
│   └── OPERADOR_DOCUMENTO         [V,C,E,D]       Documentos e validade
└── Grupo: Turno
    ├── OPERADOR_TURNO             [V,C,E,D]       Turnos
    └── OPERADOR_REGIME            [V,C,E,D]       Regime de turno e calendário

MÓDULO: AREA
├── Grupo: Cadastro
│   ├── AREA_CADASTRO              [V,C,E,D]       Áreas e geofences
│   ├── AREA_SUBAREA               [V,C,E,D]       Subáreas / bancadas
│   ├── AREA_ROTA                  [V,C,E,D]       Rotas (origem→destino)
│   └── AREA_MATERIAL              [V,C,E,D]       Materiais transportados
└── Grupo: Rotograma
    └── AREA_ROTOGRAMA             [V,C,E,D]       Rotogramas e cercas de velocidade

MÓDULO: CHECKLIST
├── Grupo: Configuração
│   ├── CHECKLIST_GRUPO            [V,C,E,D]       Grupos de checklist
│   └── CHECKLIST_ITEM             [V,C,E,D]       Itens de checklist
└── Grupo: Execução
    ├── CHECKLIST_EXECUCAO         [V,EX]          Consulta de execuções
    └── CHECKLIST_EXEC_MOBILE      [EXECUTAR]      Executar checklist no mobile

MÓDULO: MANUTENCAO
├── Grupo: Ordens de Serviço
│   ├── MANUTENCAO_OS              [V,C,E,D,AP]   Ordens de serviço
│   └── MANUTENCAO_SOLICITACAO     [V,C,E]        Solicitações
├── Grupo: Preventiva
│   ├── MANUTENCAO_PLANO           [V,C,E,D]      Planos preventivos
│   └── MANUTENCAO_PROGRAMACAO     [V,C,E]        Programação
└── Grupo: Estoque
    ├── MANUTENCAO_PECA            [V,C,E,D]      Peças e catálogo
    └── MANUTENCAO_MOVIMENTACAO    [V,C,E]        Movimentações de estoque

MÓDULO: OPERACAO
├── Grupo: Monitoramento
│   ├── OPERACAO_DASHBOARD         [V]             Dashboard em tempo real
│   ├── OPERACAO_MAPA              [V]             Mapa com posições
│   └── OPERACAO_ALERTAS           [V,C,E]        Alertas e configuração
├── Grupo: Ciclos
│   ├── OPERACAO_CICLO             [V,EX]         Consulta de ciclos
│   └── OPERACAO_CICLO_EDIT        [E]            Edição de ciclos (pós-fechamento)
├── Grupo: Atividades
│   ├── OPERACAO_ATIVIDADE_CONFIG  [V,C,E,D]      Config de atividades
│   └── OPERACAO_ATIVIDADE_LOG     [V,E]          Log e edição de atividades
├── Grupo: Abastecimento
│   ├── OPERACAO_ABASTECIMENTO     [V,C,E,EX]    Registros de abastecimento
│   └── OPERACAO_ABAST_VALIDAR     [AP]           Validar abastecimentos
├── Grupo: Mensageria
│   ├── OPERACAO_MSG_ENVIAR        [C]            Enviar mensagens (sala→equip)
│   ├── OPERACAO_MSG_MASSA         [C]            Envio em massa
│   └── OPERACAO_MSG_HISTORICO     [V]            Histórico de mensagens
└── Grupo: Dispatch
    ├── OPERACAO_DISPATCH_AUTO     [V,C,E]        Configurar dispatch automático
    └── OPERACAO_DISPATCH_MANUAL   [C]            Despacho manual

MÓDULO: QUALIDADE
├── Grupo: Configuração
│   ├── QUALIDADE_ELEMENTO         [V,C,E,D]      Elementos químicos e faixas
│   └── QUALIDADE_SUBAREA          [V,C,E,IM]     Qualidade por subárea
└── Grupo: Pilha
    ├── QUALIDADE_PILHA            [V,C,E]        Gestão de pilha/estoque
    └── QUALIDADE_PILHA_MOV        [V,C]          Movimentações da pilha

MÓDULO: PLANEJAMENTO
├── Grupo: Apropriação
│   ├── PLANEJ_CENTRO_CUSTO       [V,C,E,D]      Centros de custo
│   └── PLANEJ_APROPRIACAO        [V,C,E,D]      Apropriação de rota
├── Grupo: Programação
│   └── PLANEJ_PROGRAMACAO        [V,C,E]        Programação semanal
└── Grupo: Metas
    └── PLANEJ_META               [V,C,E]        Metas de produção

MÓDULO: RELATORIO
├── Grupo: Consulta
│   ├── RELATORIO_VISUALIZAR      [V]             Ver relatórios publicados
│   └── RELATORIO_PESSOAL         [V,C,E,D]      Meus relatórios
└── Grupo: Administração
    ├── RELATORIO_TENANT           [V,C,E,D]      Relatórios do tenant
    └── RELATORIO_AGENDAR          [V,C,E,D]      Agendamento de envio

MÓDULO: CONTROLE
├── Grupo: Fechamento
│   ├── CONTROLE_FECHAMENTO        [V,C]          Fechar período
│   └── CONTROLE_REABERTURA        [C]            Reabrir período (restrito)
└── Grupo: Importação
    └── CONTROLE_IMPORTACAO        [V,C,EX]       Wizard de importação

MÓDULO: ADMIN
├── Grupo: Usuários
│   ├── ADMIN_USUARIO              [V,C,E,D]      Gestão de usuários
│   └── ADMIN_PERFIL               [V,C,E,D]      Gestão de perfis e permissões
├── Grupo: Tenant
│   ├── ADMIN_TENANT_CONFIG        [V,E]          Configurações do tenant
│   └── ADMIN_TENANT_PLANO         [V]            Ver plano atual
├── Grupo: Devices
│   ├── ADMIN_DEVICE               [V,E,D]        Gestão de devices mobile
│   └── ADMIN_DEVICE_WIPE          [EX]           Wipe remoto
├── Grupo: Integrações
│   ├── ADMIN_INTEGRACAO           [V,C,E,D]      Configurar integrações
│   └── ADMIN_SSO                  [V,C,E]        Config Microsoft Entra / SSO
└── Grupo: Auditoria
    └── ADMIN_AUDIT_LOG            [V]            Consulta de logs

MÓDULO: MASTER (plataforma — super admin)
├── Grupo: Tenants
│   ├── MASTER_TENANT              [V,C,E,D]      CRUD de tenants
│   └── MASTER_PLANO               [V,C,E,D]      CRUD de planos
├── Grupo: Hardware
│   ├── MASTER_HARDWARE            [V,C,E,D]      Gestão patrimonial
│   ├── MASTER_HW_MOVIMENTACAO     [V,C]          Movimentar entre clientes
│   └── MASTER_HW_MANUTENCAO       [V,C,E]        Manutenção de devices
└── Grupo: Funcionalidades
    └── MASTER_FUNCIONALIDADE      [V,C,E,D]      Catálogo de funcionalidades
```

**Legenda de ações:**
- V = VISUALIZAR
- C = CRIAR
- E = EDITAR
- D = DELETAR
- EX = EXPORTAR
- IM = IMPORTAR
- AP = APROVAR
- EXECUTAR = executar operação (checklist, wipe, etc.)

### Verificação no middleware

```typescript
// Middleware genérico de permissão
function requirePermission(funcionalidade: string, acao: string) {
  return async (req, res, next) => {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    
    // Buscar permissões do usuário (cacheado em Redis)
    const permissoes = await getPermissoesUsuario(userId, tenantId);
    
    // Verificar se tem a funcionalidade com a ação
    const perm = permissoes.find(p => p.codigo_funcionalidade === funcionalidade);
    
    if (!perm) {
      return res.status(403).json({ erro: 'Sem acesso a esta funcionalidade' });
    }
    
    if (!perm.acoes.includes(acao)) {
      return res.status(403).json({ 
        erro: `Sem permissão para ${acao} em ${funcionalidade}`,
        acoes_permitidas: perm.acoes
      });
    }
    
    // Verificar restrições adicionais
    if (perm.restricoes?.somente_propria_contratada) {
      req.filtroContratada = req.user.contratadaId;
    }
    
    next();
  };
}

// Uso nas rotas:
router.get('/equipamento', requirePermission('FROTA_EQUIPAMENTO', 'VISUALIZAR'), controller.listar);
router.post('/equipamento', requirePermission('FROTA_EQUIPAMENTO', 'CRIAR'), controller.criar);
router.put('/equipamento/:id', requirePermission('FROTA_EQUIPAMENTO', 'EDITAR'), controller.editar);
router.delete('/equipamento/:id', requirePermission('FROTA_EQUIPAMENTO', 'DELETAR'), controller.deletar);
```

### Tela: Configuração de Perfil

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🛡️ Perfil: Supervisor de Operação                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─── FROTA ─────────────────────────────────────────────────────────┐   │
│ │                                                                    │   │
│ │ 📦 Equipamentos                                                    │   │
│ │ ┌────────────────────┬───┬───┬───┬───┬────┬────┐                 │   │
│ │ │ Funcionalidade     │ V │ C │ E │ D │ EX │ IM │                 │   │
│ │ ├────────────────────┼───┼───┼───┼───┼────┼────┤                 │   │
│ │ │ Equipamentos       │ ✅│ ❌│ ❌│ ❌│ ✅ │ ❌ │                 │   │
│ │ │ Componentes        │ ✅│ ❌│ ❌│ ❌│ ❌ │ ❌ │                 │   │
│ │ │ Hardware vinculado │ ✅│ ❌│ ❌│ ❌│ ❌ │ ❌ │                 │   │
│ │ └────────────────────┴───┴───┴───┴───┴────┴────┘                 │   │
│ │                                                                    │   │
│ │ 📦 Modelos                                                        │   │
│ │ ┌────────────────────┬───┬───┬───┬───┐                           │   │
│ │ │ Funcionalidade     │ V │ C │ E │ D │                           │   │
│ │ ├────────────────────┼───┼───┼───┼───┤                           │   │
│ │ │ Modelos            │ ✅│ ❌│ ❌│ ❌│                           │   │
│ │ │ Compatibilidade    │ ✅│ ❌│ ❌│ ❌│                           │   │
│ │ └────────────────────┴───┴───┴───┴───┘                           │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─── OPERAÇÃO ──────────────────────────────────────────────────────┐   │
│ │                                                                    │   │
│ │ 📦 Monitoramento                                                   │   │
│ │ ┌────────────────────┬───┐                                        │   │
│ │ │ Dashboard          │ ✅│  (só tem VISUALIZAR)                   │   │
│ │ │ Mapa               │ ✅│                                        │   │
│ │ │ Alertas            │ ✅│ + [C ✅] [E ✅]                        │   │
│ │ └────────────────────┴───┘                                        │   │
│ │                                                                    │   │
│ │ 📦 Mensageria                                                      │   │
│ │ ┌────────────────────┬────────┐                                   │   │
│ │ │ Enviar mensagens   │ C: ✅  │                                   │   │
│ │ │ Envio em massa     │ C: ✅  │                                   │   │
│ │ │ Histórico          │ V: ✅  │                                   │   │
│ │ └────────────────────┴────────┘                                   │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ [💾 Salvar Perfil]  [📋 Copiar de outro perfil]  [🔄 Reset]            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Autenticação & MFA (Desacoplado)

### Princípio: módulo independente

O módulo de autenticação é **desacoplado** — pode ser usado pelo web app, mobile, API, ou qualquer serviço futuro. É um serviço de identidade interno.

### Modelagem

```sql
-- ═══════════════════════════════════════════════════════════════
-- CREDENCIAL DO USUÁRIO (separada do usuario para desacoplar)
-- ═══════════════════════════════════════════════════════════════
usuario_credencial (
    id_usuario_credencial BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    
    -- Senha (hash)
    senha_hash VARCHAR(255) NOT NULL,        -- bcrypt/argon2
    senha_salt VARCHAR(50),
    algoritmo VARCHAR(20) DEFAULT 'argon2id',
    
    -- Política de senha
    dt_ultima_troca_senha TIMESTAMP,
    deve_trocar_senha BOOLEAN DEFAULT false,  -- force change no próximo login
    tentativas_falhas INT DEFAULT 0,
    dt_ultimo_bloqueio TIMESTAMP,
    bloqueado_ate TIMESTAMP,
    
    -- Histórico (impedir reuso)
    senhas_anteriores JSONB,                 -- últimos N hashes (impedir repetição)
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- MFA (Multi-Factor Authentication)
-- ═══════════════════════════════════════════════════════════════
usuario_mfa (
    id_usuario_mfa BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    
    tipo VARCHAR(20) NOT NULL,               -- 'TOTP', 'SMS', 'EMAIL', 'PUSH'
    -- TOTP:  Google Authenticator, Microsoft Authenticator
    -- SMS:   código via SMS
    -- EMAIL: código via email
    -- PUSH:  notificação push no app mobile
    
    -- Dados do fator
    segredo VARCHAR(255),                    -- TOTP secret (encriptado)
    telefone VARCHAR(20),                    -- para SMS
    email_mfa VARCHAR(255),                  -- para EMAIL (pode ser diferente do principal)
    device_token VARCHAR(255),               -- para PUSH
    
    -- Estado
    ativo BOOLEAN NOT NULL DEFAULT false,    -- só ativa após verificação
    verificado BOOLEAN DEFAULT false,        -- confirmou que funciona?
    dt_verificacao TIMESTAMP,
    
    -- Backup codes (caso perca o device)
    backup_codes JSONB,                      -- ["code1","code2"...] (hashed)
    backup_codes_usados INT DEFAULT 0,
    
    prioridade INT DEFAULT 0,                -- se tem múltiplos, qual é primário
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- SESSÃO DE AUTENTICAÇÃO (JWT tracking)
-- ═══════════════════════════════════════════════════════════════
auth_sessao (
    id_auth_sessao BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    -- Token
    refresh_token_hash VARCHAR(255) NOT NULL,
    jti VARCHAR(100) NOT NULL UNIQUE,        -- JWT ID (para revogação)
    
    -- Device/Client
    device_type VARCHAR(20),                 -- 'WEB', 'MOBILE', 'API'
    device_info VARCHAR(500),                -- user-agent ou device model
    ip_address VARCHAR(45),
    
    -- Estado
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_ultimo_uso TIMESTAMP,
    dt_expiracao TIMESTAMP NOT NULL,
    dt_revogacao TIMESTAMP,                  -- se revogado manualmente
    motivo_revogacao VARCHAR(100),
    
    -- MFA
    mfa_verificado BOOLEAN DEFAULT false,    -- MFA foi passado nesta sessão?
    dt_mfa_verificacao TIMESTAMP
);

CREATE INDEX idx_auth_sess_user ON auth_sessao(id_usuario, ativo);
CREATE INDEX idx_auth_sess_jti ON auth_sessao(jti);

-- ═══════════════════════════════════════════════════════════════
-- LOG DE AUTENTICAÇÃO (auditoria de login/logout/falhas)
-- ═══════════════════════════════════════════════════════════════
auth_log (
    id_auth_log BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT REFERENCES usuario(id_usuario), -- NULL se login falhou com email desconhecido
    id_tenant BIGINT REFERENCES tenant(id_tenant),
    
    evento VARCHAR(30) NOT NULL,
    -- LOGIN_SUCESSO, LOGIN_FALHA, LOGOUT, MFA_SUCESSO, MFA_FALHA,
    -- SENHA_TROCADA, SESSAO_REVOGADA, CONTA_BLOQUEADA, CONTA_DESBLOQUEADA,
    -- SSO_LOGIN, SSO_FALHA, TOKEN_REFRESH
    
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    geo_pais VARCHAR(50),                    -- geolocalização do IP
    geo_cidade VARCHAR(100),
    
    detalhes JSONB,                          -- {"motivo": "senha incorreta", "tentativa": 3}
    
    dt_evento TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_log_user ON auth_log(id_usuario, dt_evento DESC);
CREATE INDEX idx_auth_log_evento ON auth_log(evento, dt_evento DESC);

-- ═══════════════════════════════════════════════════════════════
-- CONFIGURAÇÃO DE AUTENTICAÇÃO (por tenant)
-- ═══════════════════════════════════════════════════════════════
auth_config (
    id_auth_config BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant) UNIQUE,
    
    -- Política de senha
    senha_min_caracteres INT DEFAULT 8,
    senha_requer_maiuscula BOOLEAN DEFAULT true,
    senha_requer_numero BOOLEAN DEFAULT true,
    senha_requer_especial BOOLEAN DEFAULT false,
    senha_expira_dias INT DEFAULT 0,         -- 0 = não expira
    senha_historico_impedir INT DEFAULT 3,   -- não repetir últimas N
    
    -- Bloqueio
    max_tentativas_falha INT DEFAULT 5,
    tempo_bloqueio_minutos INT DEFAULT 30,
    
    -- MFA
    mfa_obrigatorio BOOLEAN DEFAULT false,   -- todos os usuários devem ter MFA?
    mfa_tipos_permitidos JSONB DEFAULT '["TOTP","EMAIL"]',
    
    -- Sessão
    jwt_access_expira_minutos INT DEFAULT 15,
    jwt_refresh_expira_dias INT DEFAULT 7,
    max_sessoes_simultaneas INT DEFAULT 5,
    
    -- SSO
    sso_habilitado BOOLEAN DEFAULT false,
    sso_obrigatorio BOOLEAN DEFAULT false,   -- se TRUE, só loga via SSO
    sso_provider VARCHAR(30),                -- 'MICROSOFT_ENTRA', 'GOOGLE', 'OKTA'
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Fluxo de Login

```
1. POST /api/auth/login { email, senha }
   │
   ├── Verifica credencial (argon2 compare)
   │   └── Falha? → incrementa tentativas, bloqueia se > max
   │
   ├── Verifica se conta bloqueada
   │
   ├── Verifica se MFA habilitado
   │   ├── Sim → retorna { mfa_required: true, session_token: "temp" }
   │   │         └── Usuário faz POST /api/auth/mfa/verify { code }
   │   │              └── Sucesso → gera JWT final
   │   └── Não → gera JWT direto
   │
   └── Retorna { access_token, refresh_token, expires_in }

2. Refresh: POST /api/auth/refresh { refresh_token }
   └── Valida, gera novo access_token

3. Logout: POST /api/auth/logout
   └── Revoga sessão (jti blacklist)
```

---

## 3. Email

### Engine de email desacoplado

```sql
-- ═══════════════════════════════════════════════════════════════
-- TEMPLATE DE EMAIL (templates Handlebars/Mustache)
-- ═══════════════════════════════════════════════════════════════
email_template (
    id_email_template BIGSERIAL PRIMARY KEY,
    
    codigo VARCHAR(50) NOT NULL UNIQUE,      -- 'WELCOME', 'RESET_SENHA', 'MFA_CODE', 'ALERTA_EQUIP'
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    assunto_template VARCHAR(255) NOT NULL,   -- 'Bem-vindo ao SqualionLink, {{nome}}!'
    corpo_html TEXT NOT NULL,                 -- HTML com {{variaveis}}
    corpo_texto TEXT,                         -- versão plain text
    
    variaveis_disponiveis JSONB,             -- ["nome","email","link","codigo"]
    
    -- i18n
    idioma VARCHAR(5) NOT NULL DEFAULT 'pt-BR',
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- FILA DE EMAIL (processamento assíncrono)
-- ═══════════════════════════════════════════════════════════════
email_fila (
    id_email_fila BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT REFERENCES tenant(id_tenant),
    
    -- Destinatário
    para_email VARCHAR(255) NOT NULL,
    para_nome VARCHAR(255),
    cc JSONB,                                -- ["email1","email2"]
    bcc JSONB,
    
    -- Conteúdo
    id_email_template BIGINT REFERENCES email_template(id_email_template),
    assunto VARCHAR(255) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    
    -- Anexos
    anexos JSONB,                            -- [{"nome":"relatorio.pdf","url":"s3://..."}]
    
    -- Controle
    prioridade INT DEFAULT 0,                -- 0=normal, 1=alta (MFA code, reset senha)
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    -- PENDENTE, ENVIANDO, ENVIADO, FALHA, BOUNCE
    
    tentativas INT DEFAULT 0,
    max_tentativas INT DEFAULT 3,
    
    -- Resultado
    provider_message_id VARCHAR(200),        -- ID do SES/SendGrid
    dt_envio TIMESTAMP,
    dt_entrega TIMESTAMP,
    dt_abertura TIMESTAMP,                   -- tracking de abertura
    erro_mensagem TEXT,
    
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_processar_apos TIMESTAMP              -- agendar para futuro
);

CREATE INDEX idx_email_status ON email_fila(status, prioridade DESC, dt_registro);

-- ═══════════════════════════════════════════════════════════════
-- CONFIG DE EMAIL (provider por tenant ou global)
-- ═══════════════════════════════════════════════════════════════
email_config (
    id_email_config BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT REFERENCES tenant(id_tenant), -- NULL = config global
    
    provider VARCHAR(20) NOT NULL,           -- 'SES', 'SENDGRID', 'SMTP'
    
    -- Configuração (encriptada)
    config_encriptada JSONB NOT NULL,        -- credenciais do provider
    -- SES: { "region": "us-east-1", "from": "no-reply@squalionlink.com" }
    -- SMTP: { "host": "...", "port": 587, "user": "...", "pass": "..." }
    
    from_email VARCHAR(255) NOT NULL,
    from_nome VARCHAR(100),
    reply_to VARCHAR(255),
    
    -- Limites
    limite_hora INT DEFAULT 100,
    limite_dia INT DEFAULT 1000,
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Tipos de email

| Código | Trigger | Prioridade |
|--------|---------|-----------|
| WELCOME | Novo usuário criado | Normal |
| RESET_SENHA | Solicitação de reset | Alta |
| MFA_CODE | Código MFA via email | Alta |
| ALERTA_EQUIP_OFFLINE | Device offline > threshold | Normal |
| ALERTA_OS_CRITICA | OS urgente aberta | Normal |
| RELATORIO_AGENDADO | Relatório pronto (export) | Normal |
| FECHAMENTO_PERIODO | Período fechado (notificação) | Normal |
| GARANTIA_VENCENDO | Hardware com garantia acabando | Normal |
| DOCUMENTO_VENCENDO | CNH/ASO do operador vencendo | Normal |

---

## 4. Microsoft Entra ID (SSO)

### Integração OIDC/SAML

```sql
-- ═══════════════════════════════════════════════════════════════
-- PROVEDOR SSO (configuração por tenant)
-- ═══════════════════════════════════════════════════════════════
sso_provedor (
    id_sso_provedor BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    
    tipo VARCHAR(30) NOT NULL,               -- 'MICROSOFT_ENTRA', 'GOOGLE_WORKSPACE', 'OKTA', 'SAML_GENERICO'
    nome VARCHAR(100),                       -- 'Microsoft Entra - Mineradora ABC'
    
    -- OIDC Config (Microsoft Entra)
    client_id VARCHAR(255) NOT NULL,
    client_secret_encrypted VARCHAR(500) NOT NULL,
    tenant_id_provider VARCHAR(255),         -- Azure AD tenant ID
    
    -- URLs
    authorization_url VARCHAR(500),
    token_url VARCHAR(500),
    userinfo_url VARCHAR(500),
    jwks_url VARCHAR(500),
    
    -- Mapeamento de atributos
    mapeamento_campos JSONB NOT NULL DEFAULT '{
      "email": "preferred_username",
      "nome": "name",
      "id_externo": "oid"
    }',
    
    -- Provisionamento automático
    auto_criar_usuario BOOLEAN DEFAULT false, -- criar user se não existe?
    perfil_padrao_novos BIGINT REFERENCES perfil(id_perfil), -- perfil default
    dominio_permitido VARCHAR(100),          -- '@mineradora.com' (só aceita deste domínio)
    
    -- Estado
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- VÍNCULO SSO ↔ USUÁRIO
-- ═══════════════════════════════════════════════════════════════
usuario_sso (
    id_usuario_sso BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    id_sso_provedor BIGINT NOT NULL REFERENCES sso_provedor(id_sso_provedor),
    
    id_externo VARCHAR(255) NOT NULL,        -- OID do Entra ID / subject do Google
    email_externo VARCHAR(255),
    
    dt_primeiro_login TIMESTAMP,
    dt_ultimo_login TIMESTAMP,
    
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(id_sso_provedor, id_externo)
);
```

### Fluxo SSO

```
1. Usuário acessa /login
   └── Vê botão "Entrar com Microsoft" (se tenant tem SSO)

2. Clica → redirect para Entra ID:
   GET https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize
     ?client_id=...&redirect_uri=...&scope=openid+email+profile

3. Usuário autentica no Microsoft (MFA do Entra se aplicável)

4. Redirect volta: /api/auth/sso/callback?code=...

5. Backend troca code por tokens:
   POST https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token

6. Backend valida id_token (JWT do Entra):
   - Verifica signature (jwks_url)
   - Extrai: oid, name, preferred_username (email)
   
7. Busca usuario_sso pelo id_externo (oid)
   ├── Encontrou → login do usuário vinculado
   │   └── Gera JWT do SqualionLink
   └── Não encontrou:
       ├── auto_criar_usuario = true → cria usuário + vínculo
       └── auto_criar_usuario = false → erro "Usuário não provisionado"

8. Retorna JWT do SqualionLink (sessão normal a partir daqui)
```

### Provisionamento SCIM (opcional avançado)

Para sincronizar usuários automaticamente do Entra ID:
- Quando RH adiciona funcionário no AD → aparece no SqualionLink
- Quando desativa no AD → desativa no SqualionLink
- Grupos do AD podem mapear para perfis

---

## API Endpoints

### Autenticação
```
POST   /api/auth/login                          -- email + senha
POST   /api/auth/refresh                        -- renovar access_token
POST   /api/auth/logout                         -- revogar sessão
POST   /api/auth/forgot-password                -- solicitar reset
POST   /api/auth/reset-password                 -- definir nova senha (com token)
POST   /api/auth/change-password                -- trocar senha (autenticado)

# MFA
GET    /api/auth/mfa/status                     -- MFA está habilitado? qual tipo?
POST   /api/auth/mfa/setup/totp                 -- gerar QR code para TOTP
POST   /api/auth/mfa/verify                     -- verificar código MFA
POST   /api/auth/mfa/enable                     -- ativar MFA
POST   /api/auth/mfa/disable                    -- desativar MFA (requer senha)
POST   /api/auth/mfa/backup-codes               -- gerar novos backup codes

# SSO
GET    /api/auth/sso/providers                  -- provedores disponíveis para o tenant
GET    /api/auth/sso/login/:providerId          -- inicia fluxo OIDC (redirect)
GET    /api/auth/sso/callback                   -- callback do provider
POST   /api/auth/sso/link                       -- vincular conta existente ao SSO

# Sessões
GET    /api/auth/sessions                       -- minhas sessões ativas
DELETE /api/auth/sessions/:id                   -- revogar sessão específica
DELETE /api/auth/sessions/all                   -- revogar todas (exceto atual)
```

### Permissões
```
GET    /api/permissao/modulos                   -- catálogo de módulos+grupos+funcionalidades
GET    /api/permissao/perfil/:id                -- permissões de um perfil
PUT    /api/permissao/perfil/:id                -- salvar permissões do perfil
GET    /api/permissao/minha                     -- minhas permissões (para frontend renderizar menu)
```

### Email
```
POST   /api/email/enviar                        -- enviar email (via template ou livre)
GET    /api/email/templates                     -- listar templates
POST   /api/email/templates                     -- criar template
GET    /api/email/fila                          -- status da fila
GET    /api/email/config                        -- config do provider
PUT    /api/email/config                        -- alterar config
```

---

## Tabelas adicionadas

| # | Tabela | Domínio |
|---|--------|---------|
| 1 | modulo | Permissão |
| 2 | funcionalidade_grupo | Permissão |
| 3 | perfil_permissao | Permissão |
| 4 | usuario_credencial | Auth |
| 5 | usuario_mfa | Auth |
| 6 | auth_sessao | Auth |
| 7 | auth_log | Auth |
| 8 | auth_config | Auth |
| 9 | email_template | Email |
| 10 | email_fila | Email |
| 11 | email_config | Email |
| 12 | sso_provedor | SSO |
| 13 | usuario_sso | SSO |

**Nota**: a tabela `funcionalidade` já existia mas foi reestruturada (ganha `id_funcionalidade_grupo`, `acoes_disponiveis`, etc.)

**Total acumulado: ~127 tabelas**

---

## Funcionalidades adicionadas

| # | Módulo | Código | Descrição |
|---|--------|--------|-----------|
| 34 | Admin | ADMIN_AUTH_CONFIG | Política de senha, MFA, sessões |
| 35 | Admin | ADMIN_SSO | Configurar provedores SSO |
| 36 | Admin | ADMIN_EMAIL | Config de email e templates |
