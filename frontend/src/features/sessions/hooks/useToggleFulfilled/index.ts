import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

export function useToggleFulfilled(sessionId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, is_fulfilled }: { orderId: string; is_fulfilled: boolean }) =>
      pb.collection('orders').update(orderId, { is_fulfilled }),
    onSuccess: () => {
      if (sessionId) qc.invalidateQueries({ queryKey: ['session-detail', sessionId] })
    },
  })
}
