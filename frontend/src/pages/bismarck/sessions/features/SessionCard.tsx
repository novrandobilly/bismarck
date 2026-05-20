import { Link } from 'react-router-dom'
import type { Session } from '@/types/session'
import { cn } from '@/lib/utils/cn'

interface Props { session: Session }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function SessionCard({ session }: Props) {
  const isOpen = session.status === 'open'
  const isPastDeadline = new Date() > new Date(session.order_deadline)

  return (
    <Link to={`/bismarck/sessions/${session.id}`} className="block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-800 text-base truncate">{session.title}</h3>
          <p className="text-stone-500 text-sm mt-0.5">Ready: {formatDate(session.fulfillment_date)}</p>
          <p className="text-stone-400 text-xs mt-0.5">Deadline: {formatDate(session.order_deadline)}</p>
        </div>
        <span className={cn('shrink-0 text-xs font-semibold px-2 py-1 rounded-full', isOpen && !isPastDeadline ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500')}>
          {isOpen && !isPastDeadline ? 'Open' : 'Closed'}
        </span>
      </div>
    </Link>
  )
}
