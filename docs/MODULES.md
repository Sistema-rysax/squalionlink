# 📦 Módulos do Sistema

## Visão Geral dos Módulos

| # | Módulo | Funcionalidade (código) | Descrição |
|---|--------|------------------------|-----------|
| 1 | Frota | FROTA_EQUIPAMENTO | Cadastro de equipamentos, modelos, grupos |
| 2 | Frota | FROTA_CONTRATADA | Gestão de contratadas/donas do equipamento |
| 3 | Checklist | CHECKLIST_CONFIG | Configuração de grupos e itens |
| 4 | Checklist | CHECKLIST_EXECUCAO | Preenchimento e consulta |
| 5 | Área | AREA_CADASTRO | Cadastro de áreas e geofences |
| 6 | Operador | OPERADOR_CADASTRO | Cadastro e habilitações |
| 7 | Manutenção | MANUTENCAO_PREVENTIVA | Planos, gatilhos, programação |
| 8 | Manutenção | MANUTENCAO_CORRETIVA | Solicitações e diagnóstico |
| 9 | Manutenção | MANUTENCAO_OS | Ordens de serviço |
| 10 | Telemetria | TELEMETRIA_GPS | Rastreamento em tempo real |
| 11 | Telemetria | TELEMETRIA_EVENTOS | Eventos operacionais |
| 12 | Almoxarifado | ALMOXARIFADO_PECAS | Gestão de peças e estoque |
| 13 | Operação | OPERACAO_ABASTECIMENTO | Registro de abastecimentos |
| 14 | Operação | OPERACAO_HORIMETRO | Leituras de horímetro |
| 15 | Dashboard | DASHBOARD_KPI | Indicadores (DF%, MTBF, MTTR) |
| 16 | Alertas | ALERTA_CONFIG | Configuração de alertas |
| 17 | Admin | ADMIN_USUARIOS | Gestão de usuários e perfis |
| 18 | Admin | ADMIN_PLANOS | Gestão de planos (super admin) |

## Planos Sugeridos

### 🥉 Basic
- FROTA_EQUIPAMENTO
- CHECKLIST_CONFIG
- CHECKLIST_EXECUCAO
- AREA_CADASTRO
- OPERADOR_CADASTRO
- ADMIN_USUARIOS

### 🥈 Professional
- Tudo do Basic +
- MANUTENCAO_PREVENTIVA
- MANUTENCAO_CORRETIVA
- MANUTENCAO_OS
- ALMOXARIFADO_PECAS
- OPERACAO_ABASTECIMENTO
- OPERACAO_HORIMETRO
- DASHBOARD_KPI
- ALERTA_CONFIG
- FROTA_CONTRATADA

### 🥇 Enterprise
- Tudo do Professional +
- TELEMETRIA_GPS
- TELEMETRIA_EVENTOS
- ADMIN_PLANOS
- API access
- Custom reports
- Multi-language

## Fluxo de Permissão

```
Usuário tenta acessar /maintenance/preventive
    │
    ▼
Middleware verifica: usuário tem perfil com MANUTENCAO_PREVENTIVA?
    │
    ▼
Middleware verifica: MANUTENCAO_PREVENTIVA está no plano do tenant?
    │
    ▼
✅ Permitido  │  ❌ 403 "Funcionalidade não disponível no seu plano"
```

## Fluxo de Manutenção Preventiva

```
1. Admin cadastra Plano de Manutenção
   - Define itens (o que fazer)
   - Define gatilhos (a cada 500h, 30 dias, etc.)
   - Associa a modelos de equipamento

2. Cron Job (diário) verifica:
   - Para cada equipamento com plano associado ao seu modelo:
     - Leitura atual de horímetro VS última preventiva + intervalo
     - Se atingiu: cria programacao_manutencao com status PROGRAMADA

3. Programação gera alerta:
   - Alerta tipo MANUTENCAO_VENCIDA se dt_prevista ultrapassou

4. Operador/Supervisor abre OS a partir da programação:
   - OS tipo PREVENTIVA
   - Itens da OS = itens do plano
   - Status: ABERTA → EXECUTANDO → CONCLUIDA

5. Ao concluir OS:
   - Atualiza horimetro do equipamento
   - Marca programacao como CONCLUIDA
   - Calcula próxima programação
```

## Fluxo de Manutenção Corretiva

```
1. Operador/Supervisor abre Solicitação de Manutenção
   - Informa equipamento, sintoma, se parou

2. Mecânico/Planejador analisa:
   - Define prioridade, componente afetado
   - Abre OS tipo CORRETIVA

3. OS segue fluxo:
   - ABERTA → AGUARDANDO_PECA → EXECUTANDO → CONCLUIDA
   - Registra peças, mão de obra, tempo de parada

4. Ao concluir:
   - Registra causa raiz
   - Alimenta histórico do equipamento
   - Calcula MTBF/MTTR
```
