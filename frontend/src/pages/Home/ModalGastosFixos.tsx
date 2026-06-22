import { useEffect, useState } from 'react'
import { gastoFixoService } from '../../services/api'
import type { GastoFixo } from '../../types'

const FORM_VAZIO = {
  descricao: '',
  valor: '',
  pessoa: 'Caca',
  diaVencimento: '',
  ativo: true,
}

export default function ModalGastosFixos({ onFechar, onGerar }: { onFechar: () => void; onGerar: () => void }) {
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [gerando, setGerando] = useState(false)
  const [msg, setMsg] = useState('')

  const formatar = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  async function carregar() {
    const gfs = await gastoFixoService.listar()
    setGastosFixos(gfs)
  }

  useEffect(() => { carregar() }, [])

  async function salvar() {
    if (!form.descricao || !form.valor) return
    const payload = {
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      pessoa: form.pessoa,
      diaVencimento: form.diaVencimento ? parseInt(form.diaVencimento) : undefined,
      ativo: form.ativo,
    }
    if (editandoId !== null) {
      await gastoFixoService.editar(editandoId, { ...payload, id: editandoId })
    } else {
      await gastoFixoService.criar(payload)
    }
    setForm(FORM_VAZIO)
    setEditandoId(null)
    carregar()
  }

  function iniciarEdicao(gf: GastoFixo) {
    setEditandoId(gf.id)
    setForm({
      descricao: gf.descricao,
      valor: String(gf.valor),
      pessoa: gf.pessoa,
      diaVencimento: gf.diaVencimento ? String(gf.diaVencimento) : '',
      ativo: gf.ativo,
    })
  }

  async function deletar(id: number) {
    if (!confirm('Excluir este gasto fixo?')) return
    await gastoFixoService.deletar(id)
    carregar()
  }

  async function gerar() {
    setGerando(true)
    setMsg('')
    try {
      const mesRef = new Date().toISOString().slice(0, 7) + '-01'
      const res = await gastoFixoService.gerarParaMes(mesRef)
      const partes = []
      if (res.gerados > 0) partes.push(`${res.gerados} gerada(s)`)
      if (res.atualizados > 0) partes.push(`${res.atualizados} atualizada(s)`)
      setMsg(partes.length > 0 ? partes.join(', ') + '.' : 'Nenhuma alteração.')
      onGerar()
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Gastos Fixos Mensais</h2>
          <button onClick={onFechar} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-6">
          <div className="bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{editandoId ? 'Editando' : 'Novo gasto fixo'}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Descrição (ex: Aluguel, Academia)"
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <input
                type="number"
                placeholder="Valor"
                value={form.valor}
                onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Dia vencimento (opcional)"
                min={1} max={31}
                value={form.diaVencimento}
                onChange={e => setForm(f => ({ ...f, diaVencimento: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2">
                {['Caca', 'João'].map(p => (
                  <button
                    key={p}
                    onClick={() => setForm(f => ({ ...f, pessoa: p }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.pessoa === p
                        ? p === 'Caca' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'bg-gray-800 text-gray-400 border border-transparent'
                    }`}
                  >{p}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={salvar}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {editandoId ? 'Salvar alterações' : 'Adicionar'}
              </button>
              {editandoId && (
                <button
                  onClick={() => { setEditandoId(null); setForm(FORM_VAZIO) }}
                  className="px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {gastosFixos.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhum gasto fixo cadastrado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {gastosFixos.map(gf => (
                <div key={gf.id} className={`flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 ${!gf.ativo ? 'opacity-50' : ''}`}>
                  <div>
                    <p className="text-sm font-medium">{gf.descricao}</p>
                    <p className="text-xs text-gray-500">
                      {gf.pessoa}{gf.diaVencimento ? ` · dia ${gf.diaVencimento}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-red-400">{formatar(gf.valor)}</span>
                    <button onClick={() => iniciarEdicao(gf)} className="text-gray-500 hover:text-white text-xs">Editar</button>
                    <button onClick={() => deletar(gf.id)} className="text-gray-500 hover:text-red-400 text-xs">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 flex flex-col gap-2">
          {msg && <p className="text-sm text-center text-emerald-400">{msg}</p>}
          <button
            onClick={gerar}
            disabled={gerando || gastosFixos.filter(g => g.ativo).length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {gerando ? 'Gerando...' : `Gerar para ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
          </button>
        </div>
      </div>
    </div>
  )
}
