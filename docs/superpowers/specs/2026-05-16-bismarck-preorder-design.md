# Bismarck — Sourdough Bagel Pre-order App Design

**Date:** 2026-05-16  
**Project:** Bismarck (named after the FFXIV restaurant in Limsa Lominsa)  
**Business:** Sourdough bagel pre-order business by Jack & Gita

---

## Overview

A lightweight web app for managing sourdough bagel pre-orders. Admins (Jack and Gita) create and manage pre-order sessions and share a public link with customers. Customers place orders without needing to create an account — just their name, WhatsApp number, and order details.

---

## Architecture

**Approach: Pure PocketBase BaaS** (same pattern as the mnemosyne project)

- Frontend talks directly to PocketBase via the official JS SDK
- PocketBase handles authentication, database, file storage, and API rules
- No custom backend server or middleware layer
- Session auto-close logic is handled on the frontend (checked when the order form loads)
- Public order routes are accessible without auth via PocketBase collection rules

### Frontend Stack

| Package | Purpose |
|---|---|
| React + Vite + TypeScript | Core framework |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Styling |
| React Router v7 | Routing |
| TanStack Query v5 | Server state, caching |
| React Hook Form | All forms (order form, session creation, menu management) |
| PocketBase JS SDK | DB + auth client |
| clsx + tailwind-merge | Conditional classnames |

### Folder Structure

Follow the mnemosyne pattern:
```
frontend/src/
  components/     # shared UI components
  features/       # feature-scoped components and hooks
    order/        # public order form
    sessions/     # admin session management
    menu/         # admin menu catalog
    auth/         # admin login
  lib/
    pocketbase/   # pb client singleton (index.ts)
  routes/         # route definitions and page components
  context/        # React context providers (auth, modal)
  tanstack/       # TanStack Query hooks
  utils/          # helpers
```

### Backend

PocketBase binary lives in `backend/`. Run it locally with `./backend/pocketbase serve`.

---

## Routes

### Public (no auth required)

| Route | Description |
|---|---|
| `/order/:sessionId` | Customer-facing pre-order form |
| `/order/:sessionId/success` | Order confirmation page |

### Admin (PocketBase auth required)

| Route | Description |
|---|---|
| `/bismarck/login` | Admin login (email + password) |
| `/bismarck/sessions` | Sessions dashboard — active + history |
| `/bismarck/sessions/new` | Create a new pre-order session |
| `/bismarck/sessions/:id` | Session detail — live order list and management |
| `/bismarck/menu` | Global menu catalog management |

The `/bismarck/` prefix acts as the codename for the admin area.

---

## Data Model (PocketBase Collections)

### `users` (built-in)
PocketBase's built-in auth collection. Admin accounts only (Jack and Gita). Email + password auth.

| Field | Type | Notes |
|---|---|---|
| email | string | PocketBase built-in |
| password | string | hashed, built-in |
| name | string | "Jack" or "Gita" |

---

### `menu_items`
Global catalog of all bagel/bread products.

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | ✓ | e.g. "Matcha", "Tiramisu" |
| description | text | | Shown to customers |
| default_price | number | ✓ | In IDR |
| category | string | ✓ | e.g. "sandwich bagel", "salt bread" — future-proofs new product lines |
| image | file | | Product photo, uploaded via PocketBase |
| is_active | bool | ✓ | Soft-delete / archive flag. False = hidden from session builder. Historical orders still intact. |

---

### `preorder_sessions`
A pre-order event/batch.

| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | ✓ | e.g. "Sourdough Bagels — Batch May 22" |
| description | text | | Shown to customers on the order form |
| fulfillment_date | date | ✓ | D-Day — when bagels are baked and ready |
| order_deadline | datetime | ✓ | Auto-closes session when this time is reached |
| max_orders | number | ✓ | Auto-closes when order count hits this cap |
| status | string | ✓ | `open` or `closed` |
| allow_pickup | bool | ✓ | |
| allow_delivery | bool | ✓ | |
| custom_locations | JSON | | Array of `{ name: string, time: string }` — custom drop-off spots, e.g. `[{ name: "Bundaran Senayan", time: "1:00 PM" }]` |

One active (open) session at a time is enforced in the UI — the "Create New Session" button on the dashboard is disabled with an explanatory message if a session with `status = open` already exists.

---

### `preorder_session_items`
Junction table linking menu items to a session, with per-session price override.

| Field | Type | Required | Notes |
|---|---|---|---|
| session | relation → preorder_sessions | ✓ | |
| menu_item | relation → menu_items | ✓ | |
| price | number | ✓ | Initialized from `menu_item.default_price`, can be overridden |
| is_available | bool | ✓ | Per-session toggle. True = shown on order form. |

---

### `orders`
A customer's pre-order submission.

| Field | Type | Required | Notes |
|---|---|---|---|
| session | relation → preorder_sessions | ✓ | |
| customer_name | string | ✓ | |
| whatsapp | string | ✓ | e.g. "08123456789" |
| fulfillment_type | string | ✓ | `pickup`, `delivery`, or `custom` |
| delivery_address | text | | Required when `fulfillment_type = delivery` |
| custom_location | string | | Name of the drop-off spot when `fulfillment_type = custom` |
| notes | text | | Optional customer notes |
| is_fulfilled | bool | ✓ | Default false. Admin toggles this on D-Day as orders are handed out. |
| created | datetime | | Auto-set by PocketBase |

---

### `order_items`
Individual line items within an order.

| Field | Type | Required | Notes |
|---|---|---|---|
| order | relation → orders | ✓ | |
| session_item | relation → preorder_session_items | ✓ | Price is read from preorder_session_items at display time (snapshotted in preorder_session_items) |
| quantity | number | ✓ | 1–5 per flavor |

---

## Key Behaviors

### Session Auto-close
When the public order form loads at `/order/:sessionId`, the frontend checks:
1. Is `session.status === 'closed'`?
2. Has `session.order_deadline` passed?
3. Has the order count reached `session.max_orders`?

If any condition is true, the form is replaced with a "This session is closed" message. The frontend does not auto-update `session.status` — that remains a manual admin action or is handled by checking on load.

### Order Submission
Orders are submitted without auth. PocketBase collection rules allow public `create` on `orders` and `order_items` for open sessions. The frontend validates that the session is still open before allowing submission.

### Fulfillment Type Logic
- `pickup` — no extra fields needed
- `delivery` — `delivery_address` field is shown and required
- `custom` — customer selects from the session's `custom_locations` list; `custom_location` stores the chosen location name

---

## UI Design Decisions

### Public Order Form (`/order/:sessionId`)
- **Layout:** Single scrollable page (mobile-first)
- **Header:** Dark banner with session title, soft green line for D-Day ("Ready on May 22"), amber block for deadline ("ORDER CLOSES · May 20 · 10 PM"), spots remaining. D-Day mentioned only once.
- **Menu section:** Rich list cards — 72×72px product thumbnail, name, description, price, inline +/− quantity selector (max 5 per item). Items with `is_available = false` are hidden.
- **Details section:** Name + WhatsApp number inputs (via React Hook Form)
- **Fulfillment section:** Radio-style cards for each enabled option. Delivery option shows a delivery fee warning. Custom locations show name + time.
- **Notes section:** Optional free text
- **CTA:** "Place Order 🥯" button

### Admin Session Detail (`/bismarck/sessions/:id`)
- **Top bar:** Session title, status badge, "Copy Link" button, "Close Session" button
- **Stats row:** Total orders, spots left, total bagels ordered, estimated revenue (sum of `quantity × session_item.price` across all order_items in the session), fulfilled/total count
- **Order list:** Table with customer name, WhatsApp, items ordered, fulfillment type, submission time, and a fulfillment toggle checkbox on the far right of each row
- **Fulfilled rows:** Struck-through text, green tint, reduced opacity
- **Fulfillment breakdown:** Pickup / Delivery / Custom drop-off counts below the table

### Admin Menu Catalog (`/bismarck/menu`)
- List of all menu items (active and inactive)
- Each item shows: 72×72px thumbnail, name, category, default price, `is_active` toggle
- "Add new item" button opens a form: name, description, category, default price, image upload
- Editing an existing item updates the global defaults (does not retroactively change prices on past sessions)

### Admin Session Creation (`/bismarck/sessions/new`)
- Four sections: Batch Info, Fulfillment Options, Menu for this Batch, Submit
- Custom drop-off locations are dynamic — add/remove rows of `{name, time}`
- Menu items shown as 72×72px thumbnail cards with toggle switch and price override input
- Toggled-off items are visually greyed out and price input is disabled

### Global Design Rule
- Product thumbnails are **72×72px** minimum across all screens
- Primary color: `#1c1917` (warm near-black) — consistent with artisan bakery feel

---

## PocketBase Collection Rules (Summary)

| Collection | List/View | Create | Update | Delete |
|---|---|---|---|---|
| menu_items | admins only | admins only | admins only | admins only |
| preorder_sessions | public (read open) | admins only | admins only | admins only |
| preorder_session_items | public | admins only | admins only | admins only |
| orders | admins only | public (open sessions) | admins only (is_fulfilled) | admins only |
| order_items | admins only | public (open sessions) | none | none |

---

## Out of Scope (for now)

- Payment processing — delivery fee is communicated verbally/via WhatsApp
- Customer order history / lookup
- Email/SMS notifications
- Analytics beyond the session detail stats
- Multiple simultaneous open sessions (enforced by UI convention only)
