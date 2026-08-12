const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authOptional, authRequired } = require('../middleware/auth');

const router = express.Router();

function validateCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Cart is empty' };
  }

  const validated = [];
  let subtotal = 0;

  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(item.product_id);
    if (!product) return { error: `Product not found: ${item.product_id}` };
    if (product.stock < item.quantity) {
      return { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` };
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    validated.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: product.price,
      line_total: lineTotal,
      image_url: product.image_url,
      slug: product.slug,
    });
  }

  return { validated, subtotal };
}

router.post('/validate', (req, res) => {
  const result = validateCartItems(req.body.items);
  if (result.error) return res.status(400).json({ error: result.error });

  const shipping = result.subtotal >= 75 ? 0 : 9.99;
  const tax = Math.round(result.subtotal * 0.08 * 100) / 100;

  res.json({
    items: result.validated,
    subtotal: result.subtotal,
    shipping,
    tax,
    total: Math.round((result.subtotal + shipping + tax) * 100) / 100,
  });
});

router.post('/checkout', authOptional, async (req, res) => {
  const { items, shipping: shippingInfo, guest_email } = req.body;

  const result = validateCartItems(items);
  if (result.error) return res.status(400).json({ error: result.error });

  const email = req.user?.email || guest_email;
  if (!email) return res.status(400).json({ error: 'Email is required for checkout' });

  const shipping = result.subtotal >= 75 ? 0 : 9.99;
  const tax = Math.round(result.subtotal * 0.08 * 100) / 100;
  const total = Math.round((result.subtotal + shipping + tax) * 100) / 100;

  const orderId = uuidv4();
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, user_id, guest_email, status, subtotal, shipping, tax, total,
      shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country)
    VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, line_total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const createOrder = db.transaction(() => {
    insertOrder.run(
      orderId,
      req.user?.id || null,
      req.user ? null : email,
      result.subtotal,
      shipping,
      tax,
      total,
      shippingInfo?.name || '',
      shippingInfo?.address || '',
      shippingInfo?.city || '',
      shippingInfo?.state || '',
      shippingInfo?.zip || '',
      shippingInfo?.country || 'US'
    );

    for (const item of result.validated) {
      insertItem.run(uuidv4(), orderId, item.product_id, item.product_name, item.quantity, item.unit_price, item.line_total);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
    }
  });

  createOrder();

  res.status(201).json({
    order_id: orderId,
    subtotal: result.subtotal,
    shipping,
    tax,
    total,
    items: result.validated,
  });
});

router.get('/my-orders', authRequired, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);

  const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const enriched = orders.map(o => ({ ...o, items: getItems.all(o.id) }));
  res.json(enriched);
});

router.get('/:id', authOptional, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.user_id && (!req.user || req.user.id !== order.user_id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, items });
});

module.exports = router;
