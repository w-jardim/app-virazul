import { useEffect, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { usePricingPreview } from '@/features/pricing/hooks/usePricingData'
import type { ServiceScope } from '@/features/pricing/types/pricing.types'
import type { ServiceType } from '../types/services.types'

const SCOPE_MAP: Record<string, ServiceScope | null> = {
  ras_voluntary: 'RAS_VOLUNTARY',
  ras_compulsory: 'RAS_COMPULSORY',
  proeis: 'PROEIS',
  seguranca_presente: 'SEGURANCA_PRESENTE',
  ordinary_shift: null,
  other: null,
}

function resolveScope(serviceTypes: ServiceType[], serviceTypeId: number): ServiceScope | null {
  const found = serviceTypes.find((st) => st.id === serviceTypeId)
  if (!found) return null
  return SCOPE_MAP[found.key] ?? null
}

type FormWithAmounts = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormReturn<any>['setValue']
}

export function useServiceFinancialPreview(
  form: FormWithAmounts,
  serviceTypes: ServiceType[],
  serviceTypeId: number,
  durationHours: number,
  rankGroup: string,
) {
  const scope = resolveScope(serviceTypes, serviceTypeId)

  const params =
    scope && durationHours && rankGroup
      ? { service_scope: scope, rank_group: rankGroup, duration_hours: durationHours }
      : null

  const { data: preview, isFetching } = usePricingPreview(params)

  const prevKeyRef = useRef('')

  useEffect(() => {
    if (!preview) return
    const key = `${scope}:${rankGroup}:${durationHours}`
    if (key === prevKeyRef.current) return
    prevKeyRef.current = key

    form.setValue('amount_base', preview.base_amount, { shouldDirty: false })
    form.setValue('amount_transport', preview.transport_amount, { shouldDirty: false })
    form.setValue('amount_meal', preview.meal_amount, { shouldDirty: false })
  }, [preview, scope, rankGroup, durationHours, form])

  return { preview, isFetching, scope }
}
