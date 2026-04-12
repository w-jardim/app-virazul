type PageStateProps = {
  tone?: 'default' | 'error'
  title: string
  description?: string
}

export function PageLoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  )
}

export function PageErrorState({ title, description }: PageStateProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <p className="font-semibold text-rose-900">{title}</p>
      {description && <p className="mt-1 text-sm text-rose-700">{description}</p>}
    </div>
  )
}

export function PageEmptyState({ title, description }: PageStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  )
}
