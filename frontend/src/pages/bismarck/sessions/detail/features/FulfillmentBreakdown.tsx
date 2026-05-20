import type { Order } from '@/types/order'

interface Props { orders: Order[] }

export function FulfillmentBreakdown({ orders }: Props) {
  const groups: Record<string, Order[]> = {}
  for (const order of orders) {
    const key = order.fulfillment_type === 'custom'
      ? `Drop-off: ${order.custom_location || 'Unknown'}`
      : order.fulfillment_type === 'delivery' ? 'Delivery' : 'Self Pickup'
    if (!groups[key]) groups[key] = []
    groups[key].push(order)
  }
  if (Object.keys(groups).length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-base font-bold text-stone-800 mb-3">Fulfillment Breakdown</h2>
      <div className="space-y-3">
        {Object.entries(groups).map(([label, groupOrders]) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm p-4">
            <p className="font-medium text-stone-700 text-sm mb-2">{label} <span className="text-stone-400 font-normal">({groupOrders.length})</span></p>
            {groupOrders.map(o => <p key={o.id} className="text-xs text-stone-500">{o.customer_name} — {o.whatsapp}</p>)}
          </div>
        ))}
      </div>
    </div>
  )
}
