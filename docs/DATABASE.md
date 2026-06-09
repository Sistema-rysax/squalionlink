# 📊 Modelagem de Dados

## Convenções

| Convenção | Padrão |
|-----------|--------|
| Nomes de tabela | snake_case, singular |
| Primary Key | `id_<tabela>` BIGSERIAL |
| Foreign Key | `id_<tabela_referenciada>` BIGINT |
| Datas | `dt_*` TIMESTAMP WITHOUT TIME ZONE (UTC) |
| Soft Delete | `dt_deletado TIMESTAMP` |
| Audit | `dt_registro`, `dt_alteracao` em toda tabela |
| Booleano | `BOOLEAN NOT NULL DEFAULT true/false` |
| Multi-tenant | `id_tenant BIGINT NOT NULL` em toda tabela de negócio |
| Valores monetários | `NUMERIC(12,2)` |
| Coordenadas | `NUMERIC(10,7)` |

## Diagrama de Domínios

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLATAFORMA                               │
│  tenant ─── tenant_plano ─── plano ─── plano_funcionalidade     │
│    │                                          │                 │
│    │         usuario ─── usuario_perfil ─── perfil              │
│    │                                      │                     │
│    │                          perfil_funcionalidade              │
│    │                                      │                     │
│    │                              funcionalidade                 │
└────┼────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────┐
│                          FROTA                                  │
│  contratada ←── equipamento ──→ modelo_equipamento              │
│                     │                  │        │               │
│                     │           fabricante   grupo_equipamento   │
│                     │                  │                         │
│                     │         modelo_combustivel ──→ combustivel │
│                     │                                           │
│              equipamento_componente                              │
└────┬────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────┐
│                        CHECKLIST                                 │
│  checklist_grupo ──→ checklist_item                              │
│       │                    │                                    │
│       │           checklist_item_modelo ──→ modelo_equipamento   │
│       │                                                         │
│  checklist_execucao ──→ checklist_execucao_item                  │
│                                │                                │
│                       checklist_execucao_foto                    │
└─────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────┐
│                       MANUTENÇÃO                                │
│  plano_manutencao ──→ plano_manutencao_gatilho                  │
│       │           ──→ plano_manutencao_item                     │
│       │           ──→ plano_manutencao_modelo                   │
│       │                                                         │
│  programacao_manutencao ──→ ordem_servico                       │
│  solicitacao_manutencao ──→ ordem_servico                       │
│                                  │                              │
│                          ordem_servico_item                      │
│                          ordem_servico_peca                      │
│                          ordem_servico_mao_obra                  │
│                          ordem_servico_anexo                     │
└─────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────┐
│                       OPERAÇÃO                                  │
│  area ──→ subarea        operador ──→ operador_habilitacao      │
│    │                        │     ──→ operador_documento        │
│  area_tipo                turno                                 │
│    │                                                            │
│  rota (area_origem → area_destino)                              │
│                                                                 │
│  gps_posicao (partitioned)                                      │
│  evento_operacional                                             │
│  horimetro_leitura                                              │
│  abastecimento                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tabelas por Domínio

### Plataforma (8 tabelas)
- `tenant`
- `plano`
- `funcionalidade`
- `plano_funcionalidade`
- `tenant_plano`
- `perfil`
- `perfil_funcionalidade`
- `usuario`
- `usuario_perfil`

### Contratada (2 tabelas)
- `contratada`
- `contrato_contratada`

### Frota (7 tabelas)
- `fabricante`
- `combustivel`
- `grupo_equipamento`
- `modelo_equipamento`
- `modelo_combustivel`
- `equipamento`
- `equipamento_componente`

### Checklist (6 tabelas)
- `checklist_grupo`
- `checklist_item`
- `checklist_item_modelo`
- `checklist_execucao`
- `checklist_execucao_item`
- `checklist_execucao_foto`

### Área & Geo (4 tabelas)
- `area_tipo`
- `area`
- `subarea`
- `rota`

### Operador (4 tabelas)
- `operador`
- `operador_habilitacao`
- `operador_documento`
- `turno`

### Manutenção Preventiva (5 tabelas)
- `plano_manutencao`
- `plano_manutencao_modelo`
- `plano_manutencao_gatilho`
- `plano_manutencao_item`
- `programacao_manutencao`

### Manutenção Corretiva (4 tabelas)
- `sistema_componente`
- `sintoma`
- `causa_falha`
- `solicitacao_manutencao`

### Ordem de Serviço (5 tabelas)
- `ordem_servico`
- `ordem_servico_item`
- `ordem_servico_peca`
- `ordem_servico_mao_obra`
- `ordem_servico_anexo`

### Telemetria & GPS (4 tabelas)
- `gps_posicao` (partitioned)
- `evento_operacional`
- `horimetro_leitura`
- `abastecimento`

### Almoxarifado (3 tabelas)
- `peca`
- `peca_estoque`
- `peca_movimentacao`

### Alertas (1 tabela)
- `alerta`

### i18n (1 tabela)
- `traducao`

### Auditoria (1 tabela)
- `audit_log`

**TOTAL: ~55 tabelas**


---

## Adições Recentes (ver HARDWARE-TURNO-MODELO.md para detalhes)

### Hardware (3 tabelas)
- `tipo_hardware`
- `hardware`
- `hardware_historico`

### Modelo Enriquecido (3 tabelas novas)
- `checklist_grupo_modelo` (substitui checklist_item_modelo)
- `modelo_fator_enchimento`
- `modelo_compatibilidade`

### Regime de Turno (3 tabelas)
- `regime_turno`
- `regime_turno_calendario`
- `equipamento_regime_turno`

**TOTAL ATUALIZADO: ~85 tabelas**


### Planejamento — Apropriação (3 tabelas)
- `centro_custo`
- `apropriacao_rota`
- `apropriacao_rota_modelo`

### Controle — Fechamento de Período (4 tabelas)
- `tipo_fechamento`
- `fechamento_periodo`
- `fechamento_historico`
- `fechamento_edicao`

**TOTAL ATUALIZADO: ~92 tabelas**


### Mobile & Sync (5 tabelas)
- `dispositivo_mobile`
- `dispositivo_escopo`
- `sync_entidade_versao`
- `sync_sessao`
- `sync_fila_upload`

**TOTAL ATUALIZADO: ~97 tabelas**

### Qualidade (4 tabelas)
- `elemento_qualidade`
- `faixa_granulometrica`
- `subarea_qualidade`
- `subarea_granulometria`

### Importacao (2 tabelas)
- `importacao`
- `importacao_linha`

### Pilha / Estoque (4 tabelas)
- `pilha_estoque`
- `pilha_qualidade_atual`
- `pilha_movimentacao`
- `pilha_qualidade_historico` (partitioned)

**TOTAL ATUALIZADO: ~107 tabelas**

### Abastecimento (3 tabelas)
- `posto_abastecimento`
- `abastecimento`
- `config_alerta_tanque`

### Mensageria (4 tabelas)
- `mensagem_operacional`
- `mensagem_template`
- `mensagem_conversa`
- `mensagem_resposta_rapida`

**TOTAL ATUALIZADO: ~114 tabelas**

### Permissoes (3 tabelas - funcionalidade reestruturada)
- `modulo`
- `funcionalidade_grupo`
- `perfil_permissao` (substitui perfil_funcionalidade)

### Autenticacao (4 tabelas)
- `usuario_credencial`
- `usuario_mfa`
- `auth_sessao`
- `auth_log`
- `auth_config`

### Email (3 tabelas)
- `email_template`
- `email_fila`
- `email_config`

### SSO (2 tabelas)
- `sso_provedor`
- `usuario_sso`

**TOTAL ATUALIZADO: ~127 tabelas**

### Revisão/Auditoria (5 tabelas novas)
- `combustivel`
- `notificacao`
- `notificacao_preferencia`
- `audit_trail`
- `arquivo`

**TOTAL FINAL REVISADO: ~132 tabelas**
