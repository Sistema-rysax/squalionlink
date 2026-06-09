import { useState } from 'react'
import { useT } from '../../contexts/LanguageContext'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { Plus, Trash2 } from 'lucide-react'

const fabricanteOptions = [
  { value: 'Caterpillar', label: 'Caterpillar' },
  { value: 'Komatsu', label: 'Komatsu' },
  { value: 'Atlas Copco', label: 'Atlas Copco' },
  { value: 'Liebherr', label: 'Liebherr' },
  { value: 'Volvo', label: 'Volvo' },
  { value: 'Hitachi', label: 'Hitachi' },
  { value: 'John Deere', label: 'John Deere' },
]

const grupoOptions = [
  { value: 'Caminhão Fora-Estrada', label: 'Caminhão Fora-Estrada' },
  { value: 'Escavadeira', label: 'Escavadeira' },
  { value: 'Motoniveladora', label: 'Motoniveladora' },
  { value: 'Trator Esteira', label: 'Trator Esteira' },
  { value: 'Perfuratriz', label: 'Perfuratriz' },
  { value: 'Carregadeira', label: 'Carregadeira' },
  { value: 'Caminhão Pipa', label: 'Caminhão Pipa' },
]

const tipoOpOptions = [
  { value: 'CARGA', label: 'Carga' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'APOIO', label: 'Apoio' },
  { value: 'TERRAPLANAGEM', label: 'Terraplanagem' },
]

interface Modelo {
  id: number
  nome: string
  tipo_operacao: string
  fabricante: string
  grupo: string
  capacidade_carga_ton: number
  volume_cacamba_m3: number
  capacidade_tanque_litros: number
  peso_operacional_kg: number
  potencia_hp: number
  velocidade_maxima_kmh: number
  consumo_referencia_lh: number
  qtd_eixos: number
}

const init: Modelo[] = [
  { id:1, nome:'777G', tipo_operacao:'TRANSPORTE', fabricante:'Caterpillar', grupo:'Caminhão Fora-Estrada', capacidade_carga_ton:98, volume_cacamba_m3:60, capacidade_tanque_litros:1140, peso_operacional_kg:160000, potencia_hp:1000, velocidade_maxima_kmh:61, consumo_referencia_lh:65, qtd_eixos:2 },
  { id:2, nome:'785D', tipo_operacao:'TRANSPORTE', fabricante:'Caterpillar', grupo:'Caminhão Fora-Estrada', capacidade_carga_ton:136, volume_cacamba_m3:86, capacidade_tanque_litros:1553, peso_operacional_kg:213000, potencia_hp:1450, velocidade_maxima_kmh:64, consumo_referencia_lh:82, qtd_eixos:2 },
  { id:3, nome:'PC5500', tipo_operacao:'CARGA', fabricante:'Komatsu', grupo:'Escavadeira', capacidade_carga_ton:0, volume_cacamba_m3:29, capacidade_tanque_litros:4500, peso_operacional_kg:520000, potencia_hp:2000, velocidade_maxima_kmh:3, consumo_referencia_lh:220, qtd_eixos:0 },
  { id:4, nome:'CAT 6060', tipo_operacao:'CARGA', fabricante:'Caterpillar', grupo:'Escavadeira', capacidade_carga_ton:0, volume_cacamba_m3:34, capacidade_tanque_litros:5800, peso_operacional_kg:600000, potencia_hp:2500, velocidade_maxima_kmh:2, consumo_referencia_lh:280, qtd_eixos:0 },
  { id:5, nome:'CAT 16M', tipo_operacao:'APOIO', fabricante:'Caterpillar', grupo:'Motoniveladora', capacidade_carga_ton:0, volume_cacamba_m3:0, capacidade_tanque_litros:416, peso_operacional_kg:24000, potencia_hp:275, velocidade_maxima_kmh:45, consumo_referencia_lh:28, qtd_eixos:3 },
  { id:6, nome:'CAT D10T', tipo_operacao:'TERRAPLANAGEM', fabricante:'Caterpillar', grupo:'Trator Esteira', capacidade_carga_ton:0, volume_cacamba_m3:0, capacidade_tanque_litros:1047, peso_operacional_kg:66000, potencia_hp:580, velocidade_maxima_kmh:12, consumo_referencia_lh:55, qtd_eixos:0 },
  { id:7, nome:'Atlas D65', tipo_operacao:'APOIO', fabricante:'Atlas Copco', grupo:'Perfuratriz', capacidade_carga_ton:0, volume_cacamba_m3:0, capacidade_tanque_litros:560, peso_operacional_kg:32000, potencia_hp:350, velocidade_maxima_kmh:4, consumo_referencia_lh:35, qtd_eixos:0 },
  { id:8, nome:'CAT 793F', tipo_operacao:'TRANSPORTE', fabricante:'Caterpillar', grupo:'Caminhão Fora-Estrada', capacidade_carga_ton:227, volume_cacamba_m3:129, capacidade_tanque_litros:3785, peso_operacional_kg:384000, potencia_hp:2650, velocidade_maxima_kmh:55, consumo_referencia_lh:145, qtd_eixos:2 },
]

// Compatibilidade mock
const initCompat = [
  { id:1, modelo_carga:'PC5500', modelo_transporte:'777G', qtd_passes:4, tempo_carga_seg:120 },
  { id:2, modelo_carga:'PC5500', modelo_transporte:'785D', qtd_passes:3, tempo_carga_seg:110 },
  { id:3, modelo_carga:'CAT 6060', modelo_transporte:'777G', qtd_passes:3, tempo_carga_seg:95 },
  { id:4, modelo_carga:'CAT 6060', modelo_transporte:'785D', qtd_passes:3, tempo_carga_seg:100 },
  { id:5, modelo_carga:'CAT 6060', modelo_transporte:'CAT 793F', qtd_passes:4, tempo_carga_seg:140 },
  { id:6, modelo_carga:'PC5500', modelo_transporte:'CAT 793F', qtd_passes:5, tempo_carga_seg:165 },
]

// Fator enchimento mock
const initFator = [
  { id:1, material:'Minério de Ferro', fator:0.85, carga_util_ton:83.3 },
  { id:2, material:'Estéril Compactado', fator:0.72, carga_util_ton:70.6 },
  { id:3, material:'Estéril Solto', fator:0.90, carga_util_ton:88.2 },
  { id:4, material:'Itabirito', fator:0.78, carga_util_ton:76.4 },
  { id:5, material:'Canga', fator:0.80, carga_util_ton:78.4 },
]

const emptyForm = {
  nome: '', tipo_operacao: 'TRANSPORTE', fabricante: '', grupo: '',
  capacidade_carga_ton: '', volume_cacamba_m3: '', capacidade_tanque_litros: '',
  peso_operacional_kg: '', potencia_hp: '', velocidade_maxima_kmh: '',
  consumo_referencia_lh: '', qtd_eixos: ''
}

export default function Modelos() {
  const t = useT()
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  // Inline tabs
  const [inlineTab, setInlineTab] = useState<'compatibilidade' | 'fator'>('compatibilidade')
  const [compatData, setCompatData] = useState(initCompat)
  const [fatorData, setFatorData] = useState(initFator)

  // Compat form
  const [compatForm, setCompatForm] = useState({ modelo_carga: '', modelo_transporte: '', qtd_passes: '', tempo_carga_seg: '' })
  const [fatorForm, setFatorForm] = useState({ material: '', fator: '', carga_util_ton: '' })

  const save = () => {
    if (!form.nome || !form.fabricante) { toast('Nome e Fabricante obrigatórios', 'error'); return }
    const numFields = {
      capacidade_carga_ton: +form.capacidade_carga_ton || 0,
      volume_cacamba_m3: +form.volume_cacamba_m3 || 0,
      capacidade_tanque_litros: +form.capacidade_tanque_litros || 0,
      peso_operacional_kg: +form.peso_operacional_kg || 0,
      potencia_hp: +form.potencia_hp || 0,
      velocidade_maxima_kmh: +form.velocidade_maxima_kmh || 0,
      consumo_referencia_lh: +form.consumo_referencia_lh || 0,
      qtd_eixos: +form.qtd_eixos || 0,
    }
    if (editing) {
      setData(p => p.map(r => r.id === editing.id ? { ...r, nome: form.nome, tipo_operacao: form.tipo_operacao, fabricante: form.fabricante, grupo: form.grupo, ...numFields } : r))
      toast('Modelo atualizado')
    } else {
      setData(p => [...p, { id: Date.now(), nome: form.nome, tipo_operacao: form.tipo_operacao, fabricante: form.fabricante, grupo: form.grupo, ...numFields }])
      toast('Modelo criado')
    }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({
      nome: r.nome, tipo_operacao: r.tipo_operacao, fabricante: r.fabricante, grupo: r.grupo,
      capacidade_carga_ton: String(r.capacidade_carga_ton), volume_cacamba_m3: String(r.volume_cacamba_m3),
      capacidade_tanque_litros: String(r.capacidade_tanque_litros), peso_operacional_kg: String(r.peso_operacional_kg),
      potencia_hp: String(r.potencia_hp), velocidade_maxima_kmh: String(r.velocidade_maxima_kmh),
      consumo_referencia_lh: String(r.consumo_referencia_lh), qtd_eixos: String(r.qtd_eixos)
    })
    setEditing(r)
    setOpen(true)
  }

  const addCompat = () => {
    if (!compatForm.modelo_carga || !compatForm.modelo_transporte) { toast('Modelos obrigatórios', 'error'); return }
    setCompatData(p => [...p, { id: Date.now(), modelo_carga: compatForm.modelo_carga, modelo_transporte: compatForm.modelo_transporte, qtd_passes: +compatForm.qtd_passes || 0, tempo_carga_seg: +compatForm.tempo_carga_seg || 0 }])
    setCompatForm({ modelo_carga: '', modelo_transporte: '', qtd_passes: '', tempo_carga_seg: '' })
    toast('Compatibilidade adicionada')
  }

  const addFator = () => {
    if (!fatorForm.material) { toast('Material obrigatório', 'error'); return }
    setFatorData(p => [...p, { id: Date.now(), material: fatorForm.material, fator: +fatorForm.fator || 0, carga_util_ton: +fatorForm.carga_util_ton || 0 }])
    setFatorForm({ material: '', fator: '', carga_util_ton: '' })
    toast('Fator adicionado')
  }

  const columns = [
    { key: 'nome', label: 'Nome', render: (r: any) => <span className="text-brand-400 font-bold">{r.nome}</span> },
    { key: 'fabricante', label: 'Fabricante' },
    { key: 'tipo_operacao', label: 'Tipo Operação', render: (r: any) => (
      <span className="px-2 py-0.5 rounded text-[10px] border" style={{
        background: r.tipo_operacao === 'CARGA' ? 'rgba(34,197,94,0.1)' : r.tipo_operacao === 'TRANSPORTE' ? 'rgba(37,99,235,0.1)' : r.tipo_operacao === 'TERRAPLANAGEM' ? 'rgba(245,158,11,0.1)' : 'rgba(107,114,128,0.1)',
        borderColor: r.tipo_operacao === 'CARGA' ? 'rgba(34,197,94,0.2)' : r.tipo_operacao === 'TRANSPORTE' ? 'rgba(37,99,235,0.2)' : r.tipo_operacao === 'TERRAPLANAGEM' ? 'rgba(245,158,11,0.2)' : 'rgba(107,114,128,0.2)',
        color: r.tipo_operacao === 'CARGA' ? '#22c55e' : r.tipo_operacao === 'TRANSPORTE' ? '#60a5fa' : r.tipo_operacao === 'TERRAPLANAGEM' ? '#f59e0b' : '#9ca3af'
      }}>{r.tipo_operacao}</span>
    )},
    { key: 'grupo', label: 'Grupo' },
    { key: 'capacidade_carga_ton', label: 'Carga (ton)', render: (r: any) => <span className="font-mono">{r.capacidade_carga_ton || '—'}</span> },
    { key: 'potencia_hp', label: 'Potência (hp)', render: (r: any) => <span className="font-mono">{r.potencia_hp.toLocaleString()}</span> },
    { key: 'consumo_referencia_lh', label: 'Consumo (L/h)', render: (r: any) => <span className="font-mono">{r.consumo_referencia_lh}</span> },
  ]

  const modeloCargaOptions = data.filter(m => m.tipo_operacao === 'CARGA').map(m => ({ value: m.nome, label: m.nome }))
  const modeloTranspOptions = data.filter(m => m.tipo_operacao === 'TRANSPORTE').map(m => ({ value: m.nome, label: m.nome }))

  return (<>
    <DataTable
      columns={columns}
      data={data}
      title={t.navSub.models}
      subtitle={`${data.length} modelos cadastrados`}
      status="info"
      onAdd={() => { setForm(emptyForm); setEditing(null); setOpen(true) }}
      onEdit={openEdit}
      onDelete={setDel}
      addLabel={t.common.add + ' ' + t.navSub.models}
    />

    {/* Inline Tabs Section */}
    <div className="mt-4 bg-hud-panel border border-hud-border rounded-lg p-4">
      <div className="flex gap-1 border-b border-hud-border mb-4">
        <button onClick={() => setInlineTab('compatibilidade')} className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all ${inlineTab === 'compatibilidade' ? 'border-brand-400 text-brand-400' : 'border-transparent text-dim hover:text-gray-300'}`}>Compatibilidade Carga × Transporte</button>
        <button onClick={() => setInlineTab('fator')} className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all ${inlineTab === 'fator' ? 'border-brand-400 text-brand-400' : 'border-transparent text-dim hover:text-gray-300'}`}>Fator de Enchimento</button>
      </div>

      {inlineTab === 'compatibilidade' && (
        <div className="space-y-3">
          <div className="bg-hud-bg border border-hud-border rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-hud-border bg-black/20">
                  <th className="px-3 py-2 text-left font-mono text-dim uppercase">Modelo Carga</th>
                  <th className="px-3 py-2 text-left font-mono text-dim uppercase">Modelo Transporte</th>
                  <th className="px-3 py-2 text-left font-mono text-dim uppercase">Qtd. Passes</th>
                  <th className="px-3 py-2 text-left font-mono text-dim uppercase">Tempo Carga (seg)</th>
                  <th className="px-3 py-2 text-right font-mono text-dim uppercase">Ação</th>
                </tr>
              </thead>
              <tbody>
                {compatData.map(c => (
                  <tr key={c.id} className="border-b border-hud-border/50 hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-brand-400 font-mono">{c.modelo_carga}</td>
                    <td className="px-3 py-2 text-gray-200 font-mono">{c.modelo_transporte}</td>
                    <td className="px-3 py-2 font-mono text-gray-300">{c.qtd_passes}</td>
                    <td className="px-3 py-2 font-mono text-gray-300">{c.tempo_carga_seg}s</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => setCompatData(p => p.filter(x => x.id !== c.id))} className="p-1 text-crit/60 hover:text-crit transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1"><Select label="Mod. Carga" value={compatForm.modelo_carga} onChange={v => setCompatForm(p => ({ ...p, modelo_carga: v }))} options={modeloCargaOptions} /></div>
            <div className="flex-1"><Select label="Mod. Transporte" value={compatForm.modelo_transporte} onChange={v => setCompatForm(p => ({ ...p, modelo_transporte: v }))} options={modeloTranspOptions} /></div>
            <div className="w-24"><Input label="Passes" value={compatForm.qtd_passes} onChange={v => setCompatForm(p => ({ ...p, qtd_passes: v }))} type="number" placeholder="4" /></div>
            <div className="w-28"><Input label="Tempo (s)" value={compatForm.tempo_carga_seg} onChange={v => setCompatForm(p => ({ ...p, tempo_carga_seg: v }))} type="number" placeholder="120" /></div>
            <button onClick={addCompat} className="mb-0.5 flex items-center gap-1 px-3 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase hover:bg-brand-600/30 transition-all"><Plus className="w-3 h-3" />Add</button>
          </div>
        </div>
      )}

      {inlineTab === 'fator' && (
        <div className="space-y-3">
          <div className="bg-hud-bg border border-hud-border rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-hud-border bg-black/20">
                  <th className="px-3 py-2 text-left font-mono text-dim uppercase">Material</th>
                  <th className="px-3 py-2 text-left font-mono text-dim uppercase">Fator Enchimento</th>
                  <th className="px-3 py-2 text-left font-mono text-dim uppercase">Carga Útil (ton)</th>
                  <th className="px-3 py-2 text-right font-mono text-dim uppercase">Ação</th>
                </tr>
              </thead>
              <tbody>
                {fatorData.map(f => (
                  <tr key={f.id} className="border-b border-hud-border/50 hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-gray-200">{f.material}</td>
                    <td className="px-3 py-2 font-mono text-brand-400">{f.fator.toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono text-gray-300">{f.carga_util_ton.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => setFatorData(p => p.filter(x => x.id !== f.id))} className="p-1 text-crit/60 hover:text-crit transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1"><Input label="Material" value={fatorForm.material} onChange={v => setFatorForm(p => ({ ...p, material: v }))} placeholder="Minério de Ferro" /></div>
            <div className="w-28"><Input label="Fator" value={fatorForm.fator} onChange={v => setFatorForm(p => ({ ...p, fator: v }))} type="number" placeholder="0.85" /></div>
            <div className="w-32"><Input label="Carga Útil (ton)" value={fatorForm.carga_util_ton} onChange={v => setFatorForm(p => ({ ...p, carga_util_ton: v }))} type="number" placeholder="83.3" /></div>
            <button onClick={addFator} className="mb-0.5 flex items-center gap-1 px-3 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase hover:bg-brand-600/30 transition-all"><Plus className="w-3 h-3" />Add</button>
          </div>
        </div>
      )}
    </div>

    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Modelo' : 'Novo Modelo'} subtitle={editing?.nome}
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300 transition-colors">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid>
            <Input label="Nome" value={form.nome} onChange={v => set('nome', v)} required placeholder="777G" />
            <Select label="Fabricante" value={form.fabricante} onChange={v => set('fabricante', v)} options={fabricanteOptions} required />
          </FormGrid>
          <FormGrid>
            <Select label="Tipo Operação" value={form.tipo_operacao} onChange={v => set('tipo_operacao', v)} options={tipoOpOptions} />
            <Select label="Grupo" value={form.grupo} onChange={v => set('grupo', v)} options={grupoOptions} />
          </FormGrid>
        </FormSection>

        <FormSection title="Capacidades">
          <FormGrid>
            <Input label="Capacidade Carga (ton)" value={form.capacidade_carga_ton} onChange={v => set('capacidade_carga_ton', v)} type="number" placeholder="98" />
            <Input label="Volume Caçamba (m³)" value={form.volume_cacamba_m3} onChange={v => set('volume_cacamba_m3', v)} type="number" placeholder="60" />
          </FormGrid>
          <FormGrid>
            <Input label="Capacidade Tanque (L)" value={form.capacidade_tanque_litros} onChange={v => set('capacidade_tanque_litros', v)} type="number" placeholder="1140" />
            <Input label="Peso Operacional (kg)" value={form.peso_operacional_kg} onChange={v => set('peso_operacional_kg', v)} type="number" placeholder="160000" />
          </FormGrid>
        </FormSection>

        <FormSection title="Performance">
          <FormGrid>
            <Input label="Potência (hp)" value={form.potencia_hp} onChange={v => set('potencia_hp', v)} type="number" placeholder="1000" />
            <Input label="Velocidade Máx (km/h)" value={form.velocidade_maxima_kmh} onChange={v => set('velocidade_maxima_kmh', v)} type="number" placeholder="61" />
          </FormGrid>
          <FormGrid>
            <Input label="Consumo Ref. (L/h)" value={form.consumo_referencia_lh} onChange={v => set('consumo_referencia_lh', v)} type="number" placeholder="65" />
            <Input label="Qtd. Eixos" value={form.qtd_eixos} onChange={v => set('qtd_eixos', v)} type="number" placeholder="2" />
          </FormGrid>
        </FormSection>
      </div>
    </Drawer>

    <ConfirmDialog
      open={!!del}
      onClose={() => setDel(null)}
      onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Modelo removido'); setDel(null) }}
      title="Excluir Modelo"
      message={`Confirma exclusão do modelo ${del?.nome || ''}?`}
      confirmLabel="Excluir"
    />
  </>)
}