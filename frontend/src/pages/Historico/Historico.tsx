import { useEffect, useState, useMemo } from 'react'
import { transacaoService } from '../../services/api'
import type { Transacao } from '../../types'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function formatar(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function nomeMes(chave: string) {
  const [ano, m] = chave.split('-')
  return `${MESES[parseInt(m) - 1].slice(0, 3)}/${ano.slice(2)}`
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function TabelaTransacoes({ lista, mostrarPessoa = false }: { lista: Transacao[], mostrarPessoa?: boolean }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-black/20">
          <th className="px-3 py-2 text-left font-medium">Data</th>
          {mostrarPessoa && <th className="px-3 py-2 text-left font-medium">Pessoa</th>}
          <th className="px-3 py-2 text-right font-medium">Valor</th>
          <th className="px-3 py-2 text-center font-medium">Pago</th>
        </tr>
      </thead>
      <tbody>
        {lista.map(t => {
          const isCaca = t.pessoa === 'Caca'
          return (
            <tr key={t.id} className={`border-b border-black/20 ${
              isCaca ? 'bg-emerald-900/40 hover:bg-emerald-900/60' : 'bg-violet-900/30 hover:bg-violet-900/50'
            }`}>
              <td className="px-3 py-1.5 text-xs text-gray-400 whitespace-nowrap">{formatarData(t.data)}</td>
              {mostrarPessoa && (
                <td className="px-3 py-1.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isCaca ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
                    {t.pessoa}
                  </span>
                </td>
              )}
              <td className={`px-3 py-1.5 text-sm font-bold text-right whitespace-nowrap ${t.tipo === 'R' ? 'text-emerald-300' : 'text-red-400'}`}>
                {t.tipo === 'R' ? '+' : '-'}{formatar(t.valor)}
              </td>
              <td className="px-3 py-1.5 text-center">
                {t.pago
                  ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">✓ pago</span>
                  : <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">pendente</span>
                }
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function Historico() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState<string>('')

  useEffect(() => {
    transacaoService.listar()
      .then(setTransacoes)
      .finally(() => setLoading(false))
  }, [])

  const dadosPorMes = useMemo(() => {
    const mapa: Record<string, { entradas: number; saidas: number }> = {}
    for (const t of transacoes) {
      const chave = t.data.slice(0, 7)
      if (!mapa[chave]) mapa[chave] = { entradas: 0, saidas: 0 }
      if (t.tipo === 'R') mapa[chave].entradas += t.valor
      else mapa[chave].saidas += t.valor
    }
    return mapa
  }, [transacoes])

  const todosMeses = useMemo(() => Object.keys(dadosPorMes).sort(), [dadosPorMes])

  const resumoGeral = useMemo(() => {
    const entradas = transacoes.filter(t => t.tipo === 'R').reduce((acc, t) => acc + t.valor, 0)
    const saidas = transacoes.filter(t => t.tipo === 'D').reduce((acc, t) => acc + t.valor, 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }, [transacoes])

  const transacoesMes = useMemo(() =>
    mesSelecionado ? transacoes.filter(t => t.data.startsWith(mesSelecionado)) : [],
    [transacoes, mesSelecionado]
  )
  const carol = transacoesMes.filter(t => t.pessoa === 'Caca')
  const joao = transacoesMes.filter(t => t.pessoa === 'João')

  function calcularResumo(lista: Transacao[]) {
    const entradas = lista.filter(t => t.tipo === 'R').reduce((acc, t) => acc + t.valor, 0)
    const saidas = lista.filter(t => t.tipo === 'D').reduce((acc, t) => acc + t.valor, 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500">Carregando...</div>
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold">Histórico</h2>
        <p className="text-gray-500 text-sm mt-1">Visão geral e comparativo mensal</p>
      </div>

      {/* RELAÇÃO GERAL */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="font-semibold text-gray-300 mb-4">Relação geral — todos os meses</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Total entradas</p>
            <p className="text-2xl font-bold text-emerald-400">{formatar(resumoGeral.entradas)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Total saídas</p>
            <p className="text-2xl font-bold text-red-400">{formatar(resumoGeral.saidas)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Saldo acumulado</p>
            <p className={`text-2xl font-bold ${resumoGeral.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatar(resumoGeral.saldo)}
            </p>
          </div>
        </div>
      </div>

      {/* DETALHAMENTO POR MÊS */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center gap-4 mb-5">
          <h3 className="font-semibold text-gray-300">Detalhamento</h3>
          <select
            value={mesSelecionado}
            onChange={e => setMesSelecionado(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Selecione um mês...</option>
            {todosMeses.map(chave => (
              <option key={chave} value={chave}>{nomeMes(chave)}</option>
            ))}
          </select>
        </div>

        {!mesSelecionado ? (
          <p className="text-gray-600 text-sm">Selecione um mês para ver o detalhamento.</p>
        ) : transacoesMes.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma transação neste mês.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="font-bold text-emerald-300">Caca</h4>
              </div>
              {(() => {
                const r = calcularResumo(carol)
                return (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-800/40">
                      <p className="text-emerald-600 text-xs mb-1">Entradas</p>
                      <p className="font-bold text-emerald-300">{formatar(r.entradas)}</p>
                    </div>
                    <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-800/40">
                      <p className="text-emerald-600 text-xs mb-1">Saídas</p>
                      <p className="font-bold text-red-400">{formatar(r.saidas)}</p>
                    </div>
                    <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-800/40">
                      <p className="text-emerald-600 text-xs mb-1">Saldo</p>
                      <p className={`font-bold ${r.saldo >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>{formatar(r.saldo)}</p>
                    </div>
                  </div>
                )
              })()}
              {carol.length === 0 ? (
                <p className="text-emerald-700 text-sm">Nenhuma transação.</p>
              ) : (
                <div className="rounded-xl overflow-hidden border border-emerald-800/40">
                  <TabelaTransacoes lista={carol} />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-violet-700/40 bg-violet-950/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <h4 className="font-bold text-violet-300">João</h4>
              </div>
              {(() => {
                const r = calcularResumo(joao)
                return (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-violet-900/20 rounded-lg p-3 border border-violet-800/30">
                      <p className="text-violet-600 text-xs mb-1">Entradas</p>
                      <p className="font-bold text-emerald-400">{formatar(r.entradas)}</p>
                    </div>
                    <div className="bg-violet-900/20 rounded-lg p-3 border border-violet-800/30">
                      <p className="text-violet-600 text-xs mb-1">Saídas</p>
                      <p className="font-bold text-red-400">{formatar(r.saidas)}</p>
                    </div>
                    <div className="bg-violet-900/20 rounded-lg p-3 border border-violet-800/30">
                      <p className="text-violet-600 text-xs mb-1">Saldo</p>
                      <p className={`font-bold ${r.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatar(r.saldo)}</p>
                    </div>
                  </div>
                )
              })()}
              {joao.length === 0 ? (
                <p className="text-violet-700 text-sm">Nenhuma transação.</p>
              ) : (
                <div className="rounded-xl overflow-hidden border border-violet-800/40">
                  <TabelaTransacoes lista={joao} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
