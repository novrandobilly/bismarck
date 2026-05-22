# Component Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold `useAuth`, `BismarckText`, `BismarckButton`, `LoadingSpinner`, and `MainWrapper` (GuestWrapper + AdminWrapper), wire them into the router, and migrate all existing loading states to `LoadingSpinner`.

**Architecture:** Five reusable building blocks share a single source of truth for typography, buttons, loading states, and layout. `useAuth` wraps PocketBase's auth store reactively so any component can read login state. `MainWrapper` uses layout routes in React Router v6 so guest and admin pages get their navbar/footer automatically without each page needing to render it.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4, React Router v7, PocketBase JS SDK 0.26, TanStack Query v5, `cn` utility (`clsx` + `tailwind-merge`) at `@/lib/utils/cn`.

---

## File map

| Action | Path                                              | Purpose                                            |
| ------ | ------------------------------------------------- | -------------------------------------------------- |
| Create | `src/features/auth/hooks/useAuth/index.ts`        | Reactive auth state from PocketBase auth store     |
| Create | `src/components/LoadingSpinner.tsx`               | Ring spinner — inline, centered, overlay modes     |
| Edit   | `src/components/BismarckText.tsx`                 | Semantic typography component (currently empty)    |
| Edit   | `src/components/BismarckButton.tsx`               | Button variants + sizes (currently empty)          |
| Create | `src/components/MainWrapper/index.tsx`            | GuestWrapper + AdminWrapper layout components      |
| Edit   | `src/router/ProtectedRoute.tsx`                   | Use `useAuth` instead of `pb.authStore` directly   |
| Edit   | `src/router/index.tsx`                            | Add layout routes for GuestWrapper + AdminWrapper  |
| Edit   | `src/pages/home/index.tsx`                        | Remove duplicate footer; replace skeleton loaders  |
| Edit   | `src/features/sessions/SessionsDashboardPage.tsx` | Replace inline loading text with `LoadingSpinner`  |
| Edit   | `src/features/sessions/SessionDetailPage.tsx`     | Replace inline loading text with `LoadingSpinner`  |
| Edit   | `src/features/menu/MenuCatalogPage.tsx`           | Replace inline loading text with `LoadingSpinner`  |
| Edit   | `src/features/order/OrderPage.tsx`                | Replace loading page + submit button pending state |
| Edit   | `src/pages/bismarck/login/index.tsx`              | Replace button pending text with `LoadingSpinner`  |

**Verification command** (run after each task): `cd frontend && npx tsc -p tsconfig.app.json --noEmit`

---

## Task 1: `useAuth` hook

**Files:**

- Create: `src/features/auth/hooks/useAuth/index.ts`

- [ ] **Step 1: Create the file**

```ts
// src/features/auth/hooks/useAuth/index.ts
import { useState, useEffect } from "react";
import type { AuthModel } from "pocketbase";
import { pb } from "@/lib/pocketbase";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [user, setUser] = useState<AuthModel | null>(pb.authStore.model);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(
      (_token: string, model: AuthModel | null) => {
        setIsAuthenticated(pb.authStore.isValid);
        setUser(model);
      },
    );
    return unsubscribe;
  }, []);

  return { isAuthenticated, user };
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/features/auth/hooks/useAuth/index.ts
git commit -m "feat: add useAuth hook — reactive PocketBase auth state"
```

---

## Task 2: `LoadingSpinner`

**Files:**

- Create: `src/components/LoadingSpinner.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/LoadingSpinner.tsx
import { cn } from "@/lib/utils/cn";

interface Props {
  size?: "sm" | "md";
  centered?: boolean;
  overlay?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  centered = false,
  overlay = false,
  className,
}: Props) {
  const spinner = (
    <div
      className={cn(
        "rounded-full border-stone-200 border-t-amber-500 animate-spin",
        size === "sm" ? "w-4 h-4 border-2" : "w-8 h-8 border-4",
        className,
      )}
    />
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40">
        {spinner}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex w-full items-center justify-center py-12">
        {spinner}
      </div>
    );
  }

  return spinner;
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/components/LoadingSpinner.tsx
git commit -m "feat: add LoadingSpinner component — inline, centered, overlay modes"
```

---

## Task 3: `BismarckText`

**Files:**

- Edit: `src/components/BismarckText.tsx` (currently empty)

- [ ] **Step 1: Write the component**

Replace the empty file with:

```tsx
// src/components/BismarckText.tsx
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "h1" | "h2" | "h3" | "body" | "caption" | "label";

const defaultTags: Record<Variant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  caption: "p",
  label: "p",
};

const variantClasses: Record<Variant, string> = {
  h1: "text-3xl font-extrabold text-stone-900",
  h2: "text-2xl font-bold text-stone-800",
  h3: "text-lg font-semibold text-stone-800",
  body: "text-sm text-stone-700",
  caption: "text-xs text-stone-500",
  label: "text-xs font-bold uppercase tracking-widest text-stone-400",
};

interface Props {
  variant: Variant;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function BismarckText({ variant, as, className, children }: Props) {
  const Tag = as ?? defaultTags[variant];
  return (
    <Tag className={cn(variantClasses[variant], className)}>{children}</Tag>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/components/BismarckText.tsx
git commit -m "feat: add BismarckText — semantic typography component"
```

---

## Task 4: `BismarckButton`

**Files:**

- Edit: `src/components/BismarckButton.tsx` (currently empty)

- [ ] **Step 1: Write the component**

Replace the empty file with:

```tsx
// src/components/BismarckButton.tsx
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { LoadingSpinner } from "./LoadingSpinner";

type Variant =
  | "primary"
  | "dark"
  | "outline"
  | "outline-amber"
  | "ghost"
  | "danger";
type Size = "sm" | "md" | "lg" | "full";

const variantClasses: Record<Variant, string> = {
  primary: "bg-amber-500 hover:bg-amber-600 text-white",
  dark: "bg-stone-900 hover:bg-stone-800 text-white",
  outline: "bg-white border border-stone-300 text-stone-800 hover:bg-stone-50",
  "outline-amber":
    "bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-50",
  ghost: "bg-transparent text-stone-500 underline hover:text-stone-700",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
  full: "w-full px-4 py-2 text-sm rounded-lg",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export function BismarckButton({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/components/BismarckButton.tsx
git commit -m "feat: add BismarckButton — 6 variants, 4 sizes, loading state"
```

---

## Task 5: `MainWrapper`

**Files:**

- Create: `src/components/MainWrapper/index.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/MainWrapper/index.tsx
import { Link, Outlet } from "react-router-dom";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function GuestWrapper() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-stone-900 font-extrabold text-lg">
            🥯 Envien Bagel
          </Link>
          <nav className="flex items-center gap-6 text-sm text-stone-600">
            <Link to="/" className="hover:text-stone-900 transition-colors">
              Home
            </Link>
            {/* /menu route will be added when public menu page is built */}
            <Link to="/menu" className="hover:text-stone-900 transition-colors">
              Menu
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-stone-400">
          <span>© {new Date().getFullYear()} Envien Bagel</span>
          <span>Made with 🥯 & wild yeast</span>
        </div>
      </footer>
    </div>
  );
}

export function AdminWrapper() {
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <header className="sticky top-0 z-10 bg-stone-900 border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/bismarck/sessions"
            className="text-white font-extrabold text-lg"
          >
            🥯 Bismarck
          </Link>
          <button
            onClick={logout}
            className="text-stone-400 hover:text-white text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/components/MainWrapper/index.tsx
git commit -m "feat: add MainWrapper — GuestWrapper and AdminWrapper layout components"
```

---

## Task 6: Wire wrappers into the router

**Files:**

- Edit: `src/router/ProtectedRoute.tsx`
- Edit: `src/router/index.tsx`

- [ ] **Step 1: Update `ProtectedRoute` to use `useAuth`**

Replace the entire file:

```tsx
// src/router/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/bismarck/login" replace />;
  }
  return <Outlet />;
}
```

- [ ] **Step 2: Update `router/index.tsx` with layout routes**

Replace the entire file:

```tsx
// src/router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestWrapper, AdminWrapper } from "@/components/MainWrapper";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/bismarck/login";
import NotFoundPage from "@/pages/not-found";
import MenuCatalogPage from "@/features/menu/MenuCatalogPage";
import SessionsDashboardPage from "@/features/sessions/SessionsDashboardPage";
import SessionNewPage from "@/features/sessions/SessionNewPage";
import SessionDetailPage from "@/features/sessions/SessionDetailPage";
import OrderPage from "@/features/order/OrderPage";
import OrderSuccessPage from "@/features/order/OrderSuccessPage";

export const router = createBrowserRouter([
  {
    element: <GuestWrapper />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/order/:sessionId", element: <OrderPage /> },
      { path: "/order/:sessionId/success", element: <OrderSuccessPage /> },
    ],
  },
  { path: "/bismarck/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminWrapper />,
        children: [
          { path: "/bismarck/sessions", element: <SessionsDashboardPage /> },
          { path: "/bismarck/sessions/new", element: <SessionNewPage /> },
          { path: "/bismarck/sessions/:id", element: <SessionDetailPage /> },
          { path: "/bismarck/menu", element: <MenuCatalogPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
```

- [ ] **Step 3: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd frontend && git add src/router/ProtectedRoute.tsx src/router/index.tsx
git commit -m "feat: wire GuestWrapper and AdminWrapper into router as layout routes"
```

---

## Task 7: Migrate loading states — pages

Each page now strips duplicated layout chrome (outer wrapper div, footer) and replaces loading states with `LoadingSpinner`. GuestWrapper and AdminWrapper provide the outer shell.

**Files:**

- Edit: `src/pages/home/index.tsx`
- Edit: `src/features/sessions/SessionsDashboardPage.tsx`
- Edit: `src/features/sessions/SessionDetailPage.tsx`
- Edit: `src/features/menu/MenuCatalogPage.tsx`
- Edit: `src/features/order/OrderPage.tsx`
- Edit: `src/pages/bismarck/login/index.tsx`

### 7a — `HomePage`

The current homepage owns its own `<footer>` and outer `min-h-screen` wrapper. Since `GuestWrapper` now provides both, strip them out and replace skeleton loaders.

- [ ] **Step 1: Update `src/pages/home/index.tsx`**

Make these changes:

1. Add import at top:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";
```

2. Replace the outer `<div className="min-h-screen bg-stone-50 font-sans">` wrapper and its closing tag — remove it so the page returns a React Fragment `<>...</>`.

3. Remove the entire `<footer>` block (GuestWrapper provides it).

4. Replace the two `animate-pulse` loading skeletons (lines ~98 and ~115–119) with `<LoadingSpinner centered />`:

```tsx
// Before — open PO loading:
<div className="h-32 bg-stone-100 rounded-2xl animate-pulse" />

// After:
<LoadingSpinner centered />
```

```tsx
// Before — past sessions loading:
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
  {[...Array(3)].map((_, i) => (
    <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />
  ))}
</div>

// After:
<LoadingSpinner centered />
```

The `<header>` (hero section) and `<main>` stay as-is — they are page-specific content, not layout chrome.

The `animate-pulse` on the green status dot (`<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />`) is intentional and stays.

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

### 7b — `SessionsDashboardPage`

- [ ] **Step 1: Update loading state**

Add import:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";
```

Replace:

```tsx
// Before:
{isLoading ? (
  <p className="text-stone-400 text-sm">Loading sessions...</p>
) : ...}

// After:
{isLoading ? (
  <LoadingSpinner centered />
) : ...}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

### 7c — `SessionDetailPage`

- [ ] **Step 1: Update loading state**

Add import:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";
```

Replace:

```tsx
// Before:
if (isLoading || !data) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <p className="text-stone-400">Loading session...</p>
    </div>
  );
}

// After:
if (isLoading || !data) {
  return <LoadingSpinner centered />;
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

### 7d — `MenuCatalogPage`

- [ ] **Step 1: Update loading state**

Add import:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";
```

Replace:

```tsx
// Before:
{isLoading ? (
  <p className="text-stone-400 text-sm">Loading menu...</p>
) : ...}

// After:
{isLoading ? (
  <LoadingSpinner centered />
) : ...}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

### 7e — `OrderPage`

- [ ] **Step 1: Update page-level loading state and submit button**

Add import:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";
```

Replace page-level loading:

```tsx
// Before:
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <p className="text-stone-500">Loading order form...</p>
    </div>
  );
}

// After:
if (isLoading) {
  return <LoadingSpinner centered />;
}
```

Replace submit button pending state:

```tsx
// Before:
<button
  ...
  disabled={isPending}
>
  {isPending ? 'Placing order...' : 'Place Order'}
</button>

// After:
<button
  ...
  disabled={isPending}
>
  {isPending ? <LoadingSpinner size="sm" /> : 'Place Order'}
</button>
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

### 7f — `LoginPage`

- [ ] **Step 1: Update submit button pending state**

Add import:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";
```

Replace button content:

```tsx
// Before:
<button
  type="submit"
  disabled={isPending}
  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2 transition-colors"
>
  {isPending ? 'Signing in...' : 'Sign in'}
</button>

// After:
<button
  type="submit"
  disabled={isPending}
  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2 transition-colors flex items-center justify-center"
>
  {isPending ? <LoadingSpinner size="sm" /> : 'Sign in'}
</button>
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit all page migrations**

```bash
cd frontend && git add \
  src/pages/home/index.tsx \
  src/features/sessions/SessionsDashboardPage.tsx \
  src/features/sessions/SessionDetailPage.tsx \
  src/features/menu/MenuCatalogPage.tsx \
  src/features/order/OrderPage.tsx \
  src/pages/bismarck/login/index.tsx
git commit -m "feat: migrate all loading states to LoadingSpinner; strip duplicate layout chrome from pages"
```

---

## Task 8: Final build verification

- [ ] **Step 1: Full build**

```bash
cd frontend && yarn build
```

Expected: TypeScript compiles with no errors, Vite bundles successfully.

- [ ] **Step 2: Lint**

```bash
cd frontend && yarn lint
```

Expected: no errors.
