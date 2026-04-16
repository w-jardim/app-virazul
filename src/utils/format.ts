export function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

export function pct(value: number) {
  return `${(value || 0).toFixed(2)}%`
}

export function escapeHtml(unsafe: unknown) {
  const s = unsafe == null ? '' : String(unsafe)
  return s.replace(/[&<>\"]+/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return ch
    }
  })
}
