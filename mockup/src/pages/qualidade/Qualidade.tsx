import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const pilhasInit = [
  { id:1, nome:'Pilha ROM-A', material:'ROM', tonelagem:125000, fe:58.2, sio2:4.8, al2o3:2.1, p:0.045, status:'ATIVA' },
  { id:2, nome:'Pilha ROM-B', material:'ROM', tonelagem:89000, fe:61.5, sio2:3.2, al2o3:1.8, p:0.038, status:'ATIVA' },
  { id:3, nome:'Pilha Estéril 01', material:'Estéril', tonelagem:340000, fe:22.0, sio2:18.5, al2o3:12.3, p:0.12, status:'ATIVA' },
  { id:4, nome:'Pilha ROM-C', material:'ROM', tonelagem:45000, fe:55.8, sio2:6.1, al2o3:3.4, p:0.052, status:'ENCERRADA' },
]
const elemInit = [
  { id:1, simbolo:'Fe', nome:'Ferro', unidade:'%', meta_min:58, meta_max:67 },
  { id:2, simbolo:'SiO₂', nome:'Sílica', unidade:'%', meta_min:0, meta_max:5 },
  { id:3, simbolo:'Al₂O₃', nome:'Alumina', unidade:'%', meta_min:0, meta_max:3 },
  { id:4, simbolo:'P', nome:'Fósforo', unidade:'%', meta_min:0, meta_max:0.05 },
  { id:5, simbolo:'Mn', nome:'Manganês', unidade:'%', meta_min:0, meta_max:1 },
  { id:6, simbolo:'PPC', nome:'Perda por Calcinação', unidade:'%', meta_min:0, meta_max:3 },
]

const emptyPilha = { nome:'', material:'', tonelagem_inicial:'' }
const emptyElem = { simbolo:'', nome:'', unidade:'%', meta_min:'', meta_max:'' }

export default function Qualidade() {
  const [tab, setTab] = useState<'pilhas'|'elementos'>('pilhas')
  const [pilhas, setPilhas] = useState(pilhasInit)
  const [elementos, setElementos] = useState(elemInit)
  const [openP, setOpenP] = useState(false)
  const [openE, setOpenE] = useState(false)
  const [editP, setEditP] = useState<any>(null)
  const [editE, setEditE] = useState<any>(null)
  const [delP, setDelP] = useState<any>(null)
  const [delE, setDelE] = useState<any>(null)
  const [formP, setFormP] = useState(emptyPilha)
  const [formE, setFormE] = useState(emptyElem)

  const chartData = pilhasInit.filter(p=>p.material==='ROM').map(p=>({nome:p.nome.replace('Pilha ',''),Fe:p.fe,SiO2:p.sio2,Al2O3:p.al2o3}))

  const colPilhas = [
    { key:'nome', label:'Pilha' },
    { key:'material', label:'Material', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.material==='ROM'?'bg-yellow-900/30 text-yellow-400':'bg-gray-800 text-gray-400'}`}>{r.material}</span> },
    { key:'tonelagem', label:'Tonelagem', render:(r:any)=>(r.tonelagem/1000).toFixed(0)+'k t' },
    { key:'fe', label:'Fe%', render:(r:any)=><span className={`font-mono ${r.fe>=58?'text-green-400':'text-red-400'}`}>{r.fe}%</span> },
    { key:'sio2', label:'SiO₂%', render:(r:any)=><span className={`font-mono ${r.sio2<=5?'text-green-400':'text-red-400'}`}>{r.sio2}%</span> },
    { key:'al2o3', label:'Al₂O₃%', render:(r:any)=><span className="font-mono">{r.al2o3}%</span> },
    { key:'p', label:'P%', render:(r:any)=><span className={`font-mono ${r.p<=0.05?'text-green-400':'text-red-400'}`}>{r.p}%</span> },
    { key:'status', label:'Status', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.status==='ATIVA'?'bg-green-900/30 text-green-400':'bg-gray-800 text-gray-500'}`}>{r.status}</span> },
  ]
  const colElem = [
    { key:'simbolo', label:'Símbolo', render:(r:any)=><span className="font-bold text-brand-400">{r.simbolo}</span> },
    { key:'nome', label:'Nome' },
    { key:'unidade', label:'Unidade' },
    { key:'meta_min', label:'Meta Mín', render:(r:any)=>r.meta_min+r.unidade },
    { key:'meta_max', label:'Meta Máx', render:(r:any)=>r.meta_max+r.unidade },
  ]

  return (<div className="space-y-6">
    <div className="flex gap-2">
      <button onClick={()=>setTab('pilhas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='pilhas'?'bg-brand-600 text-white':'bg-surface-2 text-gray-400 hover:text-gray-200'}`}>Pilhas</button>
      <button onClick={()=>setTab('elementos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='elementos'?'bg-brand-600 text-white':'bg-surface-2 text-gray-400 hover:text-gray-200'}`}>Elementos Químicos</button>
    </div>

    {tab==='pilhas' && <>
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Comparativo Qualidade — Pilhas ROM</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}><XAxis dataKey="nome" tick={{fill:'#6b7280',fontSize:12}} /><YAxis tick={{fill:'#6b7280',fontSize:11}} /><Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid #2a2a4a'}} /><Bar dataKey="Fe" fill="#22c55e" radius={[4,4,0,0]} /><Bar dataKey="SiO2" fill="#eab308" radius={[4,4,0,0]} /><Bar dataKey="Al2O3" fill="#3b82f6" radius={[4,4,0,0]} /></BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable columns={colPilhas} data={pilhas} title="Pilhas de Estoque" onAdd={()=>{setFormP(emptyPilha);setEditP(null);setOpenP(true)}} onEdit={(r)=>{setFormP({nome:r.nome,material:r.material,tonelagem_inicial:String(r.tonelagem)});setEditP(r);setOpenP(true)}} onDelete={setDelP} addLabel="Nova Pilha" />
    </>}

    {tab==='elementos' && <DataTable columns={colElem} data={elementos} title="Elementos Químicos" onAdd={()=>{setFormE(emptyElem);setEditE(null);setOpenE(true)}} onEdit={(r)=>{setFormE({simbolo:r.simbolo,nome:r.nome,unidade:r.unidade,meta_min:String(r.meta_min),meta_max:String(r.meta_max)});setEditE(r);setOpenE(true)}} onDelete={setDelE} addLabel="Novo Elemento" />}

    <Drawer open={openP} onClose={()=>setOpenP(false)} title={editP?'Editar Pilha':'Nova Pilha'}
      footer={<><button onClick={()=>setOpenP(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={()=>{if(!formP.nome){toast('Nome obrigatório','error');return}if(editP){setPilhas(p=>p.map(r=>r.id===editP.id?{...r,nome:formP.nome,material:formP.material}:r))}else{setPilhas(p=>[...p,{id:Date.now(),nome:formP.nome,material:formP.material||'ROM',tonelagem:+formP.tonelagem_inicial||0,fe:0,sio2:0,al2o3:0,p:0,status:'ATIVA'}])}toast(editP?'Pilha atualizada':'Pilha criada');setOpenP(false)}} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Input label="Nome" value={formP.nome} onChange={v=>setFormP(p=>({...p,nome:v}))} required placeholder="Pilha ROM-D" /><Select label="Material" value={formP.material} onChange={v=>setFormP(p=>({...p,material:v}))} options={[{value:'ROM',label:'ROM'},{value:'Estéril',label:'Estéril'},{value:'Minério',label:'Minério'}]} /><Input label="Tonelagem Inicial" value={formP.tonelagem_inicial} onChange={v=>setFormP(p=>({...p,tonelagem_inicial:v}))} type="number" placeholder="0" /></FormSection></div>
    </Drawer>
    <Drawer open={openE} onClose={()=>setOpenE(false)} title={editE?'Editar Elemento':'Novo Elemento'}
      footer={<><button onClick={()=>setOpenE(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={()=>{if(!formE.simbolo||!formE.nome){toast('Campos obrigatórios','error');return}if(editE){setElementos(p=>p.map(r=>r.id===editE.id?{...r,...formE,meta_min:+formE.meta_min,meta_max:+formE.meta_max}:r))}else{setElementos(p=>[...p,{id:Date.now(),...formE,meta_min:+formE.meta_min,meta_max:+formE.meta_max}])}toast(editE?'Elemento atualizado':'Elemento criado');setOpenE(false)}} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Elemento"><FormGrid><Input label="Símbolo" value={formE.simbolo} onChange={v=>setFormE(p=>({...p,simbolo:v}))} required placeholder="Fe" /><Input label="Nome" value={formE.nome} onChange={v=>setFormE(p=>({...p,nome:v}))} required placeholder="Ferro" /></FormGrid><FormGrid><Input label="Meta Mínima" value={formE.meta_min} onChange={v=>setFormE(p=>({...p,meta_min:v}))} type="number" /><Input label="Meta Máxima" value={formE.meta_max} onChange={v=>setFormE(p=>({...p,meta_max:v}))} type="number" /></FormGrid></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!delP} onClose={()=>setDelP(null)} onConfirm={()=>{setPilhas(p=>p.filter(r=>r.id!==delP.id));toast('Pilha removida');setDelP(null)}} title="Excluir pilha?" message={`Excluir ${delP?.nome}?`} confirmLabel="Excluir" />
    <ConfirmDialog open={!!delE} onClose={()=>setDelE(null)} onConfirm={()=>{setElementos(p=>p.filter(r=>r.id!==delE.id));toast('Elemento removido');setDelE(null)}} title="Excluir elemento?" message={`Excluir ${delE?.simbolo}?`} confirmLabel="Excluir" />
  </div>)
}