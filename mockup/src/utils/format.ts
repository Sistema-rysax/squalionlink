export function fmtNum(val: number | string | null | undefined, decimals = 2): string {
  if (val == null || val === '') return '—'
  const n = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(n)) return '—'
  // Use pt-BR format: 1.234,56
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: decimals })
}

export function fmtCurrency(val: number | null | undefined): string {
  if (val == null) return '—'
  return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtPercent(val: number | null | undefined): string {
  if (val == null) return '—'
  return val.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'
}

export function fmtDate(dt: string | null | undefined): string {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('pt-BR')
}

export function fmtDateTime(dt: string | null | undefined): string {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
}
