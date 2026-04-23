import type { Categoria, Transacao, SalarioEstimativa, Cartao, Meta } from '../types'

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

export const salarioService = {
  listar: () => request<SalarioEstimativa[]>('/salarioestimativa'),
  buscarPorMes: (pessoa: string, mesRef: string) =>
    request<SalarioEstimativa>(`/salarioestimativa/${pessoa}/${mesRef}`),
  criar: (data: Omit<SalarioEstimativa, 'id' | 'atualizadoEm'>) =>
    request<SalarioEstimativa>('/salarioestimativa', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: SalarioEstimativa) =>
    request<void>(`/salarioestimativa/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
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

export const metaService = {
  listar: () => request<Meta[]>('/meta'),
  criar: (data: Omit<Meta, 'id' | 'categoria'>) =>
    request<Meta>('/meta', { method: 'POST', body: JSON.stringify(data) }),
  editar: (id: number, data: Meta) =>
    request<void>(`/meta/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) =>
    request<void>(`/meta/${id}`, { method: 'DELETE' }),
}
