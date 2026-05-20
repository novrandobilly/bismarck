import { Link } from 'react-router-dom'
import type { Session } from '@/types/session'
import { useSessionOrders } from '../hooks/useSessionOrders'
import { cn } from '@/lib/utils/cn'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const fulfillmentLabel: Record<string, string> = {
  pickup: 'Pickup',
  delivery: 'Delivery',
  custom: 'Drop-off',
}

interface Props { session: Session }

export function OpenSessionPreview({ session }: Props) {
  const { data: orders = [], isLoading } = useSessionOrders(session.id)
  const isPastDeadline = new Date() > new Date(session.order_deadline)

  const fulfilled = orders.filter(o => o.is_fulfilled).length
  const total = orders.length
  const maxOrders = session.max_orders
  const previewOrders = orders.slice(0, 4)

  return (
    <Link
      to={`/bismarck/sessions/${session.id}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Session header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-800 text-base truncate">{session.title}</h3>
          <p className="text-stone-500 text-sm mt-0.5">Ready: {formatDate(session.fulfillment_date)}</p>
          <p className="text-stone-400 text-xs mt-0.5">Deadline: {formatDate(session.order_deadline)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={cn(
            'text-xs font-semibold px-2 py-1 rounded-full',
            !isPastDeadline ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500',
          )}>
            {!isPastDeadline ? 'Open' : 'Deadline passed'}
          </span>
          {!isLoading && (
            <span className="text-xs text-stone-500 font-medium">
              {total} order{total !== 1 ? 's' : ''}
              {maxOrders > 0 ? ` / ${maxOrders}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar (only if max_orders set) */}
      {maxOrders > 0 && total > 0 && (
        <div className="px-5 pb-3">
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${Math.min((total / maxOrders) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Order sneak peek */}
      <div className="border-t border-stone-100 px-5 py-3">
        {isLoading ? (
          <p className="text-xs text-stone-400 py-1">Loading orders…</p>
        ) : total === 0 ? (
          <p className="text-xs text-stone-400 italic py-1">No orders yet</p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
              Recent Orders · {fulfilled}/{total} fulfilled
            </p>
            {previewOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-stone-700 truncate">{o.customer_name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-stone-400">{fulfillmentLabel[o.fulfillment_type] ?? o.fulfillment_type}</span>
                  <span className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    o.is_fulfilled ? 'bg-green-400' : 'bg-stone-300',
                  )} />
                </div>
              </div>
            ))}
            {total > 4 && (
              <p className="text-xs text-stone-400 pt-1">+{total - 4} more → view all</p>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
