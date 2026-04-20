import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ServiceForm from '@/features/services/components/ServiceForm'
import ServiceState from '@/features/services/components/ServiceStates'
import { useCreateService, useServiceTypes } from '@/features/services/hooks/useServicesData'
import { getApiErrorMessage } from '@/features/services/hooks/useServicesData'
import { servicesApi, DURATION_OPTIONS } from '@/features/services/api/services.api'
import { parseRasText, resolveServiceTypeId } from '@/features/services/utils/ras-parser'
import type { ParsedRasEntry } from '@/features/services/utils/ras-parser'
import type { CreateServiceInput } from '@/features/services/types/services.types'

type Tab = 'manual' | 'import'

type ImportRow = ParsedRasEntry & {
  _selected: boolean
  _duration: number
  _saving: boolean
  _saved: boolean
  _error: string | null
}

const cellClass = 'px-3 py-2 text-sm text-slate-700'
const inputSmClass = 'w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-400'

const ServiceCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const serviceTypesQuery = useServiceTypes()
  const createMutation = useCreateService()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('manual')

  // ── import state ──
  const [rawText, setRawText] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const serviceTypes = serviceTypesQuery.data ?? []

  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const startAtQuery = params.get('start_at') ?? undefined
  const initialManualData: Partial<CreateServiceInput> | undefined = startAtQuery
    ? { start_at: (startAtQuery.length === 10 ? `${startAtQuery}T09:00:00.000Z` : startAtQuery) }
    : undefined

  const handleSubmit = async (payload: CreateServiceInput) => {
    setErrorMessage(null)
    try {
      const created = await createMutation.mutateAsync(payload)
      navigate(`/services/${created.id}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  // ── import helpers ──
  const handleParse = () => {
    setImportError(null)
    const parsed = parseRasText(rawText)
    if (parsed.length === 0) {
      setImportError('Nenhum registro encontrado. Cole o texto no formato do sistema de RAS.')
      return
    }
    setRows(parsed.map((p) => ({ ...p, _selected: true, _duration: p.duration_hours, _saving: false, _saved: false, _error: null })))
  }

  const selectedCount = useMemo(() => rows.filter((r) => r._selected && !r._saved).length, [rows])
  const savedCount = useMemo(() => rows.filter((r) => r._saved).length, [rows])

  const toggleRow = (idx: number) => setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, _selected: !r._selected } : r)))
  const toggleAll = () => {
    const allSelected = rows.every((r) => r._selected || r._saved)
    setRows((prev) => prev.map((r) => (r._saved ? r : { ...r, _selected: !allSelected })))
  }
  const updateDuration = (idx: number, val: number) => setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, _duration: val } : r)))

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const handleImport = async () => {
    setImporting(true)
    setImportError(null)
    const toImport = rows.map((r, i) => ({ row: r, idx: i })).filter(({ row }) => row._selected && !row._saved)

    for (const { row, idx } of toImport) {
      const typeId = resolveServiceTypeId(serviceTypes, row.service_type_key)
      if (!typeId) {
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, _error: `Tipo "${row.service_type_key}" não encontrado`, _saving: false } : r)))
        continue
      }
      const payload: CreateServiceInput = {
        service_type_id: typeId,
        start_at: row.start_at,
        duration_hours: row._duration,
        operational_status: row.operational_status,
        financial_status: 'PENDENTE',
        notes: row.notes,
        force: true,
      }
      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, _saving: true, _error: null } : r)))
      try {
        await servicesApi.create(payload)
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, _saving: false, _saved: true, _error: null } : r)))
      } catch (err) {
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, _saving: false, _error: getApiErrorMessage(err) } : r)))
      }
    }
    setImporting(false)
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
      tab === t ? 'border-blue-700 text-blue-800' : 'border-transparent text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="space-y-4" data-testid="service-create-page">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Novo registro</h1>
          <p className="text-sm text-slate-600">Cadastre manualmente ou importe do sistema de RAS.</p>
        </div>
        <Link to="/operation" className="text-sm font-medium text-blue-800 hover:text-blue-900">
          Voltar para listagem
        </Link>
      </header>

      <nav className="flex gap-1 border-b border-slate-200">
        <button type="button" onClick={() => setTab('manual')} className={tabClass('manual')}>Manual</button>
        <button type="button" onClick={() => setTab('import')} className={tabClass('import')}>Importar RAS</button>
      </nav>

      {/* ═══════ ABA MANUAL ═══════ */}
      {tab === 'manual' && (
        <>
          {errorMessage ? (
            <ServiceState tone="error" title="Não foi possível criar o serviço" description={errorMessage} />
          ) : null}

          {serviceTypesQuery.isLoading ? (
            <ServiceState title="Carregando tipos de serviço..." />
          ) : serviceTypesQuery.isError ? (
            <ServiceState tone="error" title="Falha ao carregar tipos de serviço" description="Sem os tipos, o cadastro não pode ser concluído." />
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <ServiceForm
                serviceTypes={serviceTypes}
                initialData={initialManualData as any}
                submitLabel="Criar serviço"
                busy={createMutation.isPending}
                onSubmit={handleSubmit}
              />
            </section>
          )}
        </>
      )}

      {/* ═══════ ABA IMPORTAR RAS ═══════ */}
      {tab === 'import' && (
        <>
          {importError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{importError}</div>
          )}

          {rows.length === 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 text-xs font-medium text-slate-600">Cole o resumo copiado do sistema de RAS</p>
              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"Convênio: BPVE - RAS\nEvento: RAS VOL BPVE OPM\nData/Hora: 04/04/2026 05:00:00\n..."}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleParse}
                  disabled={!rawText.trim()}
                  className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
                >
                  Processar texto
                </button>
              </div>
            </section>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {rows.length} registro(s) · {savedCount} importado(s)
                </p>
                <button
                  type="button"
                  onClick={() => setRows([])}
                  className="text-sm font-medium text-blue-800 hover:text-blue-900"
                >
                  Colar novo texto
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-3 py-2">
                        <input type="checkbox" checked={rows.every((r) => r._selected || r._saved)} onChange={toggleAll} />
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Data/Hora</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Tipo</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Convênio</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Evento</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Vaga</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Duração</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const typeLabel = row.service_type_key === 'ras_compulsory' ? 'RAS Compulsório' : 'RAS Voluntário'
                      return (
                        <tr
                          key={idx}
                          className={[
                            'border-b border-slate-100 transition',
                            row._saved ? 'bg-emerald-50 opacity-70' : '',
                            row._error ? 'bg-rose-50' : '',
                          ].join(' ')}
                        >
                          <td className="px-3 py-2">
                            <input type="checkbox" checked={row._selected} disabled={row._saved} onChange={() => toggleRow(idx)} />
                          </td>
                          <td className={cellClass}>{formatDate(row.start_at)}</td>
                          <td className={cellClass}>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              row.service_type_key === 'ras_compulsory' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-900'
                            }`}>{typeLabel}</span>
                          </td>
                          <td className={cellClass}>{row.convenio}</td>
                          <td className={`${cellClass} max-w-[180px] truncate`} title={row.evento}>{row.evento}</td>
                          <td className={cellClass}>{row.tipo_vaga}</td>
                          <td className="px-3 py-2">
                            {row._saved ? (
                              <span className="text-sm text-slate-500">{row._duration}h</span>
                            ) : (
                              <select value={row._duration} onChange={(e) => updateDuration(idx, Number(e.target.value))} className={inputSmClass}>
                                {DURATION_OPTIONS.map((v) => <option key={v} value={v}>{v}h</option>)}
                              </select>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {row._saved ? (
                              <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Importado</span>
                            ) : row._saving ? (
                              <span className="text-xs text-blue-700">Salvando...</span>
                            ) : row._error ? (
                              <span className="text-xs text-rose-600" title={row._error}>Erro</span>
                            ) : (
                              <span className="text-xs text-slate-400">Pendente</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{selectedCount} selecionado(s) · Duração padrão: 12h (editável)</p>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || selectedCount === 0}
                  className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
                >
                  {importing ? 'Importando...' : `Importar ${selectedCount} serviço(s)`}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ServiceCreatePage
