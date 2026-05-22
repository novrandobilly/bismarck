# Copilot Instructions — Bismarck (Envien Bagel Pre-order App)

## Stack

- **Frontend**: React 19 + TypeScript + Vite (SPA), in `frontend/`
- **Backend**: PocketBase binary + SQLite, in `backend/` — no separate API server or custom endpoints

## Commands (run from `frontend/`)

```bash
yarn dev        # start dev server
yarn build      # type-check + Vite build (tsc -b && vite build)
yarn lint       # ESLint
```

There are no automated tests in this project.

## Architecture

### Two distinct user roles

- **Customers** use public routes (`/`, `/menu`, `/order/:sessionId`, `/order/:sessionId/success`, `/session/:sessionId/orders`)
- **Admins** use protected routes under `/bismarck/*` (dashboard, sessions, menu management)

Authentication is PocketBase-native; `useAuth` subscribes to `pb.authStore.onChange`. `ProtectedRoute` redirects unauthenticated users to `/bismarck/login`.

### Layouts

- `GuestWrapper` — light stone navbar, shown to all public and unauthenticated users
- `AdminWrapper` — dark stone navbar, wraps all `/bismarck/*` admin pages

Both are outlet-based wrappers registered in `src/router/index.tsx`.

### Data model (PocketBase collections)

```
menu_items
  └─ preorder_session_items   (per-session items with session-specific price + availability)
       └─ order_items          (line items for a specific order)
            └─ orders          (one order per customer per session)
preorder_sessions              (controls deadline, max_orders, fulfillment options)
```

PocketBase `expand` is used heavily — always pass the `expand` option when relations need to be resolved in a single request.

### Data fetching pattern

All server state lives in TanStack Query (`@tanstack/react-query`). Pages have co-located `hooks/` subdirectories (e.g., `pages/order/hooks/useSession`, `useOrderForm`, `useSubmitOrder`). Global/shared hooks live in `src/hooks/`.

```ts
// reads → useQuery
export function useFoo(id: string) {
  return useQuery({ queryKey: ['foo', id], queryFn: () => pb.collection('foo').getOne(id) })
}

// writes → useMutation
export function useCreateFoo() {
  return useMutation({ mutationFn: (data) => pb.collection('foo').create(data) })
}
```

### Forms

Forms use `react-hook-form` + `zod` via `@hookform/resolvers/zod`. Define the schema and resolver inside the custom hook, return the form object to the page component.

## Key Conventions

### Path alias

`@/` maps to `src/`. Always use it for imports outside the current directory.

### Class merging

Use `cn()` from `@/lib/utils/cn` (clsx + tailwind-merge) for all conditional Tailwind classes.

### PocketBase singleton

Always import `pb` from `@/lib/pocketbase` — do not instantiate `PocketBase` elsewhere.  
`pb.autoCancellation(false)` is set globally; do not re-enable per-request cancellation without a reason.

### Typed PocketBase calls

Always pass the expected type to collection methods:

```ts
pb.collection('menu_items').getFullList<MenuItem>({ sort: '+name' })
```

Use `pb.filter()` for parameterised filters (avoids injection):

```ts
pb.filter('preorder_session = {:id} && is_available = true', { id: sessionId })
```

### Shared UI components

- `BismarckButton` — use instead of raw `<button>` for consistent styling; supports `variant` (`primary` | `dark` | `outline` | `outline-amber` | `ghost` | `danger`) and `size` (`sm` | `md` | `lg` | `full`)
- `BismarckText` — shared text component
- `LoadingSpinner` — accepts `size` (`sm` | `md`) and `centered` prop

### Tailwind

Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). Color palette is `stone` (neutrals) + `amber` (primary accent).

### Types

Types in `src/types/` mirror PocketBase collections. Use `expand?` with optional nested types for expanded relations. Session extends `RecordModel` from `pocketbase`; simpler types are plain interfaces.

### Page/feature structure — Enhanced SOLID Principle

Every file has exactly one clearly stated goal. If you cannot describe it in one sentence without "and", split it. This applies to components, hooks, helpers, and tools.

```
pages/order/
├── index.tsx              # page entry: layout, routing, top-level state
├── features/              # presentational components used only in this page
│   ├── SessionHeader.tsx
│   ├── MenuSection/
│   └── CustomerDetails.tsx
├── hooks/                 # React hooks that derive state/values for this page
│   ├── useSession.ts
│   ├── useOrderForm.ts
│   └── useSubmitOrder.ts
└── helper/                # pure predicates/queries scoped to this feature
```

Global pure functions (no React, no feature-specific logic) live in `src/tools/` and are reused across features.

**Layer responsibilities and dependency direction:**

| Layer | Location | Job |
|---|---|---|
| **Tools** | `src/tools/` | Pure functions: extract or transform typed data |
| **Helpers** | `FeatureName/helper/` | Semantic predicates using tools, scoped to one feature |
| **Hooks** | `FeatureName/hooks/` | React hooks that derive state/values for components |
| **Features** | `FeatureName/features/` | Presentational components specific to this feature |
| **Index** | `FeatureName/index.tsx` | Page entry: owns layout, routing, top-level state |

`index → features → hooks → helpers → tools`. Never import upward.

**Promotion rule:** components default to their feature folder. Only move a component up when it is actually reused by a second feature — and promote it to the *nearest common ancestor's* `components/` folder, not automatically to global `src/components/`.

**Extract immediately when:**
- A function does more than one thing
- A hook fetches data **and** derives display values
- A component renders more than one conceptually distinct UI region
- The same logic appears in two files
- A file imports from a higher layer

**Naming:**

| Pattern | Use |
|---|---|
| `get{Thing}(s)` | Tool that extracts a typed subset |
| `has{Thing}` | Helper predicate returning `boolean` |
| `use{Thing}` | React hook |
| `{Thing}.tsx` (PascalCase) | React component (one per file) |
| `index.tsx` | Page/feature entry point |

## Environment Variables

```
VITE_POCKETBASE_URL   # required; PocketBase instance URL (e.g. http://localhost:8090)
```

## Backend (PocketBase)

- Run the `pocketbase` binary from `backend/`: `./pocketbase serve`
- Admin UI at `/_/`
- Schema is managed via migrations in `backend/pb_migrations/` (JS format)
- Persistent data in `backend/pb_data/` — never commit this directory
