import type { Order, OrderItem } from '@/types/order'
import { cn } from '@/lib/utils/cn'

interface Props {
  order: Order
  onToggleFulfilled: (order: Order) => void
  isToggling: boolean
}

export function OrderRow({ order, onToggleFulfilled, isToggling }: Props) {
  const orderItems = (order.expand?.['order_items(order)'] ?? []) as OrderItem[]
  const fulfillmentLabel: Record<string, string> = {
    pickup: 'Pickup',
    delivery: 'Delivery',
    custom: order.custom_location || 'Drop-off',
  }

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 px-4">
        <p className="font-medium text-stone-800 text-sm">{order.customer_name}</p>
        <p className="text-stone-400 text-xs">{order.whatsapp}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-stone-500">{fulfillmentLabel[order.fulfillment_type]}</p>
        {order.delivery_address && <p className="text-xs text-stone-400 mt-0.5 max-w-[160px] truncate">{order.delivery_address}</p>}
      </td>
      <td className="py-3 px-4">
        {orderItems.map(oi => {
          const name = oi.expand?.preorder_session_item?.expand?.menu_item?.name ?? 'Item'
          return <p key={oi.id} className="text-xs text-stone-600">{oi.quantity}x {name}</p>
        })}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          type="button"
          onClick={() => onToggleFulfilled(order)}
          disabled={isToggling}
          className={cn(
            'cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
            order.is_fulfilled
              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100',
          )}
        >
          {order.is_fulfilled ? '✓ Done' : 'Mark Done'}
        </button>
      </td>
    </tr>
  )
}
