import { useParams, useNavigate } from "react-router-dom";
import { useSessionDetail } from "./hooks/useSessionDetail";
import { useToggleFulfilled } from "./hooks/useToggleFulfilled";
import { useCloseSession } from "./hooks/useCloseSession";
import { useMarkAllFulfilled } from "./hooks/useMarkAllFulfilled";
import { StatsRow } from "./features/StatsRow";
import { OrderTable } from "./features/OrderTable";
import { FulfillmentBreakdown } from "./features/FulfillmentBreakdown";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Order } from "@/types/order";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useSessionDetail(id);
  const { mutate: toggleFulfilled, isPending: isToggling } =
    useToggleFulfilled(id);
  const { mutate: closeSession, isPending: isClosing } = useCloseSession();
  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllFulfilled(id);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <LoadingSpinner centered />
      </div>
    );
  }

  const { session, orders } = data;
  const isOpen = session.status === "open";
  const shareUrl = `${window.location.origin}/order/${session.id}`;

  function handleToggle(order: Order) {
    toggleFulfilled({ orderId: order.id, is_fulfilled: !order.is_fulfilled });
  }

  function handleClose() {
    if (!confirm("Close this session? No more orders will be accepted."))
      return;
    closeSession(session.id);
  }

  const allDone = orders.length > 0 && orders.every(o => o.is_fulfilled)

  function handleMarkAll() {
    markAll({ orders, is_fulfilled: !allDone })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate("/bismarck/sessions")}
              className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-2 flex items-center gap-1"
            >
              ← Sessions
            </button>
            <h1 className="text-2xl font-bold text-stone-800">
              {session.title}
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              Ready:{" "}
              {new Date(session.fulfillment_date).toLocaleDateString("en-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${isOpen ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}
            >
              {isOpen ? "Open" : "Closed"}
            </span>
            {isOpen && (
              <button
                onClick={handleClose}
                disabled={isClosing}
                className="cursor-pointer text-xs text-red-500 hover:underline disabled:opacity-60"
              >
                Close session
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-sm text-amber-700 flex-1 truncate">
              {shareUrl}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="cursor-pointer text-xs text-amber-600 hover:underline shrink-0"
            >
              Copy link
            </button>
          </div>
        )}

        <StatsRow orders={orders} />

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-stone-800">Orders</h2>
          {orders.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={isMarkingAll}
              className={`cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:opacity-60 ${
                allDone
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {isMarkingAll ? '…' : allDone ? '✓ All Done — Unmark All' : 'Mark All Done'}
            </button>
          )}
        </div>
        <OrderTable
          orders={orders}
          onToggleFulfilled={handleToggle}
          isToggling={isToggling}
        />

        <FulfillmentBreakdown orders={orders} />
      </div>
    </div>
  );
}
