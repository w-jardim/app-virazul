/**
 * ui.ts — Design tokens compartilhados do ViraAzul
 *
 * Use estas constantes nos componentes para garantir consistência visual.
 * Todas as cores seguem o tema navy (blue-*) do sistema.
 */

// ─── Botões ───────────────────────────────────────────────────────────────────

/** Botão de ação primária — azul navy sólido */
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50'

/** Botão primário compacto */
export const btnPrimarySmall =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50'

/** Botão secundário — borda + fundo branco */
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50'

/** Botão secundário compacto */
export const btnSecondarySmall =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50'

/** Botão ghost/link */
export const btnGhost =
  'inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 transition hover:text-blue-600'

/** Botão de perigo */
export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50'

// ─── Navegação / Tabs ─────────────────────────────────────────────────────────

/** Tab ativa — borda inferior azul */
export const tabActive = 'border-b-2 border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 -mb-px transition'

/** Tab inativa */
export const tabInactive = 'border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 -mb-px transition hover:text-slate-700 hover:border-slate-300'

/** Container de tabs */
export const tabBar = 'flex gap-1 border-b border-slate-200'

// ─── Inputs / Selects ─────────────────────────────────────────────────────────

/** Input padrão */
export const inputBase =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'

/** Input com erro */
export const inputError =
  'w-full rounded-lg border border-red-400 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100'

/** Input compacto (inline, dentro de tabelas etc.) */
export const inputSmall =
  'rounded border border-slate-200 px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100'

/** Select */
export const selectBase =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'

// ─── Cards ────────────────────────────────────────────────────────────────────

/** Card padrão */
export const card = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm'

/** Card elevado com hover */
export const cardHover = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md'

/** Card tônico (destaque suave) */
export const cardBlue = 'rounded-xl border border-blue-100 bg-blue-50 p-5'

// ─── Badges / Tags ────────────────────────────────────────────────────────────

/** Badge primário */
export const badgePrimary = 'rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 ring-1 ring-blue-200'

/** Badge neutro/cinza */
export const badgeNeutral = 'rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700'

/** Badge de sucesso */
export const badgeSuccess = 'rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800'

/** Badge de alerta */
export const badgeWarning = 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800'

/** Badge de perigo */
export const badgeDanger = 'rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700'

// ─── Page header ──────────────────────────────────────────────────────────────

/** Container de título de página */
export const pageHeader = 'mb-6'

/** Título h1 de página */
export const pageTitle = 'text-2xl font-semibold text-slate-900'

/** Subtítulo de página */
export const pageSubtitle = 'mt-1 text-sm text-slate-500'

// ─── Helpers de estado ────────────────────────────────────────────────────────

/** Texto de link/ação inline */
export const linkText = 'text-sm font-medium text-blue-700 hover:text-blue-600 hover:underline'

/** Texto de salvando/loading inline */
export const textSaving = 'text-xs font-medium text-blue-600'

/** Barra de progresso base */
export const progressBar = 'h-full rounded-full bg-blue-500 transition-all duration-500'

/** Toggle ativo */
export const toggleActive = 'bg-blue-700'

/** Toggle inativo */
export const toggleInactive = 'bg-slate-300'
