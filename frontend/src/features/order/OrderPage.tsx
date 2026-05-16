import { useParams } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import type { Session } from '@/types/session'

function isSessionClosed(session: Session, orderCount: number): boolean {
  if (session.status === 'closed') return true
  if (new Date() > new Date(session.order_deadline)) return true
  if (session.max_orders > 0 && orderCount >= session.max_orders) return true
  return false
}

export default function OrderPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data, isLoading, error } = useSession(sessionId!)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500">Loading order form...</p>
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
        <p className="text-stone-400">Order form coming in next task...</p>
      </div>
    </div>
  )
}
