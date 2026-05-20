import { useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

interface LoginInput {
  identity: string
  password: string
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ identity, password }: LoginInput) =>
      pb.collection('_superusers').authWithPassword(identity, password),
  })
}
