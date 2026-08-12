# AutoParts Pro — Car Parts Ecommerce

A full-stack car parts ecommerce store with **Express backend**, **SQLite database**, **Stripe payment integration**, and a modern **HTML/CSS/JS frontend**.

## Features

- Product catalog with 6 categories (Brakes, Engine, Suspension, Electrical, Exhaust, Filters & Fluids)
- 14 seeded car parts with images, pricing, SKU, and vehicle fitment
- Shopping cart (localStorage) with server-side validation
- Guest & registered checkout
- Stripe Checkout payment (with demo mode when keys aren't configured)
- User authentication (register/login/JWT)
- Order history for logged-in users
- Free shipping on orders over $75

## Project Structure

```
car-parts-store/
├── backend/
│   ├── server.js           # Express API + static frontend
│   ├── db/
│   │   ├── schema.sql      # SQLite database schema
│   │   ├── database.js     # DB connection
│   │   └── seed.js         # Sample car parts data
│   ├── routes/
│   │   ├── auth.js         # Register / login
│   │   ├── products.js     # Product catalog API
│   │   ├── categories.js   # Category API
│   │   ├── orders.js       # Cart validation & checkout
│   │   └── payments.js     # Stripe integration
│   └── .env.example
└── frontend/
    ├── index.html          # Homepage
    ├── shop.html           # Product listing
    ├── product.html        # Product detail
    ├── cart.html           # Shopping cart
    ├── checkout.html       # Checkout form
    ├── order-success.html  # Order confirmation
    ├── login.html / register.html / account.html
    ├── css/styles.css
    └── js/app.js
```

## Quick Start

### 1. Install backend dependencies

```bash
cd car-parts-store/backend
npm install
```

### 2. Configure environment (optional)

```bash
cp .env.example .env
```

Edit `.env` and add your Stripe keys for live payments. Without Stripe keys, the app runs in **demo mode** and marks orders as paid automatically.

### 3. Start the server

```bash
npm start
```

Open **http://localhost:4000** — the backend serves both the API and frontend.

### Demo Account

- Email: `demo@autoparts.com`
- Password: `demo1234`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/products` | List products (filter: category, search, featured) |
| GET | `/api/products/slug/:slug` | Product detail |
| GET | `/api/categories` | List categories |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/orders/validate` | Validate cart & calculate totals |
| POST | `/api/orders/checkout` | Create order |
| POST | `/api/payments/create-checkout-session` | Start Stripe payment |
| GET | `/api/payments/verify/:orderId` | Verify payment status |

## Stripe Setup

1. Create a [Stripe account](https://stripe.com) and get test API keys
2. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=http://localhost:4000
   ```
3. For webhooks locally, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:4000/api/payments/webhook
   ```

## Database

SQLite database is auto-created at `backend/db/autoparts.db` on first run. Schema includes:

- `users` — customer accounts
- `categories` — product categories
- `products` — car parts inventory
- `orders` — order records
- `order_items` — line items per order

Re-seed manually: `npm run seed`

## Tech Stack

- **Backend:** Node.js, Express, better-sqlite3, bcryptjs, JWT, Stripe
- **Frontend:** Vanilla HTML/CSS/JS
- **Database:** SQLite (easily portable to PostgreSQL)
- **Payments:** Stripe Checkout
