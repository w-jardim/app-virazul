import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ServiceForm from '@/features/services/components/ServiceForm'
import ServiceState from '@/features/services/components/ServiceStates'
import { useCreateService, useServiceTypes } from '@/features/services/hooks/useServicesData'
import { getApiErrorMessage } from '@/features/services/hooks/useServicesData'
import type { CreateServiceInput } from '@/features/services/types/services.types'

const ServiceCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const serviceTypesQuery = useServiceTypes()
  const createMutation = useCreateService()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (payload: CreateServiceInput) => {
    setErrorMessage(null)
    try {
      const created = await createMutation.mutateAsync(payload)
      navigate(`/services/${created.id}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-4" data-testid="service-create-page">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Novo registro</h1>
          <p className="text-sm text-slate-600">Cadastre uma escala ordinária ou um serviço extra remunerado.</p>
        </div>
        <Link to="/services" className="text-sm font-medium text-sky-700 hover:text-sky-800">
          Voltar para listagem
        </Link>
      </header>

      {errorMessage ? (
        <ServiceState
          tone="error"
          title="Não foi possível criar o serviço"
          description={errorMessage}
        />
      ) : null}

      {serviceTypesQuery.isLoading ? (
        <ServiceState title="Carregando tipos de serviço..." />
      ) : serviceTypesQuery.isError ? (
        <ServiceState
          tone="error"
          title="Falha ao carregar tipos de serviço"
          description="Sem os tipos de serviço, o cadastro não pode ser concluído."
        />
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ServiceForm
            serviceTypes={serviceTypesQuery.data || []}
            submitLabel="Criar serviço"
            busy={createMutation.isPending}
            onSubmit={handleSubmit}
          />
        </section>
      )}
    </div>
  )
}

export default ServiceCreatePage
