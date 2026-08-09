/**
 * ============================================================
 * MOKSHITA ENTERPRISES — API SERVICE
 * src/services/api.js
 * ============================================================
 *
 * LOADING ORDER (required):
 *   1. config.js          → sets window.BACKEND_URL
 *   2. axios CDN script   → makes axios available globally
 *   3. THIS FILE          → creates window.apiService
 *
 * USAGE:
 *   const { data, error } = await window.apiService.auth.login(email, password);
 *
 * Every function returns { data, error }.
 * On success:  { data: <parsed JSON from backend>, error: null }
 * On failure:  { data: null, error: <error message string> }
 *
 * Authentication:
 *   JWT is read from localStorage key 'mokshita_token' and sent
 *   automatically as  Authorization: Bearer <token>  on every request.
 *   On a 401 response the token is cleared from localStorage.
 * ============================================================
 */

'use strict';

/* ─── Base URL Resolution ──────────────────────────────────────────────────── */

/**
 * Resolve the backend base URL.
 * Priority:
 *  1. window.BACKEND_URL set by config.js  (production / staging)
 *  2. VITE / webpack env var               (build-time injection)
 *  3. Localhost fallback for local dev
 */
const API_BASE_URL = (
  (window.BACKEND_URL ? window.BACKEND_URL : null) ||
  (window.process && window.process.env && window.process.env.VITE_API_URL) ||
  'http://localhost:5000'
);

const API_URL = API_BASE_URL + '/api';

/* ─── Axios Instance ──────────────────────────────────────────────────────── */

if (typeof axios === 'undefined') {
  console.error(
    '[API] axios is not loaded. Ensure the axios CDN <script> appears ' +
    'BEFORE src/services/api.js in your HTML.'
  );
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Request Interceptor — Attach JWT ────────────────────────────────────── */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mokshita_token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response Interceptor — Handle 401 / 403 ────────────────────────────── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Token expired or invalid — clear it so the next page-load forces login
        localStorage.removeItem('mokshita_token');
      }
      if (status === 403) {
        console.warn('[API] Access forbidden (403). You do not have permission for this action.');
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Helper: wrap every call in { data, error } ─────────────────────────── */
async function call(fn) {
  try {
    const response = await fn();
    return { data: response.data, error: null };
  } catch (err) {
    let message = 'An unexpected error occurred. Please try again.';
    if (err.response && err.response.data) {
      const body = err.response.data;
      message = body.message || body.error || JSON.stringify(body);
    } else if (err.request) {
      message = 'Network error — could not reach the server. Check your connection.';
    } else if (err.message) {
      message = err.message;
    }
    console.error('[API] Error:', message, err);
    return { data: null, error: message };
  }
}

/* ============================================================
   AUTH MODULE
   Backend: /api/auth/*
   Routes:  src/routes/auth.routes.js
   ============================================================ */
const auth = {
  /**
   * POST /api/auth/register
   * Body: { email, password, full_name? }
   * Returns: { success, token, user }
   * Auth: none
   */
  register: (email, password, fullName) =>
    call(() => apiClient.post('/auth/register', {
      email,
      password,
      full_name: fullName || null,
    })),

  /**
   * POST /api/auth/login
   * Body: { email, password }
   * Returns: { success, token, user }
   * Auth: none
   */
  login: (email, password) =>
    call(() => apiClient.post('/auth/login', { email, password })),

  /**
   * POST /api/auth/logout
   * Body: none
   * Returns: { success, message }
   * Auth: optional (clears server-side session if any)
   */
  logout: () =>
    call(() => apiClient.post('/auth/logout')),

  /**
   * GET /api/auth/me
   * Returns: user profile row from local DB
   * Auth: Bearer token required
   */
  getMe: () =>
    call(() => apiClient.get('/auth/me')),

  /**
   * PUT /api/auth/profile
   * Body: { full_name?, phone?, address_line?, city?, state?, pincode?, country? }
   * Returns: { success, user }
   * Auth: Bearer token required
   */
  updateProfile: (profileData) =>
    call(() => apiClient.put('/auth/profile', profileData)),

  /**
   * POST /api/auth/forgot-password
   * Body: { email }
   * Returns: { success, message }
   * Auth: none
   */
  forgotPassword: (email) =>
    call(() => apiClient.post('/auth/forgot-password', { email })),

  /**
   * POST /api/auth/reset-password
   * Body: { access_token, refresh_token, password, type }
   * Returns: { success, message }
   * Auth: none (tokens in body)
   */
  resetPassword: (payload) =>
    call(() => apiClient.post('/auth/reset-password', payload)),

  /**
   * POST /api/auth/verify-email
   * Body: { token?, email? }
   * Returns: { success, message }
   * Auth: none
   */
  verifyEmail: (token, email) =>
    call(() => apiClient.post('/auth/verify-email', { token, email })),
};

/* ============================================================
   PRODUCTS MODULE
   Backend: /api/products/*
   Routes:  src/routes/product.routes.js
   ============================================================ */
const products = {
  /**
   * GET /api/products
   * Query: ?category=&subcategory=&limit=&page=&in_stock=
   * Returns: { success, products[], total, page, limit }
   * Auth: none
   */
  getAll: (params) =>
    call(() => apiClient.get('/products', { params })),

  /**
   * GET /api/products/featured
   * Query: ?limit=12
   * Returns: { success, products[], is_fallback }
   * Auth: none
   */
  getFeatured: (limit = 12) =>
    call(() => apiClient.get('/products/featured', { params: { limit } })),

  /**
   * GET /api/products/search
   * Query: { q, limit?, page?, in_stock?, category? }
   * Returns: { success, products[], total }
   * Auth: none
   */
  search: (query, params = {}) =>
    call(() => apiClient.get('/products/search', {
      params: { q: query, ...params },
    })),

  /**
   * GET /api/products/detail/:slug
   * Returns: { success, product{...images[], related_products[]}, related_products[] }
   * Auth: none  — enriched endpoint with gallery + related products
   */
  getDetail: (slug) =>
    call(() => apiClient.get('/products/detail/' + encodeURIComponent(slug))),

  /**
   * GET /api/products/:slug
   * Returns: { success, data: product }
   * Auth: none  — legacy basic endpoint
   */
  getBySlug: (slug) =>
    call(() => apiClient.get('/products/' + encodeURIComponent(slug))),

  /* ── Admin-only ─────────────────────────────────────────── */

  /**
   * POST /api/products
   * Body: { name, price, stock, description?, category_id?, slug?, ... }
   * Auth: Bearer + admin role
   */
  create: (productData) =>
    call(() => apiClient.post('/products', productData)),

  /**
   * PUT /api/products/:id
   * Body: { name?, price?, stock?, description?, ... }
   * Auth: Bearer + admin role
   */
  update: (id, productData) =>
    call(() => apiClient.put('/products/' + id, productData)),

  /**
   * DELETE /api/products/:id
   * Auth: Bearer + admin role
   */
  delete: (id) =>
    call(() => apiClient.delete('/products/' + id)),
};

/* ============================================================
   CATEGORIES MODULE
   Backend: /api/categories/*
   Routes:  src/routes/category.routes.js
   ============================================================ */
const categories = {
  /**
   * GET /api/categories
   * Returns: { success, data: category[] }   (each with subcategories[])
   * Auth: none
   */
  getAll: (params) =>
    call(() => apiClient.get('/categories', { params })),

  /**
   * GET /api/categories/featured
   * Returns: { success, data: category[] }   homepage spotlight categories
   * Auth: none
   */
  getFeatured: () =>
    call(() => apiClient.get('/categories/featured')),

  /**
   * GET /api/categories/subcategories
   * Returns: { success, data: subcategory[] }   all subcategories (legacy compat)
   * Auth: none
   */
  getAllSubcategories: () =>
    call(() => apiClient.get('/categories/subcategories')),

  /**
   * GET /api/categories/:slug
   * Returns: { success, data: category }
   * Auth: none
   */
  getBySlug: (slug) =>
    call(() => apiClient.get('/categories/' + encodeURIComponent(slug))),

  /**
   * GET /api/categories/:slug/products
   * Query: ?page=&limit=&sort=
   * Returns: { success, category, products[], total, page, limit }
   * Auth: none
   */
  getProducts: (slug, params) =>
    call(() => apiClient.get('/categories/' + encodeURIComponent(slug) + '/products', { params })),

  /**
   * GET /api/categories/:slug/subcategories
   * Returns: { success, data: subcategory[] }
   * Auth: none
   */
  getSubcategories: (slug) =>
    call(() => apiClient.get('/categories/' + encodeURIComponent(slug) + '/subcategories')),
};

/* ============================================================
   SUBCATEGORIES MODULE
   Backend: /api/subcategories/*
   Routes:  src/routes/subcategory.routes.js
   ============================================================ */
const subcategories = {
  /**
   * GET /api/subcategories
   * Returns: { success, data: subcategory[] }   (enriched with parent category)
   * Auth: none
   */
  getAll: () =>
    call(() => apiClient.get('/subcategories')),

  /**
   * GET /api/subcategories/:slug
   * Returns: { success, data: subcategory{...parent_category} }
   * Auth: none
   */
  getBySlug: (slug) =>
    call(() => apiClient.get('/subcategories/' + encodeURIComponent(slug))),

  /**
   * GET /api/subcategories/:slug/products
   * Query: ?page=&limit=&sort=
   * Returns: { success, subcategory, products[], total }
   * Auth: none
   *
   * Used by handicrafts.js when a subcategory pill is clicked.
   */
  getProducts: (slug, params) =>
    call(() => apiClient.get('/subcategories/' + encodeURIComponent(slug) + '/products', { params })),
};

/* ============================================================
   CART MODULE
   Backend: /api/cart/*
   Routes:  src/routes/cart.routes.js
   NOTE: ALL cart routes require authentication (router.use(authenticateToken))
   ============================================================ */
const cart = {
  /**
   * GET /api/cart
   * Returns: { success, data: { items[], total_items, subtotal } }
   * Auth: Bearer token required
   */
  getCart: () =>
    call(() => apiClient.get('/cart')),

  /**
   * POST /api/cart
   * Body: { product_id (UUID), quantity? }
   * Returns: { success, message, item }
   * Auth: Bearer token required
   */
  addToCart: (productId, quantity = 1) =>
    call(() => apiClient.post('/cart', { product_id: productId, quantity })),

  /**
   * PUT /api/cart/item/:id
   * Body: { quantity }
   * Returns: { success, message, item }
   * Auth: Bearer token required
   *
   * :id is the cart_item row id (not the product_id)
   */
  updateCartItem: (cartItemId, quantity) =>
    call(() => apiClient.put('/cart/item/' + cartItemId, { quantity })),

  /**
   * DELETE /api/cart/item/:id
   * Returns: { success, message }
   * Auth: Bearer token required
   *
   * :id is the cart_item row id
   */
  removeCartItem: (cartItemId) =>
    call(() => apiClient.delete('/cart/item/' + cartItemId)),

  /**
   * POST /api/cart/sync
   * Body: { items: [{ product_id (UUID), quantity }] }
   * Returns: { success, message, synced_count }
   * Auth: Bearer token required
   *
   * Bulk-upserts localStorage guest cart items into the backend cart.
   * Called after a guest logs in.
   */
  syncCart: (items) =>
    call(() => apiClient.post('/cart/sync', { items })),
};

/* ============================================================
   ORDERS MODULE
   Backend: /api/orders/*
   Routes:  src/routes/order.routes.js
   ============================================================ */
const orders = {
  /**
   * POST /api/orders/checkout
   * Body: {
   *   customer_name, email, phone,
   *   address_line, city, state, pincode, country?,
   *   payment_method?,
   *   items: [{ product_id (UUID), quantity }]
   * }
   * Returns: { success, order: { id, order_number, total, status, ... } }
   * Auth: optional — Bearer token attaches the order to user if present,
   *        guest checkout works without it (user_id will be null in DB)
   *
   * Used by cart.js → checkoutToOrderFull()
   */
  checkout: (orderPayload) =>
    call(() => apiClient.post('/orders/checkout', orderPayload)),

  /**
   * GET /api/orders/my-orders
   * Returns: { success, orders[] }
   * Auth: Bearer token required
   *
   * Used by account.js → loadOrders()
   */
  getMyOrders: () =>
    call(() => apiClient.get('/orders/my-orders')),
};

/* ============================================================
   PAYMENTS MODULE
   Backend: /api/payments/*
   Routes:  src/routes/payment.routes.js
   ============================================================ */
const payments = {
  /**
   * POST /api/payments/create-order
   * Body: { amount_paise (integer ≥ 100), receipt? }
   * Returns: { success, razorpay_order_id, amount, currency }
   * Auth: none (optional — creates a Razorpay order server-side)
   *
   * NOTE: amount_paise is the total in smallest currency unit (₹ × 100).
   *       e.g. ₹499 → 49900
   */
  createOrder: (amountPaise, receipt) =>
    call(() => apiClient.post('/payments/create-order', {
      amount_paise: amountPaise,
      receipt: receipt || undefined,
    })),

  /**
   * POST /api/payments/verify
   * Body: {
   *   razorpay_payment_id,
   *   razorpay_order_id,
   *   razorpay_signature,
   *   order_db_id  (UUID — the ID of the order row in our DB)
   * }
   * Returns: { success, message, order: { id, order_number, status, total } }
   * Auth: none (HMAC signature is the verification mechanism)
   *
   * Called AFTER Razorpay checkout modal's handler() callback completes.
   */
  verifyPayment: (razorpayPaymentId, razorpayOrderId, razorpaySignature, orderDbId) =>
    call(() => apiClient.post('/payments/verify', {
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id:   razorpayOrderId,
      razorpay_signature:  razorpaySignature,
      order_db_id:         orderDbId,
    })),

  /**
   * GET /api/payments/:orderId/status
   * Returns: { success, order: { id, order_number, status, ... } }
   * Auth: none
   *
   * orderId can be the DB UUID or the order_number string.
   */
  getStatus: (orderId) =>
    call(() => apiClient.get('/payments/' + encodeURIComponent(orderId) + '/status')),
};

/* ============================================================
   CONTENT MODULE (CMS)
   Backend: /api/content/*
   Routes:  src/routes/content.routes.js
   ============================================================ */
const content = {
  /**
   * GET /api/content/homepage
   * Returns: { success, data: { hero, stats, layout, ... } }
   * Auth: none
   *
   * Used by homepage-cms.js
   */
  getHomepage: () =>
    call(() => apiClient.get('/content/homepage')),

  /**
   * GET /api/content/brand
   * Returns: { success, data: { founder_quote, statistics, ... } }
   * Auth: none
   *
   * Used by homepage-cms.js
   */
  getBrand: () =>
    call(() => apiClient.get('/content/brand')),

  /**
   * GET /api/content/about
   * Returns: { success, data: { ... } }
   * Auth: none
   */
  getAbout: () =>
    call(() => apiClient.get('/content/about')),

  /**
   * GET /api/content/footer
   * Returns: { success, data: { ... } }
   * Auth: none
   *
   * Used by homepage-cms.js
   */
  getFooter: () =>
    call(() => apiClient.get('/content/footer')),

  /**
   * GET /api/content/:key
   * Returns: { success, data: any }
   * Auth: none
   */
  getByKey: (key) =>
    call(() => apiClient.get('/content/' + encodeURIComponent(key))),

  /**
   * GET /api/content
   * Returns: { success, data: { [key]: any } }
   * Auth: none
   */
  getAll: () =>
    call(() => apiClient.get('/content')),

  /* ── Admin only ──────────────────────────────────────────── */

  /**
   * PUT /api/content/:key
   * Body: { value: any }
   * Returns: { success, data }
   * Auth: Bearer + admin role
   */
  upsert: (key, value) =>
    call(() => apiClient.put('/content/' + encodeURIComponent(key), { value })),
};

/* ============================================================
   LEADS MODULE (Contact Form)
   Backend: /api/leads/*
   Routes:  src/routes/leads.routes.js
   ============================================================ */
const leads = {
  /**
   * POST /api/leads
   * Body: { name, email, message, phone?, interest?, item? }
   * Returns: { success, message }
   * Auth: none
   *
   * Used by contact.html form submission handler.
   */
  submit: (formData) =>
    call(() => apiClient.post('/leads', formData)),

  /* ── Admin only ──────────────────────────────────────────── */

  /**
   * GET /api/leads
   * Returns: { success, leads[] }
   * Auth: Bearer + admin role
   */
  getAll: () =>
    call(() => apiClient.get('/leads')),
};

/* ============================================================
   NAVIGATION MODULE
   Backend: /api/navigation/*
   Routes:  src/routes/navigation.routes.js
   ============================================================ */
const navigation = {
  /**
   * GET /api/navigation
   * Returns: full desktop nav tree (categories + subcategories)
   * Auth: none
   */
  getAll: () =>
    call(() => apiClient.get('/navigation')),

  /**
   * GET /api/navigation/homepage
   * Returns: homepage category cards (homepage_visible = true)
   * Auth: none
   */
  getHomepage: () =>
    call(() => apiClient.get('/navigation/homepage')),

  /**
   * GET /api/navigation/mobile
   * Returns: mobile-optimized flat nav list
   * Auth: none
   */
  getMobile: () =>
    call(() => apiClient.get('/navigation/mobile')),
};

/* ============================================================
   TRAVEL PACKAGES MODULE
   Backend: /api/travel-packages/*
   Routes:  src/routes/travel.routes.js
   ============================================================ */
const travel = {
  /**
   * GET /api/travel-packages
   * Returns: { success, data: package[] }
   * Auth: none
   */
  getAll: () =>
    call(() => apiClient.get('/travel-packages')),

  /**
   * GET /api/travel-packages/:slug
   * Returns: { success, data: package }
   * Auth: none
   */
  getBySlug: (slug) =>
    call(() => apiClient.get('/travel-packages/' + encodeURIComponent(slug))),
};

/* ============================================================
   ADMIN MODULE
   Backend: /api/admin/*
   Routes:  src/routes/admin.routes.js
   All routes require Bearer token + admin role.
   ============================================================ */
const admin = {
  /* ── Order Management ─────────────────────────────────────── */

  /**
   * GET /api/admin/orders
   * Returns: { success, orders[] }
   * Auth: Bearer + admin
   */
  getAllOrders: (params) =>
    call(() => apiClient.get('/admin/orders', { params })),

  /**
   * PUT /api/admin/orders/:id/status
   * Body: { status: 'received'|'shipped'|'delivered'|'cancelled' }
   * Returns: { success, order }
   * Auth: Bearer + admin
   */
  updateOrderStatus: (orderId, status) =>
    call(() => apiClient.put('/admin/orders/' + orderId + '/status', { status })),

  /**
   * PUT /api/admin/orders/:id/tracking
   * Body: { tracking_note }
   * Returns: { success, order }
   * Auth: Bearer + admin
   */
  updateTrackingNote: (orderId, trackingNote) =>
    call(() => apiClient.put('/admin/orders/' + orderId + '/tracking', { tracking_note: trackingNote })),

  /* ── Category Management ──────────────────────────────────── */

  /**
   * GET /api/admin/categories
   * Returns: { success, categories[] }
   * Auth: Bearer + admin
   */
  getAllCategories: () =>
    call(() => apiClient.get('/admin/categories')),

  /**
   * POST /api/admin/categories
   * Body: { name, slug?, description?, display_order?, homepage_visible?, navigation_visible? }
   * Returns: { success, category }
   * Auth: Bearer + admin
   */
  createCategory: (categoryData) =>
    call(() => apiClient.post('/admin/categories', categoryData)),

  /**
   * PUT /api/admin/categories/:id
   * Body: { name?, slug?, description?, display_order?, homepage_visible?, navigation_visible? }
   * Returns: { success, category }
   * Auth: Bearer + admin
   */
  updateCategory: (id, categoryData) =>
    call(() => apiClient.put('/admin/categories/' + id, categoryData)),

  /**
   * PUT /api/admin/categories/:id/order
   * Body: { display_order }
   * Returns: { success }
   * Auth: Bearer + admin
   */
  updateCategoryOrder: (id, displayOrder) =>
    call(() => apiClient.put('/admin/categories/' + id + '/order', { display_order: displayOrder })),

  /**
   * PUT /api/admin/categories/reorder
   * Body: { items: [{ id, display_order }] }
   * Returns: { success }
   * Auth: Bearer + admin
   */
  reorderCategories: (items) =>
    call(() => apiClient.put('/admin/categories/reorder', { items })),

  /**
   * DELETE /api/admin/categories/:id
   * Returns: { success, message }
   * Auth: Bearer + admin
   */
  deleteCategory: (id) =>
    call(() => apiClient.delete('/admin/categories/' + id)),

  /* ── Subcategory Management ───────────────────────────────── */

  /**
   * POST /api/admin/subcategories
   * Body: { name, category_id (UUID), slug?, display_order?, featured? }
   * Returns: { success, subcategory }
   * Auth: Bearer + admin
   */
  createSubcategory: (subcategoryData) =>
    call(() => apiClient.post('/admin/subcategories', subcategoryData)),

  /**
   * PUT /api/admin/subcategories/:id
   * Body: { name?, slug?, display_order?, featured? }
   * Returns: { success, subcategory }
   * Auth: Bearer + admin
   */
  updateSubcategory: (id, subcategoryData) =>
    call(() => apiClient.put('/admin/subcategories/' + id, subcategoryData)),

  /**
   * DELETE /api/admin/subcategories/:id
   * Returns: { success, message }
   * Auth: Bearer + admin
   */
  deleteSubcategory: (id) =>
    call(() => apiClient.delete('/admin/subcategories/' + id)),

  /* ── Product Category Reassignment ───────────────────────── */

  /**
   * PUT /api/admin/products/:id/category
   * Body: { category_id (UUID) }
   * Returns: { success, product }
   * Auth: Bearer + admin
   */
  reassignProductCategory: (productId, categoryId) =>
    call(() => apiClient.put('/admin/products/' + productId + '/category', { category_id: categoryId })),
};

/* ============================================================
   USERS MODULE
   Backend: /api/auth/* (profile management lives under auth)
   Convenience alias exposing user-facing profile calls clearly.
   ============================================================ */
const users = {
  /**
   * GET /api/auth/me — same as auth.getMe()
   * Returns the authenticated user's profile from our local users table.
   */
  getProfile: () => auth.getMe(),

  /**
   * PUT /api/auth/profile — same as auth.updateProfile()
   * Body: { full_name?, phone?, address_line?, city?, state?, pincode?, country? }
   */
  updateProfile: (profileData) => auth.updateProfile(profileData),
};

/* ============================================================
   UPLOAD MODULE
   Backend: /api/upload
   Routes:  src/routes/upload.routes.js
   Auth:    Bearer + admin
   ============================================================ */
const upload = {
  /**
   * POST /api/upload
   * Body: FormData with file field 'image'
   * Returns: { success, url, filename }
   * Auth: Bearer + admin
   *
   * Uses multipart/form-data — Content-Type header is NOT set manually;
   * axios detects FormData and sets the correct boundary automatically.
   */
  image: (formData) =>
    call(() => apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })),
};

/* ============================================================
   MOUNT ON WINDOW
   ============================================================ */
window.apiService = {
  /* Core modules */
  auth,
  products,
  categories,
  subcategories,
  cart,
  orders,
  payments,
  content,
  leads,
  navigation,
  travel,

  /* Admin / management */
  admin,
  users,
  upload,

  /**
   * getBaseUrl()
   * Returns the backend origin (e.g. https://mokshita-final-release.onrender.com)
   * Used to resolve relative image URLs returned by the backend.
   *   e.g. if (imgUrl.startsWith('/')) imgUrl = window.apiService.getBaseUrl() + imgUrl;
   */
  getBaseUrl: () => API_BASE_URL,
};

console.log('[API] window.apiService ready. Backend:', API_BASE_URL);
