import type { Order } from '@/types/order'
import type { OrderItem } from '@/types/order'

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

interface Props { orders: Order[] }

export function StatsRow({ orders }: Props) {
  const total = orders.length
  const fulfilled = orders.filter(o => o.is_fulfilled).length

  const totalRevenue = orders
    .filter(o => o.is_fulfilled)
    .reduce((sum, order) => {
    const items = (order.expand?.['order_items(order)'] ?? []) as OrderItem[]
    return sum + items.reduce((s, oi) => s + (oi.expand?.preorder_session_item?.price ?? 0) * oi.quantity, 0)
  }, 0)

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-stone-800">{total}</p>
        <p className="text-xs text-stone-500 mt-0.5">Total Orders</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-green-600">{fulfilled}</p>
        <p className="text-xs text-stone-500 mt-0.5">Fulfilled</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-amber-500">{total - fulfilled}</p>
        <p className="text-xs text-stone-500 mt-0.5">Pending</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-xl font-bold text-emerald-600">{idr.format(totalRevenue)}</p>
        <p className="text-xs text-stone-500 mt-0.5">Revenue (Done)</p>
      </div>
    </div>
  )
}
