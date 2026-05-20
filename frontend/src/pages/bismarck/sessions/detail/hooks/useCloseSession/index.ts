import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

export function useCloseSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      pb.collection('preorder_sessions').update(sessionId, { status: 'closed' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preorder_sessions'] })
      qc.invalidateQueries({ queryKey: ['session-detail'] })
    },
  })
}
