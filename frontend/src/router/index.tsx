import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestWrapper, AdminWrapper } from '@/components/MainWrapper'
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
  {
    element: <GuestWrapper />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/order/:sessionId', element: <OrderPage /> },
      { path: '/order/:sessionId/success', element: <OrderSuccessPage /> },
    ],
  },
  { path: '/bismarck/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminWrapper />,
        children: [
          { path: '/bismarck/sessions', element: <SessionsDashboardPage /> },
          { path: '/bismarck/sessions/new', element: <SessionNewPage /> },
          { path: '/bismarck/sessions/:id', element: <SessionDetailPage /> },
          { path: '/bismarck/menu', element: <MenuCatalogPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
