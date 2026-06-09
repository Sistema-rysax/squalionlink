-- ============================================================================
-- SqualionLink — Schema Completo
-- PostgreSQL 16 | Multi-Tenant (RLS) | UTC+0
-- ============================================================================

-- ============================================================================
-- EXTENSÕES
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- para operações geográficas

-- ============================================================================
-- PLATAFORMA (Sem RLS — tabelas globais)
-- ============================================================================

CREATE TABLE plano (
    id_plano BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    max_usuarios INT,
    max_equipamentos INT,
    preco_mensal NUMERIC(12,2),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE funcionalidade (
    id_funcionalidade BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE plano_funcionalidade (
    id_plano_funcionalidade BIGSERIAL PRIMARY KEY,
    id_plano BIGINT NOT NULL REFERENCES plano(id_plano),
    id_funcionalidade BIGINT NOT NULL REFERENCES funcionalidade(id_funcionalidade),
    UNIQUE(id_plano, id_funcionalidade)
);

-- ============================================================================
-- TENANT
-- ============================================================================

CREATE TABLE tenant (
    id_tenant BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(14),
    utc_offset VARCHAR(6) NOT NULL DEFAULT '+00:00',
    timezone_id VARCHAR(50) NOT NULL DEFAULT 'UTC',
    idioma_padrao VARCHAR(5) NOT NULL DEFAULT 'pt-BR',
    logo_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_deletado TIMESTAMP
);

CREATE TABLE tenant_plano (
    id_tenant_plano BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_plano BIGINT NOT NULL REFERENCES plano(id_plano),
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- ============================================================================
-- USUÁRIO / PERFIL / PERMISSÃO
-- ============================================================================

CREATE TABLE perfil (
    id_perfil BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE perfil_funcionalidade (
    id_perfil_funcionalidade BIGSERIAL PRIMARY KEY,
    id_perfil BIGINT NOT NULL REFERENCES perfil(id_perfil),
    id_funcionalidade BIGINT NOT NULL REFERENCES funcionalidade(id_funcionalidade),
    UNIQUE(id_perfil, id_funcionalidade)
);

CREATE TABLE usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    idioma VARCHAR(5),
    ativo BOOLEAN NOT NULL DEFAULT true,
    ultimo_acesso TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_deletado TIMESTAMP
);

CREATE TABLE usuario_perfil (
    id_usuario_perfil BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id_usuario),
    id_perfil BIGINT NOT NULL REFERENCES perfil(id_perfil),
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    UNIQUE(id_usuario, id_perfil)
);

-- ============================================================================
-- CONTRATADA
-- ============================================================================

CREATE TABLE contratada (
    id_contratada BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(14),
    tipo VARCHAR(20) NOT NULL DEFAULT 'PROPRIA',
    contato_nome VARCHAR(100),
    contato_telefone VARCHAR(20),
    contato_email VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_deletado TIMESTAMP
);

-- ============================================================================
-- FROTA (Fabricante, Combustível, Grupo, Modelo, Equipamento)
-- ============================================================================

CREATE TABLE fabricante (
    id_fabricante BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE combustivel (
    id_combustivel BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    unidade VARCHAR(10) NOT NULL DEFAULT 'L',
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE grupo_equipamento (
    id_grupo_equipamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    icone VARCHAR(50),
    cor VARCHAR(7),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE modelo_equipamento (
    id_modelo_equipamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_fabricante BIGINT NOT NULL REFERENCES fabricante(id_fabricante),
    id_grupo_equipamento BIGINT NOT NULL REFERENCES grupo_equipamento(id_grupo_equipamento),
    nome VARCHAR(100) NOT NULL,
    capacidade_carga NUMERIC(12,2),
    peso_operacional NUMERIC(12,2),
    potencia_hp NUMERIC(10,2),
    consumo_medio_hora NUMERIC(10,2),
    vida_util_horas INT,
    imagem_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE modelo_combustivel (
    id_modelo_combustivel BIGSERIAL PRIMARY KEY,
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_combustivel BIGINT NOT NULL REFERENCES combustivel(id_combustivel),
    principal BOOLEAN DEFAULT false,
    UNIQUE(id_modelo_equipamento, id_combustivel)
);

CREATE TABLE equipamento (
    id_equipamento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_contratada BIGINT NOT NULL REFERENCES contratada(id_contratada),
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(100),
    placa VARCHAR(20),
    chassi VARCHAR(50),
    serie VARCHAR(50),
    ano_fabricacao INT,
    horimetro_atual NUMERIC(12,2) DEFAULT 0,
    odometro_atual NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    dt_aquisicao TIMESTAMP,
    imagem_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_deletado TIMESTAMP,
    UNIQUE(id_tenant, codigo)
);

CREATE TABLE equipamento_componente (
    id_equipamento_componente BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    tipo VARCHAR(50) NOT NULL,
    descricao VARCHAR(255),
    numero_serie VARCHAR(100),
    horimetro_instalacao NUMERIC(12,2),
    vida_util_horas INT,
    dt_instalacao TIMESTAMP,
    dt_remocao TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- ============================================================================
-- ÁREA & GEO
-- ============================================================================

CREATE TABLE area_tipo (
    id_area_tipo SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

INSERT INTO area_tipo (codigo) VALUES 
('ORIGEM'),('DESTINO'),('IMPRODUTIVA'),('MANUTENCAO'),
('ABASTECIMENTO'),('ESTACIONAMENTO'),('DESCARTE'),('BRITAGEM');

CREATE TABLE area (
    id_area BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area_tipo INT NOT NULL REFERENCES area_tipo(id_area_tipo),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    descricao TEXT,
    cor VARCHAR(7),
    geofence JSONB,
    latitude_centro NUMERIC(10,7),
    longitude_centro NUMERIC(10,7),
    altitude NUMERIC(8,2),
    raio_metros NUMERIC(10,2),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE subarea (
    id_subarea BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area BIGINT NOT NULL REFERENCES area(id_area),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    geofence JSONB,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE rota (
    id_rota BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_area_origem BIGINT NOT NULL REFERENCES area(id_area),
    id_area_destino BIGINT NOT NULL REFERENCES area(id_area),
    nome VARCHAR(100),
    distancia_km NUMERIC(8,2),
    tempo_estimado_min INT,
    polyline JSONB,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- ============================================================================
-- OPERADOR
-- ============================================================================

CREATE TABLE turno (
    id_turno BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE operador (
    id_operador BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_contratada BIGINT NOT NULL REFERENCES contratada(id_contratada),
    matricula VARCHAR(30),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11),
    telefone VARCHAR(20),
    email VARCHAR(100),
    foto_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    dt_admissao TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_alteracao TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    dt_deletado TIMESTAMP
);

CREATE TABLE operador_habilitacao (
    id_operador_habilitacao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_operador BIGINT NOT NULL REFERENCES operador(id_operador),
    id_modelo_equipamento BIGINT REFERENCES modelo_equipamento(id_modelo_equipamento),
    id_equipamento BIGINT REFERENCES equipamento(id_equipamento),
    dt_validade TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE operador_documento (
    id_operador_documento BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_operador BIGINT NOT NULL REFERENCES operador(id_operador),
    tipo VARCHAR(30) NOT NULL,
    numero VARCHAR(50),
    dt_emissao TIMESTAMP,
    dt_validade TIMESTAMP,
    arquivo_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- ============================================================================
-- CHECKLIST
-- ============================================================================

CREATE TABLE checklist_grupo (
    id_checklist_grupo BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    periodicidade VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE checklist_item (
    id_checklist_item BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_checklist_grupo BIGINT NOT NULL REFERENCES checklist_grupo(id_checklist_grupo),
    codigo VARCHAR(20),
    descricao VARCHAR(500) NOT NULL,
    tipo_resposta VARCHAR(20) NOT NULL DEFAULT 'CONFORME_NAO_CONFORME',
    obrigatorio BOOLEAN NOT NULL DEFAULT true,
    criticidade VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    exige_foto BOOLEAN NOT NULL DEFAULT false,
    exige_foto_nao_conforme BOOLEAN NOT NULL DEFAULT false,
    exige_observacao_nao_conforme BOOLEAN NOT NULL DEFAULT true,
    gera_os_automatica BOOLEAN NOT NULL DEFAULT false,
    valor_minimo NUMERIC(12,2),
    valor_maximo NUMERIC(12,2),
    opcoes_resposta JSONB,
    ordem INT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE checklist_item_modelo (
    id_checklist_item_modelo BIGSERIAL PRIMARY KEY,
    id_checklist_grupo BIGINT NOT NULL REFERENCES checklist_grupo(id_checklist_grupo),
    id_modelo_equipamento BIGINT NOT NULL REFERENCES modelo_equipamento(id_modelo_equipamento),
    UNIQUE(id_checklist_grupo, id_modelo_equipamento)
);

CREATE TABLE checklist_execucao (
    id_checklist_execucao BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_checklist_grupo BIGINT NOT NULL REFERENCES checklist_grupo(id_checklist_grupo),
    id_equipamento BIGINT NOT NULL REFERENCES equipamento(id_equipamento),
    id_operador BIGINT NOT NULL REFERENCES operador(id_operador),
    id_turno BIGINT REFERENCES turno(id_turno),
    status VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',
    horimetro_momento NUMERIC(12,2),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    observacao_geral TEXT,
    total_itens INT DEFAULT 0,
    total_conforme INT DEFAULT 0,
    total_nao_conforme INT DEFAULT 0,
    dt_inicio TIMESTAMP NOT NULL,
    dt_fim TIMESTAMP,
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE checklist_execucao_item (
    id_checklist_execucao_item BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_checklist_execucao BIGINT NOT NULL REFERENCES checklist_execucao(id_checklist_execucao),
    id_checklist_item BIGINT NOT NULL REFERENCES checklist_item(id_checklist_item),
    resposta VARCHAR(50),
    valor_numerico NUMERIC(12,2),
    observacao TEXT,
    dt_resposta TIMESTAMP NOT NULL
);

CREATE TABLE checklist_execucao_foto (
    id_checklist_execucao_foto BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT NOT NULL REFERENCES tenant(id_tenant),
    id_checklist_execucao_item BIGINT NOT NULL REFERENCES checklist_execucao_item(id_checklist_execucao_item),
    url_foto TEXT NOT NULL,
    legenda VARCHAR(255),
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- ============================================================================
-- i18n
-- ============================================================================

CREATE TABLE traducao (
    id_traducao BIGSERIAL PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    id_registro BIGINT NOT NULL,
    campo VARCHAR(100) NOT NULL,
    idioma VARCHAR(5) NOT NULL,
    valor TEXT NOT NULL,
    UNIQUE(tabela, id_registro, campo, idioma)
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_log (
    id_audit_log BIGSERIAL PRIMARY KEY,
    id_tenant BIGINT,
    id_usuario BIGINT,
    tabela VARCHAR(100) NOT NULL,
    id_registro BIGINT NOT NULL,
    acao VARCHAR(10) NOT NULL,  -- 'INSERT','UPDATE','DELETE'
    dados_antes JSONB,
    dados_depois JSONB,
    ip VARCHAR(45),
    dt_registro TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- ============================================================================
-- ÍNDICES PRINCIPAIS
-- ============================================================================

CREATE INDEX idx_usuario_tenant ON usuario (id_tenant) WHERE dt_deletado IS NULL;
CREATE INDEX idx_equipamento_tenant ON equipamento (id_tenant, status) WHERE dt_deletado IS NULL;
CREATE INDEX idx_equipamento_modelo ON equipamento (id_tenant, id_modelo_equipamento);
CREATE INDEX idx_equipamento_contratada ON equipamento (id_tenant, id_contratada);
CREATE INDEX idx_operador_tenant ON operador (id_tenant) WHERE dt_deletado IS NULL;
CREATE INDEX idx_area_tenant_tipo ON area (id_tenant, id_area_tipo) WHERE ativo = true;
CREATE INDEX idx_checklist_exec_tenant ON checklist_execucao (id_tenant, dt_inicio DESC);
CREATE INDEX idx_audit_log_tenant ON audit_log (id_tenant, dt_registro DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (exemplo para tabela equipamento)
-- ============================================================================

ALTER TABLE equipamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_policy ON equipamento
    USING (id_tenant = current_setting('app.current_tenant')::bigint);

-- Repetir para todas as tabelas com id_tenant...
-- (script de RLS completo seria gerado automaticamente via migration)

-- ============================================================================
-- FIM DO SCHEMA INICIAL
-- ============================================================================
