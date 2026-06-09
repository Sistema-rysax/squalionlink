import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id: 1, nome: 'Caterpillar 777G', fabricante: 'Caterpillar', grupo: 'Caminhão', tipo_operacao: 'TRANSPORTE', capacidade: 98, tanque: 800, potencia: 938, velocidade_max: 65, consumo_ref: 62, equips: 5 },
  { id: 2, nome: 'Komatsu PC5500', fabricante: 'Komatsu', grupo: 'Escavadeira', tipo_operacao: 'CARGA', capacidade: 0, tanque: 3200, potencia: 2000, velocidade_max: 5, consumo_ref: 175, equips: 1 },
  { id: 3, nome: 'CAT 6060', fabricante: 'Caterpillar', grupo: 'Escavadeira', tipo_operacao: 'CARGA', capacidade: 0, tanque: 2800, potencia: 1715, velocidade_max: 5, consumo_ref: 160, equips: 1 },
  { id: 4, nome: 'CAT 16M', fabricante: 'Caterpillar', grupo: 'Motoniveladora', tipo_operacao: 'APOIO', capacidade: 0, tanque: 450, potencia: 269, velocidade_max: 45, consumo_ref: 28, equips: 1 },
  { id: 5, nome: 'CAT D10T', fabricante: 'Caterpillar', grupo: 'Trator Esteira', tipo_operacao: 'APOIO', capacidade: 0, tanque: 1050, potencia: 580, velocidade_max: 12, consumo_ref: 55, equips: 1 },
  { id: 6, nome: 'Atlas Copco D65', fabricante: 'Atlas Copco', grupo: 'Perfuratriz', tipo_operacao: 'APOIO', capacidade: 0, tanque: 400, potencia: 420, velocidade_max: 3, consumo_ref: 35, equips: 1 },
]
const empty = { nome:'', fabricante:'', grupo:'', tipo_operacao:'TRANSPORTE', capacidade:'', tanque:'', potencia:'', velocidade_max:'', consumo_ref:'' }

export default function Modelos() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome || !form.fabricante || !form.grupo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,capacidade:+form.capacidade,tanque:+form.tanque,potencia:+form.potencia,velocidade_max:+form.velocidade_max,consumo_ref:+form.consumo_ref}:r)); toast('Modelo atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,capacidade:+form.capacidade,tanque:+form.tanque,potencia:+form.potencia,velocidade_max:+form.velocidade_max,consumo_ref:+form.consumo_ref,equips:0}]); toast('Modelo criado') }
    setOpen(false)
  }

  const columns = [
    { key: 'nome', label: 'Modelo' },
    { key: 'fabricante', label: 'Fabricante' },
    { key: 'grupo', label: 'Grupo' },
    { key: 'tipo_operacao', label: 'Tipo', render: (r:any) => <span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.tipo_operacao}</span> },
    { key: 'capacidade', label: 'Capacidade', render: (r:any) => r.capacidade ? r.capacidade+' ton' : '—' },
    { key: 'tanque', label: 'Tanque', render: (r:any) => r.tanque+' L' },
    { key: 'potencia', label: 'Potência', render: (r:any) => r.potencia+' hp' },
    { key: 'consumo_ref', label: 'Consumo Ref.', render: (r:any) => r.consumo_ref+' L/h' },
    { key: 'equips', label: 'Equips', render: (r:any) => <span className="px-2 py-0.5 bg-brand-900/30 text-brand-400 rounded text-xs">{r.equips}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Modelos de Equipamento" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}}
      onEdit={(r)=>{setForm({nome:r.nome,fabricante:r.fabricante,grupo:r.grupo,tipo_operacao:r.tipo_operacao,capacidade:String(r.capacidade||''),tanque:String(r.tanque),potencia:String(r.potencia),velocidade_max:String(r.velocidade_max),consumo_ref:String(r.consumo_ref)});setEditing(r);setOpen(true)}}
      onDelete={setDel} addLabel="Novo Modelo" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Modelo':'Novo Modelo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome do Modelo" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Caterpillar 777G" />
          <FormGrid>
            <Select label="Fabricante" value={form.fabricante} onChange={v=>set('fabricante',v)} required onAdd={()=>toast('Criar fabricante','info')}
              options={[{value:'Caterpillar',label:'Caterpillar'},{value:'Komatsu',label:'Komatsu'},{value:'Volvo',label:'Volvo'},{value:'Atlas Copco',label:'Atlas Copco'}]} />
            <Select label="Grupo" value={form.grupo} onChange={v=>set('grupo',v)} required onAdd={()=>toast('Criar grupo','info')}
              options={[{value:'Caminhão',label:'Caminhão'},{value:'Escavadeira',label:'Escavadeira'},{value:'Motoniveladora',label:'Motoniveladora'},{value:'Trator Esteira',label:'Trator Esteira'},{value:'Perfuratriz',label:'Perfuratriz'}]} />
          </FormGrid>
          <Select label="Tipo de Operação" value={form.tipo_operacao} onChange={v=>set('tipo_operacao',v)} required
            options={[{value:'TRANSPORTE',label:'Transporte'},{value:'CARGA',label:'Carga'},{value:'APOIO',label:'Apoio'}]} />
        </FormSection>
        <FormSection title="Especificações Técnicas">
          <FormGrid>
            <Input label="Capacidade de Carga (ton)" value={form.capacidade} onChange={v=>set('capacidade',v)} type="number" placeholder="98" />
            <Input label="Capacidade Tanque (L)" value={form.tanque} onChange={v=>set('tanque',v)} type="number" required placeholder="800" />
          </FormGrid>
          <FormGrid>
            <Input label="Potência (hp)" value={form.potencia} onChange={v=>set('potencia',v)} type="number" placeholder="938" />
            <Input label="Velocidade Máx (km/h)" value={form.velocidade_max} onChange={v=>set('velocidade_max',v)} type="number" placeholder="65" />
          </FormGrid>
          <Input label="Consumo Referência (L/h)" value={form.consumo_ref} onChange={v=>set('consumo_ref',v)} type="number" placeholder="62" helper="Consumo esperado pelo fabricante" />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Modelo removido');setDel(null)}}
      title="Excluir modelo?" message={`Excluir ${del?.nome}? Só é possível se não houver equipamentos vinculados.`} confirmLabel="Excluir" />
  </>)
}