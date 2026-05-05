import { useEffect, useState } from 'react'
import { transacaoService, gastoFixoService, categoriaService } from '../../services/api'
import type { Transacao, GastoFixo, Categoria } from '../../types'
import PainelTransacao from '../../components/PainelTransacao'

const MES_ATUAL = new Date().toISOString().slice(0, 7) // "2026-04"

interface CardProps {
  t: Transacao
  formatar: (v: number) => string
  onEditar: (t: Transacao) => void
  onDeletar: (id: number) => void
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function LinhaTransacao({ t, formatar, onEditar, onDeletar, mostrarPessoa = false }: CardProps & { mostrarPessoa?: boolean }) {
  const isCaca = t.pessoa === 'Caca'
  const isSalario = t.categoria?.isSalario === true
  return (
    <tr className={`group border-b border-black/20 relative ${
      isSalario
        ? 'bg-yellow-500/15 hover:bg-yellow-500/25 shadow-[inset_3px_0_0_0_#eab308]'
        : isCaca ? 'bg-emerald-900/40 hover:bg-emerald-900/60' : 'bg-violet-900/30 hover:bg-violet-900/50'
    }`}>
      <td className="px-3 py-1.5 text-xs text-gray-400 whitespace-nowrap">{formatarData(t.data)}</td>
      {mostrarPessoa && (
        <td className="px-3 py-1.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isCaca ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
            {t.pessoa}
          </span>
        </td>
      )}
      <td className={`px-3 py-1.5 text-sm font-semibold ${isSalario ? 'text-yellow-300' : isCaca ? 'text-emerald-300' : 'text-violet-300'}`}>
        {t.categoria?.nome || '—'}
        {isSalario && <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-medium">salário</span>}
      </td>
      <td className={`px-3 py-1.5 text-sm font-bold text-right whitespace-nowrap ${isSalario ? 'text-yellow-300' : t.tipo === 'R' ? 'text-emerald-300' : 'text-red-400'}`}>
        {t.tipo === 'R' ? '+' : '-'}{formatar(t.valor)}
      </td>
      <td className="px-3 py-1.5 text-center">
        {t.pago
          ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">✓ pago</span>
          : <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">pendente</span>
        }
      </td>
      <td className="px-2 py-1.5">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEditar(t)} title="Editar" className="text-gray-500 hover:text-white transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={() => onDeletar(t.id)} title="Excluir" className="text-gray-500 hover:text-red-400 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

function TabelaTransacoes({ lista, formatar, onEditar, onDeletar, mostrarPessoa = false }: {
  lista: Transacao[]
  formatar: (v: number) => string
  onEditar: (t: Transacao) => void
  onDeletar: (id: number) => void
  mostrarPessoa?: boolean
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
          <th className="px-3 py-2 text-left font-medium">Data</th>
          {mostrarPessoa && <th className="px-3 py-2 text-left font-medium">Pessoa</th>}
          <th className="px-3 py-2 text-left font-medium">Categoria</th>
          <th className="px-3 py-2 text-right font-medium">Valor</th>
          <th className="px-3 py-2 text-center font-medium">Pago</th>
          <th className="px-3 py-2" />
        </tr>
      </thead>
      <tbody>
        {lista.map(t => (
          <LinhaTransacao key={t.id} t={t} formatar={formatar} onEditar={onEditar} onDeletar={onDeletar} mostrarPessoa={mostrarPessoa} />
        ))}
      </tbody>
    </table>
  )
}

const FORM_GF_VAZIO = {
  descricao: '',
  valor: '',
  categoriaId: '',
  pessoa: 'Caca',
  diaVencimento: '',
  ativo: true,
}

function ModalGastosFixos({ onFechar, onGerar }: { onFechar: () => void; onGerar: () => void }) {
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState(FORM_GF_VAZIO)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [gerando, setGerando] = useState(false)
  const [msg, setMsg] = useState('')

  async function carregar() {
    const [gfs, cats] = await Promise.all([gastoFixoService.listar(), categoriaService.listar()])
    setGastosFixos(gfs)
    setCategorias(cats)
  }

  useEffect(() => { carregar() }, [])

  async function salvar() {
    if (!form.descricao || !form.valor || !form.categoriaId) return
    const payload = {
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      categoriaId: parseInt(form.categoriaId),
      pessoa: form.pessoa,
      diaVencimento: form.diaVencimento ? parseInt(form.diaVencimento) : undefined,
      ativo: form.ativo,
    }
    if (editandoId !== null) {
      await gastoFixoService.editar(editandoId, { ...payload, id: editandoId })
    } else {
      await gastoFixoService.criar(payload)
    }
    setForm(FORM_GF_VAZIO)
    setEditandoId(null)
    carregar()
  }

  function iniciarEdicao(gf: GastoFixo) {
    setEditandoId(gf.id)
    setForm({
      descricao: gf.descricao,
      valor: String(gf.valor),
      categoriaId: String(gf.categoriaId),
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

  const formatar = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Gastos Fixos Mensais</h2>
          <button onClick={onFechar} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-6">
          {/* Formulário */}
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
              <select
                value={form.categoriaId}
                onChange={e => setForm(f => ({ ...f, categoriaId: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Categoria...</option>
                {categorias.filter(c => c.ativa).map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
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
                  >
                    {p}
                  </button>
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
                  onClick={() => { setEditandoId(null); setForm(FORM_GF_VAZIO) }}
                  className="px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          {gastosFixos.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhum gasto fixo cadastrado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {gastosFixos.map(gf => (
                <div key={gf.id} className={`flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 ${!gf.ativo ? 'opacity-50' : ''}`}>
                  <div>
                    <p className="text-sm font-medium">{gf.descricao}</p>
                    <p className="text-xs text-gray-500">
                      {gf.categoria?.nome ?? `Categoria ${gf.categoriaId}`} · {gf.pessoa}
                      {gf.diaVencimento ? ` · dia ${gf.diaVencimento}` : ''}
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

        {/* Rodapé com botão Gerar */}
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

export default function Home() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [visao, setVisao] = useState<'juntos' | 'separados'>('juntos')
  const [loading, setLoading] = useState(true)
  const [painelAberto, setPainelAberto] = useState(false)
  const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null)
  const [modalGastosFixos, setModalGastosFixos] = useState(false)

  async function carregar() {
    try {
      const t = await transacaoService.listar()
      setTransacoes(t)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const transacoesMes = transacoes.filter(t => t.data.startsWith(MES_ATUAL))
  const carol = transacoesMes.filter(t => t.pessoa === 'Caca')
  const joao = transacoesMes.filter(t => t.pessoa === 'João')

  function calcularResumo(lista: Transacao[]) {
    const entradas = lista.filter(t => t.tipo === 'R').reduce((acc, t) => acc + t.valor, 0)
    const saidas = lista.filter(t => t.tipo === 'D').reduce((acc, t) => acc + t.valor, 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }

  const resumoGeral = calcularResumo(transacoesMes)
  const resumoCarol = calcularResumo(carol)
  const resumoJoao = calcularResumo(joao)

  async function deletar(id: number) {
    if (!confirm('Excluir esta transação?')) return
    await transacaoService.deletar(id)
    await carregar()
  }

  function editar(t: Transacao) {
    setTransacaoEditando(t)
    setPainelAberto(true)
  }

  function formatar(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Carregando...
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">
  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
</h2>
          <p className="text-gray-500 text-sm mt-1">mês atual</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalGastosFixos(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Gastos Fixos
          </button>
          <button
            onClick={() => { setTransacaoEditando(null); setPainelAberto(true) }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nova transação
          </button>
          <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setVisao('juntos')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                visao === 'juntos' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Juntos
            </button>
            <button
              onClick={() => setVisao('separados')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                visao === 'separados' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Separados
            </button>
          </div>
        </div>
      </div>

      {visao === 'juntos' ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Entradas</p>
              <p className="text-2xl font-bold text-emerald-400">{formatar(resumoGeral.entradas)}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Saídas</p>
              <p className="text-2xl font-bold text-red-400">{formatar(resumoGeral.saidas)}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Saldo</p>
              <p className={`text-2xl font-bold ${resumoGeral.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatar(resumoGeral.saldo)}
              </p>
            </div>
          </div>

          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Transações do mês</p>
          {transacoesMes.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma transação registrada.</p>
          ) : (
            <div className="rounded-xl overflow-hidden border border-gray-800">
              <TabelaTransacoes lista={transacoesMes} formatar={formatar} onEditar={editar} onDeletar={deletar} mostrarPessoa />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-8">
          {[
            { label: 'Caca', resumo: resumoCarol, lista: carol, bg: 'bg-emerald-900/30', border: 'border-emerald-800/50', texto: 'text-emerald-400', tabelaBorder: 'border-emerald-800/40' },
            { label: 'João', resumo: resumoJoao, lista: joao, bg: 'bg-violet-900/20', border: 'border-violet-800/40', texto: 'text-violet-400', tabelaBorder: 'border-violet-800/40' },
          ].map(({ label, resumo, lista, bg, border, texto, tabelaBorder }) => (
            <div key={label}>
              <h3 className={`text-xl font-bold mb-3 ${texto}`}>{label}</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`${bg} rounded-lg p-3 border ${border}`}>
                  <p className={`${texto} text-xs uppercase tracking-wider mb-1`}>Entradas</p>
                  <p className="text-lg font-bold text-emerald-400">{formatar(resumo.entradas)}</p>
                </div>
                <div className={`${bg} rounded-lg p-3 border ${border}`}>
                  <p className={`${texto} text-xs uppercase tracking-wider mb-1`}>Saídas</p>
                  <p className="text-lg font-bold text-red-400">{formatar(resumo.saidas)}</p>
                </div>
                <div className={`${bg} rounded-lg p-3 border ${border}`}>
                  <p className={`${texto} text-xs uppercase tracking-wider mb-1`}>Saldo</p>
                  <p className={`text-lg font-bold ${resumo.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatar(resumo.saldo)}
                  </p>
                </div>
              </div>
              {lista.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma transação.</p>
              ) : (
                <div className={`rounded-xl overflow-hidden border ${tabelaBorder}`}>
                  <TabelaTransacoes lista={lista} formatar={formatar} onEditar={editar} onDeletar={deletar} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PainelTransacao
        aberto={painelAberto}
        transacao={transacaoEditando}
        onFechar={() => {
          setPainelAberto(false)
          setTransacaoEditando(null)
        }}
        onSalvar={() => {
          setPainelAberto(false)
          setTransacaoEditando(null)
          carregar()
        }}
      />

      {modalGastosFixos && (
        <ModalGastosFixos
          onFechar={() => setModalGastosFixos(false)}
          onGerar={() => carregar()}
        />
      )}
    </div>
  )
}
