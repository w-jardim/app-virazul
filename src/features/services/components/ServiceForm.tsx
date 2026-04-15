import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { DURATION_OPTIONS, FINANCIAL_STATUSES } from '../api/services.api'
import { useServiceFinancialPreview } from '../hooks/useServiceFinancialPreview'
import { RANK_GROUPS } from '@/features/pricing/types/pricing.types'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { CreateServiceInput, ServiceItem, ServiceScope, ServiceType, UpdateServiceInput } from '../types/services.types'

/* ───────────────────── helpers de escopo ───────────────────── */

const SCOPE_BY_KEY: Record<string, ServiceScope> = {
  ordinary_shift: 'ORDINARY',
  ras_voluntary: 'RAS_VOLUNTARY',
  ras_compulsory: 'RAS_COMPULSORY',
  proeis: 'PROEIS',
  seguranca_presente: 'SEGURANCA_PRESENTE',
  other: 'OTHER',
}

function resolveScope(serviceTypes: ServiceType[], id: number): ServiceScope | null {
  const found = serviceTypes.find((st) => st.id === id)
  if (!found) return null
  return SCOPE_BY_KEY[found.key] ?? 'OTHER'
}

function isExtraService(scope: ServiceScope | null): boolean {
  return scope !== null && scope !== 'ORDINARY'
}

function scopeHasMeal(scope: ServiceScope | null): boolean {
  return scope === 'PROEIS' || scope === 'SEGURANCA_PRESENTE'
}

function scopeAllowsReservation(scope: ServiceScope | null): boolean {
  return scope !== 'RAS_COMPULSORY' && scope !== 'ORDINARY'
}

function scopeAllowsAdditional(scope: ServiceScope | null): boolean {
  return scope === 'RAS_COMPULSORY'
}

function safeMoney(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

/* ───────────────────── labels legíveis ───────────────────── */

const SCOPE_LABELS: Record<ServiceScope, string> = {
  ORDINARY: 'Escala Ordinária',
  RAS_VOLUNTARY: 'RAS Voluntário',
  RAS_COMPULSORY: 'RAS Compulsório',
  PROEIS: 'PROEIS',
  SEGURANCA_PRESENTE: 'Segurança Presente',
  OTHER: 'Outros',
}

const RANK_GROUP_LABELS: Record<string, string> = {
  OFICIAIS_SUPERIORES: 'Oficiais Superiores',
  CAPITAO_TENENTE: 'Capitão e Tenente',
  SUBTENENTE_SARGENTO: 'Subtenente e Sargento',
  CABO_SOLDADO: 'Cabo e Soldado',
}

const STATUS_LABELS: Record<string, string> = {
  TITULAR: 'Titular',
  RESERVA: 'Reserva',
}

/* ───────────────────── schema zod ───────────────────── */

const schema = z.object({
  service_type_id: z.coerce.number().int().positive({ message: 'Selecione um tipo de serviço.' }),
  rank_group: z.string().min(1, 'Selecione a graduação.'),
  start_at: z.string().min(1, 'Informe data e hora.'),
  duration_hours: z.coerce.number().refine(
    (value) => DURATION_OPTIONS.includes(value as (typeof DURATION_OPTIONS)[number]),
    { message: 'Duração inválida.' }
  ),
  operational_status: z.string().min(1, 'Selecione o status.'),
  financial_status: z.enum(FINANCIAL_STATUSES),
  notes: z.string().optional(),
  amount_base: z.coerce.number().min(0).default(0),
  amount_meal: z.coerce.number().min(0).default(0),
  amount_transport: z.coerce.number().min(0).default(0),
  amount_additional: z.coerce.number().min(0).default(0),
  edit_values: z.boolean().optional(),
  payment_due_date: z.string().optional(),
  force: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

type ServiceFormProps = {
  serviceTypes: ServiceType[]
  initialData?: ServiceItem
  submitLabel: string
  busy?: boolean
  onSubmit: (payload: CreateServiceInput | UpdateServiceInput) => void | Promise<void>
}

function toLocalInputDateTime(iso: string | undefined) {
  if (!iso) return ''
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/* ───────────────────── componente ───────────────────── */

const ServiceForm = ({ serviceTypes, initialData, submitLabel, busy, onSubmit }: ServiceFormProps) => {
  const isEditing = Boolean(initialData)
  const authUser = useAuthStore((s) => s.user)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      service_type_id: initialData?.service_type_id || undefined,
      rank_group: initialData?.rank_group || authUser?.rank_group || '',
      start_at: toLocalInputDateTime(initialData?.start_at),
      duration_hours: initialData?.duration_hours || 12,
      operational_status: initialData?.operational_status || 'TITULAR',
      financial_status: (initialData?.financial_status || 'PREVISTO') as FormValues['financial_status'],
      notes: initialData?.notes || '',
      amount_base: initialData?.amount_base || 0,
      amount_meal: initialData?.amount_meal || 0,
      amount_transport: initialData?.amount_transport || 0,
      amount_additional: initialData?.amount_additional || 0,
        edit_values: false,
      payment_due_date: initialData?.payment_due_date ? String(initialData.payment_due_date).slice(0, 10) : '',
      force: false,
    },
  })

  /* ── watch para reatividade ── */
  const watchedTypeId = useWatch({ control: form.control, name: 'service_type_id' })
  const watchedDuration = useWatch({ control: form.control, name: 'duration_hours' })
  const watchedRankGroup = useWatch({ control: form.control, name: 'rank_group' })
  const watchedBase = useWatch({ control: form.control, name: 'amount_base' })
  const watchedTransport = useWatch({ control: form.control, name: 'amount_transport' })
  const watchedMeal = useWatch({ control: form.control, name: 'amount_meal' })
  const watchedAdditional = useWatch({ control: form.control, name: 'amount_additional' })
  const watchedEditValues = useWatch({ control: form.control, name: 'edit_values' })

  const scope = resolveScope(serviceTypes, Number(watchedTypeId) || 0)
  const isExtra = isExtraService(scope)
  const hasMeal = scopeHasMeal(scope)
  const allowsReservation = scopeAllowsReservation(scope)
  const allowsAdditional = scopeAllowsAdditional(scope)

  /* ── busca preview da tabela de valores ── */
  const { preview, isFetching: pricingLoading } = useServiceFinancialPreview(
    form,
    serviceTypes,
    Number(watchedTypeId) || 0,
    Number(watchedDuration) || 0,
    watchedRankGroup || '',
  )

  useEffect(() => {
    if (!watchedEditValues && preview) {
      form.setValue('amount_base', preview.base_amount, { shouldDirty: false })
      form.setValue('amount_transport', preview.transport_amount, { shouldDirty: false })
      form.setValue('amount_meal', preview.meal_amount, { shouldDirty: false })
    }
  }, [watchedEditValues, preview, form])

  /* ── corrigir status se escopo mudar e RESERVA não for mais permitido ── */
  const currentStatus = useWatch({ control: form.control, name: 'operational_status' })

  useEffect(() => {
    if (!allowsReservation && currentStatus === 'RESERVA') {
      form.setValue('operational_status', 'TITULAR', { shouldDirty: false })
    }
  }, [allowsReservation, currentStatus, form])

  /* ── zerar financeiro quando for Escala Ordinária ── */
  useEffect(() => {
    if (!isExtra) {
      form.setValue('amount_base', 0, { shouldDirty: false })
      form.setValue('amount_transport', 0, { shouldDirty: false })
      form.setValue('amount_meal', 0, { shouldDirty: false })
      form.setValue('amount_additional', 0, { shouldDirty: false })
    }
  }, [isExtra, form])

  /* ── zerar alimentação quando escopo não tem refeição ── */
  useEffect(() => {
    if (isExtra && !hasMeal) {
      form.setValue('amount_meal', 0, { shouldDirty: false })
    }
  }, [isExtra, hasMeal, form])

  /* ── zerar adicional quando escopo não permite ── */
  useEffect(() => {
    if (!allowsAdditional) {
      form.setValue('amount_additional', 0, { shouldDirty: false })
    }
  }, [allowsAdditional, form])

  /* ── resumo financeiro calculado ── */
  const financialSummary = useMemo(() => {
    const base = safeMoney(watchedBase)
    const transport = safeMoney(watchedTransport)
    const meal = hasMeal ? safeMoney(watchedMeal) : 0
    const additional = allowsAdditional ? safeMoney(watchedAdditional) : 0
    const total = Math.max(0, safeMoney(base + transport + meal + additional))
    return { base, transport, meal, additional, total }
  }, [watchedBase, watchedTransport, watchedMeal, watchedAdditional, hasMeal, allowsAdditional])

  /* ── categorizar tipos de serviço ── */
  const sortedTypes = useMemo(() => {
    const ordinary: ServiceType[] = []
    const extras: ServiceType[] = []
    for (const st of serviceTypes) {
      if (SCOPE_BY_KEY[st.key] === 'ORDINARY') {
        ordinary.push(st)
      } else {
        extras.push(st)
      }
    }
    return { extras }
  }, [serviceTypes])

  /* ── submissão ── */
  const handleSubmit = form.handleSubmit((values) => {
    const payload: CreateServiceInput | UpdateServiceInput = {
      service_type_id: values.service_type_id,
      start_at: values.start_at,
      duration_hours: values.duration_hours,
      notes: values.notes || null,
      force: Boolean(values.force),
    }

    if (!isEditing) {
      payload.operational_status = values.operational_status
      payload.financial_status = values.financial_status
    }

    if (isExtra) {
      payload.amount_base = safeMoney(values.amount_base)
      payload.amount_meal = hasMeal ? safeMoney(values.amount_meal) : 0
      payload.amount_transport = safeMoney(values.amount_transport)
      payload.amount_additional = allowsAdditional ? safeMoney(values.amount_additional) : 0
      payload.payment_due_date = values.payment_due_date || null
    }

    onSubmit(payload)
  })

  const errors = form.formState.errors
  const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400'
  const labelClass = 'text-xs font-medium text-slate-600'

  return (
    <form className="space-y-6" data-testid="service-form" onSubmit={handleSubmit}>
      {/* ═══════ BLOCO A — Tipo do registro ═══════ */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-800">Tipo do registro</legend>
        <label className={labelClass}>
          Selecione a categoria
          <select {...form.register('service_type_id')} className={fieldClass} data-testid="select-service-type">
            <option value="">Selecione</option>
            {sortedTypes.extras.length > 0 ? (
              <optgroup label="Serviço extra remunerado">
                {sortedTypes.extras.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </optgroup>
            ) : null}
          </select>
          {errors.service_type_id ? <span className="mt-1 block text-xs text-rose-700">{errors.service_type_id.message}</span> : null}
        </label>

        {/* badge visual do escopo */}
        {scope ? (
          <div className="flex items-center gap-2" data-testid="scope-badge">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              scope === 'ORDINARY'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-sky-50 text-sky-700'
            }`}>
              {SCOPE_LABELS[scope]}
            </span>
            {scope === 'ORDINARY' ? (
              <span className="text-xs text-slate-500">Calendário base — não gera valores financeiros extras</span>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      {/* ═══════ BLOCO B — Status inicial (somente criação) ═══════ */}
      {!isEditing ? (
        <fieldset className="space-y-2" data-testid="block-status">
          <legend className="text-sm font-semibold text-slate-800">Status inicial</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Status operacional
              <select
                {...form.register('operational_status')}
                className={fieldClass}
                data-testid="select-operational-status"
              >
                <option value="TITULAR">{STATUS_LABELS.TITULAR}</option>
                {allowsReservation ? (
                  <option value="RESERVA">{STATUS_LABELS.RESERVA}</option>
                ) : null}
              </select>
              {!allowsReservation && isExtra ? (
                <span className="mt-1 block text-xs text-amber-600" data-testid="no-reservation-hint">
                  RAS Compulsório não permite reserva
                </span>
              ) : null}
            </label>

            {isExtra ? (
              <label className={labelClass}>
                Status financeiro
                <select {...form.register('financial_status')} className={fieldClass}>
                  {FINANCIAL_STATUSES.map((fs) => (
                    <option key={fs} value={fs}>{fs}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </fieldset>
      ) : null}

      {/* ═══════ BLOCO C — Dados operacionais ═══════ */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-800">Dados operacionais</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className={labelClass}>
            Data/hora
            <input type="datetime-local" {...form.register('start_at')} className={fieldClass} />
            {errors.start_at ? <span className="mt-1 block text-xs text-rose-700">{errors.start_at.message}</span> : null}
          </label>

          <label className={labelClass}>
            Duração
            <select {...form.register('duration_hours')} className={fieldClass} data-testid="select-duration">
              {DURATION_OPTIONS.map((value) => (
                <option key={value} value={value}>{value}h</option>
              ))}
            </select>
          </label>

          {isExtra ? (
            <label className={labelClass}>
              Vencimento
              <input type="date" {...form.register('payment_due_date')} className={fieldClass} />
            </label>
          ) : null}
        </div>

        <label className={`block ${labelClass}`}>
          Observações
          <textarea rows={2} {...form.register('notes')} className={fieldClass} />
        </label>
      </fieldset>

      {/* ═══════ BLOCO D — Dados financeiros (só extras) ═══════ */}
      {isExtra ? (
        <fieldset className="space-y-2" data-testid="block-financial">
          <legend className="text-sm font-semibold text-slate-800">Valores financeiros</legend>

          <label className={labelClass}>
            Graduação
            <select {...form.register('rank_group')} className={fieldClass} data-testid="select-rank-group">
              <option value="">Selecione a graduação</option>
              {RANK_GROUPS.map((rg) => (
                <option key={rg} value={rg}>{RANK_GROUP_LABELS[rg]}</option>
              ))}
            </select>
            {errors.rank_group ? <span className="mt-1 block text-xs text-rose-700">{errors.rank_group.message}</span> : null}
          </label>

          <label className={`inline-flex items-center gap-2 ${labelClass}`}>
            <input type="checkbox" {...form.register('edit_values')} data-testid="toggle-edit-values" />
            Quero editar os valores manualmente
          </label>

          {pricingLoading ? (
            <p className="text-xs text-sky-600" data-testid="pricing-loading">Consultando tabela de valores...</p>
          ) : null}

          {preview ? (
            <p className="text-xs text-slate-500" data-testid="pricing-source">
              Valores preenchidos automaticamente pela tabela de preços vigente
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <label className={labelClass}>
              Valor base (R$)
              {preview && !watchedEditValues ? (
                <>
                  <input type="text" value={Number(form.watch('amount_base') || 0).toFixed(2)} readOnly className={`${fieldClass} bg-slate-50`} />
                  <input type="hidden" {...form.register('amount_base')} />
                </>
              ) : (
                <input type="number" step="0.01" {...form.register('amount_base')} className={`${fieldClass} bg-slate-50`} />
              )}
            </label>
            <label className={labelClass}>
              Transporte (R$)
              {preview && !watchedEditValues ? (
                <>
                  <input type="text" value={Number(form.watch('amount_transport') || 0).toFixed(2)} readOnly className={`${fieldClass} bg-slate-50`} />
                  <input type="hidden" {...form.register('amount_transport')} />
                </>
              ) : (
                <input type="number" step="0.01" {...form.register('amount_transport')} className={`${fieldClass} bg-slate-50`} />
              )}
            </label>
            {hasMeal ? (
              <label className={labelClass}>
                Alimentação (R$)
                {preview && !watchedEditValues ? (
                  <>
                    <input type="text" value={Number(form.watch('amount_meal') || 0).toFixed(2)} readOnly className={`${fieldClass} bg-slate-50`} />
                    <input type="hidden" {...form.register('amount_meal')} />
                  </>
                ) : (
                  <input type="number" step="0.01" {...form.register('amount_meal')} className={`${fieldClass} bg-slate-50`} />
                )}
              </label>
            ) : (
              <div className="flex items-end" data-testid="meal-not-applicable">
                <span className="mb-2 text-xs text-slate-400">Alimentação não se aplica ao {scope ? SCOPE_LABELS[scope] : 'RAS'}</span>
              </div>
            )}
            {allowsAdditional ? (
              <label className={labelClass}>
                Adicional (R$)
                <input type="number" step="0.01" {...form.register('amount_additional')} className={fieldClass} />
              </label>
            ) : null}
            
          </div>
        </fieldset>
      ) : null}

      {/* ═══════ BLOCO E — Resumo financeiro (só extras) ═══════ */}
      {isExtra ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" data-testid="financial-summary">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">Resumo financeiro</h4>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">Base</dt>
              <dd className="font-medium tabular-nums" data-testid="summary-base">{formatBRL(financialSummary.base)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Transporte</dt>
              <dd className="font-medium tabular-nums" data-testid="summary-transport">{formatBRL(financialSummary.transport)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Alimentação</dt>
              <dd className={`font-medium tabular-nums ${!hasMeal ? 'text-slate-400' : ''}`} data-testid="summary-meal">
                {hasMeal ? formatBRL(financialSummary.meal) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-700">Total</dt>
              <dd className="text-base font-bold tabular-nums text-sky-700" data-testid="summary-total">{formatBRL(financialSummary.total)}</dd>
            </div>
          </dl>
          {financialSummary.additional > 0 ? (
            <div className="mt-2 text-xs text-slate-500">
              <span>+ Adicional: {formatBRL(financialSummary.additional)}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── force + submit ── */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <label className="inline-flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" {...form.register('force')} />
          Permitir mesmo com conflito de horário
        </label>

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50"
        >
          {busy ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ServiceForm
