/**
 * Mokshita — Runtime Backend Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded BEFORE api.js in every HTML page.
 * BACKEND_URL must point to the live Render deployment.
 * After any re-deploy on Render the URL stays the same — no changes needed.
 */

// ─── Production Render backend ────────────────────────────────────────────────
// window.BACKEND_URL = 'https://mokshita-final-release.onrender.com';

// ─── Cross-Laptop / Local development backend ─────────────────────────────────
// Set Laptop B's IP address below (e.g., 'http://192.168.1.50:5000') when running across laptops:
window.BACKEND_URL = window.BACKEND_URL || 'http://localhost:5000';

// ─── Supabase Configuration ───────────────────────────────────────────────────
window.SUPABASE_URL = 'https://syycggibqwvqravtdhhx.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWNnZ2licXd2cXJhdnRkaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjA4NDIsImV4cCI6MjEwMDA5Njg0Mn0.1A50etqd78iHVgQC7uVUM2fRovssgn3M9yfdXVkQHTM';

