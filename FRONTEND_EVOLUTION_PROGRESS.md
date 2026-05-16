# Frontend Evolution Progress
**Mokshita Enterprises — Headless Commerce Frontend Migration**
_Last updated: 2026-05-13_

---

## System Overview

The frontend is a **vanilla HTML/CSS/JS storefront** evolving progressively into a fully backend-driven headless commerce experience. Each phase is additive — no structural rewrites, no framework migrations.

### Architecture Invariants (Never Change)
- Modular vanilla JS (`modules/`, `js/`)
- `window.apiService` as the single API gateway
- `window.App.UI` for all user notifications
- `window.App.Auth` for session management
- `window.products` as the live product array
- Local fallback data for all backend dependencies
- Existing CSS/animation system untouched

---

## Completed Phases

---

## ✅ Phase 1 — Homepage CMS Integration
**Completed:** 2026-05-13
**Status:** Stable

### Goal
Replace hardcoded homepage text content with backend-driven CMS rendering via `GET /api/content/*` endpoints, while preserving all layouts, animations, and responsive behavior.

### Pre-Phase Audit
Hardcoded elements identified in `index.html`:
| Element | ID / Selector | Hardcoded Value |
|---|---|---|
| Hero eyebrow | `#hero-eyebrow` | "Real artisans • Real craftsmanship • Real heritage" |
| Hero title | `#hero-title` | "Crafted by Hands. Preserved Through Generations." |
| Hero subtitle | `#hero-subtitle` | "Every purchase directly supports local artisans..." |
| Hero CTAs | `#hero-actions` | Static `<a>` tags |
| Story stats | `.story-stat-num` × 4 | 120+, 18, 2400+, 8 |
| Founder quote | `blockquote` in story section | "India does not lack talent..." |
| Footer brand desc | `footer .footer-brand-desc` | Static paragraph |
| Footer copyright | `.footer-copy` | "© 2025 Mokshita Enterprises..." |

### Files Modified
| File | Change |
|---|---|
| `src/services/api.js` | Added `apiService.content` namespace with `getHomepage()`, `getBrand()`, `getFooter()`, `getByKey()` |
| `index.html` | Added `<script src="js/homepage-cms.js">` after `backend-products.js` |

### Files Created
| File | Purpose |
|---|---|
| `js/homepage-cms.js` | Phase 1 CMS module — fetches and enriches homepage content |

### APIs Consumed
| Endpoint | Used For |
|---|---|
| `GET /api/content/homepage` | Hero text, stats, benefits |
| `GET /api/content/brand` | Founder quote, brand statistics |
| `GET /api/content/footer` | Footer brand description, copyright, column links |

### Hardcoded Logic Removed
- None removed outright — the CMS module uses an **enrichment strategy**: if backend provides data, it overwrites the static HTML text. If the backend is down, the existing hardcoded HTML remains visible unchanged.
- This is intentional: zero regression risk.

### Rendering Flow (After Phase 1)
```
Page loads
  → index.html renders immediately with hardcoded content (instant paint)
  → modules/ui.js, modules/auth.js, js/main.js load
  → axios + api.js + backend-products.js load
  → js/homepage-cms.js loads
      → waits for apiService.content to be available
      → fires 3 parallel requests: /api/content/homepage, /brand, /footer
      → each section enriches independently (failure in one doesn't affect others)
      → dispatches 'homepageCMSLoaded' event
      → exposes window.App.CMS.loaded = true
```

### Fallback Strategy
- Every enrichment function checks for `null`/`undefined` from the API before touching the DOM
- `Promise.allSettled()` used — one failed endpoint never blocks the others
- FALLBACK constants mirror exact hardcoded HTML values (defined inside module)
- Polling mechanism (150ms × 20 attempts) waits for `apiService` if it hasn't loaded yet

### Compatibility Notes
- `window.App.CMS` exposes `{ loaded, timestamp, reload() }` for debugging
- The `homepageCMSLoaded` event allows future modules to know when CMS content is ready
- Counter animation in story stats: `data-target` and `data-suffix` attributes are updated by the CMS module so the existing JS counter animation reflects backend values
- No CSS classes changed — only text content replaced

### Rollback Considerations
- To roll back: remove `<script src="js/homepage-cms.js">` from `index.html` and the content namespace from `api.js`
- The page will immediately revert to hardcoded content with zero visual difference

### Frontend System Health After Phase 1
| System | Status |
|---|---|
| Product rendering | ✅ Unchanged |
| Cart flow | ✅ Unchanged |
| Checkout | ✅ Unchanged |
| Category filtering | ✅ Unchanged |
| Auth flow | ✅ Unchanged |
| Dynamic categories | ✅ Unchanged |
| Slug-based PDP | ✅ Unchanged |
| Homepage CMS | ✅ NEW — backend-enriched, with fallback |

---

## ✅ Phase 2 — Rich Product Detail Consumption
**Completed:** 2026-05-13
**Status:** Stable

### APIs Consumed
| Endpoint | Priority | Returns |
|---|---|---|
| `GET /api/products/detail/:slug` | Primary | `images[]`, `stock_status`, `category{}`, `subcategory{}`, `seo{}`, `related_products[]` |
| `GET /api/products/slug/:slug` | Secondary fallback | Basic product data |
| `window.products` | Tertiary fallback | Local offline data |

### Changes in `normaliseProduct(raw, richRelated)`
- **Gallery**: maps `images[]` from `product_images` table → multi-thumbnail support
- **Stock badge**: 3 states from `stock_status` — `in_stock` ✔ / `low_stock` ⚡ / `out_of_stock` ⚠
- **Related products**: backend's same-category in-stock `related_products[]` preferred over random local shuffle
- **SEO**: full `seo { title, description, og_image }` injected into `<title>`, `<meta>`, `<og:image>`
- **Breadcrumb**: `#breadcrumb-category` updated with real category name + category page link
- **SKU**: injected into `#pdp-sku` if element exists

### Files Modified
- `src/services/api.js` — added `getDetail()`, `getFeatured()`, `search()`
- `product.html` — upgraded `normaliseProduct()`, `renderPDP()`, `initPDP()`

---

## ✅ Phase 3 — Featured Content System
**Completed:** 2026-05-13
**Status:** Stable

### Goal
Replace hardcoded artisan card rows on homepage with `GET /api/products/featured`.

### Files Created
- `js/featured-cms.js` — fetches featured products, injects into `#bs-track` and `#na-track`

### Files Modified
- `index.html` — added `<script src="js/featured-cms.js">`

### Rendering Flow
```
Page loads → hardcoded cards visible immediately
  → featured-cms.js polls for apiService
  → GET /api/products/featured?limit=12
  → split: first half → #bs-track (Best Sellers), second half → #na-track (New Arrivals)
  → injects .artisan-card HTML matching exact existing structure
  → preserves .artisan-card--cta and all row headers/arrows
  → if error → hardcoded cards remain silently
  → fires 'featuredLoaded' event, sets window.App.Featured.loaded = true
```

### Backend Fallback
If no products have `featured=true`, the backend auto-returns newest active products (`is_fallback: true` flag).

---

## ✅ Phase 4 — Search UI Integration
**Completed:** 2026-05-14
**Status:** Stable

### Features Integrated
- **Global Search:** Added `js/global-search.js` — a full-screen overlay accessible via `Ctrl+K` or nav icon. Features predictive debounced results, keyboard nav, and empty states.
- **Backend-Powered Category Search:** Upgraded `js/handicrafts.js` to hit `apiService.products.search` instead of local array when query length >= 2.
- **Fallback Resilience:** Both search implementations fall back silently to filtering `window.products` if the backend is down.
- **Cross-Page Routing:** Global search "View all results" sets `?q=...` which is caught by `handicrafts.js` to automatically trigger a full backend search on load.

---

## ✅ Phase 5 — Admin-Controlled Homepage Sections
**Completed:** 2026-05-14
**Status:** Stable

**Goal:** Make featured sections, banners, and homepage section ordering fully configurable via admin API.

- [x] Integrate `featured-cms.js` to render hero banners from `apiService.content`.
- [x] Configure fallback HTML structure to ensure paint during API latency.
- [x] Connect "Featured Categories" section to API.
- [x] Create dynamic DOM section ordering engine inside `homepage-cms.js`.
- [x] Develop "Homepage CMS" React admin screen to update layout config and hero data.

---

## ✅ Phase 6 — Final Supabase Removal
**Completed:** 2026-05-14
**Status:** Stable

### Goal
Remove all final traces of the legacy Supabase architecture from the storefront.

### Actions Taken
- Created backend endpoint: `POST /api/leads` and `GET /api/leads` (admin).
- Created database migration for `leads` table in backend.
- Refactored `contact.html` lead form to submit via `apiService.leads.submit()`.
- Permanently deleted `js/supabaseClient.js` and `js/supabase-products.js`.
- Frontend is now 100% independent of the Supabase JS SDK.

---

## ✅ Phase 7 — Frontend Polish + Performance
**Completed:** 2026-05-14
**Status:** Stable

**Goal:** Image lazy loading audit, skeleton refinements, transition polish, mobile UX review, performance profiling.
- [x] Removed outdated documentation references to Supabase.
- [x] Identified and fixed missing category admin routes in the dashboard API configuration.
- [x] Audited lazy loading strategy (`loading="lazy"`) across all pages (exempting hero images for LCP optimization).

---

## API Namespace Summary (`window.apiService`)

| Namespace | Methods | Status |
|---|---|---|
| `products` | `getAll()`, `getById()`, `getBySlug()`, `getDetail()`, `getFeatured()`, `search()` | ✅ Live |
| `auth` | `login()`, `register()`, `getMe()`, `logout()`, `forgotPassword()`, `resetPassword()` | ✅ Live |
| `cart` | `get()`, `add()`, `update()`, `remove()`, `clear()` | ✅ Live |
| `orders` | `getAll()`, `getById()`, `checkout()` | ✅ Live |
| `categories` | `getAll()`, `getBySlug()`, `getProducts()` | ✅ Live |
| `subcategories` | `getAll()`, `getProducts()` | ✅ Live |
| `content` | `getHomepage()`, `getBrand()`, `getFooter()`, `getByKey()` | ✅ Phase 1 |
| `leads` | `submit()` | ✅ Phase 6 |

---

## Global State Map

| Global | Set By | Purpose |
|---|---|---|
| `window.products` | `js/products.js` + `js/backend-products.js` | Live product array |
| `window._allProducts` | `js/handicrafts.js` | Subcategory filter backup |
| `window.App.UI` | `modules/ui.js` | Toast notifications |
| `window.App.Auth` | `modules/auth.js` | Session management |
| `window.App.Categories` | `js/category-nav.js` | Category state |
| `window.App.CMS` | `js/homepage-cms.js` | CMS enrichment state (Phase 1) |
| `window.App.Featured` | `js/featured-cms.js` | Featured products state (Phase 3) |
| `window.apiService` | `src/services/api.js` | All API calls |
