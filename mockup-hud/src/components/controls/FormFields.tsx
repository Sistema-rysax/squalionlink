import { ReactNode } from 'react'

interface InputProps { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; disabled?: boolean }
export function Input({ label, value, onChange, type = 'text', required, placeholder, disabled }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-wider text-dim flex items-center gap-1">{label}{required && <span className="text-crit">*</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-sm text-gray-200 font-mono placeholder:text-gray-700 focus:outline-none focus:border-brand-600 focus:shadow-glow-sm transition-all disabled:opacity-40" />
    </div>
  )
}

interface SelectProps { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean }
export function Select({ label, value, onChange, options, required }: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-wider text-dim flex items-center gap-1">{label}{required && <span className="text-crit">*</span>}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-sm text-gray-200 font-mono focus:outline-none focus:border-brand-600 focus:shadow-glow-sm transition-all appearance-none">
        <option value="">Selecione...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

interface TextareaProps { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }
export function Textarea({ label, value, onChange, rows = 3, placeholder }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-wider text-dim">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-sm text-gray-200 font-mono placeholder:text-gray-700 focus:outline-none focus:border-brand-600 resize-none transition-all" />
    </div>
  )
}

interface ToggleProps { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }
export function Toggle({ label, checked, onChange, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div><span className="text-xs text-gray-300">{label}</span>{description && <p className="text-[10px] text-dim">{description}</p>}</div>
      <button onClick={() => onChange(!checked)} className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-brand-600' : 'bg-hud-border'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400 border-b border-hud-border pb-2">{title}</h4>
      {children}
    </div>
  )
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

interface ColorPickerProps { label: string; value: string; onChange: (v: string) => void }
export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const presets = ['#2563eb','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#6b7280']
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-wider text-dim">{label}</label>
      <div className="flex items-center gap-2">
        {presets.map(c => <button key={c} onClick={() => onChange(c)} className={`w-5 h-5 rounded-full border-2 transition-all ${value===c?'border-white scale-110':'border-transparent hover:border-gray-600'}`} style={{background:c}} />)}
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
      </div>
    </div>
  )
}