import { useState, useMemo } from 'react'
import { Search, Download, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import Panel from './Panel'

interface Column { key: string; label: string; render?: (row: any) => any; sortable?: boolean; width?: string }
interface Props {
  columns: Column[]
  data: any[]
  title?: string
  subtitle?: string
  onAdd?: () => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  addLabel?: string
  status?: 'ok' | 'warn' | 'crit' | 'info' | 'neutral'
  pageSize?: number
}

export default function DataTable({ columns, data, title, subtitle, onAdd, onEdit, onDelete, addLabel = 'Novo', status = 'neutral', pageSize = 10 }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let d = data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    if (sortKey) d = [...d].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const cmp = av > bv ? 1 : av < bv ? -1 : 0; return sortDir === 'asc' ? cmp : -cmp })
    return d
  }, [data, search, sortKey, sortDir])

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const toggleSort = (key: string) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }

  return (
    <Panel title={title} subtitle={subtitle || filtered.length + ' registros'} status={status} noPad className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-hud-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="Filtrar..."
            className="pl-8 pr-3 py-1.5 bg-hud-bg border border-hud-border rounded-md text-xs font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-brand-600 w-48 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded hover:bg-white/5 text-dim" title="Exportar"><Download className="w-4 h-4" /></button>
          {onAdd && <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase tracking-wider hover:bg-brand-600/30 hover:shadow-glow-sm transition-all"><Plus className="w-3.5 h-3.5" />{addLabel}</button>}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-hud-panel z-10">
            <tr className="border-b border-hud-border/50">
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && toggleSort(col.key)}
                  className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-dim cursor-pointer hover:text-gray-400 select-none" style={{width: col.width}}>
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && <ArrowUpDown className="w-3 h-3 text-brand-400" />}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && <th className="w-20"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-hud-border/20">
            {paged.map((row, i) => (
              <tr key={row.id || i} className="group hover:bg-white/[0.015] transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2.5 text-xs text-gray-300 font-mono">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && <button onClick={() => onEdit(row)} className="p-1 rounded hover:bg-white/5 text-dim hover:text-brand-400"><Edit2 className="w-3.5 h-3.5" /></button>}
                      {onDelete && <button onClick={() => onDelete(row)} className="p-1 rounded hover:bg-white/5 text-dim hover:text-crit"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && <div className="flex items-center justify-center py-12 text-xs text-dim font-mono">NENHUM REGISTRO</div>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-hud-border/50">
          <span className="text-[10px] font-mono text-dim">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded hover:bg-white/5 text-dim disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-[10px] font-mono text-gray-400 px-2">{page + 1}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1 rounded hover:bg-white/5 text-dim disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </Panel>
  )
}