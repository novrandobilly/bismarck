import type { Order } from '@/types/order'

interface Props { orders: Order[] }

export function StatsRow({ orders }: Props) {
  const total = orders.length
  const fulfilled = orders.filter(o => o.is_fulfilled).length
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
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
    </div>
  )
}
