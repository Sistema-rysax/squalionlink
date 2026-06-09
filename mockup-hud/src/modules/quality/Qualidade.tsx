import { useState, useMemo } from 'react'
import { useT } from '../../contexts/LanguageContext'
import ReactECharts from 'echarts-for-react'
import { useChartTheme } from '../../hooks/useChartTheme'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Panel from '../../components/panels/Panel'
import { Input, Select, FormSection, FormGrid, Toggle } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

/* ─── Types ─── */
type PilhaStatus = 'ATIVA' | 'FECHADA' | 'EM_RECUPERACAO'

interface Elemento {
  id: number
  nome: string
  simbolo: string
  unidade: string
  meta_min: number
  meta_max: number
  cor: string
}

interface Movimentacao {
  dt: string
  peso_ton: number
  origem: string
  tipo: 'ENTRADA' | 'SAIDA'
}

interface QualidadeAtual {
  simbolo: string
  valor: number
}

interface Pilha {
  id: number
  nome: string
  material: string
  capacidade_ton: number
  volume_atual_ton: number
  status: PilhaStatus
  area_destino: string
  qualidade: QualidadeAtual[]
  movimentacoes: Movimentacao[]
  historico_fe: number[]
}

/* ─── Mock Data ─── */
const initElementos: Elemento[] = [
  { id: 1, nome: 'Ferro', simbolo: 'Fe', unidade: '%', meta_min: 58.0, meta_max: 67.0, cor: '#2563eb' },
  { id: 2, nome: 'Sílica', simbolo: 'SiO2', unidade: '%', meta_min: 0, meta_max: 8.0, cor: '#f59e0b' },
  { id: 3, nome: 'Alumina', simbolo: 'Al2O3', unidade: '%', meta_min: 0, meta_max: 4.0, cor: '#ef4444' },
  { id: 4, nome: 'Fósforo', simbolo: 'P', unidade: '%', meta_min: 0, meta_max: 0.06, cor: '#22c55e' },
  { id: 5, nome: 'Manganês', simbolo: 'Mn', unidade: '%', meta_min: 0, meta_max: 0.50, cor: '#8b5cf6' },
  { id: 6, nome: 'Umidade', simbolo: 'H2O', unidade: '%', meta_min: 0, meta_max: 10.0, cor: '#06b6d4' },
]

const initPilhas: Pilha[] = [
  {
    id: 1, nome: 'PL-ROM-01', material: 'ROM', capacidade_ton: 80000, volume_atual_ton: 45000,
    status: 'ATIVA', area_destino: 'Britagem Primária',
    qualidade: [
      { simbolo: 'Fe', valor: 58.2 }, { simbolo: 'SiO2', valor: 8.1 }, { simbolo: 'Al2O3', valor: 3.4 },
      { simbolo: 'P', valor: 0.045 }, { simbolo: 'Mn', valor: 0.32 }, { simbolo: 'H2O', valor: 7.8 }
    ],
    movimentacoes: [
      { dt: '09/06 14:30', peso_ton: 2500, origem: 'Frente Lavra Norte', tipo: 'ENTRADA' },
      { dt: '09/06 11:00', peso_ton: 1800, origem: 'Britagem Primária', tipo: 'SAIDA' },
      { dt: '09/06 08:15', peso_ton: 3200, origem: 'Frente Lavra Norte', tipo: 'ENTRADA' },
      { dt: '08/06 16:45', peso_ton: 2100, origem: 'Britagem Primária', tipo: 'SAIDA' },
      { dt: '08/06 10:20', peso_ton: 2800, origem: 'Frente Lavra Sul', tipo: 'ENTRADA' },
    ],
    historico_fe: [57.5, 57.8, 58.0, 58.2, 58.1, 58.4, 58.2, 58.6, 58.3, 58.2]
  },
  {
    id: 2, nome: 'PL-ROM-02', material: 'ROM', capacidade_ton: 60000, volume_atual_ton: 32000,
    status: 'ATIVA', area_destino: 'Britagem Primária',
    qualidade: [
      { simbolo: 'Fe', valor: 61.5 }, { simbolo: 'SiO2', valor: 5.8 }, { simbolo: 'Al2O3', valor: 2.1 },
      { simbolo: 'P', valor: 0.038 }, { simbolo: 'Mn', valor: 0.28 }, { simbolo: 'H2O', valor: 6.2 }
    ],
    movimentacoes: [
      { dt: '09/06 13:00', peso_ton: 1500, origem: 'Frente Lavra Sul', tipo: 'ENTRADA' },
      { dt: '09/06 09:30', peso_ton: 2000, origem: 'Britagem Primária', tipo: 'SAIDA' },
      { dt: '08/06 15:00', peso_ton: 2200, origem: 'Frente Lavra Sul', tipo: 'ENTRADA' },
      { dt: '08/06 11:00', peso_ton: 1800, origem: 'Britagem Primária', tipo: 'SAIDA' },
      { dt: '08/06 07:00', peso_ton: 2600, origem: 'Frente Lavra Norte', tipo: 'ENTRADA' },
    ],
    historico_fe: [60.8, 61.0, 61.2, 61.3, 61.5, 61.4, 61.6, 61.5, 61.3, 61.5]
  },
  {
    id: 3, nome: 'PL-ITB-01', material: 'Itabirito', capacidade_ton: 50000, volume_atual_ton: 28000,
    status: 'EM_RECUPERACAO', area_destino: 'Concentrador',
    qualidade: [
      { simbolo: 'Fe', valor: 42.8 }, { simbolo: 'SiO2', valor: 22.4 }, { simbolo: 'Al2O3', valor: 5.6 },
      { simbolo: 'P', valor: 0.052 }, { simbolo: 'Mn', valor: 0.45 }, { simbolo: 'H2O', valor: 9.1 }
    ],
    movimentacoes: [
      { dt: '09/06 12:00', peso_ton: 3000, origem: 'Frente Itabirito', tipo: 'ENTRADA' },
      { dt: '09/06 08:00', peso_ton: 1200, origem: 'Concentrador', tipo: 'SAIDA' },
      { dt: '08/06 14:00', peso_ton: 2500, origem: 'Frente Itabirito', tipo: 'ENTRADA' },
      { dt: '08/06 09:00', peso_ton: 1500, origem: 'Concentrador', tipo: 'SAIDA' },
      { dt: '07/06 16:00', peso_ton: 2800, origem: 'Frente Itabirito', tipo: 'ENTRADA' },
    ],
    historico_fe: [41.5, 42.0, 42.2, 42.5, 42.8, 42.6, 42.9, 42.8, 42.7, 42.8]
  },
  {
    id: 4, nome: 'PL-HEM-01', material: 'Hematita', capacidade_ton: 40000, volume_atual_ton: 18500,
    status: 'FECHADA', area_destino: 'Expedição Porto',
    qualidade: [
      { simbolo: 'Fe', valor: 66.1 }, { simbolo: 'SiO2', valor: 2.3 }, { simbolo: 'Al2O3', valor: 1.2 },
      { simbolo: 'P', valor: 0.028 }, { simbolo: 'Mn', valor: 0.18 }, { simbolo: 'H2O', valor: 4.5 }
    ],
    movimentacoes: [
      { dt: '07/06 16:00', peso_ton: 1500, origem: 'Concentrador', tipo: 'ENTRADA' },
      { dt: '07/06 10:00', peso_ton: 3000, origem: 'Expedição Porto', tipo: 'SAIDA' },
      { dt: '06/06 14:00', peso_ton: 2000, origem: 'Concentrador', tipo: 'ENTRADA' },
      { dt: '06/06 08:00', peso_ton: 2500, origem: 'Expedição Porto', tipo: 'SAIDA' },
      { dt: '05/06 15:00', peso_ton: 1800, origem: 'Concentrador', tipo: 'ENTRADA' },
    ],
    historico_fe: [65.5, 65.8, 66.0, 65.9, 66.1, 66.0, 66.2, 66.1, 66.0, 66.1]
  },
]

const statusConfig: Record<PilhaStatus, { color: string; label: string }> = {
  ATIVA: { color: 'ok', label: 'Ativa' },
  FECHADA: { color: 'crit', label: 'Fechada' },
  EM_RECUPERACAO: { color: 'warn', label: 'Em Recuperação' },
}

const materialOptions = [
  { value: 'ROM', label: 'ROM' },
  { value: 'Itabirito', label: 'Itabirito' },
  { value: 'Hematita', label: 'Hematita' },
  { value: 'Canga', label: 'Canga' },
]

const areaOptions = [
  { value: 'Britagem Primária', label: 'Britagem Primária' },
  { value: 'Concentrador', label: 'Concentrador' },
  { value: 'Expedição Porto', label: 'Expedição Porto' },
  { value: 'Pátio Estoque', label: 'Pátio Estoque' },
]

const emptyPilha = { nome: '', material: 'ROM', capacidade_ton: '', volume_atual_ton: '', status: 'ATIVA' as PilhaStatus, area_destino: '' }
const emptyElemento = { nome: '', simbolo: '', unidade: '%', meta_min: '', meta_max: '', cor: '#2563eb' }

export default function Qualidade() {
  const t = useT()
  const ct = useChartTheme()
  const [tab, setTab] = useState<'pilhas' | 'elementos' | 'analises'>('pilhas')

  // Pilhas state
  const [pilhas, setPilhas] = useState(initPilhas)
  const [pilhaDrawer, setPilhaDrawer] = useState(false)
  const [editingPilha, setEditingPilha] = useState<Pilha | null>(null)
  const [delPilha, setDelPilha] = useState<Pilha | null>(null)
  const [pilhaForm, setPilhaForm] = useState<any>(emptyPilha)
  const [detailPilha, setDetailPilha] = useState<Pilha | null>(null)

  // Elementos state
  const [elementos, setElementos] = useState(initElementos)
  const [elemDrawer, setElemDrawer] = useState(false)
  const [editingElem, setEditingElem] = useState<Elemento | null>(null)
  const [delElem, setDelElem] = useState<Elemento | null>(null)
  const [elemForm, setElemForm] = useState<any>(emptyElemento)

  /* ─── Pilha CRUD ─── */
  const openAddPilha = () => { setPilhaForm(emptyPilha); setEditingPilha(null); setPilhaDrawer(true) }
  const openEditPilha = (p: Pilha) => {
    setPilhaForm({ nome: p.nome, material: p.material, capacidade_ton: String(p.capacidade_ton), volume_atual_ton: String(p.volume_atual_ton), status: p.status, area_destino: p.area_destino })
    setEditingPilha(p); setPilhaDrawer(true)
  }
  const savePilha = () => {
    if (!pilhaForm.nome || !pilhaForm.material) { toast('Campos obrigatórios', 'error'); return }
    if (editingPilha) {
      setPilhas(p => p.map(r => r.id === editingPilha.id ? { ...r, nome: pilhaForm.nome, material: pilhaForm.material, capacidade_ton: +pilhaForm.capacidade_ton || r.capacidade_ton, volume_atual_ton: +pilhaForm.volume_atual_ton || r.volume_atual_ton, status: pilhaForm.status, area_destino: pilhaForm.area_destino } : r))
      toast('Pilha atualizada')
    } else {
      setPilhas(p => [...p, { id: Date.now(), nome: pilhaForm.nome, material: pilhaForm.material, capacidade_ton: +pilhaForm.capacidade_ton || 0, volume_atual_ton: +pilhaForm.volume_atual_ton || 0, status: pilhaForm.status as PilhaStatus, area_destino: pilhaForm.area_destino, qualidade: [], movimentacoes: [], historico_fe: [] }])
      toast('Pilha criada')
    }
    setPilhaDrawer(false)
  }
  const confirmDelPilha = () => { if (delPilha) { setPilhas(p => p.filter(r => r.id !== delPilha.id)); setDelPilha(null); toast('Pilha removida') } }

  /* ─── Elemento CRUD ─── */
  const openAddElem = () => { setElemForm(emptyElemento); setEditingElem(null); setElemDrawer(true) }
  const openEditElem = (e: Elemento) => {
    setElemForm({ nome: e.nome, simbolo: e.simbolo, unidade: e.unidade, meta_min: String(e.meta_min), meta_max: String(e.meta_max), cor: e.cor })
    setEditingElem(e); setElemDrawer(true)
  }
  const saveElem = () => {
    if (!elemForm.nome || !elemForm.simbolo) { toast('Campos obrigatórios', 'error'); return }
    if (editingElem) {
      setElementos(p => p.map(r => r.id === editingElem.id ? { ...r, nome: elemForm.nome, simbolo: elemForm.simbolo, unidade: elemForm.unidade, meta_min: +elemForm.meta_min || 0, meta_max: +elemForm.meta_max || 0, cor: elemForm.cor } : r))
      toast('Elemento atualizado')
    } else {
      setElementos(p => [...p, { id: Date.now(), nome: elemForm.nome, simbolo: elemForm.simbolo, unidade: elemForm.unidade, meta_min: +elemForm.meta_min || 0, meta_max: +elemForm.meta_max || 0, cor: elemForm.cor }])
      toast('Elemento criado')
    }
    setElemDrawer(false)
  }
  const confirmDelElem = () => { if (delElem) { setElementos(p => p.filter(r => r.id !== delElem.id)); setDelElem(null); toast('Elemento removido') } }

  /* ─── Charts ─── */
  const analisesChart = useMemo(() => {
    const activePilhas = pilhas.filter(p => p.status !== 'FECHADA')
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' as const, backgroundColor: ct.tooltip.bg, borderColor: ct.tooltip.border, textStyle: { color: ct.tooltip.text, fontFamily: 'JetBrains Mono', fontSize: 11 } },
      legend: { bottom: 0, textStyle: { color: ct.legend.text, fontSize: 10 } },
      grid: { top: 40, right: 30, bottom: 50, left: 60 },
      xAxis: { type: 'category' as const, data: activePilhas.map(p => p.nome), axisLabel: { color: ct.axis.label, fontSize: 10, fontFamily: 'JetBrains Mono' }, axisLine: { lineStyle: { color: ct.axis.line } } },
      yAxis: { type: 'value' as const, name: '%', axisLabel: { color: ct.axis.label, fontSize: 10, fontFamily: 'JetBrains Mono' }, splitLine: { lineStyle: { color: ct.axis.split, type: 'dashed' as const } } },
      series: [
        ...elementos.slice(0, 4).map(elem => ({
          name: elem.simbolo,
          type: 'bar' as const,
          data: activePilhas.map(p => p.qualidade.find(q => q.simbolo === elem.simbolo)?.valor || 0),
          itemStyle: { color: elem.cor },
          barMaxWidth: 20,
        })),
        ...elementos.slice(0, 4).map(elem => ({
          name: elem.simbolo + ' meta_max',
          type: 'line' as const,
          data: activePilhas.map(() => elem.meta_max),
          lineStyle: { color: elem.cor, type: 'dashed' as const, width: 1, opacity: 0.5 },
          symbol: 'none' as const,
          silent: true,
        })),
      ],
    }
  }, [pilhas, elementos, ct])

  const feEvolutionChart = useMemo(() => {
    if (!detailPilha) return {}
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' as const, backgroundColor: ct.tooltip.bg, borderColor: ct.tooltip.border, textStyle: { color: ct.tooltip.text, fontFamily: 'JetBrains Mono', fontSize: 11 } },
      grid: { top: 20, right: 20, bottom: 30, left: 50 },
      xAxis: { type: 'category' as const, data: detailPilha.historico_fe.map((_, i) => `D-${detailPilha.historico_fe.length - i}`), axisLabel: { color: ct.axis.label, fontSize: 9, fontFamily: 'JetBrains Mono' }, axisLine: { lineStyle: { color: ct.axis.line } } },
      yAxis: { type: 'value' as const, name: 'Fe %', min: (value: any) => Math.floor(value.min - 1), axisLabel: { color: ct.axis.label, fontSize: 9, fontFamily: 'JetBrains Mono' }, splitLine: { lineStyle: { color: ct.axis.split, type: 'dashed' as const } } },
      series: [
        { type: 'line' as const, data: detailPilha.historico_fe, smooth: true, lineStyle: { color: ct.brand, width: 2 }, itemStyle: { color: ct.brand }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: ct.brand + '40' }, { offset: 1, color: ct.brand + '05' }] } } },
        { type: 'line' as const, data: detailPilha.historico_fe.map(() => 58.0), lineStyle: { color: ct.ok, type: 'dashed' as const, width: 1 }, symbol: 'none', silent: true },
        { type: 'line' as const, data: detailPilha.historico_fe.map(() => 67.0), lineStyle: { color: ct.crit, type: 'dashed' as const, width: 1 }, symbol: 'none', silent: true },
      ],
    }
  }, [detailPilha, ct])

  /* ─── Pilhas columns ─── */
  const pilhaColumns = [
    { key: 'nome', label: 'Pilha', render: (r: any) => <span className="text-brand-400 font-bold">{r.nome}</span> },
    { key: 'material', label: 'Material', render: (r: any) => <span className="px-2 py-0.5 rounded text-[10px] bg-brand-600/10 text-brand-400 border border-brand-600/20">{r.material}</span> },
    { key: 'volume', label: 'Volume', render: (r: any) => {
      const pct = (r.volume_atual_ton / r.capacidade_ton) * 100
      const inRange = pct <= 90
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-hud-bg rounded-full overflow-hidden border border-hud-border">
            <div className={`h-full rounded-full transition-all ${inRange ? 'bg-ok' : 'bg-crit'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-[10px] font-mono text-dim">{(r.volume_atual_ton / 1000).toFixed(0)}k/{(r.capacidade_ton / 1000).toFixed(0)}k t</span>
        </div>
      )
    }},
    { key: 'status', label: 'Status', render: (r: any) => {
      const cfg = statusConfig[r.status as PilhaStatus]
      return <div className="flex items-center gap-1.5"><div className={`led led-${cfg.color}`} /><span className="text-[10px]">{cfg.label}</span></div>
    }},
    { key: 'area_destino', label: 'Destino', render: (r: any) => <span className="text-xs text-dim">{r.area_destino}</span> },
  ]

  const elemColumns = [
    { key: 'simbolo', label: 'Símbolo', render: (r: any) => <span className="text-brand-400 font-bold font-mono">{r.simbolo}</span> },
    { key: 'nome', label: 'Nome' },
    { key: 'range', label: 'Meta (min–max)', render: (r: any) => <span className="font-mono text-xs text-dim">{r.meta_min}–{r.meta_max} {r.unidade}</span> },
    { key: 'cor', label: 'Cor', render: (r: any) => <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.cor }} /><span className="text-[10px] font-mono text-dim">{r.cor}</span></div> },
  ]

  const tabs = [
    { id: 'pilhas' as const, label: 'Pilhas' },
    { id: 'elementos' as const, label: 'Elementos' },
    { id: 'analises' as const, label: 'Análises' },
  ]

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-hud-panel border border-hud-border rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${tab === t.id ? 'bg-brand-600/20 text-brand-400 border border-brand-600/40' : 'text-dim hover:text-gray-300 hover:bg-white/5 border border-transparent'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'pilhas' && (
          <DataTable columns={pilhaColumns} data={pilhas} title="Pilhas de Estoque" status="ok"
            onAdd={openAddPilha}
            onEdit={(r) => setDetailPilha(r)}
            onDelete={(r) => setDelPilha(r)}
            addLabel="Nova Pilha" />
        )}

        {tab === 'elementos' && (
          <DataTable columns={elemColumns} data={elementos} title="Elementos Químicos" status="info"
            onAdd={openAddElem}
            onEdit={openEditElem}
            onDelete={(r) => setDelElem(r)}
            addLabel="Novo Elemento" />
        )}

        {tab === 'analises' && (
          <Panel title="Análise Comparativa" subtitle="Pilhas ativas × Elementos" status="info">
            <div className="h-80">
              <ReactECharts option={analisesChart} style={{ height: '100%' }} key={ct.key} />
            </div>
          </Panel>
        )}
      </div>

      {/* ─── Pilha Form Drawer ─── */}
      <Drawer open={pilhaDrawer} onClose={() => setPilhaDrawer(false)} title={editingPilha ? 'Editar Pilha' : 'Nova Pilha'} footer={
        <button onClick={savePilha} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button>
      }>
        <div className="space-y-6">
          <FormSection title="Dados da Pilha">
            <FormGrid>
              <Input label="Nome" value={pilhaForm.nome} onChange={v => setPilhaForm((p: any) => ({ ...p, nome: v }))} required />
              <Select label="Material" value={pilhaForm.material} onChange={v => setPilhaForm((p: any) => ({ ...p, material: v }))} options={materialOptions} required />
            </FormGrid>
            <FormGrid>
              <Input label="Capacidade (ton)" value={pilhaForm.capacidade_ton} onChange={v => setPilhaForm((p: any) => ({ ...p, capacidade_ton: v }))} type="number" />
              <Input label="Volume Atual (ton)" value={pilhaForm.volume_atual_ton} onChange={v => setPilhaForm((p: any) => ({ ...p, volume_atual_ton: v }))} type="number" />
            </FormGrid>
            <FormGrid>
              <Select label="Status" value={pilhaForm.status} onChange={v => setPilhaForm((p: any) => ({ ...p, status: v }))} options={[{ value: 'ATIVA', label: 'Ativa' }, { value: 'FECHADA', label: 'Fechada' }, { value: 'EM_RECUPERACAO', label: 'Em Recuperação' }]} />
              <Select label="Área Destino" value={pilhaForm.area_destino} onChange={v => setPilhaForm((p: any) => ({ ...p, area_destino: v }))} options={areaOptions} />
            </FormGrid>
          </FormSection>
        </div>
      </Drawer>

      {/* ─── Pilha Detail Drawer ─── */}
      <Drawer open={!!detailPilha} onClose={() => setDetailPilha(null)} title="Detalhe da Pilha" subtitle={detailPilha?.nome} width="w-[520px]">
        {detailPilha && <div className="space-y-6">
          {/* Status + capacity */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${detailPilha.status === 'ATIVA' ? 'bg-ok/10 border-ok/20' : detailPilha.status === 'FECHADA' ? 'bg-crit/10 border-crit/20' : 'bg-warn/10 border-warn/20'}`}>
              <div className={`led led-${statusConfig[detailPilha.status].color}`} />
              <span className="text-[10px] font-mono">{statusConfig[detailPilha.status].label}</span>
            </div>
            <div className="flex-1">
              <div className="w-full h-3 bg-hud-bg rounded-full overflow-hidden border border-hud-border">
                <div className={`h-full rounded-full ${(detailPilha.volume_atual_ton / detailPilha.capacidade_ton) <= 0.9 ? 'bg-ok' : 'bg-crit'}`} style={{ width: `${(detailPilha.volume_atual_ton / detailPilha.capacidade_ton) * 100}%` }} />
              </div>
              <span className="text-[9px] font-mono text-dim">{detailPilha.volume_atual_ton.toLocaleString()}t / {detailPilha.capacidade_ton.toLocaleString()}t ({((detailPilha.volume_atual_ton / detailPilha.capacidade_ton) * 100).toFixed(0)}%)</span>
            </div>
          </div>

          {/* Quality table */}
          <FormSection title="Qualidade Atual">
            <div className="grid grid-cols-3 gap-2">
              {detailPilha.qualidade.map(q => {
                const elem = elementos.find(e => e.simbolo === q.simbolo)
                const inRange = elem ? (q.valor >= elem.meta_min && q.valor <= elem.meta_max) : true
                return (
                  <div key={q.simbolo} className={`px-3 py-2 rounded-lg border ${inRange ? 'bg-hud-bg border-hud-border' : 'bg-crit/5 border-crit/30'}`}>
                    <span className="text-[9px] font-mono text-dim block">{q.simbolo}</span>
                    <span className={`text-sm font-mono ${inRange ? 'text-ok' : 'text-crit'}`}>{q.valor}%</span>
                  </div>
                )
              })}
            </div>
          </FormSection>

          {/* Movimentações */}
          <FormSection title="Últimas Movimentações">
            <div className="space-y-1">
              {detailPilha.movimentacoes.map((m, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-hud-bg border border-hud-border/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0 rounded text-[9px] font-mono border ${m.tipo === 'ENTRADA' ? 'bg-ok/10 text-ok border-ok/20' : 'bg-warn/10 text-warn border-warn/20'}`}>{m.tipo === 'ENTRADA' ? '↓ IN' : '↑ OUT'}</span>
                    <span className="text-xs text-gray-300">{m.origem}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-brand-400">{m.peso_ton.toLocaleString()}t</span>
                    <span className="text-[10px] font-mono text-dim">{m.dt}</span>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Fe evolution chart */}
          <FormSection title="Evolução Fe%">
            <div className="h-48">
              <ReactECharts option={feEvolutionChart} style={{ height: '100%' }} key={ct.key + '-fe'} />
            </div>
          </FormSection>
        </div>}
      </Drawer>

      {/* ─── Elemento Drawer ─── */}
      <Drawer open={elemDrawer} onClose={() => setElemDrawer(false)} title={editingElem ? 'Editar Elemento' : 'Novo Elemento'} footer={
        <button onClick={saveElem} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button>
      }>
        <div className="space-y-6">
          <FormSection title="Dados do Elemento">
            <FormGrid>
              <Input label="Nome" value={elemForm.nome} onChange={v => setElemForm((p: any) => ({ ...p, nome: v }))} required />
              <Input label="Símbolo" value={elemForm.simbolo} onChange={v => setElemForm((p: any) => ({ ...p, simbolo: v }))} required />
            </FormGrid>
            <FormGrid>
              <Input label="Meta Mínima" value={elemForm.meta_min} onChange={v => setElemForm((p: any) => ({ ...p, meta_min: v }))} type="number" />
              <Input label="Meta Máxima" value={elemForm.meta_max} onChange={v => setElemForm((p: any) => ({ ...p, meta_max: v }))} type="number" />
            </FormGrid>
            <FormGrid>
              <Input label="Unidade" value={elemForm.unidade} onChange={v => setElemForm((p: any) => ({ ...p, unidade: v }))} />
              <Input label="Cor (hex)" value={elemForm.cor} onChange={v => setElemForm((p: any) => ({ ...p, cor: v }))} />
            </FormGrid>
          </FormSection>
        </div>
      </Drawer>

      {/* ─── Confirm Dialogs ─── */}
      <ConfirmDialog open={!!delPilha} onClose={() => setDelPilha(null)} onConfirm={confirmDelPilha} title="Excluir Pilha" message={`Deseja excluir "${delPilha?.nome}"?`} />
      <ConfirmDialog open={!!delElem} onClose={() => setDelElem(null)} onConfirm={confirmDelElem} title="Excluir Elemento" message={`Deseja excluir "${delElem?.nome}"?`} />
    </div>
  )
}