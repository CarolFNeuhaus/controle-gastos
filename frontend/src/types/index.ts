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

export interface Salario {
  id: number
  pessoa: string
  mesRef: string   // YYYY-MM-DD
  valor: number
  horas?: number
  taxaHora?: number
  isEstimativa: boolean
  criadoEm: string
}

export interface ParcelaCartao {
  id: number
  faturaId: number
  cartaoId?: number
  mesRef: string   // YYYY-MM-DD da fatura onde essa parcela foi cobrada
  descricao: string
  valor: number
  parcela: string  // ex: "2/3"
}

