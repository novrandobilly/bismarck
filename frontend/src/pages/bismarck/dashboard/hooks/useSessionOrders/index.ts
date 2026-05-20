import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Order } from '@/types/order'

export function useSessionOrders(sessionId: string) {
  return useQuery({
    queryKey: ['session-orders-preview', sessionId],
    queryFn: () =>
      pb.collection('orders').getFullList<Order>({
        filter: pb.filter('preorder_session = {:id}', { id: sessionId }),
        sort: '-created',
        fields: 'id,customer_name,fulfillment_type,is_fulfilled,created',
      }),
    enabled: !!sessionId,
  })
}
