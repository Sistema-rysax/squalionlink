import { useState } from 'react'
import Panel from '../../components/panels/Panel'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Textarea, Toggle, FormSection, FormGrid, Select } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { Plus, Trash2, Edit2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

/* ─── Types ─── */
type TipoResposta = 'SIM_NAO' | 'NOTA_1_5' | 'TEXTO_LIVRE' | 'NUMERO' | 'FOTO'

interface ChecklistItem {
  id: number
  texto: string
  tipo_resposta: TipoResposta
  obrigatorio: boolean
  gera_nc: boolean
  ordem: number
}

interface ChecklistGrupo {
  id: number
  nome: string
  descricao: string
  modelos: string[]
  itens: ChecklistItem[]
}

/* ─── Mock Data ─── */
const modelosDisponiveis = [
  { value: '777G', label: '777G' },
  { value: '785D', label: '785D' },
  { value: 'PC5500', label: 'PC5500' },
  { value: 'CAT 6060', label: 'CAT 6060' },
  { value: 'CAT 16M', label: 'CAT 16M' },
  { value: 'Atlas D65', label: 'Atlas D65' },
  { value: 'CAT D10T', label: 'CAT D10T' },
]

const initGrupos: ChecklistGrupo[] = [
  {
    id: 1, nome: 'Pré-Operação Caminhão', descricao: 'Checklist obrigatório antes de iniciar operação de caminhões fora-de-estrada',
    modelos: ['777G', '785D'],
    itens: [
      { id: 1, texto: 'Nível de óleo do motor dentro da faixa', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: true, ordem: 1 },
      { id: 2, texto: 'Pressão dos pneus (verificar todos)', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: true, ordem: 2 },
      { id: 3, texto: 'Sistema de freios funcionando', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: true, ordem: 3 },
      { id: 4, texto: 'Iluminação e faróis operacionais', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: false, ordem: 4 },
      { id: 5, texto: 'Extintor de incêndio válido', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: true, ordem: 5 },
      { id: 6, texto: 'Nota geral condição da cabine (1-5)', tipo_resposta: 'NOTA_1_5', obrigatorio: true, gera_nc: false, ordem: 6 },
      { id: 7, texto: 'Horímetro atual', tipo_resposta: 'NUMERO', obrigatorio: true, gera_nc: false, ordem: 7 },
      { id: 8, texto: 'Observações adicionais', tipo_resposta: 'TEXTO_LIVRE', obrigatorio: false, gera_nc: false, ordem: 8 },
    ]
  },
  {
    id: 2, nome: 'Troca de Turno', descricao: 'Verificações realizadas na troca entre turnos de operação',
    modelos: ['777G', '785D', 'PC5500', 'CAT 6060'],
    itens: [
      { id: 9, texto: 'Equipamento limpo e organizado', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: false, ordem: 1 },
      { id: 10, texto: 'Danos visíveis na estrutura', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: true, ordem: 2 },
      { id: 11, texto: 'Nível de combustível', tipo_resposta: 'NUMERO', obrigatorio: true, gera_nc: false, ordem: 3 },
      { id: 12, texto: 'Ferramentas a bordo conferidas', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: false, ordem: 4 },
      { id: 13, texto: 'Nota condição geral (1-5)', tipo_resposta: 'NOTA_1_5', obrigatorio: true, gera_nc: false, ordem: 5 },
      { id: 14, texto: 'Foto painel de instrumentos', tipo_resposta: 'FOTO', obrigatorio: false, gera_nc: false, ordem: 6 },
    ]
  },
  {
    id: 3, nome: 'Inspeção Semanal', descricao: 'Inspeção detalhada semanal de todos os sistemas do equipamento',
    modelos: ['777G', '785D', 'PC5500', 'CAT 6060', 'CAT 16M', 'CAT D10T'],
    itens: [
      { id: 15, texto: 'Sistema hidráulico sem vazamentos', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: true, ordem: 1 },
      { id: 16, texto: 'Correia do alternador em bom estado', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: true, ordem: 2 },
      { id: 17, texto: 'Filtro de ar primário (condição)', tipo_resposta: 'NOTA_1_5', obrigatorio: true, gera_nc: false, ordem: 3 },
      { id: 18, texto: 'Folga nos parafusos da roda', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: true, ordem: 4 },
      { id: 19, texto: 'Leitura pressão do turbo (bar)', tipo_resposta: 'NUMERO', obrigatorio: true, gera_nc: false, ordem: 5 },
      { id: 20, texto: 'Foto geral do equipamento', tipo_resposta: 'FOTO', obrigatorio: true, gera_nc: false, ordem: 6 },
      { id: 21, texto: 'Observações manutenção preventiva', tipo_resposta: 'TEXTO_LIVRE', obrigatorio: false, gera_nc: false, ordem: 7 },
    ]
  },
]

const emptyGrupo = { nome: '', descricao: '', modelos: [] as string[] }
const emptyItem: Omit<ChecklistItem, 'id' | 'ordem'> = { texto: '', tipo_resposta: 'SIM_NAO', obrigatorio: true, gera_nc: false }

const tipoRespostaOptions = [
  { value: 'SIM_NAO', label: 'Sim/Não' },
  { value: 'NOTA_1_5', label: 'Nota 1-5' },
  { value: 'TEXTO_LIVRE', label: 'Texto Livre' },
  { value: 'NUMERO', label: 'Número' },
  { value: 'FOTO', label: 'Foto' },
]

const tipoRespostaBadge: Record<TipoResposta, { bg: string; label: string }> = {
  SIM_NAO: { bg: 'bg-brand-600/10 text-brand-400 border-brand-600/20', label: 'S/N' },
  NOTA_1_5: { bg: 'bg-warn/10 text-warn border-warn/20', label: '★1-5' },
  TEXTO_LIVRE: { bg: 'bg-info/10 text-info border-info/20', label: 'TXT' },
  NUMERO: { bg: 'bg-ok/10 text-ok border-ok/20', label: '#' },
  FOTO: { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: '📷' },
}

export default function ChecklistPage() {
  const [grupos, setGrupos] = useState<ChecklistGrupo[]>(initGrupos)
  const [selectedGrupo, setSelectedGrupo] = useState<number | null>(1)
  const [grupoDrawer, setGrupoDrawer] = useState(false)
  const [editingGrupo, setEditingGrupo] = useState<ChecklistGrupo | null>(null)
  const [grupoForm, setGrupoForm] = useState(emptyGrupo)
  const [delGrupo, setDelGrupo] = useState<ChecklistGrupo | null>(null)

  const [itemDrawer, setItemDrawer] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [itemForm, setItemForm] = useState<any>(emptyItem)
  const [delItem, setDelItem] = useState<ChecklistItem | null>(null)

  const activeGrupo = grupos.find(g => g.id === selectedGrupo) || null

  /* ─── Grupo CRUD ─── */
  const openAddGrupo = () => { setGrupoForm(emptyGrupo); setEditingGrupo(null); setGrupoDrawer(true) }
  const openEditGrupo = (g: ChecklistGrupo) => { setGrupoForm({ nome: g.nome, descricao: g.descricao, modelos: g.modelos }); setEditingGrupo(g); setGrupoDrawer(true) }
  const saveGrupo = () => {
    if (!grupoForm.nome) { toast('Nome obrigatório', 'error'); return }
    if (editingGrupo) {
      setGrupos(p => p.map(g => g.id === editingGrupo.id ? { ...g, nome: grupoForm.nome, descricao: grupoForm.descricao, modelos: grupoForm.modelos } : g))
      toast('Grupo atualizado')
    } else {
      setGrupos(p => [...p, { id: Date.now(), nome: grupoForm.nome, descricao: grupoForm.descricao, modelos: grupoForm.modelos, itens: [] }])
      toast('Grupo criado')
    }
    setGrupoDrawer(false)
  }
  const confirmDelGrupo = () => { if (delGrupo) { setGrupos(p => p.filter(g => g.id !== delGrupo.id)); if (selectedGrupo === delGrupo.id) setSelectedGrupo(null); setDelGrupo(null); toast('Grupo removido') } }

  /* ─── Item CRUD ─── */
  const openAddItem = () => { setItemForm(emptyItem); setEditingItem(null); setItemDrawer(true) }
  const openEditItem = (item: ChecklistItem) => { setItemForm({ texto: item.texto, tipo_resposta: item.tipo_resposta, obrigatorio: item.obrigatorio, gera_nc: item.gera_nc }); setEditingItem(item); setItemDrawer(true) }
  const saveItem = () => {
    if (!itemForm.texto || !selectedGrupo) { toast('Texto obrigatório', 'error'); return }
    setGrupos(p => p.map(g => {
      if (g.id !== selectedGrupo) return g
      if (editingItem) {
        return { ...g, itens: g.itens.map(it => it.id === editingItem.id ? { ...it, texto: itemForm.texto, tipo_resposta: itemForm.tipo_resposta, obrigatorio: itemForm.obrigatorio, gera_nc: itemForm.gera_nc } : it) }
      } else {
        const newItem: ChecklistItem = { id: Date.now(), texto: itemForm.texto, tipo_resposta: itemForm.tipo_resposta, obrigatorio: itemForm.obrigatorio, gera_nc: itemForm.gera_nc, ordem: g.itens.length + 1 }
        return { ...g, itens: [...g.itens, newItem] }
      }
    }))
    toast(editingItem ? 'Item atualizado' : 'Item adicionado')
    setItemDrawer(false)
  }
  const confirmDelItem = () => {
    if (delItem && selectedGrupo) {
      setGrupos(p => p.map(g => g.id !== selectedGrupo ? g : { ...g, itens: g.itens.filter(it => it.id !== delItem.id).map((it, i) => ({ ...it, ordem: i + 1 })) }))
      setDelItem(null); toast('Item removido')
    }
  }
  const moveItem = (itemId: number, dir: 'up' | 'down') => {
    if (!selectedGrupo) return
    setGrupos(p => p.map(g => {
      if (g.id !== selectedGrupo) return g
      const itens = [...g.itens].sort((a, b) => a.ordem - b.ordem)
      const idx = itens.findIndex(it => it.id === itemId)
      if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === itens.length - 1)) return g
      const swap = dir === 'up' ? idx - 1 : idx + 1
      const temp = itens[idx].ordem
      itens[idx] = { ...itens[idx], ordem: itens[swap].ordem }
      itens[swap] = { ...itens[swap], ordem: temp }
      return { ...g, itens }
    }))
  }

  const toggleModelo = (m: string) => {
    setGrupoForm(p => ({ ...p, modelos: p.modelos.includes(m) ? p.modelos.filter(x => x !== m) : [...p.modelos, m] }))
  }

  return (
    <div className="flex h-full gap-3">
      {/* ─── LEFT PANEL: Groups ─── */}
      <div className="w-64 flex flex-col bg-hud-panel border border-hud-border rounded-xl overflow-hidden">
        <div className="p-3 border-b border-hud-border flex items-center justify-between">
          <h3 className="text-xs font-display uppercase tracking-wider text-gray-400">Grupos</h3>
          <button onClick={openAddGrupo} className="p-1 rounded hover:bg-white/5 text-brand-400"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {grupos.map(g => (
            <div key={g.id} onClick={() => setSelectedGrupo(g.id)}
              className={`px-3 py-2.5 cursor-pointer border-b border-hud-border/30 transition-all ${selectedGrupo === g.id ? 'bg-brand-600/10 border-l-2 border-l-brand-400' : 'hover:bg-white/5 border-l-2 border-l-transparent'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-200 font-medium truncate">{g.nome}</span>
                <div className="flex items-center gap-1">
                  <button onClick={e => { e.stopPropagation(); openEditGrupo(g) }} className="p-0.5 rounded hover:bg-white/10 text-dim"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={e => { e.stopPropagation(); setDelGrupo(g) }} className="p-0.5 rounded hover:bg-white/10 text-crit"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-dim">{g.itens.length} itens</span>
                <div className="flex gap-0.5 flex-wrap">
                  {g.modelos.slice(0, 3).map(m => (
                    <span key={m} className="px-1 py-0 rounded text-[9px] bg-brand-600/10 text-brand-400 border border-brand-600/20">{m}</span>
                  ))}
                  {g.modelos.length > 3 && <span className="text-[9px] text-dim">+{g.modelos.length - 3}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT PANEL: Items ─── */}
      <div className="flex-1 flex flex-col bg-hud-panel border border-hud-border rounded-xl overflow-hidden">
        {activeGrupo ? (<>
          <div className="p-3 border-b border-hud-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-display uppercase tracking-wider text-brand-400">{activeGrupo.nome}</h3>
              <span className="text-[10px] font-mono text-dim">{activeGrupo.descricao}</span>
            </div>
            <button onClick={openAddItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase tracking-wider hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">
              <Plus className="w-3.5 h-3.5" />Novo Item
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hud-border/50 text-[10px] font-mono text-dim uppercase">
                  <th className="px-3 py-2 text-left w-8">#</th>
                  <th className="px-3 py-2 text-left">Texto</th>
                  <th className="px-3 py-2 text-center w-20">Tipo</th>
                  <th className="px-3 py-2 text-center w-16">Obrig.</th>
                  <th className="px-3 py-2 text-center w-16">NC</th>
                  <th className="px-3 py-2 text-center w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {[...activeGrupo.itens].sort((a, b) => a.ordem - b.ordem).map(item => {
                  const badge = tipoRespostaBadge[item.tipo_resposta]
                  return (
                    <tr key={item.id} className="border-b border-hud-border/20 hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-2 text-[10px] font-mono text-dim">{item.ordem}</td>
                      <td className="px-3 py-2 text-xs text-gray-300">{item.texto}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] border ${badge.bg}`}>{badge.label}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className={`led led-${item.obrigatorio ? 'warn' : 'ok'} mx-auto`} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className={`led led-${item.gera_nc ? 'crit' : 'ok'} mx-auto`} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => moveItem(item.id, 'up')} className="p-0.5 rounded hover:bg-white/10 text-dim"><ChevronUp className="w-3 h-3" /></button>
                          <button onClick={() => moveItem(item.id, 'down')} className="p-0.5 rounded hover:bg-white/10 text-dim"><ChevronDown className="w-3 h-3" /></button>
                          <button onClick={() => openEditItem(item)} className="p-0.5 rounded hover:bg-white/10 text-dim"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => setDelItem(item)} className="p-0.5 rounded hover:bg-white/10 text-crit"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm text-dim font-mono">Selecione um grupo à esquerda</span>
          </div>
        )}
      </div>

      {/* ─── Grupo Drawer ─── */}
      <Drawer open={grupoDrawer} onClose={() => setGrupoDrawer(false)} title={editingGrupo ? 'Editar Grupo' : 'Novo Grupo'} footer={
        <button onClick={saveGrupo} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button>
      }>
        <div className="space-y-6">
          <FormSection title="Dados do Grupo">
            <Input label="Nome" value={grupoForm.nome} onChange={v => setGrupoForm(p => ({ ...p, nome: v }))} required />
            <Textarea label="Descrição" value={grupoForm.descricao} onChange={v => setGrupoForm(p => ({ ...p, descricao: v }))} rows={2} />
          </FormSection>
          <FormSection title="Modelos Vinculados">
            <div className="flex flex-wrap gap-2">
              {modelosDisponiveis.map(m => (
                <button key={m.value} onClick={() => toggleModelo(m.value)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${grupoForm.modelos.includes(m.value) ? 'bg-brand-600/20 text-brand-400 border-brand-600/40' : 'bg-white/5 text-dim border-hud-border hover:bg-white/10'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </FormSection>
        </div>
      </Drawer>

      {/* ─── Item Drawer ─── */}
      <Drawer open={itemDrawer} onClose={() => setItemDrawer(false)} title={editingItem ? 'Editar Item' : 'Novo Item'} footer={
        <button onClick={saveItem} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button>
      }>
        <div className="space-y-6">
          <FormSection title="Item do Checklist">
            <Textarea label="Texto da Pergunta" value={itemForm.texto} onChange={v => setItemForm((p: any) => ({ ...p, texto: v }))} required rows={2} />
            <Select label="Tipo de Resposta" value={itemForm.tipo_resposta} onChange={v => setItemForm((p: any) => ({ ...p, tipo_resposta: v }))} options={tipoRespostaOptions} />
          </FormSection>
          <FormSection title="Configurações">
            <Toggle label="Obrigatório" checked={itemForm.obrigatorio} onChange={v => setItemForm((p: any) => ({ ...p, obrigatorio: v }))} description="Item deve ser preenchido para concluir" />
            <Toggle label="Gera NC" checked={itemForm.gera_nc} onChange={v => setItemForm((p: any) => ({ ...p, gera_nc: v }))} description="Resposta negativa gera não-conformidade" />
          </FormSection>
        </div>
      </Drawer>

      {/* ─── Confirm Dialogs ─── */}
      <ConfirmDialog open={!!delGrupo} onClose={() => setDelGrupo(null)} onConfirm={confirmDelGrupo} title="Excluir Grupo" message={`Deseja excluir "${delGrupo?.nome}"? Todos os itens serão removidos.`} />
      <ConfirmDialog open={!!delItem} onClose={() => setDelItem(null)} onConfirm={confirmDelItem} title="Excluir Item" message={`Deseja excluir "${delItem?.texto}"?`} />
    </div>
  )
}
