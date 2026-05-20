import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Session } from '@/types/session'

export function useSessions() {
  return useQuery({
    queryKey: ['preorder_sessions'],
    queryFn: () => pb.collection('preorder_sessions').getFullList<Session>({ sort: '-created' }),
  })
}

export function hasOpenSession(sessions: Session[]): boolean {
  return sessions.some(
    s => s.status === 'open' && new Date() <= new Date(s.order_deadline)
  )
}
