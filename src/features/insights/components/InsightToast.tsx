import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInsights } from '../hooks/useInsights'
import { usePreferencesStore } from '@/stores/usePreferencesStore'
import type { Insight, InsightSeverity } from '../types/insights.types'

const ROTATE_INTERVAL_MS = 30_000 // 30 s entre insights
const DISMISS_COOLDOWN_MS = 60_000 * 5 // 5 min sem popup após fechar

const SEVERITY_STYLES: Record<InsightSeverity, { border: string; bg: string; accent: string }> = {
  critical: { border: 'border-rose-300', bg: 'bg-rose-50', accent: 'text-rose-700' },
  warning:  { border: 'border-amber-300', bg: 'bg-amber-50', accent: 'text-amber-700' },
  positive: { border: 'border-emerald-300', bg: 'bg-emerald-50', accent: 'text-emerald-700' },
  info:     { border: 'border-blue-300', bg: 'bg-blue-50', accent: 'text-blue-800' },
}

const InsightToast: React.FC = () => {
  const { insights, isLoading } = useInsights()
  const enabled = usePreferencesStore((s) => s.insightsEnabled)

  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [pausedUntil, setPausedUntil] = useState(0)

  // Advance to next insight every ROTATE_INTERVAL_MS
  useEffect(() => {
    if (insights.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % insights.length)
      setVisible(true)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [insights.length])

  // Reset index when insight list changes
  useEffect(() => {
    setIndex(0)
    setVisible(true)
  }, [insights.length])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    setPausedUntil(Date.now() + DISMISS_COOLDOWN_MS)
  }, [])

  const handleNext = useCallback(() => {
    if (insights.length > 1) {
      setIndex((prev) => (prev + 1) % insights.length)
    }
  }, [insights.length])

  if (!enabled || isLoading || insights.length === 0) return null
  if (!visible && Date.now() < pausedUntil) return null

  // Re-show after cooldown
  if (!visible && Date.now() >= pausedUntil) {
    // Will show on next render cycle
    setVisible(true)
    setIndex((prev) => (prev + 1) % insights.length)
    return null
  }

  const current: Insight = insights[index % insights.length]
  if (!current) return null

  const s = SEVERITY_STYLES[current.severity]

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 w-[min(92vw,380px)]">
      <div
        className={`pointer-events-auto rounded-xl border ${s.border} ${s.bg} p-4 shadow-lg animate-in slide-in-from-right-5 fade-in duration-300`}
        role="status"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${s.accent}`}>{current.title}</p>
            <p className="mt-1 text-xs text-slate-700 leading-relaxed">{current.description}</p>

            {(current.metric || current.action) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {current.metric && (
                  <span className="inline-block rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {current.metric}
                  </span>
                )}
                {current.action && (
                  <Link
                    to={current.action.to}
                    onClick={handleDismiss}
                    className={`text-xs font-medium ${s.accent} hover:underline`}
                  >
                    {current.action.label} &rarr;
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
              title="Fechar"
            >
              ✕
            </button>
            {insights.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
                title="Próximo"
              >
                ›
              </button>
            )}
          </div>
        </div>

        {insights.length > 1 && (
          <div className="mt-2 flex items-center gap-1">
            {insights.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i === index % insights.length ? 'bg-slate-400' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InsightToast
