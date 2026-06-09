const variants: Record<string, string> = {
  ATIVO: 'bg-green-900/30 text-green-400 border-green-800/50',
  OPERANDO: 'bg-green-900/30 text-green-400 border-green-800/50',
  INATIVO: 'bg-gray-800/50 text-gray-500 border-gray-700/50',
  PARADO: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
  MANUTENCAO: 'bg-red-900/30 text-red-400 border-red-800/50',
  SEM_OPERADOR: 'bg-gray-800/50 text-gray-400 border-gray-700/50',
  DESLIGADO: 'bg-gray-900/50 text-gray-600 border-gray-800/50',
  ABERTA: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
  EM_ANDAMENTO: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
  CONCLUIDA: 'bg-green-900/30 text-green-400 border-green-800/50',
  PROGRAMADA: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
  PENDENTE: 'bg-orange-900/30 text-orange-400 border-orange-800/50',
  PRODUTIVA: 'bg-green-900/30 text-green-400 border-green-800/50',
  IMPRODUTIVA: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
  CORRETIVA: 'bg-red-900/30 text-red-400 border-red-800/50',
  PREVENTIVA: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
  PROPRIA: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
  TERCEIRIZADA: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
  ABERTO: 'bg-brand-900/30 text-brand-400 border-brand-800/50',
  FECHADO: 'bg-gray-800/50 text-gray-500 border-gray-700/50',
}

export default function StatusBadge({ status }: { status: string }) {
  const cls = variants[status] || 'bg-surface-3 text-gray-400 border-surface-4'
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>{status}</span>
}
