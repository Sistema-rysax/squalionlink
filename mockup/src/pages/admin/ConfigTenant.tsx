import { Shield, Mail, Key, Globe } from 'lucide-react'
export default function ConfigTenant() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-brand-400" /> Política de Senha</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Mínimo de caracteres</span><span className="text-sm text-white bg-surface-2 px-3 py-1 rounded">8</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Requer maiúscula</span><span className="text-xs text-green-400">✓ Sim</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Requer número</span><span className="text-xs text-green-400">✓ Sim</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Requer especial</span><span className="text-xs text-gray-500">✗ Não</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Expira em</span><span className="text-sm text-white">Nunca</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Tentativas antes de bloquear</span><span className="text-sm text-white">5</span></div>
        </div>
      </div>
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4"><Key className="w-4 h-4 text-brand-400" /> MFA (Multi-Factor)</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">MFA obrigatório</span><span className="text-xs text-yellow-400">Não (recomendado)</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Tipos permitidos</span><span className="text-xs text-gray-300">TOTP, Email</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Usuários com MFA</span><span className="text-sm text-white">3/5 (60%)</span></div>
        </div>
      </div>
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-brand-400" /> SSO — Microsoft Entra ID</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Status</span><span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">Configurado</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Tenant ID</span><span className="text-xs text-gray-300 font-mono">a1b2c3d4-...</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Auto-provisionar</span><span className="text-xs text-green-400">✓ Ativo</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Domínio</span><span className="text-xs text-gray-300">@mineradoraabc.com</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Perfil padrão</span><span className="text-xs text-gray-300">Operador Sala</span></div>
        </div>
      </div>
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4"><Mail className="w-4 h-4 text-brand-400" /> Email</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Provider</span><span className="text-sm text-white">AWS SES</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">From</span><span className="text-xs text-gray-300">no-reply@squalionlink.com</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Enviados hoje</span><span className="text-sm text-white">12</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Fila</span><span className="text-sm text-green-400">0 pendentes</span></div>
        </div>
      </div>
    </div>
  )
}