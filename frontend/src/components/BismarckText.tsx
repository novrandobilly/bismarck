import type { ElementType, ReactNode, ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label'

const defaultTags: Record<Variant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  caption: 'p',
  label: 'p',
}

const variantClasses: Record<Variant, string> = {
  h1: 'text-3xl font-extrabold text-stone-900',
  h2: 'text-2xl font-bold text-stone-800',
  h3: 'text-lg font-semibold text-stone-800',
  body: 'text-sm text-stone-700',
  caption: 'text-xs text-stone-500',
  label: 'text-xs font-bold uppercase tracking-widest text-stone-400',
}

type Props<T extends ElementType> = {
  variant: Variant
  as?: T
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'variant' | 'as' | 'className' | 'children'>

export function BismarckText<T extends ElementType = 'p'>({
  variant,
  as,
  className,
  children,
  ...rest
}: Props<T>) {
  const Tag = (as ?? defaultTags[variant]) as ElementType
  return (
    <Tag className={cn(variantClasses[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}
