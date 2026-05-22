import { BANK_INFO } from '@/lib/bankInfo'
import { formatRupiah } from '@/tools/formatRupiah'
import type { Order, OrderItem } from '@/types/order'
import type { SessionItem } from '@/types/menu'

interface Props {
  order: Order
  onClose: () => void
}

export function BillDetail({ order, onClose }: Props) {
  const orderItems = (order.expand?.['order_items(order)'] ?? []) as OrderItem[]

  const total = orderItems.reduce((sum, oi) => {
    const price = (oi.expand?.preorder_session_item as SessionItem | undefined)?.price ?? 0
    return sum + price * oi.quantity
  }, 0)

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="font-bold text-stone-900 text-base">{order.customer_name} — Your Bill</h2>
        <p className="text-xs text-stone-400 capitalize">{order.fulfillment_type}</p>
      </div>

      <div className="border-t border-stone-100 pt-3 space-y-2 mb-3">
        {orderItems.map((oi) => {
          const si = oi.expand?.preorder_session_item as SessionItem | undefined
          const name = si?.expand?.menu_item?.name ?? 'Item'
          const price = si?.price ?? 0
          return (
            <div key={oi.id} className="flex justify-between text-sm">
              <span className="text-stone-600">{name} ×{oi.quantity}</span>
              <span className="font-medium text-stone-800">{formatRupiah(price * oi.quantity)}</span>
            </div>
          )
        })}
      </div>

      <div className="border-t border-stone-200 pt-3 flex justify-between mb-4">
        <span className="font-bold text-stone-900">Total</span>
        <span className="font-bold text-amber-500 text-base">{formatRupiah(total)}</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 leading-relaxed mb-4">
        <p className="font-bold mb-1">💳 Transfer to:</p>
        <p>{BANK_INFO.bank} · {BANK_INFO.accountNumber}</p>
        <p>a/n {BANK_INFO.accountHolder}</p>
        <p className="mt-1">Amount: <strong>{formatRupiah(total)}</strong></p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full text-stone-400 text-sm py-2 hover:text-stone-600 transition-colors"
      >
        Close
      </button>
    </div>
  )
}
