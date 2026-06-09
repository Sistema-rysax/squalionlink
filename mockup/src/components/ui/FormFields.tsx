import { Plus, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface InputProps {
  label: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  error?: string
  helper?: string
}

export function Input({ label, value, onChange, type = 'text', required, placeholder, disabled, error, helper }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-surface-2 border rounded-lg text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-surface-4 focus:border-brand-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-600">{helper}</p>}
    </div>
  )
}

interface TextareaProps extends Omit<InputProps, 'type'> { rows?: number }

export function Textarea({ label, value, onChange, required, placeholder, rows = 3, error }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500 resize-none ${error ? 'border-red-500' : ''}`}
      />
    </div>
  )
}

interface SelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  onAdd?: () => void
  addLabel?: string
}

export function Select({ label, value, onChange, options, required, placeholder = 'Selecione...', onAdd, addLabel = 'Novo' }: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-brand-500 appearance-none cursor-pointer"
          >
            <option value="" className="bg-surface-2">{placeholder}</option>
            {options.map(o => <option key={o.value} value={o.value} className="bg-surface-2">{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        {onAdd && (
          <button onClick={onAdd} className="px-2.5 py-2 bg-surface-3 border border-surface-4 rounded-lg hover:border-brand-500 transition-colors" title={addLabel}>
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  )
}

interface SwitchProps { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }

export function Switch({ label, checked, onChange, description }: SwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-gray-300">{label}</span>
        {description && <p className="text-xs text-gray-600">{description}</p>}
      </div>
      <button onClick={() => onChange(!checked)} className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-brand-600' : 'bg-surface-4'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

interface ColorPickerProps { label: string; value: string; onChange: (v: string) => void }
const presetColors = ['#22c55e','#3b82f6','#eab308','#ef4444','#a855f7','#f97316','#06b6d4','#ec4899','#6b7280','#14b8a6']

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        {presetColors.map(c => (
          <button key={c} onClick={() => onChange(c)} className={`w-6 h-6 rounded-full border-2 transition-transform ${value === c ? 'border-white scale-125' : 'border-transparent hover:scale-110'}`} style={{background: c}} />
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
      </div>
    </div>
  )
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-surface-3 pb-2">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}
