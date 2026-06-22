import { useEffect, useRef, useState } from 'react'
import { cartaoService, gastoFixoCartaoService, faturaService, faturaItemService } from '../../services/api'
import type { Cartao, GastoFixoCartao, Fatura, FaturaItem, ParcelaCartao } from '../../types'
import { getParser } from '../../utils/csvParsers'

const BANDEIRAS = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outro']
const CORES = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b']

function nomeMes(mesRef: string) {
  const [ano, mes] = mesRef.slice(0, 7).split('-')
  return new Date(parseInt(ano), parseInt(mes) - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function formatar(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

// ── Modal Cartão ─────────────────────────────────────────────────────────────

function ModalCartao({ cartao, onSalvar, onFechar }: {
  cartao?: Cartao | null
  onSalvar: () => void
  onFechar: () => void
}) {
  const [form, setForm] = useState({
    nome: cartao?.nome ?? '',
    pessoa: cartao?.pessoa ?? 'Caca',
    bandeira: cartao?.bandeira ?? '',
    diaFechamento: cartao?.diaFechamento ?? 1,
    cor: cartao?.cor ?? CORES[0],
    ativo: cartao?.ativo ?? true,
  })

  async function salvar() {
    if (!form.nome) return
    if (cartao) {
      await cartaoService.editar(cartao.id, { ...cartao, ...form })
    } else {
      await cartaoService.criar(form)
    }
    onSalvar()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="font-semibold">{cartao ? 'Editar cartão' : 'Novo cartão'}</h3>
          <button onClick={onFechar} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Nome</label>
            <input
              type="text"
              placeholder="Ex: Nubank Caca"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

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

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Bandeira</label>
            <select
              value={form.bandeira}
              onChange={e => setForm(f => ({ ...f, bandeira: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Selecione...</option>
              {BANDEIRAS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Dia de fechamento</label>
            <input
              type="number"
              min={1}
              max={31}
              value={form.diaFechamento}
              onChange={e => setForm(f => ({ ...f, diaFechamento: parseInt(e.target.value) || 1 }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {CORES.map(cor => (
                <button
                  key={cor}
                  onClick={() => setForm(f => ({ ...f, cor }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-800 flex gap-3">
          <button onClick={onFechar} className="flex-1 py-2.5 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button onClick={salvar} className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Gasto Fixo ──────────────────────────────────────────────────────────

function ModalGastoFixo({ cartaoId, gasto, onSalvar, onFechar }: {
  cartaoId: number
  gasto?: GastoFixoCartao | null
  onSalvar: () => void
  onFechar: () => void
}) {
  const [form, setForm] = useState({
    descricao: gasto?.descricao ?? '',
    valor: gasto ? String(gasto.valor) : '',
    parcelasTotal: gasto?.parcelasTotal ? String(gasto.parcelasTotal) : '',
    parcelasRestantes: gasto?.parcelasRestantes ? String(gasto.parcelasRestantes) : '',
    ativo: gasto?.ativo ?? true,
  })

  async function salvar() {
    if (!form.descricao || !form.valor) return
    const payload = {
      cartaoId,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      parcelasTotal: form.parcelasTotal ? parseInt(form.parcelasTotal) : undefined,
      parcelasRestantes: form.parcelasRestantes ? parseInt(form.parcelasRestantes) : undefined,
      ativo: form.ativo,
    }
    if (gasto) {
      await gastoFixoCartaoService.editar(gasto.id, { ...gasto, ...payload })
    } else {
      await gastoFixoCartaoService.criar(payload)
    }
    onSalvar()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="font-semibold">{gasto ? 'Editar gasto fixo' : 'Novo gasto fixo'}</h3>
          <button onClick={onFechar} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Netflix"
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Valor mensal</label>
            <input
              type="number"
              placeholder="0,00"
              value={form.valor}
              onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Parcelas total</label>
              <input
                type="number"
                placeholder="— (fixo)"
                value={form.parcelasTotal}
                onChange={e => setForm(f => ({ ...f, parcelasTotal: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Parcelas restantes</label>
              <input
                type="number"
                placeholder="—"
                value={form.parcelasRestantes}
                onChange={e => setForm(f => ({ ...f, parcelasRestantes: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-800 flex gap-3">
          <button onClick={onFechar} className="flex-1 py-2.5 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button onClick={salvar} className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Seção Gastos Fixos ────────────────────────────────────────────────────────

function SecaoGastosFixos({ cartao }: { cartao: Cartao }) {
  const [gastos, setGastos] = useState<GastoFixoCartao[]>([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<GastoFixoCartao | null>(null)

  async function carregar() {
    const data = await gastoFixoCartaoService.listarPorCartao(cartao.id)
    setGastos(data)
  }

  useEffect(() => { carregar() }, [cartao.id])

  async function deletar(id: number) {
    if (!confirm('Excluir este gasto fixo?')) return
    await gastoFixoCartaoService.deletar(id)
    await carregar()
  }

  const totalFixo = gastos.filter(g => g.ativo).reduce((acc, g) => acc + g.valor, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Gastos fixos no cartão</p>
          {gastos.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">Total ativo: <span className="text-white font-semibold">{formatar(totalFixo)}/mês</span></p>
          )}
        </div>
        <button
          onClick={() => { setEditando(null); setModal(true) }}
          className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors"
        >
          + Adicionar
        </button>
      </div>

      {gastos.length === 0 ? (
        <p className="text-gray-600 text-sm">Nenhum gasto fixo cadastrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {gastos.map(g => (
            <div key={g.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border group ${g.ativo ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-900 border-gray-800 opacity-50'}`}>
              <div>
                <p className={`text-sm font-medium ${g.ativo ? 'text-white' : 'text-gray-500 line-through'}`}>{g.descricao}</p>
                {g.parcelasTotal && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {g.parcelasRestantes ?? '?'}/{g.parcelasTotal} parcelas restantes
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-red-400">{formatar(g.valor)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditando(g); setModal(true) }} className="text-gray-500 hover:text-white p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => deletar(g.id)} className="text-gray-500 hover:text-red-400 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ModalGastoFixo
          cartaoId={cartao.id}
          gasto={editando}
          onSalvar={() => { setModal(false); carregar() }}
          onFechar={() => setModal(false)}
        />
      )}
    </div>
  )
}

// ── Cálculo de previsão ───────────────────────────────────────────────────────

interface ItemPrevisao {
  descricao: string
  valor: number
  tipo: 'fixo' | 'parcela'
  parcela?: string
}

function calcularPrevisao(
  mesAlvo: string,
  gastosFixos: GastoFixoCartao[],
  parcelas: ParcelaCartao[],
): ItemPrevisao[] {
  const resultado: ItemPrevisao[] = []
  const [anoAlvo, mesAlvoNum] = mesAlvo.slice(0, 7).split('-').map(Number)

  // Gastos fixos ativos
  for (const g of gastosFixos) {
    if (!g.ativo) continue
    resultado.push({ descricao: g.descricao, valor: g.valor, tipo: 'fixo' })
  }

  // Parcelas pendentes de meses anteriores
  for (const p of parcelas) {
    const match = p.parcela.match(/^(\d+)\/(\d+)$/)
    if (!match) continue
    const atual = parseInt(match[1])
    const total = parseInt(match[2])
    const restantes = total - atual
    if (restantes <= 0) continue

    const [anoRef, mesRef] = p.mesRef.slice(0, 7).split('-').map(Number)
    // meses de diferença entre o mês alvo e o mês da fatura onde essa parcela foi cobrada
    const diffMeses = (anoAlvo - anoRef) * 12 + (mesAlvoNum - mesRef)

    // a parcela cai no mês alvo se diffMeses está entre 1 e restantes (inclusive)
    if (diffMeses >= 1 && diffMeses <= restantes) {
      const parcelaFutura = `${atual + diffMeses}/${total}`
      resultado.push({ descricao: p.descricao, valor: p.valor, tipo: 'parcela', parcela: parcelaFutura })
    }
  }

  return resultado
}

// ── Seção Faturas ─────────────────────────────────────────────────────────────

function SecaoFaturas({ cartao }: { cartao: Cartao }) {
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [mesNav, setMesNav] = useState(mesAtual())
  const [itens, setItens] = useState<FaturaItem[]>([])
  const [gastosFixos, setGastosFixos] = useState<GastoFixoCartao[]>([])
  const [parcelas, setParcelas] = useState<ParcelaCartao[]>([])
  const [importando, setImportando] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function carregar() {
    const [faturaData, gastosData, parcelasData] = await Promise.all([
      faturaService.listarPorCartao(cartao.id),
      gastoFixoCartaoService.listarPorCartao(cartao.id),
      faturaItemService.listarParcelasPorCartao(cartao.id),
    ])
    setFaturas(faturaData)
    setGastosFixos(gastosData)
    setParcelas(parcelasData)
  }

  async function carregarItens(faturaId: number) {
    const data = await faturaItemService.listarPorFatura(faturaId)
    setItens(data)
  }

  useEffect(() => { carregar() }, [cartao.id])

  const faturaDoMes = faturas.find(f => f.mesRef.slice(0, 7) === mesNav.slice(0, 7))

  useEffect(() => {
    if (faturaDoMes) {
      carregarItens(faturaDoMes.id)
    } else {
      setItens([])
    }
  }, [faturaDoMes?.id])

  const previsao = !faturaDoMes ? calcularPrevisao(mesNav, gastosFixos, parcelas) : []
  const totalPrevisao = previsao.reduce((acc, i) => acc + i.valor, 0)

  async function togglePaga() {
    if (!faturaDoMes) return
    await faturaService.marcarPaga(faturaDoMes.id)
    await carregar()
  }

  async function deletarFatura() {
    if (!faturaDoMes) return
    if (!confirm('Excluir esta fatura?')) return
    await faturaService.deletar(faturaDoMes.id)
    setItens([])
    await carregar()
  }

  async function importarCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportando(true)
    try {
      const texto = await file.text()
      const parser = getParser(cartao.nome)
      const parsed = parser(texto)
      if (parsed.length === 0) {
        alert('Nenhum item encontrado no CSV. Verifique o formato do arquivo.')
        return
      }

      const valorTotal = Math.round(parsed.reduce((acc, i) => acc + i.valor, 0) * 100) / 100

      let faturaId: number
      if (faturaDoMes) {
        // Substitui itens e atualiza o total
        await faturaItemService.deletarPorFatura(faturaDoMes.id)
        await faturaService.editar(faturaDoMes.id, { ...faturaDoMes, valorTotal })
        faturaId = faturaDoMes.id
      } else {
        // Cria a fatura com o total calculado
        const nova = await faturaService.criar({
          cartaoId: cartao.id,
          mesRef: mesNav,
          valorTotal,
          valorFixo: 0,
          valorSuperfluo: 0,
          paga: false,
        })
        faturaId = nova.id
      }

      await faturaItemService.criarBulk(faturaId, parsed)
      await carregar()
      await carregarItens(faturaId)
    } finally {
      setImportando(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function deletarItem(id: number) {
    await faturaItemService.deletar(id)
    const novosItens = itens.filter(i => i.id !== id)
    setItens(novosItens)
    if (faturaDoMes) {
      const novoTotal = Math.round(novosItens.reduce((acc, i) => acc + i.valor, 0) * 100) / 100
      await faturaService.editar(faturaDoMes.id, { ...faturaDoMes, valorTotal: novoTotal })
      await carregar()
    }
  }

  return (
    <div>
      {/* Navegação de mês */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setMesNav(mesAnterior(mesNav))}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-semibold capitalize">{nomeMes(mesNav)}</span>
        <button
          onClick={() => setMesNav(mesProximo(mesNav))}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          ›
        </button>
      </div>

      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importarCSV} />

      {faturaDoMes ? (
        <div className="flex flex-col gap-4">
          {/* Total calculado dos itens */}
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total da fatura</p>
              <p className="text-2xl font-bold text-white">{formatar(faturaDoMes.valorTotal)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePaga}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  faturaDoMes.paga
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-700 text-gray-400 border border-gray-600 hover:border-emerald-500/50'
                }`}
              >
                {faturaDoMes.paga ? '✓ Paga' : 'Marcar paga'}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={importando}
                className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors disabled:opacity-50"
              >
                {importando ? 'Importando...' : 'Reimportar CSV'}
              </button>
              <button
                onClick={deletarFatura}
                className="p-2 rounded-lg text-gray-600 hover:text-red-400 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Lista de itens */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Itens {itens.length > 0 && `· ${itens.length}`}
            </p>
            {itens.length > 0 ? (
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {itens.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-800 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.descricao}</p>
                      <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        {item.parcela && <span className="text-gray-600">parcela {item.parcela}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-sm font-medium text-red-400 whitespace-nowrap">{formatar(item.valor)}</span>
                      <button
                        onClick={() => deletarItem(item.id)}
                        className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600">Nenhum item importado.</p>
            )}
          </div>
        </div>
      ) : (
        /* Previsão — nenhuma fatura cadastrada para o mês */
        <div className="flex flex-col gap-4">
          <div className="bg-gray-800/40 rounded-xl p-4 border border-dashed border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Previsão</p>
              <p className="text-2xl font-bold text-gray-300">{formatar(totalPrevisao)}</p>
              {previsao.length === 0 && (
                <p className="text-xs text-gray-600 mt-1">Nenhum gasto fixo ou parcela pendente.</p>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importando}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {importando ? 'Importando...' : 'Importar CSV'}
            </button>
          </div>

          {previsao.length > 0 && (
            <div className="flex flex-col gap-1">
              {previsao.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-800">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      item.tipo === 'fixo'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {item.tipo === 'fixo' ? 'fixo' : item.parcela}
                    </span>
                    <p className="text-sm text-gray-400 truncate">{item.descricao}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-400 ml-3 whitespace-nowrap">{formatar(item.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Tile do Cartão ────────────────────────────────────────────────────────────

function TileCartao({ cartao, selecionado, onClick }: {
  cartao: Cartao
  selecionado: boolean
  onClick: () => void
}) {
  const cor = cartao.cor ?? '#6366f1'
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col justify-between p-5 rounded-2xl w-52 h-32 text-left transition-all ${
        selecionado ? 'ring-2 ring-white scale-105' : 'hover:scale-102 opacity-80 hover:opacity-100'
      }`}
      style={{ background: `linear-gradient(135deg, ${cor}cc, ${cor}66)`, border: `1px solid ${cor}44` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-white font-semibold text-sm leading-tight">{cartao.nome}</p>
        {cartao.bandeira && (
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/80 font-medium">{cartao.bandeira}</span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          cartao.pessoa === 'Caca' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-violet-500/30 text-violet-200'
        }`}>{cartao.pessoa}</span>
        <span className="text-[10px] text-white/50">fecha dia {cartao.diaFechamento}</span>
      </div>
    </button>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Cartoes() {
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [selecionado, setSelecionado] = useState<Cartao | null>(null)
  const [aba, setAba] = useState<'gastos' | 'faturas'>('faturas')
  const [modalCartao, setModalCartao] = useState(false)
  const [editandoCartao, setEditandoCartao] = useState<Cartao | null>(null)

  async function carregar() {
    const data = await cartaoService.listar()
    setCartoes(data)
  }

  useEffect(() => { carregar() }, [])

  function selecionar(cartao: Cartao) {
    setSelecionado(c => c?.id === cartao.id ? null : cartao)
  }

  async function deletarCartao(cartao: Cartao) {
    if (!confirm(`Excluir o cartão "${cartao.nome}"?`)) return
    await cartaoService.deletar(cartao.id)
    if (selecionado?.id === cartao.id) setSelecionado(null)
    await carregar()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Cartões de Crédito</h2>
          <p className="text-gray-500 text-sm mt-1">Gerencie seus cartões, gastos fixos e faturas</p>
        </div>
        <button
          onClick={() => { setEditandoCartao(null); setModalCartao(true) }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Novo cartão
        </button>
      </div>

      {/* Grid de cartões */}
      <div className="flex gap-4 flex-wrap mb-8">
        {cartoes.map(c => (
          <div key={c.id} className="relative group">
            <TileCartao cartao={c} selecionado={selecionado?.id === c.id} onClick={() => selecionar(c)} />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={e => { e.stopPropagation(); setEditandoCartao(c); setModalCartao(true) }}
                className="bg-black/40 hover:bg-black/70 text-white p-1 rounded"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); deletarCartao(c) }}
                className="bg-black/40 hover:bg-red-500/60 text-white p-1 rounded"
                title="Excluir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
        {cartoes.length === 0 && (
          <p className="text-gray-600 text-sm">Nenhum cartão cadastrado ainda.</p>
        )}
      </div>

      {/* Painel de detalhe do cartão selecionado */}
      {selecionado && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-1 px-6 pt-5 border-b border-gray-800">
            <div className="flex-1 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selecionado.cor ?? '#6366f1' }} />
              <span className="font-semibold">{selecionado.nome}</span>
            </div>
            <button
              onClick={() => setAba('faturas')}
              className={`px-5 py-3 text-sm border-b-2 transition-colors ${aba === 'faturas' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              Faturas
            </button>
            <button
              onClick={() => setAba('gastos')}
              className={`px-5 py-3 text-sm border-b-2 transition-colors ${aba === 'gastos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              Gastos Fixos
            </button>
          </div>
          <div className="p-6">
            {aba === 'faturas'
              ? <SecaoFaturas cartao={selecionado} />
              : <SecaoGastosFixos cartao={selecionado} />
            }
          </div>
        </div>
      )}

      {modalCartao && (
        <ModalCartao
          cartao={editandoCartao}
          onSalvar={() => { setModalCartao(false); carregar() }}
          onFechar={() => setModalCartao(false)}
        />
      )}
    </div>
  )
}
