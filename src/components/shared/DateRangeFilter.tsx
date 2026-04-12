type DateRangeFilterProps = {
  startDate: string
  endDate: string
  onStartDate: (v: string) => void
  onEndDate: (v: string) => void
  children?: React.ReactNode
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDate,
  onEndDate,
  children
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="block text-xs font-medium text-slate-600">
        Data inicial
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Data final
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDate(e.target.value)}
          className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      {children}
    </div>
  )
}
