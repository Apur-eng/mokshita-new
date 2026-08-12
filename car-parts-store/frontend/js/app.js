const API_BASE = window.location.origin.includes('5500')
  ? 'http://localhost:4000/api'
  : `${window.location.origin}/api`;

const api = {
  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = localStorage.getItem('autoparts_token');
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  },

  getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/products${qs ? '?' + qs : ''}`);
  },

  getFeatured(limit = 8) {
    return this.request(`/products/featured?limit=${limit}`);
  },

  getProductBySlug(slug) {
    return this.request(`/products/slug/${slug}`);
  },

  getCategories() {
    return this.request('/categories');
  },

  getCategory(slug) {
    return this.request(`/categories/${slug}`);
  },

  validateCart(items) {
    return this.request('/orders/validate', { method: 'POST', body: JSON.stringify({ items }) });
  },

  checkout(payload) {
    return this.request('/orders/checkout', { method: 'POST', body: JSON.stringify(payload) });
  },

  createPaymentSession(orderId) {
    return this.request('/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  },

  verifyOrder(orderId, sessionId) {
    const qs = sessionId ? `?session_id=${sessionId}` : '';
    return this.request(`/payments/verify/${orderId}${qs}`);
  },

  login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },

  register(email, password, full_name, phone) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, phone }),
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  getMyOrders() {
    return this.request('/orders/my-orders');
  },
};

function formatPrice(n) {
  return '$' + Number(n).toFixed(2);
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('autoparts_cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('autoparts_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.classList.toggle('show', count > 0);
  });
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.product_id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      quantity,
    });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart`);
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.product_id !== productId));
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.product_id === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
}

function renderProductCard(p) {
  const stockClass = p.stock === 0 ? 'stock-out' : p.stock < 20 ? 'stock-low' : 'stock-ok';
  const stockText = p.stock === 0 ? 'Out of stock' : p.stock < 20 ? `Only ${p.stock} left` : 'In stock';
  return `
    <article class="product-card">
      <a href="product.html?slug=${p.slug}">
        <div class="product-card-img">
          ${p.featured ? '<span class="product-badge">Featured</span>' : ''}
          <img src="${p.image_url}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="product-card-body">
          <div class="product-brand">${p.brand || ''}</div>
          <h3>${p.name}</h3>
          <p class="product-fitment">${p.vehicle_fitment || ''}</p>
          <div class="product-price-row">
            <span class="price">${formatPrice(p.price)}</span>
            ${p.compare_at_price ? `<span class="price-old">${formatPrice(p.compare_at_price)}</span>` : ''}
          </div>
          <span class="${stockClass}">${stockText}</span>
        </div>
      </a>
      <div style="padding:0 16px 16px;">
        <button class="btn btn-primary btn-sm btn-block add-cart-btn" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
          Add to Cart
        </button>
      </div>
    </article>`;
}

function bindAddToCartButtons(products) {
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const product = products.find(p => p.id === btn.dataset.id);
      if (product) addToCart(product);
    });
  });
}

function updateAuthNav() {
  const token = localStorage.getItem('autoparts_token');
  const accountLink = document.getElementById('account-link');
  if (accountLink) {
    accountLink.href = token ? 'account.html' : 'login.html';
    accountLink.title = token ? 'My Account' : 'Sign In';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateAuthNav();
});

window.api = api;
window.formatPrice = formatPrice;
window.showToast = showToast;
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.renderProductCard = renderProductCard;
window.bindAddToCartButtons = bindAddToCartButtons;
