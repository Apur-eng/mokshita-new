// src/services/api.js

const API_URL = (window.process && window.process.env && window.process.env.VITE_API_URL) 
  || 'http://localhost:3000/api';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header if token exists in localStorage
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('mokshita_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('mokshita_token');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

window.apiService = {
  getBaseUrl: () => API_URL.replace('/api', ''),
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
    resetPassword: async (token, newPassword) => {
      try {
        const response = await apiClient.post('/auth/reset-password', { token, newPassword });
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
    checkout: async (checkoutData) => {
      try {
        const response = await apiClient.post('/orders/checkout', checkoutData);
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




