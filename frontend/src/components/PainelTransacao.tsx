import { useEffect, useState } from 'react'
import { categoriaService, transacaoService, dividaService, faturaService } from '../services/api'
import type { Categoria, Transacao, Divida, Fatura } from '../types'

interface PainelTransacaoProps {
  aberto: boolean
  onFechar: () => void
  onSalvar: () => void
  transacao?: Transacao | null
}

const FORM_VAZIO = {
  descricao: '',
  valor: '',
  tipo: 'D',
  pessoa: 'Caca',
  categoriaId: '',
  data: new Date().toISOString().slice(0, 10),
  mesRef: new Date().toISOString().slice(0, 7) + '-01',
  isEstimativa: false,
  confirmado: true,
  pago: false,
  dividaId: '',
  faturaId: '',
}

export default function PainelTransacao({ aberto, onFechar, onSalvar, transacao }: PainelTransacaoProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [dividasAbertas, setDividasAbertas] = useState<Divida[]>([])
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [form, setForm] = useState(FORM_VAZIO)

  useEffect(() => {
    categoriaService.listar().then(setCategorias)
    dividaService.listarAtivas().then(setDividasAbertas)
    faturaService.listar().then(setFaturas)
  }, [])

  useEffect(() => {
    if (transacao) {
      setForm({
        descricao: transacao.descricao ?? '',
        valor: String(transacao.valor),
        tipo: transacao.tipo,
        pessoa: transacao.pessoa,
        categoriaId: String(transacao.categoriaId),
        data: transacao.data,
        mesRef: transacao.mesRef,
        isEstimativa: transacao.isEstimativa,
        confirmado: transacao.confirmado,
        pago: transacao.pago,
        dividaId: transacao.dividaId ? String(transacao.dividaId) : '',
        faturaId: transacao.faturaId ? String(transacao.faturaId) : '',
      })
    } else {
      setForm(FORM_VAZIO)
    }
  }, [transacao, aberto])

  async function salvar() {
    if (!form.valor || !form.categoriaId) return
    const payload = {
      ...form,
      valor: parseFloat(form.valor),
      categoriaId: parseInt(form.categoriaId),
      dividaId: form.dividaId ? parseInt(form.dividaId) : undefined,
      faturaId: form.faturaId ? parseInt(form.faturaId) : undefined,
    }
    if (transacao) {
      await transacaoService.editar(transacao.id, { ...transacao, ...payload })
    } else {
      await transacaoService.criar(payload)
    }
    onSalvar()
  }

  return (
    <>
      {aberto && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onFechar} />
      )}
      <div className={`fixed top-0 right-0 h-full w-96 bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300 ${aberto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="font-semibold">{transacao ? 'Editar transação' : 'Nova transação'}</h3>
          <button onClick={onFechar} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-y-auto h-full pb-32">
          <div className="flex gap-2">
            {['D', 'R'].map(tipo => (
              <button
                key={tipo}
                onClick={() => setForm(f => ({ ...f, tipo }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.tipo === tipo
                    ? tipo === 'D' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-800 text-gray-400 border border-transparent'
                }`}
              >
                {tipo === 'D' ? 'Despesa' : 'Entrada'}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {['Caca', 'João'].map(pessoa => (
              <button
                key={pessoa}
                onClick={() => setForm(f => ({ ...f, pessoa }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.pessoa === pessoa
                    ? pessoa === 'Caca' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'bg-gray-800 text-gray-400 border border-transparent'
                }`}
              >
                {pessoa}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Valor</label>
            <input
              type="number"
              placeholder="0,00"
              value={form.valor}
              onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Mensalidade faculdade"
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Categoria</label>
            <select
              value={form.categoriaId}
              onChange={e => setForm(f => ({ ...f, categoriaId: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Selecione...</option>
              {categorias
                .filter(c => c.ativa && (c.pessoa === form.pessoa || c.pessoa === 'ambos'))
                .map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pago"
              checked={form.pago}
              onChange={e => setForm(f => ({ ...f, pago: e.target.checked }))}
              className="w-4 h-4 accent-emerald-500"
            />
            <label htmlFor="pago" className="text-sm text-gray-300">Já pago</label>
          </div>

          {dividasAbertas.filter(d => d.pessoa === form.pessoa).length > 0 && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Vincular a dívida (opcional)</label>
              <select
                value={form.dividaId}
                onChange={e => setForm(f => ({ ...f, dividaId: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Nenhuma</option>
                {dividasAbertas
                  .filter(d => d.pessoa === form.pessoa)
                  .map(d => (
                    <option key={d.id} value={d.id}>{d.descricao} — {d.pessoaRelacionada}</option>
                  ))}
              </select>
            </div>
          )}

          {form.tipo === 'D' && faturas.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Pagamento de fatura de cartão (opcional)</label>
              <select
                value={form.faturaId}
                onChange={e => {
                  const faturaId = e.target.value
                  if (faturaId) {
                    const fatura = faturas.find(f => f.id === parseInt(faturaId))
                    if (fatura) {
                      const mes = new Date(fatura.mesRef).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                      const nomeCartao = fatura.cartao?.nome ?? `Cartão ${fatura.cartaoId}`
                      setForm(f => ({
                        ...f,
                        faturaId,
                        valor: String(fatura.valorTotal),
                        descricao: `Fatura ${nomeCartao} - ${mes}`,
                      }))
                    } else {
                      setForm(f => ({ ...f, faturaId }))
                    }
                  } else {
                    setForm(f => ({ ...f, faturaId: '' }))
                  }
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Nenhuma</option>
                {faturas.map(f => {
                  const mes = new Date(f.mesRef).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                  const status = f.paga ? ' ✓' : ''
                  return (
                    <option key={f.id} value={f.id}>
                      {f.cartao?.nome ?? `Cartão ${f.cartaoId}`} — {mes}{status}
                    </option>
                  )
                })}
              </select>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800 bg-gray-900">
          <button
            onClick={salvar}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {transacao ? 'Salvar alterações' : 'Salvar transação'}
          </button>
        </div>
      </div>
    </>
  )
}
