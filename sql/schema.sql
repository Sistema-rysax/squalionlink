-- ═══════════════════════════════════════════════════════════════════════════════
-- SQUALIONLINK — Schema Completo do Banco de Dados
-- ═══════════════════════════════════════════════════════════════════════════════
-- PostgreSQL 15+
-- Multi-tenant com Row Level Security (RLS)
-- Todas as datas em UTC+0 (TIMESTAMP WITHOUT TIME ZONE)
-- Convenções: snake_case, singular, PK = id_<tabela> BIGSERIAL
-- ═══════════════════════════════════════════════════════════════════════════════

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- para EXCLUDE constraints
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- para busca textual

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 1: PLATAFORMA (sem id_tenant — patrimônio da Rysax)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1.1 PLANO (assinatura)
-- ─────────────────────────────────────────────
CREATE TABLE plano (
    id_plano BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    max_equipamentos INT,
    max_usuarios INT,
    max_operadores INT,
    preco_mensal NUMERIC(12,2),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 1.2 MÓDULO (agrupador nível 1 de funcionalidades)
-- ─────────────────────────────────────────────
CREATE TABLE modulo (
    id_modulo BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(7),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 1.3 GRUPO DE FUNCIONALIDADE (agrupador nível 2)
-- ─────────────────────────────────────────────
CREATE TABLE funcionalidade_grupo (
    id_funcionalidade_grupo BIGSERIAL PRIMARY KEY,
    id_modulo BIGINT NOT NULL REFERENCES modulo(id_modulo),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 1.4 FUNCIONALIDADE (item granular)
-- ─────────────────────────────────────────────
CREATE TABLE funcionalidade (
    id_funcionalidade BIGSERIAL PRIMARY KEY,
    id_funcionalidade_grupo BIGINT NOT NULL REFERENCES funcionalidade_grupo(id_funcionalidade_grupo),
    codigo VARCHAR(80) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    acoes_disponiveis JSONB NOT NULL DEFAULT '["VISUALIZAR","CRIAR","EDITAR","DELETAR"]',
    rota_frontend VARCHAR(200),
    requer_plano_minimo VARCHAR(20),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 1.5 PLANO_FUNCIONALIDADE (quais funcionalidades cada plano tem)
-- ─────────────────────────────────────────────
CREATE TABLE plano_funcionalidade (
    id_plano_funcionalidade BIGSERIAL PRIMARY KEY,
    id_plano BIGINT NOT NULL REFERENCES plano(id_plano),
    id_funcionalidade BIGINT NOT NULL REFERENCES funcionalidade(id_funcionalidade),
    UNIQUE(id_plano, id_funcionalidade)
);

-- ─────────────────────────────────────────────
-- 1.6 TIPO HARDWARE (plataforma — categorias de device)
-- ─────────────────────────────────────────────
CREATE TABLE tipo_hardware (
    id_tipo_hardware BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(30) NOT NULL,
    fabricante VARCHAR(100),
    modelo VARCHAR(100),
    descricao TEXT,
    vida_util_meses INT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 1.7 HARDWARE (cada device individual — patrimônio Rysax)
-- ─────────────────────────────────────────────
CREATE TABLE hardware (
    id_hardware BIGSERIAL PRIMARY KEY,
    id_tipo_hardware BIGINT NOT NULL REFERENCES tipo_hardware(id_tipo_hardware),
    numero_serie VARCHAR(100) NOT NULL UNIQUE,
    imei VARCHAR(20),
    mac_address VARCHAR(17),
    firmware_versao VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ESTOQUE',
    -- ESTOQUE, EM_TRANSITO, CEDIDO, INSTALADO, MANUTENCAO, DESCARTADO
    id_tenant_atual BIGINT,  -- em qual cliente está agora (nullable)
    dt_aquisicao TIMESTAMP,
    dt_garantia_fim TIMESTAMP,
    custo_aquisicao NUMERIC(12,2),
    observacao TEXT,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hardware_status ON hardware(status);
CREATE INDEX idx_hardware_tenant ON hardware(id_tenant_atual);

-- ─────────────────────────────────────────────
-- 1.8 HARDWARE MOVIMENTAÇÃO (histórico de vida do device)
-- ─────────────────────────────────────────────
CREATE TABLE hardware_movimentacao (
    id_hardware_movimentacao BIGSERIAL PRIMARY KEY,
    id_hardware BIGINT NOT NULL REFERENCES hardware(id_hardware),
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20) NOT NULL,
    id_tenant_anterior BIGINT,
    id_tenant_novo BIGINT,
    motivo TEXT,
    responsavel VARCHAR(255),
    dt_movimentacao TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hw_mov_hardware ON hardware_movimentacao(id_hardware, dt_movimentacao DESC);

-- ─────────────────────────────────────────────
-- 1.9 HARDWARE MANUTENÇÃO (manutenção do device)
-- ─────────────────────────────────────────────
CREATE TABLE hardware_manutencao (
    id_hardware_manutencao BIGSERIAL PRIMARY KEY,
    id_hardware BIGINT NOT NULL REFERENCES hardware(id_hardware),
    tipo VARCHAR(20) NOT NULL,
    descricao TEXT NOT NULL,
    custo NUMERIC(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    dt_abertura TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_conclusao TIMESTAMP,
    responsavel VARCHAR(255),
    observacao TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 2: TENANT & CONFIGURAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 2.1 TENANT
-- ─────────────────────────────────────────────
CREATE TABLE tenant (
    id_tenant BIGSERIAL PRIMARY KEY,
    id_plano BIGINT NOT NULL REFERENCES plano(id_plano),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    idioma_padrao VARCHAR(5) NOT NULL DEFAULT 'pt-BR',
    logo_url VARCHAR(500),
    cor_primaria VARCHAR(7) DEFAULT '#3B82F6',
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 2.2 AUTH CONFIG (política de autenticação por tenant)
-- ─────────────────────────────────────────────
CREATE TABLE auth_config (
    id_auth_config BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant) UNIQUE,
    senha_min_caracteres INT DEFAULT 8,
    senha_requer_maiuscula BOOLEAN DEFAULT true,
    senha_requer_numero BOOLEAN DEFAULT true,
    senha_requer_especial BOOLEAN DEFAULT false,
    senha_expira_dias INT DEFAULT 0,
    senha_historico_impedir INT DEFAULT 3,
    max_tentativas_falha INT DEFAULT 5,
    tempo_bloqueio_minutos INT DEFAULT 30,
    mfa_obrigatorio BOOLEAN DEFAULT false,
    mfa_tipos_permitidos JSONB DEFAULT '["TOTP","EMAIL"]',
    jwt_access_expira_minutos INT DEFAULT 15,
    jwt_refresh_expira_dias INT DEFAULT 7,
    max_sessoes_simultaneas INT DEFAULT 5,
    sso_habilitado BOOLEAN DEFAULT false,
    sso_obrigatorio BOOLEAN DEFAULT false,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2.3 SSO PROVEDOR
-- ─────────────────────────────────────────────
CREATE TABLE sso_provedor (
    id_sso_provedor BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    tipo VARCHAR(30) NOT NULL,
    nome VARCHAR(100),
    client_id VARCHAR(255) NOT NULL,
    client_secret_encrypted VARCHAR(500) NOT NULL,
    tenant_id_provider VARCHAR(255),
    authorization_url VARCHAR(500),
    token_url VARCHAR(500),
    userinfo_url VARCHAR(500),
    jwks_url VARCHAR(500),
    mapeamento_campos JSONB NOT NULL DEFAULT '{"email":"preferred_username","nome":"name","id_externo":"oid"}',
    auto_criar_usuario BOOLEAN DEFAULT false,
    perfil_padrao_novos BIGINT,
    dominio_permitido VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2.4 EMAIL CONFIG (provider de email por tenant)
-- ─────────────────────────────────────────────
CREATE TABLE email_config (
    id_email_config BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT REFERENCES tenant(id_tenant),
    provider VARCHAR(20) NOT NULL,
    config_encriptada JSONB NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    from_nome VARCHAR(100),
    reply_to VARCHAR(255),
    limite_hora INT DEFAULT 100,
    limite_dia INT DEFAULT 1000,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 3: USUÁRIOS, PERFIS & AUTENTICAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 3.1 PERFIL
-- ─────────────────────────────────────────────
CREATE TABLE perfil (
    id_perfil BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 3.2 PERFIL PERMISSÃO (funcionalidade + ações)
-- ─────────────────────────────────────────────
CREATE TABLE perfil_permissao (
    id_perfil_permissao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_perfil BIGINT NOT NULL REFERENCES perfil(id_perfil),
    id_funcionalidade BIGINT NOT NULL REFERENCES funcionalidade(id_funcionalidade),
    acoes JSONB NOT NULL,
    restricoes JSONB,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_perfil, id_funcionalidade)
);

CREATE INDEX idx_pp_perfil ON perfil_permissao(id_perfil);

-- ─────────────────────────────────────────────
-- 3.3 USUÁRIO
-- ─────────────────────────────────────────────
CREATE TABLE usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_perfil BIGINT NOT NULL REFERENCES perfil(id_perfil),
    id_contratada BIGINT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    idioma VARCHAR(5) DEFAULT 'pt-BR',
    avatar_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    ultimo_acesso TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP
);

CREATE INDEX idx_usuario_tenant ON usuario(id_tenant);
CREATE INDEX idx_usuario_email ON usuario(email);

-- ─────────────────────────────────────────────
-- 3.4 USUARIO CREDENCIAL
-- ─────────────────────────────────────────────
CREATE TABLE usuario_credencial (
    id_usuario_credencial BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario) UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    algoritmo VARCHAR(20) DEFAULT 'argon2id',
    dt_ultima_troca_senha TIMESTAMP,
    deve_trocar_senha BOOLEAN DEFAULT false,
    tentativas_falhas INT DEFAULT 0,
    bloqueado_ate TIMESTAMP,
    senhas_anteriores JSONB,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3.5 USUARIO MFA
-- ─────────────────────────────────────────────
CREATE TABLE usuario_mfa (
    id_usuario_mfa BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    tipo VARCHAR(20) NOT NULL,
    segredo VARCHAR(255),
    telefone VARCHAR(20),
    email_mfa VARCHAR(255),
    device_token VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT false,
    verificado BOOLEAN DEFAULT false,
    dt_verificacao TIMESTAMP,
    backup_codes JSONB,
    backup_codes_usados INT DEFAULT 0,
    prioridade INT DEFAULT 0,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3.6 USUARIO SSO (vínculo com provedor externo)
-- ─────────────────────────────────────────────
CREATE TABLE usuario_sso (
    id_usuario_sso BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    id_sso_provedor BIGINT NOT NULL REFERENCES sso_provedor(id_sso_provedor),
    id_externo VARCHAR(255) NOT NULL,
    email_externo VARCHAR(255),
    dt_primeiro_login TIMESTAMP,
    dt_ultimo_login TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_sso_provedor, id_externo)
);

-- ─────────────────────────────────────────────
-- 3.7 AUTH SESSÃO (JWT tracking)
-- ─────────────────────────────────────────────
CREATE TABLE auth_sessao (
    id_auth_sessao BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    refresh_token_hash VARCHAR(255) NOT NULL,
    jti VARCHAR(100) NOT NULL UNIQUE,
    device_type VARCHAR(20),
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    ativo BOOLEAN NOT NULL DEFAULT true,
    mfa_verificado BOOLEAN DEFAULT false,
    dt_mfa_verificacao TIMESTAMP,
    dt_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_ultimo_uso TIMESTAMP,
    dt_expiracao TIMESTAMP NOT NULL,
    dt_revogacao TIMESTAMP,
    motivo_revogacao VARCHAR(100)
);

CREATE INDEX idx_auth_sess_user ON auth_sessao(id_usuario, ativo);
CREATE INDEX idx_auth_sess_jti ON auth_sessao(jti);

-- ─────────────────────────────────────────────
-- 3.8 AUTH LOG (auditoria de autenticação)
-- ─────────────────────────────────────────────
CREATE TABLE auth_log (
    id_auth_log BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT REFERENCES usuario(id_usuario),
    id_tenant BIGINT REFERENCES tenant(id_tenant),
    evento VARCHAR(30) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    geo_pais VARCHAR(50),
    geo_cidade VARCHAR(100),
    detalhes JSONB,
    dt_evento TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_log_user ON auth_log(id_usuario, dt_evento DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 4: CADASTROS BASE
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 4.1 FABRICANTE
-- ─────────────────────────────────────────────
CREATE TABLE fabricante (
    id_fabricante BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    pais_origem VARCHAR(50),
    logo_url VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 4.2 GRUPO EQUIPAMENTO
-- ─────────────────────────────────────────────
CREATE TABLE grupo_equipamento (
    id_grupo_equipamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    tipo_operacao VARCHAR(20) NOT NULL,
    icone VARCHAR(50),
    cor VARCHAR(7),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome),
    UNIQUE(id_tenant, codigo)
);

-- ─────────────────────────────────────────────
-- 4.3 MODELO EQUIPAMENTO
-- ─────────────────────────────────────────────
CREATE TABLE modelo_equipamento (
    id_modelo_equipamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_fabricante BIGINT NOT NULL REFERENCES fabricante(id_fabricante),
    id_grupo_equipamento BIGINT NOT NULL REFERENCES grupo_equipamento(id_grupo_equipamento),
    nome VARCHAR(100) NOT NULL,
    tipo_operacao VARCHAR(20) NOT NULL,
    capacidade_carga_ton NUMERIC(10,2),
    volume_cacamba_m3 NUMERIC(10,2),
    capacidade_tanque_litros NUMERIC(8,2),
    peso_operacional_kg NUMERIC(12,2),
    potencia_hp NUMERIC(8,1),
    velocidade_maxima_kmh NUMERIC(5,1),
    consumo_referencia_lh NUMERIC(8,2),
    qtd_eixos INT,
    foto_url VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 4.4 MODELO COMPATIBILIDADE (carga ↔ transporte)
-- ─────────────────────────────────────────────
CREATE TABLE modelo_compatibilidade (
    id_modelo_compatibilidade BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_modelo_carga BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_modelo_transporte BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    qtd_passes INT NOT NULL,
    tempo_carga_segundos INT,
    observacao TEXT,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_modelo_carga, id_modelo_transporte)
);

-- ─────────────────────────────────────────────
-- 4.5 CONTRATADA
-- ─────────────────────────────────────────────
CREATE TABLE contratada (
    id_contratada BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    tipo VARCHAR(20) NOT NULL DEFAULT 'PROPRIA',
    contato_nome VARCHAR(255),
    contato_telefone VARCHAR(20),
    contato_email VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome_fantasia),
    UNIQUE(id_tenant, cnpj)
);

-- ─────────────────────────────────────────────
-- 4.6 COMBUSTÍVEL
-- ─────────────────────────────────────────────
CREATE TABLE combustivel (
    id_combustivel BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(50) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    unidade VARCHAR(10) NOT NULL DEFAULT 'L',
    custo_unitario NUMERIC(10,4),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome),
    UNIQUE(id_tenant, codigo)
);

-- ─────────────────────────────────────────────
-- 4.7 MATERIAL
-- ─────────────────────────────────────────────
CREATE TABLE material (
    id_material BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    densidade_t_m3 NUMERIC(6,3),
    cor VARCHAR(7),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome),
    UNIQUE(id_tenant, codigo)
);

-- ─────────────────────────────────────────────
-- 4.8 ELEMENTO QUÍMICO
-- ─────────────────────────────────────────────
CREATE TABLE elemento_quimico (
    id_elemento_quimico BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(50) NOT NULL,
    simbolo VARCHAR(10) NOT NULL,
    unidade VARCHAR(10) NOT NULL DEFAULT '%',
    valor_minimo NUMERIC(10,4),
    valor_maximo NUMERIC(10,4),
    valor_alvo NUMERIC(10,4),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, simbolo)
);

-- ─────────────────────────────────────────────
-- 4.9 CENTRO DE CUSTO
-- ─────────────────────────────────────────────
CREATE TABLE centro_custo (
    id_centro_custo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    codigo VARCHAR(30) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, codigo)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 5: FROTA (Equipamentos)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 5.1 EQUIPAMENTO
-- ─────────────────────────────────────────────
CREATE TABLE equipamento (
    id_equipamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_contratada BIGINT NOT NULL REFERENCES contratada(id_contratada),
    codigo VARCHAR(30) NOT NULL,
    numero_serie VARCHAR(50),
    placa VARCHAR(10),
    chassi VARCHAR(50),
    ano_fabricacao INT,
    horimetro_inicial NUMERIC(12,2) DEFAULT 0,
    odometro_inicial NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    foto_url VARCHAR(500),
    observacao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, codigo)
);

CREATE UNIQUE INDEX idx_equip_serie ON equipamento(id_tenant, numero_serie) WHERE numero_serie IS NOT NULL;
CREATE UNIQUE INDEX idx_equip_placa ON equipamento(id_tenant, placa) WHERE placa IS NOT NULL;
CREATE INDEX idx_equip_modelo ON equipamento(id_modelo_equipamento);
CREATE INDEX idx_equip_contratada ON equipamento(id_contratada);

-- ─────────────────────────────────────────────
-- 5.2 EQUIPAMENTO COMPONENTE
-- ─────────────────────────────────────────────
CREATE TABLE equipamento_componente (
    id_equipamento_componente BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    numero_serie VARCHAR(100),
    posicao VARCHAR(50),
    vida_util_horas NUMERIC(10,2),
    horas_atuais NUMERIC(10,2) DEFAULT 0,
    dt_instalacao TIMESTAMP,
    dt_proxima_troca TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 5.3 EQUIPAMENTO HARDWARE (vínculo equip ↔ device plataforma)
-- ─────────────────────────────────────────────
CREATE TABLE equipamento_hardware (
    id_equipamento_hardware BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_hardware BIGINT NOT NULL REFERENCES hardware(id_hardware),
    funcao VARCHAR(50) NOT NULL,
    dt_instalacao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_desinstalacao TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT true,
    observacao TEXT,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eq_hw_equip ON equipamento_hardware(id_equipamento, ativo);

-- ─────────────────────────────────────────────
-- 5.4 MODELO FATOR ENCHIMENTO (por material)
-- ─────────────────────────────────────────────
CREATE TABLE modelo_fator_enchimento (
    id_modelo_fator_enchimento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_material BIGINT NOT NULL REFERENCES material(id_material),
    fator_enchimento NUMERIC(4,2) NOT NULL,
    carga_util_ton NUMERIC(10,2),
    observacao TEXT,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_modelo_equipamento, id_material)
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 6: OPERADORES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 6.1 OPERADOR
-- ─────────────────────────────────────────────
CREATE TABLE operador (
    id_operador BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_contratada BIGINT NOT NULL REFERENCES contratada(id_contratada),
    nome VARCHAR(255) NOT NULL,
    matricula VARCHAR(30) NOT NULL,
    cpf VARCHAR(14),
    cargo VARCHAR(100),
    telefone VARCHAR(20),
    dt_admissao DATE,
    foto_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, matricula)
);

CREATE UNIQUE INDEX idx_operador_cpf ON operador(id_tenant, cpf) WHERE cpf IS NOT NULL;

-- ─────────────────────────────────────────────
-- 6.2 OPERADOR HABILITAÇÃO (quais modelos pode operar)
-- ─────────────────────────────────────────────
CREATE TABLE operador_habilitacao (
    id_operador_habilitacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_operador BIGINT NOT NULL REFERENCES operador(id_operador),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    dt_habilitacao DATE,
    dt_vencimento DATE,
    observacao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_operador, id_modelo_equipamento)
);

-- ─────────────────────────────────────────────
-- 6.3 OPERADOR DOCUMENTO (CNH, ASO, certificados)
-- ─────────────────────────────────────────────
CREATE TABLE operador_documento (
    id_operador_documento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_operador BIGINT NOT NULL REFERENCES operador(id_operador),
    tipo VARCHAR(30) NOT NULL,
    numero VARCHAR(50),
    dt_emissao DATE,
    dt_vencimento DATE,
    arquivo_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'VIGENTE',
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 7: ÁREAS, ROTAS & GEOFENCES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 7.1 ÁREA
-- ─────────────────────────────────────────────
CREATE TABLE area (
    id_area BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    poligono JSONB NOT NULL,
    cor VARCHAR(7),
    id_material_padrao BIGINT REFERENCES material(id_material),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 7.2 SUBÁREA (bancada / nível)
-- ─────────────────────────────────────────────
CREATE TABLE subarea (
    id_subarea BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area BIGINT NOT NULL REFERENCES area(id_area),
    nome VARCHAR(100) NOT NULL,
    nivel VARCHAR(20),
    poligono JSONB,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_area, nome)
);

-- ─────────────────────────────────────────────
-- 7.3 SUBÁREA QUALIDADE (composição por bancada)
-- ─────────────────────────────────────────────
CREATE TABLE subarea_qualidade (
    id_subarea_qualidade BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_subarea BIGINT NOT NULL REFERENCES subarea(id_subarea),
    id_elemento_quimico BIGINT NOT NULL REFERENCES elemento_quimico(id_elemento_quimico),
    valor NUMERIC(10,4) NOT NULL,
    dt_amostra TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_subarea, id_elemento_quimico)
);

-- ─────────────────────────────────────────────
-- 7.4 ROTA (origem → destino)
-- ─────────────────────────────────────────────
CREATE TABLE rota (
    id_rota BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area_origem BIGINT NOT NULL REFERENCES area(id_area),
    id_area_destino BIGINT NOT NULL REFERENCES area(id_area),
    id_material BIGINT NOT NULL REFERENCES material(id_material),
    distancia_km NUMERIC(8,2),
    tempo_estimado_min INT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, id_area_origem, id_area_destino, id_material),
    CONSTRAINT chk_rota_diferente CHECK (id_area_origem != id_area_destino)
);

-- ─────────────────────────────────────────────
-- 7.5 ROTOGRAMA (cercas de velocidade)
-- ─────────────────────────────────────────────
CREATE TABLE rotograma (
    id_rotograma BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    versao INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    dt_vigencia_inicio TIMESTAMP,
    dt_vigencia_fim TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, nome, versao)
);

-- ─────────────────────────────────────────────
-- 7.6 ROTOGRAMA TRECHO
-- ─────────────────────────────────────────────
CREATE TABLE rotograma_trecho (
    id_rotograma_trecho BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_rotograma BIGINT NOT NULL REFERENCES rotograma(id_rotograma),
    id_area BIGINT REFERENCES area(id_area),
    nome VARCHAR(100) NOT NULL,
    poligono JSONB NOT NULL,
    velocidade_max_seco NUMERIC(5,1) NOT NULL,
    velocidade_max_chuva NUMERIC(5,1) NOT NULL,
    velocidade_max_cheio NUMERIC(5,1),
    velocidade_max_vazio NUMERIC(5,1),
    ordem INT DEFAULT 0,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 8: TURNOS & REGIME
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 8.1 TURNO
-- ─────────────────────────────────────────────
CREATE TABLE turno (
    id_turno BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(50) NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    cor VARCHAR(7),
    cruza_meia_noite BOOLEAN NOT NULL DEFAULT false,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, codigo),
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 8.2 REGIME DE TURNO
-- ─────────────────────────────────────────────
CREATE TABLE regime_turno (
    id_regime_turno BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 8.3 REGIME TURNO CALENDÁRIO (programação)
-- ─────────────────────────────────────────────
CREATE TABLE regime_turno_calendario (
    id_regime_turno_calendario BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_regime_turno BIGINT NOT NULL REFERENCES regime_turno(id_regime_turno),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_turno BIGINT NOT NULL REFERENCES turno(id_turno),
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP NOT NULL,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    EXCLUDE USING gist (
        id_equipamento WITH =,
        tsrange(dt_inicio, dt_fim) WITH &&
    )
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 9: ATIVIDADES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 9.1 ATIVIDADE (configuração)
-- ─────────────────────────────────────────────
CREATE TABLE atividade (
    id_atividade BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    classificacao VARCHAR(20) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    cor VARCHAR(7) NOT NULL,
    icone VARCHAR(50),
    conta_como_df BOOLEAN NOT NULL DEFAULT true,
    requer_operador BOOLEAN NOT NULL DEFAULT true,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, codigo),
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 9.2 ATIVIDADE REGRA (alertas por atividade)
-- ─────────────────────────────────────────────
CREATE TABLE atividade_regra (
    id_atividade_regra BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_atividade BIGINT NOT NULL REFERENCES atividade(id_atividade),
    tipo_regra VARCHAR(30) NOT NULL,
    operador_logico VARCHAR(5) NOT NULL DEFAULT '>',
    valor NUMERIC(10,2) NOT NULL,
    unidade VARCHAR(20) NOT NULL,
    alerta_tipo VARCHAR(20) NOT NULL DEFAULT 'WARNING',
    mensagem TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 9.3 EQUIPAMENTO ATIVIDADE HISTÓRICO (particionado por mês)
-- ─────────────────────────────────────────────
CREATE TABLE equipamento_atividade_historico (
    id_equipamento_atividade_historico BIGSERIAL,
    id_tenant BIGINT NOT NULL,
    id_equipamento BIGINT NOT NULL,
    id_atividade BIGINT NOT NULL,
    id_operador BIGINT,
    id_turno BIGINT,
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP,
    duracao_seg INT,
    origem VARCHAR(20) NOT NULL DEFAULT 'MOBILE',
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_equipamento_atividade_historico, dt_inicio)
) PARTITION BY RANGE (dt_inicio);

CREATE INDEX idx_eah_equip ON equipamento_atividade_historico(id_equipamento, dt_inicio DESC);
CREATE INDEX idx_eah_tenant ON equipamento_atividade_historico(id_tenant, dt_inicio DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 10: GPS & TELEMETRIA
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 10.1 GPS POSIÇÃO (particionado por mês — alto volume)
-- ─────────────────────────────────────────────
CREATE TABLE gps_posicao (
    id_gps_posicao BIGSERIAL,
    id_tenant BIGINT NOT NULL,
    id_equipamento BIGINT NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    velocidade NUMERIC(5,1),
    direcao INT,
    altitude NUMERIC(8,2),
    ignicao BOOLEAN,
    horimetro NUMERIC(12,2),
    odometro NUMERIC(12,2),
    nivel_tanque_pct NUMERIC(5,2),
    consumo_instantaneo_lh NUMERIC(8,2),
    satellites INT,
    hdop NUMERIC(4,2),
    dt_posicao TIMESTAMP NOT NULL,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_gps_posicao, dt_posicao)
) PARTITION BY RANGE (dt_posicao);

CREATE INDEX idx_gps_equip ON gps_posicao(id_equipamento, dt_posicao DESC);
CREATE INDEX idx_gps_tenant ON gps_posicao(id_tenant, dt_posicao DESC);

-- ─────────────────────────────────────────────
-- 10.2 EQUIPAMENTO SNAPSHOT (estado real-time — 1 por equipamento)
-- ─────────────────────────────────────────────
CREATE TABLE equipamento_snapshot (
    id_equipamento_snapshot BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),

    -- Operação atual
    status_operacional VARCHAR(30) NOT NULL DEFAULT 'DESLIGADO',
    id_atividade_atual BIGINT REFERENCES atividade(id_atividade),
    nome_atividade_atual VARCHAR(100),
    dt_inicio_atividade TIMESTAMP,
    duracao_atividade_seg INT,

    -- Operador
    id_operador_atual BIGINT REFERENCES operador(id_operador),
    nome_operador_atual VARCHAR(255),
    matricula_operador_atual VARCHAR(30),
    dt_login_operador TIMESTAMP,

    -- Turno
    id_turno_atual BIGINT REFERENCES turno(id_turno),
    nome_turno_atual VARCHAR(50),

    -- GPS
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    velocidade_atual NUMERIC(5,1),
    direcao INT,
    ignicao BOOLEAN,
    id_area_atual BIGINT REFERENCES area(id_area),
    nome_area_atual VARCHAR(100),
    dt_ultima_posicao TIMESTAMP,

    -- Movimento
    dt_ultimo_movimento TIMESTAMP,
    dt_ultima_parada TIMESTAMP,
    tempo_parado_seg INT,

    -- Contadores
    horimetro_atual NUMERIC(12,2),
    dt_leitura_horimetro TIMESTAMP,
    odometro_atual NUMERIC(12,2),
    dt_leitura_odometro TIMESTAMP,

    -- Tanque / Combustível
    nivel_tanque_pct NUMERIC(5,2),
    nivel_tanque_litros NUMERIC(8,2),
    capacidade_tanque_litros NUMERIC(8,2),
    consumo_instantaneo_lh NUMERIC(8,2),
    consumo_medio_turno_lh NUMERIC(8,2),
    dt_leitura_tanque TIMESTAMP,
    autonomia_horas NUMERIC(6,2),
    previsao_proximo_abastecimento TIMESTAMP,
    alerta_tanque_baixo BOOLEAN DEFAULT false,

    -- Último abastecimento
    dt_ultimo_abastecimento TIMESTAMP,
    litros_ultimo_abastecimento NUMERIC(10,2),
    horimetro_no_abastecimento NUMERIC(12,2),
    id_operador_abastecimento BIGINT,
    consumo_medio_lh NUMERIC(8,2),
    consumo_lt_ton NUMERIC(8,4),

    -- Último checklist
    id_ultimo_checklist BIGINT,
    tipo_ultimo_checklist VARCHAR(30),
    resultado_ultimo_checklist VARCHAR(20),
    total_itens_nao_conforme INT,
    dt_ultimo_checklist TIMESTAMP,

    -- Manutenção / OS
    id_os_aberta BIGINT,
    tipo_os_aberta VARCHAR(20),
    prioridade_os_aberta VARCHAR(20),
    dt_abertura_os TIMESTAMP,
    proxima_preventiva_nome VARCHAR(100),
    proxima_preventiva_gatilho VARCHAR(50),
    proxima_preventiva_restante VARCHAR(50),

    -- Último ciclo / Produção turno
    id_ultimo_ciclo BIGINT,
    dt_fim_ultimo_ciclo TIMESTAMP,
    duracao_ultimo_ciclo_seg INT,
    carga_ultimo_ciclo_ton NUMERIC(10,2),
    ciclos_turno_atual INT DEFAULT 0,
    producao_turno_atual_ton NUMERIC(12,2) DEFAULT 0,

    -- Último excesso
    dt_ultimo_excesso TIMESTAMP,
    velocidade_ultimo_excesso NUMERIC(5,1),
    limite_ultimo_excesso NUMERIC(5,1),

    -- Hardware
    hardware_gps_status VARCHAR(20),
    dt_ultimo_heartbeat_gps TIMESTAMP,
    hardware_tablet_status VARCHAR(20),
    dt_ultimo_heartbeat_tablet TIMESTAMP,

    -- Comunicação
    dt_ultima_comunicacao TIMESTAMP,
    segundos_sem_comunicacao INT,

    -- Regime
    em_horario_turno BOOLEAN DEFAULT true,
    horas_trabalhadas_turno NUMERIC(6,2),

    -- Controle
    dt_atualizacao TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_equipamento)
);

CREATE INDEX idx_eqs_tenant ON equipamento_snapshot(id_tenant);
CREATE INDEX idx_eqs_status ON equipamento_snapshot(id_tenant, status_operacional);
CREATE INDEX idx_eqs_area ON equipamento_snapshot(id_area_atual);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 11: CICLO OPERACIONAL
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 11.1 CICLO OPERACIONAL
-- ─────────────────────────────────────────────
CREATE TABLE ciclo_operacional (
    id_ciclo_operacional BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_operador BIGINT REFERENCES operador(id_operador),
    id_rota BIGINT REFERENCES rota(id_rota),
    id_turno BIGINT REFERENCES turno(id_turno),
    id_material BIGINT REFERENCES material(id_material),

    -- Áreas
    id_area_carga BIGINT REFERENCES area(id_area),
    id_area_descarga BIGINT REFERENCES area(id_area),
    id_equipamento_carga BIGINT REFERENCES equipamento(id_equipamento),

    -- Tempos
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP,
    dt_fila_carga TIMESTAMP,
    dt_inicio_carga TIMESTAMP,
    dt_fim_carga TIMESTAMP,
    dt_viagem_cheio TIMESTAMP,
    dt_fila_descarga TIMESTAMP,
    dt_inicio_descarga TIMESTAMP,
    dt_fim_descarga TIMESTAMP,
    dt_viagem_vazio TIMESTAMP,

    -- Duração em segundos
    duracao_total_seg INT,
    duracao_fila_carga_seg INT,
    duracao_carga_seg INT,
    duracao_viagem_cheio_seg INT,
    duracao_fila_descarga_seg INT,
    duracao_descarga_seg INT,
    duracao_viagem_vazio_seg INT,

    -- Carga
    carga_ton NUMERIC(10,2),
    volume_m3 NUMERIC(10,2),
    qtd_passes INT,

    -- Distância
    dmt_cheio_km NUMERIC(8,2),
    dmt_vazio_km NUMERIC(8,2),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',
    validado BOOLEAN DEFAULT false,

    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ciclo_equip ON ciclo_operacional(id_equipamento, dt_inicio DESC);
CREATE INDEX idx_ciclo_turno ON ciclo_operacional(id_tenant, id_turno, dt_inicio);

-- ─────────────────────────────────────────────
-- 11.2 APROPRIAÇÃO DE ROTA
-- ─────────────────────────────────────────────
CREATE TABLE apropriacao_rota (
    id_apropriacao_rota BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_rota BIGINT NOT NULL REFERENCES rota(id_rota),
    id_centro_custo BIGINT NOT NULL REFERENCES centro_custo(id_centro_custo),
    dmt_referencia_km NUMERIC(8,2),
    tempo_ciclo_referencia_min INT,
    ciclos_hora_referencia NUMERIC(6,2),
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP,
    observacao TEXT,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_aprop_ativa ON apropriacao_rota(id_tenant, id_rota) WHERE dt_fim IS NULL;

-- ─────────────────────────────────────────────
-- 11.3 APROPRIAÇÃO ROTA MODELO (override por modelo)
-- ─────────────────────────────────────────────
CREATE TABLE apropriacao_rota_modelo (
    id_apropriacao_rota_modelo BIGSERIAL PRIMARY KEY,
    id_apropriacao_rota BIGINT NOT NULL REFERENCES apropriacao_rota(id_apropriacao_rota),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    tempo_ciclo_min INT,
    ciclos_hora NUMERIC(6,2),
    velocidade_media_kmh NUMERIC(5,1),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_apropriacao_rota, id_modelo_equipamento)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 12: DISPATCH
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 12.1 DISPATCH CONFIGURAÇÃO
-- ─────────────────────────────────────────────
CREATE TABLE dispatch_config (
    id_dispatch_config BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant) UNIQUE,
    modo VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    algoritmo VARCHAR(30) DEFAULT 'MENOR_FILA',
    peso_fila NUMERIC(4,2) DEFAULT 0.4,
    peso_distancia NUMERIC(4,2) DEFAULT 0.3,
    peso_compatibilidade NUMERIC(4,2) DEFAULT 0.3,
    intervalo_recalculo_seg INT DEFAULT 60,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 12.2 DISPATCH ALOCAÇÃO (despacho efetivo)
-- ─────────────────────────────────────────────
CREATE TABLE dispatch_alocacao (
    id_dispatch_alocacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento_transporte BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_equipamento_carga BIGINT REFERENCES equipamento(id_equipamento),
    id_area_destino BIGINT REFERENCES area(id_area),
    id_rota BIGINT REFERENCES rota(id_rota),
    origem VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    dt_alocacao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_aceite TIMESTAMP,
    dt_conclusao TIMESTAMP,
    motivo_recusa TEXT
);

CREATE INDEX idx_dispatch_equip ON dispatch_alocacao(id_equipamento_transporte, dt_alocacao DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 13: CHECKLIST
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 13.1 CHECKLIST GRUPO
-- ─────────────────────────────────────────────
CREATE TABLE checklist_grupo (
    id_checklist_grupo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 13.2 CHECKLIST ITEM
-- ─────────────────────────────────────────────
CREATE TABLE checklist_item (
    id_checklist_item BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_checklist_grupo BIGINT NOT NULL REFERENCES checklist_grupo(id_checklist_grupo),
    descricao VARCHAR(255) NOT NULL,
    tipo_resposta VARCHAR(30) NOT NULL DEFAULT 'CONFORME_NAO_CONFORME',
    obrigatorio BOOLEAN NOT NULL DEFAULT true,
    requer_foto_nc BOOLEAN DEFAULT false,
    requer_observacao_nc BOOLEAN DEFAULT false,
    ordem INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 13.3 CHECKLIST GRUPO MODELO (vínculo grupo ↔ modelo)
-- ─────────────────────────────────────────────
CREATE TABLE checklist_grupo_modelo (
    id_checklist_grupo_modelo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_checklist_grupo BIGINT NOT NULL REFERENCES checklist_grupo(id_checklist_grupo),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_checklist_grupo, id_modelo_equipamento)
);

-- ─────────────────────────────────────────────
-- 13.4 CHECKLIST EXECUÇÃO
-- ─────────────────────────────────────────────
CREATE TABLE checklist_execucao (
    id_checklist_execucao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_checklist_grupo BIGINT NOT NULL REFERENCES checklist_grupo(id_checklist_grupo),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_operador BIGINT NOT NULL REFERENCES operador(id_operador),
    id_turno BIGINT REFERENCES turno(id_turno),
    resultado VARCHAR(20) NOT NULL,
    total_itens INT NOT NULL,
    total_conforme INT NOT NULL,
    total_nao_conforme INT NOT NULL,
    observacao_geral TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    dt_execucao TIMESTAMP NOT NULL,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    idempotency_key VARCHAR(100) UNIQUE
);

CREATE INDEX idx_check_exec_equip ON checklist_execucao(id_equipamento, dt_execucao DESC);

-- ─────────────────────────────────────────────
-- 13.5 CHECKLIST EXECUÇÃO ITEM
-- ─────────────────────────────────────────────
CREATE TABLE checklist_execucao_item (
    id_checklist_execucao_item BIGSERIAL PRIMARY KEY,
    id_checklist_execucao BIGINT NOT NULL REFERENCES checklist_execucao(id_checklist_execucao),
    id_checklist_item BIGINT NOT NULL REFERENCES checklist_item(id_checklist_item),
    resposta VARCHAR(30) NOT NULL,
    valor_texto TEXT,
    valor_numerico NUMERIC(12,4),
    observacao TEXT,
    foto_url VARCHAR(500),
    ordem INT NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 14: MANUTENÇÃO
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 14.1 TIPO MANUTENÇÃO
-- ─────────────────────────────────────────────
CREATE TABLE tipo_manutencao (
    id_tipo_manutencao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(50) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    classificacao VARCHAR(20) NOT NULL,
    cor VARCHAR(7),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, codigo)
);

-- ─────────────────────────────────────────────
-- 14.2 PLANO DE MANUTENÇÃO (preventiva)
-- ─────────────────────────────────────────────
CREATE TABLE plano_manutencao (
    id_plano_manutencao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    id_modelo_equipamento BIGINT REFERENCES modelo_equipamento(id_modelo_equipamento),
    tipo_gatilho VARCHAR(20) NOT NULL,
    intervalo_horas NUMERIC(10,2),
    intervalo_km NUMERIC(10,2),
    intervalo_dias INT,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 14.3 PLANO MANUTENÇÃO ITEM
-- ─────────────────────────────────────────────
CREATE TABLE plano_manutencao_item (
    id_plano_manutencao_item BIGSERIAL PRIMARY KEY,
    id_plano_manutencao BIGINT NOT NULL REFERENCES plano_manutencao(id_plano_manutencao),
    descricao VARCHAR(255) NOT NULL,
    tipo_servico VARCHAR(50),
    tempo_estimado_min INT,
    ordem INT DEFAULT 0,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 14.4 PEÇA (catálogo)
-- ─────────────────────────────────────────────
CREATE TABLE peca (
    id_peca BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(150) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    part_number VARCHAR(50),
    fabricante VARCHAR(100),
    unidade VARCHAR(20) NOT NULL DEFAULT 'UN',
    estoque_minimo NUMERIC(10,2) DEFAULT 0,
    estoque_atual NUMERIC(10,2) DEFAULT 0,
    custo_unitario NUMERIC(12,2),
    localizacao VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, codigo)
);

-- ─────────────────────────────────────────────
-- 14.5 PEÇA MOVIMENTAÇÃO
-- ─────────────────────────────────────────────
CREATE TABLE peca_movimentacao (
    id_peca_movimentacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_peca BIGINT NOT NULL REFERENCES peca(id_peca),
    tipo VARCHAR(20) NOT NULL,
    quantidade NUMERIC(10,2) NOT NULL,
    id_ordem_servico BIGINT,
    motivo TEXT,
    id_usuario BIGINT REFERENCES usuario(id_usuario),
    dt_movimentacao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 14.6 ORDEM DE SERVIÇO
-- ─────────────────────────────────────────────
CREATE TABLE ordem_servico (
    id_ordem_servico BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_tipo_manutencao BIGINT NOT NULL REFERENCES tipo_manutencao(id_tipo_manutencao),
    id_plano_manutencao BIGINT REFERENCES plano_manutencao(id_plano_manutencao),
    id_equipamento_componente BIGINT REFERENCES equipamento_componente(id_equipamento_componente),
    numero VARCHAR(30),
    prioridade VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    descricao TEXT NOT NULL,
    diagnostico TEXT,
    solucao TEXT,
    id_usuario_solicitante BIGINT REFERENCES usuario(id_usuario),
    id_usuario_responsavel BIGINT REFERENCES usuario(id_usuario),
    horimetro_abertura NUMERIC(12,2),
    dt_abertura TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_previsao TIMESTAMP,
    dt_inicio_execucao TIMESTAMP,
    dt_conclusao TIMESTAMP,
    custo_total NUMERIC(12,2),
    observacao TEXT,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_os_equip ON ordem_servico(id_equipamento, dt_abertura DESC);
CREATE INDEX idx_os_status ON ordem_servico(id_tenant, status);

-- ─────────────────────────────────────────────
-- 14.7 OS ITEM (serviços realizados)
-- ─────────────────────────────────────────────
CREATE TABLE os_item (
    id_os_item BIGSERIAL PRIMARY KEY,
    id_ordem_servico BIGINT NOT NULL REFERENCES ordem_servico(id_ordem_servico),
    descricao VARCHAR(255) NOT NULL,
    tipo_servico VARCHAR(50),
    tempo_minutos INT,
    custo NUMERIC(12,2),
    concluido BOOLEAN DEFAULT false,
    ordem INT DEFAULT 0,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 14.8 OS PEÇA (peças usadas na OS)
-- ─────────────────────────────────────────────
CREATE TABLE os_peca (
    id_os_peca BIGSERIAL PRIMARY KEY,
    id_ordem_servico BIGINT NOT NULL REFERENCES ordem_servico(id_ordem_servico),
    id_peca BIGINT NOT NULL REFERENCES peca(id_peca),
    quantidade NUMERIC(10,2) NOT NULL,
    custo_unitario NUMERIC(12,2),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 14.9 SOLICITAÇÃO DE MANUTENÇÃO (pedido do operador)
-- ─────────────────────────────────────────────
CREATE TABLE solicitacao_manutencao (
    id_solicitacao_manutencao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_operador BIGINT REFERENCES operador(id_operador),
    descricao TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'MEDIA',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    id_ordem_servico BIGINT REFERENCES ordem_servico(id_ordem_servico),
    dt_solicitacao TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 15: ABASTECIMENTO
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 15.1 POSTO DE ABASTECIMENTO
-- ─────────────────────────────────────────────
CREATE TABLE posto_abastecimento (
    id_posto_abastecimento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area BIGINT REFERENCES area(id_area),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    id_equipamento_comboio BIGINT REFERENCES equipamento(id_equipamento),
    capacidade_litros NUMERIC(12,2),
    estoque_atual_litros NUMERIC(12,2),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 15.2 ABASTECIMENTO
-- ─────────────────────────────────────────────
CREATE TABLE abastecimento (
    id_abastecimento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_operador BIGINT REFERENCES operador(id_operador),
    id_posto_abastecimento BIGINT REFERENCES posto_abastecimento(id_posto_abastecimento),
    id_combustivel BIGINT NOT NULL REFERENCES combustivel(id_combustivel),
    id_turno BIGINT REFERENCES turno(id_turno),
    litros NUMERIC(10,2) NOT NULL,
    horimetro_momento NUMERIC(12,2),
    odometro_momento NUMERIC(12,2),
    nivel_tanque_antes_pct NUMERIC(5,2),
    nivel_tanque_depois_pct NUMERIC(5,2),
    horas_desde_ultimo NUMERIC(8,2),
    km_desde_ultimo NUMERIC(10,2),
    consumo_calculado_lh NUMERIC(8,2),
    consumo_calculado_lkm NUMERIC(8,4),
    toneladas_desde_ultimo NUMERIC(12,2),
    consumo_calculado_lt NUMERIC(8,4),
    origem VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    validado BOOLEAN DEFAULT false,
    id_usuario_validacao BIGINT REFERENCES usuario(id_usuario),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    observacao TEXT,
    dt_abastecimento TIMESTAMP NOT NULL,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abast_equip ON abastecimento(id_equipamento, dt_abastecimento DESC);

-- ─────────────────────────────────────────────
-- 15.3 CONFIG ALERTA TANQUE
-- ─────────────────────────────────────────────
CREATE TABLE config_alerta_tanque (
    id_config_alerta_tanque BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_modelo_equipamento BIGINT REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_equipamento BIGINT REFERENCES equipamento(id_equipamento),
    nivel_alerta_pct NUMERIC(5,2) NOT NULL DEFAULT 20,
    nivel_critico_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
    autonomia_alerta_horas NUMERIC(6,2) DEFAULT 2,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 16: QUALIDADE & PILHA
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 16.1 GRANULOMETRIA FAIXA
-- ─────────────────────────────────────────────
CREATE TABLE granulometria_faixa (
    id_granulometria_faixa BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(50) NOT NULL,
    abertura_mm_min NUMERIC(8,3),
    abertura_mm_max NUMERIC(8,3),
    ordem INT DEFAULT 0,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 16.2 PILHA (estoque de material)
-- ─────────────────────────────────────────────
CREATE TABLE pilha (
    id_pilha BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area BIGINT REFERENCES area(id_area),
    id_material BIGINT REFERENCES material(id_material),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(30),
    capacidade_max_ton NUMERIC(12,2),
    estoque_atual_ton NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, nome)
);

-- ─────────────────────────────────────────────
-- 16.3 PILHA QUALIDADE ATUAL (média ponderada — 1 por pilha)
-- ─────────────────────────────────────────────
CREATE TABLE pilha_qualidade_atual (
    id_pilha_qualidade_atual BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_pilha BIGINT NOT NULL REFERENCES pilha(id_pilha),
    id_elemento_quimico BIGINT NOT NULL REFERENCES elemento_quimico(id_elemento_quimico),
    valor_medio_ponderado NUMERIC(10,4) NOT NULL,
    dt_atualizacao TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, id_pilha, id_elemento_quimico)
);

-- ─────────────────────────────────────────────
-- 16.4 PILHA QUALIDADE HISTÓRICO (cada amostra)
-- ─────────────────────────────────────────────
CREATE TABLE pilha_qualidade_historico (
    id_pilha_qualidade_historico BIGSERIAL,
    id_tenant BIGINT NOT NULL,
    id_pilha BIGINT NOT NULL,
    id_elemento_quimico BIGINT NOT NULL,
    valor NUMERIC(10,4) NOT NULL,
    tonelagem_referencia NUMERIC(12,2),
    tipo_movimento VARCHAR(10) NOT NULL,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_pilha_qualidade_historico, dt_registro)
) PARTITION BY RANGE (dt_registro);

-- ─────────────────────────────────────────────
-- 16.5 PILHA MOVIMENTAÇÃO
-- ─────────────────────────────────────────────
CREATE TABLE pilha_movimentacao (
    id_pilha_movimentacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_pilha BIGINT NOT NULL REFERENCES pilha(id_pilha),
    tipo VARCHAR(10) NOT NULL,
    tonelagem NUMERIC(12,2) NOT NULL,
    id_area_origem BIGINT REFERENCES area(id_area),
    id_area_destino BIGINT REFERENCES area(id_area),
    observacao TEXT,
    dt_movimentacao TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 17: MENSAGERIA
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 17.1 MENSAGEM TEMPLATE
-- ─────────────────────────────────────────────
CREATE TABLE mensagem_template (
    id_mensagem_template BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    categoria VARCHAR(50) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    conteudo TEXT NOT NULL,
    variaveis JSONB,
    prioridade_padrao VARCHAR(20) DEFAULT 'NORMAL',
    expira_em_minutos_padrao INT,
    requer_confirmacao BOOLEAN DEFAULT false,
    icone VARCHAR(50),
    cor VARCHAR(7),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, titulo)
);

-- ─────────────────────────────────────────────
-- 17.2 MENSAGEM RESPOSTA RÁPIDA
-- ─────────────────────────────────────────────
CREATE TABLE mensagem_resposta_rapida (
    id_mensagem_resposta_rapida BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    texto VARCHAR(100) NOT NULL,
    icone VARCHAR(50),
    categoria VARCHAR(50),
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 17.3 MENSAGEM CONVERSA (thread por equip+turno)
-- ─────────────────────────────────────────────
CREATE TABLE mensagem_conversa (
    id_mensagem_conversa BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_turno BIGINT REFERENCES turno(id_turno),
    total_mensagens INT DEFAULT 0,
    mensagens_nao_lidas_sala INT DEFAULT 0,
    mensagens_nao_lidas_equip INT DEFAULT 0,
    ultima_mensagem_preview TEXT,
    dt_ultima_mensagem TIMESTAMP,
    dt_inicio TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_fim TIMESTAMP
);

CREATE INDEX idx_conv_equip ON mensagem_conversa(id_equipamento, dt_inicio DESC);

-- ─────────────────────────────────────────────
-- 17.4 MENSAGEM OPERACIONAL
-- ─────────────────────────────────────────────
CREATE TABLE mensagem_operacional (
    id_mensagem_operacional BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_mensagem_conversa BIGINT REFERENCES mensagem_conversa(id_mensagem_conversa),
    id_operador BIGINT REFERENCES operador(id_operador),
    direcao VARCHAR(10) NOT NULL,
    id_usuario_remetente BIGINT REFERENCES usuario(id_usuario),
    tipo VARCHAR(20) NOT NULL DEFAULT 'TEXTO',
    conteudo TEXT NOT NULL,
    id_mensagem_template BIGINT REFERENCES mensagem_template(id_mensagem_template),
    prioridade VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(20) NOT NULL DEFAULT 'ENVIADO',
    dt_envio TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_entrega TIMESTAMP,
    dt_leitura TIMESTAMP,
    id_mensagem_pai BIGINT REFERENCES mensagem_operacional(id_mensagem_operacional),
    expira_em_minutos INT,
    dt_expiracao TIMESTAMP,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_msg_equip ON mensagem_operacional(id_equipamento, dt_envio DESC);
CREATE INDEX idx_msg_status ON mensagem_operacional(id_tenant, status, dt_envio DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 18: EMAIL
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 18.1 EMAIL TEMPLATE
-- ─────────────────────────────────────────────
CREATE TABLE email_template (
    id_email_template BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT REFERENCES tenant(id_tenant),
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    assunto_template VARCHAR(255) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    variaveis_disponiveis JSONB,
    idioma VARCHAR(5) NOT NULL DEFAULT 'pt-BR',
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(codigo, idioma, id_tenant)
);

-- ─────────────────────────────────────────────
-- 18.2 EMAIL FILA
-- ─────────────────────────────────────────────
CREATE TABLE email_fila (
    id_email_fila BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT REFERENCES tenant(id_tenant),
    para_email VARCHAR(255) NOT NULL,
    para_nome VARCHAR(255),
    cc JSONB,
    bcc JSONB,
    id_email_template BIGINT REFERENCES email_template(id_email_template),
    assunto VARCHAR(255) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    anexos JSONB,
    prioridade INT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    tentativas INT DEFAULT 0,
    max_tentativas INT DEFAULT 3,
    provider_message_id VARCHAR(200),
    dt_envio TIMESTAMP,
    dt_entrega TIMESTAMP,
    dt_abertura TIMESTAMP,
    erro_mensagem TEXT,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_processar_apos TIMESTAMP
);

CREATE INDEX idx_email_status ON email_fila(status, prioridade DESC, dt_registro);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 19: NOTIFICAÇÕES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 19.1 NOTIFICAÇÃO (in-app)
-- ─────────────────────────────────────────────
CREATE TABLE notificacao (
    id_notificacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    tipo VARCHAR(30) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    rota_frontend VARCHAR(200),
    parametros JSONB,
    prioridade VARCHAR(20) DEFAULT 'NORMAL',
    lida BOOLEAN NOT NULL DEFAULT false,
    dt_leitura TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_expiracao TIMESTAMP
);

CREATE INDEX idx_notif_user ON notificacao(id_usuario, lida, dt_registro DESC);

-- ─────────────────────────────────────────────
-- 19.2 NOTIFICAÇÃO PREFERÊNCIA
-- ─────────────────────────────────────────────
CREATE TABLE notificacao_preferencia (
    id_notificacao_preferencia BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    tipo_notificacao VARCHAR(30) NOT NULL,
    canal_web BOOLEAN DEFAULT true,
    canal_email BOOLEAN DEFAULT false,
    canal_push BOOLEAN DEFAULT false,
    UNIQUE(id_usuario, tipo_notificacao)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 20: CONTROLE & AUDITORIA
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 20.1 PERÍODO FECHAMENTO
-- ─────────────────────────────────────────────
CREATE TABLE periodo_fechamento (
    id_periodo_fechamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    ano INT NOT NULL,
    mes INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    id_usuario_fechamento BIGINT REFERENCES usuario(id_usuario),
    dt_fechamento TIMESTAMP,
    id_usuario_reabertura BIGINT REFERENCES usuario(id_usuario),
    dt_reabertura TIMESTAMP,
    justificativa_reabertura TEXT,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, ano, mes)
);

-- ─────────────────────────────────────────────
-- 20.2 AUDIT TRAIL
-- ─────────────────────────────────────────────
CREATE TABLE audit_trail (
    id_audit_trail BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_usuario BIGINT REFERENCES usuario(id_usuario),
    tabela VARCHAR(100) NOT NULL,
    id_registro BIGINT NOT NULL,
    acao VARCHAR(20) NOT NULL,
    dados_antes JSONB,
    dados_depois JSONB,
    campos_alterados TEXT[],
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tabela ON audit_trail(id_tenant, tabela, id_registro, dt_registro DESC);
CREATE INDEX idx_audit_user ON audit_trail(id_usuario, dt_registro DESC);

-- ─────────────────────────────────────────────
-- 20.3 ALERTA (gerados pelo sistema)
-- ─────────────────────────────────────────────
CREATE TABLE alerta (
    id_alerta BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT REFERENCES equipamento(id_equipamento),
    id_operador BIGINT REFERENCES operador(id_operador),
    tipo VARCHAR(50) NOT NULL,
    severidade VARCHAR(20) NOT NULL DEFAULT 'WARNING',
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    dados JSONB,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    tratado BOOLEAN DEFAULT false,
    id_usuario_tratamento BIGINT REFERENCES usuario(id_usuario),
    dt_tratamento TIMESTAMP,
    dt_alerta TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerta_equip ON alerta(id_equipamento, dt_alerta DESC);
CREATE INDEX idx_alerta_tipo ON alerta(id_tenant, tipo, tratado, dt_alerta DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 21: ARQUIVO (upload genérico)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE arquivo (
    id_arquivo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    entidade VARCHAR(50) NOT NULL,
    id_entidade BIGINT NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    nome_storage VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    categoria VARCHAR(50),
    descricao VARCHAR(255),
    bucket VARCHAR(100) NOT NULL,
    path_s3 VARCHAR(500) NOT NULL,
    id_usuario_upload BIGINT REFERENCES usuario(id_usuario),
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_arquivo_entidade ON arquivo(entidade, id_entidade);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 22: TRADUÇÃO (i18n para dados do banco)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE traducao (
    id_traducao BIGSERIAL PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    id_registro BIGINT NOT NULL,
    campo VARCHAR(100) NOT NULL,
    idioma VARCHAR(5) NOT NULL,
    valor TEXT NOT NULL,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(tabela, id_registro, campo, idioma)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 23: RELATÓRIOS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 23.1 RELATÓRIO DEFINIÇÃO
-- ─────────────────────────────────────────────
CREATE TABLE relatorio_definicao (
    id_relatorio_definicao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT REFERENCES tenant(id_tenant),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL,
    escopo VARCHAR(20) NOT NULL DEFAULT 'TENANT',
    id_usuario_criador BIGINT REFERENCES usuario(id_usuario),
    config JSONB NOT NULL,
    publico BOOLEAN DEFAULT false,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 23.2 RELATÓRIO AGENDAMENTO
-- ─────────────────────────────────────────────
CREATE TABLE relatorio_agendamento (
    id_relatorio_agendamento BIGSERIAL PRIMARY KEY,
    id_relatorio_definicao BIGINT NOT NULL REFERENCES relatorio_definicao(id_relatorio_definicao),
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    cron_expression VARCHAR(100) NOT NULL,
    formato_saida VARCHAR(20) NOT NULL DEFAULT 'PDF',
    destinatarios JSONB NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_ultima_execucao TIMESTAMP,
    dt_proxima_execucao TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 24: SYNC MOBILE
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 24.1 DEVICE MOBILE (registro de tablets)
-- ─────────────────────────────────────────────
CREATE TABLE device_mobile (
    id_device_mobile BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT REFERENCES equipamento(id_equipamento),
    device_id VARCHAR(255) NOT NULL,
    modelo VARCHAR(100),
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    ultimo_sync_versao BIGINT DEFAULT 0,
    dt_ultimo_sync TIMESTAMP,
    dt_ultimo_heartbeat TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    dt_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(id_tenant, device_id)
);

-- ─────────────────────────────────────────────
-- 24.2 SYNC LOG
-- ─────────────────────────────────────────────
CREATE TABLE sync_log (
    id_sync_log BIGSERIAL PRIMARY KEY,
    id_device_mobile BIGINT NOT NULL REFERENCES device_mobile(id_device_mobile),
    direcao VARCHAR(10) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    registros_enviados INT DEFAULT 0,
    registros_recebidos INT DEFAULT 0,
    bytes_transferidos BIGINT DEFAULT 0,
    duracao_ms INT,
    status VARCHAR(20) NOT NULL,
    erro TEXT,
    dt_sync TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 25: ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Habilitar RLS em todas as tabelas com id_tenant
-- (exemplo para as principais — aplicar o mesmo padrão em todas)

ALTER TABLE equipamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE operador ENABLE ROW LEVEL SECURITY;
ALTER TABLE area ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclo_operacional ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_execucao ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagem_operacional ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamento_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_posicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Política padrão: usuário só vê dados do seu tenant
-- app.current_tenant é setado pela aplicação a cada request via SET LOCAL
CREATE POLICY tenant_isolation ON equipamento
    USING (id_tenant = current_setting('app.current_tenant')::BIGINT);

CREATE POLICY tenant_isolation ON operador
    USING (id_tenant = current_setting('app.current_tenant')::BIGINT);

CREATE POLICY tenant_isolation ON area
    USING (id_tenant = current_setting('app.current_tenant')::BIGINT);

CREATE POLICY tenant_isolation ON equipamento_snapshot
    USING (id_tenant = current_setting('app.current_tenant')::BIGINT);

-- Política de fechamento: bloquear edições em períodos fechados
-- (implementada via middleware + trigger, não policy pura)

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 26: VIEWS ÚTEIS
-- ═══════════════════════════════════════════════════════════════════════════════

-- View: Monitor de equipamentos (tela principal)
CREATE VIEW vw_equipamento_monitor AS
SELECT
    es.*,
    e.codigo AS equipamento_codigo,
    me.nome AS modelo_nome,
    ge.nome AS grupo_nome,
    ge.tipo_operacao,
    c.nome_fantasia AS contratada_nome,
    me.capacidade_carga_ton AS modelo_capacidade_ton
FROM equipamento_snapshot es
JOIN equipamento e ON e.id_equipamento = es.id_equipamento
JOIN modelo_equipamento me ON me.id_modelo_equipamento = e.id_modelo_equipamento
JOIN grupo_equipamento ge ON ge.id_grupo_equipamento = me.id_grupo_equipamento
JOIN contratada c ON c.id_contratada = e.id_contratada
WHERE e.ativo = true AND e.dt_deletado IS NULL;

-- View: Equipamentos offline
CREATE VIEW vw_equipamento_offline AS
SELECT
    es.*,
    e.codigo
FROM equipamento_snapshot es
JOIN equipamento e ON e.id_equipamento = es.id_equipamento
WHERE es.hardware_gps_status = 'OFFLINE'
  AND es.status_operacional NOT IN ('DESLIGADO', 'FORA_FROTA')
ORDER BY es.dt_ultima_comunicacao ASC;

-- View: Próximas preventivas
CREATE VIEW vw_proximas_preventivas AS
SELECT
    es.id_equipamento,
    e.codigo,
    es.horimetro_atual,
    es.proxima_preventiva_nome,
    es.proxima_preventiva_gatilho,
    es.proxima_preventiva_restante
FROM equipamento_snapshot es
JOIN equipamento e ON e.id_equipamento = es.id_equipamento
WHERE es.proxima_preventiva_nome IS NOT NULL
ORDER BY es.proxima_preventiva_restante ASC;

-- View: Tanques baixos
CREATE VIEW vw_tanque_baixo AS
SELECT
    es.id_equipamento,
    e.codigo,
    es.nivel_tanque_pct,
    es.autonomia_horas,
    es.previsao_proximo_abastecimento,
    es.alerta_tanque_baixo
FROM equipamento_snapshot es
JOIN equipamento e ON e.id_equipamento = es.id_equipamento
WHERE es.nivel_tanque_pct IS NOT NULL
  AND es.nivel_tanque_pct < 30
ORDER BY es.nivel_tanque_pct ASC;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 27: TRIGGERS & FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Trigger: atualizar dt_alteracao automaticamente
CREATE OR REPLACE FUNCTION fn_atualizar_dt_alteracao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dt_alteracao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas com dt_alteracao
CREATE TRIGGER trg_equipamento_dt_alteracao BEFORE UPDATE ON equipamento
    FOR EACH ROW EXECUTE FUNCTION fn_atualizar_dt_alteracao();

CREATE TRIGGER trg_operador_dt_alteracao BEFORE UPDATE ON operador
    FOR EACH ROW EXECUTE FUNCTION fn_atualizar_dt_alteracao();

CREATE TRIGGER trg_modelo_dt_alteracao BEFORE UPDATE ON modelo_equipamento
    FOR EACH ROW EXECUTE FUNCTION fn_atualizar_dt_alteracao();

CREATE TRIGGER trg_contratada_dt_alteracao BEFORE UPDATE ON contratada
    FOR EACH ROW EXECUTE FUNCTION fn_atualizar_dt_alteracao();

CREATE TRIGGER trg_os_dt_alteracao BEFORE UPDATE ON ordem_servico
    FOR EACH ROW EXECUTE FUNCTION fn_atualizar_dt_alteracao();

-- Trigger: sync_versao para tabelas sincronizáveis (mobile offline)
CREATE SEQUENCE sync_versao_seq;

CREATE OR REPLACE FUNCTION fn_incrementar_sync_versao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sync_versao = nextval('sync_versao_seq');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas que sincronizam com mobile
-- (atividade, operador, checklist_grupo, checklist_item, area, turno, etc.)

-- Trigger: recalcular qualidade da pilha
CREATE OR REPLACE FUNCTION fn_recalcular_qualidade_pilha()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcula média ponderada para a pilha e elemento
    UPDATE pilha_qualidade_atual pqa
    SET valor_medio_ponderado = (
        SELECT SUM(h.valor * h.tonelagem_referencia) / NULLIF(SUM(h.tonelagem_referencia), 0)
        FROM pilha_qualidade_historico h
        WHERE h.id_pilha = NEW.id_pilha
          AND h.id_elemento_quimico = NEW.id_elemento_quimico
          AND h.tipo_movimento = 'ENTRADA'
    ),
    dt_atualizacao = NOW()
    WHERE pqa.id_pilha = NEW.id_pilha
      AND pqa.id_elemento_quimico = NEW.id_elemento_quimico;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: audit trail automático (genérico)
CREATE OR REPLACE FUNCTION fn_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (id_tenant, id_usuario, tabela, id_registro, acao, dados_antes, dados_depois)
        VALUES (
            OLD.id_tenant,
            current_setting('app.current_user', true)::BIGINT,
            TG_TABLE_NAME,
            OLD.id_equipamento, -- adaptar por tabela
            'UPDATE',
            row_to_json(OLD),
            row_to_json(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (id_tenant, id_usuario, tabela, id_registro, acao, dados_antes)
        VALUES (
            OLD.id_tenant,
            current_setting('app.current_user', true)::BIGINT,
            TG_TABLE_NAME,
            OLD.id_equipamento,
            'DELETE',
            row_to_json(OLD)
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEÇÃO 28: PARTIÇÕES (criar mensalmente via cron job)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Exemplo: criar partição do mês atual para gps_posicao
-- Executar mensalmente via pg_cron ou job externo:
--
-- CREATE TABLE gps_posicao_2024_06 PARTITION OF gps_posicao
--     FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
--
-- CREATE TABLE equipamento_atividade_historico_2024_06
--     PARTITION OF equipamento_atividade_historico
--     FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
--
-- CREATE TABLE pilha_qualidade_historico_2024_06
--     PARTITION OF pilha_qualidade_historico
--     FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIM DO SCHEMA
-- Total de tabelas: ~132
-- ═══════════════════════════════════════════════════════════════════════════════

