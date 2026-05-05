import type { Categoria, Transacao, Cartao, Divida, GastoFixo, GastoFixoCartao, Fatura, FaturaItem } from '../types'

const BASE_URL = 'http://localhost:5211/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Erro da API:', response.status, body)
    throw new Error(`Erro ${response.status}: ${body}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const categoriaService = {
  listar: () => request<Categoria[]>('/categoria'),
  criar: (data: Omit<Categoria, 'id' | 'criadaEm'>) =>
    request<Categoria>('/categoria', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: Categoria) =>
    request<void>(`/categoria/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) =>
    request<void>(`/categoria/${id}`, { method: 'DELETE' }),
}

export const transacaoService = {
  listar: () => request<Transacao[]>('/transacao'),
  listarPorMes: (pessoa: string, mesRef: string) =>
    request<Transacao[]>(`/transacao/${pessoa}/${mesRef}`),
  criar: (data: Omit<Transacao, 'id' | 'categoria'>) =>
    request<Transacao>('/transacao', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: Transacao) =>
    request<void>(`/transacao/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  marcarPago: (id: number) =>
    request<void>(`/transacao/${id}/pago`, { method: 'PATCH' }),
  deletar: (id: number) =>
    request<void>(`/transacao/${id}`, { method: 'DELETE' }),
}


export const cartaoService = {
  listar: () => request<Cartao[]>('/cartao'),
  criar: (data: Omit<Cartao, 'id'>) =>
    request<Cartao>('/cartao', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: Cartao) =>
    request<void>(`/cartao/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) =>
    request<void>(`/cartao/${id}`, { method: 'DELETE' }),
}

export const gastoFixoService = {
  listar: () => request<GastoFixo[]>('/gastofixo'),
  criar: (data: Omit<GastoFixo, 'id' | 'categoria'>) =>
    request<GastoFixo>('/gastofixo', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: GastoFixo) =>
    request<void>(`/gastofixo/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) => request<void>(`/gastofixo/${id}`, { method: 'DELETE' }),
  gerarParaMes: (mesRef: string) =>
    request<{ gerados: number; atualizados: number; total: number }>(`/gastofixo/gerar/${mesRef}`, { method: 'POST' }),
}

export const gastoFixoCartaoService = {
  listar: () => request<GastoFixoCartao[]>('/gastofixocartao'),
  listarPorCartao: (cartaoId: number) => request<GastoFixoCartao[]>(`/gastofixocartao/cartao/${cartaoId}`),
  criar: (data: Omit<GastoFixoCartao, 'id' | 'cartao'>) =>
    request<GastoFixoCartao>('/gastofixocartao', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: GastoFixoCartao) =>
    request<void>(`/gastofixocartao/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) =>
    request<void>(`/gastofixocartao/${id}`, { method: 'DELETE' }),
}

export const faturaItemService = {
  listarPorFatura: (faturaId: number) => request<FaturaItem[]>(`/faturaitem/fatura/${faturaId}`),
  criarBulk: (faturaId: number, itens: Omit<FaturaItem, 'id' | 'faturaId'>[]) =>
    request<void>(`/faturaitem/fatura/${faturaId}/bulk`, { method: 'POST', body: JSON.stringify(itens) }),
  deletar: (id: number) => request<void>(`/faturaitem/${id}`, { method: 'DELETE' }),
  deletarPorFatura: (faturaId: number) => request<void>(`/faturaitem/fatura/${faturaId}`, { method: 'DELETE' }),
}

export const faturaService = {
  listar: () => request<Fatura[]>('/fatura'),
  listarPorCartao: (cartaoId: number) => request<Fatura[]>(`/fatura/cartao/${cartaoId}`),
  criar: (data: Omit<Fatura, 'id' | 'cartao'>) =>
    request<Fatura>('/fatura', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: Fatura) =>
    request<void>(`/fatura/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  marcarPaga: (id: number) =>
    request<void>(`/fatura/${id}/paga`, { method: 'PATCH' }),
  deletar: (id: number) =>
    request<void>(`/fatura/${id}`, { method: 'DELETE' }),
}

export const dividaService = {
  listar: () => request<Divida[]>('/divida'),
  listarAtivas: () => request<Divida[]>('/divida/ativas'),
  listarHistorico: () => request<Divida[]>('/divida/historico'),
  buscar: (id: number) => request<Divida>(`/divida/${id}`),
  criar: (data: Omit<Divida, 'id' | 'valorPago' | 'status' | 'criadaEm'>) =>
    request<Divida>('/divida', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: Divida) =>
    request<void>(`/divida/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) =>
    request<void>(`/divida/${id}`, { method: 'DELETE' }),
  registrarPagamento: (id: number, pagamento: { valor: number; data: string; categoriaId: number; descricao?: string }) =>
    request<Transacao>(`/divida/${id}/pagamento`, { method: 'POST', body: JSON.stringify(pagamento) }),
  listarPagamentos: (id: number) =>
    request<Transacao[]>(`/divida/${id}/pagamentos`),
  editarPagamento: (dividaId: number, transacaoId: number, dados: { valor: number; data: string; descricao?: string }) =>
    request<void>(`/divida/${dividaId}/pagamento/${transacaoId}`, { method: 'PUT', body: JSON.stringify(dados) }),
}

