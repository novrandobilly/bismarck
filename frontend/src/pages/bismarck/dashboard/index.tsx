import { Link, useNavigate } from 'react-router-dom'
import { useSessions, hasOpenSession } from '@/pages/bismarck/sessions/hooks/useSessions'
import { useMenuItems } from '@/hooks/useMenuItems'
import { SessionCard } from '@/pages/bismarck/sessions/features/SessionCard'
import { OpenSessionPreview } from './features/OpenSessionPreview'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { MenuItem } from '@/types/menu'

function MenuItemChip({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center justify-between bg-white border border-stone-100 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-800 truncate">{item.name}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {item.category ? <span className="capitalize">{item.category}</span> : null}
        </p>
      </div>
      <span className="ml-3 shrink-0 text-sm font-semibold text-stone-700">
        Rp {item.default_price.toLocaleString('id-ID')}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions()
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems()

  const openSessions = sessions.filter(
    s => s.status === 'open' && new Date() <= new Date(s.order_deadline),
  )
  const pastSessions = sessions.filter(
    s => s.status === 'closed' || new Date() > new Date(s.order_deadline),
  )
  const activeItems = menuItems.filter(i => i.is_active)
  const archivedItems = menuItems.filter(i => !i.is_active)

  const canCreateSession = !hasOpenSession(sessions)
  const navigate = useNavigate()

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-10">

      {/* ── Preorder Sessions ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Preorder Sessions</h2>
            <p className="text-stone-400 text-sm">{sessions.length} total sessions</p>
          </div>
          {sessionsLoading ? null : canCreateSession ? (
            <Link
              to="/bismarck/sessions/new"
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              + New Session
            </Link>
          ) : (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-[180px] text-center">
              Close the open session before creating a new one
            </span>
          )}
        </div>

        {sessionsLoading ? (
          <LoadingSpinner centered />
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
            <p className="text-3xl mb-2">🥯</p>
            <p className="text-stone-700 font-medium">No sessions yet</p>
            <p className="text-stone-400 text-sm mt-1">Create your first preorder session to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {openSessions.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Open</p>
                <div className="space-y-3">
                  {openSessions.map(s => <OpenSessionPreview key={s.id} session={s} />)}
                </div>
              </div>
            )}
            {pastSessions.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Past</p>
                <div className="space-y-3">
                  {pastSessions.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Menu ──────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Menu</h2>
            <p className="text-stone-400 text-sm">{activeItems.length} active items</p>
          </div>
          <div className="flex items-center gap-3">
            {!menuLoading && (
              <Link
                to="/bismarck/menu"
                className="text-sm text-stone-500 hover:text-stone-800 border border-stone-300 rounded-lg px-3 py-2 transition-colors"
              >
                Manage Menu
              </Link>
            )}
            <button
              onClick={() => navigate('/bismarck/menu', { state: { openNew: true } })}
              className={cn(
                'cursor-pointer bg-stone-900 hover:bg-stone-700 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors',
              )}
            >
              + Add Item
            </button>
          </div>
        </div>

        {menuLoading ? (
          <LoadingSpinner centered />
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
            <p className="text-3xl mb-2">🍞</p>
            <p className="text-stone-700 font-medium">No menu items yet</p>
            <p className="text-stone-400 text-sm mt-1">Add your first item to the catalog.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeItems.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Active</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeItems.map(item => <MenuItemChip key={item.id} item={item} />)}
                </div>
              </div>
            )}
            {archivedItems.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Archived</p>
                <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-60')}>
                  {archivedItems.map(item => <MenuItemChip key={item.id} item={item} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
