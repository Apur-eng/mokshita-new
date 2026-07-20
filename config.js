/**
 * Mokshita — Runtime Backend Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded BEFORE api.js in every HTML page.
 * Update BACKEND_URL below after deploying the backend to Railway/Render.
 *
 * Steps:
 *  1. Deploy the backend to Railway → copy the generated URL
 *     (e.g. https://mokshita-backend-production.up.railway.app)
 *  2. Replace the value below with that URL
 *  3. Commit & push → Vercel auto-redeploys the frontend
 */

// ─── Replace this URL after your first Railway/Render deployment ──────────────
window.BACKEND_URL = 'https://YOUR_RAILWAY_URL.up.railway.app';

// ─── Local development override ───────────────────────────────────────────────
// If running locally, uncomment the line below (and comment out the line above):
// window.BACKEND_URL = 'http://localhost:3000';
