/**
 * Mokshita — Runtime Backend Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded BEFORE api.js in every HTML page.
 * To switch environments, swap the active BACKEND_URL line below.
 */

// ─── PRODUCTION ───────────────────────────────────────────────────────────────
// Backend  → Render:   https://mokshita-final-release.onrender.com
// Frontend → Vercel:   https://mokshita.vercel.app
window.BACKEND_URL = 'https://mokshita-final-release.onrender.com';

// ─── LOCAL DEVELOPMENT (comment the line above and uncomment below) ───────────
// window.BACKEND_URL = 'http://localhost:5000';
