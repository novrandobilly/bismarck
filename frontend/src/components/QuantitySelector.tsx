import { cn } from '@/lib/utils/cn'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantitySelector({ value, onChange, min = 0, max, className }: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => { if (value > (min ?? 0)) onChange(value - 1) }}
        disabled={value <= (min ?? 0)}
        className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 disabled:opacity-40 hover:bg-stone-100 transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => { if (max === undefined || value < max) onChange(value + 1) }}
        disabled={max !== undefined && value >= max}
        className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 disabled:opacity-40 hover:bg-stone-100 transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
