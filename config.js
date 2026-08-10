/**
 * Mokshita — Runtime Backend Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded BEFORE api.js in every HTML page.
 * BACKEND_URL must point to the live Render deployment.
 * After any re-deploy on Render the URL stays the same — no changes needed.
 */

// ─── Production Render backend (always) ──────────────────────────────────────
window.BACKEND_URL = 'https://mokshita-final-release.onrender.com';

// ─── Supabase Configuration ───────────────────────────────────────────────────
window.SUPABASE_URL = 'https://syycggibqwvqravtdhhx.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWNnZ2licXd2cXJhdnRkaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjA4NDIsImV4cCI6MjEwMDA5Njg0Mn0.1A50etqd78iHVgQC7uVUM2fRovssgn3M9yfdXVkQHTM';

