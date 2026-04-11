import type { ReactNode } from 'react'

type DashboardSectionProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

const DashboardSection = ({ title, subtitle, actions, children }: DashboardSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>
      {children}
    </section>
  )
}

export default DashboardSection
