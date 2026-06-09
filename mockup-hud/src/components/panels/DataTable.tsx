import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, Download, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, Filter, ChevronDown, Check, X } from 'lucide-react'
import Panel from './Panel'

interface Column { key: string; label: string; render?: (row: any) => any; sortable?: boolean; width?: string; filterable?: boolean }
interface Props {
  columns: Column[]
  data: any[]
  title?: string
  subtitle?: string
  onAdd?: () => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onRowClick?: (row: any) => void
  addLabel?: string
  status?: 'ok' | 'warn' | 'crit' | 'info' | 'neutral'
  pageSize?: number
}

// Excel-style column filter dropdown
function ColumnFilter({ column, data, activeFilter, onFilter, onClose }: {
  column: Column
  data: any[]
  activeFilter: Set<string> | null
  onFilter: (values: Set<string> | null) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')

  // Get unique values for this column
  const uniqueValues = useMemo(() => {
    const vals = new Set<string>()
    data.forEach(row => {
      const v = row[column.key]
      if (v !== null && v !== undefined) vals.add(String(v))
    })
    return Array.from(vals).sort()
  }, [data, column.key])

  const filteredValues = uniqueValues.filter(v => v.toLowerCase().includes(search.toLowerCase()))

  const [selected, setSelected] = useState<Set<string>>(activeFilter || new Set(uniqueValues))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const toggleValue = (v: string) => {
    const next = new Set(selected)
    if (next.has(v)) next.delete(v); else next.add(v)
    setSelected(next)
  }

  const selectAll = () => setSelected(new Set(uniqueValues))
  const clearAll = () => setSelected(new Set())

  const apply = () => {
    if (selected.size === uniqueValues.length) onFilter(null) // all selected = no filter
    else onFilter(selected)
    onClose()
  }

  return (
    <div ref={ref} className="absolute top-full left-0 mt-1 z-[9999] min-w-[180px] max-w-[260px] bg-hud-panel border border-hud-border rounded-lg shadow-2xl overflow-hidden" style={{ zIndex: 99999 }}>
      {/* Search */}
      <div className="p-2 border-b border-hud-border/50">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-dim" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-7 pr-2 py-1 bg-hud-bg border border-hud-border rounded text-[10px] font-mono text-gray-300 placeholder:text-dim focus:outline-none focus:border-brand-600" />
        </div>
      </div>
      {/* Select all / Clear */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-hud-border/30">
        <button onClick={selectAll} className="text-[9px] font-mono text-brand-400 hover:underline">Todos</button>
        <button onClick={clearAll} className="text-[9px] font-mono text-dim hover:text-crit">Limpar</button>
      </div>
      {/* Values list */}
      <div className="overflow-y-auto p-1" style={{ maxHeight: Math.min(filteredValues.length * 28 + 8, 200) }}>
        {filteredValues.map(v => (
          <label key={v} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.03] cursor-pointer">
            <input type="checkbox" checked={selected.has(v)} onChange={() => toggleValue(v)} className="w-3 h-3 rounded border-hud-border accent-brand-400" />
            <span className="text-[10px] font-mono text-gray-300 truncate">{v || '(vazio)'}</span>
          </label>
        ))}
        {filteredValues.length === 0 && <div className="text-[9px] text-dim text-center py-2">Sem resultados</div>}
      </div>
      {/* Apply */}
      <div className="p-2 border-t border-hud-border/50 flex justify-end gap-1.5">
        <button onClick={onClose} className="px-2 py-1 text-[9px] font-mono text-dim border border-hud-border rounded hover:bg-white/[0.03]">Cancelar</button>
        <button onClick={apply} className="px-2 py-1 text-[9px] font-mono text-brand-400 border border-brand-600/40 bg-brand-600/10 rounded hover:bg-brand-600/20">Aplicar</button>
      </div>
    </div>
  )
}

export default function DataTable({ columns, data, title, subtitle, onAdd, onEdit, onDelete, onRowClick, addLabel = 'Novo', status = 'neutral', pageSize = 10 }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({})
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let d = data
    // Global search
    if (search) {
      d = d.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    }
    // Column filters
    Object.entries(columnFilters).forEach(([key, values]) => {
      d = d.filter(row => values.has(String(row[key])))
    })
    // Sort
    if (sortKey) {
      d = [...d].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''))
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return d
  }, [data, search, sortKey, sortDir, columnFilters])

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const setColumnFilter = (key: string, values: Set<string> | null) => {
    setColumnFilters(prev => {
      const next = { ...prev }
      if (values === null) delete next[key]
      else next[key] = values
      return next
    })
    setPage(0)
  }

  const activeFilterCount = Object.keys(columnFilters).length

  // Compute unique value count per column (to hide useless filters)
  const colUniqueCount = useMemo(() => {
    const counts: Record<string, number> = {}
    columns.forEach(col => {
      const vals = new Set(data.map(row => String(row[col.key] ?? '')))
      counts[col.key] = vals.size
    })
    return counts
  }, [data, columns])

  return (
    <Panel title={title} subtitle={subtitle || filtered.length + ' registros'} status={status} noPad className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-hud-border/50 flex-shrink-0 gap-2 flex-wrap">
        <div className="relative flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="Filtrar..."
            className="pl-8 pr-3 py-1.5 bg-hud-bg border border-hud-border rounded-md text-xs font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-brand-600 w-44 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button onClick={() => setColumnFilters({})} className="flex items-center gap-1 px-2 py-1 text-[9px] font-mono text-amber-400 border border-amber-400/30 bg-amber-400/5 rounded-md hover:bg-amber-400/10">
              <X className="w-3 h-3" />{activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''}
            </button>
          )}
          <button className="p-1.5 rounded hover:bg-white/5 text-dim" title="Exportar"><Download className="w-4 h-4" /></button>
          {onAdd && <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase tracking-wider hover:bg-brand-600/30 hover:shadow-glow-sm transition-all"><Plus className="w-3.5 h-3.5" />{addLabel}</button>}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] font-mono">
          <thead className="sticky top-0 z-20 bg-hud-panel">
            <tr className="border-b border-hud-border">
              {columns.map(col => (
                <th key={col.key} className="relative text-left px-3 py-2 text-[9px] uppercase tracking-wider text-dim font-medium select-none" style={col.width ? { width: col.width } : undefined}>
                  <div className="flex items-center gap-1">
                    {/* Sort button */}
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-brand-400 transition-colors">
                      <span>{col.label}</span>
                      {sortKey === col.key ? (
                        <span className="text-brand-400 text-[8px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
                      )}
                    </button>
                    {/* Filter button — only show if column has >1 unique value */}
                    {colUniqueCount[col.key] > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === col.key ? null : col.key) }}
                        className={`p-0.5 rounded transition-all ${columnFilters[col.key] ? 'text-amber-400 bg-amber-400/10' : 'text-dim/50 hover:text-dim'}`}
                        title={`Filtrar ${col.label}`}
                      >
                        <Filter className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  {/* Filter dropdown */}
                  {openFilter === col.key && (
                    <ColumnFilter
                      column={col}
                      data={data}
                      activeFilter={columnFilters[col.key] || null}
                      onFilter={(values) => setColumnFilter(col.key, values)}
                      onClose={() => setOpenFilter(null)}
                    />
                  )}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="w-20 px-3 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Filter className="w-6 h-6 text-dim/50" />
                    <p className="text-[11px] text-dim font-mono">Nenhum registro encontrado</p>
                    {activeFilterCount > 0 && (
                      <button onClick={() => { setColumnFilters({}); setSearch('') }} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-brand-400 border border-brand-600/40 bg-brand-600/10 rounded-md hover:bg-brand-600/20 transition-all">
                        <X className="w-3 h-3" />Limpar filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-hud-border/30 transition-colors hover:bg-brand-600/[0.03] ${onRowClick ? 'cursor-pointer' : ''}`}>
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2 text-gray-300">{col.render ? col.render(row) : row[col.key]}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && <button onClick={(e)=>{e.stopPropagation();onEdit(row)}} className="p-1 rounded hover:bg-brand-600/20 text-dim hover:text-brand-400 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>}
                      {onDelete && <button onClick={(e)=>{e.stopPropagation();onDelete(row)}} className="p-1 rounded hover:bg-crit/10 text-dim hover:text-crit transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-hud-border/50 flex-shrink-0">
          <span className="text-[9px] text-dim font-mono">{filtered.length} resultados</span>
          <div className="flex items-center gap-1">
            <button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="p-1 rounded hover:bg-white/5 disabled:opacity-30 text-dim"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-[9px] font-mono text-dim px-2">{page+1}/{totalPages}</span>
            <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)} className="p-1 rounded hover:bg-white/5 disabled:opacity-30 text-dim"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}
    </Panel>
  )
}
