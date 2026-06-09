import { TrendingUp, Truck, AlertTriangle, Gauge, Target, Clock, Fuel, Zap } from 'lucide-react'
import { kpis, equipamentos } from '../../mock/data'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const prodData = Array.from({length: 12}, (_, i) => ({ hora: `${6+i}:00`, produzido: Math.floor(800 + Math.random() * 600), meta: 1500 }))
const dfData = Array.from({length: 12}, (_, i) => ({ hora: `${6+i}:00`, df: 75 + Math.random() * 15 }))
const statusData = [
  { name: 'Operando', value: kpis.equipOperando, color: '#22c55e' },
  { name: 'Parado', value: kpis.equipParado, color: '#eab308' },
  { name: 'Manutenção', value: kpis.equipManutencao, color: '#ef4444' },
]

function KPICard({ icon: Icon, label, value, unit, trend, color }: any) {
  const colorMap: Record<string,string> = { green: 'text-green-400', blue: 'text-blue-400', purple: 'text-purple-400', cyan: 'text-cyan-400', yellow: 'text-yellow-400', orange: 'text-orange-400', violet: 'text-violet-400' }
  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${colorMap[color] || 'text-gray-400'}`} />
        {trend !== undefined && trend !== 0 && <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value}<span className="text-sm font-normal text-gray-500 ml-1">{unit}</span></p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <KPICard icon={Gauge} label="Disponibilidade Física" value={kpis.df} unit="%" trend={2.1} color="green" />
        <KPICard icon={Target} label="Utilização Física" value={kpis.uf} unit="%" trend={-1.3} color="blue" />
        <KPICard icon={TrendingUp} label="Produção Turno" value={`${(kpis.producaoTurno/1000).toFixed(1)}k`} unit="ton" trend={5.4} color="purple" />
        <KPICard icon={Clock} label="Ciclos/Hora" value={kpis.ciclosHora} unit="c/h" trend={0} color="cyan" />
        <KPICard icon={Truck} label="Operando" value={kpis.equipOperando} unit={`/${kpis.equipTotal}`} color="green" />
        <KPICard icon={AlertTriangle} label="Alertas" value={kpis.alertasAbertos} unit="abertos" color="yellow" />
        <KPICard icon={Zap} label="Vel. Média" value={kpis.velocidadeMedia} unit="km/h" color="orange" />
        <KPICard icon={Fuel} label="Consumo" value="4.230" unit="L hoje" color="violet" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Produção por Hora (ton)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={prodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222230" />
              <XAxis dataKey="hora" tick={{fill: '#6b7280', fontSize: 11}} />
              <YAxis tick={{fill: '#6b7280', fontSize: 11}} />
              <Tooltip contentStyle={{background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8}} />
              <Area type="monotone" dataKey="produzido" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Area type="monotone" dataKey="meta" stroke="#6b7280" fill="none" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Status da Frota</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={{background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{background: s.color}}></div>
                <span className="text-xs text-gray-400">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">DF% por Hora</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222230" />
              <XAxis dataKey="hora" tick={{fill: '#6b7280', fontSize: 11}} />
              <YAxis domain={[60, 100]} tick={{fill: '#6b7280', fontSize: 11}} />
              <Tooltip contentStyle={{background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8}} />
              <Bar dataKey="df" fill="#22c55e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Equipamentos — Status Atual</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {equipamentos.map(e => (
              <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{background: e.cor}}></div>
                <span className="text-sm font-medium text-gray-200 w-16">{e.codigo}</span>
                <span className="text-xs text-gray-500 flex-1">{e.atividade || 'Sem atividade'}</span>
                <span className="text-xs text-gray-400">{e.operador || '—'}</span>
                <span className="text-xs text-gray-600">{e.vel} km/h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
