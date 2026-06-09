import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea, FormSection, FormGrid, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { Plus, Trash2 } from 'lucide-react'

interface Trecho {
  id: number
  nome: string
  vel_max_seco: number
  vel_max_chuva: number
  sentido: string
}

interface Rotograma {
  id: number
  nome: string
  cor: string
  descricao: string
  trechos: Trecho[]
  qtd_equip_vinculados: number
  status: string
}

const initData: Rotograma[] = [
  {
    id: 1,
    nome: 'Rotograma Principal Mina Norte',
    cor: '#2563eb',
    descricao: 'Rota principal de transporte entre pit e britador primário. Utilizado pela frota de 777G e 785D.',
    qtd_equip_vinculados: 5,
    status: 'ATIVO',
    trechos: [
      { id: 1, nome: 'Acesso Pit → Rampa Principal', vel_max_seco: 40, vel_max_chuva: 30, sentido: 'IDA' },
      { id: 2, nome: 'Rampa Principal (subida)', vel_max_seco: 25, vel_max_chuva: 18, sentido: 'IDA' },
      { id: 3, nome: 'Pista Plana Nível 2', vel_max_seco: 50, vel_max_chuva: 35, sentido: 'AMBOS' },
      { id: 4, nome: 'Chegada Britador Primário', vel_max_seco: 15, vel_max_chuva: 12, sentido: 'IDA' },
      { id: 5, nome: 'Retorno Britador → Pit (vazio)', vel_max_seco: 45, vel_max_chuva: 32, sentido: 'VOLTA' },
    ]
  },
  {
    id: 2,
    nome: 'Rotograma Frota Pesada',
    cor: '#f59e0b',
    descricao: 'Rota para caminhões CAT 793F — pit fundo até pilha de estéril sul. Velocidades reduzidas pela inclinação.',
    qtd_equip_vinculados: 3,
    status: 'ATIVO',
    trechos: [
      { id: 6, nome: 'Pit Fundo → Rampa Sul', vel_max_seco: 30, vel_max_chuva: 22, sentido: 'IDA' },
      { id: 7, nome: 'Rampa Sul (subida 12%)', vel_max_seco: 20, vel_max_chuva: 15, sentido: 'IDA' },
      { id: 8, nome: 'Platô Intermediário', vel_max_seco: 40, vel_max_chuva: 28, sentido: 'AMBOS' },
      { id: 9, nome: 'Acesso Pilha Estéril', vel_max_seco: 25, vel_max_chuva: 18, sentido: 'IDA' },
      { id: 10, nome: 'Retorno Pilha → Pit Fundo', vel_max_seco: 35, vel_max_chuva: 25, sentido: 'VOLTA' },
    ]
  },
  {
    id: 3,
    nome: 'Rotograma Apoio / Serviços',
    cor: '#22c55e',
    descricao: 'Rota para veículos de apoio (motoniveladora, pipa, comboio) entre oficina e frentes de lavra.',
    qtd_equip_vinculados: 4,
    status: 'INATIVO',
    trechos: [
      { id: 11, nome: 'Oficina → Portaria Mina', vel_max_seco: 35, vel_max_chuva: 25, sentido: 'AMBOS' },
      { id: 12, nome: 'Portaria → Frente Lavra 01', vel_max_seco: 30, vel_max_chuva: 22, sentido: 'AMBOS' },
      { id: 13, nome: 'Perímetro Geral (pista secundária)', vel_max_seco: 25, vel_max_chuva: 18, sentido: 'AMBOS' },
    ]
  },
]

const emptyForm = { nome: '', cor: '#2563eb', descricao: '' }

const sentidoOptions = [
  { value: 'IDA', label: 'Ida' },
  { value: 'VOLTA', label: 'Volta' },
  { value: 'AMBOS', label: 'Ambos' },
]

export default function Rotograma() {
  const [data, setData] = useState(initData)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }))

  // Detail drawer
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRoto, setDetailRoto] = useState<Rotograma | null>(null)
  const [trechos, setTrechos] = useState<Trecho[]>([])

  // Trecho add form
  const [trechoForm, setTrechoForm] = useState({ nome: '', vel_max_seco: '', vel_max_chuva: '', sentido: 'AMBOS' })

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório', 'error'); return }
    if (editing) {
      setData(p => p.map(r => r.id === editing.id ? { ...r, nome: form.nome, cor: form.cor, descricao: form.descricao } : r))
      toast('Rotograma atualizado')
    } else {
      setData(p => [...p, { id: Date.now(), nome: form.nome, cor: form.cor, descricao: form.descricao, trechos: [], qtd_equip_vinculados: 0, status: 'ATIVO' }])
      toast('Rotograma criado')
    }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({ nome: r.nome, cor: r.cor, descricao: r.descricao })
    setEditing(r)
    setOpen(true)
  }

  const openDetail = (r: Rotograma) => {
    setDetailRoto(r)
    setTrechos([...r.trechos])
    setDetailOpen(true)
  }

  const addTrecho = () => {
    if (!trechoForm.nome || !trechoForm.vel_max_seco) { toast('Nome e velocidade obrigatórios', 'error'); return }
    const newTrecho: Trecho = {
      id: Date.now(),
      nome: trechoForm.nome,
      vel_max_seco: +trechoForm.vel_max_seco || 0,
      vel_max_chuva: +trechoForm.vel_max_chuva || 0,
      sentido: trechoForm.sentido
    }
    setTrechos(p => [...p, newTrecho])
    // Update in main data
    if (detailRoto) {
      setData(prev => prev.map(r => r.id === detailRoto.id ? { ...r, trechos: [...r.trechos, newTrecho] } : r))
    }
    setTrechoForm({ nome: '', vel_max_seco: '', vel_max_chuva: '', sentido: 'AMBOS' })
    toast('Trecho adicionado')
  }

  const removeTrecho = (trechoId: number) => {
    setTrechos(p => p.filter(t => t.id !== trechoId))
    if (detailRoto) {
      setData(prev => prev.map(r => r.id === detailRoto.id ? { ...r, trechos: r.trechos.filter(t => t.id !== trechoId) } : r))
    }
    toast('Trecho removido')
  }

  const columns = [
    { key: 'nome', label: 'Nome', render: (r: any) => <button onClick={() => openDetail(r)} className="text-gray-200 font-medium hover:text-brand-400 transition-colors">{r.nome}</button> },
    { key: 'cor', label: 'Cor', render: (r: any) => <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: r.cor }}></div><span className="font-mono text-[10px] text-gray-400">{r.cor}</span></div>, width: '120px' },
    { key: 'trechos', label: 'Trechos', render: (r: any) => <span className="font-mono">{r.trechos.length}</span> },
    { key: 'qtd_equip_vinculados', label: 'Equip. Vinculados', render: (r: any) => <span className="font-mono">{r.qtd_equip_vinculados}</span> },
    { key: 'status', label: 'Status', render: (r: any) => (
      <div className="flex items-center gap-2">
        <div className={`led led-${r.status === 'ATIVO' ? 'ok' : 'crit'}`}></div>
        <span className={`px-2 py-0.5 rounded text-[10px] border ${r.status === 'ATIVO' ? 'bg-ok/10 text-ok border-ok/20' : 'bg-crit/10 text-crit border-crit/20'}`}>{r.status}</span>
      </div>
    )},
  ]

  return (<>
    <DataTable
      columns={columns}
      data={data}
      title="Rotogramas"
      subtitle={`${data.filter(d => d.status === 'ATIVO').length} ativos • ${data.reduce((acc, r) => acc + r.trechos.length, 0)} trechos totais`}
      status="ok"
      onAdd={() => { setForm(emptyForm); setEditing(null); setOpen(true) }}
      onEdit={openEdit}
      onDelete={setDel}
      onRowClick={openDetail}
      addLabel="Novo Rotograma"
    />

    {/* Create/Edit Drawer */}
    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Rotograma' : 'Novo Rotograma'} subtitle={editing?.nome}
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300 transition-colors">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome" value={form.nome} onChange={v => set('nome', v)} required placeholder="Rotograma Principal Mina Norte" />
          <ColorPicker label="Cor" value={form.cor} onChange={v => set('cor', v)} />
          <Textarea label="Descrição" value={form.descricao} onChange={v => set('descricao', v)} placeholder="Descrição do rotograma..." rows={4} />
        </FormSection>
      </div>
    </Drawer>

    {/* Detail Drawer - Trechos */}
    <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title={detailRoto?.nome || ''} subtitle="Configuração de Trechos" width="w-[680px]">
      <div className="space-y-4">
        {/* Roto info header */}
        <div className="flex items-center gap-3 bg-hud-bg border border-hud-border rounded-lg p-3">
          <div className="w-4 h-4 rounded-full border-2 border-white/30" style={{ background: detailRoto?.cor || '#2563eb' }}></div>
          <div className="flex-1">
            <p className="text-xs text-gray-400">{detailRoto?.descricao || 'Sem descrição'}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-dim font-mono block">EQUIP. VINCULADOS</span>
            <span className="font-mono text-brand-400">{detailRoto?.qtd_equip_vinculados || 0}</span>
          </div>
        </div>

        {/* Trechos table */}
        <div className="bg-hud-panel border border-hud-border rounded-lg overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-hud-border bg-black/20">
                <th className="px-3 py-2 text-left font-mono text-dim uppercase">#</th>
                <th className="px-3 py-2 text-left font-mono text-dim uppercase">Trecho</th>
                <th className="px-3 py-2 text-left font-mono text-dim uppercase">Vel. Seco (km/h)</th>
                <th className="px-3 py-2 text-left font-mono text-dim uppercase">Vel. Chuva (km/h)</th>
                <th className="px-3 py-2 text-left font-mono text-dim uppercase">Sentido</th>
                <th className="px-3 py-2 text-right font-mono text-dim uppercase">Ação</th>
              </tr>
            </thead>
            <tbody>
              {trechos.map((t, idx) => (
                <tr key={t.id} className="border-b border-hud-border/50 hover:bg-white/[0.02]">
                  <td className="px-3 py-2 font-mono text-dim">{idx + 1}</td>
                  <td className="px-3 py-2 text-gray-200">{t.nome}</td>
                  <td className="px-3 py-2 font-mono text-ok font-bold">{t.vel_max_seco}</td>
                  <td className="px-3 py-2 font-mono text-brand-400 font-bold">{t.vel_max_chuva}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${
                      t.sentido === 'IDA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      t.sentido === 'VOLTA' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-white/5 text-gray-400 border-hud-border'
                    }`}>{t.sentido}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => removeTrecho(t.id)} className="p-1 text-crit/60 hover:text-crit transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </td>
                </tr>
              ))}
              {trechos.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-dim text-xs">Nenhum trecho configurado</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add trecho inline form */}
        <div className="bg-hud-bg border border-hud-border rounded-lg p-3 space-y-3">
          <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Adicionar Trecho</h4>
          <div className="flex gap-2 items-end">
            <div className="flex-1"><Input label="Nome do Trecho" value={trechoForm.nome} onChange={v => setTrechoForm(p => ({ ...p, nome: v }))} placeholder="Rampa → Britador" /></div>
            <div className="w-24"><Input label="Vel. Seco" value={trechoForm.vel_max_seco} onChange={v => setTrechoForm(p => ({ ...p, vel_max_seco: v }))} type="number" placeholder="40" /></div>
            <div className="w-24"><Input label="Vel. Chuva" value={trechoForm.vel_max_chuva} onChange={v => setTrechoForm(p => ({ ...p, vel_max_chuva: v }))} type="number" placeholder="30" /></div>
            <div className="w-28"><Select label="Sentido" value={trechoForm.sentido} onChange={v => setTrechoForm(p => ({ ...p, sentido: v }))} options={sentidoOptions} /></div>
            <button onClick={addTrecho} className="mb-0.5 flex items-center gap-1 px-3 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase hover:bg-brand-600/30 transition-all"><Plus className="w-3 h-3" />Add</button>
          </div>
        </div>
      </div>
    </Drawer>

    <ConfirmDialog
      open={!!del}
      onClose={() => setDel(null)}
      onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Rotograma removido'); setDel(null) }}
      title="Excluir Rotograma"
      message={`Confirma exclusão do rotograma ${del?.nome || ''}?`}
      confirmLabel="Excluir"
    />
  </>)
}
