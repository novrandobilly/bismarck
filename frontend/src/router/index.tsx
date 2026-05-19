import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/bismarck/login'
import NotFoundPage from '@/pages/not-found'
import MenuCatalogPage from '@/features/menu/MenuCatalogPage'
import SessionsDashboardPage from '@/features/sessions/SessionsDashboardPage'
import SessionNewPage from '@/features/sessions/SessionNewPage'
import SessionDetailPage from '@/features/sessions/SessionDetailPage'
import OrderPage from '@/features/order/OrderPage'
import OrderSuccessPage from '@/features/order/OrderSuccessPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/bismarck/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/bismarck/sessions', element: <SessionsDashboardPage /> },
      { path: '/bismarck/sessions/new', element: <SessionNewPage /> },
      { path: '/bismarck/sessions/:id', element: <SessionDetailPage /> },
      { path: '/bismarck/menu', element: <MenuCatalogPage /> },
    ],
  },
  { path: '/order/:sessionId', element: <OrderPage /> },
  { path: '/order/:sessionId/success', element: <OrderSuccessPage /> },
  { path: '*', element: <NotFoundPage /> },
])
