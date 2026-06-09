import { useState } from 'react'
import { Check, X } from 'lucide-react'

const perfis = ['Administrador', 'Supervisor Operação', 'Operador Sala', 'Analista Manutenção', 'Gestor Qualidade']
const modulos = [
  { nome: 'FROTA', funcs: [
    { nome: 'Equipamentos', acoes: ['V','C','E','D','EX'] },
    { nome: 'Modelos', acoes: ['V','C','E','D'] },
    { nome: 'Contratadas', acoes: ['V','C','E','D'] },
  ]},
  { nome: 'OPERAÇÃO', funcs: [
    { nome: 'Dashboard', acoes: ['V'] },
    { nome: 'Mapa', acoes: ['V'] },
    { nome: 'Atividades Config', acoes: ['V','C','E','D'] },
    { nome: 'Ciclos', acoes: ['V','E'] },
    { nome: 'Alertas', acoes: ['V','C','E'] },
    { nome: 'Mensageria', acoes: ['V','C'] },
  ]},
  { nome: 'MANUTENÇÃO', funcs: [
    { nome: 'Ordens de Serviço', acoes: ['V','C','E','D','AP'] },
    { nome: 'Planos Preventivos', acoes: ['V','C','E','D'] },
    { nome: 'Peças', acoes: ['V','C','E','D'] },
  ]},
  { nome: 'ADMIN', funcs: [
    { nome: 'Usuários', acoes: ['V','C','E','D'] },
    { nome: 'Perfis', acoes: ['V','C','E','D'] },
    { nome: 'Configurações', acoes: ['V','E'] },
  ]},
]

const perms: Record<string, boolean> = {}

export default function Perfis() {
  const [selectedPerfil, setSelectedPerfil] = useState('Supervisor Operação')

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">
      <div className="w-64 bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-3 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-300">Perfis</h3>
          <button className="text-xs text-brand-400">+ Novo</button>
        </div>
        <div className="overflow-y-auto">
          {perfis.map(p => (
            <div key={p} onClick={() => setSelectedPerfil(p)} className={`px-4 py-3 cursor-pointer border-b border-surface-3 transition-colors ${selectedPerfil === p ? 'bg-surface-3 text-brand-400' : 'text-gray-400 hover:bg-surface-2'}`}>
              <span className="text-sm">{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-3">
          <h3 className="text-sm font-medium text-white">Permissões: {selectedPerfil}</h3>
          <p className="text-xs text-gray-500 mt-1">Marque as ações permitidas para cada funcionalidade</p>
        </div>
        <div className="overflow-y-auto h-[calc(100%-5rem)] p-4">
          {modulos.map(mod => (
            <div key={mod.nome} className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 pb-2 border-b border-surface-3">{mod.nome}</h4>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-gray-600 pb-2 w-48">Funcionalidade</th>
                    <th className="text-center text-xs text-gray-600 pb-2 w-12">V</th>
                    <th className="text-center text-xs text-gray-600 pb-2 w-12">C</th>
                    <th className="text-center text-xs text-gray-600 pb-2 w-12">E</th>
                    <th className="text-center text-xs text-gray-600 pb-2 w-12">D</th>
                    <th className="text-center text-xs text-gray-600 pb-2 w-12">EX</th>
                    <th className="text-center text-xs text-gray-600 pb-2 w-12">AP</th>
                  </tr>
                </thead>
                <tbody>
                  {mod.funcs.map(f => (
                    <tr key={f.nome} className="hover:bg-surface-2">
                      <td className="py-1.5 text-sm text-gray-300">{f.nome}</td>
                      {['V','C','E','D','EX','AP'].map(a => (
                        <td key={a} className="text-center py-1.5">
                          {f.acoes.includes(a) ? (
                            <button className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${Math.random() > 0.3 ? 'bg-brand-600/20 text-brand-400 border border-brand-600' : 'bg-surface-3 text-gray-600 border border-surface-4 hover:border-brand-600'}`}>
                              {Math.random() > 0.3 ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          ) : <span className="text-gray-700">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}