import React, { useState } from 'react'
import AgendaPage from './AgendaPage'
import ServicesPage from './ServicesPage'

type OperationTab = 'agenda' | 'services'

const OperationPage: React.FC = () => {
  const [tab, setTab] = useState<OperationTab>('agenda')

  return (
    <div className="space-y-4" data-testid="operation-page">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Operação</h1>
        <p className="text-sm text-slate-600">Gerencie agenda e serviços em um único fluxo.</p>
      </header>

      <nav className="flex gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('agenda')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
            tab === 'agenda'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Agenda
        </button>
        <button
          type="button"
          onClick={() => setTab('services')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
            tab === 'services'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Serviços
        </button>
      </nav>

      {tab === 'agenda' ? <AgendaPage /> : <ServicesPage />}
    </div>
  )
}

export default OperationPage
