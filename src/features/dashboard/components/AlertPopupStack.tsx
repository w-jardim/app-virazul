import React, { useMemo, useState } from 'react'

type AlertPopupItem = {
  id: string
  title: string
  description: string
}

type AlertPopupStackProps = {
  items: AlertPopupItem[]
}

const AlertPopupStack: React.FC<AlertPopupStackProps> = ({ items }) => {
  const [dismissedIds, setDismissedIds] = useState<Record<string, true>>({})

  const visibleItems = useMemo(
    () => items.filter((item) => !dismissedIds[item.id]).slice(0, 3),
    [dismissedIds, items]
  )

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-3 top-20 z-50 flex w-[min(92vw,420px)] flex-col gap-2 sm:right-6">
      {visibleItems.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto rounded-xl border border-amber-300 bg-amber-50 p-3 shadow-lg"
          role="alert"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-amber-900">{item.title}</p>
              <p className="mt-1 text-xs text-amber-800">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setDismissedIds((prev) => ({ ...prev, [item.id]: true }))}
              className="rounded border border-amber-300 bg-white px-1.5 py-0.5 text-xs text-amber-700 hover:bg-amber-100"
            >
              Fechar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AlertPopupStack
