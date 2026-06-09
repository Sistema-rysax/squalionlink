import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, Download, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, Filter, ChevronDown, Check, X } from 'lucide-react'
import Panel from './Panel'
import { useT } from '../../contexts/LanguageContext'

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
  const t = useT()
  const [search, setSearch] = useState('')

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
    if (selected.size === uniqueValues.length) onFilter(null)
    else onFilter(selected)
    onClose()
  }

  return (
    <div ref={ref} className="absolute top-full left-0 mt-1 z-[9999] min-w-[200px] max-w-[280px] bg-hud-panel border border-hud-border rounded-xl shadow-2xl overflow-hidden animate-fadeIn" style={{ zIndex: 99999 }}>
      {/* Search */}
      <div className="p-2.5 border-b border-hud-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-dim" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.common.search} className="w-full pl-8 pr-2 py-1.5 bg-hud-bg border border-hud-border rounded-lg text-[10px] font-mono text-gray-300 placeholder:text-dim focus:outline-none focus:border-brand-600 transition-colors" />
        </div>
      </div>
      {/* Select all / Clear */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-hud-border/30">
        <button onClick={selectAll} className="text-[9px] font-mono text-brand-400 hover:underline">{t.common.selectAll}</button>
        <button onClick={clearAll} className="text-[9px] font-mono text-dim hover:text-gray-300">{t.common.clearAll}</button>
      </div>
      {/* Values list */}
      <div className="max-h-[200px] overflow-y-auto p-1.5">
        {filteredValues.length === 0 && <div className="text-[10px] text-dim text-center py-3">{t.common.noResults}</div>}
        {filteredValues.map(v => (
          <button key={v} onClick={()=>toggleValue(v)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selected.has(v) ? 'bg-brand-600 border-brand-600' : 'border-hud-border group-hover:border-brand-600/50'}`}>
              {selected.has(v) && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className="text-[10px] font-mono text-gray-300 truncate">{v}</span>
          </button>
        ))}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between px-2.5 py-2 border-t border-hud-border/50 bg-hud-bg/50">
        <span className="text-[9px] text-dim font-mono">{selected.size}/{uniqueValues.length} {t.filters.nSelected}</span>
        <button onClick={apply} className="px-3 py-1 text-[10px] font-mono font-medium text-brand-400 bg-brand-600/15 border border-brand-600/30 rounded-md hover:bg-brand-600/25 transition-all">{t.common.apply}</button>
      </div>
    </div>
  )
}

export default function DataTable({ columns, data, title, subtitle, onAdd, onEdit, onDelete, onRowClick, addLabel, status, pageSize = 10 }: Props) {
  const t = useT()
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState<string|null>(null)
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [page, setPage] = useState(0)
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({})
  const [openFilter, setOpenFilter] = useState<string|null>(null)

  // Apply search + column filters
  const filtered = useMemo(() => {
    let rows = data
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(r => columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(s)))
    }
    // Column filters
    Object.entries(columnFilters).forEach(([key, allowed]) => {
      rows = rows.filter(r => allowed.has(String(r[key] ?? '')))
    })
    return rows
  }, [data, search, columns, columnFilters])

  // Sort
  const sorted = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const va = a[sortCol] ?? '', vb = b[sortCol] ?? ''
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortCol, sortDir])

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  useEffect(() => { setPage(0) }, [search, columnFilters])

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const setFilter = (key: string, values: Set<string> | null) => {
    setColumnFilters(prev => {
      const next = { ...prev }
      if (values === null) delete next[key]
      else next[key] = values
      return next
    })
  }

  const activeFilterCount = Object.keys(columnFilters).length

  return (
    <Panel title={title} status={status} subtitle={subtitle} noPad className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-hud-border/30">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative max-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.dataTable.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-hud-bg border border-hud-border rounded-lg text-xs font-mono text-gray-300 placeholder:text-dim focus:outline-none focus:border-brand-600 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-gray-300"><X className="w-3 h-3" /></button>}
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-brand-400" />
              {Object.entries(columnFilters).map(([key, values]) => {
                const col = columns.find(c => c.key === key)
                return (
                  <div key={key} className="flex items-center gap-1 px-2 py-1 bg-brand-600/10 border border-brand-600/30 rounded-lg">
                    <span className="text-[9px] font-mono text-brand-400">{col?.label}: {values.size}</span>
                    <button onClick={() => setFilter(key, null)} className="text-brand-400 hover:text-white transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )
              })}
              <button onClick={() => setColumnFilters({})} className="text-[9px] font-mono text-dim hover:text-gray-300 underline">
                {t.filters.clearAll}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-dim border border-hud-border rounded-lg hover:text-gray-300 hover:border-brand-600/30 transition-all">
            <Download className="w-3.5 h-3.5" />{t.dataTable.export}
          </button>
          {onAdd && (
            <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-brand-400 bg-brand-600/15 border border-brand-600/40 rounded-lg hover:bg-brand-600/25 hover:shadow-glow-sm transition-all">
              <Plus className="w-3.5 h-3.5" />{addLabel || t.dataTable.addNew}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-hud-panel/95 backdrop-blur-sm z-10">
            <tr className="border-b border-hud-border/50">
              {columns.map(col => {
                const isFiltered = col.key in columnFilters
                return (
                  <th key={col.key} className="text-left px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-dim font-medium" style={{ width: col.width }}>
                    <div className="flex items-center gap-1.5 relative">
                      <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                        {col.label}
                        {sortCol === col.key && <ArrowUpDown className="w-3 h-3 text-brand-400" />}
                      </button>
                      {col.filterable !== false && (
                        <button onClick={() => setOpenFilter(openFilter === col.key ? null : col.key)}
                          className={`p-0.5 rounded transition-all ${isFiltered ? 'text-brand-400 bg-brand-600/15' : 'text-dim/50 hover:text-dim'}`}>
                          <Filter className="w-3 h-3" />
                        </button>
                      )}
                      {openFilter === col.key && (
                        <ColumnFilter column={col} data={data} activeFilter={columnFilters[col.key] || null} onFilter={v => setFilter(col.key, v)} onClose={() => setOpenFilter(null)} />
                      )}
                    </div>
                  </th>
                )
              })}
              {(onEdit || onDelete) && <th className="text-right px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-dim w-[100px]">{t.common.actions}</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="text-center py-12 text-dim text-xs font-mono">{t.dataTable.noResults}</td></tr>
            )}
            {paged.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-hud-border/20 hover:bg-white/[0.015] transition-colors cursor-pointer" onClick={() => onRowClick?.(row)}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-300 font-mono text-[11px]">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onEdit && <button onClick={e=>{e.stopPropagation();onEdit(row)}} className="p-1.5 rounded-md hover:bg-white/[0.05] text-dim hover:text-brand-400 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>}
                      {onDelete && <button onClick={e=>{e.stopPropagation();onDelete(row)}} className="p-1.5 rounded-md hover:bg-crit/10 text-dim hover:text-crit transition-all"><Trash2 className="w-3.5 h-3.5" /></button>}
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-hud-border/30">
          <span className="text-[10px] font-mono text-dim">
            {t.common.showing} {page * pageSize + 1}–{Math.min((page+1)*pageSize, sorted.length)} {t.common.of} {sorted.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0} className="p-1.5 rounded-md border border-hud-border text-dim hover:text-gray-300 disabled:opacity-30 transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
            {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
              const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i
              return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-md text-[10px] font-mono transition-all ${p === page ? 'bg-brand-600/20 text-brand-400 border border-brand-600/40' : 'text-dim hover:text-gray-300 border border-transparent hover:border-hud-border'}`}>{p+1}</button>
            })}
            <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1} className="p-1.5 rounded-md border border-hud-border text-dim hover:text-gray-300 disabled:opacity-30 transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}
    </Panel>
  )
}
