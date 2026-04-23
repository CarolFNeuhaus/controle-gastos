import { useEffect, useState } from 'react'
import { categoriaService } from '../../services/api'
import type { Categoria } from '../../types'

const PESSOAS = ['Caca', 'João', 'ambos']
const PESSOA_LABEL: Record<string, string> = { Caca: 'Caca', João: 'João', ambos: 'Ambos' }

const FORM_VAZIO = {
  nome: '',
  descricao: '',
  cor: '#6366f1',
  pessoa: 'Caca',
  isFixa: false,
  isSalario: false,
  ativa: true,
}

export default function Configuracoes() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    try {
      const data = await categoriaService.listar()
      setCategorias(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function iniciarEdicao(cat: Categoria) {
    setEditando(cat)
    setForm({
      nome: cat.nome,
      descricao: cat.descricao ?? '',
      cor: cat.cor ?? '#6366f1',
      pessoa: cat.pessoa,
      isFixa: cat.isFixa,
      isSalario: cat.isSalario,
      ativa: cat.ativa,
    })
  }

  function cancelar() {
    setEditando(null)
    setForm(FORM_VAZIO)
  }

  async function salvar() {
    if (!form.nome.trim()) return
    setSalvando(true)
    try {
      if (editando) {
        await categoriaService.editar(editando.id, {
          ...editando,
          ...form,
        })
      } else {
        await categoriaService.criar(form)
      }
      cancelar()
      await carregar()
    } finally {
      setSalvando(false)
    }
  }

  async function deletar(id: number) {
    if (!confirm('Deletar esta categoria?')) return
    await categoriaService.deletar(id)
    await carregar()
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-gray-500 text-sm mt-1">Gerencie categorias e preferências</p>
      </div>

      {/* Formulário */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
        <h3 className="font-semibold mb-5 text-emerald-400">
          {editando ? 'Editar categoria' : 'Nova categoria'}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Nome</label>
            <input
              type="text"
              placeholder="Ex: Alimentação"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Descrição</label>
            <input
              type="text"
              placeholder="Opcional"
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Pessoa</label>
            <div className="flex gap-2">
              {PESSOAS.map(p => (
                <button
                  key={p}
                  onClick={() => setForm(f => ({ ...f, pessoa: p }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.pessoa === p
                      ? p === 'Caca'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : p === 'João'
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800 text-gray-400 border border-transparent'
                  }`}
                >
                  {PESSOA_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Cor</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.cor}
                onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-gray-400 text-sm">{form.cor}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFixa}
                onChange={e => setForm(f => ({ ...f, isFixa: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-sm text-gray-300">Gasto fixo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isSalario}
                onChange={e => setForm(f => ({ ...f, isSalario: e.target.checked }))}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-sm text-yellow-300">É salário</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ativa}
                onChange={e => setForm(f => ({ ...f, ativa: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-sm text-gray-300">Ativa</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={salvar}
            disabled={salvando || !form.nome.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Adicionar categoria'}
          </button>
          {editando && (
            <button
              onClick={cancelar}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-5 border-b border-gray-800">
          <h3 className="font-medium">Categorias cadastradas</h3>
        </div>

        {loading ? (
          <p className="p-5 text-gray-500 text-sm">Carregando...</p>
        ) : categorias.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {categorias.map(cat => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.cor ?? '#6366f1' }}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {cat.nome}
                      {cat.isFixa && (
                        <span className="ml-2 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">fixo</span>
                      )}
                      {cat.isSalario && (
                        <span className="ml-2 text-xs text-yellow-300 bg-yellow-500/10 px-2 py-0.5 rounded">salário</span>
                      )}
                      {!cat.ativa && (
                        <span className="ml-2 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">inativa</span>
                      )}
                    </p>
                    {cat.descricao && <p className="text-xs text-gray-500">{cat.descricao}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    cat.pessoa === 'Caca'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : cat.pessoa === 'João'
                      ? 'text-violet-400 bg-violet-500/10'
                      : 'text-blue-400 bg-blue-500/10'
                  }`}>
                    {PESSOA_LABEL[cat.pessoa] ?? cat.pessoa}
                  </span>
                  <button
                    onClick={() => iniciarEdicao(cat)}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletar(cat.id)}
                    className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
