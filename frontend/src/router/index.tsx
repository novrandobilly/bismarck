import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestWrapper, AdminWrapper } from '@/components/MainWrapper'
import HomePage from '@/pages/home'
import PublicMenuPage from '@/pages/menu'
import LoginPage from '@/pages/bismarck/login'
import NotFoundPage from '@/pages/not-found'
import MenuCatalogPage from '@/pages/bismarck/menu'
import DashboardPage from '@/pages/bismarck/dashboard'
import SessionsDashboardPage from '@/pages/bismarck/sessions'
import SessionNewPage from '@/pages/bismarck/sessions/new'
import SessionDetailPage from '@/pages/bismarck/sessions/detail'
import OrderPage from '@/pages/order'
import OrderSuccessPage from '@/pages/order/success'
import SessionOrdersPage from '@/pages/session-orders'

export const router = createBrowserRouter([
  {
    element: <GuestWrapper />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/menu', element: <PublicMenuPage /> },
      { path: '/order/:sessionId', element: <OrderPage /> },
      { path: '/order/:sessionId/success', element: <OrderSuccessPage /> },
      { path: '/session/:sessionId/orders', element: <SessionOrdersPage /> },
    ],
  },
  {
    element: <GuestWrapper />,
    children: [
      { path: '/bismarck/login', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminWrapper />,
        children: [
          { path: '/bismarck/dashboard', element: <DashboardPage /> },
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
