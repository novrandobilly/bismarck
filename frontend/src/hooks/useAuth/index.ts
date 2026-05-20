import { useState, useEffect } from 'react'
import type { AuthModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => pb.authStore.isValid)
  const [user, setUser] = useState<AuthModel | null>(() => pb.authStore.model as AuthModel | null)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token: string, model: AuthModel | null) => {
      setIsAuthenticated(pb.authStore.isValid)
      setUser(model)
    })
    return unsubscribe
  }, [])

  return { isAuthenticated, user }
}
