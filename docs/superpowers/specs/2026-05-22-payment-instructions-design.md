# Payment Instructions Design

**Date:** 2026-05-22
**Scope:** Surfacing manual bank transfer payment info across the customer-facing order flow

---

## Context

Envien Bagel accepts payment via manual bank transfer. Until now, the app had no place to communicate this to customers. This spec covers three touchpoints where payment info will appear, plus a bill detail modal that lets customers verify their own order total.

Bank transfer details are hardcoded in the frontend (a single constant) — no admin configuration needed.

---

## Bank Info Constant

A single source of truth, exported from `src/lib/bankInfo.ts`:

```ts
export const BANK_INFO = {
  bank: 'BCA',
  accountNumber: '1234567890',
  accountHolder: 'Novrandobilly',
}
```

All three touchpoints import from this file.

---

## Touchpoint 1 — Order Success Page

**Route:** `/order/:sessionId/success`

Currently this page exists (`OrderSuccessPage`) but is unused — the order form navigates directly to the session orders page on success. This changes: after a successful order submission, navigate to `/order/:sessionId/success?orderId=<id>` instead.

**What the page shows:**
1. Confirmation header ("🎉 Order placed! Thanks, [name]. We'll see you on fulfillment day.")
2. Full itemised bill — fetched using the `orderId` query param (expand `order_items` → `preorder_session_item` → `menu_item`)
3. Bank transfer details with the exact total pre-filled
4. Reassurance copy: "Don't worry — you can always come back to see your order detail on the orders page."
5. CTA button: "See all orders for this session →" → `/session/:sessionId/orders`

No phone verification needed here — the customer just placed the order in this session.

**Data fetching:** A new hook `useOrderSuccess(orderId)` wraps a `useQuery` that fetches the order with expanded items. If `orderId` is missing or the fetch fails, fall back gracefully (show the confirmation + payment info without the bill breakdown).

---

## Touchpoint 2 — Session Orders Page Banner

**Route:** `/session/:sessionId/orders`

A persistent amber banner is added at the very top of the existing page content (above the order list). The existing order rows and their masking behaviour are untouched.

**Banner content:**
- Bank name, account number, account holder
- Secondary copy: "Forgot your bill details? No worries — tap **View Bill** next to your name below 👇"

**View Bill button:** Each existing order row gets a "View Bill →" amber button on the right side. Clicking it opens the Bill Modal (see below) for that order.

---

## Touchpoint 3 — Bill Modal

A modal triggered from the "View Bill →" button on the session orders page.

### Global modal system

A lightweight `ModalProvider` + `useModal` hook added to `src/lib/modal/`:

```
src/lib/modal/
  ModalProvider.tsx   # renders the portal + overlay; reads from modal context
  useModal.ts         # exposes open(content) and close()
  ModalContext.ts     # context definition
```

`ModalProvider` is added to `main.tsx` alongside `QueryClientProvider`. Components call `useModal().open(<SomeContent />)` to show arbitrary content in the modal, and `useModal().close()` to dismiss.

### Bill Modal component

Located at `src/components/BillModal/`:

```
BillModal/
  index.tsx               # orchestrates the two states
  features/
    PhonePrompt.tsx        # State A: last-4-digits input + Verify button
    BillDetail.tsx         # State B: itemised bill + bank transfer info
  hooks/
    useOrderBill.ts        # fetches order + items for a given orderId
    useVerifyPhone.ts      # validates last 4 digits against stored whatsapp field
```

**State A — Phone prompt:**
- Input: last 4 digits of the WhatsApp number used when ordering
- "Verify →" button
- Inline error if digits don't match: "That doesn't match. Try again."
- Validation is client-side: compare input against the last 4 chars of `order.whatsapp` (already fetched)
- Cancel button closes the modal

**State B — Bill detail (shown after successful verification):**
- Customer name (unmasked), fulfillment type
- Itemised list: item name × quantity → price
- Total
- Bank transfer details repeated, with exact amount highlighted
- Close button

No masking in State B — the customer has proven ownership.

---

## Data Model

No schema changes required. The `orders` collection already has:
- `whatsapp` — used for phone verification (last 4 digits)
- `customer_name`, `fulfillment_type`
- `expand['order_items(order)']` → `order_items` → `preorder_session_item` → `menu_item`

The `is_fulfilled` flag (already exists) continues to serve as the admin's payment/fulfillment tracker — no new field needed.

---

## Navigation Change

In `OrderPage` (`src/pages/order/index.tsx`), the `onSuccess` callback changes from:

```ts
onSuccess: () => navigate(`/session/${sessionId}/orders`)
```

to:

```ts
onSuccess: (orderId) => navigate(`/order/${sessionId}/success?orderId=${orderId}`)
```

`useSubmitOrder` already returns the created `order.id` — no mutation changes needed.

---

## File Summary

| File | Change |
|---|---|
| `src/lib/bankInfo.ts` | New — bank transfer constant |
| `src/lib/modal/ModalContext.ts` | New — modal context |
| `src/lib/modal/ModalProvider.tsx` | New — modal portal renderer |
| `src/lib/modal/useModal.ts` | New — open/close hook |
| `src/main.tsx` | Add `ModalProvider` wrapper |
| `src/pages/order/index.tsx` | Change `onSuccess` navigation target |
| `src/pages/order/success/index.tsx` | Rewrite — show bill + payment info |
| `src/pages/order/success/hooks/useOrderSuccess.ts` | New — fetch order with expanded items |
| `src/pages/session-orders/index.tsx` | Add payment banner + View Bill buttons |
| `src/components/BillModal/index.tsx` | New — modal orchestrator |
| `src/components/BillModal/features/PhonePrompt.tsx` | New — phone verification UI |
| `src/components/BillModal/features/BillDetail.tsx` | New — bill + payment detail UI |
| `src/components/BillModal/hooks/useOrderBill.ts` | New — fetch order + items |
| `src/components/BillModal/hooks/useVerifyPhone.ts` | New — client-side phone validation |
