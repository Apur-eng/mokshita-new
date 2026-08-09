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
  // 8. PREVENT MULTIPLE REQUESTS (SAFE UX FIX)
  const button = document.getElementById('btn-place-order');
  if (button) button.disabled = true;

  // --- ANTI-SPAM & RATE LIMITING ---
  const lastOrderTime = localStorage.getItem('mokshita_last_order');
  const now = Date.now();
  if (lastOrderTime && now - parseInt(lastOrderTime) < 60000) { // 1 min limit
    if (button) button.disabled = false;
    return { error: 'Please wait a minute before placing another order.' };
  }
  if (addressData.honeypot) {
    if (button) button.disabled = false;
    return { error: 'Spam detected.' };
  }

  // --- STRICT INPUT VALIDATION ---
  if (!addressData.name || addressData.name.trim().length < 2) {
    if (button) button.disabled = false;
    return { error: 'Please enter a valid name.' };
  }
  if (!addressData.phone || !/^[0-9\s\+\-]{10,15}$/.test(addressData.phone)) {
    if (button) button.disabled = false;
    return { error: 'Please enter a valid phone number.' };
  }
  if (!addressData.pincode || !/^[0-9]{5,6}$/.test(addressData.pincode)) {
    if (button) button.disabled = false;
    return { error: 'Please enter a valid 5 or 6 digit pincode.' };
  }

  // 5. ADD PAYMENT METHOD SAFETY CHECK
  const selectedPayment = document.querySelector('input[name="payment_method"]:checked') || document.querySelector('input[name="payment"]:checked');
  const finalPaymentMethod = paymentMethod || (selectedPayment ? selectedPayment.value : null);

  if (!finalPaymentMethod) {
    alert("Please select a payment method");
    if (button) button.disabled = false;
    return { error: 'Please select a payment method' };
  }
  
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
      return { product_id: actualProductId, quantity: i.quantity };
  });

  if (cartItems.length === 0) {
    if (button) button.disabled = false;
    return { error: 'Cart is empty' };
  }

  const orderPayload = {
      name:          addressData.name,
      phone:         addressData.phone,
      email:         addressData.email,
      address:       addressData.address,
      landmark:      addressData.landmark,
      city:          addressData.city,
      state:         addressData.state,
      pincode:       addressData.pincode,
      country:       addressData.country,
      payment_method: finalPaymentMethod,
      items:         cartItems
  };

  // 6. ENSURE PAYMENT METHOD IS SENT
  orderPayload.paymentMethod = finalPaymentMethod;

  // 2. PATCH ONLY CHECKOUT API CALL
  const freshToken = await getFreshAuthToken();
  const existingToken = localStorage.getItem("mokshita_token");
  const tokenToUse = freshToken || existingToken;

  // 7. ADD NON-BREAKING DEBUG LOGS
  console.log("Checkout token used:", tokenToUse);
  console.log("Payment method:", finalPaymentMethod);

  // 3. MODIFY FETCH HEADERS (SAFE MERGE)
  const { data, error } = await window.apiService.orders.checkout(orderPayload, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenToUse}`
    }
  });

  if (error) {
    console.error('[Checkout] Error creating order:', error);
    if (button) button.disabled = false;
    return { error: error };
  }

  // Clear cart
  localStorage.removeItem('mokshita_cart');

  console.log('[Checkout] Order created:', data.order.id);
  localStorage.setItem('mokshita_last_order', Date.now().toString());
  await updateCartUI();
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
