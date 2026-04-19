import React from 'react'

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
  children,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <label className="block text-xs font-medium text-slate-600">
        Data inicial
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          className="mt-1 block rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Data final
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDate(e.target.value)}
          className="mt-1 block rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </label>
      {children}
    </div>
  )
}
