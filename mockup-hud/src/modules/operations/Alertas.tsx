import { useState } from 'react'
import { useT } from '../../contexts/LanguageContext'
import { alertas as initAlertas } from '../../mock/data'
import Panel from '../../components/panels/Panel'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from '../../components/ui/Toast'

export default function Alertas() {
  const t = useT()
  const [data, setData] = useState(initAlertas)
  const ack = (id:number) => { setData(p=>p.map(a=>a.id===id?{...a,tratado:true}:a)); toast(t.operations.acknowledged) }
  const pendentes = data.filter(a=>!a.tratado)
  return (
    <div className="space-y-4 h-full">
      <Panel title={t.operations.alerts} status={pendentes.some(a=>a.tipo==='CRITICO')?'crit':'warn'} subtitle={pendentes.length+' '+t.operations.pending} noPad className="h-full">
        <div className="divide-y divide-hud-border/30">
          {data.map(a => (
            <div key={a.id} className={'flex items-start gap-3 px-5 py-4 transition-colors '+(a.tratado?'opacity-40':'hover:bg-white/[0.02]')}>
              {a.tratado ? <CheckCircle2 className="w-5 h-5 text-ok shrink-0 mt-0.5" /> : <AlertTriangle className={'w-5 h-5 shrink-0 mt-0.5 '+(a.tipo==='CRITICO'?'text-crit animate-breathe':'text-warn')} />}
              <div className="flex-1">
                <p className="text-sm text-gray-200">{a.msg}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-mono text-dim">{a.dt}</span>
                  <span className="text-[10px] font-mono text-dim">{a.equip}</span>
                  <span className={'text-[9px] font-mono px-1.5 py-0.5 rounded border '+(a.tipo==='CRITICO'?'text-crit bg-crit/10 border-crit/20':'text-warn bg-warn/10 border-warn/20')}>{a.tipo}</span>
                </div>
              </div>
              {!a.tratado && <button onClick={()=>ack(a.id)} className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-brand-400 bg-brand-600/10 border border-brand-600/30 rounded-md hover:bg-brand-600/20 hover:shadow-glow-sm transition-all">ACK</button>}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}