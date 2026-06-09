import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Award, Clock, Plus, Edit2 } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { operadores } from '../../mock/data'

export default function FichaOperador() {
  const { id } = useParams()
  const op = operadores.find(o=>o.id===Number(id)) || operadores[0]
  const [docs, setDocs] = useState([
    { id:1, tipo:'CNH', numero:'01234567890', validade:'2025-08-15', status:'VALIDO' },
    { id:2, tipo:'ASO', numero:'—', validade:'2024-12-01', status:'VALIDO' },
    { id:3, tipo:'NR-11', numero:'CERT-2024-001', validade:'2025-03-20', status:'VALIDO' },
  ])
  const [habs, setHabs] = useState(op.habilitacoes)
  const [docOpen, setDocOpen] = useState(false)
  const [habOpen, setHabOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [delDoc, setDelDoc] = useState<any>(null)
  const [docForm, setDocForm] = useState({ tipo:'', numero:'', validade:'' })
  const [habForm, setHabForm] = useState({ modelo:'' })
  const [editForm, setEditForm] = useState({ nome:op.nome, matricula:op.matricula, cargo:op.cargo||'', telefone:'' })

  const saveDoc = () => {
    if (!docForm.tipo||!docForm.validade) { toast('Campos obrigatórios','error'); return }
    setDocs(p=>[...p,{id:Date.now(),tipo:docForm.tipo,numero:docForm.numero,validade:docForm.validade,status:'VALIDO'}])
    toast('Documento adicionado'); setDocOpen(false); setDocForm({tipo:'',numero:'',validade:''})
  }
  const saveHab = () => {
    if (!habForm.modelo) { toast('Selecione um modelo','error'); return }
    if (habs.includes(habForm.modelo)) { toast('Já habilitado neste modelo','error'); return }
    setHabs(p=>[...p,habForm.modelo])
    toast('Habilitação adicionada'); setHabOpen(false); setHabForm({modelo:''})
  }
  const saveEdit = () => { toast('Operador atualizado'); setEditOpen(false) }

  const historico = [
    { dt:'09/06 06:05', equip:'CAT-01', atividade:'Transporte Cheio', duracao:'2h15' },
    { dt:'09/06 04:00', equip:'CAT-01', atividade:'Transporte Vazio', duracao:'1h50' },
    { dt:'08/06 22:10', equip:'CAT-04', atividade:'Fila de Carga', duracao:'0h25' },
    { dt:'08/06 20:00', equip:'CAT-04', atividade:'Transporte Cheio', duracao:'3h10' },
  ]

  return (<div className="space-y-6">
    <Link to="/operadores" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"><ArrowLeft className="w-4 h-4"/>Voltar para Operadores</Link>
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-xl font-bold text-white">{op.nome.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div><h1 className="text-lg font-semibold text-white">{op.nome}</h1><p className="text-sm text-gray-400">{op.matricula} — {op.cargo}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={op.status} />
          <button onClick={()=>setEditOpen(true)} className="px-3 py-1.5 bg-surface-3 hover:bg-surface-4 text-gray-300 text-xs rounded-lg flex items-center gap-1"><Edit2 className="w-3.5 h-3.5"/>Editar</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6 text-sm">
        <div><span className="text-gray-500 text-xs block">CPF</span><span className="text-gray-300">{op.cpf}</span></div>
        <div><span className="text-gray-500 text-xs block">Contratada</span><span className="text-gray-300">{op.contratada}</span></div>
        <div><span className="text-gray-500 text-xs block">Habilitações</span><span className="text-gray-300">{habs.length} modelo(s)</span></div>
        <div><span className="text-gray-500 text-xs block">Turno Atual</span><span className="text-gray-300">A (Diurno)</span></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-6">
      {/* Documentos */}
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300"><FileText className="w-4 h-4"/>Documentos</h3>
          <button onClick={()=>setDocOpen(true)} className="flex items-center gap-1 px-2 py-1 bg-surface-3 rounded text-xs text-gray-400 hover:text-gray-200"><Plus className="w-3 h-3"/>Adicionar</button>
        </div>
        <div className="space-y-2">{docs.map(d=><div key={d.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg group">
          <div><span className="text-sm text-gray-200">{d.tipo}</span>{d.numero!=='—'&&<span className="text-xs text-gray-500 ml-2">Nº {d.numero}</span>}</div>
          <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Val: {d.validade}</span><span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">{d.status}</span><button onClick={()=>setDelDoc(d)} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs">✕</button></div>
        </div>)}</div>
      </div>
      {/* Habilitações */}
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300"><Award className="w-4 h-4"/>Habilitações</h3>
          <button onClick={()=>setHabOpen(true)} className="flex items-center gap-1 px-2 py-1 bg-surface-3 rounded text-xs text-gray-400 hover:text-gray-200"><Plus className="w-3 h-3"/>Adicionar</button>
        </div>
        <div className="space-y-2">{habs.map((h,i)=><div key={i} className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg group">
          <div className="w-8 h-8 rounded bg-brand-900/30 flex items-center justify-center text-brand-400 text-xs font-bold">{h.split(' ')[0][0]}</div>
          <span className="text-sm text-gray-200 flex-1">{h}</span>
          <button onClick={()=>{setHabs(p=>p.filter(x=>x!==h));toast('Habilitação removida')}} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs">✕</button>
        </div>)}</div>
      </div>
    </div>
    {/* Histórico */}
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4"><Clock className="w-4 h-4"/>Histórico Recente</h3>
      <div className="space-y-2">{historico.map((h,i)=><div key={i} className="flex items-center gap-4 p-3 bg-surface-2 rounded-lg text-sm"><span className="text-gray-500 font-mono w-20">{h.dt}</span><span className="text-brand-400 w-16">{h.equip}</span><span className="text-gray-300 flex-1">{h.atividade}</span><span className="text-gray-500">{h.duracao}</span></div>)}</div>
    </div>

    {/* Drawers */}
    <Drawer open={docOpen} onClose={()=>setDocOpen(false)} title="Adicionar Documento"
      footer={<><button onClick={()=>setDocOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={saveDoc} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Documento">
        <Select label="Tipo" value={docForm.tipo} onChange={v=>setDocForm(p=>({...p,tipo:v}))} required options={[{value:'CNH',label:'CNH'},{value:'ASO',label:'ASO (Atestado Saúde)'},{value:'NR-11',label:'NR-11'},{value:'NR-12',label:'NR-12'},{value:'NR-35',label:'NR-35'}]} />
        <FormGrid><Input label="Número" value={docForm.numero} onChange={v=>setDocForm(p=>({...p,numero:v}))} /><Input label="Validade" value={docForm.validade} onChange={v=>setDocForm(p=>({...p,validade:v}))} type="date" required /></FormGrid>
      </FormSection></div>
    </Drawer>
    <Drawer open={habOpen} onClose={()=>setHabOpen(false)} title="Adicionar Habilitação"
      footer={<><button onClick={()=>setHabOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={saveHab} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Modelo">
        <Select label="Modelo de Equipamento" value={habForm.modelo} onChange={v=>setHabForm({modelo:v})} required options={[{value:'Caterpillar 777G',label:'Caterpillar 777G'},{value:'CAT 785D',label:'CAT 785D'},{value:'Komatsu PC5500',label:'Komatsu PC5500'},{value:'CAT 6060',label:'CAT 6060'},{value:'CAT 16M',label:'CAT 16M'},{value:'CAT D10T',label:'CAT D10T'},{value:'Atlas Copco D65',label:'Atlas Copco D65'}]} />
      </FormSection></div>
    </Drawer>
    <Drawer open={editOpen} onClose={()=>setEditOpen(false)} title="Editar Operador"
      footer={<><button onClick={()=>setEditOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={saveEdit} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados">
        <Input label="Nome" value={editForm.nome} onChange={v=>setEditForm(p=>({...p,nome:v}))} required />
        <FormGrid><Input label="Matrícula" value={editForm.matricula} onChange={v=>setEditForm(p=>({...p,matricula:v}))} /><Input label="Cargo" value={editForm.cargo} onChange={v=>setEditForm(p=>({...p,cargo:v}))} /></FormGrid>
        <Input label="Telefone" value={editForm.telefone} onChange={v=>setEditForm(p=>({...p,telefone:v}))} />
      </FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!delDoc} onClose={()=>setDelDoc(null)} onConfirm={()=>{setDocs(p=>p.filter(d=>d.id!==delDoc.id));toast('Documento removido');setDelDoc(null)}} title="Excluir documento?" message={`Excluir ${delDoc?.tipo}?`} confirmLabel="Excluir" />
  </div>)
}