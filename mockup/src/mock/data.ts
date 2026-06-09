// ═══ MOCK DATA ═══

export const equipamentos = [
  { id: 1, codigo: 'CAT-01', modelo: 'Caterpillar 777G', grupo: 'Caminhão', contratada: 'Mineradora ABC', status: 'OPERANDO', lat: -20.1234, lng: -43.9876, vel: 42, atividade: 'Transporte Cheio', operador: 'João Silva', matricula: 'OP-001', horimetro: 12450.3, odometro: 84230, tanque: 78, turno: 'A', cor: '#22c55e' },
  { id: 2, codigo: 'CAT-02', modelo: 'Caterpillar 777G', grupo: 'Caminhão', contratada: 'Mineradora ABC', status: 'PARADO', lat: -20.1256, lng: -43.9845, vel: 0, atividade: 'Fila de Carga', operador: 'Carlos Santos', matricula: 'OP-002', horimetro: 11230.1, odometro: 72100, tanque: 55, turno: 'A', cor: '#eab308' },
  { id: 3, codigo: 'CAT-03', modelo: 'Caterpillar 777G', grupo: 'Caminhão', contratada: 'TransLog Ltda', status: 'MANUTENCAO', lat: -20.1190, lng: -43.9900, vel: 0, atividade: 'Manutenção Corretiva', operador: null, matricula: null, horimetro: 15800.7, odometro: 95400, tanque: 22, turno: null, cor: '#ef4444' },
  { id: 4, codigo: 'CAT-04', modelo: 'Caterpillar 777G', grupo: 'Caminhão', contratada: 'Mineradora ABC', status: 'OPERANDO', lat: -20.1278, lng: -43.9812, vel: 38, atividade: 'Transporte Vazio', operador: 'Pedro Costa', matricula: 'OP-003', horimetro: 9870.5, odometro: 61200, tanque: 92, turno: 'A', cor: '#22c55e' },
  { id: 5, codigo: 'CAT-05', modelo: 'Caterpillar 777G', grupo: 'Caminhão', contratada: 'TransLog Ltda', status: 'OPERANDO', lat: -20.1210, lng: -43.9780, vel: 15, atividade: 'Manobra', operador: 'Roberto Lima', matricula: 'OP-004', horimetro: 8200.9, odometro: 52800, tanque: 15, turno: 'A', cor: '#f97316' },
  { id: 6, codigo: 'ESC-01', modelo: 'Komatsu PC5500', grupo: 'Escavadeira', contratada: 'Mineradora ABC', status: 'OPERANDO', lat: -20.1240, lng: -43.9860, vel: 0, atividade: 'Carregamento', operador: 'Maria Souza', matricula: 'OP-005', horimetro: 18200.4, odometro: 0, tanque: 68, turno: 'A', cor: '#22c55e' },
  { id: 7, codigo: 'ESC-02', modelo: 'CAT 6060', grupo: 'Escavadeira', contratada: 'Mineradora ABC', status: 'PARADO', lat: -20.1300, lng: -43.9830, vel: 0, atividade: 'Aguardando Caminhão', operador: 'Ana Oliveira', matricula: 'OP-006', horimetro: 14500.2, odometro: 0, tanque: 45, turno: 'A', cor: '#eab308' },
  { id: 8, codigo: 'MOT-01', modelo: 'CAT 16M', grupo: 'Motoniveladora', contratada: 'TransLog Ltda', status: 'OPERANDO', lat: -20.1180, lng: -43.9920, vel: 8, atividade: 'Regularização', operador: 'Fernando Dias', matricula: 'OP-007', horimetro: 6300.8, odometro: 12400, tanque: 60, turno: 'A', cor: '#22c55e' },
  { id: 9, codigo: 'TRA-01', modelo: 'CAT D10T', grupo: 'Trator Esteira', contratada: 'Mineradora ABC', status: 'SEM_OPERADOR', lat: -20.1260, lng: -43.9790, vel: 0, atividade: null, operador: null, matricula: null, horimetro: 20100.1, odometro: 0, tanque: 80, turno: null, cor: '#6b7280' },
  { id: 10, codigo: 'PER-01', modelo: 'Atlas Copco D65', grupo: 'Perfuratriz', contratada: 'Mineradora ABC', status: 'OPERANDO', lat: -20.1315, lng: -43.9870, vel: 0, atividade: 'Perfuração', operador: 'Lucas Ferreira', matricula: 'OP-008', horimetro: 4500.6, odometro: 0, tanque: 72, turno: 'A', cor: '#22c55e' },
];

export const operadores = [
  { id: 1, nome: 'João Silva', matricula: 'OP-001', cpf: '123.456.789-00', contratada: 'Mineradora ABC', cargo: 'Operador de Caminhão', status: 'ATIVO', habilitacoes: ['CAT 777G', 'CAT 785D'] },
  { id: 2, nome: 'Carlos Santos', matricula: 'OP-002', cpf: '234.567.890-11', contratada: 'Mineradora ABC', cargo: 'Operador de Caminhão', status: 'ATIVO', habilitacoes: ['CAT 777G'] },
  { id: 3, nome: 'Pedro Costa', matricula: 'OP-003', cpf: '345.678.901-22', contratada: 'Mineradora ABC', cargo: 'Operador de Caminhão', status: 'ATIVO', habilitacoes: ['CAT 777G', 'CAT 785D'] },
  { id: 4, nome: 'Roberto Lima', matricula: 'OP-004', cpf: '456.789.012-33', contratada: 'TransLog Ltda', cargo: 'Operador de Caminhão', status: 'ATIVO', habilitacoes: ['CAT 777G'] },
  { id: 5, nome: 'Maria Souza', matricula: 'OP-005', cpf: '567.890.123-44', contratada: 'Mineradora ABC', cargo: 'Operador de Escavadeira', status: 'ATIVO', habilitacoes: ['Komatsu PC5500', 'CAT 6060'] },
  { id: 6, nome: 'Ana Oliveira', matricula: 'OP-006', cpf: '678.901.234-55', contratada: 'Mineradora ABC', cargo: 'Operador de Escavadeira', status: 'ATIVO', habilitacoes: ['CAT 6060'] },
  { id: 7, nome: 'Fernando Dias', matricula: 'OP-007', cpf: '789.012.345-66', contratada: 'TransLog Ltda', cargo: 'Operador de Apoio', status: 'ATIVO', habilitacoes: ['CAT 16M', 'CAT 14M'] },
  { id: 8, nome: 'Lucas Ferreira', matricula: 'OP-008', cpf: '890.123.456-77', contratada: 'Mineradora ABC', cargo: 'Operador de Perfuratriz', status: 'ATIVO', habilitacoes: ['Atlas Copco D65'] },
];

export const atividades = [
  { id: 1, nome: 'Transporte Cheio', codigo: 'TC', classificacao: 'PRODUTIVA', cor: '#22c55e' },
  { id: 2, nome: 'Transporte Vazio', codigo: 'TV', classificacao: 'PRODUTIVA', cor: '#86efac' },
  { id: 3, nome: 'Carregamento', codigo: 'CG', classificacao: 'PRODUTIVA', cor: '#3b82f6' },
  { id: 4, nome: 'Fila de Carga', codigo: 'FC', classificacao: 'IMPRODUTIVA', cor: '#eab308' },
  { id: 5, nome: 'Fila de Descarga', codigo: 'FD', classificacao: 'IMPRODUTIVA', cor: '#f59e0b' },
  { id: 6, nome: 'Manobra', codigo: 'MN', classificacao: 'IMPRODUTIVA', cor: '#f97316' },
  { id: 7, nome: 'Manutenção Corretiva', codigo: 'MC', classificacao: 'MANUTENCAO', cor: '#ef4444' },
  { id: 8, nome: 'Manutenção Preventiva', codigo: 'MP', classificacao: 'MANUTENCAO', cor: '#dc2626' },
  { id: 9, nome: 'Abastecimento', codigo: 'AB', classificacao: 'IMPRODUTIVA', cor: '#a855f7' },
  { id: 10, nome: 'Regularização', codigo: 'RG', classificacao: 'PRODUTIVA', cor: '#06b6d4' },
  { id: 11, nome: 'Perfuração', codigo: 'PF', classificacao: 'PRODUTIVA', cor: '#14b8a6' },
  { id: 12, nome: 'Aguardando Caminhão', codigo: 'AC', classificacao: 'IMPRODUTIVA', cor: '#6b7280' },
];

export const alertas = [
  { id: 1, tipo: 'EXCESSO_VELOCIDADE', equipamento: 'CAT-01', operador: 'João Silva', descricao: '68 km/h (limite: 60 km/h) — Curva Britador', severidade: 'WARNING', dt: '2024-06-09T14:32:00', tratado: false },
  { id: 2, tipo: 'TANQUE_BAIXO', equipamento: 'CAT-05', operador: 'Roberto Lima', descricao: 'Nível tanque 15% — Autonomia ~0.9h', severidade: 'CRITICAL', dt: '2024-06-09T09:15:00', tratado: false },
  { id: 3, tipo: 'CHECKLIST_NC', equipamento: 'CAT-03', operador: 'Paulo Mendes', descricao: '3 itens não conformes no pré-operação', severidade: 'WARNING', dt: '2024-06-09T06:20:00', tratado: true },
  { id: 4, tipo: 'DEVICE_OFFLINE', equipamento: 'TRA-01', operador: null, descricao: 'GPS offline há 45 minutos', severidade: 'INFO', dt: '2024-06-09T08:45:00', tratado: false },
  { id: 5, tipo: 'PARADA_LONGA', equipamento: 'CAT-02', operador: 'Carlos Santos', descricao: 'Parado há 25 min em Fila de Carga (limite: 20 min)', severidade: 'WARNING', dt: '2024-06-09T09:30:00', tratado: false },
];

export const ciclos = [
  { id: 1, equip: 'CAT-01', operador: 'João Silva', origem: 'Frente Norte B3', destino: 'Britador', material: 'ROM', carga: 92, duracao: 24, fila_carga: 3, carga_tempo: 4, viagem_cheio: 8, descarga: 2, viagem_vazio: 7, dt: '2024-06-09T09:12:00' },
  { id: 2, equip: 'CAT-04', operador: 'Pedro Costa', origem: 'Frente Norte B3', destino: 'Pilha Estéril', material: 'Estéril', carga: 88, duracao: 22, fila_carga: 2, carga_tempo: 4, viagem_cheio: 7, descarga: 2, viagem_vazio: 7, dt: '2024-06-09T09:05:00' },
  { id: 3, equip: 'CAT-01', operador: 'João Silva', origem: 'Frente Sul A1', destino: 'Britador', material: 'ROM', carga: 95, duracao: 28, fila_carga: 5, carga_tempo: 5, viagem_cheio: 9, descarga: 2, viagem_vazio: 7, dt: '2024-06-09T08:44:00' },
  { id: 4, equip: 'CAT-02', operador: 'Carlos Santos', origem: 'Frente Norte B3', destino: 'Britador', material: 'ROM', carga: 90, duracao: 26, fila_carga: 6, carga_tempo: 4, viagem_cheio: 8, descarga: 2, viagem_vazio: 6, dt: '2024-06-09T08:30:00' },
  { id: 5, equip: 'CAT-05', operador: 'Roberto Lima', origem: 'Frente Sul A1', destino: 'Pilha Estéril', material: 'Estéril', carga: 85, duracao: 20, fila_carga: 1, carga_tempo: 4, viagem_cheio: 7, descarga: 2, viagem_vazio: 6, dt: '2024-06-09T08:20:00' },
];

export const abastecimentos = [
  { id: 1, equip: 'CAT-04', litros: 620, operador: 'Pedro Costa', posto: 'Central', combustivel: 'Diesel S10', dt: '2024-06-09T08:45:00', horimetro: 9860 },
  { id: 2, equip: 'CAT-01', litros: 580, operador: 'João Silva', posto: 'Central', combustivel: 'Diesel S10', dt: '2024-06-09T07:30:00', horimetro: 12440 },
  { id: 3, equip: 'ESC-01', litros: 1200, operador: 'Maria Souza', posto: 'Comboio 01', combustivel: 'Diesel S10', dt: '2024-06-09T06:10:00', horimetro: 18180 },
  { id: 4, equip: 'CAT-02', litros: 610, operador: 'Carlos Santos', posto: 'Central', combustivel: 'Diesel S10', dt: '2024-06-08T22:15:00', horimetro: 11210 },
  { id: 5, equip: 'MOT-01', litros: 280, operador: 'Fernando Dias', posto: 'Comboio 01', combustivel: 'Diesel S10', dt: '2024-06-08T20:00:00', horimetro: 6280 },
];

export const mensagens = [
  { id: 1, equip: 'CAT-01', operador: 'João Silva', direcao: 'SALA_EQUIP', conteudo: 'Dirija-se para Frente Norte. Troque rota.', prioridade: 'NORMAL', status: 'LIDO', dt: '2024-06-09T08:30:00' },
  { id: 2, equip: 'CAT-01', operador: 'João Silva', direcao: 'EQUIP_SALA', conteudo: 'Entendido, indo pra lá.', prioridade: 'NORMAL', status: 'LIDO', dt: '2024-06-09T08:31:00' },
  { id: 3, equip: 'CAT-02', operador: 'Carlos Santos', direcao: 'EQUIP_SALA', conteudo: 'Preciso de mecânico, barulho estranho no motor.', prioridade: 'URGENTE', status: 'LIDO', dt: '2024-06-09T08:45:00' },
  { id: 4, equip: 'CAT-05', operador: 'Roberto Lima', direcao: 'SALA_EQUIP', conteudo: 'Área Britador interditada. NÃO se aproxime. Aguarde instrução.', prioridade: 'EMERGENCIA', status: 'ENVIADO', dt: '2024-06-09T09:45:00' },
  { id: 5, equip: 'ESC-01', operador: 'Maria Souza', direcao: 'EQUIP_SALA', conteudo: 'Checklist feito, tudo conforme.', prioridade: 'NORMAL', status: 'LIDO', dt: '2024-06-09T06:20:00' },
];

export const kpis = {
  df: 82.4,
  uf: 71.2,
  producaoTurno: 14820,
  metaTurno: 18000,
  ciclosHora: 4.2,
  metaCiclosHora: 5.0,
  equipOperando: 7,
  equipParado: 2,
  equipManutencao: 1,
  equipTotal: 10,
  alertasAbertos: 4,
  velocidadeMedia: 35.6,
};

export const areas = [
  { id: 1, nome: 'Frente Norte', tipo: 'FRENTE_LAVRA', cor: '#22c55e' },
  { id: 2, nome: 'Frente Sul', tipo: 'FRENTE_LAVRA', cor: '#3b82f6' },
  { id: 3, nome: 'Britador', tipo: 'BRITADOR', cor: '#f97316' },
  { id: 4, nome: 'Pilha ROM', tipo: 'PILHA', cor: '#eab308' },
  { id: 5, nome: 'Pilha Estéril', tipo: 'PILHA', cor: '#6b7280' },
  { id: 6, nome: 'Rota Principal', tipo: 'ROTA', cor: '#8b5cf6' },
  { id: 7, nome: 'Oficina Central', tipo: 'APOIO', cor: '#ef4444' },
  { id: 8, nome: 'Posto Combustível', tipo: 'APOIO', cor: '#a855f7' },
];

export const ordensServico = [
  { id: 1, numero: 'OS-2024-0342', equip: 'CAT-03', tipo: 'CORRETIVA', prioridade: 'ALTA', status: 'EM_ANDAMENTO', descricao: 'Vazamento no sistema hidráulico', dt_abertura: '2024-06-09T06:00:00' },
  { id: 2, numero: 'OS-2024-0341', equip: 'CAT-02', tipo: 'PREVENTIVA', prioridade: 'MEDIA', status: 'PROGRAMADA', descricao: 'Troca de filtros 500h', dt_abertura: '2024-06-08T14:00:00' },
  { id: 3, numero: 'OS-2024-0340', equip: 'ESC-02', tipo: 'CORRETIVA', prioridade: 'BAIXA', status: 'CONCLUIDA', descricao: 'Substituição sensor de temperatura', dt_abertura: '2024-06-07T10:00:00' },
];

export const modulos = [
  { id: 'dashboard', nome: 'Dashboard', icone: 'LayoutDashboard' },
  { id: 'mapa', nome: 'Mapa', icone: 'Map' },
  { id: 'frota', nome: 'Frota', icone: 'Truck' },
  { id: 'operacao', nome: 'Operação', icone: 'Activity' },
  { id: 'manutencao', nome: 'Manutenção', icone: 'Wrench' },
  { id: 'abastecimento', nome: 'Abastecimento', icone: 'Fuel' },
  { id: 'qualidade', nome: 'Qualidade', icone: 'FlaskConical' },
  { id: 'checklist', nome: 'Checklist', icone: 'ClipboardCheck' },
  { id: 'relatorios', nome: 'Relatórios', icone: 'BarChart3' },
  { id: 'admin', nome: 'Admin', icone: 'Settings' },
];
