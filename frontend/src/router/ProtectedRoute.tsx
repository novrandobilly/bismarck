import { Navigate, Outlet } from 'react-router-dom'
import { pb } from '@/lib/pocketbase'

export function ProtectedRoute() {
  if (!pb.authStore.isValid) {
    return <Navigate to="/bismarck/login" replace />
  }
  return <Outlet />
}
