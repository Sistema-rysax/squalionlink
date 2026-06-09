import { useState, useCallback, useRef, createContext, useContext, useMemo } from 'react'
import { DockviewReact, DockviewReadyEvent, IDockviewPanelProps } from 'dockview-react'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { ArrowRight, Plus, Trash2, Truck, Edit2, CheckCircle, XCircle, RefreshCw, RotateCcw } from 'lucide-react'

/* ─── MOCK DATA ─── */
const AREAS = ['Frente Norte B3','Frente Sul A1','Frente Oeste C2','Britador Primário','Pilha ROM','Pilha Estéril','Pátio Manobra','Barragem','Beneficiamento']
const SUBAREAS: Record<string,string[]> = {
  'Frente Norte B3':['Bancada N1','Bancada N2','Bancada N3','Praça de Carga A'],
  'Frente Sul A1':['Bancada S1','Bancada S2','Praça de Carga B'],
  'Frente Oeste C2':['Bancada W1','Bancada W2'],
  'Britador Primário':['Alimentador','Grelha','Pátio Descarga'],
  'Pilha ROM':['Setor A','Setor B','Setor C'],
  'Pilha Estéril':['Setor 1','Setor 2','Setor 3','Setor 4'],
  'Pátio Manobra':['Zona 1','Zona 2'],
  'Barragem':['Descarga Norte','Descarga Sul'],
  'Beneficiamento':['Recepção','Pátio Produto']
}
const MATERIAIS = ['ROM','Hematita','Itabirito','Estéril','Canga','Minério Friável','Solo Orgânico']

interface Fluxo {
  id: number
  nome: string
  origem_area: string
  origem_subarea: string
  material: string
  destino_area: string
  destino_subarea: string
  material_destino: string
  status: 'ATIVO'|'PAUSADO'
}

interface Alocacao {
  id: number
  equipamento: string
  tipo: string
  fluxo_id: number
  viagens: number
  status: 'ALOCADO'|'EM_ROTA'|'AGUARDANDO'
}

const initFluxos: Fluxo[] = [
  {id:1,nome:'F-001',origem_area:'Frente Norte B3',origem_subarea:'Praça de Carga A',material:'ROM',destino_area:'Britador Primário',destino_subarea:'Pátio Descarga',material_destino:'ROM',status:'ATIVO'},
  {id:2,nome:'F-002',origem_area:'Frente Sul A1',origem_subarea:'Praça de Carga B',material:'Estéril',destino_area:'Pilha Estéril',destino_subarea:'Setor 2',material_destino:'Estéril',status:'ATIVO'},
  {id:3,nome:'F-003',origem_area:'Frente Norte B3',origem_subarea:'Bancada N2',material:'Hematita',destino_area:'Pilha ROM',destino_subarea:'Setor A',material_destino:'Hematita',status:'ATIVO'},
  {id:4,nome:'F-004',origem_area:'Frente Oeste C2',origem_subarea:'Bancada W1',material:'Canga',destino_area:'Barragem',destino_subarea:'Descarga Norte',material_destino:'Canga',status:'PAUSADO'},
]

const initAlocacoes: Alocacao[] = [
  {id:1,equipamento:'CAT-773F-01',tipo:'Caminhão 773F',fluxo_id:1,viagens:12,status:'EM_ROTA'},
  {id:2,equipamento:'CAT-773F-02',tipo:'Caminhão 773F',fluxo_id:1,viagens:10,status:'ALOCADO'},
  {id:3,equipamento:'CAT-773F-03',tipo:'Caminhão 773F',fluxo_id:2,viagens:8,status:'EM_ROTA'},
  {id:4,equipamento:'CAT-777G-01',tipo:'Caminhão 777G',fluxo_id:2,viagens:6,status:'ALOCADO'},
  {id:5,equipamento:'CAT-777G-02',tipo:'Caminhão 777G',fluxo_id:3,viagens:9,status:'EM_ROTA'},
  {id:6,equipamento:'VOLVO-A40G-01',tipo:'Articulado A40G',fluxo_id:3,viagens:7,status:'AGUARDANDO'},
  {id:7,equipamento:'CAT-773F-04',tipo:'Caminhão 773F',fluxo_id:1,viagens:11,status:'ALOCADO'},
]

const disponiveis = [
  {cod:'CAT-773F-05',tipo:'Caminhão 773F'},
  {cod:'CAT-777G-03',tipo:'Caminhão 777G'},
  {cod:'VOLVO-A40G-02',tipo:'Articulado A40G'},
  {cod:'KOMATSU-HD785-01',tipo:'Caminhão HD785'},
]

/* ─── SHARED CONTEXT ─── */
interface AlocContextType {
  fluxos: Fluxo[]
  alocacoes: Alocacao[]
  setFluxos: React.Dispatch<React.SetStateAction<Fluxo[]>>
  setAlocacoes: React.Dispatch<React.SetStateAction<Alocacao[]>>
  openFluxoDrawer: (fluxo?: Fluxo) => void
  openAlocarDrawer: (fluxo: Fluxo) => void
  confirmDeleteFluxo: (fluxo: Fluxo) => void
  desalocar: (a: Alocacao) => void
  toggleFluxo: (f: Fluxo) => void
}

const AlocContext = createContext<AlocContextType>(null as any)

/* ─── FLUXOS PANEL ─── */
const FluxosPanel = (_props: IDockviewPanelProps) => {
  const { fluxos, alocacoes, openFluxoDrawer, openAlocarDrawer, confirmDeleteFluxo, desalocar, toggleFluxo } = useContext(AlocContext)

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm tracking-wider text-gray-200 uppercase">Alocação de Frota</h2>
          <p className="text-[10px] font-mono text-dim mt-0.5">Fluxos Origem → Destino com equipamentos alocados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-dim"><div className="w-2 h-2 rounded-full bg-ok animate-pulse"></div>TEMPO REAL</div>
          <button onClick={() => openFluxoDrawer()} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase text-brand-400 bg-brand-600/10 border border-brand-600/30 rounded-md hover:shadow-glow-sm transition-all"><Plus className="w-3 h-3"/>Novo Fluxo</button>
        </div>
      </div>

      {/* Fluxos */}
      <div className="space-y-3">
        {fluxos.map(fluxo => {
          const equipsFluxo = alocacoes.filter(a => a.fluxo_id === fluxo.id)
          const isAtivo = fluxo.status === 'ATIVO'
          return (
            <div key={fluxo.id} className={`bg-hud-panel border rounded-xl overflow-hidden transition-all ${isAtivo ? 'border-hud-border' : 'border-hud-border/40 opacity-60'}`}>
              {/* Flow header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-hud-border/30">
                <div className="flex items-center gap-4">
                  <div className={`led ${isAtivo ? 'led-ok' : 'led-off'}`}></div>
                  <span className="text-brand-400 font-mono font-bold text-sm">{fluxo.nome}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex flex-col items-start">
                      <span className="text-[8px] font-mono text-dim uppercase">Origem</span>
                      <span className="text-gray-200">{fluxo.origem_area}</span>
                      <span className="text-[10px] text-dim">{fluxo.origem_subarea}</span>
                    </div>
                    <div className="flex flex-col items-center mx-3">
                      <span className="px-2 py-0.5 bg-warn/10 border border-warn/20 rounded text-[9px] text-warn font-mono">{fluxo.material}</span>
                      <ArrowRight className="w-5 h-5 text-brand-400 mt-1" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[8px] font-mono text-dim uppercase">Destino</span>
                      <span className="text-gray-200">{fluxo.destino_area}</span>
                      <span className="text-[10px] text-dim">{fluxo.destino_subarea}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-dim">{equipsFluxo.length} equip.</span>
                  <button onClick={() => openAlocarDrawer(fluxo)} className="flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase text-ok bg-ok/10 border border-ok/20 rounded hover:shadow-glow-sm transition-all" title="Alocar equipamento"><Plus className="w-3 h-3"/>Alocar</button>
                  <button onClick={() => toggleFluxo(fluxo)} className={`px-2 py-1 text-[9px] font-mono rounded border transition-all ${isAtivo ? 'text-warn bg-warn/10 border-warn/20' : 'text-ok bg-ok/10 border-ok/20'}`}>{isAtivo ? 'Pausar' : 'Ativar'}</button>
                  <button onClick={() => openFluxoDrawer(fluxo)} className="p-1 text-dim hover:text-gray-300"><Edit2 className="w-3.5 h-3.5"/></button>
                  <button onClick={() => confirmDeleteFluxo(fluxo)} className="p-1 text-dim hover:text-crit"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
              
              {/* Equipamentos alocados */}
              {equipsFluxo.length > 0 && (
                <div className="px-5 py-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {equipsFluxo.map(a => (
                      <div key={a.id} className="flex items-center justify-between bg-hud-bg border border-hud-border/50 rounded-lg px-3 py-2 group hover:border-brand-600/30 transition-all">
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-dim" />
                          <div>
                            <span className="text-xs font-mono text-gray-200">{a.equipamento}</span>
                            <span className="text-[9px] text-dim ml-2">{a.tipo}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] border font-mono ${a.status === 'EM_ROTA' ? 'text-ok bg-ok/10 border-ok/20' : a.status === 'ALOCADO' ? 'text-brand-400 bg-brand-600/10 border-brand-600/20' : 'text-warn bg-warn/10 border-warn/20'}`}>{a.status.replace('_', ' ')}</span>
                          <span className="text-[9px] font-mono text-dim">{a.viagens}v</span>
                          <button onClick={() => desalocar(a)} className="p-0.5 text-dim hover:text-crit opacity-0 group-hover:opacity-100 transition-opacity"><XCircle className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {equipsFluxo.length === 0 && (
                <div className="px-5 py-4 text-center text-[10px] text-dim font-mono">Nenhum equipamento alocado neste fluxo</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── POOL PANEL ─── */
const PoolPanel = (_props: IDockviewPanelProps) => {
  return (
    <div className="h-full overflow-y-auto p-4">
      <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400 mb-3">Pool Disponível</h3>
      <div className="space-y-2">
        {disponiveis.map(d => (
          <div key={d.cod} className="flex items-center justify-between bg-hud-bg border border-hud-border/50 rounded-lg px-3 py-2.5 hover:border-brand-600/30 transition-all">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-ok" />
              <div>
                <span className="text-xs font-mono text-gray-200 font-bold">{d.cod}</span>
                <span className="text-[9px] text-dim block">{d.tipo}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[8px] font-mono text-ok bg-ok/10 border border-ok/20 rounded">LIVRE</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── STATS PANEL ─── */
const StatsPanel = (_props: IDockviewPanelProps) => {
  const { fluxos, alocacoes } = useContext(AlocContext)

  const stats = [
    { label: 'Fluxos Ativos', value: fluxos.filter(f => f.status === 'ATIVO').length, color: 'ok' },
    { label: 'Equipamentos Alocados', value: alocacoes.length, color: 'brand-400' },
    { label: 'Em Rota', value: alocacoes.filter(a => a.status === 'EM_ROTA').length, color: 'warn' },
    { label: 'Disponíveis', value: disponiveis.length, color: 'dim' },
  ]

  return (
    <div className="h-full overflow-y-auto p-4">
      <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400 mb-3">Estatísticas</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-hud-bg border border-hud-border/50 rounded-lg p-3 text-center">
            <div className={`text-xl font-display text-${s.color}`}>{s.value}</div>
            <div className="text-[9px] font-mono text-dim uppercase mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── MAIN ALOCACAO COMPONENT ─── */
const components = {
  fluxos: FluxosPanel,
  pool: PoolPanel,
  stats: StatsPanel,
}

export default function Alocacao() {
  const [fluxos, setFluxos] = useState<Fluxo[]>(initFluxos)
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>(initAlocacoes)
  const apiRef = useRef<any>(null)

  // Drawer states
  const [openFluxo, setOpenFluxo] = useState(false)
  const [editingFluxo, setEditingFluxo] = useState<Fluxo | null>(null)
  const [openAlocar, setOpenAlocar] = useState(false)
  const [alocarFluxo, setAlocarFluxo] = useState<Fluxo | null>(null)
  const [delFluxo, setDelFluxo] = useState<Fluxo | null>(null)

  // Form state
  const emptyFluxo = { origem_area: '', origem_subarea: '', material: '', destino_area: '', destino_subarea: '', material_destino: '' }
  const [fluxoForm, setFluxoForm] = useState<any>(emptyFluxo)
  const [alocarEquip, setAlocarEquip] = useState('')
  const sf = (k: string, v: string) => setFluxoForm((p: any) => ({ ...p, [k]: v }))

  // Save Fluxo
  const saveFluxo = () => {
    if (!fluxoForm.origem_area || !fluxoForm.destino_area || !fluxoForm.material) { toast('Preencha origem, destino e material', 'error'); return }
    if (editingFluxo) {
      setFluxos(p => p.map(f => f.id === editingFluxo.id ? { ...f, ...fluxoForm } : f))
      toast('Fluxo atualizado')
    } else {
      const nome = 'F-' + String(fluxos.length + 1).padStart(3, '0')
      setFluxos(p => [...p, { id: Date.now(), nome, ...fluxoForm, status: 'ATIVO' } as Fluxo])
      toast('Fluxo criado')
    }
    setOpenFluxo(false)
  }

  // Alocar equip
  const alocar = () => {
    if (!alocarEquip || !alocarFluxo) { toast('Selecione equipamento', 'error'); return }
    const equip = disponiveis.find(d => d.cod === alocarEquip)!
    setAlocacoes(p => [...p, { id: Date.now(), equipamento: alocarEquip, tipo: equip.tipo, fluxo_id: alocarFluxo.id, viagens: 0, status: 'ALOCADO' }])
    toast(alocarEquip + ' alocado ao ' + alocarFluxo.nome)
    setOpenAlocar(false); setAlocarEquip('')
  }

  // Desalocar
  const desalocar = useCallback((a: Alocacao) => {
    setAlocacoes(p => p.filter(x => x.id !== a.id))
    toast(a.equipamento + ' desalocado', 'warning')
  }, [])

  // Toggle fluxo status
  const toggleFluxo = useCallback((f: Fluxo) => {
    setFluxos(p => p.map(x => x.id === f.id ? { ...x, status: x.status === 'ATIVO' ? 'PAUSADO' : 'ATIVO' } : x))
    toast(f.nome + ' ' + (f.status === 'ATIVO' ? 'pausado' : 'reativado'))
  }, [])

  const openFluxoDrawer = useCallback((fluxo?: Fluxo) => {
    if (fluxo) {
      setFluxoForm({ origem_area: fluxo.origem_area, origem_subarea: fluxo.origem_subarea, material: fluxo.material, destino_area: fluxo.destino_area, destino_subarea: fluxo.destino_subarea, material_destino: fluxo.material_destino })
      setEditingFluxo(fluxo)
    } else {
      setFluxoForm(emptyFluxo)
      setEditingFluxo(null)
    }
    setOpenFluxo(true)
  }, [])

  const openAlocarDrawer = useCallback((fluxo: Fluxo) => {
    setAlocarFluxo(fluxo)
    setOpenAlocar(true)
  }, [])

  const confirmDeleteFluxo = useCallback((fluxo: Fluxo) => {
    setDelFluxo(fluxo)
  }, [])

  const contextValue = useMemo(() => ({
    fluxos, alocacoes, setFluxos, setAlocacoes,
    openFluxoDrawer, openAlocarDrawer, confirmDeleteFluxo, desalocar, toggleFluxo
  }), [fluxos, alocacoes, openFluxoDrawer, openAlocarDrawer, confirmDeleteFluxo, desalocar, toggleFluxo])

  const onReady = useCallback((event: DockviewReadyEvent) => {
    apiRef.current = event.api
    event.api.addPanel({ id: 'fluxos', component: 'fluxos', title: 'Fluxos & Alocações' })
    event.api.addPanel({ id: 'pool', component: 'pool', title: 'Pool Disponível', position: { referencePanel: 'fluxos', direction: 'right' } })
    event.api.addPanel({ id: 'stats', component: 'stats', title: 'Estatísticas', position: { referencePanel: 'pool', direction: 'below' } })

    // Set pool panel to ~35% width
    const poolGroup = event.api.getPanel('pool')?.group
    if (poolGroup) {
      try { poolGroup.api.setSize({ width: 320 }) } catch(_) {}
    }
  }, [])

  const resetLayout = useCallback(() => {
    if (!apiRef.current) return
    const api = apiRef.current
    const panels = api.panels
    panels.forEach((p: any) => p.api.close())
    api.addPanel({ id: 'fluxos', component: 'fluxos', title: 'Fluxos & Alocações' })
    api.addPanel({ id: 'pool', component: 'pool', title: 'Pool Disponível', position: { referencePanel: 'fluxos', direction: 'right' } })
    api.addPanel({ id: 'stats', component: 'stats', title: 'Estatísticas', position: { referencePanel: 'pool', direction: 'below' } })
    const poolGroup = api.getPanel('pool')?.group
    if (poolGroup) {
      try { poolGroup.api.setSize({ width: 320 }) } catch(_) {}
    }
  }, [])

  return (
    <AlocContext.Provider value={contextValue}>
      <div className="h-full relative">
        <button
          onClick={resetLayout}
          className="absolute top-2 right-2 z-50 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase text-dim hover:text-brand-400 bg-hud-panel/90 border border-hud-border rounded-md hover:shadow-glow-sm transition-all backdrop-blur-sm"
          title="Resetar Layout"
        >
          <RotateCcw className="w-3 h-3" />Reset
        </button>
        <DockviewReact
          onReady={onReady}
          components={components}
          className="dockview-theme-dark h-full"
          watermarkComponent={() => null}
        />
      </div>

      {/* ─── DRAWER: Novo/Editar Fluxo ─── */}
      <Drawer open={openFluxo} onClose={() => setOpenFluxo(false)} title={editingFluxo ? 'Editar Fluxo' : 'Novo Fluxo'} subtitle="Defina origem e destino"
        footer={<>
          <button onClick={() => setOpenFluxo(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button>
          <button onClick={saveFluxo} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button>
        </>}>
        <div className="space-y-6">
          <FormSection title="🟢 Origem (Carga)">
            <Select label="Área" value={fluxoForm.origem_area} onChange={v => { sf('origem_area', v); sf('origem_subarea', '') }} options={AREAS.map(a => ({ value: a, label: a }))} />
            {fluxoForm.origem_area && <Select label="Subárea" value={fluxoForm.origem_subarea} onChange={v => sf('origem_subarea', v)} options={(SUBAREAS[fluxoForm.origem_area] || []).map(s => ({ value: s, label: s }))} />}
            <Select label="Material" value={fluxoForm.material} onChange={v => sf('material', v)} options={MATERIAIS.map(m => ({ value: m, label: m }))} />
          </FormSection>
          <div className="flex justify-center"><div className="flex flex-col items-center gap-1"><div className="w-px h-4 bg-brand-600/40"></div><ArrowRight className="w-5 h-5 text-brand-400 rotate-90" /><div className="w-px h-4 bg-brand-600/40"></div></div></div>
          <FormSection title="🔴 Destino (Descarga)">
            <Select label="Área" value={fluxoForm.destino_area} onChange={v => { sf('destino_area', v); sf('destino_subarea', '') }} options={AREAS.map(a => ({ value: a, label: a }))} />
            {fluxoForm.destino_area && <Select label="Subárea" value={fluxoForm.destino_subarea} onChange={v => sf('destino_subarea', v)} options={(SUBAREAS[fluxoForm.destino_area] || []).map(s => ({ value: s, label: s }))} />}
            <Select label="Material no Destino" value={fluxoForm.material_destino} onChange={v => sf('material_destino', v)} options={MATERIAIS.map(m => ({ value: m, label: m }))} />
          </FormSection>
        </div>
      </Drawer>

      {/* ─── DRAWER: Alocar Equipamento ─── */}
      <Drawer open={openAlocar} onClose={() => setOpenAlocar(false)} title="Alocar Equipamento" subtitle={alocarFluxo?.nome + ' — ' + alocarFluxo?.origem_area + ' → ' + alocarFluxo?.destino_area}
        footer={<>
          <button onClick={() => setOpenAlocar(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button>
          <button onClick={alocar} className="px-4 py-2 text-xs font-mono uppercase text-ok bg-ok/10 border border-ok/20 rounded-md hover:shadow-glow-sm transition-all">Alocar</button>
        </>}>
        <div className="space-y-4">
          <FormSection title="Equipamento Disponível">
            <Select label="Equipamento" value={alocarEquip} onChange={setAlocarEquip} options={disponiveis.map(d => ({ value: d.cod, label: d.cod + ' (' + d.tipo + ')' }))} />
          </FormSection>
          <div className="p-3 bg-brand-600/5 border border-brand-600/20 rounded-lg">
            <p className="text-[10px] text-brand-400 font-mono">Fluxo: {alocarFluxo?.origem_area} / {alocarFluxo?.origem_subarea}</p>
            <p className="text-[10px] text-dim font-mono">Material: {alocarFluxo?.material}</p>
            <p className="text-[10px] text-brand-400 font-mono mt-1">→ {alocarFluxo?.destino_area} / {alocarFluxo?.destino_subarea}</p>
          </div>
        </div>
      </Drawer>

      {/* ─── CONFIRM DELETE ─── */}
      <ConfirmDialog open={!!delFluxo} onClose={() => setDelFluxo(null)} onConfirm={() => { setFluxos(p => p.filter(f => f.id !== delFluxo!.id)); setAlocacoes(p => p.filter(a => a.fluxo_id !== delFluxo!.id)); toast('Fluxo removido'); setDelFluxo(null) }} title="Excluir Fluxo" message={`Remover ${delFluxo?.nome}? Os equipamentos alocados serão liberados.`} confirmLabel="Excluir" />
    </AlocContext.Provider>
  )
}
