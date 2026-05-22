import { Link, Outlet } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { useAuth } from "@/hooks/useAuth";

export function GuestWrapper() {
  const { isAuthenticated } = useAuth();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-stone-900 font-extrabold text-lg">
            🥯 Envien Bagel
          </Link>
          <nav className="flex items-center gap-4 text-sm text-stone-600">
            <Link to="/" className="hover:text-stone-900 transition-colors">
              Home
            </Link>
            <Link to="/menu" className="hover:text-stone-900 transition-colors">
              Menu
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/bismarck/dashboard"
                  className="hover:text-stone-900 transition-colors font-medium text-amber-700"
                >
                  Dashboard →
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="cursor-pointer text-stone-400 hover:text-stone-700 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-stone-400">
          <span>© {new Date().getFullYear()} Envien Bagel</span>
          <span>Made with 🥯 & wild yeast</span>
        </div>
      </footer>
    </div>
  );
}

export function AdminWrapper() {
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <header className="sticky top-0 z-10 bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/bismarck/dashboard"
              className="text-white font-extrabold text-lg"
            >
              🥯 Envien Bagel Admin
            </Link>
            <Link
              to="/"
              className="text-stone-400 hover:text-white text-sm transition-colors"
            >
              View Store ↗
            </Link>
          </div>
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer text-stone-400 hover:text-white text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
