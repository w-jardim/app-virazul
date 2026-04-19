import React, { useEffect, useMemo, useState } from 'react'
import {
  useDeleteScheduleTemplate,
  useSaveScheduleTemplate,
  useScheduleCalendar,
  useScheduleTemplate,
} from '@/features/ordinary-schedule/hooks/useScheduleData'
import {
  MonthCalendar,
  WeekdayRow,
  WEEKDAY_LABELS,
  DURATION_OPTIONS,
} from '@/features/ordinary-schedule/components/ScheduleComponents'
import { PageLoadingState, PageErrorState } from '@/components/shared/PageStates'
import type {
  BiweeklyTemplate,
  IntervalTemplate,
  ScheduleTemplate,
  ScheduleType,
  WeekdayEntry,
  WeeklyTemplate,
} from '@/features/ordinary-schedule/types/schedule.types'

// ── helpers ───────────────────────────────────────────────────────────────────

function todayMonthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function prevMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function defaultWeekly(): WeeklyTemplate {
  return { type: 'WEEKLY', entries: [] }
}

function defaultBiweekly(): BiweeklyTemplate {
  const today = new Date()
  const offset = today.getDay() === 0 ? -6 : 1 - today.getDay()
  const monday = new Date(today.getTime() + offset * 86400000)
  const ref = monday.toISOString().slice(0, 10)
  return { type: 'BIWEEKLY', reference_date: ref, week_a: [], week_b: [] }
}

function defaultInterval(): IntervalTemplate {
  return {
    type: 'INTERVAL',
    reference_date: new Date().toISOString().slice(0, 10),
    start_time: '07:00',
    work_hours: 24,
    off_hours: 72,
  }
}

// ── weekday entries editor ────────────────────────────────────────────────────

type WeekdayEditorProps = {
  entries: WeekdayEntry[]
  onChange: (entries: WeekdayEntry[]) => void
}

const WeekdayEditor = ({ entries, onChange }: WeekdayEditorProps) => {
  const byDay = useMemo(() => {
    const m: Record<number, WeekdayEntry> = {}
    for (const e of entries) m[e.weekday] = e
    return m
  }, [entries])

  function toggle(weekday: number) {
    if (byDay[weekday]) {
      onChange(entries.filter((e) => e.weekday !== weekday))
    } else {
      onChange([...entries, { weekday, start_time: '07:00', duration_hours: 12 }])
    }
  }

  function update(weekday: number, field: 'start_time' | 'duration_hours', value: string | number) {
    onChange(entries.map((e) => e.weekday === weekday ? { ...e, [field]: value } : e))
  }

  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7].map((wd) => (
        <WeekdayRow
          key={wd}
          weekday={wd}
          entry={byDay[wd]}
          onToggle={toggle}
          onChange={update}
        />
      ))}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

const OrdinarySchedulePage: React.FC = () => {
  const templateQuery = useScheduleTemplate()
  const saveMutation = useSaveScheduleTemplate()
  const deleteMutation = useDeleteScheduleTemplate()

  const [previewMonth, setPreviewMonth] = useState(todayMonthStr)
  const calendarQuery = useScheduleCalendar(previewMonth)

  // active editor type
  const [selectedType, setSelectedType] = useState<ScheduleType>('WEEKLY')

  // local draft states for each type
  const [weekly, setWeekly] = useState<WeeklyTemplate>(defaultWeekly)
  const [biweekly, setBiweekly] = useState<BiweeklyTemplate>(defaultBiweekly)
  const [interval, setInterval] = useState<IntervalTemplate>(defaultInterval)

  // populate drafts from saved template
  useEffect(() => {
    const t = templateQuery.data
    if (!t) return
    setSelectedType(t.type)
    if (t.type === 'WEEKLY') setWeekly(t)
    if (t.type === 'BIWEEKLY') setBiweekly(t)
    if (t.type === 'INTERVAL') setInterval(t)
  }, [templateQuery.data])

  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  const currentDraft = useMemo((): ScheduleTemplate => {
    if (selectedType === 'WEEKLY') return weekly
    if (selectedType === 'BIWEEKLY') return biweekly
    return interval
  }, [selectedType, weekly, biweekly, interval])

  async function handleSave() {
    setSaveError(null)
    setSaveOk(false)
    try {
      await saveMutation.mutateAsync(currentDraft)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Array<{ message: string }> } } }
      setSaveError(e?.response?.data?.errors?.[0]?.message ?? 'Erro ao salvar escala.')
    }
  }

  async function handleDelete() {
    if (!confirm('Remover a escala base? Ela deixará de aparecer nos calendários.')) return
    await deleteMutation.mutateAsync()
  }

  const hasTemplate = Boolean(templateQuery.data)
  const workDays = calendarQuery.data?.work_days ?? []
  const [previewYear, previewMonthNum] = previewMonth.split('-').map(Number)

  if (templateQuery.isLoading) return <PageLoadingState />
  if (templateQuery.isError) return (
    <PageErrorState title="Falha ao carregar escala" description="Tente novamente em instantes." />
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Escala Ordinária</h1>
        <p className="text-sm text-slate-600">
          Defina sua escala de trabalho regular. Os dias sem plantão são suas folgas — onde você agenda RAS, PROEIS e demais serviços.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">

        {/* ── left: editor ─────────────────────────────────────────────────── */}
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Configurar escala base</h2>
            {hasTemplate && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-xs text-rose-500 hover:text-rose-700 disabled:opacity-50"
              >
                Remover escala
              </button>
            )}
          </div>

          {/* type selector */}
          <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
            {(['WEEKLY', 'BIWEEKLY', 'INTERVAL'] as ScheduleType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  selectedType === t
                    ? 'bg-white text-blue-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'WEEKLY' ? 'Semanal' : t === 'BIWEEKLY' ? 'Quinzenal' : 'Intervalo'}
              </button>
            ))}
          </div>

          {/* ── WEEKLY editor ─────────────────────────────────────────── */}
          {selectedType === 'WEEKLY' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Selecione os dias da semana em que você trabalha e configure horário e carga horária de cada um.
              </p>
              <WeekdayEditor
                entries={weekly.entries}
                onChange={(entries) => setWeekly({ ...weekly, entries })}
              />
            </div>
          )}

          {/* ── BIWEEKLY editor ───────────────────────────────────────── */}
          {selectedType === 'BIWEEKLY' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Defina duas semanas alternadas (A e B). Informe uma segunda-feira de referência para o sistema saber qual semana é qual.
              </p>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Segunda-feira de referência (Semana A)</label>
                <input
                  type="date"
                  value={biweekly.reference_date}
                  onChange={(e) => setBiweekly({ ...biweekly, reference_date: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Semana A</p>
                <WeekdayEditor
                  entries={biweekly.week_a}
                  onChange={(week_a) => setBiweekly({ ...biweekly, week_a })}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Semana B</p>
                <WeekdayEditor
                  entries={biweekly.week_b}
                  onChange={(week_b) => setBiweekly({ ...biweekly, week_b })}
                />
              </div>
            </div>
          )}

          {/* ── INTERVAL editor ───────────────────────────────────────── */}
          {selectedType === 'INTERVAL' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Para escalas de intervalo fixo (ex: 24h trabalhando / 72h folga). Informe o primeiro dia de trabalho como referência.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Horas trabalhando</label>
                  <select
                    value={interval.work_hours}
                    onChange={(e) => setInterval({ ...interval, work_hours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {DURATION_OPTIONS.map((h) => (
                      <option key={h} value={h}>{h}h</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Horas de folga</label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={interval.off_hours}
                    onChange={(e) => setInterval({ ...interval, off_hours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Data do primeiro plantão</label>
                  <input
                    type="date"
                    value={interval.reference_date}
                    onChange={(e) => setInterval({ ...interval, reference_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Horário de entrada</label>
                  <input
                    type="time"
                    value={interval.start_time}
                    onChange={(e) => setInterval({ ...interval, start_time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {interval.work_hours && interval.off_hours ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Ciclo: {interval.work_hours}h plantão + {interval.off_hours}h folga = {interval.work_hours + interval.off_hours}h total
                </p>
              ) : null}
            </div>
          )}

          {/* save button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Salvando...' : 'Salvar escala'}
            </button>
            {saveOk && <span className="text-xs text-emerald-600">Escala salva com sucesso.</span>}
            {saveError && <span className="text-xs text-rose-600">{saveError}</span>}
          </div>
        </section>

        {/* ── right: preview calendar ───────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Prévia do calendário</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewMonth(prevMonth(previewMonth))}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setPreviewMonth(nextMonth(previewMonth))}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ›
              </button>
            </div>
          </div>

          {calendarQuery.isLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          ) : (
            <MonthCalendar
              year={previewYear}
              month={previewMonthNum}
              workDays={workDays}
            />
          )}

          {!hasTemplate && !saveMutation.isSuccess && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Salve sua escala para visualizar os plantões no calendário.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default OrdinarySchedulePage
