require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');

async function start() {
  await db.init();
  const { seed } = require('./db/seed');
  seed();

  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const categoryRoutes = require('./routes/categories');
  const orderRoutes = require('./routes/orders');
  const paymentRoutes = require('./routes/payments');

  const app = express();
  const PORT = process.env.PORT || 4000;

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:4000',
    'null',
  ].filter(Boolean);

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, true);
    },
    credentials: true,
  }));

  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'AutoParts Pro API', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);

  const frontendPath = path.join(__dirname, '../frontend');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`AutoParts Pro running at http://localhost:${PORT}`);
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe not configured — payments run in DEMO mode');
    }
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
