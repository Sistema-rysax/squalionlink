import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTheme } from '../../contexts/ThemeContext'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { fmtNum } from '../../utils/format'

const pilhas = [
  { id:1, nome:'PL-ROM-01', material:'ROM', volume:45000, fe:58.2, sio2:8.1, al2o3:3.4, mn:0.32, status:'ATIVA' },
  { id:2, nome:'PL-ROM-02', material:'ROM', volume:32000, fe:61.5, sio2:5.8, al2o3:2.1, mn:0.28, status:'ATIVA' },
  { id:3, nome:'PL-ITB-01', material:'Itabirito', volume:28000, fe:42.8, sio2:22.4, al2o3:5.6, mn:0.45, status:'ATIVA' },
  { id:4, nome:'PL-HEM-01', material:'Hematita', volume:18500, fe:66.1, sio2:2.3, al2o3:1.2, mn:0.18, status:'FECHADA' },
]

const emptyPilha = { nome:'', material:'ROM', fe:'', sio2:'', al2o3:'', mn:'', volume:'' }

export default function Qualidade() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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

  const textColor = isDark ? '#9ca3af' : '#64748b'
  const axisLine = isDark ? '#2a2a4a' : '#e2e8f0'

  const qualityChart = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger:'axis', backgroundColor:isDark?'#1a1a2e':'#fff', borderColor:isDark?'#3a3a5a':'#e2e8f0', textStyle:{color:isDark?'#f3f4f6':'#1e293b'} },
    legend: { bottom:0, textStyle:{color:textColor,fontSize:11} },
    grid: { top:30, right:20, bottom:40, left:50 },
    xAxis: { type:'category', data:data.filter(p=>p.status==='ATIVA').map(p=>p.nome), axisLabel:{color:textColor,fontSize:11}, axisLine:{lineStyle:{color:axisLine}} },
    yAxis: { type:'value', name:'%', axisLabel:{color:textColor,fontSize:11}, splitLine:{lineStyle:{color:axisLine,type:'dashed'}}, nameTextStyle:{color:textColor} },
    series: [
      { name:'Fe', type:'bar', data:data.filter(p=>p.status==='ATIVA').map(p=>p.fe), itemStyle:{color:'#2563eb',borderRadius:[3,3,0,0]}, barWidth:'18%' },
      { name:'SiO₂', type:'bar', data:data.filter(p=>p.status==='ATIVA').map(p=>p.sio2), itemStyle:{color:'#f59e0b',borderRadius:[3,3,0,0]}, barWidth:'18%' },
      { name:'Al₂O₃', type:'bar', data:data.filter(p=>p.status==='ATIVA').map(p=>p.al2o3), itemStyle:{color:'#22c55e',borderRadius:[3,3,0,0]}, barWidth:'18%' },
      { name:'Mn', type:'bar', data:data.filter(p=>p.status==='ATIVA').map(p=>p.mn), itemStyle:{color:'#ef4444',borderRadius:[3,3,0,0]}, barWidth:'18%' },
    ]
  }), [data, isDark])

  const columns = [
    { key:'nome', label:'Pilha' },
    { key:'material', label:'Material', render:(r:any)=><span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.material}</span> },
    { key:'volume', label:'Volume (m³)', render:(r:any)=><span className="font-mono">{fmtNum(r.volume,0)}</span> },
    { key:'fe', label:'Fe%', render:(r:any)=><span className="font-mono text-brand-400">{fmtNum(r.fe,1)}%</span> },
    { key:'sio2', label:'SiO₂%', render:(r:any)=><span className="font-mono">{fmtNum(r.sio2,2)}%</span> },
    { key:'al2o3', label:'Al₂O₃%', render:(r:any)=><span className="font-mono">{fmtNum(r.al2o3,2)}%</span> },
    { key:'mn', label:'Mn%', render:(r:any)=><span className="font-mono">{fmtNum(r.mn,2)}%</span> },
    { key:'status', label:'Status', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.status==='ATIVA'?'bg-green-900/30 text-green-400':'bg-gray-700/30 text-gray-400'}`}>{r.status}</span> },
  ]

  return (<div className="space-y-6">
    <div className="flex gap-2 mb-2">
      <button onClick={()=>setTab('pilhas')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab==='pilhas'?'bg-brand-600 text-white':'bg-surface-2 text-gray-400'}`}>Pilhas (CRUD)</button>
      <button onClick={()=>setTab('qualidade')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab==='qualidade'?'bg-brand-600 text-white':'bg-surface-2 text-gray-400'}`}>Qualidade (Gráficos)</button>
    </div>
    {tab==='pilhas' && <>
      <DataTable columns={columns} data={data} title="Pilhas" onAdd={()=>{setForm(emptyPilha);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,material:r.material,fe:String(r.fe),sio2:String(r.sio2),al2o3:String(r.al2o3),mn:String(r.mn),volume:String(r.volume)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Pilha" />
    </>}
    {tab==='qualidade' && <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Composição Química — Pilhas Ativas</h3>
      <ReactECharts option={qualityChart} style={{height:320}} opts={{renderer:'svg'}} />
    </div>}
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Pilha':'Nova Pilha'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="PL-ROM-01" /><Select label="Material" value={form.material} onChange={v=>set('material',v)} options={[{value:'ROM',label:'ROM'},{value:'Itabirito',label:'Itabirito'},{value:'Hematita',label:'Hematita'},{value:'Estéril',label:'Estéril'}]} /></FormSection>
        <FormSection title="Qualidade"><FormGrid><Input label="Fe (%)" value={form.fe} onChange={v=>set('fe',v)} type="number" placeholder="58.20" /><Input label="SiO₂ (%)" value={form.sio2} onChange={v=>set('sio2',v)} type="number" placeholder="8.10" /></FormGrid><FormGrid><Input label="Al₂O₃ (%)" value={form.al2o3} onChange={v=>set('al2o3',v)} type="number" placeholder="3.40" /><Input label="Mn (%)" value={form.mn} onChange={v=>set('mn',v)} type="number" placeholder="0.32" /></FormGrid></FormSection>
        <FormSection title="Volume"><Input label="Volume (m³)" value={form.volume} onChange={v=>set('volume',v)} type="number" placeholder="45000" /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Pilha removida');setDel(null)}} title="Excluir pilha?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </div>)
}