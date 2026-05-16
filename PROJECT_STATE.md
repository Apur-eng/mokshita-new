# Mokhsita Enterprises - Project State

> **CRITICAL DIRECTIVE:** This file is the single source of truth. Before any future architecture change, update this file first, detect possible breakpoints, and do not modify working features unless explicitly approved.

## Core Features Implemented
- User signup/login (Express + PostgreSQL JWT auth via `apiService`)
- Cart system (API-backed for authenticated users; LocalStorage for guests)
- Product listing (Dynamic fetching from Express `/api/products` via `backend-products.js`)
- **Category + subcategory navigation (Dynamic fetching from `/api/categories` and `/api/subcategories` via `category-nav.js`)**
- Order placement (Writes to Express backend via `apiService.orders.checkout`)
- Admin dashboard (Live fetching and management of orders via React + JWT)
- Forgot/Reset password flows
- Account dashboard (Customer profile management and order history reflection)

## Stabilized Architecture (Phase 4 — Dynamic Category System)
The platform utilizes a modular vanilla JavaScript architecture bound by a strict dependency load order.

### Modules
- **`App.UI` (`modules/ui.js`)**: The singular source of truth for user-facing notifications. Replaces all legacy inline `alert()` or manual DOM-based toast manipulations. Methods include `showSuccess(msg)` and `showError(msg)`.
- **`App.Auth` (`modules/auth.js`)**: The singular source of truth for session management, login states, and route protection. Uses `localStorage('mokshita_token')` + `apiService.auth.getMe()`. Methods include `getCurrentUser()`, `requireAuth(redirectUrl)`, `requireGuest(redirectUrl)`, and `logout(redirectUrl)`. **No longer depends on Supabase.**
- **`App.Categories` (`js/category-nav.js`)**: The singular source of truth for category + subcategory data. Fetches from `GET /api/categories`, renders sidebar filter checkboxes dynamically, manages subcategory pill bar, and fires `categoriesLoaded` and `categorySidebarRendered` events. Falls back to local `LOCAL_CATEGORIES` if backend unavailable.

### Product Data Layer (Migrated to Backend)
- **`src/services/api.js`**: Centralized Axios-based API service (`window.apiService`). Handles all backend communication including products, auth, cart, and orders.
- **`js/backend-products.js`**: Fetches all products from `GET /api/products`, maps them to the UI shape, and merges with `js/products.js` local fallback. Fires `productsLoaded` CustomEvent when complete.
- **`js/products.js`**: Local static product catalogue. Used as fallback if backend is unavailable. Always loaded first; overridden by `backend-products.js` on success.
- **`js/supabase-products.js`**: **ORPHANED — do not load.** Replaced by `backend-products.js`. Kept for reference only.

### Legacy Modules (Pending Phase 4)
- **`cart.js`**: Currently acts as a monolithic controller for:
  - API cart state management for authenticated users (`addToCart`, `updateCartQty`, `removeFromCart`, `renderCart`).
  - LocalStorage cart state management for guest users.
  - Checkout logic (`checkoutToOrderFull`): Validates inputs and executes order via `apiService.orders.checkout`.
  - **Note:** Order placement logic intentionally remains in `cart.js` until `modules/orders.js` is established.

## Supabase Dependency Status

As of Phase 6, Supabase has been **completely removed** from the frontend codebase. All systems route through the Node.js Express backend.

| Feature | Status | Notes |
|---|---|---|
| Authentication | ✅ Migrated | Uses `/api/auth/*` |
| Cart | ✅ Migrated | Uses `/api/cart/*` |
| Orders | ✅ Migrated | Uses `/api/orders/*` |
| Products | ✅ Migrated | Uses `/api/products/*` |
| Contact leads form | ✅ Migrated | Uses `/api/leads` |
| Supabase CDN | ✅ Removed | Deleted from `index.html` and `contact.html` |
| `supabaseClient.js` | ✅ Deleted | Permanently removed |
| `supabase-products.js` | ✅ Deleted | Permanently removed |

## Backend API Reference
- **Base URL:** `http://localhost:3000` (configurable in `src/services/api.js`)
- **Product Endpoints:**
  - `GET /api/products` — All products
  - `GET /api/products/:id` — Single product by ID
  - `GET /api/products/slug/:slug` — Product by slug
- **Image URLs:** `http://localhost:3000/uploads/products/...`
- **Auth:** JWT tokens stored in `localStorage('mokshita_token')`

## Script Load Order Requirements
All new and existing HTML pages MUST load scripts in this exact sequence to prevent `undefined` namespace errors:

**All Pages:**
1. `<script src="modules/ui.js"></script>`
2. `<script src="modules/auth.js"></script>`
3. `<script src="js/main.js"></script>` (if needed)
4. `<script src="js/products.js"></script>` (local fallback catalogue)
5. `<script src="js/cart.js"></script>` (if needed)
6. `<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>`
7. `<script src="src/services/api.js"></script>`
8. `<script src="js/backend-products.js"></script>` (triggers `productsLoaded` event)
9. Page-specific scripts

## Authentication Logic Rules
- **DO NOT** use `supabase.auth.getSession()` or `supabase.auth.getUser()` directly in page scripts.
- **DO USE** `App.Auth.getCurrentUser()` for checking session state.
- **DO USE** `App.Auth.requireAuth('login.html')` for protecting private routes.
- **DO USE** `App.Auth.requireGuest('account.html')` for preventing logged-in users from accessing login/signup routes.
- **DO USE** `App.Auth.logout('login.html')` for sign-out triggers.

## UI and Error Handling Rules
- **DO NOT** use native `alert()` or manual DOM element injection for notifications.
- **DO NOT** silently swallow errors via `console.error(err)` without surfacing them to the user.
- **DO USE** `App.UI.showSuccess("Message")` and `App.UI.showError("Message")` for all user-facing notifications.

## Checkout Logic Rules
- **DO NOT** modify `checkoutToOrderFull` without running full regression tests.
- **DO NOT** move `checkoutToOrderFull` out of `cart.js` until Phase 4 (`modules/orders.js`) is explicitly authorized.
- Checkout delegates entirely to `apiService.orders.checkout` — no Supabase involved.

## Architecture Decisions Record (ADR)
1. **`modules/orders.js` Extraction Postponed**: `checkoutToOrderFull` logic remains within `cart.js`.
2. **Authenticated Cart Sync**: Guest cart sync available via `window.syncGuestCart()` when user logs in.

## Deployment Regression Tests
Before deploying any changes, verify the following core flows remain unbroken:
- [ ] User can log in and log out successfully (JWT).
- [ ] Account dashboard correctly loads existing user orders.
- [ ] Guest users are redirected to login when trying to access `/account.html`.
- [ ] Users can add items to the cart and view them in `cart.html`.
- [ ] Checkout form successfully creates an order via backend API and clears the cart on success.
- [ ] Homepage product cards (Best Sellers, New Arrivals) load from backend.
- [ ] Handicrafts page filters and renders products from backend.
- [ ] Product detail page loads correct product data from backend.
- [ ] Contact form still submits leads successfully via `/api/leads`.
