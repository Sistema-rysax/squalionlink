import { useState } from 'react'
import { Input, Select, FormSection, FormGrid, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { User, Bell, Globe, Shield } from 'lucide-react'

export default function MeuPerfil() {
  const [form, setForm] = useState({ nome:'Kleyton Miranda', email:'kleyton@mineradoraabc.com', telefone:'(31) 99999-0000', idioma:'pt-BR', timezone:'America/Sao_Paulo' })
  const [notifs, setNotifs] = useState({ alerta_web:true, alerta_email:false, os_web:true, os_email:true, checklist_nc:true, fechamento:true })
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  return (<div className="max-w-3xl space-y-6">
    <h1 className="text-xl font-semibold text-white flex items-center gap-2"><User className="w-5 h-5"/>Minha Conta</h1>

    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-5">
      <FormSection title="Dados Pessoais">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold text-white">KM</div>
          <div><p className="text-gray-200 font-medium">Kleyton Miranda</p><p className="text-xs text-gray-500">Administrador — Mineradora ABC</p></div>
        </div>
        <FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} /><Input label="Email" value={form.email} onChange={v=>set('email',v)} disabled /></FormGrid>
        <Input label="Telefone" value={form.telefone} onChange={v=>set('telefone',v)} />
      </FormSection>
    </div>

    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-5">
      <FormSection title="Preferências">
        <FormGrid>
          <Select label="Idioma" value={form.idioma} onChange={v=>set('idioma',v)} options={[{value:'pt-BR',label:'Português (BR)'},{value:'en',label:'English'},{value:'es',label:'Español'},{value:'de',label:'Deutsch'},{value:'fr',label:'Français'}]} />
          <Select label="Fuso Horário" value={form.timezone} onChange={v=>set('timezone',v)} options={[{value:'America/Sao_Paulo',label:'Brasília (UTC-3)'},{value:'America/Manaus',label:'Manaus (UTC-4)'},{value:'UTC',label:'UTC'}]} />
        </FormGrid>
      </FormSection>
    </div>

    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-300"><Bell className="w-4 h-4"/>Notificações</div>
      <div className="space-y-3">
        <Switch label="Alertas operacionais — Web" checked={notifs.alerta_web} onChange={v=>setNotifs(p=>({...p,alerta_web:v}))} />
        <Switch label="Alertas operacionais — Email" checked={notifs.alerta_email} onChange={v=>setNotifs(p=>({...p,alerta_email:v}))} />
        <Switch label="OS atribuída — Web" checked={notifs.os_web} onChange={v=>setNotifs(p=>({...p,os_web:v}))} />
        <Switch label="OS atribuída — Email" checked={notifs.os_email} onChange={v=>setNotifs(p=>({...p,os_email:v}))} />
        <Switch label="Checklist NC" checked={notifs.checklist_nc} onChange={v=>setNotifs(p=>({...p,checklist_nc:v}))} />
        <Switch label="Fechamento de período" checked={notifs.fechamento} onChange={v=>setNotifs(p=>({...p,fechamento:v}))} />
      </div>
    </div>

    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-300"><Shield className="w-4 h-4"/>Segurança</div>
      <div className="space-y-3">
        <button className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300 hover:bg-surface-3">Alterar Senha</button>
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Autenticação 2FA</span><span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">Ativo (TOTP)</span></div>
      </div>
    </div>

    <button onClick={()=>toast('Preferências salvas')} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg">Salvar Alterações</button>
  </div>)
}