import { cn } from '@/lib/utils/cn'

interface Props {
  size?: 'sm' | 'md'
  centered?: boolean
  overlay?: boolean
  className?: string
}

export function LoadingSpinner({ size = 'md', centered = false, overlay = false, className }: Props) {
  const spinner = (
    <div
      className={cn(
        'rounded-full border-stone-200 border-t-amber-500 animate-spin',
        size === 'sm' ? 'w-4 h-4 border-2' : 'w-8 h-8 border-4',
        className,
      )}
    />
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/40">
        {spinner}
      </div>
    )
  }

  if (centered) {
    return (
      <div className="flex w-full items-center justify-center py-12">
        {spinner}
      </div>
    )
  }

  return spinner
}
