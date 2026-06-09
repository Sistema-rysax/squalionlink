import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Input, Select, FormSection, FormGrid, Toggle } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { equipamentos } from '../../mock/data'
import { ArrowLeft, Save } from 'lucide-react'

const tabs = ['Geral','Manutenção','Abastecimento','Hardware']

const manutencaoData = [
  { id:1, tipo:'PREVENTIVA', descricao:'Troca de óleo motor', data:'2024-06-01', status:'CONCLUIDA' },
  { id:2, tipo:'CORRETIVA', descricao:'Reparo hidráulico', data:'2024-06-05', status:'EM_ANDAMENTO' },
  { id:3, tipo:'PREVENTIVA', descricao:'Revisão freios', data:'2024-06-15', status:'PROGRAMADA' },
]

const abastecimentoData = [
  { id:1, data:'09/06 06:15', litros:320, operador:'João Silva', posto:'Posto 01' },
  { id:2, data:'08/06 18:30', litros:280, operador:'Carlos Santos', posto:'Posto 02' },
  { id:3, data:'08/06 06:00', litros:350, operador:'João Silva', posto:'Posto 01' },
]

export default function FichaEquipamento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const equip = equipamentos.find(e=>e.id===Number(id)) || equipamentos[0]
  const [tab, setTab] = useState('Geral')
  const [form, setForm] = useState({ codigo:equip.codigo, modelo:equip.modelo, grupo:equip.grupo, status:equip.status, operador:equip.operador||'' })
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const salvar = () => { toast('Equipamento atualizado') }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate('/frota')} className="p-2 rounded-lg hover:bg-white/5 text-dim"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-display text-lg tracking-wider text-gray-200 uppercase">{equip.codigo}</h1>
            <span className="text-[10px] font-mono text-dim">{equip.modelo} • {equip.grupo}</span>
          </div>
          <div className={'ml-4 flex items-center gap-2'}><div className={'led led-'+(equip.status==='OPERANDO'?'ok':equip.status==='PARADO'?'warn':'crit')}></div><span className="text-[10px] font-mono">{equip.status}</span></div>
        </div>
        <button onClick={salvar} className="flex items-center gap-1.5 px-4 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase tracking-wider hover:bg-brand-600/30 hover:shadow-glow-sm transition-all"><Save className="w-3.5 h-3.5" />Salvar</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-hud-border">
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={'px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all '+(tab===t?'border-brand-400 text-brand-400':'border-transparent text-dim hover:text-gray-300')}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab==='Geral' && (
          <div className="space-y-6 max-w-2xl">
            <FormSection title="Identificação">
              <FormGrid>
                <Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required />
                <Input label="Modelo" value={form.modelo} onChange={v=>set('modelo',v)} />
              </FormGrid>
              <FormGrid>
                <Select label="Grupo" value={form.grupo} onChange={v=>set('grupo',v)} options={[{value:'Caminhão',label:'Caminhão'},{value:'Escavadeira',label:'Escavadeira'},{value:'Motoniveladora',label:'Motoniveladora'},{value:'Perfuratriz',label:'Perfuratriz'},{value:'Trator',label:'Trator'}]} />
                <Select label="Status" value={form.status} onChange={v=>set('status',v)} options={[{value:'OPERANDO',label:'Operando'},{value:'PARADO',label:'Parado'},{value:'MANUTENCAO',label:'Manutenção'}]} />
              </FormGrid>
            </FormSection>
            <FormSection title="Telemetria">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-hud-bg border border-hud-border rounded-lg p-3 text-center"><span className="text-[10px] text-dim font-mono block">HORÍMETRO</span><span className="text-lg font-mono text-gray-200">{equip.horimetro.toLocaleString()}h</span></div>
                <div className="bg-hud-bg border border-hud-border rounded-lg p-3 text-center"><span className="text-[10px] text-dim font-mono block">VELOCIDADE</span><span className="text-lg font-mono text-gray-200">{equip.vel} km/h</span></div>
                <div className="bg-hud-bg border border-hud-border rounded-lg p-3 text-center"><span className="text-[10px] text-dim font-mono block">TANQUE</span><span className={'text-lg font-mono '+(equip.tanque<30?'text-crit':equip.tanque<50?'text-warn':'text-ok')}>{equip.tanque}%</span></div>
              </div>
            </FormSection>
          </div>
        )}
        {tab==='Manutenção' && (
          <div className="space-y-3">
            {manutencaoData.map(m=>(
              <div key={m.id} className="flex items-center justify-between bg-hud-bg border border-hud-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className={'px-2 py-0.5 rounded text-[10px] border '+(m.tipo==='PREVENTIVA'?'bg-ok/10 text-ok border-ok/20':'bg-warn/10 text-warn border-warn/20')}>{m.tipo}</span>
                  <span className="text-sm text-gray-300">{m.descricao}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-dim">{m.data}</span>
                  <span className={'px-2 py-0.5 rounded text-[10px] border '+(m.status==='CONCLUIDA'?'bg-ok/10 text-ok border-ok/20':m.status==='EM_ANDAMENTO'?'bg-brand-600/10 text-brand-400 border-brand-600/20':'bg-white/5 text-dim border-hud-border')}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='Abastecimento' && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono uppercase text-dim px-4">
              <span>Data</span><span>Litros</span><span>Operador</span><span>Posto</span>
            </div>
            {abastecimentoData.map(a=>(
              <div key={a.id} className="grid grid-cols-4 gap-2 bg-hud-bg border border-hud-border rounded-lg p-4 text-sm font-mono text-gray-300">
                <span>{a.data}</span><span className="text-brand-400">{a.litros}L</span><span>{a.operador}</span><span className="text-dim">{a.posto}</span>
              </div>
            ))}
          </div>
        )}
        {tab==='Hardware' && (
          <div className="space-y-6 max-w-2xl">
            <FormSection title="Dispositivo Instalado">
              <div className="bg-hud-bg border border-hud-border rounded-lg p-4 space-y-3">
                <div className="flex justify-between"><span className="text-[10px] text-dim font-mono">SERIAL</span><span className="font-mono text-sm text-brand-400">HW-2024-00{equip.id}</span></div>
                <div className="flex justify-between"><span className="text-[10px] text-dim font-mono">STATUS</span><span className="px-2 py-0.5 rounded text-[10px] bg-ok/10 text-ok border border-ok/20">ONLINE</span></div>
                <div className="flex justify-between"><span className="text-[10px] text-dim font-mono">ÚLTIMO PING</span><span className="text-xs text-gray-400">há 12 segundos</span></div>
                <div className="flex justify-between"><span className="text-[10px] text-dim font-mono">FIRMWARE</span><span className="text-xs text-gray-400">v3.2.1</span></div>
              </div>
            </FormSection>
          </div>
        )}
      </div>
    </div>
  )
}
