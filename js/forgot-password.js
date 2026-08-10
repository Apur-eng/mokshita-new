/* forgot-password.js */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const formForgot = document.getElementById('form-forgot-password');
  const btnReset   = document.getElementById('btn-reset-password');
  const msgEl      = document.getElementById('forgot-message');

  // Safety check — confirm Supabase client is available
  console.log('[ForgotPassword] Supabase client:', window.supabaseClient);

  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim();
    if (!email) {
      if (window.App && window.App.UI) window.App.UI.showError('Please enter your email.');
      msgEl.textContent = 'Please enter your email.';
      msgEl.className = 'auth-message error';
      return;
    }

    // Guard: Supabase must be initialized before proceeding
    if (!window.supabaseClient) {
      console.error('[ForgotPassword] Supabase not initialized. Cannot send reset email.');
      msgEl.textContent = 'Service temporarily unavailable. Please refresh and try again.';
      msgEl.className = 'auth-message error';
      return;
    }

    const originalText = btnReset.innerText;
    btnReset.innerText = 'Sending...';
    btnReset.disabled  = true;

    try {
      const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.mokshitahandicrafts.com/reset-password.html'
      });

      if (error) {
        if (window.App && window.App.UI) window.App.UI.showError(error.message || error);
        msgEl.textContent = error.message || 'Error sending reset link.';
        msgEl.className   = 'auth-message error';
      } else {
        if (window.App && window.App.UI) window.App.UI.showSuccess('Check your email for reset instructions.');
        msgEl.textContent = 'Check your email for reset instructions.';
        msgEl.className   = 'auth-message success';
      }
    } catch (err) {
      console.error('[ForgotPassword] Unexpected error:', err);
      if (window.App && window.App.UI) window.App.UI.showError(err.message || 'An unexpected error occurred.');
      msgEl.textContent = err.message || 'An unexpected error occurred.';
      msgEl.className   = 'auth-message error';
    } finally {
      btnReset.innerText = originalText;
      btnReset.disabled  = false;
    }
  });
});
