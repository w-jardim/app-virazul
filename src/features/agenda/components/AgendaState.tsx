type AgendaStateProps = {
  title: string
  description?: string
  tone?: 'default' | 'error'
}

const toneClasses = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  error: 'border-rose-200 bg-rose-50 text-rose-800'
}

const AgendaState = ({ title, description, tone = 'default' }: AgendaStateProps) => {
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="mt-1 text-xs opacity-90">{description}</p> : null}
    </div>
  )
}

export default AgendaState
