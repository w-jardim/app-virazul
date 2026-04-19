import React, { useState } from 'react'
import AgendaPage from './AgendaPage'
import ServicesPage from './ServicesPage'
import OperationCalendar from '@/features/agenda/components/OperationCalendar'

type OperationTab = 'calendar' | 'agenda' | 'services'

const OperationPage: React.FC = () => {
  const [tab, setTab] = useState<OperationTab>('calendar')

  const tabClass = (t: OperationTab) =>
    `px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
      tab === t
        ? 'border-blue-700 text-blue-800'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="space-y-4" data-testid="operation-page">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Operação</h1>
        <p className="text-sm text-slate-600">Calendário, agenda e serviços em um único lugar.</p>
      </header>

      <nav className="flex gap-1 border-b border-slate-200">
        <button type="button" onClick={() => setTab('calendar')} className={tabClass('calendar')}>Calendário</button>
        <button type="button" onClick={() => setTab('agenda')} className={tabClass('agenda')}>Agenda</button>
        <button type="button" onClick={() => setTab('services')} className={tabClass('services')}>Serviços</button>
      </nav>

      {tab === 'calendar' && <OperationCalendar />}
      {tab === 'agenda' && <AgendaPage />}
      {tab === 'services' && <ServicesPage />}
    </div>
  )
}

export default OperationPage
