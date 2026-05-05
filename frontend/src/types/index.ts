export interface Categoria {
  id: number
  nome: string
  descricao?: string
  cor?: string
  pessoa: string
  isFixa: boolean
  isSalario: boolean
  ativa: boolean
  criadaEm: string
}

export interface Cartao {
  id: number
  nome: string
  pessoa: string
  bandeira?: string
  diaFechamento: number
  ativo: boolean
  cor?: string
}

export interface Divida {
  id: number
  descricao: string
  pessoa: string
  pessoaRelacionada: string
  tipo: string // a_receber / a_pagar
  valorTotal: number
  valorPago: number
  dataInicio: string
  dataPrevista?: string
  observacao?: string
  status: string // ativa / quitada
  criadaEm: string
}

export interface Transacao {
  id: number
  data: string
  mesRef: string
  pessoa: string
  categoriaId: number
  categoria?: Categoria
  valor: number
  tipo: string
  descricao?: string
  isEstimativa: boolean
  confirmado: boolean
  pago: boolean
  dividaId?: number
  faturaId?: number
}

export interface GastoFixo {
  id: number
  descricao: string
  valor: number
  categoriaId: number
  categoria?: Categoria
  pessoa: string
  diaVencimento?: number
  ativo: boolean
}

export interface GastoFixoCartao {
  id: number
  cartaoId: number
  cartao?: Cartao
  descricao: string
  valor: number
  parcelasTotal?: number
  parcelasRestantes?: number
  ativo: boolean
}

export interface Fatura {
  id: number
  cartaoId: number
  cartao?: Cartao
  mesRef: string
  valorTotal: number
  valorFixo: number
  valorSuperfluo: number
  paga: boolean
}

export interface FaturaItem {
  id: number
  faturaId: number
  data: string
  descricao: string
  valor: number
  parcela?: string
  valorTotalCompra?: number
}

