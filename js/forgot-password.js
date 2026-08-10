/* forgot-password.js — self-contained Supabase initialization */

'use strict';

// ── Helper: dynamically load a script and resolve when done ─────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload  = resolve;
    s.onerror = () => reject(new Error('Failed to load: ' + src));
    document.head.appendChild(s);
  });
}

// ── Ensure window.supabaseClient is ready ────────────────────────────────────
async function ensureSupabase() {
  // Already initialized — nothing to do
  if (window.supabaseClient) return window.supabaseClient;

  // Try UMD global set by supabase-client.js or another script
  const url  = window.SUPABASE_URL     || 'https://syycggibqwvqravtdhhx.supabase.co';
  const key  = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWNnZ2licXd2cXJhdnRkaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjA4NDIsImV4cCI6MjEwMDA5Njg0Mn0.1A50etqd78iHVgQC7uVUM2fRovssgn3M9yfdXVkQHTM';

  // If window.supabase UMD global is already present, just create the client
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(url, key);
    console.log('[ForgotPassword] Supabase client created from UMD global:', window.supabaseClient);
    return window.supabaseClient;
  }

  // UMD global not present — load the CDN script dynamically then create client
  console.warn('[ForgotPassword] Supabase UMD global not found — loading CDN script dynamically...');
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js');
  } catch (_) {
    // Primary CDN failed, try fallback
    console.warn('[ForgotPassword] Primary CDN failed, trying fallback...');
    await loadScript('https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js');
  }

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('Supabase library could not be loaded from any CDN.');
  }

  window.supabaseClient = window.supabase.createClient(url, key);
  console.log('[ForgotPassword] Supabase client created (dynamic load):', window.supabaseClient);
  return window.supabaseClient;
}

// ── Main ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const formForgot = document.getElementById('form-forgot-password');
  const btnReset   = document.getElementById('btn-reset-password');
  const msgEl      = document.getElementById('forgot-message');

  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim();
    if (!email) {
      msgEl.textContent = 'Please enter your email.';
      msgEl.className   = 'auth-message error';
      return;
    }

    const originalText = btnReset.innerText;
    btnReset.innerText = 'Sending...';
    btnReset.disabled  = true;

    try {
      // Guaranteed to return a valid client or throw
      const client = await ensureSupabase();

      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://mokshitahandicrafts.com/reset-password.html'
      });

      if (error) {
        msgEl.textContent = error.message || 'Error sending reset link.';
        msgEl.className   = 'auth-message error';
      } else {
        msgEl.textContent = 'Check your email for reset instructions.';
        msgEl.className   = 'auth-message success';
      }
    } catch (err) {
      console.error('[ForgotPassword] Error:', err);
      msgEl.textContent = err.message || 'An unexpected error occurred.';
      msgEl.className   = 'auth-message error';
    } finally {
      btnReset.innerText = originalText;
      btnReset.disabled  = false;
    }
  });
});
