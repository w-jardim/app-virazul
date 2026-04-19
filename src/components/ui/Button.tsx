import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  variant?: Variant
  size?: Size
}

const base = 'inline-flex items-center justify-center gap-2 font-semibold transition disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:   'rounded-lg bg-blue-700 text-white hover:bg-blue-600',
  secondary: 'rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost:     'rounded-md text-blue-700 hover:bg-blue-50',
  danger:    'rounded-lg bg-rose-600 text-white hover:bg-rose-500',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

/**
 * Button — componente primário de ação do ViraAzul.
 *
 * Variantes: primary (default) | secondary | ghost | danger
 * Tamanhos:  sm | md (default) | lg
 *
 * Para manter retrocompatibilidade, `className` ainda permite sobrescrever
 * as classes Tailwind quando necessário.
 */
const Button: React.FC<Props> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...rest
}) => (
  <button
    className={[base, variants[variant], sizes[size], className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </button>
)

export default Button
