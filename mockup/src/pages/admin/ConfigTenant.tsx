import { useState } from 'react'
import { Input, Select, FormSection, FormGrid, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { Building2 } from 'lucide-react'

export default function ConfigTenant() {
  const [form, setForm] = useState({ nome:'Mineradora ABC', razao:'Mineradora ABC S.A.', cnpj:'12.345.678/0001-90', plano:'ENTERPRISE', timezone:'America/Sao_Paulo', idioma_padrao:'pt-BR', mfa_obrigatorio:true, sessao_timeout:'480', logo_url:'' })
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  return (<div className="max-w-3xl space-y-6">
    <h1 className="text-xl font-semibold text-white flex items-center gap-2"><Building2 className="w-5 h-5"/>Configurações do Tenant</h1>

    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-5">
      <FormSection title="Dados da Empresa">
        <Input label="Nome Fantasia" value={form.nome} onChange={v=>set('nome',v)} />
        <Input label="Razão Social" value={form.razao} onChange={v=>set('razao',v)} />
        <FormGrid><Input label="CNPJ" value={form.cnpj} onChange={v=>set('cnpj',v)} disabled /><Select label="Plano" value={form.plano} onChange={v=>set('plano',v)} options={[{value:'BASIC',label:'🥉 Basic'},{value:'PROFESSIONAL',label:'🥈 Professional'},{value:'ENTERPRISE',label:'🥇 Enterprise'}]} /></FormGrid>
      </FormSection>
    </div>

    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-5">
      <FormSection title="Localização & Idioma">
        <FormGrid>
          <Select label="Timezone" value={form.timezone} onChange={v=>set('timezone',v)} options={[{value:'America/Sao_Paulo',label:'Brasília (UTC-3)'},{value:'America/Manaus',label:'Manaus (UTC-4)'},{value:'America/Belem',label:'Belém (UTC-3)'},{value:'UTC',label:'UTC'}]} />
          <Select label="Idioma Padrão" value={form.idioma_padrao} onChange={v=>set('idioma_padrao',v)} options={[{value:'pt-BR',label:'Português'},{value:'en',label:'English'},{value:'es',label:'Español'}]} />
        </FormGrid>
      </FormSection>
    </div>

    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-5">
      <FormSection title="Segurança">
        <Switch label="MFA Obrigatório para todos" checked={form.mfa_obrigatorio} onChange={v=>set('mfa_obrigatorio',v)} description="Todos os usuários serão obrigados a ativar 2FA" />
        <Input label="Timeout de Sessão (minutos)" value={form.sessao_timeout} onChange={v=>set('sessao_timeout',v)} type="number" helper="Após inatividade, desconecta o usuário" />
      </FormSection>
    </div>

    <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 space-y-5">
      <FormSection title="Aparência">
        <Input label="URL do Logo" value={form.logo_url} onChange={v=>set('logo_url',v)} placeholder="https://..." helper="PNG ou SVG. Exibido no topbar e relatórios." />
      </FormSection>
    </div>

    <button onClick={()=>toast('Configurações salvas')} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg">Salvar</button>
  </div>)
}