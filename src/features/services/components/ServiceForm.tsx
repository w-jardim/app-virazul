import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DURATION_OPTIONS, FINANCIAL_STATUSES, OPERATIONAL_STATUSES } from '../api/services.api'
import type { CreateServiceInput, ServiceItem, ServiceType, UpdateServiceInput } from '../types/services.types'

const schema = z.object({
  service_type_id: z.coerce.number().int().positive({ message: 'Selecione um tipo de serviço.' }),
  start_at: z.string().min(1, 'Informe data e hora.'),
  duration_hours: z.coerce.number().refine((value) => DURATION_OPTIONS.includes(value as (typeof DURATION_OPTIONS)[number]), {
    message: 'Duração inválida.'
  }),
  operational_status: z.enum(OPERATIONAL_STATUSES),
  financial_status: z.enum(FINANCIAL_STATUSES),
  notes: z.string().optional(),
  amount_base: z.coerce.number().min(0, 'Valor base inválido.'),
  amount_paid: z.coerce.number().min(0, 'Valor pago inválido.'),
  amount_meal: z.coerce.number().min(0, 'Valor alimentação inválido.'),
  amount_transport: z.coerce.number().min(0, 'Valor transporte inválido.'),
  amount_additional: z.coerce.number().min(0, 'Valor adicional inválido.'),
  amount_discount: z.coerce.number().min(0, 'Valor desconto inválido.'),
  payment_due_date: z.string().optional(),
  force: z.boolean().optional()
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
  if (!iso) {
    return ''
  }
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

const ServiceForm = ({ serviceTypes, initialData, submitLabel, busy, onSubmit }: ServiceFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      service_type_id: initialData?.service_type_id || undefined,
      start_at: toLocalInputDateTime(initialData?.start_at),
      duration_hours: initialData?.duration_hours || 12,
      operational_status: (initialData?.operational_status || 'AGENDADO') as FormValues['operational_status'],
      financial_status: (initialData?.financial_status || 'PREVISTO') as FormValues['financial_status'],
      notes: initialData?.notes || '',
      amount_base: initialData?.amount_base || 0,
      amount_paid: initialData?.amount_paid || 0,
      amount_meal: initialData?.amount_meal || 0,
      amount_transport: initialData?.amount_transport || 0,
      amount_additional: initialData?.amount_additional || 0,
      amount_discount: initialData?.amount_discount || 0,
      payment_due_date: initialData?.payment_due_date ? String(initialData.payment_due_date).slice(0, 10) : '',
      force: false
    }
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      service_type_id: values.service_type_id,
      start_at: values.start_at,
      duration_hours: values.duration_hours,
      operational_status: values.operational_status,
      financial_status: values.financial_status,
      notes: values.notes || null,
      amount_base: values.amount_base,
      amount_paid: values.amount_paid,
      amount_meal: values.amount_meal,
      amount_transport: values.amount_transport,
      amount_additional: values.amount_additional,
      amount_discount: values.amount_discount,
      payment_due_date: values.payment_due_date || null,
      force: Boolean(values.force)
    })
  })

  const errors = form.formState.errors

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-600">
          Tipo de serviço
          <select {...form.register('service_type_id')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Selecione</option>
            {serviceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.service_type_id ? <span className="mt-1 block text-xs text-rose-700">{errors.service_type_id.message}</span> : null}
        </label>

        <label className="text-xs font-medium text-slate-600">
          Data/hora
          <input type="datetime-local" {...form.register('start_at')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          {errors.start_at ? <span className="mt-1 block text-xs text-rose-700">{errors.start_at.message}</span> : null}
        </label>

        <label className="text-xs font-medium text-slate-600">
          Duração
          <select {...form.register('duration_hours')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {DURATION_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}h
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-600">
          Status operacional
          <select
            {...form.register('operational_status')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {OPERATIONAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-600">
          Status financeiro
          <select {...form.register('financial_status')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {FINANCIAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-600">
          Vencimento
          <input type="date" {...form.register('payment_due_date')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-600">
          Valor base
          <input type="number" step="0.01" {...form.register('amount_base')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Valor pago
          <input type="number" step="0.01" {...form.register('amount_paid')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Alimentação
          <input type="number" step="0.01" {...form.register('amount_meal')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Transporte
          <input type="number" step="0.01" {...form.register('amount_transport')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Adicional
          <input type="number" step="0.01" {...form.register('amount_additional')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Desconto
          <input type="number" step="0.01" {...form.register('amount_discount')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>

      <label className="block text-xs font-medium text-slate-600">
        Observações
        <textarea
          rows={3}
          {...form.register('notes')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="inline-flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" {...form.register('force')} />
        Permitir criação/atualização mesmo com conflito (force)
      </label>

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
      >
        {busy ? 'Salvando...' : submitLabel}
      </button>
    </form>
  )
}

export default ServiceForm
