import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Order } from '@/types/order'
import type { Session } from '@/types/session'

interface SessionOrdersData {
  session: Session
  orders: Order[]
}

async function fetchSessionOrders(sessionId: string): Promise<SessionOrdersData> {
  const [session, orders] = await Promise.all([
    pb.collection('preorder_sessions').getOne<Session>(sessionId),
    pb.collection('orders').getFullList<Order>({
      filter: pb.filter('preorder_session = {:id}', { id: sessionId }),
      expand: 'order_items(order).preorder_session_item.menu_item',
      sort: '+created',
    }),
  ])
  return { session, orders }
}

export function useSessionOrdersPublic(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-orders-public', sessionId],
    queryFn: () => fetchSessionOrders(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 30_000,
  })
}
