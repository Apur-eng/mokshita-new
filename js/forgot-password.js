/* forgot-password.js */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const formForgot = document.getElementById('form-forgot-password');
  const btnReset = document.getElementById('btn-reset-password');
  const msgEl = document.getElementById('forgot-message');

  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim();
    if (!email) {
      if (window.App && window.App.UI) window.App.UI.showError('Please enter your email.');
      return;
    }

    const originalText = btnReset.innerText;
    btnReset.innerText = 'Sending...';
    btnReset.disabled = true;

    try {
      if (!window.supabase) {
        throw new Error('Supabase client is not initialized.');
      }

      const { error } = await window.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://mokshitahandicrafts.com/reset-password.html'
      });

      if (error) {
        if (window.App && window.App.UI) window.App.UI.showError(error.message || error);
        msgEl.textContent = error.message || 'Error sending link.';
        msgEl.className = 'auth-message error';
      } else {
        if (window.App && window.App.UI) window.App.UI.showSuccess('Check your email for reset instructions.');
        msgEl.textContent = 'Check your email for reset instructions.';
        msgEl.className = 'auth-message success';
      }
    } catch (err) {
      console.error(err);
      if (window.App && window.App.UI) window.App.UI.showError(err.message || 'An unexpected error occurred.');
      msgEl.textContent = err.message || 'An unexpected error occurred.';
      msgEl.className = 'auth-message error';
    } finally {
      btnReset.innerText = originalText;
      btnReset.disabled = false;
    }
  });
});
