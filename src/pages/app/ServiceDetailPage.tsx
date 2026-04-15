import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ServiceDetailCard from '@/features/services/components/ServiceDetailCard'
import ServiceForm from '@/features/services/components/ServiceForm'
import ServiceState from '@/features/services/components/ServiceStates'
import {
  getApiErrorMessage,
  useDeleteService,
  useServiceDetail,
  useServiceTypes,
  useUpdateService
} from '@/features/services/hooks/useServicesData'
import type { UpdateServiceInput } from '@/features/services/types/services.types'

const ServiceDetailPage: React.FC = () => {
  const params = useParams()
  const navigate = useNavigate()
  const serviceId = Number(params.id)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const detailQuery = useServiceDetail(serviceId)
  const serviceTypesQuery = useServiceTypes()
  const updateMutation = useUpdateService(serviceId)
  const deleteMutation = useDeleteService(serviceId)

  const service = useMemo(() => detailQuery.data, [detailQuery.data])

  const handleUpdate = async (payload: UpdateServiceInput) => {
    setErrorMessage(null)
    try {
      await updateMutation.mutateAsync(payload)
      setEditing(false)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    setErrorMessage(null)
    try {
      await deleteMutation.mutateAsync()
      navigate('/services', { replace: true })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
      setConfirmingDelete(false)
    }
  }

  if (Number.isNaN(serviceId) || serviceId <= 0) {
    return <ServiceState tone="error" title="ID inválido" description="O identificador do serviço está inválido." />
  }

  return (
    <div className="space-y-4" data-testid="service-detail-page">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Detalhe do serviço</h1>
          <p className="text-sm text-slate-600">Consulte dados e atualize campos do serviço.</p>
        </div>
        <Link to="/operation" className="text-sm font-medium text-sky-700 hover:text-sky-800">
          Voltar para listagem
        </Link>
      </header>

      {errorMessage ? <ServiceState tone="error" title="Ação não concluída" description={errorMessage} /> : null}

      {detailQuery.isLoading ? (
        <ServiceState title="Carregando serviço..." />
      ) : detailQuery.isError || !service ? (
        <ServiceState
          tone="error"
          title="Serviço não encontrado"
          description="Não foi possível carregar os dados deste serviço."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <ServiceDetailCard service={service} />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Atualizar serviço</h3>
                <button
                  type="button"
                  onClick={() => setEditing((state) => !state)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {editing ? 'Cancelar edição' : 'Editar dados'}
                </button>
              </div>

              {editing ? (
                <ServiceForm
                  serviceTypes={serviceTypesQuery.data || []}
                  initialData={service}
                  submitLabel="Salvar alterações"
                  busy={updateMutation.isPending}
                  onSubmit={handleUpdate}
                />
              ) : (
                <p className="text-sm text-slate-600">
                  Clique em "Editar dados" para ajustar campos operacionais e financeiros.
                </p>
              )}
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <h3 className="text-base font-semibold text-rose-900">Remover serviço</h3>
              <p className="mt-1 text-sm text-rose-800">
                O serviço será removido da operação ativa. O histórico permanece preservado e o registro não será apagado do sistema.
              </p>

              {confirmingDelete ? (
                <div className="mt-4 rounded-xl border border-rose-300 bg-white p-4">
                  <p className="text-sm font-semibold text-rose-900">Confirmar remoção?</p>
                  <p className="mt-1 text-xs text-rose-700">
                    Esta ação não pode ser desfeita pela interface. O serviço deixará de aparecer na operação.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Removendo...' : 'Sim, remover'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Remover serviço
                </button>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceDetailPage
