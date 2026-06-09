import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Wrench, Fuel, Activity, Clock, Cpu } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Drawer from '../../components/ui/Drawer'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { equipamentos } from '../../mock/data'

export default function FichaEquipamento() {
  const { id } = useParams()
  const base = equipamentos.find(e => e.id === Number(id)) || equipamentos[0]
  const [equip, setEquip] = useState({...base, numero_serie:'SN-'+base.id+'000', placa:'', ano:2020, chassi:'', obs:''})
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({codigo:equip.codigo, modelo:equip.modelo, contratada:equip.contratada, numero_serie:equip.numero_serie, status:equip.status, obs:equip.obs})
  const [tab, setTab] = useState('geral')
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const save = () => {
    setEquip(p=>({...p,...form}))
    toast('Equipamento atualizado')
    setEditOpen(false)
  }

  const componentes = [
    { nome:'Motor', vida_util:15000, horas_atuais:equip.horimetro, status:'OK' },
    { nome:'Transmissão', vida_util:20000, horas_atuais:equip.horimetro, status:'OK' },
    { nome:'Pneus (conjunto)', vida_util:5000, horas_atuais:3200, status:'ATENCAO' },
    { nome:'Sistema Hidráulico', vida_util:12000, horas_atuais:equip.horimetro, status:'OK' },
  ]

  const osList = [
    { numero:'OS-2024-0340', tipo:'PREVENTIVA', status:'CONCLUIDA', dt:'2024-06-01' },
    { numero:'OS-2024-0298', tipo:'CORRETIVA', status:'CONCLUIDA', dt:'2024-05-15' },
  ]

  const hardware = [
    { tipo:'GPS', modelo:'Teltonika FMC130', sn:'HW-GPS-00'+base.id, status:'ONLINE' },
    { tipo:'Tablet', modelo:'Samsung Tab Active4', sn:'HW-TAB-00'+base.id, status:'ONLINE' },
  ]

  const tabs = [{id:'geral',label:'Geral',icon:Activity},{id:'manutencao',label:'Manutenção',icon:Wrench},{id:'abastecimento',label:'Abastecimento',icon:Fuel},{id:'hardware',label:'Hardware',icon:Cpu}]

  return (<div className="space-y-6">
    <Link to="/frota/equipamentos" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"><ArrowLeft className="w-4 h-4"/>Voltar para Equipamentos</Link>

    {/* Header */}
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-900/30 flex items-center justify-center text-brand-400 text-lg font-bold">{equip.codigo}</div>
          <div>
            <h1 className="text-lg font-semibold text-white">{equip.codigo} — {equip.modelo}</h1>
            <p className="text-sm text-gray-400">{equip.contratada} • {equip.grupo} • SN: {equip.numero_serie}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={equip.status} />
          <button onClick={()=>{setForm({codigo:equip.codigo,modelo:equip.modelo,contratada:equip.contratada,numero_serie:equip.numero_serie,status:equip.status,obs:equip.obs});setEditOpen(true)}} className="px-3 py-1.5 bg-surface-3 hover:bg-surface-4 text-gray-300 text-xs rounded-lg flex items-center gap-1"><Edit2 className="w-3.5 h-3.5"/>Editar</button>
        </div>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        <div className="p-3 bg-surface-2 rounded-lg text-center"><span className="text-xs text-gray-500">Horímetro</span><p className="text-lg font-bold text-gray-200">{equip.horimetro?.toLocaleString()}h</p></div>
        <div className="p-3 bg-surface-2 rounded-lg text-center"><span className="text-xs text-gray-500">Tanque</span><p className={`text-lg font-bold ${equip.tanque<30?'text-red-400':'text-green-400'}`}>{equip.tanque}%</p></div>
        <div className="p-3 bg-surface-2 rounded-lg text-center"><span className="text-xs text-gray-500">Operador</span><p className="text-sm font-medium text-gray-200">{equip.operador||'—'}</p></div>
        <div className="p-3 bg-surface-2 rounded-lg text-center"><span className="text-xs text-gray-500">Atividade</span><p className="text-sm font-medium text-gray-200">{equip.atividade||'—'}</p></div>
        <div className="p-3 bg-surface-2 rounded-lg text-center"><span className="text-xs text-gray-500">Velocidade</span><p className="text-lg font-bold text-gray-200">{equip.vel} km/h</p></div>
      </div>
    </div>

    {/* Tabs */}
    <div className="flex gap-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab===t.id?'bg-brand-600 text-white':'bg-surface-2 text-gray-400 hover:text-gray-200'}`}><t.icon className="w-4 h-4"/>{t.label}</button>)}</div>

    {tab==='geral' && <div className="grid grid-cols-2 gap-6">
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Wrench className="w-4 h-4"/>Componentes</h3>
        <div className="space-y-2">{componentes.map((c,i)=><div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
          <span className="text-sm text-gray-200">{c.nome}</span>
          <div className="flex items-center gap-3">
            <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.status==='OK'?'bg-green-500':'bg-yellow-500'}`} style={{width:`${Math.min(100,(c.horas_atuais/c.vida_util)*100)}%`}}></div></div>
            <span className="text-xs text-gray-500">{Math.round(c.horas_atuais/c.vida_util*100)}%</span>
          </div>
        </div>)}</div>
      </div>
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/>Últimas OS</h3>
        <div className="space-y-2">{osList.map((o,i)=><div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
          <div><span className="text-sm text-brand-400 font-mono">{o.numero}</span><span className="text-xs text-gray-500 ml-2">{o.dt}</span></div>
          <StatusBadge status={o.tipo} />
        </div>)}</div>
      </div>
    </div>}

    {tab==='manutencao' && <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Histórico de Manutenção</h3>
      <div className="space-y-2">{[...osList,...osList].map((o,i)=><div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"><div><span className="text-sm text-brand-400 font-mono">{o.numero}</span><span className="text-xs text-gray-500 ml-2">{o.dt}</span></div><div className="flex items-center gap-2"><StatusBadge status={o.tipo} /><StatusBadge status={o.status} /></div></div>)}</div>
    </div>}

    {tab==='abastecimento' && <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Últimos Abastecimentos</h3>
      <div className="space-y-2">{[{dt:'09/06 07:30',litros:580,posto:'Central',hor:12440},{dt:'07/06 14:15',litros:620,posto:'Comboio 01',hor:12320},{dt:'05/06 06:00',litros:590,posto:'Central',hor:12200}].map((a,i)=><div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"><span className="text-sm text-gray-300">{a.dt}</span><span className="font-mono text-brand-400">{a.litros} L</span><span className="text-xs text-gray-500">{a.posto}</span><span className="text-xs text-gray-500">{a.hor}h</span></div>)}</div>
    </div>}

    {tab==='hardware' && <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Devices Instalados</h3>
      <div className="space-y-2">{hardware.map((h,i)=><div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
        <div className="flex items-center gap-3"><Cpu className="w-4 h-4 text-gray-500"/><div><span className="text-sm text-gray-200">{h.tipo} — {h.modelo}</span><span className="text-xs text-gray-500 ml-2">SN: {h.sn}</span></div></div>
        <span className={`px-2 py-0.5 rounded text-xs ${h.status==='ONLINE'?'bg-green-900/30 text-green-400':'bg-red-900/30 text-red-400'}`}>{h.status}</span>
      </div>)}</div>
    </div>}

    {/* Edit Drawer */}
    <Drawer open={editOpen} onClose={()=>setEditOpen(false)} title="Editar Equipamento" subtitle={equip.codigo}
      footer={<><button onClick={()=>setEditOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required /><Input label="Nº Série" value={form.numero_serie} onChange={v=>set('numero_serie',v)} /></FormGrid>
          <Select label="Modelo" value={form.modelo} onChange={v=>set('modelo',v)} required options={[{value:'Caterpillar 777G',label:'Caterpillar 777G'},{value:'Komatsu PC5500',label:'Komatsu PC5500'},{value:'CAT 6060',label:'CAT 6060'},{value:'CAT 16M',label:'CAT 16M'}]} />
          <Select label="Contratada" value={form.contratada} onChange={v=>set('contratada',v)} required options={[{value:'Mineradora ABC',label:'Mineradora ABC'},{value:'TransLog Ltda',label:'TransLog Ltda'}]} />
          <Select label="Status" value={form.status} onChange={v=>set('status',v)} options={[{value:'OPERANDO',label:'Operando'},{value:'PARADO',label:'Parado'},{value:'MANUTENCAO',label:'Manutenção'},{value:'INATIVO',label:'Inativo'}]} />
        </FormSection>
        <FormSection title="Observações">
          <Textarea label="Observação" value={form.obs} onChange={v=>set('obs',v)} rows={3} />
        </FormSection>
      </div>
    </Drawer>
  </div>)
}