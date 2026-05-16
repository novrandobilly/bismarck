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
  const [session, sessionItemsResult, orderCountResult] = await Promise.all([
    pb.collection('sessions').getOne<Session>(sessionId),
    pb.collection('session_items').getList<SessionItem>(1, 200, {
      filter: `session = "${sessionId}" && is_available = true`,
      expand: 'menu_item',
      sort: '+menu_item.name',
    }),
    pb.collection('orders').getList(1, 1, {
      filter: `session = "${sessionId}"`,
      fields: 'id',
    }),
  ])
  return { session, sessionItems: sessionItemsResult.items, orderCount: orderCountResult.totalItems }
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(sessionId),
    retry: false,
  })
}
