import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Award, Clock } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import { operadores } from '../../mock/data'

export default function FichaOperador() {
  const { id } = useParams()
  const op = operadores.find(o=>o.id===Number(id)) || operadores[0]
  const docs = [
    { tipo:'CNH', numero:'01234567890', validade:'2025-08-15', status:'VALIDO' },
    { tipo:'ASO', numero:'—', validade:'2024-12-01', status:'VALIDO' },
    { tipo:'NR-11', numero:'CERT-2024-001', validade:'2025-03-20', status:'VALIDO' },
  ]
  const historico = [
    { dt:'09/06 06:05', equip:'CAT-01', atividade:'Transporte Cheio', duracao:'2h15' },
    { dt:'09/06 04:00', equip:'CAT-01', atividade:'Transporte Vazio', duracao:'1h50' },
    { dt:'08/06 22:10', equip:'CAT-04', atividade:'Fila de Carga', duracao:'0h25' },
  ]

  return (<div className="space-y-6">
    <Link to="/operadores" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"><ArrowLeft className="w-4 h-4"/>Voltar para Operadores</Link>
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-xl font-bold text-white">{op.nome.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
        <div><h1 className="text-lg font-semibold text-white">{op.nome}</h1><p className="text-sm text-gray-400">{op.matricula} — {op.cargo}</p></div>
        <div className="ml-auto"><StatusBadge status={op.status} /></div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6 text-sm">
        <div><span className="text-gray-500 text-xs block">CPF</span><span className="text-gray-300">{op.cpf}</span></div>
        <div><span className="text-gray-500 text-xs block">Contratada</span><span className="text-gray-300">{op.contratada}</span></div>
        <div><span className="text-gray-500 text-xs block">Habilitações</span><span className="text-gray-300">{op.habilitacoes.join(', ')}</span></div>
        <div><span className="text-gray-500 text-xs block">Turno Atual</span><span className="text-gray-300">A (Diurno)</span></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4"><FileText className="w-4 h-4"/>Documentos</h3>
        <div className="space-y-2">{docs.map((d,i)=><div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
          <div><span className="text-sm text-gray-200">{d.tipo}</span><span className="text-xs text-gray-500 ml-2">Val: {d.validade}</span></div>
          <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">{d.status}</span>
        </div>)}</div>
      </div>
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4"><Award className="w-4 h-4"/>Habilitações</h3>
        <div className="space-y-2">{op.habilitacoes.map((h,i)=><div key={i} className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg"><div className="w-8 h-8 rounded bg-brand-900/30 flex items-center justify-center text-brand-400 text-xs font-bold">{h.split(' ')[0][0]}</div><span className="text-sm text-gray-200">{h}</span></div>)}</div>
      </div>
    </div>
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4"><Clock className="w-4 h-4"/>Histórico Recente</h3>
      <div className="space-y-2">{historico.map((h,i)=><div key={i} className="flex items-center gap-4 p-3 bg-surface-2 rounded-lg text-sm"><span className="text-gray-500 font-mono w-20">{h.dt}</span><span className="text-brand-400 w-16">{h.equip}</span><span className="text-gray-300 flex-1">{h.atividade}</span><span className="text-gray-500">{h.duracao}</span></div>)}</div>
    </div>
  </div>)
}