import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Session } from '@/types/session'
import type { Order } from '@/types/order'

export interface SessionDetailData {
  session: Session
  orders: Order[]
}

async function fetchSessionDetail(id: string): Promise<SessionDetailData> {
  const [session, orders] = await Promise.all([
    pb.collection('preorder_sessions').getOne<Session>(id),
    pb.collection('orders').getFullList<Order>({
      filter: pb.filter('preorder_session = {:id}', { id }),
      expand: 'order_items(order).preorder_session_item.menu_item',
      sort: '+created',
    }),
  ])
  return { session, orders }
}

export function useSessionDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['session-detail', id],
    queryFn: () => fetchSessionDetail(id!),
    enabled: !!id,
  })
}
