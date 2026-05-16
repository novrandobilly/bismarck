# Bismarck Pre-Order App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a sourdough bagel pre-order web app with a public order form (no login) and an admin area at `/bismarck/*` for Jack & Gita to manage sessions and menu items.

**Architecture:** React + Vite + TypeScript frontend using PocketBase as a pure BaaS (no custom backend). All business logic lives in custom hooks; components are pure UI. Route prefix `/bismarck/*` for admin, `/order/:sessionId` for public.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), PocketBase JS SDK, TanStack Query v5, React Hook Form, Zod, React Router DOM v6, clsx + tailwind-merge.

---

## File Map

See the plan document for the full file structure.

---

## Task 1: Install Dependencies + Foundation

**Files:**
- Modify: `frontend/package.json` (yarn add)
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/tsconfig.app.json`
- Create: `frontend/src/lib/pocketbase/index.ts`
- Create: `frontend/src/lib/utils/cn.ts`
- Create: `frontend/.env.local`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Install all runtime dependencies**

```bash
cd frontend
yarn add pocketbase @tanstack/react-query react-hook-form @hookform/resolvers zod react-router-dom clsx tailwind-merge
```

- [ ] **Step 2: Add path alias to vite.config.ts**

Replace the entire file:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add types for path and update tsconfig**

```bash
cd frontend && yarn add -D @types/node
```

In `frontend/tsconfig.app.json`, inside `compilerOptions`, add:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}
```

- [ ] **Step 4: Create PocketBase singleton**

Create `frontend/src/lib/pocketbase/index.ts`:

```ts
import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
pb.autoCancellation(false)
```

- [ ] **Step 5: Create cn utility**

Create `frontend/src/lib/utils/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 6: Create .env.local**

Create `frontend/.env.local`:

```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

- [ ] **Step 7: Clean src/index.css**

Replace the entire file:

```css
@import "tailwindcss";
```

- [ ] **Step 8: Verify build compiles**

```bash
cd frontend && yarn build
```

Expected: `dist/` generated, no TypeScript errors.

---

## Task 2: PocketBase Collections Setup (Manual Steps)

> This task is a setup guide. Download PocketBase, run it, and create all collections via the admin UI at `http://127.0.0.1:8090/_/`.

- [ ] **Step 1: Download PocketBase**

```bash
mkdir -p backend && cd backend
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.18/pocketbase_0.22.18_darwin_arm64.zip -o pb.zip
unzip pb.zip && rm pb.zip
```

- [ ] **Step 2: Start PocketBase**

```bash
cd backend && ./pocketbase serve
```

Open `http://127.0.0.1:8090/_/` and create an admin account.

- [ ] **Step 3: Create `menu_items` collection**

Fields: `name` (Text, required), `description` (Text), `default_price` (Number, required, min 0), `category` (Text), `image` (File, single, images only), `is_active` (Bool, default true).

API Rules: List/View/Create/Update/Delete all require `@request.auth.id != ""`

- [ ] **Step 4: Create `sessions` collection**

Fields: `title` (Text, required), `description` (Text), `fulfillment_date` (Date, required), `order_deadline` (Date, required), `max_orders` (Number, default 0), `status` (Select: open/closed, default open), `allow_pickup` (Bool, default true), `allow_delivery` (Bool, default false), `custom_locations` (JSON, default []).

API Rules: List/View empty (public). Create/Update/Delete require `@request.auth.id != ""`

- [ ] **Step 5: Create `session_items` collection**

Fields: `session` (Relation → sessions, required), `menu_item` (Relation → menu_items, required), `price` (Number, required), `is_available` (Bool, default true).

API Rules: List/View empty (public). Create/Update/Delete require `@request.auth.id != ""`

- [ ] **Step 6: Create `orders` collection**

Fields: `session` (Relation → sessions, required), `customer_name` (Text, required), `whatsapp` (Text, required), `fulfillment_type` (Select: pickup/delivery/custom, required), `delivery_address` (Text), `custom_location` (Text), `notes` (Text), `is_fulfilled` (Bool, default false).

API Rules: List/View/Update/Delete require `@request.auth.id != ""`. Create is empty (public).

- [ ] **Step 7: Create `order_items` collection**

Fields: `order` (Relation → orders, required), `session_item` (Relation → session_items, required), `quantity` (Number, required, min 1).

API Rules: List/View/Delete require `@request.auth.id != ""`. Create is empty (public). Update deny (set `@request.auth.id = ""` to block).

---

## Task 3: App Shell — Router + Providers + Stub Pages

**Files:**
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/router/index.tsx`
- Create: `frontend/src/router/ProtectedRoute.tsx`
- Create: `frontend/src/types/menu.ts`
- Create: `frontend/src/types/session.ts`
- Create: `frontend/src/types/order.ts`
- Create: stub page files

- [ ] **Step 1: Create shared types**

Create `frontend/src/types/menu.ts`:

```ts
export interface MenuItem {
  id: string
  name: string
  description: string
  default_price: number
  category: string
  image: string
  is_active: boolean
  collectionId: string
  collectionName: string
}

export interface SessionItem {
  id: string
  session: string
  menu_item: string
  price: number
  is_available: boolean
  expand?: {
    menu_item?: MenuItem
  }
}
```

Create `frontend/src/types/session.ts`:

```ts
export type SessionStatus = 'open' | 'closed'

export interface CustomLocation {
  name: string
  time: string
}

export interface Session {
  id: string
  title: string
  description: string
  fulfillment_date: string
  order_deadline: string
  max_orders: number
  status: SessionStatus
  allow_pickup: boolean
  allow_delivery: boolean
  custom_locations: CustomLocation[]
}
```

Create `frontend/src/types/order.ts`:

```ts
export type FulfillmentType = 'pickup' | 'delivery' | 'custom'

export interface Order {
  id: string
  session: string
  customer_name: string
  whatsapp: string
  fulfillment_type: FulfillmentType
  delivery_address: string
  custom_location: string
  notes: string
  is_fulfilled: boolean
  expand?: {
    'order_items(order)'?: OrderItem[]
  }
}

export interface OrderItem {
  id: string
  order: string
  session_item: string
  quantity: number
  expand?: {
    session_item?: import('./menu').SessionItem
  }
}

export interface OrderItemFormValue {
  session_item_id: string
  quantity: number
}

export interface OrderFormValues {
  customer_name: string
  whatsapp: string
  fulfillment_type: FulfillmentType
  delivery_address: string
  custom_location: string
  notes: string
  items: OrderItemFormValue[]
}
```

- [ ] **Step 2: Create ProtectedRoute**

Create `frontend/src/router/ProtectedRoute.tsx`:

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { pb } from '@/lib/pocketbase'

export function ProtectedRoute() {
  if (!pb.authStore.isValid) {
    return <Navigate to="/bismarck/login" replace />
  }
  return <Outlet />
}
```

- [ ] **Step 3: Create stub pages**

Create `frontend/src/pages/bismarck/login/index.tsx`:
```tsx
export default function LoginPage() { return <div>Login Page</div> }
```

Create `frontend/src/pages/not-found/index.tsx`:
```tsx
export default function NotFoundPage() { return <div>404</div> }
```

Create `frontend/src/features/menu/MenuCatalogPage.tsx`:
```tsx
export default function MenuCatalogPage() { return <div>Menu Catalog</div> }
```

Create `frontend/src/features/sessions/SessionsDashboardPage.tsx`:
```tsx
export default function SessionsDashboardPage() { return <div>Sessions Dashboard</div> }
```

Create `frontend/src/features/sessions/SessionNewPage.tsx`:
```tsx
export default function SessionNewPage() { return <div>New Session</div> }
```

Create `frontend/src/features/sessions/SessionDetailPage.tsx`:
```tsx
export default function SessionDetailPage() { return <div>Session Detail</div> }
```

Create `frontend/src/features/order/OrderPage.tsx`:
```tsx
export default function OrderPage() { return <div>Order Page</div> }
```

Create `frontend/src/features/order/OrderSuccessPage.tsx`:
```tsx
export default function OrderSuccessPage() { return <div>Order Success</div> }
```

- [ ] **Step 4: Create router**

Create `frontend/src/router/index.tsx`:

```tsx
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import LoginPage from '@/pages/bismarck/login'
import NotFoundPage from '@/pages/not-found'
import MenuCatalogPage from '@/features/menu/MenuCatalogPage'
import SessionsDashboardPage from '@/features/sessions/SessionsDashboardPage'
import SessionNewPage from '@/features/sessions/SessionNewPage'
import SessionDetailPage from '@/features/sessions/SessionDetailPage'
import OrderPage from '@/features/order/OrderPage'
import OrderSuccessPage from '@/features/order/OrderSuccessPage'

export const router = createBrowserRouter([
  { path: '/bismarck/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/bismarck/sessions', element: <SessionsDashboardPage /> },
      { path: '/bismarck/sessions/new', element: <SessionNewPage /> },
      { path: '/bismarck/sessions/:id', element: <SessionDetailPage /> },
      { path: '/bismarck/menu', element: <MenuCatalogPage /> },
    ],
  },
  { path: '/order/:sessionId', element: <OrderPage /> },
  { path: '/order/:sessionId/success', element: <OrderSuccessPage /> },
  { path: '*', element: <NotFoundPage /> },
])
```

- [ ] **Step 5: Wire router into App.tsx and main.tsx**

Replace `frontend/src/App.tsx`:

```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'

export default function App() {
  return <RouterProvider router={router} />
}
```

Replace `frontend/src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 6: Verify dev server starts clean**

```bash
cd frontend && yarn dev
```

Open `http://localhost:5173/bismarck/login` — renders "Login Page".
Open `http://localhost:5173/order/test123` — renders "Order Page".
Open `http://localhost:5173/bismarck/sessions` — redirects to `/bismarck/login`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src frontend/vite.config.ts frontend/tsconfig.app.json frontend/.env.local
git commit -m "feat: app shell — router, providers, types, stub pages"
```

---

## Task 4: Auth Feature — Login Page

**Files:**
- Create: `frontend/src/features/auth/hooks/useAdminLogin/index.ts`
- Modify: `frontend/src/pages/bismarck/login/index.tsx`

- [ ] **Step 1: Create useAdminLogin hook**

Create `frontend/src/features/auth/hooks/useAdminLogin/index.ts`:

```ts
import { useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

interface LoginInput {
  email: string
  password: string
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      pb.admins.authWithPassword(email, password),
  })
}
```

- [ ] **Step 2: Build Login page**

Replace `frontend/src/pages/bismarck/login/index.tsx`:

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { pb } from '@/lib/pocketbase'
import { useAdminLogin } from '@/features/auth/hooks/useAdminLogin'
import { cn } from '@/lib/utils/cn'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending, error } = useAdminLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (pb.authStore.isValid) navigate('/bismarck/sessions', { replace: true })
  }, [navigate])

  function onSubmit(values: FormValues) {
    login(values, {
      onSuccess: () => navigate('/bismarck/sessions', { replace: true }),
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Bismarck</h1>
        <p className="text-stone-500 text-sm mb-6">Admin Login</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className={cn(
                'w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400',
                errors.email ? 'border-red-400' : 'border-stone-300',
              )}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className={cn(
                'w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400',
                errors.password ? 'border-red-400' : 'border-stone-300',
              )}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          {error && <p className="text-red-500 text-sm">Invalid email or password.</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2 transition-colors"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify login flow**

Start PocketBase and dev server. Test at `http://localhost:5173/bismarck/login`:
- Empty submit → validation errors
- Wrong credentials → "Invalid email or password"
- Correct credentials → redirect to `/bismarck/sessions`
- Refresh on sessions → stays (auth persisted)
- Visit login while authed → redirects to sessions

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/auth frontend/src/pages/bismarck/login
git commit -m "feat: admin login page with RHF + Zod"
```

---

## Task 5: Shared UI Components

**Files:**
- Create: `frontend/src/components/ProductThumbnail.tsx`
- Create: `frontend/src/components/QuantitySelector.tsx`

- [ ] **Step 1: Create ProductThumbnail**

Create `frontend/src/components/ProductThumbnail.tsx`:

```tsx
import { pb } from '@/lib/pocketbase'
import type { MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils/cn'

interface Props {
  item: Pick<MenuItem, 'id' | 'image' | 'name' | 'collectionId' | 'collectionName'>
  className?: string
}

export function ProductThumbnail({ item, className }: Props) {
  const src = item.image
    ? pb.files.getURL(item as Parameters<typeof pb.files.getURL>[0], item.image, { thumb: '144x144' })
    : null

  return (
    <div className={cn('w-36 h-36 rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center shrink-0', className)}>
      {src ? (
        <img src={src} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-5xl" role="img" aria-label={item.name}>🥯</span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create QuantitySelector**

Create `frontend/src/components/QuantitySelector.tsx`:

```tsx
import { cn } from '@/lib/utils/cn'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantitySelector({ value, onChange, min = 0, max, className }: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => { if (value > (min ?? 0)) onChange(value - 1) }}
        disabled={value <= (min ?? 0)}
        className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 disabled:opacity-40 hover:bg-stone-100 transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => { if (max === undefined || value < max) onChange(value + 1) }}
        disabled={max !== undefined && value >= max}
        className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 disabled:opacity-40 hover:bg-stone-100 transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components
git commit -m "feat: shared ProductThumbnail and QuantitySelector components"
```

---

## Task 6: Public Order — useSession Hook + Session Guard

**Files:**
- Create: `frontend/src/features/order/hooks/useSession/index.ts`
- Modify: `frontend/src/features/order/OrderPage.tsx`

- [ ] **Step 1: Create useSession hook**

Create `frontend/src/features/order/hooks/useSession/index.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Session } from '@/types/session'
import type { SessionItem } from '@/types/menu'

export interface SessionData {
  session: Session
  sessionItems: SessionItem[]
  orderCount: number
}

async function fetchSession(sessionId: string): Promise<SessionData> {
  const [session, sessionItemsResult, orderCountResult] = await Promise.all([
    pb.collection('sessions').getOne<Session>(sessionId),
    pb.collection('session_items').getList<SessionItem>(1, 200, {
      filter: `session = "${sessionId}" && is_available = true`,
      expand: 'menu_item',
      sort: '+menu_item.name',
    }),
    pb.collection('orders').getList(1, 1, {
      filter: `session = "${sessionId}"`,
      fields: 'id',
    }),
  ])
  return { session, sessionItems: sessionItemsResult.items, orderCount: orderCountResult.totalItems }
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(sessionId),
    retry: false,
  })
}
```

- [ ] **Step 2: Create session closed guard in OrderPage**

Replace `frontend/src/features/order/OrderPage.tsx`:

```tsx
import { useParams } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import type { Session } from '@/types/session'

function isSessionClosed(session: Session, orderCount: number): boolean {
  if (session.status === 'closed') return true
  if (new Date() > new Date(session.order_deadline)) return true
  if (session.max_orders > 0 && orderCount >= session.max_orders) return true
  return false
}

export default function OrderPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data, isLoading, error } = useSession(sessionId!)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500">Loading order form...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-stone-700 mb-2">Session Not Found</p>
          <p className="text-stone-500">This pre-order link is invalid or has been removed.</p>
        </div>
      </div>
    )
  }

  if (isSessionClosed(data.session, data.orderCount)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-stone-700 mb-2">Pre-Order Closed</p>
          <p className="text-stone-500">This pre-order session is no longer accepting orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <p className="text-stone-400">Order form coming in next task...</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Open `/order/INVALID_ID` → "Session Not Found". Open `/order/VALID_OPEN_SESSION_ID` → placeholder. Set session `status` to `closed` in PocketBase UI → "Pre-Order Closed".

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/order/hooks frontend/src/features/order/OrderPage.tsx
git commit -m "feat: public order page — session fetch and closed state guard"
```

---

## Task 7: Public Order — SessionHeader + useOrderForm + MenuSection

**Files:**
- Create: `frontend/src/features/order/hooks/useOrderForm/index.ts`
- Create: `frontend/src/features/order/components/SessionHeader.tsx`
- Create: `frontend/src/features/order/components/MenuItemCard.tsx`
- Create: `frontend/src/features/order/components/MenuSection.tsx`
- Modify: `frontend/src/features/order/OrderPage.tsx`

- [ ] **Step 1: Create useOrderForm hook**

Create `frontend/src/features/order/hooks/useOrderForm/index.ts`:

```ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import type { SessionItem } from '@/types/menu'
import type { OrderFormValues } from '@/types/order'

const schema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  whatsapp: z.string().min(5, 'WhatsApp number is required'),
  fulfillment_type: z.enum(['pickup', 'delivery', 'custom']),
  delivery_address: z.string().optional().default(''),
  custom_location: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  items: z.array(z.object({
    session_item_id: z.string(),
    quantity: z.number().int().min(0),
  })),
}).superRefine((val, ctx) => {
  if (val.fulfillment_type === 'delivery' && !val.delivery_address) {
    ctx.addIssue({ code: 'custom', path: ['delivery_address'], message: 'Delivery address is required' })
  }
  if (val.fulfillment_type === 'custom' && !val.custom_location) {
    ctx.addIssue({ code: 'custom', path: ['custom_location'], message: 'Please select a drop-off location' })
  }
  if (!val.items.some(i => i.quantity > 0)) {
    ctx.addIssue({ code: 'custom', path: ['items'], message: 'Please add at least one item to your order' })
  }
})

export function useOrderForm(sessionItems: SessionItem[]) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: '',
      whatsapp: '',
      fulfillment_type: 'pickup',
      delivery_address: '',
      custom_location: '',
      notes: '',
      items: [],
    },
  })

  useEffect(() => {
    if (sessionItems.length > 0) {
      form.setValue('items', sessionItems.map(si => ({ session_item_id: si.id, quantity: 0 })))
    }
  }, [sessionItems, form])

  return form
}
```

- [ ] **Step 2: Create SessionHeader**

Create `frontend/src/features/order/components/SessionHeader.tsx`:

```tsx
import type { Session } from '@/types/session'

interface Props { session: Session }

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
```

- [ ] **Step 3: Create MenuItemCard**

Create `frontend/src/features/order/components/MenuItemCard.tsx`:

```tsx
import type { SessionItem } from '@/types/menu'
import { ProductThumbnail } from '@/components/ProductThumbnail'
import { QuantitySelector } from '@/components/QuantitySelector'

interface Props {
  sessionItem: SessionItem
  quantity: number
  onChangeQuantity: (qty: number) => void
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

export function MenuItemCard({ sessionItem, quantity, onChangeQuantity }: Props) {
  const menuItem = sessionItem.expand?.menu_item
  if (!menuItem) return null

  return (
    <div className="flex gap-4 items-start py-4 border-b border-stone-100 last:border-0">
      <ProductThumbnail item={menuItem} />
      <div className="flex-1 min-w-0 pt-1">
        <p className="font-semibold text-stone-800 text-sm leading-snug">{menuItem.name}</p>
        {menuItem.description && <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{menuItem.description}</p>}
        <p className="text-amber-600 font-medium text-sm mt-1">{formatPrice(sessionItem.price)}</p>
        <div className="mt-2">
          <QuantitySelector value={quantity} onChange={onChangeQuantity} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create MenuSection**

Create `frontend/src/features/order/components/MenuSection.tsx`:

```tsx
import type { SessionItem } from '@/types/menu'
import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import { MenuItemCard } from './MenuItemCard'

interface Props {
  sessionItems: SessionItem[]
  form: UseFormReturn<OrderFormValues>
}

export function MenuSection({ sessionItems, form }: Props) {
  const items = form.watch('items')
  const itemsError = form.formState.errors.items

  function getQuantity(sessionItemId: string): number {
    return items.find(i => i.session_item_id === sessionItemId)?.quantity ?? 0
  }

  function handleChange(sessionItemId: string, qty: number) {
    form.setValue('items', items.map(i =>
      i.session_item_id === sessionItemId ? { ...i, quantity: qty } : i,
    ), { shouldValidate: false })
  }

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-1">Menu</h2>
      {itemsError && typeof itemsError === 'object' && 'message' in itemsError && (
        <p className="text-red-500 text-xs mb-2">{(itemsError as { message?: string }).message}</p>
      )}
      <div className="bg-white rounded-2xl shadow-sm px-4">
        {sessionItems.map(si => (
          <MenuItemCard
            key={si.id}
            sessionItem={si}
            quantity={getQuantity(si.id)}
            onChangeQuantity={(qty) => handleChange(si.id, qty)}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Wire into OrderPage**

Replace `frontend/src/features/order/OrderPage.tsx` (keep `isSessionClosed` helper, add imports and expand the return):

```tsx
import { useParams } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import { useOrderForm } from './hooks/useOrderForm'
import { SessionHeader } from './components/SessionHeader'
import { MenuSection } from './components/MenuSection'
import type { Session } from '@/types/session'

function isSessionClosed(session: Session, orderCount: number): boolean {
  if (session.status === 'closed') return true
  if (new Date() > new Date(session.order_deadline)) return true
  if (session.max_orders > 0 && orderCount >= session.max_orders) return true
  return false
}

export default function OrderPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data, isLoading, error } = useSession(sessionId!)
  const form = useOrderForm(data?.sessionItems ?? [])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50"><p className="text-stone-500">Loading order form...</p></div>
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-stone-700 mb-2">Session Not Found</p>
          <p className="text-stone-500">This pre-order link is invalid or has been removed.</p>
        </div>
      </div>
    )
  }

  if (isSessionClosed(data.session, data.orderCount)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-stone-700 mb-2">Pre-Order Closed</p>
          <p className="text-stone-500">This pre-order session is no longer accepting orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <SessionHeader session={data.session} />
        <form>
          <MenuSection sessionItems={data.sessionItems} form={form} />
          <p className="text-stone-400 text-sm">Customer details coming in next task...</p>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify in browser**

Open a valid open session URL. Should render session title, green D-Day badge, amber deadline badge, menu items with thumbnails and +/- controls. Adjusting quantities updates in real time.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/order
git commit -m "feat: order form — session header, menu section with qty selectors"
```

---

## Task 8: Public Order — CustomerDetails + FulfillmentSection + NotesSection

**Files:**
- Create: `frontend/src/features/order/components/CustomerDetails.tsx`
- Create: `frontend/src/features/order/components/FulfillmentSection.tsx`
- Create: `frontend/src/features/order/components/NotesSection.tsx`
- Modify: `frontend/src/features/order/OrderPage.tsx`

- [ ] **Step 1: Create CustomerDetails**

Create `frontend/src/features/order/components/CustomerDetails.tsx`:

```tsx
import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import { cn } from '@/lib/utils/cn'

interface Props { form: UseFormReturn<OrderFormValues> }

export function CustomerDetails({ form }: Props) {
  const { register, formState: { errors } } = form
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-3">Your Details</h2>
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
          <input
            {...register('customer_name')}
            type="text"
            placeholder="Your full name"
            className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.customer_name ? 'border-red-400' : 'border-stone-300')}
          />
          {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp Number</label>
          <input
            {...register('whatsapp')}
            type="tel"
            placeholder="e.g. 08123456789"
            className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.whatsapp ? 'border-red-400' : 'border-stone-300')}
          />
          {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create FulfillmentSection**

Create `frontend/src/features/order/components/FulfillmentSection.tsx`:

```tsx
import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import type { Session, CustomLocation } from '@/types/session'
import { cn } from '@/lib/utils/cn'

interface Props {
  form: UseFormReturn<OrderFormValues>
  session: Session
}

export function FulfillmentSection({ form, session }: Props) {
  const { register, watch, formState: { errors } } = form
  const fulfillmentType = watch('fulfillment_type')

  const options = [
    { value: 'pickup' as const, label: '🛍 Self Pickup', enabled: session.allow_pickup },
    { value: 'delivery' as const, label: '🚚 Delivery (additional fee)', enabled: session.allow_delivery },
    { value: 'custom' as const, label: '📍 Drop-off Point', enabled: (session.custom_locations ?? []).length > 0 },
  ].filter(o => o.enabled)

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-3">Fulfillment</h2>
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-3">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
            <input {...register('fulfillment_type')} type="radio" value={opt.value} className="accent-amber-500" />
            <span className="text-sm text-stone-700">{opt.label}</span>
          </label>
        ))}
        {fulfillmentType === 'delivery' && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Delivery Address</label>
            <textarea
              {...register('delivery_address')}
              rows={3}
              placeholder="Full address including RT/RW, kelurahan, etc."
              className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none', errors.delivery_address ? 'border-red-400' : 'border-stone-300')}
            />
            {errors.delivery_address && <p className="text-red-500 text-xs mt-1">{errors.delivery_address.message}</p>}
          </div>
        )}
        {fulfillmentType === 'custom' && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Select Drop-off Location</label>
            <select
              {...register('custom_location')}
              className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.custom_location ? 'border-red-400' : 'border-stone-300')}
            >
              <option value="">— Choose location —</option>
              {(session.custom_locations as CustomLocation[]).map((loc) => (
                <option key={loc.name} value={loc.name}>{loc.name} — {loc.time}</option>
              ))}
            </select>
            {errors.custom_location && <p className="text-red-500 text-xs mt-1">{errors.custom_location.message}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create NotesSection**

Create `frontend/src/features/order/components/NotesSection.tsx`:

```tsx
import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'

interface Props { form: UseFormReturn<OrderFormValues> }

export function NotesSection({ form }: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-3">Notes</h2>
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
        <textarea
          {...form.register('notes')}
          rows={3}
          placeholder="Any special requests? (optional)"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add new sections to OrderPage form**

Import and add after `MenuSection` in `OrderPage.tsx`:

```tsx
import { CustomerDetails } from './components/CustomerDetails'
import { FulfillmentSection } from './components/FulfillmentSection'
import { NotesSection } from './components/NotesSection'

// Inside the <form>:
<MenuSection sessionItems={data.sessionItems} form={form} />
<CustomerDetails form={form} />
<FulfillmentSection form={form} session={data.session} />
<NotesSection form={form} />
<button
  type="submit"
  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors mb-8"
>
  Place Order
</button>
```

- [ ] **Step 5: Verify in browser**

All three sections render. Radio buttons show/hide address textarea and location dropdown correctly.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/order/components
git commit -m "feat: order form — customer details, fulfillment, notes sections"
```

---

## Task 9: Public Order — Submit + Success Page

**Files:**
- Create: `frontend/src/features/order/hooks/useSubmitOrder/index.ts`
- Modify: `frontend/src/features/order/OrderPage.tsx`
- Modify: `frontend/src/features/order/OrderSuccessPage.tsx`

- [ ] **Step 1: Create useSubmitOrder hook**

Create `frontend/src/features/order/hooks/useSubmitOrder/index.ts`:

```ts
import { useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { OrderFormValues } from '@/types/order'

interface SubmitOrderInput {
  sessionId: string
  values: OrderFormValues
}

async function submitOrder({ sessionId, values }: SubmitOrderInput): Promise<string> {
  const order = await pb.collection('orders').create({
    session: sessionId,
    customer_name: values.customer_name,
    whatsapp: values.whatsapp,
    fulfillment_type: values.fulfillment_type,
    delivery_address: values.delivery_address ?? '',
    custom_location: values.custom_location ?? '',
    notes: values.notes ?? '',
    is_fulfilled: false,
  })

  await Promise.all(
    values.items
      .filter(i => i.quantity > 0)
      .map(item =>
        pb.collection('order_items').create({
          order: order.id,
          session_item: item.session_item_id,
          quantity: item.quantity,
        }),
      ),
  )

  return order.id
}

export function useSubmitOrder() {
  return useMutation({ mutationFn: submitOrder })
}
```

- [ ] **Step 2: Wire submit into OrderPage**

Add to imports:
```tsx
import { useNavigate } from 'react-router-dom'
import { useSubmitOrder } from './hooks/useSubmitOrder'
import type { OrderFormValues } from '@/types/order'
```

Add inside component (after `const form = useOrderForm(...)`):
```tsx
const navigate = useNavigate()
const { mutate: submitOrder, isPending, error: submitError } = useSubmitOrder()

function onSubmit(values: OrderFormValues) {
  submitOrder({ sessionId: sessionId!, values }, {
    onSuccess: () => navigate(`/order/${sessionId}/success`),
  })
}
```

Change `<form>` to `<form onSubmit={form.handleSubmit(onSubmit)}>`.

Replace the submit button:
```tsx
{submitError && <p className="text-red-500 text-sm text-center mb-3">Something went wrong. Please try again.</p>}
<button
  type="submit"
  disabled={isPending}
  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors mb-8"
>
  {isPending ? 'Placing order...' : 'Place Order'}
</button>
```

- [ ] **Step 3: Build OrderSuccessPage**

Replace `frontend/src/features/order/OrderSuccessPage.tsx`:

```tsx
export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🥯</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Order Placed!</h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          Your order has been received. We'll reach out via WhatsApp to confirm the details.
          Thank you for ordering from Bismarck!
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: End-to-end test**

1. Open an open session's order URL
2. Add qty to at least one item
3. Fill customer name + WhatsApp
4. Choose fulfillment option
5. Click "Place Order" → navigates to success page
6. Check PocketBase admin UI → `orders` + `order_items` records created

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/order
git commit -m "feat: order form submit + success page — public flow complete"
```

---

## Task 10: Admin — Menu Catalog

**Files:**
- Create: `frontend/src/features/menu/hooks/useMenuItems/index.ts`
- Create: `frontend/src/features/menu/hooks/useMenuItemMutations/index.ts`
- Create: `frontend/src/features/menu/components/MenuItemRow.tsx`
- Create: `frontend/src/features/menu/components/MenuItemFormModal.tsx`
- Modify: `frontend/src/features/menu/MenuCatalogPage.tsx`

- [ ] **Step 1: Create useMenuItems**

Create `frontend/src/features/menu/hooks/useMenuItems/index.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { MenuItem } from '@/types/menu'

export function useMenuItems() {
  return useQuery({
    queryKey: ['menu_items'],
    queryFn: () => pb.collection('menu_items').getFullList<MenuItem>({ sort: '+name' }),
  })
}
```

- [ ] **Step 2: Create useMenuItemMutations**

Create `frontend/src/features/menu/hooks/useMenuItemMutations/index.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { MenuItem } from '@/types/menu'

export interface MenuItemFormData {
  name: string
  description: string
  default_price: number
  category: string
  image?: FileList
}

export function useMenuItemMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['menu_items'] })

  const createItem = useMutation({
    mutationFn: (data: MenuItemFormData) => {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('description', data.description)
      fd.append('default_price', String(data.default_price))
      fd.append('category', data.category)
      fd.append('is_active', 'true')
      if (data.image?.[0]) fd.append('image', data.image[0])
      return pb.collection('menu_items').create<MenuItem>(fd)
    },
    onSuccess: invalidate,
  })

  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItemFormData> }) => {
      const fd = new FormData()
      if (data.name !== undefined) fd.append('name', data.name)
      if (data.description !== undefined) fd.append('description', data.description)
      if (data.default_price !== undefined) fd.append('default_price', String(data.default_price))
      if (data.category !== undefined) fd.append('category', data.category)
      if (data.image?.[0]) fd.append('image', data.image[0])
      return pb.collection('menu_items').update<MenuItem>(id, fd)
    },
    onSuccess: invalidate,
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      pb.collection('menu_items').update<MenuItem>(id, { is_active }),
    onSuccess: invalidate,
  })

  return { createItem, updateItem, toggleActive }
}
```

- [ ] **Step 3: Create MenuItemFormModal**

Create `frontend/src/features/menu/components/MenuItemFormModal.tsx`:

```tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils/cn'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  default_price: z.coerce.number().min(0, 'Price must be 0 or more'),
  category: z.string().default(''),
  image: z.any().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  item?: MenuItem | null
  onSave: (data: FormValues) => void
  onClose: () => void
  isSaving: boolean
}

export function MenuItemFormModal({ item, onSave, onClose, isSaving }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (item) {
      reset({ name: item.name, description: item.description, default_price: item.default_price, category: item.category })
    } else {
      reset({ name: '', description: '', default_price: 0, category: '' })
    }
  }, [item, reset])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-4">{item ? 'Edit Menu Item' : 'New Menu Item'}</h2>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
            <input {...register('name')} className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.name ? 'border-red-400' : 'border-stone-300')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
            <textarea {...register('description')} rows={2} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Default Price (IDR)</label>
            <input {...register('default_price')} type="number" min={0} className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.default_price ? 'border-red-400' : 'border-stone-300')} />
            {errors.default_price && <p className="text-red-500 text-xs mt-1">{errors.default_price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
            <input {...register('category')} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Image</label>
            <input {...register('image')} type="file" accept="image/*" className="text-sm text-stone-600" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-stone-300 text-stone-700 rounded-lg py-2 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm transition-colors">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create MenuItemRow**

Create `frontend/src/features/menu/components/MenuItemRow.tsx`:

```tsx
import type { MenuItem } from '@/types/menu'
import { ProductThumbnail } from '@/components/ProductThumbnail'
import { cn } from '@/lib/utils/cn'

interface Props {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onToggleActive: (item: MenuItem) => void
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

export function MenuItemRow({ item, onEdit, onToggleActive }: Props) {
  return (
    <tr className={cn('border-b border-stone-100', !item.is_active && 'opacity-50')}>
      <td className="py-3 px-4"><ProductThumbnail item={item} className="w-14 h-14 rounded-lg" /></td>
      <td className="py-3 px-4">
        <p className="font-medium text-stone-800 text-sm">{item.name}</p>
        {item.category && <p className="text-stone-400 text-xs">{item.category}</p>}
      </td>
      <td className="py-3 px-4 text-sm text-stone-600">{formatPrice(item.default_price)}</td>
      <td className="py-3 px-4">
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', item.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500')}>
          {item.is_active ? 'Active' : 'Archived'}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <button onClick={() => onEdit(item)} className="text-xs text-amber-600 hover:underline mr-3">Edit</button>
        <button onClick={() => onToggleActive(item)} className="text-xs text-stone-500 hover:underline">
          {item.is_active ? 'Archive' : 'Restore'}
        </button>
      </td>
    </tr>
  )
}
```

- [ ] **Step 5: Build MenuCatalogPage**

Replace `frontend/src/features/menu/MenuCatalogPage.tsx`:

```tsx
import { useState } from 'react'
import { useMenuItems } from './hooks/useMenuItems'
import { useMenuItemMutations, type MenuItemFormData } from './hooks/useMenuItemMutations'
import { MenuItemRow } from './components/MenuItemRow'
import { MenuItemFormModal } from './components/MenuItemFormModal'
import type { MenuItem } from '@/types/menu'

export default function MenuCatalogPage() {
  const { data: items = [], isLoading } = useMenuItems()
  const { createItem, updateItem, toggleActive } = useMenuItemMutations()
  const [editTarget, setEditTarget] = useState<MenuItem | null | undefined>(undefined)

  const isModalOpen = editTarget !== undefined
  const isSaving = createItem.isPending || updateItem.isPending

  function handleSave(data: MenuItemFormData) {
    if (editTarget) {
      updateItem.mutate({ id: editTarget.id, data }, { onSuccess: () => setEditTarget(undefined) })
    } else {
      createItem.mutate(data, { onSuccess: () => setEditTarget(undefined) })
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Menu Catalog</h1>
            <p className="text-stone-500 text-sm">{items.filter(i => i.is_active).length} active items</p>
          </div>
          <button onClick={() => setEditTarget(null)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors">
            + Add Item
          </button>
        </div>
        {isLoading ? (
          <p className="text-stone-400 text-sm">Loading menu...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Image</th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Name</th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Price</th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onEdit={setEditTarget}
                    onToggleActive={(i) => toggleActive.mutate({ id: i.id, is_active: !i.is_active })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isModalOpen && (
        <MenuItemFormModal item={editTarget} onSave={handleSave} onClose={() => setEditTarget(undefined)} isSaving={isSaving} />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verify in browser**

Go to `/bismarck/menu`. Create, edit, archive items. Confirm PocketBase records update correctly.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/menu
git commit -m "feat: admin menu catalog — list, create, edit, archive"
```

---

## Task 11: Admin — Sessions Dashboard

**Files:**
- Create: `frontend/src/features/sessions/hooks/useSessions/index.ts`
- Create: `frontend/src/features/sessions/components/SessionCard.tsx`
- Modify: `frontend/src/features/sessions/SessionsDashboardPage.tsx`

- [ ] **Step 1: Create useSessions**

Create `frontend/src/features/sessions/hooks/useSessions/index.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Session } from '@/types/session'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => pb.collection('sessions').getFullList<Session>({ sort: '-created' }),
  })
}

export function hasOpenSession(sessions: Session[]): boolean {
  return sessions.some(s => s.status === 'open')
}
```

- [ ] **Step 2: Create SessionCard**

Create `frontend/src/features/sessions/components/SessionCard.tsx`:

```tsx
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
```

- [ ] **Step 3: Build SessionsDashboardPage**

Replace `frontend/src/features/sessions/SessionsDashboardPage.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { useSessions, hasOpenSession } from './hooks/useSessions'
import { SessionCard } from './components/SessionCard'

export default function SessionsDashboardPage() {
  const { data: sessions = [], isLoading } = useSessions()
  const openExists = hasOpenSession(sessions)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Pre-Order Sessions</h1>
            <p className="text-stone-500 text-sm">{sessions.length} total sessions</p>
          </div>
          {openExists ? (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-[180px] text-center">
              Close the open session before creating a new one
            </div>
          ) : (
            <Link to="/bismarck/sessions/new" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors">
              + New Session
            </Link>
          )}
        </div>
        {isLoading ? (
          <p className="text-stone-400 text-sm">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🥯</p>
            <p className="text-stone-700 font-medium">No sessions yet</p>
            <p className="text-stone-400 text-sm mt-1">Create your first pre-order session to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <Link to="/bismarck/menu" className="text-sm text-amber-600 hover:underline">→ Manage Menu Catalog</Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Go to `/bismarck/sessions`. Empty state shows. After creating sessions, cards render. "New Session" button hides when open session exists.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/sessions/hooks/useSessions frontend/src/features/sessions/components/SessionCard.tsx frontend/src/features/sessions/SessionsDashboardPage.tsx
git commit -m "feat: admin sessions dashboard"
```

---

## Task 12: Admin — Session Creation

**Files:**
- Create: `frontend/src/features/sessions/hooks/useCreateSession/index.ts`
- Modify: `frontend/src/features/sessions/SessionNewPage.tsx`

- [ ] **Step 1: Create useCreateSession**

Create `frontend/src/features/sessions/hooks/useCreateSession/index.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Session } from '@/types/session'

export interface SessionFormValues {
  title: string
  description: string
  fulfillment_date: string
  order_deadline: string
  max_orders: number
  allow_pickup: boolean
  allow_delivery: boolean
  custom_locations: { name: string; time: string }[]
  selectedItems: { menu_item_id: string; price: number; is_available: boolean }[]
}

async function createSession(values: SessionFormValues): Promise<Session> {
  const session = await pb.collection('sessions').create<Session>({
    title: values.title,
    description: values.description,
    fulfillment_date: values.fulfillment_date,
    order_deadline: values.order_deadline,
    max_orders: values.max_orders,
    status: 'open',
    allow_pickup: values.allow_pickup,
    allow_delivery: values.allow_delivery,
    custom_locations: values.custom_locations,
  })

  await Promise.all(
    values.selectedItems.map(item =>
      pb.collection('session_items').create({
        session: session.id,
        menu_item: item.menu_item_id,
        price: item.price,
        is_available: item.is_available,
      }),
    ),
  )

  return session
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}
```

- [ ] **Step 2: Build SessionNewPage**

Replace `frontend/src/features/sessions/SessionNewPage.tsx`:

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMenuItems } from '../menu/hooks/useMenuItems'
import { useCreateSession, type SessionFormValues } from './hooks/useCreateSession'
import { cn } from '@/lib/utils/cn'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  fulfillment_date: z.string().min(1, 'Fulfillment date is required'),
  order_deadline: z.string().min(1, 'Order deadline is required'),
  max_orders: z.coerce.number().int().min(0).default(0),
  allow_pickup: z.boolean().default(true),
  allow_delivery: z.boolean().default(false),
  custom_locations: z.array(z.object({ name: z.string().min(1), time: z.string().min(1) })).default([]),
  selectedItems: z.array(z.object({
    menu_item_id: z.string(),
    price: z.coerce.number().min(0),
    is_available: z.boolean(),
    selected: z.boolean(),
  })).default([]),
})

type FormValues = z.infer<typeof schema>

export default function SessionNewPage() {
  const navigate = useNavigate()
  const { data: menuItems = [] } = useMenuItems()
  const { mutate: createSession, isPending, error } = useCreateSession()

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '', fulfillment_date: '', order_deadline: '',
      max_orders: 0, allow_pickup: true, allow_delivery: false,
      custom_locations: [], selectedItems: [],
    },
  })

  useEffect(() => {
    if (menuItems.length > 0) {
      reset(current => ({
        ...current,
        selectedItems: menuItems
          .filter(m => m.is_active)
          .map(m => ({ menu_item_id: m.id, price: m.default_price, is_available: true, selected: true })),
      }))
    }
  }, [menuItems, reset])

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({ control, name: 'custom_locations' })
  const { fields: itemFields } = useFieldArray({ control, name: 'selectedItems' })

  function onSubmit(values: FormValues) {
    const sessionValues: SessionFormValues = {
      ...values,
      selectedItems: values.selectedItems
        .filter(i => i.selected)
        .map(({ menu_item_id, price, is_available }) => ({ menu_item_id, price, is_available })),
    }
    createSession(sessionValues, {
      onSuccess: (session) => navigate(`/bismarck/sessions/${session.id}`),
    })
  }

  const activeMenuItems = menuItems.filter(m => m.is_active)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">New Pre-Order Session</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Batch Info */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-stone-700">Batch Info</h2>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
              <input {...register('title')} placeholder="e.g. Bagel Batch — May 22" className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.title ? 'border-red-400' : 'border-stone-300')} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description (optional)</label>
              <textarea {...register('description')} rows={2} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Fulfillment Date (D-Day)</label>
                <input {...register('fulfillment_date')} type="date" className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.fulfillment_date ? 'border-red-400' : 'border-stone-300')} />
                {errors.fulfillment_date && <p className="text-red-500 text-xs mt-1">{errors.fulfillment_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Order Deadline</label>
                <input {...register('order_deadline')} type="datetime-local" className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.order_deadline ? 'border-red-400' : 'border-stone-300')} />
                {errors.order_deadline && <p className="text-red-500 text-xs mt-1">{errors.order_deadline.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Max Orders (0 = unlimited)</label>
              <input {...register('max_orders')} type="number" min={0} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>

          {/* Fulfillment Options */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-stone-700">Fulfillment Options</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('allow_pickup')} type="checkbox" className="accent-amber-500" />
              <span className="text-sm text-stone-700">Allow Self Pickup</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('allow_delivery')} type="checkbox" className="accent-amber-500" />
              <span className="text-sm text-stone-700">Allow Delivery</span>
            </label>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700">Drop-off Locations</span>
                <button type="button" onClick={() => appendLocation({ name: '', time: '' })} className="text-xs text-amber-600 hover:underline">+ Add Location</button>
              </div>
              {locationFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <input {...register(`custom_locations.${idx}.name`)} placeholder="Location name" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
                  <input {...register(`custom_locations.${idx}.time`)} placeholder="Time (e.g. 10:00 AM)" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
                  <button type="button" onClick={() => removeLocation(idx)} className="text-stone-400 hover:text-red-500 px-2">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Selection */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-stone-700">Menu Items for This Session</h2>
            {activeMenuItems.length === 0 && <p className="text-stone-400 text-sm">No active menu items. Add some in the Menu Catalog first.</p>}
            {itemFields.map((field, idx) => {
              const menuItem = activeMenuItems.find(m => m.id === field.menu_item_id)
              if (!menuItem) return null
              return (
                <div key={field.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                  <Controller
                    control={control}
                    name={`selectedItems.${idx}.selected`}
                    render={({ field: f }) => (
                      <input type="checkbox" checked={f.value} onChange={f.onChange} className="accent-amber-500" />
                    )}
                  />
                  <span className="flex-1 text-sm text-stone-800">{menuItem.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-500">IDR</span>
                    <input {...register(`selectedItems.${idx}.price`)} type="number" min={0} className="w-24 border border-stone-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                </div>
              )
            })}
          </div>

          {error && <p className="text-red-500 text-sm">Failed to create session. Please try again.</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/bismarck/sessions')} className="flex-1 border border-stone-300 text-stone-700 rounded-xl py-3 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors">
              {isPending ? 'Creating...' : 'Open Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Go to `/bismarck/sessions/new`. Fill required fields, click "Open Session". Verify redirect to detail page and PocketBase records.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/sessions/hooks/useCreateSession frontend/src/features/sessions/SessionNewPage.tsx
git commit -m "feat: admin session creation form"
```

---

## Task 13: Admin — Session Detail + Final Commit

**Files:**
- Create: `frontend/src/features/sessions/hooks/useSessionDetail/index.ts`
- Create: `frontend/src/features/sessions/hooks/useToggleFulfilled/index.ts`
- Create: `frontend/src/features/sessions/hooks/useCloseSession/index.ts`
- Create: `frontend/src/features/sessions/components/StatsRow.tsx`
- Create: `frontend/src/features/sessions/components/OrderRow.tsx`
- Create: `frontend/src/features/sessions/components/OrderTable.tsx`
- Create: `frontend/src/features/sessions/components/FulfillmentBreakdown.tsx`
- Modify: `frontend/src/features/sessions/SessionDetailPage.tsx`

- [ ] **Step 1: Create useSessionDetail**

Create `frontend/src/features/sessions/hooks/useSessionDetail/index.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Session } from '@/types/session'
import type { Order } from '@/types/order'

export interface SessionDetailData {
  session: Session
  orders: Order[]
}

async function fetchSessionDetail(id: string): Promise<SessionDetailData> {
  const [session, orders] = await Promise.all([
    pb.collection('sessions').getOne<Session>(id),
    pb.collection('orders').getFullList<Order>({
      filter: `session = "${id}"`,
      expand: 'order_items(order).session_item.menu_item',
      sort: '+created',
    }),
  ])
  return { session, orders }
}

export function useSessionDetail(id: string) {
  return useQuery({
    queryKey: ['session-detail', id],
    queryFn: () => fetchSessionDetail(id),
  })
}
```

- [ ] **Step 2: Create useToggleFulfilled**

Create `frontend/src/features/sessions/hooks/useToggleFulfilled/index.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

export function useToggleFulfilled(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, is_fulfilled }: { orderId: string; is_fulfilled: boolean }) =>
      pb.collection('orders').update(orderId, { is_fulfilled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session-detail', sessionId] }),
  })
}
```

- [ ] **Step 3: Create useCloseSession**

Create `frontend/src/features/sessions/hooks/useCloseSession/index.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

export function useCloseSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      pb.collection('sessions').update(sessionId, { status: 'closed' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['session-detail'] })
    },
  })
}
```

- [ ] **Step 4: Create StatsRow**

Create `frontend/src/features/sessions/components/StatsRow.tsx`:

```tsx
import type { Order } from '@/types/order'

interface Props { orders: Order[] }

export function StatsRow({ orders }: Props) {
  const total = orders.length
  const fulfilled = orders.filter(o => o.is_fulfilled).length
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-stone-800">{total}</p>
        <p className="text-xs text-stone-500 mt-0.5">Total Orders</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-green-600">{fulfilled}</p>
        <p className="text-xs text-stone-500 mt-0.5">Fulfilled</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-amber-500">{total - fulfilled}</p>
        <p className="text-xs text-stone-500 mt-0.5">Pending</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create OrderRow**

Create `frontend/src/features/sessions/components/OrderRow.tsx`:

```tsx
import type { Order, OrderItem } from '@/types/order'
import { cn } from '@/lib/utils/cn'

interface Props {
  order: Order
  onToggleFulfilled: (order: Order) => void
  isToggling: boolean
}

export function OrderRow({ order, onToggleFulfilled, isToggling }: Props) {
  const orderItems = (order.expand?.['order_items(order)'] ?? []) as OrderItem[]
  const fulfillmentLabel: Record<string, string> = {
    pickup: 'Pickup',
    delivery: 'Delivery',
    custom: order.custom_location || 'Drop-off',
  }

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 px-4">
        <p className="font-medium text-stone-800 text-sm">{order.customer_name}</p>
        <p className="text-stone-400 text-xs">{order.whatsapp}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-stone-500">{fulfillmentLabel[order.fulfillment_type]}</p>
        {order.delivery_address && <p className="text-xs text-stone-400 mt-0.5 max-w-[160px] truncate">{order.delivery_address}</p>}
      </td>
      <td className="py-3 px-4">
        {orderItems.map(oi => {
          const name = oi.expand?.session_item?.expand?.menu_item?.name ?? 'Item'
          return <p key={oi.id} className="text-xs text-stone-600">{oi.quantity}x {name}</p>
        })}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          type="button"
          onClick={() => onToggleFulfilled(order)}
          disabled={isToggling}
          className={cn(
            'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
            order.is_fulfilled
              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100',
          )}
        >
          {order.is_fulfilled ? '✓ Done' : 'Mark Done'}
        </button>
      </td>
    </tr>
  )
}
```

- [ ] **Step 6: Create OrderTable**

Create `frontend/src/features/sessions/components/OrderTable.tsx`:

```tsx
import type { Order } from '@/types/order'
import { OrderRow } from './OrderRow'

interface Props {
  orders: Order[]
  onToggleFulfilled: (order: Order) => void
  isToggling: boolean
}

export function OrderTable({ orders, onToggleFulfilled, isToggling }: Props) {
  if (orders.length === 0) {
    return <div className="bg-white rounded-2xl shadow-sm p-8 text-center"><p className="text-stone-400 text-sm">No orders yet.</p></div>
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Customer</th>
            <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Fulfillment</th>
            <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Items</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <OrderRow key={order.id} order={order} onToggleFulfilled={onToggleFulfilled} isToggling={isToggling} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 7: Create FulfillmentBreakdown**

Create `frontend/src/features/sessions/components/FulfillmentBreakdown.tsx`:

```tsx
import type { Order } from '@/types/order'

interface Props { orders: Order[] }

export function FulfillmentBreakdown({ orders }: Props) {
  const groups: Record<string, Order[]> = {}
  for (const order of orders) {
    const key = order.fulfillment_type === 'custom'
      ? `Drop-off: ${order.custom_location || 'Unknown'}`
      : order.fulfillment_type === 'delivery' ? 'Delivery' : 'Self Pickup'
    if (!groups[key]) groups[key] = []
    groups[key].push(order)
  }
  if (Object.keys(groups).length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-base font-bold text-stone-800 mb-3">Fulfillment Breakdown</h2>
      <div className="space-y-3">
        {Object.entries(groups).map(([label, groupOrders]) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm p-4">
            <p className="font-medium text-stone-700 text-sm mb-2">{label} <span className="text-stone-400 font-normal">({groupOrders.length})</span></p>
            {groupOrders.map(o => <p key={o.id} className="text-xs text-stone-500">{o.customer_name} — {o.whatsapp}</p>)}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Build SessionDetailPage**

Replace `frontend/src/features/sessions/SessionDetailPage.tsx`:

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionDetail } from './hooks/useSessionDetail'
import { useToggleFulfilled } from './hooks/useToggleFulfilled'
import { useCloseSession } from './hooks/useCloseSession'
import { StatsRow } from './components/StatsRow'
import { OrderTable } from './components/OrderTable'
import { FulfillmentBreakdown } from './components/FulfillmentBreakdown'
import type { Order } from '@/types/order'

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useSessionDetail(id!)
  const { mutate: toggleFulfilled, isPending: isToggling } = useToggleFulfilled(id!)
  const { mutate: closeSession, isPending: isClosing } = useCloseSession()

  if (isLoading || !data) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50"><p className="text-stone-400">Loading session...</p></div>
  }

  const { session, orders } = data
  const isOpen = session.status === 'open'
  const shareUrl = `${window.location.origin}/order/${session.id}`

  function handleToggle(order: Order) {
    toggleFulfilled({ orderId: order.id, is_fulfilled: !order.is_fulfilled })
  }

  function handleClose() {
    if (!confirm('Close this session? No more orders will be accepted.')) return
    closeSession(session.id)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <button onClick={() => navigate('/bismarck/sessions')} className="text-xs text-stone-400 hover:text-stone-600 mb-2 flex items-center gap-1">← Sessions</button>
            <h1 className="text-2xl font-bold text-stone-800">{session.title}</h1>
            <p className="text-stone-500 text-sm mt-0.5">
              Ready: {new Date(session.fulfillment_date).toLocaleDateString('en-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOpen ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
            {isOpen && (
              <button onClick={handleClose} disabled={isClosing} className="text-xs text-red-500 hover:underline disabled:opacity-60">
                Close session
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-sm text-amber-700 flex-1 truncate">{shareUrl}</span>
            <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="text-xs text-amber-600 hover:underline shrink-0">Copy link</button>
          </div>
        )}

        <StatsRow orders={orders} />

        <h2 className="text-base font-bold text-stone-800 mb-3">Orders</h2>
        <OrderTable orders={orders} onToggleFulfilled={handleToggle} isToggling={isToggling} />

        <FulfillmentBreakdown orders={orders} />
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Verify full admin flow end-to-end**

1. Login at `/bismarck/login`
2. Go to `/bismarck/menu` → add 2+ menu items with images
3. Go to `/bismarck/sessions/new` → create a session (check title, dates, items)
4. Redirected to session detail → copy share link
5. Open share link in incognito → complete a customer order
6. Return to session detail → order appears in table
7. Click "Mark Done" → toggles to "✓ Done"
8. Fulfillment breakdown shows the correct group
9. Click "Close session" → status badge changes to "Closed"
10. Dashboard shows session card as closed

- [ ] **Step 10: Final commit and push**

```bash
cd /Users/jacktfz/Work/bismarck
git add .
git commit -m "feat: admin session detail — orders table, fulfillment toggle, close session

Complete admin flow:
- Session detail with stats row (total / fulfilled / pending)
- Orders table with is_fulfilled toggle on far right
- Fulfillment breakdown grouped by type
- Close session action with confirmation
- Share link copy button

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|---|---|
| Admin login | Task 4 |
| Menu catalog (create/edit/archive) | Task 10 |
| Session creation with fulfillment date + deadline | Task 12 |
| Max orders auto-close guard | Task 6 |
| Per-session menu item toggle + price override | Task 12 |
| Custom drop-off locations | Task 12 |
| Public order form at `/order/:sessionId` | Tasks 6-9 |
| Session closed guard (status / deadline / max) | Task 6 |
| Menu cards with 144x144 thumbnails | Tasks 5, 7 |
| Inline qty selector | Tasks 5, 7 |
| Customer name + WhatsApp | Task 8 |
| Fulfillment: pickup / delivery / custom | Task 8 |
| Delivery address conditional | Task 8 |
| Custom location dropdown | Task 8 |
| Notes field | Task 8 |
| Order submitted via public create | Task 9 |
| Success page | Task 9 |
| Admin session detail with stats | Task 13 |
| is_fulfilled toggle far-right | Task 13 |
| Fulfillment breakdown | Task 13 |
| Sessions dashboard | Task 11 |
| "New Session" disabled if open session exists | Task 11 |
| Share link copy | Task 13 |
| `/bismarck/*` route prefix | Task 3 |
| ProtectedRoute | Task 3 |
| React Hook Form on ALL forms | Tasks 4, 7, 8, 10, 12 |
| PocketBase singleton | Task 1 |
| Sandrock folder structure | All tasks |
| Tailwind v4 via `@tailwindcss/vite` | Task 1 |
| `cn()` utility | Task 1 |
| `@/` path alias | Task 1 |

All requirements covered.

### Type Consistency

- `MenuItem`, `SessionItem` → defined Task 3, used Tasks 5, 7, 10, 12, 13 ✓
- `Session` → defined Task 3, used Tasks 6, 7, 8, 11, 12, 13 ✓
- `Order`, `OrderItem`, `OrderFormValues` → defined Task 3, used Tasks 7, 8, 9, 13 ✓
- `useSession` returns `SessionData { session, sessionItems, orderCount }` → consumed correctly Tasks 6-9 ✓
- `useSessionDetail` returns `SessionDetailData { session, orders }` → consumed correctly Task 13 ✓
- `SessionFormValues.selectedItems` has no `selected` field → Task 12 filters before calling mutate ✓
- `useToggleFulfilled` takes `sessionId`, mutation takes `{ orderId, is_fulfilled }` → Task 13 correct ✓
- `pb.files.getURL` first arg needs `collectionId` + `collectionName` → `ProductThumbnail` receives correct Pick ✓

No type inconsistencies.
