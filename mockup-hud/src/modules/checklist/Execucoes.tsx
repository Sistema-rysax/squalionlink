import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import { FormSection } from '../../components/controls/FormFields'

/* ─── Types ─── */
type Resultado = 'CONFORME' | 'NC' | 'PARCIAL'
type TipoResposta = 'SIM_NAO' | 'NOTA_1_5' | 'TEXTO_LIVRE' | 'NUMERO' | 'FOTO'

interface ItemResposta {
  texto: string
  tipo_resposta: TipoResposta
  resposta: string | number | boolean
  gera_nc: boolean
  nc_gerada: boolean
}

interface Execucao {
  id: number
  dt: string
  equipamento: string
  operador: string
  grupo_checklist: string
  resultado: Resultado
  duracao: string
  itens: ItemResposta[]
}

/* ─── Mock Data ─── */
const mockExecucoes: Execucao[] = [
  {
    id: 1, dt: '09/06 06:05', equipamento: 'CAT-01', operador: 'João Silva',
    grupo_checklist: 'Pré-Operação Caminhão', resultado: 'CONFORME', duracao: '4m 32s',
    itens: [
      { texto: 'Nível de óleo do motor dentro da faixa', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Pressão dos pneus (verificar todos)', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Sistema de freios funcionando', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Iluminação e faróis operacionais', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Extintor de incêndio válido', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Nota geral condição da cabine', tipo_resposta: 'NOTA_1_5', resposta: 4, gera_nc: false, nc_gerada: false },
      { texto: 'Horímetro atual', tipo_resposta: 'NUMERO', resposta: 12450, gera_nc: false, nc_gerada: false },
      { texto: 'Observações adicionais', tipo_resposta: 'TEXTO_LIVRE', resposta: 'Tudo em ordem', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 2, dt: '09/06 06:10', equipamento: 'CAT-04', operador: 'Pedro Costa',
    grupo_checklist: 'Pré-Operação Caminhão', resultado: 'NC', duracao: '5m 15s',
    itens: [
      { texto: 'Nível de óleo do motor dentro da faixa', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Pressão dos pneus (verificar todos)', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: true },
      { texto: 'Sistema de freios funcionando', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Iluminação e faróis operacionais', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: false, nc_gerada: false },
      { texto: 'Extintor de incêndio válido', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: true },
      { texto: 'Nota geral condição da cabine', tipo_resposta: 'NOTA_1_5', resposta: 2, gera_nc: false, nc_gerada: false },
      { texto: 'Horímetro atual', tipo_resposta: 'NUMERO', resposta: 9800, gera_nc: false, nc_gerada: false },
      { texto: 'Observações adicionais', tipo_resposta: 'TEXTO_LIVRE', resposta: 'Pneu traseiro esquerdo com pressão baixa, extintor vencido', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 3, dt: '09/06 06:00', equipamento: 'ESC-01', operador: 'Ana Souza',
    grupo_checklist: 'Troca de Turno', resultado: 'CONFORME', duracao: '3m 08s',
    itens: [
      { texto: 'Equipamento limpo e organizado', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Danos visíveis na estrutura', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: false },
      { texto: 'Nível de combustível', tipo_resposta: 'NUMERO', resposta: 82, gera_nc: false, nc_gerada: false },
      { texto: 'Ferramentas a bordo conferidas', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Nota condição geral', tipo_resposta: 'NOTA_1_5', resposta: 5, gera_nc: false, nc_gerada: false },
      { texto: 'Foto painel de instrumentos', tipo_resposta: 'FOTO', resposta: 'foto_001.jpg', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 4, dt: '09/06 06:02', equipamento: 'ESC-02', operador: 'Marcos Lima',
    grupo_checklist: 'Inspeção Semanal', resultado: 'PARCIAL', duracao: '8m 42s',
    itens: [
      { texto: 'Sistema hidráulico sem vazamentos', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Correia do alternador em bom estado', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: true },
      { texto: 'Filtro de ar primário (condição)', tipo_resposta: 'NOTA_1_5', resposta: 3, gera_nc: false, nc_gerada: false },
      { texto: 'Folga nos parafusos da roda', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Leitura pressão do turbo (bar)', tipo_resposta: 'NUMERO', resposta: 2.4, gera_nc: false, nc_gerada: false },
      { texto: 'Foto geral do equipamento', tipo_resposta: 'FOTO', resposta: 'foto_002.jpg', gera_nc: false, nc_gerada: false },
      { texto: 'Observações manutenção preventiva', tipo_resposta: 'TEXTO_LIVRE', resposta: 'Correia com desgaste, agendar troca', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 5, dt: '08/06 18:15', equipamento: 'CAT-02', operador: 'Carlos Santos',
    grupo_checklist: 'Pré-Operação Caminhão', resultado: 'NC', duracao: '6m 01s',
    itens: [
      { texto: 'Nível de óleo do motor dentro da faixa', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: true },
      { texto: 'Pressão dos pneus (verificar todos)', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: true },
      { texto: 'Sistema de freios funcionando', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Iluminação e faróis operacionais', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Extintor de incêndio válido', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: true },
      { texto: 'Nota geral condição da cabine', tipo_resposta: 'NOTA_1_5', resposta: 1, gera_nc: false, nc_gerada: false },
      { texto: 'Horímetro atual', tipo_resposta: 'NUMERO', resposta: 11200, gera_nc: false, nc_gerada: false },
      { texto: 'Observações adicionais', tipo_resposta: 'TEXTO_LIVRE', resposta: 'Múltiplas falhas identificadas, encaminhar para manutenção', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 6, dt: '08/06 18:00', equipamento: 'MOT-01', operador: 'José Santos',
    grupo_checklist: 'Troca de Turno', resultado: 'CONFORME', duracao: '2m 55s',
    itens: [
      { texto: 'Equipamento limpo e organizado', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Danos visíveis na estrutura', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: false },
      { texto: 'Nível de combustível', tipo_resposta: 'NUMERO', resposta: 60, gera_nc: false, nc_gerada: false },
      { texto: 'Ferramentas a bordo conferidas', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Nota condição geral', tipo_resposta: 'NOTA_1_5', resposta: 4, gera_nc: false, nc_gerada: false },
      { texto: 'Foto painel de instrumentos', tipo_resposta: 'FOTO', resposta: 'foto_003.jpg', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 7, dt: '08/06 14:30', equipamento: 'CAT-05', operador: 'Roberto Lima',
    grupo_checklist: 'Pré-Operação Caminhão', resultado: 'CONFORME', duracao: '4m 10s',
    itens: [
      { texto: 'Nível de óleo do motor dentro da faixa', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Pressão dos pneus (verificar todos)', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Sistema de freios funcionando', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Iluminação e faróis operacionais', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Extintor de incêndio válido', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Nota geral condição da cabine', tipo_resposta: 'NOTA_1_5', resposta: 5, gera_nc: false, nc_gerada: false },
      { texto: 'Horímetro atual', tipo_resposta: 'NUMERO', resposta: 10500, gera_nc: false, nc_gerada: false },
      { texto: 'Observações adicionais', tipo_resposta: 'TEXTO_LIVRE', resposta: '', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 8, dt: '08/06 06:05', equipamento: 'PER-01', operador: 'Luis Ferreira',
    grupo_checklist: 'Inspeção Semanal', resultado: 'CONFORME', duracao: '7m 20s',
    itens: [
      { texto: 'Sistema hidráulico sem vazamentos', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Correia do alternador em bom estado', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Filtro de ar primário (condição)', tipo_resposta: 'NOTA_1_5', resposta: 4, gera_nc: false, nc_gerada: false },
      { texto: 'Folga nos parafusos da roda', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Leitura pressão do turbo (bar)', tipo_resposta: 'NUMERO', resposta: 2.8, gera_nc: false, nc_gerada: false },
      { texto: 'Foto geral do equipamento', tipo_resposta: 'FOTO', resposta: 'foto_004.jpg', gera_nc: false, nc_gerada: false },
      { texto: 'Observações manutenção preventiva', tipo_resposta: 'TEXTO_LIVRE', resposta: 'Sem pendências', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 9, dt: '07/06 18:10', equipamento: 'TRT-01', operador: 'Felipe Oliveira',
    grupo_checklist: 'Troca de Turno', resultado: 'PARCIAL', duracao: '3m 45s',
    itens: [
      { texto: 'Equipamento limpo e organizado', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: false, nc_gerada: false },
      { texto: 'Danos visíveis na estrutura', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: false },
      { texto: 'Nível de combustível', tipo_resposta: 'NUMERO', resposta: 56, gera_nc: false, nc_gerada: false },
      { texto: 'Ferramentas a bordo conferidas', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Nota condição geral', tipo_resposta: 'NOTA_1_5', resposta: 3, gera_nc: false, nc_gerada: false },
      { texto: 'Foto painel de instrumentos', tipo_resposta: 'FOTO', resposta: 'foto_005.jpg', gera_nc: false, nc_gerada: false },
    ]
  },
  {
    id: 10, dt: '07/06 06:00', equipamento: 'CAT-03', operador: 'Ricardo Mendes',
    grupo_checklist: 'Pré-Operação Caminhão', resultado: 'NC', duracao: '5m 50s',
    itens: [
      { texto: 'Nível de óleo do motor dentro da faixa', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: true },
      { texto: 'Pressão dos pneus (verificar todos)', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Sistema de freios funcionando', tipo_resposta: 'SIM_NAO', resposta: false, gera_nc: true, nc_gerada: true },
      { texto: 'Iluminação e faróis operacionais', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: false, nc_gerada: false },
      { texto: 'Extintor de incêndio válido', tipo_resposta: 'SIM_NAO', resposta: true, gera_nc: true, nc_gerada: false },
      { texto: 'Nota geral condição da cabine', tipo_resposta: 'NOTA_1_5', resposta: 2, gera_nc: false, nc_gerada: false },
      { texto: 'Horímetro atual', tipo_resposta: 'NUMERO', resposta: 13800, gera_nc: false, nc_gerada: false },
      { texto: 'Observações adicionais', tipo_resposta: 'TEXTO_LIVRE', resposta: 'Nível de óleo crítico, freio com resposta lenta', gera_nc: false, nc_gerada: false },
    ]
  },
]

/* ─── Render Helpers ─── */
function renderResposta(item: ItemResposta) {
  switch (item.tipo_resposta) {
    case 'SIM_NAO': {
      const val = item.resposta as boolean
      return <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${val ? 'bg-ok/10 text-ok border-ok/20' : 'bg-crit/10 text-crit border-crit/20'}`}>{val ? 'SIM' : 'NÃO'}</span>
    }
    case 'NOTA_1_5': {
      const nota = item.resposta as number
      return (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} className={`text-sm ${n <= nota ? 'text-warn' : 'text-gray-700'}`}>★</span>
          ))}
          <span className="text-[10px] font-mono text-dim ml-1">({nota}/5)</span>
        </div>
      )
    }
    case 'TEXTO_LIVRE':
      return <span className="text-xs text-gray-400 italic">{item.resposta as string || '—'}</span>
    case 'NUMERO':
      return <span className="text-xs font-mono text-brand-400">{item.resposta as number}</span>
    case 'FOTO':
      return <span className="text-xs text-info">📷 {item.resposta as string}</span>
    default:
      return <span className="text-dim">—</span>
  }
}

const resultadoBadge: Record<Resultado, string> = {
  CONFORME: 'bg-ok/10 text-ok border-ok/20',
  NC: 'bg-crit/10 text-crit border-crit/20',
  PARCIAL: 'bg-warn/10 text-warn border-warn/20',
}

export default function Execucoes() {
  const [selected, setSelected] = useState<Execucao | null>(null)

  const columns = [
    { key: 'dt', label: 'Data/Hora', render: (r: any) => <span className="font-mono text-dim">{r.dt}</span> },
    { key: 'equipamento', label: 'Equipamento', render: (r: any) => <span className="text-brand-400 font-bold">{r.equipamento}</span> },
    { key: 'operador', label: 'Operador' },
    { key: 'grupo_checklist', label: 'Checklist' },
    { key: 'resultado', label: 'Resultado', render: (r: any) => <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${resultadoBadge[r.resultado as Resultado]}`}>{r.resultado}</span> },
    { key: 'duracao', label: 'Duração', render: (r: any) => <span className="font-mono text-dim">{r.duracao}</span> },
  ]

  const totalItens = selected?.itens.length || 0
  const totalConformes = selected?.itens.filter(it => {
    if (it.tipo_resposta === 'SIM_NAO') return it.resposta === true
    return !it.nc_gerada
  }).length || 0
  const totalNCs = selected?.itens.filter(it => it.nc_gerada).length || 0

  return (<>
    <DataTable columns={columns} data={mockExecucoes} title="Execuções de Checklist" status="ok" onEdit={setSelected} />
    <Drawer open={!!selected} onClose={() => setSelected(null)} title="Detalhe da Execução" subtitle={`${selected?.equipamento} — ${selected?.dt}`}>
      {selected && <div className="space-y-6">
        {/* Summary */}
        <FormSection title="Resumo">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3 text-center">
              <span className="text-[10px] text-dim font-mono block">CHECKLIST</span>
              <span className="text-xs text-gray-300">{selected.grupo_checklist}</span>
            </div>
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3 text-center">
              <span className="text-[10px] text-dim font-mono block">OPERADOR</span>
              <span className="text-xs text-gray-300">{selected.operador}</span>
            </div>
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3 text-center">
              <span className="text-[10px] text-dim font-mono block">DURAÇÃO</span>
              <span className="text-xs font-mono text-brand-400">{selected.duracao}</span>
            </div>
          </div>
        </FormSection>

        {/* Items */}
        <FormSection title="Itens Respondidos">
          <div className="space-y-1">
            {selected.itens.map((item, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${item.nc_gerada ? 'bg-crit/5 border-crit/30' : 'bg-hud-bg border-hud-border/50'}`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {item.nc_gerada && <span className="text-[9px] px-1 py-0 rounded bg-crit/20 text-crit border border-crit/30 font-mono shrink-0">NC</span>}
                  <span className={`text-xs truncate ${item.nc_gerada ? 'text-crit' : 'text-gray-300'}`}>{item.texto}</span>
                </div>
                <div className="shrink-0 ml-3">{renderResposta(item)}</div>
              </div>
            ))}
          </div>
        </FormSection>

        {/* Footer stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-hud-border">
          <div className="text-center">
            <span className="text-lg font-mono text-gray-200">{totalItens}</span>
            <span className="text-[10px] text-dim block">Total Itens</span>
          </div>
          <div className="text-center">
            <span className="text-lg font-mono text-ok">{totalConformes}</span>
            <span className="text-[10px] text-dim block">Conformes</span>
          </div>
          <div className="text-center">
            <span className="text-lg font-mono text-crit">{totalNCs}</span>
            <span className="text-[10px] text-dim block">NCs</span>
          </div>
        </div>
      </div>}
    </Drawer>
  </>)
}
