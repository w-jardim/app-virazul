type MetricCardProps = {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'warning' | 'danger' | 'success'
}

const toneMap = {
  default: 'bg-slate-50 text-slate-900 border-slate-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  danger: 'bg-rose-50 text-rose-900 border-rose-200',
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200'
}

const MetricCard = ({ label, value, hint, tone = 'default' }: MetricCardProps) => {
  return (
    <article className={`rounded-xl border p-4 ${toneMap[tone]} min-w-0`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <div className="mt-2">
        <p className="text-2xl font-semibold leading-none truncate" title={String(value)}>
          {value}
        </p>
      </div>
      {hint ? <p className="mt-2 text-xs opacity-80">{hint}</p> : null}
    </article>
  )
}

export default MetricCard
