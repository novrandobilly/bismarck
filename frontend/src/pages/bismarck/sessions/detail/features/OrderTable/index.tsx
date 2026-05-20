import type { Order } from '@/types/order'
import { OrderRow } from './features/OrderRow'

interface Props {
  orders: Order[]
  onToggleFulfilled: (order: Order) => void
  isToggling: boolean
}

export function OrderTable({ orders, onToggleFulfilled, isToggling }: Props) {
  if (orders.length === 0) {
    return <div className="bg-white rounded-2xl shadow-sm p-8 text-center"><p className="text-stone-400 text-sm">No orders yet.</p></div>
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Customer</th>
            <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Fulfillment</th>
            <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Items</th>
            <th className="text-right text-xs font-medium text-stone-500 uppercase py-3 px-4">Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <OrderRow key={order.id} order={order} onToggleFulfilled={onToggleFulfilled} isToggling={isToggling} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
