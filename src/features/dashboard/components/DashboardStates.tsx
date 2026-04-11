type DashboardListStateProps = {
  title: string
  description?: string
}

export const LoadingState = ({ title, description }: DashboardListStateProps) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
    </div>
  )
}

export const EmptyState = ({ title, description }: DashboardListStateProps) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
    </div>
  )
}

export const ErrorState = ({ title, description }: DashboardListStateProps) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
      <p className="text-sm font-medium text-rose-800">{title}</p>
      {description ? <p className="mt-1 text-xs text-rose-700">{description}</p> : null}
    </div>
  )
}
