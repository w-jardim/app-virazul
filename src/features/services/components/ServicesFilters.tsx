import React, { useMemo, useState } from 'react'
import type { ServiceType } from '../types/services.types'

type ServicesFiltersValue = {
  serviceTypeId?: number
  periodStart?: string
  periodEnd?: string
  operationalStatus?: string
  financialStatus?: string
}

type ServicesFiltersProps = {
  value: ServicesFiltersValue
  serviceTypes: ServiceType[]
  onChange: (value: ServicesFiltersValue) => void
  onClear: () => void
}

const operationalStatuses = [
  'TITULAR',
  'RESERVA',
  'CONVERTIDO_TITULAR',
  'REALIZADO',
  'FALTOU',
  'CANCELADO',
  'NAO_CONVERTIDO'
]

const financialStatuses = ['PREVISTO', 'PAGO', 'PAGO_PARCIAL', 'NAO_PAGO']
const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800'

const ServicesFilters = ({ value, serviceTypes, onChange, onClear }: ServicesFiltersProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeCount = useMemo(
    () => [value.periodStart, value.periodEnd, value.serviceTypeId, value.operationalStatus, value.financialStatus].filter(Boolean).length,
    [value]
  )

  const filtersContent = (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-medium text-slate-600">
          Início
          <input
            type="date"
            value={value.periodStart || ''}
            onChange={(event) => onChange({ ...value, periodStart: event.target.value || undefined })}
            className={fieldClass}
          />
        </label>

        <label className="text-xs font-medium text-slate-600">
          Fim
          <input
            type="date"
            value={value.periodEnd || ''}
            onChange={(event) => onChange({ ...value, periodEnd: event.target.value || undefined })}
            className={fieldClass}
          />
        </label>

        <label className="text-xs font-medium text-slate-600">
          Tipo de serviço
          <select
            value={value.serviceTypeId || ''}
            onChange={(event) => onChange({ ...value, serviceTypeId: event.target.value ? Number(event.target.value) : undefined })}
            className={fieldClass}
          >
            <option value="">Todos</option>
            {serviceTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-600">
          Status operacional
          <select
            value={value.operationalStatus || ''}
            onChange={(event) => onChange({ ...value, operationalStatus: event.target.value || undefined })}
            className={fieldClass}
          >
            <option value="">Todos</option>
            {operationalStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-600">
          Status financeiro
          <select
            value={value.financialStatus || ''}
            onChange={(event) => onChange({ ...value, financialStatus: event.target.value || undefined })}
            className={fieldClass}
          >
            <option value="">Todos</option>
            {financialStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Limpar filtros
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:hidden"
        >
          Fechar
        </button>
      </div>
    </>
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <div>
          <p className="text-sm font-semibold text-slate-800">Filtros</p>
          <p className="text-xs text-slate-500">
            {activeCount > 0 ? `${activeCount} filtro(s) ativo(s)` : 'Refine a listagem'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((state) => !state)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {mobileOpen ? 'Ocultar' : 'Filtrar'}
        </button>
      </div>

      <div className="mt-4 hidden sm:block">{filtersContent}</div>
      {mobileOpen ? <div className="mt-4 sm:hidden">{filtersContent}</div> : null}
    </section>
  )
}

export default ServicesFilters
