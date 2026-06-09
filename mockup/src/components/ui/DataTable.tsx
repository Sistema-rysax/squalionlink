import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Plus, Download, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'

export interface Column { key: string; label: string; sortable?: boolean; render?: (row: any) => React.ReactNode }
interface Props {
  columns: Column[]
  data: any[]
  title?: string
  onAdd?: () => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
  addLabel?: string
  actions?: boolean
}

export default function DataTable({ columns, data, title, onAdd, onEdit, onDelete, onView, addLabel = 'Novo', actions = true }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [page, setPage] = useState(0)
  const [openMenu, setOpenMenu] = useState<number|null>(null)
  const pageSize = 10

  const filtered = data.filter(row =>
    columns.some(col => String(row[col.key] || '').toLowerCase().includes(search.toLowerCase()))
  )

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0
    const av = a[sortKey], bv = b[sortKey]
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(sorted.length / pageSize)

  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-3">
        <div className="flex items-center gap-3">
          {title && <h3 className="text-sm font-medium text-gray-300">{title}</h3>}
          <span className="text-xs text-gray-600">{filtered.length} registros</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="Filtrar..." className="pl-8 pr-3 py-1.5 bg-surface-2 border border-surface-4 rounded-lg text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-brand-500 w-48" />
          </div>
          <button className="p-1.5 rounded-lg hover:bg-surface-2 text-gray-500" title="Exportar"><Download className="w-4 h-4" /></button>
          {onAdd && (
            <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> {addLabel}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-3">
              {columns.map(col => (
                <th key={col.key} onClick={() => { setSortKey(col.key); setSortDir(d => sortKey === col.key && d === 'asc' ? 'desc' : 'asc') }}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none">
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
              ))}
              {actions && (onEdit || onDelete || onView) && <th className="px-4 py-3 w-12"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-3">
            {paged.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-surface-2 transition-colors group">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-300">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && (onEdit || onDelete || onView) && (
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setOpenMenu(openMenu === i ? null : i)} className="p-1 rounded hover:bg-surface-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                    {openMenu === i && (
                      <div className="absolute right-4 top-10 bg-surface-2 border border-surface-4 rounded-lg shadow-xl py-1 z-20 min-w-[140px]" onMouseLeave={() => setOpenMenu(null)}>
                        {onView && <button onClick={() => { onView(row); setOpenMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-surface-3"><Eye className="w-3.5 h-3.5" /> Visualizar</button>}
                        {onEdit && <button onClick={() => { onEdit(row); setOpenMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-surface-3"><Pencil className="w-3.5 h-3.5" /> Editar</button>}
                        {onDelete && <button onClick={() => { onDelete(row); setOpenMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-surface-3"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-sm text-gray-600">Nenhum registro encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-3">
          <span className="text-xs text-gray-500">Página {page+1} de {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0} className="p-1 rounded hover:bg-surface-2 disabled:opacity-30"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page>=totalPages-1} className="p-1 rounded hover:bg-surface-2 disabled:opacity-30"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
