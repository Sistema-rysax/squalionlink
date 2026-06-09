import { useState, useRef, useEffect } from 'react'
import { Plus, Search, ChevronDown, X } from 'lucide-react'
import Drawer from './Drawer'
import { Input, FormSection } from './FormFields'
import { toast } from './Toast'

interface Option { value: string; label: string }
interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  options: Option[]
  required?: boolean
  placeholder?: string
  canCreate?: boolean
  createLabel?: string
  createFields?: { key: string; label: string; required?: boolean }[]
  onCreated?: (item: Record<string, string>) => void
}

export default function SmartSelect({ label, value, onChange, options, required, placeholder = 'Selecione...', canCreate = false, createLabel, createFields, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<Record<string, string>>({})
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  const selected = options.find(o => o.value === value)

  const handleCreate = () => {
    const firstField = createFields?.[0]
    if (firstField && !createForm[firstField.key]) { toast('Preencha o campo obrigatório', 'error'); return }
    const newVal = createForm[createFields?.[0]?.key || 'nome'] || 'Novo'
    onCreated?.(createForm)
    onChange(newVal)
    toast(`"${newVal}" criado`)
    setCreateOpen(false)
    setCreateForm({})
    setOpen(false)
  }

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-left focus:outline-none focus:border-brand-500 transition-colors">
          <span className={selected ? 'text-gray-200' : 'text-gray-600'}>{selected?.label || placeholder}</span>
          <div className="flex items-center gap-1">
            {value && <button onClick={(e) => { e.stopPropagation(); onChange('') }} className="p-0.5 hover:bg-surface-3 rounded"><X className="w-3 h-3 text-gray-500" /></button>}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </button>

        {open && (
          <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-surface-1 border border-surface-3 rounded-lg shadow-xl max-h-60 overflow-hidden">
            <div className="p-2 border-b border-surface-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." autoFocus className="w-full pl-8 pr-3 py-1.5 bg-surface-2 border border-surface-4 rounded text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filtered.map(o => (
                <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); setSearch('') }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-surface-2 transition-colors ${o.value === value ? 'text-brand-400 bg-surface-2' : 'text-gray-300'}`}>
                  {o.label}
                </button>
              ))}
              {filtered.length === 0 && <p className="px-3 py-2 text-xs text-gray-600">Nenhum resultado</p>}
            </div>
            {canCreate && (
              <button onClick={() => { setCreateOpen(true); setOpen(false); setSearch('') }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-brand-400 hover:bg-surface-2 border-t border-surface-3 font-medium">
                <Plus className="w-3.5 h-3.5" /> {createLabel || 'Criar novo'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inline create drawer */}
      {canCreate && createFields && (
        <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title={createLabel || 'Criar Novo'}
          footer={<><button onClick={() => setCreateOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={handleCreate} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Criar</button></>}>
          <div className="space-y-4">
            <FormSection title="Dados">
              {createFields.map(f => (
                <Input key={f.key} label={f.label} value={createForm[f.key] || ''} onChange={v => setCreateForm(p => ({...p, [f.key]: v}))} required={f.required} />
              ))}
            </FormSection>
          </div>
        </Drawer>
      )}
    </div>
  )
}
