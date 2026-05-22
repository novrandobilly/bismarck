import { Link } from "react-router-dom";
import {
  usePublicSessions,
  getOpenSession,
  getClosedSessions,
} from "./hooks/usePublicSessions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Session } from "@/types/session";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OpenPOBanner({ session }: { session: Session }) {
  const badge = (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2.5 py-1 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Pre-Order Open
    </span>
  );

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 pb-2 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          {/* Mobile: title + badge in same row */}
          <div className="flex items-start justify-between gap-3 sm:block">
            <h3 className="text-lg font-bold text-stone-800 leading-snug">
              {session.title}
            </h3>
            <span className="sm:hidden">{badge}</span>
          </div>
          {session.description && (
            <p className="text-stone-600 text-sm mt-1">{session.description}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-stone-500">
            <span>📅 Ready: {formatDate(session.fulfillment_date)}</span>
            <span>⏰ Order by: {formatDate(session.order_deadline)}</span>
          </div>
        </div>
        {/* Desktop: badge above button in right column */}
        <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
          {badge}
          <Link
            to={`/order/${session.id}`}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors text-center"
          >
            Order Now →
          </Link>
        </div>
        {/* Mobile: button full-width below */}
        <Link
          to={`/order/${session.id}`}
          className="sm:hidden bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors text-center"
        >
          Order Now →
        </Link>
      </div>
      <div className="border-t border-amber-200 pt-1">
        <Link
          to={`/session/${session.id}/orders`}
          className="text-xs text-amber-600 hover:text-amber-800 hover:underline transition-colors"
        >
          Already ordered? Check your order status →
        </Link>
      </div>
    </div>
  );
}

function PastSessionCard({ session }: { session: Session }) {
  return (
    <Link
      to={`/session/${session.id}/orders`}
      className="block bg-white border border-stone-200 rounded-xl p-4 hover:shadow-sm hover:border-stone-300 transition-all"
    >
      <p className="font-semibold text-stone-700 text-sm">{session.title}</p>
      <p className="text-stone-400 text-xs mt-1">
        Fulfilled: {formatDate(session.fulfillment_date)}
      </p>
      <p className="text-amber-600 text-xs mt-2">View order list →</p>
    </Link>
  );
}

const BAGEL_FACTS = [
  {
    icon: "🌾",
    title: "Long Fermentation",
    body: "Our dough ferments slowly for 18–24 hours in the cold, developing deep, complex flavour that you simply cannot rush.",
  },
  {
    icon: "💧",
    title: "Wild Yeast Starter",
    body: "Powered entirely by a live sourdough starter — no commercial yeast. Each batch carries the character of living culture.",
  },
  {
    icon: "🫧",
    title: "Boiled Before Baked",
    body: "Every bagel is hand-shaped and kettle-boiled in a honey-water bath before hitting the oven. That's what gives you the iconic chewy crust.",
  },
  {
    icon: "✋",
    title: "Made to Order",
    body: "We bake in small batches per pre-order session — so every bagel you get is freshly made, never sitting on a shelf.",
  },
];

export default function HomePage() {
  const { data: sessions = [], isLoading } = usePublicSessions();
  const openSession = getOpenSession(sessions);
  const closedSessions = getClosedSessions(sessions);

  return (
    <>
      {/* Hero */}
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center text-center">
          <p className="text-amber-500 font-semibold text-sm tracking-widest uppercase mb-2">
            Homemade · Small Batch
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
            Envien Bagel
          </h1>
          <p className="text-stone-500 mt-3 max-w-sm text-base">
            Sourdough bagels baked with wild yeast, slow fermentation, and a lot
            of love — available by pre-order only.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-14">
        {/* Open PO Section */}
        <section>
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            Current Pre-Order
          </h2>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner centered />
            </div>
          ) : openSession ? (
            <OpenPOBanner session={openSession} />
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center text-stone-400">
              <p className="text-3xl mb-2">😴</p>
              <p className="font-medium text-stone-600">
                No open pre-order right now
              </p>
              <p className="text-sm mt-1">
                Check back soon — we bake in small batches and open sessions
                periodically.
              </p>
            </div>
          )}
        </section>

        {/* Past Sessions Section */}
        {(isLoading || closedSessions.length > 0) && (
          <section>
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
              Past Pre-Orders
            </h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner centered />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {closedSessions.map((s) => (
                  <PastSessionCard key={s.id} session={s} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* About Sourdough Bagels */}
        <section>
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            What Makes It Special
          </h2>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            {/* Image placeholder */}
            <div className="w-full h-52 bg-amber-100 flex items-center justify-center">
              <div className="text-center text-amber-400">
                <p className="text-5xl">🥯</p>
                <p className="text-xs mt-2 font-medium tracking-wide uppercase">
                  Sourdough Bagels
                </p>
              </div>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-5">
              {BAGEL_FACTS.map((fact) => (
                <div key={fact.title} className="flex gap-3">
                  <span className="text-2xl shrink-0">{fact.icon}</span>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">
                      {fact.title}
                    </p>
                    <p className="text-stone-500 text-sm mt-0.5">{fact.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
