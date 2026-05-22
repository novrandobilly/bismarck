# Payment Instructions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface manual bank transfer payment details to customers across three touchpoints: the order success page, the session orders page banner, and a phone-verified bill modal.

**Architecture:** A shared `BANK_INFO` constant feeds all three touchpoints. A lightweight global modal system (`ModalProvider` + `useModal`) enables the bill modal from anywhere. The success page is reactivated with a new data hook; the session orders page gains a banner and per-row "View Bill" buttons that open the bill modal.

**Tech Stack:** React 19, TypeScript, TanStack Query, react-router-dom, PocketBase JS SDK, Tailwind v4

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/bankInfo.ts` | Create | Single source of truth for bank transfer details |
| `src/tools/formatRupiah.ts` | Create | Pure currency formatter (shared by success page + BillDetail) |
| `src/lib/modal/ModalContext.ts` | Create | React context type for open/close |
| `src/lib/modal/useModal.ts` | Create | Hook: `open(content)` / `close()` |
| `src/lib/modal/ModalProvider.tsx` | Create | Portal renderer + overlay |
| `src/main.tsx` | Modify | Add `ModalProvider` around `App` |
| `src/components/BillModal/hooks/useOrderBill.ts` | Create | Fetch order + expanded items for modal |
| `src/components/BillModal/hooks/useVerifyPhone.ts` | Create | Client-side last-4-digit phone verification state |
| `src/components/BillModal/features/PhonePrompt.tsx` | Create | State A: phone input UI |
| `src/components/BillModal/features/BillDetail.tsx` | Create | State B: itemised bill + bank info |
| `src/components/BillModal/index.tsx` | Create | Orchestrates phone→bill flow |
| `src/pages/session-orders/index.tsx` | Modify | Add payment banner + View Bill button to `OrderCard` |
| `src/pages/order/success/hooks/useOrderSuccess.ts` | Create | Fetch order + items for success page |
| `src/pages/order/success/index.tsx` | Rewrite | Show bill + payment info after ordering |
| `src/pages/order/index.tsx` | Modify | Change `onSuccess` to navigate to success page with `?orderId=` |

All commands run from `frontend/`.

---

## Task 1: Bank info constant + currency formatter

**Files:**
- Create: `src/lib/bankInfo.ts`
- Create: `src/tools/formatRupiah.ts`

- [ ] **Step 1: Create `src/lib/bankInfo.ts`**

```ts
export const BANK_INFO = {
  bank: 'BCA',
  accountNumber: '1234567890',
  accountHolder: 'Novrandobilly',
} as const
```

> ⚠️ Replace the placeholder values with the real bank account details before deploying.

- [ ] **Step 2: Create `src/tools/formatRupiah.ts`**

```ts
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
```

- [ ] **Step 3: Verify build**

```bash
yarn build
```

Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/bankInfo.ts src/tools/formatRupiah.ts
git commit -m "feat: add bank info constant and formatRupiah utility"
```

---

## Task 2: Global modal system

**Files:**
- Create: `src/lib/modal/ModalContext.ts`
- Create: `src/lib/modal/useModal.ts`
- Create: `src/lib/modal/ModalProvider.tsx`

- [ ] **Step 1: Create `src/lib/modal/ModalContext.ts`**

```ts
import { createContext } from 'react'
import type { ReactNode } from 'react'

export interface ModalContextValue {
  open: (content: ReactNode) => void
  close: () => void
}

export const ModalContext = createContext<ModalContextValue | null>(null)
```

- [ ] **Step 2: Create `src/lib/modal/useModal.ts`**

```ts
import { useContext } from 'react'
import { ModalContext } from './ModalContext'

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
```

- [ ] **Step 3: Create `src/lib/modal/ModalProvider.tsx`**

```tsx
import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ModalContext } from './ModalContext'

export function ModalProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null)

  const open = useCallback((c: ReactNode) => setContent(c), [])
  const close = useCallback(() => setContent(null), [])

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {content &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={close}
          >
            <div
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {content}
            </div>
          </div>,
          document.body,
        )}
    </ModalContext.Provider>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/modal/
git commit -m "feat: add global modal system (ModalProvider + useModal)"
```

---

## Task 3: Wire ModalProvider into the app

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Update `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ModalProvider } from '@/lib/modal/ModalProvider'
import './index.css'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <App />
      </ModalProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 2: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat: wrap app in ModalProvider"
```

---

## Task 4: BillModal — data + verification hooks

**Files:**
- Create: `src/components/BillModal/hooks/useOrderBill.ts`
- Create: `src/components/BillModal/hooks/useVerifyPhone.ts`

- [ ] **Step 1: Create `src/components/BillModal/hooks/useOrderBill.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Order } from '@/types/order'

async function fetchOrderBill(orderId: string): Promise<Order> {
  return pb.collection('orders').getOne<Order>(orderId, {
    expand: 'order_items(order).preorder_session_item.menu_item',
  })
}

export function useOrderBill(orderId: string | null) {
  return useQuery({
    queryKey: ['order-bill', orderId],
    queryFn: () => fetchOrderBill(orderId!),
    enabled: !!orderId,
  })
}
```

- [ ] **Step 2: Create `src/components/BillModal/hooks/useVerifyPhone.ts`**

```ts
import { useState } from 'react'

export function useVerifyPhone(whatsapp: string) {
  const [error, setError] = useState<string | null>(null)

  function verify(last4: string): boolean {
    const digits = whatsapp.replace(/\D/g, '')
    if (digits.endsWith(last4)) {
      setError(null)
      return true
    }
    setError("That doesn't match. Try again.")
    return false
  }

  return { verify, error }
}
```

- [ ] **Step 3: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/BillModal/hooks/
git commit -m "feat: add useOrderBill and useVerifyPhone hooks"
```

---

## Task 5: BillModal — PhonePrompt feature

**Files:**
- Create: `src/components/BillModal/features/PhonePrompt.tsx`

- [ ] **Step 1: Create `src/components/BillModal/features/PhonePrompt.tsx`**

```tsx
import { useState } from 'react'
import { BismarckButton } from '@/components/BismarckButton'

interface Props {
  onVerify: (last4: string) => void
  onCancel: () => void
  error: string | null
}

export function PhonePrompt({ onVerify, onCancel, error }: Props) {
  const [value, setValue] = useState('')

  return (
    <div className="p-6">
      <h2 className="font-bold text-stone-900 text-base mb-1">View Your Bill</h2>
      <p className="text-xs text-stone-400 mb-4">
        Enter the last 4 digits of your WhatsApp number to continue.
      </p>
      <input
        type="tel"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
        placeholder="_ _ _ _"
        className="w-full border border-stone-300 rounded-lg py-2.5 px-3 text-center text-xl tracking-widest font-bold text-stone-800 focus:outline-none focus:border-amber-400 mb-1"
      />
      <div className="h-4 mb-2">
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <BismarckButton
        size="full"
        onClick={() => onVerify(value)}
        disabled={value.length !== 4}
      >
        Verify →
      </BismarckButton>
      <button
        type="button"
        onClick={onCancel}
        className="w-full text-stone-400 text-sm py-2 mt-1 hover:text-stone-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/BillModal/features/PhonePrompt.tsx
git commit -m "feat: add PhonePrompt component for bill modal"
```

---

## Task 6: BillModal — BillDetail feature

**Files:**
- Create: `src/components/BillModal/features/BillDetail.tsx`

- [ ] **Step 1: Create `src/components/BillModal/features/BillDetail.tsx`**

```tsx
import { BANK_INFO } from '@/lib/bankInfo'
import { formatRupiah } from '@/tools/formatRupiah'
import type { Order, OrderItem } from '@/types/order'
import type { SessionItem } from '@/types/menu'

interface Props {
  order: Order
  onClose: () => void
}

export function BillDetail({ order, onClose }: Props) {
  const orderItems = (order.expand?.['order_items(order)'] ?? []) as OrderItem[]

  const total = orderItems.reduce((sum, oi) => {
    const price = (oi.expand?.preorder_session_item as SessionItem | undefined)?.price ?? 0
    return sum + price * oi.quantity
  }, 0)

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="font-bold text-stone-900 text-base">{order.customer_name} — Your Bill</h2>
        <p className="text-xs text-stone-400 capitalize">{order.fulfillment_type}</p>
      </div>

      <div className="border-t border-stone-100 pt-3 space-y-2 mb-3">
        {orderItems.map((oi) => {
          const si = oi.expand?.preorder_session_item as SessionItem | undefined
          const name = si?.expand?.menu_item?.name ?? 'Item'
          const price = si?.price ?? 0
          return (
            <div key={oi.id} className="flex justify-between text-sm">
              <span className="text-stone-600">{name} ×{oi.quantity}</span>
              <span className="font-medium text-stone-800">{formatRupiah(price * oi.quantity)}</span>
            </div>
          )
        })}
      </div>

      <div className="border-t border-stone-200 pt-3 flex justify-between mb-4">
        <span className="font-bold text-stone-900">Total</span>
        <span className="font-bold text-amber-500 text-base">{formatRupiah(total)}</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 leading-relaxed mb-4">
        <p className="font-bold mb-1">💳 Transfer to:</p>
        <p>{BANK_INFO.bank} · {BANK_INFO.accountNumber}</p>
        <p>a/n {BANK_INFO.accountHolder}</p>
        <p className="mt-1">Amount: <strong>{formatRupiah(total)}</strong></p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full text-stone-400 text-sm py-2 hover:text-stone-600 transition-colors"
      >
        Close
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/BillModal/features/BillDetail.tsx
git commit -m "feat: add BillDetail component showing itemised bill and payment info"
```

---

## Task 7: BillModal — orchestrator

**Files:**
- Create: `src/components/BillModal/index.tsx`

- [ ] **Step 1: Create `src/components/BillModal/index.tsx`**

```tsx
import { useState } from 'react'
import { useOrderBill } from './hooks/useOrderBill'
import { useVerifyPhone } from './hooks/useVerifyPhone'
import { PhonePrompt } from './features/PhonePrompt'
import { BillDetail } from './features/BillDetail'
import { useModal } from '@/lib/modal/useModal'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface Props {
  orderId: string
}

export function BillModal({ orderId }: Props) {
  const [verified, setVerified] = useState(false)
  const { close } = useModal()
  const { data: order, isLoading } = useOrderBill(orderId)
  const { verify, error } = useVerifyPhone(order?.whatsapp ?? '')

  function handleVerify(last4: string) {
    if (verify(last4)) setVerified(true)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!order) return null

  if (verified) {
    return <BillDetail order={order} onClose={close} />
  }

  return <PhonePrompt onVerify={handleVerify} onCancel={close} error={error} />
}
```

- [ ] **Step 2: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/BillModal/index.tsx
git commit -m "feat: add BillModal orchestrator (phone verify → bill detail)"
```

---

## Task 8: Session orders page — payment banner + View Bill button

**Files:**
- Modify: `src/pages/session-orders/index.tsx`

Add two things: (1) a payment banner above the order list, (2) a "View Bill →" button on each `OrderCard`. The existing masking (`maskName`, `maskPhone`) and all other row content remain untouched.

- [ ] **Step 1: Update `src/pages/session-orders/index.tsx`**

Add the imports at the top:

```tsx
import { useModal } from '@/lib/modal/useModal'
import { BillModal } from '@/components/BillModal'
import { BANK_INFO } from '@/lib/bankInfo'
```

Update `OrderCard` to accept and use an `onViewBill` prop:

```tsx
function OrderCard({
  order,
  index,
  onViewBill,
}: {
  order: Order
  index: number
  onViewBill: () => void
}) {
  const orderItems = (order.expand?.['order_items(order)'] ?? []) as OrderItem[]

  return (
    <div
      className={cn(
        'bg-white rounded-2xl px-5 py-4 flex items-start gap-4',
        order.is_fulfilled ? 'opacity-60' : '',
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
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                order.is_fulfilled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-50 text-amber-700',
              )}
            >
              {order.is_fulfilled ? '✓ Ready' : 'Processing'}
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
              const si = oi.expand?.preorder_session_item as SessionItem | undefined
              const name = si?.expand?.menu_item?.name ?? 'Item'
              return (
                <p key={oi.id} className="text-xs text-stone-500">
                  {oi.quantity}× {name}
                </p>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

Update `SessionOrdersPage` to add the payment banner and wire `onViewBill`:

```tsx
export default function SessionOrdersPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data, isLoading, isError } = useSessionOrdersPublic(sessionId)
  const { open } = useModal()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <LoadingSpinner centered />
      </div>
    )
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
    )
  }

  const { session, orders } = data
  const fulfilled = orders.filter((o) => o.is_fulfilled).length

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
                  width: orders.length ? `${(fulfilled / orders.length) * 100}%` : '0%',
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
            {BANK_INFO.bank} · <strong>{BANK_INFO.accountNumber}</strong> · a/n{' '}
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
  )
}
```

- [ ] **Step 2: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/session-orders/index.tsx
git commit -m "feat: add payment banner and View Bill button to session orders page"
```

---

## Task 9: Success page — useOrderSuccess hook

**Files:**
- Create: `src/pages/order/success/hooks/useOrderSuccess.ts`

- [ ] **Step 1: Create `src/pages/order/success/hooks/useOrderSuccess.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Order } from '@/types/order'

async function fetchOrderSuccess(orderId: string): Promise<Order> {
  return pb.collection('orders').getOne<Order>(orderId, {
    expand: 'order_items(order).preorder_session_item.menu_item',
  })
}

export function useOrderSuccess(orderId: string | null) {
  return useQuery({
    queryKey: ['order-success', orderId],
    queryFn: () => fetchOrderSuccess(orderId!),
    enabled: !!orderId,
    retry: false,
  })
}
```

- [ ] **Step 2: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/order/success/hooks/useOrderSuccess.ts
git commit -m "feat: add useOrderSuccess hook for success page data fetching"
```

---

## Task 10: Rewrite the order success page

**Files:**
- Rewrite: `src/pages/order/success/index.tsx`

The page reads `orderId` from the `?orderId=` query param and `sessionId` from the route param. It shows the full bill if the fetch succeeds; if `orderId` is missing or the fetch fails, it still shows the confirmation and payment info without the itemised breakdown.

- [ ] **Step 1: Rewrite `src/pages/order/success/index.tsx`**

```tsx
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useOrderSuccess } from './hooks/useOrderSuccess'
import { BANK_INFO } from '@/lib/bankInfo'
import { formatRupiah } from '@/tools/formatRupiah'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { OrderItem } from '@/types/order'
import type { SessionItem } from '@/types/menu'

export default function OrderSuccessPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const { data: order, isLoading } = useOrderSuccess(orderId)

  const orderItems = (order?.expand?.['order_items(order)'] ?? []) as OrderItem[]
  const total = orderItems.reduce((sum, oi) => {
    const price = (oi.expand?.preorder_session_item as SessionItem | undefined)?.price ?? 0
    return sum + price * oi.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-10">

        {/* Confirmation header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Order placed!</h1>
          {order && (
            <p className="text-stone-500 text-sm">
              Thanks, {order.customer_name}. We'll see you on fulfillment day.
            </p>
          )}
          {!order && !isLoading && (
            <p className="text-stone-500 text-sm">
              Your order has been received. Thank you!
            </p>
          )}
        </div>

        {/* Bill summary — shown when data is available */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && orderItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 mb-4">
            <p className="font-bold text-stone-800 text-sm mb-3">🧾 Your Order</p>
            <div className="space-y-2 mb-3">
              {orderItems.map((oi) => {
                const si = oi.expand?.preorder_session_item as SessionItem | undefined
                const name = si?.expand?.menu_item?.name ?? 'Item'
                const price = si?.price ?? 0
                return (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">{name} ×{oi.quantity}</span>
                    <span className="font-medium text-stone-800">{formatRupiah(price * oi.quantity)}</span>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-stone-100 pt-3 flex justify-between">
              <span className="font-bold text-stone-900">Total</span>
              <span className="font-bold text-amber-500 text-base">{formatRupiah(total)}</span>
            </div>
          </div>
        )}

        {/* Payment info */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-4">
          <p className="font-bold text-amber-900 text-sm mb-1">💳 Pay via bank transfer</p>
          <p className="text-amber-800 text-sm leading-relaxed">
            {BANK_INFO.bank} · <strong>{BANK_INFO.accountNumber}</strong>
            <br />a/n <strong>{BANK_INFO.accountHolder}</strong>
            {total > 0 && (
              <>
                <br />
                <span className="text-amber-700">
                  Amount: <strong>{formatRupiah(total)}</strong>
                </span>
              </>
            )}
          </p>
        </div>

        {/* Reassurance + CTA */}
        <p className="text-center text-xs text-stone-400 mb-4">
          Don't worry — you can always come back to see your order detail on the orders page.
        </p>
        {sessionId && (
          <Link
            to={`/session/${sessionId}/orders`}
            className="block bg-stone-900 hover:bg-stone-800 text-white text-center font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            See all orders for this session →
          </Link>
        )}

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/order/success/index.tsx
git commit -m "feat: rewrite success page with bill summary and payment instructions"
```

---

## Task 11: Wire up navigation to success page

**Files:**
- Modify: `src/pages/order/index.tsx`

Currently `onSuccess` navigates to `/session/${sessionId}/orders`. Change it to navigate to the success page with the order ID as a query param.

- [ ] **Step 1: Update the `onSubmit` handler in `src/pages/order/index.tsx`**

Change:

```ts
function onSubmit(values: OrderFormValues) {
  submitOrder({ sessionId: sessionId!, values }, {
    onSuccess: () => navigate(`/session/${sessionId}/orders`),
  })
}
```

To:

```ts
function onSubmit(values: OrderFormValues) {
  submitOrder({ sessionId: sessionId!, values }, {
    onSuccess: (orderId) => navigate(`/order/${sessionId}/success?orderId=${orderId}`),
  })
}
```

- [ ] **Step 2: Verify build**

```bash
yarn build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Verify lint**

```bash
yarn lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/order/index.tsx
git commit -m "feat: navigate to success page with orderId after order submission"
```

---

## Manual Smoke Test

After all tasks are complete, start the dev server and verify the full flow:

```bash
yarn dev
```

1. Open a session order URL: `http://localhost:5173/order/<sessionId>`
2. Place a test order → should land on `/order/<sessionId>/success?orderId=<id>` with your items and bank info visible
3. Click "See all orders for this session →" → should land on the orders page with the amber payment banner visible
4. Click "View Bill →" on any order → modal opens with phone prompt
5. Enter the correct last 4 digits → modal transitions to bill detail with items, total, and bank info
6. Enter wrong digits → inline error appears
7. Click backdrop or Cancel → modal closes
