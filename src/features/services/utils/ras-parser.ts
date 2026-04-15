import type { ServiceType } from '../types/services.types'

export type ParsedRasEntry = {
  convenio: string
  evento: string
  start_at: string            // ISO datetime
  ponto_encontro: string
  endereco: string
  complemento: string
  tipo_vaga: string           // TITULAR | RESERVA
  faltou: string
  // mapped fields
  service_type_key: string    // ras_voluntary | ras_compulsory
  operational_status: string  // TITULAR | RESERVA
  duration_hours: number
  notes: string
}

const FIELD_MAP: Record<string, keyof Omit<ParsedRasEntry, 'service_type_key' | 'operational_status' | 'duration_hours' | 'notes' | 'start_at'>> = {
  'convênio': 'convenio',
  'convenio': 'convenio',
  'evento': 'evento',
  'ponto encontro': 'ponto_encontro',
  'endereco': 'endereco',
  'endereço': 'endereco',
  'complemento': 'complemento',
  'tipo de vaga': 'tipo_vaga',
  'faltou': 'faltou',
}

function parseBrDateTime(raw: string): string {
  // DD/MM/YYYY HH:mm:ss → ISO
  const match = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):?(\d{2})?$/)
  if (!match) return ''
  const [, dd, mm, yyyy, hh, min, ss = '00'] = match
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`
}

function inferServiceTypeKey(convenio: string, evento: string): string {
  const upper = `${convenio} ${evento}`.toUpperCase()
  if (upper.includes('COMP')) return 'ras_compulsory'
  return 'ras_voluntary'
}

function buildNotes(entry: Partial<ParsedRasEntry>): string {
  const parts: string[] = []
  if (entry.convenio) parts.push(`Convênio: ${entry.convenio}`)
  if (entry.evento) parts.push(`Evento: ${entry.evento}`)
  if (entry.ponto_encontro) parts.push(`Ponto: ${entry.ponto_encontro}`)
  const addr = [entry.endereco, entry.complemento].filter(Boolean).join(', ')
  if (addr) parts.push(`Endereço: ${addr}`)
  if (entry.faltou) parts.push(`Faltou: ${entry.faltou}`)
  return parts.join(' | ')
}

export function parseRasText(text: string): ParsedRasEntry[] {
  const blocks = text.split(/={3,}/).map((b) => b.trim()).filter(Boolean)
  const entries: ParsedRasEntry[] = []

  for (const block of blocks) {
    const raw: Record<string, string> = {}
    let dateRaw = ''

    for (const line of block.split('\n')) {
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) continue

      const key = line.slice(0, colonIdx).trim().toLowerCase()
      const value = line.slice(colonIdx + 1).trim()

      if (key === 'data/hora') {
        dateRaw = value
        continue
      }

      const mapped = FIELD_MAP[key]
      if (mapped) {
        raw[mapped] = value
      }
    }

    const startAt = parseBrDateTime(dateRaw)
    if (!startAt) continue // skip entries without valid date

    const tipoVaga = (raw.tipo_vaga || 'TITULAR').toUpperCase()
    const serviceTypeKey = inferServiceTypeKey(raw.convenio || '', raw.evento || '')

    const entry: ParsedRasEntry = {
      convenio: raw.convenio || '',
      evento: raw.evento || '',
      start_at: startAt,
      ponto_encontro: raw.ponto_encontro || '',
      endereco: raw.endereco || '',
      complemento: raw.complemento || '',
      tipo_vaga: tipoVaga,
      faltou: raw.faltou || '',
      service_type_key: serviceTypeKey,
      operational_status: tipoVaga === 'RESERVA' ? 'RESERVA' : 'TITULAR',
      duration_hours: 12, // default — user can edit
      notes: '',
    }
    entry.notes = buildNotes(entry)
    entries.push(entry)
  }

  return entries
}

export function resolveServiceTypeId(
  serviceTypes: ServiceType[],
  key: string
): number | null {
  const found = serviceTypes.find((st) => st.key === key)
  return found ? found.id : null
}
