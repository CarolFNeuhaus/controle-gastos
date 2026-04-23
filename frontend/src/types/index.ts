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

export interface SalarioEstimativa {
  id: number
  pessoa: string
  mesRef: string
  valorEstimado: number
  valorReal?: number
  confirmado: boolean
  observacao?: string
  atualizadoEm: string
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

export interface Meta {
  id: number
  nome: string
  tipo: string
  pessoa: string
  valorAlvo: number
  prazo: string
  categoriaId?: number
  categoria?: Categoria
  ativa: boolean
}

export interface MetaProgresso {
  id: number
  metaId: number
  meta?: Meta
  mesRef: string
  valorGuardadoMes: number
  valorAcumulado: number
  percentualAtingido: number
  calculadoEm: string
  snapshotSaldo: number
}

export interface Projecao {
  id: number
  calculadoEm: string
  pessoa: string
  mediaGuardadaMes: number
  projecao12m: number
  projecao60m: number
  simulacaoValorAlvo?: number
  mesesNecessarios?: number
}
