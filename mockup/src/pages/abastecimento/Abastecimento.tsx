import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { abastecimentos as init } from '../../mock/data'

const empty = { equip:'', litros:'', operador:'', posto:'', combustivel:'Diesel S10', horimetro:'', odometro:'', dt:'' }

export default function Abastecimento() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const save = () => {
    if (!form.equip||!form.litros||!form.combustivel) { toast('Campos obrigatórios','error'); return }
    if (+form.litros<=0) { toast('Litros deve ser > 0','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,litros:+form.litros,horimetro:+form.horimetro}:r)); toast('Abastecimento atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,litros:+form.litros,horimetro:+form.horimetro,dt:form.dt||new Date().toISOString()}]); toast('Abastecimento registrado') }
    setOpen(false)
  }

  const columns = [
    { key:'equip', label:'Equipamento', render:(r:any)=><span className="font-medium text-brand-400">{r.equip}</span> },
    { key:'litros', label:'Litros', render:(r:any)=><span className="font-mono">{r.litros} L</span> },
    { key:'combustivel', label:'Combustível' },
    { key:'posto', label:'Posto' },
    { key:'operador', label:'Operador' },
    { key:'horimetro', label:'Horímetro', render:(r:any)=>r.horimetro?r.horimetro+'h':'—' },
    { key:'dt', label:'Data/Hora', render:(r:any)=>new Date(r.dt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Registros de Abastecimento" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({equip:r.equip,litros:String(r.litros),operador:r.operador,posto:r.posto,combustivel:r.combustivel,horimetro:String(r.horimetro||''),odometro:'',dt:''});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Abastecimento" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Abastecimento':'Registrar Abastecimento'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Registro">
          <Select label="Equipamento" value={form.equip} onChange={v=>set('equip',v)} required options={[{value:'CAT-01',label:'CAT-01'},{value:'CAT-02',label:'CAT-02'},{value:'CAT-03',label:'CAT-03'},{value:'CAT-04',label:'CAT-04'},{value:'CAT-05',label:'CAT-05'},{value:'ESC-01',label:'ESC-01'},{value:'MOT-01',label:'MOT-01'}]} />
          <FormGrid>
            <Input label="Litros" value={form.litros} onChange={v=>set('litros',v)} type="number" required placeholder="620" />
            <Select label="Combustível" value={form.combustivel} onChange={v=>set('combustivel',v)} required onAdd={()=>toast('Criar combustível','info')} options={[{value:'Diesel S10',label:'Diesel S10'},{value:'Diesel S500',label:'Diesel S500'},{value:'Arla 32',label:'Arla 32'}]} />
          </FormGrid>
          <Select label="Posto" value={form.posto} onChange={v=>set('posto',v)} onAdd={()=>toast('Criar posto','info')} options={[{value:'Central',label:'Central'},{value:'Comboio 01',label:'Comboio 01'},{value:'Comboio 02',label:'Comboio 02'},{value:'Posto Norte',label:'Posto Norte'}]} />
          <Select label="Operador" value={form.operador} onChange={v=>set('operador',v)} options={[{value:'João Silva',label:'João Silva'},{value:'Carlos Santos',label:'Carlos Santos'},{value:'Pedro Costa',label:'Pedro Costa'},{value:'Maria Souza',label:'Maria Souza'}]} />
        </FormSection>
        <FormSection title="Contadores (momento)">
          <FormGrid><Input label="Horímetro" value={form.horimetro} onChange={v=>set('horimetro',v)} type="number" placeholder="12440" helper="Auto-preenchido pelo GPS" /><Input label="Odômetro" value={form.odometro} onChange={v=>set('odometro',v)} type="number" placeholder="84230" /></FormGrid>
          <Input label="Data/Hora" value={form.dt} onChange={v=>set('dt',v)} type="datetime-local" helper="Vazio = agora" />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Abastecimento removido');setDel(null)}} title="Excluir registro?" message="Excluir este abastecimento?" confirmLabel="Excluir" />
  </>)
}