import { useEffect, useState } from 'react'
import { transacaoService, gastoFixoService, salarioService, faturaService, gastoFixoCartaoService, faturaItemService } from '../../services/api'
import type { Transacao, GastoFixo, Salario, Fatura, GastoFixoCartao, ParcelaCartao } from '../../types'
import PainelTransacao from '../../components/PainelTransacao'
import ModalGastosFixos from './ModalGastosFixos'

function formatar(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function mesAnterior(mesRef: string) {
  const [ano, mes] = mesRef.split('-').map(Number)
  const d = new Date(ano, mes - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function mesProximo(mesRef: string) {
  const [ano, mes] = mesRef.split('-').map(Number)
  const d = new Date(ano, mes, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function nomeMes(mesRef: string) {
  const [ano, mes] = mesRef.split('-').map(Number)
  return new Date(ano, mes - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function isFuturo(mesRef: string) {
  return mesRef.slice(0, 7) > mesAtual().slice(0, 7)
}

function diffMeses(mesAlvo: string, mesOrigem: string) {
  const [aa, am] = mesAlvo.split('-').map(Number)
  const [oa, om] = mesOrigem.split('-').map(Number)
  return (aa - oa) * 12 + (am - om)
}

interface PrevisaoCartaoItem {
  descricao: string
  valor: number
  tipo: 'fixo' | 'parcela'
}

function calcularPrevisaoCartao(
  mesAlvo: string,
  gastosFixosCartao: GastoFixoCartao[],
  parcelas: ParcelaCartao[]
): PrevisaoCartaoItem[] {
  const itens: PrevisaoCartaoItem[] = []

  for (const g of gastosFixosCartao.filter(g => g.ativo)) {
    itens.push({ descricao: g.descricao, valor: g.valor, tipo: 'fixo' })
  }

  for (const p of parcelas) {
    const [atual, total] = p.parcela.split('/').map(Number)
    const restantes = total - atual
    const diff = diffMeses(mesAlvo, p.mesRef)
    if (diff >= 1 && diff <= restantes) {
      const parcelaAlvo = atual + diff
      itens.push({
        descricao: `${p.descricao} (${parcelaAlvo}/${total})`,
        valor: p.valor,
        tipo: 'parcela',
      })
    }
  }

  return itens
}

// ── Card de salário ────────────────────────────────────────────────────────────

function CardSalario({ pessoa, mesRef, salarios, onSalvo }: {
  pessoa: 'Caca' | 'João'
  mesRef: string
  salarios: Salario[]
  onSalvo: () => void
}) {
  const cor = pessoa === 'Caca' ? 'emerald' : 'violet'

  const salarioDoMes = salarios.find(
    s => s.pessoa === pessoa && s.mesRef.slice(0, 7) === mesRef.slice(0, 7)
  )
  const historico = salarios
    .filter(s => s.pessoa === pessoa && !s.isEstimativa && s.mesRef.slice(0, 7) < mesRef.slice(0, 7))
    .sort((a, b) => b.mesRef.localeCompare(a.mesRef))
    .slice(0, 3)
  const media = historico.length > 0
    ? Math.round(historico.reduce((acc, s) => acc + s.valor, 0) / historico.length)
    : null

  // Busca a taxa/hora mais recente registrada para essa pessoa
  const ultimaTaxa = salarios
    .filter(s => s.pessoa === pessoa && s.taxaHora)
    .sort((a, b) => b.mesRef.localeCompare(a.mesRef))[0]?.taxaHora ?? null

  const [editando, setEditando] = useState(false)
  const [modo, setModo] = useState<'fixo' | 'horas'>('fixo')
  const [inputValor, setInputValor] = useState('')
  const [inputHoras, setInputHoras] = useState('')
  const [inputTaxa, setInputTaxa] = useState('')
  const [salvando, setSalvando] = useState(false)

  function abrirEdicao() {
    if (salarioDoMes?.horas) {
      setModo('horas')
      setInputHoras(String(salarioDoMes.horas))
      setInputTaxa(String(salarioDoMes.taxaHora ?? ultimaTaxa ?? ''))
    } else {
      setModo('fixo')
      setInputValor(String(salarioDoMes?.valor ?? media ?? ''))
      setInputTaxa(String(ultimaTaxa ?? ''))
    }
    setEditando(true)
  }

  const valorCalculado = modo === 'horas'
    ? (parseFloat(inputHoras) || 0) * (parseFloat(inputTaxa) || 0)
    : parseFloat(inputValor) || 0

  async function salvar() {
    if (valorCalculado <= 0) { setEditando(false); return }
    setSalvando(true)
    const taxa = parseFloat(inputTaxa) || undefined
    const horas = modo === 'horas' ? (parseFloat(inputHoras) || undefined) : undefined
    const payload = {
      pessoa,
      mesRef,
      valor: valorCalculado,
      horas,
      taxaHora: taxa,
      isEstimativa: isFuturo(mesRef),
    }
    try {
      if (salarioDoMes) {
        await salarioService.editar(salarioDoMes.id, payload)
      } else {
        await salarioService.criar(payload)
      }
      onSalvo()
    } finally {
      setSalvando(false)
      setEditando(false)
    }
  }

  const valorExibido = salarioDoMes?.valor ?? media
  const horasExibidas = salarioDoMes?.horas ?? null
  const isMediaAuto = !salarioDoMes && media !== null

  return (
    <div className={`bg-${cor}-950/30 border border-${cor}-800/40 rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider text-${cor}-400`}>Salário {pessoa}</span>
        <span className="text-[10px] text-gray-600">
          {salarioDoMes
            ? salarioDoMes.isEstimativa ? 'estimativa' : 'confirmado'
            : media !== null ? `média ${historico.length}m` : ''}
        </span>
      </div>

      {editando ? (
        <div className="flex flex-col gap-3">
          {/* Toggle fixo / horas */}
          <div className="flex gap-1.5">
            {(['fixo', 'horas'] as const).map(m => (
              <button
                key={m}
                onClick={() => setModo(m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  modo === m
                    ? `bg-${cor}-500/20 text-${cor}-400 border border-${cor}-500/30`
                    : 'bg-gray-800 text-gray-500 border border-transparent'
                }`}
              >
                {m === 'fixo' ? 'Valor fixo' : 'Por horas'}
              </button>
            ))}
          </div>

          {modo === 'fixo' ? (
            <input
              type="number"
              placeholder="Valor do salário"
              value={inputValor}
              onChange={e => setInputValor(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') salvar(); if (e.key === 'Escape') setEditando(false) }}
              autoFocus
              className={`bg-gray-800 border border-${cor}-600/50 rounded-lg px-3 py-2 text-white text-base font-bold focus:outline-none focus:border-${cor}-500`}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-600 uppercase tracking-wider block mb-1">Horas</label>
                  <input
                    type="number"
                    placeholder="160"
                    value={inputHoras}
                    onChange={e => setInputHoras(e.target.value)}
                    autoFocus
                    className={`w-full bg-gray-800 border border-${cor}-600/50 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-${cor}-500`}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-600 uppercase tracking-wider block mb-1">Taxa/hora</label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={inputTaxa}
                    onChange={e => setInputTaxa(e.target.value)}
                    className={`w-full bg-gray-800 border border-${cor}-600/50 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-${cor}-500`}
                  />
                </div>
              </div>
              {valorCalculado > 0 && (
                <p className={`text-base font-bold text-right text-${cor}-300`}>= {formatar(valorCalculado)}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={salvar}
              disabled={salvando || valorCalculado <= 0}
              className={`flex-1 py-2 rounded-lg text-sm font-medium bg-${cor}-500 hover:bg-${cor}-600 text-white transition-colors disabled:opacity-40`}
            >
              {salvando ? '...' : 'Ok'}
            </button>
            <button onClick={() => setEditando(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-white bg-gray-800 transition-colors">
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex flex-col flex-1">
            <div className="flex items-baseline gap-1.5">
              {isMediaAuto && <span className="text-sm text-gray-600">~</span>}
              <p className={`text-2xl font-bold ${valorExibido !== null ? `text-${cor}-300` : 'text-gray-700'}`}>
                {valorExibido !== null ? formatar(valorExibido) : '—'}
              </p>
            </div>
            {horasExibidas !== null && (
              <p className="text-sm text-gray-500 mt-0.5">{horasExibidas}h trabalhadas</p>
            )}
          </div>
          <button
            onClick={abrirEdicao}
            className="text-gray-600 hover:text-gray-300 transition-colors p-1"
            title="Editar salário"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Linha de transação ────────────────────────────────────────────────────────

function LinhaTransacao({ t, onEditar, onDeletar, onTogglePago, mostrarPessoa = false }: {
  t: Transacao
  onEditar: (t: Transacao) => void
  onDeletar: (id: number) => void
  onTogglePago: (id: number) => void
  mostrarPessoa?: boolean
}) {
  const isCaca = t.pessoa === 'Caca'
  return (
    <tr className={`group border-b border-black/20 ${isCaca ? 'bg-emerald-900/40 hover:bg-emerald-900/60' : 'bg-violet-900/30 hover:bg-violet-900/50'}`}>
      <td className="px-3 py-1.5 text-xs text-gray-400 whitespace-nowrap">{formatarData(t.data)}</td>
      {mostrarPessoa && (
        <td className="px-3 py-1.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isCaca ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
            {t.pessoa}
          </span>
        </td>
      )}
      <td className="px-3 py-1.5 text-sm text-gray-200 max-w-xs truncate">{t.descricao}</td>
      <td className={`px-3 py-1.5 text-sm font-bold text-right whitespace-nowrap ${t.tipo === 'R' ? 'text-emerald-300' : 'text-red-400'}`}>
        {t.tipo === 'R' ? '+' : '-'}{formatar(t.valor)}
      </td>
      <td className="px-3 py-1.5 text-center">
        <button
          onClick={() => onTogglePago(t.id)}
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors ${
            t.pago
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
              : 'bg-gray-800 text-gray-600 hover:bg-gray-700 hover:text-gray-300'
          }`}
        >
          {t.pago ? '✓ pago' : 'pendente'}
        </button>
      </td>
      <td className="px-2 py-1.5">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEditar(t)} className="text-gray-500 hover:text-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={() => onDeletar(t.id)} className="text-gray-500 hover:text-red-400 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Home() {
  const [mesNav, setMesNav] = useState(mesAtual())
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [salarios, setSalarios] = useState<Salario[]>([])
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([])
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [gastosFixosCartao, setGastosFixosCartao] = useState<GastoFixoCartao[]>([])
  const [parcelasCartao, setParcelasCartao] = useState<ParcelaCartao[]>([])
  const [visao, setVisao] = useState<'juntos' | 'separados'>('juntos')
  const [loading, setLoading] = useState(true)
  const [painelAberto, setPainelAberto] = useState(false)
  const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null)
  const [modalGastosFixos, setModalGastosFixos] = useState(false)

  async function carregar() {
    try {
      const [t, s, gf, fat, gfc, parc] = await Promise.allSettled([
        transacaoService.listar(),
        salarioService.listar(),
        gastoFixoService.listar(),
        faturaService.listar(),
        gastoFixoCartaoService.listar(),
        faturaItemService.listarTodasParcelas(),
      ])
      if (t.status === 'fulfilled') setTransacoes(t.value)
      if (s.status === 'fulfilled') setSalarios(s.value)
      if (gf.status === 'fulfilled') setGastosFixos(gf.value)
      if (fat.status === 'fulfilled') setFaturas(fat.value)
      if (gfc.status === 'fulfilled') setGastosFixosCartao(gfc.value)
      if (parc.status === 'fulfilled') setParcelasCartao(parc.value)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const futuro = isFuturo(mesNav)
  const transacoesMes = transacoes.filter(t => t.data.startsWith(mesNav.slice(0, 7)))
  // Para previsão: faturas do mês anterior (é o que será pago no mês atual)
  const faturasParaPagar = faturas.filter(f => f.mesRef.slice(0, 7) === mesAnterior(mesNav).slice(0, 7))

  // Saldo do mês = salários - despesas (transações D + faturas)
  function calcularSaldo(pessoa?: string) {
    const txs = pessoa ? transacoesMes.filter(t => t.pessoa === pessoa) : transacoesMes
    const despesas = txs.filter(t => t.tipo === 'D').reduce((acc, t) => acc + t.valor, 0)
    const entradas = txs.filter(t => t.tipo === 'R').reduce((acc, t) => acc + t.valor, 0)

    const salCaca = salarios.find(s => s.pessoa === 'Caca' && s.mesRef.slice(0, 7) === mesNav.slice(0, 7))
    const salJoao = salarios.find(s => s.pessoa === 'João' && s.mesRef.slice(0, 7) === mesNav.slice(0, 7))

    const historicoCaca = salarios.filter(s => s.pessoa === 'Caca' && !s.isEstimativa && s.mesRef.slice(0, 7) < mesNav.slice(0, 7)).sort((a, b) => b.mesRef.localeCompare(a.mesRef)).slice(0, 3)
    const historicoJoao = salarios.filter(s => s.pessoa === 'João' && !s.isEstimativa && s.mesRef.slice(0, 7) < mesNav.slice(0, 7)).sort((a, b) => b.mesRef.localeCompare(a.mesRef)).slice(0, 3)
    const mediaCaca = historicoCaca.length > 0 ? historicoCaca.reduce((acc, s) => acc + s.valor, 0) / historicoCaca.length : 0
    const mediaJoao = historicoJoao.length > 0 ? historicoJoao.reduce((acc, s) => acc + s.valor, 0) / historicoJoao.length : 0

    const salarioTotal = !pessoa
      ? (salCaca?.valor ?? mediaCaca) + (salJoao?.valor ?? mediaJoao)
      : pessoa === 'Caca'
        ? (salCaca?.valor ?? mediaCaca)
        : (salJoao?.valor ?? mediaJoao)

    // Gastos fixos do mês
    const gfTotal = gastosFixos
      .filter(g => g.ativo && (!pessoa || g.pessoa === pessoa))
      .reduce((acc, g) => acc + g.valor, 0)

    // Faturas do mês anterior (são pagas no mês atual)
    // Se não há fatura cadastrada, usa previsão do cartão
    let fatTotal: number
    if (faturasParaPagar.length > 0) {
      fatTotal = faturasParaPagar.reduce((acc, f) => acc + f.valorTotal, 0)
    } else {
      const previsao = calcularPrevisaoCartao(mesAnterior(mesNav), gastosFixosCartao, parcelasCartao)
      fatTotal = previsao.reduce((acc, i) => acc + i.valor, 0)
    }

    if (futuro) {
      return { receita: salarioTotal, despesas: gfTotal + fatTotal, saldo: salarioTotal - gfTotal - fatTotal }
    }
    const receita = salarioTotal + entradas
    return { receita, despesas, saldo: receita - despesas }
  }

  const resumoGeral = calcularSaldo()
  const resumoCaca = calcularSaldo('Caca')
  const resumoJoao = calcularSaldo('João')

  async function deletar(id: number) {
    if (!confirm('Excluir esta transação?')) return
    await transacaoService.deletar(id)
    await carregar()
  }

  async function togglePago(id: number) {
    await transacaoService.marcarPago(id)
    await carregar()
  }

  function editar(t: Transacao) {
    setTransacaoEditando(t)
    setPainelAberto(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500">Carregando...</div>
  }

  const carol = transacoesMes.filter(t => t.pessoa === 'Caca')
  const joao = transacoesMes.filter(t => t.pessoa === 'João')

  return (
    <div className="p-8">
      {/* Cabeçalho com navegação de mês */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMesNav(mesAnterior(mesNav))}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            ‹
          </button>
          <div>
            <h2 className="text-2xl font-bold capitalize">{nomeMes(mesNav)}</h2>
            {futuro && <span className="text-xs text-yellow-500/80 font-medium">previsão</span>}
          </div>
          <button
            onClick={() => setMesNav(mesProximo(mesNav))}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalGastosFixos(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Gastos Fixos
          </button>
          {!futuro && (
            <button
              onClick={() => { setTransacaoEditando(null); setPainelAberto(true) }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Nova transação
            </button>
          )}
          <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setVisao('juntos')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${visao === 'juntos' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Juntos
            </button>
            <button
              onClick={() => setVisao('separados')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${visao === 'separados' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Separados
            </button>
          </div>
        </div>
      </div>

      {visao === 'juntos' ? (
        <>
          {/* Cards de salário */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <CardSalario pessoa="Caca" mesRef={mesNav} salarios={salarios} onSalvo={carregar} />
            <CardSalario pessoa="João" mesRef={mesNav} salarios={salarios} onSalvo={carregar} />
          </div>

          {/* Resumo geral */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                {futuro ? 'Salário estimado' : 'Entrada'}
              </p>
              <p className="text-2xl font-bold text-emerald-400">{formatar(resumoGeral.receita)}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                {futuro ? 'Despesas previstas' : 'Saídas'}
              </p>
              <p className="text-2xl font-bold text-red-400">{formatar(resumoGeral.despesas)}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Saldo</p>
              <p className={`text-2xl font-bold ${resumoGeral.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatar(resumoGeral.saldo)}
              </p>
            </div>
          </div>

          {futuro ? (
            /* Mês futuro: mostra breakdown da previsão */
            (() => {
              const previsaoCartao = faturasParaPagar.length === 0
                ? calcularPrevisaoCartao(mesAnterior(mesNav), gastosFixosCartao, parcelasCartao)
                : []
              const temItens = gastosFixos.filter(g => g.ativo).length > 0 || faturasParaPagar.length > 0 || previsaoCartao.length > 0
              return (
                <div className="flex flex-col gap-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Composição da previsão</p>
                  {!temItens ? (
                    <p className="text-gray-600 text-sm">Nenhum gasto fixo ou fatura cadastrada.</p>
                  ) : (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                      {gastosFixos.filter(g => g.ativo).map(g => (
                        <div key={g.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                          <div>
                            <p className="text-sm text-gray-300">{g.descricao}</p>
                            <p className="text-xs text-gray-600">{g.pessoa} · fixo mensal</p>
                          </div>
                          <span className="text-sm font-medium text-red-400">{formatar(g.valor)}</span>
                        </div>
                      ))}
                      {faturasParaPagar.length > 0
                        ? faturasParaPagar.map(f => (
                          <div key={f.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                            <div>
                              <p className="text-sm text-gray-300">{f.cartao?.nome ?? `Cartão ${f.cartaoId}`}</p>
                              <p className="text-xs text-gray-600">fatura de {nomeMes(f.mesRef)}</p>
                            </div>
                            <span className="text-sm font-medium text-red-400">{formatar(f.valorTotal)}</span>
                          </div>
                        ))
                        : previsaoCartao.length > 0 && (() => {
                          const total = previsaoCartao.reduce((acc, i) => acc + i.valor, 0)
                          return (
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                              <div>
                                <p className="text-sm text-gray-300">Fatura cartão</p>
                                <p className="text-xs text-gray-600">previsão de {nomeMes(mesAnterior(mesNav))}</p>
                              </div>
                              <span className="text-sm font-medium text-red-400">{formatar(total)}</span>
                            </div>
                          )
                        })()
                      }
                    </div>
                  )}
                </div>
              )
            })()
          ) : (
            /* Mês passado/atual: tabela de transações */
            <>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Transações do mês</p>
              {transacoesMes.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma transação registrada.</p>
              ) : (
                <div className="rounded-xl overflow-hidden border border-gray-800">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                        <th className="px-3 py-2 text-left font-medium">Data</th>
                        <th className="px-3 py-2 text-left font-medium">Pessoa</th>
                        <th className="px-3 py-2 text-left font-medium">Descrição</th>
                        <th className="px-3 py-2 text-right font-medium">Valor</th>
                        <th className="px-3 py-2 text-center font-medium">Pago</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {transacoesMes.map(t => (
                        <LinhaTransacao key={t.id} t={t} onEditar={editar} onDeletar={deletar} onTogglePago={togglePago} mostrarPessoa />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Visão separada */
        <div className="flex flex-col gap-8">
          {([
            { label: 'Caca' as const, resumo: resumoCaca, lista: carol, cor: 'emerald' },
            { label: 'João' as const, resumo: resumoJoao, lista: joao, cor: 'violet' },
          ]).map(({ label, resumo, lista, cor }) => (
            <div key={label}>
              <h3 className={`text-xl font-bold mb-3 text-${cor}-400`}>{label}</h3>

              {/* Card de salário individual */}
              <div className="mb-4">
                <CardSalario pessoa={label} mesRef={mesNav} salarios={salarios} onSalvo={carregar} />
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`bg-${cor}-900/20 rounded-lg p-3 border border-${cor}-800/40`}>
                  <p className={`text-${cor}-400 text-xs uppercase tracking-wider mb-1`}>{futuro ? 'Previsto' : 'Saídas'}</p>
                  <p className="text-lg font-bold text-red-400">{formatar(resumo.despesas)}</p>
                </div>
                <div className={`bg-${cor}-900/20 rounded-lg p-3 border border-${cor}-800/40`}>
                  <p className={`text-${cor}-400 text-xs uppercase tracking-wider mb-1`}>Saldo</p>
                  <p className={`text-lg font-bold ${resumo.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatar(resumo.saldo)}</p>
                </div>
              </div>

              {!futuro && (
                lista.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma transação.</p>
                ) : (
                  <div className={`rounded-xl overflow-hidden border border-${cor}-800/40`}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                          <th className="px-3 py-2 text-left font-medium">Data</th>
                          <th className="px-3 py-2 text-left font-medium">Descrição</th>
                          <th className="px-3 py-2 text-right font-medium">Valor</th>
                          <th className="px-3 py-2 text-center font-medium">Pago</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map(t => (
                          <LinhaTransacao key={t.id} t={t} onEditar={editar} onDeletar={deletar} onTogglePago={togglePago} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      <PainelTransacao
        aberto={painelAberto}
        transacao={transacaoEditando}
        onFechar={() => { setPainelAberto(false); setTransacaoEditando(null) }}
        onSalvar={() => { setPainelAberto(false); setTransacaoEditando(null); carregar() }}
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
