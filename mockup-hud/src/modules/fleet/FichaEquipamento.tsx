import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/controls/FormFields'
import Drawer from '../../components/panels/Drawer'
import { toast } from '../../components/ui/Toast'
import { ArrowLeft, Save, Edit2, Plus, Trash2 } from 'lucide-react'

const tabs = ['Geral', 'Hardware', 'Componentes', 'Manutenção', 'Abastecimento', 'Rotograma']

// ---- MOCK DATA ----
const equipamentosMock: Record<number, any> = {
  1: { id:1, codigo:'CAT-01', numero_serie:'SN-777G-2019-0451', placa:'MNG-3A21', chassi:'9BW777G01L0034521', ano_fabricacao:'2019', modelo:'777G', contratada:'Mineradora ABC', horimetro_inicial:0, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'Equipamento principal frota transporte mina norte' },
  2: { id:2, codigo:'CAT-02', numero_serie:'SN-777G-2019-0452', placa:'MNG-3A22', chassi:'9BW777G01L0034522', ano_fabricacao:'2019', modelo:'777G', contratada:'Mineradora ABC', horimetro_inicial:120, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'' },
  3: { id:3, codigo:'CAT-03', numero_serie:'SN-777G-2020-0871', placa:'MNG-4B15', chassi:'9BW777G01M0048715', ano_fabricacao:'2020', modelo:'777G', contratada:'TransLog', horimetro_inicial:0, odometro_inicial:0, status:'INATIVO', foto_url:'', observacao:'Em manutenção corretiva' },
  4: { id:4, codigo:'CAT-04', numero_serie:'SN-785D-2021-1203', placa:'MNG-5C08', chassi:'9BW785D01N0012038', ano_fabricacao:'2021', modelo:'785D', contratada:'Mineradora ABC', horimetro_inicial:0, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'' },
  5: { id:5, codigo:'CAT-05', numero_serie:'SN-785D-2021-1204', placa:'MNG-5C09', chassi:'9BW785D01N0012049', ano_fabricacao:'2021', modelo:'785D', contratada:'TerraMovel', horimetro_inicial:80, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'Transferido mina sul' },
  6: { id:6, codigo:'ESC-01', numero_serie:'SN-PC5500-2018-0098', placa:'', chassi:'KMTPC55001J009812', ano_fabricacao:'2018', modelo:'PC5500', contratada:'Mineradora ABC', horimetro_inicial:0, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'Escavadeira principal' },
  7: { id:7, codigo:'ESC-02', numero_serie:'SN-6060-2020-0034', placa:'', chassi:'9BW606001M0003415', ano_fabricacao:'2020', modelo:'CAT 6060', contratada:'MineServ', horimetro_inicial:250, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'' },
  8: { id:8, codigo:'MOT-01', numero_serie:'SN-16M-2017-2210', placa:'MNG-1D44', chassi:'9BW016M01H0022104', ano_fabricacao:'2017', modelo:'CAT 16M', contratada:'TransLog', horimetro_inicial:0, odometro_inicial:15200, status:'ATIVO', foto_url:'', observacao:'' },
  9: { id:9, codigo:'PER-01', numero_serie:'SN-D65-2022-0012', placa:'', chassi:'ATLSD6501N0001234', ano_fabricacao:'2022', modelo:'Atlas D65', contratada:'BrasMina', horimetro_inicial:0, odometro_inicial:0, status:'FORA_FROTA', foto_url:'', observacao:'' },
  10: { id:10, codigo:'TRT-01', numero_serie:'SN-D10T-2019-0567', placa:'MNG-2E33', chassi:'9BWD10T01L0056723', ano_fabricacao:'2019', modelo:'CAT D10T', contratada:'Mineradora ABC', horimetro_inicial:0, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'' },
}

const hardwareMock: Record<number, any[]> = {
  1: [
    { id:1, sn:'HW-GPS-2024-001', tipo:'GPS', modelo:'Trimble SNM941', funcao:'Rastreamento', dt_instalacao:'2024-01-15', status:'ATIVO' },
    { id:2, sn:'HW-MOD-2024-012', tipo:'Modem 4G', modelo:'Sierra MC7455', funcao:'Comunicação', dt_instalacao:'2024-01-15', status:'ATIVO' },
    { id:3, sn:'HW-TAB-2024-045', tipo:'Tablet', modelo:'Samsung Tab Active3', funcao:'Interface Operador', dt_instalacao:'2024-02-10', status:'ATIVO' },
  ],
  2: [
    { id:4, sn:'HW-GPS-2024-002', tipo:'GPS', modelo:'Trimble SNM941', funcao:'Rastreamento', dt_instalacao:'2024-01-16', status:'ATIVO' },
    { id:5, sn:'HW-MOD-2024-013', tipo:'Modem 4G', modelo:'Sierra MC7455', funcao:'Comunicação', dt_instalacao:'2024-01-16', status:'ATIVO' },
  ],
  3: [
    { id:6, sn:'HW-GPS-2024-003', tipo:'GPS', modelo:'Trimble SNM941', funcao:'Rastreamento', dt_instalacao:'2023-11-20', status:'INATIVO' },
    { id:7, sn:'HW-MOD-2024-014', tipo:'Modem 4G', modelo:'Cradlepoint IBR900', funcao:'Comunicação', dt_instalacao:'2023-11-20', status:'INATIVO' },
    { id:8, sn:'HW-RAD-2024-005', tipo:'Radar', modelo:'Continental ARS408', funcao:'Anticolisão', dt_instalacao:'2024-03-01', status:'ATIVO' },
  ],
  4: [
    { id:9, sn:'HW-GPS-2024-004', tipo:'GPS', modelo:'Trimble SNM941', funcao:'Rastreamento', dt_instalacao:'2024-02-01', status:'ATIVO' },
    { id:10, sn:'HW-TAB-2024-046', tipo:'Tablet', modelo:'Samsung Tab Active3', funcao:'Interface Operador', dt_instalacao:'2024-02-01', status:'ATIVO' },
  ],
  5: [
    { id:11, sn:'HW-GPS-2024-005', tipo:'GPS', modelo:'Hexagon HxGN', funcao:'Rastreamento', dt_instalacao:'2024-03-10', status:'ATIVO' },
    { id:12, sn:'HW-MOD-2024-015', tipo:'Modem 4G', modelo:'Sierra MC7455', funcao:'Comunicação', dt_instalacao:'2024-03-10', status:'ATIVO' },
    { id:13, sn:'HW-CAM-2024-001', tipo:'Câmera', modelo:'Brigade BE-870', funcao:'Ré/Segurança', dt_instalacao:'2024-04-05', status:'ATIVO' },
  ],
}

const componentesMock: Record<number, any[]> = {
  1: [
    { id:1, nome:'Motor Diesel', tipo:'Motor', n_serie:'ENG-C27-2019-451', posicao:'Central', vida_util_h:15000, horas_atuais:12450 },
    { id:2, nome:'Pneu D.E.', tipo:'Pneu', n_serie:'PN-40R57-001', posicao:'Dianteiro Esquerdo', vida_util_h:6000, horas_atuais:4200 },
    { id:3, nome:'Pneu D.D.', tipo:'Pneu', n_serie:'PN-40R57-002', posicao:'Dianteiro Direito', vida_util_h:6000, horas_atuais:4200 },
    { id:4, nome:'Transmissão', tipo:'Transmissão', n_serie:'TX-777G-451', posicao:'Central', vida_util_h:20000, horas_atuais:12450 },
    { id:5, nome:'Cilindro Suspensão DE', tipo:'Suspensão', n_serie:'CS-OL-2020-019', posicao:'Dianteiro Esquerdo', vida_util_h:10000, horas_atuais:8100 },
  ],
  2: [
    { id:6, nome:'Motor Diesel', tipo:'Motor', n_serie:'ENG-C27-2019-452', posicao:'Central', vida_util_h:15000, horas_atuais:11200 },
    { id:7, nome:'Pneu D.E.', tipo:'Pneu', n_serie:'PN-40R57-003', posicao:'Dianteiro Esquerdo', vida_util_h:6000, horas_atuais:5800 },
    { id:8, nome:'Conversor Torque', tipo:'Transmissão', n_serie:'CT-777G-452', posicao:'Central', vida_util_h:18000, horas_atuais:11200 },
  ],
  4: [
    { id:9, nome:'Motor Diesel', tipo:'Motor', n_serie:'ENG-C32-2021-120', posicao:'Central', vida_util_h:18000, horas_atuais:9800 },
    { id:10, nome:'Pneu T.E.1', tipo:'Pneu', n_serie:'PN-46R57-010', posicao:'Traseiro Esq. Interno', vida_util_h:5500, horas_atuais:3200 },
    { id:11, nome:'Bomba Hidráulica', tipo:'Hidráulico', n_serie:'BH-785D-2021-01', posicao:'Lateral Esq.', vida_util_h:12000, horas_atuais:9800 },
  ],
  6: [
    { id:12, nome:'Motor Diesel', tipo:'Motor', n_serie:'ENG-SAA12V-018', posicao:'Traseiro', vida_util_h:20000, horas_atuais:8900 },
    { id:13, nome:'Esteira Esquerda', tipo:'Material Rodante', n_serie:'EST-PC55-E-098', posicao:'Esquerda', vida_util_h:8000, horas_atuais:6500 },
    { id:14, nome:'Cilindro Braço', tipo:'Hidráulico', n_serie:'CB-PC55-2018-01', posicao:'Braço Principal', vida_util_h:15000, horas_atuais:8900 },
  ],
}

const manutencaoMock: Record<number, any[]> = {
  1: [
    { id:1, os:'OS-2024-0451', tipo:'PREVENTIVA', descricao:'PM2 – Troca de óleo motor + filtros', data:'2024-05-28', status:'CONCLUIDA', responsavel:'Oficina Central' },
    { id:2, os:'OS-2024-0523', tipo:'CORRETIVA', descricao:'Reparo vazamento linha hidráulica direção', data:'2024-06-02', status:'CONCLUIDA', responsavel:'Eq. Hidráulica' },
    { id:3, os:'OS-2024-0610', tipo:'PREVENTIVA', descricao:'PM3 – Inspeção geral + troca filtro ar', data:'2024-06-20', status:'PROGRAMADA', responsavel:'Oficina Central' },
  ],
  2: [
    { id:4, os:'OS-2024-0398', tipo:'PREVENTIVA', descricao:'PM1 – Troca óleo motor', data:'2024-05-15', status:'CONCLUIDA', responsavel:'Oficina Central' },
    { id:5, os:'OS-2024-0560', tipo:'CORRETIVA', descricao:'Substituição sensor pressão turbo', data:'2024-06-05', status:'EM_ANDAMENTO', responsavel:'Eq. Elétrica' },
  ],
  4: [
    { id:6, os:'OS-2024-0445', tipo:'PREVENTIVA', descricao:'PM2 – Troca óleo + calibração freios', data:'2024-05-25', status:'CONCLUIDA', responsavel:'Oficina Central' },
    { id:7, os:'OS-2024-0601', tipo:'CORRETIVA', descricao:'Troca cilindro suspensão traseira', data:'2024-06-08', status:'EM_ANDAMENTO', responsavel:'Eq. Mecânica' },
    { id:8, os:'OS-2024-0650', tipo:'PREVENTIVA', descricao:'PM3 – Revisão completa', data:'2024-07-01', status:'PROGRAMADA', responsavel:'Oficina Central' },
  ],
}

const abastecimentoMock: Record<number, { registros: any[], consumo_medio: number }> = {
  1: { consumo_medio: 62.5, registros: [
    { id:1, data:'09/06/2024 06:15', litros:320, km_horimetro:'12.450h', operador:'João Silva', posto:'Posto Mina Norte', combustivel:'Diesel S10' },
    { id:2, data:'08/06/2024 18:30', litros:295, km_horimetro:'12.438h', operador:'Carlos Santos', posto:'Posto Mina Norte', combustivel:'Diesel S10' },
    { id:3, data:'08/06/2024 06:00', litros:310, km_horimetro:'12.425h', operador:'João Silva', posto:'Posto Central', combustivel:'Diesel S10' },
    { id:4, data:'07/06/2024 18:10', litros:280, km_horimetro:'12.413h', operador:'Pedro Costa', posto:'Posto Mina Norte', combustivel:'Diesel S10' },
    { id:5, data:'07/06/2024 06:20', litros:330, km_horimetro:'12.400h', operador:'João Silva', posto:'Posto Central', combustivel:'Diesel S10' },
  ]},
  2: { consumo_medio: 58.2, registros: [
    { id:6, data:'09/06/2024 05:50', litros:290, km_horimetro:'11.200h', operador:'Carlos Santos', posto:'Posto Mina Norte', combustivel:'Diesel S10' },
    { id:7, data:'08/06/2024 17:45', litros:275, km_horimetro:'11.188h', operador:'Ana Souza', posto:'Posto Central', combustivel:'Diesel S10' },
    { id:8, data:'08/06/2024 05:30', litros:305, km_horimetro:'11.176h', operador:'Carlos Santos', posto:'Posto Mina Norte', combustivel:'Diesel S10' },
    { id:9, data:'07/06/2024 18:00', litros:260, km_horimetro:'11.164h', operador:'Marcos Lima', posto:'Posto Central', combustivel:'Diesel S10' },
    { id:10, data:'07/06/2024 05:40', litros:298, km_horimetro:'11.151h', operador:'Carlos Santos', posto:'Posto Mina Norte', combustivel:'Diesel S10' },
  ]},
  4: { consumo_medio: 72.1, registros: [
    { id:11, data:'09/06/2024 06:30', litros:380, km_horimetro:'9.800h', operador:'Pedro Costa', posto:'Posto Central', combustivel:'Diesel S10' },
    { id:12, data:'08/06/2024 18:15', litros:355, km_horimetro:'9.787h', operador:'Roberto Lima', posto:'Posto Mina Norte', combustivel:'Diesel S10' },
    { id:13, data:'08/06/2024 06:10', litros:370, km_horimetro:'9.774h', operador:'Pedro Costa', posto:'Posto Central', combustivel:'Diesel S10' },
    { id:14, data:'07/06/2024 17:50', litros:340, km_horimetro:'9.761h', operador:'Felipe Oliveira', posto:'Posto Mina Norte', combustivel:'Diesel S10' },
    { id:15, data:'07/06/2024 06:00', litros:365, km_horimetro:'9.748h', operador:'Pedro Costa', posto:'Posto Central', combustivel:'Diesel S10' },
  ]},
}

const rotogramaMock: Record<number, any> = {
  1: { nome:'Rotograma Principal Mina Norte', cor:'#2563eb', trechos: [
    { id:1, nome:'Acesso Pit → Britador', vel_max_seco:40, vel_max_chuva:30, sentido:'IDA' },
    { id:2, nome:'Britador → Acesso Pit', vel_max_seco:45, vel_max_chuva:32, sentido:'VOLTA' },
    { id:3, nome:'Rampa Principal', vel_max_seco:25, vel_max_chuva:18, sentido:'AMBOS' },
    { id:4, nome:'Pista Plana Nível 2', vel_max_seco:50, vel_max_chuva:35, sentido:'AMBOS' },
  ]},
  2: { nome:'Rotograma Principal Mina Norte', cor:'#2563eb', trechos: [
    { id:1, nome:'Acesso Pit → Britador', vel_max_seco:40, vel_max_chuva:30, sentido:'IDA' },
    { id:2, nome:'Britador → Acesso Pit', vel_max_seco:45, vel_max_chuva:32, sentido:'VOLTA' },
    { id:3, nome:'Rampa Principal', vel_max_seco:25, vel_max_chuva:18, sentido:'AMBOS' },
  ]},
  4: { nome:'Rotograma Frota Pesada', cor:'#f59e0b', trechos: [
    { id:5, nome:'Pit Fundo → Rampa Sul', vel_max_seco:30, vel_max_chuva:22, sentido:'IDA' },
    { id:6, nome:'Rampa Sul → Pilha Estéril', vel_max_seco:35, vel_max_chuva:25, sentido:'IDA' },
    { id:7, nome:'Pilha Estéril → Pit Fundo', vel_max_seco:40, vel_max_chuva:28, sentido:'VOLTA' },
  ]},
  5: { nome:'Rotograma Frota Pesada', cor:'#f59e0b', trechos: [
    { id:5, nome:'Pit Fundo → Rampa Sul', vel_max_seco:30, vel_max_chuva:22, sentido:'IDA' },
    { id:6, nome:'Rampa Sul → Pilha Estéril', vel_max_seco:35, vel_max_chuva:25, sentido:'IDA' },
  ]},
  8: { nome:'Rotograma Apoio', cor:'#22c55e', trechos: [
    { id:8, nome:'Oficina → Frente Lavra', vel_max_seco:35, vel_max_chuva:25, sentido:'AMBOS' },
    { id:9, nome:'Perímetro Geral', vel_max_seco:30, vel_max_chuva:20, sentido:'AMBOS' },
  ]},
}

// Default fallbacks
const getEquip = (id: number) => equipamentosMock[id] || equipamentosMock[1]
const getHardware = (id: number) => hardwareMock[id] || hardwareMock[1] || []
const getComponentes = (id: number) => componentesMock[id] || componentesMock[1] || []
const getManutencao = (id: number) => manutencaoMock[id] || manutencaoMock[1] || []
const getAbastecimento = (id: number) => abastecimentoMock[id] || abastecimentoMock[1] || { registros: [], consumo_medio: 0 }
const getRotograma = (id: number) => rotogramaMock[id] || null

export default function FichaEquipamento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const numId = Number(id) || 1
  const equip = getEquip(numId)

  const [tab, setTab] = useState('Geral')
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ ...equip })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  // Hardware state
  const [hwData, setHwData] = useState(getHardware(numId))
  const [hwDrawerOpen, setHwDrawerOpen] = useState(false)
  const [hwForm, setHwForm] = useState({ sn: '', tipo: 'GPS', modelo: '', funcao: '' })

  // Componente state
  const [compData, setCompData] = useState(getComponentes(numId))
  const [compDrawerOpen, setCompDrawerOpen] = useState(false)
  const [compForm, setCompForm] = useState({ nome: '', tipo: 'Motor', n_serie: '', posicao: '', vida_util_h: '', horas_atuais: '' })

  const salvar = () => { setEditMode(false); toast('Equipamento atualizado') }

  const instalarHw = () => {
    if (!hwForm.sn || !hwForm.funcao) { toast('SN e Função obrigatórios', 'error'); return }
    setHwData(p => [...p, { id: Date.now(), ...hwForm, dt_instalacao: new Date().toISOString().slice(0, 10), status: 'ATIVO' }])
    setHwDrawerOpen(false)
    setHwForm({ sn: '', tipo: 'GPS', modelo: '', funcao: '' })
    toast('Hardware instalado')
  }

  const desinstalarHw = (hwId: number) => {
    setHwData(p => p.filter(h => h.id !== hwId))
    toast('Hardware desinstalado')
  }

  const addComponente = () => {
    if (!compForm.nome || !compForm.n_serie) { toast('Nome e N.Série obrigatórios', 'error'); return }
    setCompData(p => [...p, { id: Date.now(), ...compForm, vida_util_h: +compForm.vida_util_h || 10000, horas_atuais: +compForm.horas_atuais || 0 }])
    setCompDrawerOpen(false)
    setCompForm({ nome: '', tipo: 'Motor', n_serie: '', posicao: '', vida_util_h: '', horas_atuais: '' })
    toast('Componente adicionado')
  }

  const statusLed = equip.status === 'ATIVO' ? 'ok' : equip.status === 'INATIVO' ? 'warn' : 'crit'

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/frota')} className="p-2 rounded-lg hover:bg-white/5 text-dim transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-display text-lg tracking-wider text-gray-200 uppercase">{equip.codigo}</h1>
            <span className="text-[10px] font-mono text-dim">{equip.modelo} • {equip.numero_serie}</span>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <div className={`led led-${statusLed}`}></div>
            <span className="px-2 py-0.5 rounded text-[10px] border border-hud-border font-mono">{equip.status}</span>
          </div>
        </div>
        {tab === 'Geral' && (
          editMode
            ? <button onClick={salvar} className="flex items-center gap-1.5 px-4 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase tracking-wider hover:bg-brand-600/30 hover:shadow-glow-sm transition-all"><Save className="w-3.5 h-3.5" />Salvar</button>
            : <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-dim border border-hud-border rounded-md text-[10px] font-mono uppercase tracking-wider hover:text-gray-200 transition-all"><Edit2 className="w-3.5 h-3.5" />Editar</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-hud-border">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all ${tab === t ? 'border-brand-400 text-brand-400' : 'border-transparent text-dim hover:text-gray-300'}`}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* ========== TAB GERAL ========== */}
        {tab === 'Geral' && (
          <div className="space-y-6 max-w-3xl">
            <FormSection title="Identificação">
              <FormGrid>
                <Input label="Código" value={form.codigo} onChange={v => set('codigo', v)} disabled={!editMode} />
                <Input label="Nº Série" value={form.numero_serie} onChange={v => set('numero_serie', v)} disabled={!editMode} />
              </FormGrid>
              <FormGrid>
                <Input label="Placa" value={form.placa} onChange={v => set('placa', v)} disabled={!editMode} />
                <Input label="Chassi" value={form.chassi} onChange={v => set('chassi', v)} disabled={!editMode} />
              </FormGrid>
              <FormGrid>
                <Input label="Ano Fabricação" value={form.ano_fabricacao} onChange={v => set('ano_fabricacao', v)} disabled={!editMode} />
                <Input label="Modelo" value={form.modelo} onChange={v => set('modelo', v)} disabled={!editMode} />
              </FormGrid>
            </FormSection>
            <FormSection title="Vínculo">
              <FormGrid>
                <Input label="Contratada" value={form.contratada} onChange={v => set('contratada', v)} disabled={!editMode} />
                <Input label="Status" value={form.status} onChange={v => set('status', v)} disabled={!editMode} />
              </FormGrid>
            </FormSection>
            <FormSection title="Medidores">
              <FormGrid>
                <div className="bg-hud-bg border border-hud-border rounded-lg p-3 text-center">
                  <span className="text-[10px] text-dim font-mono block">HORÍMETRO INICIAL</span>
                  <span className="text-lg font-mono text-gray-200">{equip.horimetro_inicial.toLocaleString()}h</span>
                </div>
                <div className="bg-hud-bg border border-hud-border rounded-lg p-3 text-center">
                  <span className="text-[10px] text-dim font-mono block">ODÔMETRO INICIAL</span>
                  <span className="text-lg font-mono text-gray-200">{equip.odometro_inicial.toLocaleString()} km</span>
                </div>
              </FormGrid>
            </FormSection>
            {equip.observacao && (
              <FormSection title="Observações">
                <p className="text-sm text-gray-400 font-mono bg-hud-bg border border-hud-border rounded-lg p-3">{equip.observacao}</p>
              </FormSection>
            )}
          </div>
        )}

        {/* ========== TAB HARDWARE ========== */}
        {tab === 'Hardware' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Hardware Instalado</h3>
              <button onClick={() => setHwDrawerOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase hover:bg-brand-600/30 transition-all"><Plus className="w-3 h-3" />Instalar HW</button>
            </div>
            <div className="bg-hud-panel border border-hud-border rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-hud-border bg-black/20">
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">SN</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Tipo</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Modelo</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Função</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Dt.Instalação</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Status</th>
                    <th className="px-3 py-2 text-right font-mono text-dim uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {hwData.map(hw => (
                    <tr key={hw.id} className="border-b border-hud-border/50 hover:bg-white/[0.02]">
                      <td className="px-3 py-2 font-mono text-brand-400">{hw.sn}</td>
                      <td className="px-3 py-2 text-gray-300">{hw.tipo}</td>
                      <td className="px-3 py-2 text-gray-400 font-mono">{hw.modelo}</td>
                      <td className="px-3 py-2 text-gray-300">{hw.funcao}</td>
                      <td className="px-3 py-2 font-mono text-gray-400">{hw.dt_instalacao}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${hw.status === 'ATIVO' ? 'bg-ok/10 text-ok border-ok/20' : 'bg-crit/10 text-crit border-crit/20'}`}>{hw.status}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => desinstalarHw(hw.id)} className="px-2 py-1 text-[9px] font-mono uppercase text-crit border border-crit/30 rounded hover:bg-crit/10 transition-colors">Desinstalar</button>
                      </td>
                    </tr>
                  ))}
                  {hwData.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-dim text-xs">Nenhum hardware instalado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TAB COMPONENTES ========== */}
        {tab === 'Componentes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Componentes</h3>
              <button onClick={() => setCompDrawerOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase hover:bg-brand-600/30 transition-all"><Plus className="w-3 h-3" />Add Componente</button>
            </div>
            <div className="bg-hud-panel border border-hud-border rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-hud-border bg-black/20">
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Nome</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Tipo</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">N.Série</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Posição</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Vida Útil (h)</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Horas Atuais</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">%</th>
                  </tr>
                </thead>
                <tbody>
                  {compData.map(c => {
                    const pct = Math.min(100, Math.round((c.horas_atuais / c.vida_util_h) * 100))
                    const barColor = pct >= 90 ? 'bg-crit' : pct >= 70 ? 'bg-warn' : 'bg-ok'
                    return (
                      <tr key={c.id} className="border-b border-hud-border/50 hover:bg-white/[0.02]">
                        <td className="px-3 py-2 text-gray-200 font-medium">{c.nome}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px] border border-hud-border bg-white/5">{c.tipo}</span></td>
                        <td className="px-3 py-2 font-mono text-brand-400 text-[10px]">{c.n_serie}</td>
                        <td className="px-3 py-2 text-gray-400">{c.posicao}</td>
                        <td className="px-3 py-2 font-mono text-gray-400">{c.vida_util_h.toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono text-gray-300">{c.horas_atuais.toLocaleString()}</td>
                        <td className="px-3 py-3 min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-hud-bg rounded-full overflow-hidden border border-hud-border">
                              <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className={`text-[10px] font-mono ${pct >= 90 ? 'text-crit' : pct >= 70 ? 'text-warn' : 'text-ok'}`}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {compData.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-dim text-xs">Nenhum componente cadastrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TAB MANUTENÇÃO ========== */}
        {tab === 'Manutenção' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Ordens de Serviço Recentes</h3>
              <div className="bg-hud-bg border border-hud-border rounded-lg px-3 py-1.5">
                <span className="text-[9px] text-dim font-mono">PRÓX. PREVENTIVA: </span>
                <span className="text-[11px] text-warn font-mono font-bold">{getManutencao(numId).find(m => m.status === 'PROGRAMADA')?.data || '—'}</span>
              </div>
            </div>
            <div className="bg-hud-panel border border-hud-border rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-hud-border bg-black/20">
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">OS</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Tipo</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Descrição</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Data</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Responsável</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getManutencao(numId).map(m => (
                    <tr key={m.id} className="border-b border-hud-border/50 hover:bg-white/[0.02]">
                      <td className="px-3 py-2 font-mono text-brand-400">{m.os}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${m.tipo === 'PREVENTIVA' ? 'bg-ok/10 text-ok border-ok/20' : 'bg-warn/10 text-warn border-warn/20'}`}>{m.tipo}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-300">{m.descricao}</td>
                      <td className="px-3 py-2 font-mono text-gray-400">{m.data}</td>
                      <td className="px-3 py-2 text-gray-400">{m.responsavel}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${m.status === 'CONCLUIDA' ? 'bg-ok/10 text-ok border-ok/20' : m.status === 'EM_ANDAMENTO' ? 'bg-brand-600/10 text-brand-400 border-brand-600/20' : 'bg-white/5 text-dim border-hud-border'}`}>{m.status.replace('_', ' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TAB ABASTECIMENTO ========== */}
        {tab === 'Abastecimento' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Últimos Abastecimentos</h3>
              <div className="bg-hud-bg border border-hud-border rounded-lg px-3 py-1.5">
                <span className="text-[9px] text-dim font-mono">CONSUMO MÉDIO: </span>
                <span className="text-[11px] text-brand-400 font-mono font-bold">{getAbastecimento(numId).consumo_medio} L/h</span>
              </div>
            </div>
            <div className="bg-hud-panel border border-hud-border rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-hud-border bg-black/20">
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Data/Hora</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Litros</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Horímetro</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Operador</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Posto</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Combustível</th>
                  </tr>
                </thead>
                <tbody>
                  {getAbastecimento(numId).registros.map(a => (
                    <tr key={a.id} className="border-b border-hud-border/50 hover:bg-white/[0.02]">
                      <td className="px-3 py-2 font-mono text-gray-300">{a.data}</td>
                      <td className="px-3 py-2 font-mono text-brand-400 font-bold">{a.litros}L</td>
                      <td className="px-3 py-2 font-mono text-gray-400">{a.km_horimetro}</td>
                      <td className="px-3 py-2 text-gray-300">{a.operador}</td>
                      <td className="px-3 py-2 text-gray-400">{a.posto}</td>
                      <td className="px-3 py-2 text-gray-400">{a.combustivel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TAB ROTOGRAMA ========== */}
        {tab === 'Rotograma' && (
          <div className="space-y-4">
            {getRotograma(numId) ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30" style={{ background: getRotograma(numId).cor }}></div>
                  <h3 className="text-sm font-display text-gray-200">{getRotograma(numId).nome}</h3>
                </div>
                <div className="bg-hud-panel border border-hud-border rounded-lg overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-hud-border bg-black/20">
                        <th className="px-3 py-2 text-left font-mono text-dim uppercase">Trecho</th>
                        <th className="px-3 py-2 text-left font-mono text-dim uppercase">Vel. Seco (km/h)</th>
                        <th className="px-3 py-2 text-left font-mono text-dim uppercase">Vel. Chuva (km/h)</th>
                        <th className="px-3 py-2 text-left font-mono text-dim uppercase">Sentido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRotograma(numId).trechos.map((t: any) => (
                        <tr key={t.id} className="border-b border-hud-border/50 hover:bg-white/[0.02]">
                          <td className="px-3 py-2 text-gray-200">{t.nome}</td>
                          <td className="px-3 py-2 font-mono text-ok">{t.vel_max_seco}</td>
                          <td className="px-3 py-2 font-mono text-brand-400">{t.vel_max_chuva}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded text-[10px] border border-hud-border bg-white/5">{t.sentido}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="bg-hud-bg border border-hud-border rounded-lg p-8 text-center">
                <span className="text-dim text-sm">Nenhum rotograma vinculado a este equipamento</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== DRAWERS ===== */}
      <Drawer open={hwDrawerOpen} onClose={() => setHwDrawerOpen(false)} title="Instalar Hardware"
        footer={<>
          <button onClick={() => setHwDrawerOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300 transition-colors">Cancelar</button>
          <button onClick={instalarHw} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Instalar</button>
        </>}>
        <div className="space-y-6">
          <FormSection title="Hardware">
            <Input label="Serial Number" value={hwForm.sn} onChange={v => setHwForm(p => ({ ...p, sn: v }))} required placeholder="HW-GPS-2024-XXX" />
            <FormGrid>
              <Select label="Tipo" value={hwForm.tipo} onChange={v => setHwForm(p => ({ ...p, tipo: v }))} options={[
                { value: 'GPS', label: 'GPS' }, { value: 'Modem 4G', label: 'Modem 4G' },
                { value: 'Tablet', label: 'Tablet' }, { value: 'Radar', label: 'Radar' },
                { value: 'Câmera', label: 'Câmera' }, { value: 'Sensor', label: 'Sensor' },
              ]} />
              <Input label="Modelo" value={hwForm.modelo} onChange={v => setHwForm(p => ({ ...p, modelo: v }))} placeholder="Trimble SNM941" />
            </FormGrid>
            <Input label="Função" value={hwForm.funcao} onChange={v => setHwForm(p => ({ ...p, funcao: v }))} required placeholder="Rastreamento" />
          </FormSection>
        </div>
      </Drawer>

      <Drawer open={compDrawerOpen} onClose={() => setCompDrawerOpen(false)} title="Adicionar Componente"
        footer={<>
          <button onClick={() => setCompDrawerOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300 transition-colors">Cancelar</button>
          <button onClick={addComponente} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Adicionar</button>
        </>}>
        <div className="space-y-6">
          <FormSection title="Componente">
            <Input label="Nome" value={compForm.nome} onChange={v => setCompForm(p => ({ ...p, nome: v }))} required placeholder="Motor Diesel" />
            <FormGrid>
              <Select label="Tipo" value={compForm.tipo} onChange={v => setCompForm(p => ({ ...p, tipo: v }))} options={[
                { value: 'Motor', label: 'Motor' }, { value: 'Pneu', label: 'Pneu' },
                { value: 'Transmissão', label: 'Transmissão' }, { value: 'Hidráulico', label: 'Hidráulico' },
                { value: 'Material Rodante', label: 'Material Rodante' }, { value: 'Suspensão', label: 'Suspensão' },
                { value: 'Elétrico', label: 'Elétrico' }, { value: 'Freio', label: 'Freio' },
              ]} />
              <Input label="N. Série" value={compForm.n_serie} onChange={v => setCompForm(p => ({ ...p, n_serie: v }))} required placeholder="ENG-C27-2019-XXX" />
            </FormGrid>
            <Input label="Posição" value={compForm.posicao} onChange={v => setCompForm(p => ({ ...p, posicao: v }))} placeholder="Central" />
            <FormGrid>
              <Input label="Vida Útil (h)" value={compForm.vida_util_h} onChange={v => setCompForm(p => ({ ...p, vida_util_h: v }))} type="number" placeholder="15000" />
              <Input label="Horas Atuais" value={compForm.horas_atuais} onChange={v => setCompForm(p => ({ ...p, horas_atuais: v }))} type="number" placeholder="0" />
            </FormGrid>
          </FormSection>
        </div>
      </Drawer>
    </div>
  )
}
