import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import { FormSection } from '../../components/controls/FormFields'

const init = [
  { id:1, checklist:'Pré-Operação Caminhão', equip:'CAT-01', operador:'João Silva', data:'09/06 06:05', status:'CONFORME', itens_total:12, itens_ok:12, ncs:0 },
  { id:2, checklist:'Pré-Operação Caminhão', equip:'CAT-04', operador:'Pedro Costa', data:'09/06 06:10', status:'NAO_CONFORME', itens_total:12, itens_ok:10, ncs:2 },
  { id:3, checklist:'Segurança Diária', equip:'ESC-01', operador:'Ana Souza', data:'09/06 06:00', status:'CONFORME', itens_total:8, itens_ok:8, ncs:0 },
  { id:4, checklist:'Pré-Operação Escavadeira', equip:'ESC-02', operador:'Marcos Lima', data:'09/06 06:02', status:'CONFORME', itens_total:10, itens_ok:10, ncs:0 },
  { id:5, checklist:'Pré-Operação Caminhão', equip:'CAT-02', operador:'Carlos Santos', data:'08/06 18:15', status:'NAO_CONFORME', itens_total:12, itens_ok:9, ncs:3 },
]

const respostas = [
  { item:'Nível de óleo motor', resposta:'OK', obs:'' },
  { item:'Pressão dos pneus', resposta:'NOK', obs:'Pneu traseiro esquerdo com pressão baixa' },
  { item:'Freios', resposta:'OK', obs:'' },
  { item:'Iluminação', resposta:'OK', obs:'' },
  { item:'Extintor', resposta:'NOK', obs:'Extintor vencido' },
]

export default function Execucoes() {
  const [selected, setSelected] = useState<any>(null)

  const columns = [
    { key:'checklist', label:'Checklist' },
    { key:'equip', label:'Equip', render:(r:any)=><span className="text-brand-400 font-bold">{r.equip}</span> },
    { key:'operador', label:'Operador' },
    { key:'data', label:'Data', render:(r:any)=><span className="font-mono text-dim">{r.data}</span> },
    { key:'status', label:'Status', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.status==='CONFORME'?'bg-ok/10 text-ok border-ok/20':'bg-crit/10 text-crit border-crit/20')}>{r.status==='CONFORME'?'Conforme':'Não Conforme'}</span> },
    { key:'ncs', label:'NCs', render:(r:any)=><span className={'font-mono '+(r.ncs>0?'text-crit':'text-dim')}>{r.ncs}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={init} title="Execuções de Checklist" status="ok" onEdit={setSelected} />
    <Drawer open={!!selected} onClose={()=>setSelected(null)} title="Detalhe da Execução" subtitle={selected?.equip+' — '+selected?.data}>
      {selected && <div className="space-y-6">
        <FormSection title="Resumo">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3"><span className="text-[10px] text-dim font-mono block">CHECKLIST</span><span className="text-sm text-gray-300">{selected.checklist}</span></div>
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3"><span className="text-[10px] text-dim font-mono block">OPERADOR</span><span className="text-sm text-gray-300">{selected.operador}</span></div>
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3"><span className="text-[10px] text-dim font-mono block">ITENS</span><span className="font-mono text-gray-200">{selected.itens_ok}/{selected.itens_total}</span></div>
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3"><span className="text-[10px] text-dim font-mono block">NÃO CONFORMIDADES</span><span className={'font-mono '+(selected.ncs>0?'text-crit':'text-ok')}>{selected.ncs}</span></div>
          </div>
        </FormSection>
        <FormSection title="Respostas">
          <div className="space-y-2">
            {respostas.map((r,i)=>(
              <div key={i} className="flex items-center justify-between bg-hud-bg border border-hud-border rounded-lg p-3">
                <span className="text-sm text-gray-300">{r.item}</span>
                <div className="flex items-center gap-2">
                  {r.obs && <span className="text-[10px] text-dim max-w-[200px] truncate">{r.obs}</span>}
                  <span className={'px-2 py-0.5 rounded text-[10px] border '+(r.resposta==='OK'?'bg-ok/10 text-ok border-ok/20':'bg-crit/10 text-crit border-crit/20')}>{r.resposta}</span>
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      </div>}
    </Drawer>
  </>)
}
