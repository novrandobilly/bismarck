import { Link } from "react-router-dom";
import { useSessions, hasOpenSession } from "./hooks/useSessions";
import { SessionCard } from "./features/SessionCard";
import { useLogout } from "@/hooks/useLogout";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function SessionsDashboardPage() {
  const { data: sessions = [], isLoading } = useSessions();
  const openExists = hasOpenSession(sessions);
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">
              Pre-Order Sessions
            </h1>
            <p className="text-stone-500 text-sm">
              {sessions.length} total sessions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {openExists ? (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-45 text-center">
                Close the open session before creating a new one
              </div>
            ) : (
              <Link
                to="/bismarck/sessions/new"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
              >
                + New Session
              </Link>
            )}
            <button
              onClick={logout}
              className="cursor-pointer text-sm text-stone-500 hover:text-stone-800 border border-stone-300 rounded-lg px-3 py-2 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner centered />
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🥯</p>
            <p className="text-stone-700 font-medium">No sessions yet</p>
            <p className="text-stone-400 text-sm mt-1">
              Create your first pre-order session to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <Link
            to="/bismarck/menu"
            className="text-sm text-amber-600 hover:underline"
          >
            → Manage Menu Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
