import { useNavigate } from 'react-router-dom'
export default function Login() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">SL</div>
          <h1 className="text-2xl font-bold text-white">SqualionLink</h1>
          <p className="text-sm text-gray-500 mt-1">Fleet Management System</p>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Email</label>
            <input type="email" defaultValue="kleyton@mineradoraabc.com" className="w-full px-4 py-2.5 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Senha</label>
            <input type="password" defaultValue="••••••••" className="w-full px-4 py-2.5 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-brand-500" />
          </div>
          <button onClick={() => nav('/dashboard')} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Entrar</button>
          <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-3"></div></div><div className="relative flex justify-center"><span className="px-3 bg-surface-1 text-xs text-gray-600">ou</span></div></div>
          <button onClick={() => nav('/dashboard')} className="w-full py-2.5 bg-surface-2 hover:bg-surface-3 border border-surface-4 rounded-lg text-sm text-gray-300 font-medium transition-colors flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
            Entrar com Microsoft
          </button>
          <p className="text-xs text-gray-600 text-center mt-3">Esqueci minha senha • Primeiro acesso</p>
        </div>
      </div>
    </div>
  )
}