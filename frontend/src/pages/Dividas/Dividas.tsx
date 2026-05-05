import { useEffect, useState } from 'react'
import { dividaService, categoriaService } from '../../services/api'
import type { Divida, Categoria, Transacao } from '../../types'

function formatar(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

const FORM_VAZIO = {
  descricao: '',
  pessoa: 'Caca',
  pessoaRelacionada: 'João',
  pessoaRelacionadaCustom: '',
  modoRelacionada: 'João' as 'Caca' | 'João' | 'outro',
  tipo: 'a_pagar',
  valorTotal: '',
  dataInicio: new Date().toISOString().slice(0, 10),
  dataPrevista: '',
  observacao: '',
}

// ─── Modal: registrar pagamento ───────────────────────────────────────────────

interface ModalPagamentoProps {
  divida: Divida
  categorias: Categoria[]
  onFechar: () => void
  onSalvo: () => void
}

function ModalPagamento({ divida, categorias, onFechar, onSalvo }: ModalPagamentoProps) {
  const [valor, setValor] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [categoriaId, setCategoriaId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)

  const restante = divida.valorTotal - divida.valorPago
  const criaTransacaoDupla =
    ['Caca', 'João'].includes(divida.pessoaRelacionada) && divida.pessoaRelacionada !== divida.pessoa

  async function salvar() {
    if (!valor || !categoriaId) return
    setSalvando(true)
    try {
      await dividaService.registrarPagamento(divida.id, {
        valor: parseFloat(valor),
        data,
        categoriaId: parseInt(categoriaId),
        descricao: descricao || undefined,
      })
      onSalvo()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">Registrar pagamento</h3>
          <button onClick={onFechar} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-5">
          <p className="text-sm text-gray-400">{divida.descricao}</p>
          <p className="text-xs text-gray-500 mt-1">
            Restante: <span className="text-white font-bold">{formatar(restante)}</span>
          </p>
          {criaTransacaoDupla && (
            <p className="text-xs text-blue-400 mt-2">
              Vai criar transações para <strong>{divida.pessoa}</strong> e <strong>{divida.pessoaRelacionada}</strong> automaticamente.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Valor pago</label>
            <input type="number" placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Categoria</label>
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500">
              <option value="">Selecione...</option>
              {categorias
                .filter(c => c.ativa && (c.pessoa === divida.pessoa || c.pessoa === 'ambos'))
                .map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Descrição (opcional)</label>
            <input type="text" placeholder={`Pagamento: ${divida.descricao}`} value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={salvar} disabled={salvando || !valor || !categoriaId}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors">
            {salvando ? 'Salvando...' : 'Confirmar pagamento'}
          </button>
          <button onClick={onFechar} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: editar pagamento ──────────────────────────────────────────────────

interface ModalEditarPagamentoProps {
  dividaId: number
  transacao: Transacao
  onFechar: () => void
  onSalvo: () => void
}

function ModalEditarPagamento({ dividaId, transacao, onFechar, onSalvo }: ModalEditarPagamentoProps) {
  const [valor, setValor] = useState(String(transacao.valor))
  const [data, setData] = useState(transacao.data)
  const [descricao, setDescricao] = useState(transacao.descricao ?? '')
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    if (!valor) return
    setSalvando(true)
    try {
      await dividaService.editarPagamento(dividaId, transacao.id, {
        valor: parseFloat(valor),
        data,
        descricao: descricao || undefined,
      })
      onSalvo()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm">Editar pagamento</h3>
          <button onClick={onFechar} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Valor</label>
            <input type="number" value={valor} onChange={e => setValor(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Descrição</label>
            <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={salvar} disabled={salvando || !valor}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors">
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={onFechar} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card dívida ──────────────────────────────────────────────────────────────

interface CardDividaProps {
  divida: Divida
  onPagamento: (d: Divida) => void
  onEditar: (d: Divida) => void
  onDeletar: (id: number) => void
  onAtualizar: () => void
}

function CardDivida({ divida, onPagamento, onEditar, onDeletar, onAtualizar }: CardDividaProps) {
  const [expandido, setExpandido] = useState(false)
  const [pagamentos, setPagamentos] = useState<Transacao[]>([])
  const [carregando, setCarregando] = useState(false)
  const [editandoPagamento, setEditandoPagamento] = useState<Transacao | null>(null)

  const isCaca = divida.pessoa === 'Caca'
  const restante = divida.valorTotal - divida.valorPago
  const progresso = divida.valorTotal > 0 ? (divida.valorPago / divida.valorTotal) * 100 : 0
  const quitada = divida.status === 'quitada'

  async function togglePagamentos() {
    if (expandido) {
      setExpandido(false)
      return
    }
    setCarregando(true)
    try {
      const data = await dividaService.listarPagamentos(divida.id)
      setPagamentos(data)
      setExpandido(true)
    } finally {
      setCarregando(false)
    }
  }

  async function recarregarPagamentos() {
    const data = await dividaService.listarPagamentos(divida.id)
    setPagamentos(data)
    onAtualizar()
  }

  return (
    <>
      <div className={`rounded-xl border p-5 ${
        quitada
          ? 'bg-gray-900/50 border-gray-800 opacity-70'
          : isCaca
            ? 'bg-emerald-950/30 border-emerald-800/40'
            : 'bg-violet-950/20 border-violet-800/40'
      }`}>
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                isCaca ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'
              }`}>{divida.pessoa}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                divida.tipo === 'a_receber' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
              }`}>{divida.tipo === 'a_receber' ? 'a receber' : 'a pagar'}</span>
              {quitada && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">quitada</span>
              )}
            </div>
            <p className="font-semibold text-white">{divida.descricao}</p>
            <p className="text-sm text-gray-400">{divida.pessoaRelacionada}</p>
          </div>

          <div className="flex items-center gap-1.5">
            {!quitada && (
              <button onClick={() => onPagamento(divida)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isCaca
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                }`}>
                + Pagamento
              </button>
            )}
            <button onClick={() => onEditar(divida)} title="Editar"
              className="text-gray-500 hover:text-white p-1.5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={() => onDeletar(divida.id)} title="Excluir"
              className="text-gray-500 hover:text-red-400 p-1.5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Valores */}
        <div className="flex gap-4 text-sm mb-3">
          <div>
            <p className="text-gray-500 text-xs">Total</p>
            <p className="font-bold">{formatar(divida.valorTotal)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Pago</p>
            <p className="font-bold text-emerald-400">{formatar(divida.valorPago)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Restante</p>
            <p className={`font-bold ${quitada ? 'text-gray-500' : 'text-red-400'}`}>{formatar(restante)}</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isCaca ? 'bg-emerald-500' : 'bg-violet-500'}`}
            style={{ width: `${Math.min(progresso, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{progresso.toFixed(0)}% quitado</span>
          <span>desde {formatarData(divida.dataInicio)}</span>
        </div>

        {divida.dataPrevista && !quitada && (
          <p className="text-xs text-gray-500 mt-1.5">Previsto para: {formatarData(divida.dataPrevista)}</p>
        )}
        {divida.observacao && (
          <p className="text-xs text-gray-600 mt-1 italic">{divida.observacao}</p>
        )}

        {/* Toggle histórico */}
        <button
          onClick={togglePagamentos}
          className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {carregando ? 'Carregando...' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 transition-transform ${expandido ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              {expandido ? 'Ocultar pagamentos' : 'Ver histórico de pagamentos'}
            </>
          )}
        </button>

        {/* Histórico de pagamentos */}
        {expandido && (
          <div className="mt-3 border-t border-white/5 pt-3">
            {pagamentos.length === 0 ? (
              <p className="text-xs text-gray-600">Nenhum pagamento registrado.</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {pagamentos.map(p => (
                  <div key={p.id} className="group flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20 flex-shrink-0">{formatarData(p.data)}</span>
                      <span className={`text-sm font-bold ${p.tipo === 'R' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.tipo === 'R' ? '+' : '-'}{formatar(p.valor)}
                      </span>
                      {p.descricao && (
                        <span className="text-xs text-gray-500 truncate max-w-48">{p.descricao}</span>
                      )}
                      {p.categoria && (
                        <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded bg-gray-800">{p.categoria.nome}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setEditandoPagamento(p)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white p-1"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {editandoPagamento && (
        <ModalEditarPagamento
          dividaId={divida.id}
          transacao={editandoPagamento}
          onFechar={() => setEditandoPagamento(null)}
          onSalvo={async () => {
            setEditandoPagamento(null)
            await recarregarPagamentos()
          }}
        />
      )}
    </>
  )
}

// ─── Formulário de dívida ─────────────────────────────────────────────────────

type FormState = typeof FORM_VAZIO

interface FormDividaProps {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  salvando: boolean
  editando: Divida | null
  onSalvar: () => void
  onCancelar: () => void
}

function FormDivida({ form, setForm, salvando, editando, onSalvar, onCancelar }: FormDividaProps) {
  function setPessoaRelacionada(modo: 'Caca' | 'João' | 'outro') {
    setForm(f => ({
      ...f,
      modoRelacionada: modo,
      pessoaRelacionada: modo !== 'outro' ? modo : f.pessoaRelacionadaCustom,
    }))
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-8">
      <h3 className="font-semibold text-emerald-400 mb-5">
        {editando ? 'Editar dívida' : 'Nova dívida'}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Descrição</label>
          <input type="text" placeholder="Ex: Empréstimo pro João" value={form.descricao}
            onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Pessoa dona</label>
          <div className="flex gap-2">
            {['Caca', 'João'].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, pessoa: p }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.pessoa === p
                    ? p === 'Caca'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'bg-gray-800 text-gray-400 border border-transparent'
                }`}>{p}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Tipo</label>
          <div className="flex gap-2">
            {[{ value: 'a_pagar', label: 'A pagar' }, { value: 'a_receber', label: 'A receber' }].map(({ value, label }) => (
              <button key={value} onClick={() => setForm(f => ({ ...f, tipo: value }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.tipo === value
                    ? value === 'a_pagar'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-800 text-gray-400 border border-transparent'
                }`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Pessoa relacionada</label>
          <div className="flex gap-2 mb-2">
            {(['Caca', 'João', 'outro'] as const).map(modo => (
              <button key={modo} onClick={() => setPessoaRelacionada(modo)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.modoRelacionada === modo
                    ? modo === 'Caca'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : modo === 'João'
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-gray-700 text-white border border-gray-600'
                    : 'bg-gray-800 text-gray-400 border border-transparent'
                }`}>
                {modo === 'outro' ? 'Outro...' : modo}
              </button>
            ))}
          </div>
          {form.modoRelacionada === 'outro' ? (
            <input type="text" placeholder="Ex: tio, banco, amigo" value={form.pessoaRelacionadaCustom}
              onChange={e => setForm(f => ({ ...f, pessoaRelacionadaCustom: e.target.value, pessoaRelacionada: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
          ) : (
            <p className="text-xs text-blue-400/70">Pagamento vai criar transação automática para ambos.</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Valor total</label>
          <input type="number" placeholder="0,00" value={form.valorTotal}
            onChange={e => setForm(f => ({ ...f, valorTotal: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Data início</label>
          <input type="date" value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Data prevista (opcional)</label>
          <input type="date" value={form.dataPrevista} onChange={e => setForm(f => ({ ...f, dataPrevista: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Observação (opcional)</label>
          <input type="text" placeholder="Observações adicionais" value={form.observacao}
            onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={onSalvar}
          disabled={salvando || !form.descricao.trim() || !form.pessoaRelacionada.trim() || !form.valorTotal}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Adicionar dívida'}
        </button>
        <button onClick={onCancelar}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Dividas() {
  const [aba, setAba] = useState<'ativas' | 'historico'>('ativas')
  const [dividas, setDividas] = useState<Divida[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [formularioAberto, setFormularioAberto] = useState(false)
  const [editando, setEditando] = useState<Divida | null>(null)
  const [pagandoDivida, setPagandoDivida] = useState<Divida | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)

  async function carregar() {
    const [d, c] = await Promise.all([dividaService.listar(), categoriaService.listar()])
    setDividas(d)
    setCategorias(c)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const ativas = dividas.filter(d => d.status === 'ativa')
  const historico = dividas.filter(d => d.status === 'quitada')
  const lista = aba === 'ativas' ? ativas : historico

  function abrirNovaForm() {
    setEditando(null)
    setForm(FORM_VAZIO)
    setFormularioAberto(true)
  }

  function abrirEdicao(d: Divida) {
    const modo: 'Caca' | 'João' | 'outro' =
      d.pessoaRelacionada === 'Caca' ? 'Caca' : d.pessoaRelacionada === 'João' ? 'João' : 'outro'
    setEditando(d)
    setForm({
      descricao: d.descricao,
      pessoa: d.pessoa,
      pessoaRelacionada: d.pessoaRelacionada,
      pessoaRelacionadaCustom: modo === 'outro' ? d.pessoaRelacionada : '',
      modoRelacionada: modo,
      tipo: d.tipo,
      valorTotal: String(d.valorTotal),
      dataInicio: d.dataInicio,
      dataPrevista: d.dataPrevista ?? '',
      observacao: d.observacao ?? '',
    })
    setFormularioAberto(true)
  }

  function cancelar() {
    setFormularioAberto(false)
    setEditando(null)
    setForm(FORM_VAZIO)
  }

  async function salvar() {
    if (!form.descricao.trim() || !form.pessoaRelacionada.trim() || !form.valorTotal) return
    setSalvando(true)
    try {
      const payload = {
        descricao: form.descricao,
        pessoa: form.pessoa,
        pessoaRelacionada: form.pessoaRelacionada,
        tipo: form.tipo,
        valorTotal: parseFloat(form.valorTotal),
        dataInicio: form.dataInicio,
        dataPrevista: form.dataPrevista || undefined,
        observacao: form.observacao || undefined,
      }
      if (editando) {
        await dividaService.editar(editando.id, { ...editando, ...payload })
      } else {
        await dividaService.criar(payload)
      }
      cancelar()
      await carregar()
    } finally {
      setSalvando(false)
    }
  }

  async function deletar(id: number) {
    if (!confirm('Excluir esta dívida? As transações vinculadas não serão removidas.')) return
    await dividaService.deletar(id)
    await carregar()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500">Carregando...</div>
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Dívidas</h2>
          <p className="text-gray-500 text-sm mt-1">Controle de empréstimos e cobranças</p>
        </div>
        <button onClick={abrirNovaForm}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nova dívida
        </button>
      </div>

      {formularioAberto && (
        <FormDivida form={form} setForm={setForm} salvando={salvando}
          editando={editando} onSalvar={salvar} onCancelar={cancelar} />
      )}

      <div className="flex gap-2 bg-gray-900 p-1 rounded-lg w-fit mb-6">
        <button onClick={() => setAba('ativas')}
          className={`px-5 py-2 rounded-md text-sm transition-colors ${aba === 'ativas' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
          Ativas {ativas.length > 0 && (
            <span className="ml-1 text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">{ativas.length}</span>
          )}
        </button>
        <button onClick={() => setAba('historico')}
          className={`px-5 py-2 rounded-md text-sm transition-colors ${aba === 'historico' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
          Histórico {historico.length > 0 && (
            <span className="ml-1 text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">{historico.length}</span>
          )}
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {aba === 'ativas' ? 'Nenhuma dívida ativa.' : 'Nenhuma dívida quitada.'}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {lista.map(d => (
            <CardDivida key={d.id} divida={d}
              onPagamento={setPagandoDivida}
              onEditar={abrirEdicao}
              onDeletar={deletar}
              onAtualizar={carregar}
            />
          ))}
        </div>
      )}

      {pagandoDivida && (
        <ModalPagamento
          divida={pagandoDivida}
          categorias={categorias}
          onFechar={() => setPagandoDivida(null)}
          onSalvo={async () => {
            setPagandoDivida(null)
            await carregar()
          }}
        />
      )}
    </div>
  )
}
