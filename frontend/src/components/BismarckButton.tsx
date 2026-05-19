import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from './LoadingSpinner'

type Variant = 'primary' | 'dark' | 'outline' | 'outline-amber' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'full'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-amber-500 hover:bg-amber-600 text-white',
  dark: 'bg-stone-900 hover:bg-stone-800 text-white',
  outline: 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-50',
  'outline-amber': 'bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-50',
  ghost: 'bg-transparent text-stone-500 underline hover:text-stone-700',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
  full: 'w-full px-4 py-2 text-sm rounded-lg',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

export function BismarckButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'font-semibold transition-colors disabled:opacity-60',
        isLoading && 'flex items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </button>
  )
}
