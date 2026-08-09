/* forgot-password.js */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const formForgot = document.getElementById('form-forgot-password');
  const btnReset   = document.getElementById('btn-reset-password');

  // Null guard — exit cleanly if page elements are missing
  if (!formForgot || !btnReset) {
    console.warn('[ForgotPassword] Required form elements not found on this page.');
    return;
  }

  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim();

    // Client-side validation
    if (!email) {
      if (window.App && window.App.UI) window.App.UI.showError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (window.App && window.App.UI) window.App.UI.showError('Please enter a valid email address.');
      return;
    }

    const originalText = btnReset.innerText;
    btnReset.innerText = 'Sending...';
    btnReset.disabled = true;

    try {
      const { error } = await window.apiService.auth.forgotPassword(email);

      if (error) {
        // Show backend error if present
        if (window.App && window.App.UI) window.App.UI.showError(error);
      } else {
        // Backend always returns 200 to prevent email enumeration
        // Don't promise the email was sent — just tell them to check
        if (window.App && window.App.UI)
          window.App.UI.showSuccess(
            'If that email is registered, a reset link will be sent. Check your inbox (and spam folder).'
          );
      }
    } catch (err) {
      console.error('[ForgotPassword]', err);
      if (window.App && window.App.UI)
        window.App.UI.showError('Unable to connect to server. Please try again in a moment.');
    } finally {
      btnReset.innerText = originalText;
      btnReset.disabled = false;
    }
  });
});

