import { useNavigate } from 'react-router-dom'
import { pb } from '@/lib/pocketbase'

export function useLogout() {
  const navigate = useNavigate()

  return function logout() {
    pb.authStore.clear()
    navigate('/bismarck/login', { replace: true })
  }
}
