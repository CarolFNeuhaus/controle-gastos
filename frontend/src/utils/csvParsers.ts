export interface ItemFaturaCSV {
  data: string             // YYYY-MM-DD
  descricao: string
  valor: number            // valor da parcela atual (o que será cobrado nessa fatura)
  parcela?: string         // ex: "2/3"
  valorTotalCompra?: number // valor total da compra (valor × totalParcelas)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseBRL(valor: string): number {
  // aceita "R$ 1.234,56" / "R$ -3.500,36" / "1234.56" / "39,90"
  const limpo = valor.replace(/R\$\s*/g, '').trim().replace(/[^\d,.-]/g, '')
  if (limpo.includes(',') && limpo.includes('.')) {
    return parseFloat(limpo.replace(/\./g, '').replace(',', '.'))
  }
  if (limpo.includes(',')) {
    return parseFloat(limpo.replace(',', '.'))
  }
  return parseFloat(limpo)
}

function dataParaISO(data: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return data
  const [d, m, a] = data.split('/')
  return `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function splitCSVLine(linha: string, sep: string): string[] {
  return linha.split(sep).map(c => c.replace(/^"|"$/g, '').trim())
}

function detectarSeparador(csv: string): string {
  const primeira = csv.split('\n')[0]
  return (primeira.match(/;/g) ?? []).length > (primeira.match(/,/g) ?? []).length ? ';' : ','
}

// ── Parser: formato "Portador" ─────────────────────────────────────────────
// Colunas: Data;Estabelecimento;Portador;Valor;Parcela
// Exemplos de Parcela: "-" / "2 de 3" / "1 de 2" / " de 1"
// Valor no formato: "R$ 1.234,56" ou "R$ -3.500,36"
// Lógica de parcela:
//   - Parcela = "X de Y" → valorParcela = Valor, valorTotalCompra = Valor * Y
//   - Parcela = "-" ou inválida → sem parcelamento
//   - Valor negativo → pagamento de fatura, ignorar

export function parsePortador(csv: string): ItemFaturaCSV[] {
  const linhas = csv.split('\n').map(l => l.trim()).filter(Boolean)
  if (linhas.length < 2) return []

  // detecta separador (normalmente ;)
  const sep = detectarSeparador(csv)

  // encontra a linha do header
  const headerIdx = linhas.findIndex(l => {
    const lower = l.toLowerCase()
    return lower.includes('estabelecimento') || lower.includes('portador')
  })
  if (headerIdx < 0) return []

  const header = splitCSVLine(linhas[headerIdx], sep).map(h => h.toLowerCase())
  const iData = header.findIndex(h => h.includes('data') || h.includes('date'))
  const iDesc = header.findIndex(h => h.includes('estabelecimento') || h.includes('descrição') || h.includes('lancamento'))
  const iValor = header.findIndex(h => h === 'valor' || h.includes('valor'))
  const iParcela = header.findIndex(h => h.includes('parcela'))

  if (iData < 0 || iDesc < 0 || iValor < 0) return []

  const resultado: ItemFaturaCSV[] = []

  for (const linha of linhas.slice(headerIdx + 1)) {
    const cols = splitCSVLine(linha, sep)
    if (cols.length < 3) continue

    const valorBruto = parseBRL(cols[iValor] ?? '')
    if (isNaN(valorBruto) || valorBruto <= 0) continue // ignora pagamentos (valor negativo) e zeros

    const dataStr = cols[iData]?.trim() ?? ''
    const descricao = cols[iDesc]?.trim() ?? ''
    const parcelaStr = iParcela >= 0 ? (cols[iParcela] ?? '').trim() : ''

    let parcela: string | undefined
    let valorTotalCompra: number | undefined

    // "2 de 3" → atual=2, total=3
    const matchParcela = parcelaStr.match(/^(\d+)\s+de\s+(\d+)$/)
    if (matchParcela) {
      const atual = parseInt(matchParcela[1])
      const total = parseInt(matchParcela[2])
      parcela = `${atual}/${total}`
      valorTotalCompra = Math.round(valorBruto * total * 100) / 100
    }

    resultado.push({
      data: dataParaISO(dataStr),
      descricao,
      valor: valorBruto,
      parcela,
      valorTotalCompra,
    })
  }

  return resultado
}

// ── Nubank ────────────────────────────────────────────────────────────────────
// Formato: date,category,title,amount

export function parseNubank(csv: string): ItemFaturaCSV[] {
  const linhas = csv.split('\n').map(l => l.trim()).filter(Boolean)
  const header = splitCSVLine(linhas[0], ',').map(h => h.toLowerCase())
  const iData = header.findIndex(h => h === 'date' || h === 'data')
  const iDesc = header.findIndex(h => h === 'title' || h === 'título')
  const iValor = header.findIndex(h => h === 'amount' || h === 'valor')

  return linhas.slice(1).flatMap(linha => {
    const cols = splitCSVLine(linha, ',')
    if (cols.length < 3) return []
    const valor = parseBRL(cols[iValor] ?? cols[cols.length - 1])
    if (isNaN(valor) || valor <= 0) return []
    const descricao = cols[iDesc] ?? cols[1]
    const matchParcela = descricao.match(/\b(\d{1,2})\/(\d{1,2})\b/)
    let parcela: string | undefined
    let valorTotalCompra: number | undefined
    if (matchParcela) {
      parcela = `${matchParcela[1]}/${matchParcela[2]}`
      valorTotalCompra = Math.round(valor * parseInt(matchParcela[2]) * 100) / 100
    }
    return [{ data: dataParaISO(cols[iData] ?? cols[0]), descricao, valor, parcela, valorTotalCompra }]
  })
}

// ── Banco Inter ───────────────────────────────────────────────────────────────
// Formato: Data;Estabelecimento;Tipo;Valor

export function parseInter(csv: string): ItemFaturaCSV[] {
  const linhas = csv.split('\n').map(l => l.trim()).filter(Boolean)
  const header = splitCSVLine(linhas[0], ';').map(h => h.toLowerCase())
  const iData = header.findIndex(h => h.includes('data'))
  const iDesc = header.findIndex(h => h.includes('estabelecimento') || h.includes('descrição') || h.includes('lançamento'))
  const iValor = header.findIndex(h => h.includes('valor'))

  return linhas.slice(1).flatMap(linha => {
    const cols = splitCSVLine(linha, ';')
    if (cols.length < 3) return []
    const valor = Math.abs(parseBRL(cols[iValor] ?? cols[cols.length - 1]))
    if (isNaN(valor) || valor === 0) return []
    const descricao = cols[iDesc] ?? cols[1]
    const matchParcela = descricao.match(/\b(\d{1,2})\/(\d{1,2})\b/)
    let parcela: string | undefined
    let valorTotalCompra: number | undefined
    if (matchParcela) {
      parcela = `${matchParcela[1]}/${matchParcela[2]}`
      valorTotalCompra = Math.round(valor * parseInt(matchParcela[2]) * 100) / 100
    }
    return [{ data: dataParaISO(cols[iData] ?? cols[0]), descricao, valor, parcela, valorTotalCompra }]
  })
}

// ── Genérico ──────────────────────────────────────────────────────────────────

export function parseGenerico(csv: string): ItemFaturaCSV[] {
  const sep = detectarSeparador(csv)
  const linhas = csv.split('\n').map(l => l.trim()).filter(Boolean)
  if (linhas.length < 2) return []
  const header = splitCSVLine(linhas[0], sep).map(h => h.toLowerCase())
  const iData = header.findIndex(h => /data|date/.test(h))
  const iDesc = header.findIndex(h => /desc|título|title|lancamento|lançamento|estabelecimento|histórico/.test(h))
  const iValor = header.findIndex(h => /^valor$|amount|value/.test(h))
  if (iData < 0 || iValor < 0) return []

  return linhas.slice(1).flatMap(linha => {
    const cols = splitCSVLine(linha, sep)
    if (cols.length < 2) return []
    const valor = Math.abs(parseBRL(cols[iValor] ?? ''))
    if (isNaN(valor) || valor === 0) return []
    const descricao = iDesc >= 0 ? cols[iDesc] : cols.filter((_, i) => i !== iData && i !== iValor)[0] ?? ''
    const matchParcela = descricao.match(/\b(\d{1,2})\/(\d{1,2})\b/)
    let parcela: string | undefined
    let valorTotalCompra: number | undefined
    if (matchParcela) {
      parcela = `${matchParcela[1]}/${matchParcela[2]}`
      valorTotalCompra = Math.round(valor * parseInt(matchParcela[2]) * 100) / 100
    }
    return [{ data: dataParaISO(cols[iData]), descricao, valor, parcela, valorTotalCompra }]
  })
}

// ── Seletor de parser ─────────────────────────────────────────────────────────
// Detecta pelo header do CSV primeiro, depois pelo nome do cartão

export function getParser(cartaoNome: string): (csv: string) => ItemFaturaCSV[] {
  return (csv: string) => {
    const primLinha = csv.split('\n')[0].toLowerCase()

    // Detecção pelo header (independente do nome do cartão)
    if (primLinha.includes('portador') || primLinha.includes('estabelecimento')) {
      return parsePortador(csv)
    }
    if (primLinha.includes('title') || primLinha.includes('título')) {
      return parseNubank(csv)
    }

    // Fall back pelo nome do cartão
    const nome = cartaoNome.toLowerCase()
    if (nome.includes('nubank') || nome.includes('nu ')) return parseNubank(csv)
    if (nome.includes('inter')) return parseInter(csv)

    return parseGenerico(csv)
  }
}
