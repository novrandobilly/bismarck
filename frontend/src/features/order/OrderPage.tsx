import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import { useOrderForm } from './hooks/useOrderForm'
import { useSubmitOrder } from './hooks/useSubmitOrder'
import { SessionHeader } from './components/SessionHeader'
import { MenuSection } from './components/MenuSection'
import { CustomerDetails } from './components/CustomerDetails'
import { FulfillmentSection } from './components/FulfillmentSection'
import { NotesSection } from './components/NotesSection'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Session } from '@/types/session'
import type { OrderFormValues } from '@/types/order'

function isSessionClosed(session: Session, orderCount: number): boolean {
  if (session.status === 'closed') return true
  const deadline = new Date(session.order_deadline)
  if (!isNaN(deadline.getTime()) && new Date() > deadline) return true
  if (session.max_orders > 0 && orderCount >= session.max_orders) return true
  return false
}

export default function OrderPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data, isLoading, error } = useSession(sessionId)
  const form = useOrderForm(data?.sessionItems ?? [], data?.session ?? null)
  const navigate = useNavigate()
  const { mutate: submitOrder, isPending, error: submitError } = useSubmitOrder()

  function onSubmit(values: OrderFormValues) {
    submitOrder({ sessionId, values }, {
      onSuccess: () => navigate(`/order/${sessionId}/success`),
    })
  }

  if (!sessionId) return null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <LoadingSpinner centered />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-stone-700 mb-2">Session Not Found</p>
          <p className="text-stone-500">This pre-order link is invalid or has been removed.</p>
        </div>
      </div>
    )
  }

  if (isSessionClosed(data.session, data.orderCount)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-stone-700 mb-2">Pre-Order Closed</p>
          <p className="text-stone-500">This pre-order session is no longer accepting orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <SessionHeader session={data.session} />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <MenuSection sessionItems={data.sessionItems} form={form} />
          <CustomerDetails form={form} />
          <FulfillmentSection form={form} session={data.session} />
          <NotesSection form={form} />
          {submitError && <p className="text-red-500 text-sm text-center mb-3">Something went wrong. Please try again.</p>}
          <button
            type="submit"
            disabled={isPending}
            aria-label={isPending ? 'Loading…' : undefined}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors mb-8"
          >
           {isPending ? <LoadingSpinner size="sm" /> : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  )
}
