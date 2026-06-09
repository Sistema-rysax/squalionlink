import { useState } from 'react'
import Panel from '../../components/panels/Panel'
import { Input, Select, Toggle, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { Shield, Globe, Mail, Bell, Key } from 'lucide-react'

export default function ConfigTenant() {
  const [form, setForm] = useState({
    // Regional
    timezone:'America/Sao_Paulo', idioma:'pt-BR', formato_data:'DD/MM/YYYY', formato_numero:'1.000,00',
    // Segurança
    mfa:true, sessao_timeout:'480', senha_min:'8', senha_especial:true, senha_maiuscula:true, senha_numero:true,
    tentativas_max:'5', lockout_min:'15',
    // SSO
    sso_ativo:false, sso_provedor:'SAML', sso_entity_id:'', sso_metadata_url:'', sso_redirect_url:'',
    // Email
    smtp_host:'smtp.gmail.com', smtp_port:'587', smtp_user:'noreply@mineradora.com', smtp_senha:'',
    from_email:'noreply@mineradora.com', from_nome:'SqualionLink', usar_tls:true, dkim_ativo:false,
    // Notificações
    notif_email:true, notif_push:true, notif_critico:true, silencio_inicio:'22:00', silencio_fim:'06:00'
  })
  const set = (k:string, v:any) => setForm(p=>({...p,[k]:v}))

  return (
    <div className="space-y-4 max-w-3xl pb-20 overflow-y-auto">
      {/* Regional */}
      <Panel title="Regional" status="neutral" subtitle="LOCALIZAÇÃO & FORMATO">
        <div className="space-y-4">
          <FormGrid>
            <Select label="Timezone" value={form.timezone} onChange={v=>set('timezone',v)} options={[
              {value:'America/Sao_Paulo',label:'São Paulo (UTC-3)'},
              {value:'America/Manaus',label:'Manaus (UTC-4)'},
              {value:'America/Belem',label:'Belém (UTC-3)'},
              {value:'UTC',label:'UTC'}
            ]} />
            <Select label="Idioma Padrão" value={form.idioma} onChange={v=>set('idioma',v)} options={[
              {value:'pt-BR',label:'Português (BR)'},
              {value:'en',label:'English'},
              {value:'es',label:'Español'},
              {value:'de',label:'Deutsch'},
              {value:'fr',label:'Français'}
            ]} />
          </FormGrid>
          <FormGrid>
            <Select label="Formato Data" value={form.formato_data} onChange={v=>set('formato_data',v)} options={[
              {value:'DD/MM/YYYY',label:'DD/MM/YYYY'},
              {value:'MM/DD/YYYY',label:'MM/DD/YYYY'},
              {value:'YYYY-MM-DD',label:'YYYY-MM-DD'}
            ]} />
            <Select label="Formato Número" value={form.formato_numero} onChange={v=>set('formato_numero',v)} options={[
              {value:'1.000,00',label:'1.000,00 (BR)'},
              {value:'1,000.00',label:'1,000.00 (US)'}
            ]} />
          </FormGrid>
        </div>
      </Panel>

      {/* Segurança */}
      <Panel title="Segurança" status="neutral" subtitle="AUTENTICAÇÃO & SENHAS">
        <div className="space-y-4">
          <FormGrid>
            <Toggle label="MFA Obrigatório" checked={form.mfa} onChange={v=>set('mfa',v)} />
            <Input label="Timeout Sessão (min)" value={form.sessao_timeout} onChange={v=>set('sessao_timeout',v)} type="number" />
          </FormGrid>
          <div className="border-t border-hud-border/30 pt-4">
            <h4 className="text-[10px] font-display uppercase tracking-widest text-dim mb-3 flex items-center gap-1.5"><Key className="w-3 h-3"/>Política de Senha</h4>
            <FormGrid>
              <Input label="Mínimo Caracteres" value={form.senha_min} onChange={v=>set('senha_min',v)} type="number" />
              <Input label="Tentativas Máx. Login" value={form.tentativas_max} onChange={v=>set('tentativas_max',v)} type="number" />
            </FormGrid>
            <FormGrid>
              <Input label="Lockout (min)" value={form.lockout_min} onChange={v=>set('lockout_min',v)} type="number" />
            </FormGrid>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <Toggle label="Exigir Especial (!@#)" checked={form.senha_especial} onChange={v=>set('senha_especial',v)} />
              <Toggle label="Exigir Maiúscula" checked={form.senha_maiuscula} onChange={v=>set('senha_maiuscula',v)} />
              <Toggle label="Exigir Número" checked={form.senha_numero} onChange={v=>set('senha_numero',v)} />
            </div>
          </div>
        </div>
      </Panel>

      {/* SSO */}
      <Panel title="SSO (Single Sign-On)" status="neutral" subtitle="SAML / OIDC">
        <div className="space-y-4">
          <Toggle label="SSO Ativo" checked={form.sso_ativo} onChange={v=>set('sso_ativo',v)} />
          {form.sso_ativo && (<>
            <Select label="Provedor" value={form.sso_provedor} onChange={v=>set('sso_provedor',v)} options={[
              {value:'SAML',label:'SAML 2.0'},
              {value:'OIDC',label:'OpenID Connect'}
            ]} />
            <Input label="Entity ID" value={form.sso_entity_id} onChange={v=>set('sso_entity_id',v)} placeholder="https://sso.mineradora.com/entity" />
            <Input label="Metadata URL" value={form.sso_metadata_url} onChange={v=>set('sso_metadata_url',v)} placeholder="https://sso.mineradora.com/.well-known/..." />
            <Input label="Redirect URL" value={form.sso_redirect_url} onChange={v=>set('sso_redirect_url',v)} placeholder="https://app.squalionlink.com/auth/callback" />
          </>)}
        </div>
      </Panel>

      {/* Email SMTP */}
      <Panel title="Email (SMTP)" status="neutral" subtitle="CONFIGURAÇÃO DE ENVIO">
        <div className="space-y-4">
          <FormGrid>
            <Input label="SMTP Host" value={form.smtp_host} onChange={v=>set('smtp_host',v)} />
            <Input label="Porta" value={form.smtp_port} onChange={v=>set('smtp_port',v)} type="number" />
          </FormGrid>
          <FormGrid>
            <Input label="Usuário" value={form.smtp_user} onChange={v=>set('smtp_user',v)} />
            <Input label="Senha" value={form.smtp_senha} onChange={v=>set('smtp_senha',v)} type="password" placeholder="••••••••" />
          </FormGrid>
          <FormGrid>
            <Input label="From Email" value={form.from_email} onChange={v=>set('from_email',v)} />
            <Input label="From Nome" value={form.from_nome} onChange={v=>set('from_nome',v)} />
          </FormGrid>
          <FormGrid>
            <Toggle label="Usar TLS" checked={form.usar_tls} onChange={v=>set('usar_tls',v)} />
            <Toggle label="DKIM Ativo" checked={form.dkim_ativo} onChange={v=>set('dkim_ativo',v)} />
          </FormGrid>
          <button onClick={()=>toast('Conexão testada com sucesso')} className="px-3 py-1.5 text-[10px] font-mono uppercase text-info bg-info/10 border border-info/30 rounded-md hover:shadow-glow-sm transition-all">Testar Conexão</button>
        </div>
      </Panel>

      {/* Notificações */}
      <Panel title="Notificações" status="neutral" subtitle="PREFERÊNCIAS GLOBAIS">
        <div className="space-y-4">
          <Toggle label="Notificações por Email" checked={form.notif_email} onChange={v=>set('notif_email',v)} />
          <Toggle label="Notificações Push" checked={form.notif_push} onChange={v=>set('notif_push',v)} />
          <Toggle label="Alertas Críticos (sempre, ignora silêncio)" checked={form.notif_critico} onChange={v=>set('notif_critico',v)} />
          <div className="border-t border-hud-border/30 pt-4">
            <h4 className="text-[10px] font-display uppercase tracking-widest text-dim mb-3">Horário Silencioso</h4>
            <FormGrid>
              <Input label="Início" value={form.silencio_inicio} onChange={v=>set('silencio_inicio',v)} type="time" />
              <Input label="Fim" value={form.silencio_fim} onChange={v=>set('silencio_fim',v)} type="time" />
            </FormGrid>
          </div>
        </div>
      </Panel>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={()=>toast('Configurações salvas')} className="px-5 py-2.5 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar Todas Configurações</button>
      </div>
    </div>
  )
}