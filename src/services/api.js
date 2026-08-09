// src/services/api.js
// NOTE: window.BACKEND_URL is set in /config.js — it must point to the live Render backend.

const API_URL = (window.BACKEND_URL ? window.BACKEND_URL + '/api' : null)
  || (window.process && window.process.env && window.process.env.VITE_API_URL)
  || (() => {
    console.error(
      '[API] CRITICAL: window.BACKEND_URL is not set. ' +
      'Open config.js and set it to your Render backend URL. ' +
      'All API calls will fail until this is fixed.'
    );
    // Last-resort fallback — works only in local dev, NEVER on Vercel
    return 'http://localhost:3000/api';
  })();

console.log('[API] Base URL:', API_URL);

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s — Render free tier cold starts can take ~10s
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ── Request interceptor — attach fresh Supabase auth token ──────────────────
apiClient.interceptors.request.use(async config => {
  // 1. Try to get a fresh token directly from Supabase client (most reliable)
  try {
    if (window.supabase && window.supabase.auth) {
      const { data } = await window.supabase.auth.getSession();
      const freshToken = data?.session?.access_token;
      if (freshToken) {
        // Keep localStorage in sync
        localStorage.setItem('mokshita_token', freshToken);
        config.headers.Authorization = `Bearer ${freshToken}`;
        return config;
      }
    }
  } catch (_) {
    // Supabase not available — fall through to localStorage
  }

  // 2. Fallback: use stored token (set during login or auth state change)
  const token = localStorage.getItem('mokshita_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401, 500, network errors ───────────────────
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const url    = error.config?.url || '';

    if (!error.response) {
      // Pure network error — CORS block, Render offline, timeout
      console.error(
        `[API] Network error on ${error.config?.method?.toUpperCase()} ${API_URL}${url}. ` +
        'Check: (1) Render is not sleeping, (2) ALLOWED_ORIGINS includes this domain, ' +
        '(3) BACKEND_URL in config.js is correct.'
      );
    } else if (status === 401) {
      // Token invalid/expired — keep it and signal the app
      // NOTE: Do NOT redirect or clear here.
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { url } }));
      console.warn("401 received - keeping token, possible mismatch");
    } else if (status === 500) {
      // Backend crash — most likely missing SUPABASE_URL/ANON_KEY env vars on Render
      console.error(
        `[API] 500 Server Error on ${error.config?.method?.toUpperCase()} ${API_URL}${url}. ` +
        'Check Render logs. Most likely cause: SUPABASE_URL or SUPABASE_ANON_KEY env vars not set.'
      );
    } else if (status === 403) {
      console.error(
        `[API] 403 CORS/Forbidden on ${API_URL}${url}. ` +
        'Ensure ALLOWED_ORIGINS on Render includes: ' + window.location.origin
      );
    }
    return Promise.reject(error);
  }
);



window.apiService = {
  getBaseUrl: () => API_URL.replace('/api', ''),

  /**
   * Health check — call this from browser DevTools to verify backend is alive.
   * Usage: window.apiService.getApiHealth().then(console.log)
   */
  getApiHealth: async () => {
    try {
      const response = await axios.get(
        API_URL.replace('/api', '') + '/health',
        { timeout: 10000 }
      );
      console.log('[API] Health check OK:', response.data);
      return { ok: true, data: response.data };
    } catch (error) {
      console.error('[API] Health check FAILED:', error.message);
      return { ok: false, error: error.message };
    }
  },

  // Product APIs
  products: {
    getAll: async () => {
      try {
        const response = await apiClient.get('/products');
        return { data: response.data, error: null };
      } catch (error) {
        console.error('[API] Error fetching products:', error);
        return { data: null, error };
      }
    },
    getById: async (id) => {
      try {
        const response = await apiClient.get(`/products/${id}`);
        return { data: response.data, error: null };
      } catch (error) {
        console.error(`[API] Error fetching product ${id}:`, error);
        return { data: null, error };
      }
    },
    getBySlug: async (slug) => {
      try {
        const response = await apiClient.get(`/products/slug/${slug}`);
        return { data: response.data, error: null };
      } catch (error) {
        console.error(`[API] Error fetching product by slug ${slug}:`, error);
        return { data: null, error };
      }
    },
    /**
     * GET /api/products/detail/:slug
     * Rich endpoint — returns:
     *   product.images[]       → gallery array
     *   product.category       → { id, name, slug }
     *   product.subcategory    → { id, name, slug }
     *   product.stock_status   → 'in_stock' | 'low_stock' | 'out_of_stock'
     *   product.seo            → { title, description, og_image, canonical_slug }
     *   related_products[]     → up to 4 same-category active products
     */
    getDetail: async (slug) => {
      try {
        const response = await apiClient.get(`/products/detail/${slug}`);
        return { data: response.data, error: null };
      } catch (error) {
        console.error(`[API] Error fetching product detail ${slug}:`, error);
        return { data: null, error };
      }
    },
    /** GET /api/products/featured  → featured products array */
    getFeatured: async (limit = 8) => {
      try {
        const response = await apiClient.get('/products/featured', { params: { limit } });
        return { data: response.data, error: null };
      } catch (error) {
        console.error('[API] Error fetching featured products:', error);
        return { data: null, error };
      }
    },
    /** GET /api/products/search?q=  → full-text search */
    search: async (query, params = {}) => {
      try {
        const response = await apiClient.get('/products/search', { params: { q: query, ...params } });
        return { data: response.data, error: null };
      } catch (error) {
        console.error(`[API] Error searching products "${query}":`, error);
        return { data: null, error };
      }
    }
  },

  // Auth APIs
  auth: {
    login: async (email, password) => {
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    register: async (email, password, full_name) => {
      try {
        const response = await apiClient.post('/auth/register', { email, password, full_name });
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    getMe: async () => {
      try {
        const response = await apiClient.get('/auth/me');
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    updateProfile: async (profileData) => {
      try {
        const response = await apiClient.put('/auth/profile', profileData);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    forgotPassword: async (email) => {
      try {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    resetPassword: async (payload) => {
      try {
        const response = await apiClient.post('/auth/reset-password', payload);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    }
  },

  // Cart APIs
  cart: {
    getCart: async () => {
      try {
        const response = await apiClient.get('/cart');
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    addToCart: async (product_id, quantity = 1) => {
      try {
        const response = await apiClient.post('/cart', { product_id, quantity });
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    updateCartItem: async (id, quantity) => {
      try {
        const response = await apiClient.put(`/cart/item/${id}`, { quantity });
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    removeCartItem: async (id) => {
      try {
        const response = await apiClient.delete(`/cart/item/${id}`);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    syncCart: async (items) => {
      try {
        const response = await apiClient.post('/cart/sync', { items });
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    }
  },

  // Order APIs
  orders: {
    getMyOrders: async () => {
      try {
        const response = await apiClient.get('/orders/my-orders');
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    },
    checkout: async (checkoutData, config = {}) => {
      try {
        const response = await apiClient.post('/orders/checkout', checkoutData, config);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message };
      }
    }
  },

  // Category APIs
  categories: {
    getAll: async () => {
      try {
        const response = await apiClient.get('/categories');
        return { data: response.data, error: null };
      } catch (error) {
        console.error('[API] Error fetching categories:', error);
        return { data: null, error };
      }
    },
    getBySlug: async (slug) => {
      try {
        const response = await apiClient.get(`/categories/${slug}`);
        return { data: response.data, error: null };
      } catch (error) {
        console.error(`[API] Error fetching category ${slug}:`, error);
        return { data: null, error };
      }
    },
    getProducts: async (slug, params = {}) => {
      try {
        const response = await apiClient.get(`/categories/${slug}/products`, { params });
        return { data: response.data, error: null };
      } catch (error) {
        console.error(`[API] Error fetching products for category ${slug}:`, error);
        return { data: null, error };
      }
    }
  },

  // Subcategory APIs
  subcategories: {
    getAll: async () => {
      try {
        const response = await apiClient.get('/subcategories');
        return { data: response.data, error: null };
      } catch (error) {
        console.error('[API] Error fetching subcategories:', error);
        return { data: null, error };
      }
    },
    getProducts: async (slug, params = {}) => {
      try {
        const response = await apiClient.get(`/subcategories/${slug}/products`, { params });
        return { data: response.data, error: null };
      } catch (error) {
        console.error(`[API] Error fetching products for subcategory ${slug}:`, error);
        return { data: null, error };
      }
    }
  },

  // CMS Content APIs
  content: {
    /** GET /api/content/homepage  → { hero, stats, benefits } */
    getHomepage: async () => {
      try {
        const response = await apiClient.get('/content/homepage');
        return { data: response.data, error: null };
      } catch (error) {
        console.error('[API] Error fetching homepage content:', error);
        return { data: null, error };
      }
    },
    /** GET /api/content/brand  → { statistics, founder_quote } */
    getBrand: async () => {
      try {
        const response = await apiClient.get('/content/brand');
        return { data: response.data, error: null };
      } catch (error) {
        console.error('[API] Error fetching brand content:', error);
        return { data: null, error };
      }
    },
    /** GET /api/content/footer  → footer links data */
    getFooter: async () => {
      try {
        const response = await apiClient.get('/content/footer');
        return { data: response.data, error: null };
      } catch (error) {
        console.error('[API] Error fetching footer content:', error);
        return { data: null, error };
      }
    },
    /** GET /api/content/:key  → any section by key */
    getByKey: async (key) => {
      try {
        const response = await apiClient.get(`/content/${key}`);
        return { data: response.data, error: null };
      } catch (error) {
        console.error(`[API] Error fetching content key "${key}":`, error);
        return { data: null, error };
      }
    }
  },

  // Leads / Contact Form
  leads: {
    /** POST /api/leads  → submit a contact form */
    submit: async (formData) => {
      try {
        const response = await apiClient.post('/leads', formData);
        return { data: response.data, error: null };
      } catch (error) {
        console.error('[API] Error submitting lead:', error);
        return { data: null, error };
      }
    }
  }
};




