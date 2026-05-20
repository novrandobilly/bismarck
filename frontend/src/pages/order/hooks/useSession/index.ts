import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Session } from '@/types/session'
import type { SessionItem } from '@/types/menu'

export interface SessionData {
  session: Session
  sessionItems: SessionItem[]
  orderCount: number
}

async function fetchSession(sessionId: string): Promise<SessionData> {
  const [session, sessionItems, orderCountResult] = await Promise.all([
    pb.collection('preorder_sessions').getOne<Session>(sessionId),
    pb.collection('preorder_session_items').getFullList<SessionItem>({
      filter: pb.filter('preorder_session = {:id} && is_available = true', { id: sessionId }),
      expand: 'menu_item',
      sort: '+menu_item.name',
    }),
    pb.collection('orders').getList(1, 1, {
      filter: pb.filter('preorder_session = {:id}', { id: sessionId }),
      fields: 'id',
    }),
  ])
  return { session, sessionItems, orderCount: orderCountResult.totalItems }
}

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(sessionId!),
    retry: false,
    enabled: !!sessionId,
  })
}
