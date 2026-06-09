import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { AlertTriangle } from 'lucide-react'

const init = [
  { id: 1, nome: 'Turno A — Diurno', hora_inicio: '06:00', hora_fim: '14:00', cruza_meia_noite: false, tipo_turno: 'DIURNO' as const, cor: '#22c55e' },
  { id: 2, nome: 'Turno B — Vespertino', hora_inicio: '14:00', hora_fim: '22:00', cruza_meia_noite: false, tipo_turno: 'DIURNO' as const, cor: '#2563eb' },
  { id: 3, nome: 'Turno C — Noturno', hora_inicio: '22:00', hora_fim: '06:00', cruza_meia_noite: true, tipo_turno: 'NOTURNO' as const, cor: '#a855f7' },
]
const empty = { nome: '', hora_inicio: '', hora_fim: '', cruza_meia_noite: false, tipo_turno: 'DIURNO', cor: '#22c55e' }

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function checkOverlap(turnos: typeof init): { a: string; b: string }[] {
  const overlaps: { a: string; b: string }[] = []
  for (let i = 0; i < turnos.length; i++) {
    for (let j = i + 1; j < turnos.length; j++) {
      const a = turnos[i], b = turnos[j]
      const aStart = timeToMin(a.hora_inicio), aEnd = timeToMin(a.hora_fim)
      const bStart = timeToMin(b.hora_inicio), bEnd = timeToMin(b.hora_fim)
      // Simple overlap check (non-wrapping)
      if (!a.cruza_meia_noite && !b.cruza_meia_noite) {
        if (aStart < bEnd && bStart < aEnd) overlaps.push({ a: a.nome, b: b.nome })
      }
    }
  }
  return overlaps
}

export default function Turnos() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k: string, v: any) => {
    const next = { ...form, [k]: v }
    // auto-detect cruza meia noite
    if (k === 'hora_inicio' || k === 'hora_fim') {
      if (next.hora_inicio && next.hora_fim) {
        next.cruza_meia_noite = timeToMin(next.hora_inicio) >= timeToMin(next.hora_fim)
      }
    }
    setForm(next)
  }

  const save = () => {
    if (!form.nome || !form.hora_inicio || !form.hora_fim) { toast('Campos obrigatórios', 'error'); return }
    if (editing) { setData(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r)); toast('Turno atualizado') }
    else { setData(p => [...p, { id: Date.now(), ...form }]); toast('Turno criado') }
    setOpen(false)
  }

  const overlaps = checkOverlap(data)

  const columns = [
    { key: 'nome', label: 'Nome', render: (r: any) => (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: r.cor }}></div>
        <span className="text-brand-400 font-bold">{r.nome}</span>
      </div>
    )},
    { key: 'hora_inicio', label: 'Início', render: (r: any) => <span className="font-mono">{r.hora_inicio}</span> },
    { key: 'hora_fim', label: 'Fim', render: (r: any) => <span className="font-mono">{r.hora_fim}</span> },
    { key: 'tipo_turno', label: 'Tipo', render: (r: any) => (
      <span className={`px-2 py-0.5 rounded text-[10px] border ${r.tipo_turno === 'NOTURNO' ? 'bg-info/10 text-info border-info/20' : r.tipo_turno === 'VARIAVEL' ? 'bg-warn/10 text-warn border-warn/20' : 'bg-ok/10 text-ok border-ok/20'}`}>{r.tipo_turno}</span>
    )},
    { key: 'cruza_meia_noite', label: 'Cruza 00:00', render: (r: any) => (
      <span className={'px-2 py-0.5 rounded text-[10px] border ' + (r.cruza_meia_noite ? 'bg-warn/10 text-warn border-warn/20' : 'bg-white/5 text-dim border-hud-border')}>{r.cruza_meia_noite ? 'SIM' : 'NÃO'}</span>
    )},
  ]

  return (<>
    {/* 24h Timeline Visual */}
    <div className="bg-hud-panel border border-hud-border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Timeline 24h</h3>
        {overlaps.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-warn">
            <AlertTriangle className="w-3 h-3" />
            {overlaps.length} sobreposição(ões)
          </div>
        )}
      </div>
      {/* Hour markers */}
      <div className="relative">
        <div className="flex justify-between text-[9px] font-mono text-dim mb-1">
          {Array.from({ length: 13 }, (_, i) => <span key={i}>{String(i * 2).padStart(2, '0')}:00</span>)}
        </div>
        {/* Timeline bar */}
        <div className="relative h-8 bg-hud-bg border border-hud-border rounded-md overflow-hidden">
          {data.map(turno => {
            const startMin = timeToMin(turno.hora_inicio)
            const endMin = timeToMin(turno.hora_fim)
            const totalMin = 24 * 60

            if (turno.cruza_meia_noite) {
              // Two segments
              const seg1Left = (startMin / totalMin) * 100
              const seg1Width = ((totalMin - startMin) / totalMin) * 100
              const seg2Width = (endMin / totalMin) * 100
              return (
                <span key={turno.id}>
                  <div className="absolute top-1 bottom-1 rounded-sm opacity-80 flex items-center justify-center"
                    style={{ left: `${seg1Left}%`, width: `${seg1Width}%`, background: turno.cor }}>
                    <span className="text-[8px] font-mono text-white/90 truncate px-1">{turno.nome.split('—')[0]}</span>
                  </div>
                  <div className="absolute top-1 bottom-1 rounded-sm opacity-80 flex items-center justify-center"
                    style={{ left: '0%', width: `${seg2Width}%`, background: turno.cor }}>
                  </div>
                </span>
              )
            } else {
              const left = (startMin / totalMin) * 100
              const width = ((endMin - startMin) / totalMin) * 100
              return (
                <div key={turno.id} className="absolute top-1 bottom-1 rounded-sm opacity-80 flex items-center justify-center"
                  style={{ left: `${left}%`, width: `${width}%`, background: turno.cor }}>
                  <span className="text-[8px] font-mono text-white/90 truncate px-1">{turno.nome.split('—')[0]}</span>
                </div>
              )
            }
          })}
        </div>
      </div>

      {/* Overlap warnings */}
      {overlaps.length > 0 && (
        <div className="mt-3 space-y-1">
          {overlaps.map((o, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-warn/5 border border-warn/20 rounded text-[10px] text-warn">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>Sobreposição detectada: <b>{o.a}</b> ↔ <b>{o.b}</b></span>
            </div>
          ))}
        </div>
      )}
    </div>

    <DataTable columns={columns} data={data} title="Turnos" status="info"
      onAdd={() => { setForm(empty); setEditing(null); setOpen(true) }}
      onEdit={r => { setForm({ nome: r.nome, hora_inicio: r.hora_inicio, hora_fim: r.hora_fim, cruza_meia_noite: r.cruza_meia_noite, tipo_turno: r.tipo_turno, cor: r.cor }); setEditing(r); setOpen(true) }}
      onDelete={setDel} addLabel="Novo Turno" />

    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Turno' : 'Novo Turno'}
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome" value={form.nome} onChange={v => set('nome', v)} required placeholder="Turno A — Diurno" />
          <Select label="Tipo Turno" value={form.tipo_turno} onChange={v => set('tipo_turno', v)} options={[
            { value: 'DIURNO', label: 'Diurno' }, { value: 'NOTURNO', label: 'Noturno' }, { value: 'VARIAVEL', label: 'Variável' },
          ]} />
        </FormSection>
        <FormSection title="Horários">
          <FormGrid>
            <Input label="Hora Início" value={form.hora_inicio} onChange={v => set('hora_inicio', v)} required placeholder="06:00" type="time" />
            <Input label="Hora Fim" value={form.hora_fim} onChange={v => set('hora_fim', v)} required placeholder="14:00" type="time" />
          </FormGrid>
          <Toggle label="Cruza Meia-Noite" checked={form.cruza_meia_noite} onChange={v => set('cruza_meia_noite', v)} description="Calculado automaticamente com base nos horários" />
        </FormSection>
        <FormSection title="Visual">
          <ColorPicker label="Cor" value={form.cor} onChange={v => set('cor', v)} />
        </FormSection>
      </div>
    </Drawer>

    <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Turno removido'); setDel(null) }} title="Excluir Turno" message={'Excluir ' + (del?.nome || '') + '?'} confirmLabel="Excluir" />
  </>)
}
