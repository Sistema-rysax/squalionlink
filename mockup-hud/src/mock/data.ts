export const equipamentos = [
  { id:1, codigo:'CAT-01', modelo:'777G', grupo:'Caminhão', status:'OPERANDO', operador:'João Silva', atividade:'Transporte Cheio', vel:42, horimetro:12450, tanque:68, lat:-20.123, lng:-43.987, cor:'#22c55e' },
  { id:2, codigo:'CAT-02', modelo:'777G', grupo:'Caminhão', status:'PARADO', operador:'Carlos Santos', atividade:'Fila de Carga', vel:0, horimetro:11200, tanque:55, lat:-20.125, lng:-43.985, cor:'#f59e0b' },
  { id:3, codigo:'CAT-03', modelo:'777G', grupo:'Caminhão', status:'MANUTENCAO', operador:null, atividade:null, vel:0, horimetro:13800, tanque:30, lat:-20.119, lng:-43.991, cor:'#ef4444' },
  { id:4, codigo:'CAT-04', modelo:'785D', grupo:'Caminhão', status:'OPERANDO', operador:'Pedro Costa', atividade:'Transporte Vazio', vel:38, horimetro:9800, tanque:72, lat:-20.127, lng:-43.983, cor:'#22c55e' },
  { id:5, codigo:'CAT-05', modelo:'785D', grupo:'Caminhão', status:'OPERANDO', operador:'Roberto Lima', atividade:'Manobra', vel:15, horimetro:10500, tanque:45, lat:-20.121, lng:-43.989, cor:'#22c55e' },
  { id:6, codigo:'ESC-01', modelo:'PC5500', grupo:'Escavadeira', status:'OPERANDO', operador:'Ana Souza', atividade:'Carregamento', vel:0, horimetro:8900, tanque:82, lat:-20.124, lng:-43.986, cor:'#22c55e' },
  { id:7, codigo:'ESC-02', modelo:'CAT 6060', grupo:'Escavadeira', status:'OPERANDO', operador:'Marcos Lima', atividade:'Carregamento', vel:0, horimetro:7600, tanque:91, lat:-20.128, lng:-43.982, cor:'#22c55e' },
  { id:8, codigo:'MOT-01', modelo:'CAT 16M', grupo:'Motoniveladora', status:'OPERANDO', operador:'José Santos', atividade:'Terrapleno', vel:8, horimetro:5400, tanque:60, lat:-20.126, lng:-43.984, cor:'#22c55e' },
  { id:9, codigo:'PER-01', modelo:'Atlas D65', grupo:'Perfuratriz', status:'PARADO', operador:'Luis Ferreira', atividade:'Aguardando', vel:0, horimetro:4200, tanque:88, lat:-20.122, lng:-43.988, cor:'#f59e0b' },
  { id:10, codigo:'TRT-01', modelo:'CAT D10T', grupo:'Trator', status:'OPERANDO', operador:'Felipe Oliveira', atividade:'Empurre', vel:5, horimetro:6100, tanque:56, lat:-20.130, lng:-43.980, cor:'#22c55e' },
]

export const producaoHora = [420, 1180, 1350, 1280, 1200, 1100, 980, 1350, 1200, 1050, 1300, 900]
export const dfHora = [78, 82, 85, 80, 84, 88, 86, 92, 85, 87, 90, 88]
export const horas = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']

export const alertas = [
  { id:1, tipo:'CRITICO', msg:'Temperatura motor alta — CAT-03', equip:'CAT-03', dt:'10:42', tratado:false },
  { id:2, tipo:'ALERTA', msg:'Tanque abaixo de 30% — CAT-03', equip:'CAT-03', dt:'10:38', tratado:false },
  { id:3, tipo:'ALERTA', msg:'Velocidade excedida — CAT-01 (52 km/h)', equip:'CAT-01', dt:'09:15', tratado:false },
  { id:4, tipo:'INFO', msg:'Checklist pendente — ESC-02', equip:'ESC-02', dt:'08:30', tratado:true },
]
