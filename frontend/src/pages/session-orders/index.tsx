import { useParams, Link } from "react-router-dom";
import { useSessionOrdersPublic } from "./hooks/useSessionOrdersPublic";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Order, OrderItem } from "@/types/order";
import type { SessionItem } from "@/types/menu";
import { cn } from "@/lib/utils/cn";
import { useModal } from "@/lib/modal/useModal";
import { BillModal } from "@/components/BillModal";
import { BANK_INFO } from "@/lib/bankInfo";

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 2) return part;
      return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
    })
    .join(" ");
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 2) return "**";
  return "*".repeat(digits.length - 2) + digits.slice(-2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OrderCard({
  order,
  index,
  onViewBill,
}: {
  order: Order;
  index: number;
  onViewBill: () => void;
}) {
  const orderItems = (order.expand?.["order_items(order)"] ??
    []) as OrderItem[];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl px-5 py-4 flex items-start gap-4",
        order.is_fulfilled ? "opacity-60" : "",
      )}
    >
      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-stone-800 text-sm">
              {maskName(order.customer_name)}
            </p>
            <p className="text-stone-400 text-xs mt-0.5">
              {maskPhone(order.whatsapp)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                order.is_fulfilled
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {order.is_fulfilled ? "✓ Ready" : "Processing"}
            </span>
            <button
              type="button"
              onClick={onViewBill}
              className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-full transition-colors"
            >
              View Bill →
            </button>
          </div>
        </div>
        {orderItems.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {orderItems.map((oi) => {
              const si = oi.expand?.preorder_session_item as
                | SessionItem
                | undefined;
              const name = si?.expand?.menu_item?.name ?? "Item";
              return (
                <p key={oi.id} className="text-xs text-stone-500">
                  {oi.quantity}× {name}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionOrdersPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data, isLoading, isError } = useSessionOrdersPublic(sessionId);
  const { open } = useModal();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <LoadingSpinner centered />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 text-center">
        <div>
          <p className="text-3xl mb-2">😕</p>
          <p className="text-stone-600 font-medium">Session not found</p>
          <Link
            to="/"
            className="text-amber-600 text-sm mt-2 inline-block hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const { session, orders } = data;
  const fulfilled = orders.filter((o) => o.is_fulfilled).length;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header — unchanged */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-xs text-stone-400 hover:text-stone-600 mb-3 inline-flex items-center gap-1"
          >
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-stone-800">{session.title}</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Pick-up: {formatDate(session.fulfillment_date)}
          </p>
        </div>

        {/* Summary bar — unchanged */}
        <div className="bg-white rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-extrabold text-stone-800">{orders.length}</p>
            <p className="text-xs text-stone-400 mt-0.5">Total orders</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-green-600">{fulfilled}</p>
            <p className="text-xs text-stone-400 mt-0.5">Ready for pickup</p>
          </div>
          <div className="flex-1 max-w-30">
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{
                  width: orders.length ? `${(fulfilled / orders.length) * 100}%` : "0%",
                }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-1 text-right">
              {orders.length ? Math.round((fulfilled / orders.length) * 100) : 0}% ready
            </p>
          </div>
        </div>

        {/* Payment banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
          <p className="font-bold text-amber-900 text-sm mb-1">💳 How to Pay</p>
          <p className="text-amber-800 text-sm leading-relaxed">
            {BANK_INFO.bank} · <strong>{BANK_INFO.accountNumber}</strong> · a/n{" "}
            <strong>{BANK_INFO.accountHolder}</strong>
          </p>
          <p className="text-amber-700 text-xs mt-1">
            Forgot your bill details? No worries — tap <strong>View Bill</strong> next to your name below 👇
          </p>
        </div>

        {/* Order list */}
        {orders.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-4xl mb-3">🥯</p>
            <p className="font-medium text-stone-600">No orders yet</p>
            <p className="text-sm mt-1">Be the first to order!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
              Order List
            </p>
            {orders.map((order, i) => (
              <OrderCard
                key={order.id}
                order={order}
                index={i}
                onViewBill={() => open(<BillModal orderId={order.id} />)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
