import type { SessionItem } from '@/types/menu'
import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import { MenuItemCard } from './features/MenuItemCard'

interface Props {
  sessionItems: SessionItem[]
  form: UseFormReturn<OrderFormValues>
}

export function MenuSection({ sessionItems, form }: Props) {
  const items = form.watch('items')
  const itemsError = form.formState.errors.items

  function getQuantity(sessionItemId: string): number {
    return items.find(i => i.session_item_id === sessionItemId)?.quantity ?? 0
  }

  function handleChange(sessionItemId: string, qty: number) {
    form.setValue('items', items.map(i =>
      i.session_item_id === sessionItemId ? { ...i, quantity: qty } : i,
    ), { shouldValidate: false })
  }

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-1">Menu</h2>
      {itemsError && typeof itemsError === 'object' && 'message' in itemsError &&
        (itemsError as { message?: string }).message && (
        <p className="text-red-500 text-xs mb-2">{(itemsError as { message?: string }).message}</p>
      )}
      <div className="bg-white rounded-2xl shadow-sm px-4">
        {sessionItems.map(si => (
          <MenuItemCard
            key={si.id}
            sessionItem={si}
            quantity={getQuantity(si.id)}
            onChangeQuantity={(qty) => handleChange(si.id, qty)}
          />
        ))}
      </div>
    </div>
  )
}
