import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Order } from '@/types/order'

export function useMarkAllFulfilled(sessionId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ orders, is_fulfilled }: { orders: Order[]; is_fulfilled: boolean }) => {
      await Promise.all(
        orders.map(o => pb.collection('orders').update(o.id, { is_fulfilled })),
      )
    },
    onSuccess: () => {
      if (sessionId) qc.invalidateQueries({ queryKey: ['session-detail', sessionId] })
    },
  })
}
