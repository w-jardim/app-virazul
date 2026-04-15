type MetricCardProps = {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'warning' | 'danger' | 'success'
}

const toneLabel = {
  default: 'text-slate-500',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
  success: 'text-emerald-600'
}

const MetricCard = ({ label, value, hint, tone = 'default' }: MetricCardProps) => {
  return (
    <article className="min-w-0 text-center">
      <p className={`text-xs font-semibold uppercase tracking-wide ${toneLabel[tone]}`}>{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900" title={String(value)}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </article>
  )
}

export default MetricCard
