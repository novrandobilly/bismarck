import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useOrderSuccess } from './hooks/useOrderSuccess'
import { BANK_INFO } from '@/lib/bankInfo'
import { formatRupiah } from '@/tools/formatRupiah'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { OrderItem } from '@/types/order'
import type { SessionItem } from '@/types/menu'

export default function OrderSuccessPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const { data: order, isLoading } = useOrderSuccess(orderId)

  const orderItems = (order?.expand?.['order_items(order)'] ?? []) as OrderItem[]
  const total = orderItems.reduce((sum, oi) => {
    const price = (oi.expand?.preorder_session_item as SessionItem | undefined)?.price ?? 0
    return sum + price * oi.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-10">

        {/* Confirmation header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Order placed!</h1>
          {order && (
            <p className="text-stone-500 text-sm">
              Thanks, {order.customer_name}. We'll see you on fulfillment day.
            </p>
          )}
          {!order && !isLoading && (
            <p className="text-stone-500 text-sm">
              Your order has been received. Thank you!
            </p>
          )}
        </div>

        {/* Bill summary — shown when data is available */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && orderItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 mb-4">
            <p className="font-bold text-stone-800 text-sm mb-3">🧾 Your Order</p>
            <div className="space-y-2 mb-3">
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
            <div className="border-t border-stone-100 pt-3 flex justify-between">
              <span className="font-bold text-stone-900">Total</span>
              <span className="font-bold text-amber-500 text-base">{formatRupiah(total)}</span>
            </div>
          </div>
        )}

        {/* Payment info */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-4">
          <p className="font-bold text-amber-900 text-sm mb-1">💳 Pay via bank transfer</p>
          <p className="text-amber-800 text-sm leading-relaxed">
            {BANK_INFO.bank} · <strong>{BANK_INFO.accountNumber}</strong>
            <br />a/n <strong>{BANK_INFO.accountHolder}</strong>
            {total > 0 && (
              <>
                <br />
                <span className="text-amber-700">
                  Amount: <strong>{formatRupiah(total)}</strong>
                </span>
              </>
            )}
          </p>
        </div>

        {/* Reassurance + CTA */}
        <p className="text-center text-xs text-stone-400 mb-4">
          Don't worry — you can always come back to see your order detail on the orders page.
        </p>
        {sessionId && (
          <Link
            to={`/session/${sessionId}/orders`}
            className="block bg-stone-900 hover:bg-stone-800 text-white text-center font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            See all orders for this session →
          </Link>
        )}

      </div>
    </div>
  )
}
