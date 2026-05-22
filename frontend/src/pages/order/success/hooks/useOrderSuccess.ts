import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Order } from '@/types/order'

async function fetchOrderSuccess(orderId: string): Promise<Order> {
  return pb.collection('orders').getOne<Order>(orderId, {
    expand: 'order_items(order).preorder_session_item.menu_item',
  })
}

export function useOrderSuccess(orderId: string | null) {
  return useQuery({
    queryKey: ['order-success', orderId],
    queryFn: () => fetchOrderSuccess(orderId!),
    enabled: !!orderId,
    retry: false,
  })
}
