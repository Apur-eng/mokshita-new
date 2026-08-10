/* ============================================================
   CART — API-backed with localStorage fallback
   ============================================================ */

'use strict';

async function getFreshAuthToken() {
  try {
    const { data } = await window.supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (e) {
    console.warn("Token fetch failed", e);
    return null;
  }
}

// ── Cart Badge Update ────────────────────────────────────────
async function updateCartUI() {
  let count = 0;

  try {
    const local = JSON.parse(localStorage.getItem('mokshita_cart') || '[]');
    count = local.reduce((s, i) => s + (i.quantity || 0), 0);
  } catch (err) {
    console.error('[Cart] updateCartUI error:', err);
  }

  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.innerText = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Sync Guest Cart ──────────────────────────────────────────
async function syncGuestCart() {
  // Cart is now strictly stored in localStorage, no backend sync required.
  return Promise.resolve();
}
window.syncGuestCart = syncGuestCart;

// ── Add To Cart ──────────────────────────────────────────────
async function addToCart(productId, quantity = 1) {
  let actualProductId = productId;
  if (typeof actualProductId === 'string' && actualProductId.includes(':')) {
    actualProductId = actualProductId.split(':')[0];
  }
  const productData = (window.products || []).find(p => p.id === actualProductId || p.dbId === actualProductId);
  if (productData && productData.dbId) {
    actualProductId = productData.dbId;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(actualProductId)) {
    console.error('[Cart] Cannot add to cart, actualProductId is not a UUID:', actualProductId);
    if (window.App && window.App.UI) window.App.UI.showError('Error adding to cart. Product data invalid.');
    return;
  }

  const local = JSON.parse(localStorage.getItem('mokshita_cart') || '[]');
  const existing = local.find(i => i.id === actualProductId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    local.push({ id: actualProductId, quantity });
  }
  localStorage.setItem('mokshita_cart', JSON.stringify(local));
  
  if (window.App && window.App.UI) window.App.UI.showSuccess('Added to Cart!');
  await updateCartUI();
  if (typeof renderCart === 'function') await renderCart();
}

// ── Remove From Cart ─────────────────────────────────────────
async function removeFromCart(productId) {
  let actualProductId = productId;
  if (typeof actualProductId === 'string' && actualProductId.includes(':')) {
    actualProductId = actualProductId.split(':')[0];
  }
  const productData = (window.products || []).find(p => p.id === actualProductId || p.dbId === actualProductId);
  if (productData && productData.dbId) actualProductId = productData.dbId;

  const local = JSON.parse(localStorage.getItem('mokshita_cart') || '[]');
  localStorage.setItem('mokshita_cart', JSON.stringify(local.filter(i => i.id !== actualProductId)));
  await updateCartUI();
  if (typeof renderCart === 'function') await renderCart();
}

// ── Update Quantity ──────────────────────────────────────────
async function updateQuantity(productId, quantity) {
  if (quantity <= 0) {
    await removeFromCart(productId);
    return;
  }

  let actualProductId = productId;
  if (typeof actualProductId === 'string' && actualProductId.includes(':')) {
    actualProductId = actualProductId.split(':')[0];
  }
  const productData = (window.products || []).find(p => p.id === actualProductId || p.dbId === actualProductId);
  if (productData && productData.dbId) actualProductId = productData.dbId;

  const local = JSON.parse(localStorage.getItem('mokshita_cart') || '[]');
  const item = local.find(i => i.id === actualProductId);
  if (item) item.quantity = quantity;
  localStorage.setItem('mokshita_cart', JSON.stringify(local));
  await updateCartUI();
  if (typeof renderCart === 'function') await renderCart();
}

window.updateQuantityFallback = async function(productId, change) {
    let actualProductId = productId;
    if (typeof actualProductId === 'string' && actualProductId.includes(':')) {
        actualProductId = actualProductId.split(':')[0];
    }
    const productData = (window.products || []).find(p => p.id === actualProductId || p.dbId === actualProductId);
    if (productData && productData.dbId) actualProductId = productData.dbId;

    const local = JSON.parse(localStorage.getItem('mokshita_cart') || '[]');
    const item = local.find(i => i.id === actualProductId);
    if (item) { item.quantity = Math.max(1, item.quantity + change); }
    localStorage.setItem('mokshita_cart', JSON.stringify(local));
    
    if(typeof renderCart === 'function') await renderCart();
    await updateCartUI();
}

// ── Checkout: Cart → Orders ──────────────────────────────────
window.checkoutToOrderFull = async function(addressData, paymentMethod, subtotal, shippingCost, totalAmount) {
  // STEP 7: Prevent multiple requests
  if (window.checkoutInProgress) {
    console.log("Checkout already in progress, ignoring click.");
    return { error: 'Checkout in progress. Please wait.' };
  }
  window.checkoutInProgress = true;

  const button = document.getElementById('btn-place-order');
  if (button) {
    button.disabled = true;
    button.textContent = 'Processing...';
  }

  // --- ANTI-SPAM & RATE LIMITING ---
  const lastOrderTime = localStorage.getItem('mokshita_last_order');
  const now = Date.now();
  if (lastOrderTime && now - parseInt(lastOrderTime) < 60000) { // 1 min limit
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: 'Please wait a minute before placing another order.' };
  }
  if (addressData.honeypot) {
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: 'Spam detected.' };
  }

  // --- STRICT INPUT VALIDATION ---
  if (!addressData.name || addressData.name.trim().length < 2) {
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: 'Please enter a valid name.' };
  }
  if (!addressData.phone || !/^[0-9\s\+\-]{10,15}$/.test(addressData.phone)) {
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: 'Please enter a valid phone number.' };
  }
  if (!addressData.pincode || !/^[0-9]{5,6}$/.test(addressData.pincode)) {
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: 'Please enter a valid 5 or 6 digit pincode.' };
  }

  // 5. ADD PAYMENT METHOD SAFETY CHECK
  const selectedPayment = document.querySelector('input[name="payment_method"]:checked') || document.querySelector('input[name="payment"]:checked');
  const finalPaymentMethod = paymentMethod || (selectedPayment ? selectedPayment.value : null);

  if (!finalPaymentMethod) {
    alert("Please select a payment method");
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: 'Please select a payment method' };
  }

  const normalizedPaymentMethod = String(finalPaymentMethod).toUpperCase() === 'RAZORPAY' ? 'RAZORPAY' : 'COD';
  
  let cartItems = [];
  const local = JSON.parse(localStorage.getItem('mokshita_cart') || '[]');
  cartItems = local.map(i => {
      // Convert local ID to DB UUID if needed
      let actualProductId = i.id;
      if (typeof actualProductId === 'string' && actualProductId.includes(':')) {
        actualProductId = actualProductId.split(':')[0];
      }
      const productData = (window.products || []).find(p => p.id === actualProductId || p.dbId === actualProductId);
      if (productData && productData.dbId) {
        actualProductId = productData.dbId;
      }
      const price = productData ? parseFloat(productData.price) : 0;
      return { 
          product_id: actualProductId, 
          quantity: parseInt(i.quantity, 10) || 1,
          price: price
      };
  });

  // STEP 3: Ensure items array is NOT empty
  if (cartItems.length === 0) {
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: 'Cart is empty' };
  }

  // STEP 3: Ensure total_amount is calculated correctly
  const calculatedSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculatedShipping = calculatedSubtotal > 5000 ? 0 : 250;
  const calculatedTotal = calculatedSubtotal + calculatedShipping;
  const total_amount = typeof totalAmount === 'number' && !isNaN(totalAmount) ? totalAmount : calculatedTotal;

  // STEP 3: Ensure shipping_address is not empty/null
  const shippingAddress = addressData.address || '';
  if (!shippingAddress || shippingAddress.trim() === '') {
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: 'Shipping address is required.' };
  }

  // STEP 6: Ensure token exists
  const freshToken = await getFreshAuthToken();
  const existingToken = localStorage.getItem("mokshita_token") || sessionStorage.getItem("mokshita_token");
  const token = freshToken || existingToken;

  if (!token) {
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    alert("You must be logged in to place an order.");
    window.location.href = "login.html?redirect=cart.html";
    return { error: 'Authentication token is missing. Please log in again.' };
  }

  // STEP 2 & 4: Ensure payload structure is correct and naming uses snake_case
  const payload = {
      // Backend validator expected fields:
      customer_name: addressData.name || '',
      email:         addressData.email || '',
      phone:         addressData.phone || '',
      address_line:  shippingAddress,
      city:          addressData.city || '',
      state:         addressData.state || '',
      pincode:       addressData.pincode || '',
      landmark:      addressData.landmark || '',
      country:       addressData.country || 'India',

      // STEP 2 structure:
      items:            cartItems,
      total_amount:     total_amount,
      shipping_address: shippingAddress,
      payment_method:   normalizedPaymentMethod
  };

  // STEP 1: Add debug log before request
  console.log("Checkout payload:", payload);

  let response;
  try {
    // STEP 5: Add Authorization header
    response = await window.apiService.orders.checkout(payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    });
  } catch (err) {
    response = { data: null, error: err.message || err };
  }

  const { data, error } = response;

  if (error) {
    console.error('[Checkout] Error creating order:', error);
    if (button) {
      button.disabled = false;
      button.textContent = 'Place Order';
    }
    window.checkoutInProgress = false;
    return { error: error };
  }

  // Clear cart
  localStorage.removeItem('mokshita_cart');

  console.log('[Checkout] Order created:', data.order.id);
  localStorage.setItem('mokshita_last_order', Date.now().toString());
  await updateCartUI();
  
  window.checkoutInProgress = false;
  return { success: true, orderId: data.order.id, orderNumber: data.order.order_number, total: data.order.total };
}

// ── Inject CSS ───────────────────────────────────────────────
const cartStyle = document.createElement('style');
cartStyle.innerHTML = `
.nav-cart { position: relative; display: flex; align-items: center; color: var(--text-color, #1a231e); margin-left: 20px; text-decoration: none; }
.cart-badge {
  position: absolute; top: -8px; right: -8px;
  background: #c26a3d; color: #fff;
  width: 18px; height: 18px; border-radius: 50%;
  font-size: 0.7rem; display: flex; align-items: center; justify-content: center;
  font-family: 'Inter', sans-serif; font-weight: bold;
}
`;
document.head.appendChild(cartStyle);

// ── Initialize ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', updateCartUI);
