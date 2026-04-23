import { useEffect, useState } from 'react'
import { transacaoService, salarioService } from '../../services/api'
import type { Transacao, SalarioEstimativa } from '../../types'
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
        <span className={`inline-block w-2 h-2 rounded-full ${t.pago ? 'bg-emerald-400' : 'bg-gray-600'}`} title={t.pago ? 'Pago' : 'Pendente'} />
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

export default function Home() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [salarios, setSalarios] = useState<SalarioEstimativa[]>([])
  const [visao, setVisao] = useState<'juntos' | 'separados'>('juntos')
  const [loading, setLoading] = useState(true)
  const [painelAberto, setPainelAberto] = useState(false)
  const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null)

  async function carregar() {
    try {
      const [t, s] = await Promise.all([
        transacaoService.listar(),
        salarioService.listar(),
      ])
      setTransacoes(t)
      setSalarios(s)
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
          <h2 className="text-2xl font-bold">Abril 2026</h2>
          <p className="text-gray-500 text-sm mt-1">mês atual</p>
        </div>
        <div className="flex items-center gap-3">
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
    </div>
  )
}
