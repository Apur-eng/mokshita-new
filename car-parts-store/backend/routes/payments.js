const express = require('express');
const Stripe = require('stripe');
const db = require('../db/database');
const { authOptional } = require('../middleware/auth');

const router = express.Router();
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

router.post('/create-checkout-session', authOptional, async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'order_id is required' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status === 'paid') return res.status(400).json({ error: 'Order already paid' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order_id);

  if (!stripe) {
    db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(order_id);
    return res.json({
      demo_mode: true,
      message: 'Stripe not configured — order marked as paid in demo mode',
      redirect_url: `${FRONTEND_URL}/order-success.html?order_id=${order_id}&demo=1`,
    });
  }

  try {
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.product_name },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.quantity,
    }));

    if (order.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(order.shipping * 100),
        },
        quantity: 1,
      });
    }

    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax' },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${FRONTEND_URL}/order-success.html?order_id=${order_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout.html?cancelled=1`,
      customer_email: order.guest_email || undefined,
      metadata: { order_id },
    });

    db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?').run(session.id, order_id);

    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

router.post('/webhook', async (req, res) => {
  if (!stripe) return res.status(200).send('OK');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      db.prepare(`
        UPDATE orders SET status = 'paid', stripe_payment_intent = ? WHERE id = ?
      `).run(session.payment_intent || session.id, orderId);
    }
  }

  res.json({ received: true });
});

router.get('/verify/:orderId', async (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { session_id } = req.query;
  if (session_id && stripe && order.stripe_session_id === session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === 'paid' && order.status !== 'paid') {
        db.prepare(`
          UPDATE orders SET status = 'paid', stripe_payment_intent = ? WHERE id = ?
        `).run(session.payment_intent || session.id, order.id);
        order.status = 'paid';
      }
    } catch (err) {
      console.error('Session verify error:', err.message);
    }
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, items });
});

module.exports = router;
