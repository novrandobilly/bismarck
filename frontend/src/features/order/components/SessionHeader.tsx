import type { Session } from '@/types/session'

interface Props {
  session: Session
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDeadline(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ID', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function SessionHeader({ session }: Props) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-stone-800 mb-1">{session.title}</h1>
      {session.description && <p className="text-stone-500 text-sm mb-3">{session.description}</p>}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
          <span className="text-green-600 font-medium">🗓 Ready on {formatDate(session.fulfillment_date)}</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm">
          <span className="text-amber-700">⏰ Order by {formatDeadline(session.order_deadline)}</span>
        </div>
      </div>
    </div>
  )
}
