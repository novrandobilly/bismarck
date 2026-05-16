import { useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

interface LoginInput {
  email: string
  password: string
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      pb.collection('_superusers').authWithPassword(email, password),
  })
}
