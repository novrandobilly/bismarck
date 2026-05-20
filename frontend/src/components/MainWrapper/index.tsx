import { Link, Outlet } from 'react-router-dom'
import { useLogout } from '@/hooks/useLogout'

export function GuestWrapper() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-stone-900 font-extrabold text-lg">🥯 Bismarck Bagel</Link>
          <nav className="flex items-center gap-6 text-sm text-stone-600">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            {/* /menu route will be added when public menu page is built */}
            <Link to="/menu" className="hover:text-stone-900 transition-colors">Menu</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-stone-400">
          <span>© {new Date().getFullYear()} Bismarck Bagel</span>
          <span>Made with 🥯 & wild yeast</span>
        </div>
      </footer>
    </div>
  )
}

export function AdminWrapper() {
  const logout = useLogout()

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <header className="sticky top-0 z-10 bg-stone-900 border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/bismarck/sessions" className="text-white font-extrabold text-lg">🥯 Bismarck</Link>
          <button
            type="button"
            onClick={logout}
            className="text-stone-400 hover:text-white text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
