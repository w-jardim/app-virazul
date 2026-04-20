import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ServiceState from '@/features/services/components/ServiceStates'
import ServicesFilters from '@/features/services/components/ServicesFilters'
import ServicesTable from '@/features/services/components/ServicesTable'
import {
  useConfirmPendingPaymentsService,
  getApiErrorMessage,
  useConfirmPaymentService,
  usePromoteReservationService,
  useServiceTypes,
  useServicesList,
  useTransitionAnyService,
} from '@/features/services/hooks/useServicesData'

type FiltersState = {
  serviceTypeId?: number
  periodStart?: string
  periodEnd?: string
  operationalStatus?: string
  financialStatus?: string
}

const ServicesPage: React.FC = () => {
  const [filters, setFilters] = useState<FiltersState>({})
  const serviceTypesQuery = useServiceTypes()
  const servicesQuery = useServicesList(filters)
  const confirmPaymentMutation = useConfirmPaymentService()
  const confirmPendingPaymentsMutation = useConfirmPendingPaymentsService()
  const promoteReservationMutation = usePromoteReservationService()
  const transitionMutation = useTransitionAnyService()
  const [actionError, setActionError] = useState<string | null>(null)

  const serviceTypes = useMemo(() => serviceTypesQuery.data || [], [serviceTypesQuery.data])
  const services = useMemo(() => servicesQuery.data || [], [servicesQuery.data])

  const handleConfirmPayment = async (serviceId: number) => {
    setActionError(null)
    try {
      await confirmPaymentMutation.mutateAsync(serviceId)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const handlePromoteReservation = async (serviceId: number) => {
    setActionError(null)
    try {
      await promoteReservationMutation.mutateAsync(serviceId)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const handleMarkPresence = async (serviceId: number) => {
    setActionError(null)
    try {
      await transitionMutation.mutateAsync({
        id: serviceId,
        payload: {
          transition_type: 'MARCAR_PRESENCA',
          target_operational_status: 'REALIZADO'
        }
      })
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const handleMarkAbsence = async (serviceId: number) => {
    setActionError(null)
    try {
      await transitionMutation.mutateAsync({
        id: serviceId,
        payload: {
          transition_type: 'MARCAR_FALTA',
          target_operational_status: 'FALTOU'
        }
      })
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const pendingCount = useMemo(
    () =>
      services.filter(
        (item) =>
          item.financial_status === 'PENDENTE' &&
          ['TITULAR', 'CONVERTIDO_TITULAR', 'REALIZADO'].includes(item.operational_status)
      ).length,
    [services]
  )

  const handleConfirmAllPending = async () => {
    if (pendingCount === 0) {
      return
    }

    setActionError(null)
    try {
      await confirmPendingPaymentsMutation.mutateAsync({
        service_type_id: filters.serviceTypeId
      })
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-4" data-testid="services-page">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Serviços operacionais</h1>
          <p className="text-sm text-slate-600">Consulte, filtre e gerencie serviços com transições de status.</p>
        </div>
        <Link
          to="/services/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Novo serviço
        </Link>
        <button
          type="button"
          onClick={handleConfirmAllPending}
          disabled={pendingCount === 0 || confirmPendingPaymentsMutation.isPending}
          className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {confirmPendingPaymentsMutation.isPending
            ? 'Processando...'
            : `Pagar todos pendentes (${pendingCount})`}
        </button>
      </header>

      <ServicesFilters
        value={filters}
        serviceTypes={serviceTypes}
        onChange={setFilters}
        onClear={() => setFilters({})}
      />

      {actionError ? (
        <ServiceState tone="error" title="Ação não concluída" description={actionError} />
      ) : null}

      {serviceTypesQuery.isError ? (
        <ServiceState
          tone="error"
          title="Falha ao carregar tipos de serviço"
          description="Sem os tipos, não é possível montar filtros e formulários corretamente."
        />
      ) : null}

      {servicesQuery.isLoading ? (
        <ServiceState title="Carregando serviços..." description="Buscando serviços do usuário no backend." />
      ) : servicesQuery.isError ? (
        <ServiceState
          tone="error"
          title="Falha ao carregar serviços"
          description="Verifique sua conexão e tente novamente."
        />
      ) : services.length === 0 ? (
        <ServiceState
          title="Nenhum serviço encontrado"
          description="Ajuste os filtros ou crie um novo serviço para começar."
        />
      ) : (
        <ServicesTable
          items={services}
          onConfirmPayment={handleConfirmPayment}
          onPromoteReservation={handlePromoteReservation}
          onMarkPresence={handleMarkPresence}
          onMarkAbsence={handleMarkAbsence}
          busy={
            confirmPaymentMutation.isPending ||
            confirmPendingPaymentsMutation.isPending ||
            promoteReservationMutation.isPending ||
            transitionMutation.isPending
          }
        />
      )}
    </div>
  )
}

export default ServicesPage
