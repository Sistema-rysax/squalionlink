import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const pilhas = [
  { id:1, nome:'PL-ROM-01', material:'ROM', volume:45000, fe:58.2, sio2:8.1, al2o3:3.4, mn:0.32, status:'ATIVA' },
  { id:2, nome:'PL-ROM-02', material:'ROM', volume:32000, fe:61.5, sio2:5.8, al2o3:2.1, mn:0.28, status:'ATIVA' },
  { id:3, nome:'PL-ITB-01', material:'Itabirito', volume:28000, fe:42.8, sio2:22.4, al2o3:5.6, mn:0.45, status:'ATIVA' },
  { id:4, nome:'PL-HEM-01', material:'Hematita', volume:18500, fe:66.1, sio2:2.3, al2o3:1.2, mn:0.18, status:'FECHADA' },
]
const emptyPilha = { nome:'', material:'ROM', fe:'', sio2:'', al2o3:'', mn:'', volume:'' }

export default function Qualidade() {
  const [data, setData] = useState(pilhas)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyPilha)
  const [tab, setTab] = useState<'pilhas'|'qualidade'>('pilhas')
  const set = (k:string,v:string) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome||!form.material) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,nome:form.nome,material:form.material,fe:+form.fe||r.fe,sio2:+form.sio2||r.sio2,al2o3:+form.al2o3||r.al2o3,mn:+form.mn||r.mn,volume:+form.volume||r.volume}:r)); toast('Pilha atualizada') }
    else { setData(p=>[...p,{id:Date.now(),nome:form.nome,material:form.material,fe:+form.fe||0,sio2:+form.sio2||0,al2o3:+form.al2o3||0,mn:+form.mn||0,volume:+form.volume||0,status:'ATIVA'}]); toast('Pilha criada') }
    setOpen(false)
  }

  const qualityChart = useMemo(()=>({
    backgroundColor:'transparent',
    tooltip:{trigger:'axis',backgroundColor:'#0a0c12',borderColor:'#1a2030',textStyle:{color:'#e2e8f0',fontFamily:'JetBrains Mono',fontSize:11}},
    legend:{bottom:0,textStyle:{color:'#6b7280',fontSize:10}},
    grid:{top:30,right:20,bottom:40,left:50},
    xAxis:{type:'category' as const,data:data.filter(p=>p.status==='ATIVA').map(p=>p.nome),axisLabel:{color:'#4b5563',fontSize:10,fontFamily:'JetBrains Mono'},axisLine:{lineStyle:{color:'#1a2030'}}},
    yAxis:{type:'value' as const,name:'%',axisLabel:{color:'#4b5563',fontSize:10,fontFamily:'JetBrains Mono'},splitLine:{lineStyle:{color:'#1a2030',type:'dashed' as const}}},
    series:[
      {name:'Fe',type:'bar',data:data.filter(p=>p.status==='ATIVA').map(p=>p.fe),itemStyle:{color:'#2563eb'}},
      {name:'SiO₂',type:'bar',data:data.filter(p=>p.status==='ATIVA').map(p=>p.sio2),itemStyle:{color:'#f59e0b'}},
      {name:'Al₂O₃',type:'bar',data:data.filter(p=>p.status==='ATIVA').map(p=>p.al2o3),itemStyle:{color:'#a855f7'}},
      {name:'Mn',type:'bar',data:data.filter(p=>p.status==='ATIVA').map(p=>p.mn),itemStyle:{color:'#06b6d4'}},
    ]
  }),[data])

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-brand-400 font-bold">{r.nome}</span> },
    { key:'material', label:'Material' },
    { key:'volume', label:'Volume (m³)', render:(r:any)=><span className="font-mono">{r.volume.toLocaleString()}</span> },
    { key:'fe', label:'Fe%', render:(r:any)=><span className="font-mono text-ok">{r.fe}</span> },
    { key:'sio2', label:'SiO₂%', render:(r:any)=><span className="font-mono text-warn">{r.sio2}</span> },
    { key:'status', label:'Status', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.status==='ATIVA'?'bg-ok/10 text-ok border-ok/20':'bg-white/5 text-dim border-hud-border')}>{r.status}</span> },
  ]

  return (<div className="flex flex-col gap-4 h-full">
    <div className="flex gap-1 border-b border-hud-border">
      <button onClick={()=>setTab('pilhas')} className={'px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all '+(tab==='pilhas'?'border-brand-400 text-brand-400':'border-transparent text-dim hover:text-gray-300')}>Pilhas</button>
      <button onClick={()=>setTab('qualidade')} className={'px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all '+(tab==='qualidade'?'border-brand-400 text-brand-400':'border-transparent text-dim hover:text-gray-300')}>Qualidade</button>
    </div>
    {tab==='pilhas' && <div className="flex-1 min-h-0">
      <DataTable columns={columns} data={data} title="Pilhas" status="ok" onAdd={()=>{setForm(emptyPilha);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,material:r.material,fe:String(r.fe),sio2:String(r.sio2),al2o3:String(r.al2o3),mn:String(r.mn),volume:String(r.volume)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Pilha" />
    </div>}
    {tab==='qualidade' && <div className="flex-1 bg-hud-panel border border-hud-border rounded-xl p-4">
      <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400 mb-3">Composição Química — Pilhas Ativas</h3>
      <ReactECharts option={qualityChart} style={{height:300}} />
    </div>}
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Pilha':'Nova Pilha'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="PL-ROM-01" /><Select label="Material" value={form.material} onChange={v=>set('material',v)} options={[{value:'ROM',label:'ROM'},{value:'Itabirito',label:'Itabirito'},{value:'Hematita',label:'Hematita'}]} /></FormGrid><Input label="Volume (m³)" value={form.volume} onChange={v=>set('volume',v)} type="number" /></FormSection>
        <FormSection title="Composição Química"><FormGrid><Input label="Fe %" value={form.fe} onChange={v=>set('fe',v)} type="number" placeholder="58.2" /><Input label="SiO₂ %" value={form.sio2} onChange={v=>set('sio2',v)} type="number" placeholder="8.1" /></FormGrid><FormGrid><Input label="Al₂O₃ %" value={form.al2o3} onChange={v=>set('al2o3',v)} type="number" placeholder="3.4" /><Input label="Mn %" value={form.mn} onChange={v=>set('mn',v)} type="number" placeholder="0.32" /></FormGrid></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Pilha removida');setDel(null)}} title="Excluir Pilha" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </div>)
}
