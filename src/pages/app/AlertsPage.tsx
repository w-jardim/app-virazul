import React, { useMemo, useState } from 'react'
import { useAlerts, useDismissAlert, useMarkAlertRead } from '@/features/alerts/hooks/useAlertsData'
import {
  AlertCard,
  AlertFilterTabs,
  AlertTypeFilterSelect,
} from '@/features/alerts/components/AlertsComponents'
import { PageLoadingState, PageErrorState, PageEmptyState } from '@/components/shared/PageStates'
import type { AlertStatus, AlertType } from '@/features/alerts/types/alerts.types'

type StatusTab = AlertStatus | 'ALL'
type TypeFilter = AlertType | 'ALL'

const AlertsPage: React.FC = () => {
  const [statusTab, setStatusTab] = useState<StatusTab>('ACTIVE')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const query = useAlerts()
  const markRead = useMarkAlertRead()
  const dismiss = useDismissAlert()

  const alerts = query.data ?? []

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const statusMatch = statusTab === 'ALL' || a.status === statusTab
      const typeMatch = typeFilter === 'ALL' || a.alert_type === typeFilter
      return statusMatch && typeMatch
    })
  }, [alerts, statusTab, typeFilter])

  const counts = useMemo(() => {
    const all = alerts.length
    const active = alerts.filter((a) => a.status === 'ACTIVE').length
    const read = alerts.filter((a) => a.status === 'READ').length
    const dismissed = alerts.filter((a) => a.status === 'DISMISSED').length
    return { ALL: all, ACTIVE: active, READ: read, DISMISSED: dismissed }
  }, [alerts])

  async function handleMarkRead(id: number) {
    setLoadingId(id)
    try {
      await markRead.mutateAsync(id)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDismiss(id: number) {
    setLoadingId(id)
    try {
      await dismiss.mutateAsync(id)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Alertas</h1>
        <p className="text-sm text-slate-600">
          Alertas operacionais e financeiros gerados automaticamente a partir dos seus serviços.
        </p>
      </header>

      <AlertFilterTabs active={statusTab} onChange={setStatusTab} counts={counts} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {filtered.length === 0
            ? 'Nenhum alerta encontrado.'
            : `${filtered.length} alerta${filtered.length !== 1 ? 's' : ''}`}
        </p>
        <AlertTypeFilterSelect value={typeFilter} onChange={setTypeFilter} />
      </div>

      {query.isLoading ? (
        <PageLoadingState />
      ) : query.isError ? (
        <PageErrorState
          title="Falha ao carregar alertas"
          description="Tente novamente em instantes."
        />
      ) : filtered.length === 0 ? (
        <PageEmptyState
          title={
            statusTab === 'ACTIVE'
              ? 'Nenhum alerta ativo'
              : statusTab === 'READ'
              ? 'Nenhum alerta lido'
              : statusTab === 'DISMISSED'
              ? 'Nenhum alerta descartado'
              : 'Nenhum alerta encontrado'
          }
          description={
            statusTab === 'ACTIVE'
              ? 'Seus serviços estão em dia. Novos alertas aparecerão automaticamente.'
              : 'Altere os filtros para ver outros alertas.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
              loadingId={loadingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertsPage
