# Component Scaffolding Design

**Date:** 2026-05-19  
**Scope:** `BismarckText`, `BismarckButton`, `LoadingSpinner`, `MainWrapper` (GuestWrapper + AdminWrapper), `useAuth`

---

## Overview

Scaffold five reusable building blocks that all current and future pages will share. The goal is consistency and maintainability — one spinner, one button, one text system, one layout wrapper. Existing ad-hoc loading states (`animate-pulse`, inline `isPending`) are replaced by `LoadingSpinner`.

---

## 1. `useAuth`

**Location:** `src/features/auth/hooks/useAuth/index.ts`

Returns the current authentication state, reactive to PocketBase auth store changes.

```ts
useAuth() → { isAuthenticated: boolean, user: AuthModel | null }
```

- Reads `pb.authStore.isValid` and `pb.authStore.model`
- Subscribes to `pb.authStore.onChange` via `useEffect` so components re-render on login/logout
- `ProtectedRoute` updated to use `useAuth` instead of reading `pb.authStore` directly

---

## 2. `BismarckText`

**Location:** `src/components/BismarckText.tsx`

Typed typography component. Variant drives size, weight, and color. Render tag is inferred from variant but overridable via `as`.

| Variant   | Default tag | Tailwind classes                                             |
| --------- | ----------- | ------------------------------------------------------------ |
| `h1`      | `h1`        | `text-3xl font-extrabold text-stone-900`                     |
| `h2`      | `h2`        | `text-2xl font-bold text-stone-800`                          |
| `h3`      | `h3`        | `text-lg font-semibold text-stone-800`                       |
| `body`    | `p`         | `text-sm text-stone-700`                                     |
| `caption` | `p`         | `text-xs text-stone-500`                                     |
| `label`   | `p`         | `text-xs font-bold uppercase tracking-widest text-stone-400` |

**Props:** `variant`, `as` (tag override), `className` (escape hatch), `children`

---

## 3. `BismarckButton`

**Location:** `src/components/BismarckButton.tsx`

Six variants × four sizes with disabled and loading states. Loading state renders an inline `LoadingSpinner` (sm) replacing the label text.

| Variant         | Appearance                                 |
| --------------- | ------------------------------------------ |
| `primary`       | amber-500 fill, white text                 |
| `dark`          | stone-900 fill, white text                 |
| `outline`       | white bg, stone-300 border, stone-800 text |
| `outline-amber` | transparent, amber-500 border + text       |
| `ghost`         | transparent, stone-500 text, underline     |
| `danger`        | red-500 fill, white text                   |

**Sizes:** `sm`, `md` (default), `lg`, `full`

**Props:** `variant` (default: `primary`), `size` (default: `md`), `isLoading`, `disabled`, `className`, all native `<button>` HTML props

---

## 4. `LoadingSpinner`

**Location:** `src/components/LoadingSpinner.tsx`

Amber ring spinner. Three usage modes via props.

| Mode        | Props      | Behaviour                                                                                       |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------- |
| Inline      | _(none)_   | Renders spinner only — placed inside buttons or next to text                                    |
| Section     | `centered` | Wraps in a full-width flex container, vertically centered — replaces `animate-pulse` skeletons  |
| Full-screen | `overlay`  | Fixed full-screen semi-transparent backdrop with centered spinner — used for login/submit flows |

**Sizes:** `sm` (16 px border-2), `md` (32 px border-4, default)

**Props:** `size`, `centered`, `overlay`, `className`

**Migration:** All existing `animate-pulse` skeleton divs and inline `{isPending ? 'Signing in...' : ...}` patterns are replaced with `<LoadingSpinner />` or `<LoadingSpinner centered />`.

---

## 5. `MainWrapper`

**Location:** `src/components/MainWrapper/index.tsx`

Both sub-components exported from the same index, importable as:

```ts
import { GuestWrapper, AdminWrapper } from "@/components/MainWrapper";
```

Both use `useAuth` internally.

### `GuestWrapper`

Wraps public-facing pages (`/`, `/order/*`).

- **Top bar:** sticky, white bg, stone border-b
  - Left: `🥯 Envien Bagel` logo (links to `/`)
  - Right: `Home` + `Menu` nav links in stone-600
- **Body:** `<Outlet />` / `children`
- **Footer:** matching current homepage footer (`© year Envien Bagel · Made with 🥯 & wild yeast`)

### `AdminWrapper`

Wraps all `/bismarck/*` routes (inside `ProtectedRoute`).

- **Top bar:** sticky, stone-900 bg
  - Left: `🥯 Bismarck` logo in white (links to `/bismarck/sessions`)
  - Right: `Logout` button (`ghost` variant, white text) — calls `useLogout`
- **Body:** `<Outlet />` / `children`
- **No footer**

### Router changes

`GuestWrapper` wraps the `/` and `/order/*` routes as a layout route. `AdminWrapper` is added inside `ProtectedRoute` as a layout wrapper for all `/bismarck/*` routes.

### Dashboard sidebar

Out of scope for this scaffolding pass. The sidebar for the dashboard/sessions area lives inside the dashboard page itself and will be designed separately.

---

## File structure after scaffolding

```
src/
  components/
    BismarckText.tsx          ← typography system
    BismarckButton.tsx        ← button system
    LoadingSpinner.tsx        ← spinner (inline / centered / overlay)
    MainWrapper/
      index.tsx               ← exports GuestWrapper, AdminWrapper
  features/
    auth/
      hooks/
        useAuth/
          index.ts            ← new: reactive auth state hook
        useAdminLogin/        ← unchanged
        useLogout/            ← unchanged
  router/
    ProtectedRoute.tsx        ← updated: uses useAuth
    index.tsx                 ← updated: layout routes for wrappers
```
