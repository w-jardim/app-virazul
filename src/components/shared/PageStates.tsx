type PageStateProps = {
  tone?: 'default' | 'error'
  title: string
  description?: string
  action?: React.ReactNode
}

// ─── Loading ──────────────────────────────────────────────────────────────────

export function PageLoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  )
}

// ─── Error ────────────────────────────────────────────────────────────────────

export function PageErrorState({ title, description, action }: PageStateProps) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="font-semibold text-rose-900">{title}</p>
          {description && <p className="mt-1 text-sm text-rose-700">{description}</p>}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── Empty ────────────────────────────────────────────────────────────────────

export function PageEmptyState({ title, description, action }: PageStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
