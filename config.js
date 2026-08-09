/**
 * Mokshita — Runtime Backend Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded BEFORE api.js in every HTML page.
 * BACKEND_URL must point to the live Render deployment.
 * After any re-deploy on Render the URL stays the same — no changes needed.
 */

// ─── Production Render backend ────────────────────────────────────────────────
window.BACKEND_URL = 'https://mokshita-final-release.onrender.com';

// ─── Local development override ───────────────────────────────────────────────
// Uncomment the line below when developing locally:
// window.BACKEND_URL = 'http://localhost:3000';

